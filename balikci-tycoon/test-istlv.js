/* v2.22-ist — İSTASYON SEVİYELERİ (ağ, kesim masası, tezgâh, kasa tepsisi + Fümehane, Füme Makinesi, Mutfak ocağı), Sv1→5:
   etki değerleri (raf, kâr, kasa, toplama hızı, kesim hızı, hasır, ağ hızı, ağ stoğu, tütme, kapasite), fiyat/para, YÜKSELT kartları (TR/EN),
   kayıt/yükleme, eski kayıt (smkLv → Fümehane Sv), Bölüm 1 sayaçları (areas/pads) değişmez. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8123/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => { const S = BT.S; S.ctrl = 2; S.rep = 400; S.cash = 1e9; S.tut = 99; BT.areas.forEach(a => { a.locked = false; a.lvl = 1; }); S.fumeM = [1, 1, 0]; BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true)); });

  const STEPS = [0, 0, 1, 2, 3, 6];
  /* 1) etki değerleri Sv1→5 */
  const eff = await p.evaluate(() => {
    const out = {}, st = BT.st, rd = () => [0, 1, 2, 3].reduce((o, z) => {
      const c = BT.counters.find(q => q.z === z && q.open);
      o[z] = { nm: BT.st.areaNetMul(z), as: BT.st.areaStock(z), pc: BT.st.pileCap(BT.tables[z]), mx: c ? BT.counterMax(c) : 0, tc: c ? BT.st.trayCap(c) : 0, pf: c ? st.profit(c) : 0, cc: c ? st.crateCap(c) : 0,
        sn: st.spd(z, 'net'), st: st.spd(z, 'tbl'), sy: st.spd(z, 'tray'), sf: st.spd(z, 'fm'), sk: st.spd(z, 'kit') };
      return o;
    }, {});
    out.base = rd(); out.smkBase = [BT.smoker.max, st.smokerMax(), st.smokeBoost()];
    out.lv = [];
    for (let lv = 2; lv <= 5; lv++) {
      for (let z = 0; z < 4; z++) st.KINDS.forEach(k => st.buy(z, k));
      out.lv[lv] = { r: rd(), smk: [st.smokerMax(), st.smokeBoost()], lvl: st.lv(0, 'net'), lvSmk: st.lv(2, 'smk'), lvFm0: st.lv(0, 'fm'), lvFm2: st.lv(2, 'fm'), lvKit: st.lv(3, 'kit'), lvKit0: st.lv(0, 'kit') };
    }
    out.maxBuy = st.buy(0, 'net');
    return out;
  });
  const B = eff.base;
  for (let lv = 2; lv <= 5; lv++) {
    const n = STEPS[lv], E = eff.lv[lv].r;
    for (let z = 0; z < 4; z++) {
      const w = z + ' Sv' + lv;
      ok(near(E[z].nm / B[z].nm, 1 + 0.1 * n), 'ağ hızı ' + w + ' ' + E[z].nm / B[z].nm);
      ok(E[z].as - B[z].as === n, 'ağ stoğu ' + w + ' ' + (E[z].as - B[z].as));
      ok(E[z].pc - B[z].pc === n, 'hasır ' + w + ' ' + (E[z].pc - B[z].pc));
      ok(near(E[z].st, 1 + 0.1 * n), 'kesim hızı ' + w + ' ' + E[z].st);
      ok(E[z].mx - B[z].mx === n, 'raf ' + w + ' ' + (E[z].mx - B[z].mx));
      ok(near(E[z].pf, 0.03 * n), 'kâr ' + w + ' ' + E[z].pf);
      ok(Math.abs(E[z].tc / B[z].tc - (1 + 0.1 * n)) < 0.01, 'kasa kapasite ' + w + ' ' + E[z].tc / B[z].tc);
      ok(near(E[z].sy, 1 + 0.04 * n), 'toplama hızı ' + w + ' ' + E[z].sy);
      if (z < 2) { ok(E[z].cc - E[z].mx === n, 'füme kasası ' + w + ' ' + (E[z].cc - E[z].mx)); ok(near(E[z].sf, 1 + 0.1 * n), 'füme makinesi hız ' + w); }
      else ok(E[z].cc - E[z].mx === 0 && near(E[z].sf, 1), 'makinesiz bölgede füme makinesi etkisi olmamalı z' + z);
    }
    ok(near(E[3].sk, 1 + 0.1 * n), 'mutfak pişirme hızı Sv' + lv + ' ' + E[3].sk);
    ok(near(E[0].sk, 1), 'mutfak etkisi başka bölgede olmamalı');
    ok(eff.lv[lv].smk[0] - eff.smkBase[0] === n && near(eff.lv[lv].smk[1], 1 + 0.1 * n), 'Fümehane Sv' + lv + ' ' + JSON.stringify(eff.lv[lv].smk));
  }
  ok(eff.smkBase[0] === 8 && eff.smkBase[2] === 1, 'Fümehane Sv1 taban ' + JSON.stringify(eff.smkBase));
  ok(eff.maxBuy === false, 'Sv5 üstüne alınabildi');
  ok(eff.lv[5].lvSmk === 5 && eff.lv[5].lvFm0 === 5 && eff.lv[5].lvFm2 === 1 && eff.lv[5].lvKit === 5 && eff.lv[5].lvKit0 === 1, 'uygulanabilir olmayan istasyon yükselmemeli ' + JSON.stringify(eff.lv[5]));

  /* 2) kâr gerçekten satış gelirine yansıyor (aynı müşteri, Sv1 ve Sv5) */
  const pay = await p.evaluate(async () => {
    BT.S.tut = 99; BT.day.phase = 'play'; BT.day.t = 10;
    for (let i = 0; i < 80 && !BT.customers.some(c => !c.spec && c.c && c.c.fish); i++) await new Promise(r => setTimeout(r, 150));
    const cu = BT.customers.find(c => !c.spec && c.c && c.c.fish); if (!cu) return { none: 1 };
    const c = cu.c, z = c.z, tv = () => c.tray.items.reduce((s, i) => s + i.v, 0), res = {};
    const keep = BT.S.stLv[z] && BT.S.stLv[z].ctr;
    const run = lv => { BT.S.stLv[z].ctr = lv; c.tray.items.length = 0; cu.ord.got = cu.ord.need; cu.state = 'wait'; const t0 = tv(); BT.finishOrder(c, cu); return tv() - t0; };
    res.p1 = run(1); res.p5 = run(5); BT.S.stLv[z].ctr = keep; return res;
  });
  ok(pay.none || (pay.p1 > 0 && Math.abs(pay.p5 / pay.p1 - 1.18) < 0.03), 'Sv5 satış geliri +%18 değil ' + JSON.stringify(pay));

  /* 3) Fümehane tütme süresi (gerçek zaman): Sv1 ~3,2 sn → Sv5 ~2,0 sn */
  const smkT = await p.evaluate(async () => {
    const t1 = async () => { BT.smoker.inn.length = 0; BT.smoker.cur = null; BT.smoker.t = 0; BT.smoker.mat.items.length = 0; BT.smoker.inn.push({ k: 'fileto', f: 'levrek' });
      const t0 = performance.now(); while (!BT.smoker.mat.items.length && performance.now() - t0 < 8000) await new Promise(r => setTimeout(r, 30)); return (performance.now() - t0) / 1000; };
    const t5 = await t1(); BT.S.stLv[2].smk = 1; const t1v = await t1(); BT.S.stLv[2].smk = 5; return { t1v, t5 };
  });
  ok(smkT.t1v > 2.9 && smkT.t1v < 3.9 && smkT.t5 > 1.8 && smkT.t5 < 2.5 && smkT.t5 < smkT.t1v * 0.7, 'tütme süresi ' + JSON.stringify(smkT));

  /* 4) fiyat tablosu + gerçek satın alma (para düşer, parasızsa alınmaz) */
  const prices = await p.evaluate(() => {
    BT.S.stLv = {}; const st = BT.st, t = {};
    for (let z = 0; z < 4; z++) st.KINDS.forEach(k => { const row = []; for (let lv = 1; lv < 5; lv++) row.push(st.price(z, k, lv)); t[z + k] = row; });
    return t;
  });
  const rows = Object.entries(prices);
  for (const [k, r] of rows) for (let i = 1; i < 4; i++) ok(Math.abs(r[i] / r[i - 1] - 2.2) < 0.06, 'fiyat oranı ×2,2 değil ' + k + ' ' + r);
  console.log('FİYAT (Sv1→2, 2→3, 3→4, 4→5; emekçi/indirimsiz taban):\n' + Object.entries(prices).map(([k, r]) => '  z' + k + ': ' + r.join(' / ')).join('\n'));

  /* 5) YAPI › Yükseltme kartları (bölge bölge; TR/EN), satın alma, Sv5 "Son seviye" — v2.23: YÜKSELT'te artık yok */
  const open = async (z = 1) => { await p.evaluate(() => { document.getElementById('dpClose') && document.getElementById('dpClose').click(); }); await sleep(150); await p.click('.dtab[data-t="build"]'); await sleep(200); await p.click('#dpSub button[data-s="up"]'); await sleep(150); await p.click('#dpZone button[data-z="' + z + '"]'); await sleep(300); };
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map((d, i) => ({ i, t: (d.querySelector('b') || {}).textContent || '', s: (d.querySelector('small') || {}).textContent || '', btn: (d.querySelector('.buy') || {}).textContent || '', cls: (d.querySelector('.buy') || {}).className || '' })));
  await p.evaluate(() => { BT.S.stLv = {}; BT.S.cash = 1e9; });
  let sc = [], c, perZ = [];
  for (let z = 0; z < 4; z++) { await open(z); c = await cards(); const q = c.filter(x => /\d\/5$/.test(x.t.trim())); perZ.push(q.length); q.forEach(x => (x.z = z)); sc = sc.concat(q); }
  ok(sc.length === 4 * 4 + 1 + 2 + 1, 'istasyon kartı sayısı ' + sc.length + ' ' + JSON.stringify(sc.map(x => x.t)));
  ok(JSON.stringify(perZ) === '[5,5,5,5]', 'bölge başına kart ' + perZ);   /* z0: 4+Füme Mk, z1: 4+Füme Mk, z2: 4+Fümehane, z3: 4+Ocak */
  ok(sc.every(x => !/Balıkçı İskelesi|Balık Pazarı|Fümehane •|Balıkçı Mutfağı/.test(x.t.replace(/^Fümehane\s+\d.*/, ''))), 'bölge öneki var');
  await p.evaluate(() => BT.setLang('tr'));
  const lvl = await p.evaluate(() => { document.getElementById('dpClose').click(); document.querySelector('.dtab[data-t="level"]').click(); return [...document.querySelectorAll('#dpCards .dcard b')].map(b => b.textContent).filter(t => /\d\/5$/.test(t.trim())).length; });
  ok(lvl === 0, 'YÜKSELT sekmesinde istasyon kartı kaldı ' + lvl);
  await open(1); c = await cards();
  const ctr1 = c.find(x => /^Tezgâh/.test(x.t.trim()));
  ok(ctr1 && /1\/5/.test(ctr1.t) && /Raf \+1 · kâr \+%3/.test(ctr1.s) && /Sv\.2/.test(ctr1.s), 'tezgâh kartı ' + JSON.stringify(ctr1));
  ok(sc.some(x => /^Fümehane\s+1\/5/.test(x.t.trim())) && sc.some(x => /Füme Makinesi/.test(x.t)) && sc.some(x => /Aşçı Ocağı/.test(x.t)), 'Fümehane/Makine/Ocak kartları');
  const exp1 = await p.evaluate(() => BT.st.cost(1, 'ctr'));
  ok(ctr1 && ctr1.btn.replace(/\D/g, '') == String(exp1), 'tezgâh kart fiyatı ' + ctr1.btn + ' beklenen ' + exp1);
  const cash0 = await p.evaluate(() => BT.S.cash);
  await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), ctr1.i); await sleep(150);
  await p.evaluate(() => { const bb = document.querySelector('#dpCards .buy.cf'); if (bb) bb.click(); }); await sleep(250);
  const af = await p.evaluate(() => ({ lv: BT.st.lv(1, 'ctr'), cash: BT.S.cash }));
  ok(af.lv === 2 && cash0 - af.cash === exp1, 'kart satın alma ' + JSON.stringify({ af, cash0, exp1 }));
  /* parasız */
  await p.evaluate(() => { BT.S.cash = 5; }); await open(1); c = await cards();
  const pz = c.find(x => /^Ağ/.test(x.t.trim()));
  await p.evaluate(i => { document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(); document.querySelectorAll('#dpCards .buy.cf').forEach(bb => bb.click()); }, pz.i); await sleep(200);
  ok(await p.evaluate(() => BT.st.lv(1, 'net')) === 1 && /no/.test(pz.cls), 'parasız satın alındı');
  /* Sv5: Son seviye */
  await p.evaluate(() => { for (let i = 0; i < 4; i++) BT.st.buy(1, 'ctr'); BT.S.cash = 1e9; }); await open(1); c = await cards();
  const mx = c.find(x => /^Tezgâh/.test(x.t.trim()));
  ok(mx && /5\/5/.test(mx.t) && /Son seviye/.test(mx.btn) && /Raf \+6 · kâr \+%18/.test(mx.s), 'Sv5 kartı ' + JSON.stringify(mx));
  /* mobil taşma */
  const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, cw: [...document.querySelectorAll('#dpCards .dcard')].every(d => d.getBoundingClientRect().width <= innerWidth - 20) }));
  ok(ov.sw <= ov.iw + 1 && ov.cw, 'mobil taşma ' + JSON.stringify(ov));
  /* EN */
  await p.evaluate(() => BT.setLang('en')); await open(1); c = await cards();
  const en = c.find(x => /^Net/.test(x.t.trim()));
  ok(en && /Net speed \+10% · stock \+1/.test(en.s) && /Lv\.2/.test(en.s), 'EN kart ' + JSON.stringify(en));
  const enm = c.find(x => /^Stall/.test(x.t.trim()));
  ok(enm && /Max level/.test(enm.btn) && /Shelf \+6 · profit \+18%/.test(enm.s), 'EN Sv5 ' + JSON.stringify(enm));
  await p.evaluate(() => BT.setLang('tr'));

  /* 6) kayıt/yükleme + eski kayıt + Bölüm 1 sayaçları */
  const sv = await p.evaluate(() => {
    BT.S.stLv = {}; const st = BT.st; for (let i = 0; i < 4; i++) { st.buy(0, 'net'); st.buy(2, 'smk'); } st.buy(3, 'kit'); st.buy(1, 'fm'); st.buy(1, 'fm'); st.buy(0, 'tray');
    const d = BT.buildSave(), before = JSON.stringify([d.areas, d.pads]);
    BT.S.stLv = {}; BT.loadFrom(d);
    const r1 = [st.lv(0, 'net'), st.lv(2, 'smk'), st.lv(3, 'kit'), st.lv(1, 'fm'), st.lv(0, 'tray'), st.lv(1, 'ctr')];
    const d2 = BT.buildSave(), same = JSON.stringify([d2.areas, d2.pads]) === before;
    const old = JSON.parse(JSON.stringify(d)); delete old.stlv; old.smkLv = 2; BT.S.stLv = {}; BT.loadFrom(old);
    const r2 = [st.lv(2, 'smk'), st.lv(0, 'net'), st.lv(0, 'tbl')];
    const old0 = JSON.parse(JSON.stringify(d)); delete old0.stlv; delete old0.smkLv; BT.S.stLv = { 0: { net: 4 } }; BT.loadFrom(old0);
    const r3 = [st.lv(0, 'net'), st.lv(2, 'smk')];
    BT.S.stLv = {}; const dn = BT.buildSave();
    return { r1, same, r2, r3, hasKey: 'stlv' in d, noKey: dn.stlv === undefined };
  });
  ok(JSON.stringify(sv.r1) === '[5,5,2,3,2,1]' && sv.same, 'kayıt/yükleme ' + JSON.stringify(sv));
  ok(JSON.stringify(sv.r2) === '[3,1,1]', 'eski kayıt smkLv 2 → Sv3 ' + JSON.stringify(sv.r2));
  ok(JSON.stringify(sv.r3) === '[1,1]' && sv.noKey, 'stlv/smkLv olmayan kayıt Sv1 ' + JSON.stringify(sv));

  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ pay, smkT, sv }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: istasyon seviyeleri testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
