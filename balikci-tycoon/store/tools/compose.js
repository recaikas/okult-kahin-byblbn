/* Mağaza ekran görüntüleri: raw/{tr,en}/*.png → screens/{appstore-6.9,appstore-6.5,play}/{tr,en}/NN.png
   Oyun klasörü 8099'da sunulmalı. */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SIZES = { 'appstore-6.9': [1320, 2868], 'appstore-6.5': [1284, 2778], 'play-phone': [1080, 1920] };
const CAP = {
  tr: [
    ['1-harbor', 'Küçük iskeleden büyük limana', 'Balığı tut, kes, sat. Koyunu büyüt.'],
    ['2-special', '69 tuhaf müşteri', 'Hepsi kendini tanıtır. Siparişini bitir, adını öğren.'],
    ['3-kitchen', '4 bölge, 6 balık, 1 güveç', 'Personel al, her bölgeyi otomatiğe bağla.'],
    ['6-story', 'Dipteki Söz', '12 günlük bir Anadolu efsanesi, oyunun içinde.'],
    ['4-stalls', 'Her kuruşu takip et', 'Tezgâh tezgâh gelir, gider ve net kâr.'],
    ['5-book', 'Müşteri Defterini doldur', 'Gölgeler, ?????\'lar ve eski dostlar.']
  ],
  en: [
    ['1-harbor', 'From a tiny pier to a grand harbor', 'Catch, fillet, sell. Grow your cove.'],
    ['2-special', '69 quirky customers', 'Each one introduces themselves. Serve them to learn their name.'],
    ['3-kitchen', '4 zones, 6 fish, 1 stew', 'Hire staff and put every zone on autopilot.'],
    ['6-story', 'The Promise Below', 'A 12-day Anatolian legend, right in the game.'],
    ['4-stalls', 'Track every coin', 'Income, expenses and profit, stall by stall.'],
    ['5-book', 'Fill the Customer Book', 'Shadows, mysteries and old friends.']
  ]
};
(async () => {
  const b = await chromium.launch();
  for (const [kind, [w, h]] of Object.entries(SIZES)) for (const lang of ['tr', 'en']) {
    const out = path.join(ROOT, 'screens', kind, lang); fs.mkdirSync(out, { recursive: true });
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    for (let i = 0; i < CAP[lang].length; i++) {
      const [img, cap, sub] = CAP[lang][i];
      const u = 'http://localhost:8099/store/tools/compose.html?img=' + encodeURIComponent('../raw/' + lang + '/' + img + '.png') + '&cap=' + encodeURIComponent(cap) + '&sub=' + encodeURIComponent(sub);
      await p.goto(u); await p.evaluate(async () => { await document.fonts.ready; await new Promise(r => { const i = document.getElementById('img'); if (i.complete) r(); else i.onload = r; }); layout(); });
      await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(out, String(i + 1).padStart(2, '0') + '-' + img.slice(2) + '.png') });
    }
    await p.close(); console.log(kind, lang);
  }
  await b.close();
})();
