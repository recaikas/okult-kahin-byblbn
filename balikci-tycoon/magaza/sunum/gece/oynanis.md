# Gece — oynanış ve döngü görüşü

Bakış açısı: core loop, mini oyunlar, tempo. Gündüz bir **yönetim** oyunu (çok şey aynı anda akar). Gece bunun tersi olmalı: **tek iş, tek parmak, kısa ve elle**.

## Üç yön

### A. Işıkçı Gecesi (denizin üstü, avcılık)
Karadeniz'de hamsi gerçekten gece, lamba ışığıyla avlanır. Gündüz satılan balık gece tutulur.
- **30 sn:** Kayıkla karanlık suda lambayı sürüye doğru tut, balık ışığa toplanır; zamanı gelince ağı çevir.
- **5 dk (bir gece):** Önce iki av noktasından birini seç (yunus ya da söylenti ipucu verir). Sonra 2-3 "çekiş" yap ve kasaları doldurup koya dön.
- **Günler boyunca:** Lamba seviyesi artar (karbür → lüks lambası → jeneratör), ağ boyu uzar, haritada yeni noktalar açılır, nadir türler (lüfer, kalkan) çıkar ve yunus güveni büyür.

### B. Kahvehane (kasaba, sosyal ve sakin)
- **30 sn:** Bir masaya otur, sohbet mini oyunuyla söylenti dinle ya da tavla/okey hamlesi yap.
- **5 dk:** 2-3 masa gez. Söylentileri topla, usta bir personelle tanış, Haşmet Bey hakkında bilgi al.
- **Günler boyunca:** Kahvehane güveni artar, söylentiler daha doğru çıkar (FIKIRLER #9), gazetede yer alırsın.

### C. Fener Nöbeti (Alp Er Tunga ile gerilim)
- **30 sn:** Fırtınada fener ışığını döndür ve kayalığa sürüklenen tekneyi kurtar.
- **5 dk:** Dalgalar halinde gelen teknelere kaçakçı ve sis de eklenir; sabaha kadar dayan.
- **Günler boyunca:** Fener güçlenir ve kurtarılan kaptanlar müşteri olarak gelir.

## Seçimim: A, Işıkçı Gecesi
- **Döngüyü kapatıyor:** Gündüz balığı *işleyip satıyoruz*, gece onu *tutuyoruz*. Yeni bir ekonomi gerekmiyor, gece mevcut zincirin başını besliyor. B ise bilgi üretir, oyunda bu bilginin harcanacağı bir sistem henüz yok. C ise gündüzle zayıf bağlı bir savunma oyunu olur.
- **Tempo karşıtlığı:** Gündüz kalabalık ve gürültülü. Gece kayık, lamba, karanlık ve dalga sesinden ibaret. Bu, gündüzden sonra nefes aldırır.
- **Tek elle oynanır:** Başparmakla lambayı sürükle, bırakınca ağ atılır. Ekran dikey, kayık altta, deniz üstte.
- **Yeniden kullanım çok yüksek:**
  - `story.js` sahne motoru (192×120, sonuç nesnesi, atla düğmesi)
  - **fener** mini oyunu: lamba ile sürüyü toplamak
  - **ritim** mini oyunu: ağı çekmek
  - **denge** mini oyunu: dalgada dolu kayığı taşımak
  - gece paleti ve sokak lambaları, kıyıda bekleyen **yunus** (rehber), dönüşte iskelede yayıyla bekleyen **Alp Er Tunga**
  - gazete: "Dün gece 40 kasa hamsi" manşeti
- B ile C sonra A'nın içine girebilir: kahvehane, geceden önce durulan bir ipucu ekranı olur, fırtına da bazı gecelere olay olarak eklenir.

## Gündüzle bağ
- **Gece → gündüz:** Sabah hasırda hazır balık kasaları olur (ağlardan toplanmadan, kesime hazır). Nadir türler tezgâhta pahalı satılır. Bazen de "gece hikâyesi" bayrağı kalkar (yunus, Şahmeran izleri).
- **Gündüz → gece:** Gündüz kazanılan parayla lamba ve ağ alınır. Ağ ve kesim kapasiten geceden ne kadar balık getirebileceğini sınırlar, böylece fazla av çürür. Hikâye günü 10 ("Fener Gecesi") gece seferine doğal bir giriş olur.
- **İsteğe bağlı:** Gün sonu kartına iki düğme gelir: **DENİZE ÇIK** ya da **UYU**. Uyuyan oyuncu hiçbir şey kaybetmez. Gece bir bonustur, ceza değildir.
- **Süre:** Bir gece 2-3 dakika sürer, en çok 3 çekiş. Gündüzün yaklaşık 1/4'ü kadar.
- **Ödül tavanı:** Gece, ertesi günün gelirini en çok %15-20 artırır (sayılar ekonomi meslektaşında). Gece zorunlu hissettirmemeli.

## Riskler ve önlemler
| Risk | Önlem |
|---|---|
| **Oyun ikiye bölünür** (iki ayrı oyun hissi) | Gecenin ayrı parası ve ayrı binası olmaz. Her ödül sabah limanda görünür bir şeye dönüşür (hasırdaki kasa). |
| **Yorgunluk** (her gün zorunlu iş) | UYU düğmesi hep var. 3 gece üst üste çıkana "yorgunluk" yerine "dinlendin: sabah müşteri sabrı +" verilir. Haşmet'li günün gecesi sefer olmaz, hafta ritmi korunur. |
| **Tekrar sıkar** (aynı mini oyun) | Her gece bir değişken gelir: ay evresi (dolunayda lamba zayıf), sis, yunus ipucu, rastgele nokta. Mini oyunlar sırayla ve karışık gelir. |
| **Kapsam büyür** (açık dünya deniz) | Serbest dolaşım olmaz. Sahne motoru üstünde **sabit 3 ekran** olur: rota seçimi, av, dönüş. Harita yalnız nokta listesidir. |
| **Hikâyeyle çakışma** | Hikâye günü olan gece sefer yerine hikâye oynanır ya da gece hikâyeye köprü olur. Aynı gece ikisi birden olmaz. |
| **Dokunma hatası** (karanlıkta küçük hedef) | Lamba ışığı geniş bir halka olur. Dokunma alanı en az 48 px, titreşim geri bildirimi verilir. |

## İlk sürüm (2-3 hafta)
**"Işıkçı Gecesi v0":**
1. Gün sonu kartına **DENİZE ÇIK / UYU** düğmeleri.
2. `story.js` üstünde tek sahne: karanlık deniz, kayık, lamba.
3. Üç aşama:
   - **Nokta seç** (2 seçenek, biri yunus ipuçlu)
   - **Fener**: lambayla sürüyü topla
   - **Ritim**: ağı çek, 1-3 çekiş
4. Sonuç kartı: "+N kasa hamsi" ve %10 ihtimalle bir nadir tür. Sabah ağ başında hazır kasalar.
5. Tek yükseltme: **lamba** (3 seviye, BİNA sekmesinde). Kayda tek alan eklenir: `gece {lamba, sonGece}`.
6. Gece müziği: mevcut kürdi motifinin sade, ney ve dalga sesli hâli.
7. Test: `test-gece.js` (düğme, sahne, kasa sabaha geçiyor, UYU cezasız) ve `story-bot.js` ile kazanılabilirlik.

**Şimdilik yok:** harita, nadir tür listesi, kahvehane, fırtına, ay evresi. İlk sürümün ölçüsü şu: oyuncuların kaçta kaçı ikinci gece de denize çıkıyor? Bu oran %40'ı geçerse genişletilir.
