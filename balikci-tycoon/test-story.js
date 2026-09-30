/* v2.4 — Dipteki Söz: 12 günün her biri story.html'de açılır, diyaloglar geçilir, mini oyun oynanır (ya da atlanır),
   sonuç kartı çıkar ve onDone doğru sonuç nesnesiyle döner. Zincir: Gün 8 sözü, Gün 10 tut/boz, Gün 11–12 dalı. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = (process.env.URL || 'http://localhost:8099/index.html').replace(/index\.html.*$/, '');
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + 'story.html'); await sleep(500);
  /* bir günü sonuna kadar oynat: diyalog → tap; mini → etkileşim ya da atla; sonuç → Devam */
  async function run(n, opt) {
    await p.evaluate(([n, o]) => {
      window.__res = null;
      HK_STORY.open(n, { lang: o.lang || 'tr', ber: o.ber || 6, flags: o.flags || {}, kitchen: !!o.kitchen, onDone: r => { window.__res = r; } });
    }, [n, opt]);
    const seen = new Set(); let shots = 0;
    for (let k = 0; k < 1500; k++) {
      const st = await p.evaluate(() => ({ m: HK_STORY._mode(), open: HK_STORY.isOpen(), res: window.__res }));
      if (!st.open) break;
      seen.add(st.m);
      if (st.m === 'dlg') { await p.evaluate(() => HK_STORY._tap()); await sleep(opt.fast ? 20 : 60); }
      else if (st.m === 'mini') {
        if (SHOT && shots++ === 0) await p.screenshot({ path: `${SHOT}/d${n}-${opt.lang || 'tr'}-mini.png` });
        const pick = opt.pick;
        const clicked = await p.evaluate(i => { const o = document.querySelectorAll('#hkStory [data-k="mini"] .opt:not([disabled])'); if (o.length) { (o[Math.min(i || 0, o.length - 1)]).click(); return true; } return false; }, pick);
        if (!clicked) { if (opt.play) { await p.keyboard.press('Space'); await sleep(120); if (k % 40 === 39) await p.evaluate(() => HK_STORY._skip()); } else await p.evaluate(() => HK_STORY._skip()); }
        await sleep(80);
      }
      else if (st.m === 'result') {
        if (SHOT) await p.screenshot({ path: `${SHOT}/d${n}-${opt.lang || 'tr'}-res.png` });
        await p.click('#hkStory [data-r]'); await sleep(50);
      }
      else await sleep(100);
    }
    const r = await p.evaluate(() => window.__res);
    return { r, seen: [...seen] };
  }
  let flags = {}, ber = 6;
  for (let n = 1; n <= 12; n++) {
    const o = await run(n, { ber, flags, pick: n === 10 ? 0 : 0, play: n % 2 === 0, kitchen: n === 6 });
    ok(o.r && o.r.day === n && o.r.title, `gün ${n}: sonuç dönmedi ${JSON.stringify(o)}`);
    ok(o.seen.includes('dlg') && o.seen.includes('mini') && o.seen.includes('result'), `gün ${n}: akış eksik ${o.seen}`);
    if (o.r) {
      if (typeof o.r.berSet === 'number') ber = o.r.berSet; if (o.r.ber) ber += o.r.ber; ber = Math.max(3, Math.min(10, ber));
      if (o.r.flags) flags = Object.assign({}, flags, o.r.flags);
    }
    R['d' + n] = o.r && { rep: o.r.rep, ber, buffs: (o.r.buffs || []).map(x => x.id), items: o.r.items, pieces: o.r.pieces, fl: o.r.flags, sk: !!o.r.skipped };
  }
  ok(ber === 10 && flags.promise === 'kept' && flags.done, 'zincir sonu yanlış ' + JSON.stringify({ ber, flags }));
  /* bozulan söz dalı: Gün 11–12 telafi yoluyla biter, Bereket 8 */
  const br11 = await run(11, { ber: 5, flags: { promise: 'broken' }, fast: 1 });
  const br12 = await run(12, { ber: 5, flags: { promise: 'broken' }, fast: 1 });
  ok(br12.r && br12.r.berSet === 8, 'bozuk söz dalında gün 12 bereketi 8 değil ' + JSON.stringify(br12.r && br12.r.berSet));
  R.broken = { d11: br11.r && br11.r.rep, d12: br12.r && br12.r.berSet };
  /* İngilizce: her gün en az açılır, başlık ve ilk diyalog İngilizce */
  for (let n = 1; n <= 12; n++) {
    const o = await run(n, { lang: 'en', fast: 1, flags: n >= 11 ? { promise: 'kept' } : {} });
    ok(o.r && o.r.day === n, `EN gün ${n}: sonuç dönmedi`);
  }
  /* iyi oyuncu: her mini oyun kazanılabilir mi? (story-bot.js DOM üzerinden gerçek düğmelere basar) */
  await p.addScriptTag({ path: __dirname + '/story-bot.js' });
  R.bot = {};
  for (let n = 1; n <= 12; n++) {
    await p.evaluate(n => { window.__res = null; HK_STORY.open(n, { ber: 6, flags: { promise: 'kept' }, kitchen: true, onDone: r => { window.__res = r; } }); window.__storyBot(); }, n);
    for (let k = 0; k < 900; k++) {
      const st = await p.evaluate(() => ({ m: HK_STORY._mode(), open: HK_STORY.isOpen() }));
      if (!st.open) break;
      if (st.m === 'dlg') await p.evaluate(() => HK_STORY._tap());
      else if (st.m === 'result') await p.click('#hkStory [data-r]');
      await sleep(60);
    }
    const r = await p.evaluate(() => window.__res);
    R.bot[n] = r ? [r.r1 && r.r1.ok, r.r2 ? r.r2.ok : null, !!r.skipped] : null;
    ok(r && r.r1 && r.r1.ok && (!r.r2 || r.r2.ok) && !r.skipped, `gün ${n}: iyi oyuncu mini oyunu kazanamadı ${JSON.stringify(r && [r.r1, r.r2])}`);
  }
  const trLeft = await p.evaluate(() => !!document.getElementById('hkStory'));
  ok(!trLeft, 'hikâye kapanınca katman kalmış');
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'STORY_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: Dipteki Söz 12 gün testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
