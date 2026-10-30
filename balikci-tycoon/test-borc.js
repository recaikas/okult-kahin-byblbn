/* v2.15 — vergi borcu: ödenemeyen borca yazılır ve her hafta ikiye katlanır (×2, ×4); 4. ziyarette en eski borç
   ödenemezse liman mühürlenir → "Liman Battı" gazetesi → HACİZ kartı → ana menü. v2.26.2: kayıt silinmez; kasaya el konur,
   borç silinir, itibar %20 düşer, OYNA ile kaldığı günden devam edilir. Kaçışan müşteriler ve
   çalışanlar her hafta farklı replik söyler (20 + 20, iki dil). İsteğe bağlı: node test-borc.js <görüntü klasörü> */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  R.lines = await p.evaluate(() => { const t = BT.tax, f = L => L.every(x => x.tr && x.en); return [t.fleeLines.length, t.workLines.length, t.debtLines.length, f(t.fleeLines) && f(t.workLines) && f(t.debtLines)]; });
  ok(R.lines[0] === 20 && R.lines[1] === 20 && R.lines[2] === 6 && R.lines[3], 'replikler eksik ' + JSON.stringify(R.lines));
  /* borç zinciri: 3 hafta ödenemez, 3. haftada ödenirse ×4 ×2 ×1 */
  R.chain = await p.evaluate(() => {
    const q = BT.tax.q(), out = [];
    BT.S.cash = 0; q.items = 10; q.due = 100; BT.tax.collect(); out.push(JSON.stringify(q.debt));
    BT.S.cash = 0; q.items = 5; q.due = 50; BT.tax.collect(); out.push(JSON.stringify(q.debt));
    BT.S.cash = 600; q.items = 3; q.due = 30; BT.tax.collect(); out.push(JSON.stringify(q.debt), BT.S.cash);   /* 100×4 + 50×2 + 30 = 530 */
    BT.S.cash = 150; q.debt = [[100, 1]]; q.items = 0; q.due = 0; BT.tax.collect(); out.push(JSON.stringify(q.debt), BT.S.cash);   /* ×4 = 400 ister, 150 öder */
    const d = BT.buildSave(); BT.loadFrom(d); out.push(JSON.stringify(BT.tax.q().debt));
    delete d.tax.debt; BT.loadFrom(d); out.push(JSON.stringify(BT.tax.q().debt));
    return out;
  });
  ok(R.chain[0] === '[[100,0]]' && R.chain[1] === '[[100,1],[50,0]]' && R.chain[2] === '[]' && R.chain[3] === 70, 'borç zinciri yanlış ' + JSON.stringify(R.chain));
  ok(R.chain[4] === '[[63,2]]' && R.chain[5] === 0 && R.chain[6] === '[[63,2]]' && R.chain[7] === '[]', 'kısmi ödeme / kayıt yanlış ' + JSON.stringify(R.chain));
  /* gerçek ziyaret: müşteriler kaçar, çalışanlar bağırır, borç yetişmezse mühür */
  await p.evaluate(() => {
    BT.S.tut = 99; BT.S.ctrl = 2; BT.day.n = 7; BT.day.phase = 'play'; BT.day.t = 20; BT.S.cash = 0;
    const q = BT.tax.q(); q.items = 20; q.due = 120; q.last = 0; q.n = 3; q.debt = [[100, 2], [50, 1], [30, 0]];
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep(8000);
  R.saved = await p.evaluate(() => { BT.saveNow(); return localStorage.getItem('balikci_slot_1') !== null; });
  ok(R.saved, 'deneme kaydı yazılamadı');
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN * 0.31; BT.S.cash = 0; });
  await sleep(1500);
  R.yell = await p.evaluate(() => ({ on: BT.tax.st().on, n: (BT.tax.st().yell || []).length, s: (BT.tax.st().yell || []).map(y => y.s) }));
  ok(R.yell.on && R.yell.n > 0, 'kaçışma replikleri yok ' + JSON.stringify(R.yell));
  if (SHOT) { await sleep(800); await p.screenshot({ path: SHOT + '/borc-1-kacis.png' }); }
  let over = false;
  for (let i = 0; i < 90 && !over; i++) { await sleep(1000); over = await p.evaluate(() => BT.tax.over()); if (SHOT && !R.s2 && await p.evaluate(() => BT.tax.st().overT !== undefined)) { R.s2 = 1; await sleep(1200); await p.screenshot({ path: SHOT + '/borc-2-muhur.png' }); } }
  ok(over, 'liman mühürlenmedi');
  R.slot = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('balikci_slot_1') || 'null'); return s && { cash: s.cash, debt: JSON.stringify(s.tax && s.tax.debt), day: s.day && s.day[0] }; });
  ok(R.slot && R.slot.cash === 0 && R.slot.debt === '[]', 'haciz kaydı yanlış (kayıt silinmemeli, kasa 0, borç boş) ' + JSON.stringify(R.slot));
  for (let i = 0; i < 3; i++) {
    await sleep(3200); if (SHOT) await p.screenshot({ path: SHOT + '/borc-3-gazete' + i + '.png' });
    for (let k = 0; k < 3; k++) { await p.click('#introScr').catch(() => {}); await sleep(250); }
  }
  for (let i = 0; i < 20 && await p.evaluate(() => document.getElementById('endScr').classList.contains('hidden')); i++) { await p.click('#introScr').catch(() => {}); await sleep(500); }
  R.card = await p.evaluate(() => ({ vis: !document.getElementById('endScr').classList.contains('hidden'), t: document.getElementById('endT').textContent }));
  ok(R.card.vis && /HACİZ|SEIZED/.test(R.card.t), 'oyun sonu kartı yok ' + JSON.stringify(R.card));
  if (SHOT) await p.screenshot({ path: SHOT + '/borc-4-kart.png' });
  await p.click('#endGo'); await sleep(800);
  R.menu = await p.evaluate(() => ({ start: !document.getElementById('startScreen').classList.contains('hidden'), started: BT.S.started, over: BT.tax.over() }));
  ok(R.menu.start && !R.menu.started && !R.menu.over, 'ana menüye dönmedi ' + JSON.stringify(R.menu));
  /* OYNA: aynı kayıttan devam */
  await p.click('#playBtn'); await sleep(600);
  await p.evaluate(() => { const a = document.querySelector('#autoOpts button[data-m="10"]'); if (a && a.offsetParent) a.click(); });
  await sleep(900);
  R.cont = await p.evaluate(() => ({ started: BT.S.started, day: BT.day.n, cash: BT.S.cash, debt: JSON.stringify(BT.tax.q().debt), over: BT.tax.over() }));
  ok(R.cont.started && R.cont.day >= 7 && R.cont.debt === '[]' && !R.cont.over, 'hacizden sonra oyuna devam edilemedi ' + JSON.stringify(R.cont));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'BORC_FAIL ' + JSON.stringify(fail) : 'BORC_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
