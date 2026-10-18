# Liman Gazetesi Özel Sayı — tasarım (v2.16)

Kullanıcıyla birlikte verilen kararlar:
- **Geliş:** gazeteci çocuk getirir.
- **Dönüm noktaları:** önerilen 5'li set.
- **Kalıcı iz:** meydanda çerçeveli manşetlerin asıldığı "Şeref Panosu".
- **Arşiv:** menüde "Gazeteler" sekmesi.

## 1. Dönüm noktaları (5)

| id | Ne zaman | Gazeteci ne zaman gelir |
|---|---|---|
| `ilkgun` | 1. günün sonu (`endDay`, `day.n===1`) | Ertesi sabah (sabah gazetesi) |
| `pazar` | 2. bölge (Balık Pazarı, `AREAS[1]`) açıldığında | Gün içinde, 4–8 sn sonra ("son dakika") |
| `hasmet` | İlk vergi ziyareti oyun bitmeden kapandığında (`taxClose`, `!TAX.over`, ilk kez) | Memur limandan çıktıktan sonra |
| `mudur` | İlk müdür atandığında (`progEv('mudur')` noktası) | Gün içinde |
| `bolum1` | Bölüm 1 sonu (`openChapterEnd`) | Mevcut 3 sayfalık gazete aynen kalır; yalnız arşive ve panoya eklenir, gazeteci gelmez |

Kurallar:
- Günde en çok bir özel sayı; fazlası kuyrukta bekler, ertesi gün gelir.
- Hikâye sahnesi açıkken, hikâye ziyaretçisi ya da yunus beklerken, Haşmet limandayken gazeteci gelmez; bekler.
- Gazeteci yalnız `day.phase==='play'` iken gelir.

## 2. Gazeteci çocuk
- Müşteri yolundan koşarak gelir (Haşmet'in giriş noktası gibi, ör. `x:13.6, y:22.5`). Oyuncunun yanına (1,2 karo ötesine, `canStand` olan bir noktaya) gelir, gazeteyi yere atar, geri koşar.
- Görünüş `drawPerson` + kendi giysisi: kasket, kısa pantolon, omzunda gazete çantası, elinde katlı gazete.
- Bağırır (konuşma balonu, TR/EN): "Son dakika! Liman Gazetesi özel sayı!" Sabah gazetesinde: "Gazeteee! Liman Gazetesi!"
- Yerdeki gazete: katlı, kırmızı mühürlü, parlayan küçük bir nesne. Üstünde "Özel sayı!" etiketi var, ara sıra hafifçe zıplar.
- Oyuncu üstünden geçince (`dist2 < 0.9`) gazete açılır.
- Gün sonuna kadar alınmazsa `endDay`'de gün sonu kartından ÖNCE kendiliğinden açılır; kapanınca gün kartı gelir.

## 3. Gazetenin içeriği
Tek sayfalık, mevcut gazete motoru: `openIntro(then, [sahne])`.
- **Fotoğraf:** dönüm noktası anında `takeHarborSnap()` ile çekilen gerçek liman. Sepyadan renge döner (mevcut `snap` davranışı). Fotoğraf küçük JPEG dataURL olarak kayıttan ayrı bir anahtarda saklanır (`balikci_gz_<yuva>_<id>`). Arşivden yeniden okunurken bu fotoğraf kullanılır; yoksa `harbor` resmi.
- **Tarih:** `day.n + '. GÜN'` / `'DAY ' + day.n`.
- **Manşet:** gerçek rakamlarla (`{c}` şirket adı büyük harf, `{n}` toplam müşteri, `{d}` gün, `{v}` tutar, `{m}` müdür adı).
- **Alt yazı (sub):** önce manşetin hikâyesi (bir cümle), sonra karakterden bir alıntı, sonra Haşmet Bey'in mizah köşesi.

Metinler (TR / EN):
- **ilkgun**
  - Manşet: `{c} KAPILARINI AÇTI: İLK GÜN {n} MÜŞTERİ` / `{c} OPENS ITS DOORS: {n} CUSTOMERS ON DAY ONE`
  - Alt yazı: `Dedemin iskelesi yeniden nefes aldı. Temel Dede: "Bu iskele yıllardır böyle gülmemişti." Haşmet Bey'in köşesi: "İlk gün mü? Ben defterimi çoktan açtım."` / `Grandpa's pier breathes again. Grandpa Temel: "This pier hasn't smiled like this in years." Mr. Haşmet's corner: "Day one? I've already opened my ledger."`
  - Altyazı (caption): `▲ İlk günün akşamı` / `▲ The evening of day one`
- **pazar**
  - Manşet: `BALIK PAZARI AÇILDI! {c} {d} GÜNDE {n} MÜŞTERİYE ULAŞTI` / `FISH MARKET OPENS! {c} REACHES {n} CUSTOMERS IN {d} DAYS`
  - Alt yazı: `Uskumru tezgâhları kuruldu, kuyruk iskeleyi aştı. Hacer Teyze: "Bu çocuk dedesine çekmiş." Haşmet Bey'in köşesi: "Pazar büyüdü, defterim de."` / `Mackerel stalls are up and the queue runs past the pier. Aunt Hacer: "This boy takes after his grandpa." Mr. Haşmet's corner: "The market grew, and so did my ledger."`
  - Altyazı: `▲ Balık Pazarı'nın ilk günü` / `▲ The fish market's first day`
- **hasmet**
  - Manşet: `HAŞMET BEY GELDİ, GİTTİ: {c} İLK VERGİSİNİ ÖDEDİ ({v})` / `MR. HAŞMET CAME AND WENT: {c} PAYS ITS FIRST TAX ({v})`
  - Borç oluştuysa: `HAŞMET BEY GELDİ, GİTTİ: {c} AYAKTA, AMA DEFTERDE BORÇ VAR` / `MR. HAŞMET CAME AND WENT: {c} STANDS, BUT OWES THE LEDGER`
  - Alt yazı: `Müşteriler kaçıştı ama liman yerinde duruyor. Kalender: "Haşmet geldi, gitti; biz hâlâ buradayız!" Haşmet Bey'in köşesi: "Haftaya yine buradayım. Hah hah haaa!"` / `Customers scattered, but the harbour still stands. Kalender: "Haşmet came and went; we're still here!" Mr. Haşmet's corner: "See you next week. Ha ha haaa!"`
  - Altyazı: `▲ Vergi gününün akşamı` / `▲ The evening of tax day`
- **mudur**
  - Manşet: `{c} İLK MÜDÜRÜNÜ ATADI: {m}` / `{c} APPOINTS ITS FIRST MANAGER: {m}`
  - Alt yazı: `Bundan sonra tezgâhın başında bir müdür var. Temel Dede: "İş büyüyünce omuz da büyür." Haşmet Bey'in köşesi: "Müdür mü? Pazarlığa hazırım."` / `From now on a manager runs the stall. Grandpa Temel: "When the work grows, so do the shoulders." Mr. Haşmet's corner: "A manager? Ready to haggle."`
  - Altyazı: `▲ Yeni müdür iş başında` / `▲ The new manager at work`

Manşet uzun olabilir; gazete motoru `pxWrap` ile satırlara böler. Şirket adı yoksa `HAMSİ KOYU` kullanılır.

## 4. Paylaş
- Özel sayı (ve arşivden açılan her gazete) ekranında, "devam" düğmesinin yanında bir **PAYLAŞ** düğmesi.
- 1080×1920 görsel üretilir:
  - koyu tahta zemin ve üstte-altta kilim şeridi,
  - ortada gazete sayfası (`intro.pc`, en yakın komşu büyütme),
  - altta "HAMSİ KOYU · Karadeniz'de bir balıkçı limanı" ve oyunun adresi.
- **Web:** `navigator.canShare({files})` varsa `navigator.share({files:[png], title, text, url})`; yoksa PNG indirilir.
- **Mobil (Capacitor):** şimdilik aynı web yolu. Yerel paylaşım eklentisi mağaza sürümünde (not düş).
- Paylaşım metni (TR/EN): `Liman Gazetesi'nde manşet oldum! Hamsi Koyu'nu sen de oyna:` / `I made the Harbour Gazette headlines! Play Hamsi Koyu too:`

## 5. Şeref Panosu (meydan)
- Meydanda (`MEYDAN` dikdörtgeni içinde, `layoutClashes` ile çakışmayan bir yerde) tahta bir pano. İlk özel sayıdan sonra görünür.
- Panoda 5 çerçeve yeri var; alınan her özel sayı (ve Bölüm 1 sonu) için küçük sepya manşet minyatürü. Boş yerler soluk çerçeve.
- Oyuncu yaklaşınca etiket: "Şeref Panosu · 3/5" / "Wall of Fame · 3/5".
- Yalnız görüntü; denge etkisi yok.
- Klasik çizim `game.js`'te. İnce çizim sonra sanatçı tarafından `art/nesne.js`'e `HKA.drawFamePano` olarak eklenecek; `hook()` listesine ekle.

## 6. Arşiv: menüde "Gazeteler" sekmesi
- Duraklatma menüsünde yeni sekme: `GAZETELER` / `NEWSPAPERS`. Satırlar:
  - açılış gazetesi (her zaman),
  - 4 özel sayı,
  - Bölüm 1 sonu (`S.ch1` ise).
- Her satırda tarih (gün), manşet, OKU ve PAYLAŞ düğmeleri.
- Henüz gelmemiş olanlar kilitli: "?????".
- Kaçırılanlar (eski kayıtta zaten geçilmiş) soluk ve "Bu sayı kaçırıldı" yazılı; okunamaz.
- İlk girişte ipucu kartı (`HELP.m_gazete`, TR/EN).

## 7. Kayıt
- Yeni alan `S.gz = { got: {id: gün}, miss: {id:1}, q: [id], st: {id: {n, d, v, m, c, debt}} }`.
  - `q`: henüz okunmamış, sırada bekleyen sayılar.
  - `st`: manşetin rakamları; arşivden yeniden açınca aynı manşet çıksın.
- `buildSave` ve `loadFrom` ile yazılıp okunur, `gzLoad` ile doğrulanır (`taxLoad` örneği).
- Fotoğraflar ayrı anahtarda: `Store.set('balikci_gz_' + curSlot + '_' + id, dataURL)`. `deleteSlot` bunları da siler.
- **Eski kayıt** (`S.gz` yok): halihazırda geçilmiş dönüm noktaları `miss` olarak işaretlenir, gazete gelmez.
  - `ilkgun`: `day.n > 1`
  - `pazar`: `!AREAS[1].locked`
  - `hasmet`: `taxQ().n > 0`
  - `mudur`: herhangi bir müdür var

  Bölüm 1 sonu `S.ch1` ile zaten arşivde.
- Oyun sonu (Liman Battı) kaydı siler; `gz` anahtarları da silinmeli.

## 8. Testler
`test-gazete.js`:
1. Yeni oyun: 1. günü bitir; 2. gün sabahı gazeteci gelir, gazete yere düşer; oyuncu üstüne gelince açılır, manşette gerçek müşteri sayısı yazar; kapanınca kuyruk boşalır.
2. Gün içi dönüm noktası (2. bölgeyi aç): gazeteci 4–8 sn içinde gelir.
3. Hikâye sahnesi ya da Haşmet varken gelmez, sonra gelir.
4. Gün sonuna kadar alınmazsa gün kartından önce açılır.
5. Kayıt ve yükleme (`got`/`st` korunur). Eski kayıtta `miss` işaretlenir, gazete gelmez.
6. Arşiv sekmesi: satırlar, OKU yeniden açar, kaçırılan okunamaz.
7. PAYLAŞ: görsel 1080×1920 üretilir (dataURL boyutu kontrolü); share yoksa indirme yolu hata vermez.
8. Şeref panosu: çerçeve sayısı alınan sayı kadar, `layoutClashes` yeni çakışma yok.

Mevcut testler bozulmamalı: test-ince, test-world-render, test-borc, test-story, test-fazD, test-ipucu, test-playthrough.
