/* v2.1 — müzik motoru ve ambiyans:
   1) ölçü uzunluğu parçaya göre: Ege Zeybeği 9 sekizlik, Ağ Çekme Türküsü 6, diğerleri 8;
   2) oyun modunda (mırıldanma) her parçanın imza tınısı çalar (kemençe, saz, akordeon, bağlama…);
   3) yoğun saatte davul + zil katmanı girer, sakin saatte girmez;
   4) deniz yatağı oyunda açık, duraklatınca ve menüde kapalı;
   5) "Oyunu bitir" jeneriği Gün Batımı Arabeski. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(1500);

  R.bars = await p.evaluate(async () => {
    const out = {};
    for (const [i, id] of [[6, 'zeybek'], [8, 'shanty'], [7, 'ciftetelli']]) {
      BT.songAt(i); let mx = 0; const t0 = Date.now();
      while (Date.now() - t0 < 4500) { await new Promise(r => setTimeout(r, 40)); mx = Math.max(mx, BT.music().st); }
      out[id] = { song: BT.music().song, maxSt: mx };
    }
    return out;
  });
  ok(R.bars.zeybek.song === 'zeybek' && R.bars.zeybek.maxSt === 8, 'zeybek 9/8 değil ' + JSON.stringify(R.bars));
  ok(R.bars.shanty.song === 'shanty' && R.bars.shanty.maxSt === 5, 'türkü 6/8 değil ' + JSON.stringify(R.bars));
  ok(R.bars.ciftetelli.maxSt === 7, 'çiftetelli 4/4 değil ' + JSON.stringify(R.bars));

  R.sig = await p.evaluate(async () => {
    const want = { 3: 'saz', 4: 'kemence', 5: 'akordeon', 6: 'baglama', 7: 'klarnet', 8: 'koro', 9: 'yayli', 1: 'ud' }, got = {};
    for (const i of Object.keys(want)) {
      BT.songAt(+i); const n0 = BT.music().sigN;
      await new Promise(r => setTimeout(r, 2500));
      got[i] = [BT.music().sigLast, BT.music().sigN - n0, BT.music().mode];
    }
    return { want, got };
  });
  for (const i of Object.keys(R.sig.want)) ok(R.sig.got[i][0] === R.sig.want[i] && R.sig.got[i][1] > 0 && R.sig.got[i][2] === 'game', 'oyun modunda imza tını yok: parça ' + i + ' ' + JSON.stringify(R.sig.got[i]));

  R.rush = await p.evaluate(async () => {
    const D = BT.day; BT.songAt(0);
    D.t = BT.DAY_LEN * 0.30; const a0 = BT.music().rushN; await new Promise(r => setTimeout(r, 3000)); const calm = BT.music().rushN - a0;
    D.t = BT.DAY_LEN * 0.50; const b0 = BT.music().rushN; await new Promise(r => setTimeout(r, 3000)); const rush = BT.music().rushN - b0;
    return { calm, rush, rushNow: BT.rushNow() };
  });
  ok(R.rush.calm === 0 && R.rush.rush > 5, 'yoğun saat katmanı yanlış ' + JSON.stringify(R.rush));

  R.sea = await p.evaluate(async () => {
    const on = BT.music().sea;
    BT.ui.openPauseMenu && BT.ui.openPauseMenu(); await new Promise(r => setTimeout(r, 400));
    const pz = BT.paused(), off = BT.music().sea;
    return { on, pz, off };
  });
  ok(R.sea.on === true, 'oyunda deniz yatağı çalmıyor ' + JSON.stringify(R.sea));
  ok(!R.sea.pz || R.sea.off === false, 'duraklatınca deniz yatağı susmadı ' + JSON.stringify(R.sea));

  R.credits = await p.evaluate(() => BT.SONGS[9].id);
  ok(R.credits === 'arabesk', 'jenerik parçası yanlış');
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R).slice(0, 1400));
  console.log(fail.length ? 'V21_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: v2.1 müzik testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
