# Hamsi Koyu — Geliştirme Günlüğü (Reels / Shorts)

Her gün bir video: "GÜN N" başlığıyla bir mekanik, gerçek oynanış, sonunda tek bir soru.
Görüntüler oyunun kendisinden kaydedilir: bir bot oyunu gerçekten oynar, sanal saatle 30 fps kare kare çekilir.
Ekran görüntüsü canlandırması ya da oyunda olmayan bir şey yok. İleri sarılan yerlerde ekranda **"▶▶ İLERİ SARDIM"** yazar.

## Klasörler

| Yol | Ne |
|---|---|
| `days/gun-NN.js` | O günün senaryosu: sahneler, altyazılar, botun ne yapacağı, kapak |
| `tools/devlog.js` | Oyunu açar, senaryoyu oynatır, kareleri çeker, SRT altyazıyı yazar |
| `tools/make.py` | Kareler + özgün müzik → MP4, müziksiz MP4, kapak JPG ve otomatik kontrol |
| `out/gun-NN/` | Teslim: `gun-NN.mp4`, `gun-NN-muziksiz.mp4`, `kapak.png/jpg`, `gun-NN.srt`, `muzik.wav`, `metinler.md` |

`out/*/frames/` (ham kareler) git'e girmez; yeniden üretilebilir.

## Yeni günün videosunu üretmek

```bash
cd balikci-tycoon
python3 -m http.server 8099 &                                  # oyun sunucusu
PREVIEW=15 node social/tools/devlog.js social/days/gun-02.js   # hızlı önizleme (her 15 karede 1)
node social/tools/devlog.js social/days/gun-02.js              # tam kayıt (~5 dk)
python3 social/tools/make.py gun-02                            # MP4 + kontrol
```

`make.py` şunları denetler: 1080×1920, H.264 yuv420p, AAC ses, sesin duyulması, hatasız çözülme, süre ve kare sayısı.

## Biçim (her gün aynı)

- **0–2 sn kanca:** tek cümle merak ("Bugün müşterilerin aklından geçeni görebiliyorum.")
- **2–20 sn:** mekaniği oynanışla göster; en çok 2 satırlık altyazılar; üstte küçük **recaikas** logosu ve **GELİŞTİRME GÜNLÜĞÜ · GÜN N**.
- **Son 5 sn:** tek soru + "YORUMLARA YAZ · YARIN: GÜN N+1".
- Seslendirme: `metinler.md` içindeki metni kendi sesinle oku (geliştiricinin kendi sesi bu seride en samimi olanı). Videonun müzikli ve müziksiz iki sürümü var; CapCut ya da Instagram/YouTube düzenleyicisinde sesini müziksiz sürüme ekleyebilirsin.
- Altyazılar videoya işlenmiştir. SRT dosyası YouTube'a ayrıca altyazı olarak yüklenebilir, ama ekranda çift yazı görünmemesi için gerek yok.

## Konu takvimi (hepsi oyunda olan mekanikler)

| Gün | Konu | Ne gösterilir | Son soru |
|---|---|---|---|
| 1 | Her şey küçük bir iskelede başlıyor | Ağ → kesim → tezgâh → satış, sonra büyümüş koy | Sen bu dükkânın tabelasına ne yazardın? |
| 2 | Ağlar kendiliğinden dolar ama taşıma sınırı var | Taşıma 0/8, yükseltme: sepet | İlk parayı neye harcardın? |
| 3 | Kesim masası ve fileto | Kesim süresi, mat dolması | Hamsi mi, levrek mi? |
| 4 | Müşteri sabrı | Sabır çubuğu, kaçan müşteri | Sen sırada kaç dakika beklersin? |
| 5 | Kasa ve gün sonu özeti | Gün kapanış kartı, gelir/gider | Kazancı ilk hangi bölgeye yatırırdın? |
| 6 | Tezgâh paneli | Gelir, gider, ↑↓ okları, ayrıntı | Hangi tezgâh en çok kazandırır sence? |
| 7 | İlk çalışan | Personel alımı, iş bölümü | İlk kimi işe alırdın? |
| 8 | Personel sırası | Her rolden biri alınmadan ikinci yok | Bu kural adil mi? |
| 9 | Balık Pazarı açılıyor | Yeni bölge kilidi | Pazarda ne satılmalı? |
| 10 | Fümehane | Füme makinesi, füme paketi (2,4× değer) | Füme balık sever misin? |
| 11 | Buz Makinesi | Bölgedeki tezgâh vitrinleri +3 büyür | Vitrine en çok hangi balığı dizerdin? |
| 12 | Balıkçı Mutfağı | 1 palamut + 1 somon filetosu → Reis Güveci | Hangi balık yemeğini eklemeliyim? |
| 13 | Özel müşteriler: adı "?????" | Kendini tanıtana kadar gizli ad | Hangi karakteri tanımak istersin? |
| 14 | Müşteri Defteri | Katalog sekmesi | Defterde kimi arıyorsun? |
| 15 | Mekanikli müşteri: Muhtar Kâzım | Veresiye alır, ertesi sabah ×1,2 öder | Veresiye verir miydin? |
| 16 | Horon Ekibi | Müzik horona döner, 15 sn sabır donar | Horon bilir misin? |
| 17 | Canlı yayın | 30 sn: her satış itibar | Yayında ne satardın? |
| 18 | Gizli müfettiş | Temiz rapor / ceza | Müfettiş gelse geçer miydin? |
| 19 | Eleştirmen Sedef Hanım | Beğenince ertesi gün kalabalık | Sence en iyi yorum nasıl kazanılır? |
| 20 | İtibar | İtibar seviyesi, bölge tavanı | İtibar mı para mı? |
| 21 | Bölge müdürleri | Aday seçimi, etkiler | Hangi müdürü seçerdin? |
| 22 | Liman Meydanı ve Hal | Meydan binaları | Meydana ne kurmalıyım? |
| 23 | Süsler ve çevre yatırımları | Yol, lamba, süs | Koyunu nasıl süslerdin? |
| 24 | Dipteki Söz — 1. gün | Hikâye ara sahnesi (spoiler yok) | Denizde bir söz verir miydin? |
| 25 | Dipteki Söz — Bereket | Bereket göstergesi | Bereket nedir sence? |
| 26 | Müzik motoru | Oyunun kendi besteleri, horon havası | Bir sonraki parça hangi tarzda olsun? |
| 27 | Ses ve deniz ambiyansı | Martı, dalga, ayrı ses kanalları | Oyun sesli mi oynanır, sessiz mi? |
| 28 | Başarımlar ve Bölüm 1 hedefi | 62 hedef sayacı | Bölüm 2'de ne olsun? |
| 29 | Görüş formu: oyunu birlikte yapıyoruz | Oyun içi görüş formu | Bana ne yazardın? |
| 30 | 30 gün sonra koy | Gün 1 ile yan yana | Bir sonraki 30 günde ne görmek istersin? |

Takvim esnek: yorumlarda gelen bir soru o günün konusu olabilir ("Dünkü yorumlarda sordunuz…").

## Kurallar

- Oyunda olmayan bir özellik, sahte oyuncu yorumu ya da "mağazada çıktı" iddiası yok. Mağazaya çıkınca ayrı bir video.
- Müzik: `store/tools/music.py` ile üretilen özgün chiptune; telif sorunu yok. Hazır şarkı kullanılacaksa platformun kendi müzik kütüphanesinden eklenmeli.
- Sosyal hesaplara yükleme elle yapılır; bu klasördeki araçlar hiçbir yere yükleme yapmaz.
