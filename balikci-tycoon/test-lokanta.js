/* v2.19-deneme — Sahil Lokantası, Aşama 1 (LOKANTA_TASARIM.md):
   1) açılış koşulu: Mutfak açık + itibar Sv 5, bedel, ALAN kartı, canStand/kamera erişimi
   2) tam zincir: sipariş fişi → pişirme → pass → servis → yemek → ödeme → bulaşık
   3) Emekçi beklemesi: istasyonun başında kimse yokken pişmez; oyuncu durunca pişer
   4) aşçı + garson + bulaşıkçı (+ şef garson) otomasyonu; Depo Hamalı dolabı besler (tezgâh önceliği)
   5) bahşiş hızı, sabır kaçışı (itibar −), grup türleri
   6) istasyon/menü kısıtı (bilinen + istasyonu kurulu; yer = lokanta seviyesi), kadro sınırı
   7) kayıt/yükleme (eski kayıt güvenli), inşaat kuralı (L. seviye L gün), çöp kovası tabağı atmaz
   8) TR/EN metinleri, layoutClashes, panel
   Hızlı benzetim: BT.emek.step(dt, n) oyun adımını çizimsiz koşturur.
   Kullanım: URL=http://localhost:8106/index.html node test-lokanta.js [görüntü klasörü] */
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
  const page = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(o => { window.HK_LOK_OFF = 0; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = o.emekOff ? 1 : 0; window.HK_INSAAT_OFF = o.insaat ? 0 : 1; window.HK_HELP_OFF = 1; }, o);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
    return p;
  };
  const newGame = async p => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900);
  };
  /* her şey açık, sakin dünya; lokanta açık (ALAN akışı ayrı sınanır) */
  const prep = p => p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 1e6; S.rep = 400; BT.achMute(true);
    BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters();
    BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; });
    BT.day.phase = 'play'; BT.day.t = 10; BT.player.carry.length = 0; BT.player.x = 4.5; BT.player.y = 25.6;
    BT.customers.length = 0;
  });
  /* istasyonları kur, tarifleri bildir, kileri doldur, menüyü kur */
  const kit = (p, o = {}) => p.evaluate(o => {
    const L = BT.lok, q = BT.tarif.q();
    BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
    Object.keys(q.kiler).forEach(k => delete q.kiler[k]); BT.tarif.ing.forEach(g => { q.kiler[g.id] = 50; });
    (o.st || ['tava', 'izgara', 'tencere', 'firin']).forEach(k => L.buy('lok_' + k));
    if (o.lv) { for (let i = 1; i < o.lv; i++) L.buy('lok_lv'); }
    (o.menu || []).forEach(id => L.menuAdd(id));
    const lq = L.q(); if (o.fill !== false) { ['hamsi', 'uskumru', 'palamut', 'levrek', 'ton', 'guvec'].forEach(f => { lq.dolap[f] = 0; }); lq.dolap.hamsi = 12; }
    BT.lok.R.arr = 1e9;
    return { open: L.open(), st: lq.st, menu: L.menu() };
  }, o);
  const step = (p, dt, n) => p.evaluate(([dt, n]) => { BT.emek.step(dt, n); BT.day.t = Math.min(BT.day.t, 200); BT.day.phase = 'play'; }, [dt, n]);
  const nextDay = async p => {                                                      /* günü gerçekten bitir: kapanış → özet kartı → devam */
    await p.evaluate(() => { BT.customers.length = 0; BT.endDay(); });
    for (let i = 0; i < 80; i++) {
      const done = await p.evaluate(() => { BT.customers.length = 0; BT.emek.step(0.1, 40); const e = document.getElementById('dayScr'); if (e && !e.classList.contains('hidden')) { document.getElementById('dayGo').click(); return true; } return false; });
      if (done) break; await sleep(40);
    }
    await p.evaluate(() => { BT.day.phase = 'play'; BT.day.t = 10; BT.customers.length = 0; });
  };
  const shot = async (p, name) => { if (!SHOT) return; await p.evaluate(() => { for (const id of ['stallScr', 'lvlUp']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); } const a = document.getElementById('achPop'); if (a) a.classList.add('hidden'); document.getElementById('toast').classList.remove('on'); }); await sleep(500); await p.screenshot({ path: SHOT + '/' + name + '.png' }); };

  /* ===== 1) açılış koşulu (ALAN akışı) ===== */
  {
    const p = await page(); await newGame(p);
    R.open = await p.evaluate(() => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; BT.achMute(true);
      const A = BT.areas, out = {};
      out.n = A.length; out.id = A[4] && A[4].id; out.lok = !!(A[4] && A[4].lok);
      out.x = [A[4].x0, A[4].y0, A[4].x1, A[4].y1];
      out.repLv = BT.lok.X.levelForRep(A[4].rep);
      out.lockedAtStart = A[4].locked && !BT.lok.open();
      /* Mutfak kilitliyken kart yok */
      S.cash = 1e6; S.rep = 400; BT.areas.forEach((a, i) => { a.locked = i >= 3; }); BT.rebuildCounters();
      BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; }); BT.lok.X.openBar('area');
      out.cardsBeforeKitchen = BT.lok.X.barList().map(c => c.id);
      /* Mutfak açık, itibar düşük → kart var ama engelli */
      A[3].locked = false; BT.rebuildCounters(); S.rep = 340;
      let c = BT.lok.X.barList().find(c => c.id === 'a4'); out.lowRep = c ? !!c.blocked : null;
      S.rep = 350; S.cash = 100; c = BT.lok.X.barList().find(c => c.id === 'a4'); out.cost = c ? c.cost : null; out.poor = c ? S.cash < c.cost : null;
      S.cash = 1e6; c = BT.lok.X.barList().find(c => c.id === 'a4'); out.ready = c ? !c.blocked : null;
      { const t0 = document.querySelector('.dtab.on'); if (t0) t0.click(); }
      BT.lok.X.openBar('area');                                                      /* ALAN sekmesi: kart + ONAYLA? */
      const before = S.cash; document.querySelector('#dpCards .buy').click(); out.cf = document.querySelector('#dpCards .buy').innerText;
      document.querySelector('#dpCards .buy').click();
      out.paid = before - S.cash; out.openNow = BT.lok.open() && !A[4].locked;
      out.q = !!S.lok; out.cardAfter = BT.lok.X.barList().find(c => c.id === 'a4') ? 1 : 0;
      /* konum: iskele devamı, kameraya ulaşır, yürünür */
      out.walk = BT.canStand(5, 24) && BT.canStand(5, 28.5) && BT.canStand(2.3, 25.15) && BT.canStand(9, 25.2) && !BT.canStand(5, 29.9);
      { const t = document.querySelector('.dtab.on'); if (t) t.click(); }
      BT.player.x = 1; BT.player.y = 29;
      out.clash = BT.layoutClashes(0.1);
      out.envOk = BT.areas.length === 5;
      return out;
    });
    ok(R.open.n === 5 && R.open.id === 'sahil' && R.open.lok, 'AREAS sonuna lokanta bölgesi eklenmeli ' + JSON.stringify(R.open));
    ok(R.open.repLv === 5, 'açılış itibarı Sv 5 olmalı: ' + R.open.repLv);
    ok(R.open.lockedAtStart, 'lokanta başta kilitli');
    ok(!R.open.cardsBeforeKitchen.includes('a4') && R.open.cardsBeforeKitchen.includes('a3'), 'Mutfak kilitliyken lokanta kartı yok, Mutfak kartı var: ' + R.open.cardsBeforeKitchen);
    ok(R.open.lowRep === true, 'itibar Sv5 altında kart engelli');
    ok(R.open.ready === true && R.open.cost > 15500 * 0.7 && R.open.cost < 15500 * 0.8, 'bedel 15.500 × Emekçi 0,75: ' + R.open.cost);
    ok(R.open.cf === 'ONAYLA?', 'ALAN kartı ONAYLA? ister: ' + R.open.cf);
    ok(R.open.paid === R.open.cost && R.open.openNow && R.open.q, 'açılınca bedel düşer, bölge açılır, S.lok kurulur');
    ok(R.open.cardAfter === 0, 'açıldıktan sonra kart kalkar');
    ok(R.open.walk, 'lokanta zemini yürünebilir (Mutfak ucundan geçilir)');
    ok(R.open.clash.length === 0, 'layoutClashes boş: ' + R.open.clash.join(', '));
    await sleep(1800);
    const cam = await p.evaluate(() => { const a = BT.canvasPt(1, 29, 0), b = BT.canvasPt(9, 24, 0), c = document.getElementById('game'); return { a, b, W: c.clientWidth, H: c.clientHeight }; });
    ok(cam.a[0] > 0 && cam.a[0] < cam.W && cam.a[1] > 0 && cam.a[1] < cam.H, 'kamera lokanta güneyine ulaşır, oyuncu ekranda: ' + JSON.stringify(cam));
    await p.close();
  }

  /* ===== 2) tam zincir (oyuncu hepsini yapar) ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    R.kit = await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    ok(R.kit.open && R.kit.st.tava === 1, 'tava kuruldu ve menüde: ' + JSON.stringify(R.kit));
    ok(R.kit.menu.join() === 'hamsitava', 'menü: ' + R.kit.menu);
    const c0 = await p.evaluate(() => { const L = BT.lok, g = L.spawn('aile'); BT.S.rep = 400; return { n: g.n, st: g.st, cash: BT.S.cash, rep: BT.S.rep }; });
    await step(p, 0.05, 160);                                                    /* yürür, oturur, sipariş verir */
    const s1 = await p.evaluate(() => { const L = BT.lok, g = L.R.grp[0]; return { st: g && g.st, board: L.R.board.length, ord: L.R.board[0] && { n: L.R.board[0].n, rec: L.R.board[0].rec, cooked: L.R.board[0].cooked }, tb: g && g.tb }; });
    ok(s1.st === 'wait' && s1.board === 1 && s1.ord.n === 4 && s1.ord.rec === 'hamsitava', 'grup oturdu, panoya 4 × Hamsi Tava fişi düştü: ' + JSON.stringify(s1));
    /* başında kimse yok: Emekçi Mod'da pişmez */
    await step(p, 0.05, 100);
    const s2 = await p.evaluate(() => { const L = BT.lok; return { cooked: L.R.board[0].cooked, jobs: L.S.tava.jobs.length, wait: L.S.tava.wait, dolap: L.q().dolap.hamsi, pr: L.presence('tava') }; });
    ok(s2.cooked === 0 && s2.jobs === 0 && s2.dolap === 12 && s2.pr === 0, 'Emekçi: başında kimse yokken pişmez, malzeme harcanmaz: ' + JSON.stringify(s2));
    ok(s2.wait === 'cook', 'istasyon "aşçı/başında biri yok" bekliyor: ' + s2.wait);
    /* oyuncu istasyonun başına geçer */
    await p.evaluate(() => { const d = BT.lok.ST.tava; BT.player.x = d.sx; BT.player.y = d.sy; });
    await step(p, 0.05, 20);
    const s3 = await p.evaluate(() => { const L = BT.lok; return { jobs: L.S.tava.jobs.length, pr: L.presence('tava'), dolap: L.q().dolap.hamsi, kiler: BT.tarif.q().kiler.misirunu }; });
    ok(s3.pr === 1 && s3.jobs === 1 && s3.dolap === 11 && s3.kiler === 49, 'oyuncu durunca pişirme başlar, fileto + kiler harcanır: ' + JSON.stringify(s3));
    await step(p, 0.05, 20 * 13);                                                /* 4 tabak × 3 sn (tek yuva) */
    const s4 = await p.evaluate(() => { const L = BT.lok; return { pass: L.R.pass.length, cooked: L.R.board[0] && L.R.board[0].cooked, dolap: L.q().dolap.hamsi, kiler: BT.tarif.q().kiler.misirunu }; });
    ok(s4.pass === 4 && s4.dolap === 8 && s4.kiler === 46, 'dört tabak pass\'te, her tabak 1 fileto + kiler: ' + JSON.stringify(s4));
    /* servis: oyuncu pass'ten alır, masaya bırakır */
    await p.evaluate(() => { const d = BT.lok.LOK.pass; BT.player.x = d.sx; BT.player.y = d.sy; });
    await step(p, 0.05, 30);
    const s5 = await p.evaluate(() => ({ carry: BT.player.carry.filter(i => i.k === 'plate').length, pass: BT.lok.R.pass.length, eat: BT.lok.R.grp[0].st }));
    ok(s5.pass === 0 && (s5.carry === 4 || s5.eat === 'eat'), 'oyuncu pass\'ten 4 tabağı aldı (yakın masaya hemen bıraktı): ' + JSON.stringify(s5));
    await p.evaluate(() => { const g = BT.lok.R.grp[0], t = BT.lok.TB[g.tb]; BT.player.x = t.sx; BT.player.y = t.sy; });
    await step(p, 0.05, 40);
    await p.evaluate(() => { BT.player.x = 5; BT.player.y = 25.5; });
    const s6 = await p.evaluate(() => { const g = BT.lok.R.grp[0]; return { st: g.st, carry: BT.player.carry.filter(i => i.k === 'plate').length, plates: BT.lok.trt(g.tb).plates, serve: g.serve }; });
    ok(s6.st === 'eat' && s6.carry === 0, 'tabaklar masaya bırakıldı, grup yemeye başladı: ' + JSON.stringify(s6));
    /* yemek 8–12 sn */
    const eat = await p.evaluate(() => BT.lok.R.grp[0].eatMax); ok(eat >= 8 * 0.99 * 1.1 || eat >= 8, 'yeme süresi 8–12 sn (aile ×1): ' + eat);
    await step(p, 0.05, 20 * 13);
    const s7 = await p.evaluate(() => { const t = BT.lok.trt(0); return { tbN: t.pay.length, pay: t.pay.reduce((a, m) => a + m.v, 0), dirty: t.dirty, tst: t.st, sv: BT.lok.q().sv, val: BT.lok.plateVal('hamsitava') }; });
    ok(s7.tst === 'dirty' && s7.dirty === 4 && s7.tbN >= 1, 'yemek bitti: masada ödeme yığını + 4 kirli tabak, masa dolu: ' + JSON.stringify(s7));
    ok(s7.pay >= s7.val * 4 && s7.pay <= s7.val * 4 * 1.31, 'ödeme = tarif değeri × kişi + bahşiş (≤ +%30): ' + s7.pay + ' / ' + s7.val * 4);
    ok(s7.val === Math.round(6 * 2.0 * 1.2), 'tabak değeri FISH.val × çarpan × 1,2: ' + s7.val);
    /* para: oyuncu masadan alır, Kasa'ya bırakır */
    const cash0 = await p.evaluate(() => BT.S.cash);
    await p.evaluate(() => { const t = BT.lok.TB[BT.lok.R.grp.length ? BT.lok.R.grp[0].tb : 0]; });
    const tbi = await p.evaluate(() => { for (let i = 0; i < 12; i++) if (BT.lok.trt(i).pay.length) return i; return -1; });
    await p.evaluate(i => { const t = BT.lok.TB[i]; BT.player.x = t.sx; BT.player.y = t.sy; }, tbi);
    await step(p, 0.05, 40);
    const s8 = await p.evaluate(() => ({ money: BT.player.carry.filter(i => i.k === 'money').length, dirty: BT.player.carry.filter(i => i.k === 'dirty').length }));
    ok(s8.money >= 1 && s8.dirty >= 1 && s8.money + s8.dirty <= 8, 'oyuncu masada parayı ve kirli tabakları topladı (sepet sınırı 8): ' + JSON.stringify(s8));
    /* para → Kasa, kirli → bulaşık tezgâhı; sepet dolduğu için birkaç tur */
    for (let k = 0; k < 4; k++) {
      await p.evaluate(() => { const d = BT.lok.LOK.kasa; BT.player.x = d.sx; BT.player.y = d.sy; }); await step(p, 0.05, 40);
      await p.evaluate(() => { const d = BT.lok.LOK.sink; BT.player.x = d.sx; BT.player.y = d.sy; }); await step(p, 0.05, 40);
      const more = await p.evaluate(() => { const i = BT.lok.R.t.findIndex(t => t.pay.length || t.dirty); if (i < 0) return false; const t = BT.lok.TB[i]; BT.player.x = t.sx; BT.player.y = t.sy; return true; });
      if (!more) break; await step(p, 0.05, 40);
    }
    await p.evaluate(() => { const d = BT.lok.LOK.kasa; BT.player.x = d.sx; BT.player.y = d.sy; }); await step(p, 0.05, 40);
    const s9 = await p.evaluate(() => ({ cash: BT.S.cash, money: BT.player.carry.filter(i => i.k === 'money').length }));
    ok(s9.money === 0 && s9.cash - cash0 >= s7.pay - 1, 'para Kasa\'ya bırakılınca hesaba geçer: +' + (s9.cash - cash0) + ' / ' + s7.pay);
    /* çöp kovası tabağı atmaz */
    const trash = await p.evaluate(() => { const bn = BT.bins ? BT.bins[0] : null; return { kind: ['plate', 'dirty', 'money', 'fish'].map(k => BT.lok.X.isTrash({ k })) }; });
    ok(trash.kind.join() === 'false,false,false,true', 'isTrash: tabak/kirli tabak/para atılmaz: ' + trash.kind);
    await p.evaluate(() => { const d = BT.lok.LOK.sink; BT.player.x = d.sx; BT.player.y = d.sy; });
    await step(p, 0.05, 60);
    const s10 = await p.evaluate(() => ({ dirty: BT.player.carry.filter(i => i.k === 'dirty').length, free: BT.lok.R.t.filter(t => t.i < 2).map(t => t.st).join(), sunk: BT.lok.R.sinkN }));
    ok(s10.dirty === 0 && s10.sunk === 4, 'kirli tabaklar bulaşık tezgâhına bırakıldı: ' + JSON.stringify(s10));
    ok(s10.free.indexOf('dirty') < 0, 'masa temizlendi, boşaldı: ' + s10.free);
    R.chain = { s7, s9 };
    await p.close();
  }

  /* ===== 3) otomasyon: aşçı + garson + bulaşıkçı + şef garson ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'firin'], menu: ['hamsitava', 'hamsipilav'], lv: 2 });
    const cr = await p.evaluate(() => {
      const L = BT.lok, out = {};
      out.cap = L.crewCap(); out.price = L.ROLES.map(r => L.hireCost(r));
      L.hire('lk_asci'); L.hire('lk_asci'); L.hire('lk_garson'); L.hire('lk_bulasik'); L.hire('lk_sef');
      out.n = L.crew().length; out.st = L.crew('lk_asci').map(w => w.lst);
      L.hire('lk_asci'); out.third = L.crew('lk_asci').length;                    /* 2 istasyon = 2 aşçı */
      out.fullWhy = L.hireWhy('lk_garson');
      out.wages = L.crew().map(w => BT.lok.X.workerWage(w));
      L.q().dolap.hamsi = 12; L.q().dolap.hamsi = 12;
      return out;
    });
    ok(cr.n === 5 && cr.st.length === 2 && cr.st[0] !== cr.st[1], 'kadro kuruldu, istasyon başına bir aşçı: ' + JSON.stringify(cr));
    ok(cr.third === 2, 'istasyon sayısından fazla aşçı alınamaz: ' + cr.third);
    ok(cr.cap === 5, 'kadro sınırı = 3 + lokanta seviyesi (Sv2 → 5): ' + cr.cap);
    ok(cr.fullWhy === 'full', 'kadro doluyken garson alınamaz: ' + cr.fullWhy);
    await p.evaluate(() => { BT.lok.R.arr = 0.1; BT.player.x = 1; BT.player.y = 28.8; });
    await step(p, 0.05, 20 * 100);
    const a1 = await p.evaluate(() => { const L = BT.lok, q = L.q(); return { sv: q.sv, ls: q.ls, cash: BT.S.cash, board: L.R.board.length, grp: L.R.grp.length, dirty: L.R.t.reduce((a, t) => a + t.dirty, 0), sunk: L.R.sinkN, pay: L.R.t.reduce((a, t) => a + t.pay.length, 0), dolap: q.dolap.hamsi, rep: BT.S.rep }; });
    ok(a1.sv >= 3, 'kadro tek başına grupları ağırlar (oyuncu uzakta): ' + JSON.stringify(a1));
    ok(a1.sunk >= 3, 'bulaşıkçı kirli tabakları götürür: ' + JSON.stringify(a1));
    ok(a1.pay === 0, 'şef garson masadaki parayı toplar ve Kasa\'ya bırakır: ' + JSON.stringify(a1));
    R.auto = a1;
    /* şef garson eksik rolü doldurur: garson ve bulaşıkçı yok */
    const sf = await p.evaluate(() => {
      const L = BT.lok; L.crew('lk_garson').concat(L.crew('lk_bulasik')).forEach(w => L.fire(w));
      L.q().dolap.hamsi = 12; const before = L.q().sv; L.R.arr = 0.1; L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      return { before, crew: L.crew().map(w => w.role) };
    });
    await step(p, 0.05, 20 * 120);
    const sf2 = await p.evaluate(() => ({ sv: BT.lok.q().sv, sunk: BT.lok.R.sinkN }));
    ok(sf2.sv > sf.before, 'şef garson garson/bulaşıkçı yokken yarım hızla yine servis eder: ' + sf.before + ' → ' + sf2.sv);
    await p.close();
  }

  /* ===== 4) bahşiş hızı + sabır kaçışı + grup türleri ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    const tip = async (delay) => {
      await p.evaluate(() => { const L = BT.lok; L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; }); L.q().dolap.hamsi = 12; L.spawn('turist'); });
      await step(p, 0.05, 140);
      await step(p, 0.05, 20 * delay);                                           /* sipariş verildi: bekleme */
      return p.evaluate(() => {
        const L = BT.lok, g = L.R.grp[0], ord = g.ord;
        /* tabakları hazır say: servis anı */
        for (let i = 0; i < g.n; i++) { L.R.pass.push({ k: 'plate', f: 'hamsi', d: 'hamsitava', tb: g.tb, ord }); ord.cooked++; }
        const t = L.trt(g.tb); BT.player.carry.length = 0;
        t.plates = g.n; ord.deliv = g.n;
        const tipPre = g.t0; BT.lok.R.pass.length = 0;
        return { g: g.type, st: g.st, wait: BT.gameT ? 0 : 0 };
      });
    };
    /* doğrudan ölç: hızlı servis vs yavaş servis */
    const fast = await p.evaluate(() => {
      const L = BT.lok, g = L.spawn('turist'); BT.player.carry.length = 0;
      for (let i = 0; i < 160; i++) BT.emek.step(0.05, 1);
      const t = L.trt(g.tb), ord = g.ord; t.plates = g.n - 1; g.ord.deliv = g.n - 1;
      const pass = { k: 'plate', f: 'hamsi', d: 'hamsitava', tb: g.tb, ord }; BT.player.carry.push(pass);
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      const eatSt = g.st;
      for (let i = 0; i < 20 * 14; i++) BT.emek.step(0.05, 1);
      const tt = L.trt(g.tb), mine = BT.player.carry.filter(i => i.k === 'money').reduce((a, m) => a + m.v, 0);
      return { eatSt, tipF: g.tipF, pay: tt.pay.reduce((a, m) => a + m.v, 0) + mine, base: L.plateVal('hamsitava') * 2, serve: g.serve };
    });
    const slow = await p.evaluate(() => {
      const L = BT.lok; L.R.grp.length = 0; L.R.board.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      const g = L.spawn('turist'); BT.player.carry.length = 0; BT.player.x = 4.5; BT.player.y = 25.6;
      for (let i = 0; i < 160; i++) BT.emek.step(0.05, 1);
      g.pat = g.patMax * 0.4; BT.gameT_dummy = 0;
      const ord = g.ord; g.t0 -= g.patMax * 0.9;                                   /* uzun bekletildi */
      const t = L.trt(g.tb); t.plates = g.n - 1; ord.deliv = g.n - 1;
      BT.player.carry.push({ k: 'plate', f: 'hamsi', d: 'hamsitava', tb: g.tb, ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      for (let i = 0; i < 20 * 14; i++) BT.emek.step(0.05, 1);
      const tt = L.trt(g.tb), mine = BT.player.carry.filter(i => i.k === 'money').reduce((a, m) => a + m.v, 0);
      return { tipF: g.tipF, pay: tt.pay.reduce((a, m) => a + m.v, 0) + mine, base: L.plateVal('hamsitava') * 2, serve: g.serve };
    });
    ok(fast.eatSt === 'eat', 'son tabak gelince grup yer: ' + JSON.stringify(fast));
    ok(fast.tipF > 0.2 && fast.tipF <= 0.51 && fast.pay > fast.base * 1.2, 'hızlı servis: bahşiş yüksek (turist +%30 × 1,7 ≤ %51): ' + JSON.stringify(fast));
    ok(slow.tipF < 0.05 && slow.pay <= slow.base * 1.06, 'yavaş servis: bahşiş yok: ' + JSON.stringify(slow));
    ok(fast.pay > slow.pay, 'hız bahşişi artırır: ' + fast.pay + ' > ' + slow.pay);
    R.tip = { fast, slow };
    /* sabır: kimse pişirmiyor → grup kızıp kalkar, itibar −, sipariş iptal */
    const lost = await p.evaluate(() => {
      const L = BT.lok; L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      BT.player.x = 5; BT.player.y = 25.6; const rep0 = BT.S.rep, ls0 = L.q().ls, lost0 = BT.S.lost;
      const g = L.spawn('is');                                                     /* iş yemeği: sabırsız (50 sn) */
      for (let i = 0; i < 20 * 100; i++) BT.emek.step(0.05, 1);
      return { rep: BT.S.rep - rep0, ls: L.q().ls - ls0, lost: BT.S.lost - lost0, grp: L.R.grp.length, board: L.R.board.length, tst: L.trt(0).st };
    });
    ok(lost.ls === 1 && lost.rep <= -2 && lost.board === 0 && lost.grp === 0, 'sabır bitince grup kalkar, itibar −2, fiş kalkar: ' + JSON.stringify(lost));
    const tur = await p.evaluate(() => { const G = BT.lok.G; return { n: Object.keys(G).map(k => G[k].n).join(), pat: G.is.pat < G.aile.pat && G.kahve.eat < G.aile.eat, tip: G.turist.tip > 1.2, pay: G.is.pay > 1.2 }; });
    ok(tur.n === '4,2,3,2' && tur.pat && tur.tip && tur.pay, 'grup türleri: aile 4, turist 2 (bol bahşiş), kahve 3 (hızlı yer), iş 2 (sabırsız, yüksek ödeme): ' + JSON.stringify(tur));
    /* ayrı sayaç: tezgâh müşterisi sayısı değişmez */
    const sep = await p.evaluate(() => { BT.lok.R.arr = 0.01; BT.customers.length = 0; for (let i = 0; i < 400; i++) BT.emek.step(0.05, 1); return { cust: BT.customers.length, groups: BT.lok.R.grp.length + BT.lok.q().sv + BT.lok.q().ls }; });
    ok(sep.groups > 0, 'lokanta grupları kendi sayacıyla gelir: ' + JSON.stringify(sep));
    await p.close();
  }

  /* ===== 5) istasyon/menü kısıtı, kadro/seviye kuralları ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    const m = await p.evaluate(() => {
      const L = BT.lok, q = BT.tarif.q(), out = {};
      q.known.length = 0; q.known.push('hamsitava', 'hamsipilav', 'levrekbugulama', 'orkinosizgara');
      out.noSt = L.menuAdd('hamsitava');                                           /* istasyon yok → eklenmez */
      L.buy('lok_tava'); out.tavaAuto = L.menu().join(); out.tava = L.menuAdd('hamsitava');   /* kurulunca bilinen tarif kendiliğinden girer */
      out.unknownTarif = L.menuAdd('uskumrudolma');                                 /* bilinmeyen */
      out.otherSt = L.menuAdd('hamsipilav');                                        /* fırın kurulu değil */
      L.buy('lok_firin'); out.firinFull = L.menuAdd('hamsipilav');                  /* Sv1 = 1 yer: dolu */
      out.slots1 = L.menu().join();
      out.autoOnBuild = L.q().menu.slice();
      L.buy('lok_lv'); out.lv2 = L.q().lv; out.add2 = L.menuAdd('hamsipilav'); out.menu2 = L.menu().join();
      L.menuDel('hamsitava'); out.afterDel = L.menu().join();
      L.q().st.firin = 0; out.dropped = L.menu().join();                            /* istasyon kalkınca menüde sayılmaz */
      L.q().st.firin = 1;
      out.rm = L.recOK('levrekbugulama');
      out.cost = [L.cost('lok_lv'), L.cost('lok_tb'), L.cost('lok_tava'), L.cost('lok_firin')];
      out.tbWhy = []; L.buy('lok_tb'); out.tb2 = L.q().tb; out.tbN = L.tbl();
      out.tbWhy.push(L.why('lok_tb')); L.buy('lok_tb'); out.tb3 = L.q().tb; out.tbWhy.push(L.why('lok_tb'));   /* Sv2: tb en çok 3 */
      L.buy('lok_tb'); out.tb4 = L.q().tb;
      return out;
    });
    ok(m.noSt === false && m.tavaAuto === 'hamsitava' && m.tava === false && m.unknownTarif === false && m.otherSt === false, 'menü: yalnız bilinen ve istasyonu kurulu tarif: ' + JSON.stringify(m));
    ok(m.slots1 === 'hamsitava' && m.firinFull === false, 'Sv1: tek menü yeri: ' + m.slots1);
    ok(m.lv2 === 2 && m.add2 === true && m.menu2 === 'hamsitava,hamsipilav', 'Sv2: ikinci yer açılır: ' + m.menu2);
    ok(m.dropped === 'hamsipilav'.replace('hamsipilav', '') || m.dropped === '' || !m.dropped.includes('hamsipilav'), 'istasyon kalkınca tarif menüde sayılmaz: ' + m.dropped);
    ok(m.tb2 === 2 && m.tbN === 4 && m.tb3 === 3 && m.tb4 === 3 && m.tbWhy[1] === 'lv', 'masa 2 → 4 → 6; Sv2\'de 6\'yı geçmez: ' + JSON.stringify(m));
    ok(m.cost[1] > 0 && m.cost[3] > m.cost[2], 'bedeller Emekçi ölçeğinde artar: ' + m.cost);
    await p.close();
  }

  /* ===== 6) Depo Hamalı dolabı besler (tezgâh > dolap), oyuncu Soğuk Oda'dan çeker ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'], fill: false });
    const d = await p.evaluate(() => {
      const L = BT.lok, out = {};
      BT.counters.forEach(c => { c.open = false; });                                   /* tezgâh önceliği ayrı sınanır */
      BT.DEPOT.lvl = 2; BT.DEPOT.cold['fileto|hamsi'] = 10;
      out.target = L.depotTarget({ carry: [], role: 'depocu' });                   /* dolap boş, depoda hamsi var */
      out.room = L.room('hamsi'); out.share = L.share();
      const w = BT.hire('depocu', true, -1); w.x = BT.DEPOT.door.x; w.y = BT.DEPOT.door.y + 1;
      BT.player.x = 5; BT.player.y = 25.6; out.dolap0 = L.q().dolap.hamsi | 0;
      return out;
    });
    ok(d.target === 'fileto|hamsi' && d.room > 0, 'depoda dolabın istediği fileto var: ' + JSON.stringify(d));
    await step(p, 0.05, 20 * 70);
    const d2 = await p.evaluate(() => ({ dolap: BT.lok.q().dolap.hamsi | 0, cold: BT.DEPOT.cold['fileto|hamsi'] | 0, task: BT.workers.filter(w => w.role === 'depocu').map(w => w.task) }));
    ok(d2.dolap >= 6 && d2.cold < 10, 'Depo Hamalı Soğuk Oda\'dan lokanta dolabına fileto taşıdı: ' + JSON.stringify(d2));
    /* tezgâh önceliği: tezgâhı boş bir tezgâh varken önce tezgâha (refill) gider */
    const pri = await p.evaluate(() => {
      const L = BT.lok; L.q().dolap.hamsi = 0; BT.counters.forEach(c => { c.open = true; }); const c = BT.counters.find(c => c.open && c.fish === 'hamsi');
      c.buffer.length = 0; BT.DEPOT.cold['fileto|hamsi'] = 10;
      const w = BT.workers.find(w => w.role === 'depocu'); w.task = null; w.carry.length = 0; w.x = BT.DEPOT.door.x; w.y = BT.DEPOT.door.y + 1;
      for (let i = 0; i < 4; i++) BT.emek.step(0.05, 1);
      return { task: w.task, tc: !!w.tc };
    });
    ok(pri.task === 'refill', 'öncelik: tezgâh dolabın önünde (refill): ' + JSON.stringify(pri));
    /* oyuncu: Soğuk Oda kapısında çeker, dolapta bırakır */
    const pl = await p.evaluate(() => {
      const L = BT.lok; BT.workers.filter(w => w.role === 'depocu').forEach(w => BT.workers.splice(BT.workers.indexOf(w), 1));
      L.q().dolap.hamsi = 0; BT.DEPOT.cold['fileto|hamsi'] = 6; BT.player.carry.length = 0;
      BT.player.x = BT.DEPOT.door.x; BT.player.y = BT.DEPOT.door.y;
      return { key: L.coldKey(BT.player) };
    });
    await step(p, 0.05, 40);
    const pl2 = await p.evaluate(() => ({ carry: BT.player.carry.filter(i => i.k === 'fileto').length, flagged: BT.player.carry.filter(i => i.lk).length, cold: BT.DEPOT.cold['fileto|hamsi'] | 0 }));
    ok(pl.key === 'fileto|hamsi' && pl2.carry >= 3 && pl2.flagged === pl2.carry, 'oyuncu Soğuk Oda kapısında fileto çeker (geri yatırmaz): ' + JSON.stringify(pl2));
    await p.evaluate(() => { const d = BT.lok.LOK.dolap; BT.player.x = d.sx; BT.player.y = d.sy; });
    await step(p, 0.05, 40);
    const pl3 = await p.evaluate(() => ({ carry: BT.player.carry.filter(i => i.k === 'fileto').length, dolap: BT.lok.q().dolap.hamsi | 0 }));
    ok(pl3.carry === 0 && pl3.dolap >= 3 && pl3.dolap <= 12, 'oyuncu dolapta filetoları bırakır (sınır 12): ' + JSON.stringify(pl3));
    await p.close();
  }

  /* ===== 7) kayıt/yükleme + eski kayıt + inşaat kuralı ===== */
  {
    const p = await page({ insaat: true }); await newGame(p); await prep(p);
    const sv = await p.evaluate(() => {
      const L = BT.lok, out = {};
      const q = BT.tarif.q(); BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
      out.buy = L.buy('lok_tava'); out.buyIns = JSON.parse(JSON.stringify(BT.S.insaat));            /* inşaat kuralı: 1. seviye 1 gün */
      out.tavaNow = L.stLv('tava');                                                                   /* hemen değil */
      out.busyWhy = L.why('lok_tava');
      out.noMenu = L.menuAdd('hamsitava');                                                           /* istasyon henüz hazır değil */
      return out;
    });
    ok(sv.buy && sv.tavaNow === 0 && sv.buyIns.lok_tava && sv.buyIns.lok_tava.lv === 1 && sv.buyIns.lok_tava.left === 1, 'inşaat: istasyon alınır, 1. seviye 1 gün sürer: ' + JSON.stringify(sv));
    ok(sv.busyWhy === 'busy' && sv.noMenu === false, 'inşaattayken tekrar alınamaz, menüye girmez');
    /* gün sonu + gün başı: tamamlanır, tava menüye kendiliğinden girer */
    await nextDay(p);
    const day = await p.evaluate(() => {
      return { tava: BT.lok.stLv('tava'), ins: JSON.stringify(BT.S.insaat), menu: BT.lok.menu().join() };
    });
    ok(day.tava === 1 && day.ins === '{}', 'ertesi gün istasyon hazır: ' + JSON.stringify(day));
    ok(day.menu === 'hamsitava', 'bilinen tarif boş menü yerine otomatik girdi: ' + day.menu);
    const lv = await p.evaluate(() => {
      BT.S.cash = 1e6; const L = BT.lok, out = {};
      L.buy('lok_tava'); out.t2 = JSON.parse(JSON.stringify(BT.S.insaat)).lok_tava;                // Sv2 → 2 gün
      return out;
    });
    await nextDay(p); lv.afterD1 = await p.evaluate(() => BT.lok.stLv('tava'));
    await nextDay(p); lv.afterD2 = await p.evaluate(() => BT.lok.stLv('tava'));
    Object.assign(lv, await p.evaluate(() => {
      const L = BT.lok, out = {};
      L.buy('lok_lv'); out.l2 = JSON.parse(JSON.stringify(BT.S.insaat)).lok_lv;
      L.buy('lok_tb'); out.b2 = JSON.parse(JSON.stringify(BT.S.insaat)).lok_tb;
      out.scaf = BT.lok.push ? 1 : 0;
      return out;
    }));
    ok(lv.t2 && lv.t2.lv === 2 && lv.t2.left === 2 && lv.afterD1 === 1 && lv.afterD2 === 2, 'istasyon Sv2 = 2 gün; yükseltmede eski seviye çalışır: ' + JSON.stringify(lv));
    ok(lv.l2 && lv.l2.lv === 2 && lv.l2.left === 2 && lv.b2 && lv.b2.lv === 2, 'lokanta Sv ve masa yükseltmeleri de L gün: ' + JSON.stringify(lv));
    /* kayıt / yükleme */
    await nextDay(p); await nextDay(p);
    const sav = await p.evaluate(() => {
      const L = BT.lok, q = L.q();
      q.dolap.hamsi = 7; q.dolap.ton = 3; L.hire('lk_asci'); L.hire('lk_garson'); L.crew()[0].lv = 2;
      L.trt(1).pay = [{ k: 'money', v: 30 }, { k: 'money', v: 12 }]; L.trt(2).dirty = 2; L.trt(2).st = 'dirty';
      const snap = BT.buildSave(); const lk = JSON.parse(JSON.stringify(snap.lok));
      return { lk, workers: snap.workers.map(w => w[0]), areas: snap.areas.length };
    });
    ok(sav.lk.lv === 2 && sav.lk.tb === 2 && sav.lk.st.tava === 2 && sav.lk.dolap.hamsi === 7 && sav.lk.crew.length === 2 && sav.lk.pay[1] === 42 && sav.lk.dirty[2] === 2, 'S.lok kaydı: ' + JSON.stringify(sav.lk));
    ok(!sav.workers.some(r => r.startsWith('lk_')), 'lokanta kadrosu ana işçi kaydında yok (çift yüklenmez)');
    ok(sav.areas === 5, 'areas kaydı 5 bölge');
    const ld = await p.evaluate(() => {
      const L = BT.lok, d = JSON.parse(JSON.stringify(BT.buildSave())); BT.lok.X.resetWorld(); BT.loadFrom(d);
      const q = L.q();
      return { lv: q.lv, tb: q.tb, st: q.st.tava, dolap: q.dolap.hamsi, ton: q.dolap.ton, crew: L.crew().map(w => w.role + ':' + w.lv), pay: L.trt(1).pay.reduce((a, m) => a + m.v, 0), dirty: L.trt(2).dirty, open: L.open(), menu: L.menu().join() };
    });
    ok(ld.lv === 2 && ld.tb === 2 && ld.st === 2 && ld.dolap === 7 && ld.ton === 3 && ld.pay === 42 && ld.dirty === 2 && ld.open, 'yükleme: seviye, masa, istasyon, dolap, masa üstü ödeme/kirli tabak: ' + JSON.stringify(ld));
    ok(ld.crew.length === 2 && ld.crew.includes('lk_asci:2'), 'yükleme: kadro ve usta seviyesi: ' + ld.crew);
    /* eski kayıt: lok yok, 4 bölge → temiz */
    const old = await p.evaluate(() => {
      const d = JSON.parse(JSON.stringify(BT.buildSave())); delete d.lok; d.areas = d.areas.slice(0, 4);
      BT.lok.X.resetWorld(); const r = BT.loadFrom(d);
      return { r, open: BT.lok.open(), locked: BT.areas[4].locked, hasQ: !!BT.S.lok, crew: BT.lok.crew().length, a4: BT.areas.length };
    });
    ok(old.r && !old.open && old.locked && old.crew === 0, 'eski kayıt (lok yok, 4 bölge) güvenle yüklenir: ' + JSON.stringify(old));
    const bad = await p.evaluate(() => {
      const d = JSON.parse(JSON.stringify(BT.buildSave())); d.areas[4] = [0, 1]; d.lok = { lv: 'x', tb: 99, st: { tava: 9, izgara: -2 }, dolap: { hamsi: 5000, zzz: 1 }, crew: [{ r: 'hamal' }, { r: 'lk_sef', lv: 9 }, 5], menu: ['nope', 'hamsitava'], pay: { 0: 'a' } };
      BT.lok.X.resetWorld(); const r = BT.loadFrom(d), q = BT.lok.q();
      return { r, lv: q.lv, tb: q.tb, tava: q.st.tava, izgara: q.st.izgara, dolap: BT.lok.dolapN(), cap: BT.lok.cap(), crew: BT.lok.crew().map(w => w.role + ':' + w.lv) };
    });
    ok(bad.r && bad.lv >= 1 && bad.lv <= 5 && bad.tb <= 5 && bad.tava <= 3 && bad.izgara >= 0 && bad.dolap <= bad.cap && bad.crew.join() === 'lk_sef:3', 'bozuk S.lok güvenle düzeltilir: ' + JSON.stringify(bad));
    await p.close();
  }

  /* ===== 8) TR/EN, panel, kancalar, Emekçi kapalıyken ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    const keys = ['lkName', 'lkTables', 'lkGives', 'lkBtn', 'lkNeed', 'lkOpened', 'lkFirst', 'lkSub', 'lkSecLv', 'lkSecSt', 'lkSecMenu', 'lkSecCrew', 'lkLvD', 'lkTbD', 'lkStD', 'lkBuy', 'lkUp', 'lkMax', 'lkEmpty', 'lkNeedLv', 'lkNoSt', 'lkNoRecipe', 'lkMenuAdd', 'lkMenuDel', 'lkMenuFull', 'lkHire', 'lkFire', 'lkHire_full', 'lkHire_role', 'lkHire_stat', 'lkLvDone', 'lkTbDone', 'lkStDone', 'lkDolap', 'lkPass', 'lkKasa', 'lkSink', 'lkMenuB', 'lkWFil', 'lkWKil', 'lkWPass', 'lkTip', 'lkLeft'];
    const tx = await p.evaluate(keys => { const o = {}; ['tr', 'en'].forEach(l => { BT.setLang ? 0 : 0; o[l] = keys.filter(k => !BT.STR[l][k]); }); return { miss: o, same: keys.filter(k => BT.STR.tr[k] === BT.STR.en[k] && !/^lk(Kasa|Pass)$/.test(k)) }; }, keys);
    ok(tx.miss.tr.length === 0 && tx.miss.en.length === 0, 'TR/EN metinleri tam: ' + JSON.stringify(tx.miss));
    const roles = await p.evaluate(() => BT.lok.ROLES.map(r => [BT.lok.X.ROLES[r].n.tr, BT.lok.X.ROLES[r].n.en, BT.lok.X.ROLES[r].d.tr, BT.lok.X.ROLES[r].d.en]));
    ok(roles.every(r => r.every(s => s && s.length > 2)) && roles[0][0] === 'Aşçı' && roles[1][1] === 'Waiter', 'rol adları/açıklamaları TR ve EN: ' + JSON.stringify(roles));
    /* panel */
    await p.evaluate(() => { BT.player.x = 8.95; BT.player.y = 27.2; });
    await step(p, 0.05, 5);
    const bt = await p.evaluate(() => { const b = document.getElementById('actBtn'); return { hidden: b.classList.contains('hidden'), a: b.dataset.a, near: BT.lok.nearBoard() }; });
    ok(bt.near, 'menü tahtasının yanında lokanta düğmesi');
    const pn = await p.evaluate(() => {
      BT.lok.openPanel(); const o = { open: BT.lok.panelOpen(), paused: BT.paused ? BT.paused() : null, rows: document.querySelectorAll('#lokRows .trow').length, title: document.getElementById('lokTitle').textContent };
      const before = BT.S.cash; BT.lok.panelAct('buy', 'lok_izgara'); o.confirm1 = BT.lok.stLv('izgara'); BT.lok.panelAct('buy', 'lok_izgara'); o.bought = BT.lok.stLv('izgara'); o.paid = before - BT.S.cash > 0;
      BT.lok.panelAct('menu', 'orkinosizgara'); o.menuFull = BT.lok.menu().join();
      BT.lok.panelAct('hire', 'lk_garson'); BT.lok.panelAct('hire', 'lk_garson'); o.hired = BT.lok.crew('lk_garson').length;
      o.html = document.getElementById('lokRows').innerText.slice(0, 200);
      return o;
    });
    ok(pn.open && pn.rows >= 12 && /Sahil Lokantası/.test(pn.title), 'LOKANTA paneli açılır: ' + JSON.stringify(pn).slice(0, 200));
    ok(pn.confirm1 === 0 && pn.bought === 1 && pn.paid, 'panel: ikinci dokunuşla (ONAYLA?) satın alma: ' + JSON.stringify(pn));
    ok(pn.hired === 1, 'panelden kadro kiralanır');
    await p.evaluate(() => BT.lok.closePanel());
    const en = await p.evaluate(() => {
      BT.setLang('en'); BT.lok.openPanel();
      const o = { title: document.getElementById('lokTitle').textContent, rows: document.getElementById('lokRows').innerText, sub: document.getElementById('lokSub').textContent };
      BT.lok.closePanel(); o.groups = Object.values(BT.lok.G).map(g => g.t.en).join(); BT.setLang('tr'); return o;
    });
    ok(/Seaside Restaurant/.test(en.title) && /UPGRADE/.test(en.rows) && /BUILD/.test(en.rows) && /MENU/.test(en.rows) && /CREW/.test(en.rows) && !/\blk[A-Z]\w+/.test(en.rows + en.sub) && /Tourists/.test(en.groups), 'EN panel metinleri: ' + en.title + ' | ' + en.rows.slice(0, 90));
    /* dünyada menü tahtasına/tabelaya dokununca panel açılır */
    await p.evaluate(() => { BT.player.x = 5; BT.player.y = 26.2; });
    await sleep(1300);
    await p.evaluate(() => { const e = document.getElementById('lvlUp'); if (e) e.classList.add('hidden'); });
    const tp = await p.evaluate(() => { const v = BT.canvasPt(BT.lok.LOK.board.x, BT.lok.LOK.board.y, 0), r = document.getElementById('game').getBoundingClientRect(), k = r.width / HKG.W; return [r.left + v[0] * k, r.top + v[1] * k]; });
    await p.mouse.click(tp[0], tp[1] - 22); await sleep(250);
    const tapped = await p.evaluate(() => { const o = BT.lok.panelOpen(); BT.lok.closePanel(); return o; });
    ok(tapped, 'menü tahtasına dokununca LOKANTA paneli açılır: ' + JSON.stringify(tp));
    await p.close();
  }

  /* ===== 9) Emekçi Mod kapalıyken lokanta kendi kendine yavaş çalışır; HK_LOK_OFF eski davranış ===== */
  {
    const p = await page({ emekOff: true }); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    const off = await p.evaluate(() => { const L = BT.lok; L.spawn('aile'); return { emek: BT.emek.on(), pr: L.presence('tava') }; });
    await step(p, 0.05, 180);
    const off2 = await p.evaluate(() => ({ jobs: BT.lok.S.tava.jobs.length, cooked: BT.lok.R.board[0] ? BT.lok.R.board[0].cooked + BT.lok.R.board[0].inprog : -1 }));
    ok(!off.emek && off.pr === 0.35 && off2.cooked >= 1, 'Emekçi kapalı: başında kimse olmasa da %35 hızla pişer: ' + JSON.stringify([off, off2]));
    await p.close();
    const p2 = await b.newPage({ viewport: { width: 390, height: 844 } });
    p2.on('pageerror', e => errs.push('PE2: ' + e.message));
    await newGame(p2);
    const lo = await p2.evaluate(() => ({ off: !!window.HK_LOK_OFF, open: BT.lok.open() }));
    await p2.evaluate(() => { BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters(); BT.lok.tick(1); });
    const lo2 = await p2.evaluate(() => ({ open: BT.lok.open(), grp: BT.lok.R.grp.length }));
    ok(lo.off && !lo2.open && lo2.grp === 0, 'HK_LOK_OFF=1: bölge açık olsa da lokanta çalışmaz: ' + JSON.stringify([lo, lo2]));
    await p2.close();
  }

  /* ===== 10) ince mod: 5 kanca çağrılır (parametreleri doğru), hata yok; klasik çizim de aynı veriyle ===== */
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { window.HK_LOK_OFF = 0; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = 0; window.HK_INSAAT_OFF = 1; window.HK_HELP_OFF = 1; try { const d = JSON.parse(localStorage.getItem('balikci_pref') || '{}'); d.vis = 1; localStorage.setItem('balikci_pref', JSON.stringify(d)); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE10: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C10: ' + m.text()); });
    await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava'], lv: 2 });
    await p.evaluate(() => {
      window.__H = {}; window.HKA = window.HKA || {};
      ['drawLokanta', 'drawLokTable', 'drawLokStation', 'drawLokCrew', 'drawLokFix'].forEach(n => { const old = window.HKA[n]; window.HKA[n] = function (o) { (window.__H[n] = window.__H[n] || []).push(o); return false; }; });
      const L = BT.lok; ['lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r)); L.q().dolap.hamsi = 12; L.R.arr = 0.1;
    });
    await step(p, 0.05, 20 * 40);
    await p.evaluate(() => { BT.player.x = 4.5; BT.player.y = 26.5; });
    await sleep(1500);
    const h = await p.evaluate(() => {
      const H = window.__H, out = { fine: window.HKG ? HKG.K : 0 };
      for (const n of Object.keys(H)) out[n] = H[n].length;
      const f = (n, fn) => H[n] && H[n].length ? fn(H[n][H[n].length - 1]) : false;
      out.deck = f('drawLokanta', o => o.x0 === 0 && o.y1 === 29.5 && typeof o.lv === 'number' && typeof o.tb === 'number' && o.st && 'tava' in o.st && Array.isArray(o.path) && o.kitchen && o.gate);
      out.table = f('drawLokTable', o => typeof o.i === 'number' && (o.seats === 2 || o.seats === 4) && typeof o.st === 'string' && 'plates' in o && 'dirty' in o && 'pay' in o && 'mood' in o);
      out.station = f('drawLokStation', o => ['tava', 'izgara', 'tencere', 'firin'].includes(o.id) && 'busy' in o && 'prog' in o && 'wait' in o && 'lv' in o && 'cook' in o);
      out.crew = f('drawLokCrew', o => ['asci', 'garson', 'bulasik', 'sef'].includes(o.role) && o.a && o.outfit && 'lv' in o && 'plates' in o);
      out.fix = H.drawLokFix ? [...new Set(H.drawLokFix.map(o => o.k))].sort().join() : '';
      return out;
    });
    ok(h.fine > 1, 'ince mod açık (K>1): ' + h.fine);
    ok(h.drawLokanta > 0 && h.drawLokTable > 0 && h.drawLokStation > 0 && h.drawLokCrew > 0 && h.drawLokFix > 0, 'beş kanca da çağrılır: ' + JSON.stringify(h));
    ok(h.deck && h.table && h.station && h.crew, 'kanca parametreleri: ' + JSON.stringify(h));
    ok(['board', 'dolap', 'kasa', 'pass', 'sign', 'sink'].every(k => h.fix.split(',').includes(k)), 'drawLokFix türleri: ' + h.fix);
    await ctx.close();
  }

  /* ===== 11) ekran görüntüleri (yalnız klasör verilince): lokanta genel + servis sırasında ===== */
  if (SHOT) {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav', 'levrekbugulama'], lv: 3 });
    await p.evaluate(() => {
      const L = BT.lok; L.buy('lok_tb'); L.buy('lok_tb'); L.buy('lok_lv');
      ['lk_asci', 'lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r));
      const q = L.q(); q.dolap = { hamsi: 8, levrek: 4 };
      BT.player.x = 8.9; BT.player.y = 27.0; BT.S.cash = 1e6; L.R.arr = 1e9; L.spawn('aile'); setTimeout(() => L.spawn('turist'), 900); setTimeout(() => L.spawn('kahve'), 6000);
    });
    let gotA = false, gotB = false;
    for (let i = 0; i < 160 && !(gotA && gotB); i++) {
      await step(p, 0.1, 5);
      const st = await p.evaluate(() => { const L = BT.lok, g = L.R.grp; return { seated: g.filter(x => x.st === 'wait' || x.st === 'eat').length, eat: g.filter(x => x.st === 'eat').length, carry: L.crew('lk_garson').some(w => w.carry.some(i => i.k === 'plate')) && L.R.grp.some(x => x.st === 'wait'), pass: L.R.pass.length, n: g.length, dolap: L.dolapN() }; });
      if (!gotA && st.seated >= 2) { await p.evaluate(() => { BT.lok.q().dolap.hamsi = 8; BT.player.x = 8.9; BT.player.y = 27.0; }); await sleep(1400); await shot(p, 'lokanta-genel'); gotA = true; }
      if (gotA && !gotB && st.carry) { await sleep(150); await shot(p, 'lokanta-servis'); gotB = true; }
      if (i % 20 === 19) await p.evaluate(() => { BT.lok.q().dolap.hamsi = 8; BT.lok.q().dolap.levrek = 4; });
    }
    ok(gotA && gotB, 'ekran görüntüleri alınabildi: ' + gotA + '/' + gotB);
    await p.close();
  }

  console.log(JSON.stringify({ R, fail, errs: [...new Set(errs)] }, null, 1));
  await b.close();
  process.exit(fail.length || errs.length ? 1 : 0);
})();
