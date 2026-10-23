/* v2.22-deneme — HİZMET SAHASI KALDIRILDI (LOKANTA_V3_PLAN.md; eski v1.4 hizmet binası testinin yerine).
   1) katalog boş, etkiler 0, kilitler (turist / toptancı) bina şartı olmadan seviye koşuluyla; parseller yerleşimde ayrılı değil
   2) eski kayıt: kurulu binaların bedeli kasaya iade edilir (bildirimle), kayda geri yazılmaz
   3) alt çubukta BİNA yok, PERSONEL var: bölge kadroları, müdür ve devret kartları orada; YÜKSELT'te yalnız oyuncu gelişimi
   4) TR/EN; sayfa hatası yok. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => { window.__ns = setInterval(() => { ['stallScr', 'prepScr', 'dayScr'].forEach(id => { const e = document.getElementById(id); if (e && !e.classList.contains('hidden')) document.getElementById(id.replace('Scr', 'Go')).click(); }); }, 150); });
  const R = {};
  /* 1) katalog + etkiler + kilitler + yerleşim */
  R.cat = await p.evaluate(() => {
    BT.S.tut = 99; BT.S.ctrl = 2;
    return { n: BT.SERV.length, cnt: BT.servCount(), eff: ['stock', 'ctrcap', 'wage', 'upcost', 'value', 'rep', 'ctrslot', 'custval', 'queue'].map(k => BT.servEff(k)),
      unl: ['turist', 'toptanci', 'ctr'].map(t => BT.servUnlock(t)), plots: BT.layoutRects().filter(r => /^parsel /.test(r.id)).length,
      cust: BT.CUST.filter(t => t.id === 'turist' || t.id === 'toptanci').map(t => t.id + ':' + t.lvl) };
  });
  ok(R.cat.n === 0 && R.cat.cnt === 0 && R.cat.eff.every(v => v === 0), 'hizmet kataloğu / etkisi kalmış ' + JSON.stringify(R.cat));
  ok(R.cat.unl.every(Boolean) && R.cat.cust.join() === 'toptanci:4,turist:4', 'kilitler / seviye koşulu yanlış ' + JSON.stringify(R.cat));
  ok(R.cat.plots === 0, 'parseller yerleşimde ayrılı ' + R.cat.plots);
  /* 2) eski kayıt: Buzhane Sv2 (900 + 2.600) + Mezat Sv1 → iade */
  R.old = await p.evaluate(async () => {
    const d = JSON.parse(JSON.stringify(BT.buildSave())); d.cash = 100; d.serv = [['buzhane', 2, 'p1'], ['mezat', 1, 'p3']];
    BT.loadFrom(d); await new Promise(r => setTimeout(r, 1700));
    return { cash: BT.S.cash, toast: document.getElementById('toast').textContent, cnt: BT.servCount(), saved: (BT.buildSave().serv || []).length };
  });
  ok(R.old.cash > 100 + 3500 && /Hizmet Sahası kaldırıldı/.test(R.old.toast) && R.old.cnt === 0 && R.old.saved === 0, 'eski kayıt iadesi yanlış ' + JSON.stringify(R.old));
  /* 3) alt çubuk: PERSONEL */
  R.bar = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('.dtab')].map(b => b.dataset.t + ':' + b.innerText.trim()) }));
  ok(!R.bar.tabs.some(t => /^serv:/.test(t)) && R.bar.tabs.some(t => /^staff:PERSONEL$/.test(t)), 'alt çubukta PERSONEL yok ' + JSON.stringify(R.bar));
  await p.evaluate(() => { BT.S.cash = 50000; BT.hire('hamal', true, 0); BT.hire('filetocu', true, 0); BT.hire('tezgahtar', true, 0); BT.hire('balikci', true, 0); });
  await p.evaluate(() => document.querySelector('.dtab[data-t="staff"]').click()); await sleep(300);
  await p.evaluate(() => { const g = document.getElementById('helpGo'); if (g && g.offsetParent) g.click(); }); await sleep(200);
  R.staff = await p.evaluate(() => ({ title: document.getElementById('dpTitle').textContent, cards: [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')) }));
  ok(/PERSONEL/.test(R.staff.title) && R.staff.cards.some(t => /personeli/.test(t)) && R.staff.cards.some(t => /Müdür|Devret|OTOMAT/i.test(t)), 'PERSONEL kartları ' + JSON.stringify(R.staff));
  await p.evaluate(() => document.querySelector('.dtab[data-t="level"]').click()); await sleep(300);
  R.level = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.innerText.replace(/\s+/g, ' ')));
  ok(!R.level.some(t => /personeli|Müdür gerekli|Devret/i.test(t)), 'YÜKSELT\'te personel kartı kalmış ' + JSON.stringify(R.level));
  /* 4) EN */
  R.en = await p.evaluate(() => { BT.setLang('en'); return { tab: document.getElementById('dtServ').textContent, t: BT.T('servRefund', { n: '$1' }) }; });
  ok(R.en.tab === 'STAFF' && /Service Yard is gone/.test(R.en.t), 'EN metin ' + JSON.stringify(R.en));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1));
  console.log(fail.length ? 'HIZMET_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: hizmet sahası kaldırma testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
