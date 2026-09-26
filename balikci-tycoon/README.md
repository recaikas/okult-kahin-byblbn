# 🐟 Balıkçı Tycoon — **v1.3** (müdürler, füme makinesi, Bölüm 1 hedefi)

İzometrik **pixel-art** balıkçı tycoon oyunu. Türkiye kıyı limanı teması, **Türkçe + İngilizce**.
Tek klasör, bağımlılık yok: `index.html` + `game.js` (+ `specials.js` karakterler, `config.js` online skor).

## Oynamak için
`index.html` dosyasını tarayıcıda aç (mobil + masaüstü). İstersen: `npx http-server -p 8080 .`

## Çekirdek döngü
**AĞ → TOPLA → KESİM → TEZGÂH → SATIŞ → YATIRIM**
Füme hattı: Balık → Kesim → (bant) → Fümehane → Füme paketi (2.4× değer)

---

## v1.6 — Mağaza hazırlığı (App Store + Google Play): teknik ve hukuki temel

Hedef: oyunu iOS ve Android uygulaması olarak mağazalara çıkarmak. Tüm yol haritası, kalanlar ve mağaza metinleri
**[MAGAZA.md](MAGAZA.md)**'de.

**Özgün karakterler (hukuki).** 33 ünlü parodisi özel müşteri özgün karakterlere dönüştü: Kıvanç Parıltı, Öfkeli Ömer,
Dansçı Deniz, Cömert Cemile, Robotik Rüştü, Pullu Pınar… Meslekler, huylar, sesler ve oyun etkileri aynı kaldı (sabır,
bahşiş, sipariş, dans, geri geri yürüme). Değişenler:
- gerçek kişilerin adları ve lakapları,
- imza sözleri ve şarkı sözlerinden alıntılar,
- tanınır görünüşleri.

Halk kahramanları (Temel, Nasır Hoca) ve telifi dolmuş klasik (Şerlok) kaldı. `specials.js` başına kural eklendi:
gerçek ünlülerin adı, sözü ya da görünüşü kullanılmaz.

**Uygulama altyapısı (teknik)**
- **Yazı tipi gömülü:** Pixelify Sans (`fonts/`, OFL lisansı). Oyun hiçbir dış adrese istek atmadan, internetsiz açılır.
- **`native.js` yükleyici:** Web'de yalnız oyun dosyalarını sırayla yükler. Uygulamada:
  - kayıtları telefonun kalıcı deposuna (Capacitor Preferences) yansıtır; WebView `localStorage`'ı silinse bile
    açılışta geri yükler;
  - Android geri tuşu açık paneli kapatır, sonra duraklatma menüsünü açar; ana ekranda uygulamayı arka plana alır;
  - uygulama arka plana geçince kayıt alınır, durum çubuğu gizlenir.
- **Escape ile geri tuşu aynı mantıkta:** artık açık alt paneli de kapatıyor.
- **`mobile/`:** Capacitor projesi.
  - iOS ve Android kabukları, dikey ekran kilidi, iOS ilk sürümde yalnız iPhone.
  - Uygulama kimliği `io.github.recaikas.balikcitycoon`.
  - Pixel art simge ve açılış ekranı; kaynak `mobile/assets-src/iconart.html`, tüm boyutlar üretildi.
  - Derleme komutları: `npm run sync | android | ios`.

**Gizlilik (mağaza şartı)**
- `privacy.html` (TR/EN): ne toplandığı, neden, nasıl silineceği. Oyun içinde Ayarlar › Gizlilik Politikası'ndan
  açılır; web adresi `https://recaikas.github.io/okult-kahin-byblbn/privacy.html`.
- Ayarlar › **Çevrimiçi skor tablosu: Açık/Kapalı.** Kapalıyken sunucuya hiçbir istek gitmez.
- Ayarlar › **Skor kaydımı sil:**
  - sunucudaki kayıtları (`bt_forget`, `online/schema.sql`) ve cihaz listesini siler,
  - yeni anonim kimlik üretir,
  - oyun kayıtlarına dokunmaz.
- GitHub Pages yayını yeni dosyaları (`native.js`, `fonts/`, `privacy.html`) da kopyalıyor.

**Yeni testler**
- `test-native.js` (sahte Capacitor):
  - kayıt kalıcı depoya yansıyor ve silinmiş `localStorage`'a geri geliyor;
  - geri tuşu sırası doğru;
  - `pause` olayında kayıt alınıyor;
  - web yüklemesinde dış istek yok.
- `test-gizlilik.js` (sahte Supabase):
  - paylaşım kapalıyken istek gitmiyor;
  - silme doğru kimlikle çalışıyor ve kimlik yenileniyor;
  - gizlilik penceresi açılıyor, oyun duruyor, Escape ile kapanıyor.

**Kalan (MAGAZA.md):**
- `privacy.html`'deki iletişim e-postası;
- Supabase'de `schema.sql`'in yeniden çalıştırılması;
- gerçek cihaz testi;
- ekran görüntüleri;
- ödüllü reklam aşaması.

---

## v1.5 — Her binanın kendi mimarisi

Sorun: Hizmet binaları tek bir şablonun (kutu gövde + kiremit çatı + cumba + bayrak) renk ve isim değişimiydi. Birkaç
yapı da birbirinin kopyasıydı: Soğuk Sandık ile meydandaki Depo, Kapalı Pazar ile Ticaret Ofisi.

**Hizmet binaları** — her birinin kendi silueti, malzemesi ve 5 seviyelik büyüme hikâyesi var:

| Bina | Sv.1 → Sv.5 |
|---|---|
| 🧊 Buzhane | Saman çatılı ahşap buz kulübesi → yalıtım panelli beyaz soğuk depo → tuğla kaide + dönen çatı soğutucusu → şerit perdeli rampa → saçak buzları, çatı tabelası, frigorifik kamyon. Hep alçak ve düz çatılı. |
| 🍽️ Restoran | Turkuaz balık-ekmek büfesi + şemsiye → badanalı lokanta, kiremit çatı, çizgili tente → camlı cephe, ahşap teras, ışık zinciri → teras çatılı ikinci kat → balık tabelası, saksılar. Bacasından duman çıkar. |
| 📋 Nakliye Ofisi | Turuncu ofis konteyneri → mavi konteyner + merdiven → üstte yeşil konteyner, yükleme sundurması, forklift → kapıda kamyon → sarı portal vinç (arabası gider gelir). |
| 🤝 Kooperatif | Taş temel üstünde göz dolması ahşap, pul kaplı kırma çatı (Karadeniz evi) → çardak altında çay masası → taş zemin kat + taşan ahşap üst kat → ahşap balkon, saksılar → çatı penceresinde birlik amblemi, fenerler. |
| 🔔 Mezat Salonu | Branda gölgelik, sandıklı mezat masası, direkte çan → ahşap direkli çinko çatı → taş sütunlu revak, arduvaz çatı, ahşap çan kulesi → arka duvar → kemerler, taş çan kulesi, saat, sancak. Mezat kapanışta çan sallanır. |

**Diğer yapılar**
- **Soğuk Sandık** (Yapı): artık küçük bir depo binası değil; palet üstünde mavi gövdeli, beyaz kapaklı buz sandığı,
  kapağın arasından balık kuyruğu görünür.
- **Balık Hali** (Meydan): taş sütun + kiremit yerine çelik direkli, **kemerli (tonoz) çinko çatılı** hal; alında
  camlı kemer, HAL levhası, kantar ve kasalar.
- **Kapalı Pazar**: Ticaret Ofisi'nin konak tarzından ayrıldı. Revaklı taş gövde (önde 4, yanda 3 kemer), kurşun
  kaplı beşik çatı, mahyada camlı fener.
- **Personel Kulübesi**: kapı önünde sıra, çamaşır ipinde önlükler, üst seviyede baret askısı.

**Yeni test:** `test-binalar.js`
- Her seviyede beş binanın ekrandaki piksellerini okur; boş parselin zeminini çıkarıp yalnız binanın renk dağılımını
  karşılaştırır.
- Hiçbir iki bina birbirine benzememeli: şu an en az %54 fark var.
- Her bina Sv.1'den Sv.5'e gözle görülür şekilde değişmeli.
- Her binanın ayrı bir çizim fonksiyonu olmalı.

---

## v1.4 — Hizmet binaları 9 → 5: her bina görünür, ayrı bir iş yapar

**Neden:** Dokuz binanın bir kısmı ya çalışmıyordu (Yakıt İstasyonu ve Tersane'nin tekne etkileri oyunda yok, yalnız
pasif para veriyorlardı), ya da başka bir şeyin kopyasıydı (Buzhane = Soğuk Sandık = Depo; Toptancı Hanı'nın adı
Balık Hali ve Kapalı Pazar'la karışıyordu).

| Bina | Ne yapar |
|---|---|
| 🧊 **Buzhane** | Ağ stoğu + **tezgâh kapasitesi** (Sv.5'te +8), üst seviyede çırak hızı. Bozuk "toplu sipariş tamponu" kalktı. |
| 🍽️ **Restoran** | Pasif para basmaz. Depo %60'tan ya da tezgâh %75'ten doluysa fazla malı pişirip satar (Sv.1: 40 sn'de 2 ürün → Sv.5: 22 sn'de 6 ürün, %125 fiyat). Fazla yoksa "fazla mal yok" der. Sv.3'te Turist müşteri açar. |
| 📋 **Nakliye Ofisi** | Değişmedi: kontrat yuvası, teklif ve ödül. |
| 🤝 **Su Ürünleri Kooperatifi** | Eski Kooperatif + **Tamirhane**: maaş −, **yükseltmeler −%2…−%10**, ürün değeri +, itibar +. |
| 🔔 **Mezat Salonu** | Eski Mezat + **Toptancı Hanı**: gün sonu açık artırma + **kuyruk +1…+3**, Sv.3'te Toptancı müşteri, toptan ödül +. |

- **Bölüm 2'ye kaldı:** Yakıt İstasyonu ve Tersane, filo sistemiyle birlikte dönecek (BOLUM2_TASLAK.md).
- **Hizmet Sahası 5 parsel:** 2 kaydırmalı sütun. Her parsel beş binanın hepsini alır; bölge açıldıkça açılır
  (İskele 2, Pazar 2, Fümehane 1). Ada küçüldü, saha ferahladı.
- **Eski kayıtlar:**
  - Kaldırılan bina, birleştiği binaya seviye olarak geçer: Tamirhane Sv.3 → Kooperatif en az Sv.3; Toptancı Hanı
    Sv.2 → Mezat en az Sv.2.
  - Birleşmenin karşılamadığı harcama ve Yakıt İstasyonu ile Tersane'nin tüm parası **iade edilir**. Oyuncuya
    bildirim çıkar.

**Yeni test:** `test-hizmet.js` şunları doğrular:
- katalogda 5 bina var;
- Buzhane, Kooperatif ve Mezat'ın etkileri gerçekten uygulanıyor;
- Restoran fazla yokken para basmıyor, fazla varken pişirip satıyor;
- eski kayıt taşınınca seviyeler doğru ve iade tam 80.000 (Yakıt Sv.1 + Tersane Sv.2).

---

## v1.3.3 — Özel müşteriler okunabilir, füme talebi dengelendi

**Özel müşteriler ne dediğini okutuyor**
- Selam cümlesi metnin uzunluğuna göre 4–9 saniye ekranda kalır. Başının üstündeki küçük altın çubuk kalan süreyi
  gösterir.
- Cümle bitene kadar sipariş alınmaz; tezgâhta stok hazır olsa bile beklenir. Bu sürede sabrı azalmaz.
- Normal müşterilerden yavaş yürür: gelirken ~%60 hızda, giderken yarı hızda. Veda cümlesi de uzunluğuna göre
  ekranda kalır. Arkadaki normal müşteriler bu sırada servis edilmeye devam eder.

**Füme talebi oranlı**
- Füme makineli tezgâhlar (İskele, Balık Pazarı): siparişlerin ~%18'i füme, tavan %22.
- Fümehane (füme orada asıl ürün): ~%26, tavan %33.
- Tavan son siparişlere bakar. VIP de dahil: tavan doluysa VIP fileto ister (yine yüksek ödemeyle).
  Böylece füme hiçbir tezgâhta fileto siparişlerinin yarısını geçmez.
- Füme fiyatına (×2.4) dokunulmadı; yalnız ne kadar sık istendiği değişti.

**Yeni test:** `test-okuma-fume.js` şunları doğrular:
- füme payı üç tezgâhta da tavanın altında, yalnız VIP gelse bile;
- özel müşteri yavaş geliyor;
- selam bitene kadar sipariş alınmıyor ve sabrı azalmıyor;
- söz bitince servis ediliyor;
- yavaş ayrılıyor.

---

## v1.3.2 — Her şeyin bir yeri var: hiçbir şey üst üste gelmez

Sorun: Geliştirme'den eklenen binalar (çay ocağı, ek tezgâh, reklam panosu…), bölge tabelası, müdür masası,
lambalar, çöp kovaları ve hizmet parselleri serbest noktalara konmuştu. Bazı birleşimlerde birbirinin üstüne
biniyordu. Örneğin "Balıkçı İskelesi" tabelası iskelenin ortasında kalıyordu.

**Zeminde (ayak izi)**
- Her nesnenin sabit bir yeri ve bir ayak izi var: ağlar, masa ve hasırlar, tezgâh + para tepsisi + füme makinesi,
  yapı noktaları, Kapalı Pazar, parseller, müdür masaları, lambalar, çöp kovaları, Ana Kasa, süsler.
  `layoutClashes()` bunları karşılaştırır; 0.1 karo payla bile hiçbiri başka birine değmez.
- Tezgâhların para tepsisi ve füme makinesi yol tarafında, tezgâhın yanında. Yerleri tezgâha göre hesaplanır, ek
  tezgâhlarda da aynıdır.
- Yerleşim bir çözücüyle (tavlama) bulundu: önce zemin çakışması sıfırlandı, sonra ekranda üst üste binme
  en aza indirildi.

**Bölge tabelası artık ana tezgâhın tentesinde**
- "BALIKÇI İSKELESİ", "BALIK PAZARI" ve "FÜMEHANE" levhaları o bölgenin ana tezgâhının tentesine asılı. Ayrı bir yer
  kaplamaz, hiçbir binanın önüne düşmez.

**Kapalı Pazar**
- Balık Pazarı bölgesinin arka-yol köşesinde. Önünde tezgâh kalmaz, Balık Pazarı tezgâhının tentesiyle ekranda
  çakışmaz.
- Tezgâhı binanın içinde; yalnız ürün yığını ve para tepsisi görünür. Tabelası varken üstteki ikinci ad etiketi
  kaldırıldı.

**Hizmet Sahası (yeni alan)**
- 9 hizmet parseli (Buzhane, Toptancı Hanı, Restoran, Tamirhane…) artık bölgelerin içinde değil, meydanın
  güneyindeki kendi sahasında. Meydandan bir patika iner, ada doğuya doğru genişledi.
- Parseller 3 sütunda, her sütun bir öncekinden 2 karo aşağıda. En üst seviyede bile hiçbir bina bir başkasının tam
  önüne ya da arkasına düşmez. Binalar biraz küçültüldü.
- Parsel adları: Saha 1–9 (İskele / Pazar / Fümehane). Hangi bölgenin açılmasıyla açıldıkları aynı kaldı.
- Oyuncu bir saha binasının ya da Kapalı Pazar'ın arkasına geçerse silüeti görünür.

**Yeni test:** `test-layout.js` şunları doğrular:
- zeminde çakışma yok;
- süs mesafeleri ve parsel doğrulaması geçiyor;
- saha binaları ekranda ayrı duruyor;
- her parselin önünde yürünebilir zemin var;
- Kapalı Pazar tezgâh tentesine binmiyor;
- bölge tabelası ayrı bir nesne değil;
- her şey kurulu ve en üst seviyedeyken sahne hatasız çiziliyor.

---

## v1.3.1 — Bölüm 1 baştan sona oynandı (bot) ve bulunan hatalar düzeltildi

`test-playthrough.js` Bölüm 1'i baştan sona oynar: yeni oyun → ilk dakikalar gerçek klavyeyle (ağ → kesim →
tezgâh → kasa → Ana Kasa) → bütün alımlar arayüzden tıklanarak (bölgeler, seviyeler, yükseltmeler, yapı noktaları,
süsler, çevre, füme makineleri, meydan, Kapalı Pazar, 12 personel, 3 müdür) → günler gerçekten oynanır (gün sonu,
Balık Pazarı günü, tezgâh ekranları) → ortada kaydet/yenile/yükle → sayaç 59/59 → gazete kapanışı → bölüm kartı.
Konsol hatası: 0.

**Düzeltilen hatalar**
- Bölüm sayacında "Yükseltmeler" satırı süsleri de sayıyordu (0/32) → yalnız sepet/ayakkabı/pazarlık (0/20).
- Kapalı Pazar binasının üstünde hâlâ eski ad **"BALIK HALİ"** yazıyordu → "KAPALI PAZAR".
- Bölüm sonu gazetesi açılırken alt panel açıksa sahnenin arkasında açık kalıyordu → sahne başlarken kapanır.
- Uzun işletme adlarında gazete resim altı taşıyordu → kısaltılır.
- Eğitimin çok ötesine geçmiş oyuncuda (seviye 3+, tam otomatik bölge ya da bölüm sonu) yarım kalan eğitim hedefi
  ("Sandığın üstünden geç…") ekranda kalabiliyordu → kendiliğinden kapanır.
- Tam gelişmiş limanda stok rozetleri ve istasyon etiketleri üst üste biniyordu → tam otomatik bölgelerde yalnız
  oyuncu yakındayken gösterilir.

**Yeni test:** `test-chapter.js` — son müdürü arayüzden alır, sayacın dolmasını, gazetenin iki sayfasını (gerçek
dokunuşla), bölüm kartını, bölüm sonrası oyunun sürmesini ve kayıttan dönünce bölümün yeniden tetiklenmediğini doğrular.

---

## v1.3 — Müdürler, füme makinesi, ayrı ağlar, Bölüm 1 hedefi

**Hata düzeltmeleri**
- **Arka plan perspektifi:** kasaba/tepe manzarası ekrana sabitti. Harita büyüyünce oyun alanı ufkun üstüne taşıyor,
  aşağı inince kasaba iskelenin yanında görünüyordu. Ufuk artık haritanın kuzey köşesine bağlı: üstte pastel
  gökyüzü, altta uzakta koyulaşan deniz. Aşağı inince uzak kıyı doğal olarak kadrajdan çıkar.
- **Panel renkleri:** YÜKSELT/YAPI paneli açıkken para yetince kartlar yeşillenmiyordu (ama alınabiliyordu). Panel
  artık para/seviye değişince kendini yeniler, kaydırma yeri korunur.
- **Dar ekran:** ☰ düğmesi 430 px genişlikte de kesiliyordu; sıkı üst şerit artık 540 px'e kadar devrede.
- **Füme tıkanması:** Fümehane açılınca bütün tezgâhlar füme istiyor, oysa füme yalnız Fümehane fırınında yapıldığı için
  1. ve 2. tezgâh tıkanıyordu. Artık bir tezgâh ancak füme kaynağı varsa füme sipariş alır.

**Füme Makinesi** (YÜKSELT, Fümehane açıldıktan sonra): Balıkçı İskelesi $3.200, Balık Pazarı $4.800. Tezgâhın
yanına kurulur, tezgâhtaki filetoyu yerinde tüter (füme siparişi bekleyen varsa ya da stok bolsa 2'lik küçük stok).
O bölgenin müşterileri de füme ister (2.4× değer). Ateş penceresi yanar, bacadan duman çıkar.

**Orta bölge (Balık Pazarı):** palamut ve orkinos artık **kendi ağlarından** gelir (tezgâhları açılınca batı kıyısında
belirir). Kesim masasında türler **ayrı yığınlarda** durur; her yığının kendi sınırı var, biri dolunca masa diğer
türleri kesmeye devam eder. Hamal, yığını dolu türün ağına gitmez.

**Bölge Müdürü:** bölgenin 4 personeli tamamlanınca YÜKSELT'te "Müdür gerekli" kartı çıkar. 3 aday arasından
seçilir; her adayın iki buff'ı var (satış fiyatı +%12, personel %20 hızlı, müşteri sabrı +%35, müşteri akışı +%12,
bölge maaşları −%30, satış başına +1 itibar). Masa + işe alım ücreti + maaş. Müdür gelince bölge **tam otomatiğe**
geçer. Müdür tezgâhın yanındaki masasında durur.

**Özel müşteriler:** her birinin **kendi hafif sesi** var (öpücük, gitar, martı, papağan, miyav, deklanşör, robot…).
İsimlerin İngilizcesi eklendi (Tek Göz Recep → One-Eyed Renny, Tuz Baba → Salt Daddy, Kaya Conson → Rocky Johnsun…).
Yeni takvim: tanıdıklar **14 günde bir** yeniden uğrar, günün öbür yeri hep yeni bir yüze ayrılır (50 kişinin hepsi
yaklaşık 36. günde tanışılmış olur).

**12 yeni sokak müşterisi** (kendi kıyafetleriyle): Öğrenci, Emekli Amca, Pazar Teyzesi, Komşu Balıkçı, Koşucu, Zabıta,
Gazeteci, Doktor, Ressam, Dalgıç, Muhtar, Otel Aşçıbaşı. Aynı tipin müşterileri artık saç modeli ve boyla ayrışır.

**Bölüm 1 hedefi:** sol kenarda yanıp sönen **merdiven** simgesi ve yüzde. Tıklayınca hedef ("üç tezgâhı sonuna kadar
büyüt") ve 10 başlıkta eksikler görünür: bölgeler, bölge seviyeleri, yükseltmeler, yapı noktaları, süsler, çevre,
füme makineleri, Kapalı Pazar, meydan binaları, müdürler. Sayaç dolunca **Bölüm 1 kapanışı: gazete manşeti** —
açılıştaki dönen gazete geri gelir: "LİMANIN YENİ PATRONU", oyuncunun **gerçek limanının** o anki fotoğrafı (sepyadan
renge döner) ve kendi rakamları; ertesi sabahın gazetesinde ufukta dev trol filoları ve fabrika: *"Artık devler
liginde hayatta kalmalıyız…"* Ardından Bölüm 1 bitiş kartı. Bölüm 2 planı (şubeler, fabrika/marka, üç dev, pazar
payı ve borsa savaşları, telefon) `BOLUM2_TASLAK.md`'de.

---

## v1.2 — Çevre yatırımları: yol artık itibarla kendiliğinden yenilenmez

Eskiden yol ve çevre, itibar seviyesi ve açılan binalarla **kendiliğinden** güzelleşiyordu (ör. seviye 9'da yol
birden yenileniyordu). Artık her kademe **YAPI › Dekoratif** sekmesinin başında bir kart olarak çıkar ve iki şartla alınır:
para + itibar seviyesi. Her kademe **müşteri geliş hızını** artırır.

| Kademe | Şart | Fiyat | Görünüm | Müşteri akışı |
|---|---|---|---|---|
| 1. Çakıl Yol | Seviye 3 | $1.800 | Çukurlar dolar, çakıl yol, ağaçlar yeşerir | +%8 |
| 2. Arnavut Kaldırımı | Seviye 5 | $6.000 | Taş yol, sahil toparlanır | +%8 (toplam +%16) |
| 3. Fenerli Bordür ve Çiçeklik | Seviye 8 | $16.000 | Bordür, sokak fenerleri, çiçekler | +%9 (toplam +%25) |

- Seviye yetmezse kart kilitli görünür ("🔒 Seviye 3 gerekli"), para yetmezse alınmaz.
- Seviye atlama şeridinde yeni açılan kademe yazar (ör. "Çakıl Yol (satın alınır)").
- Menü › LİMAN'da "Çevre yatırımı 1/3 • +%8 müşteri" satırı ve sıradaki kademe görünür.
- Eski kayıtlar görünümünü kaybetmez: kayıtta bu alan yoksa o anki kademe korunur.

---

## v1.1 — 50 özel müşteri, düzenlenebilir karakter dosyası

Özel müşteriler artık ayrı bir dosyada: **`specials.js`**. Kod bilmeden düzenlenir; dosyanın başında her alanın
açıklaması var. Yeni kişi eklemek = listeye bir blok eklemek. Hatalı ya da eksik satır oyunu bozmaz: eksik alan
varsayılanla dolar, `id`/`n` olmayan satır atlanır. Dosyadan silinen biri kayıtlı oyunda "bugünün müşterisi" olarak
kalmışsa oyun yenisini seçer.

**Havuz: 50 kişi.** Ünlü parodilerinin isimleri bilerek değiştirildi; hepsi kurgusal karakterdir.

| Grup | Kişiler |
|---|---|
| Mahallenin tanıdıkları (10) | Caner, Pelin, Rıza, Nermin, Kemal, Şule, Okan, Fatoş, Burak, Ayfer |
| Yerli ünlü parodileri (17) | Tarkut (pop megastarı), Cemal Gırgır (stand-up), Saf Şükrü (bekçi), Barlas Mançı (rock ozanı), İbo Tatlıdil (türkücü), Ayda Pekkaya (diva), Adnan Ilıcak (TV yapımcısı), Nasır Hoca (göl mayalayıcı), Fahri Tezim (teknik direktör), Müslüm Dertli (arabesk), Nazik Mürsel (sanat güneşi), Çüneyt Kırkın (aksiyon yıldızı), Hülya Avcı (talk show), Haluk Lüvent (yardımsever rockçı), ÇZN Berk (sosyal medya aşçısı), Tuz Baba (şov kasabı), Temel (Karadenizli fıkra kahramanı) |
| Yabancı ünlü parodileri (17) | Gordon Ramsi (öfkeli şef), Elvin Presli, Ferdi Merkür, Bay Fasulye, Şerlok Holmez, Şınap Dok, Kaya Conson, Arnavut Şvarzenkol, Teylan Sivri, Opra Hanım, Mikail Ceksın, Bob Rost, Jami Olivar, Deyvid Atınbara, Çak Norıs, Leydi Gıgı, Ed Şırın |
| Komik meslekler (6) | Mahmut (martı terbiyecisi), Sabri (profesyonel sıra bekleyici), Bedia Abla (balık pulu falcısı), Tek Göz Recep (emekli korsan), Mırıl Bey (kedi sendikası başkanı), Selfi Selin (fenomen) |

**Her karakterin oyuna etkisi olan özellikleri** (hepsi isteğe bağlı):
`qty` sipariş adedi · `pat` sabır · `tip` ödeme çarpanı · `rep` itibar · `fx` başının üstünde uçuşan işaret (♪ ♥ ✦ ! ? $ ~) ·
`moon` geri geri yürür (Mikail Ceksın) · `dance` kuyrukta dans eder. Örnekler: Sabri 420 sn bekler, Opra Hanım 10–14 balık
ısmarlar, Çak Norıs 2× öder ama 75 sn'den fazla beklemez, Gordon Ramsi "ÇİĞ!" diye bağırır ama beğenirse 1.8× öder.

**Yeni görünüş parçaları:** güneş gözlüğü, göz bandı, pipo, silindir şapka, kavuk, alın bandı, kravat, papyon, pelerin,
balık pulu desenli elbise, altın kolye, mikrofon, telefon, sırtta gitar, omuzda kuş (martı/papağan), mohikan ve kabarık perçem saç.

**Menü › ALBÜM:** tanıştığın özel müşteriler; meslekleri, huyları ve sevdikleri balıkla (ör. 12/50).

---

## v1.0 — Cila, yeni isimler, canlı site ve oyuncu takibi

### İsimler netleşti
| Yer | Eski ad | Yeni ad |
|---|---|---|
| Liman Meydanı'ndaki toptan alış-satış binası | Toptancı Hali | **Balık Hali** |
| PROJE sekmesindeki büyük kapalı çarşı projesi | Kapalı Balık Hali | **Kapalı Pazar** |
| BİNA sekmesindeki hizmet binası | Balık Hali | **Toptancı Hanı** |

### Açılacak bölgeler eski püskü eşyayla dolu
Kilitli bölgelerde (Balık Pazarı, Fümehane) çürük kasalar, kırık tahtalar, paslı varil, yırtık ağ, eski lastik,
ters dönmüş sandal, halat yığını, paslı çapa ve tekerleği kırık el arabası durur (her bölgede sabit tohumla 13 parça).
Bölgeyi satın alınca hepsi toz bulutuyla temizlenir. Meydandaki henüz yapılmamış parsellerde de küçük bir hurda yığını
"burası boş, yapılabilir" hissi verir.

### Hata avı ve cila
- **Dar telefonlarda üst şerit taşıyordu:** 360 px genişlikte ☰ menü düğmesi ekranın dışına düşüyor, GÜN kutusu
  kesiliyordu. ≤420 px için sıkı yerleşim eklendi; ☰ artık her ekranda görünür.
- **Hedef bandı kesiliyordu** ("Sandığın üstünden geç, balıkla…") → dar ekranda iki satıra kırılır.
- **Skor tablosu satırları** uzun olunca kesiliyordu → alt satır kırılır, süre görünür.
- 7 günlük otomatik dayanıklılık testi (tüm bölgeler açık, tam otomasyon, pazar günü, özel müşteriler, günün
  ortasında dil değişimi): hiç hata yok; para/itibar/konumlarda NaN veya eksi değer yok.

### Oyuncu takibi (kim, hangi isimle, ne kadar oynadı)
Skor tablosu artık her satırda **işletme adı + karakter adı + gün + para + ⏱ oyun süresi** gösterir; altta
`👥 oyuncu • 🎮 oyun • ⏱ toplam saat`. Sahibi olarak Supabase *SQL Editor*'de şunu çalıştır:

```sql
select * from bt_oyuncular;   -- oyuncu, karakter, işletme, oyun sayısı, toplam saat, en iyi balık, en uzun gün, açılış, son görülme
```

Bu görünüm **yalnız proje sahibine** açıktır (anon anahtarla `permission denied`). Kişisel veri tutulmaz: rastgele
cihaz kimliği + oyuncunun kendi yazdığı karakter/işletme adı.

---

## v0.9 — Özel isimli müşteriler

Yeni ekonomi/sipariş mekaniği **yok**: özel müşteriler normal sipariş verir, normal öder; tezgâh sistemine karakter ve yaşam hissi katarlar.

**Günlük düzen (her gün 2 kişi):**
normal müşteriler → **1. özel müşteri** (günün ilk 3 normal müşterisinden sonra, normal kuyruğun içinde) → normal akış →
kapanışa ~40 sn kala kısa bildirim **"Özel bir müşteri geliyor..."** (oyunu durdurmaz) → **2. özel müşteri** kendi tezgâhına yürür →
işi bitince kapanış normal devam eder (servis edilemezse kapanış en fazla CLOSE_MAX+30 sn bekler).
Her gün iki farklı kişi seçilir, dünküler ertesi gün tekrar gelmez. Gün sonu kartında **"⭐ Özel müşteriler: …"**.

**Karakterler (havuz 50'ye göre kurulu; şu an 10 tanımlı):**
Caner (Kaliteci — uzun boy + belirgin göbek, kedi sever) · Pelin (Biyolog — turuncu gür kıvırcık saç, ince) ·
Rıza (Tesisat ustası — kasket, kalın bıyık, hafif göbek) · Nermin (Emekli öğretmen — kısa, tombul, büyük çanta) ·
Kemal (Lokanta işletmecisi — uzun, ince, not defteri) · Şule (Terzi — topuz, uzun etek) · Okan (Kurye — atletik, omuz çantası) ·
Fatoş (Ev aşçısı — renkli eşarp) · Burak (Bankacı — hafif sakal, ceket) · Ayfer (Eczacı — kısa kıvırcık saç, gözlük).

- Her birinin kendi balığı var (ör. Pelin → levrek); o tezgâh açık değilse açık olana gider.
- Başının üstünde **★ İsim · Meslek** etiketi; gelince selam, mutlu giderken teşekkür cümlesi (TR/EN).
- Karakter çizimine yeni bedenler eklendi: uzun/kısa boy, göbek, gür kıvırcık saç, topuz, uzun etek, not defteri, büyük çanta, kalın bıyık, desenli eşarp.
- Tanışılan özel müşteriler kayda yazılır (`met`) — ileride "müşteri defteri" için.
- Yeni kişi eklemek: `SPECIALS` dizisine bir satır.
- **Test:** `test-specials.js`. Etiketler artık ekran kenarından taşmıyor.

---

## v0.8 — Otomatik kayıt + gelişen çevre

### 💾 Otomatik kayıt
- Oyun başlarken (yeni oyunda işletme adından sonra; eski kayıtta ayar yoksa bir kez) sorulur: **5 dk / 10 dk (önerilen) / 30 dk**.
- Seçilen aralıkta (oynanan süre) kaydeder, sağ üstte kısa **"💾 Otomatik kaydedildi"** rozeti.
- Ayarlar › **OTOMATİK KAYIT** ile değiştirilir; kayıt bölümünde "sonraki kayıt m:ss" görünür. Seçim slot kaydına yazılır.
- Eski 6 saniyelik sessiz kayıt kalktı. Güvenlik için sekme kapanınca/arka plana geçince, gün sonunda ve Kaydet/Kaydet-Çık'ta yine kaydedilir.

### 🌿 Gelişen çevre (tezgâh alanı dışı) — *v1.2'den itibaren kademeler satın alınır, yukarıdaki v1.2 bölümüne bakın*
- Meydanı eklerken boşalan çevre sade biçimde geri geldi (~43 nesne): meydanın güneyi (yolun doğusu) ve güney kumsal. Tezgâh bölgelerine, yola ve meydana girmez.
- Başta **eski/bakımsız**: kuru ağaçlar, sararmış serviler, yırtık ağlar, çürük ters sandallar, kırık kasalar, paslı variller, hurda yığınları; müşteri yolu **toprak, tekerlek izli, çukurlu**.
- **Çevre kademesi (0–3)** bölgeler, meydan binaları, ofis ve itibar seviyesiyle artar; her nesne kendi eşiğinde bakımlı hâline döner, hurdalar **çiçek tarhı** olur.
  Yol: toprak → çakıl → arnavut kaldırımı + bordür → yol boyu fenerler. Her kademede kısa bildirim (🌿 / 🪨 / 🌺).
- **Test:** `test-autosave.js`, `test-env.js`; tüm önceki testler yeşil.

---

## v0.7 — Faz 3: Liman Meydanı

Yönetim binaları **tezgâh bölgelerinin dışında**: müşteri yolunun doğusunda ayrı bir **Liman Meydanı**.
1. bölgeye **ahşap yaya köprüsüyle** bağlı (köprü kuyrukların kuzeyinden geçer, müşteriyle kesişmez).
Çalışanlar bölge ↔ meydan arasında köprüden rota bulur (`routeVia`). Binalar YAPI › **🏛️ Meydan** sekmesinden kurulur.

| Bina | Nasıl çalışır |
|---|---|
| 🏚️ **Personel Kulübesi** (Sv1–5) | Her seviye **her bölgeye +1 personel yeri**. Kapısında **👷 PERSONEL** düğmesi. Eski parsel kulübesi otomatik Sv1'e dönüşür. |
| 📦 **Depo** (Sv1–4, 30→160 raf) | Fazla fileto/füme **türüne göre raflarda** (karışmaz). Oyuncu kapıda durunca elindeki malı rafa koyar. Kendi personeli (sınır = depo seviyesi): |
| · Depo Hamalı | Tezgâhı dolu ürünün fazlasını hasırdan depoya taşır; stoğu azalan tezgâhı depodan besler (taşıyabildiği kadar yükler). |
| · Sevkiyatçı | Kabul edilen kontratın ürününü depodan alıp **Ticaret Merkezi**'ne teslim eder. |
| 🏛️ **Ticaret Merkezi** | Eski Ticaret Ofisi meydana taşındı; yürüyerek gidilir (kuruluş yine PROJE sekmesinden). |
| 🏪 **Balık Hali** | Depodaki malı **günün fiyatıyla** sat (%85 ± dalgalanma) ya da toptan al (%130 ± dalgalanma). Fiyatlar her gün değişir (▲▼). Kapısında düğme. |

Eski parsel binası "Depo Kulübesi" isim karışmasın diye **Soğuk Sandık** oldu (etkisi aynı).
**Test:** `test-faz3.js` — köprüden yürüme, bina kurma, depoya koyma, 3. bölgeden köprüyle tezgâh besleme (12 sn),
fazlanın depoya taşınması, sevkiyatçının kontrat teslimi (11 sn), hal al/sat, kayıt ve eski kulübe göçü. Tüm önceki testler yeşil.

---

## v0.6 — Oyun içi müzik + çöp kovası

- **Müzik oyunda da sürer:** menüde tam düzenleme; oyuna girince aynı "İskele Türküsü" arkadan **mırıldanır**
  (yumuşak sinüs melodi + alçak oktav, seyrek bas, davul yok, düşük ses). Menüye dönünce tekrar tam çalar.
  Ayarlar › **MÜZİK: ♪ AÇIK / KAPALI** (tercih kaydedilir).
- **Çöp kovası (her bölgede bir tane):** tezgâh/kuyruk doluyken ya da yanlış ürünle elin dolu kaldığında
  kovanın önünde kısa bir an **dur** → taşıdığın mallar atılır. Para asla atılmaz. Yanından geçmek ya da
  tezgâhın önünde durmak kovayı tetiklemez. Tezgâh malını almıyorsa oyun kovayı hatırlatır.
- **Test:** `test-trash.js` (kova boşaltma, parayı korur, geçerken/tezgâh önünde tetiklenmez, istasyonlara mesafe, müzik kipi ve ayarı).

---

## v0.5 — Faz 2: otomasyon ve kimlik

| Geri bildirim | Ne yapıldı |
|---|---|
| Karakter oluşturma (#8) | Yeni oyun: slot → (hikâye) → **Karakter** → işletme adı. Ad + saç modeli (kısa, dalgalı, uzun, at kuyruğu, kel), saç rengi, ten, başlık (kasket, yazma, balıkçı beresi), bıyık/sakal, kazak, önlük. Canlı pixel önizleme; oyuncu oyunda bu görünümle çizilir, kayda yazılır. |
| Tezgâh kasası (#9) | Müşteri parası tezgâhın bakır kasasına düşer. **Oyuncu kasanın yanından geçince para anında hesaba geçer** — merkeze dönmek yok, para taşıma kapasitesini doldurmaz. |
| Parayı personel taşısın (#6) | **Tahsildar** (eski kasiyer) artık **bölge personeli**: yalnız kendi bölgesinin tezgâh kasalarını boşaltır, parayı **Ana Kasa**'ya yürüyerek götürür. |
| Kasa kapasitesi | Kasa dolunca o tezgâhta **KASA DOLU** yanıp söner, yeni müşteri gelmez → tahsildar ya da oyuncu boşaltmalı. Kapasite bölge seviyesiyle artar. |
| Her tezgâhta ayrı çalışan (#2) | Tezgâhtar bir **tezgâha atanır** (en az tezgâhtarı olan), önce kendi tezgâhını besler; personel sekmesinde "Hamsi tezgâhı" gibi görünür. |
| Personele devret (#2, #6) | Bölgede 4 rolün hepsi varsa (Hamal, Filetocu, Tezgâhtar, Tahsildar) YÜKSELT'te **⚙ DEVRET**: oyuncu o bölgede istasyonlara karışmaz, ekip **%20 hızlı** çalışır, tezgâhta **⚙ OTOMATİK** rozeti; **↩ GERİ AL** ile geri alınır. Eksikse kart eksik rolleri ✓/✗ ile gösterir. |

**Denge:** bölge kadrosu taban 2 (+ bölge seviyesi, + ek tezgâh, + kulübe). Tam otomasyon (4 kişi) Sv3 bölgede ya da kulübeyle.
**Uyumluluk:** eski kayıtlardaki liman geneli kasiyer, açık bir bölgeye tahsildar olarak yerleşir.
**Test:** `test-faz2.js` — devredilen bölge, oyuncu dokunmadan 40 sn'de satış yaptı; önceki tüm testler yeşil.

---

## v0.4 — 3 kayıt slotu, "Kaydet ve Çık" ve "Yeni Oyun" düzeltmeleri

### Kök nedenler (claude.ai'deki kısıtlı iframe'de yeniden üretildi)
1. **"Yeni Oyun" hiçbir şey yapmıyordu:** onay için tarayıcının `confirm()` penceresi kullanılıyordu; kısıtlı
   iframe'de (`allow-modals` yok) tarayıcı bu çağrıyı **sessizce yok sayıyor** → her zaman "hayır".
   Ayrıca yeni oyun sayfayı yenileyip `sessionStorage` bayrağına güveniyordu; bu da kısıtlı ortamda güvenilir değil.
2. **"Kaydet ve Çık" kaydı kaybediyordu:** depolamaya izin verilmeyen ortamda kayıt sessizce yazılamıyor,
   menüye dönünce "Devam Et" kayboluyordu.

### Çözüm
- **3 kayıt slotu.** Menü: `▶ DEVAM ET` (son slot) · `YENİ OYUN` · `📂 KAYITLI OYUNLAR`. Slot kartında işletme adı, gün, balık, para, son kayıt.
  Boş slota yeni oyun; dolu slota **"↺ Üzerine yeni oyun"** (onaylı); kayıtlı oyunlarda **▶ Oyna / 🗑 Sil**.
- **Oyun içi onay penceresi** (`confirm()` yok) — her ortamda çalışır.
- **Sayfa yenilenmez:** yeni oyun ve slot değiştirme `resetWorld()` ile açılıştaki temiz dünyaya döner.
- **Depolama yedeği:** tarayıcı izin vermezse kayıt oturum hafızasında tutulur (Kaydet ve Çık → Devam çalışır) ve menüde uyarı çıkar.
- Eski tek kayıt ilk açılışta otomatik **Slot 1**'e taşınır. Ayarlar › **🗑 Bu slotu sil**; isim ekranında **← Geri**.
- **Test:** `test-slots.js` aynı senaryoyu 3 ortamda koşar (normal sayfa, `test-sandbox.html` = claude.ai gibi kısıtlı iframe,
  `test-sandbox-nostore.html` = depolamasız) + eski kayıt göçü.

---

## v0.3 — Faz 1: hissiyat ve netlik

Oyuncu geri bildirimleri 3 faza bölündü: ayrıntılar **`FAZ_PLANI.md`** (analiz, fikirler, depo tasarımı).

| Geri bildirim | Ne yapıldı |
|---|---|
| Açılış müziği | **"İskele Türküsü"** — kendi bestemiz (re minör, 132 BPM, 16 ölçü). Dosya yok, Web Audio chiptune → telif yok. Hikâye + menüde çalar, oyuna girince susar. |
| İtibar = seviye | **10 seviye** (Çırak Balıkçı → Karadeniz Efsanesi), eşikler mevcut kilitlere hizalı. HUD'da `SV N`. Seviye başına **+%2 satış primi**. |
| Level up bildirimi | Oyunu **durdurmayan** üst şerit: seviye + unvan + açılanlar, fanfar, konfeti, 3.6 sn. |
| Seviye ↔ açılımlar | Reklam Panosu Sv3, Ek Tezgâh Sv4, Ağ Vinci Sv5, VIP Sv5, Çeşme Sv5, Heykel Sv6, Fener Sv7; kilitli kartta `🔒 Seviye N gerekli`. |
| Yapı alt kategorileri | YAPI: **Dekoratif · Geliştirmeler · Yapı Yükseltmeleri** (bölge seviyeleri buraya taşındı). |
| Hareket ikonu | Belirgin pixel joystick (halka + altın topuz + yön oku); yürürken ayakta yön oku (klavyede de). |
| Kontrol eğitimi | İlk açılışta: *sürükle/WASD → yürü*, ardından *durman yeter, karakter kendiliğinden alır/bırakır*. |
| Süsler tezgâh dışında | 12 süs batı kıyı şeridine, iskele önü suya ve güney kumsala taşındı; en yakın işlevsel nesneye ≥1.5 kare (`decorClearance()`). |
| Gün sonu müşteri değişimi | Kapanışta kalanlar selamlaşıp ayrılır (kayıp sayılmaz); her gün **"Günün müşterisi"** öne çıkar. |

Zaten var olanlar doğrulandı: kesim tezgâhı bölgeye özel (v2.2), füme yalnız son bölgede.
**Test:** `test-faz1.js` (müzik, eğitim, seviye, alt sekmeler, süs mesafesi, gün sonu) + önceki tüm testler.

---

## 🌍 Herkese açık skor tablosu + oyuncu sayacı (kurulum)

Oyun, `config.js` doluysa skorları **Supabase**'e gönderir; boşsa (veya bağlantı yoksa) tablo cihaz içi çalışır.

1. **supabase.com** › ücretsiz hesap › *New project*
2. *SQL Editor* › `online/schema.sql` dosyasının tamamını yapıştır › **Run**
3. *Project Settings › API*: **Project URL** ve **anon public** anahtarını `config.js`'e yaz
   (anon anahtarın tarayıcıda görünmesi normaldir: tablolara doğrudan yazma kapalı, yalnız doğrulayan fonksiyonlar açık)
4. GitHub › *Settings › Pages › Source: GitHub Actions* — `main`'e her push'ta
   `.github/workflows/balikci-pages.yml` oyunu **https://recaikas.github.io/okult-kahin-byblbn/** adresine yayınlar
5. `config.js` değişikliğini `main`'e gönder; site 1–2 dk içinde güncellenir. Linki paylaş, oyuncular oynadıkça
   `select * from bt_oyuncular;` ile kimin ne kadar oynadığını gör.

> Şema dosyası tekrar çalıştırılabilir (idempotent): eski sürümü kurduysan v1.0'ı aynen yapıştırıp **Run** de,
> `hero` sütunu ve `bt_oyuncular` görünümü eklenir, mevcut skorlar korunur.

**Tutulanlar:** skor (`bt_scores`: işletme adı, karakter adı, balık, para, gün, oyun süresi) ve her oyun açılışı (`bt_plays`: anonim oyuncu kimliği, dil).
Tabloda `👥 N oyuncu • 🎮 M oyun • ⏱ S saat` görünür. Ayrıntı için `schema.sql` sonundaki hazır sorgular (günlük oyuncu sayısı, uygunsuz isim silme).

**Hile/spam koruması (sunucuda):** isim 2–24 karakter + HTML temizliği • skor oyun süresine göre makul olmalı • skor geriye gitmez •
başkasının kaydına yazılamaz • 8 sn'den sık gönderim ve saatte 20'den fazla yeni kayıt reddedilir. Anon anahtarla tablolara doğrudan
ekleme/güncelleme/oyun kayıtlarını okuma `permission denied` döner (PostgreSQL 16'da `anon` rolüyle test edildi).

---

## v0.2 — Gazete hikâyesi, işletme adı, skor tablosu

### Açılış akışı
**İlk açılış (kayıt yok):** gazete hikâyesi → ana menü → **YENİ OYUN** → işletme adı → oyun
**Kayıtlı oyun:** ana menü → **▶ DEVAM ET** (hikâye menüdeki **📰 HİKÂYE** ile tekrar izlenir)
**Yeni Oyun (kayıt varken):** onay → kayıt silinir → hikâye → doğrudan işletme adı

### 📰 Pixel gazete hikâyesi
- Masa üstüne dönerek düşen **LİMAN GAZETESİ** (EN: HARBOR GAZETTE), 5 sayı, 1974 → "YARIN"
- Her sayfada animasyonlu pixel çizim: sessiz iskele (gece) • hamsi sürüsü • belediye ilanı • şafakta genç balıkçı • hayal limanı (sepyadan renge döner)
- Altta daktilo efektli alt yazı; dokun = yazıyı tamamla / sonraki sayfa, **ATLA ▶▶**, Space/Enter/Esc
- Yazılar tarayıcı fontuyla değil, **elle çizilmiş 5×7 bitmap yazı tipiyle** (İ Ö Ü Ğ Ç Ş Â dahil) basılır — küçük boyda Pixelify eşiklenince G→B, Ç→Q oluyordu
- İlk ekran "BAŞLAMAK İÇİN DOKUN": tarayıcı ses iznini buradan alır; TR/EN seçilebilir

### 🪧 İşletme adı
- Rastgele öneri: *Hasan Balıkçılık, Özcan Mutfak, Ayşe'nin Balık Evi, Yakamoz Balık Evi…* (Türkçe ek uyumu: Hasan'ın / Ayşe'nin / Dursun'un)
- 🎲 yeni öneri, 4 hazır öneri çipi, kendi adını yazabilirsin (2–24 karakter, HTML temizlenir)
- Tabela önizlemesi; ad kayda (`company`) yazılır. Adı olmayan eski kayıtlar **DEVAM ET**'te bir kez ad sorar.

### 🏆 Skor tablosu
- **Skor = ağlardan çıkan toplam balık** (`S.caught`). Harcamayla düşmez, parayla şişirilemez.
- Tabloda ikincil bilgi: kasaya giren toplam para (`S.earned` — satış, mezat, binalar, kontrat, temettü, işletme geliri; iade ve hisse satışı hariç).
- Otomatik gönderim: her kayıtta (6 sn), gün sonunda, kaydet/çık'ta. Gün sonu kartında `N balık • N. sıra`.
- İlk 20 + kendi sıran (altındaysan ayrıca gösterilir), 1-2-3 madalya rengi, **SEN** etiketi.
- Ana menüde **🏆 SKOR**, oyun içi menüde **🏆 SKOR TABLOSU**.
- Tablo kayıttan ayrı anahtarda (`balikci_board_v2`; v1 para bazlıydı, birimler karışmasın diye ayrıldı): Yeni Oyun kaydı siler, tabloyu silmez.
- Depolama tek arayüzden geçer (`Board.fetch` / `Board.submit`). **Şu an cihaz içi** — paylaşımlı (herkesin göreceği) tabloya geçerken yalnız bu nesne değişir.

### Hata düzeltmeleri
- **"Yeni Oyun" / "Kaydı sıfırla" aslında sıfırlamıyordu:** kayıt silinip sayfa yenilenirken `beforeunload` eski durumu geri yazıyordu. Artık silme sırasında kayıt yazılmıyor.
- Hiç başlanmamış oyun artık kayıt oluşturmuyor (menüde bekleyip kapatmak "DEVAM ET" gösteriyordu). Dil/ses/zoom ayrı tercih anahtarında (`balikci_pref`).
- Yazı kutusuna yazarken oyun tuşları (WASD, boşluk) devreye girmiyor.

### Test
`test-fresh-start.js` ve `test-world-render.js` yeni akışa (hikâye → menü → ad) göre güncellendi.

---

## v0.1 — İlk oynanabilir sürüm (cila + hata avı)

Oyun bu sürümde "denenebilir" sayılıyor: baştan sona oynanıyor, ses çalışıyor, bilinen hata yok.

### 🔴 Kritik hata: yeni oyun oynanamıyordu
`openStarterStall()` yalnızca **kayıt yüklenirken** çağrılıyordu. Hiç kaydı olmayan yepyeni bir oyunda `load()` erkenden çıkıyor, dolayısıyla başlangıç hamsi tezgâhı **kapalı** kalıyordu → hamsi satılamıyor → `spotLines()` boş dönüyor → **ağ hiç balık üretmiyordu.** Oyun ilk açılışta tamamen oynanamazdı.

Testlerde yakalanmamasının sebebi: `localStorage.clear()` + `reload` akışında `beforeunload` yeni bir kayıt yazıyor, bu yüzden testler hep "kayıtlı oyun" yolundan geçiyordu.

**Düzeltme:** `openStarterStall()` artık `rebuildCounters()` içinde, yani tezgâhlar her kurulduğunda çağrılıyor. Ayrıca güvenlik ağı: hiçbir tezgâh açık değilse ilki kendiliğinden açılır.
**Kalıcı test:** `test-fresh-start.js` — temiz tarayıcı profiliyle açar, 16 saniye bekler, ağda balık yoksa başarısız olur.

### Tezgâh açmayı bulunur kıldık
Anahtarın nerede olduğu belli değildi. Artık:
- Yeni bir tezgâh kullanılabilir olur olmaz **AÇIK TEZGÂHLAR ekranı kendiliğinden açılır** (gün sonunu beklemez)
- Alt bar › YÜKSELT'te **ilk kart** o ve kararsız tezgâh varsa `• 1 yeni tezgâh kararını bekliyor` yazar
- Kapalı tezgâhın yanına gidince üstünde `YÜKSELT › AÇIK TEZGÂHLAR` yönlendirmesi çıkar
- Öğretici bittikten sonra hedef bandında kalıcı ipucu durur

### Ses motoru baştan yazıldı
Eski ses sistemi teknik olarak çalışıyordu ama **duyulmuyordu**: master gain yoktu ve efekt seviyesi 0.025'ti.

- Tek **master gain** + **3 kademeli ses**: 🔇 kapalı / 🔉 kısık / 🔊 açık (eskiden sadece aç-kapa)
- Her dokunuş, tuş ve sekmeye dönüşte `AudioContext` açılır ve `resume` edilir — iOS/Safari ve mobil Chrome'un otomatik oynatma kilidi için
- **Zarf (attack/decay)** eklendi: tık sesi yok; kare dalgalar alçak geçiren filtreden geçiyor
- **16 efekt**: balık sıçraması, satır darbesi, para, satın alma, inşaat, itibar fanfarı, müşteri gelişi, tezgâh anahtarı, gün başı/sonu motifi, mezat çanı, pazar günü açılışı…
- Tam seste çok hafif **liman ortam sesi**: kıyıya vuran dalga ve uzakta martı

### Adalet: umutsuz müşteri yok
Eskiden stoksuz bir tezgâha müşteri yağıyor ve kesin kaybediliyordu. Artık:
- Stoksuz tezgâha müşteri **3,2 kat seyrek** gelir
- Kuyruk uzadıkça o tezgâha akış daha da yavaşlar
- Liman genelinde servis edilemeyen talep birikmişse akış genel olarak damperlenir

**Ölçüm:** tam açık limanda kayıp oranı **%27 → %15**, ekranda aynı anda bekleyen müşteri **31 → 13**.

### Görsel yumuşatma
- **Vinyet**: ekran kenarları hafifçe koyulaşır, merkez öne çıkar
- **İki katmanlı gölge**: sert elmas gölge yerine soluk dış halka + koyu çekirdek
- **Deniz** 4 bant yerine **7 bant** — basamaklar yumuşadı
- **Kıyı geçişi**: ıslak kum bandı + nefes alan köpük şeridi
- **Arayüz**: saf siyah 3px kenarlar yerine 2px lacivert + üstte açık kenar, panellerde dikey gradyan, butonlarda basılma hissi ve gölge, toast yumuşak geçişle giriyor

### Diğer düzeltmeler
- **Sekme arkadayken oyun duraklıyor** — telefonda başka uygulamaya geçince müşteri kaybetmiyorsun
- Geri dönüşte biriken dev `dt` sıçraması engellendi
- Ses seviyesi kayda yazılıyor (3 kademe)

### Doğrulama
| Test | Sonuç |
|---|---|
| **Sıfırdan yeni oyun** (`test-fresh-start.js`) | tezgâh açık, 16 sn'de ağda 12 balık, müşteri geliyor |
| 80 sn ağır oynanış (10 çalışan, 6 hat, 4 gün) | konsol hatası **0**, NaN **0**, 60 FPS |
| Yanlış masadaki balık / yanlış tezgâhtaki ürün | **0 / 0** |
| Kapalı tezgâhta bekleyen müşteri | **0** |
| Tüm ekranlar iki dilde tıklama turu | sorun **yok** |
| 223 i18n anahtarı TR+EN | eksik **yok** |
| Ses: 16 efekt, 3 kademe | master gain 0 / 0,21 / 0,50 |

---

## v2.3 — Bölge sistemi, oyuncunun açtığı tezgâhlar, deponun kaldırılması

Bu sürüm üç somut oynanış şikâyetini çözüyor.

### 1. Kesim masaları bölgeye bağlandı

Eskiden hamal bütün limanı dolaşıp karışık balığı en yakın masaya bırakıyordu; masalar karışıyordu. Artık **bölge (zone)** kavramı var:

> **bölge = bir ağ + o ağın kesim masası + o ağdan çıkan türlerin tezgâhları**

Bölge indeksi = ağ indeksi = kesim masası indeksi = AREA indeksi. Bir masaya **yalnız kendi bölgesinin balığı** konulabilir (`tableAccepts`); hamsi ağının balığı uskumru masasına gitmez. Masanın etiketi hangi türleri kabul ettiğini yazıyor (`Kesim: Uskumru, Palamut`).

### 2. Her çalışan kendi bölgesinde

Çalışanlar artık bir bölgeye ait (`w.zone`). Hamal yalnız kendi ağından alır ve kendi masasına bırakır; filetocu kendi masasında durur; tezgâhtar yalnız kendi bölgesinin tepsisinden alıp kendi bölgesinin tezgâhlarına götürür. Boşta kalınca bölgesinde bekler, limanın öbür ucuna yürümez.

**Ölçülen etki:** aynı 30 saniyelik otomasyon testinde tamamlanan sipariş **3-4'ten 16'ya** çıktı, kayıp 0.

### 3. Personel artık sabit değil, bölge bazlı

Eski sabit "3 kişilik liman kadrosu" kalktı. Yerine (v2.2'de rafine edildi):

| | Kadro |
|---|---|
| Bölgede **açık olan her tezgâh** | **+1 kişi** |
| Bölge seviyesi başına | **+1** |
| O bölgedeki Personel Kulübesi | **+1** |
| Kasiyer | liman geneli, ayrı (1-3) |

Yani bir bölgeden kaç üretim hattı geçiyorsa o kadar kişi alabilirsin: Balık Pazarı'nda yalnız uskumru açıkken kadro 1, palamutu da açınca 2 olur. Personel kartı o bölgenin türlerini de yazar (*"Balık Pazarı personeli — Kadro 1/2 — Uskumru, Palamut"*).

Ayrıca hamal artık ağdan **tezgâhı en aç olan türü** alıyor (`neediestIndex`): bir bölgeden birden çok tür geçtiğinde kesim masası tek türle dolup diğer hattı aç bırakmıyor.

Alt bardaki **YÜKSELT** sekmesinde her açık bölge için bir kart var: *"Balıkçı İskelesi personeli — Kadro 1/2 — rol seç"* → Hamal / Filetocu / Tezgâhtar. Fiyat hem o bölgedeki kadro sayısına hem de bölge numarasına göre artıyor. Böylece yeni alan açmak gerçekten yeni otomasyon kapasitesi demek.

### 4. Tezgâh aç/kapat anahtarı (v2.3'te düzeltildi)

Eskiden ikinci bölgeyi açtığınız anda oradaki tezgâha müşteri gelmeye başlıyordu — oyuncu daha ilk tezgâha yetişemezken ikinci tezgâhta müşteri boşuna bekliyordu.

Çözüm bir **aç/kapat anahtarı** — satın alma değil, ücretsiz.

- **İlk tezgâh (hamsi) sabit açık**, kapatılamaz (`SABİT` yazar).
- **İkinci tezgâhtan itibaren** her tezgâhın `AÇIK / KAPALI` anahtarı var.
- Kapalı tezgâh: **müşteri gelmez, ağ o türü üretmez, çalışan oraya ürün taşımaz**. Dünyada kepengi inik, tentesi toplanmış, "KAPALI" levhalı çizilir. Kapattığınızda o an bekleyen müşteriler de dağılır.

**Nereden açılır — "AÇIK TEZGÂHLAR" ekranı:**

| Nereden | Ne zaman |
|---|---|
| **Gün sonu kartı** | Her gün kapanışında "AÇIK TEZGÂHLAR" butonu |
| **Gün başı** | Karar verilmemiş yeni bir tezgâh varsa kendiliğinden açılır |
| **Alt bar → YÜKSELT** | İstediğin an |

Ekran açıkken oyun duraklar. Yeni kurulmuş, henüz karar vermediğiniz tezgâhlar altın çerçeveyle işaretlenir.

### 5. Merkezi Depo kaldırıldı

Depo, dağıtım çalışanı, hedef stok ve öncelik sistemi tamamen çıkarıldı (şimdilik). Menüdeki DEPO sekmesi kalktı.

**Mezat Salonu korundu ama yeniden temellendirildi:** artık gün sonunda **tezgâha gitmemiş, hasır tepsilerde kalan işlenmiş ürünü** açık artırmayla satıyor. Bu hem daha gerçekçi (günün satılmayan avı mezata çıkar) hem de oyuncunun tezgâh stoğuna dokunmuyor.

**Balık Pazarı hazırlık ekranı** de sadeleşti: artık hedef stok düzenlemek yerine her açık tezgâhın stok doluluğunu gösteriyor.

### Kayıt uyumluluğu
Eski kayıtlar açılır: kaldırılmış `dagitim` çalışanı atlanır, bölgesi kayıtlı olmayan çalışan uygun bir bölgeye yerleşir, kadrosu dolmuş bölgeye kayıtlı çalışan boş bölgeye kaydırılır, depo ve hedef stok alanları yok sayılır. Açık tezgâhlar ve çalışan bölgeleri artık kaydediliyor.

---

## v2.0 — ANADOLU PIXEL ART: tüm oyunun görsel yeniden modellemesi

Oyunun her çizilen pikseli tek bir sanat yönergesine göre yeniden yazıldı.

### Stil rehberi (`PAL` + `ANIM`)
Tek merkezi palet ve tek animasyon zamanlaması var; hiçbir renk artık koda gömülü değil.

| Kural | Uygulama |
|---|---|
| Palet | Kireç badana, kagir taş, alaturka kiremit, kilim renkleri (kök boya, çivit, safran, krem), Kütahya çinisi mavisi, servi yeşili |
| Işık | Sol üstten; sol yüz açık, sağ yüz koyu, 3 tonlu gölgeleme |
| Kenar | Her nesnenin koyu taban konturu var, dithering yok |
| Motif | Kilim geometrisi: baklava, çengel, göz |
| Animasyon | 2 veya 4 kare, 6-8 fps hissi (`phase2` / `phase4`) |

### Karakterler ve animasyonlar
- **Gerçek 4 kareli yürüme döngüsü** (temas-geçiş-temas-geçiş): bacak/kol salınımı, gövde inip kalkması. Önceki 2 kareli zıplamanın yerini aldı.
- **Oyuncu:** Karadenizli balıkçı — lacivert yün kazak (baklava desenli), muşamba önlük, kasket, lastik çizme, bıyık. Taşırken kollar öne gelir, iş yaparken öne eğilir.
- **Çalışanlar rolüne göre giyinir:** hamal sırt küfesiyle, filetocu beyaz önlük ve bıçakla, tezgâhtar tepsiyle, kasiyer gözlük ve yelekle, dağıtımcı küfeyle. Başlarının üstünde küçük pixel rol rozeti var (taşıdıkça yükselir).
- **Müşteriler Anadolu tipolojisi:** işçi (kasket), aile (başörtüsü), esnaf (yelek + kuşak), şef (aşçı kepi), kaptan (denizci kasketi + sakal), VIP (altın kuşak), toptancı (yeşil önlük), turist (hasır şapka + fotoğraf makinesi).
- **Müşteri tepkileri:** beklerken kıpırdanır ve etrafa bakınır (sabırsızlaştıkça hızlanır), sabır azalınca kum saati, bitmek üzereyken öfke balonu çıkar, memnun ayrılırsa kalp, kaçarsa öfke. Ağız ifadesi ruh haline göre değişir.
- **Sipariş tabelası** kilim çerçeveli, üstünde sabır çubuğu.

### İstasyonlar
Ağ noktasında dönen **ağ makarası**, sarılı halat, suya uzanan ağ ve mantar şamandıralar. Kesim masasında **mermer tezgâh**, zeytin kütüğü, inip kalkan satır, asılı bıçak rafı, hasır tepsi. Fümehanede **kagir ocak**, taş örgü dokusu, yanan ateş, teneke baca, kiremit şapka ve ipte sallanan füme balıklar. Pazar tezgâhında **kırmızı-beyaz çizgili tente** (saçağı rüzgârda oynar), **buz yatağı**, **kilim eteği** (baklava motifli), pirinç **terazi**, tebeşirli fiyat tabelası ve bakır sini.

### Bina evrimi — gerçek Anadolu liman mimarisi
| Seviye | Mimari |
|---|---|
| Lv.1 | Ahşap baraka, dikey tahta kaplama, çinko oluklu sac çatı |
| Lv.2 | Boyalı ahşap, ahşap direkli sundurma, kepenkli pencereler |
| Lv.3 | **Kagir taş duvar** (taş örgü dokusu), **alaturka kiremit çatı** |
| Lv.4 | **Cumbalı ikinci kat** (öne taşan), dövme demir korkuluk, ışıklı pencereler |
| Lv.5 | **Kemerli kapı**, **Kütahya çini kuşağı**, tabela, çatıda Türk bayrağı |

Her binanın kendi kimlik rengi saçakta bir şerit olarak görünür ve kendi propları var: buzhanede buz kalıpları ve soğutma ünitesi, tamirhanede el vinci ve yedek parça rafı, halde tenteli tezgâh sırası, restoranda masalar ve teras ampulleri, nakliyede konteyner ve araç rampası, yakıtta variller ve tanklar, tersanede kızak, vinç ve tekne iskeleti.

### Gerçek hayattaki Türk balıkçı barınağından eklenenler
Gerçek bir balıkçı barınağının kurumları araştırılıp oyuna eklendi:

| Yeni yapı | Gerçekte ne işe yarar | Oyundaki etkisi |
|---|---|---|
| 🤝 **Su Ürünleri Kooperatifi** | Balıkçıların ortak örgütü; giderleri paylaşır, taban fiyat sağlar | Maaş gideri −%6→−%28, ürün değeri +%12, itibar kazancı +%50, +1 kontrat |
| 🔔 **Mezat Salonu** | Kabzımal mezatı: günün avı açık artırmayla satılır | Gün sonunda depo fazlası otomatik satılır (6→36 ürün, %55→%120 fiyat) |
| 🕸️ **Ağ Tamir Sahası** | Yamalı ağ daha çok tutar | Bölge ağı +%18 |
| ⚖️ **Kantar** | Doğru tartı, hak edilen fiyat | Ürün değeri +%6 |
| ⛵ **Çekek Yeri** | Tekneler bakım için karaya çekilir | Müşteri akışı +%22 |
| 🗼 **Mendirek Feneri** | Barınağın ağzındaki fener | Prestij süsü, geceleri döner ışık |

Ayrıca **nazar boncuğu**, **Osmanlı çeşmesi** (akan su animasyonlu) ve **kilim sergisi** süsleri eklendi.

### Çevre ve atmosfer
Servi ve zeytin ağaçları ayrıştı, kıyıya çekilmiş sandallar, kurumaya asılı ağlar, hasır sepet yığınları eklendi. **Liman kedileri** limanda dolaşıyor, oturuyor ve uyuyor (uyurken 💤 çıkıyor). Martılar 4 kareli kanat çırpıyor. Denizde güneş parıltısı ve kıyı köpüğü var. Tekneler suda sallanıyor, sancak feneri yanıp sönüyor. Sokak lambaları gece daha güçlü parlıyor. Bölge zemini Lv.3'te **arnavut kaldırımına** dönüşüyor ve ortasından kilim motifli bir yol geçiyor.

### UI
- **41 adet elle çizilmiş 12×12 pixel ikon** emojilerin yerini aldı — hem canvas'ta hem HTML panellerinde (emoji→ikon dönüşümü tek fonksiyondan geçiyor).
- Kartların üst kenarında **kilim şeridi**, satırların sol kenarında safran çizgi.
- **Dünya yazısı bütçesi:** kalabalık limanda ekranı yazı kaplamasın diye ad etiketleri oyuncuya en yakın 6 taneyle, rozetler 14 taneyle sınırlı; yer bulamayan etiket hiç çizilmiyor. Tabelalar yalnız yakındayken görünüyor.

### Test
```
node --check game.js
node test-world-render.js
```
Doğrulandı: 60 FPS (tam kurulu limanda 9 bina + 5 çalışan + 9 müşteri ile), konsol hatası yok, tüm eski regresyonlar (hat eşleme, depo, gün döngüsü, kayıt migrasyonu, duraklatma) geçiyor.

---

## v1.2 — Merkezi Depo + Balık Pazarı Günü (Birleşik Sistem GDD v1.1)

Çekirdek döngü (**Ağ → Kesim → Taşıma → Tezgâh → Satış**) aynen duruyor. Bu sürüm tekrarlı taşıma işini orta oyunda bir **yönetim kararına** çeviriyor ve o kararı **Balık Pazarı Günü'nde** sınıyor.

### A) Merkezi Depo + Otomatik Dağıtım (§3)

**Açılış:** Balık Pazarı bölgesi açık + 25 sipariş tamamlanmış olunca depo kendiliğinden açılır (satın alma yok). Kapasite 40, her Buzhane seviyesi +8 ekler.

**Akış:** oyuncu (veya tezgâhtar) fazla ürünü depoya bırakır → **Dağıtım Çalışanı** ($1.150, depo açılınca listelenir) tezgâhları hedef stoka göre besler.

**Hedef stok + öncelik (§3.2).** Her tezgâhın bir hedefi (varsayılan 12) ve bir önceliği var: **DÜŞÜK / NORMAL / YÜKSEK**. Stok hedefin altına düşer ve depoda uygun balık varsa dağıtım işi oluşur; yüksek öncelikli tezgâh önce beslenir. Menüdeki yeni **DEPO** sekmesinden ayarlanır, tezgâhın üstünde `7/20 ▲` rozetiyle görünür.

**Değişmez kural (§3.3).** Her balık yalnız kendi tezgâhına gider. Otomasyon yanlış balığı yanlış tezgâha gönderemez; depoda ürün yoksa sihirli ürün üretmez. Teslim edilemeyen ürünü dağıtımcı depoya geri koyar — ürün hiçbir zaman yok olmaz.

### B) Balık Pazarı Günü (§4-6)

Her **5. gün** Balık Pazarı. Bir önceki günün kapanış kartında haber verilir: *"YARIN BALIK PAZARI — Beklenen yoğunluk: Yüksek"*.

**Pazar sabahı hazırlık ekranı:** depo stoğunu görürsün, her tezgâhın hedefini ve önceliğini **yalnız o pazar için** değiştirirsin. Normal hedeflerin bozulmaz — pazar bitince otomatik geri döner.

**Pazar günü:** müşteri akışı ×2,2 yükselir. **Fiyat otomatik artmaz, balık otomatik oluşmaz.** Müşteri gerçekten gelir; servis edebilirsen satarsın, stok biterse müşteriyi kaybedersin. Kurduğun lojistik burada sınanır.

**Pazar sonuç kartı:** toplam satış, müşteri (servis/toplam), satılan balık, kaçan müşteri, en çok satan tür ve **stok dışı kalınan süre** (hangi tezgâhın neden boş kaldığını gösterir).

### C) Sade gün geçişi (§2)

Gün sistemi yeni bir yönetim katmanı **değil** — sadece zamanın geçtiğini hissettirir.

- HUD'da küçük bir **GÜN 4** sayacı + ilerleme çubuğu.
- Gün boyunca ortam ışığı hafifçe sabah → gündüz → akşam tonuna döner.
- Gün bitince yeni müşteri gelmez, sıradakiler tamamlanır, kısa özet kartı çıkar, sonra **GÜN 5** başlar.
- Depo, tezgâh stokları, para ve tüm ilerleme aynen korunur.
- Borsa günü artık oyun günüyle aynı — iki ayrı saat yok.

**Bu sürümde bilinçli olarak YOK:** vardiya planlama, saat bazlı bonus, mevsim/hava, maaş günü, kira, gece oynanışı, güne özel görev.

### Kayıt
Gün sayısı, depo içeriği, tezgâh hedefleri ve öncelikleri kaydedilir. Eski kayıtlar sorunsuz açılır: depo boş başlar, hedefler varsayılana döner, para/ilerleme hiç etkilenmez. Geçersiz ürün kayıttan yüklenmez.

### Test
```
node --check game.js
node test-world-render.js
```
Doğrulandı: yanlış tür sızması 0, öncelik sıralaması doğru (YÜKSEK önce), geçici pazar hedefleri kalıcı hedefi ezmiyor, kayıt turu temiz, konsol hatası yok.

---

## v1.1 — Liman Hizmet Binaları + Görsel Evrim (GDD v0.4) & Duraklatma/Kayıt

Ana balık döngüsü (**Ağ → Kesim → Taşıma → Tezgâh → Satış**) hiç değişmedi. Üstüne iki katman eklendi.

### A) Hizmet binaları (GDD v0.4 §31-44)

7 bina, her biri **5 seviye**, her seviyede hem işlev hem **görünüm** değişir. Alt bardaki yeni **🏭 BİNA** sekmesinden kurulur.

| Bina | Bölge | Lv.1 | Lv.5 | Ana etkisi |
|---|---|---|---|---|
| 🧊 Buzhane | İskele | $900 | $42.000 | Tür başına arka stok +2 → +12, +1 kontrat kapasitesi |
| 🛠️ Tamirhane | İskele | $1.500 | $70.000 | Servis geliri + tüm yükseltmelerde −%2 → −%10 |
| 🏪 Balık Hali | Pazar | $3.200 | $135.000 | Kuyruk +1 → +3, **Toptancı** müşteri tipi, toptan ödülü +%10 |
| 🍽️ Restoran | Pazar | $4.200 | $190.000 | Otomatik ziyaretçi geliri, **Turist** tipi, müşteri geliri +%8 |
| 📋 Nakliye Ofisi | Depo | $8.000 | $360.000 | Kontrat slotu +1 → +3, kontrat ödülü +%15 |
| ⛽ Yakıt İstasyonu | Rıhtım | $10.000 | $440.000 | Servis geliri (sefer bonusu tekne sistemi gelene kadar uykuda) |
| 🚢 Tersane | Rıhtım | $18.000 | $820.000 | Geç oyun sinki; 4 bina kurulmadan açılmaz |

**Parseller (§32).** Serbest yerleştirme yok — haritada 7 sabit **hizmet parseli** var; her parsel yalnız uyumlu binaları kabul eder. Parseller Lv.5 ayak izine göre baştan rezerve edildi, yani yükseltme hiçbir zaman yürüme koridorunu, müşteri kuyruğunu veya **kasa güvenli alanını** daraltmaz (`BT.servValidate()` bunu test eder). Yanlış parsele kurulduysa **ücretsiz taşınır**, seviye korunur.

**Görsel evrim (§36).** Lv.1 ahşap baraka → Lv.3 taş/tuğla gövde + kiremit çatı → Lv.5 iki hacimli kompleks. Her binanın kendi kimlik rengi (çatı şeridi), kendi propları (buz blokları, vinç, tenteler, masalar, konteynerler, tanklar, kızak) ve Lv.2+ hafif idle animasyonu var. Kurulumda 2,2 sn'lik şantiye sekansı oynar; **yükseltmede bina kullanılamaz hale gelmez**.

**Satın alma güvenliği (§37).** Dünyada çarpınca para harcatan pad **yok**. Her işlem alt bardan, bina→parsel→onay akışıyla yapılır. Kamera hiç sallanmaz.

**Servis geliri tavanı (§38.2).** Binaların pasif geliri, son ~45 sn'deki aktif balık gelirinin **%30'unu** geçemez (taban $12). Amaç AFK para makinesi değil, yatırımın görünür karşılığı.

### B) Duraklatma + kayıt sistemi

- **Pause:** ☰ menü veya Ayarlar açıldığında oyun **tamamen donar** (müşteri, çırak, piyasa, animasyon, oynanış saati). Ekranın üstünde `⏸ DURAKLATILDI` rozeti çıkar.
- **ESC** duraklatır / devam ettirir.
- **💾 KAYDET** — anında kaydeder, "Oyun kaydedildi • 21:07" bildirimi verir. Hem Ayarlar hem ☰ menüde var.
- **💾 KAYDET VE ÇIK** — kaydeder ve ana menüye döner (HUD/alt bar kapanır).
- **Kayıt kartı:** son kayıt saati, para, itibar, sipariş sayısı ve **toplam oynanış süresi**. Hem başlangıç ekranında hem Ayarlar'da.
- Başlangıç ekranı kayıt varsa **▶ DEVAM ET** + **YENİ OYUN** (onay soran) gösterir.
- Otomatik kayıt (6 sn) ve sekme kapanınca kayıt aynen duruyor.

### Kayıt uyumluluğu (§41)
Eski kayıtlar sorunsuz açılır: **hiçbir bina otomatik satın alınmaz, para kesilmez.** Bozuk kayıtlar temizlenir — bilinmeyen bina atlanır, seviye 1-5 aralığına kırpılır, geçersiz/dolu/kilitli parseldeki bina uygun boş parsele taşınır, yer yoksa kurulmamış sayılır.

### Test
```
node --check game.js
node test-world-render.js          # dünya çiziliyor mu (2 viewport)
```
Doğrulandı: parsel çakışması 0, kilitli tipte müşteri 0, 5 seviyede görsel fark, kayıt turu temiz, konsol hatası yok.

---

## v1.0.1 — Balık ↔ Tezgâh Hattı (mapping bug fix)

Kilitli balık türlerinin müşteri siparişlerine sızması engellendi. Çekirdek döngü aynı: **Ağ → Kesim → Taşıma → Tezgâh → Satış.**

**Hat tablosu (tek satırdan düzenlenir — `LINES`):**

| # | Balık | Tezgâh | Ağ | Açılış |
|---|---|---|---|---|
| 1 | Hamsi | İskele Tezgâhı | 1. ağ | başlangıç |
| 2 | Uskumru | Pazar Tezgâhı | 2. ağ | Balık Pazarı bölgesi |
| 3 | Palamut *(yeni)* | Pazar Ek Tezgâhı | 2. ağ | yapı noktasına "Ek Tezgâh" |
| 4 | Levrek | Fümehane Tezgâhı | 3. ağ | Fümehane bölgesi |
| 5 | Somon | Fümehane Ek Tezgâhı | 3. ağ | yapı noktasına "Ek Tezgâh" |
| 6 | Orkinos | Kapalı Pazar | 2. ağ | büyük proje tamamlanınca |

**Kurallar**
- Bir tür ancak **üretim noktası açık + işleme hattı var + kendi tezgâhı kurulu** ise satılabilir (`canProduce && canProcess && canSell`). Biri eksikse o tür ne üretilir, ne sipariş edilir, ne de müşterisi doğar.
- **Ağlar yalnız hattı açık türleri üretir.** Başlangıçta 1. ağ sadece Hamsi çıkarır; yeni tezgâh açıldığı anda ilgili ağ o türü de üretmeye başlar ("🎉 Yeni hat açıldı" bildirimi).
- **Sipariş global listeden seçilmez**: her tezgâh yalnız kendi balığının siparişini üretir, müşteri kendi tezgâhına gider, başka tezgâhta beklemez.
- Tezgâh **yalnız kendi türünü kabul eder** — oyuncu da çırak da yanlış tezgâha bırakamaz; çıraklar ürünü doğru tezgâha yönlendirir, teslim edilemeyecek ürünü hiç almaz (8 sn boşta kalırsa paspasa geri bırakır).
- Müşteri tipleri tür yerine **tezgâh değerine** göre gelir (İşçi ucuz tezgâhta, Şef pahalı tezgâhta, VIP füme hattı açıkken).
- Tezgâh kaldırılırsa/kapanırsa o türe yeni müşteri gelmez; mevcut müşteri kuyrukta kilitlenmez — siparişi geçerli ürüne **reroll** edilir, imkânsızsa müşteri gider.
- **Fallback:** uygun tür yoksa müşteri hiç spawn edilmez; kilitli tür asla zorla seçilmez.
- **Eski kayıt göçü:** yükleme ve her tezgâh değişiminde dünya taranır; elde/paspasta/tezgâhta/ağ stoğunda kalan geçersiz ürünler geçerli türe dönüştürülür veya temizlenir. Yeni oyuna başlamak gerekmez.
- Balıkların GDD'deki farkları korundu (Somon 2 taşıma yeri/3 fileto, Orkinos 3 taşıma yeri/5 fileto, kesim süreleri, füme çarpanı); özel istasyon isteyen türler için `canProcess` kancası hazır.

---

## v1.0 — Şirketler • Kontratlar • Liman Borsası

Ana balık döngüsü aynı kaldı; derinlik, kazanılan paranın **kontratlara, hisselere, ortaklıklara ve satın almalara** akmasından geliyor.

### Açılış
**Liman Ticaret Ofisi** ($18.000 + 40 ⭐, Fümehane bölgesi) haritada fiziksel bina olarak kuruluyor. Yaklaşınca tek bir **TİCARET** butonu çıkıyor; ana ekranda sürekli finans paneli yok. Kurulunca 10 hisselik **eğitim kredisi** veriliyor.

### Piyasa (§4)
- **1 Pazar Günü = 5 dk aktif oynanış.** Fiyat yalnız kapanışta değişir.
- Kapanış formülü: sektör (±%5) + şirket sağlığı (±%4) + haber (±%12) + oyuncu etkisi (±%2) + kontrollü rastgelelik (±%3); normal gün bandı **±%18**, büyük olayda ±%28.
- **Liman 12 Endeksi**, 3-6 günlük piyasa döngüleri (Genişleme/Normal/Yavaşlama/Toparlanma), günlük sektör momentumu, **24 haber olayı**.
- Piyasa nötrlemesi: ortalama sürüklenme kırpılır, endeks uzun vadede dengede kalır, göreli kazanan/kaybeden korunur.

### 12 kurgusal şirket (§3)
Kuzey Ağları, MaviHat Lojistik, BuzMar, Okyanus Gıda, Tersane 47, Kıyı Sofrası, Atlas Ambalaj, Martı Denizcilik, DerinSu Avcılık, Liman Makina, Ada Pazarlama, Mercan Turizm — her biri kendi sektörü, riski, **Sağlık / Büyüme / Risk** göstergeleri ve **%5 / %15 / %51 perkleri** ile. Tüm isimler ve kimlikler özgün ve kurgusaldır.

### Kontratlar (§6-§7)
8 tip (Standart, Acil, Hacimli, Çerçeve, Özel, Münhasır, Kurtarma, Büyük Proje). Kontrat = **mevcut üretim döngüsüyle** hazırlanan ürünleri Ticaret Ofisi'ne teslim etmek. Ödül = normal değer × tip çarpanı × ilişki çarpanı. Başarısızlıkta **para cezası yok**, sadece ilişki düşer. Tedarikçi kariyeri 6 seviye. Tezgâhtar çırağı kontrat ürünlerini de ofise taşır.

### Sahiplik & holding (§8-§10, §15-§17)
- Serbest dolaşımdan alım, **%1,5 komisyon**, aynı gün satış kilidi, **büyük emir primi** (>%5 tek emir reddedilir), short/kaldıraç yok.
- Eşikler: %1 kayıtlı → %5 perk I → %15 perk II → %30 yönetim kurulu → %51 kontrol (Holding Lisansı) → %100 bağlı ortaklık.
- **Temettü** her 4 pazar gününde (sağlık 55+), **yönetim kurulu projeleri** (%30+), **devralma teklifi** (prim ×1,20–1,35), **6 özel işletme** (pasif gelir + kalıcı bonus), **Holding değeri ve 5 kademe**.
- Perkler gerçekten oyuna işliyor: ağ hızı/stoğu, işleme hızı, ürün değeri, müşteri harcaması/akışı, nadir av, VIP şansı, yükseltme indirimi, kontrat çarpanı — grup başına tavanlı (§9.1).

### Kurumsal işlemler (§11)
Sermaye artırımı, geri alım, 1:2 hisse bölünmesi ve yeniden yapılanma/kurtarma döngüsü.

### Arayüz (§19)
Ticaret Ofisi 6 sekme: **PİYASA** (endeks + 12 şirket), **ŞİRKET** (12 günlük mini grafik, sağlık/büyüme/risk, ilişki, perk eşikleri, al/sat, devralma, yönetim kurulu), **KONTRAT**, **PORTFÖY**, **HABER**, **HOLDİNG**. Ana HUD yalnız tek satırlık bildirim gösterir.

### Anti-exploit / kayıt (§21)
Kapanış tohumu (`seed`) save'de tutulur → **kapat-aç ile farklı sonuç üretilemez** (test edildi). Aynı gün satış kilidi, kontrat süresi ve haber geçmişi kaydedilir; negatif nakit oluşamaz; `marketState` ayrı şemayla migrate edilir (yeni şirket/olay eklenince eski kayıt bozulmaz).

---

## v0.3.1 — UX / Bug Fix paketi

| Sorun (geri bildirim) | Çözüm |
|---|---|
| **Kamera çok sallanıyor / mide bulandırıyor** | Ekran merkezinde **ölü bölge** (%24 × %20): karakter bu alanda gezerken kamera durur. Takip yumuşatıldı, **ekran sarsıntısı tamamen kaldırıldı**, kamera açık alan sınırına kilitli (yeni AREA açılınca sınır genişler). |
| **Yanlışlıkla upgrade satın alma** | Zeminde **hiçbir satın alma tetikleyicisi kalmadı**. Alan açma, bölge seviyesi, yapı ve proje yatırımı yalnız alt bardan, açık seçimle yapılır. Alan açma / seviye ve ≥$1.500 işlemler **çift dokunuş onayı** ister. |
| **Geliştirmeler okunmuyor** | Alt bar kartında ikon + isim + seviye + **etkisi** + fiyat net yazılır; parası yetmeyen kart kırmızı, uygun sekmeler yeşil çerçeveyle işaretlenir. |
| **Aktif alan dar hissediliyor** | HUD kartları küçüldü, tutorial kutusu tek satırlık **görev bandına** indi ve eğitimden sonra sadece sabrı azalan sipariş varsa görünür. Alt bar kapalıyken ~50 px. |
| **Kilitli alanlar fazla yer kaplıyor** | Kilitli bölgeler artık dolu zemin + dev tabela değil; **soluk siluet + kesikli sınır + küçük kilit etiketi** (yalnız yaklaşınca). |

**Etkileşim önceliği (spec §8):** para taşırken kasa her şeyin önüne geçer → kasa çevresinde yanlış tetikleme yok.

**Alt geliştirme barı:** `ALAN` (yeni bölge) • `YÜKSELTME` (bölge seviyesi + kapasite/hız/pazarlık + çırak tut) • `YAPI` (yapı noktaları + süsler) • `PROJE` (Kapalı Pazar'ne aşamalı yatırım).

---

## v0.3 — Liman Genişleme + Yatırım (GDD Basic v1)

| Sistem | Uygulama |
|---|---|
| **AREA** | 3 bölge: Balıkçı İskelesi / Balık Pazarı ($1.300 + 10⭐) / Fümehane ($4.600 + 30⭐). Kilitli alan haritada halat çit + tabela ile önceden görünür. |
| **Bölge seviyesi** | Her bölge Lv.1→3. Her seviyede **görünür** değişim: yıpranmış tahta → düzgün zemin + tabela → taş zemin + sokak lambaları. Ayrıca ağ hızı, tezgâh kapasitesi, kuyruk sırası ve yeni yapı noktası açılır. |
| **Yapı noktaları** | 7 sabit slot (3'ü Lv.3'te açılır), 6 yapı: Personel Kulübesi, Çay Ocağı, Ek Tezgâh (yeni satış noktası!), Reklam Panosu, Depo Kulübesi, Ağ Vinci. Slot başına uyumlu kategoriler; değiştirince %60 iade. |
| **Büyük Proje** | **Kapalı Pazar** — $26.000, 5 aşama (temel → kolon → duvar/çatı → donatım → açılış). Parça parça yatırım: +$1.000 / +$10.000 / %25 / MAKS. Her eşikte şantiye modeli büyür; bitince yeni tezgâh + %25 müşteri akışı. |
| **Kozmetik** | 8 satın alınabilir süs: Türk bayrağı, balıkçı teknesi, bank, simit arabası, sokak lambası, begonvil, çay masası, balık heykeli. (Her biri +%2 müşteri sabrı.) |
| **Liman Planı** | `☰` menüsünde bölgeler / proje / yapı slotları / personel limiti tek ekranda. |

## v0.2'den devam eden sistemler
- **5 balık türü** (Hamsi, Uskumru, Levrek, Somon, Orkinos) — ağırlık, kesim süresi, fileto verimi, fiyat farklı; taşıma **ağırlık** bazlı.
- **4 çalışan rolü + maaş**: Hamal, Filetocu, Tezgâhtar, Kasiyer (maaş saniye saniye kasadan düşer, personel limiti yapıya bağlı).
- **Sipariş sistemi**: 6 müşteri tipi (İşçi/Aile/Esnaf/Şef/Kaptan/VIP), ürün + adet + sabır halkası + ödül; VIP/Şef kaçarsa itibar düşer.
- **İtibar**: 5 seviye; bölgeler para **+** itibar ile açılır.
- **Olaylar**: 🐟 Balık Sürüsü, 🚢 Vapur, 🌊 Lodos.

## Pixel art & Türkiye teması
- Tüm sahne düşük çözünürlüklü tuvale çizilip `image-rendering: pixelated` ile büyütülür; yazılar **Pixelify Sans** (tam Türkçe karakter desteği).
- Arka planda parallax Türk sahil kasabası: beyaz evler, kiremit çatılar, **cami + minare**, servi ve fıstık çamları, martılar, ahşap takalar.
- Tezgâhlarda kırmızı-beyaz tenteler, çay ocağı, simit arabası, Türk bayrağı direği.

## Arayüz
- Giriş ekranı (dil seçimi), **Ayarlar** (dil / ses / zoom / kaydı sıfırla), `☰` menü (Liman, Personel, Ürünler, Yardım).
- Yığın kuralı: 0-5 gerçek model → 6-19 arası 5 model + `xN` → 20+ tek kasa + `xN`.
- Yükseltme kartı sadece en yakın alan için açılır; uzaktaki etiketler kısalır/kaybolur.
- Oyun içi 6 adımlı eğitim + hedefi gösteren ok. Yapı/proje panelleri alttan açılan kart şeridi.

## Kontroller
Masaüstü `W A S D` / yön tuşları — Mobil: ekrana bas & sürükle.

## Notlar
- Kayıt: `localStorage` → `balikci_tycoon_v3` (bölgeler, seviyeler, yapılar, proje yatırımı, süsler, dil, ses, zoom).
- Hata ayıklama: `window.BT` (`BT.hire('hamal')`, `BT.setEvent('suru')`, `BT.setLang('en')`, `BT.investProject(1000)`).
- Sonraki sürümler için GDD'de kalanlar: tekne/sefer, kontratlar, konserve/ızgara hatları, çalışan seviyeleri, AREA 4-7.
