/* Meşe Talaşı Bacası (Fümehane, YAPI › Geliştirme): 3 seviye tütme hızı ×1,35/×1,7/×2,0; kilit, satın alma, kayıt. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map((d, i) => ({ i, t: (d.querySelector('b') || {}).textContent || '', s: (d.querySelector('small') || {}).textContent || '', btn: (d.querySelector('.buy') || {}).textContent || '', cls: (d.querySelector('.buy') || {}).className || '' })).filter(c => /Meşe|Oak-Chip/.test(c.t)));
  const open = async () => { await p.evaluate(() => { const ss = document.getElementById('stallScr'); if (ss) ss.classList.add('hidden'); document.getElementById('dpClose') && document.getElementById('dpClose').click(); }); await sleep(150); await p.click('.dtab[data-t="build"]'); await sleep(250); await p.click('#dpSub button[data-s="dev"]'); await sleep(250); };
  const time1 = () => p.evaluate(async () => {   /* tek balığın tütülme süresi (sn) */
    BT.smoker.inn.length = 0; BT.smoker.cur = null; BT.smoker.t = 0; BT.smoker.mat.items.length = 0; BT.smoker.inn.push({ k: 'fileto', f: 'levrek' });
    const t0 = performance.now();
    while (!BT.smoker.mat.items.length && performance.now() - t0 < 8000) await new Promise(r => setTimeout(r, 30));
    return (performance.now() - t0) / 1000;
  });

  /* kilitli: Fümehane kapalı */
  await p.evaluate(() => { const S = BT.S; S.ctrl = 2; S.rep = 260; S.cash = 1e6; S.tut = 99; BT.areas.forEach((a, i) => { a.locked = i >= 2; a.lvl = 1; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true)); });
  await open();
  let c = await cards();
  ok(c.length === 1 && /Önce Fümehane/.test(c[0].btn) && /no/.test(c[0].cls), 'kilitliyken kart "Önce Fümehane" göstermeli ' + JSON.stringify(c));
  ok(c[0] && /×1,35/.test(c[0].s) && /Meşe Talaşı Bacası/.test(c[0].t), 'kart metni ' + JSON.stringify(c));

  /* açık: satın alma 3 seviye */
  await p.evaluate(() => { BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true)); BT.S.cash = 1e6; BT.S.smkLv = 0; });
  const t0 = await time1();
  ok(t0 > 2.9 && t0 < 3.9, 'Lv0 süre ~3,2 sn değil: ' + t0);
  const costs = [2500, 6500, 15000], mult = ['×1,7', '×2'], speeds = [t0];
  for (let lv = 0; lv < 3; lv++) {
    await open(); c = await cards();
    ok(c.length === 1 && c[0].t.includes((lv + 1) + '/3'), 'Lv' + lv + ' kart başlığı ' + JSON.stringify(c));
    const exp = await p.evaluate(v => BT.upCost(v), costs[lv]);
    ok(c[0] && c[0].btn.replace(/\D/g, '') == String(exp), 'fiyat ' + JSON.stringify(c) + ' beklenen ' + exp);
    const cash0 = await p.evaluate(() => BT.S.cash);
    await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), c[0].i); await sleep(200);
    await p.evaluate(() => { const b = document.querySelector('#dpCards .buy.cf'); if (b) b.click(); }); await sleep(250);
    const st = await p.evaluate(() => ({ lv: BT.S.smkLv, cash: BT.S.cash }));
    ok(st.lv === lv + 1 && cash0 - st.cash === exp, 'satın alma Lv' + (lv + 1) + ' ' + JSON.stringify({ st, cash0, exp }));
    speeds.push(await time1());
  }
  ok(speeds[3] > 1.3 && speeds[3] < 1.95, 'Lv3 süre ~1,6 sn değil: ' + speeds);
  ok(speeds[1] < speeds[0] && speeds[2] < speeds[1] && speeds[3] < speeds[2], 'hız seviyeyle artmıyor ' + speeds);
  await open(); c = await cards();
  ok(c.length === 1 && /done/.test(c[0].cls) && c[0].t.includes('3/3'), 'son seviyede "sahip" kartı olmalı ' + JSON.stringify(c));

  /* yetersiz para */
  await p.evaluate(() => { BT.S.smkLv = 1; BT.S.cash = 100; });
  await open(); c = await cards();
  const poor = await p.evaluate(i => { document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(); document.querySelectorAll('#dpCards .buy.cf').forEach(b => b.click()); return BT.S.smkLv; }, c[0].i);
  ok(poor === 1 && /no/.test(c[0].cls), 'parasız satın alındı ' + poor);

  /* kayıt */
  const sv = await p.evaluate(() => { BT.S.smkLv = 3; const d = BT.buildSave(); BT.S.smkLv = 0; BT.loadFrom(d); const a = BT.S.smkLv; const old = BT.buildSave(); delete old.smkLv; BT.S.smkLv = 2; BT.loadFrom(old); return { saved: d.smkLv, loaded: a, oldLoaded: BT.S.smkLv }; });
  ok(sv.saved === 3 && sv.loaded === 3 && sv.oldLoaded === 0, 'kayıt/yükleme ' + JSON.stringify(sv));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ speeds, sv }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: Meşe Talaşı Bacası testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
