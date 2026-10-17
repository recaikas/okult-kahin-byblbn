/* v2.14 — Vergi Memuru Haşmet Bey: 7. gün gelir, müşteriler kaçar ama kayıp sayılmaz, o varken müşteri gelmez,
   Ana Kasa'da ürün başı vergiyi keser (en çok kasanın %40'ı), 10 hafta ayrı konuşur, kayıtta saklanır.
   İsteğe bağlı: node test-vergi.js <görüntü klasörü> */
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
  /* replikler: 10 hafta × 3, iki dil, tahsilat repliğinde tutar */
  R.lines = await p.evaluate(() => { const L = BT.tax.lines; return { n: L.length, ok: L.every(w => w.length === 3 && w.every(x => x.tr && x.en)), v: L.every(w => /\{v\}/.test(w[2].tr) && /\{v\}/.test(w[2].en)) }; });
  ok(R.lines.n === 10 && R.lines.ok && R.lines.v, 'replikler eksik ' + JSON.stringify(R.lines));
  /* 7. gün, kuyrukta müşteriler, biriken vergi */
  await p.evaluate(() => {
    BT.S.tut = 99; BT.S.ctrl = 2; BT.day.n = 7; BT.day.phase = 'play'; BT.day.t = 20; BT.S.cash = 1000;
    const q = BT.tax.q(); q.items = 50; q.due = 300; q.last = 0;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep(9000);                                   /* müşteriler gelsin */
  R.before = await p.evaluate(() => ({ cust: BT.customers.filter(c => c.state !== 'leave').length, lost: BT.S.lost, dlost: BT.day.st.lost }));
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN * 0.31; });
  await sleep(600);
  R.start = await p.evaluate(() => ({ on: BT.tax.st().on, staying: BT.customers.filter(c => c.state !== 'leave' && !c.story).length, flee: BT.customers.filter(c => c.flee).length }));
  ok(R.start.on, 'memur gelmedi');
  ok(R.start.staying === 0, 'müşteriler kaçmadı ' + JSON.stringify(R.start));
  if (SHOT) { await sleep(2500); await p.screenshot({ path: SHOT + '/vergi-1-gelis.png' }); }
  /* memur limandayken yeni müşteri gelmez; bitene kadar bekle */
  let spawned = 0;
  for (let i = 0; i < 90; i++) {
    const s = await p.evaluate(() => ({ on: BT.tax.st().on, say: BT.tax.st().say, n: BT.customers.filter(c => c.state !== 'leave').length, x: BT.tax.st().x, y: BT.tax.st().y }));
    if (s.on && s.n > 0) spawned = Math.max(spawned, s.n);
    if (SHOT && s.say === 2 && !R.shot2) { R.shot2 = 1; await sleep(400); await p.screenshot({ path: SHOT + '/vergi-2-tahsilat.png' }); }
    if (!s.on) break;
    await sleep(1000);
  }
  R.after = await p.evaluate(() => ({ on: BT.tax.st().on, cash: BT.S.cash, q: Object.assign({}, BT.tax.q()), lost: BT.S.lost, dlost: BT.day.st.lost }));
  ok(!R.after.on, 'memur gitmedi');
  ok(spawned === 0, 'memur varken müşteri geldi ' + spawned);
  ok(R.after.lost === R.before.lost && R.after.dlost === R.before.dlost, 'kaçanlar kayıp sayıldı ' + JSON.stringify([R.before, R.after]));
  ok(R.after.cash <= 700 + 60 && R.after.cash >= 700 - 400, 'vergi yanlış ' + R.after.cash);   /* 300 vergi (bu arada satış olabilir) */
  ok(R.after.q.items === 0 && R.after.q.n === 1 && R.after.q.last === 7, 'sayaç sıfırlanmadı ' + JSON.stringify(R.after.q));
  R.toast = await p.evaluate(() => document.getElementById('toast').textContent);
  /* aynı gün ikinci kez gelmez */
  await p.evaluate(() => { BT.tax.q().items = 5; BT.tax.q().due = 10; }); await sleep(1200);
  ok(!(await p.evaluate(() => BT.tax.st().on)), 'aynı gün tekrar geldi');
  /* tavan: kasanın %40'ı */
  R.cap = await p.evaluate(() => { BT.S.cash = 1000; const q = BT.tax.q(); q.due = 10000; q.items = 99; BT.tax.collect(); return BT.S.cash; });
  ok(R.cap === 600, 'tavan çalışmıyor ' + R.cap);
  /* kayıt + eski kayıt */
  R.save = await p.evaluate(() => { const d = BT.buildSave(); const has = !!d.tax && typeof d.tax.n === 'number'; delete d.tax; BT.loadFrom(d); return { has, q: BT.tax.q() }; });
  ok(R.save.has && R.save.q.items === 0 && R.save.q.n === 0, 'kayıt alanı yanlış ' + JSON.stringify(R.save));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'VERGI_FAIL ' + JSON.stringify(fail) : 'VERGI_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
