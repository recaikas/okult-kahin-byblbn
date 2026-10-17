/* v2.13 — İnce piksel modu: varsayılan İNCE, ayarlardan Klasik'e dönülür ve tercih kalır; iki modda da
   kamera, dünya→ekran eşlemesi, joystick ile yürüyüş aynıdır; sanat kancası hata atarsa klasik çizime düşülür. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('C: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(1200);
  const snap = () => p.evaluate(() => {
    const d = BT.dbg(), c = document.getElementById('game');
    return { K: HKG.K, fine: HKG.fine, cw: c.width, ch: c.height, W: d.W, H: d.H, PXS: d.PXS, scr: BT.scr(4.5, 3.2, 0), pt: BT.canvasPt(8, 8, 0), art: !!(window.HKA && HKA.lib) };
  });
  R.fine = await snap();
  ok(R.fine.fine && R.fine.K === 2 && R.fine.cw === R.fine.W * 2 && R.fine.ch === R.fine.H * 2 && R.fine.art, 'varsayılan ince değil ' + JSON.stringify(R.fine));
  /* ayarlardan Klasik */
  await p.evaluate(() => BT.openSettings()); await sleep(200);
  R.lbl = await p.evaluate(() => [document.getElementById('setVis').textContent, document.querySelector('#visSeg .on').dataset.v]);
  ok(R.lbl[0] === 'GÖRÜNÜM' && R.lbl[1] === '1', 'ayar düğmesi yanlış ' + JSON.stringify(R.lbl));
  await p.click('#visClassic'); await sleep(250);
  R.classic = await snap();
  ok(!R.classic.fine && R.classic.K === 1 && R.classic.cw === R.classic.W, 'klasiğe dönmedi ' + JSON.stringify(R.classic));
  ok(JSON.stringify(R.classic.scr) === JSON.stringify(R.fine.scr) && JSON.stringify(R.classic.pt) === JSON.stringify(R.fine.pt), 'dünya→ekran eşlemesi modla değişti');
  R.pref = await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_pref')).vis);
  ok(R.pref === 0, 'tercih kaydedilmedi ' + R.pref);
  await p.click('#visFine'); await sleep(200);
  ok((await snap()).K === 2, 'inceye geri dönmedi');
  await p.click('#setClose'); await sleep(200);
  /* joystick yürüyüşü iki modda aynı yol */
  const walk = async () => {
    await p.evaluate(() => { BT.player.x = 4.5; BT.player.y = 3.2; });
    await p.mouse.move(195, 600); await p.mouse.down(); await p.mouse.move(245, 600, { steps: 4 }); await sleep(700); await p.mouse.up(); await sleep(150);
    return p.evaluate(() => [+BT.player.x.toFixed(1), +BT.player.y.toFixed(1)]);
  };
  R.walkFine = await walk();
  await p.evaluate(() => HKG.setFine(false)); R.walkClassic = await walk(); await p.evaluate(() => HKG.setFine(true));
  ok(R.walkFine[0] !== 4.5 && Math.abs(R.walkFine[0] - R.walkClassic[0]) < 0.6 && Math.abs(R.walkFine[1] - R.walkClassic[1]) < 0.6, 'yürüyüş modla farklı ' + JSON.stringify([R.walkFine, R.walkClassic]));
  /* bozuk sanat kancası: oyun durmaz, klasik çizime düşer, yalnız bir uyarı */
  const warns = []; p.on('console', m => { if (m.type() === 'warning' && /HKA\./.test(m.text())) warns.push(m.text()); });
  await p.evaluate(() => { window._oldGull = HKA.drawGull; HKA.drawGull = function () { throw new Error('deneme'); }; });
  await sleep(1200);
  await p.evaluate(() => { HKA.drawGull = window._oldGull; });
  ok(warns.length <= 1, 'uyarı tekrarlandı ' + warns.length);
  /* eski kayıt: vis alanı olmayan tercih → ince varsayılan */
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => { try { const d = JSON.parse(localStorage.getItem('balikci_pref') || '{}'); delete d.vis; localStorage.setItem('balikci_pref', JSON.stringify(d)); } catch (e) { } });
  await p2.goto(URL); await sleep(900);
  R.legacy = await p2.evaluate(() => HKG.K);
  ok(R.legacy === 2, 'eski tercihte ince açılmadı ' + R.legacy);
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'INCE_FAIL ' + JSON.stringify(fail) : 'INCE_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
