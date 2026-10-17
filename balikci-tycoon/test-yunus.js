/* v2.15 — "Şahmeran" sahnesi denizden gelen yunusla başlar: yüzgeç → üç sıçrayış → kıyıda bekler; oyuncu kıyıya
   gelince sahne açılır, bitince yunus derine dalar. İsteğe bağlı: node test-yunus.js <görüntü klasörü> */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = [], fail = [], R = {}, ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  await p.evaluate(() => { window.HK_STORY_OFF = 0; BT.S.tut = 99; BT.S.ctrl = 2; BT.storySet({ step: 7, last: 0 }); BT.day.n = 9; BT.day.phase = 'play'; BT.day.t = 40;
    BT.player.x = 3; BT.player.y = 2.8; document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); HKG.v('syncPause')(); });
  for (let i = 0; i < 20 && !(await p.evaluate(() => !!BT.dolph())); i++) await sleep(500);
  R.spawn = await p.evaluate(() => { const d = BT.dolph(); return d && { st: d.st, y: d.y, vis: BT.story().vis === d }; });
  ok(R.spawn && R.spawn.vis, 'yunus gelmedi ' + JSON.stringify(R.spawn));
  for (let i = 0; i < 20 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'leap'; i++) await sleep(300);
  await sleep(450); if (SHOT) await p.screenshot({ path: SHOT + '/yunus-1-sicrayis.png' });
  for (let i = 0; i < 30 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'wait'; i++) await sleep(300);
  R.wait = await p.evaluate(() => ({ st: BT.dolph().st, open: BT.story().open }));
  ok(R.wait.st === 'wait' && !R.wait.open, 'yunus beklemiyor ' + JSON.stringify(R.wait));
  await sleep(600); if (SHOT) await p.screenshot({ path: SHOT + '/yunus-2-bekliyor.png' });
  await p.evaluate(() => { const d = BT.dolph(); BT.player.x = d.c.x; BT.player.y = d.c.y; });
  await sleep(1500);
  R.open = await p.evaluate(() => BT.story().open);
  ok(R.open, 'kıyıya gelince sahne açılmadı');
  if (SHOT) await p.screenshot({ path: SHOT + '/yunus-3-sahne.png' });
  await p.evaluate(() => { const v = BT.story().vis; window.HK_STORY.close && window.HK_STORY.close(); HKG.v('storyRelease')(v); });
  await sleep(500);
  R.after = await p.evaluate(() => ({ st: BT.dolph() && BT.dolph().st, vis: !!BT.story().vis }));
  ok((R.after.st === 'out' || R.after.st === null) && !R.after.vis, 'yunus gitmedi ' + JSON.stringify(R.after));
  await b.close();
  console.log(JSON.stringify({ R, errs }));
  console.log(fail.length || errs.length ? 'YUNUS_FAIL ' + JSON.stringify(fail) : 'YUNUS_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
