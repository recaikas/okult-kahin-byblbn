# Hamsi Koyu — App Store ve Google Play yayın kontrol listesi

Oyunu iki mağazaya çıkarmak için gerekenleri, yapılanları ve kalanları tek yerde toplar (v1.7).
Hukuki ayrıntılar ve kaynaklar: [`HUKUK.md`](HUKUK.md).

**Kararlar**
- **Ad:** "Balıkçı Tycoon" → **Hamsi Koyu** (TR ve EN mağazada aynı ad).
- **Gelir yok.** Amaç oyuncu ve yorum toplamak. Oyun **tamamen ücretsiz**: **reklam yok, uygulama içi satın alma yok,
  izleme (tracking) yok**.
- **Çevrimiçi skor tablosu ve görüş formu isteğe bağlı (opt-in):** varsayılan kapalı. Oyuncu ilk kez skor tablosunu
  açtığında ya da görüş gönderdiğinde bir onay kartı sorar (AB/Almanya'daki Supabase sunucuları, adın ve
  istatistiklerin herkese açık olması).
- Ünlü parodisi karakterler özgünleştirildi (v1.6).

---

## 0. Senin yapman gerekenler

Bunları yalnız sen yapabilirsin. Geri kalan her şey depoda hazır.

- [ ] **İletişim e-postası:** `privacy.html` içindeki **`[İLETİŞİM E-POSTASI]`** (TR, 2 yer) ve **`[CONTACT EMAIL]`**
      (EN, 2 yer) alanlarını gerçek bir adresle değiştir. Yalnız bu iş için ayrı bir adres önerilir.
- [ ] **Geliştirici hesapları:** Apple Developer (99 $/yıl) ve Google Play Console (25 $, bir kez; kimlik doğrulama).
      Ayrıntı §3.
- [ ] **Supabase:** AB (Frankfurt) projesi aç, `online/schema.sql`'i çalıştır, `config.js`'i doldur. Adımlar §5.
      Çevrimiçi özellik istemiyorsan bu adımı atla; `config.js` boşken oyun hiçbir şey göndermez.
- [ ] **Marka ön araştırması:** "Hamsi Koyu" için ilk yüklemeden önce TÜRKPATENT, WIPO, EUIPO, App Store ve Google Play
      araması. Ayrıntı §2.
- [ ] *(İsteğe bağlı)* `LICENSE`, `about.html` ve `privacy.html`'deki "recaikas (GitHub: @recaikas)" satırını gerçek
      adınla değiştir. Apple ve Google mağazada zaten yasal adını gösterir.
- [ ] **Git kimliği:** bundan sonraki commit'ler senin adına olsun:
      `git config --global user.name "[AD SOYAD]"` ve `git config --global user.email "[E-POSTA]"` (HUKUK.md §2.4).

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
| Oyun içi görüş formu (yıldız + konu + metin; çevrimdışıyken cihazda bekler) | ✅ |
| Mağazanın kendi değerlendirme penceresi (`@capacitor-community/in-app-review`), 60 günde en çok 1 | ✅ `npm install` + `npm run sync` |
| Yeni ad **Hamsi Koyu** + yeni uygulama kimliği `io.github.recaikas.hamsikoyu` | ✅ v1.7 |
| Çevrimiçi skor/görüş **varsayılan kapalı**, ilk kullanımda onay kartı | ✅ v1.7 |
| Kaba/nefret içerikli işletme adları oyunda ve sunucuda (`bt_bad_name`) reddediliyor | ✅ v1.7 |
| "Çevrimiçi verilerimi sil" (skor kayıtları + açılış sayımları + görüşler, sunucu + cihaz) | ✅ |
| Saklama süresi fonksiyonu `bt_cleanup` (açılış sayımları ve görüşler en çok 24 ay) | ✅ v1.7 — **ayda bir çalıştır** (§5) |
| Gizlilik politikası `privacy.html` (TR/EN; veri sorumlusu, KVKK/GDPR, yurt dışı aktarım, saklama, haklar) | ✅ v1.7 — **e-postayı doldur** |
| `LICENSE` (kaynak görünür, yayımlamak yasak), `THIRD_PARTY_NOTICES.md` | ✅ v1.7 |
| `about.html`: Ayarlar › **Hakkında & Lisanslar** (OFL, MIT, Apache metinleri; internetsiz açılır) | ✅ v1.7 |
| `HUKUK.md` (telif, marka, lisans, KVKK, mağaza yükümlülükleri) | ✅ v1.7 |
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
  isteğe bağlı: sınıf 9 + 41, ≈12.650 TL resmî ücret.

## 3. Hesaplar ve mağaza beyanları

**Apple Developer Program** (bireysel, 99 $/yıl) — https://developer.apple.com/programs/
- Satıcı olarak yasal adın görünür.
- **AB DSA:** App Store Connect'te **"non-trader" (tacir değilim)** beyan et. Gelir yok, ticari amaç yok (HUKUK.md §6.1).
- **Şifreleme:** yalnız HTTPS, muaf. `Info.plist`'te `ITSAppUsesNonExemptEncryption = NO` zaten var.
- **Kategori:** Oyunlar › Simülasyon (ikincil: Gündelik). **Kids kategorisini seçme.**

**Google Play Console** (kişisel hesap, 25 $, bir kez) — https://play.google.com/console
- Kimlik doğrulaması gerekir. Herkese açık görünenler: yasal adın, ülken, geliştirici e-postan. Para kazanmadığın için
  adresin görünmez.
- **Kapalı test şartı:** yeni kişisel hesapta üretime çıkmadan önce en az **12 test kullanıcısı**, **14 gün
  kesintisiz** kapalı teste katılmalı. Sonra "üretim erişimi" başvurusu yapılır.
  Aile ve arkadaşları bir Google Grubu'na ekle, testçi bağlantısını paylaş.
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
  `npm run assets`.
- **Web sürümü:** GitHub Pages iş akışı (`.github/workflows/balikci-pages.yml`) `privacy.html` ve `about.html`'i de
  yayımlar. `native.js` web'de yalnız oyun dosyalarını yükler.

## 5. Supabase kurulumu (yalnız çevrimiçi skor/görüş istiyorsan)

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
7. Supabase destek ekibine **yazılı olarak** KVKK standart sözleşmesi imzalayıp imzalamayacaklarını sor. İmzalarlarsa
   5 iş günü içinde KVKK'ya bildir. İmzalamazlarsa seçenekler için HUKUK.md §6.4'e bak.
8. Uygunsuz bir ad gelirse: `delete from bt_scores where run_id = '...';` (`schema.sql` sonundaki hazır sorgular).

## 6. Yayından önce son kontrol

- [ ] §0'daki kişisel adımlar tamam.
- [ ] GitHub Pages açık (Settings › Pages › Source: GitHub Actions). İki mağazanın istediği gizlilik adresi:
      **https://recaikas.github.io/okult-kahin-byblbn/privacy.html** (oyunu kendi deposuna taşırsan adres değişir,
      HUKUK.md §4.4).
- [ ] Lisans bildirimleri yerinde: `LICENSE`, `THIRD_PARTY_NOTICES.md`, `fonts/OFL.txt`; oyunda Ayarlar › **Hakkında &
      Lisanslar** internetsiz açılıyor.
- [ ] `npm install` sonrası `in-app-review` eklentisinin lisansını ve Android bağımlılığını doğrula,
      gerekirse `THIRD_PARTY_NOTICES.md` ve `about.html`'e ekle.
- [ ] Onay kartı akışı: ilk açılışta hiçbir şey gönderilmiyor; skor tablosu ya da görüş ilk açıldığında kart çıkıyor;
      "Hayır" sonrası gönderim yok; "Çevrimiçi verilerimi sil" çalışıyor.
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
> • İnternetsiz oynanır; istersen çevrimiçi skor tablosuna katıl
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
> • Plays offline; join the online leaderboard only if you want to
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
- **App Store:** 6,9" iPhone (1320×2868 ya da 1290×2796) en az 1, en çok 10 görüntü.
- Önerilen sahneler: (1) sabah ilk tezgâh, (2) kalabalık Balık Pazarı günü, (3) Hizmet Sahası Sv.5, (4) özel müşteri
  konuşması, (5) bölüm sonu gazetesi. Oyunun kendi ekran görüntüsü aracıyla (`test-*.js` betiklerindeki gibi)
  doğru çözünürlükte alınabilir.
- Görsellerde ve metinde çocuklara seslenme (hedef kitle 13+, §10).

## 9. Veri beyanları (öneri — son sözü sen verirsin)

Oyun hesap istemez, reklam ve izleme aracı içermez. Kayıtlar yalnız cihazda. Sunucuya veri **yalnız oyuncu onay
kartında katılırsa** gider:
- **Skor tablosu:** işletme adı ve karakter adı, oyun istatistikleri (**herkese açık**); rastgele anonim oyuncu ve oyun
  kimliği, dil, açılış zamanı (herkese açık değil).
- **Görüş formu:** 1–5 yıldız, konu, serbest metin (≤500), dil, sürüm, oyun günü (**herkese açık değil**, yalnız
  geliştirici okur).

Satılmaz, reklamda kullanılmaz, paylaşılmaz, kimliğe bağlanmaz. Sunucu: Supabase, AB (Frankfurt). Ayarlar › **Çevrimiçi
verilerimi sil** hepsini siler.

**Google Play › Veri güvenliği**
| Soru | Cevap |
|---|---|
| Veri topluyor mu? | **Evet** (yalnız isteğe bağlı çevrimiçi özellikler için) |
| Veri türleri | Uygulama etkinliği › **Diğer kullanıcı tarafından oluşturulan içerik** (işletme/karakter adı, görüş metni ve yıldız); Uygulama etkinliği › **Uygulama etkileşimleri** (oyun istatistikleri, açılış sayımı); **Cihaz veya diğer kimlikler** (anonim oyuncu kimliği) |
| Amaç | Uygulama işlevselliği; açılış sayımı ve görüşler için ayrıca Analiz |
| Toplama isteğe bağlı mı? | **Evet** (onay kartı, Ayarlar'dan kapatılabilir) |
| Üçüncü tarafla paylaşım | **Hayır** (Supabase veri işleyen; Google'ın tanımında paylaşım sayılmaz) |
| Aktarımda şifreli | **Evet** (HTTPS) |
| Silme isteği | **Evet** — oyun içinde "Çevrimiçi verilerimi sil"; ayrıca iletişim e-postası |
| Reklam / reklam kimliği | **Hayır** |

**App Store › Uygulama Gizliliği**
| Soru | Cevap |
|---|---|
| Veri türleri | Kullanıcı İçeriği › **Oyun İçeriği** (ad, istatistik); Kullanıcı İçeriği › **Diğer Kullanıcı İçeriği** (görüş metni + yıldız); Tanımlayıcılar › **Kullanıcı Kimliği** (anonim kimlik); Kullanım Verileri › **Ürün Etkileşimi** (açılış sayımı) |
| Amaç | Uygulama İşlevselliği; açılış sayımı ve görüşler için ayrıca Analiz |
| Kimliğe bağlı mı? | **Hayır** |
| İzleme (tracking) için mi? | **Hayır** — ATT izni gerekmez, reklam kimliği okunmaz |

**Kullanıcı içeriği politikası** (Apple Yönergesi 1.2, Google Play UGC)
- Kullanıcı içeriği var mı: **Evet**, yalnız skor tablosundaki işletme/karakter adları. Sohbet ve mesajlaşma yok.
- Filtre: kaba ve nefret içerikli adlar **oyunda ve sunucuda** (`bt_bad_name`) reddedilir.
- Silme: oyuncu kendi kaydını oyun içinden silebilir; geliştirici SQL ile siler (§5 madde 8).
- Bildirim yolu: gizlilik sayfasındaki iletişim adresi.

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
| Kullanıcılar etkileşir / içerik paylaşır | **Evet** (skor tablosunda oyuncunun yazdığı ad; isteğe bağlı, filtreli) |
| Sohbet, konum paylaşımı, satın alma, reklam | Hayır |

Beklenen sonuç: **PEGI 3 / ESRB Everyone ("Users Interact" etiketiyle) / App Store 4+**.

## 11. Sonraki aşama

- Tutunma sistemleri: çevrimdışı kazanç, başarımlar, günlük görevler, prestij.
- Oyunu kendi deposuna taşımak (`recaikas/hamsi-koyu`), ilk mağaza yüklemesinden önce (HUKUK.md §4.4).
- **Gelir planlanmıyor.** İleride masrafları karşılamak istersen (reklam, satın alma, bağış) yeniden değerlendirilir.
  O zaman `privacy.html`, veri beyanları, Apple DSA trader durumu ve vergi (GVK 20/B, HUKUK.md §6.3) baştan ele alınır.
