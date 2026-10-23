/* v2.18-deneme — İLAN BÜROSU / Ad Bureau (DEPO_REKLAM_RESTORAN_TASARIM.md Bölüm C)
   1) YAPI › Meydan kartından kurulum + inşaat (Sv1 1 gün, yükseltme 2 gün; eski seviye çalışır)   2) yerleşim (çakışma yok, kapıya yürünür)
   3) seviye kilitleri   4) yayınlama: para, fiyat = taban × (1 + 0,4 × itibar seviyesi), panel düğmesi   5) aynı anda 1 (Sv3'te 2)
   6) etki: müşteri gelme hızı ölçümü (tellal +15, kahve +10 & sabır +10, gazete +25, dolmuş +30 yol, radyo +40, panayır ×2 + turist)
   7) gün sonunda süre azalır, biten reklam toast + kalkar   8) billboard metni (afiş / İLAN VERİN)   9) tellal / gazeteci / dolmuş görünür, 12 replik
   10) HUD rozeti, kapıda düğme, binaya dokunma   11) kayıt/yükleme (eski ve bozuk kayıt güvenli)   12) TR/EN.   Ekran görüntüsü: screenshots/ilan/ (390x844). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
const SC = (process.env.SC || __dirname + '/screenshots/ilan') + '/';
require('fs').mkdirSync(SC, { recursive: true });
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|Failed to load resource/.test(m.text())) errs.push('C:' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  const R = {};
  const q = (f, a) => p.evaluate(f, a);
  const prep = () => q(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 9e6; S.tut = 99; S.rep = 1e6; S.lvFloor = 10;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9);
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); const q = document.getElementById('prepScr'); if (q && !q.classList.contains('hidden')) document.getElementById('prepGo').click(); }, 150);
    window.__toasts = []; new MutationObserver(() => { const t = document.getElementById('toast').textContent; if (t) window.__toasts.push(t); }).observe(document.getElementById('toast'), { childList: true, characterData: true, subtree: true });
    window.HK_INSAAT_OFF = 0;
  });
  await prep();
  const nextDay = async () => {
    for (let i = 0; i < 80; i++) { if (await q(() => BT.day.phase === 'play')) break; await sleep(250); }
    await q(() => BT.endDay());
    for (let i = 0; i < 160; i++) {
      const done = await q(() => { BT.customers.length = 0; const e = document.getElementById('dayScr'); if (e && !e.classList.contains('hidden')) { document.getElementById('dayGo').click(); return true; } return false; });
      if (done) break; await sleep(250);
    }
    await sleep(1100);
  };
  const openTab = async tab => { const cur = await q(() => { const t = document.querySelector('.dtab.on'); return t ? t.dataset.t : ''; }); if (cur !== tab) await p.click('.dtab[data-t="' + tab + '"]'); await sleep(250); };
  const meydan = async () => { await openTab('build'); await p.click('#dpSub button[data-s="meydan"]'); await sleep(250); return q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); };
  const closeBar = () => q(() => { const t = document.querySelector('.dtab.on'); if (t) t.click(); });
  const buyCard = async re => {
    await q(re => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => new RegExp(re).test(x.innerText)); c.querySelector('.buy').click(); }, re.source);
    await sleep(200);
    await q(re => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => new RegExp(re).test(x.innerText)); const bt = c && c.querySelector('.buy'); if (bt && /ONAY|CONFIRM/i.test(bt.innerText)) bt.click(); }, re.source);
    await sleep(300);
  };
  const step = (sec, dt = 0.1) => q(([s, d]) => { BT.emek.step(d, Math.round(s / d)); }, [sec, dt]);

  /* ---- 0) kurulmadan: büro yok, billboard eski, ilan verilemez ---- */
  R.pre = await q(() => ({ built: BT.ilan.built(), why: BT.ilan.why('tellal'), cust: BT.ilan.cust(), flow: BT.roadFlow(), ads: BT.S.ads, lv: BT.S.adLv }));
  ok(!R.pre.built && R.pre.why === 'none' && R.pre.cust === 1 && R.pre.flow === 0 && R.pre.ads.length === 0 && R.pre.lv === 0, 'başlangıç durumu yanlış ' + JSON.stringify(R.pre));

  /* ---- 1) kurulum + inşaat: kart → Sv1 1 gün ---- */
  const d0 = await q(() => BT.day.n);
  const cash0 = await q(() => BT.S.cash);
  const c0 = await meydan();
  R.card0 = c0.filter(t => /İlan Bürosu/.test(t));
  ok(c0.some(t => /İlan Bürosu/.test(t) && /Tellal/.test(t)), 'meydan kartı yok / Sv1 açıklaması yok ' + JSON.stringify(R.card0));
  await buyCard(/İlan Bürosu/);
  R.s1 = await q(() => ({ lv: BT.ilan.lv(), ins: JSON.parse(JSON.stringify(BT.S.insaat)), cash: BT.S.cash, why: BT.ilan.why('tellal') }));
  ok(R.s1.lv === 0 && R.s1.ins.ads && R.s1.ins.ads.lv === 1 && R.s1.ins.ads.left === 1, 'inşaat başlamadı / hemen kuruldu ' + JSON.stringify(R.s1));
  const need = await q(() => BT.upCost(BT.ilan.LV[0].c));
  ok(need > 0 && cash0 - R.s1.cash <= need && cash0 - R.s1.cash >= need - 1000,   /* başarım ödülleri araya girebilir */
     'kurulum parası düşmedi ' + (cash0 - R.s1.cash) + ' / ' + need);
  ok(R.s1.why === 'none', 'inşaattaki büroda ilan verilebiliyor');
  const c1 = await meydan(); R.card1 = c1.filter(t => /İlan Bürosu/.test(t));
  ok(c1.some(t => /İlan Bürosu/.test(t) && /İnşaatta · 1 gün/.test(t)), 'kart inşaatta kilitli değil ' + JSON.stringify(R.card1));
  await closeBar();
  await nextDay();
  R.s2 = await q(() => ({ day: BT.day.n, lv: BT.ilan.lv(), ins: JSON.parse(JSON.stringify(BT.S.insaat)), toast: window.__toasts.join('|') }));
  ok(R.s2.day === d0 + 1 && R.s2.lv === 1 && !R.s2.ins.ads, 'Sv1 1 gün sonra hazır değil ' + JSON.stringify(R.s2));
  ok(/İlan Bürosu hazır/.test(R.s2.toast), 'hazır bildirimi yok: ' + R.s2.toast);
  /* yükseltme: Sv2 → 2 gün; Sv1 çalışır (tellal yayınlanır) */
  const c2 = await meydan(); R.card2 = c2.filter(t => /İlan/.test(t));
  ok(c2.some(t => /İlan Bürosu/.test(t) && /Sv1→2|Seviye ?1→2|1→2/.test(t) && /Liman Gazetesi/.test(t)), 'Sv2 kartı / açıklaması yok ' + JSON.stringify(R.card2));
  ok(c2.some(t => /Reklam Ver/.test(t) && /İLAN VER/.test(t)), '"Reklam Ver" kartı yok ' + JSON.stringify(R.card2));
  await buyCard(/İlan Bürosu/);
  R.up = await q(() => ({ lv: BT.ilan.lv(), ins: JSON.parse(JSON.stringify(BT.S.insaat)), why: BT.ilan.why('tellal'), whyG: BT.ilan.why('gazete') }));
  ok(R.up.lv === 1 && R.up.ins.ads && R.up.ins.ads.lv === 2 && R.up.ins.ads.left === 2, 'Sv2 yükseltmesi 2 gün değil ' + JSON.stringify(R.up));
  ok(R.up.why === '' && R.up.whyG === 'lv', 'yükseltme sürerken eski seviye çalışmıyor ' + JSON.stringify(R.up));
  await closeBar();

  /* ---- 2) yerleşim ---- */
  R.lay = await q(() => ({ clash: BT.layoutClashes(0.1).filter(c => /İlan/.test(c)), all: BT.layoutClashes(0.1), door: BT.canStand(BT.ilan.AD.door.x, Math.min(BT.ilan.AD.door.y, 10.45)), at: [BT.ilan.AD.x, BT.ilan.AD.y], decor: BT.decorClearance().filter(d => !d.ok).map(d => d.id) }));
  ok(R.lay.all.length === 0, 'yerleşim çakışması: ' + R.lay.all.join(', '));
  ok(R.lay.door, 'kapının önünde durulamıyor');
  ok(R.lay.decor.length === 0, 'süs mesafesi: ' + R.lay.decor.join(','));

  /* ---- 3) seviye kilitleri (Sv1 çalışır durumda: büro seviyesi 1'e getir, inşaat kaydı sil) ---- */
  await q(() => { delete BT.S.insaat.ads; BT.S.adLv = 1; BT.S.cash = 9e6; });
  R.lock1 = await q(() => BT.ilan.LIST.map(d => d.id + ':' + BT.ilan.why(d.id)));
  ok(R.lock1.join() === 'tellal:,kahve:,gazete:lv,dolmus:lv,radyo:lv,panayir:lv', 'Sv1 kilitleri yanlış ' + R.lock1.join());
  await q(() => { BT.S.adLv = 2; });
  R.lock2 = await q(() => BT.ilan.LIST.map(d => d.id + ':' + BT.ilan.why(d.id)));
  ok(R.lock2.join() === 'tellal:,kahve:,gazete:,dolmus:,radyo:lv,panayir:lv', 'Sv2 kilitleri yanlış ' + R.lock2.join());
  await q(() => { BT.S.adLv = 1; });
  const lockBuy = await q(() => { const c = BT.S.cash; const r = BT.ilan.buy('radyo'); return { r, same: c === BT.S.cash, n: BT.S.ads.length }; });
  ok(!lockBuy.r && lockBuy.same && lockBuy.n === 0, 'kilitli reklam satın alındı ' + JSON.stringify(lockBuy));

  /* ---- 4) yayınlama: para + fiyat formülü ---- */
  R.price = await q(() => {
    const out = [], S = BT.S;
    [[0, 'a'], [20, 'b'], [150, 'c'], [700, 'd'], [1e6, 'e']].forEach(([rep]) => {
      S.rep = rep; const rl = BT.repLevel();
      const exp = BT.ilan.LIST.map(d => Math.round(d.base * (1 + 0.4 * rl)));
      out.push({ rep, rl, ok: BT.ilan.LIST.every((d, i) => BT.ilan.price(d.id) === exp[i]), tellal: BT.ilan.price('tellal') });
    });
    S.rep = 1e6; return out;
  });
  ok(R.price.every(r => r.ok), 'fiyat formülü yanlış ' + JSON.stringify(R.price));
  ok(R.price[0].tellal === 1500 * 1.4 && R.price[0].rl === 1, 'seviye-1 fiyatı 2100 değil ' + JSON.stringify(R.price[0]));
  ok(new Set(R.price.map(r => r.rl)).size >= 4, 'itibar seviyeleri farklılaşmadı ' + JSON.stringify(R.price));
  R.pub = await q(() => {
    const S = BT.S, p = BT.ilan.price('tellal'), before = S.cash, r = BT.ilan.buy('tellal');
    return { r, paid: before - S.cash, p, ads: JSON.parse(JSON.stringify(S.ads)), chip: BT.ilan.chip(), live: BT.ilan.live('tellal'), cust: BT.ilan.cust(), toast: document.getElementById('toast').textContent };
  });
  ok(R.pub.r && R.pub.paid === R.pub.p && R.pub.ads.length === 1 && R.pub.ads[0].id === 'tellal' && R.pub.ads[0].left === 1, 'yayınlama para/süre yanlış ' + JSON.stringify(R.pub));
  ok(Math.abs(R.pub.cust - 1.15) < 1e-9 && R.pub.chip === '📣 1 gün' && /Tellal yayında/.test(R.pub.toast), 'etki/rozet/toast yanlış ' + JSON.stringify(R.pub));
  /* yetersiz para */
  R.poor = await q(() => { BT.S.cash = 100; const r = BT.ilan.buy('kahve'); return { r, cash: BT.S.cash, why: BT.ilan.why('kahve'), n: BT.S.ads.length }; });
  ok(!R.poor.r && R.poor.cash === 100 && R.poor.n === 1, 'parasız yayınlandı ' + JSON.stringify(R.poor));

  /* ---- 5) aynı anda 1 (Sv3'te 2) ---- */
  R.one = await q(() => { BT.S.cash = 9e6; const w = BT.ilan.why('kahve'), r = BT.ilan.buy('kahve'), w2 = BT.ilan.why('tellal'); return { w, r, w2, n: BT.S.ads.length, slots: BT.ilan.slots() }; });
  ok(R.one.w === 'full' && !R.one.r && R.one.n === 1 && R.one.slots === 1 && R.one.w2 === 'live', 'Sv1/2 tek reklam kuralı yanlış ' + JSON.stringify(R.one));
  /* Sv3'e yükselt (inşaat bayrağı kapalı: anında) ve iki reklam */
  await q(() => { window.HK_INSAAT_OFF = 1; });
  await meydan(); await buyCard(/İlan Bürosu/);       /* Sv1→2 */
  await meydan(); await buyCard(/İlan Bürosu/);       /* Sv2→3 */
  await closeBar();
  await q(() => { window.HK_INSAAT_OFF = 0; });
  R.three = await q(() => { const lv = BT.ilan.lv(); BT.S.cash = 9e6; const r1 = BT.ilan.buy('kahve'), r2 = BT.ilan.buy('radyo'), w = BT.ilan.why('panayir'); return { lv, slots: BT.ilan.slots(), r1, r2, w, ads: BT.ilan.ads().map(a => a.id).join(), chip: BT.ilan.chip(), cust: BT.ilan.cust(), pat: BT.ilan.pat() }; });
  ok(R.three.lv === 3 && R.three.slots === 2 && R.three.r1 && !R.three.r2 && R.three.w === 'full' && R.three.ads === 'tellal,kahve', 'Sv3 iki reklam kuralı yanlış ' + JSON.stringify(R.three));
  ok(Math.abs(R.three.cust - (1 + 0.15 + 0.10)) < 1e-9 && Math.abs(R.three.pat - 0.10) < 1e-9 && R.three.chip === '📣 1 gün · 2 gün', 'iki reklam etkisi/rozet ' + JSON.stringify(R.three));

  /* ---- 6) etki: müşteri gelme hızı ölçümü (spawnT azalma hızı) ---- */
  const rate = async () => q(() => {
    const c = BT.counters.find(x => x.open) || BT.counters[0]; c.open = true;
    BT.customers.length = 0; c.spawnT = 1e7; const s0 = c.spawnT;
    BT.emek.step(0.1, 20);
    const d = s0 - c.spawnT; c.spawnT = 1e9; BT.customers.length = 0; return d;
  });
  const setAds = ids => q(ids => { BT.S.ads = ids.map(id => ({ id, left: 2 })); BT.S.adLv = 3; }, ids);
  await q(() => { BT.S.ads = []; BT.S.roadFl = 0; BT.S.roadBb = 0; BT.S.env = 0; });
  const r0 = await rate(); R.rate = { none: r0 };
  for (const [id, want] of [['tellal', 1.15], ['kahve', 1.10], ['gazete', 1.25], ['dolmus', 1.30], ['radyo', 1.40], ['panayir', 2.0]]) {
    await setAds([id]); const r = await rate(); const r1 = await (async () => { await setAds([]); return rate(); })();
    R.rate[id] = +(r / r1).toFixed(3);
    ok(Math.abs(r / r1 - want) / want < 0.02, 'müşteri hızı çarpanı ' + id + ': ' + (r / r1).toFixed(3) + ' beklenen ' + want);
  }
  R.eff = await q(() => {
    BT.S.adLv = 3; BT.S.ads = [{ id: 'kahve', left: 1 }]; const a = BT.ilan.pat();
    BT.S.ads = [{ id: 'dolmus', left: 1 }]; const f = BT.roadFlow(), rd = BT.ilan.road();
    BT.S.ads = []; const f0 = BT.roadFlow(), t0 = BT.servUnlock('turist');
    BT.S.ads = [{ id: 'panayir', left: 1 }]; const t1 = BT.servUnlock('turist');
    BT.S.ads = []; return { a, f, rd, f0, t0, t1, noServ: BT.SERV.length === 0 };
  });
  ok(Math.abs(R.eff.a - 0.10) < 1e-9, 'sabır etkisi +%10 değil ' + JSON.stringify(R.eff));
  ok(Math.abs(R.eff.f - R.eff.f0 - 0.30) < 1e-9 && Math.abs(R.eff.rd - 0.30) < 1e-9, 'yol müşterisi +%30 roadFlow\'a bağlı değil ' + JSON.stringify(R.eff));
  ok(R.eff.noServ ? R.eff.t1 === true : R.eff.t0 === false && R.eff.t1 === true, 'Panayır günü turist açılmadı ' + JSON.stringify(R.eff));   /* v2.22-deneme: Hizmet Sahası yok → turist bina şartsız (Sv4; Panayır günü seviyeden önce, müşteri havuzunda) */
  /* ---- 7) gün sonu: süre azalır, biten reklam toast + kalkar ---- */
  await q(() => { BT.S.adLv = 3; BT.S.ads = [{ id: 'kahve', left: 2 }, { id: 'tellal', left: 1 }]; window.__toasts.length = 0; });
  await nextDay();
  R.d1 = await q(() => ({ ads: BT.ilan.ads(), chip: BT.ilan.chip(), toast: window.__toasts.join('|') }));
  ok(R.d1.ads.length === 1 && R.d1.ads[0].id === 'kahve' && R.d1.ads[0].left === 1 && R.d1.chip === '📣 1 gün', 'gün sonu: süre azalmadı / biten kalmadı ' + JSON.stringify(R.d1));
  ok(/Tellal reklamı bitti/.test(R.d1.toast), 'biten reklam için toast yok: ' + R.d1.toast);
  await nextDay();
  R.d2 = await q(() => ({ ads: BT.ilan.ads(), chip: BT.ilan.chip(), cust: BT.ilan.cust(), toast: window.__toasts.join('|'), vis: !document.getElementById('adChip').classList.contains('hidden') }));
  ok(R.d2.ads.length === 0 && R.d2.chip === '' && R.d2.cust === 1 && !R.d2.vis && /Kahvehane Afişi reklamı bitti/.test(R.d2.toast), 'ikinci gün sonunda reklam bitmedi ' + JSON.stringify(R.d2));

  /* ---- 8) billboard metni ---- */
  R.bb = await q(() => {
    BT.S.roadBb = 3; const out = {};
    out.idle = BT.ilan.billboard(0);
    BT.S.ads = [{ id: 'gazete', left: 2 }]; out.g0 = BT.ilan.billboard(0); out.g2 = BT.ilan.billboard(2);
    BT.S.ads = [{ id: 'tellal', left: 1 }, { id: 'radyo', left: 3 }]; out.m = [0, 1, 2].map(i => BT.ilan.billboard(i));
    BT.S.ads = []; BT.setLang('en'); out.idleEn = BT.ilan.billboard(0);
    BT.S.ads = [{ id: 'dolmus', left: 3 }]; out.dEn = BT.ilan.billboard(1); BT.setLang('tr'); BT.S.ads = [];
    return out;
  });
  ok(R.bb.idle === 'İLAN VERİN' && R.bb.idleEn === 'ADVERTISE HERE', 'boş pano yazısı yanlış ' + JSON.stringify(R.bb));
  ok(R.bb.g0 === 'LİMAN GAZETESİ İLANI' && R.bb.g2 === R.bb.g0 && R.bb.m.join() === 'TELLAL,BÖLGE RADYOSU,TELLAL' && R.bb.dEn === 'MINIBUS BACK SIGN', 'pano afiş metni yanlış ' + JSON.stringify(R.bb));

  /* ---- 9) dünya: tellal, gazeteci çocuk, dolmuş ---- */
  R.lines = await q(() => BT.ilan.LINES.map(l => [l.tr.length > 3, l.en.length > 3, l.tr !== l.en]));
  ok(R.lines.length === 12 && R.lines.every(a => a.every(Boolean)), 'tellal replikleri 12 TR/EN değil ' + JSON.stringify(R.lines));
  await q(() => { BT.S.ads = [{ id: 'tellal', left: 1 }]; BT.day.phase = 'play'; BT.ilan.world.tellal = null; BT.counters.forEach(c => c.spawnT = 1e9); });
  await step(3);
  R.tl = await q(() => { const t = BT.ilan.tellal(); return t ? { x: t.x, y: t.y, say: t.say } : null; });
  ok(R.tl && R.tl.x > 10.2 && R.tl.x < 14.7 && R.tl.y > 0 && R.tl.y < 26, 'tellal yolda görünmüyor ' + JSON.stringify(R.tl));
  const said = new Set();
  for (let k = 0; k < 14; k++) { await step(5); const t = await q(() => { const t = BT.ilan.tellal(); return t ? t.say : ''; }); if (t) said.add(t); }
  R.said = [...said];
  ok(said.size >= 3, 'tellal ~20 sn\'de bir replik söylemiyor (70 sn, ' + said.size + ' farklı replik)');
  /* reklam bitince tellal yoldan çıkar */
  await q(() => { BT.S.ads = []; });
  await step(60);
  ok(await q(() => BT.ilan.tellal() === null), 'reklam bitince tellal kalktı mı: hayır');
  /* gazeteci çocuk: GZB'ye dokunmaz */
  await q(() => { BT.S.ads = [{ id: 'gazete', left: 2 }]; BT.ilan.world.nT = 0.01; BT.ilan.world.news = null; });
  await step(2);
  R.news = await q(() => { const n = BT.ilan.news(); return { n: n ? [n.x, n.y] : null, gzOn: BT.gz.boy().on, q: JSON.stringify(BT.gz.st().q), drop: BT.gz.drop() }; });
  ok(R.news.n && R.news.n[0] > 10.2 && R.news.n[0] < 14.7 && !R.news.gzOn && R.news.drop === null, 'gazeteci çocuk yoldan geçmiyor / gazete sistemine karıştı ' + JSON.stringify(R.news));
  await step(30);
  ok(await q(() => BT.ilan.news() === null), 'gazeteci çocuk yoldan çıkmadı');
  /* dolmuş */
  await q(() => { BT.S.ads = [{ id: 'dolmus', left: 3 }]; BT.ilan.world.bT = 0.01; BT.ilan.world.bus = null; });
  await step(2);
  R.bus = await q(() => { const b = BT.ilan.bus(); return b ? [b.x, b.y] : null; });
  ok(R.bus && R.bus[0] > 10.2 && R.bus[0] < 14.7, 'dolmuş yoldan geçmiyor ' + JSON.stringify(R.bus));
  await step(15);
  ok(await q(() => BT.ilan.bus() === null), 'dolmuş yoldan çıkmadı');
  /* radyo + panayır çizimi hatasız */
  await q(() => { BT.S.ads = [{ id: 'radyo', left: 3 }, { id: 'panayir', left: 1 }]; BT.ilan.world.rT = 0.01; });
  await step(2); await sleep(400);
  R.radio = await q(() => ({ obj: BT.ilan.obj() }));
  ok(R.radio.obj.radio === true && R.radio.obj.fair === true && R.radio.obj.lv === 3, 'büro nesnesi radyo/panayır işaretlemiyor ' + JSON.stringify(R.radio));

  /* ---- 10) panel, kapıda düğme, binaya dokunma ---- */
  await q(() => { BT.S.ads = []; BT.S.cash = 9e6; BT.player.x = 19.6; BT.player.y = 10.3; BT.player.vx = 0; BT.player.vy = 0; });
  await sleep(700);
  R.btn = await q(() => { const b = document.getElementById('actBtn'); return { hid: b.classList.contains('hidden'), txt: b.innerText, a: b.dataset.a }; });
  ok(!R.btn.hid && R.btn.a === 'ad' && /İLAN VER/.test(R.btn.txt), 'kapıda İLAN VER düğmesi yok ' + JSON.stringify(R.btn));
  await p.click('#actBtn'); await sleep(300);
  R.panel = await q(() => ({ open: !document.getElementById('adScr').classList.contains('hidden'), paused: BT.paused(), title: document.getElementById('adTitle').innerText, sub: document.getElementById('adSub').innerText, rows: [...document.querySelectorAll('#adRows .trow')].map(r => r.innerText.replace(/\s+/g, ' ')), btns: document.querySelectorAll('#adRows button.pub:not([disabled])').length }));
  ok(R.panel.open && R.panel.paused && /İlan Bürosu/.test(R.panel.title) && /Yayında 0\/2/.test(R.panel.sub), 'panel açılmadı ' + JSON.stringify(R.panel));
  ok(R.panel.rows.length === 6 && R.panel.rows.every(r => /Süre: \d gün/.test(r)) && R.panel.btns === 6, 'panel satırları ' + JSON.stringify(R.panel.rows));
  ok(/Tellal.*Süre: 1 gün.*Müşteri \+%15/.test(R.panel.rows[0]) && /Kahvehane.*Süre: 2 gün.*Müşteri \+%10 • Sabır \+%10/.test(R.panel.rows[1]), 'panel süre/etki metni ' + JSON.stringify(R.panel.rows));
  const price = await q(() => BT.ilan.price('radyo')), cashB = await q(() => BT.S.cash);
  await p.click('#adRows button.pub[data-id="radyo"]'); await sleep(250);
  R.pclick = await q(() => ({ cash: BT.S.cash, ads: BT.ilan.ads(), row: document.querySelector('#adRows .trow[data-ad="radyo"]').innerText.replace(/\s+/g, ' '), btns: document.querySelectorAll('#adRows button.pub:not([disabled])').length }));
  ok(cashB - R.pclick.cash === price && R.pclick.ads.length === 1 && R.pclick.ads[0].id === 'radyo' && /Yayında.*3 gün kaldı/.test(R.pclick.row), 'panelden yayınlama yanlış ' + JSON.stringify(R.pclick) + ' ' + price);
  await p.click('#adClose'); await sleep(200);
  ok(await q(() => document.getElementById('adScr').classList.contains('hidden') && !BT.paused()), 'panel kapanmadı');
  await q(() => { BT.S.ads = []; BT.player.x = 17.6; BT.player.y = 9.0; });
  await sleep(1200);
  /* binaya dokununca panel */
  const css = await q(() => BT.arr.css(BT.ilan.AD.x, BT.ilan.AD.y));
  await p.mouse.click(css[0], css[1] - 14); await sleep(400);
  ok(await q(() => !document.getElementById('adScr').classList.contains('hidden')), 'binaya dokununca panel açılmadı (' + css + ')');
  await p.click('#adClose'); await sleep(200);
  /* YAPI kartından "İLAN VER" */
  const cm = await meydan(); await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Reklam Ver/.test(x.innerText)); (c.querySelector('.pick') || c.querySelector('.buy')).click(); });
  await sleep(300);
  ok(await q(() => !document.getElementById('adScr').classList.contains('hidden')), 'YAPI kartı paneli açmadı');
  await p.click('#adClose'); await sleep(200);

  /* ---- 11) kayıt / yükleme ---- */
  await q(() => { BT.S.adLv = 3; BT.S.ads = [{ id: 'radyo', left: 2 }, { id: 'tellal', left: 1 }]; });
  const sv = await q(() => { const d = BT.buildSave(); return { adLv: d.adLv, ads: d.ads }; });
  ok(sv.adLv === 3 && sv.ads.length === 2 && sv.ads[0].id === 'radyo' && sv.ads[0].left === 2, 'kayıtta adLv/ads yok ' + JSON.stringify(sv));
  const reload = async edit => {
    await q(() => BT.saveQuit()); await sleep(300);
    if (edit) await p.evaluate(edit);
    await p.reload(); await sleep(1300); await p.click('#playBtn'); await sleep(900);
    await prep();
  };
  await reload();
  R.ld = await q(() => ({ lv: BT.ilan.lv(), ads: BT.ilan.ads(), started: BT.S.started, chip: BT.ilan.chip() }));
  ok(R.ld.started && R.ld.lv === 3 && R.ld.ads.length === 2 && R.ld.ads[0].left === 2 && R.ld.chip === '📣 2 gün · 1 gün', 'yükleme adLv/ads korumadı ' + JSON.stringify(R.ld));
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); d.adLv = 1; d.ads = [{ id: 'zzz', left: 1 }, { id: 'radyo', left: 3 }, { id: 'tellal', left: 99 }, { id: 'tellal', left: 1 }, null, 7, { id: 'kahve', left: 'x' }]; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  R.bad = await q(() => ({ lv: BT.ilan.lv(), ads: BT.ilan.ads(), started: BT.S.started }));
  ok(R.bad.started && R.bad.lv === 1 && R.bad.ads.length === 1 && R.bad.ads[0].id === 'tellal' && R.bad.ads[0].left === 1, 'bozuk kayıt elenmedi ' + JSON.stringify(R.bad));
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); delete d.adLv; delete d.ads; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  R.old = await q(() => ({ lv: BT.ilan.lv(), ads: BT.ilan.ads(), started: BT.S.started, cust: BT.ilan.cust(), flow: BT.roadFlow() }));
  ok(R.old.started && R.old.lv === 0 && R.old.ads.length === 0 && R.old.cust === 1, 'eski kayıt boş başlamadı ' + JSON.stringify(R.old));
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); d.adLv = 'abc'; d.ads = 'x'; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  ok(await q(() => BT.S.started && BT.ilan.lv() === 0 && BT.ilan.ads().length === 0), 'bozuk tür kayıt çöktü');

  /* ---- 12) TR / EN ---- */
  R.lang = await q(() => {
    const out = {}; BT.S.adLv = 3; BT.S.cash = 9e6; BT.S.ads = [];
    ['tr', 'en'].forEach(l => {
      BT.setLang(l); const T = BT.T;
      BT.ilan.open();
      out[l] = { name: T('adName'), btn: T('adBtn'), sub: document.getElementById('adSub').innerText, rows: [...document.querySelectorAll('#adRows .trow')].map(r => r.innerText.replace(/\s+/g, ' ')), pub: document.querySelector('#adRows button.pub').innerText, close: document.getElementById('adClose').innerText,
        names: BT.ilan.LIST.map(d => d.n[l]).every(Boolean), effs: BT.ilan.LIST.every(d => d.d[l] && d.w[l]) };
      BT.ilan.close();
    });
    BT.setLang('tr'); return out;
  });
  ok(R.lang.tr.name === 'İlan Bürosu' && R.lang.en.name === 'Ad Bureau', 'ad TR/EN yanlış ' + JSON.stringify([R.lang.tr.name, R.lang.en.name]));
  ok(R.lang.tr.pub === 'YAYINLA' && R.lang.en.pub === 'PUBLISH' && R.lang.tr.close === 'KAPAT' && R.lang.en.close === 'CLOSE', 'panel düğme metinleri ' + JSON.stringify([R.lang.tr.pub, R.lang.en.pub, R.lang.tr.close, R.lang.en.close]));
  ok(/Yayında 0\/2/.test(R.lang.tr.sub) && /Running 0\/2/.test(R.lang.en.sub), 'panel alt yazı ' + JSON.stringify([R.lang.tr.sub, R.lang.en.sub]));
  ok(R.lang.en.rows.some(r => /Town Crier.*Duration: 1 day.*Customers \+15%/.test(r)) && R.lang.en.rows.some(r => /Fair Stand.*Customers ×2 • Tourists arrive/.test(r)), 'EN satırlar ' + JSON.stringify(R.lang.en.rows));
  ok(R.lang.tr.names && R.lang.en.names && R.lang.tr.effs && R.lang.en.effs, 'reklam adı/etki/dünya metni eksik');
  R.en = await q(() => { BT.setLang('en'); const T = BT.T; const o = { b: T('adBuilt'), u: T('adUp', { l: 2 }), e: T('adEnded', { n: 'Town Crier' }), p: T('adPublished', { n: 'Town Crier', d: '2 days' }), idle: T('adBbIdle'), lock: T('adLockLv', { l: 2 }), full: T('adFull') }; BT.setLang('tr'); return o; });
  ok(!Object.values(R.en).some(v => /[ğşıöüçİĞŞÖÜÇ]/.test(v)), 'EN metinde Türkçe karakter ' + JSON.stringify(R.en));

  /* ---- ekran görüntüsü: büro + yayında tellal (390x844) ---- */
  await q(() => {
    const S = BT.S; S.adLv = 3; S.ads = [{ id: 'tellal', left: 1 }]; S.roadBb = 3; S.roadFl = 3; S.env = 3; S.cash = 9e6; S.rep = 1e6;
    BT.HUT.lvl = 3; BT.DEPOT.lvl = 3; BT.WHALL.built = true; BT.day.phase = 'play';
    BT.ilan.world.tellal = { x: 13.3, y: 11.6, z: 0, vx: 0, vy: -1, bob: 0, face: 1, dir: -1, tx: 13.3, sayT: 0.5, sayIn: 19, say: BT.ilan.LINES[0].tr, t: 2, leave: 0 };
    BT.player.x = 18.5; BT.player.y = 9.3; BT.player.vx = 0; BT.player.vy = 0;
    for (const id of ['lvlUp']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); }
  });
  await sleep(1800);
  await q(() => { BT.ilan.world.tellal.sayT = 0.5; BT.ilan.world.tellal.sayIn = 19; BT.ilan.world.tellal.y = 10.4; BT.ilan.world.tellal.x = 13.2; document.getElementById('toast').classList.remove('on'); });
  await sleep(200);
  await p.screenshot({ path: SC + 'ilan-buro-tellal-390x844.png' });

  console.log(JSON.stringify(R, null, 1).slice(0, 6000));
  if (errs.length) fail.push('sayfa hatası: ' + errs.slice(0, 4).join(' | '));
  if (fail.length) { console.log('BAŞARISIZ:\n' + fail.join('\n')); process.exit(1); }
  console.log('TAMAM: ilan bürosu testi geçti');
  await b.close();
})().catch(e => { console.error(e); process.exit(2); });
