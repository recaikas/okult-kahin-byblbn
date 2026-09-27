# Hamsi Koyu — Üçüncü Taraf Bileşenler / Third-Party Notices

Hamsi Koyu'nun kendi kodu, grafikleri, müziği, sesleri, metinleri ve karakterleri `LICENSE` dosyasındaki lisansa
tabidir. Aşağıdaki bileşenler başkalarına aittir ve **kendi lisanslarıyla** oyuna/uygulamaya dahil edilmiştir.
Bu dosya, bu lisansların istediği telif ve lisans bildirimlerini tek yerde toplar.

*Hamsi Koyu's own code, graphics, music, sound effects, texts and characters are covered by `LICENSE`. The components
below belong to third parties and are included under their own licenses. This file collects the copyright and license
notices those licenses require.*

> Son kontrol / last checked: 2026-09-26 — `mobile/node_modules`, `mobile/package-lock.json`,
> `mobile/android/**/build.gradle`, `mobile/ios/App/CapApp-SPM/Package.swift`, `fonts/OFL.txt` üzerinden doğrulandı.
> Bağımlılık eklediğinde ya da sürüm yükselttiğinde bu listeyi güncelle.

---

## 1. Web + uygulama (oyunun kendisiyle dağıtılır / shipped with the game)

| Bileşen / Component | Sürüm | Lisans | Telif / Copyright | Nerede |
|---|---|---|---|---|
| **Pixelify Sans** (yazı tipi / font) | 2021 sürümü, woff2 alt kümeleri | **SIL Open Font License 1.1** | Copyright 2021 The Pixelify Sans Project Authors (https://github.com/eifetx/Pixelify-Sans) | `fonts/pixelify-*.woff2`, tam metin `fonts/OFL.txt` |

OFL notu: yazı tipi oyunla birlikte ücretsiz ya da ücretli dağıtılabilir; **tek başına satılamaz**, lisans metni
(`fonts/OFL.txt`) yazı tipiyle birlikte dağıtılmalıdır. Yazı tipinin değiştirilmiş hâli başka bir adla ve yine OFL ile
yayımlanmalıdır (biz yalnızca Google Fonts'un standart alt kümelerini kullanıyoruz, değiştirmedik).

*OFL note: the font may be bundled with software, but not sold on its own; the license text must travel with the font.*

## 2. Yalnız mobil uygulama (iOS + Android kabuğu / native shell)

| Bileşen / Component | Sürüm (lock) | Lisans | Telif / Copyright |
|---|---|---|---|
| @capacitor/core | 8.5.2 | MIT | Copyright (c) 2017-present Drifty Co. |
| @capacitor/android | 8.5.2 | MIT | Copyright (c) 2017-present Drifty Co. |
| @capacitor/ios (+ `capacitor-swift-pm` 8.5.2 ikili paketleri) | 8.5.2 | MIT | Copyright (c) 2017-present Drifty Co. |
| @capacitor/app | 8.1.1 | MIT | Copyright 2020-present Ionic |
| @capacitor/preferences | 8.0.1 | MIT | Copyright 2020-present Ionic |
| @capacitor/status-bar | 8.0.3 | MIT | Copyright 2020-present Ionic |
| @capacitor-community/in-app-review | 8.0.0 | MIT (`node_modules` içindeki LICENSE.md ile doğrulandı) | Copyright (c) 2022 Daniel Suchý |
| Apache Cordova Android framework (`org.apache.cordova:framework`) | 14.0.1 | Apache License 2.0 | Copyright The Apache Software Foundation |
| CapacitorCordova (iOS; Apache Cordova'dan türetilmiş kod) | 8.5.2 ile gelir | Apache License 2.0 | Copyright The Apache Software Foundation |
| AndroidX: appcompat 1.7.1, core 1.17.0, activity 1.11.0, fragment 1.8.9, coordinatorlayout 1.3.0, webkit 1.14.0, core-splashscreen 1.2.0 | `variables.gradle` | Apache License 2.0 | Copyright The Android Open Source Project |
| Google Play In-App Review kitaplığı (`com.google.android.play:review`) — in-app-review eklentisinin Android `build.gradle`'ı tarafından çekilir (doğrulandı) | eklentiyle gelir | Google Play Core SDK Hizmet Şartları (açık kaynak değil, ücretsiz) | Google LLC |

Apple'ın StoreKit (`SKStoreReviewController`) ve Android sistem WebView'i işletim sisteminin parçasıdır; ayrıca bildirim
gerekmez.

**Apache Cordova NOTICE** (Apache 2.0 madde 4(d) gereği korunur / retained as required):

```
Apache Cordova
Copyright 2012 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (http://www.apache.org/).
```

> Not: Yukarıdaki NOTICE metni cordova-android paketinin standart NOTICE dosyasıdır; yayından önce
> `~/.gradle/caches` içindeki `framework-14.0.1` arşivinden ya da https://github.com/apache/cordova-android
> deposundan birebir karşılaştır.

## 3. Dağıtılmayan geliştirme araçları / build-only tools (bildirim gerekmez)

`@capacitor/cli` (MIT), Gradle, Android Gradle Plugin, Xcode, Node.js, Playwright (simge üretimi için,
`mobile/scripts/render-icons.js`) ve bunların alt bağımlılıkları yalnızca derleme sırasında kullanılır, uygulamaya
girmez.

## 4. Hizmetler (kod değil) / Services (not code)

- **Supabase** — isteğe bağlı çevrimiçi skor tablosu ve görüş formu için barındırılan veritabanı (yalnız `config.js`
  doldurulduğunda kullanılır). Kişisel veri işleme için `privacy.html`'e bakın.
- **GitHub Pages** — web sürümünün barındırılması.

## 5. Üçüncü taraf OLMAYANLAR / NOT third-party (kayıt için)

- **Müzik ve ses efektleri:** dosya yok; `game.js` içinde Web Audio ile (osilatör + nota dizileri) üretilen özgün beste.
- **Grafikler:** oyun dünyası ve karakterler kodla çizilen özgün pixel art; uygulama simgesi ve açılış ekranı
  `mobile/assets-src/iconart.html`'den üretildi.
- **Karakterler:** `specials.js` içindeki müşteriler özgündür. Halk fıkrası kahramanları (Temel, Nasreddin Hoca) ve
  koruma süresi dolmuş klasik kurgudan esinlenen "Şerlok" kamu malıdır (public domain).

---

## MIT License (Capacitor ve eklentileri için ortak metin / shared text)

```
Copyright (c) 2017-present Drifty Co.
Copyright 2020-present Ionic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Apache License 2.0 (Apache Cordova, AndroidX)

Tam metin / full text: https://www.apache.org/licenses/LICENSE-2.0
(Uygulama içi "Lisanslar" ekranında bu bağlantı ya da metnin kendisi gösterilmelidir.)

## SIL Open Font License 1.1 (Pixelify Sans)

Tam metin / full text: `fonts/OFL.txt` — https://openfontlicense.org
