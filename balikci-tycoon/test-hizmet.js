/* v1.4 — hizmet binaları 9 → 5.
   1) katalogda yalnız Buzhane, Restoran, Nakliye, Kooperatif, Mezat var; 5 parsel, her biri beşini de alır;
   2) Kooperatif yükseltmeleri ucuzlatır (eski Tamirhane), Mezat kuyruğu uzatır + Toptancı açar (eski Toptancı Hanı),
      Buzhane tezgâh kapasitesini artırır;
   3) Restoran pasif para basmaz: fazla yoksa boş bekler, depo %60'tan doluysa ya da tezgâh %75'ten doluysa fazlayı
      pişirip satar;
   4) eski kayıt: kaldırılan binalar birleştiği binaya seviye olarak geçer, kalan harcama iade edilir; sayfa hatası yok. */
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

  const A = await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.tut = 99; S.rep = 260;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters();
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (s && !s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 150);
    const ids = BT.SERV.map(d => d.id).sort().join(',');
    const allowAll = BT.PLOTS.every(q => q.allow.length === 5);
    const c0 = BT.counters[0], cap0 = BT.counterMax(c0), q0 = BT.queueMax(0), up0 = BT.upCost(1000);
    BT.servBuild('buzhane', BT.PLOTS[0].id); for (let i = 0; i < 4; i++) BT.servUp('buzhane');
    BT.servBuild('koop', BT.PLOTS[1].id); for (let i = 0; i < 4; i++) BT.servUp('koop');
    BT.servBuild('mezat', BT.PLOTS[2].id); for (let i = 0; i < 2; i++) BT.servUp('mezat');
    return { ids, allowAll, n: BT.PLOTS.length, cap0, cap1: BT.counterMax(c0), q0, q1: BT.queueMax(0), up0, up1: BT.upCost(1000),
      toptanci: BT.CUST.some(t => t.id === 'toptanci') };
  });
  ok(A.ids === 'buzhane,koop,mezat,nakliye,restoran', 'katalog yanlış ' + A.ids);
  ok(A.n === 5 && A.allowAll, 'parseller yanlış ' + JSON.stringify(A));
  ok(A.cap1 === A.cap0 + 8, 'Buzhane tezgâh kapasitesi +8 değil ' + JSON.stringify(A));
  ok(A.up1 === 900, 'Kooperatif Sv.5 yükseltmeyi %10 ucuzlatmadı ' + JSON.stringify(A));
  ok(A.q1 === Math.min(7, A.q0 + 2), 'Mezat Sv.3 kuyruğu +2 uzatmadı ' + JSON.stringify(A));

  /* Restoran: fazla yokken boş, fazla varken pişirir */
  const R = await p.evaluate(async () => {
    const S = BT.S, D = BT.DEPOT; D.lvl = 1; D.shelf = {};
    BT.counters.forEach(c => { c.buffer.length = 0; });
    BT.servBuild('restoran', BT.PLOTS[3].id);
    const st = BT.serv().restoran; st.cons = 0;
    const cash0 = S.cash; st.nextT = 0; await new Promise(r => setTimeout(r, 700));
    const idle = { d: S.cash - cash0, cooked: st.cooked };
    const cap = BT.DEPOT_LV[0].cap; D.shelf['fileto|hamsi'] = Math.ceil(cap * 0.8);
    const c0 = BT.counters[0]; while (c0.buffer.length < BT.counterMax(c0)) c0.buffer.push({ k: 'fileto', f: c0.fish });
    const dep0 = D.shelf['fileto|hamsi'], buf0 = c0.buffer.length, cash1 = S.cash;
    st.nextT = 0; await new Promise(r => setTimeout(r, 700));
    return { idle, cooked: st.cooked, gain: S.cash - cash1, depUsed: dep0 - (D.shelf['fileto|hamsi'] || 0), bufUsed: buf0 - c0.buffer.length };
  });
  ok(R.idle.d === 0 && R.idle.cooked === 0, 'Restoran fazla yokken para bastı ' + JSON.stringify(R));
  ok(R.cooked === 2 && R.gain > 0 && R.depUsed + R.bufUsed === 2, 'Restoran fazlayı pişirmedi ' + JSON.stringify(R));

  /* Eski kayıt göçü */
  const G = await p.evaluate(async () => {
    const d = BT.buildSave();
    d.serv = [['tamirhane', 3, 'p1'], ['hal', 2, 'p3'], ['yakit', 1, 'p5'], ['tersane', 2, 'p6'], ['koop', 1, 'p8'], ['buzhane', 2, 'p9']];
    d.cash = 5000;
    BT.loadFrom(d); const c0 = 5000;
    await new Promise(r => setTimeout(r, 1700));
    const sv = BT.serv(), out = {};
    for (const k in sv) out[k] = [sv[k].lvl, sv[k].plot];
    return { out, refund: BT.S.cash - c0, plotsOK: Object.keys(out).every(k => BT.PLOTS.some(q => q.id === out[k][1] && q.b === k)), toast: document.body.innerText.includes('iade') };
  });
  ok(!G.out.tamirhane && !G.out.hal && !G.out.yakit && !G.out.tersane, 'kaldırılan bina hâlâ var ' + JSON.stringify(G));
  ok(G.out.koop && G.out.koop[0] === 3 && G.out.mezat && G.out.mezat[0] === 2 && G.out.buzhane && G.out.buzhane[0] === 2, 'birleşme seviyeleri yanlış ' + JSON.stringify(G));
  ok(G.refund === 80000, 'iade 80.000 değil ' + JSON.stringify(G));
  ok(G.plotsOK, 'göçte parsel ataması bozuk ' + JSON.stringify(G));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ A, R, G }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: hizmet binaları testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
