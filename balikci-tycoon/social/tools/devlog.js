/* Geliştirme günlüğü (Reels / Shorts) üretici — her gün bir video.
   Oyun gerçekten oynanır: sanal saatle (rAF, performance.now, setTimeout) her kare tek tek adımlanır ve çekilir → 30 fps akıcı.
   Karakteri bir "bot" klavye tuşlarıyla yürütür; gösterilmeyen aralar (ör. filetoların kesilmesini beklemek) kaydedilmeden ileri sarılır.
   Altyazı, seri başlığı ve recaikas logosu sayfanın üstüne HTML olarak çizilir; montaj (müzik + MP4) make.py'de.
   Kullanım (oyun klasörü 8099'da sunulmalı):  node social/tools/devlog.js social/days/gun-01.js */
const path = require('path'), fs = require('fs');
const { chromium } = require('../../test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const FPS = 30;
const PREVIEW = +process.env.PREVIEW || 1;   /* deneme: PREVIEW=15 → her 15 karede bir çek (hızlı önizleme) */
const day = require(path.resolve(process.argv[2]));
const OUT = path.resolve(__dirname, '..', 'out', day.id);
const FR = path.join(OUT, 'frames');

/* sayfada: sanal saat + bot + kaplama */
const PAGE_INIT = () => {
  let t = 0, q = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => t;
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  window.setTimeout = (fn, ms) => { if (typeof fn !== 'function') return rST(fn, ms); const id = tid++; timers.push({ id, at: t + (ms || 0), fn }); return id; };
  window.clearTimeout = id => { timers = timers.filter(x => x.id !== id); rCT(id); };
  /* bot: hedef noktalara klavyeyle yürür, koşul gelene kadar bekler */
  const held = {};
  const key = (k, on) => { if (!!held[k] === on) return; held[k] = on; window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { key: k })); };
  window.__plan = [];
  const bot = () => {
    const s = window.__plan[0]; let want = [];
    if (s && s.to) {
      const dx = s.to[0] - BT.player.x, dy = s.to[1] - BT.player.y;
      if (Math.hypot(dx, dy) < (s.tol || 0.45) || (s.max && (s.el = (s.el || 0) + 1 / 30) > s.max)) window.__plan.shift();
      else {
        const u = dx + dy, v = dx - dy;
        if (Math.abs(u) > 0.25) want.push(u > 0 ? 's' : 'w');
        if (Math.abs(v) > 0.25) want.push(v > 0 ? 'd' : 'a');
      }
    } else if (s && s.until) {
      s.el = (s.el || 0) + 1 / 30;
      if (s.el > (s.max || 99) || (s.until !== true && new Function('return ' + s.until)())) window.__plan.shift();
    }
    ['w', 'a', 's', 'd'].forEach(k => key(k, want.indexOf(k) >= 0));
  };
  window.__step = ms => {
    t += ms;
    if (window.BT && BT.player) bot();
    const due = timers.filter(x => x.at <= t); timers = timers.filter(x => x.at > t); due.forEach(x => { try { x.fn(); } catch (e) { console.error(e); } });
    const cbs = q; q = []; cbs.forEach(cb => { try { cb(t); } catch (e) { console.error(e); } });
  };
  /* kaydedilmeden ileri sar: n saniye ya da koşul */
  window.__ff = (secs, until) => { for (let i = 0; i < secs * 30; i++) { window.__step(1000 / 30); if (until && new Function('return ' + until)()) return i / 30; } return secs; };
  window.__pumpOn = () => { window.__pump = setInterval(() => window.__step(1000 / 30), 33); };
  window.__pumpOff = () => clearInterval(window.__pump);
  window.__pumpOn();
};

const OVERLAY_CSS = `
  #dlTop{position:fixed;left:0;right:0;top:118px;z-index:96;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
  #dlLogo{display:flex;align-items:center;gap:7px;padding:4px 10px 4px 6px;background:rgba(10,26,39,.78);border:2px solid #d9a441;font:700 15px "Pixelify Sans";color:#fff1c9;letter-spacing:1px}
  #dlLogo img{width:22px;height:22px;image-rendering:pixelated}
  #dlSer{padding:3px 10px;background:#d9a441;color:#2a1a0c;font:700 13px "Pixelify Sans";letter-spacing:1.5px}
  #dlCap{position:fixed;left:50%;top:60%;transform:translate(-50%,-50%);z-index:96;width:86%;text-align:center;font:700 27px/1.25 "Pixelify Sans";color:#fff;
    text-shadow:-2px 0 #12202b,2px 0 #12202b,0 -2px #12202b,0 2px #12202b,2px 2px #12202b,-2px 2px #12202b,2px -2px #12202b,-2px -2px #12202b,3px 4px 0 rgba(0,0,0,.55);opacity:0;pointer-events:none}
  #dlCap em{font-style:normal;color:#ffd166}
  #dlTag{position:fixed;left:50%;top:calc(60% + 62px);transform:translateX(-50%);z-index:96;padding:3px 9px;background:rgba(10,26,39,.85);border:2px solid #6fb3d9;color:#bfe9ff;font:700 13px "Pixelify Sans";white-space:nowrap;opacity:0;pointer-events:none}
  #dlEnd{position:fixed;inset:0;z-index:97;display:none;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(8,20,30,.72);padding:0 26px;text-align:center}
  #dlEnd .sign{margin:0;min-width:300px;font-size:26px}
  #dlEnd b{font:700 30px/1.25 "Pixelify Sans";color:#fff;text-shadow:3px 3px 0 #12202b}
  #dlEnd small{font:700 16px "Pixelify Sans";color:#ffd166;letter-spacing:1px}
  #coach,.coach{display:none!important}
  #achPop,#pauseBadge{display:none!important}`;

(async () => {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(PAGE_INIT);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(URL); await sleep(900);
  await p.evaluate(l => { if (BT.setLang) BT.setLang(l); }, day.lang || 'tr');
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  if (day.hero) await p.fill('#heroName', day.hero).catch(() => {});
  await p.click('#heroGo');
  await p.fill('#nameIn', day.company || 'Recai Balıkçılık'); await p.click('#nameGo');
  await p.click('#autoOpts button[data-m="10"]'); await sleep(400);
  await p.evaluate(([css, d]) => {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const top = document.createElement('div'); top.id = 'dlTop';
    top.innerHTML = '<div id="dlLogo"><img src="icon.png" alt="">recaikas</div><div id="dlSer"></div>';
    document.body.appendChild(top); document.getElementById('dlSer').textContent = d.series;
    ['dlCap', 'dlTag'].forEach(id => { const e = document.createElement('div'); e.id = id; document.body.appendChild(e); });
    const end = document.createElement('div'); end.id = 'dlEnd'; end.innerHTML = '<div class="sign" id="dlSign"></div><b id="dlQ"></b><small id="dlSm"></small>';
    document.body.appendChild(end);
    window.__cap = (html, a) => { const c = document.getElementById('dlCap'); if (c.__h !== html) { c.innerHTML = html; c.__h = html; } c.style.opacity = a; };
    window.__tag = (txt, a) => { const c = document.getElementById('dlTag'); c.textContent = txt; c.style.opacity = a; };
    window.__zoom = z => { const btn = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (btn) btn.click(); document.getElementById('settingsScreen').classList.add('hidden'); };
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  }, [OVERLAY_CSS, { series: day.series }]);
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.evaluate(() => window.__pumpOff());

  const segs = day.segs; let t0 = 0; const subs = [];
  segs.forEach(s => { s.at = t0; t0 += s.len; (s.caps || []).forEach(c => subs.push({ a: s.at + c[0], b: s.at + c[1], t: c[2] })); });
  const N = Math.round(t0 * FPS);
  let cur = -1;
  for (let f = 0; f < N; f++) {
    const sec = f / FPS, si = segs.findIndex(g => sec >= g.at && sec < g.at + g.len), g = segs[si];
    if (si !== cur) {
      cur = si;
      if (g.prep) await p.evaluate(g.prep);
      if (g.plan) await p.evaluate(pl => { window.__plan = JSON.parse(JSON.stringify(pl)); }, g.plan);
      console.log(day.id, 'sahne', si + 1, '/', segs.length, '@', sec.toFixed(1) + 's');
    }
    const ls = sec - g.at;
    const cap = (g.caps || []).find(c => !c[3] && ls >= c[0] && ls < c[1]);   /* 4. öğe true: yalnız SRT'ye (ekranda bitiş kartı gösteriyor) */
    const capA = cap ? Math.max(0, Math.min(1, (ls - cap[0]) / 0.18, (cap[1] - ls) / 0.18)) : 0;
    const tagA = g.tag ? Math.max(0, Math.min(1, ls / 0.25, (g.len - ls) / 0.25)) : 0;
    await p.evaluate(([cap, capA, tag, tagA, frame, u]) => {
      window.__cap(cap || '', capA); window.__tag(tag || '', tagA);
      if (frame) new Function('u', frame)(u);
      window.__step(1000 / 30);
    }, [cap ? cap[2] : '', capA, g.tag || '', tagA, g.frame || '', ls / g.len]);
    if (f % PREVIEW === 0) await p.screenshot({ path: path.join(FR, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log(day.id, 'kare', f, '/', N);
  }
  /* kapak: ayrı kare */
  if (day.cover) {
    await p.evaluate(day.cover);
    await p.screenshot({ path: path.join(OUT, 'kapak.png') });
  }
  await b.close();
  /* altyazı (SRT) + zaman çizelgesi */
  const tc = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return [h, m, x].map(v => String(v).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0'); };
  const plain = h => h.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
  fs.writeFileSync(path.join(OUT, day.id + '.srt'), subs.map((s, i) => (i + 1) + '\n' + tc(s.a) + ' --> ' + tc(s.b) + '\n' + plain(s.t) + '\n').join('\n'));
  fs.writeFileSync(path.join(OUT, 'sure.json'), JSON.stringify({ secs: t0, frames: N, fps: FPS }));
  console.log('bitti', N, 'kare', t0 + 's');
})();
