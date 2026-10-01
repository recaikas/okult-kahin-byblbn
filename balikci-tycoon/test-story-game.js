/* v2.4 — Dipteki Söz oyunun içinde:
   1) eğitimden sonra günün hikâye karakteri gerçekten koya gelir, bir tezgâhın kuyruğuna girer; adı "?????";
   2) tezgâha varınca ara sahne açılır: oyun durur, oyun müziği ve ortam kanalı susar;
   3) sahne bitince sonuç işlenir (itibar, Bereket, kalıcı etki, öğrenilen isimler), karakter gider, ses geri gelir;
   4) aynı gün ikinci kez gelmez; ertesi gün sıradaki gün; kayıt/yükleme hikâyeyi korur;
   5) özel müşterilerin adı ilk gelişte "?????", siparişi bitince bilinir. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.evaluate(() => { window.HK_STORY_OFF = 0; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  ok(await p.evaluate(() => BT.story().on), 'story.js oyuna yüklenmedi');
  /* eğitim bitmeden gelmez */
  R.pre = await p.evaluate(async () => { BT.day.t = 40; await new Promise(r => setTimeout(r, 2500)); return !!BT.story().vis; });
  ok(!R.pre, 'eğitim bitmeden hikâye karakteri geldi');

  async function playDay(n, pick) {
    /* yeni oyun günü: karakter gelsin */
    const arr = await p.evaluate(async n => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; BT.day.n = n + 10; BT.day.phase = 'play'; BT.day.t = 30;
      for (let i = 0; i < 60 && !BT.story().vis; i++) await new Promise(r => setTimeout(r, 100));
      const v = BT.story().vis; if (!v) return null;
      return { id: v.spec, name: BT.story().name(v.spec), story: v.story };
    }, n);
    if (!arr) return { err: 'gelmedi' };
    /* tezgâha yürüyüşü bekle → ara sahne açılır */
    for (let i = 0; i < 200 && !(await p.evaluate(() => BT.story().open)); i++) await sleep(100);
    const inS = await p.evaluate(() => { const a = BT.snd(); return { open: BT.story().open, mute: BT.story().mute, paused: BT.paused ? BT.paused() : null, badge: document.getElementById('pauseBadge').classList.contains('hidden') }; });
    /* sahneyi oynat */
    for (let k = 0; k < 1500; k++) {
      const m = await p.evaluate(() => HK_STORY.isOpen() ? HK_STORY._mode() : 'closed');
      if (m === 'closed') break;
      if (m === 'dlg') await p.evaluate(() => HK_STORY._tap());
      else if (m === 'mini') {
        const c = await p.evaluate(i => { const o = document.querySelectorAll('#hkStory [data-k="mini"] .opt'); if (o.length) { o[Math.min(i, o.length - 1)].click(); return true; } return false; }, pick || 0);
        if (!c) await p.evaluate(() => HK_STORY._skip());
      } else if (m === 'result') await p.click('#hkStory [data-r]');
      await sleep(40);
    }
    await sleep(200);
    const after = await p.evaluate(() => ({ st: JSON.parse(JSON.stringify(BT.story().st)), mute: BT.story().mute, vis: !!BT.story().vis, open: BT.story().open }));
    return { arr, inS, after };
  }
  const days = [];
  let rep0 = await p.evaluate(() => BT.S.rep);
  for (let n = 1; n <= 12; n++) {
    const d = await playDay(n, 0);
    days.push(d);
    ok(d.arr, `gün ${n}: karakter gelmedi`);
    if (!d.arr) break;
    ok(d.inS.open && d.inS.mute, `gün ${n}: ara sahne açılmadı ya da müzik susmadı ${JSON.stringify(d.inS)}`);
    ok(d.after.st.step === n && !d.after.mute && !d.after.open && !d.after.vis, `gün ${n}: sonuç işlenmedi ${JSON.stringify(d.after)}`);
    if (n === 1) ok(d.arr.name === '?????', 'gün 1: ilk gelen karakterin adı bilinmemeli ' + d.arr.name);
    if (n === 7) ok(d.arr.name === 'Alp Er Tunga', 'gün 7: Alp Er Tunga adı 6. günde öğrenilmeliydi ' + d.arr.name);
    if (n === 9) ok(d.arr.name === '?????', 'gün 9: vezirin adı ilk gelişte bilinmemeli ' + d.arr.name);
    /* aynı gün ikinci ziyaret yok */
    if (n === 2) { const again = await p.evaluate(async () => { BT.day.t = 50; await new Promise(r => setTimeout(r, 2500)); return !!BT.story().vis; }); ok(!again, 'aynı gün ikinci hikâye ziyareti'); }
  }
  R.arr = days.map(d => d.arr && d.arr.id + ':' + d.arr.name);
  const fin = days[days.length - 1].after.st;
  R.fin = { ber: fin.ber, buffs: fin.buffs, known: fin.known, flags: fin.flags };
  ok(fin.step === 12 && fin.ber === 10 && fin.buffs.bekci === 1 && fin.flags.promise === 'kept', 'hikâye sonu yanlış ' + JSON.stringify(R.fin));
  ok(['k', 'h', 't', 'a', 'v', 's'].every(k => fin.known.indexOf(k) >= 0), 'isimlerin hepsi öğrenilmedi ' + fin.known);
  const rep1 = await p.evaluate(() => BT.S.rep);
  ok(rep1 > rep0 + 60, 'hikâye itibarı eklenmedi ' + rep0 + '→' + rep1);
  /* etkiler + kayıt */
  R.fx = await p.evaluate(async () => {
    const o = { net: BT.story().netMul };
    const d = BT.buildSave(); BT.loadFrom(JSON.parse(JSON.stringify(d)));
    o.saved = BT.story().st.step === 12 && BT.story().st.ber === 10;
    /* 13. gün: hikâye bitti, kimse gelmez */
    BT.day.n = 99; BT.day.t = 40; await new Promise(r => setTimeout(r, 2500)); o.after = !!BT.story().vis;
    o.tab = (() => { BT.ui.openPauseMenu(); return true; })();
    return o;
  });
  ok(R.fx.net > 1.17 && R.fx.saved && !R.fx.after, 'etki/kayıt yanlış ' + JSON.stringify(R.fx));
  await sleep(300);
  R.album = await p.evaluate(async () => { const t = document.querySelector('.tab[data-t="album"]'); if (t) t.click(); await new Promise(r => setTimeout(r, 300)); return document.getElementById('tabBody').innerText; });
  ok(/Dipteki Söz/.test(R.album) && /12\/12/.test(R.album) && /Bereket/.test(R.album), 'albümde hikâye satırı yok ' + R.album.slice(0, 300));
  /* eski kayıt (names yok): tanışılanların adı bilinir; yeni tanışılan ????? */
  R.names = await p.evaluate(() => {
    const d = BT.buildSave(); d.met = ['caner']; delete d.names; delete d.story; BT.loadFrom(d);
    const a = BT.story().name('caner'), b2 = BT.story().name('pelin');
    return { a, b: b2, st: BT.story().st };
  });
  ok(R.names.a === 'Caner' && R.names.b === '?????' && !R.names.st, 'eski kayıt isim göçü yanlış ' + JSON.stringify(R.names));
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await p.screenshot({ path: process.env.SHOT || '/tmp/sg.png' });
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'STORYGAME_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: Dipteki Söz oyun içi testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
