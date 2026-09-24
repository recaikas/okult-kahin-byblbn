/* v0.8 — çevre gelişimi: başta bakımsız (kademe 0), ilerledikçe kademe artar ve bildirilir;
   manzara oyun alanına yakın, meydan/yol/bölgelerle çakışmaz. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  R.start = await p.evaluate(() => {
    const sc = BT.scenery, M = BT.MEYDAN;
    const bad = sc.filter(d => (d.x < 10.2 && d.y < 17.8) || (d.x > 10.2 && d.x < 14.6) || (d.x > M.x0 - 0.5 && d.x < M.x1 + 0.5 && d.y > M.y0 - 0.5 && d.y < M.y1 + 0.5));
    const near = sc.filter(d => d.y < 22 && d.x < 22).length;
    return { env: BT.envStage(), n: sc.length, bad: bad.length, near, worn: sc.filter(d => d.up > BT.envStage()).length };
  });
  ok(R.start.env === 0 && R.start.n >= 30 && R.start.n <= 60 && R.start.bad === 0 && R.start.worn >= 25, 'başlangıç çevresi yanlış ' + JSON.stringify(R.start));
  /* ilerleme → kademe artar + bildirim */
  await p.evaluate(() => { BT.S.ctrl = 2; BT.areas[1].locked = false; BT.S.rep = 30; BT.rebuildCounters(); });
  await sleep(1800);
  await p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await sleep(1500);
  R.up = await p.evaluate(() => ({ env: BT.envStage(), toast: document.getElementById('toast').textContent }));
  ok(R.up.env === 1, 'kademe artmadı ' + JSON.stringify(R.up));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'ENV_FAIL ' + JSON.stringify(fail) : 'ENV_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
