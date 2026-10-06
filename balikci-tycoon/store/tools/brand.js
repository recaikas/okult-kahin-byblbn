/* Logo, mağaza simgeleri ve Play öne çıkan görseli. Simge çizimini mobile/assets-src/iconart.html'den alır.
   Oyun klasörü 8099'da sunulmalı:  node store/tools/brand.js */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const save = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); console.log(path.relative(ROOT, f)); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8099/mobile/assets-src/iconart.html');
  await p.evaluate(async () => { await document.fonts.load('bold 120px "Pixelify Sans"', 'HAMSİ KOYU'); await document.fonts.ready; });
  /* ortak çizim yardımcıları sayfaya */
  await p.evaluate(() => {
    window.fishTile = function (bg) { const t = document.createElement('canvas'); t.width = 32; t.height = 32; const g = t.getContext('2d'); if (bg) drawBg(g); drawFish(g); return t; };
    window.sign = function (g, text, cx, cy, fs, col, sh) {
      g.font = 'bold ' + fs + 'px "Pixelify Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const o = Math.max(2, Math.round(fs * 0.07));
      g.fillStyle = sh || '#3d2413'; for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [o, o], [-o, o], [o, -o], [-o, -o]]) g.fillText(text, cx + dx, cy + dy);
      g.fillText(text, cx + o * 1.6, cy + o * 2.2);
      g.fillStyle = col || '#fff1c9'; g.fillText(text, cx, cy);
    };
    window.cv = function (w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
    window.fit = function (g, text, max, fs) { g.font = 'bold ' + fs + 'px "Pixelify Sans"'; while (g.measureText(text).width > max && fs > 10) { fs -= 2; g.font = 'bold ' + fs + 'px "Pixelify Sans"'; } return fs; };
  });
  for (const lang of ['tr', 'en']) {
    const tag = lang === 'tr' ? 'KÜÇÜK İSKELEDEN BÜYÜK LİMANA' : 'FROM A TINY PIER TO A GRAND HARBOR';
    /* yatay logo (şeffaf): balık + yazı + slogan */
    save(path.join(ROOT, 'logo', 'logo-horizontal-' + lang + '.png'), await p.evaluate(tag => {
      const [c, g] = cv(2400, 900), f = fishTile(false);
      g.drawImage(f, 0, 0, 32, 32, 40, 90, 704, 704);
      const fs = fit(g, 'HAMSİ KOYU', 1500, 300); sign(g, 'HAMSİ KOYU', 1600, 380, fs, '#fff1c9');
      const ts = fit(g, tag, 1500, 96); sign(g, tag, 1600, 640, ts, '#ffc94a', '#0a1a27');
      return c.toDataURL('image/png');
    }, tag));
    /* dikey logo (şeffaf) */
    save(path.join(ROOT, 'logo', 'logo-stacked-' + lang + '.png'), await p.evaluate(tag => {
      const [c, g] = cv(1600, 1600), f = fishTile(false);
      g.drawImage(f, 0, 0, 32, 32, 352, 60, 896, 896);
      const fs = fit(g, 'HAMSİ KOYU', 1450, 270); sign(g, 'HAMSİ KOYU', 800, 1150, fs, '#fff1c9');
      const ts = fit(g, tag, 1450, 84); sign(g, tag, 800, 1390, ts, '#ffc94a', '#0a1a27');
      return c.toDataURL('image/png');
    }, tag));
    /* Play öne çıkan görsel 1024×500: oyun ekranı arka planda, logo solda */
    const raw = 'http://localhost:8099/store/raw/' + lang + '/1-harbor.png';
    save(path.join(ROOT, 'play', 'feature-graphic-1024x500-' + lang + '.png'), await p.evaluate(async ([raw, tag, lang]) => {
      const [c, g] = cv(1024, 500); const im = new Image(); im.src = raw; await im.decode();
      g.drawImage(im, 0, 700, 1320, 645, 0, 0, 1024, 500);
      const gr = g.createLinearGradient(0, 0, 1024, 0); gr.addColorStop(0, 'rgba(10,26,39,.94)'); gr.addColorStop(0.5, 'rgba(10,26,39,.78)'); gr.addColorStop(0.75, 'rgba(10,26,39,.15)'); gr.addColorStop(1, 'rgba(10,26,39,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 1024, 500);
      for (let i = 0; i < 1024; i += 24) { g.fillStyle = ['#a83d2b', '#d9a441', '#2a4c7d', '#d9a441'][(i / 24) % 4]; g.fillRect(i, 0, 24, 10); }
      g.drawImage(fishTile(true), 0, 0, 32, 32, 40, 70, 192, 192);
      g.strokeStyle = '#0a1a27'; g.lineWidth = 6; g.strokeRect(40, 70, 192, 192);
      sign(g, 'HAMSİ', 395, 120, 92, '#fff1c9'); sign(g, 'KOYU', 395, 215, 92, '#fff1c9');
      const ts = fit(g, tag, 520, 34); sign(g, tag, 300, 320, ts, '#ffc94a', '#0a1a27');
      const l2 = lang === 'tr' ? '69 müşteri • 12 günlük efsane • TR / EN' : '69 customers • a 12-day legend • TR / EN';
      const s2 = fit(g, l2, 520, 26); g.font = 'bold ' + s2 + 'px "Pixelify Sans"'; g.fillStyle = '#bfe9ff'; g.textAlign = 'center'; g.fillText(l2, 300, 380);
      return c.toDataURL('image/png');
    }, [raw, tag, lang]));
  }
  /* simgeler: App Store 1024 (saydamlık yok), Play 512 */
  save(path.join(ROOT, 'appstore', 'app-icon-1024.png'), await p.evaluate(() => window.render('full', 1024)));
  save(path.join(ROOT, 'play', 'app-icon-512.png'), await p.evaluate(() => window.render('full', 512)));
  await b.close();
})();
