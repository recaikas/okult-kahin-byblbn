/* Hamsi Koyu — App Store ekran görüntüleri (6 × TR/EN, 1290×2796) + seri önizlemesi.
   Oyun klasörü 8101'de sunulmalı:  npx http-server -p 8101 -c-1 .
   Kullanım:  node magaza/ekran/uret.js            → ham çekim + birleştirme
              node magaza/ekran/uret.js ham [tr|en] → yalnız oyundan ham görüntü (ham/<dil>-<n>.png, 380×692 @3x)
              node magaza/ekran/uret.js kompoz       → yalnız birleştirme (tr-1..6.png, en-1..6.png, seri.png)
   Ham görüntü 1140×2076 px'tir ve çerçeveye 1:1 oturur (ölçekleme yok, piksel sanat bozulmaz). */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.URL || 'http://localhost:8101/';
const DIR = __dirname, HAM = path.join(DIR, 'ham');
const VP = { width: 380, height: 692 }, DSF = 3;

/* ---------- başlıklar ---------- */
const CAP = {
  tr: [
    ['Kendi Karadeniz', 'limanını kur', 'İskeleden pazara, füme evinden mutfağa'],
    ['Ağdan tezgâha:', 'tut, kes, sat', 'Hamsiyi ağdan al, kes, kuyruğa yetiştir'],
    ['Dipteki Söz:', 'Şahmeran\'ın sırrı', '12 günlük bir Anadolu efsanesi, oyunun içinde'],
    ['Haşmet Bey', 'geliyor, kaçın!', 'Vergi memuru limanda, müşteriler dağılır'],
    ['Personel al,', 'limanını büyüt', 'Müdür, kulübe, depo ve balık hali'],
    ['1974\'ün nostaljik', 'Karadeniz\'i', 'Her şey eski bir gazete manşetiyle başlar']
  ],
  en: [
    ['Build your own', 'Black Sea harbor', 'From pier and market to smokehouse and kitchen'],
    ['Net to stall:', 'catch, cut, sell', 'Haul the anchovies, fillet them, feed the queue'],
    ['The Promise Below:', 'the serpent queen', 'A 12-day Anatolian legend, right in the game'],
    ['The tax man', 'is coming. Run!', 'Mr. Haşmet hits the docks, customers scatter'],
    ['Hire staff,', 'grow your harbor', 'Managers, staff hut, depot and fish hall'],
    ['Nostalgic', 'Black Sea, 1974', 'It all begins with an old newspaper headline']
  ]
};
/* her görselin vurgu rengi (kilim şeridi ortak, arka plan tonu konuya göre hafif değişir) */
const TONE = ['#0f2236', '#0e2a33', '#141c38', '#2a1620', '#1c1a14', '#1a1712'];

/* ---------- oyunu aç, dolu bir koy kur ---------- */
async function openGame(b, lang) {
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: DSF, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(BASE + 'index.html'); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(l => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; if (BT.setLang) BT.setLang(l); }, lang);
  return { ctx, p };
}
async function startGame(p, lang) {
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', lang === 'en' ? 'Silver Net Co.' : 'Gümüş Ağ Balıkçılık').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
}
async function richCove(p, secs) {
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    /* meydan binaları: kulübe, depo, hal, ticaret ofisi; her bölgeye müdür */
    HKG.v('HUT').lvl = 3; HKG.v('DEPOT').lvl = 2; HKG.v('WHALL').built = true; HKG.v('M').office = true;
    ['depocu', 'sevkiyat'].forEach(r => BT.hire(r, true, 0));
    const MN = ['Sadık Bey', 'Nazmiye Hanım', 'Rıza Bey', 'Feride Hanım'];
    S.mgr = MN.map((n, i) => ({ n, a: 'value', b: 'pat', wage: 35 + i * 10, look: i % 3 }));
    S.auto = [true, true, true, true];
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep(secs * 1000);
}
const clean = p => p.evaluate(() => {
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); } });
  const cb = HKG.v('closeBar'); if (cb && !document.getElementById('devpanel').classList.contains('hidden')) cb();
  HKG.v('syncPause')();
});
const look = (p, x, y, t, z) => p.evaluate(([x, y, t, z]) => {
  if (z) { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); }
  BT.player.x = x; BT.player.y = y; if (t != null) BT.day.t = BT.DAY_LEN * t;
}, [x, y, t, z]);

async function capture(lang) {
  fs.mkdirSync(HAM, { recursive: true });
  const f = n => path.join(HAM, lang + '-' + n + '.png');
  const b = await chromium.launch();
  const { p } = await openGame(b, lang);
  /* 6) gazete: hamsi sürüleri koya döndü (1974) */
  await p.evaluate(() => { HKG.v('introAdvance')(); }); await sleep(400);
  await p.evaluate(() => { HKG.v('introScene')(1); }); await sleep(5200);
  await p.screenshot({ path: f(6) }); console.log(lang, 6);
  await startGame(p, lang);
  await richCove(p, 22);
  /* 1) gelişmiş liman */
  await look(p, 6.5, 4.5, 0.45, 2); await clean(p); await sleep(2200); await p.screenshot({ path: f(1) }); console.log(lang, 1);
  /* 2) üretim zinciri: ağ, kesim masası, Ana Kasa, kuyruk (yakın) */
  await look(p, 5.6, 3.4, 0.45, 3); await clean(p); await sleep(2200); await p.screenshot({ path: f(2) }); console.log(lang, 2);
  /* 5) meydan + personel paneli */
  await look(p, 18.2, 5.2, 0.45, 2); await clean(p); await sleep(2400); await p.screenshot({ path: f('5a') });
  await look(p, 17.6, 4.2, 0.45, 3); await clean(p); await sleep(2400); await p.screenshot({ path: f('5b') }); console.log(lang, 5);
  await clean(p); await sleep(300);
  /* 4) Haşmet Bey: 7. gün, kuyruk dolu */
  await look(p, 7.4, 4.6, 0.25, 2); await clean(p); await sleep(5000);
  await p.evaluate(() => { BT.day.n = 7; const q = BT.tax.q(); q.items = 60; q.due = 420; q.last = 0; BT.day.t = BT.DAY_LEN * 0.31; });
  await sleep(2600); await clean(p); await p.screenshot({ path: f('4a') });
  for (let i = 0; i < 40; i++) { const s = await p.evaluate(() => BT.tax.st().say); if (s === 2) break; await sleep(500); }
  await sleep(500); await p.screenshot({ path: f('4b') }); console.log(lang, 4);
  for (let i = 0; i < 60 && await p.evaluate(() => BT.tax.st().on); i++) await sleep(1000);
  /* 3) Dipteki Söz: yunus sıçrar, sonra ara sahne */
  await p.evaluate(() => { window.HK_STORY_OFF = 0; BT.storySet({ step: 7, last: 0 }); BT.day.n = 9; BT.day.phase = 'play'; BT.day.t = 40; BT.player.x = 3.6; BT.player.y = 3.4; });
  for (let i = 0; i < 30 && !(await p.evaluate(() => !!BT.dolph())); i++) await sleep(500);
  for (let i = 0; i < 30 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'leap'; i++) await sleep(200);
  await sleep(420); await clean(p); await p.screenshot({ path: f('3a') });
  for (let i = 0; i < 30 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'wait'; i++) await sleep(300);
  await sleep(600); await clean(p); await p.screenshot({ path: f('3c') });
  await p.evaluate(() => window.HK_STORY_OFF = 1);
  await p.evaluate(l => { HK_STORY.open(8, { lang: l, ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] }); }, lang);
  await sleep(2600);
  for (let i = 0; i < 3; i++) { await p.evaluate(() => HK_STORY._tap()); await sleep(250); await p.evaluate(() => HK_STORY._tap()); await sleep(900); }
  await sleep(1800); await p.screenshot({ path: f('3b') }); console.log(lang, 3);
  await b.close();
}

/* ek sahneler: yunus (iskelenin kuzeyinde, yakından) ve BİNA / ALAN panelleri */
async function extra(lang) {
  const f = n => path.join(HAM, lang + '-' + n + '.png');
  const b = await chromium.launch();
  const { p } = await openGame(b, lang);
  await startGame(p, lang);
  await richCove(p, 18);
  await look(p, 18.4, 6.4, 0.45, 2); await clean(p); await sleep(1500);
  await p.click('.dtab[data-t="serv"]'); await sleep(900); await p.screenshot({ path: f('5c') });
  await clean(p); await look(p, 5.2, 7.5, 0.45, 2); await sleep(1200);
  await p.click('.dtab[data-t="area"]'); await sleep(900); await p.screenshot({ path: f('5d') });
  await clean(p);
  /* Haşmet Bey yakından: kamerayı memurun üstüne al */
  await look(p, 7.4, 4.6, 0.25, 2); await clean(p); await sleep(4000);
  await p.evaluate(() => { BT.day.n = 7; const q = BT.tax.q(); q.items = 60; q.due = 420; q.last = 0; BT.day.t = BT.DAY_LEN * 0.31; });
  await sleep(1300);
  await p.evaluate(() => { const T = BT.tax.st(); BT.player.x = T.x + 0.9; BT.player.y = T.y - 0.9; });
  await sleep(1100); await clean(p); await p.screenshot({ path: f('4c') });
  for (let i = 0; i < 60 && await p.evaluate(() => BT.tax.st().on); i++) await sleep(1000);
  await p.evaluate(() => { window.HK_STORY_OFF = 0; BT.storySet({ step: 7, last: 0 }); BT.day.n = 9; BT.day.phase = 'play'; BT.day.t = 40; BT.player.x = 4.6; BT.player.y = 2.6; });
  await look(p, 4.6, 2.6, null, 2);
  for (let i = 0; i < 30 && !(await p.evaluate(() => !!BT.dolph())); i++) await sleep(500);
  for (let i = 0; i < 40 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'leap'; i++) await sleep(150);
  await sleep(430); await clean(p); await p.screenshot({ path: f('3d') });
  await sleep(1150); await p.screenshot({ path: f('3e') });
  console.log(lang, 'ek', await p.evaluate(() => JSON.stringify({ d: BT.dolph() && [BT.dolph().st, BT.dolph().x, BT.dolph().y] })));
  await b.close();
}

/* ---------- birleştirme ---------- */
async function compose() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 });
  const PICK = JSON.parse(process.env.PICK || '{"1":"1","2":"2","3":"3b","4":"4c","5":"5c","6":"6"}');
  for (const lang of ['tr', 'en']) for (let i = 1; i <= 6; i++) {
    const [l1, l2, sub] = CAP[lang][i - 1];
    const q = new URLSearchParams({ img: 'ham/' + lang + '-' + PICK[i] + '.png', l1, l2, sub, n: i, tone: TONE[i - 1] });
    await p.goto(BASE + 'magaza/ekran/kompoz.html?' + q);
    await p.evaluate(async () => { await document.fonts.ready; const im = document.getElementById('img'); if (!im.complete) await new Promise(r => im.onload = r); });
    await sleep(120);
    await p.screenshot({ path: path.join(DIR, lang + '-' + i + '.png') });
    console.log('kompoz', lang, i);
  }
  /* seri önizlemesi: altı TR görseli yan yana (+ altında EN) */
  await p.setViewportSize({ width: 6 * 430 + 7 * 30, height: 2 * 932 + 3 * 30 });
  await p.setContent('<body style="margin:0;background:#0a1622;display:grid;grid-template-columns:repeat(6,430px);gap:30px;padding:30px">' +
    ['tr', 'en'].map(l => [1, 2, 3, 4, 5, 6].map(i => '<img style="width:430px;height:932px;display:block" src="' + BASE + 'magaza/ekran/' + l + '-' + i + '.png?' + Date.now() + '">').join('')).join('') + '</body>');
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => i.onload = r))));
  await p.screenshot({ path: path.join(DIR, 'seri.png') });
  await b.close();
}

(async () => {
  const mode = process.argv[2] || 'hepsi', only = process.argv[3];
  if (mode === 'ham' || mode === 'hepsi') for (const l of only ? [only] : ['tr', 'en']) await capture(l);
  if (mode === 'ek') for (const l of only ? [only] : ['tr', 'en']) await extra(l);
  if (mode === 'kompoz' || mode === 'hepsi') await compose();
})();
