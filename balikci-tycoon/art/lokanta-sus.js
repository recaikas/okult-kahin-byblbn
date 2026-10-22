/* =====================================================================
   HAMSİ KOYU — ince piksel: SAHİL LOKANTASI SÜSLERİ (sanatçı dosyası, v2.22-deneme)
   Kanca: HKA.drawLokDecor(o) — yerdeki süsler (LOK_DC, at: 'yer'). Tanımsızsa oyun klasik çizime düşer.
   o: {id, x, y, hw, hh, t, night, lv}. Konum / ayak izi game.js'ten; burada yalnız görünüş.
   Yöntem: her süsün durağan gövdesi bir kez önbellekli sprite (anahtar: id + ayak izi + K [+ gece]);
   canlı parçalar (çiçek/yaprak salınımı, nazar sallanması, balık, kabarcık, su) ya 3 karelik küçük sprite
   ya da birkaç L.fr ince dikdörtgen. Bilinmeyen id → false (klasik çizim).
   El pikselleri K = 2 ince piksel biriminde tasarlandı (sözleşme: ince mod K = 2).
   ===================================================================== */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib, K = HKA.kit;
if (!L || !K) return;
var G = function () { return window.HKG; };
var hash = L.hash;
var spr = K.spr, at = K.at, box = K.box, wall = K.wall, vl = K.vl, hl = K.hl, quadW = K.quadW, fx = K.fx, fy = K.fy, gf = K.gf;
function R(v) { return Math.round(v); }
function pX(x, y) { return (x - y) * 12; }
function pY(x, y, z) { return (x + y) * 6 - (z || 0); }
function KK() { return G().K; }
function rr(b, x, y, w, h, c, a) { b.rect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h)), c, a); }
/* çizim anı: dünya yerel noktasının çapaya göre ince piksel kayması (L.fr için) */
function OF(lx, ly, lz) { var k = KK(); return [R((lx - ly) * 12 * k), R(((lx + ly) * 6 - (lz || 0)) * k)]; }
function shadowAt(x, y, r) { var f = gf('shadow'); if (f) f(x, y, r); }
function sw(t, sp, ph) { var v = Math.sin(t * sp + ph) * 1.25; return v > 0.5 ? 1 : v < -0.5 ? -1 : 0; }   /* 3 karelik salınım: -1, 0, 1 */
function mix2(a, b) { return L.mix(a, b, 0.5); }

/* ---------------- palet ---------------- */
var TERRA = { l: '#d98a5c', m: '#b4643e', d: '#8a4528', h: '#eaa678', t: '#c8784a' };
var COP = { l: '#e0985a', m: '#bf7438', d: '#7a4020', e: '#9c5a2a', h: '#ffd6a0', t: '#d08a4a' };
var BRASS = '#d9b04a', SOIL = '#3d2a1c', SOILL = '#5a3f2a';
var IRON = { d: '#2c3238', m: '#4a525a', l: '#78838c', h: '#a3adb4' };
var ROPE = '#c9a15e', ROPED = '#a8803e', ROPEL = '#e2c48a';
var WOOD = { t: '#a87444', l: '#7d4f2a', r: '#5d3c1c' };

/* döner gövde (saksı, güğüm, semaver): z0..z1 dilim dilim dolu elips; prof(zr) yarıçap (sanat pikseli),
   side(u, zr) ön yüz rengi (u: 0 sol … 1 sağ), back üst/arka renk, cap(dn, u) en üst dilim (dn: merkezden 0…1) */
function lathe(b, x, y, z0, z1, prof, side, back, cap) {
  var k = KK(), cx = fx(x, y), st = 0.5 / k, z;
  for (z = z0; z <= z1 + 1e-6; z += st) {
    var zr = Math.min(z - z0, z1 - z0), r = prof(zr) * k; if (r < 0.5) continue;
    var cy = fy(x, y, z), top = z + st > z1 + 1e-6, n = Math.floor(r), h0 = r / 2;
    for (var i = -n; i <= n; i++) {
      var h = Math.sqrt(Math.max(0, r * r - i * i)) / 2, u = (i + r) / (2 * r), X = R(cx + i);
      for (var j = R(cy - h); j <= R(cy + h); j++) {
        var c;
        if (top && cap) { var a = i / r, bb = (j - cy) / h0; c = cap(Math.sqrt(a * a + bb * bb), u); }
        else c = j < cy - 0.5 ? back : side(u, zr);
        if (c) b.set(X, j, c);
      }
    }
  }
}
function shadeOf(C) { return function (u) { return u < 0.2 ? C.l : (u < 0.3 && C.h) ? C.h : u > 0.74 ? C.d : (u > 0.6 && C.e) ? C.e : C.m; }; }
function soilCap(rim) { return function (dn) { return dn > 0.78 ? rim : dn > 0.62 ? SOIL : SOILL; }; }
/* ince belli çay bardağı (X,Y: tabağın orta-alt noktası, ince piksel) */
function teaGlass(b, X, Y) {
  rr(b, X - 3, Y, 7, 1, '#f4f1ea'); rr(b, X - 2, Y + 1, 5, 1, '#c9c1b2');
  var w = [5, 5, 4, 3, 3, 4, 5];
  for (var j = 0; j < w.length; j++) {
    var ww = w[j], x0 = X - (ww >> 1), yy = Y - w.length + j;
    rr(b, x0, yy, ww, 1, j < 2 ? '#e8f4f6' : '#b8401c');
    if (j >= 2) { rr(b, x0, yy, 1, 1, '#e2703a'); rr(b, x0 + ww - 1, yy, 1, 1, '#7a2410'); }
  }
}

/* =====================================================================
   1) SARDUNYA SAKSILARI: iki toprak saksı + ortada badanalı teneke; çiçek başları rüzgârda hafif salınır
   ===================================================================== */
var POT_X = [-0.25, 0, 0.25];
function cicekBaseSpr() {
  return spr('lsd|cicek|' + KK(), 0, 0, function (b) {
    for (var k = 0; k < 3; k++) {
      var lx = POT_X[k];
      if (k === 1) {                                                   /* beyaz badanalı teneke, mavi bant */
        lathe(b, lx, 0, 0, 6.6, function () { return 3.4; }, function (u, zr) {
          var band = (zr > 1.4 && zr < 2.6) || (zr > 4.4 && zr < 5.1);
          if (zr > 6) return u > 0.7 ? '#a9a59c' : '#cfcac0';
          if (band) return u < 0.22 ? '#3f86c8' : u > 0.72 ? '#1d4f80' : '#2a6fb0';
          return u < 0.24 ? '#ffffff' : u > 0.72 ? '#b9b6ae' : '#e6e2d8';
        }, '#e6e2d8', soilCap('#cfcac0'));
      } else {                                                         /* toprak saksı: konik gövde + kalın ağız */
        lathe(b, lx, 0, 0, 6.2, function (zr) { return zr > 5 ? 4.1 : 2.8 + zr * 0.2; }, function (u, zr) {
          if (zr > 5) return u < 0.26 ? '#e8a274' : u > 0.72 ? '#9c5232' : '#cc7c4c';
          return shadeOf(TERRA)(u);
        }, TERRA.t, soilCap('#d68a5a'));
      }
    }
    b.outline(0.55);
  });
}
var GER_C = [['#e0607a', '#f79ab0', '#a8344f'], ['#d9372e', '#ff7058', '#962018'], ['#ef7f6c', '#ffb4a2', '#bb4c40']];
var GER_H = [[[-4, -12], [3, -14], [0, -9]], [[-3, -13], [4, -11], [0, -16]], [[-4, -10], [2, -14], [5, -9]]];
var LEAF = [[-5, -2], [-1, -4], [4, -2], [1, -1], [-3, -5], [5, -5], [-6, -5], [2, -6], [-1, -7]];
function cicekTopSpr(k, f) {
  return spr('lsd|cicekT|' + k + '|' + f + '|' + KK(), 0, 0, function (b) {
    var i, j, c = GER_C[k], H = GER_H[k];
    for (i = 0; i < LEAF.length; i++) {                                 /* yuvarlak sardunya yaprakları */
      var lf = LEAF[(i + k * 2) % LEAF.length], lx = lf[0], ly = lf[1], lc = i % 3 ? '#4f8a3c' : '#3f7230';
      rr(b, lx - 2, ly - 1, 5, 3, lc); rr(b, lx - 1, ly - 2, 3, 5, lc);
      rr(b, lx - 1, ly - 1, 1, 1, '#7fb35a');
    }
    for (i = 0; i < H.length; i++) {                                   /* sap + top çiçek başı (salınım: üst uç kayar) */
      var hx = H[i][0] + f, hy = H[i][1], bx = H[i][0] * 0.5;
      for (j = 0; j <= 6; j++) rr(b, R(bx + (hx - bx) * j / 6), R(-4 + (hy + 4) * j / 6), 1, 1, '#4a7a3a');
      for (var yy = -3; yy <= 3; yy++) for (var xx = -3; xx <= 3; xx++) {
        if (xx * xx + yy * yy > 10) continue;
        var hv = hash(xx * 7 + i * 13 + k * 31, yy * 5 + i);
        rr(b, hx + xx, hy + yy, 1, 1, (xx + yy < -2) || hv > 0.78 ? c[1] : hv < 0.16 ? c[2] : c[0]);
      }
      rr(b, hx - 1, hy - 1, 1, 1, '#fff2f0');
    }
    b.outline(0.5);
  });
}
function drawCicek(o) {
  shadowAt(o.x, o.y, 0.55);
  at(cicekBaseSpr(), o.x, o.y, 0);
  for (var k = 0; k < 3; k++) at(cicekTopSpr(k, sw(o.t, 1.6, k * 2.1)), o.x + POT_X[k], o.y, k === 1 ? 6.6 : 6.2);
}

/* =====================================================================
   2) KAPI NAZARLIĞI: ince ahşap direk, çivide asılı mavi nazar boncuğu + boncuk dizisi, püskül; hafif sallanır
   ===================================================================== */
function nazarPostSpr() {
  return spr('lsd|nazarP|' + KK(), 0, 0, function (b) {
    box(b, -0.05, -0.05, 0.1, 0.1, 0, 26, '#9a6a3a', '#7a4f2a', '#5d3c1c');
    box(b, -0.075, -0.075, 0.15, 0.15, 26, 27.6, '#b07a48', '#8a5a32', '#6f4526');
    var X = R(fx(0.05, 0.05)), Y = R(fy(0.05, 0.05, 24));
    rr(b, X - 1, Y - 1, 2, 2, '#3a3a40'); rr(b, X, Y + 1, 1, 2, '#3a3a40');             /* çivi + kanca */
    b.outline(0.55);
  });
}
function nazarCharmSpr(f) {
  return spr('lsd|nazarC|' + f + '|' + KK(), 0, 0, function (b) {
    var cx = f, cy = 11, y, x;
    for (y = 0; y < 4; y++) rr(b, R(f * y / 4), y, 1, 1, '#c0392b');                     /* kırmızı ip */
    for (y = -7; y <= 7; y++) for (x = -7; x <= 7; x++) {                              /* boncuk: lacivert, beyaz, açık mavi, kara göz bebeği */
      var d = x * x + y * y; if (d > 52) continue;
      var c = d > 30 ? (x + y < -4 ? '#2f6fc0' : '#1d4f9a') : d > 14 ? '#f4efe2' : d > 3 ? '#3a8fd6' : '#0a1a27';
      rr(b, cx + x, cy + y, 1, 1, c);
    }
    rr(b, cx - 4, cy - 5, 2, 1, '#9cc8f2'); rr(b, cx - 5, cy - 4, 1, 2, '#9cc8f2'); rr(b, cx - 1, cy - 2, 1, 1, '#ffffff');
    var bx = cx + f, beads = ['#d9443a', '#e8c547', '#2f6fc0'];                       /* boncuk dizisi + püskül */
    for (var i = 0; i < 3; i++) rr(b, bx - 1, cy + 9 + i * 3, 2, 2, beads[i]);
    rr(b, bx - 1, cy + 18, 3, 1, '#c0392b'); rr(b, bx - 1, cy + 19, 1, 3, '#c0392b'); rr(b, bx + 1, cy + 19, 1, 3, '#a02a20'); rr(b, bx, cy + 19, 1, 4, '#d9443a');
    b.outline(0.55);
  });
}
function drawNazar(o) {
  shadowAt(o.x, o.y, 0.25);
  at(nazarPostSpr(), o.x, o.y, 0);
  L.blit(nazarCharmSpr(sw(o.t, 1.3, 0.7)), R(pX(o.x + 0.05, o.y + 0.05)), R(pY(o.x + 0.05, o.y + 0.05, 24)) + 1);
}

/* =====================================================================
   3) ÇAPA VE HALAT: dik duran demir çapa (hafif pas), gövdeye sarılı halat, yerde kangal
   ===================================================================== */
function ropeRing(b, cx, cy, rx, lift, front) {
  var ry = rx / 2, n = Math.ceil(rx * 7);
  for (var s = 0; s <= n; s++) {
    var th = s / n * Math.PI * 2, sn = Math.sin(th);
    if (front ? sn < -0.05 : sn >= -0.05) continue;
    var X = R(cx + rx * Math.cos(th)), Y = R(cy + ry * sn - lift), tw = ((th * rx / 2.4) | 0) & 1;
    b.set(X, Y - 1, ROPEL); b.set(X, Y, tw ? ROPE : ROPED); b.set(X, Y + 1, tw ? ROPED : '#8a6630');
  }
}
var COIL = [[13, 0], [10, 3], [7, 6]];
function capaSpr() {
  return spr('lsd|capa|' + KK(), 0, 0, function (b) {
    var ccx = fx(0.06, 0.1), ccy = fy(0.06, 0.1, 0), i, x, y;
    for (i = 0; i < COIL.length; i++) ropeRing(b, ccx, ccy, COIL[i][0], COIL[i][1], false);   /* kangalın arka yarısı */
    rr(b, -2, -40, 4, 36, IRON.m); rr(b, -2, -40, 1, 36, IRON.l); rr(b, 1, -40, 1, 36, IRON.d);           /* gövde */
    rr(b, -11, -34, 22, 3, IRON.m); rr(b, -11, -34, 22, 1, IRON.l); rr(b, -11, -32, 22, 1, IRON.d);        /* çipo */
    rr(b, -13, -35, 3, 5, IRON.m); rr(b, -13, -35, 1, 2, IRON.h); rr(b, 10, -35, 3, 5, IRON.d);
    for (y = -48; y <= -38; y++) for (x = -5; x <= 5; x++) {                                             /* halka */
      var d = Math.sqrt(x * x + (y + 43) * (y + 43)); if (d < 2.6 || d > 4.6) continue;
      rr(b, x, y, 1, 1, x + (y + 43) < 0 ? IRON.l : IRON.d);
    }
    for (x = -13; x <= 13; x++) {                                                                      /* kollar (yay) */
      var yy = R(-3 - Math.pow(Math.abs(x) / 13, 2) * 12);
      rr(b, x, yy - 1, 1, 1, IRON.l); rr(b, x, yy, 1, 1, IRON.m); rr(b, x, yy + 1, 1, 1, IRON.d);
    }
    for (var sd = -1; sd <= 1; sd += 2) for (y = -22; y <= -15; y++) {                                 /* tırnaklar */
      var hw = Math.min(3, R((y + 22) * 0.55)), c0 = sd * R(13 + (y + 22) * 0.15);
      for (x = -hw; x <= hw; x++) rr(b, c0 + x, y, 1, 1, x < 0 ? (sd < 0 ? IRON.l : IRON.m) : IRON.d);
    }
    for (i = 0; i < 9; i++) { if (hash(i, 7) > 0.35) rr(b, -1 + (i % 2), -38 + ((i * 13) % 32), 1, 1, i % 3 ? '#8a5a3a' : '#a06a40'); }   /* pas */
    rr(b, -5, -5, 2, 1, '#8a5a3a'); rr(b, 6, -9, 1, 1, '#8a5a3a');
    for (i = 0; i < 2; i++) for (x = -3; x <= 3; x++) rr(b, x, -30 + i * 4 + R(x * 0.5), 1, 2, (x & 1) ? ROPE : ROPED);   /* gövdeye sarılı halat */
    for (i = 0; i <= 24; i++) {                                                                        /* halkadan kangala sarkan halat */
      var u = i / 24, px0 = 4 + u * 9 + Math.sin(u * Math.PI) * 4, py0 = -42 + u * 34 - Math.sin(u * Math.PI) * 2;
      rr(b, R(px0), R(py0), 2, 1, (i & 1) ? ROPE : ROPED); rr(b, R(px0), R(py0) + 1, 1, 1, '#8a6630');
    }
    for (i = 0; i < COIL.length; i++) ropeRing(b, ccx, ccy, COIL[i][0], COIL[i][1], true);              /* kangalın ön yarısı */
    b.outline(0.55);
  });
}
function drawCapa(o) { shadowAt(o.x, o.y, 0.6); at(capaSpr(), o.x, o.y, 0); }

/* =====================================================================
   4) BAKIR GÜĞÜM VE SEMAVER: dantel örtülü alçak sehpa, bakır güğüm, semaver + porselen demlik, iki ince belli bardak
   ===================================================================== */
var SEM = [0.12, -0.1], GUG = [-0.05, 0.14], SEMT = 20.5;
function gugukSpr() {
  return spr('lsd|guguk|' + KK(), 0, 0, function (b) {
    var lg = [[-0.24, -0.19], [0.18, -0.19], [-0.24, 0.15], [0.18, 0.15]], i, k = KK();
    for (i = 0; i < 4; i++) box(b, lg[i][0], lg[i][1], 0.05, 0.05, 0, 6, WOOD.t, WOOD.l, WOOD.r);
    box(b, -0.26, -0.21, 0.52, 0.42, 6, 8, WOOD.t, WOOD.l, WOOD.r);
    wall(b, -0.07, 0.21, 0.09, 0.21, 4.6, 8.05, function (X, Y) { return ((X + Y) & 3) === 0 ? '#d8d0bf' : '#f4efe2'; });   /* dantel örtü sarkması */
    quadW(b, -0.07, -0.21, 0.16, 0.42, 8.05, '#f4efe2');
    var sx = SEM[0], sy = SEM[1];                                                /* semaver (arkada): ayak, boğaz, gövde, omuz, taç; üstünde porselen demlik */
    lathe(b, sx, sy, 8, SEMT, function (zr) { return zr < 1.2 ? 2.4 : zr < 2 ? 1.6 : zr < 10.5 ? 3.2 + 0.35 * Math.sin(Math.PI * (zr - 2) / 8.5) : zr < 11.3 ? 2.4 : 1.8; },
      function (u, zr) { return (zr < 1.2 || (zr > 9.4 && zr < 10.5) || zr > 11.3) ? (u > 0.7 ? '#a8842a' : u < 0.25 ? '#f0cf6a' : BRASS) : shadeOf(COP)(u); }, COP.t);
    lathe(b, sx, sy, SEMT, SEMT + 4.4, function (zr) { return zr < 3.4 ? 1.6 + 0.8 * Math.sin(Math.PI * zr / 3.6) : zr < 3.9 ? 1.4 : 0.6; },
      function (u, zr) { return (zr > 1.2 && zr < 1.9) ? (u > 0.7 ? '#1d4f80' : '#2a5fa0') : u < 0.25 ? '#ffffff' : u > 0.72 ? '#b0aaa0' : '#e8e3d8'; }, '#f6f2ea');
    var SX = R(fx(sx, sy)), mY = R(fy(sx, sy, 8 + 4)), hY = R(fy(sx, sy, 8 + 9));
    rr(b, SX - 10, mY, 4, 2, BRASS); rr(b, SX - 10, mY + 2, 1, 2, '#a8842a');     /* musluk */
    rr(b, SX + 7, hY, 2, 3, COP.d); rr(b, SX - 9, hY, 2, 3, COP.e);                /* kulplar */
    var dY = R(fy(sx, sy, SEMT + 2));                                            /* demlik ağzı + kulpu */
    rr(b, SX - 7, dY, 3, 1, '#e8e3d8'); rr(b, SX - 8, dY - 1, 1, 1, '#e8e3d8'); rr(b, SX + 5, dY - 2, 1, 4, '#d0c9bc'); rr(b, SX + 4, dY - 2, 1, 1, '#d0c9bc');
    var gx = GUG[0], gy = GUG[1];                                                /* güğüm (önde): ayak, şişkin gövde, ince boyun, ağız; sağda kulp */
    lathe(b, gx, gy, 8, 21.6, function (zr) { return zr < 1 ? 2.2 : zr < 9 ? 1.5 + 2 * Math.sin(Math.PI * (zr - 1) / 8.6) : zr < 12.4 ? 1.15 : 1.9; },
      function (u, zr) { return zr > 12.4 ? (u > 0.7 ? COP.e : COP.l) : (zr > 4.6 && zr < 5.4) ? (u > 0.7 ? '#a8842a' : BRASS) : shadeOf(COP)(u); }, COP.t,
      function (dn) { return dn > 0.6 ? COP.l : '#3a2410'; });
    var X = R(fx(gx, gy));
    for (i = 0; i <= 10; i++) { var a = i / 10 * Math.PI, hx = X + R(2.6 * k + Math.sin(a) * 2.4 * k), hy = R(fy(gx, gy, 8 + 12.4 - i * 0.72)); b.set(hx, hy, COP.e); b.set(hx + 1, hy, COP.d); }
    teaGlass(b, R(fx(0.2, 0.12)), R(fy(0.2, 0.12, 8)));
    teaGlass(b, R(fx(0.09, 0.18)), R(fy(0.09, 0.18, 8)));
    b.outline(0.55);
  });
}
function drawGuguk(o) {
  shadowAt(o.x, o.y, 0.65);
  at(gugukSpr(), o.x, o.y, 0);
  var ax = R(pX(o.x, o.y)), ay = R(pY(o.x, o.y, 0)), t = o.t, p, k;
  for (k = 0; k < 2; k++) {                                                    /* demlikten ince buhar */
    var ph = (t * 0.8 + k * 0.5) % 1; p = OF(SEM[0], SEM[1], SEMT + 7 + ph * 9);
    L.fr(ax, ay, p[0] - 1 + R(Math.sin(t * 2 + k * 3) * 2), p[1], 2, 2, 'rgba(255,255,255,' + (0.5 * (1 - ph)).toFixed(2) + ')');
  }
  if (o.night) { p = OF(SEM[0], SEM[1], 9.4); L.fr(ax, ay, p[0] - 6, p[1] - 4, 13, 7, 'rgba(255,160,80,.18)'); L.fr(ax, ay, p[0] - 2, p[1] - 1, 4, 1, '#ffb45a'); }
}

/* =====================================================================
   5) KİLİM VE MİNDER KÖŞESİ: göbek motifli kilim (püsküllü uçlar), iki minder + yaslanma yastığı, ortada sini ve çay
   ===================================================================== */
function kilimSpr(hw, hh) {
  return spr('lsd|kilim|' + hw + '|' + hh + '|' + KK(), 0, 0, function (b) {
    var x0 = -hw + 0.06, x1 = hw - 0.06, y0 = -hh + 0.03, y1 = hh - 0.03, W = x1 - x0, i;
    box(b, x0, y0, W, y1 - y0, 0, 0.8, function (u, v) {
      var lx = x0 + u / 12, ly = y0 + v / 12, du = Math.min(lx - x0, x1 - lx), dv = Math.min(ly - y0, y1 - ly), e = Math.min(du, dv);
      if (e < 0.035) return '#3a2a4a';
      if (e < 0.11) { var p = du < dv ? ly : lx, m0 = Math.abs(((p * 9) % 1 + 1) % 1 - 0.5) + Math.abs(e - 0.072) * 6; return m0 < 0.3 ? '#f1e6cc' : '#2a4c7d'; }
      if (e < 0.135) return '#7a1f2b';
      var best = 9;
      for (var c = -1; c <= 1; c++) { var cx = c * hw * 0.55, m = Math.abs(lx - cx) / 0.2 + Math.abs(ly) / ((hh - 0.15) * 0.75); if (m < best) best = m; }
      if (best < 0.22) return '#e8c547';
      if (best < 0.42) return '#2a4c7d';
      if (best < 0.56) return '#f1e6cc';
      if (best < 0.76) return '#7a1f2b';
      if (best < 0.86) return '#f1e6cc';
      var hv = hash(R(u * 2), R(v * 2));
      return hv > 0.93 ? '#e88a5a' : hv < 0.1 ? '#9a2f24' : '#b23a2c';
    }, '#7a2420', '#5a1a1a', { norim: 1 });
    for (i = 0; i <= 8; i++) {                                               /* püsküller (uçlarda) */
      var fy0 = y0 + 0.03 + (y1 - y0 - 0.06) * i / 8;
      hl(b, x0 - 0.06, fy0, x0, fy0, 0.4, '#efe6d0'); hl(b, x1, fy0, x1 + 0.06, fy0, 0.4, '#efe6d0');
    }
    function stripes(base, st, dk, h) { return function (u, z) { if (z > h - 0.9 && (u < 0.7 || u > 5.3)) return null; return (u % 2) < 0.6 ? st : (z > h * 0.5 ? base : dk); }; }
    var cus = [[x0 + 0.04, '#6f9a44', '#557a34', '#3e6428', '#e8c547'], [x1 - 0.54, '#d0a23c', '#b08a32', '#8a6a24', '#c0503a']];
    for (i = 0; i < 2; i++) {
      var c0 = cus[i][0];
      box(b, c0, y0 + 0.02, 0.5, 0.12, 0.8, 8.6, cus[i][1], stripes(cus[i][2], cus[i][4], cus[i][2], 7.8), cus[i][3], { norim: 1 });   /* yaslanma yastığı */
      box(b, c0, y0 + 0.15, 0.5, 0.36, 0.8, 4.2, cus[i][1], stripes(cus[i][2], cus[i][4], cus[i][3], 3.4), cus[i][3], { norim: 1 });  /* minder */
      var tx = R(fx(c0, y0 + 0.51)), ty = R(fy(c0, y0 + 0.51, 4.2)), tx2 = R(fx(c0 + 0.5, y0 + 0.51));
      rr(b, tx - 1, ty - 1, 2, 2, cus[i][4]); rr(b, tx2 - 1, ty - 1, 2, 2, cus[i][4]);    /* köşe püskülü */
    }
    var sx = 0, sy = 0.08;                                                   /* ortada alçak sehpa üstünde pirinç sini + iki çay */
    box(b, sx - 0.06, sy - 0.06, 0.12, 0.12, 0.8, 3, WOOD.t, WOOD.l, WOOD.r);
    lathe(b, sx, sy, 3, 3.8, function () { return 4.6; }, function (u) { return u > 0.7 ? '#a8842a' : BRASS; }, BRASS,
      function (dn) { return dn > 0.82 ? '#f0cf6a' : dn > 0.7 ? '#a8842a' : (dn < 0.3 ? '#e8c35a' : BRASS); });
    var SX = R(fx(sx, sy)), SY = R(fy(sx, sy, 3.8));
    teaGlass(b, SX - 4, SY + 1); teaGlass(b, SX + 4, SY);
    b.outline(0.55);
  });
}
function drawKilim(o) { at(kilimSpr(o.hw || 0.75, o.hh || 0.5), o.x, o.y, 0); }

/* =====================================================================
   6) ZEYTİN AĞACI: badana bantlı küp saksı, burgulu gövde, gümüşi yeşil taç (zeytin taneleri); taç ucu hafif salınır
   ===================================================================== */
var ZPOT = 9.4;
function zeytinBaseSpr() {
  return spr('lsd|zeytin|' + KK(), 0, 0, function (b) {
    lathe(b, 0, 0, 0, ZPOT, function (zr) { return zr < 1 ? 3.6 : zr < 8 ? 3.9 + 1.6 * Math.sin(Math.PI * (zr - 1) / 9) : 5.0; }, function (u, zr) {
      if (zr >= 8) return u < 0.26 ? '#e8a274' : u > 0.72 ? '#9c5232' : '#cc7c4c';
      if (zr > 5.2 && zr < 5.9) return u > 0.72 ? '#b8ab90' : '#efe6d0';        /* badana bant */
      return shadeOf(TERRA)(u);
    }, TERRA.t, soilCap('#d68a5a'));
    var c0 = R(fy(0, 0, ZPOT)), y;
    for (y = 0; y <= 22; y++) {                                              /* burgulu gövde */
      var cx = R(Math.sin(y * 0.22) * 2.2), w = y < 4 ? 7 : y > 16 ? 4 : 5, Y = c0 - y - 1, xl = cx - (w >> 1);
      rr(b, xl, Y, w, 1, '#7a6a58'); rr(b, xl, Y, 1, 1, '#a8987e'); rr(b, xl + w - 2, Y, 2, 1, '#4e4236');
      if (hash(y, 3) > 0.8) rr(b, cx, Y, 1, 1, '#4e4236');
    }
    function br(x1, y1) { var xs = Math.sin(18 * 0.22) * 2.2; for (var i = 0; i <= 12; i++) { var u = i / 12, X = R(xs * (1 - u) + x1 * u), Yb = c0 + R(-18 + (y1 + 18) * u); rr(b, X - 1, Yb, 3, 1, '#7a6a58'); rr(b, X + 1, Yb, 1, 1, '#4e4236'); } }
    br(-10, -30); br(9, -32);
    b.outline(0.55);
  });
}
var OLV = [[-11, -30, 7, 4, 0], [10, -32, 7, 4, 0], [0, -27, 8, 4, 0], [-14, -38, 5, 3, 1], [14, -38, 5, 3, 1], [-6, -40, 8, 5, 1], [7, -42, 8, 5, 1], [0, -36, 6, 4, 1], [-1, -48, 7, 4, 2], [5, -50, 4, 3, 2]];
var OLIVES = [[-9, -29, 0], [6, -33, 1], [-3, -41, 0], [11, -39, 2], [2, -46, 1], [-12, -36, 2]];
function zeytinTopSpr(f) {
  return spr('lsd|zeytinT|' + f + '|' + KK(), 0, 0, function (b) {
    for (var i = 0; i < OLV.length; i++) {
      var c = OLV[i], cx = R(c[0] + f * (c[4] > 1 ? 1 : c[4] * 0.5)), cy = c[1], rx = c[2], ry = c[3];
      for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5) > 1) continue;
        var X = cx + x, Y = cy + y, hv = hash(X * 3 + i, Y * 7), col = (x / rx + y / ry < -0.5) ? '#8fa36f' : (x / rx + y / ry > 0.7) ? '#56693f' : '#6f8456';
        if (hv > 0.86) col = '#c3cfa8'; else if (hv < 0.07) col = '#465a35';
        rr(b, X, Y, 1, 1, col);
        if (hv > 0.86) rr(b, X + 1, Y, 1, 1, '#c3cfa8');
      }
    }
    for (var j = 0; j < OLIVES.length; j++) { var o2 = OLIVES[j], X2 = o2[0] + R((o2[1] < -40 ? 1 : 0.5) * f); rr(b, X2, o2[1], 2, 2, o2[2] === 1 ? '#8a9a40' : '#3d2a40'); rr(b, X2, o2[1], 1, 1, o2[2] === 1 ? '#b8c060' : '#7a5a80'); }
    b.outline(0.5);
  });
}
function drawZeytin(o) {
  shadowAt(o.x, o.y, 0.6);
  at(zeytinBaseSpr(), o.x, o.y, 0);
  at(zeytinTopSpr(sw(o.t, 1.1, o.x)), o.x, o.y, ZPOT);
}

/* =====================================================================
   7) BALIK AKVARYUMU: ahşap dolap üstünde cam tank — kum, yosun, küçük amfora, taş; yüzen balıklar, kabarcık.
      Gece: su hafif ışıklı (turkuaz) + yumuşak hale.
   ===================================================================== */
function tankGeo(hw, hh) { return { x0: -hw + 0.04, x1: hw - 0.04, y0: -hh + 0.04, y1: hh - 0.04, z0: 6.4, zw: 18.6, zt: 20.4 }; }
function akvBackSpr(hw, hh, nt) {
  return spr('lsd|akvB|' + hw + '|' + hh + '|' + nt + '|' + KK(), 0, 0, function (b) {
    var g = tankGeo(hw, hh), W = (g.x1 - g.x0) * 12, D = (g.y1 - g.y0) * 12, m = (hw * 2 - 0.04) * 6;
    box(b, -hw + 0.02, -hh + 0.02, hw * 2 - 0.04, hh * 2 - 0.04, 0, g.z0, '#8a5a32', function (u, z) {          /* dolap: iki kapak */
      if (Math.abs(u - m) < 0.5 || z < 0.6) return '#3e2616';
      if (z > 1.2 && z < 5.2 && (Math.abs(u - 1.2) < 0.4 || Math.abs(u - (m - 1.2)) < 0.4 || Math.abs(u - (m + 1.2)) < 0.4 || Math.abs(u - (2 * m - 1.2)) < 0.4)) return '#5a3820';
      if (z > 2.8 && z < 3.6 && (Math.abs(u - (m - 2.2)) < 0.5 || Math.abs(u - (m + 2.2)) < 0.5)) return BRASS;
      return '#6f4526';
    }, '#4a2f1c');
    var WT = nt ? ['#a8f4f2', '#66d6e0', '#4cbccf', '#3aa2ba', '#46b2c6'] : ['#b2e0ec', '#6ab4d0', '#5aa6c4', '#3f88aa', '#539cbc'];
    function sand(u, z) { if (z < 2.4) { var hv = hash(R(u * 2), R(z * 2)); return hv > 0.9 ? '#f0e0b0' : hv < 0.12 ? '#c8b07a' : hv > 0.86 ? '#d9443a' : '#e0cc96'; } return null; }
    function weed(u, z, p, hgt) { return z < hgt && Math.abs(u - (p + Math.sin(z * 0.55 + p) * 0.7)) < 0.5 ? (((z * 2) | 0) & 1 ? '#3f8a4a' : '#6fb05a') : null; }
    box(b, g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0, g.z0, g.zw, function (u, v) {                                 /* su yüzeyi */
      var hv = hash(R(u * 2), R(v * 3)); return hv > 0.94 ? '#eafaff' : (u < 0.8 || v < 0.8) ? WT[0] : hv < 0.2 ? WT[1] : mix2(WT[0], WT[1]);
    }, function (u, z) {                                                                                     /* ön sol cam: kum, yosun, amfora, taş */
      var c = sand(u, z); if (c) return c;
      c = weed(u, z, 2.2, 9) || weed(u, z, 3.4, 6) || weed(u, z, W - 2.5, 10); if (c) return c;
      var au = u - W * 0.62, az = z - 2.4;                                                                    /* kuma gömülü amfora */
      if (az >= 0 && az < 4.5) { var aw = az < 0.6 ? 0.6 : az < 3.4 ? 1.5 * Math.sin(Math.PI * (az - 0.3) / 3.4) + 0.5 : 0.5; if (Math.abs(au) < aw) return au < -aw * 0.3 ? '#cc7c4c' : '#a45a36'; if (az > 3.4 && az < 3.9 && Math.abs(au) < 1.2) return '#a45a36'; }
      if ((u - W * 0.36) * (u - W * 0.36) / 3.2 + (z - 2.4) * (z - 2.4) / 2.2 < 1) return z > 3 ? '#9aa2a8' : '#6d747a';
      return z > 9 ? WT[2] : WT[4];
    }, function (v, z) {                                                                                     /* ön sağ cam */
      var c = sand(v + 40, z); if (c) return c === '#e0cc96' ? '#cdb984' : c;
      c = weed(v, z, D * 0.5, 8); if (c) return c === '#3f8a4a' ? '#2f6a3a' : '#4f9048';
      return WT[3];
    }, { norim: 1 });
    b.outline(0.55);
  });
}
function akvFrontSpr(hw, hh) {
  return spr('lsd|akvF|' + hw + '|' + hh + '|' + KK(), 0, 0, function (b) {
    var g = tankGeo(hw, hh), FR = '#2e3a42', i;
    wall(b, g.x0, g.y1, g.x1, g.y1, g.zw, g.zt, '#d6eef4'); wall(b, g.x1, g.y1, g.x1, g.y0, g.zw, g.zt, '#b8dde8');   /* su üstü cam */
    vl(b, g.x0, g.y1, g.z0, g.zt, FR); vl(b, g.x1, g.y1, g.z0, g.zt, FR); vl(b, g.x1, g.y0, g.z0, g.zt, FR);
    hl(b, g.x0, g.y0, g.x1, g.y0, g.zt, FR); hl(b, g.x1, g.y0, g.x1, g.y1, g.zt, FR); hl(b, g.x1, g.y1, g.x0, g.y1, g.zt, FR); hl(b, g.x0, g.y1, g.x0, g.y0, g.zt, FR);
    hl(b, g.x0, g.y1, g.x1, g.y1, g.z0, FR); hl(b, g.x1, g.y1, g.x1, g.y0, g.z0, FR);
    var X0 = R(fx(g.x0 + 0.12, g.y1)), Y0 = R(fy(g.x0 + 0.12, g.y1, g.zw - 2));                          /* cam parıltısı */
    for (i = 0; i < 12; i++) { b.set(X0 + i, Y0 + i + (i >> 1), '#ffffff', 0.4); b.set(X0 + i + 3, Y0 + i + (i >> 1), '#ffffff', 0.22); }
  });
}
var FISH = [{ y: 0.24, z: 9.6, sp: 0.09, ph: 0.1, c: '#f2a03a', c2: '#ffd08a' }, { y: 0.14, z: 13.4, sp: 0.065, ph: 0.9, c: '#e5533d', c2: '#ff9a7a' }, { y: 0.26, z: 16.2, sp: 0.12, ph: 1.4, c: '#f2d23a', c2: '#ffffff' }];
function drawAkvaryum(o) {
  var hw = o.hw || 0.5, hh = o.hh || 0.35, g = tankGeo(hw, hh), t = o.t, ax = R(pX(o.x, o.y)), ay = R(pY(o.x, o.y, 0)), i, p;
  shadowAt(o.x, o.y, 0.85);
  if (o.night) { p = OF(0, 0, 13); L.fr(ax, ay, p[0] - R(hw * 30), p[1] - 30, R(hw * 60), 52, 'rgba(110,220,235,.10)'); }
  at(akvBackSpr(hw, hh, o.night ? 1 : 0), o.x, o.y, 0);
  var span = g.x1 - g.x0 - 0.22, yl = g.y1 - 0.04;
  for (i = 0; i < FISH.length; i++) {                                          /* balıklar: ileri-geri yüzer, hafif iner-çıkar */
    var F = FISH[i], u = (t * F.sp + F.ph) % 2, pos = u < 1 ? u : 2 - u, dir = u < 1 ? 1 : -1;
    var fyy = Math.min(F.y, yl), fxx = g.x0 + 0.11 + span * (pos * pos * (3 - 2 * pos));
    p = OF(fxx, fyy, F.z + Math.sin(t * 1.7 + i * 2) * 0.7);
    L.fr(ax, ay, p[0] - 2, p[1] - 1, 4, 3, F.c); L.fr(ax, ay, p[0] - 2 + (dir > 0 ? 0 : 1), p[1], 3, 1, F.c2);
    L.fr(ax, ay, dir > 0 ? p[0] - 4 : p[0] + 2, p[1] - 1 + ((Math.floor(t * 6) + i) & 1), 2, 2, F.c);
    L.fr(ax, ay, dir > 0 ? p[0] + 1 : p[0] - 2, p[1] - 1, 1, 1, '#0a1a27');
  }
  for (i = 0; i < 3; i++) {                                                    /* kabarcıklar */
    var bz = g.z0 + 1.5 + ((t * 4 + i * 4.1) % (g.zw - g.z0 - 2));
    p = OF(g.x1 - 0.14, g.y1 - 0.02, bz); L.fr(ax, ay, p[0] + R(Math.sin(t * 5 + i) * 1.2), p[1], 1, 1, o.night ? '#e8ffff' : '#e8f8ff');
  }
  at(akvFrontSpr(hw, hh), o.x, o.y, 0);
}

/* =====================================================================
   8) BAKIR ÇEŞME: dövme bakır havuz (dipte hafif yeşil pas), sütun, taşan tas, lale tepelik; tastan havuza akan su + halkalar
   ===================================================================== */
var CB = 15, CBT = 17.6;
function cesmeSpr(hw) {
  return spr('lsd|cesme|' + hw + '|' + KK(), 0, 0, function (b) {
    var r = Math.min(0.38, hw - 0.02);
    box(b, -r, -r, r * 2, r * 2, 0, 7, function (u, v) { return (u < 1.4 || v < 1.4) ? '#f0b070' : '#d08a4a'; }, function (u, z) {
      if (z > 5.6) return '#d98a48';
      var hv = hash(R(u * 1.5), R(z * 1.5));
      if (z < 1.6 && hv > 0.72) return '#5aa08a';
      return z < 0.8 ? '#8a4a22' : hv > 0.84 ? '#d68a4c' : hv < 0.1 ? '#9a5426' : '#b8692e';
    }, function (v, z) {
      if (z > 5.6) return '#b06a34';
      var hv = hash(R(v * 1.5) + 50, R(z * 1.5));
      if (z < 1.6 && hv > 0.75) return '#4a8a76';
      return z < 0.8 ? '#6a3618' : hv > 0.86 ? '#a8622e' : '#8f4f22';
    });
    quadW(b, -r + 0.07, -r + 0.07, r * 2 - 0.14, r * 2 - 0.14, 7, function (X, Y) { var hv = hash(X, Y * 3); return hv > 0.95 ? '#dff4fb' : hv < 0.25 ? '#5598b8' : '#62a8c6'; });
    var sh = shadeOf(COP);
    lathe(b, 0, 0, 7, CB, function (zr) { return zr < 1 ? 2.4 : 1.5; }, sh, COP.t);
    lathe(b, 0, 0, CB, CBT, function (zr) { return 1.5 + zr / (CBT - CB) * 3.2; }, sh, COP.t, function (dn) { return dn > 0.82 ? '#f0b070' : dn > 0.72 ? COP.e : '#8fd0e4'; });
    lathe(b, 0, 0, CBT, 21, function () { return 1.0; }, sh, COP.t);
    lathe(b, 0, 0, 21, 25.4, function (zr) { return zr < 3.4 ? 0.5 + 1.5 * Math.sin(Math.PI * zr / 3.8) : 0.5; }, function (u, zr) { return (zr > 1.2 && zr < 1.8) ? BRASS : sh(u); }, COP.t);
    b.outline(0.55);
  });
}
function drawCesme(o) {
  shadowAt(o.x, o.y, 0.8);
  at(cesmeSpr(o.hw || 0.4), o.x, o.y, 0);
  var k = KK(), ax = R(pX(o.x, o.y)), ay = R(pY(o.x, o.y, 0)), t = o.t, f = Math.floor(t * 8) % 4, top = OF(0, 0, CBT), bot = OF(0, 0, 7.2);
  var rim = 4.5 * k, sts = [[-rim, 0], [rim, 0], [0, rim / 2]];
  for (var i = 0; i < sts.length; i++) {                                       /* tas kenarından havuza dökülen su */
    var sx = R(sts[i][0]), y0 = top[1] + R(sts[i][1]), len = bot[1] - top[1];
    L.fr(ax, ay, sx, y0, 1, len, 'rgba(205,238,250,.78)');
    for (var j = 0; j < 2; j++) L.fr(ax, ay, sx, y0 + ((f * 3 + j * 10 + i * 4) % len), 1, 2, '#ffffff');
    var ry = y0 + len, rw = 2 + ((f + i) % 4);                                  /* halka */
    L.fr(ax, ay, sx - rw, ry, rw * 2 + 1, 1, 'rgba(225,246,252,' + (0.75 - (rw - 2) * 0.18).toFixed(2) + ')');
  }
  var tp = OF(0, 0, 25.6);                                                      /* tepelikte fokurdayan su */
  L.fr(ax, ay, tp[0] - 1, tp[1] - (f & 1), 2, 1 + (f & 1), '#dff4fb');
}

/* ---------------- kanca ---------------- */
var DRAW = { cicek: drawCicek, nazar: drawNazar, capa: drawCapa, guguk: drawGuguk, kilim: drawKilim, zeytin: drawZeytin, akvaryum: drawAkvaryum, cesme: drawCesme };
HKA.drawLokDecor = function (o) {
  var f = o && DRAW[o.id];
  if (!f) return false;
  if (o.t === undefined) o.t = G().t || 0;
  f(o);
};
})();
