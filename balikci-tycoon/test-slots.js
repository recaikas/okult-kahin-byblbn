/* Kayıt slotları + Kaydet-Çık + Yeni Oyun kabul testi. Üç ortamda koşar:
   plain (normal sayfa), sandbox (claude.ai gibi: allow-modals YOK → confirm() yok sayılır),
   nostore (depolama tamamen kapalı). Yerel sunucu: npx http-server -p 8099 -s */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://localhost:8099/';
const ENVS = [['plain', 'index.html'], ['sandbox', 'test-sandbox.html'], ['nostore', 'test-sandbox-nostore.html']];
(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  const all = {}; let bad = 0;
  for (const [name, url] of ENVS) {
    const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
    const p = await ctx.newPage();
    const errs = [], fail = [], R = {};
    const ok = (c, m) => { if (!c) fail.push(m); };
    p.on('pageerror', e => errs.push('PE ' + e.message));
    p.on('dialog', d => { errs.push('DIALOG ' + d.message()); d.dismiss(); });
    await p.goto(BASE + url); await sleep(1300);
    const F = () => name === 'plain' ? p.mainFrame() : p.frames()[1];
    const f = F();
    const vis = id => f.evaluate(id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }, id);
    const closeStall = () => f.evaluate(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); });
    const quit = async () => { await closeStall(); await f.click('#menuBtn'); await sleep(150); await f.click('#menuSet'); await sleep(150); await f.click('#saveQuitBtn'); await sleep(400); };
    const newIn = async (slot, co) => {
      await f.click(`#slotRows .sb[data-n="${slot}"]`); await sleep(250);
      if (await vis('askScr')) { R['ask' + slot] = await f.textContent('#askMsg'); await f.click('#askYes'); await sleep(250); }
      if (await vis('introScr')) { await f.click('#introSkip'); await sleep(200); }
      await f.fill('#nameIn', co); await f.click('#nameGo'); await sleep(900); await closeStall();
    };
    R.persistent = await f.evaluate(() => BT.persistent());
    ok(await vis('introScr'), 'ilk açılışta hikâye yok');
    await f.click('#introSkip'); await sleep(200);
    R.play0 = await f.textContent('#playBtn');
    ok(/YENİ OYUN/.test(R.play0) && !(await vis('loadBtn')), 'boş menü yanlış');
    /* 1) yeni oyun → slot 1 */
    await f.click('#playBtn'); await sleep(200);
    ok(await vis('slotScr'), 'slot ekranı açılmadı');
    await newIn(1, 'Hasan Balıkçılık');
    R.g1 = await f.evaluate(() => ({ s: BT.S.started, co: BT.S.company, slot: BT.slot() }));
    ok(R.g1.s && R.g1.slot === 1 && R.g1.co === 'Hasan Balıkçılık', 'slot 1 oyunu başlamadı');
    await f.evaluate(() => { BT.S.cash = 777; BT.S.rep = 12; });
    /* 2) kaydet ve çık → devam */
    await quit();
    R.q1 = { start: await vis('startScreen'), play: await f.textContent('#playBtn'), info: await f.textContent('#saveInfo'), started: await f.evaluate(() => BT.S.started) };
    ok(R.q1.start && !R.q1.started && /DEVAM/.test(R.q1.play) && /Hasan/.test(R.q1.info), 'kaydet-çık menüye dönmedi / kayıt yok');
    await f.click('#playBtn'); await sleep(500);
    R.c1 = await f.evaluate(() => ({ s: BT.S.started, cash: Math.round(BT.S.cash), co: BT.S.company }));
    ok(R.c1.s && R.c1.cash >= 700 && R.c1.co === 'Hasan Balıkçılık', 'devam et kaydı yüklemedi');
    await quit();
    /* 3) yeni oyun → slot 2 temiz dünya */
    await f.click('#newBtn'); await sleep(200);
    await newIn(2, 'Özcan Mutfak');
    R.g2 = await f.evaluate(() => ({ s: BT.S.started, co: BT.S.company, slot: BT.slot(), cash: BT.S.cash, rep: BT.S.rep, day: BT.day.n, z1: BT.areas[1].locked, w: BT.workers.length }));
    ok(R.g2.s && R.g2.slot === 2 && R.g2.cash === 0 && R.g2.rep === 0 && R.g2.day === 1 && R.g2.z1, 'slot 2 temiz başlamadı');
    await quit();
    /* 4) kayıtlı oyunlar → slot 1 yükle */
    await f.click('#loadBtn'); await sleep(200);
    R.list = await f.$$eval('#slotRows .slot', a => a.map(x => x.textContent));
    await f.click('#slotRows .sb[data-a="load"][data-n="1"]'); await sleep(600);
    R.l1 = await f.evaluate(() => ({ s: BT.S.started, co: BT.S.company, cash: Math.round(BT.S.cash), slot: BT.slot() }));
    ok(R.l1.s && R.l1.co === 'Hasan Balıkçılık' && R.l1.cash >= 700 && R.l1.slot === 1, 'slot 1 yüklenmedi');
    await quit();
    /* 5) dolu slotun üzerine yeni oyun (oyun içi onay) */
    await f.click('#newBtn'); await sleep(200);
    await newIn(1, 'Temel Reis');
    R.o1 = await f.evaluate(() => ({ co: BT.S.company, cash: BT.S.cash, slot: BT.slot() }));
    ok(R.ask1 && R.o1.co === 'Temel Reis' && R.o1.cash === 0 && R.o1.slot === 1, 'üzerine yazma çalışmadı');
    await quit();
    /* 6) slot silme */
    await f.click('#loadBtn'); await sleep(200);
    await f.click('#slotRows .sb[data-a="del"][data-n="2"]'); await sleep(200);
    ok(await vis('askScr'), 'silme onayı yok'); await f.click('#askYes'); await sleep(300);
    R.after = await f.evaluate(() => BT.saveSlots().map(m => m && m.co));
    ok(R.after[0] === 'Temel Reis' && !R.after[1] && !R.after[2], 'silme yanlış: ' + JSON.stringify(R.after));
    /* 7) yenile: kalıcı ortamda slotlar korunur */
    if (R.persistent) {
      await p.reload(); await sleep(1300);
      const f2 = F();
      R.reload = await f2.evaluate(() => ({ slots: BT.saveSlots().map(m => m && m.co), intro: !document.getElementById('introScr').classList.contains('hidden'), play: document.getElementById('playBtn').textContent }));
      ok(R.reload.slots[0] === 'Temel Reis' && !R.reload.intro && /DEVAM/.test(R.reload.play), 'yenileyince kayıt kayboldu');
    } else {
      R.warn = await f.textContent('#saveInfo');
      ok(/kalıcı kayda izin vermiyor/.test(R.warn), 'depolama uyarısı yok');
    }
    ok(!errs.length, 'hata: ' + errs.join(' | '));
    all[name] = { fail, R };
    bad += fail.length;
    await ctx.close();
  }
  /* 8) eski tek kayıt → slot 1 göçü */
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  await ctx.addInitScript(() => { if (!localStorage.getItem('__mig')) { localStorage.setItem('__mig', '1'); localStorage.setItem('balikci_tycoon_v3', JSON.stringify({ v: 5, lang: 'tr', cash: 4242, rep: 7, company: 'Eski Kayıt', runId: 'oldrun123', day: [3, 10, 0], at: Date.now() })); } });
  const p = await ctx.newPage(); await p.goto(BASE + 'index.html'); await sleep(1200);
  const mig = await p.evaluate(() => ({ slots: BT.saveSlots().map(m => m && m.co), old: localStorage.getItem('balikci_tycoon_v3'), play: document.getElementById('playBtn').textContent, cash: BT.S.cash }));
  const migOk = mig.slots[0] === 'Eski Kayıt' && !mig.old && /DEVAM/.test(mig.play) && mig.cash === 4242;
  all.migrate = { ok: migOk, mig }; if (!migOk) bad++;
  await b.close();
  console.log(JSON.stringify(all, null, 1));
  console.log(bad ? 'SLOTS_FAIL' : 'SLOTS_OK');
  process.exit(bad ? 1 : 0);
})();
