/* Faz 1 kabul testi: müzik, kontrol eğitimi, seviye atlama, YAPI alt sekmeleri,
   süs yerleşimi, gün sonu müşteri yenilenmesi. Temiz profil + yerel sunucu (8099). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/config\.js|favicon/.test(m.text())) errs.push('C: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.mouse.click(215, 400); await sleep(1500);                 /* kapı → müzik */
  R.musicIntro = await p.evaluate(() => BT.music());
  ok(R.musicIntro.on && R.musicIntro.step > 2, 'müzik hikâyede çalmıyor');
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#nameGo'); await sleep(1600);
  R.musicGame = await p.evaluate(() => BT.music().on);
  ok(!R.musicGame, 'müzik oyunda susmadı');
  /* kontrol eğitimi */
  R.coach0 = await p.evaluate(() => ({ vis: !document.getElementById('coach').classList.contains('hidden'), t: document.getElementById('coach').textContent, c: BT.S.ctrl }));
  ok(R.coach0.vis && R.coach0.c === 0, 'kontrol eğitimi görünmüyor');
  await p.keyboard.down('d'); await sleep(1800); await p.keyboard.up('d'); await sleep(300);
  R.coach1 = await p.evaluate(() => ({ t: document.getElementById('coach').textContent, c: BT.S.ctrl }));
  ok(R.coach1.c === 1, 'yürüyünce eğitim ilerlemedi');
  await sleep(6500);
  R.coach2 = await p.evaluate(() => ({ vis: !document.getElementById('coach').classList.contains('hidden'), c: BT.S.ctrl }));
  ok(!R.coach2.vis && R.coach2.c === 2, 'eğitim kapanmadı');
  /* seviye atlama */
  await p.evaluate(() => { BT.S.rep = 12; }); await sleep(500);
  R.lvl = await p.evaluate(() => ({ vis: !document.getElementById('lvlUp').classList.contains('hidden'), t: document.getElementById('lvlUp').textContent, hud: document.getElementById('hRep').textContent, paused: BT.paused() }));
  ok(R.lvl.vis && /SEVİYE 2/.test(R.lvl.t) && /Balık Pazarı/.test(R.lvl.t), 'seviye şeridi yok');
  ok(!R.lvl.paused, 'seviye şeridi oyunu durdurdu');
  ok(/SV 2/.test(R.lvl.hud), 'HUD seviye göstermiyor');
  await p.screenshot({ path: (process.env.SHOTS || '/tmp') + '/f1_level.png' });
  await sleep(4000);
  R.lvlGone = await p.evaluate(() => document.getElementById('lvlUp').classList.contains('hidden'));
  ok(R.lvlGone, 'seviye şeridi kaybolmadı');
  /* YAPI alt sekmeleri */
  await p.evaluate(() => { BT.S.cash = 50000; BT.areas.forEach(a => a.locked = false); BT.rebuildCounters();
  });
  await sleep(500);
  await p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await sleep(200);
  await p.click('.dtab[data-t="build"]'); await sleep(300);
  R.sub = await p.$$eval('#dpSub button', a => a.map(x => x.textContent.trim()));
  ok(R.sub.length === 3 && !(await p.evaluate(() => document.getElementById('dpSub').classList.contains('hidden'))), 'alt sekmeler yok');
  await p.click('#dpSub button[data-s="decor"]'); await sleep(200);
  R.decorCards = await p.$$eval('#dpCards .dcard', a => a.map(x => x.textContent));
  ok(R.decorCards.some(t => /Seviye 6/.test(t)), 'süs seviye kilidi görünmüyor');
  await p.screenshot({ path: (process.env.SHOTS || '/tmp') + '/f1_build.png' });
  await p.click('#dpSub button[data-s="up"]'); await sleep(200);
  R.upCards = await p.$$eval('#dpCards .dcard b', a => a.map(x => x.textContent));
  ok(R.upCards.some(t => /→/.test(t)), 'yapı yükseltmeleri boş');
  await p.click('#dpSub button[data-s="dev"]'); await sleep(200);
  R.devCards = (await p.$$('#dpCards .dcard')).length;
  ok(R.devCards >= 3, 'geliştirmeler boş');
  await p.click('.dtab[data-t="build"]'); await sleep(200);
  /* süs yerleşimi */
  R.clear = await p.evaluate(() => BT.decorClearance().filter(d => !d.ok));
  ok(!R.clear.length, 'süs tezgâh alanına çok yakın: ' + JSON.stringify(R.clear));
  /* gün sonu müşteri yenilenmesi */
  await sleep(4000);
  const before = await p.evaluate(() => ({ n: BT.customers.filter(c => c.state !== 'leave').length, lost: BT.S.lost }));
  await p.evaluate(() => { BT.day.phase = 'closing'; BT.day.ph = 99; });
  await sleep(600);
  R.dayEnd = await p.evaluate(() => ({ active: BT.customers.filter(c => c.state !== 'leave').length, lost: BT.S.lost, phase: BT.day.phase }));
  R.before = before;
  ok(R.dayEnd.active === 0 && R.dayEnd.lost === before.lost, 'gün sonunda müşteriler gitmedi / kayıp sayıldı');
  await p.click('#dayGo'); await sleep(500);
  await p.evaluate(() => { for (const id of ['prepGo', 'stallGo']) { const e = document.getElementById(id); if (e && e.offsetParent) e.click(); } });
  await sleep(400);
  R.banner = await p.evaluate(() => ({ feat: BT.day.feat, s: document.getElementById('dayBannerS').textContent }));
  ok(R.banner.feat && /Günün müşterisi/.test(R.banner.s), 'günün müşterisi yok');
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'FAZ1_FAIL ' + JSON.stringify(fail) : 'FAZ1_OK');
  await b.close();
  process.exit(fail.length || errs.length ? 1 : 0);
})();
