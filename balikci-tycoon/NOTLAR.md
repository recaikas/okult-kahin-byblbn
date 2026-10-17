# İnce piksel görsel çalışması — NOTLAR

Dal: `gorsel-ince-piksel` (main'e dokunulmaz; Pages main'den yayınlanır, buradan yayın yok).
Klasör (worktree): `/home/user/hamsi-gorsel`. Bağlam dolarsa buradan devam edilir.

## Hedef
Aynı dünya, aynı oranlar; ekranda 2 kat fazla sanat pikseli (karakter ~44 ince px). Kairosoft kalitesi: koyu konturlu
sprite'lar, 3 tonlu gölge (ışık sol üstten), dokulu zemin, katmanlı deniz, hava perspektifli uzak plan, sade UI.
Referanslar: `gorsel-referans/` (hamsi3.html, karşılaştırma görüntüsü, telefon görüntüsü, SOZLESME.md).

## Ekip (.claude/agents/)
- **mimar**: game.js / index.html / native.js / art/temel.js. 1. aşamada mimar rolünü orkestratör üstlendi (çizim
  çekirdeğini okumuş olduğu için; aynı bağlamı yeni bir ajana yeniden okutmak boşa olurdu).
- **arkaplan-sanatcisi** → `art/arkaplan.js` · **karakter-sanatcisi** → `art/karakter.js` · **nesne-sanatcisi** → `art/nesne.js`
- **kalite-kontrol** (kod yazmaz): `test-gorsel.js` ile PXS 2/3/4 görüntü + FPS + konsol + testler.
- Sanatçılar yalnız kendi dosyasına yazar, commit'i orkestratör atar.

## Mimari kararlar (Aşama 1)
- **Dünya birimi değişmedi.** PXS, W/H (sanat pikseli), pX/pY, kamera, joystick, UI katmanı (uiX/uiY) aynı.
  Oyunda dünyaya dokunarak seçim yok (etkileşim yakınlıkla + joystick), joystick CSS pikselinden PXS ile çevrilir →
  ince mod girdiyi etkileyemez. `test-ince.js` iki modda dünya→ekran eşlemesinin ve yürüyüşün aynı olduğunu doğrular.
- **FK**: ince modda ana tuval `W*2 × H*2`. Tüm ana tuval dönüşümleri `camT(x,y)` = `setTransform(FK,0,0,FK,x*FK,y*FK)`.
  Eski çizim kodu böylece birebir aynı görünür; ince sanat 1/FK adımla çizer.
  Neden "PXS'i yarıya indir" değil: PXS 3 gibi tek değerlerde yarım CSS pikseli olurdu ve oyunun yüzlerce yerinde
  PXS'e bağlı hesap (UI, joystick, etiket) değişirdi. Ölçek yalnız tuvalde → risk sıfıra yakın.
- **curK**: o an çizilen tuvalin ölçeği. Kahraman önizlemesi (heroCv) ve Müşteri Defteri portreleri ince modda kendi
  tuvallerini 2× açar → karakterler orada da ince. `drawScaled` (avlu ölçekli kişiler) ara tuvali curK ölçekli.
  `BT.drawOutfitOn` (test API) tuvalin `data-k` değeri yoksa klasik çizer (testler eski boyutu bekliyor).
- **Kancalar**: game.js sonunda 66 çizim fonksiyonu `hook(ad, f0)` ile sarılır. İnce tuvalde `window.HKA[ad]` varsa o
  çağrılır; `false`/hata → klasik (hata bir kez `console.warn`). `SERV_DRAW` tablosu da sarılmış fonksiyonlara bağlandı.
- **HKG** köprüsü (yalnız okuma): ctx, K, t, W, H, kamera, ufuk, PAL, WALK…, `v(ad)` (eval ile her değişken), `withCtx`,
  `plain`, `classic`, `setFine`.
- **art/temel.js** (HKA.lib): ince piksel tamponu (Buf, kontur), sprite önbelleği + blit, izometrik kutu (hamsi3'ten
  uyarlandı), EPX (Scale2x) inceltme, renk/doku/yazı yardımcıları.
- **Ayar**: Ayarlar › GÖRÜNÜM: KLASİK / İNCE. Tercih `balikci_pref.vis` (1/0). Varsayılan ince (bu dalda). Kayıt
  dosyasına (slot) dokunulmadı; eski tercih dosyasında `vis` yoksa ince açılır.
- **Yükleme**: native.js `art/temel.js, art/arkaplan.js, art/nesne.js, art/karakter.js` dosyalarını game.js'ten önce
  yükler; hepsi isteğe bağlı (yüklenmezse klasik çizim). Pages iş akışı ve mobil `build-www.js` `art/` klasörünü kopyalar.
- **Test uyarlaması**: `test-world-render.js` renk örneklemesini Klasik'te yapar (eski palet), İnce'de dünyanın dolu ve
  çeşitli olduğunu (renk sayısı) kontrol eder.
- **"zoom 2, 3, 4"** PXS 2/3/4 olarak yorumlandı (oyunun zoom düğmeleri 1/2/3; telefon 390px'te PXS 2/3,
  masaüstü 1280px'te PXS 4). `test-gorsel.js` bu üç görünümü alır.

## Ölçümler
- Klasik (önce), headless Chromium, richCove kalabalık sahnesi: 60 FPS; CPU 4× yavaşlatmada 16–18 FPS
  (tel PXS2 / PXS3 / masa PXS4: 16 / 17 / 18). Görüntüler: `screenshots/once/`.
- İnce altyapı, sanat yokken: 51–60 FPS; CPU 4×: 12–15 FPS (tuval 4 kat piksel, yazılım çizici).

## Yapılanlar
- [x] Aşama 1: altyapı, ayar, kancalar, temel.js, testler (test-ince.js, test-gorsel.js), ajan tanımları, önce görüntüleri.
- [x] Aşama 2: arka plan ve deniz (art/arkaplan.js) — gök, bulut, martı, 2 katman paralaks tepe, kasaba, cami/minare,
      katmanlı deniz, kum (256×256 önbellekli parçalar), kıyı köpüğü, yol (3 kademe), meydan ve avlu zemini, vinyet.
- [x] Aşama 3: iskele, yapılar, objeler (art/nesne.js) — bölge zemini (her seviye), istasyonlar, tezgâh/tente, hizmet
      binaları Sv1–5, meydan yapıları, parseller, çevre (servi, zeytin, kaya, ağ kurutma, sandal…), süsler, enkaz.
- [x] Aşama 4: karakterler (art/karakter.js) — drawPerson'ın tüm seçenekleri, 4 kare yürüme, nefes, iş pozu, yön başına
      ayrı sprite (ışık hep sol üstten), duygu balonu, kedi, avlu torbası; portreler (kahraman, Müşteri Defteri) ince.
- [x] Aşama 5: tekne, balık, efekt, etiketler — tekneler, eşyalar, martı, duman, etiket bütçesi (4 ad / 8 rozet).
- [x] Aşama 6: performans — her şey önbellekli sprite; kurulum kare başına bütçeli (arka plan ~9 ms).
- [x] Aşama 7: son tur — test-ince, test-binalar, test-world-render, test-specials, test-defter, test-etiket geçti;
      konsol hatası yok. Son görüntüler: screenshots/sonra/.

## Sonraki ölçüm (ince, sanat tamam)
- Headless, richCove: normal 60 FPS; CPU 4×: tel PXS2 15–18, tel PXS3 20–21, masa PXS4 17–21 (klasik 15–18).
  Darboğaz karakterler (~0.5 ms/kare) ve yazılım çizici; gerçek telefonda GPU ile daha iyi olması beklenir.

## Mimar düzeltmeleri (sonradan)
- hook() kancanın dönüş değerini geçiriyor (bina çizicileri yükseklik döndürür → etiket konumu).
- drawShopBag ayrı ve kancalı; HKG.shadow / HKG.drawStack köprüsü.
- test-binalar.js okuma koordinatları HKG.K ile ölçeklendi.

## Bilinen eksikler / açık konular
- drawFloats klasik (yalnız UI katmanına yazı kuyruklar, çizecek pikseli yok).
- Açılışın ilk birkaç saniyesinde, önbellek kurulurken bazı kareler klasik çizimle görünebilir (bütçe aşılırsa).
- Ufkun üstündeki dalga/balık gölgesi ve kasaba sıçraması ince modda düzeltildi; klasikte bilerek dokunulmadı.
- Bütün test paketi (46 dosya) bu dalda baştan sona koşturulmadı (kullanıcı test tasarrufu istedi); ilgili testler geçti.

## main'e birleştirmeden önce
1. Gerçek bir telefonda (özellikle eski Android) ince modu açıp FPS'e bak; yavaşsa Ayarlar › GÖRÜNÜM › KLASİK var.
2. İstenirse tam test paketi: `for f in test-*.js; do node $f; done` (sunucu 8099'da).
3. Yayın: Pages iş akışı ve mobil build-www `art/` klasörünü kopyalıyor; ek ayar gerekmez.
4. Birleştirme: PR aç → main. Varsayılan İNCE; istenirse game.js'te `var FINE = true` → false ile varsayılan klasik.
