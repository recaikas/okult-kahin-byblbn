/* v1.9 ilk açılış + ilerleme olayları (sahte Supabase):
   1) ilk açılışta önce dil seçimi; seçim → doğrudan gazete hikâyesi (kapı yok) → atla → ana menü seçilen dilde;
      yeniden açılışta dil sorulmaz;
   2) yeni oyun: 'oyun' olayı hemen gider (bilgilendirme menüde); eğitim adımı geçilince 'tut1' gider, tebrik yazısı çıkar,
      hedef yazısında canlı ilerleme var; kaydet → yeniden aç → aynı olay ikinci kez gitmez. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const SC = process.env.SC || '/tmp';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const errs = [], calls = [];
  const ctx = await b.newContext({ viewport: { width: 400, height: 780 }, deviceScaleFactor: 2, locale: 'tr-TR' });
  await ctx.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };" }));
  await ctx.route('https://sahte.supabase.co/**', r => {
    const name = r.request().url().split('/rpc/')[1]; calls.push({ name, body: JSON.parse(r.request().postData() || '{}') });
    r.fulfill({ contentType: 'application/json', body: name === 'bt_board' ? '{"top":[],"me":null,"stats":{}}' : '"ok"' });
  });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  const vis = id => p.evaluate(i => { const e = document.getElementById(i); return !!e && !e.classList.contains('hidden'); }, id);
  await p.goto(URL); await sleep(900);
  /* 1) dil seçimi */
  const lp = await p.evaluate(() => ({ lp: !document.getElementById('langPick').classList.contains('hidden'), intro: !document.getElementById('introScr').classList.contains('hidden'),
    start: !document.getElementById('startScreen').classList.contains('hidden'), sug: [...document.querySelectorAll('#langPick button.sug')].map(b => b.dataset.l) }));
  ok(lp.lp && !lp.intro && !lp.start && lp.sug.join() === 'tr', 'ilk açılışta dil seçimi yok ' + JSON.stringify(lp));
  await p.screenshot({ path: SC + '/v19-dilsecimi.png' });
  await p.click('#langPick button[data-l="en"]'); await sleep(600);
  const st = await p.evaluate(() => ({ lp: !document.getElementById('langPick').classList.contains('hidden'), intro: !document.getElementById('introScr').classList.contains('hidden'),
    gate: !document.getElementById('introGate').classList.contains('hidden'), lang: BT.lang ? BT.lang() : null, skip: document.getElementById('introSkip').textContent }));
  ok(!st.lp && st.intro && !st.gate && /SKIP/i.test(st.skip), 'dil seçimi hikâyeyi başlatmadı ' + JSON.stringify(st));
  await p.click('#introSkip'); await sleep(400);
  ok(await vis('startScreen') && /NEW GAME/i.test(await p.evaluate(() => document.getElementById('playBtn').textContent)), 'hikâyeden sonra İngilizce ana menü yok');
  await p.reload(); await sleep(900);
  ok(!(await vis('langPick')), 'yeniden açılışta dil tekrar soruldu');
  if (await vis('introScr')) await p.click('#introSkip');
  await p.evaluate(() => BT.setLang('tr')); await sleep(100);
  /* 2) yeni oyun + ilerleme olayları + eğitim rehberi */
  await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Rehber Limanı'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(700);
  ok(await p.evaluate(() => document.getElementById('askScr').classList.contains('hidden')), 'açılışta bilgilendirme penceresi çıktı');
  await sleep(700);
  const ev1 = calls.filter(c => c.name === 'bt_event').map(c => c.body.p_ev);
  ok(ev1.includes('oyun'), "'oyun' olayı gitmedi " + JSON.stringify(ev1));
  const o0 = await p.evaluate(() => document.getElementById('objText').textContent);
  ok(/Ağın yanında|Sandığın üstünden/.test(o0), 'eğitim hedefi görünmüyor: ' + o0);
  await p.screenshot({ path: SC + '/v19-rehber.png' });
  let tut1 = false; for (let i = 0; i < 40 && !tut1; i++) { await sleep(500); tut1 = calls.some(c => c.name === 'bt_event' && c.body.p_ev === 'tut1'); }
  const t1 = await p.evaluate(() => ({ toast: document.getElementById('toast').textContent, obj: document.getElementById('objText').textContent, evs: BT.evs() }));
  ok(tut1 && /Balık birikti/.test(t1.toast) && t1.evs.includes('tut1'), 'eğitim adımı olayı/tebriki yok ' + JSON.stringify(t1));
  const e = calls.find(c => c.name === 'bt_event' && c.body.p_ev === 'tut1');
  ok(e && e.body.p_player === await p.evaluate(() => BT.pid()) && e.body.p_run && e.body.p_day === 1 && typeof e.body.p_play === 'number', 'olay argümanları yanlış ' + JSON.stringify(e));
  /* rehber: oyuncuyu hedeften uzaklaştır → ekran kenarında ok çizilir (görsel kontrol için ekran görüntüsü) */
  await p.keyboard.down('d'); await sleep(2500); await p.keyboard.up('d'); await sleep(300);
  await p.screenshot({ path: SC + '/v19-kenarok.png' });
  /* kaydet → yeniden aç → devam: aynı olay tekrar gitmez */
  await p.evaluate(() => BT.saveNow()); const nOyun = calls.filter(c => c.body && c.body.p_ev === 'oyun').length;
  await p.reload(); await sleep(900);
  if (await vis('introScr')) await p.click('#introSkip');
  await p.click('#playBtn'); await sleep(900);
  if (await p.isVisible('#autoOpts')) { await p.click('#autoOpts button[data-m="10"]'); await sleep(400); }
  ok(calls.filter(c => c.body && c.body.p_ev === 'oyun').length === nOyun && (await p.evaluate(() => BT.evs())).includes('tut1'), 'devam edince olay tekrarlandı / kayıtta yok');
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ lp, st, ev: calls.filter(c => c.name === 'bt_event').map(c => c.body.p_ev), o0, toast: t1.toast }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: ilk açılış + ilerleme olayları testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
