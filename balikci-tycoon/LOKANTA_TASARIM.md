# Sahil Lokantası — deneme tasarımı (yalnız `deneme-emekci`)

Kullanıcı kararları:
- Lokanta oyunun **en son açılan bölgesi**.
- Gün boyu açık; tezgâhlarla aynı anda çalışır.
- BİNA'daki mevcut Restoran **Balık Büfesi** adını alır ve pasif bina olarak kalır.

Tüm metinler TR ve EN. Emekçi Mod kuralı (istasyonun başında biri yoksa beklemesi) burada da geçerli. Binalar ve yükseltmeler İnşaat kuralına uyar: L. seviye L gün sürer.

## 1. Bölge
- **Konum:** ALAN sekmesinden açılan yeni ve son bölge (`AREAS` sonuna). Meydanın ve hizmet sahasının güneyi/batısındaki boş kumda, kıyıya bakan ahşap teraslı bir alan.
  - Mevcut bölgeler, yol, hizmet sahası, depo bölmeleri, FAME (24.75, 12.0), hayvan evleri ve dekorlarla çakışmaz: `layoutClashes` boş.
  - Müşteri yolundan ayrı bir giriş patikası.
- **Açılış:** son tezgâh bölgesi (mutfak bölgesi) açık olmalı ve itibar seviyesi en az 5. Bedel mevcut bölge fiyat eğrisinin bir sonraki adımı.
- **İçinde:**
  - Masalar (başlangıçta 2)
  - Mutfak: pişirme istasyonları
  - Servis tezgâhı (pass)
  - Soğuk dolap (fileto stoğu)
  - Kasa
  - Bulaşık tezgâhı
  - Menü tahtası

## 2. Zincir
1. **Soğuk dolap:** filetolar depodaki Soğuk Oda'dan ya da hasırlardan gelir. Taşıyan Hamal, Depo Hamalı ya da oyuncudur. Sınır 12 (yükseltmeyle 24).
2. **Sipariş:** Gelen grup (2–4 kişi) boş bir masaya oturur ve menüden **bir yemek × kişi sayısı** ister. Mutfaktaki sipariş panosuna fiş düşer (simge + adet).
3. **Pişirme:** Yemeğin istasyonunda aşçı ya da oyuncu durur.
   - Dolaptan o balığın filetosunu ve kilerden malzemeyi alır; her tabak bir fileto.
   - Tabak başına pişirme süresi: tava 3 sn, ızgara 4, tencere 5, fırın 6. Usta seviyesi süreyi kısaltır.
4. **Pass:** Pişen tabaklar servis tezgâhında birikir.
5. **Servis:** Garson ya da oyuncu tabakları masaya taşır. Taşıma sınırı garsonda 4, oyuncuda sepete göre.
6. **Yemek:** Grup 8–12 sn yer. Masaya ödeme yığını bırakır: `tarif değeri × kişi + bahşiş`. Kasaya Şef Garson, Tahsildar ya da oyuncu toplar.
7. **Bulaşık:** Masada kirli tabak kalır; masa temizlenene kadar dolu sayılır. Bulaşıkçı ya da oyuncu toplar, bulaşık tezgâhına götürür.
- **Sabır:** masa bekleme ve yemek bekleme süresi. Biterse grup kalkar, itibar −.
- **Bahşiş:** siparişten servise geçen süre kısaysa +%30'a kadar.

## 3. İstasyonlar ve tarifler
Her istasyon ayrı satın alınır ve seviyelenir; seviye eşzamanlı tabak sayısını ve hızı artırır.

| İstasyon | Tarifler |
|---|---|
| Tava | Hamsi Tava |
| Izgara | Tereyağlı Orkinos |
| Tencere | Hamsili Karalahana Çorbası, Levrek Buğulama, Palamut Pilaki |
| Fırın | Hamsili Pilav, Uskumru Dolma, Reis Güveci |

- **Tarif Defteri:** Lokanta açılınca defter oraya bağlanır. Mevcut TARİFLER / DENE / KİLER / MENÜ akışı korunur.
  - MENÜ yeri = lokanta seviyesi.
  - Menüye yalnız istasyonu kurulu tarif konabilir.
  - Kiler aynen kalır.
- **Fiyat:** müşteri ödemesi tabak başına `FISH.val × tarif çarpanı × 1,2` (oturarak yemek primi).

## 4. Çalışanlar (Lokanta kadrosu)
| Rol | Görev | Fiyat / maaş (ölçeğe uydur) |
|---|---|---|
| Aşçı | İstasyon başında pişirir; istasyon başına bir aşçı | 1.200 / 18 |
| Garson | Pass'ten masaya taşır | 900 / 14 |
| Bulaşıkçı | Kirli masayı toplar | 700 / 10 |
| Şef Garson | Kasayı toplar; bir rol eksikse yarım hızla doldurur (müdür gibi) | 2.000 / 25 |

- Hepsi Çırak → Kalfa → Usta olur (`lv`), Emekçi Mod'daki usta sistemiyle aynı.
- Kadro sınırı lokanta seviyesine bağlı.

## 5. Müşteri akışı
- Lokanta müşterileri yoldan, tezgâh müşterilerinden ayrı bir sayaçla gelir.
- Gelme hızı şunlara bağlıdır: lokanta seviyesi, menüdeki tarif sayısı, popülerlik, İlan Bürosu reklamları ve kedi etkisi (lokantaya da atanabilir).
- **Grup türleri:**
  - Aile: 4 kişi, sabırlı.
  - Turist: 2 kişi, bol bahşiş, pahalı tarifi sever.
  - Kahvehane ahalisi: 3 kişi, ucuz tarif, hızlı yer.
  - İş yemeği: 2 kişi, sabırsız, yüksek ödeme.

## 6. Olaylar
- **Düğün / nişan rezervasyonu:** Lokanta seviyesi 2 ve üstündeyken, ara sıra gün başında bir kart çıkar: "Yarın akşam Kemal'in düğünü: 16 tabak Hamsili Pilav". Kabul edilirse ertesi gün o tabaklar teslim edilmelidir (sayaç). Büyük ödül ve itibar; başarısızlıkta itibar −.
- **Muhtarın sofrası:** Haftada bir, 6 kişilik masa. Hızlı servis edilirse popülerlik bonusu.
- **Gurme Eleştirmen:** Seviye 3 ve üstünde rastgele gelir. Bekleme süresi, tarif çarpanı ve masa temizliğinden 1–5 yıldız verir.
  - Yıldız lokanta tabelasında görünür ve müşteri hızını etkiler (±%10).
  - Toast + başarım "Gurmenin Gözdesi" (5 yıldız).

## 7. Yükseltmeler
1. Masa: 2 → 4 → 6 → 9 → 12.
2. Teras (Sv 3): kıyıya bakan masalar, sabır +%15.
3. Meze vitrini: her masaya kendiliğinden meze, ödeme +%10.
4. Saz köşesi (Sv 5): müşteri daha uzun oturur (masa dönüşü −%15) ama harcama +%25. Akşamüstü saz sesi.
5. Soğuk dolap 12 → 24.

## 8. Balık Büfesi
- BİNA › `restoran` girdisinin adı **Balık Büfesi / Fish Buffet** olur. Davranışı aynı kalır: fazla balığı pişirip satar.
- Tarif ve menü bağı büfeden çıkar ve Lokanta'ya taşınır. Eski kayıtta büfe menüsü varsa Lokanta menüsüne aktarılır.

## 9. Kayıt ve testler
- **Kayıt:** `S.lok = { lv, tables, st: {tava, izgara, tencere, firin}, dolap, crew: [{r, lv}], star, res: {…} }`. Eski kayıtta boş.
- **test-lokanta.js:**
  - açılış koşulu
  - zincir: sipariş → pişirme → pass → servis → yemek → ödeme → bulaşık
  - Emekçi beklemesi
  - aşçı ve garson otomasyonu
  - bahşiş hızı
  - sabır kaçışı
  - istasyon/menü kısıtı
  - rezervasyon
  - eleştirmen yıldızı
  - kayıt/yükleme
  - TR/EN
  - `layoutClashes`
- **Eski testler:** `test-offline.js` → `HK_LOK_OFF = 1`.

## 10. Çizim
- Klasik çizim game.js'te.
- İnce mod kancaları: `HKA.drawLokanta(o)`, `HKA.drawLokTable(o)`, `HKA.drawLokStation(o)`, `HKA.drawLokCrew(o)`. Garson: beyaz gömlek, siyah yelek; aşçı: beyaz önlük ve kep.
- İnce çizimleri ana sanatçı yapar.
