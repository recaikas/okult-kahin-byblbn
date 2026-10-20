/* v2.18-deneme — İNŞAAT: binalar satın alınınca hedef seviye L kadar oyun günü sonra hazır olur.
   1) L1 satın al → aynı gün çalışmaz, kart kilitli, 1 gün sonu sonra hazır   2) L2 yükseltme → 2 gün eski seviye çalışır, sonra L2
   3) aynı anda ikinci yükseltme engelli   4) kayıt/yükleme left korunur (bozuk kayıt güvenli)
   5) HK_INSAAT_OFF ile anında   6) TR/EN metinler.   Ekran görüntüsü: screenshots/insaat/ (390x844). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8107/index.html';
const SC = (process.env.SC || __dirname + '/screenshots/insaat') + '/';
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
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 9e6; S.tut = 99; S.rep = 1e6; S.lvFloor = 10;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9);
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); const q = document.getElementById('prepScr'); if (q && !q.classList.contains('hidden')) document.getElementById('prepGo').click(); }, 150);
    window.HK_INSAAT_OFF = 1;                               /* ön hazırlık: koop L1 ve kulübe L1 anında kurulsun */
    BT.servBuild('koop', 'p4'); BT.HUT.lvl = 1;
    window.HK_INSAAT_OFF = 0;                               /* bundan sonrası gerçek inşaat */
  });
  const q = f => p.evaluate(f);
  const nextDay = async () => {                             /* günü gerçekten bitir: kapanış → özet kartı → "devam" */
    await q(() => BT.endDay());
    for (let i = 0; i < 160; i++) {
      const done = await q(() => { BT.customers.length = 0; const e = document.getElementById('dayScr'); if (e && !e.classList.contains('hidden')) { document.getElementById('dayGo').click(); return true; } return false; });
      if (done) break; await sleep(250);
    }
    await sleep(300);
  };
  const openTab = async tab => { const cur = await q(() => { const t = document.querySelector('.dtab.on'); return t ? t.dataset.t : ''; }); if (cur !== tab) await p.click('.dtab[data-t="' + tab + '"]'); await sleep(250); };
  const cards = async tab => { await openTab(tab); return q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); };
  const sub = async s => { await p.click('#dpSub button[data-s="' + s + '"]'); await sleep(250); return q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); };
  const closeBar = () => q(() => { const t = document.querySelector('.dtab.on'); if (t) t.click(); });

  /* ---- 1) ilk kurulum L1: buzhane (hizmet) + depo (meydan) ---- */
  const d0 = await q(() => BT.day.n);
  const cash0 = await q(() => BT.S.cash);
  await q(() => { BT.servBuild('buzhane', 'p1'); });
  await q(() => { BT.DEPOT.lvl; });
  await p.click('.dtab[data-t="build"]'); await sleep(250); await sub('meydan');
  await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Depo/.test(x.innerText)); c.querySelector('.buy').click(); });
  await sleep(200);
  await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Depo/.test(x.innerText)); const b = c.querySelector('.buy'); if (/ONAY|CONFIRM/i.test(b.innerText)) b.click(); });
  await sleep(300);
  R.s1 = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), serv: !!BT.serv().buzhane, cnt: BT.servCount(), stock: BT.servEff('stock'), depot: BT.DEPOT.lvl, plotB: BT.PLOTS[0].b, cash: BT.S.cash }));
  ok(R.s1.ins.buzhane && R.s1.ins.buzhane.lv === 1 && R.s1.ins.buzhane.left === 1, 'buzhane inşaatı başlamadı ' + JSON.stringify(R.s1));
  ok(!R.s1.serv && R.s1.cnt === 1 && R.s1.stock === 0, 'inşaattaki buzhane çalışıyor ' + JSON.stringify(R.s1));
  ok(R.s1.plotB === 'buzhane', 'parsel ayrılmadı');
  ok(R.s1.ins.depot && R.s1.ins.depot.lv === 1 && R.s1.depot === 0, 'depo inşaatı başlamadı / hemen kuruldu ' + JSON.stringify(R.s1));
  ok(cash0 - R.s1.cash >= 2000, 'depo parası satın alırken düşmedi ' + (cash0 - R.s1.cash));
  const dep = await q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ')).filter(t => /Depo/.test(t)));
  R.depCard = dep;
  ok(dep.some(t => /İnşaatta · 1 gün/.test(t)), 'depo kartı kilitli değil ' + JSON.stringify(dep));
  const sv1 = await cards('serv'); R.servCard = sv1.filter(t => /Buzhane/.test(t));
  ok(sv1.some(t => /Buzhane/.test(t) && /İnşaatta · 1 gün/.test(t)), 'buzhane kartı kilitli değil ' + JSON.stringify(R.servCard));
  const clickable = await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Buzhane/.test(x.innerText)); const bt = c.querySelector('.buy'); return { cls: bt.className, txt: bt.innerText }; });
  ok(/no/.test(clickable.cls), 'kilitli kart tıklanabilir görünüyor ' + JSON.stringify(clickable));
  /* ---- 2/3) koop L1 → L2 yükseltme: 2 gün eski seviye; ikinci yükseltme engelli ---- */
  const wage1 = await q(() => BT.servEff('wage'));
  ok(Math.abs(wage1 - 0.06) < 1e-9, 'koop L1 etkisi beklenen değil ' + wage1);
  const up = await q(() => BT.servUp('koop'));
  const up2 = await q(() => BT.servUp('koop'));
  R.up = await q(() => ({ lv: BT.serv().koop.lvl, wage: BT.servEff('wage'), ins: BT.S.insaat.koop }));
  ok(up === true && up2 === false, 'ikinci yükseltme engellenmedi ' + up + '/' + up2);
  ok(R.up.lv === 1 && Math.abs(R.up.wage - 0.06) < 1e-9 && R.up.ins.lv === 2 && R.up.ins.left === 2, 'yükseltmede eski seviye çalışmıyor ' + JSON.stringify(R.up));
  const sv2 = await cards('serv'); R.koopCard = sv2.filter(t => /Kooperatif/.test(t));
  ok(sv2.some(t => /Kooperatif/.test(t) && /İnşaatta · 2 gün/.test(t)), 'koop kartı kilitli değil ' + JSON.stringify(R.koopCard));
  /* ekran görüntüsü: meydanda inşaattaki depo (ilk kurulum) + kulübe yükseltmesi */
  await closeBar();
  await q(() => { window.HK_INSAAT_OFF = 0; });
  await p.evaluate(async () => {}); 
  const hutBuy = await q(() => { BT.S.cash = 9e6; const el = document.querySelector('.dtab[data-t="build"]'); el.click(); return true; });
  await sub('meydan');
  await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Kulübe/.test(x.innerText)); c.querySelector('.buy').click(); });
  await sleep(200);
  await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Kulübe/.test(x.innerText)); const bt = c.querySelector('.buy'); if (/ONAY|CONFIRM/i.test(bt.innerText)) bt.click(); });
  await sleep(300);
  R.hut = await q(() => ({ lvl: BT.HUT.lvl, ins: BT.S.insaat.hut }));
  ok(R.hut.lvl === 1 && R.hut.ins && R.hut.ins.lv === 2 && R.hut.ins.left === 2, 'kulübe yükseltmesi inşaata girmedi ' + JSON.stringify(R.hut));
  await closeBar();
  await q(() => { BT.player.x = 18.6; BT.player.y = 3.4; BT.player.vx = 0; BT.player.vy = 0; });
  await sleep(3500);
  await p.screenshot({ path: SC + 'insaat-meydan-390x844.png' });
  await q(() => { BT.player.x = 19.75; BT.player.y = 14.2; BT.player.vx = 0; BT.player.vy = 0; });   /* hizmet sahası: ilk kurulum buzhane */
  await sleep(3500);
  await p.screenshot({ path: SC + 'insaat-hizmet-390x844.png' });
  /* ---- 1) gün sonu → buzhane + depo hazır; koop 1 gün kaldı ---- */
  await nextDay();
  R.s2 = await q(() => ({ day: BT.day.n, ins: JSON.parse(JSON.stringify(BT.S.insaat)), bz: BT.serv().buzhane && BT.serv().buzhane.lvl, depot: BT.DEPOT.lvl, stock: BT.servEff('stock'), koop: BT.serv().koop.lvl, wage: BT.servEff('wage'), toast: document.getElementById('toast').textContent }));
  ok(R.s2.day === d0 + 1, 'gün ilerlemedi ' + JSON.stringify(R.s2));
  ok(R.s2.bz === 1 && R.s2.depot === 1 && R.s2.stock === 2, 'buzhane/depo 1 gün sonra hazır değil ' + JSON.stringify(R.s2));
  ok(!R.s2.ins.buzhane && !R.s2.ins.depot, 'biten inşaat kaydı silinmedi');
  ok(R.s2.ins.koop && R.s2.ins.koop.left === 1 && R.s2.koop === 1 && Math.abs(R.s2.wage - 0.06) < 1e-9, 'koop 1. günde yanlış ' + JSON.stringify(R.s2));
  ok(/hazır/.test(R.s2.toast), 'hazır bildirimi yok: ' + R.s2.toast);
  ok(R.s2.ins.hut && R.s2.ins.hut.left === 1, 'kulübe left yanlış ' + JSON.stringify(R.s2.ins));
  /* ---- 4) kayıt / yükleme: left korunur ---- */
  const saved = await q(() => { BT.saveNow(); return JSON.parse(localStorage.getItem('balikci_slot_1')).insaat; });
  R.saved = saved;
  ok(saved && saved.koop && saved.koop.lv === 2 && saved.koop.left === 1 && saved.hut && saved.hut.left === 1, 'kayıtta insaat yok ' + JSON.stringify(saved));
  /* gerçek yükleme: kaydet-çık → (isteğe bağlı kaydı boz) → sayfayı yenile → Devam */
  const reload = async (edit) => {
    await q(() => BT.saveQuit()); await sleep(300);
    if (edit) await p.evaluate(edit);
    await p.reload(); await sleep(1300); await p.click('#playBtn'); await sleep(900);
    await q(() => { window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); const q = document.getElementById('prepScr'); if (q && !q.classList.contains('hidden')) document.getElementById('prepGo').click(); }, 150); });
    await q(() => { window.HK_INSAAT_OFF = 0; BT.S.cash = 9e6; BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9); });
  };
  await reload();
  R.loaded = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), koop: BT.serv().koop.lvl, started: BT.S.started, day: BT.day.n }));
  ok(R.loaded.started && R.loaded.ins.koop && R.loaded.ins.koop.left === 1 && R.loaded.koop === 1 && R.loaded.ins.hut.left === 1, 'yükleme left korumadı ' + JSON.stringify(R.loaded));
  /* bozuk kayıt: sayfa hatası yok, geçersizler elenir; left ≤ 0 olan (geçerli) tamamlanır */
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); d.insaat = { zzz: { lv: 1, left: 1 }, koop: { lv: 'x', left: 'abc' }, mezat: { lv: 99, left: -5, p: 'p9' }, hut: 7, depot: null, restoran: { lv: 1, left: 1, p: 'p3' }, nakliye: [1, 2] }; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  R.bad = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), started: BT.S.started, mezat: !!BT.serv().mezat, rest: !!BT.serv().restoran, hut: BT.HUT.lvl }));
  ok(R.bad.started && !R.bad.ins.zzz && !R.bad.ins.hut && !R.bad.ins.depot && !R.bad.ins.nakliye, 'bozuk kayıt elenmedi ' + JSON.stringify(R.bad));
  ok(R.bad.ins.koop && R.bad.ins.koop.lv === 2 && R.bad.ins.koop.left === 2, 'bozuk left düzeltilmedi ' + JSON.stringify(R.bad));
  ok(R.bad.ins.restoran && R.bad.ins.restoran.p === 'p3' && R.bad.mezat && !R.bad.rest, 'geçerli kayıt ya da left≤0 tamamlama bozuldu ' + JSON.stringify(R.bad));
  /* eski kayıt (insaat alanı yok) → boş */
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); delete d.insaat; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  R.old = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), started: BT.S.started }));
  ok(R.old.started && Object.keys(R.old.ins).length === 0, 'eski kayıt boş başlamadı ' + JSON.stringify(R.old));
  /* testin devamı: koop L2 ve kulübe L2 (her ikisi 1 gün kaldı) yeniden kur */
  await q(() => { BT.S.insaat.koop = { lv: 2, left: 1 }; BT.S.insaat.hut = { lv: 2, left: 1 }; });
  /* ---- 2) 2. gün sonu: koop hâlâ L1 (left 0 ama bekler değil) → 2 gün sonra L2 ---- */
  await nextDay();
  R.s3 = await q(() => ({ day: BT.day.n, koop: BT.serv().koop.lvl, wage: BT.servEff('wage'), ins: JSON.parse(JSON.stringify(BT.S.insaat)), hut: BT.HUT.lvl }));
  ok(R.s3.koop === 2 && Math.abs(R.s3.wage - 0.12) < 1e-9 && !R.s3.ins.koop, 'koop 2 gün sonra L2 olmadı ' + JSON.stringify(R.s3));
  ok(R.s3.hut === 2 && !R.s3.ins.hut, 'kulübe L2 olmadı ' + JSON.stringify(R.s3));
  /* ---- 5) HK_INSAAT_OFF: anında ---- */
  R.off = await q(() => { window.HK_INSAAT_OFF = 1; BT.servUp('koop'); const a = BT.serv().koop.lvl; const bz = BT.servUp('buzhane'); const c = BT.serv().buzhane.lvl; window.HK_INSAAT_OFF = 0; return { koop: a, bz: c, ins: Object.keys(BT.S.insaat).length }; });
  ok(R.off.koop === 3 && R.off.bz === 2 && R.off.ins === 0, 'bayrak açıkken anında olmadı ' + JSON.stringify(R.off));
  /* ---- 6) TR / EN metinler ---- */
  R.tr = await q(() => { BT.setLang('tr'); const T = BT.T; return { lock: T('insLock', { d: '2 gün' }), label: T('insLabel', { d: '1 gün' }), ready: T('insReady', { n: 'Buzhane', l: 2 }), start: T('insStart', { n: 'Buzhane', d: '1 gün' }) }; });
  ok(R.tr.lock === '🏗 İnşaatta · 2 gün' && R.tr.label === 'İnşaat · 1 gün' && R.tr.ready === '✅ Buzhane hazır! (Sv 2)' && /inşaatı başladı/.test(R.tr.start), 'TR metinler yanlış ' + JSON.stringify(R.tr));
  await q(() => { BT.setLang('en'); BT.servUp('koop'); });
  const enCards = await cards('serv'); R.enCard = enCards.filter(t => /Cooperative/.test(t));
  ok(enCards.some(t => /Cooperative/.test(t) && /Under construction · 4 days/.test(t)), 'EN kart kilidi yanlış ' + JSON.stringify(R.enCard));
  R.en = await q(() => { const T = BT.T; return { lock: T('insLock', { d: '2 days' }), label: T('insLabel', { d: '1 day' }), ready: T('insReady', { n: 'Ice House', l: 2 }), start: T('insStart', { n: 'Ice House', d: '1 day' }) }; });
  ok(R.en.lock === '🏗 Under construction · 2 days' && R.en.label === 'Construction · 1 day' && R.en.ready === '✅ Ice House is ready! (Lv 2)' && /construction started/.test(R.en.start), 'EN metinler yanlış ' + JSON.stringify(R.en));
  await q(() => BT.setLang('tr'));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1));
  console.log(fail.length ? 'INSAAT_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: inşaat testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
