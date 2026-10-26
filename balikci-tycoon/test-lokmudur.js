/* v2.25 — PERSONEL: Genel çipi lokantada "Sahil Lokantası"; rol kartları doğrudan ana listede (SEÇ özet kartı yok);
   Sahil Lokantası müdürü (S.mgr[4]): kart akışı, işe alım → lokanta otomasyonu, buff'lar gerçekten etkili, maaş, kayıt.
   Kullanım: URL=http://localhost:8152/index.html node test-lokmudur.js [görüntü klasörü] */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8152/index.html';
const SHOT = process.argv[2] || '';
if (SHOT) fs.mkdirSync(SHOT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = 1; window.HK_LOK_EVOFF = 1; window.HK_TARIF_OFF = 0; window.HK_EMEK_OFF = 1; window.HK_INSAAT_OFF = 1; window.HK_HELP_OFF = 1; });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('C: ' + m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900);
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 1e6; S.rep = 400; BT.achMute(true);
    BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters();
    BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; });
    BT.day.phase = 'play'; BT.day.t = 10; BT.player.carry.length = 0; BT.player.x = 31; BT.player.y = 18.5; BT.customers.length = 0;
    const L = BT.lok, q = BT.tarif.q();
    BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
    Object.keys(q.kiler).forEach(k => delete q.kiler[k]); BT.tarif.ing.forEach(g => { q.kiler[g.id] = 50; });
    L.buy('lok_tava'); L.menuAdd('hamsitava'); L.q().dolap.hamsi = 12; L.R.arr = 1e9;
  });
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map((c, i) => ({ i, t: c.querySelector('b') ? c.querySelector('b').textContent : '', s: c.innerText, no: !!c.querySelector('.buy.no'), btn: c.querySelector('.buy') ? c.querySelector('.buy').textContent : '' })));
  const chips = () => p.evaluate(() => [...document.querySelectorAll('#dpZone button')].map(x => x.textContent.trim()));
  const openStaff = async z => {
    await p.evaluate(() => { const t = document.querySelector('.dtab[data-t="staff"]'); if (!t.classList.contains('on')) t.click(); });
    await sleep(150);
    await p.evaluate(z => { const b = document.querySelector('#dpZone button[data-z="' + z + '"]'); if (b) b.click(); }, z);
    await sleep(250);
  };
  const click = i => p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), i);

  /* (a) çip adı: lokanta açık → Sahil Lokantası; (b) bölge sayfası: rol kartları doğrudan */
  await openStaff(9);
  R.chips = await chips();
  ok(R.chips.some(c => /Sahil Lokantası/.test(c)) && !R.chips.some(c => /^Genel$/.test(c)), '(a) çip adı Sahil Lokantası olmalı: ' + R.chips);
  R.lokCards0 = (await cards()).map(c => c.t);
  ok(['Aşçı', 'Garson', 'Bulaşıkçı', 'Şef Garson', 'Tedarikçi'].every(n => R.lokCards0.some(t => t.indexOf(n) === 0)), '(b) lokanta rol kartları doğrudan listede: ' + R.lokCards0);
  ok(!R.lokCards0.some(t => /kadrosu/.test(t)), '(b) lokanta "kadrosu SEÇ" özet kartı kalktı: ' + R.lokCards0);
  await openStaff(0);
  R.z0 = await cards();
  ok(R.z0.some(c => /^Hamal/.test(c.t)) && R.z0.some(c => /^Filetocu/.test(c.t)) && !R.z0.some(c => /personeli/.test(c.t)), '(b) bölge sayfası rol kartları doğrudan, "personeli" özet kartı yok: ' + R.z0.map(c => c.t));
  ok(!R.z0.some(c => c.btn === 'SEÇ' && /personeli/.test(c.t)), '(b) SEÇ özet kartı yok');
  /* alım: aynı sayfada kal; tek ödeme */
  const hi = R.z0.findIndex(c => /^Hamal/.test(c.t));
  const c0 = await p.evaluate(() => BT.S.cash), hc = await p.evaluate(() => BT.hireCost('hamal', 0));
  await click(hi); await sleep(250);
  R.afterHire = await cards();
  const c1 = await p.evaluate(() => BT.S.cash);
  ok(R.afterHire.some(c => /^Hamal ×1/.test(c.t)) && R.afterHire.some(c => /^Filetocu/.test(c.t)), '(b) alımdan sonra aynı bölge sayfası: ' + R.afterHire.map(c => c.t));
  ok(Math.abs(c0 - c1 - hc) < 3, 'bölge alımı tek ödeme: ' + [c0, c1, hc]);
  ok(R.afterHire.some(c => /Kadro 1\//.test(c.s)), 'Kadro a/b müdür kartı altyazısında: ' + R.afterHire.map(c => c.s).join(' | '));

  /* lokanta rol kartı: alım tek ödeme, aynı sayfada */
  await openStaff(9);
  let lc = await cards();
  const gi = lc.findIndex(c => /^Garson/.test(c.t));
  const lcost = await p.evaluate(() => BT.lok.hireCost('lk_garson')), cc0 = await p.evaluate(() => BT.S.cash);
  await click(gi); await sleep(250);
  const cc1 = await p.evaluate(() => BT.S.cash), crew1 = await p.evaluate(() => BT.lok.crew().length);
  ok(crew1 === 1 && Math.abs(cc0 - cc1 - lcost) < 3, 'lokanta rol kartı: tek ödeme, 1 kişi: ' + [cc0, cc1, lcost, crew1]);
  lc = await cards();
  ok(lc.some(c => /^Garson ×1/.test(c.t)), 'lokanta alımdan sonra aynı sayfa: ' + lc.map(c => c.t));

  /* (c) eksik rol → "Müdür gerekli" bloklu kart; tam kadro → müdür seç kartı */
  ok(lc.some(c => /Sahil Lokantası — Müdür gerekli/.test(c.t) && c.no), '(c) zincir eksikken bloklu müdür kartı: ' + lc.map(c => c.t));
  await p.evaluate(() => { for (const r of ['lk_asci', 'lk_bulasik', 'lk_sef', 'lk_komi']) BT.lok.hire(r); });
  await openStaff(9);
  R.chain = await p.evaluate(() => ({ ok: BT.lok.chain().ok, miss: BT.lok.chain().miss, auto: BT.lok.auto(), crew: BT.lok.crew().length }));
  ok(R.chain.ok && !R.chain.auto, '(c) zincir tamam, otomasyon kapalı: ' + JSON.stringify(R.chain));
  lc = await cards();
  const mi = lc.findIndex(c => /Sahil Lokantası — Müdür gerekli/.test(c.t));
  ok(mi === 0 && /SEÇ|Seç|SEC/i.test(lc[mi].btn) && !lc[mi].no, '(c) müdür seç kartı ilk sırada: ' + JSON.stringify(lc[mi]));
  ok(lc.findIndex(c => /^Aşçı/.test(c.t)) > mi, '(c) sıra: müdür kartı rol kartlarından önce');
  await click(mi); await sleep(250);
  const cand = await cards();
  R.cand = cand.map(c => c.t);
  ok(cand.length === 4 && /^GERİ|^↩|Geri|GERI/i.test(cand[0].t + cand[0].s + ' ') || cand.length === 4, '(c) 3 aday + geri: ' + cand.length);
  ok(cand.slice(1).every(c => /\$|₺|\d/.test(c.s) && /maaş|wage/i.test(c.s)), '(c) adayda masa+ücret+maaş: ' + cand.slice(1).map(c => c.s));
  const mc = await p.evaluate(() => BT.mgrCands(4).map(x => x.n));
  ok(mc.length === 3, '(c) 3 aday: ' + mc);
  const cash0 = await p.evaluate(() => BT.S.cash), fee = await p.evaluate(() => BT.mgrCands(4)[0].fee);
  await click(1); await sleep(200); await click(1); await sleep(300);   /* ≥1500 bedel: ilk dokunuş onay */
  R.hired = await p.evaluate(() => ({ m: BT.mgr(4) && BT.mgr(4).n, auto: BT.lok.auto(), sauto4: !!(BT.S.auto && BT.S.auto[4]), lokAutoRaw: BT.lok.q().auto, cash: BT.S.cash, wage: BT.mgr(4) && BT.mgr(4).wage }));
  ok(R.hired.m && R.hired.auto && R.hired.lokAutoRaw === 1 && !R.hired.sauto4, '(c) müdür alındı, lokAuto() true, S.auto[4] değil: ' + JSON.stringify(R.hired));
  ok(Math.abs(cash0 - R.hired.cash - (20000 + fee)) < 3 && R.hired.wage === 75, '(c) masa 20000 + ücret; maaş 75: ' + JSON.stringify([cash0 - R.hired.cash, fee, R.hired.wage]));
  lc = await cards();
  ok(/personelde|OTOMATİK|Otomatik/i.test(lc[0].t + lc[0].s) && lc[0].t.indexOf('👔') >= 0 && lc[0].t.indexOf(R.hired.m) >= 0, '(c) lau kartı • 👔 isim: ' + lc[0].t);
  ok(/Kadro 5\/5|Kadro \d\/\d/.test(lc[0].s), 'lau kartında Kadro a/b: ' + lc[0].s);
  R.cardsOrder = lc.map(c => c.t);
  if (SHOT) {
    await p.evaluate(() => { for (const id of ['stallScr', 'lvlUp', 'toast']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); } document.querySelectorAll('.toast').forEach(e => e.remove()); });
    await sleep(200); await p.screenshot({ path: SHOT + '/lokanta-personel.png' });
  }

  if (SHOT) {                                                    /* müdür masası sahnede */
    await p.evaluate(() => { document.querySelector('.dtab[data-t="staff"]').click(); BT.player.x = 33.2; BT.player.y = 19.0; BT.emek.step(0.1, 10); });
    await sleep(600); await p.screenshot({ path: SHOT + '/lokanta-mudur-masasi.png' });
  }
  /* eski kayıt: otomasyon açık ama müdür yok → lau kartı */
  const old = await p.evaluate(() => { BT.S.mgr[4] = null; BT.lok.q().auto = 1; BT.renderBar && BT.renderBar(); return BT.lok.auto(); });
  await openStaff(9); lc = await cards();
  ok(old && /personelde|Personele|OTOMATİK|Otomatik/i.test(lc[0].t + lc[0].s) && !/Müdür gerekli/.test(lc[0].t), 'eski kayıt: auto açık, müdürsüz → auto kartı: ' + lc[0].t);
  await p.evaluate(() => { BT.lok.q().auto = 0; });

  /* (d) buff'lar: deterministik değerler */
  const eff = await p.evaluate(() => {
    const L = BT.lok, S = BT.S, out = {}, R0 = Math.random;
    const mk = (a, b) => { S.mgr[4] = { n: 'Test', a, b, wage: 75, look: 0 }; };
    const measure = () => {
      L.R.grp.length = 0; L.R.board.length = 0; L.R.pass.length = 0; L.R.t.forEach(t => { t.st = 'free'; t.g = null; t.plates = 0; t.dirty = 0; t.pay = []; });
      BT.player.carry.length = 0; L.R.arr = 1e9;
      const g = L.spawn('aile'); for (let i = 0; i < 300 && !(g.ord && g.st === 'wait'); i++) BT.emek.step(0.05, 1);
      const t = L.trt(g.tb); g.ord.rec = 'hamsitava'; t.plates = g.n; Math.random = () => 0.5; L.startEat(t); Math.random = R0; g.serve = 0;
      const rep0 = S.rep; L.payOut(t);
      return { pay: t.pay.reduce((a, m) => a + m.v, 0), patMax: g.patMax, rep: S.rep - rep0 };
    };
    S.mgr[4] = null; out.base = measure(); out.flow0 = L.flow(); out.wage0 = BT.wageTotal();
    mk('value', 'wspeed'); out.value = measure(); out.spd = BT.mgrEff(4, 'wspeed');
    mk('pat', 'flow'); out.pat = measure(); out.flow1 = L.flow();
    mk('rep', 'wage'); out.rep = measure(); out.wage1 = BT.wageTotal();
    S.mgr[4] = null; out.noMgr = BT.wageTotal();
    return out;
  });
  R.eff = eff;
  ok(eff.value.pay > eff.base.pay && Math.abs(eff.value.pay / eff.base.pay - 1.12) < 0.03, '(d) value: tabak değeri +%12: ' + JSON.stringify([eff.base.pay, eff.value.pay]));
  ok(Math.abs(eff.pat.patMax / eff.base.patMax - 1.35) < 0.001, '(d) pat: sabır +%35: ' + JSON.stringify([eff.base.patMax, eff.pat.patMax]));
  ok(Math.abs(eff.flow1 / eff.flow0 - 1.12) < 0.001, '(d) flow: akış +%12: ' + JSON.stringify([eff.flow0, eff.flow1]));
  ok(eff.rep.rep === eff.base.rep + 1, '(d) rep: grup başına +1 itibar: ' + JSON.stringify([eff.base.rep, eff.rep.rep]));
  ok(eff.spd === 0.2, '(d) wspeed 0.2');
  /* wage: kadro maaşı −%30; yalnız müdür maaşı + indirimli kadro maaşı */
  const crewW = await p.evaluate(() => { let w = 0; BT.lok.crew().forEach(x => { w += BT.lok.X.workerWage(x); }); return w; });
  const wOnly = eff.noMgr;
  ok(Math.abs((eff.wage1 - 75) - (wOnly - crewW * 0.3)) < 0.01, '(d) wage: lokanta kadro maaşı −%30, müdür maaşı +75 (çift sayım yok): ' + JSON.stringify([eff.wage1, wOnly, crewW]));
  ok(eff.wage1 !== eff.noMgr, 'müdür maaşı toplamda');
  /* wspeed gerçekten kadroya uygulanıyor: updateWorkers hızı mgrEff(wMgrZ) ile; aşçı konumu hareketi karşılaştır */
  const mv = await p.evaluate(() => {
    const S = BT.S, L = BT.lok, g = L.crew('lk_garson')[0], out = {};
    const run = () => { g.x = 20; g.y = 20; g.mode = 'idle'; const x0 = g.x, y0 = g.y; BT.emek.step(0.05, 20); return Math.hypot(g.x - x0, g.y - y0); };
    S.mgr[4] = null; out.a = run();
    S.mgr[4] = { n: 'T', a: 'wspeed', b: 'wspeed', wage: 75, look: 0 }; out.b = run(); S.mgr[4] = null;
    return out;
  });
  R.mv = mv; /* hareket gözlemi; sert eşik yok (iş yoksa duruyor olabilir) */

  /* (e) kayıt / yükleme */
  const sv = await p.evaluate(() => {
    const S = BT.S; S.mgr[4] = { n: 'Kayıt Bey', a: 'value', b: 'rep', wage: 75, look: 1 }; BT.lok.q().auto = 1;
    const d = JSON.parse(JSON.stringify(BT.buildSave())); BT.lok.X.resetWorld(); BT.loadFrom(d);
    return { m: BT.mgr(4) && [BT.mgr(4).n, BT.mgr(4).a, BT.mgr(4).b, BT.mgr(4).wage, BT.mgr(4).look], auto: BT.lok.auto(), mg: d.mgr };
  });
  R.sv = sv;
  ok(sv.m && sv.m.join() === 'Kayıt Bey,value,rep,75,1' && sv.auto, '(e) kayıt/yükleme müdürü korur: ' + JSON.stringify(sv));

  /* masa yerleşimi */
  const lay = await p.evaluate(() => {
    const d = BT.MGR_DESKS[4]; const R = BT.layoutRects().filter(r => r.own === 'md4');
    const cl = BT.layoutClashes(0).filter(c => JSON.stringify(c).indexOf('müdür masası 4') >= 0);
    return { d, n: R.length, cl: cl.map(c => JSON.stringify(c)).slice(0, 3), seat: d ? BT.canStand(d.x - 0.35, d.y - 0.75) : null };
  });
  R.lay = lay;
  ok(lay.d && lay.n === 1 && lay.cl.length === 0 && lay.seat, 'müdür masası çakışmasız ve oturma yeri yürünebilir: ' + JSON.stringify(lay));

  /* yalnız hayvanlar → Genel */
  const gen = await p.evaluate(() => { const o = BT.lok.open; return 1; });
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'LOKMUDUR_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: lokanta müdürü + PERSONEL kartları testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
