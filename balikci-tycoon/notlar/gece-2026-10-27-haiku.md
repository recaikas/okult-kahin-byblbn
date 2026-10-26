# Gece oyun testi — Haiku (2026-10-27)

Kapsam: yerel sunucu (port 8160), Playwright saat API'siyle hızlandırılmış oyun günleri.
Her seviye için sabit bir ekip (her açık bölgede hamal / filetocu / tezgâhtar / tahsildar, para yettikçe),
tüm tezgâhlar açık, oyuncu hiç balık tutmuyor ve yerinde duruyor. Yani aşağıdaki rakamlar
"oyuncusuz, ekipli" bir taban ölçümüdür; gerçek bir oyuncunun kazancı bunun üstünde olur.
Örneklem küçük (her seviye 4 gün), bu yüzden kesin değil, yön gösterir.

## (A) HATALAR

- **Hata yok (şu an):** Tarayıcı konsolunda ve sayfa hatalarında (`pageerror`) hiçbir hata çıkmadı (5 seviye × 4 gün, `ERRS []`).
- **Repo testi:** `test-vergi.js` (Vergi Memuru Haşmet Bey) `VERGI_OK` döndü.
- **Gözlem (hata değil, test düzeneği):** Hızlandırılmış oyunda kare hızı yapay olduğundan "Grafik: DÜŞÜK" önerisi
  (`fpsWatch`) açılıyor ve gün sonu kartının tıklamasını kesiyor. Testlerde `window.HK_FPS_OFF = 1` ile kapatıldı.
  Gerçek cihazda kare hızı düşükse öneri doğru çalışıyor olmalı; yalnız yorumun belirtilmesi gerekebilir.
- **Gözlem:** Oyun başında nakit 0 ve hiç işçi yok. Balık ağları kendi kendine balık üretiyor ama
  tezgâha taşıyan biri olmadan satış 0. Yani yeni oyuncu, ilk işçiyi almadan (≈360 para) hiç gelir göremiyor.
  İlk gün nasıl bir yol izlenmesi gerektiği (ilk balığı kim taşıyor) oyunun içinden anlaşılmıyor olabilir;
  yeni oyuncu için kontrol edilmeli.
- **Kayıt (dayanıklılık, oyuncuya görünmez):** `loadFrom(d)` açık bir dünyaya uygulanırsa işçileri SİLMEDEN ekler.
  Tekrar üretim: oyun açıkken 2 işçi varken `BT.loadFrom(JSON.parse(JSON.stringify(BT.buildSave())))` → işçi sayısı 2 → 4.
  Normal akışta (`useSlot` → `resetWorld()` → `loadFrom`) sorun çıkmaz; yani oyuncu yüklemesinde hata yok.
  Önerilen önlem: `loadFrom` başına da `workers.length = 0` (ya da kaydı yalnız `resetWorld` sonrası uygula). Konum: game.js `loadFrom` (~3758), `d.workers.forEach` (~3830).
- **Özellik turu (vapur, yağmur, özel müşteri, kayıt):** `BT.ferry.call(6)` ve `BT.wx.start()` hatasız çalıştı; iki gün sonra ve kayıt/yükleme sonrası konsol hatası yok.
  `ERRS []`. Kayıt alanı 72 anahtar; yüklemeden sonra nakit 7540 → 7536 (gün içi harcama farkı).

- **Pazar günü (5. gün):** Seviye 4, 4 işçi, 2 bölge ile 6 günlük testte pazar günü geliri **2,765**, normal günler **1,404–1,847**
  (≈ +50%). Servis 75 (normal 48–63). Gün sonu kartındaki "pazar" akışı (hazırlık ekranı → "PAZARI AÇ") sorunsuz çalıştı.
  Pazar günü ciro gideri de artıyor (221 vs ~70–110); net yine pozitif.

## (B) DENGE

Ölçüm: gün sonu kartındaki `inc` (gelir), `wage` (maaş), `rent` (ödenen kira), `opex` (ciro payı gideri).
Net ≈ gelir − maaş − kira − opex. Rakamlar 4 günün aralığı.

| Seviye | Ekip | Gelir/gün | Maaş/gün | Kira/gün (ödenen) | Ciro gideri/gün | Net (kabaca) | Kaybedilen müşteri/gün | Nakit |
|---|---|---|---|---|---|---|---|---|
| 1 | 4 (1 bölge) | 1373–1803 | 364–383 | 0 | 0 | ≈ +1000 … +1400 | 0 | artıyor (263 → 6225) |
| 3 | 5 (2 bölge) | 1430–1724 | 471–731 | 39 | 57–69 | ≈ +700 … +850 | 8–15 | ~1400–2100 |
| 5 | 6 (3 bölge) | 1321–1792 | 551–719 | 453 | 106–143 | ≈ +400 … +500 | 17–22 | ~1000–2000 |
| 8 | 6 (3 bölge) | 1114–1788 | 551–584 | 539–1308 (kısmi) | 0–328 | negatif | 22–36 | **0'a düştü** |
| 10 | 6 (3 bölge) | 1732–1990 | 526–577 | 1206–1308 (kısmi) | 0–464 | negatif | 28–36 | **0'da kaldı** |

Okumalar:
- **Gelir seviyeyle artmıyor.** Seviye 1'den 10'a gelirin ortalaması ~1,500 → ~1,800; müşteri kaybı ise 0'dan 30+'a çıkıyor.
  Yani ekip büyümeden (kapasite sabit) yüksek seviyedeki müşteri talebi karşılanmıyor. Yüksek seviyede işçi/tezgâh
  sayısı da artmalı, yoksa gelir artmıyor ama kira artıyor.
- **Kira seviyeyle sert artıyor:** 0 → 39 → 453 → ~1308/gün. Seviye 8–10'da kira, bu ekibin gelirinin yarısından fazlası.
  Ekip ve gelir büyümezse seviye 8'den itibaren oyun batmaya gidiyor.
- **Kira kısmi ödeniyor** (`rent.paid < rent.tot`, kartta "kısmi" yazıyor). Seviye 8/10'da nakit 0 olduğu için
  kira her gün eksik tahsil ediliyor; bu borç mekaniğinin (varsa) nasıl işlediği ayrıca kontrol edilmeli.
- **Maaş seviyeden bağımsız:** 6 işçi ≈ 550–580/gün. Gelir (1500+) ile karşılaştırıldığında maaş ana gider değil; asıl baskı kira.
- **Ciro gideri (opex)** gelirin ~%5–8'i gibi görünüyor (L5: 143/1786 ≈ %8). Gün gün 0 olması nakit yetersizliğinden.
- **Başlangıç:** 3000 nakitle 4 kişilik ekip alınabiliyor (toplam ~2,900). Gerçek oyuncu 0 ile başlıyor; bu ekibe ulaşmak için ne kadar gün gerektiği ayrıca ölçülmeli.
- **Fiyat:** İşçi fiyatı her yeni işçiyle hızla artıyor (aynı rolde ~×2: hamal 360 → 486 → 612 bölgeler arası; tezgâhtar 2,396 ilk alımda).
  Bu, ikinci bölgeden sonra büyümeyi yavaşlatıyor.

Genel: Seviye 1–3 rahat, 5 orta, **8 ve 10 zor/negatif** (bu ekip ve sabit kapasite ile). Seviye 8+ için ya kira
düşürülmeli ya da o seviyede kapasite (tezgâh/işçi) otomatik artmalı.

Sınırlar: oyuncu balık tutmuyor, zone 0 dışındaki bölgeler sadece hamal ile dolduruldu, Sahil Lokantası / hizmet binaları / kontratlar dahil değil.

## (C) EKLENEBİLİR FİKİRLER

1. Seviye 8+ için "kapasite ölçeği": yüksek seviyede tezgâh sayısı ya da hızlı personel teklifi, gelir ile kira arasındaki boşluğu kapatır.
2. Kira için kademeli tavan ya da seviyeye göre indirim (ör. ilk N gün yarı kira).
3. İlk gün kurtarıcı: 0 nakitte bir kerelik "ilk tayfa" (ücretsiz hamal, 1 gün) ya da ağın tezgâha otomatik ilk taşıması.
4. Müşteri kaybını gösteren küçük bir gün kartı satırı ("kaçan: N, sebebi: kapasite") oyuncuya ne yapacağını söyler.
5. Hızlı tuş/otomatik mod: deneme ve dengeleme için oyuncunun kendisi yerine tek tıkla "bugün ekip çalışsın" (oyun içi değil, geliştirici modu).
