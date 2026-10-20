/* v2.16 — Liman Gazetesi özel sayı (GAZETE_TASARIM.md §8):
   1) 1. gün biter → 2. gün sabahı gazeteci gelir, gazete yere düşer, üstüne gelince açılır; manşette gerçek müşteri sayısı; kuyruk boşalır
   2) gün içi dönüm noktası (2. bölge): gazeteci 4–8 sn içinde gelir
   3) Haşmet limandayken gelmez, gidince gelir
   4) alınmayan gazete gün kartından ÖNCE açılır, kapanınca gün kartı gelir
   5) kayıt/yükleme (got/st korunur); eski kayıtta geçilmişler "kaçırıldı", gazete gelmez
   6) arşiv sekmesi: satırlar, OKU yeniden açar, kaçırılan okunamaz
   7) PAYLAŞ: 1080×1920 görsel; paylaşım yoksa indirme yolu hata vermez
   8) Şeref Panosu: çerçeve sayısı alınan sayı kadar, layoutClashes yeni çakışma yok
   Kullanım: URL=http://localhost:8104/index.html node test-gazete.js [görüntü klasörü] */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SHOT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true });
  await ctx.addInitScript(() => { window.HK_GZ_OFF = 0; });           /* test-offline kapatıyor: bu test açar */
  const p = await ctx.newPage();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
  const shot = async n => { if (SHOT) await p.screenshot({ path: SHOT + '/' + n }); };
  const waitFor = async (fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn, arg)) return (Date.now() - t0) / 1000; await sleep(100); } return -1; };
  const hideOv = () => p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); BT.closeOverlays(); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  await p.evaluate(() => { BT.S.tut = 99; BT.S.ctrl = 2; BT.S.cash = 90000; BT.S.rep = 2000; BT.day.t = 10; BT.player.x = 4.5; BT.player.y = 3.2; });
  await hideOv(); await sleep(300);

  /* ---- 2) gün içi: 2. bölge açılır (gerçek ALAN düğmesi) → 4–8 sn içinde gazeteci ---- */
  await p.click('.dtab[data-t="area"]'); await sleep(250);
  await p.click('#dpCards .buy'); await sleep(150); await p.click('#dpCards .buy'); await sleep(150);
  await p.evaluate(() => { const g = document.getElementById('stallGo'); if (g && !document.getElementById('stallScr').classList.contains('hidden')) g.click(); });   /* yeni tezgâh kararı */
  await hideOv(); await p.click('#dpClose').catch(() => {});
  await p.evaluate(() => { BT.player.x = 7.6; BT.player.y = 4.4; });   /* yol kadrajda */
  const tMark = Date.now();
  R.pazarMark = await p.evaluate(() => ({ q: BT.gz.st().q.slice(), got: BT.gz.st().got.pazar, open: !BT.areas[1].locked, hl: BT.gz.hl('pazar', 'tr') }));
  ok(R.pazarMark.open && R.pazarMark.q.join() === 'pazar' && R.pazarMark.got === 1, '2: Balık Pazarı işaretlenmedi ' + JSON.stringify(R.pazarMark));
  await waitFor(() => BT.gz.boy().on, 12000);
  R.pazarT = (Date.now() - tMark) / 1000;
  R.pazarBoy = await p.evaluate(() => ({ on: BT.gz.boy().on, morn: BT.gz.boy().morn, id: BT.gz.boy().id }));
  ok(R.pazarBoy.on && !R.pazarBoy.morn && R.pazarT >= 3.8 && R.pazarT <= 8.8, '2: gazeteci 4–8 sn içinde gelmedi ' + R.pazarT + ' ' + JSON.stringify(R.pazarBoy));
  /* koşarken: yolda (görüntü) */
  let shotRun = false;
  for (let i = 0; i < 120 && !(await p.evaluate(() => !!BT.gz.drop())); i++) {
    if (!shotRun && await p.evaluate(() => { const g = BT.gz.boy(), pl = BT.player; return g.on && g.ph === 'in' && ((g.x > 10.4 && g.y < pl.y + 8 && g.t % 6 < 3.2) || (g.x <= 10.4 && g.t > 1)); })) { shotRun = true; await shot('gazeteci-yolda.png'); }
    await sleep(150);
  }
  R.pazarDrop = await p.evaluate(() => { const d = BT.gz.drop(), pl = BT.player; return d ? { id: d.id, dist: +Math.hypot(d.x - pl.x, d.y - pl.y).toFixed(2), stand: BT.canStand(d.x, d.y) } : null; });
  ok(R.pazarDrop && R.pazarDrop.id === 'pazar' && R.pazarDrop.dist >= 0.95 && R.pazarDrop.dist <= 2.2 && R.pazarDrop.stand, '2: gazete oyuncunun yanına düşmedi ' + JSON.stringify(R.pazarDrop));
  await sleep(700); await shot('gazete-yerde.png');
  await p.evaluate(() => { const d = BT.gz.drop(); BT.player.x = d.x; BT.player.y = d.y; });
  ok(await waitFor(() => BT.gz.intro().on, 3000) >= 0, '2: üstüne gelince gazete açılmadı');
  await p.click('#introSkip'); await sleep(300);
  R.pazarRead = await p.evaluate(() => ({ q: BT.gz.st().q.slice(), last: BT.gz.st().last, frames: BT.gz.frames(), intro: BT.gz.intro().on }));
  ok(!R.pazarRead.intro && !R.pazarRead.q.length && R.pazarRead.last === 1 && R.pazarRead.frames === 1, '2: okununca kuyruk boşalmadı ' + JSON.stringify(R.pazarRead));

  /* ---- 3) Haşmet limandayken gelmez ---- (aynı gün ikinci sayı zaten yarına kalır: bu sınama için "yeni gün" sayılır) */
  await p.evaluate(() => { BT.gz.st().last = 0; BT.player.x = 4.5; BT.player.y = 3.2; BT.tax.start(); BT.gz.hireMgr(0, BT.mgrCands(0)[0]); });
  R.mgrMark = await p.evaluate(() => ({ q: BT.gz.st().q.slice(), m: BT.gz.st().st.mudur && BT.gz.st().st.mudur.m, hl: BT.gz.hl('mudur', 'tr'), tax: BT.tax.st().on }));
  ok(R.mgrMark.tax && R.mgrMark.q.join() === 'mudur' && R.mgrMark.m && R.mgrMark.hl.indexOf(R.mgrMark.m.toLocaleUpperCase('tr-TR')) > 0, '3: müdür sayısı işaretlenmedi ' + JSON.stringify(R.mgrMark));
  await sleep(10000);
  R.hasmetBlock = await p.evaluate(() => ({ boy: BT.gz.boy().on, tax: BT.tax.st().on }));
  ok(!R.hasmetBlock.boy && R.hasmetBlock.tax, '3: Haşmet limandayken gazeteci geldi ' + JSON.stringify(R.hasmetBlock));
  await p.evaluate(() => { BT.tax.st().on = false; });
  R.afterTax = await waitFor(() => BT.gz.boy().on, 12000);
  ok(R.afterTax >= 3.5 && R.afterTax <= 9.5, '3: Haşmet gidince gazeteci 4–8 sn içinde gelmedi ' + R.afterTax);

  /* ---- 4) alınmazsa gün kartından önce açılır ---- */
  await waitFor(() => !!BT.gz.drop(), 25000);
  await p.evaluate(() => { BT.S.served = 7; const d = BT.gz.drop(); BT.player.x = d.x > 6 ? 2.5 : 7.5; BT.player.y = 4.2; BT.endDay(); });
  await waitFor(() => BT.day.phase === 'closing', 3000); await p.evaluate(() => { BT.day.ph = 60; });   /* kapanışı bekletme (özel müşteri) */
  R.endOpen = await waitFor(() => BT.gz.intro().on || !document.getElementById('dayScr').classList.contains('hidden'), 40000);
  R.endState = await p.evaluate(() => ({ intro: BT.gz.intro().on, id: BT.gz.intro().id, day: !document.getElementById('dayScr').classList.contains('hidden'), q: BT.gz.st().q.slice(), ilk: BT.gz.st().got.ilkgun }));
  ok(R.endState.intro && R.endState.id === 'mudur' && !R.endState.day, '4: alınmayan gazete gün kartından önce açılmadı ' + JSON.stringify(R.endState));
  ok(R.endState.q.join() === 'ilkgun' && R.endState.ilk === 1, '1: ilk gün sayısı gün sonunda kuyruğa girmedi ' + JSON.stringify(R.endState));
  await p.click('#introSkip'); await sleep(400);
  R.cardAfter = await p.evaluate(() => !document.getElementById('dayScr').classList.contains('hidden'));
  ok(R.cardAfter, '4: gazete kapanınca gün kartı gelmedi');

  /* ---- 1) 2. gün sabahı gazeteci (sabah gazetesi) ---- */
  await p.click('#dayGo'); await sleep(300);
  await p.evaluate(() => { const pg = document.getElementById('prepGo'); if (pg && !document.getElementById('prepScr').classList.contains('hidden')) pg.click(); });
  await hideOv(); await p.evaluate(() => { BT.player.x = 4.5; BT.player.y = 3.2; });
  R.mornT = await waitFor(() => BT.gz.boy().on, 15000);
  R.morn = await p.evaluate(() => ({ day: BT.day.n, boy: BT.gz.boy().on, morn: BT.gz.boy().morn, id: BT.gz.boy().id }));
  ok(R.morn.day === 2 && R.morn.boy && R.morn.morn && R.morn.id === 'ilkgun', '1: 2. gün sabahı gazeteci gelmedi ' + JSON.stringify(R.morn));
  ok(await waitFor(() => !!BT.gz.drop(), 25000) >= 0, '1: gazete yere düşmedi');
  await p.evaluate(() => { const d = BT.gz.drop(); BT.player.x = d.x; BT.player.y = d.y; });
  ok(await waitFor(() => BT.gz.intro().on, 3000) >= 0, '1: gazete açılmadı');
  R.ilk = await p.evaluate(() => ({ hl: BT.gz.intro().list[0].hl.tr, date: BT.gz.intro().list[0].date.tr, art: BT.gz.intro().list[0].art, served: 7 }));
  ok(/İLK GÜN 7 MÜŞTERİ/.test(R.ilk.hl) && R.ilk.date === '1. GÜN' && R.ilk.art === 'snap', '1: manşette gerçek müşteri sayısı yok ' + JSON.stringify(R.ilk));
  await sleep(4200);
  R.shareVis = await p.evaluate(() => !document.getElementById('introShare').classList.contains('hidden'));
  ok(R.shareVis, '7: özel sayıda PAYLAŞ düğmesi yok');
  await shot('ozel-sayi.png');
  await p.click('#introSkip'); await sleep(300);
  R.ilkRead = await p.evaluate(() => ({ q: BT.gz.st().q.slice(), last: BT.gz.st().last, intro: BT.gz.intro().on, share: !document.getElementById('introShare').classList.contains('hidden') }));
  ok(!R.ilkRead.q.length && R.ilkRead.last === 2 && !R.ilkRead.intro && !R.ilkRead.share, '1: kapanınca kuyruk boşalmadı ' + JSON.stringify(R.ilkRead));

  /* vergi sayısı: ilk ziyaret kapanınca (aynı gün → yarına kalır, gazeteci gelmez) */
  await p.evaluate(() => { const q = BT.tax.q(); q.items = 12; q.due = 140; BT.S.cash = 5000; BT.tax.collect(); });
  R.tax = await p.evaluate(() => ({ q: BT.gz.st().q.slice(), st: BT.gz.st().st.hasmet, hl: BT.gz.hl('hasmet', 'tr') }));
  ok(R.tax.q.join() === 'hasmet' && R.tax.st && R.tax.st.v === 140 && /İLK VERGİSİNİ ÖDEDİ \(\$140\)/.test(R.tax.hl), 'vergi sayısı yanlış ' + JSON.stringify(R.tax));
  await sleep(9000);
  ok(!(await p.evaluate(() => BT.gz.boy().on)), 'aynı gün ikinci özel sayı geldi (günde en çok bir)');

  /* ---- 5) kayıt / yükleme ---- */
  R.save = await p.evaluate(() => {
    const d = BT.buildSave(), j = JSON.parse(JSON.stringify(d));
    BT.loadFrom(j);
    const g = BT.gz.st();
    return { got: g.got, st: { n: g.st.ilkgun && g.st.ilkgun.n, m: g.st.mudur && g.st.mudur.m, v: g.st.hasmet && g.st.hasmet.v }, q: g.q, last: g.last, photo: !!localStorage.getItem(BT.gz.key('ilkgun', 1)), raw: JSON.stringify(d.gz).length };
  });
  ok(R.save.got.ilkgun === 1 && R.save.got.pazar === 1 && R.save.got.mudur === 1 && R.save.got.hasmet === 2 && R.save.st.n === 7 && R.save.st.v === 140 && R.save.st.m && R.save.q.join() === 'hasmet' && R.save.last === 2 && R.save.photo,
    '5: kayıt/yükleme got/st korumadı ' + JSON.stringify(R.save));
  R.old = await p.evaluate(() => {
    const d = BT.buildSave(); window.__gzKeep = JSON.stringify(d);
    delete d.gz; BT.loadFrom(d); BT.gz.mark('pazar', { n: 1 });
    const g = BT.gz.st();
    return { miss: Object.keys(g.miss).sort().join(), got: Object.keys(g.got).length, q: g.q.length, frames: BT.gz.frames() };
  });
  ok(R.old.miss === 'hasmet,ilkgun,mudur,pazar' && R.old.got === 0 && R.old.q === 0 && R.old.frames === 0, '5: eski kayıtta "kaçırıldı" işaretlenmedi ' + JSON.stringify(R.old));
  await p.evaluate(() => { BT.gz.st().last = 0; });
  await sleep(6000);
  ok(!(await p.evaluate(() => BT.gz.boy().on || !!BT.gz.drop())), '5: eski kayıtta gazete geldi');
  /* ---- 6a) arşiv: kaçırılanlar ---- */
  await p.click('#menuBtn'); await sleep(250); await p.click('#menuTabs .tab[data-t="gazete"]'); await sleep(250);
  R.archOld = await p.evaluate(() => [...document.querySelectorAll('#tabBody .gzrow')].map(r => r.className.replace('row gzrow ', '') + ':' + (r.querySelector('.gzread') ? 'R' : '-') + ':' + r.querySelector('.tx b').textContent));
  ok(R.archOld.length === 5 && R.archOld[0].startsWith('ok:R') && R.archOld.slice(1).every(s => /^miss:-:Bu sayı kaçırıldı/.test(s)), '6: kaçırılan satırlar yanlış ' + JSON.stringify(R.archOld));
  await p.click('#closeMenu'); await sleep(200);
  await p.evaluate(() => { BT.loadFrom(JSON.parse(window.__gzKeep)); });

  /* ---- 6b) arşiv: satırlar, OKU ---- */
  await p.click('#menuBtn'); await sleep(250); await p.click('#menuTabs .tab[data-t="gazete"]'); await sleep(300);
  R.arch = await p.evaluate(() => ({ rows: [...document.querySelectorAll('#tabBody .gzrow')].map(r => r.dataset.g + ':' + r.className.replace('row gzrow ', '') + ':' + (r.querySelector('.gzread') ? 'R' : '-') + (r.querySelector('.gzshare') ? 'S' : '-')),
    head: document.querySelector('#tabBody .gzHead').textContent, lbl: document.querySelector('#menuTabs .tab[data-t="gazete"]').textContent,
    clipped: [...document.querySelectorAll('#menuTabs .tab')].some(t => t.scrollWidth > t.clientWidth + 1) }));
  ok(R.arch.rows.join() === 'acilis:ok:RS,ilkgun:ok:RS,pazar:ok:RS,hasmet:lock:--,mudur:ok:RS' && R.arch.lbl === 'GAZETELER' && /3\/5/.test(R.arch.head) && !R.arch.clipped, '6: arşiv satırları yanlış ' + JSON.stringify(R.arch));
  await shot('arsiv.png');
  await p.click('#tabBody .gzread[data-g="ilkgun"]'); await sleep(400);
  R.reread = await p.evaluate(() => ({ on: BT.gz.intro().on, id: BT.gz.intro().id, menu: !document.getElementById('menuScreen').classList.contains('hidden'), hl: BT.gz.intro().list[0].hl.tr, share: !document.getElementById('introShare').classList.contains('hidden') }));
  ok(R.reread.on && R.reread.id === 'ilkgun' && !R.reread.menu && /7 MÜŞTERİ/.test(R.reread.hl) && R.reread.share, '6: OKU yeniden açmadı ' + JSON.stringify(R.reread));
  await p.click('#introSkip'); await sleep(300);
  R.back = await p.evaluate(() => ({ menu: !document.getElementById('menuScreen').classList.contains('hidden'), paused: BT.paused() }));
  ok(R.back.menu && R.back.paused, '6: gazete kapanınca menüye dönülmedi ' + JSON.stringify(R.back));
  await p.click('#tabBody .gzread[data-g="acilis"]'); await sleep(300);
  R.acilis = await p.evaluate(() => ({ on: BT.gz.intro().on, n: BT.gz.intro().list.length }));
  ok(R.acilis.on && R.acilis.n === 5, '6: açılış gazetesi açılmadı ' + JSON.stringify(R.acilis));
  await p.click('#introSkip'); await sleep(300);
  /* Bölüm 1 sonu (S.ch1): arşivde satır, iki sayfa */
  await p.evaluate(() => { BT.S.ch1 = true; document.querySelector('#menuTabs .tab[data-t="gazete"]').click(); }); await sleep(250);
  await p.click('#tabBody .gzread[data-g="bolum1"]'); await sleep(300);
  R.ch1 = await p.evaluate(() => ({ on: BT.gz.intro().on, n: BT.gz.intro().list.length, frames: BT.gz.frames() }));
  ok(R.ch1.on && R.ch1.n === 2 && R.ch1.frames === 4, '6: Bölüm 1 sonu arşivden açılmadı ' + JSON.stringify(R.ch1));
  await p.click('#introSkip'); await sleep(300);
  await p.evaluate(() => { BT.S.ch1 = false; document.querySelector('#menuTabs .tab[data-t="gazete"]').click(); }); await sleep(200);
  /* EN */
  await p.evaluate(() => BT.setLang('en')); await sleep(150);
  R.en = await p.evaluate(() => ({ lbl: document.querySelector('#menuTabs .tab[data-t="gazete"]').textContent, awards: document.querySelector('#menuTabs .tab[data-t="basarim"]').textContent, hl: BT.gz.hl('ilkgun', 'en'), read: (document.querySelector('#tabBody .gzread') || {}).textContent }));
  ok(R.en.lbl === 'NEWSPAPERS' && R.en.awards === 'AWARDS' && /7 CUSTOMERS ON DAY ONE/.test(R.en.hl) && R.en.read === 'READ', '6: İngilizce metin yok ' + JSON.stringify(R.en));
  await p.evaluate(() => BT.setLang('tr')); await sleep(150);

  /* ---- 7) PAYLAŞ ---- */
  R.img = await p.evaluate(async () => {
    const u = await BT.gz.shareImg('ilkgun');
    const im = new Image(); await new Promise(r => { im.onload = r; im.src = u; });
    window.__gzImg = u; return { w: im.width, h: im.height, kb: Math.round(u.length / 1024) };
  });
  ok(R.img.w === 1080 && R.img.h === 1920 && R.img.kb > 40, '7: paylaşım görseli 1080×1920 değil ' + JSON.stringify(R.img));
  if (SHOT) { const u = await p.evaluate(() => window.__gzImg); fs.writeFileSync(SHOT + '/paylasim-1080x1920.png', Buffer.from(u.split(',')[1], 'base64')); }
  await p.evaluate(() => { try { delete Navigator.prototype.share; delete Navigator.prototype.canShare; } catch (e) { } });
  const dlP = p.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await p.click('#tabBody .gzshare[data-g="pazar"]');
  const dl = await dlP;
  R.dl = dl ? dl.suggestedFilename() : null;
  ok(R.dl === 'hamsi-koyu-pazar.png', '7: paylaşım yokken indirme olmadı ' + R.dl);
  R.share = await p.evaluate(() => BT.gz.share('mudur'));
  ok(R.share === 'download', '7: paylaşım yolu ' + R.share);
  await p.click('#closeMenu'); await sleep(200);

  /* ---- 8) Şeref Panosu ---- */
  R.pano = await p.evaluate(() => ({ frames: BT.gz.frames(), have: ['ilkgun', 'pazar', 'hasmet', 'mudur', 'bolum1'].filter(BT.gz.have).length, clash: BT.layoutClashes(0.1),
    inMeydan: BT.gz.FAME.x > 24 && BT.gz.FAME.x < 25.5 && BT.gz.FAME.y > 11 && BT.gz.FAME.y < 13 && !BT.canStand(BT.gz.FAME.x, BT.gz.FAME.y) }));   /* Hizmet Sahası'nın doğusu, kumsal (ekranda hiçbir yapıyla örtüşmeyen açık köşe) */
  ok(R.pano.frames === 3 && R.pano.have === 3 && !R.pano.clash.length && R.pano.inMeydan, '8: pano çerçeveleri / yerleşim yanlış ' + JSON.stringify(R.pano));
  await p.evaluate(() => { BT.player.x = BT.gz.FAME.x - 1.4; BT.player.y = BT.gz.FAME.y + 0.4; BT.day.t = BT.DAY_LEN * 0.45; });
  await sleep(2200); await shot('seref-panosu.png');

  await b.close();
  console.log(JSON.stringify({ R, errs }, null, 1));
  console.log(fail.length || errs.length ? 'GAZETE_FAIL ' + JSON.stringify(fail) : 'GAZETE_OK');
  process.exit(fail.length || errs.length ? 1 : 0);
})();
