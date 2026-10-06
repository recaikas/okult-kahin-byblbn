/* v2.9 — mekanikli özel müşteriler + yeni tipler:
   seçim kuralları (seviye, sıra, zincir, yalnız-zincir), aura, horon, veresiye, acele, cimri, kısmi teslim,
   eleştirmen, kaptan, gizli müfettiş, hatıra süsü, canlı yayın, itibar tavanı, plakçı, yeni tipler. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  R.data = await p.evaluate(() => {
    const L = BT.SPECIALS, mx = L.filter(s => s.mech);
    const bad = L.filter(s => !(s.me && s.me.tr && s.me.en && s.hi.tr && s.hi.en && s.bye.tr && s.bye.en && s.job.tr && s.job.en)).map(s => s.id);
    const types = ['evhanimi', 'gencanne', 'bisiklet', 'garson', 'kopekli', 'hemsire'].filter(id => BT.CUST.some(t => t.id === id && t.tod && t.note && t.note.en));
    return { n: L.length, mx: mx.length, mechs: [...new Set(mx.map(s => s.mech))].length, bad, types: types.length };
  });
  ok(R.data.n === 69 && R.data.mx === 19 && R.data.mechs >= 17 && !R.data.bad.length && R.data.types === 6, 'veri eksik ' + JSON.stringify(R.data));
  /* seçim kuralları */
  R.pick = await p.evaluate(() => {
    const S = BT.S, o = { minLv: 0, only: 0, eve0: 0, day1: 0 };
    for (let k = 0; k < 300; k++) {
      S.specLast = {}; BT.day.spec = []; BT.pickSpecials();
      const [a, b2] = BT.day.spec.map(id => BT.SPECIALS.find(s => s.id === id));
      if ((a.minLv || 0) > BT.repLevel() || (b2.minLv || 0) > BT.repLevel()) o.minLv++;
      if (a.only || b2.only) o.only++;
      if (a.slot === 'eve') o.eve0++;
      if (b2.slot === 'day') o.day1++;
    }
    return o;
  });
  ok(!R.pick.minLv && !R.pick.only && !R.pick.eve0 && !R.pick.day1, 'seçim kuralı bozuk ' + JSON.stringify(R.pick));
  /* yardımcı: özel müşteriyi doğrudan tezgâha koy */
  const setup = `
    window.__sp = (id) => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; BT.day.phase = 'play';
      BT.customers.length = 0; BT.counters.forEach(c => { c.slots.fill(null); c.spawnT = 999; });
      BT.day.spec = [id, id];
      const okS = BT.spawnSpecial(0); const cu = BT.customers.find(q => q.spec === id);
      if (cu) { cu.state = 'wait'; cu.sayT = 99; cu.x = BT.counters[0].x; }
      return cu;
    };`;
  await p.evaluate(setup);
  R.m = await p.evaluate(async () => {
    const S = BT.S, o = {}; S.rep = 999; S.cash = 1000;
    /* zincir */
    let cu = __sp('mert'); BT.finishOrder(cu.c, cu); o.force = BT.mx().force; BT.pickSpecials(); o.chain = BT.day.spec[0];
    /* aura */
    cu = __sp('reisdede'); const c = cu.c; const n = { type: BT.CUST[0], c, state: 'wait', spec: null, pat: 50, patMax: 50, slot: 1, ord: { k: 'fileto', f: c.fish, need: 1, got: 0 } };
    o.aura = BT.custDrain(n);
    /* horon */
    BT.specArrive(cu); cu.spec = 'horon'; BT.specArrive(cu); o.horon = [Math.round(BT.mx().horonT), BT.custDrain(n)];
    await new Promise(r => setTimeout(r, 200));
    /* veresiye */
    const tr0 = cu.c.tray.items.length;
    cu = __sp('kazim'); const cash0 = S.cash; const trA = cu.c.tray.items.length; BT.finishOrder(cu.c, cu);
    o.credit = { tray: cu.c.tray.items.length - trA, owed: BT.mx().st.owed };
    BT.mxNewDay(); o.credit.paid = S.cash - cash0;
    /* acele */
    cu = __sp('aylin'); cu.waitT = 5; let t0 = cu.c.tray.items.reduce((a, b) => a + b.v, 0); BT.finishOrder(cu.c, cu); const fast = cu.c.tray.items.reduce((a, b) => a + b.v, 0) - t0;
    cu = __sp('aylin'); cu.waitT = 60; t0 = cu.c.tray.items.reduce((a, b) => a + b.v, 0); cu.ord.need = BT.customers[0].ord.need; BT.finishOrder(cu.c, cu); const slow = cu.c.tray.items.reduce((a, b) => a + b.v, 0) - t0;
    o.rush = [Math.round(fast), Math.round(slow)];
    /* kısmi teslim */
    cu = __sp('sevim'); const lost0 = S.lost; cu.ord.got = 5; cu.pat = 0.001; t0 = cu.c.tray.items.reduce((a, b) => a + b.v, 0);
    await new Promise(r => setTimeout(r, 300));
    o.partial = { lost: S.lost - lost0, paid: Math.round(cu.c.tray.items.reduce((a, b) => a + b.v, 0) - t0) };
    /* eleştirmen */
    cu = __sp('sedef'); cu.pat = cu.patMax; BT.finishOrder(cu.c, cu); o.review = BT.mx().st.rv;
    /* kaptan */
    cu = __sp('nuri'); BT.finishOrder(cu.c, cu); o.fc = BT.mx().st.fc;
    /* hatıra */
    const got0 = BT.decor.filter(d => d.got).length; cu = __sp('gurbetci'); BT.finishOrder(cu.c, cu); o.souv = BT.decor.filter(d => d.got).length - got0;
    /* müfettiş: gizli, deftere raporla girer */
    cu = __sp('mufettis'); o.inspMet0 = S.met.indexOf('mufettis') >= 0; o.inspIntro = cu.intro; BT.finishOrder(cu.c, cu);
    BT.day.st.lost = 0; BT.day.st.served = 10; const c1 = S.cash; const rp = BT.mxInspect(); o.insp = { good: rp && rp.good, cash: S.cash - c1, met: S.met.indexOf('mufettis') >= 0 };
    /* canlı yayın + tavan */
    BT.mxNewDay(); const r0 = S.rep; cu = __sp('muhabir'); BT.specArrive(cu);
    for (let k = 0; k < 12; k++) { const q = __sp('caner'); BT.specArrive(q); q.c.slots.fill(null); BT.finishOrder(q.c, q); BT.specArrive(cu); }
    o.live = BT.mx().mxRep;
    /* yeni tip yorgunluğu */
    o.nurse = BT.custDrain({ type: BT.CUST.find(t => t.id === 'hemsire'), c, state: 'wait' });
    return o;
  });
  const m = R.m;
  ok(m.force === 'huseyin' && m.chain === 'huseyin', 'zincir çalışmadı ' + JSON.stringify([m.force, m.chain]));
  ok(Math.abs(m.aura - 0.5) < 0.01, 'Reis Dede aurası yok ' + m.aura);
  ok(m.horon[0] === 15 && m.horon[1] === 0, 'horon sabrı dondurmadı ' + m.horon);
  ok(m.credit.tray === 0 && m.credit.owed > 0 && m.credit.paid === m.credit.owed, 'veresiye yanlış ' + JSON.stringify(m.credit));
  ok(m.rush[0] > m.rush[1] * 2, 'acele bonusu yok ' + m.rush);
  ok(m.partial.lost === 0 && m.partial.paid > 0, 'kısmi teslim ödenmedi ' + JSON.stringify(m.partial));
  ok(m.review && Math.abs(m.review.m - 1.15) < 0.01, 'eleştirmen etkisi yok ' + JSON.stringify(m.review));
  ok(m.fc && m.fc.ev >= 0, 'kaptan tahmini yok');
  ok(m.souv === 1, 'hatıra süs verilmedi ' + m.souv);
  ok(!m.inspMet0 && !m.inspIntro && m.insp.good && m.insp.cash > 0 && m.insp.met, 'müfettiş yanlış ' + JSON.stringify(m));
  ok(m.live > 0 && m.live <= 6, 'canlı yayın/tavan yanlış ' + m.live);
  ok(Math.abs(m.nurse - 0.7) < 0.01, 'hemşire yorgunluğu yok ' + m.nurse);
  /* kayıt */
  R.save = await p.evaluate(() => { BT.S.mx.owed = 77; BT.S.specForce = 'huseyin'; const d = BT.buildSave(); BT.loadFrom(JSON.parse(JSON.stringify(d))); return [BT.S.mx.owed, BT.S.specForce]; });
  ok(R.save[0] === 77 && R.save[1] === 'huseyin', 'kayıt yanlış ' + R.save);
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'MEKANIK_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: mekanikli müşteri testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
