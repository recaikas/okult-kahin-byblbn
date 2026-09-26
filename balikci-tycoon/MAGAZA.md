# Balıkçı Tycoon — App Store ve Google Play yayın kontrol listesi

Bu belge oyunu iki mağazaya çıkarmak için gereken her şeyi, yapılanları ve kalanları tek yerde toplar.
Kararlar: **ücretsiz + ödüllü reklam** (zorla reklam yok), ünlü parodisi karakterler **özgünleştirildi**,
ilk aşama **teknik + hukuki hazırlık**.

---

## 1. Durum

| Konu | Durum |
|---|---|
| Ünlü parodisi özel müşteriler özgünleştirildi (33 karakter; isim, söz, görünüm) | ✅ v1.6 |
| Yazı tipi uygulamaya gömülü (internetsiz açılır, OFL lisansı `fonts/OFL.txt`) | ✅ v1.6 |
| Kayıtlar telefonun kalıcı deposuna yansıtılıyor, açılışta geri yükleniyor | ✅ v1.6 |
| Android geri tuşu, arka planda kayıt, gizli durum çubuğu | ✅ v1.6 |
| Capacitor projesi (`mobile/`), iOS + Android kabukları, dikey kilit | ✅ v1.6 |
| Pixel art uygulama simgesi + açılış ekranı (tüm boyutlar üretildi) | ✅ v1.6 |
| Gizlilik politikası (`privacy.html`, TR/EN) + oyun içinden açılıyor | ✅ v1.6 — **iletişim e-postasını doldur** |
| Çevrimiçi skor paylaşımını kapatma + "Skor kaydımı sil" (sunucu + cihaz) | ✅ v1.6 — **schema.sql'i Supabase'de yeniden çalıştır** |
| Ödüllü reklam (AdMob) + reklam izni (GDPR/UMP, iOS ATT) | ⏳ sonraki aşama |
| Tutunma sistemleri: çevrimdışı kazanç, başarımlar, günlük görevler, prestij | ⏳ sonraki aşama |
| Mağaza ekran görüntüleri ve tanıtım görseli | ⏳ yayından önce |
| Gerçek cihazda test (en az bir düşük seviye Android + bir iPhone) | ⏳ yayından önce |
| Google Play kapalı test dönemi | ⏳ yayından önce |

## 2. Hesaplar ve ücretler

- **Apple Developer Program:** yıllık 99 $ — https://developer.apple.com/programs/
- **Google Play Console:** tek seferlik 25 $ — https://play.google.com/console
- Yeni **kişisel** Play hesaplarında üretime çıkmadan önce **kapalı test** zorunlu (belirli sayıda test kullanıcısı,
  belirli gün sayısı). Şartlar değişebiliyor; başvururken Play Console'daki güncel sayıya bak.
- Kurumsal (şirket) hesabı açarsan D-U-N-S numarası gerekir; kapalı test şartı kişisel hesaplara uygulanır.

## 3. Uygulama kimliği ve sürüm

- **Uygulama kimliği:** `io.github.recaikas.balikcitycoon` (`mobile/capacitor.config.json`).
  İlk yüklemeden **sonra değiştirilemez**. Kendi alan adın olacaksa (ör. `com.alanadin.balikci`) ilk yüklemeden önce
  değiştir, ardından `npx cap sync` çalıştır.
- **Sürüm:** Android `mobile/android/app/build.gradle` (`versionCode` her yüklemede +1, `versionName` "1.0");
  iOS Xcode › General › Version / Build.
- **Cihazlar:** iOS ilk sürümde yalnız iPhone (iPad'de iPhone uyumluluk modunda çalışır; iPad ekran görüntüsü
  gerekmez). Android telefon + tablet, dikey.

## 4. Derleme

Ön koşul: Node 20+, `cd balikci-tycoon/mobile && npm install`.

```bash
npm run sync        # oyun dosyalarını www/'ya kopyalar + iOS/Android projelerine aktarır
npm run android     # Android Studio'da açar → Build › Generate Signed Bundle (AAB)
npm run ios         # Xcode'da açar (yalnız macOS) → Product › Archive → App Store Connect'e yükle
```

- **Android imzalama:** ilk AAB'de bir yükleme anahtarı (keystore) oluşturulur. **Bu dosyayı ve şifresini kaybetme**,
  depoya koyma. Play App Signing'i aç; asıl imza anahtarını Google saklar.
- **iOS imzalama:** Xcode › Signing & Capabilities › "Automatically manage signing" + Apple Developer takımın.
- **Mac yoksa:** iOS derlemesi için bulut derleme (GitHub Actions macOS makinesi, Codemagic, Ionic Appflow gibi)
  kullanılabilir. Android derlemesi Windows/Linux/Mac'te yapılır.
- **Simge veya açılış ekranı değişirse:** `node scripts/render-icons.js` (oyun klasörü 8099'da sunulurken) ardından
  `npm run assets`.
- **Web sürümü etkilenmez:** `native.js` web'de yalnızca oyun dosyalarını yükler.

## 5. Yayından önce doldurulacaklar

- [ ] `privacy.html` içindeki **[İLETİŞİM E-POSTASI] / [CONTACT EMAIL]** alanlarını gerçek bir adresle değiştir.
- [ ] GitHub Pages'i aç (Settings › Pages › Source: GitHub Actions). Gizlilik politikası adresi:
      **https://recaikas.github.io/okult-kahin-byblbn/privacy.html** (iki mağaza da bu adresi ister).
- [ ] Çevrimiçi skor tablosu kullanılacaksa: `config.js`'e Supabase adresi/anahtarı + `online/schema.sql`'i
      Supabase SQL Editor'da yeniden çalıştır (yeni `bt_forget` fonksiyonu için).
- [ ] Gerçek cihaz testi: kayıt → uygulamayı kapat/aç → devam; geri tuşu; arka plana alıp dönme; sesler; performans.
- [ ] Ekran görüntüleri (aşağıda).

## 6. Mağaza listeleme metinleri (taslak)

**Ad (≤30):** Balıkçı Tycoon — **Alt başlık / kısa açıklama (≤30 Apple, ≤80 Google):**
- TR: *Tezgâhtan limana, balıkçı imparatorluğu kur!*
- EN: *Build a fishing empire from a single stall!*

**Açıklama — TR**
> Bir sandık ve bir ağla başla; Karadeniz kıyısında kendi balıkçı işletmeni kur.
> Ağlardan balığı topla, filetola, tezgâha diz; müşteriler kuyrukta seni bekliyor.
> • Üç bölge: Balıkçı İskelesi, Balık Pazarı ve Fümehane
> • Çalışan al, müdür ata, bölgeleri tam otomatiğe bağla
> • Liman Meydanı, depo, Kapalı Pazar ve beş farklı hizmet binası: her biri kendi mimarisiyle büyür
> • Her gün yeni yüzler: 50 renkli, özgün müşteri — dans eden pop yıldızından martı terbiyecisine
> • Balık Pazarı günleri, kontratlar, borsa ve holding
> • Pixel art dünya, kendi bestesi olan müzikler, Türkçe ve İngilizce
> Reklam izlemek zorunlu değildir; isteğe bağlı ödüllü reklamlarla ekstra kazanç elde edebilirsin.

**Description — EN**
> Start with one crate and one net, and build your own fishing business on the Black Sea coast.
> Gather the catch, fillet it, stock your stalls — customers are already lining up.
> • Three zones: the Fishermen's Pier, the Fish Market and the Smokehouse
> • Hire staff, appoint managers and put whole zones on autopilot
> • Harbour square, depot, a covered market and five service buildings, each growing in its own architecture
> • New faces every day: 50 colourful, original customers — from a dancing pop star to a seagull trainer
> • Market days, contracts, a stock market and a holding company
> • Pixel-art world, original music, Turkish and English
> Watching ads is never required; optional rewarded ads give you extra earnings.

**Anahtar kelimeler (Apple, ≤100 karakter):** `balık,balıkçı,tycoon,idle,işletme,pazar,liman,simülasyon,pixel,fishing`
**Kategori:** Oyun › Simülasyon (ikincil: Gündelik / Casual)

## 7. Ekran görüntüleri

- **Google Play:** en az 2 telefon görüntüsü (dikey 9:16, kenar 320–3840 px), 1024×500 **tanıtım görseli**,
  512×512 simge (`mobile/assets/icon-only.png`'den küçültülür).
- **App Store:** 6,9" iPhone (1320×2868 ya da 1290×2796) en az 1, en çok 10 görüntü.
- Önerilen sahneler: (1) sabah ilk tezgâh, (2) kalabalık Balık Pazarı günü, (3) Hizmet Sahası Sv.5, (4) özel müşteri
  konuşması, (5) bölüm sonu gazetesi. Oyunun kendi ekran görüntüsü aracıyla (`test-*.js` betiklerindeki gibi)
  doğru çözünürlükte alınabilir.

## 8. Veri beyanları (bugünkü sürüme göre öneri — son sözü sen verirsin)

Oyun hesap istemez; kişisel bilgi toplamaz. Veri yalnızca **isteğe bağlı çevrimiçi skor tablosu** açıkken gider:
oyuncunun seçtiği işletme adı ve karakter adı, oyun istatistikleri, rastgele anonim oyuncu kimliği, dil ve açılış
zamanı. Satılmaz, reklamda kullanılmaz, üçüncü kişiyle paylaşılmaz; oyun içinden silinebilir.

- **Google Play › Veri güvenliği:** toplanan veri türleri — "Uygulama etkinliği › Diğer kullanıcı içeriği"
  (işletme/karakter adı, oyun istatistikleri) ve "Cihaz veya diğer kimlikler" (anonim oyuncu kimliği). Amaç: uygulama
  işlevselliği. Aktarımda şifreli (HTTPS): **evet**. Silme isteği: **evet** (oyun içinden). Toplama isteğe bağlı mı:
  **evet** (kapatılabilir). Paylaşım: **yok**.
- **App Store › Uygulama Gizliliği:** "Kullanıcı İçeriği › Oyun İçeriği" ve "Tanımlayıcılar › Kullanıcı Kimliği";
  **kimliğe bağlı değil**, **izleme için kullanılmıyor**. Amaç: Uygulama İşlevselliği.
- **Reklam eklendiğinde** (AdMob) bu beyanlar ve `privacy.html` güncellenmeli: reklam kimliği, kaba konum, cihaz
  bilgileri, AB/İngiltere için izin ekranı (UMP), iOS'ta ATT izni.

## 9. Yaş derecelendirmesi (IARC / App Store anketi — beklenen cevaplar)

Şiddet yok (çizgi film tarzı tekme şovu dışında), korku yok, kumar yok (mezat ve borsa gerçek para içermez),
uyuşturucu/alkol yok, küfür yok. **Kullanıcı etkileşimi:** skor tablosunda oyuncuların yazdığı işletme adları görünür
(sunucu uzunluk ve karakter kontrolü yapar). Beklenen sonuç: **PEGI 3 / ESRB Everyone / App Store 4+**.
Uygunsuz isim şikâyeti gelirse `online/schema.sql` sonundaki sorguyla silinebilir.

## 10. Sonraki aşama: ödüllü reklam

- `@capacitor-community/admob` eklentisi; yalnız **ödüllü reklam** (ör. "2 dakika 2× kazanç", "çevrimdışı kazancı
  ikiye katla"), geçiş reklamı yok.
- AB/İngiltere için Google UMP izin formu, iOS için App Tracking Transparency (ATT) açıklaması.
- Test reklam kimlikleriyle geliştir; gerçek kimlikleri yalnızca yayın derlemesine koy.
- `privacy.html` ve veri beyanlarını güncelle.
