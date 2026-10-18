# Hamsi Koyu — App Store yayın dosyası (v2.15)

Bu dosya, Hamsi Koyu'nun iPhone sürümünü App Store'a göndermek için gereken bütün metinleri, beyanları ve adımları tek yerde toplar. Kaynaklar: `README.md` (v2.15 sürüm notları), `privacy.html`, `terms.html`, `support.html`, `game.js`, `config.js`, `native.js`, `mobile/` (Capacitor 8) ve mevcut `store/` paketi.

**Nasıl okunur**
- `[SEN]` yalnız senin yapabileceğin iş (hesap, ödeme, imza, beyan, hukuki onay).
- `[HAZIR]` depoda hazır ve kaynaktan doğrulandı.
- `[DOĞRULA]` kaynaktan emin olunamayan ya da senin son kararını gerektiren nokta. En sonda toplu liste var (bölüm 8).
- Bu dosya, `MAGAZA.md` (v1.8) ve `store/text/appstore.md` (ilk sürüm metni) ile çeliştiği yerde **koddan doğrulanan v2.15 durumunu** esas alır. En önemli fark: veri izni artık zorunlu değil, giriş kartında seçmeli (bölüm 3).
- Karakter sayıları Python ile NFC normalizasyonuyla sayıldı; App Store Connect sayacı Türkçe harflerde farklı sayabilir. Tüm alanlar sınırın altında (en sıkı olanlar: TR anahtar kelimeler 99/100, EN tanıtım metni 166/170); yapıştırınca sayacı yine de kontrol et.

---

## 1. Uygulama bilgileri

| Alan | Değer | Not |
|---|---|---|
| Uygulama adı (TR) | `Hamsi Koyu: Balıkçı Tycoon` (26 / 30) | Alt başlıkla birlikte aranır. Ad başka bir uygulamada alınmışsa "Hamsi Koyu" (10) ya da "Hamsi Koyu: Balıkçı Limanı" denenebilir. [DOĞRULA] |
| Uygulama adı (EN) | `Hamsi Koyu: Fishing Tycoon` (26 / 30) | |
| Alt başlık (TR) | `1974 Karadeniz balıkçı limanı` (29 / 30) | |
| Alt başlık (EN) | `1974 Black Sea fishing harbor` (29 / 30) | |
| Bundle ID | `io.github.recaikas.hamsikoyu` | `capacitor.config.json` ve Xcode `PRODUCT_BUNDLE_IDENTIFIER` ile aynı. İlk yüklemeden sonra değişmez. [HAZIR] |
| Cihaz | Yalnız iPhone | `TARGETED_DEVICE_FAMILY = 1`. En düşük iOS 15.0. Dikey (portrait) kilitli. [HAZIR] |
| SKU | `hamsikoyu-ios` (öneri) | İç kullanım, sonradan görünmez. |
| Birincil dil | Türkçe | İngilizce (U.S.) yerelleştirme olarak eklenir; en-GB için U.S. metni kopyalanabilir. |
| Birincil kategori | Oyunlar › Simülasyon (Games › Simulation) | |
| İkincil kategori | Oyunlar › Gündelik (Games › Casual) | Alt tür olarak ikincisi: Strateji de olabilir. Kids kategorisini **seçme**. |
| Fiyat | Ücretsiz | Uygulama içi satın alma **yok**, reklam **yok** (aşağıda doğrulandı). |
| Telif hakkı satırı | `2026 recaikas` | Yasal adınla değiştir (ör. `2026 Ad Soyad`). [SEN] |
| Destek URL | https://recaikas.github.io/okult-kahin-byblbn/support.html | TR için `#tr`, EN için `#en` eklenebilir (sayfa iki dilli). [HAZIR] |
| Pazarlama URL | https://recaikas.github.io/okult-kahin-byblbn/ | Oyunun web sürümü. [HAZIR] |
| Gizlilik politikası URL | https://recaikas.github.io/okult-kahin-byblbn/privacy.html | Sürüm 2.12, son güncelleme 2026-10-07. [HAZIR] |
| Kullanım koşulları (isteğe bağlı) | https://recaikas.github.io/okult-kahin-byblbn/terms.html | Topluluk Kuralları. App Review notunda ve açıklamada geçer. |
| İletişim e-postası | recaizade3145@gmail.com | Gizlilik ve destek sayfalarında herkese açık. |

Pages adresinin açık olduğunu yayından önce tarayıcıdan kontrol et (üç sayfa da 200 dönmeli). [SEN]

### Satın alma ve reklam kontrolü (kaynaktan)
- Uygulama içi satın alma yok: `game.js` ve `native.js` içinde StoreKit, `purchase` eklentisi ya da ödeme kodu yok (`purchase(cost…)` yalnız oyun parasıyla alışveriş). `mobile/package.json` bağımlılıkları: `@capacitor/app`, `core`, `ios`, `android`, `preferences`, `status-bar`, `@capacitor-community/in-app-review`. Ödeme eklentisi yok.
- Reklam, reklam SDK'sı, analitik SDK'sı (Firebase, Google Analytics, AdMob vb.) yok. Tek dış bağlantı: Supabase (skor tablosu) ve oyunun kendi yardım sayfaları.
- App Store Connect'te: Fiyat "Ücretsiz"; "Uygulama İçi Satın Alımlar" boş bırakılır. `terms.html` ve `support.html` de aynısını söylüyor.

### Yaş derecelendirmesi anketi için önerilen cevaplar
Apple'ın güncel anketi (4+ / 9+ / 13+ / 16+ / 18+ sonuçları). Öneri sütunu kaynaktaki içeriğe göre.

| Soru (özet) | Önerilen cevap | Gerekçe |
|---|---|---|
| Çizgi film / fantastik şiddet | Yok | Şiddet ve kan yok. Hikâyede "Kimse ölmüyor" cümlesi var; çatışma sahnesi yok. |
| Gerçekçi şiddet, silah, grafik şiddet | Yok | |
| Korku / ürkütücü temalar | Yok | Şahmeran efsanesi masalsı tonda; korku sahnesi yok. |
| Cinsel içerik, çıplaklık | Yok | |
| Küfür / kaba mizah | Yok | Oyun metni ve ad filtresi küfrü reddeder. |
| Alkol, tütün, uyuşturucu | Yok / referans yok | Kaynakta bulunmadı. |
| Gerçek kumar | Yok | Gerçek para yok. |
| Simüle kumar (kumarhane tarzı oyunlar) | Yok | Hisse al-sat ve kontratlar oyun parasıyla bir ticaret simülasyonudur, şans oyunu değil. **Vergi borcu ve "Liman Battı" oyun sonu kumar değildir**: oyuncunun kaybı kendi yönetim kararlarının sonucudur, şansa bağlı bahis yok. |
| Yarışma / ödüllü çekiliş | Yok | Skor tablosu para ya da ödül vermez. |
| Tıbbi / sağlık bilgisi | Yok | |
| Sınırsız web erişimi | Yok | Uygulama içinde serbest tarayıcı yok. Gizlilik/Kurallar sayfaları yalnız uygulamanın kendi sayfalarını açar. |
| Kullanıcı tarafından oluşturulan içerik (UGC) | **Evet** | Skor tablosunda oyuncunun yazdığı işletme/karakter adı herkese görünür. Filtre (istemci + sunucu), Bildir/Gizle, 3 bildirimde otomatik gizleme ve silme yolu var. |
| Mesajlaşma / sohbet | Yok | Oyuncular arası mesaj yok. |
| Reklam | Yok | |
| Yaş doğrulama / ebeveyn denetimi | Yok | |
| Satın alma, abonelik | Yok | |

Beklenen sonuç: **4+**. UGC cevabı sonucu 9+ ya da üstüne çıkarabilir; Apple hesapladığı sonucu gösterir, yükselirse kabul et (Kids kategorisi zaten seçilmiyor). [DOĞRULA]

---

## 2. Mağaza metinleri

Aşağıdaki metinler düz metindir (kod bloklarının içini olduğu gibi yapıştır). Sayılar: kullanılan / sınır.

### 2.1 Türkçe (tr)

**Uygulama adı** (26 / 30)
```
Hamsi Koyu: Balıkçı Tycoon
```

**Alt başlık** (29 / 30)
```
1974 Karadeniz balıkçı limanı
```

**Tanıtım metni (Promotional Text)** (150 / 170)
```
Karadeniz, 1974. Ağı at, balığı kes, tezgâhı aç. Vergi memuru Haşmet Bey yoldan geliyor, Şahmeran'ın sözü denizin dibinde. Reklam yok, satın alma yok.
```

**Anahtar kelimeler** (99 / 100; virgülle, boşluksuz; ad ve alt başlıktaki sözcükler zaten aranır; "hamsi", "koyu", "balıkçı", "tycoon" bu yüzden yazılmadı. "karadeniz" alt başlıkta da geçiyor, yer gerekirse çıkar)
```
balık,işletme,simülasyon,idle,piksel,liman,pazar,karadeniz,tezgah,restoran,nostalji,hikaye,şahmeran
```

**Açıklama (Description)** (2275 / 4000)
```
Nisan 1974, Karadeniz kıyısı. Elinde bir ağ, önünde boş bir iskele var.
Balığı tut, kes, tezgâhta sat; küçücük iskeleni personelli, müdürlü büyük bir limana çevir.
Hamsi Koyu, nostaljik piksel sanatıyla çizilmiş, Türkçe ve İngilizce, tamamen ücretsiz bir balıkçı tycoon oyunudur.

NASIL OYNANIR
• Ağın başında bekle, balık birikir. Sırtla, kesim masasına götür.
• Filetoyu tezgâha diz, müşterinin siparişini ver, kasayı topla.
• Kazandığınla yeni bölgeler aç, ağlarını yükselt, personel al.
• Hamal, filetocu, tezgâhtar ve tahsildar tamamsa müdür ata: bölge kendi kendine çalışsın.

KOYDA SENİ NELER BEKLİYOR
• Dört bölge: Balıkçı İskelesi, Balık Pazarı, Fümehane ve Balıkçı Mutfağı. Hamsi, uskumru, levrek, palamut, somon, orkinos ve mutfakta pişen Reis Güveci.
• Liman Meydanı: Personel Kulübesi, Depo, Balık Hali ve Ticaret Ofisi. Hisse al-sat, şirket kontratlarını tamamla, holdingini kur.
• Dipteki Söz: 12 gün süren, oyunun içinde yaşanan bir Anadolu efsanesi. Şahmeran'ın sözü, koyun sakinleri, ara sahneler ve sekiz farklı mini oyun. Tek gerçek seçimin 10. günde: sözünü tutarsın ya da bozarsın.
• Vergi Memuru Haşmet Bey: her yedinci gün limana gelir, tezgâh tezgâh vergi keser. Ödeyemediğin borç bekledikçe büyür; yeterince beklersen liman mühürlenir. Müdürün pazarlık edebilir, ama kasayı hazır tut.
• 69 tuhaf özel müşteri: her biri önce kendini tanıtır, adını ancak siparişini bitirince öğrenirsin. Müşteri Defteri'nde hepsini topla.
• Liman Gazetesi: 1974 baharından haberler, bölüm sonunda da senin limanının fotoğrafı.
• Pazar günleri, yoğun saatler, balık sürüleri, gemiler ve fırtınalar.
• 10 özgün müzik parçası: türkü, horon, zeybek, tango, arabesk ve daha fazlası. Müzik, efekt ve ortam sesi ayrı ayrı ayarlanır.
• İnce piksel ya da klasik görünüm; istediğin an değiştir.
• Başarımlar, bölüm hedefi ve çevrimiçi skor tablosu.

ADİL OYUN
• Reklam yok. Uygulama içi satın alma yok. Takip yok.
• Hesap gerekmez. Kayıtların cihazında durur (3 kayıt yuvası, otomatik kayıt).
• İnternetsiz de oynanır. Çevrimiçi skor tablosu ilk açılışta sorulur; istemezsen "Çevrimdışı oyna" de, hiçbir şey gönderilmez.
• Türkçe ve İngilizce.

Hamsi Koyu bağımsız bir geliştirici tarafından yapıldı. Görüşlerini oyunun içindeki görüş formundan gönderebilirsin; hepsi okunuyor.
```

**Bu sürümde yenilikler (What's New)** (603 / 4000). v2.15 notlarından. Not: 1.0 numaralı ilk sürümde App Store Connect bu alanı sormayabilir; ilk güncellemede kullan. İlk sürümde göstermek istersen "İlk sürüm. Koya hoş geldin!" yaz.
```
Vergi borcu: ödeyemediğin vergi borca yazılır ve bekledikçe büyür. Dördüncü ziyarette hâlâ ödenmediyse Haşmet Bey limanı mühürler ("Liman Battı"). Bir gün önceden uyarı alırsın.
Haşmet Bey ve çalışanların yeni kaçışma replikleri (her hafta farklı).
Şahmeran sahnesi artık denizden gelen yunusla başlıyor; hikâyenin arka planlarında oyundaki kasaba, cami ve servileri görürsün.
Alp Er Tunga hikâyenin 6. gününden sonra köprü başında nöbet tutuyor.
Çöp kovaları artık tezgâhın önünü kapatmıyor; alt çubuk dört sekmeye indi (Ticaret Ofisi BİNA sekmesinde).
Haşmet Bey ve Şahmeran için yeni sahne müzikleri.
```

### 2.2 English (en-US; en-GB için aynısını kopyala)

**App Name** (26 / 30)
```
Hamsi Koyu: Fishing Tycoon
```

**Subtitle** (29 / 30)
```
1974 Black Sea fishing harbor
```

**Promotional Text** (166 / 170)
```
Black Sea, 1974. Cast your net, fillet your catch, open your stall. Tax Collector Haşmet is on his way, and the Shahmeran's promise waits below. No ads, no purchases.
```

**Keywords** (97 / 100)
```
fish,fishing,idle,simulation,pixel,harbor,market,business,manager,retro,story,cozy,shop,nostalgia
```

**Description** (2361 / 4000)
```
April 1974, the Black Sea coast. You have a net and an empty pier.
Catch the fish, fillet it, sell it at your stall, and grow a tiny pier into a busy harbor with staff and managers.
Hamsi Koyu is a nostalgic pixel-art fishing tycoon in English and Turkish, completely free.

HOW TO PLAY
• Stand by your net and the fish pile up. Carry them to the cutting table.
• Stack fillets on the stall, serve each customer's order, collect the cash.
• Spend your earnings to open new zones, upgrade nets and hire staff.
• With a porter, filleter, stall-keeper and cashier in place, appoint a manager and the zone runs itself.

WHAT AWAITS YOU IN THE COVE
• Four zones: Fishing Pier, Fish Market, Smokehouse and Fisherman's Kitchen. Anchovy, mackerel, sea bass, bonito, salmon, tuna, and Skipper's Stew from the kitchen.
• Harbour Square: Staff Lodge, Depot, Fish Hall and Trade Office. Trade shares, fulfil company contracts and build your holding.
• The Promise Below: a 12-day Anatolian legend told inside the game. The Shahmeran's promise, the cove's residents, cutscenes and eight kinds of mini-games. One real choice on day 10: keep your word or break it.
• Tax Collector Mr. Haşmet: every seventh day he comes down the road and taxes your stalls one by one. Unpaid debt grows the longer it waits, and if it waits long enough the harbor is sealed. Your manager can haggle, but keep the till ready.
• 69 quirky special customers: each introduces themselves, but you only learn their name once you finish their order. Collect them all in the Customer Book.
• The Harbor Gazette: news from spring 1974, and at the end of the chapter, a photo of your own harbor.
• Market days, rush hours, fish shoals, cargo ships and storms.
• 10 original music tracks: folk, horon, zeybek, tango, arabesque and more. Music, effects and ambience have separate volume sliders.
• Fine-pixel or classic look; switch any time.
• Achievements, a chapter goal and an online leaderboard.

PLAYS FAIR
• No ads. No in-app purchases. No tracking.
• No account needed. Your progress stays on your device (3 save slots, autosave).
• Plays offline. The online leaderboard is asked about on first launch; if you decline ("Play offline"), nothing is sent.
• English and Turkish.

Hamsi Koyu is made by an independent developer. Send your thoughts with the in-game feedback form; every message is read.
```

**What's New** (668 / 4000)
```
Tax debt: tax you cannot pay is written to your debt and grows the longer it waits. If it is still unpaid on the fourth visit, Haşmet seals the harbor ("The Harbour Sank"). You get a warning a day ahead.
New flee lines for customers and staff when the tax collector arrives (different every week).
The Shahmeran scene now begins with a dolphin arriving from the sea; story backdrops show the game's own town, mosque and cypress trees.
Alp Er Tunga now keeps watch at the bridge after day 6 of the story.
Trash bins no longer block the front of stalls; the bottom bar is down to four tabs (Trade Office is under BUILD).
New scene music for Haşmet Bey and the Shahmeran.
```

### 2.3 Metin notları
- Doğrulanan sayılar: 69 özel müşteri (`specials.js`), 10 müzik parçası (`SONGS` dizisi), dört bölge, sekiz mini oyun türü (`README.md`, Dipteki Söz), 12 gün hikâye, Haşmet Bey her 7. gün, "Liman Battı" 4. ziyarette. Bunlardan biri değişirse metni güncelle.
- "Bölüm 1" bitince oyun bir teşekkür kartı gösterir ve 2. Bölüm'ün hazırlandığını söyler. Açıklamada sonsuz içerik vaat edilmedi. Bunu korumak iyi: yorumlarda "bitti" şikâyeti yerine beklenti doğru kurulur.
- Açıklamada başka oyun, marka ya da platform adı yok. "Yeşilçam" yalnız bir tür göndermesi olarak oyunun içinde geçer, mağaza metnine alınmadı.
- Fiyat ve "ücretsiz" sözcüğü açıklamada serbest (Apple için sorun değil). Ad ve alt başlıkta yok.
- Nostalji vurgusu: 1974 tarihi, Liman Gazetesi, türkü/horon/zeybek/arabesk müzikleri, Yeşilçam tarzı kötü karakter.

---

## 3. App Privacy (gizlilik etiketleri)

**Kaynak gerçekler (koddan doğrulandı)**
- Hesap, e-posta, konum, rehber, fotoğraf, reklam kimliği alınmaz (`privacy.html`, veri izni kartı). Üçüncü taraf SDK yok.
- `config.js` dolu: Supabase projesi tanımlı (`https://tsmavbfxywkffejqvdhf.supabase.co`), yani çevrimiçi özellikler **açık**. [HAZIR]
- Veri izni kartı (v2.12): "YENİ OYUN / DEVAM" ya da "SKOR TABLOSU"na ilk basışta çıkar. **Kabul** → gönderim başlar. **Çevrimdışı oyna** → `netOn()` onaya bağlı olduğu için sunucuya hiçbir istek gitmez, oyunun tamamı oynanır. Karar Ayarlar › Veri izni & Kurallar'dan değişir. (Eski `MAGAZA.md` v1.8'deki "zorunlu, her zaman açık" ifadesi artık geçerli değil.)
- Sunucu: Supabase, AB (Frankfurt). Satılmaz, reklamda kullanılmaz, üçüncü kişiyle paylaşılmaz.
- iOS gizlilik manifesti: `mobile/ios/App/App/PrivacyInfo.xcprivacy` (tracking = false, tracking domain yok, 4 veri türü, UserDefaults için CA92.1). Aşağıdaki tablo bununla uyumlu olmalı; farklıysa manifest düzeltilmeli. [HAZIR]

**App Store Connect › Uygulama Gizliliği: önerilen cevaplar**

| Veri türü (Apple) | Oyundaki karşılığı | Amaç | Kimlikle ilişkili mi? | İzleme? |
|---|---|---|---|---|
| Tanımlayıcılar › Kullanıcı Kimliği | Cihazda rastgele üretilen anonim oyuncu kimliği ve oyun kimliği (`balikci_pid`) | Uygulama İşlevselliği, Analiz | Kaynağa göre Hayır [DOĞRULA, aşağıya bak] | Hayır |
| Kullanıcı İçeriği › Oyun İçeriği | İşletme adı, karakter adı, oyun istatistikleri (balık, para, gün, süre); skor tablosunda herkese açık | Uygulama İşlevselliği | Kaynağa göre Hayır [DOĞRULA] | Hayır |
| Kullanıcı İçeriği › Diğer Kullanıcı İçeriği | İsteğe bağlı görüş formu: 1–5 yıldız, konu, metin (en çok 500 karakter); bildirilen satır kaydı | Uygulama İşlevselliği | Kaynağa göre Hayır [DOĞRULA] | Hayır |
| Kullanım Verileri › Ürün Etkileşimi | Açılış sayımı, dil, ilerleme adımları (eğitim, gün, açılan bölge, bölüm sonu) | Analiz | Kaynağa göre Hayır [DOĞRULA] | Hayır |

Ayrıca:
- **İzleme (Tracking): Hayır.** "Data Used to Track You" boş kalır. ATT izni gerekmez, reklam kimliği (IDFA) okunmaz.
- Toplanmayanlar: iletişim bilgisi (uygulama içinde e-posta/telefon sorulmaz), konum, sağlık, finans, tarama geçmişi, arama geçmişi, ses, fotoğraf, tanılama (çökme/performans) verisi, cihaz kimliği.
- Veri toplama "isteğe bağlı" olsa da (çevrimdışı seçilebilir) Apple'ın formu isteğe bağlılığı ayrı bir seçenek olarak sunmaz; uygulama veri toplayabildiği için yukarıdaki türler **işaretlenir**.
- Yalnızca çevrimdışı çalışan bir sürüm gönderilseydi (`config.js` boş) cevap "Veri Toplanmıyor" olurdu. Mevcut `config.js` dolu olduğundan bu seçenek **geçerli değil**.

**[DOĞRULA] Kimlikle ilişki sorusu.** Repodaki karar (`MAGAZA.md`, `PrivacyInfo.xcprivacy`) "Kimliğinizle bağlantılı değil". Ama Apple'ın tanımında, kalıcı bir kullanıcı kimliği sunucuda skor satırı ve silme isteği için tutuluyorsa veri "Linked to You" sayılabilir. Rastgele kimlik gerçek kimliğe bağlanmıyor ve hesap yok; bu yüzden "Not Linked" savunulabilir, ama inceleme sırasında itiraz gelirse tüm satırları "Linked to You" yapıp manifestte `NSPrivacyCollectedDataTypeLinked` değerlerini `true` yapmak güvenli yoldur. Karar senin; bir kez seçip manifest, gizlilik politikası ve etiketleri aynı tut.

**[DOĞRULA] Diğer noktalar**
- IP adresi: `privacy.html` Supabase'in güvenlik için bağlantı IP'lerini kısa süreli günlüğünde tutabileceğini söylüyor. Apple bunu genellikle işleyenin standart sunucu günlüğü sayar, ayrı bir etiket gerektirmeyebilir; yine de karar sende.
- "Diğer Kullanıcı İçeriği" için amaç: manifest yalnız Uygulama İşlevselliği diyor; `MAGAZA.md` ayrıca Analiz diyor. Görüş metni geliştiricinin oyunu iyileştirmesi için okunduğundan Analiz de eklenebilir. Hangisini seçersen manifesti de ona eşitle.
- Yurt dışına aktarım ve KVKK: `privacy.html` v2.12 aktarımı açık rızaya (veri izni kartı) dayandırıyor. `MAGAZA.md` (v1.8) Supabase ile KVKK standart sözleşmesi ve Kurul bildirimi yapılana kadar çevrimiçi sürümün yayına çıkmamasını "engelleyici" olarak yazmıştı; sonraki sürümlerde (v2.12) rıza yöntemine geçildi. Güncel hukuki durumu bir KVKK avukatına ya da `HUKUK.md` §6.4'e göre onayla. Bu Apple formundan bağımsız ama yayından önce bitmeli. [SEN]

**Kullanıcı içeriği (Apple Yönergesi 1.2)** — App Review'a gösterilecek önlemler
- Hizmet koşulları/Topluluk Kuralları: `terms.html`; veri izni kartında kabul edilir, kabul edilmeden ad görünmez.
- Uygunsuz ad filtresi: istemcide ve sunucuda (`bt_bad_name`).
- Her satırda ⋮ › Bildir ve gizle / Yalnız gizle; 3 farklı bildirimde satır otomatik gizlenir; geliştirici paneli bildirimleri inceler.
- İletişim: support.html ve recaizade3145@gmail.com; bildirimlere 30 gün içinde yanıt.
- Kullanıcıyı engelleme karşılığı: kişi değil satır gizlenir (sohbet/mesaj yok).

---

## 4. İnceleme notları (App Review)

**App Store Connect › Sürüm › App Review Bilgileri**
- Oturum açma gerekli: **Hayır** (hesap yok, demo hesap gerekmez).
- İletişim: ad, soyad, telefon, e-posta (recaizade3145@gmail.com). Telefon numarasını gir. [SEN]

**Notes alanına yapıştır (İngilizce):**
```
Hamsi Koyu is a single-player pixel-art fishing business game set in 1974 on the Turkish Black Sea coast. It is available in Turkish and English (it follows the device language, and can be changed in Settings).

NO LOGIN: there is no account, sign-in or demo account. The whole game runs offline from the app bundle; it needs no internet connection to review.

HOW TO TEST
1. Launch the app and choose a language on the start screen. Tap NEW GAME.
2. On first use a DATA CONSENT CARD appears. It explains exactly what is sent to the leaderboard server (public: business name, character name and game stats; developer only: a random anonymous player ID, launch counts, language, in-game progress milestones, optional feedback text, name reports), what is never collected (real name, email, phone, location, contacts, photos, advertising ID), where it is stored (Supabase, EU/Frankfurt), retention (leaderboard entries until deleted; other records at most 24 months) and the Community Rules. "I have read it and accept" turns on the online leaderboard. "Play offline" sends nothing at all and the whole game stays playable. You can reopen the card in Settings > Data consent & Rules, so either choice is safe to test.
3. Pick an empty save slot, customise the character, name the business and choose an autosave interval. A guided tutorial starts.
4. After the tutorial, a story visitor from "The Promise Below" (a 12-day folk legend told in 8 kinds of mini-games) walks to a stall on each game day and opens a cutscene. Tax Collector Mr. Haşmet, a fictional comic villain, visits on every 7th game day, taxes the stalls (customers run away while he is in the harbor); unpaid tax becomes debt, and after four visits the game can end with a "Harbour Sank" screen. This is a management consequence only; there is no real money, gambling or chance-based wager.

USER-GENERATED CONTENT (Guideline 1.2): the only shared content is the business/character name on the online leaderboard (start screen or menu > Leaderboard). Names are filtered on device and on the server; users accept the Community Rules (https://recaikas.github.io/okult-kahin-byblbn/terms.html) on the consent card before anything is sent or their name is shown; every row has a menu to Report (sent to the developer, row auto-hidden after 3 reports) or Hide it on the device; the developer removes violating names. There is no chat or messaging.

PRIVACY: Settings contains the Privacy Policy and "Delete my online data" (removes this device's leaderboard rows, launch counts and feedback from the server and creates a new anonymous ID). Privacy Policy: https://recaikas.github.io/okult-kahin-byblbn/privacy.html. No ads, no in-app purchases, no tracking, no ATT prompt, no IDFA.

RATINGS: the app may show the system rating window (SKStoreReviewController) at most once every 60 days. The optional in-game feedback form gives a small in-game cash gift for the first comment of 10+ letters per version, whatever star rating is given; it is not tied to App Store reviews, which are never rewarded.

The app is a native iOS shell (Capacitor) that bundles all game files locally; it does not load a remote website. Support: https://recaikas.github.io/okult-kahin-byblbn/support.html
```

**İnceleme için hatırlatmalar**
- Gün sayacı (`DAY_LEN = 300`) uzun olduğundan Haşmet Bey'i 7. günde görmek dakikalar sürer; incelemeci bunu görmek zorunda değil. Not'ta "7th game day" yazıyor. Süreyi kısaltan bir test kısayolu eklemeyi düşünürsen yalnız TestFlight sürümünde olsun. [DOĞRULA]
- Yönerge 4.2 (asgari işlev) riski: uygulama bir web oyunu kabuğu. Önlem: dosyalar uygulamaya gömülü, internetsiz açılır (`mobile/scripts/build-www.js` Google Fonts bağlantısı varsa derlemeyi durdurur), kayıt telefonun kalıcı deposuna yazılır, geri tuşu/arka plan davranışı ve mağaza değerlendirme penceresi yerel eklentiyle yapılır. Notun son cümlesi bunu söylüyor.

---

## 5. İhracat uyumluluğu, içerik hakları, ATT

| Konu | Cevap | Kanıt |
|---|---|---|
| Şifreleme (Export Compliance) | Uygulama yalnız işletim sisteminin standart HTTPS/TLS'ini kullanır; özel şifreleme algoritması yok. **Muaf.** | `Info.plist`: `ITSAppUsesNonExemptEncryption = false` (doğrulandı). Yükleme sonrası şifreleme sorusu çıkmaz. Fransa için ek belge gerekmez. [HAZIR] |
| Üçüncü taraf içerik hakları (Content Rights) | "Üçüncü taraf içerik içermiyor ya da gerekli haklara sahibim" | Sanat oyunun kodundan üretilen özgün piksel sanatı; müzik uygulama içinde sentezlenen özgün besteler (`README.md`: "kendi bestemiz, anlık sentez"). Hikâye halk anlatısı Şahmeran'a ve Herodotos'a dayanır, metin özgündür (`story.js` başlığı). Yazı tipi Pixelify Sans (SIL OFL 1.1, `fonts/OFL.txt`); Capacitor eklentileri MIT, Cordova/AndroidX Apache 2.0 (`THIRD_PARTY_NOTICES.md`, oyunda Ayarlar › Hakkında & Lisanslar). Ünlü parodisi karakterler v1.6'da özgünleştirildi. [HAZIR] |
| Tescilli ad | "Hamsi Koyu" için TÜRKPATENT/WIPO/EUIPO ön araştırması bekleniyordu | `MARKA_ON_ARASTIRMA.md`; "Hamsi Koyu" ayrıca gerçek bir koy adı (düşük risk, `HUKUK.md` §3). Sonucu senin aramana bağlı. [SEN] [DOĞRULA] |
| Reklam izleme şeffaflığı (ATT) | **Gerekmez.** `NSUserTrackingUsageDescription` eklenmez, `AppTrackingTransparency` kullanılmaz. | `Info.plist` içinde anahtar yok; `PrivacyInfo.xcprivacy`: `NSPrivacyTracking = false`, `NSPrivacyTrackingDomains` boş. [HAZIR] |
| AB DSA (Digital Services Act) | Satıcı durumu: **"non-trader"** (ticari amaç/gelir yok) | `MAGAZA.md` §3. Beyan senin: App Store Connect › Sözleşmeler/Business. [SEN] |
| Kids kategorisi | Seçilmez | Hedef kitle çocuk değil (`privacy.html` "Çocuklar" bölümü). |
| Konum, kamera, mikrofon izinleri | Yok | `Info.plist`'te kullanım açıklaması anahtarı yok. |

---

## 6. Görsel ve video gereksinimleri

Kullanılabilir hazır paket `balikci-tycoon/store/` altında. Boyutlar bu çalışmada ölçüldü.

| Öğe | Apple gereksinimi | Hazır dosya (durum) |
|---|---|---|
| Uygulama simgesi | 1024×1024 px, PNG, **alfa kanalı yok**, köşeleri yuvarlama | `store/appstore/app-icon-1024.png`: 1024×1024, RGB (alfasız). [HAZIR] Xcode'daki `AppIcon.appiconset` ayrı; `npm run assets` ile üretilir. |
| iPhone 6,9" ekran görüntüsü | **1320×2868** (ya da 1290×2796) dikey; 1–10 adet. Zorunlu set | `store/screens/appstore-6.9/{tr,en}/` altında 6'şar dosya (01-harbor, 02-special, 03-kitchen, 04-story, 05-stalls, 06-book): 1320×2868. [HAZIR] |
| iPhone 6,5" ekran görüntüsü | **1284×2778** (ya da 1242×2688) dikey. 6,9" verilirse isteğe bağlı | `store/screens/appstore-6.5/{tr,en}/` 1284×2778. [HAZIR] |
| iPad 13" ekran görüntüsü | 2064×2752 (ya da 2048×2732) | **Gerekmez.** Uygulama yalnız iPhone (`TARGETED_DEVICE_FAMILY = 1`). İpad desteği açılırsa zorunlu olur. |
| Uygulama önizleme videosu (App Preview) | iPhone 6,9": **886×1920**, dikey; **15–30 sn**; en çok 3 adet; .mov/.m4v/.mp4, H.264/AAC | `store/video/appstore-preview-886x1920-{tr,en}.mp4`: 886×1920, 29 sn. [HAZIR] |
| Tanıtım görseli | Yok (yalnız Google Play için gerekli) | — |

Notlar
- Her dil için ayrı ekran görüntüsü ve önizleme yükle (TR ve EN klasörleri ayrı).
- Ekran görüntüleri ve videonun v2.14/v2.15 özelliklerini (Haşmet Bey, vergi borcu) yansıtıp yansıtmadığı bilinmiyor; mevcut sahneler: liman, özel müşteri, mutfak, Dipteki Söz, tezgâh paneli, müşteri defteri. İstersen 7. sahne olarak Haşmet Bey gelişini ekle. [DOĞRULA]
- Görsellerde "ücretsiz", "indir", başka platform adı ya da fiyat bilgisi olmasın. Videoda başka platform adı geçmiyor (`store/README.md`).
- Görsel/video dosyaları büyük (önizleme ~9 MB). Git'te mevcutlar; yeniden üretim betikleri `store/tools/` içinde.

---

## 7. Yayın kontrol listesi (adım adım)

### A. Hesap ve sözleşmeler
1. **[SEN]** Apple Developer Program'a kayıt: https://developer.apple.com/programs/ (bireysel, 99 $/yıl, onay genelde 1–2 gün). İki faktörlü kimlik doğrulama açık olmalı. Satıcı adı olarak yasal adın görünür.
2. **[SEN]** App Store Connect › Sözleşmeler: "Ücretsiz Uygulamalar" sözleşmesini kabul et (gelir yok; vergi/banka bilgisi gerekmez).
3. **[SEN]** AB DSA beyanı: "non-trader" (bölüm 5).
4. **[SEN]** Marka ön araştırmasını bitir (`MARKA_ON_ARASTIRMA.md`) ve KVKK/yurt dışı aktarım durumunu doğrula (bölüm 3).

### B. Kimlik, imza ve sürüm (Mac gerekir)
5. **[HAZIR]** Bundle ID `io.github.recaikas.hamsikoyu` (Capacitor + Xcode). **[SEN]** developer.apple.com › Identifiers'ta aynı kimliği kaydet (Xcode "Automatically manage signing" ile bunu kendisi de yapabilir).
6. **[SEN]** Mac'te Xcode (Capacitor 8 için güncel sürüm), Node 22+ kur.
7. **[HAZIR → SEN çalıştırır]** Bağımlılıklar ve Capacitor eşitleme:
   ```bash
   cd balikci-tycoon/mobile
   npm ci
   npm run sync        # oyun dosyalarını www/'ya kopyalar ve iOS projesine aktarır
   npm run ios         # sync + Xcode'da açar (ya da: npx cap open ios)
   ```
   `mobile/www/` bir derleme çıktısıdır ve depoda yok; her yüklemeden önce `npm run sync` çalıştır. Oyun dosyaları, `privacy.html`, `terms.html`, `support.html`, `about.html` dahil `www/`'ya kopyalanır. iOS projesi Swift Package Manager kullanır (CocoaPods yok); Xcode paketleri kendisi çözer.
8. **[SEN]** Xcode › App hedefi › Signing & Capabilities: Team olarak kendi Apple Developer hesabını seç, "Automatically manage signing" açık. Ek yetenek (capability) gerekmez: push, uygulama içi satın alma, Sign in with Apple yok.
9. **[SEN]** Sürüm ve derleme numarası: Xcode › General › Version **1.0** (`MARKETING_VERSION`), Build **1** (`CURRENT_PROJECT_VERSION`). Şu an ikisi de bu değerlerde. Her yeni yüklemede **Build'i artır** (aynı sürüm için tekrarlanamaz).
10. **[HAZIR]** Doğrula: `Info.plist` içinde `ITSAppUsesNonExemptEncryption = false`, `PrivacyInfo.xcprivacy` hedefe ekli (Build Phases › Copy Bundle Resources), simge ve açılış ekranı `AppIcon`/`Splash` setlerinde. Gerekirse `npm run assets`.
11. **[SEN]** Gerçek iPhone'da dene: yeni oyun, kayıt, uygulamayı kapat/aç ve devam, arka plana alıp dön, sesler, performans, çevrimdışı mod (uçak modu), veri izni kartının iki seçeneği, "Çevrimiçi verilerimi sil". Mümkünse eski bir iPhone da.

### C. Arşiv ve yükleme
12. **[SEN]** Xcode › hedef cihaz "Any iOS Device (arm64)" › Product › **Archive**.
13. **[SEN]** Organizer › Distribute App › App Store Connect › Upload. Başarılıysa App Store Connect'te "İşleniyor" bekle (10–30 dk); e-posta gelir.

### D. App Store Connect kaydı (yükleme öncesi de yapılabilir)
14. **[SEN]** Apps › + › Yeni Uygulama: platform iOS, ad (bölüm 1), birincil dil Türkçe, bundle ID, SKU, tam erişim.
15. **[SEN]** Uygulama Bilgileri: alt başlık, kategori (bölüm 1), içerik hakları ve yaş derecelendirmesi anketi (bölüm 1), gizlilik politikası URL.
16. **[SEN]** Fiyat ve Kullanılabilirlik: Ücretsiz, bütün ülkeler (ya da seçtiklerin).
17. **[SEN]** Uygulama Gizliliği: bölüm 3'teki cevaplar; gizlilik politikası URL'si.
18. **[SEN]** Sürüm sayfası: her dil için tanıtım metni, açıklama, anahtar kelimeler, destek ve pazarlama URL, telif hakkı satırı (bölüm 2). Ekran görüntüleri ve önizleme (bölüm 6). İngilizce (U.S.) yerelleştirmeyi ekle.
19. **[SEN]** App Review Bilgileri: iletişim, "oturum açma gerekmez", notlar (bölüm 4).

### E. TestFlight
20. **[SEN]** TestFlight › yüklenen derlemeyi seç; "Şifreleme"/uyumluluk sorusu çıkarsa bölüm 5'e göre cevapla.
21. **[SEN]** Önce **dahili test** (kendi Apple ID'n, takımdaki kişiler): kayıt, çevrimdışı, veri izni, silme. Sonra isteğe bağlı **harici test** (Beta App Review gerekir, birkaç saat/gün; test bilgisi ve iletişim iste).
22. **[SEN]** TestFlight geri bildirimiyle çıkan hataları düzelt; her düzeltmede Build'i artırıp 7–13. adımları tekrarla.

### F. İncelemeye gönderme
23. **[SEN]** Sürüm sayfasında "Derleme" olarak son TestFlight derlemesini seç.
24. **[SEN]** Yayın yöntemi: **elle yayınla** önerilir (onaydan sonra sen "Yayınla" dersin). Sürüm: "Bu sürümde yenilikler" ilk sürümde gerekmeyebilir.
25. **[SEN]** "İncelemeye Gönder". Süre genelde 24–48 saat.
26. Reddedilirse Resolution Center'daki gerekçeyi oku; çoğu düzeltme yalnız metadata (not, gizlilik etiketi) olur. En olası konular: 1.2 UGC (cevap hazır), 5.1.1 veri toplama/rıza (veri izni kartı), 4.2 asgari işlev (bölüm 4 notu).

### G. Yayından sonra
27. **[SEN]** `recaizade3145@gmail.com`'a gelen silme/KVKK isteklerini 30 gün içinde yanıtla; ayda bir Supabase `bt_cleanup()` çalıştır (`MAGAZA.md` §5).
28. **[SEN]** Bildirilen adları panelden (`panel.html`) incele ve kaldır.
29. Gizlilik etiketi ya da politikada herhangi bir değişiklikte (ör. reklam, satın alma, yeni SDK) **önce** App Privacy ve `privacy.html`'i güncelle, sonra yeni sürümü yükle.

---

## 8. Emin olunmayan noktalar ([DOĞRULA] listesi)

1. **KVKK ve yurt dışı aktarım:** `privacy.html` v2.12 açık rızaya dayanıyor; `MAGAZA.md` v1.8 ise standart sözleşme ve Kurul bildirimini yayın engeli saymıştı. Güncel hukuki durum bu çalışmada doğrulanamadı.
2. **Kimlikle ilişki ("Linked to You") cevabı:** repoda "Not Linked"; kalıcı kullanıcı kimliği nedeniyle Apple farklı yorumlayabilir (bölüm 3).
3. **Gizlilik manifesti ile etiket uyumu:** "Diğer Kullanıcı İçeriği" amacında manifest (yalnız İşlevsellik) ile `MAGAZA.md` (ayrıca Analiz) farklı.
4. **Yaş derecelendirmesi sonucu:** 4+ bekleniyor ama UGC cevabı sonucu yükseltebilir; Apple'ın hesaplamasına bak.
5. **Uygulama adı:** "Hamsi Koyu: Balıkçı Tycoon" / "…Fishing Tycoon" kullanılabilir olmayabilir; alternatif "Hamsi Koyu" ya da "Hamsi Koyu: Balıkçı Limanı".
6. **Marka ön araştırması** (TÜRKPATENT, WIPO, EUIPO, mağaza) sonucu bende yok.
7. **Ekran görüntüleri ve önizleme** v2.14/v2.15 özelliklerini (vergi memuru, borç) göstermiyor olabilir; içerik ve tarih bu çalışmada kontrol edilmedi, yalnız boyutlar ölçüldü.
8. **Telif satırı ve satıcı adı:** `recaikas` GitHub kullanıcı adı; yasal adınla değiştir. İletişim telefonu eksik.
9. **Haşmet Bey'in test edilebilirliği:** gün süresi `DAY_LEN = 300`; incelemeci 7. güne kolay ulaşamayabilir.
10. **En düşük iOS ve aygıt gereksinimi:** `IPHONEOS_DEPLOYMENT_TARGET = 15.0`; `UIRequiredDeviceCapabilities` hâlâ `armv7` (Capacitor şablonu). Xcode arşivi doğrularken uyarı verirse `arm64` yap.
11. **Apple form alanları** (yaş anketi soruları, ekran görüntüsü boyut listesi, 6,5" zorunluluğu) Apple'ın en güncel arayüzüne göre kontrol edilmeli; bu dosya genel bilgiye dayanıyor, canlı arayüz değişmiş olabilir.
