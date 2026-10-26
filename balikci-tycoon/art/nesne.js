/* HAMSİ KOYU — ince piksel: nesne (sanatçı dosyası)
   İskele/rıhtım zemini, istasyonlar, tezgâhlar, eşyalar, tekne, binalar (her seviye), süsler, efektler.
   Yöntem: her nesne kendi durum anahtarıyla (seviye, yön, kare…) bir kez ince piksel tamponuna (L.Buf) çizilir,
   sonra yalnız L.blit edilir. Hareketli küçük parçalar (alev, duman, bayrak, balık yığını) ayrı ve küçüktür.
   Yerleşim için "kit": dünya (karo) koordinatıyla izometrik kutu, duvar, çatı, çizgi — sprite çapasına göre. */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib;
if (!L) return;
var G = function () { return window.HKG; };
var mix = L.mix, dark = L.dark, lite = L.lite, hash = L.hash, tone = L.tone;

/* ---------- oyun fonksiyonları (bir kez okunur; HKG.v yavaş) ---------- */
var GF = {};
function gf(n) { var f = GF[n]; if (f === undefined) f = GF[n] = G().v(n) || null; return f; }
var GV = {};                                     /* sabit referanslı diziler/nesneler (AREAS, counters…) */
function gv(n) { var f = GV[n]; if (f === undefined) f = GV[n] = G().v(n); return f; }
function R(v) { return Math.round(v); }
function pX(x, y) { return (x - y) * 12; }
function pY(x, y, z) { return (x + y) * 6 - (z || 0); }
function d2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function T() { return G().t; }
function shd(c, n) { return G().shade(c, n); }
var PAL = null;
function P() { return PAL || (PAL = G().PAL); }

/* ---------- kit: dünya koordinatlı ince çizim (sprite çapası OX,OY) ---------- */
var KK = 2, OX = 0, OY = 0;
function fx(x, y) { return ((x - OX) - (y - OY)) * 12 * KK; }
function fy(x, y, z) { return (((x - OX) + (y - OY)) * 6 - (z || 0)) * KK; }
function P3(x, y, z) { return [fx(x, y), fy(x, y, z)]; }
/* sprite kur: çapa (ox,oy) dünya karosu; anahtar her görünüş farkını içermeli */
function spr(key, ox, oy, fn) {
  return L.sprite(key, function (b) {
    var a = OX, c = OY, k = KK; OX = ox; OY = oy; KK = G().K;
    try { fn(b); } finally { OX = a; OY = c; KK = k; }
  });
}
/* çapası dünya noktası olan sprite'ı çiz */
function at(s, x, y, z, al) { L.blit(s, R(pX(x, y)), R(pY(x, y, z || 0)), al); }
function numsort(a, b) { return a - b; }
/* çokgen (ince piksel köşeler) — col: renk ya da (x,y)→renk */
function poly(b, Pt, col) {
  var n = Pt.length, y0 = 1e9, y1 = -1e9, i;
  for (i = 0; i < n; i++) { if (Pt[i][1] < y0) y0 = Pt[i][1]; if (Pt[i][1] > y1) y1 = Pt[i][1]; }
  var fn = typeof col === 'function';
  for (var y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    var yc = y + 0.5, xs = [];
    for (i = 0; i < n; i++) {
      var a = Pt[i], c = Pt[(i + 1) % n];
      if ((a[1] <= yc && c[1] > yc) || (c[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (c[1] - a[1]) * (c[0] - a[0]));
    }
    xs.sort(numsort);
    for (var k = 0; k + 1 < xs.length; k += 2) {
      for (var x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) {
        var cc = fn ? col(x, y) : col; if (cc) b.set(x, y, cc);
      }
    }
  }
}
/* ince çizgi (Bresenham) */
function line(b, x0, y0, x1, y1, c) {
  x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1);
  var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0;
  for (;;) { b.set(x0, y0, typeof c === 'function' ? c(n++) : c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
/* doku: renk + hafif tahta/taş kumlanması (sabit tohumlu) */
function grain(c, amt, seed) {
  var D = dark(c, amt || 0.07), Lc = lite(c, amt || 0.07), s = seed || 0;
  return function (x, y) { var h = hash(x + s * 31, y * 7 + s); return h > 0.9 ? D : h < 0.06 ? Lc : c; };
}
/* izometrik kutu, oyunun isoBox imzasıyla: (x,y) köşe, w×h karo, z0..z1 */
function box(b, x, y, w, h, z0, z1, top, left, right, opt) {
  var hh = z1 - z0, rim = !(opt && opt.norim);
  var tf = typeof top === 'function' ? top : (function (c) { var g = grain(c, 0.05), r = lite(c, 0.28); return function (u, v) { return rim && (u < 0.7 || v < 0.7) ? r : g(R(u * 3), R(v * 3)); }; })(top);
  var lf = typeof left === 'function' ? left : (function (c) { var g = grain(c, 0.06, 3), r = lite(c, 0.14); return function (u, z) { return rim && z > hh - 0.7 && hh > 2 ? r : g(R(u * 3), R(z * 2)); }; })(left);
  var rf = typeof right === 'function' ? right : (function (c) { var g = grain(c, 0.06, 5), r = lite(c, 0.1); return function (v, z) { return rim && z > hh - 0.7 && hh > 2 ? r : g(R(v * 3), R(z * 2)); }; })(right);
  L.isoBox(b, (x - OX) * 12, (y - OY) * 12, (x + w - OX) * 12, (y + h - OY) * 12, z0, hh, { top: tf, left: lf, right: rf });
  return b;
}
/* düşey duvar: zemindeki iki nokta arası, z0..z1 */
function wall(b, x0, y0, x1, y1, z0, z1, c) { poly(b, [P3(x0, y0, z0), P3(x1, y1, z0), P3(x1, y1, z1), P3(x0, y0, z1)], typeof c === 'string' ? grain(c, 0.05) : c); }
function vl(b, x, y, z0, z1, c, w) { var X = R(fx(x, y)), Y0 = R(fy(x, y, z1)), Y1 = R(fy(x, y, z0)); b.rect(X, Y0, w || 1, Math.max(1, Y1 - Y0), c); }
function hl(b, x0, y0, x1, y1, z, c) { line(b, fx(x0, y0), fy(x0, y0, z), fx(x1, y1), fy(x1, y1, z), c); }
function quadW(b, x, y, w, h, z, c) { poly(b, [P3(x, y, z), P3(x + w, y, z), P3(x + w, y + h, z), P3(x, y + h, z)], typeof c === 'string' ? grain(c, 0.05) : c); }
/* sanat pikseli cinsinden ekran dikdörtgeni (çapaya göre) — klasik px() karşılığı, 2 kat ince */
function rc(b, x, y, w, h, c) { b.rect(R(x * KK), R(y * KK), Math.max(1, R(w * KK)), Math.max(1, R(h * KK)), c); }
/* çatı düzlemi: 4 köşe [x,y,z]; çizgi rengi + sıra sayısı (kiremit/pul/oluk) */
function roofPlane(b, pts, c, lc, n) {
  var Q = pts.map(function (q) { return P3(q[0], q[1], q[2]); });
  poly(b, Q, grain(c, 0.05, 9));
  if (lc && n) {
    for (var k = 1; k < n; k++) {
      var t = k / n, a = pts[0], bb = pts[1], cc = pts[2], d = pts[3];
      var p0 = [a[0] + (d[0] - a[0]) * t, a[1] + (d[1] - a[1]) * t, a[2] + (d[2] - a[2]) * t];
      var p1 = [bb[0] + (cc[0] - bb[0]) * t, bb[1] + (cc[1] - bb[1]) * t, bb[2] + (cc[2] - bb[2]) * t];
      line(b, fx(p0[0], p0[1]), fy(p0[0], p0[1], p0[2]), fx(p1[0], p1[1]), fy(p1[0], p1[1], p1[2]), lc);
      line(b, fx(p0[0], p0[1]), fy(p0[0], p0[1], p0[2]) + 1, fx(p1[0], p1[1]), fy(p1[0], p1[1], p1[2]) + 1, lite(c, 0.12));
    }
  }
  line(b, Q[0][0], Q[0][1], Q[1][0], Q[1][1], lite(c, 0.2));                     /* saçak ışığı */
}
function roofGableX(b, x0, x1, y0, y1, z, rh, cF, cB, cG, lc, n) {
  var ym = (y0 + y1) / 2;
  roofPlane(b, [[x0, y0, z], [x1, y0, z], [x1, ym, z + rh], [x0, ym, z + rh]], cB, null, 0);
  poly(b, [P3(x1, y0, z), P3(x1, y1, z), P3(x1, ym, z + rh)], grain(cG, 0.05));
  roofPlane(b, [[x0, y1, z], [x1, y1, z], [x1, ym, z + rh], [x0, ym, z + rh]], cF, lc, n);
  hl(b, x0, ym, x1, ym, z + rh, lite(cF, 0.3));
}
function roofHip(b, x0, x1, y0, y1, z, rh, cF, cR, lc, n) {
  var ym = (y0 + y1) / 2, xm = (x0 + x1) / 2, i = Math.min((y1 - y0) / 2, (x1 - x0) / 2);
  var r0 = Math.min(x0 + i, xm), r1 = Math.max(x1 - i, xm);
  roofPlane(b, [[x1, y0, z], [x1, y1, z], [r1, ym, z + rh], [r1, ym, z + rh]], cR, lc, n);
  roofPlane(b, [[x0, y1, z], [x1, y1, z], [r1, ym, z + rh], [r0, ym, z + rh]], cF, lc, n);
  hl(b, r0, ym, r1, ym, z + rh, lite(cF, 0.3));
}
function winF(b, x0, x1, y, z0, z1, c, fr) { if (fr) wall(b, x0 - 0.03, y, x1 + 0.03, y, z0 - 1, z1 + 1, fr); wall(b, x0, y, x1, y, z0, z1, c); }
function winR(b, x, y0, y1, z0, z1, c, fr) { if (fr) wall(b, x, y0 - 0.03, x, y1 + 0.03, z0 - 1, z1 + 1, fr); wall(b, x, y0, x, y1, z0, z1, c); }

/* ---------- ortak dokular (ince piksel; X,Y tampon koordinatı) ---------- */
function woodV(c, step) { var Tn = tone(c); step = step || 4; return function (X, Y) { var k = ((X % step) + step) % step; return k === 0 ? Tn.d : (hash(X >> 1, Y >> 2) > 0.9 ? dark(c, 0.1) : k === 1 ? lite(c, 0.06) : c); }; }
function woodH(c, step) { var Tn = tone(c); step = step || 4; return function (X, Y) { var k = ((Y % step) + step) % step; return k === 0 ? Tn.d : (hash(X >> 2, Y >> 1) > 0.9 ? dark(c, 0.1) : k === 1 ? lite(c, 0.08) : c); }; }
function stoneW(c) { var Tn = tone(c); return function (X, Y) { var row = Math.floor(Y / 4), o = (row & 1) * 4; return (((Y % 4) + 4) % 4 === 0 || ((((X + o) % 8) + 8) % 8 === 0)) ? Tn.d : hash(X >> 2, row) > 0.8 ? lite(c, 0.08) : hash(X >> 1, Y) > 0.93 ? dark(c, 0.08) : c; }; }

/* =====================================================================
   1) ZEMİN: gölge, bölge zemini (iskele / boyalı iskele / kagir rıhtım), çit, lamba
   ===================================================================== */
/* yumuşak izometrik gölge: iki katlı (oyunun alfa değerleri), yuvarlatılmış eşkenar dörtgen */
function shadowSpr(r) {
  var rr = Math.round(r * 20) / 20;
  return L.sprite('shd|' + rr + '|' + G().K, function (b) {
    var K = G().K, layers = [[8, 4, 0.09], [5.4, 2.7, 0.17]];
    layers.forEach(function (Ly) {
      var rx = rr * Ly[0] * K, ry = rr * Ly[1] * K;
      for (var y = -Math.ceil(ry); y <= Math.ceil(ry); y++) for (var x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
        var q = Math.pow(Math.abs(x + 0.5) / rx, 1.5) + Math.pow(Math.abs(y + 0.5) / ry, 1.5);
        if (q <= 1) b.set(x, y, '#14303c', Ly[2]);
      }
    });
  });
}
HKA.shadow = function (x, y, r) { L.blit(shadowSpr(r), pX(x, y), pY(x, y, 0)); };

var DECK = 5;                                   /* iskele kenarının yüksekliği (zemin z=0 üstte, kenar aşağı iner) */
var WOODS1 = ['#c99558', '#bd8a4f', '#c49050', '#b98648', '#d09a5c'];
var WOODS2 = ['#c98a4e', '#c28348', '#cf9254', '#bb7d44', '#d39858'];
function plankTop(woods, seamC, rowW, segL) {
  return function (u, v) {
    var row = Math.floor(v / rowW), f = v / rowW - row;
    if (f < 0.2) return seamC;
    var seam = (row * 17) % segL, su = (u + seam) % segL, seg = Math.floor((u + seam) / segL);
    if (su < 0.55) return seamC;
    var c = woods[Math.floor(hash(row * 3 + seg, 5) * woods.length)];
    var gr = hash(Math.floor(u * 0.45) + row * 11, Math.floor(f * 3) + row * 5);  /* boyuna damar */
    if (gr > 0.86) c = dark(c, 0.08); else if (gr < 0.07) c = lite(c, 0.07);
    if (hash(seg * 7 + row, 9) > 0.93 && Math.abs(su - 9) < 1.2 && f > 0.4 && f < 0.8) c = dark(c, 0.25);   /* budak */
    if (su > 0.9 && su < 1.6 && f > 0.45 && f < 0.7) c = '#5e381e';           /* çivi */
    else if (f < 0.4) c = lite(c, 0.1);
    else if (f > 0.85) c = dark(c, 0.06);
    return c;
  };
}
function areaSprite(a, i) {
  var lv = a.lvl, W = (a.x1 - a.x0) * 12, D = (a.y1 - a.y0) * 12;
  return spr('area|' + i + '|' + lv + '|' + W + 'x' + D + '|' + G().K, a.x0, a.y0, function (b) {
    function post(u, v) {                         /* kazık: kenarın altında kuma/suya iner */
      L.isoBox(b, u, v, u + 2.2, v + 2.2, -DECK - 4, 4.5, {
        top: function () { return '#6a4424'; },
        left: function (uu, z) { return z < 1.3 ? '#4e3a2a' : (hash(R(uu * 3), R(z)) > 0.85 ? '#6a4424' : '#7a5030'); },
        right: function (vv, z) { return z < 1.3 ? '#3a2c20' : '#5a3a20'; }
      });
    }
    if (lv < 3) {
      for (var pu = 6; pu < W - 3; pu += 13) post(pu, D - 2.2);
      for (var pv = 4; pv < D - 3; pv += 13) post(W - 2.2, pv);
      post(W - 2.2, D - 2.2);
    }
    var top, left, right;
    if (lv >= 3) {
      /* kagir rıhtım: kesme taş kenar + arnavut kaldırımı + ortada kilim mozaik yol */
      var mid = D / 2;
      top = function (u, v) {
        if (u < 0.7 || v < 0.7) return '#e4ddcb';
        if (u > W - 3.2 || v > D - 3.2) {                                    /* granit bordür */
          var e = (u > W - 3.2) ? v : u;
          if (Math.floor(e / 9) !== Math.floor((e - 0.45) / 9)) return '#8f8775';
          return (u > W - 0.8 || v > D - 0.8) ? '#b3ab98' : (hash(Math.floor(e / 9), 3) > 0.5 ? '#d8d0bc' : '#cec6b1');
        }
        if (Math.abs(v - mid) < 4.6 && u > 4.8 && u < W - 4.8) {             /* kilim mozaik */
          var dv = Math.abs(v - mid);
          if (dv > 3.9) return '#8f8775';
          if (dv > 3.2) return '#d9a441';
          var cu = ((u - 4.8) % 12) - 6, dd = Math.abs(cu) + dv * 1.7;
          var tes = (Math.floor(u * 1.4) + Math.floor(v * 1.4)) % 2;
          if (dd < 1.2) return '#2a4c7d';
          if (dd < 2.6) return tes ? '#f1e6cc' : '#e6d9bb';
          if (dd < 3.5) return '#d9a441';
          if (dd < 4.6) return tes ? '#a83d2b' : '#b8483a';
          return tes ? '#8e3324' : '#9a3a2a';
        }
        var cu2 = Math.floor(u / 6), cv = Math.floor(v / 6), ru = u - cu2 * 6, rv = v - cv * 6;
        if (ru < 0.55 || rv < 0.55) return '#9a9483';
        var base = ['#d2cab6', '#c8c0ac', '#cfc6b0', '#c1b9a4', '#d8d0bd'][Math.floor(hash(cu2, cv) * 5)];
        if (ru < 1.3 || rv < 1.3) base = lite(base, 0.12);
        else if (ru > 5.1 || rv > 5.1) base = dark(base, 0.1);
        if (hash(Math.floor(u * 2), Math.floor(v * 2)) > 0.94) base = dark(base, 0.08);
        if (hash(Math.floor(u), Math.floor(v)) > 0.985) base = '#8f9a6a';
        return base;
      };
      var ash = function (s, z) {                  /* taş blok kenar: sıralar + derz */
        var row = Math.floor(z / 2.5), o = (row % 2) * 4.5;
        if (z > DECK - 0.8) return '#d8d0bc';
        if ((z % 2.5) < 0.45 || ((s + o) % 9) < 0.5) return '#7d7563';
        var c = hash(Math.floor((s + o) / 9), row) > 0.5 ? '#aaa28e' : '#a0988a';
        return z < 0.8 ? '#6e6a5e' : c;
      };
      left = function (u, z) { return ash(u, z); };
      right = function (v, z) { var c = ash(v + 3, z); return c === '#d8d0bc' ? '#c4bca8' : dark(c, 0.14); };
    } else {
      var woods = lv === 2 ? WOODS2 : WOODS1, seamC = lv === 2 ? '#6e3f22' : '#7d4e2b';
      var pt = plankTop(woods, seamC, lv === 2 ? 2.8 : 2.4, 19);
      top = function (u, v) {
        if (lv === 2) {                                                      /* boyalı kenar şeridi (turkuaz) */
          var e = Math.min(u, v, W - u, D - v);
          if (e > 2.2 && e < 4.2) { var cc = (Math.floor(Math.max(u, v) * 0.7) % 7 === 0) ? '#1d7aa8' : '#2a95c4'; return hash(R(u * 2), R(v * 2)) > 0.93 ? '#5ab0d4' : cc; }
        }
        var c = pt(u, v);
        if (u < 0.6 || v < 0.6) c = lite(c, 0.3);
        return c;
      };
      var side = lv === 2 ? '#a5683a' : '#9a6236', sideD = lv === 2 ? '#7f4a28' : '#7a4a28';
      left = function (u, z) {
        var c = side;
        if (Math.floor(u * 0.5) % 6 === 0 && (u % 2) < 0.4) c = '#6e4222';
        if (hash(Math.floor(u / 1.2), Math.floor(z)) > 0.9) c = dark(c, 0.12);
        if (z > DECK - 0.5) c = lv === 2 ? '#2a95c4' : '#c38a52';
        else if (z > DECK - 1.3) c = lv === 2 ? '#d39858' : '#b27744';
        else if (z < 1.1) c = '#6a4a30';
        return c;
      };
      right = function (v, z) {
        var c = sideD;
        if (Math.floor(v * 0.5) % 6 === 0 && (v % 2) < 0.4) c = '#4f2f19';
        if (hash(Math.floor(v / 1.2), Math.floor(z)) > 0.9) c = dark(c, 0.12);
        if (z > DECK - 0.5) c = lv === 2 ? '#1d7aa8' : '#9e6838';
        else if (z > DECK - 1.3) c = lv === 2 ? '#a8723e' : '#8f5a32';
        else if (z < 1.1) c = '#4e3a28';
        return c;
      };
    }
    L.isoBox(b, 0, 0, W, D, -DECK, DECK, { top: top, left: left, right: right });
    b.outline(0.5);
  });
}
/* kilitli bölge: soluk, otlu toprak + kazık/halat çevre (önceki iskelenin kenarını örtmesin diye üst şerit boş) */
function lockedSprite(a, i) {
  var W = (a.x1 - a.x0) * 12, D = (a.y1 - a.y0) * 12;
  return spr('lock|' + i + '|' + W + 'x' + D + '|' + G().K, a.x0, a.y0, function (b) {
    var K = KK;
    for (var y = -2; y < (W + D) / 2 * K + 2; y++) for (var x = -D * K - 2; x < W * K + 2; x++) {
      var u = (x + 0.5) / K, vv = (y + 0.5) / K, X = (u + 2 * vv) / 2, Y = (2 * vv - u) / 2;
      if (X < 0 || Y < 10.5 || X >= W || Y >= D) continue;
      var h = hash(Math.floor(X / 2), Math.floor(Y / 2));
      if (h > 0.975) b.set(x, y, '#8c9a56');                                 /* ot */
      else if (h < 0.02) b.set(x, y, '#9a9484');                             /* çakıl */
      else if (L.bayer[y & 3][x & 3] < 0.4) b.set(x, y, '#7d7048', 0.3);
    }
    /* çevre: kazıklar + sarkık halat */
    var stakes = [], s;
    for (s = 0; s <= W; s += 24) stakes.push([s, D]);
    for (s = D - 24; s >= 0; s -= 24) stakes.push([W, s]);
    var prev = null;
    stakes.forEach(function (q) {
      var X0 = (q[0] - q[1]) * K, Y0 = ((q[0] + q[1]) / 2) * K;
      if (prev) {
        var n = Math.max(Math.abs(X0 - prev[0]), 4);
        for (var t = 0; t <= n; t++) { var f = t / n, xx = prev[0] + (X0 - prev[0]) * f, yy = prev[1] + (Y0 - prev[1]) * f - 9 * K + Math.sin(f * Math.PI) * 3 * K; b.set(xx, yy, (t >> 2) % 2 ? '#e05a3a' : '#f0e6cc'); b.set(xx, yy + 1, '#8a7a58'); }
      }
      b.rect(X0 - 1, Y0 - 11 * K, 3, 11 * K, '#6a4a2c'); b.rect(X0 - 1, Y0 - 11 * K, 1, 11 * K, '#8a6a44'); b.rect(X0 - 1, Y0 - 11 * K - 1, 3, 1, '#a8834f');
      prev = [X0, Y0];
    });
  });
}
HKA.drawArea = function (a, i) {
  if (a.locked) {
    at(lockedSprite(a, i), a.x0, a.y0, 0);
    var pl = G().player, mx = (a.x0 + a.x1) / 2, my = a.y0 + 0.45;
    if (d2(pl.x, pl.y, mx, my) < 24) gf('uiLabel')(mx, my, 12, gf('NM')(a.n), '#e8d5a8', 0.85);
    return;
  }
  at(areaSprite(a, i), a.x0, a.y0, 0);
};

/* çit: Lv1 ham ahşap kazık + jüt halat, Lv2 boyalı kazık + kalın halat, Lv3 taş babası + demir zincir.
   Halat bir önceki kazığa uzanır (tezgâh boşluğunda kazık yoksa halat da yok). */
function fenceGap(yy) {
  var cs = gv('counters'), A = gv('AREAS');
  for (var k = 0; k < cs.length; k++) { if (A[cs[k].z].locked) continue; if (Math.abs(yy - cs[k].y) < 1.3) return true; }
  return false;
}
function fenceSpr(lv, dir, rope) {
  return spr('fp|' + lv + '|' + dir + '|' + rope + '|' + G().K, 0, 0, function (b) {
    var dx = dir === 'y' ? 0 : -0.75, dy = dir === 'y' ? -0.75 : 0;          /* önceki kazık */
    var K = KK, h = lv >= 3 ? 13 : 10;
    if (rope) {
      var x0 = fx(dx, dy), y0 = fy(dx, dy, h - 3), x1 = 0, y1 = fy(0, 0, h - 3), n = Math.abs(x1 - x0);
      for (var t = 0; t <= n; t++) {
        var f = t / n, xx = x0 + (x1 - x0) * f, yy = y0 + (y1 - y0) * f + Math.sin(f * Math.PI) * (lv >= 3 ? 2.5 : 3.5) * K;
        if (lv >= 3) { b.set(xx, yy, (t % 3) ? '#4a535b' : '#6c767d'); if (t % 3 === 1) b.set(xx, yy + 1, '#2e353b'); }
        else { b.set(xx, yy, lv === 2 ? ((t % 3) ? '#e2cf9e' : '#b89d6a') : '#d9c8a0'); b.set(xx, yy + 1, lv === 2 ? '#8a7350' : '#9a8a68'); if (lv === 2) b.set(xx, yy - 1, '#efe0b8'); }
      }
    }
    if (lv >= 3) {                                  /* taş baba: gövde + başlık */
      b.rect(-3, -13 * K, 7, 13 * K, '#a8a08c'); b.rect(-3, -13 * K, 3, 13 * K, '#c0b8a2'); b.rect(3, -13 * K, 1, 13 * K, '#8f8775');
      b.rect(-5, -15 * K, 11, 4, '#b3aa93'); b.rect(-5, -15 * K, 11, 1, '#d8d0bc'); b.rect(-4, -15 * K - 2, 9, 2, '#c4bca8');
      b.rect(-4, -9 * K, 9, 2, '#5d666e'); b.set(-4, -9 * K, '#8b949c');
    } else {
      var c = lv === 2 ? '#a8723e' : '#9a6a3a';
      b.rect(-2, -10 * K, 5, 10 * K, c); b.rect(-2, -10 * K, 2, 10 * K, lite(c, 0.2)); b.rect(2, -10 * K, 1, 10 * K, dark(c, 0.3));
      for (var g = 0; g < 4; g++) b.set(-1 + (g % 2), -10 * K + 4 + g * 4, dark(c, 0.2));
      if (lv === 2) { b.rect(-3, -10 * K - 2, 7, 3, '#2a95c4'); b.rect(-3, -10 * K - 2, 7, 1, '#5ab0d4'); }
      else { b.rect(-2, -10 * K - 1, 5, 2, lite(c, 0.3)); }
      b.rect(-3, -7 * K, 7, 2, lv === 2 ? '#d9c8a0' : '#c9b183'); b.set(-3, -7 * K + 1, '#8a7350');
    }
    b.outline(0.5);
  });
}
HKA.fencePost = function (x, y, lv) {
  var dir = x === 9.95 ? 'y' : 'x', rope;
  if (dir === 'y') rope = y >= 0.74 && !fenceGap(y - 0.75);
  else rope = x >= 0.74;
  at(fenceSpr(lv >= 3 ? 3 : lv, dir, rope ? 1 : 0), x, y, 0);
};

/* sokak lambası: dökme demir direk, kıvrımlı kollar, camlı fener; gece zemine sıcak ışık */
function lampSpr(f) {
  return L.sprite('lamp|' + f + '|' + G().K, function (b) {
    var K = G().K, I = '#3c4650', Il = '#586773', Id = '#26303a';
    b.rect(-1, -24 * K, 3, 24 * K, I); b.rect(-1, -24 * K, 1, 24 * K, Il);
    b.rect(-4, -7 * K, 9, 2, Id); b.rect(-5, -5 * K, 11, 3, I); b.rect(-5, -5 * K, 11, 1, Il); b.rect(-6, -2 * K, 13, 2 * K, Id);
    for (var i = 0; i < 5; i++) { b.set(-2 - i, -25 * K + Math.round(i * i * 0.25), I); b.set(2 + i, -25 * K + Math.round(i * i * 0.25), I); }
    b.set(-7, -24 * K + 3, Il); b.set(7, -24 * K + 3, Il);
    var gl = ['#ffd98a', '#ffe6a8', '#ffcf72'][f];
    b.rect(-6, -31 * K, 13, 2, Id); b.rect(-5, -30 * K + 1, 11, 7, Id);
    b.rect(-4, -30 * K + 2, 4, 5, gl); b.rect(1, -30 * K + 2, 4, 5, gl); b.set(-4, -30 * K + 2, '#fff6d8'); b.set(1, -30 * K + 2, '#fff6d8');
    b.rect(-5, -30 * K + 8, 11, 2, Id);
    b.rect(-4, -32 * K, 9, 2, '#4a5a66'); b.rect(-2, -33 * K, 5, 2, Id); b.set(0, -33 * K - 1, '#c9952f');
    b.outline(0.55);
  });
}
function glowSpr() {
  return L.sprite('lglow|' + G().K, function (b) {
    var K = G().K;
    for (var y = -8 * K; y <= 8 * K; y++) for (var x = -13 * K; x <= 13 * K; x++) {
      var q = Math.abs(x) / (13 * K) + Math.abs(y) / (8 * K); if (q > 1) continue;
      b.set(x, y, '#ffd98a', q < 0.45 ? 1 : q < 0.75 ? 0.7 : 0.4);
    }
  });
}
HKA.drawLamp = function (x, y) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0)), day = G().day, DL = gv('DAY_LEN');
  var p = clamp(day.t / DL, 0, 1), night = p > 0.7 || p < 0.1 || day.phase === 'closing' || day.phase === 'summary';
  L.blit(glowSpr(), sx, sy, night ? 0.30 : 0.13);
  var g = Math.sin(T() * 3.1), f = g > 0.4 ? 1 : g < -0.4 ? 2 : 0;
  L.blit(lampSpr(f), sx, sy);
};

/* =====================================================================
   2) EŞYALAR: balık, fileto, güveç, füme, para, sandık simgesi, yığın
   Çapa = oyunun verdiği ekran noktası (sanat pikseli). Hepsi tür başına bir sprite.
   ===================================================================== */
function FISHT(f) { var F = G().FISH; return F[f] || F.hamsi; }
function fishBody(b, F, id, len, hgt, ox, oy) {     /* baş solda; ox,oy: kuyruk kökü */
  var col = F.col, bel = F.bel, back = dark(col, 0.18), ridge = dark(col, 0.4);
  for (var i = 0; i < len; i++) {
    var t = i / len, hh = Math.max(1, Math.round(hgt * Math.sin(Math.min(1, t * 1.15 + 0.08) * Math.PI * 0.92 + 0.12)));
    var X = ox - i;
    for (var j = -hh; j <= hh; j++) {
      var c = j < -hh * 0.35 ? back : j < hh * 0.3 ? col : bel;
      if (j === -hh) c = ridge;
      if (id === 'uskumru' && j < -hh * 0.2 && ((i + Math.abs(j) * 2) % 5 < 2)) c = dark(col, 0.45);
      if (id === 'palamut' && j < 0 && ((i - j * 2) % 6 < 1)) c = dark(col, 0.42);
      if (id === 'somon' && j < 0 && hash(i, j) > 0.86) c = dark(col, 0.3);
      if ((id === 'hamsi' || id === 'levrek') && j === 0 && i > 3) c = lite(col, 0.35);   /* gümüş yan çizgi */
      if (j === hh && hh > 1) c = dark(bel, 0.12);
      b.set(X, oy + j, c);
    }
  }
  var tc = dark(col, 0.12);                          /* çatal kuyruk */
  for (var k = 0; k < 5; k++) { b.set(ox + 1 + k, oy - 1 - k, tc); b.set(ox + 1 + k, oy + 1 + k, tc); b.set(ox + 1 + k, oy - k, k < 2 ? tc : dark(tc, 0.1)); b.set(ox + 1 + k, oy + k, k < 2 ? tc : dark(tc, 0.1)); }
  b.set(ox + 1, oy, tc);
  if (id === 'ton') { for (var q = 0; q < 3; q++) { b.set(ox - 2 - q * 2, oy - hgt + 1, '#e8c84a'); b.set(ox - 2 - q * 2, oy + hgt - 1, '#e8c84a'); } }
  var hx0 = ox - len + 3;
  b.set(hx0, oy - 1, '#16222b'); b.set(hx0 + 1, oy - 1, '#16222b'); b.set(hx0, oy - 2, '#ffffff');        /* göz */
  for (var g = -1; g <= 2; g++) b.set(hx0 + 4, oy + g, dark(col, 0.3));                                   /* solungaç */
  b.set(ox - Math.round(len * 0.45), oy - hgt - 1, ridge); b.set(ox - Math.round(len * 0.45) - 1, oy - hgt - 1, ridge);   /* sırt yüzgeci */
  b.set(ox - Math.round(len * 0.4), oy + hgt + 1, dark(bel, 0.3));
}
function fishSpr(f) {
  return L.sprite('fi|' + f + '|' + G().K, function (b) {
    var F = FISHT(f), big = f === 'ton' || f === 'somon';
    fishBody(b, F, F.id, big ? 19 : 18, big ? 5 : 4, 8, 0);
    b.outline(0.55);
  });
}
function filetoSpr(f) {
  return L.sprite('ft|' + f + '|' + G().K, function (b) {
    var F = FISHT(f), m = F.meat, sk = F.col;
    /* yağlı kâğıt (kırışık kenar) */
    for (var y = -5; y <= 5; y++) for (var x = -11; x <= 10; x++) {
      if ((x === -11 || x === 10) && (y & 1)) continue;
      b.set(x, y, y === -5 ? '#fdfaf2' : y === 5 ? '#c9c0ae' : (hash(x >> 1, y) > 0.9 ? '#e8e1d0' : '#f3eee2'));
    }
    /* fileto: sivri uçlu dilim, üstte gümüş deri, içte yağ damarları */
    for (var x2 = -8; x2 <= 7; x2++) {
      var t = (x2 + 8) / 15, hh = Math.max(1, Math.round(3.4 * Math.sin(Math.min(1, t * 1.05) * Math.PI)));
      for (var j = -hh; j <= hh - 1; j++) {
        var c = j === -hh ? dark(sk, 0.1) : j === -hh + 1 ? lite(sk, 0.25) : (j > hh - 2 ? dark(m, 0.18) : m);
        if (j > -hh + 1 && j < hh - 1 && ((x2 - j * 2 + 40) % 5) === 0) c = lite(m, 0.5);
        if (j > -hh + 1 && j < hh - 1 && ((x2 - j * 2 + 41) % 5) === 0) c = dark(m, 0.08);
        b.set(x2, j, c);
      }
    }
    b.rect(5, 1, 4, 3, '#e8d24a'); b.rect(6, 2, 2, 1, '#f6ea90'); b.set(5, 1, '#fff6b8'); b.set(8, 3, '#c9a82a');   /* limon */
    b.outline(0.5);
  });
}
function dishSpr(fr) {
  return L.sprite('dish|' + fr + '|' + G().K, function (b) {
    b.rect(-10, -2, 20, 8, '#9a4a28'); b.rect(-10, -2, 20, 2, '#b8623a'); b.rect(-8, 6, 16, 2, '#6e321a');
    b.rect(-10, 3, 20, 1, '#7d3a1e'); b.rect(-9, -2, 3, 6, '#b05a32');
    b.rect(-12, 0, 2, 4, '#7d3a1e'); b.rect(10, 0, 2, 4, '#7d3a1e');
    b.rect(-8, -6, 16, 4, '#d8743a'); b.rect(-6, -6, 4, 2, '#f0a15a'); b.rect(2, -5, 4, 2, '#f0a15a'); b.set(-3, -4, '#a8401c'); b.set(4, -3, '#a8401c');
    b.rect(-2, -6, 2, 1, '#4f8a3a'); b.rect(4, -6, 2, 1, '#4f8a3a'); b.set(-1, -7, '#6fae4a'); b.set(5, -7, '#6fae4a');
    b.outline(0.55);
    var s = fr ? 1 : 0;                                  /* buhar */
    for (var k = 0; k < 4; k++) { b.set(-2 + ((k + s) % 2), -9 - k * 2 - s * 2, '#ffffff', 0.55); b.set(2 - ((k + s) % 2), -10 - k * 2 - s * 2, '#ffffff', 0.4); }
  });
}
function fumeSpr(f) {
  return L.sprite('fm|' + f + '|' + G().K, function (b) {
    var F = FISHT(f), G2 = { col: '#b0763e', bel: '#e0a45a', meat: F.meat };
    fishBody(b, G2, 'fume', 18, 4, 8, 1);
    for (var x = -9; x < 6; x += 3) b.set(x, 0, '#f0c070');                               /* parlak deri */
    b.rect(8, -6, 1, 5, '#c9b183'); b.rect(-6, -6, 14, 1, '#c9b183'); b.rect(-6, -6, 1, 3, '#c9b183');   /* ip */
    b.outline(0.55);
  });
}
function moneySpr() {
  return L.sprite('mn|' + G().K, function (b) {
    for (var s = 2; s >= 0; s--) {
      var y0 = -6 + s * 2;
      b.rect(-10, y0, 20, 8, s === 0 ? '#2f7d4a' : '#276b3f');
      b.rect(-10, y0, 20, 1, s === 0 ? '#5fd37a' : '#3f9a5a');
    }
    b.rect(-9, -5, 18, 6, '#38905a'); b.rect(-9, -5, 18, 1, '#6fdc8a');
    b.rect(-3, -4, 6, 4, '#d8e9d8'); b.rect(-2, -3, 4, 2, '#9fc9a8'); b.set(-3, -4, '#f4fbf4');
    b.rect(-8, -4, 2, 1, '#a8e0b8'); b.rect(6, -2, 2, 1, '#a8e0b8');
    b.rect(5, -6, 2, 12, '#a83d2b'); b.rect(5, -6, 1, 12, '#c8553d');
    b.outline(0.55);
  });
}
function crateIconSpr() {
  return L.sprite('cri|' + G().K, function (b) {
    b.rect(-14, -18, 28, 6, '#a9743f'); b.rect(-14, -18, 28, 1, '#d29a5c'); b.rect(-14, -13, 28, 1, '#7d5228');
    b.rect(-14, -12, 28, 12, '#8a5a2e'); for (var y = -12; y < 0; y += 4) b.rect(-14, y, 28, 1, '#6d4522');
    b.rect(-14, -12, 2, 12, '#a9743f'); b.rect(12, -12, 2, 12, '#5d3c1c'); b.rect(-14, -8, 28, 1, '#5d3c1c');
    b.outline(0.55);
  });
}
/* v2.19-deneme: lokanta tabağı (it.k 'plate', it.d tarif) ve kirli tabak (it.k 'dirty').
   Klasik drawLokPlateItem çapası: tabak (x-4..x+4, y-3..y+1) sanat px → ince -8..8, -6..2 */
var LK_TC = null;
function lkCol(d) { if (!LK_TC) LK_TC = G().v('TARIF_COL') || {}; return LK_TC[d] || '#d39a45'; }
function plateBase(b, dirty) {
  var top = dirty ? '#e2dccb' : '#f1ece0', lo = dirty ? '#aaa290' : '#bdb4a3';
  b.ellipse(0, -2, 8, 3, top);
  for (var x = -8; x <= 8; x++) { var e = Math.round(3 * Math.sqrt(Math.max(0, 1 - x * x / 70))); b.set(x, -2 - e, dirty ? '#eeeadf' : '#fffdf6'); b.set(x, -2 + e, lo); if (e > 1 && Math.abs(x) > 4) b.set(x, -2 - e + 1, dirty ? '#a9b4bb' : '#9fb7c8'); }
  b.rect(-5, 2, 10, 1, '#8a8274');
}
function plateFood(b, d) {
  var c = lkCol(d), cl = lite(c, 0.3), cd = dark(c, 0.22), i;
  if (d === 'hamsitava') {                          /* yelpaze dizili kızarmış hamsi + limon */
    for (i = 0; i < 4; i++) { var y = -5 + (i & 1), x0 = -6 + i * 2; b.rect(x0, y, 5, 1, '#e0a850'); b.rect(x0, y + 1, 5, 1, '#b8782e'); b.set(x0 + 4, y, '#5a3a1a'); }
    b.rect(4, -4, 2, 2, '#f0d84a'); b.set(4, -4, '#fff4a0'); b.set(-6, -2, '#4f8a3a');
  } else if (d === 'hamsipilav') {                  /* kubbe pilav, gümüş hamsi yorgan */
    b.ellipse(0, -4, 5, 2, '#efe6cf');
    for (i = -4; i <= 4; i++) { b.set(i, -5, (i & 1) ? '#8fa9bd' : '#5f7f95'); if (Math.abs(i) < 3) b.set(i, -6, '#c9d6de'); }
  } else if (d === 'karalahana') {                  /* toprak kâse, koyu yeşil çorba */
    b.rect(-4, -5, 8, 3, '#8a5a32'); b.rect(-4, -5, 8, 1, '#a06a3a'); b.rect(-3, -5, 6, 1, '#2f5136'); b.set(-1, -5, '#ffc94a'); b.set(2, -5, '#4f7a4f');
  } else if (d === 'uskumrudolma') {                /* dolma uskumru */
    b.rect(-5, -5, 9, 2, '#2f5f5a'); b.rect(-5, -4, 9, 1, '#7fb0aa'); b.rect(-3, -3, 5, 1, '#efe6cf'); b.set(4, -5, '#16222b'); b.set(-6, -5, '#4a7a75'); b.set(-6, -3, '#4a7a75');
  } else if (d === 'levrekbugulama') {              /* domates sos, beyaz levrek */
    b.ellipse(0, -3, 5, 2, '#c0392b'); b.rect(-3, -5, 6, 2, '#eaf2f7'); b.rect(-3, -5, 6, 1, '#ffffff'); b.set(4, -3, '#4f8a3a'); b.set(-4, -3, '#7b3f7a');
  } else if (d === 'orkinosizgara') {               /* ızgara orkinos, tereyağı */
    b.rect(-4, -5, 8, 3, '#b8453f'); b.rect(-4, -5, 8, 1, '#d0605a'); b.set(-2, -4, '#5e1e1a'); b.set(1, -4, '#5e1e1a'); b.set(3, -3, '#5e1e1a'); b.rect(-1, -6, 2, 1, '#ffe08a');
  } else if (d === 'palamutpilaki') {               /* turuncu sos, palamut parçaları */
    b.ellipse(0, -3, 5, 2, '#d8743a'); b.rect(-3, -4, 2, 1, '#e0a090'); b.rect(1, -4, 2, 1, '#e0a090'); b.set(-3, -5, '#5a6a80'); b.set(1, -5, '#5a6a80'); b.set(3, -3, '#4f8a3a');
  } else if (d === 'reisguveci') {                  /* küçük toprak güveç */
    b.rect(-4, -6, 8, 4, '#9a4a28'); b.rect(-4, -6, 8, 1, '#d8743a'); b.rect(-3, -6, 2, 1, '#f0a15a'); b.rect(-5, -5, 1, 2, '#7d3a1e'); b.rect(4, -5, 1, 2, '#7d3a1e'); b.set(1, -6, '#4f8a3a');
  } else {                                          /* bilinmeyen tarif: renkli tepe */
    b.ellipse(0, -4, 5, 2, c); b.rect(-3, -6, 5, 1, cl); b.rect(-4, -3, 8, 1, cd); b.set(3, -5, '#4f8a3a');
  }
}
function plateSpr(d) {
  return L.sprite('lkpl|' + d + '|' + G().K, function (b) { plateBase(b, false); plateFood(b, d); b.outline(0.55); });
}
function dirtySpr() {
  return L.sprite('lkdi|' + G().K, function (b) {
    plateBase(b, true);
    b.rect(-5, -3, 3, 1, '#a07a4a'); b.rect(1, -2, 4, 1, '#b8885a'); b.set(-1, -4, '#b8453f'); b.set(3, -4, '#8a6a3a');   /* sos lekesi, kırıntı */
    b.rect(-3, -4, 6, 1, '#f4f0e6'); b.set(-2, -5, '#d8d2c4'); b.set(0, -5, '#d8d2c4'); b.set(2, -5, '#d8d2c4'); b.set(-4, -4, '#cfc8b8');   /* kılçık */
    b.outline(0.55);
  });
}
function itemSpr(it) {
  if (it.k === 'plate') return plateSpr(it.d);
  if (it.k === 'dirty') return dirtySpr();
  if (it.k === 'fish') return fishSpr(it.f);
  if (it.k === 'fileto' && it.dish && DISH_IDS[it.dish]) return dishSprT(it.dish);   /* v2.18-deneme: ocakta pişmiş yemek */
  if (it.k === 'fileto' && FISHT(it.f).dish) return dishSpr(Math.floor(T() * 3) % 2);
  if (it.k === 'fileto') return filetoSpr(it.f);
  if (it.k === 'fume') return fumeSpr(it.f);
  return moneySpr();
}
function drawIt(it, x, y) { if (it) L.blit(itemSpr(it), R(x), R(y)); }
HKA.drawFishItem = function (x, y, f) { L.blit(fishSpr(f), R(x), R(y)); };
HKA.drawFiletoItem = function (x, y, f) { L.blit(filetoSpr(f), R(x), R(y)); };
HKA.drawDishItem = function (x, y) { L.blit(dishSpr(Math.floor(T() * 3) % 2), R(x), R(y)); };
HKA.drawFumeItem = function (x, y, f) { L.blit(fumeSpr(f), R(x), R(y)); };
HKA.drawMoneyItem = function (x, y) { L.blit(moneySpr(), R(x), R(y)); };
HKA.drawItem = function (it, x, y) { drawIt(it, x, y); };
HKA.drawCrateIcon = function (x, y, it) { L.blit(crateIconSpr(), R(x), R(y)); drawIt(it, x, y - 12); };
HKA.drawStack = function (x, y, items, baseZ, gap) {
  var n = items.length; if (!n) return;
  gap = gap || 3.4;
  var sx = pX(x, y);
  if (n >= 20) {
    HKA.drawCrateIcon(sx, pY(x, y, baseZ + 6), items[n - 1]);
    gf('uiBadge')(x, y, baseZ + 22, 'x' + n);
    return;
  }
  var show = Math.min(n, 5);
  for (var i = 0; i < show; i++) drawIt(items[n - show + i], sx, pY(x, y, baseZ + i * gap));
  if (n > show) gf('uiBadge')(x, y, baseZ + show * gap + 7, 'x' + n);
};

/* ilerleme çubuğu (ince, köşesi kırık) */
function bar(ax, ay, w, pr, col) {
  var K = G().K, W = w * K, Hh = 3 * K;
  L.fr(ax, ay, 1, 0, W - 2, Hh, '#0a1a27'); L.fr(ax, ay, 0, 1, W, Hh - 2, '#0a1a27');
  var f = Math.round((W - 2) * clamp(pr, 0, 1));
  if (f > 0) { L.fr(ax, ay, 1, 1, f, Hh - 2, col); L.fr(ax, ay, 1, 1, f, 1, lite(col, 0.35)); L.fr(ax, ay, 1, Hh - 2, f, 1, dark(col, 0.25)); }
}
/* hasır tepsi (kesim/füme/mutfak hasırı): örgü kenar + yağlı kâğıt */
function matSpr(paper) {
  return spr('mat|' + paper + '|' + G().K, 0, 0, function (b) {
    quadW(b, -0.62, -0.52, 1.24, 1.04, 0.4, function (X, Y) { return ((X >> 1) + (Y >> 1)) % 2 ? '#b8924f' : '#a07c40'; });
    quadW(b, -0.48, -0.4, 0.96, 0.8, 0.9, function (X, Y) { return hash(X >> 2, Y >> 1) > 0.85 ? dark(paper, 0.05) : paper; });
    hl(b, -0.48, -0.4, 0.48, -0.4, 0.9, lite(paper, 0.4));
    b.outline(0.5);
  });
}

/* =====================================================================
   3) İSTASYONLAR
   ===================================================================== */
/* --- AĞ NOKTASI: babaya oturmuş ağ makarası, suya uzanan ağ, mantar şamandıralar, ağ sandığı, hasır sepet --- */
function netSpr(face, fr) {
  return spr('net|' + face + '|' + fr + '|' + G().K, 0, 0, function (b) {
    var ph = fr / 12 * Math.PI * 2, ex = face === 'n' ? 0.2 : -3.0, ey = face === 'n' ? -3.0 : 0.2;
    /* denizdeki ağ: göz göz örgü + mantar halkası */
    var c0 = P3(ex - 0.8, ey - 0.8, 0), c1 = P3(ex + 0.8, ey - 0.8, 0), c2 = P3(ex + 0.8, ey + 0.8, 0), c3 = P3(ex - 0.8, ey + 0.8, 0);
    poly(b, [c0, c1, c2, c3], function (X, Y) {
      var u = (X - Y * 2), v = (X + Y * 2);
      if (((u % 6) + 6) % 6 === 0 || ((v % 6) + 6) % 6 === 0) return { c: '#e8f6fb', a: 0.6 };
      return { c: '#dff0f8', a: 0.16 };
    });
    for (var q = 0; q < 8; q++) {
      var a = q / 8 * Math.PI * 2, px0 = ex + Math.cos(a) * 0.72, py0 = ey + Math.sin(a) * 0.72, X0 = fx(px0, py0), Y0 = fy(px0, py0, 0) + R(Math.sin(ph + q) * 1);
      b.rect(X0 - 1, Y0 - 1, 3, 2, q % 2 ? '#e05a3a' : '#f0e6cc'); b.set(X0 - 1, Y0 - 1, '#fff4dc');
    }
    /* makaradan suya ip */
    var sx0 = 0, sy0 = -24 * KK, sx1 = fx(ex, ey), sy1 = fy(ex, ey, 2);
    var cxp = (sx0 + sx1) / 2, cyp = fy((ex) / 2, (ey) / 2, 34 + Math.sin(ph) * 4);
    var n = 70, prev = null;
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = (1 - t) * (1 - t) * sx0 + 2 * (1 - t) * t * cxp + t * t * sx1, y = (1 - t) * (1 - t) * sy0 + 2 * (1 - t) * t * cyp + t * t * sy1;
      var X = R(x), Y = R(y);
      if (prev && prev[0] === X && prev[1] === Y) continue;
      b.set(X, Y, '#ece6c4'); b.set(X, Y + 1, { c: '#6a6040', a: 0.35 }.c, 0.35); prev = [X, Y];
    }
    /* iki mantar şamandıra */
    for (var f = 1; f <= 2; f++) {
      var tt = f / 3, mx = ex * tt, my = ey * tt, fz = 20 + Math.sin(ph + f) * 3, X1 = R(fx(mx, my)), Y1 = R(fy(mx, my, fz));
      var cc = f % 2 ? '#c8402c' : '#f0e6cc';
      b.rect(X1 - 2, Y1 - 2, 5, 5, cc); b.rect(X1 - 3, Y1 - 1, 7, 3, cc); b.set(X1 - 1, Y1 - 2, lite(cc, 0.4)); b.rect(X1 - 2, Y1 + 2, 5, 1, dark(cc, 0.3));
    }
  });
}
function reelSpr(sp) {
  return L.sprite('reel|' + sp + '|' + G().K, function (b) {
    /* baba: yuvarlak ahşap direk + sarılı halat */
    for (var x = -7; x <= 7; x++) {
      var t = (x + 7) / 14, c = t < 0.2 ? '#d2a066' : t < 0.55 ? '#ab7a48' : t < 0.85 ? '#8a5a32' : '#6f4526';
      for (var y = -30; y < 0; y++) b.set(x, y, (y % 6 === 0 && hash(x, y) > 0.5) ? dark(c, 0.12) : c);
    }
    for (var x2 = -6; x2 <= 6; x2++) b.set(x2, -31, x2 < 0 ? '#e0b070' : '#c99558');
    for (var r = 0; r < 3; r++) for (var x3 = -8; x3 <= 8; x3++) {                    /* halat sargısı */
      var yy = -22 + r * 2, tw = ((x3 + r * 2) % 4 + 4) % 4;
      b.set(x3, yy, tw < 2 ? '#d9c290' : '#b39a64'); b.set(x3, yy + 1, tw < 2 ? '#b39a64' : '#8a744a');
    }
    /* makara: yan diskler + sarılı ağ + mil */
    var top = -50, h = 18;
    for (var s2 = 0; s2 < 2; s2++) {
      var dx = s2 ? 11 : -14;
      b.rect(dx, top, 3, h, s2 ? '#6f4526' : '#8a5a32'); b.rect(dx, top, 3, 1, '#c9975f'); b.rect(dx + (s2 ? 2 : 0), top + 1, 1, h - 1, s2 ? '#4f3220' : '#a8733f');
    }
    for (var yy2 = top + 2; yy2 < top + h - 1; yy2++) for (var xx = -11; xx <= 10; xx++) {
      var m = ((xx + yy2 + (sp === 9 ? 0 : sp)) % 4 + 4) % 4, m2 = ((xx - yy2) % 4 + 4) % 4;
      var c2 = (m === 0 || m2 === 0) ? '#b8a878' : '#e4d8b0';
      if (yy2 < top + 4) c2 = lite(c2, 0.15); if (yy2 > top + h - 4) c2 = dark(c2, 0.15);
      b.set(xx, yy2, c2);
    }
    b.rect(-17, top + 7, 3, 4, '#5d666e'); b.rect(14, top + 7, 3, 4, '#5d666e'); b.set(-17, top + 7, '#8b949c'); b.set(14, top + 7, '#8b949c');
    b.rect(-12, top + h - 1, 3, 20 - h + 4, '#6f4526'); b.rect(9, top + h - 1, 3, 20 - h + 4, '#5a3a20');           /* ayaklar */
    b.outline(0.55);
  });
}
function spotCrateSpr() {
  return spr('scrate|' + G().K, 0, 0, function (b) {
    var netTop = function (u, v) {
      if (u < 0.8 || v < 0.8 || u > 14.1 || v > 10.6) return u < 0.8 || v < 0.8 ? '#e0b070' : '#b27744';
      var a = Math.floor(u * 1.4), bb = Math.floor(v * 1.4), c = (a + bb) % 2 ? '#3f6b52' : '#5f8a6a';
      return hash(a, bb) > 0.82 ? lite(c, 0.12) : c;
    };
    var slat = function (base, dk) { return function (s, z) { return (Math.floor(z * 0.8) % 3 === 0) ? dk : (s < 0.7 ? lite(base, 0.15) : base); }; };
    box(b, -0.62, 0.42, 1.24, 0.95, 0, 6, netTop, slat('#b27744', '#7a4a28'), slat('#8f5a32', '#55331b'));
    /* hasır sepet (yanında) */
    var bx = R(fx(0.9, 0.2)), by = R(fy(0.9, 0.2, 0));
    for (var y = -12; y < 0; y++) for (var x = -8; x < 8; x++) {
      if (y === -12 && (x < -7 || x > 6)) continue;
      var c = ((x + (y >> 1)) % 3 === 0) ? '#96763f' : ((y & 1) ? '#b8924f' : '#c9a35e');
      if (y < -10) c = '#d6b174';
      b.set(bx + x, by + y, c);
    }
    b.rect(bx - 6, by - 13, 3, 2, '#9fb0b8'); b.rect(bx + 1, by - 14, 4, 2, '#8fa9bd');                       /* kuyruklar */
    b.outline(0.55);
  });
}
HKA.drawSpot = function (s) {
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0)), t = T();
  var busy = s.stock.length < gf('areaStock')(s.z);
  var fr = ((Math.floor(t * 1.1 / (Math.PI * 2) * 12) % 12) + 12) % 12;
  L.blit(netSpr(s.face, fr), sx, sy);
  var sp = busy ? (((R(Math.sin(t * 2.2) * 2.4) % 4) + 4) % 4) : 9;
  L.blit(reelSpr(sp), sx, sy);
  L.blit(spotCrateSpr(), sx, sy);
  gf('drawStack')(s.x, s.y + 0.9, s.stock, 6, 3.2);
  gf('labelAt')(s.x, s.y + 1.8, 30, gf('T')('stNet') + ' ' + s.stock.length, '#bfe9ff', '' + s.stock.length);
};

/* --- KESİM MASASI: mermer üstlü ahşap tezgâh, zeytin kütüğü, bıçak askısı; satır iner kalkar --- */
function marbleTop(W, D) {
  return function (u, v) {
    if (u < 0.7 || v < 0.7) return '#fbf8f0';
    if (u > W - 0.8 || v > D - 0.8) return '#c9c1ae';
    var vein = Math.abs(Math.sin(u * 0.35 + v * 0.9) + Math.sin(u * 0.11 - v * 0.4) * 0.6);
    if (vein < 0.06) return '#bdb4a0';
    return hash(Math.floor(u * 1.5), Math.floor(v * 1.5)) > 0.9 ? '#e6dfcf' : '#eee8db';
  };
}
function tableSpr() {
  return spr('table|' + G().K, 0, 0, function (b) {
    var X0 = -0.72, Y0 = -0.52, Wd = 1.44, Dp = 1.04;
    [[X0 + 0.06, Y0 + 0.06], [X0 + Wd - 0.12, Y0 + 0.06], [X0 + 0.06, Y0 + Dp - 0.12], [X0 + Wd - 0.12, Y0 + Dp - 0.12]].forEach(function (q, k) {
      box(b, q[0], q[1], 0.08, 0.08, 0, 6, '#6f4526', '#7a4e2a', '#5a3a20', { norim: 1 });
    });
    hl(b, X0 + 0.1, Y0 + Dp - 0.08, X0 + Wd - 0.1, Y0 + Dp - 0.08, 1.5, '#6f4526');       /* alt kiriş */
    box(b, X0, Y0, Wd, Dp, 6, 11, marbleTop(Wd * 12, Dp * 12), woodV('#8a5a32', 5), woodV('#704626', 5));
    /* bıçak askısı (arka kenar) */
    wall(b, X0 + 0.1, Y0 + 0.02, X0 + 0.7, Y0 + 0.02, 11, 18, woodH('#7a4e2a', 3));
    vl(b, X0 + 0.25, Y0 + 0.02, 12, 17, '#cfd8de'); vl(b, X0 + 0.32, Y0 + 0.02, 12, 16, '#e8eef2');
    vl(b, X0 + 0.5, Y0 + 0.02, 11, 16, '#cfd8de'); vl(b, X0 + 0.56, Y0 + 0.02, 12, 15, '#9aa8b2');
    /* zeytin kütüğü (kesme bloğu) */
    var cx = R(fx(-0.05, 0)), cy = R(fy(-0.05, 0, 11));
    for (var y = -10; y <= -4; y++) for (var x = -9; x <= 8; x++) {
      if (y < -8) { var e = (x + 0.5) * (x + 0.5) / 81 + (y + 9) * (y + 9) / 2.2; if (e > 1) continue; }
      var c = y < -7 ? ((Math.abs(x) + Math.abs(y + 9) * 3) % 4 === 0 ? '#a07a46' : '#d2a868') : (x < -5 ? '#9a7340' : x > 5 ? '#6e5230' : ((x + y) % 5 === 0 ? '#6e5230' : '#8a6438'));
      b.set(cx + x, cy + y, c);
    }
    b.outline(0.55);
  });
}
function cleaverSpr(up) {
  return L.sprite('clv|' + up + '|' + G().K, function (b) {
    b.rect(10, -18, 3, 12, '#5a4630'); b.rect(10, -18, 1, 12, '#7a6040');
    b.rect(6, -26, 12, 8, '#d8e2ea'); b.rect(6, -26, 12, 1, '#f7fbfd'); b.rect(6, -19, 12, 1, '#9aa8b2'); b.rect(15, -25, 2, 2, '#9aa8b2');
    b.outline(0.55);
  });
}
HKA.drawTable = function (tb) {
  var sx = R(pX(tb.x, tb.y)), sy = R(pY(tb.x, tb.y, 11)), t = T();
  L.blit(tableSpr(), R(pX(tb.x, tb.y)), R(pY(tb.x, tb.y, 0)));
  var chop = tb.cur ? (gf('phase2')(t, tb.worker ? 7 : 4.5) ? 1 : 0) : 0;
  if (tb.cur && chop && !tb._ch) gf('sfx').chop();
  tb._ch = chop;
  if (tb.cur) drawIt(tb.cur, sx - 2, sy - 5);
  L.blit(cleaverSpr(chop), sx, sy - chop * 4);
  if (tb.cur) {
    if (chop) { L.fr(sx, sy, 2, -14, 2, 2, '#f4f0e4'); L.fr(sx, sy, 6, -16, 2, 2, '#f4f0e4'); L.fr(sx, sy, -1, -15, 1, 1, '#ffffff'); }
    var pr = clamp(tb.t / G().FISH[tb.cur.f].cut, 0, 1);
    bar(sx - 9, sy - 18, 18, pr, '#5fd37a');
  }
  gf('drawStack')(tb.x - 0.25, tb.y + 0.1, tb.inn, 11, 3.2);
  var tfn = gf('tableFishNames')(tb), Tt = gf('T');
  gf('labelAt')(tb.x, tb.y + 1.15, 24, (tfn.length ? Tt('tableFor', { n: tfn.join(', ') }) : Tt('tableAny')) + (tb.worker ? ' ★' : ''), '#ffe6bf', tb.inn.length ? '' + tb.inn.length : '');
  at(matSpr('#efe6d2'), tb.mat.x, tb.mat.y, 0);
  if (gf('tableTypes')(tb) > 1) {
    var lineLive = gf('lineLive');
    var fl = gf('zoneFish')(tb.z).filter(function (f) { return lineLive(f); });
    for (var pi = 0; pi < fl.length; pi++) {
      var ofs = (pi - (fl.length - 1) / 2) * 0.34;
      gf('drawStack')(tb.mat.x + ofs, tb.mat.y + ofs * 0.8, tb.mat.items.filter(function (it) { return it.f === fl[pi]; }), 2.4, 3.2);
    }
  } else gf('drawStack')(tb.mat.x, tb.mat.y, tb.mat.items, 2.4, 3.2);
};

/* --- FÜMEHANE: taş ocak (önde kemerli ateş ağzı), çinko baca, kiremit saçaklı tütsü rafı --- */
function smokerSpr() {
  return spr('smoker|' + G().K, 0, 0, function (b) {
    var X0 = -0.8, Y0 = -0.65, Wd = 1.6, Dp = 1.3;
    box(b, X0, Y0, Wd, Dp, 0, 14, function (u, v) { return (u < 0.7 || v < 0.7) ? '#e6dac0' : ((Math.floor(u / 4) + Math.floor(v / 4)) % 2 ? '#cdbfa2' : '#c2b295'); }, stoneW('#b8a888'), stoneW('#a5977c'));
    /* ateş ağzı (ön/sol yüz): kemer */
    wall(b, -0.42, Y0 + Dp, 0.22, Y0 + Dp, 1, 9, '#2e2119');
    for (var k = 0; k < 5; k++) hl(b, -0.42 + k * 0.03, Y0 + Dp, 0.22 - k * 0.03, Y0 + Dp, 9 + k * 0.6, '#7d6f55');
    /* raf direkleri + kiremit saçak */
    vl(b, X0 + 0.15, Y0 + Dp - 0.1, 14, 27, '#6f4526', 2); vl(b, X0 + Wd - 0.15, Y0 + Dp - 0.1, 14, 27, '#5a3a20', 2);
    vl(b, X0 + 0.15, Y0 + 0.15, 14, 27, '#6f4526', 2);
    hl(b, X0 + 0.15, Y0 + Dp - 0.1, X0 + Wd - 0.15, Y0 + Dp - 0.1, 24, '#6f4526');
    /* baca (arka) */
    var bx = R(fx(0.35, -0.35)), by = R(fy(0.35, -0.35, 14));
    for (var y = -42; y < 0; y++) for (var x = -5; x <= 5; x++) b.set(bx + x, by + y, x < -2 ? '#b8c0c8' : x < 2 ? '#8d959b' : '#6c747a');
    for (var r = -42; r < 0; r += 10) b.rect(bx - 5, by + r, 11, 1, '#5a6167');
    b.rect(bx - 7, by - 46, 15, 4, '#5a6167'); b.rect(bx - 7, by - 46, 15, 1, '#8d959b');
    roofPlane(b, [[X0 - 0.08, Y0 + 0.05, 30], [X0 + Wd + 0.08, Y0 + 0.05, 30], [X0 + Wd + 0.08, Y0 + Dp + 0.12, 25], [X0 - 0.08, Y0 + Dp + 0.12, 25]], '#b5432f', '#7d2c1d', 4);
    b.outline(0.55);
  });
}
function hangFishSpr(fr) {
  return spr('hfish|' + fr + '|' + G().K, 0, 0, function (b) {
    var X0 = -0.8, Y0 = -0.65, Dp = 1.3;
    for (var h = 0; h < 4; h++) {
      var x = X0 + 0.3 + h * 0.33, y = Y0 + Dp - 0.1, X = R(fx(x, y)), Y = R(fy(x, y, 24)), sw = R(Math.sin(fr / 4 * Math.PI * 2 + h) * 1.2);
      b.rect(X, Y, 1, 5, '#8d6a40');
      for (var j = 0; j < 9; j++) { var w = j < 2 ? 1 : j > 6 ? 1 : 2; b.rect(X + sw - w + 1, Y + 5 + j, w * 2, 1, j < 3 ? '#e0a45a' : j > 6 ? '#8a5228' : '#c9863c'); }
    }
  });
}
function fireSpr(fr, w) {
  return L.sprite('fire|' + fr + '|' + w + '|' + G().K, function (b) {
    for (var x = -w; x <= w; x++) {
      var h = 3 + R((Math.sin(x * 1.7 + fr * 2.1) + 1) * 2) - Math.abs(x) * 0.5;
      for (var y = 0; y < h; y++) b.set(x, -y, y > h - 2 ? '#ffe9a0' : y > h * 0.5 ? '#ffb040' : '#e8622b');
    }
  });
}
function puffSpr(sz) {
  return L.sprite('puf|' + sz + '|' + G().K, function (b) {
    for (var y = -sz; y <= sz; y++) for (var x = -sz; x <= sz; x++) { var q = x * x + y * y; if (q > sz * sz + sz * 0.6) continue; b.set(x, y, q < sz * sz * 0.35 && x < 1 && y < 1 ? '#ffffff' : '#e8e2d8'); }
  });
}
HKA.drawSmoker = function () {
  var s = gv('smoker'), t = T(), sx = R(pX(s.x, s.y)), sy0 = R(pY(s.x, s.y, 0)), sy = R(pY(s.x, s.y, 14));
  L.blit(smokerSpr(), sx, sy0);
  var mouthX = R(pX(-0.1 + s.x, s.y + 0.65)), mouthY = R(pY(-0.1 + s.x, s.y + 0.65, 1));
  L.blit(fireSpr(Math.floor(t * 7) % 3, 5), mouthX, mouthY);
  L.blit(hangFishSpr(Math.floor(t * 1.4 / (Math.PI * 2) * 4 * 2) % 4), sx, sy0);
  if (s.cur) {
    var bx = R(pX(s.x + 0.35, s.y - 0.35)), by = R(pY(s.x + 0.35, s.y - 0.35, 14)) - 23;
    for (var i = 0; i < 4; i++) { var q = (t * 0.45 + i * 0.25) % 1; L.blit(puffSpr(2 + R(q * 3)), bx + R(Math.sin(q * 5 + i) * 5), by - R(q * 24), (1 - q) * 0.5); }
    bar(sx - 9, sy - 34, 18, clamp(s.t / gv('FUME_TIME'), 0, 1), '#ffc94a');
  }
  gf('drawStack')(s.x + 0.4, s.y + 0.3, s.inn, 14, 3.2);
  gf('labelAt')(s.x, s.y + 1.5, 40, gf('T')('stSmoke'), '#ffd3a0', s.inn.length ? '' + s.inn.length : '');
  at(matSpr('#e6d5b8'), s.mat.x, s.mat.y, 0);
  gf('drawStack')(s.mat.x, s.mat.y, s.mat.items, 2.4, 3.2);
};

/* --- MUTFAK OCAĞI: taş tezgâh, çini arka duvar, raf + kavanozlar, iki göz ocak, bakır tencere, güveç, davlumbaz --- */
function kitchenSpr() {
  return spr('kitchen|' + G().K, 0, 0, function (b) {
    var X0 = -0.8, Y0 = -0.6, Wd = 1.6, Dp = 1.2;
    wall(b, X0, Y0, X0 + Wd, Y0, 11, 26, function (X, Y) { var a = ((X >> 2) + (Y >> 2)) % 2; return (X % 4 === 0 || Y % 4 === 0) ? '#c8d2d8' : a ? '#eef3f6' : '#e2eaef'; });
    for (var t = 0; t < 4; t++) wall(b, X0 + 0.1 + t * 0.4, Y0, X0 + 0.3 + t * 0.4, Y0, 15, 19, t % 2 ? '#1f6fae' : '#1f8fbf');
    wall(b, X0, Y0, X0 + Wd, Y0, 22, 23.5, woodH('#7a4e2a', 2));
    var rx = R(fx(X0 + 0.3, Y0)), ry = R(fy(X0 + 0.3, Y0, 23.5));
    b.rect(rx - 2, ry - 6, 6, 6, '#c9863c'); b.rect(rx - 2, ry - 6, 6, 1, '#e8b070'); b.rect(rx + 8, ry - 8, 4, 8, '#e8d24a'); b.rect(rx + 8, ry - 9, 4, 1, '#8a6a2a'); b.rect(rx + 16, ry - 6, 6, 6, '#9a4a28'); b.rect(rx + 16, ry - 6, 6, 1, '#c86a40');
    box(b, X0, Y0, Wd, Dp, 0, 11, function (u, v) { return (u < 0.7 || v < 0.7) ? '#efe6d0' : ((Math.floor(u / 5) + Math.floor(v / 5)) % 2 ? '#ded1b6' : '#d4c6a8'); }, stoneW('#b0a07f'), stoneW('#cbbc9e'));
    var sx = R(fx(0, 0)), sy = R(fy(0, 0, 11));
    b.rect(sx - 18, sy - 4, 14, 6, '#2e2119'); b.rect(sx + 4, sy - 4, 14, 6, '#2e2119'); b.rect(sx - 17, sy - 3, 12, 1, '#4a3a30'); b.rect(sx + 5, sy - 3, 12, 1, '#4a3a30');
    /* bakır tencere */
    b.rect(sx - 20, sy - 16, 18, 12, '#b8733a'); b.rect(sx - 20, sy - 16, 18, 2, '#e0a060'); b.rect(sx - 20, sy - 14, 3, 10, '#d08a4a'); b.rect(sx - 5, sy - 14, 3, 10, '#8a5228');
    b.rect(sx - 22, sy - 12, 2, 4, '#8a5228'); b.rect(sx - 2, sy - 12, 2, 4, '#8a5228'); b.rect(sx - 19, sy - 17, 16, 1, '#6e3f1e');
    /* toprak güveç */
    b.rect(sx + 4, sy - 12, 16, 8, '#9a4a28'); b.rect(sx + 4, sy - 14, 16, 2, '#d8743a'); b.rect(sx + 6, sy - 16, 12, 2, '#b8623a'); b.rect(sx + 4, sy - 12, 2, 8, '#b05a32');
    /* davlumbaz */
    var hz = R(fy(0, -0.2, 34));
    b.rect(sx - 24, hz + 4, 48, 6, '#8d959b'); b.rect(sx - 24, hz + 4, 48, 1, '#b8c0c8'); b.rect(sx - 18, hz - 2, 36, 6, '#6c747a'); b.rect(sx - 6, hz - 16, 12, 14, '#5a6167'); b.rect(sx - 6, hz - 16, 3, 14, '#7d868d');
    b.outline(0.55);
  });
}
HKA.drawKitchen = function () {
  var s = gv('kitchen'), t = T(), sx = R(pX(s.x, s.y)), sy0 = R(pY(s.x, s.y, 0)), sy = R(pY(s.x, s.y, 11));
  L.blit(kitchenSpr(), sx, sy0);
  if (s.cur) {
    var f = Math.floor(t * 8) % 3, fc = ['#5aa0ff', '#8ac0ff', '#3a80e8'][f];
    L.fr(sx, sy, -34, -6, 24, 2, fc); L.fr(sx, sy, 10, -6, 24, 2, fc); L.fr(sx, sy, -30 + f * 2, -7, 4, 1, '#d0e8ff'); L.fr(sx, sy, 14 + f * 2, -7, 4, 1, '#d0e8ff');
    for (var i = 0; i < 4; i++) { var q = (t * 0.5 + i * 0.25) % 1; L.blit(puffSpr(1 + R(q * 2)), sx - 6 + (i % 2) * 11 + R(Math.sin(q * 5 + i) * 2), sy - 10 - R(q * 14), (1 - q) * 0.5); }
    bar(sx - 9, sy - 40, 18, clamp(s.t / gv('COOK_TIME'), 0, 1), '#ffc94a');
  }
  gf('drawStack')(s.x + 0.6, s.y + 0.45, s.inn, 11, 2.0);
  var pl = G().player, Tt = gf('T');
  gf('labelAt')(s.x, s.y + 0.4, 30, Tt('stKitchen'), '#ffd3a0', s.inn.length ? '' + s.inn.length : '');
  if (d2(pl.x, pl.y, s.x, s.y) < 9) gf('uiLabel')(s.x, s.y + 0.4, 38, Tt('kitchenIng'), '#f4efe6', 0.9);
  at(matSpr('#e6d5b8'), s.mat.x, s.mat.y, 0);
  gf('drawStack')(s.mat.x, s.mat.y, s.mat.items, 2.4, 3.2);
};

/* --- FÜME MAKİNESİ (tezgâh yanında küçük taş tütsü fırını) --- */
function fumeMachSpr(on) {
  return spr('fmach|' + on + '|' + G().K, 0, 0, function (b) {
    box(b, -0.35, -0.35, 0.7, 0.7, 0, 14, '#9a9488', stoneW('#7a7468'), stoneW('#8a8478'));
    var sx = 0, sy = R(fy(0, 0, 14));
    b.rect(sx - 3, sy - 16, 6, 16, '#4a4540'); b.rect(sx - 3, sy - 16, 2, 16, '#6a645c'); b.rect(sx - 5, sy - 18, 10, 3, '#5f5a50');
    var wx = R(fx(0, 0.35)), wy = R(fy(0, 0.35, 7));
    b.rect(wx - 5, wy - 2, 10, 5, '#2a2622'); b.rect(wx - 4, wy - 1, 8, 3, on ? '#e8762b' : '#3a3530'); if (on) b.rect(wx - 3, wy - 1, 6, 1, '#ffc060');
    b.outline(0.55);
  });
}
HKA.drawFumeMachine = function (c) {
  var fp = gf('fumePos')(c), t = T();
  at(fumeMachSpr(c.fmOn ? 1 : 0), fp.x, fp.y, 0);
  if (c.fmOn && Math.sin(t * 3 + c.x) > 0.2) { var sx = R(pX(fp.x, fp.y)), sy = R(pY(fp.x, fp.y, 14)); L.blit(puffSpr(2), sx + R(Math.sin(t * 2) * 2), sy - 14 - R((t * 8) % 6), 0.5); }
};

/* --- PAZAR TEZGÂHI: buz yataklı ahşap tezgâh, müşteriye bakan yüzde kilim etek, 4 direkli çizgili tente + saçak --- */
function counterSpr(hasFish, closed) {
  var lang = closed ? G().v('lang') : '';
  return spr('ctr|' + hasFish + '|' + closed + '|' + lang + '|' + G().K, 0, 0, function (b) {
    var X0 = -0.58, Y0 = -1.05, Wd = 1.16, Dp = 2.1, X1 = X0 + Wd, Y1 = Y0 + Dp, ZT = 12;
    var ice = function (u, v) {
      if (u < 1.2 || v < 1.2 || u > Wd * 12 - 1.2 || v > Dp * 12 - 1.2) return (u < 0.7 || v < 0.7) ? '#e0b070' : '#a8723e';
      var a = Math.floor(u * 0.9), bb = Math.floor(v * 0.9), k = (a * 3 + bb * 5) % 7;
      return k === 0 ? '#ffffff' : k < 3 ? '#eaf6fb' : k < 5 ? '#cfe6f2' : '#aed6e8';
    };
    var closedTop = function (u, v) { return (u < 0.7 || v < 0.7) ? '#d8b07a' : (Math.floor(v / 2.6) % 2 ? '#a07a50' : '#8e6c48'); };
    var kilim = function (v, z) {                              /* doğu yüzü: kilim etek */
      if (z > ZT - 1) return '#d2a066';
      if (z < 0.8) return '#6e4222';
      if (z > ZT - 2.4 || z < 2) return z > ZT - 2 ? '#d9a441' : '#d9a441';
      var cv = (v % 5) - 2.5, d = Math.abs(cv) + Math.abs(z - 6.5) * 0.75;
      if (d < 0.7) return '#d9a441';
      if (d < 1.5) return '#2a4c7d';
      if (d < 2.1) return '#f1e6cc';
      return Math.floor(z) % 4 === 0 && hash(Math.floor(v * 2), 1) > 0.5 ? '#8e3324' : '#a83d2b';
    };
    var shutter = function (v, z) { if (z > ZT - 1) return '#8b949c'; return (Math.floor(z * 1.5) % 2) ? '#5f686f' : '#4a5258'; };
    var poleC = '#6f4526';
    vl(b, X0 + 0.05, Y0 + 0.05, ZT, 33, poleC, 2);                                       /* arka direkler */
    box(b, X0, Y0, Wd, Dp, 0, ZT, closed ? closedTop : ice, woodV('#8a5a32', 5), closed ? shutter : kilim);
    if (closed) {
      var mx = R(fx(X1, (Y0 + Y1) / 2)), my = R(fy(X1, (Y0 + Y1) / 2, 5));
      b.rect(mx - 3, my, 6, 2, '#c9952f'); b.set(mx - 3, my, '#e6be59');
      /* toplanmış tente: rulo */
      for (var k = 0; k <= 30; k++) { var yy = Y0 - 0.05 + (Dp + 0.1) * k / 30, X = R(fx(X0 + 0.05, yy)), Y = R(fy(X0 + 0.05, yy, 30)); b.rect(X, Y, 2, 5, (k >> 2) % 2 ? '#b23a2a' : '#e9ddc2'); b.set(X, Y + 4, '#7a2a1e'); }
      vl(b, X1 + 0.18, Y0 + 0.02, 0, 31, poleC, 2); vl(b, X1 + 0.18, Y1 - 0.02, 0, 31, '#5a3a20', 2);
      vl(b, X0 + 0.05, Y1 - 0.05, ZT, 31, poleC, 2);
      /* KAPALI levhası (önde) */
      var sx = R(fx(X1 + 0.18, (Y0 + Y1) / 2)), sy = R(fy(X1 + 0.18, (Y0 + Y1) / 2, 24));
      b.rect(sx - 19, sy - 2, 38, 14, '#3a2a1c'); b.rect(sx - 18, sy - 1, 36, 12, '#c9a15e'); b.rect(sx - 18, sy - 1, 36, 1, '#e0bd80');
      var word = (lang === 'tr' ? 'KAPALI' : 'CLOSED');
      L.text(b, word, sx - Math.floor(L.textW(word) / 2), sy + 3, '#3a2401');
      b.rect(sx - 15, sy - 8, 1, 6, '#4a3220'); b.rect(sx + 14, sy - 8, 1, 6, '#4a3220');
      b.outline(0.55);
      return;
    }
    /* tente: arka yüksek, müşteri tarafı alçak; enine çizgiler */
    var N = 7, ax0 = X0 - 0.14, ax1 = X1 + 0.3, ay0 = Y0 - 0.16, ay1 = Y1 + 0.16;
    for (var s = 0; s < N; s++) {
      var a0 = ay0 + (ay1 - ay0) * s / N, a1 = ay0 + (ay1 - ay0) * (s + 1) / N, col = s % 2 ? '#f3e9d0' : '#cc4430';
      roofPlane(b, [[ax1, a0, 31], [ax1, a1, 31], [ax0, a1, 35], [ax0, a0, 35]], col, null, 0);
    }
    /* saçak: müşteri tarafında dalgalı */
    for (var q = 0; q <= 56; q++) {
      var yq = ay0 + (ay1 - ay0) * q / 56, sIdx = Math.floor(q / 8), sc = Math.abs((q % 8) - 4) / 4, dd = R((1 - sc * sc) * 3);
      var col2 = sIdx % 2 ? '#e6dbbc' : '#b23a2a', X2 = R(fx(ax1, yq)), Y2 = R(fy(ax1, yq, 31));
      for (var j = 1; j <= 2 + dd; j++) b.set(X2, Y2 + j, j >= 2 + dd ? dark(col2, 0.3) : col2);
    }
    vl(b, X1 + 0.22, Y0 - 0.1, 0, 31, poleC, 2); vl(b, X1 + 0.22, Y1 + 0.1, 0, 31, '#5a3a20', 2);   /* ön direkler */
    vl(b, X0 + 0.05, Y1 - 0.05, ZT, 34, poleC, 2);
    if (hasFish) {                                                                       /* tebeşir fiyat tahtası */
      var bx = R(fx(X1 + 0.22, Y1 + 0.1)) - 8, by = R(fy(X1 + 0.22, Y1 + 0.1, 22));
      b.rect(bx - 1, by - 1, 18, 14, '#6f4526'); b.rect(bx, by, 16, 12, '#2e2a26'); b.rect(bx + 1, by + 1, 14, 10, '#3a3631');
      b.rect(bx + 3, by + 3, 9, 1, '#e8ddc8'); b.rect(bx + 3, by + 6, 5, 1, '#e8ddc8'); b.rect(bx + 10, by + 6, 3, 1, '#ffc94a');
    }
    b.outline(0.55);
  });
}
function scaleSpr(f) {
  return L.sprite('scale|' + f + '|' + G().K, function (b) {
    b.rect(17, -26, 2, 18, '#c9952f'); b.rect(15, -9, 6, 2, '#9a7320');
    b.rect(11, -28, 14, 2, '#c9952f'); b.set(18, -29, '#e6be59');
    var d = f - 1;
    b.rect(10, -26 + d * 2, 5, 2, '#e6be59'); b.rect(21, -26 - d * 2, 5, 2, '#e6be59');
    b.rect(11, -27 + d * 2, 3, 1, '#fff0a8');
    b.outline(0.55);
  });
}
HKA.drawCounter = function (c) {
  if (!c.open) { gf('drawCounterClosed')(c); return; }
  if (c.key === 'hal') { gf('drawHalCounter')(c); return; }
  var A = gv('AREAS'), smk = gv('smoker');
  if (c.z !== smk.z && gf('fumeMachine')(c.z) && !A[c.z].locked) gf('drawFumeMachine')(c);
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  L.blit(counterSpr(c.fish ? 1 : 0, 0), sx, R(pY(c.x, c.y, 0)));
  var sw2 = Math.sin(T() * G().ANIM.waveFps) * 0.8;
  L.blit(scaleSpr(sw2 > 0.35 ? 2 : sw2 < -0.35 ? 0 : 1), sx, sy);
  if (/^b\d$/.test(c.key)) gf('drawStallSign')(c);
  gf('drawStack')(c.x, c.y, gf('shelfItems')(c), 12, 3.2);
  var NM = gf('NM'), FISH = G().FISH, Tt = gf('T');
  gf('labelAt')(c.x, c.y - 1.5, 46, (c.fish ? NM(FISH[c.fish].n) : Tt('stStall')) + ' ' + gf('shelfN')(c) + '/' + gf('counterMax')(c), '#ffd9a8', '' + gf('shelfN')(c));
  if (c.fish && gf('zoneAuto')(gf('zoneOfFish')(c.fish))) gf('labelAt')(c.x, c.y - 1.5, 58, Tt('autoBadge'), '#ffc94a', 'auto');
  if (gf('hasCrate')(c)) gf('drawFumeCrate')(gf('crateObj')(c));      /* v2.18-deneme: füme kasası */
  gf('drawTray')(c);
};
/* --- FÜME KASASI (v2.18-deneme): füme satan tezgâhın yanında küçük ahşap kasa; içinde füme mallar yığılı, ×n rozetli --- */
function fumeCrateSpr() {
  return spr('fcrate|' + G().K, 0, 0, function (b) {
    var x0 = -0.22, y0 = -0.2, w = 0.44, h = 0.4, p = P();
    box(b, x0, y0, w, h, 0, 6, function (u, v) { return (u < 0.5 || v < 0.5) ? '#b07a44' : (Math.floor(u * 0.5 + v * 0.35) % 2 ? '#8a5a30' : '#9a6a38'); }, woodH('#5d3c1c', 3), woodH('#7a4f28', 3));
    hl(b, x0, y0 + h, x0 + w, y0 + h, 5.4, p.woodLite);                                    /* ağız çıtası */
    vl(b, x0, y0 + h, 0, 6, '#4a2f18', 2); vl(b, x0 + w, y0 + h, 0, 6, '#3a2410', 2); vl(b, x0 + w, y0, 0, 6, '#3a2410', 1);
    var tx = R(fx(x0 + w, (y0 + y0 + h) / 2)), ty = R(fy(x0 + w, (y0 + y0 + h) / 2, 3));  /* mühür: yan yüzde küçük pirinç levha */
    b.rect(tx - 2, ty, 4, 3, p.brass); b.set(tx - 2, ty, p.brassLite);
    b.outline(0.55);
  });
}
HKA.drawFumeCrate = function (o) {
  gf('shadow')(o.x, o.y, 0.34);
  at(fumeCrateSpr(), o.x, o.y, 0);
  var n = o.items.length, show = Math.min(n, 5), sx = pX(o.x, o.y);
  for (var i = 0; i < show; i++) drawIt(o.items[n - show + i], sx, pY(o.x, o.y, 8 + i * 2.6));
  if (n) gf('uiBadge')(o.x, o.y, 6 + show * 2.6 + 9, 'x' + n, '#d8d2c4');
  gf('labelAt')(o.x, o.y + 0.45, 14, gf('T')('fumeCrate') + ' ' + n + '/' + o.cap, '#d8d2c4', '');
};
HKA.drawCounterClosed = function (c) {
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  L.blit(counterSpr(0, 1), sx, R(pY(c.x, c.y, 0)));
  var g = G().ctx, a = g.globalAlpha; g.globalAlpha = a * (0.5 + Math.sin(T() * 2) * 0.15);
  L.fr(sx, sy, -28, -34, 56, 1, '#ffc94a'); g.globalAlpha = a;
  var pl = G().player, NM = gf('NM'), FISH = G().FISH, Tt = gf('T');
  if (d2(pl.x, pl.y, c.x, c.y) < 26) gf('uiLabel')(c.x, c.y - 1.5, 30, (c.fish ? NM(FISH[c.fish].n) : Tt('stStall')) + ' — ' + Tt('stallClosed'), '#c9a15e', 1);
  if (d2(pl.x, pl.y, c.x, c.y) < 9) gf('uiLabel')(c.x, c.y - 1.5, 44, Tt('howToOpen'), '#9df5b0', 1);
};
/* para tepsisi: kabartma desenli bakır sini */
function traySpr() {
  return spr('tray|' + G().K, 0, 0, function (b) {
    for (var y0 = -9; y0 <= 9; y0++) for (var x0 = -16; x0 <= 16; x0++) { if ((x0 * x0) / 256 + (y0 * y0) / 72 <= 1) { b.set(x0, y0, '#6e5218'); b.set(x0, y0 - 1, '#8a6a20'); } }
    for (var y = -9; y <= 9; y++) for (var x = -16; x <= 16; x++) {
      var e = (x * x) / 256 + (y * y) / 72; if (e > 1) continue;
      var c = e > 0.78 ? (y < 0 ? '#e6be59' : '#8a6a20') : e > 0.62 ? '#a8822a' : ((Math.abs(x) + Math.abs(y) * 2) % 6 === 0 ? '#b8902e' : '#c9952f');
      if (e < 0.08) c = '#e6be59';
      b.set(x, y - 3, c);
    }
    b.outline(0.55);
  });
}
HKA.drawTray = function (c) {
  var tr = c.tray;
  at(traySpr(), tr.x, tr.y, 0);
  gf('drawStack')(tr.x, tr.y, tr.items, 2.4, 3.2);
  var Tt = gf('T');
  if (gf('trayFull')(c)) gf('labelAt')(tr.x, tr.y + 0.95, 10, Tt('trayFull'), (Math.sin(T() * 6) > 0 ? '#ff9b8a' : '#ffd0c8'), '!');
  else if (tr.items.length) gf('labelAt')(tr.x, tr.y + 0.95, 10, Tt('stTake') + ' ' + gf('money')(gf('trayValue')(c)), '#9df5b0', '$');
};
HKA.drawHalCounter = function (c) {
  gf('drawStack')(c.x, c.y + 0.6, c.buffer, 16, 3.2);
  var NM = gf('NM'), FISH = G().FISH, Tt = gf('T');
  gf('labelAt')(c.x, c.y - 0.4, 60, (c.fish ? NM(FISH[c.fish].n) : Tt('stStall')) + ' ' + c.buffer.length + '/' + gf('counterMax')(c), '#ffd9a8', '' + c.buffer.length);
  gf('drawTray')(c);
};
/* v2.22-sanat: büyük yazılı levha yerine Depo tabelası gibi ASMA TABELA (wsBoard + bölge resmi). Direk tezgâhın kuzey ön
   tente direğinin tepesinden yükselir, levha tentenin üstünde dışa (sağa) sarkar: tezgâhı ve tezgâh etiketini kapatmaz. Ad küçük, levhanın altında;
   oyuncu ~6 kare yakına gelince belirir, yaklaştıkça netleşir. */
HKA.drawStallSign = function (c) {
  var A = gv('AREAS'), a = A[c.z], pl = G().player;
  if (!a || a.locked) return;
  var k = WSIGN['z_' + a.id] ? 'z_' + a.id : 'z_iskele', px0 = c.x + 0.8, py0 = c.y - 1.15;
  at(spr('zsign|' + k + '|' + G().K, 0, 0, function (b) { wsSignK(b, 0, 0, k); }), px0, py0, 31);
  /* v2.23: tabela altındaki ad yazısı kaldırıldı (yalnız levha) */
};
/* çöp kovası (galvaniz): kapak zıplar */
function binSpr(pop) {
  return spr('bin|' + pop + '|' + G().K, 0, 0, function (b) {
    box(b, -0.28, -0.28, 0.56, 0.56, 0, 9, '#9aa4ab', function (u, z) { return Math.floor(z) % 3 === 0 ? '#5a646b' : (u < 1 ? '#aab4bb' : '#7c868d'); }, function (v, z) { return Math.floor(z) % 3 === 0 ? '#4a545b' : '#6c767d'; });
    var sy = R(fy(0, 0, 9)) - pop;
    b.rect(-12, sy - 6, 24, 4, '#6f7a81'); b.rect(-12, sy - 6, 24, 1, '#a8b2b9'); b.rect(-10, sy - 3, 20, 1, '#4d575e');
    b.rect(-3, sy - 10, 6, 4, '#4d575e'); b.rect(-2, sy - 9, 4, 1, '#8b949c');
    b.outline(0.55);
  });
}
HKA.drawBin = function (bn) {
  gf('shadow')(bn.x, bn.y, 0.42);
  at(binSpr(R(bn.pop * 4)), bn.x, bn.y, 0);
  var pl = G().player;
  if (gf('hasCarry')(pl, gv('isTrash')) && d2(pl.x, pl.y, bn.x, bn.y) < 9) gf('labelAt')(bn.x, bn.y, 22, gf('T')('stBin'), G().v('binT') > 0 ? '#ffc94a' : '#e8e2d2', '🗑');
};
/* ana kasa: yeşil çelik kasa, önde ₺ işareti */
function safeSpr(pop) {
  return spr('safe|' + pop + '|' + G().K, 0, 0, function (b) {
    var h = 10 + pop / 2;
    box(b, -0.5, -0.5, 1, 1, 0, h, function (u, v) { return (u < 0.7 || v < 0.7) ? '#7fcf8a' : (hash(Math.floor(u * 2), Math.floor(v * 2)) > 0.9 ? '#5ab068' : '#4ea05c'); },
      function (u, z) { return z > h - 1.2 ? '#6fc07a' : (Math.floor(u * 0.6) % 4 === 0 ? '#2f7a3c' : '#3f9050'); },
      function (v, z) { return z > h - 1.2 ? '#4f9a5c' : '#2a6a36'; });
    /* ₺ (sol/ön yüzde) */
    var cx = R(fx(-0.05, 0.5)), cy = R(fy(-0.05, 0.5, h * 0.55));
    b.rect(cx - 1, cy - 6, 2, 12, '#e9ffe9'); b.rect(cx - 4, cy - 2, 7, 2, '#e9ffe9'); b.rect(cx - 4, cy + 1, 7, 2, '#e9ffe9'); b.rect(cx + 1, cy + 5, 5, 2, '#e9ffe9'); b.rect(cx + 5, cy + 2, 2, 4, '#e9ffe9');
    var sx = 0, sy = R(fy(0, 0, h));
    b.rect(sx - 10, sy - 3, 20, 3, '#25693c'); b.rect(sx - 9, sy - 2, 18, 1, '#163f24');
    b.outline(0.6);
  });
}
HKA.drawSafe = function () {
  var s = gv('safe'), pop = R(s.pop * 4);
  at(safeSpr(pop), s.x, s.y, 0);
  gf('labelAt')(s.x, s.y, 30 + s.pop * 2, gf('T')('stSafe'), '#b7f7c7', '');
};

/* =====================================================================
   4) TEKNE, MARTI, EFEKTLER
   ===================================================================== */
/* Ege teknesi: turuncu küpeşte, mavi gövde + turkuaz şerit, kahve karina, dümen evi; yelkenli ya da bayraklı */
function boatSpr(r, fl) {
  return L.sprite('boat|' + r + '|' + fl + '|' + G().K, function (b) {
    var i, j;
    for (i = 0; i < 6; i++) { b.rect(-22 + i * 2 + (i % 2) * 3, 3 + i * 2, 44 - i * 7, 1, '#dff4fa', 0.32 - i * 0.04); b.rect(-18 + (i % 2) * 4, 4 + i * 2, 30 - i * 4, 1, '#1d5d80', 0.22); }
    b.rect(-24, 1, 48, 1, '#e8f6fb', 0.55);
    var Lb = L.buf();
    for (var rr = 0; rr < 14; rr++) {
      var inset = Math.round(Math.pow(rr / 14, 2.1) * 10), x0 = -22 + inset, x1 = 22 - inset + (rr < 4 ? 2 : 0);
      var c = rr < 2 ? (rr === 0 ? '#f0a070' : '#e07444') : rr < 4 ? '#c45a32' : rr === 4 ? '#1f8fbf' : rr < 10 ? ((rr % 2) ? '#2a8fc0' : '#3aa0d0') : ((rr % 2) ? '#8a4528' : '#9a5230');
      for (i = x0; i < x1; i++) {
        var cc = c;
        if (i < x0 + 3 && rr > 1) cc = lite(c, 0.14);
        if (i > x1 - 5) cc = dark(c, 0.2);
        if (rr > 4 && rr < 10 && ((i + 22) % 12 === 0)) cc = dark(c, 0.22);
        Lb.set(i, -14 + rr, cc);
      }
    }
    for (i = 0; i < 5; i++) Lb.set(-14 + i * 8, -10, '#f4e9d2');                   /* küpeşte perçinleri */
    /* dümen evi */
    Lb.rect(-15, -26, 13, 12, '#ede4cf'); Lb.rect(-15, -26, 13, 1, '#fffaf0'); Lb.rect(-4, -26, 2, 12, '#cdbf9e');
    Lb.rect(-13, -23, 4, 4, '#4a6a80'); Lb.set(-13, -23, '#9cc4d8'); Lb.rect(-8, -23, 3, 4, '#4a6a80');
    Lb.rect(-16, -28, 15, 2, '#6a4424'); Lb.rect(-16, -28, 15, 1, '#8a5a32');
    /* direk + çarmıh */
    Lb.rect(1, -44, 2, 30, '#6a4424'); Lb.rect(2, -44, 1, 30, '#4a2e16');
    for (i = 0; i < 26; i++) { Lb.set(2 + Math.round(i * 0.75), -43 + i * 1.15, '#d9c8a0'); Lb.set(1 - Math.round(i * 0.6), -43 + i * 1.15, '#d9c8a0'); }
    if (r) {                                                                          /* yelken (şişkin) */
      for (j = 0; j < 26; j++) {
        var bulge = Math.round(Math.sin(j / 26 * Math.PI) * 3);
        for (i = 0; i < 16 + bulge; i++) {
          var sc = '#f2ecdc';
          if (i < 2) sc = '#fffaf0'; if (i > 12 + bulge) sc = '#d4c6a6'; if (j % 6 === 5) sc = '#cdbf9e'; if (j < 2) sc = '#e2d7bb';
          Lb.set(4 + i, -42 + j, sc);
        }
      }
      Lb.rect(4, -43, 16, 2, '#c2492f'); Lb.rect(4, -41, 16, 1, '#8e2f1f');
      Lb.rect(3, -16, 20, 1, '#4a2e16');
    }
    /* bayrak (Hamsi Koyu bayrağı) dalgalanır */
    var fw = r ? 9 : 14, fh = r ? 6 : 9, fx0 = 3, fy0 = r ? -50 : -44;
    if (r) Lb.rect(1, -50, 2, 6, '#6a4424');
    for (i = 0; i < fw; i++) { var wv = Math.round(Math.sin(i * 0.7 + fl * 2.1) * 1); for (j = 0; j < fh; j++) Lb.set(fx0 + i, fy0 + j + wv, hkFlagPx(i, j, fw, fh)); }
    Lb.outline(0.55);
    b.put(Lb, 0, 0);
  });
}
HKA.drawBoat = function (bt) {
  var t = T(), rock = Math.sin(t * 1.1 + bt.x) * 1.3;
  var sx = R(pX(bt.x, bt.y)), sy = R(pY(bt.x, bt.y, 0)) + R(rock);
  L.blit(boatSpr(bt.r ? 1 : 0, Math.floor(t * 3) % 3), sx, sy);
  L.fr(sx, sy, 17, -12, 2, 3, gf('phase2')(t, 1) ? '#5fd37a' : '#2a6a3c');          /* sancak feneri */
  L.fr(sx, sy, 17, -12, 1, 1, '#c8ffd0');
};
/* martı: 4 kanat karesi */
function gullSpr(ph) {
  return L.sprite('gull|' + ph + '|' + G().K, function (b) {
    var up = ph === 0 ? -4 : ph === 1 ? -1 : ph === 2 ? 3 : -1, i;
    for (i = 0; i < 9; i++) {
      var dy = Math.round(up * (i / 8) + (ph === 2 ? -Math.sin(i / 8 * Math.PI) * 1.5 : Math.sin(i / 8 * Math.PI) * 1.2));
      var c = i > 6 ? '#3a3f44' : i > 5 ? '#8f9ea8' : '#ffffff';
      b.set(-2 - i, dy, c); b.set(2 + i, dy, c);
      if (i < 6) { b.set(-2 - i, dy + 1, '#c8d2d8'); b.set(2 + i, dy + 1, '#c8d2d8'); }
    }
    b.rect(-2, -1, 5, 3, '#ffffff'); b.rect(-2, 1, 5, 1, '#dfe6ea'); b.rect(3, -2, 2, 2, '#ffffff'); b.set(4, -2, '#20262a');
    b.rect(5, -1, 2, 1, '#e0a45a'); b.rect(-4, 0, 2, 1, '#e8e8e8');
    b.outline(0.35, '#4a5a66');
  });
}
HKA.drawGull = function (g) {
  var sx = R(pX(g.x, g.y)), sy = R(pY(g.x, g.y, 46 + Math.sin(g.f * 0.5) * 3));
  L.blit(gullSpr(Math.floor(g.f * 1.4) & 3), sx, sy);
};
HKA.drawFlyers = function () {
  var fl = gv('flyers'), lerp = G().lerp || function (a, b, t) { return a + (b - a) * t; };
  for (var i = 0; i < fl.length; i++) {
    var f = fl[i], t = clamp(f.t / f.d, 0, 1);
    var x = lerp(f.x0, f.x1, t), y = lerp(f.y0, f.y1, t), z = lerp(f.z0, f.z1, t) + Math.sin(t * Math.PI) * f.h;
    drawIt(f.it, R(pX(x, y)), R(pY(x, y, z)));
  }
};
function dustSpr(c) {
  return L.sprite('dust|' + c + '|' + G().K, function (b) {
    b.rect(1, 0, 2, 4, c); b.rect(0, 1, 4, 2, c); b.set(1, 1, lite(c, 0.4)); b.set(2, 3, dark(c, 0.2));
  });
}
HKA.drawPuffs = function () {
  var ps = gv('puffs');
  for (var i = 0; i < ps.length; i++) { var p = ps[i]; L.blit(dustSpr(p.col), pX(p.x, p.y), pY(p.x, p.y, p.z), clamp(1 - p.t / 0.65, 0, 1) * 0.8); }
};
/* eğitim rehberi: noktalı yol + hedefte nabız halkası (ince piksel elips) */
function ringSpr(q) {
  return L.sprite('ring|' + q + '|' + G().K, function (b) {
    var K = G().K, ph = q / 12, rx = (7 + ph * 9) * K, ry = (3.5 + ph * 4.5) * K, n = Math.round(rx * 7);
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; b.set(x, y, '#ffc94a'); b.set(x, y + (y < 0 ? -1 : 1), y < 0 ? '#ffe9a0' : '#c98f1c'); }
  });
}
function dotSpr() { return L.sprite('tdot|' + G().K, function (b) { b.rect(-2, 0, 5, 3, '#ffc94a'); b.rect(-1, -1, 3, 5, '#ffc94a'); b.set(-1, 0, '#fff0b0'); b.outline(0.5); }); }
HKA.drawTutGuide = function (tg) {
  var pl = G().player, t = T(), dx = tg.x - pl.x, dy = tg.y - pl.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d > 1.2) {
    var step = 0.45, off = (t * 1.6) % step;
    for (var s = 0.7 + off; s < d - 0.5; s += step) {
      var wx = pl.x + dx * s / d, wy = pl.y + dy * s / d;
      L.blit(dotSpr(), R(pX(wx, wy)), R(pY(wx, wy, 0)), 0.35 + 0.5 * Math.min(1, s / 2));
    }
  }
  var ph = (t * 1.4) % 1;
  L.blit(ringSpr(Math.floor(ph * 12)), pX(tg.x, tg.y), pY(tg.x, tg.y, 0), 0.9 - ph * 0.7);
};
function arrowSpr() {
  return L.sprite('tarrow|' + G().K, function (b) {
    b.rect(-6, -16, 14, 8, '#ffc94a'); b.rect(-4, -8, 10, 4, '#ffc94a'); b.rect(-2, -4, 6, 4, '#ffc94a'); b.rect(0, 0, 2, 2, '#ffc94a');
    b.rect(-6, -16, 14, 2, '#fff0b0'); b.rect(-6, -16, 2, 8, '#ffe07a'); b.rect(6, -14, 2, 6, '#d9a020'); b.rect(4, -8, 2, 4, '#d9a020');
    b.outline(0.55, '#3d2413');
  });
}
HKA.drawArrow = function (tg) {
  L.blit(arrowSpr(), R(pX(tg.x, tg.y)), R(pY(tg.x, tg.y, 30 + (Math.sin(T() * 4) > 0 ? 2 : 0))));
};

/* =====================================================================
   5) DÜNYA ÜSTÜ ETİKETLER: rol rozeti, özel müşteri söz çubuğu
   ===================================================================== */
function roleSpr(role) {
  return L.sprite('role|' + role + '|' + G().K, function (b) {
    var RT = gv('ROLE_TAG'), g = RT[role] || RT.hamal, bg = g.bg;
    b.rect(-9, -10, 18, 14, bg); b.rect(-8, -11, 16, 1, bg); b.rect(-8, 4, 16, 1, dark(bg, 0.15));
    b.rect(-9, -10, 18, 2, lite(bg, 0.25)); b.rect(-9, 2, 18, 2, dark(bg, 0.15));
    b.rect(-2, 5, 5, 2, bg); b.rect(-1, 7, 3, 2, dark(bg, 0.15)); b.set(0, 9, dark(bg, 0.2));
    var d = g.d;
    if (d === 'kufe') { b.rect(-6, -5, 12, 8, '#c9a15e'); b.rect(-6, -5, 12, 2, '#e8ddc8'); for (var x = -6; x < 6; x += 3) b.rect(x, -3, 1, 6, '#9a7340'); b.rect(-6, 0, 12, 1, '#9a7340'); b.rect(-4, -8, 8, 1, '#8a6436'); b.set(-5, -7, '#8a6436'); b.set(4, -7, '#8a6436'); }
    else if (d === 'knife') { b.rect(-1, -8, 3, 10, '#e8eef2'); b.rect(1, -8, 1, 9, '#b7c3cc'); b.set(-1, -8, '#ffffff'); b.rect(-2, 2, 5, 4, '#6f4526'); b.rect(-2, 2, 5, 1, '#9a6a3a'); }
    else if (d === 'fish') { b.rect(-6, -4, 9, 6, '#cfe6df'); b.rect(-6, -4, 9, 2, '#8fb8c8'); b.rect(3, -6, 2, 3, '#cfe6df'); b.rect(3, 0, 2, 3, '#cfe6df'); b.rect(5, -7, 2, 3, '#a8ccd8'); b.rect(5, 1, 2, 3, '#a8ccd8'); b.set(-4, -2, '#0a1a27'); }
    else if (d === 'coin') { b.rect(-4, -6, 9, 10, '#c9952f'); b.rect(-5, -5, 11, 8, '#c9952f'); b.rect(-3, -4, 6, 6, '#e6be59'); b.rect(-1, -3, 2, 4, '#c9952f'); b.set(-3, -5, '#fff0a8'); }
    else if (d === 'cart') { b.rect(-6, -5, 12, 6, '#c9a15e'); b.rect(-6, -5, 12, 1, '#e8ddc8'); b.rect(-5, 1, 4, 4, '#3c4650'); b.rect(2, 1, 4, 4, '#3c4650'); b.set(-4, 2, '#8b949c'); b.set(3, 2, '#8b949c'); b.rect(6, -7, 1, 4, '#6f4526'); }
    b.outline(0.6, '#0a1a27');
  });
}
HKA.drawRoleTag = function (w) {
  var lift = (w.carry && w.carry.length ? 10 + w.carry.length * 2 : 0);
  L.blit(roleSpr(w.role), R(pX(w.x, w.y)), R(pY(w.x, w.y, 34 + lift)));
};
/* özel müşteri: yazılar ve yan etkiler oyunun kendi fonksiyonunda kalır; yalnız söz süresi çubuğu ince çizilir */
HKA.drawSpecialTag = function (cu) {
  G().plain('drawSpecialTag', cu);
  if (!gf('specTalking')(cu)) return;
  var k = clamp((cu.sayT || 0) / gf('specHiDur')(cu), 0, 1), bx = R(pX(cu.x, cu.y)) - 10, by = R(pY(cu.x, cu.y, 0)) - 36;
  L.fr(bx, by, 0, 0, 40, 4, '#3a2a1c'); L.fr(bx, by, 1, 1, 38, 2, '#1a120c');
  var f = R(38 * k); if (f > 0) { L.fr(bx, by, 1, 1, f, 2, '#ffc94a'); L.fr(bx, by, 1, 1, f, 1, '#fff0b0'); }
};

/* =====================================================================
   6) BİNALAR — kit ile ince yeniden çizim (her seviye bir sprite; canlı parçalar ayrı)
   Yerel koordinat: bina merkezi (0,0). Klasik geometri korunur, yüzeyler dokulu + koyu renkli kontur.
   ===================================================================== */
function brickW(c) { var Tn = tone(c); return function (X, Y) { var row = Math.floor(Y / 3), o = (row & 1) * 3; return ((((Y % 3) + 3) % 3) === 0 || ((((X + o) % 6) + 6) % 6) === 0) ? mix(c, '#e8dcc4', 0.3) : hash(X >> 1, row) > 0.85 ? Tn.d : c; }; }
function panelW(c, lc, step) { return function (X, Y) { return (((X % step) + step) % step) === 0 ? lc : (hash(X >> 1, Y >> 2) > 0.92 ? lite(c, 0.06) : c); }; }
/* dünya noktası + sanat pikseli kayması + boyut (sanat pikseli) → ince dikdörtgen */
function pr(b, x, y, z, dx, dy, w, h, c) { b.rect(R(fx(x, y) + dx * KK), R(fy(x, y, z) + dy * KK), Math.max(1, R(w * KK)), Math.max(1, R(h * KK)), c); }
function crateK(b, x, y, z, c) { c = c || '#a9743f'; box(b, x - 0.1, y - 0.1, 0.2, 0.2, z || 0, (z || 0) + 4, shd(c, 22), woodH(shd(c, -18), 3), woodH(c, 3)); }
function iceK(b, x, y, z) { box(b, x - 0.09, y - 0.09, 0.18, 0.18, z || 0, (z || 0) + 4, '#f4fbff', '#9ccbe0', '#bfe0ef'); }
function miniTableK(b, x, y, cloth) {
  vl(b, x, y + 0.02, 0, 4, '#6f4526', 2);
  box(b, x - 0.1, y - 0.1, 0.2, 0.2, 4, 5, cloth || '#ede4cf', '#b9ad92', '#cfc3a6');
  box(b, x - 0.22, y - 0.05, 0.07, 0.1, 0, 3, '#b8924f', '#8a6a36', '#a07c42');
  box(b, x + 0.15, y - 0.05, 0.07, 0.1, 0, 3, '#b8924f', '#8a6a36', '#a07c42');
}
function parasolK(b, x, y, h, c1, c2) {
  vl(b, x, y, 0, h, '#e8ddc8', 1);
  var X = R(fx(x, y)), Y = R(fy(x, y, h));
  for (var r = 0; r < 8; r++) { var w = 32 - r * 4; for (var i = 0; i < w; i++) b.set(X - w / 2 + i, Y - 1 - r, (Math.floor((i + r * 0.5) / 4) % 2) ? c2 : c1); }
  for (var j = 0; j < 32; j++) b.set(X - 16 + j, Y, j % 4 < 2 ? shd(c1, -30) : shd(c2, -30));
}
function containerK(b, x0, y0, lx, ly, z0, h, c, doorsR) {
  box(b, x0, y0, lx, ly, z0, z0 + h, shd(c, 18), panelW(shd(c, -30), shd(c, -52), 4), panelW(shd(c, -12), shd(c, -34), 4));
  hl(b, x0, y0 + ly, x0 + lx, y0 + ly, z0 + h - 1, shd(c, 30));
  if (doorsR) { vl(b, x0 + lx, y0 + ly / 2, z0 + 1, z0 + h - 1, '#2a2a2a'); vl(b, x0 + lx, y0 + ly * 0.25, z0 + 2, z0 + h - 2, '#d8d2c4'); vl(b, x0 + lx, y0 + ly * 0.75, z0 + 2, z0 + h - 2, '#d8d2c4'); }
}
function halfTimberK(b, x0, x1, y0, y1, z0, z1) {
  box(b, x0, y0, x1 - x0, y1 - y0, z0, z1, '#efe8d8', '#d9cfb8', '#e6ddc8');
  var TW = '#5a3a22', k, n = Math.max(2, Math.round((x1 - x0) / 0.3)), m = Math.max(2, Math.round((y1 - y0) / 0.3)), zm = (z0 + z1) / 2;
  [z0, z1 - 1, zm].forEach(function (z) { hl(b, x0, y1, x1, y1, z, TW); hl(b, x0, y1, x1, y1, z + 0.5, TW); hl(b, x1, y0, x1, y1, z, '#4a2e1a'); });
  for (k = 0; k <= n; k++) vl(b, x0 + (x1 - x0) * k / n, y1, z0, z1, TW, 2);
  for (k = 0; k <= m; k++) vl(b, x1, y0 + (y1 - y0) * k / m, z0, z1, '#4a2e1a', 2);
  for (k = 0; k < n; k++) { var a0 = x0 + (x1 - x0) * k / n, a1 = x0 + (x1 - x0) * (k + 1) / n; line(b, fx(a0, y1), fy(a0, y1, z0), fx(a1, y1), fy(a1, y1, zm), TW); }
}
function stoneBaseK(b, x0, x1, y0, y1, z0, z1) { box(b, x0, y0, x1 - x0, y1 - y0, z0, z1, '#b8b3a5', stoneW('#8e8a80'), stoneW('#a09c92')); }
/* Hamsi Koyu bayrağı (oyunun logosu): lacivert deniz, üstte kırmızı-krem tente şeridi, gümüş hamsi, turuncu kuyruk, altın sikke.
   hkFlagPx(i, j, w, h): bayrağın (i, j) pikselinin rengi; her boyda (9x6 … 28x18) okunur kalacak şekilde ölçeklenir. */
function hkFlagPx(i, j, w, h) {
  var st = h >= 9 ? 2 : 1;                                             /* tente şeridi kalınlığı */
  if (j < st) return (Math.floor(i / 2) % 2) ? '#f4e9d2' : '#d9443a';
  var cy = st + Math.floor((h - st) / 2), hh = h >= 16 ? 3 : h >= 10 ? 2 : h >= 8 ? 1 : 0;
  var bl = Math.round(w * 0.32), br = Math.round(w * 0.72), dj = j - cy;
  if (i >= bl && i <= br) {                                             /* tombul gövde: elips */
    var t = (i - bl + 0.5) / (br - bl + 1), th = Math.round((hh + 0.4) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2))));
    if (hh >= 2 && dj === -th - 1 && t > 0.35 && t < 0.6) return '#f08a24';                     /* sırt yüzgeci */
    if (Math.abs(dj) <= th) {
      if (hh && i === br - Math.max(1, Math.floor(hh / 2)) && dj === -Math.max(0, Math.floor(th / 2))) return '#1b2a36';  /* göz */
      if (dj < -Math.floor(th / 2)) return '#9fb0bd';                                          /* sırt */
      if (dj > Math.floor(th / 2)) return '#f4f7f9';                                           /* karın */
      return t > 0.2 && t < 0.75 && hh >= 2 ? '#b4c8d6' : '#d5dee5';                           /* yan şerit */
    }
  }
  var k = bl - 1 - i;                                                   /* kuyruk: gövdeden geriye yelpaze */
  if (k >= 0 && k <= Math.max(1, hh)) { var span = Math.min(hh, k); if (Math.abs(dj) <= span && (k < 1 || Math.abs(dj) >= Math.min(1, span) || hh < 2)) return k === 0 ? '#e07a18' : '#f6a640'; }
  if (w >= 14 && i >= w - 4 && i <= w - 3 && j >= st + 1 && j <= st + 2) return (i === w - 4 && j === st + 1) ? '#fff2b0' : '#f2c14e';  /* sikke */
  return j === h - 1 ? '#1a4a70' : '#235d8a';
}
function flagSpr(fr, w, h) {
  return L.sprite('flag|' + fr + '|' + w + '|' + h + '|' + G().K, function (b) {
    for (var i = 0; i < w; i++) { var wv = Math.round(Math.sin(i * 0.6 - fr * 2.1) * 1.2 * (i / w)); for (var j = 0; j < h; j++) b.set(1 + i, j + wv, hkFlagPx(i, j, w, h)); }
    b.outline(0.5);
  });
}
/* bayrak direği + dalgalanan bayrak (canlı parça) */
function flagAt(x, y, z, w, h) { L.blit(flagSpr(Math.floor(T() * 3) % 3, w || 18, h || 12), R(pX(x, y)), R(pY(x, y, z))); }

/* ---------- BUZHANE ---------- */
function buzStatic(b, lv) {
  var k;
  if (lv === 1) {
    var a = 0.55, bb = 0.5;
    box(b, -a, -bb, a * 2, bb * 2, 0, 12, '#b98a52', woodV('#7a4e2a', 4), woodV('#935f33', 4));
    roofGableX(b, -a - 0.1, a + 0.1, -bb - 0.12, bb + 0.12, 12, 8, '#d8b86a', '#b8984f', '#8d5f33', '#b89a52', 4);
    winR(b, a, -0.12, 0.22, 0, 9, '#4a3220', '#6a4224');
    wall(b, -0.2, bb, 0.1, bb, 5, 8, '#bfe0ef');
    var sx = R(fx(-0.05, bb)), sy = R(fy(-0.05, bb, 6.5)); b.rect(sx - 2, sy, 5, 1, '#ffffff'); b.rect(sx, sy - 2, 1, 5, '#ffffff');
    iceK(b, -0.35, bb + 0.25); iceK(b, -0.12, bb + 0.3); iceK(b, -0.25, bb + 0.28, 4);
    b.outline(0.55); return;
  }
  var A = [0, 0, 0.72, 0.8, 0.9, 0.9][lv], B = [0, 0, 0.6, 0.66, 0.72, 0.72][lv], H = [0, 0, 16, 18, 20, 20][lv];
  var x0 = -A, x1 = A, y0 = -B, y1 = B, zb = lv >= 3 ? 6 : 0;
  box(b, x0, y0, A * 2, B * 2, 0, H, '#e7eff2', panelW('#c3d3db', '#a8bcc7', 5), panelW('#d6e3ea', '#b6c9d3', 5));
  if (lv >= 3) { wall(b, x0, y1, x1, y1, 0, 6, brickW('#9a4d34')); wall(b, x1, y0, x1, y1, 0, 6, brickW('#ad5a3e')); }
  wall(b, x0, y1, x1, y1, H - 1.5, H, '#5b7f96'); wall(b, x1, y0, x1, y1, H - 1.5, H, '#6b90a8');
  winF(b, -0.28, 0.18, y1, 0, 12, panelW('#d0dde4', '#b0c0c8', 3), '#5b7f96');
  hl(b, -0.28, y1, 0.18, y1, 6, '#9fb4c0'); pr(b, 0.1, y1, 7, -1, 0, 2, 3, '#5d666e');
  if (lv >= 4) {
    box(b, x1, -0.5, 0.12, 0.9, 0, 4, '#b9b3a4', '#8e897c', '#a39d8f');
    winR(b, x1 + 0.001, -0.35, 0.25, 4, 15, '#8fb3c4', '#3c4650');
    for (k = 0; k < 5; k++) vl(b, x1, -0.3 + k * 0.12, 4, 15, '#e6f4fb');
  }
  var units = lv >= 4 ? 2 : lv >= 3 ? 1 : 0;
  if (lv === 2) box(b, -0.1, -0.1, 0.18, 0.18, H, H + 5, '#aab2ba', '#6c767d', '#818b92');
  for (k = 0; k < units; k++) { var ux = -0.5 + k * 0.55, uy = -0.35; box(b, ux, uy, 0.42, 0.36, H, H + 7, '#aab2ba', '#6c767d', '#818b92'); }
  for (k = 0; k < Math.min(4, lv); k++) iceK(b, x0 + 0.2 + k * 0.22, y1 + 0.2);
  if (lv >= 5) {
    for (k = 0; k < 9; k++) { var ix = x0 + 0.1 + k * 0.19; pr(b, ix, y1, H - 1, 0, 0, 0.5, 2 + (k % 3), '#f4fbff'); }
    wall(b, -0.5, y1, 0.35, y1, H + 1, H + 7, '#2b5f82');
    var ssx = R(fx(-0.08, y1)), ssy = R(fy(-0.08, y1, H + 6));
    b.rect(ssx - 4, ssy + 4, 10, 2, '#ffffff'); b.rect(ssx, ssy, 2, 10, '#ffffff'); b.set(ssx - 2, ssy + 2, '#ffffff'); b.set(ssx + 3, ssy + 2, '#ffffff'); b.set(ssx - 2, ssy + 7, '#ffffff'); b.set(ssx + 3, ssy + 7, '#ffffff');
    box(b, x1 + 0.02, 0.35, 0.3, 0.5, 1, 11, '#f4f6f7', '#c9d0d4', '#dde3e6');
    wall(b, x1 + 0.32, 0.35, x1 + 0.32, 0.85, 5, 7, '#2b5f82');
    box(b, x1 + 0.02, 0.85, 0.3, 0.14, 1, 8, '#2b5f82', '#1d4560', '#23526f');
    pr(b, x1 + 0.17, 0.99, 0, -2, -3, 4, 3, '#1e1e1e');
  }
  b.outline(0.55);
}
function fanSpr(ph) { return L.sprite('fan|' + ph + '|' + G().K, function (b) { b.rect(-4, -4, 8, 8, '#3c4650'); b.rect(-3, -3, 6, 6, '#26303a'); if (ph) b.rect(-4, 0, 8, 1, '#cfd6db'); else b.rect(0, -4, 1, 8, '#cfd6db'); b.set(0, 0, '#8b949c'); }); }
function buzDraw(X, Y, lv) {
  var t = T(), k;
  at(spr('buz|' + lv + '|' + G().K, 0, 0, function (b) { buzStatic(b, lv); }), X, Y, 0);
  if (lv === 1) return 26;
  var A = [0, 0, 0.72, 0.8, 0.9, 0.9][lv], B = [0, 0, 0.6, 0.66, 0.72, 0.72][lv], H = [0, 0, 16, 18, 20, 20][lv];
  var units = lv >= 4 ? 2 : lv >= 3 ? 1 : 0;
  for (k = 0; k < units; k++) { var ux = X - 0.5 + k * 0.55, uy = Y - 0.35; L.blit(fanSpr(Math.floor(t * 12 + k) % 2), R(pX(ux + 0.21, uy + 0.36)), R(pY(ux + 0.21, uy + 0.36, H + 3.5))); }
  if (Math.random() < 0.04) gf('addPuff')(X - 0.05, Y + B + 0.1, '#eef7fb');
  if (lv >= 5) return H + 8;
  return H + (units ? 8 : 6);
}

/* ---------- RESTORAN ---------- */
function restStatic(b, lv) {
  var k, WALL = ['#f1ebda', '#d8cfb8', '#e6dec9'];
  if (lv === 1) {
    box(b, -0.45, -0.62, 0.9, 0.55, 0, 13, '#3f8f8a', woodV('#2c6a66', 4), woodV('#357d78', 4));
    winF(b, -0.3, 0.25, -0.07, 6, 11, '#ffe8b0', '#20504c');
    for (k = 0; k < 5; k++) roofPlane(b, [[-0.5 + k * 0.2, -0.07, 14], [-0.4 + k * 0.2, -0.07, 14], [-0.4 + k * 0.2, 0.18, 10], [-0.5 + k * 0.2, 0.18, 10]], k % 2 ? '#f4f0e4' : '#c8553d');
    for (k = 0; k < 5; k++) roofPlane(b, [[-0.4 + k * 0.2, -0.07, 14], [-0.3 + k * 0.2, -0.07, 14], [-0.3 + k * 0.2, 0.18, 10], [-0.4 + k * 0.2, 0.18, 10]], k % 2 ? '#c8553d' : '#f4f0e4');
    box(b, -0.45, -0.62, 0.9, 0.55, 13, 14, '#2c6a66', '#20504c', '#285f5b');
    miniTableK(b, -0.35, 0.55); parasolK(b, -0.35, 0.55, 15, '#c8553d', '#f4f0e4');
    box(b, 0.35, 0.25, 0.08, 0.3, 0, 9, '#2e2a26', '#1e1b18', '#26231f');
    wall(b, 0.43, 0.3, 0.43, 0.5, 4, 8, '#3a3631'); hl(b, 0.43, 0.32, 0.43, 0.46, 7, '#e8ddc8'); hl(b, 0.43, 0.32, 0.43, 0.42, 5.5, '#e8ddc8');
    b.outline(0.55); return;
  }
  var bx0 = -0.82, bx1 = 0.82, by0 = -0.85, by1 = 0.02, H = 17;
  if (lv >= 3) quadW(b, -0.9, by1, 1.8, 0.92, 1, woodH('#b8895a', 4));
  box(b, bx0, by0, bx1 - bx0, by1 - by0, 0, H, WALL[0], WALL[1], WALL[2]);
  if (lv >= 3) {
    winF(b, bx0 + 0.1, bx1 - 0.1, by1, 3, 12, function (X, Y) { return ((X + Y) % 9 === 0) ? '#d8f0f8' : '#9ed2e6'; }, '#2f5f7a');
    for (k = 1; k < 6; k++) vl(b, bx0 + 0.1 + (bx1 - bx0 - 0.2) * k / 6, by1, 3, 12, '#2f5f7a', 2);
    winF(b, -0.12, 0.12, by1 + 0.001, 0, 12, woodV('#6b4a2e', 3), '#3a2a1c');
  } else {
    winF(b, -0.12, 0.14, by1, 0, 11, woodV('#6b4a2e', 3), '#3a2a1c');
    winF(b, bx0 + 0.15, bx0 + 0.45, by1, 5, 10, '#25384a', '#2f7fa6'); winF(b, bx1 - 0.45, bx1 - 0.15, by1, 5, 10, '#25384a', '#2f7fa6');
    vl(b, bx0 + 0.3, by1, 5, 10, '#2f7fa6'); vl(b, bx1 - 0.3, by1, 5, 10, '#2f7fa6');
  }
  winR(b, bx1, by0 + 0.2, by0 + 0.45, 5, 10, lv >= 3 ? '#ffd98f' : '#25384a', '#2f7fa6');
  for (k = 0; k < 8; k++) { var ax = bx0 + (bx1 - bx0) * k / 8, bx = bx0 + (bx1 - bx0) * (k + 1) / 8; roofPlane(b, [[ax, by1, 14], [bx, by1, 14], [bx, by1 + 0.3, 10], [ax, by1 + 0.3, 10]], k % 2 ? '#f4f0e4' : '#b5432f'); }
  for (k = 0; k < 16; k++) { var sxq = R(fx(bx0 + (bx1 - bx0) * (k + 0.5) / 16, by1 + 0.3)), syq = R(fy(bx0 + (bx1 - bx0) * (k + 0.5) / 16, by1 + 0.3, 10)); b.rect(sxq - 1, syq, 3, 2, (Math.floor(k / 2) % 2) ? '#d8d0bc' : '#8e2f1f'); }
  if (lv >= 4) {
    box(b, bx0, by0, bx1 - bx0, by1 - by0, H, H + 1, '#cfc6ae', WALL[1], WALL[2]);
    var ux0 = -0.55, ux1 = 0.55, uy0 = by0, uy1 = -0.35, UH = H + 10;
    box(b, ux0, uy0, ux1 - ux0, uy1 - uy0, H + 1, UH, WALL[0], WALL[1], WALL[2]);
    winF(b, ux0 + 0.12, ux1 - 0.12, uy1, H + 3, H + 8, '#ffd98f', '#2f7fa6');
    vl(b, 0, uy1, H + 3, H + 8, '#2f7fa6');
    roofGableX(b, ux0 - 0.06, ux1 + 0.06, uy0 - 0.06, uy1 + 0.06, UH, 6, '#cb5b40', '#b5432f', WALL[2], '#7d2c1d', 3);
    wall(b, bx0 + 0.05, by1, bx1 - 0.05, by1, H + 1, H + 4, function (X, Y) { return (X % 5 === 0) ? '#1d4f6b' : { c: '#2f7fa6', a: 0.6 }; });
    hl(b, bx0 + 0.05, by1, bx1 - 0.05, by1, H + 4, '#1d4f6b');
    if (lv >= 5) {
      var fsx = R(fx(-0.1, uy1)), fsy = R(fy(-0.1, uy1, UH + 7));
      b.rect(fsx - 16, fsy, 28, 12, '#d9a441'); b.rect(fsx - 14, fsy + 2, 24, 8, '#e8a14a'); b.rect(fsx + 12, fsy - 2, 6, 16, '#d9a441'); b.rect(fsx + 14, fsy, 2, 12, '#e8a14a');
      b.rect(fsx - 10, fsy + 4, 2, 2, '#2e2a26'); b.rect(fsx - 14, fsy + 2, 24, 1, '#f4c070');
      b.rect(fsx - 16, fsy + 12, 1, 6, '#5d666e'); b.rect(fsx + 8, fsy + 12, 1, 6, '#5d666e');
    }
  } else roofGableX(b, bx0 - 0.08, bx1 + 0.08, by0 - 0.08, by1 + 0.08, H, 8, '#cb5b40', '#b5432f', WALL[2], '#7d2c1d', 4);
  var chx = 0.45, chy = -0.6, chz = lv >= 4 ? H + 1 : H + 4;
  box(b, chx - 0.07, chy - 0.07, 0.14, 0.14, chz - 2, chz + 7, '#c4b598', brickW('#9a8c72'), brickW('#b0a286'));
  var nT = [0, 0, 2, 3, 3, 4][lv], TP = [[-0.55, 0.45], [0.1, 0.72], [0.6, 0.4], [-0.1, 0.3]];
  for (k = 0; k < nT; k++) { miniTableK(b, TP[k][0], TP[k][1], k % 2 ? '#ede4cf' : '#e0f0f4'); if (lv >= 4 && k < 2) parasolK(b, TP[k][0], TP[k][1], 15, k ? '#2f7fa6' : '#b5432f', '#f4f0e4'); }
  if (lv >= 3) {
    wall(b, -0.9, 0.94, 0.9, 0.94, 1, 4, woodV('#8a5a33', 4)); wall(b, 0.9, by1, 0.9, 0.94, 1, 4, woodV('#9a6a3d', 4));
    vl(b, -0.9, 0.94, 0, 14, '#6f4526', 2); vl(b, 0.9, 0.94, 0, 14, '#6f4526', 2);
    for (k = 0; k <= 32; k++) { var lx = -0.9 + k * 1.8 / 32, lz = 13 - Math.sin(k / 32 * Math.PI) * 3; b.set(R(fx(lx, 0.94)), R(fy(lx, 0.94, lz)), '#3a2a1c'); }
  }
  if (lv >= 5) { box(b, 0.72, 0.72, 0.16, 0.16, 0, 4, '#a8563a', '#7a3a26', '#8e4630'); box(b, 0.76, 0.76, 0.08, 0.08, 4, 9, '#4a7a3a', '#2f5136', '#436b45'); }
  b.outline(0.55);
}
function restDraw(X, Y, lv) {
  var t = T(), k;
  at(spr('rest|' + lv + '|' + G().K, 0, 0, function (b) { restStatic(b, lv); }), X, Y, 0);
  if (lv === 1) return 26;
  var H = 17, chx = X + 0.45, chy = Y - 0.6, chz = lv >= 4 ? H + 1 : H + 4;
  for (k = 0; k < 3; k++) { var yy = R(pY(chx, chy, chz + 9)) - ((t * 9 + k * 7) % 14); L.blit(puffSpr(1 + (k % 2)), R(pX(chx, chy) + Math.sin(t * 2 + k) * 1.5), R(yy), 0.4); }
  if (lv >= 3) {
    var ph = Math.floor(t * 2);
    for (k = 0; k <= 8; k++) { var lx = X - 0.9 + k * 0.225, lz = 13 - Math.sin(k / 8 * Math.PI) * 3, on = (k + ph) % 3; L.fr(R(pX(lx, Y + 0.94)), R(pY(lx, Y + 0.94, lz)), -1, 0, 2, 2, on ? '#ffd98f' : '#f0ece0'); if (on) L.fr(R(pX(lx, Y + 0.94)), R(pY(lx, Y + 0.94, lz)), -1, 0, 1, 1, '#fff6d8'); }
  }
  return lv >= 4 ? H + 18 : H + 12;
}

/* ---------- NAKLİYE ---------- */
function nakStatic(b, lv) {
  var k;
  quadW(b, -0.95, -0.95, 1.9, 1.9, 0.5, function (X, Y) { return (((X + Y * 2) % 16 === 0) || ((X - Y * 2) % 16 === 0)) ? '#8a8478' : (hash(X >> 1, Y >> 1) > 0.9 ? '#a8a194' : '#9d968a'); });
  if (lv >= 2) containerK(b, -0.9, -0.85, 1.25, 0.5, 0, 13, '#2f6c9c', true);
  if (lv >= 2) { for (k = 0; k < 5; k++) box(b, 0.35 + k * 0.001, -0.35 - k * 0.07, 0.18, 0.07, 0, 2.5 * (k + 1), '#8b949c', '#5d666e', '#6c767d'); }
  containerK(b, -0.9, -0.3, 1.25, 0.5, 0, 13, '#c9642e', true);
  winF(b, -0.7, -0.5, 0.2, 0, 10, '#3a3a3a', '#2a2a2a');
  winF(b, -0.35, -0.05, 0.2, 5, 10, lv >= 3 ? '#ffd98f' : '#9ed2e6', '#2a2a2a');
  box(b, 0.35, -0.2, 0.08, 0.18, 7, 11, '#dde3e6', '#aab2ba', '#c3cbd0');
  if (lv >= 3) {
    containerK(b, -0.9, -0.3, 1.25, 0.5, 13, 12, '#4d8747', false);
    var cx0 = 0.45, cx1 = 0.95, cy0 = -0.85, cy1 = 0.2;
    vl(b, cx1, cy1, 0, 17, '#5d666e', 2); vl(b, cx1, cy0, 0, 18, '#5d666e', 2); vl(b, cx0, cy1, 0, 17, '#5d666e', 2);
    box(b, 0.58, -0.35, 0.22, 0.3, 0, 5, '#e6b93a', '#a8822a', '#c99f33');
    vl(b, 0.6, -0.05, 5, 11, '#3c4650'); vl(b, 0.77, -0.05, 5, 11, '#3c4650');
    box(b, 0.6, -0.08, 0.18, 0.04, 0, 1, '#3c4650', '#2a3138', '#333b42');
    crateK(b, 0.7, -0.62, 0, '#a9743f'); crateK(b, 0.7, -0.62, 4, '#c9975f');
    roofPlane(b, [[cx0, cy0, 18], [cx1, cy0, 18], [cx1, cy1, 16], [cx0, cy1, 16]], '#8d959b', '#5a6167', 5);
  } else { quadW(b, 0.5, 0.28, 0.45, 0.25, 0.8, woodH('#8a6a36', 3)); crateK(b, 0.6, 0.4, 0); crateK(b, 0.82, 0.4, 0); crateK(b, 0.7, 0.4, 4); }
  if (lv >= 4) {
    box(b, -0.75, 0.45, 0.95, 0.35, 1, 11, '#e8e4dc', '#b9b4aa', '#d3cec4');
    wall(b, -0.75, 0.8, 0.2, 0.8, 4, 6, '#2a4c7d');
    box(b, 0.22, 0.47, 0.28, 0.31, 1, 9, '#c8553d', '#8e3a2a', '#a94430');
    winR(b, 0.5, 0.52, 0.72, 5, 8, '#9ed2e6', '#5a2a1e');
    [-0.6, -0.1, 0.35].forEach(function (wx) { pr(b, wx, 0.8, 0, -2, -3, 4, 3, '#1e1e1e'); pr(b, wx, 0.8, 0, -1, -2, 2, 1, '#6a6a6a'); });
  }
  if (lv >= 5) {
    var gz = 34;
    vl(b, -0.95, -0.9, 0, gz, '#e6b93a', 2); vl(b, -0.95, 0.3, 0, gz, '#e6b93a', 2); vl(b, 0.42, -0.9, 0, gz, '#d2a633', 2); vl(b, 0.42, 0.3, 0, gz, '#d2a633', 2);
    box(b, -0.97, -0.92, 1.42, 0.06, gz, gz + 3, '#f0c94a', '#b8922c', '#d2a633');
    box(b, -0.97, 0.28, 1.42, 0.06, gz, gz + 3, '#f0c94a', '#b8922c', '#d2a633');
  } else {
    vl(b, -0.9, 0.6, 0, 15, '#5d666e', 2);
    wall(b, -0.98, 0.6, -0.5, 0.6, 10, 16, '#14293c'); wall(b, -0.96, 0.6, -0.52, 0.6, 11, 15, '#6f8fae');
    hl(b, -0.92, 0.6, -0.6, 0.6, 13.5, '#f4e9d2'); hl(b, -0.92, 0.6, -0.72, 0.6, 12, '#f4e9d2');
  }
  b.outline(0.55);
}
function hoistSpr() { return L.sprite('hoist|' + G().K, function (b) { b.rect(-3, -16, 6, 4, '#3c4650'); b.rect(0, -12, 1, 12, '#2a2a2a'); b.rect(-2, 0, 5, 3, '#5d666e'); b.set(-2, 0, '#8b949c'); b.outline(0.5); }); }
function nakDraw(X, Y, lv) {
  var t = T();
  at(spr('nak|' + lv + '|' + G().K, 0, 0, function (b) { nakStatic(b, lv); }), X, Y, 0);
  if (lv >= 5) {
    var gz = 34, hx = X - 0.2 + Math.sin(t * 0.6) * 0.45;
    L.blit(hoistSpr(), R(pX(hx, Y - 0.3)), R(pY(hx, Y - 0.3, 27)));
    var lsx = R(pX(X + 0.42, Y + 0.3)), lsy = R(pY(X + 0.42, Y + 0.3, gz + 6));
    L.fr(lsx, lsy, 0, 0, 3, 3, Math.floor(t * 2.5) % 2 ? '#e5533d' : '#6a2a20');
    return gz + 8;
  }
  if (lv >= 3) L.fr(R(pX(X + 0.95, Y - 0.85)), R(pY(X + 0.95, Y - 0.85, 19)), 0, 0, 3, 3, Math.floor(t * 2.5) % 2 ? '#5fd37a' : '#2a6a3c');
  return lv >= 3 ? 30 : 18;
}

/* ---------- KOOPERATİF (Karadeniz evi) ---------- */
function koopStatic(b, lv, blink) {
  var k, A = lv >= 4 ? 0.78 : 0.6, B = lv >= 4 ? 0.62 : 0.52, x0 = -A, x1 = A, y0 = -B, y1 = B;
  var SH = '#4e3b2c', SH2 = '#654c38', SHL = '#3a2b20';
  if (lv <= 2) {
    stoneBaseK(b, x0, x1, y0, y1, 0, 4);
    halfTimberK(b, x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, 4, 17);
    winF(b, -0.1, 0.14, y1 - 0.03, 4, 14, woodV('#5a4230', 3), '#3a2a1c');
    winR(b, x1 - 0.03, -0.25, 0.02, 9, 14, '#25384a', '#5a3a22');
    roofHip(b, x0 - 0.14, x1 + 0.14, y0 - 0.14, y1 + 0.14, 17, 10, SH2, SH, SHL, 4);
  } else {
    stoneBaseK(b, x0, x1, y0, y1, 0, 13);
    winF(b, -0.12, 0.14, y1, 0, 11, woodV('#5a4230', 3), '#3a2a1c');
    pr(b, 0.01, y1, 12, -3, 0, 6, 1, '#6c685f'); pr(b, 0.01, y1, 12.5, -2, -1, 4, 1, '#6c685f');
    halfTimberK(b, x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, 13, 26);
    winF(b, x0 + 0.15, x0 + 0.42, y1 + 0.05, 17, 23, blink ? '#ffd98f' : '#25384a', '#5a3a22');
    winF(b, x1 - 0.42, x1 - 0.15, y1 + 0.05, 17, 23, '#ffd98f', '#5a3a22');
    winR(b, x1 + 0.05, -0.3, 0.0, 17, 23, '#25384a', '#5a3a22');
    if (lv >= 4) {
      box(b, x0 + 0.1, y1 + 0.05, x1 - x0 - 0.2, 0.18, 13, 14, '#8a5a33', '#5a3a22', '#6f4526');
      for (k = 0; k < 8; k++) vl(b, x0 + 0.12 + k * (x1 - x0 - 0.24) / 7, y1 + 0.23, 14, 18, '#3a2616', 2);
      hl(b, x0 + 0.1, y1 + 0.23, x1 - 0.1, y1 + 0.23, 18, '#5a3a22'); hl(b, x0 + 0.1, y1 + 0.23, x1 - 0.1, y1 + 0.23, 18.5, '#8a5a33');
      for (k = 0; k < 3; k++) { var pxx = x0 + 0.3 + k * 0.45; pr(b, pxx, y1 + 0.23, 19, -2, 0, 4, 2, k % 2 ? '#e5533d' : '#f0c94a'); pr(b, pxx, y1 + 0.23, 19, -2, 2, 4, 1, '#4a7a3a'); }
    }
    roofHip(b, x0 - 0.18, x1 + 0.18, y0 - 0.18, y1 + 0.18, 26, 12, SH2, SH, SHL, 5);
    if (lv >= 5) {
      var dx0 = -0.18, dx1 = 0.18, dy = y1 + 0.02;
      wall(b, dx0, dy, dx1, dy, 28, 34, '#efe8d8');
      poly(b, [P3(dx0 - 0.03, dy, 34), P3(dx1 + 0.03, dy, 34), P3(0, dy, 38)], SHL);
      var ex = R(fx(0, dy)), ey = R(fy(0, dy, 32));
      b.rect(ex - 4, ey - 2, 10, 6, '#3f8f6a'); b.rect(ex - 2, ey, 6, 2, '#ffd98f');
      for (k = 0; k < 2; k++) { var lx = k ? x1 - 0.1 : x0 + 0.1; vl(b, lx, y1 + 0.02, 9, 12, '#5d666e'); pr(b, lx, y1 + 0.02, 9, -1, 0, 3, 3, '#ffd98f'); }
    }
  }
  vl(b, x0 - 0.12, y1 + 0.3, 0, 12, '#6f4526', 2);
  wall(b, x0 - 0.25, y1 + 0.3, x0 + 0.12, y1 + 0.3, 7, 14, '#4a3220'); wall(b, x0 - 0.23, y1 + 0.3, x0 + 0.1, y1 + 0.3, 8, 13, '#e8e0cc');
  for (k = 0; k < 2; k++) hl(b, x0 - 0.2, y1 + 0.3, x0 + 0.05, y1 + 0.3, 9 + k * 2, '#8b949c');
  pr(b, x0 - 0.05, y1 + 0.3, 12, 0, 0, 2, 2, '#e5533d');
  if (lv >= 2) {
    var ax0 = x1 + 0.02, ax1 = x1 + 0.3;
    vl(b, ax1, y1, 0, 12, '#6f4526', 2); vl(b, ax1, y0 + 0.2, 0, 12, '#6f4526', 2);
    roofPlane(b, [[ax0, y0 + 0.2, 13], [ax1, y0 + 0.2, 12], [ax1, y1, 12], [ax0, y1, 13]], '#6f8a3a', '#557030', 3);
    for (k = 0; k < 6; k++) pr(b, ax1, y0 + 0.25 + k * 0.15, 12, 0, 0, 1, 2 + (k % 2), '#4a7a3a');
    miniTableK(b, x1 + 0.2, 0.25, '#e8e0cc');
  }
  if (lv >= 3) { var fz = lv >= 5 ? 46 : 38; vl(b, x1 + 0.28, y1 + 0.28, 0, fz, '#d8d2c4', 1); }
  b.outline(0.55);
}
function koopDraw(X, Y, lv) {
  var blink = lv >= 3 && gf('phase2')(T(), 0.3) ? 1 : 0;
  at(spr('koop|' + lv + '|' + blink + '|' + G().K, 0, 0, function (b) { koopStatic(b, lv, blink); }), X, Y, 0);
  var A = lv >= 4 ? 0.78 : 0.6, B = lv >= 4 ? 0.62 : 0.52;
  if (lv >= 3) flagAt(X + A + 0.28, Y + B + 0.28, lv >= 5 ? 46 : 38, 18, 12);
  return lv <= 2 ? 27 : lv >= 5 ? 40 : 38;
}

/* ---------- MEZAT SALONU ---------- */
function bellSpr() { return L.sprite('bell|' + G().K, function (b) { b.rect(-3, 0, 7, 6, '#c9952f'); b.rect(-4, 4, 9, 3, '#c9952f'); b.rect(-3, 0, 7, 1, '#e6be59'); b.rect(-3, 1, 2, 5, '#e6be59'); b.rect(0, 7, 2, 2, '#8a6a20'); b.outline(0.5); }); }
function mezStatic(b, lv) {
  var k, SL = '#56657a', SL2 = '#6d7d93', SLD = '#3c4757', WD = '#6f4526';
  if (lv >= 3) {
    var tx0 = -0.95, ty0 = -0.95, TS = 0.36, TH = lv >= 5 ? 44 : 30;
    if (lv >= 5) {
      box(b, tx0, ty0, TS, TS, 0, TH, '#e2d8c0', stoneW('#b3a684'), stoneW('#cbbf9f'));
      winF(b, tx0 + 0.08, tx0 + TS - 0.08, ty0 + TS, TH - 12, TH - 3, '#2e2a26', null);
      var clx = R(fx(tx0 + TS / 2, ty0 + TS)), cly = R(fy(tx0 + TS / 2, ty0 + TS, TH - 17));
      for (var cy = -6; cy <= 6; cy++) for (var cxx = -6; cxx <= 6; cxx++) if (cxx * cxx + cy * cy <= 38) b.set(clx + cxx, cly + cy, cxx * cxx + cy * cy > 26 ? '#c9952f' : '#f4f0e4');
      b.rect(clx, cly - 4, 1, 5, '#2e2a26'); b.rect(clx, cly, 4, 1, '#2e2a26');
      roofHip(b, tx0 - 0.04, tx0 + TS + 0.04, ty0 - 0.04, ty0 + TS + 0.04, TH, 12, SL2, SL, SLD, 3);
    } else {
      for (k = 0; k < 4; k++) vl(b, tx0 + (k % 2) * TS, ty0 + (k < 2 ? 0 : TS), 0, TH, WD, 2);
      hl(b, tx0, ty0 + TS, tx0 + TS, ty0 + TS, TH - 8, WD); hl(b, tx0 + TS, ty0, tx0 + TS, ty0 + TS, TH - 8, WD);
      hl(b, tx0, ty0 + TS, tx0 + TS, ty0 + TS, 8, WD); line(b, fx(tx0, ty0 + TS), fy(tx0, ty0 + TS, 8), fx(tx0 + TS, ty0 + TS), fy(tx0 + TS, ty0 + TS, TH - 8), WD);
      if (lv >= 4) roofHip(b, tx0 - 0.05, tx0 + TS + 0.05, ty0 - 0.05, ty0 + TS + 0.05, TH, 8, SL2, SL, SLD, 2);
      else box(b, tx0 - 0.03, ty0 - 0.03, TS + 0.06, TS + 0.06, TH, TH + 1, '#ab7a48', WD, WD);
    }
  }
  var x0 = -0.62, x1 = 0.85, y0 = -0.6, y1 = 0.8;
  if (lv === 1) {
    x0 = -0.6; x1 = 0.6; y0 = -0.5; y1 = 0.5;
    box(b, -0.35, -0.15, 0.7, 0.3, 0, 5, woodH('#ab7a48', 3), woodV('#6f4526', 4), woodV('#8a5a33', 4));
    for (k = 0; k < 3; k++) crateK(b, -0.2 + k * 0.2, 0, 5, '#a9743f');
    for (k = 0; k < 4; k++) vl(b, k % 2 ? x1 : x0, k < 2 ? y0 : y1, 0, 15, WD, 2);
    for (k = 0; k < 6; k++) { var a0 = x0 + (x1 - x0) * k / 6, a1 = x0 + (x1 - x0) * (k + 1) / 6; roofPlane(b, [[a0, y0, 16], [a1, y0, 16], [a1, y1, 14], [a0, y1, 14]], k % 2 ? '#f4f0e4' : '#2a4c7d'); }
    vl(b, -0.9, 0.6, 0, 18, WD, 2); hl(b, -0.9, 0.6, -0.7, 0.6, 18, WD);
    b.outline(0.55); return;
  }
  var Z0 = lv >= 3 ? 2 : 0, CH = lv >= 3 ? 18 : 15, colC = lv >= 3 ? '#e2d8c0' : WD;
  if (lv >= 3) box(b, x0 - 0.05, y0 - 0.05, x1 - x0 + 0.1, y1 - y0 + 0.1, 0, 2, function (u, v) { return ((Math.floor(u / 6) + Math.floor(v / 6)) % 2) ? '#c9bfa8' : '#d6ccb4'; }, '#9a8c72', '#b0a286');
  if (lv >= 4) { wall(b, x0, y0, x1, y0, Z0, Z0 + 6, stoneW('#cbbf9f')); wall(b, x0, y0, x0, y1, Z0, Z0 + 6, stoneW('#b3a684')); }
  var nC = Math.min(6, lv + 2);
  for (k = 0; k < nC; k++) crateK(b, x0 + 0.3 + (k % 3) * 0.3, -0.2 + Math.floor(k / 3) * 0.3, Z0, k % 2 ? '#a9743f' : '#8a5a33');
  box(b, x1 - 0.45, -0.35, 0.28, 0.3, Z0, Z0 + 8, '#ab7a48', woodV('#6f4526', 3), woodV('#8a5a33', 3));
  pr(b, x1 - 0.31, -0.05, Z0 + 10, -2, 0, 5, 3, '#2e2a26');
  if (lv >= 2) for (k = 0; k < 2; k++) box(b, x0 + 0.25, 0.3 + k * 0.22, 0.8, 0.08, Z0, Z0 + 3, '#c9975f', '#6f4526', '#ab7a48');
  var CX = [x0, x0 + (x1 - x0) / 3, x0 + 2 * (x1 - x0) / 3, x1], CY = [y0, (y0 + y1) / 2, y1];
  function col(cx, cy2) {
    var qx = R(fx(cx, cy2)), qy = R(fy(cx, cy2, Z0 + CH)), h2 = CH * KK;
    b.rect(qx - 2, qy, 5, h2, colC); b.rect(qx + 2, qy, 1, h2, dark(colC, 0.2));
    if (lv >= 3) { b.rect(qx - 2, qy, 1, h2, '#fff4e0'); b.rect(qx - 3, qy, 7, 3, colC); b.rect(qx - 3, qy + h2 - 3, 7, 3, colC); b.rect(qx - 3, qy, 7, 1, '#fff4e0'); }
  }
  for (k = 0; k < CY.length - 1; k++) col(x1, CY[k]);
  for (k = 0; k < CX.length; k++) col(CX[k], y1);
  if (lv >= 5) for (k = 0; k < CX.length - 1; k++) {
    var m = (CX[k] + CX[k + 1]) / 2, axp = R(fx(m, y1)), azp = R(fy(m, y1, Z0 + CH - 2));
    for (var q = -12; q <= 12; q++) { var hh2 = Math.round(Math.sqrt(Math.max(0, 144 - q * q)) / 3); b.rect(axp + q, azp - hh2, 1, 3, '#e2d8c0'); b.set(axp + q, azp - hh2 + 3, '#b3a684'); }
  }
  if (lv >= 3) { wall(b, x0 - 0.05, y1 + 0.05, x1 + 0.05, y1 + 0.05, Z0 + CH, Z0 + CH + 3, '#cbbf9f'); wall(b, x1 + 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, Z0 + CH, Z0 + CH + 3, '#d8cdb4'); }
  if (lv === 2) roofGableX(b, x0 - 0.1, x1 + 0.1, y0 - 0.1, y1 + 0.1, CH, 7, '#8d959b', '#5a6167', '#6f4526', '#5a6167', 6);
  else roofHip(b, x0 - 0.12, x1 + 0.12, y0 - 0.12, y1 + 0.12, Z0 + CH + 3, 11, SL2, SL, SLD, 5);
  if (lv === 2) { vl(b, -0.9, 0.85, 0, 20, WD, 2); hl(b, -0.9, 0.85, -0.72, 0.85, 20, WD); }
  if (lv >= 5) {
    var bsx = R(fx(x1 + 0.12, y1 + 0.12)), bsy = R(fy(x1 + 0.12, y1 + 0.12, Z0 + CH + 2));
    b.rect(bsx, bsy, 1, 28, '#5d666e'); b.rect(bsx + 1, bsy + 2, 12, 18, '#a83d2b'); b.rect(bsx + 3, bsy + 6, 8, 2, '#d9a441'); b.rect(bsx + 5, bsy + 10, 4, 4, '#e6be59');
    for (k = 0; k < 6; k++) b.set(bsx + 1 + k * 2, bsy + 20, '#a83d2b');
  }
  b.outline(0.55);
}
function mezDraw(X, Y, lv) {
  var t = T(), ring = gf('phase2')(t, 3) && G().day.phase === 'closing', rx = ring ? 1 : 0, bs = bellSpr();
  at(spr('mez|' + lv + '|' + G().K, 0, 0, function (b) { mezStatic(b, lv); }), X, Y, 0);
  function bell(x, y, z) { L.blit(bs, R(pX(x, y)) + rx, R(pY(x, y, z))); }
  if (lv >= 3) { var tx0 = X - 0.95, ty0 = Y - 0.95, TS = 0.36, TH = lv >= 5 ? 44 : 30; if (lv >= 5) bell(tx0 + TS / 2, ty0 + TS, TH - 10); else bell(tx0 + TS / 2, ty0 + TS / 2, TH - 7); }
  if (lv === 1) { bell(X - 0.75, Y + 0.6, 12); return 22; }
  if (lv === 2) bell(X - 0.76, Y + 0.85, 14);
  var Z0 = lv >= 3 ? 2 : 0, CH = lv >= 3 ? 18 : 15;
  return lv >= 5 ? 58 : lv >= 3 ? Z0 + CH + 14 : 24;
}
var SERVK = { buzhane: buzDraw, restoran: restDraw, nakliye: nakDraw, koop: koopDraw, mezat: mezDraw };
HKA.drawBuzhane = function (X, Y, lv) { return buzDraw(X, Y, lv); };
HKA.drawRestoran = function (X, Y, lv) { return restDraw(X, Y, lv); };
HKA.drawNakliye = function (X, Y, lv) { return nakDraw(X, Y, lv); };
HKA.drawKoop = function (X, Y, lv) { return koopDraw(X, Y, lv); };
HKA.drawMezat = function (X, Y, lv) { return mezDraw(X, Y, lv); };

/* inşaat iskelesi + çerçeve (kesikli altın çizgi, kayan) */
function dashDiamond(key, w, h, z, col, fr, n) {
  return spr(key + '|' + fr + '|' + G().K, 0, 0, function (b) {
    var pts = [[-w, -h], [w, -h], [w, h], [-w, h]];
    for (var e = 0; e < 4; e++) {
      var a = P3(pts[e][0], pts[e][1], z), c = P3(pts[(e + 1) % 4][0], pts[(e + 1) % 4][1], z), len = Math.max(Math.abs(c[0] - a[0]), Math.abs(c[1] - a[1]));
      for (var i = 0; i <= len; i++) { if (((i + fr) >> (n || 2)) % 2) continue; var t = i / len; b.set(R(a[0] + (c[0] - a[0]) * t), R(a[1] + (c[1] - a[1]) * t), col); }
    }
  });
}
function scaffoldSpr(fw, hh) {
  return spr('scaf|' + fw + '|' + hh + '|' + G().K, 0, 0, function (b) {
    for (var c2 = 0; c2 < 4; c2++) { var ox = c2 % 2 ? fw : -fw, oy = c2 < 2 ? -fw : fw; vl(b, ox * 0.8, oy * 0.8, 0, hh * 0.7, '#ab7a48', 2); }
    hl(b, -fw * 0.8, fw * 0.8, fw * 0.8, fw * 0.8, hh * 0.7, '#8a5a32'); hl(b, fw * 0.8, -fw * 0.8, fw * 0.8, fw * 0.8, hh * 0.7, '#8a5a32');
    hl(b, -fw * 0.8, fw * 0.8, fw * 0.8, fw * 0.8, hh * 0.45, '#ab7a48'); hl(b, fw * 0.8, -fw * 0.8, fw * 0.8, fw * 0.8, hh * 0.45, '#ab7a48');
    line(b, fx(-fw * 0.8, fw * 0.8), fy(-fw * 0.8, fw * 0.8, 0), fx(fw * 0.8, fw * 0.8), fy(fw * 0.8, fw * 0.8, hh * 0.7), '#c99558');
    b.outline(0.5);
  });
}
function flashSpr() { return spr('sflash|' + G().K, 0, 0, function (b) { quadW(b, -1, -1, 2, 2, 0.6, function (X, Y) { return L.bayer[Y & 3][X & 3] < 0.6 ? '#ffe27a' : '#fff0b0'; }); }); }
HKA.drawServ = function (p) {
  var id = p.b, d = gf('sdef')(id), st = G().v('servState')[id];
  if (!d || !st) return;
  var lv = st.lvl, M2 = gv('SERV_MAT')[lv - 1], fw = M2.foot, hh = M2.h, addPuff = gf('addPuff'), t = T();
  function rnd(a, b) { return a + Math.random() * (b - a); }
  if (st.cons > 0 && !st.fresh) { if (Math.random() < 0.3) addPuff(p.x + rnd(-0.5, 0.5), p.y + rnd(-0.5, 0.5), '#d8cfae'); }
  if (st.cons > 0 && st.fresh) {
    at(dashDiamond('sdash|' + fw, fw, fw, 0, '#ffc94a', Math.floor(t * 8) % 4, 1), p.x, p.y, 0);
    if (st.cons < 1.6) at(scaffoldSpr(fw, hh), p.x, p.y, 0);
    if (st.cons > 0.5 && Math.random() < 0.25) addPuff(p.x + rnd(-0.6, 0.6), p.y + rnd(-0.6, 0.6), '#d8cfae');
    gf('uiText')(p.x, p.y, hh + 12, '⚒', P().gold, 13, 0.9);
    return;
  }
  gf('shadow')(p.x, p.y, 1.15);
  var top = SERVK[id] ? SERVK[id](p.x, p.y, lv) : hh;
  hh = top;
  if (st.flash > 0) at(flashSpr(), p.x, p.y, 0, Math.min(0.5, st.flash * 0.35));
  var pl = G().player, NM = gf('NM');
  if (G().v('servSel') === id || (G().v('barTab') === 'serv' && G().v('servPick') === id)) gf('uiLabel')(p.x, p.y, hh + 10, NM(d.n) + ' Lv.' + lv, P().gold, 1);
  else if (d2(pl.x, pl.y, p.x, p.y) < 12) gf('uiLabel')(p.x, p.y, hh + 10, NM(d.n).slice(0, 10) + ' ' + lv, '#e8ddc8', 0.85);
};

/* ---------- yapı noktası binaları (drawBuilding) ---------- */
function bigBold(b, str, x, y, c) { L.text(b, str, x, y, c); L.text(b, str, x + 1, y, c); return L.textW(str) + 1; }
function slotBStatic(b, id, fr, lang) {
  var k;
  if (id === 'kulube') {
    box(b, -0.62, -0.62, 1.24, 1.24, 0, 13, '#d2a468', woodV('#7a4e2a', 4), woodV('#9a6836', 4));
    roofHip(b, -0.74, 0.74, -0.74, 0.74, 13, 9, '#cb5b40', '#b5432f', '#7d2c1d', 4);
    winF(b, -0.15, 0.15, 0.62, 0, 10, woodV('#5a4230', 3), '#3a2a1c'); pr(b, 0.08, 0.62, 5, 0, 0, 1, 2, '#c9952f');
    winR(b, 0.62, -0.3, 0.05, 5, 10, '#ffd98f', '#6a4224'); vl(b, 0.62, -0.12, 5, 10, '#6a4224');
    box(b, -0.55, 0.7, 0.22, 0.18, 0, 4, '#c8553d', '#a83d2b', '#8e3324'); box(b, -0.53, 0.72, 0.18, 0.14, 4, 7, '#4a7a3a', '#2f5136', '#436b45');
  } else if (id === 'cay') {
    box(b, -0.48, -0.48, 0.96, 0.96, 0, 8, '#a9743f', woodV('#5d3c1c', 4), woodV('#6f4830', 4));
    var sx = 0, sy = R(fy(0, 0, 8));
    for (var y = -18; y < 0; y++) for (var x = -10; x <= 10; x++) { var w = y > -4 ? 7 : y > -16 ? 10 : 6; if (Math.abs(x) > w) continue; b.set(sx + x, sy + y - 16 + 16, x < -w * 0.3 ? '#e6be59' : x > w * 0.5 ? '#9a7320' : '#c9952f'); }
    b.rect(sx - 12, sy - 22, 24, 4, '#9a7320'); b.rect(sx - 12, sy - 22, 24, 1, '#c9952f'); b.rect(sx - 4, sy - 26, 8, 4, '#c9952f'); b.rect(sx - 2, sy - 28, 4, 2, '#e6be59');
    b.rect(sx + 10, sy - 10, 4, 3, '#c9952f'); b.rect(sx + 13, sy - 8, 1, 2, '#9a7320');
    for (k = 0; k < 2; k++) { var gx = sx - 18 + k * 6; b.rect(gx, sy - 6, 4, 6, '#d8a45a'); b.rect(gx + 1, sy - 6, 2, 1, '#b8501e'); b.rect(gx, sy - 7, 4, 1, '#f4ead6'); b.rect(gx - 1, sy, 6, 1, '#f4ead6'); }
  } else if (id === 'buz') {
    box(b, -0.42, -0.36, 0.84, 0.72, 0, 16, '#e4eaee', panelW('#9fb0ba', '#8a9aa4', 6), panelW('#c3d0d8', '#aebcc4', 6));
    var px0 = R(fx(-0.42, 0.36)), py0 = R(fy(-0.42, 0.36, 0));
    wall(b, -0.3, 0.36, 0.2, 0.36, 9, 13, '#2f6f9f'); wall(b, -0.25, 0.36, -0.08, 0.36, 10, 12, '#9fd4e6');
    hl(b, -0.42, 0.36, 0.42, 0.36, 6, '#7d8a92');
    box(b, 0.2, 0.25, 0.45, 0.35, 0, 5, '#3f86b8', '#255a80', '#2f6f9f');
    var bx = R(fx(0.42, 0.42)), by = R(fy(0.42, 0.42, 5));
    b.rect(bx - 6, by - 4, 4, 4, '#eef7fb'); b.rect(bx, by - 6, 4, 4, '#dff1f8'); b.rect(bx + 4, by - 2, 4, 3, '#eef7fb'); b.set(bx - 6, by - 4, '#ffffff');
  } else if (id === 'pano') {
    rc(b, -2, -13, 2, 13, '#6f4526'); rc(b, 1, -13, 2, 13, '#6f4526'); rc(b, -2, -13, 1, 13, '#8a5a32');
    rc(b, -13, -28, 27, 16, '#0a1a27'); rc(b, -12, -27, 25, 14, '#e8e0cc'); rc(b, -12, -27, 25, 4, '#a83d2b'); rc(b, -12, -16, 25, 3, '#a83d2b');
    for (k = 0; k < 6; k++) rc(b, -10 + k * 4, -26, 2, 2, '#ede4cf');
    var word = lang === 'tr' ? 'TAZE BALIK' : 'FRESH FISH', ww = L.textW(word) + 1;
    bigBold(b, word, -Math.floor(ww / 2), -44, '#1a4a6b');
  } else if (id === 'depo') {
    box(b, -0.52, -0.38, 1.04, 0.76, 0, 2, '#b8895a', '#7a4e2a', '#9a6a3d');
    box(b, -0.45, -0.32, 0.9, 0.64, 2, 11, '#3f86b8', '#255a80', '#2f6f9f');
    box(b, -0.47, -0.34, 0.94, 0.68, 11, 13, '#f4f8fa', '#cfdde5', '#dde8ee');
    wall(b, -0.3, 0.32, 0.3, 0.32, 5, 7, '#f4f8fa'); wall(b, -0.08, 0.32, 0.08, 0.32, 9, 11, '#dde3e6'); wall(b, 0.45, -0.12, 0.45, 0.12, 6, 8, '#cfdde5');
    var tsx = R(fx(0.2, 0.32)), tsy = R(fy(0.2, 0.32, 13));
    b.rect(tsx, tsy - 4, 6, 4, '#8fa7b3'); b.rect(tsx + 4, tsy - 8, 4, 4, '#a9bfca');
  } else if (id === 'vinc') {
    rc(b, -7, -4, 14, 4, '#3c4650'); rc(b, -7, -5, 14, 1, '#5a6772');
    for (var yy = -32; yy < -4; yy++) { b.rect(-2, yy * 2, 6, 2, '#c9952f'); b.set(-2, yy * 2, '#e6be59'); if ((yy & 3) === 0) b.rect(-2, yy * 2, 6, 1, '#9a7320'); }
    rc(b, -13, -34, 26, 3, '#c9952f'); rc(b, -13, -34, 26, 1, '#e6be59');
    for (k = 0; k < 12; k++) line(b, -26 + k * 4, -64, -24 + k * 4, -62, '#9a7320');
    rc(b, 10, -31, 0.5, 10, '#8b949c'); rc(b, 8, -21, 5, 4, '#ab7a48'); rc(b, 8, -21, 5, 1, '#c9975f');
  } else if (id === 'agsaha') {
    rc(b, -14, -18, 2, 18, '#6f4526'); rc(b, 12, -18, 2, 18, '#5a3a20'); rc(b, -14, -19, 28, 2, '#6f4526');
    for (var r2 = 0; r2 < 6; r2++) { var off = R(Math.sin(fr / 4 * Math.PI * 2 + r2) * 1.2); for (var xx = -26; xx < 26; xx++) b.set(xx, -32 + r2 * 6 + off + ((xx & 3) === 0 ? 1 : 0), '#ded1a8'); }
    for (var c2 = 0; c2 < 9; c2++) b.rect(-26 + c2 * 6, -32, 1, 32, '#cfc29a');
    rc(b, -8, -6, 3, 3, '#a83d2b'); rc(b, 4, -9, 3, 3, '#ede4cf');
    for (var y2 = -10; y2 < 0; y2++) for (var x2 = -6; x2 < 8; x2++) b.set(x2, y2, ((x2 + (y2 >> 1)) % 3 === 0) ? '#96763f' : '#b8924f');
  } else if (id === 'kantar') {
    rc(b, -9, -4, 19, 4, '#8e8878'); rc(b, -9, -5, 19, 1, '#aaa494'); rc(b, -1, -22, 2, 18, '#5d666e'); rc(b, -1, -22, 1, 18, '#8b949c');
    var tilt = fr - 1;
    rc(b, -9, -24, 19, 2, '#5d666e');
    rc(b, -9, -23 + tilt, 5, 1, '#c9952f'); rc(b, 5, -23 - tilt, 5, 1, '#c9952f'); rc(b, -8, -22 + tilt, 3, 2, '#e6be59'); rc(b, 6, -22 - tilt, 3, 2, '#e6be59');
    rc(b, -3, -18, 7, 6, '#2e2a26'); rc(b, -2, -17, 5, 4, '#cfe6a8'); b.rect(-2, -32, 4, 1, '#5a7a3a');
  } else if (id === 'cekek') {
    for (k = 0; k < 7; k++) { rc(b, -20 + k * 4, 1 + k, 20, 2, '#7a5e3a'); rc(b, -20 + k * 4, 1 + k, 20, 0.5, '#9a7a50'); }
    rc(b, -2, -20, 3, 16, '#5d666e'); rc(b, -6, -22, 11, 3, '#5d666e'); rc(b, -6, -19, 2, 4, '#8b949c');
    rc(b, -11, -11, 22, 5, '#8a5a2e'); rc(b, -10, -13, 20, 2, '#a8683a'); rc(b, -9, -14, 18, 1, '#e8d9b8'); rc(b, -9, -9, 18, 1, '#1f8fbf'); rc(b, -1, -22, 2, 9, '#5d3c1c');
  }
  b.outline(0.55);
}
HKA.drawBuilding = function (s) {
  var id = s.b, t = T(), fr = 0, lang = '';
  if (id === 'agsaha') fr = Math.floor(t * 1.1 / (Math.PI * 2) * 4) % 4;
  else if (id === 'kantar') { var tl = Math.sin(t * 1.3); fr = tl > 0.5 ? 2 : tl < -0.5 ? 0 : 1; }
  else if (id === 'pano') lang = G().v('lang');
  if (id === 'kulube' || id === 'cay' || id === 'buz' || id === 'depo' || id === 'kantar') gf('shadow')(s.x, s.y, id === 'kulube' ? 0.8 : id === 'cay' || id === 'buz' ? 0.6 : 0.7);
  at(spr('slotb|' + id + '|' + fr + '|' + lang + '|' + G().K, 0, 0, function (b) { slotBStatic(b, id, fr, lang); }), s.x, s.y, 0);
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  if (id === 'cay') { var a = 0.32 + Math.sin(t * 3) * 0.1, ph = Math.floor(t * 4) % 2; L.fr(sx, sy, -1 + ph, -60, 2, 4, 'rgba(255,255,255,' + a + ')'); L.fr(sx, sy, 0 - ph, -66, 2, 5, 'rgba(255,255,255,' + (a * 0.7) + ')'); }
  else if (id === 'buz') { L.fr(sx, sy, 4, -24, 2, 2, Math.sin(t * 4) > 0 ? '#8ef2a2' : '#2f5a3a'); if (Math.random() < 0.02) gf('addPuff')(s.x, s.y, '#eef7fb'); }
  else if (id === 'depo') { if (Math.random() < 0.02) gf('addPuff')(s.x, s.y, '#eef7fb'); }
};
HKA.drawSlot = function (s) {
  if (s.b) { gf('drawBuilding')(s); return; }
  var pl = G().player, near = d2(pl.x, pl.y, s.x, s.y) < 40;
  at(dashDiamond('slotd', 0.6, 0.5, 0.4, '#c9a15e', Math.floor(T() * 6 * 2) % 8 >> 1, 2), s.x, s.y, 0, near ? 0.9 : 0.45);
  if (near) gf('uiText')(s.x, s.y, 7, '🔨', '#ffc94a', 13, 0.9);
};
HKA.drawPlot = function (p) {
  var bt = G().v('barTab'), sp = G().v('servPick'), pl = G().player;
  var ghost = bt === 'serv' && sp && p.allow.indexOf(sp) >= 0 && !p.b;
  var near = d2(pl.x, pl.y, p.x, p.y) < 26;
  if (!ghost && !near) return;
  var fr = Math.floor(T() * 8 * 2) % 8 >> 1;
  if (ghost) at(spr('pghost|' + G().K, 0, 0, function (b) { quadW(b, -0.7, -0.7, 1.4, 1.4, 0.4, function (X, Y) { return L.bayer[Y & 3][X & 3] < 0.5 ? '#5fd37a' : null; }); }), p.x, p.y, 0, 0.16 + Math.sin(T() * 4) * 0.06 + 0.2);
  at(dashDiamond(ghost ? 'pdashg' : 'pdash', 0.7, 0.7, 0, ghost ? '#5fd37a' : '#c9a15e', fr, 2), p.x, p.y, 0, ghost ? 0.95 : 0.3);
  if (ghost) gf('uiLabel')(p.x, p.y, 10, gf('NM')(p.n), '#9df5b0', 1);
  else if (near) gf('uiText')(p.x, p.y, 6, '🏗️', '#c9a15e', 11, 0.7);
};
/* kurulmamış parsel: kesikli çerçeve + eski püskü malzeme */
function plotOutlineK(o, label, col) {
  var pl = G().player;
  at(dashDiamond('pout|' + o.w + 'x' + o.h + '|' + (col || ''), o.w / 2, o.h / 2, 0, col || '#c9a15e', Math.floor(T() * 6 * 2) % 8 >> 1, 2), o.x, o.y, 0);
  if (d2(pl.x, pl.y, o.x, o.y) < 30) gf('uiLabel')(o.x, o.y, 14, label, '#ffc94a', 0.85);
  gf('drawJunk')({ x: o.x - 0.35, y: o.y - 0.1, t: 'tahta', v: 0.2 });
  gf('drawJunk')({ x: o.x + 0.45, y: o.y + 0.25, t: o.w > 2 ? 'varil' : 'kasa', v: 0.7 });
}

/* ---------- TİCARET OFİSİ: iki katlı taş ticaret evi, cumba, kırma çatı, kontrat panosu ---------- */
function officeStatic(b, o, na) {
  var x0 = -o.w / 2, y0 = -o.h / 2, x1 = x0 + o.w, y1 = y0 + o.h, k;
  quadW(b, x0 - 0.15, y0 - 0.15, o.w + 0.3, o.h + 0.55, 0.4, function (X, Y) { return (((X >> 3) + (Y >> 2)) % 2) ? '#b9ad92' : '#c4b89c'; });
  box(b, x0, y0, o.w, o.h, 0, 3, '#9a8c72', '#7d725c', '#8a7f68');
  box(b, x0 + 0.04, y0 + 0.04, o.w - 0.08, o.h - 0.08, 3, 17, '#ded1b6', stoneW('#cbbc9e'), stoneW('#d5c8ac'));
  winF(b, -0.24, 0.24, y1 - 0.04, 3, 13, woodV('#4a2f1c', 3), '#9a8c72');
  for (var q = -6; q <= 6; q++) { var hq = Math.round(Math.sqrt(Math.max(0, 36 - q * q)) / 2.2); pr(b, q * 0.04, y1 - 0.04, 13, 0, -hq, 0.5, hq + 1, '#4a2f1c'); }
  wall(b, x0 + 0.2, y1 - 0.04, x1 - 0.2, y1 - 0.04, 15.5, 17, '#2a4c7d');
  winF(b, x0 + 0.18, x0 + 0.42, y1 - 0.04, 7, 12, '#ffd98f', '#6f4526'); winF(b, x1 - 0.42, x1 - 0.18, y1 - 0.04, 7, 12, '#ffd98f', '#6f4526');
  winR(b, x1 - 0.04, -0.2, 0.2, 7, 12, '#e8bd6f', '#6f4526');
  box(b, x0 + 0.08, y0 + 0.02, o.w - 0.16, o.h + 0.12, 17, 30, '#f1ebda', '#d8cfb8', '#e6dec9');
  hl(b, x0 + 0.08, y1 + 0.14, x1 - 0.08, y1 + 0.14, 17, '#6f4526'); hl(b, x0 + 0.08, y1 + 0.14, x1 - 0.08, y1 + 0.14, 17.5, '#6f4526'); hl(b, x0 + 0.08, y1 + 0.14, x1 - 0.08, y1 + 0.14, 30, '#6f4526');
  for (k = 0; k < 4; k++) pr(b, x0 + 0.15 + k * 0.5, y1 + 0.14, 16, 0, 0, 1, 2, '#4a2f1c');
  for (k = 0; k < 3; k++) { var wx = x0 + 0.28 + k * 0.45; winF(b, wx, wx + 0.24, y1 + 0.14, 20, 27, '#ffd98f', '#6f4526'); vl(b, wx + 0.12, y1 + 0.14, 20, 27, '#6f4526'); }
  winR(b, x1 - 0.08, -0.3, -0.05, 20, 27, '#e8bd6f', '#6f4526'); winR(b, x1 - 0.08, 0.15, 0.4, 20, 27, '#e8bd6f', '#6f4526');
  roofHip(b, x0 - 0.12, x1 + 0.12, y0 - 0.1, y1 + 0.26, 30, 11, '#cb5b40', '#b5432f', '#7d2c1d', 4);
  var bx = x1 + 0.45, by = y1 + 0.3;
  vl(b, bx - 0.25, by, 0, 13, '#6f4526', 2); vl(b, bx + 0.25, by, 0, 13, '#6f4526', 2);
  wall(b, bx - 0.3, by, bx + 0.3, by, 6, 13, woodH('#8a5a33', 3));
  for (k = 0; k < Math.min(4, na); k++) { var nx = bx - 0.22 + k * 0.13; wall(b, nx, by + 0.001, nx + 0.09, by + 0.001, 8 + (k % 2), 11.5 + (k % 2), '#f4f0e4'); pr(b, nx + 0.045, by, 11.5 + (k % 2), 0, 0, 1, 1, '#e5533d'); }
  vl(b, x1 + 0.2, y0 + 0.1, 0, 46, '#d8d2c4', 1);
  b.outline(0.55);
}
HKA.drawOffice = function () {
  var o = gv('office'), Tt = gf('T');
  if (!gf('officeBuilt')()) { plotOutlineK(o, '🏛️ ' + Tt('office')); return; }
  var M = G().v('M'), na = (M && M.active) ? M.active.length : 0;
  gf('shadow')(o.x, o.y, 1.3);
  at(spr('office|' + Math.min(4, na) + '|' + G().K, 0, 0, function (b) { officeStatic(b, o, na); }), o.x, o.y, 0);
  var x1 = o.x + o.w / 2, y0 = o.y - o.h / 2, y1 = o.y + o.h / 2;
  flagAt(x1 + 0.2, y0 + 0.1, 46, 20, 12);
  var pl = G().player;
  if (d2(pl.x, pl.y, o.x, o.y + 1.1) < 4) gf('uiLabel')(o.x, o.y, 48, Tt('office'), P().gold, 1);
  if (na) gf('uiBadge')(x1 + 0.45, y1 + 0.3, 16, na + '/' + gf('maxActive')(), '#9df5b0');
};

/* ---------- KAPALI PAZAR (proje): temel → kolonlar → kagir hal → tabela → açılış ---------- */
function projStatic(b, p, st, lang) {
  var x = -p.w / 2, y = -p.h / 2, i, j, ar;
  if (st === 0) {
    rc(b, -11, -16, 22, 10, '#4a3220'); rc(b, -10, -15, 20, 8, '#d9a441'); rc(b, -10, -15, 20, 1, '#f0c870');
    rc(b, -8, -13, 16, 0.5, '#3a2401'); rc(b, -8, -11, 11, 0.5, '#3a2401'); rc(b, -1, -6, 2, 6, '#6f4526');
    b.outline(0.55); return;
  }
  quadW(b, x, y, p.w, p.h, 0.6, function (X, Y) { return hash(X >> 1, Y >> 1) > 0.9 ? '#8a8270' : '#9a927f'; });
  if (st >= 1) for (i = 0; i <= 2; i++) for (j = 0; j <= 2; j++) { var px0 = x + i * p.w / 2, py0 = y + j * p.h / 2; vl(b, px0, py0, 0, 6, '#6b5334', 3); pr(b, px0, py0, 7, -1, 0, 3, 1, '#8a6c46'); }
  if (st >= 2 && st < 3) {
    [[x + 0.2, y + 0.2], [x + p.w - 0.2, y + 0.2], [x + 0.2, y + p.h - 0.2], [x + p.w - 0.2, y + p.h - 0.2]].forEach(function (c) { box(b, c[0] - 0.08, c[1] - 0.08, 0.16, 0.16, 0, 28, '#ddd8c8', '#c9c3b2', '#b8b2a2'); });
    hl(b, x + 0.2, y + p.h - 0.2, x + p.w - 0.2, y + p.h - 0.2, 28, '#b8b2a2'); hl(b, x + p.w - 0.2, y + 0.2, x + p.w - 0.2, y + p.h - 0.2, 28, '#b8b2a2');
  }
  if (st >= 3) {
    var X0 = x + 0.15, X1 = x + p.w - 0.15, Y0 = y + 0.15, Y1 = y + p.h - 0.15, ym2 = (Y0 + Y1) / 2;
    box(b, X0, Y0, X1 - X0, Y1 - Y0, 0, 22, '#e6dcc4', stoneW('#bfae8c'), stoneW('#d2c1a0'));
    for (ar = 0; ar < 4; ar++) {
      var ax0 = X0 + 0.1 + ar * (X1 - X0 - 0.2) / 4, ax1 = ax0 + (X1 - X0 - 0.2) / 4 - 0.08, am = (ax0 + ax1) / 2;
      winF(b, ax0, ax1, Y1, 0, 12, '#4a3423', '#b3a17f');
      for (var q = -5; q <= 5; q++) { var hq = Math.round(Math.sqrt(Math.max(0, 25 - q * q)) / 2); pr(b, am + q * 0.012 * 1.6, Y1, 12, 0, -hq, 0.5, hq + 1, '#4a3423'); }
    }
    for (ar = 0; ar < 3; ar++) { var bY0 = Y0 + 0.12 + ar * (Y1 - Y0 - 0.24) / 3; winR(b, X1, bY0, bY0 + (Y1 - Y0 - 0.24) / 3 - 0.08, 0, 12, '#5a4230', '#c4b598'); }
    roofGableX(b, X0 - 0.1, X1 + 0.1, Y0 - 0.1, Y1 + 0.1, 22, 10, '#7d8791', '#5f6973', '#d2c1a0', '#4f5862', 5);
    box(b, X0 + 0.3, ym2 - 0.16, X1 - X0 - 0.6, 0.32, 30, 36, '#bcd6e0', '#7fa9bd', '#95bccd');
    for (ar = 1; ar < 6; ar++) vl(b, X0 + 0.3 + (X1 - X0 - 0.6) * ar / 6, ym2 + 0.16, 30, 36, '#4f5862');
    roofGableX(b, X0 + 0.26, X1 - 0.26, ym2 - 0.22, ym2 + 0.22, 36, 4, '#7d8791', '#5f6973', '#95bccd');
  }
  if (st >= 4) {
    var tw = R((p.w + p.h) * 12) - 14, ty = -20;
    for (i = 0; i < tw * KK; i++) { var bxp = -tw + i; b.set(bxp, ty * KK, '#1f8fbf'); b.set(bxp, ty * KK + 7, '#1f8fbf'); for (j = 1; j < 7; j++) b.set(bxp, ty * KK + j, '#eef6fa'); if ((i % 12) < 6 && Math.abs((i % 12) - 3) + Math.abs(j - 3.5) < 3) b.set(bxp, ty * KK + j, '#1f6fae'); }
    var lx = R(fx(0, p.h / 2)), ly = R(fy(0, p.h / 2, 28));
    b.rect(lx - 44, ly - 22, 88, 20, '#14293c'); b.rect(lx - 42, ly - 20, 84, 16, '#2a4c7d'); b.rect(lx - 42, ly - 20, 84, 1, '#4a6c9d');
    var word = lang === 'tr' ? 'KAPALI PAZAR' : 'COVERED MARKET', ww = L.textW(word) + 1;
    bigBold(b, word, lx - Math.floor(ww / 2), ly - 15, '#ffc94a');
    b.rect(lx - 46, ly - 2, 4, 18, '#5d666e'); b.rect(lx + 42, ly - 2, 4, 18, '#5d666e');
  }
  if (st >= 5) {
    for (var f = 0; f < 3; f++) { var fx2 = R(fx(-0.8 + f * 0.8, -p.h / 2)), fy2 = R(fy(-0.8 + f * 0.8, -p.h / 2, 34)); b.rect(fx2, fy2 - 20, 1, 20, '#6b5334'); }
  } else {
    var kx = R(fx(x + p.w, y)), ky = R(fy(x + p.w, y, 0));
    b.rect(kx - 2, ky - 72, 6, 72, '#c9952f'); for (var yy = ky - 72; yy < ky; yy += 6) line(b, kx - 2, yy, kx + 3, yy + 6, '#9a7320');
    b.rect(kx - 22, ky - 76, 44, 6, '#c9952f'); b.rect(kx - 22, ky - 76, 44, 1, '#e6be59');
    b.rect(kx + 14, ky - 70, 1, 18, '#8b949c'); b.rect(kx + 10, ky - 52, 10, 8, '#ab7a48'); b.rect(kx + 10, ky - 52, 10, 1, '#c9975f');
  }
  b.outline(0.55);
}
HKA.drawProject = function () {
  var p = gv('project'), st = p.stage, t = T(), Tt = gf('T'), pl = G().player, lang = st >= 4 ? G().v('lang') : '';
  var cx = R(pX(p.x, p.y)), cy = R(pY(p.x, p.y, 0));
  if (st === 0) {
    at(dashDiamond('projd', p.w / 2, p.h / 2, 0, '#ffc94a', 0, 2), p.x, p.y, 0);
    at(spr('proj|0|' + G().K, 0, 0, function (b) { projStatic(b, p, 0, ''); }), p.x, p.y, 0);
    if (d2(pl.x, pl.y, p.x, p.y) < 20) gf('labelAt')(p.x, p.y + p.h / 2 + 0.3, 20, Tt('stProject'), P().gold, '');
    return;
  }
  at(spr('proj|' + st + '|' + lang + '|' + G().K, 0, 0, function (b) { projStatic(b, p, st, lang); }), p.x, p.y, 0);
  if (st >= 4) { var lx = R(pX(p.x, p.y + p.h / 2)), ly = R(pY(p.x, p.y + p.h / 2, 28)); for (var l = 0; l < 6; l++) L.fr(lx, ly, -36 + l * 14, -27, 3, 3, (l + Math.floor(t * 2)) % 3 ? '#ffd98f' : '#f0ece0'); }
  if (st >= 5) {
    for (var f = 0; f < 3; f++) L.blit(flagSpr(Math.floor(t * 3) % 3, 12, 8), R(pX(p.x - 0.8 + f * 0.8, p.y - p.h / 2)), R(pY(p.x - 0.8 + f * 0.8, p.y - p.h / 2, 34)) - 10);
  } else {
    var pr2 = gf('projPct')();
    bar(cx - 15, cy - 46, 30, pr2, '#5fd37a');
    gf('uiText')(p.x, p.y, 50, gf('pct')(Math.round(pr2 * 100)), P().gold, 11);
  }
  if (st < 4) gf('labelAt')(p.x, p.y + p.h / 2 + 0.3, st >= 3 ? 46 : 20, gf('UP')(gf('NM')(p.n)), P().gold, '');
};

/* ---------- PERSONEL KULÜBESİ (meydan) ---------- */
function hutStatic(b, o, Lv) {
  var x0 = -o.w / 2, y0 = -o.h / 2, x1 = x0 + o.w, y1 = y0 + o.h, H = 13 + Lv * 1.5, dx = o.door.x - o.x, k;
  box(b, x0 - 0.05, y0 - 0.05, o.w + 0.1, o.h + 0.1, 0, 2, '#ded1b6', '#9a8c72', '#cbbc9e');
  var wl = Lv >= 5 ? ['#f1ebda', '#d8cfb8', '#e6dec9'] : ['#d2a468', '#7a4e2a', '#9a6836'];
  box(b, x0, y0, o.w, o.h, 2, H, wl[0], Lv < 5 ? woodH(wl[1], 4) : wl[1], Lv < 5 ? woodH(wl[2], 4) : wl[2]);
  if (Lv >= 5) { wall(b, x0, y1, x1, y1, 2, 4, '#9a8c72'); wall(b, x1, y0, x1, y1, 2, 4, '#8a7f68'); }
  winF(b, dx - 0.2, dx + 0.2, y1, 2, 11, woodV('#4a2f1c', 3), '#6a4224');
  pr(b, dx + 0.12, y1, 7, 0, 0, 1, 1, '#c9952f');
  winR(b, x1, -0.25, 0.2, 6, 11, '#ffd98f', '#6a4224'); vl(b, x1, -0.03, 6, 11, '#6a4224');
  if (Lv >= 4) winF(b, x0 + 0.2, x0 + 0.5, y1, 6, 11, '#ffd98f', '#6a4224');
  roofGableX(b, x0 - 0.12, x1 + 0.12, y0 - 0.12, y1 + 0.12, H, 8 + Lv, '#cb5b40', '#b5432f', wl[2], '#7d2c1d', 5);
  if (Lv >= 4) box(b, x0 + 0.25, -0.25, 0.2, 0.2, H + 2, H + 13 + Lv, '#b7a88a', brickW('#7d725c'), brickW('#9c9079'));
  if (Lv >= 2) {
    box(b, x1, -0.3, 0.1, 0.55, 5, 6.5, '#ab7a48', '#6f4526', '#8a5a33');
    for (k = 0; k < 4; k++) { var fy0 = -0.25 + k * 0.14; pr(b, x1 + 0.05, fy0, 8, 0, 0, 2, 2, ['#e5533d', '#ffc94a', '#f4f0e4', '#c8553d'][k]); pr(b, x1 + 0.05, fy0, 6.5, 0.5, 0, 1, 1.5, '#4a7a3a'); }
  }
  if (Lv >= 3) {
    var px0 = dx - 0.45, px1 = dx + 0.45, py = y1 + 0.45;
    vl(b, px0, py, 0, 12, '#6f4526', 2); vl(b, px1, py, 0, 12, '#6f4526', 2);
    roofPlane(b, [[px0 - 0.05, y1, 14], [px1 + 0.05, y1, 14], [px1 + 0.05, py + 0.05, 11], [px0 - 0.05, py + 0.05, 11]], '#b5432f', '#7d2c1d', 3);
    box(b, x1 - 0.45, y1 + 0.15, 0.4, 0.12, 0, 3, '#c9975f', '#6f4526', '#ab7a48');
  }
  if (Lv >= 5) vl(b, x1 + 0.1, y0 + 0.1, 0, 30, '#d8d2c4', 1);
  b.outline(0.55);
}
HKA.drawHut = function () {
  var o = gv('HUT'), Lv = o.lvl, Tt = gf('T');
  if (!Lv) { plotOutlineK(o, '🏚️ ' + Tt('hutName') + ' • ' + Tt('buildAt')); return; }
  var H = 13 + Lv * 1.5;
  gf('shadow')(o.x, o.y, 1.0);
  at(spr('hut|' + Lv + '|' + G().K, 0, 0, function (b) { hutStatic(b, o, Lv); }), o.x, o.y, 0);
  if (Lv >= 4 && Math.random() < 0.03) gf('addPuff')(o.x - o.w / 2 + 0.35, o.y - 0.15, '#d8d2c4');
  if (Lv >= 5) flagAt(o.x + o.w / 2 + 0.1, o.y - o.h / 2 + 0.1, 30, 16, 10);
  if (gf('nearDoor')(o.door)) gf('uiLabel')(o.x, o.y, H + 12 + Lv, Tt('hutName') + ' ' + Tt('level') + Lv, '#ffd9a8', 1);
};

/* ---------- DEPO BÖLME TABELASI: direkten sarkan boyalı ahşap levha + resim (yazı yok; ad yalnız çok yakında) ----------
   Köşe direği + kol + iki zincir; levha dışa (sola) sarkar. Boya yıpranmış (çıplak tahta lekeleri, tahta derzi).
   Resim: ambar → sandık + balık, soğuk → kar tanesi + buz kalıbı, kiler → kavanoz + çuval, uzantı → halat-kanca + sandıklar,
   rampa → araba tekerleği + rampa takozu. Bina sprite'ının içine çizilir (bina önbelleğiyle birlikte önbellekli). */
var WSIGN = {
  ambar: { p: '#3f7a86', s: 7 }, soguk: { p: '#47739a', s: 11 }, kiler: { p: '#8a3c2c', s: 13 },
  uzanti: { p: '#557548', s: 17 }, rampa: { p: '#4b5662', s: 19 }, ilan: { p: '#b5532f', s: 41 },   /* v2.23: İlan Bürosu standart asma tabelası */
  /* v2.22-sanat: bölge asma tabelaları (direk tente direğinin üstünden 8 ince px uzun) */
  z_iskele: { p: '#3d7a8a', s: 23, e: 8 }, z_pazar: { p: '#8a3c2c', s: 29, e: 8 }, z_fume: { p: '#5a5040', s: 31, e: 8 }, z_mutfak: { p: '#3a5f8a', s: 37, e: 8 }
};
/* v2.22-sanat — bölge tabelası resimleri (28×15): İskele hamsi, Pazar uskumru + levrek, Fümehane tütsü balığı + duman, Mutfak güveç */
function zsFish(ib, cx, cy, rx, ry, back, mid, belly, dir, stripe) {   /* dir 1: baş solda */
  for (var y = -ry; y <= ry; y++) {
    var hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / ((ry + 0.5) * (ry + 0.5)))));
    for (var x = -hw; x <= hw; x++) {
      var c = y < 0 ? back : y === 0 ? mid : belly;
      if (stripe && y < 0 && ((x + 40) % 3 === 0)) c = stripe;
      ib.set(cx + x, cy + y, c);
    }
  }
  var tx = cx + dir * (rx + 1);
  ib.set(tx, cy, back); ib.set(tx + dir, cy - 1, back); ib.set(tx + dir, cy + 1, back); ib.set(tx + dir * 2, cy - 2, back); ib.set(tx + dir * 2, cy + 2, back);
  ib.set(cx - dir * (rx - 2), cy - (ry > 1 ? 1 : 0), '#14181c');
}
function zsIcon(ib, k) {
  var i;
  if (k === 'z_iskele') {                                        /* üç ince hamsi, sırtı koyu lacivert, karnı gümüş */
    for (i = 0; i < 3; i++) zsFish(ib, 11 + (i % 2) * 4, 2 + i * 5, 9, 1, '#1f3a4e', '#8fb0c2', '#e6eef0', 1);
  } else if (k === 'z_pazar') {                                  /* uskumru (üstte, çizgili sırt) + levrek (altta, sağa bakar) */
    zsFish(ib, 12, 3, 10, 2, '#2f6f6a', '#9fc4c0', '#eef2ec', 1, '#163a36');
    zsFish(ib, 15, 11, 9, 3, '#6d7e86', '#b9c6cc', '#eef0ee', -1);
    for (i = 0; i < 4; i++) ib.set(12 + i * 2, 7, '#56656c');
  } else if (k === 'z_fume') {                                   /* çubukta asılı iki altın-kahve tütsü balığı + yükselen duman */
    ib.rect(1, 0, 18, 1, '#3a2614');
    for (i = 0; i < 2; i++) {
      var fx0 = 5 + i * 8;
      ib.set(fx0 + 1, 1, '#8d8a80');
      for (var yy = 0; yy < 10; yy++) { var hw = yy < 1 ? 1 : yy > 7 ? 1 : 2; ib.rect(fx0 + 1 - hw, 2 + yy, hw * 2 + 1, 1, yy < 3 ? '#d9a04a' : '#c98a3a'); ib.set(fx0 + 1 + hw, 2 + yy, '#8a5520'); }
      ib.set(fx0 - 1, 13, '#8a5520'); ib.set(fx0 + 3, 13, '#8a5520'); ib.set(fx0 + 1, 3, '#14181c');
    }
    [[22, 13], [21, 12], [21, 11], [22, 10], [23, 9], [23, 8], [22, 7], [21, 6], [21, 5], [22, 4], [23, 3], [24, 2]].forEach(function (p2, j) { ib.set(p2[0], p2[1], j > 8 ? '#cfc9bc' : '#ece7dc'); });
    [[25, 12], [26, 11], [26, 10], [25, 9], [25, 7], [26, 6]].forEach(function (p2) { ib.set(p2[0], p2[1], '#bdb7aa'); });
  } else {                                                       /* güveç: toprak çanak, beyaz nokta süs, kapak + tutamak, buhar */
    ib.ellipse(13, 11, 10, 3, '#b5562f'); ib.rect(3, 8, 21, 2, '#d27a4a'); ib.rect(5, 14, 17, 1, '#8a3c20');
    for (i = 0; i < 5; i++) ib.set(6 + i * 4, 11, '#f4e9d2');
    ib.ellipse(13, 6, 8, 2, '#c8683c'); ib.rect(6, 5, 15, 1, '#e0884e'); ib.rect(12, 2, 3, 2, '#8a3c20'); ib.set(13, 2, '#b5562f');
    ib.rect(1, 9, 2, 2, '#8a3c20'); ib.rect(24, 9, 2, 2, '#8a3c20');
    [[7, 3], [6, 2], [7, 1], [6, 0], [19, 3], [20, 2], [19, 1], [20, 0]].forEach(function (p2, j) { ib.set(p2[0], p2[1], j % 4 > 1 ? '#d8d0c4' : '#f4ece0'); });
  }
}

function wsIcon(k) {                                             /* 28×15 resim tamponu (0,0 sol üst) */
  var ib = L.buf(), i, a, r;
  function ln(x0, y0, x1, y1, c) { line(ib, x0, y0, x1, y1, c); }
  if (k.indexOf('z_') === 0) zsIcon(ib, k);
  else if (k === 'ambar') {
    ib.rect(1, 5, 12, 10, '#d4a458'); ib.rect(1, 5, 12, 1, '#ecc47c');                           /* sandık */
    ib.rect(1, 8, 12, 1, '#a8783a'); ib.rect(1, 11, 12, 1, '#a8783a');
    ib.rect(1, 5, 1, 10, '#b98a44'); ib.rect(12, 5, 1, 10, '#9a6a30');
    ln(2, 14, 11, 6, '#9a6a30');
    ib.ellipse(20, 7, 6, 3, '#e6e0c8');                                                          /* balık (sola bakar) */
    ib.rect(16, 4, 9, 2, '#8fb0bc'); ib.rect(15, 5, 1, 1, '#8fb0bc'); ib.rect(14, 7, 1, 1, '#e6e0c8');
    ib.rect(17, 9, 7, 1, '#c9c1a4');
    for (i = 0; i < 3; i++) ib.rect(26 + i, 6 - i, 1, 3 + i * 2, i === 2 ? '#8fb0bc' : '#d8d2bc');
    ib.set(16, 6, '#22262a'); ib.set(19, 6, '#a9c2ca'); ib.rect(21, 8, 2, 1, '#a9c2ca');
  } else if (k === 'soguk') {
    var fc = '#f2f7f9';                                                                          /* kar tanesi */
    ln(8, 1, 8, 14, fc); ln(3, 4, 13, 11, fc); ln(3, 11, 13, 4, fc);
    [[8, 1, 0, 1], [8, 14, 0, -1], [3, 4, 1, 1], [13, 11, -1, -1], [3, 11, 1, -1], [13, 4, -1, 1]].forEach(function (q) {
      var bx = q[0] + q[2] * 2, by = q[1] + q[3] * 2;
      if (q[2] === 0) { ib.set(bx - 1, by - q[3], fc); ib.set(bx + 1, by - q[3], fc); }
      else { ib.set(bx - q[2], by, fc); ib.set(bx, by - q[3], fc); }
    });
    ib.set(8, 7, '#bfe0ee'); ib.rect(7, 8, 3, 1, fc);
    ib.rect(17, 8, 8, 7, '#a9d3e6');                                                             /* buz kalıbı */
    for (r = 1; r <= 3; r++) ib.rect(17 + r, 8 - r, 8, 1, r === 3 ? '#f4fbff' : '#dcf0f8');
    for (r = 1; r <= 3; r++) ib.rect(24 + r, 8 - r, 1, 7, '#79acc8');
    ib.rect(19, 9, 1, 4, '#e8f6fc'); ib.rect(20, 9, 1, 1, '#e8f6fc'); ib.rect(22, 12, 2, 1, '#8cc0da');
  } else if (k === 'kiler') {
    ib.rect(4, 1, 7, 2, '#c9553a'); ib.set(3, 2, '#c9553a'); ib.set(11, 2, '#c9553a');            /* kavanoz: bez kapak */
    ib.rect(4, 3, 7, 1, '#e8d9a8'); ib.rect(5, 4, 5, 1, '#dfe6da');
    ib.rect(3, 5, 9, 9, '#dfe6da'); ib.rect(4, 14, 7, 1, '#dfe6da');
    ib.rect(4, 7, 7, 6, '#d99a34'); ib.rect(4, 7, 7, 1, '#ecbd5c'); ib.rect(5, 13, 5, 1, '#c2862a');
    ib.rect(5, 6, 1, 6, '#ffffff');
    ib.ellipse(21, 10, 6, 4, '#d6bd86');                                                         /* çuval */
    ib.rect(18, 4, 6, 3, '#d6bd86'); ib.rect(17, 3, 2, 2, '#e4cf9c'); ib.rect(23, 3, 2, 2, '#c4a870');
    ib.rect(18, 6, 6, 1, '#7a5a32');
    for (r = 7; r <= 13; r++) ib.set(25 + (r > 9 && r < 12 ? 1 : 0), r, '#b09466');
    ib.rect(17, 8, 1, 3, '#e4cf9c'); ib.rect(20, 10, 3, 1, '#b09466');
  } else if (k === 'uzanti') {
    for (r = 0; r < 6; r++) ib.rect(7, r, 2, 1, r % 2 ? '#a8884a' : '#dcbc72');                  /* halat */
    ib.rect(6, 6, 4, 2, '#8d969c'); ib.rect(6, 6, 4, 1, '#c9d0d6');                              /* kilit */
    ib.rect(7, 8, 2, 3, '#e2dccb');
    for (a = 0; a <= 210; a += 15) {                                                             /* kanca */
      var rr = a * Math.PI / 180, hx = R(5.5 + Math.cos(rr) * 3), hy = R(11 + Math.sin(rr) * 3);
      ib.rect(hx, hy, 2, 1, '#e2dccb');
    }
    ib.set(2, 9, '#e2dccb'); ib.set(3, 8, '#e2dccb');
    ib.rect(15, 9, 7, 6, '#d4a458'); ib.rect(15, 9, 7, 1, '#ecc47c'); ib.rect(15, 12, 7, 1, '#a8783a');   /* sandıklar */
    ib.rect(21, 4, 6, 5, '#c79650'); ib.rect(21, 4, 6, 1, '#e2b870'); ib.rect(21, 6, 6, 1, '#9a6a30');
    ib.rect(22, 9, 6, 6, '#d4a458'); ib.rect(22, 9, 6, 1, '#ecc47c'); ib.rect(22, 12, 6, 1, '#a8783a');
    ib.rect(21, 9, 1, 6, '#9a6a30');
  } else if (k === 'ilan') {                                                                     /* megafon + afiş (yazısız) */
    ib.rect(2, 6, 3, 4, '#8b949c'); ib.rect(2, 6, 3, 1, '#c9d0d6'); ib.rect(5, 5, 2, 6, '#d8dee2'); ib.rect(7, 4, 2, 8, '#e8eef2'); ib.rect(9, 3, 2, 10, '#c4553d'); ib.rect(11, 2, 1, 12, '#8b949c');
    ib.rect(3, 10, 2, 3, '#5d666e'); ib.rect(2, 12, 3, 1, '#3a4249');
    ib.set(13, 5, '#ffe9a8'); ib.set(14, 4, '#ffe9a8'); ib.set(13, 8, '#ffe9a8'); ib.set(15, 8, '#ffe9a8'); ib.set(13, 11, '#ffe9a8'); ib.set(14, 12, '#ffe9a8');   /* ses çizgileri */
    ib.rect(17, 1, 9, 13, '#f4ead6'); ib.rect(17, 1, 9, 1, '#fffbe8'); ib.rect(17, 13, 9, 1, '#c9bca0'); ib.rect(25, 1, 1, 13, '#d4c7aa');
    ib.rect(19, 3, 5, 3, '#c4553d'); ib.rect(19, 7, 5, 1, '#8f8a7a'); ib.rect(19, 9, 5, 1, '#8f8a7a'); ib.rect(19, 11, 3, 1, '#8f8a7a');
    ib.set(21, 1, '#8d8a80'); ib.set(21, 0, '#8d8a80');
  } else {                                                                                       /* rampa */
    var wc = '#efe4c8';
    for (a = 0; a < 360; a += 10) { var t2 = a * Math.PI / 180; ib.set(R(7 + Math.cos(t2) * 6), R(8 + Math.sin(t2) * 6), wc); ib.set(R(7 + Math.cos(t2) * 5), R(8 + Math.sin(t2) * 5), '#cdbf9e'); }
    ln(7, 3, 7, 13, wc); ln(2, 8, 12, 8, wc); ln(4, 5, 10, 11, '#cdbf9e'); ln(4, 11, 10, 5, '#cdbf9e');
    ib.rect(6, 7, 3, 3, '#4a3020'); ib.set(7, 8, wc);
    for (r = 0; r <= 11; r++) ib.rect(16 + r, 14 - R(r * 0.7), 1, R(r * 0.7) + 1, r === 11 ? '#c9bc98' : '#efe4c8');   /* takoz */
    for (r = 1; r <= 11; r += 3) ib.set(16 + r, 14 - R(r * 0.7), '#ffffff');
    ib.rect(16, 14, 12, 1, '#c9bc98');
  }
  return ib;
}
function wsFlip(k) { return k === 'kiler' || k === 'rampa' || k.indexOf('z_') === 0; }   /* bölge tabelaları da sağa (tezgâh etiketinden uzağa) */   /* bu ikisinde levha sağa sarkar (önlerindeki yapı örtmesin) */
function wsBoard(k) {                                            /* levha + direk, ince piksel (K=2 ölçeğinde), çapa = direk dibi */
  var m = WSIGN[k] || WSIGN.ambar, P0 = m.p, sd = m.s, sb = L.buf(), x, y, fl = wsFlip(k);
  function M(v) { return fl ? 2 - v : v; }
  function hr(x0, y0, w, c) { for (var i = 0; i < w; i++) sb.set(M(x0 + i), y0, c); }
  var wood = '#9a6a40', woodL = '#b88a5c', pDk = dark(P0, 0.22), pLt = lite(P0, 0.1);
  /* direk + kol + payanda */
  sb.rect(0, -46, 1, 46, '#8a5a33'); sb.rect(1, -46, 2, 46, '#6f4526'); sb.rect(2, -46, 1, 46, '#4a2f1c');
  for (y = -44; y < 0; y += 7) sb.set(1, y + (hash(sd, y) * 4 | 0), '#5a3a22');
  sb.rect(-1, -48, 5, 2, '#a8734a');
  hr(-38, -45, 41, '#b88a5c'); hr(-38, -44, 41, '#8a5a33'); hr(-38, -43, 41, '#5a3a22');
  sb.rect(M(-39), -45, 1, 3, '#6f4526');
  for (x = 0; x < 9; x++) { sb.set(M(-1 - x), -34 - x, '#6f4526'); sb.set(M(-1 - x), -35 - x, '#8a5a33'); }
  /* zincirler */
  [-34, -7].forEach(function (cx) { for (y = -42; y <= -39; y++) sb.set(M(cx), y, (y & 1) ? '#5d5a52' : '#9a968a'); });
  /* levha: x -37..-4 (34), y -38..-19 (20) */
  var X0 = fl ? 6 : -37, Y0 = -38, BW = 34, BH = 20;
  for (y = 0; y < BH; y++) for (x = 0; x < BW; x++) {
    var edge = x === 0 || y === 0 || x === BW - 1 || y === BH - 1, c;
    if (edge) c = y === 0 ? woodL : (y === BH - 1 || x === BW - 1) ? '#5a3a22' : '#7a4e2a';
    else {
      var h = hash(x * 3 + sd, y * 7 + sd * 5), streak = hash((x / 6 | 0) + sd, y), near = x < 3 || x > BW - 4 || y < 2 || y > BH - 4;
      if (y === 10) c = hash(x, sd) > 0.25 ? '#4a2f1c' : pDk;                                   /* iki tahta arası derz */
      else if (h > (near ? 0.86 : 0.955)) c = h > 0.97 ? woodL : wood;                          /* boya dökülmüş */
      else c = streak > 0.8 ? pLt : streak < 0.12 ? dark(P0, 0.07) : P0;
      if (y === 1 && c === P0) c = pLt;
      if (y >= BH - 3 && c === P0) c = dark(P0, 0.1);                                           /* alt kirlenme */
    }
    sb.set(X0 + x, Y0 + y, c);
  }
  /* zincir halkaları (levhaya çakılı) */
  sb.set(M(-34), -38, '#c9d0d6'); sb.set(M(-7), -38, '#c9d0d6');
  /* resim: koyu boya konturlu, yer yer dökük */
  var ib = wsIcon(k); ib.outline(0, dark(P0, 0.48));
  ib.p.forEach(function (c, key) {
    var ix = (key % 8192) - 4096, iy = Math.floor(key / 8192) - 4096, tx = X0 + 3 + ix, ty = Y0 + 2 + iy;
    if (ty === Y0 + 10) return;                                                                  /* derz boyayı keser */
    if (typeof c === 'object') c = c.c;
    var hh = hash(ix * 5 + sd * 3, iy * 11 + sd);
    if (hh > 0.95) return;
    sb.set(tx, ty, hh < 0.08 ? mix(c, P0, 0.3) : mix(c, P0, 0.08));
  });
  if (m.e) {                                                     /* v2.22-sanat: uzun direk (bölge tabelası) — her şeyi e kadar yukarı kaydır */
    var sh = L.buf(), E = m.e;
    sb.p.forEach(function (c, key) { sh.set((key % 8192) - 4096, Math.floor(key / 8192) - 4096 - E, c); });
    sh.rect(0, -E, 1, E, '#8a5a33'); sh.rect(1, -E, 2, E, '#6f4526'); sh.rect(2, -E, 1, E, '#4a2f1c');
    sb = sh;
  }
  return sb;
}
var _wsB = {};
function wsSignK(b, sxw, syw, k) {                               /* bina tamponuna bas (KK ölçekli) */
  var sb = _wsB[k] || (_wsB[k] = wsBoard(k)), s = KK / 2, ax = R(fx(sxw, syw)), ay = R(fy(sxw, syw, 0));
  sb.p.forEach(function (c, key) {
    var x = (key % 8192) - 4096, y = Math.floor(key / 8192) - 4096;
    if (s === 1) b.set(ax + x, ay + y, c); else b.rect(ax + R(x * s), ay + R(y * s), Math.max(1, Math.ceil(s)), Math.max(1, Math.ceil(s)), c);
  });
}
/* ad: yalnız tabelaya ~2,5 kare yakınken, levhanın altında küçük ve yumuşak; uzaklaştıkça söner */
function wsName(sxw, syw, s, fl) {
  var pl = G().player, d = d2(pl.x, pl.y, sxw, syw);
  if (d >= 6.25) return;
  gf('uiText')(sxw, syw, 5, s, '#f3e3c0', 8, Math.min(1, (6.25 - d) / 2.5) * 0.9, fl ? 12 : -10, 0, 'rgba(46,30,16,.72)');
}

/* ---------- DEPO / AMBAR (oluklu sac, sürgülü kapı, Sv3 ışıklık; kapı önünde doluluk sandıkları; v2.18 bölmeler ayrı kanat) ---------- */
function depotStatic(b, o, Lv, fillN) {
  var sw = Lv === 1 ? 0.75 : 1, W = o.w * sw, D = o.h * sw, H = [0, 15, 18, 19, 20, 20][Math.min(5, Lv)], k;
  var x1 = o.w / 2, y1 = o.h / 2, x0 = x1 - W, y0 = y1 - D, dx = o.door.x - o.x;
  quadW(b, x0 - 0.1, y0 - 0.1, W + 0.2, D + 0.35, 0.4, function (X, Y) { return (((X + Y * 2) % 20 === 0)) ? '#958e7a' : '#a8a08c'; });
  box(b, x0, y0, W, D, 0, H, '#c9c2b0', panelW('#8a8474', '#7c7667', 4), panelW('#a8a18f', '#958e7d', 4));
  wall(b, x0, y1, x1, y1, H - 2, H, '#6c767d'); wall(b, x1, y0, x1, y1, H - 2, H, '#7d868d');
  winF(b, dx - 0.35, dx + 0.35, y1, 0, 12, panelW('#3c4650', '#2c343c', 5), '#2c343c');
  if (Lv >= 3) winF(b, x0 + 0.25, x0 + 0.6, y1, 0, 10, panelW('#3c4650', '#2c343c', 5), '#2c343c');
  roofGableX(b, x0 - 0.1, x1 + 0.1, y0 - 0.1, y1 + 0.1, H, 6 + Lv, '#8d959b', '#5a6167', '#a8a18f', '#6c767d', 6);
  if (Lv >= 3) roofPlane(b, [[-0.4, y1 - D / 4, H + 3], [0.4, y1 - D / 4, H + 3], [0.4, y1 - 0.1, H + 1], [-0.4, y1 - 0.1, H + 1]], '#9fbfcc', '#6c8a96', 3);
  /* v2.18-deneme: yan rampa / forklift kalktı — Sv2+ bölmeler ayrı kanat (HKA.drawDepotWing) */
  for (k = 0; k < fillN; k++) crateK(b, dx + 0.55 + (k % 2) * 0.24, y1 + 0.25 + Math.floor(k / 4) * 0.02, Math.floor((k % 4) / 2) * 4, k % 2 ? '#c9a15e' : '#a8793e');
  wsSignK(b, x0 + 0.12, y1 + 0.15, 'ambar');                                      /* Ambar tabelası: sandık + balık resmi (kanatlarla aynı) */
  b.outline(0.55);
}
HKA.drawDepot = function () {
  var o = gv('DEPOT'), Lv = o.lvl, Tt = gf('T'), pl = G().player;
  if (!Lv) { plotOutlineK(o, '📦 ' + Tt('depotName') + ' • ' + Tt('buildAt')); return; }
  var sw = Lv === 1 ? 0.75 : 1, W = o.w * sw, D = o.h * sw, H = [0, 15, 18, 19, 20, 20][Math.min(5, Lv)];
  var x1 = o.x + o.w / 2, y1 = o.y + o.h / 2, x0 = x1 - W, y0 = y1 - D;
  gf('shadow')(x0 + W / 2, y0 + D / 2, 1.5 * sw);
  var cnt = gf('depotCount')(), cap = gf('depotCap')(), fillN = Math.min(8, Math.ceil(cnt / Math.max(1, cap) * 8));
  at(spr('depot|' + Lv + '|' + fillN + '|' + G().K, 0, 0, function (b) { depotStatic(b, o, Lv, fillN); }), o.x, o.y, 0);
  wsName(x0 + 0.12, y1 + 0.15, Tt('wsAmbar'));
  var near = gf('nearDoor')(o.door);
  if (near) gf('uiLabel')(o.x, o.y, H + 14, Tt('depotName') + ' ' + cnt + '/' + cap, '#ffd9a8', 1);
  var fc = gf('depotFishLine')();
  if (fc && d2(pl.x, pl.y, o.x, o.y) < 30) gf('uiLabel')(o.x, o.y, H + (near ? 4 : 14), fc, '#e8f4ff', 0.95);
};

/* ---------- TOPTANCI HALİ: çelik direkli sundurma, tonoz çinko çatı, HAL levhası ---------- */
function whallStatic(b, o, pc) {
  var x = -o.w / 2, y = -o.h / 2, k, kk;
  quadW(b, x, y, o.w, o.h, 1, function (X, Y) { return (((X - Y * 2) % 16 === 0)) ? '#8a8478' : '#9d968a'; });
  for (k = 0; k < 6; k++) crateK(b, x + 0.4 + (k % 3) * 0.3, y + 0.5 + Math.floor(k / 3) * 0.35, 1, k % 2 ? '#8a5a33' : '#a9743f');
  box(b, x + o.w - 0.6, y + 0.3, 0.3, 0.3, 1, 7, '#8b949c', '#5d666e', '#6c767d');
  pr(b, x + o.w - 0.45, y + 0.6, 10, -2, 0, 5, 3, '#cfe6a8');
  [[x, y + o.h], [x + o.w / 2, y + o.h], [x + o.w, y + o.h], [x + o.w, y + o.h / 2], [x + o.w, y]].forEach(function (c2) { vl(b, c2[0], c2[1], 0, 20, '#4a5663', 3); pr(b, c2[0], c2[1], 20, -1, 0, 3, 1, '#6c7a88'); });
  var VN = 10, vz = [], vy = [], rx0 = x - 0.08, rx1 = x + o.w + 0.08;
  for (kk = 0; kk <= VN; kk++) { vy.push(y - 0.08 + (o.h + 0.16) * kk / VN); vz.push(20 + 9 * Math.sin(Math.PI * kk / VN)); }
  poly(b, vy.map(function (yy, q) { return P3(rx1, yy, vz[q]); }).concat([P3(rx1, vy[VN], 20), P3(rx1, vy[0], 20)]), function (X, Y) { return (X % 4 === 0) ? '#6c8a96' : '#9fbfcc'; });
  for (kk = 1; kk < VN; kk++) vl(b, rx1, vy[kk], 20, vz[kk], '#4a5663');
  for (kk = 0; kk < VN; kk++) roofPlane(b, [[rx0, vy[kk], vz[kk]], [rx1, vy[kk], vz[kk]], [rx1, vy[kk + 1], vz[kk + 1]], [rx0, vy[kk + 1], vz[kk + 1]]], shd('#7a838a', kk < VN / 2 ? -14 + kk * 4 : 10 - (kk - VN / 2) * 5), null, 0);
  for (kk = 1; kk < 8; kk++) { var rxk = rx0 + (rx1 - rx0) * kk / 8; for (var q2 = 0; q2 < VN; q2++) line(b, fx(rxk, vy[q2]), fy(rxk, vy[q2], vz[q2]), fx(rxk, vy[q2 + 1]), fy(rxk, vy[q2 + 1], vz[q2 + 1]), '#59626a'); }
  wall(b, x + 0.7, y + o.h, x + 1.7, y + o.h, 13, 18, '#1f4e7a');
  var hx2 = R(fx(x + 1.2, y + o.h)), hy2 = R(fy(x + 1.2, y + o.h, 17));
  b.rect(hx2 - 8, hy2, 14, 6, '#ffffff'); b.rect(hx2 + 6, hy2 - 2, 4, 10, '#ffffff'); b.rect(hx2 - 6, hy2 + 2, 2, 2, '#1f4e7a'); b.rect(hx2 - 10, hy2 + 2, 2, 2, '#ffffff');
  if (pc) {
    var dx = o.door.x - o.x, dy = o.door.y - o.y;
    box(b, dx + 0.35, dy - 0.35, 0.6, 0.45, 0, 2, '#b8895a', '#7a4e2a', '#9a6a3d');
    for (k = 0; k < pc; k++) crateK(b, dx + 0.5 + (k % 3) * 0.17, dy - 0.25 + Math.floor(k / 3) * 0.02, 2 + Math.floor(k / 3) * 4, k % 2 ? '#c9a15e' : '#a8793e');
  }
  b.outline(0.55);
}
HKA.drawWhall = function () {
  var o = gv('WHALL'), Tt = gf('T');
  if (!o.built) { plotOutlineK(o, '🏪 ' + Tt('whall') + ' • ' + Tt('buildAt')); return; }
  gf('shadow')(o.x, o.y, 1.4);
  var pn = gf('palCount')(), pc = pn ? Math.min(6, Math.ceil(pn / 3)) : 0;
  at(spr('whall|' + pc + '|' + G().K, 0, 0, function (b) { whallStatic(b, o, pc); }), o.x, o.y, 0);
  if (pn) gf('uiBadge')(o.door.x + 0.65, o.door.y - 0.1, 16, '' + pn, '#ffd9a8');
  gf('labelAt')(o.x, o.y, 30, Tt('whall'), '#ffd9a8', '🏪');
};
/* ahşap yön tabelası: oyulmuş, harfe benzeyen okunmaz yazı (ince) */
HKA.drawWoodSign = function (o, seed) {
  at(L.sprite('wsign|' + seed + '|' + G().K, function (b) {
    b.rect(0, -28, 2, 28, '#4a2f1c'); b.rect(0, -28, 1, 28, '#6a4a2c');
    b.rect(-20, -36, 44, 14, '#8a5a33'); b.rect(-19, -35, 42, 12, '#a8734a'); b.rect(-19, -35, 42, 1, '#c99060'); b.rect(-19, -24, 42, 1, '#7a4e2a');
    var cx = -16, i = 0;
    while (cx < 20) {
      var word = 2 + Math.floor(hash(seed, i++) * 4);
      for (var k = 0; k < word && cx < 20; k++) { var h = 3 + Math.floor(hash(seed + 7, i * 9 + k) * 3); b.rect(cx, -26 - h, 1, h, '#4a2f1c'); if (hash(seed, k + i * 3) < 0.55) b.set(cx + 1, -26 - h + (hash(k, i) < 0.5 ? 0 : 2), '#4a2f1c'); cx += 3; }
      cx += 3;
    }
    b.outline(0.55);
  }), o.x, o.y, 0);
};
/* müdür masası: ceviz masa, evrak, isimlik; müdür oturur */
HKA.drawMgrDesk = function (z) {
  var m = gf('mgr')(z), p = gf('mgrPos')(z); if (!m || !p) return;
  at(spr('mdesk|' + G().K, 0, 0, function (b) {
    box(b, -0.5, -0.3, 1.0, 0.6, 0, 9, function (u, v) { return (u < 0.7 || v < 0.7) ? '#b07a48' : '#8a5a33'; }, woodV('#5a3a1e', 4), woodV('#6f4526', 4));
    wall(b, -0.35, 0.3, 0.35, 0.3, 2, 7, '#5a3a1e'); pr(b, 0, 0.3, 5, -1, 0, 2, 1, '#c9952f');
    var sy = R(fy(0, 0, 9));
    b.rect(-10, sy - 4, 10, 6, '#f4efe4'); b.rect(-9, sy - 3, 7, 1, '#b8b0a0'); b.rect(-9, sy - 1, 5, 1, '#b8b0a0');
    b.rect(2, sy - 6, 8, 4, '#c9a15e'); b.rect(2, sy - 6, 8, 1, '#e6c47e');
    b.rect(-16, sy - 8, 4, 6, '#2e2a26'); b.rect(-15, sy - 7, 2, 1, '#8a5a33');
    b.outline(0.55);
  }), p.x, p.y, 0);
  if (gf('mgrAway')(z)) return;
  var o = gf('mgrOutfit')(z, m); o.face = Math.sin(T() * 0.4 + z) > 0 ? 1 : -1;
  var s = gf('mgrSeat')(z);
  gf('drawPerson')({ x: s.x, y: s.y, z: 0, vx: 0, vy: 0, bob: T() * 2 + z, act: 0, carry: [] }, o);
  var pl = G().player;
  if (d2(pl.x, pl.y, p.x, p.y) < 7) gf('uiLabel')(p.x, p.y, 30, '👔 ' + m.n + ' · ' + gf('T')('mgrBoss'), '#ffe6bf', 0.95);
};

/* =====================================================================
   7) ÇEVRE: servi, zeytin, kaya, çalı, ağ kurutma, çekek sandalı, sepet, varil, çiçek tarhı;
      bakımsız hâlleri; kilitli bölge enkazı; yol vitrini (çiçeklik, pano); süsler
   Çapa = zemin noktası (0,0); ince piksel.
   ===================================================================== */
function cypress(b, h, sw, cols) {                 /* alev biçimli servi: ışık solda */
  b.rect(-1, -10, 3, 10, '#6b4a28'); b.rect(-1, -10, 1, 10, '#8a6436');
  for (var y = 0; y < h; y++) {
    var t = y / h, w = Math.max(1, Math.round((1 - Math.pow(Math.abs(t - 0.42) / 0.58, 1.7)) * 6.5)), off = Math.round(sw * t * t * 2);
    for (var i = -w; i <= w; i++) {
      var c = i < -w * 0.25 ? cols[0] : i > w * 0.4 ? cols[2] : cols[1];
      if (cols[3] && hash(i + 9, y) > 0.8) continue;
      if (((y + (i & 1) * 2) % 5 === 0) && hash(i, y >> 1) > 0.5) c = i < 0 ? lite(cols[0], 0.12) : dark(c, 0.12);
      b.set(i + off, -6 - y, c);
    }
  }
}
function canopy(b, cx, cy, rx, ry, cols, seed) {
  for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
    var e = (x * x) / (rx * rx) + (y * y) / (ry * ry), n = hash(x + seed, y + seed * 3);
    if (e > 1 || (e > 0.7 && n > 0.6)) continue;
    var l = -x * 0.6 - y; var c = l > ry * 0.6 ? cols[0] : l < -ry * 0.5 ? cols[2] : cols[1];
    if (n > 0.9) c = lite(c, 0.18); else if (n < 0.08) c = dark(c, 0.18);
    b.set(cx + x, cy + y, c);
  }
}
function rockB(b, s, cx, cy) {
  for (var j = -s * 2; j <= 0; j++) for (var i = -s * 2 - 4; i <= s * 2 + 4; i++) {
    if ((i * i) / ((s * 2 + 4) * (s * 2 + 4)) + (j * j) / (s * s * 4) > 1) continue;
    b.set((cx || 0) + i, (cy || 0) + j, i < -2 && j < -s ? '#d4cebb' : i > s ? '#8b8676' : (hash(i, j) > 0.85 ? '#9a9484' : '#a8a291'));
  }
}
function barrel(b, x0, y0, c, lying) {
  if (lying) { for (var x = 0; x < 20; x++) for (var y = 0; y < 10; y++) { var e = Math.abs(y - 4.5) / 5; b.set(x0 + x, y0 + y, (x === 4 || x === 15) ? dark(c, 0.4) : e > 0.7 ? dark(c, 0.25) : y < 3 ? lite(c, 0.15) : c); } for (var yy = 1; yy < 9; yy++) b.set(x0, y0 + yy, dark(c, 0.5)); return; }
  for (var y2 = 0; y2 < 20; y2++) for (var x2 = 0; x2 < 16; x2++) { var bul = (y2 > 2 && y2 < 17) ? 0 : 1; if (x2 < bul || x2 > 15 - bul) continue; b.set(x0 + x2, y0 + y2, (y2 === 4 || y2 === 14) ? '#4a4a4a' : y2 < 3 ? lite(c, 0.2) : x2 < 4 ? lite(c, 0.1) : x2 > 11 ? dark(c, 0.25) : c); }
}
function boatSide(b, w, cols, holes) {
  for (var r = 0; r < 8; r++) { var ins = Math.round(Math.pow(r / 8, 2) * 6); for (var x = -w + ins; x < w - ins; x++) b.set(x, -14 + r, r === 0 ? cols[0] : r < 3 ? cols[1] : r === 3 ? cols[3] || cols[2] : cols[2]); }
  if (holes) { b.rect(-8, -11, 5, 3, '#3f3a32'); b.rect(8, -10, 3, 2, '#3f3a32'); }
}
function scenSpr(t, s, sw, worn, fr) {
  return spr('scn|' + t + '|' + s + '|' + sw + '|' + worn + '|' + fr + '|' + G().K, 0, 0, function (b) {
    var k, x, y;
    if (worn) {
      if (t === 'cam') {
        var hh = R(28 * s); b.rect(-1, -hh, 3, hh, '#6b5640'); b.rect(-1, -hh, 1, hh, '#86705a');
        line(b, 0, -R(22 * s), -10, -R(26 * s), '#6b5640'); line(b, 0, -R(20 * s), 10, -R(24 * s), '#6b5640'); line(b, -10, -R(26 * s), -12, -R(30 * s), '#7a6450'); line(b, 10, -R(24 * s), 12, -R(29 * s), '#7a6450'); line(b, 0, -hh, -4, -hh - 6, '#7a6450'); line(b, 1, -hh, 4, -hh - 7, '#7a6450');
      } else if (t === 'servi') cypress(b, R(30 * s), sw, ['#98a060', '#7d8a4a', '#626c38', 1]);
      else if (t === 'cali') { canopy(b, 0, -4, 9, 4, ['#c4ab74', '#a08a5a', '#7a6640'], 3); for (k = 0; k < 5; k++) line(b, -6 + k * 3, -6, -7 + k * 3 + sw, -12 - (k % 2) * 2, '#8a744a'); }
      else if (t === 'ag') {
        b.rect(-20, -28, 3, 28, '#5a4632'); line(b, 16, 0, 19, -22, '#5a4632'); line(b, 17, 0, 20, -22, '#5a4632'); b.rect(-20, -30, 24, 2, '#5a4632');
        for (k = 0; k < 3; k++) for (x = -18; x < k * 6; x++) b.set(x, -24 + k * 6 + ((x & 3) === 0 ? 1 : 0), '#b8ab88');
        for (k = 0; k < 3; k++) b.rect(-18 + k * 6, -24, 1, 18 - k * 3, '#a89c7c');
      } else if (t === 'sandal') { boatSide(b, 22, ['#a8a290', '#85806f', '#6f6a60'], 1); b.rect(-18, -6, 6, 6, '#6a6458'); b.rect(12, -6, 6, 6, '#6a6458'); }
      else if (t === 'sepet') { box(b, -0.35, -0.2, 0.33, 0.3, 0, 4, '#a88a60', '#8a7050', '#7a6244'); box(b, 0.05, -0.1, 0.28, 0.25, 0, 3, '#957856', '#7a6244', '#6a5438'); line(b, -6, -6, 2, -12, '#8a7050'); line(b, -5, -6, 3, -12, '#6a5438'); }
      else if (t === 'varil') { barrel(b, -12, -10, '#7a4a2a', 1); b.rect(-14, -8, 3, 6, '#4a2a14'); for (k = 0; k < 6; k++) b.set(-8 + k * 3, -9 + (k % 2) * 6, '#a8652e'); }
      else if (t === 'hurda') { for (k = 0; k < 3; k++) { b.rect(-16 + k * 4, -4 - k * 4, 30 - k * 8, 4, k % 2 ? '#8a7458' : '#7a6450'); b.rect(-16 + k * 4, -4 - k * 4, 30 - k * 8, 1, '#a08a6a'); } for (y = -12; y < -2; y++) for (x = 6; x < 16; x++) { var e = Math.hypot(x - 11, y + 7); if (e < 5 && e > 2) b.set(x, y, '#2b2b2b'); } }
      b.outline(0.55); return;
    }
    if (t === 'hurda') {                                                        /* çiçek tarhı */
      box(b, -0.55, -0.25, 1.1, 0.5, 0, 3, '#5a4632', woodH('#7a5a3a', 3), woodH('#6a4a2e', 3));
      var fc = ['#e5533d', '#ffc94a', '#e0679e', '#f4e9d2'];
      for (k = 0; k < 7; k++) { var fx0 = -12 + k * 4, fy0 = -10 + (k % 2) * 2; b.rect(fx0 + 1, fy0, 1, 5, '#5f8f4a'); b.rect(fx0, fy0 - 2, 3, 3, fc[k % 4]); b.set(fx0 + 1, fy0 - 1, '#fff6c0'); b.set(fx0 + 2, fy0 + 2, '#7aae5a'); }
    } else if (t === 'servi') cypress(b, R(40 * s), sw, ['#4b7a52', '#3f6646', '#2e4d35']);
    else if (t === 'cam') {                                                     /* zeytin */
      for (y = -16; y < 0; y++) { var tw = Math.round(Math.sin(y * 0.35) * 1.5); b.rect(-2 + tw, y, 4, 1, '#7a6248'); b.set(-2 + tw, y, '#968068'); b.set(1 + tw, y, '#5f4c37'); }
      line(b, 0, -14, -7, -20, '#6a5440'); line(b, 1, -15, 7, -22, '#6a5440');
      var top = R(36 * s);
      canopy(b, -6, -R(26 * s), 11, 6, ['#a2b47a', '#83975f', '#5f7248'], 1); canopy(b, 7, -R(28 * s), 10, 6, ['#a2b47a', '#83975f', '#5f7248'], 2); canopy(b, 0, -top + 4, 9, 6, ['#b0c088', '#94a86c', '#6e8252'], 3);
      for (k = 0; k < 5; k++) b.set(-8 + k * 4, -R(24 * s) + (k % 2) * 4, '#3f4a2c');
    } else if (t === 'kaya') { rockB(b, 4, 0, 0); rockB(b, 2, 9, -1); }
    else if (t === 'cali') { canopy(b, 0, -5, 9, 5, ['#a8b46e', '#8c9a56', '#6a7840'], 4); canopy(b, 3 + sw, -11, 5, 4, ['#b0bc78', '#9aa863', '#748244'], 5); b.set(2, -16, '#c9a15e'); b.set(-4, -9, '#e0b860'); b.set(6, -6, '#e0b860'); }
    else if (t === 'ag') {
      b.rect(-20, -32, 3, 32, '#6f4526'); b.rect(-20, -32, 1, 32, '#8a5a32'); b.rect(16, -32, 3, 32, '#5a3a20'); b.rect(-20, -34, 39, 3, '#6f4526'); b.rect(-20, -34, 39, 1, '#8a5a32');
      for (k = 0; k < 5; k++) { var off = R(Math.sin(fr / 4 * Math.PI * 2 + k) * 1); for (x = -17; x < 16; x++) b.set(x, -28 + k * 6 + off + ((x & 3) === 1 ? 1 : 0), '#ded1a8'); }
      for (k = 0; k < 11; k++) b.rect(-17 + k * 3, -28, 1, 26, '#cfc29a');
      b.rect(-8, -10, 4, 4, '#a83d2b'); b.set(-8, -10, '#d0604a'); b.rect(4, -16, 4, 4, '#ede4cf');
    } else if (t === 'sandal') {
      boatSide(b, 22, ['#e8d9b8', '#a8683a', '#8a5a2e', '#1f8fbf']); b.rect(-8, -18, 16, 4, '#6f4526'); b.rect(-8, -18, 16, 1, '#8a5a32');
      b.rect(-26, -4, 8, 4, '#7a5230'); b.rect(18, -4, 8, 4, '#7a5230'); b.rect(-2, -16, 1, 2, '#c9b183');
    } else if (t === 'sepet') {
      for (k = 0; k < 2; k++) { var bx = k ? -6 : -10, by = k ? -20 : -12, bw = k ? 14 : 20; for (y = 0; y < (k ? 8 : 12); y++) for (x = 0; x < bw; x++) b.set(bx + x, by + y, y === 0 ? '#e0bd80' : ((x + (y >> 1)) % 3 === 0) ? '#96763f' : (y & 1) ? '#b8924f' : '#c9a35e'); }
      b.rect(-4, -22, 4, 2, '#9fb0b8');
    } else barrel(b, -8, -20, '#8a5a2e', 0);
    b.outline(0.55);
  });
}
function wornDraw(d, sx, sy, z, sw) {
  var t = d.t; if (['cam', 'servi', 'cali', 'ag', 'sandal', 'sepet', 'varil', 'hurda'].indexOf(t) < 0) return false;
  L.blit(scenSpr(t, Math.round(z * 10) / 10, R(sw), 1, 0), sx, sy);
  return true;
}
HKA.drawWorn = function (d, sx, sy, z, sw) { return wornDraw(d, sx, sy, z, sw); };
HKA.drawScenery = function (d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0)), z = d.s, t = T();
  var sw = Math.sin(t * 0.8 + d.x) * 0.6;
  var worn = d.up !== undefined && G().envStage() < d.up;
  if (worn && wornDraw(d, sx, sy, z, sw)) return;
  var fr = d.t === 'ag' ? Math.floor(t * 1.2 / (Math.PI * 2) * 4) % 4 : 0;
  L.blit(scenSpr(d.t, Math.round(z * 10) / 10, (d.t === 'servi' || d.t === 'cali') ? R(sw) : 0, 0, fr), sx, sy);
};
/* kilitli bölge enkazı */
function junkSpr(t, fl) {
  return spr('junk|' + t + '|' + fl + '|' + G().K, 0, 0, function (b) {
    var k;
    if (t === 'kasa') { for (k = 0; k < 2; k++) { var x0 = k ? 2 : -14, w = k ? 12 : 16, h = k ? 10 : 12; b.rect(x0, -h, w, h, k ? '#7a6244' : '#8a7050'); b.rect(x0, -h, w, 2, k ? '#957856' : '#a88a60'); for (var y = -h + 4; y < 0; y += 4) b.rect(x0, y, w, 1, '#6b5640'); } b.rect(-10 + fl * 2, -22, 14, 10, '#958062'); b.rect(-10 + fl * 2, -22, 14, 2, '#b39a74'); b.rect(-3 + fl * 2, -20, 4, 4, '#4a3a28'); }
    else if (t === 'tahta') { for (k = 0; k < 4; k++) { b.rect(-18 + k * 2, -4 - k * 4, 32, 4, k % 2 ? '#8a6a44' : '#a07c52'); b.rect(-18 + k * 2, -4 - k * 4, 32, 1, '#b8946a'); b.set(-18 + k * 2, -2 - k * 4, '#6b5640'); } b.rect(10, -18, 4, 16, '#6b5640'); }
    else if (t === 'varil') { barrel(b, -14, -18, '#7a4a2a', 0); barrel(b, 2, -10, '#6f4424', 1); }
    else if (t === 'ag') { canopy(b, 0, -5, 14, 5, ['#b3a786', '#9a8e70', '#7a7058'], 7); canopy(b, 2, -12, 8, 4, ['#bfb390', '#a89c7c', '#86795e'], 8); for (k = 0; k < 6; k++) line(b, -12 + k * 5, -14 + (k % 2) * 2, -10 + k * 5, -2, '#6f6650'); b.rect(6, -10, 4, 4, '#a83d2b'); }
    else if (t === 'lastik') { for (k = 0; k < 3; k++) for (var x = -12; x <= 12; x++) for (var yy = 0; yy < 6; yy++) b.set(x, -6 - k * 6 + yy, (yy === 0 || yy === 5) ? '#1a1a1a' : (Math.abs(x) < 6 && yy > 1 && yy < 4) ? '#4a4a4a' : '#2b2b2b'); }
    else if (t === 'sandal') boatSide(b, 22, ['#a8a290', '#85806f', '#6f6a60'], 1);
    else if (t === 'halat') { for (k = 0; k < 3; k++) for (var a = 0; a < 40; a++) { var an = a / 40 * Math.PI * 2; b.set(Math.round(Math.cos(an) * (10 - k * 3)), -5 + Math.round(Math.sin(an) * (4 - k)) - k * 2, (a + k) % 4 < 2 ? '#c4ab74' : '#8a744a'); } line(b, 10, -4, 20, -2, '#b39a64'); }
    else if (t === 'capa') { b.rect(-1, -24, 3, 22, '#6a4a34'); b.rect(-6, -24, 12, 2, '#6a4a34'); b.rect(-2, -28, 5, 4, '#6a4a34'); b.set(-1, -27, '#c9b183'); for (k = 0; k < 12; k++) { var dy = Math.round(Math.sin(k / 11 * Math.PI) * 2); b.set(-12 + k, -3 + dy, '#6a4a34'); b.set(1 + k, -3 + dy, '#5a3e2c'); b.set(-12 + k, -4 + dy, '#6a4a34'); b.set(1 + k, -4 + dy, '#5a3e2c'); } b.rect(-14, -9, 3, 5, '#6a4a34'); b.rect(12, -9, 3, 5, '#5a3e2c'); b.set(-12, -24, '#8a6a54'); }
    else { b.rect(-14, -12, 24, 8, '#8a6a44'); b.rect(-14, -12, 24, 2, '#a88a60'); for (var y2 = -10; y2 < -4; y2 += 3) b.rect(-14, y2, 24, 1, '#6b5640'); for (var q = 0; q < 6; q++) for (var p2 = 0; p2 < 6; p2++) if (Math.hypot(q - 2.5, p2 - 2.5) < 3) b.set(-10 + q, -4 + p2, '#3a3a3a'); b.rect(10, -16, 10, 2, '#6b5640'); b.rect(4, -2, 4, 2, '#6b5640'); }
    b.outline(0.55);
  });
}
HKA.drawJunk = function (j) {
  gf('shadow')(j.x, j.y, 0.45);
  var fl = j.v > 0.5 ? 1 : 0, s = junkSpr(j.t, fl), sx = R(pX(j.x, j.y)), sy = R(pY(j.x, j.y, 0));
  if (fl) L.blitFlip(s, sx, sy); else L.blit(s, sx, sy);
};
/* yol vitrini: taş saksı + mevsim çiçekleri */
HKA.drawFlowerbed = function (x, y, i) {
  var sw = Math.sin(T() * 1.5 + i) > 0.7 ? 1 : 0;
  at(spr('fbed|' + (i % 4) + '|' + sw + '|' + G().K, 0, 0, function (b) {
    box(b, -0.2, -0.3, 0.4, 0.6, 0, 4, '#ded1b6', stoneW('#9a8c72'), stoneW('#cbbc9e'));
    quadW(b, -0.16, -0.26, 0.32, 0.52, 4, function (X, Y) { return hash(X, Y) > 0.7 ? '#5a3a20' : '#4a6b35'; });
    var cols = [['#e5533d', '#ffc94a'], ['#d94a8c', '#f4f0e4'], ['#ffc94a', '#e0679e'], ['#9b6fd1', '#f4f0e4']][i % 4];
    for (var f = 0; f < 6; f++) {
      var fxp = -0.1 + (f % 2) * 0.2, fyp = -0.2 + Math.floor(f / 2) * 0.2, X = R(fx(fxp, fyp)), Y = R(fy(fxp, fyp, 5)), s2 = (f % 2) ? sw : 0;
      b.rect(X, Y - 6, 1, 6, '#4a7a3a'); b.set(X + 1, Y - 3, '#6fae4a');
      b.rect(X - 2 + s2, Y - 9, 5, 3, cols[f % 2]); b.rect(X - 1 + s2, Y - 10, 3, 5, cols[f % 2]); b.set(X + s2, Y - 8, '#fff6c0');
    }
    b.outline(0.55);
  }), x, y, 0);
};
/* reklam panosu: iki direk, yola bakan levha; balıkçı logosu + karalama satırları */
HKA.drawBillboard = function (x, y, i) {
  gf('shadow')(x, y, 0.7);
  at(spr('bboard|' + i + '|' + G().K, 0, 0, function (b) {
    var y0 = -0.55, y1 = 0.55, c = ['#a83d2b', '#2a4c7d', '#2f7a4a'][i % 3];
    vl(b, 0, y0 + 0.08, 0, 30, '#6f4526', 3); vl(b, 0, y1 - 0.08, 0, 30, '#6f4526', 3);
    wall(b, 0, y0 - 0.04, 0, y1 + 0.04, 13, 31, '#0a1a27');
    wall(b, 0, y0, 0, y1, 14, 30, '#f1ebda');
    wall(b, 0, y0, 0, y1, 14, 17, c); wall(b, 0, y0, 0, y1, 28, 30, c);
    function F(a, bb, z0, z1, col) { wall(b, 0, y0 + a, 0, y0 + bb, z0, z1, col); }
    F(0.10, 0.40, 18.5, 27.5, '#dcebf2');
    F(0.15, 0.33, 21, 25, '#2a4c7d'); F(0.18, 0.30, 20, 26, '#2a4c7d'); F(0.33, 0.38, 22, 24, '#2a4c7d'); F(0.36, 0.39, 20, 22, '#2a4c7d'); F(0.36, 0.39, 24, 26, '#2a4c7d');
    F(0.19, 0.215, 23.5, 24.5, '#f4fbff'); F(0.14, 0.36, 19, 19.8, c);
    var rows = [[25.5, [0.14, 0.2, 0.1, 0.16]], [22.5, [0.2, 0.08, 0.18]], [19.5, [0.1, 0.22, 0.12]]];
    for (var r = 0; r < rows.length; r++) {
      var u = 0.48 + ((i + r) % 2) * 0.02;
      for (var k = 0; k < rows[r][1].length && u < 1.02; k++) { var w = Math.min(rows[r][1][(k + i) % rows[r][1].length], 1.02 - u); F(u, u + w, rows[r][0], rows[r][0] + 1.2, r === 0 ? '#1a2433' : '#5a6470'); u += w + 0.05; }
    }
    b.outline(0.55);
  }), x, y, 0);
};
/* süsler (yol vitrini + deniz + mendirek) */
function decorSpr(id, fr, on) {
  return spr('dec|' + id + '|' + fr + '|' + on + '|' + G().K, 0, 0, function (b) {
    var k;
    if (id === 'bayrak') { b.rect(-1, -68, 3, 68, '#d8d2c4'); b.rect(-1, -68, 1, 68, '#f4f0e8'); b.rect(-2, -70, 5, 2, '#c9952f'); b.rect(-4, -2, 9, 2, '#9a9484'); }
    else if (id === 'bank') { for (k = 0; k < 2; k++) { b.rect(-16, -12 - k * 8, 32, 3, '#a9743f'); b.rect(-16, -12 - k * 8, 32, 1, '#c99558'); } b.rect(-14, -12, 3, 12, '#3c4650'); b.rect(11, -12, 3, 12, '#3c4650'); b.rect(-14, -20, 2, 8, '#3c4650'); b.rect(12, -20, 2, 8, '#3c4650'); }
    else if (id === 'simit') {
      b.rect(-18, -24, 36, 16, '#c9a15e'); b.rect(-18, -24, 36, 2, '#e0bd80'); b.rect(-16, -22, 32, 10, '#f4ead6'); b.rect(-20, -30, 40, 5, '#e30a17'); b.rect(-20, -30, 40, 1, '#ff5a5a');
      for (k = 0; k < 3; k++) for (var a = 0; a < 20; a++) { var an = a / 20 * Math.PI * 2; b.set(-10 + k * 10 + Math.round(Math.cos(an) * 4), -17 + Math.round(Math.sin(an) * 3), a % 3 ? '#c8802f' : '#e8b060'); }
      for (k = 0; k < 2; k++) for (var q = 0; q < 12; q++) b.set((k ? 10 : -10) + Math.round(Math.cos(q / 12 * Math.PI * 2) * 4), -4 + Math.round(Math.sin(q / 12 * Math.PI * 2) * 4), '#3a3a3a');
      b.rect(18, -24, 6, 2, '#5d3c1c');
    } else if (id === 'cicek') {
      b.rect(-10, -12, 20, 12, '#b8642e'); b.rect(-10, -14, 20, 3, '#d1793d'); b.rect(-10, -12, 4, 12, '#c87038'); b.rect(6, -12, 4, 12, '#9a5024');
      b.rect(-2, -22, 2, 10, '#4a7a3a'); canopy(b, 0, -24, 11, 7, ['#f080b8', '#e0679e', '#b8407a'], 11);
    } else if (id === 'caymasa') {
      b.rect(-14, -16, 28, 4, '#c9a15e'); b.rect(-14, -16, 28, 1, '#e6c47e'); b.rect(-12, -12, 3, 12, '#8d5f33'); b.rect(9, -12, 3, 12, '#8d5f33');
      for (k = 0; k < 2; k++) { var gx = k ? 4 : -8; b.rect(gx, -24, 5, 8, '#e8c9a0'); b.rect(gx + 1, -22, 3, 5, '#c94a1a'); b.rect(gx - 1, -16, 7, 1, '#f4ead6'); }
      b.rect(-22, -8, 6, 8, '#8d5f33'); b.rect(16, -8, 6, 8, '#8d5f33');
    } else if (id === 'nazar') {
      b.rect(-1, -44, 3, 44, '#6f4526'); b.rect(-1, -44, 1, 44, '#8a5a32'); b.rect(-6, -46, 13, 2, '#6f4526');
      var X = 4 + (fr - 1) * 2;
      b.rect(X, -46, 1, 4, '#c9b183');
      for (var y = -8; y <= 8; y++) for (var x = -8; x <= 8; x++) { var r2 = x * x + y * y; if (r2 > 66) continue; b.set(X + x, -34 + y, r2 > 40 ? '#1f6fae' : r2 > 20 ? '#eef6fa' : r2 > 6 ? '#1f8fbf' : '#0a1a27'); }
      b.set(X - 3, -38, '#ffffff');
    } else if (id === 'cesme') {
      box(b, -0.35, -0.12, 0.7, 0.24, 0, 22, '#ded1b6', stoneW('#cbbc9e'), stoneW('#b0a080'));
      var sx0 = R(fx(0, 0.12)), sy0 = R(fy(0, 0.12, 0));
      b.rect(sx0 - 22, sy0 - 48, 44, 6, '#9a8c72'); b.rect(sx0 - 22, sy0 - 48, 44, 1, '#c4b598');
      b.rect(sx0 - 14, sy0 - 40, 28, 4, '#1f8fbf'); b.rect(sx0 - 12, sy0 - 39, 24, 2, '#3fa8d8');
      for (var q2 = -10; q2 <= 10; q2++) { var hq = Math.round(Math.sqrt(100 - q2 * q2) * 0.5); b.rect(sx0 + q2, sy0 - 34 - hq, 1, 18 + hq, '#5f5443'); }
      b.rect(sx0 - 2, sy0 - 24, 4, 3, '#c9952f');
      b.rect(sx0 - 1, sy0 - 21 + fr, 2, 8 - fr, '#9fd4e6');
      b.rect(sx0 - 14, sy0 - 10, 28, 8, '#8fb9c9'); b.rect(sx0 - 14, sy0 - 10, 28, 2, '#b8dce8'); b.rect(sx0 - 16, sy0 - 12, 32, 2, '#b0a286');
    } else if (id === 'kilim') {
      b.rect(-24, -40, 3, 40, '#6f4526'); b.rect(21, -40, 3, 40, '#5a3a20'); b.rect(-24, -42, 48, 3, '#6f4526'); b.rect(-24, -42, 48, 1, '#8a5a32');
      var kw = fr - 1;
      for (var yy = 0; yy < 30; yy++) for (var xx = 0; xx < 18; xx++) {
        var d1 = Math.abs(xx - 9) + Math.abs((yy % 10) - 5);
        b.set(-20 + xx + kw, -38 + yy, yy < 2 || yy > 27 ? '#d9a441' : d1 < 2 ? '#2a4c7d' : d1 < 4 ? '#ede4cf' : '#a83d2b');
        b.set(2 + xx - kw, -38 + yy, yy < 2 || yy > 27 ? '#ede4cf' : d1 < 2 ? '#d9a441' : d1 < 3 ? '#a83d2b' : '#2a4c7d');
      }
    } else if (id === 'fener') {
      b.rect(-16, -12, 32, 12, '#8e8878'); b.rect(-16, -14, 32, 2, '#aaa494');
      for (var y3 = -68; y3 < -12; y3++) { var w3 = 8 + Math.round((y3 + 68) / 56 * 2); for (var x3 = -w3; x3 < w3; x3++) { var band = (y3 > -56 && y3 < -48) || (y3 > -36 && y3 < -28); b.set(x3, y3, band ? (x3 < 0 ? '#c8553d' : '#8e3324') : (x3 < -3 ? '#ffffff' : x3 > 4 ? '#cfc6ae' : '#f1ebda')); } }
      b.rect(-12, -76, 24, 8, '#5d666e'); b.rect(-8, -74, 16, 4, on ? '#fff0a8' : '#8a7a3a'); b.rect(-4, -80, 8, 4, '#5d666e'); b.set(0, -82, '#c9952f'); b.rect(-14, -68, 28, 2, '#3c4650');
    } else if (id === 'heykel') {
      b.rect(-14, -12, 28, 12, '#9a927f'); b.rect(-14, -12, 28, 2, '#b8b09c'); b.rect(-10, -18, 20, 6, '#b3aa93'); b.rect(-10, -18, 20, 1, '#d0c8b2');
      for (var x4 = -14; x4 <= 12; x4++) { var t4 = (x4 + 14) / 26, h4 = Math.round(Math.sin(t4 * Math.PI) * 8); for (var y4 = -h4; y4 <= h4; y4++) b.set(x4, -36 + y4 - Math.round(t4 * 6), y4 < -h4 * 0.3 ? '#6d95a8' : y4 > h4 * 0.4 ? '#a8ccd8' : '#7fa9bd'); }
      b.rect(-18, -38, 5, 10, '#6d95a8'); b.rect(10, -48, 8, 8, '#7fa9bd'); b.rect(-8, -38, 2, 2, '#16222b');
    }
    b.outline(0.55);
  });
}
function beamSpr() { return L.sprite('beam|' + G().K, function (b) { for (var x = -52; x <= 52; x++) { var h = 10 + Math.abs(x) * 0.25; for (var y = -h / 2; y <= h / 2; y++) b.set(x, Math.round(-74 - x * 0.12 + y), '#fff0a8'); } }); }
HKA.drawDecor = function (d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0)), t = T(), id = d.id;
  if (id === 'gozcu') return false;                /* v2.25: oyun drawWatchHut'a yönlendirir (aşağıda HKA.drawWatchHut) */
  if (id === 'tekne') { gf('drawBoat')({ x: d.x, y: d.y - 1.6, r: 1 }); return; }
  if (id === 'lamba') { gf('drawLamp')(d.x, d.y); return; }
  var fr = 0, on = 0;
  if (id === 'nazar') { var s = Math.sin(t * 1.6); fr = s > 0.4 ? 2 : s < -0.4 ? 0 : 1; }
  else if (id === 'kilim') { var k = Math.sin(t * 1.1) * 0.6; fr = k > 0.3 ? 2 : k < -0.3 ? 0 : 1; }
  else if (id === 'cesme') fr = gf('phase2')(t, 6) ? 0 : 1;
  else if (id === 'fener') on = gf('phase2')(t, 0.8) ? 1 : 0;
  L.blit(decorSpr(id, fr, on), sx, sy);
  if (id === 'bayrak') L.blit(flagSpr(Math.floor(t * 3) % 3, 28, 18), sx, sy - 34);
  if (id === 'fener' && on) L.blit(beamSpr(), sx, sy, 0.22);
};


/* =====================================================================
   v2.16–v2.18 EKLERİ: hayvan evleri, hediye süsü (lig bayrağı), ağ sandığı, Emekçi halkaları,
   Şeref Panosu, yerdeki özel sayı. Konum / boyut klasik çizimle aynı (yerleşim testleri).
   ===================================================================== */
/* el yazısı karalama (tabela): kısa koyu çizgiler, sabit tohum */
function scrawl(b, x, y, w, c, seed) {
  var cx = x, n = 0;
  while (cx < x + w - 1) {
    var wl = 2 + Math.floor(hash(seed, n++) * 5);
    if (cx + wl > x + w) wl = x + w - cx;
    b.rect(cx, y + (hash(seed + 3, n) > 0.7 ? 1 : 0), wl, 1, c);
    cx += wl + 2;
  }
}
/* y = sabit yüzde (ön-sol yüz) kemerli / yuvarlak kapı: xc merkez, hw yarı genişlik (karo), zs düz kısım, za kemer yüksekliği */
function archDoor(b, xc, y, hw, zs, za, col) {
  var X0 = Math.ceil(fx(xc - hw, y)), X1 = Math.floor(fx(xc + hw, y));
  for (var X = X0; X <= X1; X++) {
    var xw = xc - hw + (X - fx(xc - hw, y)) / (12 * KK), u = (xw - xc) / hw;
    var zt = zs + za * Math.sqrt(Math.max(0, 1 - u * u));
    var y0 = R(fy(xw, y, zt)), y1 = R(fy(xw, y, 0));
    for (var Y = y0; Y < y1; Y++) b.set(X, Y, typeof col === 'function' ? col(u, (y1 - Y) / KK) : col);
  }
}
/* yerde küçük mama kabı + kemik / kılçık (çapa: dünya noktası) */
function bowlK(b, x, y, food) {
  var X = R(fx(x, y)), Y = R(fy(x, y, 0));
  b.rect(X - 6, Y - 4, 12, 4, '#c9952f'); b.rect(X - 6, Y - 4, 12, 1, '#e6be59'); b.rect(X + 3, Y - 3, 3, 3, '#a87a24'); b.rect(X - 5, Y, 10, 1, '#8a6420');
  b.rect(X - 5, Y - 6, 10, 2, food); b.set(X - 3, Y - 6, lite(food, 0.25)); b.set(X + 1, Y - 7, lite(food, 0.2)); b.set(X - 1, Y - 7, food); b.set(X + 3, Y - 6, dark(food, 0.25));
}
var PH_CUSH = ['#c25a4a', '#3f7fb8', '#5f9a4a', '#c99a3a'];
function petHouseSpr(dog, idx) {
  return spr('phouse|' + (dog ? 'd' : 'c') + idx + '|' + G().K, 0, 0, function (b) {
    var p = P(), hw = dog ? 0.4 : 0.31, hh = dog ? 0.34 : 0.27, h = dog ? 12 : 8, rh = dog ? 7 : 6;
    var x0 = -hw, y0 = -hh, x1 = hw, y1 = hh, ov = 0.07;
    var wt = dog ? '#9a6a3c' : '#c9975f', wl = dog ? '#8a5a30' : '#ab7a48', wr = dog ? '#6f4526' : '#8a5f36';
    /* taban kirişi + gövde (yatay tahta) */
    box(b, x0 - 0.03, y0 - 0.03, 2 * hw + 0.06, 2 * hh + 0.06, 0, 1.2, dark(wr, 0.1), dark(wl, 0.25), dark(wr, 0.25), { norim: true });
    box(b, x0, y0, 2 * hw, 2 * hh, 1, h, wt, woodH(wl, dog ? 4 : 3), woodH(wr, dog ? 4 : 3));
    /* köşe dikmeleri */
    vl(b, x0, y1, 1, h, lite(wl, 0.18), 2); vl(b, x1, y1, 1, h, dark(wl, 0.18), 2); vl(b, x1, y0, 1, h, dark(wr, 0.2), 1);
    /* ön alın üçgeni (ön-sol yüz) */
    poly(b, [P3(x0, y1, h), P3(x1, y1, h), P3(0, y1, h + rh)], woodV(wl, 3));
    /* çatı: mahya y boyunca; sol (koyu) ve sağ (açık) kiremit düzlemi */
    roofPlane(b, [[0, y0 - ov, h + rh], [0, y1 + ov, h + rh], [x0 - ov, y1 + ov, h - 1], [x0 - ov, y0 - ov, h - 1]], p.tileDark, dark(p.tileDark, 0.3), dog ? 3 : 2);
    roofPlane(b, [[0, y0 - ov, h + rh], [0, y1 + ov, h + rh], [x1 + ov, y1 + ov, h - 1], [x1 + ov, y0 - ov, h - 1]], p.tile, p.tileDark, dog ? 4 : 3);
    hl(b, 0, y0 - ov, 0, y1 + ov, h + rh, p.tileLite);
    hl(b, x0 - ov, y1 + ov, 0, y1 + ov, h - 1, dark(p.tileDark, 0.4)); hl(b, 0, y1 + ov, x1 + ov, y1 + ov, h - 1, dark(p.tileDark, 0.4));
    hl(b, x0 - ov, y1 + ov, 0, y1 + ov, h - 0.4, lite(p.tile, 0.15));
    if (dog) {
      /* kemerli kapı + eşik; içi karanlık, dipte saman */
      archDoor(b, 0, y1, 0.2, 5.5, 3, lite(wl, 0.22));
      archDoor(b, 0, y1, 0.16, 5, 2.6, function (u, z) { return z < 1.2 ? '#6a5428' : z < 2 ? '#2a1c10' : '#140d08'; });
      hl(b, -0.2, y1, 0.2, y1, 0.5, dark(wl, 0.35));
      /* ad levhası (alın üçgeninde): krem tahta, pirinç çivi, karalama */
      var cx = R(fx(0, y1)), cy = R(fy(0, y1, h + 1.7));
      b.rect(cx - 7, cy - 3, 14, 6, '#e8dcc0'); b.rect(cx - 7, cy - 3, 14, 1, '#f6eedc'); b.rect(cx - 7, cy + 2, 14, 1, '#b9ab8c');
      b.set(cx - 6, cy - 2, p.brass); b.set(cx + 5, cy - 2, p.brass);
      scrawl(b, cx - 5, cy, 10, '#5a3a1c', 11 + idx);
      /* önde kap ve kemik */
      bowlK(b, 0.42, 0.5, '#8a5a30');
      var bx = R(fx(0.42, 0.5)) - 18, by = R(fy(0.42, 0.5, 0)) - 2;
      b.rect(bx, by, 8, 2, p.cream); b.rect(bx - 2, by - 1, 2, 2, p.cream); b.rect(bx - 2, by + 1, 2, 2, '#d8cdb4'); b.rect(bx + 8, by - 1, 2, 2, p.cream); b.rect(bx + 8, by + 1, 2, 2, '#d8cdb4');
      b.rect(bx, by + 1, 8, 1, '#d8cdb4');
    } else {
      /* yuvarlak kapı: açık çerçeve, karanlık iç, dipte minder */
      var cu = PH_CUSH[idx % 4];
      archDoor(b, 0, y1, 0.16, 1.4, 4.8, lite(wl, 0.25));
      archDoor(b, 0, y1, 0.125, 1.6, 4, function (u, z) { return z < 1.6 ? (z < 0.8 ? dark(cu, 0.2) : cu) : z < 2.2 ? lite(cu, 0.3) : '#1a120c'; });
      /* alın üçgeninde küçük balık kabartması */
      var fx0 = R(fx(0, y1)), fy0 = R(fy(0, y1, h + 2.2));
      b.rect(fx0 - 3, fy0, 5, 2, '#d8dde0'); b.set(fx0 + 2, fy0, '#d8dde0'); b.set(fx0 - 4, fy0 - 1, '#d8dde0'); b.set(fx0 - 4, fy0 + 2, '#d8dde0'); b.set(fx0 + 1, fy0, '#16222b');
      bowlK(b, 0.42, 0.5, '#c87a4a');
      var kx = R(fx(0.42, 0.5)) - 18, ky = R(fy(0.42, 0.5, 0)) - 2;   /* balık kılçığı */
      b.rect(kx, ky, 8, 1, '#d8dde0'); for (var k = 0; k < 3; k++) { b.set(kx + 2 + k * 2, ky - 1, '#d8dde0'); b.set(kx + 2 + k * 2, ky + 1, '#c4ccd0'); }
      b.rect(kx + 8, ky - 1, 2, 3, '#d8dde0'); b.set(kx - 1, ky - 1, '#c4ccd0'); b.set(kx - 1, ky + 1, '#c4ccd0');
    }
    b.outline(0.55);
  });
}
HKA.drawPetHouse = function (d) {
  var dog = d.pet === 'dog', idx = parseInt(String(d.id || '').replace(/\D/g, ''), 10) || 0;
  gf('shadow')(d.x, d.y + 0.1, dog ? 0.7 : 0.55);
  at(petHouseSpr(dog, idx), d.x, d.y, 0);
};

/* --- v2.25 GÖZCÜ KULÜBESİ: taş eşik, kırmızı-beyaz şeritli ahşap gövde, kemerli açık kapı (ön-sol yüz), sağ yüzde mazgal,
   kurşun kaplı piramit çatı, yaldızlı alem + dalgalanan kırmızı flama. Ölçüler klasik drawWatchHut ile aynı (gövde ±0,34, duvar 34, tepe 47). --- */
function watchHutSpr(fr) {
  return spr('whut|' + fr + '|' + G().K, 0, 0, function (b) {
    var p = P(), hw = 0.34, x0 = -hw, y0 = -hw, x1 = hw, y1 = hw, H = 34, RH = 13, ov = 0.09, n = 5, k;
    var RED = '#c0392b', REDD = '#8e2a20', WHT = '#efe6d2', WHTD = '#c9bea4', WD = '#6f4526', WDD = '#4a2c18', WL = '#8a5a30';
    /* taş eşik */
    box(b, x0 - 0.05, y0 - 0.05, 2 * hw + 0.1, 2 * hw + 0.1, 0, 2, p.stoneLite, stoneW(p.stone), stoneW(p.stoneDark));
    /* şeritli duvarlar (dikey tahta dokusu) */
    for (k = 0; k < n; k++) {
      var a0 = x0 + 2 * hw * k / n, a1 = x0 + 2 * hw * (k + 1) / n, b0 = y0 + 2 * hw * k / n, b1 = y0 + 2 * hw * (k + 1) / n;
      wall(b, a0, y1, a1, y1, 2, H, woodV(k % 2 ? WHT : RED, 3));
      wall(b, x1, b0, x1, b1, 2, H, woodV(k % 2 ? WHTD : REDD, 3));
    }
    /* süpürgelik + saçak kirişi + ortada ince kuşak */
    wall(b, x0, y1, x1, y1, 2, 5, woodH(WD, 3)); wall(b, x1, y0, x1, y1, 2, 5, woodH(WDD, 3));
    wall(b, x0, y1, x1, y1, H - 3.5, H, woodH(WD, 3)); wall(b, x1, y0, x1, y1, H - 3.5, H, woodH(WDD, 3));
    hl(b, x0, y1, x1, y1, H - 3.5, lite(WL, 0.25)); hl(b, x1, y0, x1, y1, H - 3.5, WL);
    hl(b, x0, y1, x1, y1, 5, lite(WD, 0.3)); hl(b, x1, y0, x1, y1, 5, WD);
    /* kemerli kapı: pervaz, karanlık iç (sol iç duvar ve tabanda loş ışık), taş eşik */
    archDoor(b, 0, y1, 0.235, 24, 5, function (u, z) { return u < -0.75 || z > 27.6 ? lite(WL, 0.18) : WL; });
    archDoor(b, 0, y1, 0.185, 23, 4, function (u, z) { return u < -0.55 ? '#3a2618' : z < 1.6 ? '#4a3524' : z > 24.5 ? '#140d08' : '#1e140d'; });
    hl(b, -0.2, y1, 0.2, y1, 2, '#b8b09a');
    /* kapı üstü: yaldızlı hilal + yıldız */
    var hx = R(fx(0, y1)), hy = R(fy(0, y1, 31.2));
    b.rect(hx - 2, hy - 1, 1, 3, p.brass); b.set(hx - 1, hy - 2, p.brass); b.set(hx - 1, hy + 2, p.brass); b.set(hx, hy - 2, p.brassLite); b.set(hx, hy + 2, p.brassLite);
    b.set(hx + 2, hy, p.brassLite);
    /* sağ yüzde mazgal pencere */
    winR(b, x1, -0.085, 0.085, 18, 25, '#1e140d', WD);
    hl(b, x1, -0.12, x1, 0.12, 16.6, lite(WD, 0.25));
    /* köşe dikmeleri */
    vl(b, x0, y1, 2, H, WDD, 2); vl(b, x1, y1, 2, H, lite(WD, 0.12), 2); vl(b, x1, y0, 2, H, WDD, 2);
    /* kurşun kaplı piramit çatı (öndeki iki yüz) */
    var zt = H + RH, ze = H - 1, A = P3(0, 0, zt), E2 = P3(x1 + ov, y0 - ov, ze), E3 = P3(x1 + ov, y1 + ov, ze), E4 = P3(x0 - ov, y1 + ov, ze);
    poly(b, [E4, E3, A], grain('#8fa2ad', 0.05, 7));
    poly(b, [E3, E2, A], grain('#62747f', 0.05, 8));
    for (k = 1; k < 4; k++) {                                       /* levha sıraları */
      var r = k / 4, la = [E4[0] + (A[0] - E4[0]) * r, E4[1] + (A[1] - E4[1]) * r], lb = [E3[0] + (A[0] - E3[0]) * r, E3[1] + (A[1] - E3[1]) * r], lc = [E2[0] + (A[0] - E2[0]) * r, E2[1] + (A[1] - E2[1]) * r];
      line(b, la[0], la[1], lb[0], lb[1], '#738690'); line(b, lb[0], lb[1], lc[0], lc[1], '#4f5f69');
    }
    line(b, E4[0], E4[1] + 1, E3[0], E3[1] + 1, '#2e3a42'); line(b, E3[0], E3[1] + 1, E2[0], E2[1] + 1, '#25313a');
    line(b, E4[0], E4[1], E3[0], E3[1], '#b0c0c8');
    line(b, E3[0], E3[1], A[0], A[1], '#c9d6dc');                    /* ön mahya */
    /* alem: pirinç sap, yaldızlı top, hilal */
    var ax = R(A[0]), ay = R(A[1]);
    b.rect(ax, ay - 20, 2, 20, '#b9892c'); b.rect(ax, ay - 20, 1, 20, '#e0b858');
    b.rect(ax - 2, ay - 6, 6, 3, p.brass); b.rect(ax - 2, ay - 6, 6, 1, p.brassLite);
    b.rect(ax - 1, ay - 25, 4, 4, '#ffc94a'); b.set(ax - 1, ay - 25, '#fff0b0'); b.rect(ax, ay - 26, 2, 1, '#ffe08a');
    /* flama: kırlangıç kuyruklu kırmızı, beyaz hilal; kare ile dalgalanır */
    for (var i = 0; i < 16; i++) {
      var tt = i / 16, half = Math.round(4 * (1 - tt * 0.45)), wv = Math.round(Math.sin(i * 0.42 - fr * 2.1) * 1.4 * tt);
      for (var j = -half; j <= half; j++) {
        if (i > 12 && Math.abs(j) < (i - 12)) continue;               /* kırlangıç kuyruğu */
        b.set(ax + 2 + i, ay - 17 + j + wv, j === -half ? '#e25a48' : j === half ? '#8e2a20' : '#d23a2a');
      }
    }
    var mx = ax + 6, my = ay - 17 + Math.round(Math.sin(4 * 0.42 - fr * 2.1) * 1.4 * 0.25);
    b.set(mx, my - 2, '#f4e9d2'); b.set(mx - 1, my - 1, '#f4e9d2'); b.set(mx - 1, my, '#f4e9d2'); b.set(mx - 1, my + 1, '#f4e9d2'); b.set(mx, my + 2, '#f4e9d2');
    b.set(mx + 2, my, '#f4e9d2');
    b.outline(0.55);
  });
}
HKA.drawWatchHut = function (d) {
  gf('shadow')(d.x, d.y + 0.1, 0.8);
  var s = Math.sin(T() * 2.6), fr = s > 0.35 ? 2 : s < -0.35 ? 0 : 1;
  at(watchHutSpr(fr), d.x, d.y, 0);
};

/* --- hediye süsü: lig bayrağı (taş kaide, pirinç direk, lacivert flama, altın şerit, yıldız) --- */
function ligFlagSpr(fr) {
  return spr('lig|' + fr + '|' + G().K, 0, 0, function (b) {
    var p = P();
    box(b, -0.17, -0.13, 0.34, 0.26, 0, 3, p.stoneLite, stoneW(p.stone), stoneW(p.stoneDark));
    box(b, -0.1, -0.08, 0.2, 0.16, 3, 4.5, lite(p.stoneLite, 0.1), p.stone, p.stoneDark);
    b.rect(-1, -66, 3, 58, '#c9a15e'); b.rect(-1, -66, 1, 58, '#e8c88a'); b.rect(1, -66, 1, 58, '#9a7a40');
    b.rect(-2, -70, 5, 4, p.gold); b.rect(-1, -71, 3, 1, p.gold); b.set(-1, -69, '#fff2b0');
    /* flama: üçgen, dalga ile kayar */
    for (var i = 0; i < 32; i++) {
      var t = i / 32, half = Math.round(11 * (1 - t)), wv = Math.round(Math.sin(i * 0.28 - fr * 2.1) * 1.6 * t);
      for (var j = -half; j <= half; j++) {
        var y = -53 + j + wv, c = Math.abs(j) <= 1 ? (j === -1 ? '#fff0a0' : p.gold) : (j < -half + 2 ? '#3a64a0' : j > half - 2 ? '#1c3658' : '#2a4c7d');
        b.set(2 + i, y, c);
      }
    }
    /* yıldız (krem) */
    var ST = ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'];
    for (var sj = 0; sj < 7; sj++) for (var si = 0; si < 7; si++) if (ST[sj][si] === '#') b.set(6 + si, -62 + sj, sj < 3 ? '#fffaf0' : '#f4e9d2');
    b.outline(0.55);
  });
}
HKA.drawGiftDecor = function (d) {
  if (d.id !== 'ligbayrak') return false;          /* bilinmeyen hediye: klasik */
  gf('shadow')(d.x, d.y, 0.35);
  var s = Math.sin(T() * 2.2), fr = s > 0.3 ? 2 : s < -0.3 ? 0 : 1;
  at(ligFlagSpr(fr), d.x, d.y, 0);
};

/* --- Emekçi Mod ağ sandığı: tahta sandık, demir köşebent, halat sap, kenardan sarkan ağ --- */
function netBoxSpr() {
  return spr('netbox|' + G().K, 0, 0, function (b) {
    var x0 = -0.32, y0 = -0.26, w = 0.64, h = 0.52, p = P();
    box(b, x0, y0, w, h, 0, 6, function (u, v) { return (u < 0.5 || v < 0.5) ? '#a87040' : (Math.floor(v * 3.2) % 3 === 0 ? '#6f4526' : '#8a5a30'); }, woodH('#5a3a1c', 3), woodH('#6f4526', 3));
    /* kapak çizgisi, köşebentler */
    hl(b, x0, y0 + h, x0 + w, y0 + h, 5.4, p.woodLite);
    vl(b, x0, y0 + h, 0, 6, '#3c4650', 2); vl(b, x0 + w, y0 + h, 0, 6, '#2a323a', 2); vl(b, x0 + w, y0, 0, 6, '#2a323a', 1);
    /* kilit */
    var lx = R(fx(0, y0 + h)), ly = R(fy(0, y0 + h, 4));
    b.rect(lx - 2, ly, 4, 5, '#4a2f18'); b.rect(lx - 1, ly + 1, 2, 2, p.brass); b.set(lx - 1, ly + 1, p.brassLite);
    /* halat sap (sağ yüz) */
    var hx = R(fx(x0 + w, 0)), hy = R(fy(x0 + w, 0, 3.6));
    b.rect(hx - 3, hy, 1, 2, p.rope); b.rect(hx - 2, hy + 2, 4, 1, p.rope); b.rect(hx + 2, hy - 1, 1, 3, p.rope); b.set(hx - 1, hy + 2, lite(p.rope, 0.3));
    /* ön-sol kenardan sarkan ağ (ızgara) */
    var nx0 = R(fx(x0 + 0.06, y0 + h)), ny0 = R(fy(x0 + 0.06, y0 + h, 6));
    for (var i = 0; i < 9; i++) for (var j = 0; j < 6 - (i > 6 ? 2 : 0); j++) {
      if ((i + j) % 2) continue;
      b.set(nx0 + i, ny0 + Math.round(i / 2) + j, j === 0 ? '#c9d6de' : '#8fa9bd', 0.9);
    }
    b.set(nx0 + 2, ny0 + 4, '#e5533d'); b.set(nx0 + 3, ny0 + 4, '#ff7a5a');   /* mantar şamandıra */
    b.outline(0.55);
  });
}
HKA.drawNetBox = function (s) {
  gf('shadow')(s.bx, s.by, 0.4);
  at(netBoxSpr(), s.bx, s.by, 0);
  gf('drawStack')(s.bx, s.by, s.box, 6, 2.6);
  gf('labelAt')(s.bx, s.by + 0.5, 20, gf('T')('em_box') + ' ' + s.box.length + '/' + gf('boxCap')(s), '#bfe9ff', s.box.length ? '' + s.box.length : '');
};

/* --- Emekçi Mod iş halkası (ince piksel halka + küçük simge) --- */
function emRingSpr(q) {
  return L.sprite('emring|' + q + '|' + G().K, function (b) {
    var a0 = -Math.PI / 2, A = q / 24 * Math.PI * 2;
    for (var y = -15; y <= 15; y++) for (var x = -15; x <= 15; x++) {
      var r = Math.sqrt((x + 0.5) * (x + 0.5) + (y + 0.5) * (y + 0.5));
      if (r < 9.6 || r > 14.4) continue;
      var an = Math.atan2(y + 0.5, x + 0.5) - a0; if (an < 0) an += Math.PI * 2;
      var edge = r < 10.6 || r > 13.4;
      if (an <= A && q > 0) b.set(x, y, edge ? (r < 10.6 ? '#fff0b0' : '#c9952f') : '#ffc94a');
      else b.set(x, y, '#0a1a27', edge ? 0.55 : 0.75);
    }
  });
}
function emIconSpr(kind) {
  return L.sprite('emic|' + kind + '|' + G().K, function (b) {
    if (kind === 'knife') { b.rect(0, 0, 3, 11, '#dfe8ee'); b.rect(0, 0, 1, 11, '#ffffff'); b.rect(-1, 11, 5, 1, '#3c4650'); b.rect(0, 12, 3, 6, '#6f4526'); b.rect(0, 12, 1, 6, '#8a5a32'); }
    else if (kind === 'net') { for (var i = 0; i < 8; i++) for (var j = 0; j < 4; j++) if ((i + j) % 2 === 0) b.set(i, j, j === 0 ? '#d7e4ee' : '#8fa9bd'); b.rect(3, -1, 2, 1, '#e5533d'); }
    else { b.circ(3, 3, 3, '#c9952f'); b.circ(3, 3, 2, '#e6be59'); b.rect(3, 1, 1, 4, '#c9952f'); b.set(1, 1, '#fff2b0'); }
    b.outline(0.5);
  });
}
function emRing(x, y, z, pr, kind) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, z)), q = Math.round(clamp(pr, 0.02, 1) * 24), t = T();
  L.blit(emRingSpr(q), sx, sy);
  var k = (t * 3) % 1, up = gf('phase2')(t, 8);
  if (kind === 'knife') L.blit(emIconSpr('knife'), sx + 9, sy - 7 - up * 2);
  else if (kind === 'net') { L.blit(emIconSpr('net'), sx - 12, sy - 5 - R(k * 6)); L.fr(sx - 10, sy + 2, 0, 0, 1, 2 + R(k * 12), P().rope); }
  else L.blit(emIconSpr('coin'), sx + 8, sy - 4 - R(k * 5));
}
HKA.drawEmekFx = function () {
  var nets = gf('allNets')(), emNetOn = gf('emNetOn'), zoneAuto = gf('zoneAuto'), areaStock = gf('areaStock'), wait = gf('emekWait');
  var tables = gv('tables'), counters = gv('counters'), A = gv('AREAS'), gt = T(), i;
  for (i = 0; i < nets.length; i++) {
    var s = nets[i]; if (!emNetOn(s) || zoneAuto(s.z)) continue;
    if (s._et === gt) { if (s._eb === 'p') emRing(s.x, s.y + 0.9, 48, s._ep, 'net'); }
    else if (s.stock.length >= areaStock(s.z)) wait(s.x, s.y + 0.9, 34);
  }
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (A[tb.z].locked || zoneAuto(i)) continue;
    if (tb._et === gt) { if (tb._eb === 'p' && tb.cur) emRing(tb.x, tb.y, 46, tb._ep, 'knife'); }
    else if (tb.cur || tb.inn.length) wait(tb.x, tb.y, 36);
  }
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (A[c.z].locked || !c.open) continue;
    var w = false;
    for (var q = 0; q < c.slots.length; q++) if (c.slots[q] && c.slots[q].state === 'wait') w = true;
    if (c._et === gt) { if (c._eb === 'p' && w) emRing(c.x, c.y, 60, c._ep, 'coin'); }
    else if (w) wait(c.x, c.y - 1.2, 62);
  }
};

/* --- yerdeki özel sayı: katlı gazete, manşet şeridi, kırmızı mühür; ışıltı + ara sıra zıplar --- */
function gzPaperSpr() {
  return spr('gzpaper|' + G().K, 0, 0, function (b) {
    var x0 = -0.26, y0 = -0.18, w = 0.52, h = 0.36;
    box(b, x0, y0, w, h, 0, 1, function (u, v) { return hash(R(u * 4), R(v * 4)) > 0.92 ? '#ddd0b0' : '#ece2c8'; }, '#c9bc9c', '#b5a888', { norim: true });
    quadW(b, x0, y0, w, 0.08, 1.05, '#2c231a');                                         /* manşet şeridi */
    for (var k = 0; k < 3; k++) hl(b, x0 + 0.06, y0 + 0.14 + k * 0.07, x0 + w - 0.08 - (k === 2 ? 0.12 : 0), y0 + 0.14 + k * 0.07, 1.05, '#8f7a57');
    quadW(b, x0 + 0.05, y0 + 0.13, 0.12, 0.12, 1.05, '#6f6250');                         /* fotoğraf */
    hl(b, 0, y0, 0, y0 + h, 1.06, '#d8cbad');                                           /* katlama izi */
    var sx = R(fx(0.1, 0.1)), sy = R(fy(0.1, 0.1, 1));
    b.circ(sx, sy, 2, '#a8281e'); b.set(sx - 1, sy - 1, '#d8483a'); b.set(sx, sy - 1, '#d8483a');   /* mühür */
    b.outline(0.5);
  });
}
var GLOW = null;
function gzGlowSpr() {
  return GLOW || (GLOW = spr('gzglow|' + G().K, 0, 0, function (b) { quadW(b, -0.36, -0.27, 0.72, 0.54, 0, '#ffe27a'); }));
}
HKA.drawGzPaper = function (o) {
  var c = o.t % 2.6, hop = c < 0.36 ? Math.sin(c / 0.36 * Math.PI) * 3 : 0, gl = 0.5 + 0.5 * Math.sin(o.t * 4);
  gf('shadow')(o.x, o.y, 0.32);
  at(gzGlowSpr(), o.x, o.y, 0, 0.18 + gl * 0.22);
  at(gzPaperSpr(), o.x, o.y, R(hop));
  var sx = R(pX(o.x, o.y)), sy = R(pY(o.x, o.y, 2 + hop));
  for (var i = 0; i < 3; i++) {                                                          /* parıltı: küçük artı */
    var a = o.t * 2.2 + i * 2.1, kx = sx + Math.round(Math.cos(a) * 9), ky = sy - 4 + Math.round(Math.sin(a) * 4);
    if (Math.sin(o.t * 6 + i * 1.7) > 0.2) {
      L.fr(kx, ky, 0, 0, 1, 1, '#fff4c2'); L.fr(kx, ky, -1, 0, 1, 1, 'rgba(255,226,122,.7)'); L.fr(kx, ky, 1, 0, 1, 1, 'rgba(255,226,122,.7)');
      L.fr(kx, ky, 0, -1, 1, 1, 'rgba(255,226,122,.7)'); L.fr(kx, ky, 0, 1, 1, 1, 'rgba(255,226,122,.7)');
    }
  }
  gf('uiLabel')(o.x, o.y, 14 + hop, '📰 ' + gf('T')('gzOnGround'), '#ffe27a', 0.95);
};

/* --- Şeref Panosu: iki direk, tahta pano, kiremit saçak, beş çerçeve (dolu: sepya manşet), pirinç levha --- */
function famePanoSpr(mask) {
  return L.sprite('fame|' + mask + '|' + G().K, function (b) {
    var p = P(), i, x, y;
    /* direkler */
    for (i = 0; i < 2; i++) { var px0 = i ? 30 : -34; b.rect(px0, -32, 4, 32, p.woodDark); b.rect(px0 + 1, -32, 1, 32, p.wood); b.rect(px0, -2, 4, 2, dark(p.woodDark, 0.2)); }
    /* pano: yatay tahtalar */
    for (y = -70; y < -30; y++) for (x = -40; x < 40; x++) {
      var edge = x < -38 || x > 37 || y < -68 || y > -33;
      var row = Math.floor((y + 68) / 6), seam = ((y + 68) % 6) === 0;
      b.set(x, y, edge ? p.woodDark : seam ? dark(p.wood, 0.18) : (hash(x >> 2, row) > 0.86 ? lite(p.wood, 0.08) : hash(x, y) > 0.95 ? dark(p.wood, 0.1) : p.wood));
    }
    b.rect(-38, -68, 76, 1, lite(p.wood, 0.25));
    /* kiremit saçak */
    for (x = -44; x < 44; x++) for (y = -78; y < -70; y++) {
      var tl = ((x + 44) % 6) === 0;
      b.set(x, y, y === -78 ? p.tileLite : y > -73 ? p.tileDark : tl ? p.tileDark : p.tile);
    }
    b.rect(-44, -70, 88, 1, 'rgba(0,0,0,.3)');
    for (x = -44; x < 44; x += 6) b.set(x + 3, -72, lite(p.tile, 0.2));
    /* çerçeveler */
    for (i = 0; i < 5; i++) {
      var fx0 = -34 + i * 14, fy0 = -64, on = (mask >> i) & 1;
      if (on) {
        var fc = i === 4 ? p.brass : p.tar;
        b.rect(fx0, fy0, 12, 16, fc); b.rect(fx0, fy0, 12, 1, lite(fc, 0.3)); b.rect(fx0 + 11, fy0, 1, 16, dark(fc, 0.3));
        b.rect(fx0 + 2, fy0 + 2, 8, 12, '#e8dcc0');
        b.rect(fx0 + 2, fy0 + 2, 8, 2, '#2c231a');                                     /* manşet */
        b.rect(fx0 + 2, fy0 + 5, 4, 4, '#8f7a57'); b.set(fx0 + 3, fy0 + 6, '#b8a47e');  /* fotoğraf */
        b.rect(fx0 + 7, fy0 + 5, 3, 1, '#9a8a6c'); b.rect(fx0 + 7, fy0 + 7, 3, 1, '#9a8a6c');
        b.rect(fx0 + 2, fy0 + 10, 8, 1, '#9a8a6c'); b.rect(fx0 + 2, fy0 + 12, 6, 1, '#9a8a6c');
        if (i === 4) { b.rect(fx0 + 7, fy0 + 10, 2, 2, '#a8281e'); b.set(fx0 + 7, fy0 + 10, '#d8483a'); }
      } else {
        b.rect(fx0, fy0, 12, 16, '#5a3e26', 0.55); b.rect(fx0 + 2, fy0 + 2, 8, 12, dark(p.wood, 0.06), 0.55);
        b.rect(fx0 + 2, fy0 + 2, 8, 1, dark(p.wood, 0.2), 0.55);
      }
    }
    /* pirinç levha */
    b.rect(-14, -46, 28, 6, p.brass); b.rect(-14, -46, 28, 1, p.brassLite); b.rect(-14, -41, 28, 1, dark(p.brass, 0.3));
    b.set(-13, -44, dark(p.brass, 0.4)); b.set(12, -44, dark(p.brass, 0.4));
    scrawl(b, -10, -44, 20, '#6b4a1a', 31);
    b.outline(0.55);
  });
}
HKA.drawFamePano = function (o, fr) {
  var mask = 0, n = 0;
  for (var i = 0; i < 5; i++) if (fr && fr[i]) { mask |= 1 << i; n++; }
  gf('shadow')(o.x, o.y, 1.0);
  at(famePanoSpr(mask), o.x, o.y, 0);
  var pl = G().player;
  if (d2(pl.x, pl.y, o.x, o.y) < 7) gf('uiLabel')(o.x, o.y, 46, gf('T')('gzFame', { n: n, m: 5 }), '#e4b94a', 0.95);
};

/* =====================================================================
   TARİF DEFTERİ (v2.18-deneme): 8 yemek simgesi + Güveç Ocağı
   Yemek çapası klasik drawDish'in (x, y) noktası: tabak altı +3 sanat px, yemek üstü -4 sanat px (ince ×2).
   ===================================================================== */
var DISH_IDS = { hamsitava: 1, hamsipilav: 1, karalahana: 1, uskumrudolma: 1, levrekbugulama: 1, orkinosizgara: 1, palamutpilaki: 1, reisguveci: 1 };
/* tabak: yayvan elips, mavi çizgili kenar, altta gölge */
function dPlate(b, cy) {
  b.ellipse(0, cy, 12, 3, '#e4ddcc');
  for (var x = -11; x <= 11; x++) { var e = Math.round(3 * Math.sqrt(Math.max(0, 1 - x * x / 145))); b.set(x, cy - e, '#f6f1e4'); b.set(x, cy + e, '#a39a88'); if (e > 1) b.set(x, cy - e + 1, '#8fa9bd'); }
  b.rect(-9, cy + 3, 18, 1, '#8a8274');
}
/* toprak kap (güveç / kâse): üst ağız elipsi + gövde */
function dPot(b, w, top, h, body, rim, inner) {
  for (var y = top; y < top + h; y++) { var k = (y - top) / h, hw = Math.round(w - k * k * 2); for (var x = -hw; x <= hw; x++) b.set(x, y, x < -hw + 2 ? lite(body, 0.12) : x > hw - 3 ? dark(body, 0.22) : body); }
  b.rect(-w + 2, top + h, 2 * w - 3, 1, dark(body, 0.4));
  b.ellipse(0, top, w, 2, rim); b.ellipse(0, top, w - 2, 1, inner);
}
/* küçük yatay balık (baş sağda) */
function dFish(b, x, y, len, c, cl, cd, eye) {
  for (var i = 0; i < len; i++) { var thick = i > 1 && i < len - 2; b.set(x + i, y, cl); if (thick) b.set(x + i, y + 1, c); }
  b.set(x - 1, y - 1, cd); b.set(x - 1, y + 1, cd); b.set(x, y + 1, cd);
  if (eye) b.set(x + len - 2, y, eye);
}
function dishSprT(d) {
  return L.sprite('tfdish|' + d + '|' + G().K, function (b) {
    var i;
    if (d === 'hamsitava') {                        /* mısır unlu kızarmış hamsi dizisi, limon, maydanoz */
      dPlate(b, 4);
      for (i = 0; i < 3; i++) {                     /* üç kızarmış hamsi yan yana, üst üste kaymış */
        var fx0 = -8 + (i % 2) * 2, fy0 = -4 + i * 2;
        for (var k = 0; k < 14; k++) {
          var top = k > 1 && k < 13, cr = hash(k, i) > 0.7 ? '#b87a30' : '#d9a048';
          b.set(fx0 + k, fy0, k < 2 ? '#8a5a20' : top ? '#e8b25a' : '#c98a3a');
          if (top) b.set(fx0 + k, fy0 + 1, cr);
        }
        b.set(fx0 - 1, fy0 - 1, '#8a5a20'); b.set(fx0 - 1, fy0 + 1, '#8a5a20'); b.set(fx0 + 12, fy0, '#16222b');
      }
      b.rect(8, 0, 4, 3, '#e8d24a'); b.rect(9, 0, 2, 1, '#f6ea90'); b.set(11, 2, '#c9a82a');
      b.set(-11, 1, '#4f8a3a'); b.set(-10, 0, '#6fae4a'); b.set(-12, 0, '#4f8a3a');
    } else if (d === 'hamsipilav') {                /* bakır tepside kubbe pilav, üstü hamsi yorgan */
      b.ellipse(0, 3, 12, 3, '#b8733a'); for (var x = -12; x <= 12; x++) { var e2 = Math.round(3 * Math.sqrt(Math.max(0, 1 - x * x / 156))); b.set(x, 3 - e2, '#e0a060'); b.set(x, 3 + e2, '#7d4a24'); }
      for (var y = -6; y <= 2; y++) { var hw = Math.round(9 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 2) / 9, 2)))); for (x = -hw; x <= hw; x++) {
        var c, r3 = (y + 6) % 3;                     /* hamsi yorgan: gümüş şeritler, koyu sırt çizgisi */
        if (y >= 1) c = (x + y) % 3 ? '#efe6cf' : '#f8f2e2';
        else c = r3 === 0 ? '#5f7f95' : r3 === 1 ? '#c9d6de' : '#8fa9bd';
        b.set(x, y, x < -hw + 2 && y < 1 ? lite(c, 0.2) : c);
      } }
      b.set(-5, -3, '#16222b'); b.set(-7, 0, '#16222b'); b.set(-2, -6, '#16222b');   /* hamsi gözleri */
      b.set(-1, -5, '#ffffff'); b.set(0, -5, '#e8f0f4');
      b.set(5, 2, '#4f8a3a'); b.set(-4, 2, '#4f8a3a');
    } else if (d === 'karalahana') {                /* toprak kâse, koyu yeşil çorba, mısır taneleri */
      dPot(b, 10, -2, 6, '#7d4f2b', '#a06a3a', '#2f5136');
      b.set(-5, -2, '#4f7a4f'); b.set(-4, -2, '#4f7a4f'); b.set(-3, -3, '#4f7a4f'); b.set(3, -2, '#4f7a4f'); b.set(4, -3, '#3e6b45');
      b.set(-1, -2, '#ffc94a'); b.set(2, -3, '#ffc94a'); b.set(5, -2, '#ffd86a'); b.set(-6, -3, '#ffc94a');
      b.rect(-4, 4, 8, 1, '#5e3a20');
    } else if (d === 'uskumrudolma') {              /* pilav dolu uskumru, limon */
      dPlate(b, 4);
      for (i = 0; i < 18; i++) {
        var hh = i < 2 ? 0 : i > 15 ? 1 : 2, X = -10 + i;
        for (var j = -hh; j <= hh; j++) {
          var cc = j < 0 ? ((i + j * 2) % 4 < 2 ? '#2f5f5a' : '#5f8f8a') : j === 0 ? '#7fb0aa' : '#cfe6df';
          b.set(X, 0 + j, cc);
        }
      }
      b.rect(-6, 1, 10, 2, '#efe6cf'); b.set(-4, 1, '#8a5a30'); b.set(-1, 2, '#8a5a30'); b.set(2, 1, '#8a5a30'); b.set(0, 1, '#4f8a3a');
      b.set(-11, -1, '#4a7a75'); b.set(-12, -2, '#4a7a75'); b.set(-11, 1, '#4a7a75'); b.set(-12, 2, '#4a7a75');
      b.set(6, -1, '#16222b'); b.set(6, -2, '#ffffff');
      b.rect(9, 1, 3, 2, '#e8d24a'); b.set(9, 1, '#f6ea90');
    } else if (d === 'levrekbugulama') {            /* kara tava: domates sosu, beyaz levrek, mor soğan, yeşil biber */
      dPot(b, 11, -1, 4, '#3a3530', '#5a544c', '#c0392b');
      b.rect(11, 0, 5, 2, '#2a2420'); b.set(15, 0, '#4a443c');
      b.rect(-6, -4, 12, 3, '#eaf2f7'); b.rect(-6, -4, 12, 1, '#ffffff'); b.rect(-5, -2, 10, 1, '#c8d4da');
      b.set(-3, -3, '#d0dce2'); b.set(1, -3, '#d0dce2');
      b.set(-9, -2, '#7b3f7a'); b.set(-8, -1, '#9b5f9a'); b.set(8, -2, '#7b3f7a'); b.set(7, -1, '#9b5f9a');
      b.set(2, -1, '#e8574a'); b.set(-8, -1, '#e8574a'); b.set(6, 0, '#4f8a3a'); b.set(-5, 0, '#4f8a3a');
    } else if (d === 'orkinosizgara') {             /* kalın orkinos dilimi, ızgara izi, eriyen tereyağı */
      dPlate(b, 4);
      for (var y2 = -5; y2 <= 2; y2++) for (var x2 = -8; x2 <= 7; x2++) {
        if ((x2 === -8 || x2 === 7) && (y2 === -5 || y2 === 2)) continue;
        var c2 = y2 === -5 ? '#d0605a' : y2 > 0 ? '#8e302b' : '#b8453f';
        if (((x2 - y2 + 40) % 5) === 0 && y2 < 1) c2 = '#5e1e1a';
        b.set(x2, y2, c2);
      }
      b.rect(-2, -7, 5, 2, '#ffe08a'); b.set(-2, -7, '#fff4c0'); b.rect(-1, -5, 4, 1, '#f0c858');
      b.set(9, 1, '#4f8a3a'); b.set(10, 0, '#6fae4a'); b.set(10, 2, '#4f8a3a');
    } else if (d === 'palamutpilaki') {             /* yayvan toprak kap: turuncu sos, palamut parçaları, havuç, soğan, maydanoz */
      dPot(b, 11, -2, 5, '#9a4a28', '#b8623a', '#d8743a');
      b.rect(-7, -4, 5, 2, '#e0a090'); b.rect(-7, -5, 5, 1, '#5a6a80'); b.rect(1, -4, 5, 2, '#e0a090'); b.rect(1, -5, 5, 1, '#5a6a80'); b.set(-5, -5, '#8fa9bd'); b.set(3, -5, '#8fa9bd');   /* palamut dilimleri: lacivert sırt */
      b.set(-1, -2, '#f1ebda'); b.set(6, -2, '#f1ebda'); b.set(-8, -2, '#f08a3a'); b.set(4, -1, '#f08a3a');
      b.set(-3, -1, '#4f8a3a'); b.set(7, -3, '#4f8a3a'); b.set(-2, -5, '#6fae4a');
    } else {                                        /* reisguveci: kulplu toprak güveç, kızarmış üst, maydanoz (klasiğe sadık) */
      dPot(b, 10, -3, 7, '#9a4a28', '#b8623a', '#d8743a');
      b.rect(-12, -1, 2, 3, '#7d3a1e'); b.rect(10, -1, 2, 3, '#7d3a1e');
      b.rect(-5, -4, 4, 1, '#f0a15a'); b.rect(2, -3, 4, 1, '#f0a15a'); b.set(-6, -3, '#a8401c'); b.set(5, -4, '#a8401c');
      b.set(-1, -4, '#4f8a3a'); b.set(3, -4, '#6fae4a'); b.set(0, -3, '#4f8a3a');
    }
    b.outline(0.55);
  });
}
function dishSteam(x, y) {
  var f = Math.floor(T() * 3) % 2;
  L.fr(x, y, -2, -12 - f * 2, 1, 3, 'rgba(255,255,255,.5)'); L.fr(x, y, 2, -14 + f * 2, 1, 3, 'rgba(255,255,255,.35)');
}
HKA.drawDish = function (o) {
  if (!o || !DISH_IDS[o.dish] || (o.s && o.s !== 1)) return false;   /* defter (s > 1, klasik tuval) klasikte kalır */
  L.blit(dishSprT(o.dish), R(o.x), R(o.y));
  dishSteam(R(o.x), R(o.y));
};

/* --- Güveç Ocağı: is tutmuş taş gövde, arkada taş baca, doğu yüzünde tuğla ateş ağzı, üstte toprak güveç;
       önde (güneybatı) ahşap yemek sehpası. Klasik yerleşim: gövde x±0.3, y−0.38..y+0.06; sehpa (x−0.24, y+0.27) --- */
function stoveSpr(dc, lit, fl) {
  return spr('stove|' + dc + '|' + (lit ? 1 : 0) + fl + '|' + G().K, 0, 0, function (b) {
    var by0 = -0.38, by1 = 0.06;
    /* baca (arka sol köşe), gövdenin arkasından yükselir */
    var cx = R(fx(-0.18, -0.3)), cy = R(fy(-0.18, -0.3, 11));
    for (var y = cy - 24; y < cy; y++) for (var x = cx - 4; x < cx + 4; x++) {
      var row = Math.floor((y - cy) / 3), seam = ((y - cy) % 3 + 3) % 3 === 0 || ((x + (row & 1) * 2 + 40) % 4) === 0;
      b.set(x, y, x < cx - 2 ? '#877a6a' : seam ? '#4f473e' : '#6f6457');
    }
    b.rect(cx - 6, cy - 28, 12, 4, '#4a433a'); b.rect(cx - 6, cy - 28, 12, 1, '#6f6457'); b.rect(cx - 4, cy - 27, 8, 2, '#1d1410');
    /* gövde: taş örgü */
    box(b, -0.3, by0, 0.6, by1 - by0, 0, 11, function (u, v) { return (u < 0.6 || v < 0.6) ? '#c9bca6' : (hash(R(u * 2), R(v * 2)) > 0.85 ? '#968874' : '#a89a86'); },
      stoneW('#6f6457'), stoneW('#877a6a'));
    hl(b, -0.3, by1, 0.3, by1, 5, 'rgba(40,30,20,.35)');
    /* üstte demir sac (güveç oturağı) */
    quadW(b, -0.16, -0.3, 0.32, 0.28, 11.2, '#3c4650');
    /* ateş ağzı: doğu (sağ) yüzde tuğla kemer */
    var mx = 0.3, my = -0.16;
    var X0 = R(fx(mx, my)), Y0 = R(fy(mx, my, 0));
    for (var j = 0; j < 16; j++) for (var i = -5; i <= 5; i++) {
      var yy = Y0 - j - Math.round(i * 0.5), arch = j > 10 ? Math.sqrt(Math.max(0, 1 - Math.pow((j - 10) / 6, 2))) * 5.5 : 5.5;
      if (Math.abs(i) > arch) continue;
      var inner = Math.abs(i) < arch - 2 && j > 1 && j < 14;
      var c;
      if (!inner) c = ((j + (Math.abs(i) > 4 ? 1 : 0)) % 3 === 0) ? '#6a2a18' : '#8a3a22';
      else if (lit) { var fr = (j + i * (fl - 1) + 40) % 5; c = j < 4 ? '#ffb347' : j < 7 + fl ? (fr < 2 ? '#ffc94a' : '#e8762b') : j < 10 ? (fr === 0 ? '#e8762b' : '#3a1c10') : '#1d1410'; }
      else c = j < 3 ? '#3a2a1c' : '#1d1410';
      b.set(X0 + i, yy, c);
    }
    /* güveç */
    var tx = R(fx(0, -0.16)), ty = R(fy(0, -0.16, 11));
    for (var py = ty - 9; py <= ty; py++) { var k = (py - ty + 9) / 9, hw = Math.round(12 - k * k * 3); for (var px2 = -hw; px2 <= hw; px2++) b.set(tx + px2, py, px2 < -hw + 2 ? '#b8623a' : px2 > hw - 3 ? '#7d3a1e' : '#9a4a28'); }
    b.rect(tx - 9, ty + 1, 18, 1, '#6e321a');
    b.rect(tx - 15, ty - 6, 3, 3, '#7d3a1e'); b.rect(tx + 12, ty - 6, 3, 3, '#7d3a1e');
    b.ellipse(tx, ty - 9, 12, 2, '#b8623a');
    if (dc) { b.ellipse(tx, ty - 9, 10, 1, dc); b.rect(tx - 5, ty - 11, 10, 1, lite(dc, 0.18)); b.set(tx - 2, ty - 11, lite(dc, 0.4)); }
    else { b.ellipse(tx, ty - 10, 11, 2, '#8a4020'); b.rect(tx - 2, ty - 14, 4, 2, '#6e321a'); b.set(tx - 2, ty - 14, '#9a5030'); }
    /* yemek sehpası (önde) */
    var sx = -0.24, sy = 0.27;
    var x0 = sx - 0.16, y0 = sy - 0.12, x1 = sx + 0.16, y1 = sy + 0.12;
    vl(b, x1 - 0.03, y0 + 0.03, 0, 4.5, '#5a3a20', 2); vl(b, x0 + 0.02, y1 - 0.02, 0, 4.5, P().woodDark, 2); vl(b, x1 - 0.03, y1 - 0.02, 0, 4.5, '#6a4426', 2);
    box(b, x0, y0, 0.32, 0.24, 4.2, 6, lite(P().wood, 0.08), P().woodDark, '#85552f');
    hl(b, x0 + 0.03, y1 - 0.02, x1, y1 - 0.02, 3.6, '#5a3a20');
    b.outline(0.55);
  });
}
var TF_COL = null;
HKA.drawStove = function (o) {
  if (!TF_COL) TF_COL = G().v('TARIF_COL') || {};
  var x = o.x, y = o.y, t = o.t || T(), lit = !!o.lit, fl = lit ? Math.floor(t * 9) % 3 : 0, i;
  var dc = o.r ? (TF_COL[o.r] || '#d8743a') : '';
  gf('shadow')(x, y, 0.55);
  at(stoveSpr(dc, lit, fl), x, y, 0);
  var cx = R(pX(x - 0.18, y - 0.3)), cy = R(pY(x - 0.18, y - 0.3, 11));
  if (lit) {
    for (var k = 0; k < 3; k++) {                                   /* baca dumanı */
      var sq = (t * 0.5 + k * 0.33) % 1, a = ((1 - sq) * 0.45).toFixed(2), sx = cx - 1 + R(Math.sin(sq * 5 + k) * 2), sy = cy - 15 - R(sq * 14);
      L.fr(sx, sy, -1, 0, 4, 2, 'rgba(216,210,196,' + a + ')'); L.fr(sx, sy, 0, -1, 2, 4, 'rgba(216,210,196,' + a + ')');
    }
    var tx = R(pX(x, y - 0.16)), ty = R(pY(x, y - 0.16, 11));
    for (i = 0; i < 3; i++) {                                       /* güveç buharı */
      var q = (t * 0.6 + i * 0.33) % 1, al = ((1 - q) * 0.55).toFixed(2), bx = tx - 3 + i * 3 + R(Math.sin(q * 6 + i) * 1.5), byy = ty - 7 - R(q * 12);
      L.fr(bx, byy, 0, 0, 3, 2, 'rgba(244,239,230,' + al + ')'); L.fr(bx, byy, 1, -1, 1, 1, 'rgba(244,239,230,' + al + ')');
    }
    bar(tx - 8, ty - 26, 16, o.pr || 0, '#ffc94a');                /* pişme çubuğu */
  }
  if (o.n > 0) {
    var sxx = x - 0.24, syy = y + 0.27, px0 = R(pX(sxx, syy)), py0 = R(pY(sxx, syy, 6)), sh = Math.min(o.n, 2), dd = o.dish || 'hamsitava';
    for (i = 0; i < sh; i++) { if (DISH_IDS[dd]) { L.blit(dishSprT(dd), px0, py0 - 2 - i * 3); if (i === sh - 1) dishSteam(px0, py0 - 2 - i * 3); } else gf('drawDish')({ x: px0, y: py0 - 2 - i * 3, dish: dd, s: 1 }); }
  }
};

/* =====================================================================
   v2.19-deneme — İNŞAAT İSKELESİ, DEPO BÖLMELERİ, İLAN BÜROSU, YOL AFİŞİ
   Klasik yerleşim ve ayak izi korunur (aynı köşeler, aynı yükseklikler); yalnız işçilik incelir.
   ===================================================================== */
var SC_W = '#a8793e', SC_WD = '#6a4326', SC_WL = '#d2a468', SC_YEL = '#f2c230', SC_BLK = '#1c1c1c';
function tapeFn(X, Y) { return (((X - Y * 2) >> 2) & 1) ? SC_BLK : SC_YEL; }
function scafStatic(b, w, h, H, up, prog) {
  var x0 = -w / 2, y0 = -h / 2, x1 = x0 + w, y1 = y0 + h, k;
  if (!up) {                                                     /* kuru toprak + yükselen temel */
    quadW(b, x0, y0, w, h, 0.4, function (X, Y) { var q = hash(X >> 1, Y >> 1); return q > 0.9 ? '#937f5a' : q < 0.07 ? '#bfae88' : '#a8966f'; });
    var fh = 3 + prog * H * 0.5, ix = x0 + 0.14, iy = y0 + 0.14, iw = w - 0.28, ih = h - 0.28;
    box(b, ix, iy, iw, ih, 0.4, 3.4, '#c9bca6', stoneW('#8a7f6c'), stoneW('#a0947e'));
    if (fh > 3.6) {
      box(b, ix + 0.04, iy + 0.04, iw - 0.08, ih - 0.08, 3.4, 0.4 + fh, function (u, v) { return (u < 0.7 || v < 0.7) ? '#d9c39a' : (hash(R(u), R(v)) > 0.8 ? '#b9a07a' : '#c9b08a'); },
        brickW('#b8603f'), brickW('#9a4a30'));
      for (k = 0; k < 4; k++) { var rx = ix + 0.2 + k * (iw - 0.4) / 3; vl(b, rx, iy + ih - 0.06, 0.4 + fh, 0.4 + fh + 5, '#5d4a3a', 1); }   /* filiz demirleri */
    }
    box(b, x1 + 0.02, y1 - 0.34, 0.22, 0.5, 0, 1.6, SC_WL, woodV('#a8793e', 3), woodV('#8a5a33', 3));                   /* kalas yığını */
    box(b, x1 + 0.05, y1 - 0.3, 0.2, 0.44, 1.6, 3.2, lite(SC_WL, 0.08), woodV('#b8884a', 3), woodV('#946238', 3));
    box(b, x0 + 0.05, y1 + 0.02, 0.3, 0.2, 0, 3, '#e6e0d0', '#b8b0a0', '#cfc8b8');                                       /* çimento torbası */
    pr(b, x0 + 0.2, y1 + 0.22, 2.2, -2, 0, 4, 1, '#7a8a9a');
  }
  function post(x, y) { var X = R(fx(x, y)), Yt = R(fy(x, y, H + 2)), Yb = R(fy(x, y, 0)); b.rect(X - 1, Yt, 3, Yb - Yt, SC_W); b.rect(X - 1, Yt, 1, Yb - Yt, lite(SC_W, 0.22)); b.rect(X + 1, Yt, 1, Yb - Yt, SC_WD); b.rect(X - 1, Yt - 1, 3, 1, lite(SC_W, 0.3)); }
  function ledger(xa, ya, xb, yb, z) { hl(b, xa, ya, xb, yb, z, SC_WL); hl(b, xa, ya, xb, yb, z - 0.5, SC_WD); }
  function brace(xa, ya, za, xb, yb, zb) { line(b, fx(xa, ya), fy(xa, ya, za), fx(xb, yb), fy(xb, yb, zb), SC_WD); line(b, fx(xa, ya) + 1, fy(xa, ya, za), fx(xb, yb) + 1, fy(xb, yb, zb), '#8a5a33'); }
  function lash(x, y, z) { pr(b, x, y, z + 0.5, -1, 0, 2, 1.5, '#c9b183'); }
  var Z = [H * 0.34, H * 0.66, H];
  if (!up) { post(x0, y0); for (k = 1; k < 3; k++) { ledger(x0, y0, x1, y0, Z[k]); ledger(x0, y0, x0, y1, Z[k]); } }
  post(x1, y0); post(x0, y1);
  brace(x0, y1, 0, x1, y1, Z[1]); brace(x1, y1, 0, x0, y1, Z[1]);
  brace(x1, y0, 0, x1, y1, Z[1]); brace(x1, y1, 0, x1, y0, Z[1]);
  for (k = 0; k < 3; k++) {
    ledger(x0, y1, x1, y1, Z[k]); ledger(x1, y0, x1, y1, Z[k]);
    if (k) {                                                     /* yürüme kalasları: dış yüze taşan tahta */
      box(b, x0, y1, w, 0.15, Z[k] - 1, Z[k], SC_WL, woodV('#b8884a', 5), '#8a5a33', { norim: true });
      box(b, x1, y0, 0.15, h, Z[k] - 1, Z[k], SC_WL, '#a8793e', woodV('#8a5a33', 5), { norim: true });
    }
    lash(x0, y1, Z[k]); lash(x1, y0, Z[k]);
  }
  wall(b, x0, y1 + 0.04, x1, y1 + 0.04, H - 4, H - 1, tapeFn); wall(b, x1 + 0.04, y0, x1 + 0.04, y1, H - 4, H - 1, tapeFn);      /* üst uyarı şeridi */
  wall(b, x0, y1 + 0.06, x1, y1 + 0.06, 2.5, 4, tapeFn); wall(b, x1 + 0.06, y0, x1 + 0.06, y1, 2.5, 4, tapeFn);                  /* alt şerit */
  post(x1, y1); lash(x1, y1, Z[0]); lash(x1, y1, Z[1]); lash(x1, y1, Z[2]);
  b.outline(0.55);
}
/* v2.24: anakara köprüsü — klasik çizim bir kez 1x tuvale çizilir, Scale2x ile inceltilir (L.epx), sonra yalnız blit. Ufuk/kıyı kırpması ve sis oyunda. */
HKA.drawMainBridge = function (o) {
  var f = gf('drawMainBridge'); if (!f) return false;
  var s = L.epx('mainbr|' + G().K + '|' + o.x + '|' + o.y0 + '|' + o.y1 + '|' + o.w, 400, 270, -110, 140, function () { f({ x: o.x, y0: o.y0, y1: o.y1, w: o.w, t: 0 }); }, false);
  L.blit(s, 0, 0);
  return true;
};
HKA.drawScaffold = function (o) {
  var H = o.hh || (18 + Math.min(5, o.lv) * 4), up = !!o.up, prog = up ? 0 : clamp(1 - o.left / Math.max(1, o.lv), 0, 1);
  var ps = up ? 0 : Math.round(prog * 8) / 8, w = Math.round(o.w * 100) / 100, h = Math.round(o.h * 100) / 100;
  gf('shadow')(o.x, o.y, Math.max(o.w, o.h) * 0.6);
  at(spr('scaf|' + w + '|' + h + '|' + R(H) + '|' + (up ? 1 : 0) + '|' + ps + '|' + G().K, 0, 0, function (b) { scafStatic(b, w, h, H, up, ps); }), o.x, o.y, 0);
  /* çekiç: ön köşede sallanır, vuruşta kıvılcım */
  var x1 = o.x + o.w / 2, y1 = o.y + o.h / 2, sw = Math.sin((o.t || T()) * 9);
  var ax = R(pX(x1, y1)) + 2, ay = R(pY(x1, y1, H * 0.66)) - 2, ang = -0.5 + sw * 0.8, s = Math.sin(ang), c = Math.cos(ang), K = G().K;
  for (var i = 0; i <= 12; i++) { L.fr(ax, ay, R(s * i), R(-c * i), 2, 2, i < 3 ? '#3a2414' : '#6a4326'); }
  var hx = R(s * 13), hy = R(-c * 13);
  for (var j = -4; j <= 4; j++) { L.fr(ax, ay, hx + R(c * j) - 1, hy + R(s * j) - 1, 3, 3, j > 2 ? '#d8dde2' : '#7d8790'); }
  L.fr(ax, ay, hx + R(c * -4) - 1, hy + R(s * -4) - 1, 2, 2, '#d8dde2');
  if (sw < -0.8) { L.fr(ax + 6, ay - 2, 0, 0, 2, 2, '#ffe27a'); L.fr(ax + 8, ay + 1, 0, 0, 2, 2, '#ffd54a'); L.fr(ax + 5, ay + 3, 0, 0, 1, 1, '#fff3b0'); L.fr(ax + 9, ay - 1, 1, 0, 1, 1, '#fff3b0'); }
  void K;
};

/* ---------- DEPO BÖLMELERİ (Soğuk Oda / Kiler / Uzantı / Rampa) ---------- */
function sackK(b, x, y, z, c) {
  c = c || '#d8c89c';
  box(b, x - 0.12, y - 0.09, 0.24, 0.18, z, z + 4, function (u, v) { return (u < 0.6 || v < 0.6) ? lite(c, 0.2) : (hash(R(u * 2), R(v * 2)) > 0.8 ? dark(c, 0.08) : c); },
    function (u, zz) { return zz > 3.3 ? lite(c, 0.1) : ((R(u * 2) + R(zz * 2)) % 5 === 0 ? dark(c, 0.15) : dark(c, 0.06)); }, function () { return dark(c, 0.2); });
  pr(b, x, y, z + 5.5, -1, 0, 2, 1.5, dark(c, 0.35));
}
function wingStatic(b, o, m, fillN) {
  var w = o.w, h = o.h, x0 = -w / 2, y0 = -h / 2, x1 = x0 + w, y1 = y0 + h, H = m.H, W = m.wall, k, K = KK;
  quadW(b, x0 - 0.08, y0 - 0.08, w + 0.16, h + 0.3, 0.4, function (X, Y) { return ((X + Y * 2) % 22 === 0) ? '#958e7a' : hash(X >> 1, Y) > 0.94 ? '#b8b09c' : '#a8a08c'; });
  if (o.k === 'soguk') {
    box(b, x0, y0, w, h, 0, H, W[0], panelW(W[1], dark(W[1], 0.14), 6), panelW(W[2], dark(W[2], 0.12), 6));
    wall(b, x0, y1, x1, y1, H - 6, H - 4, '#6fb0dc'); wall(b, x1, y0, x1, y1, H - 6, H - 4, '#5e9ccb');
    winF(b, -0.34, 0.34, y1, 0, 12, '#7e95a6', null);
    winF(b, -0.3, 0.3, y1, 0, 11, function (X, Y) { return (((Y % 5) + 5) % 5 === 0) ? '#c9d6de' : hash(X, Y >> 2) > 0.93 ? '#ffffff' : '#e8f0f4'; }, null);
    pr(b, 0.2, y1, 7, 0, 0, 2, 4, '#4a5a66'); pr(b, 0.2, y1, 7, 0, 0, 1, 4, '#8a9aa6'); pr(b, 0.05, y1, 6.5, -2, 0, 5, 1, '#4a5a66');   /* kol */
    var sx = R(fx(-0.12, y1)), sy = R(fy(-0.12, y1, 9));                                                                         /* kar tanesi */
    for (k = -3; k <= 3; k++) { b.set(sx + k, sy, '#4a90c8'); b.set(sx, sy + k, '#4a90c8'); if (Math.abs(k) < 3) { b.set(sx + k, sy + k, '#7fb8e0'); b.set(sx + k, sy - k, '#7fb8e0'); } }
    wall(b, -0.37, y1, -0.31, y1, 0, 12.5, function (X, Y) { return hash(X, Y) > 0.45 ? '#f4fbff' : null; });                      /* buzlanma */
    wall(b, 0.31, y1, 0.37, y1, 0, 12.5, function (X, Y) { return hash(X + 3, Y) > 0.45 ? '#f4fbff' : null; });
    wall(b, -0.34, y1, 0.34, y1, 11.5, 12.6, function (X, Y) { return hash(X, Y + 7) > 0.35 ? '#f4fbff' : null; });
    box(b, x1 + 0.04, -0.25, 0.3, 0.5, 0, 8, '#9fb0bd', panelW('#6f8394', '#5f7384', 3), '#8497a8');                             /* soğutucu */
    wall(b, x1 + 0.34, -0.2, x1 + 0.34, 0.2, 1, 7, function (X, Y) { return ((X + 40) % 2) ? '#3c4650' : '#5d6a75'; });
  } else if (o.k === 'kiler') {
    box(b, x0, y0, w, h, 0, H, W[0], function (u, z) { return z < 4 ? stoneW('#8f8572')(R(u * K), R(-z * K)) : (hash(R(u), R(z)) > 0.9 ? dark(W[1], 0.06) : W[1]); },
      function (v, z) { return z < 4 ? stoneW('#7a705e')(R(v * K), R(-z * K)) : (hash(R(v) + 9, R(z)) > 0.9 ? dark(W[2], 0.06) : W[2]); });
    for (k = 0; k <= 3; k++) { var tx = x0 + 0.02 + k * (w - 0.04) / 3; vl(b, tx, y1, 4, H, '#5a3a22', 2); }                       /* hımış ahşap iskelet */
    hl(b, x0, y1, x1, y1, 4, '#5a3a22'); hl(b, x0, y1, x1, y1, H * 0.6, '#5a3a22'); hl(b, x0, y1, x1, y1, H * 0.6 - 0.5, '#7a5230');
    vl(b, x1, y0 + 0.02, 4, H, '#4a2f1c', 2); vl(b, x1, y1 - 0.02, 4, H, '#4a2f1c', 2); hl(b, x1, y0, x1, y1, H * 0.6, '#4a2f1c');
    winF(b, -0.28, 0.28, y1, 0, 10, woodV('#6a4326', 3), '#3a2414');
    hl(b, -0.26, y1, 0.26, y1, 3, '#2a2420'); hl(b, -0.26, y1, 0.26, y1, 8, '#2a2420'); pr(b, 0.15, y1, 6, 0, 0, 1.5, 1.5, '#c9952f');
    winF(b, x0 + 0.2, x0 + 0.5, y1, 6.5, 11.5, '#3a3020', '#5a4026');
    vl(b, x0 + 0.3, y1, 6.5, 11.5, '#8a8a8a', 1); vl(b, x0 + 0.4, y1, 6.5, 11.5, '#8a8a8a', 1);
    for (k = 0; k < 6; k++) pr(b, 0.42, y1, 11 - k * 1.3, 0, 0, 1.5, 1.2, k % 2 ? '#c0392b' : '#a8281e');                         /* kurutmalık biber dizisi */
    box(b, x0 + 0.08, y1 + 0.04, 0.42, 0.14, 0, 3, '#a8793e', woodV('#8a5a33', 4), '#6f4526');                                   /* kavanoz sehpası */
    var jc = ['#c0392b', '#e8c547', '#7fb069'];
    for (k = 0; k < 3; k++) { var jx = x0 + 0.16 + k * 0.13; pr(b, jx, y1 + 0.11, 7, -1.5, 0, 3, 4, '#d8eef2'); pr(b, jx, y1 + 0.11, 6, -1, 0, 2, 2.5, jc[k]); pr(b, jx, y1 + 0.11, 7.5, -1.5, 0, 3, 1, '#8a6a3a'); }
    sackK(b, x1 - 0.45, y1 + 0.12, 0, '#d8c89c'); sackK(b, x1 - 0.2, y1 + 0.14, 0, '#cbb98a'); sackK(b, x1 - 0.32, y1 + 0.13, 4, '#e2d4aa');
  } else if (o.k === 'uzanti') {
    box(b, x0, y0, w, h, 0, H, W[0], panelW(W[1], dark(W[1], 0.18), 3), panelW(W[2], dark(W[2], 0.16), 3));
    hl(b, -0.85, y1, 0.85, y1, 12.6, '#5d666e');
    winF(b, -0.8, -0.1, y1, 0, 12, panelW('#3c4650', '#2c343c', 5), '#2c343c'); winF(b, 0.1, 0.8, y1, 0, 12, panelW('#3c4650', '#2c343c', 5), '#2c343c');
    pr(b, -0.14, y1, 6, -1, 0, 1, 3, '#c9d0d6'); pr(b, 0.14, y1, 6, 0, 0, 1, 3, '#c9d0d6');
    box(b, x1 - 0.05, y1 - 0.25, 0.12, 0.12, 0, 5, SC_YEL, tapeFn, tapeFn);                                                     /* direk koruma */
  } else {                                                       /* rampa */
    box(b, x0, y0, w, h, 0, H, W[0], panelW(W[1], dark(W[1], 0.16), 4), panelW(W[2], dark(W[2], 0.14), 4));
    wall(b, x0, y1, x1, y1, 2, 5, tapeFn);
    winF(b, -0.9, -0.2, y1, 0, 9, function (X, Y) { return Y > R(fy(0, y1, 2.5)) ? '#1c2026' : (((Y % 3) + 3) % 3 === 0 ? '#46525c' : '#5d6a75'); }, '#2c343c');
    box(b, 0.15, y1 + 0.05, 0.75, 0.55, 0, 3, '#b9b3a4', '#8e897c', '#a39d8f');
    hl(b, 0.15, y1 + 0.6, 0.9, y1 + 0.6, 3, SC_YEL);
    for (k = 0; k < fillN; k++) crateK(b, 0.35 + (k % 2) * 0.26, y1 + 0.25 + (k >> 1) * 0.02, 3 + (k >> 1) * 4, k % 2 ? '#c9a15e' : '#a8793e');
  }
  roofGableX(b, x0 - 0.1, x1 + 0.1, y0 - 0.1, y1 + 0.1, H, o.k === 'rampa' ? 4 : 6, m.roof[0], m.roof[1], W[2], m.line, 5);
  if (o.k === 'uzanti') roofPlane(b, [[-0.4, y1 - 0.45, H + 3], [0.4, y1 - 0.45, H + 3], [0.4, y1 - 0.1, H + 1], [-0.4, y1 - 0.1, H + 1]], '#9fbfcc', '#6c8a96', 3);
  if (o.k === 'soguk') {                                        /* saçakta buz sarkıtları */
    for (var t = x0 - 0.06; t < x1 + 0.08; t += 0.11) { var X = R(fx(t, y1 + 0.1)), Y = R(fy(t, y1 + 0.1, H)), n = 2 + R(hash(R(t * 50), 3) * 4); b.rect(X, Y + 1, 1, n, '#e8f6ff'); b.set(X, Y + 1, '#ffffff'); b.set(X + 1, Y + 1, '#cfe8f4'); }
    for (var t2 = y0 - 0.06; t2 < y1 + 0.08; t2 += 0.13) { var X2 = R(fx(x1 + 0.1, t2)), Y2 = R(fy(x1 + 0.1, t2, H)), n2 = 1 + R(hash(R(t2 * 50), 7) * 3); b.rect(X2, Y2 + 1, 1, n2, '#dcefff'); }
  }
  if (o.k === 'rampa') {                                        /* kamyonet: beyaz kasa, kırmızı kabin */
    box(b, x0 + 0.1, y1 + 0.3, 0.95, 0.5, 2, 10, '#f1ede4', function (u, z) { return z > 4 && z < 6 ? '#2a6f97' : '#d9d3c6'; }, '#c4bdae');
    box(b, x0 + 1.05, y1 + 0.32, 0.3, 0.46, 2, 8, '#d0604a', '#a83d2b', '#c4553d');
    winR(b, x0 + 1.35, y1 + 0.38, y1 + 0.72, 5, 7.5, '#9fd4e6', null); winF(b, x0 + 1.1, x0 + 1.3, y1 + 0.78, 5, 7.5, '#9fd4e6', null);
    var wh = [[x0 + 0.3, y1 + 0.8], [x0 + 0.85, y1 + 0.8], [x0 + 1.2, y1 + 0.78]];
    for (k = 0; k < 3; k++) { var WX = R(fx(wh[k][0], wh[k][1])), WY = R(fy(wh[k][0], wh[k][1], 1.5)); b.rect(WX - 2, WY - 3, 5, 6, '#1c1c1c'); b.rect(WX - 3, WY - 2, 7, 4, '#1c1c1c'); b.rect(WX - 1, WY - 1, 3, 2, '#8d96a0'); b.set(WX - 1, WY - 1, '#c9d0d6'); }
  } else if (o.k !== 'kiler') {
    for (k = 0; k < fillN; k++) crateK(b, x0 + 0.3 + (k % 3) * 0.24, y1 + 0.28 + (k >> 2) * 0.02, (k % 3 === 2 ? 4 : 0), k % 2 ? '#c9a15e' : '#a8793e');
  }
  /* tabela direği + boyalı levha (köşede, resimli; yazı yok) */
  wsSignK(b, wsFlip(o.k) ? x1 - 0.12 : x0 + 0.12, y1 + 0.15, o.k);
  b.outline(0.55);
}
function fanSpr(fr) {
  return L.sprite('wfan|' + fr + '|' + G().K, function (b) {
    b.circ(0, 0, 5, '#2c343c'); b.circ(0, 0, 4, '#4a5663');
    for (var k = 0; k < 3; k++) { var a = fr * 0.7 + k * 2.094; for (var r = 1; r <= 4; r++) { b.set(R(Math.cos(a) * r), R(Math.sin(a) * r * 0.9), '#c9d0d6'); b.set(R(Math.cos(a + 0.3) * r), R(Math.sin(a + 0.3) * r * 0.9), '#9aa4ac'); } }
    b.set(0, 0, '#e8eef2');
  });
}
HKA.drawDepotWing = function (o) {
  var m = gf('depotWing')(o.k); if (!m || m.x === undefined) return false;
  var fl = o.fill || 0, fillN = o.k === 'rampa' ? Math.min(4, Math.ceil(fl * 4)) : (o.k === 'kiler' ? 0 : Math.min(6, Math.ceil(fl * 6)));
  gf('shadow')(o.x, o.y, o.w * 0.8);
  at(spr('wing|' + o.k + '|' + fillN + '|' + G().K, 0, 0, function (b) { wingStatic(b, o, m, fillN); }), o.x, o.y, 0);
  var x0 = o.x - o.w / 2, y1 = o.y + o.h / 2, x1 = x0 + o.w, t = o.t || T();
  if (o.k === 'soguk') {
    L.blit(fanSpr(Math.floor(t * 10) % 9), R(pX(x1 + 0.34, o.y)), R(pY(x1 + 0.34, o.y, 4)));
    if (Math.sin(t * 1.7) > 0.7) L.fr(R(pX(o.x - 0.2, y1)), R(pY(o.x - 0.2, y1, 12)), 0, 0, 1, 1, '#ffffff');      /* buz pırıltısı */
  }
  var fl = wsFlip(o.k), sxw = fl ? x1 - 0.12 : x0 + 0.12, syw = y1 + 0.15;
  wsName(sxw, syw, gf('T')(m.s), fl);
};

/* v2.22-sanat — İLAN BÜROSU (ince): iki katlı matbaa/ilan bürosu — klasik drawAdBureau ile aynı tasarım, ince ayrıntılı.
   Krem sıva cephe, düz çatı + korkuluk + tuğla baca, büyük vitrin (camın ardında afişler), yeşil kapı, sol köşede dikey "İLAN"
   bıçak tabela, yan duvarda üst üste afiş katmanları (kenarları kalkık), kapının sağında afiş panosu.
   Sv1 ahşap süs / Sv2 yeşil pilastr + çizgili tente + saksı / Sv3 lacivert-altın ampullü tabela + çatıda radyo anteni ve hoparlör. */
var ILAN_GT = [['.###.', '..#..', '..#..', '..#..', '..#..', '.###.'], ['#....', '#....', '#....', '#....', '#....', '#####'],   /* İ L A N (5×6 ince px) */
  ['.###.', '#...#', '#...#', '#####', '#...#', '#...#'], ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#']];
var ADB_POST = ['#e9c46a', '#c4553d', '#2f5a7a', '#f4ead6', '#6aa36f', '#d9443a', '#f2c230', '#9fd4e6', '#e8e0c8'];
function adbStatic(b, o, Lv, papers, radio) {
  var w = o.w, h = o.h, x0 = -w / 2, y0 = -h / 2, x1 = x0 + w, y1 = y0 + h, H = o.hh, dx = o.door.x - o.x, k, Pl = P(), u = 1 / 12;
  var GR = Lv >= 2 ? '#3f7a5a' : '#7a4e2a', GRd = Lv >= 2 ? '#2c5a40' : '#5a3a20', GRl = lite(GR, 0.18);
  var CR = '#ebe2c0', CRd = '#d4c9a4', CRr = '#e2d8b4';
  function plaster(c) { return function (a, z) { var q = hash(R(a * 2), R(z * 2)); return q > 0.94 ? dark(c, 0.07) : q < 0.04 ? lite(c, 0.05) : c; }; }
  box(b, x0 - 0.06, y0 - 0.06, w + 0.12, h + 0.12, 0, 2, Pl.stoneLite, stoneW(Pl.stoneDark), stoneW(Pl.stone));
  box(b, x0, y0, w, h, 2, H, CR, plaster(CRd), plaster(CRr));
  wall(b, x0, y1, x1, y1, 2, 3.5, GRd); wall(b, x1, y0, x1, y1, 2, 3.5, dark(GRd, 0.1));                         /* süpürgelik */
  wall(b, x0, y1, x1, y1, 11, 12.5, GR); wall(b, x1, y0, x1, y1, 11, 12.5, GRd); hl(b, x0, y1, x1, y1, 12.5, GRl); hl(b, x1, y0, x1, y1, 12.5, GR);
  if (Lv >= 2) {                                                 /* köşe pilastrları */
    wall(b, x0, y1, x0 + 0.07, y1, 2, H, GR); wall(b, x1 - 0.07, y1, x1, y1, 2, H, GR); wall(b, x1, y0, x1, y0 + 0.07, 2, H, GRd);
    vl(b, x1 - 0.07, y1, 2, H, GRl, 1);
  }
  /* vitrin: koyu çerçeve, mavimsi cam, ardında afişler, parlama */
  winF(b, x0 + 0.14, dx - 0.22, y1, 4, 10, '#a8cfdc', GRd);
  for (k = 0; k < 3; k++) {
    var va = x0 + 0.19 + k * 0.14, vz = 4.8 + (k & 1);
    wall(b, va, y1, va + 0.11, y1, vz, vz + 4, mix(papers[k], '#a8cfdc', 0.25));
    hl(b, va + 0.02, y1, va + 0.09, y1, vz + 3, dark(papers[k], 0.35)); hl(b, va + 0.02, y1, va + 0.07, y1, vz + 1.8, dark(papers[k], 0.25));
  }
  wall(b, dx - 0.34, y1, dx - 0.3, y1, 5, 9.6, 'rgba(255,255,255,.5)'); wall(b, dx - 0.28, y1, dx - 0.26, y1, 6, 9.6, 'rgba(255,255,255,.35)');
  hl(b, x0 + 0.14, y1, dx - 0.22, y1, 7.2, GRd);
  /* kapı + üst cam + tokmak */
  winF(b, dx - 0.15, dx + 0.15, y1, 2, 10.5, '#3a2614', null);
  winF(b, dx - 0.13, dx + 0.13, y1, 2, 10.3, woodV(Lv >= 2 ? '#2f6a4a' : '#5a3a20', 3), null);
  winF(b, dx - 0.09, dx + 0.09, y1, 7, 9.8, '#ffd98f', '#3a2614');
  pr(b, dx + 0.1, y1, 6, 0, 0, 1, 1, Pl.brass);
  winF(b, dx + 0.24, x1 - 0.14, y1, 5, 9.5, function (X, Y) { return hash(X >> 1, Y >> 2) > 0.8 ? '#ffe8b0' : '#ffd98f'; }, GRd);
  /* üst kat: iki uzun pencere (Sv2+ yeşil kepenk), yan duvarda bir pencere */
  for (k = 0; k < 2; k++) {
    var wa = k ? dx + 0.18 : x0 + 0.3;
    winF(b, wa, wa + 0.26, y1, 13.5, H - 3, '#f4ead6', null);
    winF(b, wa + 0.03, wa + 0.23, y1, 14, H - 3.5, function (X, Y) { return hash(X >> 1, Y >> 1) > 0.85 ? '#b8d8e4' : '#8fb8c8'; }, null);
    vl(b, wa + 0.13, y1, 14, H - 3.5, '#f4ead6'); hl(b, wa - 0.03, y1, wa + 0.29, y1, 13.2, GRd);
    if (Lv >= 2) { wall(b, wa - 0.1, y1, wa - 0.04, y1, 13.5, H - 3, woodH(GR, 2)); wall(b, wa + 0.3, y1, wa + 0.36, y1, 13.5, H - 3, woodH(GR, 2)); }
  }
  winR(b, x1, -0.12, 0.16, 13.5, H - 3, '#f4ead6', null); winR(b, x1, -0.09, 0.13, 14, H - 3.5, '#8fb8c8', null);
  /* yan duvar: üst üste yapıştırılmış afişler (yarısı yırtık / köşesi kalkık) */
  var nP = Lv >= 3 ? 9 : Lv >= 2 ? 6 : 3;
  for (k = 0; k < nP; k++) {
    var pa = y0 + 0.1 + ((k * 0.29) % 0.7), pz = 3.5 + (k % 3) * 2.3 + (k > 5 ? 0.8 : 0), pc = papers[(k + 2) % papers.length];
    winR(b, x1, pa, pa + 0.24, pz, pz + 3.6, function (X, Y) { var q = hash(X, Y + k); return q > 0.93 ? dark(pc, 0.12) : pc; }, null);
    hl(b, x1, pa + 0.04, x1, pa + 0.18, pz + 2.7, dark(pc, 0.4)); hl(b, x1, pa + 0.04, x1, pa + 0.13, pz + 1.7, dark(pc, 0.28));
    pr(b, x1, pa + 0.22, pz + 3.6, 0, 0, 1, 1, lite(pc, 0.3));                                   /* kalkık köşe */
  }
  if (Lv >= 3) { winR(b, x1, -0.38, -0.18, 14, 17.5, '#f2c230', null); hl(b, x1, -0.35, x1, -0.22, 16, '#7a4a12'); winR(b, x1, 0.22, 0.42, 13.5, 16.5, '#c4553d', null); hl(b, x1, 0.25, x1, 0.38, 15, '#f4ead6'); }
  /* düz çatı: korniş + korkuluk (açık taş kapak) + katran çatı + tuğla baca */
  box(b, x0 - 0.08, y0 - 0.08, w + 0.16, h + 0.16, H - 1, H + 2.5, '#efe6c4', GR, GRd);
  hl(b, x0 - 0.08, y1 + 0.08, x1 + 0.08, y1 + 0.08, H - 1, dark(GRd, 0.2)); hl(b, x1 + 0.08, y0 - 0.08, x1 + 0.08, y1 + 0.08, H - 1, dark(GRd, 0.3));
  quadW(b, x0 + 0.05, y0 + 0.05, w - 0.1, h - 0.1, H + 2.5, function (X, Y) { return hash(X >> 1, Y) > 0.9 ? '#8a9186' : '#767d73'; });
  box(b, x0 + 0.12, y0 + 0.14, 0.26, 0.26, H + 2.5, H + 8, '#a8603e', brickW('#7a3f2a'), brickW('#8a4a32'));
  box(b, x0 + 0.1, y0 + 0.12, 0.3, 0.3, H + 8, H + 9, '#6a6a62', '#4a4a44', '#5a5a52');
  if (Lv >= 2) {                                                 /* çizgili tente (vitrin + kapı) + saksılar */
    var aw0 = x0 + 0.2, aw1 = x1 - 0.1, ns = 8, sw2 = (aw1 - aw0) / ns;
    for (var s2 = 0; s2 < ns; s2++) {
      var xa = aw0 + s2 * sw2, xb = xa + sw2, cS = s2 % 2 ? '#f4e9d2' : '#3f8a5a';
      poly(b, [P3(xa, y1, 11), P3(xb, y1, 11), P3(xb, y1 + 0.3, 9.2), P3(xa, y1 + 0.3, 9.2)], cS);
      var X0 = R(fx(xa + sw2 / 2, y1 + 0.3)), Y0 = R(fy(xa + sw2 / 2, y1 + 0.3, 9.2));
      b.rect(X0 - 1, Y0, 3, 1, cS); b.set(X0, Y0 + 1, s2 % 2 ? '#d8cdb6' : '#2c5a40');
    }
    hl(b, aw0, y1, aw1, y1, 11, '#2c5a40');
    box(b, x1, -0.12, 0.1, 0.28, 12.4, 13.4, '#ab7a48', '#6f4526', '#8a5a33');
    for (k = 0; k < 3; k++) pr(b, x1 + 0.05, -0.08 + k * 0.1, 14.2, 0, 0, 2, 2, ['#e5533d', '#ffc94a', '#f4f0e4'][k]);
  }
  /* afiş panosu: iki ayak, ahşap çerçeve, mantar yüz, iki afiş */
  var bx = x1 + 0.1, by = y1 + 0.25;
  vl(b, bx - 0.14, by, 0, 9, '#4a2f1c', 2); vl(b, bx + 0.13, by, 0, 9, '#4a2f1c', 2);
  wall(b, bx - 0.18, by, bx + 0.18, by, 4, 10, '#6f4526');
  wall(b, bx - 0.15, by, bx + 0.15, by, 4.6, 9.4, function (X, Y) { var q = hash(X, Y); return q > 0.85 ? '#a8803e' : q < 0.1 ? '#e0bd78' : '#c9a15e'; });
  wall(b, bx - 0.12, by, bx - 0.01, by, 5.2, 8.8, papers[0]); wall(b, bx + 0.02, by, bx + 0.12, by, 5.6, 8.4, papers[1]);
  hl(b, bx - 0.1, by, bx - 0.03, by, 7.6, dark(papers[0], 0.4)); hl(b, bx + 0.04, by, bx + 0.1, by, 7.2, dark(papers[1], 0.4));
  pr(b, bx - 0.065, by, 9, -0.5, 0, 1, 1, '#c4553d'); pr(b, bx + 0.07, by, 8.6, -0.5, 0, 1, 1, '#2f5a7a');
  /* v2.23: dikey yazılı İLAN tabelası kalktı; yerine standart asma tabela (megafon + afiş, yazısız): sol ön köşede direk, levha sola sarkar */
  wsSignK(b, x0 + 0.12, y1 + 0.15, 'ilan');
  /* Sv3 / radyo: çatıda anten direği + hoparlör hunisi */
  if (Lv >= 3 || radio) {
    var ax = x1 - 0.25, ay = y0 + 0.25, hx = R(fx(ax, ay)), hy = R(fy(ax, ay, H + 2.5));
    b.rect(hx, hy - 46, 2, 46, '#5d666e'); b.rect(hx, hy - 46, 1, 46, '#8b949c');
    b.rect(hx - 7, hy - 44, 16, 1, '#8b949c'); b.rect(hx - 5, hy - 37, 12, 1, '#8b949c'); b.rect(hx - 3, hy - 31, 8, 1, '#8b949c');
    b.rect(hx, hy - 49, 2, 3, '#c4553d');
    for (k = 0; k < 7; k++) b.rect(hx + 3 + k, hy - 25 - (k >> 1), 1, 4 + k, k < 2 ? '#8b949c' : (k === 6 ? '#5d666e' : '#d4dadf'));   /* huni sağa (bacadan uzağa) */
  }
  b.outline(0.55);
}
HKA.drawAdBureau = function (o) {
  var Lv = o.lv || 1, adDef = gf('adDef'), papers = [];
  (o.ads || []).forEach(function (id) { var d = adDef ? adDef(id) : null; if (d) papers.push(d.bg); });
  papers = papers.concat(ADB_POST);
  gf('shadow')(o.x, o.y, 0.95);
  at(spr('adb2|' + Lv + '|' + o.hh + '|' + papers.slice(0, 3).join('') + '|' + (o.radio ? 1 : 0) + '|' + G().K, 0, 0, function (b) { adbStatic(b, o, Lv, papers, o.radio); }), o.x, o.y, 0);
  var x0 = o.x - o.w / 2, y0 = o.y - o.h / 2, y1 = y0 + o.h, x1 = x0 + o.w, t = o.t || T(), k;
  if (Lv >= 3 && (Math.floor(t * 2) & 1)) {                     /* tabela ampulleri yanıp söner */
    var bsx = R(pX(x0, y1)), bsy = R(pY(x0, y1, o.hh + 4));
    for (k = 0; k < 9; k += 2) { L.fr(bsx, bsy, -14, 2 + k * 4, 1, 1, '#ffffff'); L.fr(bsx, bsy, -2, 6 + k * 4, 1, 1, '#ffffff'); }
  }
  if (o.radio) {                                                 /* hoparlörden ses halkaları */
    var ax = R(pX(x1 - 0.25, y0 + 0.25)) + 6, ay = R(pY(x1 - 0.25, y0 + 0.25, o.hh + 2.5)) - 11, ph = (t * 1.6) % 1;
    for (k = 0; k < 2; k++) {
      var q = (ph + k * 0.5) % 1, r = 3 + R(q * 7), al = (1 - q) * 0.8, col = 'rgba(255,215,106,' + al.toFixed(2) + ')';
      for (var j = -r; j <= r; j += 2) L.fr(ax, ay, R(Math.sqrt(r * r - j * j) * 0.9) + 4, j, 1, 1, col);
    }
  }
};

/* ---------- YOL PANOSU AFİŞİ: pano yüzü x = sabit, y−0.55…y+0.55, z 14…30 (HKA.drawBillboard üstüne) ----------
   Yüz ızgarası 26×32 ince px: sütun c soldan sağa (y azalır), satır r yukarıdan aşağı (z 30 → 14). */
function facePx(b, c, r, col) { b.set(c - 13, r - 53 - Math.floor(c / 2), col); }
function posterArt(b, id, bg, ink) {
  var c, r, k;
  function P2(c0, r0, w, h, col) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) facePx(b, c0 + i, r0 + j, col); }
  function D(cx, cy, rr, col) { for (var j = -rr; j <= rr; j++) for (var i = -rr; i <= rr; i++) if (i * i + j * j <= rr * rr + rr * 0.5) facePx(b, cx + i, cy + j, col); }
  for (c = 1; c < 26; c++) for (r = 1; r < 32; r++) facePx(b, c, r, (r < 4 || r > 28) ? ink : (hash(c, r) > 0.95 ? lite(bg, 0.12) : bg));
  for (c = 2; c < 25; c += 3) facePx(b, c, 2, lite(ink, 0.35));
  if (id === 'tellal') {                                         /* fesli tellal + zil */
    P2(9, 7, 6, 3, '#b8282a'); P2(10, 6, 4, 1, '#d84a3a'); facePx(b, 14, 6, '#1c1c1c');
    D(12, 12, 3, '#e0a878'); P2(10, 13, 5, 1, '#3a2410'); facePx(b, 11, 11, '#1c1c1c'); facePx(b, 13, 11, '#1c1c1c');
    P2(8, 16, 9, 8, '#7a2f2a'); P2(10, 16, 5, 8, '#2f5a7a'); P2(8, 24, 9, 2, '#3a3a52');
    P2(17, 15, 2, 4, '#e0a878'); P2(17, 10, 5, 4, '#c9952f'); P2(18, 9, 3, 1, '#e6be59'); facePx(b, 19, 14, '#4a3a18');
    facePx(b, 23, 9, ink); facePx(b, 24, 8, ink); facePx(b, 23, 12, ink); facePx(b, 24, 12, ink);
  } else if (id === 'kahve') {                                   /* fincan + cezve buharı */
    P2(7, 15, 11, 8, '#f4ead6'); P2(8, 22, 9, 2, '#e0d4ba'); P2(18, 16, 3, 4, '#f4ead6'); P2(19, 17, 1, 2, bg);
    P2(8, 15, 9, 2, '#3a1c10'); P2(9, 18, 7, 1, '#c94a3a'); P2(9, 19, 7, 1, '#2a6f97');
    P2(5, 24, 15, 2, '#f4ead6'); P2(5, 25, 15, 1, '#c9bca0');
    for (k = 0; k < 4; k++) { facePx(b, 10 + (k & 1), 12 - k * 2, '#f4ead6'); facePx(b, 14 - (k & 1), 11 - k * 2, '#f4ead6'); }
  } else if (id === 'gazete') {                                  /* manşetli gazete */
    P2(5, 6, 16, 21, '#fffdf4'); P2(5, 6, 16, 1, '#c9c2ae'); P2(6, 8, 14, 3, ink);
    P2(6, 12, 6, 6, '#8f8a7a'); P2(7, 13, 4, 3, '#b8b2a0');
    for (k = 0; k < 4; k++) P2(13, 12 + k * 2, 6 - (k & 1) * 2, 1, '#8f8a7a');
    for (k = 0; k < 3; k++) P2(6, 20 + k * 2, 14 - k * 3, 1, '#a8a294');
  } else if (id === 'vapur') {                                   /* beyaz yolcu vapuru yandan */
    P2(2, 17, 22, 5, '#f4f0e6'); P2(2, 20, 22, 2, '#2a6f97'); P2(1, 18, 1, 2, '#f4f0e6');
    P2(6, 12, 14, 5, '#fbfaf6'); P2(7, 13, 2, 2, '#6fa8c8'); P2(11, 13, 2, 2, '#6fa8c8'); P2(15, 13, 2, 2, '#6fa8c8');
    P2(9, 8, 8, 4, '#f4f0e6'); P2(8, 7, 10, 1, '#8a949c'); P2(13, 3, 3, 5, '#c4553d'); P2(13, 3, 3, 1, '#2c2c2c');
    P2(1, 22, 24, 1, '#dff3f8');
  } else if (id === 'radyo') {                                   /* lambalı radyo */
    P2(5, 9, 16, 15, '#8a5a33'); P2(5, 9, 16, 2, '#a8734a'); P2(6, 12, 7, 10, '#d9c48a');
    for (k = 0; k < 4; k++) P2(6, 13 + k * 2, 7, 1, '#b8a26a');
    D(17, 15, 2, '#e8c35a'); facePx(b, 17, 15, '#5a3a20'); D(17, 20, 1, '#e8c35a'); P2(14, 12, 5, 1, '#3a2a1a');
    P2(7, 24, 2, 2, '#5a3a20'); P2(17, 24, 2, 2, '#5a3a20');
    facePx(b, 22, 8, '#e8c35a'); facePx(b, 23, 7, '#e8c35a'); facePx(b, 22, 6, '#e8c35a');
  } else if (id === 'panayir') {                                 /* çadır + bayrak dizisi */
    for (r = 0; r < 9; r++) for (c = 12 - r; c <= 13 + r; c++) facePx(b, c, 9 + r, ((c >> 1) & 1) ? '#f4e9d2' : '#c4553d');
    P2(5, 18, 16, 8, '#f4e9d2'); P2(11, 20, 4, 6, '#3a2a1a'); for (c = 5; c < 21; c += 2) facePx(b, c, 18, '#c4553d');
    facePx(b, 12, 7, '#4a2f1c'); facePx(b, 12, 8, '#4a2f1c'); P2(13, 6, 3, 2, '#f2c230');
    for (k = 0; k < 6; k++) { var fc = ['#f2c230', '#2f7a4a', '#2a4c7d', '#d9443a'][k % 4]; facePx(b, 3 + k * 4, 5 + (k & 1), fc); facePx(b, 4 + k * 4, 5 + (k & 1), fc); facePx(b, 3 + k * 4, 6 + (k & 1), fc); }
  } else {                                                       /* boş pano: iğneli boş kâğıt */
    P2(6, 7, 14, 18, '#f7f2e2'); for (k = 0; k < 5; k++) P2(8, 10 + k * 3, 10 - (k % 2) * 3, 1, '#cbc2a6'); D(13, 7, 1, '#c4553d');
  }
}
HKA.drawAdPoster = function (o) {
  var d = o.ad ? gf('adDef')(o.ad) : null, id = d ? d.id : '', bg = d ? d.bg : '#ece4cc', ink = d ? d.ink : '#8a8472';
  at(L.sprite('poster|' + id + '|' + G().K, function (b) { posterArt(b, id, bg, ink); }), o.x, o.y, 0);
};

/* lokanta (art/lokanta.js) ve sonraki sanatçı dosyaları için ortak kit: dünya koordinatlı ince çizim araçları.
   Not: fx/fy/box/wall… çapa durumunu (OX, OY, KK) yalnız kit.spr içinde doğru okur. */
HKA.kit = {
  spr: spr, at: at, fx: fx, fy: fy, P3: P3, poly: poly, line: line, grain: grain, box: box, wall: wall, vl: vl, hl: hl, quadW: quadW, rc: rc, pr: pr,
  roofPlane: roofPlane, roofGableX: roofGableX, roofHip: roofHip, winF: winF, winR: winR, woodV: woodV, woodH: woodH, stoneW: stoneW, brickW: brickW, panelW: panelW,
  crateK: crateK, canopy: canopy, bar: bar, flagAt: flagAt, tapeFn: tapeFn,
  plateSpr: plateSpr, dirtySpr: dirtySpr, itemSpr: itemSpr, dishSprT: function (d) { return DISH_IDS[d] ? dishSprT(d) : null; }, dishSteam: dishSteam,
  gf: gf, gv: gv, P: P, shadowSpr: shadowSpr
};

/* v2.26: YOLCU VAPURU (köprüye yanaşmış; o: {sx, sy pruva su hattı (ekran), gw, g0, g1, t, ph, a, mv}).
   Gövde + salon + köşk + baca tek ince sprite (çapa = pruva su hattı); duman, bayrak, köpük, pruva korkuluğu ve iskele tahtası her kare. */
function ferrySprite() {
  return L.sprite('ferry26', function (b) {
    var x, y, i, wh = '#f2f0ea', whD = '#dcd8cc', whL = '#ffffff';
    for (y = -30; y < 0; y++) {                                         /* gövde: eğik pruva, yuvarlak kıç */
      var x0 = R((y + 30) * 0.2), x1 = 121 - (y > -10 ? R((y + 10) * 0.5) : 0);
      for (x = x0; x <= x1; x++) {
        var c = y <= -29 ? whL : y < -18 ? (x > 112 ? whD : wh) : y < -16 ? '#c4553d' : y < -9 ? (L.bayer[y & 3][x & 3] < (y + 16) / 9 * 0.45 ? whD : wh) : y < -4 ? '#2a6f97' : '#1d3f57';
        b.set(x, y, c);
      }
    }
    for (i = 0; i < 8; i++) { var px0 = 22 + i * 12; b.rect(px0 - 2, -26, 4, 4, '#9aa4ab'); b.rect(px0 - 1, -25, 2, 2, '#2e4a5c'); b.set(px0 - 1, -25, '#bfe0f0'); }   /* lombozlar */
    L.text(b, 'HAMSİ KOYU', 14, -15, '#2a6f97');
    b.rect(7, -24, 2, 3, '#3a3a3a');                                     /* çapa kenedi */
    b.rect(16, -46, 96, 16, '#fbfaf6'); b.rect(16, -31, 96, 1, '#c9c4b6'); b.rect(110, -46, 2, 16, '#d8d4c8');          /* alt salon */
    for (i = 0; i < 11; i++) { var wx = 21 + i * 8; b.rect(wx, -42, 4, 6, '#6fa8c8'); b.rect(wx, -42, 4, 1, '#a9d3e8'); b.rect(wx + 3, -41, 1, 5, '#4f86a6'); }
    [26, 98].forEach(function (cx) { b.circ(cx, -38, 3, '#e07a2e'); b.circ(cx, -38, 1, '#fbfaf6'); b.set(cx - 3, -38, '#f4f0e6'); b.set(cx + 3, -38, '#f4f0e6'); });   /* can simitleri */
    b.rect(8, -48, 108, 2, '#8a949c'); b.rect(8, -48, 108, 1, '#a9b2b8');                                              /* gezinti güvertesi */
    b.rect(20, -55, 96, 1, '#ece9e0'); for (x = 20; x < 116; x += 8) b.rect(x, -54, 1, 6, '#c9c7bd');                  /* korkuluk */
    b.rect(32, -64, 52, 16, '#f4f0e6'); b.rect(30, -66, 56, 2, '#8a949c'); b.rect(82, -64, 2, 16, '#d8d4c8');          /* kaptan köşkü */
    for (i = 0; i < 6; i++) { b.rect(36 + i * 8, -61, 5, 4, '#6fa8c8'); b.rect(36 + i * 8, -61, 5, 1, '#a9d3e8'); }
    b.rect(66, -82, 12, 16, '#c4553d'); b.rect(76, -82, 2, 16, '#9a3a2a'); b.rect(66, -82, 12, 2, '#2c2c2c'); b.rect(66, -76, 12, 2, '#f4f0e6');   /* baca */
    b.rect(14, -76, 2, 28, '#5d3c1c'); b.rect(15, -76, 1, 28, '#7a5232');                                               /* direk */
    b.outline(0.5);
  });
}
var FERRY_HK = null;
HKA.drawDockFerry = function (o) {
  var H = G(); if (H.K !== 2) return false;
  if (!FERRY_HK) FERRY_HK = { gang: gf('drawGangway'), flag: gf('hkFlag') };
  if (!FERRY_HK.gang) return false;
  var g = H.ctx, a0 = g.globalAlpha, a = o.a === undefined ? 1 : o.a, t = o.t || 0;
  var rock = o.mv ? R(Math.sin(t * 0.9) * 0.9) : 0, sx = R(o.sx), sy = R(o.sy) + rock, i;
  g.globalAlpha = a0 * a;
  for (i = 0; i < 6; i++) {                                             /* su: gövde dibinde köpük, pruvada çırpıntı, giderken iz */
    var ph = (t * 0.8 + i * 0.17) % 1;
    L.fr(sx, sy, -6 + i * 22 + R(ph * 8), 1 + (i & 1), 10 - (i & 1) * 4, 1, 'rgba(238,250,252,' + (0.55 - ph * 0.4).toFixed(2) + ')');
  }
  L.fr(sx, sy, -7 + R(Math.sin(t * 2.2) * 1.5), -2, 6, 2, 'rgba(238,250,252,.6)');
  if (o.mv) for (i = 0; i < 4; i++) L.fr(sx, sy, 124 + i * 9, (i & 1) * 2, 12 - i * 2, 1, 'rgba(238,250,252,.45)');
  L.blit(ferrySprite(), sx, sy);
  if (!(o.gw > 0)) { L.fr(sx, sy, 8, -55, 12, 1, '#ece9e0'); L.fr(sx, sy, 8, -54, 1, 6, '#c9c7bd'); L.fr(sx, sy, 16, -54, 1, 6, '#c9c7bd'); }   /* pruva kapısı kapalı */
  for (i = 0; i < 3; i++) {                                             /* baca dumanı: rüzgârla sağa */
    var sp = (t * 0.45 + i / 3) % 1, r = 2 + R(sp * 4);
    L.fr(sx, sy, 74 + R(sp * 26) - r, -86 - R(sp * 16) - r, r * 2, r * 2 - 1, 'rgba(230,228,222,' + (0.55 * (1 - sp)).toFixed(2) + ')');
  }
  g.globalAlpha = a0 * a;
  if (FERRY_HK.flag) FERRY_HK.flag(sx + 8, sy - 38, 5, 3);
  FERRY_HK.gang(o);
  g.globalAlpha = a0;
  return true;
};

/* ince modun açılıp kapanmasında yerel önbellekler */
HKA.onReset(function () { GV = {}; GLOW = null; TF_COL = null; LK_TC = null; FERRY_HK = null; });
})();
