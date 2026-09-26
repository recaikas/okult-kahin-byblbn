# Hamsi Koyu (eski adı Balıkçı Tycoon) — Bölüm 2 "Devler Ligi" taslağı

**Alınan kararlar (oyuncu/yapımcı ile):**
- Bölüm 1 kapanışı: **gazete manşeti** ✅ (v1.3'te yapıldı). Açılıştaki dönen gazete geri gelir: "LİMANIN YENİ PATRONU",
  oyuncunun gerçek limanının fotoğrafı ve rakamları; ertesi sabahın gazetesinde ufukta dev trol filoları.
- **Telefon Bölüm 2'ye kaldı**: Bölüm 2'nin açılış yeniliği olacak.
- Bölüm 2'nin yönü: **şubeler → sabit gelir → ilçe ilçe, şehir şehir büyüme**, fabrika ve marka, dev rakipler,
  **pazar payı ve borsa savaşları**. Kapsamlı olacak.
- **Oyun yapısı: şehir haritası içinde, Coffee Inc tarzı işletme oyunu.** Coffee Inc'in *mekaniklerini* referans
  alıyoruz (haritada yer seçip dükkân açma, ürün/fiyat, departmanlar, rakipler aynı haritada, borsa ve devralma).
  Görseller, isimler ve metinler tamamen bizim: pixel art, Karadeniz teması, balık ürünleri.

---

## Bölüm 2'nin omurgası

Bölüm 1'de tek bir limanı elle büyüttün. Bölüm 2'de kamera yükselir ve oyun **izometrik pixel bir şehir haritasına**
geçer. İlk liman haritanın kıyısında bir bina olarak durur: müdürlerle kendi döner ve sabit gelir getirir
(içine girip Bölüm 1 sahnesini oynamaya devam edebilirsin). Sen şehirde yer kiralayıp şube açar, ürün ve fiyat
belirler, merkezde departmanlarını büyütür, üç devle mahalle mahalle pazar payı ve borsada savaşırsın.

**Bitiş hedefi:** üç devden birini borsada **satın almak** (devralma) ya da şehir pazarının **%40**'ına ulaşmak.

---

## 1. Şehir haritası (Coffee Inc tarzı)

**Ekran:** yakınlaştırılıp kaydırılabilen izometrik pixel şehir. Sokaklar, mahalleler, kiralık dükkânlar (tabelalı
boş vitrinler), rakiplerin renkli şubeleri, gündüz/gece. Alt çubukta: Şubeler • Ürünler • Departmanlar • Pazarlama •
Rakipler • Borsa • Telefon.

**Mahalleler** (her birinin kendi müşteri profili var):

| Mahalle | Kalabalık | Fiyat hassasiyeti | Ne ister |
|---|---|---|---|
| Sahil / İskele | yüksek | orta | Taze fileto, hamsi, balık-ekmek |
| Eski Çarşı | çok yüksek | yüksek | Ucuz ve hızlı, tezgâh |
| Üniversite | yüksek | çok yüksek | Balık dürüm, paket ürün |
| Marina / Turistik | orta | düşük | Füme, levrek, somon, lokanta |
| Villalar | düşük | çok düşük | Premium, orkinos, eve teslim |
| Sanayi / Liman arkası | orta | orta | Toptan, konserve, kasa satış |

**Dükkân açma (Coffee Inc'teki "konum seçme" hissi):**
- Haritada boş vitrine dokun: yaya trafiği, kira, mahallenin talebi ve yakındaki rakipler görünür.
- Şube tipini seç, dükkânı döşe (tezgâh, buzdolabı, füme makinesi, oturma yeri) ve personel ile müdür ata.
- Aynı mahalledeki iki şube birbirinin müşterisini böler (yamyamlık). Doğru yer seçimi asıl oyun.

| Şube tipi | Maliyet | Gelir | Not |
|---|---|---|---|
| Tezgâh | düşük | küçük, sabit | Çarşı ve sahilde hızlı kurulur |
| Balık-ekmek büfesi | düşük–orta | hızlı satış | Üniversite, sahil |
| Balık lokantası | orta | orta | Özel müşteriler buraya da gelir |
| Toptan deposu | orta | kasa satış | Sanayi; kontratlar ve marketler |
| Büyük mağaza / şarküteri | yüksek | yüksek | Marina ve villalar; marka gerektirir |

- **Ürün ve fiyat (menü):** her şubede hangi ürünlerin satılacağı ve fiyatı ayarlanır (fileto, füme, dürüm,
  konserve, lakerda…). Fiyat mahallenin hassasiyetine göre müşteri sayısını değiştirir.
- **Sabit gelir:** her şube dakikada gelir üretir. Gelir; menüye, fiyata, müdüre, mahalle talebine ve rakip
  varlığına bağlıdır. Haritada şubelerin üstünde küçük gelir balonları çıkar.
- **Şube müdürü:** Bölüm 1'deki müdür sistemi büyür. Müdürler terfi eder, başka şubeye tayin edilebilir. Rakipler
  iyi müdürlere teklif yapar; sadakat ve prim sistemi gelir.
- **İçeri gir:** her şube isteğe bağlı olarak Bölüm 1 tarzı küçük bir sahnede oynanabilir. Elle çalışırsan o gün
  geliri artar.

**Merkez ve departmanlar** (Coffee Inc'teki genel merkez yapısı):

| Departman | Ne açar |
|---|---|
| Ar-Ge | Yeni ürünler (balık dürüm, lakerda, konserve, balık burger), kalite |
| Lojistik | Depo, soğuk zincir, filo; şubelere tedarik hızı ve maliyeti |
| Pazarlama | Reklam kampanyaları, marka bilinirliği |
| İnsan Kaynakları | Müdür havuzu, eğitim, maaş/sadakat |
| Finans | Kredi, halka arz, hisse işlemleri |

**Şehirden şehre:** ilk şehir Trabzon (kıyı). Belli bir büyüklüğe ulaşınca yeni şehir haritaları açılır: Samsun →
İstanbul (Karaköy) → İzmir → Antalya. Her şehrin kendi mahalleleri ve rakip ağırlığı var.

## 1b. Filo (Bölüm 1'den ertelenen binalar)

v1.4'te Bölüm 1'den çıkarılan iki hizmet binası burada gerçek işleriyle döner:
- **Yakıt İstasyonu:** filonun sefer maliyetini düşürür, dış teknelere yakıt satar.
- **Tersane:** tekne alma ve yükseltme, filo yuvası, amiral gemisi. Lojistik departmanıyla birlikte açılır.

## 2. Fabrika ve marka

- **İşleme tesisi:** konserve, füme paket, dondurulmuş fileto hatları. Hammaddeyi şubeler ve filo sağlar.
- **Marka:** isim zaten var (işletme adın). Logo ve ambalaj rengi seçilir; marka bilinirliği reklamla büyür.
- **Market rafları:** zincir marketlere raf anlaşması (kontrat), raf payı pazar payına eklenir.
- **Kalite ve itibar:** kalite puanı düşerse iade ve haber skandalı çıkar.

## 3. Üç dev rakip

| Dev | Güçlü yanı | Hamleleri |
|---|---|---|
| **Poyraz Holding** | Endüstriyel trol filosu | Fiyat kırar, balık fiyatını düşürür, küçük şubelerin yanına ucuz tezgâh açar |
| **Kuzey Buz** | Soğuk zincir ve lojistik | Kontrat ve market raflarında yarışır, depo kiralarını yükseltir |
| **Altın Olta** | Lüks restoran zinciri | VIP ve özel müşterileri çeker, iyi müdürlere teklif yapar |

Her devin haritada renkli bölgeleri ve bir pazar payı çubuğu var. Hamleleri gazetede ve telefonda haber olur.

## 4. Pazar payı savaşları

- Her mahallenin ve şehrin bir **pazar payı pastası** var (sen + üç dev + yerel esnaf). Harita "pazar payı"
  görünümünde mahalleler renklenir (Coffee Inc'teki gibi kimin nerede güçlü olduğu bir bakışta görülür).
- Payı artıran yollar: şube açmak, reklam, fiyat kampanyası, kalite, özel müşteriler, ihaleler.
- **Fiyat savaşı:** bir bölgede fiyat kırarsan pay kazanırsın ama kâr düşer; dev karşılık verir.
- **İhaleler:** otel zincirleri, okullar, hastaneler, ordu. Kapalı zarf teklif; kazanan payı ve itibarı alır.

## 5. Borsa savaşları

- Bölüm 1'deki Ticaret Ofisi/Holding altyapısı genişler: **halka arz** (kendi şirketini borsaya aç).
- Devlerin hisseleri işlem görür. Hisse toplayıp yönetim kurulunda koltuk alabilirsin, sonunda **devralma teklifi**
  yaparsın.
- Devler de sana karşı hisse toplar: **düşmanca devralma** riski. Savunma için hisse geri alımı, dost yatırımcı,
  temettü dengesi.
- Haberler hisse fiyatlarını oynatır (fırtına, skandal, rekor av).

## 6. Telefon — "Kıyı Telefonu" (Bölüm 2'nin açılış yeniliği)

Oyun durmadan küçük işler için. Ticaret Merkezi ve Balık Hali büyük işler için kalır.

| Uygulama | Ne yapar |
|---|---|
| 📞 Sipariş Hattı | Lokanta ve oteller arar: "8 levrek füme, 4 dk, +%40". Kabul / red. |
| 📦 Toptan Sipariş | Halden uzaktan sandık alımı, kamyonla depoya teslim (biraz pahalı) |
| 📣 Reklam | Gazete, afiş, radyo, "günün balığı", sosyal medya kampanyaları (süre + bekleme) |
| 💬 Mesajlar | Özel müşteriler, müdür raporları, rakiplerden laf sokma, hikâye |
| 🤝 Kontrat Hattı | Ticaret Merkezi tekliflerini uzaktan kabul |
| 📈 Borsa | Hisse al/sat, devralma teklifleri, uyarılar |
| 🗺️ Şubeler | Şubelerin geliri, müdürü ve sorunları |

**Reklam kampanyaları**

| Kampanya | Maliyet | Süre | Etki | Bekleme |
|---|---|---|---|---|
| Gazete ilanı | $400 | 1 gün | Müşteri akışı +%15 | 1 gün |
| Mahalle afişi | $900 | 2 gün | Seçilen tezgâh/şubeye +%30 müşteri | 2 gün |
| Radyo reklamı | $2.500 | 1 gün | Akış +%30, turist ve toptancı artar | 3 gün |
| "Günün balığı" | $1.200 | 1 gün | Seçilen türe talep ×2, fiyat +%10 | 2 gün |
| Sosyal medya (Selfi Selin ile tanıştıysan) | $4.000 | 2 gün | VIP/şef artar, itibar +%20 | 4 gün |
| TV reklamı (Bölüm 2) | $15.000 | 3 gün | Tüm şubelerde marka bilinirliği ve pazar payı artar | 7 gün |

## 7. Bölüm 2 akışı (önerilen sıra)

1. **Açılış:** gazete kapanışının devamı; kurye telefonu getirir, ilk arama Poyraz Holding'den: "Limanını satın alalım."
   Reddedersin, savaş başlar.
2. **Şehir haritasına geçiş:** kamera limandan yükselir, Trabzon haritası açılır. İlk şube: Eski Çarşı'ya tezgâh;
   yer seçme, menü ve sabit gelir öğretilir.
3. **Fabrika:** ilk konserve hattı, marka kurulumu.
4. **İlk dev hamlesi:** Poyraz fiyat kırar; fiyat savaşı ve reklam öğretilir.
5. **Şehir:** Samsun ya da Karaköy'de büyük mağaza.
6. **Borsa:** halka arz, ilk hisse savaşı.
7. **Final:** bir devi devral ya da %40 pazar payı. Bölüm 2 kapanışı yine gazete manşetiyle: "KARADENİZ'İN YENİ DEVİ".
