# Restoran Menüsü, Modüler Depo, Reklam Ofisi — deneme tasarımı (yalnız `deneme-emekci`)

Kullanıcı kararları:
- Tarif Defteri restorana bağlanır.
- Depo tek bina olur, modül modül büyür.
- Reklam süreleri oyun günüyle ölçülür.

Her yeni bina ve seviye İnşaat kuralına uyar: L. seviye L oyun günü sürer. Tüm metinler TR ve EN.

## A. Restoran Menüsü (Tarif → Restoran)
- **Güveç Ocağı tezgâhlardan kalkar.** YAPI › Geliştirme'deki ocak kartları ve dünyadaki ocaklar gösterilmez; kod `TARIF_STALL = 0` bayrağıyla kapatılır, silinmez.
  - Eski kayıtta kurulu ocak varsa bedeli bir kez iade edilir. Toast: "Güveç Ocakları restorana taşındı, bedeli iade edildi."
  - Tezgâh rafındaki `it.dish` mallar normal fileto olur.
- **Açılış:** Tarif Defteri, ilk Restoran kurulunca (inşaat bitince) açılır; Fümehane koşulu kalkar. HUD 🍲 düğmesi de o zaman görünür.
- **Defter sekmeleri:** TARİFLER / DENE / KİLER / **MENÜ**. OCAKLAR sekmesinin yerini MENÜ alır.
- **Menü yerleri:** bütün restoranlar için ortak bir menü vardır. Yer sayısı = en yüksek restoran seviyesi (1–5). Her yere bilinen bir tarif konur.
- **Pişirme:** mevcut restoran döngüsü (`ivl`, `cook`, `cmul`) aynen çalışır. Restoran fazla bir malı (balık f) aldığında:
  - Menüde f balığının tarifi var ve kilerde malzemesi var → malzeme harcanır, satış değeri `val × cmul × tarif çarpanı` olur.
  - Restoranın üstünde tabak simgesi ve "🍲 Hamsi Tava +$x" yazısı uçar.
  - Yoksa eski davranış sürer: `val × cmul`.
- **Reis Güveci:** restoranla birlikte bilinir. Balıktan bağımsız, her malı ×1,3 yapar; malzemesi soğandır.
- **Kiler:** sınır 50; depoda Kiler bölmesi varsa 100.
- **BİNA kartı:** restoran kartında "Menü: Hamsi Tava, Levrek Buğulama…" satırı.
- **Testler:** `test-tarif.js` yeni akışa göre güncellenir.
  - Restoran yokken defter kilitli.
  - Menüye tarif atanır; restoran pişirince kiler azalır, kazanç çarpanlı.
  - Eski ocaklı kayıtta iade.

## B. Modüler Depo
Mevcut `DEPOT` (meydan KD, x 20, y 1.4) ve `DEPOT_LV` korunur; seviyeler artık **bölme** ekler. Bölmeler meydanın doğusundaki boşluğa, binanın yanına eklenerek dizilir. Yeni yerleşim `layoutRects`'e girer, çakışma olmaz.

| Sv | Bölme | Etki | Bedel (mevcut ölçeğe uydur) |
|---|---|---|---|
| 1 | Ham Balık Ambarı (ana bina) | ham balık 30 | 3.000 |
| 2 | Soğuk Oda | fileto ve füme 30 | 8.000 |
| 3 | Kiler | kiler sınırı 100 (tarif malzemeleri) | 20.000 |
| 4 | Ambar Uzantısı | ham +50, soğuk +30 | 45.000 |
| 5 | Sevkiyat Rampası | toptan satışta +%10 fiyat, günde 1 ek parti | 90.000 |

- **Depo Hamalı:** her bölme bir Depo Hamalı yeri açar. Mevcut `depocu` rolü bu olur; işe alma sınırı bölme sayısı.
  - Hamal tezgâh ve masa doluyken ağ sandıklarındaki fazla ham balığı Ambara taşır.
  - Tezgâh doluyken hasırdaki fazla filetoyu Soğuk Oda'ya taşır.
  - Mevcut `sevkiyat` rolü aynen kalır.
- **Ticaret Ofisi › TOPTAN sekmesi:** Ambardaki ham balık 10'luk partilerle `FISH.val × 0,6 × günlük kur` fiyatına satılır; Soğuk Oda'daki fileto ve füme ×0,8 ile.
  - Günlük kur 0,8–1,2 arasında, gün başında belirlenir. Ekranda "Bugün hamsi toptan: $x ↑" gibi görünür.
  - Günde en çok 3 parti, rampayla 4.
- **Kayıt:** `DEPOT.raw` / `DEPOT.cold` ayrılır. Eski `shelf` içeriği türüne göre ikisine dağıtılır.
- **Çizim:** her bölme ayrı bir kanat (çatı rengi ayrı). İnce mod kancası `HKA.drawDepotWing(o)`; çizimini ana sanatçı yapar.

## C. Reklam Ofisi (meydan binası)
YAPI › Meydan'da yeni bina: **İlan Bürosu** / **Ad Bureau**. Üç seviyesi var; her seviye yeni seçenek açar. Binanın önünde durunca ya da kartından açılan bir panelden reklam seçilir.

- **Kural:** Aynı anda 1 reklam yayında olur; 3. seviyede 2.
- **Fiyat:** taban × (1 + 0,4 × itibar seviyesi). Pahalı ama etkili.
- **Etki:** tüm bölgelere uygulanır.
- **Gösterge:** HUD'da küçük "📣 2 gün" rozeti.

| Sv | Reklam | Süre | Taban | Etki | Dünyada görünüş |
|---|---|---|---|---|---|
| 1 | Tellal | 1 gün | 1.500 | müşteri +%15 | yolda zilli tellal dolaşır, bağırır |
| 1 | Kahvehane Afişi | 2 gün | 3.000 | müşteri +%10, sabır +%10 | yol panosunda afiş |
| 2 | Liman Gazetesi İlanı | 2 gün | 6.000 | müşteri +%25 | gazeteci çocuk ilan dağıtır |
| 2 | Dolmuş Arkası Yazısı | 3 gün | 8.000 | yol müşterisi +%30 | yoldan yazılı dolmuş geçer |
| 3 | Bölge Radyosu | 3 gün | 18.000 | müşteri +%40 | büro üstünde hoparlör, kısa cıngıl |
| 3 | Panayır Standı | 1 gün | 12.000 | müşteri ×2, turist gelir | meydanda bayraklar |

- **Yol panosu:** mevcut yol panosu (billboard) yayındaki reklamın afişini gösterir; boşken "İLAN VERİN" yazar. Böylece pano işe yarar.
- **Tellal replikleri:** 12 tane, TR ve EN; ör. "Taze hamsi geldi! Koşun, kaçırmayın!".
- **Kayıt:** `S.ads = [{id, left}]`, `S.adLv`.
- **Çizim:** Klasik çizim game.js'te. Kancalar `HKA.drawAdBureau(o)`, `HKA.drawTellal(o)`, `HKA.drawAdPoster(o)`; ince çizimleri ana sanatçı yapar.

## Sıra
1. A ve B paralel, ayrı dallarda; sonra birleştirme.
2. C.
3. İnce çizimler: iskele/inşaat, depo kanatları, büro, tellal, afiş.
