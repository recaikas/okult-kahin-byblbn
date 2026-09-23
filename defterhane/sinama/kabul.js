/* Defterhane — şartname §13 kabul ölçütleri sınaması.
   Ağ gerekmez: sınama anlatıcısıyla çalışır.
   Çalıştırma:  NODE_PATH="$(npm root -g)" node defterhane/sinama/kabul.js
   (playwright paketi ve bir Chromium kurulu olmalı) */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SAYFA = 'file://' + path.resolve(__dirname, '..', 'index.html');
let gecen = 0, kalan = 0;
function olc(no, ad, kosul, ayrinti = '') {
  if (kosul) { gecen++; console.log(`  ✓ ${no}. ${ad}`); }
  else { kalan++; console.log(`  ✗ ${no}. ${ad} ${ayrinti}`); }
}

async function sinamaSec(page) {
  await page.click('[data-cekmece="c-ayar"]');
  await page.check('input[name="erisim"][value="sinama"]');
  await page.click('#c-ayar [data-kapat]');
}
async function tur(page, metin) {
  const once = await page.$$eval('#akis article.yaprak:not(#canli)', e => e.length);
  await page.fill('#hamle', metin);
  await page.click('#gonder');
  await page.waitForFunction(n => document.querySelectorAll('#akis article.yaprak:not(#canli)').length > n && !document.querySelector('#canli'), once, { timeout: 20000 });
}
const durum = page => page.evaluate(() => JSON.parse(JSON.stringify(window.Defterhane.durum)));
const sonSahne = async page => (await durum(page)).kanon.filter(k => k.rol === 'gm').slice(-1)[0];

(async () => {
  const tarayici = await chromium.launch();
  const ctx = await tarayici.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const konsol = [];
  const hatalar = [];
  page.on('console', m => konsol.push(m.text()));
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto(SAYFA);
  await sinamaSec(page);

  console.log('Defterhane kabul ölçütleri');

  // 1. Tur çevrilir, akış hâlinde yazılır, blok ekranda görünmez
  let akisGoruldu = false;
  const izle = page.waitForSelector('#canli-metin', { timeout: 5000 }).then(() => { akisGoruldu = true; }).catch(() => {});
  await tur(page, 'Kemal\'e haftalık arzın suretini çıkarttırıyorum. #yasak');
  await izle;
  const ekran = await page.textContent('#akis');
  const dT = await durum(page);
  olc('1b', 'Tarih ve mevki durumdan korunur', dT.durum.tarih.startsWith('12 Kasım 1522'), dT.durum.tarih);
  olc(1, 'Tur çevrilir, akış hâlinde yazılır, durum bloğu görünmez', akisGoruldu && !ekran.includes('<<<DURUM') && !ekran.includes('"degisim"'));

  // 2. Zar hâmişte görünür ve metindekiyle aynı
  let s = await sonSahne(page);
  const hamis = await page.textContent('#akis article.yaprak:last-of-type .hamis');
  const metinZar = (s.metin.match(/Zar (\d+)/) || [])[1];
  olc(2, 'Zar hâmişte görünür ve metindeki sayıyla aynı', s.zar.atildi && hamis.includes(`d20 · ${s.zar.d20}`) && +metinZar === s.zar.d20, `(hâmiş: ${hamis.slice(0, 60)})`);

  // 3. İtibar değişimi panelde ve hâmişte
  const d1 = await durum(page);
  const panel = await page.textContent('#panel');
  olc(3, 'İtibar değişimi panelde ve hâmişte doğru', d1.durum.itibar['Kubad Reis'] === 82 && hamis.includes('Kubad Reis +2') && /Kubad Reis\s*82/.test(panel));
  olc('3b', 'Sözlük denetimi yasak kelimeyi hâmişe düşer', hamis.includes('yasak kelime geçti — dakika'));
  olc('3c', 'Şemada olmayan alan sessizce yok sayılır', d1.durum.uydurma === undefined);

  // 4. Sayfa kapatılıp açılır; kaldığı yerden devam
  const kanonSay = d1.kanon.length;
  const page2 = await ctx.newPage();
  await page.close();
  await page2.goto(SAYFA);
  const d2 = await durum(page2);
  olc(4, 'Sayfa kapatılıp açılınca oyun kaldığı yerden devam eder', d2.kanon.length === kanonSay && d2.durum.itibar['Kubad Reis'] === 82 && d2.ayar.erisim === 'sinama');
  const p = page2;
  p.on('console', m => konsol.push(m.text()));
  p.on('pageerror', e => hatalar.push(e.message));

  // 5. Son turu sil — sahne ve durum geri gelir
  const onceSil = await durum(p);
  await tur(p, 'Vardar Ali\'ye gidip emaneti soruyorum.');
  const sonra = await durum(p);
  await p.click('[data-cekmece="c-kanon"]');
  await p.click('#dg-son-sil'); await p.click('#dg-son-sil');
  await p.click('#c-kanon [data-kapat]');
  const geri = await durum(p);
  olc(5, 'Son turu sil: sahne ve durum geri gelir', sonra.durum.kese === onceSil.durum.kese - 1 && geri.durum.kese === onceSil.durum.kese &&
      JSON.stringify(geri.durum) === JSON.stringify(onceSil.durum) && geri.kanon.length === onceSil.kanon.length);
  await p.fill('#hamle', '');

  // 6. Bu yanlıştı → kural → onay → kaide → sonraki istemde
  const kaideOnce = geri.kaide.length;
  await p.click('#akis article.yaprak:last-of-type .alt-dg');
  await p.fill('.itiraz textarea', 'Kurtoğlu\'na paşa diye hitap edildi, o bir reistir');
  await p.click('.itiraz .dg.ana');
  await p.waitForSelector('.itiraz textarea', { state: 'attached' });
  await p.waitForFunction(() => { const b = document.querySelector('.itiraz .dg.ana'); return b && b.textContent.includes('Onayla'); }, null, { timeout: 10000 });
  const oneri = await p.inputValue('.itiraz textarea');
  await p.click('.itiraz .dg.ana');
  const d6 = await durum(p);
  const kaidePanel = (await p.click('[data-cekmece="c-kaide"]'), await p.textContent('#kaide-govde'));
  await p.click('#c-kaide [data-kapat]');
  konsol.length = 0;
  await tur(p, 'Kurtoğlu\'nun huzuruna çıkıyorum.');
  const istemLog = konsol.join('\n');
  olc(6, '"Bu yanlıştı" kuralı onaylanır, kaidede görünür, sonraki istemde konsolda yer alır',
      d6.kaide.length === kaideOnce + 1 && d6.kaide.slice(-1)[0].kaynak === 'duzeltme' && kaidePanel.includes(oneri) && istemLog.includes(`${kaideOnce + 1}. ${oneri}`));

  // 8. Ölü diriltme reddedilir
  await tur(p, 'Kürekçileri yokluyorum. #ölü');
  const d8 = await durum(p); s = d8.kanon.filter(k => k.rol === 'gm').slice(-1)[0];
  olc(8, 'Ölüyü adamlara ekleme reddedilir', !d8.durum.adamlar.some(a => a.startsWith('Yakup Kara')) && s.notlar.some(n => n.includes('ölüler defterinde')));

  // 9. +40 itibar → +15'e kırpılır, not düşülür
  const once9 = d8.durum.itibar['Çoban Mustafa Paşa'];
  await tur(p, 'Serdar-ı Ekrem\'e kışlama defterini sunuyorum. #itibar');
  const d9 = await durum(p); s = d9.kanon.filter(k => k.rol === 'gm').slice(-1)[0];
  const sonra9 = d9.durum.itibar['Çoban Mustafa Paşa'];
  olc(9, '+40 itibar +15\'e kırpılır', once9 === 60 && sonra9 === 75, `(önce ${once9}, sonra ${sonra9})`);
  olc('9b', 'Kırpma notu hâmişte', s.notlar.some(n => n.includes('kırpıldı')));

  // Ek hakem denetimleri
  await tur(p, 'Nimet\'i yokluyorum. #zimmet');
  let dx = await durum(p); s = dx.kanon.filter(k => k.rol === 'gm').slice(-1)[0];
  olc('H1', 'Zimmet kaybı sahnede geçmeden silinmez', dx.durum.zimmet.some(z => z.startsWith('Nimet')) && s.notlar.some(n => n.includes('silinmedi')));
  await tur(p, 'Defteri kapatıyorum. #bozuk');
  const dOnce = dx.durum;
  dx = await durum(p); s = dx.kanon.filter(k => k.rol === 'gm').slice(-1)[0];
  olc('H2', 'Bozuk blok: sahne gösterilir, durum değişmez, "durum okunamadı"', s.metin.length > 20 && s.notlar.includes('durum okunamadı') && JSON.stringify(dx.durum) === JSON.stringify(dOnce));
  await tur(p, 'Tebliğ yazıyorum. #zarhile');
  dx = await durum(p); s = dx.kanon.filter(k => k.rol === 'gm').slice(-1)[0];
  olc('H3', 'Anlatıcı başka zar yazarsa motorun sayısı esas alınır', s.notlar.some(n => n.includes(`esas: d20 · ${s.zar.d20}`)));
  const hk = await p.evaluate(() => { const S = window.Defterhane.durum; const once = S.durum.kese; const r = window.Defterhane.hakem({ degisim: [{ alan: 'kese', islem: '-9999' }] }, 'sahne', { atildi: false }); const k = S.durum.kese; S.durum.kese = once; return { k, r }; });
  olc('H4', 'Kese negatife düşmez', hk.k === 0 && hk.r.notlar.some(n => n.includes("0'da durdu")));

  // 10. Dışa aktarma okunabilir Markdown
  const [indirme] = await Promise.all([p.waitForEvent('download'), p.click('#dg-disa')]);
  const md = fs.readFileSync(await indirme.path(), 'utf8');
  olc(10, 'Dışa aktarma okunabilir Markdown vekâyinâme üretir', md.startsWith('# Balaban Vekâyinâmesi — Vekâyinâme') && md.includes('## Kronoloji') && md.includes('## Kaide') && md.includes('| Çoban Mustafa Paşa | 75 |') && md.includes('_Hâmiş: d20'));

  // Bağlam bütçesi
  const bt = await p.evaluate(() => { const S = window.Defterhane.durum; const k = S.kanon.filter(x => x.rol === 'oyuncu').slice(-1)[0]; return window.Defterhane.istemButceli(k).istem.length; });
  olc('B', 'İstem 60.000 karakteri aşmaz', bt <= 60000, `(${bt})`);

  // 7. Mobil: yazarken düğmeler görünür, yatay kaydırma yok
  const mob = await tarayici.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const m = await mob.newPage();
  await m.goto(SAYFA);
  await m.focus('#hamle');
  await m.setViewportSize({ width: 390, height: 480 }); // klavye açılmış gibi
  await m.waitForTimeout(150);
  const olcu = await m.evaluate(() => {
    const g = document.querySelector('#gonder').getBoundingClientRect();
    const t = document.querySelector('#hamle');
    return { gAlt: g.bottom, h: window.innerHeight, yatay: document.documentElement.scrollWidth > window.innerWidth, font: getComputedStyle(t).fontSize, sayfaKaydi: window.scrollY };
  });
  await m.click('#dg-durum');
  const panelAcik = await m.evaluate(() => document.querySelector('#panel').classList.contains('acik'));
  await m.keyboard.press('Escape');
  await m.click('[data-cekmece="c-kaide"]');
  await m.focus('#kaide-yeni');
  await m.waitForTimeout(300);
  const ek = await m.evaluate(() => { const b = document.querySelector('#kaide-ekle button').getBoundingClientRect(); const a = document.querySelector('#app'); return b.bottom <= window.innerHeight && b.top >= 0 && b.right <= window.innerWidth && a.scrollLeft === 0; });
  olc(7, 'Mobilde yazarken düğmeler klavyenin arkasında kalmaz, yerleşim oynamaz',
      olcu.gAlt <= olcu.h && !olcu.yatay && olcu.font === '16px' && olcu.sayfaKaydi === 0 && panelAcik && ek, JSON.stringify(olcu));
  await m.screenshot({ path: path.join(process.env.EKRAN_DIZINI || __dirname, 'ekran-mobil.png') });
  await p.screenshot({ path: path.join(process.env.EKRAN_DIZINI || __dirname, 'ekran-genis.png') });

  olc('JS', 'Sayfada JavaScript hatası yok', hatalar.length === 0, hatalar.join(' | '));
  console.log(`\n${gecen} geçti, ${kalan} kaldı`);
  await tarayici.close();
  process.exit(kalan ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
