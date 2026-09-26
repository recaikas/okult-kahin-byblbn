/* v1.3 — Bölüm 1 kapanışı: neredeyse bitmiş liman → son müdür arayüzden alınır → sayaç dolar →
   gazete (gerçek dokunuşla iki sayfa) → bölüm kartı → devam → oyun sürer; kayıttan dönünce tekrar tetiklenmez. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = (process.env.SC || require('os').tmpdir()) + '/'; const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.fill('#heroName', 'Recai'); await p.click('#heroGo'); await p.fill('#nameIn', 'Recai Balıkçılık'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  /* son müdür hariç her şey hazır (tam turda arayüzden alınanlar) */
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 60000; S.rep = 260; S.caught = 14820; S.env = 3; S.fumeM = [1, 1, 0]; S.chSeen = true;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; });
    BT.pads.forEach(q => { if (q.max && q.kind !== 'decor') q.lvl = q.max; });
    BT.decor.forEach(d => d.got = true);
    const bl = ['cay', 'tezgah', 'tezgah', 'cay', 'tezgah', 'tezgah', 'cay']; BT.slots.forEach((s, i) => s.b = bl[i]);
    BT.project.done = true; BT.project.stage = 5; BT.project.inv = BT.project.total;
    BT.HUT.lvl = 5; BT.DEPOT.lvl = 2; BT.WHALL.built = true;
    BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    for (let z = 0; z < 3; z++) ['hamal', 'filetocu', 'tezgahtar', 'kasiyer'].forEach(r => BT.hire(r, true, z));
    S.mgr = [{ n: 'Sadık Bey', a: 'value', b: 'wspeed', wage: 35, look: 0 }, { n: 'Gülten Hanım', a: 'pat', b: 'flow', wage: 45, look: 1 }];
    S.auto = [true, true, false];
    for (let i = 0; i < 11; i++) S.met.push(BT.SPECIALS[i].id);
    BT.player.x = 7.2; BT.player.y = 13.5;
  });
  await sleep(2500);
  await p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await sleep(1500);
  const pre = await p.evaluate(() => BT.chapter()); console.log('sayaç', pre.d + '/' + pre.n); ok(pre.n - pre.d === 1, 'kurulum: tek eksik kalmalı ' + pre.d + '/' + pre.n);
  await p.click('#chBtn'); await sleep(500); await p.screenshot({ path: SC + '1-sayac.png' }); await p.click('#chClose'); await sleep(300);
  /* son eksik: Fümehane müdürü — arayüzden */
  await p.click('.dtab[data-t="level"]'); await sleep(400);
  await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].find(d => /Müdür gerekli/.test(d.textContent)).querySelector('.buy').click()); await sleep(300);
  await p.screenshot({ path: SC + '2-mudur-adaylari.png' });
  await p.evaluate(() => document.querySelectorAll('#dpCards .dcard .buy')[1].click()); await sleep(200);
  await p.evaluate(() => { const c = document.querySelector('#dpCards .buy.cf'); if (c) c.click(); }); await sleep(1800);
  const introOn = () => p.evaluate(() => !document.getElementById('introScr').classList.contains('hidden'));
  const io = await introOn(), pc = await p.evaluate(() => document.getElementById('devpanel').classList.contains('hidden'));
  console.log('gazete açıldı:', io, 'panel kapandı:', pc); ok(io && pc, 'gazete açılmadı / panel açık kaldı');
  await sleep(3000); await p.screenshot({ path: SC + '3-gazete1.png' });
  const tap = async () => { await p.mouse.click(215, 700); await sleep(400); };
  await tap(); await tap(); await sleep(3200); await p.screenshot({ path: SC + '4-gazete2.png' });
  for (let k = 0; k < 8 && await introOn(); k++) await tap();
  await sleep(1200); await p.screenshot({ path: SC + '5-kart.png' });
  const card = await p.evaluate(() => ({ vis: !document.getElementById('chEnd').classList.contains('hidden'), txt: document.getElementById('chEnd').innerText.replace(/\s+/g, ' ') }));
  console.log('kart:', card); ok(card.vis && /Recai Balıkçılık/.test(card.txt) && /devler liginde/.test(card.txt), 'bölüm kartı yok/eksik');
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
