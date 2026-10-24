/* v2.21 — gece testi bulgularının düzeltmeleri (BULGULAR.md / Hata Listesi PDF):
   A) lokanta: boş menüyle devredilmez; aşçı şartı alınabilen aşçı kadar; menüden çıkan fileto dolabı kilitlemez;
      şef garson elindeki paranın tamamını kasaya bırakır; Tedarikçi Hal'de kasayı sıfırlamaz; kapalı günde saz yevmiyesi yok
   B) arayüz: üst bardaki para kısaltılır (taşmaz), kart şeridi sekme değişince başa döner, gün kartında maaş/vergi/net satırı
   C) çevrimdışı gelir Mutfak'ı da sayar; saat ileri alma istismarı sınırlı
   Kullanım: URL=http://localhost:8106/index.html node test-gece.js */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8106/index.html';
(async () => {
  const b = await chromium.launch();
  const errs = [], fail = [], R = {};
  const ok = (c, m) => { if (!c) fail.push(m); };
  const page = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(o => { window.HK_LOK_OFF = 0; window.HK_LOK_OPEN = o.open ? 1 : 0; window.HK_LOK_EVOFF = 1; window.HK_TARIF_OFF = 0; window.HK_INSAAT_OFF = 1; window.HK_HELP_OFF = 1; }, o);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('PE: ' + e.message));
    return p;
  };
  const newGame = async p => {
    await p.goto(URL); await sleep(900);
    await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
    await p.evaluate(() => {
      const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 1e6; S.rep = 400; BT.achMute(true);
      BT.areas.forEach(a => { a.locked = false; }); BT.rebuildCounters();
      BT.counters.forEach(c => { BT.setStall(c.key, true); c.spawnT = 1e9; });
      BT.day.phase = 'play'; BT.day.t = 10; BT.customers.length = 0;
      document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    });
  };

  /* ===== A) lokanta ===== */
  {
    const p = await page(); await newGame(p);
    R.lok = await p.evaluate(() => {
      const L = BT.lok, q = BT.tarif.q(), o = {};
      BT.tarif.list.forEach(r => { if (!r.kitchen && q.known.indexOf(r.id) < 0) q.known.push(r.id); });
      BT.tarif.ing.forEach(g => { q.kiler[g.id] = 50; });
      L.buy('lok_tava');
      ['lk_asci', 'lk_garson', 'lk_bulasik', 'lk_sef', 'lk_komi'].forEach(r => L.hire(r));
      /* 1) boş menü: devredilmez */
      L.q().menu = [null, null, null, null, null];
      o.emptyChain = L.chain(); o.emptyAuto = L.setAuto(true);
      L.menuAdd('hamsitava'); o.fullChain = L.chain().ok;
      /* 2) iki ocak, Sv1'de en çok 1 aşçı → devir yine olur */
      L.buy('lok_izgara'); o.built = L.q().sl.filter(Boolean).length; o.cookMax = L.roleMax('lk_asci'); o.chain2 = L.chain();
      /* 3) menüden çıkan fileto dolabı kilitlemez */
      const lq = L.q(); lq.dolap = { hamsi: 12 }; L.menuDel('hamsitava'); L.menuAdd('orkinosizgara');
      BT.emek.step(0.1, 60);
      o.dolapAfter = JSON.stringify(lq.dolap); o.roomTon = L.dolapRoom ? L.dolapRoom('ton') : null;
      return o;
    });
    ok(!R.lok.emptyChain.ok && R.lok.emptyChain.miss.some(m => /menü|menu/.test(m)) && R.lok.emptyAuto === false, 'boş menüyle devredildi ' + JSON.stringify(R.lok));
    ok(R.lok.fullChain, 'menü dolunca devir şartı tutmadı ' + JSON.stringify(R.lok));
    ok(R.lok.built === 2 && R.lok.cookMax === 1 && R.lok.chain2.ok, 'Sv1 iki ocakta tek aşçıyla devir kilitli ' + JSON.stringify(R.lok.chain2));
    ok(!/hamsi/.test(R.lok.dolapAfter), 'menüden çıkan hamsi dolapta kaldı ' + R.lok.dolapAfter);
    /* 4) şef garson parayı tamamen bırakır */
    R.cash = await p.evaluate(() => {
      const L = BT.lok, o = {}, sef = L.crew('lk_sef')[0];
      sef.carry.length = 0; for (let i = 0; i < 5; i++) sef.carry.push({ k: 'money', v: 10 });
      const t = L.R.t[0]; t.pay.length = 0;
      let dep = 0, n0 = 5;
      /* kasaya yürürken masaya yeni para düşer: eskiden şef tek para bırakıp masaya dönüyordu */
      for (let i = 0; i < 600; i++) {
        BT.emek.step(0.05, 1); BT.day.phase = 'play'; BT.day.t = 50;
        const n = sef.carry.filter(it => it.k === 'money').length;
        if (n < n0 && !t.pay.length) t.pay.push({ k: 'money', v: 10 });
        if (!n) { dep = 1; o.tablePay = t.pay.length; break; }
      }
      o.emptied = dep;
      return o;
    });
    ok(R.cash.emptied && R.cash.tablePay === 1, 'şef garson parayı kasaya bırakmadı ' + JSON.stringify(R.cash));
    /* 5) Tedarikçi rezervi */
    R.sup = await p.evaluate(() => {
      const L = BT.lok; BT.S.cash = 800;
      const w = L.crew('lk_komi')[0]; const list = L.halList(w); const spend = list.reduce((a, e) => a + e.p, 0);
      return { spend: spend, left: 800 - spend };
    });
    ok(R.sup.left >= 300, 'Tedarikçi kasayı yedeksiz harcıyor ' + JSON.stringify(R.sup));
    await p.context().close();
  }

  /* ===== B) arayüz ===== */
  {
    const p = await page(); await newGame(p);
    R.hud = {};
    for (const v of [1330740, 25000000, 1234567890]) {
      R.hud[v] = await p.evaluate(v => {
        BT.S.cash = v; BT.syncHUD && BT.syncHUD();
        const m = document.getElementById('money'), chip = m.closest('.chip') || m.parentElement;
        return { txt: m.textContent, over: m.scrollWidth > m.clientWidth + 1 || chip.scrollWidth > chip.clientWidth + 1 };
      }, v);
      await sleep(250);
      R.hud[v] = await p.evaluate(() => { const m = document.getElementById('money'), chip = m.closest('.chip') || m.parentElement; return { txt: m.textContent, over: m.scrollWidth > m.clientWidth + 1 || chip.scrollWidth > chip.clientWidth + 1 }; });
    }
    ok(Object.values(R.hud).every(h => !h.over && h.txt.length <= 8), 'üst bar parası taşıyor ' + JSON.stringify(R.hud));
    /* kart şeridi: YÜKSELT'te sona kaydır → YAPI başta açılır */
    await p.click('.dtab[data-t="build"]'); await sleep(250);
    R.strip = await p.evaluate(() => { const c = document.getElementById('dpCards'); c.scrollLeft = c.scrollWidth; return c.scrollLeft; });
    await p.click('.dtab[data-t="staff"]').catch(() => {}); await sleep(250);
    R.strip2 = await p.evaluate(() => document.getElementById('dpCards').scrollLeft);
    ok(R.strip > 50 && R.strip2 === 0, 'sekme değişince kart şeridi başa dönmedi ' + [R.strip, R.strip2]);
    R.touch = await p.evaluate(() => {
      const c = document.getElementById('dpClose'), r = c.getBoundingClientRect(), a = getComputedStyle(c, '::after');
      const hit = document.elementFromPoint(r.left - 6, r.top + r.height / 2);
      return { w: Math.round(r.width), hitOk: hit === c, dtab: Math.round(document.querySelector('.dtab').getBoundingClientRect().height) };
    });
    ok(R.touch.hitOk && R.touch.dtab >= 44, 'dokunma hedefi küçük ' + JSON.stringify(R.touch));
    await p.click('#dpClose').catch(() => {});
    /* gün kartı: maaş + vergi + net + bekleyen */
    R.card = await p.evaluate(() => {
      BT.hire('tezgahtar', true, 0); BT.S.cash = 50000;
      BT.day.st.inc = 2000; BT.day.st.wage = 300; BT.day.st.tax = 120; BT.day.spec = null; BT.day.sp = 0;
      BT.customers.length = 0; BT.endDay(); return 1;
    });
    let txt = '';
    for (let i = 0; i < 200 && !txt; i++) { txt = await p.evaluate(() => { const e = document.getElementById('dayScr'); return e.classList.contains('hidden') ? '' : e.innerText.replace(/\s+/g, ' '); }); if (!txt) await sleep(300); }
    R.card = txt.slice(0, 500);
    ok(/Maaşlar/.test(txt) && /Vergi/.test(txt) && /Net/.test(txt), 'gün kartında maaş/vergi/net yok: ' + R.card);
    await p.evaluate(() => document.getElementById('dayGo').click()); await sleep(300);
    /* çevrimdışı: tüm bölgeler + oyun süresiyle sınır */
    R.off = await p.evaluate(() => {
      const o = {}; o.acc = BT.ret().acc.length; o.areas = BT.areas.length;
      BT.S.play = 100000; BT.S.retPlay = 100000 - 120;      /* son karttan beri 2 dk oynandı */
      BT.retSet(BT.areas.map(() => 500), 50000);
      const c = BT.retCompute(9 * 3600); o.sec = c.sec; o.capped = c.capped;
      BT.S.retPlay = 0; const c2 = BT.retCompute(9 * 3600); o.sec2 = c2.sec;
      return o;
    });
    ok(R.off.acc === R.off.areas, 'çevrimdışı sayaç bölge sayısı kadar değil ' + JSON.stringify(R.off));
    ok(R.off.sec <= 120 * 16 + 1 && R.off.capped && R.off.sec2 === 8 * 3600, 'saat ileri alma sınırı yok ' + JSON.stringify(R.off));
    await p.context().close();
  }

  console.log(JSON.stringify(R, null, 1));
  console.log(errs.length ? errs : 'konsol temiz');
  await b.close();
  if (fail.length || errs.length) { console.log('HATA:\n' + fail.concat(errs).join('\n')); process.exit(1); }
  console.log('GECE_OK');
})().catch(e => { console.error(e); process.exit(1); });
