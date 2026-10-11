/* Hamsi Koyu kadrosu: serinin sabit karakterleri ve dikey doğal (180×320, ×6 = 1080×1920) hikâye sahneleri.
   scenes.js'ten sonra yüklenir (bölüm dosyasında scripts: ['cast.js']); sahneleri TBS.reg ile kaydeder.
   Karakterler (her bölümde aynı görünür):
     RIZA   — Kaptan Rıza, patron. Soluk kırmızı kasket, krem gömlek, petrol mavisi yelek, sol bilekte saat, cepte defter, kaşta yara izi.
     MEMO   — ilk eleman. Ters turuncu kasket, açık mavi gömlek, balık armalı lacivert önlük, siyah çizme, sağ bilekte yeşil ip bileklik.
     NERMIN — Nermin Teyze, ilk müşteri. Mor çiçekli bej yazma, bordo hırka, lacivert uzun etek, hasır sepet, bozuk para kesesi.
   person(g, x, yAyak, KİŞİ, { dir: -1|0|1, ph: yürüme evresi, expr, hands: { l: [x, y], r: [x, y] }, back, tap })
   expr: neutral · smile · happy · worry · surprise · helpless · frown · blink
   Sahneler (Gün 2 · Bölüm 1 · Tek Başına Olmaz): b1open, b1rush0, b1rush, b1stranger, b1shake, b1together, b1end */
(function () {
  'use strict';
  var B = TBS.lib, spr = B.spr, layer = B.layer, R = B.R, P = B.P, disc = B.disc, line = B.line, rim = B.rim, glow = B.glow, mix = B.mix,
    dgrad = B.dgrad, tiny = B.tiny, tinyW = B.tinyW, sm = B.sm, eio = B.eio, rng = B.rng, gull = B.gull, ridge = B.ridge;

  /* ---------- sabit karakterler ---------- */
  var RIZA = { H: 56, leg: 18, torso: 17, sh: 8, wa: 7, belly: 1, hw: 5, hh: 12, lw: 4, boots: 4, hat: 'cap', top: 'vest', arm: 15,
    stubble: 1, scar: 1, watch: 1, book: 1, sleeve: 'rolled',
    p: { skin: '#c99a68', skinS: '#a8774c', skinHi: '#ddb487', hair: '#1d1713', hairHi: '#3a2e26', stub: '#a07a54', eye: '#2e1c10', lip: '#8a4a3a',
      scar: '#e8b4a0', cap: '#b44d40', capS: '#8c3a31', capHi: '#cc6a5c', shirt: '#e8d7b5', shirtS: '#c9b590', vest: '#24566a', vestS: '#1a4050',
      vestHi: '#2f6c84', pants: '#554333', pantsS: '#43342a', boot: '#4a3222', bootHi: '#6a4a32', belt: '#2a1e16', buckle: '#c8a050',
      watch: '#c8ccd0', book: '#efe4c8', bookS: '#8a6a4a' } };
  var MEMO = { H: 54, leg: 19, torso: 15, sh: 7, wa: 5, hw: 5, hh: 12, lw: 3, boots: 7, hat: 'rcap', top: 'apron', arm: 14, curly: 1, freck: 1,
    band: 1, sleeve: 'rolled',
    p: { skin: '#dcae80', skinS: '#bb8c60', skinHi: '#ecc79c', hair: '#7a4a2a', hairHi: '#a0663a', eye: '#5a4a1e', lip: '#a05a48', freck: '#a8724a',
      cap: '#e69a42', capS: '#b8742c', capHi: '#f4b864', shirt: '#78b7cb', shirtS: '#5a96aa', apron: '#293f59', apronS: '#1e2e42', emb: '#e8eef2',
      embO: '#e69a42', pants: '#50565d', pantsS: '#40454b', boot: '#16181c', bootHi: '#30343a', band: '#4aa04a', bag: '#7a5a3a', bagS: '#5a4028' } };
  var NERMIN = { H: 46, leg: 15, torso: 14, sh: 7, wa: 8, hw: 5, hh: 11, lw: 3, boots: 2, hat: 'scarf', top: 'cardigan', arm: 13, skirt: 1,
    round: 1, sleeve: 'full',
    p: { skin: '#d2a47a', skinS: '#b0805a', skinHi: '#e4bc94', hair: '#6e6e74', hairW: '#dcdce0', eye: '#3a2414', lip: '#a0504a',
      scarf: '#cdb88e', scarfS: '#a8946c', flower: '#7a4a9a', flowerHi: '#c08ad8', top: '#873f53', topS: '#6a3040', topHi: '#a2566a', btn: '#ead6ae',
      skirt: '#26304a', skirtS: '#1c2438', boot: '#141418', bootHi: '#2a2a30', basket: '#b48a4a', basketS: '#8a6432', purse: '#7a2a3a' } };
  /* kalabalık: tohumlu rastgele müşteriler (aynı tohum = aynı kişi) */
  var NPC_C = ['#3a5a7a', '#7a3a3a', '#4a6a3a', '#6a5a7a', '#8a6a3a', '#3a4a5a', '#5a3a4a', '#2f6a6a', '#9a5a3a'];
  var NPC_H = ['#1d1713', '#3d2a1a', '#6b3f22', '#9a9a96', '#2a2420'];
  var NPC_S = ['#e0b48a', '#c99a68', '#b07a50', '#e8c098', '#9a6a44'];
  var NPCS = {};
  function npc(seed) {
    if (NPCS[seed]) return NPCS[seed];
    var r = rng(seed * 7919 + 13), c = NPC_C[Math.floor(r() * NPC_C.length)], fem = r() < 0.45, s = NPC_S[Math.floor(r() * NPC_S.length)];
    var o = { H: fem ? 47 + Math.floor(r() * 4) : 50 + Math.floor(r() * 5), leg: 0, torso: 0, sh: fem ? 6 : 7, wa: fem ? 6 : 6, hw: 5, hh: 11, lw: 3, boots: 2,
      hat: fem ? (r() < 0.6 ? 'scarf' : null) : (r() < 0.5 ? 'cap' : r() < 0.5 ? 'beanie' : null), top: 'shirt', skirt: fem && r() < 0.7 ? 1 : 0, arm: 13, sleeve: 'full',
      round: fem ? 1 : 0, mood: r(),
      p: { skin: s, skinS: mix(s, '#5a3020', 0.25), skinHi: mix(s, '#ffffff', 0.15), hair: NPC_H[Math.floor(r() * NPC_H.length)], hairW: '#c8c8cc',
        eye: '#2a1a10', lip: mix(s, '#7a2a2a', 0.4), top: c, topS: mix(c, '#000000', 0.25), topHi: mix(c, '#ffffff', 0.2),
        pants: ['#3a3a44', '#4a4038', '#2a3448'][Math.floor(r() * 3)], pantsS: '#24242c', skirt: ['#3a3048', '#2a3a48', '#4a3a2a'][Math.floor(r() * 3)], skirtS: '#20202a',
        boot: '#1a1614', bootHi: '#2e2824', cap: ['#2a4a6a', '#5a4a3a', '#3a3a3a', '#6a2a2a'][Math.floor(r() * 4)], capS: '#1a1a20', capHi: '#7a7a80',
        scarf: ['#c8b8d8', '#e0c8a0', '#a8c8b8', '#d8a8a8'][Math.floor(r() * 4)], scarfS: '#8a7a8a', flower: '#ffffff', flowerHi: '#ffffff' } };
    o.p.scarfS = mix(o.p.scarf, '#000000', 0.2); o.p.flower = mix(o.p.scarf, '#5a3a6a', 0.45); o.p.flowerHi = o.p.flower;
    o.leg = Math.round(o.H * 0.33); o.torso = Math.round(o.H * 0.29);
    NPCS[seed] = o; return o;
  }

  function thick(g, x0, y0, x1, y1, w, c) {
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), h = Math.floor(w / 2);
    for (var i = 0; i <= n; i++) R(g, x0 + (x1 - x0) * i / n - h, y0 + (y1 - y0) * i / n - h, w, w, c);
  }
  /* kol: omuzdan ele iki parçalı (dirsek doğal bükülür) */
  function arm(g, sx, sy, hx, hy, A, up, lo, skin, acc, accC) {
    var dx = hx - sx, dy = hy - sy, d = Math.sqrt(dx * dx + dy * dy) || 1, b = Math.sqrt(Math.max(0, A * A / 4 - d * d / 4));
    var mx = (sx + hx) / 2, my = (sy + hy) / 2, px2 = -dy / d, py2 = dx / d;
    var e1 = [mx + px2 * b, my + py2 * b], e2 = [mx - px2 * b, my - py2 * b];
    var out = Math.abs(dx) < 3 ? (Math.abs(e1[0] - sx) > Math.abs(e2[0] - sx) ? e1 : e2) : (e1[1] > e2[1] ? e1 : e2);
    if (Math.abs(dx) < 3) out = (sx - (sx + hx) / 2) * (e1[0] - mx) >= 0 ? e1 : e2;
    thick(g, sx, sy, out[0], out[1], 3, up);
    thick(g, out[0], out[1], hx, hy, 2, lo);
    if (acc) { var k = 0.78; R(g, out[0] + (hx - out[0]) * k - 1, out[1] + (hy - out[1]) * k, 3, 1, accC); }
    R(g, hx - 1, hy - 1, 3, 3, skin);
  }

  function person(g, x, yb, S, o) {
    o = o || {}; x = Math.round(x); yb = Math.round(yb);
    var p = S.p, d = o.dir || 0, back = !!o.back, i, j, r, hw;
    var walk = o.ph != null, bob = walk && Math.abs(Math.cos(o.ph)) > 0.75 ? -1 : 0;
    var liftL = walk ? Math.round(Math.max(0, Math.sin(o.ph)) * 2) : Math.round((o.tap || 0) * 2), liftR = walk ? Math.round(Math.max(0, -Math.sin(o.ph)) * 2) : 0;
    var hip = yb - S.leg + bob, yt = hip - S.torso, top = S.top === 'vest' ? p.vest : S.top === 'apron' ? p.shirt : p.top;
    var topS = S.top === 'vest' ? p.vestS : S.top === 'apron' ? p.shirtS : p.topS;
    /* bacaklar / etek */
    if (S.skirt) {
      for (j = hip; j < yb - 2; j++) { var f = (j - hip) / (yb - hip); hw = Math.round(S.wa - 1 + f * 2.5); R(g, x - hw, j, hw * 2 + 1, 1, p.skirt); P(g, x - hw, j, p.skirtS); if (j > hip + 2) { P(g, x - 2, j, p.skirtS); P(g, x + 3, j, p.skirtS); } }
      R(g, x - 4, yb - 2 - liftL, 4, 2, p.boot); R(g, x + 1, yb - 2 - liftR, 4, 2, p.boot);
    } else {
      [[-1, liftL], [1, liftR]].forEach(function (L) {
        var lx = L[0] < 0 ? x - S.lw : x + 1, fy = yb - L[1];
        R(g, lx, hip, S.lw, fy - hip, p.pants); R(g, L[0] < 0 ? lx + S.lw - 1 : lx, hip + 1, 1, fy - hip - 1 - S.boots, p.pantsS);
        R(g, lx, fy - S.boots, S.lw, S.boots, p.boot); R(g, lx, fy - S.boots, S.lw, 1, p.bootHi);
        R(g, L[0] < 0 ? lx - 1 : lx, fy - 2, S.lw + 1, 2, p.boot);
      });
    }
    /* gövde */
    for (r = 0; r < S.torso; r++) {
      var yy = yt + r; hw = r === 0 ? S.sh - 1 : Math.round(S.sh + (S.wa - S.sh) * r / (S.torso - 1)) + (S.belly && r >= S.torso - 7 && r < S.torso - 1 ? 1 : 0);
      R(g, x - hw, yy, hw * 2 + 1, 1, top); P(g, x - hw, yy, topS);
      if (S.top === 'vest' && !back) {
        var op = r < 3 ? 2 : 1; R(g, x - op, yy, op * 2 + 1, 1, p.shirt); if (r >= 3) { P(g, x - 2, yy, p.vestHi); P(g, x + 2, yy, p.vestS); }
        if (r < 3) { P(g, x - 3, yy, p.shirtS); P(g, x + 3, yy, p.shirtS); }
      }
      if (S.top === 'vest' && back && r < 2) R(g, x - 2, yy, 5, 1, p.shirt);
      if (S.top === 'cardigan' && !back) { if (r < 3) R(g, x - 2 + r, yy, 5 - r * 2, 1, p.btn); P(g, x, yy, p.topS); if (r > 3 && r % 3 === 1) P(g, x + 1, yy, p.btn); }
      if (S.top === 'shirt' && !back && r < 2) R(g, x - 1, yy, 3, 1, p.skinS);
    }
    if (S.top === 'vest') { R(g, x - S.wa, hip - 1, S.wa * 2 + 1, 1, p.belt); if (!back) R(g, x, hip - 1, 2, 1, p.buckle); }
    if (S.book && !back) { R(g, x - 6, yt + 5, 3, 4, p.book); R(g, x - 6, yt + 5, 3, 1, p.bookS); }
    if (S.top === 'apron' && !back) {                                                              /* önlük: göğüsten dize */
      for (j = yt + 3; j < yb - 9 + bob; j++) { var aw = j < hip ? 4 : 5; R(g, x - aw, j, aw * 2 + 1, 1, p.apron); P(g, x - aw, j, p.apronS); }
      line(g, x - 4, yt + 3, x - 2, yt, p.apron); line(g, x + 4, yt + 3, x + 2, yt, p.apron);
      R(g, x - 4, hip - 1, 9, 1, p.apronS);
      R(g, x - 2, yt + 6, 4, 2, p.emb); P(g, x + 2, yt + 5, p.emb); P(g, x + 2, yt + 8, p.emb); P(g, x - 1, yt + 6, p.apron); P(g, x - 3, yt + 7, p.embO);   /* balık arması */
    }
    if (S.top === 'apron' && back) { R(g, x - 4, hip - 1, 9, 1, p.apron); P(g, x, hip - 2, p.apron); P(g, x, hip, p.apron); }
    /* boyun */
    R(g, x - 1, yt - 2, 3, 2, p.skinS);
    /* baş */
    var hy0 = yt - 2 - S.hh, HW = S.hw;
    function hrow(j) {
      if (S.round) { var m = (S.hh - 1) / 2; return Math.round((HW + 0.4) * Math.sqrt(Math.max(0, 1 - Math.pow((j - m) / (m + 1.1), 2)))); }
      return HW - (j === 0 ? 2 : j === 1 ? 1 : j === S.hh - 1 ? 2 : j === S.hh - 2 ? 1 : 0);
    }
    if (S.hat === 'scarf') {                                                                        /* yazma: başı ve yanakları sarar */
      for (j = -2; j <= S.hh; j++) { var sw = j < 0 ? HW - 1 + j * 0 : j > S.hh - 3 ? HW + 1 - (j - S.hh + 3) : HW + 2; if (j === -2) sw = HW - 1; R(g, x - sw, hy0 + j, sw * 2 + 1, 1, p.scarf); P(g, x - sw, hy0 + j, p.scarfS); }
      var fr = rng(S.H * 31 + 7);
      for (i = 0; i < 7; i++) { var fx2 = x + [-6, -4, 5, 3, -1, 6, -6][i], fy2 = hy0 + [0, 4, 1, -1, -1, 6, 8][i]; P(g, fx2, fy2, p.flowerHi); P(g, fx2 - 1, fy2, p.flower); P(g, fx2 + 1, fy2, p.flower); P(g, fx2, fy2 - 1, p.flower); P(g, fx2, fy2 + 1, p.flower); }
    }
    for (j = 0; j < S.hh; j++) {
      hw = hrow(j); if (S.hat === 'scarf') hw = Math.min(hw, HW - 1);
      if (S.hat === 'scarf' && j < 2) continue;
      R(g, x - hw, hy0 + j, hw * 2 + 1, 1, back ? p.hair : p.skin);
      if (!back) { P(g, x - hw, hy0 + j, p.skinS); P(g, x + hw, hy0 + j, p.skinHi); }
    }
    var ey = hy0 + Math.round(S.hh * 0.5), fx = d, mr = ey + 4;
    if (back) { R(g, x - 2, hy0 + S.hh - 2, 5, 2, p.skinS); P(g, x - HW - 1, ey, p.skinS); P(g, x + HW + 1, ey, p.skinS); }
    else {
      if (S.hat !== 'scarf') { P(g, x - HW - 1, ey, p.skinS); P(g, x + HW + 1, ey, p.skinS); P(g, x - HW - 1, ey + 1, p.skinS); P(g, x + HW + 1, ey + 1, p.skinS); }
      /* saç */
      if (S.hat === 'scarf') { for (i = -3; i <= 3; i++) P(g, x + i, hy0 + 2, (i + 9) % 2 ? p.hair : p.hairW); }
      else if (S.curly) { for (i = -HW; i <= HW; i++) P(g, x + i, hy0 + 2, (i + 9) % 2 ? p.hair : p.hairHi); for (j = 2; j < ey - hy0; j++) { P(g, x - HW - 1, hy0 + j, (j % 2) ? p.hair : p.hairHi); P(g, x + HW + 1, hy0 + j, (j % 2) ? p.hairHi : p.hair); P(g, x - HW, hy0 + j, p.hair); P(g, x + HW, hy0 + j, p.hair); } }
      else { for (j = 1; j < ey - hy0; j++) { P(g, x - HW, hy0 + j, p.hair); P(g, x + HW, hy0 + j, p.hair); } P(g, x - HW - 1, hy0 + 3, p.hair); P(g, x + HW + 1, hy0 + 2, p.hair); if (!S.hat) for (i = -HW; i <= HW; i++) { P(g, x + i, hy0, p.hair); P(g, x + i, hy0 + 1, p.hair); if (i % 3) P(g, x + i, hy0 + 2, p.hair); } }
      /* yüz */
      var e = o.expr || 'neutral', lx = x - 3 + fx, rx = x + 2 + fx, by = ey - 2, br = S.stubble || S.H > 52 ? p.hair : mix(p.skin, '#3a2010', 0.5);
      var bL = [[lx - 1, by], [lx, by]], bR = [[rx, by], [rx + 1, by]];
      if (e === 'worry' || e === 'helpless') { bL[1][1] = by - 1; bR[0][1] = by - 1; }
      if (e === 'frown') { bL[0][1] = by - 1; bR[1][1] = by - 1; }
      if (e === 'surprise') { bL.forEach(function (q) { q[1]--; }); bR.forEach(function (q) { q[1]--; }); }
      if (S.hat !== 'scarf' || true) { bL.forEach(function (q) { P(g, q[0], q[1], br); }); bR.forEach(function (q, k) { P(g, q[0], q[1], S.scar && k === 1 ? p.scar : br); }); }
      if (e === 'happy') { [lx, rx].forEach(function (q) { P(g, q - 1, ey, p.eye); P(g, q, ey - 1, p.eye); P(g, q + 1, ey, p.eye); }); }
      else if (e === 'blink') { R(g, lx - 1, ey, 2, 1, p.skinS); R(g, rx, ey, 2, 1, p.skinS); }
      else if (e === 'surprise') { R(g, lx, ey - 1, 1, 2, p.eye); R(g, rx, ey - 1, 1, 2, p.eye); }
      else if (e === 'helpless') { R(g, lx - 1, ey, 2, 1, p.eye); R(g, rx, ey, 2, 1, p.eye); }
      else { P(g, lx, ey, p.eye); P(g, rx, ey, p.eye); }
      if (e === 'neutral' || e === 'worry' || e === 'surprise' || e === 'frown') { P(g, lx - 1 + (d < 0 ? 2 : 0), ey, '#f4eee4'); P(g, rx + 1 - (d > 0 ? 2 : 0), ey, '#f4eee4'); }
      P(g, x + fx + (d > 0 ? 1 : d < 0 ? -1 : 0), ey + 2, p.skinS);
      if (S.freck) { P(g, x - 4 + fx, ey + 2, p.freck); P(g, x - 3 + fx, ey + 3, p.freck); }
      if (S.stubble) { for (j = mr + 1; j < hy0 + S.hh; j++) for (i = -HW + 1; i <= HW - 1; i++) if ((i + j) % 2 === 0) P(g, x + i, j, p.stub); for (j = ey + 2; j <= mr; j++) { P(g, x - HW + 1, j, p.stub); P(g, x + HW - 1, j, p.stub); } }
      var m = x + fx;
      if (e === 'smile') { P(g, m - 2, mr - 1, p.lip); R(g, m - 1, mr, 3, 1, p.lip); P(g, m + 2, mr - 1, p.lip); }
      else if (e === 'happy') { R(g, m - 2, mr - 1, 5, 1, p.lip); R(g, m - 1, mr, 3, 1, '#5a2020'); }
      else if (e === 'surprise') { R(g, m, mr - 1, 2, 2, '#3a1414'); }
      else if (e === 'frown' || e === 'helpless') { R(g, m - 1, mr, 3, 1, p.lip); P(g, m - 2, mr + 1, p.lip); P(g, m + 2, mr + 1, p.lip); }
      else if (e === 'worry') { P(g, m - 1, mr + 1, p.lip); R(g, m, mr, 2, 1, p.lip); P(g, m + 2, mr + 1, p.lip); }
      else R(g, m - 1, mr, 3, 1, p.lip);
    }
    /* başlık */
    if (S.hat === 'cap' || S.hat === 'rcap' || S.hat === 'beanie') {
      var cw = [3, 5, 6, 6, 6];
      for (j = 0; j < 5; j++) R(g, x - cw[j], hy0 - 3 + j, cw[j] * 2 + 1, 1, p.cap);
      R(g, x - 6, hy0 + 1, 13, 1, p.capS); P(g, x, hy0 - 4, p.capS); P(g, x - 2, hy0 - 2, p.capHi); P(g, x + 3, hy0 - 1, p.capHi); P(g, x - 5, hy0, p.capHi);
      P(g, x - 6, hy0 - 1, p.capS); P(g, x - 6, hy0, p.capS);
      if (S.hat === 'cap' && !back) { if (d === 0) { R(g, x - 6, hy0 + 2, 13, 1, p.capS); R(g, x - 5, hy0 + 3, 11, 1, p.skinS); } else R(g, x + (d > 0 ? -2 : -7), hy0 + 2, 10, 1, p.capS); }
      if (S.hat === 'cap' && back) { R(g, x - 1, hy0 - 1, 3, 2, p.hair); R(g, x - 2, hy0 + 1, 5, 1, p.capS); }
      if (S.hat === 'rcap' && !back) { R(g, x - 1, hy0 - 1, 3, 2, p.hair); P(g, x, hy0 - 1, p.hairHi); R(g, x - 2, hy0 + 1, 5, 1, p.capS); if (d) R(g, x + (d > 0 ? -10 : 3), hy0 + 1, 8, 1, p.capS); }
      if (S.hat === 'rcap' && back) R(g, x - 6, hy0 + 2, 13, 1, p.capS);
    }
    if (S.hat === 'scarf') { R(g, x - 1, hy0 + S.hh, 3, 2, p.scarfS); P(g, x - 2, hy0 + S.hh + 2, p.scarf); P(g, x + 2, hy0 + S.hh + 2, p.scarf); }
    /* kollar */
    var sy = yt + 2, sL = [x - S.sh, sy], sR = [x + S.sh, sy], H = o.hands || {};
    var hL = H.l || [x - S.sh - 1, sy + S.arm - 1 + (walk ? Math.round(Math.sin(o.ph)) : 0)], hR = H.r || [x + S.sh + 1, sy + S.arm - 1 - (walk ? Math.round(Math.sin(o.ph)) : 0)];
    var upC = S.top === 'vest' ? p.shirt : S.top === 'apron' ? p.shirt : p.top, loC = S.sleeve === 'rolled' ? p.skin : (S.top === 'vest' || S.top === 'apron' ? p.shirtS : p.topS);
    var lAcc = back ? S.watch : S.band, rAcc = back ? S.band : S.watch, lC = back ? p.watch : p.band, rC = back ? p.band : p.watch;
    var order = o.armFront === 'l' ? [1, 0] : [0, 1];
    order.forEach(function (k) {
      if (k === 0) arm(g, sL[0], sL[1], hL[0], hL[1], S.arm, upC, loC, p.skin, lAcc, lC);
      else arm(g, sR[0], sR[1], hR[0], hR[1], S.arm, upC, loC, p.skin, rAcc, rC);
    });
    return { head: [x, hy0], hands: { l: hL, r: hR }, yt: yt, hip: hip, cap: [x, hy0 - 4] };
  }

  /* ---------- eşyalar ---------- */
  function fish(g, x, y, a, c) {   /* hamsi: x,y merkez, a açı (radyan) */
    var ca = Math.cos(a), sa = Math.sin(a);
    for (var i = -3; i <= 3; i++) { P(g, x + ca * i, y + sa * i, i < 2 ? (c || '#b8cad8') : '#8a9cb0'); if (i > -3 && i < 2) P(g, x + ca * i - sa, y + sa * i + ca, '#4a6a8a'); }
    P(g, x + ca * 4 - sa, y + sa * 4 + ca, '#8a9cb0'); P(g, x + ca * 4 + sa, y + sa * 4 - ca, '#8a9cb0'); P(g, x - ca * 2, y - sa * 2, '#1a2030');
  }
  function crate(g, x, y, full, tilt) {   /* balık kasası: x,y sol üst, 16×8 */
    R(g, x, y, 16, 8, '#c08a52'); R(g, x, y, 16, 1, '#dcae74'); R(g, x, y + 4, 16, 1, '#9a6a3a'); R(g, x, y + 7, 16, 1, '#7a4e2a');
    R(g, x, y, 1, 8, '#9a6a3a'); R(g, x + 15, y, 1, 8, '#9a6a3a');
    if (full) for (var i = 0; i < 6; i++) { R(g, x + 1 + i * 2.4, y - 1 - (i % 2), 3, 1, '#c8d8e4'); P(g, x + 2 + i * 2.4, y - 2 + (i % 2), '#9ab0c4'); }
  }
  var BF = null;
  function bigFish(g, x, y, a) {   /* yakın plan hamsi (havada, kasketin üstünde) */
    if (!BF) { BF = layer(16, 6); spr(BF.g, 0, 0, ['..kkkkkkkkk...kk', '.kbbbbbbbbbk.kbk', 'kebbbbbbbbbbkbbk', 'kwwwwwwwwwwwkwwk', '.kwwwwwwwwwk.kwk', '..kkkkkkkkk...kk'],
      { k: '#1a2030', b: '#5a7a9a', w: '#d8e6ee', e: '#0a0a10' }); }
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(a); g.drawImage(BF.c, -8, -3); g.restore();
  }
  function coin(g, x, y) { R(g, x - 1, y - 1, 2, 2, '#e8c050'); P(g, x - 1, y - 1, '#fff0a0'); }
  function basket(g, x, y, full) {   /* hasır sepet: x,y sap ortası */
    line(g, x - 4, y + 3, x - 3, y, '#8a6432'); line(g, x + 4, y + 3, x + 3, y, '#8a6432'); R(g, x - 2, y - 1, 5, 1, '#8a6432');
    for (var j = 0; j < 6; j++) { R(g, x - 5 + (j > 4 ? 1 : 0), y + 3 + j, 11 - (j > 4 ? 2 : 0), 1, j % 2 ? '#a07a40' : '#c09a5a'); for (var i = -4; i <= 4; i += 2) P(g, x + i + (j % 2), y + 3 + j, '#8a6432'); }
    if (full) { P(g, x - 3, y + 1, '#b8cad8'); P(g, x - 2, y + 2, '#b8cad8'); P(g, x + 2, y + 1, '#8a9cb0'); P(g, x + 3, y + 2, '#b8cad8'); R(g, x - 1, y + 2, 3, 1, '#e8eef2'); }
  }
  function purse(g, x, y) { R(g, x - 1, y, 4, 3, '#7a2a3a'); R(g, x - 1, y - 1, 4, 1, '#c8a050'); P(g, x, y + 1, '#9a4a5a'); }
  function bag(g, x, y) { R(g, x - 4, y, 9, 8, '#7a5a3a'); R(g, x - 4, y, 9, 1, '#9a7a52'); R(g, x - 3, y - 2, 7, 2, '#5a4028'); P(g, x - 2, y + 3, '#5a4028'); P(g, x + 2, y + 5, '#5a4028'); }
  function wrap(g, x, y) { R(g, x - 2, y - 3, 5, 6, '#efe6d0'); P(g, x - 2, y - 3, '#d8ccb0'); P(g, x + 2, y + 2, '#d8ccb0'); P(g, x, y - 4, '#8a9cb0'); }
  function star(g, x, y, s, c) { for (var i = -s; i <= s; i++) { P(g, x + i, y, c); P(g, x, y + i, c); if (Math.abs(i) < s * 0.6) { P(g, x + i, y + i, c); P(g, x + i, y - i, c); } } }
  function sweat(g, x, y) { P(g, x, y, '#bfe4ff'); R(g, x - 1, y + 1, 3, 2, '#bfe4ff'); P(g, x, y + 3, '#8ac0e8'); }

  /* ---------- liman dünyası (önden: tezgâh ortada, deniz ve güneş arkada) ---------- */
  var WW = 400, WH = 470, HZ = 170, GR = 272;            /* dünya, ufuk, tezgâh zemini */
  var SUN = [266, 163], ST = { x0: 226, x1: 306, cx: 266 };
  var Q = [[316, 288], [338, 300], [322, 318], [344, 334], [326, 352], [346, 370], [328, 390], [350, 410], [334, 430], [352, 452]];
  var HB = null;
  function harborStatic() {
    var bg = layer(WW, WH), g = bg.g, x, y, i;
    dgrad(bg, 0, 0, WW, HZ, ['#2c2150', '#5a2c64', '#a4466a', '#e06e5c', '#f7a25a', '#fdd68a']);
    var cl = rng(5);
    for (i = 0; i < 9; i++) { var cx = cl() * WW, cy = 40 + cl() * 100, w = 20 + cl() * 50; R(g, cx, cy, w, 2, cy < 90 ? '#c8607a' : '#f5b880'); R(g, cx + 6, cy - 1, w * 0.5, 1, cy < 90 ? '#d87a8a' : '#fcd0a0'); }
    /* uzak tepeler ve kasaba (sağda) */
    var rh = ridge(9, WW, 6, 2.0);
    for (x = 0; x < WW; x++) { var hh = x > 300 ? 18 + (x - 300) * 0.25 + rh[x] : x < 60 ? 10 + rh[x] * 0.6 : 0; if (hh > 0) R(g, x, HZ - hh, 1, hh, x > 300 ? '#5a3a5c' : '#6a4060'); }
    for (i = 0; i < 9; i++) { var hx = 318 + i * 9, hy = HZ - 14 - (i % 3) * 5 - (i > 4 ? 6 : 0); R(g, hx, hy, 7, 6, '#e8c0a0'); R(g, hx - 1, hy - 2, 9, 2, '#a84a3a'); P(g, hx + 2, hy + 2, '#ffd27a'); }
    /* güneş (ufkun üstünde yarım) */
    for (y = -13; y <= 0; y++) { var w2 = Math.round(Math.sqrt(169 - y * y)); R(g, SUN[0] - w2, SUN[1] + y + 6, w2 * 2 + 1, 1, y > -4 ? '#fff4d0' : '#ffe2a0'); }
    glow(g, SUN[0], HZ - 4, 90, 'rgba(255,190,110,A)', 0.55); glow(g, SUN[0], HZ - 4, 40, 'rgba(255,236,190,A)', 0.6);
    /* deniz */
    for (y = HZ; y < WH; y++) R(g, 0, y, WW, 1, mix(mix('#f0a070', '#5a3a6a', Math.min(1, (y - HZ) / 60)), '#1a2244', Math.max(0, (y - HZ - 60) / 240)));
    R(g, 0, HZ, WW, 1, '#ffd6a0');
    /* iskele ve tezgâh (ön katman) */
    var fg = layer(WW, WH), h = fg.g;
    R(h, 196, 236, WW - 196, WH - 236, '#8e6040');
    for (y = 236; y < WH; y += 6) { R(h, 196, y, WW - 196, 1, '#6e4630'); for (x = 196 + ((y / 6) % 3) * 14; x < WW; x += 42) R(h, x, y + 1, 1, 5, '#74492f'); }
    R(h, 196, 236, WW - 196, 1, '#c08a5c');
    for (y = 238; y < WH; y += 30) { R(h, 192, y, 5, 26, '#4a2e1e'); R(h, 192, y, 5, 1, '#6a4a32'); }
    R(h, 196, 236, 2, WH - 236, '#5a3a24');
    /* liman yolu (altta): kaldırım taşı */
    R(h, 196, 420, WW - 196, 3, '#5a5060'); for (y = 423; y < WH; y++) R(h, 196, y, WW - 196, 1, (y % 6) === 0 ? '#4a4252' : '#6a6070');
    for (y = 426; y < WH; y += 6) for (x = 198 + ((y / 6) % 2) * 5; x < WW; x += 10) R(h, x, y, 1, 5, '#4a4252');
    R(h, 378, 360, 2, 64, '#2a2a30'); R(h, 374, 352, 10, 8, '#2a2a30'); R(h, 376, 354, 6, 4, '#ffd27a');            /* fener */
    R(h, 206, 300, 6, 8, '#3a2a20'); R(h, 205, 300, 8, 2, '#5a4030'); R(h, 206, 380, 6, 8, '#3a2a20'); R(h, 205, 380, 8, 2, '#5a4030');   /* babalar */
    for (i = 0; i < 4; i++) disc(h, 220 + i, 404 - i, 4 - i, i % 2 ? '#c8a878' : '#a88858');                      /* halat */
    /* tezgâh iskeleti: direkler, tente, levha */
    R(h, 228, 196, 3, GR - 196, '#5a3a22'); R(h, 301, 196, 3, GR - 196, '#5a3a22'); R(h, 229, 196, 1, GR - 196, '#7a5232'); R(h, 302, 196, 1, GR - 196, '#7a5232');
    for (x = 224; x < 308; x++) { var k = Math.floor((x - 224) / 7) % 2; R(h, x, 188, 1, 10, k ? '#f0e2cc' : '#c8463c'); if ((x - 224) % 7 > 1 && (x - 224) % 7 < 6) P(h, x, 198, k ? '#f0e2cc' : '#c8463c'); }
    R(h, 224, 188, 84, 1, '#8a2a24'); R(h, 224, 197, 84, 1, '#a8382f');
    R(h, ST.x0, 171, 80, 16, '#3a2414'); R(h, ST.x0 + 1, 172, 78, 14, '#7a4e2c'); R(h, ST.x0 + 1, 172, 78, 1, '#a87444'); R(h, ST.x0 + 1, 185, 78, 1, '#5a3a20');
    var sgn = "RIZA'NIN BALIKLARI", sw2 = tinyW(sgn);
    tiny(h, ST.cx - Math.floor(sw2 / 2), 176, sgn, '#3a2010'); tiny(h, ST.cx - Math.floor(sw2 / 2), 175, sgn, '#f6e2b0');
    R(h, 236, 167, 1, 5, '#2a1a10'); R(h, 296, 167, 1, 5, '#2a1a10');
    HB = { bg: bg, fg: fg };
  }
  /* sayaç (tezgâh önü): Rıza'nın arkasında çizildikten sonra */
  function counter(g, o, t) {
    o = o || {};
    R(g, 230, 250, 72, 4, '#b07a4a'); R(g, 230, 250, 72, 1, '#d09a62');
    R(g, 230, 254, 72, GR - 254, '#7a4c2c'); for (var x = 236; x < 300; x += 9) R(g, x, 255, 1, GR - 255, '#5e3a20'); R(g, 230, GR - 1, 72, 1, '#4a2c18');
    R(g, 233, 258, 66, 3, '#5e3a20'); tiny(g, 0, 0, '', '#000');
    /* sergi: buz üstünde hamsi */
    R(g, 233, 245, 38, 5, '#e8f2f6'); R(g, 233, 245, 38, 1, '#ffffff');
    var n = o.empty ? 4 : 13;
    for (var i = 0; i < n; i++) { var fx = 236 + (i % 7) * 5, fy = 246 + Math.floor(i / 7) * 2; R(g, fx, fy, 4, 1, '#a8bccc'); P(g, fx, fy, '#4a6a8a'); if (t != null && Math.sin(t * 3 + i) > 0.92) P(g, fx + 1, fy, '#ffffff'); }
    if (o.tarp > 0) { var tw = Math.round(40 * o.tarp); R(g, 232, 242, tw, 8, '#8a8670'); R(g, 232, 242, tw, 1, '#a8a48c'); for (var k = 0; k < tw; k += 6) P(g, 232 + k, 245, '#6a6654'); }
    /* terazi */
    if (!o.noScale) {
      var nd = o.needle || 0;
      R(g, 274, 247, 12, 3, '#3a3a44'); R(g, 278, 240, 4, 7, '#4a4a54'); R(g, 276, 236, 8, 5, '#f0ece0'); R(g, 276, 236, 8, 1, '#ffffff');
      line(g, 280, 240, 280 + Math.round(Math.sin(nd) * 3), 240 - Math.round(Math.cos(nd) * 3), '#c83a2a');
      R(g, 273, 234, 14, 2, '#c8ccd0'); if (o.pan) fish(g, 280, 232, 0.1);
    }
    /* para kutusu */
    if (!o.noBox) { R(g, 289, 244, 11, 6, '#6a4228'); R(g, 289, 244, 11, 1, '#8a5a36'); R(g, 290, 245, 9, 2, '#3a2416'); for (var c = 0; c < (o.coins || 2); c++) P(g, 291 + (c * 3) % 8, 245 + (c % 2), '#e8c050'); }
  }
  function harborDyn(g, t) {   /* deniz pırıltısı, kayıklar, martılar (arka katman) */
    var i, x, y;
    for (i = 0; i < 90; i++) { var gx = (i * 53 + Math.floor(t * 6) * (i % 3)) % WW, gy = HZ + 2 + (i * 29) % 280; if (gx > 196 && gy > 66 + HZ) continue; var near = false; if (Math.sin(t * 3.2 + i * 1.7) > (near ? -0.3 : 0.55)) R(g, gx, gy, near ? 4 : 3, 1, near ? '#fff0c0' : gy < HZ + 50 ? '#ffd6a0' : '#8a7aa8'); }
    for (y = HZ + 3; y < 236; y += 5) { var sw3 = 6 + (y - HZ) * 0.35; for (x = SUN[0] - sw3; x < SUN[0] + sw3; x += 9) if (Math.sin(t * 3 + x * 0.7 + y * 1.3) > 0.55) R(g, x + Math.sin(y + t) * 2, y, 2, 1, 'rgba(255,236,190,0.7)'); }
    [[50, 262, 1], [140, 320, 0.8], [20, 200, 0.5], [110, 410, 1.1]].forEach(function (b, k) {
      var bx = b[0] + Math.sin(t * 0.4 + k) * 3, by = b[1] + Math.sin(t * 1.3 + k * 2) * 1.2, s = b[2], w = Math.round(30 * s);
      R(g, bx, by, w, 2, '#f0ece0'); R(g, bx + 1, by + 2, w - 2, 1, '#c83a2a'); R(g, bx + 1, by + 3, w - 2, 1, '#2a5a8a'); R(g, bx + 3, by + 4, w - 6, 2, '#3a2a30');
      R(g, bx + w - 2, by - 3, 2, 3, '#f0ece0'); R(g, bx, by - 2, 2, 2, '#f0ece0');
      R(g, bx + w * 0.4, by - 14 * s, 1, 14 * s, '#4a3a40'); if (k !== 2) R(g, bx + w * 0.3, by - 4, 5, 3, '#c84a3a');
      R(g, bx + 2, by + 6, w - 4, 1, 'rgba(255,220,180,0.35)');
    });
    for (i = 0; i < 5; i++) gull(g, ((t * 14 + i * 97) % (WW + 60)) - 30, 50 + i * 21 + Math.sin(t + i) * 4, t * 1.3 + i, '#3a2040');
  }
  function frameOf(cx, cy, z) { return { x: cx - 90 / z, y: cy - 160 / z, z: z }; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function camPath(keys, t) {   /* [[t, cx, cy, z], …] yumuşak geçiş */
    var i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    var a = keys[i], b = keys[i + 1] || a, k = b[0] > a[0] ? eio(Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])))) : 1;
    return frameOf(lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k));
  }
  /* liman karesi: chars = [{ S, x, y, o, front:true (sayacın önünde) }], props = fn(g) sayaçtan sonra */
  function harbor(t, chars, cOpt, after, sil) {
    if (!HB) harborStatic();
    var F = layer(WW, WH), g = F.g;
    g.drawImage(HB.bg.c, 0, 0); harborDyn(g, t);
    var G = layer(WW, WH), h = G.g; h.drawImage(HB.fg.c, 0, 0);
    var back = chars.filter(function (c) { return !c.front; }), front = chars.filter(function (c) { return c.front; }).sort(function (a, b) { return a.y - b.y; });
    var info = {};
    if (!sil) {
      back.forEach(function (c) { info[c.id || ''] = person(h, c.x, c.y, c.S, c.o); });
      counter(h, cOpt, t);
      if (cOpt && cOpt.before) cOpt.before(h, info);
      front.forEach(function (c) { info[c.id || ''] = person(h, c.x, c.y, c.S, c.o); if (c.after) c.after(h, info[c.id || '']); });
      if (after) after(h, info);
      rim(G, '#ffc890', 0, -1, 1);
      g.drawImage(G.c, 0, 0);
      return { L: F, info: info };
    }
    /* ters ışık: kişiler ayrı katmanda karanlık siluet + güneş kenarı; arkadaki her şey parıltıda */
    counter(h, cOpt, t);
    if (cOpt && cOpt.before) cOpt.before(h, info);
    if (after) after(h, info);
    rim(G, '#ffc890', 0, -1, 1);
    h.save(); h.globalCompositeOperation = 'source-atop'; h.fillStyle = 'rgba(40,16,30,' + (0.45 * sil) + ')'; h.fillRect(0, 0, WW, WH); h.restore();
    g.drawImage(G.c, 0, 0);
    glow(g, 285, 222, 80, 'rgba(255,170,90,A)', 0.75 * sil); glow(g, 285, 226, 28, 'rgba(255,240,200,A)', 0.9 * sil);
    var C = layer(WW, WH), cg = C.g;
    back.forEach(function (c) { info[c.id || ''] = person(cg, c.x, c.y, c.S, c.o); });
    cg.clearRect(230, 250, 72, GR - 250);
    front.forEach(function (c) { info[c.id || ''] = person(cg, c.x, c.y, c.S, c.o); if (c.after) c.after(cg, info[c.id || '']); });
    cg.save(); cg.globalCompositeOperation = 'source-atop'; cg.fillStyle = 'rgba(30,12,28,' + (0.88 * sil) + ')'; cg.fillRect(0, 0, WW, WH); cg.restore();
    rim(C, '#ffe0a0', 0, -1, 1); rim(C, '#ffb070', -1, 0, 1); rim(C, '#ffb070', 1, 0, 1);
    g.drawImage(C.c, 0, 0);
    return { L: F, info: info };
  }
  function riza(x, o) { return { id: 'r', S: RIZA, x: x, y: 266, o: o }; }

  /* ---------- S1 (0–5 sn): şafak, kamera denizden tezgâha süzülür; Rıza kasketini düzeltir, örtüyü açar, gülümser ---------- */
  function b1open(t) {
    var cap = sm(2.9, 3.15, t) * (1 - sm(3.55, 3.8, t)), pull = sm(3.85, 4.5, t), smile = t > 4.45;
    var x = 266, hands = null;
    if (cap > 0) hands = { r: [x + 4 + Math.round(Math.sin(t * 18) * cap), 216 + Math.round(10 * (1 - cap))] };
    if (t > 3.7 && t < 4.6) { var px = lerp(236, 226, pull); hands = { l: [px, 246 - pull * 6], r: [px + 10, 246 - pull * 4] }; }
    if (t >= 4.6) hands = { l: [x - 9, 249], r: [x + 9, 249] };
    var H2 = harbor(t, [riza(x, { expr: smile ? 'smile' : t > 3.0 && t < 3.6 ? 'blink' : 'neutral', hands: hands })], { tarp: 1 - pull, coins: 0 });
    var c = camPath([[0, 90, 165, 1], [0.6, 96, 168, 1], [3.0, 266, 228, 1.55], [5, 266, 226, 1.62]], t);
    c.L = H2.L; return c;
  }

  /* ---------- S2 (5–10 sn): Nermin Teyze, ilk satış, ilk sikke; kuyruk 2, 4… yola kadar; gülümseme endişeye döner ---------- */
  function queueChars(t, n0, opt) {
    var out = [], i;
    for (i = 1; i < Q.length; i++) {
      var app = opt.app ? opt.app(i) : 0; if (t < app) continue;
      var k = Math.min(1, (t - app) / 0.7), q = Q[i], N = npc(i), sx = q[0] + (1 - k) * 60, sy = q[1] + (1 - k) * 10;
      out.push({ S: N, x: sx, y: sy, front: true, o: { dir: -1, ph: k < 1 ? t * 12 + i : null, expr: opt.mood ? opt.mood(i, N) : 'neutral', tap: opt.tap && N.mood > 0.5 ? Math.max(0, Math.sin(t * 16 + i)) : 0 } });
    }
    return out;
  }
  function b1rush0(t) {
    var x = 266, nk = Math.min(1, t / 0.9), nx = lerp(360, Q[0][0], nk), ny = lerp(300, Q[0][1], nk);
    var weigh = sm(0.95, 1.25, t), give = sm(1.45, 1.75, t) * (1 - sm(2.15, 2.4, t));
    var rH = { l: [x - 9, 249], r: [x + 9, 249] };
    if (t > 0.9 && t < 1.45) rH = { l: [lerp(250, 280, weigh), lerp(246, 233, weigh)], r: [x + 9, 249] };
    if (t >= 1.45 && t < 2.4) rH = { l: [x - 9, 249], r: [lerp(276, 304, give), lerp(240, 244, give)] };
    var face = t > 4.35 ? 'worry' : t > 2.6 && t < 4.0 ? 'smile' : 'smile';
    var needle = t > 1.2 && t < 1.6 ? Math.sin((t - 1.2) * 30) * (1.6 - t) * 2.5 + 0.6 : t >= 1.6 ? 0 : 0;
    var coinsIn = t > 2.15 ? 3 : 2;
    var chars = [riza(x, { expr: face, hands: rH, dir: t > 0.6 && t < 2.6 ? 1 : 0 })];
    var nH = { r: [Q[0][0] + 9, Q[0][1] - 18], l: t > 1.75 && t < 2.2 ? [lerp(Q[0][0] - 8, 296, sm(1.75, 2.0, t)), lerp(Q[0][1] - 20, 244, sm(1.75, 2.0, t))] : [Q[0][0] - 8, Q[0][1] - 20] };
    chars.push({ id: 'n', S: NERMIN, x: nx, y: ny, front: true, o: { dir: -1, ph: nk < 1 ? t * 11 : null, expr: t > 2.0 ? 'smile' : 'neutral', hands: nk < 1 ? null : nH },
      after: function (g, I) { basket(g, I.hands.r[0], I.hands.r[1] - 2, t > 2.0); purse(g, I.hands.l[0] - 1, I.hands.l[1] + 1); } });
    chars = chars.concat(queueChars(t, 1, { app: function (i) { return i <= 2 ? 1.75 + i * 0.12 : i <= 6 ? 2.6 + (i - 3) * 0.1 : 3.0; }, mood: function () { return 'neutral'; } }));
    var H2 = harbor(t, chars, { needle: needle, pan: t > 1.15 && t < 1.5, coins: coinsIn }, function (g, I) {
      if (t > 1.45 && t < 2.0) wrap(g, rH.r[0] + 1, rH.r[1] - 1);
      if (t > 2.0 && t < 2.2) coin(g, 295, lerp(240, 246, (t - 2.0) / 0.2));
      if (t > 2.15 && t < 2.5) { P(g, 292, 242, '#fff0a0'); P(g, 298, 241, '#fff0a0'); }
      if (t > 4.6) sweat(g, I.r.head[0] + 6, I.r.head[1] + 1);
    });
    var c = t < 4.0 ? camPath([[0, 290, 240, 1.9], [2.3, 288, 244, 1.9], [3.9, 300, 300, 1.0]], t) : frameOf(266, 232, 3.6);
    c.L = H2.L; return c;
  }

  /* ---------- S3 (10–16 sn): hızlı kesmeler; kasa, terazi, para, Nermin'in ayağı; hamsi havada (ağır çekim) ve kaskete PAT! ---------- */
  function b1rush(t) {
    var x = 266, c, H2, chars, q = queueChars(t + 9, 1, { app: function () { return 0; }, mood: function (i, N) { return N.mood > 0.5 ? 'frown' : 'worry'; }, tap: 1 });
    var nerm = function (o2) { return { id: 'n', S: NERMIN, x: Q[0][0], y: Q[0][1], front: true, o: o2, after: function (g, I) { basket(g, I.hands.r[0], I.hands.r[1] - 2, true); purse(g, I.hands.l[0] - 1, I.hands.l[1] + 1); } }; };
    var nH = { r: [Q[0][0] + 9, Q[0][1] - 18], l: [Q[0][0] - 8, Q[0][1] - 20] };
    if (t < 1.0) {                                  /* a: kasayı taşır */
      var k = eio(Math.min(1, t / 0.8)), rx = lerp(236, 258, k), cy2 = 236 + Math.round(Math.abs(Math.sin(t * 14)));
      H2 = harbor(t, [riza(rx, { expr: 'worry', dir: 1, hands: { l: [rx - 6, cy2 + 3], r: [rx + 8, cy2 + 3] } })].concat(q), { coins: 4, empty: 1 }, function (g) { crate(g, rx - 7, cy2, true); });
      c = frameOf(258, 236, 2.6);
    } else if (t < 1.7) {                           /* b: tartar */
      var lt = t - 1.0, nd = Math.sin(lt * 34) * Math.max(0, 0.6 - lt) * 3 + 0.8;
      H2 = harbor(t, [riza(x, { expr: 'worry', dir: 1, hands: { l: [278, 230 + Math.round(Math.max(0, 0.25 - lt) * 16)], r: [x + 9, 249] } })].concat(q), { needle: nd, pan: lt > 0.15, coins: 4 });
      c = frameOf(280, 238, 4.2);
    } else if (t < 2.4) {                           /* c: parayı alır */
      var lt2 = t - 1.7;
      H2 = harbor(t, [riza(x, { expr: 'worry', dir: 1, hands: { l: [x - 9, 249], r: [lerp(300, 294, Math.min(1, lt2 * 4)), 243] } }), nerm({ dir: -1, expr: 'frown', hands: nH })].concat(q), { coins: 6 + Math.floor(lt2 * 10) }, function (g) {
        for (var i = 0; i < 4; i++) { var cl = lt2 - i * 0.12; if (cl > 0 && cl < 0.35) coin(g, 300 - i * 2, 230 + cl * 44); }
      });
      c = frameOf(292, 242, 4.0);
    } else if (t < 3.1) {                           /* d: Nermin Teyze ayağını vurur */
      var lt3 = t - 2.4;
      H2 = harbor(t, [riza(x, { expr: 'worry' })].concat([nerm({ dir: -1, expr: 'frown', hands: nH, tap: Math.max(0, Math.sin(lt3 * 18)) })]).concat(q.slice(2)), { coins: 8 });
      c = frameOf(Q[0][0], Q[0][1] - 18, 3.2);
    } else if (t < 4.95) {                          /* e: döner, hamsi uçar; ağır çekim; kaskete düşer */
      var lt4 = t - 3.1, fl = Math.min(1, lt4 / 1.75), fpx, fpy;
      var turn = lt4 < 0.25 ? 0 : 1, slip = lt4 < 0.3 ? lt4 / 0.3 : 1;
      fpx = lerp(284, 266, fl); fpy = 236 - Math.sin(fl * Math.PI) * 92 + (fl > 0.5 ? (fl - 0.5) * 2 * (212 - 236) : 0);
      if (fl > 0.5) fpy = lerp(144, 210, Math.pow((fl - 0.5) * 2, 1.6));
      H2 = harbor(t, [riza(x, { expr: fl > 0.6 ? 'surprise' : 'worry', dir: turn, hands: { l: [x - 9, 249], r: [lerp(276, 284, slip), lerp(244, 232, slip)] } }), nerm({ dir: -1, expr: 'frown', hands: nH })].concat(q), { coins: 8 }, function (g) {
        if (lt4 > 0.2) {
          bigFish(g, fpx, fpy, lt4 * 3.2);
          if (fl > 0.1 && fl < 0.96) for (var s = 1; s < 4; s++) P(g, fpx + (fl < 0.5 ? s * 2 : 0), fpy + (fl < 0.5 ? s * 3 : -s * 3), 'rgba(255,255,255,0.5)');
        }
      });
      var fy2 = Math.max(150, Math.min(232, fpy));
      c = frameOf(lerp(270, 266, fl), lt4 < 0.2 ? 232 : fy2, 2.4);
    } else {                                        /* f: PAT! sonra çaresiz bakış */
      var lt5 = t - 4.95;
      H2 = harbor(t, [riza(x, { expr: lt5 < 0.12 ? 'blink' : 'helpless', dir: 0 })].concat(q), { coins: 8 }, function (g, I) {
        var cp = I.r.cap; bigFish(g, cp[0] + 1, cp[1] - 2 + (lt5 < 0.1 ? -2 : 0), Math.sin(lt5 * 9) * 0.25 * Math.max(0, 1 - lt5) + 0.05);
        if (lt5 < 0.4) { star(g, cp[0] - 7, cp[1] - 4, 2, '#fff4c0'); star(g, cp[0] + 8, cp[1] - 2, 2, '#fff4c0'); tiny(g, cp[0] - 6, cp[1] - 14, 'PAT!', '#2a1408'); tiny(g, cp[0] - 7, cp[1] - 15, 'PAT!', '#fff4c0'); }
      });
      c = frameOf(266, 226, 4.2 + lt5 * 0.15);
    }
    c.L = H2.L; return c;
  }

  /* ---------- S4 (16–21 sn): Rıza'nın omzu üstünden liman girişi; Memo görünür, devrik kasayı görür, çantasını bırakır, tezgâha yürür ---------- */
  var RV = null;
  function revStatic() {
    var L = layer(200, 340), g = L.g, x, y, i;
    dgrad(L, 0, 0, 200, 150, ['#6a7ab8', '#9ab0d4', '#e8c8b0', '#f8dcb0']);
    var rh = ridge(17, 200, 7, 2.1);
    for (x = 0; x < 200; x++) { var h = 34 + rh[x]; R(g, x, 150 - h, 1, h, '#5a7a5a'); R(g, x, 150 - h, 1, 1, '#7a9a6a'); }
    for (i = 0; i < 14; i++) { var hx = 4 + i * 14 + (i % 2) * 3, hy = 104 + (i * 7) % 22; R(g, hx, hy, 10, 9, i % 3 ? '#f0e0c8' : '#e8d0b0'); R(g, hx - 1, hy - 3, 12, 3, '#b0503a'); P(g, hx + 3, hy + 4, '#5a4a4a'); P(g, hx + 6, hy + 4, '#5a4a4a'); }
    R(g, 0, 150, 200, 190, '#9a6a46');
    for (y = 150; y < 340; y += 5) { R(g, 0, y, 200, 1, '#7a5034'); for (x = ((y / 5) % 3) * 12; x < 200; x += 36) R(g, x, y + 1, 1, 4, '#80553a'); }
    /* liman kapısı: taş direkler, kemer, levha, fener */
    R(g, 96, 82, 12, 92, '#a89a8a'); R(g, 152, 82, 12, 92, '#a89a8a'); R(g, 96, 82, 2, 92, '#c8baa8'); R(g, 152, 82, 2, 92, '#c8baa8');
    for (y = 86; y < 174; y += 8) { R(g, 96, y, 12, 1, '#8a7c6c'); R(g, 152, y, 12, 1, '#8a7c6c'); }
    for (x = 96; x < 164; x++) { var a = Math.sqrt(Math.max(0, 1 - Math.pow((x - 130) / 34, 2))); R(g, x, 74 - a * 10, 1, 10, '#b0a290'); P(g, x, 74 - a * 10, '#d0c2ae'); }
    R(g, 116, 64, 28, 9, '#3a2a1e'); R(g, 117, 65, 26, 7, '#e8dcc0'); tiny(g, 130 - Math.floor(tinyW('LİMAN') / 2), 66, 'LİMAN', '#3a2a1e');
    for (y = 150; y < 174; y++) { var w0 = 4 + (y - 150) * 0.75; R(g, 130 - w0, y, w0 * 2, 1, (y % 4) ? '#8a8290' : '#6a6270'); }
    R(g, 92, 120, 4, 6, '#2a2a30'); R(g, 93, 121, 2, 4, '#ffd27a'); R(g, 164, 120, 4, 6, '#2a2a30'); R(g, 165, 121, 2, 4, '#ffd27a');
    /* yol: kapıdan aşağı */
    for (y = 174; y < 340; y++) { var w = 22 + (y - 174) * 0.55; R(g, 130 - w, y, w * 2, 1, (y % 5) ? '#8a8290' : '#6a6270'); }
    /* deniz şeridi (solda) */
    for (y = 150; y < 340; y++) R(g, 0, y, 10 - (y - 150) * 0.03, 1, '#3a5a8a');
    RV = L;
  }
  var CROWD = [[150, 210, 1], [120, 214, 2], [168, 222, 3], [98, 226, 4], [138, 232, 5], [186, 238, 6], [112, 246, 7], [160, 252, 8]];
  function b1stranger(t) {
    if (!RV) revStatic();
    var L = layer(200, 340), g = L.g, i;
    g.drawImage(RV.c, 0, 0);
    for (i = 0; i < 3; i++) gull(g, ((t * 16 + i * 70) % 240) - 20, 26 + i * 15, t + i, '#3a3050');
    /* devrik kasa ve dökülen balık */
    var crx = 40, cry = 266;
    var memoX, memoY, ph = null, dir = 0, hands = null, bagOn = t < 3.35, mexp = 'neutral';
    var appear = sm(0.4, 0.9, t);
    if (t < 1.6) { memoX = 130; memoY = 176; dir = t < 1.0 ? 0 : t < 1.3 ? -1 : 1; mexp = 'neutral'; }
    else if (t < 3.0) { var k = (t - 1.6) / 1.4; memoX = lerp(130, 58, k); memoY = lerp(176, 262, k); ph = t * 9; dir = -1; mexp = 'neutral'; }
    else if (t < 3.6) { memoX = 58; memoY = 262; dir = -1; var dn = sm(3.0, 3.4, t); hands = { l: [memoX - 9, lerp(240, 258, dn)] }; mexp = 'smile'; }
    else { var k2 = eio(Math.min(1, (t - 3.6) / 1.4)); memoX = lerp(58, 92, k2); memoY = lerp(262, 300, k2); ph = t * 9; dir = 1; mexp = 'smile'; }
    /* kalabalık (karartılır) + Memo y sırasına göre */
    var C = layer(200, 340), h = C.g, list = CROWD.map(function (c) { return { S: npc(c[2] + 20), x: c[0], y: c[1], o: { dir: (c[2] % 3) - 1, expr: c[2] % 2 ? 'frown' : 'worry', tap: c[2] % 3 === 0 ? Math.max(0, Math.sin(t * 15 + c[2])) : 0 } }; });
    list.sort(function (a, b) { return a.y - b.y; }).forEach(function (c) { person(h, c.x, c.y, c.S, c.o); });
    var dim = 0.1 + 0.22 * appear;
    h.save(); h.globalCompositeOperation = 'source-atop'; h.fillStyle = 'rgba(30,26,50,' + dim + ')'; h.fillRect(0, 0, 200, 340); h.restore();
    /* kasa */
    R(g, crx - 9, cry - 7, 17, 8, '#c08a52'); R(g, crx - 9, cry - 7, 1, 8, '#9a6a3a'); R(g, crx - 9, cry - 4, 17, 1, '#9a6a3a');
    for (i = 0; i < 8; i++) fish(g, crx + 10 + (i * 7) % 22, cry - 1 + (i % 3) * 2, i * 0.9);
    g.drawImage(C.c, 0, 0);
    if (t > 0.35) {
      if (memoY < 245) glow(g, memoX, memoY - 26, 34, 'rgba(255,230,170,A)', 0.4 * appear);
      var M = layer(200, 340);
      var mi = person(M.g, memoX, memoY, MEMO, { dir: dir, ph: ph, expr: mexp, hands: hands || (bagOn ? { l: [memoX - 9, memoY - 31] } : null) });
      if (bagOn) { line(M.g, memoX - 5, memoY - 40, memoX + 5, memoY - 30, '#5a4028'); bag(M.g, (hands ? hands.l[0] : memoX - 9), (hands ? hands.l[1] : memoY - 31)); }
      rim(M, '#fff0c0', 0, -1, 1);
      g.globalAlpha = Math.min(1, appear * 1.4); g.drawImage(M.c, 0, 0); g.globalAlpha = 1;
    }
    if (!bagOn) bag(g, 49, 251);
    /* ön plan: tezgâhın arkası ve Rıza'nın sırtı (iki kat, hafif karanlık) */
    R(g, 0, 300, 200, 40, '#6a4228'); R(g, 0, 300, 200, 2, '#a07448'); for (i = 0; i < 200; i += 11) R(g, i, 302, 1, 38, '#5a3620');
    crate(g, 8, 293, true); crate(g, 26, 294, false);
    var RB = layer(80, 80); person(RB.g, 40, 76, RIZA, { back: true, hands: { l: [29, 64], r: [51, 64] } });
    RB.g.save(); RB.g.globalCompositeOperation = 'source-atop'; RB.g.fillStyle = 'rgba(20,10,24,0.38)'; RB.g.fillRect(0, 0, 80, 80); RB.g.restore();
    rim(RB, '#ffc890', 1, 0, 1);
    g.drawImage(RB.c, 0, 0, 80, 80, 30, 150, 240, 240);
    var c2 = camPath([[0, 110, 186, 1.05], [0.5, 112, 184, 1.08], [1.5, 128, 172, 1.65], [3.0, 98, 226, 1.32], [5, 104, 244, 1.25]], t);
    c2.L = L; c2.x = Math.max(0, Math.min(200 - 180 / c2.z, c2.x)); c2.y = Math.max(0, Math.min(340 - 320 / c2.z, c2.y)); return c2;
  }

  /* ---------- S5 (21–26 sn): Memo kasayı tezgâha koyar; Rıza şaşırır; el uzatır, duraksama, tokalaşma; ters ışıkta yakınlaşma ---------- */
  function b1shake(t) {
    var rx = 268, mx = 302, my = 288;
    var lift = sm(0.2, 1.3, t), crX = lerp(294, 286, lift), crY = lerp(268, 238, lift) - Math.sin(lift * Math.PI) * 10;
    var mH = t < 1.4 ? { l: [crX - 1, crY + 4], r: [crX + 15, crY + 4] } : t < 1.7 ? null : { l: [lerp(mx - 9, 286, sm(1.7, 2.2, t)), lerp(my - 30, 244, sm(1.7, 2.2, t))] };
    var shake = t > 3.35 ? Math.round(Math.sin((t - 3.35) * 16) * 1.5 * Math.max(0, 1 - (t - 3.35) / 1.2)) : 0;
    var rH = { l: [rx - 9, 249], r: [rx + 9, 249] };
    if (t > 2.9) { var rk = sm(2.9, 3.35, t); rH.r = [lerp(rx + 9, 284, rk), lerp(249, 244, rk) + shake]; }
    if (mH && mH.l && t > 3.35) mH.l = [286, 244 + shake];
    var rE = t < 1.0 ? 'worry' : t < 2.3 ? 'surprise' : t < 2.9 ? 'neutral' : 'smile', mE = t < 1.5 ? 'neutral' : 'smile';
    var sil = sm(3.4, 4.6, t);
    var H2 = harbor(t, [{ id: 'r', S: RIZA, x: rx, y: 266, o: { expr: rE, dir: 1, hands: rH, armFront: 'l' } },
      { id: 'm', S: MEMO, x: mx, y: my, front: true, o: { dir: -1, expr: mE, hands: mH, armFront: 'l' } }],
      { coins: 8, noScale: 1, noBox: lift > 0.9, before: function (g) { if (lift >= 1) crate(g, 286, 242, true); } },
      function (g) { if (lift < 1) crate(g, crX, crY, true); }, sil);
    var c = camPath([[0, 290, 244, 1.75], [2.8, 288, 240, 1.95], [4.8, 285, 233, 3.6], [5, 285, 233, 3.65]], t);
    c.L = H2.L; return c;
  }

  /* ---------- S6 (26–30 sn): kamera yükselir; Memo müşteriye verir, Rıza kasaları dizer, Nermin Teyze mutlu gider; son kare yan yana ---------- */
  function b1together(t) {
    var rx = 250, mx = 284, fin = t > 2.5;
    var nk = Math.min(1, t / 3.2), nx = lerp(318, 214, nk), ny = lerp(296, 336, nk);
    var arr = Math.sin(t * 5) * 0.5 + 0.5;
    var rH = fin ? { l: [rx - 9, 249], r: [mx - 8, 236] } : { l: [rx - 10 + arr * 4, 244 - arr * 3], r: [rx + 6 + arr * 4, 244 - arr * 3] };
    var give = sm(0.3, 0.8, t) * (1 - sm(1.6, 1.9, t));
    var mH = fin ? { l: [mx - 9, 249], r: [mx + 9, 249] } : { l: [mx - 9, 249], r: [lerp(mx + 9, 306, give), lerp(249, 244, give)] };
    var chars = [{ id: 'r', S: RIZA, x: rx, y: 266, o: { expr: fin ? 'happy' : 'smile', dir: fin ? 0 : -1, hands: rH, armFront: 'r' } },
      { id: 'm', S: MEMO, x: mx, y: 267, o: { expr: fin ? 'happy' : 'smile', dir: fin ? 0 : 1, hands: mH } },
      { S: npc(3), x: 318, y: 290, front: true, o: { dir: -1, expr: 'smile', hands: { l: [lerp(310, 307, give), 252] } }, after: function (g) { if (t > 1.8) wrap(g, 309, 251); } },
      { id: 'n', S: NERMIN, x: nx, y: ny, front: true, o: { dir: -1, ph: t * 10, expr: 'happy' }, after: function (g, I) { basket(g, I.hands.r[0], I.hands.r[1] - 2, true); } }];
    [[340, 304, 4], [326, 322, 5], [346, 340, 6]].forEach(function (q) { chars.push({ S: npc(q[2]), x: q[0], y: q[1], front: true, o: { dir: -1, expr: 'smile' } }); });
    var H2 = harbor(t, chars, { coins: 12 }, function (g) { if (give > 0.2 && t < 1.8) wrap(g, mH.r[0] + 1, mH.r[1] - 2); if (!fin) crate(g, rx - 14 + arr * 4, 240 - arr * 3, true); });
    var c = camPath([[0, 296, 290, 1.9], [2.6, 268, 222, 1.55], [4, 267, 221, 1.6]], t);
    c.L = H2.L; return c;
  }

  /* ---------- kapanış (bölüm sonu): yan yana, akşamüstü ---------- */
  function b1end(t) {
    var H2 = harbor(t + 30, [{ id: 'r', S: RIZA, x: 250, y: 266, o: { expr: 'happy', hands: { l: [241, 249], r: [276, 236] }, armFront: 'r' } },
      { id: 'm', S: MEMO, x: 284, y: 267, o: { expr: t > 1.2 && t < 1.35 ? 'blink' : 'happy', hands: { l: [275, 249], r: [293, 249] } } }], { coins: 20 });
    var c = frameOf(267, 166 - t * 1.2, 1.3); c.L = H2.L; return c;
  }

  TBS.reg('b1open', b1open); TBS.reg('b1rush0', b1rush0); TBS.reg('b1rush', b1rush); TBS.reg('b1stranger', b1stranger);
  TBS.reg('b1shake', b1shake); TBS.reg('b1together', b1together); TBS.reg('b1end', b1end);
  /* karakter dizisi önizlemesi (yalnız geliştirme) */
  TBS.reg('lineup', function (t) {
    var L = layer(180, 320), g = L.g; R(g, 0, 0, 180, 320, '#6a7aa0'); R(g, 0, 200, 180, 120, '#8e6040');
    var ex = ['neutral', 'smile', 'happy', 'worry', 'surprise', 'helpless', 'frown', 'blink'], e = ex[Math.floor(t) % ex.length];
    person(g, 40, 120, RIZA, { expr: e }); person(g, 92, 120, MEMO, { expr: e }); person(g, 140, 120, NERMIN, { expr: e });
    person(g, 40, 200, RIZA, { expr: e, dir: 1 }); person(g, 92, 200, MEMO, { expr: e, dir: -1, ph: t * 8 }); person(g, 140, 200, NERMIN, { expr: e, dir: -1 });
    person(g, 40, 290, RIZA, { back: true }); person(g, 92, 290, npc(1), { expr: e }); person(g, 140, 290, npc(2), { expr: e });
    basket(g, 149, 102); tiny(g, 4, 4, e.toUpperCase().replace(/[^A-Z]/g, ''), '#ffffff');
    return { L: L, x: 0, y: 0, z: 1 };
  });
})();
