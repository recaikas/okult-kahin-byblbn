# Tarif Defteri ve Güveç Ocağı — deneme tasarımı (yalnız `deneme-emekci` dalı)

Kaynaklar:
- Sunumdaki fikir 10: Tarif Defteri.
- Kullanıcının notu: tekne, tarif ve ocak tek mekanik olmalı. Ürünler üst üste binmesin; sabit ağ, masa ve tezgâh zinciri bozulmasın.

Kullanıcı soru sorulmadan bitirilmesini istedi. Belirsiz yerde en makulü seçilir, kararlar README ve rapora yazılır.

## Fikrin özü
- Her tezgâhın yanına bir **Güveç Ocağı** kurulabilir.
- Ocak, o tezgâhın kendi balığını (tezgâhtaki filetoyu) **Kiler** malzemeleriyle pişirip **yemeğe** çevirir.
- Yemek aynı tezgâhta, filetodan daha pahalıya satılır.
- Hangi balığın hangi malzemeyle yemek olacağını **Tarif Defteri**'nde deneyerek keşfedersin.
- Yeni bir istasyon zinciri yok. Tezgâhta zaten duran mal, yerinde değer kazanır; böylece ürünler üst üste binmez.

## 1. Kiler (malzemeler)
Parayla satın alınan stok, adet olarak tutulur. Tarif Defteri'nin "KİLER" sayfasından alınır.

| id | Ad TR / EN | Birim fiyat | Görünüm |
|---|---|---|---|
| misirunu | Mısır Unu / Cornmeal | 3 | sarı çuval |
| pirinc | Pirinç / Rice | 4 | beyaz çuval |
| tereyagi | Tereyağı / Butter | 6 | sarı kalıp |
| sogan | Soğan / Onion | 2 | mor soğan |
| domates | Domates / Tomato | 3 | kırmızı |
| karalahana | Karalahana / Collard Greens | 4 | koyu yeşil yaprak |

- Alım paketleri: 10'luk ve 50'lik.
- Depo yükseltmesi varsa kiler sınırı 100, yoksa 50.

## 2. Tarifler (8)

| id | Ad TR / EN | Balık | Malzemeler | Fiyat çarpanı | İpucu (TR / EN) |
|---|---|---|---|---|---|
| hamsitava | Hamsi Tava / Fried Anchovy | hamsi | misirunu | ×2,0 | "Karadeniz'in ekmeği de unu da mısırdan." / "On the Black Sea, even the flour is corn." |
| hamsipilav | Hamsili Pilav / Anchovy Pilaf | hamsi | pirinc + tereyagi | ×2,6 | "Bayram sofrasının tacı: hamsi yorgan, pirinç döşek." / "The feast's crown: anchovy blanket, rice bed." |
| karalahana | Hamsili Karalahana Çorbası / Collard Soup | hamsi | karalahana + misirunu | ×2,4 | "Yaprağı koyu, çorbası sıcak." / "Dark leaves, warm soup." |
| uskumrudolma | Uskumru Dolma / Stuffed Mackerel | uskumru | pirinc + sogan | ×2,3 | "İstanbul'dan gelen tarif: içi pilavla dolu." / "A recipe from Istanbul: stuffed with pilaf." |
| levrekbugulama | Levrek Buğulama / Steamed Sea Bass | levrek | domates + sogan | ×2,2 | "Kendi buharında, kırmızı ve mor eşliğinde." / "In its own steam, with red and purple." |
| orkinosizgara | Tereyağlı Orkinos / Buttered Tuna | ton | tereyagi | ×1,8 | "Büyük balığa sade sofra." / "A big fish wants a simple table." |
| palamutpilaki | Palamut Pilaki / Bonito Stew | palamut | sogan + domates | ×2,1 | "Soğanla domates, palamutla kardeş." / "Onion and tomato, bonito's siblings." |
| reisguveci | Reis Güveci / Skipper's Stew | — | — | — | Mevcut mutfak yemeği. Mutfak açılınca otomatik bilinir, aynen kalır. |

Ek kurallar:
- Malzeme sırası önemsiz; adet her malzemeden 1.
- Yanlış bir denemede seçilen kiler malzemeleri harcanır; balık harcanmaz.
- Doğru tarifte deneme ücretsizdir (ilk tencere hediye).

## 3. Güveç Ocağı
- **Kurulum:** her açık tezgâh için ayrı alınır. YAPI › Geliştirme'de "Güveç Ocağı · <tezgâh adı>" kartı. Fiyat 1.200; 2. ocak 1.800, 3. ocak 2.600.
- **Görünüm:** tezgâhın yanında, tezgâh tepsisinin karşı tarafında küçük bir taş ocak; üstünde güveç, tüten buhar. Yerleşim `layoutRects`'e eklenir; çakışma olmasın, gerekirse tezgâhın arkasına konur.
- **Ayar:** ocağın etki alanında durunca ya da ocağa dokununca o ocağın Tarif Defteri sayfası açılır. O tezgâhın balığına ait, bilinen tariflerden **biri** ocağın tarifi olarak seçilir.
- **Çalışma:**
  - Ocak her 4 saniyede bir, tezgâh rafındaki o balığın **bir** filetosunu alır, tarifin kiler malzemelerinden birer tane harcar ve onu **yemeğe** çevirir.
  - Yemek, aynı balığın satılabilir malı olarak kalır; işaret `it.dish = tarifId`.
  - Değeri `FISH[f].val × çarpan` olur.
  - Tezgâhtaki sıra ve müşteri siparişi aynen işler: müşteri o balığı ister, yemek olanı alırsa fazla öder.
- **Sınırlar:** bir tezgâhta yemek sayısı rafın en çok %50'si; dengeyi ve görüntüyü korur. Kiler malzemesi yoksa ocak bekler ve rozeti "Kiler boş" olur.
- **Emekçi Mod açıkken:** ocak yalnız tezgâhın başında satıcı (oyuncu ya da Tezgâhtar) varken çalışır.
- **Görsel:** tezgâh rafında yemek olan mallar küçük bir güveç kabı ya da tabak simgesiyle çizilir; müşteri sipariş tabelasında da aynı simge. Satılan yemekte para uçuşu yanında "🍲" işareti.

## 4. Tarif Defteri arayüzü
- **Açılış:** HUD'da müşteri defterinin (📖) yanında yeni bir düğme "🍲" ya da ocağa dokunma. Yalnız ilk ocak kurulunca görünür.
- **Görünüm:** deri kaplı, el yazısı sayfalı defter. Oyunun panel diline uyar: krem kâğıt, kahverengi mürekkep, kırmızı mühür "YENİ TARİF!".
- **Sekmeler:**
  - **TARİFLER:** Bilinen tarifler malzemeleri ve fiyatıyla. Bilinmeyenler "?????" ve ipucu satırıyla.
  - **DENE:** Bir balık seç (açık bölgelerin balıkları), 1–2 kiler malzemesi seç → PİŞİR.
    - Doğruysa: damga animasyonu, +40 itibar, tarif açılır. Kart: "YENİ TARİF! Hamsi Tava · fiyat ×2,0 · ocağa ata".
    - Yanlışsa: "Olmadı… Hacer Teyze: '<ipucu>'" ve en yakın tarifin ipucu gösterilir.
  - **KİLER:** malzeme stokları ve SATIN AL (10 / 50).
  - **OCAKLAR:** her ocağın tezgâhı, atanmış tarifi, durumu.
- İlk açılışta ipucu kartı (HELP, TR/EN).

## 5. Gazete ve başarım bağları
- İlk tarif keşfinde gazete özel sayısı yok; gazete 5 dönüm noktasıyla sınırlı kalır. Bunun yerine başarım: **"Mutfağın Sırrı"** (ilk tarif). 4 tarif: **"Karadeniz Sofrası"**. Mevcut başarım sistemine ekle; TR/EN.

## 6. Kayıt
- `S.tarif = { known: [id], kiler: {id: adet}, ocak: {counterKey: {lv: 1, r: tarifId}} }`
- Yemek olan mallar (`it.dish`) tezgâh rafı kaydına dahil olmalı. Rafın nasıl kaydedildiğine bak; kaydedilmiyorsa yemek de kaydedilmez, sorun değil.
- Eski kayıtta alan yoksa boş başlar.

## 7. Testler (`test-tarif.js`)
1. Kiler alımı parayı düşer, stoğu artırır.
2. DENE: doğru kombinasyon tarifi açar (+itibar), yanlış kombinasyon kiler malzemesini harcar ve ipucu verir.
3. Ocak kurulumu ve tarif atama; ocak tezgâh filetosunu yemeğe çevirir, kiler azalır, raf sınırı %50 aşılmaz.
4. Yemek satılınca kazanç filetonun `çarpan` katı.
5. Emekçi Mod açıkken ocak satıcı yokken bekler.
6. Kayıt ve yükleme; eski kayıt.
7. `layoutClashes` yeni çakışma yok (ocaklar dahil).
8. TR ve EN metinler.

## 8. İleride (bu turda değil)
Tekne seferleri: seferden dönen nadir balıklar (lüfer, kalkan, barbun) "sefer sandığı"na gelir. Ocaklar bunları özel tariflerle pişirir. Bu turda yalnız kodda bir yorum ve `S.tarif` içinde boş bir `sandik: {}` alanı bırak.
