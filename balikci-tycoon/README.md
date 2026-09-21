# 🐟 Balıkçı Tycoon — v1.2 (pixel art)

İzometrik **pixel-art** balıkçı tycoon oyunu. Türkiye kıyı limanı teması, **Türkçe + İngilizce**.
Tek klasör, bağımlılık yok: `index.html` + `game.js`.

## Oynamak için
`index.html` dosyasını tarayıcıda aç (mobil + masaüstü). İstersen: `npx http-server -p 8080 .`

## Çekirdek döngü
**AĞ → TOPLA → KESİM → TEZGÂH → SATIŞ → YATIRIM**
Füme hattı: Balık → Kesim → (bant) → Fümehane → Füme paketi (2.4× değer)

---

## v1.2 — Merkezi Depo + Balık Pazarı Günü (Birleşik Sistem GDD v1.1)

Çekirdek döngü (**Ağ → Kesim → Taşıma → Tezgâh → Satış**) aynen duruyor. Bu sürüm tekrarlı taşıma işini orta oyunda bir **yönetim kararına** çeviriyor ve o kararı **Balık Pazarı Günü'nde** sınıyor.

### A) Merkezi Depo + Otomatik Dağıtım (§3)

**Açılış:** Balık Pazarı bölgesi açık + 25 sipariş tamamlanmış olunca depo kendiliğinden açılır (satın alma yok). Kapasite 40, her Buzhane seviyesi +8 ekler.

**Akış:** oyuncu (veya tezgâhtar) fazla ürünü depoya bırakır → **Dağıtım Çalışanı** ($1.150, depo açılınca listelenir) tezgâhları hedef stoka göre besler.

**Hedef stok + öncelik (§3.2).** Her tezgâhın bir hedefi (varsayılan 12) ve bir önceliği var: **DÜŞÜK / NORMAL / YÜKSEK**. Stok hedefin altına düşer ve depoda uygun balık varsa dağıtım işi oluşur; yüksek öncelikli tezgâh önce beslenir. Menüdeki yeni **DEPO** sekmesinden ayarlanır, tezgâhın üstünde `7/20 ▲` rozetiyle görünür.

**Değişmez kural (§3.3).** Her balık yalnız kendi tezgâhına gider. Otomasyon yanlış balığı yanlış tezgâha gönderemez; depoda ürün yoksa sihirli ürün üretmez. Teslim edilemeyen ürünü dağıtımcı depoya geri koyar — ürün hiçbir zaman yok olmaz.

### B) Balık Pazarı Günü (§4-6)

Her **5. gün** Balık Pazarı. Bir önceki günün kapanış kartında haber verilir: *"YARIN BALIK PAZARI — Beklenen yoğunluk: Yüksek"*.

**Pazar sabahı hazırlık ekranı:** depo stoğunu görürsün, her tezgâhın hedefini ve önceliğini **yalnız o pazar için** değiştirirsin. Normal hedeflerin bozulmaz — pazar bitince otomatik geri döner.

**Pazar günü:** müşteri akışı ×2,2 yükselir. **Fiyat otomatik artmaz, balık otomatik oluşmaz.** Müşteri gerçekten gelir; servis edebilirsen satarsın, stok biterse müşteriyi kaybedersin. Kurduğun lojistik burada sınanır.

**Pazar sonuç kartı:** toplam satış, müşteri (servis/toplam), satılan balık, kaçan müşteri, en çok satan tür ve **stok dışı kalınan süre** (hangi tezgâhın neden boş kaldığını gösterir).

### C) Sade gün geçişi (§2)

Gün sistemi yeni bir yönetim katmanı **değil** — sadece zamanın geçtiğini hissettirir.

- HUD'da küçük bir **GÜN 4** sayacı + ilerleme çubuğu.
- Gün boyunca ortam ışığı hafifçe sabah → gündüz → akşam tonuna döner.
- Gün bitince yeni müşteri gelmez, sıradakiler tamamlanır, kısa özet kartı çıkar, sonra **GÜN 5** başlar.
- Depo, tezgâh stokları, para ve tüm ilerleme aynen korunur.
- Borsa günü artık oyun günüyle aynı — iki ayrı saat yok.

**Bu sürümde bilinçli olarak YOK:** vardiya planlama, saat bazlı bonus, mevsim/hava, maaş günü, kira, gece oynanışı, güne özel görev.

### Kayıt
Gün sayısı, depo içeriği, tezgâh hedefleri ve öncelikleri kaydedilir. Eski kayıtlar sorunsuz açılır: depo boş başlar, hedefler varsayılana döner, para/ilerleme hiç etkilenmez. Geçersiz ürün kayıttan yüklenmez.

### Test
```
node --check game.js
node test-world-render.js
```
Doğrulandı: yanlış tür sızması 0, öncelik sıralaması doğru (YÜKSEK önce), geçici pazar hedefleri kalıcı hedefi ezmiyor, kayıt turu temiz, konsol hatası yok.

---

## v1.1 — Liman Hizmet Binaları + Görsel Evrim (GDD v0.4) & Duraklatma/Kayıt

Ana balık döngüsü (**Ağ → Kesim → Taşıma → Tezgâh → Satış**) hiç değişmedi. Üstüne iki katman eklendi.

### A) Hizmet binaları (GDD v0.4 §31-44)

7 bina, her biri **5 seviye**, her seviyede hem işlev hem **görünüm** değişir. Alt bardaki yeni **🏭 BİNA** sekmesinden kurulur.

| Bina | Bölge | Lv.1 | Lv.5 | Ana etkisi |
|---|---|---|---|---|
| 🧊 Buzhane | İskele | $900 | $42.000 | Tür başına arka stok +2 → +12, +1 kontrat kapasitesi |
| 🛠️ Tamirhane | İskele | $1.500 | $70.000 | Servis geliri + tüm yükseltmelerde −%2 → −%10 |
| 🏪 Balık Hali | Pazar | $3.200 | $135.000 | Kuyruk +1 → +3, **Toptancı** müşteri tipi, toptan ödülü +%10 |
| 🍽️ Restoran | Pazar | $4.200 | $190.000 | Otomatik ziyaretçi geliri, **Turist** tipi, müşteri geliri +%8 |
| 📋 Nakliye Ofisi | Depo | $8.000 | $360.000 | Kontrat slotu +1 → +3, kontrat ödülü +%15 |
| ⛽ Yakıt İstasyonu | Rıhtım | $10.000 | $440.000 | Servis geliri (sefer bonusu tekne sistemi gelene kadar uykuda) |
| 🚢 Tersane | Rıhtım | $18.000 | $820.000 | Geç oyun sinki; 4 bina kurulmadan açılmaz |

**Parseller (§32).** Serbest yerleştirme yok — haritada 7 sabit **hizmet parseli** var; her parsel yalnız uyumlu binaları kabul eder. Parseller Lv.5 ayak izine göre baştan rezerve edildi, yani yükseltme hiçbir zaman yürüme koridorunu, müşteri kuyruğunu veya **kasa güvenli alanını** daraltmaz (`BT.servValidate()` bunu test eder). Yanlış parsele kurulduysa **ücretsiz taşınır**, seviye korunur.

**Görsel evrim (§36).** Lv.1 ahşap baraka → Lv.3 taş/tuğla gövde + kiremit çatı → Lv.5 iki hacimli kompleks. Her binanın kendi kimlik rengi (çatı şeridi), kendi propları (buz blokları, vinç, tenteler, masalar, konteynerler, tanklar, kızak) ve Lv.2+ hafif idle animasyonu var. Kurulumda 2,2 sn'lik şantiye sekansı oynar; **yükseltmede bina kullanılamaz hale gelmez**.

**Satın alma güvenliği (§37).** Dünyada çarpınca para harcatan pad **yok**. Her işlem alt bardan, bina→parsel→onay akışıyla yapılır. Kamera hiç sallanmaz.

**Servis geliri tavanı (§38.2).** Binaların pasif geliri, son ~45 sn'deki aktif balık gelirinin **%30'unu** geçemez (taban $12). Amaç AFK para makinesi değil, yatırımın görünür karşılığı.

### B) Duraklatma + kayıt sistemi

- **Pause:** ☰ menü veya Ayarlar açıldığında oyun **tamamen donar** (müşteri, çırak, piyasa, animasyon, oynanış saati). Ekranın üstünde `⏸ DURAKLATILDI` rozeti çıkar.
- **ESC** duraklatır / devam ettirir.
- **💾 KAYDET** — anında kaydeder, "Oyun kaydedildi • 21:07" bildirimi verir. Hem Ayarlar hem ☰ menüde var.
- **💾 KAYDET VE ÇIK** — kaydeder ve ana menüye döner (HUD/alt bar kapanır).
- **Kayıt kartı:** son kayıt saati, para, itibar, sipariş sayısı ve **toplam oynanış süresi**. Hem başlangıç ekranında hem Ayarlar'da.
- Başlangıç ekranı kayıt varsa **▶ DEVAM ET** + **YENİ OYUN** (onay soran) gösterir.
- Otomatik kayıt (6 sn) ve sekme kapanınca kayıt aynen duruyor.

### Kayıt uyumluluğu (§41)
Eski kayıtlar sorunsuz açılır: **hiçbir bina otomatik satın alınmaz, para kesilmez.** Bozuk kayıtlar temizlenir — bilinmeyen bina atlanır, seviye 1-5 aralığına kırpılır, geçersiz/dolu/kilitli parseldeki bina uygun boş parsele taşınır, yer yoksa kurulmamış sayılır.

### Test
```
node --check game.js
node test-world-render.js          # dünya çiziliyor mu (2 viewport)
```
Doğrulandı: parsel çakışması 0, kilitli tipte müşteri 0, 5 seviyede görsel fark, kayıt turu temiz, konsol hatası yok.

---

## v1.0.1 — Balık ↔ Tezgâh Hattı (mapping bug fix)

Kilitli balık türlerinin müşteri siparişlerine sızması engellendi. Çekirdek döngü aynı: **Ağ → Kesim → Taşıma → Tezgâh → Satış.**

**Hat tablosu (tek satırdan düzenlenir — `LINES`):**

| # | Balık | Tezgâh | Ağ | Açılış |
|---|---|---|---|---|
| 1 | Hamsi | İskele Tezgâhı | 1. ağ | başlangıç |
| 2 | Uskumru | Pazar Tezgâhı | 2. ağ | Balık Pazarı bölgesi |
| 3 | Palamut *(yeni)* | Pazar Ek Tezgâhı | 2. ağ | yapı noktasına "Ek Tezgâh" |
| 4 | Levrek | Fümehane Tezgâhı | 3. ağ | Fümehane bölgesi |
| 5 | Somon | Fümehane Ek Tezgâhı | 3. ağ | yapı noktasına "Ek Tezgâh" |
| 6 | Orkinos | Kapalı Balık Hali | 2. ağ | büyük proje tamamlanınca |

**Kurallar**
- Bir tür ancak **üretim noktası açık + işleme hattı var + kendi tezgâhı kurulu** ise satılabilir (`canProduce && canProcess && canSell`). Biri eksikse o tür ne üretilir, ne sipariş edilir, ne de müşterisi doğar.
- **Ağlar yalnız hattı açık türleri üretir.** Başlangıçta 1. ağ sadece Hamsi çıkarır; yeni tezgâh açıldığı anda ilgili ağ o türü de üretmeye başlar ("🎉 Yeni hat açıldı" bildirimi).
- **Sipariş global listeden seçilmez**: her tezgâh yalnız kendi balığının siparişini üretir, müşteri kendi tezgâhına gider, başka tezgâhta beklemez.
- Tezgâh **yalnız kendi türünü kabul eder** — oyuncu da çırak da yanlış tezgâha bırakamaz; çıraklar ürünü doğru tezgâha yönlendirir, teslim edilemeyecek ürünü hiç almaz (8 sn boşta kalırsa paspasa geri bırakır).
- Müşteri tipleri tür yerine **tezgâh değerine** göre gelir (İşçi ucuz tezgâhta, Şef pahalı tezgâhta, VIP füme hattı açıkken).
- Tezgâh kaldırılırsa/kapanırsa o türe yeni müşteri gelmez; mevcut müşteri kuyrukta kilitlenmez — siparişi geçerli ürüne **reroll** edilir, imkânsızsa müşteri gider.
- **Fallback:** uygun tür yoksa müşteri hiç spawn edilmez; kilitli tür asla zorla seçilmez.
- **Eski kayıt göçü:** yükleme ve her tezgâh değişiminde dünya taranır; elde/paspasta/tezgâhta/ağ stoğunda kalan geçersiz ürünler geçerli türe dönüştürülür veya temizlenir. Yeni oyuna başlamak gerekmez.
- Balıkların GDD'deki farkları korundu (Somon 2 taşıma yeri/3 fileto, Orkinos 3 taşıma yeri/5 fileto, kesim süreleri, füme çarpanı); özel istasyon isteyen türler için `canProcess` kancası hazır.

---

## v1.0 — Şirketler • Kontratlar • Liman Borsası

Ana balık döngüsü aynı kaldı; derinlik, kazanılan paranın **kontratlara, hisselere, ortaklıklara ve satın almalara** akmasından geliyor.

### Açılış
**Liman Ticaret Ofisi** ($18.000 + 40 ⭐, Fümehane bölgesi) haritada fiziksel bina olarak kuruluyor. Yaklaşınca tek bir **TİCARET** butonu çıkıyor; ana ekranda sürekli finans paneli yok. Kurulunca 10 hisselik **eğitim kredisi** veriliyor.

### Piyasa (§4)
- **1 Pazar Günü = 5 dk aktif oynanış.** Fiyat yalnız kapanışta değişir.
- Kapanış formülü: sektör (±%5) + şirket sağlığı (±%4) + haber (±%12) + oyuncu etkisi (±%2) + kontrollü rastgelelik (±%3); normal gün bandı **±%18**, büyük olayda ±%28.
- **Liman 12 Endeksi**, 3-6 günlük piyasa döngüleri (Genişleme/Normal/Yavaşlama/Toparlanma), günlük sektör momentumu, **24 haber olayı**.
- Piyasa nötrlemesi: ortalama sürüklenme kırpılır, endeks uzun vadede dengede kalır, göreli kazanan/kaybeden korunur.

### 12 kurgusal şirket (§3)
Kuzey Ağları, MaviHat Lojistik, BuzMar, Okyanus Gıda, Tersane 47, Kıyı Sofrası, Atlas Ambalaj, Martı Denizcilik, DerinSu Avcılık, Liman Makina, Ada Pazarlama, Mercan Turizm — her biri kendi sektörü, riski, **Sağlık / Büyüme / Risk** göstergeleri ve **%5 / %15 / %51 perkleri** ile. Tüm isimler ve kimlikler özgün ve kurgusaldır.

### Kontratlar (§6-§7)
8 tip (Standart, Acil, Hacimli, Çerçeve, Özel, Münhasır, Kurtarma, Büyük Proje). Kontrat = **mevcut üretim döngüsüyle** hazırlanan ürünleri Ticaret Ofisi'ne teslim etmek. Ödül = normal değer × tip çarpanı × ilişki çarpanı. Başarısızlıkta **para cezası yok**, sadece ilişki düşer. Tedarikçi kariyeri 6 seviye. Tezgâhtar çırağı kontrat ürünlerini de ofise taşır.

### Sahiplik & holding (§8-§10, §15-§17)
- Serbest dolaşımdan alım, **%1,5 komisyon**, aynı gün satış kilidi, **büyük emir primi** (>%5 tek emir reddedilir), short/kaldıraç yok.
- Eşikler: %1 kayıtlı → %5 perk I → %15 perk II → %30 yönetim kurulu → %51 kontrol (Holding Lisansı) → %100 bağlı ortaklık.
- **Temettü** her 4 pazar gününde (sağlık 55+), **yönetim kurulu projeleri** (%30+), **devralma teklifi** (prim ×1,20–1,35), **6 özel işletme** (pasif gelir + kalıcı bonus), **Holding değeri ve 5 kademe**.
- Perkler gerçekten oyuna işliyor: ağ hızı/stoğu, işleme hızı, ürün değeri, müşteri harcaması/akışı, nadir av, VIP şansı, yükseltme indirimi, kontrat çarpanı — grup başına tavanlı (§9.1).

### Kurumsal işlemler (§11)
Sermaye artırımı, geri alım, 1:2 hisse bölünmesi ve yeniden yapılanma/kurtarma döngüsü.

### Arayüz (§19)
Ticaret Ofisi 6 sekme: **PİYASA** (endeks + 12 şirket), **ŞİRKET** (12 günlük mini grafik, sağlık/büyüme/risk, ilişki, perk eşikleri, al/sat, devralma, yönetim kurulu), **KONTRAT**, **PORTFÖY**, **HABER**, **HOLDİNG**. Ana HUD yalnız tek satırlık bildirim gösterir.

### Anti-exploit / kayıt (§21)
Kapanış tohumu (`seed`) save'de tutulur → **kapat-aç ile farklı sonuç üretilemez** (test edildi). Aynı gün satış kilidi, kontrat süresi ve haber geçmişi kaydedilir; negatif nakit oluşamaz; `marketState` ayrı şemayla migrate edilir (yeni şirket/olay eklenince eski kayıt bozulmaz).

---

## v0.3.1 — UX / Bug Fix paketi

| Sorun (geri bildirim) | Çözüm |
|---|---|
| **Kamera çok sallanıyor / mide bulandırıyor** | Ekran merkezinde **ölü bölge** (%24 × %20): karakter bu alanda gezerken kamera durur. Takip yumuşatıldı, **ekran sarsıntısı tamamen kaldırıldı**, kamera açık alan sınırına kilitli (yeni AREA açılınca sınır genişler). |
| **Yanlışlıkla upgrade satın alma** | Zeminde **hiçbir satın alma tetikleyicisi kalmadı**. Alan açma, bölge seviyesi, yapı ve proje yatırımı yalnız alt bardan, açık seçimle yapılır. Alan açma / seviye ve ≥$1.500 işlemler **çift dokunuş onayı** ister. |
| **Geliştirmeler okunmuyor** | Alt bar kartında ikon + isim + seviye + **etkisi** + fiyat net yazılır; parası yetmeyen kart kırmızı, uygun sekmeler yeşil çerçeveyle işaretlenir. |
| **Aktif alan dar hissediliyor** | HUD kartları küçüldü, tutorial kutusu tek satırlık **görev bandına** indi ve eğitimden sonra sadece sabrı azalan sipariş varsa görünür. Alt bar kapalıyken ~50 px. |
| **Kilitli alanlar fazla yer kaplıyor** | Kilitli bölgeler artık dolu zemin + dev tabela değil; **soluk siluet + kesikli sınır + küçük kilit etiketi** (yalnız yaklaşınca). |

**Etkileşim önceliği (spec §8):** para taşırken kasa her şeyin önüne geçer → kasa çevresinde yanlış tetikleme yok.

**Alt geliştirme barı:** `ALAN` (yeni bölge) • `YÜKSELTME` (bölge seviyesi + kapasite/hız/pazarlık + çırak tut) • `YAPI` (yapı noktaları + süsler) • `PROJE` (Kapalı Balık Hali'ne aşamalı yatırım).

---

## v0.3 — Liman Genişleme + Yatırım (GDD Basic v1)

| Sistem | Uygulama |
|---|---|
| **AREA** | 3 bölge: Balıkçı İskelesi / Balık Pazarı ($1.300 + 10⭐) / Fümehane ($4.600 + 30⭐). Kilitli alan haritada halat çit + tabela ile önceden görünür. |
| **Bölge seviyesi** | Her bölge Lv.1→3. Her seviyede **görünür** değişim: yıpranmış tahta → düzgün zemin + tabela → taş zemin + sokak lambaları. Ayrıca ağ hızı, tezgâh kapasitesi, kuyruk sırası ve yeni yapı noktası açılır. |
| **Yapı noktaları** | 7 sabit slot (3'ü Lv.3'te açılır), 6 yapı: Personel Kulübesi, Çay Ocağı, Ek Tezgâh (yeni satış noktası!), Reklam Panosu, Depo Kulübesi, Ağ Vinci. Slot başına uyumlu kategoriler; değiştirince %60 iade. |
| **Büyük Proje** | **Kapalı Balık Hali** — $26.000, 5 aşama (temel → kolon → duvar/çatı → donatım → açılış). Parça parça yatırım: +$1.000 / +$10.000 / %25 / MAKS. Her eşikte şantiye modeli büyür; bitince yeni tezgâh + %25 müşteri akışı. |
| **Kozmetik** | 8 satın alınabilir süs: Türk bayrağı, balıkçı teknesi, bank, simit arabası, sokak lambası, begonvil, çay masası, balık heykeli. (Her biri +%2 müşteri sabrı.) |
| **Liman Planı** | `☰` menüsünde bölgeler / proje / yapı slotları / personel limiti tek ekranda. |

## v0.2'den devam eden sistemler
- **5 balık türü** (Hamsi, Uskumru, Levrek, Somon, Orkinos) — ağırlık, kesim süresi, fileto verimi, fiyat farklı; taşıma **ağırlık** bazlı.
- **4 çalışan rolü + maaş**: Hamal, Filetocu, Tezgâhtar, Kasiyer (maaş saniye saniye kasadan düşer, personel limiti yapıya bağlı).
- **Sipariş sistemi**: 6 müşteri tipi (İşçi/Aile/Esnaf/Şef/Kaptan/VIP), ürün + adet + sabır halkası + ödül; VIP/Şef kaçarsa itibar düşer.
- **İtibar**: 5 seviye; bölgeler para **+** itibar ile açılır.
- **Olaylar**: 🐟 Balık Sürüsü, 🚢 Vapur, 🌊 Lodos.

## Pixel art & Türkiye teması
- Tüm sahne düşük çözünürlüklü tuvale çizilip `image-rendering: pixelated` ile büyütülür; yazılar **Pixelify Sans** (tam Türkçe karakter desteği).
- Arka planda parallax Türk sahil kasabası: beyaz evler, kiremit çatılar, **cami + minare**, servi ve fıstık çamları, martılar, ahşap takalar.
- Tezgâhlarda kırmızı-beyaz tenteler, çay ocağı, simit arabası, Türk bayrağı direği.

## Arayüz
- Giriş ekranı (dil seçimi), **Ayarlar** (dil / ses / zoom / kaydı sıfırla), `☰` menü (Liman, Personel, Ürünler, Yardım).
- Yığın kuralı: 0-5 gerçek model → 6-19 arası 5 model + `xN` → 20+ tek kasa + `xN`.
- Yükseltme kartı sadece en yakın alan için açılır; uzaktaki etiketler kısalır/kaybolur.
- Oyun içi 6 adımlı eğitim + hedefi gösteren ok. Yapı/proje panelleri alttan açılan kart şeridi.

## Kontroller
Masaüstü `W A S D` / yön tuşları — Mobil: ekrana bas & sürükle.

## Notlar
- Kayıt: `localStorage` → `balikci_tycoon_v3` (bölgeler, seviyeler, yapılar, proje yatırımı, süsler, dil, ses, zoom).
- Hata ayıklama: `window.BT` (`BT.hire('hamal')`, `BT.setEvent('suru')`, `BT.setLang('en')`, `BT.investProject(1000)`).
- Sonraki sürümler için GDD'de kalanlar: tekne/sefer, kontratlar, konserve/ızgara hatları, çalışan seviyeleri, AREA 4-7.
