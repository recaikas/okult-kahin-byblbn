/* Temiz oyun içi çekimler (arayüz yok): 1920×808 (2.39:1) kare dizisi.  Kullanım:
     node capture-game.js g1|g2|g3 [preview]     → store/video/trailer2/frames-<klip>/NNNNN.png (preview: her çekimden 2 kare → prev-<klip>/)
   Zamanlama ritme göre: 1 vuruş = 60/152 sn (oyunun "Yayla Horonu" parçası). */
const { chromium, openGame, sleep } = require('../scene');
const fs = require('fs'), path = require('path');
const [CLIP, MODE] = [process.argv[2] || 'g1', process.argv[3] || 'full'];
const FPS = 30, BEAT = 60 / 152, W = 960, H = 404;
const OUT = path.resolve(__dirname, '..', '..', 'video', 'trailer2', (MODE === 'preview' ? 'prev-' : 'frames-') + CLIP);
const VCLOCK = () => {
  let t = 0, q = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; }; window.cancelAnimationFrame = () => {};
  performance.now = () => t;
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  window.setTimeout = (fn, ms) => { if (typeof fn !== 'function') return rST(fn, ms); const id = tid++; timers.push({ id, at: t + (ms || 0), fn }); return id; };
  window.clearTimeout = id => { timers = timers.filter(x => x.id !== id); rCT(id); };
  window.__step = ms => { t += ms; const due = timers.filter(x => x.at <= t); timers = timers.filter(x => x.at > t); due.forEach(x => { try { x.fn(); } catch (e) { } }); const cbs = q; q = []; cbs.forEach(cb => { try { cb(t); } catch (e) { } }); };
  window.__pump = setInterval(() => window.__step(1000 / 30), 33);
};
/* durumlar: oyunun gelişim evreleri */
const MK_STATES = () => {
  const ST = {
    fresh: () => { },
    p1: () => { const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 9000; BT.areas[0].lvl = 2; BT.rebuildCounters(); BT.zoneRoles(0).forEach(r => BT.hire(r, true, 0)); BT.counters.forEach(c => { c.open = true; c.seen = true; }); BT.reassignWorkers(); },
    m1: () => { ST.p1(); BT.areas[1].locked = false; BT.areas[0].lvl = 3; BT.areas[1].lvl = 2; BT.rebuildCounters(); BT.zoneRoles(1).forEach(r => BT.hire(r, true, 1)); BT.counters.forEach(c => { c.open = true; c.seen = true; }); BT.reassignWorkers(); },
    full: () => { const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400; for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false; BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); }); BT.rebuildCounters(); for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z)); BT.decor.forEach(d => { d.got = true; }); BT.counters.forEach(c => { c.open = true; c.seen = true; }); BT.reassignWorkers(); }
  };
  return ST;
};
const SH = (state, z, a, b, beats, o = {}) => ({ state, z, a, b, n: Math.round(beats * BEAT * FPS), ...o });
const CLIPS = {
  g1: [SH('fresh', 3, [2.2, 2.4], [3.0, 1.8], 4, { warm: 60 }), SH('p1', 3, [4.4, 2.6], [5.6, 2.4], 4, { dis: 1, warm: 150 }), SH('m1', 3, [7.4, 4.2], [8.4, 3.6], 4, { dis: 1, warm: 200 }), SH('full', 1, [5, 9], [5, 12.5], 4, { dis: 1, warm: 260 })],
  g2: [SH('full', 3, [3.0, 13.6], [3.8, 13.2], 2, { warm: 40 }), SH('full', 3, [6.2, 20.2], [6.6, 21.2], 2), SH('full', 3, [7.8, 10.2], [8.6, 10.6], 2), SH('full', 2, [8, 15.4], [7.4, 15.8], 2), SH('full', 3, [2.6, 6.6], [3.4, 7.2], 2)],
  g3: [SH('full', 3, [2.4, 1.8], [3.2, 2.2], 2, { warm: 40 }), SH('full', 3, [5.4, 2.2], [5.8, 2.8], 2), SH('full', 2, [8.2, 3.4], [8.8, 3.6], 2), SH('full', 3, [3.6, 12.6], [4.2, 13.2], 2), SH('full', 3, [6.4, 20.4], [6.8, 21.0], 2),
         SH('full', 3, [8.4, 18.6], [8.8, 19.0], 2), SH('full', 2, [5, 8], [5, 11], 2), SH('full', 1, [5, 12], [5, 16], 2), SH('full', 1, [5, 20], [5, 8], 2)]
};
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const { p } = await openGame(b, 'en', { width: W, height: H }, 2, VCLOCK);
  await p.evaluate(() => clearInterval(window.__pump));
  await p.addStyleTag({ content: '#ui,#hud,#objective,#toast,#coach,#devbar,#queueHint,#dayBanner,#actBtn,#tradeBtn,#devpanel,#lvlUp,#achPop,#pauseBadge,#specPop{display:none!important}' +
    '#vg{position:fixed;inset:0;z-index:50;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,12,.55) 100%)}#dz{position:fixed;inset:0;width:100%;height:100%;z-index:49;pointer-events:none;image-rendering:pixelated}' });
  await p.evaluate(() => {
    const v = document.createElement('div'); v.id = 'vg'; document.body.appendChild(v);
    const dz = document.createElement('canvas'); dz.id = 'dz'; document.body.appendChild(dz); window.__dz = { c: dz, old: null };
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
    window.__snap = () => { const g = document.getElementById('game'); const o = document.createElement('canvas'); o.width = dz.width = 480; o.height = dz.height = 202; o.getContext('2d').drawImage(g, 0, 0, 480, 202); window.__dz.old = o.getContext('2d').getImageData(0, 0, 480, 202); };
    window.__dissolve = u => { const c = dz.getContext('2d'); c.clearRect(0, 0, 480, 202); if (!window.__dz.old || u >= 1) return; const im = c.createImageData(480, 202), s = window.__dz.old.data; for (let y = 0; y < 202; y++) for (let x = 0; x < 480; x++) if (BAYER[((y & 3) << 2) | (x & 3)] > u) { const i = (y * 480 + x) * 4; im.data[i] = s[i]; im.data[i + 1] = s[i + 1]; im.data[i + 2] = s[i + 2]; im.data[i + 3] = 255; } c.putImageData(im, 0, 0); };
    window.__zoom = z => { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); document.getElementById('settingsScreen').classList.add('hidden'); };
    window.__ff = n => { for (let i = 0; i < n; i++) window.__step(1000 / 30); };
    window.__place = (x, y) => { BT.player.x = x; BT.player.y = y; };
  });
  await p.evaluate('window.__STATES = (' + MK_STATES.toString() + ')()');
  const shots = CLIPS[CLIP]; let f = 0, cur = '', curZoom = 0;
  await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); BT.S.tut = 99; BT.day.phase = 'play'; BT.day.t = 40; });
  for (let si = 0; si < shots.length; si++) {
    const s = shots[si];
    if (s.dis) await p.evaluate(() => window.__snap());
    if (s.state !== cur) { await p.evaluate(st => window.__STATES[st](), s.state); cur = s.state; }
    if (s.z !== curZoom) { await p.evaluate(z => window.__zoom(z), s.z); curZoom = s.z; }
    await p.evaluate(([a, w]) => { window.__place(a[0], a[1]); window.__ff(w); }, [s.a, s.warm || 90]);
    const DIS = Math.round(0.55 * FPS);
    for (let k = 0; k < s.n; k++) {
      const u = k / s.n, x = s.a[0] + (s.b[0] - s.a[0]) * u, y = s.a[1] + (s.b[1] - s.a[1]) * u;
      await p.evaluate(([x, y, d]) => { window.__place(x, y); window.__step(1000 / 30); window.__dissolve(d); }, [x, y, s.dis ? Math.min(1, k / DIS) : 1]);
      const keep = MODE !== 'preview' || k === 6 || k === s.n - 8;
      if (keep) await p.screenshot({ path: path.join(OUT, String(MODE === 'preview' ? si * 10 + (k === 6 ? 0 : 1) : f).padStart(5, '0') + '.png') });
      f++;
    }
    console.log(CLIP, 'çekim', si + 1, '/', shots.length, 'kare', f);
  }
  await b.close();
})();
