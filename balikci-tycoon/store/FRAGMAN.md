# Hamsi Koyu sinematik fragmanı: nasıl yapıldı?

60 saniyelik, 1920×1080, piksel sanatlı, sinematik bir oyun fragmanı. İngilizce ve Türkçe, yatay (`video/trailer-1920x1080-{en,tr}.mp4`) ve dikey (`video/trailer-1080x1920-{en,tr}.mp4`) dört sürümü var.
Hiçbir hazır görüntü, stok müzik ya da video düzenleme programı kullanılmadı. Her şey kodla üretildi:

| Parça | Dosya | Ne yapar |
|---|---|---|
| Sinematik sahneler | `tools/trailer-scenes.js` | Elle çizilmiş piksel sahneler: şafak, hamsi sürüsü, ağ atma, lodos, Şahmeran, gece limanı |
| Çekim ve kurgu | `tools/trailer.js` | Oyunu tarayıcıda açar, kare kare çeker, sahnelerle iç içe kurgular, yazıları ve geçişleri bindirir |
| Müzik ve ses | `tools/trailer-music.py` | Özgün müzik ve ses efektleri, yankılı stereo miks |
| Birleştirme | `ffmpeg` | Kareleri ve sesi MP4'e çevirir |

---

## 1. Ana fikir: "Hamsi Koyu'nda bir gün"

Fragman bir mekanik listesi değil, şafaktan geceye süren tek bir gün olarak kurgulandı. Işık da gün boyunca değişir.
Bir hikâye ipi sahneleri birbirine bağlar:

> Balıkçı şafakta ağını atar → ağ suyun altında hamsi sürüsünün üstüne iner → **logo o anda vuruşla açılır** →
> balık oyunda kasaya dökülür → koy büyür → akşam müşteriler gelir → gece fırtına → dipte kadim bir söz → logo

Üç perde:
1. **Sakin giriş (0–15 sn):** atmosfer, merak. Müzik yavaş, deniz ve martı sesleri.
2. **Oyun (15–46 sn):** mekanikler, enerji. Horon teması ve oyunun kendi sesleri.
3. **Gizem ve final (46–60 sn):** müzik kesilir, efsane, logo.

## 2. Zaman çizelgesi (120 BPM, 1 ölçü = 2 sn)

| Sn | Çekim | Kaynak | Yazı (EN / TR) | Geçiş |
|---|---|---|---|---|
| 0–7 | Şafak, Karadeniz köyü | çizim | THE BLACK SEA / KARADENİZ · "Every autumn, the hamsi come home." | siyahtan açılış |
| 7–11 | Kayıktan ağ atma | çizim | "Every legend starts with a single net." | çözülerek |
| 11–15 | Su altı: ağ sürüye iner | çizim | "Silver, by the million." | sıçramada kesme |
| 15–17 | **Logo** (sürünün üstünde) | çizim | HAMSİ KOYU | vuruş + parlama |
| 17–21 | Ağ ve kasa (sabah) | oyun, yakın | CATCH / AVLA | çözülerek |
| 21–24.5 | Kesim masası | oyun, yakın | FILLET / KES | çözülerek |
| 24.5–28 | Tezgâh, satış | oyun, yakın | SELL / SAT | çözülerek |
| 28–33 | **Hızlandırılmış büyüme** | oyun, geniş | GROW YOUR COVE / KOYUNU BÜYÜT + kasa sayacı + açılan bölgeler | çözülerek |
| 33–37 | Personel (ikindi) | oyun | HIRE A CREW / EKİBİNİ KUR | çözülerek |
| 37–41.5 | Özel müşteri (akşam) | oyun, yakın | 69 QUIRKY CUSTOMERS / 69 TUHAF MÜŞTERİ | çözülerek |
| 41.5–43.5 | Müşteri Defteri | oyun paneli | THE CUSTOMER BOOK / MÜŞTERİ DEFTERİ | çözülerek |
| 43.5–46 | Lodos gecesi | çizim | STORMS · SHOALS · RUSH HOURS (damga) | şimşek |
| 46–47.5 | Siyah | — | "But the sea keeps a promise..." | siyaha iniş |
| 47.5–51.5 | Dipte Şahmeran | çizim | "Beneath the cove, something ancient waits." | siyahtan açılış |
| 51.5–55 | Dipteki Söz ara sahnesi | oyunun hikâye motoru | THE PROMISE BELOW / DİPTEKİ SÖZ + altyazı | çözülerek |
| 55–60 | Gece limanı + logo kartı | çizim | "Build your cove. Keep the promise." · FREE · NO ADS | çözülerek, sonda siyah |

## 3. Elle çizilmiş sahneler (`trailer-scenes.js`)

- **Çözünürlük:** 320×180 piksel, ×6 büyütülür (1920×1080). Pikseller iri ve okunaklı, oyunun stiliyle uyumlu.
- **Katmanlar ve paralaks:** gökyüzü, bulutlar, dağlar, yamaç, deniz ve ön plan ayrı katmanlar. Kamera kayarken her katman farklı hızda hareket eder.
  Katmanlar çıkışa kesirli kaydırmayla basılır: pikseller keskin kalır ama kamera akıcı kayar.
- **Bayer titreşimi (dithering):** gökyüzü ve deniz geçişleri düzenli nokta deseniyle yapılır. Klasik piksel sanat tekniğidir, yumuşak gradyan kullanılmaz.
- **Ters ışık (kontra) ve silüet:** balıkçı ve kayık güneşe karşı koyu silüettir. Kenarlarına otomatik turuncu "kenar ışığı" verilir
  (saydam komşusu olan her opak piksel boyanır). Az detayla sinematik bir his verir.
- **Kültürel ayrıntılar:** çay sekili yamaç, kırmızı kiremitli beyaz evler, cami ve minare, mendirek feneri, Karadeniz kayığı
  (kalkık baş, kırmızı-mavi bordür), hamsi, palamut, hilal, Şahmeran tacı.
- **Canlılık:** martılar, yakamoz, kabarcıklar, ışık hüzmeleri, yağmur, şimşek, dönen fener. Hamsi sürüsü bir girdap hâlinde döner,
  içinden geçen palamuttan kaçarak açılır. Ağ suyun altında sürünün üstüne iner.

## 4. Temiz oyun görüntüsü (`trailer.js`)

- Oyun Playwright ile Chromium'da açılır. Oyunun saati **sanaldır**: `requestAnimationFrame`, `performance.now` ve `setTimeout` elle adımlanır.
  Her kare tek tek çekilir; bilgisayar ne kadar yavaş olursa olsun video akıcı 30 fps olur.
- `game.js` tarayıcıya **küçük yamalarla** sunulur, dosyanın kendisi değişmez:
  - **Serbest kamera:** kamera oyuncuyu izlemek yerine istenen noktaya gider.
  - **Yakınlık 1–5:** geniş plandan çok yakın plana kadar.
  - **Etiketler gizli:** oyun içi yazılar ve rozetler kapatılır. Yalnız özel müşteri çekiminde müşterinin adı ve sözü kalır.
- Arayüz (para, alt menü) CSS ile gizlenir.
- **Gün ışığı:** her çekimde oyunun saati ayarlanır; oyunun kendi akşam tonu ve fenerleri devreye girer. Üstüne hafif bir renk tonu biner
  (sabah krem, ikindi altın, akşam turuncu).
- **Hızlandırılmış büyüme:** sabit geniş planda dört bölge sırayla açılır, personel alınır, her adımda oyun birkaç saniye ileri sarılır.
  Kasa sayacı 80'den 184.250'ye çıkar, açılan bölgenin adı üstte belirir.
- **Hikâye:** oyunun kendi Dipteki Söz motoru tam ekran açılır, diyalog altyazı olarak okunur.

## 5. Yazı ve sinema dili

- **Sinema şeritleri** (üst ve altta siyah bant, 2.39:1), **vinyet**, oyunun piksel fontu (Pixelify Sans).
- **Yazı türleri:**
  - ara yazı: ortada, ince, harf aralığı yavaşça açılır
  - büyük başlık: altın çizgi uzar, alt satır gecikmeli gelir
  - damga: çerçeveli, küçülerek yerine oturur
  - döngü şeridi: altta AVLA › KES › SAT › BÜYÜT
  - kasa sayacı, bölge çipi
  - efsane başlığı, kapanış kartı (logo, parlama süpürmesi)
- **Geçişler:** sert kesme ve beyaz patlama yerine çoğunlukla **çözülerek geçiş** var: önceki çekimin son karesi 0,4–1 sn'de erir.
  Beyaz patlama yalnız üç vuruş anında kullanılır: suya düşüş, logo, şimşek.
- **Yavaş yaklaşma:** oyun çekimlerinde görüntü çekim boyunca %3–5 yakınlaşır.

## 6. Müzik ve ses tasarımı (`trailer-music.py`)

Numpy ile sentezlenir, hiçbir örnek ses kullanılmaz.

- **Enstrümanlar:**
  - kemençe benzeri yaylı (titreşimli, formantlı, kayan perdeli)
  - davul (gümbür ve kenar), tef/zil, el çırpma
  - saz teli, bas
  - pad ve koro ("a" sesli formant)
  - ney (nefes sesi ile), çanlar
  - sinematik "boom" ve "braam" vuruşları, yükselişler (riser)
- **Yapı:**
  - giriş: pad ve kemençe havası
  - suyun altı: parlayan arpej
  - logo vuruşuyla **horon teması** (La minör, 120 BPM)
  - büyümede tema yükselir (alt oktav, saz)
  - müşterilerde hafifler
  - lodosta vuruşlar
  - kesik: tek çan
  - efsane: **hicaz makamında** ney, koro, kalp atışı
  - final: hicazın La majöre çözülüşü, çanlar
- **Dünyanın sesleri** (fragmanı canlı kılan şey bu):
  - deniz ve martılar, ağın savrulması, suya düşüş, su altı uğultusu ve kabarcıklar
  - kasaya düşen balıklar, bıçak, pazar uğultusu, sikkeler
  - inşaat "tak"ları ve kasa sayacı tıkırtısı
  - müşteri mırıltısı (oyunun "bıdı bıdı" sesi), sayfa çevirme
  - gök gürültüsü ve yağmur, gözler açılırken çınlama
- **Miks:** kuru kanal ve yankı gönderimi (2,6 sn yapay oda, sol ve sağ ayrı), hafif stereo genişlik, yumuşak sınırlayıcı.
  Bölümler arasında bilinçli ses farkı var: giriş sessiz, logo ve final yüksek, kesik anı neredeyse sessiz.

## 6b. Dikey sürüm (1080×1920)

Yatay video kırpılmaz; dikey ekranda baştan çekilir.
- **Oyun:** tarayıcı penceresi dikeydir (540×960 @2x). Oyun mobilde zaten dikey çalıştığı için kadraj doğaldır.
  Yakınlık bir kademe artırılır; böylece piksel büyüklüğü yatay sürümle aynı kalır.
- **Çizilmiş sahneler:** sahne yine yatay çizilir. 135 piksel genişliğinde bir dilim ×8 büyütülerek ortaya konur ve dilim sahne
  içinde yavaşça kayar: şafakta köyden güneşe, ağda balıkçıdan ağın düştüğü yere. Üst ve alt boşluklar sahnenin kenar renkleriyle,
  karanlığa doğru yumuşakça doldurulur.
- **Yazılar:** sinema şeritleri yok. Yazılar küçülür, satıra bölünür ve sosyal medya arayüzlerinin kapatmadığı orta alana
  oturur: ara yazılar üstte, başlıklar alt üçte birlikte.

## 7. Süreçte öğrenilenler

| Deneme | Sorun | Çözüm |
|---|---|---|
| 1. Oyun ekran kaydı + yazı | Sinematik değil; ekran etiketlerle dolu; yazıyla görüntü örtüşmüyor | Etiketleri gizle, her mekaniği tek bir net yakın planla göster |
| 2. Elle çizilmiş sahneler + temiz oyun | İyi ama "yavan"; kesmeler çok hızlı (21 çekim, beyaz patlamalar) | Hikâye ipi, "bir gün" yapısı, 16 uzun çekim, çözülerek geçiş |
| 3. Son sürüm | — | Oyun dünyasının sesleri, ortada logo açılışı, hızlandırılmış büyüme |

En büyük farkı yaratanlar: (1) sahneleri bağlayan hikâye, (2) oyun sahnelerindeki ortam ve eylem sesleri, (3) nefes alan bir tempo.

## 8. Yeniden üretmek

```
cd balikci-tycoon && python3 -m http.server 8099          # ayrı bir terminalde
node store/tools/trailer.js en                              # 1800 kare → store/video/frames-trailer-en/
node store/tools/trailer.js tr                              # Türkçe     → store/video/frames-trailer-tr/
node store/tools/trailer.js tr v                            # dikey 1080×1920 → store/video/frames-trailer-tr-v/
node store/tools/trailer.js tr preview grow,special         # hızlı önizleme: her 10. kare, yalnız seçilen çekimler
python3 store/tools/trailer-music.py store/video/trailer-music.wav
cd store/video && ffmpeg -framerate 30 -i frames-trailer-tr/%05d.jpg -i trailer-music.wav \
  -c:v libx264 -tune animation -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 224k -ar 48000 -shortest \
  -movflags +faststart trailer-1920x1080-tr.mp4
```
Gerekenler: Node 22 ve Playwright (Chromium), Python 3 ve numpy, ffmpeg.

---

## 9. Başka bir yapay zekâ için hazır istem

Aşağıdaki metni olduğu gibi kopyalayabilirsiniz. Oyunun kodunu da verirseniz çok daha iyi sonuç alırsınız.

```
Hamsi Koyu adlı pixel-art balıkçı işletmesi oyunum için 60 saniyelik, 1920×1080, sinematik bir fragman istiyorum.
Dil: [İngilizce / Türkçe]. Oyunun mekaniklerini anlatsın ama bir reklam listesi gibi değil, bir film fragmanı gibi hissettirsin.

Yapı — "Hamsi Koyu'nda bir gün" (şafaktan geceye, ışık gün boyu değişsin):
1. Sakin giriş (0–15 sn): Şafakta Karadeniz kıyısı (çay sekili yamaçta kırmızı kiremitli köy, minare, mendirek feneri).
   Kayıktan ağ atan balıkçı silüeti (güneşe karşı, turuncu kenar ışığı). Ağ suya düşer; su altında ışık hüzmeleri
   arasında dönen dev bir hamsi sürüsünün üstüne iner. Ara yazılar: "The Black Sea" / "Every autumn, the hamsi come home." /
   "Every legend starts with a single net." / "Silver, by the million."
2. Logo vuruşu (15 sn): müzik patlar, logo sürünün üstünde açılır.
3. Oyun bölümü (17–46 sn), her biri 3,5–5 sn, çözülerek geçişlerle:
   AVLA (ağ ve kasa) → KES (kesim masası) → SAT (tezgâh, sikkeler) → KOYUNU BÜYÜT (sabit geniş planda dört bölge sırayla
   açılır: Balık Pazarı, Fümehane 2.4× değer, Balıkçı Mutfağı; kasa sayacı yükselir) → EKİBİNİ KUR (hamal, filetocu, tezgâhtar,
   tahsildar, müdür) → 69 TUHAF MÜŞTERİ (adı gizli özel müşteri, "?????") → MÜŞTERİ DEFTERİ → LODOS · BALIK SÜRÜSÜ · YOĞUN SAAT.
   Altta "AVLA › KES › SAT › BÜYÜT" döngü şeridi.
4. Gizem ve final (46–60 sn): müzik kesilir, "But the sea keeps a promise..." → denizin dibinde antik kemer, dev pullu yılan
   kuyruğu, karanlıkta açılan gözler ve taç (Şahmeran) → oyunun "Dipteki Söz" ara sahnesi → gece limanı (fenerler, sudaki
   yansımalar, dönen fener hüzmesi) üstünde logo: "Build your cove. Keep the promise." · FREE · NO ADS · NO IN-APP PURCHASES.

Görsel kurallar: oyunla aynı piksel stili (iri pikseller, sınırlı palet, Bayer titreşimli gökyüzü, gradyan yok); 2.39:1 sinema
şeritleri; vinyet; oyun görüntüsünde arayüz ve oyun içi etiketler gizli, kamera özenle kadrajlanmış ve yavaşça yaklaşan;
piksel font. Geçişler çoğunlukla çözülerek; beyaz patlama yalnız 2–3 vuruş anında. Tempo nefes alsın: 16 civarı çekim.

Ses: özgün, telifsiz müzik. Giriş: pad ve kemençe havası. Logo vuruşunda horon teması (kemençe, davul, tef, La minör, 120 BPM).
Efsane bölümünde hicaz makamında ney, koro ve kalp atışı. Finalde La majöre çözülen akor ve çanlar. Mutlaka oyun dünyasının
sesleri olsun: deniz, martılar, ağın savrulması, suya düşüş, kasaya düşen balık, bıçak, pazar uğultusu, sikkeler, inşaat
sesleri, kasa sayacı, müşteri mırıltısı, gök gürültüsü ve yağmur. Görüntüdeki her vuruşa bir ses denk gelsin.
```
