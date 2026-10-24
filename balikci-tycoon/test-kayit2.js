/* v2.21 — gece testi kayıt/yükleme düzeltmeleri:
   1) vergi ziyareti ortasında kayıt/yükleme: borç ikinci kez yaşlanmaz, liman mühürlenmez
   2) aynı ziyarette kesilen vergi yüklemeden sonra tekrar kesilmez
   3) bozuk kayıt: slot "Bozuk kayıt" görünür; açılamayan kayıt yedeklenir, ezilmez, yarım dünya açılmaz
   4) gün kartı açıkken kayıt + sayfa yenileme: gün ikinci kez kapanmaz, yeni güne geçilir; gün istatistiği kayıtta
   5) aradaki mallar (masa, hasır, ağ stoğu, eldeki) kayıtta korunur */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  const boot = async () => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(700);
    await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; BT.achMute && BT.achMute(true); document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); });
  };
  const reload = () => p.evaluate(() => { const s = JSON.parse(JSON.stringify(BT.buildSave())); BT.lok.X.resetWorld(); const r = BT.loadFrom(s); BT.S.started = true; return r; });
  /* adım: sim 0,05 sn; vergi/gün akışı update üzerinden */
  const run = (sec) => p.evaluate((sec) => { for (let i = 0; i < sec / 0.05; i++) BT.emek.step(0.05, 1); }, sec);
  await boot();

  /* ---------- 1) borç yaşı ---------- */
  R.tax1 = await p.evaluate(() => {
    BT.day.n = 7; BT.day.phase = 'play'; BT.day.t = 100; BT.S.cash = 0;
    const q = BT.tax.q(); q.items = 10; q.due = 100; q.last = 0; q.debt = [[500, 1]]; q.by = {}; q.by[BT.counters[0].key] = [10, 100];
    BT.tax.start();
    return { debt: JSON.stringify(q.debt) };
  });
  ok(R.tax1.debt === '[[500,2]]', 'ziyaret başında borç yaşlanmadı ' + R.tax1.debt);
  for (let i = 0; i < 40; i++) { const s = await p.evaluate(() => BT.tax.st().settled); if (s) break; await run(1); }
  R.tax1.mid = await p.evaluate(() => ({ settled: BT.tax.st().settled, over: BT.tax.st().over, debt: JSON.stringify(BT.tax.q().debt), vis: BT.tax.q().vis }));
  ok(R.tax1.mid.settled && !R.tax1.mid.over && R.tax1.mid.vis === 7, 'ilk durak/borç tahsili olmadı ' + JSON.stringify(R.tax1.mid));
  R.tax1.load = await reload();
  await p.evaluate(() => { BT.day.phase = 'play'; });
  R.tax1.after = await p.evaluate(() => ({ on: BT.tax.st().on, debt: JSON.stringify(BT.tax.q().debt), vis: BT.tax.q().vis }));
  for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => ({ on: BT.tax.st().on, over: BT.tax.over() })); if (s.over || (!s.on && i > 2)) break; await run(1); }
  R.tax1.end = await p.evaluate(() => ({ over: BT.tax.over(), debt: JSON.stringify(BT.tax.q().debt), last: BT.tax.q().last, vis: BT.tax.q().vis }));
  ok(!R.tax1.end.over, 'yükleme sonrası liman mühürlendi (borç ikinci kez yaşlandı) ' + JSON.stringify(R.tax1));
  ok(R.tax1.end.last === 7 && R.tax1.end.vis === 0, 'ziyaret kapanmadı ' + JSON.stringify(R.tax1.end));
  ok(/\[500,2\]/.test(R.tax1.end.debt), 'eski borç yaşı değişti ' + R.tax1.end.debt);

  /* ---------- 2) çifte tahsilat ---------- */
  await reload();
  R.tax2 = await p.evaluate(() => {
    BT.day.n = 14; BT.day.phase = 'play'; BT.day.t = 100; BT.S.cash = 10000;
    const q = BT.tax.q(); q.items = 10; q.due = 300; q.last = 0; q.debt = []; q.by = {}; q.by[BT.counters[0].key] = [10, 300]; q.vis = 0;
    BT.tax.start(); return { cash0: BT.S.cash };
  });
  for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => BT.tax.st().done); if (s >= 1) break; await run(0.5); }
  R.tax2.mid = await p.evaluate(() => ({ cash: BT.S.cash, paid: BT.tax.st().paid, due: BT.tax.q().due }));
  await reload(); await p.evaluate(() => { BT.day.phase = 'play'; });
  for (let i = 0; i < 60; i++) { const s = await p.evaluate(() => BT.tax.q().last); if (s === 14) break; await run(1); }
  R.tax2.end = await p.evaluate(() => ({ cash: BT.S.cash, last: BT.tax.q().last }));
  ok(R.tax2.end.last === 14, 'ikinci ziyaret kapanmadı ' + JSON.stringify(R.tax2));
  ok(Math.round(R.tax2.cash0 - R.tax2.end.cash) <= 300, 'vergi iki kez kesildi ' + JSON.stringify(R.tax2));

  /* ---------- 4) gün kartı + yenileme ---------- */
  await reload();
  R.day = await p.evaluate(() => {
    BT.day.n = 3; BT.day.phase = 'play'; BT.day.t = 120; BT.S.cash = 5000;
    BT.day.st.inc = 777; BT.day.st.served = 12;
    const s = BT.buildSave(); return { dst: s.dst, flag: s.day[7] };
  });
  ok(R.day.dst && R.day.dst.inc === 777 && R.day.dst.served === 12 && R.day.flag === 0, 'gün istatistiği kayda yazılmadı ' + JSON.stringify(R.day));
  await reload();
  R.day.st = await p.evaluate(() => ({ inc: BT.day.st.inc, served: BT.day.st.served }));
  ok(R.day.st.inc === 777 && R.day.st.served === 12, 'gün istatistiği yüklenmedi ' + JSON.stringify(R.day.st));
  await p.evaluate(() => { BT.day.spec = null; BT.day.sp = 0; BT.customers.length = 0; BT.endDay(); });
  for (let i = 0; i < 200; i++) { const v = await p.evaluate(() => !document.getElementById('dayScr').classList.contains('hidden')); if (v) break; await sleep(400); }   /* gece özel müşterisi kapanışı en çok ~52 sn tutar */
  R.day.card = await p.evaluate(() => ({ phase: BT.day.phase, n: BT.day.n, cash: BT.S.cash, slot: localStorage.getItem('balikci_slot_1') }));
  ok(R.day.card.phase === 'summary', 'gün kartı açılmadı ' + R.day.card.phase);
  const saved = JSON.parse(R.day.card.slot);
  ok(saved.day[7] === 1, 'kayıtta gün kapandı işareti yok ' + JSON.stringify(saved.day));
  await p.reload(); await sleep(900);
  await p.click('#introSkip').catch(() => {}); await p.click('#playBtn'); await sleep(600);
  await p.evaluate(() => { const a = document.querySelector('#autoOpts button[data-m="10"]'); if (a && a.offsetParent) a.click(); });
  await sleep(900);
  R.day.after = await p.evaluate(() => ({ n: BT.day.n, phase: BT.day.phase, cash: BT.S.cash }));
  ok(R.day.after.n === 4 && R.day.after.phase !== 'summary', 'yenilemeden sonra yeni güne geçilmedi ' + JSON.stringify(R.day.after));
  ok(Math.abs(R.day.after.cash - R.day.card.cash) < 50, 'gün sonu ikinci kez işledi (kasa değişti) ' + JSON.stringify([R.day.card.cash, R.day.after.cash]));
  await p.evaluate(() => { BT.S.tut = 99; document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); });

  /* ---------- 5) aradaki mallar ---------- */
  R.loose = await p.evaluate(() => {
    const t = BT.tables[0], f = BT.spots[0].f || (BT.lines.find(l => l.src === 0) || {}).f;
    t.inn.length = 0; t.mat.items.length = 0; BT.player.carry.length = 0;
    for (let i = 0; i < 4; i++) t.inn.push({ k: 'fish', f: f });
    for (let i = 0; i < 3; i++) t.mat.items.push({ k: 'fileto', f: f });
    BT.player.carry.push({ k: 'fish', f: f });
    BT.spots[0].stock.length = 0; for (let i = 0; i < 5; i++) BT.spots[0].stock.push({ k: 'fish', f: f });
    t.cur = null;
    const sv = JSON.parse(JSON.stringify(BT.buildSave())); BT.lok.X.resetWorld(); BT.loadFrom(sv); BT.S.started = true;   /* aynı karede: oyun döngüsü araya girmesin */
    return { f: f, after: { inn: BT.tables[0].inn.length, mat: BT.tables[0].mat.items.length, carry: BT.player.carry.length, stock: BT.spots[0].stock.length } };
  });
  ok(R.loose.after.inn === 4 && R.loose.after.mat === 3 && R.loose.after.carry === 1 && R.loose.after.stock === 5, 'aradaki mallar kayboldu ' + JSON.stringify(R.loose));

  /* ---------- 3) bozuk kayıt ---------- */
  R.bad = await p.evaluate(() => {
    localStorage.setItem('balikci_slot_2', '{"v":7,"cash":12');               /* kesik JSON */
    localStorage.setItem('balikci_slot_3', JSON.stringify({ v: 7, cash: 50, company: 'Bozuk', areas: [null], pads: [null], workers: {} }));
    return 1;
  }) && {};
  await p.reload(); await sleep(900);
  await p.click('#introSkip').catch(() => {});
  await p.click('#loadBtn'); await sleep(300);
  R.bad.rows = await p.evaluate(() => [...document.querySelectorAll('#slotRows .slot')].map(s => s.innerText.replace(/\s+/g, ' ')));
  ok(/Bozuk kayıt|Damaged save/.test(R.bad.rows[1] || ''), 'kesik slot boş görünüyor ' + R.bad.rows[1]);
  const b3 = await p.$('#slotRows .sb[data-a="load"][data-n="3"]');
  if (b3) {
    await b3.click(); await sleep(400);
    R.bad.after = await p.evaluate(() => ({ raw: localStorage.getItem('balikci_slot_3'), bak: localStorage.getItem('balikci_slot_3_bak'), started: BT.S.started, slotVis: !document.getElementById('slotScr').classList.contains('hidden') }));
    ok(R.bad.after.bak && R.bad.after.raw === R.bad.after.bak, 'bozuk kayıt yedeklenmedi ya da ezildi ' + JSON.stringify(R.bad.after));
    ok(!R.bad.after.started && R.bad.after.slotVis, 'bozuk kayıtla oyun başladı ' + JSON.stringify(R.bad.after));
  } else R.bad.note = 'slot 3 yükle düğmesi yok (metaOf bozuk kaydı da okuyamadı)';

  console.log(JSON.stringify(R, (k, v) => k === 'slot' ? undefined : v, 1));
  console.log(errs.length ? errs : 'konsol temiz');
  await b.close();
  if (fail.length || errs.length) { console.log('HATA:\n' + fail.concat(errs).join('\n')); process.exit(1); }
  console.log('KAYIT2_OK');
})().catch(e => { console.error(e); process.exit(1); });
