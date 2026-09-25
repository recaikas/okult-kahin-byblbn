/* UZUN TEST (~20 dk): Bölüm 1'i baştan sona oynar. node test-playthrough.js (URL, SC ortam değişkenleri isteğe bağlı) */
/* Bölüm 1'i baştan sona oynayan bot.
   A) İlk dakikalar: gerçek klavyeyle yürü, ağdan al, kes, tezgâha koy, kasayı topla.
   B) Büyüme: her aşamada yalnız "kazanç" (para/itibar) eklenir; bütün alımlar arayüzden tıklanır,
      personel/müdür arayüzden alınır, günler gerçekten oynanır (gün sonu/pazar/tezgâh ekranları tıklanır).
   C) Sayaç dolunca gazete kapanışı → bölüm kartı. Her aşamada hata/takılma kontrolü + ekran görüntüsü. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = (process.env.SC || require('os').tmpdir() + '/bt-play') + '/';
require('fs').mkdirSync(SC, { recursive: true });
const LOG = [];
const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); LOG.push(s); console.log(s); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 430, height: 860 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => { errs.push(e.message); log('!! PAGEERROR', e.message); });
  p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) { errs.push('C:' + m.text()); log('!! CONSOLE', m.text()); } });
  let shotN = 0; const shot = async n => { await p.screenshot({ path: SC + String(++shotN).padStart(2, '0') + '-' + n + '.png' }); };
  const st = () => p.evaluate(() => ({ cash: Math.round(BT.S.cash), rep: BT.S.rep, day: BT.day.n, ph: BT.day.phase, carry: BT.player.carry.length, caught: BT.S.caught, served: BT.S.served, lost: BT.S.lost, pos: [+BT.player.x.toFixed(1), +BT.player.y.toFixed(1)], obj: document.getElementById('objText').textContent }));
  /* ekranda çıkan engelleyici pencereleri oyuncu gibi kapat */
  const handleScreens = async () => p.evaluate(() => {
    const vis = id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); };
    const out = [];
    if (vis('dayScr')) { out.push('day:' + document.getElementById('dayTitle').textContent); document.getElementById('dayGo').click(); }
    if (vis('prepScr')) { out.push('prep'); document.getElementById('prepGo').click(); }
    if (vis('stallScr')) { out.push('stall'); document.getElementById('stallRows').querySelectorAll('.sw.off').forEach(b => b.click()); document.getElementById('stallGo').click(); }
    return out;
  });
  /* --- yürüme: W=(-1,-1) S=(+1,+1) A=(-1,+1) D=(+1,-1) --- */
  const walkTo = async (x, y, tol = 0.45, maxMs = 9000) => {
    const t0 = Date.now(); let last = null, stuck = 0;
    while (Date.now() - t0 < maxMs) {
      const q = await p.evaluate(() => [BT.player.x, BT.player.y]);
      const dx = x - q[0], dy = y - q[1];
      if (Math.hypot(dx, dy) < tol) break;
      const u = dx + dy, v = dx - dy, keys = [];
      if (Math.abs(u) > 0.25) keys.push(u > 0 ? 's' : 'w');
      if (Math.abs(v) > 0.25) keys.push(v > 0 ? 'd' : 'a');
      for (const k of keys) await p.keyboard.down(k);
      await sleep(Math.min(260, 60 + Math.hypot(dx, dy) * 80));
      for (const k of keys) await p.keyboard.up(k);
      if (last && Math.hypot(q[0] - last[0], q[1] - last[1]) < 0.02) { if (++stuck > 8) { log('  ! yürüme takıldı', q, '→', [x, y]); return false; } } else stuck = 0;
      last = q;
    }
    return true;
  };
  const waitFor = async (fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(fn, arg)) return true; await handleScreens(); await sleep(250); } return false; };
  /* --- arayüzden alım --- */
  const openTab = async (t, sub) => {
    if (await introOn()) throw new Error('INTRO');
    for (let k = 0; k < 4; k++) { const h = await handleScreens(); if (!h.length) break; await sleep(250); }
    const cur = await p.evaluate(() => { const on = document.querySelector('.dtab.on'); return on ? on.dataset.t : null; });
    if (cur !== t) { await p.click('.dtab[data-t="' + t + '"]'); await sleep(200); }
    else { await p.click('.dtab[data-t="' + t + '"]'); await sleep(150); await p.click('.dtab[data-t="' + t + '"]'); await sleep(200); }
    if (sub) { await p.click('#dpSub button[data-s="' + sub + '"]'); await sleep(200); }
  };
  const introOn = () => p.evaluate(() => !document.getElementById('introScr').classList.contains('hidden'));
  const closeBar = async () => { if (await introOn()) return; await handleScreens(); await sleep(150); await handleScreens(); if (await p.isVisible('#dpClose')) { await p.click('#dpClose'); await sleep(150); } };
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#dpCards .dcard')].map((d, i) => ({ i, t: (d.querySelector('b') || {}).textContent || '', s: (d.querySelector('small') || {}).textContent || '', btn: (d.querySelector('.buy') || {}).textContent || '', cls: (d.querySelector('.buy') || {}).className || '' })));
  const clickCard = async (i, twice = true) => {
    const c0 = await p.evaluate(() => BT.S.cash);
    await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), i); await sleep(180);
    const cf = await p.evaluate(() => !!document.querySelector('#dpCards .buy.cf'));
    if (cf && twice) { await p.evaluate(() => document.querySelector('#dpCards .buy.cf').click()); await sleep(180); }
    return c0 - await p.evaluate(() => BT.S.cash);
  };
  /* bir sekmede alınabilir (yeşil) kartları sırayla al; filtre kartın başlığına uygulanır */
  const buyAll = async (tab, sub, filt, maxN = 40) => {
    let n = 0;
    for (let k = 0; k < maxN; k++) {
      await openTab(tab, sub);
      const cs = await cards();
      const c = cs.find(c => !/no|done/.test(c.cls) && /\$/.test(c.btn) && (!filt || (typeof filt === 'function' ? filt(c.t) : filt.test(c.t))));
      if (!c) break;
      const spent = await clickCard(c.i);
      if (spent <= 0) { log('  ! alım olmadı:', tab, sub || '', c.t, c.btn); break; }
      n++; log('  + ' + tab + (sub ? '/' + sub : '') + ': ' + c.t.trim() + ' (' + Math.round(spent) + ')');
    }
    await closeBar(); return n;
  };
  const chapter = () => p.evaluate(() => { const c = BT.chapter(); return { d: c.d, n: c.n, g: c.g.map(g => g.t.slice(0, 14) + ' ' + g.d + '/' + g.n) }; });
  const invariants = () => p.evaluate(() => {
    const bad = [];
    const f = (v, n) => { if (typeof v !== 'number' || !isFinite(v) || v < 0) bad.push(n + '=' + v); };
    f(BT.S.cash, 'cash'); f(BT.S.rep, 'rep'); f(BT.S.caught, 'caught');
    BT.workers.forEach((w, i) => { if (!isFinite(w.x) || !isFinite(w.y)) bad.push('w' + i + ' pos'); });
    BT.customers.forEach((c, i) => { if (!isFinite(c.x) || !isFinite(c.y)) bad.push('c' + i + ' pos'); if (c.state === 'wait' && c.c && c.ord.f !== c.c.fish) bad.push('order≠stall ' + c.c.key); });
    BT.counters.forEach(c => { if (c.buffer.some(i => i.f !== c.fish)) bad.push('karışık tezgâh ' + c.key); });
    return bad;
  });
  /* bir günü oyna (otomasyon çalışırken) — gün sonu ekranlarını tıklar, takılma izler */
  const playDay = async (label, maxMs = 150000) => {
    const d0 = await p.evaluate(() => BT.day.n); const s0 = await st();
    await p.evaluate(() => { if (BT.day.phase === 'play') BT.day.t = Math.max(BT.day.t, BT.DAY_LEN - 75); });
    const t0 = Date.now(); let seen = [];
    while (Date.now() - t0 < maxMs) {
      const h = await handleScreens(); if (h.length) seen = seen.concat(h);
      if (await p.evaluate(d0 => BT.day.n > d0 && BT.day.phase === 'play', d0)) break;
      await sleep(400);
    }
    const s1 = await st(); const bad = await invariants();
    log('  ☀ ' + label + ': gün ' + s0.day + '→' + s1.day + ' para ' + s0.cash + '→' + s1.cash + ' satış +' + (s1.served - s0.served) + ' kayıp +' + (s1.lost - s0.lost) + ' ' + seen.join(',') + (bad.length ? ' BAD:' + bad.join(';') : ''));
    return s1;
  };

  /* ================= BAŞLANGIÇ ================= */
  await p.goto(process.env.URL || 'http://localhost:8099/index.html'); await sleep(1000);
  await shot('intro');
  await p.click('#introSkip'); await sleep(300); await shot('menu');
  await p.click('#playBtn'); await sleep(300); await p.click('#slotRows .sb[data-n="1"]'); await sleep(300);
  await p.fill('#heroName', 'Recai'); await shot('hero'); await p.click('#heroGo'); await sleep(300);
  await p.fill('#nameIn', 'Recai Balıkçılık'); await p.click('#nameGo'); await sleep(300);
  await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  await shot('start'); log('başlangıç', await st());

  /* ================= A) ELLE OYNA ================= */
  const W0 = await p.evaluate(() => ({ net: [BT.spots[0].x, BT.spots[0].y + 0.9], table: [BT.tables[0].x - 0.2, BT.tables[0].y + 0.3], mat: [BT.tables[0].mat.x, BT.tables[0].mat.y], ctr: [BT.counters[0].x - 0.9, BT.counters[0].y + 0.3], tray: [BT.counters[0].tray.x, BT.counters[0].tray.y], safe: [BT.safe.x, BT.safe.y] }));
  for (let round = 0; round < 4; round++) {
    await walkTo(...W0.net); await waitFor(() => BT.player.carry.length >= 6 || BT.spots[0].stock.length === 0, 6000);
    const got = await p.evaluate(() => BT.player.carry.length);
    await walkTo(...W0.table); await waitFor(() => BT.player.carry.length === 0, 4000);
    await waitFor(() => BT.tables[0].mat.items.length >= 3, 12000);
    await walkTo(...W0.mat); await waitFor(() => BT.tables[0].mat.items.length === 0 || BT.player.carry.length >= 8, 5000);
    await walkTo(...W0.ctr, 0.6); await waitFor(() => BT.player.carry.length === 0, 5000);
    await handleScreens();
    await sleep(6000);
    await walkTo(...W0.tray, 0.5); await sleep(700);
    await walkTo(...W0.safe, 0.6); await sleep(700);
    const s = await st(); log('el turu ' + (round + 1) + ': ağdan ' + got + ' •', s);
    if (round === 1) await shot('manual');
  }
  const manual = await st();
  if (manual.served < 1) log('!! BUG? elle oynarken hiç satış olmadı');

  /* ================= B) BÜYÜME ================= */
  const give = async (cash, rep) => { await p.evaluate(([c, r]) => { BT.S.cash += c; BT.S.rep = Math.max(BT.S.rep, r); }, [cash, rep]); await sleep(1400); await handleScreens(); };
  const hireZone = async (z) => {
    for (const role of ['hamal', 'filetocu', 'tezgahtar', 'kasiyer']) {
      const have = await p.evaluate(([z, r]) => BT.workers.some(w => w.zone === z && w.role === r), [z, role]);
      if (have) continue;
      await openTab('level');
      const cs = await cards(); const zc = cs.find(c => new RegExp(['İskelesi', 'Pazarı', 'Fümehane'][z]).test(c.t) && /personeli/.test(c.t));
      if (!zc) { log('  ! bölge personel kartı yok z' + z); break; }
      await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), zc.i); await sleep(200);
      const rc = (await cards()).find(c => c.t.includes(['Hamal', 'Filetocu', 'Tezgâhtar', 'Tahsildar'][['hamal', 'filetocu', 'tezgahtar', 'kasiyer'].indexOf(role)]));
      if (!rc || /no/.test(rc.cls)) { log('  ! ' + role + ' alınamadı z' + z, rc && rc.btn); await closeBar(); break; }
      const sp = await clickCard(rc.i); log('  + personel z' + z + ' ' + role + ' (' + Math.round(sp) + ')');
    }
    await closeBar();
  };
  const hireMgr = async (z) => {
    await openTab('level');
    let cs = await cards(); const mc = cs.find(c => /Müdür gerekli/.test(c.t) && c.t.includes(['İskelesi', 'Pazarı', 'Fümehane'][z]));
    if (!mc) { log('  ! müdür kartı yok z' + z, cs.map(c => c.t).filter(t => /Müdür|Devret|OTOMAT/.test(t))); await closeBar(); return; }
    await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), mc.i); await sleep(250);
    cs = await cards(); log('  adaylar:', cs.slice(1).map(c => c.t + ' [' + c.s.split('•').slice(0, 2).join('|').trim() + ']'));
    const sp = await clickCard(1); log('  + müdür z' + z + ' (' + Math.round(sp) + ')', await p.evaluate(z => [BT.mgr(z) && BT.mgr(z).n, BT.zoneAuto(z)], z));
    await closeBar();
  };
  const buildSlots = async () => {
    for (let k = 0; k < 10; k++) {
      await openTab('build', 'dev');
      const cs = await cards(); const empty = cs.find(c => /Boş|Empty/.test(c.t) || /SEÇ/.test(c.btn) && !/Değiştir|REPLACE/i.test(c.btn));
      if (!empty) break;
      await p.evaluate(i => document.querySelectorAll('#dpCards .dcard')[i].querySelector('.buy').click(), empty.i); await sleep(200);
      const opts = (await cards()).filter(c => c.i > 0);
      const pickC = opts.find(c => /Tezgâh/.test(c.t) && !/no/.test(c.cls)) || opts.find(c => !/no|done/.test(c.cls) && /\$/.test(c.btn));
      if (!pickC) { log('  ! yapı noktasına bina seçilemedi', opts.map(c => c.t + ':' + c.btn)); break; }
      const sp = await clickCard(pickC.i); log('  + yapı noktası: ' + pickC.t + ' (' + Math.round(sp) + ')');
      if (sp <= 0) break;
    }
    await closeBar();
  };
  const investProject = async () => {
    for (let k = 0; k < 30; k++) {
      await openTab('proj');
      const btn = await p.evaluate(() => { const bs = [...document.querySelectorAll('#dpCards .dinv button')]; const b = bs[bs.length - 1]; if (!b) return null; b.click(); return b.textContent; });
      if (!btn) break;
      await sleep(150);
      if (await p.evaluate(() => BT.project.done)) { log('  + Kapalı Pazar tamamlandı'); break; }
    }
    await closeBar();
  };

  const UPG = t => !/personel|Müdür|Devret|OTOMAT|AÇIK TEZG|Füme/i.test(t);
  const stage = async (name, cash, rep, fn) => {
    log('\n=== ' + name + ' ===');
    await give(cash, rep);
    await fn();
    const c = await chapter(); log('  sayaç ' + c.d + '/' + c.n, c.g.join(' | '));
    if (await introOn()) return;
    await shot(name.replace(/\W+/g, '_').slice(0, 20));
  };

  await stage('Seviye 2 — Balık Pazarı', 2500, 12, async () => {
    await buyAll('area');
    const lv = await (async () => { await openTab('level'); const cs = await cards(); await closeBar(); return cs.map(c => c.t + ' | ' + c.btn); })();
    log('  YÜKSELT kartları:', lv);
    await buyAll('level', null, UPG, 4);
  });
  await playDay('gün A');
  await stage('Seviye 3 — Fümehane + personel', 12000, 32, async () => {
    await buyAll('area');
    await buyAll('build', 'meydan', /Kulübe|Hut/, 1);
    await hireZone(0);
    await buyAll('build', 'decor', /Çakıl/, 1);
  });
  await playDay('gün B');
  await stage('Seviye 4 — yükseltmeler + yapılar', 60000, 45, async () => {
    await buyAll('build', 'meydan', /Kulübe/, 2);
    await hireZone(0);
    await buyAll('build', 'up');
    await buildSlots();
    await buyAll('build', 'meydan', null, 6);
    await buyAll('level', null, /Füme Makinesi/, 2);
    await hireZone(1);
  });
  await playDay('gün C');
  await stage('Seviye 5 — müdürler', 60000, 65, async () => {
    await buyAll('build', 'meydan', null, 6);
    await hireZone(2);
    for (const z of [0, 1, 2]) await hireMgr(z);
    await buyAll('build', 'decor', null, 20);
  });
  /* kayıt/yükleme: sayfayı yenile, kayıtlı oyundan devam et */
  const before = await p.evaluate(() => ({ ch: BT.chapter().d, mgr: [0, 1, 2].map(z => BT.mgr(z) && BT.mgr(z).n), env: BT.envStage(), cash: Math.round(BT.S.cash), day: BT.day.n }));
  await p.evaluate(() => BT.save && BT.save());
  await p.reload(); await sleep(1200);
  if (await p.isVisible('#introSkip')) await p.click('#introSkip');
  await p.click('#playBtn'); await sleep(400);
  if (await p.isVisible('#slotScr')) { await p.click('#slotRows .sb[data-n="1"]'); await sleep(500); }
  if (await p.isVisible('#autoScr')) { await p.click('#autoOpts button[data-m="10"]'); await sleep(300); }
  await sleep(1200); await handleScreens();
  const after = await p.evaluate(() => ({ ch: BT.chapter().d, mgr: [0, 1, 2].map(z => BT.mgr(z) && BT.mgr(z).n), env: BT.envStage(), cash: Math.round(BT.S.cash), day: BT.day.n }));
  log('  💾 kayıt→yükleme', before, '→', after);
  if (JSON.stringify(before.mgr) !== JSON.stringify(after.mgr) || before.ch !== after.ch || before.env !== after.env) log('!! BUG: kayıt sonrası durum değişti');
  await shot('after-reload');
  await playDay('gün D (otomatik)');
  await playDay('gün E (otomatik)');
  await stage('Seviye 8 — her şey', 250000, 190, async () => { try {
    await buyAll('build', 'up');
    await buildSlots();
    await buyAll('build', 'decor', null, 20);
    await buyAll('level', null, UPG, 30);
    await buyAll('build', 'meydan', null, 8);
    await investProject();
    await buyAll('level', null, /Füme Makinesi/, 2);
    for (const z of [0, 1, 2]) if (!(await p.evaluate(z => BT.mgr(z), z))) { await hireZone(z); await hireMgr(z); }
  } catch (e) { if (e.message !== 'INTRO') throw e; log('  (sayaç doldu, gazete açıldı)'); } });
  let c = await chapter();
  if (c.d < c.n) {
    log('\n!! sayaç dolmadı: ' + c.d + '/' + c.n, c.g);
    const left = await p.evaluate(() => {
      const o = {};
      o.pads = BT.pads.filter(q => q.max && q.lvl < q.max).map(q => q.id + ' ' + q.lvl + '/' + q.max);
      o.slots = BT.slots.filter(s => !s.b).map(s => s.id);
      o.decor = BT.decor.filter(d => !d.got).map(d => d.id);
      o.areas = BT.areas.map(a => a.lvl);
      return o;
    });
    log('   eksikler', left);
  }
  if (!(await introOn())) await playDay('gün F');
  /* ================= C) BÖLÜM SONU ================= */
  const endT = Date.now();
  while (Date.now() - endT < 8000 && !(await p.isVisible('#introScr'))) await sleep(300);
  if (await p.isVisible('#introScr')) {
    log('\n=== BÖLÜM SONU: gazete ===');
    await sleep(3200); await shot('end-paper1');
    const tap = async () => { if (await introOn()) await p.mouse.click(215, 700); await sleep(400); };   /* gazete pointerdown dinler */
    await tap(); await tap(); await sleep(3000); await shot('end-paper2');
    for (let k = 0; k < 6 && await introOn(); k++) await tap();
    await sleep(1200); await shot('end-card');
    log('kart:', await p.evaluate(() => document.getElementById('chEnd').innerText.replace(/\s+/g, ' ')));
    await p.click('#chEndGo'); await sleep(1500); await shot('after-end');
    log('bitiş sonrası', await st(), await p.evaluate(() => ({ paused: BT.paused(), ch1: BT.S.ch1 })));
    await playDay('bölüm sonrası gün');
  } else log('!! gazete kapanışı açılmadı');
  log('\nHATALAR', [...new Set(errs)]);
  require('fs').writeFileSync(SC + 'log.txt', LOG.join('\n'));
  await b.close();
})();
