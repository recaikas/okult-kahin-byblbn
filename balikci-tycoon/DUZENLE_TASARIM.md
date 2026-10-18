# Dekor Düzenleme Modu (Clash of Clans tarzı) — tasarım

Kullanıcı kararları:
- **Taşınabilenler:** satın alınan süsler ve (ileride) lig hediyeleri. Üretim istasyonları ve binalar sabit.
- **Konulabilecek yerler:** kum, meydan ve yol kenarı. İskele üstü serbest kalır; müşteri ve personel yolları asla kapanmaz.
- Lig hediyeleri (haftalık lig, 30 limanlık kıyı grubu, puan = haftalık kazanç) ayrı bir işte gelecek. Bu iş, hediye süslerinin de girebileceği genel sistemi kurar.

## Akış
1. YAPI › Dekor alt sekmesinin başında bir **✥ DÜZENLE** kartı var (TR "DÜZENLE" / EN "ARRANGE").
2. Düzenle modu açılınca:
   - oyun duraklar (müşteri ve personel durur),
   - alt çubuk gizlenir,
   - üstte ince bir şerit çıkar: "Süsü sürükle · BİTTİ" / "Drag a decoration · DONE",
   - zeminde yerleştirilebilir alanlar hafif bir ızgarayla gösterilir.
3. Her taşınabilir süsün altında ayak izi (izometrik eşkenar dörtgen) görünür.
4. Süse dokunup sürükle; süs parmağı izler, karo ızgarasına (0,5 karo) oturur. Ayak izi geçerliyse yeşil, değilse kırmızı. Bırakınca geçerliyse yerleşir, değilse eski yerine döner.
5. Boş zemini sürüklemek kamerayı kaydırır.
6. Seçili süsün yanında küçük **SANDIĞA KALDIR** düğmesi var. Süs sahneden kalkar ve Süs Sandığı'na gider.
7. Alt şeritte **SÜS SANDIĞI** düğmesi var. Sandıktaki süslerin listesi açılır; birine dokununca ekranın ortasına konur ve sürüklenir.
8. **BİTTİ**: konumlar kaydedilir, mod kapanır, oyun devam eder.
9. Pahalı alımlardaki gibi onay gerekmez; taşımak ücretsizdir.

## Kurallar
- **Taşınabilir:** `DECOR` içindeki karada duran süsler. Denizdeki `tekne` ve `fener` sabit kalır (`fixed:1`).
- **Geçerli yer:**
  - (a) Kumda, meydanda ya da yol kenarında olmalı: iskele bölgelerinin (`AREAS`) içinde ve suda olamaz. Dünyanın kum ve meydan sınırlarını çizim kodundan çıkar.
  - (b) Müşteri ve personel yürüme şeritleri ile köprüde olamaz: yol şeridi (`ROAD_VX` çevresi), `BRIDGE`, `YARDPATH`, kuyruk noktaları.
  - (c) Hiçbir binanın, parselin (`PLOTS`, `SLOTS`), meydan binasının, lambanın ya da başka süsün ayak iziyle çakışmamalı: `layoutRects` ve `layoutClashes` mantığını kullan.
  - (d) Etkileşim alanlarına girmemeli: çöp kovası testindeki istasyon çemberleri (`test-trash.js`'teki reach mantığı).
- Bir süs aynı anda yalnız bir yerde olur; sandıkta duran süs çizilmez.

## Kayıt
- `S.dpos = {id: [x, y]}`: taşınmış süslerin konumu.
- `S.dbox = [id, ...]`: sandıktaki süsler.
- Eski kayıtta bu alanlar yoktur ve süsler varsayılan yerlerinde durur.
- `loadFrom`'da doğrula: konum yine geçerli değilse varsayılana dön. Kayıt biçimi geriye uyumlu kalmalı.
- `buildSave`'e ekle.

## Genel hediye kancası (lig için)
- `DECOR` girdisine `gift: 1` ve `buy: false` desteği ekle: mağazada satılmaz, yalnız hediyeyle gelir.
- `giftDecor(id)`: süsü sahip olunanlara ekler (`got = true`), Süs Sandığı'na koyar, "Hediye geldi! Süs Sandığı'na bak" bildirimi gösterir (TR/EN).
- Şimdilik bir örnek hediye süsü ekle, kodda kullanılmasın: `{ id: 'ligbayrak', gift: 1, ... }`. Çizimi basit bir lig bayrağı.

## Testler (`test-duzenle.js`)
1. DÜZENLE açılınca oyun duraklar, BİTTİ ile devam eder.
2. Bir süs (ör. bank) geçerli bir kum noktasına sürüklenir (fare ile drag) ve yerleşir.
3. Kayıt/yükleme sonrası süs yeni yerindedir.
4. İskeleye, yola ya da bir binanın üstüne sürüklenen süs eski yerine döner (kırmızı).
5. SANDIĞA KALDIR süsü kaldırır; sandıktan geri konabilir.
6. `giftDecor` sandığa ekler.
7. Yerleştirmeden sonra `layoutClashes` yeni çakışma göstermez.
8. Eski kayıt yüklenir, süsler varsayılan yerlerindedir.

Mevcut testler bozulmamalı: test-layout, test-trash, test-ince, test-world-render, test-fazD, test-gazete, test-ipucu.
