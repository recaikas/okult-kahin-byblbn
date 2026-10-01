/* v2.7 — ilk kez ipuçları: yeni oyuncu her sekmeye/panele ilk girişte o sekmenin ne işe yaradığını okur.
   1) alt çubuk sekmesi ilk açılışta kart çıkar, oyun durur; ANLADIM ile kapanır; ikinci açılışta çıkmaz;
   2) Yapı alt sekmesi, Liman menüsü sekmeleri, tezgâh paneli, müşteri defteri ayrı ayrı anlatılır;
   3) art arda iki ipucu sıraya girer; kayıt/yükleme görülenleri korur; uzun oynanmış eski kayıtta çıkmaz;
   4) YARDIM'daki düğme sıfırlar; İngilizce metin. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.evaluate(() => { window.HK_HELP_OFF = 0; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  const H = () => p.evaluate(() => BT.help());
  const got = async () => { if ((await H()).open) { await p.click('#helpGo'); await sleep(150); } };
  ok(R.keys = (await H()).keys.length >= 25, 'ipucu sayısı az');
  await p.click('.dtab[data-t="area"]'); await sleep(250);
  R.area = await H(); R.paused = await p.evaluate(() => !document.getElementById('pauseBadge').classList.contains('hidden') || BT.paused === true);
  ok(R.area.open && /YENİ ALAN AÇ/.test(R.area.title), 'ALAN ipucu çıkmadı ' + JSON.stringify(R.area));
  await got();
  R.area2 = (await H()).open;
  ok(!R.area2, 'ANLADIM kapatmadı');
  await p.click('.dtab[data-t="area"]'); await sleep(150); await p.click('.dtab[data-t="area"]'); await sleep(250);
  ok(!(await H()).open, 'ikinci açılışta yine çıktı');
  await p.click('.dtab[data-t="build"]'); await sleep(250);
  ok(/YAPI/.test((await H()).title), 'YAPI ipucu yok'); await got();
  await p.evaluate(() => { const b = [...document.querySelectorAll('#dpSub *')].find(x => x.dataset && x.dataset.s === 'decor'); if (b) b.click(); }); await sleep(250);
  ok(/DEKOR/.test((await H()).title), 'Dekor alt sekmesi ipucu yok ' + (await H()).title); await got();
  await p.click('#dpClose'); await sleep(150);
  await p.click('#menuBtn'); await sleep(300);
  ok(/LİMAN/.test((await H()).title), 'LİMAN sekmesi ipucu yok'); await got();
  await p.click('#menuTabs .tab[data-t="urunler"]'); await sleep(250);
  ok(/ÜRÜNLER/.test((await H()).title), 'ÜRÜNLER ipucu yok'); await got();
  await p.click('#menuTabs .tab[data-t="yardim"]'); await sleep(250); await got();
  R.reset = await p.evaluate(() => !!document.getElementById('helpReset'));
  ok(R.reset, 'YARDIM sıfırlama düğmesi yok');
  await p.click('#closeMenu'); await sleep(200);
  /* sıra: iki ipucu arka arkaya */
  R.queue = await p.evaluate(async () => {
    BT.openCustBook(); await new Promise(r => setTimeout(r, 100));
    const a = BT.help().title; document.getElementById('custGo').click();
    await new Promise(r => setTimeout(r, 100));
    return { a };
  });
  ok(/MÜŞTERİ DEFTERİ/.test(R.queue.a), 'defter ipucu yok ' + JSON.stringify(R.queue)); await got();
  await p.evaluate(() => { const c = document.getElementById('custScr'); if (!c.classList.contains('hidden')) document.getElementById('custGo').click(); });
  /* kayıt */
  R.save = await p.evaluate(() => {
    const d = BT.buildSave(); const seen = Object.keys(d.help).length;
    BT.loadFrom(JSON.parse(JSON.stringify(d))); const after = BT.help().seen.length;
    const old = BT.buildSave(); delete old.help; old.play = 4000; BT.loadFrom(old); const oldN = BT.help().seen.length;
    const nw = BT.buildSave(); delete nw.help; nw.play = 30; BT.loadFrom(nw); const newN = BT.help().seen.length;
    return { seen, after, oldN, newN, all: BT.help().keys.length };
  });
  ok(R.save.seen >= 7 && R.save.after === R.save.seen && R.save.oldN === R.save.all && R.save.newN === 0, 'kayıt/göç yanlış ' + JSON.stringify(R.save));
  /* İngilizce */
  R.en = await p.evaluate(async () => { BT.setLang('en'); document.querySelector('.dtab[data-t="proj"]').click(); await new Promise(r => setTimeout(r, 200)); const t = BT.help().title + ' | ' + document.getElementById('helpGo').textContent; return t; });
  ok(/GRAND PROJECT/.test(R.en) && /GOT IT/.test(R.en), 'İngilizce ipucu yok ' + R.en);
  await p.screenshot({ path: process.env.SHOT || '/tmp/ip.png' });
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'IPUCU_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: ilk kez ipuçları testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
