/* Mağaza gizlilik şartları (sahte Supabase ile):
   0) v1.8 skor tablosu zorunlu: ilk oyunda tek düğmeli KVKK bilgilendirmesi; görülmeden istek gitmez, bir kez gösterilir,
      geri tuşuyla kapatmak da okundu sayılır; ayarlarda aç/kapa yok;
   2) Çevrimiçi verilerimi sil → bt_forget eski kimlikle; cihaz listesi temizlenir; yeni kimlikle gönderim sürer;
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
  /* 0) v1.8: skor tablosu zorunlu; ilk oyunda tek düğmeli KVKK bilgilendirmesi — görülmeden hiçbir istek gitmez */
  const q = await p.evaluate(() => ({ ask: !document.getElementById('askScr').classList.contains('hidden'), msg: document.getElementById('askMsg').textContent, yes: document.getElementById('askYes').textContent, noHidden: document.getElementById('askNo').classList.contains('hidden') }));
  ok(calls.length === 0, 'bilgilendirme görülmeden istek gitti ' + JSON.stringify(calls.map(c => c.name)));
  ok(q.ask && /Avrupa Birliği/.test(q.msg) && /herkese açık/.test(q.msg) && /Çevrimiçi verilerimi sil/.test(q.msg) && q.yes === 'TAMAM' && q.noHidden, 'bilgilendirme çıkmadı ' + JSON.stringify(q));
  await p.click('#askYes'); await sleep(500);
  ok(calls.some(c => c.name === 'bt_play') && calls.some(c => c.name === 'bt_submit'), 'bilgilendirmeden sonra gönderim başlamadı ' + JSON.stringify(calls.map(c => c.name)));
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_pref')).onn) === 1 && await p.evaluate(() => !document.getElementById('askNo').classList.contains('hidden')), 'bilgilendirme hatırlanmadı / HAYIR düğmesi gizli kaldı');
  await p.evaluate(() => { document.getElementById('menuBtn').click(); }); await sleep(200);
  await p.click('#menuBoard'); await sleep(300);
  ok(await p.evaluate(() => document.getElementById('askScr').classList.contains('hidden')), 'bilgilendirme ikinci kez çıktı');
  await p.evaluate(() => BT.back()); await sleep(200);
  await p.evaluate(() => { if (!document.getElementById('menuScreen').classList.contains('hidden')) BT.back(); }); await sleep(200);
  /* 1) ayarlarda aç/kapa yok; "her zaman açık" notu var */
  await p.evaluate(() => { document.getElementById('menuBtn').click(); }); await sleep(200);
  await p.click('#menuSet'); await sleep(200);
  const lbl = await p.evaluate(() => [document.getElementById('setOnline').textContent, document.getElementById('forgetBtn').textContent, document.getElementById('privBtn').textContent, document.getElementById('onlineFixed').textContent, !!document.getElementById('onlineSeg')]);
  ok(lbl[0] === 'ÇEVRİMİÇİ SKOR TABLOSU' && /SİL/.test(lbl[1]) && /GİZLİLİK/.test(lbl[2]) && /HER ZAMAN AÇIK/.test(lbl[3]) && !lbl[4], 'ayar etiketleri yanlış ' + JSON.stringify(lbl));
  await p.evaluate(() => { BT.S.caught = 120; BT.submitScore(true); }); await sleep(400);
  ok(calls.some(c => c.name === 'bt_submit' && c.body.p_fish === 120), 'skor gitmedi');
  /* 2) çevrimiçi verilerimi sil: eski kimlikle silinir, yeni kimlik; paylaşım sürer ve yeni kimlikle gider */
  const pid0 = await p.evaluate(() => BT.pid());
  ok(!!(await p.evaluate(() => localStorage.getItem('balikci_board_v2'))), 'cihaz içi liste boş başladı');
  await p.click('#forgetBtn'); await sleep(200);
  ok(/yeni bir kimlikle/.test(await p.evaluate(() => document.getElementById('askMsg').textContent)), 'silme sorusu yeniden eklenmeyi anlatmıyor');
  await p.click('#askYes'); await sleep(500);
  const f = calls.find(c => c.name === 'bt_forget');
  const after = await p.evaluate(() => ({ pid: BT.pid(), board: localStorage.getItem('balikci_board_v2'), stored: localStorage.getItem('balikci_pid') }));
  ok(f && f.body.p_player === pid0, 'bt_forget eski kimlikle çağrılmadı ' + JSON.stringify(f));
  ok(after.pid !== pid0 && after.stored === after.pid && !after.board, 'yerel temizlik/yeni kimlik yok ' + JSON.stringify(after));
  const nF = calls.length;
  const af = await p.evaluate(() => { BT.S.caught = 500; BT.submitScore(true); return { onl: BT.onlineOK(), run: BT.S.runId }; }); await sleep(400);
  const re = calls.slice(nF).find(c => c.name === 'bt_submit');
  ok(af.onl === true && re && re.body.p_player === after.pid && re.body.p_run === af.run && re.body.p_player !== pid0, 'silmeden sonra yeni kimlikle gönderim yanlış ' + JSON.stringify({ af, re }));
  /* 3) gizlilik politikası */
  await p.click('#privBtn'); await sleep(700);
  const pv = await p.evaluate(() => ({ open: !document.getElementById('privScr').classList.contains('hidden'), paused: BT.paused(),
    text: (document.getElementById('privFrame').contentDocument || {}).body ? document.getElementById('privFrame').contentDocument.body.innerText : '' }));
  ok(pv.open && pv.paused && /Çevrimiçi skor tablosu/.test(pv.text) && /Online leaderboard/.test(pv.text), 'gizlilik politikası açılmadı ' + JSON.stringify({ open: pv.open, paused: pv.paused, len: pv.text.length }));
  await p.keyboard.press('Escape'); await sleep(200);
  ok(await p.evaluate(() => document.getElementById('privScr').classList.contains('hidden') && !document.getElementById('settingsScreen').classList.contains('hidden')), 'Escape gizlilik penceresini kapatmadı (ayarlar açık kalmalı)');
  /* 4) Hakkında & Lisanslar: telif satırı + yazı tipi / Capacitor / Apache lisans metinleri */
  ok(await p.evaluate(() => document.getElementById('aboutBtn').textContent) === 'HAKKINDA & LİSANSLAR', 'Hakkında düğmesi yok');
  await p.click('#aboutBtn'); await sleep(700);
  const ab = await p.evaluate(() => { const d = document.getElementById('privFrame').contentDocument; return d && d.body ? d.body.textContent : ''; });
  ok(/Hamsi Koyu/.test(ab) && /© 2026/.test(ab) && /SIL OPEN FONT LICENSE/i.test(ab) && /Permission is hereby granted/.test(ab) && /Apache License/.test(ab) && /reklamsız/.test(ab), 'Hakkında sayfası eksik ' + ab.length);
  await p.keyboard.press('Escape'); await sleep(200);
  /* 5) temiz sayfada "katıl": gönderim başlar */
  const ctx2 = await b.newContext(); const p2 = await ctx2.newPage(); const calls2 = [];
  await p2.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };" }));
  await p2.route('https://sahte.supabase.co/**', r => { calls2.push(r.request().url().split('/rpc/')[1]); r.fulfill({ contentType: 'application/json', body: r.request().url().includes('bt_board') ? '{"top":[],"me":null,"stats":{}}' : '"ok"' }); });
  await p2.goto(URL); await sleep(900);
  await p2.click('#introSkip'); await p2.click('#playBtn'); await p2.click('#slotRows .sb[data-n="1"]');
  await p2.click('#heroGo'); await p2.fill('#nameIn', 'Onaylı Liman'); await p2.click('#nameGo'); await p2.click('#autoOpts button[data-m="10"]'); await sleep(800);
  ok(calls2.length === 0, 'temiz sayfada onaysız istek ' + JSON.stringify(calls2));
  await p2.evaluate(() => { document.getElementById('menuBtn').click(); }); await sleep(200);
  ok(calls2.length === 0 && await p2.evaluate(() => !document.getElementById('askScr').classList.contains('hidden')), 'temiz sayfada bilgilendirme yok');
  await p2.evaluate(() => BT.back()); await sleep(600);   /* geri tuşuyla kapatmak da "okundu" sayılır */
  ok(calls2.includes('bt_submit') && calls2.includes('bt_play'), 'geri tuşuyla kapatınca gönderim başlamadı ' + JSON.stringify(calls2));
  await p2.reload(); await sleep(900);
  if (await p2.isVisible('#introSkip')) await p2.click('#introSkip');
  await p2.click('#playBtn'); await sleep(700);
  if (await p2.isVisible('#autoOpts')) { await p2.click('#autoOpts button[data-m="10"]'); await sleep(400); }
  ok(await p2.evaluate(() => document.getElementById('askScr').classList.contains('hidden')), 'yeniden açılışta bilgilendirme tekrar çıktı');
  /* 6) herkese açık tabloya kaba ad gitmez (kullanıcı içeriği kuralı); benzer ama masum adlar geçer */
  const nb = await p2.evaluate(() => ({ bad: ['Orospu Balık', 'S1kt1r Liman', 'amk balık', 'Fuuuck Fish', 'göt balık'].filter(n => !BT.nameBad(n)),
    good: ['Klasik Balık', 'Müsik Evi', 'Kayarak Liman', 'Koç Balıkçılık', 'Scunthorpe Fish', 'Amasra Balık'].filter(BT.nameBad) }));
  ok(!nb.bad.length && !nb.good.length, 'ad filtresi yanlış ' + JSON.stringify(nb));
  const nS = calls2.length;
  await p2.evaluate(() => { BT.S.company = 'Orospu Liman'; BT.S.caught += 5; BT.submitScore(true); }); await p2.waitForTimeout(400);
  ok(calls2.length === nS, 'kaba ad çevrimiçi tabloya gönderildi');
  await ctx2.close();
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ calls: calls.map(c => c.name), pid0, after: { pid: after.pid } }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: gizlilik testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
