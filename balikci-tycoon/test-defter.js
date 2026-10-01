/* v2.5 — Müşteri Defteri + özel müşterinin kendini tanıtması:
   1) 50 özel müşterinin hepsinin TR/EN tanıtım sözü var;
   2) adı bilinmeyen özel müşteri önce kendini tanıtır, sonra siparişini söyler; etiket "?????";
   3) siparişi bitince adı deftere yazılır, bildirim çıkar; ikinci gelişte tanıtım yok, doğrudan sipariş;
   4) defter: üst çubukta 📖, açınca oyun durur; görülmeyen ???, adı bilinmeyen ?????, tanışılan tam ad;
      normal müşteri tipleri görülünce açılır, servis sayısı tutulur; kayıt/yükleme korur; İngilizce. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  R.me = await p.evaluate(() => BT.SPECIALS.filter(s => !(s.me && s.me.tr && s.me.en && s.me.tr !== s.hi.tr)).map(s => s.id));
  ok(R.me.length === 0, 'tanıtım sözü eksik: ' + R.me);
  R.btn = await p.evaluate(() => !document.getElementById('custBtn').classList.contains('hidden'));
  ok(R.btn, 'defter düğmesi görünmüyor');
  /* ilk geliş: önce tanıtım, sonra sipariş */
  R.first = await p.evaluate(async () => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; BT.day.phase = 'play'; BT.day.spec = ['temel', 'caner']; BT.day.sp = 0;
    BT.spawnSpecial(0);
    const cu = BT.customers.find(c => c.spec === 'temel');
    const sp = BT.SPECIALS.find(s => s.id === 'temel');
    const o = { intro: cu.intro, name0: BT.story().name('temel'), dur: BT.specHiDur(cu), hiOnly: BT.sayDur(sp.hi.tr) };
    cu.state = 'wait'; cu.sayT = 0.5; o.talk1 = BT.specTalking(cu);
    /* sipariş bitir */
    cu.sayT = 99; cu.ord.got = cu.ord.need; BT.finishOrder(cu.c, cu);
    o.name1 = BT.story().name('temel'); o.toast = document.getElementById('toast').textContent; o.newF = BT.S.custNewF;
    /* ikinci geliş: tanıtım yok */
    BT.day.spec = ['temel', 'caner']; BT.spawnSpecial(0);
    const cu2 = BT.customers.filter(c => c.spec === 'temel' && c.state !== 'leave').pop();
    o.intro2 = cu2 && cu2.intro; o.dur2 = cu2 && BT.specHiDur(cu2); o.visits = BT.S.specN.temel;
    return o;
  });
  ok(R.first.intro && R.first.name0 === '?????' && R.first.dur > R.first.hiOnly && R.first.talk1, 'ilk gelişte tanıtım yok ' + JSON.stringify(R.first));
  ok(R.first.name1 === 'Temel' && /Deftere yazıldı: Temel/.test(R.first.toast) && R.first.newF, 'servis sonrası ad öğrenilmedi ' + JSON.stringify(R.first));
  ok(R.first.intro2 === false && Math.abs(R.first.dur2 - R.first.hiOnly) < 0.01 && R.first.visits === 2, 'ikinci gelişte tanıtım tekrarlandı ' + JSON.stringify(R.first));
  /* defter */
  await p.click('#custBtn'); await sleep(400);
  R.book = await p.evaluate(() => {
    const d = BT.custBook(), cards = [...document.querySelectorAll('#custGrid .cc')];
    return { paused: !document.getElementById('pauseBadge').classList.contains('hidden'), n: cards.length, known: cards.filter(c => c.classList.contains('ok')).map(c => c.querySelector('b').textContent),
      unk: d.spec.filter(e => e.seen && !e.known).length, tabs: document.getElementById('custTabs').innerText, newBtn: document.getElementById('custBtn').classList.contains('new'),
      types: d.type.filter(e => e.seen).map(e => e.id + ':' + e.cnt) };
  });
  ok(R.book.paused && R.book.n === 50 && R.book.known.indexOf('Temel') >= 0 && !R.book.newBtn, 'defter yanlış ' + JSON.stringify(R.book));
  await p.click('#custTabs .tab[data-c="type"]'); await sleep(200);
  R.types = await p.evaluate(() => ({ n: document.querySelectorAll('#custGrid .cc').length, no: document.querySelectorAll('#custGrid .cc.no').length }));
  ok(R.types.n > 15 && R.types.no >= R.types.n - 3, 'tipler sekmesi yanlış ' + JSON.stringify(R.types));
  await p.click('#custGo'); await sleep(200);
  /* normal müşteri: görülünce açılır, servis sayılır; kayıt korur */
  R.save = await p.evaluate(async () => {
    BT.day.t = 10; for (let i = 0; i < 80 && !BT.customers.some(c => !c.spec); i++) await new Promise(r => setTimeout(r, 150));
    const cu = BT.customers.find(c => !c.spec); if (!cu) return { none: true };
    const id = cu.type.id, seen0 = BT.S.custSeen[id];
    cu.state = 'wait'; cu.ord.got = cu.ord.need; BT.finishOrder(cu.c, cu);
    const d = BT.buildSave(); BT.loadFrom(JSON.parse(JSON.stringify(d)));
    return { id, seen0, after: BT.S.custSeen[id], specN: BT.S.specN.temel, names: BT.S.names.indexOf('temel') >= 0 };
  });
  ok(!R.save.none && R.save.seen0 === 0 && R.save.after === 1 && R.save.specN === 2 && R.save.names, 'tip sayacı/kayıt yanlış ' + JSON.stringify(R.save));
  /* İngilizce */
  R.en = await p.evaluate(async () => { BT.setLang('en'); BT.openCustBook(); await new Promise(r => setTimeout(r, 300)); const t = document.getElementById('custTitle').textContent + '|' + document.getElementById('custTabs').innerText; BT.setLang('tr'); return t; });
  ok(/CUSTOMER BOOK/.test(R.en) && /SPECIAL/.test(R.en), 'İngilizce defter yok ' + R.en);
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'DEFTER_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: Müşteri Defteri testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
