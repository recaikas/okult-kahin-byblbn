/* v0.6 — çöp kovası + oyun içi müzik testi */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.mouse.click(215, 400); await sleep(400);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(2500);
  R.music = await p.evaluate(() => BT.music());
  ok(R.music.on && R.music.mode === 'game', 'oyunda müzik yok');
  /* müzik kapat / aç ayarı */
  R.musOff = await p.evaluate(async () => { document.getElementById('musOff').click(); await new Promise(r => setTimeout(r, 200)); const a = BT.music().on; document.getElementById('musOn').click(); await new Promise(r => setTimeout(r, 200)); return [a, BT.music().on]; });
  ok(R.musOff[0] === false && R.musOff[1] === true, 'müzik ayarı çalışmıyor');
  /* çöp kovası */
  R.trash = await p.evaluate(async () => {
    BT.S.ctrl = 2;
    const bn = BT.BINS[0], P = BT.player;
    P.carry.length = 0;
    for (let i = 0; i < 4; i++) P.carry.push({ k: 'fish', f: 'hamsi' });   /* ham balık: tezgâh almaz, yalnız kova alır */
    P.carry.push({ k: 'money', v: 30 });
    /* kovanın yanından hızla geçmek atmaz */
    P.x = bn.x; P.y = bn.y + 0.4; await new Promise(r => setTimeout(r, 250));
    P.x = 4.5; P.y = 3.2;
    const afterPass = P.carry.length;
    /* önünde durunca boşalır, para kalır */
    P.x = bn.x; P.y = bn.y + 0.4; await new Promise(r => setTimeout(r, 1500));
    const left = P.carry.map(i => i.k);
    /* tezgâhın her yanında durmak kovayı tetiklememeli */
    let stallDump = 0;
    for (const c of BT.counters) for (let a = 0; a < 12; a++) {
      P.carry.length = 0; P.carry.push({ k: 'fish', f: 'hamsi' });
      P.x = c.x + Math.cos(a / 12 * 6.283) * 1.2; P.y = c.y + Math.sin(a / 12 * 6.283) * 1.2;
      await new Promise(r => setTimeout(r, 60));
      if (!P.carry.length) stallDump++;
    }
    P.carry.length = 0;
    return { afterPass, left, stallDump };
  });
  ok(R.trash.afterPass === 5, 'kovanın yanından geçerken mal atıldı');
  ok(R.trash.left.length === 1 && R.trash.left[0] === 'money', 'kova boşaltmadı / parayı attı ' + JSON.stringify(R.trash));
  ok(R.trash.stallDump === 0, 'tezgâh önünde kova tetiklendi');
  /* kovalar istasyonlara çarpmıyor */
  R.clear = await p.evaluate(() => BT.BINS.map(bn => {
    const pts = [];
    BT.counters.forEach(c => { pts.push([c.x, c.y], [c.tray.x, c.tray.y], [10.8, c.y]); });
    BT.tables.forEach(t => { pts.push([t.x, t.y], [t.mat.x, t.mat.y]); });
    BT.spots.forEach(s => pts.push([s.x, s.y]));
    BT.slots.forEach(s => pts.push([s.x, s.y])); BT.PLOTS.forEach(s => pts.push([s.x, s.y]));
    return Math.min(...pts.map(q => Math.hypot(q[0] - bn.x, q[1] - bn.y)));
  }));
  ok(R.clear.every(d => d >= 1.1), 'kova bir istasyona çok yakın ' + JSON.stringify(R.clear));
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'TRASH_FAIL ' + JSON.stringify(fail) : 'TRASH_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
