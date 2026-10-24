/* v1.3 — Bölüm 1 kapanışı: neredeyse bitmiş liman → son müdür arayüzden alınır → sayaç dolar →
   gazete (gerçek dokunuşla iki sayfa) → bölüm kartı → devam → oyun sürer; kayıttan dönünce tekrar tetiklenmez. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = (process.env.SC || require('os').tmpdir()) + '/'; const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.HK_LOK_OFF = 0; window.HK_LOK_EVOFF = 1; });   /* v2.24: Bölüm 1 sonu lokanta otomasyonunu da ister */
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.fill('#heroName', 'Recai'); await p.click('#heroGo'); await p.fill('#nameIn', 'Recai Balıkçılık'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  /* son müdür hariç her şey hazır (tam turda arayüzden alınanlar) */
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 60000; S.rep = 260; S.caught = 14820; S.env = 3; S.fumeM = [1, 1, 0]; S.chSeen = true;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; });
    BT.pads.forEach(q => { if (q.max && q.kind !== 'decor') q.lvl = q.max; });
    BT.decor.forEach(d => d.got = true);
    const bl = ['cay', 'buz', 'buz', 'cay', 'buz', 'buz', 'cay']; BT.slots.forEach((s, i) => s.b = bl[i]);
    BT.project.done = true; BT.project.stage = 5; BT.project.inv = BT.project.total;
    BT.HUT.lvl = 5; BT.DEPOT.lvl = 2; BT.WHALL.built = true;
    BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    for (let z = 0; z < 4; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));                 /* v2.0: Mutfak'ın aşçısı dâhil */
    S.mgr = [{ n: 'Sadık Bey', a: 'value', b: 'wspeed', wage: 35, look: 0 }, { n: 'Gülten Hanım', a: 'pat', b: 'flow', wage: 45, look: 1 }, null, { n: 'Levent Bey', a: 'rep', b: 'value', wage: 65, look: 2 }];
    S.auto = [true, true, false, true];
    for (let i = 0; i < 11; i++) S.met.push(BT.SPECIALS[i].id);
    /* v2.24: Sahil Lokantası açık, bir ocak + tam kadro (devredilmemiş) */
    const L = BT.lok, lq = L.q(); lq.sl[0] = { k: 'tava', lv: 1 }; { const tq = BT.tarif.q(); if (tq.known.indexOf('hamsitava') < 0) tq.known.push('hamsitava'); lq.menu[0] = 'hamsitava'; }   /* v2.21: menü boşken devredilmez */ ['lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef', 'lk_komi'].forEach(r => L.hire(r)); S.cash = 60000;
    BT.player.x = 7.2; BT.player.y = 13.5;
  });
  await sleep(2500);
  await p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await sleep(1500);
  const pre = await p.evaluate(() => BT.chapter()); console.log("sayaç", pre.d + "/" + pre.n, JSON.stringify(pre.g.filter(g => g.d < g.n))); ok(pre.n - pre.d === 3, 'kurulum: üç eksik kalmalı (Fümehane müdürü + Fümehane ve lokanta otomasyonu) ' + pre.d + '/' + pre.n);
  const row = await p.evaluate(() => BT.chapter().g.find(g => g.ic === '⚙️')); ok(row && row.n === 5 && row.d === 3 && /Tam otomasyon/.test(row.t), 'Tam otomasyon satırı (4 bölge + lokanta): ' + JSON.stringify(row));
  await p.click('#chBtn'); await sleep(500); await p.screenshot({ path: SC + '1-sayac.png' }); await p.click('#chClose'); await sleep(300);
  /* son eksik: Fümehane müdürü — arayüzden */
  await p.click('.dtab[data-t="staff"]'); await sleep(400);   /* v2.22: müdür kartları PERSONEL'de */
  await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].find(d => /Müdür gerekli/.test(d.textContent)).querySelector('.buy').click()); await sleep(300);
  await p.screenshot({ path: SC + '2-mudur-adaylari.png' });
  await p.evaluate(() => document.querySelectorAll('#dpCards .dcard .buy')[1].click()); await sleep(200);
  await p.evaluate(() => { const c = document.querySelector('#dpCards .buy.cf'); if (c) c.click(); }); await sleep(600);
  const cardBtn = (re) => p.evaluate(src => { const d = [...document.querySelectorAll('#dpCards .dcard')].find(x => new RegExp(src).test(x.textContent)); return d ? { t: d.textContent.replace(/\s+/g, ' '), cls: d.querySelector('.buy').className } : null; }, re.source);
  const clickCard = (re) => p.evaluate(src => { const d = [...document.querySelectorAll('#dpCards .dcard')].find(x => new RegExp(src).test(x.textContent)); if (d) d.querySelector('.buy').click(); return !!d; }, re.source);
  /* Fümehane'yi personele devret */
  if (await p.evaluate(() => document.getElementById('devpanel').classList.contains('hidden'))) { await p.click('.dtab[data-t="staff"]'); await sleep(300); }
  if (!await p.evaluate(() => !!BT.S.auto[2])) { ok(await clickCard(/Fümehane.*DEVRET/), 'Fümehane devret kartı yok'); await sleep(300); }   /* müdür alınınca bölge kendiliğinden devredilir */
  ok(await p.evaluate(() => !!BT.S.auto[2]), 'Fümehane personele devredilmedi');
  /* v2.24: Sahil Lokantası — Personele Devret: şart (her ocağa aşçı + garson, bulaşıkçı, şef, tedarikçi), eksik rol yazılır */
  await p.evaluate(() => { const L = BT.lok; L.fire(L.crew('lk_komi')[0]); BT.renderBar(); }); await sleep(200);
  const lc0 = await cardBtn(/Sahil Lokantası — Personele Devret/);
  ok(lc0 && /no/.test(lc0.cls) && /Tedarikçi/.test(lc0.t), 'lokanta devret kartı eksik rolü söyler: ' + JSON.stringify(lc0));
  await p.evaluate(() => { BT.lok.hire('lk_komi'); BT.renderBar(); }); await sleep(200);
  const lc1 = await cardBtn(/Sahil Lokantası — Personele Devret/); ok(lc1 && !/no/.test(lc1.cls), 'lokanta devret kartı hazır: ' + JSON.stringify(lc1));
  await p.screenshot({ path: SC + '2b-lokanta-devret.png' });
  await clickCard(/Sahil Lokantası — Personele Devret/); await sleep(300);
  const la = await p.evaluate(() => ({ auto: BT.lok.auto(), q: BT.lok.q().auto, op: BT.lok.q().op }));
  ok(la.auto && la.q === 1 && la.op === 1, 'lokanta personele devredildi, açıldı: ' + JSON.stringify(la));
  /* v2.24: izleme sahnesi — arayüz gizli, oyun sürer, kamera dolaşır; dokununca gazete + kart */
  await sleep(1800);
  const sc0 = await p.evaluate(() => ({ on: BT.chScene.st().on, body: document.body.classList.contains('chScene'), hud: getComputedStyle(document.getElementById('hud')).visibility, bar: getComputedStyle(document.getElementById('devbar')).visibility, band: document.getElementById('chSceneBand').textContent, el: !document.getElementById('chSceneEl').classList.contains('hidden'), intro: !document.getElementById('introScr').classList.contains('hidden'), panel: document.getElementById('devpanel').classList.contains('hidden'), paused: BT.paused(), ch1: BT.S.ch1, cam: BT.chScene.pos(), dt: BT.day.t, served: BT.S.served }));
  await p.screenshot({ path: SC + '2c-sahne1.png' });
  await p.evaluate(() => { BT.chScene.st().t = BT.chScene.st().dur * 0.55; }); await sleep(2500);
  const sc1 = await p.evaluate(() => ({ on: BT.chScene.st().on, cam: BT.chScene.pos(), dt: BT.day.t, served: BT.S.served }));
  await p.screenshot({ path: SC + '2d-sahne2.png' });
  console.log('sahne:', JSON.stringify([sc0, sc1]));
  ok(sc0.on && sc0.body && sc0.hud === 'hidden' && sc0.bar === 'hidden' && /kendi kendine/.test(sc0.band) && sc0.el && !sc0.intro && sc0.panel && !sc0.paused && !sc0.ch1, 'izleme sahnesi: arayüz gizli, oyun duraklamaz, kart henüz yok: ' + JSON.stringify(sc0));
  ok(sc1.on && (Math.abs(sc1.cam.x - sc0.cam.x) + Math.abs(sc1.cam.y - sc0.cam.y)) > 2 && Math.abs(sc1.dt - sc0.dt) < 0.01, 'kamera limanı dolaşır, gün saati durur: ' + JSON.stringify([sc0.cam, sc1.cam, sc0.dt, sc1.dt]));
  await p.mouse.click(215, 500); await sleep(1500);
  const introOn = () => p.evaluate(() => !document.getElementById('introScr').classList.contains('hidden'));
  const io = await introOn(), pc = await p.evaluate(() => document.getElementById('devpanel').classList.contains('hidden') && !document.body.classList.contains('chScene') && !BT.chScene.st().on);
  console.log('gazete açıldı:', io, 'sahne bitti:', pc); ok(io && pc, 'dokununca sahne bitip gazete açılmadı');
  await sleep(3000); await p.screenshot({ path: SC + '3-gazete1.png' });
  const tap = async () => { await p.mouse.click(215, 700); await sleep(400); };
  await tap(); await tap(); await sleep(3200); await p.screenshot({ path: SC + '4-gazete2.png' });
  for (let k = 0; k < 8 && await introOn(); k++) await tap();
  await sleep(1200); await p.screenshot({ path: SC + '5-kart.png' });
  const card = await p.evaluate(() => ({ vis: !document.getElementById('chEnd').classList.contains('hidden'), txt: document.getElementById('chEnd').innerText.replace(/\s+/g, ' ') }));
  console.log('kart:', card); ok(card.vis && /elinize sağlık/.test(card.txt) && /devler liginde/.test(card.txt) && /OYUNU BİTİR/.test(card.txt), 'bölüm kartı yok/eksik');   /* v1.9.4: teşekkür metni + 3 seçenek */
  await p.click('#chEndGo'); await sleep(1500);
  const after = await p.evaluate(() => ({ paused: BT.paused(), ch1: BT.S.ch1, chBtn: document.getElementById('chBtn').classList.contains('hidden'), day: BT.day.n, served: BT.S.served }));
  await sleep(8000);
  const after2 = await p.evaluate(() => ({ served: BT.S.served, cash: Math.round(BT.S.cash) }));
  await p.screenshot({ path: SC + '6-devam.png' });
  console.log('sonra:', after, after2);
  ok(!after.paused && after.ch1 && after.chBtn && after2.served > after.served, 'bölüm sonrası oyun devam etmiyor');
  ok(await p.evaluate(() => document.getElementById('objective').classList.contains('hidden') || !/Sandığın/.test(document.getElementById('objText').textContent)), 'eski eğitim hedefi hâlâ görünüyor');
  /* kaydet → yeniden yükle: bölüm tekrar tetiklenmemeli */
  await p.reload(); await sleep(1200); if (await p.isVisible('#introSkip')) await p.click('#introSkip');
  await p.click('#playBtn'); await sleep(300); if (await p.isVisible('#slotScr')) await p.click('#slotRows .sb[data-n="1"]'); await sleep(2500);
  const ld = await p.evaluate(() => ({ ch1: BT.S.ch1, intro: !document.getElementById('introScr').classList.contains('hidden'), chBtn: document.getElementById('chBtn').classList.contains('hidden') }));
  console.log('yükleme sonrası:', ld); ok(ld.ch1 && !ld.intro && ld.chBtn, 'kayıttan dönünce bölüm sonu yeniden tetiklendi');
  /* İngilizce kapanış metni */
  console.log('errs', errs);
  await b.close();
  console.log(fail.length || errs.length ? 'CHAPTER_FAIL ' + JSON.stringify(fail) : 'CHAPTER_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
