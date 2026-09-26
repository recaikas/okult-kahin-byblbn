/* Mağaza hazırlığı — yerel uygulama köprüsü (native.js), sahte Capacitor ile:
   1) kayıtlar telefonun kalıcı deposuna (Preferences) yansıtılır;
   2) WebView localStorage silinse bile açılışta kayıt oradan geri gelir ("Devam" çalışır);
   3) Android geri tuşu: açık alt panel → kapanır; sonra duraklatma menüsü açılır; sonra kapanır;
      ana ekranda uygulama arka plana alınır (minimizeApp); durum çubuğu gizlenir; 'pause' olayı kayıt alır;
   4) web'de (Capacitor yok) oyun aynen yüklenir; hiçbir dış adrese istek atılmaz (yazı tipi gömülü). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const fail = []; const ok = (c, m) => { if (!c) fail.push(m); };
const MOCK = seed => {
  window.__pref = seed || {}; window.__h = {}; window.__min = 0; window.__barHidden = 0;
  window.Capacitor = {
    isNativePlatform: () => true, getPlatform: () => 'android',
    Plugins: {
      Preferences: {
        keys: async () => ({ keys: Object.keys(window.__pref) }),
        get: async ({ key }) => ({ value: key in window.__pref ? window.__pref[key] : null }),
        set: async ({ key, value }) => { window.__pref[key] = value; },
        remove: async ({ key }) => { delete window.__pref[key]; }
      },
      App: { addListener: (ev, fn) => { window.__h[ev] = fn; return Promise.resolve({ remove() {} }); }, minimizeApp: async () => { window.__min++; } },
      StatusBar: { hide: async () => { window.__barHidden++; } }
    }
  };
};
(async () => {
  const b = await chromium.launch();
  /* --- A: uygulama, yeni oyun, kayıt yansıtma, geri tuşu --- */
  let ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); let p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const ext = []; await p.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) { ext.push(u); return r.abort(); } r.continue(); });
  await p.addInitScript(MOCK, {});
  await p.goto(URL); await sleep(1200);
  const A0 = await p.evaluate(() => ({ native: !!window.BT_NATIVE, bt: !!window.BT, bar: window.__barHidden, back: typeof window.__h.backButton }));
  ok(A0.native && A0.bt && A0.bar === 1 && A0.back === 'function', 'köprü kurulmadı ' + JSON.stringify(A0));
  await p.evaluate(() => window.__h.backButton()); await sleep(100);
  ok(await p.evaluate(() => window.__min) === 1, 'ana ekranda geri tuşu uygulamayı arka plana almadı');
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.fill('#heroName', 'Deniz'); await p.click('#heroGo'); await p.fill('#nameIn', 'Mavi Liman'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);
  await p.evaluate(() => { BT.S.cash = 4321; BT.S.tut = 99; BT.saveNow(); }); await sleep(300);
  const A1 = await p.evaluate(() => { const v = window.__pref.balikci_slot_1; return { has: !!v, cash: v ? JSON.parse(v).cash : null, keys: Object.keys(window.__pref) }; });
  ok(A1.has && A1.cash === 4321, 'kayıt kalıcı depoya yansımadı ' + JSON.stringify(A1));
  /* geri tuşu: alt panel → kapanır; sonra menü açılır; sonra menü kapanır */
  await p.click('.dtab[data-t="serv"]'); await sleep(300);
  const barOpen = await p.evaluate(() => !document.getElementById('devpanel').classList.contains('hidden'));
  await p.evaluate(() => window.__h.backButton()); await sleep(200);
  const barAfter = await p.evaluate(() => !document.getElementById('devpanel').classList.contains('hidden'));
  await p.evaluate(() => window.__h.backButton()); await sleep(200);
  const menuOpen = await p.evaluate(() => !document.getElementById('menuScreen').classList.contains('hidden'));
  await p.evaluate(() => window.__h.backButton()); await sleep(200);
  const menuAfter = await p.evaluate(() => !document.getElementById('menuScreen').classList.contains('hidden'));
  ok(barOpen && !barAfter && menuOpen && !menuAfter, 'geri tuşu sırası yanlış ' + JSON.stringify({ barOpen, barAfter, menuOpen, menuAfter }));
  ok(await p.evaluate(() => window.__min) === 1, 'oyun içinde geri tuşu uygulamayı kapattı');
  await p.evaluate(() => { BT.S.cash = 9876; window.__h.pause(); }); await sleep(300);
  ok(await p.evaluate(() => JSON.parse(window.__pref.balikci_slot_1).cash) === 9876, '"pause" olayında kayıt alınmadı');
  const pref = await p.evaluate(() => window.__pref);
  await ctx.close();
  /* --- B: localStorage silinmiş yeni kurulum; kalıcı depodan geri yükleme --- */
  ctx = await b.newContext({ viewport: { width: 430, height: 860 } }); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(MOCK, pref);
  await p.goto(URL); await sleep(1200);
  const B = await p.evaluate(() => ({ ls: !!localStorage.getItem('balikci_slot_1'), cash: JSON.parse(localStorage.getItem('balikci_slot_1') || '{}').cash }));
  ok(B.ls && B.cash === 9876, 'kayıt kalıcı depodan geri gelmedi ' + JSON.stringify(B));
  if (await p.isVisible('#introSkip')) { await p.click('#introSkip'); await sleep(300); }
  const cont = await p.evaluate(() => document.body.innerText);
  ok(/Mavi Liman/.test(cont) || /DEVAM|Devam/.test(cont), 'ana ekranda kayıtlı oyun görünmüyor');
  await ctx.close();
  /* --- C: web (Capacitor yok) --- */
  ctx = await b.newContext(); p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(1000);
  const C = await p.evaluate(() => ({ native: window.BT_NATIVE, bt: !!window.BT, font: document.fonts.check('16px "Pixelify Sans"') }));
  ok(C.native === null && C.bt && C.font, 'web yüklemesi bozuk ' + JSON.stringify(C));
  ok(ext.length === 0, 'dış adrese istek atıldı: ' + ext.join(', '));
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  console.log(JSON.stringify({ A0, A1: { has: A1.has, cash: A1.cash }, B, C }));
  console.log(fail.length ? 'HATALAR:\n - ' + fail.join('\n - ') : 'TAMAM: yerel uygulama köprüsü testi geçti');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
