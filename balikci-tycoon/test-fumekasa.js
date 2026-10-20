/* v2.18-deneme — FÜME KASASI (füme satan tezgâhta fileto rafı ve füme kasası AYRI sayılır):
   Kök neden: Emekçi Mod hamalı (hamalJob) tezgâhı yalnız TOPLAM doluluk %30'un altındayken doldururdu; bir tür rafı
   %30'un üstüne çıkarınca öbür türü bekleyen müşteri için hiç taşıma başlamaz, kuyrukta birikirdi (kilitlenme).
   a) füme satan tezgâhta fileto rafı doluyken füme konabilir (oyuncu da, hamal da); füme satmayan tezgâh eskisi gibi
   b) kilitlenme senaryosu: raf bir türle %30'un üstünde dolu + öbür türü isteyen müşteri → hamal getirir
      + 5 oyun dakikası benzetim: bekleyen müşteri ortalaması / kaçan sayısı (Emekçi Mod, 3 bölge)
   c) Füme Makinesi: fileto rafından füme kasasına geçer; kasa doluysa tütmeyi bekler
   d) kayıt/yükleme: karışık dizi korunur, eski kayıt güvenli, tür başına sınır
   e) çizim: kasa nesnesi + ekran görüntüsü (390x844)
   Kullanım: URL=http://localhost:8107/index.html node test-fumekasa.js [görüntü klasörü] */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8107/index.html';
const SHOT = process.argv[2] || '';
if (SHOT) fs.mkdirSync(SHOT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  const page = async () => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { window.HK_EMEK_OFF = 0; });          /* test-offline kapatıyor: Emekçi Mod açık (canlı oyun gibi) */
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo');
    await p.click('#autoOpts button[data-m="10"]'); await sleep(700);
    /* ortak kurulum: bölge 0-2 açık (seviye 1), bölge 3 kapalı, Füme Makinesi Balık Pazarı'nda, tezgâhlar açık, müşteri gelmez */
    await p.evaluate(() => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; S.rep = 400; S.cash = 1e7; S.fumeM = [0, 1, 0]; BT.achMute(true);
      BT.areas.forEach((a, i) => { a.locked = i >= 3; a.lvl = 1; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
      BT.counters.forEach(c => { c.spawnT = 1e9; c.buffer.length = 0; c.tray.items.length = 0; c.slots.fill(null); });
      BT.customers.length = 0; BT.workers.length = 0; BT.player.carry.length = 0; BT.day.t = 10;
    });
    return p;
  };
  const clean = p => p.evaluate(() => {      /* sahneyi sıfırla (aynı sayfada yeni senaryo) */
    BT.areas.forEach((a, i) => { a.locked = i >= 3; a.lvl = 1; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    BT.counters.forEach(c => { c.spawnT = 1e9; c.buffer.length = 0; c.tray.items.length = 0; c.slots.fill(null); c.eatT = 0; c.fmT = 0; });
    BT.customers.length = 0; BT.workers.length = 0; BT.player.carry.length = 0; BT.day.t = 10; BT.S.cash = 1e7;
    BT.smoker.inn.length = 0; BT.smoker.mat.items.length = 0; BT.smoker.cur = null; BT.smoker.t = 0;
    BT.tables.forEach(t => { t.inn.length = 0; t.mat.items.length = 0; t.cur = null; t.worker = null; });
    BT.spots.forEach(s => { s.stock.length = 0; });
  });
  /* bekleyen müşteri ekle (normal tip, çok sabırlı) */
  const CUST = `(c, k, need, slot) => { const o = { k: k, f: c.fish, need: need, got: 0 }; const cu = { x: c.x + 2, y: c.y + 0.1 + slot, z: 0, bob: 0, face: -1, type: BT.CUST[0], ord: o, state: 'wait', slot: slot, c: c, pat: 9999, patMax: 9999, mood: 1, hair: 0, tone: 0 }; BT.customers.push(cu); c.slots[slot] = cu; return cu; }`;

  const p = await page();

  /* ================= a) ayrı sayım ================= */
  R.a = await p.evaluate(() => {
    const by = k => BT.counters.find(c => c.key === k), o = {};
    const c0 = by('b0'), c1 = by('b1'), c2 = by('b2');
    o.has = [c0, c1, c2].map(c => BT.crate.has(c));
    [c0, c1, c2].forEach((c, i) => {
      const cap = BT.counterMax(c); c.buffer.length = 0;
      for (let k = 0; k < cap; k++) c.buffer.push({ k: 'fileto', f: c.fish });
      o['canF' + i] = BT.crate.can(c, { k: 'fileto', f: c.fish }); o['canM' + i] = BT.crate.can(c, { k: 'fume', f: c.fish });
      o['room' + i] = BT.crate.room(c, { k: 'fume', f: c.fish });
      c.buffer.length = 0;
    });
    /* oyuncu: Fümehane tezgâhında fileto rafı DOLU, elinde füme → kasaya girer */
    const cap2 = BT.counterMax(c2);
    for (let k = 0; k < cap2; k++) c2.buffer.push({ k: 'fileto', f: c2.fish });
    BT.player.x = c2.x - 0.5; BT.player.y = c2.y - 0.6; BT.player.carry.length = 0;
    for (let k = 0; k < 3; k++) BT.player.carry.push({ k: 'fume', f: c2.fish });
    BT.S.ctrl = 2;
    for (let i = 0; i < 80; i++) BT.emek.step(0.05);
    o.playerCrate = BT.crate.crateN(c2); o.playerShelf = BT.crate.shelfN(c2); o.playerLeft = BT.player.carry.length;
    /* aynı tezgâha 2 fileto daha → raf dolu, alınmaz */
    BT.player.carry.length = 0; for (let k = 0; k < 2; k++) BT.player.carry.push({ k: 'fileto', f: c2.fish });
    for (let i = 0; i < 60; i++) BT.emek.step(0.05);
    o.shelfStill = BT.crate.shelfN(c2); o.fileLeft = BT.player.carry.length;
    /* füme kasası da dolunca füme alınmaz, ama fileto yine ayrı */
    BT.player.carry.length = 0; c2.buffer.length = 0;
    for (let k = 0; k < cap2; k++) c2.buffer.push({ k: 'fume', f: c2.fish });
    BT.player.carry.push({ k: 'fume', f: c2.fish }); BT.player.carry.push({ k: 'fileto', f: c2.fish });
    for (let i = 0; i < 80; i++) BT.emek.step(0.05);
    o.crateFull = BT.crate.crateN(c2); o.shelfAfter = BT.crate.shelfN(c2); o.carryAfter = BT.player.carry.map(i => i.k).join();
    o.cap = cap2; o.spot = BT.crate.spot(c2);
    return o;
  });
  ok(R.a.has.join() === 'false,true,true', 'füme kasası yalnız füme satan tezgâhta olmalı ' + R.a.has);
  ok(!R.a.canF0 && !R.a.canM0, 'füme satmayan tezgâh dolunca hiçbir şey almamalı (eski davranış) ' + JSON.stringify(R.a));
  ok(!R.a.canF1 && R.a.canM1 && R.a.room1 === R.a.cap, 'Balık Pazarı (makineli): fileto rafı dolu, füme konabilmeli ' + JSON.stringify(R.a));
  ok(!R.a.canF2 && R.a.canM2, 'Fümehane: fileto rafı dolu, füme konabilmeli ' + JSON.stringify(R.a));
  ok(R.a.playerCrate === 3 && R.a.playerShelf === R.a.cap && R.a.playerLeft === 0, 'oyuncu füme kasasına koymalı ' + JSON.stringify(R.a));
  ok(R.a.shelfStill === R.a.cap && R.a.fileLeft === 2, 'dolu fileto rafına fileto girmemeli ' + JSON.stringify(R.a));
  ok(R.a.crateFull === R.a.cap && R.a.shelfAfter === 1 && R.a.carryAfter === 'fume', 'füme kasası doluyken füme girmez, fileto rafa girer ' + JSON.stringify(R.a));

  /* ================= b) kilitlenme: hamal öbür türü getirir ================= */
  const scen = (kind) => p.evaluate(async ({ kind, CUST }) => {
    const mk = eval(CUST), c = BT.counters.find(q => q.key === 'b2'), z = c.z, o = { kind };
    BT.workers.length = 0; BT.hire('hamal', true, z);
    const cap = BT.counterMax(c);
    if (kind === 'fume') {                        /* raf fileto ile %50 dolu, fümeyi bekleyen müşteri; füme Fümehane hasırında hazır */
      for (let k = 0; k < Math.round(cap * 0.5); k++) c.buffer.push({ k: 'fileto', f: c.fish });
      for (let k = 0; k < 6; k++) BT.smoker.mat.items.push({ k: 'fume', f: c.fish });
      o.cu = mk(c, 'fume', 2, 0);
    } else {                                      /* kasa füme ile %40 dolu, filetoyu bekleyen müşteri; fileto masa hasırında hazır */
      for (let k = 0; k < Math.round(cap * 0.4); k++) c.buffer.push({ k: 'fume', f: c.fish });
      for (let k = 0; k < 8; k++) BT.tables[z].mat.items.push({ k: 'fileto', f: c.fish });
      for (let k = 0; k < 8; k++) BT.smoker.inn.push({ k: 'fileto', f: c.fish });          /* bant dolu: hasırdaki filetoyu çekmesin */
      for (let k = 0; k < 12; k++) BT.smoker.mat.items.push({ k: 'fume', f: c.fish });     /* tüten dursun */
      o.cu = mk(c, 'fileto', 2, 0);
    }
    const cu = o.cu; o.t = -1;
    for (let i = 0; i < 20 * 120; i++) {           /* en çok 120 oyun sn */
      BT.emek.step(0.05); BT.day.t = Math.min(BT.day.t, 100);
      if (cu.ord.got >= cu.ord.need || cu.state === 'leave') { o.t = +(i * 0.05).toFixed(1); break; }
    }
    o.got = cu.ord.got; o.state = cu.state; delete o.cu;
    return o;
  }, { kind, CUST });
  await clean(p); R.bF = await scen('fume');
  await clean(p); R.bT = await scen('fileto');
  ok(R.bF.got === 2 && R.bF.t > 0 && R.bF.t < 60, 'raf fileto ile doluyken füme isteyen müşteri 60 sn içinde servis edilmeli ' + JSON.stringify(R.bF));
  ok(R.bT.got === 2 && R.bT.t > 0 && R.bT.t < 60, 'kasa füme ile doluyken fileto isteyen müşteri 60 sn içinde servis edilmeli ' + JSON.stringify(R.bT));

  /* ---- 5 oyun dakikası benzetim (Emekçi Mod, 3 bölge, her bölgede Tezgâhtar+Balıkçı+Filetocu+Hamal) ---- */
  const simRun = (lvl) => p.evaluate(async (lvl) => {
    const S = BT.S;
    BT.areas.forEach((a, i) => { a.locked = i >= 3; a.lvl = lvl; });
    BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    ['tezgahtar', 'balikci', 'filetocu', 'hamal'].forEach(r => { for (let z = 0; z < 3; z++) if (BT.zoneFree(z) > 0) BT.hire(r, true, z); });
    BT.counters.forEach(c => { c.spawnT = 3; });
    const vis = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
    const lost0 = S.lost, served0 = S.served, open = BT.counters.filter(c => !BT.areas[c.z].locked && c.fish);
    let wSum = 0, ns = 0, maxW = 0, stuck = 0;
    for (let i = 0; i < 6000; i++) {                // 300 oyun sn = 5 dk
      ['dayScr', 'prepScr', 'stallScr', 'emekScr'].forEach(id => { if (vis(id)) { const g = document.getElementById({ dayScr: 'dayGo', prepScr: 'prepGo', stallScr: 'stallGo', emekScr: 'emekGo' }[id]); g && g.click(); } });
      BT.day.t = Math.min(BT.day.t, 100);
      BT.emek.step(0.05);
      if (i % 20 === 5) BT.counters.forEach(c => { c.tray.items.length = 0; });     /* tahsildar yerine */
      if (i % 20 === 0) {
        const w = open.reduce((a, c) => a + c.slots.filter(q => q && q.state !== 'leave').length, 0);
        wSum += w; ns++; maxW = Math.max(maxW, w);
        /* kilitlenme göstergesi: rafta karşılığı olmayan sipariş var, ama malı bölgenin hasırında hazır */
        open.forEach(c => { const um = BT.crate.unmet(c, null); if (um > 0) { const t = BT.tables[c.z]; const have = (t ? t.mat.items.length : 0) + (c.z === BT.smoker.z ? BT.smoker.mat.items.length : 0); if (have > 0) stuck++; } });
      }
    }
    return { avgWait: +(wSum / ns).toFixed(2), maxW, lost: S.lost - lost0, served: S.served - served0, unmetWithStockSec: stuck };
  }, lvl);
  await clean(p); R.sim3 = await simRun(3);
  await clean(p); R.sim5 = await simRun(5);
  ok(R.sim3.lost <= 6 && R.sim5.lost <= 6, '5 dk benzetimde kaçan müşteri çok ' + JSON.stringify([R.sim3, R.sim5]));
  ok(R.sim3.served >= 60 && R.sim5.served >= 100, '5 dk benzetimde satış çok az ' + JSON.stringify([R.sim3, R.sim5]));
  ok(R.sim3.avgWait < 7 && R.sim5.avgWait < 7, 'bekleyen müşteri ortalaması çok yüksek ' + JSON.stringify([R.sim3, R.sim5]));

  /* ================= c) Füme Makinesi: fileto rafından füme kasasına ================= */
  await clean(p);
  R.c = await p.evaluate(async (CUST) => {
    const mk = eval(CUST), c = BT.counters.find(q => q.key === 'b1'), o = {};
    c.eatT = 1e9;                                  /* müşteri alışveriş yapmasın: yalnız dönüşümü gör */
    for (let k = 0; k < 12; k++) c.buffer.push({ k: 'fileto', f: c.fish });
    mk(c, 'fume', 3, 0);
    for (let i = 0; i < 20 * 25; i++) BT.emek.step(0.05);
    o.crate = BT.crate.crateN(c); o.shelf = BT.crate.shelfN(c); o.total = c.buffer.length;
    /* kasa dolu + kasada olmayan yüksek talep: tütmeyi bekler (rafın filetosu eksilmez) */
    BT.customers.length = 0; c.slots.fill(null); c.buffer.length = 0;
    const cap = BT.counterMax(c);
    for (let k = 0; k < cap; k++) c.buffer.push({ k: 'fume', f: c.fish });
    for (let k = 0; k < 6; k++) c.buffer.push({ k: 'fileto', f: c.fish });
    mk(c, 'fume', cap + 5, 0);
    for (let i = 0; i < 20 * 15; i++) BT.emek.step(0.05);
    o.fullCrate = BT.crate.crateN(c); o.fullShelf = BT.crate.shelfN(c); o.fullOn = c.fmOn; o.cap = cap;
    return o;
  }, CUST);
  ok(R.c.crate === 3 && R.c.shelf === 9 && R.c.total === 12, 'Makine: 3 fileto füme kasasına geçmeli (raf 12→9, kasa 3) ' + JSON.stringify(R.c));
  ok(R.c.fullCrate === R.c.cap && R.c.fullShelf === 6 && !R.c.fullOn, 'Makine: kasa doluysa tütmeyi bekler, raf eksilmez ' + JSON.stringify(R.c));

  /* ================= d) kayıt / yükleme ================= */
  await clean(p);
  R.d = await p.evaluate(() => {
    const by = k => BT.counters.find(c => c.key === k), c1 = by('b1'), c2 = by('b2'), o = {};
    const fill = (c, nf, nm) => { c.buffer.length = 0; for (let k = 0; k < Math.max(nf, nm); k++) { if (k < nf) c.buffer.push({ k: 'fileto', f: c.fish }); if (k < nm) c.buffer.push({ k: 'fume', f: c.fish }); } };
    const cnt = c => [BT.crate.shelfN(c), BT.crate.crateN(c)];
    const cap = BT.counterMax(c2);
    fill(c2, 12, 7); fill(c1, 5, 4);
    const sv = JSON.parse(JSON.stringify(BT.buildSave()));
    o.saved = sv.q.filter(e => e[0] === 'b1' || e[0] === 'b2').map(e => [e[0], e[1].length]);
    fill(c2, 0, 0); fill(c1, 0, 0);
    o.loadOK = BT.loadFrom(sv);
    o.c2 = cnt(by('b2')); o.c1 = cnt(by('b1'));
    /* her iki bölme de sınırda: toplam 2×cap, kayıp yok */
    fill(by('b2'), cap, cap);
    const sv2 = JSON.parse(JSON.stringify(BT.buildSave())); fill(by('b2'), 0, 0); BT.loadFrom(sv2);
    o.full = cnt(by('b2'));
    /* eski kayıt: karışık dizi, toplam ≤ cap → olduğu gibi yüklenir; tür sınırını aşan fazlalık kırpılır */
    const old = JSON.parse(JSON.stringify(sv2)); const e = old.q.find(q => q[0] === 'b2');
    e[1] = []; for (let k = 0; k < 14; k++) e[1].push('fileto|' + by('b2').fish); for (let k = 0; k < cap - 14; k++) e[1].push('fume|' + by('b2').fish);
    BT.loadFrom(old); o.old = cnt(by('b2'));
    const over = JSON.parse(JSON.stringify(sv2)); const e2 = over.q.find(q => q[0] === 'b2');
    e2[1] = []; for (let k = 0; k < cap + 6; k++) e2[1].push('fileto|' + by('b2').fish);
    BT.loadFrom(over); o.over = cnt(by('b2'));
    const nq = JSON.parse(JSON.stringify(sv2)); delete nq.q; o.noQ = BT.loadFrom(nq);       /* q yok: tezgâhlar boş başlar */
    o.cap = cap;
    return o;
  });
  ok(R.d.loadOK !== false, 'loadFrom başarısız');
  ok(R.d.c2.join() === '12,7' && R.d.c1.join() === '5,4', 'kayıt/yükleme: raf ve kasa adedi korunmalı ' + JSON.stringify(R.d));
  ok(R.d.full.join() === R.d.cap + ',' + R.d.cap, 'iki bölme de dolu kayıt kaybolmamalı ' + JSON.stringify(R.d));
  ok(R.d.old.join() === '14,' + (R.d.cap - 14), 'eski (karışık, toplam ≤ cap) kayıt aynen yüklenmeli ' + JSON.stringify(R.d));
  ok(R.d.over.join() === R.d.cap + ',0', 'bölme başına sınırı aşan fazlalık kırpılmalı ' + JSON.stringify(R.d));

  /* ================= e) çizim ================= */
  await clean(p);
  R.e = await p.evaluate(async () => {
    const by = k => BT.counters.find(c => c.key === k), c1 = by('b1'), c2 = by('b2'), o = {};
    for (let k = 0; k < 9; k++) c1.buffer.push({ k: 'fileto', f: c1.fish });
    for (let k = 0; k < 4; k++) c1.buffer.push({ k: 'fume', f: c1.fish });
    for (let k = 0; k < 7; k++) c2.buffer.push({ k: 'fileto', f: c2.fish });
    for (let k = 0; k < 11; k++) c2.buffer.push({ k: 'fume', f: c2.fish });
    const ob = BT.crate.obj(c1); o.obj = { n: ob.n, cap: ob.cap, items: ob.items.length, x: +ob.x.toFixed(2), y: +ob.y.toFixed(2) };
    BT.S.tut = 99; BT.player.x = c1.x - 3; BT.player.y = c1.y + 4;
    BT.arr.look(c1.x + 2.2, c1.y - 1.2);
    return o;
  });
  await sleep(500);
  await p.evaluate(() => { const a = document.getElementById('achPop'); if (a) a.classList.add('hidden'); document.getElementById('lvlUp').classList.add('hidden'); document.getElementById('toast').classList.remove('on'); });
  if (SHOT) await p.screenshot({ path: SHOT + '/fumekasa-tezgah.png' });
  ok(R.e.obj.n === 4 && R.e.obj.items === 4, 'kasa nesnesi füme sayısını vermeli ' + JSON.stringify(R.e));

  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log('5 dk benzetim (Emekçi Mod): Lv3 ort. bekleyen ' + R.sim3.avgWait + ' kaçan ' + R.sim3.lost + ' satış ' + R.sim3.served + ' | Lv5 ort. bekleyen ' + R.sim5.avgWait + ' kaçan ' + R.sim5.lost + ' satış ' + R.sim5.served);
  console.log(fail.length ? 'FUMEKASA_FAIL\n - ' + fail.join('\n - ') : 'FUMEKASA_OK');
  process.exit(fail.length ? 1 : 0);
})();
