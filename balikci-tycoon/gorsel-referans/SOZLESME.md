# İnce piksel sanat sözleşmesi (bütün sanatçılar okur)

Klasör: `/home/user/hamsi-gorsel/balikci-tycoon` · dal `gorsel-ince-piksel` · referans: `gorsel-referans/hamsi3.html`
(tarayıcıda açılır, oyunun gerçek oranlarıyla 2 kat ince çizim), `gorsel-referans/hamsi-ince-karsilastirma.jpg`
(sol: oyunun şimdiki hâli, orta: önceki çizim, sağ: HEDEF), `gorsel-referans/hamsi3-telefon.png`.

## Nasıl çalışır
- Oyun dünyayı eski sanat pikseli biriminde hesaplar (izometrik karo 24×12, karakter ~22 px). İnce modda ana tuval
  **K = 2** kat çözünürlükte açılır; çizim dönüşümü hâlâ eski birimdedir. Yani `px(x,y,1,1)` = K×K ince piksel.
- `game.js` her `draw*` fonksiyonunu sarar. İnce tuvalde `window.HKA.<fonksiyonAdı>` varsa **aynı argümanlarla**
  önce o çağrılır. `false` döndürürsen ya da hata atarsan klasik çizim yapılır (hata konsola bir kez uyarı düşer).
  Bir parçayı henüz yapmadıysan `return false` de, klasik kalır.
- Oyunun içine yalnız `HKG` ile bakılır (okuma): `HKG.ctx, K, t (oyun zamanı), W, H, PXS, camOX, camOY, camX, camY,
  horizonY, day, S, player, PAL, WALK, ANIM, FISH, TW, TH, LANDX, LANDY, pX, pY, px, quad, isoQuad, isoBox, isoLine,
  shade, phase2, phase4, envStage(), classic[ad], plain(ad, ...argümanlar), withCtx(g, k, fn), v('değişkenAdı')`.
  `HKG.v` her şeyi okur (eval, yavaş): açılışta ya da önbellek anahtarı kurarken kullan, her karede yüzlerce kez değil.
- **Oyun durumuna YAZMA.** Bazı klasik çizim fonksiyonları görsel durumu da günceller (ör. `drawShoal` balık sürüsünü
  kaydırır, `drawCustomer` müşterinin `fidget` sayacını ilerletir). Böyle bir fonksiyonu tamamen değiştireceksen ya
  aynı güncellemeyi aynen yap ya da o fonksiyonu kancalama, alt parçasını (ör. `drawPerson`) kancala.
  Kancalamadan önce klasik fonksiyonun gövdesini oku (`grep -n "function drawX" game.js`).

## Araçlar: `art/temel.js` (HKA.lib, kısaca L)
- `L.sprite(key, b => {...})` → önbellekli sprite. `b` bir ince piksel tamponu (`L.Buf`): `set(x,y,c,a)`, `rect`, `hline`,
  `vline`, `circ`, `ellipse`, `outline(t)` (koyu kontur), `put(buf,dx,dy)`. Koordinatlar ince piksel, (0,0) = çapa.
- `L.blit(spr, ax, ay)` / `L.blitFlip` → sprite'ı çapası dünya-ekran konumu (ax, ay; sanat pikseli) olacak şekilde çiz.
  Çapa genelde `HKG.pX(x,y)`, `HKG.pY(x,y,z)` (klasik kod `R()` ile yuvarlar; aynısını yap ki titremesin).
- `L.isoBox(b, U0,V0,U1,V1,z0,h,{top,left,right})` → izometrik kutu (U = karo×12, z sanat pikseli; çapa U=V=z=0).
  `L.sx(U,V)`, `L.sy(U,V,z)` ince piksel dönüşümü. `L.solid`, `L.toned(c)`.
- `L.epx(key, w, h, ox, oy, drawFn)` → klasik bir çizimi 1x ara tuvale çizip Scale2x ile inceltir + kontur ekler.
  Yalnız elle çizmenin karşılığını vermediği çok küçük/nadir nesnelerde, son çare. Önbellek anahtarı şart.
- Renk: `L.mix, L.dark, L.lite, L.tone(c)` ({l,m,d,o}), `L.hash(a,b)`, `L.bayer`, `L.gradCol`. Yazı: `L.text(b,str,x,y,c)` (3×5).
- `L.fr(ax, ay, fx, fy, fw, fh, c)` → doğrudan ince dikdörtgen (önbelleksiz, küçük canlı parçalar için).
- `HKA.onReset(fn)` → mod değişince kendi önbelleklerini temizle.

## Görsel dil (hedef: Kairosoft kalitesi)
- Koyu, renkli kontur (siyah değil: rengin %55–65 koyusu, `b.outline(0.6)`). 3 ton gölge, ışık **sol üstten**:
  üst/sol yüz açık, sağ yüz koyu. Dokulu zeminler (tahta damarı, kum dalgası, taş derzi), bayer geçişli gökyüzü,
  katmanlı deniz, hava perspektifli (soluk, mavimsi) uzak plan. Yazılar sade ve okunaklı.
- Oranlar oyunun aynısı; ince modda 2 kat sanat pikseli. Karakter ~44 ince piksel boy.

## Performans (düşük güçlü telefon)
- Her karede tampon kurma YOK. Görünüşü belirleyen her şeyi anahtara koy, sprite'ı bir kez kur, sonra `L.blit`.
- Hareketli parçaları (dalga parıltısı, bayrak, alev) az sayıda kareye böl (ör. 4 kare) ve kareyi anahtara koy.
- Büyük statik katmanları (gökyüzü, kasaba, kum, iskele zemini) tek büyük sprite'a önbellekle.
- Karede çağrılan fonksiyon başına hedef < 0.05 ms. `node test-gorsel.js` FPS ölçer (cpu4x).

## Kurallar
- Yalnız kendi dosyana yaz. `game.js`, `index.html`, `art/temel.js` mimarındır: bir köprü alanı / kanca gerekiyorsa
  orkestratöre (son raporunda) yaz; geçici olarak `HKG.v(...)` ile oku.
- **Commit atma, dal değiştirme, push etme.** Orkestratör commit atar.
- Test: sunucu 8099'da açık (`curl -s localhost:8099/index.html` ile bak; kapalıysa `npx http-server -p 8099 -c-1 .`
  ile arka planda aç). Hızlı bakış için `SHOTS=liman,iskele SECS=6 node test-gorsel.js /tmp/.../<senin-klasörün> ince`
  (tam liste: liman, iskele, meydan, aksam, sabah). Görüntüleri Read ile aç, referansla karşılaştır.
  Konsol hatası olmamalı; `node test-ince.js` ve `node test-world-render.js` geçmeli.
- Ekran görüntülerini depoya değil scratchpad'e kaydet (orkestratör son görüntüleri `screenshots/`a alır).
