/* v2.0 — Balıkçı Mutfağı kabul testi:
   1) Mutfak kilitli başlar; ALAN sekmesinde Fümehane'den sonra açılır (itibar 60).
   2) Kendi zinciri: palamut ağı + somon ağı → kesim masası → mutfak ocağı (1+1 → 2 porsiyon Reis Güveci) →
      mutfak tezgâhı → kasa. Aşçı yalnız Mutfak'ın personel listesinde.
   3) Karışma yok: palamut/somon başka bölgenin ağına, masasına, tezgâhına ya da depoya gitmez; her tezgâh yalnız
      kendi ürününü tutar; Fümehane fırını palamut kabul etmez.
   4) Ek Tezgâh YAPI'da yok, Buz Makinesi var ve vitrini +3 büyütür; eski kayıttaki Ek Tezgâh'ın parası iade edilir.
   5) Bölüm hedefi 4. bölgeyi ve 4. müdürü sayar; yerleşimde çakışma yok; sayfa hatası yok. */
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

  /* 1) kilit + ALAN sekmesi */
  R.lock = await p.evaluate(async () => {
    const A = BT.areas, S = BT.S; S.ctrl = 2; S.tut = 99; S.cash = 5e6;
    const r = { n: A.length, locked: A[3].locked, id: A[3].id };
    A[1].locked = false; A[2].locked = false; BT.rebuildCounters();
    S.rep = 30; document.querySelector('.dtab[data-t="area"]').click(); await new Promise(q => setTimeout(q, 200));
    r.low = document.getElementById('dpCards').innerText;
    S.rep = 400; document.querySelector('.dtab[data-t="area"]').click(); await new Promise(q => setTimeout(q, 100));
    document.querySelector('.dtab[data-t="area"]').click(); await new Promise(q => setTimeout(q, 200));
    r.high = document.getElementById('dpCards').innerText;
    const btn = [...document.querySelectorAll('#dpCards .buy')].find(x => !x.classList.contains('no'));
    if (btn) { btn.click(); await new Promise(q => setTimeout(q, 150)); const b2 = [...document.querySelectorAll('#dpCards .buy')].find(x => x.dataset.i === btn.dataset.i); if (b2 && A[3].locked) b2.click(); }
    await new Promise(q => setTimeout(q, 300));
    r.opened = !A[3].locked;
    document.querySelector('.dtab[data-t="area"]').click();
    return r;
  });
  ok(R.lock.n === 4 && R.lock.locked && R.lock.id === 'mutfak', 'Mutfak bölgesi yok ya da açık başlıyor ' + JSON.stringify(R.lock));
  ok(/Balıkçı Mutfağı/.test(R.lock.low) && /30\/60/.test(R.lock.low), 'ALAN: itibar düşükken Mutfak kilit gerekçesi yok ' + R.lock.low.slice(0, 200));
  ok(R.lock.opened, 'ALAN sekmesinden Mutfak açılamadı ' + R.lock.high.slice(0, 200));

  /* 2) personel listesi: aşçı yalnız Mutfak'ta */
  R.roles = await p.evaluate(async () => {
    BT.areas.forEach(a => { a.lvl = 3; }); BT.rebuildCounters();
    const r = { z0: BT.zoneRoles(0), z3: BT.zoneRoles(3), cap3: BT.zoneStaffCap(3) };
    document.querySelector('.dtab[data-t="level"]').click(); await new Promise(q => setTimeout(q, 200));
    const cards = [...document.querySelectorAll('#dpCards .dcard')];
    const i3 = cards.findIndex(c => /Balıkçı Mutfağı/.test(c.innerText) && /Personel|personel/.test(c.innerText));
    if (i3 >= 0) { const bt = cards[i3].querySelector('.buy'); if (bt) bt.click(); await new Promise(q => setTimeout(q, 200)); }
    r.list3 = document.getElementById('dpCards').innerText;
    document.querySelector('.dtab[data-t="level"]').click();
    return r;
  });
  ok(R.roles.z3.includes('asci') && !R.roles.z0.includes('asci'), 'aşçı rolü yanlış bölgede ' + JSON.stringify(R.roles));
  ok(/Aşçı/.test(R.roles.list3), 'Mutfak personel listesinde Aşçı yok ' + R.roles.list3.slice(0, 300));
  ok(R.roles.cap3 >= 5, 'Mutfak kadrosu 5 rolü almıyor ' + R.roles.cap3);

  /* 3) zincir + karışma yok */
  R.flow = await p.evaluate(async () => {
    const S = BT.S; S.rep = 400;
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 200);
    BT.counters.forEach(c => c.open = true);
    BT.DEPOT.lvl = 2;
    for (let z = 0; z < 4; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.hire('depocu', true, -1);
    BT.player.x = 17; BT.player.y = 5;                          /* oyuncu karışmasın */
    const served0 = S.served, bad = new Set(), zoneOf = f => BT.lines.find(l => l.f === f).src;
    let cooked = 0, lastMat = 0, maxInn = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      await new Promise(q => setTimeout(q, 250));
      for (const c of BT.counters) for (const it of c.buffer) if (it.f !== c.fish) bad.add('tezgâh ' + c.key + ':' + it.f);
      for (let z = 0; z < 3; z++) {
        for (const it of BT.tables[z].inn.concat(BT.tables[z].mat.items)) if (it.f === 'palamut' || it.f === 'somon' || it.f === 'guvec') bad.add('masa ' + z + ':' + it.f);
        for (const it of BT.spots[z].stock) if (it.f === 'palamut' || it.f === 'somon') bad.add('ağ ' + z + ':' + it.f);
      }
      for (const k in BT.DEPOT.shelf) if (/palamut|somon/.test(k)) bad.add('depo:' + k);
      for (const w of BT.workers) for (const it of w.carry) if (it.k !== 'money' && it.f && w.zone >= 0 && zoneOf(it.f) !== w.zone) bad.add('çalışan z' + w.zone + ':' + it.f);
      const km = BT.kitchen.mat.items.length; if (km > lastMat) cooked += km - lastMat; lastMat = km;
      maxInn = Math.max(maxInn, BT.kitchen.inn.length);
    }
    const b3 = BT.counters.find(c => c.key === 'b3');
    return { served: S.served - served0, cooked, maxInn, bad: [...bad].slice(0, 8), b3fish: b3 && b3.fish, b3tray: b3 && b3.tray.items.length,
      mat3: BT.tables[3].mat.items.map(i => i.k + '|' + i.f).filter((v, i, a) => a.indexOf(v) === i), sm: BT.smoker ? null : null };
  });
  ok(R.flow.b3fish === 'guvec', 'Mutfak tezgâhı güveç satmıyor ' + JSON.stringify(R.flow));
  ok(R.flow.cooked >= 4 && R.flow.maxInn > 0, 'mutfak güveç pişirmiyor ' + JSON.stringify(R.flow));
  ok(R.flow.bad.length === 0, 'ürünler karıştı: ' + R.flow.bad.join(', '));
  ok(R.flow.mat3.every(k => /fileto\|(palamut|somon)/.test(k)), 'Mutfak masasında yabancı ürün ' + JSON.stringify(R.flow.mat3));

  R.sale = await p.evaluate(async () => {
    const b3 = BT.counters.find(c => c.key === 'b3'), t0 = Date.now(); let sold = false;
    const before = b3.tray.items.length + BT.S.served;
    while (Date.now() - t0 < 30000 && !sold) { await new Promise(q => setTimeout(q, 300)); sold = BT.retSales ? true : (b3.tray.items.length + BT.S.served) > before; }
    return { sold, prod: BT.makeOrderFor(b3, BT.CUST.find(c => c.id === 'kaptan')) };
  });
  ok(R.sale.sold, 'güveç satılmadı');
  ok(R.sale.prod && R.sale.prod.f === 'guvec' && R.sale.prod.k === 'fileto' && R.sale.prod.need <= 7, 'güveç siparişi yanlış ' + JSON.stringify(R.sale.prod));

  /* Fümehane fırını palamut almaz; güveç füme olmaz */
  R.smoke = await p.evaluate(() => ({ fumeIng: BT.canProcess ? BT.canProcess('fume', 'palamut') : null, fumeDish: BT.canProcess ? BT.canProcess('fume', 'guvec') : null,
    stallFume: BT.stallFume(BT.counters.find(c => c.key === 'b3')) }));
  ok(R.smoke.stallFume === false && R.smoke.fumeIng !== true && R.smoke.fumeDish !== true, 'mutfak ürünleri tütsülenebiliyor ' + JSON.stringify(R.smoke));

  /* 4) YAPI: Ek Tezgâh yok, Buz Makinesi var ve vitrini büyütür; eski kayıt iadesi */
  R.build = await p.evaluate(() => {
    const ids = BT.BUILDINGS.map(q => q.id), c = BT.counters.find(q => q.key === 'b1'), m0 = BT.counterMax(c);
    const sl = BT.slots.find(s => s.z === 1 && s.cats.includes('ticaret')); const old = sl.b; sl.b = 'buz';
    const m1 = BT.counterMax(c); sl.b = old;
    const d = BT.buildSave(); const i = BT.slots.indexOf(sl); d.slots[i] = 'tezgah'; d.stalls = d.stalls.concat([['ss3', 1]]);
    const cash0 = d.cash; const okL = BT.loadFrom(d);
    return { ids, m0, m1, okL, refund: BT.S.cash - cash0, slot: BT.slots[i].b, keys: BT.counters.map(q => q.key) };
  });
  ok(!R.build.ids.includes('tezgah') && R.build.ids.includes('buz'), 'YAPI listesi yanlış ' + JSON.stringify(R.build.ids));
  ok(R.build.m1 === R.build.m0 + 3, 'Buz Makinesi vitrini büyütmüyor ' + JSON.stringify(R.build));
  ok(R.build.okL && R.build.refund === 2200 && R.build.slot === null && !R.build.keys.some(k => /^s/.test(k)), 'eski Ek Tezgâh iade/temizlik yanlış ' + JSON.stringify(R.build));

  /* 5) bölüm hedefi + yerleşim */
  R.ch = await p.evaluate(() => {
    const g = BT.chapter().g, pick = k => g.find(q => q.ic === k);
    return { areas: pick('🔓'), mgr: pick('👔'), clash: BT.layoutClashes(0.1), clear: BT.decorClearance().filter(d => !d.ok).map(d => d.id) };
  });
  ok(R.ch.areas.n === 3 && R.ch.mgr.n === 4, 'bölüm hedefi 4. bölgeyi saymıyor ' + JSON.stringify(R.ch));
  ok(R.ch.clash.length === 0, 'yerleşim çakışması: ' + R.ch.clash.join(' | '));
  ok(R.ch.clear.length === 0, 'süs işlevsel nesneye çok yakın: ' + R.ch.clear.join(','));

  /* çizim: Mutfak yakınında birkaç kare */
  await p.evaluate(async () => { BT.player.x = 5.5; BT.player.y = 20.5; await new Promise(q => setTimeout(q, 1500)); });
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R).slice(0, 1500));
  console.log(fail.length ? 'MUTFAK_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: Balıkçı Mutfağı testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
