/* Simge ve açılış ekranı kaynaklarını çizer (assets/). Önce oyun klasörünü 8099 portunda sunun:
   npx http-server .. -p 8099   →   node scripts/render-icons.js   →   npm run assets */
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright'); const fs = require('fs');
const OUT = require('path').resolve(__dirname, '..', 'assets') + '/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8099/mobile/assets-src/iconart.html'); await p.evaluate(async () => { await document.fonts.load('bold 120px "Pixelify Sans"', 'HAMSİ KOYU'); await document.fonts.ready; }); await new Promise(r => setTimeout(r, 400));
  for (const [mode, size, name] of [['full', 1024, 'icon-only.png'], ['fg', 1024, 'icon-foreground.png'], ['bg', 1024, 'icon-background.png'], ['splash', 2732, 'splash.png'], ['splash-dark', 2732, 'splash-dark.png']]) {
    const d = await p.evaluate(([m, s]) => window.render(m, s), [mode, size]);
    fs.writeFileSync(OUT + name, Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close(); console.log(fs.readdirSync(OUT));
})();
