/* =====================================================================
   HAMSİ KOYU — ince piksel: SAHİL LOKANTASI (sanatçı dosyası, v2.19-deneme; v2.22 V3 yerleşim + kademeler)
   v2.22: ev + teras V3 dünya koordinatında (HKA.lokV3), istasyon o.lv 1–3, masa o.tier 1–4, dolap/meze/tabela/kapı/şemsiye o.tier.
   Kancalar: HKA.drawLokanta (zemin + patika), HKA.drawLokTable, HKA.drawLokStation, HKA.drawLokCrew, HKA.drawLokFix.
   Kit: art/nesne.js'in HKA.kit'i (dünya koordinatlı ince çizim). Klasik çizimin konum / ayak izi aynen korunur.
   OKUNURLUK İLKESİ (telefon): az ama net parça — masa = kareli örtü + hasır sandalye, tabak = yemeğin kendi simgesi,
   menü tahtası küçük ayaklı kara tahta, şemsiye direğin tepesinde (masayı örtmez), tabakları pass'te düzenli yığın.
   ===================================================================== */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib, K = HKA.kit;
if (!L || !K) return;
var G = function () { return window.HKG; };
var mix = L.mix, dark = L.dark, lite = L.lite, hash = L.hash;
var spr = K.spr, at = K.at, box = K.box, wall = K.wall, vl = K.vl, hl = K.hl, quadW = K.quadW, poly = K.poly, line = K.line, pr = K.pr, P3 = K.P3;
var fx = K.fx, fy = K.fy, gf = K.gf, gv = K.gv, P = K.P;
function R(v) { return Math.round(v); }
function pX(x, y) { return (x - y) * 12; }
function pY(x, y, z) { return (x + y) * 6 - (z || 0); }
function d2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function T() { return G().t; }
var NTF = null;
function lokNightNow() { if (NTF === null) NTF = gf('lokNight') || false; return NTF ? !!NTF() : false; }
function KK() { return G().K; }
var TC = null;
function dcol(d) { if (!TC) TC = gv('TARIF_COL') || {}; return TC[d] || '#d39a45'; }
function lbl(x, y, z, key, c, short) { var f = gf('labelAt'), t = gf('T'); if (f && t) f(x, y, z, typeof key === 'string' ? t(key) : key, c, short); }

/* ---------------- palet ---------------- */
var TEAK = ['#c48c52', '#bb8449', '#c99358', '#b67f45', '#cf9a5e'];
var SEAM = '#7d4e2b', TURQ = '#2a95c4', TURQD = '#1d7aa8';
var CLOTH = '#f6efd9', CHK = '#c0503a', CHKL = '#e2958a';
var CHAIR = '#8a5a32', CHAIRL = '#b07a48', CHAIRD = '#5d3c1c', STRAW = '#d8b86a', STRAWD = '#b8964a';
var BRASS = '#c9952f', BRASSL = '#f0cf6a', STEEL = '#b8c0c6', STEELD = '#7d878e';

/* =====================================================================
   1) ZEMİN: tik ahşap teras, çini mutfak şeridi, turkuaz boyalı kenar, kenar kalınlığı + kazıklar, kum patika
   ===================================================================== */
var DECK = 5;
function deckTop(o) {
  var x0 = o.x0, y0 = o.y0, kt = o.kitchen;
  var kx0 = (kt.x0 - x0) * 12, kx1 = (kt.x1 - x0) * 12, ky0 = (kt.y0 - y0) * 12, ky1 = (kt.y1 - y0) * 12;
  var W = (o.x1 - x0) * 12, D = (o.y1 - y0) * 12;
  return function (u, v) {
    if (u >= kx0 && u < kx1 && v >= ky0 && v < ky1) {                     /* çini: krem karo, mavi motif, mavi bordür */
      var ku = u - kx0, kv = v - ky0, eu = Math.min(ku, kx1 - u), ev = Math.min(kv, ky1 - v);
      if (eu < 1.6 || ev < 1.6) return (eu < 0.6 || ev < 0.6) ? '#8a7f68' : '#2f6f9f';
      var tu = ((ku - 1.6) % 6 + 6) % 6, tv = ((kv - 1.6) % 6 + 6) % 6;
      if (tu < 0.55 || tv < 0.55) return '#b8ab90';
      var cu = Math.abs(tu - 3.25), cv = Math.abs(tv - 3.25), dd = cu + cv;
      var odd = (Math.floor((ku - 1.6) / 6) + Math.floor((kv - 1.6) / 6)) & 1;
      if (dd < 0.9) return odd ? '#c8643c' : '#2f6f9f';
      if (dd < 1.6 && odd === 0) return '#7fb0d0';
      if ((tu < 1.2 && tv < 1.2) || (tu > 5.2 && tv > 5.2)) return '#9fc4dc';
      return hash(R(u * 2), R(v * 2)) > 0.94 ? '#e2d8bf' : (tu < 1.1 || tv < 1.1 ? '#f4ecd8' : '#ece3cc');
    }
    var e = Math.min(v, D - v, u, W - u);
    if (u < 0.6 || v < 0.6) return '#e8c08a';
    if ((D - v > 2.4 && D - v < 4.6) || (u > 2.4 && u < 4.6 && D - v > 2.4)) {   /* turkuaz boyalı kenar tahtası (güney + batı) */
      var cc = (Math.floor((u + v) * 0.35) % 9 === 0) ? TURQD : TURQ; return hash(R(u * 2), R(v * 2)) > 0.92 ? '#5ab0d4' : cc;
    }
    var rowW = 3, row = Math.floor(v / rowW), f = v / rowW - row;
    if (f < 0.18) return SEAM;
    var segL = 22, off = (row * 13) % segL, su = (u + off) % segL, seg = Math.floor((u + off) / segL);
    if (su < 0.5) return SEAM;
    var c = TEAK[Math.floor(hash(row * 3 + seg, 11) * TEAK.length)];
    var gr = hash(Math.floor(u * 0.4) + row * 7, Math.floor(f * 3) + row * 3);
    if (gr > 0.88) c = dark(c, 0.08); else if (gr < 0.06) c = lite(c, 0.07);
    if (su > 0.9 && su < 1.5 && f > 0.45 && f < 0.75) c = '#5e381e';
    else if (f < 0.42) c = lite(c, 0.09); else if (f > 0.86) c = dark(c, 0.07);
    void e;
    return c;
  };
}
function deckSpr(o) {
  var w = o.x1 - o.x0, h = o.y1 - o.y0;
  return spr('lkdeck|' + o.x0 + '|' + o.y0 + '|' + w + 'x' + h + '|' + G().K, o.x0, o.y0, function (b) {
    var i;
    for (i = 0.35; i < w - 0.2; i += 1.1) box(b, o.x0 + i, o.y1 - 0.2, 0.18, 0.18, -DECK - 5, -DECK + 0.5, '#5a3a20', '#4e3a2a', '#3a2c20', { norim: true });
    for (i = 0.4; i < h - 0.2; i += 1.1) box(b, o.x1 - 0.2, o.y0 + i, 0.18, 0.18, -DECK - 5, -DECK + 0.5, '#5a3a20', '#4e3a2a', '#3a2c20', { norim: true });
    box(b, o.x0, o.y0, w, h, -DECK, 0, deckTop(o),
      function (u, z) { var c = '#9a6236'; if (Math.floor(u * 0.5) % 6 === 0 && (u % 2) < 0.4) c = '#6e4222'; if (z > DECK - 0.6) c = TURQ; else if (z > DECK - 1.4) c = '#b27744'; else if (z < 1) c = '#6a4a30'; return c; },
      function (v, z) { var c = '#7a4a28'; if (Math.floor(v * 0.5) % 6 === 0 && (v % 2) < 0.4) c = '#4f2f19'; if (z > DECK - 0.6) c = TURQD; else if (z > DECK - 1.4) c = '#8f5a32'; else if (z < 1) c = '#4e3a28'; return c; });
    b.outline(0.5);
  });
}
function pathSpr(o) {
  var P0 = o.path;
  return spr('lkpath|' + P0.map(function (p) { return [p.x0, p.y0, p.x1, p.y1].join(','); }).join(';') + '|' + G().K, 10, 21.5, function (b) {
    for (var k = 0; k < 2; k++) {                                    /* yoldan gelen kum patika: kenarı dağınık, çakıllı */
      var p = P0[k];
      quadW(b, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0, 0, function (X, Y) {
        var q = hash(X, Y), h2 = hash(X >> 2, Y >> 1);
        if (q > 0.965) return '#8a7a5a'; if (q < 0.03) return '#e0cfa0';
        return h2 > 0.82 ? '#b39a6a' : h2 < 0.12 ? '#c4ad7c' : '#bba273';
      });
    }
    var q0 = P0[0];
    for (var s = 0; s < 6; s++) {                                    /* ayak izleri */
      var dx = q0.x0 + 0.35 + s * 0.45, dy = q0.y0 + 0.28 + (s & 1) * 0.16, X = R(fx(dx, dy)), Y = R(fy(dx, dy, 0));
      b.rect(X - 2, Y, 3, 1, '#977f54'); b.rect(X - 1, Y + 1, 2, 1, '#977f54');
    }
  });
}
function thresholdSpr(p) {
  return spr('lkthr|' + [p.x0, p.y0, p.x1, p.y1].join(',') + '|' + G().K, p.x0, p.y0, function (b) {
    quadW(b, p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0, 0.15, function (X, Y) {   /* girişte kesme taş eşik */
      var cu = Math.floor((X + 400) / 10), cv = Math.floor((Y + 400) / 6), ru = (X + 400) % 10, rv = (Y + 400) % 6;
      if (ru < 1 || rv < 1) return '#8f8775';
      var c = ['#d8d0bc', '#cec6b1', '#d2cab6'][Math.floor(hash(cu, cv) * 3)];
      return rv < 2 ? lite(c, 0.1) : c;
    });
  });
}
HKA.drawLokanta = function (o) {
  if (o && o.v2) return true;                                      /* v2 (karada): zemini HKA.drawLokTerrace 'floor' çizer; iskele/patika yok */
  if (!o || !o.kitchen || !o.path) return false;
  at(deckSpr(o), o.x0, o.y0, 0);
  if (o.path.length >= 2) at(pathSpr(o), 10, 21.5, 0);
  if (o.path[2]) at(thresholdSpr(o.path[2]), o.path[2].x0, o.path[2].y0, 0);
};

/* =====================================================================
   2) MASA: kareli örtü, hasır sandalyeler; tabaklar, meze tahtası, hesap, sipariş balonu
   ===================================================================== */
var SEAT4 = [[-0.82, -0.28], [0.82, -0.28], [-0.82, 0.28], [0.82, 0.28]], SEAT2 = [[-0.82, 0], [0.82, 0]];
var PL4 = [[-0.34, -0.18], [0.34, -0.18], [-0.34, 0.2], [0.34, 0.2]], PL2 = [[-0.34, 0.02], [0.34, 0.02], [0, -0.22], [0, 0.24]];
function clothTop(u, v) {
  var a = Math.floor(u / 3.2) & 1, c = Math.floor(v / 3.2) & 1;
  if (u < 0.6 || v < 0.6) return '#fffaf0';
  if (a && c) return CHK;
  if (a || c) return hash(R(u * 2), R(v * 2)) > 0.92 ? '#eaa094' : CHKL;
  return CLOTH;
}
/* masa kademesi (o.tier 1–4): 1 tahta masa + tabure · 2 kareli örtü + hasır sandalye · 3 şemsiyeli ahşap masa + boyalı sandalye
   (şemsiye drawLokFix k:'teras' part:'umb') · 4 keten örtü, mumluk, oymalı sandalye. Ayak izi / oturma yerleri her kademede aynı. */
function chairBack(b, bx, sy, h, c, cl, cd, rails) {
  vl(b, bx, sy - 0.14, 0, h, cd, 1); vl(b, bx, sy + 0.14, 0, h, c, 2);
  for (var i = 0; i < rails.length; i++) { hl(b, bx, sy - 0.14, bx, sy + 0.14, rails[i], cl); hl(b, bx, sy - 0.14, bx, sy + 0.14, rails[i] - 0.5, cd); }
}
function chair(b, sx, sy, s, tier) {
  var bx = sx + s * 0.15;
  if (tier === 1) {                                                  /* tabure: yuvarlak oturak, üç ayak, arkalıksız */
    vl(b, sx - 0.1, sy + 0.08, 0, 4.5, CHAIRD, 1); vl(b, sx + 0.1, sy + 0.08, 0, 4.5, CHAIR, 1); vl(b, sx, sy - 0.12, 0, 4.5, CHAIRD, 1);
    var X = R(fx(sx, sy)), Y = R(fy(sx, sy, 5));
    b.ellipse(X, Y + 1, 5, 2, '#6a4326'); b.ellipse(X, Y, 5, 2, '#a8743f'); b.rect(X - 3, Y - 1, 3, 1, '#c99358');
    return;
  }
  var C = tier === 3 ? ['#2a95c4', '#5ab0d4', '#1d6a94'] : tier === 4 ? ['#5a3420', '#7d4a2a', '#3a2010'] : [CHAIR, CHAIRL, CHAIRD];
  var hb = tier === 4 ? 16 : 13, rails = tier === 2 ? [9, 12.5] : tier === 3 ? [8, 10.5, 13] : [9.5, 15.5];
  if (s < 0) chairBack(b, bx, sy, hb, C[0], C[1], C[2], rails);
  vl(b, sx - s * 0.13, sy + 0.13, 0, 5, C[2], 1); vl(b, sx + s * 0.13, sy + 0.13, 0, 5, C[0], 1); vl(b, sx - s * 0.13, sy - 0.13, 0, 5, C[2], 1);
  if (tier === 2) box(b, sx - 0.15, sy - 0.15, 0.3, 0.3, 4.5, 6, function (u, v) { return (u < 0.6 || v < 0.6) ? lite(STRAW, 0.2) : (((R(u) + R(v)) % 3) ? STRAW : STRAWD); }, CHAIR, CHAIRD, { norim: true });
  else if (tier === 3) box(b, sx - 0.15, sy - 0.15, 0.3, 0.3, 4.5, 6, function (u) { return (Math.floor(u / 1.2) & 1) ? '#3aa5d4' : '#2a95c4'; }, C[0], C[2], { norim: true });
  else box(b, sx - 0.16, sy - 0.16, 0.32, 0.32, 4.5, 7, function (u, v) { return (u < 0.7 || v < 0.7) ? '#d8505a' : '#b8323e'; }, '#8a2a33', '#6f1f28', { norim: true });   /* kırmızı minder */
  if (s > 0) chairBack(b, bx, sy, hb, C[0], C[1], C[2], rails);
  if (tier === 4) {                                                  /* oymalı kemerli tepe */
    var X2 = R(fx(bx, sy)), Y2 = R(fy(bx, sy, hb));
    b.rect(X2 - 3, Y2 - 2, 7, 2, C[0]); b.rect(X2 - 2, Y2 - 3, 5, 1, C[1]); b.set(X2, Y2 - 4, '#c9952f'); b.set(X2 - 1, Y2 - 1, '#c9952f'); b.set(X2 + 1, Y2 - 1, '#c9952f');
  }
}
function linenTop(u, v) { if (u < 0.6 || v < 0.6) return '#ffffff'; var e = Math.min(u, v); return (e < 1.4 && ((R(u + v) & 1) === 0)) ? '#e8e2d2' : (hash(R(u * 2), R(v * 2)) > 0.94 ? '#f2eee4' : '#fbf8f0'); }
function tableTop(b, tier) {
  if (tier === 1) {                                                  /* çıplak tahta: enine tahtalar */
    box(b, -0.55, -0.45, 1.1, 0.9, 6.5, 8, function (u, v) { var p = Math.floor(v / 2.7); if ((v % 2.7) < 0.45) return '#6a4326'; var c = ['#b8834a', '#a9743f', '#c08c52'][p % 3]; return (u < 0.6) ? lite(c, 0.12) : (hash(R(u * 0.5), p) > 0.85 ? dark(c, 0.08) : c); }, '#8a5a32', '#6f4526');
  } else if (tier === 2) {
    box(b, -0.58, -0.48, 1.16, 0.96, 5, 8, clothTop,
      function (u, z) { var a = Math.floor(u / 3.2) & 1, c = Math.floor((3 - z) / 1.6) & 1; return z < 0.6 ? '#c9bda0' : (a && c ? dark(CHK, 0.08) : a || c ? dark(CHKL, 0.06) : '#e8dfc6'); },
      function (v, z) { var a = Math.floor(v / 3.2) & 1, c = Math.floor((3 - z) / 1.6) & 1; return z < 0.6 ? '#a89c80' : (a && c ? dark(CHK, 0.22) : a || c ? dark(CHKL, 0.2) : '#cfc4a8'); });
  } else if (tier === 3) {                                           /* yağlı tik masa + turkuaz keten yol örtüsü */
    box(b, -0.58, -0.48, 1.16, 0.96, 6, 8.2, function (u, v) {
      if (v > 4.4 && v < 7.2) return (v < 4.9 || v > 6.7) ? '#f4efe2' : (((R(u) >> 1) & 1) ? '#2a95c4' : '#3aa5d4');
      var p = Math.floor(u / 2.9); if ((u % 2.9) < 0.4) return '#7d4e2b'; var c = TEAK[p % TEAK.length]; return v < 0.6 ? lite(c, 0.15) : c;
    }, function (u, z) { return z > 1.2 ? '#b67f45' : '#8a5a32'; }, function (v, z) { return (v > 4.4 && v < 7.2) ? '#2a85b0' : '#7d4e2b'; });
  } else {                                                           /* keten örtü, uzun etek, dantel kenar */
    box(b, -0.6, -0.5, 1.2, 1.0, 2.5, 8, linenTop,
      function (u, z) { if (z < 1.1) return ((R(u) % 3) === 0) ? null : '#e8e2d2'; return z > 4.6 ? '#f4f0e6' : ((R(u) % 4) === 0 ? '#e2dccb' : '#eee9dc'); },
      function (v, z) { if (z < 1.1) return ((R(v) % 3) === 0) ? null : '#c8c0ac'; return (R(v) % 4) === 0 ? '#cdc5b0' : '#d8d1bf'; }, { norim: true });
  }
}
function tableSpr(seats, occ, tier) {
  tier = clamp(tier | 0, 1, 4);
  return spr('lktb|' + seats + '|' + occ + '|' + tier + '|' + G().K, 0, 0, function (b) {
    var S = seats === 2 ? SEAT2 : SEAT4, k, lc = tier === 3 ? '#6a4326' : '#4a2f1c';
    for (k = 0; k < S.length; k++) if (S[k][0] < 0 && !((occ >> k) & 1)) chair(b, S[k][0], S[k][1], -1, tier);
    vl(b, -0.46, 0.36, 0, 6, lc, 2); vl(b, 0.44, 0.36, 0, 6, '#5a3822', 2); vl(b, 0.44, -0.36, 0, 6, lc, 2);
    tableTop(b, tier);
    for (k = 0; k < S.length; k++) if (S[k][0] > 0) chair(b, S[k][0], S[k][1], 1, tier);
    b.outline(0.55);
  });
}
function vaseSpr(tier) {
  return L.sprite('lkvase|' + tier + '|' + G().K, function (b) {
    if (tier === 1) { b.rect(-3, -4, 2, 4, '#f4f0e6'); b.set(-3, -5, '#c9c2ae'); b.rect(1, -4, 2, 4, '#3a3a40'); b.set(1, -5, '#8d96a0'); }   /* tuzluk + biberlik */
    else if (tier === 3) { b.rect(-1, -6, 3, 6, '#2f7fb0'); b.set(-1, -6, '#8fc4e0'); b.rect(0, -10, 1, 4, '#4f8a3a'); b.set(-1, -11, '#ffffff'); b.set(1, -11, '#ffffff'); b.set(0, -12, '#ffffff'); b.set(0, -11, '#ffc94a'); }   /* mavi şişe + papatya */
    else { b.rect(-1, -5, 3, 5, '#4f8fb8'); b.set(-1, -5, '#8fc4e0'); b.rect(0, -9, 1, 4, '#4f8a3a'); b.set(-1, -10, '#e5533d'); b.set(1, -10, '#e5533d'); b.set(0, -11, '#e5533d'); b.set(0, -10, '#ffc94a'); }
    b.outline(0.55);
  });
}
function candleSpr() {                                               /* mumluk: cam fanus, pirinç ayak (alev ayrıca titrer) */
  return L.sprite('lkcndl|' + G().K, function (b) {
    b.rect(-3, -1, 7, 2, BRASS); b.rect(-3, -1, 7, 1, BRASSL);
    b.rect(-2, -9, 5, 8, 'rgba(220,236,244,.45)'); b.rect(-2, -9, 1, 8, 'rgba(255,255,255,.7)');
    b.rect(0, -6, 1, 5, '#f4efe2');
    b.outline(0.5);
  });
}
function mezeSpr() {
  return L.sprite('lkmeze|' + G().K, function (b) {
    b.rect(-10, -2, 20, 3, '#a8793e'); b.rect(-10, -2, 20, 1, '#c99a5c'); b.rect(-10, 1, 20, 1, '#6a4326');
    var mc = ['#c0503a', '#e8e4cf', '#e8c547'], tops = ['#e0705a', '#7fb069', '#f4dc7a'];
    for (var i = 0; i < 3; i++) { var cx = -6 + i * 6; b.ellipse(cx, -3, 3, 1, '#f4f0e6'); b.rect(cx - 2, -4, 4, 1, mc[i]); b.set(cx - 1, -5, tops[i]); b.set(cx, -4, tops[i]); }
    b.outline(0.55);
  });
}
function billSpr(n) {
  return L.sprite('lkbill|' + n + '|' + G().K, function (b) {
    b.rect(-6, -3, 12, 5, '#3a2a1a'); b.rect(-6, -3, 12, 1, '#5a4030');
    for (var i = 0; i < n; i++) { b.rect(-5 + i, -5 - i, 9, 2, i & 1 ? '#3f9a5a' : '#2f7d4a'); b.rect(-5 + i, -5 - i, 9, 1, '#6fdc8a'); }
    b.ellipse(5, -2, 2, 1, '#e6be59'); b.set(4, -3, '#fff0b0');
    b.outline(0.55);
  });
}
HKA.drawLokTable = function (o) {
  var x = o.x, y = o.y, i, st = o.st, want = o.want | 0;
  if (st === 'seat' && want > 0) st = (o.plates | 0) < want ? 'wait' : 'eat';   /* oyun masayı 'seat'te tutuyor: sipariş/servis durumunu tabaktan çıkar */
  var live = st === 'seat' || st === 'wait' || st === 'eat';
  var S = o.seats === 2 ? SEAT2 : SEAT4, occ = 0;
  if (live) for (i = 0; i < S.length; i++) if (i < (o.n | 0) && S[i][0] < 0) occ |= 1 << i;
  gf('shadow')(x, y, 0.85);
  var tier = clamp(o.tier | 0 || 2, 1, 4);
  at(tableSpr(o.seats === 2 ? 2 : 4, occ, tier), x, y, 0);
  var PP = o.seats === 2 ? PL2 : PL4;
  if (tier === 4) {                                                  /* mumluk hep masada (arka orta); alev titrer, gece hale */
    var cX = R(pX(x, y - 0.32)), cY = R(pY(x, y - 0.32, 8)), fl = Math.floor((o.t || T()) * 7 + o.i) % 3, nt = lokNightNow();
    L.blit(candleSpr(), cX, cY);
    L.fr(cX, cY, 0, -9 - (fl === 1 ? 1 : 0), 1, 2, '#ffd27a'); L.fr(cX, cY, 0, -8, 1, 1, '#fff4c0');
    if (nt) { L.fr(cX, cY, -5, -13, 11, 9, 'rgba(255,214,140,.16)'); L.fr(cX, cY, -3, -11, 7, 5, 'rgba(255,224,160,.22)'); }
  }
  if (o.meze && live) at(mezeSpr(), x, y + 0.02, 8);
  else if (st === 'free' && tier !== 4) at(vaseSpr(tier), x, y, 8);
  for (i = 0; i < o.plates && i < 4; i++) { var p = PP[i]; L.blit(K.plateSpr(o.dish), R(pX(x + p[0], y + p[1])), R(pY(x + p[0], y + p[1], 9))); }
  for (i = 0; i < Math.min(o.dirty | 0, 4); i++) { var q = PP[i]; L.blit(K.dirtySpr(), R(pX(x + q[0], y + q[1])), R(pY(x + q[0], y + q[1], 9))); }
  var np = o.payItems ? o.payItems.length : 0;
  if (np) at(billSpr(Math.min(3, np)), x + 0.12, y + 0.06, 8.5);
  if (st === 'wait' && o.v2) {                                       /* v2: küçük lacivert rozet — yemek simgesi + n/m, altta ince sabır şeridi */
    var md2 = clamp(o.mood, 0, 1), bx2 = R(pX(x, y)), by2 = R(pY(x, y, 27));
    L.blit(orderPill(md2 > 0.5 ? 2 : md2 > 0.25 ? 1 : 0, R(md2 * 10)), bx2, by2);
    L.blit(K.plateSpr(o.dish), bx2 - 3, by2 - 1.5);
    gf('uiText')(x, y, 27, (o.plates | 0) + '/' + (want || o.n), '#ffe9b0', 8, 1, 3.5, -1.5);
  } else if (st === 'wait') {                                        /* sipariş balonu: yemek simgesi + tabak sayısı + sabır çubuğu */
    var bx = R(pX(x, y)), by = R(pY(x, y, 30));
    L.blit(bubbleBase(), bx, by);
    L.blit(K.plateSpr(o.dish), bx - 4, by + 2);
    gf('uiText')(x, y, 30, (o.plates | 0) + '/' + o.n, '#ffe9b0', 9, 1, 5, 0);
    var md = clamp(o.mood, 0, 1), pc = md > 0.5 ? '#5fd37a' : md > 0.25 ? '#ffc94a' : '#e5533d';
    L.fr(bx, by, -15, 21, 30, 4, '#0a1a27'); if (md > 0) { L.fr(bx, by, -14, 22, R(28 * md), 2, pc); L.fr(bx, by, -14, 22, R(28 * md), 1, lite(pc, 0.35)); }
  } else if (st === 'dirty' && (o.pay | 0) > 0) gf('uiBadge')(x, y, 26, '$', '#9df5b0');
};
/* v2 sipariş rozeti: oyunun ince rozet levhası (kırık köşe, #0a1a27 kenar, lacivert dolgu), solda yemek, sağı yazıya boş; alt kenar sabır */
function orderPill(mc, mf) {
  return L.sprite('lkpill|' + mc + '|' + mf + '|' + G().K, function (b) {
    var w = 30, h = 13, x0 = -15, y0 = -h, pc = ['#e5533d', '#ffc94a', '#5fd37a'][mc];
    b.rect(x0 + 2, y0 + h, w - 3, 2, 'rgba(6,16,24,.35)');
    b.rect(x0 + 1, y0, w - 2, h, '#0a1a27'); b.rect(x0, y0 + 1, w, h - 2, '#0a1a27');
    b.rect(x0 + 1, y0 + 1, w - 2, h - 2, '#1f3e58'); b.rect(x0 + 2, y0 + 1, w - 4, 1, '#3a5a74');
    b.set(x0 + 2, y0 + 2, '#7a9ab0'); b.set(x0 + w - 3, y0 + 2, '#7a9ab0');
    b.rect(2, y0 + h - 3, 12, 1, '#0a1a27');                                    /* sabır şeridi: yazının altında (solda tabak var) */
    if (mf > 0) b.rect(2, y0 + h - 3, Math.max(1, R(12 * mf / 10)), 1, pc);
    b.rect(-2, y0 + h, 4, 1, '#0a1a27'); b.rect(-1, y0 + h + 1, 2, 1, '#0a1a27'); b.set(-1, y0 + h, '#1f3e58'); b.set(0, y0 + h, '#1f3e58');
  });
}
function bubbleBase() {                                            /* oyunun rozetleriyle aynı koyu lacivert balon */
  return L.sprite('lkbubb|' + G().K, function (b) {
    var w = 18, h = 11;
    for (var y = -h; y <= h; y++) for (var x = -w; x <= w; x++) {
      var cx = Math.max(0, Math.abs(x) - (w - 4)), cy = Math.max(0, Math.abs(y) - (h - 4));
      if (cx * cx + cy * cy > 16) continue;
      b.set(x, y + 2, y < -h + 2 ? '#2e4a66' : y > h - 2 ? '#122030' : '#1b2f44');
    }
    for (var t = 0; t < 5; t++) b.rect(-3 + t, h + 3 + t, Math.max(1, 5 - t), 1, '#122030');
    b.ellipse(-8, 4, 9, 5, '#2a4560');
    b.outline(0.6, '#0a1a27');
  });
}

/* =====================================================================
   3) İSTASYON (v2.22 kademeli): o.lv 1–3 tipi ve boyutu değiştirir; en büyük kademe ≤ 1,4 kare (istasyon aralığı 1,8).
   Tava: tek tava → çift gözlü ocak → döküm sanayi ocağı · Izgara: küçük mangal → uzun mangal → davlumbazlı ocakbaşı
   Kazan: tencere → büyük kazan → çift kazan · Fırın: küçük taş fırın → kubbeli fırın → büyük odun fırını.
   Görünürlük: ön sıra evin önündedir; üst kat / ön kiriş (z ≈ 40–43, y 17,0–17,2) istasyonun arkasında z ≈ 28'in üstünü örter,
   o yüzden uzun parçalar (davlumbaz, baca) tavana "girer" gibi çizilir, okunan kısım ön yüz ve tezgâh üstüdür.
   ===================================================================== */
var STW = { tava: [0.8, 1.05, 1.4], izgara: [0.78, 1.22, 1.4], tencere: [0.8, 1.05, 1.4], firin: [0.86, 1.12, 1.4] };
function stW(id, lv) { var a = STW[id] || STW.tava; return a[clamp(lv | 0, 1, 3) - 1]; }
/* çini ön yüz (h yüksekliğe göre): alt süpürgelik, karo, üstte renkli kuşak */
function ciniH(h, c1, c2) {
  return function (u, z) {
    if (z < 1.2) return '#3a3430';
    if (z > h - 1.2) return '#d8d0bc';
    if (z > h - 2.8) return (((u % 3) + 3) % 3 < 0.5) ? dark(c2, 0.2) : (z > h - 1.7 ? lite(c2, 0.25) : c2);
    var tu = ((u % 4) + 4) % 4, tz = ((z - 1.2) % 2.5 + 2.5) % 2.5;
    if (tu < 0.45 || tz < 0.4) return '#c9bea6';
    return tz > 2 ? '#f6efdf' : c1;
  };
}
function ciniF(c1, c2) { return ciniH(9, c1, c2); }
function darkF(f, a) { return function (v, z) { var c = f(v, z); return c ? dark(c, a) : c; }; }
function steelTop(u, v) { return (u < 0.7 || v < 0.7) ? '#d6dadd' : (hash(R(u * 2), R(v * 2)) > 0.9 ? '#a8b0b6' : STEEL); }
/* tuğla yüz: base renk dizisi, derz; u yüz boyunca (U birimi), z sanat pikseli */
function brickF(base, mort, seed, dk) {
  return function (u, z) {
    var row = Math.floor(z / 2.2), off = (row & 1) * 2.2, q = u + off, col = Math.floor(q / 4.4), lz = z - row * 2.2, lu = q - col * 4.4;
    var c = (lz < 0.5 || lu < 0.55) ? mort : base[Math.floor(hash(col * 3 + seed, row * 7 + 1) * base.length)];
    if (c !== mort && lz > 1.7) c = lite(c, 0.1);
    return dk ? dark(c, dk) : c;
  };
}
var BRICK = ['#b5603e', '#a8553a', '#bf6a45', '#9c4c34'];
function counter(b, w, d, h, top, c1, c2) {
  var f = ciniH(h, c1, c2);
  box(b, -w / 2, -d / 2, w, d, 0, h, top || steelTop, f, darkF(f, 0.16));
  quadW(b, -w / 2, d / 2 - 0.12, w, 0.12, h + 0.05, function (X) { return (X & 3) ? BRASS : BRASSL; });   /* pirinç ön kenar */
}
function pips(b, lv, y, z) { for (var i = 0; i < lv; i++) pr(b, (i - (lv - 1) / 2) * 0.2, y, z, -1, 0, 2.5, 1.5, '#ffd23a'); }
function flameAt(b, X, Y, fr, s) {
  s = s || 1;
  var hs = [3, 5, 4, 6, 3], o = fr;
  for (var i = 0; i < 5; i++) { var hh = R(hs[(i + o) % 5] * s), xx = X - 4 + i * 2; for (var j = 0; j < hh; j++) b.set(xx, Y - j, j < 1 ? '#4a8ae0' : j < hh * 0.5 ? '#ff9a3a' : j < hh - 1 ? '#ffc94a' : '#fff0a8'); }
}
/* gözlü ocak + döküm tava (sap hd yönünde); r: tava yarıçapı (ince piksel) */
function panAt(b, x, y, z, r, busy, fr, c, hd, ring) {
  var X = R(fx(x, y)), Y = R(fy(x, y, z)), ry = Math.max(2, R(r * 0.42)), i;
  if (ring !== false) { b.ellipse(X, Y, r + 1, ry + 1, '#2c2c32'); b.ellipse(X, Y, r - 2, ry - 1, '#1c1c20'); for (i = -r; i <= r; i += 5) b.rect(X + i, Y - 1, 1, 3, '#55555c'); }
  if (busy) flameAt(b, X, Y + 1, fr, r / 12);
  b.ellipse(X, Y - 3, r, ry, '#1c1c20'); b.ellipse(X, Y - 3, r - 1, ry - 1, '#2c2c32');
  for (i = -r + 1; i <= r - 1; i++) { var e = R(ry * Math.sqrt(Math.max(0, 1 - i * i / (r * r)))); b.set(X + i, Y - 3 - e, '#5a5a62'); }
  if (hd) { var hx = hd > 0 ? X + r : X - r - 7; b.rect(hx, Y - 4, 8, 2, '#3a2a1c'); b.rect(hx, Y - 4, 8, 1, '#5a4030'); b.set(hd > 0 ? hx + 7 : hx, Y - 4, '#7a5a3a'); }
  if (busy) {
    b.ellipse(X, Y - 3, r - 3, Math.max(1, ry - 2), c ? dark(c, 0.1) : '#c08a3a');
    var n = Math.max(3, R(r / 2));
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + fr * 0.3, hx2 = X + R(Math.cos(a) * (r - 5)), hy = Y - 3 + R(Math.sin(a) * Math.max(1, ry - 2)); b.rect(hx2 - 1, hy, 3, 1, c ? lite(c, 0.25) : '#e8b050'); b.set(hx2 + 1, hy, '#6a4a1a'); }
    b.set(X - 3 + fr, Y - 5, '#fff4c0'); b.set(X + 4 - fr, Y - 4, '#fff4c0');
  }
}
/* kazan / tencere gövdesi: X,Y ekran tabanı; hw yarı genişlik, h yükseklik (ince piksel); met: 'cop' bakır | 'steel' çelik */
function potAt(b, X, Y, hw, h, busy, fr, c, met) {
  var P0 = met === 'steel' ? ['#9aa6ae', '#d4dde3', '#66727a', '#c9d2d8'] : ['#b8733a', '#e8a868', '#7d4a24', '#c98a50'];
  var cop = P0[0], copL = P0[1], copD = P0[2], top = Y - h, yy, xx;
  for (yy = top; yy <= Y - 1; yy++) {
    var bulge = met === 'steel' ? 0 : Math.sin((yy - top) / (Y - 1 - top) * Math.PI) * 1.5, w = R(hw + bulge);
    for (xx = -w; xx <= w; xx++) { var s = xx / w; b.set(X + xx, yy, s < -0.55 ? copL : s > 0.6 ? copD : (s < -0.2 ? mix(copL, cop, 0.5) : cop)); }
    if (met !== 'steel' && (yy === top + 4 || yy === Y - 4)) for (var r2 = -w + 2; r2 < w - 1; r2 += 3) b.set(X + r2, yy, '#6a3a1a');
  }
  b.ellipse(X, Y - 1, hw, 2, copD);
  b.rect(X - hw - 3, top + 4, 3, 3, copD); b.rect(X + hw + 1, top + 4, 3, 3, copD); b.set(X - hw - 2, top + 5, '#2a1a10'); b.set(X + hw + 2, top + 5, '#2a1a10');
  var ly = busy ? top - 2 - (fr & 1) : top, lx = busy ? 2 : 0;
  b.ellipse(X, top, hw + 1, 3, copD); b.ellipse(X, top, hw - 1, 2, busy && c ? dark(c, 0.15) : '#4a2a14');
  if (busy && c) { b.set(X - 3, top, lite(c, 0.4)); b.set(X + 2 + fr, top - 1, lite(c, 0.5)); }
  b.ellipse(X + lx, ly - 1, hw + 1, 3, P0[3]); b.ellipse(X + lx, ly - 2, hw - 1, 2, copL); b.rect(X + lx - 2, ly - 5, 4, 2, '#5a3a1a'); b.rect(X + lx - 1, ly - 6, 2, 1, '#8a5a32');
}
/* ocak ağzı (tuğla kemer, içinde ateş): mx,my alt orta; hw yarı genişlik, h yükseklik */
function fireMouth(b, mx, my, hw, h, busy, fr) {
  for (var j = 0; j < h; j++) for (var i2 = -hw; i2 <= hw; i2++) {
    var k0 = h - hw, arch = j > k0 ? Math.sqrt(Math.max(0, 1 - Math.pow((j - k0) / hw, 2))) * (hw + 0.5) : hw + 0.5;
    if (Math.abs(i2) > arch) continue;
    var inner = Math.abs(i2) < arch - 2 && j < h - 2, cc;
    if (!inner) cc = ((j + (Math.abs(i2) > hw - 1 ? 1 : 0)) % 3 === 0) ? '#6a2a18' : '#9a4a2a';
    else if (busy) { var q = (j + i2 * (fr - 1) + 40) % 5; cc = j < 2 ? '#ffb347' : j < h * 0.45 + fr ? (q < 2 ? '#ffc94a' : '#e8762b') : j < h * 0.7 ? (q === 0 ? '#e8762b' : '#3a1c10') : '#1d1410'; }
    else cc = j < 2 ? '#5a2a1a' : '#1d1410';
    b.set(mx + i2, my - j, cc);
  }
}
/* kubbe: X,by taban ortası; rx, ry ince piksel; col(x, y, sl) → renk */
function domeAt(b, X, by, rx, ry, col) {
  for (var y = by - ry; y <= by; y++) {
    var k = (by - y) / ry, hw = R(rx * Math.sqrt(Math.max(0, 1 - k * k)));
    for (var x = -hw; x <= hw; x++) b.set(X + x, y, col(x, y, (x / rx) * 0.7 - k * 0.7));
  }
}
function logEnds(b, X, Y, n) {                                       /* odun istifi: kesik uçlar */
  for (var i = 0; i < n; i++) { var lx = X + (i % 3) * 5 + ((i / 3 | 0) & 1) * 2, ly = Y - (i / 3 | 0) * 4; b.ellipse(lx, ly, 2, 2, '#6a4a2a'); b.rect(lx - 1, ly - 1, 2, 2, i & 1 ? '#d8b07a' : '#c9a066'); b.set(lx, ly, '#9a7a4a'); }
}
/* --- tava --- */
function stTava(b, lv, busy, fr, c) {
  var i;
  if (lv === 1) {                                                    /* tek tava: küçük çini tezgâh + tek göz */
    counter(b, 0.8, 0.7, 9, null, '#ece3cc', '#2f6f9f');
    panAt(b, -0.04, -0.04, 9.2, 9, busy, fr, c, 1);
    pips(b, 1, 0.35, 7.4);
  } else if (lv === 2) {                                             /* çift gözlü ocak: beyaz emaye gövde, iki göz, düğmeler */
    box(b, -0.52, -0.42, 1.05, 0.84, 0, 9, steelTop, function (u, z) { return z < 1.2 ? '#3a3430' : z > 7.8 ? '#e8ecee' : (z > 2.4 && z < 3.4) ? '#9aa4ac' : (u < 0.8 ? '#ffffff' : '#eef1f2'); },
      function (v, z) { return z < 1.2 ? '#2a2420' : z > 7.8 ? '#c8ced2' : '#c2cacf'; });
    for (i = 0; i < 4; i++) { pr(b, -0.36 + i * 0.24, 0.42, 6.2, -1, -1, 2, 2, '#2e2e32'); pr(b, -0.36 + i * 0.24, 0.42, 6.2, -1, -1, 1, 1, '#8d96a0'); }
    hl(b, -0.52, 0.42, 0.53, 0.42, 9, BRASS);
    panAt(b, -0.26, -0.1, 9.2, 7, busy, fr, c, -1);
    panAt(b, 0.27, 0.06, 9.2, 6, busy, (fr + 1) % 3, c, 1);
    pips(b, 2, 0.42, 4);
  } else {                                                           /* döküm sanayi ocağı: siyah gövde, fırın kapakları, üç göz, arka raf */
    var IRON = '#2e3034', IRONL = '#4a4e54', IRONT = '#3a3d42';
    box(b, -0.7, -0.4, 0.12, 0.08, 9, 15, IRONL, IRON, '#1e2024', { norim: true }); box(b, 0.58, -0.4, 0.12, 0.08, 9, 15, IRONL, IRON, '#1e2024', { norim: true });
    box(b, -0.7, -0.42, 1.4, 0.84, 0, 10, function (u, v) { return (u < 0.7 || v < 0.7) ? '#6a6e74' : (((R(u) + R(v)) % 6) ? IRONT : '#33363b'); },
      function (u, z) {
        if (z < 1.2) return '#141518';
        if (z > 8.8) return '#5a5e64';
        var d0 = u > 1.4 && u < 7.8, d1 = u > 9.0 && u < 15.4;
        if ((d0 || d1) && z > 1.8 && z < 7.6) { var e = Math.min(Math.abs(u - (d0 ? 1.4 : 9.0)), Math.abs(u - (d0 ? 7.8 : 15.4))); if (z > 6.6 && z < 7.2) return BRASSL; return e < 0.5 || z < 2.3 ? '#151619' : (z > 6.2 ? IRONL : IRON); }
        return (Math.floor(u) % 8 === 0) ? '#1e2024' : '#25272b';
      },
      function (v, z) { return z < 1.2 ? '#101114' : z > 8.8 ? '#3a3d42' : '#1c1d20'; });
    hl(b, -0.72, 0.46, 0.72, 0.46, 9, '#d8dde2'); hl(b, -0.72, 0.47, 0.72, 0.47, 8.5, '#8d96a0');                        /* önde krom tutamak */
    hl(b, -0.66, -0.4, 0.66, -0.4, 14.5, '#8d96a0'); hl(b, -0.66, -0.4, 0.66, -0.4, 15, '#c9d0d6');                    /* arkada askı çubuğu (alçak: aşçının yüzü açık) */
    [[-0.5, '#b87333', 5], [-0.3, '#8d959b', 6], [0.45, '#2c2c32', 4]].forEach(function (u2) { var X = R(fx(u2[0], -0.38)), Y = R(fy(u2[0], -0.38, 14.5)); b.rect(X, Y, 1, 3, '#55555c'); b.rect(X - 1, Y + 3, 3, u2[2], u2[1]); b.rect(X - 1, Y + 3, 1, u2[2], lite(u2[1], 0.25)); });
    panAt(b, -0.4, -0.08, 10.2, 8, busy, fr, c, -1);
    panAt(b, 0.24, -0.16, 10.2, 7, busy, (fr + 1) % 3, c, 0);
    var X2 = R(fx(0.5, 0.18)), Y2 = R(fy(0.5, 0.18, 10.2));                                                          /* küçük kazan (sos) */
    b.ellipse(X2, Y2, 6, 3, '#1c1c20'); if (busy) flameAt(b, X2, Y2 + 1, fr, 0.5);
    for (i = 0; i < 8; i++) b.rect(X2 - 5, Y2 - 1 - i, 11, 1, i > 6 ? '#d4dde3' : (i & 1 ? '#9aa6ae' : '#8d98a0'));
    b.ellipse(X2, Y2 - 8, 5, 2, '#66727a'); b.ellipse(X2, Y2 - 8, 4, 1, busy && c ? c : '#4a535b');
    pips(b, 3, 0.47, 4.4);
  }
}
/* --- ızgara --- */
function coalF(busy, fr) {
  return function (Xx, Yy) {
    var q = hash(Xx + fr * 7, Yy + fr * 3);
    if (!busy) return q > 0.8 ? '#7a3a2a' : q > 0.4 ? '#5d5a58' : '#4a4644';
    return q > 0.82 ? '#ffd27a' : q > 0.55 ? '#ff7a2a' : q > 0.25 ? '#c8401c' : '#5a2a1a';
  };
}
function grillFood(b, xs, y, z, busy, dish, c) {
  if (!busy) return;
  xs.forEach(function (gx) {
    var sx2 = R(fx(gx, y)), sy2 = R(fy(gx, y, z));
    if (dish === 'orkinosizgara') { b.rect(sx2 - 4, sy2 - 2, 8, 4, c); b.rect(sx2 - 4, sy2 - 2, 8, 1, lite(c, 0.25)); b.set(sx2 - 2, sy2 - 1, '#5e1e1a'); b.set(sx2 + 1, sy2, '#5e1e1a'); }
    else { b.rect(sx2 - 5, sy2 - 1, 10, 2, '#9fb3c2'); b.rect(sx2 - 5, sy2 - 1, 10, 1, '#d0dde6'); b.set(sx2 + 4, sy2 - 1, '#16222b'); b.rect(sx2 - 7, sy2 - 2, 2, 4, '#7d93a3'); for (var g = -3; g < 4; g += 2) b.set(sx2 + g, sy2, '#3a3a3a'); }
  });
}
function trough(b, x0, x1, y0, y1, z0, z1, busy, fr) {                 /* çelik mangal teknesi + kor + tel */
  box(b, x0, y0, x1 - x0, y1 - y0, z0, z1, '#3a3a40', function (u, z) { return z > z1 - z0 - 1 ? '#7d868e' : (Math.floor(u) % 6 === 0 ? '#3e444a' : '#4d555c'); }, function (v, z) { return z > z1 - z0 - 1 ? '#5d666e' : '#2a2a30'; }, { norim: true });
  quadW(b, x0 + 0.05, y0 + 0.05, x1 - x0 - 0.1, y1 - y0 - 0.1, z1 - 0.5, coalF(busy, fr));
  for (var gx = x0 + 0.06; gx < x1 - 0.03; gx += 0.1) line(b, fx(gx, y0 + 0.02), fy(gx, y0 + 0.02, z1 + 0.6), fx(gx, y1 - 0.02), fy(gx, y1 - 0.02, z1 + 0.6), '#9aa4ac');
  hl(b, x0, y0 + 0.02, x1, y0 + 0.02, z1 + 0.6, '#c9d0d6'); hl(b, x0, y1 - 0.02, x1, y1 - 0.02, z1 + 0.6, '#c9d0d6');
}
function stIzgara(b, lv, busy, fr, c, dish) {
  var i;
  if (lv === 1) {                                                    /* küçük mangal: dört ayaklı tekne, yelpaze */
    [[-0.33, -0.16], [0.33, -0.16], [-0.33, 0.18], [0.33, 0.18]].forEach(function (p) { vl(b, p[0], p[1], 0, 8, '#2a2a30', 2); });
    hl(b, -0.33, 0.18, 0.33, 0.18, 3, '#3a3a40');
    trough(b, -0.38, 0.38, -0.2, 0.22, 8, 13, busy, fr);
    grillFood(b, [0], 0, 14.5, busy, dish, c);
    var X = R(fx(0.36, 0.3)), Y = R(fy(0.36, 0.3, 0));                                                              /* hasır yelpaze */
    b.rect(X, Y - 9, 1, 9, '#7a5230'); b.ellipse(X + 1, Y - 12, 4, 3, '#d8b86a'); b.rect(X - 2, Y - 12, 7, 1, '#b8964a');
    pips(b, 1, 0.22, 9.5);
  } else if (lv === 2) {                                             /* uzun mangal: ayaklı uzun tekne, alt raf, yan tepsi */
    [[-0.56, -0.16], [0.56, -0.16], [-0.56, 0.2], [0.56, 0.2]].forEach(function (p) { vl(b, p[0], p[1], 0, 8, '#2a2a30', 2); });
    box(b, -0.56, -0.16, 1.12, 0.36, 2.6, 3.4, '#6f4526', '#5a3a20', '#4a2f1c', { norim: true });                      /* alt raf: kömür çuvalı */
    var Xs = R(fx(-0.3, 0.05)), Ys = R(fy(-0.3, 0.05, 3.4)); b.ellipse(Xs, Ys - 3, 5, 3, '#cdb98a'); b.rect(Xs - 2, Ys - 6, 4, 1, '#7a5a32');
    trough(b, -0.6, 0.6, -0.22, 0.24, 8, 13.5, busy, fr);
    box(b, 0.6, -0.12, 0.14, 0.3, 11.5, 12.5, '#a8784a', '#8a5a32', '#6f4526', { norim: true });                        /* yan tepsi + maşa */
    hl(b, 0.62, 0.1, 0.72, -0.1, 13, '#8d959b');
    grillFood(b, [-0.3, 0.05, 0.38], 0.02, 15, busy, dish, c);
    pips(b, 2, 0.24, 10);
  } else {                                                           /* ocakbaşı: tuğla + çini gövde, bakır kenarlı gömme kor yatağı, bakır davlumbaz */
    var bf = brickF(BRICK, '#e6dccb', 3);
    box(b, -0.7, -0.42, 1.4, 0.84, 0, 10, function (u, v) { return (u < 0.8 || v < 0.8) ? '#e8a868' : '#c98a50'; },
      function (u, z) { if (z > 8.6) return '#c98a50'; if (z > 7.6) return '#7d4a24'; if (z > 2.2 && z < 7 && u > 3 && u < 13.8) return ciniH(10, '#ece3cc', '#2f6f9f')(u, z + 1); return bf(u, z); },
      darkF(bf, 0.2));
    quadW(b, -0.56, -0.28, 1.12, 0.5, 10.05, coalF(busy, fr));
    hl(b, -0.58, -0.3, 0.58, -0.3, 10.2, '#7d4a24'); hl(b, -0.58, 0.24, 0.58, 0.24, 10.2, '#e8a868');
    for (var gx = -0.54; gx < 0.56; gx += 0.1) line(b, fx(gx, -0.28), fy(gx, -0.28, 11), fx(gx, 0.22), fy(gx, 0.22, 11), '#9aa4ac');
    grillFood(b, [-0.36, -0.02, 0.32], -0.04, 11.5, busy, dish, c);
    vl(b, -0.66, -0.4, 10, 29, '#d8b860', 2); vl(b, 0.64, -0.4, 10, 29, '#a8842a', 2);                                 /* davlumbaz ayakları (pirinç) */
    box(b, -0.72, -0.44, 1.44, 0.52, 29, 33.5, function (u, v) { return v < 0.8 ? '#f4c890' : '#e8a868'; },
      function (u, z) { if (z < 0.9) return '#6a3a1a'; if (z > 3.6) return '#ffe0b0'; if (z < 1.8) return '#c98a50'; return (Math.floor(u) % 5 === 0) ? '#d8955a' : (u < 2 ? '#f8d4a0' : '#eeb070'); },
      function (v, z) { return z < 0.9 ? '#5d3c1c' : '#b06a38'; }, { norim: true });
    for (i = 0; i < 6; i++) pr(b, -0.6 + i * 0.24, 0.08, 31.5, 0, 0, 1, 1, '#8a5430');                                    /* perçinler */
    pips(b, 3, 0.42, 4.6);
  }
}
/* --- kazan --- */
function stKazan(b, lv, busy, fr, c) {
  var X, Y;
  if (lv === 1) {                                                    /* tencere: küçük tezgâh + tek göz + çelik tencere */
    counter(b, 0.8, 0.7, 9, null, '#ece3cc', '#2f6f9f');
    X = R(fx(0, -0.04)); Y = R(fy(0, -0.04, 9.2));
    b.ellipse(X, Y, 9, 4, '#2c2c32'); if (busy) flameAt(b, X, Y + 1, fr, 0.55);
    potAt(b, X, Y - 1, 7, 13, busy, fr, c, 'steel');
    pips(b, 1, 0.35, 7.4);
  } else {                                                           /* tuğla ocak + bakır kazan(lar) */
    var w = lv === 2 ? 1.05 : 1.4, bf = brickF(BRICK, '#5a3a28', 5);
    box(b, -w / 2, -0.42, w, 0.84, 0, 8, function (u, v) { return (u < 0.7 || v < 0.7) ? '#d8cfb8' : (hash(R(u), R(v)) > 0.85 ? '#b9ad94' : '#c9bfa6'); }, function (u, z) { return z > 6.6 ? '#b9ad94' : bf(u, z); }, darkF(bf, 0.2));
    var xs = lv === 2 ? [0] : [-0.33, 0.35];
    xs.forEach(function (px0, k) {
      fireMouth(b, R(fx(px0, 0.42)), R(fy(px0, 0.42, 0.6)), lv === 2 ? 5 : 4, lv === 2 ? 11 : 9, busy, (fr + k) % 3);
      var X3 = R(fx(px0, -0.04)), Y3 = R(fy(px0, -0.04, 8));
      b.ellipse(X3, Y3, lv === 2 ? 11 : 9, 4, '#2a1c14');
      potAt(b, X3, Y3, lv === 2 ? 10 : 8, lv === 2 ? 21 : 17, busy, (fr + k) % 3, c, 'cop');
    });
    if (lv === 3) { var Xk = R(fx(0.02, 0.3)), Yk = R(fy(0.02, 0.3, 8)); b.rect(Xk - 1, Yk - 14, 2, 14, '#7a5230'); b.ellipse(Xk, Yk - 15, 3, 2, '#9aa6ae'); }   /* kepçe */
    pips(b, lv, 0.42, 6.6);
  }
}
/* --- fırın --- */
function washCol(x, y, sl) { var c = sl < -0.55 ? '#fbf6ea' : sl > 0.35 ? '#c9bfa6' : '#e8e0cc'; return hash(x >> 1, y >> 1) > 0.93 ? '#bfb49a' : c; }
function stFirin(b, lv, busy, fr) {
  var X, Y, i;
  if (lv === 1) {                                                    /* küçük taş fırın: moloz taş gövde, düz taş tepe, küçük ağız, saç baca */
    box(b, -0.42, -0.36, 0.84, 0.72, 0, 17, function (u, v) { return (u < 0.7 || v < 0.7) ? '#d6cebb' : '#bdb5a2'; },
      function (u, z) { return z > 15.6 ? '#cfc8b6' : stoneAt(u / 12, z, 71); }, function (v, z) { return z > 15.6 ? '#a39b89' : dark(stoneAt(v / 12, z, 72), 0.16); });
    box(b, -0.46, -0.4, 0.92, 0.8, 17, 18.6, '#e8e1d0', '#c8c0ac', '#a8a08e');
    fireMouth(b, R(fx(-0.04, 0.36)), R(fy(-0.04, 0.36, 2)), 5, 11, busy, fr);
    vl(b, -0.3, -0.2, 18.6, 27, '#55504a', 3); vl(b, -0.3, -0.2, 18.6, 27, '#8a8478', 1);
    pips(b, 1, 0.36, 15.4);
  } else if (lv === 2) {                                             /* kubbeli fırın: taş kaide + badanalı kubbe + baca */
    box(b, -0.56, -0.42, 1.12, 0.84, 0, 7, '#cfc8b6', function (u, z) { return stoneAt(u / 12, z, 73); }, function (v, z) { return dark(stoneAt(v / 12, z, 74), 0.16); });
    X = R(fx(0, -0.04)); Y = R(fy(0, -0.04, 7));
    b.rect(X - 12, Y - 34, 4, 14, '#6f6457'); b.rect(X - 12, Y - 34, 1, 14, '#8a7f70'); b.rect(X - 13, Y - 36, 6, 2, '#4a433a');
    domeAt(b, X, Y, 15, 26, washCol);
    for (i = -15; i <= 15; i++) b.set(X + i, Y, '#9a8c72');
    fireMouth(b, X - 4, Y - 1, 6, 12, busy, fr);
    line(b, X + 15, Y + 8, X + 21, Y - 18, '#8a5a32'); line(b, X + 16, Y + 8, X + 22, Y - 18, '#6a4326'); b.rect(X + 19, Y - 23, 6, 5, '#a8793e'); b.rect(X + 19, Y - 23, 6, 1, '#c99a5c');
    pips(b, 2, 0.42, 4);
  } else {                                                           /* büyük odun fırını: geniş taş kaide, tuğla kubbe, geniş ağız, baca, odun istifi */
    box(b, -0.7, -0.42, 1.4, 0.84, 0, 8, '#cfc8b6', function (u, z) { return z > 6.8 ? '#e8e1d0' : stoneAt(u / 12, z, 75); }, function (v, z) { return z > 6.8 ? '#bdb5a2' : dark(stoneAt(v / 12, z, 76), 0.16); });
    X = R(fx(-0.06, -0.06)); Y = R(fy(-0.06, -0.06, 8));
    b.rect(X - 16, Y - 44, 6, 22, '#8a4a2e'); b.rect(X - 16, Y - 44, 2, 22, '#b5603e'); b.rect(X - 17, Y - 46, 8, 2, '#5a3a28');   /* baca (tavana girer; aşçı sağda kalır) */
    domeAt(b, X, Y, 21, 30, function (x, y, sl) {
      var row = Math.floor((Y - y) / 3), off = (row & 1) * 3, col = Math.floor((x + 40 + off) / 6), lz = (Y - y) % 3, lu = (x + 40 + off) % 6;
      var c0 = (lz === 0 || lu === 0) ? '#6a3424' : BRICK[Math.floor(hash(col * 3 + 9, row * 5) * BRICK.length)];
      return sl < -0.5 ? lite(c0, 0.14) : sl > 0.3 ? dark(c0, 0.18) : c0;
    });
    for (i = -21; i <= 21; i++) b.set(X + i, Y, '#5a3a28');
    fireMouth(b, X - 5, Y - 1, 8, 16, busy, fr);
    b.rect(X - 14, Y - 18, 18, 2, '#8a5a32'); b.rect(X - 14, Y - 18, 18, 1, '#a8784a');                                  /* ağız üstü kemer kirişi */
    logEnds(b, R(fx(0.56, 0.3)) - 5, R(fy(0.56, 0.3, 8)) - 2, 6);
    line(b, X - 22, Y + 10, X - 26, Y - 22, '#8a5a32'); line(b, X - 21, Y + 10, X - 25, Y - 22, '#6a4326'); b.rect(X - 29, Y - 27, 7, 5, '#a8793e'); b.rect(X - 29, Y - 27, 7, 1, '#c99a5c');   /* kürek */
    pips(b, 3, 0.42, 4.4);
  }
}
function stationSpr(id, lv, busy, fr, dish) {
  lv = clamp(lv | 0, 1, 3);
  return spr('lks3|' + id + '|' + lv + '|' + (busy ? 1 : 0) + '|' + fr + '|' + (dish || '') + '|' + G().K, 0, 0, function (b) {
    var c = busy ? dcol(dish) : null;
    if (id === 'tava') stTava(b, lv, busy, fr, c);
    else if (id === 'izgara') stIzgara(b, lv, busy, fr, c, dish);
    else if (id === 'tencere') stKazan(b, lv, busy, fr, c);
    else stFirin(b, lv, busy, fr);
    b.outline(0.55);
  });
}
/* efekt noktaları (dünya ofseti x, y, z sanat pikseli): buhar / duman nereden çıkar */
var STFX = {
  tava: [[[-0.04, -0.04, 12]], [[-0.26, -0.1, 12], [0.27, 0.06, 12]], [[-0.4, -0.08, 13], [0.24, -0.16, 13]]],
  izgara: [[[0, 0, 15]], [[-0.3, 0, 15], [0.35, 0, 15]], [[-0.3, -0.04, 12], [0.3, -0.04, 12]]],
  tencere: [[[0, -0.04, 24]], [[0, -0.04, 30]], [[-0.33, -0.04, 27], [0.35, -0.04, 27]]],
  firin: [[[-0.3, -0.2, 28]], [[-0.22, 0.18, 26]], [[-0.33, 0.21, 32]]]
};
HKA.drawLokStation = function (o) {
  var x = o.x, y = o.y, t = o.t || T(), busy = !!o.busy, fr = busy ? Math.floor(t * 9) % 3 : 0, lv = clamp(o.lv | 0, 1, 3), i, j;
  gf('shadow')(x, y, 0.55 + stW(o.id, lv) * 0.3);
  at(stationSpr(o.id, lv, busy, fr, busy ? o.dish : ''), x, y, 0);
  if (busy) {
    var pts = (STFX[o.id] || STFX.tava)[lv - 1];
    for (j = 0; j < pts.length; j++) {
      var cx = R(pX(x + pts[j][0], y + pts[j][1])), cy = R(pY(x + pts[j][0], y + pts[j][1], pts[j][2]));
      if (o.id === 'izgara') for (i = 0; i < 2; i++) {                /* mangal dumanı */
        var q = (t * 0.55 + i * 0.5 + j * 0.27) % 1, al = ((1 - q) * 0.5).toFixed(2), px0 = cx - 3 + i * 5 + R(Math.sin(q * 6 + i + j) * 2), py0 = cy - R(q * 18);
        L.fr(px0, py0, -1, 0, 4, 2, 'rgba(220,220,220,' + al + ')'); L.fr(px0, py0, 0, -1, 2, 4, 'rgba(220,220,220,' + al + ')');
      } else if (o.id === 'firin') for (i = 0; i < 2; i++) {          /* fırın bacası */
        var q4 = (t * 0.45 + i * 0.5) % 1, a4 = ((1 - q4) * 0.45).toFixed(2); L.fr(cx, cy - R(q4 * 12), R(Math.sin(q4 * 5) * 2), 0, 4, 3, 'rgba(200,196,186,' + a4 + ')');
      } else for (i = 0; i < 2; i++) {                                /* buhar */
        var q2 = (t * 0.7 + i * 0.5 + j * 0.3) % 1, a2 = ((1 - q2) * 0.6).toFixed(2); L.fr(cx - 2 + i * 3 + R(Math.sin(q2 * 6 + i) * 1.5), cy - R(q2 * 10), 0, 0, 3, 2, 'rgba(244,239,230,' + a2 + ')');
      }
    }
    K.bar(R(pX(x, y)) - 8, R(pY(x, y, 31)), 16, o.prog || 0, '#5fd37a');   /* z 31: üst kat / kirişin altında kalır, aşçının başının üstünde */
  }
};

/* =====================================================================
   4) ÇALIŞANLAR: ince kişi çizimi + rol kıyafeti; elde taşınan tabaklar düzenli yığın
   ===================================================================== */
var ROLEFIT = {
  asci: { cap: null, chefHat: true, apron: '#f7f7f2', coat: '#f4f1ea', coat2: '#ffffff', sash: '#c0503a' },
  garson: { tray: null, vest: '#1c1c20', bowtie: '#1c1c20', coat: '#f4f1ea', coat2: '#ffffff' },
  bulasik: { coat: '#d8dde2', coat2: '#eef1f3', apron: '#3f7fb0', beanie: null, headband: '#3f7fb0', pants: '#2e3d4a' },
  sef: { vest: '#7a1f2b', bowtie: '#c9952f', coat: '#f4f1ea', coat2: '#ffffff' }
};
var NOC = [];
var CF = null;
HKA.drawLokCrew = function (o) {
  var H = G(); if (H.K !== 2 || !o || !o.a) return false;
  if (!CF) CF = { at: H.v('drawPersonAt'), tag: H.v('drawRoleTag'), WALK: H.WALK, ANIM: H.ANIM };
  if (!CF.at) return false;
  var a = o.a, out = {}, k, fit = ROLEFIT[o.role] || {};
  for (k in o.outfit) out[k] = o.outfit[k];
  for (k in fit) { if (fit[k] === null) delete out[k]; else out[k] = fit[k]; }
  var carry = a.carry || NOC, n = carry.length;
  if (n) out.hold = true; else if (o.role === 'garson') out.notebook = true;
  var px = Object.create(a); px.carry = NOC;                         /* kol duruşu out.hold'dan; yük aşağıda ince çizilir */
  CF.at(px, out);
  if (n) {
    var moving = Math.hypot(a.vx || 0, a.vy || 0) > 0.05, wf = moving ? (Math.floor((a.bob || 0) * 0.16 * CF.ANIM.walkFps) & 3) : 0;
    var bo = moving ? CF.WALK[wf].body : 0, idle = moving ? 0 : (Math.sin((a.bob || 0) * 0.9) > 0.6 ? 1 : 0);
    var plates = carry.every(function (it) { return it.k === 'plate' || it.k === 'dirty'; });
    if (plates) {                                                    /* tabaklar bel hizasında, önde (yüzü örtmez) */
      var f = (out.face || a.face) > 0 ? 1 : -1, sx = R(pX(a.x, a.y)) + f * 3, sy = R(pY(a.x, a.y, a.z || 0)) + bo - idle, i, sh = Math.min(n, 6);
      for (i = 0; i < sh; i++) { var it = carry[n - sh + i]; L.blit(it.k === 'dirty' ? K.dirtySpr() : K.plateSpr(it.d), sx, sy - 10 - i * 2); }
      if (n > sh) gf('uiBadge')(a.x, a.y, 10 + sh * 2 + 8, 'x' + n);
    } else HKA.drawStack(a.x, a.y, carry, 16 + bo - idle, 3.4);
  }
  if (CF.tag) CF.tag(a);
  return true;
};

/* =====================================================================
   5) SABİT EŞYA: dolap, pass, kasa, bulaşık, menü tahtası, tabela/kapı, fiş rayı, teras, meze vitrini, saz köşesi
   ===================================================================== */
function filetoMini(b, X, Y, c) { b.rect(X - 3, Y, 6, 2, c); b.rect(X - 3, Y, 6, 1, lite(c, 0.3)); b.set(X + 2, Y + 1, dark(c, 0.2)); }
function passSpr() {
  return spr('lkpass|' + G().K, 0, 0, function (b) {
    box(b, -0.65, -0.4, 1.3, 0.8, 0, 11, function (u, v) { return (u < 0.7 || v < 0.7) ? '#e6be59' : (hash(R(u), R(v)) > 0.9 ? '#b8884a' : '#c9a15e'); }, K.woodV('#946238', 4), K.woodV('#7a5230', 4));
    hl(b, -0.65, 0.4, 0.65, 0.4, 10.5, BRASS); hl(b, -0.65, 0.4, 0.65, 0.4, 10, BRASSL);
    vl(b, -0.6, -0.3, 11, 26, '#7a5a1e', 2); vl(b, 0.6, -0.3, 11, 26, '#7a5a1e', 2);
    hl(b, -0.6, -0.3, 0.6, -0.3, 26, '#a8842a'); hl(b, -0.6, -0.3, 0.6, -0.3, 25.5, '#7a5a1e');
    for (var i = 0; i < 3; i++) {                                    /* sıcak tutma lambaları */
      var lx = -0.4 + i * 0.4, X = R(fx(lx, -0.3)), Y = R(fy(lx, -0.3, 25.5));
      b.rect(X, Y, 1, 5, '#4a3a18');
      for (var r = 0; r < 4; r++) b.rect(X - 2 - r, Y + 5 + r, 5 + r * 2, 1, r === 3 ? '#8a6420' : BRASS);
      b.rect(X - 4, Y + 9, 9, 1, '#ffd98a');
    }
    b.outline(0.55);
  });
}
function lampGlow(x, y) {
  for (var i = 0; i < 3; i++) { var lx = x - 0.4 + i * 0.4, X = R(pX(lx, y - 0.3)), Y = R(pY(lx, y - 0.3, 25.5)); L.fr(X, Y, -6, 10, 13, 6, 'rgba(255,200,110,.18)'); L.fr(X, Y, -4, 10, 9, 10, 'rgba(255,200,110,.12)'); }
}
function kasaSpr() {
  return spr('lkkasa|' + G().K, 0, 0, function (b) {
    box(b, -0.35, -0.4, 0.7, 0.8, 0, 9, function (u, v) { return (u < 0.7 || v < 0.7) ? '#8a5a32' : '#6f4526'; }, K.woodV('#5a3a20', 3), K.woodV('#4a2f1c', 3));
    wall(b, -0.28, 0.4, 0.28, 0.4, 2, 7, '#7a4e2a'); wall(b, -0.24, 0.4, 0.24, 0.4, 2.6, 6.4, '#8a5a32');
    var X = R(fx(0, -0.05)), Y = R(fy(0, -0.05, 9));                 /* pirinç yazar kasa */
    b.rect(X - 8, Y - 10, 16, 9, '#c9952f'); b.rect(X - 8, Y - 10, 16, 1, '#f0cf6a'); b.rect(X - 8, Y - 10, 2, 9, '#e6be59'); b.rect(X + 6, Y - 9, 2, 8, '#8a6420');
    b.rect(X - 6, Y - 15, 9, 5, '#8a6420'); b.rect(X - 5, Y - 14, 7, 3, '#1c2a1c'); b.rect(X - 4, Y - 13, 1, 1, '#7dff9a'); b.rect(X - 2, Y - 13, 1, 1, '#7dff9a'); b.rect(X, Y - 13, 1, 1, '#7dff9a');
    for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) b.rect(X - 6 + i * 4, Y - 7 + j * 3, 3, 2, '#f4ead6');
    b.rect(X - 9, Y - 1, 18, 2, '#6a4a14');
    var bx = R(fx(0.22, 0.25)), by = R(fy(0.22, 0.25, 9));           /* servis zili */
    b.ellipse(bx, by - 2, 3, 2, '#d8dde2'); b.set(bx - 1, by - 3, '#ffffff'); b.rect(bx, by - 5, 1, 2, '#8d96a0'); b.rect(bx - 4, by, 9, 1, '#5a3a20');
    b.outline(0.55);
  });
}
function sinkSpr() {
  return spr('lksink|' + G().K, 0, 0, function (b) {
    box(b, -0.5, -0.6, 1.0, 1.2, 0, 8, '#c9d0d6', function (u, z) { return z < 1.2 ? '#4a535b' : (((u % 6) + 6) % 6 < 0.5 ? '#7d878e' : '#9aa6ae'); }, function (v, z) { return z < 1.2 ? '#3a434b' : '#6d7a82'; });
    quadW(b, -0.38, -0.5, 0.76, 0.42, 8.1, function (X, Y) { return hash(X >> 1, Y) > 0.85 ? '#8fc0d8' : '#5d89a0'; });
    quadW(b, -0.38, 0.02, 0.76, 0.42, 8.1, function (X, Y) { return hash(X >> 1, Y + 9) > 0.85 ? '#8fc0d8' : '#5d89a0'; });
    hl(b, -0.38, -0.04, 0.38, -0.04, 8.2, '#e8eef2');
    var X = R(fx(-0.42, -0.04)), Y = R(fy(-0.42, -0.04, 8));          /* kuğu boyunlu musluk */
    b.rect(X, Y - 16, 2, 16, '#c9d4da'); b.rect(X, Y - 16, 1, 16, '#ffffff'); b.rect(X, Y - 17, 8, 2, '#c9d4da'); b.rect(X + 7, Y - 17, 2, 4, '#c9d4da'); b.rect(X - 2, Y - 6, 2, 2, '#c0392b'); b.rect(X + 2, Y - 6, 2, 2, '#2a6f97');
    b.outline(0.55);
  });
}
var STAR5 = ['..x..', 'xxxxx', '.xxx.', 'xx.xx'];
function signSpr(star) {
  return spr('lksign|' + star + '|' + G().K, 0, 0, function (b) {
    var X = R(fx(0, 0)), Y = R(fy(0, 0, 0)), k;
    function postP(px0) {                                            /* oymalı ahşap direk, turkuaz bilezikler */
      b.rect(px0, Y - 80, 6, 80, '#6a4326'); b.rect(px0, Y - 80, 2, 80, '#8a5a32'); b.rect(px0 + 5, Y - 80, 1, 80, '#4a2f1c');
      for (k = 0; k < 3; k++) { b.rect(px0 - 1, Y - 22 - k * 18, 8, 2, TURQ); b.rect(px0 - 1, Y - 22 - k * 18, 8, 1, '#5ab0d4'); }
      b.rect(px0 - 1, Y - 3, 8, 3, '#4a2f1c');
    }
    postP(X - 37); postP(X + 31);
    var bx0 = X - 40, by0 = Y - 104, bw = 80, bh = 25;                /* bordo levha, altın çerçeve, turkuaz tepelikler */
    b.rect(bx0, by0, bw, bh, '#c9952f'); b.rect(bx0 + 1, by0 + 1, bw - 2, bh - 2, '#e6be59'); b.rect(bx0 + 2, by0 + 2, bw - 4, bh - 4, '#7a1f2b');
    b.rect(bx0 + 2, by0 + 2, bw - 4, 1, '#a83a4a'); b.rect(bx0 + 2, by0 + bh - 3, bw - 4, 1, '#5a1520');
    for (k = 0; k < 2; k++) { var cx = k ? bx0 + bw - 6 : bx0 + 1; b.rect(cx, by0 - 3, 5, 3, TURQ); b.rect(cx + 1, by0 - 5, 3, 2, TURQD); b.set(cx + 2, by0 - 6, '#5ab0d4'); }
    for (k = 0; k < 7; k++) { b.set(X - 9 + k * 3, by0 - 1, '#c9952f'); }
    for (var s = 0; s < 5; s++) {                                    /* 5 yıldız (dolu = son eleştiri) */
      var on = s < star, sx0 = X - 17 + s * 7, sy0 = Y - 76;
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) if (STAR5[r].charAt(c) === 'x') b.set(sx0 + c, sy0 + r, on ? (r === 0 ? '#fff0a0' : '#ffd23a') : '#5a4a3a');
    }
    b.outline(0.55);
  });
}
function bulbs(x, y, night, t) {                                   /* direkler arası sarkık ampul dizisi */
  var X = R(pX(x, y)), Y = R(pY(x, y, 0));
  for (var i = 0; i <= 16; i++) { var u = i / 16; L.fr(X, Y, -31 + R(u * 62), -64 + R(Math.sin(u * Math.PI) * 7), 1, 1, '#4a3a18'); }
  for (var j = 0; j < 7; j++) {
    var u2 = (j + 0.5) / 7, xx = -31 + R(u2 * 62), yy = -64 + R(Math.sin(u2 * Math.PI) * 7) + 1, on = night || ((j + Math.floor(t * 1.5)) % 4 === 0);
    L.fr(X, Y, xx - 1, yy, 3, 3, on ? '#ffe9a0' : '#c9a86a'); L.fr(X, Y, xx - 1, yy, 1, 1, on ? '#fffbe0' : '#e0c890');
    if (night) L.fr(X, Y, xx - 3, yy - 2, 7, 7, 'rgba(255,217,138,.22)');
  }
}
function ticketSpr(items) {
  var key = items.slice(0, 5).map(function (t) { return t.d + ':' + Math.min(4, t.left); }).join(',');
  return L.sprite('lktk|' + key + '|' + G().K, function (b) {
    var n = Math.min(5, items.length), wd = n * 11 + 3, x0 = -wd / 2;
    b.rect(x0, -2, wd, 2, '#c99a5c'); b.rect(x0, 0, wd, 1, '#6a4326');
    for (var i = 0; i < n; i++) {
      var tk = items[i], tx = x0 + 2 + i * 11, c = dcol(tk.d);
      b.rect(tx + 3, -3, 3, 3, '#8d96a0');
      b.rect(tx, 1, 9, 12, '#f4f1ea'); b.rect(tx, 1, 9, 1, '#ffffff'); b.rect(tx + 8, 2, 1, 11, '#cfc9bd');
      b.rect(tx + 2, 3, 5, 3, c); b.rect(tx + 2, 3, 5, 1, lite(c, 0.3));
      for (var q = 0; q < Math.min(3, tk.left); q++) b.rect(tx + 1 + q * 2 + (q > 0 ? q : 0), 8, 1, 3, '#3a2401');
    }
    b.outline(0.5);
  });
}
function railSpr(len) {
  return spr('lkrail|' + len + '|' + G().K, 0, 0, function (b) {
    var n = Math.max(1, Math.round(len / 0.55)), i;
    for (i = 0; i < n * 3; i++) { var qx = len * (i + 0.5) / (n * 3); vl(b, qx, 0, 1, 8.5, '#d8d2c4', 1); }
    hl(b, 0, 0, len, 0, 1.5, '#b8b0a0');
    for (i = 0; i <= n; i++) { var px0 = len * i / n; box(b, px0 - 0.05, -0.05, 0.1, 0.1, 0, 9.5, '#f4f0e6', '#d8d2c4', '#b8b0a0'); box(b, px0 - 0.06, -0.06, 0.12, 0.12, 9.5, 10.5, TURQ, TURQ, TURQD, { norim: true }); }
    hl(b, 0, 0, len, 0, 8.6, '#a8a090'); hl(b, 0, 0, len, 0, 9.1, '#f4f0e6'); hl(b, 0, 0, len, 0, 9.6, '#ffffff');
    b.outline(0.5);
  });
}
function umbSpr() {
  return L.sprite('lkumb|' + G().K, function (b) {                     /* çapa: direğin tepesi */
    var rx = 19, ry = 8;
    for (var y = -ry; y <= 3; y++) for (var x = -rx; x <= rx; x++) {
      var nx = x / rx, ny = y / ry; if (y <= 0 && nx * nx + ny * ny > 1) continue;
      if (y > 0) { var lip = Math.abs(nx) <= 1 && y <= 1 + ((((x + 40) % 9) < 5) ? 1 : 0); if (!lip) continue; }
      var sector = Math.floor((Math.atan2(y - 2, x) + Math.PI) / (Math.PI / 6)) & 1;
      var c = sector ? '#f4f1ea' : '#c0503a', l = nx * 0.6 + ny * 0.8;
      if (l < -0.6) c = lite(c, 0.2); else if (l > 0.35 || y > 0) c = dark(c, 0.18);
      b.set(x, y, c);
    }
    b.rect(-1, -ry - 3, 3, 3, '#7d5a3a');
    b.outline(0.55);
  });
}
function umbSpr2() {
  return L.sprite('lkumb2|' + G().K, function (b) {                    /* çapa: direğin tepesi (z 46); sekiz dilimli kırmızı-krem, fistolu etek */
    var rx = 21, ry = 8;
    for (var y = -ry; y <= 2; y++) for (var x = -rx; x <= rx; x++) {
      var nx = x / rx, ny = y / ry; if (y <= 0 && nx * nx + ny * ny > 1) continue;
      if (y > 0) { if (Math.abs(nx) > 1 || y > 1 + ((((x + 40) % 8) < 4) ? 1 : 0)) continue; }
      var sector = Math.floor((Math.atan2(y - 3, x) + Math.PI) / (Math.PI / 5)) & 1;
      var c = sector ? '#f4f1ea' : '#c0503a', l = nx * 0.6 + ny * 0.8;
      if (l < -0.55) c = lite(c, 0.2); else if (l > 0.35 || y > 0) c = dark(c, 0.16);
      b.set(x, y, c);
    }
    b.rect(-1, -ry - 3, 3, 3, '#7d5a3a'); b.set(0, -ry - 4, '#c9952f');
    b.outline(0.55);
  });
}
function sazSpr(bare) {
  return spr('lksaz|' + (bare ? 1 : 0) + '|' + G().K, 0, 0, function (b) {
    quadW(b, -0.5, -0.5, 1.0, 1.0, 0.1, function (X, Y) {             /* kilim: göbek motifli */
      var u = (X - Y * 2), v = (X + Y * 2), dd = Math.abs(u % 24) / 24, e = Math.abs(v % 20) / 20;
      var m = Math.abs(dd - 0.5) + Math.abs(e - 0.5);
      return m < 0.18 ? '#2a4c7d' : m < 0.3 ? '#f1e6cc' : m < 0.45 ? '#c9952f' : '#7a1f2b';
    });
    box(b, -0.36, -0.18, 0.72, 0.5, 0, 3.5, function (u, v) { return (u < 0.6 || v < 0.6) ? '#c8434b' : '#a8323a'; }, '#8a2a33', '#6f1f28');
    box(b, -0.36, -0.36, 0.72, 0.16, 0, 8, '#c8434b', '#8a2a33', '#6f1f28');
    if (bare) { b.outline(0.55); return; }                           /* sazcı varken saz onun kucağında (sazciSpr) */
    var X = R(fx(0.32, -0.1)), Y = R(fy(0.32, -0.1, 3.5));             /* bağlama: gövde + uzun sap */
    for (var j = 0; j < 12; j++) { var hw = R(5 * Math.sin(j / 11 * Math.PI) + 1); b.rect(X - hw, Y - 12 + j, hw * 2 + 1, 1, j < 4 ? '#a8743f' : '#8a5a34'); }
    b.rect(X - 1, Y - 9, 3, 3, '#3a2410'); b.rect(X - 3, Y - 2, 7, 1, '#5d3c1c');
    line(b, X, Y - 12, X + 3, Y - 52, '#5d3c1c'); line(b, X + 1, Y - 12, X + 4, Y - 52, '#7a5230');
    b.rect(X + 2, Y - 58, 4, 6, '#3a2410'); b.set(X + 1, Y - 56, '#e8e2d2'); b.set(X + 6, Y - 55, '#e8e2d2');
    line(b, X + 1, Y - 6, X + 4, Y - 52, '#e8e2d2');
    b.outline(0.55);
  });
}
/* v2.23 sazcı: minderde bağdaş kurmuş, yelekli + kasketli; bağlamanın sapı çapraz (gövde sağ dizinde, sap sol omzunun üstüne).
   play: tezene eli f 0–2 (3 kare), kafa hb -1/0/1 sallanır; !play: saz kucakta yatık, eller üstünde, gözler kapalı (dinlenir).
   Çapa saz köşesinin merkezi; çizim ayak izi (±0,45 karo) içinde kalır. */
function sazciSpr(play, f, hb) {
  return spr('lksazci|' + (play ? 1 : 0) + '|' + f + '|' + hb + '|' + G().K, 0, 0, function (b) {
    var X0 = R(fx(0, 0.06)), Y0 = R(fy(0, 0.06, 3.5)), i;
    var skin = '#d9a066', skS = '#b07a48', skD = '#8a5a34';
    var pant = '#34303a', pantL = '#4a4552', vest = '#7a1f2b', vestL = '#9a3040', vestD = '#5a1420', gold = '#d9a441', shirt = '#efe6d0', shirtD = '#cfc4aa';
    var cap = '#5a4c3e', capL = '#7a6a56', capD = '#3e3328', hair = '#3a3030', must = '#2a1c14';
    /* bağdaş: geniş, alçak; dizler iki yanda, ayaklar önde çapraz */
    b.ellipse(X0, Y0 - 2, 10, 3, pant); b.rect(X0 - 9, Y0 - 4, 18, 1, pantL);
    b.ellipse(X0 - 7, Y0 - 2, 3, 2, pantL); b.ellipse(X0 + 7, Y0 - 2, 3, 2, pant); b.set(X0 - 8, Y0 - 3, '#5a5462');
    b.rect(X0 - 4, Y0, 3, 2, '#2a1c12'); b.rect(X0 + 1, Y0 - 1, 3, 2, '#2a1c12'); b.set(X0 - 4, Y0, '#4a3220'); b.set(X0 + 1, Y0 - 1, '#4a3220');
    /* gövde: gömlek + yelek (altın şerit), mavi kuşak */
    b.rect(X0 - 6, Y0 - 18, 12, 14, shirt); b.rect(X0 + 3, Y0 - 18, 3, 14, shirtD);
    b.rect(X0 - 6, Y0 - 17, 4, 13, vest); b.rect(X0 + 2, Y0 - 17, 4, 13, vestD); b.rect(X0 - 6, Y0 - 17, 1, 13, vestL);
    b.rect(X0 - 2, Y0 - 17, 1, 13, gold); b.rect(X0 + 1, Y0 - 17, 1, 13, gold);
    b.rect(X0 - 6, Y0 - 6, 12, 2, '#2a4c7d'); b.rect(X0 - 6, Y0 - 6, 12, 1, '#3a6aa0');
    b.rect(X0 - 7, Y0 - 18, 14, 2, vest); b.rect(X0 - 1, Y0 - 18, 2, 3, shirt);
    /* kafa */
    var hx = X0 + hb, hy = Y0 - 20 + (hb ? 0 : 0);
    b.rect(hx - 1, hy, 2, 2, skS);
    b.rect(hx - 5, hy - 10, 10, 10, skin); b.rect(hx - 4, hy, 8, 1, skin); b.rect(hx + 3, hy - 10, 2, 10, skS); b.rect(hx - 5, hy - 10, 1, 9, '#e8b880');
    b.rect(hx - 6, hy - 7, 1, 3, skS); b.rect(hx + 5, hy - 7, 1, 3, skD);
    b.rect(hx - 5, hy - 8, 1, 4, hair); b.rect(hx + 4, hy - 8, 1, 4, hair);
    if (play) { b.set(hx - 3, hy - 6, '#1e140e'); b.set(hx + 1, hy - 6, '#1e140e'); b.set(hx - 3, hy - 7, '#3a2618'); b.set(hx + 1, hy - 7, '#3a2618'); }
    else { b.rect(hx - 3, hy - 6, 2, 1, '#5a3a22'); b.rect(hx + 1, hy - 6, 2, 1, '#5a3a22'); }
    b.set(hx - 1, hy - 5, skS);
    b.rect(hx - 4, hy - 3, 8, 1, must); b.rect(hx - 4, hy - 2, 1, 1, must); b.rect(hx + 3, hy - 2, 1, 1, must); b.set(hx, hy - 3, '#4a3020');
    /* kasket: tepe + yöne bakan siperlik */
    b.rect(hx - 6, hy - 13, 12, 4, cap); b.rect(hx - 5, hy - 14, 10, 1, capL); b.rect(hx - 6, hy - 13, 12, 1, capL); b.rect(hx + 3, hy - 13, 3, 4, capD);
    b.rect(hx - 6, hy - 10, 13, 1, capD); b.rect(hx - 4, hy - 9, 8, 1, '#2a2218');
    for (i = -5; i < 5; i += 3) b.set(hx + i, hy - 12, capD);
    /* bağlama: tekne (gövde) + çapraz sap + burgular */
    var bx, by, ex, ey;
    if (play) { bx = X0 - 7; by = Y0 - 8; ex = X0 + 16; ey = Y0 - 34; }
    else { bx = X0 - 8; by = Y0 - 6; ex = X0 + 18; ey = Y0 - 17; }
    line(b, bx + 2, by - 2, ex, ey, '#5d3c1c'); line(b, bx + 3, by - 2, ex + 1, ey, '#7a5230'); line(b, bx + 3, by - 3, ex, ey - 1, '#e8e2d2');
    var dx = ex - bx, dy = ey - by, nl = Math.sqrt(dx * dx + dy * dy), ux = dx / nl, uy = dy / nl;
    for (i = 0; i < 4; i++) b.set(R(bx + 2 + dx * (0.35 + i * 0.12)), R(by - 2 + dy * (0.35 + i * 0.12)) + 1, '#c9b48a');   /* perdeler */
    var hX = R(ex + ux * 3), hY = R(ey + uy * 3);
    b.rect(hX - 1, hY - 1, 3, 3, '#3a2410'); b.set(hX - 2, hY, '#f0ead8'); b.set(hX + 2, hY - 1, '#f0ead8'); b.set(hX, hY + 2, '#f0ead8');
    b.ellipse(bx, by, 6, 4, '#8a5a34'); b.ellipse(bx - 1, by - 1, 5, 3, '#a8743f'); b.ellipse(bx - 2, by - 2, 2, 1, '#c99358');
    b.rect(bx + 1, by - 2, 2, 2, '#3a2410'); b.rect(bx - 4, by + 1, 6, 1, '#5d3c1c');
    /* kollar: sol (ekranda sağ) sapı tutar; sağ (ekranda sol) tezene vurur */
    var fxp = R(bx + dx * 0.62), fyp = R(by + dy * 0.62);
    line(b, X0 + 5, Y0 - 16, fxp - 1, fyp + 2, shirtD); line(b, X0 + 6, Y0 - 15, fxp, fyp + 3, shirt); line(b, X0 + 5, Y0 - 15, fxp - 1, fyp + 3, vestD);
    b.rect(fxp - 1, fyp - 1, 3, 3, skin); b.set(fxp + 1, fyp + 1, skS);
    var tx = play ? bx + 3 + [0, 1, 0][f] : bx + 2, ty = play ? by - 2 + [-2, 0, 2][f] : by - 3;
    line(b, X0 - 6, Y0 - 16, tx - 1, ty - 1, vest); line(b, X0 - 5, Y0 - 16, tx, ty - 1, vestL);
    b.rect(tx - 1, ty - 1, 3, 3, skin); b.set(tx - 1, ty - 1, '#e8b880'); b.set(tx + 1, ty + 1, skS);
    if (play) b.set(tx + 2, ty + (f === 1 ? 0 : 1), '#f0d880');
    b.outline(0.55);
  });
}
/* ---- v2.22 kademeli sabit eşya ---- */
/* dolap o.tier: 1 buzluk (12) · 2 çift kapılı dolap (24) · 3 soğuk oda kapısı (36); rows = dolu raf sayısı */
var DOLH = [19, 27, 34];
function dolapSpr(tier, rows) {
  tier = clamp(tier | 0, 1, 3);
  return spr('lkdol3|' + tier + '|' + rows + '|' + G().K, 0, 0, function (b) {
    var k, s;
    if (tier === 1) {                                                /* buzluk: beyaz sandık, turkuaz kuşak, açık kapak, buz üstünde fileto */
      wall(b, -0.42, -0.31, 0.42, -0.31, 10, 19, function (X, Y) { return (Y & 7) === 0 ? '#9fc4d4' : '#dceef4'; });   /* kapak iç yüzü (arkada dik) */
      hl(b, -0.42, -0.31, 0.42, -0.31, 19, '#2a95c4');
      box(b, -0.42, -0.3, 0.84, 0.66, 0, 10, '#f4fbff',
        function (u, z) { if (z < 1.2) return '#5a6a74'; if (z > 5.4 && z < 7.2) return z > 6.6 ? '#5ab0d4' : TURQ; if (z > 8.8) return '#ffffff'; if (u > 8.5 && u < 10.5 && z > 3 && z < 4.6) return '#4a5a64'; return hash(R(u * 2), R(z)) > 0.94 ? '#e8f0f4' : '#eef5f8'; },
        function (v, z) { if (z < 1.2) return '#46525c'; if (z > 5.4 && z < 7.2) return TURQD; return '#c4d6de'; });
      quadW(b, -0.36, -0.24, 0.72, 0.54, 10.05, function (X, Y) { var h2 = hash(X >> 1, Y); return h2 > 0.8 ? '#ffffff' : h2 > 0.4 ? '#d8eef6' : '#b8dcea'; });
      for (k = 0; k < Math.min(rows, 2); k++) for (s = -0.26; s < 0.3; s += 0.17) { var X0 = R(fx(s, -0.12 + k * 0.24)), Y0 = R(fy(s, -0.12 + k * 0.24, 10.5)); filetoMini(b, X0, Y0 - 1, (R(s * 10 + k) & 1) ? '#f0a090' : '#e88a6a'); }
    } else if (tier === 2) {                                         /* çift kapılı dolap */
      var hz = 27, nr = 4, y1 = 0.4;
      box(b, -0.45, -0.4, 0.9, 0.8, 0, hz, function (u, v) { return (u < 0.7 || v < 0.7) ? '#f4fbff' : (((R(u) + R(v * 2)) % 7) ? '#c9d6de' : '#9fb0bd'); },
        function (u, z) { return z < 1.5 ? '#5a6a74' : (hash(R(u * 2), R(z)) > 0.93 ? '#e8f0f4' : '#d8e4ea'); }, function (v, z) { return z < 1.5 ? '#46525c' : '#a6bcc8'; });
      var zt = hz - 3, zb = 2.5, rowH = (zt - zb) / nr;
      [[-0.4, -0.02], [0.02, 0.4]].forEach(function (d) {
        wall(b, d[0], y1, d[1], y1, zb - 0.6, zt + 0.6, '#7d98a6');
        wall(b, d[0] + 0.03, y1, d[1] - 0.03, y1, zb, zt, function (X, Y) { return (hash(X >> 1, Y >> 2) > 0.85) ? '#9fd0e4' : '#6fa8c0'; });
        for (var r = 0; r < nr; r++) {
          var z0 = zb + r * rowH;
          hl(b, d[0] + 0.03, y1, d[1] - 0.03, y1, z0 + 0.3, '#e8f0f4');
          if (r < rows) for (var s2 = d[0] + 0.12; s2 < d[1] - 0.08; s2 += 0.16) filetoMini(b, R(fx(s2, y1)), R(fy(s2, y1, z0 + 2.2)), (R(s2 * 10) & 1) ? '#f0a090' : '#e88a6a');
        }
        vl(b, d[1] - 0.07, y1, zt - 6, zt - 2, '#4a5a64', 1);
      });
      for (var g = 0; g < 4; g++) hl(b, -0.35, y1, 0.35, y1, hz - 1 - g * 0.5, g & 1 ? '#5a6a74' : '#8a9aa4');
    } else {                                                         /* soğuk oda: paslanmaz panel duvar, ağır kapı, lombar, termometre, doluluk göstergesi */
      var H3 = 34;
      box(b, -0.3, -0.42, 0.6, 0.26, H3, H3 + 4, '#8d96a0', '#6d767e', '#5a636b', { norim: true });                                   /* soğutucu */
      box(b, -0.55, -0.45, 1.1, 0.9, 0, H3, function (u, v) { return (u < 0.7 || v < 0.7) ? '#eef2f4' : ((R(u) % 6) ? '#c9d0d6' : '#aab3ba'); },
        function (u, z) {
          if (z < 1.4) return '#4a535b';
          var du = u - 1.6, door = du > 0 && du < 8.6 && z < 28.5;
          if (door) {
            var e = Math.min(du, 8.6 - du, 28.5 - z, z - 1.4);
            if (e < 0.6) return '#3a434b';
            var pc = Math.hypot((du - 4.0) * 0.9, (z - 21) * 0.55);                                                                   /* lombar */
            if (pc < 2.0) return rows > 0 ? (pc < 1.4 ? ((R(du * 2 + z) & 1) ? '#f0a090' : '#e88a6a') : '#9fd0e4') : (pc < 1.4 ? '#24404e' : '#9fd0e4');
            if (pc < 2.5) return '#7d878e';
            if (du > 7.0 && du < 7.9 && z > 11 && z < 17) return du < 7.3 ? '#ffffff' : '#c9d0d6';                                       /* kol */
            if (z < 4 && hash(R(du * 3), R(z * 2)) > 0.6) return '#ffffff';                                                       /* kırağı */
            return (R(du) % 5 === 0) ? '#c4ccd2' : '#dce3e8';
          }
          if (u > 11 && u < 12.6 && z > 6 && z < 20) { var seg = Math.floor((z - 6) / 4.6), lz = (z - 6) % 4.6; if (lz < 0.8) return '#2e353b'; return seg < rows ? (seg === 0 ? '#5fd37a' : seg === 1 ? '#ffc94a' : '#ff8a5a') : '#3a434b'; }   /* doluluk */
          if (u > 10.6 && u < 13 && z > 24 && z < 29) return z > 25 && z < 28 && u > 11 && u < 12.6 ? '#1c2a1c' : '#4a535b';           /* termometre */
          return (R(u) % 4 === 0) ? '#b8c0c6' : '#cfd6db';
        },
        function (v, z) { return z < 1.4 ? '#3a434b' : ((R(v) % 4 === 0) ? '#8d969e' : '#a3acb3'); });
      pr(b, 0.4, 0.45, 26.5, -1, -2, 3, 1, '#7dff9a');
      for (k = 0; k < 6; k++) vl(b, -0.42 + k * 0.03, 0.46, 2, 29, k & 1 ? 'rgba(200,230,240,.5)' : 'rgba(160,200,215,.45)', 1);   /* şerit perde kenarı */
    }
    b.outline(0.55);
  });
}
/* meze vitrini o.tier: 1 tezgâh üstü cam kutu · 2 buzlu vitrin · 3 uzun teşhir tezgâhı */
/* v2.23 yeşillik mezeleri: tabak/kâse ince pikselde ~9×6. Yeşil ağırlıklı; domates, limon, pul biber, zeytinyağı renk verir.
   tür: 'roka' roka-semizotu salatası · 'borulce' deniz börülcesi · 'haydari' haydari (toprak kâse) · 'cacik' cacık (beyaz kâse)
        'fasulye' zeytinyağlı taze fasulye · 'sarma' zeytinyağlı yaprak sarma · 'ezme' acılı ezme */
var MZ_T = [['roka', 'haydari'], ['roka', 'borulce', 'cacik', 'fasulye'], ['roka', 'borulce', 'haydari', 'fasulye', 'sarma', 'ezme']];
var MZ_P = [[[0.12, -0.12], [-0.12, 0.12]],
  [[-0.18, -0.18], [0.2, -0.18], [-0.18, 0.2], [0.2, 0.2]],
  [[-0.44, -0.15], [0, -0.15], [0.44, -0.15], [-0.4, 0.17], [0.04, 0.17], [0.48, 0.17]]];
function mezeDish(b, x, y, z, t) {
  var X = R(fx(x, y)), Y = R(fy(x, y, z)), i;
  function plate() { b.ellipse(X, Y, 5, 2, '#cfc6b4'); b.ellipse(X, Y - 1, 5, 2, '#f6f2e8'); b.rect(X - 3, Y - 2, 3, 1, '#ffffff'); }
  function bowl(c, cd) { b.ellipse(X, Y, 4, 2, cd); b.rect(X - 4, Y - 3, 9, 3, c); b.rect(X - 4, Y - 3, 2, 3, lite(c, 0.18)); b.rect(X + 2, Y - 3, 3, 3, cd); b.rect(X - 4, Y - 4, 9, 1, lite(c, 0.3)); }
  function pile(cols, pts) { pts.forEach(function (q, k) { b.set(X + q[0], Y + q[1], cols[(k * 3 + 1) % cols.length]); }); }
  if (t === 'roka') {                                                /* koyu roka + açık semizotu yaprakları, kırmızı domates, sarı limon */
    plate();
    b.ellipse(X, Y - 3, 4, 2, '#4f8a3c'); b.ellipse(X - 1, Y - 4, 2, 1, '#6aa84f');
    pile(['#3f7a32', '#6aa84f', '#8cc66a', '#5f9a46'], [[-4, -3], [-3, -5], [-2, -6], [0, -6], [1, -5], [2, -6], [3, -4], [4, -3], [-1, -5], [1, -3], [-2, -3], [3, -2], [0, -4]]);
    b.set(X, Y - 7, '#a8dc80'); b.set(X - 2, Y - 5, '#a8dc80');
    b.rect(X + 1, Y - 4, 2, 1, '#e0453a'); b.set(X + 1, Y - 5, '#ff7a6a'); b.set(X - 3, Y - 2, '#d8433a');
    b.rect(X + 3, Y - 2, 2, 1, '#f2d34a'); b.set(X + 4, Y - 3, '#fff08a');
  } else if (t === 'borulce') {                                     /* ince yeşil filizler dik demet, sarımsak beyazı, limon dilimi */
    plate();
    for (i = -4; i <= 3; i++) { var hgt = 3 + ((i + 6) % 3); b.rect(X + i, Y - 1 - hgt, 1, hgt, (i & 1) ? '#4f8a3c' : '#6aa84f'); b.set(X + i, Y - 1 - hgt, '#9ad070'); }
    b.set(X - 1, Y - 2, '#f4f0d8'); b.set(X + 2, Y - 3, '#f4f0d8');
    b.rect(X + 3, Y - 2, 2, 2, '#f2d34a'); b.set(X + 4, Y - 2, '#fff08a');
  } else if (t === 'haydari') {                                     /* toprak kâse, süzme yoğurt, dereotu, pul biber */
    bowl('#c07040', '#8a4a26');
    b.ellipse(X, Y - 4, 3, 1, '#f6f2e2'); b.rect(X - 1, Y - 6, 3, 1, '#ffffff');
    b.set(X - 2, Y - 4, '#5f9a46'); b.set(X + 1, Y - 5, '#4f8a3c'); b.set(X - 1, Y - 5, '#6aa84f'); b.set(X + 2, Y - 4, '#5f9a46'); b.set(X, Y - 4, '#c0402a'); b.set(X + 1, Y - 3, '#d84a30');
  } else if (t === 'cacik') {                                       /* beyaz kâse, açık yeşil cacık, zeytinyağı damlası */
    bowl('#eef2f4', '#a8b8c0');
    b.ellipse(X, Y - 4, 3, 1, '#cfe8b8'); b.rect(X - 1, Y - 5, 3, 1, '#e6f4d8');
    b.set(X - 2, Y - 4, '#4f8a3c'); b.set(X + 1, Y - 5, '#5f9a46'); b.set(X + 2, Y - 4, '#6aa84f'); b.set(X - 1, Y - 3, '#5f9a46'); b.set(X, Y - 4, '#e0b840');
  } else if (t === 'fasulye') {                                     /* yatık taze fasulye, domates sosu, havuç, yağ parlaması */
    plate();
    b.ellipse(X, Y - 2, 4, 1, '#c8603a');
    b.rect(X - 4, Y - 3, 6, 1, '#4f8a3c'); b.rect(X - 2, Y - 4, 6, 1, '#6aa84f'); b.rect(X - 3, Y - 5, 5, 1, '#5f9a46'); b.rect(X - 1, Y - 6, 3, 1, '#7fbf5a');
    b.set(X + 1, Y - 6, '#a8dc80'); b.set(X + 3, Y - 3, '#e07a3a'); b.set(X - 3, Y - 4, '#e8843a'); b.set(X + 2, Y - 5, '#fff2a0');
  } else if (t === 'sarma') {                                       /* koyu yeşil yaprak sarmalar, limon */
    plate();
    [[-4, -3], [-1, -3], [-3, -5], [0, -5], [2, -4]].forEach(function (q) { b.rect(X + q[0], Y + q[1], 3, 2, '#3f6a2e'); b.rect(X + q[0], Y + q[1], 3, 1, '#6a9a48'); b.set(X + q[0] + 2, Y + q[1] + 1, '#2a4a1e'); });
    b.rect(X + 3, Y - 2, 2, 2, '#f2d34a'); b.set(X + 4, Y - 2, '#fff08a');
  } else {                                                          /* acılı ezme: kırmızı, maydanoz */
    bowl('#eef2f4', '#a8b8c0');
    b.ellipse(X, Y - 4, 3, 1, '#c8402e'); b.rect(X - 1, Y - 5, 3, 1, '#e0583e');
    b.set(X - 1, Y - 5, '#6aa84f'); b.set(X + 2, Y - 4, '#4f8a3c'); b.set(X, Y - 4, '#f08a5a'); b.set(X - 2, Y - 3, '#a83020');
  }
}
function mezeFill(b, tier, z) { var T3 = MZ_T[tier - 1], P0 = MZ_P[tier - 1]; for (var k = 0; k < T3.length; k++) mezeDish(b, P0[k][0], P0[k][1], z, T3[k]); }
/* cam: ayrı tamponda çizilip saydam basılır (içindeki mezeler cam arkasından görünür; düz rgba piksel içeriği silerdi) */
function glassBox(b, x0, y0, w, d, z0, z1) {
  var g = L.buf(), s = L.buf();
  box(g, x0, y0, w, d, z0, z1, '#d8f0fa', '#b4dcec', '#98c4d8', { norim: true });
  box(s, x0, y0, w, d, z0, z1, function () { return null; }, function (u, z) { return (u + z) % 10 < 1.2 ? '#ffffff' : null; }, function () { return null; }, { norim: true });
  b.put(g, 0, 0, 0.2); b.put(s, 0, 0, 0.55);
  hl(b, x0, y0 + d, x0 + w, y0 + d, z1, '#c9952f'); hl(b, x0 + w, y0, x0 + w, y0 + d, z1, '#a8842a');
  vl(b, x0, y0 + d, z0, z1, '#c9952f', 1); vl(b, x0 + w, y0 + d, z0, z1, '#c9952f', 1); vl(b, x0 + w, y0, z0, z1, '#a8842a', 1);
}
function mezeVitSpr(tier) {
  tier = clamp(tier | 0, 1, 3);
  return spr('lkmzv4|' + tier + '|' + G().K, 0, 0, function (b) {
    var k;
    if (tier === 1) {
      box(b, -0.32, -0.28, 0.64, 0.56, 0, 9, '#b07a4a', K.woodV('#8a5a34', 4), '#6f4526');
      vl(b, -0.28, 0.26, 0, 2, '#4a2f1c', 2); vl(b, 0.26, 0.26, 0, 2, '#4a2f1c', 2);
      box(b, -0.24, -0.2, 0.48, 0.4, 9, 9.6, '#f4f0e6', '#d8d2c4', '#c8c2b4', { norim: true });
      mezeFill(b, 1, 9.6);
      glassBox(b, -0.24, -0.2, 0.48, 0.4, 9.6, 15);
    } else if (tier === 2) {
      box(b, -0.4, -0.4, 0.8, 0.8, 0, 9, '#b07a4a', function (u, z) { return (z > 2 && z < 7 && u > 1.2 && u < 8.4) ? '#9a6236' : '#6f4526'; }, '#8a5a34');
      quadW(b, -0.36, -0.36, 0.72, 0.72, 9.6, function (X, Y) { var h2 = hash(X >> 1, Y); return h2 > 0.75 ? '#ffffff' : '#cfe8f2'; });       /* buz */
      mezeFill(b, 2, 9.8);
      glassBox(b, -0.4, -0.4, 0.8, 0.8, 9, 20);
      poly(b, [P3(-0.46, 0.4, 24), P3(0.46, 0.4, 24), P3(0.46, 0.58, 21), P3(-0.46, 0.58, 21)], function (X, Y) { return (((X - Y * 2) >> 2) & 1) ? '#f4f1ea' : '#c0503a'; });
      vl(b, -0.44, 0.58, 9, 21, '#6f4526', 1); vl(b, 0.44, 0.58, 9, 21, '#5a3a20', 1);
    } else {                                                         /* uzun teşhir tezgâhı: çini önlü ahşap gövde, boydan cam, iki sıra tabak, çizgili saçak */
      var cf = ciniH(9, '#ece3cc', '#c0503a');
      box(b, -0.68, -0.36, 1.36, 0.72, 0, 9, '#b07a4a', function (u, z) { return z > 7.8 ? '#8a5a34' : cf(u, z); }, darkF(cf, 0.18));
      quadW(b, -0.64, -0.32, 1.28, 0.64, 9.6, function (X, Y) { var h2 = hash(X >> 1, Y); return h2 > 0.75 ? '#ffffff' : '#cfe8f2'; });
      mezeFill(b, 3, 9.8);
      glassBox(b, -0.68, -0.36, 1.36, 0.72, 9, 19);
      vl(b, -0.66, 0.6, 0, 25, '#6f4526', 2); vl(b, 0.66, 0.6, 0, 25, '#5a3a20', 2);
      poly(b, [P3(-0.74, 0.36, 27), P3(0.74, 0.36, 27), P3(0.74, 0.62, 24), P3(-0.74, 0.62, 24)], function (X, Y) { return (((X - Y * 2) >> 2) & 1) ? '#f4f1ea' : '#2a95c4'; });
      for (k = -0.7; k <= 0.7; k += 0.14) pr(b, k, 0.62, 24, -1, 0, 2, 1.5, '#1d7aa8');
    }
    b.outline(0.55);
  });
}
/* menü tabelası o.tier: 1 kara tahta · 2 boyalı ahşap pano · 3 fenerli büyük pano */
function boardSpr(tier, lv, menu) {
  tier = clamp(tier | 0, 1, 3);
  return spr('lkbrd3|' + tier + '|' + lv + '|' + menu.join(',') + '|' + G().K, 0, 0, function (b) {
    var X = R(fx(0, 0)), Y = R(fy(0, 0, 0)), i, w, top, bot, bg, ink, dim;
    if (tier === 1) {
      w = 13; top = Y - 62; bot = Y - 26; bg = '#26332e'; ink = '#e8e2d2'; dim = '#566660';
      line(b, X - 12, Y, X - 9, top + 4, '#5a3a20'); line(b, X - 11, Y, X - 8, top + 4, '#7a5230');
      line(b, X + 12, Y, X + 9, top + 4, '#5a3a20'); line(b, X + 13, Y, X + 10, top + 4, '#4a2f1c');
      line(b, X - 4, Y, X - 2, top + 8, '#3a2414');
      b.rect(X - w - 2, top - 2, 2 * w + 4, bot - top + 4, '#8a5a32'); b.rect(X - w - 2, top - 2, 2 * w + 4, 1, '#b07a48'); b.rect(X - w - 2, bot + 1, 2 * w + 4, 1, '#5a3a20');
      for (var y = top; y <= bot; y++) for (var x = -w; x <= w; x++) b.set(X + x, y, hash(x, y) > 0.94 ? '#3c4a44' : bg);
      b.rect(X - 6, top + 2, 12, 1, ink);
    } else if (tier === 2) {                                         /* turkuaz çerçeveli krem pano, iki direk, başlıkta boyalı hamsi */
      w = 15; top = Y - 66; bot = Y - 28; ink = '#1f3e58'; dim = '#b8ae98';
      [X - 13, X + 11].forEach(function (px0) { b.rect(px0, top, 3, Y - top, '#7a4e2a'); b.rect(px0, top, 1, Y - top, '#a87444'); b.rect(px0 + 2, top, 1, Y - top, '#5a3a20'); b.rect(px0 - 1, Y - 3, 5, 3, '#5a3a20'); });
      for (var cr = 0; cr < 5; cr++) { var chw = R(10 * Math.sqrt(1 - Math.pow((4 - cr) / 5, 2))); b.rect(X - chw, top - 8 + cr, chw * 2 + 1, 1, cr === 0 ? '#1d6a94' : '#2a95c4'); }   /* kemerli tepelik */
      b.rect(X - w - 3, top - 3, 2 * w + 6, bot - top + 6, '#1d6a94'); b.rect(X - w - 2, top - 2, 2 * w + 4, bot - top + 4, '#2a95c4');
      for (var y2 = top; y2 <= bot; y2++) for (var x2 = -w; x2 <= w; x2++) b.set(X + x2, y2, ((y2 - top) % 7 === 6) ? '#e6dcc4' : (hash(x2, y2) > 0.95 ? '#e8dfc8' : '#f2ead6'));
      b.rect(X - 6, top + 2, 11, 3, '#9fb3c2'); b.rect(X - 6, top + 2, 11, 1, '#d0dde6'); b.rect(X + 5, top + 1, 3, 5, '#7d93a3'); b.set(X - 4, top + 3, '#16222b');   /* hamsi */
      for (i = 0; i < 3; i++) { b.set(X - w + 1 + i * 2, top, '#e5533d'); b.set(X + w - 1 - i * 2, top, '#e5533d'); }
    } else {                                                         /* büyük pano: kiremit başlık, altın çerçeve, koyu ceviz zemin, iki yanda fener */
      w = 18; top = Y - 72; bot = Y - 30; ink = '#ffe9b0'; dim = '#6a5038';
      [X - 15, X + 13].forEach(function (px0) { b.rect(px0, top, 3, Y - top, '#5a3a20'); b.rect(px0, top, 1, Y - top, '#8a5a32'); b.rect(px0 - 1, Y - 4, 5, 4, '#bdb5a2'); });
      b.rect(X - w - 3, top - 3, 2 * w + 6, bot - top + 6, '#8a6420'); b.rect(X - w - 2, top - 2, 2 * w + 4, bot - top + 4, '#e6be59');
      for (var y3 = top; y3 <= bot; y3++) for (var x3 = -w; x3 <= w; x3++) b.set(X + x3, y3, ((x3 + 40) % 9 === 0) ? '#3a2416' : '#4a2f1c');
      for (i = 0; i < 7; i++) { var hw = w + 6 - i; b.rect(X - hw, top - 4 - i, hw * 2 + 1, 1, i === 0 ? '#7d2c1d' : (i & 1 ? '#c0503a' : '#a9452f')); }   /* kiremit başlık */
      b.rect(X - 7, top + 2, 14, 1, '#e6be59'); b.set(X, top + 1, '#fff0a0');
      [[X - w - 9, X - w - 3], [X + w + 3, X + w + 9]].forEach(function (p, k) {                                            /* fener + kol */
        var lx = k ? p[1] - 2 : p[0] + 2; b.rect(p[0], top + 6, 6, 1, '#2e2e32'); b.rect(lx, top + 7, 1, 2, '#2e2e32');
        b.rect(lx - 2, top + 9, 5, 1, '#3a2a1c'); b.rect(lx - 2, top + 10, 5, 7, '#2e2e32'); b.rect(lx - 1, top + 11, 3, 5, '#e8c86a'); b.set(lx - 1, top + 11, '#fff2c4'); b.rect(lx - 1, top + 17, 3, 1, '#3a2a1c');
      });
    }
    for (i = 0; i < 5; i++) {                                        /* menü satırları: yemek simgesi + çizgi + fiyat noktası */
      var ry = top + 6 + i * ((bot - top - 6) / 5.2) | 0, on = i < lv, d = menu[i];
      if (on && d) {
        var c = dcol(d);
        b.ellipse(X - w + 5, ry + 1, 3, 1, '#f4f0e6'); b.rect(X - w + 3, ry, 4, 1, c); b.set(X - w + 4, ry - 1, lite(c, 0.3));
        b.rect(X - w + 10, ry, 2 * w - 18, 1, ink); b.rect(X + w - 5, ry, 3, 1, tier === 1 ? '#ffd23a' : tier === 2 ? '#c0503a' : '#ffd23a');
      } else if (on) b.rect(X - w + 3, ry, 2 * w - 8, 1, dim);
      else for (var q = 0; q < 2 * w - 8; q += 3) b.set(X - w + 3 + q, ry, dim);
    }
    b.outline(0.55);
  });
}
var BOARDZ = [38, 41, 45];
/* masa şemsiyesi: kademe 3 kırmızı-krem, kademe 4 keten + lacivert fistolu etek, püsküller */
function umbSpr4() {
  return L.sprite('lkumb4|' + G().K, function (b) {
    var rx = 22, ry = 8;
    for (var y = -ry; y <= 3; y++) for (var x = -rx; x <= rx; x++) {
      var nx = x / rx, ny = y / ry; if (y <= 0 && nx * nx + ny * ny > 1) continue;
      if (y > 0) { if (Math.abs(nx) > 1 || y > 1 + ((((x + 44) % 8) < 4) ? 2 : 0)) continue; }
      var c = y > 0 ? '#22406a' : '#f1ead8', l = nx * 0.6 + ny * 0.8;
      if (y <= 0 && Math.abs(nx * nx + ny * ny - 0.98) < 0.1) c = '#22406a';
      if (l < -0.55) c = lite(c, 0.15); else if (l > 0.35) c = dark(c, 0.14);
      b.set(x, y, c);
    }
    for (var k = -rx + 3; k < rx; k += 8) { b.set(k, 5, '#c9952f'); b.set(k, 6, '#e6be59'); }
    b.rect(-1, -ry - 3, 3, 3, '#5a3a20'); b.set(0, -ry - 4, BRASSL);
    b.outline(0.55);
  });
}
/* giriş kapısı o.tier: 1 taş direkli sade giriş · 2 ahşap kemer + fener · 3 begonvilli büyük kemer */
function bloom(b, X, Y, v) { var c = ['#d0307a', '#e04a90', '#b02060', '#f070b0'][v & 3]; b.rect(X - 1, Y, 3, 2, c); b.set(X, Y - 1, c); b.set(X - 1, Y, lite(c, 0.3)); }
function gateSpr(x, y, tier) {
  tier = clamp(tier | 0 || 2, 1, 3);
  return spr('lkGT3|' + x + ',' + y + '|' + tier + '|' + G().K, x, y, function (b) {
    var g0 = y - 0.55, g1 = y + 0.55, gx = x, k;
    if (tier === 1) {
      pillar(b, gx, g0 - 0.02, 15); pillar(b, gx, g1 + 0.02, 15);
      [g0 - 0.02, g1 + 0.02].forEach(function (py) { var X = R(fx(gx, py)), Y = R(fy(gx, py, 17)); b.ellipse(X, Y - 1, 3, 2, '#e8e1d0'); b.set(X - 1, Y - 2, '#fffaf0'); });   /* yuvarlak kapak taşı */
    } else if (tier === 2) {
      pillar(b, gx, g0 - 0.02, 22);
      box(b, gx - 0.07, g0 - 0.1, 0.14, g1 - g0 + 0.2, 24, 28, '#a87444', K.woodV('#7a4e2a', 4), '#5a3a22', { norim: true });
      pillar(b, gx, g1 + 0.02, 22);
      for (k = 0; k < 5; k++) { var yy = k < 3 ? g0 - 0.05 + k * 0.14 : g1 + 0.05 - (k - 3) * 0.16; leaf(b, R(fx(gx, yy)) + (k & 1 ? 2 : -2), R(fy(gx, yy, 28)) - 1 + (k % 3), k % 3); }
      b.rect(R(fx(gx, g1 + 0.05)) - 1, R(fy(gx, g1 + 0.05, 24)), 1, 10, '#4f7a3a'); b.rect(R(fx(gx, g0 - 0.05)), R(fy(gx, g0 - 0.05, 24)), 1, 8, '#4f7a3a');
      var lx = R(fx(gx, y)), ly = R(fy(gx, y, 24));
      b.rect(lx, ly, 1, 4, '#2e2e32'); b.rect(lx - 2, ly + 4, 5, 1, '#2e2e32'); b.rect(lx - 2, ly + 5, 5, 6, '#3a3a40'); b.rect(lx - 1, ly + 6, 3, 4, '#d8c890'); b.rect(lx - 2, ly + 11, 5, 1, '#2e2e32');
    } else {                                                         /* büyük kemer: yüksek payeler, kavisli ahşap kemer, begonvil */
      pillar(b, gx, g0 - 0.08, 26);
      var N = 14, prev = null;
      for (k = 0; k <= N; k++) { var u = k / N, py = g0 - 0.08 + (g1 - g0 + 0.16) * u, za = 28 + Math.sin(Math.PI * u) * 9; box(b, gx - 0.08, py - 0.045, 0.16, 0.09, za, za + 3.5, '#a87444', '#7a4e2a', '#5a3a22', { norim: true }); prev = [py, za]; }
      pillar(b, gx, g1 + 0.08, 26);
      for (k = 0; k < 26; k++) {                                     /* begonvil: kemer boyunca ve payelerden sarkan */
        var u2 = (k * 0.618) % 1, py2 = g0 - 0.1 + (g1 - g0 + 0.2) * u2, za2 = 30 + Math.sin(Math.PI * u2) * 9 + ((k * 7) % 5) - 1, X2 = R(fx(gx, py2)) + ((k * 5) % 7) - 3, Y2 = R(fy(gx, py2, za2));
        if (k % 3 === 0) leaf(b, X2, Y2, k % 3); else bloom(b, X2, Y2, k);
      }
      [g0 - 0.08, g1 + 0.08].forEach(function (py, s) { for (var j = 0; j < 6; j++) { var X3 = R(fx(gx, py)) + (j & 1 ? 3 : -3) + (s ? 1 : -1), Y3 = R(fy(gx, py, 26 - j * 3.5)); if (j % 2) leaf(b, X3, Y3, j % 3); else bloom(b, X3, Y3, j + s); } });
      [g0 + 0.12, g1 - 0.12].forEach(function (py) { var lx = R(fx(gx, py)), ly = R(fy(gx, py, 30)); b.rect(lx, ly, 1, 5, '#2e2e32'); b.rect(lx - 2, ly + 5, 5, 1, '#2e2e32'); b.rect(lx - 2, ly + 6, 5, 7, '#3a3a40'); b.rect(lx - 1, ly + 7, 3, 5, '#e8c86a'); b.set(lx - 1, ly + 7, '#fff2c4'); b.rect(lx - 2, ly + 13, 5, 1, '#2e2e32'); });
      void prev;
    }
    b.outline(0.55);
  });
}
/* v2.23 kapı levhası: ön direğe çivili, iki iple asılı ahşap levha (tezgâhların KAPALI levhasıyla aynı dil: koyu çerçeve, açık tahta, 3×5 piksel yazı).
   open: yeşil "AÇIK" · kapalı: kırmızımsı "KAPALI" (lkClosedB). Yazı ekrana düz (okunur); dil değişince anahtar değişir. */
function doorSignSpr(open) {
  var lang = G().v('lang') || 'tr', t = gf('T'), word = open ? (lang === 'tr' ? 'AÇIK' : 'OPEN') : ((t && t('lkClosedB')) || (lang === 'tr' ? 'KAPALI' : 'CLOSED'));
  word = String(word).toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-US');
  return L.sprite('lkdsign|' + (open ? 1 : 0) + '|' + word + '|' + G().K, function (b) {
    var tw = L.textW(word), w = Math.max(tw + 8, 20), hw = w >> 1, top = 0, h = 11;
    b.rect(-1, -9, 3, 3, '#4a3220'); b.set(0, -9, '#9a8a70');                                       /* çivi */
    line(b, 0, -8, -hw + 3, top, '#5a4028'); line(b, 0, -8, hw - 3, top, '#5a4028');             /* ip */
    b.rect(-hw - 1, top - 1, w + 2, h + 2, '#3a2a1c');
    b.rect(-hw, top, w, h, open ? '#d2ae6c' : '#c9a15e'); b.rect(-hw, top, w, 1, open ? '#ecd096' : '#e0bd80'); b.rect(-hw, top + h - 1, w, 1, '#a07a44');
    b.rect(-hw + 1, top + 4, w - 2, 1, open ? '#c8a462' : '#bd955a');
    var ink = open ? '#1f6a2a' : '#8a1f14';
    L.text(b, word, -Math.floor(tw / 2), top + 3, ink);
    if (open) { b.set(-hw + 2, top + 5, '#3fa04a'); b.set(hw - 3, top + 5, '#3fa04a'); }
    else { b.set(-hw + 2, top + 5, '#c0402a'); b.set(hw - 3, top + 5, '#c0402a'); }
    b.outline(0.55);
  });
}
function doorSign(x, y, tier, open) {
  var g0 = y - 0.55 - 0.02, sx2 = x + 0.16, z = [11, 15, 17][tier - 1];                            /* sağdaki (y küçük) direğin ön yüzü: soldaki menü panosunun arkasında kalır */
  L.blit(doorSignSpr(open), R(pX(sx2, g0)), R(pY(sx2, g0, z)));
}
function gateLamp(x, y, night, tier) {
  if (!night || tier === 1) return;
  var pts = tier === 3 ? [[y - 0.43, 30], [y + 0.43, 30]] : [[y, 24]];
  pts.forEach(function (p) { var lx = R(pX(x, p[0])), ly = R(pY(x, p[0], p[1])); L.fr(lx, ly, -1, 7, 3, 5, '#ffd98f'); L.fr(lx, ly, -12, 0, 25, 24, 'rgba(255,214,140,.15)'); });
}
HKA.drawLokFix = function (o) {
  var x = o.x, y = o.y, t = o.t || T(), sx = R(pX(x, y)), k = o.k, i;
  if (k === 'dolap') {
    var dt = clamp(o.tier | 0 || (o.big ? 2 : 1), 1, 3), cap = Math.max(1, o.cap), nr = [2, 4, 3][dt - 1], rows = o.n > 0 ? Math.max(1, Math.ceil(o.n / cap * nr)) : 0;
    gf('shadow')(x, y, dt === 3 ? 1.0 : 0.8);
    at(dolapSpr(dt, rows), x, y, 0);
    var pct = o.n / cap, hz = DOLH[dt - 1], lc = pct > 0.7 ? '#5fd37a' : pct > 0.3 ? '#ffc94a' : '#e5533d';
    if (dt === 1) L.fr(R(pX(x - 0.3, y + 0.36)), R(pY(x - 0.3, y + 0.36, 9)), 0, 0, 3, 2, lc);
    else if (dt === 2) L.fr(R(pX(x - 0.3, y + 0.4)), R(pY(x - 0.3, y + 0.4, hz - 1.5)), 0, 0, 3, 2, lc);
    lbl(x, y, hz + 7, gf('T')('lkDolap') + ' ' + o.n + '/' + o.cap, '#bfe9ff', o.n + '/' + o.cap);
  } else if (k === 'pass') {
    gf('shadow')(x, y, 0.9);
    at(passSpr(), x, y, 0);
    var its = o.items || [], n = its.length;
    for (i = 0; i < Math.min(n, 12); i++) {                          /* üç düzenli yığın (4'er) */
      var pile = Math.floor(i / 4), lvl = i % 4, wx = x - 0.4 + pile * 0.4, wy = y;
      var it = its[i], s = it.k === 'dirty' ? K.dirtySpr() : K.plateSpr(it.d);
      L.blit(s, R(pX(wx, wy)), R(pY(wx, wy, 12 + lvl * 2.2)));
    }
    lampGlow(x, y);
    if (o.v2) {
      if (TK_STASH && TK_STASH.length) {                              /* sipariş fişleri pass'in ön yüzüne iğneli (aşçıların yüzünü örtmez, garson önünde durur) */
        L.blit(ticketSpr(TK_STASH), R(pX(x - 0.05, y + 0.42)), R(pY(x - 0.05, y + 0.42, 10.5)));
        if (TK_STASH.length > 5) gf('uiBadge')(x - 0.6, y + 0.4, 12, '+' + (TK_STASH.length - 5), '#ffe9b0');
      }
    }
    var cap2 = gv('LOK_PASSCAP') || 12;
    if (n >= cap2) gf('uiBadge')(x, y, 30, gf('T')('lkWPass'), '#ffb27a'); else if (n) gf('uiBadge')(x, y, 28, 'x' + n, '#fff3d0');
    lbl(x, y, 20, 'lkPass', '#ffe9b0', '');
  } else if (k === 'kasa') {
    gf('shadow')(x, y, 0.55);
    at(kasaSpr(), x, y, 0);
    lbl(x, y, 22, 'lkKasa', '#b7f7c7', '');
  } else if (k === 'sink') {
    gf('shadow')(x, y, 0.7);
    at(sinkSpr(), x, y, 0);
    var di = o.items || [];
    for (i = 0; i < Math.min(di.length, 8); i++) { var py0 = i < 4 ? -0.3 : 0.24, wx2 = x + 0.12, wy2 = y + py0; L.blit(K.dirtySpr(), R(pX(wx2, wy2)), R(pY(wx2, wy2, 8.5 + (i % 4) * 2))); }
    if (di.length) for (i = 0; i < 3; i++) { var q = (t * 0.8 + i * 0.33) % 1; L.fr(R(pX(x - 0.1, y - 0.25)), R(pY(x - 0.1, y - 0.25, 9)), -4 + i * 4, -R(q * 8), 2, 2, 'rgba(240,248,255,' + ((1 - q) * 0.8).toFixed(2) + ')'); }
    lbl(x, y, 20, gf('T')('lkSink') + (o.n ? ' ' + o.n : ''), '#cfe6f2', '');
  } else if (k === 'board') {
    gf('shadow')(x, y, 0.45);
    var bt = clamp(o.tier | 0 || 1, 1, 3);
    at(boardSpr(bt, o.lv | 0, (o.menu || []).slice(0, 5).map(function (d) { return d || ''; })), x, y, 0);
    if (bt === 3 && o.night) [-1, 1].forEach(function (s3) { var bx = R(pX(x, y)), by = R(pY(x, y, 0)); L.fr(bx, by, s3 * 25 - 7, -66, 15, 15, 'rgba(255,214,140,.18)'); L.fr(bx, by, s3 * 25 - 1, -61, 3, 5, '#ffd98f'); });
    lbl(x, y, BOARDZ[bt - 1], 'lkMenuB', '#fff3d0', '');
  } else if (k === 'tickets' && o.v2) {
    TK_STASH = (o.items || []).slice(0, 8);                          /* pass (sonra çizilir) ön yüzüne asar: arka duvar üst katın gölgesinde görünmez */
  } else if (k === 'tickets') {
    var tk = o.items || []; if (!tk.length) return;
    L.blit(ticketSpr(tk), sx, R(pY(x, y, 42)));
    if (tk.length > 5) gf('uiBadge')(x, y, 56, '+' + (tk.length - 5), '#ffe9b0');
  } else if (k === 'teras' && o.v2) {
    if (o.part !== 'umb') return true;
    var PXu = R(pX(x, y - 0.05)), PYu = R(pY(x, y - 0.05, 0));         /* şemsiye masanın ortasından: kubbe z 37'de, oturanların başının hemen üstünde */
    L.fr(PXu, PYu, 0, -74, 2, 58, '#8a6a4a'); L.fr(PXu, PYu, 0, -74, 1, 58, '#b08a62');
    L.blit((o.tier | 0) >= 4 ? umbSpr4() : umbSpr2(), PXu, PYu - 37);
  } else if (k === 'teras') {
    if (o.part === 'umb') {
      var ux = x + 0.5, uy = y - 0.45, PX = R(pX(ux, uy)), PY = R(pY(ux, uy, 0));
      L.fr(PX, PY, -1, -80, 3, 80, '#7d5a3a'); L.fr(PX, PY, -1, -80, 1, 80, '#a07a52'); L.fr(PX, PY, -3, -4, 7, 4, '#5d3c1c');
      L.blit(umbSpr(), PX, PY - 41);
    } else {
      var len = Math.round((o.x1 - o.x0) * 100) / 100;
      at(railSpr(len), o.x0, o.y, 0);
    }
  } else if (k === 'meze') {
    var mt = clamp(o.tier | 0 || 2, 1, 3);
    gf('shadow')(x, y, mt === 3 ? 1.1 : mt === 1 ? 0.6 : 0.8);
    at(mezeVitSpr(mt), x, y, 0);
    lbl(x, y, [22, 30, 33][mt - 1], 'lkMezeB', '#ffe9b0', '');
  } else if (k === 'saz') {
    gf('shadow')(x, y, 0.8);
    var mus = o.musician === true, play = mus && o.play === true;
    at(sazSpr(mus), x, y, 0);
    var sy = R(pY(x, y, 4));
    if (mus) {                                                       /* sazcı: tezene 3 kare, kafa ağır sallanır; çalarken notalar sazın sapından yükselir */
      var fr = play ? Math.floor(t * 9) % 3 : 0, hb = play ? R(Math.sin(t * 2.6)) : 0;
      at(sazciSpr(play, fr, hb), x, y, 0);
      if (play) for (i = 0; i < 3; i++) {                            /* ♪ ♫: koyu gölgeli (açık zeminde de okunur), yükselip söner */
        var nq = (t * 0.5 + i / 3) % 1, nx = R(14 + i * 6 + Math.sin(t * 2.4 + i * 2) * 2), ny = -38 - R(nq * 18), na = Math.min(1, nq < 0.12 ? nq / 0.12 : (1 - nq) / 0.45);
        var nc = (i === 1 ? 'rgba(255,240,190,' : 'rgba(255,214,120,') + na.toFixed(2) + ')', ns = 'rgba(70,40,20,' + (na * 0.7).toFixed(2) + ')';
        [[1, 1, ns], [0, 0, nc]].forEach(function (q) {
          L.fr(sx, sy, nx + q[0], ny + q[1], 3, 2, q[2]); L.fr(sx, sy, nx + 2 + q[0], ny - 6 + q[1], 1, 6, q[2]);
          if (i === 1) { L.fr(sx, sy, nx - 5 + q[0], ny + 1 + q[1], 3, 2, q[2]); L.fr(sx, sy, nx - 3 + q[0], ny - 5 + q[1], 1, 6, q[2]); L.fr(sx, sy, nx - 3 + q[0], ny - 6 + q[1], 6, 1, q[2]); }
          else L.fr(sx, sy, nx + 3 + q[0], ny - 5 + q[1], 1, 2, q[2]);
        });
      }
    } else if (o.night || Math.sin(t * 2.2) > 0.6) {                 /* ♪ notalar */
      var up = R((t * 6) % 6);
      L.fr(sx, sy, -16, -40 - up, 3, 3, '#ffd98a'); L.fr(sx, sy, -14, -48 - up, 1, 8, '#ffd98a'); L.fr(sx, sy, -24, -30 - (up >> 1), 3, 3, '#ffe9b0'); L.fr(sx, sy, -22, -38 - (up >> 1), 1, 8, '#ffe9b0'); L.fr(sx, sy, -22, -38 - (up >> 1), 3, 1, '#ffe9b0');
    }
    lbl(x, y, 36, 'lkSazB', '#ffe9b0', '');
  } else if (k === 'sign' && o.v2) {                                 /* v2: ad + yıldız evin tabelasında; burada giriş kapısı */
    var gt = clamp(o.tier | 0 || 2, 1, 3);
    at(gateSpr(x, y, gt), x, y, 0);
    gateLamp(x, y, !!o.night, gt);
    if (typeof o.open === 'boolean') doorSign(x, y, gt, o.open);
    if (o.res) gf('uiBadge')(x, y, gt === 3 ? 48 : 40, gf('T')(o.res.kind === 'nisan' ? 'lkResBN' : 'lkResBD') + ' ' + o.res.got + '/' + o.res.n, '#ffd0e8');
  } else if (k === 'sign') {
    gf('shadow')(x, y, 0.9);
    at(signSpr(clamp(o.star | 0, 0, 5)), x, y, 0);
    bulbs(x, y, !!o.night, t);
    gf('uiText')(x, y, 49, gf('UP')(gf('NM')({ tr: 'SAHİL LOKANTASI', en: 'SEASIDE RESTAURANT' })), '#ffe9b0', 7, 1, 0, 0);
    if (o.res) gf('uiBadge')(x, y, 64, gf('T')(o.res.kind === 'nisan' ? 'lkResBN' : 'lkResBD') + ' ' + o.res.got + '/' + o.res.n, '#ffd0e8');
  } else return false;
};

/* =====================================================================
   6) v2.20 — KARADA: KARADENİZ KÖY EVİ (HKA.drawLokHouse) + TAŞ TERAS (HKA.drawLokTerrace)
   Ev: taş kaideli, badanalı zemin kat (ön yüz açık ocakbaşı), hımış (ahşap çatkı + beyaz dolgu) cumbalı üst kat,
   alaturka kiremitli kırma çatı (köy evleriyle aynı kırmızı), taş baca, saçakta kurutulmuş biber + sepet,
   cumbanın üstünde saçağa oturan ahşap tabela (ekrana düz: okunur). Teras: meydan taşıyla aynı döşeme,
   alçak taş duvar, ışık zinciri, köşe direkli seyrek asma çardak (müşterinin başını örtmez).
   Görünürlük notu: üst kat (z ≥ 43, y ≤ 26,3) mutfağın arka duvarını örter; içerisi zeminden ve ön açıklıktan okunur.
   v2.21: ev lokanta seviyesiyle arkaya (o.y0) ve yukarı büyür — ayrıntı aşağıda (hGeo). Sv1–2 tek kat (tabela mahyada), Sv3+ üst kat.
   ===================================================================== */
var V = {
  WASH: '#f1ebda', WASHL: '#fbf6ea', WASHS: '#e2d9c3', WASHD: '#cdc2a8',
  TIM: '#6b4428', TIMD: '#4a2e1a', TIML: '#8a5a34',
  ST: ['#bdb5a2', '#aea795', '#c8c1ae', '#b3ac99', '#a6a08f'], STJ: '#857e6e',
  SHUT: '#3d7a68', SHUTL: '#5a9a82', SHUTD: '#2a5a4c',
  GL: '#6f9db6', GLL: '#bfdcea', GLD: '#4f7a93', GLN: '#ffd98f', GLNL: '#fff2c4', GLND: '#e8a85a',
  RF: ['#c8573c', '#c0503a', '#cd6043', '#b94a33'], RE: ['#a9452f', '#a2402c', '#b04b33', '#9b3c29'], RL: '#7d2c1d',
  PAVE: ['#cfc5ad', '#c6bba1', '#d6ccb5', '#bfb398', '#cbc0a6'], DZ: '#9c9079', MOSS: '#8f9a6a'
};
var HG = 46, HU = 19, RH = 13;                                     /* zemin kat, üst kat, çatı (game.js ile aynı) */
function frac(v) { return v - Math.floor(v); }
/* tampon pikseli → dünya (z düzleminde); sprite çapası (ox, oy) */
function inv(X, Y, z, ox, oy) { var k = G().K, a = (X + 0.5) / (12 * k), s = ((Y + 0.5) / k + z) / 6; return [ox + (a + s) / 2, oy + (s - a) / 2]; }
/* düşey yüz dokuları: h = yüz boyunca konum (karo), z = sanat pikseli */
function stoneAt(h, z, seed) {
  var row = Math.floor(z / 3.4), off = hash(row, seed || 7) * 0.4, q = (h + off) / 0.34, col = Math.floor(q), lz = z - row * 3.4, lq = q - col;
  if (lz < 0.55 || lq < 0.09) return V.STJ;
  var c = V.ST[Math.floor(hash(col * 3 + 1, row + (seed || 7) * 5) * V.ST.length)];
  if (lz > 2.7) return lite(c, 0.12);
  if (lq > 0.88) return dark(c, 0.12);
  return hash(R(h * 40), R(z * 2)) > 0.94 ? dark(c, 0.08) : c;
}
function plaster(base, h, z) { var q = hash(R(h * 30), R(z * 2)); return q > 0.96 ? dark(base, 0.05) : q < 0.03 ? lite(base, 0.08) : base; }
function inSpan(v, a, b) { return v >= a && v < b; }
/* pencere (yüz koordinatı): h0..h1 × z0..z1; çerçeve, orta kayıt, gece ışığı */
function winPix(h, z, h0, h1, z0, z1, night) {
  var e = Math.min(h - h0, h1 - h) * 12, ez = Math.min(z - z0, z1 - z);
  if (e < 1.1 || ez < 1.1) return e < 0.55 || ez < 0.55 ? V.TIMD : V.TIM;
  var mid = Math.abs(h - (h0 + h1) / 2) * 12, tr = Math.abs(z - (z0 + (z1 - z0) * 0.62));
  if (mid < 0.5 || tr < 0.5) return V.TIMD;
  if (night) return (z > z1 - 3 || (h - h0) * 12 < 2.5) ? V.GLNL : (z < z0 + 2.2 ? V.GLND : V.GLN);
  if ((h - h0) * 12 + (z1 - z) < 4) return V.GLL;
  return z < z0 + 2.5 ? V.GLD : V.GL;
}
/* açık pencere kanadı (panjur): yatay pervaz çizgili yeşil */
function shutPix(h, z, h0, h1, z0, z1) {
  var e = Math.min(h - h0, h1 - h) * 12, ez = Math.min(z - z0, z1 - z);
  if (e < 0.5 || ez < 0.6) return V.SHUTD;
  return (Math.floor(z * 1.3) & 1) ? V.SHUT : V.SHUTL;
}
/* hımış panosu: iki dikme + orta kuşak + çapraz payandalar (dolgu beyaz) */
function himis(h, z, h0, h1, zb, zt, base) {
  var w = (h1 - h0) * 12, u = (h - h0) * 12;
  if (u < 1.1 || w - u < 1.1) return V.TIM;
  var zm = (zb + zt) / 2;
  if (Math.abs(z - zm) < 0.7) return V.TIM;
  var lo = z < zm, za = lo ? zb : zm, zz = lo ? zm : zt, t = (z - za) / (zz - za), d1 = Math.abs(u - t * w), d2 = Math.abs(u - (1 - t) * w);
  if (lo ? d1 < 0.9 : d2 < 0.9) return V.TIMD;
  return plaster(base, h, z);
}
/* kiremit deseni: d = saçaktan uzaklık (karo), a = sıra boyunca konum, tone dizisi */
function tileAt(d, a, P, X, Y) {
  var r = Math.floor(d / 0.27), f = d / 0.27 - r, q = (a + (r & 1) * 0.1) / 0.2, c = Math.floor(q), g = q - c;
  var base = P[Math.floor(hash(c * 7 + 3, r * 11 + 1) * P.length)];
  if (hash(X, Y) > 0.992) return '#9a8a5a';                                   /* liken */
  if (g < 0.12) return V.RL;
  if (f < 0.16) return dark(base, 0.32);
  if (f > 0.88) return lite(base, 0.2);
  if (g < 0.42) return lite(base, 0.13);
  if (g > 0.86) return dark(base, 0.16);
  return base;
}
/* ---------- kurutulmuş biber dizisi + hasır sepet (saçak altı) ---------- */
function pepperString(b, x, y, z0, n) {
  var X = R(fx(x, y)), Y = R(fy(x, y, z0)), i;
  b.rect(X, Y, 1, 3, '#5d3c1c'); b.rect(X - 1, Y + 2, 3, 2, '#4f7a3a');
  for (i = 0; i < n; i++) {
    var yy = Y + 4 + i * 3, s = (i & 1) ? 1 : -1, c = i % 3 === 2 ? '#a8231c' : '#c4302a';
    b.rect(X + (s > 0 ? 0 : -2), yy, 3, 2, c); b.set(X + (s > 0 ? 0 : -2), yy, lite(c, 0.35)); b.set(X + (s > 0 ? 3 : -3), yy + 1, dark(c, 0.3));
  }
  b.set(X, Y + 4 + n * 3, '#4f7a3a');
}
function basket(b, x, y, z0) {
  var X = R(fx(x, y)), Y = R(fy(x, y, z0)), i;
  b.rect(X, Y, 1, 4, '#5d3c1c'); b.set(X - 3, Y + 4, '#5d3c1c'); b.set(X + 3, Y + 4, '#5d3c1c'); b.rect(X - 2, Y + 3, 5, 1, '#5d3c1c');
  for (i = 0; i < 6; i++) { var w = 9 - (i > 3 ? (i - 3) * 2 : 0); for (var k = 0; k < w; k++) b.set(X - 4 + k + (9 - w) / 2, Y + 5 + i, ((k + i) & 1) ? '#c9a15e' : '#a8803e'); }
  b.rect(X - 4, Y + 5, 9, 1, '#d8b86a');
  b.set(X - 2, Y + 4, '#7fb069'); b.set(X + 1, Y + 4, '#c4302a'); b.set(X + 2, Y + 3, '#7fb069');
}
var RN = ['#b54b34', '#ad4530', '#bb5338', '#a6402c'], RW = ['#d1634a', '#ca5c43', '#d66b4e', '#c2563d'];   /* kuzey / batı yamaç (derin evde ince şerit görünür) */
function NONE() { return null; }
/* açıklıklar arasında kalan pano aralıkları (hımış dolgusu için) */
function gaps(a, b, open) {
  var s = open.slice().sort(function (p, q) { return p[0] - q[0]; }), out = [], c = a;
  s.forEach(function (p) { if (p[0] - c >= 0.35) out.push([c, p[0]]); c = Math.max(c, p[1]); });
  if (b - c >= 0.35) out.push([c, b]);
  return out;
}
var GEO = {};
/* ---------- v2.22 (V3): ev yeni yerleşimde, dünya koordinatı ----------
   Ayak izi o.x0..o.x1 × o.y0..o.y1 (15,6–28,8 × 13,5–16,9). Batıda ocakbaşı mutfak (önü açık, güneye bakar), doğuda
   ANX genişlikte bulaşıkhane eki (x 27,2–28,8). Sv1–2 tek kat (tabela mahyada), Sv3+ hımış cumbalı üst kat yalnız mutfağın
   üstünde, ek tek katlı kendi küçük çatısıyla; Sv4 ikinci cumba, Sv5 saçak oyması, mahya alemleri, köşe fenerleri.
   Satın alınan ev süsleri (o.dc): biber, tente, kafes, fenertab, saksi, balkon (Sv3+), kosk (Sv3+).
   Görünürlük: ön kiriş / üst kat tabanı (y ≈ 17,0–17,2, z 40–43) arkadaki her şeyi z ≈ 12·y − 163'ün üstünde örter:
   arka duvar ve kapı bu kameradan görünmez, mutfak zeminden ve ön açıklıktan okunur. Önde sarkan her şey (biber, kafes)
   aşçıların ekran aralıklarına yerleştirilir. */
var ANX = 1.6, HDC = ['biber', 'tente', 'kafes', 'fenertab', 'saksi', 'balkon', 'kosk'];
function winsSkip(a0, a1, w, step, skips) {                      /* a0..a1 aralığına pencereler; skips aralıklarından kaçın */
  var out = [], y = a0, guard = 0;
  while (y + w <= a1 + 1e-6 && guard++ < 40) {
    var hit = null;
    for (var i = 0; i < skips.length; i++) if (skips[i] && y < skips[i][1] + 0.25 && y + w > skips[i][0] - 0.25) hit = skips[i];
    if (hit) { y = hit[1] + 0.3; continue; }
    out.push([y, y + w]); y += step;
  }
  return out;
}
function hGeo(o) {
  var lv = clamp(o.lv | 0, 1, 5), dc = o.dc || {}, dk = HDC.map(function (k) { return dc[k] ? 1 : 0; }).join('');
  var key = [o.x0, o.y0, o.x1, o.y1, lv, dk].join(',');
  if (GEO[key]) return GEO[key];
  var X0 = o.x0, Y0 = o.y0, X1 = o.x1, Y1 = o.y1, up = lv >= 3, g = { key: key, lv: lv, up: up, dc: dc, X0: X0, Y0: Y0, X1: X1, Y1: Y1 };
  g.XK = X1 - ANX; g.Z1 = HG - 3; g.Z2 = HG + HU; g.XA = X0 - 0.1; g.XB = up ? g.XK + 0.1 : X1 + 0.1; g.YF = Y1 + 0.3;
  g.cx = (X0 + X1) / 2; g.BX0 = g.cx - 1.25; g.BX1 = g.cx + 1.25; g.BY = g.YF + 0.3;
  g.RZ = up ? g.Z2 + 1 : HG + 1; g.RY1 = up ? g.BY + 0.25 : Y1 + 0.42; g.RX0 = g.XA - 0.3; g.RX1 = g.XB + 0.3; g.RY0 = Y0 - 0.25;
  g.RR = { x0: g.RX0, x1: g.RX1, y0: g.RY0, y1: g.RY1, z: g.RZ, h: RH };
  g.ym = (g.RY0 + g.RY1) / 2; g.ri = Math.min((g.RY1 - g.RY0) / 2, (g.RX1 - g.RX0) / 2); g.r0 = g.RX0 + g.ri; g.r1 = g.RX1 - g.ri; g.top = g.RZ + RH;
  g.AR = up ? { x0: g.XB - 0.05, x1: X1 + 0.3, y0: Y0 - 0.2, y1: Y1 + 0.42, z: HG + 1, h: 8 } : null;   /* bulaşıkhane çatısı (Sv3+) */
  g.ewin = winsSkip(Y0 + 0.5, Y1 - 0.45, 0.72, 1.45, []);                          /* zemin kat doğu pencereleri (bahçeye bakar) */
  g.uwin = up ? winsSkip(Y0 + 0.45, g.YF - 0.5, 0.72, 1.45, []) : [];             /* üst kat doğu yüzü (ek çatısının üstünde) */
  g.cumba2 = lv >= 4 ? [X0 + 0.5, X0 + 2.4] : null;
  g.balc = up && dc.balkon ? [g.XK - 2.35, g.XB - 0.02] : null;
  g.bdoor = g.balc ? [g.XK - 1.6, g.XK - 0.7] : null;
  g.fwin = up ? winsSkip(g.XA + 0.4, g.XB - 0.4, 0.72, 1.5, [g.cumba2, [g.BX0, g.BX1], g.bdoor]) : [];
  g.chim = [{ x: X0 + 2.8, y: g.ym - 0.55, w: 0.42, z1: g.top + 15, a: 1 }];
  if (lv >= 2) g.chim.push({ x: g.XK - 1.3, y: g.ym - 0.45, w: 0.36, z1: g.top + 10, a: 0.6 });
  g.kiosk = up && dc.kosk ? { x: Math.min(g.r1 - 0.5, 24.0), y: g.ym, h: 0.74 } : null;
  g.sign = up ? { x: g.cx, y: g.RY1 - 0.05, z: g.RZ, ridge: false, lift: 3 } : { x: g.cx, y: g.ym, z: g.top, ridge: true, lift: 9 };
  g.hang = [X0 + 1.8, X0 + 5.35, X0 + 7.15, X0 + 8.95];                             /* önde sarkan süslerin yeri: aşçıların ekran aralıkları */
  var gl = [];
  g.ewin.forEach(function (w) { gl.push([X1 + 0.02, (w[0] + w[1]) / 2, 22.5, 10, 32]); });
  if (up) {
    if (g.cumba2) gl.push([(g.cumba2[0] + g.cumba2[1]) / 2, g.YF + 0.25, 56, 24, 24]);
    gl.push([g.cx, g.BY, 56, 30, 24]);
    if (g.bdoor) gl.push([(g.bdoor[0] + g.bdoor[1]) / 2, g.YF, 56, 11, 24]);
    g.fwin.forEach(function (w) { gl.push([(w[0] + w[1]) / 2, g.YF, 55, 10, 22]); });
    g.uwin.forEach(function (w) { gl.push([g.XB + 0.02, (w[0] + w[1]) / 2, 55, 10, 22]); });
  }
  if (g.kiosk) gl.push([g.kiosk.x, g.kiosk.y + g.kiosk.h, g.top + 7, 15, 20]);
  if (lv >= 5) { gl.push([X0 + 0.1, g.YF + 0.05, HG - 9, 6, 16]); gl.push([g.XB - 0.2, g.YF + 0.05, HG - 9, 6, 16]); }
  g.glow = gl;
  return (GEO[key] = g);
}
/* çatı yüzeyi yüksekliği (kırma çatı): bacayı / köşkü çatıya oturtmak için */
function roofZ(Q, x, y) { var ri = Math.min((Q.y1 - Q.y0) / 2, (Q.x1 - Q.x0) / 2), d = Math.min(Q.y1 - y, y - Q.y0, Q.x1 - x, x - Q.x0); return Q.z + Q.h * clamp(d / ri, 0, 1); }
/* kırma çatı: dört yamaç (kuzey/batı yamaç bu izdüşümde ince şerit olarak görünür), alaturka kiremit, mahya, saçak alnı.
   ax, ay = sprite çapası; Q = {x0,x1,y0,y1,z,h}; op = {fh: saçak alnı, tails: kiriş ucu sayısı, caps: mahya kiremidi, lace: saçak oyması} */
function hipRoof(b, ax, ay, Q, op) {
  var kk = G().K, X0 = Q.x0, X1 = Q.x1, Y0 = Q.y0, Y1 = Q.y1, Z = Q.z, H = Q.h, k, fh = op.fh || 2.5;
  var hx = (X1 - X0) / 2, hy = (Y1 - Y0) / 2, ri = Math.min(hx, hy), s = H / ri, xm = X0 + hx, ym = Y0 + hy, T = Z + H, alongX = hx >= hy;
  var Pa = alongX ? [X0 + ri, ym] : [xm, Y0 + ri], Pb = alongX ? [X1 - ri, ym] : [xm, Y1 - ri];
  var SW = P3(X0, Y1, Z), SE = P3(X1, Y1, Z), NE = P3(X1, Y0, Z), NW = P3(X0, Y0, Z), A = P3(Pa[0], Pa[1], T), B = P3(Pb[0], Pb[1], T);
  function pl(Aa, Bu, Bv, dist, along, Pal) {                     /* tampon pikseli → yamaç düzlemindeki dünya noktası → kiremit */
    var den = 12 - Bu - Bv; if (den < 0.4) return null;
    return function (Xb, Yb) {
      var a = (Xb + 0.5) / (12 * kk), sY = (Yb + 0.5) / kk, v = (sY - 6 * a + Aa + Bu * a) / den, x = v + a + ax, y = v + ay;
      return tileAt(dist(x, y), along(x, y), Pal, Xb, Yb);
    };
  }
  var fN = pl(Z + s * (ay - Y0), 0, s, function (x, y) { return y - Y0; }, function (x) { return x; }, RN);
  var fW = pl(Z + s * (ax - X0), s, 0, function (x) { return x - X0; }, function (x, y) { return y; }, RW);
  var fF = pl(Z + s * (Y1 - ay), 0, -s, function (x, y) { return Y1 - y; }, function (x) { return x; }, V.RF);
  var fE = pl(Z + s * (X1 - ax), -s, 0, function (x) { return X1 - x; }, function (x, y) { return y; }, V.RE);
  wall(b, X0, Y1, X1, Y1, Z - fh, Z, '#4a2e1a'); wall(b, X1, Y0, X1, Y1, Z - fh, Z, '#3a2414');                 /* saçak alnı */
  if (op.lace) {                                                                                               /* saçak oyması (Sv5) */
    for (k = X0 + 0.1; k < X1 - 0.05; k += 0.2) { var lX = R(fx(k, Y1)), lY = R(fy(k, Y1, Z - fh)); b.rect(lX - 1, lY, 3, 1, V.TIM); b.set(lX, lY + 1, V.TIM); b.set(lX, lY + 2, V.TIMD); }
    for (k = Y0 + 0.1; k < Y1 - 0.05; k += 0.2) { var eX = R(fx(X1, k)), eY = R(fy(X1, k, Z - fh)); b.rect(eX - 1, eY, 3, 1, V.TIMD); b.set(eX, eY + 1, V.TIMD); }
  } else for (k = 0; k < (op.tails || 0); k++) { var tx = X0 + 0.2 + k * (X1 - X0 - 0.4) / Math.max(1, op.tails - 1); vl(b, tx, Y1 - 0.02, Z - fh - 1, Z - fh, '#2e1d10', 1); }
  if (alongX) {
    if (fN) poly(b, [NW, NE, B, A], fN); if (fW) poly(b, [NW, SW, A], fW);
    poly(b, [SW, SE, B, A], fF); poly(b, [NE, SE, B], fE);
  } else {
    if (fN) poly(b, [NW, NE, A], fN); if (fW) poly(b, [NW, SW, B, A], fW);
    poly(b, [SW, SE, B], fF); poly(b, [NE, SE, B, A], fE);
  }
  hl(b, X0, Y1, X1, Y1, Z, '#e07a58');                                                                          /* saçak ışığı */
  var sw = alongX ? A : B, ne = alongX ? B : A;
  line(b, NW[0], NW[1], A[0], A[1], '#7d2c1d'); line(b, NE[0], NE[1], ne[0], ne[1], '#7d2c1d');                 /* arka kalkan hatları */
  line(b, SW[0], SW[1], sw[0], sw[1], '#8e2f1f');
  line(b, SE[0], SE[1], B[0], B[1], '#8e2f1f'); line(b, SE[0] - 1, SE[1], B[0] - 1, B[1], '#e07a58');            /* mahya + kalkan kiremitleri */
  hl(b, Pa[0], Pa[1], Pb[0], Pb[1], T + 0.6, '#8e2f1f'); hl(b, Pa[0], Pa[1], Pb[0], Pb[1], T + 1.1, '#e98a64');
  var n = op.caps || 0;
  for (k = 0; k < n; k++) { var u = n > 1 ? k / (n - 1) : 0.5; pr(b, Pa[0] + (Pb[0] - Pa[0]) * u, Pa[1] + (Pb[1] - Pa[1]) * u, T + 1.5, -1, 0, 2, 1, '#d0654a'); }
  return { A: Pa, B: Pb, T: T };
}
/* taş baca: çatının altında kalan kısmı çizilmez (çatı önde) */
function chimney(b, c, Q) {
  var h = c.w / 2, z0 = Math.min(roofZ(Q, c.x - h, c.y - h), roofZ(Q, c.x + h, c.y + h), roofZ(Q, c.x - h, c.y + h), roofZ(Q, c.x + h, c.y - h)) - 1, z1 = c.z1, e = c.w * 0.14;
  box(b, c.x - h, c.y - h, c.w, c.w, z0, z1, '#8d8475',
    function (u, z) { var x = c.x - h + u / 12, Z = z0 + z; if (Z < roofZ(Q, x, c.y + h) - 0.4) return null; return Z > z1 - 1 ? lite(V.ST[0], 0.1) : stoneAt(x, Z, 21); },
    function (v, z) { var y = c.y - h + v / 12, Z = z0 + z; if (Z < roofZ(Q, c.x + h, y) - 0.4) return null; return dark(stoneAt(y, Z, 22), 0.14); }, { norim: true });
  box(b, c.x - h - e, c.y - h - e, c.w + 2 * e, c.w + 2 * e, z1, z1 + 2, '#cfc8b6', '#a39b89', '#8d8575');          /* kapak taşı */
  box(b, c.x - h * 0.4, c.y - h * 0.4, 0.06, 0.06, z1 + 2, z1 + 5, '#6a6458', '#6a6458', '#55504a', { norim: true });
  box(b, c.x + h * 0.25, c.y + h * 0.25, 0.06, 0.06, z1 + 2, z1 + 5, '#6a6458', '#6a6458', '#55504a', { norim: true });
  box(b, c.x - h - e * 0.6, c.y - h - e * 0.6, c.w + e * 1.2, c.w + e * 1.2, z1 + 5, z1 + 7, '#b8b09e', '#948c7c', '#7d7668');   /* külah taşı */
}
function shEll(b, cx, cy, rx, ry, c) {                              /* gölgeli oval (çuval, küp): ışık sol üstten */
  for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
    if ((x * x) / (rx * rx + 0.3) + (y * y) / (ry * ry + 0.3) > 1) continue;
    var s = x / rx * 0.7 + y / ry * 0.3;
    b.set(cx + x, cy + y, s > 0.42 ? dark(c, 0.24) : s < -0.45 ? lite(c, 0.2) : c);
  }
}
function sack(b, x, y, c) { var X = R(fx(x, y)), Y = R(fy(x, y, 0)); shEll(b, X, Y - 6, 6, 6, c); b.rect(X - 2, Y - 14, 4, 3, c); b.rect(X - 2, Y - 12, 4, 1, '#7a5a32'); b.rect(X - 1, Y - 15, 2, 1, lite(c, 0.25)); }
function kup(b, x, y) { var X = R(fx(x, y)), Y = R(fy(x, y, 0)); shEll(b, X, Y - 8, 6, 8, '#b4643e'); b.rect(X - 3, Y - 17, 6, 2, '#9c5232'); b.rect(X - 4, Y - 18, 8, 1, '#c97a50'); b.rect(X - 4, Y - 9, 9, 1, '#8a4528'); }
function barrel(b, x, y, h) {
  var hoop = function (z) { return Math.abs(z - 2.5) < 0.7 || Math.abs(z - h + 2.5) < 0.7; };
  box(b, x - 0.2, y - 0.2, 0.4, 0.4, 0, h, function (u, v) { return Math.hypot(u - 2.4, v - 2.4) > 2.0 ? '#6f4526' : '#8a5a32'; },
    function (u, z) { return hoop(z) ? '#3a3a40' : (Math.floor(u * 1.3) % 3 === 0 ? '#6f4526' : (u < 1.5 ? '#ab7a46' : '#9a6a3a')); },
    function (v, z) { return hoop(z) ? '#2e2e32' : (Math.floor(v * 1.3) % 3 === 0 ? '#5a3a20' : '#7d4f2a'); }, { norim: true });
}
function crate(b, x, y, z, s) {
  box(b, x - s / 2, y - s / 2, s, s, z, z + s * 18, function (u, v) { return (Math.floor(u / 1.6) & 1) ? '#b8834a' : '#a9743f'; },
    function (u, z2) { var e = Math.min(u, s * 12 - u, z2, s * 18 - z2); return e < 0.8 ? '#6f4526' : (Math.abs(u - z2 * s * 12 / (s * 18)) < 0.7 ? '#7d4f2a' : '#a9743f'); },
    function (v, z2) { var e = Math.min(v, s * 12 - v, z2, s * 18 - z2); return e < 0.8 ? '#5a3a20' : '#85583a'; }, { norim: true });
}
function rack(b, x0, x1, y, n) {                                      /* arka duvara yaslı raf: dikmeler + n kat tahta, kavanoz/kap */
  var k, i, cols = ['#b87333', '#d8d2c0', '#8d959b', '#c0503a', '#e8c547', '#7fb069'];
  for (k = 0; k < n; k++) {
    var z = 4 + k * 7;
    box(b, x0, y, x1 - x0, 0.28, z, z + 1.2, V.TIML, V.TIM, V.TIMD, { norim: true });
    for (i = 0; i < (x1 - x0) / 0.2 - 1; i++) {
      var h = hash(i + k * 7, 31); if (h > 0.84) continue;
      var jx = x0 + 0.14 + i * 0.2, hh = 2.5 + R(h * 3), c = cols[Math.floor(h * 6)];
      pr(b, jx, y + 0.15, z + 1.2, -0.75, -hh, 1.5, hh, c); pr(b, jx, y + 0.15, z + 1.2, -0.75, -hh, 0.5, hh, lite(c, 0.25));
    }
  }
  vl(b, x0 + 0.03, y + 0.28, 0, 5 + n * 7, V.TIMD, 2); vl(b, x1 - 0.05, y + 0.28, 0, 5 + n * 7, V.TIMD, 2);
}
/* ---------- iç mekân (o.part 'back'): zemin, arka duvar (kapı boşluklu), batı iç duvar, ek bölmesi, batı payesi ---------- */
function houseBackSpr(o) {
  var X0 = o.x0, Y0 = o.y0, X1 = o.x1, Y1 = o.y1, nt = o.night ? 1 : 0, XK = X1 - ANX, D = o.door || [X0 + 2, X0 + 3];
  return spr('lkHB3|' + [X0, Y0, X1, Y1, D[0], D[1]].join(',') + '|' + nt + '|' + G().K, X0, Y0, function (b) {
    var k, kk = G().K;
    quadW(b, X0 + 0.22, Y0 + 0.1, X1 - X0 - 0.44, Y1 - Y0 - 0.1, 0.1, function (Xb, Yb) {      /* mutfak: pişmiş toprak karo · ek: mavi-gri taş; arkaya doğru loş */
      var w = inv(Xb, Yb, 0.1, X0, Y0), x = w[0], y = w[1], c;
      var cu = Math.floor(x / 0.5), cv = Math.floor(y / 0.5), lu = frac(x / 0.5), lv2 = frac(y / 0.5);
      if (x > XK) { c = ['#9aa4a8', '#8f999e', '#a5aeb2'][Math.floor(hash(cu + 80, cv + 3) * 3)]; if (lu < 0.06 || lv2 < 0.06) c = '#6a7478'; }
      else {
        c = ['#b06a4c', '#a7614a', '#b97452', '#a25c42'][Math.floor(hash(cu + 40, cv + 9) * 4)];
        if (lu < 0.06 || lv2 < 0.06) c = '#7a4634'; else if (lu < 0.16 || lv2 < 0.16) c = lite(c, 0.08);
      }
      var dd = clamp((y - Y0) / 3.4, 0, 1), glow = Math.max(0, 1 - Math.abs(y - 15.9) / 1.2) * (nt ? 0.3 : 0.12);
      c = dark(c, 0.4 * (1 - dd) + 0.06);
      if (glow > 0 && x < XK) c = mix(c, '#ffb45a', glow * (0.6 + 0.4 * L.bayer[Yb & 3][Xb & 3]));
      return c;
    });
    /* arka duvar (iç yüz) + kapı boşluğu: bu kameradan çoğu üst katın / kirişin ardında kalır */
    var Yw = Y0 + 0.1;
    wall(b, X0 + 0.22, Yw, X1 - 0.22, Yw, 0, HG, function (Xb, Yb) {
      var x = (Xb + 0.5) / (12 * kk) + X0 + (Yw - Y0), z = 6 * ((x - X0) + (Yw - Y0)) - (Yb + 0.5) / kk;
      if (x > D[0] && x < D[1] && z < 31) { var e = Math.min(x - D[0], D[1] - x) * 12; if (e < 1 || z > 30) return V.TIMD; return nt ? (z < 6 ? '#3a4a5a' : '#22303e') : (z < 6 ? '#d8cdb0' : '#f2e8cc'); }
      return dark(z < 8 ? stoneAt(x, z, 5) : (z < 9.4 ? V.TIMD : plaster('#e6d6b8', x, z)), 0.5);
    });
    /* batı iç duvar: taş etek, hatıl, dikmeler, ön rafta bakır kaplar */
    var xw = X0 + 0.25, posts = [];
    for (k = Y1 - 1.6; k > Y0 + 0.5; k -= 1.6) posts.push(k);
    wall(b, xw, Y0 + 0.1, xw, Y1, 0, HG, function (Xb, Yb) {
      var yy = Y0 + (xw - X0) - (Xb + 0.5) / (12 * kk), zz = ((xw - X0) + (yy - Y0)) * 6 - (Yb + 0.5) / kk, dd = clamp((yy - Y0) / 3.4, 0, 1), c, i;
      c = zz < 8 ? stoneAt(yy, zz, 3) : plaster('#e6d6b8', yy, zz);
      for (i = 0; i < posts.length; i++) if (zz >= 8 && Math.abs(yy - posts[i]) < 0.07) c = Math.abs(yy - posts[i]) < 0.025 ? V.TIMD : V.TIM;
      if (zz >= 8 && zz < 9.4) c = V.TIMD;
      if (zz > 21.6 && zz < 23 && yy > Y1 - 1.75) c = zz > 22.4 ? V.TIML : V.TIMD;
      return dark(c, 0.5 * (1 - dd) + clamp((zz - 20) / 60, 0, 0.3));
    });
    var pots = [[Y1 - 1.45, '#b87333', 4], [Y1 - 1.05, '#c98a50', 3], [Y1 - 0.65, '#8d959b', 5]];
    for (k = 0; k < pots.length; k++) { var p0 = pots[k]; pr(b, xw + 0.02, p0[0], 23, -1.5, -p0[2], 3, p0[2], p0[1]); pr(b, xw + 0.02, p0[0], 23, -1.5, -p0[2], 3, 0.5, lite(p0[1], 0.3)); }
    /* ek (bulaşıkhane) bölmesi: arkadan y 15,6'ya kadar; doğu yüzü ekin içine bakar */
    var pf = function (u, z) { return dark(z < 8 ? stoneAt(u / 12, z, 9) : (z < 9.4 ? V.TIMD : plaster('#e6d6b8', u / 12, z)), 0.3); };
    box(b, XK - 0.06, Y0 + 0.1, 0.12, Y1 - Y0 - 1.3, 0, HG, V.TIMD, pf, function (v, z) { return z < 8 ? dark(stoneAt(v / 12, z, 13), 0.35) : (z < 9.4 ? V.TIMD : dark(plaster('#e6d6b8', v / 12, z), 0.32)); }, { norim: true });
    sack(b, X0 + 1.75, Y0 + 1.55, '#cdb98a'); sack(b, X0 + 1.95, Y0 + 1.9, '#e0d2a8');                             /* dolap ile tava arası: un/bulgur çuvalları */
    barrel(b, X1 - 0.35, Y0 + 1.9, 9);                                                                          /* ekte su fıçısı */
    box(b, X0, Y1 - 0.32, 0.27, 0.32, 0, HG - 3, NONE,                                                          /* batı ayak (taş paye) */
      function (u, z) { return z > HG - 5.5 ? V.TIMD : stoneAt(X0 + u / 12, z, 11); }, function (v, z) { return z > HG - 5.5 ? V.TIMD : dark(stoneAt(Y1 + v / 12, z, 12), 0.1); }, { norim: true });
    b.outline(0.55);
  });
}
/* zemin kat doğu duvarı (dış yüz, bahçeye bakar): taş etek, badana, hatıllar, panjurlu pencereler; saksı / tente süsü */
function eastWall(b, X1, Y1, ya, yb, nt, wins, dc) {
  var Z1 = HG - 3;
  wins = wins || []; dc = dc || {};
  box(b, X1 - 0.22, ya, 0.22, yb - ya, 0, Z1, NONE,
    function (u, z) { return z > Z1 - 2.5 ? V.TIMD : stoneAt(X1 + u / 12, z, 31); },
    function (v, z) {
      var y = ya + v / 12, c, k;
      if (z > Z1 - 2.5) return V.TIMD;
      for (k = 0; k < wins.length; k++) {
        var w = wins[k];
        if (inSpan(y, w[0], w[1]) && z >= 15 && z < 30) return winPix(y, z, w[0], w[1], 15, 30, nt);
        if ((inSpan(y, w[0] - 0.22, w[0] - 0.02) || inSpan(y, w[1] + 0.02, w[1] + 0.22)) && z >= 14.5 && z < 30.5) { var s0 = y < w[0] ? w[0] - 0.22 : w[1] + 0.02; return dark(shutPix(y, z, s0, s0 + 0.2, 14.5, 30.5), 0.12); }
        if (inSpan(y, w[0] - 0.05, w[1] + 0.05) && z >= 13 && z < 15) return z < 14 ? V.TIMD : V.TIM;
      }
      if (z < 8) return dark(stoneAt(y, z, 33), 0.1);
      if ((z >= 8 && z < 9.6) || (z >= 33.5 && z < 35)) return (z < 8.6 || (z >= 33.5 && z < 34.1)) ? '#5d3c1c' : V.TIM;
      c = plaster(V.WASHS, y, z);
      if (z > 36) c = dark(c, (z - 36) / 30);
      return c;
    }, { norim: true });
  wins.forEach(function (w) {
    if (dc.saksi) {                                                                                     /* pencere çiçekliği */
      box(b, X1, w[0] - 0.04, 0.14, w[1] - w[0] + 0.08, 12, 14.5, '#6a4426', '#5a3a22', K.woodV('#7a4e2a', 3), { norim: true });
      for (var j = 0; j < 7; j++) { var yy = w[0] + 0.02 + j * (w[1] - w[0]) / 6.5; pr(b, X1 + 0.07, yy, 14.5, -0.5, -1 - (j % 3 === 1 ? 1 : 0), 1, 1.5, j % 2 ? '#4f8a3a' : '#3f7a32'); if (j % 2 === 0) pr(b, X1 + 0.07, yy, 16, -0.5, -0.5, 1, 1, j % 4 ? '#e5533d' : '#d94a6a'); }
    }
    if (dc.tente) poly(b, [P3(X1, w[0] - 0.1, 33.5), P3(X1, w[1] + 0.1, 33.5), P3(X1 + 0.34, w[1] + 0.1, 29.5), P3(X1 + 0.34, w[0] - 0.1, 29.5)], function (X, Y) { return (((X + Y * 2) >> 2) & 1) ? '#f4efe2' : '#c8402e'; });
  });
}
/* çizgili saçak örtüsü (tente süsü): kirişin ön yüzü boyunca, fistolu alt kenar (aşçıların başını örtmez: alt kenar z 39,5) */
function valance(b, x0, x1, y, z0, z1) {
  wall(b, x0, y, x1, y, z0, z1, function (X) { return ((X >> 3) & 1) ? '#f4efe2' : '#c8402e'; });
  for (var x = x0; x < x1 - 0.05; x += 0.25) { var X = R(fx(x + 0.125, y)), Y = R(fy(x + 0.125, y, z0)); b.rect(X - 2, Y, 5, 1, ((R((x - x0) / 0.25)) & 1) ? '#e2dccb' : '#a8301f'); b.rect(X - 1, Y + 1, 3, 1, ((R((x - x0) / 0.25)) & 1) ? '#e2dccb' : '#a8301f'); }
}
function cageAt(b, x, y, z, nt) {                                    /* kanarya kafesi: kirişten sarkan pirinç kafes */
  var X = R(fx(x, y)), Y = R(fy(x, y, z)), i;
  b.rect(X, Y, 1, 4, '#3a2a1c'); b.rect(X - 1, Y + 4, 3, 1, BRASS);
  for (i = 0; i < 4; i++) b.rect(X - 4 + i, Y + 5 + i, 9 - i * 2 + 2 * i, 1, BRASS);
  for (i = -4; i <= 4; i += 2) b.rect(X + i, Y + 8, 1, 9, '#d8b860');
  b.rect(X - 5, Y + 17, 11, 2, '#8a6420'); b.rect(X - 4, Y + 12, 9, 1, '#a8842a');
  b.rect(X - 1, Y + 13, 3, 2, '#f2c12e'); b.set(X + 2, Y + 13, '#e8a020'); b.set(X - 1, Y + 13, '#2a1a10');
  void nt;
}
function houseFrontSpr(o, nm) {
  var g = hGeo(o), nt = o.night ? 1 : 0, star = clamp(o.star | 0, 0, 5), lv = g.lv, dc = g.dc;
  return spr('lkHF3|' + g.key + '|' + nt + '|' + star + '|' + nm + '|' + G().K, g.X0, g.Y0, function (b) {
    var X0 = g.X0, Y0 = g.Y0, X1 = g.X1, Y1 = g.Y1, Z1 = g.Z1, Z2 = g.Z2, XA = g.XA, XB = g.XB, XK = g.XK, YF = g.YF, BX0 = g.BX0, BX1 = g.BX1, k;
    /* --- zemin kat doğu duvarı (bahçeye) --- */
    eastWall(b, X1, Y1, Y0, Y1, nt, g.ewin, dc);
    box(b, X1 - 0.24, Y0, 0.24, Y1 - Y0, Z1, HG, NONE, NONE, function (v, z) { return z > 2.2 ? V.TIM : V.TIMD; }, { norim: true });   /* duvar başlığı */
    /* --- ön kiriş: Sv1–2 bütün cephe, Sv3+ yalnız ekin önü (üst kat tabanı mutfağın kirişi) --- */
    var bx0 = g.up ? XK - 0.05 : XA, bx1 = X1 + 0.1;
    if (g.up) box(b, XK - 0.11, Y1 - 0.24, 0.22, 0.24, 0, Z1, NONE,                                          /* mutfak / ek arası direk */
      function (u, z) { return z < 8 ? stoneAt(XK + u / 12, z, 15) : (Math.floor(z / 6) % 5 === 0 ? V.TIMD : V.TIM); }, function (v, z) { return z < 8 ? dark(stoneAt(Y1 + v / 12, z, 16), 0.1) : V.TIMD; }, { norim: true });
    box(b, bx0, Y1 - 0.14, bx1 - bx0, 0.26, Z1 - 3, HG, NONE,
      function (u, z) { if (z < 0.8) return '#3e2716'; if (z > 5.2) return V.TIML; return (Math.floor(z * 1.4 + hash(R(u / 7), 3) * 3) % 4 === 0) ? V.TIMD : (Math.floor(u / 9) % 2 ? V.TIM : '#74492a'); },
      function (v, z) { return z < 0.8 ? '#2e1d10' : V.TIMD; }, { norim: true });
    if (dc.tente) valance(b, bx0, bx1, Y1 + 0.125, Z1 - 2.5, HG - 0.5);
    /* köşe dirsekleri */
    [[X0 + 0.12, 0.5], [(g.up ? XK : X1) - 0.12, -0.5]].forEach(function (p) {
      var yb = Y1 + 0.1;
      line(b, fx(p[0], yb), fy(p[0], yb, Z1 - 15), fx(p[0] + p[1], yb), fy(p[0] + p[1], yb, Z1 - 2), V.TIMD);
      line(b, fx(p[0], yb) + 1, fy(p[0], yb, Z1 - 15), fx(p[0] + p[1], yb) + 1, fy(p[0] + p[1], yb, Z1 - 2), V.TIM);
    });
    if (g.up) {
      /* --- Sv3+: hımış üst kat (mutfağın üstü): önde pencereler, cumba(lar), balkon kapısı; doğuda ek çatısının üstünde pencereler --- */
      var c2 = g.cumba2, D = g.bdoor, open = [], eOpen = [];
      g.fwin.forEach(function (w) { open.push([w[0] - 0.24, w[1] + 0.24]); });
      if (c2) open.push([c2[0], c2[1]]);
      open.push([BX0, BX1]); if (D) open.push([D[0] - 0.06, D[1] + 0.06]);
      var panF = gaps(XA, XB, open);
      g.uwin.forEach(function (w) { eOpen.push([w[0] - 0.24, w[1] + 0.24]); });
      var panE = gaps(Y0, YF, eOpen);
      box(b, XA, Y0, XB - XA, YF - Y0, Z1, Z2, NONE,
        function (u, z) {
          var x = XA + u / 12, Z = Z1 + z, c, k2;
          if (Z < Z1 + 2.5) return Z < Z1 + 0.8 ? '#3e2716' : (Math.floor(u / 7) % 2 ? V.TIMD : '#5a3a22');
          if (Z >= Z2 - 2.5) return Z > Z2 - 1 ? V.TIML : V.TIM;
          for (k2 = 0; k2 < g.fwin.length; k2++) {
            var w = g.fwin[k2];
            if (inSpan(x, w[0], w[1]) && Z >= 50 && Z < 60) return winPix(x, Z, w[0], w[1], 50, 60, nt);
            if (Z >= 49.5 && Z < 60.5 && (inSpan(x, w[0] - 0.22, w[0] - 0.02) || inSpan(x, w[1] + 0.02, w[1] + 0.22))) { var s0 = x < w[0] ? w[0] - 0.22 : w[1] + 0.02; return shutPix(x, Z, s0, s0 + 0.2, 49.5, 60.5); }
          }
          if (D && inSpan(x, D[0], D[1]) && Z < 61.5) {
            var e = Math.min(x - D[0], D[1] - x) * 12;
            if (Z >= 51.5) return winPix(x, Z, D[0], D[1], 51.5, 61.5, nt);
            if (e < 1.1 || Math.abs(x - (D[0] + D[1]) / 2) * 12 < 0.6) return V.TIMD;
            return (Z > 50.5 || (e > 1.1 && e < 2)) ? V.TIM : '#7a4e2a';
          }
          for (k2 = 0; k2 < panF.length; k2++) if (inSpan(x, panF[k2][0], panF[k2][1])) { c = himis(x, Z, panF[k2][0], panF[k2][1], Z1 + 2.5, Z2 - 2.5, V.WASH); break; }
          if (!c) c = plaster(V.WASH, x, Z);
          if (Z > Z2 - 6.5) c = dark(c, 0.16);
          return c;
        },
        function (v, z) {
          var y = Y0 + v / 12, Z = Z1 + z, c, k2;
          if (Z < Z1 + 2.5) return Z < Z1 + 0.8 ? '#2e1d10' : '#3e2716';
          if (Z >= Z2 - 2.5) return V.TIMD;
          for (k2 = 0; k2 < g.uwin.length; k2++) {
            var ww = g.uwin[k2];
            if (inSpan(y, ww[0], ww[1]) && Z >= 50 && Z < 60) return dark(winPix(y, Z, ww[0], ww[1], 50, 60, nt), nt ? 0.05 : 0.12);
            if (Z >= 49.5 && Z < 60.5 && (inSpan(y, ww[0] - 0.22, ww[0] - 0.02) || inSpan(y, ww[1] + 0.02, ww[1] + 0.22))) { var s0 = y < ww[0] ? ww[0] - 0.22 : ww[1] + 0.02; return dark(shutPix(y, Z, s0, s0 + 0.2, 49.5, 60.5), 0.14); }
          }
          for (k2 = 0; k2 < panE.length; k2++) if (inSpan(y, panE[k2][0], panE[k2][1])) { c = himis(y, Z, panE[k2][0], panE[k2][1], Z1 + 2.5, Z2 - 2.5, V.WASHS); break; }
          if (!c) c = plaster(V.WASHS, y, Z);
          if (Z > Z2 - 6.5) c = dark(c, 0.14);
          return dark(c, 0.06);
        }, { norim: true });
      g.fwin.forEach(function (w) {
        if (dc.saksi) {                                                                                 /* pencere çiçekliği */
          box(b, w[0] - 0.04, YF, w[1] - w[0] + 0.08, 0.14, 46.5, 49.5, '#6a4426', K.woodV('#7a4e2a', 3), '#5a3a22', { norim: true });
          for (k = 0; k < 9; k++) { var fxw = w[0] + 0.02 + k * (w[1] - w[0]) / 8.5; pr(b, fxw, YF + 0.07, 49.5, -0.5, -1 - (k % 3 === 1 ? 1 : 0), 1, 1.5, k % 2 ? '#4f8a3a' : '#3f7a32'); if (k % 2 === 0) pr(b, fxw, YF + 0.07, 51, -0.5, -0.5 - (k % 4 === 0 ? 1 : 0), 1, 1, k % 4 ? '#e5533d' : '#d94a6a'); }
        }
        if (dc.tente) poly(b, [P3(w[0] - 0.1, YF, 62.5), P3(w[1] + 0.1, YF, 62.5), P3(w[1] + 0.1, YF + 0.34, 58.5), P3(w[0] - 0.1, YF + 0.34, 58.5)], function (X) { return ((X >> 2) & 1) ? '#f4efe2' : '#c8402e'; });
      });
      if (c2) cumbaBox(b, c2[0], c2[1], YF, 0.25, 2, nt);
      cumbaBox(b, BX0, BX1, YF, 0.3, 3, nt);
      if (dc.saksi) [BX0 + 0.15, BX1 - 0.55].forEach(function (sx0) { box(b, sx0, g.BY, 0.4, 0.12, 49, 51, '#6a4426', '#7a4e2a', '#5a3a22', { norim: true }); for (var j = 0; j < 5; j++) pr(b, sx0 + 0.04 + j * 0.08, g.BY + 0.06, 51, -0.5, -1 - (j & 1), 1, 1.5, j % 2 ? '#e5533d' : '#4f8a3a'); });
      if (g.balc) balcony(b, g.balc[0], g.balc[1], YF);
      /* --- ek (bulaşıkhane) çatısı: tek kat, üst katın doğu yüzüne dayanır --- */
      hipRoof(b, X0, Y0, g.AR, { fh: 2, tails: 6, caps: 4 });
    }
    /* --- kırma çatı (alaturka kiremit) + bacalar --- */
    var RR = g.RR, rr = hipRoof(b, X0, Y0, RR, { fh: 2.5, tails: 30, caps: 14, lace: lv >= 5 });
    for (k = 0; k < g.chim.length; k++) chimney(b, g.chim[k], RR);
    if (lv >= 5) [rr.A, rr.B].forEach(function (p) { var ax = R(fx(p[0], p[1])), ay = R(fy(p[0], p[1], rr.T + 1.5)); b.rect(ax, ay - 7, 1, 7, BRASS); b.rect(ax - 1, ay - 9, 3, 2, BRASSL); b.set(ax, ay - 10, BRASSL); });   /* mahya alemleri */
    if (g.kiosk) kioskDraw(b, g, nt);
    /* --- önde sarkan süsler: aşçıların ekran aralıklarında (yüzlerini örtmez) --- */
    var hy = (g.up ? YF : Y1 + 0.12) + 0.02, hz = g.up ? Z1 : Z1 - 3;
    if (dc.biber) { pepperString(b, g.hang[0], hy, hz, 4); pepperString(b, g.hang[1], hy, hz, 3); pepperString(b, g.hang[1] + 0.18, hy, hz, 2); pepperString(b, g.hang[2], hy, hz, 3); basket(b, g.hang[3], hy, hz); }
    if (dc.kafes) cageAt(b, XK - 0.3, (g.up ? YF : Y1 + 0.12) + 0.02, hz, nt);
    if (lv >= 5) { lantern(b, X0 + 0.1, YF + 0.05, Z1, nt); lantern(b, XB - 0.2, YF + 0.05, Z1, nt); }
    /* --- tabela --- */
    signDraw(b, g, nm, star, nt);
    b.outline(0.55);
  });
}
/* cumba: öne çıkan pencere kasası (nw pencere), alt pano, dirsekler */
function cumbaBox(b, x0, x1, YF, d, nw, nt) {
  var Z1 = HG - 3, Z2 = HG + HU, BY = YF + d;
  box(b, x0, YF, x1 - x0, d, Z1 + 2, Z2, NONE,
    function (u, z) {
      var x = x0 + u / 12, Z = Z1 + 2 + z, dd = Math.min(x - x0, x1 - x) * 12, pw = (x1 - x0 - 0.16) / nw;
      if (Z < Z1 + 4) return Z < Z1 + 2.8 ? '#3e2716' : V.TIMD;
      if (Z >= Z2 - 3) return Z > Z2 - 1.2 ? V.TIML : V.TIM;
      if (dd < 1.1) return V.TIM;
      if (Z < 50.5) return (Math.floor(u * 1.2) % 4 === 0) ? '#5a3a22' : (Z > 49.5 ? V.TIML : '#7a4e2a');          /* ahşap alt pano */
      var j = clamp(Math.floor((x - x0 - 0.08) / pw), 0, nw - 1), p0 = x0 + 0.08 + j * pw;
      return winPix(x, Z, p0 + 0.03, p0 + pw - 0.03, 50.5, Z2 - 3, nt);
    },
    function (v, z) {
      var y = YF + v / 12, Z = Z1 + 2 + z;
      if (Z < Z1 + 4 || Z >= Z2 - 3) return V.TIMD;
      if (Z < 50.5) return '#5d3c1c';
      return dark(winPix(y, Z, YF + 0.04, BY - 0.04, 50.5, Z2 - 3, nt), 0.14);
    }, { norim: true });
  var br = nw > 2 ? [x0 + 0.06, (x0 + x1) / 2, x1 - 0.06] : [x0 + 0.06, x1 - 0.06];
  br.forEach(function (xb) { line(b, fx(xb, YF + 0.02), fy(xb, YF + 0.02, Z1 - 2), fx(xb, BY - 0.02), fy(xb, BY - 0.02, Z1 + 2), V.TIMD); line(b, fx(xb, YF + 0.02) + 1, fy(xb, YF + 0.02, Z1 - 2), fx(xb, BY - 0.02) + 1, fy(xb, BY - 0.02, Z1 + 2), V.TIM); });
}
/* ahşap balkon (Sv3+): üst katın doğu ucunda, taban z 45,5 (aşçıların başı örtülmez) */
function balcony(b, x0, x1, YF) {
  var D = 0.42, zf = 47, zt = 48.5, zr = 54.5, yr = YF + D - 0.03, k;          /* V3: taban z 47 (alttaki aşçıların başı açık) */
  [x0 + 0.15, (x0 + x1) / 2, x1 - 0.12].forEach(function (xb) { line(b, fx(xb, YF + 0.02), fy(xb, YF + 0.02, HG - 3.5), fx(xb, YF + D - 0.05), fy(xb, YF + D - 0.05, zf), V.TIMD); line(b, fx(xb, YF + 0.02) + 1, fy(xb, YF + 0.02, HG - 3.5), fx(xb, YF + D - 0.05) + 1, fy(xb, YF + D - 0.05, zf), V.TIM); });
  box(b, x0, YF, x1 - x0, D, zf, zt, function (u) { return (Math.floor(u / 2.2) & 1) ? '#9a6a3a' : '#a8784a'; }, V.TIM, V.TIMD, { norim: true });
  [[x0 + 0.45, '#e5533d'], [x1 - 0.5, '#d94a6a']].forEach(function (p) {                                        /* sardunya saksıları */
    pr(b, p[0], YF + 0.2, zt, -1.5, -3, 3, 3, '#b4643e'); pr(b, p[0], YF + 0.2, zt, -1.5, -3, 1, 3, '#c97a50');
    pr(b, p[0], YF + 0.2, zt + 3, -2, -2, 4, 2, '#4f8a3a'); pr(b, p[0], YF + 0.2, zt + 4, -1, -1.5, 1, 1, p[1]); pr(b, p[0], YF + 0.2, zt + 4, 0.5, -1, 1, 1, p[1]);
  });
  for (k = YF + 0.06; k < YF + D; k += 0.12) vl(b, x1 - 0.03, k, zt, zr, V.TIMD, 1);
  for (k = x0 + 0.06; k < x1 - 0.02; k += 0.15) vl(b, k, yr, zt, zr, (R(k * 20) & 1) ? V.TIM : V.TIMD, 1);
  hl(b, x0, yr, x1, yr, zt + 2, V.TIMD);
  hl(b, x1 - 0.03, YF, x1 - 0.03, YF + D, zr, V.TIM);
  hl(b, x0, yr, x1, yr, zr, V.TIML); hl(b, x0, yr, x1, yr, zr - 0.6, V.TIM);
}
function lantern(b, x, y, z, nt) {                                    /* asılı fener (Sv5) */
  var X = R(fx(x, y)), Y = R(fy(x, y, z));
  b.rect(X, Y, 1, 4, '#2e2e32'); b.rect(X - 3, Y + 4, 7, 1, '#3a2a1c'); b.rect(X - 2, Y + 5, 5, 7, '#2e2e32');
  b.rect(X - 1, Y + 6, 3, 5, nt ? '#ffd98f' : '#c9b27a'); b.set(X - 1, Y + 6, nt ? '#fff2c4' : '#e8d9a0'); b.rect(X - 2, Y + 12, 5, 1, '#3a2a1c'); b.set(X, Y + 13, BRASS);
}
/* çatı köşkü (Sv5): mahyaya oturan küçük ahşap köşk, iki yüzde ikişer pencere, piramit çatı, tepe feneri */
function kioskDraw(b, g, nt) {
  var Kq = g.kiosk, h = Kq.h, kx = Kq.x, ky = Kq.y, Q = g.RR, z0 = g.top - (RH / g.ri) * h - 1.5, zb = g.top + 1, zt = g.top + 13;
  box(b, kx - h, ky - h, 2 * h, 2 * h, z0, zt, NONE,
    function (u, z) {
      var x = kx - h + u / 12, Z = z0 + z;
      if (Z < roofZ(Q, x, ky + h) - 0.4) return null;
      if (Z > zt - 2.2) return Z > zt - 1 ? V.TIML : V.TIM;
      if (Z < zb) return V.TIMD;
      if ((x - (kx - h)) * 12 < 1.2 || ((kx + h) - x) * 12 < 1.2) return V.TIM;
      var pw = (2 * h - 0.2) / 2, j = clamp(Math.floor((x - (kx - h) - 0.1) / pw), 0, 1), p0 = kx - h + 0.1 + j * pw;
      if (Z >= zb + 0.5 && Z < zb + 2) return V.TIML;                                                         /* denizlik */
      return winPix(x, Z, p0 + 0.04, p0 + pw - 0.04, zb + 2, zt - 2.2, nt);
    },
    function (v, z) {
      var y = ky - h + v / 12, Z = z0 + z;
      if (Z < roofZ(Q, kx + h, y) - 0.4) return null;
      if (Z > zt - 2.2 || Z < zb) return V.TIMD;
      if ((y - (ky - h)) * 12 < 1.2 || ((ky + h) - y) * 12 < 1.2) return V.TIMD;
      var pw = (2 * h - 0.2) / 2, j = clamp(Math.floor((y - (ky - h) - 0.1) / pw), 0, 1), p0 = ky - h + 0.1 + j * pw;
      return dark(winPix(y, Z, p0 + 0.04, p0 + pw - 0.04, zb + 2, zt - 2.2, nt), nt ? 0.05 : 0.14);
    }, { norim: true });
  var rr = hipRoof(b, g.X0, g.Y0, { x0: kx - h - 0.16, x1: kx + h + 0.16, y0: ky - h - 0.16, y1: ky + h + 0.16, z: zt, h: 8 }, { fh: 1.5, tails: 0, caps: 0 });
  var ax = R(fx(rr.A[0], rr.A[1])), ay = R(fy(rr.A[0], rr.A[1], rr.T));                                   /* tepe feneri + alem */
  b.rect(ax - 1, ay - 3, 2, 4, '#3a2a1c'); b.rect(ax - 4, ay - 4, 8, 1, '#4a3a2a');
  b.rect(ax - 3, ay - 11, 6, 7, '#2e2e32'); b.rect(ax - 2, ay - 10, 4, 5, nt ? '#ffd98f' : '#c9b27a'); b.set(ax - 2, ay - 10, nt ? '#fff2c4' : '#e8d9a0');
  b.rect(ax - 4, ay - 12, 8, 1, '#4a3a2a'); b.rect(ax - 2, ay - 14, 4, 2, '#4a3a2a'); b.rect(ax, ay - 18, 1, 4, BRASS); b.set(ax, ay - 19, BRASSL);
}
/* tabela: Sv1–2 mahyada direkli, Sv3+ cumbanın üstünde saçağa oturur (ekrana düz → okunur). Sv4 altın çerçeve; Sv5 çift çerçeve, tepelik (hamsi), yan fenerler, ampuller */
function signGeom(nm, S) {
  var lines = [nm], s = 2, tw = 0;                                    /* V3: geniş çatıda tek satır (telefonda okunur) */
  lines.forEach(function (l) { tw = Math.max(tw, L.textW(l) * s); });
  return { lines: lines, s: s, W: tw + 12, H: lines.length * 13 + 14 };
}
function signDraw(b, g, nm, star, nt) {
  var S = g.sign, lv = g.lv, sg = signGeom(nm, S), W = sg.W, H = sg.H, s = sg.s, k, j;
  var cx = R(fx(S.x, S.y)), by = R(fy(S.x, S.y, S.z)) - S.lift, x0 = cx - Math.floor(W / 2), y0 = by - H;
  var leg = S.lift + 4;
  b.rect(x0 + 6, y0 + H - 1, 2, leg, V.TIMD); b.rect(x0 + W - 8, y0 + H - 1, 2, leg, V.TIMD);                              /* ayaklar */
  if (S.ridge) { b.rect(x0 + 4, by + 2, 6, 1, V.TIM); b.rect(x0 + W - 10, by + 2, 6, 1, V.TIM); }
  if (lv >= 5) {                                                                                                       /* tepelik: altın kemer, içinde hamsi */
    var tx0 = cx, ty0 = y0;
    for (j = 0; j < 8; j++) { var hw = R(14 * Math.sqrt(Math.max(0, 1 - Math.pow((7 - j) / 8, 2)))); b.rect(tx0 - hw, ty0 - 8 + j, hw * 2 + 1, 1, '#c9952f'); if (j > 1 && hw > 2) b.rect(tx0 - hw + 2, ty0 - 8 + j, hw * 2 - 3, 1, j < 3 ? '#e6be59' : '#6e4526'); }
    b.rect(tx0 - 4, ty0 - 4, 7, 2, '#bcd8e6'); b.rect(tx0 - 3, ty0 - 5, 5, 1, '#7aa6bf'); b.set(tx0 + 3, ty0 - 5, '#7aa6bf'); b.set(tx0 + 3, ty0 - 2, '#7aa6bf'); b.set(tx0 + 4, ty0 - 6, '#7aa6bf'); b.set(tx0 + 4, ty0 - 1, '#7aa6bf'); b.set(tx0 - 3, ty0 - 4, '#20303a');
    b.set(tx0, ty0 - 10, BRASSL); b.rect(tx0 - 1, ty0 - 9, 3, 1, BRASS);
  }
  var fr = lv >= 5 ? '#e6be59' : lv >= 4 ? '#c9952f' : '#8a5a32';
  b.rect(x0, y0, W, H, '#3e2716'); b.rect(x0 + 1, y0 + 1, W - 2, H - 2, fr);
  var i0 = lv >= 5 ? 3 : 2;
  if (lv >= 5) b.rect(x0 + 2, y0 + 2, W - 4, H - 4, '#8a5a32');
  b.rect(x0 + i0, y0 + i0, W - 2 * i0, H - 2 * i0, '#6e4526');
  for (k = y0 + 5; k < y0 + H - 2; k += 6) b.rect(x0 + i0, k, W - 2 * i0, 1, '#62401f');                                   /* tahta derzi */
  b.rect(x0 + i0, y0 + i0, W - 2 * i0, 1, '#8f5f36');
  for (k = 0; k < 3; k++) { b.set(x0 + i0 + 1 + k * 2, y0 + i0 + 1, '#c8553d'); b.set(x0 + W - i0 - 2 - k * 2, y0 + i0 + 1, '#c8553d'); }
  sg.lines.forEach(function (l, i) { var lx = cx - Math.floor(L.textW(l) * s / 2), ly = y0 + 7 + i * 13; bigTxt(b, l, lx, ly + 1, '#2e1d10', s); bigTxt(b, l, lx, ly, '#f4e9d2', s); });
  for (k = 0; k < 5; k++) {                                                                                             /* yıldızlar */
    var on = k < star, sx0 = cx - 17 + k * 7, sy0 = y0 + H - 8;
    for (var r = 0; r < 4; r++) for (var c2 = 0; c2 < 5; c2++) if (STAR5[r].charAt(c2) === 'x') b.set(sx0 + c2, sy0 + r, on ? (r === 0 ? '#fff0a0' : '#ffd23a') : '#4a3220');
  }
  if (lv >= 5) for (k = x0 + 3; k < x0 + W - 2; k += 5) { b.set(k, y0, nt ? '#fff2c4' : '#fff0a0'); b.set(k, y0 + H - 1, nt ? '#fff2c4' : '#fff0a0'); }   /* çerçeve ampulleri */
  if (g.dc && g.dc.fenertab) {                                                                                         /* Fenerli Çatı Tabelası süsü: iki yanda fener */
    [[x0 - 6, x0 - 1], [x0 + W, x0 + W + 5]].forEach(function (p, i) {
      var lx = i ? p[1] : p[0];
      b.rect(p[0], y0 + 5, 6, 1, '#2e2e32'); b.rect(lx, y0 + 6, 1, 2, '#2e2e32');
      b.rect(lx - 2, y0 + 8, 5, 1, '#3a2a1c'); b.rect(lx - 2, y0 + 9, 5, 7, '#2e2e32'); b.rect(lx - 1, y0 + 10, 3, 5, nt ? '#ffd98f' : '#c9b27a'); b.set(lx - 1, y0 + 10, nt ? '#fff2c4' : '#e8d9a0'); b.rect(lx - 1, y0 + 16, 3, 1, '#3a2a1c');
    });
  } else {                                                                                                             /* tabela lambaları */
    b.rect(x0 + 4, y0 - 3, 1, 3, '#2e2e32'); b.rect(x0 + 4, y0 - 3, 4, 1, '#2e2e32'); b.rect(x0 + 6, y0 - 2, 3, 2, '#3a3a40');
    b.rect(x0 + W - 5, y0 - 3, 1, 3, '#2e2e32'); b.rect(x0 + W - 8, y0 - 3, 4, 1, '#2e2e32'); b.rect(x0 + W - 9, y0 - 2, 3, 2, '#3a3a40');
    if (nt) { b.rect(x0 + 6, y0, 3, 1, '#fff2c4'); b.rect(x0 + W - 9, y0, 3, 1, '#fff2c4'); }
  }
}
function bigTxt(b, str, x, y, c, s) {
  var tmp = L.buf(), up = String(str).toLocaleUpperCase('tr'), i;
  L.text(tmp, up.replace(/İ/g, 'I'), 0, 0, '#000');
  for (i = 0; i < up.length; i++) if (up[i] === 'İ') tmp.set(i * 4 + 1, -2, '#000');      /* İ: düz I + üst nokta */
  tmp.p.forEach(function (v, k) { var X = (k % 8192) - 4096, Y = Math.floor(k / 8192) - 4096; b.rect(x + X * s, y + Y * s, s, s, c); });
}
function splitTwo(s) {
  if (s.length <= 9 || s.indexOf(' ') < 0) return [s];
  var best = -1, bd = 99;
  for (var i = 0; i < s.length; i++) if (s[i] === ' ' && Math.abs(i - s.length / 2) < bd) { bd = Math.abs(i - s.length / 2); best = i; }
  return [s.slice(0, best), s.slice(best + 1)];
}
var TK_STASH = null;                                               /* fişler aynı karede 'back' (sil) → 'tickets' (sakla) → 'pass' (çiz) sırasıyla */
function houseName() { var NM = gf('NM'), UP = gf('UP'); return (UP && NM) ? UP(NM({ tr: 'SAHİL LOKANTASI', en: 'SEASIDE RESTAURANT' })) : 'SAHİL LOKANTASI'; }
HKA.drawLokHouse = function (o) {
  if (!o || !o.part || !(o.x1 > o.x0)) return false;
  if (o.part === 'back') { TK_STASH = null; at(houseBackSpr(o), o.x0, o.y0, 0); return true; }
  var nm = houseName(), t = o.t || T(), g = hGeo(o), k;
  at(houseFrontSpr(o, nm), o.x0, o.y0, 0);
  if (o.night) {                                                    /* gece: pencere, köşk, tabela ışığı + mutfak zemininde ocak ışığı */
    for (k = 0; k < g.glow.length; k++) { var q = g.glow[k]; L.fr(R(pX(q[0], q[1])), R(pY(q[0], q[1], q[2])), -q[3] - 4, -(q[4] >> 1) - 4, q[3] * 2 + 8, q[4] + 8, 'rgba(255,214,140,.13)'); }
    var S = g.sign, sg = signGeom(nm, S), sx = R(pX(S.x, S.y)), sy = R(pY(S.x, S.y, S.z)), hw = (sg.W >> 1) + (g.dc.fenertab ? 16 : 8);
    L.fr(sx, sy, -hw, -S.lift - sg.H - 6, hw * 2, sg.H + 8, 'rgba(255,220,150,' + (g.dc.fenertab ? '.17' : '.11') + ')');
    var fl = gv('LOK_STX') || [18.6, 20.4, 22.2, 24.0];
    for (k = 0; k < fl.length; k++) L.fr(R(pX(fl[k], o.y1 - 0.3)), R(pY(fl[k], o.y1 - 0.3, 0)), -16, -6, 32, 10, 'rgba(255,170,80,.11)');
  }
  var lvl = 0.25 + (o.smoke || 0) * 0.75;                          /* baca dumanı: çalışan istasyon arttıkça yoğunlaşır */
  for (var c = 0; c < g.chim.length; c++) {
    var ch = g.chim[c], bx = R(pX(ch.x, ch.y)), by = R(pY(ch.x, ch.y, ch.z1 + 7)), n = c ? 4 : 6;
    for (k = 0; k < n; k++) {
      var ph = (t * (0.3 + lvl * 0.2) + k / n + c * 0.37) % 1, rr = R((2 + ph * 7) * (c ? 0.75 : 1)), al = ((1 - ph) * (0.2 + 0.35 * lvl) * ch.a).toFixed(2), ox = R(ph * 26 + Math.sin(t * 1.3 + k * 2 + c) * 3), oy = -R(ph * 44 * (c ? 0.8 : 1));
      L.fr(bx, by, ox - rr, oy - rr, rr * 2, rr * 2, 'rgba(236,232,224,' + al + ')'); L.fr(bx, by, ox - rr + 2, oy - rr - 1, Math.max(1, rr * 2 - 4), 1, 'rgba(250,248,240,' + al + ')');
    }
  }
  return true;
};
HKA.onReset(function () { GEO = {}; });
/* alçak taş duvar: kaba taş, badanalı kapak taşı */
function lowWall(b, x0, y0, x1, y1, h, seed) {
  box(b, x0, y0, x1 - x0, y1 - y0, 0, h, function (u, v) { return (u < 0.7 || v < 0.7) ? '#f4efe2' : (hash(R(u), R(v)) > 0.85 ? '#d8d0bc' : '#e8e1d0'); },
    function (u, z) { return z > h - 1.6 ? '#d6cebb' : stoneAt(x0 + u / 12, z, seed); },
    function (v, z) { return z > h - 1.6 ? '#bdb5a2' : dark(stoneAt(y0 + v / 12, z, seed + 1), 0.12); }, { norim: true });
}
function pillar(b, x, y, h) {
  box(b, x - 0.15, y - 0.15, 0.3, 0.3, 0, h, '#e8e1d0', function (u, z) { return stoneAt(x + u / 12, z, 41); }, function (v, z) { return dark(stoneAt(y + v / 12, z, 42), 0.12); }, { norim: true });
  box(b, x - 0.19, y - 0.19, 0.38, 0.38, h, h + 2, function (u, v) { return (u < 0.7 || v < 0.7) ? '#fffaf0' : '#f1ebdc'; }, '#d6cebb', '#bdb5a2');
}
/* ---------- teras (V3): taş döşeme, ev önü tuğla şerit, kapıdan giren taş yol, KD bahçe (çimen, çakıl, çiçeklik) ---------- */
function gardenAt(x, y, Xb, Yb, A, H) {
  var g = hash(Xb, Yb), c;
  if (y < A.y0 + 0.42) {                                             /* çit dibinde çiçeklik: koyu toprak + çiçek */
    c = g > 0.9 ? '#e5533d' : g > 0.84 ? '#f2c12e' : g > 0.78 ? '#d94a6a' : g > 0.5 ? '#4f8a3a' : hash(Xb >> 1, Yb) > 0.5 ? '#6a4a30' : '#5a3d26';
    return c;
  }
  if (x < H.x1 + 0.38) { var q = hash(Xb >> 1, Yb >> 1); return q > 0.85 ? '#a8a294' : q > 0.6 ? '#c4b9a0' : '#b4a98f'; }   /* duvar dibi çakıl */
  var px0 = 32.45, px1 = 33.05;                                      /* basamak taşları (teras → bahçe kuzeyi) */
  if (x > px0 && x < px1 && y > A.y0 + 0.5) {
    var st = Math.floor((y - A.y0) / 0.42), ly = frac((y - A.y0) / 0.42), lx = (x - px0) / (px1 - px0);
    if (ly > 0.12 && ly < 0.88 && lx > 0.1 && lx < 0.9) { c = ['#cfc5ad', '#c6bba1', '#d6ccb5'][st % 3]; return ly < 0.26 || lx < 0.22 ? lite(c, 0.12) : c; }
    return g > 0.5 ? '#7a9a48' : '#6a8a3a';
  }
  var t = hash(Xb >> 2, Yb >> 1) * 0.6 + hash(Xb >> 3, Yb >> 2) * 0.4, b = L.bayer[Yb & 3][Xb & 3];
  c = t + b * 0.25 > 0.78 ? '#8dae58' : t + b * 0.25 > 0.42 ? '#7a9e4a' : '#6a8e40';
  if (g > 0.985) return '#f4efe2'; if (g > 0.975) return '#f2c12e';  /* papatya */
  if (g < 0.04) return '#5a7a34';
  return c;
}
function paveAt(x, y, Xb, Yb, A, H, gate, gap, perg) {
  var e = Math.min(x - A.x0, A.x1 - x, y - A.y0, A.y1 - y), g = hash(Xb, Yb), c;
  if (e < 0.05) return '#7d725c';
  if (x > H.x1 && y < 16.6) return gardenAt(x, y, Xb, Yb, A, H);
  if (x > H.x1 && y < 16.78) { var cu0 = frac(x / 0.5); return cu0 < 0.06 ? '#8a7f68' : (y < 16.66 ? '#e2d9c2' : '#bdb299'); }   /* bahçe bordürü */
  if (y < H.y0 || (x < H.x0 && y < H.y1)) {                          /* evin arkası / batı yanı: sıkışmış toprak + yassı taş */
    var cu = Math.floor(x / 0.42), cv = Math.floor(y / 0.42), lu = frac(x / 0.42) - 0.5, lv = frac(y / 0.42) - 0.5, hs = hash(cu + 70, cv + 3);
    if (hs > 0.35 && Math.abs(lu) + Math.abs(lv) * 1.1 < 0.36 + hs * 0.08) { c = ['#a8a294', '#b6b0a1', '#9c9686'][Math.floor(hs * 30) % 3]; return lu + lv < -0.3 ? lite(c, 0.12) : c; }
    return g > 0.92 ? '#a08a62' : g < 0.05 ? '#cdb994' : (hash(Xb >> 2, Yb >> 2) > 0.6 ? '#b9a27a' : '#b19a71');
  }
  if (x < A.x0 + 0.9 && y > gap[0] && y < gap[1]) {                  /* kapı eşiği: Karadeniz çakıl döşemesi */
    var pu = frac(x / 0.16) - 0.5, pv = frac(y / 0.16) - 0.5, hp = hash(Math.floor(x / 0.16), Math.floor(y / 0.16) + 500);
    if (pu * pu + pv * pv * 1.6 > 0.2) return '#8a7f68';
    var ring = Math.abs(Math.hypot(x - (A.x0 + 0.45), (y - gate.y) * 1.0) - 0.36) < 0.08;
    return ring ? (hp > 0.5 ? '#3e4a52' : '#4a565e') : (hp > 0.6 ? '#e8e0cc' : hp > 0.3 ? '#d8cfb8' : '#c9bfa6');
  }
  if (e < 0.32 && (x - A.x0 < 0.32 || A.x1 - x < 0.32 || A.y1 - y < 0.32)) {   /* duvar dibi bordür */
    var along = (x - A.x0 < 0.32 || A.x1 - x < 0.32) ? y : x;
    if (frac(along / 0.55) < 0.07 || e > 0.28) return '#8a7f68';
    c = e < 0.12 ? '#bdb299' : '#a99d84'; return g > 0.93 ? dark(c, 0.07) : c;
  }
  if (y < H.y1 + 0.85 && x < H.x1) {                                 /* ev önü: tuğla döşeme (ocakbaşı önü) */
    var by = (y - H.y1) / 0.17, br = Math.floor(by), bx = (x + (br & 1) * 0.17) / 0.34, bc = Math.floor(bx);
    if (frac(by) < 0.16 || frac(bx) < 0.08) c = '#8a5a44';
    else { c = ['#b5714f', '#a8664a', '#bf7a55', '#9e6046'][Math.floor(hash(bc + 300, br) * 4)]; if (frac(by) < 0.36) c = lite(c, 0.08); }
    return dark(c, 0.14 * clamp((H.y1 + 0.5 - y) / 0.5, 0, 1));        /* saçak gölgesi */
  }
  var gy0 = gate.y - 0.4, gy1 = gate.y + 0.4;
  if (y > gy0 && y < gy1 && x < 34.6) {                              /* kapıdan giren yol: büyük kesme taş, tuğla kenar */
    if (y - gy0 < 0.08 || gy1 - y < 0.08) return frac(x / 0.17) < 0.12 ? '#7a4634' : '#a8664a';
    var sq = Math.floor((x - A.x0) / 0.8), lq = frac((x - A.x0) / 0.8);
    if (lq < 0.05) return '#8f846c';
    c = ['#ddd3bb', '#d3c9b0', '#e2d9c2'][Math.floor(hash(sq + 900, 1) * 3)];
    return lq < 0.12 || (y - gy0) < 0.14 ? lite(c, 0.08) : (g > 0.95 ? dark(c, 0.05) : c);
  }
  var gx = (x - A.x0 - 0.32) / 0.6, gy = (y - A.y0 - 0.32) / 0.6, cj = Math.floor(gy);
  if (cj & 1) gx += 0.5;
  var ci = Math.floor(gx), lx = gx - ci, ly = gy - cj;
  if (lx < 0.06 || ly < 0.06) c = hash(ci * 3 + 1, cj * 7) > 0.8 && g > 0.4 ? V.MOSS : V.DZ;
  else {
    var hs2 = hash(ci + 11, cj * 5);
    c = V.PAVE[Math.floor(hs2 * V.PAVE.length)];
    if (lx < 0.13 || ly < 0.13) c = lite(c, 0.14); else if (lx > 0.92 || ly > 0.92) c = dark(c, 0.1);
    if (hs2 > 0.9 && Math.abs(lx - ly - 0.1) < 0.025) c = dark(c, 0.2);
    if (g > 0.95) c = dark(c, 0.05); else if (g < 0.03) c = lite(c, 0.1);
  }
  if (perg && x > perg.x0 && x < perg.x1 && y > perg.y0 && y < perg.y1) {   /* asma çardağın benekli gölgesi */
    var sh = hash(Math.floor(x / 0.22) + 50, Math.floor(y / 0.22)) * 0.7 + hash(Math.floor(x / 0.5), Math.floor(y / 0.5) + 70) * 0.3;
    if (sh > 0.45) c = dark(c, sh > 0.75 ? 0.22 : 0.14);
  }
  return c;
}
function terrFloorSpr(o) {
  var A = o.area, H = o.house || { x0: 15.6, y0: 13.5, x1: 28.8, y1: 16.9 }, gate = o.gate || { x: A.x0, y: 20.4 }, gap = o.gap || [19.8, 21.0];
  var perg = o.up && o.up.ter && o.pergola ? o.pergola : null;
  return spr('lkTF3|' + [A.x0, A.y0, A.x1, A.y1, H.x0, H.y0, H.x1, H.y1, gate.y, gap[0], gap[1]].join(',') + '|' + (perg ? [perg.x0, perg.x1, perg.y0, perg.y1].join(':') : '-') + '|' + G().K, A.x0, A.y0, function (b) {
    quadW(b, A.x0, A.y0, A.x1 - A.x0, A.y1 - A.y0, 0, function (Xb, Yb) { var w = inv(Xb, Yb, 0, A.x0, A.y0); return paveAt(w[0], w[1], Xb, Yb, A, H, gate, gap, perg); });
    for (var i = 0; i < 18; i++) {                                    /* duvar diplerinde ot öbekleri */
      var u = hash(i, 77), p = i < 8 ? [A.x0 + 0.5 + u * (A.x1 - A.x0 - 1), A.y1 - 0.38] : i < 13 ? [A.x1 - 0.32, 17.1 + u * 5.8] : [A.x0 + 0.3, (i & 1 ? 14 + u * 4.5 : 21.4 + u * 1.6)];
      var X = R(fx(p[0], p[1])), Y = R(fy(p[0], p[1], 0));
      for (var k = 0; k < 4; k++) b.rect(X - 3 + k * 2, Y - 1 - (k & 1), 1, 2 + (k & 1), (i + k) % 2 ? '#7f9a4a' : '#6a8a3a');
    }
  });
}
/* batı alçak duvarı (kapı boşluklu; kapı payelerini giriş kapısı çizer) + kuzey bahçe çiti (kuzeydeki her şeyden önce çizilsin diye burada) */
function picket(b, x0, x1, y, h, seed) {
  lowWall(b, x0, y, x1, y + 0.16, 4, seed);
  for (var x = x0 + 0.06; x < x1 - 0.02; x += 0.13) {
    vl(b, x, y + 0.1, 4, h, '#e8e2d2', 2); pr(b, x, y + 0.1, h, 0, -1, 1, 1, '#ffffff');
  }
  hl(b, x0, y + 0.1, x1, y + 0.1, h - 2, '#2a85b0'); hl(b, x0, y + 0.1, x1, y + 0.1, 7, '#2a85b0');
}
function westSpr(o) {
  var A = o.area, g = o.gap || [19.8, 21.0], H = o.house || { x0: 15.6, y0: 13.5, x1: 28.8, y1: 16.9 };
  return spr('lkTW3|' + [A.x0, A.y0, A.x1, A.y1, g[0], g[1], H.x0, H.x1].join(',') + '|' + G().K, A.x0, A.y0, function (b) {
    lowWall(b, A.x0, A.y0 + 0.02, H.x0 - 0.02, A.y0 + 0.2, 8, 49);                                       /* KB köşe */
    picket(b, H.x1 + 0.02, A.x1 - 0.2, A.y0 + 0.02, 12, 57);                                              /* bahçe çiti */
    pillar(b, H.x1 + 0.15, A.y0 + 0.12, 13);
    lowWall(b, A.x0, A.y0, A.x0 + 0.2, g[0] - 0.12, 8, 51);
    lowWall(b, A.x0, g[1] + 0.12, A.x0 + 0.2, A.y1 - 0.05, 8, 53);
    pillar(b, A.x0 + 0.1, A.y0 + 0.15, 11);
    b.outline(0.55);
  });
}
var SPOST = null;
function terrPosts(A) {
  var kk = [A.x0, A.y0, A.x1, A.y1].join(',');
  if (SPOST && SPOST.k === kk) return SPOST;
  var s = [], e = [], k;
  for (k = 0; k < 6; k++) s.push([A.x0 + 0.17 + k * (A.x1 - A.x0 - 0.34) / 5, A.y1 - 0.15]);
  [A.y0 + 3.4, A.y0 + 6.9].forEach(function (y) { e.push([A.x1 - 0.12, y]); });
  e.push(s[5]);
  return (SPOST = { k: kk, s: s, e: e });
}
function southSpr(o) {
  var A = o.area, P0 = terrPosts(A);
  return spr('lkTS3|' + [A.x0, A.y0, A.x1, A.y1].join(',') + '|' + G().K, A.x0, A.y0, function (b) {
    lowWall(b, A.x1 - 0.2, A.y0, A.x1, A.y1 - 0.3, 8, 61);
    lowWall(b, A.x0, A.y1 - 0.3, A.x1, A.y1, 8, 63);
    P0.e.slice(0, 2).forEach(function (p) { pillar(b, p[0] - 0.03, p[1], 12); });
    P0.s.forEach(function (p) { pillar(b, p[0], p[1], 12); });
    pillar(b, A.x1 - 0.12, A.y0 + 0.15, 13);
    b.outline(0.55);
  });
}
/* ampul zinciri: iki dünya noktası arası sarkık tel + ampuller (gece yanar) */
function bulbChain(x0, y0, z0, x1, y1, z1, n, sag, night, t, al) {
  var i, u, x, y, z, X, Y, pX0 = R(pX(x0, y0)), pY0 = R(pY(x0, y0, 0));
  var kk = G().K, ns = Math.max(12, Math.ceil(Math.abs(pX(x1, y1) - pX(x0, y0)) * kk + Math.abs(pY(x1, y1, z1) - pY(x0, y0, z0)) * kk)), lx = 1e9, ly = 1e9, wc = 'rgba(58,42,26,' + (al || 0.75) + ')';
  for (i = 0; i <= ns; i++) {                                     /* sürekli tel (ince piksel adımı) */
    u = i / ns; x = x0 + (x1 - x0) * u; y = y0 + (y1 - y0) * u; z = z0 + (z1 - z0) * u - sag * Math.sin(Math.PI * u);
    var fx0 = R((pX(x, y) - pX(x0, y0)) * kk), fy0 = R((pY(x, y, z) - pY(x0, y0, 0)) * kk);
    if (fx0 === lx && fy0 === ly) continue; lx = fx0; ly = fy0;
    L.fr(pX0, pY0, fx0, fy0, 1, 1, wc);
  }
  for (i = 1; i < n; i++) {
    u = i / n; x = x0 + (x1 - x0) * u; y = y0 + (y1 - y0) * u; z = z0 + (z1 - z0) * u - sag * Math.sin(Math.PI * u);
    X = R(pX(x, y)); Y = R(pY(x, y, z));
    if (night) { L.fr(X, Y, -5, -3, 11, 11, 'rgba(255,214,140,' + (0.22 + 0.06 * Math.sin(t * 3 + i)).toFixed(2) + ')'); L.fr(X, Y, -3, -1, 7, 7, 'rgba(255,224,160,.3)'); L.fr(X, Y, -1, 1, 3, 3, '#ffe9a0'); L.fr(X, Y, 0, 1, 1, 1, '#fffbe0'); }
    else { L.fr(X, Y, -1, 1, 3, 3, i % 2 ? '#e8dcb0' : '#d9c58a'); L.fr(X, Y, -1, 1, 1, 1, '#fff8e0'); }
  }
}
function pergolaSpr(P) {
  return spr('lkPG|' + [P.x0, P.x1, P.y0, P.y1].join(',') + '|' + G().K, P.x0, P.y0, function (b) {
    var tz = 36, k, W = '#8a5a34', WD = '#5a3a22', WL = '#a87444';
    var cs = [[P.x0, P.y0], [P.x1, P.y0], [P.x0, P.y1], [P.x1, P.y1]];
    function post(p) { box(b, p[0] - 0.05, p[1] - 0.05, 0.1, 0.1, 0, tz, WL, W, WD, { norim: true }); }
    post(cs[0]); post(cs[1]);
    box(b, P.x0 - 0.05, P.y0 - 0.04, P.x1 - P.x0 + 0.1, 0.08, tz, tz + 2, WL, W, WD, { norim: true });            /* kuzey kirişi */
    box(b, P.x0 - 0.04, P.y0, 0.08, P.y1 - P.y0, tz, tz + 2, WL, W, WD, { norim: true });                          /* batı */
    for (k = 1; k < 5; k++) { var rx = P.x0 + (P.x1 - P.x0) * k / 5; hl(b, rx, P.y0, rx, P.y1, tz + 2.5, WD); }   /* ince mertekler */
    box(b, P.x1 - 0.04, P.y0, 0.08, P.y1 - P.y0, tz, tz + 2, WL, W, WD, { norim: true });                          /* doğu */
    post(cs[2]); post(cs[3]);
    box(b, P.x0 - 0.05, P.y1 - 0.04, P.x1 - P.x0 + 0.1, 0.08, tz, tz + 2, WL, W, WD, { norim: true });            /* güney kirişi */
    /* asma: direklere sarılan gövde + köşelerde ve kirişlerde seyrek yaprak (ortası açık) */
    cs.forEach(function (p, i) {
      var X = R(fx(p[0], p[1])), Y0 = R(fy(p[0], p[1], 0)), Yt = R(fy(p[0], p[1], tz));
      for (var y = Y0 - 2; y > Yt; y--) b.set(X + (Math.floor((y + i * 3) / 3) % 2 ? -1 : 2), y, '#5d4a2a');
      for (var j = 0; j < 3; j++) { var yy = Y0 - 10 - j * 14 - (i * 3) % 7; leaf(b, X + (j & 1 ? 3 : -3), yy, (i + j) % 3); }
    });
    var spots = [];
    for (k = 0; k < 4; k++) { var c = cs[k]; spots.push([c[0] + (k & 1 ? -0.2 : 0.2), c[1] + (k > 1 ? -0.1 : 0.1)], [c[0] + (k & 1 ? -0.45 : 0.45), c[1]], [c[0], c[1] + (k > 1 ? -0.35 : 0.35)]); }
    for (k = 0; k < 7; k++) { var u = (k + 0.5) / 7; spots.push([P.x0 + (P.x1 - P.x0) * u, (k & 1) ? P.y0 : P.y1]); }
    spots.forEach(function (s, i) {
      var X = R(fx(s[0], s[1])), Y = R(fy(s[0], s[1], tz + 2));
      leaf(b, X, Y - 2, i % 3); leaf(b, X + 4, Y, (i + 1) % 3); if (i % 2) leaf(b, X - 4, Y + 1, (i + 2) % 3);
      if (i % 4 === 1) { b.rect(X + 1, Y + 3, 3, 2, '#6a3f86'); b.rect(X + 2, Y + 5, 2, 2, '#7d4f9a'); b.set(X + 2, Y + 3, '#9a6fb8'); }
    });
    b.outline(0.55);
  });
}
function leaf(b, X, Y, v) {
  var c = ['#4f8a3c', '#5f9a46', '#3f7a32'][v], l = lite(c, 0.25);
  b.rect(X - 2, Y - 1, 5, 3, c); b.rect(X - 1, Y - 2, 3, 1, c); b.set(X, Y + 2, c); b.set(X - 1, Y - 1, l); b.set(X, Y - 2, l);
}
HKA.drawLokTerrace = function (o) {
  if (!o || !o.area) return false;
  var A = o.area, t = o.t || T(), k, isik = !!(o.dc && o.dc.isik);
  if (o.part === 'floor') { at(terrFloorSpr(o), A.x0, A.y0, 0); return true; }
  if (o.part === 'west') { at(westSpr(o), A.x0, A.y0, 0); return true; }
  if (o.part === 'south') {
    at(southSpr(o), A.x0, A.y0, 0);
    if (isik) {                                                       /* Işık Zinciri süsü: güney ve doğu direkleri arası */
      var P0 = terrPosts(A);
      for (k = 0; k < P0.s.length - 1; k++) bulbChain(P0.s[k][0], P0.s[k][1], 14, P0.s[k + 1][0], P0.s[k + 1][1], 14, 7, 3, o.night, t);
      for (k = 0; k < P0.e.length - 1; k++) bulbChain(P0.e[k][0] - 0.03, P0.e[k][1], 14, P0.e[k + 1][0] - 0.03, P0.e[k + 1][1], 14, 5, 3, o.night, t);
    }
    return true;
  }
  if (o.part === 'top') {
    if (!o.up || !o.up.ter || !o.pergola) return true;
    var P = o.pergola;
    at(pergolaSpr(P), P.x0, P.y0, 0);
    if (isik) bulbChain(P.x0, P.y1, 36, P.x1, P.y1, 36, 7, 3, o.night, t, 0.7);
    return true;
  }
  return false;
};

/* ince modun açılıp kapanmasında yerel önbellekler */
HKA.onReset(function () { TC = null; CF = null; NTF = null; TK_STASH = null; SPOST = null; });
/* yeni (karada) yerleşim çizildi: game.js eski kancaları ince modda yeniden çağırır. HKA.lokV2 bu dosyanın v2 bilen kancaları
   takılıyken true okunur (başka biri kancaları değiştirirse — ör. test kaydedicisi — false); açıkça atanan değer önceliklidir. */
(function () {
  var mine = HKA.drawLokTable, ov;
  try { Object.defineProperty(HKA, 'lokV2', { configurable: true, enumerable: true, get: function () { return ov !== undefined ? ov : HKA.drawLokTable === mine; }, set: function (v) { ov = v; } }); }
  catch (e) { HKA.lokV2 = true; }
  /* v2.22: ev + teras yeni (V3) yerleşimde, dünya koordinatıyla çizildi → game.js hookV3 ince evi/terası çağırır.
     Bu dosyanın kancaları takılıyken true; biri kancayı değiştirirse (test kaydedicisi) false; açıkça atanan değer önceliklidir. */
  var mH = HKA.drawLokHouse, mT = HKA.drawLokTerrace, ov3;
  try { Object.defineProperty(HKA, 'lokV3', { configurable: true, enumerable: true, get: function () { return ov3 !== undefined ? ov3 : (HKA.drawLokHouse === mH && HKA.drawLokTerrace === mT); }, set: function (v) { ov3 = v; } }); }
  catch (e) { HKA.lokV3 = true; }
})();
})();
