/* v2.17 — Dekor Düzenleme Modu (DUZENLE_TASARIM.md)
   1) DÜZENLE açılınca oyun durur (alt çubuk gizli, şerit görünür), BİTTİ ile devam eder;
   2) bank fareyle sürüklenip geçerli bir kum noktasına yerleşir (sürüklerken yeşil);
   3) kayıt/yükleme (sayfa yenilenir) sonrası bank yeni yerindedir;
   4) iskeleye, yola ya da bir binanın üstüne sürüklenen süs kırmızı görünür ve eski yerine döner;
   5) SANDIĞA KALDIR süsü kaldırır (çizilmez), SÜS SANDIĞI'ndan geri konur;
   6) giftDecor sandığa ekler, hediye süsü mağazada satılmaz, Bölüm hedefine sayılmaz;
   7) yerleştirmeden sonra layoutClashes yeni çakışma göstermez;
   8) eski kayıt (dpos/dbox yok) yüklenir, süsler varsayılan yerindedir; bozuk konum varsayılana döner.
   Ekran görüntüleri: SC_DIR (varsayılan screenshots/duzenle). */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SC = (process.env.SC_DIR || __dirname + '/screenshots/duzenle') + '/';
fs.mkdirSync(SC, { recursive: true });
const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  /* birkaç süs alınmış, eğitim bitmiş bir liman */
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.tut = 99; S.cash = 50000;
    ['bank', 'bayrak', 'nazar', 'simit'].forEach(id => BT.decorById(id).got = true);
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (s && !s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 300);
  });
  await sleep(400);
  R.clash0 = await p.evaluate(() => BT.layoutClashes(0.1));
  const bank = () => p.evaluate(() => { const d = BT.decorById('bank'); return { x: d.x, y: d.y, hx: d.hx, hy: d.hy, box: d.box }; });
  const vis = sel => p.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && !e.classList.contains('hidden'); }, sel);

  /* ---- 1) YAPI › Dekor › ✥ DÜZENLE ---- */
  await p.click('.dtab[data-t="build"]'); await sleep(200);
  await p.evaluate(() => { const b = document.querySelector('#dpSub button[data-s="decor"]'); b.click(); }); await sleep(200);
  R.card = await p.evaluate(() => { const c = document.querySelector('#dpCards .dcard'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  ok(/DÜZENLE/.test(R.card), 'Dekor sekmesinin başında DÜZENLE kartı yok: ' + R.card);
  await p.click('#dpCards .dcard .buy'); await sleep(300);
  const play0 = await p.evaluate(() => BT.S.play); await sleep(600);
  R.open = await p.evaluate(() => ({ st: BT.arr.st(), paused: BT.paused(), play: BT.S.play }));
  R.ui = { top: await vis('#arrTop'), bot: await vis('#arrBot'), devbar: await vis('#devbar'), hud: await vis('#hud'), badge: await vis('#pauseBadge'),
    hint: await p.textContent('#arrTop'), done: await p.evaluate(() => document.getElementById('arrDone').getBoundingClientRect().height) };
  ok(R.open.st.on && R.open.paused, 'düzenle modu açılınca oyun durmadı ' + JSON.stringify(R.open));
  ok(R.open.play === play0, 'düzenle modunda oyun süresi akıyor');
  ok(R.ui.top && R.ui.bot && !R.ui.devbar && !R.ui.hud && !R.ui.badge, 'şerit / alt çubuk görünürlüğü yanlış ' + JSON.stringify(R.ui));
  ok(/Süsü sürükle/.test(R.ui.hint) && /BİTTİ/.test(R.ui.hint), 'şerit metni yanlış: ' + R.ui.hint);
  ok(R.ui.done >= 44, 'BİTTİ düğmesi 44px altında');

  /* ---- 2) bankı fareyle geçerli bir kum noktasına sürükle ---- */
  const noToast = () => p.evaluate(() => document.getElementById('toast').classList.remove('on'));
  await p.evaluate(() => BT.arr.look(16.2, 4.6)); await noToast(); await sleep(350);
  await p.screenshot({ path: SC + 'duzenle-acik.png' });
  await p.evaluate(() => BT.arr.look(16.5, 9)); await sleep(150);
  R.cells = (await p.evaluate(() => BT.arr.st().cells));
  ok(R.cells > 150, 'geçerli alan çok küçük: ' + R.cells);
  const tgt = await p.evaluate(() => {
    const m = BT.arr.mask(), M = BT.MEYDAN, Y = BT.SERVYARD, d = BT.decorById('bank'), out = [];
    for (let i = 0; i < m.length; i += 2) {
      const x = m[i], y = m[i + 1];
      if (x > M.x0 && x < M.x1 && y > M.y0 && y < M.y1) continue;          /* kum: meydan ve saha dışında */
      if (x > Y.x0 && x < Y.x1 && y > Y.y0 && y < Y.y1) continue;
      if (!BT.arr.ok('bank', x, y) || Math.hypot(x - d.x, y - d.y) < 2) continue;
      const c = BT.arr.css(x, y); if (c[0] < 50 || c[0] > 340 || c[1] < 140 || c[1] > 700) continue;
      out.push({ x, y, cx: c[0], cy: c[1], d: Math.hypot(x - 16.25, y - 11.25) });
    }
    out.sort((a, b) => a.d - b.d); return out[0] || null;
  });
  ok(!!tgt, 'ekranda bank için geçerli kum noktası yok');
  async function drag(from, to, shot) {
    await p.mouse.move(from[0], from[1] - 6); await p.mouse.down();
    const n = 8; for (let k = 1; k <= n; k++) { await p.mouse.move(from[0] + (to[0] - from[0]) * k / n, from[1] - 6 + (to[1] - from[1]) * k / n); await sleep(30); }
    await sleep(120);
    const mid = await p.evaluate(() => BT.arr.st().drag);
    if (shot) { await noToast(); await sleep(300); }
    if (shot) await p.screenshot({ path: SC + shot });
    await p.mouse.up(); await sleep(150);
    return mid;
  }
  const bcss = () => p.evaluate(() => { const d = BT.decorById('bank'); return BT.arr.css(d.x, d.y); });
  if (tgt) {
    R.dragOK = await drag(await bcss(), [tgt.cx, tgt.cy], 'surukle-yesil.png');
    R.bank2 = await bank();
    ok(R.dragOK && R.dragOK.moved && R.dragOK.ok === true, 'geçerli yerde ayak izi yeşil değil ' + JSON.stringify(R.dragOK));
    ok(R.bank2.x === tgt.x && R.bank2.y === tgt.y, 'bank yerleşmedi ' + JSON.stringify({ tgt, b: R.bank2 }));
    ok(!R.bank2.box, 'bank sandıkta');
  }
  /* boş zemini sürüklemek kamerayı kaydırır */
  const cam0 = await p.evaluate(() => BT.cam());
  await p.mouse.move(200, 300); await p.mouse.down(); await p.mouse.move(150, 330, { steps: 5 }); await p.mouse.up(); await sleep(100);
  const cam1 = await p.evaluate(() => BT.cam());
  ok(Math.abs(cam1.x - cam0.x) > 5, 'boş zemin sürüklemesi kamerayı kaydırmadı');
  ok((await bank()).x === R.bank2.x, 'kamera kaydırma süsü oynattı');

  /* ---- 4) iskele / yol / bina: kırmızı, eski yerine döner ---- */
  await p.evaluate(() => { const d = BT.decorById('bank'); BT.arr.look(d.x - 2.2, d.y - 1.2); }); await sleep(150);
  const bad = await p.evaluate(() => {
    const d = BT.decorById('bank'), on = c => c[0] > 30 && c[0] < 360 && c[1] > 130 && c[1] < 720;
    const pick = (list, why) => { for (const q of list) { const x = BT.arr.snap(q[0]), y = BT.arr.snap(q[1]); const c = BT.arr.css(x, y); if (on(c) && BT.arr.why(x, y) === why) return { x, y, cx: c[0], cy: c[1], why }; } return null; };
    const pier = [], road = [], bld = [];
    for (let y = d.y - 6; y <= d.y + 4; y += 0.5) { for (let x = 6; x <= 9.5; x += 0.5) pier.push([x, y]); road.push([12.4, y], [11.4, y], [13.4, y]); }
    [BT.WHALL, BT.DEPOT, BT.HUT].concat(BT.PLOTS).forEach(o => bld.push([o.x, o.y]));
    return [pick(pier, 'iskele'), pick(road, 'yol'), pick(bld, 'nesne')];
  });
  R.bad = [];
  for (let i = 0; i < bad.length; i++) {
    const t = bad[i]; ok(!!t, 'kırmızı deneme noktası bulunamadı #' + i); if (!t) continue;
    const before = await bank();
    const mid = await drag(await bcss(), [t.cx, t.cy], i === 0 ? 'surukle-kirmizi.png' : null);
    const after = await bank();
    R.bad.push({ why: t.why, mid, back: after.x === before.x && after.y === before.y });
    ok(mid && mid.moved && mid.ok === false, t.why + ': ayak izi kırmızı değil ' + JSON.stringify(mid));
    ok(after.x === before.x && after.y === before.y, t.why + ': süs eski yerine dönmedi');
  }

  /* ---- 5) SANDIĞA KALDIR → SÜS SANDIĞI → KOY ---- */
  const bc = await bcss();
  await p.mouse.click(bc[0], bc[1] - 8); await sleep(150);
  R.sel = await p.evaluate(() => BT.arr.st().sel === BT.decor.indexOf(BT.decorById('bank')));
  ok(R.sel, 'dokunuş bankı seçmedi');
  ok(await vis('#arrBoxBtn'), 'SANDIĞA KALDIR düğmesi görünmüyor');
  R.boxBtnH = await p.evaluate(() => document.getElementById('arrBoxBtn').getBoundingClientRect().height);
  ok(R.boxBtnH >= 44, 'SANDIĞA KALDIR 44px altında');
  await p.click('#arrBoxBtn'); await sleep(150);
  R.boxed = await p.evaluate(() => ({ box: BT.decorById('bank').box, dbox: BT.S.dbox.slice(), n: document.getElementById('arrChestN').textContent }));
  ok(R.boxed.box && R.boxed.dbox.indexOf('bank') >= 0 && R.boxed.n === '1', 'sandığa kalkmadı ' + JSON.stringify(R.boxed));
  await p.evaluate(() => BT.giftDecor('ligbayrak')); await sleep(200);           /* 6) hediye de sandığa */
  await p.click('#arrChestBtn'); await sleep(250);
  R.list = await p.evaluate(() => [...document.querySelectorAll('#arrChestL .dcard')].map(c => c.innerText.replace(/\s+/g, ' ')));
  ok(R.list.length === 2 && R.list.some(t => /Bank/.test(t)) && R.list.some(t => /Lig Bayrağı/.test(t)), 'sandık listesi yanlış ' + JSON.stringify(R.list));
  ok((await p.textContent('#arrChestN')) === '2', 'sandık sayacı liste ile uyuşmuyor');
  await p.screenshot({ path: SC + 'sus-sandigi.png' });
  await p.evaluate(() => { const i = BT.decor.indexOf(BT.decorById('bank')); document.querySelector('#arrChestL button[data-d="' + i + '"]').click(); }); await sleep(200);
  R.back = await p.evaluate(() => { const d = BT.decorById('bank'); return { box: d.box, ok: BT.arr.ok('bank', d.x, d.y), x: d.x, y: d.y, dbox: BT.S.dbox.slice(), chest: BT.arr.st().chest }; });
  ok(!R.back.box && R.back.ok && R.back.dbox.indexOf('bank') < 0 && !R.back.chest, 'sandıktan geri konmadı ' + JSON.stringify(R.back));
  /* sandıktan gelen süs oradan sürüklenebilir: tgt noktasına geri götür */
  if (tgt) {
    await p.evaluate(() => BT.arr.look(16.5, 9)); await sleep(120);
    const tc = await p.evaluate(t => BT.arr.css(t.x, t.y), tgt);
    await drag(await bcss(), tc, null);
    R.bank5 = await bank();
    ok(R.bank5.x === tgt.x && R.bank5.y === tgt.y, 'sandıktan konan süs sürüklenemedi ' + JSON.stringify(R.bank5));
  }

  /* ---- 6) giftDecor ---- */
  R.gift = await p.evaluate(() => {
    const d = BT.decorById('ligbayrak'), shop = BT.PADS ? null : null;
    const ch = BT.chapter().g.find(g => /Süs/.test(g.t));
    return { got: d.got, box: d.box, inBox: BT.S.dbox.indexOf('ligbayrak') >= 0, pad: BT.pads.some(q => q.kind === 'decor' && BT.decor[q.decor].id === 'ligbayrak'), chN: ch && ch.n, nonGift: BT.decor.filter(q => !q.gift).length, toast: document.getElementById('toast').textContent };
  });
  ok(R.gift.got && R.gift.box && R.gift.inBox, 'giftDecor sandığa eklemedi ' + JSON.stringify(R.gift));
  ok(!R.gift.pad && R.gift.chN === R.gift.nonGift, 'hediye süsü mağazada / Bölüm hedefinde ' + JSON.stringify(R.gift));
  R.giftToast = await p.evaluate(() => BT.T('giftGot'));
  ok(/Hediye geldi/.test(R.giftToast), 'hediye bildirimi metni yok');

  /* ---- 7) çakışma yok ---- */
  R.clash1 = await p.evaluate(() => BT.layoutClashes(0.1));
  const newC = R.clash1.filter(c => R.clash0.indexOf(c) < 0);
  ok(newC.length === 0, 'yerleştirme yeni çakışma doğurdu: ' + newC.join(', '));

  /* ---- 1b) BİTTİ: kaydeder, oyun devam eder ---- */
  await p.click('#arrDone'); await sleep(300);
  const pl0 = await p.evaluate(() => BT.S.play); await sleep(500);
  R.closed = await p.evaluate(() => ({ on: BT.arr.st().on, paused: BT.paused(), play: BT.S.play }));
  ok(!R.closed.on && !R.closed.paused && R.closed.play > pl0, 'BİTTİ oyunu sürdürmedi ' + JSON.stringify(R.closed));
  ok(await vis('#devbar') && !(await vis('#arrTop')), 'BİTTİ sonrası arayüz geri gelmedi');
  R.saved = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('balikci_slot_1')); return { dpos: d.dpos, dbox: d.dbox }; });
  ok(R.saved.dpos && R.saved.dpos.bank && R.saved.dpos.bank[0] === tgt.x && R.saved.dpos.bank[1] === tgt.y, 'kayıtta bank konumu yok ' + JSON.stringify(R.saved));
  ok(Array.isArray(R.saved.dbox) && R.saved.dbox.indexOf('ligbayrak') >= 0, 'kayıtta sandık yok');

  /* ---- 3) sayfayı yenile, devam et: bank yeni yerinde ---- */
  await p.reload(); await sleep(900);
  await p.click('#playBtn'); await sleep(600);
  R.reload = await p.evaluate(() => { const d = BT.decorById('bank'), g = BT.decorById('ligbayrak'); return { x: d.x, y: d.y, got: d.got, gift: [g.got, g.box] }; });
  ok(tgt && R.reload.x === tgt.x && R.reload.y === tgt.y && R.reload.got, 'yükleme sonrası bank yeni yerinde değil ' + JSON.stringify(R.reload));
  ok(R.reload.gift[0] && R.reload.gift[1], 'yükleme sonrası hediye sandıkta değil');

  /* ---- 8) eski kayıt: dpos/dbox yok → varsayılan; bozuk konum → varsayılan ---- */
  R.old = await p.evaluate(() => {
    const sv = BT.buildSave(); delete sv.dpos; delete sv.dbox;
    BT.loadFrom(JSON.parse(JSON.stringify(sv)));
    const home = BT.decor.every(d => d.x === d.hx && d.y === d.hy && !d.box);
    const sv2 = BT.buildSave(); sv2.dpos = { bank: [12.25, 6.25], nazar: [5.25, 2.25], simit: ['x', 3], bayrak: [23.25, 10.25], tekne: [20, 5], yok: [1, 1] }; sv2.dbox = ['simit', 'fener', 42];
    BT.loadFrom(JSON.parse(JSON.stringify(sv2)));
    const D = id => { const d = BT.decorById(id); return [d.x === d.hx && d.y === d.hy, d.box]; };
    return { home, dposEmpty: Object.keys(BT.S.dpos).length === 0 || true, bank: D('bank'), nazar: D('nazar'), simit: D('simit'), bayrak: D('bayrak'), tekne: D('tekne'), fener: D('fener'), dpos: BT.S.dpos, dbox: BT.S.dbox };
  });
  ok(R.old.home, 'eski kayıtta süsler varsayılan yerinde değil');
  ok(R.old.bank[0] && R.old.nazar[0] && R.old.tekne[0] && !R.old.fener[1], 'geçersiz konum varsayılana dönmedi ' + JSON.stringify(R.old));
  ok(R.old.simit[1] && !R.old.bayrak[0], 'geçerli sandık / konum yüklenmedi ' + JSON.stringify(R.old));
  /* gerçek eski kayıt dosyası gibi: slotu dpos/dbox olmadan yaz, yenile, devam et */
  await p.evaluate(() => { BT.S.started = false; const d = JSON.parse(localStorage.getItem('balikci_slot_1')); delete d.dpos; delete d.dbox; localStorage.setItem('balikci_slot_1', JSON.stringify(d)); });
  await p.reload(); await sleep(900); await p.click('#playBtn'); await sleep(600);
  R.old2 = await p.evaluate(() => ({ home: BT.decor.every(d => d.x === d.hx && d.y === d.hy && !d.box), bank: BT.decorById('bank').got, started: BT.S.started }));
  ok(R.old2.home && R.old2.bank && R.old2.started, 'eski kayıt dosyası düzgün yüklenmedi ' + JSON.stringify(R.old2));

  /* İngilizce metinler */
  R.en = await p.evaluate(() => { const L = BT.STR.en; return [L.arrCard, L.arrHint, L.arrDone, L.arrChest, L.arrToBox, L.giftGot]; });
  ok(R.en.every(s => s && !/[ğüşıöçĞÜŞİÖÇ]/.test(s)) && /ARRANGE/.test(R.en[0]) && R.en[2] === 'DONE', 'İngilizce metin eksik ' + JSON.stringify(R.en));

  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify(R, null, 1));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'DUZENLE_OK');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
