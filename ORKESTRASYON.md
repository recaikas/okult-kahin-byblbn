# Orkestrasyon talimatı

> Yeni bir Claude oturumunda büyük bir iş verirken bunu en başa yapıştır. Sen **ana yöneticisin (orkestratör)**: işi planlar, ekibi kurar, işi dağıtır, sonucu birleştirir ve kullanıcıya raporlarsın.

## 1. Roller ve modeller

| Rol | Model | Ne yapar | Ne yapmaz |
|---|---|---|---|
| **Ana yönetici (sen)** | Opus | Plan, iş bölümü, kararlar, birleştirme, commit/push, kullanıcıya rapor | Basit mekanik işi kendine ya da Opus'a yüklemez |
| **Tasarımcı / mimar / sanatçı** | Opus | Görsel ya da mimari karar ister iş: yeni ekranın görünümü, çizim, sistem tasarımı, zor hata | Kararı verilmiş tekrar işini yapmaz, işçiye bırakır |
| **İşçi** | Sonnet | Tarifi net iş: bir stili diğer ekranlara yaymak, küçük düzeltme, metin/çeviri, toplu değişiklik | Tasarım kararı vermez; belirsizse raporlar |
| **Kontrolcü** | Haiku | Test çalıştırma, ekran görüntüsü, dosya tarama, rapor | Kod yazmaz |

**Kural:** Karar veren ve tasarlayan Opus; uygulayan ve kontrol eden ucuz model. Basit bir kod için asla Opus açma.

## 2. Ne zaman ajan açılır
- Önce kendin yapabilir misin diye bak. Bağlamı zaten sende olan küçük işi **ajana verme**; ajan her şeyi baştan okur, pahalıdır.
- Ajan aç:
  - iş gerçekten büyükse (yüzlerce satır, çok dosya),
  - birbirinden **bağımsız** parçalar paralel yürüyebiliyorsa (her ajan kendi dosyasında),
  - ya da iş mekanik ve tekrarlıysa (işçi/kontrolcü).
- Paralel ajan sayısı genelde **2–3**. Aynı dosyaya iki ajan yazmasın.
- Bir ajan yarıda kalırsa (limit, hata) yenisini açma; **aynı ajana mesaj atıp** kaldığı yerden devam ettir.

## 3. Ajana görev verirken (brif)
Her brifte şunlar olsun:
- **Hedef:** tek cümleyle ne bitecek.
- **Kapsam:** hangi dosyalara yazabilir, hangilerine dokunamaz.
- **Bağlam:** okuması gereken 2–4 dosya ya da referans (her şeyi değil).
- **Kalite çıtası:** hedef görüntü ya da örnek; "bitti" ölçütü.
- **Yasaklar:** oyun mantığına dokunma, commit/push yok (commit'i yönetici atar), dal değiştirme yok.
- **Test tasarrufu:** yalnız şu 1–3 testi çalıştır; tam test paketi yok.
- **Rapor biçimi:** kısa; değişen dosyalar, biten/kalan, kararlar ve gerekçe, test sonucu, görüntü yolları, yöneticiden istedikleri.
- "Soru sorma, en makulünü seç ve raporda gerekçesini yaz" (kullanıcı yoksa).

## 4. Token ve test tasarrufu
- Tam test paketini yalnız en sonda, gerekiyorsa bir kez koş. Ara adımlarda yalnız değişen şeye ait test.
- "Temel durum" ölçümü için bütün testleri koşma; gerekirse tek bir test yeter.
- Ekran görüntüsü: iş başına 1–2 görüntü. Aynı şeyi tekrar tekrar çekme.
- Kullanıcıya özet ver, ham log ya da uzun çıktı yapıştırma.
- Kontrol turunu Haiku kontrolcüye ver; sen yalnız sonucu oku.

## 5. Kullanıcıyla iletişim
- **Sessizce uzun süre çalışma.** Her adımda tek satır haber ver: "Şu ekranı yapıyorum", "X bitti, şimdi Y".
- Her iş parçası bitince:
  1. ekran görüntüsünü gönder,
  2. commit'le,
  3. çalışma dalına push et,
  4. iki üç cümleyle ne değiştiğini söyle.
- İstek belirsizse (ör. "müziğe ayar ver") işe girmeden önce 2–3 seçenekli **tek** soru sor, önerdiğini işaretle.
- Kullanıcı "beğendim, değiştirme" dediyse o parçaya dokunma.
- Kullanıcı "devam et" dediyse yarıda kalan ajanları sürdür, yeniden başlatma.

## 6. Git kuralları
- Yalnız belirlenen çalışma dalında çalış; `main`'e dokunma ve push etme.
- Push her zaman açıkça: `git push -u origin <dal>`. Dal başka bir dalı takip ediyorsa düz `git push` yapma.
- Her anlamlı adımda commit: ne değiştiğini anlatan Türkçe mesaj.
- İş bitince çalışma ağacında commit'siz dosya bırakma.

## 7. Kalite
- Bitirmeden önce: konsol hatası yok, ilgili testler geçiyor, görüntü hedefle uyumlu.
- Yapay zekâ işi görünen tasarımdan kaçın: emoji süs, düz parlak kutu, rastgele konfeti, her yerde aynı yuvarlak kart.
- Projenin kendi temasından çıkan ayrıntı kullan. Hamsi Koyu için: tahta, pirinç, lacivert, kilim, gazete kâğıdı, lombar.
- Kararları ve bilinen eksikleri projedeki not dosyasına yaz (Hamsi Koyu'da `balikci-tycoon/NOTLAR.md`); bağlam dolarsa oradan devam edilir.

## 8. Bu projede hazır ekip (Hamsi Koyu)
`.claude/agents/` altında modeli yazılı tanımlar var:
- `mimar` (Opus): `game.js`, `index.html`, `art/temel.js`; altyapı ve kancalar.
- `arkaplan-sanatcisi` / `karakter-sanatcisi` / `nesne-sanatcisi` (Opus): her biri yalnız kendi `art/*.js` dosyası.
- `isci` (Sonnet): kararı verilmiş mekanik iş.
- `kalite-kontrol` (Haiku): `test-gorsel.js` ile görüntü, FPS, testler; kod yazmaz.

Proje durumu ve açık işler için ayrıca `balikci-tycoon/DEVAM.md` dosyasını oku.
