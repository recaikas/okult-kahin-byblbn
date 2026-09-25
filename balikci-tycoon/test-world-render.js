/* dünya gerçekten çiziliyor mu? (piksel örneklemesi) */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const out = {}; const errs = [];
  for (const vp of [{ width: 400, height: 860 }, { width: 1100, height: 720 }]) {
    const p = await b.newPage({ viewport: vp });
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type()==='error') errs.push('C:'+m.text()); });
    await p.goto('file:///home/user/okult-kahin-byblbn/balikci-tycoon/index.html');
    await sleep(900); await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(2500);
    /* v1.2: gün ışığı tonu renkleri kaydırır — örnekleme öğle saatinde (ton yok) yapılır */
    await p.evaluate(() => { if (window.BT && BT.day) BT.day.t = BT.DAY_LEN * 0.45; if (window.BT) BT.S.hero = null; /* varsayılan görünüm: renk örneklemesi sabit kalsın */ });
    await sleep(400);
    const res = await p.evaluate(() => {
      const cv = document.getElementById('game');
      const g = cv.getContext('2d');
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let land = 0, wood = 0, person = 0, total = cv.width * cv.height;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], gg = d[i+1], bb = d[i+2];
        if (Math.abs(r-203)<14 && Math.abs(gg-185)<14 && Math.abs(bb-141)<14) land++;      // kum
        if (Math.abs(r-171)<16 && Math.abs(gg-122)<16 && Math.abs(bb-72)<16) wood++;        // iskele tahtası
        if (Math.abs(r-31)<8 && Math.abs(gg-78)<10 && Math.abs(bb-107)<10) person++;        // oyuncu montu
      }
      return { landPct: +(land/total*100).toFixed(1), woodPct: +(wood/total*100).toFixed(1), personPx: person,
               cam: { x: Math.round(BT.cam().x), y: Math.round(BT.cam().y) } };
    });
    out[vp.width + 'x' + vp.height] = res;
    await p.close();
  }
  /* v1.3: ufuk dünyaya bağlandı — geniş ekranda üstü gökyüzü + kasaba kaplar, kum oranı biraz düşer */
  const ok = Object.values(out).every(r => r.landPct > 2 && r.woodPct > 2 && r.personPx > 5);
  console.log(JSON.stringify({ out, WORLD_OK: ok, errs: [...new Set(errs)] }, null, 1));
  process.exit(ok && !errs.length ? 0 : 1);
})();
