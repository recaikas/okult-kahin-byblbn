/* v2.18-deneme — Tarif Defteri + Güveç Ocağı (TARIF_TASARIM.md §7):
   1) Kiler alımı parayı düşer, stoğu artırır (10'luk / 50'lik; malzeme başına sınır 50, Depo kurulunca 100)
   2) DENE: doğru kombinasyon tarifi açar (+40 itibar, malzeme harcanmaz), yanlış kombinasyon kiler malzemesini
      harcar (balık harcanmaz) ve en yakın tarifin ipucunu verir; başarımlar (Mutfağın Sırrı, Karadeniz Sofrası)
   3) Ocak kurulumu (YAPI › Geliştirme kartı, fiyat 1.200 → 1.800) ve tarif atama (OCAKLAR); ocak 4 sn'de bir tezgâh
      filetosunu yemeğe çevirir, kiler azalır, raf sınırı %50 aşılmaz; kiler boşsa "Kiler boş"; başında durunca/dokununca defter
   4) Yemek satılınca kazanç filetonun çarpan katı (sipariş tabelasında ve satışta güveç simgesi)
   5) Emekçi Mod açıkken ocak satıcı yokken bekler; oyuncu ya da Tezgâhtar gelince pişirir; mod kapalıyken hep pişirir
   6) Kayıt ve yükleme (defter, kiler, ocaklar, raftaki yemek); eski kayıt boş başlar; bozuk kayıt güvenle düzeltilir
   7) layoutClashes: ocaklar dahil yeni çakışma yok; dekor düzenleme ocak yerini engel sayar
   8) TR ve EN metinler
   + kapalıyken (HK_TARIF_OFF, eski testler) hiçbir şey değişmez.
   Ekran görüntüleri: SC_DIR (varsayılan screenshots/tarif), 390×844.
   Kullanım: URL=http://localhost:8106/index.html node test-tarif.js */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
const SC = (process.env.SC_DIR || __dirname + '/screenshots/tarif') + '/';
fs.mkdirSync(SC, { recursive: true });
const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = async (on) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(on => { if (on) window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = 0; }, on);   /* Emekçi Mod açık */
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
    return p;
  };
  const newGame = async p => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(700);
    await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; BT.S.cash = 5000; BT.achMute(true); BT.day.t = 10; BT.counters.forEach(c => { c.spawnT = 1e9; }); });
  };
  const noToast = p => p.evaluate(() => document.getElementById('toast').classList.remove('on'));
  const vis = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; }, s);
  const txt = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ') : ''; }, s);

  const p = await page(true);
  await newGame(p);
  R.boot = await p.evaluate(() => ({ on: BT.tarif.on(), emek: BT.emek.on(), q: BT.tarif.save(), btn: !document.getElementById('tarifBtn').classList.contains('hidden'), cap: BT.tarif.cap() }));
  ok(R.boot.on && R.boot.emek && !R.boot.btn && R.boot.cap === 50 && R.boot.q.known.length === 0 && !Object.keys(R.boot.q.ocak).length, 'açılış ' + JSON.stringify(R.boot));

  /* ================= 1) Kiler ================= */
  await p.evaluate(() => BT.tarif.open('kiler')); await sleep(200);
  R.k0 = await p.evaluate(() => ({ open: BT.tarif.isOpen(), paused: BT.paused(), cash: BT.S.cash }));
  ok(R.k0.open && R.k0.paused, 'defter açılmadı / oyun durmadı ' + JSON.stringify(R.k0));
  await p.click('#tfBody button[data-tb="misirunu"][data-tn="10"]'); await sleep(100);
  await p.click('#tfBody button[data-tb="pirinc"][data-tn="50"]'); await sleep(100);
  await p.click('#tfBody button[data-tb="sogan"][data-tn="10"]'); await sleep(100);
  R.k1 = await p.evaluate(() => ({ cash: BT.S.cash, k: Object.assign({}, BT.tarif.q().kiler) }));
  ok(R.k0.cash - R.k1.cash === 10 * 3 + 50 * 4 + 10 * 2 && R.k1.k.misirunu === 10 && R.k1.k.pirinc === 50 && R.k1.k.sogan === 10, 'kiler alımı ' + JSON.stringify({ a: R.k0, b: R.k1 }));
  await p.click('#tfBody button[data-tb="pirinc"][data-tn="10"]'); await sleep(100);        /* sınır 50: dolu */
  R.k2 = await p.evaluate(() => ({ cash: BT.S.cash, n: BT.tarif.q().kiler.pirinc, toast: document.getElementById('toast').textContent }));
  ok(R.k2.cash === R.k1.cash && R.k2.n === 50 && /dolu/.test(R.k2.toast), 'kiler sınırı 50 ' + JSON.stringify(R.k2));
  R.k3 = await p.evaluate(() => { BT.DEPOT.lvl = 1; const cap = BT.tarif.cap(), n = BT.tarif.buy('pirinc', 50), c0 = BT.S.cash; BT.S.cash = 1; const no = BT.tarif.buy('domates', 10); BT.S.cash = c0; BT.DEPOT.lvl = 0; return { cap, n, no, have: BT.tarif.q().kiler.pirinc, dom: BT.tarif.q().kiler.domates | 0, cap0: BT.tarif.cap() }; });
  ok(R.k3.cap === 100 && R.k3.n === 50 && R.k3.have === 100 && R.k3.no === 0 && R.k3.dom === 0 && R.k3.cap0 === 50, 'Depo ile sınır 100 / parasız alım ' + JSON.stringify(R.k3));
  await p.evaluate(() => { BT.tarif.q().kiler.pirinc = 40; BT.tarif.open('kiler'); }); await noToast(p); await sleep(250);
  await p.screenshot({ path: SC + '3-defter-kiler.png' });
  R.kTxt = await txt(p, '#tfBody');
  ok(/Mısır Unu/.test(R.kTxt) && /Stok 10\/50/.test(R.kTxt) && /\+50/.test(R.kTxt), 'KİLER sayfası ' + R.kTxt.slice(0, 160));

  /* ================= 2) DENE ================= */
  await p.click('#tfTabs .tab[data-tt="try"]'); await sleep(100);
  R.d0 = await p.evaluate(() => { const c = BT.counters[0]; c.buffer.length = 0; for (let i = 0; i < 6; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' }); BT.achMute(false);
    return { rep: BT.S.rep, cash: BT.S.cash, k: Object.assign({}, BT.tarif.q().kiler), buf: c.buffer.length, net: BT.spots[0].stock.length, fish: [...document.querySelectorAll('#tfBody [data-tf]')].map(b => b.dataset.tf) }; });
  ok(R.d0.fish.join() === 'hamsi', 'DENE balıkları (yalnız açık bölge) ' + JSON.stringify(R.d0.fish));
  /* yanlış: hamsi + pirinç */
  await p.click('#tfBody [data-tf="hamsi"]'); await p.click('#tfBody [data-ti="pirinc"]'); await p.click('#tfCook'); await sleep(150);
  R.bad = await p.evaluate(() => ({ k: Object.assign({}, BT.tarif.q().kiler), known: BT.tarif.q().known.slice(), rep: BT.S.rep, res: document.querySelector('#tfBody .tfRes').innerText, buf: BT.counters[0].buffer.length, net: BT.spots[0].stock.length, near: BT.tarif.near('hamsi', ['pirinc']).id }));
  ok(R.bad.k.pirinc === R.d0.k.pirinc - 1 && R.bad.k.misirunu === R.d0.k.misirunu && !R.bad.known.length && R.bad.rep === R.d0.rep, 'yanlış deneme malzemeyi harcamadı ' + JSON.stringify(R.bad));
  ok(R.bad.buf === R.d0.buf && R.bad.net === R.d0.net, 'yanlış denemede balık harcandı ' + JSON.stringify(R.bad));
  ok(/Olmadı/.test(R.bad.res) && /Hacer Teyze/.test(R.bad.res) && /Bayram sofrasının tacı/.test(R.bad.res) && R.bad.near === 'hamsipilav', 'ipucu yok / en yakın tarif yanlış ' + JSON.stringify(R.bad));
  /* doğru: hamsi + mısır unu */
  await p.click('#tfBody [data-ti="pirinc"]'); await p.click('#tfBody [data-ti="misirunu"]'); await p.click('#tfCook'); await sleep(700);
  await noToast(p);
  await p.screenshot({ path: SC + '2-dene-yeni-tarif.png' });
  R.good = await p.evaluate(() => ({ k: Object.assign({}, BT.tarif.q().kiler), known: BT.tarif.q().known.slice(), rep: BT.S.rep, cash: BT.S.cash, res: document.querySelector('#tfBody .tfRes').innerText.replace(/\s+/g, ' '), stamp: !!document.querySelector('#tfBody .tfStamp'), ach: BT.ach() }));
  ok(R.good.known.join() === 'hamsitava' && R.good.rep === R.d0.rep + 40 && R.good.k.misirunu === R.d0.k.misirunu, 'doğru deneme: tarif / +40 itibar / ücretsiz ' + JSON.stringify(R.good));
  ok(R.good.stamp && /YENİ TARİF!/.test(R.good.res) && /Hamsi Tava/.test(R.good.res) && /×2,0/.test(R.good.res), 'YENİ TARİF kartı ' + R.good.res);
  ok(R.good.ach.indexOf('tf_sir') >= 0 && R.good.ach.indexOf('tf_sofra') < 0, 'Mutfağın Sırrı başarımı ' + JSON.stringify(R.good.ach));
  R.again = await p.evaluate(() => { const r = BT.tarif.tryCook('hamsi', ['misirunu']); return { ok: r.ok, already: r.already, rep: BT.S.rep, n: BT.tarif.q().kiler.misirunu }; });
  ok(R.again.ok && R.again.already && R.again.rep === R.good.rep && R.again.n === R.good.k.misirunu, 'bilinen tarif tekrar ' + JSON.stringify(R.again));
  R.err = await p.evaluate(() => [BT.tarif.tryCook('hamsi', []).err, BT.tarif.tryCook('somon', ['sogan']).err, BT.tarif.tryCook('hamsi', ['karalahana']).err, BT.tarif.tryCook('hamsi', ['sogan', 'pirinc', 'misirunu']).err]);
  ok(R.err.join() === 'ing,fish,stock,ing', 'DENE geçersiz giriş ' + JSON.stringify(R.err));
  /* dört tarif: Karadeniz Sofrası */
  R.ach4 = await p.evaluate(() => {
    BT.areas[1].locked = false; BT.areas[2].locked = false; BT.rebuildCounters(); BT.setStall('b1', true); BT.setStall('b2', true);
    ['tereyagi', 'karalahana', 'domates'].forEach(g => BT.tarif.buy(g, 10));
    const a = BT.tarif.tryCook('hamsi', ['tereyagi', 'pirinc']).ok, b2 = BT.tarif.tryCook('uskumru', ['sogan', 'pirinc']).ok, n3 = BT.tarif.found(), a3 = BT.ach().indexOf('tf_sofra') >= 0;
    const c = BT.tarif.tryCook('levrek', ['domates', 'sogan']).ok;
    const out = { a, b2, c, n3, a3, n: BT.tarif.found(), ach: BT.ach().indexOf('tf_sofra') >= 0, fish: BT.tarif.tryFish() }; BT.achMute(true); BT.counters.forEach(q => { q.spawnT = 1e9; }); return out;
  });
  ok(R.ach4.a && R.ach4.b2 && R.ach4.c && R.ach4.n3 === 3 && !R.ach4.a3 && R.ach4.n === 4 && R.ach4.ach, 'Karadeniz Sofrası (4 tarif) ' + JSON.stringify(R.ach4));
  ok(R.ach4.fish.join() === 'hamsi,uskumru,levrek,ton', 'açık bölge balıkları ' + JSON.stringify(R.ach4.fish));
  await p.evaluate(() => { BT.achMute(true); BT.tarif.open('rec'); }); await noToast(p); await sleep(250);
  R.recTxt = await txt(p, '#tfBody');
  ok(/Hamsi Tava/.test(R.recTxt) && /Levrek Buğulama/.test(R.recTxt) && /\?\?\?\?\?/.test(R.recTxt) && /İpucu: Büyük balığa sade sofra/.test(R.recTxt) && /Balıkçı Mutfağı açılınca/.test(R.recTxt), 'TARİFLER sayfası ' + R.recTxt.slice(0, 300));
  await p.screenshot({ path: SC + '1-defter-tarifler.png' });
  await p.click('#tfClose'); await sleep(100);

  /* ================= 3) Ocak: kurulum, atama, pişirme, %50 ================= */
  await p.evaluate(() => { BT.S.cash = 5000; }); await p.click('.dtab[data-t="build"]'); await sleep(150);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#dpSub button')].find(x => x.dataset.s === 'dev'); if (b) b.click(); }); await sleep(150);
  R.card = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')).filter(t => /Güveç Ocağı/.test(t)));
  ok(R.card.length === 3 && /Balıkçı İskelesi · Hamsi/.test(R.card[0]) && /1\.200/.test(R.card[0]), 'YAPI › Geliştirme ocak kartları ' + JSON.stringify(R.card));
  await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Güveç Ocağı · Balıkçı İskelesi/.test(d.innerText)); c.querySelector('.buy').click(); }); await sleep(200);
  R.st1 = await p.evaluate(() => ({ cash: BT.S.cash, o: JSON.parse(JSON.stringify(BT.tarif.q().ocak)), cost2: BT.tarif.stoveCost(), btn: !document.getElementById('tarifBtn').classList.contains('hidden'),
    card: [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')).filter(t => /Güveç Ocağı/.test(t)) }));
  ok(R.st1.cash === 5000 - 1200 && R.st1.o.b0 && R.st1.o.b0.r === 'hamsitava' && R.st1.o.b0.lv === 1, 'ocak kurulumu / ilk tarif atanmadı ' + JSON.stringify(R.st1));
  ok(R.st1.cost2 === 1800 && R.st1.btn && R.st1.card.some(t => /1\.800/.test(t)) && R.st1.card.some(t => /İskele/.test(t) && /TARİF DEFTERİ/.test(t)), 'ikinci ocak fiyatı / HUD düğmesi ' + JSON.stringify(R.st1));
  await p.evaluate(() => { BT.closeOverlays(); document.querySelector('#dpClose') && document.querySelector('#dpClose').click(); });
  R.st2 = await p.evaluate(() => { const a = BT.tarif.buyStove('b1'), c2 = BT.tarif.stoveCost(), no = BT.tarif.buyStove('b1'), no3 = BT.tarif.buyStove('b3'); return { a, c2, no, no3, o: Object.keys(BT.tarif.q().ocak), r1: BT.tarif.q().ocak.b1.r, cash: BT.S.cash }; });
  ok(R.st2.a && R.st2.c2 === 2600 && !R.st2.no && !R.st2.no3 && R.st2.o.join() === 'b0,b1' && R.st2.r1 === 'uskumrudolma' && R.st2.cash === 3800 - 1800, 'ikinci ocak ' + JSON.stringify(R.st2));
  /* OCAKLAR: tarif atama (hamsinin bilinen iki tarifi) */
  await p.click('#tarifBtn'); await sleep(150); await p.click('#tfTabs .tab[data-tt="ocak"]'); await sleep(100);
  await p.click('#tfBody button[data-to="b0"][data-tr="hamsipilav"]'); await sleep(100);
  R.as1 = await p.evaluate(() => BT.tarif.q().ocak.b0.r);
  await p.click('#tfBody button[data-to="b0"][data-tr="hamsitava"]'); await sleep(100);
  R.as2 = await p.evaluate(() => ({ r: BT.tarif.q().ocak.b0.r, bad: BT.tarif.setRecipe('b0', 'uskumrudolma'), bad2: BT.tarif.setRecipe('b0', 'karalahana'), r2: BT.tarif.q().ocak.b0.r }));
  ok(R.as1 === 'hamsipilav' && R.as2.r === 'hamsitava' && !R.as2.bad && !R.as2.bad2 && R.as2.r2 === 'hamsitava', 'ocak tarif atama ' + JSON.stringify({ a: R.as1, b: R.as2 }));
  await p.click('#tfClose'); await sleep(100);
  /* pişirme: 4 sn'de bir, kiler azalır, %50 sınırı */
  R.cook = await p.evaluate(() => {
    const c = BT.counters[0], P = BT.player, q = BT.tarif.q();
    BT.customers.length = 0; c.slots.fill(null);
    c.buffer.length = 0; const max = BT.counterMax(c); for (let i = 0; i < max; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    q.kiler.misirunu = 10; P.x = c.x - 0.9; P.y = c.y + 0.2; BT.day.t = 10;
    BT.emek.step(0.05, 78); const d39 = BT.tarif.dishes('b0');
    BT.emek.step(0.05, 4); const d41 = BT.tarif.dishes('b0'), k41 = q.kiler.misirunu, it = c.buffer.find(x => x.dish);
    q.kiler.misirunu = 50; let peak = 0;
    for (let i = 0; i < 1600; i++) { if (BT.day.t > 200) BT.day.t = 10; BT.emek.step(0.05); peak = Math.max(peak, BT.tarif.dishes('b0')); }   /* 80 sn */
    return { max, d39, d41, k41, it, peak, cap: BT.tarif.shelfCap('b0'), len: c.buffer.length, st: BT.tarif.state('b0'), k: q.kiler.misirunu };
  });
  ok(R.cook.d39 === 0 && R.cook.d41 === 1 && R.cook.k41 === 9 && R.cook.it && R.cook.it.k === 'fileto' && R.cook.it.f === 'hamsi' && R.cook.it.dish === 'hamsitava', '4 sn\'de bir yemek / kiler azalmadı ' + JSON.stringify(R.cook));
  ok(R.cook.cap === Math.floor(R.cook.max * 0.5) && R.cook.peak === R.cook.cap && R.cook.len === R.cook.max && R.cook.st === 'full' && R.cook.k === 50 - (R.cook.cap - 1), 'raf sınırı %50 ' + JSON.stringify(R.cook));
  R.empty = await p.evaluate(() => { const c = BT.counters[0], q = BT.tarif.q(); c.buffer.splice(0, c.buffer.length, ...c.buffer.filter(x => !x.dish).slice(0, 4)); q.kiler.misirunu = 0; BT.emek.step(0.05, 100); return { st: BT.tarif.state('b0'), d: BT.tarif.dishes('b0'), n: c.buffer.length }; });
  ok(R.empty.st === 'kiler' && R.empty.d === 0 && R.empty.n === 4, 'kiler boşken ocak beklemedi ' + JSON.stringify(R.empty));
  /* ocağın başında durunca o ocağın sayfası açılır (bir kez) */
  R.stand = await p.evaluate(() => {
    const s = BT.tarif.pos('b0'), P = BT.player; P.x = s.x + 0.2; P.y = s.y + 0.1;
    BT.emek.step(0.05, 6); const early = BT.tarif.isOpen();
    BT.emek.step(0.05, 12); const open = BT.tarif.isOpen(), sel = document.querySelector('#tfBody .tfOcak.sel') && document.querySelectorAll('#tfBody .tfOcak').length;
    const t = document.querySelector('#tfBody').innerText;
    BT.tarif.close(); BT.emek.step(0.05, 30); const again = BT.tarif.isOpen();
    P.x = s.x + 2; BT.emek.step(0.05, 2); P.x = s.x + 0.2; BT.emek.step(0.05, 20); const back = BT.tarif.isOpen(); BT.tarif.close();
    return { early, open, sel, kiler: /Kiler boş/.test(t), again, back };
  });
  ok(!R.stand.early && R.stand.open && R.stand.sel === 1 && R.stand.kiler && !R.stand.again && R.stand.back, 'ocağın başında durunca sayfa açılmadı ' + JSON.stringify(R.stand));
  /* dünyada ocağa dokun */
  await p.evaluate(() => { BT.player.x = 4.6; BT.player.y = 4.6; BT.tarif.q().kiler.misirunu = 30; }); await sleep(400);
  const sp = await p.evaluate(() => { const s = BT.tarif.pos('b0'); return BT.arr.css(s.x, s.y); });
  await p.mouse.click(sp[0], sp[1] - 12); await sleep(250);
  R.tap = await p.evaluate(() => ({ open: BT.tarif.isOpen(), n: document.querySelectorAll('#tfBody .tfOcak').length, t: document.querySelector('#tfBody').innerText.replace(/\s+/g, ' ') }));
  ok(R.tap.open && R.tap.n === 1 && /İskele/.test(R.tap.t), 'ocağa dokununca sayfa açılmadı ' + JSON.stringify(R.tap));
  await noToast(p); await sleep(150);
  await p.screenshot({ path: SC + '5-defter-ocak-sayfasi.png' });
  await p.click('#tfClose'); await sleep(100);

  /* ================= 4) Satış: yemek fileto × çarpan ================= */
  const sale = async dish => p.evaluate(dish => {
    const c = BT.counters[0], P = BT.player;
    BT.customers.length = 0; c.slots.fill(null); c.tray.items.length = 0; c.buffer.length = 0;
    c.buffer.push(dish ? { k: 'fileto', f: 'hamsi', dish: 'hamsitava' } : { k: 'fileto', f: 'hamsi' });
    BT.tarif.setRecipe('b0', null);                                /* satış sırasında ocak çevirmesin */
    P.x = c.x - 0.9; P.y = c.y + 0.2;
    const ty = BT.CUST.find(t => !t.tag) || BT.CUST[0];
    const cu = { x: 10.8, y: c.y + 0.1, z: 0, bob: 0, face: -1, type: ty, ord: { k: 'fileto', f: 'hamsi', need: 1, got: 0 }, state: 'wait', slot: 0, c: c, pat: 500, patMax: 500, mood: 1, hair: 0, tone: 0 };
    c.slots[0] = cu; BT.customers.push(cu); c.eatT = 0; c.spawnT = 1e9;
    const fx0 = BT.tarif.fx.length;
    for (let i = 0; i < 100 && cu.state === 'wait'; i++) BT.emek.step(0.05);
    const pay = c.tray.items.reduce((s, it) => s + it.v, 0);
    return { pay: Math.round(pay), state: cu.state, got: cu.ord.got, dm: cu.ord.dm || 0, fx: BT.tarif.fx.length - fx0, mul: BT.tarif.ordMul(cu.ord) };
  }, dish);
  R.s0 = await sale(false); R.s1 = await sale(true);
  ok(R.s0.state === 'leave' && R.s1.state === 'leave' && R.s0.pay > 0, 'satış olmadı ' + JSON.stringify([R.s0, R.s1]));
  ok(Math.abs(R.s1.pay - R.s0.pay * 2.0) <= 1 && R.s1.mul === 2 && R.s0.mul === 1 && R.s1.fx === 1 && R.s0.fx === 0, 'yemek kazancı fileto × 2,0 değil ' + JSON.stringify([R.s0, R.s1]));
  /* karışık sipariş: 2 fileto + 1 yemek → (2 + 2,0) / 3 */
  R.mix = await p.evaluate(() => { const o = { need: 3, dm: 0 }; return BT.tarif.ordMul({ need: 3, dm: 1.0 }); });
  ok(Math.abs(R.mix - 4 / 3) < 1e-9, 'karışık sipariş çarpanı ' + R.mix);

  /* görüntü: İskele tezgâhı, yanında ocak, yemekli raf, yemekli sipariş tabelası */
  await p.evaluate(() => {
    const c = BT.counters[0], q = BT.tarif.q();
    BT.tarif.setRecipe('b0', 'hamsitava'); q.kiler.misirunu = 30;
    BT.customers.length = 0; c.slots.fill(null); c.buffer.length = 0;
    for (let i = 0; i < 5; i++) c.buffer.push({ k: 'fileto', f: 'hamsi', dish: 'hamsitava' });
    for (let i = 0; i < 4; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    const ty = BT.CUST.find(t => !t.tag) || BT.CUST[0];
    const cu = { x: 10.8, y: c.y + 0.1, z: 0, bob: 0, face: -1, type: ty, ord: { k: 'fileto', f: 'hamsi', need: 3, got: 0 }, state: 'wait', slot: 0, c: c, pat: 500, patMax: 500, mood: 1, hair: 0, tone: 0 };
    c.slots[0] = cu; BT.customers.push(cu); c.eatT = 99;
    BT.player.x = 6.2; BT.player.y = 4.9; BT.day.t = 40;
    window.__tf = setInterval(() => { c.eatT = 99; }, 50);
  });
  R.sign = await p.evaluate(() => { const c = BT.counters[0]; return c.buffer.find(x => x.k === 'fileto' && x.f === 'hamsi').dish || null; });
  ok(R.sign === 'hamsitava', 'sipariş tabelası için sıradaki mal yemek değil ' + R.sign);
  await noToast(p); await sleep(5000);
  await noToast(p); await sleep(300);
  await p.screenshot({ path: SC + '4-ocak-tezgah-yemekli-raf.png' });
  await p.evaluate(() => { const z = document.querySelector('#zoomSeg button[data-z="4"]') || document.querySelector('#zoomSeg button[data-z="3"]'); if (z) z.click(); BT.closeOverlays(); }); await noToast(p); await sleep(900);
  await p.screenshot({ path: SC + '4c-ocak-yakin.png' });
  await p.evaluate(() => { const z = document.querySelector('#zoomSeg button[data-z="2"]'); if (z) z.click(); BT.closeOverlays(); });
  await p.evaluate(() => { window.HKG.setFine(false); }); await sleep(500);
  await p.screenshot({ path: SC + '4b-ocak-tezgah-klasik.png' });
  await p.evaluate(() => { window.HKG.setFine(true); clearInterval(window.__tf); BT.customers.length = 0; BT.counters[0].slots.fill(null); });

  /* ================= 5) Emekçi Mod: satıcı yokken bekler ================= */
  R.emek = await p.evaluate(() => {
    const c = BT.counters[0], P = BT.player, q = BT.tarif.q(), o = {};
    BT.customers.length = 0; c.slots.fill(null); BT.workers.length = 0;
    const fill = () => { c.buffer.length = 0; for (let i = 0; i < 10; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' }); q.kiler.misirunu = 30; };
    fill(); P.x = 3.0; P.y = 4.8; BT.day.t = 10;                /* uzakta */
    BT.emek.step(0.05, 240); o.alone = BT.tarif.dishes('b0'); o.st = BT.tarif.state('b0');
    P.x = c.x - 0.9; P.y = c.y + 0.2;
    BT.emek.step(0.05, 170); o.player = BT.tarif.dishes('b0');
    fill(); P.x = 3.0; P.y = 4.8;
    const v = BT.hire('tezgahtar', true, 0); BT.emek.step(0.05, 80); fill();
    BT.emek.step(0.05, 170); o.vendor = BT.tarif.dishes('b0'); o.hasV = !!v;
    BT.workers.length = 0;
    BT.emek.set(0); fill(); BT.emek.step(0.05, 170); o.off = BT.tarif.dishes('b0'); BT.emek.set(1);
    return o;
  });
  ok(R.emek.alone === 0 && R.emek.st === 'nobody', 'Emekçi Mod: satıcısız ocak pişirdi ' + JSON.stringify(R.emek));
  ok(R.emek.player === 2 && R.emek.vendor >= 1 && R.emek.off === 2, 'Emekçi Mod: oyuncu / Tezgâhtar / mod kapalı ' + JSON.stringify(R.emek));

  /* ================= 6) Kayıt ve yükleme ================= */
  R.snap = await p.evaluate(() => {
    const c = BT.counters[0], q = BT.tarif.q();
    c.buffer.length = 0; c.buffer.push({ k: 'fileto', f: 'hamsi' }, { k: 'fileto', f: 'hamsi', dish: 'hamsipilav' }, { k: 'fileto', f: 'hamsi', dish: 'hamsitava' });
    q.kiler = { misirunu: 7, pirinc: 33, sogan: 2 }; BT.tarif.setRecipe('b0', 'hamsipilav');
    BT.customers.length = 0; c.slots.fill(null);
    BT.saveNow();
    const sv = JSON.parse(localStorage.getItem('balikci_slot_1'));
    return { t: sv.tarif, buf: sv.q.find(e => e[0] === 'b0')[1], q: JSON.stringify(BT.tarif.save()) };
  });
  ok(R.snap.t && R.snap.t.known.length === 4 && R.snap.t.kiler.pirinc === 33 && R.snap.t.ocak.b0.r === 'hamsipilav' && R.snap.t.ocak.b1 && JSON.stringify(R.snap.t.sandik) === '{}', 'kayıtta tarif yok ' + JSON.stringify(R.snap.t));
  ok(R.snap.buf.join() === 'fileto|hamsi,fileto|hamsi|hamsipilav,fileto|hamsi|hamsitava', 'raf kaydında yemek yok ' + JSON.stringify(R.snap.buf));
  await p.reload(); await sleep(900);
  await p.click('#playBtn'); await sleep(700);
  R.load = await p.evaluate(() => ({ started: BT.S.started, q: JSON.stringify(BT.tarif.save()), buf: BT.counters[0].buffer.map(x => x.dish || x.k), btn: !document.getElementById('tarifBtn').classList.contains('hidden') }));
  ok(R.load.started && R.load.q === R.snap.q, 'yükleme sonrası defter farklı ' + JSON.stringify({ a: R.snap.q, b: R.load.q }));
  ok(R.load.buf.join() === 'fileto,hamsipilav,hamsitava' && R.load.btn, 'yükleme sonrası raftaki yemek / HUD ' + JSON.stringify(R.load));
  R.old = await p.evaluate(() => {
    const sv = BT.buildSave(); delete sv.tarif; sv.q.forEach(e => { e[1] = e[1].map(k => k.split('|').slice(0, 2).join('|')); });
    const ok1 = BT.loadFrom(JSON.parse(JSON.stringify(sv))), s1 = BT.tarif.save();
    const sv2 = BT.buildSave();
    sv2.tarif = { known: ['x', 'hamsitava', 5, 'reisguveci', 'hamsitava'], kiler: { misirunu: 'çok', pirinc: 9999, zz: 3, sogan: -4 }, ocak: { b0: { r: 'uskumrudolma' }, b9: {}, b1: null, b2: { r: 'levrekbugulama', lv: 9 } }, sandik: 'x' };
    sv2.q.forEach(e => { if (e[0] === 'b0') e[1] = ['fileto|hamsi|uskumrudolma', 'fileto|hamsi|hamsitava', 'fume|hamsi|hamsitava', 'fileto|hamsi|<b>']; });
    const ok2 = BT.loadFrom(JSON.parse(JSON.stringify(sv2))), s2 = BT.tarif.save();
    const sv3 = BT.buildSave(); sv3.tarif = 'bozuk'; const ok3 = BT.loadFrom(sv3), s3 = BT.tarif.save();
    return { ok1, s1, ok2, s2, ok3, s3, buf: BT.counters[0].buffer.map(x => x.dish || x.k) };
  });
  ok(R.old.ok1 && R.old.s1.known.length === 0 && !Object.keys(R.old.s1.kiler).length && !Object.keys(R.old.s1.ocak).length, 'eski kayıt boş başlamadı ' + JSON.stringify(R.old.s1));
  ok(R.old.ok2 && R.old.s2.known.join() === 'hamsitava' && JSON.stringify(R.old.s2.kiler) === '{"pirinc":100}' && JSON.stringify(R.old.s2.ocak) === '{"b0":{"lv":1,"r":null},"b2":{"lv":1,"r":"levrekbugulama"}}' && JSON.stringify(R.old.s2.sandik) === '{}', 'bozuk kayıt düzeltilmedi ' + JSON.stringify(R.old.s2));
  ok(R.old.ok3 && R.old.s3.known.length === 0, 'bozuk tarif alanı ' + JSON.stringify(R.old.s3));

  /* ================= 7) Yerleşim: ocaklar dahil çakışma yok ================= */
  R.lay = await p.evaluate(() => {
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.project.done = true; BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    const rs = BT.layoutRects().filter(r => /güveç ocağı/.test(r.id));
    const cl = BT.layoutClashes(0.1);
    const why = Object.keys(BT.tarif.K.POS).map(k => { const s = BT.tarif.K.POS[k]; return BT.arr.why(s.x, s.y); });
    const st = BT.tarif.buyStove('hal');
    return { n: rs.length, ids: rs.map(r => r.id), cl, why, st, dec: BT.decorClearance().filter(d => !d.ok).map(d => d.id) };
  });
  ok(R.lay.n === 4 && R.lay.cl.length === 0 && R.lay.dec.length === 0, 'yerleşim çakışması ' + JSON.stringify(R.lay));
  ok(R.lay.why.every(w => w !== ''), 'dekor düzenleme ocak yerini engel saymadı ' + JSON.stringify(R.lay.why));
  ok(R.lay.st, 'Kapalı Pazar ocağı kurulamadı ' + JSON.stringify(R.lay));

  /* ================= 8) TR / EN ================= */
  R.lang = await p.evaluate(() => {
    const tr = BT.STR.tr, en = BT.STR.en, keys = Object.keys(tr).filter(k => /^tf/.test(k));
    const miss = keys.filter(k => typeof en[k] !== 'string' || !en[k].length);
    const recs = BT.tarif.list.every(r => r.n.tr && r.n.en && r.h.tr && r.h.en) && BT.tarif.ing.every(g => g.n.tr && g.n.en);
    const ach = BT.ACH.filter(a => /^tf_/.test(a.id)).map(a => a.t.en + '|' + a.d.en);
    BT.tarif.q().known.push('hamsitava'); BT.setLang('en'); BT.tarif.open('rec');
    const t1 = document.getElementById('tarifScr').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('kiler'); const t2 = document.getElementById('tfBody').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('try'); const t3 = document.getElementById('tfBody').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('ocak'); const t4 = document.getElementById('tfBody').innerText.replace(/\s+/g, ' ');
    const r = BT.tarif.tryCook('hamsi', ['sogan']);
    BT.tarif.close(); BT.setLang('tr');
    return { n: keys.length, miss, recs, ach, t1, t2, t3, t4, help: !!(BT.help().keys.indexOf('tarif') >= 0) };
  });
  ok(R.lang.n > 40 && !R.lang.miss.length && R.lang.recs, 'İngilizce metin eksik ' + JSON.stringify(R.lang.miss));
  ok(/RECIPE BOOK/.test(R.lang.t1) && /RECIPES/.test(R.lang.t1) && /PANTRY/.test(R.lang.t1) && /STOVES/.test(R.lang.t1) && /Fried Anchovy/.test(R.lang.t1) && /Hint: A big fish wants a simple table/.test(R.lang.t1), 'EN defter ' + R.lang.t1.slice(0, 300));
  ok(/Cornmeal/.test(R.lang.t2) && /Collard Greens/.test(R.lang.t2) && /COOK/.test(R.lang.t3) && /Stew Stove/.test(R.lang.t4) && R.lang.ach.join().indexOf('The Kitchen\'s Secret') >= 0 && R.lang.ach.join().indexOf('Black Sea Table') >= 0 && R.lang.help, 'EN sayfalar ' + JSON.stringify([R.lang.t2.slice(0, 80), R.lang.t4.slice(0, 80), R.lang.ach]));
  ok(!/[ğışçöüĞİŞÇÖÜ]/.test(R.lang.t2 + R.lang.t3), 'EN sayfada Türkçe harf ' + R.lang.t3.slice(0, 200));

  /* ================= kapalıyken (HK_TARIF_OFF): hiçbir şey değişmez ================= */
  const q = await page(false);
  await newGame(q);
  R.off = await q.evaluate(() => {
    const c = BT.counters[0]; c.buffer.length = 0; for (let i = 0; i < 6; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    BT.tarif.q().ocak.b0 = { lv: 1, r: 'hamsitava' }; BT.tarif.q().known.push('hamsitava'); BT.tarif.q().kiler.misirunu = 10;   /* kayıttan gelmiş olsa bile */
    BT.player.x = c.x - 0.9; BT.player.y = c.y + 0.2;
    BT.emek.step(0.05, 300);
    const buy = BT.tarif.buy('pirinc', 10), st = BT.tarif.buyStove('b0'), tr = BT.tarif.tryCook('hamsi', ['misirunu']);
    BT.tarif.open('rec');
    return { on: BT.tarif.on(), dish: c.buffer.filter(x => x.dish).length, buy, st, tr: tr.err, open: BT.tarif.isOpen(), btn: !document.getElementById('tarifBtn').classList.contains('hidden'), ach: BT.ACH_IDS().filter(id => /^tf_/.test(id)), lay: BT.layoutClashes(0.1).length };
  });
  await q.click('.dtab[data-t="build"]'); await sleep(150);
  R.off.card = await q.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].some(d => /Güveç/.test(d.innerText)));
  ok(!R.off.on && R.off.dish === 0 && R.off.buy === 0 && !R.off.st && R.off.tr === 'off' && !R.off.open && !R.off.btn && !R.off.ach.length && !R.off.card && R.off.lay === 0, 'kapalıyken tarif sistemi çalışıyor ' + JSON.stringify(R.off));

  ok(!errs.length, 'sayfa hataları: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1).slice(0, 7000));
  await b.close();
  if (fail.length) { console.log('BAŞARISIZ (' + fail.length + '):\n- ' + fail.join('\n- ')); process.exit(1); }
  console.log('test-tarif: TAMAM');
})().catch(e => { console.error(e); process.exit(1); });
