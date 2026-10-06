/* Tanıtım videosu kareleri: oyunun saati sanal (rAF, performance.now, setTimeout sanal adımlanır), her kare tek tek
   çekilir → 30 fps akıcı. 443×960 @2x = 886×1920 (App Store önizleme boyutu). Çıktı: store/video/frames-<dil>/NNNNN.jpg
   Kullanım: node store/tools/capture-video.js tr|en   (oyun klasörü 8099'da sunulmalı) */
const { chromium, openGame, richCove, sleep } = require('./scene');
const fs = require('fs'), path = require('path');
const lang = process.argv[2] || 'tr', FPS = 30;
const OUT = path.resolve(__dirname, '..', 'video', 'frames-' + lang);
const VCLOCK = () => {
  let t = 0, q = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => t;
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  window.setTimeout = (fn, ms) => { if (typeof fn !== 'function') return rST(fn, ms); const id = tid++; timers.push({ id, at: t + (ms || 0), fn }); return id; };
  window.clearTimeout = id => { timers = timers.filter(x => x.id !== id); rCT(id); };
  window.__step = ms => {
    t += ms;
    const due = timers.filter(x => x.at <= t); timers = timers.filter(x => x.at > t); due.forEach(x => { try { x.fn(); } catch (e) { console.error(e); } });
    const cbs = q; q = []; cbs.forEach(cb => { try { cb(t); } catch (e) { console.error(e); } });
  };
  window.__pumpOn = () => { window.__pump = setInterval(() => window.__step(1000 / 30), 33); };
  window.__pumpOff = () => clearInterval(window.__pump);
  window.__pumpOn();
};
const T = {
  tr: { open: 'Piksel bir balıkçı tycoon oyunu', tag: 'Küçük iskeleden büyük limana', c1: 'Balığı tut, kes, sat', c2: '69 tuhaf müşteri', c3: '4 bölge · 6 balık · 1 güveç', c4: 'Dipteki Söz: 12 günlük efsane', c5: 'Her kuruşu takip et', end: 'Koyunu kur, efsaneyi dinle.' },
  en: { open: 'A pixel-art fishing tycoon', tag: 'From a tiny pier to a grand harbor', c1: 'Catch, fillet, sell', c2: '69 quirky customers', c3: '4 zones · 6 fish · 1 stew', c4: 'The Promise Below: a 12-day legend', c5: 'Track every coin', end: 'Build your cove. Hear the legend.' }
}[lang];
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const { p } = await openGame(b, lang, { width: 443, height: 960 }, 2, VCLOCK);
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.evaluate(() => { const z = document.querySelector('#zoomSeg button[data-z="3"]'); if (z) z.click(); document.getElementById('settingsScreen').classList.add('hidden'); });
  await richCove(p, 28);
  /* altyazı bandı ve açılış/kapanış kartı */
  await p.evaluate(([t, lang]) => {
    const st = document.createElement('style');
    st.textContent = '#pc{position:fixed;left:50%;top:15%;transform:translateX(-50%);z-index:90;padding:10px 18px;background:rgba(10,26,39,.88);border:3px solid #d9a441;color:#fff1c9;font:700 25px "Pixelify Sans";white-space:nowrap;text-shadow:2px 2px 0 #3d2413;opacity:0}' +
      '#pcard{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:linear-gradient(180deg,#0f2f45,#1d6c8f);opacity:0}' +
      '#pcard img{width:88%;image-rendering:pixelated}#pcard b{font:700 24px "Pixelify Sans";color:#bfe9ff;text-align:center;padding:0 20px}' +
      '#pcard i{position:absolute;top:0;left:0;right:0;height:10px;background:repeating-linear-gradient(90deg,#a83d2b 0 10px,#d9a441 10px 20px,#2a4c7d 20px 30px,#d9a441 30px 40px)}';
    document.head.appendChild(st);
    const c = document.createElement('div'); c.id = 'pc'; document.body.appendChild(c);
    const k = document.createElement('div'); k.id = 'pcard'; k.innerHTML = '<i></i><img src="store/logo/logo-stacked-' + lang + '.png"><b></b>'; document.body.appendChild(k);
    window.__cap = (txt, a) => { c.textContent = txt; c.style.opacity = a; };
    window.__card = (txt, a) => { k.querySelector('b').textContent = txt; k.style.opacity = a; k.style.display = a > 0 ? 'flex' : 'none'; };
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  }, [T, lang]);
  await sleep(600);
  await p.evaluate(() => window.__pumpOff());
  /* sahne akışı (saniye) */
  const SEG = [
    { at: 0, len: 3, card: T.open },
    { at: 3, len: 5, cap: T.c1, from: [6.0, 3.2], to: [6.8, 7.8] },
    { at: 8, len: 5, cap: T.c2, special: true, from: [8.9, 3.2], to: [8.9, 3.2] },
    { at: 13, len: 4, cap: T.c3, from: [6.4, 14.5], to: [6.4, 20.4] },
    { at: 17, len: 6, cap: T.c4, story: true },
    { at: 23, len: 3, cap: T.c5, stalls: true },
    { at: 26, len: 3, card: T.end }
  ];
  const N = 29 * FPS; let cur = -1;
  for (let f = 0; f < N; f++) {
    const s = f / FPS, si = SEG.findIndex(g => s >= g.at && s < g.at + g.len), g = SEG[si], u = (s - g.at) / g.len;
    if (si !== cur) {
      const prev = SEG[cur]; cur = si;
      await p.evaluate(([g, prev, lang]) => {
        if (prev && prev.story) HK_STORY.close();
        if (prev && prev.stalls) document.getElementById('stallGo').click();
        if (g.special) {
          BT.S.names = BT.S.names.filter(id => id !== 'temel'); BT.S.jobs = (BT.S.jobs || []).filter(id => id !== 'temel');
          const c = BT.counters[0]; c.slots.fill(null); BT.customers.forEach(q => { if (q.c === c) q.state = 'leave'; });
          BT.day.spec = ['temel', 'caner']; BT.spawnSpecial(0);
          const cu = BT.customers.find(q => q.spec === 'temel'); cu.x = 11.2; cu.y = c.y + 0.9;
        }
        if (g.story) HK_STORY.open(8, { lang, ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] });
        if (g.stalls) { document.getElementById('stallBtn').click(); setTimeout(() => { const r = document.querySelectorAll('#stallRows .srow'); if (r[1]) r[1].click(); }, 300); }
        if (g.from) { BT.player.x = g.from[0]; BT.player.y = g.from[1]; }
      }, [g, prev || null, lang]);
    }
    await p.evaluate(([g, u, s]) => {
      const fade = Math.min(1, u * g.len / 0.35, (1 - u) * g.len / 0.35);
      if (g.card) { window.__card(g.card, Math.max(0, fade)); window.__cap('', 0); }
      else { window.__card('', 0); window.__cap(g.cap, Math.max(0, fade)); }
      if (g.from) { BT.player.x = g.from[0] + (g.to[0] - g.from[0]) * u; BT.player.y = g.from[1] + (g.to[1] - g.from[1]) * u; }
      if (g.story && HK_STORY._mode() === 'dlg' && (Math.round(s * 30) % 38) === 37) HK_STORY._tap();
      window.__step(1000 / 30);
    }, [g, u, s]);
    await p.screenshot({ path: path.join(OUT, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 90 === 0) console.log(lang, 'kare', f, '/', N);
  }
  await b.close();
})();
