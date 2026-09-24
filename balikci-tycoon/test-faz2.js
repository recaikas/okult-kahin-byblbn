/* Faz 2 kabul testi: karakter oluşturma, tezgâh kasası (anında tahsil + KASA DOLU),
   bölge tahsildarı, personele devret (tam otomasyon), tezgâh başına tezgâhtar, eski kayıt uyumu. */
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
  await p.goto(URL); await sleep(900);
  /* 1) karakter oluşturma: slot → karakter → işletme adı */
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await sleep(300);
  ok(await p.isVisible('#heroScr'), 'karakter ekranı açılmadı');
  await p.fill('#heroName', 'a'); await p.click('#heroGo'); await sleep(150);
  ok(await p.isVisible('#heroScr'), 'kısa isim kabul edildi');
  await p.fill('#heroName', 'Recai');
  await p.click('#heroRows button[data-k="hs"][data-d="1"]'); await p.click('#heroRows button[data-k="hw"][data-d="1"]');
  await p.click('#heroGo'); await sleep(200);
  ok(await p.isVisible('#nameScr'), 'karakterden sonra isim ekranı yok');
  await p.fill('#nameIn', 'Recai Balıkçılık'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900); await closeStall();
  R.hero = await p.evaluate(() => BT.S.hero);
  ok(R.hero && R.hero.n === 'Recai', 'karakter kaydedilmedi');
  await p.evaluate(() => { BT.S.ctrl = 2; });
  /* 2) tezgâh kasası: oyuncu geçince para anında hesaba */
  R.pay = await p.evaluate(async () => {
    const c = BT.counters[0]; c.tray.items.length = 0;
    for (let i = 0; i < 3; i++) c.tray.items.push({ k: 'money', v: 50 });
    const cash0 = BT.S.cash, e0 = BT.S.earned;
    BT.player.x = c.tray.x; BT.player.y = c.tray.y - 0.3;
    await new Promise(r => setTimeout(r, 900));
    return { gain: BT.S.cash - cash0, earned: BT.S.earned - e0, left: c.tray.items.length, carryMoney: BT.player.carry.filter(i => i.k === 'money').length };
  });
  ok(R.pay.gain >= 149 && R.pay.left === 0 && R.pay.carryMoney === 0, 'kasa anında tahsil edilmedi ' + JSON.stringify(R.pay));
  /* 3) KASA DOLU: yeni müşteri gelmez */
  R.full = await p.evaluate(async () => {
    BT.player.x = 4.5; BT.player.y = 3.2;
    const c = BT.counters[0]; c.tray.items.length = 0; c.tray.items.push({ k: 'money', v: 5000 });
    BT.customers.length = 0; for (let i = 0; i < c.slots.length; i++) c.slots[i] = null;
    const t0 = Date.now();
    while (Date.now() - t0 < 2500) { c.spawnT = 0; await new Promise(r => setTimeout(r, 100)); }
    return { full: BT.trayFull(c.key), cust: BT.customers.filter(q => q.c === c).length };
  });
  ok(R.full.full && R.full.cust === 0, 'kasa doluyken müşteri geldi ' + JSON.stringify(R.full));
  /* 4) tahsildar kendi bölgesinin kasasını Ana Kasa'ya taşır */
  R.col = await p.evaluate(async () => {
    const c = BT.counters[0]; c.tray.items.length = 0;
    for (let i = 0; i < 4; i++) c.tray.items.push({ k: 'money', v: 40 });
    const w = BT.hire('kasiyer', true, 0); const cash0 = BT.S.cash;
    await new Promise(r => setTimeout(r, 12000));
    return { zone: w.zone, left: c.tray.items.length, gain: Math.round(BT.S.cash - cash0) };
  });
  ok(R.col.zone === 0 && R.col.left === 0 && R.col.gain >= 150, 'tahsildar parayı taşımadı ' + JSON.stringify(R.col));
  /* 5) personele devret */
  R.chain0 = await p.evaluate(() => { BT.areas[0].lvl = 3; BT.rebuildCounters(); return BT.zoneChain(0); });
  ok(!R.chain0.ok, 'zincir erken tamam');
  await p.evaluate(() => { BT.S.cash = 50000; });
  await p.click('.dtab[data-t="level"]'); await sleep(300);
  R.autoCardBlocked = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.textContent).find(t => /Devret/.test(t)) || '');
  ok(/Eksik rol/.test(R.autoCardBlocked), 'devret kartı eksik rolleri göstermiyor');
  await p.evaluate(() => { BT.hire('hamal', true, 0); BT.hire('filetocu', true, 0); BT.hire('tezgahtar', true, 0); });
  await p.click('.dtab[data-t="level"]'); await sleep(200); await p.click('.dtab[data-t="level"]'); await sleep(300);
  const btn = await p.evaluateHandle(() => [...document.querySelectorAll('#dpCards .dcard')].find(d => /Devret/.test(d.textContent)).querySelector('.buy'));
  await btn.click(); await sleep(300);
  R.auto = await p.evaluate(() => ({ on: BT.zoneAuto(0), saved: BT.S.auto }));
  ok(R.auto.on, 'devret açılmadı');
  await p.click('.dtab[data-t="level"]'); await sleep(200);
  /* oyuncu ağın yanında dursa bile devredilmiş bölgeye karışmaz; iş kendi döner */
  R.run = await p.evaluate(async () => {
    const s = BT.spots[0]; BT.player.x = s.x; BT.player.y = s.y + 0.9; BT.player.carry.length = 0;
    const cash0 = BT.S.cash, served0 = BT.S.served;
    await new Promise(r => setTimeout(r, 40000));
    return { playerFish: BT.player.carry.length, served: BT.S.served - served0, cash: Math.round(BT.S.cash - cash0), vendorStall: BT.workers.find(w => w.role === 'tezgahtar').stall };
  });
  ok(R.run.playerFish === 0, 'oyuncu devredilen bölgede balık aldı');
  ok(R.run.served >= 1, 'otomatik bölge satış yapmadı ' + JSON.stringify(R.run));
  ok(R.run.vendorStall === 'b0', 'tezgâhtar tezgâha atanmadı');
  /* 6) kaydet → yükle: karakter + devret korunur */
  await p.evaluate(() => BT.saveQuit()); await sleep(300);
  await p.reload(); await sleep(1200);
  await p.click('#playBtn'); await sleep(800); await closeStall();
  R.reload = await p.evaluate(() => ({ hero: BT.S.hero && BT.S.hero.n, auto: BT.zoneAuto(0), kas: BT.workers.filter(w => w.role === 'kasiyer').map(w => w.zone) }));
  ok(R.reload.hero === 'Recai' && R.reload.auto && R.reload.kas[0] === 0, 'yeniden yüklemede kayıp ' + JSON.stringify(R.reload));
  await ctx.close();
  /* 7) eski kayıt: liman geneli kasiyer (-1) bir bölgeye yerleşir */
  const c2 = await b.newContext({ viewport: { width: 430, height: 860 } });
  await c2.addInitScript(() => { if (!localStorage.getItem('__o')) { localStorage.setItem('__o', '1'); localStorage.setItem('balikci_tycoon_v3', JSON.stringify({ v: 5, cash: 900, company: 'Eski', runId: 'oldrun1', workers: [['kasiyer', -1], ['hamal', 0]], day: [2, 5, 0], at: Date.now() })); } });
  const p2 = await c2.newPage(); p2.on('pageerror', e => errs.push('PE2: ' + e.message));
  await p2.goto(URL); await sleep(1200);
  R.old = await p2.evaluate(() => BT.workers.map(w => w.role + '@' + w.zone));
  ok(R.old.indexOf('kasiyer@0') >= 0 && R.old.indexOf('hamal@0') >= 0, 'eski kasiyer yerleşmedi ' + JSON.stringify(R.old));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'FAZ2_FAIL ' + JSON.stringify(fail) : 'FAZ2_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
