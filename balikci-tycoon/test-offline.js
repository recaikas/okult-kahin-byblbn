/* Testler gerçek Supabase'e (config.js) hiç bağlanmasın: skor tablosu kirlenmesin, KVKK bilgilendirmesi araya girmesin.
   Her tarayıcı bağlamında config.js boş sürümle yanıtlanır. Kendi sahte Supabase'ini kuran testler (p.route / ctx.route
   ile config.js) sonradan kaydolduğu için onlarınki geçerli olur. Kullanım: const { chromium } = require('./test-offline'); */
const pw = require('/opt/node22/lib/node_modules/playwright');
const EMPTY_CFG = "window.BT_ONLINE = { url: '', key: '' };";
/* v1.9: ilk açılıştaki dil seçimi eski testlerin akışını bozmasın (kendi testi test-ilkacilis.js ayrı bağlamda) */
const offline = async ctx => {
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('balikci_langpick')) localStorage.setItem('balikci_langpick', '1'); } catch (e) { } });
  /* v2.4: hikâye ziyaretçisi oyunu ara sahneyle durdurur; onu sınamayan testlerde kapalı (test-story-game.js açar) */
  await ctx.addInitScript(() => { window.HK_STORY_OFF = 1; });
  return ctx.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: EMPTY_CFG }));
};
const chromium = Object.create(pw.chromium);
chromium.launch = async (...a) => {
  const b = await pw.chromium.launch(...a);
  const newContext = b.newContext.bind(b);
  b.newContext = async (...o) => { const c = await newContext(...o); await offline(c); return c; };
  b.newPage = async (...o) => { const c = await b.newContext(...o); const p = await c.newPage(); p.close = async () => { await c.close(); }; return p; };
  return b;
};
module.exports = { ...pw, chromium };
