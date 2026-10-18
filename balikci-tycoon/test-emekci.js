/* v2.18-deneme — Emekçi Mod (EMEKCI_TASARIM.md §7):
   1) ağın başında durunca balıklar tek tek (~0,2 sn) sırta geçer; uzaklaşınca durur
   2) masa başında kimse yokken kesmez; oyuncu durunca keser; Filetocu varken keser
   3) tezgâh satıcısızken ≈%35 hızla satar (sabır %60 hızla azalır); oyuncu ya da Tezgâhtar varken tam hız
   4) Hamal önceliği: boşalan tezgâha önce taşır
   5) Balıkçı ağ sandığını doldurur, sandık sınırı aşılmaz
   6) usta seviyesi hız ve maaşı değiştirir, kaydedilip yüklenir
   7) Emekçi Mod kapatılınca eski davranış (kadro, fiyat, masa, tezgâh, ağ) aynı
   8) eski kayıt + Emekçi Mod: "Usta ekip hediyesi" bir kez gelir
   9) bot 10 oyun dakikası oynar (Emekçi Mod ve kapalı mod): ilk kiralama dakikası, para/itibar
   Hızlı benzetim: BT.emek.step(dt, n) oyun adımını çizimsiz koşturur.
   Kullanım: URL=http://localhost:8106/index.html node test-emekci.js [görüntü klasörü] */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
const SHOT = process.argv[2] || '';
if (SHOT) fs.mkdirSync(SHOT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  const page = async (on) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    if (on) await ctx.addInitScript(() => { window.HK_EMEK_OFF = 0; });     /* test-offline kapatıyor: bu test açar */
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
    return p;
  };
  const newGame = async (p, slot) => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="' + (slot || 1) + '"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900);
  };
  /* benzetim öncesi: eğitim/kontrol ipucu kapalı, gün başında, kimse yok */
  const calm = p => p.evaluate(() => {
    BT.S.tut = 99; BT.S.ctrl = 2; BT.day.t = 10; BT.achMute(true);
    BT.counters.forEach(c => { c.spawnT = 1e9; });
    BT.player.carry.length = 0;
  });

  /* ================= Emekçi Mod sayfası ================= */
  if (!process.env.ONLY_BOT) {
  const p = await page(true);
  await newGame(p, 1);
  R.boot = await p.evaluate(() => ({ on: BT.emek.on(), roles: BT.zoneRoles(0), cap: BT.zoneStaffCap(0), cost: BT.hireCost('tezgahtar', 0), cash: BT.S.cash, set: document.querySelector('#emekSeg .on') && document.querySelector('#emekSeg .on').dataset.e }));
  ok(R.boot.on && R.boot.roles[0] === 'tezgahtar' && R.boot.roles.indexOf('balikci') >= 0 && R.boot.cap === 4, 'emek açılış ' + JSON.stringify(R.boot));
  await calm(p);

  /* ---- 1) ağ: tek tek ---- */
  R.net = await p.evaluate(() => {
    const s = BT.spots[0], P = BT.player, st = [];
    s.stock.length = 0; for (let i = 0; i < 8; i++) s.stock.push({ k: 'fish', f: 'hamsi' });
    P.x = s.x + 0.3; P.y = s.y + 1.2;
    let t = 0, last = 0, gaps = [];
    for (let i = 0; i < 22; i++) {                     /* 1,1 sn */
      BT.emek.step(0.05); t += 0.05;
      const n = P.carry.length;
      if (n !== last) { gaps.push(+t.toFixed(2)); if (n - last > 1) st.push('çift'); last = n; }
    }
    const n1 = P.carry.length, stock1 = s.stock.length;
    P.x = 3.2; P.y = 4.4;                              /* uzaklaş (çöp kovasından da uzak) */
    BT.emek.step(0.05, 30);
    return { n1, stock1, gaps, st, n2: P.carry.length, stock2: s.stock.length };
  });
  ok(R.net.n1 >= 4 && R.net.n1 <= 6 && !R.net.st.length, 'ağ tek tek değil ' + JSON.stringify(R.net));
  ok(R.net.gaps[0] >= 0.15 && R.net.gaps[1] - R.net.gaps[0] >= 0.15 && R.net.gaps[1] - R.net.gaps[0] <= 0.26, 'çekme aralığı ~0,2 sn değil ' + JSON.stringify(R.net.gaps));
  ok(R.net.n2 === R.net.n1, 'uzaklaşınca durmadı ' + JSON.stringify(R.net));

  /* ---- 2) masa ---- */
  R.tbl = await p.evaluate(() => {
    const t = BT.tables[0], P = BT.player, o = {};
    P.carry.length = 0; t.inn.length = 0; t.cur = null; t.t = 0; t.mat.items.length = 0;
    for (let i = 0; i < 4; i++) t.inn.push({ k: 'fish', f: 'hamsi' });
    P.x = 2.6; P.y = 4.6;                                /* uzakta */
    BT.emek.step(0.05, 40);
    o.alone = { mat: t.mat.items.length, tt: +t.t.toFixed(2), cur: !!t.cur };
    P.x = t.x + 0.4; P.y = t.y + 0.5;                    /* başında */
    BT.emek.step(0.05, 40);
    o.player = t.mat.items.length + P.carry.length;      /* hasır oyuncunun da alanında: kesileni sırtlar */
    P.x = 2.6; P.y = 4.6; t.mat.items.length = 0; P.carry.length = 0;
    for (let i = 0; i < 4; i++) t.inn.push({ k: 'fish', f: 'hamsi' });
    const w = BT.hire('filetocu', true, 0);
    BT.emek.step(0.05, 120);
    o.fil = t.mat.items.length; o.filAt = Math.hypot(w.x - (t.x + 0.8), w.y - (t.y + 0.15)).toFixed(2);
    return o;
  });
  ok(R.tbl.alone.mat === 0 && R.tbl.alone.tt === 0, 'masa başında kimse yokken kesti ' + JSON.stringify(R.tbl));
  ok(R.tbl.player >= 3, 'oyuncu başındayken kesmedi ' + JSON.stringify(R.tbl));
  ok(R.tbl.fil >= 3, 'Filetocu varken kesmedi ' + JSON.stringify(R.tbl));

  /* ---- 3) tezgâh hızı ---- */
  R.ctr = await p.evaluate(() => {
    const c = BT.counters[0], P = BT.player, o = {};
    BT.workers.length = 0; BT.tables[0].worker = null;
    const mk = () => {
      BT.customers.length = 0; c.slots.fill(null); c.buffer.length = 0;
      for (let i = 0; i < 30; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
      const cu = { x: 10.8, y: c.y + 0.1, z: 0, bob: 0, face: -1, type: BT.CUST[0], ord: { k: 'fileto', f: 'hamsi', need: 40, got: 0 }, state: 'wait', slot: 0, c: c, pat: 500, patMax: 500, mood: 1, hair: 0, tone: 0 };
      c.slots[0] = cu; BT.customers.push(cu); c.eatT = 0; c.spawnT = 1e9; return cu;
    };
    let cu = mk(); P.x = 2.6; P.y = 4.6;
    BT.emek.step(0.05, 200); o.alone = cu.ord.got; o.patAlone = +(500 - cu.pat).toFixed(2);
    cu = mk(); P.x = c.x - 0.9; P.y = c.y + 0.2;
    BT.emek.step(0.05, 200); o.player = cu.ord.got; o.patPlayer = +(500 - cu.pat).toFixed(2);
    cu = mk(); P.x = 2.6; P.y = 4.6;
    const v = BT.hire('tezgahtar', true, 0);
    BT.emek.step(0.05, 80);                                /* yerine yürüsün */
    cu = mk(); BT.emek.step(0.05, 200); o.vendor = cu.ord.got; o.vAt = !!v && v.stall;
    BT.workers.length = 0;
    return o;
  });
  R.ctr.ratio = +(R.ctr.alone / Math.max(1, R.ctr.player)).toFixed(2);
  ok(R.ctr.ratio >= 0.28 && R.ctr.ratio <= 0.42, 'satıcısız hız ≈%35 değil ' + JSON.stringify(R.ctr));
  ok(Math.abs(R.ctr.vendor - R.ctr.player) <= 1, 'Tezgâhtar tam hız satmadı ' + JSON.stringify(R.ctr));
  ok(R.ctr.patAlone > 5.6 && R.ctr.patAlone < 6.4 && R.ctr.patPlayer > 9.5, 'satıcısız sabır %60 değil ' + JSON.stringify(R.ctr));

  /* ---- 4) Hamal önceliği ---- */
  R.ham = await p.evaluate(() => {
    const c = BT.counters[0], t = BT.tables[0], s = BT.spots[0], P = BT.player;
    BT.customers.length = 0; c.slots.fill(null);
    P.x = 2.6; P.y = 4.6;
    c.buffer.length = 0; c.buffer.push({ k: 'fileto', f: 'hamsi' }, { k: 'fileto', f: 'hamsi' });
    t.inn.length = 0; t.cur = null; t.mat.items.length = 0;
    for (let i = 0; i < 10; i++) t.mat.items.push({ k: 'fileto', f: 'hamsi' });
    s.box.length = 0; for (let i = 0; i < 10; i++) s.box.push({ k: 'fish', f: 'hamsi' });
    const w = BT.hire('hamal', true, 0);
    const job = BT.emek.hamalJob(w);
    let ctrAt = -1, tblAt = -1;
    for (let i = 0; i < 400; i++) {
      BT.emek.step(0.05);
      if (ctrAt < 0 && c.buffer.length > 2) ctrAt = i;
      if (tblAt < 0 && (t.inn.length || t.cur)) tblAt = i;
    }
    BT.workers.length = 0;
    return { job: job && job.k, ctrAt, tblAt, buf: c.buffer.length, box: s.box.length };
  });
  ok(R.ham.job === 'ctr' && R.ham.ctrAt >= 0 && (R.ham.tblAt < 0 || R.ham.ctrAt < R.ham.tblAt), 'Hamal önce tezgâha taşımadı ' + JSON.stringify(R.ham));
  ok(R.ham.tblAt >= 0, 'Hamal sonra sandıktan masaya taşımadı ' + JSON.stringify(R.ham));

  /* ---- 5) Balıkçı + sandık sınırı ---- */
  R.bal = await p.evaluate(() => {
    const s = BT.spots[0], t = BT.tables[0];
    s.box.length = 0; s.stock.length = 0; for (let i = 0; i < 10; i++) s.stock.push({ k: 'fish', f: 'hamsi' });
    t.inn.length = 0; t.cur = null;
    const w = BT.hire('balikci', true, 0);
    let mx = 0, first = -1;
    for (let i = 0; i < 1200; i++) { BT.emek.step(0.05); mx = Math.max(mx, s.box.length); if (first < 0 && s.box.length) first = i; }
    const o = { mx, cap: BT.emek.boxCap(s), box: s.box.length, stock: s.stock.length, first, at: Math.hypot(w.x - BT.emek.netStand(s).x, w.y - BT.emek.netStand(s).y).toFixed(2) };
    BT.workers.length = 0;
    return o;
  });
  ok(R.bal.box === R.bal.cap && R.bal.mx <= R.bal.cap && R.bal.cap === 12, 'Balıkçı sandık sınırı ' + JSON.stringify(R.bal));
  ok(R.bal.first >= 0 && R.bal.stock > 0, 'Balıkçı sandık dolunca durmadı ' + JSON.stringify(R.bal));

  /* ---- ek: oyuncu yükseltmeleri, fiyat ×0,75, müdür yedeği, "sen yokken" ---- */
  R.ext = await p.evaluate(() => {
    const o = {}, t = BT.tables[0], c = BT.counters[0], P = BT.player, pad = id => BT.pads.find(q => q.id === id);
    BT.workers.length = 0; BT.tables.forEach(q => { q.worker = null; }); BT.customers.length = 0; c.slots.fill(null);
    o.price = [BT.emek.cost(1300), BT.emek.cost(120)];
    P.x = t.x + 0.4; P.y = t.y + 0.5; t.cur = { k: 'fish', f: 'hamsi' }; t.t = 0;
    o.knife0 = BT.emek.cutMul(t); pad('knf').lvl = 2; o.knife2 = BT.emek.cutMul(t); pad('knf').lvl = 0; t.cur = null;
    o.pull0 = BT.emek.pullT(); pad('hnd').lvl = 2; o.pull2 = BT.emek.pullT(); pad('hnd').lvl = 0;
    P.x = c.x - 0.9; P.y = c.y + 0.2; pad('voc').lvl = 3; o.voice3 = BT.emek.sellMul(c); pad('voc').lvl = 0;
    /* müdür: eksik rolü yarı hızla doldurur (önce tezgâh, sonra masa) */
    BT.S.mgr[0] = { n: 'Test Bey', a: 'value', b: 'pat', wage: 35, look: 0 };
    P.x = 3.2; P.y = 4.4;
    o.fill = BT.emek.mgrFill(0).k;
    BT.emek.step(0.05, 120); o.mgrSell = BT.emek.sellMul(c);
    BT.hire('tezgahtar', true, 0); o.fill2 = BT.emek.mgrFill(0).k;
    BT.emek.step(0.05, 120);
    t.inn.length = 0; t.cur = { k: 'fish', f: 'hamsi' }; t.t = 0;
    o.mgrCut = +BT.emek.cutMul(t).toFixed(2); t.cur = null;
    BT.S.mgr[0] = null; BT.workers.length = 0; BT.emek.step(0.05, 2);
    /* sen yokken: yalnız başında personel olan bölge, usta durumuna göre */
    BT.retSet([300, 0, 0, 0], 0);
    o.away0 = BT.emek.retCompute(3600).v;
    BT.areas[0].lvl = 2;
    ['tezgahtar', 'balikci', 'filetocu', 'hamal', 'kasiyer'].forEach(r => BT.hire(r, true, 0));
    o.away1 = BT.emek.retCompute(3600).v; o.mul1 = BT.emek.awayMul(0);
    BT.workers.forEach(w => { w.lv = 3; }); o.away3 = BT.emek.retCompute(3600).v;
    BT.emek.set(0); o.awayOff = BT.emek.retCompute(3600).v; BT.emek.set(1);
    BT.workers.length = 0; BT.tables.forEach(q => { q.worker = null; }); BT.areas[0].lvl = 1; BT.retSet([0, 0, 0, 0], 0);
    return o;
  });
  ok(R.ext.price.join() === '975,90', 'Emekçi fiyat ×0,75 ' + JSON.stringify(R.ext.price));
  ok(Math.abs(R.ext.knife2 / R.ext.knife0 - 1.8) < 0.01 && R.ext.pull0 === 0.2 && R.ext.pull2 === 0.1 && Math.abs(R.ext.voice3 - 1.75) < 0.01, 'oyuncu yükseltmeleri ' + JSON.stringify(R.ext));
  ok(R.ext.fill === 'ctr' && R.ext.mgrSell === 0.5 && R.ext.fill2 === 'tbl' && R.ext.mgrCut === 0.5, 'müdür yedeği ' + JSON.stringify(R.ext));
  ok(R.ext.away0 === 0 && R.ext.away1 > 0 && Math.abs(R.ext.away1 / R.ext.away3 - 0.6) < 0.05 && R.ext.awayOff === 0, 'sen yokken ' + JSON.stringify(R.ext));

  /* ---- 6) usta seviyeleri: hız, maaş, kayıt ---- */
  R.usta = await p.evaluate(() => {
    const t = BT.tables[0], P = BT.player, o = {};
    P.x = 2.6; P.y = 4.6; BT.S.cash = 50000;
    const w = BT.hire('filetocu', true, 0);
    w.x = t.x + 0.8; w.y = t.y + 0.15;
    t.inn.length = 0; t.cur = { k: 'fish', f: 'hamsi' }; t.t = 0;
    o.mul1 = +BT.emek.cutMul(t).toFixed(3); o.wage1 = BT.emek.wage(w); o.cost1 = BT.emek.ustaCost(w);
    const c0 = BT.S.cash; o.up = BT.emek.lvUp(w); o.paid = c0 - BT.S.cash;
    o.mul2 = +BT.emek.cutMul(t).toFixed(3); o.wage2 = BT.emek.wage(w); o.cost2 = BT.emek.ustaCost(w);
    BT.emek.lvUp(w); o.mul3 = +BT.emek.cutMul(t).toFixed(3); o.wage3 = BT.emek.wage(w); o.up4 = BT.emek.lvUp(w);
    const h = BT.hire('hamal', true, 0); BT.emek.lvUp(h);
    o.lv = BT.workers.map(w => w.role + ':' + (w.lv || 1));
    t.cur = null;
    BT.saveNow();
    o.saved = JSON.parse(localStorage.getItem('balikci_slot_1')).workers;
    return o;
  });
  ok(R.usta.mul2 / R.usta.mul1 > 1.34 && R.usta.mul2 / R.usta.mul1 < 1.36 && R.usta.mul3 / R.usta.mul1 > 1.74 && R.usta.mul3 / R.usta.mul1 < 1.76, 'usta hızı ' + JSON.stringify(R.usta));
  ok(Math.abs(R.usta.wage2 / R.usta.wage1 - 1.2) < 0.01 && Math.abs(R.usta.wage3 / R.usta.wage1 - 1.45) < 0.01, 'usta maaşı ' + JSON.stringify(R.usta));
  ok(R.usta.up && R.usta.paid === R.usta.cost1 && R.usta.cost2 === R.usta.cost1 * 2 && !R.usta.up4, 'usta bedeli ' + JSON.stringify(R.usta));
  ok(R.usta.saved.some(r => r[0] === 'filetocu' && r[2] === 3) && R.usta.saved.some(r => r[0] === 'hamal' && r[2] === 2), 'usta kaydı ' + JSON.stringify(R.usta.saved));
  await p.reload(); await sleep(900);
  await p.evaluate(() => { const s = document.getElementById('introSkip'); if (s && s.offsetParent) s.click(); });
  await p.click('#playBtn'); await sleep(900);
  R.ustaLoad = await p.evaluate(() => BT.workers.map(w => w.role + ':' + (w.lv || 1)));
  ok(R.ustaLoad.indexOf('filetocu:3') >= 0 && R.ustaLoad.indexOf('hamal:2') >= 0, 'usta yüklenmedi ' + JSON.stringify(R.ustaLoad));
  /* görüntü: personel panelinde usta seviyeleri */
  await p.evaluate(() => { BT.achMute(true); BT.S.cash = 5000; BT.S.tut = 99; BT.S.ctrl = 2; BT.hire('tezgahtar', true, 0); BT.hire('balikci', true, 0); });
  await p.evaluate(() => BT.ui.openPauseMenu()); await sleep(250);
  await p.click('#menuTabs .tab[data-t="personel"]'); await sleep(300);
  R.panel = await p.evaluate(() => ({ btn: document.querySelectorAll('#tabBody .emLv').length, max: document.querySelectorAll('#tabBody .emLvMax').length, txt: document.getElementById('tabBody').textContent.slice(0, 400) }));
  ok(R.panel.btn >= 2 && R.panel.max === 1 && /Kalfa/.test(R.panel.txt) && /Usta/.test(R.panel.txt), 'personel paneli usta ' + JSON.stringify(R.panel));
  if (SHOT) await p.evaluate(() => { const a = document.getElementById('achPop'); if (a) a.classList.add('hidden'); document.getElementById('toast').classList.remove('on'); }), await p.screenshot({ path: SHOT + '/3-personel-usta.png' });
  /* panelden USTALAŞTIR düğmesi */
  R.panelBuy = await p.evaluate(() => { const b0 = document.querySelector('#tabBody .emLv'); const i = +b0.dataset.wi, lv0 = BT.workers[i].lv || 1; b0.click(); return [lv0, BT.workers[i].lv]; });
  ok(R.panelBuy[1] === R.panelBuy[0] + 1, 'USTALAŞTIR düğmesi ' + JSON.stringify(R.panelBuy));
  await p.evaluate(() => BT.closeOverlays());

  /* ---- görüntü 1: ağın başında tek tek çekerken (gerçek zamanlı) ---- */
  await p.evaluate(() => {
    BT.workers.length = 0; BT.tables.forEach(t => { t.worker = null; });
    const s = BT.spots[0]; s.stock.length = 0; s.box.length = 0; for (let i = 0; i < 10; i++) s.stock.push({ k: 'fish', f: 'hamsi' });
    BT.player.carry.length = 0; BT.player.x = s.x + 0.3; BT.player.y = s.y + 1.2;
    BT.counters.forEach(c => { c.spawnT = 1e9; });
  });
  await p.evaluate(() => { document.getElementById('toast').classList.remove('on'); });
  await sleep(700);
  R.shotNet = await p.evaluate(() => BT.player.carry.length);
  if (SHOT) await p.evaluate(() => { const a = document.getElementById('achPop'); if (a) a.classList.add('hidden'); document.getElementById('toast').classList.remove('on'); }), await p.screenshot({ path: SHOT + '/1-ag-tek-tek.png' });
  ok(R.shotNet >= 2 && R.shotNet <= 5, 'gerçek zamanlı çekme ' + R.shotNet);

  /* ---- görüntü 2: "⏸ Bekliyor" rozetleri (masa + tezgâh) ---- */
  await p.evaluate(() => {
    const t = BT.tables[0], c = BT.counters[0], P = BT.player;
    P.carry.length = 0; P.x = 7.2; P.y = 4.8;
    t.inn.length = 0; t.cur = null; for (let i = 0; i < 4; i++) t.inn.push({ k: 'fish', f: 'hamsi' });
    BT.customers.length = 0; c.slots.fill(null); c.buffer.length = 0; for (let i = 0; i < 6; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    for (let k = 0; k < 2; k++) { const cu = { x: 10.8, y: c.y + 0.1 + k, z: 0, bob: 0, face: -1, type: BT.CUST[k], ord: { k: 'fileto', f: 'hamsi', need: 30, got: 0 }, state: 'wait', slot: k, c: c, pat: 500, patMax: 500, mood: 1, hair: 0, tone: k }; c.slots[k] = cu; BT.customers.push(cu); }
  });
  await sleep(500);
  R.badge = await p.evaluate(() => { const t = BT.tables[0], c = BT.counters[0]; return { tt: t.t, tcur: !!t.cur, cAtt: c._att }; });
  ok(R.badge.cAtt === false && R.badge.tcur && R.badge.tt === 0, 'başında kimse yokken çalıştı ' + JSON.stringify(R.badge));
  if (SHOT) await p.evaluate(() => { const a = document.getElementById('achPop'); if (a) a.classList.add('hidden'); document.getElementById('toast').classList.remove('on'); }), await p.screenshot({ path: SHOT + '/2-bekliyor-rozeti.png' });

  /* ---- 7a) aynı oyunda ayardan kapat: eski davranış ---- */
  await p.evaluate(() => BT.openSettings()); await sleep(200);
  R.setLbl = await p.evaluate(() => document.getElementById('setEmek').textContent);
  await p.click('#emekOff'); await sleep(150);
  await p.click('#setClose'); await sleep(200);
  R.off1 = await p.evaluate(() => {
    const t = BT.tables[0], P = BT.player, s = BT.spots[0], c = BT.counters[0], o = {};
    o.on = BT.emek.on(); o.saved = JSON.parse(localStorage.getItem('balikci_slot_1')).emek;
    o.roles = BT.zoneRoles(0); o.cap = BT.zoneStaffCap(0); o.cost = BT.hireCost('hamal', 0); o.area = BT.emek.cost(1300);
    BT.workers.length = 0; BT.customers.length = 0; c.slots.fill(null);
    t.inn.length = 0; t.cur = null; t.t = 0; t.mat.items.length = 0; t.inn.push({ k: 'fish', f: 'hamsi' }, { k: 'fish', f: 'hamsi' });
    P.carry.length = 0; P.x = 2.6; P.y = 4.6;
    BT.emek.step(0.05, 30); o.cutAlone = t.mat.items.length;               /* eski: masa kendi keser */
    s.stock.length = 0; for (let i = 0; i < 8; i++) s.stock.push({ k: 'fish', f: 'hamsi' });
    P.x = s.x + 0.3; P.y = s.y + 1.2; BT.emek.step(0.05, 8); o.pick04 = P.carry.length;   /* eski: 0,075 sn'de bir */
    return o;
  });
  ok(!R.off1.on && R.off1.saved === 0 && R.off1.roles.join() === 'hamal,filetocu,tezgahtar,kasiyer' && R.off1.cap === 2 && R.off1.cost === 360 && R.off1.area === 1300, 'kapalı mod kadro/fiyat ' + JSON.stringify(R.off1));
  ok(R.off1.cutAlone === 2 && R.off1.pick04 >= 4, 'kapalı mod masa/ağ ' + JSON.stringify(R.off1));
  await p.context().close();

  /* ---- 7b) HK_EMEK_OFF (eski testler): Emekçi Mod hiç yok ---- */
  const q = await page(false);
  await newGame(q, 1);
  R.off2 = await q.evaluate(() => {
    const c = BT.counters[0], o = {};
    o.on = BT.emek.on(); o.roles = BT.zoneRoles(0).join(); o.cap = BT.zoneStaffCap(0); o.cost = [BT.hireCost('hamal', 0), BT.hireCost('tezgahtar', 0), BT.hireCost('filetocu', 0)];
    o.pads = BT.pads.filter(p => p.emek).length; o.setRow = !!document.getElementById('emekSeg');
    o.cash = BT.S.cash;
    BT.S.tut = 99; BT.S.ctrl = 2; c.spawnT = 1e9;
    c.buffer.length = 0; for (let i = 0; i < 30; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    const cu = { x: 10.8, y: c.y + 0.1, z: 0, bob: 0, face: -1, type: BT.CUST[0], ord: { k: 'fileto', f: 'hamsi', need: 40, got: 0 }, state: 'wait', slot: 0, c: c, pat: 500, patMax: 500, mood: 1, hair: 0, tone: 0 };
    c.slots[0] = cu; BT.customers.push(cu); c.eatT = 0;
    BT.player.x = 2.6; BT.player.y = 4.6;
    BT.emek.step(0.05, 40); o.sold2s = cu.ord.got; o.pat = +(500 - cu.pat).toFixed(2);   /* eski: 0,2 sn'de bir, sabır tam hızla */
    o.barCards = 0;
    return o;
  });
  ok(!R.off2.on && R.off2.roles === 'hamal,filetocu,tezgahtar,kasiyer' && R.off2.cap === 2 && R.off2.cost.join() === '360,700,520' && R.off2.cash === 0, 'HK_EMEK_OFF kadro/fiyat ' + JSON.stringify(R.off2));
  ok(R.off2.sold2s >= 7 && R.off2.sold2s <= 11 && Math.abs(R.off2.pat - 2) < 0.1, 'HK_EMEK_OFF tezgâh ' + JSON.stringify(R.off2));
  /* YÜKSELT sekmesinde emek kartları yok */
  await q.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); BT.closeOverlays(); });
  await q.click('.dtab[data-t="level"]'); await sleep(250);
  R.off2.cards = await q.evaluate(() => [...document.querySelectorAll('#dpCards .dcard b')].map(e => e.textContent));
  ok(!R.off2.cards.some(t => /BIÇAK|SATICI|ELLER/.test(t)), 'kapalı modda emek yükseltmesi görünüyor ' + JSON.stringify(R.off2.cards));
  await q.context().close();

  /* ---- 8) eski kayıt + Emekçi Mod: Usta ekip hediyesi bir kez ---- */
  const g = await page(true);
  await newGame(g, 2);
  await g.evaluate(() => {
    const d = BT.buildSave();
    delete d.emek; delete d.eg; delete d.nb;                                      /* eski kayıt: bu alanlar yok */
    d.workers = [['hamal', 0], ['filetocu', 0]]; d.cash = 1234; d.tut = 99; d.ctrl = 2;
    BT.S.started = false;                                                         /* sayfa kapanırken üstüne kaydetmesin */
    localStorage.setItem('balikci_slot_2', JSON.stringify(d)); localStorage.setItem('balikci_last', '2');
  });
  await g.reload(); await sleep(900);
  await g.evaluate(() => { const s = document.getElementById('introSkip'); if (s && s.offsetParent) s.click(); });
  await g.click('#playBtn'); await sleep(900);
  R.gift = await g.evaluate(() => ({ card: BT.emek.cardOpen(), title: document.getElementById('emekT').textContent, rows: document.querySelectorAll('#emekRows .row').length,
    w: BT.workers.map(w => w.role + '@' + w.zone).sort(), eg: BT.S.emekGift, paused: BT.paused(), cash: Math.round(BT.S.cash) }));
  ok(R.gift.card && /HEDİYE/.test(R.gift.title) && R.gift.rows === 2 && R.gift.w.join() === 'balikci@0,filetocu@0,hamal@0,tezgahtar@0' && R.gift.eg === 1 && R.gift.cash === 1234, 'hediye kartı ' + JSON.stringify(R.gift));
  await g.click('#emekGo'); await sleep(200);
  R.gift.closed = await g.evaluate(() => !BT.emek.cardOpen());
  await g.evaluate(() => BT.saveNow());
  await g.reload(); await sleep(900);
  await g.evaluate(() => { const s = document.getElementById('introSkip'); if (s && s.offsetParent) s.click(); });
  await g.click('#playBtn'); await sleep(900);
  R.gift2 = await g.evaluate(() => ({ card: BT.emek.cardOpen(), n: BT.workers.length }));
  ok(R.gift.closed && !R.gift2.card && R.gift2.n === 4, 'hediye ikinci kez geldi ' + JSON.stringify(R.gift2));
  await g.context().close();

  }   /* ONLY_BOT */
  /* ---- 9) bot: 10 oyun dakikası ---- */
  const bot = async (on) => {
    const bp = await page(on);
    await newGame(bp, 1);
    const res = await bp.evaluate(async () => {
      const P = BT.player, S = BT.S, K = BT.emek.keys;
      const t0 = BT.tables[0], c0 = BT.counters[0], s0 = BT.spots[0];
      const on = BT.emek.on();
      const order = on ? ['tezgahtar', 'balikci', 'filetocu', 'hamal'] : ['hamal', 'filetocu'];
      const cheapest = Math.min.apply(null, BT.zoneRoles(0).map(r => BT.hireCost(r, 0)));
      const B = { stay: 0, firstAfford: -1, hires: [], mins: [] };
      const vis = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
      const carry = f => P.carry.filter(f).length;
      const press = (tx, ty) => {
        ['w', 'a', 's', 'd'].forEach(k => { K[k] = false; });
        const dx = tx - P.x, dy = ty - P.y;
        if (Math.hypot(dx, dy) < 0.12) return true;
        const u = dx + dy, v = dx - dy;
        if (Math.abs(u) > 0.08) K[u > 0 ? 's' : 'w'] = true;
        if (Math.abs(v) > 0.08) K[v > 0 ? 'd' : 'a'] = true;
        return false;
      };
      const waiting = () => c0.slots.some(q => q && q.state === 'wait');
      const netPt = [s0.x + 0.3, s0.y + 1.2], tblPt = [(t0.x + t0.mat.x) / 2, (t0.y + t0.mat.y) / 2], ctrPt = [c0.x - 0.9, c0.y + 0.2], trayPt = [c0.tray.x - 0.6, c0.tray.y + 0.5];
      const trayV = () => c0.tray.items.reduce((a, it) => a + it.v, 0);
      let t = 0, tgt = netPt;
      const step = dt => {
        /* engelleyici kartlar */
        if (vis('dayScr')) document.getElementById('dayGo').click();
        if (vis('prepScr')) document.getElementById('prepGo').click();
        if (vis('stallScr')) document.getElementById('stallGo').click();
        if (vis('emekScr')) document.getElementById('emekGo').click();
        const fish = carry(it => it.k === 'fish'), goods = carry(it => it.k !== 'fish' && it.k !== 'money');
        const cap = 8 + S.capLvl * 3;
        const ownVendor = BT.workers.some(w => w.role === 'tezgahtar');
        const wants = c0.slots.some(q => q && q.state === 'wait' && q.ord.got < q.ord.need);
        const canDrop = goods > 0 && (c0.buffer.length < 7 || wants);          /* tezgâh almıyorsa elindekiyle başka işe */
        if (canDrop) tgt = ctrPt, B.stay = on && !ownVendor ? 4 : 0;
        else if (B.stay > 0 && on && waiting() && c0.buffer.length) { tgt = ctrPt; B.stay -= dt; }
        else if (trayV() >= 40) tgt = trayPt;
        else if (on && !BT.workers.some(w => w.role === 'filetocu') && (t0.inn.length || t0.cur)) tgt = tblPt;
        else if (t0.mat.items.length && fish === 0) tgt = tblPt;
        else if (fish > 0 && t0.inn.length >= t0.max && t0.mat.items.length >= BT.pileCap(t0) - 1) tgt = [BT.BINS[0].x, BT.BINS[0].y];   /* kilit: fazlayı çöpe */
        else if (fish > 0 && (fish >= cap || t0.inn.length + fish >= t0.max || (!s0.stock.length && !s0.box.length))) tgt = tblPt;
        else if (fish === 0 && s0.box.length) tgt = [s0.bx, s0.by];
        else tgt = netPt;
        press(tgt[0], tgt[1]);
        BT.emek.step(dt);
        t += dt;
        if (B.firstAfford < 0 && S.cash >= cheapest) B.firstAfford = +(t / 60).toFixed(2);
        const next = order.find(r => !BT.workers.some(w => w.role === r && w.zone === 0));
        if (next && BT.zoneFree(0) > 0 && S.cash >= BT.hireCost(next, 0)) {
          const c = BT.hireCost(next, 0); S.cash -= c; BT.hire(next, true, 0); B.hires.push([next, +(t / 60).toFixed(2), c]);
        }
      };
      for (let m = 0; m < 10; m++) {
        for (let i = 0; i < 1200; i++) step(0.05);
        B.mins.push({ m: m + 1, cash: Math.round(S.cash), rep: S.rep, served: S.served, lost: S.lost, p: [P.x, P.y].map(v => +v.toFixed(2)), tgt: tgt, carry: P.carry.length, inn: t0.inn.length, mat: t0.mat.items.length, buf: c0.buffer.length, st: s0.stock.length });
      }
      ['w', 'a', 's', 'd'].forEach(k => { K[k] = false; });
      return { on, cheapest, firstAfford: B.firstAfford, hires: B.hires, mins: B.mins, wage: Math.round(BT.S.cash), caught: S.caught, dbg: { p: [P.x, P.y].map(v => +v.toFixed(2)), tgt, carry: P.carry.map(i => i.k).join(), inn: t0.inn.length, cur: !!t0.cur, mat: t0.mat.items.length, buf: c0.buffer.length, stock: s0.stock.length, box: s0.box.length, ov: [...document.querySelectorAll('.overlay')].filter(o => !o.classList.contains('hidden')).map(o => o.id), ph: BT.day.phase } };
    });
    await bp.context().close();
    return res;
  };
  const N = +process.env.BOT_N || 3, avg = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2);
  const runs = async on => { const rs = []; for (let i = 0; i < N; i++) rs.push(await bot(on)); const r = rs[0];
    r.runs = rs.map(q => [q.firstAfford, q.mins[9].cash, q.mins[9].rep, q.mins[9].served]);
    if (process.env.BOT_DBG) rs.forEach(q => console.log('TRACE', on, JSON.stringify(q.mins.map(m => [m.p, m.tgt, m.carry, m.inn, m.mat, m.buf, m.st]))));
    r.firstAfford = avg(rs.map(q => q.firstAfford)); r.mins = r.mins.map((m, k) => ({ m: m.m, cash: Math.round(avg(rs.map(q => q.mins[k].cash))), rep: Math.round(avg(rs.map(q => q.mins[k].rep))), served: Math.round(avg(rs.map(q => q.mins[k].served))), lost: Math.round(avg(rs.map(q => q.mins[k].lost))) }));
    return r; };
  R.botOn = await runs(true);
  R.botOff = await runs(false);
  ok(R.botOn.on && !R.botOff.on, 'bot modları');
  ok(R.botOn.firstAfford > 0 && R.botOn.firstAfford <= 6, 'ilk kiralama çok geç ' + R.botOn.firstAfford);
  ok(R.botOn.mins[9].served > 10, 'bot satış yapamadı ' + JSON.stringify(R.botOn.mins[9]));

  await b.close();
  if (!process.env.QUIET) console.log(JSON.stringify({ R, errs }, null, 1));
  console.log('dakika: Emekçi ' + R.botOn.mins.map(m => m.cash + '/' + m.rep).join(' ') + ' | Kapalı ' + R.botOff.mins.map(m => m.cash + '/' + m.rep).join(' '));
  console.log('BOT Emekçi: ilk kiralama ' + R.botOn.firstAfford + ' dk, 10. dk para ' + R.botOn.mins[9].cash + ' itibar ' + R.botOn.mins[9].rep + ' satış ' + R.botOn.mins[9].served + ' kaçan ' + R.botOn.mins[9].lost + ' • alımlar ' + JSON.stringify(R.botOn.hires));
  console.log('koşular [ilk kiralama dk, para, itibar, satış]: Emekçi ' + JSON.stringify(R.botOn.runs) + ' | Kapalı ' + JSON.stringify(R.botOff.runs));
  console.log('BOT Kapalı : ilk kiralama ' + R.botOff.firstAfford + ' dk, 10. dk para ' + R.botOff.mins[9].cash + ' itibar ' + R.botOff.mins[9].rep + ' satış ' + R.botOff.mins[9].served + ' kaçan ' + R.botOff.mins[9].lost + ' • alımlar ' + JSON.stringify(R.botOff.hires));
  console.log(fail.length || errs.length ? 'EMEKCI_FAIL ' + JSON.stringify(fail) : 'EMEKCI_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
