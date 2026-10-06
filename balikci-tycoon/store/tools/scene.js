/* Mağaza görselleri için ortak sahne kurucu: oyunu açar, dolu ve canlı bir koy kurar.
   Kullanım: const { openGame, richCove } = require('./scene'); */
const { chromium } = require('../../test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
async function openGame(b, lang, vp, dsf, init) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: true, hasTouch: true });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });   /* tanıtım görüntüsünde rozet ve duraklatma yazısı olmasın */
  await p.evaluate(l => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; if (BT.setLang) BT.setLang(l); }, lang);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo');
  await p.fill('#nameIn', lang === 'en' ? 'Silver Net Co.' : 'Gümüş Ağ Balıkçılık').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  return { ctx, p };
}
/* bütün bölgeler açık, personel ve müdürler alınmış, süsler kurulu, kalabalık bir gün */
async function richCove(p, secs) {
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep((secs || 25) * 1000);
}
module.exports = { chromium, openGame, richCove, sleep };
