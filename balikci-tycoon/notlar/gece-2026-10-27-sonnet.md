# Gece oyun testi — 2026-10-27 (Sonnet)

**Yöntem.** Playwright + `BT.*` kancaları. Oyun zamanı `BT.emek.step(0.1)` ile hızlandırıldı (1 oyun günü ≈ 0,1–0,3 sn gerçek süre).
"Bot" = oyuncunun elle oynamadığı, her bölgede tam kadro + tam otomasyon (devir) kurulu, kartlardan satın alım yapan oyuncu.
Rastgelelik tohumlu (`Math.random` PRNG) → A/B karşılaştırmaları tekrarlanabilir. Test bayrakları: `HK_EMEK/PET/LOK/TARIF_OFF = 0`
(gerçek oyun ayarı), `HK_STORY/HELP/GZ/FPS_OFF = 1` (ara sahne yok), inşaat anında bitiyor.
Sayılar günlük ortalama (ilk 2 gün ısınma atıldı), 2–4 tohum. **Oyun koduna dokunulmadı.**
Sınır: bot elle balık tutmayı/ilk dakikaları oynamaz; erken oyun ölçümleri "kadro tamamlanınca" başlar.

---

## (A) HATALAR / DİKKAT

> Bu gece yapılan stres denemelerinde (vapur + lodos aynı anda, vergi günü + vapur + lodos, gün sonunda yağmur, kaydet/yükle, 98 günlük bot koşusu) **sayfa hatası/konsol hatası çıkmadı**, `NaN` oluşmadı, kayıt boyutu 7 KB → 28 KB (98. gün) makul, müşteri dizisi şişmedi.
> Aşağıdakiler gerçek çökme değil; küçük hata/tutarsızlık/UX bulguları.

1. **[Düşük] "Sv.0→1" etiketi.** Adım: yeni oyun → alt bar **YÜKSELT** → kartlar "KAPASİTE Sv.0→1", "HIZ Sv.0→1". Başka yerlerde "Sv.1→2" (bölge/istasyon) biçimi var; oyuncu için tutarsız. Öneri: etiket `lvl+1→lvl+2` göster.
2. **[Düşük] HUD parasında "5" rakamı "S/$" gibi okunuyor.** Adım: `BT.S.cash = 500489` → üst bar "PARA $00.489" gibi görünür (ince piksel yazı tipinde 5 ≈ S). 100 bin–599 bin aralığında "$" sanılıyor. Öneri: 5 glifini ayırt edilir çiz ya da rakamlara 1 px boşluk/yükseklik farkı.
3. **[Orta, tasarım/hata] Vapur yolcuları gelir katmıyor.** Bkz. B2: vapur açık/kapalı gelir farkı ±%0. Yolcular kuyruk yerlerini dolduruyor ve normal müşteri doğuşunu yavaşlatıyor (`updateCounter`: `bekleyen >= 2 → spawnT ×(1+(b−1)·0,7)`); yolcular bu sayaca dahil. Adımlar: Sv7, 4 bölge tam kadro, 14 gün, `HK_FERRY_OFF` ile ve onsuz.
4. **[Orta, tasarım/hata] Reklamların "Müşteri +%X" etkisi gerçek gelire yansımıyor.** `BT.ilan.cust()` canlı reklamda 1,4 döndürüyor (etki uygulanıyor) ama gelir değişmiyor (B5). Neden: aynı kuyruk-yavaşlatma sayacı; akış çarpanı kuyruk dolunca yutuluyor.
5. **[Düşük/UX] Lokanta devri (otomasyon) şartı anlaşılmıyor.** Sv5, 4 ocak kurulu: şart "1 ocak için aşçı" gibi kısa bir mesajla çıkıyor; aşçı üst sınırı = min(seviye sınırı 3, kurulu ocak), toplam kadro tavanı 9; işe alım sırasına göre (önce Komi/Şef alınırsa) 3. aşçı "stat" nedeniyle alınamıyor ve oyuncu ne yapacağını bulamıyor. Öneri: devir şartı kartında "Aşçı 2/3 • Garson 0/1 …" ilerleme çubuğu.
6. **[Düşük] Vergi memuru yalnız `S.ctrl === 2` iken gelir** (`updateTax`). Test/hile ile oyunu ctrl=2 yapmadan hızlandıran araçlarda vergi hiç çıkmaz (bot tuzağı; oyuncuyu etkilemez). Not olarak bırakıldı.
7. **[Test notu] `barList()` kartlarının `go()` fonksiyonu parayı düşmüyor** (ücret `purchase()` içinde, düğme tıklamasında kesiliyor). `go()` çağıran hile/test aracı bedava alım yapar → test yazanlar için tuzak; `BT.buy(id)` gibi tek kapı yararlı olur.
8. **[Hukuk/mağaza riski — kod hatası değil] Parodi özel müşteriler (`p_*`).** `specials.js` üst yorumu "gerçek/yaşayan ünlü adı, lakabı, imza sözü, tanınır görünüm kullanma" diyor. Parodi listesi (24 kişi) açıkça bilinen kurgu karakterlerin taklidi: Velet Kral Cofri, Kraliçe Serse, Mor Titan Tanoş, Göbekli Gök Tanrısı Tor, Sardalya Hayaleti Krato, Buz Kralı, Ejderci (konuşma satırı: "Ben Denizi zincir kırıcı, ejder anası, tava kraliçesi")… Ayrıca eski listede gerçek kişilere gönderme taşıyan kimlikler var (`gordon`, `opra`, `jami`, `bobros`, `edsirin`, `muslum`=Hüzünlü Hikmet, vb.). Marka/telif (kurgu karakter parodisi) ve "ölmüş ünlü" kuralı için `HUKUK.md` ile karşılaştırılıp mağaza yayınından önce gözden geçirilmeli. Taraftar müşterileri (Bordo-Mavi, Sarı-Lacivert, Kırmızı, Sarı-Kırmızı, Siyah-Beyaz) arma/ad içermiyor, forma renkleri ise tanınır; kabul edilebilir ama not.

---

## (B) DENGE

### B1. Statik bot ekonomisi — her bölgede tam kadro, hiç yükseltme yok (12 gün ort.)
| Sv | gelir | maaş | kira | işletme gideri | net/gün | servis |
|---|---|---|---|---|---|---|
| 1 | 1 699 | 340 | 0 | 0 | 1 360 | 57 |
| 2 | 5 217 | 689 | 29 | 417 | 4 101 | 109 |
| 3 | 15 759 | 1 047 | 340 | 2 298 | 12 074 | 148 |
| 4 | 15 706 | 1 046 | 340 | 2 399 | 11 898 | 152 |
| 5 | 30 783 | 1 533 | 1 504 | 6 200 | 21 529 | 181 |
| 6 | 27 787 | 1 540 | 1 504 | 5 972 | 18 784 | 189 |
| 7 | 28 727 | 1 536 | 1 504 | 6 621 | 19 004 | 192 |
| 8 | 29 067 | 1 535 | 1 504 | 7 009 | 19 010 | 182 |
| 9 | 28 513 | 1 525 | 1 504 | 7 589 | 17 945 | 183 |
| 10 | 28 444 | 1 535 | 1 504 | 7 964 | 17 453 | 187 |

- Yükseltme alınmazsa gelir Sv5'ten sonra düz; işletme gideri (%4/Sv, Sv3'ten sonra) arttığı için **net Sv5→Sv10'da −%19**.
- Toplam kesinti Sv10'da ≈ opex %28 + maaş %5 + kira %5 + vergi %3–10 ⇒ gelirin **~%45'i**.
- Bölge başına gelir (Sv7): İskele 1,8–2,6k · Pazar 3–4k · **Fümehane 9–16k · Mutfak 10–16k**. Kira bölge gelirinin yalnız %2–5'i (kira "bölge kapatma" baskısı yaratmıyor).

### B2. Talep/üretim/kuyruk — hangi kaldıraç gerçekten gelir getiriyor? (A/B, 4 tohum × 14 gün, Sv7, 4 bölge)
| Senaryo | gelir | net | servis |
|---|---|---|---|
| taban | 27 874 | 17 315 | 187 |
| **vapur kapalı** | 27 823 | 17 268 | 183 |
| yağmur/lodos kapalı (2 tohum) | 27 898 | 17 338 | 185 |
| Kulübe Sv3 + 2. kopya roller | 27 518 | **16 282** | 184 |
| Kulübe Sv5 + 2. kopya roller | 32 271 | 18 906 | 208 |
| **bölge Sv1→2 (4 bölge, 11,4k)** | 32 750 | **20 985** | 199 |
| istasyon Sv2 (Ağ/Kesim/Tezgâh/Kasa) | ±0 (gürültü) | ±0 | — |

Ölçüm (3 oyun günü, Sv7): tezgâh başına ortalama kuyruk dolulu­ğu 1,3–1,8 / 4; stok boş kalma %0–8. Yani ne kuyruk ne stok darboğaz; **müşteri doğuş aralığı (5,4 sn × çarpanlar, kuyrukta ≥2 kişi varsa yavaşlıyor) belirleyici**. Sonuçlar:
- **Vapur**: gelir ±0 (+4 kişi/gün). Yolcular normal müşteriyi yerinden ediyor (A3).
- **Lodos/yağmur**: ~%20 gün (4. günden sonra, vergi günü hariç); yağmur günü gelir −%6 (25,5k vs 27,2k). Oyuncunun karşı hamlesi yok.
- **Personel Kulübesi** (1 500 / 4 000 / 9 000 / 18 000 / 36 000 = 68,5k): Sv1–3 ek kadro **gelir getirmiyor**, maaş +786/gün → net **−1 033/gün**. Sv5'te gelir +%16, net +1 591/gün ⇒ geri ödeme **> 45 gün**.
- **Bölge seviyesi**: 11,4k'ya net +3,7k/gün ⇒ **geri ödeme ≈ 3 gün**. En iyi yatırım, diğerleriyle arasında uçurum var.
- **İstasyon yükseltmeleri** (toplam ≈ 20,6k): otomatik kadroda ölçülebilir etki yok (hız darboğaz değil); yalnız "Tezgâh kâr +%3" anlamlı (Sv7'de Fümehane tezgâhı için +300/gün, 1 500 → geri ödeme ~5 gün).

### B3. Ürün fiyatı (Pazarlık `prc`) — oyunun en güçlü kaldıraçı
`prodValue = değer × (1 + priceLvl × 0,1)`; fiyat 850·1,8^lvl (Emekçi ×0,75): 638 / 1 148 / 2 066 / 3 718 / 6 692 / ~12 000 (max 6). Sv7'de gelir 28k ⇒ ilk seviye **+2,8k/gün, geri ödeme 0,2 gün**; 6 seviye toplam ≈ 26k'ya +%60 gelir. Bu kart yalnız Fümehane açılınca listeleniyor (z2'ye bağlı) — bot ilk kez 53. günde aldı. Öneri: seviye başına maliyet çarpanı 1,8 → 3 ve taban 2 500; ya da kazanç +%10 → +%5 (6 seviye +%30).

### B4. İlerleme simülasyonu (bot, 12 500 başlangıç parası, yükseltmeleri kendi alıyor; öncelik: kadro > alan > bölge Sv > ayrıntı)
| gün aralığı | gelir/gün | net/gün | seviye (sonunda) | kadro |
|---|---|---|---|---|
| 1–7 | 1 663 | 1 155 | 5 | 8 |
| 8–14 | 1 996 | 847 | 5 | 10 |
| 15–21 | 2 377 | 1 054 | 5 | 11 |
| 22–28 | 5 811 | 3 570 | 7 | 15 |
| 29–35 | 9 767 | 5 416 | 9 | 18 |
| 36–42 | 23 669 | 13 313 | 10 | 27 |
| 43–49 | 35 532 | 20 249 | 10 | 29 |
| 50–56 | 50 800 | 30 079 | 10 | 34 |
| 57–63 | 56 003 | 33 282 | 10 | 42 |
| 64–91 | 69–74k | 36–42k | 10 | 45–58 |
| 92–135 | 67–75k | 38–43k | 10 | 61–63 |

- **Seviye (itibar) ekonomiden çok önde.** Sv5 5. günde, Sv7 26. günde, Sv10 **39. günde**; itibar 4 500'ü geçtikten sonra tırmanmaya devam ediyor (135. gün: 35 742) ama hiçbir şeye yaramıyor. Gün başına itibar ≈ 60–80 (sabit), ekonomiden bağımsız. Sv5'te işletme gideri/müşteri tipleri açılıyor ama kasa 2k/gün.
- **İlk 21 gün "ölü zaman"**: gelir 1,7–2,4k düz; adımlar (Pazar 975, Pazar kadrosu ~13k, Fümehane 10,3k…) her biri 5–7 günlük birikim. Oyuncu otomatik kadro kurulunca yapacak şey yok, bekliyor. Hızlandırma düğmesi yok (C1).
- **Bir bölge kadrosu üstel pahalı**: işe alım = taban × 1,45^(mevcut kişi) × (1+0,35·bölge). Bölge 0 zinciri (5 rol) ≈ 10,7k; Mutfak ≈ 25k+. 9. kişi 17–20 kat taban; geç oyunda 30k–86k'lık bir "Hamal/Aşçı". Bu ek kopyalar gelir getirmiyor (B2) → saf para çukuru; oyuncu "gelişiyorum" sanıyor.
- **Zengin geç oyun**: Sv10, gün 64+: net 36–43k/gün, harcayacak anlamlı yer az (kulübe Sv5 36k, Depo 90k, Lisans 90k, Lokanta, hamal kopyaları). Gün 100'de 90k lisans alınınca o günkü gelir 102k oldu (kontrat/borsa; incelenmedi). Soak'ta 133. gün nakit 433k'ya çıktı.
- **Vergi (Haşmet) günü**: gelir komşu günlerin %59–77'si (müşteri kaçıyor/gelmiyor) + vergi haftalık cironun %3–10'u (35k–52k tek seferde). Gerçek etkisi ≈ %8–15 haftalık gelir. Net o gün negatif. Uyarı toast'ı var; nakit tamponu tutmayan botta borç riski yok ama büyük tek seferlik çekiş sürpriz.

### B5. Reklamlar (İlan Bürosu) — fiyat/etki uyumsuz
Fiyat = taban × (1 + 0,4 × seviye). Sv7: Tellal 5 700 · Kahve 11 400 · Gazete 22 800 · Vapur 30 400 · **Radyo 68 400 (+%40 müşteri, 3 gün)** · Panayır 45 600.
A/B (3 tohum): **Radyo canlı günlerde gelir 30 528 vs 30 687 (−%0,5)**; Sv3 −%1,6, Sv4 +%6,9 (gürültü); **Gazete (+%25) +%5 (+1,4k/gün) için 26k**. `BT.ilan.cust()` 1,4 döndüğü halde gelir artmıyor (A4). Öneri: ya kuyruk yavaşlatmasını (`spawnT *= 1+(bekleyen−1)·0,7`) akış çarpanından önce uygula/kaldır, ya da reklam fiyatını taban × (1+0,1·Sv) yap ve sürelerini 1 gün→günler olarak tut.

### B6. Sahil Lokantası (Sv5 tam, 12 masa, 3 aşçı, menü 5, tam devir; yatırım 98,7k açılış + 111k geliştirme)
| Senaryo | lokanta geliri/gün | grup/gün | maaş farkı | kira |
|---|---|---|---|---|
| Sv1, 2 masa, 1 yemek (tam kadro, devir) | ~3 350 | 10 | +420 | 523 |
| Sv5 tam | **~4 150** | 16 | +740 | **1 534** (2 132 toplam) |
- Sv1→Sv5 (111k): brüt +800/gün, kira +1 011 + maaş +320 ⇒ **net negatif**. 12 masa dolmuyor (16 grup/gün); kapı/tabela/süs akış katkıları +%2–4. Lokanta en pahalı yatırım ve getiri düşük (net +~2k/gün Sv1 için ~100k, geri ödeme ~50 gün; Sv5 için hiç).
- Öneri: lokanta kirası `RENT_LOK` 0,5…1,1 → 0,5…0,6; ya da grup akışı (`flow`) masa sayısıyla ölçeklensin (masa +1 → +%8 akış).

### B7. Müşteri tipleri (kişi başı "adet × çarpan")
Toptancı 20,3 · Kaptan 13,8 · Garson 13,0 · Otel Aşçıbaşı 12,0 · Ev Hanımı 11,2 · **Mafya 10,5** · VIP 7,5 · Şef 6,3 · Aile 5,8 · Turist 4,8 · İşçi 3,0 · Öğrenci 1,9.
- **VIP (Sv5, ×3,0) kişi başı yalnızca 7,5**, sabır 28 sn: "premium" tip ödüllendirmiyor. Öneri: VIP qty [3,5], sabır 40.
- **Günün müşterisi** (`day.feat`): %45 olasılıkla her doğuşu o tipe çeviriyor; bir tezgâhta 18–24 kişi aynı tip. Aynı tezgâhta gün geliri 8,8k ↔ 16,1k. Oyuncu nedenini bilemiyor. Öneri: %45 → %25 ve gün kartında "Günün müşterisi: X".
- Yeni sokak müşterileri 3 renkte ayrı *tip* (mafya mavi/sarı/siyah ayrı) → `featPool` renkleri ayrı sayıyor, "Mafya günü" olasılığı 3 kat. Öneri: aileyi tek say.
- Özel müşteriler: günde 3 hedef; ortalama **2,78**. Sv5–7'de (1–2 bölge) günlerin %38–45'inde <3 (özel için boş kuyruk yeri yok); Sv10'da %100.
- Hayvanlar: mama 8 (kedi)/12 (köpek) günde; akış +%5/+%3 (tavan +%10). A/B (4 tohum × 14 gün, Sv7, 4 kedi + 4 köpek): gelir 27 133 → 28 428 (+%4,8), net +764/gün (mama dahil) — ölçülebilir ama küçük; akış çarpanlarının neredeyse hepsi kuyruk darboğazında erirken hayvanlar +%5 verebiliyor (tavan +%10'a ulaşmıyor).

---

## UX / EĞLENCE (PERSONEL, YAPI, LOKANTA, genel)

- **Alt bar 4 sekme: ALAN · YÜKSELT · YAPI · PERSONEL.** "YÜKSELT" (oyuncunun kendi geliştirmeleri) ile YAPI › "Yükseltme" (bölge/istasyon) adları çakışıyor; yeni oyuncu bölge seviyesini nerede alacağını bulamıyor (bölge Sv en iyi yatırım, bulunması en zor yerde). Öneri: YAPI › Yükseltme'yi "Bölge" yap, ALAN sekmesine bölge Sv kartını da koy.
- **PERSONEL**: bölge çipleri + yatay kaydırmalı kartlar; 390 px genişlikte aynı anda 1,3 kart görünüyor, 5 rolün hepsini görmek için kaydırma gerek. Kart sırası fiyata göre değil (Tezgâhtar 800, Balıkçı 850, Filetocu 1000, Hamal 900, Tahsildar 1050); tüm roller alınmadan otomasyon açılmıyor ama panel "zincir tamamlama" ilerlemesini göstermiyor (yalnız Lokanta'da). Öneri: "Devir: 3/5 rol" şeridi + toplam kalan bedel.
- **Panel yüksekliği**: PERSONEL/YAPI paneli ekranın ~%40'ını kaplıyor; dünya görünümü daralıyor. Seviye atlama panosu ("Seviye 6 Kaptan" açılım listesi) panel açıkken üstte kalıp paneli örtüyor.
- **Lokanta paneli**: 9 sekme (MENÜ, TARİFLER, DENE, KİLER, İSTASYONLAR, KADRO, GELİŞTİRMELER, SÜSLER, OLAYLAR) 4 sütunlu ızgarada; "DENE" anlamsız; ilk açılışta en üstte kırmızı "Hal'den fileto al" düğmesi hata gibi görünüyor ve ilk görülen şey bu; metin yoğun ("dolap 0/12 • 0 grup ağırlandı", "Fiyat ×2,6" açıklamasız). Öneri: ilk kez açıkta 3 adımlı "kurulum listesi" (ocak → aşçı/garson → menü → devir).
- **Parodi/özel müşteri duyuru pencereleri** ("Tanıdık bir yüz geliyor… ya da öyle sanıyorsun!") ekranın ortasında ~3 sn tezgâhları örtüyor; günde 3 kez + konuşma balonları. Oyuncu elle oynarken tezgâh/kasayı kapatıyor. Öneri: üst şeride küçük toast.
- **Vapur**: "Vapur yanaştı: 9 yolcu indi" toast'ı güzel; ama yolcuların gelir etkisi yok (A3), oyuncu "yolcular para getirdi" hissi alamıyor.
- **Lodos**: görsel/ses iyi (şemsiyeler, replikler), ama olumsuz; kapanış vurgusu (yağmur sonrası ×1,5 20 sn) fark edilmiyor.
- **Hızlandırma yok** (ölü zaman, C1).
- Günün gelir/gider özeti ekranda var (maaş/kira/opex/vergi satırları); "net" satırı iyi.

---

## (C) EKLENEBİLİR FİKİRLER — etki ↑ / emek ↓

1. **Oyun hızı ×2/×3 (ve otomatik "gün atla" bölge devri tamamlandığında)**: ilk 21 gün ve geç oyun birikim beklemesi için en büyük kalite artışı. Emek: düşük (`gameStep` dt çarpanı + HUD düğmesi; çevrimdışı kazanç sistemi zaten var).
2. **Akış çarpanlarını gerçekten çalıştır** (kuyruk yavaşlatmasını ekle/çıkar): vapur, reklam, hayvan, yol süsü hepsi aynı darboğaza çarpıyor; tek düzeltme 5 sistemi birden anlamlı yapar. Emek: düşük–orta (denge testi gerekir).
3. **Gelir sinkleri/hedefleri**: itibar Sv10 sonrası "Sv11+ / yıldız" ya da liman rütbesi; nakit glut (gün 64+ net 40k) için büyük projeler (Kapalı Pazar, Fener, Tersane) görünür hedef olsun. Emek: orta.
4. **Buz Makinesi/Buzhane opex'i düşürsün** (her seviye −%2): opex'i azaltmanın bugün yolu yok; yatırıma anlam katar. Emek: düşük.
5. **Yağmurda sıcak ürün bonusu** (çorba/güveç +%20, lokanta masaları dolar): lodos fırsata dönsün. Emek: düşük.
6. **Vapur yolcusu = turist (bahşiş ×1,4, sabır kısa) ve kuyruk sayacına dahil değil**. Emek: düşük.
7. **Günün müşterisini gün kartı/üst şeritte göster** ("Bugün: Mafya Hanımı ×18 satış"). Emek: düşük.
8. **Devir zinciri ilerleme şeridi** (Personel ve Lokanta): "4/5 rol • kalan $4 421". Emek: düşük.
9. **Personel Kulübesi'ne gerçek etki**: ek yer 2. tezgâhtar/kasiyeri gerçekten hızlandırsın (veya tezgâh sayısı açsın), yoksa kulübe fiyatını yarıya indir. Emek: orta.
10. **Haşmet günü için "vergi kaçırma/anlaşma" mini kararı** (müdür +%25 indirim var; oyuncu için rüşvet riskli seçenek). Emek: orta, eğlence ↑.

---

## Sürüm günlüğü
- 20:2x UTC — ilk taslak.
- 20:5x UTC (hayvan A/B eklendi)
- 20:5x UTC — B1–B7, UX, C: bölüm seviyesi/ilerleme/reklam/lokanta/vapur A-B ölçümleri; stres testi temiz.
