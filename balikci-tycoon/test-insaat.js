/* v2.18-deneme — İNŞAAT: binalar satın alınınca hedef seviye L kadar oyun günü sonra hazır olur.
   v2.22-deneme: Hizmet Sahası kalktı; kural meydan binalarıyla sınanır (Depo ilk kurulum L1, Personel Kulübesi L1 → L2).
   1) L1 satın al → aynı gün çalışmaz, kart kilitli, 1 gün sonu sonra hazır   2) L2 yükseltme → 2 gün eski seviye çalışır, sonra L2
   3) aynı anda ikinci yükseltme engelli   4) kayıt/yükleme left korunur (bozuk kayıt güvenli; inşaatı süren eski hizmet binası iade)
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
  const noScr = () => { window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); const q = document.getElementById('prepScr'); if (q && !q.classList.contains('hidden')) document.getElementById('prepGo').click(); }, 150); };
  await p.evaluate(noScr);
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 9e6; S.tut = 99; S.rep = 1e6; S.lvFloor = 10;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9);
    window.HK_INSAAT_OFF = 1; BT.HUT.lvl = 1;             /* ön hazırlık: kulübe L1 anında */
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
  const sub = async s => { await p.click('#dpSub button[data-s="' + s + '"]'); await sleep(250); return q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); };
  const meydan = async () => { await openTab('build'); return sub('meydan'); };
  const closeBar = () => q(() => { const t = document.querySelector('.dtab.on'); if (t) t.click(); });
  const buyCard = async re => {                             /* meydan kartını satın al (pahalıysa onay) */
    await p.evaluate(src => { const r = new RegExp(src); const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => r.test(x.innerText)); c.querySelector('.buy').click(); }, re);
    await sleep(200);
    await p.evaluate(src => { const r = new RegExp(src); const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => r.test(x.innerText)); const bt = c.querySelector('.buy'); if (/ONAY|CONFIRM/i.test(bt.innerText)) bt.click(); }, re);
    await sleep(300);
  };

  /* ---- 1) ilk kurulum L1: depo; 2) kulübe L1 → L2 ---- */
  const d0 = await q(() => BT.day.n);
  const cash0 = await q(() => BT.S.cash);
  await meydan(); await buyCard('Depo');
  R.s1 = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), depot: BT.DEPOT.lvl, cash: BT.S.cash }));
  ok(R.s1.ins.depot && R.s1.ins.depot.lv === 1 && R.s1.ins.depot.left === 1 && R.s1.depot === 0, 'depo inşaatı başlamadı / hemen kuruldu ' + JSON.stringify(R.s1));
  ok(cash0 - R.s1.cash >= 2000, 'depo parası satın alırken düşmedi ' + (cash0 - R.s1.cash));
  const dep = await q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ')).filter(t => /Depo/.test(t)));
  R.depCard = dep;
  ok(dep.some(t => /İnşaatta · 1 gün/.test(t)), 'depo kartı kilitli değil ' + JSON.stringify(dep));
  const clickable = await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Depo/.test(x.innerText)); const bt = c.querySelector('.buy'); return { cls: bt.className, txt: bt.innerText }; });
  ok(/no/.test(clickable.cls), 'kilitli kart tıklanabilir görünüyor ' + JSON.stringify(clickable));
  await buyCard('Kulübe');
  R.hut = await q(() => ({ lvl: BT.HUT.lvl, ins: BT.S.insaat.hut }));
  ok(R.hut.lvl === 1 && R.hut.ins && R.hut.ins.lv === 2 && R.hut.ins.left === 2, 'kulübe yükseltmesi inşaata girmedi ' + JSON.stringify(R.hut));
  /* ---- 3) aynı anda ikinci yükseltme engelli ---- */
  const hutCard = await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(x => /Kulübe/.test(x.innerText)); return { t: c.innerText.replace(/\s+/g, ' '), cls: c.querySelector('.buy').className }; });
  ok(/İnşaatta · 2 gün/.test(hutCard.t) && /no/.test(hutCard.cls), 'kulübe ikinci yükseltmesi engellenmedi ' + JSON.stringify(hutCard));
  await closeBar();
  await q(() => { BT.player.x = 18.6; BT.player.y = 3.4; BT.player.vx = 0; BT.player.vy = 0; });
  await sleep(3500);
  await p.screenshot({ path: SC + 'insaat-meydan-390x844.png' });
  /* ---- 1) gün sonu → depo hazır; kulübe 1 gün kaldı (hâlâ L1) ---- */
  await nextDay();
  R.s2 = await q(() => ({ day: BT.day.n, ins: JSON.parse(JSON.stringify(BT.S.insaat)), depot: BT.DEPOT.lvl, hut: BT.HUT.lvl, toast: document.getElementById('toast').textContent }));
  ok(R.s2.day === d0 + 1, 'gün ilerlemedi ' + JSON.stringify(R.s2));
  ok(R.s2.depot === 1 && !R.s2.ins.depot, 'depo 1 gün sonra hazır değil ' + JSON.stringify(R.s2));
  ok(/hazır/.test(R.s2.toast), 'hazır bildirimi yok: ' + R.s2.toast);
  ok(R.s2.ins.hut && R.s2.ins.hut.left === 1 && R.s2.hut === 1, 'kulübe 1. günde yanlış ' + JSON.stringify(R.s2));
  /* ---- 4) kayıt / yükleme: left korunur ---- */
  const saved = await q(() => { BT.saveNow(); return JSON.parse(localStorage.getItem('balikci_slot_1')).insaat; });
  R.saved = saved;
  ok(saved && saved.hut && saved.hut.lv === 2 && saved.hut.left === 1, 'kayıtta insaat yok ' + JSON.stringify(saved));
  /* gerçek yükleme: kaydet-çık → (isteğe bağlı kaydı boz) → sayfayı yenile → Devam */
  const reload = async (edit) => {
    await q(() => BT.saveQuit()); await sleep(300);
    if (edit) await p.evaluate(edit);
    await p.reload(); await sleep(1300); await p.click('#playBtn'); await sleep(900);
    await p.evaluate(noScr);
    await q(() => { window.HK_INSAAT_OFF = 0; BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9); });
  };
  await reload();
  R.loaded = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), hut: BT.HUT.lvl, started: BT.S.started, day: BT.day.n }));
  ok(R.loaded.started && R.loaded.ins.hut && R.loaded.ins.hut.left === 1 && R.loaded.hut === 1, 'yükleme left korumadı ' + JSON.stringify(R.loaded));
  /* bozuk kayıt: sayfa hatası yok, geçersizler elenir, bozuk left düzeltilir; inşaatı süren eski hizmet binası (Kooperatif L2) iade */
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); d.cash = 1000; d.insaat = { zzz: { lv: 1, left: 1 }, hut: { lv: 'x', left: 'abc' }, depot: null, whall: { lv: 1, left: 99 }, koop: { lv: 2, left: 1, p: 'p4' } }; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  await sleep(1500);
  R.bad = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), started: BT.S.started, hut: BT.HUT.lvl, cash: BT.S.cash, toast: document.getElementById('toast').textContent }));
  ok(R.bad.started && !R.bad.ins.zzz && !R.bad.ins.depot && !R.bad.ins.koop, 'bozuk kayıt elenmedi ' + JSON.stringify(R.bad));
  ok(R.bad.ins.hut && R.bad.ins.hut.lv === 2 && R.bad.ins.hut.left === 2, 'bozuk left düzeltilmedi ' + JSON.stringify(R.bad));
  ok(R.bad.ins.whall && R.bad.ins.whall.lv === 1 && R.bad.ins.whall.left === 1, 'left sınıra çekilmedi ' + JSON.stringify(R.bad));
  ok(R.bad.cash > 1000 + 7000 && /Hizmet Sahası kaldırıldı/.test(R.bad.toast), 'inşaatı süren hizmet binası iade edilmedi ' + JSON.stringify([R.bad.cash, R.bad.toast]));   /* Kooperatif Sv2 = 14.000 (yükseltme indirimiyle ≥ %55) */
  /* eski kayıt (insaat alanı yok) → boş */
  await reload(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); delete d.insaat; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  R.old = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat)), started: BT.S.started }));
  ok(R.old.started && Object.keys(R.old.ins).length === 0, 'eski kayıt boş başlamadı ' + JSON.stringify(R.old));
  await q(() => { BT.S.cash = 9e6; });
  /* ---- 2) kulübe L2: 1 gün kalmışken gün sonu → L2 ---- */
  await q(() => { BT.S.insaat.hut = { lv: 2, left: 1 }; });
  await nextDay();
  R.s3 = await q(() => ({ day: BT.day.n, ins: JSON.parse(JSON.stringify(BT.S.insaat)), hut: BT.HUT.lvl }));
  ok(R.s3.hut === 2 && !R.s3.ins.hut, 'kulübe L2 olmadı ' + JSON.stringify(R.s3));
  /* ---- 5) HK_INSAAT_OFF: anında ---- */
  await q(() => { window.HK_INSAAT_OFF = 1; });
  await meydan(); await buyCard('Kulübe');
  R.off = await q(() => { const o = { hut: BT.HUT.lvl, ins: Object.keys(BT.S.insaat).length }; window.HK_INSAAT_OFF = 0; return o; });
  ok(R.off.hut === 3 && R.off.ins === 0, 'bayrak açıkken anında olmadı ' + JSON.stringify(R.off));
  /* ---- 6) TR / EN metinler ---- */
  R.tr = await q(() => { BT.setLang('tr'); const T = BT.T; return { lock: T('insLock', { d: '2 gün' }), label: T('insLabel', { d: '1 gün' }), ready: T('insReady', { n: 'Depo', l: 2 }), start: T('insStart', { n: 'Depo', d: '1 gün' }) }; });
  ok(R.tr.lock === '🏗 İnşaatta · 2 gün' && R.tr.label === 'İnşaat · 1 gün' && R.tr.ready === '✅ Depo hazır! (Sv 2)' && /inşaatı başladı/.test(R.tr.start), 'TR metinler yanlış ' + JSON.stringify(R.tr));
  await q(() => BT.setLang('en'));
  await closeBar(); await meydan(); await buyCard('Staff Hut');
  const enCards = await q(() => [...document.querySelectorAll('#dpCards .dcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); R.enCard = enCards.filter(t => /Staff Hut/.test(t));
  ok(enCards.some(t => /Staff Hut/.test(t) && /Under construction · 4 days/.test(t)), 'EN kart kilidi yanlış ' + JSON.stringify(R.enCard));
  R.en = await q(() => { const T = BT.T; return { lock: T('insLock', { d: '2 days' }), label: T('insLabel', { d: '1 day' }), ready: T('insReady', { n: 'Depot', l: 2 }), start: T('insStart', { n: 'Depot', d: '1 day' }) }; });
  ok(R.en.lock === '🏗 Under construction · 2 days' && R.en.label === 'Construction · 1 day' && R.en.ready === '✅ Depot is ready! (Lv 2)' && /construction started/.test(R.en.start), 'EN metinler yanlış ' + JSON.stringify(R.en));
  await q(() => BT.setLang('tr'));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1));
  console.log(fail.length ? 'INSAAT_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: inşaat testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
