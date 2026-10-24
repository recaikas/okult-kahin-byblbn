/* v2.22-ist — Meşe Talaşı Bacası artık Fümehane istasyon seviyesi (YÜKSELT › Fümehane n/5): tütme hızı +%10/adım (Sv5 +%60),
   giriş bandı +1/adım. Eski kayıtta smkLv 1/2/3 → Sv 2/3/4; YAPI › Geliştirme'de baca kartı artık yok. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8123/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => { const S = BT.S; S.ctrl = 2; S.rep = 260; S.cash = 1e6; S.tut = 99; BT.areas.forEach((a, i) => { a.locked = i >= 3; a.lvl = 1; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true)); });
  const time1 = () => p.evaluate(async () => {
    BT.smoker.inn.length = 0; BT.smoker.cur = null; BT.smoker.t = 0; BT.smoker.mat.items.length = 0; BT.smoker.inn.push({ k: 'fileto', f: 'levrek' });
    const t0 = performance.now();
    while (!BT.smoker.mat.items.length && performance.now() - t0 < 8000) await new Promise(r => setTimeout(r, 30));
    return (performance.now() - t0) / 1000;
  });
  /* YAPI › Geliştirme'de baca kartı yok */
  await p.click('.dtab[data-t="build"]'); await sleep(250); await p.click('#dpSub button[data-s="dev"]'); await sleep(250);
  const dev = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard b')].map(x => x.textContent).join('|'));
  ok(!/Meşe Talaşı/.test(dev), 'baca kartı hâlâ Geliştirme\'de: ' + dev);
  await p.evaluate(() => document.getElementById('dpClose') && document.getElementById('dpClose').click()); await sleep(150);
  /* Sv1 / Sv3 / Sv5 tütme süresi: 3,2 → 2,67 → 2,0 sn; giriş bandı 8 → 10 → 14 */
  const res = {};
  for (const lv of [1, 3, 5]) {
    await p.evaluate(l => { BT.S.stLv = { 2: { smk: l } }; }, lv);
    res[lv] = { t: await time1(), max: await p.evaluate(() => BT.st.smokerMax()) };
  }
  ok(res[1].t > 2.9 && res[1].t < 3.9 && res[1].max === 8, 'Sv1 ' + JSON.stringify(res[1]));
  ok(res[3].t > 2.4 && res[3].t < 3.1 && res[3].max === 10, 'Sv3 ' + JSON.stringify(res[3]));
  ok(res[5].t > 1.8 && res[5].t < 2.5 && res[5].max === 14, 'Sv5 ' + JSON.stringify(res[5]));
  ok(res[3].t < res[1].t && res[5].t < res[3].t, 'hız seviyeyle artmıyor');
  /* eski kayıt göçü: smkLv 1/2/3 → Sv 2/3/4 (hız ve kart) */
  const mig = await p.evaluate(() => [1, 2, 3].map(l => { const d = BT.buildSave(); delete d.stlv; d.smkLv = l; BT.S.stLv = {}; BT.loadFrom(d); return [BT.st.lv(2, 'smk'), BT.st.smokeBoost()]; }));
  ok(JSON.stringify(mig.map(m => m[0])) === '[2,3,4]' && Math.abs(mig[2][1] - 1.3) < 1e-9, 'göç ' + JSON.stringify(mig));
  /* YÜKSELT'te Fümehane n/5 kartı */
  await p.evaluate(() => { BT.S.stLv = { 2: { smk: 2 } }; BT.S.cash = 1e6; });
  await p.click('.dtab[data-t="level"]'); await sleep(300);
  const cd = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.querySelector('b').textContent + ' ' + d.querySelector('small').textContent).find(t => /^Fümehane\s+2\/5/.test(t)));
  ok(cd && /Sv\.3: Tütme \+%10 · giriş bandı \+1/.test(cd), 'Fümehane kartı ' + cd);
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ res, mig }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: Fümehane (baca) istasyon testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
