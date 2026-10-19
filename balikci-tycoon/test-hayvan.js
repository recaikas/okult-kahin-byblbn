/* v2.18-deneme — Hayvanlar: kedi + Karabaş köpek (HAYVAN_TASARIM.md):
   1) sokak kedisine 3 FARKLI günde mama (MAMA KOY düğmesi) → sahiplenme kartı; ev Süs Sandığı'na gelir
   2) tezgâha atama: kedi o tezgâhın kuyruğunda sabrı +%15 artırır (sabır azalması ölçülür; Emekçi Mod açık ve kapalı)
   3) köpek: Haşmet gelince havlar, Haşmet zıplar ve repliklerden birini söyler; köpeksiz tezgâhtan martı fileto kapar, köpekliden kapamaz
   4) mama ve keyif: mama verilmezse küser (etkisiz, İskele'de dolaşır), verilince döner; sevme günde 3 kez, dünyada dokununca da
   5) kayıt ve yükleme (hayvanlar, keyif, atama, ev konumu); eski kayıt hayvansız yüklenir; gece evinde uyur
   6) tezgâh başına en çok 1 kedi ve 1 köpek; hak bölge başına; bozuk kayıt düzeltilir
   + hayvan sistemi kapalıyken (HK_PET_OFF, eski testler) hiçbir şey değişmez; martı kaybı yok.
   Ekran görüntüleri: SC_DIR (varsayılan screenshots/hayvan).
   Kullanım: URL=http://localhost:8106/index.html node test-hayvan.js */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
const SC = (process.env.SC_DIR || __dirname + '/screenshots/hayvan') + '/';
fs.mkdirSync(SC, { recursive: true });
const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const page = async (pets, emek) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(([pt, em]) => { if (pt) window.HK_PET_OFF = 0; if (em) window.HK_EMEK_OFF = 0; }, [pets, emek]);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
    return p;
  };
  const newGame = async p => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(700);
    await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; BT.S.cash = 2000; BT.achMute(true); BT.day.t = 10; BT.counters.forEach(c => { c.spawnT = 1e9; }); });
  };
  const noToast = p => p.evaluate(() => document.getElementById('toast').classList.remove('on'));
  const vis = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; }, s);

  const p = await page(true, true);
  await newGame(p);

  /* ================= 1) sokak kedisi: 3 farklı günde mama ================= */
  R.pre = await p.evaluate(() => { BT.day.n = 2; BT.emek.step(0.05, 4); return { on: BT.pet.on(), cat: !!BT.pet.stray('cat'), dog: !!BT.pet.stray('dog') }; });
  ok(R.pre.on && !R.pre.cat && !R.pre.dog, '2. günde sokak hayvanı var ' + JSON.stringify(R.pre));
  /* oyuncu hayvanın yanına gider, MAMA KOY düğmesi görünür, basılır */
  const feedDay = async (k, n, shot) => {
    await p.evaluate(([k, n]) => { BT.day.n = n; BT.day.t = 10; BT.emek.step(0.05, 2); const s = BT.pet.stray(k); s.tx = null; s.t = 99; BT.player.x = s.x - 0.5; BT.player.y = s.y - 0.3; BT.player.vx = 0; BT.player.vy = 0; }, [k, n]);
    await sleep(350);
    const st = { btn: await vis(p, '#actBtn'), txt: await p.textContent('#actBtn'), cash: await p.evaluate(() => BT.S.cash) };
    if (shot) { await noToast(p); await sleep(250); await p.screenshot({ path: SC + shot }); }
    await p.click('#actBtn'); await sleep(250);
    st.cash2 = await p.evaluate(() => BT.S.cash);
    st.sd = await p.evaluate(k => BT.pet.q().sd[k].slice(), k);
    st.after = await vis(p, '#actBtn');
    return st;
  };
  R.f1 = await feedDay('cat', 3, '1-sokak-kedisine-mama.png');
  ok(R.f1.btn && /MAMA KOY/.test(R.f1.txt) && /15/.test(R.f1.txt) && /1\/3/.test(R.f1.txt), 'MAMA KOY düğmesi yok ' + JSON.stringify(R.f1));
  ok(R.f1.cash - R.f1.cash2 === 15 && R.f1.sd.join() === '3' && !R.f1.after, '1. gün mama ' + JSON.stringify(R.f1));
  R.f1b = await p.evaluate(() => { const r = BT.pet.feedNear(); return { r, sd: BT.pet.q().sd.cat.length }; });   /* aynı gün ikinci kez olmaz */
  ok(!R.f1b.r && R.f1b.sd === 1, 'aynı gün iki kez mama sayıldı ' + JSON.stringify(R.f1b));
  R.f2 = await feedDay('cat', 4);
  ok(/2\/3/.test(R.f2.txt) && R.f2.sd.join() === '3,4', '2. gün mama ' + JSON.stringify(R.f2));
  R.f3 = await feedDay('cat', 5);
  R.adopt = await p.evaluate(() => {
    const l = BT.pet.list(), h = BT.decorById('kedievi0');
    return { n: l.length, name: l[0] && l[0].n, k: l[0] && l[0].k, c: l[0] && l[0].c, card: BT.pet.card(), title: document.getElementById('petT').textContent, txt: document.getElementById('petP').textContent,
      house: [h.got, h.box], dbox: BT.S.dbox.slice(), stray: !!BT.pet.stray('cat'), sd: BT.pet.q().sd.cat.length, paused: BT.paused(), shop: BT.pads.some(q => q.kind === 'decor' && BT.decor[q.decor].pet) };
  });
  ok(R.adopt.n === 1 && R.adopt.name === 'Pamuk' && R.adopt.k === 'cat' && R.adopt.card && /Pamuk artık senin/.test(R.adopt.txt) && R.adopt.paused, 'sahiplenme kartı ' + JSON.stringify(R.adopt));
  ok(R.adopt.house[0] && R.adopt.house[1] && R.adopt.dbox.indexOf('kedievi0') >= 0 && !R.adopt.shop, 'kedi evi Süs Sandığı\'na gelmedi ' + JSON.stringify(R.adopt));
  ok(!R.adopt.stray && R.adopt.sd === 0 && R.adopt.c === 'b0', 'sahiplenme sonrası sokak kedisi / atama ' + JSON.stringify(R.adopt));
  await p.click('#petGo'); await sleep(150);
  ok(!(await p.evaluate(() => BT.pet.card())), 'kart kapanmadı');

  /* ================= 2) kedi: sabır +%15 (Emekçi Mod açık ve kapalı) ================= */
  const patTest = async emek => p.evaluate(emek => {
    BT.emek.set(emek);
    const c = BT.counters[0], cat = BT.pet.list()[0];
    BT.counters.forEach(q => { q.spawnT = 1e9; }); BT.customers.length = 0; c.slots.fill(null);
    BT.pet.assign(cat, 'b0');
    c.buffer.length = 0; c.buffer.push({ k: 'fileto', f: c.fish });
    c.spawnT = 0; BT.day.t = 10;
    let cu = null;
    for (let i = 0; i < 400 && !(cu && cu.state === 'wait'); i++) { BT.emek.step(0.05); c.spawnT = 1e9; cu = c.slots.find(q => q); }
    c.buffer.length = 0;                                       /* satış olmasın: yalnız sabır akar */
    if (!cu) return { err: 'müşteri gelmedi' };
    const drop = () => { cu.pat = cu.patMax; const a = cu.pat; BT.emek.step(0.05, 100); BT.day.t = 10; return a - cu.pat; };
    const withCat = drop();
    BT.pet.assign(cat, null); const without = drop();
    BT.pet.assign(cat, 'b0');
    const out = { withCat: +withCat.toFixed(3), without: +without.toFixed(3), ratio: +(without / withCat).toFixed(3), pat: BT.pet.pat('b0'), flow: BT.pet.flow('b0'), flow1: BT.pet.flow('b1') };
    cu.state = 'leave'; c.slots.fill(null);
    return out;
  }, emek);
  R.patE = await patTest(1); R.patO = await patTest(0);
  [R.patE, R.patO].forEach((r, i) => {
    ok(!r.err && Math.abs(r.ratio - 1.15) < 0.02 && r.pat === 1.15, (i ? 'kapalı' : 'Emekçi') + ' modda kedi sabrı +%15 değil ' + JSON.stringify(r));
    ok(Math.abs(r.flow - 1.05) < 1e-9 && r.flow1 === 1, 'kedi müşteri sıklığı +%5 değil ' + JSON.stringify(r));
  });
  await p.evaluate(() => BT.emek.set(1));

  /* ================= 3) köpek: sahiplenme, Haşmet, martı ================= */
  R.d1 = await feedDay('dog', 5);                               /* 5. günde sokak köpeği de gelmişti */
  R.d2 = await feedDay('dog', 6); R.d3 = await feedDay('dog', 7);
  R.dog = await p.evaluate(() => { const d = BT.pet.list()[1]; return d ? { n: d.n, k: d.k, c: d.c, house: BT.decorById('kulube0').box, card: BT.pet.card() } : null; });
  ok(R.dog && R.dog.n === 'Karabaş' && R.dog.k === 'dog' && R.dog.c === 'b0' && R.dog.house && R.dog.card, 'Karabaş sahiplenilmedi ' + JSON.stringify(R.dog));
  await p.click('#petGo'); await sleep(100);
  R.flow2 = await p.evaluate(() => BT.pet.flow('b0'));
  ok(Math.abs(R.flow2 - 1.08) < 1e-9, 'kedi + köpek sıklığı +%8 değil ' + R.flow2);
  /* görüntü: tezgâh önünde kedi + köpek */
  await p.evaluate(() => {
    const c = BT.counters[0];
    c.buffer.length = 0; for (let i = 0; i < 5; i++) c.buffer.push({ k: 'fileto', f: c.fish });
    BT.pet.list().forEach(q => { const s = BT.pet.spot(q); q.x = s.x; q.y = s.y; q.st = 'sit'; q.t = 30; q.love = q.k === 'cat' ? 1.5 : 0; });
    BT.player.x = 6.4; BT.player.y = 4.7; BT.day.t = 40;
  });
  await noToast(p); await sleep(500);
  await p.screenshot({ path: SC + '2-tezgah-kedi-kopek.png' });

  /* Haşmet geliyor: köpek havlar, Haşmet zıplar ve söylenir */
  R.tax = await p.evaluate(() => {
    const q = BT.tax.q(); q.items = 6; q.due = 12; q.by = { b0: [6, 12] };
    BT.tax.start(); const T = BT.tax.st(); T.x = 11.4; T.y = 6.2; return { on: T.on };
  });
  let bark = null;
  for (let i = 0; i < 30 && !bark; i++) { await sleep(100); bark = await p.evaluate(() => BT.pet.fx.barkT > 0 ? { s: BT.pet.fx.bark, hop: BT.pet.fx.hop, who: BT.pet.fx.who, dog: BT.pet.list()[1].barkT } : null); }
  await p.evaluate(() => { BT.player.x = 8.6; BT.player.y = 6.6; }); await noToast(p); await sleep(350);
  await p.screenshot({ path: SC + '3-hasmete-havlama.png' });
  R.bark = bark;
  R.lines = await p.evaluate(() => BT.pet.lines.map(l => l.tr));
  ok(R.tax.on && bark && R.lines.indexOf(bark.s) >= 0 && bark.hop > 0 && bark.who === 'Karabaş' && bark.dog > 0, 'Haşmet\'e havlama yok ' + JSON.stringify(bark));
  ok(R.lines.length === 3 && R.lines[0] === 'Bu köpek vergiden muaf mı?!', 'Haşmet replikleri ' + JSON.stringify(R.lines));
  R.barkOnce = await p.evaluate(() => { const n = BT.pet.fx.n; BT.emek.step(0.05, 20); return BT.pet.fx.n === n; });
  ok(R.barkOnce, 'aynı ziyarette köpek tekrar tekrar havlıyor');
  await p.evaluate(() => { BT.tax.collect(); const T = BT.tax.st(); T.on = false; BT.customers.length = 0; BT.counters.forEach(c => c.slots.fill(null)); });

  /* martı: köpeksiz tezgâh (b1) fileto kaybeder, köpekli (b0) kaybetmez */
  R.gull = await p.evaluate(() => {
    BT.areas[1].locked = false; BT.rebuildCounters(); BT.setStall('b1', true);
    const c0 = BT.counters[0], c1 = BT.counters.find(c => c.key === 'b1'), cat = BT.pet.list()[0];
    BT.pet.assign(cat, null);                                   /* kedi hırsızlığı karışmasın */
    BT.counters.forEach(q => { q.spawnT = 1e9; q.slots.fill(null); }); BT.customers.length = 0;
    c0.buffer.length = 0; c1.buffer.length = 0;
    for (let i = 0; i < 4; i++) { c0.buffer.push({ k: 'fileto', f: c0.fish }); c1.buffer.push({ k: 'fileto', f: c1.fish }); }
    BT.day.n = 7; BT.day.t = 20;
    const ok0 = BT.pet.K.GULL_PM;
    BT.pet.gullGo('b0'); BT.pet.gullGo('b1');
    let barked = false, flewWithFish = false;
    for (let i = 0; i < 200; i++) { BT.emek.step(0.05); BT.day.t = 20; if (BT.pet.list()[1].barkT > 0) barked = true; if (BT.pet.gulls.some(g => g.it)) flewWithFish = true; }
    const r = { pm: ok0, b0: c0.buffer.length, b1: c1.buffer.length, barked, flewWithFish, left: BT.pet.gulls.length };
    BT.pet.assign(cat, 'b0');
    return r;
  });
  ok(R.gull.pm === 0.03 && R.gull.b0 === 4 && R.gull.b1 === 3 && R.gull.barked && R.gull.flewWithFish && R.gull.left === 0, 'martı kuralı ' + JSON.stringify(R.gull));

  /* ================= 4) sevme, mama ve keyif ================= */
  R.love = await p.evaluate(() => {
    const cat = BT.pet.list()[0]; cat.m = 50; cat.pn = 0; cat.pd = 0;
    const r = [1, 2, 3, 4].map(() => BT.pet.love(cat));
    return { r, m: cat.m };
  });
  ok(R.love.r.join() === 'true,true,true,false' && R.love.m === 80, 'sevme günde 3 kez +10 değil ' + JSON.stringify(R.love));
  /* dünyada dokunuş: yeni günde köpeğe dokun */
  R.tap = await p.evaluate(() => { BT.day.n = 8; const d = BT.pet.list()[1]; const s = BT.pet.spot(d); d.x = s.x; d.y = s.y; d.st = 'sit'; d.m = 60; BT.player.x = 6.4; BT.player.y = 4.7; return d.m; });
  await sleep(400);
  const dc = await p.evaluate(() => { const d = BT.pet.list()[1]; return BT.arr.css(d.x, d.y); });
  await p.mouse.click(dc[0], dc[1] - 10); await sleep(200);
  R.tap2 = await p.evaluate(() => { const d = BT.pet.list()[1]; return { m: d.m, love: d.love > 0, pn: d.pn }; });
  ok(R.tap2.m === 70 && R.tap2.love && R.tap2.pn === 1, 'köpeğe dokununca sevilmedi ' + JSON.stringify(R.tap2));
  R.mood = await p.evaluate(() => {
    const [cat, dog] = BT.pet.list(); cat.m = 80; dog.m = 80;
    BT.S.cash = 0;
    const a = BT.pet.dayEnd(), m1 = [cat.m, cat.s];
    const b2 = BT.pet.dayEnd(), m2 = [cat.m, cat.s, dog.s];
    const flowS = BT.pet.flow('b0'), patS = BT.pet.pat('b0');
    BT.emek.step(0.05, 200);                                    /* küs: tezgâhtan ayrılır, İskele'de dolaşır */
    const sp = BT.pet.spot(cat), away = Math.hypot(cat.x - sp.x, cat.y - sp.y);
    BT.S.cash = 1000;
    const c = BT.pet.dayEnd();
    return { a: a.hungry.length, m1, m2, flowS, patS, away: +away.toFixed(2), back: c.back.length, fee: c.fee, cash: BT.S.cash, after: [cat.m, cat.s, dog.m, dog.s], flowB: BT.pet.flow('b0'), patB: BT.pet.pat('b0') };
  });
  ok(R.mood.a === 2 && R.mood.m1.join() === '40,0' && R.mood.m2.join() === '0,1,1', 'mama verilmeyince küsmedi ' + JSON.stringify(R.mood));
  ok(R.mood.flowS === 1 && R.mood.patS === 1 && R.mood.away > 1.5, 'küs hayvanın etkisi sürüyor / tezgâhta ' + JSON.stringify(R.mood));
  ok(R.mood.back === 2 && R.mood.fee === 20 && R.mood.cash === 980 && R.mood.after.join() === '50,0,50,0', 'mama verilince dönmedi ' + JSON.stringify(R.mood));
  ok(Math.abs(R.mood.flowB - 1.04) < 1e-9 && Math.abs(R.mood.patB - 1.075) < 1e-9, 'yarım keyifte yarım etki değil ' + JSON.stringify(R.mood));
  /* küs hayvana MAMA KOY: hemen döner */
  R.sulkFeed = await p.evaluate(() => {
    const cat = BT.pet.list()[0]; cat.m = 10; cat.s = 1; BT.S.cash = 100;
    BT.player.x = cat.x - 0.4; BT.player.y = cat.y; const t = BT.pet.target();
    const r = BT.pet.feedNear();
    return { own: t && t.own, r, s: cat.s, m: cat.m, cash: BT.S.cash };
  });
  ok(R.sulkFeed.own && R.sulkFeed.r && R.sulkFeed.s === 0 && R.sulkFeed.m === 50 && R.sulkFeed.cash === 85, 'küs hayvana mama ' + JSON.stringify(R.sulkFeed));

  /* ================= panel: YÜKSELT › HAYVANLAR ================= */
  await p.evaluate(() => { BT.S.cash = 3000; BT.pet.list().forEach(q => { q.m = 85; }); BT.pet.list()[0].m = 55; });
  await p.click('.dtab[data-t="level"]'); await sleep(200);
  R.card = await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /HAYVANLAR/.test(d.innerText)); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  ok(/HAYVANLAR/.test(R.card) && /Pamuk/.test(R.card), 'YÜKSELT\'te HAYVANLAR kartı yok ' + R.card);
  await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /HAYVANLAR/.test(d.innerText)); c.querySelector('.buy').click(); }); await sleep(200);
  R.panel = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')));
  ok(R.panel.some(t => /Pamuk/.test(t) && /TEZGÂHA ATA/.test(t) && /SEV/.test(t)) && R.panel.some(t => /Karabaş/.test(t)) && R.panel.some(t => /KURALLAR/.test(t)), 'hayvan kartları ' + JSON.stringify(R.panel));
  R.bars = await p.evaluate(() => [...document.querySelectorAll('#dpCards .petBar i')].map(i => i.style.width));
  ok(R.bars[0] === '55%' && R.bars[1] === '85%', 'keyif çubuğu ' + JSON.stringify(R.bars));
  R.btnH = await p.evaluate(() => Math.min(...[...document.querySelectorAll('#dpCards .pbtn')].map(b => b.getBoundingClientRect().height)));
  ok(R.btnH >= 44, 'panel düğmesi 44px altında ' + R.btnH);
  await p.evaluate(() => { BT.day.n = 9; document.querySelector('#dpCards .pbtn[data-pa="sev"][data-pi="0"]').click(); }); await sleep(150);
  R.sev = await p.evaluate(() => ({ m: BT.pet.list()[0].m, bar: document.querySelector('#dpCards .petBar i').style.width }));
  ok(R.sev.m === 65 && R.sev.bar === '65%', 'SEV düğmesi ' + JSON.stringify(R.sev));
  await p.evaluate(() => document.querySelector('#dpCards .pbtn[data-pa="ata"][data-pi="0"]').click()); await sleep(150);
  R.ata = await p.evaluate(() => BT.pet.list()[0].c);
  ok(R.ata === 'b1', 'TEZGÂHA ATA sıradaki tezgâha geçirmedi ' + R.ata);
  await noToast(p); await sleep(300);
  await p.screenshot({ path: SC + '4-yukselt-hayvanlar.png' });
  /* ad değiştir (✎) */
  await p.evaluate(() => document.querySelector('#dpCards .pren[data-pi="1"]').click()); await sleep(150);
  await p.fill('#petIn', 'Kömür'); await p.click('#petGo'); await sleep(150);
  R.ren = await p.evaluate(() => ({ n: BT.pet.list()[1].n, h: BT.decorById('kulube0').n.tr }));
  ok(R.ren.n === 'Kömür' && /Kömür/.test(R.ren.h), 'ad değiştirilemedi ' + JSON.stringify(R.ren));
  await p.evaluate(() => { const b = document.querySelector('#dpCards .buy'); b.click(); }); await sleep(100);   /* geri */
  await p.click('.dtab[data-t="level"]'); await sleep(100);
  /* duraklatma menüsü › PERSONEL: HAYVANLAR satırları */
  await p.evaluate(() => { BT.ui.openPauseMenu(); }); await sleep(150);
  await p.evaluate(() => { const t = document.querySelector('#menuTabs .tab[data-t="personel"]'); if (t) t.click(); }); await sleep(150);
  R.menu = await p.evaluate(() => document.getElementById('tabBody').innerText.replace(/\s+/g, ' '));
  ok(/HAYVANLAR/.test(R.menu) && /Pamuk/.test(R.menu) && /Kömür/.test(R.menu), 'PERSONEL sekmesinde HAYVANLAR yok ' + R.menu.slice(0, 200));
  await p.screenshot({ path: SC + '5-menu-personel-hayvanlar.png' });
  await p.evaluate(() => BT.closeOverlays()); await sleep(100);

  /* ================= 5) kayıt / yükleme + gece ================= */
  R.place = await p.evaluate(() => {
    BT.arr.open(); BT.arr.look(16.5, 6);
    const i = BT.decor.indexOf(BT.decorById('kedievi0')); const r = BT.arr.fromBox(i);
    BT.arr.close();
    const h = BT.decorById('kedievi0');
    return { r, x: h.x, y: h.y, box: h.box, ok: BT.arr.ok('kedievi0', h.x, h.y) };
  });
  ok(R.place.r && !R.place.box && R.place.ok, 'kedi evi yerleştirilemedi ' + JSON.stringify(R.place));
  /* gece: kedi evine gider, uyur; köpeğin evi sandıkta → tezgâhının dibinde uyur */
  R.night = await p.evaluate(() => {
    const [cat, dog] = BT.pet.list(); BT.day.t = BT.DAY_LEN * 0.93;
    for (let i = 0; i < 600; i++) { BT.emek.step(0.05); BT.day.t = BT.DAY_LEN * 0.93; }
    const h = BT.decorById('kedievi0'), ds = BT.pet.spot(dog);
    return { cat: cat.st, catD: +Math.hypot(cat.x - h.x, cat.y - h.y - 0.62).toFixed(2), dog: dog.st, dogD: +Math.hypot(dog.x - ds.x, dog.y - ds.y).toFixed(2) };
  });
  ok(R.night.cat === 'sleep' && R.night.catD < 0.2 && R.night.dog === 'sleep' && R.night.dogD < 0.2, 'gece evinde uyumadı ' + JSON.stringify(R.night));
  await p.evaluate(() => { BT.player.x = 8.5; BT.player.y = 6.5; BT.arr.look(15.5, 7); });
  R.snap = await p.evaluate(() => {
    const [cat, dog] = BT.pet.list(); cat.m = 73; dog.m = 41; BT.pet.q().sd.dog = []; BT.day.t = 30;
    BT.saveNow();
    const h = BT.decorById('kedievi0');
    return { l: BT.pet.list().map(q => [q.k, q.n, q.m, q.c, q.s].join()), h: [h.x, h.y, h.box], hs: BT.decorById('kulube0').box, sv: JSON.parse(localStorage.getItem('balikci_slot_1')).pet };
  });
  ok(R.snap.sv && R.snap.sv.l.length === 2, 'kayıtta hayvan yok ' + JSON.stringify(R.snap.sv));
  await p.reload(); await sleep(900);
  await p.click('#playBtn'); await sleep(700);
  R.load = await p.evaluate(() => { const h = BT.decorById('kedievi0'); return { l: BT.pet.list().map(q => [q.k, q.n, q.m, q.c, q.s].join()), h: [h.x, h.y, h.box], hs: BT.decorById('kulube0').box, started: BT.S.started }; });
  ok(R.load.started && JSON.stringify(R.load.l) === JSON.stringify(R.snap.l), 'yükleme sonrası hayvanlar farklı ' + JSON.stringify({ a: R.snap.l, b: R.load.l }));
  ok(JSON.stringify(R.load.h) === JSON.stringify(R.snap.h) && R.load.hs === true, 'yükleme sonrası ev konumu farklı ' + JSON.stringify({ a: R.snap.h, b: R.load.h }));
  /* eski kayıt: pet alanı yok → hayvansız, hata yok; bozuk alan yutulur */
  R.old = await p.evaluate(() => {
    const sv = BT.buildSave(); delete sv.pet;
    const ok1 = BT.loadFrom(JSON.parse(JSON.stringify(sv))), n1 = BT.pet.list().length;
    const sv2 = BT.buildSave(); sv2.pet = { l: [{ k: 'kurt', n: 'X' }, { k: 'cat', n: '<b>', m: 'çok', c: 'b0' }, null], sd: { cat: ['a', 4, 4] }, nx: 'x', f: [1] };
    const ok2 = BT.loadFrom(JSON.parse(JSON.stringify(sv2)));
    const l = BT.pet.list();
    return { ok1, n1, ok2, n2: l.length, name: l[0] && l[0].n, m: l[0] && l[0].m, sd: BT.pet.q().sd.cat.slice() };
  });
  ok(R.old.ok1 && R.old.n1 === 0 && R.old.ok2 && R.old.n2 === 1 && R.old.name === 'b' && R.old.m === 0 && R.old.sd.join() === '4', 'eski / bozuk kayıt ' + JSON.stringify(R.old));

  /* ================= 6) tezgâh başına 1 kedi + 1 köpek; hak bölge başına ================= */
  R.rule = await p.evaluate(() => {
    const sv = BT.buildSave();
    sv.pet = { l: [{ k: 'cat', n: 'Pamuk', m: 80, c: 'b0' }, { k: 'cat', n: 'Duman', m: 80, c: 'b0' }, { k: 'dog', n: 'Karabaş', m: 80, c: 'b0' }], sd: { cat: [], dog: [] }, nx: { cat: 0, dog: 0 }, f: {} };
    BT.loadFrom(JSON.parse(JSON.stringify(sv)));
    const [c1, c2, d1] = BT.pet.list();
    const fixed = [c1.c, c2.c, d1.c];
    const a1 = BT.pet.assign(c2, 'b0'), a2 = BT.pet.assign(c2, 'b1'), a3 = BT.pet.assign(d1, 'b0');
    const nx = BT.pet.next(c1);                                 /* b0 → b1 dolu (Duman) → başka yer yok */
    BT.S.ctrl = 2; BT.day.n = 9; BT.emek.step(0.05, 2);
    const strayCat = !!BT.pet.stray('cat'), strayDog = !!BT.pet.stray('dog');   /* 2 bölge: kedi hakkı dolu, köpek hakkı 1 boş */
    const third = BT.pet.adopt('cat');
    const flow = BT.pet.flow('b0') + BT.pet.flow('b1') - 2;
    return { fixed, a1, a2, a3, nx, c1: c1.c, strayCat, strayDog, third: !!third, open: BT.areas.filter(a => !a.locked).length, flow: +flow.toFixed(4) };
  });
  ok(R.rule.fixed.join() === 'b0,,b0' && !R.rule.a1 && R.rule.a2 && R.rule.a3, 'tezgâh başına bir kedi kuralı ' + JSON.stringify(R.rule));
  ok(!R.rule.nx && R.rule.c1 === 'b0', 'boş tezgâh yokken atandı ' + JSON.stringify(R.rule));
  ok(R.rule.open === 2 && !R.rule.strayCat && R.rule.strayDog, 'bölge başına hak ' + JSON.stringify(R.rule));
  ok(Math.abs(R.rule.flow - 0.10) < 1e-9 || R.rule.flow <= 0.10 + 1e-9, 'toplam popülerlik tavanı +%10 aşıldı ' + JSON.stringify(R.rule));
  R.cap = await p.evaluate(() => { const sv = BT.buildSave(); sv.pet.l.forEach(q => { q.m = 90; }); sv.pet.l.push({ k: 'dog', n: 'Paşa', m: 90, c: 'b1' }); BT.areas[2].locked = false; BT.loadFrom(sv); BT.rebuildCounters(); return +(BT.counters.reduce((s, c) => s + BT.pet.flow(c.key) - 1, 0)).toFixed(4); });
  ok(Math.abs(R.cap - 0.10) < 1e-9, 'tavan: 2 kedi + 2 köpek toplamı +%10 olmalı ' + R.cap);

  /* İngilizce metinler */
  R.en = await p.evaluate(() => { const L = BT.STR.en; return ['petHead', 'petFeedBtn', 'petNewP', 'petAssign', 'petLoveBtn', 'petSteal', 'petGullT', 'petSulkT', 'petRule'].map(k => L[k]); });
  ok(R.en.every(s => typeof s === 'string' && s.length && !/[ğışçöü]/i.test(s)), 'İngilizce metin eksik ' + JSON.stringify(R.en));
  R.enLines = await p.evaluate(() => BT.pet.lines.every(l => l.en && l.tr));
  ok(R.enLines, 'Haşmet repliklerinin İngilizcesi eksik');

  /* ================= kapalıyken (HK_PET_OFF): hiçbir şey değişmez ================= */
  const q = await page(false, false);
  await newGame(q);
  R.off = await q.evaluate(() => {
    BT.day.n = 9; BT.day.t = 20;
    const c = BT.counters[0]; c.buffer.length = 0; for (let i = 0; i < 6; i++) c.buffer.push({ k: 'fileto', f: c.fish });
    for (let i = 0; i < 2400; i++) { BT.emek.step(0.05); BT.day.t = 20; c.spawnT = 1e9; }   /* 2 dakika */
    return { on: BT.pet.on(), stray: !!(BT.pet.stray('cat') || BT.pet.stray('dog')), gulls: BT.pet.gulls.length, buf: c.buffer.length, flow: BT.pet.flow('b0'), pat: BT.pet.pat('b0'), adopt: BT.pet.list().length };
  });
  await q.click('.dtab[data-t="level"]'); await sleep(150);
  R.off.card = await q.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].some(d => /HAYVANLAR/.test(d.innerText)));
  ok(!R.off.on && !R.off.stray && R.off.gulls === 0 && R.off.buf === 6 && R.off.flow === 1 && R.off.pat === 1 && !R.off.card, 'kapalıyken hayvan sistemi çalışıyor ' + JSON.stringify(R.off));

  ok(!errs.length, 'sayfa hataları: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1).slice(0, 6000));
  await b.close();
  if (fail.length) { console.log('BAŞARISIZ (' + fail.length + '):\n- ' + fail.join('\n- ')); process.exit(1); }
  console.log('test-hayvan: TAMAM');
})().catch(e => { console.error(e); process.exit(1); });
