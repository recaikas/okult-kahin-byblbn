/* v2.19-deneme — Sahil Lokantası, Aşama 1 (LOKANTA_TASARIM.md):
   1) açılış koşulu: Mutfak açık + itibar Sv 5, bedel, ALAN kartı, canStand/kamera erişimi
   2) tam zincir: sipariş fişi → pişirme → pass → servis → yemek → ödeme → bulaşık
   3) Emekçi beklemesi: istasyonun başında kimse yokken pişmez; oyuncu durunca pişer
   4) aşçı + garson + bulaşıkçı (+ şef garson) otomasyonu; Depo Hamalı dolabı besler (tezgâh önceliği)
   5) bahşiş hızı, sabır kaçışı (itibar −), grup türleri
   6) istasyon/menü kısıtı (bilinen + istasyonu kurulu; yer = lokanta seviyesi), kadro sınırı
   7) kayıt/yükleme (eski kayıt güvenli), inşaat kuralı (L. seviye L gün), çöp kovası tabağı atmaz
   8) TR/EN metinleri, layoutClashes, panel
   19) v2.23 ocak yerleri: Sv'ye göre yer sayısı, aynı türden çok ocak, sök/düşür, eski kayıt göçü, panel
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
    await ctx.addInitScript(o => { window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = 1; window.HK_LOK_EVOFF = o.ev ? 0 : 1; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = o.emekOff ? 1 : 0; window.HK_INSAAT_OFF = o.insaat ? 0 : 1; window.HK_HELP_OFF = o.help ? 0 : 1; }, o);
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
    BT.day.phase = 'play'; BT.day.t = 10; BT.player.carry.length = 0; BT.player.x = 31; BT.player.y = 18.5;
    BT.customers.length = 0;
  });
  /* istasyonları kur, tarifleri bildir, kileri doldur, menüyü kur */
  const kit = (p, o = {}) => p.evaluate(o => {
    const L = BT.lok, q = BT.tarif.q();
    BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
    Object.keys(q.kiler).forEach(k => delete q.kiler[k]); BT.tarif.ing.forEach(g => { q.kiler[g.id] = 50; });
    const sts = o.st || ['tava', 'izgara', 'tencere', 'firin'];
    if (sts.length > L.slotN()) L.q().sn = sts.length;                              /* v2.23: Sv1'de 2 ocak yeri; kit eski kayıt göçü gibi fazla yeri açık sayar */
    sts.forEach(k => L.buy('lok_' + k));                                             /* eski kimlik kısa yolu: ilk boş yere o türü kurar */
    if (o.lv) { for (let i = 1; i < o.lv; i++) L.buy('lok_lv'); }
    (o.menu || []).forEach(id => L.menuAdd(id));
    const lq = L.q(); if (o.fill !== false) { ['hamsi', 'uskumru', 'palamut', 'levrek', 'ton', 'guvec'].forEach(f => { lq.dolap[f] = 0; }); lq.dolap.hamsi = 12; }
    BT.lok.R.arr = 1e9;
    return { open: L.open(), st: Object.fromEntries(L.STK.map(k => [k, L.stLv(k)])), sl: lq.sl.map(x => x && x.k + x.lv), menu: L.menu() };
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
      S.cash = 1e6; const dl0 = BT.DEPOT.lvl; BT.DEPOT.lvl = 0; c = BT.lok.X.barList().find(c => c.id === 'a4'); out.noDepo = c ? [!!c.blocked, c.why] : null; BT.DEPOT.lvl = Math.max(1, dl0);   /* v2.22: Depo şartı */
      c = BT.lok.X.barList().find(c => c.id === 'a4'); out.ready = c ? !c.blocked : null;
      { const t0 = document.querySelector('.dtab.on'); if (t0) t0.click(); }
      BT.lok.X.openBar('area');                                                      /* ALAN sekmesi: kart + ONAYLA? */
      const before = S.cash; document.querySelector('#dpCards .buy').click(); out.cf = document.querySelector('#dpCards .buy').innerText;
      document.querySelector('#dpCards .buy').click();
      out.paid = before - S.cash; out.openNow = BT.lok.open() && !A[4].locked;
      out.q = !!S.lok; out.cardAfter = BT.lok.X.barList().find(c => c.id === 'a4') ? 1 : 0;
      /* konum: iskele devamı, kameraya ulaşır, yürünür */
      out.walk = BT.canStand(27.5, 19) && BT.canStand(33, 20.5) && BT.canStand(20, 15) && BT.canStand(12.5, 20.4) && BT.canStand(9.6, 20.4) && BT.canStand(14.3, 18) && !BT.canStand(18.1, 11.5) && BT.canStand(14.5, 12) && BT.canStand(20, 22.6) && !BT.canStand(5, 29.9) && !BT.canStand(5, 24) && !BT.canStand(12.5, 25) && !BT.canStand(30, 12) && !BT.canStand(20, 26);   /* v2.22: birleşik alan (x 15–36, y 13,2–23,6) + sıra şeridi, koridor, arka kapı patikası */
      { const t = document.querySelector('.dtab.on'); if (t) t.click(); }
      BT.player.x = 5; BT.player.y = 5;
      out.clash = BT.layoutClashes(0.1);
      out.envOk = BT.areas.length === 5;
      return out;
    });
    ok(R.open.n === 5 && R.open.id === 'sahil' && R.open.lok, 'AREAS sonuna lokanta bölgesi eklenmeli ' + JSON.stringify(R.open));
    ok(R.open.repLv === 5, 'açılış itibarı Sv 5 olmalı: ' + R.open.repLv);
    ok(R.open.lockedAtStart, 'lokanta başta kilitli');
    ok(R.open.noDepo && R.open.noDepo[0] && /Depo/.test(R.open.noDepo[1]), 'Depo yokken lokanta kartı kilitli: ' + JSON.stringify(R.open.noDepo));
    ok(!R.open.cardsBeforeKitchen.includes('a4') && R.open.cardsBeforeKitchen.includes('a3'), 'Mutfak kilitliyken lokanta kartı yok, Mutfak kartı var: ' + R.open.cardsBeforeKitchen);
    ok(R.open.lowRep === true, 'itibar Sv5 altında kart engelli');
    ok(R.open.ready === true && R.open.cost > 98700 * 0.7 && R.open.cost < 98700 * 0.8, 'bedel 98.700 (v2.24: kullanıcı isteği ≈ $74.000) × Emekçi 0,75: ' + R.open.cost);
    ok(R.open.cf === 'ONAYLA?', 'ALAN kartı ONAYLA? ister: ' + R.open.cf);
    ok(R.open.paid === R.open.cost && R.open.openNow && R.open.q, 'açılınca bedel düşer, bölge açılır, S.lok kurulur');
    ok(R.open.cardAfter === 0, 'açıldıktan sonra kart kalkar');
    ok(R.open.walk, 'lokanta zemini yürünebilir (Mutfak ucundan geçilir)');
    ok(R.open.clash.length === 0, 'layoutClashes boş: ' + R.open.clash.join(', '));
    await sleep(1800);
    await p.evaluate(() => { BT.player.x = 31; BT.player.y = 19.6; }); await sleep(2200);
    const cam = await p.evaluate(() => { const a = BT.canvasPt(31, 23.4, 0), b = BT.canvasPt(35.5, 15, 0), c = document.getElementById('game'); return { a, b, W: c.clientWidth, H: c.clientHeight }; });
    ok(cam.a[0] > 0 && cam.a[0] < cam.W && cam.a[1] > 0 && cam.a[1] < cam.H, 'kamera lokantanın güneyine/doğusuna ulaşır, oyuncu ekranda: ' + JSON.stringify(cam));
    await p.close();
  }

  /* ===== 1b) v2.21: ALAN'dan alınca İNŞAAT kuralı (1 gün), iskele, 4 adımlı rehber kartı ===== */
  {
    const p = await page({ insaat: true, help: true }); await newGame(p);
    const r = await p.evaluate(() => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; BT.achMute(true); S.cash = 1e6; S.rep = 400; BT.DEPOT.lvl = Math.max(1, BT.DEPOT.lvl);   /* v2.22: lokanta Depo ister */
      BT.areas.forEach((a, i) => { a.locked = i >= 4; }); BT.rebuildCounters(); BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; });
      BT.lok.X.openBar('area');
      document.querySelector('#dpCards .buy').click(); document.querySelector('#dpCards .buy').click();
      return { unl: !BT.areas[4].locked, open: BT.lok.open(), ins: JSON.stringify(S.insaat.lok_open || null), hire: !!BT.lok.hire('lk_asci'), panel: BT.lok.openPanel('menu') };
    });
    ok(r.unl && !r.open && /"left":1/.test(r.ins) && !r.hire && !r.panel, 'ALAN\'dan alınca lokanta 1 gün inşaatta (iskele), kadro/panel kapalı: ' + JSON.stringify(r));
    await p.evaluate(() => { BT.player.x = 31; BT.player.y = 19.5; }); await sleep(1500);
    await shot(p, 'insaat');
    await nextDay(p); await sleep(1500);
    const r2 = await p.evaluate(() => ({ open: BT.lok.open(), ins: !!BT.S.insaat.lok_open, help: !document.getElementById('helpScr').classList.contains('hidden'), t: document.getElementById('helpB').innerText.replace(/\s+/g, ' ') }));
    ok(r2.open && !r2.ins, 'inşaat bitince lokanta açılır: ' + JSON.stringify(r2));
    for (let i = 0; i < 6 && !/REHBERİ/.test(await p.evaluate(() => document.getElementById('helpT').innerText)); i++) { await p.evaluate(() => document.getElementById('helpGo').click()); await sleep(200); }
    r2.help = await p.evaluate(() => !document.getElementById('helpScr').classList.contains('hidden')); r2.t = await p.evaluate(() => document.getElementById('helpB').innerText.replace(/\s+/g, ' '));
    ok(r2.help && /1\) .*KAPALI/.test(r2.t) && /2\) .*ocak/.test(r2.t) && /3\) /.test(r2.t) && /4\) .*Tedarikçi/.test(r2.t) && /5\) .*pass/.test(r2.t) && /6\) .*PERSONEL/.test(r2.t) && /7\) .*SÜSLER/.test(r2.t), 'açılışta 7 adımlı rehber kartı (TR): ' + r2.t);
    await p.close();
  }

  /* ===== 1c) v2.21: kadro sadeleştirme (rol başına 1 → Sv2'de 2 → Sv4'te 3), Kalfa/Usta gizli, Tedarikçi (eski Komi) + Hal'den fileto ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava'] });
    const c = await p.evaluate(() => {
      const L = BT.lok, o = {};
      o.roles = L.ROLES.join();
      o.max1 = L.ROLES.map(r => L.roleMax(r)).join();
      L.hire('lk_garson'); o.garson2why = L.hireWhy('lk_garson'); L.hire('lk_komi'); o.komi2why = L.hireWhy('lk_komi'); o.komiN = L.crew('lk_komi').length;
      ['lk_asci', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r)); o.all5 = L.crew().length; o.cap1 = L.crewCap();   /* Sv1: beş rolün hepsi alınabilir */
      L.q().lv = 2; o.max2 = L.ROLES.map(r => L.roleMax(r)).join(); o.garson2ok = L.hireWhy('lk_garson');
      L.q().lv = 4; o.max4 = L.ROLES.map(r => L.roleMax(r)).join();
      L.q().lv = 5; o.max5 = L.ROLES.map(r => L.roleMax(r)).join();
      L.q().lv = 1; L.openPanel('crew');
      o.train = document.querySelectorAll('#lokRows button[data-a="train"]').length; o.fireN = document.querySelectorAll('#lokRows button[data-a="fire"]').length; o.lvTag = /Çırak|Kalfa|Usta/.test(document.getElementById('lokRows').innerText);
      L.closePanel();
      return o;
    });
    ok(c.roles === 'lk_asci,lk_garson,lk_bulasik,lk_sef,lk_komi', 'Komi rolü kadroda: ' + c.roles);
    ok(c.all5 === 5 && c.cap1 === 5, 'Sv1: kadro sınırı 5, beş rolün her birinden biri alınır: ' + JSON.stringify([c.all5, c.cap1]));
    ok(c.max1 === '1,1,1,1,1' && c.garson2why === 'role' && c.komi2why === 'role' && c.komiN === 1, 'Sv1: her rolden yalnız 1 kişi: ' + JSON.stringify([c.max1, c.garson2why, c.komi2why, c.komiN]));
    ok(c.max2 === '2,2,2,2,2' && c.garson2ok !== 'role' && c.max4 === '3,3,3,3,3', 'ikinci kişi Sv2\'de, üçüncü Sv4\'te (aşçı: istasyon sayısı kadar, 4 istasyon): ' + JSON.stringify([c.max2, c.garson2ok, c.max4]));
    ok(c.train === 0 && c.fireN >= 2 && !c.lvTag, 'Kalfa/Usta (USTALAŞTIR) lokanta panelinde gizli (LOK_USTA = 0): ' + JSON.stringify([c.train, c.fireN, c.lvTag]));
    /* Komi: hasırdan filetoyu dolaba taşır (menüdeki balık), dolap payını aşmaz */
    const k = await p.evaluate(() => {
      const L = BT.lok, T = BT.tables[0], o = {}; L.q().dolap.hamsi = 0;
      T.mat.items.length = 0; for (let i = 0; i < 5; i++) T.mat.items.push({ k: 'fileto', f: 'hamsi' });
      T.mat.items.push({ k: 'fileto', f: 'palamut' });
      BT.player.x = 5; BT.player.y = 5; o.n0 = T.mat.items.length; return o;
    });
    await step(p, 0.05, 20 * 160);
    const k2 = await p.evaluate(() => { const L = BT.lok, T = BT.tables[0]; return { dolap: L.q().dolap.hamsi | 0, palamut: L.q().dolap.palamut | 0, mat: T.mat.items.filter(i => i.f === 'hamsi').length, matPal: T.mat.items.filter(i => i.f === 'palamut').length, komi: L.crew('lk_komi').map(w => [w.x.toFixed(1), w.y.toFixed(1), w.carry.length]) }; });
    ok(k2.dolap >= 4 && k2.palamut === 0 && k2.matPal === 1, 'Komi hasırdan menüdeki balığın (hamsi) filetosunu dolaba taşır, menüde olmayanı (palamut) taşımaz: ' + JSON.stringify(k2));
    /* oyuncu dolaba balık başına pay olmadan koyar (dolap dolana dek); personelin payı (roomFair) ayrı */
    const pdr = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), P = BT.player, o = {};
      const kn = BT.S.tarif.known, lv0 = q.lv, m0 = q.menu.slice();
      if (kn.indexOf('uskumrudolma') < 0) kn.push('uskumrudolma');
      q.lv = 2; q.menu = ['hamsitava', 'uskumrudolma', null, null, null];        /* iki balık → personel payı 6 */
      q.dolap = {}; o.share = L.share(); o.want = Object.keys(L.wantF()).length;
      q.dolap.hamsi = o.share; o.room = L.room('hamsi'); o.fair = L.roomFair('hamsi');
      q.lv = lv0; q.menu = m0; q.dolap = {};
      return o;
    });
    ok(pdr.want === 2 && pdr.share === 6 && pdr.room === 6 && pdr.fair === 0, 'oyuncu için pay yok, personel payı gözetir: ' + JSON.stringify(pdr));
    /* Hal'den fileto al: 6'lık paket, FISH.val × 1,3 × 6, anında dolaba; kimse yokken de çalışır */
    const h = await p.evaluate(() => {
      const L = BT.lok, o = {}; L.q().dolap = {}; BT.S.cash = 5000; L.crew().forEach(w => L.fire(w));
      L.openPanel('menu'); const b = document.querySelector('#lokRows button[data-a="hal"]'); o.btn = !!b && b.offsetHeight >= 44; o.txt = b ? b.innerText : '';
      const val = BT.FISH.hamsi.val; o.price = Math.round(val * 1.3 * 6); const c0 = BT.S.cash;
      if (b) b.click(); o.paid = c0 - BT.S.cash; o.dolap = L.q().dolap.hamsi | 0; BT.lok.closePanel();
      L.q().dolap = {}; BT.S.cash = 3; L.openPanel('menu'); const b2 = document.querySelector('#lokRows button[data-a="hal"]'); o.poor = !!b2 && b2.disabled; L.closePanel();
      return o;
    });
    ok(h.btn && h.paid === h.price && h.dolap === 6 && h.poor, 'Hal\'den fileto al: 6\'lık paket FISH.val × 1,3 × 6, anında dolaba, yetersiz parada pasif: ' + JSON.stringify(h));
    /* oyuncu elindeki filetoyu dolaba bırakır */
    const pd = await p.evaluate(() => { const L = BT.lok; L.q().dolap = {}; BT.player.carry.length = 0; BT.player.carry.push({ k: 'fileto', f: 'hamsi' }, { k: 'fileto', f: 'hamsi' }); BT.player.x = L.LOK.dolap.sx; BT.player.y = L.LOK.dolap.sy; return 1; });
    await step(p, 0.05, 40);
    const pd2 = await p.evaluate(() => ({ dolap: BT.lok.q().dolap.hamsi | 0, carry: BT.player.carry.length }));
    ok(pd2.dolap === 2 && pd2.carry === 0, 'oyuncu elindeki filetoyu dolaba bırakır: ' + JSON.stringify(pd2));
    await p.close();
  }

  /* ===== 2) tam zincir (oyuncu hepsini yapar) ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    R.kit = await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    ok(R.kit.open && R.kit.st.tava === 1, 'tava kuruldu ve menüde: ' + JSON.stringify(R.kit));
    ok(R.kit.menu.join() === 'hamsitava', 'menü: ' + R.kit.menu);
    const c0 = await p.evaluate(() => { const L = BT.lok, g = L.spawn('aile'); BT.S.rep = 400; return { n: g.n, st: g.st, cash: BT.S.cash, rep: BT.S.rep }; });
    await step(p, 0.05, 420);                                                    /* yürür, oturur, sipariş verir */
    const s1 = await p.evaluate(() => { const L = BT.lok, g = L.R.grp[0]; return { st: g && g.st, board: L.R.board.length, ord: L.R.board[0] && { n: L.R.board[0].n, rec: L.R.board[0].rec, cooked: L.R.board[0].cooked }, tb: g && g.tb }; });
    ok(s1.st === 'wait' && s1.board === 1 && s1.ord.n === 4 && s1.ord.rec === 'hamsitava', 'grup oturdu, panoya 4 × Hamsi Tava fişi düştü: ' + JSON.stringify(s1));
    /* başında kimse yok: Emekçi Mod'da pişmez */
    await step(p, 0.05, 100);
    const s2 = await p.evaluate(() => { const L = BT.lok; return { cooked: L.R.board[0].cooked, jobs: L.S.s0.jobs.length, wait: L.S.s0.wait, dolap: L.q().dolap.hamsi, pr: L.presence('s0') }; });
    ok(s2.cooked === 0 && s2.jobs === 0 && s2.dolap === 12 && s2.pr === 0, 'Emekçi: başında kimse yokken pişmez, malzeme harcanmaz: ' + JSON.stringify(s2));
    ok(s2.wait === 'cook', 'istasyon "aşçı/başında biri yok" bekliyor: ' + s2.wait);
    /* oyuncu istasyonun başına geçer */
    await p.evaluate(() => { const d = BT.lok.SL[0]; BT.player.x = d.sx; BT.player.y = d.sy; });
    await step(p, 0.05, 20);
    const s3 = await p.evaluate(() => { const L = BT.lok; return { jobs: L.S.s0.jobs.length, pr: L.presence('s0'), dolap: L.q().dolap.hamsi, kiler: BT.tarif.q().kiler.misirunu }; });
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
    await p.evaluate(() => { BT.player.x = 31; BT.player.y = 18.5; });
    const s6 = await p.evaluate(() => { const g = BT.lok.R.grp[0]; return { st: g.st, carry: BT.player.carry.filter(i => i.k === 'plate').length, plates: BT.lok.trt(g.tb).plates, serve: g.serve }; });
    ok(s6.st === 'eat' && s6.carry === 0, 'tabaklar masaya bırakıldı, grup yemeye başladı: ' + JSON.stringify(s6));
    /* yemek 8–12 sn */
    const eat = await p.evaluate(() => BT.lok.R.grp[0].eatMax); ok(eat >= 8 * 0.99 * 1.1 || eat >= 8, 'yeme süresi 8–12 sn (aile ×1): ' + eat);
    await step(p, 0.05, 20 * 13);
    const s7 = await p.evaluate(() => { const t = BT.lok.trt(0); return { tbN: t.pay.length, pay: t.pay.reduce((a, m) => a + m.v, 0), dirty: t.dirty, tst: t.st, sv: BT.lok.q().sv, val: BT.lok.plateVal('hamsitava') }; });
    ok(s7.tst === 'dirty' && s7.dirty === 4 && s7.tbN >= 1, 'yemek bitti: masada ödeme yığını + 4 kirli tabak, masa dolu: ' + JSON.stringify(s7));
    ok(s7.pay >= s7.val * 4 && s7.pay <= s7.val * 4 * 1.31, 'ödeme = tarif değeri × kişi + bahşiş (≤ +%30): ' + s7.pay + ' / ' + s7.val * 4);
    ok(s7.val === Math.round(6 * 2.6 * 1.2), 'tabak değeri FISH.val × çarpan × 1,2: ' + s7.val);
    /* para: oyuncu masadan alır, Kasa'ya bırakır */
    const cash0 = await p.evaluate(() => BT.S.cash);
    await p.evaluate(() => { const t = BT.lok.TB[BT.lok.R.grp.length ? BT.lok.R.grp[0].tb : 0]; });
    const tbi = await p.evaluate(() => { for (let i = 0; i < 12; i++) if (BT.lok.trt(i).pay.length) return i; return -1; });
    await p.evaluate(i => { const t = BT.lok.TB[i]; BT.player.x = t.sx; BT.player.y = t.sy; }, tbi);
    await step(p, 0.05, 40);
    const s8 = await p.evaluate(c0 => ({ money: BT.player.carry.filter(i => i.k === 'money').length, dirty: BT.player.carry.filter(i => i.k === 'dirty').length, cash: BT.S.cash - c0 }), cash0);
    ok(s8.money === 0 && s8.cash >= s7.pay - 1 && s8.dirty >= 1 && s8.dirty <= 8, 'v2.22: patron masadaki parayı doğrudan cebine atar (taşımaz), kirli tabakları toplar (sepet sınırı 8): ' + JSON.stringify(s8));
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
      L.hire('lk_komi'); out.n6 = L.crew().length;                                 /* altıncı kişi: kadro dolar */
      out.fullWhy = L.hireWhy('lk_garson');
      out.wages = L.crew().map(w => BT.lok.X.workerWage(w));
      L.q().dolap.hamsi = 12; L.q().dolap.hamsi = 12;
      return out;
    });
    ok(cr.n === 5 && cr.st.length === 2 && cr.st[0] !== cr.st[1], 'kadro kuruldu, istasyon başına bir aşçı: ' + JSON.stringify(cr));
    ok(cr.third === 2, 'istasyon sayısından fazla aşçı alınamaz: ' + cr.third);
    ok(cr.cap === 6 && cr.n6 === 6, 'kadro sınırı = 4 + lokanta seviyesi (Sv2 → 6): ' + JSON.stringify([cr.cap, cr.n6]));
    ok(cr.fullWhy === 'full', 'kadro doluyken garson alınamaz: ' + cr.fullWhy);
    await p.evaluate(() => { BT.lok.R.arr = 0.1; BT.player.x = 5; BT.player.y = 5; });
    await step(p, 0.05, 20 * 100);
    const a1 = await p.evaluate(() => { const L = BT.lok, q = L.q(); return { sv: q.sv, ls: q.ls, cash: BT.S.cash, board: L.R.board.length, grp: L.R.grp.length, dirty: L.R.t.reduce((a, t) => a + t.dirty, 0), sunk: L.R.sinkN, pay: L.R.t.reduce((a, t) => a + t.pay.length, 0), dolap: q.dolap.hamsi, rep: BT.S.rep }; });
    ok(a1.sv >= 3, 'kadro tek başına grupları ağırlar (oyuncu uzakta): ' + JSON.stringify(a1));
    ok(a1.sunk >= 3, 'bulaşıkçı kirli tabakları götürür: ' + JSON.stringify(a1));
    /* v2.22: kasa batıda (kapı yanı), uzak masadan dönüş uzun — yeni gelişi durdurup biraz bekle; ödeme kalmamalı */
    await p.evaluate(() => { BT.lok.R.arr = 1e9; });
    for (let i = 0; i < 12 && await p.evaluate(() => BT.lok.R.grp.length > 0); i++) await step(p, 0.05, 20 * 10);   /* v2.23: Tedarikçi dolabı doldurduğu için masalar dolu kalır: son grup kalkana dek */
    await step(p, 0.05, 20 * 30);
    const a2 = await p.evaluate(() => { const L = BT.lok, sf = L.crew('lk_sef')[0]; return { pay: L.R.t.reduce((a, t) => a + t.pay.length, 0), grp: L.R.grp.length, sef: sf && [sf.x.toFixed(1), sf.y.toFixed(1), sf.carry.map(i => i.k).join(), sf._cov, sf.mode], at: L.R.t.map((t, i) => t.pay.length ? i + ':' + t.st + ':' + t.dirty : '').filter(Boolean).join() }; });
    ok(a2.pay === 0, 'şef garson masadaki parayı toplar ve Kasa\'ya bırakır: ' + JSON.stringify([a1, a2]));
    await p.evaluate(() => { BT.lok.R.arr = 0.1; });
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
      for (let i = 0; i < 300; i++) BT.emek.step(0.05, 1);
      const t = L.trt(g.tb), ord = g.ord; t.plates = g.n - 1; g.ord.deliv = g.n - 1;
      const pass = { k: 'plate', f: 'hamsi', d: 'hamsitava', tb: g.tb, ord }; BT.player.carry.push(pass);
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      const cA = BT.S.cash; for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      const eatSt = g.st;
      for (let i = 0; i < 20 * 14; i++) BT.emek.step(0.05, 1);
      const tt = L.trt(g.tb), mine = BT.player.carry.filter(i => i.k === 'money').reduce((a, m) => a + m.v, 0);
      return { eatSt, tipF: g.tipF, pay: tt.pay.reduce((a, m) => a + m.v, 0) + mine + (BT.S.cash - cA), base: L.plateVal('hamsitava') * 2, serve: g.serve };
    });
    const slow = await p.evaluate(() => {
      const L = BT.lok; L.R.grp.length = 0; L.R.board.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      const g = L.spawn('turist'); BT.player.carry.length = 0; BT.player.x = 31; BT.player.y = 18.5;
      for (let i = 0; i < 300; i++) BT.emek.step(0.05, 1);
      g.pat = g.patMax * 0.4; BT.gameT_dummy = 0;
      const ord = g.ord; g.t0 -= g.patMax * 0.9;                                   /* uzun bekletildi */
      const t = L.trt(g.tb); t.plates = g.n - 1; ord.deliv = g.n - 1;
      BT.player.carry.push({ k: 'plate', f: 'hamsi', d: 'hamsitava', tb: g.tb, ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy; const cA = BT.S.cash;
      for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      for (let i = 0; i < 20 * 14; i++) BT.emek.step(0.05, 1);
      const tt = L.trt(g.tb), mine = BT.player.carry.filter(i => i.k === 'money').reduce((a, m) => a + m.v, 0);
      return { tipF: g.tipF, pay: tt.pay.reduce((a, m) => a + m.v, 0) + mine + (BT.S.cash - cA), base: L.plateVal('hamsitava') * 2, serve: g.serve };
    });
    ok(fast.eatSt === 'eat', 'son tabak gelince grup yer: ' + JSON.stringify(fast));
    ok(fast.tipF > 0.2 && fast.tipF <= 0.51 && fast.pay > fast.base * 1.2, 'hızlı servis: bahşiş yüksek (turist +%30 × 1,7 ≤ %51): ' + JSON.stringify(fast));
    ok(slow.tipF < 0.05 && slow.pay <= slow.base * 1.06, 'yavaş servis: bahşiş yok: ' + JSON.stringify(slow));
    ok(fast.pay > slow.pay, 'hız bahşişi artırır: ' + fast.pay + ' > ' + slow.pay);
    R.tip = { fast, slow };
    /* sabır: kimse pişirmiyor → grup kızıp kalkar, itibar −, sipariş iptal */
    const lost = await p.evaluate(() => {
      const L = BT.lok; L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      BT.player.x = 31; BT.player.y = 18.5; const rep0 = BT.S.rep, ls0 = L.q().ls, lost0 = BT.S.lost;
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
      const fs = L.q().sl[1]; out.firinAt = fs && fs.k; L.q().sl[1] = null; out.dropped = L.menu().join();   /* ocak kalkınca menüde sayılmaz */
      L.q().sl[1] = fs;
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

  /* ===== 6) v2.23 TEDARİKÇİ (eski Komi): dolabı + kileri doldurur — (a) Soğuk Oda, (b) hasır, (c) mutfağın hazır güveci (tezgâhta en az
     SUP_KEEP bırakır), (d) stok yokken Hal'den alır (kasadan), kileri doldurur, (e) kasada para yoksa almaz; (f) Depo Hamalı dolaba taşımaz.
     Oyuncu Soğuk Oda'dan çeker. ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'firin'], menu: ['hamsitava', 'reisguveci'], lv: 2, fill: false });
    const d = await p.evaluate(() => {
      const L = BT.lok, out = {};
      BT.counters.forEach(c => { c.open = false; });
      BT.tables.forEach(t => { t.mat.items.length = 0; }); BT.kitchen.mat.items.length = 0;
      BT.DEPOT.lvl = 2; BT.DEPOT.cold = {}; BT.DEPOT.cold['fileto|hamsi'] = 10; L.q().dolap = {};
      const w = BT.hire('depocu', true, -1); w.x = BT.DEPOT.door.x; w.y = BT.DEPOT.door.y + 1;
      BT.player.x = 31; BT.player.y = 18.5; out.name = [BT.lok.X.ROLES.lk_komi.n.tr, BT.lok.X.ROLES.lk_komi.n.en];
      return out;
    });
    await step(p, 0.05, 20 * 40);
    const d2 = await p.evaluate(() => ({ dolap: BT.lok.q().dolap.hamsi | 0, cold: BT.DEPOT.cold['fileto|hamsi'] | 0, task: BT.workers.filter(w => w.role === 'depocu').map(w => w.task || '-').join() }));
    ok(d.name.join() === 'Tedarikçi,Supplier', 'Komi → Tedarikçi (TR/EN): ' + d.name);
    ok(d2.dolap === 0 && d2.cold >= 10 && !/lok/.test(d2.task), '(f) Depo Hamalı lokanta dolabına taşımaz: ' + JSON.stringify(d2));
    /* tezgâh önceliği: tezgâhı boş bir tezgâh varken önce tezgâha (refill) gider */
    const pri = await p.evaluate(() => {
      const L = BT.lok; L.q().dolap.hamsi = 0; BT.counters.forEach(c => { c.open = true; }); const c = BT.counters.find(c => c.open && c.fish === 'hamsi');
      c.buffer.length = 0; BT.DEPOT.cold['fileto|hamsi'] = 10;
      const w = BT.workers.find(w => w.role === 'depocu'); w.task = null; w.carry.length = 0; w.x = BT.DEPOT.door.x; w.y = BT.DEPOT.door.y + 1;
      for (let i = 0; i < 4; i++) BT.emek.step(0.05, 1);
      return { task: w.task, tc: !!w.tc };
    });
    ok(pri.task === 'refill', 'öncelik: tezgâh dolabın önünde (refill): ' + JSON.stringify(pri));
    /* (a) + (b): Soğuk Oda ve hasır önce; stok bitince eksik kadarı Hal'den (kasadan) */
    const s0 = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), o = {};
      BT.workers.filter(w => w.role === 'depocu').forEach(w => BT.workers.splice(BT.workers.indexOf(w), 1));
      BT.counters.forEach(c => { c.open = false; });
      q.menu = ['hamsitava', null, null, null, null]; q.dolap = {};
      BT.DEPOT.cold = {}; BT.DEPOT.cold['fileto|hamsi'] = 4;
      const T = BT.tables[0]; T.mat.items.length = 0; for (let i = 0; i < 5; i++) T.mat.items.push({ k: 'fileto', f: 'hamsi' });
      const w = L.hire('lk_komi'); w.x = L.LOK.dolap.sx; w.y = L.LOK.dolap.sy;
      o.share = L.share(); o.cash0 = L.R.supSpent || 0; o.price3 = Math.round(BT.FISH.hamsi.val * 1.3 * 3);
      return o;
    });
    await step(p, 0.05, 20 * 90);
    const s1 = await p.evaluate(c0 => ({ dolap: BT.lok.q().dolap.hamsi | 0, cold: BT.DEPOT.cold['fileto|hamsi'] | 0, mat: BT.tables[0].mat.items.filter(i => i.f === 'hamsi').length, spent: Math.round((BT.lok.R.supSpent || 0) - c0), carry: BT.lok.crew('lk_komi')[0].carry.length }), s0.cash0);
    ok(s1.cold === 0 && s1.mat === 0, '(a)(b) Tedarikçi Soğuk Oda ve hasırdaki hamsiyi dolaba taşır: ' + JSON.stringify(s1));
    ok(s1.dolap === s0.share && s1.spent === s0.price3, '(d) stok bitince yalnız eksik kadarı (3) Hal\'den alır, kasadan öder: ' + JSON.stringify([s0, s1]));
    /* (c) mutfağın hazır güveci: önce raf, tezgâh açıkken en az SUP_KEEP porsiyon bırakır; kalanı Hal'den */
    const g0 = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), c = BT.counters.find(c => c.key === 'b3');
      q.menu = ['reisguveci', null, null, null, null]; q.dolap = {};
      c.open = true; c.buffer.length = 0; for (let i = 0; i < 5; i++) c.buffer.push({ k: 'fileto', f: 'guvec' });
      BT.kitchen.mat.items.length = 0; for (let i = 0; i < 3; i++) BT.kitchen.mat.items.push({ k: 'fileto', f: 'guvec' });
      BT.kitchen.inn.length = 0; BT.kitchen.cur = false;
      return { cash0: L.R.supSpent || 0, share: L.share(), keep: L.SUP_KEEP };
    });
    await step(p, 0.05, 20 * 120);
    const g1 = await p.evaluate(c0 => { const c = BT.counters.find(c => c.key === 'b3'); return { dolap: BT.lok.q().dolap.guvec | 0, mat: BT.kitchen.mat.items.filter(i => i.f === 'guvec').length, ctr: c.buffer.filter(i => i.f === 'guvec').length, spent: Math.round((BT.lok.R.supSpent || 0) - c0) }; }, g0.cash0);
    ok(g1.mat === 0 && g1.mat + g1.ctr === g0.keep && g1.dolap === g0.share, '(c) mutfağın hazır güvecini alır, tezgâhta ' + g0.keep + ' bırakır: ' + JSON.stringify([g0, g1]));
    ok(Math.abs(g1.spent - 74 * 1.3 * (g0.share - 4)) <= 2, 'güveç stoğu yetmeyince eksik kadarı Hal\'den: ' + JSON.stringify(g1));
    /* (d) kiler: menüdeki tarifin malzemesi azalınca Hal'den paketle (5'li) alır, dolabın yanında kilere boşaltır */
    const k0 = await p.evaluate(() => {
      const L = BT.lok, q = L.q(); q.menu = ['hamsitava', null, null, null, null]; q.dolap = { hamsi: 12 };
      BT.counters.forEach(c => { c.open = false; });
      BT.tarif.q().kiler.misirunu = 2; return { cash0: L.R.supSpent || 0, need: JSON.stringify(L.kilNeed()) };
    });
    await step(p, 0.05, 20 * 90);
    const k1 = await p.evaluate(c0 => ({ kil: BT.tarif.q().kiler.misirunu | 0, spent: Math.round((BT.lok.R.supSpent || 0) - c0), sack: JSON.stringify(BT.lok.crew('lk_komi')[0].sack || {}) }), k0.cash0);
    ok(k1.kil >= 2 + 5 && k1.spent === (k1.kil - 2) * 3 && /misirunu/.test(k0.need), '(d) kileri Hal\'den doldurur (kasadan malzeme fiyatı): ' + JSON.stringify([k0, k1]));
    /* (e) kasada para yoksa almaz */
    const e0 = await p.evaluate(() => { const L = BT.lok, q = L.q(); q.dolap = {}; BT.S.cash = 1; return { list: L.halList(L.crew('lk_komi')[0]).length, sp0: L.R.supSpent || 0 }; });
    await step(p, 0.05, 20 * 30);
    const e1 = await p.evaluate(() => ({ dolap: BT.lok.q().dolap.hamsi | 0, sp: BT.lok.R.supSpent || 0, carry: BT.lok.crew('lk_komi')[0].carry.length }));
    ok(e0.list === 0 && e1.dolap === 0 && e1.sp === e0.sp0 && e1.carry === 0, '(e) kasada para yoksa Hal\'den almaz: ' + JSON.stringify([e0, e1]));
    await p.evaluate(() => { BT.S.cash = 1e6; BT.lok.crew('lk_komi').forEach(w => BT.lok.fire(w)); BT.counters.forEach(c => { c.open = true; }); });
    /* oyuncu: Soğuk Oda kapısında çeker, dolapta bırakır */
    const pl = await p.evaluate(() => {
      const L = BT.lok; L.q().dolap.hamsi = 0; BT.DEPOT.cold['fileto|hamsi'] = 6; BT.player.carry.length = 0;
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
    ok(sv.buy && sv.tavaNow === 0 && sv.buyIns.lok_s0_tava && sv.buyIns.lok_s0_tava.lv === 1 && sv.buyIns.lok_s0_tava.left === 1, 'inşaat: istasyon alınır, 1. seviye 1 gün sürer: ' + JSON.stringify(sv));
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
      L.buy('lok_tava'); out.t2 = JSON.parse(JSON.stringify(BT.S.insaat)).lok_s0;                  // Sv2 → 2 gün (eski kimlik: o türün ilk yerini yükseltir)
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
    ok(sav.lk.lv === 2 && sav.lk.tb === 2 && sav.lk.sl[0] && sav.lk.sl[0].k === 'tava' && sav.lk.sl[0].lv === 2 && !sav.lk.sl[1] && sav.lk.sp[0] > 0 && sav.lk.dolap.hamsi === 7 && sav.lk.crew.length === 2 && sav.lk.pay[1] === 42 && sav.lk.dirty[2] === 2, 'S.lok kaydı: ' + JSON.stringify(sav.lk));
    ok(!sav.workers.some(r => r.startsWith('lk_')), 'lokanta kadrosu ana işçi kaydında yok (çift yüklenmez)');
    ok(sav.areas === 5, 'areas kaydı 5 bölge');
    const ld = await p.evaluate(() => {
      const L = BT.lok, d = JSON.parse(JSON.stringify(BT.buildSave())); BT.lok.X.resetWorld(); BT.loadFrom(d);
      const q = L.q();
      return { lv: q.lv, tb: q.tb, st: L.stLv('tava'), dolap: q.dolap.hamsi, ton: q.dolap.ton, crew: L.crew().map(w => w.role + ':' + w.lv), pay: L.trt(1).pay.reduce((a, m) => a + m.v, 0), dirty: L.trt(2).dirty, open: L.open(), menu: L.menu().join() };
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
      return { r, lv: q.lv, tb: q.tb, tava: BT.lok.stLv('tava'), izgara: BT.lok.stLv('izgara'), sl: q.sl.map(x => x && x.k + x.lv).join(), dolap: BT.lok.dolapN(), cap: BT.lok.cap(), crew: BT.lok.crew().map(w => w.role + ':' + w.lv) };
    });
    ok(bad.r && bad.lv >= 1 && bad.lv <= 5 && bad.tb <= 5 && bad.tava === 3 && bad.izgara === 0 && bad.sl === 'tava3,,,' && bad.dolap <= bad.cap && bad.crew.join() === 'lk_sef:3', 'bozuk S.lok güvenle düzeltilir: ' + JSON.stringify(bad));
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
    await p.evaluate(() => { BT.player.x = BT.lok.LOK.board.sx; BT.player.y = BT.lok.LOK.board.sy; });
    await step(p, 0.05, 5);
    const bt = await p.evaluate(() => { const b = document.getElementById('actBtn'); return { hidden: b.classList.contains('hidden'), a: b.dataset.a, near: BT.lok.nearBoard() }; });
    ok(bt.near, 'menü tahtasının yanında lokanta düğmesi');
    const pn = await p.evaluate(() => {
      const lokAll = () => { const T = ['menu', 'rec', 'try', 'kiler', 'st', 'crew', 'up', 'ev']; let txt = '', rows = 0; T.forEach(t => { BT.lok.openPanel(t); txt += ' ' + document.getElementById('lokRows').innerText.replace(/\s+/g, ' '); rows += document.querySelectorAll('#lokRows .trow').length; }); BT.lok.openPanel('menu'); return { txt, rows, tabs: [...document.querySelectorAll('#lokTabs .tab')].map(b => b.dataset.lt).join() }; };
      BT.lok.openPanel(); const o = { open: BT.lok.panelOpen(), paused: BT.paused ? BT.paused() : null, rows: lokAll().rows, tabs: lokAll().tabs, title: document.getElementById('lokTitle').textContent };
      const before = BT.S.cash; BT.lok.panelAct('buy', 'lok_izgara'); o.confirm1 = BT.lok.stLv('izgara'); BT.lok.panelAct('buy', 'lok_izgara'); o.bought = BT.lok.stLv('izgara'); o.paid = before - BT.S.cash > 0;
      BT.lok.panelAct('menu', 'orkinosizgara'); o.menuFull = BT.lok.menu().join();
      BT.lok.panelAct('hire', 'lk_garson'); BT.lok.panelAct('hire', 'lk_garson'); o.hired = BT.lok.crew('lk_garson').length;
      o.html = document.getElementById('lokRows').innerText.slice(0, 200);
      return o;
    });
    ok(pn.open && pn.rows >= 12 && pn.tabs === 'menu,rec,try,kiler,st,crew,up,sus,ev' && /Sahil Lokantası/.test(pn.title), 'LOKANTA paneli açılır: ' + JSON.stringify(pn).slice(0, 200));
    ok(pn.confirm1 === 0 && pn.bought === 1 && pn.paid, 'panel: ikinci dokunuşla (ONAYLA?) satın alma: ' + JSON.stringify(pn));
    ok(pn.hired === 1, 'panelden kadro kiralanır');
    await p.evaluate(() => BT.lok.closePanel());
    const en = await p.evaluate(() => {
      BT.setLang('en'); BT.lok.openPanel();
      const o = { title: document.getElementById('lokTitle').textContent, rows: (() => {  const T = ['menu', 'rec', 'try', 'kiler', 'st', 'crew', 'up', 'ev']; let txt = '', rows = 0; T.forEach(t => { BT.lok.openPanel(t); txt += ' ' + document.getElementById('lokRows').innerText.replace(/\s+/g, ' '); rows += document.querySelectorAll('#lokRows .trow').length; }); BT.lok.openPanel('menu'); return txt + ' ' + document.getElementById('lokTabs').innerText.replace(/\s+/g, ' '); })(), sub: document.getElementById('lokSub').textContent };
      BT.lok.closePanel(); o.groups = Object.values(BT.lok.G).map(g => g.t.en).join(); BT.setLang('tr'); return o;
    });
    ok(/Seaside Restaurant/.test(en.title) && /UPGRADE/.test(en.rows) && /BUILD/.test(en.rows) && /MENU/.test(en.rows) && /CREW/.test(en.rows) && !/\blk[A-Z]\w+/.test(en.rows + en.sub) && /Tourists/.test(en.groups), 'EN panel metinleri: ' + en.title + ' | ' + en.rows.slice(0, 90));
    /* dünyada menü tahtasına/tabelaya dokununca panel açılır */
    await p.evaluate(() => { BT.player.x = BT.lok.LOK.board.x + 1.6; BT.player.y = BT.lok.LOK.board.y - 1.2; });
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
    const off = await p.evaluate(() => { const L = BT.lok; L.spawn('aile'); return { emek: BT.emek.on(), pr: L.presence('s0') }; });
    await step(p, 0.05, 320);
    const off2 = await p.evaluate(() => ({ jobs: BT.lok.S.s0.jobs.length, cooked: BT.lok.R.board[0] ? BT.lok.R.board[0].cooked + BT.lok.R.board[0].inprog : -1 }));
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
    await ctx.addInitScript(() => { window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = 1; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = 0; window.HK_INSAAT_OFF = 1; window.HK_HELP_OFF = 1; try { const d = JSON.parse(localStorage.getItem('balikci_pref') || '{}'); d.vis = 1; localStorage.setItem('balikci_pref', JSON.stringify(d)); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE10: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C10: ' + m.text()); });
    await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava'], lv: 5 });
    await p.evaluate(() => {
      const L0 = BT.lok; for (let i = 0; i < 4; i++) L0.buy('lok_tb'); ['lok_d_cardak', 'lok_d_saz', 'lok_mez', 'lok_dol', 'lok_masa', 'lok_masa'].forEach(id => L0.buy(id)); L0.q().star = 4; L0.q().res = { st: 'on', n: 12, rec: 'hamsitava', kind: 'dugun', w: 0, due: BT.day.n, got: 2 };
      window.__H = {}; window.HKA = window.HKA || {};
      ['drawLokTable', 'drawLokStation', 'drawLokCrew', 'drawLokFix', 'drawLokHouse', 'drawLokTerrace'].forEach(n => { const old = window.HKA[n]; window.HKA[n] = function (o) { (window.__H[n] = window.__H[n] || []).push(o); return false; }; });
      const L = BT.lok; ['lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r)); L.q().dolap.hamsi = 12; L.R.arr = 0.1;
    });
    await step(p, 0.05, 20 * 40);
    await p.evaluate(() => { BT.player.x = 31; BT.player.y = 18.5; });
    await sleep(1200);
    /* v2.20: eski iskele kancaları (HKA.lokV2 yok) çağrılmaz; yeni kancalar (ev + teras) çağrılır */
    const g0 = await p.evaluate(() => { const H = window.__H; return { old: ['drawLokTable', 'drawLokStation', 'drawLokCrew', 'drawLokFix'].map(n => (H[n] || []).length).join(), house: (H.drawLokHouse || []).length, ter: (H.drawLokTerrace || []).length }; });
    ok(g0.old === '0,0,0,0' && g0.house === 0 && g0.ter === 0, 'lokV2/lokV3 yokken eski kancalar devre dışı, ev/teras klasik (v2.22): ' + JSON.stringify(g0));
    await p.evaluate(() => { window.HKA.lokV2 = true; window.HKA.lokV3 = true; window.__H = {}; });   /* v2.22: ev/teras ince kancası yeni yerleşimle (lokV3) */
    await sleep(1200);
    const h = await p.evaluate(() => {
      const H = window.__H, out = { fine: window.HKG ? HKG.K : 0 };
      for (const n of Object.keys(H)) out[n] = H[n].length;
      const f = (n, fn) => H[n] && H[n].length ? fn(H[n][H[n].length - 1]) : false;
      out.deck = f('drawLokTerrace', o => o.v3 === true && Math.abs(o.area.x0 - 15) < 1e-6 && Math.abs(o.area.y1 - 23.6) < 1e-6 && typeof o.tb === 'number' && o.up && o.gate && Array.isArray(o.gap) && o.pergola && typeof o.t === 'number' && 'night' in o);
      out.parts = [...new Set((H.drawLokTerrace || []).map(o => o.part))].sort().join();
      out.house = f('drawLokHouse', o => o.v3 === true && Math.abs(o.x0 - 15.6) < 1e-6 && Math.abs(o.y1 - 16.9) < 1e-6 && o.star === 4 && typeof o.lv === 'number' && typeof o.smoke === 'number' && 'night' in o && Math.abs(o.area.y0 - 13.2) < 1e-6);
      out.hparts = [...new Set((H.drawLokHouse || []).map(o => o.part))].sort().join();
      out.table = f('drawLokTable', o => typeof o.i === 'number' && (o.seats === 2 || o.seats === 4) && typeof o.st === 'string' && 'plates' in o && 'dirty' in o && 'pay' in o && 'mood' in o);
      out.station = f('drawLokStation', o => ['tava', 'izgara', 'tencere', 'firin'].includes(o.id) && 'busy' in o && 'prog' in o && 'wait' in o && 'lv' in o && 'cook' in o);
      out.crew = f('drawLokCrew', o => ['asci', 'garson', 'bulasik', 'sef'].includes(o.role) && o.a && o.outfit && 'lv' in o && 'plates' in o);
      out.fix = H.drawLokFix ? [...new Set(H.drawLokFix.map(o => o.k))].sort().join() : '';
      const fx = k => (H.drawLokFix || []).filter(o => o.k === k);
      out.ter = [...new Set(fx('teras').map(o => o.part))].sort().join(); out.rail = true; out.v2 = Object.keys(H).every(n => H[n].every(o => /House|Terrace/.test(n) ? o.v3 === true : o.v2 === true));
      out.umb = fx('teras').filter(o => o.part === 'umb').length; out.meze = fx('meze').every(o => Math.abs(o.x - 30.6) < 1e-6 && typeof o.t === 'number') && fx('meze').length > 0;
      out.saz = fx('saz').every(o => Math.abs(o.x - 33.6) < 1e-6 && 'night' in o && typeof o.t === 'number') && fx('saz').length > 0;
      out.big = fx('dolap').every(o => o.big === true); out.sign = fx('sign').every(o => o.star === 4 && o.res && o.res.kind === 'dugun' && o.res.got >= 2 && o.res.n === 12);
      out.tmeze = (H.drawLokTable || []).every(o => o.meze === true); out.deckUp = H.drawLokTerrace.every(o => o.up && o.up.ter && o.up.mez && o.up.saz && o.up.dol);
      return out;
    });
    ok(h.fine > 1, 'ince mod açık (K>1): ' + h.fine);
    ok(h.drawLokHouse > 0 && h.drawLokTerrace > 0 && h.drawLokTable > 0 && h.drawLokStation > 0 && h.drawLokCrew > 0 && h.drawLokFix > 0, 'kancalar (lokV2 açıkken) çağrılır: ' + JSON.stringify(h));
    ok(h.parts === 'floor,south,top,west' && h.hparts === 'back,front' && h.house && h.v2, 'ev/teras kanca parçaları ve o.v2: ' + JSON.stringify([h.parts, h.hparts, h.house, h.v2]));
    ok(h.deck && h.table && h.station && h.crew, 'kanca parametreleri: ' + JSON.stringify(h));
    ok(['board', 'dolap', 'kasa', 'pass', 'sign', 'sink', 'teras', 'meze', 'saz'].every(k => h.fix.split(',').includes(k)), 'drawLokFix türleri (teras/meze/saz dahil): ' + h.fix);
    ok(h.ter === 'umb' && h.rail && h.umb >= 1 && h.meze && h.saz && h.big && h.sign && h.tmeze && h.deckUp, 'Aşama 2 kanca parametreleri: ' + JSON.stringify([h.ter, h.rail, h.umb, h.meze, h.saz, h.big, h.sign, h.tmeze, h.deckUp]));
    await ctx.close();
  }

  /* ===== 12) AŞAMA 2 — olaylar: rezervasyon, Muhtarın sofrası, Gurme Eleştirmen ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav'], lv: 2 });
    /* 12a) rezervasyon: kart (Sv≥2, gün başı) → reddet / kabul → ertesi gün teslim sayacı */
    const a = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {};
      BT.day.n = 10; q.ed = 0; q.rd = 0; q.mu = 9;
      window.HK_LOK_EVOFF = 0; const r0 = Math.random; Math.random = () => 0.01; L.dayStart(); Math.random = r0;
      out.card = L.evOpen(); out.paused = BT.paused(); out.res = JSON.parse(JSON.stringify(q.res)); out.ed = q.ed; out.rd = q.rd;
      out.txt = document.getElementById('lokEvP').textContent; out.title = document.getElementById('lokEvT').textContent;
      out.btns = [document.getElementById('lokEvYes').textContent, document.getElementById('lokEvNo').textContent];
      out.inMenu = L.menu().includes(q.res.rec); out.muT = L.R.muT;
      out.names = L.WED.every(w => w.tr && w.en && /'/.test(w.tr) && /'s$/.test(w.en));
      const rep0 = S.rep; L.resAnswer(false);
      out.decl = { res: JSON.stringify(q.res), card: L.evOpen(), paused: BT.paused(), rep: S.rep === rep0 };
      /* aynı gün ikinci kart yok (q.ed aynı), 3 gün dolmadan yok */
      q.res = {}; Math.random = () => 0.01; L.dayStart(); Math.random = r0; out.again = L.evOpen();
      BT.day.n = 12; q.ed = 0; Math.random = () => 0.01; L.dayStart(); Math.random = r0; out.cool = L.evOpen();
      BT.day.n = 13; q.ed = 0; Math.random = () => 0.9; L.dayStart(); Math.random = r0; out.unlucky = L.evOpen();     /* şans tutmadı */
      q.lv = 1; BT.day.n = 20; q.ed = 0; q.rd = 0; Math.random = () => 0.01; L.dayStart(); Math.random = r0; out.lv1 = L.evOpen(); q.lv = 2;   /* Sv1: olay yok */
      window.HK_LOK_EVOFF = 1; BT.day.n = 30; q.ed = 0; q.rd = 0; Math.random = () => 0.01; L.dayStart(); Math.random = r0; out.off = L.evOpen();
      return out;
    });
    ok(a.card && a.paused && a.res.st === 'offer' && a.res.n >= 12 && a.res.n <= 16 && a.res.due === 11 && a.inMenu && a.ed === 10 && a.rd === 10, 'Sv2 gün başı rezervasyon kartı (oyun durur): ' + JSON.stringify(a.res));
    ok(/Yarın akşam/.test(a.txt) && /(düğünü|nişanı)/.test(a.txt) && new RegExp(a.res.n + ' tabak').test(a.txt) && /KABUL/.test(a.btns[0]) && /REDDET/.test(a.btns[1]) && /rezervasyon/i.test(a.title), 'kart metni TR: ' + a.txt);
    ok(a.names, 'isim listesi TR/EN tamlayan biçiminde');
    ok(a.decl.res === '{}' && !a.decl.card && !a.decl.paused && a.decl.rep, 'reddet: kart kapanır, ceza yok: ' + JSON.stringify(a.decl));
    ok(!a.again && !a.cool && !a.unlucky && !a.lv1 && !a.off, 'aynı gün/3 gün içinde/şanssız/Sv1/HK_LOK_EVOFF: kart yok: ' + JSON.stringify([a.again, a.cool, a.unlucky, a.lv1, a.off]));
    const b = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {};
      window.HK_LOK_EVOFF = 1; BT.day.n = 40; q.ed = 40; q.res = {}; L.R.muT = 0;
      out.offer = L.resOffer(); const r = JSON.parse(JSON.stringify(q.res));
      const rep0 = S.rep; out.acc = L.resAnswer(true); out.on = JSON.parse(JSON.stringify(q.res)); out.rep = S.rep === rep0; out.closed = !L.evOpen();
      out.today0 = L.resToday(); out.dayEndEarly = (L.dayEnd(), q.res.st);                                          /* kabul günü bitince henüz başarısız sayılmaz */
      BT.day.n = 41; q.ed = 41; out.today = L.resToday();
      const f1 = L.flow(), keep = q.res; q.res = {}; const f0 = L.flow(); q.res = keep; out.flowK = f1 / f0;
      /* tabak sayaç: yanlış yemek / başka gün sayılmaz; doğru yemek sayılır */
      L.resDeliver({ d: 'levrekbugulama' }); out.wrong = q.res.got;
      L.resDeliver({ d: q.res.rec }); out.got1 = q.res.got;
      BT.day.n = 42; L.resDeliver({ d: q.res.rec }); out.otherDay = q.res.got; BT.day.n = 41;
      return Object.assign(out, { n: r.n, rec: r.rec });
    });
    ok(b.offer && b.acc && b.on.st === 'on' && b.on.due === 41 && b.rep && b.closed, 'kabul: yarın için sayaç kurulur: ' + JSON.stringify(b));
    ok(b.dayEndEarly === 'on' && !b.today0 && b.today, 'teslim günü yarın: kabul günü sonunda başarısız sayılmaz: ' + JSON.stringify([b.dayEndEarly, b.today0, b.today]));
    ok(Math.abs(b.flowK - 1.3) < 0.02, 'rezervasyon günü misafir akışı ×1,3: ' + b.flowK);
    ok(b.wrong === 0 && b.got1 === 1 && b.otherDay === 1, 'yalnız bugün ve doğru yemek teslim sayılır: ' + JSON.stringify([b.wrong, b.got1, b.otherDay]));
    /* gerçek teslim: masaya iDropPlate */
    const c = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), out = {}; q.res.got = 0; BT.player.carry.length = 0;
      let hit = 0; const ids = [];
      for (let k = 0; k < 14; k++) {                                                    /* eğilim: misafirler o yemeği ister */
        L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
        const g = L.spawn('aile'); for (let i = 0; i < 300 && !g.ord; i++) BT.emek.step(0.05, 1);
        if (g.ord) { ids.push(g.ord.rec); if (g.ord.rec === q.res.rec) hit++; }
      }
      out.hit = hit; out.n = ids.length;
      L.R.grp.length = 0; L.R.board.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; });
      const g = L.spawn('aile'); for (let i = 0; i < 300; i++) BT.emek.step(0.05, 1);
      g.ord.rec = q.res.rec; g.ord.n = g.n; q.res.got = 0;
      BT.player.carry.length = 0; BT.player.carry.push({ k: 'plate', f: 'hamsi', d: q.res.rec, tb: g.tb, ord: g.ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      for (let i = 0; i < 12; i++) BT.emek.step(0.05, 1);
      out.real = q.res.got; return out;
    });
    ok(c.n >= 12 && c.hit >= 8, 'rezervasyon günü siparişler o yemeğe kayar: ' + JSON.stringify(c));
    ok(c.real === 1, 'masaya teslim edilen tabak sayacı artırır: ' + c.real);
    const d = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {};
      L.R.grp.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; });
      const r = q.res, rew = L.resReward(r), c0 = S.cash, rep0 = S.rep; q.res.got = r.n - 1;
      L.resDeliver({ d: r.rec });
      out.win = { cash: S.cash - c0 === rew, rew, rep: S.rep - rep0 === 10, res: JSON.stringify(q.res), toast: document.getElementById('toast').textContent, perPlate: rew / (r.n * L.plateVal(r.rec)) };
      /* başarısızlık: gün sonunda yetmedi → itibar − */
      BT.day.n = 50; q.ed = 50; q.res = {}; L.resOffer(); L.resAnswer(true); BT.day.n = 51; q.ed = 51; q.res.got = 3;
      const rep1 = S.rep; L.dayEnd();
      out.fail = { rep: S.rep - rep1, res: JSON.stringify(q.res), toast: document.getElementById('toast').textContent };
      /* kaçırılan gün (yükleme): gün başında başarısız sayılır */
      BT.day.n = 60; q.ed = 60; q.res = { st: 'on', n: 12, rec: 'hamsitava', kind: 'dugun', w: 0, due: 59, got: 2 }; q.ed = 0; const rep2 = S.rep; L.dayStart(); out.stale = { rep: S.rep - rep2, res: JSON.stringify(q.res) };
      /* kayıt */
      BT.day.n = 70; q.ed = 70; q.res = { st: 'on', n: 14, rec: 'hamsipilav', kind: 'nisan', w: 2, due: 71, got: 5 };
      const sv = JSON.parse(JSON.stringify(BT.buildSave())); out.saved = sv.lok.res;
      const keep = JSON.parse(JSON.stringify(sv)); BT.lok.X.resetWorld(); BT.loadFrom(keep); out.loaded = JSON.parse(JSON.stringify(L.q().res));
      const bad = JSON.parse(JSON.stringify(sv)); bad.lok.res = { st: 'on', rec: 'nope', n: 5, due: 3 }; BT.lok.X.resetWorld(); BT.loadFrom(bad); out.bad = JSON.stringify(L.q().res);
      const bad2 = JSON.parse(JSON.stringify(sv)); bad2.lok.res = 'x'; BT.lok.X.resetWorld(); BT.loadFrom(bad2); out.bad2 = JSON.stringify(L.q().res);
      const bad3 = JSON.parse(JSON.stringify(sv)); bad3.lok.res = { st: 'on', rec: 'hamsitava', n: 'çok', due: -5, got: 9999, kind: 'x', w: 99 }; BT.lok.X.resetWorld(); BT.loadFrom(bad3); out.bad3 = JSON.parse(JSON.stringify(L.q().res));
      return out;
    });
    ok(d.win.cash && d.win.rep && d.win.res === '{}' && /harika/.test(d.win.toast) && d.win.perPlate > 0.85 && d.win.perPlate < 0.95, 'tamamlanınca ödül + itibar +10: ' + JSON.stringify(d.win));
    ok(d.fail.rep === -8 && d.fail.res === '{}' && /yetişti/.test(d.fail.toast), 'yetişmezse itibar −8: ' + JSON.stringify(d.fail));
    ok(d.stale.rep === -8 && d.stale.res === '{}', 'kaçırılan gün başarısız sayılır: ' + JSON.stringify(d.stale));
    ok(d.saved.st === 'on' && d.saved.n === 14 && d.saved.got === 5 && d.saved.due === 71 && d.loaded.rec === 'hamsipilav' && d.loaded.got === 5 && d.loaded.kind === 'nisan' && d.loaded.due === 71, 'rezervasyon kaydı/yüklemesi: ' + JSON.stringify([d.saved, d.loaded]));
    ok(d.bad === '{}' && d.bad2 === '{}' && d.bad3.st === 'on' && d.bad3.n >= 1 && d.bad3.got <= 99 && d.bad3.kind === 'dugun' && d.bad3.w <= 7 && d.bad3.due >= 1, 'bozuk rezervasyon güvenle düzeltilir: ' + JSON.stringify([d.bad, d.bad2, d.bad3]));
    /* EN kart + tabela sayacı */
    const e = await p.evaluate(() => {
      const L = BT.lok, q = L.q(); BT.setLang('en'); BT.day.n = 80; q.ed = 80; q.res = {}; q.rd = 0; L.resOffer();
      const o = { txt: document.getElementById('lokEvP').textContent, title: document.getElementById('lokEvT').textContent, b: [document.getElementById('lokEvYes').textContent, document.getElementById('lokEvNo').textContent] };
      L.resAnswer(true); o.on = document.getElementById('toast').textContent;
      BT.day.n = 81; q.ed = 81; q.res.got = 3; const got = []; const stub = f => got.push(f); L.push(stub); o.pushed = got.length;
      BT.setLang('tr'); q.res = {}; return o;
    });
    ok(/Tomorrow evening/.test(e.txt) && /(wedding|engagement party)/.test(e.txt) && /plates of/.test(e.txt) && e.b[0] === 'ACCEPT' && e.b[1] === 'DECLINE' && /booking/i.test(e.title) && /Booking accepted/.test(e.on), 'rezervasyon kartı EN: ' + JSON.stringify(e));
    await p.close();
  }

  {
    /* 12b) Muhtarın sofrası: haftada bir, 6 kişi, iki komşu masa birleşir; hızlı servis → itibar */
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav'], lv: 2 });
    const m = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {};
      L.buy('lok_tb'); L.buy('lok_tb');                                                    /* 6 masa */
      out.keys = Object.keys(L.G).join(); out.g6 = L.G.muhtar && L.G.muhtar.n; out.tb = L.tbl();
      /* haftada bir */
      window.HK_LOK_EVOFF = 0; const r0 = Math.random; Math.random = () => 0.99; BT.day.n = 20;
      q.mu = 17; q.ed = 0; L.dayStart(); out.t3 = L.R.muT;
      q.mu = 13; q.ed = 0; L.dayStart(); out.t7 = L.R.muT; Math.random = r0; window.HK_LOK_EVOFF = 1;
      /* iki komşu masa yok */
      L.trt(1).st = 'seat'; L.trt(2).st = 'seat'; L.trt(4).st = 'seat'; out.noPair = L.freePair() === null; L.trt(1).st = 'free'; L.trt(2).st = 'free'; L.trt(4).st = 'free';
      const pr = L.freePair(); out.pair = pr ? [pr.a.i, pr.b.i] : null;
      L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      L.R.arr = 1e9; L.R.grp.length = 0;
      q.mu = 0; const g = L.muhtarCome(); out.type = g && g.type; out.n = g && g.n; out.mu = q.mu; out.dup = L.muhtarCome() === null;
      out.name = g && L.MUH[g.nm].tr; out.toast = document.getElementById('toast').textContent;
      for (let i = 0; i < 500 && g.st !== 'wait'; i++) BT.emek.step(0.05, 1);
      out.st = g.st; out.tb = g.tb; out.tb2 = g.tb2; out.b = L.trt(g.tb2).st; out.a = L.trt(g.tb).st; out.ordN = g.ord && g.ord.n;
      const seats = []; for (let k = 0; k < 6; k++) { const s = L.gSeat(g, k); seats.push(s.x.toFixed(2) + ',' + s.y.toFixed(2)); }
      out.seatsUniq = new Set(seats).size; out.adj = Math.abs(g.tb - g.tb2) === 1 && Math.floor(g.tb / 4) === Math.floor(g.tb2 / 4);
      out.sitting = g.mem.every(mm => mm.sit);
      /* hızlı servis */
      const t = L.trt(g.tb), ord = g.ord, rep0 = S.rep; t.plates = 5; ord.deliv = 5;
      BT.player.carry.length = 0; BT.player.carry.push({ k: 'plate', f: 'hamsi', d: ord.rec, tb: g.tb, ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      out.eat = g.st; out.fast = g.fast; out.repFast = S.rep - rep0; out.toastFast = document.getElementById('toast').textContent;
      BT.player.x = 0.5; BT.player.y = 2; for (let i = 0; i < 20 * 16; i++) BT.emek.step(0.05, 1);
      out.paid = !!g.paid; out.bFree = L.trt(g.tb2).st === 'free'; out.dirty = L.trt(g.tb).dirty; out.pay = L.trt(g.tb).pay.reduce((s, x) => s + x.v, 0) > 0;
      return out;
    });
    ok(m.keys === 'aile,turist,kahve,is' && m.g6 === 6, 'Muhtar grubu rastgele akışta değil, 6 kişi: ' + JSON.stringify([m.keys, m.g6, m.tb]));
    ok(m.t3 === 0 && m.t7 > 0, 'haftada bir: 3 gün sonra yok, 7 gün sonra zamanlanır: ' + JSON.stringify([m.t3, m.t7]));
    ok(m.noPair && m.pair && m.pair[1] === m.pair[0] + 1, 'iki komşu boş masa aranır: ' + JSON.stringify([m.noPair, m.pair]));
    ok(m.type === 'muhtar' && m.n === 6 && m.mu > 0 && m.dup && /Muhtar/.test(m.name) && /geliyor/.test(m.toast), 'Muhtar gelir (tekrar yok), isim listeden: ' + JSON.stringify([m.type, m.name, m.toast]));
    ok(m.st === 'wait' && m.tb2 !== null && m.b === 'held' && m.a === 'seat' && m.ordN === 6 && m.seatsUniq === 6 && m.adj && m.sitting, '6 kişi iki komşu masaya oturur, 6 farklı koltuk: ' + JSON.stringify([m.st, m.tb, m.tb2, m.b, m.seatsUniq, m.adj, m.sitting]));
    ok(m.eat === 'eat' && m.fast === true && m.repFast === 6 && /memnun/.test(m.toastFast), 'hızlı servis: popülerlik +6: ' + JSON.stringify([m.eat, m.fast, m.repFast, m.toastFast]));
    ok(m.paid && m.bFree && m.dirty === 6 && m.pay, 'yemek bitince ikinci masa boşalır, ilk masada 6 kirli tabak + ödeme: ' + JSON.stringify([m.paid, m.bFree, m.dirty, m.pay]));
    const m2 = await p.evaluate(() => {
      const L = BT.lok, S = BT.S, out = {};
      L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      const g = L.muhtarCome(); for (let i = 0; i < 500 && g.st !== 'wait'; i++) BT.emek.step(0.05, 1);
      const t = L.trt(g.tb), ord = g.ord, rep0 = S.rep; g.t0 -= g.patMax;                      /* uzun beklendi */
      t.plates = 5; ord.deliv = 5; BT.player.carry.length = 0; BT.player.carry.push({ k: 'plate', f: 'hamsi', d: ord.rec, tb: g.tb, ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      out.slow = { st: g.st, fast: g.fast, rep: S.rep - rep0 };
      /* masalar doluyken kuyrukta bekler, boşalınca oturur */
      L.R.grp.length = 0; L.R.t.forEach(t2 => { t2.st = 'free'; t2.g = null; t2.dirty = 0; t2.pay = []; }); [1, 2, 4].forEach(i => { L.trt(i).st = 'dirty'; L.trt(i).dirty = 1; });
      const g2 = L.muhtarCome(); for (let i = 0; i < 300; i++) BT.emek.step(0.05, 1);
      out.queued = g2.st; L.trt(1).st = 'free'; L.trt(1).dirty = 0; BT.player.x = 0.5; BT.player.y = 2; for (let i = 0; i < 60; i++) BT.emek.step(0.05, 1);
      out.seated = [g2.st, g2.tb, g2.tb2];
      return out;
    });
    ok(m2.slow.st === 'eat' && m2.slow.fast === false && m2.slow.rep === 2, 'yavaş servis: küçük bonus (+2): ' + JSON.stringify(m2.slow));
    ok(m2.queued === 'queue' && (m2.seated[0] === 'seat' || m2.seated[0] === 'wait') && m2.seated[2] !== null, 'boş çift yokken kuyrukta bekler, çift boşalınca oturur: ' + JSON.stringify([m2.queued, m2.seated]));
    await p.close();
  }

  {
    /* 12c) Gurme Eleştirmen: bekleme + tarif çarpanı + masa temizliği → 1–5 yıldız; tabela, akış ±%10, toast, başarım */
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav', 'levrekbugulama'], lv: 3 });
    const e = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {}, R0 = Math.random;
      out.keys = Object.keys(L.G).join();
      const st = (serve, rec, dm) => L.criticStars({ serve, patMax: 70, ord: { rec }, dm });
      out.stars = [st(1, 'hamsipilav', 0), st(25, 'hamsitava', 0), st(40, 'hamsipilav', 5), st(50, 'hamsitava', 3), st(30, 'hamsitava', 1), L.criticStars({ serve: 1, patMax: 70, ord: null, dm: 0 })];
      /* masa temizliği: kirli masa sayısı */
      L.trt(0).dirty = 2; L.trt(1).dirty = 1; out.dirtyN = [L.dirtyN(), L.dirtyN(0)]; L.trt(0).dirty = 0; L.trt(1).dirty = 0;
      /* gün başı: Sv≥3 + şans → zamanlanır; Sv2'de değil */
      window.HK_LOK_EVOFF = 0; BT.day.n = 30; q.ed = 0; q.mu = 29; q.rd = 29; Math.random = () => 0.01; L.dayStart(); out.crT3 = L.R.crT;
      q.lv = 2; q.ed = 0; L.dayStart(); out.crT2 = L.R.crT; q.lv = 3; Math.random = () => 0.9; q.ed = 0; L.dayStart(); out.crTno = L.R.crT; Math.random = R0; window.HK_LOK_EVOFF = 1;
      /* gerçek ziyaret: temiz salon + hızlı servis + pahalı yemek → 5 yıldız */
      L.R.grp.length = 0; L.R.board.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      q.star = 0; q.gs = 0; L.R.arr = 1e9;
      const g = L.criticCome(); out.type = g && g.type; out.n = g && g.n; out.name = L.CRIT[g.nm].tr; out.dup = L.criticCome() === null; out.cToast = document.getElementById('toast').textContent;
      for (let i = 0; i < 400 && g.st !== 'wait'; i++) BT.emek.step(0.05, 1);
      const t = L.trt(g.tb), ord = g.ord; ord.rec = 'hamsipilav'; t.plates = g.n - 1; ord.deliv = g.n - 1;
      BT.player.carry.length = 0; BT.player.carry.push({ k: 'plate', f: 'hamsi', d: 'hamsipilav', tb: g.tb, ord });
      BT.player.x = L.TB[g.tb].sx; BT.player.y = L.TB[g.tb].sy;
      const rep0 = S.rep;
      for (let i = 0; i < 20 * 18; i++) BT.emek.step(0.05, 1);
      out.rated = g.rated; out.star = q.star; out.gs = q.gs; out.rep = S.rep - rep0; out.toast = document.getElementById('toast').textContent; out.deck = L.deck().star;
      const f5 = L.flow(); q.star = 3; const f3 = L.flow(); q.star = 1; const f1 = L.flow(); q.star = 5; out.flow = [f5 / f3, f1 / f3];
      BT.achMute(false); BT.achCheck(); out.ach = BT.ach().includes('lk_gurme'); BT.achMute(true);
      return out;
    });
    ok(e.keys === 'aile,turist,kahve,is', 'Eleştirmen rastgele akışta değil: ' + e.keys);
    ok(e.stars.join() === '5,5,3,2,3,1', 'yıldız formülü (bekleme+çarpan+temizlik): ' + e.stars.join());
    ok(e.dirtyN.join() === '2,1', 'kirli masa sayısı: ' + e.dirtyN.join());
    ok(e.crT3 > 0 && e.crT2 === 0 && e.crTno === 0, 'Eleştirmen yalnız Sv≥3 ve şansla gelir: ' + JSON.stringify([e.crT3, e.crT2, e.crTno]));
    ok(e.type === 'elestirmen' && e.n === 1 && e.dup && /Hanım|Bey/.test(e.name) && /Gurme Eleştirmen/.test(e.cToast), 'Eleştirmen gelir (tekrar yok): ' + JSON.stringify([e.type, e.name, e.cToast]));
    ok(e.rated === 5 && e.star === 5 && e.gs === 5 && /5\/5/.test(e.toast) && /★★★★★/.test(e.toast) && e.rep >= 6 && e.deck === 5, '5 yıldız: tabela, toast, itibar: ' + JSON.stringify([e.rated, e.star, e.toast, e.rep, e.deck]));
    ok(Math.abs(e.flow[0] - 1.1) < 0.01 && Math.abs(e.flow[1] - 0.9) < 0.01, 'lokFlow yıldızla ±%10: ' + JSON.stringify(e.flow));
    ok(e.ach, 'başarım "Gurmenin Gözdesi" açıldı');
    const f = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), S = BT.S, out = {};
      /* kötü ziyaret: kirli salon + yavaş servis + sabır taşar → 1 yıldız; itibar düşer */
      L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      const g = L.criticCome(); for (let i = 0; i < 400 && g.st !== 'wait'; i++) BT.emek.step(0.05, 1);
      const rep0 = S.rep; g.pat = 0.02; for (let i = 0; i < 10; i++) BT.emek.step(0.05, 1);
      out.angry = g.angry; out.rated = g.rated; out.star = q.star; out.rep = S.rep - rep0; out.toast = document.getElementById('toast').textContent; out.gs = q.gs;
      /* kayıt */
      q.star = 4; q.gs = 5; q.mu = 33; q.ed = 44;
      const sv = JSON.parse(JSON.stringify(BT.buildSave())); out.saved = [sv.lok.star, sv.lok.gs, sv.lok.mu, sv.lok.ed];
      BT.lok.X.resetWorld(); BT.loadFrom(JSON.parse(JSON.stringify(sv))); const q2 = L.q(); out.loaded = [q2.star, q2.gs, q2.mu, q2.ed];
      const bad = JSON.parse(JSON.stringify(sv)); bad.lok.star = 99; bad.lok.gs = 'x'; bad.lok.mu = -3; BT.lok.X.resetWorld(); BT.loadFrom(bad); out.bad = [L.q().star, L.q().gs, L.q().mu];
      return out;
    });
    ok(f.angry === true && f.rated === 1 && f.star === 1 && f.rep < 0 && f.gs === 5, 'sabır taşan eleştirmen 1 yıldız verir, itibar düşer: ' + JSON.stringify(f));
    ok(f.saved.join() === '4,5,33,44' && f.loaded.join() === '4,5,33,44' && f.bad[0] === 5 && f.bad[1] === 0 && f.bad[2] === 0, 'yıldız / en iyi puan / Muhtar günü kaydı: ' + JSON.stringify([f.saved, f.loaded, f.bad]));
    await p.close();
  }

  /* ===== 13) v2.22 — kademeli eşya (masa, kapı, tabela, meze, dolap) + süsler (LOKANTA › SÜSLER) ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'], lv: 2 });
    const u0 = await p.evaluate(() => {
      const L = BT.lok, S = BT.S, out = {};
      out.keys = L.UPK.join(); out.cap0 = L.cap(); out.pm0 = L.patMul(); out.eff0 = ['flow', 'pat', 'tip', 'pay'].map(k => L.eff(k));
      out.tier0 = L.UPK.map(k => L.upLv(k)).join(); out.nDc = L.DC.length;
      out.whyLv = ['lok_masa', 'lok_kapi', 'lok_tabela', 'lok_mez', 'lok_dol', 'lok_d_cicek', 'lok_d_cardak', 'lok_d_saz'].map(id => L.why(id));   /* Sv2: çardak Sv3, saz Sv5 */
      const c0 = S.cash; L.buy('lok_d_cardak'); out.refused = S.cash === c0 && !L.dcOn('cardak');
      out.costs = ['lok_masa', 'lok_kapi', 'lok_tabela', 'lok_mez', 'lok_dol', 'lok_d_nazar', 'lok_d_kosk'].map(id => L.cost(id));
      out.panel = ((() => { let txt = ''; ['menu', 'rec', 'try', 'kiler', 'st', 'crew', 'up', 'sus', 'ev'].forEach(t => { BT.lok.openPanel(t); txt += ' ' + document.getElementById('lokRows').innerText.replace(/\s+/g, ' ') + ' ' + document.getElementById('lokTabs').innerText.replace(/\s+/g, ' '); }); return txt; })()); L.closePanel();
      L.buy('lok_lv'); out.whyLv3 = [L.why('lok_d_cardak'), L.why('lok_d_saz')]; L.buy('lok_lv'); L.buy('lok_lv'); out.whyLv5 = [L.why('lok_d_cardak'), L.why('lok_d_saz')];
      return out;
    });
    ok(u0.keys === 'masa,kapi,tabela,mez,dol' && u0.tier0 === '1,1,1,0,0' && u0.cap0 === 12 && u0.pm0 === 1 && u0.eff0.join() === '0,0,0,0', 'başlangıç: sade kademeler, dolap 12, etki yok: ' + JSON.stringify(u0).slice(0, 220));
    ok(u0.nDc >= 15 && u0.whyLv.join() === ',,,,,,lv,lv' && u0.refused, 'Sv2: kademeler + Sv1 süsleri serbest, çardak (Sv3) ve saz (Sv5) kilitli: ' + u0.whyLv.join());
    ok(u0.whyLv3.join() === ',lv' && u0.whyLv5.join() === ',', 'çardak Sv3\'te, saz Sv5\'te açılır: ' + JSON.stringify([u0.whyLv3, u0.whyLv5]));
    ok(u0.costs.every(c => c > 0) && u0.costs[6] > u0.costs[5] * 10, 'bedeller (süsler küçükten büyüğe): ' + u0.costs.join());
    ok(/GELİŞTİRMELER/.test(u0.panel) && /Masa ve Sandalye/.test(u0.panel) && /Giriş Kapısı/.test(u0.panel) && /Menü Tabelası/.test(u0.panel) && /Meze Vitrini/.test(u0.panel) && /Soğuk Dolap/.test(u0.panel) && /Kareli örtü/.test(u0.panel)
      && /SÜSLER/.test(u0.panel) && /Sardunya/.test(u0.panel) && /Asma Çardak/.test(u0.panel) && /Saz Köşesi/.test(u0.panel) && /OLAYLAR/.test(u0.panel) && /Muhtarın sofrası/.test(u0.panel), 'LOKANTA paneli: kademe + süs + olay bölümleri: ' + u0.panel.slice(0, 240));
    /* etkiler (Sv5, 12 masa) */
    const u1 = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), out = {}, R0 = Math.random;
      for (let i = 0; i < 4; i++) L.buy('lok_tb'); out.tbN = L.tbl();
      const measure = () => {
        L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
        BT.player.carry.length = 0; L.R.arr = 1e9;
        const g = L.spawn('aile'); for (let i = 0; i < 300 && !(g.ord && g.st === 'wait'); i++) BT.emek.step(0.05, 1);
        const t = L.trt(g.tb); g.ord.rec = 'hamsitava'; t.plates = g.n; Math.random = () => 0.5; L.startEat(t); Math.random = R0; g.serve = 0;
        const eat = g.eatMax; L.payOut(t);
        return { eat, pay: t.pay.reduce((a, m) => a + m.v, 0), patMax: g.patMax };
      };
      out.base = measure();
      L.buy('lok_d_cardak'); out.ter = { on: L.dcOn('cardak'), pm: L.patMul(), m: measure() };
      L.buy('lok_mez'); out.mez1 = { t: L.upLv('mez'), m: measure() };
      L.buy('lok_mez'); L.buy('lok_mez'); out.mez3 = { t: L.upLv('mez'), m: measure() };
      L.buy('lok_d_saz'); out.saz = { on: L.dcOn('saz'), tip: L.eff('tip'), pm: L.patMul(), m: measure() };
      for (let i = 0; i < 3; i++) L.buy('lok_masa'); out.masa = { t: L.upLv('masa'), pm: L.patMul() };
      for (let i = 0; i < 2; i++) { L.buy('lok_kapi'); L.buy('lok_tabela'); } out.flow = L.eff('flow');
      L.buy('lok_dol'); out.dol1 = { cap: L.cap(), dl: q.dl, tier: L.tier('dol') };
      out.room0 = L.room('hamsi'); L.buy('lok_dol'); out.dol2 = { cap: L.cap(), dl: q.dl, tier: L.tier('dol') }; q.dolap = {}; out.room1 = L.room('hamsi'); L.putDolap('hamsi', 30); out.dolapN = L.dolapN();
      out.max = ['lok_masa', 'lok_kapi', 'lok_tabela', 'lok_mez', 'lok_dol', 'lok_d_cardak'].map(id => L.why(id));
      L.DC.forEach(d => L.buy('lok_d_' + d.id)); out.allDc = L.DC.every(d => L.dcOn(d.id)); out.nDc = L.DC.length;
      out.tot = ['flow', 'pat', 'tip', 'pay'].map(k => Math.round(L.eff(k) * 100));
      out.txt = L.effTxt({ flow: 0.03, pat: 0.02 });
      out.save = JSON.parse(JSON.stringify(BT.buildSave().lok));
      return out;
    });
    const near = (a, b, t) => Math.abs(a - b) <= (t || 2);
    ok(u1.tbN === 12, '12 masa kuruldu: ' + u1.tbN);
    ok(u1.ter.on && Math.abs(u1.ter.pm - 1.05) < 1e-9 && Math.abs(u1.ter.m.patMax / u1.base.patMax - 1.05) < 0.001 && u1.ter.m.pay === u1.base.pay && u1.ter.m.eat === u1.base.eat, 'asma çardak: sabır +%5, ödeme/oturuş aynı: ' + JSON.stringify([u1.base, u1.ter]));
    ok(u1.mez1.t === 1 && near(u1.mez1.m.pay, u1.base.pay * 1.05, 3) && u1.mez3.t === 3 && near(u1.mez3.m.pay, u1.base.pay * 1.15, 3), 'meze vitrini kademeleri: ödeme +%5 → +%15: ' + JSON.stringify([u1.base.pay, u1.mez1, u1.mez3]));
    ok(u1.saz.on && Math.abs(u1.saz.tip - 0.08) < 1e-9 && Math.abs(u1.saz.pm - 1.10) < 1e-9 && u1.saz.m.pay >= u1.mez3.m.pay && u1.saz.m.eat === u1.base.eat, 'saz köşesi: bahşiş +%8, sabır +%5: ' + JSON.stringify(u1.saz));
    ok(u1.masa.t === 4 && Math.abs(u1.masa.pm - 1.22) < 1e-9 && Math.abs(u1.flow - 0.14) < 1e-9, 'masa (4 kademe, sabır +%4/kademe), kapı + tabela (akış +%10) + saz (+%4): ' + JSON.stringify([u1.masa, u1.flow]));
    ok(u1.dol1.cap === 24 && u1.dol1.dl === 1 && u1.dol1.tier === 2 && u1.dol2.cap === 36 && u1.dol2.dl === 2 && u1.dol2.tier === 3, 'dolap 12 → 24 → 36: ' + JSON.stringify([u1.dol1, u1.dol2]));
    ok(u1.room1 > u1.room0 && u1.dolapN === 30, 'büyük dolap daha çok fileto alır: ' + JSON.stringify([u1.room0, u1.room1, u1.dolapN]));
    ok(u1.max.join() === 'max,max,max,max,max,max' && u1.allDc, 'son kademede / alınmış süste yeniden alım yok: ' + u1.max.join());
    ok(u1.tot[0] >= 20 && u1.tot[0] <= 40 && u1.tot[1] >= 25 && u1.tot[1] <= 60 && u1.tot[2] >= 10 && u1.tot[3] >= 15, 'hepsi alınınca toplam etki hissedilir ama abartı değil (%): ' + u1.tot.join());
    ok(/Müşteri \+%3/.test(u1.txt) && /Memnuniyet \+%2/.test(u1.txt), 'etki metni: ' + u1.txt);
    ok(u1.save.tr && u1.save.tr.masa === 4 && u1.save.tr.kapi === 3 && u1.save.tr.tabela === 3 && u1.save.tr.mez === 3 && u1.save.dl === 2 && Array.isArray(u1.save.dc) && u1.allDc && u1.save.dc.length === u1.nDc && !('up' in u1.save), 'kayıt: S.lok.tr + dc + dl: ' + JSON.stringify([u1.save.tr, u1.save.dl, u1.save.dc && u1.save.dc.length]));
    /* saz sesi: oturan müşteri + oyuncu yakınken arada çalar; uzakken çalmaz */
    const sz = await p.evaluate(() => {
      const L = BT.lok, out = {}; L.R.grp.length = 0; L.R.board.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      const g = L.spawn('aile'); for (let i = 0; i < 300 && g.st !== 'wait'; i++) BT.emek.step(0.05, 1);
      BT.player.x = 35; BT.player.y = 18.7; const n0 = L.sazN(); L.R.sazT = 0; BT.emek.step(0.05, 1); out.near = L.sazN() - n0;
      BT.player.x = 0.5; BT.player.y = 2; L.R.sazT = 0; BT.emek.step(0.05, 1); out.far = L.sazN() - n0 - out.near;
      out.next = L.R.sazT > 20;
      return out;
    });
    ok(sz.near === 1 && sz.far === 0 && sz.next, 'saz sesi: yakınken bir kez, aralıklı: ' + JSON.stringify(sz));
    /* yükleme: kademe + süs korunur; v2.21 kaydı (up/dl) göçer; bozuk değerler düzelir */
    const ld = await p.evaluate(() => {
      const L = BT.lok, out = {}, st = () => [L.dcOn('cardak'), L.dcOn('saz'), L.dcOn('cicek'), L.UPK.map(k => L.upLv(k)).join('/'), L.cap()];
      const sv = JSON.parse(JSON.stringify(BT.buildSave()));
      BT.lok.X.resetWorld(); BT.loadFrom(JSON.parse(JSON.stringify(sv))); out.ok = st().concat(L.DC.filter(d => L.dcOn(d.id)).length);
      const old = JSON.parse(JSON.stringify(sv)); delete old.lok.tr; delete old.lok.dc; delete old.lok.mu; delete old.lok.gs; delete old.lok.ed; delete old.lok.rd; delete old.lok.res;
      old.lok.up = { ter: 1, mez: 1, saz: 1 }; old.lok.dl = 1;
      BT.lok.X.resetWorld(); const r = BT.loadFrom(old); out.old = [r].concat(st(), JSON.stringify(L.q().res), L.q().mu, Math.round(L.eff('pay') * 100));
      const none = JSON.parse(JSON.stringify(old)); delete none.lok.up; delete none.lok.dl; BT.lok.X.resetWorld(); BT.loadFrom(none); out.none = st();
      const bad = JSON.parse(JSON.stringify(sv)); bad.lok.tr = { masa: 9, kapi: -3, tabela: 'x', mez: 2.7 }; bad.lok.dc = ['saz', 'yok', 7, null]; bad.lok.dl = 7; bad.lok.up = 'x';
      BT.lok.X.resetWorld(); BT.loadFrom(bad); out.bad = st();
      const bad2 = JSON.parse(JSON.stringify(sv)); bad2.lok.tr = 'x'; bad2.lok.dc = 'y'; BT.lok.X.resetWorld(); BT.loadFrom(bad2); out.bad2 = st();
      return out;
    });
    ok(ld.ok.join() === 'true,true,true,4/3/3/3/2,36,' + ld.ok[5] && ld.ok[5] >= 15, 'yükleme: kademe + süs korunur: ' + ld.ok.join());
    ok(ld.old.join() === 'true,true,true,false,1/1/1/2/1,24,{},0,10', 'v2.21 kaydı: Teras → çardak, Saz → saz süsü, Meze → buzlu vitrin (+%10), dolap 24: ' + ld.old.join());
    ok(ld.none.join() === 'false,false,false,1/1/1/0/0,12', 'eski kayıt (yükseltmesiz): sade başlangıç: ' + ld.none.join());
    ok(ld.bad.join() === 'false,true,false,4/1/1/2/2,36' && ld.bad2.join() === 'false,false,false,1/1/1/0/2,36', 'bozuk tr/dc/dl güvenle düzeltilir: ' + JSON.stringify([ld.bad, ld.bad2]));
    await p.close();

    /* inşaat kuralı: kademe L → L gün (ilk kademe 1 gün); süsler inşaatsız, anında; biten gün başında devreye girer; kayıtta korunur */
    const p2 = await page(); await newGame(p2); await prep(p2);
    await kit(p2, { st: ['tava'], menu: ['hamsitava'], lv: 3 });
    const i0 = await p2.evaluate(() => {
      const L = BT.lok, S = BT.S, out = {}; window.HK_INSAAT_OFF = 0;
      const c0 = S.cash; L.buy('lok_mez'); L.buy('lok_dol'); L.buy('lok_masa'); L.buy('lok_d_cicek');
      out.paid = c0 - S.cash > 0; out.ins = JSON.parse(JSON.stringify(S.insaat));
      out.on = [L.upLv('mez'), L.upLv('dol'), L.upLv('masa'), L.dcOn('cicek')]; out.cap = L.cap(); out.pm = L.patMul();
      out.why = L.why('lok_mez'); const c1 = S.cash; L.buy('lok_mez'); out.dup = S.cash === c1;
      const sv = JSON.parse(JSON.stringify(BT.buildSave())); out.saved = Object.keys(sv.insaat || {}).sort().join();
      BT.lok.X.resetWorld(); BT.loadFrom(JSON.parse(JSON.stringify(sv))); out.loadedIns = Object.keys(BT.S.insaat || {}).sort().join();
      out.names = L.UPK.map(k => BT.lok.UP[k].n.tr).join();
      return out;
    });
    ok(i0.paid && i0.ins.lok_mez && i0.ins.lok_mez.lv === 1 && i0.ins.lok_mez.left === 1 && i0.ins.lok_dol.left === 1 && i0.ins.lok_masa.lv === 2 && i0.ins.lok_masa.left === 2 && !i0.ins.lok_d_cicek, 'kademe inşaata girer (L. kademe L gün), süs girmez: ' + JSON.stringify(i0.ins));
    ok(i0.on.join() === '0,0,1,true' && i0.cap === 12 && Math.abs(i0.pm - 1.02) < 1e-9 && i0.why === 'busy' && i0.dup, 'inşaat sürerken kademe etkisi yok, süs hemen; ikinci alım engelli: ' + JSON.stringify(i0));
    ok(i0.saved === 'lok_dol,lok_masa,lok_mez' && i0.loadedIns === i0.saved, 'inşaat kaydı korunur: ' + JSON.stringify([i0.saved, i0.loadedIns]));
    ok(i0.names === 'Masa ve Sandalye,Giriş Kapısı,Menü Tabelası,Meze Vitrini,Soğuk Dolap', 'kademe adları: ' + i0.names);
    await nextDay(p2);
    const i1 = await p2.evaluate(() => { const L = BT.lok; return { on: [L.upLv('mez'), L.upLv('dol'), L.upLv('masa')], cap: L.cap(), ins: Object.keys(BT.S.insaat || {}).join() }; });
    ok(i1.on.join() === '1,1,1' && i1.cap === 24 && i1.ins === 'lok_masa', 'ertesi gün: meze + dolap hazır, masa sürüyor: ' + JSON.stringify(i1));
    await nextDay(p2);
    const i2 = await p2.evaluate(() => { const L = BT.lok; return { masa: L.upLv('masa'), pm: L.patMul(), ins: Object.keys(BT.S.insaat || {}).join() }; });
    ok(i2.masa === 2 && Math.abs(i2.pm - 1.06) < 1e-9 && !i2.ins, 'ikinci gün: masa 2. kademe (sabır +%4): ' + JSON.stringify(i2));
    await p2.close();
  }

  /* ===== 14) AŞAMA 2 — menünün lokantaya taşınması, eski kayıt (v2.22: Balık Büfesi Hizmet Sahası'yla kalktı) ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava'], lv: 3 });
    const n = await p.evaluate(() => ({ bufe: BT.SERV.some(x => x.id === 'restoran'), lv: BT.tarif.restoLv() }));
    ok(!n.bufe && n.lv === 0, 'Balık Büfesi yok (Hizmet Sahası kalktı): ' + JSON.stringify(n));
    const t = await p.evaluate(() => {
      const out = {}, q = BT.tarif.q();
      q.known.push('hamsitava'); q.kiler.misirunu = 9; BT.lok.q().menu.fill(null); BT.lok.menuAdd('hamsitava');
      out.menu = BT.tarif.menu().map(r => r.id).join(); out.pick = BT.tarif.pick('hamsi');
      out.unlockedLok = BT.tarif.unlocked(); window.HK_LOK_OFF = 1; out.lokOff = BT.lok.open(); out.unlockedOff = BT.tarif.unlocked(); out.menuOff = BT.tarif.menu().length;
      window.HK_INSAAT_OFF = 1; BT.S.cash = 9e6; BT.tarif.open('menu'); out.infoOff = BT.tarif.isOpen() + '|' + BT.lok.panelOpen(); BT.tarif.close();
      window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = 1; BT.tarif.open('menu'); out.infoOn = document.querySelector('#lokRows').innerText.replace(/\s+/g, ' ').slice(0, 400); out.tab = document.querySelector('#lokTabs .tab[data-lt="menu"]').innerText.replace(/\s+/g, ' '); out.book = BT.tarif.isOpen(); BT.lok.closePanel();
      BT.setLang('en'); BT.tarif.open('menu'); out.infoEn = document.querySelector('#lokRows').innerText.replace(/\s+/g, ' ').slice(0, 520); BT.lok.closePanel();
      out.infoOffEn = ''; BT.setLang('tr');
      return out;
    });
    ok(t.menu === 'hamsitava' && t.pick === null, 'defter menüsü = lokanta menüsü; büfe tarif uygulamaz: ' + JSON.stringify([t.menu, t.pick]));
    ok(t.unlockedLok && t.lokOff === false && t.unlockedOff === false && t.menuOff === 0, 'Tarif Defteri koşulu: lokanta (v2.22: büfe yok): ' + JSON.stringify([t.unlockedLok, t.unlockedOff]));
    ok(t.infoOff === 'false|false', 'lokanta (ve büfe) yokken Defter açılmaz: ' + t.infoOff);
    ok(/Lokantanın menüsü/.test(t.infoOn) && /MENÜ 1\/3/.test(t.tab) && t.book === false, 'lokanta açıkken tarif/menü LOKANTA panelinde (defter açılmaz): ' + t.infoOn.slice(0, 100) + ' | ' + t.tab + ' | ' + t.book);
    ok(/Cooks take fillets/.test(t.infoEn) && /COOLER/.test(t.infoEn) && /The restaurant's menu/.test(t.infoEn), 'MENÜ sekmesi EN: ' + t.infoEn);
    /* eski kayıt: S.tarif.menu doluysa istasyonu kurulu olanlar lokanta menüsüne aktarılır */
    const m = await p.evaluate(() => {
      const L = BT.lok, out = {};
      const base = JSON.parse(JSON.stringify(BT.buildSave()));
      const st0 = Object.fromEntries(L.STK.map(k => [k, L.stLv(k)]));            /* v2.23: eski biçim (st) → yüklemede ocak yerlerine göçer */
      const mk = (st, menu, tmenu) => { const sv = JSON.parse(JSON.stringify(base)); sv.lok.menu = menu; delete sv.lok.sl; delete sv.lok.sp; delete sv.lok.sn; sv.lok.st = Object.assign({}, st0, st); sv.tarif = { known: ['hamsitava', 'hamsipilav', 'levrekbugulama', 'uskumrudolma'], kiler: {}, menu: tmenu, open: 1, rs: 1 }; return sv; };
      /* istasyon kurulu: aktarılır; boş yer yoksa/kurulu değilse bekler */
      BT.lok.X.resetWorld(); BT.loadFrom(mk({ tava: 1, tencere: 1, firin: 1 }, [null, null, null, null, null], ['hamsipilav', 'levrekbugulama', 'hamsitava', null, null]));
      out.a = [L.q().menu.join(), BT.tarif.save().menu.join()];
      BT.lok.X.resetWorld(); BT.loadFrom(mk({ tava: 1, tencere: 0, firin: 0 }, [null, null, null, null, null], ['hamsipilav', 'levrekbugulama', 'hamsitava', null, null]));
      out.b = [L.q().menu.join(), BT.tarif.save().menu.join()];
      window.HK_INSAAT_OFF = 1; BT.S.cash = 9e6; L.buy('lok_tencere'); out.b2 = [L.q().menu.join(), BT.tarif.save().menu.join()];
      L.buy('lok_firin'); out.b3 = [L.q().menu.join(), BT.tarif.save().menu.join()];
      /* kayıtta aynı tarif iki yerde / zaten lokanta menüsünde */
      BT.lok.X.resetWorld(); BT.loadFrom(mk({ tava: 1, tencere: 1, firin: 1 }, ['hamsitava', null, null, null, null], ['hamsitava', 'hamsitava', 'x', 7, null]));
      out.c = [L.q().menu.join(), BT.tarif.save().menu.join()];
      /* lokanta hiç yok (eski kayıt): bekleme listesi korunur, hata yok */
      const old = mk({}, [], ['hamsitava', null, null, null, null]); delete old.lok; old.areas = old.areas.slice(0, 4);
      BT.lok.X.resetWorld(); const r = BT.loadFrom(old); out.d = [r, BT.lok.open(), BT.tarif.save().menu.join(), BT.tarif.menu().length];
      return out;
    });
    ok(m.a[0] === 'hamsitava,hamsipilav,levrekbugulama,,' === false && m.a[0].split(',').filter(Boolean).sort().join() === 'hamsipilav,hamsitava,levrekbugulama' && m.a[1] === ',,,,', 'eski büfe menüsü lokantaya aktarılır, bekleme listesi boşalır: ' + JSON.stringify(m.a));
    ok(m.b[0].split(',').filter(Boolean).join() === 'hamsitava' && m.b[1] === 'hamsipilav,levrekbugulama,,,', 'istasyonu olmayanlar bekler: ' + JSON.stringify(m.b));
    ok(m.b2[0].split(',').filter(Boolean).sort().join() === 'hamsitava,levrekbugulama' && m.b2[1] === 'hamsipilav,,,,', 'Kazan kurulunca levrek girer: ' + JSON.stringify(m.b2));
    ok(m.b3[0].split(',').filter(Boolean).includes('hamsipilav') && m.b3[1] === ',,,,', 'Taş Fırın kurulunca pilav girer: ' + JSON.stringify(m.b3));
    ok(m.c[0].split(',').filter(Boolean).join() === 'hamsitava' && m.c[1] === ',,,,', 'tekrar/bozuk girdi güvenle ayıklanır: ' + JSON.stringify(m.c));
    ok(m.d[0] === true && m.d[1] === false && m.d[2] === 'hamsitava,,,,' && m.d[3] === 0, 'lokanta yokken eski kayıt güvenli: ' + JSON.stringify(m.d));
    await p.close();
  }

  /* ===== 15) AŞAMA 2 — TR/EN metinleri ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'firin'], menu: ['hamsitava', 'hamsipilav'], lv: 3 });
    const x = await p.evaluate(() => {
      const tr = BT.STR.tr, en = BT.STR.en, keys = Object.keys(tr).filter(k => /^lk/.test(k)), out = {};
      out.n = keys.length; out.miss = keys.filter(k => typeof en[k] !== 'string' || !en[k]).concat(Object.keys(en).filter(k => /^lk/.test(k) && typeof tr[k] !== 'string'));
      out.same = keys.filter(k => tr[k] === en[k] && !/^lk(Kasa|Pass)$/.test(k));
      out.lists = [BT.lok.WED, BT.lok.MUH, BT.lok.CRIT].every(l => l.length >= 4 && l.every(o => o.tr && o.en));
      const g = BT.lok.G; out.gnames = [g.muhtar.t, g.elestirmen.t];
      const ach = BT.ACH.find(a => a.id === 'lk_gurme'); out.ach = ach && [ach.t.tr, ach.t.en, ach.d.tr, ach.d.en];
      out.help = BT.STR.tr.tfMenuSub && BT.STR.en.tfMenuSub;
      BT.setLang('en'); const q = BT.lok.q(); q.res = { st: 'on', n: 14, rec: 'hamsipilav', kind: 'dugun', w: 1, due: BT.day.n + 1, got: 3 }; q.star = 4;
      out.panelEn = ((() => { let txt = ''; ['menu', 'rec', 'try', 'kiler', 'st', 'crew', 'up', 'sus', 'ev'].forEach(t => { BT.lok.openPanel(t); txt += ' ' + document.getElementById('lokRows').innerText.replace(/\s+/g, ' ') + ' ' + document.getElementById('lokTabs').innerText.replace(/\s+/g, ' '); }); return txt; })()); BT.lok.closePanel();
      BT.setLang('tr'); out.panelTr = ((() => { let txt = ''; ['menu', 'rec', 'try', 'kiler', 'st', 'crew', 'up', 'ev'].forEach(t => { BT.lok.openPanel(t); txt += ' ' + document.getElementById('lokRows').innerText.replace(/\s+/g, ' ') + ' ' + document.getElementById('lokTabs').innerText.replace(/\s+/g, ' '); }); return txt; })()); BT.lok.closePanel(); q.res = {};
      return out;
    });
    ok(x.n > 60 && !x.miss.length, 'TR/EN lk* anahtarları eşleşiyor: ' + JSON.stringify(x.miss));
    ok(x.same.length === 0 || x.same.every(k => /^lk(Mezeb|SazB|MeZeB)$/i.test(k)), 'çevrilmemiş (TR = EN) metin: ' + x.same.join());
    ok(x.lists, 'isim listeleri (düğün, muhtar, eleştirmen) TR/EN dolu');
    ok(x.gnames[0].tr === 'Muhtar ve Heyeti' && /Headman/.test(x.gnames[0].en) && x.gnames[1].en === 'Gourmet Critic', 'grup adları: ' + JSON.stringify(x.gnames));
    ok(x.ach && x.ach[0] === 'Gurmenin Gözdesi' && /Gourmet/.test(x.ach[1]) && /5 yıldız/.test(x.ach[2]) && /5 stars/.test(x.ach[3]), 'başarım TR/EN: ' + JSON.stringify(x.ach));
    ok(/UPGRADES/.test(x.panelEn) && /EVENTS/.test(x.panelEn) && /Vine Pergola/.test(x.panelEn) && /Meze Display/.test(x.panelEn) && /Saz Corner/.test(x.panelEn) && /Cooler/.test(x.panelEn) && /Tables & Chairs/.test(x.panelEn) && /DECOR/.test(x.panelEn) && /Headman's table/.test(x.panelEn) && /Gourmet Critic/.test(x.panelEn) && /plates of Anchovy Pilaf/.test(x.panelEn) && /3\/14/.test(x.panelEn) && !/\blk[A-Z]\w+/.test(x.panelEn) && !/[ğışçöüİ]/.test(x.panelEn.replace(/Ayşe|Gül|İ/g, '')), 'EN panel (yükseltme + olay): ' + x.panelEn.slice(0, 400));
    ok(/GELİŞTİRMELER/.test(x.panelTr) && /OLAYLAR/.test(x.panelTr) && /3\/14/.test(x.panelTr) && /yarın/.test(x.panelTr) && /★★★★☆/.test(x.panelTr), 'TR panel olay satırları: ' + x.panelTr.slice(0, 300));
    await p.close();
  }

  /* ===== 11) ekran görüntüleri (yalnız klasör verilince): lokanta genel + servis sırasında ===== */
  if (SHOT) {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav', 'levrekbugulama'], lv: 3 });
    await p.evaluate(() => {
      const L = BT.lok; L.buy('lok_tb'); L.buy('lok_tb'); L.buy('lok_lv');
      ['lk_asci', 'lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r));
      const q = L.q(); q.dolap = { hamsi: 8, levrek: 4 };
      BT.player.x = 31; BT.player.y = 18.7; BT.S.cash = 1e6; L.R.arr = 1e9; L.spawn('aile'); setTimeout(() => L.spawn('turist'), 900); setTimeout(() => L.spawn('kahve'), 6000);
    });
    let gotA = false, gotB = false;
    for (let i = 0; i < 160 && !(gotA && gotB); i++) {
      await step(p, 0.1, 5);
      const st = await p.evaluate(() => { const L = BT.lok, g = L.R.grp; return { seated: g.filter(x => x.st === 'wait' || x.st === 'eat').length, eat: g.filter(x => x.st === 'eat').length, carry: L.crew('lk_garson').some(w => w.carry.some(i => i.k === 'plate')) && L.R.grp.some(x => x.st === 'wait'), pass: L.R.pass.length, n: g.length, dolap: L.dolapN() }; });
      if (!gotA && st.seated >= 2) { await p.evaluate(() => { BT.lok.q().dolap.hamsi = 8; BT.player.x = 31; BT.player.y = 18.7; }); await sleep(1400); await shot(p, 'lokanta-genel'); gotA = true; }
      if (gotA && !gotB && st.carry) { await sleep(150); await shot(p, 'lokanta-servis'); gotB = true; }
      if (i % 20 === 19) await p.evaluate(() => { BT.lok.q().dolap.hamsi = 8; BT.lok.q().dolap.levrek = 4; });
    }
    ok(gotA && gotB, 'ekran görüntüleri alınabildi: ' + gotA + '/' + gotB);
    await p.close();
  }

  /* ===== 16) Aşama 2 ekran görüntüsü: teras + saz köşesi + yıldızlı tabela (390x844) ===== */
  if (SHOT) {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav', 'levrekbugulama'], lv: 5 });
    await p.evaluate(() => {
      const L = BT.lok; for (let i = 0; i < 4; i++) L.buy('lok_tb'); L.UPK.forEach(k => { for (let j = 0; j < 4; j++) L.buy('lok_' + k); }); L.DC.forEach(d => L.buy('lok_d_' + d.id));
      ['lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef'].forEach(r => L.hire(r));
      const q = L.q(); q.star = 5; q.gs = 5; q.dolap = { hamsi: 14, levrek: 6 }; q.res = { st: 'on', n: 16, rec: 'hamsipilav', kind: 'dugun', w: 0, due: BT.day.n, got: 7 };
      BT.player.x = 31; BT.player.y = 18.5; BT.day.t = 20; L.R.arr = 1e9;
      L.spawn('aile'); setTimeout(() => L.spawn('turist'), 500); setTimeout(() => L.spawn('kahve'), 3000); setTimeout(() => L.spawn('is'), 5000);
    });
    for (let i = 0; i < 60; i++) { await step(p, 0.1, 5); await p.evaluate(() => { BT.lok.q().dolap.hamsi = 14; BT.player.x = 31; BT.player.y = 18.5; }); }
    await sleep(1200); await shot(p, 'lokanta-teras-saz');
    await p.close();
  }

  /* ===== 17) v2.20: karada yerleşim (iskele değil), yol, yürüme, panel (390x844), 🍲 düğmesi, eski kayıt taşıma ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava', 'izgara', 'tencere', 'firin'], menu: ['hamsitava', 'hamsipilav'], lv: 5 });
    const g = await p.evaluate(() => {
      const A = BT.areas[4], L = BT.lok, o = {};
      o.area = [A.x0, A.y0, A.x1, A.y1];
      const inA = (x, y) => x > A.x0 && x < A.x1 && y > A.y0 && y < A.y1;
      o.allIn = L.TB.every(t => inA(t.x, t.y)) && L.SL.every(d => inA(d.x, d.y)) && ['dolap', 'pass', 'kasa', 'sink', 'board', 'meze', 'saz'].every(k => inA(L.LOK[k].x, L.LOK[k].y));
      const sp = [...L.TB.map(t => [t.sx, t.sy]), ...L.SL.map(d => [d.sx, d.sy]), ...['dolap', 'pass', 'kasa', 'sink', 'board'].map(k => [L.LOK[k].sx, L.LOK[k].sy])];
      o.badSp = sp.filter(q => !BT.canStand(q[0], q[1])).map(q => q.join(','));
      const seg = (a, b) => { for (let i = 0; i <= 40; i++) { const x = a[0] + (b[0] - a[0]) * i / 40, y = a[1] + (b[1] - a[1]) * i / 40; if (!BT.canStand(x, y)) return false; } return true; };
      o.walk = seg([9.6, 20.4], [14.3, 20.4]) && seg([14.3, 20.4], [16.9, 20.4]) && seg([16.9, 20.4], [16.9, 18.1]) && seg([16.9, 18.1], [32.2, 18.1]) && seg([16.9, 21.1], [33, 21.1]) && seg([14.3, 15.6], [14.3, 20.4]);
      o.walkYard = seg([18.1, 10.6], [18.1, 13.8]) && seg([18.1, 13.8], [18.1, 15.2]) && seg([18.1, 15.2], [26, 15.2]);
      o.water = [BT.arr.why(37.2, 15), BT.arr.why(20, 25), BT.arr.why(12.4, 22), BT.arr.why(31, 19)];
      o.maxY = BT.dbg().maxY; o.clash = BT.layoutClashes(0.1);
      o.landy = BT.dbg().landY; o.landx = BT.dbg().landX;
      return o;
    });
    ok(g.area.join() === '15,13.2,36,23.6' && g.allIn, 'lokanta alanı yolun doğusunda, bütün öğeler içinde: ' + JSON.stringify([g.area, g.allIn]));
    ok(g.badSp.length === 0, 'hizmet noktaları yürünebilir: ' + g.badSp.join(' | '));
    ok(g.walk && !g.walkYard, 'yürüme yolları açık (Mutfak ucu → yol → kapı → şeritler; saha → batı geçidi / arka avlu): ' + JSON.stringify([g.walk, g.walkYard]));
    ok(g.water[0] === 'su' && g.water[1] === 'su' && g.water[2] === 'yol' && g.water[3] === 'iskele', 'kara doğuya genişledi (LANDX 37), güney eski haline (24,5), yol 24,3\'te: ' + g.water.join());
    ok(g.landy === 24.5 && g.landx === 37 && g.maxY === 23.5 && g.clash.length === 0, 'iskele çiti Mutfak\'ta biter, layoutClashes boş: ' + JSON.stringify([g.maxY, g.clash]));
    /* müşteri akışı: doğuş yolda, sıra yolda, kapıdan girer, masa sırasının şeridinden koltuğa; kapıyı geçmeden duvarı aşmaz */
    const w = await p.evaluate(() => {
      const L = BT.lok, g = L.spawn('aile'), o = {};
      o.q = g.mem.map(m => m.path[m.path.length - 1]);
      o.start = [g.mem[0].x, g.mem[0].y];
      const t = L.TB[5], s = { x: t.x - 0.82, y: t.y - 0.28 }, way = L.seatWay(t, s);
      o.way = way.map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ');
      o.out = L.outWay(t, s).map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ');
      o.wayStand = way.concat(L.outWay(t, s)).every(q => BT.canStand(q.x, q.y));
      return o;
    });
    ok(w.q.every(q => q.x >= 13.0 && q.x <= 14.6 && q.y > 15.4 && q.y < 19.8) && w.start[0] > 10.2 && w.start[0] < 14.6, 'müşteriler yolda doğar, kapının önünde yol kenarında sıra bekler: ' + JSON.stringify(w));
    ok(/^14\.3,20\.4 14\.4,20\.4 15\.[56],20\.4 16\.9,20\.4/.test(w.way) && w.wayStand, 'koltuğa yürüyüş kapı → batı şeridi → sıra şeridi: ' + w.way);
    await step(p, 0.05, 20 * 60); await p.evaluate(() => { BT.lok.R.grp.length = 0; });
    /* panel 390x844: 9 sekme, taşma yok, düğmeler >= 44 px */
    const pm = await p.evaluate(() => {
      const o = { tabs: [], bad: [] }, T = BT.lok.tabs;
      T.forEach(t => {
        BT.lok.openPanel(t);
        const c = document.querySelector('#lokScr .card'), r = c.getBoundingClientRect(), rows = document.getElementById('lokRows');
        o.tabs.push([t, Math.round(r.width), Math.round(r.height), rows.scrollWidth <= rows.clientWidth + 1]);
        if (r.right > innerWidth + 1 || r.left < -1 || r.bottom > innerHeight + 1 || r.top < -1 || rows.scrollWidth > rows.clientWidth + 1) o.bad.push(t + ' taşıyor');
        document.querySelectorAll('#lokScr button').forEach(b => { if (b.offsetHeight && b.offsetHeight < 44) o.bad.push(t + ' ' + b.innerText.slice(0, 12) + ' h=' + b.offsetHeight); });
      });
      o.tabBtns = [...document.querySelectorAll('#lokTabs .tab')].map(b => b.innerText.replace(/\s+/g, ' ')).join('|');
      BT.lok.closePanel(); return o;
    });
    ok(pm.bad.length === 0, 'panel mobilde (390x844) taşmaz, düğmeler >=44px: ' + pm.bad.join('; '));
    ok(pm.tabs.length === 9 && /MENÜ.*TARİFLER.*DENE.*KİLER.*İSTASYONLAR.*KADRO.*GELİŞTİRMELER.*SÜSLER.*OLAYLAR/.test(pm.tabBtns), 'sekmeler: ' + pm.tabBtns);
    /* MENÜ: simge, istasyon, malzeme, porsiyon, fiyat; kileri boşalan uyarı */
    const mn = await p.evaluate(() => {
      const q = BT.tarif.q(); q.kiler.misirunu = 12; q.kiler.pirinc = 0;
      BT.lok.openPanel('menu');
      const rows = [...document.querySelectorAll('#lokRows .tfMenuRow')].map(r => ({ t: r.innerText.replace(/\s+/g, ' '), cv: !!r.querySelector('canvas'), warn: r.classList.contains('warn'), inm: r.classList.contains('inm') }));
      const o = { rows, banner: !!document.querySelector('#lokRows .tfWarn'), tabWarn: document.querySelector('#lokTabs .tab[data-lt="menu"]').classList.contains('w'), por: BT.lok.portions(BT.tarif.list.find(r => r.id === 'hamsitava')) };
      BT.lok.closePanel(); return o;
    });
    const rt = mn.rows.find(r => /Hamsi Tava/.test(r.t)), rp = mn.rows.find(r => /Hamsili Pilav/.test(r.t));
    ok(rt && rt.cv && rt.inm && /İstasyon: Kızgın Tava/.test(rt.t) && /Hamsi \+ Mısır Unu/.test(rt.t) && /12 porsiyon/.test(rt.t) && /\$|₺/.test(rt.t), 'MENÜ satırı: simge, istasyon, malzeme, porsiyon, fiyat: ' + JSON.stringify(rt));
    ok(rp && rp.warn && /Kiler boş: Pirinç/.test(rp.t) && mn.banner && mn.tabWarn && mn.por === 12, 'kileri boşalan tarif için uyarı: ' + JSON.stringify([rp, mn.banner, mn.tabWarn]));
    /* 🍲 düğmesi: lokanta açıkken LOKANTA paneli; lokanta yokken (v2.22: büfe de yok) defter açılmaz */
    const bt = await p.evaluate(() => {
      const b = document.getElementById('tarifBtn'), o = { vis: !b.classList.contains('hidden') };
      b.click(); o.panel = BT.lok.panelOpen(); o.book = BT.tarif.isOpen(); o.tab = document.querySelector('#lokTabs .tab.on').dataset.lt; BT.lok.closePanel();
      window.HK_LOK_OFF = 1;
      b.click(); o.panel2 = BT.lok.panelOpen(); o.book2 = BT.tarif.isOpen(); o.tabs2 = [...document.querySelectorAll('#tfTabs .tab')].map(x => x.dataset.tt).join(); BT.tarif.close(); window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = 1;
      return o;
    });
    ok(bt.vis && bt.panel && !bt.book && bt.tab === 'menu' && !bt.panel2 && !bt.book2, '🍲: lokanta açıkken LOKANTA paneli, lokanta yokken defter açılmaz: ' + JSON.stringify(bt));
    /* eski kayıt: konumlar sabitlerden gelir; dünyada kalmış nesneler yeni alana taşınır */
    const mg = await p.evaluate(() => {
      const L = BT.lok, o = {}, q = L.q();
      L.buy('lok_tb'); L.hire('lk_garson');
      const t3 = L.trt(3); t3.pay.push({ k: 'money', v: 55 }); t3.dirty = 2; t3.st = 'dirty';
      const d = JSON.parse(JSON.stringify(BT.buildSave()));
      BT.lok.X.resetWorld(); BT.loadFrom(d);
      const w = L.crew('lk_garson')[0];
      o.crew = !!w && BT.canStand(w.x, w.y); o.pay = L.trt(3).pay.reduce((a, m) => a + m.v, 0); o.dirty = L.trt(3).dirty;
      w.x = 4; w.y = 26.5;                                           /* eski iskele konumu */
      const dc = BT.decor.find(x => !x.fixed); const hx = dc.hx, hy = dc.hy; dc.got = true; dc.box = false; dc.x = 31; dc.y = 19;
      L.fixWorld();
      o.crew2 = BT.canStand(w.x, w.y) && w.x > 15 && w.y > 13.2; o.decor = dc.x === hx && dc.y === hy;
      o.areaOpen = !BT.areas[4].locked; o.lv = L.q().lv; o.cost = BT.S.cash > 0;
      return o;
    });
    ok(mg.crew && mg.pay === 55 && mg.dirty === 2 && mg.crew2 && mg.decor && mg.areaOpen, 'eski kayıt/yükleme: kadro, masa ödemeleri, kirli tabaklar yeni alanda; eski konum ve alandaki süs taşınır: ' + JSON.stringify(mg));
    await p.close();
  }

  /* ===== 18) v2.22: AÇIK / KAPALI (her gün kapalı başlar; kapalıyken misafir yok; kapı tabelası düğmesi); patron parayı doğrudan cebine atar ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    const o1 = await p.evaluate(() => {
      window.HK_LOK_OPEN = 0; const L = BT.lok, q = L.q(), o = {};
      q.ed = -1; L.R.grp.length = 0; L.R.arr = 0.1; BT.emek.step(0.05, 200);                       /* gün başı → kapalı */
      o.closed = !q.op && L.R.grp.length === 0;
      L.openPanel('menu'); const ob = document.getElementById('lokOnBtn'); o.btn0 = ob.textContent; ob.click(); o.btn1 = ob.textContent; o.op = q.op; L.closePanel();
      L.R.arr = 0.1; BT.emek.step(0.05, 20); o.came = L.R.grp.length > 0;
      BT.player.x = L.LOK.gate.x + 0.5; BT.player.y = L.LOK.gate.y; BT.emek.step(0.05, 2);
      return o;
    });
    await sleep(400);
    Object.assign(o1, await p.evaluate(() => {
      const L = BT.lok, q = L.q(), o = {};
      const a = document.getElementById('actBtn'); o.gateBtn = a && !a.classList.contains('hidden') ? a.textContent : '';
      if (a) a.click(); o.op2 = q.op; o.left = L.R.grp.every(g => g.out || g.st === 'seat' || g.st === 'wait' || g.st === 'eat');
      /* para: oyuncu masadaki parayı taşımadan kasaya atar */
      const t = L.trt(0); t.pay = [{ k: 'money', v: 40 }, { k: 'money', v: 25 }]; const c0 = BT.S.cash;
      BT.player.x = L.TB[0].sx; BT.player.y = L.TB[0].sy; BT.player.carry.length = 0; BT.emek.step(0.05, 12);
      o.cash = BT.S.cash - c0; o.carry = BT.player.carry.filter(i => i.k === 'money').length; o.payLeft = t.pay.length;
      window.HK_LOK_OPEN = 1; return o;
    }));
    ok(o1.closed && /KAPALI/.test(o1.btn0) && /AÇIK/.test(o1.btn1) && o1.op === 1 && o1.came, 'gün kapalı başlar, panelden açılınca misafir gelir: ' + JSON.stringify(o1));
    ok(/KAPAT/.test(o1.gateBtn) && o1.op2 === 0 && o1.left, 'kapı tabelası düğmesi kapatır, bekleyenler gider: ' + JSON.stringify(o1));
    ok(o1.cash === 65 && o1.carry === 0 && o1.payLeft === 0, 'patron masadaki parayı doğrudan cebine atar: ' + JSON.stringify(o1));
    /* PERSONEL sekmesinde lokanta kadrosu */
    const ps = await p.evaluate(() => {
      BT.S.cash = 1e6; BT.lok.X.openBar('staff'); BT.lok.X.setBuildZone(9);   /* v2.24: PERSONEL bölge bölge — lokanta kadrosu Genel çipinde */
      /* v2.25: rol kartları doğrudan ana listede ('lks' SEÇ özet kartı kalktı) */
      const card = BT.lok.X.barList().find(c => c.id === 'lrlk_asci'); if (!card) return { card: false };
      const subs = BT.lok.X.barList().map(c => c.id).filter(id => /^lr/.test(id));
      const n0 = BT.lok.crew().length; BT.lok.X.barList().find(c => c.id === 'lrlk_garson').go(); const n1 = BT.lok.crew().length;
      BT.lok.X.closeBar && BT.lok.X.closeBar(); return { card: true, subs: subs.join(), hired: n1 - n0 };
    });
    ok(ps.card && /lrlk_asci/.test(ps.subs) && /lrlk_garson/.test(ps.subs) && ps.hired === 1, 'PERSONEL sekmesinde lokanta kadrosu kartı + kiralama: ' + JSON.stringify(ps));
    await p.close();
  }

  /* ===== 19) v2.23: OCAK YERLERİ — Sv1'de 2 yer (3. kilitli), aynı türden 2 ocak siparişi paylaşır (en az yüklüye), sök (%50 iade,
     yer boşalır, aşçı serbest), düşür (kademe −1), Sv2 → 3 yer, Sv3 → 4 yer, eski kayıt göçü (st → sl; fazla istasyon ve süren
     inşaat kaybolmaz), kayıt/yükleme, bozuk sl, panel (iki dokunuşla SÖK, 390x844 taşma yok) ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: [], menu: [] });
    const a = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), o = {};
      o.n1 = L.slotN(); o.open = [0, 1, 2, 3].map(i => L.slOpen(i)).join(); o.why2 = L.why('lok_s2_tava');
      o.b0 = L.build('s0', 'tava'); o.b1 = L.build('s1', 'tava'); o.b2 = L.build('s2', 'firin');
      o.sl = q.sl.map(x => x && x.k + x.lv).join(); o.slOf = L.slOf('tava').join(); o.has = [L.hasSt('tava'), L.hasSt('firin')].join();
      o.legacyFull = L.why('lok_firin'); o.legacyBuy = L.buy('lok_firin');                            /* boş yer yok: eski kimlik de kuramaz */
      o.menu = L.menu().join();
      /* aynı türden iki ocak: fiş en az yüklü yere gider (eşitlikte soldaki); her turda tek iş */
      q.dolap.hamsi = 12; L.R.board.length = 0;
      const ord = { id: 990, tb: 0, rec: 'hamsitava', n: 4, cooked: 0, inprog: 0, deliv: 0, t0: 0, dead: false, g: null }; L.R.board.push(ord);
      L.stPull({ s0: 1, s1: 1 }); o.share1 = [L.S.s0.jobs.length, L.S.s1.jobs.length, ord.inprog, q.dolap.hamsi].join();
      L.S.s0.jobs.length = 0; L.S.s1.jobs.length = 0; ord.inprog = 0;
      L.up('s0'); o.up = L.stLv('s0');                                                                  /* s0 kademe 2: 2 yuva */
      L.stPull({ s0: 1, s1: 1 }); o.share2 = [L.S.s0.jobs.length, L.S.s1.jobs.length, ord.inprog].join();
      L.stPull({ s0: 0, s1: 1 }); o.noCook = L.S.s0.jobs.length;
      /* düşür: bir alt kademe, iade yok; fazla yuvadaki iş fişe döner */
      const c0 = BT.S.cash; o.down = L.down('s0'); o.downLv = L.stLv('s0'); o.downCash = Math.round(BT.S.cash - c0); o.downJobs = L.S.s0.jobs.length; o.inprog = ord.inprog;
      o.downMin = [L.modWhy('s0', 'down'), L.down('s0'), L.stLv('s0')].join();
      /* sök: %50 iade, yer boşalır, işler fişe döner */
      const sp1 = q.sp[1], c1 = BT.S.cash; o.refund = L.refund('s1');
      o.rm = L.remove('s1'); o.rmCash = Math.round(BT.S.cash - c1); o.rmHalf = Math.floor(sp1 * 0.5); o.rmSl = q.sl[1]; o.rmSp = q.sp[1]; o.rmJobs = L.S.s1.jobs.length; o.rmInprog = ord.inprog;
      o.rmEmpty = [L.modWhy('s1', 'rm'), L.remove('s1')].join();
      L.R.board.length = 0; L.S.s0.jobs.length = 0;
      return o;
    });
    ok(a.n1 === 2 && a.open === 'true,true,false,false' && a.why2 === 'lv' && a.b0 && a.b1 && a.b2 === false, 'Sv1: 2 ocak yeri, 3. kilitli: ' + JSON.stringify(a));
    ok(a.sl === 'tava1,tava1,,' && a.slOf === 's0,s1' && a.has === 'true,false' && a.legacyFull === 'lv' && a.legacyBuy === false, 'aynı türden iki ocak (2 tava) kurulur; yer yokken eski kimlik de kuramaz: ' + JSON.stringify(a));
    ok(a.menu === 'hamsitava', 'tava kurulunca tarifi menüye girer: ' + a.menu);
    ok(a.share1 === '1,1,2,10' && a.up === 2 && a.share2 === '2,1,3' && a.noCook === 2, 'fiş iki tava arasında paylaşılır, en az yüklü yere gider: ' + JSON.stringify([a.share1, a.share2, a.noCook]));
    ok(a.down === true && a.downLv === 1 && a.downCash === 0 && a.downJobs === 1 && a.inprog === 2 && a.downMin === 'min,false,1', 'DÜŞÜR: kademe −1, iade yok, fazla iş fişe döner, kademe 1\'de düşmez: ' + JSON.stringify(a));
    ok(a.rm === true && a.rmCash === a.rmHalf && a.refund === a.rmHalf && a.rmHalf > 0 && a.rmSl === null && a.rmSp === 0 && a.rmJobs === 0 && a.rmInprog === 1 && a.rmEmpty === 'empty,false', 'SÖK: %50 iade, yer boşalır, iş fişe döner: ' + JSON.stringify(a));
    /* aşçılar yer başına; sökünce aşçı serbest kalır; aşçı sınırı kurulu yer sayısı */
    const c = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), o = {};
      q.lv = 2; o.n2 = L.slotN(); o.open2 = L.slOpen(2); L.build('s1', 'tava');
      o.max = L.roleMax('lk_asci'); L.hire('lk_asci'); L.hire('lk_asci'); o.lst = L.crew('lk_asci').map(w => w.lst).sort().join();
      o.max3 = L.hireWhy('lk_asci');
      L.remove('s1'); o.after = L.crew('lk_asci').map(w => w.lst || '-').sort().join(); o.max1 = L.roleMax('lk_asci');
      L.build('s2', 'firin'); o.re = L.crew('lk_asci').map(w => w.lst || '-').sort().join();
      L.buy('lok_lv'); o.n3 = L.slotN(); o.lv = q.lv; o.open3 = L.slOpen(3);
      o.b3 = L.build('s3', 'tava'); o.sl = q.sl.map(x => x && x.k + x.lv).join();
      return o;
    });
    ok(c.n2 === 3 && c.open2 && c.max === 2 && c.lst === 's0,s1' && c.max3 === 'stat', 'Sv2: 3 yer; yer başına bir aşçı, aşçı sınırı kurulu yer sayısı: ' + JSON.stringify(c));
    ok(c.after === '-,s0' && c.max1 === 1 && c.re === 's0,s2', 'sökünce aşçı serbest kalır, yeni ocak kurulunca oraya geçer: ' + JSON.stringify(c));
    ok(c.n3 === 4 && c.lv === 3 && c.open3 && c.b3 && c.sl === 'tava1,,firin1,tava1', 'Sv3: 4 yer: ' + JSON.stringify(c));
    /* aynı türden iki ocak gerçek akışta birlikte pişirir */
    const sim = await p.evaluate(() => {
      const L = BT.lok, q = L.q(); L.remove('s2'); L.build('s1', 'tava'); L.assign();
      q.dolap.hamsi = 12; L.R.grp.length = 0; L.R.board.length = 0; L.spawn('aile'); BT.player.x = 31; BT.player.y = 18.5;
      let both = 0;
      for (let i = 0; i < 1200 && both <= 5; i++) { BT.emek.step(0.05, 1); BT.day.t = Math.min(BT.day.t, 200); BT.day.phase = 'play'; if (['s0', 's1', 's3'].filter(s => L.S[s].jobs.length).length >= 2) both++; }
      return { both, sl: q.sl.map(x => x && x.k + x.lv).join(), cooks: L.crew('lk_asci').map(w => w.lst).sort().join() };
    });
    ok(sim.both > 5, 'aynı türden ocaklar siparişi birlikte pişirir: ' + JSON.stringify(sim));
    /* kayıt / yükleme (yeni biçim) + eski kayıt göçü + bozuk sl */
    const sv = await p.evaluate(() => {
      const L = BT.lok, o = {};
      L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0;
      const d = JSON.parse(JSON.stringify(BT.buildSave())); o.saved = JSON.stringify([d.lok.sl, d.lok.sp.map(v => v > 0 ? 1 : 0), d.lok.sn, 'st' in d.lok]);
      BT.lok.X.resetWorld(); BT.loadFrom(JSON.parse(JSON.stringify(d))); let q = L.q();
      o.load = [q.sl.map(x => x && x.k + x.lv).join(), q.sp.map(v => v > 0 ? 1 : 0).join(), L.slotN(), L.crew('lk_asci').map(w => w.lst).sort().join()].join('|');
      /* eski kayıt: Sv1, 3 istasyon + fırın inşaatı (bitmiş) + mangal yükseltmesi (sürüyor) */
      const old = JSON.parse(JSON.stringify(d)); delete old.lok.sl; delete old.lok.sp; delete old.lok.sn; old.lok.lv = 1; old.lok.menu = [null, null, null, null, null];
      old.lok.st = { tava: 2, izgara: 1, tencere: 3, firin: 0 }; old.insaat = { lok_firin: { lv: 1, left: 0 }, lok_izgara: { lv: 2, left: 2 } };
      BT.lok.X.resetWorld(); o.oldOk = BT.loadFrom(old); q = L.q();
      o.old = [q.sl.map(x => x && x.k + x.lv).join(), L.slotN(), q.sn, Object.keys(BT.S.insaat).sort().join(), q.sp.map(v => v > 0 ? 1 : 0).join()].join('|');
      /* bozuk sl / inşaat */
      const bad = JSON.parse(JSON.stringify(d)); bad.lok.lv = 1; bad.lok.sl = [{ k: 'zz', lv: 2 }, { k: 'tava', lv: 'x' }, 5, { k: 'firin', lv: 7 }, { k: 'tava', lv: 1 }]; bad.lok.sp = 'x'; bad.lok.sn = 99; bad.insaat = { lok_s9_tava: { lv: 1, left: 1 }, lok_s1_zz: { lv: 1, left: 1 }, lok_constructor: { lv: 1, left: 1 } };
      BT.lok.X.resetWorld(); o.badOk = BT.loadFrom(bad); q = L.q();
      o.bad = [q.sl.map(x => x && x.k + x.lv).join(), q.sp.join(), L.slotN(), Object.keys(BT.S.insaat).join()].join('|');
      return o;
    });
    ok(sv.saved === '[[{"k":"tava","lv":1},{"k":"tava","lv":1},null,{"k":"tava","lv":1}],[1,1,0,1],0,false]' && sv.load === 'tava1,tava1,,tava1|1,1,0,1|4|s0,s1', 'kayıt/yükleme: ocak yerleri, harcamalar, aşçılar: ' + JSON.stringify(sv));
    ok(sv.oldOk && sv.old === 'tava2,izgara1,tencere3,firin1|4|4|lok_s1|1,1,1,1', 'eski kayıt göçü: st → sl (LOK_STK sırası), Sv1\'de fazla istasyon + inşaat kaybolmaz: ' + JSON.stringify(sv));
    ok(sv.badOk && sv.bad === ',,,firin3|0,0,0,0|4|', 'bozuk sl / inşaat güvenle düzeltilir: ' + JSON.stringify(sv.bad));
    /* panel: İSTASYONLAR sekmesi — kilitli yer, boş yerde tür seçimi, SÖK iki dokunuşla, taşma yok */
    const pn = await p.evaluate(() => {
      const L = BT.lok, q = L.q(), o = { bad: [] };
      q.lv = 1; q.sn = 0; q.sl = [{ k: 'tava', lv: 2 }, null, null, null]; q.sp = [5000, 0, 0, 0]; BT.S.insaat = {}; BT.S.cash = 1e6; L.assign();
      L.openPanel('st'); const rows = document.getElementById('lokRows');
      o.txt = rows.innerText.replace(/\s+/g, ' ');
      o.btn = [...rows.querySelectorAll('button[data-a]')].map(b => b.dataset.a + ':' + b.dataset.id).join();
      const chk = () => { const c = document.querySelector('#lokScr .card').getBoundingClientRect(); if (c.right > innerWidth + 1 || c.left < -1 || c.bottom > innerHeight + 1 || rows.scrollWidth > rows.clientWidth + 1) o.bad.push('taşma'); rows.querySelectorAll('button').forEach(b => { if (b.offsetHeight && b.offsetHeight < 44) o.bad.push(b.innerText + ' h=' + b.offsetHeight); }); };
      chk();
      const c0 = BT.S.cash; rows.querySelector('button[data-a="slrm"][data-id="s0"]').click(); o.cf = rows.querySelector('button[data-a="slrm"][data-id="s0"]').innerText; o.still = !!q.sl[0];
      rows.querySelector('button[data-a="slrm"][data-id="s0"]').click(); o.gone = !q.sl[0]; o.paid = Math.round(BT.S.cash - c0);
      rows.querySelector('button[data-a="buy"][data-id="lok_s0_izgara"]').click(); rows.querySelector('button[data-a="buy"][data-id="lok_s0_izgara"]').click(); o.built = q.sl[0] && q.sl[0].k + q.sl[0].lv;
      o.sel = !!rows.querySelector('button[data-id="lok_s1_tava"]');
      chk();
      BT.setLang('en'); L.renderPanel(); o.en = rows.innerText.replace(/\s+/g, ' '); chk(); BT.setLang('tr');
      L.closePanel();
      return o;
    });
    ok(/OCAK YERLERİ 1\/2/.test(pn.txt) && /Ocak yeri 1 · Kızgın Tava/.test(pn.txt) && /YÜKSELT/.test(pn.txt) && /DÜŞÜR/.test(pn.txt) && /SÖK/.test(pn.txt) && /Ocak yeri 2 \(boş\)/.test(pn.txt) && /Lokanta Sv 2 olunca açılır/.test(pn.txt) && /Lokanta Sv 3 olunca açılır/.test(pn.txt), 'İSTASYONLAR: yer kartları (dolu/boş/kilitli): ' + pn.txt.slice(0, 400));
    ok(/lok_s1_tava/.test(pn.btn) && /lok_s1_izgara/.test(pn.btn) && /lok_s1_tencere/.test(pn.btn) && /lok_s1_firin/.test(pn.btn) && /sldown:s0/.test(pn.btn) && /slrm:s0/.test(pn.btn) && /buy:lok_s0(,|$)/.test(pn.btn), 'boş yerde 4 tür KUR, dolu yerde YÜKSELT/DÜŞÜR/SÖK: ' + pn.btn);
    ok(pn.cf === 'ONAYLA?' && pn.still && pn.gone && pn.paid === 2500 && pn.built === 'izgara1' && pn.sel, 'SÖK iki dokunuşla (%50 iade), boşalan yere yeni tür kurulur: ' + JSON.stringify(pn).slice(0, 300));
    ok(/STOVE SLOTS/.test(pn.en) && /REMOVE/.test(pn.en) && /DOWNGRADE/.test(pn.en) && /Opens at restaurant Lv 2/.test(pn.en) && !/\blk[A-Z]\w+/.test(pn.en), 'EN yer kartları: ' + pn.en.slice(0, 200));
    ok(pn.bad.length === 0, 'İSTASYONLAR 390x844 taşmaz, düğmeler >= 44 px: ' + pn.bad.join('; '));
    await shot(p, 'ocak-yerleri');
    await p.close();
  }

  /* ===== 20) v2.23 SAZ KÖŞESİ: pahalı (Sv5), günlük yevmiye (gün kartında), ödenmezse ertesi gün çalmaz ve etkisi durur; turist / iş yemeği
     daha sık; sabit sazcı (drawLokFix musician/play); bir iki kısa ezgi; eski kayıtta bir kez bilgi. KAPALI rozeti yalnız klasikte; fazla aşçı "boşta" ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'], lv: 5 });
    const z = await p.evaluate(() => {
      const L = BT.lok, o = {}, d = L.DC.find(x => x.id === 'saz'), K = ['turist', 'is', 'aile', 'kahve'];
      o.cost = L.cost('lok_d_saz'); o.lv = d.lv; o.eff = d.eff;
      const w0 = K.map(k => L.gw(k)); L.buy('lok_d_saz'); o.on = L.dcOn('saz'); const w1 = K.map(k => L.gw(k)); o.w = [w0.join(), w1.join()];
      L.openPanel('sus'); o.row = [...document.querySelectorAll('#lokRows .trow')].map(r => r.innerText.replace(/\s+/g, ' ')).find(t => /Saz Köşesi/.test(t)) || ''; L.closePanel();
      const c0 = BT.S.cash; o.end = L.sazDayEnd(); o.paid = Math.round(c0 - BT.S.cash); o.fee = L.sazFee();
      BT.S.cash = 10; o.end2 = L.sazDayEnd(); o.idle = L.sazIdle(); o.tipIdle = L.eff('tip'); o.wIdle = L.gw('turist');
      BT.S.cash = 1e6; L.sazDayEnd(); o.idle2 = L.sazIdle(); o.tip = L.eff('tip');
      o.dur = [L.saz(0), L.saz(0)];
      return o;
    });
    ok(z.lv === 5 && z.cost >= 9000 && z.eff.tip === 0.08 && z.eff.pat === 0.05 && z.eff.flow === 0.04 && z.on, 'saz: pahalı (Sv5), güçlü etki: ' + JSON.stringify(z).slice(0, 200));
    ok(z.w[0] === '2,2,3,3' && z.w[1] === '3.2,3.2,3,3' && z.wIdle === 2, 'saz çalarken turist / iş yemeği ×1,6 daha sık: ' + JSON.stringify(z.w));
    ok(/günlük/.test(z.row) && z.end.paid && z.paid === z.fee && z.fee >= 75, 'SÜSLER satırında günlük yevmiye, gün sonu kasadan düşer: ' + JSON.stringify([z.row, z.end, z.paid]));
    ok(!z.end2.paid && z.idle && z.tipIdle < z.tip - 0.07 && !z.idle2, 'yevmiye ödenemezse sazcı çalmaz, etkisi durur; ödenince döner: ' + JSON.stringify(z));
    ok(z.dur.every(d => d >= 1.8 && d < 9), 'bir iki kısa ezgi (süre sn): ' + z.dur.join());
    /* gün kartı satırı */
    await p.evaluate(() => { BT.customers.length = 0; BT.endDay(); });
    let card = '';
    for (let i = 0; i < 80 && !card; i++) { card = await p.evaluate(() => { BT.customers.length = 0; BT.emek.step(0.1, 20); const e = document.getElementById('dayScr'); return e && !e.classList.contains('hidden') ? e.innerText.replace(/\s+/g, ' ') : ''; }); if (!card) await sleep(40); }
    ok(/Sazcı yevmiyesi/.test(card), 'gün kartında sazcı yevmiyesi: ' + card.slice(0, 300));
    await p.evaluate(() => document.getElementById('dayGo').click()); await sleep(300);
    await p.evaluate(() => { BT.day.phase = 'play'; BT.day.t = 10; });
    /* sabit sazcı: drawLokFix k:'saz' → musician: true, play (çalarken) */
    const dr = await p.evaluate(async () => {
      const L = BT.lok, H = window.HKA || (window.HKA = {}), old = H.drawLokFix, got = [];
      H.drawLokFix = function (o) { if (o.k === 'saz') got.push({ m: o.musician, p: o.play }); return old ? old(o) : false; };
      BT.player.x = 32; BT.player.y = 17.5; L.R.sazPlay = 0; await new Promise(r => setTimeout(r, 500));
      const a = got.slice(-1)[0]; L.R.sazPlay = 5; await new Promise(r => setTimeout(r, 400)); const b = got.slice(-1)[0];
      H.drawLokFix = old; const fine = L.fineFix(); HKG.setFine(false); const cls = L.fineFix(); HKG.setFine(true);
      return { a, b, n: got.length, fine, cls };
    });
    ok(dr.n > 0 && dr.a && dr.a.m === true && dr.a.p === false && dr.b.p === true, 'sazcı çizim sözleşmesi (musician / play): ' + JSON.stringify(dr));
    ok(dr.fine === true && dr.cls === false, 'KAPALI rozeti yalnız klasik çizimde (ince modda levhayı sanat çizer): ' + JSON.stringify(dr));
    /* eski kayıtta saz: yevmiye başlar, bir kez bilgi */
    const old = await p.evaluate(async () => {
      const d = JSON.parse(JSON.stringify(BT.buildSave())); delete d.lok.sazW; BT.lok.X.resetWorld(); BT.loadFrom(d);
      document.getElementById('toast').textContent = ''; BT.lok.dayStart(); await new Promise(r => setTimeout(r, 2600));
      const t1 = document.getElementById('toast').textContent; document.getElementById('toast').textContent = ''; BT.lok.dayStart(); await new Promise(r => setTimeout(r, 2600));
      return { t1, t2: document.getElementById('toast').textContent, w: BT.lok.q().sazW, on: BT.lok.dcOn('saz') };
    });
    ok(old.on && /yevmiye/.test(old.t1) && !/yevmiye/.test(old.t2) && old.w === 1, 'eski kayıt: saz korunur, yevmiye bir kez bildirilir: ' + JSON.stringify(old));
    /* fazla aşçı: sökünce "boşta" */
    const ck = await p.evaluate(async () => {
      const L = BT.lok; L.crew().forEach(w => L.fire(w)); L.build('s1', 'tava'); L.hire('lk_asci'); L.hire('lk_asci');
      document.getElementById('toast').textContent = ''; L.remove('s1'); await new Promise(r => setTimeout(r, 1900));
      const t = document.getElementById('toast').textContent; L.openPanel('crew'); const c = document.getElementById('lokRows').innerText.replace(/\s+/g, ' '); L.closePanel();
      return { t, idle: /boşta \(ocak yok\)/.test(c) };
    });
    ok(/boşta/.test(ck.t) && ck.idle, 'sökünce fazla aşçı için bilgi + KADRO\'da "boşta": ' + JSON.stringify(ck));
    await p.close();
  }

  /* ===== 21) v2.24 DÜKKÂN KİRASI (günlük, açılış bedelinin %3'ü × Emekçi ölçeği; Sv2 ×1,5, Sv3 ×2; lokanta Sv1–5 ×1…2), kapalı olsa da;
     gün kartında satır; ilk kesintide bilgi; eski kayıtta yeni günden; kartlarda "Kira: günlük $X → $Y"; seviye: personel +%10 hız, müşteri +%12;
     kapalı dükkânda maaş sürer ===== */
  {
    const p = await page(); await newGame(p); await prep(p);
    await kit(p, { st: ['tava'], menu: ['hamsitava'] });
    const r = await p.evaluate(() => {
      const L = BT.lok, R = BT.rent, o = {}, A = BT.areas;
      o.costs = A.map(a => a.cost).join();
      o.emek = BT.emek.on();
      o.lv1 = [1, 2, 3, 4].map(z => R.of(z)).join(); o.zones = R.zones().join(); o.iskele = R.of(0);
      A[2].lvl = 2; o.f2 = R.of(2); A[2].lvl = 3; o.f3 = R.of(2); A[2].lvl = 1;
      L.q().lv = 3; o.l3 = R.of(4); L.q().lv = 5; o.l5 = R.of(4); L.q().lv = 1;
      o.work = [R.workMul(1), (A[1].lvl = 3, R.workMul(1)), R.custMul(1), R.workMul(-1), R.workMul(4)].map(v => +v.toFixed(2)).join(); A[1].lvl = 1;
      /* kapalı dükkân da öder */
      BT.counters.forEach(c => BT.setStall(c.key, false)); window.HK_LOK_OPEN = 0; L.q().op = 0;
      BT.S.rentD = 0; BT.S.rentN = 0; const c0 = BT.S.cash; const e = R.dayEnd(); o.paid = Math.round(c0 - BT.S.cash); o.tot = e && e.tot; o.n = e && e.l.length; o.rentN = BT.S.rentN;
      BT.S.cash = 100; const e2 = R.dayEnd(); o.low = [BT.S.cash, e2.paid, e2.tot > 100].join();
      BT.S.cash = 1e6; window.HK_LOK_OPEN = 1;
      /* eski kayıt: kira yeni günden itibaren */
      const d = JSON.parse(JSON.stringify(BT.buildSave())); delete d.rent; BT.lok.X.resetWorld(); BT.loadFrom(d);
      o.oldD = [BT.S.rentD === BT.day.n + 1, R.dayEnd() === null].join();
      return o;
    });
    const vEmek = [[1300, 1], [13800, 1], [28500, 1], [46500, 0.5]].map(c => Math.round(c[0] * 0.75 * 0.03 * c[1])).join();   /* v2.21: lokanta Sv1 ×0,5 */
    ok(r.costs === '0,1300,13800,28500,98700', 'açılış bedelleri ×3 (Fümehane, Mutfak, Lokanta): ' + r.costs);
    ok(r.emek && r.lv1 === vEmek && r.iskele === 0 && r.zones === '1,2,3,4', 'kira = açılış bedelinin %3\'ü (Emekçi ölçeği), iskele kirasız: ' + JSON.stringify(r));
    ok(r.f2 === Math.round(13800 * 0.75 * 0.03 * 1.5) && r.f3 === Math.round(13800 * 0.75 * 0.03 * 2) && r.l3 === Math.round(46500 * 0.75 * 0.03 * 0.8) && r.l5 === Math.round(46500 * 0.75 * 0.03 * 1.1), 'Sv2 ×1,5, Sv3 ×2; lokanta (v2.21) Sv3 ×0,8, Sv5 ×1,1: ' + JSON.stringify(r));
    ok(r.work === '1,1.2,1.24,1,1', 'seviye etkisi: Sv3 personel +%20, müşteri +%24 (lokanta ve bölgesiz işçi hariç): ' + r.work);
    ok(r.n === 4 && r.paid === r.tot && r.rentN === 1 && r.low === '0,100,true', 'kapalı dükkân da kira öder, kasa yetmezse 0: ' + JSON.stringify(r));
    ok(r.oldD === 'true,true', 'eski kayıt: kira yeni gün başından: ' + r.oldD);
    /* kartlar: ALAN açılış, YAPI › Yükseltme, lokanta Sv satırı; gün kartı satırı */
    const k = await p.evaluate(async () => {
      const L = BT.lok, A = BT.areas, o = {};
      A[3].locked = true; BT.rebuildCounters(); L.X.openBar('area'); o.alan = (L.X.barList().find(c => c.id === 'a3') || {}).s || ''; A[3].locked = false; BT.rebuildCounters();
      L.X.openBar('build'); const sb = document.querySelector('#dpSub [data-s="up"]'); if (sb) sb.click(); await new Promise(r => setTimeout(r, 200));
      const zb = document.querySelector('#dpZone [data-z="2"]'); if (zb) zb.click(); await new Promise(r => setTimeout(r, 200));   /* v2.23: bölge çipi (Fümehane) */
      o.up = [...document.querySelectorAll('#dpCards .dcard')].map(d => d.textContent.replace(/\s+/g, ' ')).find(t => /Fümehane/.test(t)) || '';
      document.querySelector('.dtab.on') && document.querySelector('.dtab.on').click();
      L.openPanel('up'); o.lok = document.getElementById('lokRows').innerText.replace(/\s+/g, ' '); L.closePanel();
      return o;
    });
    ok(/Kira: günlük \$/.test(k.alan) && /Kira: günlük \$[\d.]+ → \$[\d.]+/.test(k.up) && /personel \+%10 hız/.test(k.up) && /müşteri \+%12/.test(k.up) && /Kira: günlük \$[\d.]+ → \$[\d.]+/.test(k.lok), 'kartlarda kira (ALAN, YAPI › Yükseltme, lokanta Sv): ' + JSON.stringify(k).slice(0, 400));
    await p.evaluate(() => { BT.S.rentD = 0; BT.customers.length = 0; BT.endDay(); });
    let card = '';
    for (let i = 0; i < 80 && !card; i++) { card = await p.evaluate(() => { BT.customers.length = 0; BT.emek.step(0.1, 20); const e = document.getElementById('dayScr'); return e && !e.classList.contains('hidden') ? e.innerText.replace(/\s+/g, ' ') : ''; }); if (!card) await sleep(40); }
    ok(/Kira \(4 dükkân\) −\$/.test(card), 'gün kartında kira satırı: ' + card.slice(0, 300));
    await p.evaluate(() => document.getElementById('dayGo').click()); await sleep(300);
    /* kapalı dükkânda maaş sürer: kapalı tezgâhın bölge personeli + KAPALI lokantanın kadrosu */
    const w = await p.evaluate(() => {
      const L = BT.lok, o = {};
      BT.day.phase = 'play'; BT.day.t = 10; window.HK_LOK_OPEN = 0; L.q().op = 0; BT.counters.forEach(c => BT.setStall(c.key, false));
      L.crew().forEach(x => L.fire(x)); BT.workers.length = 0; BT.hire('hamal', true, 1); L.hire('lk_garson'); L.hire('lk_bulasik');
      o.wt = BT.wageTotal(); o.lk = L.crew().map(x => BT.lok.X.workerWage(x)).reduce((a, b) => a + b, 0);
      const c0 = BT.S.cash; BT.emek.step(0.05, 1200); o.drop = c0 - BT.S.cash; o.exp = o.wt;               /* 60 sn = 1 dk maaş */
      window.HK_LOK_OPEN = 1; return o;
    });
    ok(w.lk > 0 && w.wt >= w.lk && Math.abs(w.drop - w.exp) <= w.exp * 0.05 + 1, 'kapalı tezgâh / kapalı lokantada maaş sürer (muafiyet yok): ' + JSON.stringify(w));
    await p.close();
  }

  console.log(JSON.stringify({ R, fail, errs: [...new Set(errs)] }, null, 1));
  await b.close();
  process.exit(fail.length || errs.length ? 1 : 0);
})();
