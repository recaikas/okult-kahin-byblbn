/* v0.8 — otomatik kayıt testi: yeni oyunda sorulur, seçilen aralıkta kaydeder, ayardan değişir,
   kayda yazılır; eski kayıt (ayarsız) "Devam Et"te bir kez sorar, sonra sormaz. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  const p = await ctx.newPage();
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  const vis = id => p.evaluate(id => !document.getElementById(id).classList.contains('hidden'), id);
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await sleep(300);
  /* 1) isimden sonra soru çıkar, oyun henüz başlamaz */
  R.ask = { vis: await vis('autoScr'), started: await p.evaluate(() => BT.S.started), opts: await p.$$eval('#autoOpts button b', a => a.map(x => x.textContent)) };
  ok(R.ask.vis && !R.ask.started && R.ask.opts.join(',') === '5 dk,10 dk,30 dk', 'otomatik kayıt sorusu yanlış ' + JSON.stringify(R.ask));
  await p.click('#autoOpts button[data-m="5"]'); await sleep(800);
  R.go = await p.evaluate(() => ({ started: BT.S.started, st: BT.autoState() }));
  ok(R.go.started && R.go.st.min === 5, 'seçimden sonra oyun başlamadı');
  /* 2) aralık dolunca kaydeder + rozet */
  await p.evaluate(() => { BT.S.cash = 4321; });
  const before = await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_slot_1')).cash);
  await p.evaluate(() => BT.fastForwardAutosave(5 * 60 - 0.5)); await sleep(1200);
  R.saved = await p.evaluate(() => ({ cash: JSON.parse(localStorage.getItem('balikci_slot_1')).cash, badge: document.getElementById('autoBadge').textContent, st: BT.autoState() }));
  ok(before !== 4321 && R.saved.cash === 4321 && /Otomatik kaydedildi/.test(R.saved.badge) && R.saved.st.t < 5, 'otomatik kayıt yapılmadı ' + JSON.stringify({ before, s: R.saved }));
  /* 3) aralık dolmadan kaydetmez (6 sn'lik eski sessiz kayıt kalktı) */
  await p.evaluate(() => { BT.S.cash = 999; }); await sleep(7000);
  R.noEarly = await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_slot_1')).cash);
  ok(R.noEarly === 4321, 'aralık dolmadan kaydetti');
  /* 4) ayarlardan değiştir */
  await p.click('#menuBtn'); await sleep(150); await p.click('#menuSet'); await sleep(200);
  R.setInfo = await p.textContent('#setSaveInfo');
  await p.click('#autoSeg button[data-m="30"]'); await sleep(200);
  R.after = await p.evaluate(() => ({ min: BT.autoState().min, on: [...document.querySelectorAll('#autoSeg button.on')].map(b => b.dataset.m), saved: JSON.parse(localStorage.getItem('balikci_slot_1')).autoMin }));
  ok(/sonraki/.test(R.setInfo) && R.after.min === 30 && R.after.on[0] === '30' && R.after.saved === 30, 'ayar değişmedi ' + JSON.stringify({ i: R.setInfo, a: R.after }));
  /* 5) kaydet-çık → devam: tekrar sormaz */
  await p.click('#saveQuitBtn'); await sleep(300); await p.click('#playBtn'); await sleep(500);
  R.cont = { ask: await vis('autoScr'), started: await p.evaluate(() => BT.S.started), min: await p.evaluate(() => BT.autoState().min) };
  ok(!R.cont.ask && R.cont.started && R.cont.min === 30, 'devamda tekrar sordu ' + JSON.stringify(R.cont));
  await ctx.close();
  /* 6) eski kayıt (ayarsız): devam edince bir kez sorar */
  const c2 = await b.newContext({ viewport: { width: 430, height: 860 } });
  await c2.addInitScript(() => { if (!localStorage.getItem('__a')) { localStorage.setItem('__a', '1'); localStorage.setItem('balikci_tycoon_v3', JSON.stringify({ v: 5, cash: 700, company: 'Eski', runId: 'oldrun3', at: Date.now() })); } });
  const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push('PE2: ' + e.message));
  await p2.goto(URL); await sleep(1100);
  await p2.click('#playBtn'); await sleep(300);
  R.legacy = { ask: await p2.evaluate(() => !document.getElementById('autoScr').classList.contains('hidden')), started: await p2.evaluate(() => BT.S.started) };
  await p2.click('#autoOpts button[data-m="10"]'); await sleep(400);
  R.legacy.after = await p2.evaluate(() => ({ started: BT.S.started, min: BT.autoState().min }));
  ok(R.legacy.ask && !R.legacy.started && R.legacy.after.started && R.legacy.after.min === 10, 'eski kayıtta soru yanlış ' + JSON.stringify(R.legacy));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'AUTO_FAIL ' + JSON.stringify(fail) : 'AUTO_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
