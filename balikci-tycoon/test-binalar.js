/* v1.5 — her binanın kendi çizimi: hizmet binaları aynı şablonun renk değişimi değil.
   Her seviyede beş binanın ekrandaki pikselleri okunur, renk dağılımları (histogram) karşılaştırılır:
   hiçbir iki bina birbirine benzememeli; her bina da Sv.1 → Sv.5 arasında gözle görülür şekilde büyümeli.
   Ayrıca SERV_DRAW her bina için ayrı bir çizim fonksiyonu tutar. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  const S0 = await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 9e6; S.tut = 99;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.customers.length = 0; BT.counters.forEach(c => c.spawnT = 1e9);
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 150);
    const fns = BT.SERV.map(d => BT.SERV_DRAW[d.id]);
    return { all: fns.every(f => typeof f === 'function'), distinct: new Set(fns).size === BT.SERV.length, names: fns.map(f => f && f.name) };
  });
  ok(S0.all && S0.distinct, 'her binanın ayrı çizim fonksiyonu yok ' + JSON.stringify(S0));
  /* boş parsellerin zemini (arka plan) — sonra yalnız binaya ait pikseller karşılaştırılır */
  await p.evaluate(() => { BT.player.x = 19.75; BT.player.y = 14.6; }); await sleep(1600);
  await p.evaluate(() => { const cv = document.getElementById('game'), g = cv.getContext('2d'); window.__bg = {};
    BT.PLOTS.forEach(pl => { const c = BT.canvasPt(pl.x, pl.y, 0); window.__bg[pl.id] = Array.from(g.getImageData(Math.round(c[0] - 22), Math.round(c[1] - 60), 46, 70).data); });
    [['buzhane', 'p1'], ['restoran', 'p2'], ['nakliye', 'p3'], ['koop', 'p4'], ['mezat', 'p5']].forEach(([id, pl]) => BT.servBuild(id, pl)); });
  const sig = {}, ids = ['buzhane', 'restoran', 'nakliye', 'koop', 'mezat'];
  for (const L of [1, 2, 3, 4, 5]) {
    await p.evaluate(L => { const sv = BT.serv(); for (const k in sv) { sv[k].lvl = L; sv[k].cons = 0; sv[k].fresh = 0; sv[k].flash = 0; } BT.player.x = 19.75; BT.player.y = 14.6; }, L);
    await sleep(1400);
    const r = await p.evaluate(ids => {
      const cv = document.getElementById('game'), g = cv.getContext('2d'), out = {};
      ids.forEach(id => {
        const st = BT.serv()[id], pl = BT.PLOTS.find(q => q.id === st.plot), c = BT.canvasPt(pl.x, pl.y, 0);
        const x0 = Math.round(c[0] - 22), y0 = Math.round(c[1] - 60), w = 46, h = 70;
        const d = g.getImageData(x0, y0, w, h).data, bg = window.__bg[pl.id], hist = new Map(); let n = 0;
        for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - bg[i]) + Math.abs(d[i + 1] - bg[i + 1]) + Math.abs(d[i + 2] - bg[i + 2]) < 24) continue; const k = (d[i] >> 5) * 64 + (d[i + 1] >> 5) * 8 + (d[i + 2] >> 5); hist.set(k, (hist.get(k) || 0) + 1); n++; }
        const o = {}; hist.forEach((v, k) => { o[k] = v / Math.max(1, n); }); out[id] = o;
      });
      return out;
    }, ids);
    for (const id of ids) sig[id + L] = r[id];
  }
  const dist = (a, b) => { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); let s = 0; ks.forEach(k => s += Math.abs((a[k] || 0) - (b[k] || 0))); return s / 2; };
  const report = {};
  for (const L of [1, 2, 3, 4, 5]) {
    let mn = 9, pair = '';
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { const d = dist(sig[ids[i] + L], sig[ids[j] + L]); if (d < mn) { mn = d; pair = ids[i] + '/' + ids[j]; } }
    report['L' + L] = [+mn.toFixed(2), pair];
    ok(mn >= 0.35, 'Sv.' + L + ' iki bina birbirine çok benziyor: ' + pair + ' fark=' + mn.toFixed(2));
  }
  for (const id of ids) { const d = dist(sig[id + 1], sig[id + 5]); report[id + ' 1→5'] = +d.toFixed(2); ok(d >= 0.2, id + ' Sv.1 ile Sv.5 neredeyse aynı: ' + d.toFixed(2)); }
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ S0, report }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: bina çizimleri testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
