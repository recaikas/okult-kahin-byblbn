/* v2.26 — Canlı liman: yolcu vapuru + lodos/yağmur.
   Vapur yanaşır, 4–9 yolcu iner; boş kuyruk yeri olan açık tezgâhlara normal müşteri olur, artanlar gezinerek gider; vapur ayrılır.
   Yağmur: kuyruktan bir kısmı kaçar (kayıp SAYILMAZ), kalanlar şemsiye açar; yağmurda akış ×0,4, sonra ×1,5; hava biter.
   İnce + klasik modda sayfa hatası / sanat kancası uyarısı yok. İsteğe bağlı: node test-canli.js <görüntü klasörü> */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (/HKA\.|Error/.test(m.text())) errs.push('CON: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.evaluate(() => { window.__toasts = []; new MutationObserver(() => window.__toasts.push(document.getElementById('toast').textContent)).observe(document.getElementById('toast'), { childList: true, characterData: true, subtree: true }); });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  R.api = await p.evaluate(() => ({ wx: ['start', 'stop', 'st'].every(k => typeof BT.wx[k] === 'function'), ferry: ['call', 'st'].every(k => typeof BT.ferry[k] === 'function'),
    lines: BT.wx.flee.length, lnOk: BT.wx.flee.every(l => l.tr && l.en), tr: BT.T('wxDayL') + ' ' + BT.T('wxDayV') }));
  ok(R.api.wx && R.api.ferry && R.api.lines >= 6 && R.api.lnOk, 'BT kancaları / replikler eksik ' + JSON.stringify(R.api));
  /* liman: 4. gün, tezgâh stoksuz, normal müşteri doğuşu durdurulur (yalnız vapur yolcuları) */
  await p.evaluate(() => {
    BT.S.tut = 99; BT.S.ctrl = 2; BT.day.n = 4; BT.day.phase = 'play'; BT.day.t = 30;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    BT.counters[0].buffer.length = 0;   /* stok yok: yolcular kuyrukta bekler (yağmur sınaması için) */
    BT.counters.forEach(c => { c.spawnT = 1e9; });
    BT.player.x = 17.2; BT.player.y = 0.4;   /* meydanın kuzey kıyısı: vapur ekranda */
  });
  await sleep(500);
  /* ---- 1. VAPUR ---- */
  R.f0 = await p.evaluate(() => ({ call: BT.ferry.call(7), stalls: BT.ferry.stalls(), cust: BT.customers.length, st: BT.ferry.st() }));
  ok(R.f0.call && R.f0.st.ph === 1 && R.f0.st.n === 7, 'vapur çağrılamadı ' + JSON.stringify(R.f0));
  let docked = false;
  for (let i = 0; i < 40 && !docked; i++) { await sleep(300); docked = await p.evaluate(() => BT.ferry.st().ph === 2); }
  ok(docked, 'vapur yanaşmadı');
  R.toastF = await p.evaluate(() => window.__toasts.join(' | '));
  ok(/7/.test(R.toastF) && /Vapur|Ferry/.test(R.toastF), 'vapur bildirimi yok ' + R.toastF);
  let unloaded = false, shot1 = false;
  for (let i = 0; i < 60 && !unloaded; i++) {
    await sleep(300);
    const s = await p.evaluate(() => BT.ferry.st());
    if (SHOT && !shot1 && s.n - s.left >= 3) { shot1 = true; await sleep(500); await p.screenshot({ path: SHOT + '/canli-1-vapur.png' }); }
    unloaded = s.left === 0;
  }
  R.f1 = await p.evaluate(() => {
    const pax = BT.customers.filter(c => c.ferry);
    return { st: BT.ferry.st(), pax: pax.length, okStall: pax.every(c => c.c && c.c.open && !c.spec && BT.CUST.indexOf(c.type) >= 0 && (c.state === 'leave' || (c.slot < BT.queueMax(c.c.z) && c.c.slots[c.slot] === c))),
      orders: pax.every(c => c.ord && c.ord.need > 0 && c.ord.f === c.c.fish), types: pax.map(c => c.type.id) };
  });
  ok(unloaded, 'yolcular inmedi ' + JSON.stringify(R.f1.st));
  ok(R.f1.st.got >= 1 && R.f1.pax === R.f1.st.got, 'yolcular müşteri olmadı ' + JSON.stringify(R.f1));
  ok(R.f1.st.got + R.f1.st.gone === 7, 'yolcu sayısı tutmuyor ' + JSON.stringify(R.f1.st));
  ok(R.f1.okStall && R.f1.orders, 'yolcu açık tezgâhın boş kuyruk yerine gitmedi ' + JSON.stringify(R.f1));
  ok(R.f1.st.got <= R.f0.stalls.length * 7 && R.f1.st.gone >= 1, 'artan yolcu gezinmedi (kuyruk 4 yer) ' + JSON.stringify(R.f1.st));
  /* yolcular kuyruğa varır; vapur ayrılır */
  let left = false, arrived = 0;
  for (let i = 0; i < 80 && !left; i++) {
    await sleep(300);
    const s = await p.evaluate(() => ({ ph: BT.ferry.st().ph, wait: BT.customers.filter(c => c.ferry && c.state === 'wait').length }));
    arrived = Math.max(arrived, s.wait); left = s.ph === 0;
  }
  ok(left, 'vapur ayrılmadı');
  for (let i = 0; i < 20 && arrived < R.f1.st.got; i++) { await sleep(300); arrived = Math.max(arrived, await p.evaluate(() => BT.customers.filter(c => c.ferry && c.state === 'wait').length)); }
  ok(arrived >= 1, 'yolcular kuyruğa varmadı ' + arrived);
  /* ---- 2. YAĞMUR ---- */
  await p.evaluate(() => { BT.player.x = 11.6; BT.player.y = 7.2; }); await sleep(1800);   /* kamera kuyruğa */
  R.w0 = await p.evaluate(() => ({ lost: BT.S.lost, dlost: BT.day.st.lost, q: BT.customers.filter(c => c.state !== 'leave').length, mul: BT.wx.mul() }));
  ok(R.w0.q >= 2 && R.w0.mul === 1, 'yağmur öncesi kuyruk yetersiz ' + JSON.stringify(R.w0));
  R.w1 = await p.evaluate(() => {
    const r = BT.wx.start(), s = BT.wx.st();
    const fled = BT.customers.filter(c => c.wxFled), stay = BT.customers.filter(c => c.state !== 'leave');
    return { r, s, fled: fled.length, fledOk: fled.every(c => c.state === 'leave' && c.flee && c.happyLeave && !c.umb), stay: stay.length, umb: stay.filter(c => c.umb).length,
      slots: BT.counters.every(c => c.slots.every(q => !q || q.state !== 'leave')), toast: window.__toasts.join(' | '), dst: BT.day.st.wx };
  });
  R.w1.toast = await p.evaluate(() => window.__toasts.slice(-3).join(' | '));   /* gözlemci kayıtları bir sonraki görevde */
  ok(R.w1.r && R.w1.s.on, 'yağmur başlamadı ' + JSON.stringify(R.w1));
  ok(R.w1.fled >= 1 && R.w1.fledOk, 'kimse kaçmadı ' + JSON.stringify(R.w1));
  ok(R.w1.stay >= 1 && R.w1.umb === R.w1.stay, 'kalanlar şemsiye açmadı ' + JSON.stringify(R.w1));
  ok(R.w1.slots, 'kaçan kuyrukta kaldı');
  ok(/Lodos|gale/.test(R.w1.toast), 'yağmur bildirimi yok ' + R.w1.toast);
  ok(R.w1.dst === 1, 'gün kartı hava işareti yok');
  if (SHOT) { await sleep(1800); await p.screenshot({ path: SHOT + '/canli-2-yagmur-ince.png' }); }
  /* akış ×0,4: aynı tezgâhın doğuş sayacı yağmurda daha yavaş akar */
  const rate = async () => { await p.evaluate(() => { BT.counters[0].spawnT = 1000; }); const t0 = await p.evaluate(() => BT.S.play); await sleep(2500); return p.evaluate(t0 => (1000 - BT.counters[0].spawnT) / (BT.S.play - t0), t0); };
  R.rRain = await rate();
  R.mulRain = await p.evaluate(() => BT.wx.mul());
  await sleep(1500);
  R.w2 = await p.evaluate(() => ({ lost: BT.S.lost, dlost: BT.day.st.lost, yell: BT.wx.st().yell, vis: BT.wx.st().vis }));
  ok(R.w2.lost === R.w0.lost && R.w2.dlost === R.w0.dlost, 'kaçanlar kayıp sayıldı ' + JSON.stringify([R.w0, R.w2]));
  ok(R.w2.vis > 0.9, 'yağmur görünmüyor ' + R.w2.vis);
  /* hava biter → yağmur sonrası ×1,5, şemsiyeler kapanır */
  await p.evaluate(() => BT.wx.dur(0.5));
  await sleep(1200);
  R.w3 = await p.evaluate(() => ({ s: BT.wx.st(), toast: window.__toasts.slice(-4).join(' | ') }));
  ok(!R.w3.s.on && R.w3.s.after > 15 && R.w3.s.mul === 1.5, 'hava bitmedi / yağmur sonrası akış yok ' + JSON.stringify(R.w3));
  ok(/dindi|stopped/.test(R.w3.toast), 'yağmur bitti bildirimi yok ' + R.w3.toast);
  R.rAfter = await rate();
  await sleep(3500);
  R.w4 = await p.evaluate(() => ({ s: BT.wx.st() }));
  ok(R.w4.s.umb === 0, 'şemsiyeler kapanmadı ' + JSON.stringify(R.w4));
  await p.evaluate(() => BT.wx.stop(false)); await sleep(200);   /* (zaten bitti) */
  await p.evaluate(() => { const W = BT.wx.st(); return W; });
  /* normal akış: yağmur sonrası süre bitsin diye kısa yol — after'ı sıfırla */
  await p.evaluate(() => { BT.wx.start(); BT.wx.stop(false); });
  R.rNorm = await rate();
  ok(R.mulRain === 0.4, 'yağmur çarpanı yanlış ' + R.mulRain);
  ok(R.rRain < R.rNorm * 0.55 && R.rRain > R.rNorm * 0.25, 'yağmurda akış düşmedi ' + JSON.stringify([R.rRain, R.rNorm]));
  ok(R.rAfter > R.rNorm * 1.3, 'yağmur sonrası akış artmadı ' + JSON.stringify([R.rAfter, R.rNorm]));
  /* kayıt/yükleme: hava ve vapur sıfırlanır */
  R.save = await p.evaluate(() => { BT.wx.start(); BT.ferry.call(5); const d = BT.buildSave(); BT.loadFrom(d); return { wx: BT.wx.st().on, vis: BT.wx.st().vis, f: BT.ferry.st().ph }; });
  ok(!R.save.wx && R.save.vis === 0 && R.save.f === 0, 'yüklemede hava/vapur sıfırlanmadı ' + JSON.stringify(R.save));
  /* ---- 3. KLASİK MOD ---- */
  await p.evaluate(() => {
    HKG.setFine(false); document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    BT.S.tut = 99; BT.S.ctrl = 2; BT.day.phase = 'play'; BT.day.t = 40;
    const c = BT.counters[0]; for (let i = 0; i < 30; i++) c.buffer.push({ k: 'fileto', f: c.fish }); c.spawnT = 0;
    BT.player.x = 13.4; BT.player.y = 1.6; BT.ferry.call(5);
  });
  await sleep(7000);
  R.c1 = await p.evaluate(() => { const r = BT.wx.start(); return { r, s: BT.wx.st(), f: BT.ferry.st() }; });
  await sleep(2200);
  if (SHOT) await p.screenshot({ path: SHOT + '/canli-3-yagmur-klasik.png' });
  await sleep(1500);
  R.c2 = await p.evaluate(() => ({ s: BT.wx.st(), f: BT.ferry.st() }));
  ok(R.c1.r && R.c2.s.on && R.c2.s.vis > 0.9, 'klasik modda yağmur yok ' + JSON.stringify(R.c2));
  await p.evaluate(() => { BT.wx.stop(); HKG.setFine(true); }); await sleep(800);
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'CANLI_FAIL ' + JSON.stringify(fail) : 'CANLI_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
