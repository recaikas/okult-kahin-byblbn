/* "Sen yokken…" (uzakta kazanç) + BAŞARIMLAR kabul testi.
   1) gerçek oynanış kancaları: çöp kovası, ilk satış (+ bölge gelir ortalaması), BT ile açma ve ödül;
   2) menü › BAŞARIMLAR sekmesi: ızgara, sayaç, gizliler "???";
   3) uzakta kazanç: müdürlü tam otomatik bölgeler, kayıt zamanı 3 sa geri → yeniden yükle → kart, üst sınırlar,
      TOPLA parayı ekler; oyun duraklar; gün / müşteri / Bölüm 1 sayacı değişmez;
   4) sıfır durumları: otomasyon yok, gelecekteki / saçma zaman damgası; formül sınırları;
   5) arka plandan dönüş (visibilitychange) + Escape kartı kapatır ve toplar;
   6) başarımlar kayıt/yüklemede korunur; eski kayıt (yeni alanlar olmadan) sorunsuz açılır.
   Yerel sunucu: npx http-server <klasör> -p 8102 -s -c-1 ; URL=http://localhost:8102/index.html node test-basarim.js */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = (process.env.SC || require('os').tmpdir()) + '/';
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const R = {};
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const vis = id => p.evaluate(id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }, id);
  const closeStall = () => p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.fill('#heroName', 'Recai'); await p.click('#heroGo'); await p.fill('#nameIn', 'Recai Balıkçılık'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]');
  await sleep(800); await closeStall();
  R.fresh = await p.evaluate(() => ({ ach: BT.ach(), card: BT.ret().card, save: 'ret' in BT.buildSave(), n: BT.ACH.length }));
  ok(!R.fresh.ach.length && !R.fresh.card && R.fresh.save && R.fresh.n >= 20, 'yeni oyun temiz başlamadı ' + JSON.stringify(R.fresh));

  /* 1a) gerçek kanca: çöp kovası (oyuncu) → gizli "Temiz Liman" + bildirim şeridi */
  R.trash = await p.evaluate(async () => {
    BT.S.ctrl = 2; const bn = BT.BINS[0], P = BT.player;
    P.carry.length = 0; for (let i = 0; i < 3; i++) P.carry.push({ k: 'fish', f: 'hamsi' });
    P.x = bn.x; P.y = bn.y + 0.4; await new Promise(r => setTimeout(r, 1400));
    P.x = 4.5; P.y = 3.2;
    return { ach: BT.ach(), pop: !document.getElementById('achPop').classList.contains('hidden'), popT: document.getElementById('achPopT').textContent };
  });
  ok(R.trash.ach.indexOf('cop') >= 0, 'çöp kovası başarımı açılmadı ' + JSON.stringify(R.trash));
  ok(R.trash.pop && /Temiz Liman/.test(R.trash.popT), 'başarım bildirimi görünmedi ' + JSON.stringify(R.trash));
  await p.screenshot({ path: SC + 'basarim-1-bildirim.png' });

  /* 1b) gerçek kanca: ilk satış → "Siftah!" + bölge gelir ortalaması birikir */
  R.sale = await p.evaluate(async () => {
    const c = BT.counters.find(q => q.key === 'b0');
    for (let i = 0; i < 12; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    const t0 = Date.now();
    while (BT.S.served < 1 && Date.now() - t0 < 40000) await new Promise(r => setTimeout(r, 300));
    await new Promise(r => setTimeout(r, 1200));
    return { served: BT.S.served, ach: BT.ach(), acc0: BT.ret().acc[0] };
  });
  ok(R.sale.served >= 1 && R.sale.ach.indexOf('ilk_satis') >= 0 && R.sale.ach.indexOf('ilk_fileto') >= 0, 'ilk satış başarımları açılmadı ' + JSON.stringify(R.sale));
  ok(R.sale.acc0 > 0, 'satış bölge gelirine işlenmedi ' + JSON.stringify(R.sale));
  /* gelir penceresi dakikalık ortalamaya dönüşür */
  R.roll = await p.evaluate(() => { const r = BT.ret(); BT.retRoll(); return { before: r.acc[0], after: BT.ret().rate[0], acc: BT.ret().acc[0] }; });
  ok(R.roll.after > 0 && R.roll.acc === 0, 'kayan ortalama güncellenmedi ' + JSON.stringify(R.roll));

  /* 1c) BT ile açma: ödül bir kez verilir, tekrar açılmaz */
  R.helper = await p.evaluate(() => {
    const c0 = BT.S.cash, first = BT.achUnlock('vip'), c1 = BT.S.cash, again = BT.achUnlock('vip'), c2 = BT.S.cash;
    return { first, again, gain: c1 - c0, gain2: c2 - c1, all: BT.achAll() };
  });
  ok(R.helper.first && !R.helper.again && R.helper.gain === 250 && R.helper.gain2 === 0, 'BT.achUnlock / ödül yanlış ' + JSON.stringify(R.helper));
  ok(['cop', 'ilk_satis', 'vip'].every(id => R.helper.all.indexOf(id) >= 0), 'cihaz geneli liste yazılmadı ' + JSON.stringify(R.helper.all));

  /* 2) menü › BAŞARIMLAR sekmesi */
  await sleep(3800);
  await p.click('#menuBtn'); await sleep(250);
  R.tabLbl = await p.textContent('#menuTabs .tab[data-t="basarim"]');
  await p.click('#menuTabs .tab[data-t="basarim"]'); await sleep(250);
  R.tab = await p.evaluate(() => {
    const cells = [...document.querySelectorAll('#tabBody .achCell')];
    const get = id => document.querySelector('#tabBody .achCell[data-a="' + id + '"]');
    return { n: cells.length, on: cells.filter(c => c.classList.contains('on')).length, head: document.querySelector('#tabBody .achHead').textContent,
      secret: get('dansci').classList.contains('secret') && /\?\?\?/.test(get('dansci').textContent),
      cop: get('cop').classList.contains('on') && /Temiz Liman/.test(get('cop').textContent),
      paused: BT.paused(), tabs: document.querySelectorAll('#menuTabs .tab').length,
      clipped: [...document.querySelectorAll('#menuTabs .tab')].some(t => t.scrollWidth > t.clientWidth + 1),
      overflow: [...document.querySelectorAll('#menuTabs .tab')].some(t => t.getBoundingClientRect().right > document.getElementById('menuScreen').querySelector('.card').getBoundingClientRect().right) };
  });
  await p.screenshot({ path: SC + 'basarim-2-sekme.png' });
  ok(R.tab.n === (await p.evaluate(() => BT.ACH.length)) && R.tab.on === (await p.evaluate(() => BT.ach().length)), 'sekme ızgarası eksik ' + JSON.stringify(R.tab));
  ok(R.tabLbl === 'BAŞARIM' && new RegExp(R.tab.on + '/' + R.tab.n).test(R.tab.head), 'sekme başlığı / sayaç yanlış ' + R.tabLbl + ' ' + R.tab.head);
  ok(R.tab.secret && R.tab.cop && R.tab.paused && !R.tab.overflow && !R.tab.clipped, 'gizli / açık hücre ya da duraklatma yanlış ' + JSON.stringify(R.tab));
  /* İngilizce */
  await p.evaluate(() => BT.setLang('en')); await sleep(150);
  R.tabEn = await p.evaluate(() => ({ lbl: document.querySelector('#menuTabs .tab[data-t="basarim"]').textContent, head: document.querySelector('#tabBody .achHead b').textContent }));
  ok(R.tabEn.lbl === 'AWARDS' && R.tabEn.head === 'ACHIEVEMENTS', 'EN sekme metni yok ' + JSON.stringify(R.tabEn));
  await p.evaluate(() => BT.setLang('tr'));
  await p.click('#closeMenu'); await sleep(200);

  /* 3) uzakta kazanç kurulumu: iki bölge müdürlü tam otomatik, üçüncüsü elde */
  R.setup = await p.evaluate(() => {
    const S = BT.S; S.cash = 5000; BT.HUT.lvl = 3;                   /* bölge kadrosu yüklemede sığsın */
    BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    for (let z = 0; z < 3; z++) ['hamal', 'filetocu', 'tezgahtar', 'kasiyer'].forEach(r => BT.hire(r, true, z));
    S.mgr = [{ n: 'Sadık Bey', a: 'value', b: 'wspeed', wage: 35, look: 0 }, { n: 'Gülten Hanım', a: 'pat', b: 'flow', wage: 45, look: 1 }];
    S.auto = [true, true, false];
    BT.retSet([600, 900, 400], 3000);
    BT.achCheck();
    return { auto: [0, 1, 2].map(z => BT.zoneAuto(z)), w: [0, 1].map(z => BT.zoneWagePM(z)) };
  });
  ok(R.setup.auto[0] && R.setup.auto[1] && !R.setup.auto[2], 'otomasyon kurulamadı ' + JSON.stringify(R.setup));
  /* formül sınırları (bellekte) */
  R.f = await p.evaluate(() => {
    const K = BT.RET_K, v = s => BT.retCompute(s).v;
    return { neg: v(-3600), nan: v(NaN), short: v(K.MIN - 1), absurd: v(K.ABSURD + 10), h2: v(7200), h4: v(4 * 3600), h8: v(8 * 3600), h20: v(20 * 3600), h3: BT.retCompute(3 * 3600) };
  });
  ok(!R.f.neg && !R.f.nan && !R.f.short && !R.f.absurd, 'negatif / saçma süre sıfır değil ' + JSON.stringify(R.f));
  ok(R.f.h2 > 0 && R.f.h4 < R.f.h2 * 2 && R.f.h8 === R.f.h20, 'azalan getiri / 8 sa sınırı yok ' + JSON.stringify(R.f));
  ok(R.f.h8 <= 3000 * 8 && R.f.h3.perMin <= 3000 / 60 + 1e-6, 'saatte bir günlük gelir sınırı aşıldı ' + JSON.stringify(R.f));
  ok(R.f.h3.zones.length === 2, 'kartta iki bölge olmalı ' + JSON.stringify(R.f.h3));

  /* kaydet → zaman damgasını 3 sa geri al → yeniden yükle */
  const shiftSave = (ms, mut) => p.evaluate(({ ms, mut }) => {
    BT.saveNow();
    const k = 'balikci_slot_' + BT.slot(), d = JSON.parse(localStorage.getItem(k));
    if (mut === 'noauto') d.auto = [0, 0, 0];
    d.ret.t = ms === 'absurd' ? 1000 : d.ret.t + ms; d.at = d.ret.t;
    localStorage.setItem(k, JSON.stringify(d));
    BT.S.started = false;                                 /* yenilemede beforeunload kaydı damgayı ezmesin */
    return { t: d.ret.t, cash: d.cash, day: d.day[0], served: d.served };
  }, { ms, mut });
  const reloadPlay = async () => {
    await p.reload(); await sleep(1200);
    if (await vis('introScr')) await p.click('#introSkip');
    await p.click('#playBtn'); await sleep(300);
    if (await vis('slotScr')) await p.click('#slotRows .sb[data-n="1"]');
    if (await vis('autoScr')) await p.click('#autoOpts button[data-m="10"]');
    await sleep(700);
  };
  R.chBefore = await p.evaluate(() => BT.chapter().d);
  R.saved = await shiftSave(-3 * 3600 * 1000);
  await reloadPlay();
  R.card = await p.evaluate(() => ({ r: BT.ret(), paused: BT.paused(), rows: document.querySelectorAll('#offRows .row').length, txt: document.getElementById('offScr').innerText.replace(/\s+/g, ' '),
    cash: BT.S.cash, day: BT.day.n, served: BT.S.served, cust: BT.customers.length, ch: BT.chapter().d, ach: BT.ach() }));
  await p.screenshot({ path: SC + 'basarim-3-senyokken.png' });
  console.log('kart:', R.card.txt, JSON.stringify(R.card.r));
  const effMin = (7200 + (3 * 3600 - 7200) * 0.4) / 60, expect = 50 * effMin;   /* bölge hızları 180+270=450/dk > gün sınırı 3000/60=50/dk */
  ok(R.card.r.card && R.card.paused && R.card.rows === 2, 'kart açılmadı / oyun durmadı ' + JSON.stringify(R.card));
  ok(R.card.r.cardV >= expect * 0.97 && R.card.r.cardV <= expect * 1.02, 'kazanç beklenen aralıkta değil ' + R.card.r.cardV + ' ~ ' + expect);
  ok(/SEN YOKKEN/.test(R.card.txt) && /Sadık Bey/.test(R.card.txt) && /Gülten Hanım/.test(R.card.txt) && /TOPLA/.test(R.card.txt), 'kart metni eksik');
  ok(R.card.day === R.saved.day && R.card.served === R.saved.served && R.card.cust === 0 && R.card.ch === R.chBefore, 'uzakta kazanç gün / müşteri / Bölüm 1 sayacını değiştirdi ' + JSON.stringify({ c: R.card, s: R.saved }));
  ok(['cop', 'ilk_satis', 'vip'].every(id => R.card.ach.indexOf(id) >= 0), 'başarımlar yeniden yüklemede kayboldu ' + JSON.stringify(R.card.ach));
  /* TOPLA */
  if (!R.card.r.card) { console.log(JSON.stringify(R)); console.log('BASARIM_FAIL', fail); process.exit(1); }
  const c0 = await p.evaluate(() => BT.S.cash);
  await p.click('#offGo'); await sleep(150);
  R.got = await p.evaluate(c0 => ({ gain: BT.S.cash - c0, card: BT.ret().card, paused: BT.paused(), ach: BT.ach().indexOf('sen_yokken') >= 0,
    slotCash: JSON.parse(localStorage.getItem('balikci_slot_' + BT.slot())).cash }), c0);
  ok(Math.abs(R.got.gain - R.card.r.cardV) < 30 && !R.got.card && !R.got.paused && R.got.ach, 'TOPLA parayı eklemedi ' + JSON.stringify(R.got));
  ok(R.got.slotCash >= c0 + R.card.r.cardV - 30, 'toplanan para kaydedilmedi');
  await sleep(1500);

  /* 4) sıfır durumları: gelecekteki zaman, saçma eski zaman, otomasyon yok */
  for (const [name, ms, mut] of [['future', 3 * 3600 * 1000], ['absurd', 'absurd'], ['noauto', -3 * 3600 * 1000, 'noauto']]) {
    await shiftSave(ms, mut); await reloadPlay();
    R[name] = await p.evaluate(() => ({ card: BT.ret().card, paused: BT.paused(), started: BT.S.started }));
    ok(R[name].started && !R[name].card && !R[name].paused, name + ': kart açılmamalıydı ' + JSON.stringify(R[name]));
  }
  /* otomasyonu geri aç */
  await p.evaluate(() => { BT.S.auto = [true, true, false]; BT.retSet([600, 900, 400], 3000); });

  /* 5) arka plandan 20 dk sonra dönüş → kart; Escape kapatır ve toplar */
  R.bg = await p.evaluate(() => {
    const real = Date.now;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
    Date.now = () => real() + 20 * 60 * 1000;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'));
    Date.now = real; delete document.hidden;
    return { card: BT.ret().card, v: BT.ret().cardV, paused: BT.paused(), cash: BT.S.cash };
  });
  ok(R.bg.card && R.bg.v > 0 && R.bg.paused, 'arka plandan dönüşte kart yok ' + JSON.stringify(R.bg));
  await p.keyboard.press('Escape'); await sleep(150);
  R.esc = await p.evaluate(() => ({ card: BT.ret().card, paused: BT.paused(), cash: BT.S.cash, menu: !document.getElementById('menuScreen').classList.contains('hidden') }));
  ok(!R.esc.card && !R.esc.paused && !R.esc.menu && Math.abs(R.esc.cash - R.bg.cash - R.bg.v) < 30, 'Escape kartı kapatıp toplamadı ' + JSON.stringify({ bg: R.bg, esc: R.esc }));
  /* kısa (5 dk altı) ayrılık: kart yok */
  R.bgShort = await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden; return BT.ret().card;
  });
  ok(!R.bgShort, 'kısa ayrılıkta kart açıldı');

  /* 6) gün sonu kancası: pazar günü rekoru + ortalama */
  R.day = await p.evaluate(() => { BT.retDayEnd({ n: 5, market: true, inc: 2600, served: 25, lost: 0, auc: null }); return { ach: BT.ach(), best: BT.ret().bestMkt }; });
  ok(R.day.ach.indexOf('pazar_rekor') >= 0 && R.day.ach.indexOf('kusursuz_gun') >= 0 && R.day.best === 2600, 'gün sonu başarımları açılmadı ' + JSON.stringify(R.day));
  await ctx.close();

  /* 7) eski kayıt (ret / ach alanı yok) → sorunsuz açılır, kart yok, sekme çizilir */
  const c2 = await b.newContext({ viewport: { width: 430, height: 860 } });
  await c2.addInitScript(() => { if (!localStorage.getItem('__old')) { localStorage.setItem('__old', '1');
    localStorage.setItem('balikci_slot_1', JSON.stringify({ v: 6, at: Date.now() - 5 * 3600 * 1000, cash: 1234, rep: 15, company: 'Eski Kayıt', runId: 'old1', ctrl: 2, served: 120, earned: 4000, auto: [1, 0, 0], met: ['caner', 'pelin'], day: [4, 20, 0], autoMin: 10, areas: [[0, 2], [0, 1], [1, 1]] }));
    localStorage.setItem('balikci_last', '1'); } });
  const p2 = await c2.newPage(); const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(URL); await sleep(1200);
  await p2.click('#playBtn'); await sleep(1500);
  R.old = await p2.evaluate(() => ({ started: BT.S.started, cash: Math.round(BT.S.cash), card: BT.ret().card, co: BT.S.company, ach: BT.ach() }));
  await p2.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await sleep(1300);
  R.old.ach2 = await p2.evaluate(() => BT.ach());
  await p2.evaluate(() => BT.openMenu()); await p2.click('#menuTabs .tab[data-t="basarim"]'); await sleep(200);
  R.old.cells = await p2.evaluate(() => document.querySelectorAll('#tabBody .achCell').length);
  R.old.saved = await p2.evaluate(() => { BT.saveNow(); const d = JSON.parse(localStorage.getItem('balikci_slot_1')); return !!d.ret && Array.isArray(d.ret.a) && d.ret.a.length; });
  ok(R.old.started && R.old.co === 'Eski Kayıt' && !R.old.card && R.old.cells > 0 && !e2.length, 'eski kayıt açılmadı ' + JSON.stringify(R.old) + e2.join('|'));
  ok(R.old.ach2.indexOf('musteri_100') >= 0 && R.old.ach2.indexOf('pazar_acik') >= 0 && R.old.saved > 0, 'eski kayıtta durum başarımları geriye dönük açılmadı ' + JSON.stringify(R.old));
  await c2.close();
  await b.close();
  console.log(JSON.stringify(R, (k, v) => k === 'txt' ? undefined : v));
  console.log('errs', errs);
  ok(!errs.length, 'sayfa hatası: ' + errs.join(' | '));
  console.log(fail.length ? 'BASARIM_FAIL ' + JSON.stringify(fail, null, 1) : 'BASARIM_OK');
  process.exit(fail.length ? 1 : 0);
})();
