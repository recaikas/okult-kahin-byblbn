/* v1.9.5 — yönetim paneli (panel.html) sahte Supabase ile:
   yanlış şifre → hata, veri yok; doğru şifre → özet, ilerleme, yolculuk (olay kodları okunur adıma çevrilir),
   oyuncular, görüşler; oyuncunun yazdığı HTML çalışmaz (kaçışlanır); çıkış şifreyi unutur. */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = (process.env.URL || 'http://localhost:8099/index.html').replace(/index\.html$/, '');
const GOOD = 'dogru-sifre-1234';
const DATA = {
  at: '2026-09-29T10:00:00Z',
  ozet: { kac_kisi: 7, son_24s: 3, son_7g: 7, ort_dk: 22.5, medyan_dk: 14, '10dk_ustu': 4, '60dk_ustu': 1, geri_donen: 2, en_uzun_gun: 9, gorus: 2, ort_yildiz: 4.5 },
  ilerleme: [{ sira: 1, adim: 'Yeni oyun başladı', oyuncu: 7, yuzde: 100, ort_dakika: 0.1 }, { sira: 4, adim: 'Kesim masasına bıraktı', oyuncu: 5, yuzde: 71, ort_dakika: 1.2 }],
  birakma: [{ son_gun: 2, oyun: 3, ort_dakika: 8.1, isletmeler: 'Mavi Liman, <b>Kalın</b>' }],
  oyuncular: [{ oyuncu: 'abcdef123456', karakter: 'Ali', isletme: '<img src=x onerror="window.__x=1">', oyun_sayisi: 1, toplam_saat: 0.4, en_iyi_balik: 1234, en_uzun_gun: 3, acilis: 2, son_gorulme: '2026-09-29T09:00:00Z' }],
  yolculuk: [{ oyuncu: 'abcdef123456', isletme: 'Mavi Liman', adim_sayisi: 4, yol: 'oyun (0.1 dk) → tut3 (1.2 dk) → gun2 (6.0 dk) → sv3 (12.5 dk)', son_olay: '2026-09-29T09:00:00Z' }],
  gorusler: [{ zaman: '2026-09-29T08:00:00Z', yildiz: 5, konu: 'Öneri', metin: 'Harika!\n<script>window.__y=1</script>', dil: 'tr', surum: 'v1.9.5', gun: 4, oyuncu: 'abcdef123456' }],
  gunluk: [{ gun: '2026-09-28', acilis: 5, kisi: 3 }, { gun: '2026-09-29', acilis: 8, kisi: 4 }]
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/config.js', r => r.fulfill({ contentType: 'application/javascript', body: "window.BT_ONLINE = { url: 'https://sahte.supabase.co', key: 'anon' };" }));
  await p.route('https://sahte.supabase.co/**', r => {
    const body = JSON.parse(r.request().postData() || '{}');
    r.fulfill({ contentType: 'application/json', body: JSON.stringify(body.p_token === GOOD ? DATA : null) });
  });
  await p.goto(BASE + 'panel.html'); await sleep(400);
  R.robots = await p.getAttribute('meta[name="robots"]', 'content');
  await p.fill('#pw', 'yanlis-sifre-1234'); await p.click('#go'); await sleep(400);
  R.bad = { err: await p.textContent('#err'), dash: await p.isVisible('#dash') };
  await p.fill('#pw', GOOD); await p.click('#go'); await sleep(500);
  R.good = await p.evaluate(() => ({
    dash: !document.getElementById('dash').classList.contains('hidden'),
    ozet: document.getElementById('ozet').textContent, path: document.getElementById('yolculuk').textContent,
    players: document.getElementById('oyuncular').innerHTML, fb: document.getElementById('gorusler').innerHTML,
    xss: !!(window.__x || window.__y), imgs: document.querySelectorAll('#dash img, #dash script').length
  }));
  await p.screenshot({ path: (process.env.SC || require('os').tmpdir()) + '/panel.png', fullPage: true });
  await p.click('#out'); await sleep(200);
  R.out = { login: await p.isVisible('#login'), tok: await p.evaluate(() => sessionStorage.getItem('bt_panel_token')) };
  ok(R.robots === 'noindex,nofollow', 'panel arama motorlarına açık');
  ok(/yanlış/.test(R.bad.err) && !R.bad.dash, 'yanlış şifreyle panel açıldı ' + JSON.stringify(R.bad));
  ok(R.good.dash && /Farklı oyuncu/.test(R.good.ozet) && /Kesime bıraktı/.test(R.good.path) && /2\. gün/.test(R.good.path) && /İtibar Sv3/.test(R.good.path), 'panel verisi eksik ' + JSON.stringify(R.good.path));
  ok(!R.good.xss && R.good.imgs === 0 && /&lt;img/.test(R.good.players) && /&lt;script/.test(R.good.fb), 'oyuncu metni kaçışlanmadı');
  ok(R.out.login && !R.out.tok, 'çıkış şifreyi unutmadı');
  ok(errs.length === 0, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify({ bad: R.bad, out: R.out }));
  console.log(fail.length ? 'PANEL_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: yönetim paneli testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
