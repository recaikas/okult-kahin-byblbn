# Hamsi Koyu — geliştirme fikirleri

İki grup var:
- **10 kesin eklenebilir fikir:** Var olan sistemlerin üstüne kurulur; her biri 1–3 haftalık iş.
- **5 devrim niteliğinde fikir:** Oyunun bakış açısını değiştirir.

Her fikir için bir taslak görsel hazırlanacak: `fikir-01.png` … `fikir-10.png` ve `devrim-1.png` … `devrim-5.png`.

---

## A. 10 kesin eklenebilir fikir

### 1. Haşmet Defteri (vergi ve borç paneli)
- **Ne:** PROJE sekmesinden boşalan yere gelen deri kaplı bir defter. İçinde:
  - bu haftaki tahmini vergi, tezgâh tezgâh;
  - eski borçlar, faiziyle (×2 / ×4 rozetleri);
  - Haşmet Bey'in kaç gün sonra geleceği;
  - geçmiş makbuzlar.
- **Ek mekanik:** "Erken öde" düğmesi. Memur gelmeden borcu kapatana %10 indirim; Haşmet de şaşırır ("Erken mi ödüyorsun? Şüpheli…").
- **Neden:** Borç sistemi artık oyunu bitirebiliyor. Oyuncu riski görmeli ki adil hissetsin.
- **Taslak görsel:** Alt çubukta 5. sekme "DEFTER". Açık panelde defter sayfası: kırmızı mühür, satır satır tezgâhlar, "×2" rozeti, geri sayım (3 gün).

### 2. Hava durumu ve mevsimler
- **Ne:**
  - Gün başında hava kartı: güneşli, poyraz, fırtına, sis.
  - Fırtınada ağlar yavaş dolar ama balık pahalılaşır. Siste müşteri az gelir, füme talebi artar.
  - Kışın hamsi bereketi; yazın av yasağı haftası olur, o hafta yalnız füme ve mutfak çalışır.
- **Görsel:** Yağmur ve kar parçacıkları, dalga boyu, tentelerin rüzgârda dalgalanması.
- **Neden:** Her günü farklı kılar, planlama ister. Sistem zaten gün kartları ve ürün fiyatlarıyla bağlı.
- **Taslak görsel:** Fırtınalı liman. Yağmur çizgileri, köpüklü dalgalar, eğilmiş tenteler, sol üstte "POYRAZ · ağlar −%30 · fiyat +%20" kartı.

### 3. Tekne seferleri
- **Ne:**
  - Kendi teknelerini alırsın: kayık → gırgır → trol.
  - Tekneyi 2–8 dakikalık sefere yollarsın; dönüşte toplu balık ve nadir türler getirir (lüfer, kalkan, barbun).
  - Tekne boyama ve isim verme ("Nazlı Hanım").
- **Neden:** İdle/tycoon türünün en sevilen döngüsü (gönder, bekle, ödül). Limanın denize açılan tarafını oynanır yapar.
- **Taslak görsel:** İskeleye yanaşmış boyalı tekne. Üstünde "SEFERDE 3:42" sayacı, yanında rota kartı (Sinop açıkları · Kalkan ihtimali %20).

- **Güncelleme (kullanıcı notu):** Ağlar, masalar ve tezgâhlar sabit olduğu için sefer malı bu zincire girmez, yoksa ürünler üst üste biner. Av iskeledeki tek bir sefer sandığına gider. Bazı tezgâhlardaki güveç ocağı bu malzemeyi Tarif Defteri'ndeki tariflerle (fikir 10) pişirir ve güveç tezgâhta pahalı satılır. Böylece tekne, tarif ve ocak tek mekanik olur.

### 4. Hamsi Festivali (her 10 günde bir)
- **Ne:**
  - Festival günü bayraklar, kemençe ve horon halkası; müşteri iki katı.
  - Özel festival tezgâhı: hamsi tava, hamsili pilav.
  - Mini oyun "Horon": ritimle tuşla, halka büyüdükçe bahşiş artar. Hikâyedeki ritim mini oyunu altyapısı kullanılabilir.
- **Neden:** Takvime bir zirve koyar; oyuncu "festivale yetişeyim" diye plan yapar.
- **Taslak görsel:** Meydanda bayrak dizisi, horon halkası, kemençeci, festival tezgâhında tava kokusu (buhar).

- **Güncelleme (kullanıcı notu):** Festival bir günlük geçici panayır tezgâhı olur ve yalnız depodaki balıkla beslenir.
  - Hazırlık: 2 gün önce gazete haber verir, oyuncu depoya stok biriktirir.
  - Festival günü: turist ve köylü kalabalığı gelir, fiyat ×1,3 olur, standa bir personel atanır.
  - Horon mini oyunu kalabalığı büyütür. Akşam festival gazetesi çıkar.
  - Dönen festivaller: Hamsi Festivali (kış), Balık Panayırı (bahar), Kemençe Gecesi (yaz), Bayram pazarı.
  - Stant yükseltmeleri: tente, ızgara, kemençeci. Tekne seferi ve güveçle de beslenir.

### 5. Müdavimler
- **Ne:**
  - Aynı müşteri birkaç kez memnun ayrılırsa müdavim olur.
  - İsmiyle gelir ("Fadime Abla"), siparişini söylemeden alırsın, bahşişi artar.
  - Her müdavimin 3 halkalı küçük hikâyesi var: kızı üniversiteyi kazanır, liman düğününe davet edersin.
  - Müşteri Defteri'nde "Müdavimler" sayfası açılır.
- **Neden:** Kalabalığa yüz verir; insanlar karakterlere bağlanır.
- **Taslak görsel:** Kuyrukta kalp rozetli bir müşteri. Konuşma balonunda "Her zamankinden, evladım!". Yanında müdavim kartı (3 yıldız, hikâye halkaları).

### 6. Liman kedileri
- **Ne:**
  - Koyda gezen kediler (tekir, siyah, sarman) beslenip isim verilerek sahiplenilir.
  - Her kedinin bir huyu var: farelerden korur (depo kaybı −), müşteri sevindirir (sabır +), ara sıra balık çalar (komik olay).
  - Kedi evi ve kedi koleksiyonu albümü.
- **Neden:** Karadeniz limanının ruhu, sevimlilik ve paylaşılabilir anlar. Oyunda kediler zaten var.
- **Taslak görsel:** Kasa yanında küçük kedi evi ve üç kedi; biri ağızda hamsiyle kaçıyor. Üstte "Pamuk sahiplenildi! · müşteri sabrı +%5".

- **Güncelleme (kullanıcı notu):** Evcil hayvanlar personel gibi alınır (YÜKSELT › Personel). Maaş yerine günlük mama ödenir. Limanın popülerliğini, yani müşteri cazibesini artırırlar. Kedi müşteriyi sevindirir, bekçi köpeği martı kovar, depo kedisi fare tutar.

### 7. Gazete fotoğraf modu (paylaşım kartı)
- **Ne:**
  - Bir düğmeyle limanın o anki fotoğrafı, oyunun gazete tarzında manşete dönüşür: "TEMEL BALIK EVİ 300. MÜŞTERİSİNİ AĞIRLADI".
  - Manşet, oyuncunun gerçek rekorlarından otomatik yazılır.
  - Instagram ve WhatsApp'a hazır 9:16 görsel olarak kaydedilir.
- **Neden:** Bedava pazarlama; her paylaşım oyunun reklamı. Gazete altyapısı (intro, bölüm sonu, Liman Battı) hazır.
- **Taslak görsel:** Sepya gazete sayfası, ortada oyuncunun renkli liman fotoğrafı, altta "PAYLAŞ" düğmesi ve QR.

- **Güncelleme (kullanıcı notu):** Gazete, 5 dönüm noktasında kendiliğinden çıkar ve oyuncu sevinir: ilk gün sonu, Balık Pazarı açılışı, ilk Haşmet ziyaretini atlatmak, ilk müdür ya da Mutfak açılışı, Bölüm 1 sonu. Altında PAYLAŞ düğmesi olur.

### 8. Haftalık Liman Ligi
- **Ne:**
  - Skor tablosu haftalık ligler olur: Bronz Ağ → Gümüş Olta → Altın Çapa.
  - Her hafta 30 kişilik grup; ilk 5 üst lige çıkar.
  - Ödüller kozmetik (tente rengi, tekne bayrağı); denge bozulmaz.
- **Neden:** Uzun süreli bağlılık. Supabase skor tablosu zaten var.
- **Taslak görsel:** Lig paneli: madalyalar, oyuncunun sırası (7.), "yükselme çizgisi", kalan süre 2g 4s.

- **Güncelleme (kullanıcı notu):** D4 Komşu Limanlar ile birleşir: lig grubu, kıyı haritasındaki komşu limanlardır ve her oyuncunun kendi limanı haritada görünür. Kıyı gazetesi kazananı manşete çıkarır.

### 9. Kahvehane söylentileri
- **Ne:**
  - Meydandaki çay ocağına uğrayınca balıkçılardan söylenti duyarsın: "Yarın Sinop tarafında lüfer varmış", "Haşmet Bey bu hafta keyifsizmiş", "Fadime Abla'nın kızı nişanlanıyor".
  - Söylentilerin bir kısmı doğru, bir kısmı yanlış. Doğru çıkanlar kahvehane güvenini artırır, sonraki söylentiler daha güvenilir olur.
  - Doğru söylenti avantaj verir: hazırlık, fiyat, müdavim hediyesi.
- **Neden:** Planlama için bilgi değerli bir kaynağa dönüşür. Karadeniz kahvehane kültürü ve mizahı oyuna girer.
- **Taslak görsel:** Çay ocağında tavla oynayan iki balıkçı, ince belli çay bardakları, konuşma balonunda söylenti, köşede "GÜVEN ●●●○○" ölçeri.

### 10. Tarif Defteri (mutfak keşifleri)
- **Ne:**
  - Mutfakta malzemeleri birleştirerek yeni yemek keşfedilir: hamsi tava, hamsili pilav, buğulama, kuymak, karalahana çorbası.
  - Keşfedilen tarif mutfak menüsüne girer ve itibar kazandırır.
  - Tarif kartları el yazısı defter sayfası gibi görünür.
- **Neden:** Keşif hissi ve Karadeniz mutfağı kültürü. Mutfak bölgesi zaten var.
- **Taslak görsel:** Açık tarif defteri. Sol sayfada çizilmiş hamsili pilav, sağda malzeme kutucukları (hamsi + pirinç + tereyağı → ?), "YENİ TARİF!" damgası.

---

## C. Gece: bambaşka bir dünya (kullanıcının fikri)

Gündüz bitince limanın öbür yüzü açılır: ay karanlığında **ışıkçı kayığı** (lambayla hamsi avı), dolunayda **Liman Kahvesi** (söylenti, tavla, Haşmet Bey'in gece hâli, İtimat), hikâyenin 6. gününden sonra **höyük ateşi** (Alp Er Tunga).
- İsteğe bağlı, 1–2 dakika.
- Sabaha en çok %10 avantaj bırakır; atlamak hep ücretsiz.
- Ayrıntılar ve tasarımcıların tartışması: `gece/GECE.md`. Taslak görseller: `gece-1` … `gece-4`.

---

## B. 5 devrim niteliğinde fikir (bakış açısını değiştiren)

### D1. Denizin Hafızası
- **Ne:**
  - Deniz yaşayan bir karakter olur. Her avın bir izi kalır.
  - Aşırı avlarsan sürüler küçülür, deniz renk değiştirir, Şahmeran'ın sesi uyarır. Ölçülü avlarsan yunuslar geri gelir, dipte mercanlar açılır.
  - Oyuncu ara sıra "denizin altından" bakar: liman yukarıda, ağlar gölge gibi iner, balık sürüleri kaçışır.
- **Perspektif:** Tycoon oyunlarının "daha çok = daha iyi" mantığını ters çevirir; sürdürülebilirlik oynanışla öğretilir. Hikâyedeki "söz denizden ağırdır" teması mekaniğe dönüşür.
- **Taslak görsel:** Ekran ortadan ikiye bölünmüş. Üstte liman ve ağlar, altta su altı: balık sürüsü, dipte uyuyan Şahmeran'ın kuyruğu. Sol kenarda "DENİZİN HAFIZASI" ölçeri.

### D2. Kuşaklar Boyu Liman
- **Ne:**
  - Zaman gerçekten akar: her bölüm bir on yıl (1974 → 1984 → … → 2024).
  - Kahraman yaşlanır; limanı çocuğuna, sonra torununa devreder. Her kuşak yeni bir yetenekle gelir.
  - Kasaba modernleşir: tahta tezgâhlar koruma altına alınır, mavnalar gider, turist gelir.
  - Eski gazeteler bir "aile albümü" olur.
- **Perspektif:** Oyuncu bir işletmeyi değil, bir aile mirasını büyütür. Dedemin iskelesiyle başlayan hikâye torunla kapanır.
- **Taslak görsel:** Aynı limanın üç dönemi yan yana (1974 sepya, 1994 soluk renk, 2024 canlı renk), her birinde aynı ailenin farklı kuşağı.

### D3. Gerçek Karadeniz Takvimi
- **Ne:**
  - Oyun gerçek dünyaya bağlanır: Sinop ve Trabzon'un gerçek havası, gerçek hamsi sezonu (Eylül–Nisan), gerçek av yasağı tarihleri (15 Nisan–1 Eylül).
  - Gerçek bir fırtına günü oyunda da fırtına olur.
  - Kısa "biliyor muydun?" kartları: hamsinin göç yolu, lüferin boy yasağı.
- **Perspektif:** Oyun bir pencereye dönüşür; oyuncu denizi ve mevsimi gerçekten takip etmeye başlar. Okullar için eğitici versiyonu da olabilir.
- **Taslak görsel:** Telefonda oyun, yanında gerçek Karadeniz haritası. Hamsi göç oku, gerçek hava ikonu, takvimde "AV YASAĞI BAŞLIYOR · 15 Nisan".

- **Güncelleme (kullanıcı notu):** Geliştirilecekler listesinde. İlk adım fikir 2'deki hava kartı; gerçek hava verisi ona sonradan bağlanır.

### D4. Komşu Limanlar (eşzamansız çok oyunculu kıyı)
- **Ne:**
  - Ufukta gördüğün koylar gerçek oyuncuların limanlarıdır.
  - Tekneler limanlar arasında mal taşır; sende fazla hamsi varsa komşunun hal'ine satarsın.
  - Haşmet Bey herkesi ziyaret eder ve "kıyı gazetesi" bütün oyuncuların olaylarından manşet yazar ("Sinop'taki Ayşe'nin limanı festivalde rekor kırdı!").
  - Fırtına bütün kıyıyı vurur; birlikte atlatılır.
- **Perspektif:** Tek kişilik tycoon, rekabetten çok dayanışmaya dayalı bir topluluk kıyısına dönüşür.
- **Taslak görsel:** Kıyı haritası, üzerinde 5 oyuncu limanı (adlarıyla), aralarında kesikli tekne rotaları, köşede kıyı gazetesi manşeti.

### D5. Dede Masalları Arşivi
- **Ne:**
  - Oyuncular büyüklerinden dinledikleri Karadeniz masallarını, tekerlemeleri ve türküleri sesli kaydedip gönderir.
  - Seçilenler oyuna "masalcı" müşteri olarak girer. Tezgâhına gelen yaşlı bir müşteri, gerçek bir dedenin sesinden bir masal anlatır.
  - Her masal köyü ve anlatanın adıyla (izinle) arşivlenir.
- **Perspektif:** Oyun, kaybolmakta olan sözlü kültürü toplayan bir müzeye dönüşür. Oyuncu tüketici değil, kültürün taşıyıcısı olur. Şahmeran gibi halk anlatılarıyla zaten uyumlu.
- **Taslak görsel:** Tezgâh önünde kasketli yaşlı müşteri, üstünde ses dalgası balonu. Yanında arşiv kartı: "Anlatan: Hüsnü Dede · Çaykara · 1938".

- **Güncelleme (kullanıcı notu):** Geliştirilecekler listesinde. D3 ile birleşebilir: yağmurlu gerçek günlerde masalcı dede kahvehaneye gelir.
