/* =====================================================================
   HAMSİ KOYU — ince piksel: SAHİL LOKANTASI (sanatçı dosyası, v2.19-deneme)
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
function chair(b, sx, sy, s) {
  var bx = sx + s * 0.15;
  function back() {
    vl(b, bx, sy - 0.14, 0, 13, CHAIRD, 1); vl(b, bx, sy + 0.14, 0, 13, CHAIR, 2);
    for (var z = 9; z <= 12.5; z += 3.5) { hl(b, bx, sy - 0.14, bx, sy + 0.14, z, CHAIRL); hl(b, bx, sy - 0.14, bx, sy + 0.14, z - 0.5, CHAIRD); }
  }
  if (s < 0) back();
  vl(b, sx - s * 0.13, sy + 0.13, 0, 5, CHAIRD, 1); vl(b, sx + s * 0.13, sy + 0.13, 0, 5, CHAIR, 1); vl(b, sx - s * 0.13, sy - 0.13, 0, 5, CHAIRD, 1);
  box(b, sx - 0.15, sy - 0.15, 0.3, 0.3, 4.5, 6, function (u, v) { return (u < 0.6 || v < 0.6) ? lite(STRAW, 0.2) : (((R(u) + R(v)) % 3) ? STRAW : STRAWD); }, CHAIR, CHAIRD, { norim: true });
  if (s > 0) back();
}
function tableSpr(seats, occ) {
  return spr('lktb|' + seats + '|' + occ + '|' + G().K, 0, 0, function (b) {
    var S = seats === 2 ? SEAT2 : SEAT4, k;
    for (k = 0; k < S.length; k++) if (S[k][0] < 0 && !((occ >> k) & 1)) chair(b, S[k][0], S[k][1], -1);
    vl(b, -0.46, 0.36, 0, 5.5, '#4a2f1c', 2); vl(b, 0.44, 0.36, 0, 5.5, '#5a3822', 2); vl(b, 0.44, -0.36, 0, 5.5, '#4a2f1c', 2);
    box(b, -0.58, -0.48, 1.16, 0.96, 5, 8, clothTop,
      function (u, z) { var a = Math.floor(u / 3.2) & 1, c = Math.floor((3 - z) / 1.6) & 1; return z < 0.6 ? '#c9bda0' : (a && c ? dark(CHK, 0.08) : a || c ? dark(CHKL, 0.06) : '#e8dfc6'); },
      function (v, z) { var a = Math.floor(v / 3.2) & 1, c = Math.floor((3 - z) / 1.6) & 1; return z < 0.6 ? '#a89c80' : (a && c ? dark(CHK, 0.22) : a || c ? dark(CHKL, 0.2) : '#cfc4a8'); });
    for (k = 0; k < S.length; k++) if (S[k][0] > 0) chair(b, S[k][0], S[k][1], 1);
    b.outline(0.55);
  });
}
function vaseSpr() {
  return L.sprite('lkvase|' + G().K, function (b) {
    b.rect(-1, -5, 3, 5, '#4f8fb8'); b.set(-1, -5, '#8fc4e0'); b.rect(0, -9, 1, 4, '#4f8a3a');
    b.set(-1, -10, '#e5533d'); b.set(1, -10, '#e5533d'); b.set(0, -11, '#e5533d'); b.set(0, -10, '#ffc94a');
    b.outline(0.55);
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
  at(tableSpr(o.seats === 2 ? 2 : 4, occ), x, y, 0);
  var PP = o.seats === 2 ? PL2 : PL4;
  if (o.meze && live) at(mezeSpr(), x, y + 0.02, 8);
  else if (st === 'free') at(vaseSpr(), x, y, 8);
  for (i = 0; i < o.plates && i < 4; i++) { var p = PP[i]; L.blit(K.plateSpr(o.dish), R(pX(x + p[0], y + p[1])), R(pY(x + p[0], y + p[1], 9))); }
  for (i = 0; i < Math.min(o.dirty | 0, 4); i++) { var q = PP[i]; L.blit(K.dirtySpr(), R(pX(x + q[0], y + q[1])), R(pY(x + q[0], y + q[1], 9))); }
  var np = o.payItems ? o.payItems.length : 0;
  if (np) at(billSpr(Math.min(3, np)), x + 0.12, y + 0.06, 8.5);
  if (st === 'wait') {                                               /* sipariş balonu: yemek simgesi + tabak sayısı + sabır çubuğu */
    var bx = R(pX(x, y)), by = R(pY(x, y, 30));
    L.blit(bubbleBase(), bx, by);
    L.blit(K.plateSpr(o.dish), bx - 4, by + 2);
    gf('uiText')(x, y, 30, (o.plates | 0) + '/' + o.n, '#ffe9b0', 9, 1, 5, 0);
    var md = clamp(o.mood, 0, 1), pc = md > 0.5 ? '#5fd37a' : md > 0.25 ? '#ffc94a' : '#e5533d';
    L.fr(bx, by, -15, 21, 30, 4, '#0a1a27'); if (md > 0) { L.fr(bx, by, -14, 22, R(28 * md), 2, pc); L.fr(bx, by, -14, 22, R(28 * md), 1, lite(pc, 0.35)); }
  } else if (st === 'dirty' && (o.pay | 0) > 0) gf('uiBadge')(x, y, 26, '$', '#9df5b0');
};
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
   3) İSTASYON: çini önlü tezgâh + kızgın tava / mangal / bakır kazan / taş fırın
   ===================================================================== */
function ciniF(c1, c2) {
  return function (u, z) {
    if (z < 1.2) return '#3a3430';
    if (z > 7.8) return '#d8d0bc';
    if (z > 6.2) return (((u % 3) + 3) % 3 < 0.5) ? dark(c2, 0.2) : (z > 7.3 ? lite(c2, 0.25) : c2);
    var tu = ((u % 4) + 4) % 4, tz = ((z - 1.2) % 2.5 + 2.5) % 2.5;
    if (tu < 0.45 || tz < 0.4) return '#c9bea6';
    return tz > 2 ? '#f6efdf' : c1;
  };
}
function stBase(b, lv) {
  box(b, -0.5, -0.42, 1.0, 0.84, 0, 9, function (u, v) { return (u < 0.7 || v < 0.7) ? '#d6dadd' : (hash(R(u * 2), R(v * 2)) > 0.9 ? '#a8b0b6' : STEEL); },
    ciniF('#ece3cc', '#2f6f9f'), function (v, z) { var c = ciniF('#ece3cc', '#2f6f9f')(v, z); return dark(c, 0.16); });
  quadW(b, -0.5, 0.3, 1.0, 0.12, 9.05, function (X, Y) { return (X & 3) ? BRASS : BRASSL; });
  for (var i = 0; i < lv; i++) pr(b, -0.32 + i * 0.22, 0.42, 4.6, -1, 0, 2.5, 1.5, i < lv ? '#ffd23a' : '#555');
}
function flameAt(b, X, Y, fr, s) {
  s = s || 1;
  var hs = [3, 5, 4, 6, 3], o = fr;
  for (var i = 0; i < 5; i++) { var hh = R(hs[(i + o) % 5] * s), xx = X - 4 + i * 2; for (var j = 0; j < hh; j++) b.set(xx, Y - j, j < 1 ? '#4a8ae0' : j < hh * 0.5 ? '#ff9a3a' : j < hh - 1 ? '#ffc94a' : '#fff0a8'); }
}
function stationSpr(id, lv, busy, fr, dish) {
  return spr('lks|' + id + '|' + lv + '|' + (busy ? 1 : 0) + '|' + fr + '|' + (dish || '') + '|' + G().K, 0, 0, function (b) {
    stBase(b, lv);
    var X = R(fx(0, -0.04)), Y = R(fy(0, -0.04, 9)), c = busy ? dcol(dish) : null, i;
    if (id === 'tava') {                                             /* ocak + kızgın döküm tava (sap doğuda) */
      b.ellipse(X, Y, 11, 5, '#2c2c32'); b.ellipse(X, Y, 8, 3, '#1c1c20');
      for (i = -10; i <= 10; i += 5) b.rect(X + i, Y - 1, 1, 3, '#55555c');
      if (busy) flameAt(b, X, Y + 1, fr, 0.8);
      b.ellipse(X, Y - 3, 10, 4, '#1c1c20'); b.ellipse(X, Y - 3, 9, 3, '#2c2c32');
      for (i = -9; i <= 9; i++) { var e = R(4 * Math.sqrt(Math.max(0, 1 - i * i / 100))); b.set(X + i, Y - 3 - e, '#55555c'); }
      b.rect(X + 10, Y - 4, 9, 2, '#3a2a1c'); b.rect(X + 10, Y - 4, 9, 1, '#5a4030'); b.set(X + 18, Y - 4, '#7a5a3a');
      if (busy) {
        b.ellipse(X, Y - 3, 7, 2, '#c08a3a');
        for (i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2 + fr * 0.2, hx = X + R(Math.cos(a) * 5), hy = Y - 3 + R(Math.sin(a) * 2); b.rect(hx - 1, hy, 3, 1, '#e8b050'); b.set(hx + 1, hy, '#6a4a1a'); }
        b.set(X - 3 + fr, Y - 5, '#fff4c0'); b.set(X + 4 - fr, Y - 4, '#fff4c0');
      }
    } else if (id === 'izgara') {                                    /* mangal: çelik tekne, kor yatağı, ızgara teli */
      box(b, -0.44, -0.26, 0.88, 0.5, 9, 13.5, '#3a3a40', function (u, z) { return z > 3.8 ? '#5d666e' : '#2a2a30'; }, function (v, z) { return z > 3.8 ? '#4a535b' : '#202026'; }, { norim: true });
      quadW(b, -0.38, -0.2, 0.76, 0.38, 13, function (Xx, Yy) {
        var q = hash(Xx + fr * 7, Yy + fr * 3);
        if (!busy) return q > 0.8 ? '#7a3a2a' : q > 0.4 ? '#5d5a58' : '#4a4644';
        return q > 0.82 ? '#ffd27a' : q > 0.55 ? '#ff7a2a' : q > 0.25 ? '#c8401c' : '#5a2a1a';
      });
      for (i = 0; i < 8; i++) { var gx = -0.36 + i * 0.1; line(b, fx(gx, -0.22), fy(gx, -0.22, 14), fx(gx, 0.2), fy(gx, 0.2, 14), '#9aa4ac'); }
      hl(b, -0.42, -0.24, 0.42, -0.24, 14, '#c9d0d6'); hl(b, -0.42, 0.22, 0.42, 0.22, 14, '#c9d0d6');
      if (busy) for (i = 0; i < 2; i++) {
        var sx2 = R(fx(-0.16 + i * 0.3, -0.02)), sy2 = R(fy(-0.16 + i * 0.3, -0.02, 14.5));
        if (dish === 'orkinosizgara') { b.rect(sx2 - 4, sy2 - 2, 8, 4, c); b.rect(sx2 - 4, sy2 - 2, 8, 1, lite(c, 0.25)); b.set(sx2 - 2, sy2 - 1, '#5e1e1a'); b.set(sx2 + 1, sy2, '#5e1e1a'); }
        else { b.rect(sx2 - 5, sy2 - 1, 10, 2, '#9fb3c2'); b.rect(sx2 - 5, sy2 - 1, 10, 1, '#d0dde6'); b.set(sx2 + 4, sy2 - 1, '#16222b'); b.rect(sx2 - 7, sy2 - 2, 2, 4, '#7d93a3'); for (var g = -3; g < 4; g += 2) b.set(sx2 + g, sy2, '#3a3a3a'); }
      }
    } else if (id === 'tencere') {                                   /* bakır kazan: perçinli gövde, kulplar, kapak */
      b.ellipse(X, Y, 10, 4, '#2c2c32'); if (busy) flameAt(b, X, Y + 1, fr, 0.6);
      var cop = '#b8733a', copL = '#e8a868', copD = '#7d4a24', top = Y - 22;
      for (var yy = top; yy <= Y - 1; yy++) {
        var bulge = Math.sin((yy - top) / (Y - 1 - top) * Math.PI) * 1.5, hw = R(9 + bulge);
        for (var xx = -hw; xx <= hw; xx++) { var s = xx / hw; b.set(X + xx, yy, s < -0.55 ? copL : s > 0.6 ? copD : (s < -0.2 ? mix(copL, cop, 0.5) : cop)); }
        if (yy === top + 5 || yy === Y - 5) for (var r2 = -hw + 2; r2 < hw - 1; r2 += 3) b.set(X + r2, yy, '#6a3a1a');
      }
      b.ellipse(X, Y - 1, 9, 2, copD);
      b.rect(X - 13, top + 6, 3, 4, copD); b.rect(X - 12, top + 7, 1, 2, '#2a1a10'); b.rect(X + 11, top + 6, 3, 4, copD); b.rect(X + 12, top + 7, 1, 2, '#2a1a10');
      var ly = busy ? top - 2 - (fr & 1) : top, lx = busy ? 2 : 0;
      b.ellipse(X, top, 10, 3, copD); b.ellipse(X, top, 8, 2, busy ? dark(c, 0.15) : '#4a2a14');
      if (busy) { b.set(X - 3, top, lite(c, 0.4)); b.set(X + 2 + fr, top - 1, lite(c, 0.5)); }
      b.ellipse(X + lx, ly - 1, 10, 3, '#c98a50'); b.ellipse(X + lx, ly - 2, 8, 2, copL); b.rect(X + lx - 2, ly - 5, 4, 2, '#5a3a1a'); b.rect(X + lx - 1, ly - 6, 2, 1, '#8a5a32');
    } else {                                                         /* taş fırın: badanalı kubbe, tuğla kemer ağız, baca, kürek */
      var top2 = Y - 32, by = Y - 1;
      b.rect(X + 6, top2 - 6, 4, 14, '#6f6457'); b.rect(X + 6, top2 - 6, 1, 14, '#8a7f70'); b.rect(X + 5, top2 - 8, 6, 2, '#4a433a');
      for (var y3 = top2; y3 <= by; y3++) {
        var k3 = (by - y3) / (by - top2), hw3 = R(15 * Math.sqrt(Math.max(0, 1 - k3 * k3)));
        for (var x3 = -hw3; x3 <= hw3; x3++) {
          var nx = x3 / 15, ny = -k3, sl = nx * 0.7 + ny * 0.7, cc2 = sl < -0.55 ? '#fbf6ea' : sl > 0.35 ? '#c9bfa6' : '#e8e0cc';
          if (hash(x3 >> 1, y3 >> 1) > 0.93) cc2 = '#bfb49a';
          b.set(X + x3, y3, cc2);
        }
      }
      for (var x4 = -15; x4 <= 15; x4++) b.set(X + x4, by, '#9a8c72');
      var mx = X - 4, my = by - 1;                                    /* ağız (güneybatıya bakar) */
      for (var j = 0; j < 13; j++) for (var i2 = -6; i2 <= 6; i2++) {
        var arch = j > 7 ? Math.sqrt(Math.max(0, 1 - Math.pow((j - 7) / 6, 2))) * 6.5 : 6.5;
        if (Math.abs(i2) > arch) continue;
        var inner = Math.abs(i2) < arch - 2 && j < 11, cc3;
        if (!inner) cc3 = ((j + (Math.abs(i2) > 5 ? 1 : 0)) % 3 === 0) ? '#6a2a18' : '#9a4a2a';
        else if (busy) { var q3 = (j + i2 * (fr - 1) + 40) % 5; cc3 = j < 3 ? '#ffb347' : j < 6 + fr ? (q3 < 2 ? '#ffc94a' : '#e8762b') : j < 9 ? (q3 === 0 ? '#e8762b' : '#3a1c10') : '#1d1410'; }
        else cc3 = j < 2 ? '#5a2a1a' : '#1d1410';
        b.set(mx + i2, my - j, cc3);
      }
      line(b, X + 15, by - 2, X + 22, by - 26, '#8a5a32'); line(b, X + 16, by - 2, X + 23, by - 26, '#6a4326');
      b.rect(X + 20, by - 31, 6, 5, '#a8793e'); b.rect(X + 20, by - 31, 6, 1, '#c99a5c');
    }
    b.outline(0.55);
  });
}
HKA.drawLokStation = function (o) {
  var x = o.x, y = o.y, t = o.t || T(), busy = !!o.busy, fr = busy ? Math.floor(t * 9) % 3 : 0, sx = R(pX(x, y)), sy = R(pY(x, y, 9)), i;
  gf('shadow')(x, y, 0.8);
  at(stationSpr(o.id, o.lv | 0, busy, fr, busy ? o.dish : ''), x, y, 0);
  if (busy) {
    var cx = R(pX(x, y - 0.04)), cy = R(pY(x, y - 0.04, 9));
    if (o.id === 'izgara') for (i = 0; i < 3; i++) {                 /* mangal dumanı */
      var q = (t * 0.55 + i * 0.33) % 1, al = ((1 - q) * 0.5).toFixed(2), px0 = cx - 6 + i * 5 + R(Math.sin(q * 6 + i) * 2), py0 = cy - 8 - R(q * 20);
      L.fr(px0, py0, -1, 0, 4, 2, 'rgba(220,220,220,' + al + ')'); L.fr(px0, py0, 0, -1, 2, 4, 'rgba(220,220,220,' + al + ')');
    } else if (o.id === 'tencere' || o.id === 'tava') {             /* buhar */
      var top = o.id === 'tencere' ? 12 : 3;
      for (i = 0; i < 3; i++) { var q2 = (t * 0.7 + i * 0.33) % 1, a2 = ((1 - q2) * 0.6).toFixed(2), bx = cx - 3 + i * 3 + R(Math.sin(q2 * 6 + i) * 1.5), byy = cy - top - 2 - R(q2 * 12); L.fr(bx, byy, 0, 0, 3, 2, 'rgba(244,239,230,' + a2 + ')'); }
    } else {                                                         /* fırın bacası */
      for (i = 0; i < 2; i++) { var q4 = (t * 0.45 + i * 0.5) % 1, a4 = ((1 - q4) * 0.45).toFixed(2); L.fr(cx + 4, cy - 20 - R(q4 * 14), R(Math.sin(q4 * 5) * 2), 0, 4, 3, 'rgba(200,196,186,' + a4 + ')'); }
    }
    K.bar(sx - 8, sy - 30, 16, o.prog || 0, '#5fd37a');
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
function dolapSpr(big, rows) {
  return spr('lkdol|' + (big ? 1 : 0) + '|' + rows + '|' + G().K, 0, 0, function (b) {
    var hz = big ? 27 : 17, nr = big ? 4 : 2, y1 = 0.4;
    box(b, -0.45, -0.4, 0.9, 0.8, 0, hz, function (u, v) { return (u < 0.7 || v < 0.7) ? '#f4fbff' : (((R(u) + R(v * 2)) % 7) ? '#c9d6de' : '#9fb0bd'); },
      function (u, z) { return z < 1.5 ? '#5a6a74' : (hash(R(u * 2), R(z)) > 0.93 ? '#e8f0f4' : '#d8e4ea'); }, function (v, z) { return z < 1.5 ? '#46525c' : '#a6bcc8'; });
    var doors = big ? [[-0.4, -0.02], [0.02, 0.4]] : [[-0.38, 0.38]];
    var zt = hz - 3, zb = 2.5, rowH = (zt - zb) / nr;
    doors.forEach(function (d) {
      wall(b, d[0], y1, d[1], y1, zb - 0.6, zt + 0.6, '#7d98a6');
      wall(b, d[0] + 0.03, y1, d[1] - 0.03, y1, zb, zt, function (X, Y) { return (hash(X >> 1, Y >> 2) > 0.85) ? '#9fd0e4' : '#6fa8c0'; });
      for (var r = 0; r < nr; r++) {
        var z0 = zb + r * rowH;
        hl(b, d[0] + 0.03, y1, d[1] - 0.03, y1, z0 + 0.3, '#e8f0f4');
        if (r < rows) for (var s = d[0] + 0.12; s < d[1] - 0.08; s += 0.16) { var X0 = R(fx(s, y1)), Y0 = R(fy(s, y1, z0 + 2.2)); filetoMini(b, X0, Y0, (R(s * 10) & 1) ? '#f0a090' : '#e88a6a'); }
      }
      vl(b, d[1] - 0.07, y1, zt - 6, zt - 2, '#4a5a64', 1);
    });
    for (var g = 0; g < 4; g++) hl(b, -0.35, y1, 0.35, y1, hz - 1 - g * 0.5, g & 1 ? '#5a6a74' : '#8a9aa4');
    b.outline(0.55);
  });
}
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
function boardSpr(lv, menu) {
  return spr('lkbrd|' + lv + '|' + menu.join(',') + '|' + G().K, 0, 0, function (b) {
    var X = R(fx(0, 0)), Y = R(fy(0, 0, 0)), w = 13, top = Y - 62, bot = Y - 26;
    line(b, X - 12, Y, X - 9, top + 4, '#5a3a20'); line(b, X - 11, Y, X - 8, top + 4, '#7a5230');
    line(b, X + 12, Y, X + 9, top + 4, '#5a3a20'); line(b, X + 13, Y, X + 10, top + 4, '#4a2f1c');
    line(b, X - 4, Y, X - 2, top + 8, '#3a2414');
    b.rect(X - w - 2, top - 2, 2 * w + 4, bot - top + 4, '#8a5a32'); b.rect(X - w - 2, top - 2, 2 * w + 4, 1, '#b07a48'); b.rect(X - w - 2, bot + 1, 2 * w + 4, 1, '#5a3a20');
    for (var y = top; y <= bot; y++) for (var x = -w; x <= w; x++) b.set(X + x, y, hash(x, y) > 0.94 ? '#3c4a44' : '#26332e');
    b.rect(X - 6, top + 2, 12, 1, '#e8e2d2'); b.set(X - 7, top + 2, '#c9c2ae'); b.set(X + 6, top + 2, '#c9c2ae');
    for (var i = 0; i < 5; i++) {
      var ry = top + 6 + i * 6, on = i < lv, d = menu[i];
      if (on && d) {
        var c = dcol(d);
        b.ellipse(X - w + 5, ry + 1, 3, 1, '#f4f0e6'); b.rect(X - w + 3, ry, 4, 1, c); b.set(X - w + 4, ry - 1, lite(c, 0.3));
        b.rect(X - w + 10, ry, 11, 1, '#e8e2d2'); b.rect(X + w - 4, ry, 3, 1, '#ffd23a');
      } else if (on) { b.rect(X - w + 3, ry, 18, 1, '#6a7a72'); }
      else { for (var q = 0; q < 18; q += 3) b.set(X - w + 3 + q, ry, '#46564e'); }
    }
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
function mezeVitSpr() {
  return spr('lkmzv|' + G().K, 0, 0, function (b) {
    box(b, -0.4, -0.4, 0.8, 0.8, 0, 9, '#b07a4a', function (u, z) { return (z > 2 && z < 7 && u > 1.2 && u < 8.4) ? '#9a6236' : '#6f4526'; }, '#8a5a34');
    box(b, -0.4, -0.4, 0.8, 0.8, 9, 20, function () { return 'rgba(200,232,244,.22)'; },
      function (u, z) { return (u + z) % 10 < 1.2 ? 'rgba(255,255,255,.55)' : 'rgba(170,214,232,.26)'; }, function () { return 'rgba(130,180,200,.3)'; }, { norim: true });
    box(b, -0.36, -0.36, 0.72, 0.72, 9, 9.6, '#f4f0e6', '#d8d2c4', '#c8c2b4', { norim: true });
    var mc = ['#c0503a', '#7fb069', '#e8c547', '#9a5fa8', '#f4f1e0'], k;
    for (k = 0; k < 5; k++) { var mx = -0.26 + (k % 3) * 0.26, my = (k < 3 ? -0.12 : 0.16), X = R(fx(mx, my)), Y = R(fy(mx, my, 10)); b.ellipse(X, Y, 4, 2, '#f4f0e6'); b.rect(X - 3, Y - 2, 6, 2, mc[k]); b.set(X - 1, Y - 3, lite(mc[k], 0.3)); }
    for (k = 0; k < 3; k++) { var gx = -0.3 + k * 0.3; line(b, fx(gx, 0.4), fy(gx, 0.4, 12), fx(gx + 0.08, 0.4), fy(gx + 0.08, 0.4, 18), '#ffffff'); }
    hl(b, -0.4, 0.4, 0.4, 0.4, 20, '#c9952f'); hl(b, -0.4, 0.4, 0.4, 0.4, 9.6, '#a8842a'); vl(b, 0.4, 0.4, 9, 20, '#c9952f', 1); vl(b, -0.4, 0.4, 9, 20, '#c9952f', 1); vl(b, 0.4, -0.4, 9, 20, '#a8842a', 1);
    hl(b, 0.4, -0.4, 0.4, 0.4, 20, '#a8842a');
    poly(b, [P3(-0.46, 0.4, 24), P3(0.46, 0.4, 24), P3(0.46, 0.58, 21), P3(-0.46, 0.58, 21)], function (X, Y) { return (((X - Y * 2) >> 2) & 1) ? '#f4f1ea' : '#c0503a'; });
    vl(b, -0.44, 0.58, 9, 21, '#6f4526', 1); vl(b, 0.44, 0.58, 9, 21, '#5a3a20', 1);
    b.outline(0.55);
  });
}
function sazSpr() {
  return spr('lksaz|' + G().K, 0, 0, function (b) {
    quadW(b, -0.5, -0.5, 1.0, 1.0, 0.1, function (X, Y) {             /* kilim: göbek motifli */
      var u = (X - Y * 2), v = (X + Y * 2), dd = Math.abs(u % 24) / 24, e = Math.abs(v % 20) / 20;
      var m = Math.abs(dd - 0.5) + Math.abs(e - 0.5);
      return m < 0.18 ? '#2a4c7d' : m < 0.3 ? '#f1e6cc' : m < 0.45 ? '#c9952f' : '#7a1f2b';
    });
    box(b, -0.36, -0.18, 0.72, 0.5, 0, 3.5, function (u, v) { return (u < 0.6 || v < 0.6) ? '#c8434b' : '#a8323a'; }, '#8a2a33', '#6f1f28');
    box(b, -0.36, -0.36, 0.72, 0.16, 0, 8, '#c8434b', '#8a2a33', '#6f1f28');
    var X = R(fx(0.32, -0.1)), Y = R(fy(0.32, -0.1, 3.5));             /* bağlama: gövde + uzun sap */
    for (var j = 0; j < 12; j++) { var hw = R(5 * Math.sin(j / 11 * Math.PI) + 1); b.rect(X - hw, Y - 12 + j, hw * 2 + 1, 1, j < 4 ? '#a8743f' : '#8a5a34'); }
    b.rect(X - 1, Y - 9, 3, 3, '#3a2410'); b.rect(X - 3, Y - 2, 7, 1, '#5d3c1c');
    line(b, X, Y - 12, X + 3, Y - 52, '#5d3c1c'); line(b, X + 1, Y - 12, X + 4, Y - 52, '#7a5230');
    b.rect(X + 2, Y - 58, 4, 6, '#3a2410'); b.set(X + 1, Y - 56, '#e8e2d2'); b.set(X + 6, Y - 55, '#e8e2d2');
    line(b, X + 1, Y - 6, X + 4, Y - 52, '#e8e2d2');
    b.outline(0.55);
  });
}
HKA.drawLokFix = function (o) {
  var x = o.x, y = o.y, t = o.t || T(), sx = R(pX(x, y)), k = o.k, i;
  if (k === 'dolap') {
    var big = !!o.big, cap = Math.max(1, o.cap), nr = big ? 4 : 2, rows = o.n > 0 ? Math.max(1, Math.ceil(o.n / cap * nr)) : 0;
    gf('shadow')(x, y, 0.8);
    at(dolapSpr(big, rows), x, y, 0);
    var pct = o.n / cap, hz = big ? 27 : 17, lc = pct > 0.7 ? '#5fd37a' : pct > 0.3 ? '#ffc94a' : '#e5533d';
    L.fr(R(pX(x - 0.3, y + 0.4)), R(pY(x - 0.3, y + 0.4, hz - 1.5)), 0, 0, 3, 2, lc);
    lbl(x, y, big ? 34 : 24, gf('T')('lkDolap') + ' ' + o.n + '/' + o.cap, '#bfe9ff', o.n + '/' + o.cap);
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
    at(boardSpr(o.lv | 0, (o.menu || []).slice(0, 5).map(function (d) { return d || ''; })), x, y, 0);
    lbl(x, y, 38, 'lkMenuB', '#fff3d0', '');
  } else if (k === 'tickets') {
    var tk = o.items || []; if (!tk.length) return;
    L.blit(ticketSpr(tk), sx, R(pY(x, y, 42)));
    if (tk.length > 5) gf('uiBadge')(x, y, 56, '+' + (tk.length - 5), '#ffe9b0');
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
    gf('shadow')(x, y, 0.8);
    at(mezeVitSpr(), x, y, 0);
    lbl(x, y, 30, 'lkMezeB', '#ffe9b0', '');
  } else if (k === 'saz') {
    gf('shadow')(x, y, 0.8);
    at(sazSpr(), x, y, 0);
    var sy = R(pY(x, y, 4));
    if (o.night || Math.sin(t * 2.2) > 0.6) {                        /* ♪ notalar */
      var up = R((t * 6) % 6);
      L.fr(sx, sy, -16, -40 - up, 3, 3, '#ffd98a'); L.fr(sx, sy, -14, -48 - up, 1, 8, '#ffd98a'); L.fr(sx, sy, -24, -30 - (up >> 1), 3, 3, '#ffe9b0'); L.fr(sx, sy, -22, -38 - (up >> 1), 1, 8, '#ffe9b0'); L.fr(sx, sy, -22, -38 - (up >> 1), 3, 1, '#ffe9b0');
    }
    lbl(x, y, 36, 'lkSazB', '#ffe9b0', '');
  } else if (k === 'sign') {
    gf('shadow')(x, y, 0.9);
    at(signSpr(clamp(o.star | 0, 0, 5)), x, y, 0);
    bulbs(x, y, !!o.night, t);
    gf('uiText')(x, y, 49, gf('UP')(gf('NM')({ tr: 'SAHİL LOKANTASI', en: 'SEASIDE RESTAURANT' })), '#ffe9b0', 7, 1, 0, 0);
    if (o.res) gf('uiBadge')(x, y, 64, gf('T')(o.res.kind === 'nisan' ? 'lkResBN' : 'lkResBD') + ' ' + o.res.got + '/' + o.res.n, '#ffd0e8');
  } else return false;
};

/* ince modun açılıp kapanmasında yerel önbellekler */
HKA.onReset(function () { TC = null; CF = null; });
})();
