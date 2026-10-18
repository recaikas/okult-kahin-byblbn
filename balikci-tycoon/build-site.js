/* Hamsi Koyu — yayın derlemesi: oyun dosyalarını bir klasöre kopyalar, .js dosyalarını küçültüp hafifçe karartır,
   HTML'deki yorumları siler ve satır içi scriptleri de aynı yoldan geçirir. Kaynak dosyalara dokunmaz.
   Kullanım:  node build-site.js <çıkış klasörü> [--no-karart]        (vars. _site)
   Mobil:     mobile/scripts/build-www.js bu modülü kullanır (build({...})).

   NEDEN İSİM DEĞİŞTİRME YOK: game.js'in sonundaki HKG.v(ad) iç değişkenleri ADIYLA eval eder; art/*.js ve testler
   onlarca iç ismi böyle okur, hook('drawX', drawX) ve window.HKA adları da isme bağlıdır. Bu yüzden terser mangle
   kapalı; javascript-obfuscator'da kaynakta geçen HER isim tam adıyla ayrılır (reservedNames, acorn ile toplanır).
   Not: reservedNames: ['^.*$'] bu sürümde kullanılamaz — obfuscator'ın kendi ürettiği yardımcı adları da reddeder
   ve sonsuz özyinelemeye girer. Tam ad listesi kaynak isimlerini korur, yeni yardımcılar (önekli) yine üretilir.
   NEDEN AĞIR KARARTMA YOK: controlFlowFlattening / deadCodeInjection / selfDefending / debugProtection telefonda
   kare hızını düşürür ya da bozar. Yalnız: yorum/boşluk silme + terser sıkıştırma + string dizisi (base64).
   Kaynak haritası üretilmez. */
'use strict';
const fs = require('fs'), path = require('path');

const SRC = __dirname;
/* GitHub Pages'e giden dosyalar (iş akışındaki eski cp listesiyle aynı) */
const SITE_FILES = ['index.html', 'native.js', 'game.js', 'config.js', 'specials.js', 'story.js', 'story.html', 'privacy.html',
  'about.html', 'panel.html', 'terms.html', 'support.html', 'icon.png'];
const SITE_DIRS = ['fonts', 'art'];

function deps() {
  try { return { terser: require('terser'), JO: require('javascript-obfuscator'), acorn: require('acorn') }; }
  catch (e) { throw new Error('Karartma araçları kurulu değil. balikci-tycoon klasöründe "npm ci" çalıştırın (ya da karartmayı kapatın). (' + e.message + ')'); }
}

/* dosya adından sabit tohum + önek: çıktı her derlemede aynı, dosyalar arası global ad çakışması yok */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const TERSER = {
  ecma: 2015,
  compress: { passes: 1, keep_fargs: true, keep_fnames: true, keep_classnames: true, drop_console: false, unsafe: false },
  mangle: false,                       /* isimler aynı kalmalı (HKG.v / hook / HKA) */
  format: { comments: false, ascii_only: false, beautify: false },   /* Türkçe karakter ve emoji olduğu gibi */
  sourceMap: false
};

/* koddaki tüm tanımlayıcılar → tek düzenli ifade (tam eşleşme) */
function reservedFor(code, acorn) {
  const names = new Set();
  for (const t of acorn.tokenizer(code, { ecmaVersion: 'latest' })) if (t.type.label === 'name') names.add(t.value);
  return names.size ? ['^(?:' + [...names].map(n => n.replace(/\$/g, '\\$')).join('|') + ')$'] : [];
}

function obfOptions(name, reserved) {
  const h = hash(name);
  return {
    target: 'browser',
    compact: true,
    simplify: true,
    seed: (h % 2147483646) + 1,
    identifiersPrefix: 'hk' + h.toString(36),
    /* yeniden adlandırma tamamen kapalı */
    renameGlobals: false,
    renameProperties: false,
    reservedNames: reserved,
    transformObjectKeys: false,
    /* hafif string karartma */
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersType: 'variable',
    stringArrayWrappersChainedCalls: false,
    stringArrayCallsTransform: false,
    splitStrings: false,
    unicodeEscapeSequence: false,
    numbersToExpressions: false,
    /* hız / bozulma riski: kapalı */
    controlFlowFlattening: false,
    deadCodeInjection: false,
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    sourceMap: false
  };
}

async function minifyJs(code, name, opt) {
  opt = opt || {};
  const { terser, JO, acorn } = deps();
  const t = await terser.minify(code, TERSER);
  if (!t || typeof t.code !== 'string') throw new Error(name + ': terser çıktı vermedi');
  if (opt.obfuscate === false) return t.code;
  return JO.obfuscate(t.code, obfOptions(name, reservedFor(t.code, acorn))).getObfuscatedCode();
}

/* HTML: yorumları sil, satır başı girintisini at, satır içi <script> ve <style>'ı küçült. <pre>/<textarea> dokunulmaz. */
async function minifyHtml(html, name, opt) {
  const re = /<(script|style|pre|textarea)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
  let last = 0, m, n = 0;
  const out = [];
  while ((m = re.exec(html))) {
    out.push(plain(html.slice(last, m.index)));
    const tag = m[1].toLowerCase(), attrs = m[2], body = m[3];
    const ty = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    const classicJs = !ty || /^(text|application)\/javascript$/i.test(ty);
    if (tag === 'script' && !/\bsrc\s*=/i.test(attrs) && body.trim() && classicJs) {
      out.push('<script' + attrs + '>' + (await minifyJs(body, name + '#script' + (n++), opt)).replace(/<\/script/gi, '<\\/script') + '</script>');
    } else if (tag === 'style') {
      out.push('<style' + attrs + '>' + body.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(s => s.trim()).filter(Boolean).join('\n') + '</style>');
    } else out.push(m[0]);
    last = re.lastIndex;
  }
  out.push(plain(html.slice(last)));
  return out.join('');
}
function plain(s) {
  return s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '').split('\n').map(l => l.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '')).filter(l => l !== '').join('\n');
}

async function processFile(src, dst, opt, report) {
  const ext = path.extname(src).toLowerCase(), rel = path.relative(SRC, src);
  const before = fs.statSync(src).size;
  if (opt.obfuscate !== false && ext === '.js') {
    fs.writeFileSync(dst, await minifyJs(fs.readFileSync(src, 'utf8'), rel, opt));
  } else if (opt.obfuscate !== false && ext === '.html') {
    fs.writeFileSync(dst, await minifyHtml(fs.readFileSync(src, 'utf8'), rel, opt));
  } else fs.copyFileSync(src, dst);
  if (report && (ext === '.js' || ext === '.html')) report.push({ f: rel, before, after: fs.statSync(dst).size });
}

async function copyDir(src, dst, opt, report) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d, opt, report);
    else if (e.isFile()) await processFile(s, d, opt, report);
  }
}

/* build({ out, files, dirs, obfuscate, clean, src }) → boyut raporu dizisi */
async function build(o) {
  const src = o.src || SRC, out = path.resolve(o.out), opt = { obfuscate: o.obfuscate !== false };
  if (opt.obfuscate) deps();
  if (o.clean !== false) fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const report = [];
  for (const f of o.files || SITE_FILES) {
    const p = path.join(src, f);
    if (!fs.existsSync(p)) { if (o.optional) continue; throw new Error('eksik dosya: ' + f); }
    await processFile(p, path.join(out, f), opt, report);
  }
  for (const d of o.dirs || SITE_DIRS) await copyDir(path.join(src, d), path.join(out, d), opt, report);
  return report;
}

function printReport(r) {
  const kb = n => (n / 1024).toFixed(1).padStart(8) + ' KB';
  let b = 0, a = 0;
  for (const x of r) { b += x.before; a += x.after; console.log(x.f.padEnd(18) + kb(x.before) + ' →' + kb(x.after) + '  (' + Math.round(100 * x.after / x.before) + '%)'); }
  console.log('TOPLAM'.padEnd(18) + kb(b) + ' →' + kb(a) + '  (' + Math.round(100 * a / b) + '%)');
}

module.exports = { build, minifyJs, minifyHtml, printReport, SITE_FILES, SITE_DIRS };

if (require.main === module) {
  const args = process.argv.slice(2), out = args.find(a => !a.startsWith('--')) || '_site';
  const obfuscate = !args.includes('--no-karart');
  build({ out: path.resolve(process.cwd(), out), obfuscate }).then(r => {
    printReport(r);
    console.log((obfuscate ? 'karartılmış' : 'düz') + ' site hazır: ' + path.resolve(process.cwd(), out));
  }).catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
