/* v1.9.6 — dünya etiketleri: yazı kutusunun tam ortasında (iPhone Safari'de U+FE0F'li emoji içeren etiket kutunun
   ortasından başlayıp sağa taşıyordu). Ortalamayı tarayıcıya bırakmıyoruz: her fillText 'left' hizada ve yazı
   ortası kutu ortasıyla çakışmalı. TR ve EN'de meydan (kurulmamış binalar + emojili etiketler) ve bölgeler. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const fail = [], errs = [], seen = [];
  for (const lang of ['tr', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await sleep(900);
    await p.evaluate(l => BT.setLang(l), lang);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
    await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
    await p.evaluate(() => {
      BT.S.ctrl = 2; BT.S.tut = 99;
      const g = document.getElementById('ui').getContext('2d'), log = window.__lab = [];
      let lastBox = null;
      const fr = g.fillRect.bind(g), ft = g.fillText.bind(g);
      g.fillRect = function (x, y, w, h) { if (this.fillStyle === '#0a1a27' && h >= 12 && h <= 20) lastBox = { x, w }; return fr(x, y, w, h); };
      g.fillText = function (s, x, y) {
        const w = g.measureText(s).width;
        log.push({ s, align: g.textAlign, mid: x + w / 2, box: lastBox ? lastBox.x + lastBox.w / 2 : null });
        lastBox = null; return ft(s, x, y);
      };
    });
    for (const [x, y] of [[16.4, 3.4], [18.2, 6.5], [5, 3], [5, 9]]) {
      await p.evaluate(q => { BT.player.x = q[0]; BT.player.y = q[1]; window.__lab.length = 0; }, [x, y]); await sleep(700);
      const r = await p.evaluate(() => window.__lab.slice());
      for (const q of r) {
        seen.push(q.s);
        if (q.align !== 'left') fail.push(lang + ': hizalama ' + q.align + ' — ' + q.s);
        if (q.box !== null && Math.abs(q.mid - q.box) > 1.5) fail.push(lang + ': yazı kutudan kaymış (' + (q.mid - q.box).toFixed(1) + ' px) — ' + q.s);
      }
    }
    await p.close();
  }
  await b.close();
  const labs = [...new Set(seen)];
  if (!labs.some(s => /️/.test(s))) fail.push('emojili (U+FE0F) etiket hiç çizilmedi: test bir şey ölçmedi');
  if (errs.length) fail.push('sayfa hatası: ' + errs.join(' | '));
  console.log(labs.length + ' farklı etiket', JSON.stringify(labs.slice(0, 12)));
  console.log(fail.length ? 'ETIKET_FAIL\n - ' + [...new Set(fail)].slice(0, 20).join('\n - ') : 'TAMAM: etiket hizası testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
