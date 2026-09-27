/* Görüş hediyesi (oyun içi form): sürüm başına bir kez, en az 10 harf yorum, puandan bağımsız, skor tablosu
   kazancına sayılmaz; formda önceden yazar. Mağaza puanı hiçbir yerde ödüllendirilmez (yalnız oyun içi form). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const newGame = async (p, name) => {
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', name); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  await p.evaluate(() => BT.achMute(true));
};
const send = async (p, stars, text) => {
  await p.evaluate(() => BT.fbShow()); await sleep(150);
  const hint = await p.evaluate(() => ({ vis: !document.getElementById('fbGift').classList.contains('hidden'), t: document.getElementById('fbGift').textContent }));
  await p.click('#fbStars button[data-v="' + stars + '"]'); await p.fill('#fbText', text);
  const c0 = await p.evaluate(() => ({ cash: BT.S.cash, earned: BT.S.earned }));
  await p.click('#fbSend'); await sleep(2200);
  const c1 = await p.evaluate(() => ({ cash: BT.S.cash, earned: BT.S.earned, key: localStorage.getItem('balikci_fb_gift'), t: document.getElementById('toast').textContent }));
  return { hint, gain: c1.cash - c0.cash, earnedGain: c1.earned - c0.earned, key: c1.key, toast: c1.t };
};
(async () => {
  const b = await chromium.launch(); const errs = [];
  let ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); let p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await newGame(p, 'Hediye Limanı');
  const s1 = await send(p, 1, 'kötü  ');
  ok(s1.hint.vis && /\$300/.test(s1.hint.t) && /yıldız/.test(s1.hint.t) && s1.gain === 0 && s1.key === null, 'kısa yorum hediye aldı / ipucu yok ' + JSON.stringify(s1));
  const s2 = await send(p, 1, 'Tezgâh çok yavaş doluyor');
  ok(s2.gain === 300 && s2.earnedGain === 0 && s2.key === '1.8' && /hediye/.test(s2.toast), '1 yıldızlı yorum hediye almadı ' + JSON.stringify(s2));
  const s3 = await send(p, 5, 'Bir yorum daha yazıyorum');
  ok(!s3.hint.vis && s3.gain === 0, 'aynı sürümde ikinci hediye verildi ' + JSON.stringify(s3));
  await ctx.close();
  /* 5 yıldız: aynı tutar (puandan bağımsız); tutar günlük gelire göre ölçeklenir, üst sınır 20.000 */
  ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await newGame(p, 'Beş Yıldız');
  const s4 = await send(p, 5, 'Harika bir oyun olmuş');
  ok(s4.gain === 300, '5 yıldız farklı hediye aldı ' + JSON.stringify(s4));
  const amt = await p.evaluate(() => { BT.retSet(null, 10000); const a = BT.fbGiftAmt(); BT.retSet(null, 1e6); const c = BT.fbGiftAmt(); return [a, c]; });
  ok(amt[0] === 5000 && amt[1] === 20000, 'hediye tutarı ölçeklenmiyor ' + JSON.stringify(amt));
  /* test dönemi dürtmesi: web'de 15 dk oyundan sonra sürüm başına bir kez görüş ister */
  await p.evaluate(() => { BT.S.play = 100; }); await sleep(5600);
  ok(await p.evaluate(() => document.getElementById('askScr').classList.contains('hidden')), '15 dk dolmadan görüş istendi');
  await p.evaluate(() => { BT.S.play = 950; }); await sleep(5600);
  const nd = await p.evaluate(() => ({ ask: !document.getElementById('askScr').classList.contains('hidden'), msg: document.getElementById('askMsg').textContent, yes: document.getElementById('askYes').textContent, no: document.getElementById('askNo').textContent }));
  ok(nd.ask && /geliştiriliyor/.test(nd.msg) && nd.yes === 'GÖRÜŞ YAZ' && nd.no === 'SONRA' && !/hediye/.test(nd.msg), 'görüş dürtmesi yanlış ' + JSON.stringify(nd));
  await p.click('#askYes'); await sleep(300);
  ok(await p.evaluate(() => BT.fbIsOpen()), 'GÖRÜŞ YAZ formu açmadı');
  await p.evaluate(() => document.getElementById('fbCancel').click()); await sleep(5600);
  ok(await p.evaluate(() => document.getElementById('askScr').classList.contains('hidden')), 'görüş dürtmesi ikinci kez çıktı');
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ s1: s1.gain, s2: s2.gain, s3: s3.gain, s4: s4.gain, amt }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: görüş hediyesi testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
