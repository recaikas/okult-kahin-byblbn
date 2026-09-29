/* =====================================================================
   HAMSİ KOYU — yerel uygulama köprüsü (iOS / Android, Capacitor)
   Web'de hiçbir şey yapmaz; oyun dosyalarını sırayla yükler.
   Uygulamada:
     • Kayıtlar telefonun kalıcı depolamasına (Preferences) yansıtılır. iOS/Android WebView'in localStorage'ı
       yer darlığında silinse bile açılışta oradan geri yüklenir, sonra oyun başlar.
     • Android geri tuşu: açık paneli kapatır → duraklatma menüsü → (ana ekranda) uygulamayı arka plana alır.
     • Uygulama arka plana geçince kayıt alınır; durum çubuğu oyun sırasında gizlenir.
     • BT_NATIVE.review(): mağazanın uygulama içi değerlendirme penceresi (InAppReview eklentisi).
   ===================================================================== */
(function () {
  var FILES = ['config.js', 'specials.js', 'game.js'], PREFIX = 'balikci_', MUST = 'game.js', tries = 0;
  /* v1.9.7 — game.js zorunlu: yüklenemezse (mobil ağda kopma) önbelleği atlayarak 2 kez daha dener; yine olmazsa
     sessiz ölü ekran yerine oyuncunun dilinde hata + "Tekrar dene". config.js / specials.js isteğe bağlı (atlanır). */
  function failScreen() {
    if (document.getElementById('loadFail')) return;
    var tr = !/^en/i.test((navigator.language || 'tr'));
    var d = document.createElement('div'); d.id = 'loadFail';
    d.setAttribute('style', 'position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:#0d1b28;color:#f4e9d2;font:15px/1.5 ui-monospace,monospace;padding:24px;text-align:center');
    d.innerHTML = '<div style="max-width:320px"><div style="font-size:22px;color:#ffc94a;margin-bottom:10px">HAMSİ KOYU</div>' +
      '<div>' + (tr ? 'Oyun yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.' : 'The game could not load. Check your connection and try again.') + '</div>' +
      '<button style="margin-top:18px;padding:10px 22px;font:inherit;border:2px solid #0a1a27;background:#5fd37a;color:#0a1a27;cursor:pointer">' +
      (tr ? 'TEKRAR DENE' : 'TRY AGAIN') + '</button></div>';
    d.querySelector('button').onclick = function () { location.reload(); };
    document.body.appendChild(d);
  }
  function load(i) {
    if (i >= FILES.length) {
      if (!window.BT) { failScreen(); return; }                    /* dosya geldi ama çalışmadı (yarım indirme) */
      if (window.BT_NATIVE) window.BT_NATIVE.ready(); return;
    }
    var s = document.createElement('script');
    s.src = FILES[i] + (FILES[i] === MUST && tries ? '?r=' + Date.now() : '');
    s.onload = function () { load(i + 1); };
    s.onerror = function () {
      if (FILES[i] !== MUST) { load(i + 1); return; }
      if (s.parentNode) s.parentNode.removeChild(s);
      if (++tries <= 2) setTimeout(function () { load(i); }, 2000 * tries);
      else failScreen();
    };
    document.body.appendChild(s);
  }
  var C = window.Capacitor, isNative = !!(C && C.isNativePlatform && C.isNativePlatform());
  var P = isNative && C.Plugins ? C.Plugins : null;
  if (!isNative || !P) { window.BT_NATIVE = null; load(0); return; }

  var Pref = P.Preferences, App = P.App, Bar = P.StatusBar;
  window.BT_NATIVE = {
    platform: C.getPlatform ? C.getPlatform() : 'native',
    set: function (k, v) { if (Pref && k.indexOf(PREFIX) === 0) Pref.set({ key: k, value: String(v) }).catch(function () { }); },
    del: function (k) { if (Pref && k.indexOf(PREFIX) === 0) Pref.remove({ key: k }).catch(function () { }); },
    /* mağazanın kendi değerlendirme penceresi (@capacitor-community/in-app-review: iOS SKStoreReviewController,
       Android Play In-App Review). Pencerenin gerçekten görünüp görünmediğini mağaza belirler; sonuç bize gelmez.
       Ne zaman sorulacağına game.js karar verir (yalnız tarafsız anlar, 60 günde en çok bir kez). */
    review: function () {
      var R = P.InAppReview;
      if (!R || !R.requestReview) return Promise.resolve(false);
      try { return R.requestReview().then(function () { return true; }, function () { return false; }); } catch (e) { return Promise.resolve(false); }
    },
    ready: function () {
      if (Bar && Bar.hide) Bar.hide().catch(function () { });
      if (App && App.addListener) {
        App.addListener('backButton', function () {
          var BT = window.BT;
          if (BT && BT.back && BT.back()) return;
          if (App.minimizeApp) App.minimizeApp().catch(function () { });
        });
        App.addListener('pause', function () { if (window.BT && window.BT.saveNow) window.BT.saveNow(); });
      }
    }
  };
  /* açılış: kalıcı depodaki kayıtları (localStorage'da yoksa) geri yükle, sonra oyunu başlat */
  if (!Pref) { load(0); return; }
  Pref.keys().then(function (r) {
    var ks = (r && r.keys || []).filter(function (k) { return k.indexOf(PREFIX) === 0; });
    return Promise.all(ks.map(function (k) {                         /* tek anahtar okunamazsa diğerleri yine gelsin */
      return Pref.get({ key: k }).then(function (v) { return [k, v && v.value]; }, function () { return [k, null]; });
    }));
  }).then(function (pairs) {
    pairs.forEach(function (kv) {
      try { if (kv[1] != null && localStorage.getItem(kv[0]) == null) localStorage.setItem(kv[0], kv[1]); } catch (e) { }
    });
  }).catch(function () { }).then(function () { load(0); });
})();
