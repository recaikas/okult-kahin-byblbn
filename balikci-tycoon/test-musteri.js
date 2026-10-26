/* v2.25 — yeni müşteri kıyafetleri (baston, forma çizgisi, taç, maske, kılıç, çekiç, klavye, altın eldiven…):
   1) her yeni sokak müşterisi (_s/_m/_k, fan_*) ve her parodi konuk (p_*) klasik + ince çizicide, iki yöne,
      dört yüz ifadesiyle, yürürken/dururken hatasız çizilir;
   2) oyunda gerçekten doğurulup iki modda kareler boyunca çizilir (sanat kancası hata uyarısı yok);
   3) pickSpecials günde 3 özel müşteri seçer, 3.'sü parodi konuk (p_);
   4) SHOTS=1 ile ince + klasik kontakt sayfası screenshots/v225/ altına yazılır. */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], warns = [], R = {}, fail = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push('PE: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('C: ' + m.text()); if (m.type() === 'warning' && /HKA\./.test(m.text())) warns.push(m.text()); });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);

  /* 1) doğrudan çizim: hata yutulmadan (drawOutfitOn hatayı yutar; burada kancalar elle çağrılır) */
  R.draw = await p.evaluate(() => {
    const V = HKG.v, CUST = V('CUST'), custOutfit = V('custOutfit');
    const types = CUST.filter(t => /_(s|m|k)$/.test(t.id) || /^fan_/.test(t.id));
    const pars = BT.SPECIALS.filter(s => s.par);
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 160;
    const g = cv.getContext('2d'), bad = [];
    const NEW = ['cane', 'stripes', 'crown', 'mask', 'maskEye', 'maskFace', 'eyeC', 'facePaint', 'sword', 'gauntlet', 'hammer', 'keyboard'];
    const used = {};
    const looks = types.map(t => ({ id: t.id, o: () => custOutfit({ type: t, tone: 1, hair: 0, face: 1, hs: 0, ht: 2 }) }))
      .concat(pars.map(s => ({ id: s.id, o: () => BT.specOutfit(s.id, 1) })));
    let n = 0;
    looks.forEach(L => {
      const base = L.o();
      NEW.forEach(k => { if (base[k]) used[k] = (used[k] || 0) + 1; });
      [1, -1].forEach(face => [undefined, 0.1, 0.4, 0.9].forEach(mood => [0, 1].forEach(walk => [0, 2.3].forEach(bob => {
        const o = Object.assign({}, base, { face, mood, walk: !!walk });
        const a = { x: 0, y: 0, z: 0, vx: walk ? 0.3 : 0, vy: 0, bob, act: 0, carry: [] };
        try { HKG.withCtx(g, 1, () => { g.setTransform(1, 0, 0, 1, 80, 150); HKG.plain('drawPerson', a, o); }); n++; } catch (e) { bad.push(L.id + ' klasik: ' + e.message); }
        try { HKG.withCtx(g, 2, () => { g.setTransform(2, 0, 0, 2, 80, 150); if (HKA.drawPerson(a, o) === false) throw new Error('kanca false'); }); n++; } catch (e) { bad.push(L.id + ' ince: ' + e.message); }
      }))));
    });
    return { nTypes: types.length, nPar: pars.length, n, bad: bad.slice(0, 10), nBad: bad.length, used, ids: looks.map(l => l.id) };
  });
  ok(R.draw.nTypes === 62, 'yeni sokak müşterisi sayısı ' + R.draw.nTypes);
  ok(R.draw.nPar === 21, 'parodi konuk sayısı ' + R.draw.nPar);
  ok(!R.draw.nBad, 'çizim hatası: ' + JSON.stringify(R.draw.bad));
  ['cane', 'stripes', 'crown', 'mask', 'maskEye', 'maskFace', 'eyeC', 'facePaint', 'sword', 'gauntlet', 'hammer', 'keyboard'].forEach(k => ok(R.draw.used[k] > 0, 'kullanılmayan özellik ' + k));

  /* 2) oyunda doğur: iki modda birkaç kare çiz; kanca uyarısı / sayfa hatası olmasın */
  const live = fine => p.evaluate(async fine => {
    HKG.setFine(fine);
    const V = HKG.v, CUST = V('CUST'), mk = V('mkCustomer'), mof = V('makeOrderFor'), qp = V('queueSlotPos'), cs = BT.customers, c = BT.counters[0];
    const types = CUST.filter(t => /_(s|m|k)$/.test(t.id) || /^fan_/.test(t.id));
    const pars = BT.SPECIALS.filter(s => s.par), specType = V('specType');
    const list = types.map(t => [t, null]).concat(pars.map(s => [specType(s), s]));
    const seen = new Set();   /* drawCustomer her karede bekleyen müşterinin cu.fidget'ını ilerletir (iki modda da) */
    let made = 0;
    const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const slot = c.slots.indexOf(null) >= 0 ? c.slots.indexOf(null) : 0;
    for (let i = 0; i < list.length; i += 4) {
      const batch = [];
      for (let j = i; j < Math.min(i + 4, list.length); j++) {
        const [t, sp] = list[j], free = c.slots.indexOf(null); if (free < 0) break;
        const ord = mof(c, t) || { k: 'fileto', f: c.fish || 'hamsi', need: 2, got: 0 };
        const cu = mk(c, t, free, ord, sp); made++;
        const q = qp(c, free); cu.x = q.x; cu.y = q.y; cu.state = 'wait'; cu._t = sp ? sp.id : t.id; cu.pat = cu.patMax = 9999;
        cu.face = j & 1 ? 1 : -1; batch.push(cu);
      }
      BT.player.x = batch[0] ? batch[0].x - 1 : BT.player.x; BT.player.y = batch[0] ? batch[0].y : BT.player.y;
      await frame(); await frame();
      batch.forEach(cu => { if (cu.fidget > 0) seen.add(cu._t); const k = cs.indexOf(cu); if (k >= 0) cs.splice(k, 1); const s = c.slots.indexOf(cu); if (s >= 0) c.slots[s] = null; });
    }
    void slot;
    return { made, seen: seen.size, miss: list.map(([t, sp]) => sp ? sp.id : t.id).filter(id => !seen.has(id)).slice(0, 8), K: HKG.K, artErr: Object.keys(V('_artErr') || {}) };
  }, fine);
  R.liveFine = await live(true);
  R.liveClassic = await live(false);
  await p.evaluate(() => HKG.setFine(true));
  ok(R.liveFine.made === 83 && R.liveFine.K === 2 && R.liveFine.seen >= 80, 'ince modda oyunda çizilmedi ' + JSON.stringify(R.liveFine));
  ok(R.liveClassic.made === 83 && R.liveClassic.K === 1 && R.liveClassic.seen >= 80, 'klasik modda oyunda çizilmedi ' + JSON.stringify(R.liveClassic));
  ok(!R.liveFine.artErr.length && !warns.length, 'sanat kancası hata verdi ' + JSON.stringify([R.liveFine.artErr, warns.slice(0, 3)]));

  /* 3) günde 3 özel müşteri, 3.'sü parodi konuk */
  R.pick = await p.evaluate(() => {
    const pick = HKG.v('pickSpecials'), out = [];
    for (let i = 0; i < 12; i++) { HKG.day.n = (HKG.day.n || 1) + 1; pick(); out.push(HKG.day.spec.slice()); }
    return out;
  });
  ok(R.pick.every(s => s.length === 3 && /^p_/.test(s[2]) && !/^p_/.test(s[0]) && !/^p_/.test(s[1])), 'günlük özel müşteriler ' + JSON.stringify(R.pick.slice(0, 3)));
  ok(new Set(R.pick.map(s => s[2])).size >= 10, 'parodi konuklar dönmüyor ' + JSON.stringify(R.pick.map(s => s[2])));

  /* 4) kontakt sayfası (isteğe bağlı) */
  if (process.env.SHOTS) {
    const dir = 'screenshots/v225'; fs.mkdirSync(dir, { recursive: true });
    for (const fine of [true, false]) {
      await p.evaluate(fine => {
        const V = HKG.v, CUST = V('CUST'), custOutfit = V('custOutfit');
        const types = CUST.filter(t => /_(s|m|k)$/.test(t.id) || /^fan_/.test(t.id));
        const looks = types.map(t => ({ id: t.id, o: custOutfit({ type: t, tone: 1, hair: 0, face: 1, hs: 0, ht: 2 }) }))
          .concat(BT.SPECIALS.filter(s => s.par).map(s => ({ id: s.id, o: BT.specOutfit(s.id, 1) })));
        const Z = 5, CW = 34, CH = 66, COLS = 12, rows = Math.ceil(looks.length / COLS);
        const cv = document.createElement('canvas'); cv.id = 'sheet'; cv.width = COLS * CW * Z; cv.height = rows * CH * Z;
        cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#5d7f6a';
        const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
        g.fillStyle = '#6f8f78'; g.fillRect(0, 0, cv.width, cv.height);
        looks.forEach((L, i) => {
          const cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * CH;
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = (i + Math.floor(i / COLS)) & 1 ? '#7a9a82' : '#6f8f78'; g.fillRect(cx * Z, cy * Z, CW * Z, CH * Z);
          const o = Object.assign({}, L.o, { face: i % 2 ? -1 : 1, mood: 0.9 });
          const a = { x: 0, y: 0, z: 0, vx: 0, vy: 0, bob: 0, act: 0, carry: [] };
          HKG.withCtx(g, fine ? 2 : 1, () => {
            g.setTransform(Z, 0, 0, Z, (cx + CW / 2) * Z, (cy + CH - 9) * Z);
            if (fine) HKA.drawPerson(a, o); else HKG.plain('drawPerson', a, o);
          });
          g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#10181c'; g.font = 'bold 22px monospace'; g.textAlign = 'center';
          g.fillText(L.id, (cx + CW / 2) * Z, (cy + CH - 2) * Z);
        });
        document.body.appendChild(cv);
      }, fine);
      const el = await p.$('#sheet'), box = await el.boundingBox();
      await p.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
      await el.screenshot({ path: `${dir}/musteri-${fine ? 'ince' : 'klasik'}.png` });
      await p.evaluate(() => document.getElementById('sheet').remove());
      await p.setViewportSize({ width: 430, height: 860 });
    }
  }

  console.log(JSON.stringify({ draw: { n: R.draw.n, used: R.draw.used }, liveFine: R.liveFine, liveClassic: R.liveClassic, pick: R.pick.slice(0, 3) }));
  console.log(errs.length ? 'ERRORS: ' + errs.slice(0, 5).join(' | ') : 'no page errors');
  ok(!errs.length, 'sayfa hatası');
  console.log(fail.length ? 'FAIL:\n - ' + fail.join('\n - ') : 'PASS');
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
