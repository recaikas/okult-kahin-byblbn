/* Görüş formu + mağaza değerlendirme penceresi (sahte Supabase + sahte Capacitor ile):
   1) duraklatma menüsünden açılır, oyun durur; yıldız zorunlu, 500 karakter sınırı; gönder → bt_feedback doğru
      argümanlarla gider, teşekkür mesajı görünür; Escape yalnız formu kapatır;
   2) sunucuya ulaşılamazsa / paylaşım kapalıysa görüş cihazdaki gelen kutusuna yazılır; sonraki açılışta
      netOn() ise gönderilir (sunucu sınırı yüzünden birer birer); ayarlardan da açılır;
   3) "Çevrimiçi verilerimi sil" hâlâ bt_forget'i çağırır; eski kimliğin bekleyen görüşü gönderilmez;
   4) değerlendirme penceresi: ilk oturumda sorulmaz; Bölüm 1 kartı kapanınca sorulur; 60 gün içinde ikinci kez
      sorulmaz; aksilikten hemen sonra ve kötü geçen günün ardından sorulmaz; görüş puanı karara girmez
      (1 yıldız verse de aynı tarafsız anda sorulur); web'de hiçbir şey yapmaz. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const FAKE_CFG = "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };";
const NATIVE = () => {
  window.__rev = 0; window.__pref = {};
  window.Capacitor = {
    isNativePlatform: () => true, getPlatform: () => 'android',
    Plugins: {
      Preferences: {
        keys: async () => ({ keys: Object.keys(window.__pref) }), get: async ({ key }) => ({ value: key in window.__pref ? window.__pref[key] : null }),
        set: async ({ key, value }) => { window.__pref[key] = value; }, remove: async ({ key }) => { delete window.__pref[key]; }
      },
      App: { addListener: () => Promise.resolve({ remove() {} }), minimizeApp: async () => { } },
      StatusBar: { hide: async () => { } },
      InAppReview: { requestReview: async () => { window.__rev++; } }
    }
  };
};
const newGame = async (p, name) => {
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', name); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(800);
};
const resume = async p => {
  if (await p.isVisible('#introSkip')) { await p.click('#introSkip'); await sleep(300); }
  await p.click('#playBtn'); await sleep(600);
  if (await p.isVisible('#autoOpts')) { await p.click('#autoOpts button[data-m="10"]'); await sleep(400); }
};
const vis = (p, id) => p.evaluate(i => !document.getElementById(i).classList.contains('hidden'), id);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  /* ================= A: görüş formu (web + sahte Supabase) ================= */
  let ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); let p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message));
  const calls = []; let net = 'ok';
  await ctx.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: FAKE_CFG }));
  await ctx.route('https://sahte.supabase.co/**', async r => {
    if (net === 'down') return r.abort('internetdisconnected');
    const name = r.request().url().split('/rpc/')[1], body = JSON.parse(r.request().postData() || '{}'); calls.push({ name, body });
    const reply = name === 'bt_board' ? { top: [], me: null, stats: {} } : name === 'bt_forget' ? 3 : 'ok';
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(reply) });
  });
  const fbCalls = () => calls.filter(c => c.name === 'bt_feedback');
  await p.goto(URL); await sleep(900);
  await newGame(p, 'Görüş Limanı');
  /* 1) duraklatma menüsünden aç */
  await p.evaluate(() => document.getElementById('menuBtn').click()); await sleep(200);
  const mb = await p.evaluate(() => document.getElementById('menuFb').textContent);
  ok(/GÖRÜŞÜNÜ YAZ/.test(mb), 'menüde görüş düğmesi yok: ' + mb);
  await p.click('#menuFb'); await sleep(250);
  const o1 = await p.evaluate(() => ({ open: BT.fbIsOpen(), paused: BT.paused(), stars: document.querySelectorAll('#fbStars button').length,
    cats: [...document.querySelectorAll('#fbCats button')].map(x => x.textContent), cnt: document.getElementById('fbCount').textContent,
    z: [getComputedStyle(document.getElementById('fbScr')).zIndex, getComputedStyle(document.getElementById('menuScreen')).zIndex] }));
  ok(o1.open && o1.paused && o1.stars === 5 && o1.cats.join() === 'HATA,ÖNERİ,BEĞENDİM' && o1.cnt === '0/500' && +o1.z[0] > +o1.z[1],
    'form açılmadı / oyun durmadı / içerik eksik ' + JSON.stringify(o1));
  /* oyun gerçekten donuk mu: oyun süresi ilerlemiyor */
  const t0 = await p.evaluate(() => BT.S.play); await sleep(600);
  ok(await p.evaluate(() => BT.S.play) === t0, 'form açıkken oyun süresi ilerledi');
  /* doğrulama: yıldız zorunlu */
  await p.click('#fbSend'); await sleep(200);
  const e1 = await p.evaluate(() => ({ err: document.getElementById('fbErr').textContent, vis: !document.getElementById('fbErr').classList.contains('hidden'), open: BT.fbIsOpen() }));
  ok(e1.vis && /puan/i.test(e1.err) && e1.open && fbCalls().length === 0, 'yıldızsız gönderim engellenmedi ' + JSON.stringify(e1));
  /* doğrulama: 500 karakter */
  await p.click('#fbStars button[data-v="4"]');
  const lim = await p.evaluate(() => { const t = document.getElementById('fbText'); t.value = 'x'.repeat(600); t.dispatchEvent(new Event('input')); return { cnt: document.getElementById('fbCount').textContent, bad: document.getElementById('fbCount').classList.contains('bad'), max: t.maxLength }; });
  await p.click('#fbSend'); await sleep(200);
  const e2 = await p.evaluate(() => document.getElementById('fbErr').textContent);
  ok(lim.cnt === '600/500' && lim.bad && lim.max === 500 && /500/.test(e2) && fbCalls().length === 0, 'karakter sınırı çalışmadı ' + JSON.stringify({ lim, e2 }));
  /* canlı sayaç + klavyeyle yazarken oyun tuşları çalışmaz */
  await p.fill('#fbText', ''); await p.click('#fbText'); await p.keyboard.type('Harika oyun! wasd');
  const typed = await p.evaluate(() => ({ cnt: document.getElementById('fbCount').textContent, open: BT.fbIsOpen() }));
  ok(typed.cnt === '17/500' && typed.open, 'canlı sayaç yanlış ' + JSON.stringify(typed));
  await p.click('#fbCats button[data-c="idea"]');
  /* 4 yıldız + ÖNERİ + metin → gönder */
  const exp = await p.evaluate(() => ({ pid: BT.pid(), run: BT.S.runId, day: BT.day.n }));
  await p.click('#fbSend'); await sleep(500);
  const sent = fbCalls()[0];
  const want = { p_player: exp.pid, p_run: exp.run, p_stars: 4, p_cat: 'idea', p_text: 'Harika oyun! wasd', p_lang: 'tr', p_day: exp.day };
  ok(sent && Object.keys(want).every(k => sent.body[k] === want[k]) && typeof sent.body.p_ver === 'string' && sent.body.p_ver.length > 0 &&
    Object.keys(sent.body).sort().join() === 'p_cat,p_day,p_lang,p_player,p_run,p_stars,p_text,p_ver', 'bt_feedback argümanları yanlış ' + JSON.stringify(sent));
  const th = await p.evaluate(() => ({ t: document.getElementById('toast').textContent, on: document.getElementById('toast').classList.contains('on'),
    z: +getComputedStyle(document.getElementById('toast')).zIndex, open: BT.fbIsOpen(), menu: !document.getElementById('menuScreen').classList.contains('hidden'), paused: BT.paused() }));
  ok(/Teşekkürler/.test(th.t) && th.on && th.z > 10 && !th.open && th.menu && th.paused, 'teşekkür mesajı / kapanış yanlış ' + JSON.stringify(th));
  /* Escape: yalnız formu kapatır, menü açık kalır; ikinci Escape menüyü kapatır */
  await p.click('#menuFb'); await sleep(200);
  ok(await p.evaluate(() => document.getElementById('fbCount').textContent === '0/500' && !document.querySelector('#fbStars button.on')), 'form yeniden açılınca sıfırlanmadı');
  await p.keyboard.press('Escape'); await sleep(200);
  const esc = await p.evaluate(() => ({ open: BT.fbIsOpen(), menu: !document.getElementById('menuScreen').classList.contains('hidden'), paused: BT.paused() }));
  ok(!esc.open && esc.menu && esc.paused, 'Escape formu kapatmadı ' + JSON.stringify(esc));
  await p.keyboard.press('Escape'); await sleep(200);
  ok(!(await vis(p, 'menuScreen')) && !(await p.evaluate(() => BT.paused())), 'ikinci Escape menüyü kapatmadı');
  /* geri tuşu kancası (BT.back) da formu kapatır */
  await p.evaluate(() => BT.fbShow()); await sleep(100);
  ok(await p.evaluate(() => BT.paused() && BT.back() && !BT.fbIsOpen() && !BT.paused()), 'geri tuşu formu kapatmadı');
  /* Vazgeç */
  await p.evaluate(() => BT.fbShow()); await p.click('#fbCancel'); await sleep(100);
  ok(!(await p.evaluate(() => BT.fbIsOpen())), 'Vazgeç kapatmadı');
  /* 2) çevrimdışı → gelen kutusu (ayarlardan açılır) */
  net = 'down';
  await p.evaluate(() => document.getElementById('menuBtn').click()); await sleep(150); await p.click('#menuSet'); await sleep(200);
  ok(/GÖRÜŞÜNÜ YAZ/.test(await p.evaluate(() => document.getElementById('fbBtn').textContent)), 'ayarlarda görüş düğmesi yok');
  await p.click('#fbBtn'); await sleep(200);
  ok(await p.evaluate(() => BT.fbIsOpen() && BT.paused()), 'ayarlardan açılmadı');
  await p.click('#fbStars button[data-v="5"]'); await p.fill('#fbText', 'çevrimdışı görüş'); await p.click('#fbSend'); await sleep(500);
  const off1 = await p.evaluate(() => ({ box: JSON.parse(localStorage.getItem('balikci_feedback_outbox') || '[]'), t: document.getElementById('toast').textContent,
    open: BT.fbIsOpen(), set: !document.getElementById('settingsScreen').classList.contains('hidden') }));
  ok(off1.box.length === 1 && off1.box[0].p_text === 'çevrimdışı görüş' && off1.box[0].p_stars === 5 && /çevrimiçi olunca/.test(off1.t) && !off1.open && off1.set,
    'çevrimdışı görüş kutuya yazılmadı ' + JSON.stringify(off1));
  /* paylaşım kapalı → hiç istek gitmeden kutuya */
  net = 'ok';
  await p.click('#onlineSeg button[data-o="0"]'); await sleep(150);
  const n0 = calls.length;
  await p.click('#fbBtn'); await p.click('#fbStars button[data-v="2"]'); await p.click('#fbCats button[data-c="bug"]'); await p.fill('#fbText', 'ikinci'); await p.click('#fbSend'); await sleep(400);
  const off2 = await p.evaluate(() => JSON.parse(localStorage.getItem('balikci_feedback_outbox') || '[]'));
  ok(calls.length === n0 && off2.length === 2 && off2[1].p_cat === 'bug', 'paylaşım kapalıyken istek gitti / kutuya yazılmadı ' + JSON.stringify({ n: calls.length - n0, off2 }));
  await p.click('#onlineSeg button[data-o="1"]'); await sleep(300);
  /* sonraki açılış: netOn() → kutu gönderilir (birer birer; ikincisi 60 sn aralıkla) */
  await p.reload(); await sleep(1500);
  const fl1 = fbCalls().slice(1), box1 = await p.evaluate(() => BT.fbOutbox().length);
  ok(fl1.length === 1 && fl1[0].body.p_text === 'çevrimdışı görüş' && fl1[0].body.p_stars === 5 && box1 === 1, 'açılışta kutu gönderilmedi ' + JSON.stringify({ fl1: fl1.map(c => c.body.p_text), box1 }));
  await p.evaluate(() => BT.fbFlush(true)); await sleep(500);
  const fl2 = fbCalls().slice(2), box2 = await p.evaluate(() => ({ n: BT.fbOutbox().length, raw: localStorage.getItem('balikci_feedback_outbox') }));
  ok(fl2.length === 1 && fl2[0].body.p_text === 'ikinci' && fl2[0].body.p_cat === 'bug' && box2.n === 0 && box2.raw === null, 'kutunun kalanı gönderilmedi ' + JSON.stringify({ fl2, box2 }));
  /* 3) Çevrimiçi verilerimi sil: bt_forget + eski kimliğin bekleyen görüşü gitmez */
  await resume(p);
  await p.evaluate(() => document.getElementById('menuBtn').click()); await sleep(150); await p.click('#menuSet'); await sleep(200);
  await p.click('#onlineSeg button[data-o="0"]'); await sleep(100);
  await p.click('#fbBtn'); await p.click('#fbStars button[data-v="1"]'); await p.click('#fbSend'); await sleep(300);
  await p.click('#onlineSeg button[data-o="1"]'); await sleep(100);
  const pid0 = await p.evaluate(() => BT.pid()), fb0 = fbCalls().length;
  const fl = await p.evaluate(() => document.getElementById('forgetBtn').textContent);
  ok(/ÇEVRİMİÇİ VERİLERİMİ SİL/.test(fl), 'sil düğmesinin adı güncellenmedi: ' + fl);
  await p.click('#forgetBtn'); await sleep(200);
  ok(/görüş/.test(await p.evaluate(() => document.getElementById('askMsg').textContent)), 'silme sorusu görüşleri anmıyor');
  await p.click('#askYes'); await sleep(500);
  const fg = calls.find(c => c.name === 'bt_forget');
  ok(fg && fg.body.p_player === pid0 && await p.evaluate(() => BT.pid()) !== pid0, 'bt_forget çalışmadı ' + JSON.stringify(fg));
  ok(await p.evaluate(() => BT.onlineOK()) === false, 'silme sonrası paylaşım kapanmadı');
  await p.click('#onlineSeg button[data-o="1"]'); await sleep(100);
  await p.evaluate(() => BT.fbFlush(true)); await sleep(400);
  ok(fbCalls().length === fb0 && await p.evaluate(() => BT.fbOutbox().length) === 0, 'eski kimliğin görüşü gönderildi / kutuda kaldı');
  /* gelen kutusu en çok 20 (en eskisi düşer) */
  await p.click('#onlineSeg button[data-o="0"]'); await sleep(100);
  const cap = await p.evaluate(() => { for (let i = 0; i < 23; i++) { BT.fbShow(); document.querySelector('#fbStars button[data-v="3"]').click(); const t = document.getElementById('fbText'); t.value = 't' + i; t.dispatchEvent(new Event('input')); document.getElementById('fbSend').click(); } const a = BT.fbOutbox(); return { n: a.length, first: a[0] && a[0].p_text, last: a[a.length - 1] && a[a.length - 1].p_text }; });
  ok(cap.n === 20 && cap.first === 't3' && cap.last === 't22', 'gelen kutusu 20 ile sınırlı değil ' + JSON.stringify(cap));
  await p.click('#onlineSeg button[data-o="1"]'); await sleep(100);
  /* İngilizce etiketler */
  await p.evaluate(() => { BT.setLang('en'); BT.fbShow(); });
  const en = await p.evaluate(() => [document.getElementById('fbTitle').textContent, document.getElementById('fbSend').textContent, document.getElementById('forgetBtn').textContent, [...document.querySelectorAll('#fbCats button')].map(x => x.textContent).join()]);
  ok(en[0] === 'SEND FEEDBACK' && en[1] === 'SEND' && en[2] === 'DELETE MY ONLINE DATA' && en[3] === 'BUG,IDEA,LOVE IT', 'İngilizce etiketler yanlış ' + JSON.stringify(en));
  await p.evaluate(() => BT.setLang('tr'));
  ok(await p.evaluate(() => BT.rvState().why) === 'web', 'web\'de değerlendirme engeli "web" değil');
  await ctx.close();

  /* ================= B: değerlendirme penceresi (sahte Capacitor) ================= */
  ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(NATIVE);
  await p.goto(URL); await sleep(1200);
  await newGame(p, 'Puan Limanı');
  const closeChapter = () => p.evaluate(() => { document.getElementById('chEnd').classList.remove('hidden'); document.getElementById('chEndGo').click(); });
  /* gün özeti kapanışı: ertesi gün pazar günü olmasın diye gün 1'e sarılır (tetikleyici yalnız day.last'a bakar) */
  const closeDay = last => p.evaluate(L => { BT.day.n = 1; BT.day.last = L; document.getElementById('dayScr').classList.remove('hidden'); document.getElementById('dayGo').click(); }, last);
  const settle = async () => { await sleep(1700); for (const id of ['stallGo', 'prepGo']) await p.evaluate(i => { const x = document.getElementById(i); if (x && x.offsetParent) x.click(); }, id); };
  /* ilk oturum: sorulmaz */
  await closeChapter(); await settle();
  const s1 = await p.evaluate(() => ({ rev: window.__rev, st: BT.rvState() }));
  ok(s1.rev === 0 && s1.st.session === 1 && s1.st.why === 'first', 'ilk oturumda soruldu ' + JSON.stringify(s1));
  /* ikinci oturum; önce 1 yıldızlı görüş (puan karara girmez) */
  await p.reload(); await sleep(1200); await resume(p);
  await p.evaluate(() => { BT.fbShow(); document.querySelector('#fbStars button[data-v="1"]').click(); document.getElementById('fbSend').click(); });
  await sleep(200);
  ok(await p.evaluate(() => BT.rvState().session) === 2 && await p.evaluate(() => BT.S.started), 'ikinci oturum başlamadı');
  await closeChapter(); await settle();
  const s2 = await p.evaluate(() => ({ rev: window.__rev, st: BT.rvState(), pref: window.__pref.balikci_review_at }));
  ok(s2.rev === 1 && s2.st.at > 0 && s2.pref === String(s2.st.at), 'Bölüm 1 sonunda sorulmadı (1 yıldızlı görüşten sonra da tarafsız sorulmalı) ' + JSON.stringify(s2));
  /* 60 gün dolmadan: ne bölüm sonu ne iyi gün yeniden sorar */
  await closeChapter(); await settle();
  await closeDay({ n: 4, inc: 500, served: 20, lost: 1 }); await settle();
  const s3 = await p.evaluate(() => ({ rev: window.__rev, why: BT.rvState().why }));
  ok(s3.rev === 1 && s3.why === 'recent', '60 gün içinde ikinci kez soruldu ' + JSON.stringify(s3));
  /* 61 gün sonra: kötü gün / aksilik sonrası sorulmaz, iyi günün ardından sorulur */
  const age = () => p.evaluate(() => { const t = Date.now; Date.now = () => t() + 61 * 864e5; });   /* saat 61 gün ileri */
  await age();
  await closeDay({ n: 2, inc: 500, served: 20, lost: 0 }); await settle();
  ok(await p.evaluate(() => window.__rev) === 1, '3. günden önce soruldu');
  await closeDay({ n: 5, inc: 0, served: 3, lost: 9 }); await settle();
  ok(await p.evaluate(() => window.__rev) === 1, 'kötü geçen günün ardından soruldu');
  await p.evaluate(() => BT.sfx.bad());
  await closeDay({ n: 6, inc: 800, served: 30, lost: 2 }); await settle();
  const s4 = await p.evaluate(() => ({ rev: window.__rev, why: BT.rvState().why }));
  ok(s4.rev === 1 && s4.why === 'fail', 'aksilikten hemen sonra soruldu ' + JSON.stringify(s4));
  await p.evaluate(() => { const t = Date.now; Date.now = () => t() + 25000; });   /* aksilikten sonra sakin 25 sn geçti */
  ok(await p.evaluate(() => BT.undecided().length) === 0, 'kurulum: karar bekleyen tezgâh var');
  await closeDay({ n: 7, inc: 800, served: 30, lost: 2 }); await settle();
  ok(await p.evaluate(() => window.__rev) === 2, '≥3 gün + iyi günün ardından sorulmadı');
  /* görüş formu açıkken sorulmaz */
  await age();
  await p.evaluate(() => BT.fbShow());
  ok(await p.evaluate(() => BT.rvState().why) === 'feedback' && await p.evaluate(() => BT.askReview()) === false, 'görüş formu açıkken sorma engeli yok');
  await p.evaluate(() => BT.back());
  await ctx.close();

  /* ================= C: web — değerlendirme hiç denenmez ================= */
  ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900); await newGame(p, 'Web Limanı');
  await p.reload(); await sleep(1000); await resume(p);
  await closeChapter(); await settle();
  const w = await p.evaluate(() => ({ native: window.BT_NATIVE, st: BT.rvState(), ls: localStorage.getItem('balikci_review_at') }));
  ok(w.native === null && w.st.session === 2 && w.st.why === 'web' && w.st.asked === 0 && w.ls === null, 'web\'de değerlendirme denendi ' + JSON.stringify(w));
  await ctx.close();

  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ feedback: fbCalls().length, forget: !!fg, s1, s2, s3, s4 }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: görüş formu + değerlendirme testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
