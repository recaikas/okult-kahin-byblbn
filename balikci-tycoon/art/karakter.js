/* =====================================================================
   HAMSİ KOYU — ince piksel: KARAKTER (sanatçı dosyası)
   drawPerson (oyuncu, işçiler, müşteriler, özel müşteriler, hikâye karakterleri, müdürler, kahraman portresi),
   drawEmote (duygu balonu), drawCat (kedi).

   ORANLAR (ince piksel, K = 2; çapa (0,0) = ayak ortası, orta çizgi -1 ile 0 arası)
     kafa 12×14 (x -6..5), gövde 16×18 (x -8..7), kol 4 px, bacak 6×14, toplam ~46 px (saç dahil).
     Klasik drawPerson'ın her ölçüsü 2 katı; uzun boy +8, kısa boy -4 ince piksel.
   ÖNBELLEK
     Kıyafet anahtarı: o'nun kendi alanları (face/mood/walk hariç) sırayla birleştirilir (for-in, ~1 µs).
     Kıyafet başına 5 duruş (yürüme A / geçiş / yürüme B / duruş / nefes) × 4 kol (serbest / taşıma / iş 2 kare)
     × 2 yön × 4 yüz ifadesi = 160 yuva; yalnız görülen yuvalar kurulur. Kendi önbelleğimiz (ortak L.sprite'ı
     şişirip arka planı sildirmesin diye).
   ===================================================================== */
(function () {
'use strict';
var HKA = window.HKA = window.HKA || {};
var L = HKA.lib;
if (!L) return;
var G = function () { return window.HKG; };
var lite = L.lite, dark = L.dark, mix = L.mix;

var CRE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function col(v, d) { return (typeof v === 'string' && CRE.test(v)) ? v : d; }

/* ---------------- oyun köprüsü (tembel) ---------------- */
var gShadow = null, gStack = null, WALK = null, ANIM = null, PAL = null;
function init() {
  if (gShadow) return;
  var H = G();
  gShadow = H.shadow || H.v('shadow'); gStack = H.drawStack || H.v('drawStack');   /* köprü alanı (mimar, v2.13) */
  WALK = H.WALK; ANIM = H.ANIM; PAL = H.PAL;
}

/* ---------------- önbellek ---------------- */
var OUT = new Map(), OUT_MAX = 600, builds = 0;
function okey(o) {
  var s = '';
  for (var k in o) {
    if (k === 'face' || k === 'mood' || k === 'walk') continue;
    var v = o[k];
    if (v === undefined || v === null) continue;
    s += k + ':' + v + ';';
  }
  return s;
}
function outfitSlots(o) {
  var key = okey(o), e = OUT.get(key);
  if (!e) {
    if (OUT.size >= OUT_MAX) {                        /* en eski yarıyı at (Map ekleme sırasını korur) */
      var n = OUT.size >> 1, it = OUT.keys();
      while (n-- > 0) OUT.delete(it.next().value);
    }
    e = new Array(160); OUT.set(key, e);
  }
  return e;
}
var CATS = new Map(), EMO = new Map();
HKA.onReset(function () { OUT.clear(); CATS.clear(); EMO.clear(); gShadow = null; });

/* =====================================================================
   KİŞİ SPRITE'I
   pose: 0 yürüme A (sol bacak adımda), 1 geçiş, 2 yürüme B, 3 duruş, 4 duruş-nefes (üst gövde 1 px yukarı)
   arm : 0 serbest, 1 taşıma/tutma, 2-3 iş (eğilme + 2 kare el hareketi)
   fx  : 1 sağa, -1 sola bakar.  mood: 0 yok, 1 kızgın, 2 düz, 3 mutlu
   ===================================================================== */
function build(o, pose, arm, fx, mood) {
  var b = L.buf();
  var coat = col(o.coat, PAL.indigo), coat2 = col(o.coat2, coat);
  var skin = col(o.skin, PAL.skin[0]), hair = col(o.hair, PAL.hair[0]);
  var pants = col(o.pants, '#2b3a45'), boot = col(o.boot, '#1a2830'), bootTop = col(o.bootTop, '#2f4450');
  var skL = lite(skin, 0.2), skS = dark(skin, 0.2), skD = dark(skin, 0.36);
  var hrL = lite(hair, 0.3), hrD = dark(hair, 0.3);
  var H2 = o.tall ? 8 : o.short ? -4 : 0;
  var ub = pose === 4 ? -1 : 0;
  var wk = arm >= 2, wf = arm === 3 ? 1 : 0;
  var lean = wk ? fx * 2 : 0;                         /* gövde eğilmesi (ince px, yönlü) */
  var L2 = wk ? 2 : 0;                                /* aynı eğilme, sağa bakış koordinatında */
  var hx = wk ? fx : 0, c = wk ? 1 : 0;               /* kafa 1 px öne */
  var Wk = pose === 0 ? WALK[0] : pose === 2 ? WALK[2] : null;
  var fl = Wk ? Wk.fl : 0, bl = Wk ? Wk.bl : 0, fa = Wk ? Wk.fa : 0, ba = Wk ? Wk.ba : 0;
  var TT = -30 - H2 + ub, TB = -13 - H2 + ub, HY = -44 - H2 + ub;
  var belly = !!o.belly, bo = belly ? 2 : 0;

  function r(x, y, w, h, cc) { b.rect(x, y, w, h, cc); }
  function p(x, y, cc) { b.set(x, y, cc); }
  function X(x, w) { return fx > 0 ? x : -x - (w || 1); }   /* yöne bağlı ayna (sağa bakış koordinatı → gerçek) */
  function rf(x, y, w, h, cc) { b.rect(X(x, w), y, w, h, cc); }
  function pf(x, y, cc) { b.set(X(x, 1), y, cc); }
  function ell(cx, cy, rx, ry, f) {                   /* gölgeli elips: f(nx, ny) → renk; nx,ny -1..1 */
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx + 0.35) + (y * y) / (ry * ry + 0.35) > 1) continue;
      var cc = f(x / (rx || 1), y / (ry || 1), x, y); if (cc) b.set(cx + x, cy + y, cc);
    }
  }
  function ellF(cx, cy, rx, ry, f) {                  /* yöne bağlı elips (cx sağa bakış koordinatı) */
    var X0 = fx > 0 ? cx : -cx - 1;
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx + 0.35) + (y * y) / (ry * ry + 0.35) > 1) continue;
      var cc = f(x / (rx || 1), y / (ry || 1), x, y); if (cc) b.set(X0 + x, cy + y, cc);
    }
  }
  function shd(base) {                                /* ışık sol üstten: 3 ton */
    var l = lite(base, 0.24), d = dark(base, 0.26);
    return function (nx, ny) { var s = nx * 0.75 + ny * 0.65; return s < -0.55 ? l : s > 0.5 ? d : base; };
  }

  /* ---------- pelerin (en arkada) ---------- */
  if (o.cape) {
    var cp = col(o.cape, '#6a2a2a'), cpD = dark(cp, 0.25), cpL = lite(cp, 0.2);
    for (var cy = TT - 1; cy <= TT + 26; cy++) {
      var t = (cy - TT) / 26, hw = Math.round(10 + t * 3);
      for (var cx = -hw; cx < hw; cx++) p(cx + lean, cy, cx > hw - 4 ? cpD : cx < -hw + 2 ? cpL : cp);
    }
    r(-9 + lean, TT - 1, 18, 1, cpL);
    r(-11 + lean, TT + 18, 1, 8, cpD); r(9 + lean, TT + 18, 1, 8, dark(cp, 0.4));    /* kıvrımlar */
  }
  /* ---------- sırt küfesi / gitar (gövdenin arkasında) ---------- */
  if (o.kufe) {
    var kW = '#9a7340', kL = '#c9a15e', kD = '#7a5a30';
    for (var ky = 0; ky < 19; ky++) for (var kx = 0; kx < 10; kx++) {
      var kc = ky % 4 === 3 ? kD : (kx + (ky >> 2)) % 3 === 0 ? kL : kW;
      if (kx === 9) kc = dark(kc, 0.18);
      pf(-18 + L2 + kx, TT - 4 + ky, kc);
    }
    rf(-19 + L2, TT - 5, 12, 2, kL); rf(-19 + L2, TT - 5, 12, 1, lite(kL, 0.25));
  }
  if (o.guitar) {
    var gc = col(o.guitar, '#b5652a'), gs = shd(gc);
    rf(-13 + L2, TT - 13, 2, 22, '#5a3a1a'); rf(-13 + L2, TT - 13, 1, 22, '#7a5230');
    rf(-14 + L2, TT - 16, 4, 3, '#3a2410'); pf(-15 + L2, TT - 15, '#cfd8de'); pf(-10 + L2, TT - 14, '#cfd8de');
    ellF(-15 + L2, TT + 8, 4, 3, gs); ellF(-15 + L2, TT + 15, 5, 5, gs);
    rf(-16 + L2, TT + 12, 2, 2, '#2a1a0a');
    rf(-17 + L2, TT + 17, 5, 1, '#3a2410');
  }

  /* ---------- bacaklar / etek ---------- */
  if (o.skirt) {
    var sk = col(o.skirt, '#4a3a4a'), skrL = lite(sk, 0.16), skrD = dark(sk, 0.24), top = -16 - H2;
    var sl = fl > 0 ? 1 : 0, sr = bl > 0 ? 1 : 0;
    r(-6, -2 - sl, 5, 2, boot); r(-6, -2 - sl, 5, 1, lite(boot, 0.2));            /* ayakkabılar */
    r(1, -2 - sr, 5, 2, dark(boot, 0.15)); r(1, -2 - sr, 5, 1, boot);
    for (var y = top; y <= -3; y++) {
      var hw2 = 8 + Math.round((y - top) / (-3 - top) * 2.4);
      for (var x = -hw2; x < hw2; x++) {
        var ccol = x < -hw2 + 2 ? skrL : x >= hw2 - 3 ? skrD : sk;
        if (y > top + 3 && (x === -3 || x === 2) && ((y - top) & 1)) ccol = skrD;
        if (y === -3) ccol = skrD;
        p(x, y, ccol);
      }
    }
    r(-8, top, 16, 1, skrL);
  } else {
    var lt = -14 - H2;
    var leg = function (x0, lift, right) {
      var pc = right ? dark(pants, 0.2) : pants;
      var bot = -5 - lift;
      r(x0, lt, 6, bot - lt + 1, pc);
      if (!right) r(x0, lt, 1, bot - lt + 1, lite(pants, 0.14));
      r(right ? x0 : x0 + 5, lt + 2, 1, bot - lt - 1, dark(pc, 0.14));
      var fx0 = right ? x0 : x0 - 1, bc = right ? dark(boot, 0.12) : boot;
      if (o.boots !== false) {                        /* lastik çizme: konç + ağız */
        var bt = right ? dark(bootTop, 0.12) : bootTop;
        r(x0, -8 - lift, 6, 4, bc); r(x0, -8 - lift, 6, 1, bt); r(x0, -7 - lift, 6, 1, mix(bt, bc, 0.5));
        if (!right) r(x0, -6 - lift, 1, 2, lite(bc, 0.18));
      }
      r(fx0, -4 - lift, 7, 4, bc);                    /* ayak */
      r(fx0, -4 - lift, 7, 1, lite(bc, right ? 0.12 : 0.24));
      r(fx0, -1 - lift, 7, 1, dark(bc, 0.4));         /* taban */
    };
    leg(-7, fl > 0 ? 2 : 0, false); leg(1, bl > 0 ? 2 : 0, true);
  }

  function sleeve(x, y0, len, right, real) {          /* real: x gerçek koordinat */
    var R0 = real ? r : rf;
    R0(x, y0, 4, len, right ? svD : sv);
    R0(right ? x + 3 : x, y0 + 1, 1, len - 1, right ? dark(svD, 0.12) : svL);
    R0(x, y0, 4, 1, right ? sv : svL);
    R0(x, y0 + len - 1, 4, 1, dark(right ? svD : sv, 0.12));    /* kol ağzı */
  }
  function handAt(x, y, right, real) {
    var R0 = real ? r : rf;
    R0(x, y, 4, 3, right ? skS : skin); R0(x, y, 4, 1, right ? skin : skL); R0(right ? x + 3 : x, y + 2, 1, 1, right ? skD : skS);
  }
  /* ---------- kollar ---------- */
  function drawArms() {
  if (carrying) {                                     /* iki kol önde, eller göğüs hizasında */
    sleeve(-12 - bo + lean, TT + 1, 8, false, true); sleeve(8 + bo + lean, TT + 1, 8, true, true);
    r(-10 - bo + lean, TT + 8, 4, 3, sv); r(6 + bo + lean, TT + 8, 4, 3, svD);
    handAt(-8 + lean, TT + 9, false, true); handAt(4 + lean, TT + 9, true, true);
    hand = { x: 4 + L2, y: TT + 9 };
  } else if (wk) {                                    /* iş: öne eğik, yöndeki el aşağı-öne, 2 kare */
    var bx = fx > 0 ? -12 - bo + lean : 8 + bo + lean;  /* arkadaki kol (gerçek x) */
    sleeve(bx, TT + 1, 11, fx < 0, true); handAt(bx, TT + 12, fx < 0, true);
    var hy = TT + 12 - wf * 3;
    sleeve(8 + bo + L2, TT + 1, 8, fx > 0); rf(10 + bo + L2, TT + 8, 4, hy - TT - 8 + 1, fx > 0 ? svD : sv);
    handAt(11 + bo + L2, hy, fx > 0);
    hand = { x: 11 + bo + L2, y: hy };
  } else {
    var lenOf = function (s) { return s < 0 ? 10 : s > 0 ? 13 : 12; };
    var la = lenOf(fa), ra = lenOf(ba);
    var backRight = fx < 0;                           /* arkadaki kol sağdaki mi */
    /* sol kol (gerçek) */
    if (!(raise && fx < 0)) { sleeve(-12 - bo, TT + 1, la, false, true); handAt(-12 - bo, TT + 1 + la, false, true); }
    if (!(raise && fx > 0)) { sleeve(8 + bo, TT + 1, ra, true, true); handAt(8 + bo, TT + 1 + ra, true, true); }
    if (!raise) hand = { x: 8 + bo, y: TT + 1 + (fx > 0 ? ra : la) };
    else {                                            /* yöndeki kol bükük: dirsek aşağıda, el önde-yukarıda */
      var rr = fx > 0;
      if (o.phone) {
        sleeve(8 + bo, TT + 1, 6, rr); rf(7 + bo, HY + 10, 4, TT + 2 - HY - 10, rr ? svD : sv);
        hand = { x: 6 + bo, y: HY + 7 };
      } else if (o.mic) {
        sleeve(8 + bo, TT + 1, 9, rr); hand = { x: 8 + bo, y: TT + 4 };
      } else if (o.tray) {
        sleeve(8 + bo, TT + 1, 9, rr); rf(10 + bo, TT + 6, 4, 4, rr ? svD : sv); hand = { x: 11 + bo, y: TT + 6 };
      } else {
        sleeve(8 + bo, TT + 1, 9, rr); rf(9 + bo, TT + 8, 4, 3, rr ? svD : sv); hand = { x: 9 + bo, y: TT + 10 };
      }
    }
    void backRight;
  }
  }

  var sv = coat2, svL = lite(coat2, 0.16), svD = dark(coat2, 0.2);
  var carrying = arm === 1;
  var raise = arm === 0 && (o.mic || o.phone || o.notebook || o.tray);   /* yöndeki kol bir şey tutuyor */
  var hand = { x: 9, y: TT + 13 };                    /* yöndeki elin yeri (sağa bakış koordinatı) */
  var armsEarly = belly && !carrying;          /* göbekte kollar göbeğin arkasında kalır */

  /* ---------- gövde ---------- */
  var tx = -8 + lean, th = TB - TT + 1;
  var cL = lite(coat, 0.12), cD = dark(coat, 0.24);
  r(tx, TT, 16, th, coat);
  r(tx, TT + 1, 2, th - 1, cL);
  r(tx + 13, TT + 1, 3, th - 1, cD);
  r(tx, TT, 16, 1, coat2); r(tx + 1, TT + 1, 13, 1, mix(coat2, coat, 0.5));
  for (var fj = 0; fj < 3; fj++) { p(tx + 5 + fj, TT + 6 + fj * 3, dark(coat, 0.1)); p(tx + 6 + fj, TT + 6 + fj * 3, dark(coat, 0.1)); }
  if (armsEarly) drawArms();
  if (belly) {                                        /* göbek: önde yuvarlak, yöne biraz taşar, kemerin üstüne sarkar */
    var bl1 = lite(coat, 0.22), bd1 = dark(coat, 0.22), bd2 = dark(coat, 0.36);
    ellF(1 + L2, TT + 12, 11, 7, function (nx, ny) {
      var s = nx * 0.72 + ny * 0.7;
      return ny > 0.82 ? bd2 : s < -0.62 ? bl1 : s > 0.42 ? bd1 : coat;
    });
    rf(-3 + L2, TT + 8, 3, 1, bl1); rf(-5 + L2, TT + 9, 2, 1, bl1);
    pf(2 + L2, TT + 14, dark(coat, 0.3));
  }
  if (!o.tie && !o.bowtie && !o.scarf) {              /* V yaka */
    r(-3 + lean, TT, 6, 1, skS); r(-2 + lean, TT + 1, 4, 1, skS); r(-1 + lean, TT + 2, 2, 1, skD);
    p(-4 + lean, TT, lite(coat2, 0.2)); p(3 + lean, TT, lite(coat2, 0.2));
  }
  if (o.knit) {                                       /* örgü kazak: baklava şeridi */
    var kn = col(o.knit, '#cfe3f0'), bw = belly ? 10 : 8;
    for (var kx2 = -bw; kx2 < bw; kx2++) {
      var m4 = (kx2 + 16) & 3;
      if (m4 === 0) p(kx2 + lean, TT + 6, kn);
      if (m4 === 1 || m4 === 3) p(kx2 + lean, TT + 7, kn);
      if (m4 === 2) p(kx2 + lean, TT + 8, kn);
      if (!belly && ((kx2 + 16) & 1)) p(kx2 + lean, TT + 3, dark(kn, 0.2));
    }
  }
  if (!o.skirt && !belly) {                           /* kemer */
    r(tx, TB - 1, 16, 2, dark(pants, 0.42)); r(tx, TB - 1, 16, 1, dark(pants, 0.3));
    r(-2 + lean, TB - 1, 3, 2, '#c9a15e'); p(-1 + lean, TB - 1, '#f0d890');
  }
  if (o.apron) {                                      /* muşamba önlük */
    var ap = col(o.apron, '#c9782f'), apL = lite(ap, 0.25), apD = dark(ap, 0.18);
    var aw = belly ? 9 : 6;
    r(-aw + lean, TT + 8, aw * 2, 13, ap); r(-aw + lean, TT + 8, aw * 2, 1, apL);
    r(aw - 3 + lean, TT + 9, 3, 12, apD); r(-aw + lean, TT + 20, aw * 2, 1, dark(ap, 0.3));
    r(-4 + lean, TT + 2, 8, 6, ap); r(-4 + lean, TT + 2, 8, 1, apL); r(2 + lean, TT + 3, 2, 5, apD);
    r(-6 + lean, TT, 1, 3, apD); r(5 + lean, TT, 1, 3, apD);
    r(-3 + lean, TT + 12, 5, 4, dark(ap, 0.1)); r(-3 + lean, TT + 12, 5, 1, dark(ap, 0.28));   /* cep */
  }
  if (o.vest) {                                       /* yelek */
    var vs = col(o.vest, '#4a3a5e'), vL = lite(vs, 0.2), vD = dark(vs, 0.22), vh = 16 + (belly ? 1 : 0);
    r(tx - bo, TT, 5 + bo, vh, vs); r(tx - bo, TT, 1, vh, vL);
    r(tx + 11, TT, 5 + bo, vh, vD);
    p(tx + 4, TT, coat); p(tx + 4, TT + 1, coat); p(tx + 11, TT, coat); p(tx + 11, TT + 1, coat);
    r(tx + 4, TT + 2, 1, vh - 2, vL); r(tx + 11, TT + 2, 1, vh - 2, vs);
    p(tx + 3, TT + 7, '#d9c27a'); p(tx + 3, TT + 11, '#d9c27a');
  }
  if (o.sash) {                                       /* kuşak */
    var sa = col(o.sash, '#d9a441'), sw = belly ? 10 : 8;
    r(-sw + lean, TT + 12, sw * 2, 4, sa); r(-sw + lean, TT + 12, sw * 2, 1, lite(sa, 0.25));
    r(-sw + lean, TT + 15, sw * 2, 1, dark(sa, 0.25));
    for (var sq = -sw + 1; sq < sw; sq += 3) p(sq + lean, TT + 13, dark(sa, 0.18));
    rf(-6 + L2, TT + 16, 2, 4, sa); rf(-4 + L2, TT + 16, 1, 3, dark(sa, 0.25));
  }
  if (o.scales) {                                     /* balık pulu */
    var scc = col(o.scales, '#7fc8c0'), scL = lite(scc, 0.3);
    for (var sr2 = 0; sr2 < 5; sr2++) for (var sc2 = 0; sc2 < 4; sc2++) {
      var sx0 = tx + sc2 * 4 + (sr2 & 1 ? 2 : 0), sy0 = TT + 2 + sr2 * 3;
      if (sx0 + 3 > tx + 15) continue;
      p(sx0, sy0, scc); p(sx0 + 3, sy0, scc); p(sx0 + 1, sy0 + 1, scc); p(sx0 + 2, sy0 + 1, scL);
    }
  }
  if (o.tie) {                                        /* kravat + beyaz yaka */
    var ti = col(o.tie, '#3f6fb0');
    r(-4 + lean, TT, 3, 2, '#f4f0e6'); r(1 + lean, TT, 3, 2, '#dcd6c8');
    r(-2 + lean, TT, 4, 2, dark(ti, 0.2)); r(-2 + lean, TT + 2, 4, 9, ti); r(-1 + lean, TT + 11, 2, 2, ti);
    r(-2 + lean, TT + 2, 1, 9, lite(ti, 0.2)); r(1 + lean, TT + 3, 1, 8, dark(ti, 0.18));
  }
  if (o.bowtie) {                                     /* papyon */
    var bt2 = col(o.bowtie, '#1a1a1a');
    r(-4 + lean, TT, 3, 2, '#f4f0e6'); r(1 + lean, TT, 3, 2, '#dcd6c8');
    r(-5 + lean, TT, 4, 4, bt2); r(1 + lean, TT, 4, 4, bt2); r(-1 + lean, TT + 1, 2, 2, lite(bt2, 0.3));
    p(-5 + lean, TT, lite(bt2, 0.2));
  }
  if (o.chain) {                                      /* altın kolye */
    var gC = '#d9a441', gL = '#ffd76a';
    for (var ci = 0; ci < 5; ci++) { p(-6 + ci + lean, TT + ci, gC); p(5 - ci + lean, TT + ci, gC); }
    r(-2 + lean, TT + 5, 3, 3, gL); p(-1 + lean, TT + 8, gC); p(-2 + lean, TT + 5, '#fff2b0');
  }

  if (!armsEarly) drawArms();

  /* ---------- eşyalar ---------- */
  if (o.kufe) { rf(-7 + L2, TT, 2, 9, '#5a4028'); rf(-7 + L2, TT, 1, 9, '#7a5a38'); }
  if (o.guitar) for (var gi = 0; gi < 14; gi++) pf(6 - gi + L2, TT + Math.round(gi * 0.85), '#3a2a1a');
  if (o.bag) {                                        /* omuz çantası: kayış çaprazlama, çanta arka kalçada */
    var bg = '#4a3a2a', bgL = '#6a5640';
    for (var bi = 0; bi < 15; bi++) pf(6 - bi + L2, TT + Math.round(bi * 0.62), dark(bg, 0.1));
    rf(-16 - bo + L2, TT + 9, 7, 7, bg); rf(-16 - bo + L2, TT + 9, 7, 3, bgL); rf(-16 - bo + L2, TT + 11, 7, 1, dark(bg, 0.25));
    pf(-13 - bo + L2, TT + 11, '#c9a15e');
  }
  if (o.bigBag && !carrying) {                        /* büyük el çantası: arkadaki elde */
    var bb = col(o.bigBag, '#6b4a2a'), bbL = lite(bb, 0.22), bbD = dark(bb, 0.25);
    var hb = TT + 13 + 1;
    for (var hi = 0; hi < 5; hi++) { pf(-16 - bo + L2 + hi, hb - (hi === 0 || hi === 4 ? 1 : 3), bbD); }
    pf(-16 - bo + L2, hb, bbD); pf(-12 - bo + L2, hb, bbD);
    for (var by = 0; by < 9; by++) {
      var bww = by < 2 ? 8 : 10, bx0 = -19 - bo + L2 + (by < 2 ? 1 : 0);
      for (var bxx = 0; bxx < bww; bxx++) pf(bx0 + bxx, hb + 1 + by, by === 0 ? bbL : bxx >= bww - 2 ? bbD : bb);
    }
    rf(-15 - bo + L2, hb + 4, 2, 1, '#e6be59'); rf(-19 - bo + L2, hb + 9, 10, 1, dark(bb, 0.4));
  }
  if (o.briefcase && !carrying) {                     /* evrak çantası: arkadaki elde, deri gövde + pirinç kilit + sap */
    var bc = col(o.briefcase, '#4a2c18'), bcL = lite(bc, 0.22), bcD = dark(bc, 0.3);
    var bcx = -21 - bo + L2, bcy = TT + 15;
    rf(bcx + 4, bcy - 3, 6, 1, bcD); pf(bcx + 3, bcy - 2, bcD); pf(bcx + 10, bcy - 2, bcD); pf(bcx + 3, bcy - 1, bcD); pf(bcx + 10, bcy - 1, bcD);   /* sap */
    rf(bcx, bcy, 14, 9, bc); rf(bcx, bcy, 14, 1, bcL); rf(bcx, bcy, 1, 9, bcL); rf(bcx + 12, bcy + 1, 2, 8, bcD); rf(bcx, bcy + 8, 14, 1, bcD);
    rf(bcx, bcy + 3, 14, 1, bcD);                                                                    /* kapak çizgisi */
    rf(bcx + 3, bcy + 3, 2, 2, '#e6be59'); rf(bcx + 9, bcy + 3, 2, 2, '#e6be59'); pf(bcx + 3, bcy + 3, '#fff0b0');   /* kilitler */
  }
  if (o.notebook) {                                   /* not defteri, öndeki elde */
    var nx = hand.x + 2, ny = hand.y - 7;
    rf(nx, ny, 6, 8, '#e8ddc8'); rf(nx, ny, 6, 2, '#b3422f'); rf(nx, ny, 6, 1, '#d0604a');
    rf(nx + 1, ny + 3, 4, 1, '#a89878'); rf(nx + 1, ny + 5, 3, 1, '#a89878'); rf(nx + 5, ny + 2, 1, 6, '#c8bca4');
    handAt(hand.x, hand.y, fx > 0);
  }
  if (o.tray) {                                       /* tepsi: çay bardakları */
    var tyy = hand.y - 2;
    rf(hand.x - 5, tyy, 13, 2, '#c9a15e'); rf(hand.x - 5, tyy, 13, 1, '#e6c27a'); rf(hand.x - 5, tyy + 1, 13, 1, '#8a6a3a');
    rf(hand.x - 3, tyy - 4, 2, 4, '#c0602a'); rf(hand.x - 3, tyy - 4, 2, 1, '#f4efe4');
    rf(hand.x + 1, tyy - 4, 2, 4, '#b04a20'); rf(hand.x + 1, tyy - 4, 2, 1, '#f4efe4');
    rf(hand.x + 4, tyy - 2, 3, 2, '#e8ddc8');
    handAt(hand.x, tyy + 2, fx > 0);
  }
  if (o.knife) {                                      /* bıçak öndeki elde, ağzı yukarı */
    var kx3 = hand.x + 4, ky3 = hand.y + 1;
    rf(kx3 - 1, ky3, 2, 3, '#6f4526'); pf(kx3 - 1, ky3, '#8a5a32'); rf(kx3 - 1, ky3 - 1, 3, 1, '#5a3a20');
    for (var kb = 0; kb < 9; kb++) { var kxx = kx3 + (kb >> 2); pf(kxx, ky3 - 2 - kb, kb < 8 ? '#e8f0f4' : '#cfd8de'); pf(kxx + 1, ky3 - 2 - kb, '#8a98a2'); }
  }
  if (o.mic) {                                        /* mikrofon */
    var mx = hand.x + 1, my = hand.y;
    rf(mx + 1, my - 6, 2, 10, '#2a2a2a'); rf(mx, my - 10, 4, 4, '#9aa4ac'); rf(mx, my - 10, 4, 1, '#d4dadf');
    pf(mx + 1, my - 8, '#5a636b'); pf(mx + 3, my - 8, '#5a636b'); pf(mx + 2, my - 7, '#5a636b');
    handAt(mx, my, fx > 0);
  }

  /* ---------- saç (arka katman) ---------- */
  var hs = o.hairStyle | 0;
  var hat = o.scarf ? 'scarf' : o.fez ? 'fez' : o.tophat ? 'tophat' : o.fedora ? 'fedora' : o.turban ? 'turban' : o.cap ? 'cap' :
    o.chefHat ? 'chef' : o.sunHat ? 'sun' : o.beanie ? 'beanie' : '';
  var backOK = !hat || hat === 'cap' || hat === 'beanie' || hat === 'tophat' || hat === 'fedora' || hat === 'sun';
  if (hat === 'scarf') {
    var scf = col(o.scarf, '#c8553d'), scD = dark(scf, 0.22), scL2 = lite(scf, 0.18);
    for (var yy = HY - 3; yy <= TT + 2; yy++) {
      var hw3 = yy === HY - 3 ? 5 : yy === HY - 2 ? 7 : yy < TT - 1 ? 8 : 9 + (yy - TT + 1);
      for (var xx = -hw3; xx < hw3; xx++) p(xx + hx, yy, xx >= hw3 - 3 ? scD : xx < -hw3 + 2 ? scL2 : scf);
    }
    rf(-11 + c, TT - 3, 4, 8, scD); rf(-11 + c, TT - 3, 1, 8, scf);                 /* düğüm ucu */
  } else if (backOK) {
    if (hs === 2) {                                   /* uzun saç: omuza dökülen perde */
      r(hx - 9, HY - 1, 5, 18, hair); r(hx + 4, HY - 1, 5, 18, hrD);
      r(hx - 9, HY + 1, 1, 15, hrL); r(hx - 7, HY + 4, 1, 12, hrD); r(hx + 6, HY + 4, 1, 12, dark(hair, 0.45));
      r(hx - 8, HY + 17, 3, 1, hair); r(hx + 5, HY + 17, 3, 1, hrD);
    } else if (hs === 3) {                            /* at kuyruğu: arka tarafta */
      rf(c - 13, HY + 3, 4, 4, hair); rf(c - 13, HY + 7, 3, 5, hair); rf(c - 12, HY + 12, 2, 3, hrD);
      rf(c - 13, HY + 3, 1, 8, hrL); rf(c - 10, HY + 6, 1, 5, hrD);
      rf(c - 10, HY + 1, 3, 3, '#c0392b');
    } else if (hs === 5 && !hat) {                    /* gür kıvırcık bulut */
      var cl = function (nx, ny, x, y) {
        var s = nx * 0.7 + ny * 0.7, cc = s < -0.5 ? hrL : s > 0.45 ? hrD : hair;
        if (((x * 3 + y * 5) % 7 + 7) % 7 === 0) cc = s > 0.2 ? hair : hrL;
        return cc;
      };
      ell(hx - 1, HY + 2, 10, 9, cl); ell(hx, HY + 2, 10, 9, cl);
      ell(hx - 9, HY + 7, 3, 3, cl); ell(hx + 8, HY + 7, 3, 3, cl);
      ell(hx - 5, HY - 6, 3, 2, cl); ell(hx + 4, HY - 6, 3, 2, cl);
    }
  }

  /* ---------- baş ---------- */
  r(hx - 6, HY, 12, 14, skin);
  r(hx - 6, HY + 1, 2, 12, skL);
  r(hx + 4, HY + 1, 2, 12, skS);
  r(hx - 5, HY + 13, 10, 1, skS);
  b.del(hx - 6, HY + 13); b.del(hx + 5, HY + 13); b.del(hx - 6, HY); b.del(hx + 5, HY);
  p(hx - 7, HY + 6, skin); p(hx - 7, HY + 7, skS); p(hx - 7, HY + 8, skin);      /* kulaklar */
  p(hx + 6, HY + 6, skS); p(hx + 6, HY + 7, skD); p(hx + 6, HY + 8, skS);

  /* ---------- yüz (sağa bakış koordinatı, c = kafa kayması) ---------- */
  var brow = mix(hair, skin, 0.4), pup = '#2a1810', ew = '#f4f0e6';
  var browY = o.glasses ? HY + 4 : HY + 5;
  if (mood === 1) {                                   /* kızgın kaşlar */
    rf(c - 4, browY - 1, 1, 1, brow); rf(c - 3, browY, 2, 1, brow);
    rf(c + 2, browY, 2, 1, brow); rf(c + 4, browY - 1, 1, 1, brow);
  } else { rf(c - 4, browY, 3, 1, brow); rf(c + 2, browY, 3, 1, brow); }
  if (!o.shades) {
    rf(c - 4, HY + 6, 1, 3, ew); rf(c - 3, HY + 6, 2, 3, pup); pf(c - 3, HY + 6, '#ffffff');
    rf(c + 2, HY + 6, 1, 3, ew); rf(c + 3, HY + 6, 2, 3, pup); pf(c + 3, HY + 6, '#ffffff');
  }
  rf(c, HY + 8, 2, 2, skS); pf(c + 1, HY + 10, skD); pf(c, HY + 10, skS);        /* burun */
  b.set(X(c - 5, 2), HY + 10, '#f08070', 0.45); b.set(X(c - 5, 2) + 1, HY + 10, '#f08070', 0.45);   /* yanak */
  b.set(X(c + 3, 2), HY + 10, '#f08070', 0.4); b.set(X(c + 3, 2) + 1, HY + 10, '#f08070', 0.4);
  var lip = '#9a4a40', lipD = '#7a2e26';
  var mouthY = (o.thickMust) ? HY + 12 : HY + 11;
  if (mood === 3) { rf(c - 1, mouthY + 1, 3, 1, lipD); pf(c - 2, mouthY, lip); pf(c + 2, mouthY, lip); if (!o.thickMust) rf(c - 1, mouthY, 3, 1, '#c86a5a'); }
  else if (mood === 1) { rf(c - 1, mouthY, 3, 1, lipD); pf(c - 2, mouthY + 1, lipD); pf(c + 2, mouthY + 1, lipD); }
  else if (mood === 2) rf(c - 2, mouthY, 4, 1, lipD);
  else { rf(c - 1, mouthY, 3, 1, lip); rf(c - 1, mouthY - 1, 3, 1, mix(skin, skS, 0.5)); }

  if (o.beard) {                                      /* sakal: alt yüzü kaplar, ağız açıklığı */
    var bdT = function (x, y) { var cc = x >= 3 ? hrD : hair; if (((x * 5 + y * 3) & 7) === 0) cc = x >= 3 ? dark(hair, 0.45) : hrD; if (x <= -5 && y < HY + 12) cc = mix(hair, hrL, 0.5); return cc; };
    for (var by2 = HY + 8; by2 <= HY + 15; by2++) {
      var x0b = by2 < HY + 10 ? -6 : by2 < HY + 14 ? -6 : by2 === HY + 14 ? -5 : -3;
      var x1b = by2 < HY + 14 ? 5 : by2 === HY + 14 ? 4 : 2;
      for (var bx2 = x0b; bx2 <= x1b; bx2++) {
        if (by2 < HY + 10 && bx2 > -5 && bx2 < 4) continue;
        p(bx2 + hx, by2, bdT(bx2, by2));
      }
    }
    rf(c - 2, HY + 11, 4, 2, skS); rf(c - 1, HY + 12, 3, 1, mood === 1 ? lipD : lip);
  }
  if (o.must) {
    rf(c - 3, HY + 10, 6, 1, hair); pf(c - 3, HY + 11, hair); pf(c + 2, HY + 11, hrD); pf(c - 1, HY + 10, hrL);
  }
  if (o.thickMust) {
    rf(c - 4, HY + 10, 8, 2, hair); rf(c - 5, HY + 11, 2, 2, hair); rf(c + 3, HY + 11, 2, 2, hrD);
    rf(c - 3, HY + 10, 2, 1, hrL); pf(c + 1, HY + 10, hrL);
  }
  if (o.glasses) {                                    /* yuvarlak gözlük */
    var gf = '#3a3f48', gl = '#d8eef6';
    var lens = function (x0) {
      rf(x0 + 1, HY + 5, 3, 1, gf); rf(x0 + 1, HY + 9, 3, 1, gf); rf(x0, HY + 6, 1, 3, gf); rf(x0 + 4, HY + 6, 1, 3, gf);
    };
    lens(c - 5); lens(c + 1); pf(c, HY + 6, gf); pf(c - 6, HY + 6, gf);
    pf(c - 4, HY + 6, gl); pf(c + 2, HY + 6, gl); pf(c + 4, HY + 5, '#cfd8de');
  }
  if (o.shades) {                                     /* güneş gözlüğü */
    var sh1 = '#16161c', sh2 = '#2c2c38';
    rf(c - 5, HY + 6, 5, 3, sh1); rf(c + 1, HY + 6, 5, 3, sh1); rf(c - 5, HY + 6, 11, 1, sh2);
    pf(c, HY + 7, sh1); rf(c - 7, HY + 6, 2, 1, sh1);
    pf(c - 4, HY + 7, '#7a8a9a'); pf(c + 2, HY + 7, '#7a8a9a'); pf(c - 3, HY + 7, '#5a6a7a');
  }
  if (o.eyepatch) {                                   /* göz bandı */
    var ep = '#16161c';
    for (var ei = 0; ei < 8; ei++) pf(c - 7 + ei, HY + 2 + (ei >> 1), ep);
    rf(c + 1, HY + 5, 5, 5, ep); b.del(X(c + 1, 1), HY + 5); b.del(X(c + 5, 1), HY + 9); pf(c + 2, HY + 6, '#3a3a46');
    rf(c + 6, HY + 5, 1, 2, ep);
  }

  /* ---------- saç / başlık (ön katman) ---------- */
  var sideHair = function () { r(hx - 7, HY + 1, 1, 2, hair); r(hx + 6, HY + 1, 1, 2, hrD); r(hx - 6, HY + 1, 1, 3, hair); r(hx + 5, HY + 1, 1, 3, hrD); };
  var shortHair = function () {
    r(hx - 5, HY - 3, 10, 1, hair); r(hx - 6, HY - 2, 12, 4, hair);
    r(hx - 7, HY - 1, 1, 6, hair); r(hx + 6, HY - 1, 1, 6, hrD);
    r(hx - 6, HY + 2, 2, 3, hair); r(hx + 4, HY + 2, 2, 3, hrD); r(hx + 3, HY - 2, 3, 4, mix(hair, hrD, 0.5));
    r(hx - 4, HY - 3, 4, 1, hrL); r(hx - 5, HY - 2, 3, 1, hrL);
    rf(c - 1, HY + 2, 3, 1, hair); pf(c + 2, HY + 2, hair); pf(c + 1, HY + 3, hair);   /* perçem yöne */
  };
  if (hat === 'scarf') {
    var sf = col(o.scarf, '#c8553d'), sfD = dark(sf, 0.22), sfL = lite(sf, 0.2);
    r(hx - 5, HY - 3, 10, 1, sfL); r(hx - 6, HY - 2, 12, 5, sf); r(hx - 6, HY - 2, 12, 1, sfL); r(hx + 3, HY - 1, 3, 4, sfD);
    r(hx - 6, HY + 2, 12, 1, dark(sf, 0.12));
    r(hx - 6, HY + 3, 1, 10, sf); r(hx + 5, HY + 3, 1, 10, sfD); r(hx - 7, HY + 2, 1, 11, sfL); r(hx + 6, HY + 2, 1, 11, sfD);
    r(hx - 5, HY + 13, 10, 2, sf); r(hx + 1, HY + 13, 4, 2, sfD); r(hx - 5, HY + 13, 10, 1, dark(sf, 0.1));
    var dc = o.scarfDots ? col(o.scarfDots, '#f4e9d2') : null;
    if (dc) {
      for (var dx = -4; dx < 5; dx += 4) p(hx + dx, HY - 1, dc);
      p(hx - 2, HY + 1, dc); p(hx + 2, HY + 1, dc);
      p(hx - 7, HY + 6, dc); p(hx + 6, HY + 9, dc); p(hx - 3, HY + 14, dc); p(hx + 2, HY + 14, dc); p(hx - 8, TT + 1, dc); p(hx + 6, TT + 1, dc);
    }
  } else if (hat === 'fez') {
    var fz = '#a3231f', fzL = '#c23a2e', fzD = '#7d1915';
    for (var fy2 = 0; fy2 < 9; fy2++) {
      var fw = 5 + Math.round(fy2 / 8 * 2);
      for (var fx2 = -fw; fx2 < fw; fx2++) p(hx + fx2, HY - 9 + fy2, fx2 < -fw + 2 ? fzL : fx2 >= fw - 3 ? fzD : fz);
    }
    r(hx - 5, HY - 9, 10, 1, '#c84a3a'); r(hx - 7, HY - 2, 14, 2, '#8d1c19'); r(hx - 7, HY - 2, 14, 1, '#a62a24');
    sideHair();
    pf(c, HY - 10, '#1d1713'); pf(c - 1, HY - 10, '#1d1713');
    for (var tq = 0; tq < 4; tq++) pf(c - 2 - tq, HY - 10 + tq, '#1d1713');
    rf(c - 7, HY - 6, 2, 5, '#1d1713'); rf(c - 7, HY - 6, 1, 5, '#3a2a20');
  } else if (hat === 'tophat') {
    var tp = col(o.tophat, '#1a1a22'), tpL = lite(tp, 0.2), tpD = dark(tp, 0.25);
    r(hx - 6, HY - 14, 12, 12, tp); r(hx - 6, HY - 14, 2, 12, tpL); r(hx + 3, HY - 14, 3, 12, tpD);
    r(hx - 6, HY - 14, 12, 1, lite(tp, 0.32));
    r(hx - 6, HY - 6, 12, 2, lite(tp, 0.42)); r(hx + 3, HY - 6, 3, 2, lite(tp, 0.28));
    r(hx - 10, HY - 2, 20, 2, tp); r(hx - 10, HY - 2, 20, 1, tpL); b.del(hx - 10, HY - 1); b.del(hx + 9, HY - 1);
    sideHair();
  } else if (hat === 'fedora') {                    /* fötr şapka: tepesi çukur, bantlı, geniş kenarlı (Yeşilçam kötüsü) */
    var fd = col(o.fedora, '#3a3238'), fdL = lite(fd, 0.2), fdD = dark(fd, 0.28), fbd = col(o.fedoraBand, '#1a1418');
    r(hx - 6, HY - 9, 12, 8, fd); r(hx - 6, HY - 9, 2, 8, fdL); r(hx + 3, HY - 9, 3, 8, fdD);
    r(hx - 5, HY - 10, 10, 1, fdL); b.del(hx - 1, HY - 10); b.del(hx, HY - 10); r(hx - 1, HY - 9, 2, 1, fdD);   /* tepe çukuru */
    r(hx - 6, HY - 4, 12, 2, fbd); r(hx - 6, HY - 4, 12, 1, lite(fbd, 0.18));                                 /* bant */
    r(hx - 11, HY - 2, 22, 2, fd); r(hx - 11, HY - 2, 22, 1, fdL); r(hx + 5, HY - 1, 6, 1, fdD);               /* kenar */
    b.del(hx - 11, HY - 1); r(hx - 12, HY - 3, 2, 1, fd); r(hx + 10, HY - 3, 2, 1, fdD);                     /* kenar uçları kalkık */
    sideHair();
  } else if (hat === 'turban') {
    var tb = col(o.turban, '#e8e2d2'), tbL = lite(tb, 0.25), tbD = dark(tb, 0.22);
    for (var ty = HY - 10; ty <= HY + 1; ty++) {
      var tw = ty === HY - 10 ? 6 : ty === HY - 9 ? 8 : ty === HY + 1 ? 9 : 10;
      for (var tx2 = -tw; tx2 < tw; tx2++) {
        var tcc = tx2 < -tw + 3 ? tbL : tx2 >= tw - 3 ? tbD : tb;
        if (((tx2 + (ty - HY) * 2) % 6 + 6) % 6 === 0) tcc = dark(tcc, 0.14);
        p(hx + tx2, ty, tcc);
      }
    }
    r(hx - 10, HY - 4, 20, 1, dark(tb, 0.24));
    rf(c - 2, HY - 11, 4, 4, '#d9a441'); rf(c - 1, HY - 10, 2, 2, '#3f8a4a'); pf(c - 1, HY - 10, '#7fd08a');
    rf(c, HY - 15, 2, 4, '#f4f0e6'); pf(c + 1, HY - 15, '#d0ccc0');
    sideHair();
  } else if (hat === 'cap') {                         /* kasket */
    var cc2 = col(o.cap, '#14364a'), ccL = lite(cc2, 0.24), ccD = dark(cc2, 0.22);
    sideHair();
    r(hx - 7, HY - 4, 14, 5, cc2); r(hx - 7, HY - 4, 14, 1, ccL); r(hx - 7, HY - 3, 2, 4, lite(cc2, 0.1));
    r(hx - 5, HY - 6, 10, 2, cc2); r(hx - 5, HY - 6, 10, 1, ccL); r(hx + 3, HY - 4, 4, 5, ccD); r(hx + 2, HY - 6, 3, 2, ccD);
    r(hx - 7, HY, 14, 1, dark(cc2, 0.3));
    p(hx - 1, HY - 7, ccD); p(hx, HY - 7, ccD);
    rf(c + 5, HY + 1, 6, 2, dark(cc2, 0.32)); rf(c + 5, HY + 1, 6, 1, dark(cc2, 0.12)); rf(c + 3, HY + 1, 2, 1, dark(cc2, 0.32));   /* siperlik yöne */
  } else if (hat === 'chef') {
    var cw = '#f7f7f2', cwD = '#d8d6cc', cwL = '#ffffff';
    var puff = function (nx, ny) { var s = nx * 0.7 + ny * 0.7; return s < -0.5 ? cwL : s > 0.4 ? cwD : cw; };
    ell(hx - 1, HY - 10, 7, 5, puff); ell(hx, HY - 10, 7, 5, puff); ell(hx - 4, HY - 13, 3, 3, puff); ell(hx + 3, HY - 13, 3, 3, puff);
    r(hx - 7, HY - 5, 14, 5, cw); r(hx - 7, HY - 5, 14, 1, cwL); r(hx + 3, HY - 5, 4, 5, '#e6e4dc'); r(hx - 7, HY - 1, 14, 1, cwD);
    p(hx - 3, HY - 4, '#e4e2da'); p(hx - 3, HY - 3, '#e4e2da'); p(hx + 1, HY - 4, '#e4e2da'); p(hx + 1, HY - 3, '#e4e2da');
    sideHair();
  } else if (hat === 'sun') {
    var su = col(o.sunHat, '#f0ece0'), suL = lite(su, 0.2), suD = dark(su, 0.2), suB = dark(su, 0.4);
    r(hx - 5, HY - 9, 10, 1, suL); r(hx - 6, HY - 8, 12, 6, su); r(hx - 6, HY - 8, 2, 6, suL); r(hx + 3, HY - 8, 3, 6, suD);
    r(hx - 6, HY - 4, 12, 2, '#b3422f'); r(hx + 3, HY - 4, 3, 2, '#8a2f22');
    for (var sy2 = HY - 2; sy2 <= HY + 1; sy2++) {
      var sw2 = sy2 === HY - 2 || sy2 === HY + 1 ? 11 : 13;
      for (var sx2 = -sw2; sx2 < sw2; sx2++) {
        var scc2 = sy2 === HY - 2 ? suL : sy2 === HY + 1 ? suB : (sx2 > 6 ? suD : su);
        if (((sx2 + sy2) & 3) === 0 && sy2 < HY + 1) scc2 = dark(scc2, 0.08);
        p(hx + sx2, sy2, scc2);
      }
    }
    r(hx - 7, HY + 2, 1, 3, hair); r(hx + 6, HY + 2, 1, 3, hrD);
  } else if (hat === 'beanie') {                      /* balıkçı beresi */
    var bn = col(o.beanie, '#8d3423'), bnL = lite(bn, 0.24), bnD = dark(bn, 0.24);
    sideHair();
    r(hx - 4, HY - 7, 8, 1, bnL); r(hx - 6, HY - 6, 12, 1, bn); r(hx - 7, HY - 5, 14, 4, bn);
    r(hx - 7, HY - 5, 2, 4, bnL); r(hx - 4, HY - 6, 3, 1, bnL); r(hx + 3, HY - 6, 3, 5, bnD);
    for (var rb = -7; rb < 7; rb++) { p(hx + rb, HY - 1, (rb & 1) ? dark(bn, 0.32) : dark(bn, 0.16)); p(hx + rb, HY, (rb & 1) ? dark(bn, 0.4) : dark(bn, 0.22)); }
    r(hx - 2, HY - 9, 3, 2, lite(bn, 0.35)); p(hx + 1, HY - 8, bn);
  } else if (hs === 4) {                              /* kel: kubbe + yanlarda saç */
    r(hx - 4, HY - 3, 8, 1, skin); r(hx - 5, HY - 2, 10, 1, skin); r(hx - 6, HY - 1, 12, 1, skin);
    r(hx - 6, HY - 1, 2, 1, skL); r(hx + 3, HY - 2, 2, 2, skS); p(hx + 5, HY - 1, skS); p(hx + 5, HY, skS); p(hx - 6, HY, skL);
    p(hx - 3, HY - 2, lite(skin, 0.45)); p(hx - 2, HY - 2, lite(skin, 0.45));
    r(hx - 7, HY + 2, 2, 5, hair); r(hx + 5, HY + 2, 2, 5, hrD); p(hx - 7, HY + 6, skin);
  } else {
    shortHair();
    if (hs === 5) {                                   /* kıvırcık bulutun ön kenarı */
      r(hx - 7, HY - 3, 14, 4, hair); r(hx - 6, HY + 1, 12, 1, hair);
      for (var q = -7; q < 7; q += 3) { p(hx + q, HY + 2, hair); p(hx + q + 1, HY - 2, hrL); }
      p(hx - 5, HY - 3, hrL); p(hx - 4, HY - 1, hrL);
    } else if (hs === 6) {                            /* topuz */
      var bun = function (nx, ny) { var s = nx * 0.7 + ny * 0.7; return s < -0.45 ? hrL : s > 0.45 ? hrD : hair; };
      ell(hx - 1, HY - 7, 4, 4, bun); ell(hx, HY - 7, 4, 4, bun);
      r(hx - 3, HY - 3, 6, 1, dark(hair, 0.4));
    } else if (hs === 1) {                            /* dalgalı */
      r(hx - 8, HY, 1, 5, hair); r(hx + 7, HY, 1, 5, hrD); p(hx - 8, HY + 5, hair); p(hx + 7, HY + 5, hrD);
      r(hx - 5, HY - 5, 4, 2, hair); r(hx + 1, HY - 5, 4, 2, hair); r(hx - 4, HY - 5, 2, 1, hrL); r(hx + 2, HY - 5, 2, 1, hrL);
      r(hx - 6, HY - 4, 12, 1, hair);
      rf(c + 1, HY + 3, 3, 1, hair);
    } else if (hs === 7) {                            /* mohikan */
      var shv = mix(hair, skin, 0.55);
      r(hx - 7, HY - 1, 4, 6, shv); r(hx + 3, HY - 1, 4, 6, mix(shv, skS, 0.5)); r(hx - 6, HY - 2, 3, 1, shv); r(hx + 3, HY - 2, 3, 1, shv);
      var spike = function (x0, h0) { for (var s1 = 0; s1 < h0; s1++) r(hx + x0, HY - 3 - s1, s1 < h0 - 2 ? 2 : 1, 1, s1 > h0 - 3 ? hrL : hair); };
      spike(-4, 4); spike(-2, 8); spike(0, 10); spike(2, 6);
    } else if (hs === 8) {                            /* kabarık perçem */
      rf(c - 6, HY - 6, 12, 4, hair); rf(c - 4, HY - 8, 10, 2, hair); rf(c + 1, HY - 10, 7, 2, hair);
      rf(c + 6, HY - 8, 3, 5, hair); rf(c + 7, HY - 3, 2, 2, hrD);
      rf(c - 3, HY - 7, 7, 1, hrL); rf(c + 2, HY - 9, 4, 1, hrL); rf(c + 3, HY - 5, 3, 3, hrD);
    } else if (hs === 2) {
      r(hx - 7, HY - 1, 1, 8, hair); r(hx + 6, HY - 1, 1, 8, hrD);
    }
  }
  if ((hat === 'cap' || hat === 'beanie' || hat === 'tophat' || hat === 'sun') && hs === 5) {
    r(hx - 9, HY, 3, 7, hair); r(hx + 6, HY, 3, 7, hrD);
  }
  if (o.headband) {                                   /* saç bandı */
    var hbc = col(o.headband, '#f4f0e6');
    r(hx - 7, HY, 14, 2, hbc); r(hx - 7, HY, 14, 1, lite(hbc, 0.2)); r(hx + 4, HY, 3, 2, dark(hbc, 0.15));
    rf(c - 10, HY + 1, 3, 2, hbc); rf(c - 10, HY + 3, 2, 3, dark(hbc, 0.12));
  }
  if (o.pipe) {                                       /* pipo */
    rf(c + 1, HY + 12, 5, 1, '#5a3a1a'); rf(c + 6, HY + 9, 3, 4, '#6a4424'); rf(c + 6, HY + 9, 3, 1, '#2a1a10');
    rf(c + 6, HY + 10, 1, 3, '#8a5a32'); pf(c + 7, HY + 9, '#e07030');
  }
  if (o.phone) {                                      /* telefon kulakta */
    rf(hand.x + 1, HY + 3, 3, 7, '#1a1a1a'); rf(hand.x + 2, HY + 4, 1, 4, '#7fd3ff');
    handAt(hand.x, hand.y, fx > 0);
  }
  if (o.bird) {                                       /* omuzda kuş */
    var bd = col(o.bird, '#f4f4f0'), bdS = shd(bd);
    ellF(-12 + c, TT - 3, 4, 2, bdS); ellF(-9 + c, TT - 7, 2, 2, bdS);
    rf(-15 + c, TT - 3, 2, 2, dark(bd, 0.3)); rf(-14 + c, TT - 4, 4, 2, dark(bd, 0.22));
    rf(-7 + c, TT - 7, 2, 1, '#f0a030'); pf(-7 + c, TT - 6, '#c07818'); pf(-9 + c, TT - 8, '#141414');
    pf(-12 + c, TT, '#f0a030'); pf(-10 + c, TT, '#f0a030');
  }

  b.outline(0.62);
  builds++;
  return b.toSprite();
}

/* ---------------- kanca: drawPerson ---------------- */
HKA.drawPerson = function (a, o) {
  var H = G();
  if (H.K !== 2) return false;
  init();
  var R = Math.round;
  var sx = R(H.pX(a.x, a.y)), sy = R(H.pY(a.x, a.y, a.z || 0));
  var moving = Math.hypot(a.vx || 0, a.vy || 0) > 0.05 || o.walk;
  var working = (a.act || 0) > 0.05;
  var fx = o.face > 0 ? 1 : -1;
  var t = a.bob || 0;
  var wf = moving ? (Math.floor(t * 0.16 * ANIM.walkFps) & 3) : 0;
  var idle = moving ? 0 : (Math.sin(t * 0.9) > 0.6 ? 1 : 0);
  var bodyOff = moving ? WALK[wf].body : 0;
  gShadow(a.x, a.y, 0.62);
  var carrying = a.carry && a.carry.length;
  var arm = (carrying || o.hold) ? 1 : working ? 2 + (Math.floor((H.t + (a.x + a.y) * 0.37) * ANIM.workFps) & 1) : 0;
  var pose = moving ? (wf === 0 ? 0 : wf === 2 ? 2 : 1) : 3 + idle;
  var m = o.mood, mood = m === undefined ? 0 : m < 0.28 ? 1 : m < 0.55 ? 2 : 3;
  var idx = ((pose * 4 + arm) * 2 + (fx > 0 ? 1 : 0)) * 4 + mood;
  var slots = outfitSlots(o);
  var spr = slots[idx] || (slots[idx] = build(o, pose, arm, fx, mood));
  L.blit(spr, sx, sy + bodyOff);
  if (carrying) gStack(a.x, a.y, a.carry, 16 + bodyOff - idle, 3.4);
  return true;
};

/* =====================================================================
   DUYGU BALONU (24×22 ince piksel)
   ===================================================================== */
function buildEmote(kind) {
  var b = L.buf(), P = PAL, edge = P.edge || '#0a1a27', cr = P.cream || '#ede4cf';
  function r(x, y, w, h, c) { b.rect(x, y, w, h, c); }
  function p(x, y, c) { b.set(x, y, c); }
  /* balon: yuvarlak köşeli krem, koyu kenar, alt-solda kuyruk */
  r(-10, -11, 20, 18, cr); r(-11, -10, 22, 16, cr);
  r(-10, -11, 20, 1, lite(cr, 0.5)); r(-11, -10, 1, 15, lite(cr, 0.4));
  r(-10, 6, 20, 1, dark(cr, 0.14)); r(10, -10, 1, 16, dark(cr, 0.12));
  r(-4, 7, 4, 2, cr); r(-4, 9, 2, 2, cr); p(-4, 11, cr); r(-1, 7, 1, 2, dark(cr, 0.14));
  if (kind === 'love') {
    var hc = P.madder || '#a83d2b', hl = '#e0604a';
    var rows = ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < 9; i++) if (rows[j][i] === '#') p(-5 + i, -8 + j, j < 3 && i < 4 ? hl : (i > 5 && j > 1 ? hc : '#c84a36'));
    p(-4, -7, '#ffd0c0'); p(-3, -7, '#ffb0a0'); p(-4, -6, '#ffb0a0');
  } else if (kind === 'angry') {
    var rd = P.red || '#e5533d', rD = dark(rd, 0.25);
    /* öfke damarı (💢): dört kıvrık köşe */
    var ar = ['##.....##', '.##...##.', '..#...#..', '.........', '..#...#..', '.........', '...###...', '..#...#..', '.#.....#.'];
    for (var aj = 0; aj < 9; aj++) for (var ai = 0; ai < 9; ai++) if (ar[aj][ai] === '#') p(-5 + ai, -8 + aj, aj === 4 ? '#5a1a14' : (ai > 5 ? rD : rd));
  } else if (kind === 'wait') {
    var br = P.brass || '#c9952f', sf = P.saffron || '#d9a441';
    r(-5, -8, 10, 2, br); r(-5, 3, 10, 2, br); r(-5, -8, 10, 1, lite(br, 0.3));
    r(-4, -6, 8, 1, '#cfe6ee'); r(-3, -5, 6, 1, '#cfe6ee'); r(-2, -4, 4, 1, '#cfe6ee'); r(-1, -3, 2, 2, '#cfe6ee');
    r(-2, -1, 4, 1, '#cfe6ee'); r(-3, 0, 6, 1, '#cfe6ee'); r(-4, 1, 8, 2, '#cfe6ee');
    r(-3, -5, 6, 1, sf); r(-2, -4, 4, 1, sf); r(-1, -3, 2, 2, sf); r(-3, 1, 6, 2, sf); r(-1, 0, 2, 1, sf);
    p(-4, -6, '#ffffff'); r(-6, -6, 1, 9, dark(br, 0.2)); r(5, -6, 1, 9, dark(br, 0.2));
  } else if (kind === 'coin') {
    var cb = P.brass || '#c9952f', cl = P.brassLite || '#e6be59';
    b.circ(-1, -2, 6, cb); b.circ(-1, -2, 4, cl); r(-2, -5, 2, 7, cb); p(-3, -5, '#fff2b0'); p(-4, -4, '#fff2b0');
  } else if (kind === 'que') {
    var ic = P.indigo || '#2a4c7d';
    r(-3, -8, 6, 2, ic); r(2, -7, 2, 4, ic); r(-4, -7, 2, 2, ic); r(0, -4, 2, 2, ic); r(-1, -2, 2, 2, ic); r(-1, 2, 2, 2, ic);
    p(-2, -8, lite(ic, 0.4));
  }
  b.outline(0, edge);
  return b.toSprite();
}
HKA.drawEmote = function (x, y, z, kind) {
  var H = G(); if (H.K !== 2) return false;
  init();
  var k = String(kind), s = EMO.get(k);
  if (!s) { s = buildEmote(k); EMO.set(k, s); }
  L.blit(s, Math.round(H.pX(x, y)), Math.round(H.pY(x, y, z)));
  return true;
};

/* =====================================================================
   KEDİ: oturan / yürüyen (2 kare + kuyruk) / uyuyan (zZ)
   ===================================================================== */
function buildCat(cc, d, st, f1, f2) {
  var b = L.buf(), cL = lite(cc, 0.22), cD = dark(cc, 0.26), cD2 = dark(cc, 0.4);
  var eye = L.hx(cc)[0] + L.hx(cc)[1] < 200 ? '#e8d24a' : '#4a8a3a';
  function p(x, y, c) { b.set(d > 0 ? x : -x - 1, y, c); }
  function r(x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) p(x + i, y + j, c); }
  var sh = function (nx, ny) { var s = nx * 0.6 + ny * 0.8; return s < -0.45 ? cL : s > 0.5 ? cD : cc; };
  function el(cx, cy, rx, ry) {
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx + 0.35) + (y * y) / (ry * ry + 0.35) <= 1) p(cx + x, cy + y, sh(x / rx, y / ry));
  }
  if (st === 'sleep') {                               /* kıvrılmış somun */
    r(-12, -5, 6, 2, cD); r(-12, -6, 2, 1, cc);
    el(0, -5, 9, 4);
    el(7, -6, 3, 3); p(5, -9, cc); p(9, -9, cc); p(6, -10, cD); p(9, -10, cD);
    r(6, -6, 2, 1, cD2); r(9, -6, 1, 1, cD2);
    r(-6, -2, 6, 1, cD);
  } else {
    var walk = st === 'walk';
    var bob = walk && f1 ? -1 : 0;
    /* kuyruk */
    var tl = walk && f2 ? -2 : 0;
    r(-11, -16 + tl + bob, 2, 7 - tl, cc); r(-12, -18 + tl + bob, 2, 3, cc); r(-11, -9 + bob, 3, 2, cc); p(-12, -18 + tl + bob, cL);
    if (walk) {
      el(0, -8 + bob, 7, 4);
      var la = f1 ? 1 : -1;
      r(-6 + la, -4, 2, 4, cD); r(-3 - la, -4, 2, 4, cc); r(3 + la, -4, 2, 4, cD); r(5 - la, -4, 2, 4, cc);
      r(-6 + la, -1, 2, 1, cD2); r(5 - la, -1, 2, 1, cD);
      var hy = -13 + bob;
      el(8, hy, 4, 3);
      r(5, hy - 5, 2, 2, cc); p(5, hy - 6, cc); r(10, hy - 5, 2, 2, cD); p(11, hy - 6, cD); p(6, hy - 4, '#e8a0a0'); p(10, hy - 4, '#c88080');
      r(8, hy - 1, 2, 2, eye); p(9, hy, '#141414'); r(11, hy - 1, 1, 2, eye); p(12, hy + 1, '#e8a0a0');
    } else {                                          /* oturan: dik gövde */
      el(-1, -6, 6, 5); el(1, -10, 4, 3);
      r(1, -4, 2, 4, cL); r(4, -3, 2, 3, cc); r(1, -1, 5, 1, cD);
      var hy2 = -16;
      el(3, hy2, 4, 3);
      r(0, hy2 - 5, 2, 2, cc); p(0, hy2 - 6, cc); r(5, hy2 - 5, 2, 2, cD); p(6, hy2 - 6, cD); p(1, hy2 - 4, '#e8a0a0'); p(5, hy2 - 4, '#c88080');
      r(1, hy2 - 1, 2, 2, eye); p(2, hy2, '#141414'); r(5, hy2 - 1, 2, 2, eye); p(6, hy2, '#141414'); p(4, hy2 + 1, '#e8a0a0');
    }
  }
  b.outline(0.55);
  if (st === 'sleep' && f1) {                         /* zZ */
    var z1 = '#f4eedd';
    p(-8, -12, z1); p(-7, -12, z1); p(-7, -11, z1); p(-8, -10, z1); p(-7, -10, z1);
    p(-11, -17, z1); p(-10, -17, z1); p(-9, -17, z1); p(-10, -16, z1); p(-11, -15, z1); p(-10, -15, z1); p(-9, -15, z1);
  }
  /* yumuşak gölge (konturdan sonra, boş yerlere) */
  for (var j = -2; j <= 1; j++) for (var i = -10; i <= 10; i++) {
    if ((i * i) / 100 + (j * j) / 4 > 1) continue;
    if (!b.has(i, j)) b.set(i, j, '#14303c', 0.22);
  }
  return b.toSprite();
}
HKA.drawCat = function (c) {
  var H = G(); if (H.K !== 2) return false;
  var gt = H.t, d = c.dir > 0 ? 1 : -1, st = c.st === 'sleep' ? 'sleep' : c.st === 'walk' ? 'walk' : 'sit';
  var f1 = st === 'walk' ? H.phase2(gt, 6) : st === 'sleep' ? H.phase2(gt, 0.5) : 0;
  var f2 = st === 'walk' ? H.phase2(gt, 3) : 0;
  var cc = col(c.col, '#3b332c');
  var k = cc + d + st + f1 + f2, s = CATS.get(k);
  if (!s) { s = buildCat(cc, d, st, f1, f2); CATS.set(k, s); }
  L.blit(s, Math.round(H.pX(c.x, c.y)), Math.round(H.pY(c.x, c.y, 0)));
  return true;
};

/* avludaki müşterinin alışveriş torbası (mimar ekledi: game.js drawShopBag kancası) — kâğıt torba, sap, kontur */
var BAG = null;
HKA.drawShopBag = function (f) {
  var H = G(); if (H.K !== 2) return false;
  if (!BAG) BAG = L.sprite('kr:bag', function (b) {
    b.rect(0, 0, 6, 7, '#e8dcc0'); b.rect(0, 0, 1, 7, '#f6eedc'); b.rect(4, 0, 2, 7, '#cbbd98');
    b.rect(0, 0, 6, 1, '#a8966f'); b.set(1, -1, '#7a6a48'); b.set(4, -1, '#7a6a48'); b.rect(2, -2, 2, 1, '#7a6a48');
    b.rect(1, 3, 4, 1, '#c2492f'); b.outline(0.55);
  });
  L.blit(BAG, Math.round(H.pX(f.x, f.y)) + f.face * 4 - 1, Math.round(H.pY(f.x, f.y, 0)) - 9);
  return true;
};

/* test / tanı */
HKA.karakterStats = function () { return { outfits: OUT.size, builds: builds, cats: CATS.size, emotes: EMO.size }; };
})();
