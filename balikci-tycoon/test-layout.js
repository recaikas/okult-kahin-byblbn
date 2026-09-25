/* v1.3.2 — "her şeyin bir yeri var, hiçbir şey üst üste gelmez":
   1) zeminde: tezgâh, tepsi, füme makinesi, ağ, masa, yapı noktası, Kapalı Pazar, parseller, müdür masası,
      lamba, çöp, kasa, süs — hiçbir ayak izi başka bir nesneninkine değmez (0.1 karo pay);
   2) ekranda: Hizmet Sahası binaları (en üst seviyede bile) birbirinin önüne/arkasına düşmez, Kapalı Pazar ana
      tezgâhın tentesiyle çakışmaz; 3) bölge tabelası ayrı nesne değil, ana tezgâhın tentesinde;
   4) her parselin önünde yürünebilir zemin var; 5) her şey kurulu hâlde sahne hatasız çizilir. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = (process.env.SC || require('os').tmpdir()) + '/'; const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);

  const r = await p.evaluate(() => {
    const out = {};
    out.clash = BT.layoutClashes(0.1);
    out.decor = BT.decorClearance().filter(d => !d.ok).map(d => d.id);
    out.serv = BT.servValidate();
    /* parsel çiftleri: ekranda ya yan yana (|Δu|) ya da tamamen alt alta (|Δv|) */
    const P = BT.PLOTS, bad = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const du = Math.abs((P[i].x - P[i].y) - (P[j].x - P[j].y)), dv = Math.abs((P[i].x + P[i].y) - (P[j].x + P[j].y));
      if (du < 3.7 && dv < 11.5) bad.push(P[i].id + '/' + P[j].id + ' du=' + du.toFixed(1) + ' dv=' + dv.toFixed(1));
    }
    out.plotScreen = bad;
    const Y = BT.SERVYARD;
    out.inYard = P.filter(q => q.x - 1 < Y.x0 || q.x + 1 > Y.x1 || q.y - 1 < Y.y0 || q.y + 1 > Y.y1).map(q => q.id);
    out.reach = P.filter(q => !BT.canStand(q.x, q.y + 1.4) && !BT.canStand(q.x - 1.4, q.y)).map(q => q.id);
    /* Kapalı Pazar'ın sol kenarı ana tezgâhın (b1) tentesinin sağında kalmalı (ekran u = x - y) */
    const pr = BT.project, pazarLeft = (pr.x - pr.w / 2) - (pr.y + pr.h / 2), awnRight = (8.9 - 10.4) + 14 / 12;
    out.pazar = { pazarLeft: +pazarLeft.toFixed(2), awnRight: +awnRight.toFixed(2) };
    out.noSignObj = typeof BT.AREA_SIGNS === 'undefined' && !BT.layoutRects().some(q => q.id.startsWith('tabela'));
    return out;
  });
  ok(r.clash.length === 0, 'zemin çakışması: ' + r.clash.join(', '));
  ok(r.decor.length === 0, 'süs mesafesi: ' + r.decor.join(', '));
  ok(r.serv.length === 0, 'parsel doğrulama: ' + r.serv.join(', '));
  ok(r.plotScreen.length === 0, 'saha binaları ekranda üst üste: ' + r.plotScreen.join(' | '));
  ok(r.inYard.length === 0, 'saha dışında parsel: ' + r.inYard.join(','));
  ok(r.reach.length === 0, 'önüne yürünemeyen parsel: ' + r.reach.join(','));
  ok(r.pazar.pazarLeft >= r.pazar.awnRight, 'Kapalı Pazar tezgâh tentesine biniyor ' + JSON.stringify(r.pazar));
  ok(r.noSignObj, 'bölge tabelası hâlâ ayrı nesne');

  /* her şey kurulu, en üst seviye: sahne çizilir, hata yok */
  await p.evaluate(() => {
    const S = BT.S; S.ctrl = 2; S.cash = 5e6; S.rep = 260; S.env = 3; S.fumeM = [1, 1, 0]; S.tut = 99;
    BT.areas.forEach(a => { a.locked = false; a.lvl = 3; }); BT.decor.forEach(d => d.got = true);
    const bl = { s1: 'cay', s2: 'depo', s3: 'tezgah', s4: 'cay', s5: 'tezgah', s6: 'tezgah', s7: 'vinc' }; BT.slots.forEach(s => s.b = bl[s.id]);
    BT.project.done = true; BT.project.stage = 5; BT.project.inv = BT.project.total;
    BT.HUT.lvl = 5; BT.DEPOT.lvl = 2; BT.WHALL.built = true;
    BT.rebuildCounters(); BT.counters.forEach(c => BT.setStall(c.key, true));
    BT.PLOTS.forEach(pl => { const id = pl.allow.find(a => !BT.PLOTS.some(q => q.b === a)); if (!id) return; BT.servBuild(id, pl.id); for (let k = 0; k < 4; k++) { try { BT.servUp(id); } catch (e) {} } });
    window.__ns = setInterval(() => { const s = document.getElementById('stallScr'); if (!s.classList.contains('hidden')) document.getElementById('stallGo').click(); }, 300);
  });
  await sleep(1500);
  const r2 = await p.evaluate(() => ({ clash: BT.layoutClashes(0.1), built: BT.PLOTS.filter(q => q.b).length }));
  ok(r2.clash.length === 0, 'her şey kuruluyken çakışma: ' + r2.clash.join(', '));
  ok(r2.built === 9, 'dokuz parsel kurulmadı: ' + r2.built);
  for (const [x, y, n] of [[4.5, 2.5, 'z0'], [6, 9, 'z1'], [5, 15, 'z2'], [19, 12, 'saha1'], [26, 19, 'saha2']]) {
    await p.evaluate(q => { BT.player.x = q[0]; BT.player.y = q[1]; }, [x, y]); await sleep(900);
    await p.screenshot({ path: SC + 'layout-' + n + '.png' });
  }
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ r, r2 }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: yerleşim testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
