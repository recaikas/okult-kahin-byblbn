/* v1.9.3 (Faz C) kabul testi — yol vitrini:
   1) süsler (tekne ve fener hariç) yolun doğu kenarında, tezgâh bölgelerinde süs yok; çakışma ve mesafe kuralları geçerli;
   2) YAPI › Dekoratif: yol çiçekliği ve reklam panosu alınır, müşteri akışı artar; pano seviye kilitli;
   3) kayıt/yükleme yol alımlarını korur; eski kayıttaki bölge reklam panosu yola taşınır (parsel boşalır);
   4) tezgâh yapı listesinde reklam panosu yok; ayrılan müşteriler yolun içinde kalır (vitrine/meydana taşmaz). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Vitrin Balıkçılık'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => { BT.achMute && BT.achMute(true); BT.S.ctrl = 2; BT.S.tut = 99;
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 200); });

  /* 1) yerleşim */
  R.lay = await p.evaluate(() => ({
    notRoad: BT.DECOR.filter(d => !['tekne', 'fener'].includes(d.id) && (Math.abs(d.x - 14.75) > 0.01)).map(d => d.id),
    inZone: BT.DECOR.filter(d => d.x > 0 && d.x < 10 && d.y > 0 && d.y < 17.5).map(d => d.id),
    clash: BT.layoutClashes(0.1), clear: BT.decorClearance().filter(d => !d.ok).map(d => d.id + '~' + d.near)
  }));
  ok(!R.lay.notRoad.length, 'yolda olmayan süs: ' + R.lay.notRoad.join(','));
  ok(!R.lay.inZone.length, 'tezgâh bölgesinde süs: ' + R.lay.inZone.join(','));
  ok(!R.lay.clash.length, 'çakışma: ' + R.lay.clash.join(', '));
  ok(!R.lay.clear.length, 'süs mesafesi: ' + R.lay.clear.join(', '));

  /* 2) satın alma */
  await p.evaluate(() => { BT.S.rep = 0; BT.S.cash = 50000; });
  const openDecor = async first => { if (first) { await p.click('.dtab[data-t="build"]'); await sleep(250); } await p.click('#dpSub button[data-s="decor"]'); await sleep(250); };
  const card = re => p.evaluate(src => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => new RegExp(src).test(d.textContent)); return c ? { t: c.querySelector('b').textContent, btn: c.querySelector('.buy').textContent } : null; }, re);
  const got = () => p.evaluate(() => (BT.S.roadFl | 0) + (BT.S.roadBb | 0));
  const buy = async re => { const n0 = await got(); for (let k = 0; k < 2 && (await got()) === n0; k++) { await p.evaluate(src => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => new RegExp(src).test(d.textContent)); c && c.querySelector('.buy').click(); }, re); await sleep(200); } };
  await openDecor(true);
  R.cards = { fl: await card('Yol Çiçekliği'), bb: await card('Yol Reklam Panosu') };
  ok(R.cards.fl && /0\/8/.test(R.cards.fl.t), 'çiçeklik kartı yok ' + JSON.stringify(R.cards));
  ok(R.cards.bb && /Seviye 3/.test(R.cards.bb.btn), 'pano kartı seviye kilitli değil ' + JSON.stringify(R.cards));
  const f0 = await p.evaluate(() => BT.roadFlow());
  await buy('Yol Çiçekliği'); await buy('Yol Çiçekliği');
  await buy('Yol Reklam Panosu');
  R.afterLocked = await p.evaluate(() => ({ fl: BT.S.roadFl, bb: BT.S.roadBb, cash: BT.S.cash, flow: BT.roadFlow() }));
  ok(f0 === 0 && R.afterLocked.fl === 2 && R.afterLocked.bb === 0 && Math.abs(R.afterLocked.flow - 0.04) < 1e-9 && R.afterLocked.cash === 50000 - 350 - 455,
    'çiçeklik alımı / pano kilidi yanlış ' + JSON.stringify(R.afterLocked));
  await p.evaluate(() => { BT.S.rep = 400; }); await openDecor();
  await buy('Yol Reklam Panosu');
  R.after = await p.evaluate(() => ({ bb: BT.S.roadBb, flow: BT.roadFlow(), cash: BT.S.cash }));
  ok(R.after.bb === 1 && Math.abs(R.after.flow - 0.12) < 1e-9, 'pano alınamadı ' + JSON.stringify(R.after));

  /* 3) kayıt + eski kayıttaki bölge panosu */
  R.save = await p.evaluate(() => {
    const d = BT.buildSave(); const road = d.road.slice();
    const old = JSON.parse(JSON.stringify(d)); delete old.road; old.slots = old.slots.map((v, i) => i === 3 ? 'pano' : v);
    const okL = BT.loadFrom(old);
    return { road, okL, bb: BT.S.roadBb, fl: BT.S.roadFl, slot4: BT.slots[3].b };
  });
  ok(R.save.road[0] === 2 && R.save.road[1] === 1, 'kayıtta yol alanı yanlış ' + JSON.stringify(R.save));
  ok(R.save.okL && R.save.bb === 1 && R.save.fl === 0 && R.save.slot4 === null, 'eski kayıttaki pano yola taşınmadı ' + JSON.stringify(R.save));

  /* 4) yapı listesinde pano yok; ayrılan müşteriler yolda kalır */
  await p.evaluate(() => { BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.rebuildCounters(); BT.S.cash = 50000; });
  await p.evaluate(() => { const b = [...document.querySelectorAll('#dpSub button')].find(x => !['decor', 'meydan', 'up'].includes(x.dataset.s)); b && b.click(); }); await sleep(250);
  await p.evaluate(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Balık Pazarı/.test(d.textContent)); c && c.querySelector('.buy').click(); }); await sleep(250);
  R.slotList = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard b')].map(x => x.textContent));
  ok(R.slotList.some(t => /Ek Tezgâh/.test(t)) && !R.slotList.some(t => /Reklam Panosu/.test(t)), 'yapı listesi yanlış ' + JSON.stringify(R.slotList));
  R.leave = await p.evaluate(async () => {
    let maxX = 0; const t0 = Date.now();
    while (Date.now() - t0 < 15000) {
      await new Promise(r => setTimeout(r, 100));
      BT.customers.forEach(c => { if (c.state === 'leave' && !c.spec) maxX = Math.max(maxX, c.x); });
      BT.counters.forEach(c => { c.spawnT = Math.min(c.spawnT, 0.2); });
      BT.customers.forEach(c => { if (c.state === 'wait') c.pat = 0; });
    }
    return +maxX.toFixed(2);
  });
  ok(R.leave > 0 && R.leave < 14.4, 'ayrılan müşteri yoldan taştı ' + R.leave);

  /* çizim: yol vitrini tam doluyken hatasız */
  await p.evaluate(() => { BT.S.roadFl = 8; BT.S.roadBb = 3; BT.S.env = 3; BT.DECOR.forEach(d => d.got = true); BT.player.x = 9.4; BT.player.y = 9; });
  await sleep(1200);
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'FAZC_FAIL\n - ' + fail.join('\n - ') : 'FAZC_OK');
  process.exit(fail.length ? 1 : 0);
})();
