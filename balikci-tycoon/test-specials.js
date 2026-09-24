/* v0.9 — özel isimli müşteriler: günde 2 kişi; 1. si birkaç normal müşteriden sonra kuyruğa,
   2. si kapanışa yakın "Özel bir müşteri geliyor..." bildiriminden sonra; kapanış onu bekler;
   gün kartında isimler; kayıt/yükleme sonrası akış bozulmaz. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  R.pool = await p.evaluate(() => ({ n: BT.SPECIALS.length, first: BT.SPECIALS.slice(0, 2).map(s => s.n) }));
  ok(R.pool.n >= 10 && R.pool.first.join() === 'Caner,Pelin', 'havuz yanlış');
  /* stok bol: herkes hızla servis edilsin */
  const feed = () => p.evaluate(() => { BT.S.ctrl = 2; const c = BT.counters[0]; while (c.buffer.length < 18) c.buffer.push({ k: 'fileto', f: 'hamsi' }); });
  await feed();
  /* 1) gün başında özel müşteri yok; birkaç normal müşteriden sonra gelir */
  R.early = await p.evaluate(() => BT.specState());
  ok(R.early.spec && R.early.spec.length === 2 && R.early.sp === 0 && !R.early.active.length, 'gün başında özel müşteri çıktı');
  let firstSeenAt = null;
  for (let i = 0; i < 60 && !firstSeenAt; i++) {
    await p.evaluate(() => BT.counters[0].spawnT = Math.min(BT.counters[0].spawnT, 0.2)); await feed(); await sleep(500);
    const st = await p.evaluate(() => BT.specState());
    if (st.sp >= 1) firstSeenAt = st;
  }
  R.first = firstSeenAt;
  ok(firstSeenAt && firstSeenAt.normals >= 3 && firstSeenAt.active.some(a => a.startsWith(firstSeenAt.spec[0])), '1. özel müşteri gelmedi / erken geldi ' + JSON.stringify(firstSeenAt));
  R.inQueue = await p.evaluate(() => { const cu = BT.customers.find(c => c.spec); return !!cu && BT.counters.some(c => c.slots.indexOf(cu) >= 0); });
  ok(R.inQueue, '1. özel müşteri kuyrukta değil');
  /* 2) kapanışa yakın bildirim → 2. özel müşteri */
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN - 41.5; }); await sleep(600);
  R.pop = await p.evaluate(() => ({ vis: !document.getElementById('specPop').classList.contains('hidden'), t: document.getElementById('specPop').textContent, paused: BT.paused(), st: BT.specState() }));
  ok(R.pop.vis && /Özel bir müşteri geliyor\.\.\./.test(R.pop.t) && !R.pop.paused, 'bildirim yok ' + JSON.stringify(R.pop));
  ok(!R.pop.st.active.some(a => a.startsWith(R.pop.st.spec[1] + ':')), '2. özel müşteri bildirimden önce geldi');
  await sleep(3400); await feed();
  R.second = await p.evaluate(() => BT.specState());
  ok(R.second.sp === 3 && R.second.active.some(a => a.startsWith(R.second.spec[1] + ':')), '2. özel müşteri gelmedi ' + JSON.stringify(R.second));
  /* 3) kapanış 2. özel müşteriyi bekler; o gidince gün kapanır */
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN; }); await sleep(400);
  R.closing = await p.evaluate(() => ({ phase: BT.day.phase, st: BT.specState() }));
  let closed = false;
  for (let i = 0; i < 80 && !closed; i++) { await feed(); await sleep(500); closed = await p.evaluate(() => BT.day.phase === 'summary'); }
  R.card = await p.evaluate(() => document.getElementById('dayRows').textContent);
  ok(closed, 'gün kapanmadı');
  ok(/Özel müşteriler/.test(R.card), 'gün kartında özel müşteriler yok ' + R.card);
  /* 4) ertesi gün yeni ikili seçilir, dünküler tekrar gelmez */
  const prev = R.second.spec;
  await p.click('#dayGo'); await sleep(500);
  await p.evaluate(() => { for (const id of ['prepGo', 'stallGo']) { const e = document.getElementById(id); if (e && e.offsetParent) e.click(); } });
  R.next = await p.evaluate(() => BT.specState());
  ok(R.next.spec && R.next.sp === 0 && R.next.spec.every(id => prev.indexOf(id) < 0), 'yeni gün seçimi yanlış ' + JSON.stringify({ prev, n: R.next }));
  R.met = await p.evaluate(() => BT.S.met.length);
  ok(R.met >= 2, 'tanışılanlar kaydedilmedi');
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'SPEC_FAIL ' + JSON.stringify(fail) : 'SPEC_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
