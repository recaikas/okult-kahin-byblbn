/* v2.3 — ses kanalları ve gürültü sınırı:
   1) müzik, efekt, ortam ayrı kanallar; ayarlarda üç kaydırıcı, değer tercihe yazılır ve yeniden yüklemede döner;
   2) uzaktaki çalışanın sesi çalmaz, yakındaki çalışanın sesi seyreltilir; oyuncunun kendi sesi hep çalar;
   3) aynı anda gelen çok sayıda iş sesi sınırlanır (uğultu olmaz). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); const p = await ctx.newPage();
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);

  R.bus = await p.evaluate(() => BT.snd());
  ok(R.bus.buses, 'ses kanalları kurulmadı ' + JSON.stringify(R.bus));

  R.ui = await p.evaluate(async () => {
    BT.ui.openSettings(); await new Promise(r => setTimeout(r, 250));
    const r = document.getElementById('volSfxR'), l = document.getElementById('volMusL');
    r.value = 25; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change'));
    const m = document.getElementById('volMusR'); m.value = 40; m.dispatchEvent(new Event('input')); m.dispatchEvent(new Event('change'));
    const pref = JSON.parse(localStorage.getItem('balikci_pref')).vol;
    BT.ui.closeSettings();
    return { vol: BT.snd().vol, pref, lbl: l.textContent, n: document.querySelectorAll('.vols input[type=range]').length };
  });
  ok(R.ui.n === 3 && R.ui.vol.sfx === 0.25 && R.ui.vol.mus === 0.4 && R.ui.pref[1] === 0.25 && /Müzik · 40%/.test(R.ui.lbl), 'ses kaydırıcıları çalışmıyor ' + JSON.stringify(R.ui));

  R.thr = await p.evaluate(async () => {
    const P = BT.player, st = () => BT.snd().stat, out = {};
    let a = st();
    for (let i = 0; i < 40; i++) BT.sfxFrom({ x: P.x + 20, y: P.y }, () => BT.sfx.pick());             /* uzak çalışan */
    out.far = st().played - a.played;
    await new Promise(r => setTimeout(r, 400)); a = st();
    for (let i = 0; i < 40; i++) BT.sfxFrom({ x: P.x + 1, y: P.y }, () => BT.sfx.drop());              /* yakın çalışan, aynı anda 40 */
    out.nearBurst = st().played - a.played;
    await new Promise(r => setTimeout(r, 400)); a = st();
    BT.sfxFrom(P, () => BT.sfx.pick()); out.player = st().played - a.played;
    return out;
  });
  ok(R.thr.far === 0, 'uzaktaki çalışanın sesi çalıyor ' + JSON.stringify(R.thr));
  ok(R.thr.nearBurst >= 1 && R.thr.nearBurst <= 2, 'aynı anda gelen iş sesleri sınırlanmıyor ' + JSON.stringify(R.thr));
  ok(R.thr.player === 1, 'oyuncunun kendi sesi çalmadı ' + JSON.stringify(R.thr));

  await p.reload(); await sleep(1000);
  R.reload = await p.evaluate(() => BT.snd().vol);
  ok(R.reload.sfx === 0.25 && R.reload.mus === 0.4, 'ses ayarı yeniden yüklemede kayboldu ' + JSON.stringify(R.reload));

  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'V23_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: v2.3 ses testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
