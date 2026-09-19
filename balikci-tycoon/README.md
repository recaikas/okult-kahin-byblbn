# 🐟 Balıkçı Tycoon — v0.2

İzometrik balıkçı idle/tycoon oyunu. Tek klasör, bağımlılık yok: `index.html` + `game.js`.
v0.2, GDD "Sistem Genişleme + UI/UX Revizyonu" paketinin P0/P1 kapsamını uygular.

## Oynamak için
`index.html` dosyasını tarayıcıda aç (mobil + masaüstü).
```bash
npx http-server -p 8080 .   # ya da yerel sunucu
```

## Çekirdek döngü
**AĞ → TOPLA → KESİM → TEZGÂH → SATIŞ → GELİŞTİR**
Füme hattı: **Balık → Kesim → Fümeleme (bant) → Füme paketi (2.4× değer)**

## v0.2 sistemleri

### 1. Balık türleri (GDD §3)
| Tür | Nadirlik | Taşıma | Kesim | Verim | Fileto |
|---|---|---|---|---|---|
| Hamsi | Yaygın | 1 | 0.42 sn | 1 | $6 |
| Uskumru | Yaygın | 1 | 0.62 sn | 1 | $12 |
| Levrek | Orta | 1 | 0.85 sn | 2 | $17 |
| Somon | Orta | **2** | 1.10 sn | 3 | $27 |
| Ton Balığı | Nadir | **3** | 1.70 sn | 5 | $46 |

Taşıma kapasitesi artık **ağırlık** bazlı: bir ton balığı 3 yer kaplar. Her ağın kendi tür havuzu var.

### 2. Çalışanlar + maaş (GDD §5, §13)
| Rol | Görev | Maaş |
|---|---|---|
| 🧺 Hamal | Ağdan kesim masasına taşır | $15/dk |
| 🔪 Filetocu | Bağlı olduğu masayı %55 hızlandırır | $19/dk |
| 🍣 Tezgâhtar | Siparişe göre ürünü tezgâha taşır | $22/dk |
| 💵 Kasiyer | Tepsideki parayı kasaya işler | $17/dk |

Maaşlar saniye saniye kasadan düşer — otomasyon bedava değil. Çıraklar "yükle → dağıt" görev kilidiyle
toplu çalışır ve en yakın hedefi seçer; tezgâhtar kuyruktaki gerçek talebe göre ürün seçer.

### 3. Sipariş sistemi (GDD §6)
Müşteri tipleri: İşçi, Aile, Tüccar, Şef, Kaptan (toplu sipariş), VIP (füme + 3× ödeme).
Her sipariş = **ürün + adet + sabır + ödül**. Sabır dairesel halkayla azalır; Şef/VIP kaçarsa itibar düşer.
Kuyruktaki herkes, ürünü hazırsa servis edilir (tek müşteri kuyruğu kilitlemez).

### 4. İkinci/üçüncü bölge
- **Balık Pazarı** — $650 + 10 itibar → yeni ağ (levrek/somon), masa, tezgâh
- **Fümehane** — $2.400 + 30 itibar → ton balığı ağı + **füme üretim zinciri** (bantlı besleme)

### 5. İtibar (GDD §7)
Küçük Balıkçı → İskele Dükkânı (10) → Balık Pazarı (30) → Liman İşletmesi (75) → Balıkçılık Şirketi (150).
Bölgeler **para + itibar** çift koşuluyla açılır.

### 6. Olaylar (GDD §10)
🐟 Balık Sürüsü (ağ ×2.2) • 🚢 Yolcu Gemisi (müşteri ×2.2) • ❄️ Kar Fırtınası (müşteri ×0.45)

### 7. UI/UX revizyonu (GDD §11–12)
- **Yığın kuralı:** 0-5 gerçek model → 6-19 arası 5 model + `×N` → 20+ tek kasa + `×N`
- **Upgrade kartı:** uzakta yalnız ikon; yaklaşınca isim + seviye + etki + fiyat (aynı anda **tek** kart)
- Üst HUD: Para • Taşıma • İtibar (+bar) • aktif olay • `⋯` menü
- Tek satırlık hedef/sipariş kartı, "N müşteri bekliyor" göstergesi, birleşen floating text
- Oyun içi 6 adımlı eğitim + hedefi gösteren parlayan ok
- `⋯` menüsü: İŞLETME / PERSONEL / ÜRÜNLER / YARDIM kartları

## Kontroller
- Masaüstü: `W A S D` / yön tuşları
- Mobil: ekrana bas & sürükle (sanal joystick)

## Notlar
- İlerleme `localStorage` (`balikci_tycoon_v2`) ile otomatik kaydedilir.
- Hata ayıklama: konsoldan `window.BT` (durum, istasyonlar, `BT.hire('hamal')`, `BT.setEvent('suru')`).
- Henüz yok (GDD sonraki sürümler): tekne/sefer, hava sistemi tam hâli, kontratlar, yengeç özel istasyonu,
  çalışan seviyeleri, offline gelir.
