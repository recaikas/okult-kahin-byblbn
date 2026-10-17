/* =====================================================================
   HAMSİ KOYU — DİPTEKİ SÖZ (hikâye sahneleri)
   ---------------------------------------------------------------------
   Üç katman (hangisinin nereden geldiği açık):
   1) Halk anlatısı: Şahmeran — yarı kadın yarı yılan, yılanların şahı; Cemşab'a sığınır, yerini söylemeyeceğine
      söz alır; hasta bir vezir onu ele geçirmek ister. Oyuncu Cemşab'ın yerindedir.
   2) İskit katmanı: Herodotos, Tarihler 4.9 — Karadeniz'in kuzeyindeki İskitlerin atası yarı kadın yarı yılan bir ana;
      yayı gerip kemeri kuşanabilen en küçük oğul Skythes ülkeyi yönetir.
   3) Bizim kurgumuz: Şahmeran'ın bu yılan ana olması ve Alp Er Tunga'nın (Kaşgarlı Mahmud'un kaydettiği bozkır
      hükümdarı; Şehname'de Efrasiyab) onun himayesinde yay geren oğul olarak nöbet tutması bizim yorumumuzdur.
   Ağıt sözleri özgündür (Alp Er Tunga Sagusu'ndan alıntı yoktur).

   Bu dosya hem oyunda (game.js) hem de story.html test sayfasında aynen çalışır.
   Sahne = satır listesi: { w: konuşan, t: { tr, en }, cam: [x, y, yakınlık], ex, p, fx, bg, show, hide }
   ===================================================================== */
(function () {
  'use strict';
  var W = 192, H = 120, BY = 116;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOST = null, LANG = 'tr', ROOT = null, running = false;
  function tx(o) { return !o ? '' : typeof o === 'string' ? o : (o[LANG] || o.tr || ''); }
  function L(w, tr, en, o) { var s = o || {}; s.w = w; s.t = { tr: tr, en: en }; return s; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------- DOM + stil ---------------- */
  var CSS = '' +
    '.hkst{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:#07040ee6;font-family:"Pixelify Sans",ui-monospace,monospace;color:#f6e9d3;padding:10px}' +
    '.hkst *{box-sizing:border-box}.hkst .app{width:100%;max-width:540px;display:flex;flex-direction:column;gap:10px}' +
    '.hkst .stage{position:relative;border:3px solid #4b3272;box-shadow:0 0 0 3px #000;background:#000;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation;cursor:pointer}' +
    '.hkst canvas{display:block;width:100%;height:auto;aspect-ratio:8/5;image-rendering:pixelated}' +
    '.hkst .stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 60%,#000a 100%)}' +
    '.hkst .hud{position:absolute;left:6px;top:6px;z-index:3;background:#000b;border:2px solid #e4b94a;padding:2px 6px;display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.12em;color:#e4b94a;font-weight:700}' +
    '.hkst .segs{display:flex;gap:2px}.hkst .segs i{width:5px;height:9px;background:#3a2f14;display:block}.hkst .segs i.on{background:#e4b94a}.hkst .segs i.new{animation:hkfl .5s steps(2) 4}' +
    '@keyframes hkfl{50%{background:#fff}}' +
    '.hkst .skip{position:absolute;right:6px;top:6px;z-index:3;background:#000a;border:2px solid #fff4;color:#fffc;font:inherit;font-size:10px;letter-spacing:.1em;padding:2px 7px;cursor:pointer}' +
    '.hkst .ov{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:12px;background:linear-gradient(#0c0718d8,#0c0718f2);transition:opacity .7s}' +
    '.hkst .ov.off{opacity:0;pointer-events:none}.hkst .ov small{font-size:10px;letter-spacing:.3em;color:#a898c4}' +
    '.hkst .ov h2{margin:0;font-size:clamp(24px,8vw,42px);line-height:1;letter-spacing:.05em;color:#ffb454;text-shadow:3px 3px 0 #000,5px 5px 0 #7a2a2a}' +
    '.hkst .panel{background:#1d1330;border:3px solid #4b3272;box-shadow:0 0 0 3px #000;padding:10px 12px 12px;min-height:170px;position:relative}' +
    '.hkst .who{display:inline-block;font-weight:700;letter-spacing:.1em;font-size:11px;padding:2px 8px;margin-bottom:6px}' +
    '.hkst .txt{font-size:17px;line-height:1.42;min-height:4.2em;padding-right:16px}.hkst .nx{position:absolute;right:10px;bottom:6px;color:#ffb454;animation:hkbl 1s steps(2) infinite}' +
    '@keyframes hkbl{50%{opacity:0}}' +
    '.hkst .mh{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 10px;margin-bottom:8px;align-items:baseline}.hkst .mh b{font-size:15px;letter-spacing:.12em;color:#ffb454}.hkst .mh span{font-size:12px;color:#a898c4;line-height:1.35}' +
    '.hkst .btns{display:flex;flex-wrap:wrap;gap:8px}.hkst .btns button,.hkst .opt{flex:1 1 140px;background:#2a1b44;border:3px solid #4b3272;color:#f6e9d3;padding:9px 10px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-align:left}' +
    '.hkst .btns button:hover,.hkst .opt:hover{border-color:#ffb454}.hkst .btns button.pri{background:#ffb454;color:#2a1205;border-color:#ffb454;text-align:center}' +
    '.hkst .opt{display:block;width:100%;margin-bottom:6px}.hkst .opt:disabled{opacity:.35;cursor:default}' +
    '.hkst .meter{height:14px;background:#0d0818;border:2px solid #4b3272;position:relative;margin:6px 0}.hkst .meter i{position:absolute;top:0;bottom:0;display:block}' +
    '.hkst .big{font-size:22px;padding:14px;text-align:center;width:100%;background:#ffb454;color:#2a1205;border:0;box-shadow:0 4px 0 #a9691b;font:inherit;font-weight:700;letter-spacing:.08em;cursor:pointer;margin-top:6px}' +
    '.hkst .big:active{transform:translateY(3px);box-shadow:0 1px 0 #a9691b}' +
    '.hkst .slots{display:flex;gap:6px;margin-bottom:8px}.hkst .slots i{flex:1;height:34px;border:3px dashed #4b3272;display:grid;place-items:center;font-style:normal;font-size:13px;font-weight:700;color:#a898c4}.hkst .slots i.f{border-style:solid;border-color:#ffb454;color:#f6e9d3;background:#2a1b44}' +
    '.hkst .items{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:6px;margin-bottom:8px}.hkst .it{display:flex;align-items:center;gap:8px;background:#2a1b44;border:3px solid #4b3272;padding:7px 9px;font:inherit;font-size:13px;font-weight:700;color:#f6e9d3;cursor:pointer}' +
    '.hkst .it i{width:12px;height:12px;flex:none;box-shadow:0 0 0 2px #000}.hkst .it:disabled{opacity:.35}' +
    '.hkst .mres{min-height:1.4em;margin-top:6px;font-size:15px;text-align:center}' +
    '.hkst .rt{font-size:11px;letter-spacing:.2em;color:#a898c4;margin-bottom:4px}.hkst .rh{font-size:clamp(20px,6vw,28px);font-weight:700;margin:0 0 8px}' +
    '.hkst .stats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.hkst .stat{background:#2a1b44;border:3px solid #4b3272;padding:5px 9px;display:flex;flex-direction:column;flex:1 1 90px}.hkst .stat small{font-size:10px;letter-spacing:.14em;color:#a898c4}.hkst .stat b{font-size:20px}' +
    '.hkst .up{color:#6fe39a}.hkst .dn{color:#ff5a6a}.hkst .buff{display:flex;gap:10px;align-items:center;background:#2c2010;border:3px solid #ffb454;padding:7px 9px;margin-bottom:8px}.hkst .buff i{font-style:normal;font-size:22px;color:#ffb454}.hkst .buff b{display:block;font-size:15px}.hkst .buff small{font-size:12px;color:#e7cfa5}' +
    '.hkst .note{font-size:13px;color:#a898c4;margin:0 0 10px;line-height:1.4}.hkst .scrub{width:100%;aspect-ratio:12/5;image-rendering:pixelated;touch-action:none;border:3px solid #4b3272;cursor:crosshair}' +
    '@media (prefers-reduced-motion:reduce){.hkst .nx,.hkst .segs i.new{animation:none}}';
  var UI = {
    skip: { tr: 'ATLA ▶▶', en: 'SKIP ▶▶' }, ber: { tr: 'BEREKET', en: 'BOUNTY' }, day: { tr: 'GÜN', en: 'DAY' },
    story: { tr: 'DİPTEKİ SÖZ', en: 'THE PROMISE BELOW' }, res: { tr: 'GÜNÜN SONUCU', en: 'RESULT OF THE DAY' },
    rep: { tr: 'İTİBAR', en: 'REPUTATION' }, cont: { tr: 'DEVAM ▶', en: 'CONTINUE ▶' }, tries: { tr: 'Deneme', en: 'Try' },
    tap: { tr: 'DUR!', en: 'STOP!' }, left: { tr: '◀ SOLA', en: '◀ LEFT' }, right: { tr: 'SAĞA ▶', en: 'RIGHT ▶' },
    hold: { tr: '✋ BASILI TUT: RÜZGÂRA KALKAN', en: '✋ HOLD: SHIELD FROM WIND' }, hit: { tr: '♪ VUR', en: '♪ STRIKE' },
    item: { tr: 'Koleksiyon', en: 'Collection' }, piece: { tr: 'Söz parçası', en: 'Promise piece' },
    skipped: { tr: 'Atlandı', en: 'Skipped' }, time: { tr: 'SÜRE', en: 'TIME' }
  };

  /* ---------------- ses (host'un efekt kanalına) ---------------- */
  var AC = null, DST = null;
  function tone(f, d, type, g, slide) {
    if (!AC || !DST) return;
    try {
      var t = AC.currentTime, o = AC.createOscillator(), v = AC.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
      v.gain.setValueAtTime(g || 0.05, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(DST); o.start(t); o.stop(t + d + 0.03);
    } catch (e) { }
  }
  function nz(d, g, f0, f1) {
    if (!AC || !DST) return;
    try {
      var t = AC.currentTime, n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0);
      for (var i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
      var s = AC.createBufferSource(); s.buffer = b;
      var f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + d);
      var v = AC.createGain(); v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f); f.connect(v); v.connect(DST); s.start(t);
    } catch (e) { }
  }
  var SFX = {
    ding: function () { tone(880, 0.16, 'triangle', 0.09); setTimeout(function () { tone(1320, 0.22, 'triangle', 0.09); }, 110); setTimeout(function () { tone(1760, 0.3, 'triangle', 0.07); }, 230); },
    buzz: function () { tone(120, 0.3, 'sawtooth', 0.06, -40); }, tick: function () { tone(700, 0.05, 'square', 0.05); },
    chew: function () { nz(0.07, 0.12, 900, 400); }, low: function () { tone(70, 0.35, 'sine', 0.22, -20); },
    splash: function () { nz(0.3, 0.18, 2400, 300); }, wind: function () { nz(0.8, 0.08, 500, 1500); },
    bow: function () { tone(160, 0.25, 'sawtooth', 0.05, 260); setTimeout(function () { nz(0.12, 0.1, 3000, 800); }, 200); },
    kopuz: function () { [294, 349, 392, 440, 392, 349, 294].forEach(function (f, i) { setTimeout(function () { tone(f, 0.6, 'triangle', 0.08, -8); tone(f * 2, 0.3, 'square', 0.012); }, i * 330); }); },
    deep: function () { tone(55, 1.2, 'sine', 0.2, -10); tone(110, 1.0, 'triangle', 0.05, -20); },
    bell: function () { tone(620, 1.8, 'sine', 0.07); tone(620 * 2.76, 0.9, 'sine', 0.02); }
  };
  function sfx(n) { try { if (SFX[n]) SFX[n](); } catch (e) { } }
  var VOICE = { y: [190, 230], a: [92, 108], h: [260, 300], k: [120, 140], t: [100, 115], s: [330, 350], v: [140, 160], n: [165, 165], d: [900, 1100] };
  function blip(w) { var v = VOICE[w] || VOICE.n, f = v[Math.random() * v.length | 0] * (1 + Math.random() * 0.06); tone(f, 0.05, w === 'n' ? 'triangle' : 'square', w === 'n' ? 0.035 : 0.025); }

  /* ---------------- tuval (ince piksel: ara tuval 2 kat) ----------------
     Sahne hâlâ eski sanat pikseli biriminde kurulur (W×H = 192×120; konumlar, kamera, parçacıklar). Çizim ise K = 2 kat
     ince tuvalde: 384×240 ince piksel. Görünüşü belirleyen her şey önbellekli sprite (Buf → tuval); karede yalnız blit.
     Görsel dil: koyu renkli kontur (rengin %55-65 koyusu), 3 ton gölge (ışık sol üstten), bayer geçişli gökyüzü,
     dokulu zemin, katmanlı deniz, hava perspektifli uzak plan. Bağımsız: art/temel.js'e bağlı değil. */
  var K = 2, FW = W * K, FH = H * K;
  var out, o, wc, ctx, OW = 960, OH = 600;
  function F(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }                                   /* ince piksel */
  function R(x, y, w, h, c) { F(Math.round(x) * K, Math.round(y) * K, Math.round(w) * K, Math.round(h) * K, c); }   /* sanat pikseli */
  function fit() {
    if (!out) return;
    var cssW = out.clientWidth || 360, dpr = window.devicePixelRatio || 1, k = Math.max(1, Math.min(4, Math.round(cssW * dpr / FW)));
    if (out.width !== FW * k) { out.width = FW * k; out.height = FH * k; OW = FW * k; OH = FH * k; }
    o.imageSmoothingEnabled = false;
  }

  /* ---------------- renk ---------------- */
  var _hx = {}, RAMP = {};
  function hx(c) {
    var v = _hx[c]; if (v) return v;
    var s = c;
    if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    v = [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), s.length >= 9 ? parseInt(s.slice(7, 9), 16) : 255];
    return (_hx[c] = v);
  }
  function th(a) { return '#' + [a[0], a[1], a[2]].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var A = hx(a), B = hx(b); return th([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  function dark(c, t) { return mix(c, '#20142a', t); }     /* gölge mora kayar */
  function lite(c, t) { return mix(c, '#fffbe8', t); }     /* ışık sıcak beyaza */
  function hash(a, b) { var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  var BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map(function (r) { return r.map(function (v) { return (v + 0.5) / 16; }); });
  function ramp(stops, N) {
    var k = stops.join() + '|' + N; if (RAMP[k]) return RAMP[k];
    var a = []; for (var i = 0; i < N; i++) { var s = i / (N - 1) * (stops.length - 1), j = Math.floor(s); a.push(mix(stops[j], stops[Math.min(stops.length - 1, j + 1)], s - j)); }
    return (RAMP[k] = a);
  }
  function rpick(rp, f, x, y) { f = clamp(f, 0, 1); var q = f * (rp.length - 1), i = Math.floor(q); return rp[(q - i) > BAY[y & 3][x & 3] ? Math.min(rp.length - 1, i + 1) : i]; }

  /* ---------------- ince piksel tamponu (sabit sınırlı, RGBA) ---------------- */
  var LT = [255, 251, 232], DK = [32, 20, 42];
  function Buf(x0, y0, x1, y1) { this.x0 = x0; this.y0 = y0; this.w = x1 - x0; this.h = y1 - y0; this.d = new Uint8ClampedArray(this.w * this.h * 4); this.bx0 = this.w; this.by0 = this.h; this.bx1 = -1; this.by1 = -1; }
  var BP = Buf.prototype;
  BP.like = function () { return new Buf(this.x0, this.y0, this.x0 + this.w, this.y0 + this.h); };
  BP.blend = function (i, r, g, b, a) {
    var d = this.d; if (a <= 0) return;
    var q = i >> 2, x = q % this.w, y = (q - x) / this.w;
    if (x < this.bx0) this.bx0 = x; if (x > this.bx1) this.bx1 = x; if (y < this.by0) this.by0 = y; if (y > this.by1) this.by1 = y;
    var da = d[i + 3] / 255;
    if (a >= 1 || da === 0) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = Math.round(Math.min(1, a) * 255); return; }
    var na = a + da * (1 - a), k = a / na;
    d[i] += (r - d[i]) * k; d[i + 1] += (g - d[i + 1]) * k; d[i + 2] += (b - d[i + 2]) * k; d[i + 3] = Math.round(na * 255);
  };
  BP.set = function (x, y, c, a) {
    x = Math.round(x) - this.x0; y = Math.round(y) - this.y0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    var v = hx(c); this.blend((y * this.w + x) * 4, v[0], v[1], v[2], (a === undefined ? 1 : a) * v[3] / 255);
    return this;
  };
  BP.clr = function (x, y) { x -= this.x0; y -= this.y0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[(y * this.w + x) * 4 + 3] = 0; };
  BP.al = function (x, y) { x -= this.x0; y -= this.y0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[(y * this.w + x) * 4 + 3]; };
  BP.rect = function (x, y, w, h, c, a) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c, a); return this; };
  BP.circ = function (cx, cy, r, c, a) { var R2 = r * r + r * 0.6, n = Math.ceil(r); for (var y = -n; y <= n; y++) for (var x = -n; x <= n; x++) if (x * x + y * y <= R2) this.set(cx + x, cy + y, c, a); return this; };
  BP.ell = function (cx, cy, rx, ry, c, a) { for (var y = -Math.ceil(ry); y <= ry; y++) for (var x = -Math.ceil(rx); x <= rx; x++) if ((x * x) / (rx * rx + 0.3) + (y * y) / (ry * ry + 0.3) <= 1) this.set(cx + x, cy + y, c, a); return this; };
  BP.seg = function (x0, y0, x1, y1, r, c) { var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (var i = 0; i <= n; i++) this.circ(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), r, c); return this; };
  BP.line = function (x0, y0, x1, y1, c, a) { var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (var i = 0; i <= n; i++) this.set(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c, a); return this; };
  BP.box = function (m) { return [Math.max(0, this.bx0 - m), Math.max(0, this.by0 - m), Math.min(this.w - 1, this.bx1 + m), Math.min(this.h - 1, this.by1 + m)]; };
  BP.mask = function () { var A = new Uint8Array(this.w * this.h), d = this.d, B = this.box(0); for (var y = B[1]; y <= B[3]; y++) for (var x = B[0]; x <= B[2]; x++) { var i = y * this.w + x; A[i] = d[i * 4 + 3] > 110 ? 1 : 0; } return A; };
  /* 3 ton: sol/üst kenar açık, sağ/alt kenar (2 px) koyu — ışık sol üstten */
  BP.shade = function (lt, dk) {
    var w = this.w, h = this.h, d = this.d, A = this.mask(), B = this.box(0);
    for (var y = B[1]; y <= B[3]; y++) for (var x = B[0]; x <= B[2]; x++) {
      var i = y * w + x; if (!A[i]) continue;
      var t = 0;
      if (x === 0 || !A[i - 1] || y === 0 || !A[i - w]) t = lt;
      else if (x >= w - 2 || !A[i + 1] || !A[i + 2] || y >= h - 1 || !A[i + w]) t = -dk;
      if (!t) continue;
      var j = i * 4, T = t > 0 ? LT : DK, k = Math.abs(t);
      d[j] += (T[0] - d[j]) * k; d[j + 1] += (T[1] - d[j + 1]) * k; d[j + 2] += (T[2] - d[j + 2]) * k;
    }
    return this;
  };
  /* koyu renkli kontur: boş komşuya, komşu rengin koyusu */
  BP.outline = function (t) {
    var w = this.w, h = this.h, d = this.d, A = this.mask(), add = [], B = this.box(1);
    for (var y = B[1]; y <= B[3]; y++) for (var x = B[0]; x <= B[2]; x++) {
      var i = y * w + x; if (A[i]) continue;
      var n = x > 0 && A[i - 1] ? i - 1 : x < w - 1 && A[i + 1] ? i + 1 : y > 0 && A[i - w] ? i - w : y < h - 1 && A[i + w] ? i + w : -1;
      if (n >= 0) add.push(i, n);
    }
    for (var q = 0; q < add.length; q += 2) {
      var j = add[q] * 4, s = add[q + 1] * 4;
      this.blend(j, d[s] + (DK[0] - d[s]) * t, d[s + 1] + (DK[1] - d[s + 1]) * t, d[s + 2] + (DK[2] - d[s + 2]) * t, 1);
    }
    return this;
  };
  BP.put = function (b) {
    var d = b.d, w = b.w, B = b.box(0);
    for (var y = B[1]; y <= B[3]; y++) for (var x = B[0]; x <= B[2]; x++) {
      var j = (y * w + x) * 4; if (!d[j + 3]) continue;
      var X = x + b.x0 - this.x0, Y = y + b.y0 - this.y0; if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue;
      this.blend((Y * this.w + X) * 4, d[j], d[j + 1], d[j + 2], d[j + 3] / 255);
    }
    return this;
  };
  /* parça: gölgele + kontur + üstüne bas */
  BP.part = function (p, lt, dk, ol) { if (lt || dk) p.shade(lt || 0, dk || 0); if (ol) p.outline(ol); return this.put(p); };
  BP.toSprite = function () {
    var cv = document.createElement('canvas'); cv.width = Math.max(1, this.w); cv.height = Math.max(1, this.h);
    var g = cv.getContext('2d'), id = g.createImageData(cv.width, cv.height); id.data.set(this.d); g.putImageData(id, 0, 0);
    return { cv: cv, x0: this.x0, y0: this.y0 };
  };
  var SPR = new Map();
  function spr(key, x0, y0, x1, y1, fn) {
    var s = SPR.get(key); if (s) return s;
    var b = new Buf(x0, y0, x1, y1); fn(b); s = b.toSprite();
    if (SPR.size > 1200) SPR.clear();
    SPR.set(key, s); return s;
  }
  function blit(s, fx, fy, a) {
    if (!s) return;
    if (a !== undefined) { if (a <= 0.004) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(s.cv, fx + s.x0, fy + s.y0); ctx.globalAlpha = 1; }
    else ctx.drawImage(s.cv, fx + s.x0, fy + s.y0);
  }
  /* bantlı (Kairosoft tarzı) yuvarlak ışıma; alfa karede globalAlpha ile */
  function glowSpr(r, col) {
    return spr('glow|' + r + '|' + col, -r - 1, -r - 1, r + 2, r + 2, function (b) {
      for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) {
        var q = Math.sqrt(x * x + y * y) / r; if (q > 1) continue;
        var a = q < 0.35 ? 1 : q < 0.6 ? 0.72 : q < 0.82 ? 0.45 : 0.22;
        if (q > 0.9 && BAY[y & 3][x & 3] > 0.5) continue;
        b.set(x, y, col, a);
      }
    });
  }
  function glow(fx, fy, r, col, a) { blit(glowSpr(r, col), fx, fy, a); }

  /* ---------------- dekor parçaları (ince piksel, tampon içine) ---------------- */
  var SKIES = {
    dawn: ['#3b2a5a', '#5a3a72', '#8a4a78', '#c46a78', '#eb9a7e', '#f7c08a', '#fbdca6', '#fdeec8'],
    day: ['#3f7fc0', '#4b8ccc', '#5a9ad4', '#6aa8dc', '#7cb6e2', '#90c4e8', '#a6d2ee', '#bddff2'],
    sunset: ['#2b1b4d', '#4a2468', '#7a2f6e', '#b84a62', '#e0736a', '#f29a6b', '#f7c27a', '#fbe0a0'],
    night: ['#07071a', '#0b0b24', '#10102e', '#15153a', '#1b1b46', '#222252', '#2a2a5e', '#33336a'],
    morning: ['#5a8ac8', '#6a98d0', '#7ca8d8', '#90b8e0', '#a6c8e6', '#bcd8ec', '#d2e6f2', '#e8f2f8']
  };
  function skyB(b, name, off) {
    var rp = ramp(SKIES[name], 40), y1 = 64 * K;
    for (var y = 0; y < FH; y++) { var f = (y + (off || 0) * K) / y1; for (var x = 0; x < FW; x++) b.set(x, y, rpick(rp, f, x, y)); }
  }
  function starsB(b, n, seed) {
    for (var i = 0; i < n; i++) {
      var x = Math.floor(hash(i, seed) * FW), y = Math.floor(hash(seed, i) * 110), r = hash(i, seed + 7);
      if (r > 0.92) { b.set(x, y, '#ffffff'); b.set(x - 1, y, '#8a8ac8', 0.6); b.set(x + 1, y, '#8a8ac8', 0.6); b.set(x, y - 1, '#8a8ac8', 0.6); b.set(x, y + 1, '#8a8ac8', 0.6); }
      else b.set(x, y, r > 0.6 ? '#c8c8f0' : '#6a6aa8', r > 0.6 ? 1 : 0.8);
    }
  }
  /* güneş / ay: bantlı hale + 3 tonlu disk (deniz alt yarısını örter) */
  function sunB(b, cx, cy, r, col, moon) {
    var X = cx * K, Y = cy * K, Rr = r * K, H2 = Rr + (moon ? 12 : 16);
    for (var y = -H2; y <= H2; y++) for (var x = -H2; x <= H2; x++) {
      var q = Math.sqrt(x * x + y * y);
      if (q > Rr) { var hz = (q - Rr) / (H2 - Rr); if (hz < 1) { var a = hz < 0.3 ? 0.3 : hz < 0.62 ? 0.17 : 0.08; if (hz > 0.8 && BAY[(y + 64) & 3][(x + 64) & 3] > 0.5) continue; b.set(X + x, Y + y, lite(col, 0.3), a); } continue; }
      var c = col, lt = (-x - y) / Rr;
      if (q > Rr - 1.5) c = moon ? mix(col, '#9a9ab8', 0.35) : mix(col, '#ff8a4a', 0.3);
      else if (lt > 0.55) c = lite(col, 0.55); else if (lt > 0.1) c = lite(col, 0.25);
      else if (moon && lt < -0.5) c = mix(col, '#9a9ab8', 0.3);
      b.set(X + x, Y + y, c);
    }
    if (moon) [[-4, -2, 3], [3, 4, 2], [5, -5, 2], [-2, 6, 1]].forEach(function (k) { b.circ(X + k[0], Y + k[1], k[2], '#b8b8d0', 0.75); b.set(X + k[0] - 1, Y + k[1] - 1, '#9a9ab8'); });
  }
  /* kabarık bulut: yukarısı aydınlık, tabanı göğe karışan gölge */
  function cloudBuf(w, h, col, shd, seed) {
    var p = new Buf(-2, -h - 4, w + 3, 3);
    p.ell(w / 2, -h * 0.3, w / 2, h * 0.32, col);
    var n = 3 + Math.floor(hash(seed, 3) * 3);
    for (var i = 0; i < n; i++) { var cx = w * (0.18 + 0.64 * (i + 0.5) / n) + (hash(seed, i) - 0.5) * 6, r = h * (0.35 + hash(i, seed) * 0.4); p.circ(Math.round(cx), Math.round(-r * 0.55 - h * 0.15), Math.round(r), col); }
    for (var x = -2; x < w + 3; x++) for (var y = 0; y < 3; y++) p.clr(x, y);
    var A = p.mask(), d = p.d;
    for (var yy = 0; yy < p.h; yy++) for (var xx = 0; xx < p.w; xx++) {
      var i2 = yy * p.w + xx; if (!A[i2]) continue;
      var Y = yy + p.y0, c = null;
      if (yy === 0 || !A[i2 - p.w] || (yy > 1 && !A[i2 - 2 * p.w] && xx < p.w * 0.6)) c = lite(col, 0.5);
      else if (Y > -h * 0.28) c = Y > -h * 0.12 ? shd : (BAY[Y & 3][xx & 3] > 0.5 ? shd : col);
      if (c) { var v = hx(c); d[i2 * 4] = v[0]; d[i2 * 4 + 1] = v[1]; d[i2 * 4 + 2] = v[2]; }
      if (!A[i2 + 1] || !A[i2 - 1]) d[i2 * 4 + 3] = 200;
    }
    return p;
  }
  function cloudSpr(w, h, col, shd, seed) { return spr('cl|' + [w, h, col, shd, seed].join('|'), -2, -h - 4, w + 3, 3, function (b) { b.put(cloudBuf(w, h, col, shd, seed)); }); }
  /* ince bulut şeridi (gün batımı) */
  function streakSpr(w, h, col) {
    return spr('st|' + w + '|' + h + '|' + col, -2, -2, w + 2, h * K + 2, function (b) {
      for (var y = 0; y < h * K; y++) { var in0 = Math.round(Math.abs(y - h) * 1.5) + (y === 0 ? 2 : 0); for (var x = in0; x < w - in0 * 0.6; x++) b.set(x, y, y === 0 ? lite(col, 0.35) : y >= h * K - 1 ? dark(col, 0.18) : col, x < in0 + 2 || x > w - in0 * 0.6 - 3 ? 0.6 : 1); }
    });
  }
  /* uzak tepeler (hava perspektifi: soluk, göğe karışan) */
  function hillsB(b, x0, x1, base, hmax, col, seed) {
    for (var x = x0; x < x1; x++) {
      var e = Math.min(1, (x - x0) / 30, (x1 - x) / 30), h = Math.round(hmax * e * (0.55 + 0.3 * Math.sin(x * 0.035 + seed) + 0.15 * Math.sin(x * 0.11 + seed * 3)));
      for (var y = 0; y < h; y++) b.set(x, base - 1 - y, y === h - 1 ? lite(col, 0.18) : col);
      if (h > 3 && hash(x, seed) > 0.86) b.set(x, base - h - 1, col, 0.7);
    }
  }
  function seaB(b, y0, c1, c2, c3, glo, hz) {
    var Y0 = y0 * K, rp = ramp([mix(c2, hz, 0.5), mix(c2, hz, 0.15), c2, c1, c3, dark(c3, 0.3)], 32);
    for (var y = Y0; y < FH; y++) { var f = Math.pow((y - Y0) / (FH - Y0), 0.85); for (var x = 0; x < FW; x++) b.set(x, y, rpick(rp, f, x, y)); }
    for (var r = 0; r < 70; r++) { var yy = Y0 + 3 + Math.floor(Math.pow(hash(r, 3), 1.6) * (FH - Y0 - 3)), xx = Math.floor(hash(3, r) * FW), L = 2 + Math.floor((yy - Y0) / 14); b.rect(xx, yy, L, 1, dark(c3, 0.2), 0.45); }
    b.rect(0, Y0, FW, 1, glo); b.rect(0, Y0 + 1, FW, 1, glo, 0.45); b.rect(0, Y0 + 2, FW, 1, lite(c2, 0.2), 0.25);
  }
  /* katmanlı dalga (4 kare): yakına geldikçe uzun ve seyrek */
  function waveSpr(key, y0, c2, c3, f) {
    var Y0 = y0 * K;
    return spr('wv|' + key + '|' + f, 0, Y0, FW, FH, function (b) {
      var yy = Y0 + 3, row = 0;
      while (yy < FH) {
        var p = (yy - Y0) / (FH - Y0), len = 2 + Math.round(p * 9), gap = 12 + Math.round(p * 34), dir = row % 2 ? 1 : -1, off = Math.floor(hash(row, 5) * gap + dir * f * gap / 4);
        var s0 = ((off % gap) + gap) % gap - gap;
        for (var x = s0, n = 0; x < FW; x += gap, n++) {
          var L = len + Math.round(hash(row, n - Math.floor(off / gap)) * 3);
          b.rect(x, yy, L, 1, lite(c2, 0.4), 0.8);
          if (p > 0.2 && L > 3) b.rect(x + 1, yy + 1, L - 2, 1, dark(c3, 0.25), 0.55);
        }
        yy += 3 + Math.round(p * 7); row++;
      }
    });
  }
  function waves(key, y0, c2, c3) { blit(waveSpr(key, y0, c2, c3, Math.floor(S.wt * 3) % 4), 0, 0); }
  /* güneş yansıması (karede, birkaç ince çizgi) */
  function reflect(cx, y0, n, w0, cA, cB) {
    for (var i = 0; i < n * 2; i++) {
      var w = Math.max(2, Math.round((n * 2 - i) / (n * 2) * w0 * K)), j = Math.round(Math.sin(S.wt * 2.2 + i * 0.7) * 3);
      F(cx * K - (w >> 1) + j, y0 * K + 3 + i * 3, w, 1, i % 2 ? cA : cB);
    }
  }
  function gullSpr(fr) {
    return spr('gull|' + fr, -9, -6, 10, 6, function (b) {
      var p = b.like(), W2 = '#eef0f4', G2 = '#9aa4b4', T2 = '#3a2446';
      if (fr) { p.rect(-7, -3, 2, 1, T2); p.rect(-5, -2, 3, 1, G2); p.rect(-2, -1, 4, 2, W2); p.rect(2, -2, 3, 1, G2); p.rect(5, -3, 2, 1, T2); }
      else { p.rect(-7, 1, 2, 1, T2); p.rect(-5, 0, 3, 1, G2); p.rect(-2, -1, 4, 2, W2); p.rect(2, 0, 3, 1, G2); p.rect(5, 1, 2, 1, T2); }
      p.set(2, -1, '#e8a040'); b.part(p, 0, 0, 0.55);
    });
  }
  function gull(x, y, ph) { blit(gullSpr(Math.sin(S.wt * 5 + ph) > 0 ? 1 : 0), Math.round(x * K), Math.round(y * K)); }
  /* ahşap iskele: tahta damarı, ek yerleri, çiviler */
  function dockB(b) {
    var rows = [[204, 216, 0], [216, 228, 18], [228, 234, 9]], seams = [10, 48, 93, 131, 170];
    rows.forEach(function (r, ri) {
      for (var y = r[0]; y < r[1]; y++) for (var x = 0; x < FW; x++) {
        var n = hash(Math.floor((x + hash(y, ri) * 40) / 7), y * 3 + ri), c = '#6b4630';
        if (n < 0.16) c = '#5c3b28'; else if (n > 0.9) c = '#7a5238';
        if (y === r[0]) c = '#a0704a'; else if (y === r[0] + 1) c = '#8a5d3e'; else if (y === r[1] - 1) c = '#45291b';
        b.set(x, y, c);
      }
      seams.forEach(function (sx, si) {
        var X = ((sx + r[2]) * K) % FW;
        b.rect(X, r[0] + 1, 1, r[1] - r[0] - 2, '#33200f'); b.rect(X + 1, r[0] + 1, 1, r[1] - r[0] - 2, '#84583a');
        if (r[1] - r[0] > 8) { [[-3, 3], [3, 3], [-3, r[1] - r[0] - 4], [3, r[1] - r[0] - 4]].forEach(function (q) { b.set(X + q[0], r[0] + q[1], '#2a1a12'); b.set(X + q[0] - 1, r[0] + q[1] - 1, '#a0704a', 0.7); }); }
        if (hash(si, ri) > 0.5) { var kx = X + 20 + Math.floor(hash(ri, si) * 30), ky = r[0] + 4; b.ell(kx, ky, 3, 1.5, '#4e3020'); b.set(kx - 1, ky, '#33200f'); }
      });
    });
    for (var x = 0; x < FW; x++) { b.set(x, 234, '#4a2e1e'); for (var y = 235; y < FH; y++) b.set(x, y, (x % 38 < 4) ? '#2a180e' : (y === 235 ? '#5a3826' : '#3a2316')); }
  }
  /* balık: 12×5, başı sağda (flip: sola) */
  function fishB(b, x, y, c, flip) {
    var back = dark(c, 0.32), bel = lite(c, 0.45), mid = c;
    var rows = [[4, 8, back], [2, 10, back], [1, 11, mid], [2, 10, bel], [4, 8, bel]];
    function P(i, j, col) { b.set(flip ? x + 11 - i : x + i, y + j, col); }
    rows.forEach(function (r, j) { for (var i = r[0]; i <= r[1]; i++) P(i, j, j === 2 && i > 2 && i < 9 ? lite(c, 0.25) : r[2]); });
    P(0, 0, back); P(0, 4, back); P(0, 1, mid); P(0, 3, mid); P(1, 2, mid);
    P(8, 1, dark(c, 0.2)); P(8, 2, dark(c, 0.15)); P(9, 1, '#1a1420'); P(10, 1, lite(c, 0.3));
  }
  function fishPileB(b, x, y, n, c) {
    var p = b.like();
    for (var i = 0; i < n; i++) { var fx = (x + (i % 5) * 5) * K, fy = (y - Math.floor(i / 5) * 2) * K - 3, h = hash(i, n); fishB(p, fx + Math.round((h - 0.5) * 2), fy, h > 0.7 ? lite(c, 0.12) : h < 0.25 ? dark(c, 0.1) : c, i % 2 === 1); }
    b.part(p, 0, 0, 0.55);
  }
  /* tezgâh: çizgili tente (fistolu), direkler, tahta tezgâh */
  function counterB(b, x, w) {
    var X = x * K, Wd = w * K, p = b.like();
    for (var y = 166; y < 174; y++) for (var i = 0; i < Wd + 4; i++) p.set(X + i, y, y === 166 ? '#d8a070' : y < 169 ? '#c08a5c' : y === 173 ? '#7a4a2c' : (hash(Math.floor(i / 6), y) < 0.2 ? '#94643e' : '#a2714a'));
    for (var y2 = 174; y2 < 204; y2++) for (var i2 = 0; i2 < Wd; i2++) {
      var pl = Math.floor(i2 / 24), seam = i2 % 24 === 0, c = '#6a4229', n = hash(Math.floor((i2 + pl * 13) / 2), Math.floor(y2 / 5) + pl * 7);
      if (n < 0.14) c = '#5c3822'; else if (n > 0.92) c = '#7a5034';
      if (seam) c = '#3e2414'; else if (i2 % 24 === 1) c = '#84583a';
      if (y2 === 174) c = '#3e2414';
      p.set(X + i2, y2, c);
    }
    b.part(p, 0, 0, 0.55);
  }
  function stallB(b, x, col) {
    var X = x * K, p = b.like();
    [3, 81].forEach(function (px) { for (var y = 48; y < 168; y++) for (var i = 0; i < 8; i++) p.set(X + px * K + i, y, i < 2 ? '#6a4630' : i > 5 ? '#33200f' : (hash(i, Math.floor(y / 4)) < 0.2 ? '#40281a' : '#4a2f1d')); });
    b.part(p, 0, 0, 0.55);
    var aw = b.like(), cA = col || '#d94a4a', cB = '#f3e6d0';
    for (var i = 0; i < 176; i++) {
      var st = Math.floor(i / 24), c = st % 2 === 0 ? cA : cB, u = (i % 24) / 24;
      for (var y = 16; y < 48; y++) { var cc = c; if (y < 19) cc = lite(c, 0.25); else if (u < 0.12) cc = lite(c, 0.15); else if (u > 0.85) cc = dark(c, 0.16); else if (y > 42) cc = dark(c, 0.08); aw.set(X + i, y, cc); }
      var sc = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.5) * 2, 2))) * 6);
      for (var y3 = 48; y3 < 48 + sc; y3++) aw.set(X + i, y3, y3 === 47 + sc ? dark(c, 0.15) : c);
    }
    for (var i3 = 0; i3 < 176; i3++) { aw.set(X + i3, 12, '#9a3a3a'); aw.set(X + i3, 13, '#7a2a2a'); aw.set(X + i3, 14, '#7a2a2a'); aw.set(X + i3, 15, '#5a1e1e'); }
    b.part(aw, 0, 0, 0.6);
    for (var i4 = 0; i4 < 172; i4++) for (var y4 = 54; y4 < 60; y4++) b.set(X + 2 + i4, y4, '#20142a', 0.12 * (60 - y4) / 6);
    counterB(b, x, 86);
  }
  function scaleB(b) {
    var p = b.like(), br = '#c8b070', brD = '#8a7440', st = '#b8b8c8';
    p.rect(114, 160, 20, 6, brD); p.rect(116, 158, 16, 2, br); p.rect(122, 138, 4, 20, br); p.circ(124, 136, 3, br);
    p.rect(104, 146, 40, 3, br); p.set(124, 147, '#e8d8a0');
    [[104, 104], [143, 143]].forEach(function (q) { p.line(q[0], 148, q[0] - 4, 156, st, 0.9); p.line(q[0], 148, q[0] + 4, 156, st, 0.9); });
    [[100, 156], [139, 156]].forEach(function (q) { p.rect(q[0] - 2, q[1], 14, 2, '#d8d8e0'); p.rect(q[0], q[1] + 2, 10, 2, '#9a9aa8'); });
    b.part(p, 0.25, 0.25, 0.55);
    fishB(b, 98, 152, '#8fa9bd', false);
  }
  /* uzak kasaba evi: sıva dokusu, kiremit sıraları, pencere çerçeveleri */
  function houseB(b, hz) {
    var p = b.like(), X0 = 240, X1 = 380, wall = mix('#e8e0d0', hz, 0.12), roof = mix('#b5432f', hz, 0.12);
    for (var y = 60; y < 124; y++) for (var x = X0; x < X1; x++) p.set(x, y, hash(x >> 1, y >> 1) < 0.08 ? dark(wall, 0.06) : hash(x, y) > 0.96 ? lite(wall, 0.3) : wall);
    for (var y2 = 46; y2 < 62; y2++) { var ins = Math.round((62 - y2) * 0.6); for (var x2 = X0 - 4 + ins; x2 < X1 + 4 - ins; x2++) { var tr = (y2 - 46) % 4, c = tr === 0 ? lite(roof, 0.2) : tr === 3 ? dark(roof, 0.25) : ((x2 + (Math.floor((y2 - 46) / 4) % 2) * 3) % 6 === 0 ? dark(roof, 0.18) : roof); p.set(x2, y2, c); } }
    p.rect(X0 - 4, 62, X1 - X0 + 8, 2, dark(roof, 0.35));
    p.rect(330, 34, 8, 14, mix('#c8b8a8', hz, 0.1)); p.rect(328, 32, 12, 3, mix('#8a7a6a', hz, 0.1));
    b.part(p, 0.12, 0.12, 0.45);
    for (var i = 0; i < 5; i++) {
      var wx = 252 + i * 26, wy = 76;
      if (i === 2) { b.rect(wx, wy, 14, 48, dark('#6a4a3a', 0.1)); b.rect(wx + 1, wy + 1, 12, 46, '#7a5a42'); b.rect(wx + 6, wy + 2, 1, 44, '#5a3a2a'); b.set(wx + 9, wy + 24, '#e4b94a'); continue; }
      b.rect(wx - 1, wy - 1, 14, 18, '#8a8070'); b.rect(wx, wy, 12, 16, '#6a8aa8'); b.rect(wx, wy, 12, 3, '#4a6a88');
      b.rect(wx + 5, wy, 2, 16, '#e8e0d0'); b.rect(wx, wy + 7, 12, 2, '#e8e0d0'); b.line(wx + 1, wy + 14, wx + 4, wy + 10, '#a8c8e0'); b.rect(wx - 2, wy + 16, 16, 2, '#c8c0b0');
    }
  }
  /* höyük: çimen dokulu tepe + balbal taşları (yontulmuş yüz) */
  function balbalB(b, x, y, h, dk) {
    var p = b.like(), c = dk ? '#4e4e5c' : '#7d7d8a';
    for (var j = 0; j < h; j++) { var w = j < 2 ? 4 : 6, o = j < 2 ? 1 : 0; for (var i = 0; i < w; i++) p.set(x + o + i, y + j, c); }
    p.shade(0.3, 0.3);
    p.set(x + 2, y + 5, dark(c, 0.5)); p.set(x + 4, y + 5, dark(c, 0.5)); p.rect(x + 1, y + 8, 4, 1, dark(c, 0.4)); p.rect(x + 1, y + 12, 5, 1, dark(c, 0.3)); p.set(x + 2, y + 14, dark(c, 0.3));
    b.part(p, 0, 0, 0.55);
  }
  function moundB(b, x0, hgt, dk) {
    var p = b.like(), body = dk ? '#1c2a1c' : '#2c3a2b', top = dk ? '#2e4430' : '#4a6340';
    for (var X = x0 * K; X < FW; X++) {
      var h = Math.round(K * hgt * Math.sin(Math.PI * (X / K - x0 + 4) / 70)); if (h <= 0) continue;
      for (var j = 0; j < h; j++) { var Y = 124 - h + j, c = j < 2 ? top : j < 5 ? (BAY[Y & 3][X & 3] > 0.5 ? top : body) : (hash(X >> 1, Y >> 1) < 0.1 ? dark(body, 0.15) : hash(X, Y) > 0.95 ? mix(body, top, 0.5) : body); p.set(X, Y, c); }
      if (hash(X, 9) > 0.8) p.set(X, 123 - h, top);
    }
    b.part(p, 0, 0, 0.5);
    balbalB(b, (x0 + 22) * K, 88, 36, dk); balbalB(b, (x0 + 39) * K, 98, 26, dk);
  }
  function groundB(b, y, c, c2) {
    var Y = y * K;
    for (var yy = Y; yy < FH; yy++) for (var x = 0; x < FW; x++) {
      var f = (yy - Y) / (FH - Y), cc = f < 0.08 ? mix(c, c2, 0.5) : c;
      if (f > 0.5 && BAY[yy & 3][x & 3] < (f - 0.5) * 0.5) cc = dark(c, 0.12);
      b.set(x, yy, cc);
    }
    for (var i = 0; i < 70; i++) {
      var gx = Math.floor(hash(i, 21) * FW), gy = Y + 4 + Math.floor(hash(21, i) * (FH - Y - 6)), k = hash(i, 5);
      if (k < 0.55) { b.set(gx, gy, c2); b.set(gx - 1, gy - 1, c2); b.set(gx + 1, gy - 2, lite(c2, 0.2)); b.set(gx + 1, gy - 1, c2); }
      else if (k < 0.8) { b.rect(gx, gy, 3, 2, mix(c, '#6a6a70', 0.5)); b.set(gx, gy, mix(c, '#9a9aa0', 0.5)); }
      else b.rect(gx, gy, 4, 1, dark(c, 0.2));
    }
  }
  function potB(b) {   /* güveç: sırlı toprak kap + kapak + kulp */
    var p = b.like();
    for (var y = 146; y < 166; y++) { var t = (y - 146) / 20, hw = Math.round(20 - Math.pow(t - 0.35, 2) * 18); p.rect(72 - hw, y, hw * 2, 1, y < 150 ? '#d88a4a' : y > 160 ? '#8a4a20' : '#b5652e'); }
    p.rect(50, 144, 44, 3, '#d88a4a'); p.rect(48, 150, 4, 6, '#a0552a'); p.rect(92, 150, 4, 6, '#a0552a');
    p.rect(58, 141, 28, 3, '#e8d9b0'); p.rect(62, 140, 20, 1, '#f4ead0');
    for (var i = 0; i < 6; i++) p.set(56 + i * 6, 156, '#e8b070');
    b.part(p, 0.25, 0.25, 0.6);
  }
  function netB(b) {   /* ağ yığını: ilmek dokusu, mantar şamandıralar */
    var p = b.like();
    for (var x = 0; x < 124; x++) { var top = 176 + Math.round(4 + Math.sin(x * 0.18) * 3 + Math.sin(x * 0.07) * 3 - (x > 100 ? (x - 100) * 0.0 : 0)); if (x > 108) top += (x - 108); for (var y = top; y < 204; y++) { var wv = Math.round(Math.sin(y * 0.5 + x * 0.05) * 1.2), m = ((x + y + wv + 600) % 7 === 0) || ((x - y - wv + 600) % 7 === 0), n = hash(x >> 2, y >> 2); p.set(x, y, m ? (n > 0.5 ? '#8a7650' : '#7a6844') : (y - top < 2 ? '#6a5a3c' : n < 0.3 ? '#3e3022' : '#4a3a2a')); } }
    p.shade(0.12, 0.2);
    for (var i = 0; i < 10; i++) { var fx = 8 + i * 10, fy = 176 + Math.round(4 + Math.sin(fx * 0.18) * 3 + Math.sin(fx * 0.07) * 3) - 1; p.ell(fx, fy, 3, 2, i % 3 === 0 ? '#e8e0d0' : '#d9774a'); p.set(fx - 1, fy - 1, '#fff2d8'); }
    b.part(p, 0, 0, 0.55);
  }
  function crateB(b, x, y, w, h) {   /* sandık */
    var p = b.like();
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) { var c = (j % 7 === 0) ? '#6a4a2e' : (hash(Math.floor(i / 3), j) < 0.15 ? '#7a5a3a' : '#8a6a4a'); if (i < 3 || i > w - 4) c = '#6a4a2e'; p.set(x + i, y + j, c); }
    p.rect(x, y, w, 3, '#a88a5a');
    b.part(p, 0.2, 0.25, 0.6);
  }
  function rockFormB(b, rx, top, w, seed) {   /* kayalık: kırık tepe çizgisi, ay ışığı kenarı, çatlak */
    var p = b.like(), tones = ['#3a3a4c', '#2c2c3a', '#23232e'], pk = 0.3 + hash(seed, 2) * 0.4;
    for (var x = 0; x < w; x++) {
      var u = x / w, tt = top + Math.round(Math.abs(u - pk) * 14 + Math.abs(Math.sin(x * 0.21 + seed)) * 3 + hash(x >> 2, seed) * 3);
      for (var y = tt; y < FH; y++) {
        var sl = x + Math.round((y - top) * (0.25 + hash(seed, 5) * 0.2)) + Math.round(Math.sin(y * 0.15 + seed) * 2), fi = Math.floor(sl / 22), tn = hash(fi, seed), c2 = tones[tn < 0.35 ? 0 : tn < 0.75 ? 1 : 2];
        if (y - tt < 2) c2 = y - tt === 0 ? '#6a7090' : '#4e5068'; else if (y - tt < 5 && u < pk + 0.1) c2 = '#40425a';
        else if (sl % 22 === 0 && hash(fi, 9) < 0.5) c2 = '#18181f'; else if (sl % 22 === 1 && tn < 0.35) c2 = '#4a4c62';
        else if (hash(x >> 1, y >> 1) < 0.06) c2 = '#1c1c26';
        p.set(rx + x, y, c2);
      }
    }
    b.part(p, 0.12, 0.2, 0.55);
  }
  function torchSpr(fr) {
    return spr('torch|' + fr, -8, -16, 10, 34, function (b) {
      var p = b.like(); p.rect(0, 0, 4, 32, '#4a2f1d'); p.rect(0, 0, 1, 32, '#6a4630'); p.rect(-1, -1, 6, 3, '#2a1a12'); b.part(p, 0, 0, 0.55);
      var f = b.like(), H2 = fr ? 12 : 10;
      for (var y = 0; y < H2; y++) { var hw = Math.max(1, Math.round(4 * Math.sin(Math.PI * (y + 2) / (H2 + 2)))), sx = fr && y < 4 ? 1 : 0; for (var x = -hw; x < hw; x++) f.set(2 + x + sx, -1 - y, Math.abs(x + 0.5) < hw * 0.4 && y > 1 ? '#ffe28a' : '#ffb454'); }
      f.set(2, -1 - H2, '#ff8a3c'); b.part(f, 0, 0.3, 0.4);
    });
  }
  function fireSpr(fr) {   /* kamp ateşi: taş halka, çapraz kütük, dilli alev */
    return spr('fire|' + fr, -26, -34, 26, 10, function (b) {
      var s = b.like();
      for (var i = 0; i < 9; i++) { var a = Math.PI * (i / 8), x = Math.round(Math.cos(a) * 20), y = Math.round(Math.sin(a) * 3) + 4; s.ell(x, y, 3, 2, '#5a5a66'); }
      b.part(s, 0.25, 0.25, 0.55);
      var l = b.like(); l.seg(-16, 4, 14, -2, 2, '#5a3a2a'); l.seg(-14, -2, 16, 4, 2, '#6a4430'); b.part(l, 0.2, 0.25, 0.55);
      var f = b.like(), tongues = fr ? [[-8, 14], [-2, 24], [5, 18], [10, 11]] : [[-9, 12], [-3, 20], [3, 26], [9, 14]];
      tongues.forEach(function (t) { for (var y = 0; y < t[1]; y++) { var hw = Math.max(0.5, 5 * (1 - y / t[1])); for (var x = -Math.ceil(hw); x < hw; x++) { var q = Math.abs(x + 0.5) / hw, c = q < 0.35 && y < t[1] * 0.6 ? '#ffe28a' : q < 0.7 ? '#ffb454' : '#ff8a3c'; f.set(t[0] + x, -y, c); } } });
      f.rect(-3, -6, 6, 4, '#fff6d0');
      b.part(f, 0, 0, 0.35);
    });
  }
  function bubbleSpr() { return spr('bub', -3, -3, 4, 4, function (b) { b.circ(0, 0, 2, '#6fe3c8', 0.55); b.circ(0, 0, 1, '#0b4c60', 0.6); b.set(-1, -1, '#e8fff8'); }); }
  function weedSpr(i, fr) {
    return spr('weed|' + i + '|' + fr, -12, -40, 14, 2, function (b) {
      var p = b.like();
      [[0, 20, '#2f7a4a'], [6, 16 + i * 2, '#3f9a5a']].forEach(function (s, k) {
        for (var y = 0; y < s[1] * 1.0 + 8; y++) { var sw = Math.round(Math.sin(y * 0.25 + fr * 1.57 + k) * (y / 12)); p.rect(s[0] + sw, -y, 3, 1, y % 6 === 0 ? lite(s[2], 0.2) : s[2]); if (y % 7 === 3) p.rect(s[0] + sw + 3, -y, 2, 1, s[2]); }
      });
      b.part(p, 0.2, 0.2, 0.55);
    });
  }
  function shadowSpr(w) { return spr('shd|' + w, -w - 1, -4, w + 2, 5, function (b) { b.ell(0, 0, w, 3, '#000000', 0.22); b.ell(0, 0, w * 0.7, 2, '#000000', 0.18); }); }

  /* ---------------- dekorlar (bg): gök / arka / ön katman önbellekte, a0/a1/a2 karede ---------------- */
  var HZ = { dawn: '#fdeec8', day: '#bddff2', sunset: '#fbe0a0', night: '#33336a', morning: '#e8f2f8' };
  var BGD = {
    dock: { /* şafak iskelesi */
      sky: function (b) { skyB(b, 'dawn'); sunB(b, 150, 62, 9, '#ffd98a'); [[18, 22, 30, 8], [70, 14, 40, 9], [108, 30, 26, 6]].forEach(function (q, i) { b.put(shift(cloudBuf(q[2] * K, q[3] * K, '#f3b8a8', '#c47a8a', i + 1), q[0] * K, q[1] * K)); }); },
      back: function (b) {
        hillsB(b, 0, 230, 124, 9, mix('#6a4a7a', HZ.dawn, 0.55), 1);
        seaB(b, 62, '#2f4a7a', '#39578a', '#2a4270', '#8aa0c8', HZ.dawn);
        var bc = mix('#2a1a40', HZ.dawn, 0.4), p = b.like(); for (var hy = 0; hy < 6; hy++) p.rect(38 + hy, 117 + hy, 40 - hy * 2 - (hy > 3 ? 2 : 0), 1, hy === 0 ? lite(bc, 0.15) : bc); p.rect(50, 111, 12, 6, bc); p.rect(51, 112, 2, 2, lite(bc, 0.35)); p.rect(55, 113, 2, 2, lite(bc, 0.35)); p.rect(64, 90, 1, 27, bc); p.line(65, 92, 74, 113, bc, 0.8); p.rect(62, 100, 5, 2, bc); p.line(38, 117, 30, 116, bc, 0.6); b.part(p, 0, 0, 0); b.rect(36, 123, 46, 1, lite('#8aa0c8', 0.3), 0.6);
      },
      a1: function () { waves('dock', 62, '#39578a', '#2a4270'); reflect(150, 62, 7, 14, '#ffd98a', '#fbe0a0'); gull(((S.wt * 7 + 30) % 230) - 20, 38 + Math.sin(S.wt) * 3, 0); },
      front: function (b) { dockB(b); netB(b); crateB(b, 300, 184, 32, 20); fishPileB(b, 151, 91, 8, '#8fa9bd'); }
    },
    market: { /* gündüz pazar */
      sky: function (b) { skyB(b, 'day'); [[10, 20, 34, 9], [96, 12, 44, 10], [150, 22, 30, 7]].forEach(function (q, i) { b.put(shift(cloudBuf(q[2] * K, q[3] * K, '#ffffff', '#c8dcef', i + 4), q[0] * K, q[1] * K)); }); },
      back: function (b) { hillsB(b, 60, 250, 124, 10, mix('#3a6a5a', HZ.day, 0.55), 4); seaB(b, 62, '#2b5a8f', '#34689e', '#28527f', '#7fb0dc', HZ.day); houseB(b, HZ.day); },
      a1: function () { waves('market', 62, '#34689e', '#28527f'); gull(((S.wt * 6 + 80) % 230) - 20, 22 + Math.sin(S.wt * 1.2) * 3, 1); },
      front: function (b) { dockB(b); stallB(b, 0, '#2f7a4a'); fishPileB(b, 8, 82, 14, '#5f8f8a'); fishPileB(b, 40, 82, 6, '#a8b6c2'); scaleB(b); }
    },
    mound: { /* höyük, gün batımı */
      sky: function (b) { skyB(b, 'sunset'); sunB(b, 112, 62, 11, '#ffc66a'); },
      a0: function () { var cd = (S.wt * 1.2) % 260; blit(streakSpr(48, 3, '#c6566a'), (((40 - cd + 260) % 260) - 30) * K, 34 * K - 2); blit(streakSpr(60, 2, '#e08a7a'), (((150 - cd + 260) % 260) - 30) * K, 42 * K - 1); },
      back: function (b) { hillsB(b, 0, 120, 124, 7, mix('#5a2a5a', HZ.sunset, 0.5), 2); moundB(b, 134, 13); seaB(b, 62, '#2b3f73', '#34497f', '#27386a', '#5a6fa8', HZ.sunset); },
      a1: function () { waves('mound', 62, '#34497f', '#27386a'); reflect(112, 62, 9, 13, '#ffd98a', '#f7b868'); gull(((S.wt * 7 + 20) % 230) - 20, 42 + Math.sin(S.wt * 1.3) * 3, 0); },
      front: function (b) { dockB(b); counterB(b, 0, 86); potB(b); },
      a2: function () { if (S.steam) { S.potT += 0.016; if (S.potT > 0.18) { S.potT = 0; S.parts.push({ t: 'st', x: 36 + rnd(-5, 5), y: 70, vx: rnd(-3, 3), vy: rnd(-12, -7), life: 0, max: rnd(0.8, 1.4) }); } } }
    },
    mound_dusk: { /* höyük tepesi, alacakaranlık: kazı alanı */
      sky: function (b) { skyB(b, 'sunset', 8); sunB(b, 40, 64, 10, '#ff9a5a'); [[100, 30, 50, 6], [150, 40, 30, 5]].forEach(function (q, i) { b.put(shift(cloudBuf(q[2] * K, q[3] * K, '#e08a7a', '#9a4a6a', i + 9), q[0] * K, q[1] * K)); }); },
      back: function (b) {
        seaB(b, 64, '#24365f', '#2c4070', '#202f55', '#4a5f98', HZ.sunset); moundB(b, 60, 22, true);
      },
      a1: function () { waves('dusk', 64, '#2c4070', '#202f55'); reflect(40, 64, 4, 10, '#ffb070', '#ff9a5a'); },
      front: function (b) {
        groundB(b, 78, '#3a4a30', '#4e6340');
        var p = b.like(); for (var y = 168; y < 188; y++) for (var x = 40; x < 140; x++) { var e = Math.min(x - 40, 139 - x, y - 168, 187 - y); p.set(x, y, e < 2 ? (y < 170 ? '#4a3a24' : '#8a7048') : y < 172 ? '#4e3e26' : (hash(x >> 1, y) < 0.12 ? '#5a4630' : (y - 172) % 6 === 0 ? '#7a6040' : '#6a5436')); }
        b.part(p, 0, 0, 0.5);
        [[38, 162], [140, 162], [38, 186], [140, 186]].forEach(function (q) { b.rect(q[0], q[1], 2, 8, '#8a6a4a'); b.set(q[0], q[1], '#c8a878'); });
        b.line(40, 163, 140, 163, '#e8dcc0', 0.7); b.line(40, 187, 140, 187, '#e8dcc0', 0.5);
      }
    },
    cave: { /* denizin dibi: Şahmeran'ın mağarası */
      sky: function (b) {
        var rp = ramp(['#041a24', '#052330', '#062a3a', '#073242', '#08394a', '#094052', '#0a465a', '#0b4c60'], 40);
        for (var y = 0; y < FH; y++) for (var x = 0; x < FW; x++) b.set(x, y, rpick(rp, y / 224, x, y));
        [[60, 30], [150, 44], [260, 36], [330, 28]].forEach(function (r, i) { for (var y = 0; y < 200; y++) { var x0 = r[0] + y * 0.35, w = r[1] + y * 0.15; for (var x = x0; x < x0 + w; x++) if (BAY[y & 3][Math.floor(x) & 3] < 0.35) b.set(x, y, '#6fe3c8', 0.08 * (1 - y / 200)); } });
        var p = b.like(); hillsB(p, 0, FW, 204, 40, '#0a3a44', 7); b.put(p);
        var q = b.like(); hillsB(q, 0, FW, 204, 22, '#0c3238', 11); b.put(q);
      },
      back: function (b) {
        for (var i = 0; i < 12; i++) {
          var x = ((i * 29 + 7) % W) * K, w = (6 + (i % 3) * 3) * K, h = (14 + (i * 7) % 18) * K, p = b.like();
          for (var y = 0; y < h; y++) { var hw = w / 2 * (1 - Math.pow(y / h, 1.6)); for (var xx = -hw; xx < hw; xx++) p.set(x + w / 2 + xx, y, hash(Math.floor(xx / 2) + i * 9, y >> 2) < 0.2 ? '#04141a' : '#021016'); }
          b.part(p, 0.12, 0.1, 0.4);
        }
        var f = b.like();
        for (var x2 = 0; x2 < FW; x2++) { var top = 200 + Math.round(Math.sin(x2 * 0.08) * 2 + hash(x2 >> 3, 2) * 3); for (var y2 = top; y2 < FH; y2++) f.set(x2, y2, y2 - top < 2 ? '#1a4a44' : (((x2 + y2 * 3) % 23 === 0) ? '#0e3432' : (hash(x2 >> 1, y2 >> 1) < 0.1 ? '#123a36' : '#0a2a2a'))); }
        b.part(f, 0, 0, 0);
        for (var j = 0; j < 20; j++) { var r = b.like(); r.ell((j * 23) % W * K + 8, 198 + (j % 3) * 2, 8, 3, '#123a36'); b.part(r, 0.3, 0.25, 0.5); }
        [[50, 206, '#e8c8b0'], [210, 210, '#d8a8c0'], [330, 204, '#e8d8b8']].forEach(function (s) { var p2 = b.like(); p2.ell(s[0], s[1], 3, 2, s[2]); p2.rect(s[0] - 2, s[1], 1, 2, dark(s[2], 0.3)); p2.rect(s[0] + 1, s[1], 1, 2, dark(s[2], 0.3)); b.part(p2, 0.2, 0.2, 0.6); });
      },
      a1: function () {
        glow(240, 140, 68, '#e4d24a', 0.2 + Math.sin(S.wt * 1.5) * 0.06);
        for (var i = 0; i < 6; i++) { var sx = 10 + i * 30; blit(weedSpr(i % 2, Math.floor(S.wt * 2 + i) % 4), sx * K, (104 - (i % 2) * 4) * K); }
        for (i = 0; i < 8; i++) { var gx = (i * 41 + Math.sin(S.wt + i) * 3) % W, gy = 30 + ((i * 17 + S.wt * 6) % 60); blit(bubbleSpr(), Math.round(gx * K), Math.round((90 - gy % 80) * K)); }
      }
    },
    rocks: { /* fener gecesi: rüzgârlı kayalık */
      sky: function (b) { skyB(b, 'night'); starsB(b, 60, 3); for (var i = 0; i < 25; i++) { var x = (i * 53) % W * K, y = (i * 17) % 50 * K; b.set(x, y, i % 3 ? '#8a8ac8' : '#ffffff'); if (!(i % 3)) { b.set(x + 1, y, '#8a8ac8', 0.6); b.set(x, y + 1, '#8a8ac8', 0.6); } } sunB(b, 160, 20, 6, '#e8e8f8', true); },
      a0: function () { if (RM) return; for (var i = 0; i < 6; i++) if (Math.sin(S.wt * 2 + i * 1.7) > 0.7) F(((i * 97) % W) * K, ((i * 29) % 50) * K, 1, 1, '#ffffff'); },
      back: function (b) { hillsB(b, 0, FW, 132, 8, '#1a1a3a', 5); seaB(b, 66, '#0e1a36', '#152446', '#0a1530', '#2a3a6a', HZ.night); },
      a1: function () { waves('rocks', 66, '#152446', '#0a1530'); reflect(160, 66, 5, 8, '#c8c8e8', '#8a8ac8'); },
      front: function (b) { for (var i = 0; i < 6; i++) { var rx = i * 36 - 6, rh = 18 + (i % 3) * 8; rockFormB(b, rx * K, (102 - rh) * K, 34 * K, i + 1); } },
      a2: function () { if (Math.sin(S.wt * 0.7) > 0.6) for (var i = 0; i < 6; i++) { var x = ((S.wt * 120 + i * 40) % W) * K, y = (40 + i * 9) * K; F(x, y, 20, 1, 'rgba(255,255,255,0.22)'); F(x + 4, y - 1, 10, 1, 'rgba(255,255,255,0.12)'); F(x - 4, y, 4, 1, 'rgba(255,255,255,0.1)'); } }
    },
    ritual: { /* höyüğün dibinde gece: ağıt */
      sky: function (b) { skyB(b, 'night'); starsB(b, 70, 9); for (var i = 0; i < 30; i++) b.set((i * 47) % W * K, (i * 13) % 55 * K, i % 4 ? '#8a8ac8' : '#ffffff'); },
      a0: function () { if (RM) return; for (var i = 0; i < 6; i++) if (Math.sin(S.wt * 1.7 + i * 2.1) > 0.75) F(((i * 61 + 13) % W) * K, ((i * 23) % 55) * K, 1, 1, '#ffffff'); },
      back: function (b) {
        hillsB(b, 0, FW, 123, 10, '#141838', 6);
        var rf = ramp(['#121a20', '#162016', '#1a2418'], 12); for (var y = 122; y < 172; y++) for (var x = 0; x < FW; x++) b.set(x, y, rpick(rf, (y - 122) / 50, x, y));
        moundB(b, 100, 20, true); groundB(b, 86, '#1a2418', '#243020');
      },
      a2: function () {
        var t = S.t, fA = Math.sin(t * 13 + 20) > 0 ? 1 : 0, fB = Math.sin(t * 13 + 176) > 0 ? 1 : 0;
        glow(20 * K + 2, 66 * K, 28, '#ffb454', 0.16); glow(176 * K + 2, 66 * K, 28, '#ffb454', 0.16);
        blit(torchSpr(fA), 20 * K, 70 * K); blit(torchSpr(fB), 176 * K, 70 * K);
        var f = Math.sin(t * 11) > 0 ? 1 : 0;
        glow(96 * K, 96 * K, 56, '#ff8a3c', 0.13 + (f ? 0.03 : 0));
        blit(fireSpr(f), 96 * K, 98 * K);
      }
    },
    dawn_mound: { /* bereket sabahı */
      sky: function (b) { skyB(b, 'morning'); sunB(b, 30, 50, 12, '#fff2b0'); [[60, 18, 40, 9], [140, 26, 34, 8]].forEach(function (q, i) { b.put(shift(cloudBuf(q[2] * K, q[3] * K, '#ffffff', '#d8e4f2', i + 12), q[0] * K, q[1] * K)); }); },
      back: function (b) { hillsB(b, 0, 130, 124, 8, mix('#4a7a6a', HZ.morning, 0.55), 8); moundB(b, 120, 16); seaB(b, 62, '#2f6aa0', '#3a78ae', '#2a5f92', '#9ac8ec', HZ.morning); },
      a1: function () { waves('dawnm', 62, '#3a78ae', '#2a5f92'); reflect(30, 62, 6, 10, '#fff2b0', '#ffffff'); gull(((S.wt * 7 + 20) % 230) - 20, 30 + Math.sin(S.wt * 1.3) * 3, 0); gull(((S.wt * 5 + 110) % 230) - 20, 40, 2); },
      front: function (b) { dockB(b); fishPileB(b, 10, 100, 25, '#8fa9bd'); fishPileB(b, 40, 100, 15, '#5f8f8a'); fishPileB(b, 70, 100, 10, '#a8b6c2'); }
    }
  };
  function shift(p, dx, dy) { p.x0 += Math.round(dx); p.y0 += Math.round(dy); return p; }
  function layer(n, part) { return spr('bg|' + n + '|' + part, 0, 0, FW, FH, function (b) { BGD[n][part](b); }); }
  function drawBG() {
    var n = BGD[S.bg] ? S.bg : 'dock', d = BGD[n];
    blit(layer(n, 'sky'), 0, 0);
    if (d.a0) d.a0();
    if (d.back) blit(layer(n, 'back'), 0, 0);
    if (d.a1) d.a1();
    if (d.front) blit(layer(n, 'front'), 0, 0);
    if (d.a2) d.a2();
  }

  /* ---------------- karakterler (ince sprite: yön, poz, ifade, ağız, eşya anahtarda) ---------------- */
  var INK = '#1a1420';
  var POSE = { idle: [[1, 13], [-1, 13]], reach: [[15, 1], [-1, 13]], hold: [[4, 8], [4, 8]], knees: [[4, 19], [8, 19]], up: [[6, -10], [-2, 13]], bow: [[16, -2], [6, -2]] };
  function armsOf(c, ty, T) {   /* ince, d=1 çerçevesinde (sağa bakan) */
    var sh = -58 - T + ty, p = POSE[c.pose] || POSE.idle;
    return { near: { x0: 16, y0: sh, x1: 16 + p[0][0] * K, y1: sh + p[0][1] * K }, far: { x0: -16, y0: sh, x1: -16 + p[1][0] * K, y1: sh + p[1][1] * K } };
  }
  function buildHuman(b, c, bob, mouth, fl) {
    var p = c.pal, d = c.dir < 0 ? -1 : 1, T = (c.tall || 0) * K, ty = bob - (c.sit ? 4 : 0);
    var skin = c.pale ? mix(p.skin, '#d8e8e8', 0.25) : p.skin, skinD = c.pale ? mix(p.skinD, '#c8d8d8', 0.25) : p.skinD;
    function mx(x, w) { return d > 0 ? x : -x - w; }
    function P(q, x, y, w, h, col, a) { q.rect(mx(x, w), y, w, h, col, a); return q; }
    function Pt(q, x, y, col, a) { q.set(d > 0 ? x : -x - 1, y, col, a); }
    function Pc(q, x, y, r, col) { q.circ(d > 0 ? x : -x - 1, y, r, col); }
    function Pe(q, x, y, rx, ry, col) { q.ell(d > 0 ? x : -x - 1, y, rx, ry, col); }
    function Ps(q, x0, y0, x1, y1, r, col) { q.seg(d > 0 ? x0 : -x0 - 1, y0, d > 0 ? x1 : -x1 - 1, y1, r, col); }
    function Pl(q, x0, y0, x1, y1, col, a) { q.line(d > 0 ? x0 : -x0 - 1, y0, d > 0 ? x1 : -x1 - 1, y1, col, a); }
    var A = armsOf(c, ty, T);
    function arm(a, far) {
      var q = b.like(), cc = far ? dark(p.coat, 0.2) : p.coat, sk = far ? dark(skin, 0.15) : skin;
      var dx = a.x1 - a.x0, dy = a.y1 - a.y0, L = Math.max(1, Math.sqrt(dx * dx + dy * dy)), ex = a.x1 - dx / L * 4, ey = a.y1 - dy / L * 4;
      Ps(q, a.x0, a.y0, ex, ey, 3, cc); Ps(q, ex - dx / L * 2, ey - dy / L * 2, ex, ey, 3, dark(cc, 0.18));
      Pc(q, a.x1, a.y1, 3, sk);
      b.part(q, 0.22, 0.22, 0.55);
    }
    /* 1) uzak kol + sadak (Alp) */
    arm(A.far, true);
    if (c.id === 'a') {
      var qv = b.like(), qy = -76 - T + ty;
      P(qv, -18, qy, 8, 36 + T, '#6a3f24'); P(qv, -18, qy + 8, 8, 2, '#3a2a1a'); P(qv, -18, qy + 26, 8, 2, '#3a2a1a');
      [[-18, '#e8e0c8'], [-15, '#b23a2e'], [-12, '#e8e0c8']].forEach(function (f, i) { P(qv, f[0], qy - 7 + i, 2, 7, f[1]); Pt(qv, f[0] + 1, qy - 8 + i, dark(f[1], 0.2)); });
      b.part(qv, 0.25, 0.25, 0.55);
    }
    /* 2) bacaklar / etek / oturuş */
    var lg = b.like();
    if (c.sit) {
      var rk = b.like(); Pe(rk, -14, -10, 26, 12, '#6d6d7a'); P(rk, -40, -10, 52, 10, '#6d6d7a');
      for (var ri = 0; ri < 14; ri++) Pt(rk, -36 + Math.floor(hash(ri, 4) * 44), -18 + Math.floor(hash(4, ri) * 16), ri % 2 ? '#5a5a66' : '#82828e');
      b.part(rk, 0.25, 0.25, 0.6);
      P(lg, -8, ty - 32, 44, 12, p.pants); P(lg, 24, ty - 20, 12, 18, p.pants); P(lg, 22, -8, 18, 8, '#2b2230'); P(lg, 38, -6, 2, 6, '#2b2230'); P(lg, 24, -8, 14, 1, '#4a3e50');
      b.part(lg, 0.2, 0.22, 0.55);
    } else if (c.skirt) {
      for (var sy = -30; sy < -4; sy++) { var hw = Math.round(16 + (sy + 30) / 26 * 3); lg.rect(-hw, sy, hw * 2, 1, p.coatD); }
      for (var sk2 = -8; sk2 < -4; sk2++) lg.rect(-19, sk2, 38, 1, dark(p.coatD, 0.18));
      for (var dt = -16; dt < 18; dt += 6) lg.set(dt, -6, lite(p.coatD, 0.35));
      [-8, 0, 8].forEach(function (fx) { lg.rect(fx, -24, 1, 14, dark(p.coatD, 0.12)); });
      P(lg, -10, -4, 8, 4, '#2b2230'); P(lg, 2, -4, 9, 4, '#2b2230');
      b.part(lg, 0.2, 0.2, 0.55);
    } else {
      P(lg, -12, -24, 10, 20, p.pants); P(lg, 2, -24, 10, 20, p.pants); P(lg, -12, -24, 24, 4, p.pants);
      P(lg, -13, -6, 12, 6, '#2b2230'); P(lg, 1, -6, 14, 6, '#2b2230'); P(lg, -12, -6, 10, 1, '#4a3e50'); P(lg, 2, -6, 11, 1, '#4a3e50');
      b.part(lg, 0.2, 0.25, 0.55);
    }
    /* 3) gövde */
    var tT = -64 - T + ty, tB = -24 + ty, to = b.like();
    for (var y = tT; y < tB; y++) { var r = y - tT, hw2 = r === 0 ? 13 : r === 1 ? 16 : r < 4 ? 17 : 18; if (tB - y <= 3) hw2 = 19; to.rect(-hw2, y, hw2 * 2, 1, p.coat); }
    to.shade(0.24, 0.26);
    to.rect(-19, tB - 4, 38, 4, p.coatD); to.rect(-19, tB - 4, 38, 1, dark(p.coat, 0.1));
    if (c.id === 'a') {
      for (var gy = 0; gy < 4; gy++) for (var gx = 0; gx < 4; gx++) { var sx = -12 + gx * 8 + (gy % 2) * 2, sy2 = tT + 6 + gy * 7; to.rect(sx, sy2, 3, 3, p.gold); to.set(sx, sy2, '#fff2b0'); to.set(sx + 2, sy2 + 2, dark(p.gold, 0.35)); }
      for (var gy2 = 0; gy2 < 4; gy2++) to.rect(-17, tT + 10 + gy2 * 7, 34, 1, dark(p.coat, 0.18));
      to.rect(-18, -36 + ty, 36, 4, '#3a2a1a'); to.rect(-18, -36 + ty, 36, 1, '#5a4430'); P(to, -2, -37 + ty, 7, 6, p.gold); P(to, 0, -35 + ty, 3, 2, dark(p.gold, 0.4));
      P(to, -18, tT + 1, 8, 4, p.redD); P(to, 10, tT + 1, 8, 4, p.red);
    } else if (c.id === 'v') {
      for (var fx2 = -18; fx2 < 18; fx2++) { var fh = 5 + ((fx2 & 1) ? 1 : 0) + (hash(fx2, 3) > 0.6 ? 1 : 0); to.rect(fx2, tT, 1, fh, fx2 < -12 ? '#8a7a68' : '#6a5a4a'); to.set(fx2, tT + fh, '#4a3e32'); }
      P(to, -1, tT + 6, 2, 14, '#c9a15e'); P(to, 1, tT + 6, 2, 14, '#8a6a30');
      to.circ(d > 0 ? 1 : -2, -40 + ty, 4, '#c9a15e'); to.circ(d > 0 ? 1 : -2, -40 + ty, 2, '#b23a4a'); to.set(d > 0 ? 0 : -3, -42 + ty, '#fff2b0');
      P(to, 4, tT + 6, 2, tB - tT - 10, lite(p.coat, 0.25));
    } else {
      P(to, -6, tT - 2, 12, 4, '#f4ead8'); P(to, -2, tT + 1, 4, 2, skin); P(to, -1, tT + 2, 2, 2, dark(skin, 0.1));
      P(to, 3, tT + 4, 1, tB - tT - 8, dark(p.coat, 0.25));
      for (var bt = tT + 8; bt < tB - 6; bt += 8) P(to, 5, bt, 2, 2, c.id === 'y' ? '#2a3c5a' : lite(p.coatL, 0.3));
      if (c.id === 'y') { P(to, -14, tB - 14, 9, 6, p.coatD); P(to, -14, tB - 14, 9, 1, p.coatL); }
      if (c.id === 'k') { P(to, -14, tT + 12, 8, 1, p.coatD); P(to, -14, tB - 14, 8, 6, p.coatD); }
    }
    to.outline(0.55); b.put(to);
    /* 4) baş */
    var hy = -96 - T + ty + (c.ex === 't' ? 4 : 0), he = b.like(), brow = p.hair;
    he.rect(-5, hy + 26, 10, 6, skinD);
    var hr = [[-11, 22], [-13, 26], [-14, 28]];
    for (var yy = 0; yy < 28; yy++) { var q = yy < 3 ? hr[yy] : yy > 24 ? hr[27 - yy] : hr[2]; he.rect(q[0], hy + yy, q[1], 1, skin); }
    if (c.hat !== 'scarf') P(he, -15, hy + 2, 6, 14, p.hair);
    P(he, -17, hy + 12, 4, 7, skin);
    he.shade(0.2, 0.22);
    for (var j2 = 0; j2 < 3; j2++) he.rect(-12 + j2, hy + 24 + j2, 24 - j2 * 2, 1, mix(skin, skinD, 0.7));
    P(he, -16, hy + 14, 2, 3, skinD);
    b.part(he, 0, 0, 0.55);
    var ey = hy + 14, e1 = -6, e2 = 6, ex = c.ex;
    var F2 = function (x, y2, w, h, col, a) { P(b, x, y2, w, h, col, a); };
    if (ex === 's') { F2(e1 - 1, ey - 2, 6, 6, '#ffffff'); F2(e2 - 1, ey - 2, 6, 6, '#ffffff'); F2(e1 + 2, ey, 3, 3, INK); F2(e2 + 2, ey, 3, 3, INK); F2(e1 - 1, ey - 9, 6, 2, brow); F2(e2 - 1, ey - 9, 6, 2, brow); }
    else if (ex === 'h') { [e1, e2].forEach(function (e) { F2(e - 1, ey + 2, 1, 2, INK); F2(e, ey + 1, 4, 1, INK); F2(e + 4, ey + 2, 1, 2, INK); F2(e - 1, ey - 5, 6, 2, brow); }); F2(-12, ey + 5, 5, 2, '#e0906a', 0.75); F2(10, ey + 5, 4, 2, '#e0906a', 0.75); }
    else if (ex === 't') { [e1, e2].forEach(function (e) { F2(e, ey + 2, 4, 1, INK); F2(e, ey + 1, 4, 1, skinD); }); F2(e1 - 1, ey - 2, 2, 1, brow); F2(e1 + 1, ey - 3, 2, 1, brow); F2(e1 + 3, ey - 4, 2, 1, brow); F2(e2 + 3, ey - 2, 2, 1, brow); F2(e2 + 1, ey - 3, 2, 1, brow); F2(e2 - 1, ey - 4, 2, 1, brow); }
    else {
      [e1, e2].forEach(function (e) { F2(e, ey - 1, 3, 4, INK); F2(e, ey - 1, 1, 1, '#e8f0ff'); });
      if (ex === 'a') { F2(e1 - 1, ey - 6, 2, 1, brow); F2(e1 + 1, ey - 5, 2, 1, brow); F2(e1 + 3, ey - 4, 2, 2, brow); F2(e2 - 1, ey - 4, 2, 2, brow); F2(e2 + 1, ey - 5, 2, 1, brow); F2(e2 + 3, ey - 6, 2, 1, brow); }
      else { F2(e1 - 1, ey - 5, 6, 2, brow); F2(e2 - 1, ey - 5, 6, 2, brow); }
    }
    if (c.pale) { F2(e1 - 1, ey + 4, 5, 1, mix(skin, '#7a6a9a', 0.45)); F2(e2 - 1, ey + 4, 5, 1, mix(skin, '#7a6a9a', 0.45)); }
    F2(2, ey + 5, 3, 3, skinD); F2(2, ey + 5, 1, 1, lite(skin, 0.3));
    if (c.beard) { var bd = b.like(); P(bd, -11, hy + 19, 22, 13, c.beard); P(bd, -7, hy + 32, 14, 5, c.beard); P(bd, -3, hy + 37, 6, 2, c.beard); for (var bs = -9; bs < 10; bs += 3) P(bd, bs, hy + 24 + (bs & 1), 1, 8, dark(c.beard, 0.12)); b.part(bd, 0.15, 0.2, 0.5); }
    if (mouth) { F2(-1, hy + 21, 7, 4, '#5a1020'); F2(0, hy + 21, 5, 1, '#f4ece0'); F2(1, hy + 24, 4, 1, '#c0505a'); }
    else if (ex === 'h') { F2(-2, hy + 22, 1, 1, '#7a3a30'); F2(-1, hy + 23, 7, 1, '#7a3a30'); F2(6, hy + 22, 1, 1, '#7a3a30'); }
    else if (ex === 's') F2(0, hy + 22, 4, 3, '#5a1020');
    else F2(-1, hy + 23, 6, 1, '#7a3a30');
    if (c.must) { F2(-6, hy + 19, 15, 2, p.hair); F2(-7, hy + 20, 1, 2, p.hair); F2(9, hy + 20, 1, 2, p.hair); F2(-5, hy + 19, 13, 1, lite(p.hair, 0.15)); }
    /* 5) şapka / başörtüsü / kalpak */
    var ht = b.like();
    if (c.hat === 'kalpak') {
      var mu = b.like(); P(mu, -6, hy + 18, 16, 3, p.hair); P(mu, -7, hy + 20, 3, 6, p.hair); P(mu, 8, hy + 20, 3, 6, p.hair); P(mu, -3, hy + 27, 10, 6, '#4a3222'); P(mu, -1, hy + 33, 6, 2, '#4a3222'); b.part(mu, 0.15, 0.15, 0.5);
      if (mouth) F2(-1, hy + 22, 7, 3, '#5a1020');
      var br = b.like(); P(br, -18, hy + 10, 4, 22, p.hair); P(br, 14, hy + 10, 4, 22, p.hair); P(br, -18, hy + 26, 4, 2, p.gold); P(br, 14, hy + 26, 4, 2, p.gold); P(br, -17, hy + 32, 2, 3, p.hair); P(br, 15, hy + 32, 2, 3, p.hair); b.part(br, 0.15, 0.2, 0.5);
      for (var ky = hy - 22; ky < hy + 6; ky++) { var t2 = (ky - (hy - 22)) / 28, hw3 = Math.round(3 + Math.pow(t2, 0.8) * 14), lean = Math.round((1 - t2) * (1 - t2) * -5); P(ht, -hw3 + lean, ky, hw3 * 2, 1, (ky - hy) % 7 === 0 ? p.redD : p.red); }
      P(ht, -16, hy + 4, 6, 10, p.redD); P(ht, 10, hy + 4, 6, 10, p.redD); P(ht, -16, hy + 13, 6, 1, p.gold); P(ht, 10, hy + 13, 6, 1, p.gold);
      ht.shade(0.22, 0.25);
      P(ht, -17, hy + 2, 34, 3, p.gold); for (var gk = -16; gk < 17; gk += 4) P(ht, gk, hy + 3, 2, 1, p.redD);
      P(ht, -3 - 5, hy - 24, 4, 3, p.gold);
    } else if (c.hat === 'scarf') {
      P(b, -10, hy + 4, 20, 4, p.hair);
      for (var sy3 = hy - 7; sy3 < hy + 6; sy3++) { var t3 = (sy3 - (hy - 7)) / 13, hw4 = Math.round(10 + Math.sqrt(t3) * 8); ht.rect(-hw4, sy3, hw4 * 2, 1, p.cap); }
      P(ht, -18, hy + 6, 6, 22, p.cap); P(ht, 13, hy + 6, 5, 22, p.cap); P(ht, -18, hy + 26, 36, 6, p.cap); P(ht, 6, hy + 30, 6, 6, p.capD);
      ht.shade(0.22, 0.25);
      for (var dx2 = -16; dx2 < 17; dx2 += 5) for (var dy2 = hy - 4; dy2 < hy + 32; dy2 += 5) { var ox = dx2 + (((dy2 - hy) / 5) & 1) * 2; if (ht.al(ox, dy2) > 200 && !(ox > -12 && ox < 12 && dy2 > hy + 5 && dy2 < hy + 26)) ht.set(ox, dy2, '#f4e9d2'); }
    } else if (c.hat === 'flat') {
      for (var fy = hy - 7; fy < hy + 4; fy++) { var t4 = (fy - (hy - 7)) / 11, l0 = Math.round(-15 - t4 * 2), r0 = Math.round(8 + t4 * 7); P(ht, l0, fy, r0 - l0, 1, p.cap); }
      P(ht, 6, hy + 2, 14, 4, p.capD); P(ht, 8, hy + 2, 12, 1, lite(p.capD, 0.2));
      ht.shade(0.22, 0.25); P(ht, -16, hy + 1, 26, 1, p.capD); Pt(ht, -2, hy - 6, lite(p.cap, 0.3));
    } else if (c.hat === 'fur') {
      for (var uy = hy - 14; uy < hy + 4; uy++) for (var ux = -18; ux < 18; ux++) { if (uy < hy - 11 && hash(ux, 77) * 3 > uy - (hy - 14)) continue; ht.set(ux, uy, ((ux + 40) % 3 === 0) ? '#7a6454' : ((ux + uy) & 1 ? '#5a4636' : '#4e3c2e')); }
      ht.shade(0.18, 0.22); Pc(ht, 6, hy - 6, 2, '#c9a15e'); Pt(ht, 6, hy - 6, '#b23a4a'); Pt(ht, 6, hy - 11, '#c9a15e'); Pt(ht, 6, hy - 12, '#c9a15e');
    } else {
      P(b, -14, hy + 7, 4, 7, p.hair); P(b, 10, hy + 7, 4, 7, p.hair);
      for (var cy2 = hy - 7; cy2 < hy + 6; cy2++) { var t5 = (cy2 - (hy - 7)) / 13, hw5 = Math.round(11 + Math.sqrt(t5) * 5.5); ht.rect(-hw5, cy2, hw5 * 2, 1, p.cap); }
      ht.shade(0.24, 0.25);
      ht.rect(-16, hy + 2, 33, 4, p.capD); ht.rect(-16, hy + 2, 33, 1, lite(p.capD, 0.15)); P(ht, 10, hy + 4, 10, 3, p.capD); Pc(ht, 0, hy - 8, 2, p.capD);
    }
    ht.outline(0.55); b.put(ht);
    /* 6) yakın kol + eşya */
    arm(A.near, false);
    var nx = A.near.x1, ny = A.near.y1, it = b.like();
    if (c.item === 'bowl') { var bx = nx + 4, by2 = ny - 4; for (var wy = 0; wy < 10; wy++) { var ww = Math.round(9 - Math.pow(wy / 10, 2) * 5); P(it, bx - ww, by2 + wy, ww * 2, 1, wy < 2 ? '#d88a4a' : wy > 7 ? '#8a4a20' : '#b5652e'); } P(it, bx - 8, by2 - 3, 16, 3, '#e8d9b0'); Pt(it, bx - 3, by2 - 2, '#c06a3a'); Pt(it, bx + 2, by2 - 2, '#c06a3a'); Pt(it, bx, by2 - 3, '#f4ead0'); it.shade(0.25, 0.2); b.part(it, 0, 0, 0.55); }
    if (c.item === 'bow') {
      var bwx = nx, tipY = 28;
      for (var yb = -tipY; yb <= tipY; yb++) { var u = yb / tipY, xo = Math.round(7 * (1 - u * u)) - (Math.abs(u) > 0.88 ? Math.round((Math.abs(u) - 0.88) * 30) : 0); P(it, bwx + xo, ny + yb, 3, 1, Math.abs(yb) < 4 ? '#3a2a1a' : (yb % 9 === 0 ? '#a8743a' : '#8a5a2a')); }
      it.shade(0.25, 0.2); b.part(it, 0, 0, 0.55);
      var tipX = bwx - 3, pull = c.pose === 'bow' ? A.far.x1 : tipX;
      Pl(b, tipX, ny - tipY + 1, pull, ny, '#e8e0c8'); Pl(b, tipX, ny + tipY - 1, pull, ny, '#e8e0c8');
      if (c.pose === 'bow') { P(b, pull, ny, bwx - pull + 12, 1, '#c9a15e'); P(b, bwx + 10, ny - 2, 4, 5, '#e4b94a'); P(b, bwx + 14, ny - 1, 2, 3, '#fff2b0'); P(b, pull - 3, ny - 2, 4, 1, '#e8e0c8'); P(b, pull - 3, ny + 1, 4, 1, '#b23a2e'); }
    }
    if (c.item === 'lantern') { var lx = nx - 6, ly = ny; P(it, lx + 3, ly - 3, 6, 1, '#3c4650'); P(it, lx + 2, ly - 2, 1, 2, '#3c4650'); P(it, lx + 9, ly - 2, 1, 2, '#3c4650'); P(it, lx, ly, 12, 3, '#2a3038'); P(it, lx + 1, ly + 3, 10, 10, '#3c4650'); P(it, lx + 2, ly + 4, 8, 8, fl ? '#ffd98a' : '#ffb454'); P(it, lx + 4, ly + 6, 4, 5, fl ? '#fff6d0' : '#ffe28a'); P(it, lx + 5, ly + 4, 2, 2, '#ff8a3c'); P(it, lx, ly + 13, 12, 3, '#2a3038'); b.part(it, 0, 0, 0.5); }
    if (c.item === 'kopuz') { var kx = nx - 4; Pe(it, kx + 6, ny + 1, 7, 5, '#8a5a2a'); P(it, kx + 1, ny + 2, 11, 3, '#e8d8b0'); Pc(it, kx + 6, ny - 1, 1, '#3a2010'); Ps(it, kx + 11, ny - 3, kx + 24, ny - 16, 1, '#6a3f24'); P(it, kx + 23, ny - 21, 4, 5, '#5a3018'); Pt(it, kx + 22, ny - 20, '#e8e0c8'); Pt(it, kx + 27, ny - 18, '#e8e0c8'); it.shade(0.25, 0.2); b.part(it, 0, 0, 0.55); Pl(b, kx + 6, ny, kx + 24, ny - 17, '#f4ead8', 0.8); }
    if (c.item === 'purse') { var px2 = nx - 6, py2 = ny; P(it, px2 + 3, py2, 6, 3, '#6a4a2a'); Pe(it, px2 + 6, py2 + 8, 6, 5, '#6a4a2a'); it.shade(0.25, 0.25); P(it, px2 + 2, py2 + 2, 8, 1, '#e4b94a'); Pt(it, px2 + 9, py2 + 3, '#e4b94a'); Pt(it, px2 + 4, py2 + 6, '#fff2b0', 0.6); b.part(it, 0, 0, 0.55); }
  }
  function drawHuman(c) {
    var cx = Math.round(c.x * K), by = BY * K, bob = (Math.sin(S.t * 2.6 + c.ph) > 0.4) ? -1 : 0;
    var talk = S.talk === c.id && Math.floor(S.t * 12) % 2 === 0, chew = c.chew && Math.floor(S.t * 6) % 2 === 0, m = talk || chew ? 1 : 0;
    var fl = c.item === 'lantern' ? (Math.sin(S.t * 9) > 0 ? 1 : 0) : 0, d = c.dir < 0 ? -1 : 1;
    var key = ['hu', c.id, c.pose, d, c.sit ? 1 : 0, c.ex, c.item || '', m, fl, bob].join('|');
    blit(shadowSpr(c.sit ? 30 : 22), cx, by);
    blit(spr(key, -72, -160, 72, 10, function (b) { buildHuman(b, c, bob, m, fl); }), cx, by);
    if (c.item === 'lantern') { var A = armsOf(c, bob - (c.sit ? 4 : 0), (c.tall || 0) * K); glow(cx + d * A.near.x1, by + A.near.y1 + 8, 28, '#ffd98a', 0.16); }
  }
  /* Şahmeran: pullu kuyruk (24 kare), yarı kadın gövde, taç */
  function tailSpr(f) {
    return spr('sahT|' + f, -96, -40, 92, 12, function (b) {
      var ph = f / 24 * Math.PI * 2, p = b.like();
      for (var X = -86; X < 82; X++) {
        var u = (X + 80) / 6, yc = -11 + Math.sin(ph + u * 0.5) * 6, e = X < 0 ? Math.min(1, (X + 86) / 50) : Math.min(1, (82 - X) / 36), th2 = Math.max(4, Math.round(14 * Math.pow(e, 0.6)));
        if (X < -70) yc -= (-70 - X) * 0.6;
        var top = Math.round(yc - th2 / 2);
        for (var j = 0; j < th2; j++) {
          var v = j / th2, Y = top + j, c;
          if (v >= 0.68) c = ((X + 400) % 5 === 0) ? '#c4a44a' : (v > 0.86 ? '#d8b85a' : '#e4c86a');
          else { var row = Math.floor((Y + 40) / 3), cx2 = ((X + 400 + (row % 2) * 3) % 6); c = cx2 === 0 || (Y + 40) % 3 === 2 ? '#22704a' : cx2 < 3 && (Y + 40) % 3 === 0 ? '#3fa56a' : '#2f8a5a'; if (v < 0.14) c = '#4ab87a'; if (v < 0.3 && Math.floor(u) % 2 === 0 && th2 > 8 && ((X + 400) % 6) < 2) c = '#e4b94a'; }
          p.set(X, Y, c);
        }
      }
      b.part(p, 0, 0.12, 0.6);
    });
  }
  function shahSpr(m) {
    return spr('sahB|' + m, -40, -122, 40, 4, function (b) {
      var hair = b.like(), hy = -92, hx = -14;
      for (var y = hy - 2; y < hy + 44; y++) { var wv = Math.round(Math.sin(y * 0.2) * 1.5), w2 = y < hy + 6 ? 15 : 9; hair.rect(-19 + wv, y, w2, 1, '#1a3a2a'); hair.rect(19 - w2 + wv, y, w2, 1, '#1a3a2a'); }
      hair.rect(-15, hy - 3, 30, 8, '#1a3a2a');
      for (var s = 0; s < 6; s++) hair.rect(-17 + s * 6 + (s > 2 ? 4 : 0), hy + 8, 1, 30, '#2e5a42');
      b.part(hair, 0.15, 0.2, 0.55);
      var ar = b.like(); ar.seg(-20, -54, -24, -34, 4, '#2f8a5a'); ar.seg(20, -54, 24, -34, 4, '#2f8a5a'); ar.rect(-28, -34, 9, 2, '#e4b94a'); ar.rect(20, -34, 9, 2, '#e4b94a'); ar.circ(-24, -28, 4, '#d9b48a'); ar.circ(24, -28, 4, '#d9b48a'); b.part(ar, 0.22, 0.22, 0.55);
      var to = b.like();
      for (var y2 = -62; y2 < -6; y2++) { var t = (y2 + 62) / 56, hw = Math.round(t < 0.6 ? 15 - t * 6 : 11.4 + (t - 0.6) * 12); to.rect(-hw, y2, hw * 2, 1, '#2f8a5a'); }
      for (var y3 = -60; y3 < -6; y3 += 3) for (var x3 = -16; x3 < 17; x3 += 4) { var ox = x3 + ((y3 / 3) & 1) * 2; if (to.al(ox, y3)) { to.set(ox, y3, '#22704a'); to.set(ox + 1, y3 - 1, '#3fa56a'); } }
      to.shade(0.25, 0.25);
      for (var i = 0; i < 7; i++) to.circ(-12 + i * 4, -56 + Math.round(Math.abs(i - 3) * -0.7), 1, '#e4b94a');
      to.circ(0, -52, 2, '#6fe3c8'); to.set(-1, -53, '#e8fff8');
      for (var i2 = 0; i2 < 4; i2++) { to.rect(-7 + i2 * 4, -44, 2, 2, '#e4b94a'); to.set(-7 + i2 * 4, -44, '#fff2b0'); }
      to.rect(-12, -28, 24, 3, '#e4b94a'); to.rect(-12, -28, 24, 1, '#fff2b0');
      to.outline(0.55); b.put(to);
      var he = b.like(); he.rect(-5, hy + 26, 10, 6, '#c49a70');
      var hr = [[-11, 22], [-13, 26], [-14, 28]];
      for (var yy = 0; yy < 28; yy++) { var q = yy < 3 ? hr[yy] : yy > 24 ? hr[27 - yy] : hr[2]; he.rect(q[0], hy + yy, q[1], 1, '#d9b48a'); }
      he.shade(0.2, 0.2); he.rect(-12, hy + 25, 24, 2, '#c49a70');
      b.part(he, 0, 0, 0.55);
      [-9, 5].forEach(function (e) { b.rect(e, hy + 12, 5, 4, '#1a5a3a'); b.rect(e + 1, hy + 12, 3, 4, '#3fa56a'); b.rect(e + 2, hy + 12, 1, 4, '#0a1a10'); b.set(e + 1, hy + 12, '#e8fff8'); b.rect(e, hy + 9, 5, 1, '#1a3a2a'); });
      b.rect(-1, hy + 17, 2, 3, '#c49a70'); b.rect(-12, hy + 19, 4, 2, '#e0907a', 0.5); b.rect(8, hy + 19, 4, 2, '#e0907a', 0.5);
      if (m) { b.rect(-3, hy + 21, 6, 3, '#5a1020'); b.rect(-2, hy + 23, 4, 1, '#c0505a'); } else { b.rect(-3, hy + 22, 6, 1, '#8a4a40'); b.rect(-2, hy + 23, 4, 1, '#b06a5a'); }
      var cr = b.like(); cr.rect(-13, hy - 10, 26, 6, '#e4b94a'); [[-11, 6], [-1, 8], [9, 6]].forEach(function (k) { for (var j = 0; j < k[1]; j++) cr.rect(k[0] - (j < 2 ? 0 : 1), hy - 10 - k[1] + j, j < 2 ? 2 : 4, 1, '#e4b94a'); });
      cr.shade(0.3, 0.25); cr.rect(-13, hy - 7, 26, 1, '#b8902a'); cr.circ(0, hy - 13, 2, '#6fe3c8'); cr.set(-1, hy - 14, '#e8fff8'); cr.set(-10, hy - 7, '#6fe3c8'); cr.set(10, hy - 7, '#6fe3c8');
      b.part(cr, 0, 0, 0.55);
    });
  }
  function drawShahmeran(c) {
    var cx = Math.round(c.x * K), by = (BY - 4) * K, t = S.t;
    glow(cx, by - 60, 60, '#6fe3c8', 0.14 + Math.sin(t * 2) * 0.05);
    blit(tailSpr(Math.floor(((t * 1.4) % (Math.PI * 2)) / (Math.PI * 2) * 24) % 24), cx, by);
    blit(shahSpr(S.talk === 's' && Math.floor(t * 12) % 2 ? 1 : 0), cx, by);
  }
  function drawDolphin(c) {
    var x = Math.round(c.x * K), y = Math.round((c.y + Math.sin(S.t * 3) * 2) * K);
    blit(spr('dol|' + (c.net ? 1 : 0), -40, -24, 40, 20, function (b) {
      var p = b.like(), fin = b.like();
      fin.rect(-4, -18, 4, 3, '#5a7aa0'); fin.rect(-5, -15, 7, 3, '#5a7aa0'); fin.rect(-6, -12, 9, 3, '#5a7aa0'); fin.rect(-2, -20, 2, 2, '#5a7aa0');
      fin.rect(-36, -12, 5, 4, '#5a7aa0'); fin.rect(-33, -8, 5, 3, '#5a7aa0'); fin.rect(-36, 6, 5, 4, '#5a7aa0'); fin.rect(-33, 3, 5, 3, '#5a7aa0');
      b.part(fin, 0.2, 0.2, 0.55);
      for (var X = -30; X < 22; X++) { var t = (X + 30) / 52, hh = Math.round(Math.sin(Math.PI * Math.pow(t, 0.75)) * 7) + 2; for (var y2 = -hh; y2 < hh; y2++) p.set(X, y2, y2 > hh * 0.35 ? '#c8d8e8' : y2 < -hh * 0.55 ? '#7a9ac0' : '#6a8ab0'); }
      p.rect(20, -2, 12, 4, '#6a8ab0'); p.rect(20, 1, 12, 1, '#c8d8e8'); p.rect(14, -9, 8, 4, '#7a9ac0');
      p.shade(0.2, 0.2); p.rect(22, 1, 9, 1, '#4a5a7a'); p.rect(14, -3, 3, 3, INK); p.set(14, -3, '#ffffff'); p.rect(0, 2, 8, 3, '#5a7aa0');
      b.part(p, 0, 0, 0.55);
      if (c.net) { for (var i = 0; i < 12; i++) b.rect(-28 + i * 5, -14, 1, 28, '#c9b183'); b.rect(-28, -8, 60, 1, '#c9b183'); b.rect(-28, 6, 60, 1, '#c9b183'); }
    }), x, y);
  }
  function drawChars() {
    ['s', 'd', 'a', 'v', 't', 'k', 'h', 'y'].forEach(function (k) {
      var c = C[k]; if (!c.vis) return;
      if (k === 's') drawShahmeran(c); else if (k === 'd') drawDolphin(c); else drawHuman(c);
    });
  }
  function drawGlint() {
    var g = S.glint; if (!g) return;
    var k = Math.sin(S.t * 6) > 0 ? 1 : 0, gx = g.x * K, gy = g.y * K;
    blit(spr('glint', -8, -10, 9, 8, function (b) {
      var p = b.like(); for (var j = 0; j < 9; j++) { var hw = Math.round(1 + j * 0.6); p.rect(-hw, -6 + j, hw * 2 + 1, 1, '#e4b94a'); }
      p.rect(-1, 3, 3, 3, '#b8902a'); p.shade(0.35, 0.25); p.rect(0, -5, 1, 8, '#fff2b0'); b.part(p, 0, 0, 0.55);
    }), gx, gy);
    if (k) { glow(gx, gy - 2, 10, '#fff2b0', 0.35); F(gx - 9, gy - 3, 4, 1, '#ffffff'); F(gx - 8, gy - 4, 2, 3, '#ffffff'); F(gx + 7, gy - 9, 3, 1, '#ffffff'); F(gx + 8, gy - 10, 1, 3, '#ffffff'); }
  }
  function drawParts() {
    S.parts.forEach(function (p) {
      var k = p.life / p.max; ctx.globalAlpha = Math.max(0, 0.6 * (1 - k));
      var x = Math.round(p.x * K), y = Math.round(p.y * K);
      if (p.t === 'd') { var c = p.c || '#eadcc3'; F(x + 1, y, 3, 5, c); F(x, y + 1, 5, 3, c); F(x + 1, y + 1, 1, 1, '#ffffff'); }
      else { var s = k < 0.4 ? 3 : 5; F(x, y, s, s - 1, p.c || '#ffffff'); F(x + 1, y - 1, s - 2, 1, p.c || '#ffffff'); }
      ctx.globalAlpha = 1;
    });
  }
  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    drawBG(); drawChars(); drawGlint(); drawParts();
    if (S.light > 0.01) { ctx.globalAlpha = S.light; F(0, 0, FW, FH, '#fff6d0'); ctx.globalAlpha = 1; }
    var z = S.cam.z, sw = W / z, sh = H / z;
    var cx = Math.min(Math.max(S.cam.x, sw / 2), W - sw / 2), cy = Math.min(Math.max(S.cam.y, sh / 2), H - sh / 2);
    var sx = cx - sw / 2, sy = cy - sh / 2, sk = RM ? 0.25 : 1;
    if (S.shake > 0.001) { sx += (Math.random() - 0.5) * S.shake * 6 * sk; sy += (Math.random() - 0.5) * S.shake * 6 * sk; }
    sx = Math.round(clamp(sx, 0, W - sw) * K); sy = Math.round(clamp(sy, 0, H - sh) * K);
    o.imageSmoothingEnabled = false; o.drawImage(wc, sx, sy, sw * K, sh * K, 0, 0, OW, OH);
    var bh = Math.round(S.bars * OH * 0.1); if (bh > 0) { o.fillStyle = '#000'; o.fillRect(0, 0, OW, bh); o.fillRect(0, OH - bh, OW, bh); }
    if (S.flash > 0.01 && !RM) { o.globalAlpha = Math.min(1, S.flash); o.fillStyle = '#fff'; o.fillRect(0, 0, OW, OH); o.globalAlpha = 1; }
  }

  /* ---------------- sahne durumu ---------------- */
  var S = null, C = null;
  function freshState() {
    S = { t: 0, wt: 0, cam: { x: 96, y: 60, z: 1 }, tgt: { x: 96, y: 60, z: 1 }, bars: 0, barsT: 0, shake: 0, flash: 0, parts: [], talk: null, bg: 'dock', steam: false, potT: 0, chewT: 0, light: 0, glint: null, tide: 0 };
    C = {
      y: { id: 'y', x: 70, dir: 1, ph: 0, ex: 'n', pose: 'idle', vis: false, pal: { skin: '#e0a673', skinD: '#c48558', hair: '#2b2b3a', coat: '#e8b73a', coatD: '#c4941f', coatL: '#f7d36a', pants: '#2a3c5a', cap: '#2a4f8f', capD: '#1f3a6c' }, hat: 'cap' },
      a: { id: 'a', x: 130, dir: -1, ph: 1.9, ex: 't', pose: 'knees', vis: false, sit: true, tall: 4, hat: 'kalpak', pal: { skin: '#c9935f', skinD: '#a8744a', hair: '#2a1c14', coat: '#7a5a3a', coatD: '#5a4029', coatL: '#946c46', pants: '#3a3326', red: '#b23a2e', redD: '#8a2a20', gold: '#e4b94a' } },
      h: { id: 'h', x: 40, dir: 1, ph: 0.7, ex: 'n', pose: 'idle', vis: false, hat: 'scarf', skirt: true, pal: { skin: '#e3ad7c', skinD: '#c48f60', hair: '#8a8a8a', coat: '#7a3a6a', coatD: '#5a2a4e', coatL: '#955084', pants: '#4a2a3e', cap: '#c8553d', capD: '#a4402c' } },
      k: { id: 'k', x: 150, dir: -1, ph: 2.4, ex: 'n', pose: 'idle', vis: false, hat: 'flat', must: true, pal: { skin: '#d49a68', skinD: '#b07b4e', hair: '#bdbdbd', coat: '#3f5a4a', coatD: '#2e4437', coatL: '#557563', pants: '#2c2c34', cap: '#4a4038', capD: '#322a24' } },
      t: { id: 't', x: 110, dir: -1, ph: 1.1, ex: 'n', pose: 'idle', vis: false, hat: 'flat', beard: '#eeeeee', pal: { skin: '#cf9a6c', skinD: '#ad7a50', hair: '#eeeeee', coat: '#5a4a3a', coatD: '#403428', coatL: '#71604c', pants: '#2c2c34', cap: '#2a3240', capD: '#1c222c' } },
      v: { id: 'v', x: 150, dir: -1, ph: 0.3, ex: 'n', pose: 'idle', vis: false, hat: 'fur', tall: 3, pale: true, pal: { skin: '#e8cdb2', skinD: '#c9ab8e', hair: '#3a3030', coat: '#2a3050', coatD: '#1c2038', coatL: '#3c4468', pants: '#1c1c28', cap: '#5a4636', capD: '#3e2f22' } },
      s: { id: 's', x: 120, vis: false, ph: 0 },
      d: { id: 'd', x: 120, y: 80, vis: false, ph: 0 }
    };
  }

  /* ---------------- akış ---------------- */
  var el = {}, mode = 'idle', SEQ = null, TY = { on: false, text: '', i: 0, acc: 0, delay: 0.03, who: 'n' }, MG = null, raf = 0, last = 0, DAY = null, CTX = null, onDone = null, CFG = null;
  var WHO = {
    n: [{ tr: 'ANLATICI', en: 'NARRATOR' }, '#3a2b58', '#f6e9d3'], y: [{ tr: 'SEN', en: 'YOU' }, '#ffd166', '#3a2605'],
    a: [{ tr: 'ALP ER TUNGA', en: 'ALP ER TUNGA' }, '#e4b94a', '#2a1c14'], h: [{ tr: 'HACER TEYZE', en: 'AUNT HACER' }, '#c8553d', '#fff'],
    k: [{ tr: 'KALENDER', en: 'KALENDER' }, '#557563', '#fff'], t: [{ tr: 'TEMEL DEDE', en: 'GRANDPA TEMEL' }, '#8a7a5a', '#fff'],
    s: [{ tr: 'ŞAHMERAN', en: 'SHAHMERAN' }, '#2f8a5a', '#fff2b0'], v: [{ tr: 'HASTA VEZİR', en: 'THE SICK VIZIER' }, '#2a3050', '#e8cdb2'],
    d: [{ tr: 'YUNUS', en: 'DOLPHIN' }, '#6a8ab0', '#fff']
  };
  /* isimler: koy halkı ilk karşılaşmada "?????"; kendini tanıttığı (ya da biri adını söylediği) satırda açılır */
  var NAMED = { a: 1, h: 1, k: 1, t: 1, s: 1, v: 1 };
  function learn(list) { String(list).split(',').forEach(function (k) { if (NAMED[k]) CTX.known[k] = 1; }); }
  function $(id) { return el[id]; }
  function build() {
    if (!document.getElementById('hkstCss')) { var st = document.createElement('style'); st.id = 'hkstCss'; st.textContent = CSS; document.head.appendChild(st); }
    ROOT = document.createElement('div'); ROOT.className = 'hkst'; ROOT.id = 'hkStory';
    ROOT.innerHTML = '<div class="app"><div class="stage" data-k="stage"><canvas data-k="cv" width="960" height="600"></canvas>' +
      '<div class="hud" data-k="hud"><span data-k="berL"></span> <span class="segs" data-k="segs"></span></div><button class="skip" data-k="skip"></button>' +
      '<div class="ov" data-k="ov"><small data-k="ovk"></small><h2 data-k="ovh"></h2></div></div>' +
      '<div class="panel" data-k="panel"><div data-k="dlg"><div class="who" data-k="who"></div><div class="txt" data-k="txt"></div><div class="nx" data-k="nx" hidden>▼</div></div>' +
      '<div data-k="mini" hidden></div><div data-k="result" hidden></div></div></div>';
    Array.prototype.forEach.call(ROOT.querySelectorAll('[data-k]'), function (n) { el[n.getAttribute('data-k')] = n; });
    document.body.appendChild(ROOT);
    out = el.cv; o = out.getContext('2d'); wc = document.createElement('canvas'); wc.width = FW; wc.height = FH; ctx = wc.getContext('2d'); ctx.imageSmoothingEnabled = false;
    el.stage.addEventListener('click', tap); el.dlg.addEventListener('click', tap);
    el.skip.addEventListener('click', function (e) { e.stopPropagation(); skip(); });
    window.addEventListener('resize', fit);
    document.addEventListener('keydown', onKey);
  }
  function destroy() {
    running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', fit);
    if (MG && MG.stop) MG.stop(); MG = null;
    if (ROOT && ROOT.parentNode) ROOT.parentNode.removeChild(ROOT); ROOT = null; el = {};
  }
  function onKey(e) {
    if (!running) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (mode === 'dlg') { e.preventDefault(); tap(); }
      else if (mode === 'mini' && MG && MG.key) { e.preventDefault(); MG.key(e.code); }
    } else if (mode === 'mini' && MG && MG.key) MG.key(e.code, e.key);
  }
  function showPanel(n) { ['dlg', 'mini', 'result'].forEach(function (id) { el[id].hidden = id !== n; }); el.skip.hidden = !(n === 'dlg' || n === 'mini'); }
  function hud(from) {
    var b = CTX.ber, h = ''; for (var i = 0; i < 10; i++) h += '<i class="' + (i < b ? 'on' : '') + (from !== undefined && ((i >= from && i < b) || (i < from && i >= b)) ? ' new' : '') + '"></i>';
    el.segs.innerHTML = h; el.berL.textContent = tx(UI.ber);
  }
  function say(w, t) {
    var m = WHO[w] || WHO.n; el.who.textContent = NAMED[w] && !CTX.known[w] ? '?????' : tx(m[0]); el.who.style.background = m[1]; el.who.style.color = m[2];
    TY = { on: true, text: t, i: 0, acc: 0, delay: 0.03, who: w }; S.talk = w === 'n' ? null : w; el.txt.textContent = ''; el.nx.hidden = true;
  }
  function endTyping() { TY.on = false; S.talk = null; el.nx.hidden = false; el.txt.textContent = TY.text; }
  function play(list, end) { SEQ = { list: list, i: -1, end: end }; next(); }
  function next() { if (!SEQ) return; SEQ.i++; if (SEQ.i >= SEQ.list.length) { var e = SEQ.end; SEQ = null; if (e) e(); return; } step(SEQ.list[SEQ.i]); }
  function setCam(a, cut) { S.tgt.x = a[0]; S.tgt.y = a[1]; S.tgt.z = a[2]; if (cut) { S.cam.x = a[0]; S.cam.y = a[1]; S.cam.z = a[2]; } }
  function step(s) {
    if (typeof s === 'function') { s = s(CTX); if (!s) { next(); return; } }
    mode = 'dlg'; showPanel('dlg');
    if (s.bg) S.bg = s.bg;
    if (s.show) s.show.split(',').forEach(function (k) { if (C[k]) C[k].vis = true; });
    if (s.hide) s.hide.split(',').forEach(function (k) { if (C[k]) C[k].vis = false; });
    if (s.pos) for (var k in s.pos) if (C[k]) { if (typeof s.pos[k] === 'number') C[k].x = s.pos[k]; else { C[k].x = s.pos[k][0]; if (s.pos[k][1] !== undefined) C[k].dir = s.pos[k][1]; } }
    if (s.cam) setCam(s.cam, s.cut);
    if (s.ex) for (var e in s.ex) if (C[e]) C[e].ex = s.ex[e];
    if (s.p) for (var q in s.p) if (C[q]) C[q].pose = s.p[q];
    if (s.it) for (var r in s.it) if (C[r]) C[r].item = s.it[r] || null;
    if (s.sit) for (var u in s.sit) if (C[u]) C[u].sit = !!s.sit[u];
    if (s.fx) s.fx.split(',').forEach(function (f) { if (FX[f]) FX[f](); });
    if (s.learn) learn(s.learn);
    say(s.w || 'n', tx(s.t));
  }
  function tap() { if (mode !== 'dlg') return; if (TY.on) { TY.i = TY.text.length; endTyping(); } else next(); }
  function skip() {
    if (mode === 'dlg' && SEQ) { TY.on = false; S.talk = null; var list = SEQ.list, e = SEQ.end; for (var i = SEQ.i + 1; i < list.length; i++) applyQuiet(list[i]); SEQ = null; if (e) e(); }
    else if (mode === 'mini' && MG) MG.finish(true);
  }
  function applyQuiet(s) { if (typeof s === 'function') s = s(CTX); if (!s) return; if (s.learn) learn(s.learn); if (s.bg) S.bg = s.bg; if (s.show) s.show.split(',').forEach(function (k) { if (C[k]) C[k].vis = true; }); if (s.hide) s.hide.split(',').forEach(function (k) { if (C[k]) C[k].vis = false; }); }
  var FX = {
    shake: function () { S.shake = 0.6; }, flash: function () { S.flash = 0.7; }, ding: function () { sfx('ding'); }, kopuz: function () { sfx('kopuz'); S.shake = 0.2; },
    steam: function () { S.steam = true; }, nosteam: function () { S.steam = false; }, bars: function () { S.barsT = 1; }, nobars: function () { S.barsT = 0; },
    eat: function () { C.a.chew = true; }, noeat: function () { C.a.chew = false; }, splash: function () { sfx('splash'); for (var i = 0; i < 14; i++) S.parts.push({ t: 'd', x: C.d.x + rnd(-10, 10), y: C.d.y - 4, vx: rnd(-20, 20), vy: rnd(-30, -10), life: 0, max: rnd(0.5, 0.9), c: '#bfe2f2' }); },
    glint: function () { S.glint = { x: 158, y: 90 }; sfx('bell'); }, noglint: function () { S.glint = null; }, deep: function () { sfx('deep'); }, wind: function () { sfx('wind'); S.shake = 0.3; },
    light: function () { S.light = 0.5; }, bow: function () { sfx('bow'); S.flash = 0.4; }, gold: function () { S.light = 0.35; sfx('ding'); }, low: function () { sfx('low'); }, bell: function () { sfx('bell'); }
  };
  function update(dt) {
    S.t += dt; S.wt += dt;
    var k = 1 - Math.exp(-dt * 5); S.cam.x += (S.tgt.x - S.cam.x) * k; S.cam.y += (S.tgt.y - S.cam.y) * k; S.cam.z += (S.tgt.z - S.cam.z) * k;
    S.bars += (S.barsT - S.bars) * (1 - Math.exp(-dt * 3.5)); S.shake = Math.max(0, S.shake - dt * 1.4); S.flash = Math.max(0, S.flash - dt * 2.6); S.light = Math.max(0, S.light - dt * 0.5);
    if (C.a.chew) { S.chewT += dt; if (S.chewT > 0.5) { S.chewT = 0; sfx('chew'); } }
    S.parts = S.parts.filter(function (p) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t === 'd') p.vy += 60 * dt; return p.life < p.max; });
    if (TY.on) {
      TY.acc += dt;
      while (TY.on && TY.acc >= TY.delay) {
        TY.acc -= TY.delay; var ch = TY.text.charAt(TY.i++);
        if (ch && ch !== ' ' && TY.i % 2 === 0) blip(TY.who);
        TY.delay = /[,;]/.test(ch) ? 0.14 : /[.!?…]/.test(ch) ? 0.22 : 0.028;
        el.txt.textContent = TY.text.slice(0, TY.i);
        if (TY.i >= TY.text.length) endTyping();
      }
    }
    if (MG && MG.tick) MG.tick(dt);
  }
  function frame(now) { if (!running) return; var dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); render(); raf = requestAnimationFrame(frame); }

  /* ---------------- mini oyunlar (4 motor + deri) ---------------- */
  /* mini oyun tuvallerinin ince sanatı (yalnız görünüş; mantık aynı) */
  function scrubUnder(w, h) {
    var b = new Buf(0, 0, w, h), rp = ramp(['#4a3826', '#3a2c1c', '#2c2016'], 12);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var n = hash(x, y * 3 + 1); b.set(x, y, n < 0.05 ? '#55422c' : n > 0.97 ? '#1e160e' : rpick(rp, y / h, x, y)); }
    for (var i = 0; i < 26; i++) { var px = Math.floor(hash(i, 41) * w), py = Math.floor(hash(41, i) * h), st = b.like(); st.ell(px, py, 2 + (i % 2), 1.5, '#6a6258'); b.part(st, 0.3, 0.25, 0.6); }
    var bw = b.like();
    for (var x2 = 108; x2 <= 172; x2++) { var u = (x2 - 140) / 32, yb = 40 + Math.round(10 * (1 - u * u)) - (Math.abs(u) > 0.9 ? Math.round((Math.abs(u) - 0.9) * 40) : 0); bw.rect(x2, yb, 1, 3, hash(x2 >> 2, 3) < 0.6 ? '#b08a4a' : '#8a6a3a'); if (Math.abs(x2 - 140) < 4) bw.rect(x2, yb, 1, 3, '#5a3a20'); }
    b.part(bw, 0.3, 0.2, 0.6);
    for (var x3 = 110; x3 <= 170; x3++) { b.set(x3, 38, '#1e160e', 0.8); b.set(x3, 39, '#6a5434', 0.6); }
    var ar = b.like();
    for (var y2 = 14; y2 < 34; y2++) { var hw = Math.round((y2 - 14) / 20 * 12); for (var x4 = 83 - hw; x4 <= 83 + hw; x4++) ar.set(x4, y2, x4 < 83 ? '#f0cc60' : x4 > 83 ? '#c9a040' : '#fff2b0'); }
    for (var x5 = 72; x5 < 95; x5++) ar.set(x5, 33, x5 % 3 ? '#e4b94a' : '#a8802a');
    ar.rect(80, 34, 7, 6, '#a8802a'); ar.rect(80, 36, 7, 1, '#7a5a1a');
    ar.shade(0.2, 0.15); ar.outline(0.6); b.put(ar);
    [[78, 22], [88, 28], [83, 16]].forEach(function (q) { b.set(q[0], q[1], '#ffffff'); });
    return b.toSprite().cv;
  }
  var RART = null;
  function rhythmArt() {
    if (RART) return RART;
    var b = new Buf(0, 0, 240, 60), rp = ramp(['#1a1030', '#0d0818', '#140c26'], 10);
    for (var y = 0; y < 60; y++) for (var x = 0; x < 240; x++) b.set(x, y, rpick(rp, y / 60, x, y));
    for (var x2 = 0; x2 < 240; x2++) { b.set(x2, 20, '#2a1b44'); b.set(x2, 39, '#2a1b44'); b.set(x2, 29, '#5a4288'); b.set(x2, 30, '#4b3272'); if (x2 % 24 === 0) b.rect(x2, 26, 1, 8, '#2a1b44'); }
    for (var y2 = 6; y2 < 54; y2++) for (var x3 = 30; x3 < 54; x3++) { var q = Math.abs(x3 - 41) / 12; if (BAY[y2 & 3][x3 & 3] > q) b.set(x3, y2, '#ffb454', 0.12); }
    function note(c) { var n = new Buf(0, 0, 12, 18), rows = [2, 4, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 4, 2]; rows.forEach(function (w, j) { n.rect(6 - w / 2, 1 + j, w, 1, c); }); n.shade(0.35, 0.3); n.rect(5, 3, 1, 4, '#ffffff'); n.outline(0.6); return n.toSprite().cv; }
    RART = { bg: b.toSprite().cv, on: note('#e4b94a'), ok: note('#6fe39a'), no: note('#ff5a6a') };
    return RART;
  }
  function miniHead(t, h) { return '<div class="mh"><b>' + tx(t) + '</b><span>' + tx(h) + '</span></div>'; }
  var MINI = {
    /* seçim: soru + seçenekler → id */
    choice: function (cfg, done) {
      var h = miniHead(cfg.title || { tr: 'KARAR', en: 'DECISION' }, cfg.q);
      cfg.opts.forEach(function (op, i) { h += '<button class="opt" data-i="' + i + '">' + tx(op) + '</button>'; });
      el.mini.innerHTML = h; el.skip.hidden = true;
      return {
        key: function (c, k) { var n = +k; if (n >= 1 && n <= cfg.opts.length) pick(n - 1); },
        finish: function () { pick(cfg.def || 0); }, _: el.mini.addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) pick(+b.getAttribute('data-i')); })
      };
      function pick(i) { if (!MG) return; sfx('tick'); var op = cfg.opts[i]; MG = null; done({ ok: true, id: op.id }); }
    },
    /* zamanlama çubuğu: imleç gidip gelir, yeşilde durdur (terazi, yay, araya girme) */
    bar: function (cfg, done) {
      var tries = cfg.tries || 3, need = cfg.need || 1, hits = 0, used = 0, pos = 0, dir = 1, sp = cfg.speed || 1.1, zw = cfg.zone || 0.18, zc = 0.5, wait = 0;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="meter" data-k2="m"><i style="left:0;width:100%;background:#2a1b44"></i><i data-k2="z" style="background:#6fe39a88"></i><i data-k2="c" style="width:4px;background:#ffb454"></i></div>' +
        '<div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.tap) + '</button>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); };
      function place() { zc = 0.2 + Math.random() * 0.6; q('z').style.left = ((zc - zw / 2) * 100) + '%'; q('z').style.width = (zw * 100) + '%'; }
      function info(m) { q('r').textContent = tx(UI.tries) + ' ' + Math.min(tries, used + (m ? 0 : 1)) + '/' + tries + ' · ★ ' + hits + '/' + need + (m ? '  ' + m : ''); }
      place(); info();
      function stop() {
        if (!MG || wait > 0) return; used++;
        var ok = Math.abs(pos - zc) <= zw / 2;
        if (ok) { hits++; sfx('ding'); if (cfg.onHit) cfg.onHit(); } else { sfx('buzz'); S.shake = 0.3; }
        info(ok ? '✔' : '✖');
        if (hits >= need || used >= tries) { var r = { ok: hits >= need, hits: hits }; MG = null; setTimeout(function () { done(r); }, 700); return; }
        wait = 0.6; place(); sp *= 1.1;
      }
      q('b').addEventListener('click', function (e) { e.stopPropagation(); stop(); });
      return {
        tick: function (dt) { if (wait > 0) { wait -= dt; return; } pos += dir * sp * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } q('c').style.left = 'calc(' + (pos * 100) + '% - 2px)'; },
        key: function (c) { if (c === 'Space' || c === 'Enter') stop(); }, finish: function () { MG = null; done({ ok: false, hits: hits, skipped: true }); }
      };
    },
    /* denge: ibre kendi kendine kayar; sağ/sol ile ortada tut (terazi, vezirin şüphesi) */
    balance: function (cfg, done) {
      var t = cfg.time || 14, hold = cfg.hold || 4, inz = 0, v = 0, x = 0, push = 0, lbl = cfg.meter || { tr: 'DENGE', en: 'BALANCE' };
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="rt">' + tx(lbl) + '</div><div class="meter" style="height:22px"><i style="left:40%;width:20%;background:#6fe39a55"></i><i data-k2="n" style="width:6px;background:#ffb454"></i></div>' +
        '<div class="meter"><i data-k2="p" style="left:0;width:0;background:#6fe39a"></i></div><div class="mres" data-k2="r"></div>' +
        '<div class="btns"><button data-k2="l">' + tx(UI.left) + '</button><button data-k2="g">' + tx(UI.right) + '</button></div>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); };
      function nudge(d) { v += d * 0.9; sfx('tick'); }
      q('l').addEventListener('click', function (e) { e.stopPropagation(); nudge(-1); }); q('g').addEventListener('click', function (e) { e.stopPropagation(); nudge(1); });
      function end(sk) { var r = { ok: inz >= hold, pct: inz / hold, skipped: !!sk }; MG = null; sfx(r.ok ? 'ding' : 'buzz'); setTimeout(function () { done(r); }, sk ? 0 : 600); }
      return {
        tick: function (dt) {
          t -= dt; push += dt; if (push > 0.7) { push = 0; v += rnd(-0.55, 0.55) * (cfg.wild || 1); }
          v *= Math.pow(0.35, dt); x = clamp(x + v * dt, -1, 1); if (Math.abs(x) >= 1) v = -v * 0.3;
          if (Math.abs(x) < 0.2) inz += dt;
          q('n').style.left = 'calc(' + ((x + 1) * 50) + '% - 3px)'; q('p').style.width = Math.min(100, inz / hold * 100) + '%';
          q('r').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's';
          if (inz >= hold || t <= 0) end();
        },
        key: function (c) { if (c === 'ArrowLeft') nudge(-1); if (c === 'ArrowRight') nudge(1); }, finish: function () { end(true); }
      };
    },
    /* sıralı seçim: doğru eşyaları doğru sırayla, süre/ısı bitmeden (sofra, düğüm) */
    order: function (cfg, done) {
      var arr = cfg.items.slice(), i, j, tmp, picks = [], heat = 1, memo = cfg.memo || 0;
      for (i = arr.length - 1; i > 0; i--) { j = Math.random() * (i + 1) | 0; tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
      var h = miniHead(cfg.title, cfg.hint) + '<div class="slots">'; for (i = 0; i < cfg.answer.length; i++) h += '<i>' + (i + 1) + '</i>'; h += '</div><div class="items">';
      arr.forEach(function (it, ix) { h += '<button class="it" data-i="' + ix + '"><i style="background:' + it.c + '"></i>' + tx(it.t) + '</button>'; });
      h += '</div><div class="rt">' + tx(cfg.meter || { tr: 'SÜRE', en: 'TIME' }) + '</div><div class="meter"><i data-k2="h" style="left:0;width:100%;background:#ffb454"></i></div><div class="mres" data-k2="r"></div>';
      el.mini.innerHTML = h;
      var slots = el.mini.querySelector('.slots').children;
      if (memo) { for (i = 0; i < cfg.answer.length; i++) { var it0 = cfg.items.filter(function (q) { return q.id === cfg.answer[i]; })[0]; slots[i].className = 'f'; slots[i].textContent = tx(it0.t); } }
      function pick(ix) {
        if (!MG || memo > 0) return; var b = el.mini.querySelector('[data-i="' + ix + '"]'); if (!b || b.disabled) return;
        b.disabled = true; picks.push(arr[ix].id); sfx('tick'); var sl = slots[picks.length - 1]; sl.className = 'f'; sl.textContent = tx(arr[ix].t);
        if (picks.length === cfg.answer.length) end();
      }
      function end(sk) {
        if (!MG) return; var ok = !sk && heat > 0 && picks.join() === cfg.answer.join(); MG = null;
        var m = el.mini.querySelector('[data-k2="r"]'); m.textContent = ok ? '★' : '✖'; m.style.color = ok ? '#6fe39a' : '#ff5a6a';
        sfx(ok ? 'ding' : 'buzz'); setTimeout(function () { done({ ok: ok, cold: heat <= 0, skipped: !!sk }); }, sk ? 0 : 800);
      }
      el.mini.addEventListener('click', function (e) { var b = e.target.closest('.it'); if (b) pick(+b.getAttribute('data-i')); });
      return {
        tick: function (dt) {
          if (memo > 0) { memo -= dt; if (memo <= 0) for (var k = 0; k < slots.length; k++) { slots[k].className = ''; slots[k].textContent = String(k + 1); } return; }
          heat -= dt / (cfg.time || 16); var hb = el.mini.querySelector('[data-k2="h"]'); hb.style.width = Math.max(0, heat * 100) + '%'; hb.style.background = heat > 0.5 ? '#ffb454' : heat > 0.25 ? '#ff8a3c' : '#ff5a6a';
          if (heat <= 0) end();
        },
        key: function (c, k) { var n = +k; if (n >= 1 && n <= arr.length) pick(n - 1); }, finish: function () { end(true); }
      };
    },
    /* fırça: parmakla sür, toprağı temizle, altından çıkanı ortaya çıkar */
    scrub: function (cfg, done) {
      var t = cfg.time || 16, need = cfg.need || 0.8, GW = 48, GH = 20, cells = [], left = 0, i;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<canvas class="scrub" width="' + GW * 4 + '" height="' + GH * 4 + '" data-k2="c"></canvas><div class="meter"><i data-k2="p" style="left:0;width:0;background:#6fe39a"></i></div><div class="mres" data-k2="r"></div>';
      var cv = el.mini.querySelector('[data-k2="c"]'), g = cv.getContext('2d');
      for (i = 0; i < GW * GH; i++) { cells.push(1); left++; }
      var under = scrubUnder(GW * 4, GH * 4), SOIL = ['#7a5a3a', '#6e5034', '#84643f'];
      function draw() {   /* ince: altta ok ucu + yay izi (önbellek), üstte dokulu toprak; açılan yerin kenarına gölge */
        g.drawImage(under, 0, 0);
        for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) {
          var X = x * 4, Y = y * 4, on = cells[y * GW + x];
          var up = y > 0 && cells[(y - 1) * GW + x], lf = x > 0 && cells[y * GW + x - 1];
          if (!on) { g.fillStyle = 'rgba(20,12,6,0.45)'; if (up) g.fillRect(X, Y, 4, 2); if (lf) g.fillRect(X, Y, 2, 4); continue; }
          var h = hash(x, y), dn = y < GH - 1 && !cells[(y + 1) * GW + x], rt = x < GW - 1 && !cells[y * GW + x + 1];
          g.fillStyle = SOIL[h < 0.5 ? 0 : h < 0.8 ? 1 : 2]; g.fillRect(X, Y, 4, 4);
          g.fillStyle = h > 0.5 ? '#94704a' : '#5e4430'; g.fillRect(X + ((h * 7) & 2), Y + ((h * 13) & 2), 2, 2);
          if (y > 0 && !up) { g.fillStyle = '#a07e52'; g.fillRect(X, Y, 4, 1); }
          if (x > 0 && !lf) { g.fillStyle = '#987650'; g.fillRect(X, Y, 1, 4); }
          if (dn) { g.fillStyle = '#4a3420'; g.fillRect(X, Y + 3, 4, 1); }
          if (rt) { g.fillStyle = '#523a24'; g.fillRect(X + 3, Y, 1, 4); }
        }
      }
      function brush(e) {
        var r = cv.getBoundingClientRect(), px = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * GW, py = ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) / r.height * GH;
        var hit = false;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) { var cx = Math.floor(px + dx), cy = Math.floor(py + dy); if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue; var k = cy * GW + cx; if (cells[k]) { cells[k] = 0; left--; hit = true; } }
        if (hit && Math.random() < 0.2) sfx('chew');
        draw();
      }
      var down = false;
      cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); down = true; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); brush(e); });
      cv.addEventListener('pointermove', function (e) { if (down) brush(e); });
      cv.addEventListener('pointerup', function () { down = false; });
      draw();
      function end(sk) { if (!MG) return; var pct = 1 - left / (GW * GH), r = { ok: !sk && pct >= need, pct: pct, skipped: !!sk }; MG = null; sfx(r.ok ? 'ding' : 'buzz'); setTimeout(function () { done(r); }, sk ? 0 : 700); }
      return {
        tick: function (dt) { t -= dt; var pct = 1 - left / (GW * GH); el.mini.querySelector('[data-k2="p"]').style.width = Math.min(100, pct / need * 100) + '%'; el.mini.querySelector('[data-k2="r"]').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's'; if (pct >= need || t <= 0) end(); },
        key: function (c) { if (c === 'Space') { for (var k = 0; k < 60; k++) { var q = Math.random() * GW * GH | 0; if (cells[q]) { cells[q] = 0; left--; } } draw(); } }, finish: function () { end(true); }
      };
    },
    /* söyleşi: sorular, cevaplar göstergeyi oynatır (sakin söyleşi) */
    talk: function (cfg, done) {
      var qi = 0, score = 0, max = 0;
      function show() {
        var q = cfg.qs[qi], h = miniHead(cfg.title, cfg.hint) + '<div class="rt">' + tx(cfg.meter) + '</div><div class="meter"><i data-k2="m" style="left:0;width:' + (max ? Math.max(0, score / max * 100) : 50) + '%;background:#6fe3c8"></i></div>';
        h += '<p class="note" style="color:#f6e9d3;font-size:16px">' + tx(q.q) + '</p>';
        q.o.forEach(function (op, i) { h += '<button class="opt" data-i="' + i + '">' + tx(op) + '</button>'; });
        el.mini.innerHTML = h;
      }
      function pick(i) {
        if (!MG) return; var q = cfg.qs[qi], op = q.o[i]; score += op.v || 0; max += Math.max.apply(null, q.o.map(function (z) { return z.v || 0; })); sfx(op.v > 0 ? 'ding' : 'tick');
        qi++; if (qi >= cfg.qs.length) { var r = { ok: score >= (cfg.need || max * 0.6), score: score, last: op.id }; MG = null; done(r); } else show();
      }
      el.mini.addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) pick(+b.getAttribute('data-i')); });
      show();
      return { key: function (c, k) { var n = +k; if (n >= 1 && n <= 4) pick(n - 1); }, finish: function () { MG = null; done({ ok: false, score: 0, skipped: true }); } };
    },
    /* fener: basılı tut, rüzgâr gelince alevi koru; sakinken bırak (hava alsın) */
    lantern: function (cfg, done) {
      var t = cfg.time || 16, flame = 1, gust = 0, gw = 0, holding = false;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="rt">🔥</div><div class="meter" style="height:18px"><i data-k2="f" style="left:0;width:100%;background:#ffb454"></i></div>' +
        '<div class="rt" data-k2="w">·</div><div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.hold) + '</button>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); }, b = q('b');
      function set(v) { holding = v; b.style.background = v ? '#6fe39a' : ''; }
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); set(true); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { set(false); }); });
      function end(sk) { if (!MG) return; var r = { ok: !sk && flame > 0, flame: flame, skipped: !!sk }; MG = null; set(false); sfx(r.ok ? 'ding' : 'low'); setTimeout(function () { done(r); }, sk ? 0 : 700); }
      return {
        tick: function (dt) {
          t -= dt; gw -= dt;
          if (gw <= 0) { gust = gust ? 0 : 1; gw = gust ? rnd(1.2, 2.2) : rnd(1.0, 2.6); if (gust) sfx('wind'); }
          flame += gust ? (holding ? -0.02 : -0.28) * dt : (holding ? -0.14 : 0.1) * dt; flame = clamp(flame, 0, 1);
          q('f').style.width = flame * 100 + '%'; q('f').style.background = flame > 0.5 ? '#ffb454' : flame > 0.25 ? '#ff8a3c' : '#ff5a6a';
          q('w').textContent = gust ? tx({ tr: '💨 RÜZGÂR!', en: '💨 WIND!' }) : tx({ tr: 'sakin', en: 'calm' }); q('r').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's';
          if (flame <= 0 || t <= 0) end();
        },
        key: function (c) { if (c === 'Space') { set(!holding); } }, finish: function () { end(true); }
      };
    },
    /* ritim: notalar kayar, çizgiye gelince vur (ağıt) */
    rhythm: function (cfg, done) {
      var bpm = cfg.bpm || 72, beat = 60 / bpm, notes = [], t = -1.2, hits = 0, i;
      cfg.pattern.forEach(function (b) { notes.push({ at: b * beat, hit: false, miss: false }); });
      var endAt = notes[notes.length - 1].at + 1;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<canvas class="scrub" width="240" height="60" data-k2="c" style="aspect-ratio:4/1;cursor:pointer"></canvas><div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.hit) + '</button>';
      var cv = el.mini.querySelector('[data-k2="c"]'), g = cv.getContext('2d'), SCALE = 70, RB = rhythmArt();
      function hit() {
        if (!MG) return; var best = null, bd = 9;
        for (i = 0; i < notes.length; i++) { var n = notes[i]; if (n.hit || n.miss) continue; var d = Math.abs(n.at - t); if (d < bd) { bd = d; best = n; } }
        if (best && bd < 0.22) { best.hit = true; hits++; var f = (cfg.freqs || [294, 349, 392, 440])[notes.indexOf(best) % 4]; tone(f, 0.7, 'triangle', 0.08, -6); tone(f * 2, 0.3, 'square', 0.012); }
        else { sfx('tick'); }
      }
      el.mini.querySelector('[data-k2="b"]').addEventListener('pointerdown', function (e) { e.stopPropagation(); hit(); });
      cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); hit(); });
      function end(sk) { if (!MG) return; var r = { ok: !sk && hits >= Math.ceil(notes.length * (cfg.need || 0.6)), hits: hits, of: notes.length, skipped: !!sk }; MG = null; setTimeout(function () { done(r); }, sk ? 0 : 500); }
      return {
        tick: function (dt) {
          t += dt; g.drawImage(RB.bg, 0, 0);
          for (i = 0; i < notes.length; i++) {
            var n = notes[i], x = 40 + (n.at - t) * SCALE; if (!n.hit && !n.miss && t - n.at > 0.25) n.miss = true;
            if (x < -10 || x > 250) continue;
            if (n.miss) g.globalAlpha = 0.4; g.drawImage(n.hit ? RB.ok : n.miss ? RB.no : RB.on, Math.round(x) - 6, 21); g.globalAlpha = 1;
          }
          g.fillStyle = '#ffb454'; g.fillRect(40, 8, 3, 44); g.fillStyle = '#fff2b0'; g.fillRect(41, 8, 1, 44); g.fillStyle = '#a9691b'; g.fillRect(42, 8, 1, 44);
          el.mini.querySelector('[data-k2="r"]').textContent = '♪ ' + hits + '/' + notes.length;
          if (t > endAt) end();
        },
        key: function (c) { if (c === 'Space' || c === 'Enter') hit(); }, finish: function () { end(true); }
      };
    }
  };
  function startMini(cfg, cb) {
    mode = 'mini'; showPanel('mini'); el.mini.innerHTML = '';
    var m = MINI[cfg.type]; if (cfg.cam) setCam(cfg.cam); CFG = cfg;
    MG = m(cfg, function (r) { mode = 'wait'; cb(r); });
  }

  /* ---------------- sonuç kartı ---------------- */
  function result(r) {
    mode = 'result'; TY.on = false; S.talk = null; SEQ = null; S.barsT = 0;
    var from = CTX.ber; if (typeof r.berSet === 'number') CTX.ber = clamp(r.berSet, 3, 10); if (r.ber) CTX.ber = clamp(CTX.ber + r.ber, 3, 10); hud(from);
    sfx('ding');
    var dB = CTX.ber - from, h = '<div class="rt">' + tx(UI.res) + '</div><h3 class="rh">' + tx(r.title) + '</h3><div class="stats">' +
      '<div class="stat"><small>' + tx(UI.rep) + '</small><b class="up">+' + (r.rep || 0) + '</b></div>' +
      '<div class="stat"><small>' + tx(UI.ber) + '</small><b class="' + (dB >= 0 ? 'up' : 'dn') + '">' + (dB > 0 ? '+' : '') + dB + ' → ' + CTX.ber + '/10</b></div></div>';
    (r.buffs || []).forEach(function (b) { var d = BUFFS[b.id]; if (d) h += '<div class="buff"><i>★</i><div><b>' + tx(d.n) + (b.lv < 1 ? ' (½)' : '') + '</b><small>' + tx(d.d) + '</small></div></div>'; });
    (r.items || []).forEach(function (it) { var d = ITEMS[it]; if (d) h += '<div class="buff" style="border-color:#6cc6ff;background:#10202c"><i style="color:#6cc6ff">◆</i><div><b>' + tx(d.n) + '</b><small>' + tx(UI.item) + ' · ' + tx(d.d) + '</small></div></div>'; });
    (r.pieces || []).forEach(function (pz) { var d = PIECES[pz]; if (d) h += '<div class="buff" style="border-color:#6fe3c8;background:#0c2420"><i style="color:#6fe3c8">❖</i><div><b>' + tx(UI.piece) + ': ' + tx(d.n) + '</b><small>' + tx(d.d) + '</small></div></div>'; });
    if (r.note) h += '<p class="note">' + tx(r.note) + '</p>';
    h += '<div class="btns"><button class="pri" data-r="1">' + tx(UI.cont) + '</button></div>';
    el.result.innerHTML = h; showPanel('result');
    el.result.querySelector('[data-r]').addEventListener('click', function () { finish(r); });
  }
  function finish(r) { var cb = onDone; destroy(); if (cb) cb(r); }

  /* ---------------- kalıcı etkiler, eşyalar, söz parçaları ---------------- */
  var BUFFS = {
    baris: { n: { tr: 'Barışçı Esnaf', en: 'Peacekeeping Trader' }, d: { tr: 'Kalıcı · müşteri sabrı +%10', en: 'Permanent · customer patience +10%' } },
    adil: { n: { tr: 'Adil Tezgâh', en: 'Fair Stall' }, d: { tr: 'Kalıcı · satış fiyatı +%4', en: 'Permanent · sale price +4%' } },
    sert: { n: { tr: 'Sert Tezgâh', en: 'Stern Stall' }, d: { tr: 'Kalıcı · müşteri akışı +%6', en: 'Permanent · customer flow +6%' } },
    muhafiz: { n: { tr: 'Koy Muhafızı', en: 'Cove Guardian' }, d: { tr: 'Kalıcı · fırtına günü müşteri kaybı yarıya iner, mutfak %10 hızlı', en: 'Permanent · storm-day customer loss halved, kitchen 10% faster' } },
    altinok: { n: { tr: 'Altın Ok', en: 'Golden Arrow' }, d: { tr: 'Kalıcı · bütün ağlar %3 daha hızlı dolar', en: 'Permanent · all nets fill 3% faster' } },
    denizsozu: { n: { tr: 'Deniz Sözü', en: 'Sea Promise' }, d: { tr: 'Kalıcı · bütün ağlar %3 daha hızlı dolar', en: 'Permanent · all nets fill 3% faster' } },
    bekci: { n: { tr: 'Dipteki Sözün Bekçisi', en: 'Keeper of the Promise Below' }, d: { tr: 'Unvan · kazanılan itibar +%5', en: 'Title · reputation gains +5%' } }
  };
  var ITEMS = {
    okucu: { n: { tr: 'Üç Kenarlı Ok Ucu', en: 'Three-Edged Arrowhead' }, d: { tr: 'ağdan çıktı, altın', en: 'came up in the net, golden' } },
    gomlek: { n: { tr: 'Yılan Gömleği', en: 'Snake Skin' }, d: { tr: 'dev, ucunda altın tozu', en: 'huge, gold dust on its tip' } },
    okucu2: { n: { tr: 'Ok Ucunun Eşi', en: 'The Twin Arrowhead' }, d: { tr: 'çamurdaki izin yanında', en: 'beside the footprint in the mud' } },
    yayizi: { n: { tr: 'Yay İzi', en: 'Bow Imprint' }, d: { tr: 'höyüğün toprağında', en: 'in the soil of the mound' } },
    altinok: { n: { tr: 'Altın Ok', en: 'Golden Arrow' }, d: { tr: 'denizdeki ışığa atıldı', en: 'shot into the light on the sea' } }
  };
  var PIECES = {
    emek: { n: { tr: 'Emek', en: 'Toil' }, d: { tr: 'Denizden ihtiyacın kadar al.', en: 'Take from the sea only what you need.' } },
    sir: { n: { tr: 'Sır', en: 'Secret' }, d: { tr: 'Yerimi kimseye söyleme.', en: 'Tell no one where I dwell.' } },
    agit: { n: { tr: 'Ağıt', en: 'Lament' }, d: { tr: 'Bekçinin yasını unutma.', en: 'Never forget the keeper\'s grief.' } }
  };

  /* ---------------- GÜNLER ---------------- */
  var ALP = { a: 'n' };
  var DAYS = {};
  /* 1 · Altın Ok Ucu */
  DAYS[1] = {
    title: { tr: 'Altın Ok Ucu', en: 'The Golden Arrowhead' }, when: { tr: 'şafak · 1 dk', en: 'dawn · 1 min' },
    open: [
      L('n', 'Şafak. Tezgâhına iki kişi geliyor: başörtülü yaşlı bir kadın ve asık suratlı bir balıkçı. Ellerinde ağdan yeni çıkmış balık.', 'Dawn. Two people come to your stall: an old woman in a headscarf and a sullen fisherman, carrying fish fresh from the net.', { bg: 'dock', show: 'h,k,y', pos: { h: [40, 1], k: [150, -1], y: [96, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars' }),
      L('k', 'Bu da ne? Balıkların arasında parlıyor...', 'What\'s this? Something\'s shining among the fish...', { fx: 'glint', cam: [150, 86, 2.4] }),
      L('n', 'Üç kenarlı, altından bir ok ucu. Eski, ama pırıl pırıl.', 'A three-edged arrowhead of gold. Old, yet gleaming.', { cam: [158, 90, 3] }),
      L('k', 'Bizim değil bu. Geri atın denize, uğursuzluk getirir.', 'That\'s not ours. Throw it back, it brings bad luck.', { ex: { k: 'a' }, cam: [150, 80, 2] }),
      L('h', 'Dur Kalender! Deniz vermişse bir bildiği vardır. Tut şunu evladım.', 'Wait, Kalender! If the sea gave it, it knows why. Hold it, dear.', { cam: [40, 80, 2], learn: 'k' }),
      L('k', 'Hacer Teyze, sen de her şeye bir anlam bulursun...', 'Aunt Hacer, you find a meaning in everything...', { ex: { k: 't' }, cam: [150, 80, 2], learn: 'h' }),
      L('n', 'İskeledeki su kovasında, kimse dokunmadan halkalar açılıyor.', 'In the bucket on the pier, rings spread on the water though no one touches it.', { cam: [96, 70, 1.5], fx: 'low' })
    ],
    mini: { type: 'choice', title: { tr: 'OK UCU', en: 'ARROWHEAD' }, q: { tr: 'Ok ucunu ne yapacaksın?', en: 'What will you do with the arrowhead?' },
      opts: [{ id: 'tezgah', tr: 'Tezgâha koy, herkes görsün', en: 'Put it on the stall for all to see' }, { id: 'cep', tr: 'Cebine at, sessizce sakla', en: 'Slip it into your pocket, quietly' }] },
    after: function (r) {
      return [
        r.id === 'tezgah' ? L('h', 'Aferin. Saklanan şey kurt yer.', 'Good. What you hide, the worms eat.', { ex: { h: 'h' } })
          : L('k', 'Sen bilirsin... Ama gece ağları bir kontrol et.', 'Suit yourself... But check the nets tonight.', { ex: { k: 't' } }),
        L('n', 'Gece ağlar ağır döner. Uzaktan, yay kirişi gibi ince bir tını geliyor.', 'At night the nets turn heavy. From afar comes a thin note, like a bowstring.', { cam: [96, 60, 1], fx: 'kopuz,noglint' })
      ];
    },
    res: function () { return { title: { tr: 'OK UCU BULUNDU', en: 'ARROWHEAD FOUND' }, rep: 2, berSet: 6, items: ['okucu'], note: { tr: 'Yarın: Uskumru Tartısı.', en: 'Tomorrow: The Mackerel Scale.' } }; }
  };
  /* 2 · Uskumru Tartısı */
  DAYS[2] = {
    title: { tr: 'Uskumru Tartısı', en: 'The Mackerel Scale' }, when: { tr: 'öğle · 1 dk', en: 'noon · 1 min' },
    open: [
      L('n', 'Öğle. Pazarda terazinin başında iki inatçı: Hacer Teyze ile Kalender.', 'Noon. Two stubborn souls at the market scale: Aunt Hacer and Kalender.', { bg: 'market', show: 'h,k,y', pos: { h: [30, 1], k: [150, -1], y: [96, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars' }),
      L('h', 'Bu kadar uskumruya bir avuç tuz fazla gelmez! Bol at, bol kalsın.', 'A handful more salt won\'t hurt this much mackerel! Pile it on.', { cam: [40, 78, 2.2] }),
      L('k', 'Bol at bol at... Denizde bir şey kalmayacak. Az tart, az sat.', 'Pile it on, pile it on... Nothing will be left in the sea. Weigh little, sell little.', { cam: [150, 78, 2.2], ex: { k: 'a' } }),
      L('y', 'Tamam, tamam. Ne fazla ne eksik: terazi karar versin.', 'All right, all right. Not too much, not too little: let the scale decide.', { cam: [96, 80, 2.4] })
    ],
    mini: { type: 'balance', title: { tr: 'TERAZİ', en: 'THE SCALE' }, hint: { tr: 'İbre kayıyor. Sağ/sol ile ortadaki yeşilde tut; çubuk dolsun.', en: 'The needle drifts. Use left/right to keep it in the green; fill the bar.' }, time: 14, hold: 4, meter: { tr: 'KEFE DENGESİ', en: 'PAN BALANCE' }, cam: [62, 74, 2.6] },
    after: function (r) {
      return [
        r.ok ? L('h', 'Tam dengede... Anam da böyle tartardı. İhtiyacın kadar, der dururdu.', 'Perfectly even... My mother weighed like that. Only as much as you need, she used to say.', { ex: { h: 'h', k: 'h' }, cam: [40, 78, 2] })
             : L('k', 'Terazi bile şaşırdı bugün. Ama söz yerinde: ihtiyacın kadar.', 'Even the scale is confused today. But the saying stands: only what you need.', { ex: { k: 'n' }, cam: [150, 78, 2] }),
        L('n', 'O gece ağlar yarı boş döner. İçinde balık yerine dev bir yılan gömleği var.', 'That night the nets return half empty. Instead of fish, a giant snake skin.', { bg: 'dock', hide: 'h,k', cam: [96, 60, 1], fx: 'low' }),
        L('n', 'Gömleğin ucunda, ok ucundakiyle aynı altın toz parlıyor.', 'On its tip glitters the same gold dust as on the arrowhead.', { fx: 'glint', cam: [158, 90, 3] })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'TERAZİ DENGEDE', en: 'THE SCALE IS EVEN' } : { tr: 'TERAZİ ŞAŞIRDI', en: 'THE SCALE WOBBLED' }, rep: r.ok ? 6 : 2, berSet: 5, items: ['gomlek'], pieces: r.ok ? ['emek'] : [], note: { tr: 'Bereket çekiliyor. Yarın: Son Levrek.', en: 'The bounty is ebbing. Tomorrow: The Last Sea Bass.' } }; }
  };
  /* 3 · Son Levrek */
  DAYS[3] = {
    title: { tr: 'Son Levrek', en: 'The Last Sea Bass' }, when: { tr: 'akşam üstü · 1 dk', en: 'late afternoon · 1 min' },
    open: [
      L('n', 'Akşam üstü. Tezgâhta tek bir levrek kaldı. Hacer ve Kalender aynı anda uzanıyor.', 'Late afternoon. One sea bass left on the stall. Hacer and Kalender reach for it at once.', { bg: 'market', show: 'h,k,y', pos: { h: [60, 1], k: [110, -1], y: [160, -1] }, cam: [85, 70, 2], cut: 1, fx: 'bars' }),
      L('k', 'Dur bakalım! O levreği ben gördüm!', 'Hold it! I saw that sea bass first!', { ex: { k: 'a', h: 'n' }, cam: [110, 78, 3], fx: 'shake' }),
      L('h', 'Sen gördün, ben tuttum! Torunum levrek sever!', 'You saw it, I grabbed it! My grandson loves sea bass!', { ex: { h: 'a' }, cam: [60, 78, 3], fx: 'shake' }),
      L('n', 'Sesler yükseliyor; pazar yeri susmuş, herkes seni izliyor.', 'Voices rise; the market falls silent, everyone watches you.', { cam: [96, 64, 1.4] })
    ],
    mini: { type: 'choice', title: { tr: 'NE YAPACAKSIN?', en: 'WHAT WILL YOU DO?' }, q: { tr: 'Kavga büyümeden...', en: 'Before the fight grows...' },
      opts: [{ id: 'gir', tr: 'Araya gir, sakinleştir', en: 'Step in and calm them' }, { id: 'bol', tr: 'Levreği ikiye böl', en: 'Cut the sea bass in two' }, { id: 'zabita', tr: 'Zabıtaya haber ver', en: 'Call the market warden' }] },
    mini2: function (r) { return r.id === 'gir' ? { type: 'bar', title: { tr: 'SAKİNLEŞTİR', en: 'CALM THEM' }, hint: { tr: 'İmleç yeşildeyken DUR. Üç deneme, bir tam isabet yeter.', en: 'STOP while the cursor is in the green. Three tries, one hit will do.' }, tries: 3, need: 1, speed: 1.2, zone: 0.16, cam: [85, 74, 2.4] } : null; },
    after: function (r, r2) {
      var a = r.id === 'gir' ? (r2 && r2.ok ? L('n', 'Tam zamanında araya girdin. İkisi de bir an durdu, sonra güldü.', 'You stepped in just in time. Both froze, then burst out laughing.', { ex: { h: 'h', k: 'h' } }) : L('n', 'Biraz geç kaldın ama sesin yetti. Levrek Hacer\'e, gönül Kalender\'e.', 'A bit late, but your voice carried. The fish to Hacer, the goodwill to Kalender.', { ex: { h: 'n', k: 'n' } }))
        : r.id === 'bol' ? L('n', 'Levreği tam ortadan böldün. Kimse fazla almadı, kimse eksik kalmadı.', 'You cut the sea bass right down the middle. Nobody got more, nobody less.', { ex: { h: 'n', k: 'n' } })
        : L('n', 'Zabıta geldi, ikisini de uyardı. Pazar sustu; tezgâhın sözü sert ama net.', 'The warden came and warned them both. The market hushed; your stall\'s word is stern but clear.', { ex: { h: 't', k: 't' } });
      return [a,
        L('n', 'Kalabalık dağılırken sahil çamurunda bir şey fark ediyorsun: insan boyunda, yalın ayak bir iz.', 'As the crowd scatters you notice something in the shore mud: a barefoot footprint, big as a man.', { bg: 'dock', hide: 'h,k', cam: [96, 60, 1] }),
        L('n', 'İzin yanında ok ucunun birebir eşi. İz denize değil, karaya, höyüğe doğru gidiyor.', 'Beside it, the twin of the arrowhead. The prints lead not to the sea, but inland, to the mound.', { fx: 'glint', cam: [158, 90, 3] })];
    },
    res: function (r, r2) {
      var b = r.id === 'gir' ? 'baris' : r.id === 'bol' ? 'adil' : 'sert';
      return { title: { tr: 'PAZARDA SÜKÛN', en: 'PEACE AT THE MARKET' }, rep: r.id === 'gir' && r2 && r2.ok ? 8 : 5, berSet: 5, buffs: [{ id: b, lv: 1 }], items: ['okucu2'], note: { tr: 'Yarın: Ağdaki Yunus.', en: 'Tomorrow: The Dolphin in the Net.' } };
    }
  };
  /* 4 · Ağdaki Yunus */
  DAYS[4] = {
    title: { tr: 'Ağdaki Yunus', en: 'The Dolphin in the Net' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah. Ağ çırpınıyor: bir yunus dolanmış, panik içinde.', 'Morning. The net thrashes: a dolphin is tangled, panicking.', { bg: 'dock', show: 'd,k,y', pos: { k: [40, 1], y: [96, 1] }, cam: [110, 76, 1.6], cut: 1, fx: 'bars,splash' }),
      L('k', 'Kesin şu ağı, balığı kurtarın! Yunus sonra gider.', 'Cut the net, save the fish! The dolphin can go after.', { ex: { k: 'a' }, cam: [40, 78, 2] }),
      L('y', 'Dur! Ağı kesersek yunus da boğulur. Düğümleri sırayla çözelim.', 'Wait! If we cut it the dolphin chokes. Let\'s untie the knots in order.', { cam: [96, 80, 2.4] }),
      L('n', 'Hangi ip hangisinin üstünde? İyi bak; sıra bir an sonra kaybolacak.', 'Which rope lies over which? Look closely; the order vanishes in a moment.', { cam: [120, 80, 2.6] })
    ],
    mini: { type: 'order', title: { tr: 'DÜĞÜM ÇÖZ', en: 'UNTIE THE KNOTS' }, hint: { tr: 'Sırayı ezberle (2 sn), sonra ipleri aynı sırayla çöz. Yunus huzursuzlandıkça süre kısalır.', en: 'Memorise the order (2 s), then untie in the same order. Time shrinks as the dolphin panics.' },
      items: [{ id: 'kirmizi', tr: 'KIRMIZI', en: 'RED', c: '#d94a4a' }, { id: 'mavi', tr: 'MAVİ', en: 'BLUE', c: '#3f7fc0' }, { id: 'sari', tr: 'SARI', en: 'YELLOW', c: '#e4b94a' }, { id: 'yesil', tr: 'YEŞİL', en: 'GREEN', c: '#3fa56a' }].map(function (q) { return { id: q.id, t: { tr: q.tr, en: q.en }, c: q.c }; }),
      answer: ['sari', 'kirmizi', 'yesil', 'mavi'], memo: 2, time: 12, meter: { tr: 'YUNUSUN SABRI', en: 'DOLPHIN\'S CALM' }, cam: [120, 80, 2.4] },
    after: function (r) {
      return [
        r.ok ? L('n', 'Son düğüm de çözüldü. Yunus bir an durup gözlerinin içine bakıyor.', 'The last knot comes loose. The dolphin pauses and looks you in the eye.', { fx: 'splash' })
             : L('n', 'Sıra karıştı ama Kalender koşup yardım etti; yunus sonunda kurtuldu.', 'You mixed up the order, but Kalender rushed to help; the dolphin finally slipped free.', { fx: 'splash', ex: { k: 'n' } }),
        L('d', '...Iiik!', '...Eeek!', { cam: [120, 76, 3] }),
        L('n', '"Geri geleceğim" der gibi. Denizin ışığı bir an altın yeşili oluyor; yunus derine dalıyor.', 'As if saying "I\'ll be back". The sea glows gold-green for a moment; the dolphin dives deep.', { hide: 'd', fx: 'gold', cam: [96, 60, 1] })
      ];
    },
    res: function (r) { return { title: { tr: 'YUNUS KURTULDU', en: 'THE DOLPHIN IS FREE' }, rep: r.ok ? 6 : 3, berSet: 6, note: { tr: 'Kurtarma bir yanıt: deniz biraz yumuşadı. Yarın: Höyüğün Hikâyesi.', en: 'A rescue is an answer: the sea softened a little. Tomorrow: The Tale of the Mound.' } }; }
  };
  /* 5 · Höyüğün Hikâyesi */
  DAYS[5] = {
    title: { tr: 'Höyüğün Hikâyesi', en: 'The Tale of the Mound' }, when: { tr: 'gün batımı · 1 dk', en: 'sunset · 1 min' },
    open: [
      L('n', 'Ak sakallı bir ihtiyar tezgâhına uğruyor, seni koyun arkasındaki höyüğe çıkarıyor. Balbal taşları gölge salıyor.', 'A white-bearded old man stops by your stall and takes you up the mound behind the cove. The balbal stones cast long shadows.', { bg: 'mound_dusk', show: 't,y', pos: { t: [120, -1], y: [80, 1] }, cam: [100, 60, 1], cut: 1, fx: 'bars' }),
      L('t', 'Bana Temel Dede derler. Bu koyun en yaşlısıyım; masalları da ben bilirim.', 'They call me Grandpa Temel. I\'m the oldest in this cove, so the tales are mine to tell.', { cam: [120, 76, 2.4], learn: 't' }),
      L('t', 'Çok eskiden bu topraklarda yarı kadın, yarı yılan bir ana yaşarmış derler.', 'They say that long ago a mother, half woman and half serpent, lived in these lands.', { cam: [120, 76, 2.4] }),
      L('t', 'Oğullarına bir yay bırakmış: "Bu yayı geren, bu kemeri kuşanan kalsın bu toprakta."', 'She left her sons a bow: "Who draws this bow and girds this belt, let him keep this land."', { fx: 'kopuz' }),
      L('t', 'Yunanlı bir yazıcı da böyle bir şey yazmış, ama o bizim ağzımızdan duymadı. Hadi, şu toprağı bir temizle.', 'A Greek writer wrote something like it, but he never heard it from our lips. Come, clear that soil.', { cam: [45, 86, 2.6] })
    ],
    mini: { type: 'scrub', title: { tr: 'FIRÇALA', en: 'BRUSH' }, hint: { tr: 'Parmağını/fareyi sürükleyerek toprağı temizle. Altında bir şey var.', en: 'Drag your finger/mouse to clear the soil. Something lies beneath.' }, time: 16, need: 0.7 },
    after: function (r) {
      return [
        L('n', r.ok ? 'Toprak kalkınca ok ucunun bir eşi, yanında da uzun bir yay izi çıkıyor.' : 'Toprak tam kalkmasa da bir ok ucu ve bir yay izi seçiliyor.', r.ok ? 'As the soil lifts, another arrowhead appears, and beside it the long imprint of a bow.' : 'Even with soil left, an arrowhead and the imprint of a bow show through.', { fx: 'ding' }),
        L('t', 'Gördün mü? Masal değilmiş.', 'You see? It was no fairy tale.', { ex: { t: 's' }, cam: [120, 76, 2.4] }),
        L('n', 'Gün batarken höyüğün tepesinde uzun bir siluet: kırmızı sivri başlıklı, yaylı. Yaklaşınca kayboluyor.', 'At sunset, a tall silhouette on the mound top: pointed red cap, a bow. It vanishes as you approach.', { show: 'a', sit: { a: 0 }, pos: { a: [160, -1] }, cam: [150, 60, 1.6], fx: 'low' }),
        L('n', 'Oturduğu taşın oyuğunda soğumuş bir kap. Bekçi aç.', 'In the hollow of the stone where it sat: a bowl gone cold. The watchman is hungry.', { hide: 'a', cam: [150, 80, 2.6] })
      ];
    },
    res: function (r) { return { title: { tr: 'HÖYÜK KONUŞTU', en: 'THE MOUND SPOKE' }, rep: r.ok ? 5 : 3, berSet: 6, items: ['yayizi'], note: { tr: 'Yarın akşam höyüğe sıcak bir sofra götür. Yarın: Bekçiye Sofra.', en: 'Bring a warm meal to the mound tomorrow evening. Tomorrow: A Meal for the Watchman.' } }; }
  };
  /* 6 · Bekçiye Sofra (prototipten) */
  DAYS[6] = {
    title: { tr: 'Bekçiye Sofra', en: 'A Meal for the Watchman' }, when: { tr: 'akşam üstü · 1 dk', en: 'late afternoon · 1 min' },
    open: [
      L('n', 'Akşam üstü. Höyüğün yanındaki yabancı üç gündür aynı kayanın üstünde oturuyor.', 'Late afternoon. The stranger by the mound has sat on the same rock for three days.', { bg: 'mound', show: 'a,y', sit: { a: 1 }, pos: { a: [130, -1], y: [98, 1] }, ex: { a: 't', y: 'n' }, p: { a: 'knees', y: 'idle' }, cam: [96, 60, 1], cut: 1, fx: 'bars,steam' }),
      L('y', 'Üç gündür tek lokma yemedi. Hacer Teyze\'nin tenceresinden bir kase güveç kimseye zarar vermez.', 'He hasn\'t eaten a bite in three days. A bowl of stew from Aunt Hacer\'s pot won\'t hurt anyone.', { cam: [98, 80, 3] }),
      L('n', 'Kaseyi alıp yabancıya yürüdün. Güveç hâlâ sıcak.', 'You take the bowl to the stranger. The stew is still warm.', { it: { y: 'bowl' }, p: { y: 'reach' }, cam: [112, 82, 2] }),
      L('a', '…Yemek. Nöbette yenmez. Nöbette yalnız beklenir.', '…Food. One does not eat on watch. On watch, one only waits.', { cam: [130, 80, 3] }),
      L('y', 'Nöbet dediğin yemeksiz tutulmaz. Bozkırda da böyle değil miydi?', 'No watch is kept on an empty stomach. Wasn\'t it so on the steppe?', { cam: [98, 80, 3] }),
      L('a', '…Bozkır. Yıllardır kimse o sözü ağzına almadı.', '…The steppe. No one has spoken that word in years.', { ex: { a: 's' }, cam: [130, 80, 3] }),
      L('n', 'Temel Dede\'nin dediği aklına geliyor: bozkır misafirine önce tuz, sonra ekmek, en son sıcak yemek sunulur.', 'You recall Grandpa Temel\'s words: a steppe guest is offered salt first, then bread, and last the hot meal.', { ex: { a: 't' }, cam: [112, 80, 2] })
    ],
    mini: { type: 'order', title: { tr: 'SOFRA KUR', en: 'SET THE MEAL' }, hint: { tr: 'Bozkır âdeti: önce tuz, sonra ekmek, en son sıcak yemek. Yemek soğumadan üç şeyi sırayla koy.', en: 'Steppe custom: salt, then bread, then the hot meal. Set three things in order before it cools.' },
      items: [['tuz', 'TUZ', 'SALT', '#f2f2f2'], ['ekmek', 'EKMEK', 'BREAD', '#d9a85a'], ['cay', 'ÇAY', 'TEA', '#b5451e'], ['guvec', 'GÜVEÇ', 'STEW', '#b5652e'], ['kasik', 'KAŞIK', 'SPOON', '#9aa0aa']].map(function (q) { return { id: q[0], t: { tr: q[1], en: q[2] }, c: q[3] }; }),
      answer: ['tuz', 'ekmek', 'guvec'], time: 16, meter: { tr: 'YEMEK', en: 'MEAL' }, cam: [112, 84, 2] },
    after: function (r) {
      var pre = r.ok ? [L('n', 'Sırayı bozmadan kurdun. Yabancı bir an gözlerini kapattı.', 'You set it without breaking the order. The stranger closes his eyes for a moment.', { fx: 'ding', ex: { a: 'h' }, cam: [130, 80, 3] }), L('a', 'Tuz, ekmek, sonra ateş. Anamın sofrası böyleydi.', 'Salt, bread, then fire. My mother\'s table was like this.')]
        : [L('n', 'Sıra karıştı, yemek de biraz soğudu. Ama niyet belliydi.', 'The order slipped and the food cooled a little. But your intent was clear.', { cam: [130, 80, 3] }), L('a', 'Sıra yanlış, yemek soğuk... Ama kimse bana kase uzatmamıştı.', 'Wrong order, cold food... But no one had ever offered me a bowl.', { ex: { a: 'h' } })];
      return pre.concat([
        L('n', 'Kaseyi iki eliyle aldı. Bir kaşık, bir kaşık daha.', 'He takes the bowl with both hands. One spoonful, then another.', { it: { y: null, a: 'bowl' }, p: { y: 'idle', a: 'hold' }, ex: { a: 'h' }, cam: [124, 82, 3], fx: 'eat' }),
        L('a', 'Adım Alp Er Tunga. Yayı bu kıyıda gerdiğim günden beri nöbetteyim.', 'My name is Alp Er Tunga. I have kept watch since the day I drew my bow on this shore.', { learn: 'a', fx: 'noeat', it: { a: null }, p: { a: 'knees' }, cam: [130, 80, 3] }),
        L('y', 'Nöbet kimin için?', 'Whose watch?', { cam: [98, 80, 3] }),
        L('a', 'Anam için. Dipte yaşar. Yılanların şahı derler ona: Şahmeran.', 'My mother\'s. She dwells below. They call her the queen of serpents: Shahmeran.', { learn: 's', cam: [130, 80, 3], fx: 'kopuz' }),
        L('a', 'Söz unutuldu, ağıtım susuldu. Bereket çekiliyor. Yarın yayı nasıl gerdiğimi de anlatırım.', 'The promise was forgotten, my lament fell silent. The bounty ebbs. Tomorrow I\'ll show you how I draw the bow.', { ex: { a: 't' } }),
        L('n', 'Ağlardaki balıkların nereye gittiğini ilk kez anladın.', 'For the first time you understand where the fish in your nets have gone.', { cam: [96, 60, 1], fx: 'nosteam' })
      ]);
    },
    res: function (r, r2, ctx) {
      var kit = ctx && ctx.kitchen;
      return { title: r.ok ? { tr: 'SOFRA KURULDU', en: 'THE MEAL IS SET' } : { tr: 'SOĞUK SOFRA', en: 'A COLD MEAL' }, rep: (r.ok ? 8 : 4) + (kit ? 2 : 0), ber: r.ok ? 2 : 1, buffs: [{ id: 'muhafiz', lv: r.ok ? 1 : 0.5 }],
        note: kit ? { tr: 'Güveç kendi mutfağından: +2 itibar. Yarın: Yay ve Kemer.', en: 'The stew came from your own kitchen: +2 reputation. Tomorrow: The Bow and the Belt.' } : { tr: 'Yarın: Yay ve Kemer.', en: 'Tomorrow: The Bow and the Belt.' } };
    }
  };
  /* 7 · Yay ve Kemer */
  DAYS[7] = {
    title: { tr: 'Yay ve Kemer', en: 'The Bow and the Belt' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah. Alp Er Tunga koyda, yalnız sana gösteriyor: yayı kemerine bağlı.', 'Morning. Alp Er Tunga is at the cove, showing only you: the bow hangs from his belt.', { bg: 'dock', show: 'a,y', sit: { a: 0 }, pos: { a: [130, -1], y: [80, 1] }, ex: { a: 'n' }, p: { a: 'idle' }, cam: [110, 60, 1.2], cut: 1, fx: 'bars' }),
      L('a', 'Anamın oğulları arasında bu yayı gerip kemeri kuşanan bendim. Anam bunu hiç unutmaz.', 'Among my mother\'s sons, I was the one who drew this bow and girded the belt. She never forgets it.', { cam: [130, 78, 2.6] }),
      L('a', 'Şimdi sen dene. Hedef değil; denizde bir ışık var, oraya at.', 'Now you try. Not a target; there\'s a light on the sea, shoot there.', { it: { y: 'bow' }, p: { y: 'bow' }, cam: [96, 70, 1.6] })
    ],
    mini: { type: 'bar', title: { tr: 'YAYI GER', en: 'DRAW THE BOW' }, hint: { tr: 'Gösterge yeşile gelince bırak. Üç deneme.', en: 'Release when the gauge is in the green. Three tries.' }, tries: 3, need: 1, speed: 1.4, zone: 0.14, onHit: function () { FX.bow(); } },
    after: function (r) {
      return [
        r.ok ? L('n', 'Ok ışığa değdiğinde deniz bir an açılır gibi oluyor.', 'When the arrow touches the light, the sea seems to open for a moment.', { fx: 'gold', cam: [150, 64, 2] })
             : L('a', 'Kiriş seni sınadı; sen de onu. Ok yine senin olsun.', 'The string tested you, and you tested it. Keep the arrow anyway.', { ex: { a: 'h' }, cam: [130, 78, 2.6] }),
        L('a', 'Bu okla anam seni tanır. Yarın bir haberci gelecek.', 'With this arrow my mother will know you. Tomorrow a messenger will come.', { it: { y: null }, p: { y: 'idle' }, cam: [130, 78, 2.6] }),
        L('n', 'Ertesi sabah iskelede bir yunus bekliyor.', 'The next morning a dolphin waits by the pier.', { show: 'd', hide: 'a', cam: [110, 76, 1.6] })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'ALTIN OK', en: 'GOLDEN ARROW' } : { tr: 'KİRİŞ SINADI', en: 'THE STRING TESTED YOU' }, rep: r.ok ? 7 : 4, buffs: [{ id: 'altinok', lv: r.ok ? 1 : 0.5 }], items: ['altinok'], note: { tr: 'Yarın: Şahmeran.', en: 'Tomorrow: Shahmeran.' } }; }
  };
  /* 8 · Şahmeran */
  DAYS[8] = {
    title: { tr: 'Şahmeran', en: 'Shahmeran' }, when: { tr: 'denizin dibi · 1,5 dk', en: 'beneath the sea · 1.5 min' },
    open: [
      L('n', 'Yunus seni aşağı çekiyor. Işık yeşilleşiyor, ses kısılıyor.', 'The dolphin pulls you down. The light turns green, sounds grow faint.', { bg: 'cave', show: 'y', hide: 'd', pos: { y: [60, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars,deep' }),
      L('n', 'Dipte uzun, sakin bir mağara. Ortasında pullu bir kuyruk kıvrılıyor.', 'Below, a long, quiet cave. In its heart, a scaled tail coils.', { show: 's', pos: { s: 130 }, cam: [130, 70, 1.8] }),
      L('s', 'Herkes benden bir şey ister. Sen oğlumun sofrasını kurdun.', 'Everyone wants something from me. You set my son\'s table.', { cam: [130, 74, 2.6] }),
      L('s', 'Acele etme. Denizin dibinde zaman ağır akar.', 'Do not hurry. At the bottom of the sea, time flows slowly.')
    ],
    mini: { type: 'talk', title: { tr: 'SAKİN SÖYLEŞİ', en: 'A QUIET TALK' }, hint: { tr: 'Aceleci olma; sakin ve dürüst cevaplar göstergeyi doldurur.', en: 'Don\'t rush; calm, honest answers fill the gauge.' }, meter: { tr: 'HUZUR', en: 'CALM' },
      qs: [
        { q: { tr: 'Denizden ne istersin?', en: 'What do you want from the sea?' }, o: [{ tr: 'İhtiyacım kadar balık.', en: 'Only as much fish as I need.', v: 2 }, { tr: 'Daha çok, daha çok!', en: 'More, and more!', v: 0 }, { tr: 'Bilmiyorum... ailemi doyurmak.', en: 'I don\'t know... to feed my family.', v: 1 }] },
        { q: { tr: 'Oğlumu neden doyurdun?', en: 'Why did you feed my son?' }, o: [{ tr: 'Açtı. Başka sebep gerekmez.', en: 'He was hungry. No other reason is needed.', v: 2 }, { tr: 'Bir karşılık umdum.', en: 'I hoped for something in return.', v: 0 }, { tr: 'Hacer Teyze öyle öğretti.', en: 'Aunt Hacer taught me so.', v: 1 }] },
        { q: { tr: 'Yerimi kimseye söyler misin?', en: 'Will you tell anyone where I dwell?' }, o: [{ id: 'soz', tr: 'Söylemem. Söz.', en: 'I won\'t. I promise.', v: 2 }, { id: 'yok', tr: 'Söz veremem; ama deneyeceğim.', en: 'I can\'t promise; but I\'ll try.', v: 1 }] }
      ] },
    after: function (r) {
      return [
        r.last === 'soz' ? L('s', 'Sözünü aldım. Söz, denizden ağırdır.', 'I have your word. A promise weighs more than the sea.', { fx: 'gold' })
                         : L('s', 'Dürüst bir cevap. Yine de bil: bir gün sorulacak.', 'An honest answer. Still, know this: one day it will be asked.', { fx: 'low' }),
        L('s', 'Bir gün biri gelecek; sana tatlı sözle, hasta diye. Hatırla.', 'One day someone will come, with sweet words, saying he is sick. Remember.', { cam: [130, 70, 3] }),
        L('n', 'Yüzeye çıkarken yunus kulağına bir ad fısıldıyor: Cemşab.', 'As you rise, the dolphin whispers a name in your ear: Jamshab.', { hide: 's', show: 'd', pos: { d: 100 }, cam: [96, 60, 1] })
      ];
    },
    res: function (r) { return { title: { tr: 'DİPTEKİ SÖZ', en: 'THE PROMISE BELOW' }, rep: r.ok ? 8 : 5, buffs: [{ id: 'denizsozu', lv: 1 }], pieces: ['sir'], flags: { promise: r.last === 'soz' ? 'given' : 'try' }, note: { tr: 'Yarın: Hasta Vezir.', en: 'Tomorrow: The Sick Vizier.' } }; }
  };
  /* 9 · Hasta Vezir */
  DAYS[9] = {
    title: { tr: 'Hasta Vezir', en: 'The Sick Vizier' }, when: { tr: 'öğleden sonra · 1 dk', en: 'afternoon · 1 min' },
    open: [
      L('n', 'Kış elbiseli, yüzü solgun bir adam pazara geliyor. Öksürüyor, elinde ağır bir para kesesi.', 'A pale man in winter clothes comes to the market. He coughs, a heavy purse in his hand.', { bg: 'market', show: 'v,y', pos: { v: [140, -1], y: [80, 1] }, it: { v: 'purse' }, cam: [110, 64, 1.4], cut: 1, fx: 'bars' }),
      L('v', 'Uzak bir sarayın veziriyim. Hastayım; hekimler çaresiz.', 'I am the vizier of a distant palace. I am ill; the physicians are helpless.', { cam: [140, 76, 2.6], learn: 'v' }),
      L('v', 'Hayatım yılanların şahının elinde. Onu bulan, dilediğini alır.', 'My life lies in the hands of the serpent queen. Whoever finds her may name his price.', { cam: [140, 76, 2.6] }),
      L('v', 'Sen bu koyda yaşıyorsun... Bir şey duydun mu? Gözlerime bak.', 'You live in this cove... Have you heard anything? Look me in the eye.', { ex: { v: 'a' } })
    ],
    mini: { type: 'balance', title: { tr: 'GÖZ GÖZE', en: 'EYE TO EYE' }, hint: { tr: 'Vezirin şüphesi sağa sola kayıyor. Sakin kal: ibreyi ortada tut.', en: 'The vizier\'s suspicion swings. Stay calm: keep the needle centred.' }, time: 13, hold: 4, wild: 1.5, meter: { tr: 'VEZİRİN ŞÜPHESİ', en: 'VIZIER\'S SUSPICION' }, cam: [110, 76, 2] },
    after: function (r) {
      return [
        r.ok ? L('v', 'Hmm... Sen bir şey bilmiyorsun galiba. Yine de bekleyeceğim.', 'Hmm... You don\'t seem to know anything. I\'ll wait all the same.', { ex: { v: 'n' } })
             : L('v', 'Gözlerin kaçtı. Bir şey biliyorsun. Bekleyeceğim, sabırlıyım.', 'Your eyes wavered. You know something. I\'ll wait; I am patient.', { ex: { v: 'a' } }),
        L('n', 'Vezir gitmiyor; tezgâhların yakınına kendine bir konak kurduruyor.', 'The vizier doesn\'t leave; he has a lodge set up near the stalls.', { cam: [96, 60, 1] }),
        L('n', 'Geceleri gölgede bir şeyler yazıyor. Alp Er Tunga höyükten inmiyor.', 'At night he writes in the shadows. Alp Er Tunga does not come down from the mound.', { fx: 'low' })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'SIR SAKLANDI', en: 'THE SECRET HELD' } : { tr: 'VEZİR ŞÜPHELENDİ', en: 'THE VIZIER SUSPECTS' }, rep: r.ok ? 5 : 2, ber: -2, flags: { vizier: 1 }, note: { tr: 'Vezirin arayışı bile denizi huzursuz ediyor. Yarın: Fener Gecesi.', en: 'Even the vizier\'s search unsettles the sea. Tomorrow: The Lantern Night.' } }; }
  };
  /* 10 · Fener Gecesi — tek gerçek seçim */
  DAYS[10] = {
    title: { tr: 'Fener Gecesi', en: 'The Lantern Night' }, when: { tr: 'gece · 1,5 dk', en: 'night · 1.5 min' },
    open: [
      L('n', 'Gece. Vezir iskelenin ucunda, elinde fenerle seni bekliyor. Rüzgâr kayalıklarda uğulduyor.', 'Night. The vizier waits at the end of the pier, lantern in hand. Wind howls in the rocks.', { bg: 'rocks', show: 'v,y', pos: { v: [140, -1], y: [70, 1] }, it: { v: 'lantern', y: 'lantern' }, cam: [100, 64, 1.3], cut: 1, fx: 'bars,wind' }),
      L('v', 'Fenerini kayalıklardan geçir, konuşalım. Sönmesin; karanlıkta yalan kolaydır.', 'Carry your lantern across the rocks and let\'s talk. Don\'t let it die; lies come easy in the dark.', { cam: [140, 76, 2.4] })
    ],
    mini: { type: 'lantern', title: { tr: 'FENERİ KORU', en: 'SHIELD THE LANTERN' }, hint: { tr: 'Rüzgâr gelince basılı tut; sakinken bırak ki alev nefes alsın.', en: 'Hold when the wind comes; let go when calm so the flame can breathe.' }, time: 15, cam: [80, 76, 2.4] },
    mini2: function () {
      return { type: 'choice', title: { tr: 'SÖZ', en: 'THE PROMISE' }, q: { tr: 'Vezir: "Tezgâh, itibar, altın... Hepsi senin. Tek bir şey söyle: Şahmeran nerede?"', en: 'The vizier: "Stalls, fame, gold... All yours. Just tell me one thing: where is Shahmeran?"' },
        opts: [{ id: 'tut', tr: 'Sözümü tutarım. Söylemem.', en: 'I keep my word. I won\'t tell.' }, { id: 'boz', tr: '...Denizin dibinde, höyüğün altında.', en: '...Beneath the sea, below the mound.' }] };
    },
    pre2: function () { return [L('v', 'Fenerin yanıyor. İyi. Şimdi teklifimi dinle.', 'Your lantern still burns. Good. Now hear my offer.', { cam: [140, 76, 2.6] }), L('n', 'Arkada, kayalıkta Alp Er Tunga yayını germeden bekliyor. Kararı sana bırakıyor.', 'Behind, on the rocks, Alp Er Tunga waits with his bow undrawn. He leaves the choice to you.', { show: 'a', sit: { a: 0 }, pos: { a: [20, 1] }, cam: [60, 64, 1.6] })]; },
    after: function (r, r2) {
      return r2.id === 'tut' ? [
        L('v', '...Demek öyle. Anladım.', '...So be it. I understand.', { ex: { v: 't' } }),
        L('n', 'Vezir öfkelenmeden çekiliyor. Koy bir gece huzursuz; ama söz yerinde.', 'The vizier withdraws without anger. The cove is restless for a night; but the promise holds.', { hide: 'v', cam: [96, 60, 1] }),
        L('n', 'Alp Er Tunga yayını indiriyor.', 'Alp Er Tunga lowers his bow.', { ex: { a: 'h' } })
      ] : [
        L('v', 'Teşekkürler. Şifam artık yakın.', 'Thank you. My cure is near.', { ex: { v: 'h' } }),
        L('n', 'Vezir güneş doğmadan kayalara iniyor. Şahmeran derinlere çekiliyor; Alp Er Tunga susuyor.', 'The vizier climbs down to the rocks before dawn. Shahmeran withdraws into the deep; Alp Er Tunga falls silent.', { hide: 'v', fx: 'deep', cam: [96, 60, 1] }),
        L('n', 'Kimse ölmüyor. Yalnız deniz sessizleşiyor.', 'No one dies. Only the sea grows quiet.', { ex: { a: 't' } })
      ];
    },
    res: function (r, r2) {
      var keep = r2.id === 'tut';
      return { title: keep ? { tr: 'SÖZ TUTULDU', en: 'THE PROMISE KEPT' } : { tr: 'SÖZ BOZULDU', en: 'THE PROMISE BROKEN' }, rep: keep ? 10 : 3, berSet: keep ? 5 : 3, flags: { promise: keep ? 'kept' : 'broken' },
        note: keep ? { tr: 'Yarın koy toplanacak. Ağıt söylenecek.', en: 'Tomorrow the cove gathers. The lament will be sung.' } : { tr: 'Telafi yolu açık: yarın ağıtı sen başlatacaksın.', en: 'There is a way to make amends: tomorrow you will begin the lament.' } };
    }
  };
  /* 11 · Ağıt Gecesi */
  var AGIT = {
    kept: [
      L('a', 'Yüzyıllardır bu ağıdı kimse söylemedi. Bu gece duymak istiyorum.', 'For centuries no one has sung this lament. Tonight I want to hear it.', { cam: [96, 70, 2] })
    ],
    broken: [
      L('n', 'Koy sessiz. Alp Er Tunga konuşmuyor. Ağıdı sen başlatmalısın.', 'The cove is silent. Alp Er Tunga does not speak. You must begin the lament.', { ex: { a: 't' }, cam: [96, 70, 2] })
    ]
  };
  DAYS[11] = {
    title: { tr: 'Ağıt Gecesi', en: 'The Night of the Lament' }, when: { tr: 'gece · 1,5 dk', en: 'night · 1.5 min' },
    open: function (ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return [
        L('n', 'Höyüğün dibinde bütün koy toplanmış: Hacer çorba getirmiş, Kalender meşale, Temel Dede kopuz.', 'The whole cove gathers at the foot of the mound: Hacer brought soup, Kalender a torch, Grandpa Temel his kopuz.', { bg: 'ritual', show: 'h,k,t,a,y', sit: { a: 0 }, pos: { h: [30, 1], k: [160, -1], t: [130, -1], a: [96, 1], y: [60, 1] }, it: { t: 'kopuz', h: 'bowl' }, cam: [96, 60, 1], cut: 1, fx: 'bars' })
      ].concat(br ? AGIT.broken : AGIT.kept);
    },
    mini: { type: 'rhythm', title: { tr: 'AĞIT', en: 'THE LAMENT' }, hint: { tr: 'Nota çizgiye gelince vur. Ağır başlar, ninniye döner.', en: 'Strike as each note meets the line. It starts slow and turns into a lullaby.' }, bpm: 66, pattern: [0, 1, 2, 3, 5, 6, 7, 8, 10, 10.5, 11, 11.5, 12.5, 13, 13.5, 14], freqs: [294, 311, 370, 392], need: 0.55, cam: [96, 70, 1.6] },
    after: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      var song = [
        L('t', '"Kıyıda bir yay asılı, kirişi rüzgâr çalar..."', '"A bow hangs on the shore, the wind plays its string..."', { fx: 'kopuz', cam: [130, 76, 2.4] }),
        L('h', '"Dipte bir ana uyur, sözü deniz saklar..."', '"Below, a mother sleeps; the sea keeps her word..."', { cam: [30, 76, 2.4] }),
        L('a', '"Uyu anam, uyu. Bekçin yine burada."', '"Sleep, mother, sleep. Your keeper is here again."', { ex: { a: 'h' }, cam: [96, 76, 2.8] })
      ];
      return song.concat(br ? [
        L('n', 'Alp Er Tunga yeniden yay kirişine dokunuyor. Karanlıkta vezir geri dönüyor, eli boş, yüzü utançlı.', 'Alp Er Tunga touches his bowstring again. In the dark the vizier returns, empty-handed, ashamed.', { show: 'v', pos: { v: [180, -1] }, cam: [150, 70, 1.6] }),
        L('v', 'Aşağıda kimse yoktu. Yalnız soğuk ve sessizlik. Belki şifa başka yerdedir.', 'There was no one below. Only cold and silence. Perhaps the cure lies elsewhere.', { ex: { v: 't' } })
      ] : [
        L('n', 'Vezir de gelmiş; çorba masasına oturuyor. Bir kaşık, bir kaşık daha.', 'The vizier came too; he sits at the soup table. One spoonful, then another.', { show: 'v', pos: { v: [180, -1] }, cam: [150, 70, 1.6] }),
        L('v', 'Şifayı yılanların şahında aradım. Meğer sofradaymış: yemek, dinlenmek, bir koyun sıcaklığı.', 'I sought my cure from the serpent queen. It was at the table all along: food, rest, the warmth of a cove.', { ex: { v: 'h' } })
      ]).concat([L('n', 'Şafakta ufukta ilk beyaz parıltı.', 'At dawn, the first white gleam on the horizon.', { cam: [96, 60, 1], fx: 'gold' })]);
    },
    res: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return { title: { tr: 'AĞIT SÖYLENDİ', en: 'THE LAMENT IS SUNG' }, rep: (br ? 6 : 10) + (r.ok ? 4 : 0), berSet: br ? 5 : 8, pieces: ['agit'], flags: { lament: 1 }, note: { tr: 'Yarın: Bereket Sabahı.', en: 'Tomorrow: The Morning of Bounty.' } };
    }
  };
  /* 12 · Bereket Sabahı */
  DAYS[12] = {
    title: { tr: 'Bereket Sabahı', en: 'The Morning of Bounty' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah ağlar ağır geliyor: içleri hamsi, uskumru, levrek dolu.', 'In the morning the nets come up heavy: full of anchovy, mackerel, sea bass.', { bg: 'dawn_mound', show: 'y,a,h,k', sit: { a: 0 }, pos: { y: [80, 1], a: [140, -1], h: [30, 1], k: [170, -1] }, it: { h: null }, cam: [96, 60, 1], cut: 1, fx: 'bars,ding' }),
      L('n', 'Dipten bir yunus sıçrıyor. Kısa bir an, derinden bir ses: "Sözün denizden ağır geldi."', 'A dolphin leaps from the deep. For a brief moment, a voice from below: "Your word weighed more than the sea."', { show: 'd', pos: { d: 150 }, fx: 'splash', cam: [150, 70, 2] }),
      L('a', 'Yayımı höyüğe asacağım. Bundan sonra nöbeti birlikte tutarız.', 'I will hang my bow on the mound. From now on we keep watch together.', { hide: 'd', ex: { a: 'h' }, cam: [140, 76, 2.6] })
    ],
    mini: { type: 'choice', title: { tr: 'BEKÇİYE', en: 'TO THE KEEPER' }, q: { tr: 'Alp Er Tunga\'ya ne söylersin?', en: 'What do you say to Alp Er Tunga?' },
      opts: [{ id: 'sofra', tr: '"Sofran her akşam hazır."', en: '"Your table will be ready every evening."' }, { id: 'ag', tr: '"Ağıdını her yıl birlikte söyleriz."', en: '"We will sing your lament together every year."' }, { id: 'soz', tr: '"Söz, denizden ağırdır."', en: '"A promise weighs more than the sea."' }] },
    after: function (r, r2, ctx) {
      var line = r.id === 'sofra' ? L('a', 'Tuz, ekmek, sonra ateş. Unutma.', 'Salt, bread, then fire. Don\'t forget.', { ex: { a: 'h' } })
        : r.id === 'ag' ? L('a', 'O zaman anam hiç yalnız kalmaz.', 'Then my mother will never be alone.', { ex: { a: 'h' } })
        : L('a', 'Anamın sözü. Artık senin de sözün.', 'My mother\'s words. Now they are yours too.', { ex: { a: 'h' } });
      return [line,
        L('n', 'Alp Er Tunga yayını höyüğe asıyor. Koy, sözü ve ağıdı geri getirdi.', 'Alp Er Tunga hangs his bow on the mound. The cove has brought back the promise and the lament.', { fx: 'kopuz', cam: [96, 60, 1] }),
        L('n', 'Sezon bitmiyor: her yıl aynı gün, bekçi höyükte yeniden belirecek.', 'The season doesn\'t end: every year on this day, the keeper will return to the mound.', {})];
    },
    res: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return { title: { tr: 'BEREKET GERİ DÖNDÜ', en: 'THE BOUNTY RETURNS' }, rep: 20, berSet: br ? 8 : 10, buffs: [{ id: 'bekci', lv: 1 }, { id: 'muhafiz', lv: 1 }], flags: { done: 1 },
        note: br ? { tr: 'Telafi yoluyla tamamlandı. Unvanın: Dipteki Sözün Bekçisi.', en: 'Completed through amends. Your title: Keeper of the Promise Below.' } : { tr: 'Söz tutuldu. Unvanın: Dipteki Sözün Bekçisi.', en: 'The promise was kept. Your title: Keeper of the Promise Below.' } };
    }
  };

  /* ---------------- dış arayüz ---------------- */
  function open(n, host) {
    if (running) return false;
    var D = DAYS[n]; if (!D) return false;
    HOST = host || {}; LANG = HOST.lang === 'en' ? 'en' : 'tr'; onDone = HOST.onDone || null;
    CTX = { day: n, ber: HOST.ber || 6, flags: HOST.flags || {}, kitchen: !!HOST.kitchen, known: {} };
    (HOST.known || []).forEach(function (k) { CTX.known[k] = 1; });
    AC = HOST.audio || null; DST = HOST.dst || (AC ? AC.destination : null);
    freshState(); build(); fit(); hud(); running = true; last = performance.now(); raf = requestAnimationFrame(frame);
    el.skip.textContent = tx(UI.skip);
    el.ovk.textContent = tx(UI.story) + ' · ' + tx(UI.day) + ' ' + n + ' · ' + tx(D.when); el.ovh.textContent = tx(D.title);
    showPanel('dlg'); el.who.textContent = ''; el.txt.textContent = ''; mode = 'intro';
    setTimeout(function () {
      if (!running) return; el.ov.classList.add('off');
      var openList = typeof D.open === 'function' ? D.open(CTX) : D.open;
      play(openList, function () {
        startMini(D.mini, function (r1) {
          var go2 = D.mini2 ? D.mini2(r1, CTX) : null;
          function after(r2) { play(D.after(r1, r2, CTX), function () { var res = D.res(r1, r2, CTX); res.day = n; res.known = Object.keys(CTX.known); res.r1 = r1; res.r2 = r2 || null; if (r1.skipped || (r2 && r2.skipped)) res.skipped = true; result(res); }); }
          if (go2) { var pre = D.pre2 ? D.pre2(r1, CTX) : []; play(pre, function () { startMini(go2, after); }); }
          else after(null);
        });
      });
    }, RM ? 400 : 1600);
    return true;
  }
  /* oyunda koya gerçekten gelen karakterler (specials.js biçiminde görünüş) ve her günün tezgâha gelen ziyaretçisi */
  var CAST = {
    k: { n: { tr: 'Kalender', en: 'Kalender' }, job: { tr: 'Balıkçı', en: 'Fisherman' }, sfx: 'hmm', fx: '?', fxc: '#9fd3b0',
      look: { coat: '#557563', coat2: '#6a8a78', beanie: '#34463a', must: true, hair: '#2a2018', hairStyle: 0, sk: 1, pants: '#2e3a34' } },
    h: { n: { tr: 'Hacer Teyze', en: 'Aunt Hacer' }, job: { tr: 'Komşu', en: 'Neighbour' }, sfx: 'sigh', fx: '♥', fxc: '#ff8a6a',
      look: { short: 1, belly: 1, coat: '#c8553d', coat2: '#d8704f', scarf: '#7a2a4a', scarfDots: true, hair: '#8a8a86', hairStyle: 6, sk: 0, skirt: '#4a3a5a' } },
    t: { n: { tr: 'Temel Dede', en: 'Grandpa Temel' }, job: { tr: 'Koyun yaşlısı', en: 'Cove elder' }, sfx: 'hmm', fx: '~', fxc: '#e8dcc0',
      look: { coat: '#8a7a5a', coat2: '#9e8e6a', cap: '#3a3028', beard: true, hair: '#e8e4da', hairStyle: 4, sk: 1, pants: '#4a4034' } },
    a: { n: { tr: 'Alp Er Tunga', en: 'Alp Er Tunga' }, job: { tr: 'Yabancı', en: 'Stranger' }, sfx: 'drum', fx: '✦', fxc: '#e4b94a',
      look: { tall: 1, coat: '#7a3a24', coat2: '#94502e', beanie: '#c0392b', sash: '#e4b94a', cape: '#4a2a1a', must: true, hair: '#1d1713', hairStyle: 0, sk: 2, pants: '#3a2a1a' } },
    v: { n: { tr: 'Hasta Vezir', en: 'The Sick Vizier' }, job: { tr: 'Yolcu', en: 'Traveller' }, sfx: 'sigh', fx: '·', fxc: '#b8c0e0',
      look: { coat: '#2a3050', coat2: '#3a4268', turban: '#e8e2d2', chain: true, hair: '#4a3a2a', hairStyle: 0, sk: 0, pants: '#1e2238', bigBag: '#6b4a2a' } }
  };
  var VISIT = [null, 'k', 'h', 'h', 'k', 't', 'h', 'a', 'a', 'v', 'v', 't', 'a'];
  window.HK_STORY = {
    cast: CAST, visitor: function (n) { return VISIT[n] || null; },
    days: 12, open: open, isOpen: function () { return running; }, close: function () { destroy(); },
    title: function (n, lang) { var l = LANG; LANG = lang || LANG; var t = DAYS[n] ? tx(DAYS[n].title) : ''; LANG = l; return t; },
    buffs: BUFFS, items: ITEMS, pieces: PIECES,
    _tap: tap, _skip: skip, _mode: function () { return mode; }, _mini: function () { return MG; }, _cfg: function () { return mode === 'mini' ? CFG : null; }
  };
})();
