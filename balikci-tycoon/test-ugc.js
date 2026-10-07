/* v2.11 — skor tablosu kullanıcı içeriği (App Store 1.2 / Google Play UGC):
   1) çevrimiçiyken ad ekranında Topluluk Kuralları onay kutusu; işaretlenmeden oyun başlamaz;
   2) onaydan sonra kutu bir daha çıkmaz; kurallar sayfası açılır (terms.html);
   3) skor tablosunda başkasının satırında ⋮ var, kendi satırında yok;
   4) "Bildir ve gizle" → bt_report çağrılır, satır bu cihazda kaybolur; "Yalnız gizle" sunucuya gitmez;
   5) "N oyuncu gizli · göster" gizlenenleri geri getirir; onaysız eski oyuncunun skoru sunucuya gitmez;
   6) çevrimdışı (boş config) iken onay kutusu hiç görünmez. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const TOP = [
  { id: 'run-aaaa01', n: 'Deniz Kızı AŞ', h: 'Ayşe', s: 900, m: 5000, d: 9, p: 3600 },
  { id: 'run-bbbb02', n: 'Kötü Ad Ltd', h: 'X', s: 700, m: 4000, d: 7, p: 3000 },
  { id: 'run-cccc03', n: 'Mavi Ağ', h: 'Ali', s: 500, m: 3000, d: 5, p: 2000 }
];
(async () => {
  const b = await chromium.launch(); const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  const ctx = await b.newContext({ viewport: { width: 430, height: 860 } });
  const p = await ctx.newPage(); const errs = [], calls = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };" }));
  await p.route('https://sahte.supabase.co/**', r => {
    const fn = r.request().url().split('/rpc/')[1]; let body = {};
    try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) { }
    calls.push([fn, body]);
    if (fn === 'bt_board') return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ top: TOP, me: null, stats: { players: 3, plays: 9, hours: 2 } }) });
    r.fulfill({ contentType: 'application/json', body: '"ok"' });
  });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo');
  R.row = await p.evaluate(() => !document.getElementById('termsRow').classList.contains('hidden'));
  await p.click('#nameGo'); await sleep(300);
  R.blocked = await p.evaluate(() => !document.getElementById('nameScr').classList.contains('hidden'));
  ok(R.row && R.blocked, 'onaysız oyun başladı ' + JSON.stringify(R));
  await p.click('#termsLink'); await sleep(400);
  R.termsPage = await p.evaluate(() => (document.getElementById('privFrame').src || '').includes('terms.html'));
  await p.click('#privClose'); await sleep(200);
  ok(R.termsPage, 'kurallar sayfası açılmadı');
  await p.check('#termsChk'); await p.click('#nameGo'); await sleep(400);
  await p.click('#autoOpts button[data-m="10"]').catch(() => {}); await sleep(500);
  R.started = await p.evaluate(() => BT.S.started && BT.terms().ok);
  ok(R.started, 'onaydan sonra oyun başlamadı');
  /* skor tablosu */
  await p.evaluate(() => BT.ui.openPauseMenu()); await sleep(200); await p.click('#menuBoard'); await sleep(700);
  R.board = await p.evaluate(() => ({ rows: document.querySelectorAll('#boardRows .brow').length, more: document.querySelectorAll('#boardRows .bmore').length }));
  ok(R.board.rows >= 3 && R.board.more === 3, 'satır menüsü yok ' + JSON.stringify(R.board));
  await p.click('#boardRows .bmore[data-id="run-bbbb02"]'); await sleep(200);
  R.repName = await p.evaluate(() => document.getElementById('repName').textContent);
  await p.click('#repGo'); await sleep(500);
  R.rep = calls.filter(c => c[0] === 'bt_report').map(c => c[1]);
  R.after = await p.evaluate(() => [...document.querySelectorAll('#boardRows .brow .bn')].map(e => e.textContent));
  ok(R.repName === 'Kötü Ad Ltd' && R.rep.length === 1 && R.rep[0].p_run === 'run-bbbb02' && R.rep[0].p_player && !R.after.some(t => /Kötü Ad/.test(t)), 'bildir çalışmadı ' + JSON.stringify(R));
  await p.click('#boardRows .bmore[data-id="run-cccc03"]'); await sleep(200); await p.click('#repHide'); await sleep(500);
  R.hideOnly = calls.filter(c => c[0] === 'bt_report').length;
  R.hidN = await p.evaluate(() => (document.getElementById('boardUnhide') || {}).textContent || '');
  ok(R.hideOnly === 1 && /2 oyuncu gizli/.test(R.hidN), 'yalnız gizle yanlış ' + JSON.stringify([R.hideOnly, R.hidN]));
  /* kalıcı: sayfa yenilenince de gizli */
  R.saved = await p.evaluate(() => BT.terms().hidden);
  await p.click('#boardUnhide'); await sleep(600);
  R.back = await p.evaluate(() => document.querySelectorAll('#boardRows .bmore').length);
  ok(R.saved.length === 2 && R.back === 3, 'gizlenenler geri gelmedi ' + JSON.stringify([R.saved, R.back]));
  /* onaysız oyuncunun skoru gitmez */
  R.noSubmit = await p.evaluate(async () => { BT.setTerms(false); const n0 = 0; BT.submitScore(true); return true; });
  const subBefore = calls.filter(c => c[0] === 'bt_submit').length;
  await p.evaluate(() => { BT.S.caught += 50; BT.submitScore(true); }); await sleep(400);
  R.submitWhileNo = calls.filter(c => c[0] === 'bt_submit').length - subBefore;
  ok(R.submitWhileNo === 0, 'onaysız skor gönderildi');
  await ctx.close();
  /* çevrimdışı: kutu yok */
  const p2 = await b.newPage({ viewport: { width: 430, height: 860 } });
  await p2.goto(URL); await sleep(900);
  await p2.click('#introSkip'); await p2.click('#playBtn'); await p2.click('#slotRows .sb[data-n="1"]'); await p2.click('#heroGo');
  R.offRow = await p2.evaluate(() => document.getElementById('termsRow').classList.contains('hidden'));
  ok(R.offRow, 'çevrimdışında onay kutusu görünüyor');
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'UGC_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: skor tablosu kuralları/bildir/gizle testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
