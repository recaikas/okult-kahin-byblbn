/* v2.10 — personel sırası: bir bölgede aynı rolden ikincisi, bütün roller birer tane olmadan alınamaz.
   Arayüzde ikinci hamal kartı kilitli ve "Önce eksik rolleri al: Filetocu, Tezgâhtar, Tahsildar" der;
   dört rol tamamlanınca ikinci hamal açılır, ikinci filetocu ise yine kilitlidir (hamal 2, diğerleri 1 değil — sıra eşitlenir). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; BT.S.cash = 1e6; BT.S.rep = 5000; BT.areas[0].lvl = 5; });
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map((c, i) => ({ i, t: c.querySelector('b') ? c.querySelector('b').textContent : '', s: c.innerText, no: !!c.querySelector('.buy.no') })));
  const openZone = async () => {
    await p.evaluate(() => { const t = document.querySelector('.dtab[data-t="level"]'); if (!t.classList.contains('on')) t.click(); });
    await sleep(250);
    const cs0 = await cards(); if (cs0.length && /GERİ|BACK/.test(cs0[0].t)) return;   /* zaten bölge listesinde */
    const zc = cs0.find(c => /personeli|staff/i.test(c.t));
    await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), zc.i); await sleep(250);
  };
  const buy = async role => {
    await openZone();
    const c = (await cards()).find(c => c.t.indexOf(role) === 0);
    if (!c || c.no) return { blocked: true, s: c && c.s };
    await p.evaluate(i => { const b = document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy'); b.click(); b.click(); b.click(); }, c.i); await sleep(250);   /* hızlı üçlü dokunuş: yalnız biri alınmalı */
    return { blocked: false };
  };
  R.h1 = await buy('Hamal');
  R.h2 = await buy('Hamal');
  R.counts1 = await p.evaluate(() => BT.roleCount(0, 'hamal'));
  for (const r of ['Filetocu', 'Tezgâhtar', 'Tahsildar']) R[r] = await buy(r);
  R.f2 = await buy('Filetocu');
  R.h2b = await buy('Hamal');
  R.counts2 = await p.evaluate(() => ['hamal', 'filetocu', 'tezgahtar', 'kasiyer'].map(r => BT.roleCount(0, r)));
  ok(!R.h1.blocked && R.h2.blocked && /Önce eksik rolleri al: Filetocu, Tezgâhtar, Tahsildar/.test(R.h2.s) && R.counts1 === 1, 'ikinci hamal engellenmedi ' + JSON.stringify([R.h1, R.h2, R.counts1]));
  ok(!R.Filetocu.blocked && !R['Tezgâhtar'].blocked && !R.Tahsildar.blocked, 'eksik roller alınamadı');
  ok(!R.f2.blocked && !R.h2b.blocked, 'kadro tamamlanınca ikinciler açılmadı ' + JSON.stringify([R.f2, R.h2b]));
  ok(JSON.stringify(R.counts2) === '[2,2,1,1]', 'sayılar yanlış ' + JSON.stringify(R.counts2));
  R.block = await p.evaluate(() => BT.roleBlock(0, 'hamal'));
  ok(/Tezgâhtar, Tahsildar/.test(R.block), 'üçüncü hamal kilidi yanlış ' + R.block);
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'PERSONEL_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: personel sırası testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
