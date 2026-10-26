/* HAMSİ KOYU — ince piksel: arkaplan (sanatçı dosyası)
   Gökyüzü + bulut + uzak martılar, uzak kasaba (iki katman tepe, kiremitli evler, cami + minare, servi),
   katmanlı deniz + parıltı, sığ su, köpük, kum (dalga izi, çakıl, ot), yol, meydan + köprü, hizmet sahası.

   PERFORMANS
   • Büyük katmanlar bir kez Uint8 tampona (Ras) yazılır, offscreen tuvale çevrilir; her karede yalnız drawImage.
   • Gökyüzü / deniz / derin su: 512 ince piksel genişlikte yatayda döşenen şeritler (W'ye bağlı değil, yeniden kurulmaz).
   • Kara: dünya uzayında 256×256'lık parçalar; görünen parça yoksa o karede kurulur. Kurma bütçesi kare başına
     ~9 ms: bütçe dolduysa o kanca false döner (o kare klasik çizim), sonraki karede devam edilir. Boş zamanda
     kalan parçalar önceden kurulur.
   • Canlı parçalar (kıyıya gelen köpük dalgası, parıltı, dalga tepesi, balık gölgesi) küçük sprite + konum/alfa. */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib;
if (!L) return;
var G = function () { return window.HKG; };
var hash = L.hash, bayer = L.bayer, TAU = Math.PI * 2;
var sin = Math.sin, floor = Math.floor, round = Math.round, abs = Math.abs, min = Math.min, max = Math.max;
function mod(a, n) { return ((a % n) + n) % n; }
function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

/* ---------------- renk (dizi: [r,g,b]) ---------------- */
var _c = {};
function C(c) { var v = _c[c]; if (v) return v; var h = L.hx(c); return (_c[c] = [h[0], h[1], h[2]]); }
function mx(a, b, t) { if (typeof a === 'string') a = C(a); if (typeof b === 'string') b = C(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function dk(c, t) { return mx(c, '#20142a', t); }
function lt(c, t) { return mx(c, '#fffbe8', t); }
function ramp(stops, N) {
  var out = [];
  for (var k = 0; k < N; k++) { var q = k / (N - 1) * (stops.length - 1), a = floor(q), b = min(stops.length - 1, a + 1); out.push(mx(stops[a], stops[b], q - a)); }
  return out;
}
/* bayer geçişli renk seçimi */
function rampAt(cols, f, x, y) {
  var N = cols.length; f = f < 0 ? 0 : f > 1 ? 1 : f;
  var q = f * (N - 1), i = floor(q);
  if (q - i > bayer[y & 3][x & 3] && i < N - 1) i++;
  return cols[i];
}

/* ---------------- hızlı ince piksel tamponu ----------------
   (ox, oy): tamponun sol üstünün kendi uzayındaki ince piksel konumu. wx/wy: yatay/dikey döşenebilir (sarar). */
function Ras(w, h, ox, oy, wx, wy) { this.w = w; this.h = h; this.ox = ox || 0; this.oy = oy || 0; this.wx = !!wx; this.wy = !!wy; this.d = new Uint8ClampedArray(w * h * 4); this.any = false; }
Ras.prototype.setI = function (x, y, c, a) {
  var d = this.d, i = (y * this.w + x) * 4;
  if (typeof c === 'string') c = C(c);
  if (a === undefined || a >= 1) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; this.any = true; return; }
  if (a <= 0) return;
  this.any = true;
  var da = d[i + 3] / 255, k = da * (1 - a), na = a + k;
  d[i] = (c[0] * a + d[i] * k) / na; d[i + 1] = (c[1] * a + d[i + 1] * k) / na; d[i + 2] = (c[2] * a + d[i + 2] * k) / na; d[i + 3] = na * 255;
};
Ras.prototype.set = function (x, y, c, a) {
  x = round(x) - this.ox; y = round(y) - this.oy;
  if (this.wx) x = mod(x, this.w);
  if (this.wy) y = mod(y, this.h);
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
  this.setI(x, y, c, a);
};
Ras.prototype.rect = function (x, y, w, h, c, a) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c, a); };
Ras.prototype.circ = function (cx, cy, r, c, a) { for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.set(cx + x, cy + y, c, a); };
Ras.prototype.sprite = function () {
  if (!this.any) return null;
  var cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
  var g = cv.getContext('2d'), id = g.createImageData(this.w, this.h);
  id.data.set(this.d); g.putImageData(id, 0, 0);
  this.d = null;
  return { cv: cv, ox: this.ox, oy: this.oy, w: this.w, h: this.h };
};
/* sprite'ı ince piksel konumuna çiz (geçerli dönüşümde; dönüşüm ölçeği K) */
function put(s, fx, fy, a) {
  if (!s) return;
  var H = G(), g = H.ctx, K = H.K;
  if (a !== undefined && a < 1) {
    if (a <= 0.01) return;
    var ga = g.globalAlpha; g.globalAlpha = ga * a;
    g.drawImage(s.cv, fx / K, fy / K, s.w / K, s.h / K);
    g.globalAlpha = ga;
  } else g.drawImage(s.cv, fx / K, fy / K, s.w / K, s.h / K);
}

/* ---------------- bütçeli önbellek ---------------- */
var store = new Map(), budgetEnd = 0, BUDGET = 9;
function need(key, build, force) {
  if (store.has(key)) return store.get(key);
  if (!force && now() > budgetEnd) return undefined;
  var t0 = now(), v = build(); store.set(key, v); BT_MS[key] = round(now() - t0); return v;
}
var BT_MS = HKA._bgMs = {};      /* kurma süreleri (ms), teşhis için */

/* dünya dikdörtgenini (z'li) kaplayan tampon: ince piksel, dünya-ekran uzayında (pX/pY × K) */
function worldRas(x0, y0, x1, y1, zTop, pad) {
  var K = G().K;
  var u0 = (x0 - y1) * 12, u1 = (x1 - y0) * 12;
  var v0 = (x0 + y0) * 6 - (zTop || 0), v1 = (x1 + y1) * 6;
  var fx0 = floor(u0 * K) - pad, fx1 = Math.ceil(u1 * K) + pad, fy0 = floor(v0 * K) - pad, fy1 = Math.ceil(v1 * K) + pad;
  return new Ras(fx1 - fx0, fy1 - fy0, fx0, fy0);
}
/* her ince piksel için z yüksekliğindeki düzlemde dünya (x,y): fn(x,y,fx,fy) → renk | null; alfa: PA */
var PA = 1;
function eachXY(r, z, fn, box) {
  var K = G().K, ja = 0, jb = r.h, ia = 0, ib = r.w;
  if (box) {                                         /* yalnız bu dünya dikdörtgeninin ekran kutusu */
    ia = max(0, floor((box[0] - box[3]) * 12 * K) - r.ox - 1); ib = min(r.w, Math.ceil((box[2] - box[1]) * 12 * K) - r.ox + 1);
    ja = max(0, floor(((box[0] + box[1]) * 6 - (z || 0)) * K) - r.oy - 1); jb = min(r.h, Math.ceil(((box[2] + box[3]) * 6 - (z || 0)) * K) - r.oy + 1);
  }
  for (var j = ja; j < jb; j++) {
    var fy = r.oy + j, v = (fy + 0.5) / K + (z || 0);
    for (var i = ia; i < ib; i++) {
      var fx = r.ox + i, u = (fx + 0.5) / K;
      PA = 1;
      var c = fn((v / 6 + u / 12) / 2, (v / 6 - u / 12) / 2, fx, fy);
      if (c) r.setI(i, j, c, PA);
    }
  }
}
function wfx(x, y) { return round((x - y) * 12 * G().K); }
function wfy(x, y, z) { return round(((x + y) * 6 - (z || 0)) * G().K); }

/* =====================================================================
   GÖKYÜZÜ + DENİZ (ekran uzayı; ufuk kamerayla kayar, deniz dokusu dünyaya bağlı kayar)
   ===================================================================== */
var P = 512, SKYH = 120, SEAH = 200, Q = 256, SHORE = 6;
var SKYTOP = '#4a98cf';
function buildSky() {
  var K = G().K, h = SKYH * K, r = new Ras(P, h);
  var cols = ramp(['#4a98cf', '#5aa5d3', '#7db9de', '#a3cfe5', '#c5e2e9', '#e3f1ea'], 18);
  for (var y = 0; y < h; y++) { var f = Math.pow(y / (h - 1), 1.15); for (var x = 0; x < P; x++) r.setI(x, y, rampAt(cols, f, x, y)); }
  return r.sprite();
}
function glints(r, h, seed, deep) {
  var n = round(P * h / 360), TR = C('#1d5d80'), CR = C('#a4daea'), HI = C('#e6f6fa'), WH = C('#ffffff');
  for (var i = 0; i < n; i++) {
    var a = hash(i + seed, 1), y, tl;
    if (deep) { y = floor(a * h); tl = 1; } else { y = round(6 + Math.pow(a, 1.3) * (h - 10)); tl = min(1, y / (h * 0.75)); }
    var x = floor(hash(i + seed, 2) * P), l = deep ? 8 + round(hash(i + seed, 3) * 10) : 2 + round(tl * 12 + hash(i + seed, 3) * 6);
    var k = deep ? 1 : 0.45 + 0.55 * min(1, tl * 3);
    r.rect(x, y + 1, l, 1, TR, 0.5 * k); r.rect(x + 1, y, l - 2, 1, CR, 0.7 * k);
    if (l > 9 && hash(i + seed, 4) > 0.5) r.rect(x + 3, y - 1, l - 8, 1, HI, 0.55 * k);
    if (hash(i + seed, 5) > 0.9) r.set(x + (l >> 1), y - 2, WH, 0.7 * k);
  }
}
function buildSeaBand() {
  var K = G().K, h = SEAH * K, r = new Ras(P, h, 0, 0, true, false);
  var cols = ramp(['#2a7398', '#2b7ca1', '#2e88ac', '#3194b6', '#379fc0'], 16);
  for (var y = 0; y < h; y++) { var f = y / (h - 1); for (var x = 0; x < P; x++) r.setI(x, y, rampAt(cols, f, x, y)); }
  /* ufka yakın: ince açık noktalar (uzak dalga) */
  for (var i = 0; i < 300; i++) r.set(floor(hash(i, 7) * P), 2 + floor(Math.pow(hash(i, 8), 1.6) * 70), '#bfe6f0', 0.5);
  glints(r, h, 0, false);
  return r.sprite();
}
function buildDeep() {
  var r = new Ras(P, Q, 0, 0, true, true), c = C('#379fc0');
  for (var y = 0; y < Q; y++) for (var x = 0; x < P; x++) r.setI(x, y, c);
  glints(r, Q, 5000, true);
  return r.sprite();
}
/* bulut (hamsi3 referansı) */
function buildCloud(s) {
  var K = G().K;
  var parts = [[0, 0, 6], [7, -3, 7], [15, -1, 6], [22, 1, 5], [-7, 2, 4], [11, 1, 5]].map(function (p) { return [p[0] * s * K, p[1] * s * K, p[2] * s * K]; });
  var fl = 3 * s * K;
  function inU(x, y, dx, dy, dr) { for (var q = 0; q < parts.length; q++) { var X = x - parts[q][0] - dx, Y = y - parts[q][1] - dy, rr = parts[q][2] - dr; if (X * X + Y * Y <= rr * rr) return true; } return false; }
  var x0 = floor(-14 * s * K), x1 = Math.ceil(30 * s * K), y0 = floor(-12 * s * K), y1 = Math.ceil(fl);
  var r = new Ras(x1 - x0 + 1, y1 - y0 + 1, x0, y0);
  for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
    if (!inU(x, y, 0, 0, 0)) continue;
    var c = '#e6f2f4';
    if (inU(x, y, -2, -3, 2)) c = '#ffffff'; else if (y > fl - 2 * K) c = '#b9d3e0'; else if (y > fl - 5 * K) c = '#d0e3ec';
    if (c === '#e6f2f4' && hash(x, y) > 0.93) c = '#f4fafa';
    r.set(x, y, c);
  }
  return r.sprite();
}
/* [x, ufkun üstü yükseklik, ölçek, hız] (sanat pikseli) */
var CLOUDS = [[20, 64, 0.5, 1], [170, 92, 0.45, 0.8], [300, 46, 0.42, 1.2], [430, 80, 0.32, 0.9], [560, 58, 0.5, 1], [700, 104, 0.36, 0.7], [800, 40, 0.3, 1.1]], PC = 900;
/* uzak martı: 2 kare */
function buildGull(f) {
  var r = new Ras(13, 7, -6, -4), u = f ? -0.3 : 1;
  for (var i = 0; i < 5; i++) { var dy = round(i * 0.7 * u); r.set(i, -dy, '#ffffff'); r.set(-i, -dy, '#ffffff'); r.set(i, -dy + 1, '#8f9ea8', 0.6); r.set(-i, -dy + 1, '#8f9ea8', 0.6); }
  r.rect(-1, 0, 3, 2, '#f4f8f8'); r.set(0, 1, '#7a8890');
  return r.sprite();
}
var SGULLS = [[60, 34, 0.0], [92, 46, 1.7], [330, 28, 0.6], [520, 52, 2.3]];
/* deniz parıltısı: 4 kare × 2 boy */
function buildTw(f, big) {
  var r = new Ras(9, 5, -4, -2), w = '#ffffff', l = '#e6f6fa';
  if (f === 0) r.set(0, 0, '#d8f0f6', 0.8);
  else if (f === 1) { r.rect(-1, 0, 3, 1, l, 0.85); r.set(0, 0, w); }
  else if (f === 2) { if (big) { r.rect(-3, 0, 7, 1, l, 0.7); r.rect(-1, 0, 3, 1, w); r.set(0, -1, w, 0.8); r.set(0, 1, w, 0.6); } else { r.rect(-2, 0, 5, 1, l, 0.8); r.set(0, 0, w); } }
  else r.rect(-1, 0, 3, 1, '#bfe6f0', 0.6);
  return r.sprite();
}

/* küçük sprite'lar (bulut, martı, parıltı, dalga tepesi, balık gölgesi): bir kez, birlikte kurulur */
function buildSmall() {
  var o = { cloud: [], gull: [buildGull(0), buildGull(1)], tw: [[], []], crest: [], fish: [buildFish(1, 0), buildFish(1, 1), buildFish(2, 0), buildFish(2, 1)] }, i;
  for (i = 0; i < CLOUDS.length; i++) o.cloud.push(buildCloud(CLOUDS[i][2]));
  for (i = 0; i < 4; i++) { o.tw[0].push(buildTw(i, false)); o.tw[1].push(buildTw(i, true)); }
  for (i = 0; i <= 6; i++) o.crest.push([buildCrest(max(1, i), 0), buildCrest(max(1, i), 1), buildCrest(max(1, i), 2)]);
  return o;
}
function small() { return need('small' + G().K, buildSmall, true); }
HKA.drawSea = function () {
  var H = G(), K = H.K;
  budgetEnd = now() + BUDGET;
  var sky = need('sky' + K, buildSky), sea = need('sea' + K, buildSeaBand), deep = need('deep' + K, buildDeep);
  if (!sky || !sea || !deep) return false;
  H.camT(0, 0);
  var SM = small(), g = H.ctx, W = H.W, HH = H.H, WK = W * K, HK = HH * K, h0 = round(H.horizonY) + SHORE, t = H.t, x, y, i, s;
  /* gökyüzü */
  if (h0 > 0) {
    if (h0 - SKYH > 0) { g.fillStyle = SKYTOP; g.fillRect(0, 0, W, h0 - SKYH); }
    for (x = 0; x < WK; x += P) put(sky, x, (h0 - SKYH) * K);
    /* bulutlar: çok yavaş kayar + hafif paralaks */
    for (i = 0; i < CLOUDS.length; i++) {
      var cl = CLOUDS[i], cy = h0 - cl[1];
      if (cy < -14 || cy - 8 > HH) continue;
      var cx = mod(cl[0] - H.camX * 0.04 + t * 0.9 * cl[3], PC) - 60;
      if (cx > W + 20) continue;
      s = SM.cloud[i];
      put(s, round(cx * K) + s.ox, cy * K + s.oy);
    }
    for (i = 0; i < SGULLS.length; i++) {
      var sg = SGULLS[i], gy = h0 - sg[1] + round(sin(t * 0.5 + sg[2]) * 2);
      if (gy < -4 || gy > HH) continue;
      var gx = mod(sg[0] - H.camX * 0.06 + t * 2.2, PC) - 40;
      if (gx > W + 8) continue;
      var gf = floor(t * 2.4 + sg[2] * 3) & 1;
      s = SM.gull[gf];
      put(s, round(gx * K) + s.ox, gy * K + s.oy);
    }
  }
  /* deniz: ufuktan aşağı gradyan şerit + altında döşenen açık su (yatayda dünyaya bağlı) */
  var x0 = mod(H.camOX * K, P) - P, yS = h0 * K;
  if (yS < HK && yS + SEAH * K > 0) for (x = x0; x < WK; x += P) put(sea, x, yS);
  var yD = (h0 + SEAH) * K;
  if (yD < HK) {
    var jr = yD < 0 ? floor(-yD / Q) : 0;
    for (y = yD + jr * Q; y < HK; y += Q) for (x = x0; x < WK; x += P) put(deep, x, y);
  }
  if (yS >= HK) return true;
  /* parıltılar: dünyaya bağlı hücreler, üçte biri bir anda yanıp söner */
  var CW = 48, CH = 22, cox = H.camOX, r0 = max(0, floor((-h0 - 4) / CH)), r1 = floor((HH - h0) / CH) + 1;
  var c0 = floor(-cox / CW) - 1, c1 = floor((W - cox) / CW) + 1;
  for (var rr = r0; rr <= r1; rr++) for (var cc = c0; cc <= c1; cc++) {
    var hh = hash(cc * 7 + 3, rr * 13 + 1), cyc = (t * 0.45 + hh * 13) % 3;
    if (cyc >= 1) continue;
    var tx = cc * CW + hash(cc, rr + 77) * CW * 0.8 + cox, ty = h0 + 5 + rr * CH + hash(cc + 5, rr) * CH * 0.7;
    if (tx < -4 || tx > W + 4 || ty > HH + 2) continue;
    var tf = floor(cyc * 4);
    s = SM.tw[rr > 2 ? 1 : 0][tf];
    put(s, round(tx * K) + s.ox, round(ty * K) + s.oy);
  }
  return true;
};

/* =====================================================================
   UZAK KASABA (paralaks şeritler: uzak tepe camX×0.12, yakın tepe + kasaba camX×0.22 — klasik 'off' hızı)
   ===================================================================== */
var VPA = 676, FPA = 480;      /* sanat pikseli periyot (klasik köy 26×26) */
function buildFar() {
  var K = G().K, FW = FPA * K, top = 52, r = new Ras(FW, top, 0, -top, true, false);
  function fy(x) { return round((-20 + sin(TAU * x / FW * 3) * 3 + sin(TAU * x / FW * 10 + 1) * 1.4) * K); }
  for (var x = 0; x < FW; x++) {
    var f = fy(x) + (hash(x >> 1, 3) > 0.7 ? -1 : 0);
    for (var y = f; y < 0; y++) { var d = y - f; r.set(x, y, d < 2 ? '#c3d6cb' : hash(x >> 1, y >> 1) > 0.9 ? '#9cb8ad' : '#a9c3b7'); }
  }
  /* uzak tepede soluk ev noktaları ve ağaç lekeleri */
  for (var i = 0; i < 70; i++) {
    var hx = floor(hash(i, 61) * FW), hy = fy(hx) + 5 + floor(hash(i, 62) * 10);
    if (hash(i, 63) > 0.45) { r.rect(hx, hy, 3, 2, '#d9e2dc'); r.rect(hx, hy - 1, 3, 1, '#c9a294'); }
    else { r.rect(hx, hy, 3, 2, '#93b0a4'); r.set(hx + 1, hy - 1, '#93b0a4'); }
  }
  return r.sprite();
}
function nearY(x, VW) { return round((-12 + sin(TAU * x / VW * 4 + 2) * 2.5 + sin(TAU * x / VW * 12) * 1.2) * G().K) + (hash(x >> 1, 9) > 0.75 ? -1 : 0); }
function house(r, x, w, h, base, haze) {
  var hz = haze ? function (c) { return mx(c, '#a9c3b7', haze); } : function (c) { return c; };
  var y = base - h, i, j;
  r.rect(x, y, w, h, hz('#f1e8d4')); r.rect(x, y, 2, h, hz('#fffaf0')); r.rect(x + w - 4, y, 4, h, hz('#d6c8a8')); r.rect(x, base - 2, w, 2, hz('#c4b494'));
  for (j = 0; j < h; j += 3) if (hash(x, j) > 0.5) r.rect(x + 2, y + j, w - 6, 1, hz('#e8dec6'), 0.7);
  var rh = 4;
  for (j = 0; j < rh + 2; j++) { var ex = j >> 1; r.rect(x - ex - 1, y - rh - 2 + j, w + ex * 2 + 2, 1, hz(j === 0 ? '#e56a47' : (j % 2 ? '#c2492f' : '#b0402a'))); }
  r.rect(x - 3, y - 1, w + 6, 2, hz('#8e2f1f')); r.rect(x - 3, y - 1, w + 6, 1, hz('#a83a26'));
  for (i = 0; i < w - 2; i++) if (i % 4 === 1) r.set(x + 1 + i, y - rh + 1, hz('#8e2f1f'), 0.6);
  if (hash(x, 1) > 0.55) { r.rect(x + w - 6, y - rh - 5, 3, 4, hz('#b7a88a')); r.rect(x + w - 6, y - rh - 5, 3, 1, hz('#d6c8a8')); }
  if (haze) { if (h >= 6) r.rect(x + 3, y + 2, 2, 2, hz('#5a4a3c')); return; }
  var nw = max(1, floor((w - 6) / 8));
  for (i = 0; i < nw; i++) {
    var wx = x + 4 + i * 8, wy = y + 3;
    if (wy + 5 > base - 2) wy = base - 7;
    r.rect(wx, wy, 4, 5, '#5a4a3c'); r.rect(wx + 1, wy + 1, 2, 3, '#6e8fa0'); r.set(wx + 1, wy + 1, '#a8c4d0'); r.rect(wx - 1, wy + 5, 6, 1, '#c4b494');
  }
  if (w >= 16 && hash(x, 7) > 0.4) { r.rect(x + w - 9, base - 7, 3, 5, '#7a5a3c'); r.set(x + w - 9, base - 7, '#5a4030'); }
}
function cypress(r, cx, base, hh) {
  for (var y = 0; y < hh; y++) {
    var t = y / hh, w = round((1 - Math.pow(abs(t - 0.55) / 0.55, 1.7)) * 3.2 * 2);
    for (var i = -w; i <= w; i++) r.set(cx + i, base - y, i < -w * 0.2 ? '#4b7a52' : i > w * 0.4 ? '#2e4d35' : '#3f6646');
  }
  for (y = 0; y < hh; y += 3) r.set(cx - 1, base - y, '#5f9066');
}
function roundTree(r, cx, by, rad) {
  r.circ(cx, by - rad, rad, '#557a5b'); r.circ(cx - 1, by - rad - 1, rad - 1, '#6a8e6f'); r.set(cx - 1, by - rad - 2, '#86a887');
  r.set(cx, by, '#5a4632'); r.set(cx, by - 1, '#5a4632');
}
function mosque(r, x, base) {
  var K = G().K, i, j;
  /* yan yarım kubbeler (arkada) */
  [[x + 3 * K, 3 * K], [x + 14 * K, 3 * K]].forEach(function (q) {
    for (var jj = -q[1]; jj <= 0; jj++) for (var ii = -q[1]; ii <= q[1]; ii++) if (ii * ii + jj * jj <= q[1] * q[1]) r.set(q[0] + ii, base - 8 * K + jj, ii < -q[1] * 0.3 ? '#c9d5d2' : ii > q[1] * 0.4 ? '#8c9d9c' : '#a6b5b1');
  });
  r.rect(x, base - 8 * K, 17 * K, 8 * K, '#efe6d2'); r.rect(x, base - 8 * K, 2, 8 * K, '#fffaf0'); r.rect(x + 15 * K, base - 8 * K, 2 * K, 8 * K, '#d6c8a8'); r.rect(x, base - 8 * K, 17 * K, 2, '#e4d9bf');
  for (i = 3; i < 15; i += 4) {
    r.rect(x + i * K, base - 5 * K, 2 * K + 1, 3 * K, '#6a5a44'); r.rect(x + i * K + 1, base - 5 * K + 1, 2 * K - 1, 3 * K - 2, '#4a3e30');
    for (var k = 0; k < 2 * K; k++) r.set(x + i * K + k, base - 5 * K - 1 + (k === 0 || k === 2 * K - 1 ? 1 : 0), '#6a5a44');
  }
  var dcx = x + 8 * K, dcy = base - 8 * K - 2, dr = 7 * K;
  for (j = -dr; j <= 0; j++) for (i = -dr; i <= dr; i++) if (i * i + j * j <= dr * dr) {
    var c = i < -dr * 0.45 ? '#d3dedb' : i > dr * 0.35 ? '#8c9d9c' : '#aebcb8';
    if (j > -3 && c !== '#d3dedb') c = dk(c, 0.08);
    if ((i + j * 3) % 5 === 0 && hash(i, j) > 0.4) c = dk(c, 0.1);
    r.set(dcx + i, dcy + j, c);
  }
  r.rect(dcx - dr, dcy, 2 * dr + 1, 2, '#c4b494');
  r.rect(dcx, dcy - dr - 5, 1, 6, '#d8c890'); r.set(dcx - 1, dcy - dr - 5, '#d8c890'); r.set(dcx + 1, dcy - dr - 6, '#d8c890');
  var mq = x - 4 * K;
  r.rect(mq, base - 32 * K, 3 * K, 32 * K, '#f3ebd8'); r.rect(mq, base - 32 * K, 2, 32 * K, '#fffaf0'); r.rect(mq + 3 * K - 2, base - 32 * K, 2, 32 * K, '#d6c8a8');
  r.rect(mq - 2, base - 21 * K, 3 * K + 4, 2, '#c2492f'); r.rect(mq - 2, base - 21 * K + 2, 3 * K + 4, 2, '#8e2f1f'); r.rect(mq - 1, base - 21 * K + 4, 3 * K + 2, 1, '#e6dcc4');
  r.rect(mq + 1, base - 27 * K, 3 * K - 2, 2 * K, '#6a5a44', 0.8);
  for (j = 0; j < 5 * K; j++) { var w = round((1 - j / (5 * K)) * 1.5 * K); r.rect(mq + 1.5 * K - w, base - 32 * K - 1 - j, w * 2 + 1, 1, j < 2 ? '#e4dcc4' : '#f3ebd8'); r.set(mq + 1.5 * K + w, base - 32 * K - 1 - j, '#d6c8a8'); }
  r.rect(mq + K, base - 37 * K - 3, 1, 4, '#d8c890'); r.set(mq + K + 1, base - 37 * K - 3, '#d8c890');
}
function buildNear() {
  var K = G().K, VW = VPA * K, top = 96, r = new Ras(VW, top + 4, 0, -top, true, false), x, i;
  var MXQ = 165 * K, MZ0 = MXQ - 26 * K, MZ1 = MXQ + 44 * K;      /* cami: klasik minare konumu (160+8) */
  /* yakın tepe */
  for (x = 0; x < VW; x++) {
    var n = nearY(x, VW);
    for (var y = n; y < -4; y++) {
      var d = y - n, c = '#7b9d80';
      if (d < 2) c = '#98b99a'; else if (d < 4) c = '#8aac8c';
      if (hash(x >> 1, y >> 1) > 0.86) c = '#6a8e6f';
      if (hash(x, y) > 0.97) c = '#5f8365';
      r.set(x, y, c);
    }
  }
  /* tepe yamacındaki zeytinlik lekeleri */
  for (i = 0; i < 90; i++) { x = floor(hash(i, 71) * VW); var ty = nearY(x, VW) + 3 + floor(hash(i, 72) * 12); if (ty < -8) r.circ(x, ty, 1 + floor(hash(i, 73) * 2), hash(i, 74) > 0.5 ? '#6a8e6f' : '#5f8365'); }
  /* arka sıra: yamaçta soluk evler */
  for (i = 0; i < 26; i++) {
    x = floor(hash(i, 81) * VW);
    if (x > MZ0 - 30 && x < MZ1) continue;
    var bw = (5 + floor(hash(i, 82) * 3)) * K, bb = min(-12, nearY(x + (bw >> 1), VW) + 10 + floor(hash(i, 83) * 4));
    house(r, x, bw, (3 + floor(hash(i, 84) * 3)) * K, bb, 0.38);
  }
  /* ön sıra: kümeler halinde kiremitli evler, aralarda servi ve ağaç */
  x = 6;
  while (x < VW - 24) {
    if (x > MZ0 - 20 && x < MZ1) { x = MZ1; continue; }
    var w = (6 + floor(hash(x, 41) * 3)) * K + (hash(x, 42) > 0.8 ? 6 : 0), h = (4 + floor(hash(x, 43) * 4)) * K;
    if (x + w > MZ0 - 20 && x < MZ1) { x = MZ1; continue; }
    house(r, x, w, h, -8, 0);
    var gap = 5 + floor(hash(x, 44) * 7);
    if (hash(x, 45) > 0.78) {
      gap = 24 + floor(hash(x, 46) * 40);
      var tx = x + w + 7 + floor(hash(x, 47) * (gap - 14));
      if (hash(x, 48) > 0.55) cypress(r, tx, -8, (14 + floor(hash(x, 49) * 10)) * K);
      else { roundTree(r, tx, -8, 4); if (gap > 40) roundTree(r, tx + 12, -8, 3); }
    }
    x += w + gap;
  }
  mosque(r, MXQ, -8);
  cypress(r, MXQ + 23 * K, -8, 28 * K);
  cypress(r, MXQ - 10 * K, -8, 20 * K);
  roundTree(r, MXQ + 28 * K, -8, 4);
  /* kıyı: kum, köpük, sığ su */
  for (x = 0; x < VW; x++) {
    r.set(x, -4, hash(x >> 1, 91) > 0.15 ? '#d8cfa6' : '#c9bf94'); r.set(x, -3, '#d8cfa6');
    r.set(x, -2, hash(x, 92) > 0.12 ? '#eaf3ee' : '#cfe7e6'); r.set(x, -1, hash(x >> 1, 93) > 0.4 ? '#eaf3ee' : '#9fd3d6');
    r.set(x, 0, '#6fbfcf', 0.55); r.set(x, 1, '#5aaac4', 0.3);
  }
  return r.sprite();
}
HKA.drawVillage = function () {
  var H = G(), K = H.K;
  H.camT(0, 0);
  var h0 = round(H.horizonY) + SHORE;
  if (h0 + 4 < 0) return true;                       /* ufuk ekranın üstünde: uzak kıyı görünmez */
  var far = need('vfar' + K, buildFar), near = need('vnear' + K, buildNear);
  if (!far || !near) return false;
  var WK = H.W * K, x;
  var o1 = mod(round(H.camX * 0.12 * K), far.w), o2 = mod(round(H.camX * 0.22 * K), near.w);
  for (x = -o1; x < WK; x += far.w) put(far, x, h0 * K + far.oy);
  for (x = -o2; x < WK; x += near.w) put(near, x, h0 * K + near.oy);
  return true;
};

/* =====================================================================
   DENİZ ÜSTÜ: dalga tepeleri, balık sürüsü gölgeleri (dünya uzayı)
   ===================================================================== */
var _waves = null, _shoal = null, _grass = null;
function buildCrest(w, f) {
  var K = G().K, l = w * K + 2, r = new Ras(l + 4, 5, -2, -2);
  if (f === 0) { r.rect(1, 0, l - 2, 1, '#bfe6f0', 0.75); r.rect(2, 1, l - 4, 1, '#1d5d80', 0.35); }
  else if (f === 1) { r.rect(0, 0, l, 1, '#e8f6fc'); r.rect(1, 1, l - 2, 1, '#1d5d80', 0.45); r.rect(2, -1, l - 4, 1, '#e8f6fc', 0.45); }
  else { r.rect(0, 0, l, 1, '#ffffff'); r.rect(1, -1, l - 2, 1, '#e8f6fc', 0.7); r.rect(1, 1, l - 2, 1, '#1d5d80', 0.5); r.set(l >> 1, -2, '#ffffff', 0.8); r.set(-1, 0, '#cdeef4', 0.6); r.set(l, 0, '#cdeef4', 0.6); }
  return r.sprite();
}
HKA.drawWaves = function () {
  var H = G(), K = H.K;
  if (!_waves) _waves = H.v('waves');
  if (!_waves) return false;
  var CR = small().crest, t = H.t, cox = H.camOX, coy = H.camOY, W = H.W, HH = H.H, hz = round(H.horizonY) + SHORE + 3;
  for (var i = 0; i < _waves.length; i++) {
    var w = _waves[i], ph = sin(t * 0.9 + w.ph);
    if (ph < 0.15) continue;
    var sx = H.pX(w.x, w.y), sy = H.pY(w.x, w.y, 0);
    if (sy + coy < hz) continue;                     /* ufkun üstünde (gökte) dalga çizme */
    if (sx + cox < -14 || sx + cox > W + 4 || sy + coy < -4 || sy + coy > HH + 4) continue;
    var s = CR[min(6, w.w | 0)][ph > 0.75 ? 2 : ph > 0.42 ? 1 : 0];
    put(s, round(sx * K) + s.ox, round(sy * K) + s.oy, min(1, (ph - 0.15) * 2.2));
  }
  return true;
};
function buildFish(sz, f) {
  var len = sz === 1 ? 7 : 10, wid = sz === 1 ? 2.4 : 3.2, r = new Ras(24, 16, -12, -8), c = '#0a2d46';
  var ax = 0.894, ay = 0.447;                        /* +x dünya yönü ekranda (2,1) */
  for (var y = -7; y <= 7; y++) for (var x = -11; x <= 11; x++) {
    var a = x * ax + y * ay, b = -x * ay + y * ax;
    var e = (a * a) / ((len / 2) * (len / 2)) + (b * b) / ((wid / 2) * (wid / 2));
    if (e <= 1) { r.set(x, y, c); continue; }
    var ta = a + len / 2, sw = f ? 0.6 : -0.6;       /* kuyruk */
    if (ta < 0 && ta > -3.2 && abs(b - sw * ta * 0.3) < -ta * 0.55 + 0.4) r.set(x, y, c);
  }
  return r.sprite();
}
HKA.drawShoal = function () {
  var H = G(), K = H.K;
  if (!_shoal) _shoal = H.v('shoal');
  if (!_shoal) return false;
  var sp = small().fish;
  var t = H.t, cox = H.camOX, coy = H.camOY, W = H.W, HH = H.H, g = H.ctx, ga = g.globalAlpha, hz = round(H.horizonY) + SHORE + 3;
  g.globalAlpha = ga * 0.42;
  for (var i = 0; i < _shoal.length; i++) {
    var f = _shoal[i];
    f.x += f.sp * 0.004;                             /* klasik drawShoal ile aynı güncelleme */
    if (f.x > 34) f.x = -26;
    if (f.x > -1.4 && f.y > -1.4) continue;
    var sx = (f.x - f.y) * 12, sy = (f.x + f.y) * 6;                    /* = pX, pY (z=0) */
    if (sx + cox < -8 || sx + cox > W + 8 || sy + coy < max(-6, hz) - 2 || sy + coy > HH + 8) continue;   /* gökte balık gölgesi çizme */
    sy += sin(t * 1.4 + f.ph) * 1.2;
    var s = sp[(f.s === 2 ? 2 : 0) + (floor(t * 3 + f.ph * 2) & 1)];
    if (s) g.drawImage(s.cv, (round(sx * K) + s.ox) / K, (round(sy * K) + s.oy) / K, s.w / K, s.h / K);
  }
  g.globalAlpha = ga;
  return true;
};

/* =====================================================================
   KARA: kum + ıslak kum + köpük + sığ su (dünya uzayı, parçalı önbellek) + kıyıya gelen köpük dalgası
   ===================================================================== */
var X0 = -0.7, Y0 = -0.7, X1 = 26, Y1 = 24.5, MG = 2.4, CS = 256;
var GX0 = 0, GY0 = 0, NCX = 0, NCY = 0, chunks = null, geoKey = '', prefI = 0, EDG = null;
/* kıyı çizgisi kıvrımı: kenar boyunca 4 karo periyotlu (köpük dalgası sprite'ı tekrarlanabilsin) */
var WT = 256, wTab = null;
function buildW() {
  wTab = [];
  var phs = [0.3, 2.1, 4.0, 5.2];
  for (var e = 0; e < 4; e++) {
    var tab = new Float32Array(WT), ph = phs[e];
    for (var i = 0; i < WT; i++) { var s = i / WT * 4; tab[i] = 0.06 + 0.07 * sin(TAU * s / 4 + ph) + 0.035 * sin(TAU * s / 2 + 2 * ph + 1) + 0.02 * sin(TAU * s + 3 * ph); }
    wTab.push(tab);
  }
}
function wAt(e, s) { var q = s / 4 * WT, i = floor(q), f = q - i, T = wTab[e]; i = mod(i, WT); return T[i] * (1 - f) + T[(i + 1) % WT] * f; }
/* kıyıya işaretli uzaklık (karo): + kara, − deniz */
function landD(x, y) {
  var a = x - X0 + wAt(0, y - Y0), b = y - Y0 + wAt(1, x - X0), c = X1 + wAt(2, y - Y0) - x, e = Y1 + wAt(3, x - X0) - y;
  if (a > 0 && b > 0 && c > 0 && e > 0) return min(a, b, c, e);
  var s2 = 0;
  if (a < 0) s2 += a * a;
  if (b < 0) s2 += b * b;
  if (c < 0) s2 += c * c;
  if (e < 0) s2 += e * e;
  return -Math.sqrt(s2);
}
function ensureGeom() {
  var H = G(), K = H.K, key = K + ':' + H.LANDX + ':' + H.LANDY;
  if (key === geoKey && chunks) return;
  geoKey = key; X1 = H.LANDX; Y1 = H.LANDY;
  if (!wTab) buildW();
  var uMin = (X0 - MG - (Y1 + MG)) * 12 * K, uMax = (X1 + MG - (Y0 - MG)) * 12 * K, vMin = (X0 + Y0 - 2 * MG) * 6 * K, vMax = (X1 + Y1 + 2 * MG) * 6 * K;
  GX0 = floor(uMin); GY0 = floor(vMin); NCX = Math.ceil((uMax - GX0) / CS); NCY = Math.ceil((vMax - GY0) / CS);
  chunks = new Array(NCX * NCY); prefI = 0; surfS = [];
  EDG = [
    { px: X0, py: Y0, ax: 0, ay: 1, nx: -1, ny: 0, len: Y1 - Y0 },
    { px: X0, py: Y0, ax: 1, ay: 0, nx: 0, ny: -1, len: X1 - X0 },
    { px: X1, py: Y0, ax: 0, ay: 1, nx: 1, ny: 0, len: Y1 - Y0 },
    { px: X0, py: Y1, ax: 1, ay: 0, nx: 0, ny: 1, len: X1 - X0 }
  ];
}
/* kum paleti */
var SV = null, WETR, WET0, SPARK, GRIT, FOAM1, FOAM2, FOAM3, SHR, DROP, MARK1, MARK2, WEED, SHELL;
function palette() {
  if (SV) return;
  SV = ['#e3cf9e', '#e8d7aa', '#dcc592', '#d6bf8a', '#ebdbae'].map(function (c) { return [C(c), dk(c, 0.07), lt(c, 0.15)]; });
  WETR = ramp(['#b59c69', '#c0a774', '#cbb482', '#d6c08e', '#dcc795'], 9);
  WET0 = C('#a38c5c'); SPARK = C('#fff6dc'); GRIT = C('#9c8660');
  FOAM1 = C('#f4fcfd'); FOAM2 = C('#cdeef4'); FOAM3 = C('#e6f6fa');
  SHR = ramp(['#a6e8da', '#8cdcd2', '#74d4cf'], 7); DROP = C('#1d5d80');
  MARK1 = C('#c6ae7d'); MARK2 = C('#d1bb8a'); WEED = C('#5a6a3a'); SHELL = C('#fbf3e6');
}
function sand(x, y) {
  var n = hash(x >> 3, y >> 3), k = n > 0.75 ? 1 : n < 0.18 ? 2 : 0;
  var rip = sin(x * 0.22 + y * 0.75) + sin(x * 0.05 - y * 0.3) * 0.6;
  if (rip > 1.2 && hash(x >> 1, y) > 0.35) k = 3;
  if (rip < -1.35 && hash(x, y >> 1) > 0.45) k = 4;
  var g = hash(x, y);
  if (g > 0.9985) return SPARK;
  if (g < 0.001) return GRIT;
  return g > 0.93 ? SV[k][1] : g < 0.03 ? SV[k][2] : SV[k][0];
}
function landPix(D, fx, fy) {
  PA = 1;
  if (D >= 0) {
    var dp = D * 24, c;
    if (dp < 1.4) return WET0;
    if (dp < 10) c = rampAt(WETR, (dp - 1.4) / 8.6, fx, fy);
    else { c = sand(fx, fy); if (dp < 16 && (dp - 10) / 6 < bayer[fy & 3][fx & 3]) c = WETR[WETR.length - 1]; }
    /* dalga izleri: kıyıya paralel kıvrık çizgiler */
    if (abs(D - (0.56 + 0.05 * sin(fx * 0.07))) < 0.022 && hash(fx >> 1, 21) > 0.22) return MARK1;
    if (abs(D - (0.98 + 0.07 * sin(fx * 0.045 + 1))) < 0.02 && hash(fx >> 1, 22) > 0.45) return MARK2;
    if (D < 0.22 && hash(fx, fy * 3) > 0.995) return WEED;
    if (D > 0.2 && D < 1.4 && hash(fx * 3, fy) > 0.9992) return SHELL;
    return c;
  }
  var o = -D;
  if (o < 0.05) return hash(fx, 11) > 0.16 ? FOAM1 : FOAM2;
  if (o < 0.1 && hash(fx >> 1, 12) > 0.45) { PA = 0.8; return FOAM2; }
  if (o > 2.32) return null;
  if (abs(o - (0.3 + 0.05 * sin(fx * 0.09))) < 0.03 && hash(fx, 14) > 0.4) { PA = 0.6; return FOAM3; }
  if (o < 1.75) {
    var tt = 1 - o / 1.75; PA = Math.pow(tt, 1.4) * 0.64;
    if (floor(o * 24 / 3.5) % 2) PA *= 0.82;
    return rampAt(SHR, o / 1.1, fx, fy);
  }
  PA = 0.14 * (1 - abs(o - 2.03) / 0.29);
  return PA > 0 ? DROP : null;
}
function tuft(r, x, y, n) {
  for (var i = 0; i < n; i++) {
    var h = 3 + floor(hash(x + i, y) * 5);
    for (var j = 0; j < h; j++) r.set(x + i * 2 + round(j * (i - n / 2) * 0.18), y - j, j > h * 0.6 ? '#bcc67a' : i % 2 ? '#8a9a56' : '#a3b066');
  }
}
/* parça k'yı bütçe bitene dek satır satır kur (iş yarıda kalırsa sonraki karede sürer); bitti mi? */
function chunkStep(k) {
  var c = chunks[k];
  if (c === null || (c && c.cv)) return true;
  if (now() > budgetEnd) return false;
  var H = G(), K = H.K;
  if (c === undefined) { var ci = k % NCX, cj = floor(k / NCX); c = chunks[k] = { job: 1, j: 0, r: new Ras(CS, CS, GX0 + ci * CS, GY0 + cj * CS) }; }
  var r = c.r, fx0 = r.ox, fy0 = r.oy;
  palette();
  for (var j = c.j; j < CS; j++) {
    if ((j & 7) === 0 && j > c.j && now() > budgetEnd) { c.j = j; return false; }
    var fy = fy0 + j, v = (fy + 0.5) / K;
    for (var i = 0; i < CS; i++) {
      var fx = fx0 + i, u = (fx + 0.5) / K, x = (v / 6 + u / 12) / 2, y = (v / 6 - u / 12) / 2;
      if (x < X0 - MG || x > X1 + MG || y < Y0 - MG || y > Y1 + MG) continue;
      var pc = landPix(landD(x, y), fx, fy);   /* (c değil: c parça kaydı; bütçe dolunca c.j yazılır) */
      if (pc) r.setI(i, j, pc, PA);
    }
  }
  /* süs: oyunun ot noktaları → ot öbeği / çakıl / taş (dünya konumları sabit) */
  if (!_grass) _grass = H.v('grass') || [];
  for (var q = 0; q < _grass.length; q++) {
    var gr = _grass[q], gx = round((gr.x - gr.y) * 12 * K), gy = round((gr.x + gr.y) * 6 * K);
    if (gx < fx0 - 12 || gx > fx0 + CS + 12 || gy < fy0 - 10 || gy > fy0 + CS + 10) continue;
    if (landD(gr.x, gr.y) < 0.5) continue;
    var hq = hash(q, 5);
    if (hq < 0.15) tuft(r, gx, gy, 3 + floor(hash(q, 6) * 2));
    else if (hq < 0.42) { var pc = hash(q, 7) > 0.5 ? '#c9b283' : '#f2e8cc'; r.rect(gx, gy, 2, 1, pc); r.set(gx, gy + 1, dk(pc, 0.3), 0.5); r.set(gx + 1, gy + 1, dk(pc, 0.3), 0.35); }
    else if (hq < 0.5) { r.rect(gx - 1, gy - 1, 4, 2, '#a8a291'); r.rect(gx - 1, gy - 1, 2, 1, '#c8c2ae'); r.rect(gx, gy + 1, 3, 1, '#7d7868', 0.6); }
  }
  chunks[k] = r.sprite();
  return true;
}
/* kıyıya gelen köpük dalgası: kenar başına 4 karoluk tekrar sprite'ı (+ son kısa parça), kıyı biçimini izler;
   karede yalnız normal yönünde kaydırılıp alfa ile çizilir. wash: kıyıya yayılan ince su örtüsü */
function buildSurf(e, sA, sB, wash) {
  var K = G().K, E = EDG[e], us = [], vs = [];
  [sA, sB].forEach(function (s) { [-0.2, 0.45].forEach(function (n) { var x = E.px + E.ax * s + E.nx * n, y = E.py + E.ay * s + E.ny * n; us.push((x - y) * 12 * K); vs.push((x + y) * 6 * K); }); });
  var fx0 = floor(Math.min.apply(null, us)) - 2, fy0 = floor(Math.min.apply(null, vs)) - 2;
  var r = new Ras(Math.ceil(Math.max.apply(null, us)) + 2 - fx0, Math.ceil(Math.max.apply(null, vs)) + 2 - fy0, fx0, fy0);
  var WH = C('#ffffff'), FB = C('#dff4f8'), F3 = C('#cdeef4'), WA = C('#e8f8fa');
  for (var j = 0; j < r.h; j++) {
    var v = (fy0 + j + 0.5) / K;
    for (var i = 0; i < r.w; i++) {
      var u = (fx0 + i + 0.5) / K, x = (v / 6 + u / 12) / 2, y = (v / 6 - u / 12) / 2;
      var s = (x - E.px) * E.ax + (y - E.py) * E.ay, n = (x - E.px) * E.nx + (y - E.py) * E.ny;
      if (s < sA || s >= sB) continue;
      var dd = n - wAt(e, s);
      if (wash) {
        if (dd > -0.02 && dd < 0.24) r.setI(i, j, hash(fx0 + i, fy0 + j) > 0.97 ? WH : WA, 0.55 * (1 - dd / 0.24));
        continue;
      }
      if (dd > -0.04 && dd < 0.035) { if (hash(floor((s - sA) * 16), 31 + e) < 0.12) continue; r.setI(i, j, dd < 0 ? WH : FB); }
      else if (dd > 0.07 && dd < 0.11 && hash(fx0 + i, fy0 + j) > 0.5) r.setI(i, j, F3, 0.5);
    }
  }
  return r.sprite();
}
/* kenar e'nin köpük sprite'ları [tam, kısa parça, örtü tam, örtü kısa]; bütçeyle parça parça kurulur */
var surfS = [];
function surfSet(e) {
  var S = surfS[e];
  if (S && S.ok) return S.v;
  if (!S) S = surfS[e] = { v: [undefined, undefined, undefined, undefined], ok: false };
  var E = EDG[e], nf = floor(E.len / 4), rem = E.len - nf * 4;
  for (var q = 0; q < 4; q++) {
    if (S.v[q] !== undefined) continue;
    if (now() > budgetEnd) return null;
    S.v[q] = (q & 1) ? (rem > 0.05 ? buildSurf(e, nf * 4, E.len, q > 1) : null) : buildSurf(e, 0, 4, q > 1);
  }
  S.ok = true;
  return S.v;
}
HKA.drawLand = function () {
  var H = G(), K = H.K;
  ensureGeom();
  var W = H.W, HH = H.H, cox = H.camOX, coy = H.camOY;
  var vx0 = -cox * K, vy0 = -coy * K, vx1 = vx0 + W * K, vy1 = vy0 + HH * K;
  var i0 = max(0, floor((vx0 - GX0) / CS)), i1 = min(NCX - 1, floor((vx1 - GX0) / CS));
  var j0 = max(0, floor((vy0 - GY0) / CS)), j1 = min(NCY - 1, floor((vy1 - GY0) / CS)), i, j, k;
  var ready = true;
  for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) if (!chunkStep(j * NCX + i)) ready = false;
  if (!ready) return false;                          /* görünen parça henüz kurulmadı: bu kare klasik kara */
  for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) { var cs = chunks[j * NCX + i]; if (cs) put(cs, cs.ox, cs.oy); }
  /* köpük dalgası: kenar başına iki dalga, yarım periyot arayla */
  var t = H.t;
  for (var e = 0; e < 4; e++) {
    var E = EDG[e], nf = floor(E.len / 4), rem = E.len - nf * 4;
    var SF = surfSet(e);
    if (!SF) continue;
    var full = SF[0], part = SF[1], wfull = SF[2], wpart = SF[3];
    var su = (E.ax - E.ay) * 48 * K, sv = (E.ax + E.ay) * 24 * K;
    for (var wv = 0; wv < 2; wv++) {
      var ph = mod(t / 4.8 + wv * 0.5 + e * 0.21, 1);
      var cN = 0.05 + 1.0 * Math.pow(1 - ph, 1.25);
      var a = (ph < 0.2 ? ph / 0.2 : ph > 0.85 ? (1 - ph) / 0.15 : 1) * 0.72;
      var du = round((E.nx - E.ny) * 12 * cN * K), dv = round((E.nx + E.ny) * 6 * cN * K);
      var wa = ph > 0.78 ? sin((ph - 0.78) / 0.22 * Math.PI) * 0.55 : 0;
      for (k = 0; k <= nf; k++) {
        var sp = k < nf ? full : part, ws = k < nf ? wfull : wpart;
        if (!sp) continue;
        var ku = k < nf ? su * k : 0, kv = k < nf ? sv * k : 0, bx = sp.ox + ku, by = sp.oy + kv;
        if (bx + du > vx1 || bx + du + sp.w < vx0 - 30 || by + dv > vy1 || by + dv + sp.h < vy0 - 30) continue;
        put(sp, bx + du, by + dv, a);
        if (wa > 0.02 && ws) put(ws, ws.ox + ku, ws.oy + kv, wa);
      }
    }
  }
  /* boş zamanda kalan parçaları önceden kur */
  while (prefI < chunks.length && now() < budgetEnd) {
    if (!chunkStep(prefI)) break;
    prefI++;
  }
  return true;
};

/* =====================================================================
   YOL (çevre kademesine göre: toprak → çakıl → arnavut kaldırımı + bordür)
   ===================================================================== */
var RX0 = 10.2, RX1 = 14.6, RY0 = -0.5, RY1 = 24.3;   /* game.js ROAD_Y1 ile aynı */
function buildRoad(e) {
  var r = worldRas(RX0, RY0, RX1 + 0.1, RY1, 1, 4);
  var DIRT = [C('#c4a878'), C('#ccb284'), C('#b89d6e')], RUT = C('#9c8259'), RIDGE = C('#d4bb8c');
  var GRV = [C('#bfae88'), C('#c8b892'), C('#b3a27c')], PEB = ['#9d8e6c', '#d6c8a4', '#a89a7a', '#e2d6b6', '#8f8268'].map(C);
  var STN = ['#bab3a3', '#aca594', '#c6bfaf', '#a39b89', '#bfb6a0', '#b4ae9f'].map(C), MORT = C('#8b8373'), MOSS = C('#8f9a6a');
  var CURB = C('#d8d2c4'), CURBL = C('#ece6d8'), CURBD = C('#a29a88'), CURBF = C('#8f8778');
  var holes = [];
  for (var hi = 0; hi < 19; hi++) { var r2 = (hi * 7.31) % 1; holes.push([10.6 + r2 * 3.6, 1 + hi * 1.6, hi % 3 === 0]); }
  var PUD = C('#8fb6be'), PUDL = C('#c8e2e8'), HOLE = C('#8a7250'), HOLER = C('#ad9264');
  eachXY(r, 0, function (x, y, fx, fy) {
    if (y < RY0 || y >= RY1) return null;
    /* bordür dış yüzü (yalnız taş yolda): doğu kenarının dışı görünür */
    if (e >= 2 && x >= RX1 && x < RX1 + 0.07) return CURBF;
    if (x < RX0 || x >= RX1) return null;
    var ex = min(x - RX0, RX1 - x), g = hash(fx, fy), c, q;
    if (e === 0) {
      if (ex < 0.22 && ex / 0.22 < bayer[fy & 3][fx & 3] * 0.9 + 0.05) return null;    /* kuma dağılan kenar */
      q = hash(fx >> 2, fy >> 2); c = DIRT[q > 0.7 ? 1 : q < 0.25 ? 2 : 0];
      for (var hq = max(0, round((y - 1) / 1.6) - 1), hq1 = min(holes.length - 1, hq + 2); hq <= hq1; hq++) {
        var hx = (x - holes[hq][0]) / 0.3, hy = (y - holes[hq][1]) / 0.2, qq = hx * hx + hy * hy;
        if (qq < 1) { if (holes[hq][2] && qq < 0.6) return (hx < -0.2 && hy < -0.1 && qq > 0.25) ? PUDL : PUD; return qq > 0.7 && hy < 0 ? HOLER : HOLE; }
      }
      var d1 = min(abs(x - 11.4), abs(x - 13.5));
      if (d1 < 0.07) return RUT;
      if (d1 < 0.12) return RIDGE;
      if (g > 0.95) return dk(c, 0.1);
      if (g < 0.03) return lt(c, 0.12);
      return c;
    }
    if (e === 1) {
      if (ex < 0.14 && ex / 0.14 < bayer[fy & 3][fx & 3] * 0.8 + 0.1) return null;
      var hp = hash(fx >> 1, fy);
      if (hp > 0.74) return PEB[floor(hash(fx >> 1, fy + 3) * PEB.length)];
      if (hp < 0.05) return dk(GRV[0], 0.18);
      q = hash(fx >> 2, fy >> 2);
      return GRV[q > 0.7 ? 1 : q < 0.2 ? 2 : 0];
    }
    /* bordür üstü */
    if (x < RX0 + 0.2 || x > RX1 - 0.2) {
      if (mod(y, 0.9) < 0.04) return CURBD;
      if (x < RX0 + 0.2 && x > RX0 + 0.14) return CURBD;          /* batı bordürünün yola bakan yüzü */
      if (x > RX1 - 0.2 && x < RX1 - 0.16) return CURBL;
      return g > 0.94 ? dk(CURB, 0.06) : CURB;
    }
    /* arnavut kaldırımı: sıralar y boyunca, şaşırtmalı */
    var rj = floor(y / 0.32), ox = (rj & 1) * 0.21, gx = x - RX0 - 0.2 + ox, ci = floor(gx / 0.42), lx = gx - ci * 0.42, ly = y - rj * 0.32;
    var m1 = min(lx, 0.42 - lx), m2 = min(ly, 0.32 - ly);
    if (m1 < 0.03 || m2 < 0.03 || (m1 < 0.07 && m2 < 0.07)) return (e === 2 && hash(ci, rj * 3) > 0.8) ? MOSS : MORT;
    var hs = hash(ci * 5 + 1, rj);
    if (e === 2 && hs > 0.985) return MORT;                         /* eksik taş */
    c = STN[floor(hs * STN.length)];
    if (lx < 0.08 || ly < 0.06) c = lt(c, 0.16); else if (lx > 0.35 || ly > 0.27) c = dk(c, 0.14);
    if (g > 0.93) c = dk(c, 0.06);
    return c;
  });
  /* toprak/çakıl yolun kenarına ot */
  if (e <= 1) for (var i = 0; i < 26; i++) {
    var ty = RY0 + 0.6 + hash(i, 101) * (RY1 - RY0 - 1.2), tx = hash(i, 102) > 0.5 ? RX0 + 0.05 : RX1 - 0.1;
    tuft(r, wfx(tx, ty), wfy(tx, ty), 2 + floor(hash(i, 103) * 2));
  }
  return r.sprite();
}
HKA.drawRoad = function () {
  var H = G(), K = H.K, e = H.envStage(); e = e > 3 ? 3 : e < 0 ? 0 : e;
  var s = need('road' + e + 'k' + K, buildRoad.bind(null, e));
  if (!s) return false;
  put(s, s.ox, s.oy);
  return true;
};

/* =====================================================================
   MEYDAN (taş döşeme + bordür) + YAYA KÖPRÜSÜ
   ===================================================================== */
function buildMeydan() {
  var M = G().v('MEYDAN'), B = G().v('BRIDGE'), K = G().K;
  if (!M || !B) return null;
  var r = worldRas(M.x0, M.y0, M.x1, M.y1, 8, 4);
  var SL = ['#cfc5ad', '#c6bba1', '#d6ccb5', '#bfb398', '#cbc0a6'].map(C), DZ = C('#9c9079'), MOSS = C('#8f9a6a');
  var BD = C('#a99d84'), BDL = C('#bdb299'), BDJ = C('#8a7f68'), EDGE = C('#7d725c');
  function stoneAt(x, y, fx, fy, g) {
    var c;
    var gx = (x - M.x0 - 0.3) / 0.6, gy = (y - M.y0 - 0.3) / 0.6, cj = floor(gy);
    if (cj & 1) gx += 0.5;                               /* yarım taş şaşırtması */
    var ci = floor(gx), lx = gx - ci, ly = gy - cj;
    if (lx < 0.06 || ly < 0.06) return hash(ci * 3 + 1, cj * 7) > 0.82 && g > 0.4 ? MOSS : DZ;
    var hs = hash(ci + 11, cj * 5);
    c = SL[floor(hs * SL.length)];
    if (lx < 0.13 || ly < 0.13) c = lt(c, 0.14); else if (lx > 0.92 || ly > 0.92) c = dk(c, 0.1);
    if (hs > 0.9 && abs(lx - ly - 0.1) < 0.025) c = dk(c, 0.2);            /* çatlak */
    if (g > 0.95) c = dk(c, 0.05); else if (g < 0.03) c = lt(c, 0.1);
    return c;
  }
  eachXY(r, 0, function (x, y, fx, fy) {
    if (x < M.x0 || x >= M.x1 || y < M.y0 || y >= M.y1) return null;
    var e = min(x - M.x0, M.x1 - x, y - M.y0, M.y1 - y), g = hash(fx, fy), c;
    if (e < 0.06) return EDGE;
    if (e < 0.3) {
      var along = (x - M.x0 < 0.3 || M.x1 - x < 0.3) ? y : x;
      if (mod(along, 0.55) < 0.04 || e > 0.26) return BDJ;
      c = e < 0.12 ? BDL : BD;
      return g > 0.93 ? dk(c, 0.07) : c;
    }
    return stoneAt(x, y, fx, fy, g);
  }, [M.x0, M.y0, M.x1, M.y1]);
  /* v2.24: iskele–meydan arası taş şerit kalktı (BRIDGE yalnız yürünebilirlik; zemin doğal kumsal) */
  return r.sprite();
}
HKA.drawMeydanGround = function () {
  var K = G().K, s = need('meydan' + K, buildMeydan);
  if (!s) return false;
  put(s, s.ox, s.oy);
  return true;
};

/* =====================================================================
   HİZMET SAHASI (sıkıştırılmış toprak + yuvarlak taş bordür) + basamak taşlı patika
   ===================================================================== */
function buildYard() {
  var Y = G().v('SERVYARD'), Pt = G().v('YARDPATH');
  if (!Y || !Pt) return null;
  var r = worldRas(min(Y.x0, Pt.x0), min(Y.y0, Pt.y0), max(Y.x1, Pt.x1), max(Y.y1, Pt.y1), 2, 4);
  var EA = [C('#c1aa80'), C('#cab58c'), C('#b59e74')], TRK = C('#a68f66'), PEB = C('#a8966f'), PEBL = C('#ddd0ad');
  var BST = ['#a4977a', '#b3a687', '#988b6f'].map(C), BL = C('#8a7a5c');
  var PB = C('#b9ad92'), FL = ['#cfc6b0', '#c4baa2', '#d6cdb8'].map(C), FLD = C('#9e9480');
  eachXY(r, 0, function (x, y, fx, fy) {
    var g = hash(fx, fy), c, q;
    if (x >= Y.x0 && x < Y.x1 && y >= Y.y0 && y < Y.y1) {
      var e = min(x - Y.x0, Y.x1 - x, y - Y.y0, Y.y1 - y);
      if (e < 0.05) return BL;
      if (e < 0.3) {                                        /* yuvarlak bordür taşları */
        var along = (x - Y.x0 < 0.3 || Y.x1 - x < 0.3) ? y : x, ai = floor(along / 0.3), la = along / 0.3 - ai, le = (e - 0.05) / 0.25;
        var dd = (la - 0.5) * (la - 0.5) + (le - 0.5) * (le - 0.5);
        if (dd > 0.2) return BL;
        c = BST[floor(hash(ai, 17) * 3)];
        return la < 0.4 && le < 0.45 ? lt(c, 0.18) : (la > 0.7 || le > 0.75) ? dk(c, 0.15) : c;
      }
      q = hash(fx >> 2, fy >> 2) * 0.55 + hash(fx >> 4, fy >> 3) * 0.45; c = EA[q > 0.66 ? 1 : q < 0.3 ? 2 : 0];
      var tr = mod(x - Y.x0, 2.2);
      if ((abs(tr - 0.9) < 0.06 || abs(tr - 1.3) < 0.06) && hash(fx >> 1, fy >> 2) > 0.3) c = TRK;   /* el arabası izleri */
      if (g > 0.985) return PEBL;
      if (g > 0.955) return PEB;
      if (g < 0.02) return lt(c, 0.1);
      return c;
    }
    if (x >= Pt.x0 && x < Pt.x1 && y >= Pt.y0 && y < Pt.y1) {
      var sy = (y - Pt.y0) / 0.48, si = floor(sy), ls = sy - si, lx = (x - Pt.x0) / (Pt.x1 - Pt.x0) - 0.5 + (si & 1) * 0.06;
      q = (ls - 0.5) * (ls - 0.5) * 3 + lx * lx * 1.6;
      if (q < 0.42) { c = FL[floor(hash(si, 23) * 3)]; return q > 0.33 ? FLD : (ls < 0.35 ? lt(c, 0.12) : c); }
      return g > 0.9 ? dk(PB, 0.08) : PB;
    }
    return null;
  });
  return r.sprite();
}
HKA.drawYardGround = function () { return true; };   /* v2.23: Hizmet Sahası zemini/patikası kalktı (lokanta arazisi kumsalla aynı zemin) */

/* =====================================================================
   VİNYET: klasikle aynı radyal gradyan, bir kez ara tuvale çizilir (her karede gradyan dolgusu yok)
   ===================================================================== */
var _vig = null, _vigKey = '';
HKA.drawVignette = function () {
  var H = G(), K = H.K, W = H.W, HH = H.H, key = W + 'x' + HH + 'k' + K;
  if (_vigKey !== key) {
    _vigKey = key; _vig = document.createElement('canvas'); _vig.width = W * K; _vig.height = HH * K;
    var g = _vig.getContext('2d'), gr = g.createRadialGradient(W * K / 2, HH * K * 0.48, min(W, HH) * K * 0.52, W * K / 2, HH * K * 0.48, max(W, HH) * K * 0.78);
    gr.addColorStop(0, 'rgba(8,24,36,0)'); gr.addColorStop(1, 'rgba(8,24,36,0.24)');
    g.fillStyle = gr; g.fillRect(0, 0, W * K, HH * K);
  }
  H.ctx.drawImage(_vig, 0, 0, W, HH);
  return true;
};

/* =====================================================================
   v2.26.1: ANAKARA KÖPRÜSÜ (ince) — elle piksellenmiş kesme taş: sıcak kireç taşı (meydan/ev paleti), sıra sıra blok + derz,
   blok başına ton farkı ve pah ışığı, kornişten süzülen yağmur izleri, su hattında ıslak bant + yosun, kemerlerde koyu kemer taşları
   (açık kilit taşı) ve gölgeli tonoz (kemerin içine bakan ışın izlenir: iç ayak duvarı + karanlık su), ayaklarda mahmuz, korkuluk
   ve dikme başlıklarında ışık, güvertede arnavut taşı + oluk + ada ucuna doğru kum. Suda ayak dibi köpüğü ve köprü gölgesi.
   Yöntem: her ince piksel için görüş ışını kutulara (gövde, korniş, korkuluk, dikme, mahmuz) kesilir, en öndeki yüz boyanır.
   Tampon satır satır, kare bütçesiyle kurulur (bitene dek klasik önbellek görünür); sonra yalnız drawImage + birkaç köpük.
   Ada ucu (taş rampa, kum, kaya, baş babaları) ayrı: HKA.drawMainBridgeFoot (yoldan sonra, kırpmasız).
   ===================================================================== */
var BR = null;
var BRP = null;
function brPal() {
  if (BRP) return BRP;
  BRP = {
    st: ['#c9bea4', '#c1b59a', '#cfc4ab', '#b8ac91', '#c5b99e', '#bdb196', '#c8b99a'].map(C),
    vs: ['#a89a7e', '#9f9177', '#b0a286', '#988a70'].map(C), key: C('#ddd3bb'),
    mort: C('#8d826c'), mortD: C('#6f6553'),
    alg: ['#5d6b3f', '#6c7a48', '#4f5c36', '#7d8a54'].map(C),
    setts: ['#cfc5ad', '#c6bba1', '#d6ccb5', '#bfb398', '#cbc0a6'].map(C), sm: C('#9c9079'), moss: C('#8f9a6a'),
    curb: C('#d8d2c4'), curbD: C('#a29a88'), sand: ['#dcc592', '#d6bf8a', '#e3cf9e'].map(C),
    cop: C('#e4dcc9'), copL: C('#f2ecdd'), copJ: C('#b7ad96'), corn: C('#d8cfb7'),
    wIn: C('#4f4b43'), soff: C('#3a3a37'), wat0: C('#2b4f5c'), wat1: C('#132832'), watL: C('#3d6b78'),
    foam: C('#eefafc'), shd: C('#0e2c3a')
  };
  return BRP;
}
/* kesme taş: t yüz boyunca (sanat px), z düşey; sıra yüksekliği rh; blok boyu ~11 px, sıraya göre şaşırtmalı */
function brAshlar(t, z, rh, seed) {
  var P = brPal(), q = z / rh, row = floor(q), f = (q - row) * rh, off = hash(row, seed) * 11, tt = t + off, bi = floor(tt / 11), ft = tt - bi * 11;
  if (hash(bi, row * 3 + seed) > 0.62 && abs(ft - 5.5) < 0.5) return P.mort;          /* bazı bloklar ikiye bölünür */
  if (ft < 0.5 || f < 0.5) return P.mort;
  var c = P.st[floor(hash(bi * 7 + seed, row) * P.st.length)];
  if (f > rh - 0.6 || ft < 1.1) c = lt(c, 0.1); else if (f < 1.0 || ft > 10.2) c = dk(c, 0.08);
  var g = hash(floor(t * 2), floor(z * 2) + seed * 13);
  if (g > 0.95) c = dk(c, 0.07); else if (g < 0.03) c = lt(c, 0.08);
  return c;
}
function brBuild() {
  var M = G().v('MAINBR'), K = G().K; if (!M) return null;
  var DZ = G().v('MAINBR_DZ') || 20, SP = G().v('MAINBR_SP') || 3.6;
  var x0 = M.x, x1 = M.x + M.w, ya = M.y0, yb = M.y1, n = round((yb - ya - 0.4) / SP), boxes = [], k;
  function bx(kind, X0, X1, Y0, Y1, Z0, Z1, i) { boxes.push({ k: kind, x0: X0, x1: X1, y0: Y0, y1: Y1, z0: Z0, z1: Z1, i: i, u0: (X0 - Y1) * 12, u1: (X1 - Y0) * 12, v0: (X0 + Y0) * 6 - Z1, v1: (X1 + Y1) * 6 - Z0 }); }
  bx('body', x0, x1, ya, yb, -DZ, 0);
  bx('corn', x1 - 0.1, x1 + 0.07, ya, yb, -2.2, 0);
  bx('par', x1 - 0.26, x1 + 0.02, ya, yb, 0, 4.5); bx('par', x0 - 0.02, x0 + 0.26, ya, yb, 0, 4.5);
  for (k = 0; k <= n; k++) {
    var qy = yb - 0.4 - k * SP;
    bx('post', x1 - 0.34, x1 + 0.08, qy - 0.2, qy + 0.2, 0, 7.5, k); bx('cap', x1 - 0.38, x1 + 0.12, qy - 0.24, qy + 0.24, 7.5, 8.8, k);
    bx('post', x0 - 0.08, x0 + 0.34, qy - 0.2, qy + 0.2, 0, 7.5, k); bx('cap', x0 - 0.12, x0 + 0.38, qy - 0.24, qy + 0.24, 7.5, 8.8, k);
    bx('cw', x1 - 0.1, x1 + 0.26, qy - 0.3, qy + 0.3, -DZ - 1, -DZ + 8, k); bx('cwc', x1 - 0.1, x1 + 0.18, qy - 0.24, qy + 0.24, -DZ + 8, -DZ + 9.6, k);
  }
  var hz = -42, u0 = (x0 - 0.15 - yb) * 12, u1 = (x1 + 1.2 - ya) * 12, v1 = (x1 + 1.2 + yb) * 6 + DZ + 2;
  var fx0 = floor(u0 * K), fy0 = floor(hz * K), r = new Ras(Math.ceil(u1 * K) - fx0, Math.ceil(v1 * K) - fy0, fx0, fy0);
  return { r: r, j: 0, boxes: boxes, row: [], M: M, DZ: DZ, SP: SP, n: n, x0: x0, x1: x1, ya: ya, yb: yb, K: K, s: null, R0: 14.4, zs: -DZ + 2 };
}
/* doğu yüzündeki kemer: y,z → {0: duvar, 1: açıklık, 2: kemer taşı (seg ≥ 0, 99 kilit)} ; B.ak = kemer merkezi */
function brArch(B, y, z) {
  var k = round((B.yb - 0.4 - y) / B.SP - 0.5); if (k < 0 || k >= B.n) return 0;
  var yc = B.yb - 0.4 - (k + 0.5) * B.SP, dt = (y - yc) * 12, dz = z - B.zs, R0 = B.R0, ad = abs(dt);
  B.yc = yc; B.dt = dt; B.dz = dz;
  if (z <= -B.DZ) return 0;
  if (dz < 0) { if (ad < R0) return 1; if (ad < R0 + 3.4) { B.seg = -1; return 2; } return 0; }
  var d = Math.sqrt(dt * dt + dz * dz);
  if (d < R0) return 1;
  var a = Math.atan2(dz, -dt) / Math.PI * 13, seg = floor(a);
  if (seg === 6 && d < R0 + 4.6) { B.seg = 99; B.fa = a - seg; B.d = d; return 2; }
  if (d < R0 + 3.4) { B.seg = seg; B.fa = a - seg; B.d = d; return 2; }
  return 0;
}
function brEast(B, y, z) {                                   /* doğu yüzü (x = x1): kemer, kemer taşı, kesme taş + yıpranma */
  var P = brPal(), w = brArch(B, y, z), c;
  if (w === 2) {
    if (B.seg === -1) { c = brAshlar(-y * 12, z + 40, 2.5, 5); return dk(c, 0.2); }
    if (B.seg === 99) return (B.fa < 0.08 || B.fa > 0.92) ? P.mortD : (B.d > B.R0 + 3.9 ? lt(P.key, 0.12) : P.key);
    if (B.fa < 0.09 || B.d > B.R0 + 2.9) return P.mortD;
    c = P.vs[floor(hash(B.seg, round(B.yc)) * P.vs.length)];
    return B.d < B.R0 + 0.8 ? dk(c, 0.12) : c;
  }
  if (w === 1) {                                              /* açıklık: ışını tonozun içine izle */
    var X = B.x1, Y = y, Z = z, yc = B.yc, i;
    for (i = 1; i < 70; i++) {
      X -= 0.03; Y -= 0.03; Z -= 0.36;
      var dx = B.x1 - X;
      if (Z <= -B.DZ) { c = mx(P.wat0, P.wat1, min(1, dx / 0.7)); if (hash(floor(Y * 18), floor(X * 40)) > 0.9 && dx < 0.6) c = mx(c, P.watL, 0.6); return c; }
      var dt = (Y - yc) * 12, dz = Z - B.zs;
      if (abs(dt) >= B.R0 || (dz >= 0 && dt * dt + dz * dz >= B.R0 * B.R0)) {
        c = dz < 0 || dt < -B.R0 + 1 ? P.wIn : P.soff;
        if (((Z + 40) % 2.5) < 0.5) c = dk(c, 0.25);
        return mx(c, P.wat1, min(0.75, dx / 1.4));
      }
    }
    return P.wat1;
  }
  c = brAshlar(-y * 12, z + 40, 2.5, 3);
  var DZ = B.DZ, h = hash(floor(-y * 8), 77);
  if (z > -3.1) c = dk(c, 0.14);                                                         /* korniş altı gölge */
  else if (h > 0.86 && z > -3 - 4 - hash(floor(-y * 8), 78) * 10) c = dk(c, 0.12);       /* yağmur izi */
  var wl = -DZ + 2.2 + sin(y * 9) * 0.5 + hash(floor(-y * 24), 5) * 1.2;
  if (z < wl) { var ag = P.alg[floor(hash(floor(-y * 24), floor(z * 2)) * 3)]; c = (z < wl - 0.8 || hash(floor(-y * 30), floor(z * 4)) > 0.4) ? ag : mx(c, ag, 0.5); if (hash(floor(-y * 40), floor(z * 4) + 3) > 0.96) c = P.alg[3]; }
  else if (z < -DZ + 5.5) c = dk(c, 0.18 * (1 - (z + DZ - 2) / 3.5));
  return c;
}
function brDeck(B, x, y) {                                   /* güverte: arnavut taşı, oluk, ada ucuna kum */
  var P = brPal(), e = min(x - B.x0, B.x1 - x), c;
  if (e < 0.42) {
    if (((y % 0.9) + 0.9) % 0.9 < 0.04) c = P.curbD; else c = e < 0.3 ? P.curb : lt(P.curb, 0.1);
  } else {
    var rj = floor(y / 0.3), ox = (rj & 1) * 0.21, gx = x - B.x0 + ox, ci = floor(gx / 0.42), lx = gx - ci * 0.42, ly = y - rj * 0.3;
    var m1 = min(lx, 0.42 - lx), m2 = min(ly, 0.3 - ly);
    if (m1 < 0.03 || m2 < 0.03) c = (e < 0.8 && hash(ci, rj * 3) > 0.7) ? P.moss : P.sm;
    else {
      c = P.setts[floor(hash(ci * 5 + 1, rj) * P.setts.length)];
      if (lx < 0.07 || ly < 0.06) c = lt(c, 0.14); else if (lx > 0.35 || ly > 0.25) c = dk(c, 0.12);
      if (abs(x - (B.x0 + B.x1) / 2) < 0.9) c = lt(c, 0.05);
    }
  }
  var sd = (y - (B.yb - 1.8)) / 1.8;                                                        /* ada ucunda kum */
  if (sd > 0) { var p = Math.pow(sd, 1.4) * (0.4 + (e < 0.6 ? 0.35 : 0)); if (hash(floor(x * 30), floor(y * 40)) < p) c = P.sand[floor(hash(floor(x * 20), floor(y * 20)) * 3)]; }
  return c;
}
function brFace(B, b, f, x, y, z) {                          /* kutu yüzü rengi; f: 0 üst, 1 sol (+y), 2 sağ (+x) */
  var P = brPal(), c;
  switch (b.k) {
    case 'body': if (f === 0) return brDeck(B, x, y); if (f === 2) return brEast(B, y, z); return dk(brAshlar(x * 12, z + 40, 2.5, 9), 0.04);
    case 'corn':
      if (f === 0) return lt(P.corn, 0.12);
      if (z > -0.5) return lt(P.corn, 0.16); if (z < -1.7) return dk(P.corn, 0.22);
      return ((((-y) % 0.75) + 0.75) % 0.75 < 0.04) ? P.copJ : (f === 2 ? dk(P.corn, 0.06) : P.corn);
    case 'par':
      if (f === 0) { if (((y % 0.75) + 0.75) % 0.75 < 0.04) return P.copJ; return (x - b.x0 < 0.05 || b.x1 - x < 0.05) ? P.copL : P.cop; }
      if (z > 3.9) return f === 2 ? dk(P.cop, 0.1) : P.cop;
      c = brAshlar(f === 2 ? -y * 12 : x * 12, z, 2.25, 11 + (b.x0 > B.x0 + 1 ? 1 : 0));
      return f === 2 ? dk(c, 0.16) : c;
    case 'post': case 'cw':
      c = brAshlar(f === 2 ? -y * 12 : x * 12, z + 40, 2.5, 13 + b.i);
      if (f === 0) return lt(c, 0.14);
      if (b.k === 'cw' && z < -B.DZ + 2.4 + hash(floor(-y * 24), 9)) c = P.alg[floor(hash(floor(-y * 30), floor(z * 3)) * 3)];
      return f === 2 ? dk(c, 0.16) : c;
    default:                                                  /* başlıklar */
      if (f === 0) return (x - b.x0 < 0.06 || y - b.y0 < 0.06) ? P.copL : lt(P.cop, 0.06);
      return f === 2 ? dk(P.cop, 0.12) : (z > b.z1 - 0.5 ? P.copL : P.cop);
  }
}
function brStep(B) {
  var r = B.r, K = B.K, P = brPal(), boxes = B.boxes, row = B.row, nb, i, q;
  for (var j = B.j; j < r.h; j++) {
    if ((j & 3) === 0 && j > B.j && now() > budgetEnd) { B.j = j; return false; }
    var fy = r.oy + j, v = (fy + 0.5) / K;
    row.length = 0;
    for (q = 0; q < boxes.length; q++) if (v >= boxes[q].v0 - 0.5 && v <= boxes[q].v1 + 0.5) row.push(boxes[q]);
    nb = row.length;
    for (i = 0; i < r.w; i++) {
      var fx = r.ox + i, u = (fx + 0.5) / K, U = u / 12, best = -1e9, bb = null, bf = 0;
      for (q = 0; q < nb; q++) {
        var b = row[q]; if (u < b.u0 - 0.5 || u > b.u1 + 0.5) continue;
        var hx = 2 * b.x1 - U, hy = 2 * b.y1 + U, hzz = (b.z1 + v) / 6, hi = hx, f = 2;
        if (hy < hi) { hi = hy; f = 1; } if (hzz < hi) { hi = hzz; f = 0; }
        var lo = max(2 * b.x0 - U, 2 * b.y0 + U, (b.z0 + v) / 6);
        if (hi > lo && hi > best) { best = hi; bb = b; bf = f; }
      }
      if (bb) { r.setI(i, j, brFace(B, bb, bf, (best + U) / 2, (best - U) / 2, 6 * best - v)); continue; }
      var s = (v - B.DZ) / 6, X = (s + U) / 2, Y = (s - U) / 2;                         /* su: ayak dibi köpüğü + gölge */
      if (Y < B.ya || Y > B.yb + 0.3 || X < B.x1) continue;
      var dx = X - B.x1, kq = round((B.yb - 0.4 - Y) / B.SP), qy = B.yb - 0.4 - kq * B.SP, near = abs(Y - qy) < 0.42 && kq >= 0 && kq <= B.n;
      var dd = near ? X - (B.x1 + 0.26) + max(0, abs(Y - qy) - 0.3) * 1.2 : dx, g = bayer[fy & 3][fx & 3];
      if (dd < 0.05 && dd > -0.3) { r.setI(i, j, P.foam, hash(fx, 11) > 0.2 ? 0.85 : 0.5); continue; }
      if (dd < 0.15 && dd > -0.3 && hash(fx >> 1, fy) > 0.45) { r.setI(i, j, P.foam, 0.45); continue; }
      if (dx < 1.1) r.setI(i, j, P.shd, 0.24 * (1 - dx / 1.1) * (0.85 + g * 0.3));
    }
  }
  B.s = r.sprite(); B.r = null;
  return true;
}
var BR_FOAM = ['rgba(238,250,252,0.35)', 'rgba(238,250,252,0.55)', 'rgba(238,250,252,0.75)'];
HKA.drawMainBridge = function (o) {
  var H = G(), K = H.K;
  if (!BR || BR.K !== K) { BR = brBuild(); if (!BR) return false; }
  if (!BR.s) { if (now() > budgetEnd || !brStep(BR)) return false; }
  if (!BR.s) return false;
  put(BR.s, BR.s.ox, BR.s.oy);
  var t = o.t || 0, g = H.ctx;                                                            /* mahmuz dibinde dalgalanan köpük */
  for (var k = 0; k <= BR.n; k++) {
    var qy = BR.yb - 0.4 - k * BR.SP, ph = sin(t * 1.4 + k * 1.7), X = (BR.x1 + 0.34 - qy) * 12, Y = (BR.x1 + 0.34 + qy) * 6 + BR.DZ;
    g.fillStyle = BR_FOAM[ph > 0.3 ? 2 : ph > -0.3 ? 1 : 0];
    g.fillRect((round(X * K) - 5) / K, round(Y * K) / K, 8 / K, 1 / K);
    g.fillRect((round(X * K) - 2 + round(ph * 2)) / K, (round(Y * K) + 2) / K, 5 / K, 1 / K);
  }
  return true;
};
/* ada ucu: taş rampa kuma/yola dağılır, kaya dolgusu (gölgeli yuvarlak taşlar, dibinde yosun + köpük), korkuluk uçlarında baş babaları */
function brFootBuild() {
  var M = G().v('MAINBR'), RK = G().v('MAINBR_ROCKS'), K = G().K; if (!M || !RK) return null;
  var P = brPal(), x0 = M.x, x1 = M.x + M.w, r = worldRas(9.1, -1.2, 16.8, 0.15, 12, 6), i;
  var B = { x0: x0, x1: x1, yb: 0.6 };
  eachXY(r, 0, function (x, y, fx, fy) {
    var c = null, sd = 0;
    for (var q = 0; q < RK.length; q++) { var dx = (x - RK[q][0]) / (RK[q][2] * 2.1), dy = (y - RK[q][1]) / (RK[q][2] * 1.6), d = dx * dx + dy * dy; if (d < 1) sd = max(sd, 1 - d); }
    if (x > x0 + 0.2 && x < x1 - 0.2 && y > -0.85 && y < -0.1) {
      var fade = (y + 0.5) / 0.4, ed = min(x - x0 - 0.2, x1 - 0.2 - x) / 0.25, th = max(fade, 1 - ed);
      if (th < bayer[fy & 3][fx & 3] * 0.9 + (hash(fx >> 2, fy >> 2) - 0.5) * 0.5) c = brDeck(B, x, y);
      else if (hash(fx, fy) > 0.82 && th < 1.4) c = P.sand[floor(hash(fx >> 1, fy) * 3)];
    }
    if (!c && sd > 0) { PA = min(1, sd * 1.6); c = P.sand[floor(hash(fx >> 1, fy >> 1) * 3)]; if (sd > 0.5 && hash(fx, fy) > 0.9) c = dk(c, 0.12); }
    return c;
  }, [9.1, -1.2, 16.8, 0.15]);
  var Lx = -0.55, Ly = -0.62, Lz = 0.56, SH = ['#55504a', '#6f685d', '#8c8475', '#a9a08e', '#c3baa6', '#d8d0bd'].map(C);
  var rs = RK.slice().sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
  for (i = 0; i < rs.length; i++) {                                                       /* kayalar */
    var q = rs[i], cx = (q[0] - q[1]) * 12 * K, s = q[2], rx = s * 13 * K, ry = s * 9 * K, cy = ((q[0] + q[1]) * 6 - s * 5) * K, sea = q[1] < -0.62;
    for (var yy = -ry; yy <= ry; yy++) for (var xx = -rx; xx <= rx; xx++) {
      var nx = xx / rx, ny = yy / ry, dd = nx * nx + ny * ny * (ny > 0 ? 1.6 : 1); if (dd > 1) continue;
      var bump = hash(floor((cx + xx) / 3), floor((cy + yy) / 3)) * 0.25, nz = Math.sqrt(max(0, 1 - dd));
      var lum = (Lx * nx + Ly * ny + Lz * nz) * 0.9 + 0.35 + bump - 0.12, ci = min(5, max(0, floor(lum * 5 + bayer[(cy + yy) & 3][(cx + xx) & 3] * 0.9)));
      var col = dd > 0.86 ? SH[0] : SH[ci];
      if (sea && ny > 0.35 && hash(floor(xx), floor(yy)) > 0.3) col = P.alg[floor(hash(xx, yy + 5) * 3)];
      r.set(cx + xx, cy + yy, col);
    }
    if (sea) for (var fq = -rx - 2; fq <= rx + 2; fq++) if (hash(fq, i) > 0.35) r.set(cx + fq, cy + ry * 0.75 + 1 + (abs(fq) > rx * 0.6 ? -1 : 0), P.foam, 0.75);
  }
  var nw = [];                                                                            /* baş babaları */
  [x0 - 0.04, x1 - 0.42].forEach(function (bx0) { nw.push({ k: 'post', x0: bx0, x1: bx0 + 0.46, y0: -0.82, y1: -0.38, z0: 0, z1: 9, i: 7 }); nw.push({ k: 'cap', x0: bx0 - 0.04, x1: bx0 + 0.5, y0: -0.86, y1: -0.34, z0: 9, z1: 10.6, i: 7 }); });
  var BB = { DZ: 20, x0: x0 };
  for (var j = 0; j < r.h; j++) {
    var v = (r.oy + j + 0.5) / K;
    for (var ii = 0; ii < r.w; ii++) {
      var U = (r.ox + ii + 0.5) / K / 12, best = -1e9, bb = null, bf = 0;
      for (var n2 = 0; n2 < nw.length; n2++) {
        var b = nw[n2], hx = 2 * b.x1 - U, hy = 2 * b.y1 + U, hzz = (b.z1 + v) / 6, hi = hx, f = 2;
        if (hy < hi) { hi = hy; f = 1; } if (hzz < hi) { hi = hzz; f = 0; }
        var lo = max(2 * b.x0 - U, 2 * b.y0 + U, (b.z0 + v) / 6);
        if (hi > lo && hi > best) { best = hi; bb = b; bf = f; }
      }
      if (bb) r.setI(ii, j, brFace(BB, bb, bf, (best + U) / 2, (best - U) / 2, 6 * best - v));
    }
  }
  return r.sprite();
}
HKA.drawMainBridgeFoot = function () {
  var s = need('brfoot' + G().K, brFootBuild);
  if (!s) return false;
  put(s, s.ox, s.oy);
  return true;
};

HKA.onReset(function () { store.clear(); chunks = null; geoKey = ''; _vig = null; _vigKey = ''; _grass = null; BR = null; BRP = null; });
})();
