/* v2.12 — veri izni ve skor tablosu kullanıcı içeriği (KVKK aydınlatma + App Store 1.2 / Google Play UGC):
   1) çevrimiçiyken "YENİ OYUN"a basınca ayrıntılı veri izni kartı çıkar; kabul edilmeden HİÇBİR istek gitmez;
   2) kartta neyin gittiği / gitmediği, Almanya (yurt dışı aktarım), 24 ay, silme hakkı ve kurallar yazar;
      gizlilik ve kurallar sayfaları kartın üstünde açılır;
   3) "ÇEVRİMDIŞI OYNA" → oyun başlar, sunucuya hiçbir şey gitmez, tablo yereldir ve katılma düğmesi çıkar;
      karar kaydedilir, yeniden açılışta kart tekrar sorulmaz; Ayarlar'dan kart yeniden açılıp kabul edilebilir;
   4) kabul edince gönderim başlar; skor tablosunda başkasının satırında ⋮ var;
   5) "Bildir ve gizle" → bt_report, satır kaybolur; "Yalnız gizle" sunucuya gitmez; "N oyuncu gizli · göster" geri getirir;
   6) çevrimdışı (boş config) iken kart hiç çıkmaz. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const TOP = [
  { id: 'run-aaaa01', n: 'Deniz Kızı AŞ', h: 'Ayşe', s: 900, m: 5000, d: 9, p: 3600 },
  { id: 'run-bbbb02', n: 'Kötü Ad Ltd', h: 'X', s: 700, m: 4000, d: 7, p: 3000 },
  { id: 'run-cccc03', n: 'Mavi Ağ', h: 'Ali', s: 500, m: 3000, d: 5, p: 2000 }
];
const vis = (p, id) => p.evaluate(i => !document.getElementById(i).classList.contains('hidden'), id);
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
  await p.click('#introSkip'); await p.click('#playBtn'); await sleep(300);
  /* 1–2) kart */
  R.card = await vis(p, 'consentScr');
  R.slotsHidden = !(await vis(p, 'slotScr').catch(() => false));
  const body = await p.evaluate(() => document.getElementById('cnsBody').textContent);
  R.bodyOk = ['herkese açık', 'şletme adı', 'rastgele oyuncu kimliği', 'e-posta', 'Almanya', 'yurt dışı aktarım', '24 ay', 'Çevrimiçi verilerimi sil', 'Topluluk Kuralları', 'küfür', 'hiçbir şey gönderilmez'].filter(w => !body.toLowerCase().includes(w.toLowerCase()));
  ok(R.card && !R.bodyOk.length, 'veri izni kartı eksik ' + JSON.stringify(R));
  ok(calls.length === 0, 'onaydan önce istek gitti ' + JSON.stringify(calls.map(c => c[0])));
  await p.click('#cnsPriv'); await sleep(400);
  R.privTop = await p.evaluate(() => !document.getElementById('privScr').classList.contains('hidden') && document.getElementById('privFrame').src.includes('privacy.html'));
  await p.click('#privClose'); await sleep(200);
  await p.click('#cnsTerms'); await sleep(400);
  R.termsTop = await p.evaluate(() => document.getElementById('privFrame').src.includes('terms.html'));
  await p.click('#privClose'); await sleep(200);
  ok(R.privTop && R.termsTop, 'gizlilik/kurallar sayfası açılmadı');
  /* 3) çevrimdışı oyna */
  await p.click('#cnsNo'); await sleep(300);
  await p.click('#slotRows .sb[data-n="1"]'); await p.click('#heroGo'); await p.fill('#nameIn', 'Sessiz Liman'); await p.click('#nameGo'); await sleep(300);
  await p.click('#autoOpts button[data-m="10"]').catch(() => {}); await sleep(800);
  R.offStarted = await p.evaluate(() => BT.S.started && BT.terms().consent === -1);
  await p.evaluate(() => { BT.S.caught += 30; BT.submitScore(true); }); await sleep(400);
  await p.evaluate(() => BT.ui.openPauseMenu()); await sleep(200); await p.click('#menuBoard'); await sleep(700);
  R.offCalls = calls.length;
  R.joinBtn = await p.isVisible('#boardCns');
  R.offMore = await p.evaluate(() => document.querySelectorAll('#boardRows .bmore').length);
  ok(R.offStarted && R.offCalls === 0 && R.joinBtn && R.offMore === 0, 'çevrimdışı seçimi yanlış ' + JSON.stringify(R) + JSON.stringify(calls.map(c => c[0])));
  await p.click('#boardClose').catch(() => {}); await sleep(200);
  await p.evaluate(() => BT.saveNow()); await p.reload(); await sleep(900);
  if (await vis(p, 'introScr')) await p.click('#introSkip');
  await p.click('#playBtn'); await sleep(400);
  R.notAgain = !(await vis(p, 'consentScr'));
  await p.click('#autoOpts button[data-m="10"]').catch(() => {}); await sleep(500);
  ok(R.notAgain && calls.length === 0, 'karar hatırlanmadı ' + JSON.stringify([R.notAgain, calls.length]));
  /* Ayarlar'dan kabul */
  await p.evaluate(() => BT.ui.openPauseMenu()); await sleep(200);
  await p.click('#menuSet'); await sleep(300);
  R.setLbl = await p.evaluate(() => document.getElementById('onlineFixed').textContent);
  await p.click('#termsBtn'); await sleep(300);
  R.state = await p.evaluate(() => document.getElementById('cnsState').textContent);
  await p.click('#cnsYes'); await sleep(700);
  R.onCalls = calls.map(c => c[0]);
  R.setLbl2 = await p.evaluate(() => document.getElementById('onlineFixed').textContent);
  ok(/KAPALI/.test(R.setLbl) && /ÇEVRİMDIŞI/.test(R.state) && R.onCalls.includes('bt_play') && R.onCalls.includes('bt_submit') && /AÇIK/.test(R.setLbl2), 'ayarlardan kabul çalışmadı ' + JSON.stringify(R));
  await p.click('#setClose').catch(() => {}); await sleep(200);
  /* 4–5) skor tablosu */
  await p.evaluate(() => BT.ui.openPauseMenu()); await sleep(200); await p.click('#menuBoard'); await sleep(700);
  R.board = await p.evaluate(() => ({ rows: document.querySelectorAll('#boardRows .brow').length, more: document.querySelectorAll('#boardRows .bmore').length, join: !!document.getElementById('boardCns') }));
  ok(R.board.rows >= 3 && R.board.more === 3 && !R.board.join, 'satır menüsü yok ' + JSON.stringify(R.board));
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
  R.saved = await p.evaluate(() => BT.terms().hidden);
  await p.click('#boardUnhide'); await sleep(600);
  R.back = await p.evaluate(() => document.querySelectorAll('#boardRows .bmore').length);
  ok(R.saved.length === 2 && R.back === 3, 'gizlenenler geri gelmedi ' + JSON.stringify([R.saved, R.back]));
  await ctx.close();
  /* 6) çevrimdışı sürüm: kart yok */
  const p2 = await b.newPage({ viewport: { width: 430, height: 860 } });
  await p2.goto(URL); await sleep(900);
  await p2.click('#introSkip'); await p2.click('#playBtn'); await sleep(300);
  R.offCard = await vis(p2, 'consentScr');
  ok(!R.offCard, 'çevrimdışı sürümde veri izni kartı çıktı');
  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'UGC_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: veri izni + skor tablosu kuralları/bildir/gizle testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
