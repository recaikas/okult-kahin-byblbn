/* Mağaza gizlilik şartları (sahte Supabase ile):
   1) açılışta oturum sayacı (bt_play) gider; Ayarlar › Çevrimiçi skor tablosu › KAPALI iken hiçbir istek gitmez
      (zorunlu gönderimde bile), tercih kalıcıdır;
   2) Skor kaydımı sil → onay → bt_forget eski anonim kimlikle çağrılır, cihazdaki liste temizlenir, kimlik yenilenir;
   3) Gizlilik politikası oyun içinde açılır (oyun duraklar), TR/EN metin yüklü, geri tuşu/Escape ile kapanır. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const calls = [];
  await p.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };" }));
  await p.route('https://sahte.supabase.co/**', async r => {
    const name = r.request().url().split('/rpc/')[1], body = JSON.parse(r.request().postData() || '{}'); calls.push({ name, body });
    const reply = name === 'bt_board' ? { top: [], me: null, stats: {} } : name === 'bt_forget' ? 3 : 'ok';
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(reply) });
  });
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Gizli Liman'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
  ok(calls.some(c => c.name === 'bt_play'), 'açılış sayacı gitmedi ' + JSON.stringify(calls.map(c => c.name)));
  /* 1) paylaşımı kapat */
  await p.evaluate(() => { document.getElementById('menuBtn').click(); }); await sleep(200);
  await p.click('#menuSet'); await sleep(200);
  const lbl = await p.evaluate(() => [document.getElementById('setOnline').textContent, document.getElementById('forgetBtn').textContent, document.getElementById('privBtn').textContent]);
  ok(lbl[0] === 'ÇEVRİMİÇİ SKOR TABLOSU' && /SİL/.test(lbl[1]) && /GİZLİLİK/.test(lbl[2]), 'ayar etiketleri yok ' + JSON.stringify(lbl));
  await p.click('#onlineSeg button[data-o="0"]'); await sleep(200);
  const n0 = calls.length;
  await p.evaluate(() => { BT.S.caught = 99; BT.submitScore(true); }); await sleep(400);
  ok(calls.length === n0, 'paylaşım kapalıyken istek gitti ' + JSON.stringify(calls.slice(n0)));
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_pref')).onl) === 0, 'tercih kaydedilmedi');
  await p.click('#onlineSeg button[data-o="1"]'); await sleep(200);
  await p.evaluate(() => { BT.S.caught = 120; BT.submitScore(true); }); await sleep(400);
  ok(calls.some(c => c.name === 'bt_submit' && c.body.p_fish === 120), 'paylaşım açılınca skor gitmedi');
  /* 2) skor kaydımı sil */
  const pid0 = await p.evaluate(() => BT.pid());
  ok(!!(await p.evaluate(() => localStorage.getItem('balikci_board_v2'))), 'cihaz içi liste boş başladı');
  await p.click('#forgetBtn'); await sleep(200);
  await p.click('#askYes'); await sleep(500);
  const f = calls.find(c => c.name === 'bt_forget');
  const after = await p.evaluate(() => ({ pid: BT.pid(), board: localStorage.getItem('balikci_board_v2'), stored: localStorage.getItem('balikci_pid') }));
  ok(f && f.body.p_player === pid0, 'bt_forget eski kimlikle çağrılmadı ' + JSON.stringify(f));
  ok(after.pid !== pid0 && after.stored === after.pid && !after.board, 'yerel temizlik/yeni kimlik yok ' + JSON.stringify(after));
  /* inceleme bulgusu: silinen veri bir sonraki gönderimde geri gelmemeli (paylaşım kapanır, bu oyun yeni kimlik alır) */
  const nF = calls.length;
  const af = await p.evaluate(() => { BT.S.caught = 500; BT.submitScore(true); return { onl: BT.onlineOK(), run: BT.S.runId }; }); await sleep(400);
  ok(af.onl === false && calls.length === nF, 'silmeden sonra skor yeniden gönderildi ' + JSON.stringify({ af, yeni: calls.slice(nF).map(c => c.name) }));
  /* 3) gizlilik politikası */
  await p.click('#privBtn'); await sleep(700);
  const pv = await p.evaluate(() => ({ open: !document.getElementById('privScr').classList.contains('hidden'), paused: BT.paused(),
    text: (document.getElementById('privFrame').contentDocument || {}).body ? document.getElementById('privFrame').contentDocument.body.innerText : '' }));
  ok(pv.open && pv.paused && /Çevrimiçi skor tablosu/.test(pv.text) && /Online leaderboard/.test(pv.text), 'gizlilik politikası açılmadı ' + JSON.stringify({ open: pv.open, paused: pv.paused, len: pv.text.length }));
  await p.keyboard.press('Escape'); await sleep(200);
  ok(await p.evaluate(() => document.getElementById('privScr').classList.contains('hidden') && !document.getElementById('settingsScreen').classList.contains('hidden')), 'Escape gizlilik penceresini kapatmadı (ayarlar açık kalmalı)');
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ calls: calls.map(c => c.name), pid0, after: { pid: after.pid } }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: gizlilik testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
