/* v1.9.2 (Faz B) kabul testi:
   1) Liman Meydanı ile Hizmet Sahası kabaca eşit (alan oranı 0.75–1.33);
   2) meydan binaları (kulübe, depo, ofis, hal, tabela) ekranda birbirinin önüne düşmez ve meydanın içinde;
   3) kapılar ve ofisin teslim noktası yürünebilir; köprüden meydana, meydandan sahaya yürünür;
   4) saha yayaları: bina kurulunca gelir, hiçbir parselin ayak izinden geçmez, sahayı ya da yolu terk etmez;
   5) bütün seviyelerde sahne hatasız çizilir. */
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

  R.geo = await p.evaluate(() => {
    const M = BT.MEYDAN, Y = BT.SERVYARD, area = r => (r.x1 - r.x0) * (r.y1 - r.y0);
    const office = BT.office, B = [
      ['kulübe', BT.HUT], ['depo', BT.DEPOT], ['hal', BT.WHALL], ['ofis', office], ['tabela', { x: 15.6, y: 3.7, w: 0.4, h: 0.2 }]];
    const bad = [];
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
      const a = B[i][1], c = B[j][1];
      const du = Math.abs((a.x - a.y) - (c.x - c.y)), need = (a.w + a.h) / 2 + (c.w + c.h) / 2;
      const dv = Math.abs((a.x + a.y) - (c.x + c.y));
      if (du < need && dv < 7) bad.push(B[i][0] + '/' + B[j][0] + ' du=' + du.toFixed(2) + '<' + need.toFixed(2) + ' dv=' + dv.toFixed(1));
    }
    const outside = B.filter(([n, o]) => o.x - o.w / 2 < M.x0 || o.x + o.w / 2 > M.x1 || o.y - o.h / 2 < M.y0 || o.y + o.h / 2 > M.y1).map(q => q[0]);
    const doors = [['kulübe', BT.HUT.door], ['depo', BT.DEPOT.door], ['hal', BT.WHALL.door], ['ofis', { x: office.x, y: office.y + 1.1 }]]
      .filter(([n, d]) => !BT.canStand(d.x, d.y)).map(q => q[0]);
    const walk = [[15.5, 2.4], [18.2, 5.0], [18.1, 11.5], [19.7, 13.0]].filter(q => !BT.canStand(q[0], q[1]));
    return { ratio: +(area(M) / area(Y)).toFixed(2), bad, outside, doors, walk, eastCorner: +(M.x1 - M.y0).toFixed(2) };
  });
  ok(R.geo.ratio >= 0.75 && R.geo.ratio <= 1.33, 'meydan/saha eşit değil ' + R.geo.ratio);
  ok(R.geo.bad.length === 0, 'meydan binaları ekranda üst üste: ' + R.geo.bad.join(' | '));
  ok(R.geo.outside.length === 0, 'meydan dışında bina: ' + R.geo.outside.join(','));
  ok(R.geo.doors.length === 0, 'yürünemeyen kapı: ' + R.geo.doors.join(','));
  ok(R.geo.walk.length === 0, 'yürüyüş yolu kopuk: ' + JSON.stringify(R.geo.walk));
  ok(R.geo.eastCorner <= 21.5, 'meydan kameranın ulaşamadığı doğu ucuna taştı');

  /* saha yayaları: bina yokken gelmez; binalar kurulunca gelir, parsellerin içinden geçmez */
  R.folk0 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 3000)); return BT.yardFolk().length; });
  ok(R.folk0 === 0, 'bina yokken sahada yaya var');
  R.folk = await p.evaluate(async () => {
    const S = BT.S; S.ctrl = 2; S.cash = 5e6; S.rep = 400; S.tut = 99;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters();
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 200);
    BT.PLOTS.forEach(pl => { const id = pl.allow.find(a => !BT.PLOTS.some(q => q.b === a)); if (id) BT.servBuild(id, pl.id); });
    Object.values(BT.serv()).forEach(st => { st.cons = 0; });
    BT.HUT.lvl = 5; BT.DEPOT.lvl = 4; BT.WHALL.built = true;
    const Y = BT.SERVYARD, hits = [], out = []; let seen = 0, inside = 0, bags = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) {
      await new Promise(r => setTimeout(r, 100));
      for (const f of BT.yardFolk()) {
        if (f.in > 0) { inside++; continue; }
        seen++; if (f.bag) bags++;
        for (const q of BT.PLOTS) if (Math.abs(f.x - q.x) < 0.95 && Math.abs(f.y - q.y) < 0.95) hits.push(q.id + '@' + f.x.toFixed(1) + ',' + f.y.toFixed(1));
        if (f.x > Y.x1 || f.y < Y.y0 - 0.2 || f.y > Y.y1 || f.x < 14.5) out.push(f.x.toFixed(1) + ',' + f.y.toFixed(1));
      }
    }
    return { seen, inside, bags, hits: hits.slice(0, 5), out: out.slice(0, 5), n: BT.yardFolk().length };
  });
  ok(R.folk.seen > 50 && R.folk.inside > 0 && R.folk.bags > 0, 'saha yayaları dolaşmıyor / binalara girmiyor ' + JSON.stringify(R.folk));
  ok(R.folk.hits.length === 0, 'yaya binanın içinden geçti ' + R.folk.hits.join(' '));
  ok(R.folk.out.length === 0, 'yaya sahadan taştı ' + R.folk.out.join(' '));

  /* her yerde çizim hatasız */
  for (const [x, y] of [[16.4, 3.5], [18.5, 7.5], [19.7, 16]]) { await p.evaluate(q => { BT.player.x = q[0]; BT.player.y = q[1]; }, [x, y]); await sleep(700); }
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'FAZB_FAIL\n - ' + fail.join('\n - ') : 'FAZB_OK');
  process.exit(fail.length ? 1 : 0);
})();
