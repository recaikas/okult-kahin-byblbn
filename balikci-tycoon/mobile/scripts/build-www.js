/* Oyun dosyalarını (bir üst klasör) Capacitor'ın www/ klasörüne kopyalar. Testler, belgeler ve web'e özel dosyalar gitmez.
   Varsayılan: .js ve .html küçültülüp karartılır (balikci-tycoon/build-site.js ile aynı ayarlar).
   Önce bir kez:  cd balikci-tycoon && npm ci
   Karartmasız (hata ayıklama):  node scripts/build-www.js --no-karart   ya da   HK_KARART=0 npm run build */
const fs = require('fs'), path = require('path');
const SRC = path.resolve(__dirname, '..', '..'), OUT = path.resolve(__dirname, '..', 'www');
const FILES = ['index.html', 'native.js', 'config.js', 'specials.js', 'story.js', 'game.js', 'privacy.html', 'about.html', 'terms.html', 'support.html', 'icon.png'];
const obfuscate = !process.argv.includes('--no-karart') && process.env.HK_KARART !== '0';
const { build, printReport } = require(path.join(SRC, 'build-site.js'));
build({ src: SRC, out: OUT, files: FILES, dirs: ['fonts', 'art' /* v2.13: ince piksel çizimleri */], obfuscate, optional: true }).then(r => {
  const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  if (/fonts\.googleapis|fonts\.gstatic/.test(html)) throw new Error('index.html hâlâ Google Fonts\'a bağlı — uygulama internetsiz açılmaz');
  if (obfuscate) printReport(r);
  console.log('www hazır' + (obfuscate ? ' (karartılmış)' : ' (karartmasız)') + ':', fs.readdirSync(OUT).join(', '));
}).catch(e => { console.error(e && e.message || e); process.exit(1); });
