/* v2.14 — sahne müzikleri: Haşmet Bey (Yeşilçam kötüsü) ve Şahmeran temaları ses üretir, menü müziğiyle benzer
   seviyede; çalarken oyunun parçası yerinde bekler, bitince aynı yerden devam eder; memur ve hikâye ziyaretçisi
   temaları kendiliğinden başlatıp bitirir. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(1200);
  await p.mouse.click(200, 400); await sleep(2500);
  await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    window.__rms = node => new Promise(r => { const AC = HKG.v('AC'), an = AC.createAnalyser(); an.fftSize = 2048; node.connect(an); const d = new Float32Array(2048); let s = 0, n = 0; const iv = setInterval(() => { an.getFloatTimeDomainData(d); for (const v of d) s += v * v; n += d.length; }, 40); setTimeout(() => { clearInterval(iv); try { node.disconnect(an); } catch (e) {} r(+(20 * Math.log10(Math.sqrt(s / n) + 1e-9)).toFixed(1)); }, 6000); }); });
  for (const id of ['hasmet', 'sahmeran']) {
    const pos0 = await p.evaluate(() => BT.cue.pos());
    await p.evaluate(id => BT.cue.play(id), id);
    await sleep(500);
    R[id] = await p.evaluate(() => ({ on: BT.cue.on(), held: BT.cue.held() }));
    R[id].db = await p.evaluate(() => window.__rms(HKG.v('CUE').gain));
    R[id].pos = await p.evaluate(() => BT.cue.pos());
    ok(R[id].on === id && R[id].held, id + ' başlamadı ' + JSON.stringify(R[id]));
    ok(R[id].db > -46 && R[id].db < -24, id + ' ses seviyesi uygun değil ' + R[id].db);
    ok(JSON.stringify(R[id].pos) === JSON.stringify(pos0), id + ': oyunun parçası beklemedi ' + JSON.stringify([pos0, R[id].pos]));
    await p.evaluate(() => BT.cue.stop()); await sleep(3500);
    R[id + 'After'] = await p.evaluate(() => ({ on: BT.cue.on(), held: BT.cue.held(), pos: BT.cue.pos() }));
    ok(!R[id + 'After'].on && !R[id + 'After'].held && JSON.stringify(R[id + 'After'].pos) !== JSON.stringify(pos0), id + ': oyun müziği devam etmedi ' + JSON.stringify(R[id + 'After']));
  }
  /* memur gelince Haşmet teması, gidince biter */
  await p.evaluate(() => { BT.day.n = 7; BT.day.t = BT.DAY_LEN * 0.31; BT.S.cash = 1000; const q = BT.tax.q(); q.items = 10; q.due = 50; q.last = 0; });
  await sleep(800);
  R.taxOn = await p.evaluate(() => BT.cue.on());
  ok(R.taxOn === 'hasmet', 'memur gelince tema başlamadı ' + R.taxOn);
  for (let i = 0; i < 80 && await p.evaluate(() => BT.tax.st().on); i++) await sleep(1000);
  await sleep(500);
  R.taxOff = await p.evaluate(() => ({ on: BT.cue.on(), held: BT.cue.held() }));
  ok(!R.taxOff.on && !R.taxOff.held, 'memur gidince tema bitmedi ' + JSON.stringify(R.taxOff));
  /* hikâye ziyaretçisi yürürken Şahmeran teması; sahne bitince biter */
  R.story = await p.evaluate(() => {
    window.HK_STORY_OFF = 0; const sp = HKG.v('storySpawn'); const okS = window.HK_STORY ? sp() : false;
    return { spawned: okS };
  });
  if (R.story.spawned) {
    await p.evaluate(() => { HKG.v('cuePlay')('sahmeran'); });   /* updateStory'nin yaptığı gibi */
    R.story.on = await p.evaluate(() => BT.cue.on());
    await p.evaluate(() => { const v = HKG.v('storyVis'); BT.S.story.last = BT.day.n; HKG.v('storyRelease')(v); }); await sleep(3200);   /* gerçek akışta sahne bitince günün hikâyesi tamam sayılır */
    R.story.after = await p.evaluate(() => ({ on: BT.cue.on(), held: BT.cue.held() }));
    ok(R.story.on === 'sahmeran' && !R.story.after.on && !R.story.after.held, 'hikâye teması akışı yanlış ' + JSON.stringify(R.story));
  }
  R.code = await p.evaluate(() => { const src = HKG.v('updateStory').toString(); return /cuePlay\('sahmeran'\)/.test(src); });
  ok(R.code, 'hikâye ziyaretçisi temayı başlatmıyor');
  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'SAHNE_MUZIK_FAIL ' + JSON.stringify(fail) : 'SAHNE_MUZIK_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
