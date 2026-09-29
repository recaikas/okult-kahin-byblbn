/* v1.9.8 kabul testi:
   1) Hizmet Sahası yayaları küçük çizilir (ara tuvalden %80) ve bir kısmı dükkân önünde durup bakar;
   2) Depo Hamalı hasırda biriken üründen depoya 2'şer yedek taşır, fazlasına dokunmaz (tezgâh dolu değilken);
   3) depo etiketinde balık başına sayı. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);

  /* 1) saha yayaları */
  R.folk = await p.evaluate(async () => {
    const S = BT.S; S.ctrl = 2; S.cash = 5e6; S.rep = 400; S.tut = 99;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters();
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 200);
    BT.PLOTS.forEach(pl => { const id = pl.allow.find(a => !BT.PLOTS.some(q => q.b === a)); if (id) BT.servBuild(id, pl.id); });
    BT.player.x = 19.7; BT.player.y = 16.5;
    /* çizim ölçümü: saha yayası ara tuvalden küçültülerek basılır */
    const g = document.getElementById('game').getContext('2d'), di = g.drawImage.bind(g), sizes = [];
    g.drawImage = function (img, sx, sy, sw, sh, dx, dy, dw, dh) { if (arguments.length === 9 && img.width === 40 && img.height === 72) sizes.push(dw + 'x' + dh); return di.apply(g, arguments); };
    let look = 0, seen = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 40000) {
      await new Promise(r => setTimeout(r, 250));
      for (const f of BT.yardFolk()) { if (f.in > 0) continue; seen++; if (f.look > 0) look++; }
    }
    g.drawImage = di;
    return { seen, look, sizes: [...new Set(sizes)], n: sizes.length };
  });
  ok(R.folk.seen > 50 && R.folk.look > 5, 'yayalar dükkân önünde durmuyor ' + JSON.stringify(R.folk));
  ok(R.folk.n > 0 && R.folk.sizes.includes('32x58') && R.folk.sizes.every(q => +q.split('x')[0] < 40), 'yayalar küçültülmüş çizilmiyor ' + JSON.stringify(R.folk));

  /* 2) depo yedeği */
  R.dep = await p.evaluate(async () => {
    clearInterval(window.__ns);
    const D = BT.DEPOT; D.lvl = 1; D.shelf = {};
    BT.workers.length = 0;
    const c = BT.counters.find(q => q.key === 'b0'), c1 = BT.counters.find(q => q.key === 'b1'); c.open = true; c1.open = true;
    /* tezgâhlar ne dolu ne azalmış (8 ürün): müşteri alsa da sabit tutulur → yalnız yedek kuralı çalışır */
    const keep = () => [[c, 'hamsi'], [c1, 'uskumru']].forEach(([q, f]) => { while (q.buffer.length < 8) q.buffer.push({ k: 'fileto', f }); });
    keep(); window.__keep = setInterval(keep, 50);
    const m = BT.tables[0].mat; m.items.length = 0;
    for (let i = 0; i < 6; i++) m.items.push({ k: 'fileto', f: 'hamsi' });
    for (let i = 0; i < 2; i++) m.items.push({ k: 'fileto', f: 'uskumru' });                         /* birikmemiş (3'ten az) */
    const max = BT.counterMax(c);
    BT.hire('depocu', true, -1);
    const t0 = Date.now();
    while (Date.now() - t0 < 30000 && (D.shelf['fileto|hamsi'] || 0) < 2) await new Promise(r => setTimeout(r, 250));
    await new Promise(r => setTimeout(r, 6000));
    clearInterval(window.__keep);
    const left = m.items.filter(q => q.f === 'hamsi').length;
    return { shelf: Object.assign({}, D.shelf), left, max, buf: c.buffer.length };
  });
  ok(R.dep.max - 2 > 4, 'test kurgusu: tezgâh kapasitesi çok küçük ' + JSON.stringify(R.dep));
  ok(R.dep.shelf['fileto|hamsi'] === 2 && R.dep.left === 4, 'depo 2 yedek almadı ya da fazlasını aldı ' + JSON.stringify(R.dep));
  ok(!R.dep.shelf['fileto|uskumru'], 'birikmemiş ürün depoya taşındı ' + JSON.stringify(R.dep));

  /* 3) balık başına sayı etiketi */
  R.lbl = await p.evaluate(async () => {
    BT.DEPOT.shelf = { 'fileto|hamsi': 3, 'fume|hamsi': 1, 'fileto|somon': 2 };
    BT.player.x = BT.DEPOT.door.x; BT.player.y = BT.DEPOT.door.y + 0.3;
    const u = document.getElementById('ui').getContext('2d'), ft = u.fillText.bind(u), seen = [];
    u.fillText = function (s) { seen.push(String(s)); return ft.apply(u, arguments); };
    await new Promise(r => setTimeout(r, 800));
    u.fillText = ft;
    return seen.filter(s => /🐟|🍣/.test(s)).slice(0, 4);
  });
  ok(R.lbl.some(s => s.includes('🐟4') && s.includes('🍣2')), 'depo etiketinde balık sayıları yok ' + JSON.stringify(R.lbl));

  if (errs.length) fail.push('sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'V198_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: v1.9.8 testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
