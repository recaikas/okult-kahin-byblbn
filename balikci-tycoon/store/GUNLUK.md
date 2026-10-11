# Geliştirme Günlüğü: video şablonu

Hamsi Koyu'nun "Geliştirme Günlüğü" videoları hep aynı sinematik dille yapılır. Fragman (`FRAGMAN.md`) bu dilin ilk örneğidir.
Gün videoları ise sabit bir yapıyı izler.

| Gün | Konu | Kahraman | Dosyalar | Videolar |
|---|---|---|---|---|
| 1 | Fragman | Balıkçı | `tools/trailer.js`, `tools/trailer-music.py` | `video/trailer-*` |
| 2 | Müdürler | Nevin Hanım (müdür) | `tools/film/ep02-mudurler.js`, `tools/film/ep02-music.py` | `video/ep02-*` |

## 1. Yapı (≈60 sn)

| Bölüm | Süre | İçerik |
|---|---|---|
| **1. Hikâye** | 0–19 sn | Konunun bir **karakterini** anlatan 3–4 elle çizilmiş sahne. Kısa, duygulu ara yazılar. Müzik sakin, ses tasarımı yakın (saat, kalem, adım, çay). |
| **2. Seri kartı** | ≈3 sn | Vuruşla: logo + `HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ` + `GÜN n` + konu. Horon teması burada başlar. |
| **3. Mekanik** | ≈30 sn | Gerçek oyun görüntüsü ve gerçek arayüz. 5–6 çekim, her biri tek bir fikir: büyük başlık + tek satır açıklama. Köşede `GÜN n · KONU` etiketi. |
| **4. Kapanış** | ≈5 sn | Hikâyenin **ilk sahnesine** geri dönülür (ör. boş sandalye, yanan lamba) + "Bir sonraki günlükte görüşürüz." + ÜCRETSİZ · REKLAMSIZ + adres. |

Hikâyedeki karakter **oyundaki karşılığıyla aynı görünür**. Örnek: Nevin Hanım oyunda müdür adayıdır; mor ceketi ve altın fuları
oyundaki müdür görünümünden (look 1) alındı. Mekanik bölümünde o karakter işe alınır ve masasında görünür.

## 2. Stil kuralları

- **Piksel:** 320×180 sahne, ×6 büyütme (yakın plan sahnelerde 160×90, ×12). Bayer titreşimli gökyüzü. Işık için yumuşak radyal parıltı
  (`glow`), noktalı hâle yalnız küçük ışık kaynaklarında.
- **Sinema dili:** vinyet, sahneye göre hafif renk tonu, çözülerek geçiş
  (0,4–0,9 sn). Beyaz patlama yalnız büyük vuruşlarda (seri kartı, önemli an).
- **Tempo:** çekimler 3,5–6 sn. Bölüm başına en çok 12–13 çekim. Ara yazı çekim başladıktan ≈0,5 sn sonra gelir.
- **Yazı:** oyunun piksel fontu.
  - Ara yazılar ince ve koyu zemin üstünde.
  - Başlıklar büyük harf, altın çizgili, altında tek satır açıklama.
  - Arayüz çekiminde başlık üstte durur; alttaki oyun paneli kapanmaz.
- **Oyun görüntüsü:** oyun içi etiketler gizli; yalnız konunun etiketi açık (ör. `👔 Nevin Hanım · Müdür`). Kamera kadrajı elle
  verilir, yavaş yaklaşma (%2–5). Arayüzde neye basıldığı **dokunma halkasıyla** gösterilir.
- **Ses:** hikâyede yakın sesler (saat, kalem, adım, çay bardağı), mekanikte horon teması ve oyun sesleri: tık, işe alım çanı,
  sikke, uğultu. Her görsel vuruşa bir ses düşer. Bölüm sonunda La majöre çözülür.
- **Dil ve biçim:** her bölüm TR + EN, **yalnız dikey 1080×1920** (TikTok, Reels, Shorts). Yazılar telefona göre boyutlanır,
  sinema şeridi yoktur. Çizilmiş sahneler kayan bir dilimle dikey çekilir. Yatay gerekirse motor `h` ile hâlâ üretebilir.

## 3. Dosyalar (`store/tools/film/`)

| Dosya | Görev |
|---|---|
| `engine.js` | Film motoru: oyunu açar ve yamalar, kare kare çeker, sinema katmanı, yazı türleri, geçişler, dikey (gerekirse yatay), TR/EN, MP4 |
| `scenes.js` | Elle çizilmiş sahne kütüphanesi (fragman sahneleri + Gün 2: `office`, `ledger`, `walk`, `desk`). Yeni sahneler buraya eklenir. |
| `sound.py` | Ses kütüphanesi: kemençe, saz, ney, davul, tef, pad, koro, çan, vuruşlar ve ses efektleri. `theme()` horon temasını çalar. |
| `epNN-konu.js` | Bölüm: metinler (L.tr / L.en), çekim listesi, yazılar, oyun kurulumları (`pageInit`) |
| `epNN-music.py` | Bölümün müziği: `sound.py` ile çekim zamanlarına oturtulur |

Motorun yazı türleri: `int` (ara yazı, `low` ile altta) · `title` (`top` ile üstte) · `chip` · `stamp` · `loop` · `logo` · `cash` · `kicker` ·
`episode` (seri kartı) · `perks` (sırayla beliren liste) · `corner` (köşe etiketi) · `tap` (dokunma halkası; `btn:metin` ile kart
düğmesi bulunur) · `end` (kapanış kartı).

Çekim seçenekleri: `kind` (scene/game/black), `scene`, `t0`, `opt`, `z` (yakınlık), `cam` ([[u,x,y]…]), `day` (günün saati),
`grade`, `tr:'dissolve'`+`td`, `push`, `dim`, `fadeIn`, `glow` (fenerler), `ui` (oyun arayüzü görünür), `toast` (yalnız bildirim),
`end`.

## 4. Yeni gün nasıl yapılır

1. **Konu ve kahraman:** oyundaki mekanik ile o mekaniğin bir karakteri (ör. Gün 3 Fümehane → fümeci usta).
2. **Hikâye sahneleri:** `scenes.js` içine 3–4 sahne yaz. Var olan yardımcılar şunlar: `layer`, `dgrad`, `glow`, `halo`, `rim`, `spr`,
   `nevinFront`/`nevinSide` (karakter örneği), `teaGlass`, `steam`, `tiny` (küçük yazı). `SC` ve `CROP` tablolarına ekle.
   Hızlı önizleme için tek kareler çekilebilir.
3. **Bölüm dosyası:** `ep02-mudurler.js`'i kopyala. `L`, `shots`, `text` ve `pageInit` içindeki kurulumları değiştir.
4. **Önizleme:** `node store/tools/film/ep03-....js tr preview` her 10. kareyi çeker. Yalnız bazı çekimler için sona adlarını ekle.
5. **Müzik:** `ep02-music.py`'yi kopyala, zamanları çekimlere oturt:
   `python3 store/tools/film/ep03-music.py store/video/ep03-music.wav`
6. **Çekim:** `node store/tools/film/ep03-....js tr` ve `... en` (dikey). Müzik dosyası varsa motor MP4'ü kendisi üretir:
   `video/ep03-1080x1920-tr.mp4` ve `-en.mp4`.

Oyun klasörü 8099'da sunulmalı: `cd balikci-tycoon && python3 -m http.server 8099`.
Gerekenler: Node 22 + Playwright (Chromium), Python 3 + numpy, ffmpeg.

## 5. Gün 2 · Müdürler: zaman çizelgesi

| Sn | Çekim | Ne görülür | Yazı (TR) |
|---|---|---|---|
| 0–5.5 | office | Gece ofisi: Nevin Hanım lamba ışığında yazıyor, saat sallanıyor, çay buharı | Her limanın uyumayan biri vardır. |
| 5.5–10 | ledger | Defter, 1996; kalem satır satır yazar | Nevin Hanım otuz yıl koyun defterini tuttu. |
| 10–15 | walk | Şafakta iskele: tezgâhlar taşmış, hamal koşturuyor; Nevin Hanım defteri koltuğunda yürüyor | Sonra koy büyüdü. Tek bir çift el yetmez oldu. |
| 15–19 | seat | MÜDÜR levhası, çay bardağı, oturur, gülümser | Ve masasına oturdu. |
| 19–22.5 | card | Seri kartı | GÜN 2 · MÜDÜRLER |
| 22.5–27.5 | roles | Kadro, rol etiketleri açık | ÖNCE KADRO |
| 27.5–33.5 | pick | Gerçek YÜKSELT paneli: "Müdür gerekli" → 3 aday → Nevin Hanım seçilir (dokunma halkası) | 3 ADAY · 2'ŞER YETENEK |
| 33.5–38.5 | desk | Nevin Hanım masasında, etiketiyle | BÖLGE KENDİ KENDİNE İŞLER |
| 38.5–44 | perks | Altı yetenek sırayla belirir | ALTI YETENEK |
| 44–50 | rush | Yoğun saat: kamera müdürü izler, kasayı boşaltır | YOĞUN SAATTE SAHAYA İNER |
| 50–54 | four | Dört bölge, dört müdür masası (akşam, fenerler) | DÖRT BÖLGE · DÖRT MÜDÜR |
| 54–59 | end | Boş ofis, lamba yanıyor | Bir sonraki günlükte görüşürüz. |

## 6. Başka bir yapay zekâ için hazır istem

```
Hamsi Koyu (Karadeniz'de piksel balıkçı tycoon oyunu) için "Geliştirme Günlüğü · Gün [n] · [KONU]" videosu istiyorum.
≈60 sn, TR ve EN, yalnız dikey 1080×1920 (TikTok/Reels/Shorts). Hep aynı sinematik stil:

1) HİKÂYE (0–19 sn): Konunun oyundaki bir karakterinin kısa öyküsü, 3–4 elle çizilmiş piksel sahne (320×180, iri piksel,
   Bayer titreşimli gökyüzü, sıcak lamba ışığı, ters ışık). Karakter oyundaki görünümüyle aynı olsun. Kısa, duygulu ara yazılar.
   Yakın sesler: saat, kalem, adım, çay bardağı. Müzik sakin: pad, saz, kemençe.
2) SERİ KARTI (≈3 sn): vuruşla logo + "HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ" + "GÜN n" + konu. Horon teması başlar.
3) MEKANİK (≈30 sn): gerçek oyun görüntüsü ve gerçek arayüz; oyun içi etiketler gizli, kamera elle kadrajlanmış, yavaş yaklaşma.
   5–6 çekim, her biri tek fikir: büyük başlık + tek satır açıklama. Arayüzde basılan yer dokunma halkasıyla gösterilsin.
   Köşede "GÜN n · KONU" etiketi. Oyun sesleri: tık, çan, sikke, uğultu.
4) KAPANIŞ (≈5 sn): hikâyenin ilk sahnesine dönüş + "Bir sonraki günlükte görüşürüz." + ÜCRETSİZ · REKLAMSIZ + adres.

Sinema dili: vinyet, çözülerek geçiş, beyaz patlama yalnız büyük vuruşlarda, çekimler 3,5–6 sn.
Müzik özgün ve telifsiz: horon (kemençe, davul, tef, La minör, 120 BPM), sonunda La majöre çözülsün.
```
