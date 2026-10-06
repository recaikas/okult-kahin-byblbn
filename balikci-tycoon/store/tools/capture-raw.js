/* Ham oyun görüntüleri: 6 sahne × TR/EN, 440×956 @3x = 1320×2868 (iPhone 6.9").
   Önce oyun klasörünü 8099'da sun: python3 -m http.server 8099   →   node store/tools/capture-raw.js */
const { chromium, openGame, richCove, sleep } = require('./scene');
const fs = require('fs'), path = require('path');
const OUT = path.resolve(__dirname, '..', 'raw');
const look = (p, x, y) => p.evaluate(([x, y]) => { BT.player.x = x; BT.player.y = y; BT.player.carry.length = 0; }, [x, y]);
const zoom = (p, z) => p.evaluate(z => { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); document.getElementById('settingsScreen').classList.add('hidden'); }, z);
const clean = p => p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); } }); BT.syncPause && BT.syncPause(); });
(async () => {
  const b = await chromium.launch();
  for (const lang of ['tr', 'en']) {
    const dir = path.join(OUT, lang); fs.mkdirSync(dir, { recursive: true });
    const { ctx, p } = await openGame(b, lang, { width: 440, height: 956 }, 3);
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await zoom(p, 3);
    await richCove(p, 35);
    const shot = async name => { await clean(p); await sleep(400); await p.screenshot({ path: path.join(dir, name + '.png') }); console.log(lang, name); };
    /* 1) liman: iskele + pazar, kalabalık */
    await look(p, 6.5, 4.5); await sleep(2500); await shot('1-harbor');
    /* 2) özel müşteri kendini tanıtıyor */
    await p.evaluate(() => {
      BT.S.names = BT.S.names.filter(id => id !== 'temel'); BT.S.jobs = (BT.S.jobs || []).filter(id => id !== 'temel');
      const c = BT.counters[0]; c.slots.fill(null); BT.customers.forEach(q => { if (q.c === c) q.state = 'leave'; });
      BT.day.spec = ['temel', 'caner']; BT.spawnSpecial(0);
      const cu = BT.customers.find(q => q.spec === 'temel'); const qp = { x: c.x, y: c.y }; cu.state = 'wait'; cu.sayT = 1.5; cu.x = 10.8; cu.y = c.y + 0.1;
    });
    await look(p, 9.8, 2.6); await sleep(2200); await shot('2-special');
    /* 3) mutfak bölgesi */
    await look(p, 6.4, 20.4); await sleep(3000); await shot('3-kitchen');
    /* 4) tezgâh paneli: ayrıntı açık */
    await look(p, 6.5, 4.5); await sleep(1500);
    await p.click('#stallBtn'); await sleep(500);
    await p.evaluate(() => { const r = document.querySelectorAll('#stallRows .srow'); if (r[1]) r[1].click(); });
    await sleep(600); await p.screenshot({ path: path.join(dir, '4-stalls.png') }); console.log(lang, '4-stalls');
    await p.click('#stallGo').catch(() => {}); await sleep(300);
    /* 5) müşteri defteri: bir kısmı tanışılmış */
    await p.evaluate(() => {
      const S = BT.S; BT.SPECIALS.forEach((s, i) => { if (i % 3 !== 2 && !s.hidden) { S.met.push(s.id); if (i % 3 === 0) { S.names.push(s.id); S.jobs.push(s.id); } else if (i % 2) S.jobs.push(s.id); } });
      BT.CUST.forEach((t, i) => { if (i % 4 !== 3) S.custSeen[t.id] = 3 + i; });
      BT.openCustBook();
    });
    await sleep(600);
    await p.evaluate(() => { const c = [...document.querySelectorAll('#custGrid .cc.ok')][0]; if (c) c.click(); });
    await sleep(300); await p.screenshot({ path: path.join(dir, '5-book.png') }); console.log(lang, '5-book');
    await p.click('#custGo').catch(() => {}); await sleep(300);
    /* 6) hikâye ara sahnesi: Şahmeran */
    await p.evaluate(l => { HK_STORY.open(8, { lang: l, ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] }); }, lang);
    await sleep(2600);
    for (let i = 0; i < 3; i++) { await p.evaluate(() => HK_STORY._tap()); await sleep(250); await p.evaluate(() => HK_STORY._tap()); await sleep(900); }
    await sleep(1800); await p.screenshot({ path: path.join(dir, '6-story.png') }); console.log(lang, '6-story');
    await p.evaluate(() => HK_STORY.close());
    if (errs.length) console.log('HATA', errs);
    await ctx.close();
  }
  await b.close();
})();
