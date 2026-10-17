# Hamsi Koyu — görsel çalışma: devam talimatı

> Bu dosyayı yeni bir Claude oturumuna yapıştır. Kaldığımız yerden devam etmesi için gereken her şey burada.

## Proje
- Oyun: **Hamsi Koyu** (`balikci-tycoon/`), izometrik piksel sanatı balıkçı limanı oyunu (tarayıcı + iOS/Android, Capacitor).
- Depo: `recaikas/okult-kahin-byblbn`
- Çalışma dalı: **`gorsel-ince-piksel`**
  - Push yalnız bu dala: `git push -u origin gorsel-ince-piksel`. Dal eskiden `origin/main`'i takip ediyordu, düz `git push` yapma.
  - **main'e dokunma, push etme.** GitHub Pages main'den yayınlanıyor.
- Deneme bağlantısı (dalın canlı hâli; açılışta "Open the page"e basılır, ilk yükleme 15–20 sn sürer):
  https://raw.githack.com/recaikas/okult-kahin-byblbn/gorsel-ince-piksel/balikci-tycoon/index.html
  - Veri izni kartında **ÇEVRİMDIŞI OYNA** seçilmeli; bu sürüm gerçek skor tablosuna bağlı.
- Ayrıntılı kararlar ve ölçümler: `balikci-tycoon/NOTLAR.md`. Sanat kuralları: `balikci-tycoon/gorsel-referans/SOZLESME.md`.

## Ne yapıldı (hepsi dalda, commit'li)
1. **İnce piksel altyapısı:**
   - Dünya birimi, PXS, kamera, joystick ve dokunma aynı kaldı; ince modda yalnız ana tuval 2 kat çözünürlükte (`FK`, `camT`, `curK`).
   - `game.js` sonundaki `hook()` 66 çizim fonksiyonunu sarar: `window.HKA[ad]` varsa ince çizim, yoksa ya da hata atarsa klasik çizim.
   - `window.HKG` sanatçıların oyunu okuma köprüsü.
   - Ayarlar › **GÖRÜNÜM: KLASİK / İNCE** (tercih `vis`, varsayılan İNCE).
2. **İnce sanat dosyaları** (`art/`):
   - `temel.js` (ortak araçlar)
   - `arkaplan.js` (gök, deniz, kasaba, kum, yol, meydan)
   - `nesne.js` (iskele, tezgâhlar, binalar Sv1–5, çevre, süs, tekne, efektler)
   - `karakter.js` (bütün karakterler, kedi, duygu balonu)
   - `gazete.js` (intro ve Bölüm 1 sonu gazete resimleri)
3. **Hikâye** (`story.js`, "Dipteki Söz"): 8 sahne, bütün karakterler ve mini oyun görünüşleri 2 kat ince.
4. **Menüler** (ince modda, `body.ince`): 2px kenar, 1px ışık/gölge, basamaklı 3 tonlu düğmeler, ince kilim şeridi, piksel kaydırıcılar.
5. **Liman arayüz dili** (iki modda da):
   - Seviye atlama: iplerle sarkan tahta tabela.
   - Başarım bildirimi ve listesi: pirinç lombar çerçeve.
   - Bildirimler: krem not kâğıdı.
   - İpucu kutusu, rozetler, listeler, sekmeler: yumuşak köşe ve iki katmanlı gölge.
6. **Müzik:**
   - Menüde parça seviyeleri eşitlendi (fark 4,8 dB → 1,9 dB).
   - Parça geçişleri yumuşak; hikâye ara sahnesinde müzik ≈1 sn'de kısılıyor.
7. **Etiketler** (ince modda): en yakın 4 ad ve 8 rozet, sade levha.
8. **Yayın:** Pages iş akışı ve mobil `build-www.js` `art/` klasörünü de kopyalıyor.

## Açık işler / bilinen eksikler
- Gün sonu özeti ve yardım penceresi yeni stili ortak sınıflardan alıyor, ama ekranda görüntüleyip doğrulanmadı.
- Onay kutusundaki "SİL" düğmesi sıradan düğme gibi görünüyor; kırmızımsı yapılabilir (kullanıcıya önerildi).
- Açılışın ilk birkaç saniyesinde, önbellek kurulurken bazı parçalar kısa süre klasik çizimle görünebilir.
- Hikâyede sahne ortasında arka plan değişince yavaş telefonda bir kez kısa takılma olabilir.
- 46 testin tamamı bu dalda baştan koşulmadı; yalnız ilgili testler koşuldu ve geçti.
- **main'e birleştirmeden önce:** gerçek telefonda (eski Android) ince modu dene, sonra PR aç.

## Ekip ve model kuralı (kullanıcının açık isteği)
- **Opus:** ana yönetici (sen), `mimar`, sanatçılar (`arkaplan-sanatcisi`, `karakter-sanatcisi`, `nesne-sanatcisi`). Bunlar karar veren ve tasarlayan roller.
- **Sonnet:** `isci`. Kararı verilmiş mekanik kodu uygular (bir stili diğer ekranlara yaymak, küçük düzeltme).
- **Haiku:** `kalite-kontrol`. Test, ekran görüntüsü, rapor; kod yazmaz.
- Tanımlar: `.claude/agents/*.md`. Yeni ajan açarken modeli işin zorluğuna göre seç; basit iş için Opus kullanma.

## Çalışma şekli (kullanıcının açık istekleri)
- **Token tasarrufu:** Paralel ajan yalnız gerçekten ayrı ve büyük işler için. Tam test paketi koşma; yalnız değişen şeye ait 1–4 testi çalıştır.
- **Kullanıcıyı haberdar et:** Kısa ara mesajlarla "şu sahneyi / şu ekranı yapıyorum, bitti" de; sessizce saatlerce çalışma.
- **Görsel kanıt:** Her iş bitince ekran görüntüsünü gönder (`SendUserFile`), commit'le, dala push et.
- **Beğenileni bozma:** Kullanıcının beğendiği çizimleri değiştirme.
- **Görsel dil:** Kairosoft kalitesi; koyu renkli kontur, 3 ton gölge (ışık sol üstten), dokulu zemin, yumuşak ve derin arayüz.
- **Tema:** Karadeniz limanı; tahta, pirinç, lacivert, kilim, kâğıt. Jenerik ya da yapay zekâ işi görünen tasarımdan (emoji süs, düz sarı kutu, rastgele konfeti) kaçın.
- **Oyun mantığına dokunma:** para, görevler, kayıt biçimi, Supabase skor tablosu, KVKK onayı, denge. Eski kayıtlar sorunsuz yüklenmeli.

## Sık kullanılanlar
```bash
cd balikci-tycoon && npx http-server -p 8099 -c-1 .     # test sunucusu (testler 8099 bekler)
node test-ince.js                                        # ince altyapı (mod geçişi, eşleme, yürüyüş)
SHOTS=liman,meydan SECS=6 node test-gorsel.js <klasör> ince   # PXS 2/3/4 ekran görüntüsü + FPS
node test-world-render.js | test-binalar.js | test-specials.js | test-defter.js | test-basarim.js | test-faz1.js
node test-story.js && node test-story-game.js            # hikâye
node test-v21.js && node test-v23.js                     # müzik / ses
```
- Önce/sonra görüntüleri: `balikci-tycoon/screenshots/once/`, `screenshots/sonra/`
- Referans: `balikci-tycoon/gorsel-referans/` (hamsi3.html, karşılaştırma görüntüsü)
