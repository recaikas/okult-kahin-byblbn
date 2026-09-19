# 🐟 Balıkçı Tycoon — v0.3 (pixel art)

İzometrik **pixel-art** balıkçı tycoon oyunu. Türkiye kıyı limanı teması, **Türkçe + İngilizce**.
Tek klasör, bağımlılık yok: `index.html` + `game.js`.

## Oynamak için
`index.html` dosyasını tarayıcıda aç (mobil + masaüstü). İstersen: `npx http-server -p 8080 .`

## Çekirdek döngü
**AĞ → TOPLA → KESİM → TEZGÂH → SATIŞ → YATIRIM**
Füme hattı: Balık → Kesim → (bant) → Fümehane → Füme paketi (2.4× değer)

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
