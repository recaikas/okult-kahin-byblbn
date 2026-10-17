/* v2.15 — Alp Er Tunga nöbette: hikâyenin 6. gününden önce yok, sonra limanda; o gün hikâye ziyaretçisiyse ikinci kez çizilmez */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], fail = [], ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  const R = await p.evaluate(async () => {
    const on = HKG.v('guardOn'), w = ms => new Promise(r => setTimeout(r, ms)), o = {};
    BT.storySet({ step: 5 }); o.s5 = on();
    BT.storySet({ step: 6 }); o.s6 = on(); await w(400);
    BT.storySet({ step: 12 }); o.s12 = on(); await w(400);
    o.canStand = BT.canStand(HKG.v('GUARD').x, HKG.v('GUARD').y);
    return o;
  });
  ok(!R.s5 && R.s6 && R.s12, 'nöbet görünürlüğü yanlış ' + JSON.stringify(R));
  ok(!R.canStand, 'bekçi yürüme alanında duruyor');
  await b.close();
  console.log(JSON.stringify({ R, errs }));
  console.log(fail.length || errs.length ? 'BEKCI_FAIL ' + JSON.stringify(fail) : 'BEKCI_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
