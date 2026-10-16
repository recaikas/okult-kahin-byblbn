/* Görsel kontrol: store/tools/scene.js ile dolu bir koy kurar, PXS 2/3/4'te ekran görüntüsü alır,
   konsol hatalarını ve FPS'i raporlar. Önce oyun klasörünü 8099'da sunun (npx http-server -p 8099 .).
   Kullanım: node test-gorsel.js [çıkış klasörü] [mod: ince|klasik|yok]   (yok: ayar yok, eski sürüm için)
   Ortam: SHOTS=liman,gece,... ile yalnız seçilen sahneler; SECS=richCove bekleme süresi (vars. 12) */
const { chromium, openGame, richCove, sleep } = require('./store/tools/scene');
const fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2] || 'screenshots/sonra');
const MODE = process.argv[3] || 'ince';
const ONLY = (process.env.SHOTS || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
/* PXS = sanat pikseli başına CSS pikseli. Telefon 390 genişlikte taban 2 → zoom düğmesi 2/3 → PXS 2/3; masaüstü 1280'de taban 4. */
const VIEWS = [
  { id: 'tel-pxs2', vp: { width: 390, height: 844 }, dsf: 3, z: 2 },
  { id: 'tel-pxs3', vp: { width: 390, height: 844 }, dsf: 3, z: 3 },
  { id: 'masa-pxs4', vp: { width: 1280, height: 800 }, dsf: 1, z: 2 }
];
/* sahneler: oyuncu nereye ışınlanır, gün saati, hava */
const SCENES = [
  { id: 'liman', at: null, t: 0.45 },
  { id: 'iskele', at: [4.5, 3.2], t: 0.45 },
  { id: 'meydan', at: [18, 6], t: 0.45 },
  { id: 'aksam', at: null, t: 0.88 },
  { id: 'sabah', at: null, t: 0.04 }
];
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const report = { mode: MODE, shots: [], errs: [], fps: {} };
  for (const v of VIEWS) {
    const init = MODE === 'yok' ? null : `try{var k='balikci_pref',d=JSON.parse(localStorage.getItem(k)||'{}');d.vis=${MODE === 'klasik' ? 0 : 1};localStorage.setItem(k,JSON.stringify(d))}catch(e){}`;
    const { ctx, p } = await openGame(b, 'tr', v.vp, v.dsf, init);
    p.on('pageerror', e => report.errs.push(v.id + ' PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errs.push(v.id + ' C: ' + m.text()); });
    await p.evaluate(z => { const btn = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (btn) btn.click(); }, v.z);
    await richCove(p, +(process.env.SECS || 12));
    report.dbg = report.dbg || {};
    report.dbg[v.id] = await p.evaluate(() => { const d = BT.dbg(); return { PXS: d.PXS, W: d.W, H: d.H, cw: document.getElementById('game').width, fine: window.HKG ? HKG.K : 1 }; });
    for (const s of SCENES) {
      if (ONLY.length && !ONLY.includes(s.id)) continue;
      await p.evaluate(s => {
        BT.day.t = BT.DAY_LEN * s.t;
        if (s.at) { BT.player.x = s.at[0]; BT.player.y = s.at[1]; }
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      }, s);
      await sleep(1500);
      const f = path.join(OUT, v.id + '-' + s.id + '.png');
      await p.screenshot({ path: f });
      report.shots.push(path.relative(process.cwd(), f));
    }
    /* FPS: 4 saniye boyunca rAF say (headless, CPU yavaşlatmasız ve 4x yavaşlatmalı) */
    const fps = async () => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else r(Math.round(n / ((performance.now() - t0) / 1000))); })(); }));
    report.fps[v.id] = { normal: await fps() };
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    report.fps[v.id].cpu4x = await fps();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await ctx.close();
  }
  await b.close();
  report.errs = [...new Set(report.errs)];
  fs.writeFileSync(path.join(OUT, 'rapor.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  process.exit(report.errs.length ? 1 : 0);
})();
