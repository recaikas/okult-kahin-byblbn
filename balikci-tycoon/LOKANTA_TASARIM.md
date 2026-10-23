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

## Aşama 1 — uygulama notları (deneme-emekci)
- **Konum:** `AREAS[4]` (`sahil`), x 0–10, y 23.5–29.5: Mutfak iskelesinin güneyine uzanan ahşap teras. Güneydeki/doğudaki kum şeridi 2–2,3 karo olduğundan (LANDY 24,5, SERVYARD sınırı 21,9) boş kuma sığmadı; iskele devamı olarak suyun üstünde. Kamera `maxOpenY` ile kendiliğinden uzar. Müşteri patikası yolun güney ucundan (x 10–13, y 21.5–24.5) kapıya (9.3, 24.1) iner.
- **Seviyeler:** `S.lok.lv` (1–5) menü yeri, kadro sınırı (4 + lv; Sv1’de beş rolün her birinden biri) ve gelme hızını belirler; `S.lok.tb` masa seviyesi (2/4/6/9/12), lv + 1'i geçemez. İkisi de, istasyonlar da inşaat kuralına uyar (L. seviye L gün).
- **Aşama 2'ye bırakılanlar:** olaylar (rezervasyon, Muhtar, eleştirmen: `S.lok.res`, `S.lok.star` hazır; gelme hızı yıldızı zaten ±%10 okur), masa dışı yükseltmeler (teras `lokPatMul`, meze, saz, dolap 24: `S.lok.dl` hazır), Balık Büfesi adı + menünün büfeden lokantaya taşınması (Tarif Defteri şimdilik lokanta açılınca da açılır; defterdeki MENÜ sekmesi aynen duruyor), kedi etkisi.

## Aşama 2 — uygulama notları (deneme-emekci)
- **Olaylar:** gün ilk `play` anında `lokDayStart` (q.ed kayıtlı; `window.HK_LOK_EVOFF = 1` rastgele olayı kapatır; `lokDayEnd` endDay'de). Kayıt alanları: `res`, `star`, `gs` (en iyi puan), `mu` (son Muhtar günü), `ed`, `rd` (son rezervasyon kartı).
  - Rezervasyon (Sv≥2, 3 gün aralık, %30): kart (DOM `#lokEvScr`, açıkken oyun durur; geri tuşu = reddet). Kabul → ertesi gün `n` (8 + 2·Sv + 0/2/4) tabak; o gün siparişler %65 o yemeğe kayar, akış ×1,3; masaya teslim edilen her tabak (iDropPlate) sayılır. Tamamlanınca ödül `n × tabak değeri × 0,9` + itibar +10; gün sonunda eksikse itibar −8. Tabelada "DÜĞÜN g/n" rozeti.
  - Muhtarın sofrası (Sv≥2, 7 günde bir, gün içinde 45–140 sn'de): 6 kişilik `muhtar` grubu (LOK_G'de gizli, `enumerable:false`). İki komşu masa (aynı sıra, koltuk ≥ 6) birleşir: `g.tb` + `g.tb2` (ikinci masa `held`). Yemek servisi sabrın %50'sinden hızlıysa itibar +6, değilse +2.
  - Gurme Eleştirmen (Sv≥3, günde %35): 1 kişilik `elestirmen` grubu; yıldız = 1 + bekleme (≤%40 sabır: +2, ≤%70: +1) + tarif çarpanı ≥ 2,2 (+1) + masa temizliği (yemek sırasında başka kirli masa ≤ 0; 6+ masada ≤ 1) (+1). `S.lok.star` son puan (tabela, lokFlow ±%10), itibar (yıldız−3)×3; sabır taşarsa 1 yıldız. 5 yıldız → başarım `lk_gurme` "Gurmenin Gözdesi".
- **Yükseltmeler** (`LOK_UP`, inşaat kimlikleri `lok_ter|lok_mez|lok_saz|lok_dol`, hepsi 1 gün): Teras Sv3 (sabır ×1,15), Meze Vitrini (ödeme ×1,10), Saz Köşesi Sv5 (yemek süresi ×1,15 = masa dönüşü −%15, ödeme ×1,25, 28–50 sn'de `melody` ile kısa saz sesi, oturan müşteri + oyuncu 16 birim içindeyken), Büyük Soğuk Dolap (`S.lok.dl`, 12 → 24). Yerler hep ayrı: meze (0,8; 26,25), saz (9,5; 28,75).
- **Balık Büfesi:** BİNA `restoran` adı Balık Büfesi / Fish Buffet; `TARIF_BUFE = 0` ile büfe tarif uygulamaz. Defter MENÜ sekmesi lokanta açıkken `S.lok.menu`'yu düzenler (yer = lokanta Sv, istasyonu kurulu tarif); lokanta yokken "Menü Sahil Lokantası'nda". Eski `S.tarif.menu` bekleme listesidir: `tarifImportMenu` (tarifLoad sonunda ve istasyon kurulunca) istasyonu kurulu olanları lokanta menüsüne taşır ve listeden düşer. Defter koşulu: büfe ya da lokanta.

## Ev seviyeyle büyür (deneme-2)
- Ön kenar (y 26, açık ocakbaşı) ve genişlik (x 15,7–23,65) sabit; arka duvar seviyeyle kuzeye gider (`LOK_HY0`, tasarım y): Sv1 22 (4 karo derin), Sv2–4 21 (5), Sv5 20,5 (5,5). Doğu kıyısına (x − y ≤ LAND_UMAX) sığar; kıyı değişmedi.
- Sv1 tek katlı ocakbaşı + kiler · Sv2 arka oda, ikinci baca, odun yığını · Sv3 hımış cumbalı üst kat + balkon · Sv4 doğu kanadı (`LOK_WING`, avlunun kuzeyi) + ikinci cumba · Sv5 çatı köşkü, görkemli tabela.
- `lokHouseR()` gerçek koordinatlı ayak izi + kanat; `lokHouseObj` çizime `lv`, `y0`, `wing` geçirir. Mutfak sipariş panosu arka duvarla gider. Doğu duvarındaki avlu kapısı sabit (`LOK_EDOOR`, tasarım y 24,7–25,5).
- Evin alanın kuzeyine taşan kısmı `layoutRects`'te hep ayrılı (en büyük hâli); altındaki manzara çizilmez (`sceneryOnDeck`). Oyuncu engelleri (arka/batı/doğu duvar, kanat) ev büyüdükçe kayar.
