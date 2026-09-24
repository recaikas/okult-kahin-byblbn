/* Faz 3 kabul testi: Liman Meydanı (köprü + yürünebilirlik), Personel Kulübesi seviyesi,
   Depo (oyuncu rafa koyar, Depo Hamalı fazlayı taşır/tezgâhı besler), Sevkiyatçı (kontrat),
   Toptancı Hali (al/sat), çalışan rotası (bölge ↔ meydan), kayıt + eski kulübe göçü. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  const p = await ctx.newPage();
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  const closeStall = () => p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  const wait = ms => p.evaluate(ms => new Promise(r => setTimeout(r, ms)), ms);
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await sleep(900); await closeStall();
  await p.evaluate(() => { BT.S.ctrl = 2; BT.S.cash = 200000; BT.S.rep = 400; BT.areas.forEach(a => a.locked = false); BT.rebuildCounters(); });
  await sleep(400); await closeStall();
  /* 1) köprüden meydana yürü */
  await p.evaluate(() => { BT.player.x = 8.8; BT.player.y = 2.4; });
  await p.keyboard.down('d'); await p.keyboard.down('s'); await sleep(3200); await p.keyboard.up('d'); await p.keyboard.up('s');
  R.walk = await p.evaluate(() => ({ x: +BT.player.x.toFixed(2), y: +BT.player.y.toFixed(2) }));
  ok(R.walk.x > 15.3, 'oyuncu meydana geçemedi ' + JSON.stringify(R.walk));
  R.roadBlocked = await p.evaluate(async () => { BT.player.x = 9.4; BT.player.y = 8; return true; });
  /* 2) YAPI › Meydan: kulübe + depo + hal kur */
  await p.click('.dtab[data-t="build"]'); await sleep(200); await p.click('#dpSub button[data-s="meydan"]'); await sleep(200);
  R.cards = await p.$$eval('#dpCards .dcard b', a => a.map(x => x.textContent));
  ok(R.cards.length >= 3, 'meydan kartları yok');
  const cap0 = await p.evaluate(() => BT.zoneStaffCap(0));
  const buy = async (re) => {
    for (let k = 0; k < 2; k++) {
      await p.evaluate((re) => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => new RegExp(re).test(d.querySelector('b').textContent)); c.querySelector('.buy').click(); }, re);
      await sleep(150);
    }
  };
  await buy('Personel'); await buy('^Depo'); await buy('Toptancı');
  R.built = await p.evaluate(() => ({ hut: BT.HUT.lvl, dep: BT.DEPOT.lvl, hal: BT.WHALL.built, cap: BT.zoneStaffCap(0) }));
  ok(R.built.hut === 1 && R.built.dep === 1 && R.built.hal && R.built.cap === cap0 + 1, 'meydan binaları kurulmadı ' + JSON.stringify(R.built));
  await p.click('.dtab[data-t="build"]'); await sleep(200);
  /* 3) oyuncu depo kapısında malı rafa koyar */
  R.dep = await p.evaluate(async () => {
    const P = BT.player; P.carry.length = 0;
    for (let i = 0; i < 5; i++) P.carry.push({ k: 'fileto', f: 'hamsi' });
    P.x = BT.DEPOT.door.x; P.y = BT.DEPOT.door.y;
    await new Promise(r => setTimeout(r, 1200));
    return { shelf: BT.DEPOT.shelf['fileto|hamsi'] || 0, carry: P.carry.length };
  });
  ok(R.dep.shelf === 5 && R.dep.carry === 0, 'oyuncu depoya koyamadı ' + JSON.stringify(R.dep));
  /* 4) Depo Hamalı: tezgâh boşsa depodan besler — 3. bölgeden yola çıkıp köprüyü kullanarak */
  R.refill = await p.evaluate(async () => {
    BT.player.x = 4.5; BT.player.y = 3.2;
    const c = BT.counters.find(q => q.key === 'b0'); c.buffer.length = 0;
    const w = BT.hire('depocu', true, -1); w.x = 5; w.y = 15;           /* uzak bölgeden başlat */
    const t0 = Date.now(); let reached = false;
    while (Date.now() - t0 < 30000) { await new Promise(r => setTimeout(r, 250)); if (c.buffer.length >= 3) { reached = true; break; } }
    return { reached, buf: c.buffer.length, shelf: BT.DEPOT.shelf['fileto|hamsi'] || 0, secs: Math.round((Date.now() - t0) / 1000) };
  });
  ok(R.refill.reached, 'depo hamalı tezgâhı beslemedi / takıldı ' + JSON.stringify(R.refill));
  /* 5) fazla ürün: tezgâh doluyken hasırdaki fileto depoya gider */
  R.surplus = await p.evaluate(async () => {
    const c = BT.counters.find(q => q.key === 'b0');
    while (c.buffer.length < 20 + (BT.areas[0].lvl - 1) * 4) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    const m = BT.tables[0].mat; m.items.length = 0;
    for (let i = 0; i < 6; i++) m.items.push({ k: 'fileto', f: 'hamsi' });
    const before = BT.depotCount();
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { await new Promise(r => setTimeout(r, 300)); if (BT.depotCount() >= before + 6) break; }
    return { before, after: BT.depotCount(), mat: m.items.length };
  });
  ok(R.surplus.after >= R.surplus.before + 4, 'fazla ürün depoya taşınmadı ' + JSON.stringify(R.surplus));
  /* 6) Sevkiyatçı: kontrat ürününü depodan Ticaret Merkezi'ne götürür */
  R.ship = await p.evaluate(async () => {
    const M = BT.M(); M.office = true; M.active.length = 0;
    const o = { id: 'test1', co: M.co[0].id, ty: BT.CTYPES[0].id, k: 'fileto', f: 'hamsi', need: 3, rew: 250, rel: 2, dur: 180 };
    M.offers.push(o); BT.acceptContract(o);
    BT.hire('sevkiyat', true, -1);   /* depo Sv1 → kadro 1: önce depoyu yükselt */
    return { active: M.active.length, staff: BT.workers.filter(w => w.role === 'sevkiyat').length };
  });
  if (!R.ship.staff) {
    await p.evaluate(() => { BT.DEPOT.lvl = 2; BT.hire('sevkiyat', true, -1); });
  }
  R.ship2 = await p.evaluate(async () => {
    const M = BT.M(), cash0 = BT.S.cash, t0 = Date.now();
    while (Date.now() - t0 < 35000) { await new Promise(r => setTimeout(r, 300)); if (!M.active.length) break; }
    return { left: M.active.length, gain: Math.round(BT.S.cash - cash0), secs: Math.round((Date.now() - t0) / 1000) };
  });
  ok(R.ship2.left === 0, 'sevkiyatçı kontratı teslim etmedi ' + JSON.stringify(R.ship2));
  /* 7) Toptancı Hali: sat / al */
  R.hal = await p.evaluate(async () => {
    BT.DEPOT.shelf['fileto|hamsi'] = 10;
    BT.openHal(); await new Promise(r => setTimeout(r, 200));
    const cash0 = BT.S.cash;
    document.querySelector('#halRows .hb[data-a="sell"][data-n="5"][data-k="fileto|hamsi"]').click();
    await new Promise(r => setTimeout(r, 100));
    const afterSell = { shelf: BT.DEPOT.shelf['fileto|hamsi'], gain: BT.S.cash - cash0 };
    const cash1 = BT.S.cash;
    document.querySelector('#halRows .hb[data-a="buy"][data-k="fileto|hamsi"]').click();
    await new Promise(r => setTimeout(r, 100));
    const out = { afterSell, afterBuy: { shelf: BT.DEPOT.shelf['fileto|hamsi'], cost: cash1 - BT.S.cash }, rows: document.querySelectorAll('#halRows .trow').length };
    document.getElementById('halClose').click();
    return out;
  });
  ok(R.hal.afterSell.shelf === 5 && R.hal.afterSell.gain > 0 && R.hal.afterBuy.shelf === 10 && R.hal.afterBuy.cost > R.hal.afterSell.gain, 'hal al/sat yanlış ' + JSON.stringify(R.hal));
  /* 8) kaydet → yeniden yükle */
  await p.evaluate(() => BT.saveQuit()); await sleep(300);
  await p.reload(); await sleep(1200);
  await p.click('#playBtn'); await sleep(700); await closeStall();
  R.reload = await p.evaluate(() => ({ hut: BT.HUT.lvl, dep: BT.DEPOT.lvl, hal: BT.WHALL.built, shelf: BT.DEPOT.shelf['fileto|hamsi'] || 0, depStaff: BT.workers.filter(w => w.zone === -1).map(w => w.role) }));
  ok(R.reload.hut === 1 && R.reload.dep >= 1 && R.reload.hal && R.reload.shelf >= 1 && R.reload.depStaff.length >= 1, 'meydan kaydı kayboldu ' + JSON.stringify(R.reload));
  await ctx.close();
  /* 9) eski kayıt: parseldeki kulübe → meydandaki kulübe Sv1 */
  const c2 = await b.newContext({ viewport: { width: 430, height: 860 } });
  await c2.addInitScript(() => { if (!localStorage.getItem('__k')) { localStorage.setItem('__k', '1'); localStorage.setItem('balikci_tycoon_v3', JSON.stringify({ v: 5, cash: 500, company: 'Eski', runId: 'oldrun2', slots: ['kulube', null, null, null, null, null, null], at: Date.now() })); } });
  const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push('PE2: ' + e.message));
  await p2.goto(URL); await sleep(1200);
  R.mig = await p2.evaluate(() => ({ hut: BT.HUT.lvl, slot0: BT.slots[0].b }));
  ok(R.mig.hut === 1 && R.mig.slot0 === null, 'eski kulübe göçmedi ' + JSON.stringify(R.mig));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'FAZ3_FAIL ' + JSON.stringify(fail) : 'FAZ3_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
