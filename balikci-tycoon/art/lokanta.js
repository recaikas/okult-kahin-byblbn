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
    if (o.v2) {
      var hs = gv('LOK'); if (hs && hs.house) at(eastSliceSpr(hs.house, o.night), hs.house.x0, hs.house.y0, 0);   /* pass evin doğu duvarının arkasında: duvarın güney ucu önde kalsın */
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
    at(boardSpr(o.lv | 0, (o.menu || []).slice(0, 5).map(function (d) { return d || ''; })), x, y, 0);
    lbl(x, y, 38, 'lkMenuB', '#fff3d0', '');
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
    L.blit(umbSpr2(), PXu, PYu - 37);
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
  } else if (k === 'sign' && o.v2) {                                 /* v2: ad + yıldız evin tabelasında; burada giriş kapısı */
    at(gateSpr(x, y), x, y, 0);
    gateLamp(x, y, !!o.night);
    if (o.res) gf('uiBadge')(x, y, 40, gf('T')(o.res.kind === 'nisan' ? 'lkResBN' : 'lkResBD') + ' ' + o.res.got + '/' + o.res.n, '#ffd0e8');
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
/* ---------- iç mekân (o.part 'back'): sıcak loş zemin, batı iç duvar, batı ayak ---------- */
function houseBackSpr(o) {
  var X0 = o.x0, Y0 = o.y0, X1 = o.x1, Y1 = o.y1, nt = o.night ? 1 : 0;
  return spr('lkHB|' + [X0, Y0, X1, Y1].join(',') + '|' + nt + '|' + G().K, X0, Y0, function (b) {
    var k;
    quadW(b, X0 + 0.22, Y0 + 0.1, X1 - X0 - 0.44, Y1 - Y0 - 0.1, 0.1, function (Xb, Yb) {      /* pişmiş toprak karo, arkaya doğru loşlaşır */
      var w = inv(Xb, Yb, 0.1, X0, Y0), x = w[0], y = w[1], cu = Math.floor(x / 0.5), cv = Math.floor(y / 0.5), lu = frac(x / 0.5), lv = frac(y / 0.5);
      var c = ['#b06a4c', '#a7614a', '#b97452', '#a25c42'][Math.floor(hash(cu + 40, cv + 9) * 4)];
      if (lu < 0.06 || lv < 0.06) c = '#7a4634'; else if (lu < 0.16 || lv < 0.16) c = lite(c, 0.08);
      var dd = clamp((y - Y0) / (Y1 - Y0), 0, 1), glow = Math.max(0, 1 - Math.abs(y - 25.0) / 1.4) * (nt ? 0.3 : 0.14);
      c = dark(c, 0.5 * (1 - dd) + 0.08);
      if (glow > 0) c = mix(c, '#ffb45a', glow * (0.6 + 0.4 * L.bayer[Yb & 3][Xb & 3]));
      return c;
    });
    /* arka duvar dibi (çoğu üst katın gölgesinde) */
    wall(b, X0 + 0.22, Y0 + 0.1, X1 - 0.22, Y0 + 0.1, 0, HG, function (Xb, Yb) { var Z = R(fy(X0 + 1, Y0 + 0.1, 0)) - Yb; return Z < 8 ? '#6a5c4a' : '#5e4a38'; });
    /* batı iç duvar yüzü: taş etek, badana, raf, bakır kaplar */
    var xw = X0 + 0.25;
    wall(b, xw, Y0 + 0.1, xw, Y1, 0, HG, function (Xb, Yb) {
      var k2 = G().K, yy = Y0 + (xw - X0) - Xb / (12 * k2), zz = ((xw - X0) + (yy - Y0)) * 6 - Yb / k2, dd = clamp((yy - Y0) / (Y1 - Y0), 0, 1);
      var c = zz < 8 ? stoneAt(yy, zz, 3) : plaster('#e6d6b8', yy, zz);
      if (zz > 21.6 && zz < 23 && yy > 24.3) c = zz > 22.4 ? V.TIML : V.TIMD;                /* raf */
      return dark(c, 0.55 * (1 - dd) + clamp((zz - 20) / 60, 0, 0.3));
    });
    var pots = [[24.55, '#b87333', 4], [24.95, '#c98a50', 3], [25.35, '#8d959b', 5]];
    for (k = 0; k < pots.length; k++) { var p0 = pots[k]; pr(b, xw + 0.02, p0[0], 23, -1.5, -p0[2], 3, p0[2], p0[1]); pr(b, xw + 0.02, p0[0], 23, -1.5, -p0[2], 3, 0.5, lite(p0[1], 0.3)); }
    pepperString(b, xw + 0.04, 25.75, 36, 4);
    /* batı ayak (taş paye) */
    box(b, X0, Y1 - 0.32, 0.27, 0.32, 0, HG - 3, function () { return null; },
      function (u, z) { return z > HG - 5.5 ? V.TIMD : stoneAt(X0 + u / 12, z, 11); }, function (v, z) { return z > HG - 5.5 ? V.TIMD : dark(stoneAt(Y1 + v / 12, z, 12), 0.1); }, { norim: true });
    b.outline(0.55);
  });
}
/* ---------- ev (o.part 'front'): doğu duvarı, hımış cumbalı üst kat, kiremit çatı, baca, saçak süsleri, tabela ---------- */
/* zemin kat doğu duvarı (dış yüz): taş etek, badana, ahşap hatıllar, arka kapı, panjurlu pencere; ya..yb dilimi */
function eastWall(b, X0, Y0, X1, Y1, ya, yb, nt) {
  var Z1 = HG - 3;
  var dW = [Y1 - 1.25, Y1 - 0.5], dD = [Y0 + 0.42, Y0 + 1.22];
  box(b, X1 - 0.22, ya, 0.22, yb - ya, 0, Z1, function () { return null; },
    function (u, z) {                                                         /* güney ucu = doğu payesi */
      if (z > Z1 - 2.5) return V.TIMD;
      return stoneAt(X1 + u / 12, z, 31);
    },
    function (v, z) {
      var y = ya + v / 12, c;
      if (z > Z1 - 2.5) return V.TIMD;
      if (inSpan(y, dD[0], dD[1]) && z < 29) {                                 /* arka kapı */
        var e = Math.min(y - dD[0], dD[1] - y) * 12;
        if (e < 1.1 || z > 27.6) return V.TIMD;
        if (Math.abs(z - 8) < 0.6 || Math.abs(z - 20) < 0.6) return '#3a2a1c';
        c = (Math.floor(v * 1.1) % 3 === 0) ? '#6a4226' : '#7f5130'; return z > 25 ? dark(c, 0.15) : c;
      }
      if (inSpan(y, dW[0], dW[1]) && z >= 15 && z < 30) return winPix(y, z, dW[0], dW[1], 15, 30, nt);
      if ((inSpan(y, dW[0] - 0.22, dW[0] - 0.02) || inSpan(y, dW[1] + 0.02, dW[1] + 0.22)) && z >= 14.5 && z < 30.5) { var s0 = y < dW[0] ? dW[0] - 0.22 : dW[1] + 0.02; return dark(shutPix(y, z, s0, s0 + 0.2, 14.5, 30.5), 0.12); }
      if (z < 8) return dark(stoneAt(y, z, 33), 0.1);
      if ((z >= 8 && z < 9.6) || (z >= 33.5 && z < 35)) return (z < 8.6 || (z >= 33.5 && z < 34.1)) ? '#5d3c1c' : V.TIM;   /* ahşap hatıl */
      c = plaster(V.WASHS, y, z);
      if (z > 36) c = dark(c, (z - 36) / 30);
      return c;
    }, { norim: true });
}
function eastSliceSpr(h, nt) {
  return spr('lkHE|' + [h.x0, h.y0, h.x1, h.y1].join(',') + '|' + (nt ? 1 : 0) + '|' + G().K, h.x0, h.y0, function (b) { eastWall(b, h.x0, h.y0, h.x1, h.y1, h.y1 - 1.05, h.y1, nt); b.outline(0.55); });
}
var SIGN_X = 19.8;
function houseFrontSpr(o, nm) {
  var X0 = o.x0, Y0 = o.y0, X1 = o.x1, Y1 = o.y1, nt = o.night ? 1 : 0, star = clamp(o.star | 0, 0, 5), lv = clamp(o.lv | 0, 1, 5);
  return spr('lkHF|' + [X0, Y0, X1, Y1].join(',') + '|' + nt + '|' + star + '|' + lv + '|' + nm + '|' + G().K, X0, Y0, function (b) {
    var Z1 = HG - 3, Z2 = HG + HU, XA = X0 - 0.1, XB = X1 + 0.1, YF = Y1 + 0.3, k;
    var NONE = function () { return null; };
    /* --- baca (arka yamaçta; çatı önünü örter) --- */
    var CX = 22.0, CY = 24.15;
    box(b, CX - 0.2, CY - 0.2, 0.4, 0.4, 70, 87, '#8d8475', function (u, z) { return stoneAt(CX + u / 12, z, 21); }, function (v, z) { return dark(stoneAt(CY + v / 12, z, 22), 0.14); }, { norim: true });
    box(b, CX - 0.27, CY - 0.27, 0.54, 0.54, 87, 89, '#cfc8b6', '#a39b89', '#8d8575');
    box(b, CX - 0.08, CY - 0.08, 0.06, 0.06, 89, 92, '#6a6458', '#6a6458', '#55504a', { norim: true }); box(b, CX + 0.06, CY + 0.06, 0.06, 0.06, 89, 92, '#6a6458', '#6a6458', '#55504a', { norim: true });
    box(b, CX - 0.24, CY - 0.24, 0.48, 0.48, 92, 94, '#b8b09e', '#948c7c', '#7d7668');                /* külah taşı */
    eastWall(b, X0, Y0, X1, Y1, Y0, Y1, nt);
    /* odun yığını (arka avluda, doğu duvarına yaslı) */
    box(b, X1 + 0.02, Y0 + 0.08, 0.3, 0.3, 0, 13, function (u, v) { return hash(R(u), R(v)) > 0.5 ? '#8a6a44' : '#6f5233'; },
      function (u, z) { var q = (u + (Math.floor(z / 3) & 1) * 1.5) % 3; return Math.floor(z) % 3 === 0 ? '#4a3220' : q < 0.6 ? '#5d3c1c' : '#7a5232'; },
      function (v, z) { var lz = z % 3.2, lv = (v + (Math.floor(z / 3.2) & 1) * 1.6) % 3.2, d = Math.hypot(lv - 1.6, (lz - 1.6) * 0.9); return d > 1.55 ? '#4a3220' : d < 0.6 ? '#c9a46a' : d < 1.0 ? '#e0c08a' : '#a8804c'; }, { norim: true });
    /* --- üst kat: hımış, iki panjurlu pencere + çiçeklik --- */
    var wL = [16.55, 17.45], wR = [22.0, 22.85], BX0 = 18.55, BX1 = 21.05, BY = YF + 0.3;
    var plainF = [[XA, 16.3], [17.7, BX0], [BX1, 21.75], [23.1, XB]];
    box(b, XA, Y0, XB - XA, YF - Y0, Z1, Z2, NONE,
      function (u, z) {
        var x = XA + u / 12, Z = Z1 + z, c, k2;
        if (Z < Z1 + 2.5) return Z < Z1 + 0.8 ? '#3e2716' : (Math.floor(u / 7) % 2 ? V.TIMD : '#5a3a22');       /* taban kirişi + kiriş başları */
        if (Z >= Z2 - 2.5) return Z > Z2 - 1 ? V.TIML : V.TIM;                                                    /* üst başlık */
        for (k2 = 0; k2 < 2; k2++) {
          var w = k2 ? wR : wL;
          if (inSpan(x, w[0], w[1]) && Z >= 50 && Z < 60) return winPix(x, Z, w[0], w[1], 50, 60, nt);
          if (Z >= 49.5 && Z < 60.5 && (inSpan(x, w[0] - 0.22, w[0] - 0.02) || inSpan(x, w[1] + 0.02, w[1] + 0.22))) { var s0 = x < w[0] ? w[0] - 0.22 : w[1] + 0.02; return shutPix(x, Z, s0, s0 + 0.2, 49.5, 60.5); }
        }
        for (k2 = 0; k2 < plainF.length; k2++) if (inSpan(x, plainF[k2][0], plainF[k2][1])) { c = himis(x, Z, plainF[k2][0], plainF[k2][1], Z1 + 2.5, Z2 - 2.5, V.WASH); break; }
        if (!c) c = (Z > 60.5 || Z < 49.5) ? plaster(V.WASH, x, Z) : V.TIM;
        if (Z > Z2 - 6.5) c = dark(c, 0.16);                                                                    /* saçak gölgesi */
        return c;
      },
      function (v, z) {
        var y = Y0 + v / 12, Z = Z1 + z, c, ww = [24.25, 25.05];
        if (Z < Z1 + 2.5) return Z < Z1 + 0.8 ? '#2e1d10' : '#3e2716';
        if (Z >= Z2 - 2.5) return V.TIMD;
        if (inSpan(y, ww[0], ww[1]) && Z >= 50 && Z < 60) return dark(winPix(y, Z, ww[0], ww[1], 50, 60, nt), nt ? 0.05 : 0.12);
        if (Z >= 49.5 && Z < 60.5 && (inSpan(y, ww[0] - 0.22, ww[0] - 0.02) || inSpan(y, ww[1] + 0.02, ww[1] + 0.22))) { var s0 = y < ww[0] ? ww[0] - 0.22 : ww[1] + 0.02; return dark(shutPix(y, Z, s0, s0 + 0.2, 49.5, 60.5), 0.14); }
        if (inSpan(y, Y0, 23.95)) c = himis(y, Z, Y0, 23.95, Z1 + 2.5, Z2 - 2.5, V.WASHS);
        else if (inSpan(y, 25.3, YF)) c = himis(y, Z, 25.3, YF, Z1 + 2.5, Z2 - 2.5, V.WASHS);
        else c = plaster(V.WASHS, y, Z);
        if (Z > Z2 - 6.5) c = dark(c, 0.14);
        return dark(c, 0.06);
      }, { norim: true });
    /* çiçeklikler (sardunya) */
    [wL, wR].forEach(function (w) {
      box(b, w[0] - 0.04, YF, w[1] - w[0] + 0.08, 0.14, 46.5, 49.5, '#6a4426', K.woodV('#7a4e2a', 3), '#5a3a22', { norim: true });
      for (var i = 0; i < 9; i++) { var fxw = w[0] + 0.02 + i * (w[1] - w[0]) / 8.5; pr(b, fxw, YF + 0.07, 49.5, -0.5, -1 - (i % 3 === 1 ? 1 : 0), 1, 1.5, i % 2 ? '#4f8a3a' : '#3f7a32'); if (i % 2 === 0) pr(b, fxw, YF + 0.07, 51, -0.5, -0.5 - (i % 4 === 0 ? 1 : 0), 1, 1, i % 4 ? '#e5533d' : '#d94a6a'); }
    });
    /* --- cumba: üç pencere, alt pano, köşe dirsekleri --- */
    box(b, BX0, YF, BX1 - BX0, BY - YF, Z1 + 2, Z2, NONE,
      function (u, z) {
        var x = BX0 + u / 12, Z = Z1 + 2 + z, d = Math.min(x - BX0, BX1 - x) * 12, pw = (BX1 - BX0 - 0.16) / 3;
        if (Z < Z1 + 4) return Z < Z1 + 2.8 ? '#3e2716' : V.TIMD;
        if (Z >= Z2 - 3) return Z > Z2 - 1.2 ? V.TIML : V.TIM;
        if (d < 1.1) return V.TIM;
        if (Z < 50.5) return (Math.floor(u * 1.2) % 4 === 0) ? '#5a3a22' : (Z > 49.5 ? V.TIML : '#7a4e2a');          /* ahşap alt pano */
        var j = clamp(Math.floor((x - BX0 - 0.08) / pw), 0, 2), p0 = BX0 + 0.08 + j * pw;
        return winPix(x, Z, p0 + 0.03, p0 + pw - 0.03, 50.5, Z2 - 3, nt);
      },
      function (v, z) {
        var y = YF + v / 12, Z = Z1 + 2 + z;
        if (Z < Z1 + 4 || Z >= Z2 - 3) return V.TIMD;
        if (Z < 50.5) return '#5d3c1c';
        return dark(winPix(y, Z, YF + 0.04, BY - 0.04, 50.5, Z2 - 3, nt), 0.14);
      }, { norim: true });
    [BX0 + 0.06, (BX0 + BX1) / 2, BX1 - 0.06].forEach(function (xb) { line(b, fx(xb, YF + 0.02), fy(xb, YF + 0.02, Z1 - 2), fx(xb, BY - 0.02), fy(xb, BY - 0.02, Z1 + 2), V.TIMD); line(b, fx(xb, YF + 0.02) + 1, fy(xb, YF + 0.02, Z1 - 2), fx(xb, BY - 0.02) + 1, fy(xb, BY - 0.02, Z1 + 2), V.TIM); });
    /* --- kırma çatı: alaturka kiremit (köy evleriyle aynı kırmızı) --- */
    var RX0 = XA - 0.3, RX1 = XB + 0.3, RY0 = Y0 - 0.2, RY1 = BY + 0.25, RZ = Z2 + 1, ym = (RY0 + RY1) / 2, ri = Math.min((RY1 - RY0) / 2, (RX1 - RX0) / 2), r0 = RX0 + ri, r1 = RX1 - ri;
    wall(b, RX0, RY1, RX1, RY1, RZ - 2.5, RZ, '#4a2e1a'); wall(b, RX1, RY0, RX1, RY1, RZ - 2.5, RZ, '#3a2414');            /* saçak alnı */
    for (k = 0; k < 26; k++) { var tx = RX0 + 0.2 + k * (RX1 - RX0 - 0.4) / 25; vl(b, tx, RY1 - 0.02, RZ - 3.5, RZ - 2.5, '#2e1d10', 1); }
    var kk = G().K, sF = RH / (RY1 - ym), sE = RH / ri, cF = RZ + sF * (RY1 - Y0), cE = RZ + sE * (RX1 - X0);
    poly(b, [P3(RX1, RY0, RZ), P3(RX1, RY1, RZ), P3(r1, ym, RZ + RH)], function (Xb, Yb) {                          /* doğu yamacı */
      var a = (Xb + 0.5) / (12 * kk), xx = ((Yb + 0.5) / kk + 6 * a + cE) / (12 + sE) + X0, yy = xx - X0 - a + Y0;
      return tileAt(RX1 - xx, yy, V.RE, Xb, Yb);
    });
    poly(b, [P3(RX0, RY1, RZ), P3(RX1, RY1, RZ), P3(r1, ym, RZ + RH), P3(r0, ym, RZ + RH)], function (Xb, Yb) {      /* ön (güney) yamaç */
      var a = (Xb + 0.5) / (12 * kk), yy = ((Yb + 0.5) / kk - 6 * a + cF) / (12 + sF) + Y0, xx = a + yy - Y0 + X0;
      return tileAt(RY1 - yy, xx, V.RF, Xb, Yb);
    });
    hl(b, RX0, RY1, RX1, RY1, RZ, '#e07a58');                                                                          /* saçak ışığı */
    line(b, fx(RX1, RY1), fy(RX1, RY1, RZ), fx(r1, ym), fy(r1, ym, RZ + RH), '#8e2f1f');                               /* mahya + kalkan kiremitleri */
    line(b, fx(RX1, RY1) - 1, fy(RX1, RY1, RZ), fx(r1, ym) - 1, fy(r1, ym, RZ + RH), '#e07a58');
    hl(b, r0, ym, r1, ym, RZ + RH + 0.6, '#8e2f1f'); hl(b, r0, ym, r1, ym, RZ + RH + 1.1, '#e98a64');
    for (k = 0; k < 12; k++) { var mx = r0 + k * (r1 - r0) / 11; pr(b, mx, ym, RZ + RH + 1.5, -1, 0, 2, 1, '#d0654a'); }
    /* --- saçak altı: kurutulmuş biber dizileri + sepet --- */
    pepperString(b, XA + 0.35, BY + 0.12, RZ - 3, 5);
    pepperString(b, 18.25, BY + 0.12, RZ - 3, 4);
    pepperString(b, 21.35, BY + 0.12, RZ - 3, 4);
    basket(b, 23.4, BY + 0.12, RZ - 3);
    /* --- tabela: cumbanın üstünde saçağa oturan ahşap levha (ekrana düz → okunur) --- */
    var lines = splitTwo(nm), s = 2, tw = 0;
    lines.forEach(function (l) { tw = Math.max(tw, L.textW(l) * s); });
    var W = tw + 12, H = lines.length * 13 + 14, cx = R(fx(SIGN_X, RY1 - 0.05)), by = R(fy(SIGN_X, RY1 - 0.05, RZ)) - 3, x0 = cx - Math.floor(W / 2), y0 = by - H;
    b.rect(x0 + 6, y0 + H - 1, 2, 5, V.TIMD); b.rect(x0 + W - 8, y0 + H - 1, 2, 5, V.TIMD);                                /* ayaklar */
    b.rect(x0, y0, W, H, '#3e2716'); b.rect(x0 + 1, y0 + 1, W - 2, H - 2, lv >= 4 ? '#c9952f' : '#8a5a32');
    b.rect(x0 + 2, y0 + 2, W - 4, H - 4, '#6e4526');
    for (k = y0 + 5; k < y0 + H - 2; k += 6) b.rect(x0 + 2, k, W - 4, 1, '#62401f');                                      /* tahta derzi */
    b.rect(x0 + 2, y0 + 2, W - 4, 1, '#8f5f36');
    for (k = 0; k < 3; k++) { b.set(x0 + 3 + k * 2, y0 + 3, '#c8553d'); b.set(x0 + W - 4 - k * 2, y0 + 3, '#c8553d'); }
    lines.forEach(function (l, i) { var lx = cx - Math.floor(L.textW(l) * s / 2), ly = y0 + 7 + i * 13; bigTxt(b, l, lx, ly + 1, '#2e1d10', s); bigTxt(b, l, lx, ly, '#f4e9d2', s); });
    for (k = 0; k < 5; k++) {                                                                                             /* yıldızlar */
      var on = k < star, sx0 = cx - 17 + k * 7, sy0 = y0 + H - 8;
      for (var r = 0; r < 4; r++) for (var c2 = 0; c2 < 5; c2++) if (STAR5[r].charAt(c2) === 'x') b.set(sx0 + c2, sy0 + r, on ? (r === 0 ? '#fff0a0' : '#ffd23a') : '#4a3220');
    }
    b.rect(x0 + 4, y0 - 3, 1, 3, '#2e2e32'); b.rect(x0 + 4, y0 - 3, 4, 1, '#2e2e32'); b.rect(x0 + 6, y0 - 2, 3, 2, '#3a3a40');   /* tabela lambaları */
    b.rect(x0 + W - 5, y0 - 3, 1, 3, '#2e2e32'); b.rect(x0 + W - 8, y0 - 3, 4, 1, '#2e2e32'); b.rect(x0 + W - 9, y0 - 2, 3, 2, '#3a3a40');
    if (nt) { b.rect(x0 + 6, y0, 3, 1, '#fff2c4'); b.rect(x0 + W - 9, y0, 3, 1, '#fff2c4'); }
    b.outline(0.55);
  });
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
  if (!o || !o.part) return false;
  if (o.part === 'back') { TK_STASH = null; at(houseBackSpr(o), o.x0, o.y0, 0); return true; }
  var nm = houseName(), t = o.t || T(), k;
  at(houseFrontSpr(o, nm), o.x0, o.y0, 0);
  var YF = o.y1 + 0.3, BY = YF + 0.3, RZ = HG + HU + 1, RY1 = BY + 0.25;
  if (o.night) {                                                    /* gece: pencere ve tabela ışığı */
    var gl = [[17.0, YF, 55, 16], [22.42, YF, 55, 16], [19.8, BY, 56, 34]];
    for (k = 0; k < gl.length; k++) { var g = gl[k]; L.fr(R(pX(g[0], g[1])), R(pY(g[0], g[1], g[2])), -g[3] - 3, -12, g[3] * 2 + 6, 26, 'rgba(255,214,140,.13)'); }
    L.fr(R(pX(o.x1 + 0.02, 25.38)), R(pY(o.x1 + 0.02, 25.38, 22)), -8, -18, 16, 34, 'rgba(255,214,140,.12)');
    var sx = R(pX(SIGN_X, RY1 - 0.05)), sy = R(pY(SIGN_X, RY1 - 0.05, RZ));
    L.fr(sx, sy, -48, -50, 96, 48, 'rgba(255,220,150,.12)');
    for (k = 0; k < 5; k++) { var lx = [16.6, 18.2, 19.8, 21.4, 23.0][k]; L.fr(R(pX(lx, o.y1 - 0.4)), R(pY(lx, o.y1 - 0.4, 0)), -14, -6, 28, 10, 'rgba(255,170,80,.10)'); }
  }
  /* baca dumanı: çalışan istasyon arttıkça yoğunlaşır */
  var lvl = 0.25 + (o.smoke || 0) * 0.75, bx = R(pX(22.0, 24.15)), by = R(pY(22.0, 24.15, 95));
  for (k = 0; k < 6; k++) {
    var ph = (t * (0.3 + lvl * 0.2) + k / 6) % 1, rr = R(2 + ph * 7), al = ((1 - ph) * (0.2 + 0.35 * lvl)).toFixed(2), ox = R(ph * 26 + Math.sin(t * 1.3 + k * 2) * 3), oy = -R(ph * 44);
    L.fr(bx, by, ox - rr, oy - rr, rr * 2, rr * 2, 'rgba(236,232,224,' + al + ')'); L.fr(bx, by, ox - rr + 2, oy - rr - 1, rr * 2 - 4, 1, 'rgba(250,248,240,' + al + ')');
  }
  return true;
};
/* ---------- teras ---------- */
function paveAt(x, y, Xb, Yb, A) {
  var e = Math.min(x - A.x0, A.x1 - x, y - A.y0, A.y1 - y), g = hash(Xb, Yb), c;
  if (e < 0.05) return '#7d725c';
  if (x > 23.65 && y < 26) {                                       /* arka avlu: sıkışmış toprak + yassı taşlar */
    var cu = Math.floor(x / 0.42), cv = Math.floor(y / 0.42), lu = frac(x / 0.42) - 0.5, lv = frac(y / 0.42) - 0.5, hs = hash(cu + 70, cv + 3);
    if (hs > 0.35 && Math.abs(lu) + Math.abs(lv) * 1.1 < 0.36 + hs * 0.08) { c = ['#a8a294', '#b6b0a1', '#9c9686'][Math.floor(hs * 30) % 3]; return lu + lv < -0.3 ? lite(c, 0.12) : c; }
    c = g > 0.92 ? '#a08a62' : g < 0.05 ? '#cdb994' : (hash(Xb >> 2, Yb >> 2) > 0.6 ? '#b9a27a' : '#b19a71');
    return c;
  }
  if (x < 16.25 && y > 28.05 && y < 29.15) {                       /* kapı eşiği: Karadeniz çakıl döşemesi */
    var pu = frac(x / 0.16) - 0.5, pv = frac(y / 0.16) - 0.5, hp = hash(Math.floor(x / 0.16), Math.floor(y / 0.16) + 500);
    if (pu * pu + pv * pv * 1.6 > 0.2) return '#8a7f68';
    var ring = Math.abs(Math.hypot(x - 15.0, (y - 28.6) * 1.0) - 0.75) < 0.12;
    return ring ? (hp > 0.5 ? '#3e4a52' : '#4a565e') : (hp > 0.6 ? '#e8e0cc' : hp > 0.3 ? '#d8cfb8' : '#c9bfa6');
  }
  if (e < 0.32) {                                                  /* kenar bordürü */
    var along = (x - A.x0 < 0.32 || A.x1 - x < 0.32) ? y : x;
    if (frac(along / 0.55) < 0.07 || e > 0.28) return '#8a7f68';
    c = e < 0.12 ? '#bdb299' : '#a99d84'; return g > 0.93 ? dark(c, 0.07) : c;
  }
  var gx = (x - A.x0 - 0.32) / 0.6, gy = (y - A.y0 - 0.32) / 0.6, cj = Math.floor(gy);
  if (cj & 1) gx += 0.5;
  var ci = Math.floor(gx), lx = gx - ci, ly = gy - cj;
  if (lx < 0.06 || ly < 0.06) return hash(ci * 3 + 1, cj * 7) > 0.8 && g > 0.4 ? V.MOSS : V.DZ;
  var hs2 = hash(ci + 11, cj * 5);
  c = V.PAVE[Math.floor(hs2 * V.PAVE.length)];
  if (lx < 0.13 || ly < 0.13) c = lite(c, 0.14); else if (lx > 0.92 || ly > 0.92) c = dark(c, 0.1);
  if (hs2 > 0.9 && Math.abs(lx - ly - 0.1) < 0.025) c = dark(c, 0.2);
  if (g > 0.95) c = dark(c, 0.05); else if (g < 0.03) c = lite(c, 0.1);
  if (y < 26.7 && x < 23.7) c = dark(c, 0.08 * (26.7 - y) / 0.7);   /* saçak gölgesi */
  return c;
}
function terrFloorSpr(A) {
  return spr('lkTF|' + [A.x0, A.y0, A.x1, A.y1].join(',') + '|' + G().K, A.x0, A.y0, function (b) {
    quadW(b, A.x0, A.y0, A.x1 - A.x0, A.y1 - A.y0, 0, function (Xb, Yb) { var w = inv(Xb, Yb, 0, A.x0, A.y0); return paveAt(w[0], w[1], Xb, Yb, A); });
    var tufts = [[15.25, 31.6], [24.7, 31.5], [24.75, 23.2], [15.3, 23.1], [24.6, 27.4], [15.35, 30.4]];      /* duvar dibinde ot */
    tufts.forEach(function (p, i) { var X = R(fx(p[0], p[1])), Y = R(fy(p[0], p[1], 0)); for (var k = 0; k < 4; k++) b.rect(X - 3 + k * 2, Y - 1 - (k & 1), 1, 2 + (k & 1), (i + k) % 2 ? '#7f9a4a' : '#6a8a3a'); });
  });
}
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
var SPOST = null;
function terrPosts(A) {
  if (SPOST && SPOST.k === A.x0 + ',' + A.y1) return SPOST;
  var s = [], e = [], k;
  for (k = 0; k < 5; k++) s.push([A.x0 + 0.17 + k * (A.x1 - A.x0 - 0.34) / 4, A.y1 - 0.15]);
  [26.2, 28.9].forEach(function (y) { e.push([A.x1 - 0.12, y]); });
  e.push(s[4]);
  return (SPOST = { k: A.x0 + ',' + A.y1, s: s, e: e });
}
function westSpr(o) {
  var A = o.area, g = o.gap || [28.05, 29.15];
  return spr('lkTW|' + [A.x0, A.y0, A.y1, g[0], g[1]].join(',') + '|' + G().K, A.x0, A.y0, function (b) {
    lowWall(b, A.x0, A.y0, A.x0 + 0.2, g[0] - 0.15, 8, 51);
    lowWall(b, A.x0, g[1] + 0.15, A.x0 + 0.2, A.y1 - 0.05, 8, 53);
    pillar(b, A.x0 + 0.1, A.y0 + 0.15, 11);
    b.outline(0.55);
  });
}
function southSpr(o) {
  var A = o.area, P0 = terrPosts(A);
  return spr('lkTS|' + [A.x0, A.y0, A.x1, A.y1].join(',') + '|' + G().K, A.x0, A.y0, function (b) {
    lowWall(b, A.x1 - 0.2, A.y0, A.x1, A.y1 - 0.3, 8, 61);
    lowWall(b, A.x0, A.y1 - 0.3, A.x1, A.y1, 8, 63);
    P0.e.slice(0, 2).forEach(function (p) { pillar(b, p[0] - 0.03, p[1], 12); });
    P0.s.forEach(function (p) { pillar(b, p[0], p[1], 12); });
    pillar(b, A.x1 - 0.12, A.y0 + 0.15, 11);
    [[A.x1 - 0.55, A.y1 - 0.62], [A.x0 + 0.62, A.y1 - 0.62]].forEach(function (p, i) {                   /* köşe saksıları: sardunya / limon */
      box(b, p[0] - 0.17, p[1] - 0.17, 0.34, 0.34, 0, 7, '#5a3a22', '#b4643e', '#8a4528');
      hl(b, p[0] - 0.17, p[1] + 0.17, p[0] + 0.17, p[1] + 0.17, 6, '#d08058');
      var X = R(fx(p[0], p[1])), Y = R(fy(p[0], p[1], 7));
      if (i) { b.ellipse(X, Y - 9, 7, 6, '#4f8a3a'); b.ellipse(X - 1, Y - 10, 5, 4, '#6fa24a'); b.set(X - 3, Y - 8, '#f0d84a'); b.set(X + 3, Y - 11, '#f0d84a'); b.set(X + 1, Y - 6, '#f0d84a'); b.rect(X, Y - 3, 1, 3, '#5d3c1c'); }
      else for (var l = 0; l < 7; l++) { b.rect(X - 6 + l * 2, Y - 4 - (l % 3), 2, 3, l % 2 ? '#3f7a32' : '#4f8a3a'); if (l % 2 === 0) b.rect(X - 6 + l * 2, Y - 7 - (l % 3), 2, 2, l % 4 ? '#e5533d' : '#d94a6a'); }
    });
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
  var A = o.area, t = o.t || T(), k;
  if (o.part === 'floor') { at(terrFloorSpr(A), A.x0, A.y0, 0); return true; }
  if (o.part === 'west') { at(westSpr(o), A.x0, A.y0, 0); return true; }
  if (o.part === 'south') {
    at(southSpr(o), A.x0, A.y0, 0);
    var P0 = terrPosts(A);
    for (k = 0; k < P0.s.length - 1; k++) bulbChain(P0.s[k][0], P0.s[k][1], 14, P0.s[k + 1][0], P0.s[k + 1][1], 14, 6, 3, o.night, t);
    for (k = 0; k < P0.e.length - 1; k++) bulbChain(P0.e[k][0] - 0.03, P0.e[k][1], 14, P0.e[k + 1][0] - 0.03, P0.e[k + 1][1], 14, 5, 3, o.night, t);
    return true;
  }
  if (o.part === 'top') {
    if (!o.up || !o.up.ter || !o.pergola) return true;
    var P = o.pergola;
    at(pergolaSpr(P), P.x0, P.y0, 0);
    bulbChain(P.x0, P.y1, 36, P.x1, P.y1, 36, 7, 3, o.night, t, 0.7);
    return true;
  }
  return false;
};
/* giriş kapısı (batı duvarındaki boşluk): iki taş paye + ahşap baş kirişi, asma, fener; rezervasyon rozeti */
function gateSpr(x, y) {
  return spr('lkGT|' + x + ',' + y + '|' + G().K, x, y, function (b) {
    var g0 = y - 0.55, g1 = y + 0.55, gx = x + 0.0;
    pillar(b, gx, g0 - 0.02, 22);
    box(b, gx - 0.07, g0 - 0.1, 0.14, g1 - g0 + 0.2, 24, 28, '#a87444', K.woodV('#7a4e2a', 4), '#5a3a22', { norim: true });   /* baş kirişi */
    pillar(b, gx, g1 + 0.02, 22);
    for (var k = 0; k < 5; k++) {                                              /* kirişin uçlarında asma (kiriş okunur kalsın) */
      var yy = k < 3 ? g0 - 0.05 + k * 0.14 : g1 + 0.05 - (k - 3) * 0.16, X = R(fx(gx, yy)), Y = R(fy(gx, yy, 28));
      leaf(b, X + (k & 1 ? 2 : -2), Y - 1 + (k % 3), k % 3);
    }
    b.rect(R(fx(gx, g1 + 0.05)) - 1, R(fy(gx, g1 + 0.05, 24)), 1, 10, '#4f7a3a'); b.rect(R(fx(gx, g0 - 0.05)), R(fy(gx, g0 - 0.05, 24)), 1, 8, '#4f7a3a');
    var lx = R(fx(gx, y)), ly = R(fy(gx, y, 24));                             /* fener */
    b.rect(lx, ly, 1, 4, '#2e2e32'); b.rect(lx - 2, ly + 4, 5, 1, '#2e2e32'); b.rect(lx - 2, ly + 5, 5, 6, '#3a3a40'); b.rect(lx - 1, ly + 6, 3, 4, '#d8c890'); b.rect(lx - 2, ly + 11, 5, 1, '#2e2e32');
    b.outline(0.55);
  });
}
function gateLamp(x, y, night) {
  var lx = R(pX(x, y)), ly = R(pY(x, y, 24));
  if (night) { L.fr(lx, ly, -2, 12, 3, 8, '#ffd98f'); L.fr(lx, ly, -12, 4, 25, 26, 'rgba(255,214,140,.16)'); }
}

/* ince modun açılıp kapanmasında yerel önbellekler */
HKA.onReset(function () { TC = null; CF = null; TK_STASH = null; SPOST = null; });
/* yeni (karada) yerleşim çizildi: game.js eski kancaları ince modda yeniden çağırır. HKA.lokV2 bu dosyanın v2 bilen kancaları
   takılıyken true okunur (başka biri kancaları değiştirirse — ör. test kaydedicisi — false); açıkça atanan değer önceliklidir. */
(function () {
  var mine = HKA.drawLokTable, ov;
  try { Object.defineProperty(HKA, 'lokV2', { configurable: true, enumerable: true, get: function () { return ov !== undefined ? ov : HKA.drawLokTable === mine; }, set: function (v) { ov = v; } }); }
  catch (e) { HKA.lokV2 = true; }
})();
})();
