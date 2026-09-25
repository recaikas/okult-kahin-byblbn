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
  /* v1.2: ilerleme/itibar yolu KENDİLİĞİNDEN yenilemez */
  await p.evaluate(() => { BT.S.ctrl = 2; BT.areas[1].locked = false; BT.S.rep = 400; BT.HUT.lvl = 1; BT.DEPOT.lvl = 1; BT.rebuildCounters(); });
  await sleep(1800);
  await p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  R.noAuto = await p.evaluate(() => BT.envStage());
  ok(R.noAuto === 0, 'itibarla yol kendiliğinden yenilendi ' + R.noAuto);
  /* YAPI › Dekoratif: seviye yetmezse kilitli, parası yetmezse alınmaz, ikisi de varsa alınır */
  await p.evaluate(() => { BT.S.rep = 0; BT.S.cash = 50000; });
  await p.click('.dtab[data-t="build"]'); await sleep(250); await p.click('#dpSub button[data-s="decor"]'); await sleep(250);
  R.locked = await p.evaluate(() => { const c = document.querySelector('#dpCards .dcard'); return { t: c.querySelector('b').textContent, btn: c.querySelector('.buy').textContent }; });
  ok(/Çakıl Yol/.test(R.locked.t) && /Seviye 3/.test(R.locked.btn), 'çakıl yol kartı kilitli değil ' + JSON.stringify(R.locked));
  await p.evaluate(() => document.querySelector('#dpCards .dcard .buy').click()); await sleep(200);
  ok(await p.evaluate(() => BT.envStage()) === 0, 'seviye şartı olmadan alındı');
  await p.evaluate(() => { BT.S.rep = 30; }); await p.click('#dpSub button[data-s="decor"]'); await sleep(250);
  const flow0 = await p.evaluate(() => BT.envFlow());
  for (let k = 0; k < 2; k++) { await p.evaluate(() => document.querySelector('#dpCards .dcard .buy').click()); await sleep(200); }
  R.bought = await p.evaluate(() => ({ env: BT.envStage(), cash: BT.S.cash, flow: BT.envFlow(), next: document.querySelector('#dpCards .dcard b').textContent }));
  ok(flow0 === 0 && R.bought.env === 1 && R.bought.cash === 48200 && R.bought.flow > 0.07 && /Arnavut/.test(R.bought.next), 'çakıl yol alınamadı ' + JSON.stringify(R.bought));
  await sleep(1300);
  R.toast = await p.evaluate(() => document.getElementById('toast').textContent);
  ok(/çakıl/.test(R.toast), 'kademe bildirimi yok ' + R.toast);
  /* kayıt/yükleme: satın alınan kademe korunur; eski kayıt (env alanı yok) görünümünü kaybetmez */
  R.save = await p.evaluate(() => { const d = BT.buildSave(); const e1 = d.env; delete d.env; return { e1, legacyOK: typeof BT.legacyEnvStage() === 'number' }; });
  ok(R.save.e1 === 1 && R.save.legacyOK, 'kayıt alanı yanlış ' + JSON.stringify(R.save));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'ENV_FAIL ' + JSON.stringify(fail) : 'ENV_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
