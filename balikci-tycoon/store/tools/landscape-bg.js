/* Yatay tanıtım videosunun (1920×1080) arka planı: solda logo ve kısa özellikler, sağda dikey oyun videosunun çerçevesi.
   Video 452×980 olarak (1300, 50) noktasına bindirilir. */
const { chromium } = require('../../test-offline');
const path = require('path');
const TX = {
  tr: ['Ağdan tezgâha: balığı tut, kes, sat', '69 tuhaf müşteri, her biri bir hikâye', 'Dipteki Söz: 12 günlük Anadolu efsanesi', 'Türkçe ve İngilizce'],
  en: ['Net to stall: catch, fillet, sell', '69 quirky customers, each with a story', 'The Promise Below: a 12-day Anatolian legend', 'English and Turkish']
};
(async () => {
  const b = await chromium.launch();
  for (const lang of ['tr', 'en']) {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto('http://localhost:8099/store/tools/compose.html?img=x');
    await p.evaluate(([lang, tx]) => {
      document.body.innerHTML = '<div style="position:fixed;inset:0;background:linear-gradient(180deg,#0f2f45,#16506d 55%,#1d6c8f);font-family:\'Pixelify Sans\'">' +
        '<div style="position:absolute;top:0;left:0;right:0;height:18px;background:repeating-linear-gradient(90deg,#a83d2b 0 18px,#d9a441 18px 36px,#2a4c7d 36px 54px,#d9a441 54px 72px)"></div>' +
        '<img src="../logo/logo-horizontal-' + lang + '.png" style="position:absolute;left:70px;top:120px;width:1100px;image-rendering:pixelated">' +
        '<ul style="position:absolute;left:120px;top:600px;list-style:none;color:#fff1c9;font:700 44px \'Pixelify Sans\';line-height:1.6;text-shadow:3px 3px 0 #3d2413">' +
        tx.map(t => '<li>🐟 ' + t + '</li>').join('') + '</ul>' +
        '<div style="position:absolute;left:1284px;top:34px;width:484px;height:1012px;background:#0a1a27;border-radius:36px;box-shadow:0 0 0 8px #d9a441,0 20px 0 rgba(0,0,0,.35)"></div></div>';
    }, [lang, TX[lang]]);
    await p.evaluate(async () => { await document.fonts.ready; await new Promise(r => { const i = document.querySelector('img'); if (i.complete) r(); else i.onload = r; }); });
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.resolve(__dirname, '..', 'video', 'landscape-bg-' + lang + '.png') });
    await p.close(); console.log('bg', lang);
  }
  await b.close();
})();
