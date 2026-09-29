# Hamsi Koyu — App Store ve Google Play yayın kontrol listesi

Oyunu iki mağazaya çıkarmak için gerekenleri, yapılanları ve kalanları tek yerde toplar (v1.8).
Hukuki ayrıntılar ve kaynaklar: [`HUKUK.md`](HUKUK.md). Marka ön araştırması: [`MARKA_ON_ARASTIRMA.md`](MARKA_ON_ARASTIRMA.md).

**Kararlar**
- **Ad:** "Balıkçı Tycoon" → **Hamsi Koyu** (TR ve EN mağazada aynı ad).
- **Gelir yok.** Amaç oyuncu ve yorum toplamak. Oyun **tamamen ücretsiz**: **reklam yok, uygulama içi satın alma yok,
  izleme (tracking) yok**.
- **Çevrimiçi skor tablosu zorunlu, her zaman açık (v1.8).** v1.7'deki onay kartı ve Ayarlar'daki aç/kapa düğmesi
  kaldırıldı. İlk oyunda bir kez **KVKK aydınlatma** bildirimi çıkar (tek düğme: **TAMAM**). Bildirim görülmeden hiçbir
  şey gönderilmez; internetsiz oynayan hiçbir şey göndermez. Görüş formu isteğe bağlı kaldı.
- **Sonucu:** yurt dışı aktarım artık açık rızaya dayanamaz. Supabase ile **KVKK standart sözleşmesi** imzalanıp
  KVKK'ya bildirilmeden çevrimiçi skor tablosu **yayına açılamaz** (aşağıda 2. adım, HUKUK.md §6.4).
- Ünlü parodisi karakterler özgünleştirildi (v1.6).

---

## Önce: link ile test (mağazaya çıkmadan)

Oyunu önce bir web linkiyle paylaşıp tepkileri ve oyun sürelerini görmek için:

1. **Supabase** (yukarıdaki kararlar ve aşağıdaki 1. adım): AB/Frankfurt projesi aç, `online/schema.sql`'i çalıştır,
   Project URL + anon key'i `config.js`'e yaz. Anon key herkese açık olacak şekilde tasarlanmıştır; güvenlik RLS ve
   yalnız doğrulayan fonksiyonlarla sağlanır. Service/secret key'i asla koyma.
2. **Siteyi aç:** PR #1'i `main`'e birleştir, sonra GitHub › Settings › Pages › Source: **GitHub Actions**.
   Birkaç dakika sonra oyun şu adreste: **https://recaikas.github.io/okult-kahin-byblbn/**
3. **Linki paylaş.** Oyuncu ilk oyunda KVKK bilgilendirmesini görür; 15 dakika oynayınca oyun bir kez görüş ister
   (yalnız web'de; ilk yoruma oyun içi hediye).
4. **İzle:** en kolayı **https://recaikas.github.io/okult-kahin-byblbn/panel.html** (panel şifresiyle): özet,
   adım adım ilerleme, oyuncuların yolculuğu, görüşler. Ya da Supabase › SQL Editor:
   - `select * from bt_test_ozet;` — kaç kişi, son 24 saat/7 gün, ortalama ve medyan dakika, 10/60 dk üstü oynayan,
     geri dönen, görüş sayısı ve ortalama yıldız.
   - `select * from bt_oyuncular;` — kişi kişi: işletme, oyun süresi, en uzun gün, son görülme.
   - `select * from bt_gorusler limit 50;` — yazılan görüşler.
   - `select * from bt_ilerleme;` — adım adım kaç oyuncu nereye geldi (eğitim, günler, bölgeler, bölüm sonu).
   - `select * from bt_birakma;` — oyunlar hangi günde bırakıldı. `select * from bt_yolculuk;` — oyuncu oyuncu yol.
5. **KVKK notu:** test de olsa yurt dışı aktarım kuralı geçerli (aşağıda 2. adım). Tanıdıklarınla küçük bir testte risk
   düşüktür; linki geniş kitleye yaymadan önce standart sözleşme işini bitir.

---

## 0. Senin yapman gerekenler (sırayla)

Bunları yalnız sen yapabilirsin. Geri kalan her şey depoda hazır.

**1. Supabase projesi** — supabase.com, ücretsiz plan, ~30 dk.
   AB (Frankfurt, `eu-central-1`) bölgesinde proje aç, 2FA'yı aç, DPA'yı kabul et, SQL Editor'da `online/schema.sql`'in
   tamamını çalıştır, `config.js`'e Project URL ve anon anahtarını yaz. Ayrıntı §5.
   `config.js`'i doldurup **kendi cihazında** deneyebilirsin. Ama dolu `config.js`'li bir sürümü başkalarına (kapalı
   test dahil) dağıtmadan önce 2. adım bitmiş olmalı.

**2. ⛔ ENGELLEYİCİ — Supabase ile KVKK standart sözleşmesi, sonra KVKK bildirimi** — ücretsiz, yanıt süresi belirsiz.
   1. Supabase panelinde **Support › New ticket** (https://supabase.com/dashboard/support/new) ile aşağıdaki e-postayı
      gönder. Yanıtı sakla.
   2. **İmzalarlarsa:** KVKK'nın "veri sorumlusundan veri işleyene" standart sözleşmesini (kvkk.gov.tr, değiştirmeden)
      ikiniz imzalayın. İmzadan sonra **5 iş günü içinde** kvkk.gov.tr'deki **Standart Sözleşme Bildirim Modülü**'nden
      Kurula bildir. Bildirmemek idari para cezası sebebidir.
   3. **İmzalamazlarsa** (ya da yanıt gelmezse), üç seçenek var:
      - **(a)** Çevrimiçi özellikler kapalı yayınla: `config.js`'i **boş bırak**. Oyun cihaz içi skor listesiyle tam
        çalışır, hiçbir şey göndermez. En kolay ve risksiz yol.
      - **(b)** Veritabanını Türkiye'de barındırılan bir sağlayıcıya taşı (ücretli; yurt dışı aktarım olmaz).
      - **(c)** Bir KVKK avukatına danış.
   4. Sözleşme gecikirse kapalı testi (4. adım) boş `config.js`'li sürümle başlat; 14 günlük sayaç boşa geçmez.

   Gönderilecek e-posta (İngilizce, köşeli parantezleri doldur):

   ```text
   Subject: KVKK (Türkiye) standard contract – will Supabase sign as processor?

   Hello Supabase team,

   I am an individual developer in Türkiye. I use Supabase as a processor for a small,
   free mobile game ("Hamsi Koyu"). Project ref: [PROJECT REF], region eu-central-1
   (Frankfurt), plan: Free.

   Under Article 9 of Türkiye's Personal Data Protection Law No. 6698 (KVKK), as amended
   in 2024, transfers of personal data from Türkiye to a country without an adequacy
   decision require the standard contract published by the Turkish Data Protection
   Authority ("standart sözleşme", controller-to-processor module). It must be used
   without changes, and I must notify the Authority within 5 business days of signing.
   Your GDPR DPA / EU SCCs unfortunately do not replace it under Turkish law.

   Could you please confirm in writing whether Supabase will sign the KVKK standard
   contract (controller-to-processor) as processor for this project? If yes, what is
   the process and who signs on your side? If not, a short written "no" would also
   help me plan.

   Thank you,
   [AD SOYAD]
   recaizade3145@gmail.com
   ```

**3. Marka ön araştırması** — ücretsiz, ~1 saat, ilk mağaza yüklemesinden önce.
   e-Devlet ile TÜRKPATENT'e gir (https://www.turkpatent.gov.tr/arastirma-yap), "HAMSİ" ve "HAMSİ KOYU"yu sınıf 9, 41
   ve 28'de ara; WIPO, TMview ve iki mağazaya da bak. Yapılabilen ön tarama ve sonuçları yazacağın yer:
   [`MARKA_ON_ARASTIRMA.md`](MARKA_ON_ARASTIRMA.md). Ayrıntı §2.

**4. Google Play Console** — kişisel hesap, **25 $** (bir kez), kimlik doğrulama birkaç gün.
   https://play.google.com/console. Geliştirici e-postası: `recaizade3145@gmail.com`. Yeni kişisel hesapta üretime
   çıkmadan önce **12 testçi × 14 gün kesintisiz** kapalı test şart. Ayrıntı §3.

**5. Apple Developer Program** — bireysel, **99 $/yıl**, onay 1-2 gün.
   https://developer.apple.com/programs/. App Store Connect'te **AB DSA → "non-trader"** beyan et. Ayrıntı §3.

**6. Derle ve yükle** — ücretsiz (iOS için Mac ya da bulut derleme).
   `cd balikci-tycoon/mobile && npm install`, sonra `npm run android` (AAB) ve `npm run ios` (Archive). Yüklemeden önce
   §6 son kontrol, §9 veri beyanları, §10 yaş anketi. Ayrıntı §4.

**7. Yayından sonra (sürekli)**
   - **Ayda bir** `select bt_cleanup();` (ya da §5'teki `pg_cron` ile otomatik).
   - Görüşleri oku: SQL Editor'da `select * from bt_gorusler limit 50;`.
   - `recaizade3145@gmail.com`'a gelen veri/silme isteklerini **en geç 30 gün** içinde yanıtla.
   - Uygunsuz ad bildirilirse sil (§5 madde 8).

**Tamamlananlar ve isteğe bağlılar**
- [x] **İletişim e-postası dolduruldu:** `recaizade3145@gmail.com` (`privacy.html`, `about.html`, `LICENSE`). Mağaza
      sayfalarında ve GitHub'da **herkese açık** görünür; spam gelebilir. İstersen ileride ayrı bir adres açıp üç dosyada
      ve mağaza hesaplarında değiştir.
- [ ] *(İsteğe bağlı)* `LICENSE`, `about.html` ve `privacy.html`'deki "recaikas (GitHub: @recaikas)" satırını gerçek
      adınla değiştir. Apple ve Google mağazada zaten yasal adını gösterir.
- [ ] **Telif kanıtı (5 dk, ücretsiz):** GitHub'da *Releases › Draft a new release* ile `v1.8` sürümünü oluştur;
      https://archive.softwareheritage.org/save/ adresinde depo adresini yazıp "Save code now" de (HUKUK.md §2.2).
- [ ] **Git kimliği:** bundan sonraki commit'ler senin adına olsun:
      `git config --global user.name "[AD SOYAD]"` ve `git config --global user.email "recaizade3145@gmail.com"`
      (HUKUK.md §2.4).

---

## 1. Durum

| Konu | Durum |
|---|---|
| Ünlü parodisi özel müşteriler özgünleştirildi (33 karakter; isim, söz, görünüm) | ✅ v1.6 |
| Yazı tipi gömülü (internetsiz açılır, `fonts/OFL.txt`) | ✅ v1.6 |
| Kayıtlar telefonun kalıcı deposuna yansıtılıyor, açılışta geri yükleniyor | ✅ v1.6 |
| Android geri tuşu, arka planda kayıt, gizli durum çubuğu | ✅ v1.6 |
| Capacitor projesi (`mobile/`), iOS + Android kabukları, dikey kilit | ✅ v1.6 |
| Pixel art simge + açılış ekranı (tüm boyutlar) | ✅ v1.6 |
| Simgede oyun adı: "HAMSİ KOYU" alttaki ahşap iskelede (iOS / tam simge), Android uyarlanabilir simgede balığın altında | ✅ v1.8 |
| Oyun içi görüş formu (yıldız + konu + metin; çevrimdışıyken cihazda bekler) | ✅ |
| Görüş hediyesi: sürümde bir kez, ≥10 harf yorum, puandan bağımsız oyun içi para. **Mağaza puanı/yorumu ödüllendirilmez** (Apple 5.6.1, Google Play) — uygulama inceleme notunda da belirt | ✅ v1.8 |
| Mağazanın kendi değerlendirme penceresi (`@capacitor-community/in-app-review`), 60 günde en çok 1 | ✅ `npm install` + `npm run sync` |
| Yeni ad **Hamsi Koyu** + yeni uygulama kimliği `io.github.recaikas.hamsikoyu` | ✅ v1.7 |
| Çevrimiçi skor tablosu **zorunlu, her zaman açık**; ilk oyunda tek seferlik KVKK aydınlatması (TAMAM), öncesinde gönderim yok. v1.7 onay kartı ve Ayarlar düğmesi kaldırıldı | ✅ v1.8 |
| **KVKK standart sözleşmesi (Supabase) + Kurula bildirim** | ⛔ **yayından önce şart** (§0 adım 2) |
| Kaba/nefret içerikli işletme adları oyunda ve sunucuda (`bt_bad_name`) reddediliyor | ✅ v1.7 |
| "Çevrimiçi verilerimi sil" (skor kayıtları + açılış sayımları + görüşler, sunucu + cihaz) | ✅ |
| Saklama süresi fonksiyonu `bt_cleanup` (açılış sayımları ve görüşler en çok 24 ay) | ✅ v1.7 — **ayda bir çalıştır** (§5) |
| Gizlilik politikası `privacy.html` (TR/EN; veri sorumlusu, KVKK/GDPR, yurt dışı aktarım, saklama, haklar) | ✅ v1.8 (zorunlu skor tablosu, m.5/2-c, standart sözleşme) |
| İletişim e-postası `recaizade3145@gmail.com` (`privacy.html`, `about.html`, `LICENSE`) | ✅ v1.8 |
| `LICENSE` (kaynak görünür, yayımlamak yasak), `THIRD_PARTY_NOTICES.md` | ✅ v1.7 |
| `about.html`: Ayarlar › **Hakkında & Lisanslar** (OFL, MIT, Apache metinleri; internetsiz açılır) | ✅ v1.7 |
| `HUKUK.md` (telif, marka, lisans, KVKK, mağaza yükümlülükleri) | ✅ v1.8 |
| Marka ön araştırması `MARKA_ON_ARASTIRMA.md` | ⏳ TÜRKPATENT araması sende (§0 adım 3) |
| Tutunma sistemleri: çevrimdışı kazanç, başarımlar, günlük görevler, prestij | ⏳ sonraki aşama |
| Mağaza ekran görüntüleri ve tanıtım görseli | ⏳ yayından önce |
| Gerçek cihazda test (en az bir düşük seviye Android + bir iPhone) | ⏳ yayından önce |
| Google Play kapalı testi (12 testçi × 14 gün) | ⏳ yayından önce |

## 2. Ad, uygulama kimliği ve marka

- **Mağaza adı:** **Hamsi Koyu** (TR ve EN). Ad alanı ≤30 karakter olduğu için alt başlıklı sürüm de sığar:
  "Hamsi Koyu: Balıkçı Limanı" (26) / "Hamsi Koyu: Fish Harbor" (23).
- **Uygulama kimliği:** `io.github.recaikas.hamsikoyu`. Şu üç yerde aynı:
  `mobile/capacitor.config.json` (`appId`, `appName: "Hamsi Koyu"`), Android `mobile/android/app/build.gradle`
  (`applicationId`), iOS Xcode projesi (`PRODUCT_BUNDLE_IDENTIFIER`). İlk yüklemeden **sonra değiştirilemez**.
- **Değişmeyenler:** kayıt anahtarları `balikci_*` ve klasör adı `balikci-tycoon/` bilerek aynı kaldı. Değişirse
  oyuncuların web sürümündeki kayıtları ve depo bağlantıları kaybolur.
- **Marka ön araştırması (ilk yüklemeden önce, ücretsiz):**
  1. TÜRKPATENT marka araştırma — https://www.turkpatent.gov.tr/arastirma-yap ("HAMSİ", "HAMSİ KOYU", "HAMSİKÖY";
     sınıf 9, 41, 28)
  2. WIPO Global Brand Database — https://branddb.wipo.int
  3. EUIPO eSearch — https://euipo.europa.eu/eSearch (ya da TMview — https://www.tmdn.org/tmview)
  4. App Store ve Google Play'de "Hamsi Koyu" ve "Hamsi" (TR ve ABD mağazaları)

  "Hamsi Koyu" aynı zamanda Garipçe (Sarıyer) yakınındaki gerçek bir koyun adı. Risk düşük (HUKUK.md §3). Tescil
  isteğe bağlı: sınıf 9 + 41, ≈12.650 TL resmî ücret. Ön tarama ve senin arama sonuçların:
  [`MARKA_ON_ARASTIRMA.md`](MARKA_ON_ARASTIRMA.md).

## 3. Hesaplar ve mağaza beyanları

**Apple Developer Program** (bireysel, 99 $/yıl) — https://developer.apple.com/programs/
- Satıcı olarak yasal adın görünür. Destek/iletişim: `recaizade3145@gmail.com`; destek adresi olarak `about.html` ya da
  `privacy.html` verilebilir.
- **AB DSA:** App Store Connect'te **"non-trader" (tacir değilim)** beyan et. Gelir yok, ticari amaç yok (HUKUK.md §6.1).
- **Şifreleme:** yalnız HTTPS, muaf. `Info.plist`'te `ITSAppUsesNonExemptEncryption = NO` zaten var.
- **Kategori:** Oyunlar › Simülasyon (ikincil: Gündelik). **Kids kategorisini seçme.**

**Google Play Console** (kişisel hesap, 25 $, bir kez) — https://play.google.com/console
- Kimlik doğrulaması gerekir. Herkese açık görünenler: yasal adın, ülken, geliştirici e-postan
  (`recaizade3145@gmail.com`). Para kazanmadığın için adresin görünmez.
- **Kapalı test şartı:** yeni kişisel hesapta üretime çıkmadan önce en az **12 test kullanıcısı**, **14 gün
  kesintisiz** kapalı teste katılmalı. Sonra "üretim erişimi" başvurusu yapılır.
  Aile ve arkadaşları bir Google Grubu'na ekle, testçi bağlantısını paylaş. Standart sözleşme henüz yoksa testi boş
  `config.js`'li sürümle yap (§0 adım 2).
- **Beyanlar:** Reklam içeriyor mu → **Hayır**. Uygulama içi satın alma → **Yok**. Hedef kitle ve veri güvenliği → §9,
  §10. Haber/finans/sağlık/devlet → Hayır. Hesap silme bağlantısı → hesap yok, gerekmez (silme düğmesini veri güvenliği
  formunda belirt).
- **Families programına katılma.**

## 4. Sürüm ve derleme

- **Sürüm:** Android `mobile/android/app/build.gradle` (`versionCode` her yüklemede +1, `versionName` "1.0");
  iOS Xcode › General › Version / Build.
- **Cihazlar:** iOS ilk sürümde yalnız iPhone (iPad'de uyumluluk modunda çalışır; iPad ekran görüntüsü gerekmez).
  Android telefon + tablet, dikey.

Ön koşul: Node 20+, `cd balikci-tycoon/mobile && npm install`.

```bash
npm run build       # oyun dosyalarını www/'ya kopyalar (privacy.html ve about.html dahil)
npm run sync        # build + iOS/Android projelerine aktarır
npm run android     # sync + Android Studio'da açar → Build › Generate Signed Bundle (AAB)
npm run ios         # sync + Xcode'da açar (yalnız macOS) → Product › Archive → App Store Connect'e yükle
npm run assets      # simge ve açılış ekranlarını mobile/assets'ten üretir
```

- `mobile/www/` bir derleme çıktısıdır ve eski adı taşıyabilir. Yüklemeden önce mutlaka `npm run sync` çalıştır.
- **Android imzalama:** ilk AAB'de bir yükleme anahtarı (keystore) oluşturulur. **Dosyayı ve şifresini kaybetme**,
  depoya koyma. Play App Signing'i aç.
- **iOS imzalama:** Xcode › Signing & Capabilities › "Automatically manage signing" + Apple Developer takımın.
- **Mac yoksa:** iOS için bulut derleme (GitHub Actions macOS, Codemagic, Ionic Appflow). Android her işletim
  sisteminde derlenir.
- **Simge veya açılış ekranı değişirse:** `node scripts/render-icons.js` (oyun klasörü 8099'da sunulurken), ardından
  `npm run assets`. v1.8 simgesinde "HAMSİ KOYU" yazısı var (§8); açılış ekranı değişmedi.
- **Web sürümü:** GitHub Pages iş akışı (`.github/workflows/balikci-pages.yml`) `privacy.html` ve `about.html`'i de
  yayımlar. `native.js` web'de yalnız oyun dosyalarını yükler.

## 5. Supabase kurulumu

Skor tablosu oyunun zorunlu parçası, ama `config.js` boşsa oyun hiçbir şey göndermez ve yalnız cihaz içi skor
listesiyle tam çalışır. Standart sözleşme (madde 7) bitmeden dağıtılan sürümlerde `config.js` boş kalmalı.

1. https://supabase.com'da yeni proje aç. **Bölge: Central EU (Frankfurt) — `eu-central-1`.** Sonradan taşınamaz.
2. Supabase'in **DPA**'sını (veri işleme sözleşmesi) panelden kabul et ya da indirip sakla:
   https://supabase.com/legal/customer-resources/data-processing-addendum
3. Supabase hesabında **2FA**'yı aç.
4. SQL Editor'da **`online/schema.sql`'in tamamını** çalıştır. Mevcut projede de yeniden çalıştır. v1.7'de yeni:
   `bt_bad_name` (ad filtresi) ve `bt_cleanup` (saklama süresi); `bt_forget` ve `bt_feedback` de aynı dosyada.
5. **Saklama süresi:** `bt_cleanup()` ayda bir çalışmalı. İki yol:
   - Otomatik: Database › Extensions › `pg_cron`'u aç, sonra
     `select cron.schedule('bt-cleanup', '17 3 1 * *', 'select public.bt_cleanup()');`
   - Elle: ayda bir `select bt_cleanup();`
6. `config.js`'e Project URL ve "anon public" anahtarı yaz (Project Settings › API).
7. ⛔ **KVKK standart sözleşmesi:** §0 adım 2'deki e-postayla Supabase'e sor. İmzalanırsa **5 iş günü** içinde KVKK'ya
   bildir. İmzalanmazsa: (a) `config.js` boş yayınla, (b) Türkiye'de barındırılan veritabanı, (c) KVKK avukatı
   (HUKUK.md §6.4).
8. Uygunsuz bir ad gelirse: `delete from bt_scores where run_id = '...';` (`schema.sql` sonundaki hazır sorgular).

## 6. Yayından önce son kontrol

- [ ] §0'daki kişisel adımlar tamam. **Dolu `config.js` ile yayın yalnız standart sözleşme imzalanıp KVKK'ya
      bildirildiyse.** Değilse `config.js` boş.
- [ ] GitHub Pages açık (Settings › Pages › Source: GitHub Actions). İki mağazanın istediği gizlilik adresi:
      **https://recaikas.github.io/okult-kahin-byblbn/privacy.html** (oyunu kendi deposuna taşırsan adres değişir,
      HUKUK.md §4.4).
- [ ] Lisans bildirimleri yerinde: `LICENSE`, `THIRD_PARTY_NOTICES.md`, `fonts/OFL.txt`; oyunda Ayarlar › **Hakkında &
      Lisanslar** internetsiz açılıyor.
- [ ] `npm install` sonrası `in-app-review` eklentisinin lisansını ve Android bağımlılığını doğrula,
      gerekirse `THIRD_PARTY_NOTICES.md` ve `about.html`'e ekle.
- [ ] Aydınlatma akışı: ilk oyunda KVKK bildirimi bir kez çıkıyor (TAMAM); o görülmeden hiçbir istek gitmiyor;
      internetsiz oyunda gönderim yok; Ayarlar'da "HER ZAMAN AÇIK" yazıyor; "Çevrimiçi verilerimi sil" sunucu kayıtlarını
      ve görüşleri siliyor, yeni kimlik üretiyor.
- [ ] Simge: "HAMSİ KOYU" yazısı yuvarlak/damla maskeli Android başlatıcıda kesilmiyor, küçük boyutta okunuyor.
- [ ] Gerçek cihaz testi: kayıt → uygulamayı kapat/aç → devam; geri tuşu; arka plana alıp dönme; sesler; performans.
- [ ] Ekran görüntüleri (§8).

## 7. Mağaza listeleme metinleri (taslak)

**Ad (≤30):** Hamsi Koyu (ya da "Hamsi Koyu: Balıkçı Limanı" / "Hamsi Koyu: Fish Harbor")

**Apple alt başlık (≤30):** TR *Tezgâhtan limana balıkçılık* · EN *From one stall to a harbor*

**Google kısa açıklama (≤80):**
- TR: *Tezgâhtan limana: Karadeniz kıyısında kendi balıkçı işletmeni kur.*
- EN: *From one stall to a busy harbor: build your own seaside fishing business.*

**Açıklama — TR**
> Hamsi Koyu'na hoş geldin! Bir sandık ve bir ağla başla; Karadeniz kıyısındaki bu küçük koyda kendi balıkçı
> işletmeni kur. Ağlardan balığı topla, filetola, tezgâha diz; müşteriler kuyrukta seni bekliyor.
> • Üç bölge: Balıkçı İskelesi, Balık Pazarı ve Fümehane
> • Çalışan al, müdür ata, bölgeleri tam otomatiğe bağla
> • Liman Meydanı, depo, Kapalı Pazar ve beş hizmet binası: her biri kendi mimarisiyle büyür
> • Her gün yeni yüzler: 50 renkli, özgün müşteri — dans eden pop yıldızından martı terbiyecisine
> • Balık Pazarı günleri, kontratlar, borsa ve holding
> • Pixel art dünya, kendi bestesi olan müzikler, Türkçe ve İngilizce
> • Çevrimiçi skor tablosunda diğer işletmelerle yarış; internetsiz de oynanır
> Tamamen ücretsiz: reklam yok, uygulama içi satın alma yok, izleme yok. Görüşlerini oyunun içinden yazabilirsin.

**Description — EN**
> Welcome to Hamsi Koyu! Start with one crate and one net, and build your own fishing business in a little cove on the
> Black Sea coast. Gather the catch, fillet it, stock your stalls — customers are already lining up.
> • Three zones: the Fishermen's Pier, the Fish Market and the Smokehouse
> • Hire staff, appoint managers and put whole zones on autopilot
> • Harbour square, depot, a covered market and five service buildings, each growing in its own architecture
> • New faces every day: 50 colourful, original customers — from a dancing pop star to a seagull trainer
> • Market days, contracts, a stock market and a holding company
> • Pixel-art world, original music, Turkish and English
> • Compete with other harbours on the online leaderboard; also plays offline
> Completely free: no ads, no in-app purchases, no tracking. Send us your feedback right from the game.

**Anahtar kelimeler (Apple, ≤100 karakter; ad zaten aranır, tekrar yazma; "tycoon" ve başka oyunların adları yok):**
- TR: `balık,balıkçı,liman,pazar,işletme,idle,simülasyon,pixel,karadeniz,tezgah,tekne,fümehane` (87 karakter)
- EN: `fishing,fish,harbor,market,idle,business,simulation,pixel,seaside,boat,manager,stall,smokehouse` (95 karakter)

Türkçe harfler App Store Connect sayacında fazla sayılırsa sondan bir kelime çıkar.
Google Play'de anahtar kelime alanı yok; ad, kısa ve uzun açıklama aranır. Ad ve kısa açıklamaya "ücretsiz" ya da
"reklamsız" gibi tanıtım sözcükleri yazma (Google meta veri politikası); uzun açıklamada sorun yok.

**Kategori:** Oyun › Simülasyon (ikincil: Gündelik / Casual)

## 8. Ekran görüntüleri

- **Google Play:** en az 2 telefon görüntüsü (dikey 9:16, kenar 320–3840 px), 1024×500 **tanıtım görseli**,
  512×512 simge (`mobile/assets/icon-only.png`'den küçültülür).
- **Simge (v1.8):** oyun adı "HAMSİ KOYU" alttaki ahşap iskeleye boyalı (iOS / tam simge, mağaza simgesi); Android
  uyarlanabilir simgede ön katmanda balığın altında. Açılış ekranı değişmedi. Mağaza simgesine ek yazı, rozet ya da
  "ücretsiz" ibaresi koyma.
- **App Store:** 6,9" iPhone (1320×2868 ya da 1290×2796) en az 1, en çok 10 görüntü.
- Önerilen sahneler: (1) sabah ilk tezgâh, (2) kalabalık Balık Pazarı günü, (3) Hizmet Sahası Sv.5, (4) özel müşteri
  konuşması, (5) bölüm sonu gazetesi. Oyunun kendi ekran görüntüsü aracıyla (`test-*.js` betiklerindeki gibi)
  doğru çözünürlükte alınabilir.
- Görsellerde ve metinde çocuklara seslenme (hedef kitle 13+, §10).

## 9. Veri beyanları (öneri — son sözü sen verirsin)

Oyun hesap istemez; e-posta, konum, rehber toplamaz; reklam ve izleme aracı içermez. Kayıtlar yalnız cihazda.
v1.8'de **skor tablosu zorunlu**: KVKK aydınlatması bir kez görüldükten sonra, internet varken her oyuncudan gider.
Görüş formu isteğe bağlı.
- **Skor tablosu (zorunlu):** işletme adı ve karakter adı, oyun istatistikleri (**herkese açık**); rastgele anonim
  oyuncu ve oyun kimliği, dil, açılış zamanı (herkese açık değil).
- **Görüş formu (isteğe bağlı):** 1–5 yıldız, konu, serbest metin (≤500), dil, sürüm, oyun günü (**herkese açık
  değil**, yalnız geliştirici okur).

Satılmaz, reklamda kullanılmaz, paylaşılmaz, kimliğe bağlanmaz. Sunucu: Supabase, AB (Frankfurt). Ayarlar ›
**Çevrimiçi verilerimi sil** hepsini siler.

> `config.js` **boş** yayınlarsan (§0 adım 2, seçenek a) hiçbir veri gitmez: Google'da "veri toplamıyor", Apple'da
> "Data Not Collected" seç. Sonra doldurursan beyanları **güncellemeden** yeni sürümü yükleme.

**Google Play › Veri güvenliği**
| Soru | Cevap |
|---|---|
| Veri topluyor ya da paylaşıyor mu? | **Evet**, topluyor. Üçüncü tarafla **paylaşmıyor** (Supabase veri işleyen; Google'ın tanımında paylaşım sayılmaz) |
| Aktarımda şifreli mi? | **Evet** (HTTPS) |
| Silme isteği yolu var mı? | **Evet** — oyun içinde Ayarlar › "Çevrimiçi verilerimi sil"; ayrıca `recaizade3145@gmail.com` |
| Uygulama etkinliği › **Diğer işlemler** (oyun istatistikleri: balık, para, gün, süre) | Toplanıyor · **Zorunlu** · Uygulama işlevselliği |
| Uygulama etkinliği › **Uygulama etkileşimleri** (açılış sayımı) | Toplanıyor · **Zorunlu** · Uygulama işlevselliği, Analiz |
| Uygulama etkinliği › **Diğer kullanıcı tarafından oluşturulan içerik** (işletme/karakter adı; ayrıca görüş metni + yıldız) | Toplanıyor · **Zorunlu** (ad için; görüş kısmı isteğe bağlı ama tür tek satır olduğu için "zorunlu" işaretle) · Uygulama işlevselliği, Analiz |
| **Cihaz veya diğer kimlikler** (rastgele anonim oyuncu kimliği; reklam kimliği değil) | Toplanıyor · **Zorunlu** · Uygulama işlevselliği, dolandırıcılık önleme/güvenlik |
| Geçici işleniyor mu? | Hayır (saklanıyor) |
| Reklam / reklam kimliği / izleme | **Hayır** |

**App Store › Uygulama Gizliliği**
| Soru | Cevap |
|---|---|
| Veri türleri | Kullanıcı İçeriği › **Oyun İçeriği** (ad, istatistik); Kullanıcı İçeriği › **Diğer Kullanıcı İçeriği** (görüş metni + yıldız); Tanımlayıcılar › **Kullanıcı Kimliği** (rastgele anonim kimlik); Kullanım Verileri › **Ürün Etkileşimi** (açılış sayımı) |
| Amaç | **Uygulama İşlevselliği**; açılış sayımı ve görüşler için ayrıca Analiz |
| Kimliğe bağlı mı? | **Hayır** → hepsi **"Data Not Linked to You"** |
| İzleme (tracking) için mi? | **Hayır** — "Data Used to Track You" boş; ATT izni gerekmez, reklam kimliği okunmaz |

**Kullanıcı içeriği politikası** (Apple Yönergesi 1.2, Google Play UGC)
- Kullanıcı içeriği var mı: **Evet**, yalnız skor tablosundaki işletme/karakter adları. Sohbet ve mesajlaşma yok.
- Filtre: kaba ve nefret içerikli adlar **oyunda ve sunucuda** (`bt_bad_name`) reddedilir.
- Silme: oyuncu kendi kaydını oyun içinden silebilir; geliştirici SQL ile siler (§5 madde 8).
- Bildirim yolu: gizlilik sayfasındaki iletişim adresi (`recaizade3145@gmail.com`).

**Değerlendirme penceresi kuralları:** mağazanın kendi penceresi kullanılır (Apple SKStoreReviewController / Google
Play In-App Review). Ödül karşılığı istenmez, görüş formundaki puana göre gösterilmez ("review gating" yasak). Yalnız
Bölüm 1 sonu ya da ≥3 gün oynanıp iyi kapanan bir günün ardından sorulur; ilk oturumda ve bir aksilikten hemen sonra
sorulmaz. Yorum toplamanın asıl yolu bu ve oyun içi görüş formu.

## 10. Yaş derecelendirmesi ve hedef kitle

İçerik her yaşa uygun, ama oyun çocuklara yönelik değil (HUKUK.md §6.5, §6.6).

- **Google Play › Hedef kitle:** **13-15, 16-17, 18+**. "Çocuklara hitap ediyor mu?" → çocuklar için tasarlanmadı.
  **Families programına katılma.**
- **Apple:** içerik derecelendirmesi **4+** hedeflenir (yeni anket: 4+/9+/13+/16+/18+), ama **Kids kategorisi
  seçilmez**. Denetlenmeyen kullanıcı içeriği sorusu derecelendirmeyi yükseltebilir; filtre ve silme yolu olduğunu
  belirt.
- **IARC / Apple anketi cevapları:**

| Soru | Cevap |
|---|---|
| Şiddet | Hayır / çok hafif çizgi film ("tekme şovu", kan yok) |
| Korku, cinsellik, çıplaklık, küfür | Hayır |
| Uyuşturucu, alkol, tütün | Hayır |
| Kumar / gerçek para | Hayır (mezat ve borsa oyun parasıyla; şans oyunu değil, ticaret simülasyonu) |
| Kullanıcılar etkileşir / içerik paylaşır | **Evet** (skor tablosunda oyuncunun yazdığı ad herkese görünür; filtreli) |
| Sohbet, konum paylaşımı, satın alma, reklam | Hayır |

Beklenen sonuç: **PEGI 3 / ESRB Everyone ("Users Interact" etiketiyle) / App Store 4+**.

## 11. Sonraki aşama

- Tutunma sistemleri: çevrimdışı kazanç, başarımlar, günlük görevler, prestij.
- Oyunu kendi deposuna taşımak (`recaikas/hamsi-koyu`), ilk mağaza yüklemesinden önce (HUKUK.md §4.4).
- **Gelir planlanmıyor.** İleride masrafları karşılamak istersen (reklam, satın alma, bağış) yeniden değerlendirilir.
  O zaman `privacy.html`, veri beyanları, Apple DSA trader durumu ve vergi (GVK 20/B, HUKUK.md §6.3) baştan ele alınır.
