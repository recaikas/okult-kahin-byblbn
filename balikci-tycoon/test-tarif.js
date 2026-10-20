/* v2.18-deneme — Tarif Defteri + Menü (DEPO_REKLAM_RESTORAN_TASARIM.md §A; v2.19-deneme LOKANTA_TASARIM.md §8: menü Sahil Lokantası'na taşındı):
   1) Güveç Ocağı tezgâhlardan kalktı (TARIF_STALL = 0): ocak kartı, dünyadaki ocak, layoutRects yeri, ocak etkileşimi yok
   2) Defter büfe (restoran) yokken kilitli; büfe inşaatı bitince açılır (bir kez "menüsü Sahil Lokantası'nda" bildirimi, 🍲 düğmesi)
   3) Kiler (sınır 50; depotHasKiler() varsa 100) ve DENE (doğru/yanlış deneme, itibar, başarımlar)
   4) Sekmeler TARİFLER / DENE / KİLER / MENÜ; lokanta yokken MENÜ "Menü Sahil Lokantası'nda" bilgisi; lokanta açıkken MENÜ = S.lok.menu
      (yer sayısı = lokanta seviyesi, istasyonu kurulu tarif, ata / kaldır / taşı, MENÜYE EKLE)
   5) Balık Büfesi (restoran) artık tarif uygulamaz: menü ve kiler olsa da eski çarpansız davranış, kiler harcanmaz, yemek simgesi yok;
      personelsiz çalışır (Emekçi Mod açık)
   6) BİNA kartı "Balık Büfesi" (id restoran), "Menü:" satırı yok
   7) Kayıt: eski S.tarif.menu → lokanta menüsüne aktarılır (yalnız istasyonu kuruluysa; kalanı istasyon kurulunca); eski kayıt güvenli; eski ocaklı kayıtta bedel bir kez iade, raftaki yemek düz fileto
   8) TR ve EN metinler; kapalıyken (HK_TARIF_OFF) hiçbir şey değişmez
   Ekran görüntüsü: SC_DIR (varsayılan screenshots/restoran-menu), 390×844, tek dosya (MENÜ sekmesi).
   Kullanım: URL=http://localhost:8106/index.html node test-tarif.js */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
const SC = (process.env.SC_DIR || __dirname + '/screenshots/restoran-menu') + '/';
fs.mkdirSync(SC, { recursive: true });
const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
/* tarayıcıda: __cook(balıklar, menü, kiler) → restoran bir tur pişirir (tezgâh rafı dolu); para farkı, kiler, uçan yazılar, tabaklar */
const defCook = () => {
  window.__cook = (fishes, menu, kiler) => {
    const c = BT.counters[0], st = BT.serv().restoran, q = BT.tarif.q();
    BT.customers.length = 0; c.slots.fill(null); c.spawnT = 1e9; BT.day.t = 10; BT.workers.length = 0;
    BT.lok.q().menu.fill(null); (menu || []).forEach((id, i) => BT.tarif.setMenu(i, id));      /* menü artık lokantada; büfe uygulamaz */
    q.kiler = Object.assign({}, kiler || {});
    c.buffer.length = 0; const max = BT.counterMax(c); for (let i = 0; i < max; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    fishes.forEach((f, i) => { c.buffer[max - 1 - i] = { k: 'fileto', f: f }; });          /* sondan pop edilir: fishes[0] ilk alınır */
    BT.tarif.rfx.length = 0; BT.tarif.floats().length = 0;
    const cash0 = BT.S.cash, k0 = Object.assign({}, q.kiler); st.nextT = 0; BT.emek.step(0.05, 1);
    return { dc: BT.S.cash - cash0, k: Object.assign({}, q.kiler), k0, cooked: st.cooked, fl: BT.tarif.floats().map(f => f.txt), rfx: BT.tarif.rfx.map(r => r.d), max };
  };
};
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
    await p.evaluate(() => {
      BT.S.tut = 99; BT.S.ctrl = 2; BT.S.cash = 5000; BT.S.rep = 260; BT.achMute(true); BT.day.t = 10; BT.counters.forEach(c => { c.spawnT = 1e9; });
      window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (s && !s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 150);
    });
  };
  const noToast = p => p.evaluate(() => document.getElementById('toast').classList.remove('on'));
  const txt = (p, s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ') : ''; }, s);
  const nextDay = async p => {                           /* günü gerçekten bitir: kapanış → özet kartı → "devam" */
    await p.evaluate(() => BT.endDay());
    for (let i = 0; i < 160; i++) {
      const done = await p.evaluate(() => { BT.customers.length = 0; const e = document.getElementById('dayScr'); if (e && !e.classList.contains('hidden')) { document.getElementById('dayGo').click(); return true; } return false; });
      if (done) break; await sleep(250);
    }
    await sleep(300);
  };

  const p = await page(true);
  await newGame(p);

  /* ================= 1) Açılış: ocaksız, kilitli ================= */
  R.boot = await p.evaluate(() => ({ on: BT.tarif.on(), stall: BT.tarif.STALL(), un: BT.tarif.unlocked(), q: BT.tarif.save(), btn: !document.getElementById('tarifBtn').classList.contains('hidden'), cap: BT.tarif.cap(),
    ocakRect: BT.layoutRects().filter(r => /güveç ocağı/.test(r.id)).length, resto: BT.tarif.restoLv() }));
  ok(R.boot.on && !R.boot.stall && !R.boot.un && !R.boot.btn && R.boot.cap === 50 && R.boot.q.known.length === 0 && !Object.keys(R.boot.q.ocak).length && R.boot.q.menu.length === 5 && R.boot.q.menu.every(x => x === null), 'açılış ' + JSON.stringify(R.boot));
  ok(R.boot.ocakRect === 0 && R.boot.resto === 0, 'layoutRects hâlâ ocak yeri ayırıyor / restoran var ' + JSON.stringify(R.boot));
  R.lock = await p.evaluate(() => { BT.tarif.open('rec'); return BT.tarif.isOpen(); });
  ok(!R.lock, 'restoran yokken defter açıldı');
  await p.click('.dtab[data-t="build"]'); await sleep(150);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#dpSub button')].find(x => x.dataset.s === 'dev'); if (b) b.click(); }); await sleep(150);
  R.card0 = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')).filter(t => /Güveç/.test(t)));
  ok(R.card0.length === 0, 'YAPI › Geliştirme ocak kartı görünüyor ' + JSON.stringify(R.card0));
  await p.evaluate(() => { const t = document.querySelector('.dtab.on'); if (t) t.click(); });

  /* ================= 2) Restoran inşaatı bitince açılır ================= */
  await p.evaluate(() => {
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.customers.length = 0; BT.counters.forEach(c => { c.spawnT = 1e9; });
    window.HK_INSAAT_OFF = 0; BT.S.cash = 9e6; BT.servBuild('restoran', 'p1');                 /* gerçek inşaat: 1. seviye 1 gün */
  });
  R.ins = await p.evaluate(() => ({ lvl: BT.tarif.restoLv(), left: BT.S.insaat && BT.S.insaat.restoran && BT.S.insaat.restoran.left, un: BT.tarif.unlocked(), open: BT.tarif.q().open }));
  ok(R.ins.lvl === 0 && R.ins.left >= 1 && !R.ins.un && !R.ins.open, 'inşaat sürerken defter açık ' + JSON.stringify(R.ins));
  await p.evaluate(() => { BT.emek.step(0.05, 40); });
  ok(!(await p.evaluate(() => BT.tarif.unlocked())), 'inşaat bitmeden defter açıldı');
  await nextDay(p);
  await p.evaluate(() => BT.emek.step(0.05, 3)); await sleep(300);
  R.open = await p.evaluate(() => ({ lvl: BT.tarif.restoLv(), un: BT.tarif.unlocked(), open: BT.tarif.q().open, notif: (BT.M().notif || []).map(n => n.m).filter(m => /Tarif Defteri/.test(m)),
    btn: !document.getElementById('tarifBtn').classList.contains('hidden'), reis: BT.tarif.known('reisguveci') }));
  ok(R.open.lvl === 1 && R.open.un && R.open.open === 1 && R.open.btn && R.open.reis, 'inşaat bitince defter açılmadı ' + JSON.stringify(R.open));
  ok(R.open.notif.length === 1 && /menüsü Sahil Lokantası'nda/.test(R.open.notif[0]) && !/Güveç Ocağı kur/.test(R.open.notif[0]), 'açılış bildirimi ' + JSON.stringify(R.open.notif));
  R.open2 = await p.evaluate(() => { BT.emek.step(0.05, 60); return (BT.M().notif || []).filter(n => /Tarif Defteri açıldı/.test(n.m)).length; });
  ok(R.open2 === 1, 'bildirim tekrarlandı ' + R.open2);
  await p.evaluate(() => { BT.day.t = 10; BT.closeOverlays(); BT.S.cash = 9e6; });

  /* ================= 3) Kiler ================= */
  await p.evaluate(() => { BT.S.cash = 5000; BT.tarif.open('kiler'); }); await sleep(200);
  R.k0 = await p.evaluate(() => ({ open: BT.tarif.isOpen(), paused: BT.paused(), cash: BT.S.cash, tabs: [...document.querySelectorAll('#tfTabs .tab')].map(t => t.dataset.tt).join() }));
  ok(R.k0.open && R.k0.paused && R.k0.tabs === 'rec,try,kiler', 'defter açılmadı / sekmeler ' + JSON.stringify(R.k0));
  await p.click('#tfBody button[data-tb="misirunu"][data-tn="10"]'); await sleep(100);
  await p.click('#tfBody button[data-tb="pirinc"][data-tn="50"]'); await sleep(100);
  await p.click('#tfBody button[data-tb="sogan"][data-tn="10"]'); await sleep(100);
  R.k1 = await p.evaluate(() => ({ cash: BT.S.cash, k: Object.assign({}, BT.tarif.q().kiler) }));
  ok(R.k0.cash - R.k1.cash === 10 * 3 + 50 * 4 + 10 * 2 && R.k1.k.misirunu === 10 && R.k1.k.pirinc === 50 && R.k1.k.sogan === 10, 'kiler alımı ' + JSON.stringify({ a: R.k0, b: R.k1 }));
  await p.click('#tfBody button[data-tb="pirinc"][data-tn="10"]'); await sleep(100);        /* sınır 50: dolu */
  R.k2 = await p.evaluate(() => ({ cash: BT.S.cash, n: BT.tarif.q().kiler.pirinc, toast: document.getElementById('toast').textContent }));
  ok(R.k2.cash === R.k1.cash && R.k2.n === 50 && /dolu/.test(R.k2.toast), 'kiler sınırı 50 ' + JSON.stringify(R.k2));
  R.k3 = await p.evaluate(() => {
    const L0 = BT.DEPOT.lvl; BT.DEPOT.lvl = 0; const cap0 = BT.tarif.cap(); BT.DEPOT.lvl = 3;   /* Depo'nun Kiler bölmesi (Sv3) */
    const cap = BT.tarif.cap(), n = BT.tarif.buy('pirinc', 50), have = BT.tarif.q().kiler.pirinc;
    const c0 = BT.S.cash; BT.S.cash = 1; const no = BT.tarif.buy('domates', 10); BT.S.cash = c0;
    BT.DEPOT.lvl = 2; const capF = BT.tarif.cap(); BT.DEPOT.lvl = L0; BT.tarif.q().kiler.pirinc = 50;
    return { cap0, cap, n, have, no, capF, capNone: BT.tarif.cap(), dom: BT.tarif.q().kiler.domates | 0 };
  });
  ok(R.k3.cap0 === 50 && R.k3.cap === 100 && R.k3.n === 50 && R.k3.have === 100 && R.k3.no === 0 && R.k3.dom === 0 && R.k3.capF === 50 && R.k3.capNone === 50, 'depotHasKiler ile sınır 100 / yoksa 50 ' + JSON.stringify(R.k3));
  await p.evaluate(() => { BT.tarif.q().kiler.pirinc = 40; BT.tarif.open('kiler'); }); await noToast(p); await sleep(250);
  R.kTxt = await txt(p, '#tfBody');
  ok(/Mısır Unu/.test(R.kTxt) && /Stok 10\/50/.test(R.kTxt) && /\+50/.test(R.kTxt) && /Kiler bölmesi/.test(R.kTxt), 'KİLER sayfası ' + R.kTxt.slice(0, 200));

  /* ================= 4) DENE ================= */
  await p.click('#tfTabs .tab[data-tt="try"]'); await sleep(100);
  R.d0 = await p.evaluate(() => { const c = BT.counters[0]; c.buffer.length = 0; for (let i = 0; i < 6; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' }); BT.achMute(false);
    return { rep: BT.S.rep, k: Object.assign({}, BT.tarif.q().kiler), buf: c.buffer.length, fish: [...document.querySelectorAll('#tfBody [data-tf]')].map(b => b.dataset.tf) }; });
  ok(R.d0.fish.indexOf('hamsi') >= 0, 'DENE balıkları ' + JSON.stringify(R.d0.fish));
  await p.click('#tfBody [data-tf="hamsi"]'); await p.click('#tfBody [data-ti="pirinc"]'); await p.click('#tfCook'); await sleep(150);
  R.bad = await p.evaluate(() => ({ k: Object.assign({}, BT.tarif.q().kiler), known: BT.tarif.q().known.slice(), rep: BT.S.rep, res: document.querySelector('#tfBody .tfRes').innerText, buf: BT.counters[0].buffer.length, near: BT.tarif.near('hamsi', ['pirinc']).id }));
  ok(R.bad.k.pirinc === R.d0.k.pirinc - 1 && R.bad.k.misirunu === R.d0.k.misirunu && !R.bad.known.length && R.bad.rep === R.d0.rep && R.bad.buf === R.d0.buf, 'yanlış deneme malzemeyi/balığı yanlış harcadı ' + JSON.stringify(R.bad));
  ok(/Olmadı/.test(R.bad.res) && /Hacer Teyze/.test(R.bad.res) && /Bayram sofrasının tacı/.test(R.bad.res) && R.bad.near === 'hamsipilav', 'ipucu yok / en yakın tarif yanlış ' + JSON.stringify(R.bad));
  await p.click('#tfBody [data-ti="pirinc"]'); await p.click('#tfBody [data-ti="misirunu"]'); await p.click('#tfCook'); await sleep(700);
  R.good = await p.evaluate(() => ({ k: Object.assign({}, BT.tarif.q().kiler), known: BT.tarif.q().known.slice(), rep: BT.S.rep, res: document.querySelector('#tfBody .tfRes').innerText.replace(/\s+/g, ' '), stamp: !!document.querySelector('#tfBody .tfStamp'),
    addBtn: !!document.querySelector('#tfBody [data-tassign="hamsitava"]'), ach: BT.ach() }));
  ok(R.good.known.join() === 'hamsitava' && R.good.rep === R.d0.rep + 40 && R.good.k.misirunu === R.d0.k.misirunu, 'doğru deneme: tarif / +40 itibar / ücretsiz ' + JSON.stringify(R.good));
  ok(R.good.stamp && /YENİ TARİF!/.test(R.good.res) && /Hamsi Tava/.test(R.good.res) && /×2,0/.test(R.good.res) && !R.good.addBtn && /Menü Sahil Lokantası'nda/.test(R.good.res), 'YENİ TARİF kartı: lokanta yokken MENÜYE EKLE yok, bilgi var ' + R.good.res);
  ok(R.good.ach.indexOf('tf_sir') >= 0 && R.good.ach.indexOf('tf_sofra') < 0, 'Mutfağın Sırrı başarımı ' + JSON.stringify(R.good.ach));
  R.again = await p.evaluate(() => { const r = BT.tarif.tryCook('hamsi', ['misirunu']); return { ok: r.ok, already: r.already, rep: BT.S.rep, n: BT.tarif.q().kiler.misirunu }; });
  ok(R.again.ok && R.again.already && R.again.rep === R.good.rep && R.again.n === R.good.k.misirunu, 'bilinen tarif tekrar ' + JSON.stringify(R.again));
  R.err = await p.evaluate(() => [BT.tarif.tryCook('hamsi', []).err, BT.tarif.tryCook('yok', ['sogan']).err, BT.tarif.tryCook('hamsi', ['karalahana']).err, BT.tarif.tryCook('hamsi', ['sogan', 'pirinc', 'misirunu']).err]);
  ok(R.err.join() === 'ing,fish,stock,ing', 'DENE geçersiz giriş ' + JSON.stringify(R.err));
  R.ach4 = await p.evaluate(() => {
    ['tereyagi', 'karalahana', 'domates'].forEach(g => BT.tarif.buy(g, 10));
    const a = BT.tarif.tryCook('hamsi', ['tereyagi', 'pirinc']).ok, b2 = BT.tarif.tryCook('uskumru', ['sogan', 'pirinc']).ok, n3 = BT.tarif.found(), a3 = BT.ach().indexOf('tf_sofra') >= 0;
    const c = BT.tarif.tryCook('levrek', ['domates', 'sogan']).ok;
    const out = { a, b2, c, n3, a3, n: BT.tarif.found(), ach: BT.ach().indexOf('tf_sofra') >= 0 }; BT.achMute(true); BT.counters.forEach(q => { q.spawnT = 1e9; }); return out;
  });
  ok(R.ach4.a && R.ach4.b2 && R.ach4.c && R.ach4.n3 === 3 && !R.ach4.a3 && R.ach4.n === 4 && R.ach4.ach, 'Karadeniz Sofrası (4 tarif) ' + JSON.stringify(R.ach4));
  await p.evaluate(() => { BT.achMute(true); BT.tarif.open('rec'); }); await noToast(p); await sleep(250);
  R.recTxt = await txt(p, '#tfBody');
  ok(/Hamsi Tava/.test(R.recTxt) && /Levrek Buğulama/.test(R.recTxt) && /\?\?\?\?\?/.test(R.recTxt) && /İpucu: Büyük balığa sade sofra/.test(R.recTxt) && /Reis Güveci/.test(R.recTxt) && /Her balık \+ Soğan · fiyat ×1,3/.test(R.recTxt) && !/menüde/.test(R.recTxt) && !/tezgâhı yok/.test(R.recTxt), 'TARİFLER sayfası ' + R.recTxt.slice(0, 400));
  await p.click('#tfClose'); await sleep(100);

  /* ================= 5) MENÜ: lokanta yokken bilgi; lokanta açıkken S.lok.menu (yer = lokanta seviyesi) ================= */
  await p.evaluate(() => { BT.tarif.open('menu'); }); await sleep(200);
  R.m0 = await p.evaluate(() => ({ lok: BT.lok.open(), slots: document.querySelectorAll('#tfBody .tfMenuRow').length, t: document.querySelector('#tfBody').innerText.replace(/\s+/g, ' '), tab: [...document.querySelectorAll('#tfTabs .tab')].map(x => x.dataset.tt).join(),
    set: BT.tarif.setMenu(0, 'hamsitava'), add: BT.tarif.menuAdd('hamsitava'), l: BT.tarif.menu().length, line: BT.tarif.menuLine() }));
  ok(!R.m0.lok && R.m0.slots === 0 && R.m0.tab === 'rec,try,kiler' && !R.m0.set && R.m0.add === -1 && R.m0.l === 0, 'lokanta yokken Defter yalnız TARİFLER/DENE/KİLER, menü yok ' + JSON.stringify(R.m0));
  await p.click('#tfClose'); await sleep(100);
  /* lokanta aç: bölge + istasyonlar (tava, fırın, kazan); menüyü boşalt */
  await p.evaluate(() => {
    window.HK_LOK_OFF = 0; window.HK_LOK_EVOFF = 1; window.HK_INSAAT_OFF = 1; BT.areas[4].locked = false; BT.S.cash = 9e6; BT.lok.q();
    ['lok_tava', 'lok_firin', 'lok_tencere'].forEach(id => BT.lok.buy(id)); BT.lok.R.arr = 1e9;
    BT.lok.q().menu.fill(null); BT.tarif.open('menu');
  }); await sleep(250);
  R.m1 = await p.evaluate(() => ({ book: BT.tarif.isOpen(), panel: BT.lok.panelOpen(), slots: document.querySelectorAll('#lokRows .tfMenuRow.inm, #lokRows .tfRec.unk').length, t: document.querySelector('#lokRows').innerText.replace(/\s+/g, ' '), tab: document.querySelector('#lokTabs .tab[data-lt="menu"]').innerText.replace(/\s+/g, ' '),
    s1: BT.tarif.setMenu(1, 'hamsitava'), unk: BT.tarif.setMenu(0, 'palamutpilaki'), x: BT.tarif.setMenu(0, 'yok'), lv: BT.lok.q().lv }));
  ok(R.m1.panel && !R.m1.book && R.m1.slots === 1 && R.m1.lv === 1 && /Yer 1 · boş/.test(R.m1.t) && /Lokantanın menüsü: 0\/1 yer/.test(R.m1.t) && /porsiyon/.test(R.m1.t) && /İstasyon: Kızgın Tava/.test(R.m1.t) && /Hamsi Tava/.test(R.m1.t) && /Mısır Unu/.test(R.m1.t) && /×2,0/.test(R.m1.t) && /Reis Güveci/.test(R.m1.t) && /×1,3/.test(R.m1.t) && /MENÜ 0\/1/.test(R.m1.tab), 'MENÜ sayfası (lokanta Sv1) ' + JSON.stringify(R.m1).slice(0, 500));
  ok(!R.m1.s1 && !R.m1.unk && !R.m1.x, 'seviyeden fazla yer / bilinmeyen tarif atandı ' + JSON.stringify(R.m1));
  await p.click('#lokRows button[data-a="menu"][data-id="hamsitava"]'); await sleep(100);
  R.m2 = await p.evaluate(() => ({ m: BT.lok.q().menu.join(), tm: BT.tarif.save().menu.join(), on: !!document.querySelector('#lokRows .tfMenuRow.inm button[data-id="hamsitava"].on'), lm: BT.lok.menu().join() }));
  ok(R.m2.m === 'hamsitava,,,,' && R.m2.lm === 'hamsitava' && R.m2.on && R.m2.tm === ',,,,', 'menüye atama S.lok.menu\'ye yazılmalı ' + JSON.stringify(R.m2));
  await p.click('#lokRows button[data-a="menu"][data-id="hamsitava"]'); await sleep(100);       /* ÇIKAR */
  R.m3 = await p.evaluate(() => BT.lok.q().menu.join());
  ok(R.m3 === ',,,,', 'menüden kaldırma ' + R.m3);
  await p.click('#lokRows button[data-a="menu"][data-id="hamsitava"]'); await sleep(100);
  await p.evaluate(() => { BT.lok.buy('lok_lv'); BT.lok.buy('lok_lv'); BT.servUp('restoran'); BT.servUp('restoran'); BT.tarif.open('menu'); }); await sleep(200);   /* lokanta Sv3 → 3 yer; Balık Büfesi Lv.3 (4 mal) */
  R.m4 = await p.evaluate(() => ({ lv: BT.lok.q().lv, slots: document.querySelectorAll('#lokRows .tfMenuRow.inm, #lokRows .tfRec.unk').length, tab: document.querySelector('#lokTabs .tab[data-lt="menu"]').innerText.replace(/\s+/g, ' ') }));
  ok(R.m4.lv === 3 && R.m4.slots === 3 && /MENÜ 1\/3/.test(R.m4.tab), 'lokanta Sv3 → 3 yer ' + JSON.stringify(R.m4));
  R.m5 = await p.evaluate(() => {
    const a = BT.tarif.setMenu(1, 'hamsipilav'), b = BT.tarif.setMenu(2, 'reisguveci'), c = BT.tarif.setMenu(2, 'hamsitava');   /* hamsitava 0 → 2 taşınır (Reis üzerine yazılır) */
    return { a, b, c, m: BT.lok.q().menu.join(), l: BT.tarif.menu().map(r => r.id).join() };
  });
  ok(R.m5.a && R.m5.b && R.m5.c && R.m5.m === ',hamsipilav,hamsitava,,' && R.m5.l === 'hamsipilav,hamsitava', 'menü taşıma ' + JSON.stringify(R.m5));
  R.m6 = await p.evaluate(() => { BT.tarif.setMenu(0, 'reisguveci'); const m = BT.lok.q().menu.join(); return { m, add: BT.tarif.menuAdd('uskumrudolma'), m2: BT.lok.q().menu.join() }; });
  ok(R.m6.m === 'reisguveci,hamsipilav,hamsitava,,' && R.m6.add === -1 && R.m6.m2 === R.m6.m, 'menü dolu: ekleme reddedilmedi ' + JSON.stringify(R.m6));
  /* istasyonu kurulu olmayan tarif menüye girmez (izgara yok: orkinosizgara bilinse bile) */
  R.m7 = await p.evaluate(() => { BT.tarif.q().known.push('orkinosizgara'); BT.lok.q().menu.fill(null); return { set: BT.tarif.setMenu(0, 'orkinosizgara'), m: BT.lok.q().menu.join() }; });
  ok(!R.m7.set && R.m7.m === ',,,,', 'istasyonu olmayan tarif menüye girdi ' + JSON.stringify(R.m7));
  /* DENE sonrası MENÜYE EKLE: lokanta açık, istasyonu kurulu, boş yer var → düğme; yoksa bilgi */
  await p.evaluate(() => { BT.tarif.q().known = BT.tarif.q().known.filter(x => x !== 'palamutpilaki'); BT.tarif.q().kiler = { sogan: 9, domates: 9 }; BT.lok.q().menu.fill(null); BT.tarif.open('try'); }); await sleep(150);
  await p.click('#lokRows [data-tf="palamut"]'); await p.click('#lokRows [data-ti="sogan"]'); await p.click('#lokRows [data-ti="domates"]'); await p.click('#tfCook'); await sleep(600);
  R.add = await p.evaluate(() => ({ btn: !!document.querySelector('#lokRows [data-tassign="palamutpilaki"]'), res: document.querySelector('#lokRows .tfRes').innerText.replace(/\s+/g, ' ') }));
  ok(R.add.btn && /MENÜYE EKLE/.test(R.add.res), 'lokanta açıkken MENÜYE EKLE düğmesi ' + JSON.stringify(R.add));
  await p.click('#lokRows [data-tassign="palamutpilaki"]'); await sleep(150);
  R.add2 = await p.evaluate(() => ({ tab: document.querySelector('#lokTabs .tab.on').dataset.lt, m: BT.lok.q().menu.join(), toast: document.getElementById('toast').textContent }));
  ok(R.add2.tab === 'menu' && R.add2.m === 'palamutpilaki,,,,' && /Palamut Pilaki menüye eklendi/.test(R.add2.toast), 'MENÜYE EKLE ' + JSON.stringify(R.add2));
  await p.evaluate(() => { BT.lok.q().menu.fill(null); BT.tarif.setMenu(0, 'hamsitava'); BT.tarif.setMenu(1, 'levrekbugulama'); BT.tarif.setMenu(2, 'reisguveci'); BT.tarif.close(); BT.lok.closePanel(); });

  /* ================= 6) BİNA kartı: Balık Büfesi ================= */
  const binaCard = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')).filter(t => /Balık Büfesi/.test(t))[0] || '');
  await p.click('.dtab[data-t="serv"]'); await sleep(250);
  R.bina = await binaCard();
  ok(/Balık Büfesi/.test(R.bina) && !/Menü:/.test(R.bina) && !/ Restoran /.test(' ' + R.bina + ' '), 'BİNA kartı Balık Büfesi, Menü satırı yok: ' + R.bina);
  await p.evaluate(() => { const t = document.querySelector('.dtab.on'); if (t) t.click(); BT.closeOverlays(); });

  /* ================= 7) Balık Büfesi pişirme (Lv.3: 4 mal): artık tarif uygulamaz ================= */
  await p.evaluate(defCook);
  R.c0 = await p.evaluate(() => window.__cook(['hamsi', 'uskumru', 'hamsi', 'uskumru'], [], { misirunu: 9 }));
  ok(R.c0.cooked === 4 && R.c0.dc > 0 && R.c0.k.misirunu === 9 && R.c0.rfx.length === 0 && !R.c0.fl.some(t => /🍲/.test(t)) && R.c0.fl.some(t => /🍽/.test(t)), 'menü boşken büfe davranışı ' + JSON.stringify(R.c0));
  R.cx = await p.evaluate(() => ({
    plain: window.__cook(['hamsi', 'hamsi', 'hamsi', 'hamsi'], [], { misirunu: 9, sogan: 5 }),
    dish: window.__cook(['hamsi', 'hamsi', 'hamsi', 'hamsi'], ['hamsitava'], { misirunu: 9, sogan: 5 }),
    uskPlain: window.__cook(['uskumru', 'uskumru', 'uskumru', 'uskumru'], [], {}),
    reis: window.__cook(['uskumru', 'uskumru', 'uskumru', 'uskumru'], ['reisguveci'], { sogan: 5 }),
    both: window.__cook(['hamsi', 'uskumru', 'hamsi', 'uskumru'], ['hamsitava', 'reisguveci'], { misirunu: 9, sogan: 5 }),
    pilav: window.__cook(['hamsi', 'hamsi', 'hamsi', 'hamsi'], ['hamsipilav', 'hamsitava'], { misirunu: 9, pirinc: 9, tereyagi: 9 }),
    menu: BT.lok.q().menu.slice(), pick: BT.tarif.pick('hamsi')
  }));
  const X = R.cx, near = (a, b) => Math.abs(a - b) <= 2;
  ok(X.plain.cooked === 4 && X.plain.dc > 0 && X.plain.rfx.length === 0 && X.plain.k.misirunu === 9, 'düz pişirme ' + JSON.stringify(X.plain));
  ok(X.menu.filter(Boolean).length === 2 && X.pick === null, 'lokanta menüsü dolu ama büfe seçici null olmalı ' + JSON.stringify([X.menu, X.pick]));
  ok(near(X.dish.dc, X.plain.dc) && X.dish.k.misirunu === 9 && X.dish.k.sogan === 5 && X.dish.rfx.length === 0 && !X.dish.fl.some(t => /🍲/.test(t)), 'büfe Hamsi Tava uygulamamalı (çarpansız, kiler harcanmaz) ' + JSON.stringify([X.plain.dc, X.dish]));
  ok(near(X.reis.dc, X.uskPlain.dc) && X.reis.k.sogan === 5 && X.reis.rfx.length === 0, 'büfe Reis Güveci uygulamamalı ' + JSON.stringify([X.uskPlain.dc, X.reis]));
  ok(X.both.k.misirunu === 9 && X.both.k.sogan === 5 && X.both.rfx.length === 0, 'iki tarif de uygulanmamalı ' + JSON.stringify(X.both));
  ok(X.pilav.k.pirinc === 9 && X.pilav.k.tereyagi === 9 && X.pilav.k.misirunu === 9 && X.pilav.rfx.length === 0 && near(X.pilav.dc, X.plain.dc), 'pilav ×2,6 uygulanmamalı ' + JSON.stringify([X.plain.dc, X.pilav]));
  ok(await p.evaluate(() => BT.emek.on() && BT.workers.length === 0), 'Emekçi Mod kapalı ya da personel var (büfe personelsiz çalışmalı)');
  R.rfx = await p.evaluate(() => { window.__cook(['hamsi'], ['hamsitava'], { misirunu: 9 }); return { n0: BT.tarif.rfx.length }; });
  ok(R.rfx.n0 === 0, 'büfede tabak simgesi çıkmamalı ' + JSON.stringify(R.rfx));

  /* ================= 8) Görüntü: MENÜ sekmesi ================= */
  await p.evaluate(() => {
    BT.lok.q().menu.fill(null); BT.tarif.setMenu(0, 'hamsitava'); BT.tarif.setMenu(1, 'hamsipilav'); BT.tarif.setMenu(2, 'reisguveci');
    BT.tarif.q().kiler = { misirunu: 12, pirinc: 0, tereyagi: 4, sogan: 6 }; BT.tarif.open('menu');
  }); await noToast(p); await sleep(350);
  await p.screenshot({ path: SC + 'defter-menu-sekmesi.png' });
  await p.click('#lokClose'); await sleep(100);

  /* ================= 9) Kayıt ve yükleme ================= */
  R.snap = await p.evaluate(() => {
    const q = BT.tarif.q(); q.kiler = { misirunu: 7, pirinc: 33, sogan: 2 }; q.menu.fill(null); BT.lok.q().menu.fill(null); BT.tarif.setMenu(0, 'hamsipilav'); BT.tarif.setMenu(2, 'reisguveci');
    BT.counters.forEach(c => { c.buffer.length = 0; }); BT.customers.length = 0;
    BT.saveNow();
    const sv = JSON.parse(localStorage.getItem('balikci_slot_1'));
    return { t: sv.tarif, q: JSON.stringify(BT.tarif.save()), lm: sv.lok && sv.lok.menu.join() };
  });
  ok(R.snap.t && R.snap.t.known.length === 6 && R.snap.t.kiler.pirinc === 33 && R.snap.lm === 'hamsipilav,,reisguveci,,' && R.snap.t.menu.join() === ',,,,' && R.snap.t.open === 1 && JSON.stringify(R.snap.t.ocak) === '{}', 'kayıtta menü S.lok.menu\'de olmalı (S.tarif.menu boş) ' + JSON.stringify(R.snap.t));
  await p.reload(); await sleep(900);
  await p.click('#playBtn'); await sleep(700);
  await p.evaluate(() => { window.HK_LOK_OFF = 0; window.HK_LOK_EVOFF = 1; window.HK_INSAAT_OFF = 1; });      /* yeniden yüklemede test bayrakları sıfırlanır */
  R.load = await p.evaluate(() => ({ started: BT.S.started, q: JSON.stringify(BT.tarif.save()), un: BT.tarif.unlocked(), lvl: BT.tarif.restoLv(), lm: BT.lok.q().menu.join() }));
  ok(R.load.started && R.load.q === R.snap.q && R.load.un && R.load.lvl === 3 && R.load.lm === R.snap.lm, 'yükleme sonrası defter/menü farklı ' + JSON.stringify({ a: R.snap.q, b: R.load.q }));
  R.old = await p.evaluate(() => {
    const sv = BT.buildSave(); delete sv.tarif;
    const ok1 = BT.loadFrom(JSON.parse(JSON.stringify(sv))), s1 = BT.tarif.save(), un1 = BT.tarif.unlocked();
    BT.lok.q().menu.fill(null); BT.lok.R.arr = 1e9;
    const sv2 = BT.buildSave();
    sv2.tarif = { known: ['x', 'hamsitava', 5, 'reisguveci', 'hamsitava'], kiler: { misirunu: 'çok', pirinc: 9999, zz: 3, sogan: -4 }, menu: ['hamsitava', 'hamsitava', 'karalahana', 'reisguveci', 7, 'x', 'levrekbugulama'], sandik: 'x' };
    const ok2 = BT.loadFrom(JSON.parse(JSON.stringify(sv2))), s2 = BT.tarif.save(), lm2 = BT.lok.q().menu.join();
    const sv3 = BT.buildSave(); sv3.tarif = 'bozuk'; const ok3 = BT.loadFrom(sv3), s3 = BT.tarif.save();
    const sv4 = BT.buildSave(); sv4.tarif = { menu: 'x', known: [] }; const ok4 = BT.loadFrom(sv4), s4 = BT.tarif.save();
    /* eski büfe menüsü → lokanta menüsü: yalnız istasyonu kuruluysa girer; kalanı bekler, istasyon kurulunca girer */
    const sv5 = BT.buildSave(); sv5.lok.st.firin = 0; sv5.lok.menu = [null, null, null, null, null]; sv5.lok.lv = 3;
    sv5.tarif = { known: ['hamsitava', 'hamsipilav'], menu: ['hamsipilav', 'hamsitava', null, null, null], kiler: {}, open: 1, rs: 1 };
    const ok5 = BT.loadFrom(JSON.parse(JSON.stringify(sv5))), lm5 = BT.lok.q().menu.join(), pend5 = BT.tarif.save().menu.join(), fir5 = BT.lok.stLv('firin');
    window.HK_INSAAT_OFF = 1; BT.S.cash = 9e6; BT.lok.buy('lok_firin');
    const lm6 = BT.lok.q().menu.join(), pend6 = BT.tarif.save().menu.join();
    return { ok1, s1, un1, ok2, s2, lm2, ok3, s3, ok4, s4, ok5, lm5, pend5, fir5, lm6, pend6 };
  });
  ok(R.old.ok1 && R.old.s1.known.length === 0 && !Object.keys(R.old.s1.kiler).length && R.old.s1.menu.every(x => x === null) && R.old.un1, 'eski kayıt boş menü başlamadı ' + JSON.stringify(R.old.s1));
  ok(R.old.ok2 && R.old.s2.known.join() === 'hamsitava' && JSON.stringify(R.old.s2.kiler) === '{"pirinc":100}' && R.old.s2.menu.join() === ',,,,' && R.old.lm2 === 'hamsitava,reisguveci,,,' && JSON.stringify(R.old.s2.sandik) === '{}', 'bozuk menü düzeltilmedi / lokantaya aktarılmadı ' + JSON.stringify(R.old.s2));
  ok(R.old.ok5 && R.old.fir5 === 0 && R.old.lm5 === 'hamsitava,,,,' && R.old.pend5 === 'hamsipilav,,,,' && R.old.lm6 === 'hamsitava,hamsipilav,reisguveci,,' && R.old.pend6 === ',,,,', 'eski büfe menüsü aktarımı (istasyonu olmayan bekler, kurulunca girer) ' + JSON.stringify(R.old));
  ok(R.old.ok3 && R.old.s3.known.length === 0 && R.old.s3.menu.every(x => x === null) && R.old.ok4 && R.old.s4.menu.every(x => x === null), 'bozuk tarif alanı ' + JSON.stringify([R.old.s3, R.old.s4]));

  /* ================= 10) Eski ocaklı kayıt: bedel bir kez iade, raftaki yemek düz fileto ================= */
  R.mig = await p.evaluate(() => {
    const sv = BT.buildSave(); sv.cash = 1000;
    sv.tarif = { known: ['hamsitava'], kiler: { misirunu: 5 }, ocak: { b0: { lv: 1, r: 'hamsitava' }, b1: { lv: 1, r: null } }, sandik: {}, open: 1 };   /* ocak 1.200 + 1.800 */
    sv.q.forEach(e => { if (e[0] === 'b0') e[1] = ['fileto|hamsi|hamsitava', 'fileto|hamsi', 'fileto|hamsi|hamsipilav']; });
    const ok1 = BT.loadFrom(JSON.parse(JSON.stringify(sv)));
    const cash1 = BT.S.cash, ref1 = BT.tarif.refund(), s1 = BT.tarif.save(), dishes = BT.counters[0].buffer.filter(x => x.dish).length, len = BT.counters[0].buffer.length;
    BT.emek.step(0.05, 2); const toast = document.getElementById('toast').textContent, ref2 = BT.tarif.refund();
    const sv2 = BT.buildSave(); BT.loadFrom(JSON.parse(JSON.stringify(sv2)));                  /* ikinci yükleme: tekrar iade yok */
    return { ok1, cash1, ref1, s1, dishes, len, toast, ref2, cash2: BT.S.cash, cash2s: sv2.cash, ref3: BT.tarif.refund() };
  });
  ok(R.mig.ok1 && R.mig.ref1 === 3000 && R.mig.cash1 === 4000 && JSON.stringify(R.mig.s1.ocak) === '{}' && R.mig.s1.known.join() === 'hamsitava' && R.mig.s1.kiler.misirunu === 5, 'ocak iadesi ' + JSON.stringify(R.mig));
  ok(R.mig.dishes === 0 && R.mig.len === 3, 'raftaki yemek düz fileto olmadı ' + JSON.stringify(R.mig));
  ok(/Güveç Ocakları restorana taşındı, bedeli iade edildi/.test(R.mig.toast) && R.mig.ref2 === 0, 'iade bildirimi ' + JSON.stringify(R.mig.toast));
  ok(R.mig.ref3 === 0 && R.mig.cash2 === R.mig.cash2s, 'ikinci yüklemede tekrar iade ' + JSON.stringify(R.mig));
  R.migEn = await p.evaluate(() => {
    BT.setLang('en'); const sv = BT.buildSave(); sv.tarif = { ocak: { b0: { lv: 1, r: null } }, open: 1 };
    BT.loadFrom(JSON.parse(JSON.stringify(sv))); BT.emek.step(0.05, 2); const t = document.getElementById('toast').textContent; BT.setLang('tr'); return t;
  });
  ok(/Stew Stoves moved to the restaurant, cost refunded/.test(R.migEn), 'EN iade bildirimi ' + R.migEn);

  /* ================= 11) Yerleşim ================= */
  R.lay = await p.evaluate(() => {
    BT.project.done = true; BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    return { n: BT.layoutRects().filter(r => /güveç ocağı/.test(r.id)).length, cl: BT.layoutClashes(0.1), dec: BT.decorClearance().filter(d => !d.ok).map(d => d.id), tap: BT.tarif.q().ocak };
  });
  ok(R.lay.n === 0 && R.lay.cl.length === 0 && R.lay.dec.length === 0 && !Object.keys(R.lay.tap).length, 'yerleşim ' + JSON.stringify(R.lay));

  /* ================= 12) TR / EN ================= */
  await p.evaluate(defCook);
  R.lang = await p.evaluate(() => {
    const tr = BT.STR.tr, en = BT.STR.en, keys = Object.keys(tr).filter(k => /^tf/.test(k));
    const miss = keys.filter(k => typeof en[k] !== 'string' || !en[k].length);
    const recs = BT.tarif.list.every(r => r.n.tr && r.n.en && r.h.tr && r.h.en) && BT.tarif.ing.every(g => g.n.tr && g.n.en);
    const ach = BT.ACH.filter(a => /^tf_/.test(a.id)).map(a => a.t.en + '|' + a.d.en);
    const q = BT.tarif.q(); q.known = ['hamsitava', 'hamsipilav']; q.menu.fill(null); BT.lok.q().menu.fill(null); BT.tarif.setMenu(0, 'hamsitava'); BT.setLang('en'); BT.tarif.open('rec');
    const t1 = document.getElementById('lokScr').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('kiler'); const t2 = document.getElementById('lokRows').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('try'); const t3 = document.getElementById('lokRows').innerText.replace(/\s+/g, ' ');
    BT.tarif.open('menu'); const t4 = document.getElementById('lokScr').innerText.replace(/\s+/g, ' ');
    BT.lok.closePanel();
    const line = BT.tarif.menuLine();
    BT.tarif.q().open = 0; BT.emek.step(0.05, 2); const unl = (BT.M().notif[0] || {}).m;
    const q2 = BT.lok.q().lv; BT.tarif.open('menu'); const t5 = document.getElementById('lokScr').innerText.replace(/\s+/g, ' '); BT.lok.closePanel();
    BT.setLang('tr');
    return { n: keys.length, miss, recs, ach, t1, t2, t3, t4, t5, q2, line, unl, help: !!(BT.help().keys.indexOf('tarif') >= 0) };
  });
  ok(R.lang.n > 40 && !R.lang.miss.length && R.lang.recs, 'İngilizce metin eksik ' + JSON.stringify(R.lang.miss));
  ok(/Seaside Restaurant/.test(R.lang.t1) && /RECIPES/.test(R.lang.t1) && /PANTRY/.test(R.lang.t1) && /MENU/.test(R.lang.t1) && !/STOVES/.test(R.lang.t1) && /Fried Anchovy/.test(R.lang.t1) && /Skipper's Stew/.test(R.lang.t1) && /Any fish \+ Onion · price ×1.3/.test(R.lang.t1), 'EN defter ' + R.lang.t1.slice(0, 300));
  ok(/Cornmeal/.test(R.lang.t2) && /Collard Greens/.test(R.lang.t2) && /COOK/.test(R.lang.t3) && /Slot 1|Fried Anchovy/.test(R.lang.t4) && /Fried Anchovy/.test(R.lang.t4) && /The restaurant's menu: \d\/\d slot/.test(R.lang.t4) && R.lang.ach.join().indexOf('The Kitchen\'s Secret') >= 0 && R.lang.help, 'EN sayfalar ' + JSON.stringify([R.lang.t2.slice(0, 80), R.lang.t4.slice(0, 300)]));
  ok(!/[ğışçöüĞİŞÇÖÜ]/.test(R.lang.t2 + R.lang.t3 + R.lang.t4), 'EN sayfada Türkçe harf ' + R.lang.t4.slice(0, 300));
  ok(R.lang.line === 'Menu: Fried Anchovy' && /the menu lives in the Seaside Restaurant/.test(R.lang.unl), 'EN menü satırı / açılış ' + JSON.stringify([R.lang.line, R.lang.unl]));

  /* ================= 13) Kapalıyken (HK_TARIF_OFF): hiçbir şey değişmez ================= */
  const q = await page(false);
  await newGame(q);
  R.off = await q.evaluate(() => {
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.counters.forEach(c => { c.spawnT = 1e9; });
    window.HK_INSAAT_OFF = 1; BT.S.cash = 9e6; BT.servBuild('restoran', 'p1'); window.HK_INSAAT_OFF = 0;
    const c = BT.counters[0], st = BT.serv().restoran, tq = BT.tarif.q();
    tq.menu[0] = 'hamsitava'; tq.known.push('hamsitava'); tq.kiler.misirunu = 10;
    c.buffer.length = 0; const max = BT.counterMax(c); for (let i = 0; i < max; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    BT.tarif.rfx.length = 0; st.nextT = 0; BT.emek.step(0.05, 1);
    const buy = BT.tarif.buy('pirinc', 10), tr = BT.tarif.tryCook('hamsi', ['misirunu']);
    BT.tarif.open('rec'); BT.emek.step(0.05, 3);
    return { on: BT.tarif.on(), un: BT.tarif.unlocked(), cooked: st.cooked, k: tq.kiler.misirunu, rfx: BT.tarif.rfx.length, buy, tr: tr.err, open: BT.tarif.isOpen(), btn: !document.getElementById('tarifBtn').classList.contains('hidden'), ach: BT.ACH_IDS().filter(id => /^tf_/.test(id)), line: BT.tarif.menuLine() };
  });
  ok(!R.off.on && !R.off.un && R.off.cooked > 0 && R.off.k === 10 && R.off.rfx === 0 && R.off.buy === 0 && R.off.tr === 'off' && !R.off.open && !R.off.btn && !R.off.ach.length && R.off.line === '', 'kapalıyken tarif sistemi çalışıyor ' + JSON.stringify(R.off));

  ok(!errs.length, 'sayfa hataları: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1).slice(0, 4000));
  await b.close();
  if (fail.length) { console.log('BAŞARISIZ (' + fail.length + '):\n- ' + fail.join('\n- ')); process.exit(1); }
  console.log('test-tarif: TAMAM');
})().catch(e => { console.error(e); process.exit(1); });
