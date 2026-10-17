/* =====================================================================
   HAMSİ KOYU — İNCE PİKSEL: GAZETE (intro + Bölüm 1 sonu)
   game.js drawPaper ince görünümde (intro.k = 2) kâğıdı ve resim kutusunu 2 kat çözünürlükte çizer;
   resimler için HKA.gazete[ad](g, P, t, W, H) çağrılır. g'nin dönüşümü sanat pikseli biriminde, W×H sanat pikseli
   (166×84); burada ince piksel (yarım birim) çizilir. P: baskı paleti (sepya ya da renkli; anlamsal anahtarlar).
   Gazete fotoğrafı havası: bayer tramlı geçişler, koyu mürekkep kontur, ışık sol üstten.
   ===================================================================== */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib;
if (!L) return;                                         /* temel.js yoksa klasik gazete */
var mix = L.mix, dark = L.dark, lite = L.lite, hash = L.hash, bayer = L.bayer;
var GZ = HKA.gazete = {};
var _pxT = null;
function pxText() { if (!_pxT) _pxT = window.HKG.v('pxText'); return _pxT.apply(null, arguments); }   /* oyunun gazete yazı tipi */

/* ince dikdörtgen: (x,y,w,h) ince piksel */
function F(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x / 2, y / 2, (w || 1) / 2, (h || 1) / 2); }
function disc(g, cx, cy, r, c) { for (var j = -r; j <= r; j++) { var w = Math.round(Math.sqrt(r * r - j * j)); F(g, cx - w, cy + j, w * 2, 1, c); } }

/* önbellekli statik katman: ince piksel tuval (W*2 × H*2), anahtar = sahne + palet */
var LAY = {};
HKA.onReset && HKA.onReset(function () { LAY = {}; });
function layer(key, P, Wf, Hf, draw) {
  var k = key + '|' + P.sky + P.sea;
  var c = LAY[k];
  if (c) return c;
  c = document.createElement('canvas'); c.width = Wf; c.height = Hf;
  var x = c.getContext('2d'), id = x.createImageData(Wf, Hf);
  draw(function (px, py, col) {                          /* tek piksel yaz (renk #rrggbb) */
    if (px < 0 || py < 0 || px >= Wf || py >= Hf) return;
    var v = L.hx(col), i = (py * Wf + px) * 4; id.data[i] = v[0]; id.data[i + 1] = v[1]; id.data[i + 2] = v[2]; id.data[i + 3] = 255;
  }, Wf, Hf);
  x.putImageData(id, 0, 0);
  return (LAY[k] = c);
}
function put(g, c, W, H) { g.drawImage(c, 0, 0, W, H); }
/* tramlı dikey geçiş (bayer) — gazete fotoğrafı */
function grad(set, x0, y0, x1, y1, stops) {
  for (var y = y0; y < y1; y++) {
    var f = (y - y0) / Math.max(1, y1 - y0 - 1) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)), fr = f - i;
    for (var x = x0; x < x1; x++) set(x, y, fr > bayer[y & 3][x & 3] ? stops[i + 1] : stops[i]);
  }
}
/* izometrik olmayan küçük sprite: Buf ile çiz, kontur ekle, önbelleğe al */
function spr(key, build) { return L.sprite('gz:' + key, build); }
function blitS(g, s, fx, fy) { if (s && s.cv) g.drawImage(s.cv, (fx + s.x0) / 2, (fy + s.y0) / 2, s.w / 2, s.h / 2); }

/* ---------------- kâğıt ---------------- */
var PAPER = null;
GZ.paper = function (g, W, H) {
  if (!PAPER) {
    PAPER = document.createElement('canvas'); PAPER.width = W * 2; PAPER.height = H * 2;
    var x = PAPER.getContext('2d'), i;
    for (i = 0; i < 900; i++) {                                     /* lif ve leke: ince, seyrek */
      var a = hash(i, 3), b = hash(i, 5), c = hash(i, 7);
      x.fillStyle = c > 0.55 ? '#ddd0b0' : c > 0.2 ? '#efe5cc' : '#d6c7a4';
      x.fillRect(Math.floor(a * W * 2), Math.floor(b * H * 2), 1 + Math.floor(hash(i, 9) * 3), 1);
    }
    for (i = 0; i < 6; i++) {                                       /* sararmış lekeler */
      var lx = hash(i, 21) * W * 2, ly = hash(i, 22) * H * 2, r = 6 + hash(i, 23) * 14;
      for (var yy = -r; yy <= r; yy++) for (var xx = -r; xx <= r; xx++) if (xx * xx + yy * yy < r * r && hash(xx + i * 50, yy) > 0.55) { x.fillStyle = 'rgba(190,165,110,.10)'; x.fillRect(lx + xx, ly + yy, 1, 1); }
    }
    x.fillStyle = 'rgba(120,96,60,.18)';                            /* kenar aşınması */
    for (i = 0; i < W * 2; i++) { if (hash(i, 31) > 0.6) x.fillRect(i, 0, 1, 1 + Math.floor(hash(i, 32) * 2)); if (hash(i, 33) > 0.6) x.fillRect(i, H * 2 - 1 - Math.floor(hash(i, 34) * 2), 1, 2); }
  }
  g.drawImage(PAPER, 0, 0, W, H);
};

/* ---------------- ortak parçalar ---------------- */
function gull(g, P, x, y, t, k) {                         /* ince martı: kanat 2 kare */
  var up = Math.sin(t * 8 + k) > 0, ink = P.ink, wing = P.lite;
  if (up) { F(g, x - 6, y - 2, 2, 1, ink); F(g, x - 4, y - 1, 3, 1, ink); F(g, x + 2, y - 1, 3, 1, ink); F(g, x + 5, y - 2, 2, 1, ink); }
  else { F(g, x - 6, y + 1, 2, 1, ink); F(g, x - 4, y, 3, 1, ink); F(g, x + 2, y, 3, 1, ink); F(g, x + 5, y + 1, 2, 1, ink); }
  F(g, x - 1, y, 3, 2, wing); F(g, x - 1, y + 1, 3, 1, ink);
}
function waves(g, P, t, y0, y1, Wf, n, sp, col, seed) {
  for (var i = 0; i < n; i++) {
    var wy = y0 + Math.floor(hash(i, seed) * (y1 - y0)), len = 4 + Math.floor(hash(i, seed + 1) * 10) * (0.4 + (wy - y0) / (y1 - y0));
    var wx = ((hash(i, seed + 2) * (Wf + 40) + t * sp * (0.6 + (wy - y0) / (y1 - y0))) % (Wf + 40)) - 20;
    F(g, Math.round(wx), wy, Math.round(len), 1, col);
  }
}
function pierPlanks(set, P, x0, x1, y, h) {               /* yandan iskele: tahta damarlı üst, gölgeli kenar */
  var w1 = P.wood, w2 = P.wood2;
  for (var x = x0; x < x1; x++) for (var j = 0; j < h; j++) {
    var c = j === 0 ? lite(w1, 0.25) : j < h - 3 ? w1 : w2;
    if ((x - x0) % 12 === 0) c = w2;
    if (j > 0 && j < h - 3 && hash(x >> 2, j) > 0.8) c = dark(w1, 0.12);
    set(x, y + j, c);
  }
}

/* ---------------- 1) terk edilmiş iskele (gece) ---------------- */
GZ.pier = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2;
  put(g, layer('pier', P, Wf, Hf, function (set) {
    grad(set, 0, 0, Wf, 112, [dark(P.sky2, 0.35), P.sky2, mix(P.sky2, P.sea, 0.45)]);
    for (var x = 0; x < Wf; x++) {                                  /* uzak tepe silueti (hava perspektifi) */
      var hy = 96 + Math.round(Math.sin(x * 0.03) * 5 + Math.sin(x * 0.11) * 2);
      for (var y = hy; y < 112; y++) set(x, y, mix(P.sky2, P.sea2, 0.35));
    }
    grad(set, 0, 112, Wf, Hf, [mix(P.sea2, P.sky2, 0.3), P.sea2, dark(P.sea2, 0.25)]);
    /* ay: hilal, sol üstten ışık */
    for (var j = -16; j <= 16; j++) for (var i = -16; i <= 16; i++) {
      var d = i * i + j * j, d2 = (i - 7) * (i - 7) + (j + 5) * (j + 5);
      if (d <= 256 && d2 > 150) set(256 + i, 36 + j, d > 200 ? mix(P.lite, P.sky2, 0.25) : (i + j < -6 ? lite(P.lite, 0.3) : P.lite));
    }
    pierPlanks(set, P, 0, 184, 100, 11);
    for (var k = 8; k < 184; k += 32) for (var y2 = 111; y2 < 142; y2++) { set(k, y2, P.wood2); set(k + 1, y2, P.wood2); set(k + 2, y2, dark(P.wood2, 0.3)); set(k + 3, y2, dark(P.wood2, 0.3)); }
    /* kırık tahta */
    for (var b = 0; b < 10; b++) set(120 + b, 100 + (b >> 2), P.sky2);
    /* kurumuş ağ: direk + seyrek göz */
    for (var y3 = 76; y3 < 100; y3++) { set(36, y3, P.wood2); set(37, y3, P.wood2); set(80, y3, P.wood2); set(81, y3, P.wood2); }
    for (var nx = 38; nx < 80; nx++) for (var ny = 80; ny < 100 - Math.abs(nx - 59) * 0.25; ny++) if ((nx + ny) % 4 === 0 || (nx - ny) % 4 === 0) set(nx, ny, mix(P.sea, P.lite, 0.2));
  }), W, H);
  var i, r;
  for (i = 0; i < 40; i++) {                                         /* yıldızlar göz kırpar */
    var sx = Math.floor(hash(i, 71) * Wf), sy = Math.floor(hash(i, 72) * 90), ph = hash(i, 73) * 6, s = Math.sin(t * 2.2 + ph);
    if (s > -0.3) { F(g, sx, sy, 1, 1, P.lite); if (s > 0.85 && i % 3 === 0) { F(g, sx - 1, sy, 3, 1, mix(P.lite, P.sky2, 0.5)); F(g, sx, sy - 1, 1, 3, mix(P.lite, P.sky2, 0.5)); } }
  }
  for (i = 0; i < 16; i++) {                                         /* ay yansıması */
    var ry = 118 + i * 3, rw = 22 - i + Math.round(Math.sin(t * 3 + i) * 3);
    F(g, Math.round(252 - rw / 2 + Math.sin(t * 2 + i) * 3), ry, rw, 1, i < 5 ? P.lite : mix(P.lite, P.sea2, 0.35));
  }
  waves(g, P, t, 116, Hf - 2, Wf, 26, 12, mix(P.sea, P.sea2, 0.3), 80);
  /* söner fener */
  F(g, 140, 58, 3, 42, P.ink); F(g, 132, 56, 20, 3, P.ink); F(g, 134, 59, 14, 2, P.wood2);
  var on = Math.sin(t * 7) > 0.6 || Math.sin(t * 1.3) > 0.2;
  F(g, 135, 61, 12, 8, P.ink);
  if (on) { F(g, 137, 62, 8, 6, P.sun); F(g, 137, 62, 3, 2, lite(P.sun, 0.5)); g.globalAlpha = 0.18; disc(g, 141, 65, 14, P.sun); g.globalAlpha = 1; }
  else F(g, 137, 62, 8, 6, dark(P.sun, 0.5));
  /* bağlı kayık */
  var by = 130 + Math.round(Math.sin(t * 1.6) * 2);
  r = spr('kayik' + P.wood, function (b) {
    for (var j = 0; j < 10; j++) { var ins = Math.round(Math.pow(j / 10, 2) * 8); b.rect(ins, j, 52 - ins * 2, 1, j < 2 ? lite(P.wood, 0.25) : j < 7 ? P.wood : P.wood2); }
    b.rect(4, 2, 44, 1, P.wood2); b.rect(6, -2, 3, 2, P.wood2); b.outline(0.55);
  });
  blitS(g, r, 200, by);
  F(g, 184, 110, 1, 1, P.ink); F(g, 186, 112, 4, 1, P.ink); F(g, 192, 116, 6, 1, P.ink); F(g, 200, 121, 1, by - 121, P.ink);
  g.globalAlpha = 0.35; F(g, 196, by + 11, 60, 1, P.lite); g.globalAlpha = 1;
};

/* ---------------- 2) hamsi sürüleri koya döndü (gündüz) ---------------- */
GZ.school = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2;
  put(g, layer('school', P, Wf, Hf, function (set) {
    grad(set, 0, 0, Wf, 68, [lite(P.sky, 0.25), P.sky, mix(P.sky, P.lite, 0.4)]);
    for (var j = -14; j <= 14; j++) for (var i = -14; i <= 14; i++) { var d = i * i + j * j; if (d <= 196) set(48 + i, 28 + j, d > 150 ? mix(P.sun, P.sky, 0.3) : (i + j < -8 ? lite(P.sun, 0.4) : P.sun)); }
    grad(set, 0, 68, Wf, Hf, [mix(P.sea, P.sky, 0.25), P.sea, P.sea2, dark(P.sea2, 0.2)]);
    for (var x = 0; x < Wf; x++) set(x, 68, lite(P.sea, 0.35));
  }), W, H);
  var k;
  waves(g, P, t, 72, Hf, Wf, 30, 10, lite(P.sea, 0.25), 40);
  for (k = 0; k < 8; k++) {                                          /* güneş ışınları */
    var a = Math.PI * 0.1 + k * 0.23 + Math.sin(t) * 0.02;
    for (var d = 22; d < 34; d += 3) F(g, Math.round(48 + Math.cos(a) * d), Math.round(28 + Math.sin(a) * d), 2, 1, P.sun);
  }
  var cx = 168, cy = 124;
  for (k = 0; k < 110; k++) {                                        /* dönen hamsi sürüsü: ince gövde + kuyruk + parıltı */
    var an = k * 0.61 + t * (0.9 + (k % 5) * 0.05), rr = 20 + (k * 7) % 52;
    var fx = Math.round(cx + Math.cos(an) * rr * 1.6), fy = Math.round(cy + Math.sin(an) * rr * 0.55);
    var dir = -Math.sin(an) >= 0 ? 1 : -1, glint = (k + Math.floor(t * 6)) % 9 === 0;
    F(g, fx, fy, 7, 2, glint ? P.lite : P.aw2); F(g, fx, fy + 1, 7, 1, dark(P.aw2, 0.25));
    F(g, dir > 0 ? fx + 7 : fx - 2, fy, 2, 1, P.aw2); F(g, dir > 0 ? fx + 7 : fx - 2, fy + 1, 1, 1, P.aw2);
    F(g, dir > 0 ? fx : fx + 6, fy, 1, 1, P.ink);
  }
  for (k = 0; k < 4; k++) {                                          /* sıçrayan balıklar + sıçrama */
    var ph = (t * 0.7 + k * 0.27) % 1, jx = 40 + k * 76 + ph * 36, jy = 70 - Math.sin(ph * Math.PI) * 36;
    if (ph < 0.95) { F(g, Math.round(jx), Math.round(jy), 8, 3, P.lite); F(g, Math.round(jx), Math.round(jy) + 2, 8, 1, P.aw2); F(g, Math.round(jx) + 6, Math.round(jy), 1, 1, P.ink); F(g, Math.round(jx) - 2, Math.round(jy) - 1, 2, 2, P.aw2); }
    if (ph > 0.9 || ph < 0.08) { F(g, Math.round(jx) - 4, 66, 1, 2, P.lite); F(g, Math.round(jx) + 10, 64, 1, 2, P.lite); F(g, Math.round(jx) + 2, 62, 1, 2, P.lite); }
  }
  for (k = 0; k < 3; k++) gull(g, P, Math.round((k * 120 + t * 28) % (Wf + 40)) - 20, 16 + k * 12, t, k);
};

/* ---------------- 3) belediye ilanı ---------------- */
GZ.ad = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2, px = 52, py = 16, pw = 228, ph = 152;
  put(g, layer('ad', P, Wf, Hf, function (set) {
    for (var y = 0; y < Hf; y++) for (var x = 0; x < Wf; x++) {     /* tuğla duvar: harç, tuğla tonu, sol üst ışık */
      var row = Math.floor(y / 12), off = row % 2 ? 0 : 14, bx = Math.floor((x + off) / 28), lx = (x + off) % 28, ly = y % 12;
      var c = hash(bx, row) > 0.5 ? P.sky : mix(P.sky, P.aw2, 0.4);
      if (ly === 0 || lx === 0) c = P.sea; else if (ly === 1 || lx === 1) c = lite(c, 0.2); else if (ly === 11 || lx === 27) c = dark(c, 0.15);
      if (hash(x, y) > 0.94) c = dark(c, 0.1);
      set(x, y, c);
    }
    for (var y2 = 0; y2 < ph; y2++) for (var x2 = 0; x2 < pw; x2++) set(px + 4 + x2, py + 4 + y2, mix(P.ink, P.sky, 0.3));   /* gölge */
    for (var y3 = 0; y3 < ph; y3++) for (var x3 = 0; x3 < pw; x3++) {
      var c3 = P.lite; if (hash(x3, y3) > 0.92) c3 = dark(P.lite, 0.06); if (x3 < 2 || y3 < 2) c3 = lite(P.lite, 0.3);
      set(px + x3, py + y3, c3);
    }
    for (var x4 = 6; x4 < pw - 6; x4++) { set(px + x4, py + 6, P.ink); set(px + x4, py + ph - 8, P.ink); }
    for (var i = 0; i < 5; i++) for (var x5 = 20; x5 < pw - 20 - (i === 4 ? 60 : (i * 14) % 24); x5++) if (hash(x5 >> 2, i) > 0.12) { set(px + x5, py + 82 + i * 10, P.sea); set(px + x5, py + 83 + i * 10, mix(P.sea, P.lite, 0.4)); }
    for (var j = -12; j <= 12; j++) for (var k = -12; k <= 12; k++) { var d = j * j + k * k; if (d <= 144) set(px + pw - 40 + k, py + ph - 32 + j, d > 110 ? dark(P.aw1, 0.3) : (k + j < -6 ? lite(P.aw1, 0.25) : P.aw1)); }
  }), W, H);
  pxText(g, (window.BT && BT.lang && BT.lang() === 'en') ? 'NOTICE' : 'İLAN', px / 2 + pw / 4, py / 2 + 9, 2, 2, true, P.ink, 'center');
  pxText(g, (window.BT && BT.lang && BT.lang() === 'en') ? 'FISHER WANTED!' : 'BALIKÇI ARANIYOR!', px / 2 + pw / 4, py / 2 + 28, 1, 1, false, P.aw1, 'center');
  F(g, px + pw - 46, py + ph - 33, 12, 2, P.lite); F(g, px + pw - 41, py + ph - 38, 2, 10, P.lite);
  /* raptiyeler */
  [[px + 4, py + 2], [px + pw - 10, py + 2]].forEach(function (q) { F(g, q[0], q[1], 6, 6, P.aw1); F(g, q[0] + 1, q[1] + 1, 2, 2, lite(P.aw1, 0.4)); F(g, q[0] + 4, q[1] + 4, 2, 2, dark(P.aw1, 0.35)); });
  var flap = Math.round(Math.max(0, Math.sin(t * 2.4)) * 8);          /* rüzgârda köşe kalkar */
  for (var i = 0; i < flap; i++) { F(g, px + pw - flap + i, py + ph - flap + (flap - 1 - i), i + 1, 1, mix(P.aw2, P.lite, 0.3)); F(g, px + pw - 1 - i, py + ph - 1 - (flap - 1 - i), 1, 1, P.sky); }
  /* ilanın üstündeki martı */
  var hop = Math.sin(t * 3) > 0.85 ? 2 : 0, mx = px + 24, my = py - 14 - hop;
  var gs = spr('ilanmarti' + P.lite, function (b) {
    b.rect(0, 0, 14, 7, P.lite); b.rect(12, -6, 6, 7, P.lite); b.rect(0, 0, 8, 3, P.sea2); b.rect(1, 1, 6, 1, dark(P.sea2, 0.2));
    b.rect(18, -4, 4, 2, P.gold); b.set(15, -4, P.ink); b.rect(4, 7, 1, 6, P.gold); b.rect(10, 7, 1, 6, P.gold); b.rect(-2, 1, 2, 2, P.sea2);
    b.outline(0.6);
  });
  blitS(g, gs, mx, my);
};

/* ---------------- 4) şafak ---------------- */
GZ.dawn = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2, i, rise = Math.min(1, t / 6);
  put(g, layer('dawn', P, Wf, Hf, function (set) {
    grad(set, 0, 0, Wf, 104, [P.sky, mix(P.sky, P.aw2, 0.5), P.aw2, lite(P.sun, 0.1)]);
    for (var x = 0; x < Wf; x++) { var hy = 94 + Math.round(Math.sin(x * 0.025 + 1) * 4); for (var y = hy; y < 104; y++) set(x, y, mix(P.sky, P.sea2, 0.35)); }
  }), W, H);
  var sy = 104 - Math.round(rise * 24);                                /* doğan güneş + hale */
  g.globalAlpha = 0.25; disc(g, 240, sy, 38, P.sun); g.globalAlpha = 0.4; disc(g, 240, sy, 32, P.sun); g.globalAlpha = 1;
  for (i = -28; i <= 0; i++) { var w = Math.round(Math.sqrt(784 - i * i)); F(g, 240 - w, sy + i, w * 2, 1, i < -20 ? lite(P.sun, 0.35) : P.sun); }
  for (i = 0; i < 12; i++) {
    var a = Math.PI + (i + 0.5) * Math.PI / 12 + Math.sin(t) * 0.03;
    for (var d = 36; d < 60; d += 3) F(g, Math.round(240 + Math.cos(a) * d), Math.round(sy + Math.sin(a) * d), 2, 1, P.sun);
  }
  put(g, layer('dawnsea', P, Wf, Hf, function (set) {
    grad(set, 0, 104, Wf, Hf, [mix(P.sea2, P.sun, 0.25), P.sea2, dark(P.sea2, 0.25)]);
    pierPlanks(set, P, 0, 160, 120, 10);
    for (var k = 8; k < 160; k += 28) for (var y = 130; y < Hf; y++) { set(k, y, P.wood2); set(k + 1, y, P.wood2); set(k + 2, y, dark(P.wood2, 0.3)); set(k + 3, y, dark(P.wood2, 0.3)); }
  }), W, H);
  for (i = 0; i < 18; i++) {                                           /* güneş yolu */
    var gw = 40 - i * 1.8 + Math.sin(t * 3 + i) * 5;
    if (240 - gw / 2 > 160 || i > 4) F(g, Math.round(240 - gw / 2 + Math.sin(t * 2 + i) * 2), 108 + i * 3, Math.round(gw), 1, i < 6 ? lite(P.sun, 0.2) : P.sun);
  }
  /* balıkçı: omzunda ağ, iskelede yürür (ince silüet, kontur) */
  var bx = Math.round(20 + Math.min(1, t / 5) * 96), step = t < 5 ? Math.floor(t * 4) % 2 : 2, by = 120;
  var man = spr('balikci' + P.ink + step, function (b) {
    var ink = P.ink, ink2 = mix(P.ink, P.sea2, 0.35);
    b.rect(2, -44, 10, 10, ink); b.rect(0, -48, 14, 4, ink); b.rect(-3, -45, 6, 2, ink);        /* baş + kasket siperliği */
    b.rect(0, -34, 14, 18, ink); b.rect(1, -33, 3, 16, ink2);                                   /* gövde, sol ışık kenarı */
    if (step === 2) { b.rect(2, -16, 4, 16, ink); b.rect(8, -16, 4, 16, ink); }
    else { b.rect(step ? 0 : 3, -16, 4, 16, ink); b.rect(step ? 10 : 7, -16, 4, 16, ink); }
    b.rect(-2, -32, 3, 14, ink); b.rect(13, -32, 3, 12, ink);                                   /* kollar */
    for (var i2 = 0; i2 < 5; i2++) { b.rect(-12, -36 + i2 * 4, 12, 1, P.sea); b.rect(-12 + i2 * 3, -38, 1, 20, P.sea); }   /* sırttaki ağ */
  });
  blitS(g, man, bx, by);
  for (i = 0; i < 3; i++) gull(g, P, Math.round((i * 100 + t * 20) % (Wf + 20)) - 10, 22 + i * 14, t, i);
};

/* ---------------- 5) hayal: koca liman (sepya → renk) ---------------- */
GZ.harbor = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2, i;
  put(g, layer('harbor', P, Wf, Hf, function (set) {
    grad(set, 0, 0, Wf, 112, [lite(P.sky, 0.2), P.sky, mix(P.sky, P.lite, 0.35)]);
    for (var x = 0; x < Wf; x++) { var hy = 74 + Math.round(Math.sin(x * 0.02) * 6 + Math.sin(x * 0.07) * 2); for (var y = hy; y < 112; y++) set(x, y, mix(P.sky, P.wood2, 0.25)); }
    for (var k = 0; k < 12; k++) {                                     /* şehir: binalar, sol yüz ışıklı, pencereler */
      var bw = 16 + Math.floor(hash(k, 1) * 16), bh = 24 + Math.floor(hash(k, 2) * 52), bx = k * 24;
      for (var yy = 112 - bh; yy < 112; yy++) for (var xx = bx; xx < bx + bw; xx++) {
        var base = k % 2 ? P.wood : mix(P.wood, P.wood2, 0.6), c = xx < bx + 3 ? lite(base, 0.2) : xx > bx + bw - 4 ? dark(base, 0.2) : base;
        if (yy === 112 - bh) c = lite(base, 0.3);
        set(xx, yy, c);
      }
      for (var wy = 112 - bh + 6; wy < 104; wy += 10) for (var wx = bx + 4; wx < bx + bw - 4; wx += 6) if (hash(wx, wy) > 0.45) for (var q = 0; q < 4; q++) { set(wx, wy + q, P.sun); set(wx + 1, wy + q, q === 0 ? lite(P.sun, 0.4) : P.sun); }
    }
    grad(set, 0, 126, Wf, Hf, [lite(P.sea, 0.15), P.sea, P.sea2]);
    for (var x2 = 0; x2 < Wf; x2++) for (var y2 = 112; y2 < 126; y2++) set(x2, y2, y2 === 112 ? lite(P.wood, 0.3) : y2 < 122 ? (x2 % 16 === 0 ? P.wood2 : P.wood) : P.wood2);
    for (var tt = 0; tt < 5; tt++) {                                   /* kilim desenli tenteler */
      var tx = 12 + tt * 44;
      for (var s = 0; s < 36; s++) for (var j = 0; j < 10; j++) set(tx + s, 104 + j, Math.floor(s / 6) % 2 ? P.aw1 : P.aw2);
      for (var s2 = 0; s2 < 36; s2++) set(tx + s2, 114, dark(P.aw1, 0.35));
    }
    /* deniz feneri */
    for (var ly = 36; ly < 104; ly++) for (var lx = 300; lx < 314; lx++) { var stripe = (ly > 52 && ly < 60) || (ly > 76 && ly < 84); var b0 = stripe ? P.aw1 : P.lite; set(lx, ly, lx < 303 ? lite(b0, 0.2) : lx > 310 ? dark(b0, 0.2) : b0); }
    for (var ly2 = 28; ly2 < 36; ly2++) for (var lx2 = 298; lx2 < 316; lx2++) set(lx2, ly2, P.ink);
  }), W, H);
  for (i = 0; i < 3; i++) {                                            /* bulutlar */
    var cx = Math.round((i * 140 + t * 10) % (Wf + 60)) - 40, cy = 12 + i * 10;
    F(g, cx, cy + 2, 36, 4, P.lite); F(g, cx + 6, cy, 20, 3, P.lite); F(g, cx + 2, cy + 6, 30, 1, mix(P.lite, P.sky, 0.4));
  }
  var beam = Math.sin(t * 2.2);                                        /* dönen fener ışığı */
  F(g, 302, 30, 10, 5, P.sun);
  g.globalAlpha = 0.6; for (i = 2; i < 34; i++) F(g, Math.round(307 + beam * i * 1.4), 31 - Math.floor(i / 6), 2, 3, P.sun); g.globalAlpha = 1;
  waves(g, P, t, 130, Hf, Wf, 26, 14, lite(P.sea, 0.3), 120);
  for (i = 0; i < 2; i++) {                                            /* salınan gemiler */
    var sx = 60 + i * 140, sy2 = 144 + Math.round(Math.sin(t * 1.5 + i * 2) * 2);
    var sh = spr('gemi' + P.aw1 + P.lite, function (b) {
      for (var j = 0; j < 12; j++) { var ins = Math.round(Math.pow(j / 12, 2) * 8); b.rect(ins, j, 68 - ins * 2, 1, j < 2 ? lite(P.aw1, 0.25) : j < 8 ? P.aw1 : P.ink); }
      b.rect(16, -12, 28, 12, P.lite); b.rect(16, -12, 28, 2, lite(P.lite, 0.3)); b.rect(40, -12, 4, 12, dark(P.lite, 0.15));
      b.rect(20, -8, 4, 4, P.sea2); b.rect(28, -8, 4, 4, P.sea2);
      b.rect(48, -36, 2, 36, P.ink); b.rect(50, -36, 12, 8, P.aw2); b.rect(50, -36, 12, 2, P.aw1);
      b.outline(0.55);
    });
    blitS(g, sh, sx, sy2);
  }
};

/* ---------------- 6) limanın fotoğrafı (Bölüm 1 sonu) ---------------- */
GZ.snap = function (g, P, t, W, H) {
  var H2 = window.HKG, snap = H2 && H2.v ? H2.v('chSnap') : null;
  if (!snap) { GZ.harbor(g, P, t, W, H); return; }
  g.drawImage(P.sky === '#d9c9a3' ? snap.sep : snap.col, 0, 0, W, H);   /* PAL_SEPIA.sky ile sepya ayrımı */
  g.globalAlpha = 0.10;                                                 /* baskı tramı */
  for (var y = 0; y < H * 2; y += 2) F(g, 0, y, W * 2, 1, P.ink);
  g.globalAlpha = 1;
};

/* ---------------- 7) ufukta devler (gece) ---------------- */
GZ.giants = function (g, P, t, W, H) {
  var Wf = W * 2, Hf = H * 2, i;
  put(g, layer('giants', P, Wf, Hf, function (set) {
    grad(set, 0, 0, Wf, 100, [dark(P.sky2, 0.3), P.sky2, mix(P.sky2, P.aw1, 0.25)]);
    grad(set, 0, 100, Wf, Hf, [mix(P.sea2, P.sky2, 0.3), P.sea2, dark(P.sea2, 0.3)]);
    var ink = P.ink, ink2 = mix(P.ink, P.sky2, 0.35);
    function R(x, y, w, h, c) { for (var j = 0; j < h; j++) for (var k = 0; k < w; k++) set(x + k, y + j, c); }
    R(16, 52, 80, 48, ink); R(16, 52, 4, 48, ink2); R(28, 24, 10, 28, ink); R(28, 24, 2, 28, ink2); R(52, 32, 10, 20, ink); R(96, 68, 44, 32, ink);   /* fabrika */
    for (var b = 0; b < 8; b++) R(100 + b * 5, 64 - (b % 2) * 2, 3, 4, ink);                                                                          /* testere çatı */
    R(0, Hf - 20, 120, 8, P.wood); R(0, Hf - 20, 120, 1, lite(P.wood, 0.3)); for (var p = 8; p < 120; p += 24) R(p, Hf - 12, 4, 12, P.wood2);      /* bizim küçük iskele */
    R(80, Hf - 44, 10, 24, P.lite); R(80, Hf - 48, 10, 4, P.aw1); R(80, Hf - 44, 2, 24, lite(P.lite, 0.3));
  }), W, H);
  for (i = 0; i < 40; i++) { var sx = Math.floor(hash(i, 91) * Wf), sy = Math.floor(hash(i, 92) * 68); if (Math.sin(t * 2 + i) > -0.5) F(g, sx, sy, 1, 1, P.sky); }
  var glow = 0.5 + 0.5 * Math.sin(t * 2);
  for (i = 0; i < 6; i++) if ((i + Math.floor(t * 2)) % 3) F(g, 24 + i * 12, 64, 4, 6, P.sun);                    /* fabrika ışıkları */
  for (i = 0; i < 5; i++) { var ph = (t * 0.4 + i * 0.2) % 1; g.globalAlpha = 0.35 * (1 - ph); disc(g, 33 + ph * 10, 20 - ph * 30, 3 + Math.round(ph * 6), mix(P.sky2, P.lite, 0.3)); }   /* baca dumanı */
  g.globalAlpha = 0.4 + glow * 0.4; F(g, 30, 16 - Math.floor(t * 3) % 4 * 2, 6, 6, P.sun); g.globalAlpha = 1;
  for (i = 0; i < 3; i++) {                                                                                        /* dev trol gemileri yaklaşır */
    var gx = Wf - 40 - i * 96 - Math.min(48, t * 10), gy = 92 + i * 12 + Math.round(Math.sin(t + i) * 2);
    var tr = spr('trol' + P.ink + P.sun, function (b) {
      var ink = P.ink, ink2 = mix(P.ink, P.sky2, 0.4);
      b.rect(0, 0, 88, 14, ink); b.rect(4, 14, 80, 2, ink); b.rect(0, 0, 88, 2, ink2);
      b.rect(8, -16, 44, 16, ink); b.rect(8, -16, 44, 2, ink2); b.rect(60, -44, 4, 44, ink); b.rect(64, -36, 20, 2, ink); b.rect(16, -28, 12, 12, ink);
      b.rect(4, 4, 80, 2, P.aw1);
      for (var w = 0; w < 3; w++) b.rect(12 + w * 12, -10, 4, 4, P.sun);
    });
    blitS(g, tr, Math.round(gx), gy);
    if (Math.sin(t * 4 + i) > 0) F(g, Math.round(gx) + 60, gy - 46, 4, 2, P.sun);
    g.globalAlpha = 0.25; F(g, Math.round(gx) + 4, gy + 18, 80, 1, P.sun); g.globalAlpha = 1;
  }
  waves(g, P, t, 118, Hf - 22, Wf, 28, 12, mix(P.sea, P.sea2, 0.3), 160);
};
})();
