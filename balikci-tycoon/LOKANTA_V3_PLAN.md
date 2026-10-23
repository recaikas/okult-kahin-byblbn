# Sahil Lokantası v3 — plan (yalnız `deneme-2`)

Kullanıcı kararları (2026-10-22):
- **Hizmet Sahası kalkar** (5 parsel, 5 hizmet binası: Buzhane, Balık Büfesi, Nakliye Ofisi, Kooperatif, Mezat Salonu ve mekanikleri). Etkileri **taşınmaz** ("yalnız kaldır"); denge sonra ayarlanır. Eski kayıtta kurulu binaların bedeli kasaya iade edilir (mevcut `SERV_GONE` göçü).
  - Binaların açtığı kilitler (turist müşteri, toptancı, şirket kontratları) bina şartı olmadan kendi seviye koşullarıyla gelir; yoksa oyundan tümden kaybolurlardı.
- **BİNA sekmesi → PERSONEL sekmesi.** YÜKSELT'teki bölge personeli kartları, müdür ve otomasyon (personele devret) kartları buraya taşınır. YÜKSELT'te oyuncu gelişimi ve hayvanlar kalır.
- **Lokanta boşalan sahaya yayılır:** eski saha (x 15–23,8) ile bugünkü lokanta alanı (x 26–36) birleşir. Mutfak ve dolap batıda, teras ve süs köşeleri doğuya yayılır, masalar aralıklı dizilir; giriş yoldan.
- **Eşya kademeleri (tip + boyut):** her yükseltme görünümü ve boyutu değiştirir.
  - Tava: tek tava → çift gözlü ocak → döküm sanayi ocağı
  - Izgara: küçük mangal → uzun mangal → davlumbazlı ocakbaşı
  - Kazan: tencere → büyük kazan → çift kazan
  - Fırın: küçük taş fırın → kubbeli fırın → büyük odun fırını
  - Dolap: buzluk (12) → çift kapılı (24) → soğuk oda kapısı (36)
  - Meze: tezgâh üstü cam kutu → buzlu vitrin → uzun teşhir tezgâhı
  - Masa: tahta masa → örtülü masa → şemsiyeli ahşap masa
- **Süsler:** çok sayıda; her biri ayrı satın alınır, etkisi küçük ama toplamı müşteri sayısında ve memnuniyetinde hissedilir. Temel eşyalar (masa örtüsü, sandalye, masa, giriş kapısı, menü tabelası) geliştirmeyle sade → lüks ilerler. Evin seviyeyle kendiliğinden gelen süsleri (çiçeklik, fener, köşk, biber dizisi) satın alınan süslere dönüşür.

## Aşamalar
1. **Hizmet Sahası'nı kapat + PERSONEL sekmesi** (mimar): `SERV_OFF` bayrağı; hizmet listesi boş, binalar `SERV_GONE` ile iade; saha zemini/parseller/tabela/yayalar çizilmez; parseller yerleşimde ayrılı değil; kilitler serbest. BİNA düğmesi PERSONEL olur; kartlar taşınır. Testler uyarlanır.
2. **Lokanta yeni alana taşınır** (mimar + sanatçı): birleşik alan, yeni yerleşim (mutfak evi, dolap, pass, istasyon yerleri aralıklı, masa ızgarası geniş), giriş patikası, duvarlar, personel/müşteri yolları, kamera, `layoutRects`, manzara. Dünkü "ev arkaya uzar" büyümesi yeni yerleşime uyarlanır ya da sadeleşir.
3. **Eşya kademeleri** (mimar: veri + etkiler; sanatçı: her kademenin çizimi, ince + klasik).
4. **Süsler** (mimar: liste, fiyat, etkiler, LOKANTA › SÜSLER; sanatçı: çizimler).
5. **Denge + bot testi**, ölü kodun temizliği (saha), `deneme-emekci` → `main` taşıma.

## Aşama 2 — yerleşim (gerçek dünya koordinatı; LOK_OX = LOK_OY = 0)
- **Alan** (`AREAS[4]`): x 15–36, y 13,2–23,6 (21 × 10,4). KD köşesi doğu kıyısına (x − y ≤ 22,8) tam sığar; Şeref Panosu (y ≤ 12,85), İlan Bürosu, depo kanatları ve meydanla çakışmaz.
- **Mutfak evi**: x 15,6–27,2, y 13,5–16,9 (11,6 × 3,4), önü (y 16,9) açık ocakbaşı, güneye (denize) bakar. Arka kapı (18,1; 13,5) saha patikasının (YARDPATH) ucunda: personel meydandan doğrudan mutfağa girer.
- **Ön sıra** (y 16,35; aşçı arkada y 15,6; oyuncu önden y 17,3): dolap x 16,5 · tava 18,6 · ızgara 20,4 · kazan 22,2 · fırın 24,0 (aralık 1,8; en büyük kademe ≤ 1,4 geniş) · pass 26,0.
- **Bulaşıkhane**: evin doğusunda küçük ek (x 27,2–28,8); bulaşık tezgâhı (28,2; 15,4), önü (28,2; 16,45).
- **Teras**: y 16,9–23,6. Kapı batı duvarında (x 15, y 19,8–21,0); kasa (15,9; 18,0), menü tahtası (15,7; 22,3). Müşteri yoldan (x ≈ 13,4) iner, kapının önünde (yol kenarı x 14,3) kuzeye doğru sıraya girer.
- **Masalar**: 12 masa = 2 sıra × 6 sütun; sıralar y 18,9 ve 21,9 (yürüme şeridi y − 0,9), sütunlar x 18,2 / 21,0 / 23,8 / 26,6 / 29,4 / 32,2 (aralık 2,8). İlk açılan masalar pass'e en yakın olanlar.
- **Bahçe** (KD: x 28,8–36, y 13,2–16,6): süs köşeleri (saz, akvaryum, çardak…; Aşama 4). Meze vitrini teras KD'de (30,6; 17,4).
- **Duvarlar**: teras alçak duvarı güney (y 23,6), doğu (x 36), batı (x 15, kapı boşluklu); bahçe çiti kuzey (y 13,2); evin arka/batı/doğu duvarı (arka kapı açık).
- **Yollar**: personel meydandan YARDPATH → arka kapı; Mutfak iskelesinden güney koridoru → kapı. `LOKWALK` = sıra şeridi (x 13–15,2, y 15,5–21,2) + arka kapı geçişi + koridor.
- Ev seviyeyle büyümesi: arkaya uzama ve doğu kanadı kalkar (yeni yerleşimde gereksiz); Sv3'te üst kat kalır; köşk, fener, çiçeklik gibi parçalar Aşama 4'te satın alınan süslere dönüşür.
