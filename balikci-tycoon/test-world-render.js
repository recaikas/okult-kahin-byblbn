/* dünya gerçekten çiziliyor mu? (piksel örneklemesi) */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const out = {}; const errs = [];
  /* v2.13: renk örneklemesi Klasik görünümde (eski paletle); İnce görünümde dünya dolu ve çeşitli mi diye bakılır */
  for (const [vp, vis] of [[{ width: 400, height: 860 }, 0], [{ width: 1100, height: 720 }, 0], [{ width: 400, height: 860 }, 1], [{ width: 1100, height: 720 }, 1]]) {
    const ctx = await b.newContext({ viewport: vp });
    await ctx.addInitScript(v => { try { const d = JSON.parse(localStorage.getItem('balikci_pref') || '{}'); d.vis = v; localStorage.setItem('balikci_pref', JSON.stringify(d)); } catch (e) { } }, vis);
    const p = await ctx.newPage(); p.close = () => ctx.close();
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type()==='error') errs.push('C:'+m.text()); });
    await p.goto(URL);
    await sleep(900); await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(2500);
    /* v1.2: gün ışığı tonu renkleri kaydırır — örnekleme öğle saatinde (ton yok) yapılır */
    await p.evaluate(() => { if (window.BT && BT.day) BT.day.t = BT.DAY_LEN * 0.45; if (window.BT) BT.S.hero = null; /* varsayılan görünüm: renk örneklemesi sabit kalsın */ });
    await sleep(400);
    const res = await p.evaluate(() => {
      const cv = document.getElementById('game');
      const g = cv.getContext('2d');
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let land = 0, wood = 0, person = 0, total = cv.width * cv.height;
      const cols = new Set();
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], gg = d[i+1], bb = d[i+2];
        if ((i & 63) === 0) cols.add(r << 16 | gg << 8 | bb);
        if (Math.abs(r-203)<14 && Math.abs(gg-185)<14 && Math.abs(bb-141)<14) land++;      // kum
        if (Math.abs(r-171)<16 && Math.abs(gg-122)<16 && Math.abs(bb-72)<16) wood++;        // iskele tahtası
        if (Math.abs(r-31)<8 && Math.abs(gg-78)<10 && Math.abs(bb-107)<10) person++;        // oyuncu montu
      }
      return { fine: window.HKG ? HKG.K : 1, colors: cols.size, landPct: +(land/total*100).toFixed(1), woodPct: +(wood/total*100).toFixed(1), personPx: person,
               cam: { x: Math.round(BT.cam().x), y: Math.round(BT.cam().y) } };
    });
    /* v2.18-deneme: açık bölge iskelesinin içinde manzara (ağaç vb.) çizilmez; kilitliyken (kum) kalır */
    res.deck = await p.evaluate(() => {
      const inZ = o => BT.areas.some(a => o.x > a.x0 && o.x < a.x1 && o.y > a.y0 && o.y < a.y1);
      const lockedHid = BT.scenery.filter(o => BT.sceneryOnDeck(o)).length;
      const before = BT.scenery.filter(inZ).length;                 /* kilitli kum üzerindeki manzara (mutfak kumunda var) */
      BT.areas.forEach(a => { a.locked = false; });
      const inside = BT.scenery.filter(inZ), shown = inside.filter(o => !BT.sceneryOnDeck(o)).length;
      const trees = inside.filter(o => o.t === 'cam' || o.t === 'servi').length;
      const outsideHid = BT.scenery.filter(o => !inZ(o) && BT.sceneryOnDeck(o)).length;
      return { lockedHid, before, inside: inside.length, shown, trees, outsideHid };
    });
    out[vp.width + 'x' + vp.height + (vis ? '-ince' : '')] = res;
    await p.close();
  }
  /* v1.3: ufuk dünyaya bağlandı — geniş ekranda üstü gökyüzü + kasaba kaplar, kum oranı biraz düşer.
     v1.9.2: meydan büyüdü (kumun bir kısmı taş zemin): geniş ekranda kum %2.8 → %2.0 */
  const deckOk = Object.values(out).every(r => r.deck.lockedHid === 0 && r.deck.inside > 0 && r.deck.shown === 0);
  const ok = deckOk && Object.values(out).every(r => r.fine > 1 ? r.colors > 300 : (r.landPct > 1.5 && r.woodPct > 2 && r.personPx > 5));
  console.log(JSON.stringify({ out, WORLD_OK: ok, errs: [...new Set(errs)] }, null, 1));
  process.exit(ok && !errs.length ? 0 : 1);
})();
