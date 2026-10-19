/* v2.15 — Alp Er Tunga nöbette: hikâyenin 6. gününden önce yok, sonra limanda; o gün hikâye ziyaretçisiyse ikinci kez çizilmez */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], fail = [], ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  const R = await p.evaluate(async () => {
    const on = HKG.v('guardOn'), w = ms => new Promise(r => setTimeout(r, ms)), o = {};
    BT.storySet({ step: 5 }); o.s5 = on();
    BT.storySet({ step: 6 }); o.s6 = on(); await w(400);
    BT.storySet({ step: 12 }); o.s12 = on(); await w(400);
    o.canStand = BT.canStand(HKG.v('GUARD').x, HKG.v('GUARD').y);
    return o;
  });
  ok(!R.s5 && R.s6 && R.s12, 'nöbet görünürlüğü yanlış ' + JSON.stringify(R));
  ok(!R.canStand, 'bekçi yürüme alanında duruyor');
  /* v2.18-deneme: replik ~60 sn'de bir, sıra kayıtla korunur, ziyaretçi + nöbetçi aynı anda yok */
  const A = await p.evaluate(() => {
    const o = {}, TAXo = HKG.v('TAX'), cu = HKG.v('customers');
    BT.S.tut = 99; BT.storySet({ step: 6 });
    BT.player.x = 12.4; BT.player.y = 4.5;                       /* nöbetçiye ~3.6 karo */
    const a = () => BT.alp().st; a().t = 0; a().idx = -1; a().sayT = 99;
    BT.emek.step(0.5, 100); o.at50 = a().idx;                    /* 50 sn: henüz yok */
    BT.emek.step(0.5, 22); o.at65 = a().idx; o.sayNow = a().sayT < 4; o.lines = BT.alp().lines.length;   /* ~60 sn: çıktı */
    BT.emek.step(0.5, 12); o.gone = a().sayT >= 4;               /* balon ~4 sn */
    /* uzaktayken ve vergi memuru varken söylemez */
    const i0 = a().idx; BT.player.x = 2; BT.player.y = 20; a().t = 0; BT.emek.step(0.5, 140); o.far = a().idx === i0;
    BT.player.x = 12.4; BT.player.y = 4.5; a().t = 0; TAXo.on = true; for (let i = 0; i < 140; i++) BT.alpTick(0.5); TAXo.on = false; o.tax = a().idx === i0;
    /* sıra: 60'lık permütasyon, tekrarsız, kayıtla korunur, bitince yeniden karışır */
    BT.S.alpOrd = null; BT.S.alpI = 0;
    const first = []; for (let i = 0; i < 60; i++) first.push(BT.alpNext());
    o.perm = first.slice().sort((x, y) => x - y).every((v, i) => v === i); o.distinct = new Set(first).size;
    o.notId = first.some((v, i) => v !== i);                      /* karıştırılmış */
    const ord0 = BT.S.alpOrd.slice(); o.idx60 = BT.S.alpI;
    const nx = BT.alpNext(); o.reshuf = BT.S.alpI === 1 && BT.S.alpOrd.slice().sort((x, y) => x - y).every((v, i) => v === i) && nx !== first[59];
    const sv = JSON.parse(JSON.stringify(BT.buildSave())); const ord1 = BT.S.alpOrd.slice(), i1 = BT.S.alpI;
    BT.S.alpOrd = null; BT.S.alpI = 0; BT.loadFrom(sv);
    o.kept = JSON.stringify(BT.S.alpOrd) === JSON.stringify(ord1) && BT.S.alpI === i1;
    BT.storySet({ step: 6 });
    /* ziyaretçi sahnedeyken (ya da giderken) nöbetçi çizilmez */
    const on = HKG.v('guardOn'); o.noVis = on();
    cu.push({ spec: 'st_a', state: 'leave' }); o.withVis = on(); o.vis = BT.alp().vis; cu.pop(); o.after = on();
    return o;
  });
  ok(!(A.at50 >= 0) && A.at65 >= 0 && A.at65 < A.lines && A.sayNow && A.gone, 'replik ~60 sn zamanlaması ' + JSON.stringify(A));
  ok(A.far && A.tax, 'uzakta / vergi memuru varken söyledi ' + JSON.stringify(A));
  ok(A.perm && A.distinct === 60 && A.notId && A.idx60 === 60 && A.reshuf, 'söz sırası permütasyon / yeniden karıştırma ' + JSON.stringify(A));
  ok(A.kept, 'söz sırası kayıtla korunmadı ' + JSON.stringify(A));
  ok(A.noVis && !A.withVis && A.vis && A.after, 'ziyaretçi + nöbetçi aynı anda ' + JSON.stringify(A));
  R.A = A;
  await b.close();
  console.log(JSON.stringify({ R, errs }));
  console.log(fail.length || errs.length ? 'BEKCI_FAIL ' + JSON.stringify(fail) : 'BEKCI_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
