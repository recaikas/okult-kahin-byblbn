/* =====================================================================
   HAMSİ KOYU — İNCE PİKSEL SANAT TEMELİ (mimar)
   Sanatçı dosyalarının (arkaplan.js, karakter.js, nesne.js) ortak araçları.

   SÖZLEŞME
   • Oyun (game.js) her çizim fonksiyonunu sarar. İnce tuvalde (HKG.K > 1) window.HKA[ad] varsa önce o çağrılır,
     aynı argümanlarla. false dönerse klasik çizim yapılır. Hata atarsa klasik çizime düşülür (bir kez uyarı).
   • Ana tuvalin dönüşümü dünya birimindedir (eski sanat pikseli): px(x,y,1,1) eskisi gibi 1 sanat pikseli (= K×K ince piksel).
     İnce çizim için koordinatı 1/K adımla verin ya da aşağıdaki Buf + sprite + blit üçlüsünü kullanın.
   • Oyunun içine yalnız HKG ile bakılır (okuma). Oyun durumuna yazılmaz.
   • Sprite'lar önbelleğe alınır: anahtar, görünüşü belirleyen her şeyi içermeli (seviye, yön, kare, renk…).

   İZOMETRİ (game.js ile aynı): pX = (x - y) * 12, pY = (x + y) * 6 - z   (x,y karo, z sanat pikseli)
   Buf içinde 'U birimi' = karo * 12. L.sx(U,V) = (U - V) * K, L.sy(U,V,z) = ((U + V) / 2 - z) * K  (ince piksel).
   ===================================================================== */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib = {};
var G = function () { return window.HKG; };

/* ---------------- renk ---------------- */
var _hx = {};
function hx(c) {
  var v = _hx[c]; if (v) return v;
  if (c.charAt(0) === '#') {
    if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    v = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255];
  } else {
    var m = c.match(/rgba?\(([^)]+)\)/); var a = m ? m[1].split(',').map(parseFloat) : [0, 0, 0, 1];
    v = [a[0], a[1], a[2], Math.round((a[3] === undefined ? 1 : a[3]) * 255)];
  }
  return (_hx[c] = v);
}
function th(a) { return '#' + [a[0], a[1], a[2]].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
function mix(a, b, t) { var A = hx(a), B = hx(b); return th([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
function dark(c, t) { return mix(c, '#20142a', t); }      /* gölge mora kayar (Kairosoft tonu) */
function lite(c, t) { return mix(c, '#fffbe8', t); }      /* ışık sıcak beyaza */
function hash(a, b) { var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
var bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map(function (r) { return r.map(function (v) { return (v + 0.5) / 16; }); });
/* 3 ton: ışık sol üstten. tone(c) → {l: ışık, m: orta, d: gölge, o: kontur} */
var _tone = {};
function tone(c) { return _tone[c] || (_tone[c] = { l: lite(c, 0.22), m: c, d: dark(c, 0.26), o: dark(c, 0.62) }); }
L.hx = hx; L.th = th; L.mix = mix; L.dark = dark; L.lite = lite; L.hash = hash; L.bayer = bayer; L.tone = tone;

/* ---------------- ince piksel tamponu ----------------
   Koordinatlar ince piksel, sprite'ın çapa noktasına göre (0,0 = çapa). Alfa destekli. */
var OFF = 4096, SPAN = 8192;
function Buf() { this.p = new Map(); }
Buf.prototype.set = function (x, y, c, a) {
  x = Math.round(x); y = Math.round(y);
  var k = (y + OFF) * SPAN + (x + OFF);
  if (a !== undefined && a < 1) { var o = this.p.get(k); c = o ? mixA(o, c, a) : { c: c, a: a }; }
  this.p.set(k, c);
};
function mixA(o, c, a) {
  if (typeof o === 'string') return mix(o, c, a);
  var na = o.a + a * (1 - o.a); return { c: mix(o.c, c, a / Math.max(0.001, na)), a: na };
}
Buf.prototype.get = function (x, y) { var v = this.p.get((Math.round(y) + OFF) * SPAN + (Math.round(x) + OFF)); return typeof v === 'object' ? v && v.c : v; };
Buf.prototype.has = function (x, y) { return this.p.has((Math.round(y) + OFF) * SPAN + (Math.round(x) + OFF)); };
Buf.prototype.del = function (x, y) { this.p.delete((Math.round(y) + OFF) * SPAN + (Math.round(x) + OFF)); };
Buf.prototype.rect = function (x, y, w, h, c, a) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c, a); return this; };
Buf.prototype.hline = function (x, y, w, c, a) { return this.rect(x, y, w, 1, c, a); };
Buf.prototype.vline = function (x, y, h, c, a) { return this.rect(x, y, 1, h, c, a); };
Buf.prototype.circ = function (cx, cy, r, c, a) { for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.set(cx + x, cy + y, c, a); return this; };
Buf.prototype.ellipse = function (cx, cy, rx, ry, c, a) { for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + 0.3) + (y * y) / (ry * ry + 0.3) <= 1) this.set(cx + x, cy + y, c, a); return this; };
/* koyu kontur: boş komşulara, komşu rengin koyusu (t). only: yalnız dışa (varsayılan) */
Buf.prototype.outline = function (t, col) {
  var add = [], self = this;
  this.p.forEach(function (c, k) {
    if (typeof c === 'object') { if (c.a < 0.6) return; c = c.c; }
    var x = (k % SPAN) - OFF, y = Math.floor(k / SPAN) - OFF;
    for (var d = 0; d < 4; d++) {
      var nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
      var nk = (ny + OFF) * SPAN + (nx + OFF);
      if (!self.p.has(nk)) add.push(nk, col || dark(c, t === undefined ? 0.6 : t));
    }
  });
  for (var i = 0; i < add.length; i += 2) if (!this.p.has(add[i])) this.p.set(add[i], add[i + 1]);
  return this;
};
/* başka tamponu üstüne bas (dx,dy kaydırarak) */
Buf.prototype.put = function (b, dx, dy, a) {
  var self = this; dx = dx || 0; dy = dy || 0;
  b.p.forEach(function (c, k) {
    var x = (k % SPAN) - OFF + dx, y = Math.floor(k / SPAN) - OFF + dy;
    if (typeof c === 'object') self.set(x, y, c.c, c.a * (a === undefined ? 1 : a)); else self.set(x, y, c, a);
  });
  return this;
};
/* tampon → sprite (offscreen tuval). Çapa (0,0) sprite.x0/y0 ile korunur */
Buf.prototype.toSprite = function () {
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  this.p.forEach(function (c, k) { var x = (k % SPAN) - OFF, y = Math.floor(k / SPAN) - OFF; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; });
  if (x0 > x1) return { cv: null, x0: 0, y0: 0, w: 0, h: 0 };
  var w = x1 - x0 + 1, h = y1 - y0 + 1, cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d'), id = g.createImageData(w, h), d = id.data;
  this.p.forEach(function (c, k) {
    var x = (k % SPAN) - OFF - x0, y = Math.floor(k / SPAN) - OFF - y0, i = (y * w + x) * 4, v, a = 255;
    if (typeof c === 'object') { v = hx(c.c); a = Math.round(c.a * 255); } else { v = hx(c); a = v[3]; }
    d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = a;
  });
  g.putImageData(id, 0, 0);
  return { cv: cv, x0: x0, y0: y0, w: w, h: h };
};
L.Buf = Buf;
L.buf = function () { return new Buf(); };

/* ---------------- sprite önbelleği ---------------- */
var cache = new Map(), MAXC = 3000;
L.sprite = function (key, build) {
  var s = cache.get(key);
  if (s) return s;
  var b = new Buf(); build(b);
  s = b.toSprite();
  if (cache.size > MAXC) cache.clear();        /* basit üst sınır: dolunca baştan (nadiren olur) */
  cache.set(key, s);
  return s;
};
L.cacheSize = function () { return cache.size; };
/* sprite'ı ana tuvale çiz: (ax, ay) çapanın dünya-ekran konumu (sanat pikseli, kesirli olabilir; ince piksele hizalanır) */
L.blit = function (s, ax, ay, alpha) {
  if (!s || !s.cv) return;
  var H = G(), g = H.ctx, K = H.K;
  var fx = Math.round(ax * K) + s.x0, fy = Math.round(ay * K) + s.y0;
  if (alpha !== undefined && alpha < 1) { var ga = g.globalAlpha; g.globalAlpha = ga * alpha; g.drawImage(s.cv, fx / K, fy / K, s.w / K, s.h / K); g.globalAlpha = ga; }
  else g.drawImage(s.cv, fx / K, fy / K, s.w / K, s.h / K);
};
/* aynayla (sola bakan) çizim: çapa x'e göre yatay çevirir */
L.blitFlip = function (s, ax, ay, alpha) {
  if (!s || !s.cv) return;
  var H = G(), g = H.ctx, K = H.K;
  var fx = Math.round(ax * K), fy = Math.round(ay * K) + s.y0;
  g.save(); g.translate(fx / K, 0); g.scale(-1, 1);
  if (alpha !== undefined) g.globalAlpha *= alpha;
  g.drawImage(s.cv, s.x0 / K, fy / K, s.w / K, s.h / K);
  g.restore();
};
/* doğrudan ince dikdörtgen: (ax,ay) sanat pikseli çapa + (fx,fy) ince piksel kayma */
L.fr = function (ax, ay, fx, fy, fw, fh, c) {
  var H = G(), g = H.ctx, K = H.K;
  g.fillStyle = c; g.fillRect((Math.round(ax * K) + fx) / K, (Math.round(ay * K) + fy) / K, fw / K, fh / K);
};

/* ---------------- izometri (Buf içinde, ince piksel) ---------------- */
L.sx = function (U, V) { return (U - V) * G().K; };
L.sy = function (U, V, z) { return ((U + V) / 2 - (z || 0)) * G().K; };
/* izometrik kutu: U0..U1 × V0..V1 taban, z0'dan h yükseklik. f = {top(u,v), left(u,z), right(v,z)} → renk.
   u,v,z kutu içi yerel (U birimi). left = önde sol yüz (V = V1), right = önde sağ yüz (U = U1). */
L.isoBox = function (b, U0, V0, U1, V1, z0, h, f) {
  var K = G().K, zt = z0 + h;
  var minX = Math.floor((U0 - V1) * K) - 2, maxX = Math.ceil((U1 - V0) * K) + 2;
  var minY = Math.floor(((U0 + V0) / 2 - zt) * K) - 2, maxY = Math.ceil(((U1 + V1) / 2 - z0) * K) + 2;
  for (var py = minY; py <= maxY; py++) for (var px = minX; px <= maxX; px++) {
    var u = (px + 0.5) / K, v = (py + 0.5) / K;
    var X = (u + 2 * (v + zt)) / 2, Y = (2 * (v + zt) - u) / 2;
    if (f.top && X >= U0 && X < U1 && Y >= V0 && Y < V1) { var ct = f.top(X - U0, Y - V0); if (ct) b.set(px, py, ct); continue; }
    if (h > 0) {
      X = u + V1; var Z = (X + V1) / 2 - v;
      if (f.left && X >= U0 && X < U1 && Z >= z0 && Z < zt) { var cl = f.left(X - U0, Z - z0); if (cl) b.set(px, py, cl); continue; }
      Y = U1 - u; Z = (U1 + Y) / 2 - v;
      if (f.right && Y >= V0 && Y < V1 && Z >= z0 && Z < zt) { var cr = f.right(Y - V0, Z - z0); if (cr) b.set(px, py, cr); }
    }
  }
  return b;
};
L.solid = function (t, l, r) { return { top: function () { return t; }, left: function () { return l; }, right: function () { return r; } }; };
/* tek renkten 3 tonlu kutu yüzleri (üst ışık, sol orta, sağ gölge) */
L.toned = function (c) { var T = tone(c); return { top: function (u, v) { return (u < 0.6 || v < 0.6) ? lite(c, 0.32) : T.l; }, left: function () { return T.m; }, right: function () { return T.d; } }; };

/* ---------------- EPX (Scale2x) — 1x çizimi 2x'e yumuşatır + ince kontur ----------------
   Klasik bir çizim fonksiyonunu 1x ara tuvale çizip (HKG.withCtx, k=1 → kancasız klasik) Scale2x ile inceltir.
   Elle yeniden çizilmemiş küçük nesneler için; sonuç önbelleğe alınır (key). */
var epxCv = null;
L.epx = function (key, w, h, ox, oy, draw, ol) {
  return L.sprite(key, function (b) {
    if (!epxCv) { epxCv = document.createElement('canvas'); }
    epxCv.width = w; epxCv.height = h;
    var g = epxCv.getContext('2d', { willReadFrequently: true });
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.imageSmoothingEnabled = false;
    g.setTransform(1, 0, 0, 1, ox, oy);
    G().withCtx(g, 1, draw);
    var d = g.getImageData(0, 0, w, h).data;
    function at(x, y) { if (x < 0 || y < 0 || x >= w || y >= h) return null; var i = (y * w + x) * 4; if (d[i + 3] < 40) return null; return d[i] << 16 | d[i + 1] << 8 | d[i + 2]; }
    function hex(v) { return '#' + (v | 0x1000000).toString(16).slice(1); }
    var K = G().K;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var P = at(x, y); if (P === null) continue;
      var A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
      var e0 = P, e1 = P, e2 = P, e3 = P;
      if (C === A && C !== D && A !== B && A !== null) e0 = A;
      if (A === B && A !== C && B !== D && B !== null) e1 = B;
      if (D === C && D !== B && C !== A && C !== null) e2 = C;
      if (B === D && B !== A && D !== C && D !== null) e3 = D;
      var al = d[(y * w + x) * 4 + 3] / 255, fx = (x - ox) * K, fy = (y - oy) * K;
      b.set(fx, fy, hex(e0), al); b.set(fx + 1, fy, hex(e1), al); b.set(fx, fy + 1, hex(e2), al); b.set(fx + 1, fy + 1, hex(e3), al);
    }
    if (ol !== false) b.outline(ol || 0.5);
  });
};

/* ---------------- dokular ---------------- */
/* dikey bayer geçişli renk bandı: stops dizisi, N ton, (x,y) için renk */
L.gradCol = function (stops, N, f, x, y) {
  var q = Math.max(0, Math.min(1, f)) * (N - 1), i = Math.floor(q), fr = q - i;
  var a = i, c = fr > bayer[y & 3][x & 3] ? Math.min(N - 1, i + 1) : i;
  var s = c / (N - 1) * (stops.length - 1), k = Math.floor(s), t = s - k;
  return mix(stops[k], stops[Math.min(stops.length - 1, k + 1)], t);
};
/* 3x5 piksel yazı (tabelalar) */
var GL = { A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'], G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'], M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'], 'Ü': ['#.#', '...', '#.#', '#.#', '###'], 'Ö': ['#.#', '...', '###', '#.#', '###'], 'Ç': ['.##', '#..', '#..', '.##', '.#.'], 'Ş': ['.##', '#..', '.#.', '..#', '##.'], 'İ': ['.#.', '...', '###', '.#.', '###'], 'Ğ': ['###', '...', '.##', '#.#', '.##'], '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'], '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'], '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'], '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '##.'], ' ': ['...', '...', '...', '...', '...'], '.': ['...', '...', '...', '...', '.#.'], '-': ['...', '...', '###', '...', '...'] };
L.text = function (b, str, x, y, c) {
  str = String(str).toLocaleUpperCase('tr');
  for (var i = 0; i < str.length; i++) { var g = GL[str[i]] || GL[' ']; for (var j = 0; j < 5; j++) for (var k = 0; k < 3; k++) if (g[j][k] === '#') b.set(x + i * 4 + k, y + j, c); }
  return str.length * 4 - 1;
};
L.textW = function (str) { return String(str).length * 4 - 1; };
/* izometrik yumuşak gölge (ince) — Buf'a */
L.shadowB = function (b, cx, cy, rw, rh, a) {
  for (var j = -rh; j <= rh; j++) { var rr = rw * Math.sqrt(Math.max(0, 1 - (j * j) / (rh * rh + 0.5))); for (var i = -Math.round(rr); i <= Math.round(rr); i++) b.set(cx + i, cy + j, '#14303c', (a || 0.26) - Math.abs(i) / (rw + 1) * 0.1); }
  return b;
};

/* ince modu kapat/aç ya da ayar değişince önbellekleri temizle (sanatçılar HKA.onReset'e kendi temizliklerini ekler) */
HKA._resets = HKA._resets || [];
HKA.onReset = function (fn) { HKA._resets.push(fn); };
HKA.reset = function () { cache.clear(); HKA._resets.forEach(function (f) { try { f(); } catch (e) { } }); };
})();
