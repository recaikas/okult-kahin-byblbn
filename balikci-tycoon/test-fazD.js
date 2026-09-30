/* v1.9.4 (Faz D) + v1.9.5 kabul testi:
   1) Kapalı Pazar rafta: PROJE'de yatırım kartı yok, bölüm hedefinde ve başarımlarda yok;
   2) joker müdür (yalnız KENDİ bölgesinin kasaları/tezgâhları): yoğun saat dışında masada; öğle yoğunluğunda kasayı boşaltır (para hesaba), hasırdan tezgâha mal
      taşır; yoğunluk bitince masasına döner; yoğun saatte müşteri akışı artar;
   3) Hal: alınan mal palette bekler, Hal Hamalı depoya taşır; kayıt paleti korur;
   4) Bölüm 1 sonu: üç seçenek — değerlendirme yaz (form kapanınca karta dönülür), oyunu bitir (jenerik → ana menü,
      kayıt korunur), devam et. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  const vis = id => p.evaluate(i => !document.getElementById(i).classList.contains('hidden'), id);
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Joker Liman'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => { BT.achMute && BT.achMute(true); BT.S.ctrl = 2; BT.S.tut = 99; BT.S.cash = 1e5; BT.S.rep = 400;
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 200); });

  /* 1) Kapalı Pazar rafta */
  await p.click('.dtab[data-t="proj"]'); await sleep(300);
  R.proj = await p.evaluate(() => ({ inv: document.querySelectorAll('#dpCards .dinv button').length, txt: document.getElementById('dpCards').textContent.slice(0, 120),
    ch: BT.chapterGroups().map(g => g.t), ach: BT.ACH_IDS().includes('kapali_pazar') }));
  ok(R.proj.inv === 0 && !/Kapalı Pazar/.test(R.proj.txt), 'PROJE sekmesinde Kapalı Pazar var ' + JSON.stringify(R.proj));
  ok(!R.proj.ch.some(t => /Kapalı Pazar/.test(t)) && !R.proj.ach, 'Kapalı Pazar hedefte / başarımda ' + JSON.stringify(R.proj));
  await p.click('.dtab[data-t="proj"]'); await sleep(200);

  /* 2) joker müdür (1. bölge) */
  R.jk = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    BT.S.mgr = [{ n: 'Sadık Bey', a: 'value', b: 'pat', wage: 40, look: 0 }];
    BT.player.x = 18; BT.player.y = 5;                                  /* oyuncu meydanda: kasaya dokunmasın */
    const D = BT.day, L = 300, c = BT.counters.find(q => q.key === 'b0'), t = BT.tables[0], out = {};
    D.phase = 'play'; D.t = L * 0.3; await wait(1500);
    const seat = { x: BT.MGR_DESKS[0].x - 0.35, y: BT.MGR_DESKS[0].y - 0.75 };
    const a0 = BT.mgrAct()[0]; out.offPeak = { rush: BT.rushNow(), atDesk: !!a0 && Math.hypot(a0.x - seat.x, a0.y - seat.y) < 0.3 };
    /* öğle yoğunluğu: dolmaya yüz tutan kasa */
    c.tray.items.length = 0; for (let i = 0; i < 6; i++) c.tray.items.push({ k: 'money', v: 40 });
    /* başka bölgenin (Balık Pazarı, müdürsüz) dolu kasası: 1. bölgenin müdürü ona dokunmamalı */
    BT.areas[1].locked = false; BT.rebuildCounters(); const c1 = BT.counters.find(q => q.key === 'b1'); c1.open = true;
    c1.tray.items.length = 0; for (let i = 0; i < 8; i++) c1.tray.items.push({ k: 'money', v: 40 }); c1.spawnT = 999;
    c.spawnT = 999; const cash0 = BT.S.cash;
    D.t = L * 0.45; let t0 = Date.now();
    while (Date.now() - t0 < 15000 && c.tray.items.length) { D.t = L * 0.45; await wait(200); }
    const a1 = BT.mgrAct()[0];
    out.tray = { rush: BT.rushNow(), left: c.tray.items.length, gain: Math.round(BT.S.cash - cash0), away: Math.hypot(a1.x - seat.x, a1.y - seat.y) > 0.3, other: c1.tray.items.length, ay: +a1.y.toFixed(1) };
    /* hasırdan tezgâha mal */
    c.buffer.length = 0; t.mat.items.length = 0; for (let i = 0; i < 6; i++) t.mat.items.push({ k: 'fileto', f: 'hamsi' });
    BT.customers.length = 0; c.slots.fill(null);
    t0 = Date.now();
    while (Date.now() - t0 < 20000 && c.buffer.length < 4) { D.t = L * 0.45; c.spawnT = 999; await wait(200); }
    out.refill = { buf: c.buffer.length, mat: t.mat.items.length };
    /* yoğunluk biter: masaya döner */
    t0 = Date.now(); let back = false;
    while (Date.now() - t0 < 15000 && !back) { D.t = L * 0.7; await wait(250); const a = BT.mgrAct()[0]; back = Math.hypot(a.x - seat.x, a.y - seat.y) < 0.3; }
    out.back = back;
    return out;
  });
  ok(R.jk.offPeak.atDesk && !R.jk.offPeak.rush, 'yoğun saat dışında müdür masada değil ' + JSON.stringify(R.jk));
  ok(R.jk.tray.rush && R.jk.tray.left === 0 && R.jk.tray.gain >= 230 && R.jk.tray.gain < 300 && R.jk.tray.away, 'joker müdür kasayı boşaltmadı ' + JSON.stringify(R.jk));
  ok(R.jk.tray.other === 8 && R.jk.tray.ay < 6.2, 'müdür başka bölgenin kasasına dokundu ' + JSON.stringify(R.jk.tray));
  ok(R.jk.refill.buf >= 4, 'joker müdür tezgâha mal taşımadı ' + JSON.stringify(R.jk));
  ok(R.jk.back, 'yoğunluk bitince müdür masasına dönmedi');

  /* müzik: on parça, her biri 16 ölçü (ölçü uzunluğu parçaya göre: 9/8, 6/8); sırayla değişince hata yok */
  R.mus = await p.evaluate(async () => {
    const lens = BT.SONGS.map(sg => [sg.id, sg.lead.reduce((a, n) => a + n[1], 0), sg.bass.length * (sg.bar || 8)]);
    const seen = [];
    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]) { BT.songAt(i); await new Promise(r => setTimeout(r, 700)); seen.push(BT.music().song); }
    return { lens, seen };
  });
  ok(R.mus.lens.length === 10 && R.mus.lens.every(q => q[1] === q[2]) && R.mus.seen.join() === 'liman,yesilcam,rock,karadeniz,tango,zeybek,ciftetelli,shanty,arabesk,iskele', 'müzik parçaları yanlış ' + JSON.stringify(R.mus));
  /* ayarlar › çalma listesi: sırayla + 10 parça; seçilen parça hemen çalar ve tercihe yazılır */
  R.pl = await p.evaluate(async () => {
    BT.ui.openSettings(); await new Promise(r => setTimeout(r, 250));
    const rows = [...document.querySelectorAll('#musList button')].map(b => b.textContent);
    document.querySelector('#musList button[data-p="1"]').click(); await new Promise(r => setTimeout(r, 400));
    const one = { pick: BT.musicPick(), song: BT.music().song, pref: JSON.parse(localStorage.getItem('balikci_pref')).mp, on: document.querySelector('#musList button[data-p="1"]').className };
    document.querySelector('#musList button[data-p="-1"]').click(); await new Promise(r => setTimeout(r, 200));
    const auto = { pick: BT.musicPick(), pref: JSON.parse(localStorage.getItem('balikci_pref')).mp };
    BT.ui.closeSettings();
    return { rows, one, auto };
  });
  ok(R.pl.rows.length === 11 && /Sırayla/.test(R.pl.rows[0]) && ['Yeşilçam', 'Liman Yolu', 'Bozkır Rüzgârı', 'Yayla Horonu', 'Beyoğlu Tangosu', 'Ege Zeybeği', 'Mutfak Çiftetellisi', 'Ağ Çekme Türküsü', 'Gün Batımı Arabeski'].every(n => R.pl.rows.join().includes(n)), 'çalma listesi eksik ' + JSON.stringify(R.pl.rows));
  ok(R.pl.one.pick === 1 && R.pl.one.pref === 1 && /on/.test(R.pl.one.on) && R.pl.auto.pick === -1 && R.pl.auto.pref === -1, 'parça seçimi yanlış ' + JSON.stringify(R.pl));
  /* 3) Hal paleti + Hal Hamalı */
  R.hal = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    BT.DEPOT.lvl = 2; BT.WHALL.built = true; BT.DEPOT.shelf = {};
    BT.WHALL.pal = { 'fileto|hamsi': 8 };
    const sv = BT.buildSave(); const palSaved = sv.meydan[4] && sv.meydan[4]['fileto|hamsi'];
    BT.hire('halhamal', true, -1);
    const t0 = Date.now();
    while (Date.now() - t0 < 30000 && ((BT.DEPOT.shelf['fileto|hamsi'] || 0) < 8)) await wait(300);
    return { palSaved, pal: Object.values(BT.WHALL.pal).reduce((a, n) => a + n, 0), shelf: BT.DEPOT.shelf['fileto|hamsi'] || 0, secs: Math.round((Date.now() - t0) / 1000) };
  });
  ok(R.hal.palSaved === 8 && R.hal.pal === 0 && R.hal.shelf === 8, 'Hal hamalı paleti depoya taşımadı ' + JSON.stringify(R.hal));

  /* 4) Bölüm 1 sonu kartı */
  await p.evaluate(() => { BT.S.ch1 = true; BT.showChapterCard(); }); await sleep(300);
  R.ch = await p.evaluate(() => ({ p: document.getElementById('chEndP').textContent, b: ['chEndFb', 'chEndFin', 'chEndGo'].map(i => document.getElementById(i).textContent) }));
  ok(/elinize sağlık/.test(R.ch.p) && /gönül işi/.test(R.ch.p) && /DEĞERLENDİRME/.test(R.ch.b[0]) && /BİTİR/.test(R.ch.b[1]) && /DEVAM/.test(R.ch.b[2]), 'bölüm sonu kartı yanlış ' + JSON.stringify(R.ch));
  await p.click('#chEndFb'); await sleep(300);
  R.fb = { form: await vis('fbScr'), card: await vis('chEnd') };
  await p.click('#fbCancel'); await sleep(300);
  R.fb.back = await vis('chEnd');
  ok(R.fb.form && !R.fb.card && R.fb.back, 'değerlendirme formu / karta dönüş yanlış ' + JSON.stringify(R.fb));
  await p.click('#chEndFin'); await sleep(500);
  R.fin = { end: await vis('endScr'), txt: await p.textContent('#endScr'), paused: await p.evaluate(() => BT.paused()) };
  ok(R.fin.end && /BALABAN GURURLA SUNDU/.test(R.fin.txt) && /TEŞEKKÜRLER/.test(R.fin.txt) && R.fin.paused, 'jenerik yanlış ' + JSON.stringify(R.fin));
  await p.click('#endGo'); await sleep(500);
  R.menu = await p.evaluate(() => ({ start: !document.getElementById('startScreen').classList.contains('hidden'), started: BT.S.started, ch1: JSON.parse(localStorage.getItem('balikci_slot_1')).ch[2] }));
  ok(R.menu.start && !R.menu.started && R.menu.ch1 === 1, 'oyunu bitir ana menüye dönmedi / kayıt yok ' + JSON.stringify(R.menu));
  await p.click('#playBtn'); await sleep(700);
  R.resume = await p.evaluate(() => ({ started: BT.S.started, ch1: BT.S.ch1, end: !document.getElementById('endScr').classList.contains('hidden') }));
  ok(R.resume.started && R.resume.ch1 && !R.resume.end, 'ana menüden devam edilemedi ' + JSON.stringify(R.resume));

  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'FAZD_FAIL\n - ' + fail.join('\n - ') : 'FAZD_OK');
  process.exit(fail.length ? 1 : 0);
})();
