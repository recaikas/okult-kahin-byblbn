# Hamsi Koyu — mağaza paketi (App Store + Google Play, TR/EN)

Bu klasördeki her şey oyunun kendisinden üretildi (gerçek oyun ekranları, oyunun piksel simgesi, özgün müzik). Yeniden üretmek için `tools/` altındaki betikler; aşağıda.

## 1. Metinler
| Dosya | İçerik |
|---|---|
| `text/appstore.md` | App Store Connect: ad, alt başlık, tanıtım metni, anahtar kelimeler, açıklama, yenilikler (TR + EN), kategori, yaş, URL'ler, **App Privacy** cevapları |
| `text/googleplay.md` | Play Console: ad, kısa/tam açıklama, sürüm notları (TR + EN), kategori, etiketler, IARC notları, **Veri güvenliği** cevapları |
| `text/social.md` | Sosyal medya ve tester davet metinleri (TR + EN), etiketler |

Karakter sınırları `tools/texts.py` tarafından denetlenir; her alanın yanında "sayı / sınır" yazar.

## 2. Simge ve logo
| Dosya | Boyut | Nereye |
|---|---|---|
| `appstore/app-icon-1024.png` | 1024×1024, saydamlık yok | App Store Connect › Uygulama simgesi (Xcode'da AppIcon) |
| `play/app-icon-512.png` | 512×512, 32-bit PNG | Play Console › Mağaza girişi › Uygulama simgesi |
| `logo/logo-horizontal-{tr,en}.png` | 2400×900, saydam | Web sitesi, basın, sosyal medya kapakları |
| `logo/logo-stacked-{tr,en}.png` | 1600×1600, saydam | Profil görseli, kare paylaşımlar |

## 3. Ekran görüntüleri (6 adet, her dil için)
Sıra: liman · özel müşteri · mutfak · Dipteki Söz · tezgâh paneli · müşteri defteri.

| Klasör | Boyut | Nereye |
|---|---|---|
| `screens/appstore-6.9/{tr,en}/` | 1320×2868 | App Store › iPhone 6,9" (zorunlu set) |
| `screens/appstore-6.5/{tr,en}/` | 1284×2778 | App Store › iPhone 6,5" (isteğe bağlı) |
| `screens/play-phone/{tr,en}/` | 1080×1920 | Play Console › Telefon ekran görüntüleri |
| `play/feature-graphic-1024x500-{tr,en}.png` | 1024×500 | Play Console › Öne çıkan grafik (zorunlu) |

Uygulama yalnız iPhone (iPad kapalı), bu yüzden iPad ekranı gerekmez.

## 4. Videolar (29 sn, 30 fps, H.264 + AAC, özgün chiptune müzik)
| Dosya | Boyut | Nereye |
|---|---|---|
| `video/appstore-preview-886x1920-{tr,en}.mp4` | 886×1920 | App Store › Uygulama önizlemesi (iPhone 6,9"/6,5"). 15–30 sn şartına uyar. |
| `video/promo-landscape-1920x1080-{tr,en}.mp4` | 1920×1080 | YouTube'a yükle, linki Play Console › Tanıtım videosu alanına yapıştır |
| `video/promo-vertical-1080x1920-{tr,en}.mp4` | 1080×1920 | Instagram Reels, TikTok, YouTube Shorts, WhatsApp durum |

Videoda başka platform adı geçmez (Apple önizleme kuralı). Müzik `tools/music.py` ile üretilen özgün parçadır, telif sorunu yoktur.

## 4b. Sinematik fragman (EN, 60 sn)
| Dosya | Boyut | Nereye |
|---|---|---|
| `video/trailer-1920x1080-en.mp4` | 1920×1080, 30 fps, H.264 + AAC | YouTube, Steam/itch sayfası, basın, sosyal medya |

Akış: soğuk açılış (Karadeniz kıyısı, küçük iskele) → vuruş → 10 mekanik başlığı (ağ, kesim, tezgâh, personel ve müdür,
fümehane 2.4×, Reis Güveci, 69 özel müşteri, Müşteri Defteri, Ticaret Ofisi, olaylar) → Dipteki Söz ara sahnesi →
geniş liman planı → logo kartı. Görüntülerin hepsi oyunun kendisi; üstüne sinema şeridi, renk tonu ve piksel yazı biner.
Müzik `tools/trailer-music.py` ile üretilen özgün parçadır (deniz ambiyansı, horon teması, hicaz kesiği).

## 5. Yükleme sırası (kısa kontrol listesi)
**App Store Connect**
1. Yeni uygulama: ad `Hamsi Koyu: Balıkçı Tycoon` (TR) / `Hamsi Koyu: Fishing Tycoon` (EN), paket kimliği `io.github.recaikas.hamsikoyu`.
2. Birincil dil Türkçe; İngilizceyi yerelleştirme olarak ekle. Metinleri `text/appstore.md`'den yapıştır.
3. 6,9" ekranlara `screens/appstore-6.9/<dil>/` dosyalarını, önizlemeye `video/appstore-preview-886x1920-<dil>.mp4`'ü yükle.
4. App Privacy ve yaş derecelendirmesi cevapları `text/appstore.md` içinde.
5. Xcode'dan arşivi yükle (mobile/ klasöründeki Capacitor projesi), TestFlight ile önce testerlara aç.

**Google Play Console**
1. Uygulama oluştur → Oyun, Ücretsiz. Varsayılan dil Türkçe, İngilizce çeviri ekle.
2. Mağaza girişi: metinler `text/googleplay.md`; simge `play/app-icon-512.png`; öne çıkan grafik `play/feature-graphic-1024x500-<dil>.png`; telefon ekranları `screens/play-phone/<dil>/`.
3. Tanıtım videosu: `video/promo-landscape-1920x1080-<dil>.mp4`'ü YouTube'a (liste dışı da olur) yükle, linki yapıştır.
4. Veri güvenliği ve içerik derecelendirmesi cevapları `text/googleplay.md` içinde.
5. AAB'yi (mobile/ › Android Studio › Generate Signed Bundle) **Dahili test** kanalına yükle, testerları e-postayla ekle.

## 5b. Dil eşleştirmesi (her iki mağaza TR + EN)
Her dilin kendi metni, ekranları, videosu ve öne çıkan grafiği var; karıştırma. Oyun cihaz diline göre kendiliğinden TR/EN açılır.

| Mağaza dili | Metin | Görseller | URL'ler (aynı sayfa, dil bölümü) |
|---|---|---|---|
| App Store **Türkçe** (birincil) · Play **tr-TR** (varsayılan) | `text/*.md` › Türkçe | `…/tr/`, `*-tr.png`, `*-tr.mp4` | `privacy.html#tr`, `support.html#tr`, `terms.html#tr` |
| App Store **English (U.S.)** + **English (U.K.)** · Play **en-US** (+ isteğe bağlı en-GB) | `text/*.md` › English | `…/en/`, `*-en.png`, `*-en.mp4` | `privacy.html#en`, `support.html#en`, `terms.html#en` |

- App Store: İngilizceyi ekledikten sonra en-GB için "English (U.S.)" metnini kopyala; ekranlar/önizleme de dil başına ayrı yüklenir.
- Play: Mağaza girişi › Çevirileri yönet › Kendi çevirilerini ekle › İngilizce; öne çıkan grafik ve ekranlar dil başına yüklenir, tanıtım videosu linki dil başına ayrı olabilir (TR ve EN YouTube videoları).
- App Privacy / Veri güvenliği ve App Review notları dile bağlı değil, bir kez girilir.
- Veri izni kartı, gizlilik politikası, kullanım koşulları ve destek sayfası iki dilde; oyun hangi dildeyse o dil açılır.

## 6. Yeniden üretmek
Oyun klasöründe sunucu: `cd balikci-tycoon && python3 -m http.server 8099`
```
node store/tools/capture-raw.js        # ham oyun ekranları (raw/)
node store/tools/compose.js            # mağaza ekranları (screens/)
node store/tools/brand.js              # logo, simgeler, öne çıkan grafik
node store/tools/capture-video.js tr   # video kareleri (git'e girmez)
python3 store/tools/music.py store/video/promo-music.wav
python3 store/tools/texts.py           # metinler + sınır denetimi
```
Videoyu kodlamak için (store/video içinde):
```
ffmpeg -framerate 30 -i frames-tr/%05d.jpg -i promo-music.wav -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -r 30 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart appstore-preview-886x1920-tr.mp4
```
Sinematik fragman (`node store/tools/trailer.js preview` her 10. kareyi çeker; sona çekim adları eklenirse yalnız onları):
```
node store/tools/trailer.js                                   # 1800 kare → video/frames-trailer/
python3 store/tools/trailer-music.py store/video/trailer-music.wav
cd store/video && ffmpeg -framerate 30 -i frames-trailer/%05d.jpg -i trailer-music.wav -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -r 30 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart trailer-1920x1080-en.mp4
```
