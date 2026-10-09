/* Yazı/balon/logo/parlama/siyah geçiş katmanı: 1920×1080 saydam PNG dizisi → store/video/trailer2/frames-overlay/ */
const { chromium } = require('../../../test-offline'); const fs = require('fs'), path = require('path');
const MODE = process.argv[2] || 'full', LANG = process.argv[4] || 'en', ORI = process.argv[5] || 'h', FPS = 30, VW = ORI === 'v' ? 1080 : 1920, VH = ORI === 'v' ? 1920 : 1080;
const OUT = path.resolve(__dirname, '..', '..', 'video', 'trailer2', MODE === 'preview' ? 'prev-overlay' : (LANG === 'en' && ORI === 'h' ? 'frames-overlay' : `frames-overlay-${LANG}-${ORI}`));
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: VW, height: VH } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8099/store/tools/trailer2/overlay.html?lang=' + LANG + '&o=' + ORI); await p.evaluate(() => window.ready);
  const times = MODE === 'preview' ? (process.argv[3] || '3,7,10,13,17,18.5,20,22,23.5,25,27,31,35,38,40,43,45,47,53.8,57,58.5,59.8').split(',').map(Number) : Array.from({ length: 60 * FPS }, (_, i) => i / FPS);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.setT(t), times[i]);
    await p.screenshot({ path: path.join(OUT, (MODE === 'preview' ? String(times[i]) : String(i).padStart(5, '0')) + '.png'), omitBackground: true });
  }
  await b.close(); console.log('overlay kare', times.length);
})();
