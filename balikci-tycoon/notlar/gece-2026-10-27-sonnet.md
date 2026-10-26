# Gece oyun testi — 2026-10-27 (Sonnet)

Yöntem: Playwright + `BT.*` kancaları. Oyun zamanı `BT.emek.step(0.1)` ile hızlandırıldı (1 gün ≈ 0,1 sn gerçek süre).
"Bot" = her bölgede tam kadro + tam otomasyon (devir) kuruldu; oyuncu elle oynamıyor. Rastgelelik tohumlu (`Math.random` PRNG) → A/B karşılaştırmaları tekrarlanabilir.
Test bayrakları: `HK_EMEK_OFF/PET_OFF/LOK_OFF/TARIF_OFF = 0` (gerçek oyun ayarı), `HK_STORY/HELP/GZ/FPS_OFF = 1` (ara sahne yok).
Sayılar "günlük ortalama", 2. günden sonra, 2–4 tohum. Kod dosyalarına dokunulmadı.

> Bu dosya gece boyunca güncelleniyor; en alttaki "Sürüm günlüğü"ne bak.

---

## (A) HATALAR

(henüz doğrulanmış hata yok — aşağıdakiler "şüpheli / dikkat" notlarıdır; adım adım üretim yazıldı)

1. **[Düşük] Yükselt sekmesinde "Sv.0→1" etiketi.** Adımlar: yeni oyun → ☰ altı YÜKSELT sekmesi → "KAPASİTE Sv.0→1", "HIZ Sv.0→1". Diğer yerlerde "Sv.1→2" biçimi var; seviyeler 0'dan başlıyor, oyuncuya "Sv.0" garip görünüyor. Öneri: etiketi `lvl+1` göster ya da "Sv.1→2" yap.
2. **[Test notu] `barList()` kartlarının `go()` fonksiyonu parayı düşmüyor** (ücret düğme tıklama işleyicisinde kesiliyor). Test/hile kancası ile `go()` çağıran araç bedava alım yapar → test yazanlar için tuzak; `BT.buyItem(id)` benzeri tek kapı eklenebilir.

## (B) DENGE

### B1. Seviye başına otomatik (bot) ekonomi — her bölgede tam kadro, hiç yükseltme yok
Her satır 12 günün ortalaması (2 gün ısınma atıldı), Sv = `S.rep`/`lvFloor` ile ayarlı.

| Sv | gelir | maaş | kira | işletme gideri | net/gün | servis edilen |
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

Okuma:
- Gelir Sv5'ten sonra **düz** (yeni müşteri tipi/bölge açılmadıkça kadro aynı); işletme gideri (%4/Sv) arttığı için **net Sv5→Sv10'da %19 düşüyor** (21,5k → 17,5k). Bot yükseltme almadığı için bu bir "tavan" ölçümü; ama oyuncu için mesaj: Sv 6–10 arasında seviye atlamak tek başına para kazandırmıyor, para harcayacak yer şart.
- Vergi (Haşmet): 7. günde 0,95–1,45k (haftalık ciro ≈ %6–10). Vergi gününün net'i negatif (örn. −560…−1 351) — kasa tamponu yoksa borca gidiyor; uyarı toast'ı var, makul.
- Toplam kesinti Sv10'da: opex %28 + maaş %5 + kira %5 + vergi ~%8 ⇒ gelirin **~%46'sı** gidiyor.

### B2. Müşteri talebi mi, üretim mi sınır? — A/B (4 tohum × 14 gün, Sv7, 4 bölge tam kadro)
| Senaryo | gelir | net | servis |
|---|---|---|---|
| taban | 27 874 | 17 315 | 187 |
| **vapur kapalı** (`HK_FERRY_OFF`) | 27 823 | 17 268 | 183 |
| yağmur/lodos kapalı (`HK_WX_OFF`, 2 tohum) | 27 898 | 17 338 | 185 |
| Personel Kulübesi Sv3 + 2. kopya roller | 27 518 | 16 282 | 184 |
| Personel Kulübesi Sv5 + 2. kopya roller | 32 271 | 18 906 | 208 |
| bölge seviyesi 1→2 (4 bölge, 11,4k; 3 tohum × 12 gün) | 32 750 | 20 985 | 199 |

Bulgular:
- **Vapur yolcusu gelir katmıyor** (+4 kişi/gün, gelir ±0): yolcular boş kuyruk yerlerini dolduruyor, normal müşteriyi *yerinden ediyor*. Sistem kuyruk-yeri/tezgâh hızıyla sınırlı, talep bol. Vapur şu an salt görsel/atmosfer. Öneri: yolcuya kısa sabır + yüksek bahşiş (`mult` ×1,4) ya da "vapur" yalnız kuyruk dolu değilken ek müşteri çıkarsın; veya vapur gelişinde tezgâh başına +1 geçici kuyruk yeri.
- **Lodos/yağmur**: yağmur günü ort. gelir −%6 (25,5k vs 27k); günlerin ~%20'si (4. günden sonra, vergi günü hariç). Karşı hamle yok (kapalı tezgâh/şemsiye/sıcak çorba satışı gibi). Çok hafif bir kayıp, oyuncu fark etmeyebilir → fayda: "yağmurda çorba/güveç +%20" gibi bir telafi.
- **Personel Kulübesi** (1 500 / 4 000 / 9 000 / 18 000 / 36 000): Sv1–3'te her bölgeye +1/+2/+3 yer açar ama ek kadro **gelir getirmiyor**; maaş +786/gün ⇒ net **−1 033/gün**. Sv5'te gelir +%16, net +1 591/gün; kulübe + ek maaş bedeli ~70k+ ⇒ geri ödeme **>45 gün**. Yani kulübe seviyeleri kâğıt üstünde "+1 personel" ama ekonomik olarak kötü yatırım. Öneri: kulübe Sv1–3 ek yeri *tezgâh sayısına bağlı değilse* ek roller (ör. 2. Tezgâhtar) gerçekten hız eklemeli ya da kulübe fiyatı yarıya inmeli (750 / 2 000 / 4 500 / 9 000 / 18 000).
- **Bölge seviyesi (Sv1→2)** tam tersi: toplam 11,4k'ya gelir +%17, net +3,7k/gün (maaş ve kira artışı dahil) ⇒ **geri ödeme ≈ 3 gün**. Açık ara en iyi yatırım; oyuncuyu bu yöne itmek istiyorsak tamam, ama diğer yükseltmelerle uçurum var.
- **İstasyon yükseltmeleri** (Ağ/Kesim/Tezgâh/Kasa Tepsisi 1→2; 375–2 625 arası, toplam ≈ 20,6k): otomatik kadroda ölçülebilir gelir farkı yok (gürültü ±%3 içinde). "Tezgâh kâr +%3" dışında hepsi hız verir ve hız darboğaz değil. Elle oynayan oyuncuya yararlı olabilir; botta ölü yatırım.

### B3. Müşteri tipi değeri (kişi başı beklenen "adet × çarpan")
Elde: `qty ort × mult`: Toptancı 20,3 · Kaptan 13,8 · Garson 13,0 · Otel Aşçıbaşı 12,0 · Ev Hanımı 11,2 · Mafya (Baba/Hanım) 10,5 · VIP 7,5 · Şef 6,3 · Aile 5,8 · Turist 4,8 · İşçi 3,0 · Öğrenci 1,9.
- **VIP (Sv5, çarpan ×3,0) kişi başı yalnızca 7,5** — Kaptan/Toptancı/Garson'dan az; sabrı 28 sn (cezalı). "Premium" hissi veren tip ekonomik olarak ödüllendirmiyor. Öneri: VIP qty [3,5], sabır 40.
- **Günün müşterisi** (`day.feat`) %45 olasılıkla *her* doğuşu o tipe çeviriyor; sim'de bir tezgâhta 18–24 kişi aynı tip (Mafya Hanımı Mavi ya da Pazar Teyzesi). Aynı tezgâhta gün geliri 8,8k ↔ 16,1k (×1,8) oynuyor. Gün günden salınım fazla; oyuncu "bugün neden az kazandım" sorusuna cevap bulamaz. Öneri: %45 → %25; ya da gün kartında "Günün müşterisi: X (+%…)" göster.
- Yeni sokak müşterileri her biri 3 renkte ayrı *tip* olarak çıkıyor (mafya mavi/sarı/siyah ayrı sayılıyor); `day.feat` bu 3 rengi ayrı ayrı seçebiliyor ⇒ "Mafya" günü olasılığı üç kat. Öneri: `featPool`'da renkleri tek aile say.

(Devam: özel müşteriler, lokanta, hayvan/vergi, ilerleme simülasyonu…)

## (C) EKLENEBİLİR FİKİRLER (etki ↑ / emek ↓ sırası)

1. **Buz Makinesi/Buzhane işletme giderini düşürsün** (örn. her seviye −%2 opex): şu an opex'i azaltmanın yolu yok; para-sinki anlamlı olur. Emek: düşük.
2. **Vapurda bahşiş/kısa sabırlı turist** (B2): vapur gerçekten gelir etkisi yapsın. Emek: düşük.
3. **Yağmurda sıcak ürün bonusu** (çorba/güveç +%20) → lodos olumsuz değil fırsat. Emek: düşük.

---

## Sürüm günlüğü
- 20:2x UTC — ilk taslak: B1/B2/B3.
