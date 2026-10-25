/* v2.23.1 — işçi takılması (Tahsildar tezgâh/kasa tepsisi/füme kasası arasında kalıyordu):
   lokanta açıkken sıra şeridi (lokRoute inSE) iskele şeridini + Fümehane tepsisini (9,88; 16,55) kapsıyor, 2. bölge tahsildarı yol kenarına
   yönlendirilip iskele duvarında ileri-geri gidiyordu. Düzeltme: inSE yalnız iskele dışı; ayrıca işçi bekçisi (BT.watchN: 3 sn'de <0,5 ilerleyen işçi).
   Senaryolar (Emekçi Mod kapalı + açık): 3 bölge/lokanta kapalı, 4 bölge/lokanta açık. Her biri 3 oyun dakikası, tüm roller.
   Beklenen: bekçi hiç tetiklenmez, hiçbir işçi 5 sn'den uzun "yürümek isteyip yerinde" kalmaz, tepsilerdeki para toplanıp kasaya geçer.
   Kullanım: URL=http://localhost:8106/index.html node test-sikisma.js */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
(async () => {
  const b = await chromium.launch();
  const fail = [], errs = [];
  const ok = (c, m) => { if (!c) fail.push(m); };
  for (const sc of [{ zn: 3, lok: 0, emek: 0 }, { zn: 3, lok: 0, emek: 1 }, { zn: 4, lok: 1, emek: 0 }, { zn: 4, lok: 1, emek: 1 }]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(o => { window.HK_EMEK_OFF = o.emek ? 0 : 1; window.HK_LOK_OFF = o.lok ? 0 : 1; window.HK_LOK_OPEN = 1; window.HK_LOK_EVOFF = 1; }, sc);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(900);
    const r = await p.evaluate(sc => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; BT.achMute(true); S.cash = 5e6; S.rep = 400;
      BT.areas.forEach((a, i) => { a.locked = i >= (sc.lok ? 5 : sc.zn); a.lvl = 2; }); BT.rebuildCounters();
      BT.HUT.lvl = 5; BT.DEPOT.lvl = 3; BT.WHALL.built = true; BT.player.x = 12; BT.player.y = 6;
      const roles = sc.emek ? ['tezgahtar', 'balikci', 'filetocu', 'hamal', 'kasiyer'] : ['hamal', 'filetocu', 'tezgahtar', 'kasiyer'];
      for (let z = 0; z < sc.zn; z++) { roles.forEach(q => BT.hire(q, true, z)); S.mgr[z] = { n: 'Mdr' + z, a: 'value', b: 'pat', wage: 35, look: 0 }; }
      if (sc.zn > 3) BT.hire('asci', true, 3);
      ['depocu', 'depocu', 'sevkiyat', 'halhamal'].forEach(q => BT.hire(q, true, -1));
      const kas = BT.workers.filter(w => w.role === 'kasiyer');
      /* kasa tepsilerini doldur (müşteri akışı yine sürer) */
      const inj = () => BT.counters.forEach(c => { if (!BT.areas[c.z].locked && c.tray.items.length < 30) for (let q = 0; q < 6; q++) c.tray.items.push({ k: 'money', v: 25 }); });
      const dt = 0.033, st = new Map(); let t = 0, maxIdleWork = 0, worst = null;
      const sig = w => Math.round(w.x) + ',' + Math.round(w.y) + '|' + w.carry.length + '|' + BT.counters.filter(c => c.z === w.zone).map(c => c.tray.items.length).join('/');
      for (let s = 0; s < 180 / dt; s++) {
        if (s % 300 === 0) inj();
        BT.emek.step(dt, 1); t += dt;
        kas.forEach(w => {                                   /* tahsildar: işi varken 5 sn hiçbir şey değişmiyor mu? */
          const work = w.carry.some(i => i.k === 'money') || BT.counters.some(c => c.z === w.zone && c.tray.items.length);
          const g = sig(w), h = st.get(w) || { g: '', t: 0 };
          if (g !== h.g || !work) { h.g = g; h.t = t; }
          st.set(w, h);
          if (t - h.t > maxIdleWork) { maxIdleWork = t - h.t; worst = { z: w.zone, x: w.x, y: w.y, mode: w.mode }; }
        });
      }
      return { watch: BT.watchN(), maxIdleWork, worst, n: BT.workers.length };
    }, sc);
    const tag = JSON.stringify(sc) + ' ' + JSON.stringify(r);
    console.log(tag);
    ok(r.watch === 0, 'bekçi tetiklendi (takılan işçi) ' + tag);
    ok(r.maxIdleWork < 5, 'tahsildar işi varken 5 sn+ takıldı ' + tag);
    /* bekçi birim denemesi: duvara yaslanmış işçi 3 sn sonra iskele içine kayar */
    const u = await p.evaluate(() => {
      const w0 = BT.watchN(); BT.workers.length = 0; const w = BT.hire('hamal', true, 1); w.x = 9.6; w.y = 9; w.mvReq = 1;
      let n = 0; for (let i = 0; i < 100; i++) { w.mvReq = 1; BT.workerWatch(w, 0.05); n++; }
      return { x: w.x, y: w.y, watch: BT.watchN() - w0 };
    });
    ok(u.watch === 1 && u.x < 8, 'bekçi kurtarma ' + JSON.stringify(u));
    await ctx.close();
  }
  await b.close();
  if (errs.length) fail.push('sayfa hatası ' + errs.slice(0, 3).join(' | '));
  console.log(fail.length ? 'BAŞARISIZ:\n' + fail.join('\n') : 'test-sikisma: HEPSİ GEÇTİ');
  process.exit(fail.length ? 1 : 0);
})();
