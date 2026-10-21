/* v2.21-deneme — serbest gezintide engeller: oyuncu kurulu binaların, tezgâhların, istasyonların, masaların ve süslerin
   içinden geçemez; ama her etkileşim noktasına (ağ, sandık, masa, hasır, tezgâh, tepsi, kasa, çöp, depo kapısı, ofis,
   lokanta dolap/pass/masa/kasa/bulaşık/istasyon) yürüyerek ulaşabilir.
   1) her şey kurulu limanda başlangıçtan taşkın doldurma (0,1 karo ızgara): bütün etkileşim çemberlerinde ulaşılan bir hücre var
   2) bir binaya doğru yürüyen oyuncu duvarda durur (içine girmez); engelin içinde kalmış oyuncu dışarı çıkabilir
   3) personel eski yollarıyla yürür (engel listesi yalnız oyuncuya)
   Kullanım: URL=http://localhost:8106/index.html node test-engel.js */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
(async () => {
  const b = await chromium.launch();
  const errs = [], fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.HK_LOK_OFF = 0; window.HK_LOK_EVOFF = 1; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = 0; window.HK_INSAAT_OFF = 1; });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900);

  /* her şey kurulu, kalabalık liman */
  const built = await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 1e7; S.rep = 900; BT.achMute(true);
    BT.areas.forEach(a => { a.locked = false; a.lvl = Math.max(a.lvl, 3); }); BT.rebuildCounters();
    BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; });
    const bl = ['cay', 'buz', 'buz', 'cay', 'buz', 'buz', 'cay']; BT.slots.forEach((s, i) => { s.b = bl[i % bl.length]; });
    BT.decor.forEach(d => { d.got = true; });
    BT.project.done = true; BT.project.stage = 5;
    BT.HUT.lvl = 5; BT.DEPOT.lvl = 5; BT.WHALL.built = true; S.adLv = 1;
    BT.SERV.forEach(d => { try { BT.servBuild(d.id); } catch (e) { } });
    const M = BT.M(); if (M) M.office = true;
    const L = BT.lok, q = BT.tarif.q();
    BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
    ['tava', 'izgara', 'tencere', 'firin'].forEach(k => L.buy('lok_' + k));
    for (let i = 0; i < 4; i++) { L.buy('lok_lv'); L.buy('lok_tb'); }
    ['lok_ter', 'lok_mez', 'lok_saz', 'lok_dol'].forEach(id => L.buy(id));
    BT.lok.R.arr = 1e9; BT.customers.length = 0; BT.day.phase = 'play'; BT.day.t = 10;
    return { lok: L.open(), tbl: L.tbl(), plots: BT.PLOTS.filter(q => q.b).length, blocks: BT.playerBlocks().length };
  });
  ok(built.lok && built.tbl === 12 && built.blocks > 60, 'dolu liman kuruldu: ' + JSON.stringify(built));

  /* 1) taşkın doldurma: başlangıçtan ulaşılabilen hücreler; her etkileşim çemberinde en az bir hücre */
  const reach = await p.evaluate(() => {
    const free = HKG.v('canStandFree'), blk = BT.inPlayerBlock, G = 0.1, D = BT.dbg();
    const X0 = -0.3, Y0 = -0.3, NX = Math.ceil((D.landX + 0.3) / G), NY = Math.ceil((D.landY + 0.3) / G);
    const open = (i, j) => { const x = X0 + i * G, y = Y0 + j * G; return free(x, y) && !blk(x, y); };
    const seen = new Uint8Array(NX * NY), st = [];
    const si = Math.round((4.5 - X0) / G), sj = Math.round((3.2 - Y0) / G);
    const startOpen = open(si, sj);
    seen[sj * NX + si] = 1; st.push(si, sj);
    while (st.length) {
      const j = st.pop(), i = st.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => {
        const ni = i + a, nj = j + c; if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) return;
        const k = nj * NX + ni; if (seen[k]) return;
        if (!open(ni, nj)) { seen[k] = 2; return; }
        seen[k] = 1; st.push(ni, nj);
      });
    }
    const can = (x, y, r) => {                       /* çember içinde ulaşılan hücre var mı (yarıçapın %90'ı) */
      const rr = r * 0.9;
      for (let j = Math.floor((y - rr - Y0) / G); j <= Math.ceil((y + rr - Y0) / G); j++)
        for (let i = Math.floor((x - rr - X0) / G); i <= Math.ceil((x + rr - X0) / G); i++) {
          if (i < 0 || j < 0 || i >= NX || j >= NY || seen[j * NX + i] !== 1) continue;
          const cx = X0 + i * G, cy = Y0 + j * G; if ((cx - x) ** 2 + (cy - y) ** 2 < rr * rr) return true;
        }
      return false;
    };
    const P = [], add = (id, x, y, r2) => P.push({ id, x, y, r: Math.sqrt(r2) });
    BT.emek.nets().forEach((s, i) => { add('ağ' + i, s.x, s.y + 0.9, 1.6); add('sandık' + i, s.bx, s.by, 0.8); });
    BT.tables.forEach((t, i) => { add('masa' + i, t.x, t.y, 1.6); add('hasır' + i, t.mat.x, t.mat.y, 1.5); });
    add('füme', BT.smoker.x, BT.smoker.y, 1.6); add('füme hasırı', BT.smoker.mat.x, BT.smoker.mat.y, 1.5);
    add('mutfak', BT.kitchen.x, BT.kitchen.y, 1.6); add('mutfak hasırı', BT.kitchen.mat.x, BT.kitchen.mat.y, 1.5);
    BT.counters.forEach(c => { add('tezgâh ' + c.key, c.x, c.y, 1.8); add('tepsi ' + c.key, c.tray.x, c.tray.y, 1.5); });
    add('kasa', BT.safe.x, BT.safe.y, 1.8);
    BT.BINS.forEach((q, i) => add('çöp' + i, q.x, q.y, 0.85));
    add('depo kapısı', BT.DEPOT.door.x, BT.DEPOT.door.y, 1.44);
    add('ofis', BT.office.x, BT.office.y, 3.4);
    const LK = HKG.v('LOK'), LT = HKG.v('LOK_T'), LS = HKG.v('LOK_ST');
    ['dolap', 'pass', 'kasa', 'sink'].forEach(k => add('lokanta ' + k, LK[k].sx, LK[k].sy, 1.0));
    LT.forEach(t => add('lokanta masa' + t.i, t.sx, t.sy, 0.85));
    Object.keys(LS).forEach(k => add('lokanta ' + k, LS[k].sx, LS[k].sy, 1.0));
    const miss = P.filter(q => !can(q.x, q.y, q.r)).map(q => q.id + '@' + q.x.toFixed(2) + ',' + q.y.toFixed(2));
    let n = 0; for (let k = 0; k < seen.length; k++) if (seen[k] === 1) n++;
    return { startOpen, cells: n, pts: P.length, miss };
  });
  ok(reach.startOpen, 'başlangıç noktası engelde');
  ok(reach.cells > 20000, 'ulaşılan alan çok küçük: ' + reach.cells);
  ok(!reach.miss.length, 'ulaşılamayan etkileşim noktaları: ' + reach.miss.join(' | '));

  /* 2) binaya doğru yürüyen oyuncu duvarda durur; engelin içindeki oyuncu dışarı çıkabilir */
  const wall = await p.evaluate(() => {
    const P = BT.player, K = BT.emek.keys, D = BT.DEPOT, o = {};
    let inN = 0;                                                              /* yürüyüş boyunca engelin içinde geçen adım */
    const walk = (tx, ty, n) => { inN = 0; for (let i = 0; i < n; i++) { ['w', 'a', 's', 'd'].forEach(k => K[k] = false); const dx = tx - P.x, dy = ty - P.y, u = dx + dy, v = dx - dy; if (Math.abs(u) > 0.08) K[u > 0 ? 's' : 'w'] = true; if (Math.abs(v) > 0.08) K[v > 0 ? 'd' : 'a'] = true; BT.emek.step(0.05); if (BT.inPlayerBlock(P.x, P.y)) inN++; } ['w', 'a', 's', 'd'].forEach(k => K[k] = false); };
    P.carry.length = 0; P.x = D.door.x; P.y = D.door.y + 0.6;
    walk(D.x, D.y, 80);
    o.depot = { p: [+P.x.toFixed(2), +P.y.toFixed(2)], inside: BT.inPlayerBlock(P.x, P.y), y1: +(D.y + D.h / 2).toFixed(2) };
    P.x = D.x; P.y = D.y;                                                     /* içinde kalmış (eski kayıt / yeni bina) */
    walk(D.door.x, D.door.y + 1, 80);
    o.out = { p: [+P.x.toFixed(2), +P.y.toFixed(2)], inside: BT.inPlayerBlock(P.x, P.y) };
    const c = BT.counters[0]; P.x = c.x - 2.2; P.y = c.y;                    /* tezgâhın içinden geçmeye çalış: kenarından kayarak dolaşır */
    walk(c.x + 2.2, c.y, 160);
    o.ctr = { p: [+P.x.toFixed(2), +P.y.toFixed(2)], inN: inN, past: P.x > c.x + 0.58 };
    const H = HKG.v('lokHouseR')(), A = BT.areas[4];                           /* lokanta duvarları (ev seviyeyle büyür) */
    P.x = (H.x0 + H.x1) / 2; P.y = H.y1 + 3; walk(P.x, A.y1 + 3, 120);
    o.terSouth = { p: [+P.x.toFixed(2), +P.y.toFixed(2)], y1: A.y1 };
    P.x = (H.x0 + H.x1) / 2; P.y = H.y0 - 1.5; walk(P.x, H.y1 - 0.5, 100);
    o.houseBack = { p: [+P.x.toFixed(2), +P.y.toFixed(2)], y0: H.y0, lv: H.lv };
    const sc = HKG.v('scenery').filter(d => d.x > H.x0 && d.x < H.x1 && d.y > H.y0 && d.y < H.y1 && !HKG.v('sceneryOnDeck')(d)).length;
    o.sceneryIn = sc;                                                         /* evin altında çizilen manzara kalmamalı */
    return o;
  });
  ok(wall.terSouth.p[1] < wall.terSouth.y1, 'oyuncu teras güney duvarını aştı: ' + JSON.stringify(wall.terSouth));
  ok(wall.houseBack.p[1] < wall.houseBack.y0 && wall.houseBack.lv === 5, 'oyuncu lokantaya arka duvardan girdi: ' + JSON.stringify(wall.houseBack));
  ok(wall.sceneryIn === 0, 'lokanta evinin altında manzara çiziliyor: ' + wall.sceneryIn);
  ok(!wall.depot.inside && wall.depot.p[1] >= wall.depot.y1 - 0.05, 'oyuncu depoya girdi: ' + JSON.stringify(wall.depot));
  ok(!wall.out.inside, 'engelin içindeki oyuncu dışarı çıkamadı: ' + JSON.stringify(wall.out));
  ok(wall.ctr.inN === 0 && wall.ctr.past, 'oyuncu tezgâhın içinden geçti ya da etrafından dolaşamadı: ' + JSON.stringify(wall.ctr));

  /* 3) personel engel listesinden etkilenmez (eski canStand) */
  const crew = await p.evaluate(() => { const D = BT.DEPOT; return { player: BT.canStandFor(BT.player, D.x, D.y), staff: BT.canStandFor({ isPlayer: false }, 4.5, 3.2) }; });
  ok(!crew.player && crew.staff, 'engel yalnız oyuncuya: ' + JSON.stringify(crew));

  await b.close();
  if (!process.env.QUIET) console.log(JSON.stringify({ built, reach: { startOpen: reach.startOpen, cells: reach.cells, pts: reach.pts, miss: reach.miss }, wall, crew, errs }, null, 1));
  console.log(fail.length || errs.length ? 'ENGEL_FAIL ' + JSON.stringify(fail.concat(errs)) : 'ENGEL_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
