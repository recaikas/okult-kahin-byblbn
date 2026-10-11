# Geliştirme Günlüğü: dizi şablonu

Hamsi Koyu'nun "Geliştirme Günlüğü" bir dizidir. **Karakterler sabittir.** Her bölüm onlarla kısa bir hikâye anlatır, sonra o
hikâyenin oyundaki **mekaniğini** gerçek oyun görüntüsüyle tanıtır. Biçim yalnız dikey 1080×1920'dir (TikTok, Reels, Shorts),
her bölüm TR ve EN olarak çıkar.

| Bölüm | Konu (mekanik) | Hikâye | Dosyalar | Videolar |
|---|---|---|---|---|
| Gün 1 | Fragman | Koyun bir günü | `tools/trailer.js`, `tools/trailer-music.py` | `video/trailer-*` |
| Gün 2 · Bölüm 1 | İlk eleman (personel) | Tek Başına Olmaz: Rıza yetişemez, Memo gelir | `tools/film/ep02-b1-tek-basina.js`, `tools/film/ep02-b1-music.py` | `video/gun2-b1-1080x1920-{tr,en}.mp4` |
| Gün 3 · Bölüm 2 | Müdür | Her Yere Yetişemezsin: herkes Rıza'yı çağırır, gece defterde uyuyakalır, Memo Nevin Hanım'ı getirir | `tools/film/ep03-b2-mudur.js`, `tools/film/ep03-b2-music.py` | `video/gun3-b2-1080x1920-{tr,en}.mp4` |

Eski deneme: `ep02-mudurler.js` (Nevin Hanım, müdürler) bu biçimden önceydi; dizinin parçası sayılmaz. Her bölüm
artık bir **soğuk açılışla** (bölümün en çarpıcı anı donar + soru yazısı + "Baştan alalım…") ve karakter isim etiketleriyle başlar.

## 1. Sabit kadro (`tools/film/cast.js`)

Her bölümde aynı görünürler. Renkler değişmez.

| Karakter | Kim | Görünüş |
|---|---|---|
| **Kaptan Rıza** | Patron, 32 | Soluk kırmızı kasket `#B44D40`, krem gömlek `#E8D7B5`, petrol mavisi yelek `#24566A`, koyu kahve pantolon `#554333`, eski deri bot. Kısa dağınık siyah saç, kirli sakal, sol kaşta yara izi, hafif göbek. Sol bilekte saat, yelek cebinde defter. Telaşlanınca kasketini düzeltir. |
| **Memo** | İlk eleman, 23 | Ters turuncu kasket `#E69A42`, açık mavi gömlek `#78B7CB`, balık armalı lacivert önlük `#293F59`, koyu gri pantolon `#50565D`, siyah lastik çizme. Kısa kıvırcık kestane saç, sağ yanakta iki çil, sağ bilekte yeşil ip bileklik. İlk sahnesinde kahverengi bez çanta. |
| **Nermin Teyze** | İlk müşteri, 58 | Mor çiçekli bej yazma, bordo hırka `#873F53`, lacivert uzun etek, siyah ayakkabı. Sağ elde hasır sepet, sol elde bozuk para kesesi. Pazarlıkçı ve sabırsız ama iyi kalpli; beklerken ayağını vurur. |
| **Nevin Hanım** | Müdür (Bölüm 2'den) | Oyundaki müdür adayı (look 1): mor uzun ceket `#3A2A4A`, altın fular `#D9A441`, krem bluz, koyu topuz saç, elinde bordo defter. Masasında altın **MÜDÜR** levhası. |

Ortak mekân: önden görülen iskele. Tezgâhın üstünde **"RIZA'NIN BALIKLARI"** levhası, kırmızı-krem tente, arkada deniz ve doğan
güneş. Kuyruk tezgâhın sağından liman yoluna iner. Ters açı (`b1stranger`) liman kapısına ("LİMAN") bakar.

Oyunda Rıza oyuncunun kahramanıdır: ad `Rıza`, kızıl balıkçı beresi (oyunda kırmızı kasket yok, en yakını bu), sakal, petrol
ceket. Memo, oyunda işe alınan ilk hamaldır; çekimde adı `Memo` verilir ve üstünde **MEMO** etiketi durur.

## 2. Bölüm yapısı (65–75 sn)

| Bölüm | Süre | İçerik |
|---|---|---|
| **1. Sinematik** | 0–30 sn | Bölümün brief'ine birebir uyar. Konuşma yok. 5–6 sahne, sabit kadro, dikey doğal piksel sahneler. Son karede tek cümlelik ekran yazısı. |
| **2. Geçiş + seri kartı** | ≈3 sn | Vuruş ve beyaz patlamayla oyuna geçilir; oyun görüntüsünün üstünde `HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ` / `GÜN n · BÖLÜM m` / bölüm adı. |
| **3. Mekanik** | ≈36 sn | Gerçek oyun ve gerçek arayüz, 5–6 çekim. Her çekimde tek fikir: büyük başlık ve tek satır açıklama. Arayüz çekiminde başlık üstte durur, alttaki oyun paneli kapanmaz. Basılan yer dokunma halkasıyla gösterilir. Köşede `GÜN n · BÖLÜM m` yazar. Oyunda olmayan hiçbir özellik gösterilmez. |
| **4. Kapanış** | ≈5 sn | Kadro tezgâhta + "Bir sonraki bölümde görüşürüz." + ÜCRETSİZ · REKLAMSIZ + adres. |

## 3. Stil kuralları

- **Piksel:** dikey doğal sahne 180×320, ×6 (1080×1920). Kamera dünya içinde kayar ve yaklaşır (`camPath`); yakın planlarda aynı
  pikseller büyür. Gökyüzü Bayer titreşimli. Işık için yumuşak parıltı (`glow`), kenar ışığı (`rim`). Ters ışık siluetinde
  kişiler ayrı katmanda kararır, kenarları güneş rengine döner.
- **İfadeler:** `neutral · smile · happy · worry · surprise · helpless · frown · blink`. Ter damlası, yıldız ve "PAT!" gibi çizgi
  roman vuruşları sahnenin içine çizilir.
- **Tempo:** brief'in saniyeleri korunur. Hızlı kesme gereken sahnede (ör. `b1rush`) kesmeler sahne içinde yapılır.
- **Ses:** sinematikte doğal sesler (martı, dalga, sikke, adım, kasa sürtünmesi) ve müzik brief'teki duyguyu izler. Mekanikte
  horon teması ve oyun sesleri (tık, işe alım çanı, sikke) kullanılır. Kapanış La majöre çözülür.
- **Yazı:** oyunun piksel fontu. Başlıklar büyük harfle yazılır.

## 4. Dosyalar (`store/tools/film/`)

| Dosya | Görev |
|---|---|
| `engine.js` | Film motoru: oyunu açar ve yamalar (serbest kamera, etiket filtresi, `__pdir` ile oyuncuyu yürütme, `__nextName` ile işe alınana ad), kare kare çeker, sinema katmanı, yazı türleri, TR/EN, MP4 |
| `scenes.js` | Fragman sahneleri + dikey doğal sahne kaydı (`TBS.reg`) ve ortak çizim yardımcıları (`TBS.lib`) |
| `cast.js` | **Sabit kadro** (`person()` ile Rıza, Memo, Nermin Teyze, kalabalık), eşyalar (kasa, hamsi, sepet, çanta, terazi), liman dünyası ve bölüm sahneleri |
| `sound.py` | Ses kütüphanesi: kemençe, saz, ney, davul, pad, çan, ses efektleri; `theme()` horon temasını çalar |
| `epNN-bM-konu.js` | Bölüm: metinler (L.tr / L.en), çekim listesi, yazılar, oyun kurulumları (`pageInit`) |
| `epNN-bM-music.py` | Bölümün müziği, çekim zamanlarına oturtulur |

Motorun yazı türleri: `int` · `title` (`top` ile üstte) · `chip` · `stamp` · `episode` (seri kartı) · `perks` (sırayla beliren
liste) · `corner` · `tap` (`btn:metin` ile kart düğmesi) · `end`.

## 5. Yeni bölüm nasıl yapılır

1. **Brief:** ilk 30 saniye brief'e birebir uyar. Mekanik bölümü oyunun **bugünkü** sürümünden kurulur.
2. **Sahneler:** `cast.js` içine sahne fonksiyonlarını yaz (`harbor()` liman dünyasını, `person()` karakteri çizer) ve
   `TBS.reg('ad', fn)` ile kaydet. Önizlemek için tek kareler çekilebilir.
3. **Bölüm dosyası:** `ep02-b1-tek-basina.js`'i kopyala; `scripts: ['cast.js']` kalsın. `L`, `shots`, `text`, `pageInit` değişir.
4. **Önizleme:** `node store/tools/film/<bölüm>.js tr preview [çekim,çekim]` (her 10. kare).
5. **Müzik:** `python3 store/tools/film/<bölüm>-music.py store/video/<id>-music.wav`
6. **Çekim:** `node store/tools/film/<bölüm>.js tr` ve `... en`. Müzik dosyası varsa MP4 kendiliğinden çıkar:
   `video/<id>-1080x1920-tr.mp4`.

Oyun klasörü 8099'da sunulmalı: `cd balikci-tycoon && python3 -m http.server 8099`.
Gerekenler: Node 22 + Playwright (Chromium), Python 3 + numpy, ffmpeg.

## 6. Gün 2 · Bölüm 1 · Tek Başına Olmaz: zaman çizelgesi

| Sn | Çekim | Ne görülür | Ses |
|---|---|---|---|
| 0–5 | dawn | Kamera denizden iskeleye süzülür, martılar, kayıklar; Rıza kasketini düzeltir, örtüyü çeker, gülümser | martı, dalga, sakin akustik |
| 5–10 | first | Nermin Teyze gelir; tartı, paket, ilk sikkeler kutuya; arkada 2, sonra 4 kişi; kamera geri çekilir, kuyruk yola iner; Rıza'nın yüzü endişeye döner | sikke, uğultu, müzik hızlanır |
| 10–16 | rush | Hızlı kesmeler: kasa, terazi, para, Nermin Teyze'nin ayağı; Rıza döner, hamsi havaya uçar (ağır çekim), kaskete düşer: PAT! Çaresiz bakış | hızlı perküsyon, ıslık, "pat!", müzik kesilir |
| 16–21 | stranger | Rıza'nın omzu üstünden liman kapısı; Memo görünür, kalabalığa ve devrik kasaya bakar, çantasını bırakır, tezgâha yürür | uğultu söner, gizemli ney |
| 21–26 | shake | Memo kasayı tezgâha koyar, Rıza şaşırır; el uzatır, duraksama, tokalaşma; ters ışıkta siluetlere yaklaşma | umutlu, güçlenen müzik |
| 26–30 | together | Kamera yükselir; Memo müşteriye verir, Rıza kasaları dizer, Nermin Teyze mutlu gider; ikisi yan yana. *"Büyük hayaller, tek başına kurulmaz."* | yükseliş, geçiş vuruşu |
| 30–33.4 | card | Oyun görüntüsü üstünde seri kartı | horon başlar |
| 33.4–39.4 | alone | Oyuncu Rıza ağ → masa → tezgâh koşar, kuyruk bekler: **TEK BAŞINA** | |
| 39.4–46.4 | hire | Gerçek YÜKSELT paneli: personel kartı → Hamal ($360) → "Memo işe alındı": **İLK ELEMAN** | tık, işe alım çanı |
| 46.4–52.4 | memo | Kamera Memo'yu izler (MEMO etiketi): **MEMO İŞ BAŞINDA** | |
| 52.4–58.4 | roles | Dört rol, oyundaki açıklamalarıyla: **DÖRT ROL** | her satıra bir pop |
| 58.4–63.9 | rule | Personel kartı: Kadro 1/2, eksik roller: **KADRO 1/2** | |
| 63.9–69.4 | team | Bölge yükselmiş, dört rol çalışıyor: **SONRA: EKİP** | tam horon, sikkeler |
| 69.4–74 | end | Rıza ve Memo tezgâhta + kapanış kartı | La majör |

## 7. Gün 3 · Bölüm 2 · Her Yere Yetişemezsin: zaman çizelgesi

| Sn | Çekim | Ne görülür |
|---|---|---|
| 0–2.2 | cold, freeze | Dört balon "RIZA!", Rıza fırıl fırıl döner; kare donar: **BİR PATRON KAÇ YERE YETİŞİR?** |
| 2.2–7.5 | busy | Memo, iki yeni eleman ve Nermin Teyze sırayla seslenir; Rıza döner, başı döner |
| 7.5–12.5 | run | Rıza defterle tezgâhın önünde koşturur, kâğıtlar uçuşur; gökyüzü şafaktan öğleye, akşama akar |
| 12.5–17.5 | night | Gece, fener; Rıza defterin başında uyuyakalır; Memo görür, aklına bir şey gelir (!) |
| 17.5–22.5 | nevin | Sabah Memo, Nevin Hanım'ı getirir; çay, Rıza uyanır, kâğıtlar düzene girer |
| 22.5–30 | desk2, together | MÜDÜR masası; Nevin Hanım yönetir, ekip akar, Rıza çayını yudumlar. *"Her yere yetişemezsin. Yetişecek birini bul."* |
| 30–33.4 | card | Seri kartı |
| 33.4–38.4 | roles | Dört rol: **ÖNCE KADRO** |
| 38.4–44.9 | pick | Gerçek YÜKSELT paneli: müdür kartı → 3 aday → Nevin Hanım (seç + onayla) |
| 44.9–50.4 | desk | Nevin Hanım masasında, etiketiyle: **BÖLGE KENDİ KENDİNE İŞLER** |
| 50.4–56.4 | perks | Altı yetenek |
| 56.4–62.4 | rush | Yoğun saatte müdür sahaya iner |
| 62.4–67.4 | four | Dört bölge, dört müdür |
| 67.4–72 | end | Akşam, kadro tezgâhta + kapanış kartı |

## 8. Başka bir yapay zekâ için hazır istem

```
Hamsi Koyu (Karadeniz'de piksel balıkçı tycoon oyunu) için "Geliştirme Günlüğü · Gün [n] · Bölüm [m] · [AD]" videosu istiyorum.
65–75 sn, TR ve EN, yalnız dikey 1080×1920. Dizi biçimi:

Sabit kadro (her bölümde aynı): Kaptan Rıza (soluk kırmızı kasket #B44D40, krem gömlek, petrol mavisi yelek #24566A, kirli
sakal, sol kaşta yara izi, saat, cepte defter), Memo (ters turuncu kasket #E69A42, açık mavi gömlek, balık armalı lacivert
önlük, kıvırcık kestane saç, iki çil, yeşil bileklik), Nermin Teyze (mor çiçekli bej yazma, bordo hırka, lacivert etek, hasır
sepet, para kesesi). Mekân: "RIZA'NIN BALIKLARI" levhalı tezgâh, iskele, deniz, doğan güneş.

1) SİNEMATİK (0–30 sn, konuşmasız): bu bölümün brief'indeki sahneler birebir. Dikey doğal piksel sahneler (180×320, ×6),
   iri piksel, Bayer titreşimli gökyüzü, sıcak ters ışık. Ses: martı, dalga, sikke, adım; müzik duyguyu izler. Son karede tek
   cümlelik ekran yazısı.
2) GEÇİŞ + SERİ KARTI (≈3 sn): vuruşla oyuna geçiş; "HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ", "GÜN n · BÖLÜM m", bölüm adı.
3) MEKANİK (≈36 sn): bu bölümün mekaniği, oyunun bugünkü sürümünden gerçek görüntü ve gerçek arayüzle. 5–6 çekim, her biri tek
   fikir: büyük başlık + tek satır açıklama; arayüz çekiminde başlık üstte, alttaki panel açık. Basılan yer dokunma halkasıyla
   gösterilsin. Oyunda olmayan özellik gösterilmesin.
4) KAPANIŞ (≈5 sn): kadro tezgâhta + "Bir sonraki bölümde görüşürüz." + ÜCRETSİZ · REKLAMSIZ + adres.

Müzik özgün ve telifsiz: sinematikte akustik (saz, kemençe, ney), mekanikte horon (kemençe, davul, tef, La minör, 120 BPM),
sonunda La majöre çözülsün.
```
