/* v2.18-deneme — MODÜLER DEPO (DEPO_REKLAM_RESTORAN_TASARIM.md Bölüm B) kabul testi:
   1) 5 bölme: seviye başına kapasite / kiler / rampa, bedeller, inşaat tablosu (Sv5 = 5 gün), yerleşim (layoutClashes boş, ekranda payı var)
   2) ayrık depolama: ham (Ambar) ve soğuk (fileto/füme) kapasiteleri bağımsız; Sv1'de ortak raf
   3) eski shelf türüne göre dağıtılır (atama + eski kayıt)
   4) Depo Hamalı: tezgâh ve masa doluyken ağdaki fazla ham balığı Ambar'a taşır (kapalı mod + Emekçi Mod sandığı)
   5) TOPTAN: kur 0,8–1,2, 10'luk parti, günde 3 (rampa 4) parti, fiyat formülü, para, gün dönüşü, ofis sekmesi
   6) kayıt/yükleme (yeni + eski kayıt)   7) TR/EN metinler, hook   8) ekran görüntüsü: screenshots/depo/ (390x844, 5 bölme) */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SHOT = __dirname + '/screenshots/depo/';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  const q = (fn, a) => p.evaluate(fn, a);
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]');
  await q(() => { BT.S.ctrl = 2; BT.S.cash = 5e6; BT.S.rep = 5000; BT.areas.forEach(a => a.locked = false); BT.rebuildCounters(); });
  await q(() => { window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 150); });
  await sleep(400);
  /* müşteri akışı kapalı: ölçümler müşteriden bağımsız */
  await q(() => { window.__nc = setInterval(() => { BT.counters.forEach(c => { c.spawnT = 999; });
    BT.customers.forEach(cu => { if (cu.state !== 'leave') { cu.state = 'leave'; cu.happyLeave = true; cu.leaveT = 0; if (cu.c) { const i = cu.c.slots.indexOf(cu); if (i >= 0) cu.c.slots[i] = null; } } }); }, 200); });

  /* ---------- 1) bölmeler ---------- */
  R.table = await q(() => ({ n: BT.DEPOT_LV.length, cost: BT.DEPOT_LV.map(l => l.c), cap: BT.DEPOT_LV.map(l => l.cap), wings: BT.depo.wings.map(w => w.k) }));
  ok(R.table.n === 5, 'depo 5 seviye değil ' + JSON.stringify(R.table));
  ok(JSON.stringify(R.table.cost) === '[3000,8000,20000,45000,90000]', 'bedeller ' + JSON.stringify(R.table.cost));
  ok(JSON.stringify(R.table.wings) === '["ambar","soguk","kiler","uzanti","rampa"]', 'bölme sırası ' + JSON.stringify(R.table.wings));
  R.lv = [];
  await p.click('.dtab[data-t="build"]'); await sleep(200); await p.click('#dpSub button[data-s="meydan"]'); await sleep(200);
  const reopen = async () => { await p.click('#dpSub button[data-s="decor"]'); await sleep(120); await p.click('#dpSub button[data-s="meydan"]'); await sleep(150); };
  const buyDepo = async () => {
    for (let k = 0; k < 2; k++) {                                                    /* ilk dokunuş ONAYLA? ister */
      await q(() => { const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /^Depo|^Depot/.test(d.querySelector('b').textContent)); c.querySelector('.buy').click(); });
      await sleep(150);
    }
  };
  for (let i = 1; i <= 5; i++) {
    await buyDepo();
    R.lv.push(await q(() => { const D = BT.DEPOT, d = BT.depo; return { lvl: D.lvl, rawCap: d.rawCap(), coldCap: d.coldCap(), cap: d.depotCap(), kiler: d.depotHasKiler(), max: d.toptanMax(), card: [...document.querySelectorAll('#dpCards .dcard')].find(x => /^Depo|^Depot/.test(x.querySelector('b').textContent)).innerText.replace(/\s+/g, ' ') }; }));
  }
  const expect = [[1, 30, 30, 30, false, 3], [2, 30, 30, 60, false, 3], [3, 30, 30, 60, true, 3], [4, 80, 60, 140, true, 3], [5, 80, 60, 140, true, 4]];
  expect.forEach((e, i) => { const r = R.lv[i]; ok(r.lvl === e[0] && r.rawCap === e[1] && r.coldCap === e[2] && r.cap === e[3] && r.kiler === e[4] && r.max === e[5], 'Sv' + (i + 1) + ' etkisi ' + JSON.stringify(r)); });
  ok(/Ham|Raw/.test(R.lv[1].card), 'depo kartında ham/soğuk satırı yok: ' + R.lv[1].card);
  /* hamal kadrosu = bölme sayısı: kart "(n/Sv)" gösterir, dolunca kilitlenir */
  R.staff = await q(() => {
    const out = {};
    BT.DEPOT.lvl = 3; BT.hire('depocu', true, -1); BT.hire('depocu', true, -1);
    return 1;
  });
  await reopen();
  R.staff = await q(() => {
    const out = {};
    const card = () => [...document.querySelectorAll('#dpCards .dcard')].find(d => /Hamal|Porter/.test(d.querySelector('b').textContent));
    out.t2 = card() && card().querySelector('b').textContent;
    BT.hire('depocu', true, -1);
    return out;
  });
  await reopen();
  R.staff.full = await q(() => { const d = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Hamal|Porter/.test(d.querySelector('b').textContent)); return d.innerText.replace(/\s+/g, ' '); });
  /* Sevkiyatçı sınırı ayrı: hamal kadrosu doluyken Sevkiyatçı kartı kendi (0/Sv) sınırını gösterir, kendi dolu metniyle kilitlenir */
  R.staff.sv0 = await q(() => { const d = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Sevkiyat|Dispatcher/.test(d.querySelector('b').textContent)); return { t: d.querySelector('b').textContent, txt: d.innerText.replace(/\s+/g, ' '), blocked: /Hamal kadrosu dolu|Porter crew full/.test(d.innerText) }; });
  await q(() => { for (let i = 0; i < 3; i++) BT.hire('sevkiyat', true, -1); });
  await reopen();
  R.staff.svFull = await q(() => { const d = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Sevkiyat|Dispatcher/.test(d.querySelector('b').textContent)); return d.innerText.replace(/\s+/g, ' '); });
  R.staff.cap = await q(() => ({ dp: BT.depotRoleCap('depocu'), sv: BT.depotRoleCap('sevkiyat'), dpN: BT.depotRoleStaff('depocu'), svN: BT.depotRoleStaff('sevkiyat') }));
  await q(() => { for (let i = BT.workers.length - 1; i >= 0; i--) if (BT.workers[i].role === 'depocu' || BT.workers[i].role === 'sevkiyat') BT.workers.splice(i, 1); BT.DEPOT.lvl = 5; });
  ok(/\(2\/3\)/.test(R.staff.t2 || '') && /3\/3/.test(R.staff.full || ''), 'Depo Hamalı kadro sınırı bölme sayısı değil ' + JSON.stringify(R.staff));
  ok(/Hamal kadrosu dolu|Porter crew full/.test(R.staff.full || ''), 'Hamal dolu metni rol başına değil ' + JSON.stringify(R.staff.full));
  ok(/\(0\/3\)/.test(R.staff.sv0.t) && !R.staff.sv0.blocked, 'Sevkiyatçı kartı hamalın dolu sınırını paylaşıyor ' + JSON.stringify(R.staff.sv0));
  ok(/\(3\/3\)/.test(R.staff.svFull) && /Sevkiyat kadrosu dolu|Dispatch crew full/.test(R.staff.svFull) && !/Hamal kadrosu dolu|Porter crew full/.test(R.staff.svFull), 'Sevkiyatçı dolu metni/sınırı ' + JSON.stringify(R.staff.svFull));
  ok(R.staff.cap.dp === 3 && R.staff.cap.sv === 3 && R.staff.cap.dpN === 3 && R.staff.cap.svN === 3, 'rol sayaçları ' + JSON.stringify(R.staff.cap));

  /* yerleşim: çakışma yok, ekranda diğer binalarla binme yok, pano ve hayvan evi varsayılanlarıyla da */
  R.lay = await q(() => {
    const clash = BT.layoutClashes(0.1), W = BT.depo.wings.filter(w => w.x !== undefined), B = [['kulübe', BT.HUT], ['hal', BT.WHALL], ['ofis', BT.office], ['pano', { x: 24.75, y: 12.0, w: 1.7, h: 1.7 }]];
    const bad = [];
    W.forEach(w => B.forEach(([n, o]) => {
      const du = Math.abs((w.x - w.y) - (o.x - o.y)), need = (w.w + w.h) / 2 + (o.w + o.h) / 2, dv = Math.abs((w.x + w.y) - (o.x + o.y));
      if (du < need && dv < 7) bad.push(w.k + '/' + n + ' du=' + du.toFixed(2) + '<' + need.toFixed(2) + ' dv=' + dv.toFixed(1));
    }));
    const east = W.map(w => +((w.x + w.w / 2) - (w.y - w.h / 2)).toFixed(2));
    const pets = BT.DECOR.filter(d => d.pet).map(d => [d.x, d.y]);
    const petHit = []; W.forEach(w => pets.forEach(([x, y]) => { if (x + 0.42 > w.x - w.w / 2 && x - 0.42 < w.x + w.w / 2 && y + 0.42 > w.y - w.h / 2 && y - 0.42 < w.y + w.h / 2) petHit.push(w.k); }));
    return { clash, bad, east, petHit, rects: W.map(w => [w.k, w.x, w.y, w.w, w.h]) };
  });
  ok(R.lay.clash.length === 0, 'yerleşim çakışması ' + JSON.stringify(R.lay.clash));
  ok(R.lay.bad.length === 0, 'bölme ekranda başka binayla binmiş ' + R.lay.bad.join(' | '));
  ok(Math.max(...R.lay.east) <= 23.6, 'bölme kameranın ulaşamadığı uca taştı ' + R.lay.east);
  ok(R.lay.petHit.length === 0, 'bölme hayvan evi varsayılanına bindi');

  /* ---------- 2) ayrık depolama ---------- */
  R.sep = await q(() => {
    const D = BT.DEPOT, d = BT.depo; D.lvl = 2; D.raw = {}; D.cold = {};
    const out = {};
    D.raw = { 'fish|hamsi': 30 }; D.cold = { 'fileto|hamsi': 10 };
    out.lv2 = { rawFree: d.rawFree(), coldFree: d.depotFree(), cnt: BT.depotCount(), cap: d.depotCap() };
    D.lvl = 1;
    out.lv1 = { rawFree: d.rawFree(), coldFree: d.depotFree() };                              /* ortak raf: 40 > 30 → ikisi de 0 */
    D.lvl = 4; D.raw = { 'fish|hamsi': 80 }; D.cold = { 'fileto|hamsi': 30 };
    out.lv4 = { rawFree: d.rawFree(), coldFree: d.depotFree() };
    D.lvl = 5; D.raw = {}; D.cold = {};
    return out;
  });
  ok(R.sep.lv2.rawFree === 0 && R.sep.lv2.coldFree === 20 && R.sep.lv2.cnt === 40, 'Sv2 ayrık kapasite ' + JSON.stringify(R.sep.lv2));
  ok(R.sep.lv1.rawFree === 0 && R.sep.lv1.coldFree === 0, 'Sv1 ortak raf ' + JSON.stringify(R.sep.lv1));
  ok(R.sep.lv4.rawFree === 0 && R.sep.lv4.coldFree === 30, 'Sv4 kapasite ' + JSON.stringify(R.sep.lv4));

  /* ---------- 3) eski shelf dağıtımı ---------- */
  R.old2 = await q(() => { const D = BT.DEPOT; D.shelf = { 'fileto|hamsi': 5, 'fume|hamsi': 2, 'fish|hamsi': 3, 'zzz|hamsi': 4, 'fileto|yok': 2 }; return { raw: D.raw, cold: D.cold, same: D.shelf === D.cold }; });
  ok(R.old2.raw['fish|hamsi'] === 3 && R.old2.cold['fileto|hamsi'] === 5 && R.old2.cold['fume|hamsi'] === 2 && Object.keys(R.old2.cold).length === 2 && Object.keys(R.old2.raw).length === 1 && R.old2.same, 'shelf dağıtımı ' + JSON.stringify(R.old2));
  R.old = await q(() => {
    const D = BT.DEPOT; D.lvl = 3; D.shelf = {}; D.kur = 1.1;
    const sv = JSON.parse(JSON.stringify(BT.buildSave())); sv.meydan = [2, 3, { 'fileto|hamsi': 6, 'fume|palamut': 1 }, 1, {}];          /* eski kayıt: 6. alan yok */
    BT.loadFrom(sv);
    return { lvl: D.lvl, cold: JSON.stringify(D.cold), raw: JSON.stringify(D.raw), kur: D.kur, parti: D.parti };
  });
  ok(R.old.lvl === 3 && R.old.cold === '{"fileto|hamsi":6,"fume|palamut":1}' && R.old.raw === '{}' && R.old.kur === 1 && R.old.parti === 0, 'eski kayıt yükleme ' + JSON.stringify(R.old));

  /* ---------- 4) Depo Hamalı: fazla ham balık → Ambar ---------- */
  const hamalTest = async (emek) => q(async (emek) => {
    window.HK_EMEK_OFF = emek ? 0 : 1; BT.S.emek = emek ? 1 : 0;
    const D = BT.DEPOT, d = BT.depo, t = BT.tables[0], s = BT.spots[0];
    D.lvl = 2; D.raw = {}; D.cold = { 'fileto|palamut': 30 };                       /* soğuk oda dolu: hamal fileto taşımasın, yalnız ham balık */
    BT.workers.length = 0; BT.player.x = 4.5; BT.player.y = 3.2;
    const cs = BT.counters.filter(c => c.z === 0);
    const hold = () => {                                                              /* masa + tezgâh + hasır dolu tutulur */
      t.inn.length = 0; for (let i = 0; i < t.max; i++) t.inn.push({ f: 'hamsi', k: 'fish' });
      t.mat.items.length = 0; for (let i = 0; i < BT.pileCap(t) + 2; i++) t.mat.items.push({ k: 'fileto', f: 'hamsi' });
      cs.forEach(c => { while (c.buffer.length < BT.counterMax(c)) c.buffer.push({ k: 'fileto', f: c.fish }); });
      const dst = emek ? s.box : s.stock;
      while (dst.length < 6) dst.push({ k: 'fish', f: 'hamsi' });
    };
    hold();
    const probe = { blocked: d.rawBlocked(0, 'hamsi'), net: !!d.rawSurplusNet({ x: 5, y: 5 }) };
    const w = BT.hire('depocu', true, -1); w.x = 5; w.y = 4;
    const t0 = Date.now(); let got = 0;
    while (Date.now() - t0 < 60000) { hold(); await new Promise(r => setTimeout(r, 200)); got = d.rawCount(); if (got >= 4) break; }
    const secs = Math.round((Date.now() - t0) / 1000), cold = JSON.stringify(D.cold);
    BT.workers.length = 0; D.cold = {}; D.raw = {};
    return { probe, got, secs, cold };
  }, emek);
  R.hamal = await hamalTest(false);
  ok(R.hamal.probe.blocked && R.hamal.probe.net, 'fazla ham balık algılanmadı ' + JSON.stringify(R.hamal));
  ok(R.hamal.got >= 4, 'Depo Hamalı (kapalı mod) ham balığı Ambar\'a taşımadı ' + JSON.stringify(R.hamal));
  R.hamalE = await hamalTest(true);
  ok(R.hamalE.got >= 4, 'Depo Hamalı (Emekçi Mod sandığı) ham balığı Ambar\'a taşımadı ' + JSON.stringify(R.hamalE));
  /* masada yer varsa fazla sayılmaz */
  R.noSur = await q(() => {
    window.HK_EMEK_OFF = 1; BT.S.emek = 0; const t = BT.tables[0], s = BT.spots[0];
    t.inn.length = 0; s.stock.length = 0; for (let i = 0; i < 6; i++) s.stock.push({ k: 'fish', f: 'hamsi' });
    return BT.depo.rawBlocked(0, 'hamsi');
  });
  ok(R.noSur === false, 'masada yer varken fazla sayıldı');

  /* ---------- 5) TOPTAN ---------- */
  R.tp = await q(() => {
    const D = BT.DEPOT, d = BT.depo, S = BT.S, out = {};
    D.lvl = 4; D.raw = { 'fish|hamsi': 25 }; D.cold = { 'fileto|hamsi': 12, 'fume|hamsi': 4 };
    d.toptanDay();
    const kur = d.toptanKur(); out.kur = kur; out.kurOK = kur >= 0.8 && kur <= 1.2;
    const val = 6;                                                                      /* hamsi FISH.val */
    const c0 = S.cash, v1 = d.toptanSell('fish|hamsi');
    out.s1 = { v: v1, exp: Math.round(val * 0.6 * kur * 10), cash: S.cash - c0, left: D.raw['fish|hamsi'], parti: d.toptanLeft() };
    const c1 = S.cash, v2 = d.toptanSell('fileto|hamsi');
    out.s2 = { v: v2, unit: d.toptanUnit('fileto|hamsi'), cash: S.cash - c1, left: D.cold['fileto|hamsi'], parti: d.toptanLeft() };
    const v3 = d.toptanSell('fume|hamsi');
    out.s3 = { v: v3, left: D.cold['fume|hamsi'] || 0, parti: d.toptanLeft() };
    const c3 = S.cash, v4 = d.toptanSell('fish|hamsi');
    out.s4 = { v: v4, cash: S.cash - c3, left: D.raw['fish|hamsi'] };
    out.rampaOff = d.toptanMax();
    D.lvl = 5; out.rampaOn = d.toptanMax(); out.left5 = d.toptanLeft();
    const u5 = d.toptanUnit('fish|hamsi'); D.lvl = 4; const u4 = d.toptanUnit('fish|hamsi'); D.lvl = 5;
    out.ramp = +(u5 / u4).toFixed(3);
    const c4 = S.cash, v5 = d.toptanSell('fish|hamsi'); out.s5 = { v: v5, cash: S.cash - c4, left: D.raw['fish|hamsi'], parti: d.toptanLeft() };
    out.s6 = d.toptanSell('fish|hamsi');
    out.html = d.toptanHtml().length > 50;
    /* gün dönüşü: yeni kur 0,8–1,2, parti sıfır, dünkü kur korunur */
    const k0 = D.kur; BT.day.n++; d.toptanDay();
    out.day = { kurPrev: D.kurPrev === k0, kurOK: D.kur >= 0.8 && D.kur <= 1.2, parti: d.toptanLeft(), max: d.toptanMax() };
    return out;
  });
  ok(R.tp.kurOK, 'kur aralık dışı ' + R.tp.kur);
  ok(R.tp.s1.v === R.tp.s1.exp && R.tp.s1.cash === R.tp.s1.v && R.tp.s1.left === 15 && R.tp.s1.parti === 2, 'ham parti ' + JSON.stringify(R.tp.s1));
  ok(R.tp.s2.v === Math.round(R.tp.s2.unit * 10) && R.tp.s2.cash === R.tp.s2.v && R.tp.s2.left === 2 && R.tp.s2.parti === 1, 'fileto parti ' + JSON.stringify(R.tp.s2));
  ok(R.tp.s3.v > 0 && R.tp.s3.left === 0 && R.tp.s3.parti === 0, 'füme kısmi parti ' + JSON.stringify(R.tp.s3));
  ok(R.tp.s4.v === 0 && R.tp.s4.cash === 0 && R.tp.s4.left === 15, '4. parti engellenmedi ' + JSON.stringify(R.tp.s4));
  ok(R.tp.rampaOff === 3 && R.tp.rampaOn === 4 && R.tp.left5 === 1, 'rampa ek parti ' + JSON.stringify(R.tp));
  ok(R.tp.ramp >= 1.09 && R.tp.ramp <= 1.11, 'rampa +%10 fiyat ' + R.tp.ramp);
  ok(R.tp.s5.v > 0 && R.tp.s5.left === 5 && R.tp.s5.parti === 0 && R.tp.s6 === 0, 'rampa 4. parti ' + JSON.stringify(R.tp.s5));
  ok(R.tp.day.kurPrev && R.tp.day.kurOK && R.tp.day.parti === 4, 'gün dönüşü ' + JSON.stringify(R.tp.day));
  ok(R.tp.html, 'toptan paneli boş');

  /* ofis sekmesi (UI) */
  R.ui = await q(async () => {
    const M = BT.M(); M.office = true; BT.DEPOT.lvl = 4; BT.DEPOT.raw = { 'fish|hamsi': 12 }; BT.DEPOT.cold = {}; BT.day.n++; BT.depo.toptanDay();
    BT.ui.openOffice(); await new Promise(r => setTimeout(r, 100));
    const tab = document.querySelector('#ofTabs .tab[data-t="toptan"]'); tab.click(); await new Promise(r => setTimeout(r, 100));
    const body = document.getElementById('ofBody').innerText, btn = document.querySelector('#ofBody [data-tp]');
    const out = { tabs: document.querySelectorAll('#ofTabs .tab').length, tab: tab.textContent, body: body.slice(0, 200).replace(/\s+/g, ' '), btn: !!btn };
    const c0 = BT.S.cash; if (btn) btn.click(); await new Promise(r => setTimeout(r, 100));
    out.gain = BT.S.cash - c0; out.after = BT.DEPOT.raw['fish|hamsi'];
    out.arrow = /[↑↓→]/.test(document.getElementById('ofBody').innerText);
    return out;
  });
  ok(R.ui.tabs === 7 && /TOPTAN/.test(R.ui.tab) && R.ui.btn && R.ui.gain > 0 && R.ui.after === 2, 'ofis TOPTAN sekmesi ' + JSON.stringify(R.ui));
  ok(/Bugün/.test(R.ui.body) && R.ui.arrow, 'toptan başlığı/ok yok ' + R.ui.body);
  await q(() => { document.getElementById('ofClose').click(); });

  /* ---------- 6) kayıt / yükleme ---------- */
  R.save = await q(() => {
    const D = BT.DEPOT; D.lvl = 5; D.raw = { 'fish|hamsi': 7, 'fish|palamut': 2 }; D.cold = { 'fileto|hamsi': 4 }; D.td = BT.day.n; D.kur = 1.07; D.kurPrev = 0.93; D.parti = 2;
    const sv = JSON.parse(JSON.stringify(BT.buildSave()));
    D.lvl = 0; D.raw = {}; D.cold = {}; D.kur = 1; D.parti = 0; D.td = 0;
    BT.loadFrom(sv);
    return { md: sv.meydan.length, lvl: D.lvl, raw: D.raw, cold: D.cold, kur: D.kur, kp: D.kurPrev, parti: D.parti, td: D.td };
  });
  ok(R.save.md === 6 && R.save.lvl === 5 && R.save.raw['fish|hamsi'] === 7 && R.save.raw['fish|palamut'] === 2 && R.save.cold['fileto|hamsi'] === 4 && R.save.kur === 1.07 && R.save.kp === 0.93 && R.save.parti === 2, 'kayıt/yükleme ' + JSON.stringify(R.save));
  R.bad = await q(() => {
    const sv = JSON.parse(JSON.stringify(BT.buildSave())); sv.meydan = [1, 99, { 'fileto|hamsi': -3, 'x': 'y' }, 0, {}, { r: { 'fish|hamsi': 'a', 'fish|yok': 5 }, kur: 'abc', kp: 99, td: -1, pt: 50 }];
    BT.loadFrom(sv); const D = BT.DEPOT;
    return { lvl: D.lvl, raw: D.raw, cold: D.cold, kur: D.kur, parti: D.parti };
  });
  ok(R.bad.lvl === 5 && Object.keys(R.bad.raw).length === 0 && Object.keys(R.bad.cold).length === 0 && R.bad.kur === 1 && R.bad.parti === 0, 'bozuk kayıt elenmedi ' + JSON.stringify(R.bad));

  /* ---------- 7) inşaat: Sv5 = 5 gün; TR/EN ---------- */
  await q(() => { window.HK_INSAAT_OFF = 0; BT.DEPOT.lvl = 4; BT.S.insaat = {}; BT.S.cash = 9e6; });
  await sleep(300);
  if (!(await q(() => !!document.querySelector('#dpCards .dcard')))) { await p.click('.dtab[data-t="build"]'); await sleep(200); await p.click('#dpSub button[data-s="meydan"]'); await sleep(200); }
  await reopen(); await buyDepo(); await sleep(200);
  R.ins2 = await q(() => ({ ins: JSON.parse(JSON.stringify(BT.S.insaat.depot || null)), lvl: BT.DEPOT.lvl }));
  ok(R.ins2.ins && R.ins2.ins.lv === 5 && R.ins2.ins.left === 5 && R.ins2.lvl === 4, 'Sv5 inşaatı 5 gün sürmedi ' + JSON.stringify(R.ins2));
  await q(() => { window.HK_INSAAT_OFF = 1; BT.S.insaat = {}; BT.DEPOT.lvl = 5; });
  R.lang = await q(() => { BT.setLang('en'); BT.DEPOT.raw = { 'fish|hamsi': 3 }; const out = { en: BT.depo.toptanHtml().slice(0, 600) }; BT.setLang('tr'); return out; });
  ok(/wholesale|STORE|batch/i.test(R.lang.en) && !/Bugün/.test(R.lang.en), 'EN metin yok ' + R.lang.en.slice(0, 160));

  /* ---------- 8) ekran görüntüsü: 5 bölmeli depo (390x844) ---------- */
  if (await q(() => { const e = document.querySelector('#dpCards'); return !!(e && e.offsetParent); })) { await p.click('.dtab[data-t="build"]'); await sleep(200); }
  await q(() => { BT.closeOverlays && BT.closeOverlays(); BT.DEPOT.lvl = 5; BT.DEPOT.raw = { 'fish|hamsi': 55 }; BT.DEPOT.cold = { 'fileto|hamsi': 30, 'fume|hamsi': 12 }; BT.player.x = 25.0; BT.player.y = 4.6; });
  await sleep(2600);
  fs.mkdirSync(SHOT, { recursive: true });
  await p.screenshot({ path: SHOT + 'depo-5-bolme.png' });
  await q(() => { clearInterval(window.__ns); clearInterval(window.__nc); });
  ok(errs.length === 0, 'konsol hataları ' + errs.slice(0, 4).join(' | '));
  console.log(JSON.stringify(R, null, 1).slice(0, 7000));
  console.log('errs', errs.slice(0, 5));
  await b.close();
  if (fail.length) { console.log('BAŞARISIZ:\n - ' + fail.join('\n - ')); process.exit(1); }
  console.log('DEPO2_OK');
})().catch(e => { console.error(e); process.exit(1); });
