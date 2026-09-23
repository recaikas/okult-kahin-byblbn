/* Hiç kaydı olmayan YEPYENİ bir oyun gerçekten oynanabiliyor mu?
   (v0.1'de bulunan hata: başlangıç tezgâhı yalnız kayıt yüklenirken açılıyordu,
   yeni oyunda kapalı kalıyor ve ağ hiç balık üretmiyordu.)
   NOT: localStorage.clear()+reload ile test ETME — beforeunload yeni bir kayıt
   yazar ve hatayı maskeler. Her zaman temiz bir tarayıcı profili kullan. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const errs = [];
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('C: ' + m.text()); });
  await p.goto('file://' + __dirname + '/index.html');
  await sleep(1600);
  const kayit = await p.evaluate(() => !!localStorage.getItem('balikci_tycoon_v3'));
  /* v0.2 akışı: gazete hikâyesi → ana menü → YENİ OYUN → işletme adı → oyun */
  const introAcik = await p.evaluate(() => !document.getElementById('introScr').classList.contains('hidden'));
  await p.click('#introSkip');
  await p.click('#playBtn');
  await p.click('#nameGo');
  await sleep(800);
  const sirket = await p.evaluate(() => BT.S.company);
  const bas = await p.evaluate(() => ({
    stalls: BT.stalls(), sellable: BT.sellable(),
    acik: BT.stalls().filter(s => s[2] === 'AÇIK').length
  }));
  await sleep(16000);
  const son = await p.evaluate(() => ({
    ag: BT.spots.map(s => s.stock.length),
    musteri: BT.customers.length,
    tut: BT.S.tut
  }));
  await p.close(); await b.close();
  const ok = introAcik && sirket.length >= 2 && !kayit && bas.acik >= 1 && bas.sellable.length >= 1 && son.ag[0] > 0 && !errs.length;
  console.log(JSON.stringify({ kayitYok: !kayit, introAcik, sirket, bas, son, FRESH_OK: ok, errs: [...new Set(errs)] }, null, 1));
  process.exit(ok ? 0 : 1);
})();
