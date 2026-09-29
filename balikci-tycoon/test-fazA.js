/* v1.9.1 (Faz A) kabul testi:
   1) her bölgenin tahsildarı kendi tezgâh kasasını boşaltır (önceden yalnız 1. bölgeninki çalışıyordu);
   2) kaydet-çık ve sayfa yenileme sonrası kuyruktaki müşteriler, tezgâh stoğu ve kasadaki para korunur;
   3) Açık Tezgâhlar düğmesi ☰'ün yanında: tek tezgâhta gizli, ikinci tezgâhla görünür ve pencereyi açar;
   4) YÜKSELT sekmesinde ilk kartlar oyuncunun kendi gelişimi; personel almadan devret kartı çıkmaz. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  const p = await ctx.newPage();
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  const closeStall = () => p.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Faz A Liman'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  await p.evaluate(() => { BT.S.ctrl = 2; });

  /* 4) YÜKSELT sırası (yeni oyun, tek bölge) */
  await p.click('.dtab[data-t="level"]'); await sleep(300);
  R.up = await p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map(d => d.textContent.trim().slice(0, 40)));
  ok(R.up.length && /Kapasite|Taşıma|Küfe|Hız|Ayakkabı/i.test(R.up[0] + R.up[1]), 'ilk kartlar oyuncu gelişimi değil ' + JSON.stringify(R.up));
  ok(!R.up.some(t => /Devret|Eksik rol/i.test(t)), 'personel yokken devret kartı çıktı ' + JSON.stringify(R.up));
  await p.click('.dtab[data-t="level"]'); await sleep(200);

  /* 3) tezgâh düğmesi: tek tezgâhta gizli */
  R.btn0 = await p.evaluate(() => document.getElementById('stallBtn').classList.contains('hidden'));
  ok(R.btn0, 'tek tezgâhta tezgâh düğmesi görünüyor');

  /* 1) üç bölge, üç tahsildar */
  R.col = await p.evaluate(async () => {
    BT.S.cash = 1e6;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; });
    BT.rebuildCounters();
    const main = BT.counters.filter(c => ['b0', 'b1', 'b2'].includes(c.key));
    main.forEach(c => { c.open = true; c.tray.items.length = 0; for (let i = 0; i < 4; i++) c.tray.items.push({ k: 'money', v: 40 }); });
    BT.player.x = 13; BT.player.y = 4;                      /* oyuncu meydanda: kasayı kendisi toplamasın */
    const ws = [0, 1, 2].map(z => BT.hire('kasiyer', true, z));
    const t0 = Date.now();
    while (Date.now() - t0 < 40000 && main.some(c => c.tray.items.length)) {
      await new Promise(r => setTimeout(r, 500));
      const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click();
    }
    return { left: main.map(c => c.key + ':' + c.tray.items.length), pos: ws.map(w => w.zone + '@' + w.x.toFixed(1) + ',' + w.y.toFixed(1)) };
  });
  ok(R.col.left.every(s => s.endsWith(':0')), 'tahsildar kasayı boşaltmadı ' + JSON.stringify(R.col));
  await closeStall();

  /* 3) iki+ tezgâh: düğme görünür ve pencereyi açar */
  await sleep(300);
  R.btn1 = await p.evaluate(() => !document.getElementById('stallBtn').classList.contains('hidden'));
  ok(R.btn1, 'tezgâh düğmesi görünmedi');
  if (R.btn1) {
    await p.click('#stallBtn'); await sleep(250);
    R.btnOpen = await p.evaluate(() => !document.getElementById('stallScr').classList.contains('hidden') && BT.paused());
    ok(R.btnOpen, 'düğme Açık Tezgâhlar penceresini açmadı');
    await closeStall(); await sleep(200);
  }

  /* 2) kuyruk + stok + kasa kayıtta kalır */
  const snap = () => p.evaluate(() => {
    const c = BT.counters.find(q => q.key === 'b0');
    const got = c.slots.filter(Boolean).reduce((a, q) => a + q.ord.got, 0);
    return { cust: c.slots.filter(Boolean).length, buf: c.buffer.length + got,   /* bekleyen müşteri tezgâhtan alır: stok + alınan sabit kalır */ tray: Math.round(c.tray.items.reduce((a, i) => a + i.v, 0)),
      ords: c.slots.filter(Boolean).map(q => q.type.id + ':' + q.ord.k + q.ord.need).sort().join(',') };
  });
  await p.evaluate(() => {
    const c = BT.counters.find(q => q.key === 'b0');
    BT.workers.length = 0;                                  /* tahsildar kasayı taşımasın */
    c.buffer.length = 0; for (let i = 0; i < 3; i++) c.buffer.push({ k: 'fileto', f: 'hamsi' });
    c.tray.items.length = 0; c.tray.items.push({ k: 'money', v: 120 }, { k: 'money', v: 35 });
    const t = BT.CUST.find(q => q.id === 'isci');
    for (let i = 0; i < c.slots.length; i++) c.slots[i] = null;
    BT.customers.length = 0;
    for (let i = 0; i < 3; i++) {
      const cu = { x: 11, y: 3 + i, z: 0, bob: 0, face: -1, type: t, ord: { k: 'fileto', f: 'hamsi', need: 20 + i, got: 0 }, state: 'wait', slot: i, c, pat: 900, patMax: 900, mood: 1, hair: 0, tone: 0 };
      c.slots[i] = cu; BT.customers.push(cu);
    }
    c.spawnT = 999; BT.player.x = 13; BT.player.y = 4;
  });
  const before = await snap();
  await p.click('#menuBtn'); await sleep(150); await p.click('#menuSet'); await sleep(200);
  await p.click('#saveQuitBtn'); await sleep(300); await p.click('#playBtn'); await sleep(600);
  const afterQuit = await snap();
  ok(afterQuit.cust === 3 && afterQuit.ords === before.ords && afterQuit.buf === before.buf && afterQuit.tray === before.tray,
    'kaydet-çık sonrası tezgâh önü değişti ' + JSON.stringify({ before, afterQuit }));
  await p.evaluate(() => BT.saveNow && BT.saveNow());
  await p.goto(URL); await sleep(1100);
  await p.click('#playBtn'); await sleep(700);
  const afterReload = await snap();
  ok(afterReload.cust === 3 && afterReload.ords === before.ords && afterReload.buf === before.buf && afterReload.tray === before.tray,
    'yenileme sonrası tezgâh önü değişti ' + JSON.stringify({ before, afterReload }));
  R.q = { before, afterQuit, afterReload };

  /* eski kayıt (q alanı yok) bozulmadan yüklenir */
  R.legacy = await p.evaluate(() => { const d = BT.buildSave(); delete d.q; return BT.loadFrom(d); });
  ok(R.legacy === true, 'q alanı olmayan kayıt yüklenemedi');
  /* v1.9.7: elle bozulmuş kayıt: metin / eksi / sonsuz sayılar geçerli aralığa */
  R.bozuk = await p.evaluate(() => { const d = BT.buildSave(); Object.assign(d, { cash: 'abc', rep: -5000, served: '12', play: 1e999, capLvl: 3.7, runId: '<x>' });
    const okL = BT.loadFrom(d); return { okL, cash: BT.S.cash, rep: BT.S.rep, served: BT.S.served, play: BT.S.play, cap: BT.S.capLvl, run: BT.S.runId }; });
  ok(R.bozuk.okL && R.bozuk.cash === 0 && R.bozuk.rep === 0 && R.bozuk.served === 12 && R.bozuk.play === 0 && R.bozuk.cap === 3 && R.bozuk.run === '', 'bozuk kayıt doğrulanmadı ' + JSON.stringify(R.bozuk));

  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'FAZA_FAIL ' + JSON.stringify(fail) : 'FAZA_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
