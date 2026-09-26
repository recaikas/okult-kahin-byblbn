/* v1.3.3 — 1) özel müşteri okunabilir: selamı bitmeden sipariş alınmaz (stok hazır olsa bile), konuşurken sabrı
   azalmaz, normal müşteriden yavaş gelir ve yavaş gider, veda cümlesi ayrılırken görünür.
   2) füme talebi oranlı: makineli tezgâhta füme siparişi ~%20, Fümehane'de ~%30 — VIP ağırlıklı havuzda bile
   füme, fileto siparişlerinin yarısını geçmez. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);

  /* ---- 2) füme oranı ---- */
  const F = await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.rep = 260; S.fumeM = [1, 1, 0]; S.tut = 99;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    const vip = BT.CUST.find(t => t.id === 'vip'), out = {};
    BT.counters.forEach(c => {
      if (!c.fish || !BT.stallFume(c)) return;
      const run = (types) => { c.oN = 0; c.fN = 0; let f = 0, n = 0; for (let i = 0; i < 600; i++) { const o = BT.makeOrderFor(c, types[i % types.length]); if (!o) continue; n++; if (o.k === 'fume') f++; } return n ? +(f / n).toFixed(3) : null; };
      out[c.key] = { z: c.z, mixed: run(BT.CUST.filter(t => t.tag !== 'fume' || BT.stallFume(c))), vipOnly: run([vip]) };
    });
    return out;
  });
  const keys = Object.keys(F);
  ok(keys.length >= 3, 'füme yapabilen tezgâh bulunamadı ' + JSON.stringify(F));
  for (const k of keys) {
    const r = F[k], home = r.z === 2, cap = home ? 0.34 : 0.23;
    ok(r.mixed !== null && r.mixed <= cap && r.mixed >= 0.08, k + ' füme payı yanlış ' + JSON.stringify(r));
    ok(r.vipOnly !== null && r.vipOnly <= cap + 0.01, k + ' VIP ile füme payı tavanı aşıyor ' + JSON.stringify(r));
    ok(r.mixed / (1 - r.mixed) <= 0.5 + 1e-6, k + ' füme, filetonun yarısını geçiyor ' + JSON.stringify(r));
  }

  /* ---- 1) özel müşteri okunabilir ---- */
  const setup = await p.evaluate(() => {
    BT.customers.length = 0; BT.counters.forEach(c => { c.slots.fill(null); c.spawnT = 999; });
    const c = BT.counters[0]; c.buffer.length = 0; for (let i = 0; i < 20; i++) c.buffer.push({ k: 'fileto', f: c.fish });
    BT.day.spec = [BT.SPECIALS.find(s => s.fav === c.fish).id, BT.day.spec[1]];
    const okS = BT.spawnSpecial(0), cu = BT.customers.find(q => q.spec);
    /* aynı yerden bir normal müşteri: kıyas için */
    return { okS, fish: c.fish, dur: cu ? BT.specHiDur(cu) : 0, start: cu ? [cu.x, cu.y] : null };
  });
  ok(setup.okS, 'özel müşteri doğmadı');
  ok(setup.dur >= 4 && setup.dur <= 9, 'söz süresi aralık dışında ' + setup.dur);
  /* yürüyüş: özel müşteri normalden yavaş */
  const speeds = await p.evaluate(async () => {
    const cu = BT.customers.find(q => q.spec), x0 = cu.x, y0 = cu.y;
    await new Promise(r => setTimeout(r, 1000));
    return { spec: Math.hypot(cu.x - x0, cu.y - y0), state: cu.state };
  });
  ok(speeds.spec > 0.6 && speeds.spec < 1.7, 'özel müşteri yürüyüş hızı ~1.3 değil ' + JSON.stringify(speeds));
  /* varış → konuşma: stok hazır olduğu hâlde sipariş alınmaz, sabrı azalmaz */
  let arrived = false;
  for (let i = 0; i < 40 && !arrived; i++) { await sleep(500); arrived = await p.evaluate(() => { const cu = BT.customers.find(q => q.spec); return cu && cu.state === 'wait'; }); }
  ok(arrived, 'özel müşteri tezgâha varmadı');
  const talk = await p.evaluate(() => { const cu = BT.customers.find(q => q.spec); return { got: cu.ord.got, pat: cu.pat, talking: BT.specTalking(cu), sayT: cu.sayT }; });
  await sleep(Math.max(0, (setup.dur - 1.2) * 1000));
  const talk2 = await p.evaluate(() => { const cu = BT.customers.find(q => q.spec); return cu ? { got: cu.ord.got, pat: cu.pat, talking: BT.specTalking(cu), state: cu.state, sayT: cu.sayT } : null; });
  ok(talk.talking && talk2 && talk2.talking && talk2.got === 0, 'söz bitmeden sipariş alındı ' + JSON.stringify({ talk, talk2 }));
  ok(talk2 && Math.abs(talk2.pat - talk.pat) < 0.05, 'konuşurken sabır azaldı ' + JSON.stringify({ talk, talk2 }));
  /* söz bitti → servis edilir ve ağır ağır ayrılır */
  let served = null;
  for (let i = 0; i < 40 && !served; i++) { await sleep(500); served = await p.evaluate(() => { const cu = BT.customers.find(q => q.spec); return cu && cu.state === 'leave' ? { y: cu.y, happy: cu.happyLeave } : null; }); }
  ok(served && served.happy, 'söz bittikten sonra servis edilmedi');
  if (served) {
    await sleep(1000);
    const y2 = await p.evaluate(() => { const cu = BT.customers.find(q => q.spec); return cu ? { y: cu.y, bye: cu.byeT } : null; });
    ok(y2 && y2.y - served.y < 2.4 && y2.y - served.y > 0.8, 'ayrılış hızı yavaş değil ' + JSON.stringify({ served, y2 }));
  }
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ F, setup, speeds, talk, talk2, served }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: okuma + füme oranı testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
