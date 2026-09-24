# Balıkçı Tycoon — Geri Bildirim Analizi ve 3 Fazlı Çözüm Planı

Kaynak: oyunculardan gelen 16 maddelik "Oyunu Güzelleştirmek İçin Gerekenler" listesi.
Her madde için: **mevcut durum → sorun → çözüm fikri → oyuncuya etkisi**.

Genel ilke: yeni sistemler **ana akışı zorunlu bir ara adımla uzatmamalı** (eski merkezi depo bu yüzden
"saçma" olmuştu). Her yeni şey ya işi **kolaylaştırmalı** (otomasyon) ya da **isteğe bağlı bir kazanç**
sunmalı (depo, hal, kontrat).

---

## Harita düzeni (hedef, Faz 3 sonunda)

```
 x→ 0 ........................ 10 | 10.5 ............. 15
 ┌──────────────────────────────┐ ┌──────────────────────┐
 │ BÖLGE 1  İskele (hamsi)      │ │                      │
 │  ağ · kesim · TEZGÂH+kasa ─kuyruk│  LİMAN MEYDANI       │
 ├──────────────────────────────┤ │  • Personel Kulübesi │
 │ BÖLGE 2  Pazar (uskumru)     │ │  • Depo + sevk rampası│
 │  ağ · kesim · TEZGÂH+kasa ─kuyruk│  • Ticaret Merkezi   │
 ├──────────────────────────────┤ │  • Balık Hali        │
 │ BÖLGE 3  Fümehane (levrek)   │ │  • Ana Kasa          │
 │  ağ · kesim · FÜME · TEZGÂH  │ │                      │
 └──────────────────────────────┘ └──────────────────────┘
   süsler: kıyı şeridi + kenarlar      (tezgâh alanında süs yok)
```

Tezgâh bölgeleri yalnız üretim + satış içindir. Yönetim binaları (kulübe, depo, ticaret, hal, ana kasa)
ayrı bir **Liman Meydanı**'na taşınır; oyuncu karakteriyle yürüyerek gider.

---

## FAZ 1 — Hissiyat ve netlik  ✅ (bu sürümde yapıldı)

| # | Madde | Çözüm |
|---|---|---|
| 3 | Açılış müziği | Kendi bestemiz **"İskele Türküsü"**, Web Audio ile **chiptune**: re minör, 132 BPM, 16 ölçü; kare dalga melodi + sallanan üçgen bas + hafif davul. Dosya yok → telif sorunu yok. Hikâye ve ana menüde çalar, oyuna girince yumuşakça susar. Ses ayarına bağlı. |
| 4 | İtibar = seviye sistemi | 10 seviye (Çırak → Karadeniz Efsanesi), HUD'da "SV N" + sonraki seviyeye çubuk, seviye başına +%2 satış primi. **Seviye atlayınca** oyunu durdurmayan üst şerit: "SEVİYE 4 · Tezgâh Ustası" + açılanlar listesi, kısa fanfar, konfeti. Her seviye bir şey açar (bölgeler, bina, ofis, lisans…); kilitli kartlarda "🔒 Sv 4" yazar. |
| 7 | Yapı alt kategorileri | YAPI sekmesi içinde 3 alt sekme: **Dekoratif** · **Geliştirmeler** (parsel binaları: kulübe, çay ocağı, vinç…) · **Yapı Yükseltmeleri** (bölge seviyeleri). |
| 10 | Hareket ikonu + kontrol eğitimi | Dokunduğun yerde belirgin pixel joystick (taban + topuz + yön oku). İlk açılışta kısa kontrol eğitimi: *sürükle (veya WASD) → yürü*, ardından *durman yeter: karakter kendiliğinden alır/bırakır*; sonra mevcut hedef bandı (ağ → kesim → tezgâh) devam eder. |
| 1 | Süsler tezgâh dışında | 12 süs batı kıyı şeridine, iskele önü suya ve güney kumsala taşındı; tezgâh, kuyruk, kesim masası, ağ ve parsellere en az 1.5 kare (kodda `decorClearance()` ile doğrulanıyor). |
| 12 | Gün sonunda müşteriler değişsin | Gün kapanınca kalan müşteriler selamlaşıp ayrılır (kayıp sayılmaz). Yeni gün **"Günün müşterisi"** ile başlar: her gün bir müşteri tipi (lokantacı, toptancı, turist…) öne çıkar, banner'da yazar → her gün farklı kalabalık. |

Zaten olanlar (doğrulandı): **#5** kesim tezgâhı bölgeye özel (v2.2) · **#13** füme yalnız son bölgede.

---

## FAZ 2 — Otomasyon ve kimlik

### #8 Karakter oluşturma
İsim ekranından önce **Karakter** ekranı: ad, saç modeli (5), saç rengi (6), ten rengi (5), kasket/yazma
(3), önlük rengi. Canlı önizleme (büyütülmüş pixel karakter, döner). Oyuncu karakteri oyunda bu görünümle
çizilir; skor tablosunda "Hasan Reis — Hasan Balıkçılık" gibi görünür.

### #2 Her tezgâhta ayrı çalışan + "Personele Devret"
- Tezgâhtar artık **tezgâha** atanır (bölgeye değil): ek tezgâh = ek tezgâhtar yeri.
- Her tezgâhın bir **otomasyon zinciri** var: Hamal (ağ→kesim) · Filetocu (kesim) · Tezgâhtar (satış) · Tahsildar (para).
- Zincir tamamsa tezgâh kartında **⚙ PERSONELE DEVRET** düğmesi açılır. Devredilen tezgâh:
  oyuncu dokunmadan döner, üstünde dişli rozeti, bölgeye girince "otomatik" yazar.
- Oyuncu isterse yine gezip müdahale eder (toplama/taşıma serbest), devri istediği an geri alır.

### #9 + #6 Tezgâh kasası + parayı personel taşır
- Her tezgâhın yanında **küçük kasa** (bakır para kutusu). Müşteri ödemesi buraya düşer, üstünde para yığını görünür.
- **Oyuncu** kasanın yanından geçerse para anında işletmeye geçer → merkeze dönme zorunluluğu biter.
- **Tahsildar** (her bölgeye 1): bölgedeki tezgâh kasalarını boşaltır, para torbasını **Ana Kasa**'ya
  yürüyerek götürür (para oraya varınca hesaba geçer). Otomasyonun görünen yüzü.
- Kasa kapasitesi var (yükseltilir). Dolarsa o tezgâhta "KASA DOLU" uyarısı, yeni müşteri beklemeye
  başlar → tahsildar almak için doğal bir sebep.

---

## FAZ 3 — Liman Meydanı (yeni bölge) + Depo

Haritanın doğusuna tüm bölgelere komşu, yürünerek gidilen **Liman Meydanı** eklenir.

### #11 Personel Kulübesi (seviyeli, meydanda)
- Seviye 1–5. Her seviye **toplam personel sınırı** +3 (Sv1: 4 kişi … Sv5: 16 kişi) ve işe alım indirimi.
- Personel kulübede işe alınır (kapıya yürü → personel paneli). Menüden erişim de kalır.
- Bölge başına sınır kalkmaz ama asıl tavanı kulübe belirler → "otomasyonu büyütmek = kulübeyi büyütmek".

### #14 + #15 DEPO — önerilen tasarım
**Amaç:** hiçbir şey çöpe gitmesin ve kontratlar ayrı bir lojistik hattıyla karşılansın. Ana akışa
**zorunlu ara adım eklemez**: normal ürün yine kesimden doğrudan tezgâha gider.

1. **Ne depolanır?** Tezgâh arka stoğu dolduğu için kesim masasının hasırında bekleyen fazla fileto/füme.
   Eskiden bunlar gün sonu mezatta ucuza gidiyordu; artık depoya taşınıp saklanabilir.
2. **Raflar türe göre ayrık** (hamsi rafı, uskumru rafı, levrek/füme rafı) → ürünler asla karışmaz.
   Soğuk hava deposu olduğu için bozulmaz; kapasite depo seviyesine bağlı.
3. **Deponun kendi personeli** (depo sayısına bağlı sınır, kulübe sınırından ayrı):
   - **Depo Hamalı:** hasırlardaki fazlayı toplar, depoya taşır; bir tezgâhın stoğu biterse depodan
     o tezgâha geri besler (yalnız aynı türü).
   - **Sevkiyatçı:** Ticaret Merkezi'nden alınan kontratların ürününü raftan toplar, sandığa koyar,
     **Sevk Rampası**'ndaki kamyona/tekneye götürür → kontrat teslim edilir, ödül gelir.
4. **Oyuncu** isterse hepsini elle yapar: rafa ürün bırakır, sipariş sandığını kendisi taşır.
5. **Depo seviyeleri:** raf kapasitesi, depo personeli sınırı, soğutma (fümenin değeri depoda korunur).
6. **Gün sonu:** depo taşarsa fazlası mezata gider (mevcut Mezat Salonu ile uyumlu).

### #16 Ticaret Merkezi ve Balık Hali — gezilebilir binalar
- **Ticaret Merkezi** meydana taşınır; kapısına yürüyünce kontrat/borsa paneli açılır. Kontrat kabul
  edilince depoda "hazırlanacak sipariş" olarak görünür (Sevkiyatçıya iş çıkar).
- **Balık Hali:** her sabah değişen fiyatlarla **toptan alış-satış**. Ağın yetişmediği türü sandıkla
  satın alıp depoya koyabilir, fazlanı toptancıya satabilirsin. Günün sonunda mezat burada kurulur.
- **Ana Kasa** meydanda: tahsildarların para getirdiği yer; banka/kredi gibi ileri özellikler burada büyür.

---

## Faz sırasının gerekçesi
1. **Faz 1** her oyuncunun ilk 5 dakikasını iyileştirir, mevcut sistemleri bozmaz.
2. **Faz 2** otomasyon hissini verir; Faz 3'ün personel ve para akışı buna dayanır.
3. **Faz 3** haritayı genişletir; depo/ticaret/hal, Faz 2'deki personel ve kasa altyapısını kullanır.
