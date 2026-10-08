/* Oyunun kendi çizim koduyla kişi sprite'ları üretir (BT.drawOutfitOn) → store/tools/trailer2/sprites.json {ad: dataURL}
   Fragman sahnelerinde (engine.html) aynı piksel sanatı kullanılsın diye. Kullanım: node sprites.js (8099'da sunucu) */
const { chromium, openGame } = require('../scene');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch();
  const { p } = await openGame(b, 'en', { width: 960, height: 540 }, 1);
  const out = await p.evaluate(() => {
    const R = {};
    const mk = (name, o, faces = [1, -1], frames = [0]) => {
      faces.forEach(f => frames.forEach((t, i) => {
        const cv = document.createElement('canvas'); cv.width = 40; cv.height = 72;
        BT.drawOutfitOn(cv, Object.assign({}, o, { face: f }), t);
        R[name + (f < 0 ? 'L' : 'R') + (frames.length > 1 ? i : '')] = cv.toDataURL();
      }));
    };
    const skin = ['#e8c39e', '#d9a877', '#b9825a', '#8d5a3c'];
    mk('fisher', { coat: '#1f4e6b', coat2: '#2f6a8c', knit: '#8fb3c9', skin: skin[1], hair: '#2a1d14', hairStyle: 1, boot: '#16222b', bootTop: '#2f4450', pants: '#2b3a45', cap: '#14364a', must: true, apron: '#8a5a2b' }, [1, -1], [0, 4, 8, 12]);
    mk('fisherF', { coat: '#b3422f', coat2: '#c8553d', skin: skin[1], hair: '#2a1d14', hairStyle: 3, pants: '#2b3a45', scarf: '#f0d9c8', apron: '#e8dcc0' }, [1, -1]);
    mk('old', { coat: '#6b6f73', coat2: '#8b9094', skin: skin[0], hair: '#e8e8e8', hairStyle: 1, beard: true, cap: '#3a2c48', pants: '#3b3346' }, [1, -1]);
    ['ferdi', 'gordon', 'fasulye', 'miril', 'bedia', 'mahmut', 'temel', 'caner'].forEach(id => {
      try { const cv = document.createElement('canvas'); cv.width = 40; cv.height = 72; BT.drawOutfitOn(cv, BT.specOutfit(id, 1), 0); R['sp_' + id] = cv.toDataURL(); } catch (e) { }
    });
    return R;
  });
  fs.writeFileSync(path.join(__dirname, 'sprites.json'), JSON.stringify(out));
  console.log(Object.keys(out).join(' '));
  await b.close();
})();
