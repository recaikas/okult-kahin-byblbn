/* Motor sahnelerini 1920×808 kare dizisine çevirir → store/video/trailer2/frames-<klip>/  Kullanım: node render-engine.js <klip_id>|all [preview] */
const { chromium } = require('../../../test-offline'); const fs = require('fs'), path = require('path');
const TL = require('./timeline.json'), FPS = 30, POST = 24, WHICH = process.argv[2] || 'all', MODE = process.argv[3] || 'full', ORI = process.argv[4] || 'h', VERT = ORI === 'v';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: VERT ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8099/store/tools/trailer2/engine.html' + (VERT ? '?o=v' : '')); await p.evaluate(() => window.ready);
  for (const c of TL.clips.filter(c => c.src === 'engine' && (WHICH === 'all' || WHICH === c.id))) {
    const dir = path.resolve(__dirname, '..', '..', 'video', 'trailer2', (MODE === 'preview' ? 'prev-' : VERT ? 'frames-v-' : 'frames-') + c.id); if (MODE !== 'post') fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const N = Math.round(c.len * FPS), pick = MODE === 'preview' ? [4, Math.floor(N * 0.4), Math.floor(N * 0.8), N - 3] : null;
    for (let k = (MODE === 'post' ? N : 0); k < (MODE === 'post' || MODE === 'full' ? N + (c.id === 'golden' ? 0 : POST) : N); k++) {
      if (pick && !pick.includes(k)) continue;
      const t = (c.t0 || 0) + k / FPS; let ov = {};
      if (c.id === 'cards') { const per = 4 * TL.BEAT, i = Math.min(TL.cards.length - 1, Math.floor(k / FPS / per)); ov = { card: TL.cards[i] }; await p.evaluate(([s, t, o]) => window.render(s, t, o), [c.scene, k / FPS - i * per, ov]); }
      else await p.evaluate(([s, t]) => window.render(s, t, {}), [c.scene, t]);
      await p.screenshot({ path: path.join(dir, String(k).padStart(5, '0') + '.png'), clip: VERT ? { x: 0, y: 0, width: 1080, height: 1920 } : { x: 0, y: 136, width: 1920, height: 808 } });
    }
    console.log('klip', c.id, N, 'kare');
  }
  await b.close();
})();
