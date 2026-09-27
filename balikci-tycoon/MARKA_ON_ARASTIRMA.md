# "Hamsi Koyu" — Marka ve ad çakışması ön araştırması

- **Tarih:** 2026-09-27
- **Konu:** Ücretsiz mobil/web oyunu "Hamsi Koyu" (İng. "Anchovy Cove"). Piksel sanatlı, balıkçı limanı işletme simülasyonu.
  Türk tek kişilik geliştirici. App Store, Google Play ve GitHub Pages'te yayımlanacak.
- **Bu belge hukuki görüş değildir.** Yalnız bir ön taramadır. Asıl karar TÜRKPATENT kaydına göre verilir (aşağıdaki §5).
  Başvuru yapacaksan bir marka vekiline son kontrolü yaptır.

---

## 0. Kısa sonuç

- Bulabildiğim kaynaklarda **"Hamsi Koyu" adlı bir oyun, uygulama, marka ya da şirket yok.**
- Ad bir **gerçek yer adı** (Garipçe/Sarıyer yakınında küçük bir koy). Ayrıca çok benzer yazılan **Hamsiköy (Trabzon)**
  var. Bu ikisi marka engeli değil, ama arama ve kullanıcı adında karışıklık yaratabilir.
- **Alan adları büyük olasılıkla boşta:** `hamsikoyu.com`, `.net`, `.org`, `.com.tr`, `.tr`, `.app`, `.games` ve
  `hamsi-koyu.com` DNS'te **NXDOMAIN** döndü.
- **Resmî marka veri tabanlarına (TÜRKPATENT, WIPO, EUIPO/TMview) bu ortamdan erişilemedi.** Mağaza sayfalarına da doğrudan
  erişilemedi. Bu yüzden sonuç **koşullu**. Genel risk şimdilik **DÜŞÜK**, ama TÜRKPATENT'te sınıf 9/41'de "HAMSİ" içeren
  bir kelime markası çıkarsa **ORTA** olur.

---

## 1. Neyi nereden denedim? (erişim durumu)

Bu oturumun ağ çıkışı bir kurumsal proxy politikasına bağlı. `curl` ve WebFetch denemelerinin çoğu **403 (EGRESS_BLOCKED)**
aldı. Yalnız web araması (arama motoru sonuç özetleri), GitHub arama API'si (MCP üzerinden) ve DNS sorgusu
(8.8.8.8, UDP 53) çalıştı.

| Kaynak | Adres | Durum |
|---|---|---|
| TÜRKPATENT marka araştırma | https://www.turkpatent.gov.tr/arastirma-yap | ❌ Erişilemedi (proxy 403) |
| e-Devlet TÜRKPATENT hizmetleri | https://www.turkiye.gov.tr/turk-patent-ve-marka-kurumu | ❌ Erişilemedi (proxy 403) |
| TÜRKPATENT Coğrafi İşaret Portalı | https://ci.turkpatent.gov.tr | ⚠️ Yalnız arama sonucu olarak görüldü, sayfa açılmadı |
| WIPO Global Brand Database | https://branddb.wipo.int | ❌ Erişilemedi (proxy 403) |
| EUIPO eSearch | https://euipo.europa.eu/eSearch | ❌ Erişilemedi (proxy 403) |
| TMview | https://www.tmdn.org/tmview | ❌ Erişilemedi (proxy 403) |
| Apple App Store / iTunes Search API | apps.apple.com, itunes.apple.com | ❌ Erişilemedi. Yalnız web araması (dolaylı) |
| Google Play | play.google.com | ❌ Erişilemedi. Yalnız web araması (dolaylı) |
| RDAP / WHOIS | rdap.verisign.com, rdap.org, whois 43. port | ❌ Erişilemedi |
| DNS (NS kaydı sorgusu) | 8.8.8.8 | ✅ Çalıştı |
| GitHub depo ve kullanıcı arama | GitHub API (MCP) | ✅ Çalıştı |
| Genel web araması | Arama motoru (ABD bölgesi) | ✅ Çalıştı. Türkçe sonuçlar sınırlı olabilir |
| Ekşi Sözlük, hamsioyun.com, sosyal ağlar | — | ❌ Sayfalar açılmadı. Yalnız arama özeti görüldü |

**Önemli:** Web araması mağaza içi aramanın ve marka veri tabanının yerini tutmaz. Arama motoru yeni, az indirilen ya da
yalnız Türkiye mağazasındaki uygulamaları göstermeyebilir.

---

## 2. Aranan ifadeler

- `"Hamsi Koyu"`, `"Hamsi Köyü"`, `Hamsiköy`, `hamsikoyu`, `"Hamsi" oyun/game/app`, `"Anchovy Cove"`, `"Hamsi Cove"`
- Marka: `"HAMSİ" marka tescil`, `"HAMSI" trademark class 9/28/41`
- Alan adları: `hamsikoyu.{com,net,org,com.tr,net.tr,web.tr,tr,app,io,games}`, `hamsi-koyu.com`, `hamsikoyugame.com`,
  `hamsikoy.{com,org}`, `anchovycove.com`, `hamsi.{com,com.tr,game}`
- GitHub: `hamsi koyu`, `hamsikoyu` (depo ve kullanıcı)

TÜRKPATENT/WIPO/EUIPO'da **"HAMSİ KOYU", "HAMSI KOYU", "HAMSİKOYU"** aramalarını **yapamadım.** Bunları §5'teki
adımlarla sen yap.

---

## 3. Bulgular

### 3.1 Marka veri tabanları (TÜRKPATENT, WIPO, EUIPO/TMview)

- **Doğrudan sorgu yapılamadı.**
- Web aramasında "HAMSİ KOYU" ya da "HAMSİ" adlı, sınıf 9/28/41'de (yazılım, oyun, eğlence) bir tescil ya da bülten
  kaydına **rastlanmadı**. Bu bir kanıt değildir. Marka kayıtları arama motorlarında genelde görünmez.
- Bulunan tek resmî sınai mülkiyet kaydı bir **coğrafi işaret**:
  - **Hamsiköy Sütlacı**, tescil no. 255, mahreç işareti, 2017 — [Coğrafi İşaretler Portalı](https://ci.turkpatent.gov.tr/cografi-isaretler/detay/38380),
    [Kültür Portalı](https://www.kulturportali.gov.tr/portal/hamsikoysutlaci).
  - Sütlaç (gıda) için. Bir oyunla karıştırılma ihtimali yok. Oyunda "Hamsiköy Sütlacı" adlı bir ürün kullanmadığın
    sürece sorun değil.
- Adında "Hamsi" geçen şirketler var, örneğin **HAMSİ GRUP GIDA SAN. VE TİC. LTD. ŞTİ.**
  ([find.com.tr](https://www.find.com.tr/Company/hamsigrupgidasanayiveticaretlimitedsirketi)). Gıda sektörü, oyunla ilgisiz.

### 3.2 App Store ve Google Play

- **"Hamsi Koyu", "Hamsi Köyü" ya da "Hamsiköy" adlı bir oyun veya uygulama bulunamadı** (web araması ile, dolaylı).
- Aynı alandaki en yakın kullanımlar:
  - **"Brutal Hamsi"**: Google Play'de hiper-casual oyunlar yayımlayan bir geliştirici hesabı (Blocks Stack, Evo Racer,
    Chess Wars vb.) — [Google Play geliştirici sayfası](https://play.google.com/store/apps/developer?id=Brutal+Hamsi).
    Bu bir yayıncı adı, oyun adı değil. "Brutal Hamsi" ile "Hamsi Koyu"nun bütünsel izlenimi farklı. Tek ortak öğe
    "Hamsi" kelimesi. Adında "Brutal Hamsi" geçen tescilli bir marka olup olmadığı **doğrulanmadı**.
  - **"Hamsi Oyun"** ([hamsioyun.com](https://hamsioyun.com/), [Facebook](https://m.facebook.com/hamsi.oyun)): Türkçe
    oyun haberleri sitesi. Oyun yayıncısı değil. Alan adı aktif (DNS: 45.43.143.152). Sınıf 41'de "HAMSİ OYUN" diye
    tescilli bir marka olup olmadığı **doğrulanmadı**. §5'te mutlaka buna da bak.
  - **"Anchovy Squad"** (Studio Drill): İngilizce ad "Anchovy Cove" ile tam aynı değil, farklı tür (RPG) —
    [App Store](https://apps.apple.com/us/app/anchovy-squad/id6504208065). Risk yok.
  - Benzer türde oyunlar (farklı adlarla): "Fisherman Hasan: Fish Market"
    ([App Store](https://apps.apple.com/us/app/fisherman-hasan-fish-market/id6761220782)), "Balıkçı Simülatör"
    ([itch.io](https://ygz445yt.itch.io/balikci-simulator)). Ad çakışması yok. Yalnız rakip olarak bilgi amaçlı.
- itch.io ve Steam'de "Hamsi Koyu" ya da "Hamsi Cove" adlı bir oyun bulunamadı.

### 3.3 GitHub

- `hamsi koyu` ve `hamsikoyu` için **depo sayısı 0**, `hamsikoyu` kullanıcı adında **kullanıcı yok** (GitHub arama API'si,
  2026-09-27).

### 3.4 Gerçek yerler, işletmeler ve yazım karışıklıkları

| Ad | Ne? | Kaynak | Oyun için önemi |
|---|---|---|---|
| **Hamsi Koyu** (Sarıyer, İstanbul) | Garipçe yakınında, tekneyle ya da tepelerden tırmanarak ulaşılan küçük bir koy. Eski adı "Hamsili Liman" olarak da geçiyor. | [Foursquare](https://tr.foursquare.com/v/hamsi-koyu/55d32e83498e2ad73319fbdf), [Ekşi Sözlük](https://eksisozluk.com/hamsi-koyu--669570), [Garipçe/Google Groups](https://groups.google.com/g/kose-bucak-istanbul/c/IVupvfUFZ4Y) | Tek bir coğrafi yer. Marka sahibi yok. Oyun bu yerin coğrafi kaynağını göstermiyor (SMK m.5/1-c için bkz. HUKUK.md §3.4). |
| **Hamsiköy** (Maçka, Trabzon) | Köy/mahalle. Sütlacıyla ünlü, coğrafi işaretli. Otelleri ve dernekleri var. | [Vikipedi](https://tr.wikipedia.org/wiki/Hamsik%C3%B6y_s%C3%BCtlac%C4%B1), [Facebook: Hamsiköyü Kalkındırma ve Dayanışma Derneği](https://www.facebook.com/hamsikoydernegi/), [Instagram @hamsikoy](https://www.instagram.com/hamsikoy/) | **ASCII yazımı çakışıyor:** "Hamsi**köyü**" → `hamsikoyu`. Alan adı ve kullanıcı adında bu köyle karışabilir. Marka riski değil, ama arama sonuçlarında ve SEO'da gürültü demek. |
| **Hamsilos Koyu** (Sinop) | Fiyort benzeri koy ve "Hamsilos Tatil Köyü" oteli | [Setur](https://www.setur.com.tr/hamsilos-tatil-koyu-apart-hotel), [Instagram](https://www.instagram.com/hamsilostatilkoyu/) | Farklı ad. Risk yok. |
| Hamsi Butik Otel (Akçakoca) | Otel/kafe, `hamsi.com.tr` | [hamsi.com.tr](http://hamsi.com.tr/butik-otel-cafe) | Sınıf 43. Oyunla ilgisiz. |
| Hamsiköy Zitaş Otel, Metin Usta Hamsiköy Sütlacı vb. | Otel/restoran | [Expedia](https://www.expedia.com/Macka-Hotels-Zitas-Otel-Zigana-Yayla-Tatil-Koyu.h33376058.Hotel-Information), [Instagram](https://www.instagram.com/hamsikoymetinusta/) | Sınıf 30/43. Oyunla ilgisiz. |

Not: Bir arama özeti Hamsiköy derneğinin sitesini "hamsikoyu.org" olarak verdi. DNS'te `hamsikoyu.org` ve
`hamsikoy.org` şu an **NXDOMAIN**. Yani bu site artık yayında değil ya da adres yanlış.

### 3.5 Alan adları (DNS NS sorgusu, 8.8.8.8, 2026-09-27)

| Alan adı | Sonuç | Yorum |
|---|---|---|
| `hamsikoyu.com` | NXDOMAIN | Büyük olasılıkla **boşta** |
| `hamsikoyu.net` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsikoyu.org` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsikoyu.com.tr` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsikoyu.net.tr`, `hamsikoyu.web.tr`, `hamsikoyu.tr` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsikoyu.app`, `hamsikoyu.io`, `hamsikoyu.games` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsi-koyu.com`, `hamsikoyugame.com` | NXDOMAIN | Büyük olasılıkla boşta |
| `hamsikoy.com` | SERVFAIL | Kayıtlı ama DNS'i bozuk olabilir (Hamsiköy'le ilgili olması muhtemel) |
| `anchovycove.com` | Kayıtlı (NOERROR) | Başkasına ait. İçeriği görülemedi |
| `hamsi.com`, `hamsi.com.tr`, `hamsioyun.com` | Kayıtlı | Başkalarına ait |

**Uyarı:** NXDOMAIN, alan adının DNS'te yayımlanmadığını gösterir. Kayıtlı ama askıya alınmış ya da ad sunucusu
girilmemiş bir alan adı da NXDOMAIN verebilir. WHOIS/RDAP bu ortamdan açılamadı. Almadan önce bir kayıt firmasında
"müsait mi?" araması yap.

### 3.6 Sosyal medya kullanıcı adları

- Doğrudan kontrol **yapılamadı** (Instagram, X, TikTok, YouTube engelli).
- Web aramasında `@hamsikoyu` adlı bir hesap görünmedi. Yakın hesaplar: `@hamsikoy` (Trabzon Hamsiköy, Instagram),
  `@hamsikoymetinusta`, `@hamsilostatilkoyu`.

---

## 4. Risk değerlendirmesi

| Konu | Risk | Gerekçe |
|---|---|---|
| Aynı adlı mevcut oyun/uygulama | **Düşük** | Web aramasında, GitHub'da, itch.io ve Steam'de yok. Mağaza içi arama doğrudan yapılamadı. |
| TÜRKPATENT'te aynı/benzer marka (sınıf 9, 28, 41) | **Bilinmiyor → muhtemelen düşük** | Veri tabanına erişilemedi. Web'de iz yok. En olası riskli kayıtlar "HAMSİ" tek kelimesi ya da "HAMSİ OYUN" gibi ifadeler olabilir. |
| WIPO / AB markaları | **Düşük** | "Hamsi" Türkçe bir kelime. Yurt dışında aynı sınıfta bir kayıt olasılığı az. Doğrulanmadı. |
| Yer adı itirazı (SMK m.5/1-c) | **Düşük** | Oyun, koyun coğrafi kaynağını göstermiyor. İnceleme uzmanı yine de sorabilir. |
| "Hamsi" kelimesinin tanımlayıcı olması | **Düşük-orta** (yalnız tescil için) | "Hamsi" balık adı. Balıkçılık oyunu için kısmen tanımlayıcı. "HAMSİ KOYU" bütün olarak ayırt edicidir. Ama başkasının "HAMSİ" kelimesini kullanmasını tek başına engelleyemezsin. |
| Hamsiköy (Trabzon) ile karışıklık | **Düşük** (hukuken), **orta** (arama/SEO) | Coğrafi işaret sütlaç için. Oyunla ilgisi yok. Ama `hamsikoyu` ASCII yazımı "Hamsiköyü"yle aynı. |
| Alan adı kapılması | **Düşük-orta** | Bugün boşta görünüyor. Oyun duyulursa biri kayıt edebilir. Maliyeti düşük. |

**Genel sonuç: DÜŞÜK risk (koşullu).** Koşul: §5.1'deki TÜRKPATENT araştırmasında sınıf 9, 28 ya da 41'de "HAMSİ KOYU"
ya da "HAMSİ" içeren **aynı/çok benzer bir kelime markası çıkmaması.** Çıkarsa risk **ORTA/YÜKSEK** olur ve bir marka
vekiline danışmadan yayımlama.

---

## 5. Sonraki adımlar (somut)

### 5.1 TÜRKPATENT marka araştırmasını kendin yap (ücretsiz, ~15 dk)

1. Tarayıcıda **https://www.turkpatent.gov.tr/arastirma-yap** adresini aç.
2. **"Marka Araştırma"** sekmesini seç (adres `...arastirma-yap?form=trademark` olur).
3. Sistem giriş isterse **"e-Devlet ile Giriş"**e tıkla. T.C. kimlik numaran ve e-Devlet şifrenle (ya da e-imza/mobil
   imza) gir. Sonra tekrar Marka Araştırma sekmesine dön.
4. **"Marka Adı"** alanına sırayla şunları yaz. Varsa eşleşme türünü **"İçerir"** (ya da "Benzer") yap:
   - `HAMSİ KOYU`, `HAMSI KOYU`, `HAMSİKOYU`, `HAMSIKOYU`
   - `HAMSİ` (tek başına, en önemlisi)
   - `HAMSİ KÖY`, `HAMSİKÖY`, `HAMSİ OYUN`, `HAMSİ LİMAN`
   - `ANCHOVY COVE`, `ANCHOVY`
5. Mümkünse **Nice sınıfı** filtresine `9`, `28`, `41` yaz. Filtre yoksa sonuç listesinde sınıf sütununa bak.
6. Her sonuçta şuna bak: **durum** (tescilli / başvuru / reddedildi / süresi doldu), **sınıflar**, **sahip**,
   **başvuru tarihi**. Yalnız **yürürlükteki** kayıtlar ve **yeni başvurular** önemli.
7. Ekran görüntülerini al ve tarihiyle sakla (bu belgenin yanına koyabilirsin).
8. Karar:
   - Sınıf 9/28/41'de hiç ilgili kayıt yoksa: **yayımla.** Tescil istiyorsan "HAMSİ KOYU" kelime markası olarak
     sınıf 9 + 41'e başvur (bkz. HUKUK.md §3).
   - "HAMSİ" tek kelimesi ya da "HAMSİ OYUN" gibi bir kayıt 9/41'de çıkarsa: bir **marka vekiline** kısaca sor. Genelde
     birkaç yüz ile birkaç bin TL arası bir görüş ücreti alır. Gerekirse adı değiştir. İlk mağaza yüklemesinden önce
     değiştirmek çok daha kolay.
   - Aynı ad ("HAMSİ KOYU") çıkarsa: adı değiştir.
9. İstersen TÜRKPATENT'in ücretli **"Benzer Marka Araştırması"** hizmetini de kullanabilirsin (resmî ücret için
   https://www.turkpatent.gov.tr/marka-islem-ucretleri).

### 5.2 Uluslararası veri tabanları (ücretsiz, ~10 dk)

- **WIPO Global Brand Database** — https://branddb.wipo.int: "Brand name" alanına `hamsi` yaz. Sol taraftan Nice
  sınıfı 9, 28, 41 filtresini uygula. Ayrıca `hamsi koyu` ve `anchovy cove` ara.
- **TMview** — https://www.tmdn.org/tmview: `hamsi*` ara. Ofis olarak EUIPO, TR ve WIPO'yu seç. Sınıf 9/28/41.
- **EUIPO eSearch** — https://euipo.europa.eu/eSearch: `hamsi` ara.

### 5.3 Mağaza içi arama (ücretsiz, ~5 dk)

- Telefonda App Store ve Google Play'i aç. **Türkiye mağazasında** şunları ara: `Hamsi Koyu`, `Hamsi`, `Hamsiköy`,
  `Anchovy Cove`.
- Bilgisayardan: `https://apps.apple.com/tr/search?term=hamsi` ve
  `https://play.google.com/store/search?q=hamsi&c=apps&gl=TR`.
- Özellikle "Brutal Hamsi" geliştiricisinin yeni bir "Hamsi …" oyunu olup olmadığına bak.

### 5.4 Alan adı (öneri: al)

- **`hamsikoyu.com`** bugün boşta görünüyor. Yıllık ~10-15 $. Oyun duyulursa kapılabilir. Mağaza sayfası, gizlilik
  politikası ve basın sayfası için GitHub Pages'e yönlendirilebilir. **Öneri: al.**
- **`hamsikoyu.com.tr`**: İsteğe bağlı. Türk kullanıcılar için güven verir. Belge gerekmez, yıllık ücreti düşük. Kayıt
  ettirmek istersen `.com` ile birlikte al.
- Almadan önce kayıt firmasında "müsait mi?" araması yap (DNS sonucu kesin değil, bkz. §3.5).
- GitHub Pages ile özel alan adı: depoya `CNAME` dosyası ekle, alan adında `CNAME` kaydı `recaikas.github.io`'yu
  göstersin. Mağazadaki gizlilik adresini buna göre güncelle.

### 5.5 Kullanıcı adları

- Instagram, X, TikTok ve YouTube'da `@hamsikoyu` boşsa al. Doluysa `@hamsikoyuoyun` ya da `@hamsikoyugame` dene.
- Trabzon Hamsiköy hesaplarıyla karışmaması için profil açıklamasına "piksel sanatlı balıkçı oyunu" gibi net bir ifade
  yaz.

### 5.6 Kayıt tut

- Oyunun "Hamsi Koyu" adıyla **ilk yayın tarihini** belgeleyen kanıtları sakla: git geçmişi, GitHub Pages yayın tarihi,
  mağaza yayın e-postaları. Tescil yapmasan da SMK m.6/3 ve haksız rekabet (TTK m.54-55) itirazlarında işe yarar.

---

## 6. Doğrulanamayanlar (özet)

- TÜRKPATENT, WIPO, EUIPO, TMview marka kayıtları: **hiç sorgulanamadı.**
- App Store ve Google Play: **doğrudan aranamadı.** Yalnız web aramasıyla dolaylı tarandı.
- Alan adları: **WHOIS/RDAP açılamadı.** Yalnız DNS'e bakıldı.
- Sosyal medya kullanıcı adları: **kontrol edilemedi.**
- "Brutal Hamsi" ve "Hamsi Oyun" adına tescilli marka olup olmadığı: **bilinmiyor.**

## 7. Kaynaklar

- Foursquare, Hamsi Koyu — https://tr.foursquare.com/v/hamsi-koyu/55d32e83498e2ad73319fbdf
- Ekşi Sözlük, "hamsi koyu" — https://eksisozluk.com/hamsi-koyu--669570
- Garipçe Köyü (Google Groups) — https://groups.google.com/g/kose-bucak-istanbul/c/IVupvfUFZ4Y
- TÜRKPATENT Coğrafi İşaretler, Hamsiköy Sütlacı — https://ci.turkpatent.gov.tr/cografi-isaretler/detay/38380
- Kültür Portalı, Hamsiköy Sütlacı — https://www.kulturportali.gov.tr/portal/hamsikoysutlaci
- Hamsiköyü Kalkındırma ve Dayanışma Derneği — https://www.facebook.com/hamsikoydernegi/
- Google Play, Brutal Hamsi — https://play.google.com/store/apps/developer?id=Brutal+Hamsi
- Hamsi Oyun — https://hamsioyun.com/ · https://m.facebook.com/hamsi.oyun
- Anchovy Squad (App Store) — https://apps.apple.com/us/app/anchovy-squad/id6504208065
- Fisherman Hasan: Fish Market (App Store) — https://apps.apple.com/us/app/fisherman-hasan-fish-market/id6761220782
- Balıkçı Simülatör (itch.io) — https://ygz445yt.itch.io/balikci-simulator
- HAMSİ GRUP GIDA — https://www.find.com.tr/Company/hamsigrupgidasanayiveticaretlimitedsirketi
- Hamsilos Tatil Köyü (Setur) — https://www.setur.com.tr/hamsilos-tatil-koyu-apart-hotel
- Hamsi Butik Otel — http://hamsi.com.tr/butik-otel-cafe
- TÜRKPATENT Marka Araştırma — https://www.turkpatent.gov.tr/arastirma-yap
- e-Devlet, Türk Patent ve Marka Kurumu — https://www.turkiye.gov.tr/turk-patent-ve-marka-kurumu
