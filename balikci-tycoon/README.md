# 🐟 Balıkçı Tycoon — v1.0 (pixel art)

İzometrik **pixel-art** balıkçı tycoon oyunu. Türkiye kıyı limanı teması, **Türkçe + İngilizce**.
Tek klasör, bağımlılık yok: `index.html` + `game.js`.

## Oynamak için
`index.html` dosyasını tarayıcıda aç (mobil + masaüstü). İstersen: `npx http-server -p 8080 .`

## Çekirdek döngü
**AĞ → TOPLA → KESİM → TEZGÂH → SATIŞ → YATIRIM**
Füme hattı: Balık → Kesim → (bant) → Fümehane → Füme paketi (2.4× değer)

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
