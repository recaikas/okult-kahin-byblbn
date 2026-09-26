# Hamsi Koyu — Hukuki ve resmî işler rehberi

> **Önemli uyarı:** Bu belge hukuki danışmanlık değildir. Kaynaklardan derlenmiş, tek kişilik ve para kazanmayan bir
> oyun geliştiricisi için hazırlanmış pratik bir kontrol listesidir. Resmî ücretler her yıl değişir. **Marka başvurusu**
> için bir **marka vekiline**, **KVKK ve yurt dışına veri aktarımı** için bir **avukata** son sözü söylet.
> Kaynaklar 2026-09-26'da tarandı. Doğrulanamayan her şey metinde **(doğrulanmadı)** diye işaretlendi.

İlgili dosyalar: [`LICENSE`](LICENSE) · [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) ·
[`about.html`](about.html) · [`privacy.html`](privacy.html) · [`MAGAZA.md`](MAGAZA.md)

---

## 0. Kısaca

1. **Telif hakkı kendiliğinden doğar.** Kayıt ya da tescil gerekmez. Yapman gereken, *senin olduğunu ve ne zaman
   yaptığını* kanıtlayabilmek. Bunun için GitHub geçmişi ve ücretsiz zaman damgaları çoğu durumda yeter.
2. **Depo herkese açık ve lisans dosyası yok.** Hukuken "tüm hakları saklı" anlamına gelir, ama ziyaretçi bunu
   bilmez. Öneri: özel bir **"kaynak kodu görünür, yayımlamak yasak"** lisansı. Metin `LICENSE`'ta (v1.7'de eklendi).
3. **Marka tescili isteğe bağlı.** Türkiye'de tek sınıf için yaklaşık **9.830 TL** resmî ücret var, iki sınıf için
   yaklaşık **12.650 TL**. Önce ücretsiz ön araştırmayı yap. "Hamsi Koyu" gerçek bir yer adı (İstanbul Garipçe'de bir
   koy). Bu, tescilde küçük bir risk.
4. **Mağazalar:** Apple yılda 99 $, Google bir kez 25 $. Para kazanmadığın için Apple'da AB **"trader değilim"**
   (non-trader) beyanı uygun. Google'da ev adresin görünmez, yalnız adın, ülken ve geliştirici e-postan görünür.
   Google'da yeni kişisel hesap için **12 test kullanıcısı ve 14 gün kapalı test** şartı var.
5. **En büyük açık KVKK.** Supabase'e giden veriler yurt dışına aktarım sayılır. **v1.7'de yapıldı:** çevrimiçi
   paylaşım artık varsayılan olarak kapalı; ilk kullanımda açık rıza soruluyor. `privacy.html`'e veri sorumlusu,
   hukuki sebep, yurt dışı aktarım, saklama süresi ve haklar bölümleri eklendi. **Sana kalan:** Supabase projesini
   AB'de (Frankfurt) kurmak ve iletişim e-postasını yazmak.
6. **Çocuk kategorisini hedefleme.** İçerik her yaşa uygun kalabilir (PEGI 3 / 4+). Ama hedef kitleyi **13+** seç.
   Apple'ın Kids kategorisini ve Google'ın Families programını seçme.
7. **Vergi:** gelir yoksa yükümlülük de yok. Reklam, satın alma ya da bağış eklersen GVK 20/B istisnasına bak.

---

## 1. Depoda bulduklarım

| Konu | Durum | Ne yapmalı |
|---|---|---|
| GitHub deposu `recaikas/okult-kahin-byblbn` | **Herkese açık** (GitHub API: `private: false`). GitHub Pages ile yayınlanıyor. | Lisans ekle (§4). |
| LICENSE dosyası | **Eklendi** (`balikci-tycoon/LICENSE`, v1.7). Telif sahibi olarak GitHub adın yazılı. | İstersen gerçek adınla değiştir. |
| Depoda başka proje | Kökte ayrı bir Python/Streamlit projesi var (`app.py`, "Okult Kahin"). | Lisansı `balikci-tycoon/` ile sınırla ya da oyunu kendi deposuna taşı (§4.4). |
| Commit yazarları | 60 commit'in **44'ü "Claude"** (yapay zekâ aracı) adına, 16'sı `recaikas` adına. | Bundan sonra commit'ler kendi adınla olsun. Yapay zekâ yardımı için "Co-Authored-By" satırı yeterli (§2.4). |
| İmzalı commit | Yok (5 commit GitHub web imzalı, doğrulanamadı). | İsteğe bağlı: SSH ile commit imzala (§2.2). |
| Üçüncü taraf varlık | Yalnız **Pixelify Sans** (OFL) ve mobil kabukta **Capacitor + eklentiler** (MIT), **Apache Cordova** ve **AndroidX** (Apache 2.0). Müzik ve sesler Web Audio ile kodda üretiliyor, dosya yok. Grafikler kodla çiziliyor. | `THIRD_PARTY_NOTICES.md` hazır. Hakkında ekranına ekle (§7). |
| `@capacitor-community/in-app-review` | `package.json`'da var ama `node_modules`'da kurulu değil. Lock dosyasına göre lisansı MIT. Android tarafı Google'ın Play Review kitaplığını çekiyor olabilir. | `npm install` sonrası lisans satırını doğrula. |
| Çevrimiçi skor varsayılanı | **v1.7'de düzeltildi:** varsayılan kapalı; skor tablosu ya da görüş formu ilk kullanıldığında açık rıza soruluyor. Eski "açık" ayarı onay sayılmıyor. | — |
| `privacy.html` | **v1.7'de tamamlandı:** veri sorumlusu, hukuki sebepler, yurt dışı aktarım (AB/Almanya), saklama süresi (24 ay; `bt_cleanup`), haklar ve şikâyet yolu eklendi. | İletişim e-postasını doldur. |
| `MAGAZA.md` | **v1.7'de güncellendi:** yeni ad, reklamsız ve ücretsiz karar, rıza, AB sunucusu. | — |
| Uygulama kimliği | **v1.7'de değişti:** `io.github.recaikas.hamsikoyu`, uygulama adı "Hamsi Koyu". | İlk yüklemeden sonra değiştirilemez. |

---

## 2. Telif hakkı (5846 sayılı FSEK)

### 2.1 Nasıl korunuyorsun?

- **Koruma kendiliğinden doğar.** Eser yaratıldığı anda korunur; tescil şartı yoktur. Bilgisayar programları FSEK
  m.2/1-1'de "ilim ve edebiyat eseri" olarak korunur. Oyunun müziği, çizimleri ve metinleri de ayrı ayrı eser
  sayılabilir.
- **Süre:** eser sahibinin ölümünden sonra 70 yıl.
- **Uluslararası koruma:** Türkiye Bern Sözleşmesi ve TRIPS'e taraf. Bu yüzden ABD, AB ve diğer ülkelerde de
  kendiliğinden korunursun. Mağaza şikâyet formları da bu hakka dayanır.
- **Senin işin:** kavgada iki şeyi kanıtlamak. (1) Eser senin. (2) Karşı taraftan önce vardı.

### 2.2 Kanıt oluşturma yolları

| Yol | Maliyet | Pratik değeri | Öneri |
|---|---|---|---|
| **GitHub geçmişi** (commit'ler, push tarihleri, Pages dağıtım kayıtları, Actions günlükleri) | Ücretsiz | Yüksek. Commit tarihini kişi kendisi girebilir, ama GitHub'ın push/Actions/Pages kayıtları sunucu tarafında tutulur ve üçüncü kişi kaydıdır. Mağaza ve GitHub şikâyetlerinde genelde yeter. | **Şimdi.** Her sürüme `git tag v1.0.0` at ve GitHub'da **Release** oluştur. |
| **Software Heritage** "Save code now" — https://archive.softwareheritage.org/save/ | Ücretsiz | Yüksek. Bağımsız, kâr amacı gütmeyen bir arşiv; depoyu tarihli ve kalıcı biçimde saklar. | **Şimdi**, sonra her büyük sürümde. |
| **Internet Archive / Wayback Machine** — https://web.archive.org/save | Ücretsiz | Orta. Web sürümünün ve gizlilik sayfasının tarihli kopyası. | Yayın gününde. |
| **OpenTimestamps** (https://opentimestamps.org) ile bir sürüm ZIP'inin SHA-256 özetini zaman damgala | Ücretsiz | Orta-yüksek. Dosyanın o tarihte var olduğunu kriptografik olarak gösterir. | İsteğe bağlı. |
| **İmzalı commit'ler** (SSH anahtarıyla, GitHub'da "Verified") | Ücretsiz | Orta. Commit'in senin anahtarınla yapıldığını gösterir. | İsteğe bağlı. `git config --global gpg.format ssh` + `user.signingkey`. |
| **Noter** (kaynak kod ve oyun kaydını içeren USB/DVD'yi tarihli tutanakla teslim ya da içerik tespiti) | Noter ücret tarifesine bağlı; birkaç bin TL mertebesinde olabilir **(doğrulanmadı)** | Yüksek. Türk mahkemesinde güçlü resmî belge. | Oyun gerçekten tutarsa ya da bir anlaşmazlık sezersen. |
| **Kültür ve Turizm Bakanlığı Telif Hakları Genel Müdürlüğü — isteğe bağlı kayıt-tescil** (bilgisayar programı) | 1250 gösterge × memur aylık katsayısı formülüyle her yıl güncellenir. 2026 tutarı resmî kaynaktan doğrulanamadı; ikincil kaynaklarda yazılım için ~5.850 TL, kitap için 1.735 TL geçiyor **(doğrulanmadı)**. | Orta. Hak **doğurmaz**, yalnız **ispatı kolaylaştırır** (karine). Uluslararası şikâyetlerde pek sorulmaz. | İsteğe bağlı. |

**Telif Hakları Genel Müdürlüğü kayıt-tescil süreci** (ikincil kaynaklardan):
- Başvuru e-Devlet ile https://tescil1.telifhaklari.gov.tr üzerinden ya da şahsen/posta ile yapılır.
- Bilgisayar programında **kaynak kodun ilk 25 ve son 25 sayfası** yüklenir; kod 50 sayfadan kısaysa tamamı.
- Formu eser sahibi olarak sen imzalarsın. Ücret banka dekontuyla ödenir.
- Başvuru formu şablonu:
  https://tescil1.telifhaklari.gov.tr/TelifHaklariNet/DocumentTemplate/BILGISAYAR_PROGRAMLARI_VE_VERITABANI.pdf
- Güncel ücret: https://telifhaklari.ktb.gov.tr (bu ortamdan erişilemedi).

### 2.3 Oyunun hangi parçaları senin?

- **Senin:** kod (`game.js`, `specials.js`, `native.js` …), kodla üretilen müzik ve sesler, kodla çizilen pixel art,
  simge (`mobile/assets-src/iconart.html`), karakterler, metinler, oyun tasarım belgeleri (`FAZ_PLANI.md`,
  `BOLUM2_TASLAK.md`).
- **Senin değil:** yazı tipi (OFL) ve mobil kabuk (Capacitor/Cordova/AndroidX). Bunlar lisanslarına uyduğun sürece
  serbestçe kullanılır (§7).
- **Oyun fikri ve mekanikleri** ("balık topla, sat, büyü" gibi) telifle korunmaz. Başkası benzer bir oyun yapabilir.
  Korunan şey senin somut kodun, görsellerin, metinlerin ve müziğin. Buna "klon" deyip şikâyet edemezsin; birebir
  kopyaya edebilirsin.

### 2.4 Yapay zekâ yardımıyla yazılan kod

- Türk hukukunda eser sahibi **gerçek kişidir**. Yapay zekânın tek başına ürettiği çıktı eser sayılmaz. İnsanın
  yaratıcı seçimleri eserde "hususiyet" olarak görünüyorsa koruma o insana aittir. ABD'de de aynı yön var
  (Thaler v. Perlmutter, 2025) ve AB'de benzer.
- Bu projede oyun fikri, tasarımı, karakterler, bölümler ve dengeler senin kararların. Yapay zekâ bir araç olarak
  kullanıldı. **Pratikte:**
  - Tasarım belgelerini, taslakları ve verdiğin kararları sakla. Depodaki `FAZ_PLANI.md`, `BOLUM2_TASLAK.md` ve README
    sürüm notları iyi kanıt.
  - Commit'lerin ana yazarı **sen** ol. Bundan sonra `git config user.name "[AD SOYAD]"` ayarla. Yapay zekâ katkısını
    commit mesajındaki "Co-Authored-By" satırı gösterir.
  - Kullandığın aracın koşullarına bak. Anthropic'in tüketici koşulları, çıktılar üzerindeki (varsa) haklarını
    kullanıcıya devreder. Güncel metni kontrol et.
  - Mağazalar yapay zekâ kullanımını beyan etmeni istemez **(2026-09 itibarıyla, doğrulanmadı)**. Hakkında ekranına
    istersen "yapay zekâ yardımıyla geliştirildi" satırını ekle; zorunlu değil.
  - Risk: bir gün birisi "bu satırlar senin eserin değil" diye itiraz ederse, korumanın senin yaratıcı katkına
    dayandığını gösterebilmelisin. Oyunun bütünü (seçim, düzen, karakterler, metinler) bunu fazlasıyla gösterir.

---

## 3. Marka: "Hamsi Koyu"

### 3.1 Değer mi?

- **Marka tescili adı korur, kodu korumaz.** Telif kopyalanan kodu ve görselleri korur; marka ise başkasının
  "Hamsi Koyu" adıyla ya da karıştırılacak kadar benzer bir adla oyun yayımlamasını engeller.
- **Tescilsiz de bir miktar korunursun:**
  - Türk Ticaret Kanunu m.54-55 (haksız rekabet),
  - Sınai Mülkiyet Kanunu m.6/3 (daha önce kullanılan tescilsiz işaret sahibinin itirazı),
  - Apple'ın ve Google'ın taklit/kimliğe bürünme kuralları.

  Ama bunların hepsini ispatlamak zordur.
- **Karar:** Ücretsiz bir hobi oyunu için tescil **şart değil**.
  - Oyun ilgi görürse ya da biri adı kapmaya çalışırsa değerlidir.
  - Bütçe uygunsa (≈10-13 bin TL) yayından önce ya da hemen sonra **sınıf 9 + 41** ile başvur.
  - Bütçe uygun değilse şimdilik yalnız ön araştırmayı yap, yayınla ve ilk yılda tekrar değerlendir.
  - Başvuru tarihi önemlidir: ilk başvuran öncelik kazanır.

### 3.2 Sınıflar (Nice)

| Sınıf | İçerik | Gerekli mi? |
|---|---|---|
| **9** | İndirilebilir oyun yazılımı, mobil uygulamalar | **Evet**, temel sınıf |
| **41** | Çevrimiçi oyun sağlama hizmetleri, eğlence hizmetleri | **Evet**, web sürümü ve çevrimiçi skor için |
| 28 | Oyuncaklar, oyunlar, el oyun cihazları | Hayır. Yalnız fiziksel ürün (kutu oyunu, oyuncak) yaparsan |
| 16 / 25 | Basılı ürünler / giysi (tişört vb.) | Hayır. Yalnız ürün satarsan |

### 3.3 Ücretler (TÜRKPATENT, 2026)

Kaynak: 31.12.2025 tarihli Resmî Gazete'deki 2026 tarife tebliği. Resmî sayfa bu ortamdan açılamadı; rakamlar birden
fazla marka vekili sitesinden alındı. Başvurmadan önce https://www.turkpatent.gov.tr/marka-islem-ucretleri adresinden
doğrula.

| Kalem | Tutar |
|---|---|
| Başvuru ücreti (1 sınıf) | 2.820 TL |
| 2. sınıf | +2.820 TL (bir kaynakta 750 TL; **çelişkili**) |
| 3. ve sonraki her sınıf | +3.150 TL |
| Tescil + belge ücreti | 7.010 TL |
| **Toplam: 1 sınıf / 2 sınıf / 3 sınıf** | **≈ 9.830 / 12.650 / 15.800 TL** |
| Yenileme (10 yılda bir, 2 sınıfa kadar) | ≈ 8.730 TL |
| Marka vekili (isteğe bağlı) | Serbest, genelde birkaç bin TL + KDV. Resmî ücretlere KDV eklenmez. |

- **Süreç:** e-Devlet ile TÜRKPATENT e-başvuru sistemine gir. Vekil zorunlu değil. Adımlar:
  1. İnceleme (birkaç ay).
  2. Resmî Marka Bülteni'nde **2 ay itiraz süresi**.
  3. Tescil.

  İtiraz yoksa toplam **6-12 ay** sürer. Koruma başvuru tarihinden itibaren 10 yıldır.
- **Yurt dışı:**
  - AB markası (EUIPO): 1 sınıf için ≈ 850 € **(doğrulanmadı)**.
  - WIPO Madrid sistemiyle Türkiye başvurusu üzerinden başka ülkelere genişletme: ülke başına ek ücret.

  Hobi oyunu için gerekmez.
- **Başvuru türü:** önce **kelime markası** ("HAMSİ KOYU", logosuz). En geniş korumayı verir.

### 3.4 Ön araştırma (başvurmadan önce, ücretsiz)

1. **TÜRKPATENT marka araştırması:** https://www.turkpatent.gov.tr/arastirma-yap. "Marka Araştırma" bölümünde
   "HAMSİ" ve "HAMSİ KOYU" ara. Sınıf 9, 41 ve 28'e bak. Benzer yazılışları da dene: "HAMSIKOY", "HAMSİ KÖY",
   "HAMSİKÖY". TÜRKPATENT'in ücretli "benzer marka araştırması" hizmeti de var.
2. **WIPO Global Brand Database:** https://branddb.wipo.int. Birçok ülkenin ve Madrid sisteminin kayıtları.
3. **TMview (AB + ulusal ofisler):** https://www.tmdn.org/tmview. EUIPO eSearch: https://euipo.europa.eu/eSearch
4. **Mağazalar:** App Store'da ve Google Play'de "Hamsi Koyu" ve "Hamsi" ara (TR ve ABD mağazaları). itch.io, Steam
   ve GitHub'da da ara.
5. **Alan adı ve kullanıcı adları:**
   - `hamsikoyu.com` / `.com.tr` boşta mı? Bak. `.com.tr` artık belge istemiyor; yıllık ücret düşük.
   - Kullanabileceğin sosyal medya adlarını al.

**Benim yapabildiğim arama (2026-09-26):**
- Web aramasında "Hamsi Koyu" adlı bir oyun ya da uygulama çıkmadı.
- GitHub'da bu adla depo yok.
- Ama **"Hamsi Koyu" gerçek bir yer adı**: İstanbul Sarıyer'de Garipçe yakınında küçük bir koy (Foursquare, Ekşi
  Sözlük). Ayrıca Trabzon'da ünlü "Hamsiköy" (sütlaç) ve Sinop'ta "Hamsilos Koyu" var.
- TÜRKPATENT, WIPO ve mağaza aramaları bu ortamdan **yapılamadı** (erişim engellendi). 1-4. adımları sen yap.

**Olası riskler:**
- Yer adları, malın/hizmetin coğrafi kaynağını gösteriyorsa tescil edilmez (SMK m.5/1-c). Bir oyun için "Hamsi Koyu"
  kaynak göstermez, hayalî bir yer adıdır. Bu yüzden büyük olasılıkla engel değil, ama inceleme uzmanı sorabilir.
- Gıda ve restoran sınıflarındaki (29, 43) "HAMSİ…" markaları sınıf 9/41 için genelde çakışma sayılmaz. Yine de marka
  vekiline sor.

---

## 4. Depo lisansı

### 4.1 Karşılaştırma

Hedef: kod **görünsün**, insanlar **oynasın, öğrensin, video çeksin**, ama kimse oyunu **reklamlı ya da reklamsız
yeniden yayımlayamasın**.

| Seçenek | Başkası mağazaya yeniden yükleyebilir mi? | Reklamlı klon? | Artı | Eksi |
|---|---|---|---|---|
| **Lisans yok** (şu anki durum) | Hayır (tüm hakları saklı) | Hayır | Hukuken en kısıtlayıcı | Ziyaretçi kuralları bilmez. GitHub Koşulları yine de GitHub içinde görüntüleme ve fork izni verir. Katkı kuralı yok. |
| **Özel "kaynak görünür" lisans** (önerilen, `LICENSE`) | **Hayır** | **Hayır** | Ne serbest ne yasak açıkça yazılı. Video/yayın izni ve katkı maddesi var. Türk hukuku seçili. | Standart bir lisans değil (OSI onaylı değil). Tek başına yazılmış metin; avukat gözü iyi olur. |
| **PolyForm Noncommercial 1.0.0** | **Evet**, ticari olmadığı sürece (ör. reklamsız ücretsiz klon) | Hayır | Avukatların yazdığı, bilinen bir metin | Ücretsiz kopyaların mağazaya çıkmasına izin verir. Senin hedefinle çelişir. |
| **CC BY-NC-ND 4.0** | Hayır (türev yasak, ticari yasak) | Hayır | Görsel ve müzik için iyi | Creative Commons yazılım için önermez. Burada varlıklar zaten kodun içinde. |
| **GPL-3.0** | **Evet** | **Evet** (GPL ticari kullanıma izin verir, reklam eklenebilir) | Özgür yazılım | Hedefinin tam tersi. App Store koşullarıyla uyumu tartışmalı (FSF'nin görüşü; VLC 2011'de App Store'dan bu yüzden kaldırıldı). Katkı alırsan kendi uygulamanı bile yayımlamak karmaşıklaşır. |
| **MIT / Apache** | Evet | Evet | En serbest | Hedefinle çelişir |

**Öneri:** özel **"Hamsi Koyu Kaynak Görünür Lisansı 1.0"** (`LICENSE`, TR + EN).

Not: Oyun bir web oyunu olduğu için kodu tarayıcıda zaten herkes görebilir. Lisans kodu gizlemez, **ne yapılabileceğini**
söyler. Şikâyetlerde (§5) dayanağın odur.

### 4.2 Lisansı yerleştirme

1. **Yapıldı (v1.7):** `balikci-tycoon/LICENSE`. Telif sahibi "recaikas (GitHub: @recaikas)", iletişim GitHub profili,
   yetkili mahkeme "telif sahibinin yerleşim yeri". Gerçek adını yazmak istersen bu satırı değiştir. Depo köküne
   kopyalanmadı, çünkü kökte başka bir proje var. Kökteki kopyaya "yalnız balikci-tycoon/ için" notu ekle.
2. `README.md`'nin başına şu satırı ekle:
   "Kaynak kodu görünürdür ama açık kaynak değildir. Yayımlama ve ticari kullanım yasaktır; bkz. LICENSE."
3. `mobile/package.json` → `"license": "SEE LICENSE IN LICENSE"`.
4. Dosya başlıklarına kısa bir satır ekle (isteğe bağlı):
   `/* Hamsi Koyu — © 2026 [AD SOYAD]. Tüm hakları saklıdır. Bkz. LICENSE */`
5. Oyun içi Hakkında ekranına © satırını koy (§7).

### 4.3 Depoyu gizli yapmak?

- Ücretsiz GitHub hesabında **gizli depodan GitHub Pages yayını yapılamaz**. GitHub Pro (≈4 $/ay) gerekir.
  **(doğrulanmadı, GitHub fiyatlandırmasını kontrol et)**
- Alternatif: kaynak deposunu gizli yap, yalnız derlenmiş dosyaları ayrı ve herkese açık bir "pages" deposuna gönder.
- Ama web oyunun kodu tarayıcıdan yine okunur. Gizlilik küçük bir engel, hukuki koruma değildir. **Açık depo + net
  lisans yeterli.**

### 4.4 Oyunu kendi deposuna taşımak (isteğe bağlı, yayından önce)

- Depo adı ("okult-kahin-byblbn") ve depodaki diğer proje, marka ve lisans açısından karışıklık yaratır.
- İlk mağaza yüklemesinden **önce** `recaikas/hamsi-koyu` gibi yeni bir depo açabilirsin (`git subtree split` geçmişi
  korur).
- Bu durumda gizlilik adresi `https://recaikas.github.io/hamsi-koyu/privacy.html` olur. Mağazalara yeni adresi ver.
- Eski depodaki geçmişi silme; o da kanıttır.

---

## 5. Biri oyunu kopyalar ya da yeniden yüklerse

### 5.1 Önce kanıt topla (aynı gün)

1. Mağaza sayfasının, geliştirici adının ve yüklenme tarihinin ekran görüntülerini al. URL'yi ve uygulama kimliğini
   (Android paket adı, App Store `id…`) kaydet.
2. Sayfayı https://web.archive.org/save ile arşivle.
3. Mümkünse uygulamayı indir ve içindeki dosyaları seninkilerle karşılaştır. Aynı `game.js`, aynı metinler, aynı
   Türkçe karakter isimleri güçlü kanıttır. Dosyaların SHA-256 özetini al.
4. Kendi kanıtlarını hazırla: GitHub commit/release bağlantıları, Software Heritage kaydı, ilk yayın tarihin.

### 5.2 Kibarca uyar (isteğe bağlı)

Karşı tarafın iletişim adresi varsa kısa bir mesaj at: "kaldırmanı rica ediyorum, lisans bağlantısı şu". Çoğu zaman
yeter. Tehdit etme.

### 5.3 Resmî şikâyet yolları

| Nerede | Adres | Not |
|---|---|---|
| **GitHub** (kopya depo ya da Pages) | Form: https://github.com/contact/dmca — Rehber: https://docs.github.com/en/site-policy/content-removal-policies/guide-to-submitting-a-dmca-takedown-notice | Bildirim adını karartılmış hâlde github/dmca deposunda yayımlanır. Karşı taraf itiraz ederse 10-14 günde içerik geri gelebilir. |
| **Apple App Store** | https://www.apple.com/legal/intellectual-property/dispute-forms/app-store/ — Yalnız ad çakışması: https://www.apple.com/legal/intellectual-property/dispute-forms/app-store/app-name-dispute.html | Apple önce iki tarafı birbirine yönlendirir. Tek formda 50 uygulamaya kadar bildirilebilir. |
| **Google Play** | https://support.google.com/legal/troubleshooter/1114905 → Google Play → telif / marka — Politika: https://support.google.com/googleplay/android-developer/answer/9888072 | Karşı taraf itiraz edebilir. İtirazdan sonra 10 iş günü içinde dava açılmazsa içerik geri gelebilir. |
| **Web sitesi / oyun portalı** | Sitenin "DMCA" ya da "Report" sayfası. Yoksa barındırma firmasına bildir (WHOIS / `whois` ile bul). | itch.io, Poki, CrazyGames ve benzerlerinin kendi formları var. |
| **Türkiye'deki site** | 5651 s. Kanun ve FSEK Ek m.4: önce içerik sağlayıcıya ihtar, 3 gün içinde kaldırılmazsa Cumhuriyet savcılığına başvuru | Avukatla ilerle. |

- Şikâyet formlarında "hak sahibi olduğuma dair beyan" (yalan beyan cezası altında) istenir. Yalnız birebir kopya
  için kullan.
- Sadece benzer bir oyun için şikâyet etme. Kötüye kullanım senin hesabına zarar verir.
- Formlar senden gerçek ad ve iletişim bilgisi ister. Bu bilgi karşı tarafa iletilebilir.

---

## 6. Mağaza ve resmî yükümlülükler (ücretsiz, reklamsız, bireysel geliştirici)

### 6.1 Apple Developer Program (bireysel)

- **Ücret:** yıllık 99 $. Apple'ın ücret muafiyeti yalnız kâr amacı gütmeyen kuruluşlar, eğitim ve kamu kurumları
  içindir; bireylere uygulanmaz.
- **Satıcı adı:** bireysel hesapta App Store'da **gerçek adın ve soyadın** satıcı olarak görünür. Takma ad için kurumsal
  hesap (şirket + D-U-N-S) gerekir.
- **AB Dijital Hizmetler Yasası (DSA) — "trader" durumu:**
  - App Store Connect her geliştiriciden beyan ister. AB'de yayın için bu zorunlu.
  - **Trader** (tacir) dersen: adresin, telefonun ve e-postan AB mağaza sayfasında **herkese açık** görünür.
  - **Non-trader** dersen: iletişim bilgisi gösterilmez. AB'li kullanıcılara "tüketici hukuku hakları bu sözleşmeye
    uygulanmaz" notu gösterilir.
  - **Senin durumun:** ücretsiz, reklamsız, satın almasız, ticari amaçsız bir birey. **Non-trader beyanı uygun.**
    Reklam, satın alma ya da düzenli gelir eklersen trader'a geçmen gerekebilir. Durum uygulama bazında
    değiştirilebilir.
  - Rehber: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/
- **Şifreleme (export compliance):** oyun yalnız HTTPS kullanıyor. App Store Connect'te "standart şifreleme,
  muaf" seçeneği uygun. `Info.plist`'e `ITSAppUsesNonExemptEncryption = NO` ekle.
- **Yaş derecelendirmesi:** Apple 2025'te sistemi yeniledi (4+, 9+, 13+, 16+, 18+) ve yeni soruları 31 Ocak 2026'ya
  kadar zorunlu yaptı. **Denetlenmeyen kullanıcı içeriği** derecelendirmeyi yükseltebilir. §6.6'ya bak.

### 6.2 Google Play (kişisel hesap)

- **Ücret:** bir kez 25 $. Kimlik doğrulama gerekir (resmî kimlik, yasal ad, adres). Adres doğrulanır ama **para
  kazanmıyorsan herkese gösterilmez**.
- **Herkese açık görünenler:** geliştirici adın (yasal adın), ülken ve **geliştirici e-posta adresin** (zorunlu).
  Satış ya da uygulama içi satın alma yaparsan **tam adresin** de görünür.
  - Öneri: yalnız bu iş için ayrı bir e-posta adresi aç. **[GELİŞTİRİCİ E-POSTASI]**
- **D-U-N-S:** kişisel hesapta gerekmez. Yalnız kurumsal hesapta gerekir.
- **Kapalı test şartı:** 13 Kasım 2023'ten sonra açılan kişisel hesaplarda üretime çıkmadan önce en az **12 test
  kullanıcısının 14 gün kesintisiz** kapalı teste katılması gerekir. Aralık 2024'te 20'den 12'ye indi. Sonra
  "üretim erişimi" başvurusu yapılır; inceleme genelde ≤7 gün sürer.
  - Rehber: https://support.google.com/googleplay/android-developer/answer/14151465
  - Pratik: aileni ve arkadaşlarını bir Google Grubu'na ekle, testçi bağlantısını paylaş. 14 gün boyunca kimse
    ayrılmasın.
- **Android geliştirici doğrulaması (2026-2027):** Google, Play dışından kurulan uygulamalar için de geliştirici kimlik
  doğrulaması getiriyor (bazı ülkelerde 30 Eylül 2026, 2027'de tüm dünyada). Play Console hesabın zaten doğrulanmış
  olacağı için ek işin yok. APK'yı Play dışında dağıtacaksan uygulamanı bu hesaba kaydet.
- **Play Console beyanları:**
  - Reklam içeriyor mu: **Hayır**.
  - Veri güvenliği: `MAGAZA.md` §8.
  - Hedef kitle: §6.5.
  - Haber, finans, sağlık, devlet: **Hayır**.
  - Hesap silme bağlantısı: hesap oluşturulmadığı için **gerekmez**. Anonim kimlik bir hesap değildir, ama "Çevrimiçi
    verilerimi sil" düğmesini veri güvenliği formunda belirt.

### 6.3 Vergi (Türkiye)

- **Gelir yoksa vergi yükümlülüğü de yok.** Ücretsiz uygulama yayımlamak ticari faaliyet sayılmaz. Mağaza ücretleri
  (99 $ / 25 $) masraftır; beyan gerekmez.
- **İleride reklam, satın alma ya da bağış eklersen:**
  - GVK mükerrer **20/B** ("sosyal içerik üreticiliği ve **mobil uygulama geliştiriciliği**" istisnası) uygulanır:
    - vergi dairesinden bir kez **istisna belgesi** alınır (e-Devlet / İnteraktif Vergi Dairesi),
    - gelir Türkiye'deki özel bir banka hesabına gelir ve banka **%15 stopaj** keser,
    - 2026 yıllık sınırı **5.300.000 TL**; aşılırsa beyan gerekir.
  - Apple ve Google'ın vergi formları (ABD W-8BEN) da doldurulur.
  - Bağış platformları (ör. "bana bir kahve ısmarla") gri alandır. Mali müşavire sor.
  - "Masrafları karşılamak" için bile gelir alırsan önce bir mali müşavirle 30 dakika konuş.
- Bu bölüm vergi danışmanlığı değildir.

### 6.4 KVKK (6698) — en önemli bölüm

**Kişisel veri var mı?**
- Çevrimiçi skor tablosu ve görüş formu açıkken şunlar gider:
  - rastgele **kalıcı oyuncu kimliği**,
  - oyuncunun yazdığı **işletme ve karakter adı** (gerçek ad olabilir),
  - **serbest görüş metni**.
- Ayrıca Supabase sunucuları her istekte **IP adresini** görür ve kayıtlarında tutar.
- Tek başına anonim görünen kimlik, IP ve cihazla birleşince kişiye bağlanabilir. Bu yüzden KVKK ve GDPR açısından
  **kişisel veri kabul edilmeli** (takma adlı veri).
- `config.js` boşken hiçbir şey gönderilmez. KVKK işi **Supabase'i bağladığın anda** başlar.

**Veri sorumlusu sensin** (gerçek kişi). Yükümlülüklerin:

| Yükümlülük | Durum / öneri |
|---|---|
| **Aydınlatma** (m.10 + Aydınlatma Tebliği): kimlik, amaç, hukuki sebep, aktarılan kişiler, toplama yöntemi, haklar | `privacy.html` büyük ölçüde hazır. **Eksikler:** veri sorumlusunun adı, hukuki sebepler, yurt dışı aktarım, saklama süresi, m.11 hakları ve başvuru yolu. Metin aşağıda. |
| **Hukuki sebep** (m.5) | Skor tablosu: oyuncunun açtığı hizmetin sunulması (m.5/2-c) ya da meşru menfaat (m.5/2-f). Görüş formu: meşru menfaat (m.5/2-f). Bunlar yurt içi işleme için; yurt dışı aktarım ayrıca aşağıda. |
| **Güvenlik** (m.12) | İyi: RLS, yalnız fonksiyonla yazma, anon anahtarla okuma yok. Supabase hesabında 2FA aç. Görüşleri dışa aktarıp başka yerde saklama. |
| **İlgili kişi başvuruları** (m.11, en geç **30 gün** içinde yanıt) | Oyun içi silme düğmesi var. Ek olarak iletişim adresi ver. |
| **VERBİS kaydı** | **Büyük olasılıkla muafsın.** Yıllık çalışanı 50'den az, yıllık mali bilanço toplamı 100 milyon TL'den az ve ana faaliyeti özel nitelikli veri işleme olmayan veri sorumluları muaf. |
| **Veri ihlali bildirimi** (m.12/5) | Supabase anahtarın sızarsa ya da veriler açığa çıkarsa Kurula ve ilgili kişilere "en kısa sürede" bildir (Kurul kararı: 72 saat). |

**Yurt dışına aktarım (m.9; 7499 s. Kanunla değişik, 1 Haziran 2024'ten beri):**

Supabase sunucuları yurt dışında. Kanun artık şu yolları tanıyor:

1. **Yeterlilik kararı:** Kurul, ülkeye göre karar verir. **Bildiğim kadarıyla AB ya da ABD için yayımlanmış bir
   yeterlilik kararı yok (doğrulanmadı).** Yani sunucuyu AB'ye koymak tek başına KVKK sorununu çözmez; ama GDPR'ı
   kolaylaştırır ve ileride bir AB kararı çıkarsa işe yarar.
2. **Uygun güvenceler, pratikte "standart sözleşme":**
   - KVKK'nın kendi metni (Supabase'in GDPR DPA'sı ya da AB SCC'leri yerine geçmez).
   - Senin durumunda "veri sorumlusundan veri işleyene" modülü.
   - Türkçe imzalanır ve imzadan sonra **5 iş günü içinde** Kurula bildirilir (kvkk.gov.tr'deki bildirim modülü).
   - Bildirmemek idari para cezası sebebidir.
   - Supabase'in ücretsiz planda KVKK standart sözleşmesi imzalayıp imzalamayacağı **belli değil**. Destek ekibine sor.
3. **Arızi (tekil) aktarım istisnaları** (m.9/6), örneğin aydınlatılmış **açık rıza**. Bu istisnalar yalnız
   **düzenli olmayan** aktarımlar içindir. Her oyunda skor gönderen bir sistem düzenlidir, bu yüzden açık rızaya tek
   başına güvenmek **zayıf**tır.

**Pratik öneri (risk azaltma sırası):**

1. **Supabase projesini AB bölgesinde aç**: Frankfurt `eu-central-1` (Türkiye'ye en yakın). GDPR için Supabase'in DPA'sını
   panelden kabul et ya da indir.
2. **Varsayılanı kapalı yap:** `onlineOK = false` ile başla. İlk açılışta kısa bir kart göster: "Skorunu herkese açık
   tabloya göndermek ister misin? Veriler AB'deki (Almanya) Supabase sunucularında tutulur. [Gizlilik] [Evet] [Hayır]".
   Görüş formunun gönder düğmesinin yanına da tek satır aynı bilgi.
3. **Veriyi en aza indir:**
   - Oyun istatistiği ve takma ad dışında bir şey toplama.
   - Görüş metnine "kişisel bilgi yazma" uyarısı var; iyi.
   - Oyun kaydı saymak (`bt_plays`) gerçekten gerekli mi? Değilse kaldır ya da süreli sil (ör. 12 ay).
   - Ek güvenlik: işletme adını hazır bir ad listesinden seçtir. Bu hem KVKK hem kullanıcı içeriği (§6.6) sorununu
     küçültür.
4. **Supabase'e KVKK standart sözleşmesi imzalayıp imzalamayacağını yazılı sor.** İmzalarsa 5 iş günü içinde Kurula
   bildir. İmzalamazsa bir KVKK avukatına şu seçenekleri sor:
   - (a) açık rıza ile devam etmek,
   - (b) Türkiye'de barındırılan bir veritabanına geçmek (ücretli),
   - (c) çevrimiçi özellikleri yalnız Türkiye dışı oyunculara açmak ya da tamamen kaldırmak.
5. Gerçekçi risk: tek kişilik, ücretsiz, çok az veri toplayan bir oyun için yaptırım riski düşüktür, ama **sıfır
   değildir**. Aydınlatma eksikliği tek başına idari para cezası sebebidir. Aydınlatma metnini eksiksiz yapmak ucuz
   ve kolay; onu kesin yap.

**`privacy.html`'e eklenecek metin taslakları:**

> **Veri sorumlusu:** [AD SOYAD], [İL], Türkiye — iletişim: [İLETİŞİM ADRESİ]
>
> **Hukuki sebepler (KVKK m.5):** Skor tablosu verileri, sizin açtığınız çevrimiçi skor hizmetinin sunulması için
> (m.5/2-c) ve oyunu geliştirmedeki meşru menfaatimiz için (m.5/2-f); görüşler, oyunu geliştirmedeki meşru menfaatimiz
> için (m.5/2-f) işlenir.
>
> **Yurt dışına aktarım:** Çevrimiçi skor tablosu ve görüş formu verileri, Supabase Inc.'in Avrupa Birliği'ndeki
> (Almanya, Frankfurt) sunucularında barındırılır. Supabase bu verileri yalnız bizim adımıza, veri işleyen olarak
> işler. Bu aktarım [KVKK m.9 kapsamında imzalanan standart sözleşmeye / açık rızanıza] dayanır. Supabase, hizmet
> güvenliği için bağlantı IP adreslerini kısa süreli sunucu kayıtlarında tutabilir. Web sürümü GitHub Pages'te
> barındırılır; GitHub da ziyaret IP adreslerini kayıt altına alabilir.
>
> **Saklama süresi:** Skor kayıtları, silmenizi isteyene ya da skor tablosu kapatılana kadar; görüşler en çok
> [24] ay saklanır.
>
> **Haklarınız (KVKK m.11 / GDPR m.15-22):** verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltme,
> silme, itiraz etme ve zarara uğradıysanız tazminat isteme. Oyun içindeki "Çevrimiçi verilerimi sil" düğmesiyle ya
> da [İLETİŞİM ADRESİ] üzerinden başvurabilirsiniz; en geç 30 gün içinde yanıtlanır. Kişisel Verileri Koruma
> Kurulu'na (kvkk.gov.tr) ya da AB'de yaşıyorsanız kendi ülkenizin veri koruma otoritesine şikâyette bulunabilirsiniz.

(İngilizce karşılıkları da aynı yapıda eklenmeli.)

### 6.5 GDPR (AB oyuncuları) ve çocuklar

- **GDPR (AB Genel Veri Koruma Tüzüğü)** AB'deki kişilere hizmet sunduğun için geçerlidir (m.3/2).
  - Hukuki sebep: rıza ya da meşru menfaat.
  - Haklar: yukarıdaki metin.
  - Supabase'in DPA'sı AB SCC'lerini içerir.
- **AB temsilcisi (m.27):** "arada bir yapılan, büyük ölçekli olmayan, düşük riskli" işleme için istisna var. Senin
  durumun büyük olasılıkla bu istisnaya girer **(avukata teyit ettir)**.
- **Çocuklar:**
  - **ABD, COPPA:** 13 yaş altına yönelik uygulamada kalıcı kimlik bile "kişisel bilgi" sayılır ve ebeveyn izni
    gerekir.
  - **AB:** çevrimiçi hizmete rıza yaşı ülkeye göre 13-16.
  - **Google Families politikası:** hedef kitlede 13 yaş altı varsa ek kurallar ve SDK kısıtları gelir.
  - **Apple Kids kategorisi:** ebeveyn kapısı zorunlu; dış bağlantılar (gizlilik sayfası bile) bu kapının arkasında
    olmalı; üçüncü taraf analiz yasak.
- **Öneri:**
  - Play Console'da hedef yaş grubu olarak **13-15, 16-17, 18+** seç.
  - "Çocuklara hitap ediyor mu?" sorusuna dürüst yanıt ver: "çocuklar için tasarlanmadı". Mağaza metninde ve
    görsellerde çocuklara seslenme.
  - Apple'da **Kids kategorisini seçme**. Kategori: Oyunlar › Simülasyon.
  - İçerik derecelendirmesi yine "her yaşa uygun" çıkabilir. Bu çelişki değildir: derecelendirme içerikle ilgilidir,
    hedef kitle kime yönelik olduğunla.
  - `privacy.html`'deki "Oyun her yaş için uygundur" cümlesini şöyle değiştir: "İçerik her yaşa uygundur, ancak oyun
    13 yaş altındaki çocuklara yönelik değildir ve onlardan bilerek veri toplamayız."

### 6.6 Yaş derecelendirmesi (IARC / Apple anketi) — önerilen cevaplar

| Soru | Cevap | Not |
|---|---|---|
| Şiddet | Hayır / çok hafif çizgi film | "Tekme şovu" gerçekçi değil, kan yok |
| Korku, cinsellik, çıplaklık, küfür | Hayır | |
| Uyuşturucu, alkol, tütün | Hayır | Karakter metinlerinde yoksa |
| Kumar / gerçek para | Hayır | Mezat ve borsa oyun parasıyla. "Simüle kumar" sorusu çıkarsa: borsa ve mezat şans oyunu değil, ticaret simülasyonu. Emin değilsen metni oku ve dürüst cevap ver. |
| Kullanıcılar etkileşir / içerik paylaşır | **Evet** (skor tablosunda oyuncunun yazdığı ad herkese görünür) | IARC'de "Users Interact" etiketi gelir. Apple'da **denetlenmeyen kullanıcı içeriği** 13+ gerektirebilir. |
| Sohbet / mesajlaşma | Hayır | |
| Konum paylaşımı, satın alma | Hayır | |
| Reklam | Hayır | |

**Kullanıcı içeriği için (Apple Yönergesi 1.2, Google Play Kullanıcı İçeriği politikası) önerilen asgari önlemler:**
- **Yapıldı (v1.7):** oyunda (`nameBad`) ve sunucuda (`bt_bad_name`, `bt_submit` içinde) Türkçe/İngilizce kaba ad filtresi.
- Skor tablosunda uzun basınca "Bu adı bildir" seçeneği ya da en azından gizlilik sayfasında bildirim adresi.
- Bildirilen adı silme yöntemin hazır (`online/schema.sql` sonu).
- **Alternatif:** işletme adını serbest yazmak yerine hazır parçalardan seçtir ("Kıvrak" + "Hamsici" gibi). O zaman
  kullanıcı içeriği kalmaz ve derecelendirme 4+ / PEGI 3 olarak kalır.

---

## 7. Lisans bildirimleri ve Hakkında ekranı

**Zorunluluklar:**
- **Pixelify Sans (OFL 1.1):** yazı tipiyle birlikte telif satırı ve lisans metni dağıtılmalı. `fonts/OFL.txt` web ve
  uygulama paketine zaten giriyor (build-www `fonts/`'u kopyalıyor). Yazı tipi tek başına satılamaz. Oyun içinde
  kredi satırı zorunlu değil ama iyi uygulama.
- **Capacitor ve eklentileri (MIT):** telif satırı ve lisans metni "yazılımın tüm kopyalarında" bulunmalı. Uygulama
  içinde erişilebilir bir "Lisanslar" sayfası bu şartı karşılar.
- **Apache Cordova ve AndroidX (Apache 2.0):** lisans metni ya da bağlantısı ve Cordova'nın **NOTICE** metni.
- **Google Play Review kitaplığı:** Play Core SDK koşulları; ayrı bildirim zorunluluğu yok **(doğrula)**.

**Yapılacaklar:**
1. `THIRD_PARTY_NOTICES.md`'nin içeriğini oyunun Ayarlar › Hakkında › Lisanslar ekranında göster. Ya bir HTML
   sayfası (`licenses.html`) yap ve `build-www.js` ile `www/`'ya kopyala, ya da `game.js` içinde bir panel aç.
   İnternetsiz açılmalı.
2. **Yapıldı (v1.7):** Hakkında ve lisans metinleri `about.html`de; oyunda Ayarlar › Hakkında & Lisanslar.
3. Android'de Google'ın `oss-licenses-plugin` eklentisi gerekmez; kendi sayfan yeter.

---

## 8. Öncelikli kontrol listesi

### Şimdi yap (ücretsiz, 1-2 saat)

- [x] `LICENSE` `balikci-tycoon/`'a kondu, README'ye lisans satırı eklendi (v1.7). (§4.2)
- [ ] `git config user.name "[AD SOYAD]"` ve `user.email` ile bundan sonraki commit'leri kendi adına al. (§2.4)
- [ ] Mevcut sürümü etiketle (`v1.6`), GitHub'da Release oluştur. Depoyu **Software Heritage**'a, oyun adresini
      **Wayback Machine**'e kaydettir. (§2.2)
- [ ] "Hamsi Koyu" için ön araştırma: TÜRKPATENT, WIPO Brand DB, TMview, App Store, Google Play, alan adı. (§3.4)
- [ ] Varsa `hamsikoyu.com` / `.com.tr` alan adını ve sosyal medya kullanıcı adlarını al (~10-20 $/yıl, isteğe bağlı).
- [ ] Tasarım belgelerini, eskizleri ve not defterlerini tarihli bir klasörde sakla. (§2.4)

### Yayından önce

- [x] Ad her yerde değişti (appId dahil). (v1.7)
- [x] Çevrimiçi paylaşım varsayılan kapalı, ilk kullanımda izin kartı. (v1.7, §6.4)
- [ ] Supabase projesini **AB (Frankfurt)** bölgesinde aç, DPA'yı kabul et, hesapta 2FA aç. (§6.4)
- [ ] Supabase'e KVKK standart sözleşmesini sor. İmzalanırsa **5 iş günü** içinde KVKK'ya bildir. (§6.4)
- [x] `privacy.html` KVKK bölümleri eklendi (v1.7). - [ ] **İletişim adresini doldur.** (§6.4, §6.5)
- [x] Kaba ad filtresi (oyun + sunucu) eklendi (v1.7). Bildirilen adı silme: `online/schema.sql` sonundaki sorgu. (§6.6)
- [x] Hakkında ve Lisanslar ekranı (`about.html`, internetsiz açılır) eklendi (v1.7). (§7)
- [ ] `npm install` sonrası `in-app-review` lisansını ve Android bağımlılığını doğrula, `THIRD_PARTY_NOTICES.md`'yi
      güncelle.
- [ ] Apple: bireysel hesap (99 $/yıl), **DSA → non-trader**, şifreleme → muaf, yeni yaş anketi, Kids kategorisi
      seçilmedi. (§6.1)
- [ ] Google: kişisel hesap (25 $), ayrı geliştirici e-postası, **12 testçi × 14 gün** kapalı test, hedef kitle 13+,
      reklam yok, veri güvenliği formu. (§6.2)
- [x] `MAGAZA.md` "reklamsız" olarak güncellendi (v1.7).

### İsteğe bağlı / sonra

- [ ] **Marka tescili** TÜRKPATENT, sınıf 9 + 41: ≈12.650 TL resmî ücret, 6-12 ay. Oyun ilgi görürse ya da ad çakışması
      riski çıkarsa. (§3)
- [ ] Telif Hakları Genel Müdürlüğü'nde isteğe bağlı kayıt-tescil (≈ birkaç bin TL, 2026 tutarını doğrula). (§2.2)
- [ ] Noterde tarihli tespit (anlaşmazlık ihtimalinde). (§2.2)
- [ ] Oyunu kendi deposuna taşı (`hamsi-koyu`), ilk mağaza yüklemesinden önce. (§4.4)
- [ ] İmzalı commit'ler (SSH). (§2.2)
- [ ] Gelir modeli eklenirse: GVK 20/B istisna belgesi, Apple trader durumu, gizlilik güncellemesi, mali müşavir. (§6.3)

---

## 9. Maliyet özeti

| Kalem | Tutar | Zorunlu mu? |
|---|---|---|
| Apple Developer Program | 99 $ / yıl | App Store için evet |
| Google Play Console | 25 $ (bir kez) | Google Play için evet |
| GitHub Pages, Software Heritage, Wayback, OpenTimestamps | 0 | Hayır, önerilir |
| Supabase (ücretsiz plan) | 0 | Yalnız çevrimiçi özellik için |
| Alan adı | ~10-20 $ / yıl | Hayır |
| TÜRKPATENT marka (1 / 2 sınıf, resmî) | ≈ 9.830 / 12.650 TL | Hayır |
| Marka vekili | birkaç bin TL + KDV | Hayır |
| Telif Hakları Genel Müdürlüğü kayıt-tescil | 2026 tutarı doğrulanmadı | Hayır |
| Noter tespiti | tarifeye göre | Hayır |
| KVKK avukat görüşmesi (tek seferlik) | serbest | Supabase açılacaksa önerilir |

---

## 10. Kaynaklar

- FSEK 5846 — https://www.mevzuat.gov.tr (Kanun No. 5846)
- Telif Hakları Genel Müdürlüğü, isteğe bağlı kayıt-tescil — https://telifhaklari.ktb.gov.tr/TR-332450/istege-bagli-kayit-tescil.html · https://tescil1.telifhaklari.gov.tr
- TÜRKPATENT marka işlem ücretleri — https://www.turkpatent.gov.tr/marka-islem-ucretleri (2026 tarifesi: RG 31.12.2025, 5. mükerrer)
- 2026 marka ücreti derlemeleri — https://asil.com.tr/blog/marka-tescil-ucreti-2026 · https://www.cukurovapatent.com/2026-marka-tescil-ucretleri · https://aylarpatent.com/blog/marka-tescil-ucreti/
- WIPO Global Brand Database — https://branddb.wipo.int · TMview — https://www.tmdn.org/tmview
- KVKK yurt dışı aktarım — https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim · Rehber: https://www.kvkk.gov.tr/Icerik/8142/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi · Standart sözleşme bildirim modülü: https://www.kvkk.gov.tr/Icerik/8043/Standart-Sozlesme-Bildirim-Modulu-Hakkinda-Kamuoyu-Duyurusu
- KVKK aydınlatma — https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-
- VERBİS istisnası (100 milyon TL) — https://www.erdem-erdem.av.tr/bilgi-bankasi/verbis-kayit-yukumlulugune-iliskin-yeni-istisnalarin-uygulama-esaslari-aciklandi
- Supabase DPA — https://supabase.com/legal/customer-resources/data-processing-addendum
- Apple DSA trader — https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/
- Apple yaş derecelendirmesi güncellemesi — https://developer.apple.com/news/?id=ks775ehf
- Google Play yeni hesap test şartı — https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play geliştirici bilgileri — https://support.google.com/googleplay/android-developer/answer/13628312
- Android geliştirici doğrulaması — https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html
- GitHub DMCA — https://docs.github.com/en/site-policy/content-removal-policies/guide-to-submitting-a-dmca-takedown-notice
- Apple App Store uyuşmazlık formları — https://www.apple.com/legal/intellectual-property/dispute-forms/app-store/
- Google yasal içerik bildirimi — https://support.google.com/legal/troubleshooter/1114905
- PolyForm Noncommercial — https://polyformproject.org/licenses/noncommercial/1.0.0
- GVK 20/B 2026 — https://www.muhasebenews.com/sosyal-icerik-ureticileri-ve-mobil-uygulama-gelistiricileri-icin-2026-vergi-istisnasi-basvuru-sureci-ve-banka-bildirimi-uygulamasi/

**Bu ortamdan doğrulanamayanlar:**
- Telif Hakları Genel Müdürlüğü'nün 2026 kayıt-tescil ücreti.
- TÜRKPATENT resmî tarife sayfası (ücretler ikincil kaynaklardan; 2. sınıf ücreti kaynaklar arasında çelişkili).
- TÜRKPATENT, WIPO, App Store ve Google Play'de "Hamsi Koyu" marka ve uygulama araması (erişim engellendi).
- KVKK'nın AB için bir yeterlilik kararı verip vermediği.
- Supabase'in KVKK standart sözleşmesi imzalayıp imzalamadığı.
- `in-app-review` eklentisinin Android bağımlılığı ve tam telif satırı.
- Cordova NOTICE metninin birebir hâli.
- Noter ücretleri.
