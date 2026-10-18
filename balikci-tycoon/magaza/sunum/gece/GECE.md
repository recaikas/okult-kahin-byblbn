# Gece: "Lambanın Gömleği Yanana Kadar"

Üç tasarımcının (oynanış, hikâye ve atmosfer, ekonomi) tartışmasından çıkan ortak tasarım. Ayrıntılar `oynanis.md`, `atmosfer.md`, `ekonomi.md` dosyalarında.

## Tek cümle
Gündüz limanda iş yaparsın. Gece limanın öbür yüzü açılır: ay karanlığında ışıkçı kayığıyla denize çıkarsın, dolunayda kahvehanede söylenti dinlersin. Gece isteğe bağlıdır, 1–2 dakika sürer ve sabaha küçük ama hissedilir bir iz bırakır.

## Tartışmada ne konuşuldu

| Konu | Oynanış | Hikâye ve atmosfer | Ekonomi | Karar |
|---|---|---|---|---|
| Ana mekân | Işıkçı kayığı (gece hamsi avı) | Işıkçı kayığı; kahvehane ve höyük de var | Kahvehane ve fener; gece avını tehlikeli buldu | Işıkçı kayığı ana mekân, kahvehane ikinci |
| Gece ne üretir | Sabah hazır balık kasası (+%15–20) | Bilgi, yankı, ilişki | Para değil "İtimat" (+%5–8) | İkisi birden, toplam tavan %8–10 |
| Zorunlu mu | Hayır, UYU cezasız | Hayır | Hayır, varsayılan "Sabaha geç" | Hayır; atlamak hep ücretsiz |
| Süre | 2–3 dk | Kısa, tek ışık | 60–90 sn | 60–120 sn |
| Kaçakçılık | Yok | Motorcu Rüstem; itibar yer | Döngü değil, tek seferlik hikâye seçimi | Tek seferlik hikâye seçimi |

**Ana anlaşmazlık:** Gece avı ikinci bir para mesaisine dönüşür mü?
- Ekonomi tasarımcısı: dönüşür; oynamayan geride kalır.
- Oynanış tasarımcısı: dönüşmez, çünkü av sabah hasıra gelir ve kesim kapasitesiyle sınırlıdır.

**Çözüm:** Işıkçı avı kalır ama sabaha getirdiği balık "gündüz gelirinin en çok %6'sı" ile sınırlanır. Asıl değeri para değil:
- nadir türler,
- yunusla bağ,
- hikâyenin yankısı.

Kahvehanenin İtimat'ı da en çok %4 avantaj verir. Toplam avantaj %10'u geçmez.

## Ay takvimi: hangi gece nereye
Gerçek bir ayrıntıdan yola çıkıyor: dolunayda ışıkçı denize çıkmaz, çünkü ay ışığı lambayı bastırır. Böylece oyun takvimi kendiliğinden oluşur.
- **Ay karanlığı ve hilal:** ışıkçı kayığı.
- **Dolunay:** Liman Kahvesi.
- **Hikâyenin 6. gününden sonra:** her hafta bir gece höyükte Alp Er Tunga'nın nöbet ateşi açılır.
- **Haşmet Bey'in geldiği günün arifesi:** kahvehanede Haşmet'in gece hâli görülür. Yorgun, tek duble içen, tavlada yenilen bir adam; erken ödeyene ipucu verir.

## Mekânlar ve döngüleri

### 1. Işıkçı kayığı (ana mekân)
- **30 saniye:** Ekran karanlık, yalnız lambanın halkası görünür. Başparmakla lambayı sürüye doğru sürüklersin, gümüş kıvrım ışığa dolar. Bırakınca ağ atılır ve ritimle çekilir.
- **Bir gece:** İki av noktasından birini seçersin (yunus ya da söylenti ipucu verir). 1–3 çekiş yaparsın. Bekçi Nuri'nin üç düdüğü gece yarısıdır; "lambanın gömleği yandı" sözü de gecenin sonudur.
- **Günler boyunca:** Lamba karbürden lükse, lüksten jeneratöre yükselir. Yeni noktalar açılır. Nadir türler çıkar (lüfer, kalkan, barbun). Yunus güveni büyür.
- **Sabaha kalan:** Hasırda hazır kasalar olur (tavanlı). Nadir tür tezgâhta pahalı satılır.

### 2. Liman Kahvesi (dolunay geceleri)
- Tek çıplak ampul, tavla zarı, radyoda *Arkası Yarın*, çalınmadan akort edilen kemençe.
- Söylenti dinler, tavla oynar, kalan ürünü ikram edersin. Kazancın **İtimat** olur: tavan 12, zamanla erimez, parayla alınıp satılamaz.
- İtimat ertesi gün şunlara harcanır:
  - söylentiye güven: fiyat +%15,
  - Haşmet'e çay: vergi −%8,
  - kooperatif kefaleti: borcun katlanması bir hafta ertelenir, borç silinmez,
  - müdavim daveti.

### 3. Höyük ve nöbet ateşi (hikâyenin 6. gününden sonra)
Kehribar ışıklar, tek telli kopuz. Alp Er Tunga bir dize söyler, ateşe odun attırır. Kısa ve şiirsel bir ara; Bereket ölçerine küçük bir katkı yapar.

## Hikâyeyle ilişki
- **Gece yeni sır açmaz, gündüzün yankısıdır.** Şahmeran gece asla görünmez; yalnız dipte bir parıltı ve bir ses olarak vardır.
- **Seçimler gece görünür.** 10. günde söz bozulursa kahvede kemençe susar, kayığa yunus gelmez. Söz tutulursa yakamoz lambanın halkasından taşar.

## Gün sonu kartı
İki eşit düğme var: **DENİZE ÇIK** (ya da dolunayda **KAHVEYE UĞRA**) ve **SABAHA GEÇ**. Varsayılan "Sabaha geç"; atlayan hiçbir şey kaybetmez.

## İlk sürüm (2–3 hafta)
1. Gün sonu kartına iki düğme.
2. Işıkçı kayığı: `story.js` sahne motorunda tek sahne, üç aşama (nokta seç → lambayla topla → ağı ritimle çek).
3. Sonuç: tavanlı kasa ve %10 nadir tür ihtimali. Lamba yükseltmesi 3 seviyeli.
4. Gece müziği: lambanın fısıltısı, dalga sesi ve ney.
5. `test-gece.js`.

**Başarı ölçüsü:** Oyuncuların %40'ından fazlası ikinci gece de çıkarsa kahvehane (İtimat) ve höyük eklenir.

## İlk gece (senaryo taslağı, atmosfer tasarımcısından)
```
[Siyah. Lüks lambası fısıldayarak yanar. Turuncu halka, ortasında kayık.]
REİS: Ay yok bu gece. Hamsi ışığı sever evlat, insanı değil. Sus da gelsin.
[Halkanın kıyısında yakamoz kıpırdar. Sürü, gümüş bir kıvrımla ışığa dolar.]
REİS: Gördün mü? Işığı biz yaktık ama gelen bizim değil. Ödünç.
[Sudan bir nefes. Yunus halkaya girer, oyuncuya bakar, dalar.]
DİPTEN BİR SES (yalnız altyazı, ney üstünde): "Ödünç alan, söz verir."
[Höyüğün üstünde bir an kıvılcım parlar, söner. Uzaktan üç düdük: gece yarısı.]
REİS: Lambanın gömleği yanmadan dön. Sabah Haşmet var.
```
