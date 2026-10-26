/* v2.25 — Alp Er Tunga köprü başında + Gözcü Kulübesi (süs)
   1) nöbetçi köprünün ada ucunda, doğu korkuluğun yanında: müşteri yolunda (x 10.2–14.6) değil, yürüme alanında değil,
      köprü fenerlerine, binalara, süslere (layoutRects) değmiyor;
   2) Gözcü Kulübesi YAPI › Dekor'dan alınır (1200), varsayılan yeri köprü başı; alınınca nöbetçi kapısının önüne geçer;
   3) düzenleme modunda kulübe sürüklenince nöbetçi onunla gider; sandığa kalkınca köprü başına döner;
   4) kayıt/yükleme yeri korur; eski kayıt (decor[] kısa, dpos yok) etkilenmez: kulübe yok, hayvan evleri ve Bölüm hedefi aynı;
   5) iki çizim modunda (klasik + ince) sahne hatasız. Kullanım: URL=http://localhost:8153/index.html node test-gozcu.js */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8153/index.html';
const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'warning' && /HKA\./.test(m.text())) errs.push('C: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.tut = 99; S.cash = 50000; BT.storySet({ step: 6 });
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (s && !s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 300);
  });
  await sleep(300);
  const gpos = () => p.evaluate(() => { HKG.v('guardPlace')(); const g = HKG.v('GUARD'); return { x: g.x, y: g.y, on: HKG.v('guardOn')() }; });

  /* ---- 1) köprü başı ---- */
  R.post = await p.evaluate(() => {
    HKG.v('guardPlace')(); const g = HKG.v('GUARD'), MB = HKG.v('MAINBR'), L = HKG.v('MAINBR_LAMPS'), x = g.x, y = g.y;
    const hit = BT.layoutRects().filter(r => r.own !== 'dcgozcu' && x > r.x0 - 0.15 && x < r.x1 + 0.15 && y > r.y0 - 0.15 && y < r.y1 + 0.15).map(r => r.id);
    return { x, y, on: HKG.v('guardOn')(), stand: BT.canStand(x, y), lamp: Math.min.apply(null, L.map(l => Math.hypot(l[0] - x, l[1] - y))),
      bx1: MB.x + MB.w, by1: MB.y1, hit, face: g.face };
  });
  ok(R.post.on, 'nöbetçi görünmüyor (hikâye 6. gün) ' + JSON.stringify(R.post));
  ok(R.post.x > R.post.bx1 && R.post.x - R.post.bx1 < 1.2 && Math.abs(R.post.y - R.post.by1) < 1.0, 'nöbetçi köprü başında değil ' + JSON.stringify(R.post));
  ok(!R.post.stand, 'nöbetçi yürüme alanında');
  ok(R.post.lamp > 1, 'nöbetçi köprü fenerine çok yakın ' + R.post.lamp);
  ok(!R.post.hit.length, 'nöbetçi bir nesnenin ayak izinde: ' + R.post.hit.join(', '));

  /* ---- 2) satın alma: YAPI › Dekor ---- */
  R.def = await p.evaluate(() => { const d = BT.decorById('gozcu'); return { got: d.got, x: d.x, y: d.y, cost: d.cost, ok: BT.arr.why(d.x, d.y), clr: BT.decorClearance().find(q => q.id === 'gozcu') }; });
  ok(!R.def.got && R.def.cost === 1200, 'kulübe baştan alınmış / fiyat ' + JSON.stringify(R.def));
  ok(R.def.ok === '' && R.def.clr.ok, 'varsayılan yer geçersiz ' + JSON.stringify(R.def));
  ok(Math.hypot(R.def.x - R.post.x, R.def.y - R.post.y) < 0.5, 'kulübenin varsayılan yeri nöbet yeri değil ' + JSON.stringify(R.def));
  await p.click('.dtab[data-t="build"]'); await sleep(250);
  await p.click('#dpSub button[data-s="decor"]'); await sleep(250);
  R.card = await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Gözcü Kulübesi/.test(d.textContent)); return c ? c.innerText.replace(/\s+/g, ' ') : null; });
  ok(R.card && /Köprü başı/.test(R.card), 'Dekor sekmesinde Gözcü Kulübesi kartı yok ' + R.card);
  const c0 = await p.evaluate(() => BT.S.cash);
  await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Gözcü Kulübesi/.test(d.textContent)); c && c.querySelector('.buy').click(); }); await sleep(300);
  R.bought = await p.evaluate(() => ({ got: BT.decorById('gozcu').got, cash: BT.S.cash, clash: BT.layoutClashes(0.1) }));
  ok(R.bought.got && c0 - R.bought.cash === 1200, 'kulübe alınamadı ' + JSON.stringify({ c0, b: R.bought }));
  ok(!R.bought.clash.length, 'kulübe ile çakışma: ' + R.bought.clash.join(', '));
  await p.evaluate(() => { const x = document.querySelector('#dpClose, .dpClose'); if (x) x.click(); }); await sleep(150);
  R.atHut = await gpos();
  const hut = () => p.evaluate(() => { const d = BT.decorById('gozcu'); return { x: d.x, y: d.y, box: d.box }; });
  const near = (g, h) => Math.abs(g.x - h.x) < 0.3 && g.y > h.y + 0.42 && g.y < h.y + 0.75;   /* kapı (+y yüzü) önünde */
  R.h0 = await hut();
  ok(R.atHut.on && near(R.atHut, R.h0), 'nöbetçi kulübe kapısının önünde değil ' + JSON.stringify({ g: R.atHut, h: R.h0 }));
  ok(!(await p.evaluate(g => BT.canStand(g.x, g.y), R.atHut)), 'kulübe önündeki nöbetçi yürüme alanında');

  /* ---- 3) düzenleme modunda taşı: nöbetçi takip eder ---- */
  await p.evaluate(() => BT.arr.open()); await sleep(250);
  await p.evaluate(() => BT.arr.look(16.4, 3.4)); await sleep(200);
  const tgt = await p.evaluate(() => {
    const m = BT.arr.mask(), d = BT.decorById('gozcu'), out = [];
    for (let i = 0; i < m.length; i += 2) {
      const x = m[i], y = m[i + 1];
      if (!BT.arr.ok('gozcu', x, y) || Math.hypot(x - d.x, y - d.y) < 2) continue;
      const c = BT.arr.css(x, y); if (c[0] < 50 || c[0] > 340 || c[1] < 160 || c[1] > 700) continue;
      out.push({ x, y, cx: c[0], cy: c[1], d: Math.hypot(x - 17.5, y - 4.5) });
    }
    out.sort((a, b) => a.d - b.d); return out[0] || null;
  });
  ok(!!tgt, 'ekranda kulübe için geçerli yer yok');
  if (tgt) {
    const from = await p.evaluate(() => { const d = BT.decorById('gozcu'); return BT.arr.css(d.x, d.y); });
    await p.mouse.move(from[0], from[1] - 8); await p.mouse.down();
    for (let k = 1; k <= 8; k++) { await p.mouse.move(from[0] + (tgt.cx - from[0]) * k / 8, from[1] - 8 + (tgt.cy - from[1]) * k / 8); await sleep(30); }
    await sleep(120); R.mid = await p.evaluate(() => BT.arr.st().drag); await p.mouse.up(); await sleep(150);
    await p.evaluate(() => BT.arr.close()); await sleep(250);
    R.h1 = await hut(); R.moved = await gpos();
    ok(R.mid && R.mid.ok && R.h1.x === tgt.x && R.h1.y === tgt.y, 'kulübe sürüklenmedi ' + JSON.stringify({ tgt, mid: R.mid, h: R.h1 }));
    ok(near(R.moved, R.h1), 'nöbetçi taşınan kulübeyi izlemedi ' + JSON.stringify({ g: R.moved, h: R.h1 }));
    R.dpos = await p.evaluate(() => BT.S.dpos.gozcu);
    ok(R.dpos && R.dpos[0] === tgt.x && R.dpos[1] === tgt.y, 'yeni yer kayda yazılmadı ' + JSON.stringify(R.dpos));
  }
  /* sandığa kalkınca köprü başına döner, geri konunca yine kapıda */
  R.boxed = await p.evaluate(() => { const d = BT.decorById('gozcu'); d.box = true; BT.decorSync(); HKG.v('guardPlace')(); const g = HKG.v('GUARD'); const o = { x: g.x, y: g.y }; d.box = false; BT.decorSync(); return o; });
  ok(Math.abs(R.boxed.x - R.post.x) < 1e-6 && Math.abs(R.boxed.y - R.post.y) < 1e-6, 'kulübe sandıktayken nöbetçi köprü başına dönmedi ' + JSON.stringify(R.boxed));

  /* ---- 4) kayıt / yükleme + eski kayıt ---- */
  R.save = await p.evaluate(() => {
    const o = {}, sv = JSON.parse(JSON.stringify(BT.buildSave())), d = BT.decorById('gozcu'), idx = BT.decor.indexOf(d);
    o.idx = idx; o.n = BT.decor.length; o.flag = sv.decor[idx];
    d.got = false; d.x = d.hx; d.y = d.hy; BT.loadFrom(sv); BT.storySet({ step: 6 });
    HKG.v('guardPlace')(); const g = HKG.v('GUARD');
    o.after = { got: d.got, x: d.x, y: d.y, gx: g.x, gy: g.y };
    /* eski kayıt: kulübe girdisi yok (decor[] bir kısa, dpos'ta yok); kedi evi 0 alınmış */
    const old = JSON.parse(JSON.stringify(sv)); old.decor = old.decor.slice(0, idx); if (old.dpos) delete old.dpos.gozcu;
    const ki = BT.decor.indexOf(BT.decorById('kedievi0')); old.decor[ki] = 1;
    o.okL = BT.loadFrom(old); BT.storySet({ step: 6 });
    HKG.v('guardPlace')(); const g2 = HKG.v('GUARD');
    o.old = { got: d.got, x: d.x, y: d.y, gx: g2.x, gy: g2.y, cat: BT.decorById('kedievi0').got };
    const ch = HKG.v('chapterGroups')().find(q => q.ic === '🌺'); o.chN = ch.n;
    o.shopN = BT.decor.filter(q => !q.gift && q.buy !== false && q.id !== 'gozcu').length;
    return o;
  });
  ok(R.save.idx === R.save.n - 1 && R.save.flag === 1, 'kulübe DECOR sonunda değil / kayıtta yok ' + JSON.stringify(R.save));
  ok(tgt && R.save.after.got && R.save.after.x === tgt.x && R.save.after.y === tgt.y && near({ x: R.save.after.gx, y: R.save.after.gy }, R.save.after), 'yüklemede kulübe/nöbetçi yeri kayboldu ' + JSON.stringify(R.save.after));
  ok(R.save.okL && !R.save.old.got && R.save.old.cat && Math.abs(R.save.old.gx - R.post.x) < 1e-6 && Math.abs(R.save.old.gy - R.post.y) < 1e-6, 'eski kayıt etkilendi ' + JSON.stringify(R.save.old));
  ok(R.save.chN === R.save.shopN, 'Bölüm hedefindeki süs sayısı değişti ' + JSON.stringify(R.save));

  /* ---- 5) iki çizim modu: kulübe + nöbetçi + 12. gün (yay duvarda) ---- */
  for (const fine of [true, false]) {
    await p.evaluate(f => { HKG.setFine(f); const d = BT.decorById('gozcu'); d.got = true; d.x = d.hx; d.y = d.hy; BT.decorSync(); BT.storySet({ step: 12 }); BT.player.x = 16.9; BT.player.y = 2.7; }, fine);
    await sleep(700);
  }
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'GOZCU_FAIL:\n - ' + fail.join('\n - ') : 'GOZCU_OK');
  process.exit(fail.length ? 1 : 0);
})();
