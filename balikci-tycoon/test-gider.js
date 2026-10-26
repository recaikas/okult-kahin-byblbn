/* v2.25 — işletme gideri: Sv3'e dek yok, sonra Sv başına %4 (en çok %30); gün kartında satır ve net hesabına dahil */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], fail = [], ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  const R = await p.evaluate(() => {
    const out = {};
    out.r0 = BT.opex.rate();
    BT.S.rep = 1e7; BT.S.lvFloor = 99; out.rMax = BT.opex.rate();
    BT.S.cash = 50000; const e = BT.opex.dayEnd(100000); out.e = e; out.cash = BT.S.cash;
    BT.S.cash = 1000; const e2 = BT.opex.dayEnd(100000); out.e2 = e2; out.cash2 = BT.S.cash;
    return out;
  });
  ok(R.r0 === 0, 'başlangıçta gider olmamalı ' + R.r0);
  ok(Math.abs(R.rMax - 0.28) < 1e-9, 'Sv10 payı %28 değil ' + R.rMax);
  ok(R.e && R.e.v === 28000 && R.e.paid === 28000 && R.cash === 22000, 'kesinti yanlış ' + JSON.stringify(R));
  ok(R.e2 && R.e2.paid === 1000 && R.cash2 === 0, 'kasa 0 altına inmemeli ' + JSON.stringify(R));
  /* gün sonu kartı: satır + net = gelir − tüm giderler */
  await p.evaluate(() => { BT.S.rep = 1e7; BT.S.lvFloor = 99; BT.S.cash = 1e6; BT.day.phase = 'play'; BT.day.st.inc = 100000; document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); BT.endDay(); });
  for (let i = 0; i < 90; i++) { if (await p.evaluate(() => !!BT.day.last && BT.day.phase === 'summary')) break; await p.evaluate(() => { BT.customers.forEach(c => { c.pat = 0; }); }); await sleep(1000); }
  await sleep(1500);
  const C = await p.evaluate(() => { const L = BT.day.last; const rows = [...document.querySelectorAll('#dayRows .row, .row')].map(r => r.textContent); return { opex: L.opex, inc: L.inc, rows: rows.filter(t => /İşletme|Running|Net/.test(t)) }; });
  ok(C.opex && C.opex.p === 28, 'gün sonu gideri yok ' + JSON.stringify(C));
  ok(C.rows.some(t => /İşletme|Running/.test(t)), 'kartta satır yok ' + JSON.stringify(C.rows));
  console.log(JSON.stringify({ R, C }));
  if (errs.length) fail.push('hatalar: ' + errs.join(' | '));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: işletme gideri testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
