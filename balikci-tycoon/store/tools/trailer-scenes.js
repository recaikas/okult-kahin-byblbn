/* Fragmanın elle çizilmiş sinematik sahneleri. 320×180 piksel, ×6 büyütülür (1920×1080). Tarayıcıda çalışır: window.TBS.
   Katmanlar çıkış tuvaline kesirli kaydırmayla basılır: pikseller keskin kalır, kamera akıcı kayar.
   Sahneler: dawn (şafak), deep (hamsi sürüsü), cast (ağ atma), storm (lodos), legend (Şahmeran), finale (gece limanı)
   TBS.draw(ad, t, u) — t: sahnenin saniyesi, u: 0..1 ilerleme */
(function () {
  'use strict';
  var W = 320, H = 180, K = 6;
  var out = document.createElement('canvas'); out.id = 'tbs'; out.width = W * K; out.height = H * K;
  out.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:180;image-rendering:pixelated;display:none;background:#000';
  document.body.appendChild(out);
  var O = out.getContext('2d'); O.imageSmoothingEnabled = false;

  /* ---------- yardımcılar ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function layer(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c: c, g: g, w: w, h: h }; }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function hx(c) { return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, k) { var A = rgb(a), B = rgb(b); return hx([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]); }
  /* Bayer titreşimli dikey geçiş (pixel-art gökyüzü / deniz) */
  function dgrad(L, x, y, w, h, cols) {
    var img = L.g.getImageData(x, y, w, h), d = img.data, n = cols.length - 1, C = cols.map(rgb);
    for (var j = 0; j < h; j++) {
      var f = j / Math.max(1, h - 1) * n, i = Math.min(n - 1, Math.floor(f)), fr = f - i;
      for (var q = 0; q < w; q++) {
        var c = fr * 16 > BAY[(j & 3) * 4 + (q & 3)] + 0.5 ? C[i + 1] : C[i], p = (j * w + q) * 4;
        d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255;
      }
    }
    L.g.putImageData(img, x, y);
  }
  function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function P(g, x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function disc(g, cx, cy, r, c) { for (var dy = -r; dy <= r; dy++) { var hw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))); R(g, cx - hw, cy + dy, hw * 2 + 1, 1, c); } }
  function halo(g, cx, cy, r, c, a) {   /* titreşimli yumuşak hale: dışa doğru seyrelen nokta deseni */
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      var d = Math.sqrt(dx * dx + dy * dy) / r; if (d > 1) continue;
      if ((1 - d) * a * 16 > BAY[((cy + dy) & 3) * 4 + ((cx + dx) & 3)]) P(g, cx + dx, cy + dy, c);
    }
  }
  function line(g, x0, y0, x1, y1, c) { var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (var i = 0; i <= n; i++) P(g, x0 + (x1 - x0) * i / Math.max(1, n), y0 + (y1 - y0) * i / Math.max(1, n), c); }
  /* sprite: satır dizisi + palet ('.' saydam) */
  function spr(g, x, y, rows, pal, flip) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) {
      var ch = rows[j][flip ? rows[j].length - 1 - i : i]; if (ch === '.' || ch === ' ') continue; P(g, x + i, y + j, pal[ch] || '#ff00ff');
    }
  }
  /* kenar ışığı: saydam komşusu olan opak piksele ışık rengi (ters ışık sinematiği) */
  function rim(L, col, dx, dy, w2) {
    var im = L.g.getImageData(0, 0, L.w, L.h), d = im.data, C = rgb(col), o = new Uint8ClampedArray(d), k, x, y;
    for (y = 0; y < L.h; y++) for (x = 0; x < L.w; x++) {
      var p = (y * L.w + x) * 4; if (o[p + 3] === 0) continue;
      for (k = 1; k <= (w2 || 1); k++) {
        var nx = x + dx * k, ny = y + dy * k;
        if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h || o[(ny * L.w + nx) * 4 + 3] === 0) { d[p] = C[0]; d[p + 1] = C[1]; d[p + 2] = C[2]; break; }
      }
    }
    L.g.putImageData(im, 0, 0);
  }
  /* dağ sırtı: tohumlu çok katlı sinüs */
  function ridge(seed, w, amp, rough) {
    var r = rng(seed), oc = [], i, pts = [];
    for (i = 0; i < 6; i++) oc.push({ f: (0.012 + r() * 0.01) * Math.pow(2.05, i), p: r() * 100, a: amp / Math.pow(rough || 1.9, i) });
    for (var x = 0; x < w; x++) { var y = 0; for (i = 0; i < oc.length; i++) y += Math.sin(x * oc[i].f + oc[i].p) * oc[i].a; pts.push(y); }
    return pts;
  }
  function blit(L, ox, oy, a, k) {
    k = k || K; if (a !== undefined) O.globalAlpha = a;
    O.drawImage(L.c, Math.round(-ox * K), Math.round(-oy * K), L.w * k, L.h * k);
    O.globalAlpha = 1;
  }
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function eio(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  function sm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function gull(g, x, y, t, c) {
    var f = Math.floor(t * 5) % 3; c = c || '#2a1838';
    var up = ['k...k', '.k.k.', '..k..'], mid = ['.....', 'kk.kk', '..k..'], dn = ['.....', '.k.k.', 'k.k.k'];
    spr(g, Math.round(x) - 2, Math.round(y) - 1, [up, mid, dn][f], { k: c });
  }

  /* ---------- ortak çizimler ---------- */
  /* Karadeniz kayığı (sağa bakan): kalkık baş, kırmızı-mavi bordür, ışık kenarı ayrıca verilir */
  var KAYIK = [
    '........................................kk',
    '.......................................kkk',
    'kk....................................kkk.',
    'kkkk................................kkkkk.',
    'kWWWkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkWWWkk.',
    '.kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRk..',
    '.kBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBk..',
    '..kHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHk...',
    '...kHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHk....',
    '....kkHHHHHHHHHHHHHHHHHHHHHHHHHHHHkkk.....',
    '......kkkkkkkkkkkkkkkkkkkkkkkkkkkk........'
  ];
  /* balıkçı gövdesi (sağa bakan, bel üstü; kollar ayrıca) */
  var FISHER = [
    '...kkkkk...',
    '..kcccccck.',
    '.kcccccccck',
    '.kCCCCCCCCkk',
    '.khhsssssk..',
    '.khsssseskk.',
    '.khsssssssk.',
    '..ksmmmmsk..',
    '..kSssssk...',
    '...kSSSk....',
    '..kjjjjjk...',
    '.kjjjjjjjk..',
    'kjjjjjjjjjk.',
    'kjjjjjjjjjk.',
    'kwrwrwrwrwk.',
    'kjjjjjjjjjk.',
    'kjjjjjjjjjk.',
    'kjjjjjjjjjk.',
    '.kbbbbbbbk..',
    '.kpppppppk..',
    '.kpppkpppk..'
  ];
  function fisherSprite(pal, arm, rimCol) {   /* arm: kolun açısı (radyan, 0 = ileri) */
    var L = layer(40, 40), g = L.g, ox = 14, oy = 8;
    spr(g, ox, oy, FISHER, pal);
    var sx = ox + 6, sy = oy + 12, len = 9, ax = sx + Math.cos(arm) * len, ay = sy + Math.sin(arm) * len;
    for (var i = 0; i <= 10; i++) { var px = sx + (ax - sx) * i / 10, py = sy + (ay - sy) * i / 10; R(g, px - 1, py - 1, 3, 3, pal.k); }
    for (i = 0; i <= 10; i++) { px = sx + (ax - sx) * i / 10; py = sy + (ay - sy) * i / 10; R(g, px, py, 1, 1, pal.j); }
    R(g, ax - 1, ay - 1, 3, 3, pal.k); P(g, ax, ay, pal.s);
    if (rimCol) { rim(L, rimCol, 1, 0, 1); rim(L, rimCol, 0, -1, 1); }
    return { L: L, hx: ax - ox, hy: ay - oy };
  }

  /* =====================================================================
     1 — ŞAFAK: çay bahçeli yamaçtaki köy, minare, mendirek feneri, doğan güneş
     ===================================================================== */
  var dawn = null, HZ = 160;
  function buildDawn() {
    var D = {}, r, i, x, y;
    D.sky = layer(W + 20, 220);
    dgrad(D.sky, 0, 0, W + 20, HZ, ['#0b0920', '#151031', '#221645', '#361d58', '#552566', '#7a2f6c', '#a33d6c', '#c9566b', '#e3756a', '#f39b6e', '#f9c381', '#fde3ae']);
    r = rng(11); D.stars = []; for (i = 0; i < 70; i++) D.stars.push({ x: r() * (W + 20), y: r() * 80, b: r(), tw: r() * 6 });
    /* bulutlar: ince stratus, alttan aydınlık */
    D.cl = layer(W + 160, 220); r = rng(5);
    [[10, 84, 90], [150, 76, 130], [60, 102, 70], [250, 110, 90], [380, 92, 80], [200, 126, 60]].forEach(function (c) {
      var g = D.cl.g, x0 = c[0], y0 = c[1], w = c[2];
      R(g, x0, y0, w, 1, '#7c3466'); R(g, x0 + 6, y0 - 1, w - 18, 1, '#6a2e60'); R(g, x0 + 3, y0 + 1, w - 6, 1, '#f08c6c'); R(g, x0 + 12, y0 + 2, w - 30, 1, '#ffc58a');
    });
    /* uzak burun (sağ ufuk) */
    D.far = layer(W + 40, 220); var rf = ridge(21, W + 40, 2.5);
    for (x = 0; x < W + 40; x++) { var h = x > 205 ? Math.max(0, 6 + rf[x] - (x - 205) * 0.02) : 0; if (h > 0) R(D.far.g, x, HZ - h, 1, h, '#b0577a'); }
    /* yamaç: sol yarıda köy */
    D.hill = layer(W + 40, 220); var g = D.hill.g, rn = ridge(47, W + 40, 2.2, 2.0);
    D.top = [];
    for (x = 0; x < W + 40; x++) {
      var t = Math.min(1, x / 178), top = 40 + Math.pow(t, 1.9) * (HZ - 40) + rn[x] * (1 - t * 0.8);
      if (x > 178) top = 999; D.top.push(top);
      if (top < HZ) { R(g, x, top, 1, HZ - top, '#2a1a3a'); }
    }
    /* çay sekileri: eğime uyan kesik bantlar */
    r = rng(3);
    for (y = 50; y < HZ; y += 3) for (x = 0; x < 178; x++) { if (D.top[x] + 3 > y) continue; if (((x + y * 3) % 7) < 5) P(g, x, y + Math.round(Math.sin(x * 0.08 + y) * 0.6), (y / 3) % 2 ? '#33223f' : '#2f2142'); }
    /* köy: sekilere oturan evler */
    D.houses = []; r = rng(77);
    for (i = 0; i < 70; i++) {
      var hx0 = 6 + Math.pow(r(), 0.7) * 160, tp = D.top[Math.round(hx0)], hy0 = tp + 5 + Math.pow(r(), 0.8) * Math.min(40, HZ - tp - 6);
      if (hy0 > HZ - 2) continue;
      var ok = D.houses.every(function (q) { return Math.abs(q.x - hx0) > 6 || Math.abs(q.y - hy0) > 5; });
      if (ok) D.houses.push({ x: Math.round(hx0), y: Math.round(hy0), w: 4 + (r() < 0.35 ? 2 : 0), lit: r() < 0.55, ph: r() * 9, two: r() < 0.3 });
    }
    D.houses.sort(function (a, b) { return a.y - b.y; });
    D.houses.forEach(function (q) {
      var hh = q.two ? 5 : 3;
      R(g, q.x, q.y - hh, q.w, hh, '#b8a0b2'); R(g, q.x + q.w - 2, q.y - hh, 2, hh, '#f2d3c4');     /* sağ yüz güneşte */
      R(g, q.x - 1, q.y - hh - 1, q.w + 2, 1, '#8e2f3a'); R(g, q.x, q.y - hh - 2, q.w, 1, '#b8463e'); P(g, q.x + q.w, q.y - hh - 1, '#e0705a');
      P(g, q.x + 1, q.y - hh + 1, '#5a3c5a'); if (q.two) P(g, q.x + 1, q.y - hh + 4, '#5a3c5a');
    });
    /* cami */
    var mx = 74, mt = Math.round(D.top[mx] + 14);
    R(g, mx, mt - 6, 14, 6, '#c8b2c0'); R(g, mx + 10, mt - 6, 4, 6, '#f2d6c8'); disc(g, mx + 7, mt - 7, 4, '#b9a8bc'); R(g, mx + 8, mt - 11, 3, 4, '#e8cfc6'); P(g, mx + 7, mt - 12, '#e4b94a');
    R(g, mx + 16, mt - 26, 2, 26, '#d0bccb'); R(g, mx + 17, mt - 26, 1, 26, '#f6dccf'); R(g, mx + 15, mt - 18, 4, 1, '#9a8098'); R(g, mx + 16, mt - 30, 2, 4, '#8e7a96'); P(g, mx + 16, mt - 31, '#8e7a96'); P(g, mx + 16, mt - 32, '#e4b94a');
    /* sırttaki ışık kenarı (güneş sağdan) */
    rim(D.hill, '#c45c74', 0, -1, 1);
    for (x = 0; x < 178; x++) { var tt = Math.round(D.top[x]); if (D.top[x + 1] > D.top[x]) P(g, x, tt, '#ef8f78'); }
    R(g, 0, HZ - 1, 180, 1, '#d88a7a'); R(g, 0, HZ - 2, 180, 1, '#4a2e50');
    /* mendirek, fener, bağlı kayıklar */
    R(g, 168, HZ - 3, 46, 3, '#3a2a44'); R(g, 168, HZ - 3, 46, 1, '#d88a7a'); for (x = 170; x < 212; x += 4) P(g, x, HZ - 2, '#4a3854');
    R(g, 206, HZ - 13, 4, 10, '#e9dcd6'); R(g, 206, HZ - 10, 4, 2, '#b4413a'); R(g, 206, HZ - 6, 4, 2, '#b4413a'); R(g, 205, HZ - 15, 6, 2, '#2a1a3a'); R(g, 207, HZ - 17, 2, 2, '#ffe2a0');
    /* deniz */
    D.sea = layer(W + 20, 60); dgrad(D.sea, 0, 0, W + 20, 60, ['#d98a8a', '#a65a7c', '#6e3f6e', '#45305e', '#2b2448', '#1c1a38']);
    r = rng(91); D.gl = []; for (i = 0; i < 200; i++) D.gl.push({ x: r() * (W + 20), y: 1 + Math.pow(r(), 1.7) * 58, w: 1 + r() * 5, ph: r() * 7, sp: 1 + r() * 4 });
    /* öndeki kayık + balıkçı silüeti */
    D.boat = layer(60, 34); spr(D.boat.g, 6, 18, KAYIK, { k: '#170f24', W: '#170f24', R: '#170f24', B: '#170f24', H: '#170f24' });
    var fs = fisherSprite({ k: '#170f24', c: '#170f24', C: '#170f24', h: '#170f24', s: '#170f24', S: '#170f24', e: '#170f24', m: '#170f24', j: '#170f24', w: '#170f24', r: '#170f24', b: '#170f24', p: '#170f24' }, -1.0);
    D.boat.g.drawImage(fs.L.c, 14, -6); R(D.boat.g, 30, -6 + 8 + 11 - 22, 1, 22, '#170f24');
    rim(D.boat, '#ffb27a', 1, 0, 1); rim(D.boat, '#f07a6a', 0, -1, 1);
    return D;
  }
  function drawDawn(t, u) {
    if (!dawn) dawn = buildDawn();
    var D = dawn, cy = 40 * ease(u), px = 8 * eio(u);
    blit(D.sky, px * 0.2, cy * 0.45);
    var sa = Math.max(0, 1 - u * 1.4);
    if (sa > 0) D.stars.forEach(function (s) { O.globalAlpha = sa * (0.35 + 0.65 * s.b) * (0.6 + 0.4 * Math.sin(t * 3 + s.tw)); O.fillStyle = s.b > 0.85 ? '#ffffff' : '#c9b8ff'; O.fillRect(Math.round((s.x - px * 0.2) * K), Math.round((s.y - cy * 0.45) * K), K, K); });
    O.globalAlpha = 1;
    /* güneş */
    var S = layer(W + 20, 220), g = S.g, sx = 238, sy = Math.round(HZ + 6 - 22 * ease(Math.min(1, u * 1.1)));
    halo(g, sx, sy, 44, '#ffcf9a', 0.35); halo(g, sx, sy, 26, '#ffe2b0', 0.55);
    disc(g, sx, sy, 10, '#ffcf7a'); disc(g, sx, sy, 9, '#ffe7ae'); disc(g, sx - 2, sy - 2, 5, '#fff6dc');
    g.clearRect(0, HZ, W + 20, 220);
    blit(S, px, cy);
    blit(D.cl, px * 0.4 + t * 1.6, cy * 0.55);
    blit(D.far, px * 0.6, cy);
    /* deniz + yakamoz kolonu */
    var Se = layer(W + 20, 60), sg = Se.g; sg.drawImage(D.sea.c, 0, 0);
    D.gl.forEach(function (m) {
      var x = (m.x + t * m.sp) % (W + 20), k = m.y / 58, inC = Math.abs(x - sx - 1) < 3 + k * 46;
      if (Math.sin(t * 4 + m.ph) < (inC ? -0.5 : 0.5)) return;
      R(sg, x, m.y, Math.max(1, m.w * (0.4 + k)), 1, inC ? (Math.sin(t * 6 + m.ph) > 0 ? '#ffe7ae' : '#f6a86e') : (k < 0.35 ? '#e3a094' : '#5a3e78'));
    });
    R(sg, 0, 0, W + 20, 1, '#ffd2a6');
    blit(Se, px, cy - HZ);
    blit(D.hill, px * 1.0, cy);
    D.houses.forEach(function (q) { if (!q.lit) return; var on = Math.sin(t * 1.7 + q.ph) > -0.6 && u < 0.92; if (on) { O.fillStyle = '#ffd27a'; O.fillRect(Math.round((q.x + 1 - px) * K), Math.round((q.y - (q.two ? 5 : 3) + 1 - cy) * K), K, K); } });
    /* sis bandı */
    O.globalAlpha = 0.18; O.fillStyle = '#f7b8a0'; O.fillRect(0, Math.round((HZ - 4 - cy) * K), W * K, 4 * K); O.globalAlpha = 1;
    blit(D.boat, -224 + px * 1.25, -178 + cy * 1.2 - Math.sin(t * 1.5) * 1.2);
    var gl = layer(W, H); for (var i = 0; i < 4; i++) gull(gl.g, ((t * (10 + i * 3) + i * 90) % (W + 40)) - 20, 46 + i * 12 + Math.sin(t * 1.3 + i) * 3, t + i * 0.37);
    blit(gl, 0, 0);
  }

  /* =====================================================================
     2 — DERİN: ışık hüzmeleri altında hamsi sürüsü; içinden palamut geçer, sürü yarılır
     ===================================================================== */
  var deep = null;
  function buildDeep() {
    var D = {}, r = rng(3), i;
    D.bg = layer(W, H); dgrad(D.bg, 0, 0, W, H, ['#6cc7d2', '#43a8bd', '#2689a6', '#186a8c', '#0f4f71', '#0a3757', '#06243f', '#03162b']);
    D.f = []; for (i = 0; i < 300; i++) D.f.push({ a: r() * Math.PI * 2, rad: 10 + Math.pow(r(), 0.65) * 66, h: (r() - 0.5) * 2, sp: 0.75 + r() * 0.3, ph: r() * 9, far: r() < 0.25, ox: 0, oy: 0 });
    D.dust = []; for (i = 0; i < 90; i++) D.dust.push({ x: r() * W, y: r() * H, s: 1 + r() * 4, ph: r() * 5 });
    D.bub = []; for (i = 0; i < 16; i++) D.bub.push({ x: r() * W, y: r() * H, sp: 8 + r() * 16, ph: r() * 6 });
    D.weed = []; for (i = 0; i < 22; i++) D.weed.push({ x: r() * W, h: 10 + r() * 26, ph: r() * 6 });
    D.rock = ridge(9, W, 4, 1.8);
    return D;
  }
  function fish(g, x, y, dir, gl, far) {
    var p = far ? { k: '#0e3a52', b: '#2a6a82', s: '#4f8ea2', w: '#6aa6b6' } : { k: '#163848', b: '#3e7d92', s: '#b8d0d8', w: '#f2fbfc' };
    var rows = ['.kbbbb..', 'kbsssssk', '.kwwww..'];
    if (dir > 0) rows = ['..bbbbk.', 'ksssssbk', '..wwwwk.'];
    spr(g, Math.round(x) - 4, Math.round(y) - 1, rows, { k: p.k, b: p.b, s: p.s, w: p.w });
    if (!far) P(g, x + (dir > 0 ? 2 : -3), y - 0, '#0a1418');
    if (gl) { P(g, x - 1, y, '#ffffff'); P(g, x, y, '#ffffff'); P(g, x + 1, y - 1, '#ffffff'); }
  }
  function drawDeep(t, u) {
    if (!deep) deep = buildDeep();
    var D = deep, L = layer(W, H), g = L.g, i;
    g.drawImage(D.bg.c, 0, 0);
    for (var x = 0; x < W; x++) { var y = 4 + Math.round(Math.sin(x * 0.09 + t * 2) * 1.5 + Math.sin(x * 0.21 - t * 2.6)); R(g, x, 0, 1, y, '#b8f2f2'); P(g, x, y, '#ffffff'); }
    for (i = 0; i < 5; i++) {
      var bx = 20 + i * 66 + Math.sin(t * 0.5 + i) * 8, sw = 8 + (i % 3) * 6;
      g.save(); g.globalAlpha = 0.09 + 0.05 * Math.sin(t * 0.8 + i * 2); g.fillStyle = '#e4ffff';
      g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + sw, 0); g.lineTo(bx + sw + 60, H); g.lineTo(bx + 26, H); g.closePath(); g.fill(); g.restore();
    }
    D.dust.forEach(function (d) { P(g, d.x + Math.sin(t + d.ph) * 2, (d.y + t * d.s) % H, '#9fdfe8'); });
    /* dip: kaya ve yosun */
    for (x = 0; x < W; x++) { var ry = 164 + D.rock[x]; R(g, x, ry, 1, H - ry, '#03121f'); }
    D.weed.forEach(function (w) { for (var k = 0; k < w.h; k++) P(g, w.x + Math.sin(t * 1.5 + w.ph + k * 0.25) * (k / w.h) * 3, 168 - k, k % 3 ? '#0a2a2e' : '#0e3634'); });
    /* palamut: sürünün içinden geçer */
    var pt = t - 1.0, px = -30 + pt * 150, py = 92 + Math.sin(pt * 2.4) * 8;
    var cx = 170 - 40 * ease(u), cyy = 86 + Math.sin(t * 0.8) * 5, list = [];
    D.f.forEach(function (f) {
      var ang = f.a + t * f.sp * (1.25 - f.rad / 120), wob = Math.sin(t * 2.2 + f.ph) * 2;
      var X = cx + Math.cos(ang) * f.rad * 1.5 + wob, Y = cyy + Math.sin(ang) * f.rad * 0.5 + f.h * 13 + Math.sin(t * 1.4 + f.ph) * 2;
      var dx = X - px, dy = Y - py, dd = Math.sqrt(dx * dx + dy * dy);          /* kaçış */
      var push = dd < 34 ? (34 - dd) / 34 : 0; f.ox += ((dx / (dd || 1)) * push * 26 - f.ox) * 0.12; f.oy += ((dy / (dd || 1)) * push * 26 - f.oy) * 0.12;
      var dep = Math.sin(ang);
      list.push({ x: X + f.ox, y: Y + f.oy, d: dep - (f.far ? 2 : 0), dir: -Math.sin(ang) > 0 ? 1 : -1, far: f.far || dep < -0.6, gl: !f.far && Math.abs(Math.cos(ang)) < 0.08 });
    });
    list.sort(function (a, b) { return a.d - b.d; });
    var drewP = false;
    list.forEach(function (q) {
      if (!drewP && q.d > -0.2) { drewP = true; drawBonito(g, px, py, t); }
      fish(g, q.x, q.y, q.dir, q.gl, q.far);
    });
    if (!drewP) drawBonito(g, px, py, t);
    if (OPT.net) {
      var nk = sm(0, 3.6, t), ncx = 160 + Math.sin(t * 0.7) * 4, rimY = -14 + nk * 92, rx = 30 + nk * 46, ry = 7 + nk * 6, NN = 26, pts = [];
      g.save(); g.globalAlpha = 0.85;
      for (i = 0; i < NN; i++) { var aa = i / NN * Math.PI * 2, wv = Math.sin(t * 2 + i) * 1.5; pts.push([ncx + Math.cos(aa) * rx, rimY + Math.sin(aa) * ry + wv]); }
      pts.forEach(function (q, k) { line(g, ncx, -2, q[0], q[1], '#a8c8b8'); var q2 = pts[(k + 1) % NN]; line(g, q[0], q[1], q2[0], q2[1], '#c8dcc8'); });
      for (var rg = 1; rg < 4; rg++) { var f2 = rg / 4; for (i = 0; i < NN; i++) { var a1 = i / NN * Math.PI * 2, a2 = (i + 1) / NN * Math.PI * 2, yb = -2 + (rimY + 2) * f2; line(g, ncx + Math.cos(a1) * rx * f2, yb + Math.sin(a1) * ry * f2, ncx + Math.cos(a2) * rx * f2, yb + Math.sin(a2) * ry * f2, '#94b4a8'); } }
      g.restore();
      pts.forEach(function (q) { R(g, q[0] - 1, q[1], 3, 2, '#5a6a72'); P(g, q[0] - 1, q[1], '#b8c8d0'); });
    }
    D.bub.forEach(function (b) { var yy = H - ((t * b.sp + b.y) % H), xx = b.x + Math.sin(t * 2 + b.ph) * 1.5; P(g, xx, yy, '#d8fbff'); P(g, xx + 1, yy - 1, '#ffffff'); });
    blit(L, 0, 0);
  }
  function drawBonito(g, x, y, t) {
    if (x < -40 || x > W + 40) return;
    var tail = Math.sin(t * 14) > 0 ? 0 : 1;
    spr(g, Math.round(x) - 16, Math.round(y) - 5, [
      '.........kkkk.............',
      'k......kkbbbbkkk..........',
      'kk...kkbbBbBbBbbkkk.......',
      '.kkkkbbbbbbbbbbbbbbkkk....',
      '..kkbssssssssssssssssbkk..',
      '.kkkwwwwwwwwwwwwwwwwwwsek.',
      'kk...kkwwwwwwwwwwwwwkkk...',
      'k......kkkkkkkkkkkk.......'
    ], { k: '#0b2232', b: '#1f4a6a', B: '#2c6a8e', s: '#7f9cae', w: '#d6e2ea', e: '#0a0a0a' });
    if (tail) { P(g, x - 16, y - 5, '#0b2232'); P(g, x - 16, y + 2, '#0b2232'); }
  }

  /* =====================================================================
     3 — AĞ: yakın plan; balıkçı ağı savurur, ağ açılarak denize iner
     ===================================================================== */
  var cast = null;
  function drawCast(t, u) {
    var tc = t < 1.4 ? t * 0.85 / 1.4 : t < 1.7 ? 0.85 + (t - 1.4) * 0.2 / 0.3 : t < 3.0 ? 1.05 + (t - 1.7) * 0.73 / 1.3 : 1.78 + (t - 3.0);
    if (!cast) {
      cast = { sky: layer(W, H) }; dgrad(cast.sky, 0, 0, W, 112, ['#2e1c50', '#5a2a66', '#963c6c', '#d0586a', '#ef8668', '#f9b678', '#fde0a8']);
      var s = cast.sky.g; halo(s, 176, 110, 56, '#ffd9a8', 0.4); disc(s, 176, 110, 18, '#ffd27a'); disc(s, 176, 109, 16, '#ffe9b0'); disc(s, 173, 106, 8, '#fff6dc');
      R(s, 0, 112, W, 68, '#000');
      cast.sea = layer(W, 68); dgrad(cast.sea, 0, 0, W, 68, ['#e09088', '#a85a78', '#6a3a68', '#3a2650', '#1c1634']);
      cast.boat = layer(130, 50); spr(cast.boat.g, 2, 24, KAYIK.map(function (row) { return row.replace(/./g, function (c) { return c + c; }); }).reduce(function (a, row) { a.push(row); a.push(row); return a; }, []),
        { k: '#1a0f22', W: '#1a0f22', R: '#3a1a2a', B: '#1f1a34', H: '#1a0f22' });
      rim(cast.boat, '#ffc078', 1, 0, 1); rim(cast.boat, '#ffe0a8', 0, -1, 1);
      var r = rng(4); cast.gl = []; for (var i = 0; i < 160; i++) cast.gl.push({ x: r() * W, y: 1 + Math.pow(r(), 1.5) * 66, w: 1 + r() * 4, ph: r() * 7, sp: 2 + r() * 5 });
      cast.sp = []; for (i = 0; i < 70; i++) cast.sp.push({ a: Math.PI * (0.1 + 0.8 * r()), v: 30 + r() * 60, dx: (r() - 0.5) * 40, c: r() });
    }
    var C = cast, L = layer(W, H), g = L.g, i;
    g.drawImage(C.sky.c, 0, 0);
    var sea = layer(W, 68), sg = sea.g; sg.drawImage(C.sea.c, 0, 0);
    C.gl.forEach(function (m) { var x = (m.x + t * m.sp) % W, k = m.y / 66, inC = Math.abs(x - 176) < 6 + k * 50; if (Math.sin(t * 5 + m.ph) < (inC ? -0.4 : 0.6)) return; R(sg, x, m.y, Math.max(1, m.w * (0.5 + k)), 1, inC ? '#ffe3a8' : '#b8667e'); });
    R(sg, 0, 0, W, 1, '#ffd9a6');
    g.drawImage(sea.c, 0, 112);
    var bob = Math.round(Math.sin(t * 1.7) * 1.5), bx = 70, by = 114 + bob;
    /* atış: 0–0.85 kurulma, 0.85–1.05 savurma */
    var arm = tc < 0.85 ? -2.2 - 0.7 * sm(0, 0.85, tc) : tc < 1.05 ? -2.9 + 3.2 * sm(0.85, 1.05, tc) : 0.3 + 0.1 * Math.sin(t * 2);
    var SIL = '#1a0f22', fx = bx + 70, fy = by + 26;
    var fl = layer(70, 60), f = fl.g, ox = 30, oy = 46;                           /* balıkçı silüeti, 1× piksel */
    for (var ry = 0; ry < 22; ry++) { var wdt = 11 + Math.round(2 * ry / 22), lean = Math.round((22 - ry) * 0.12); R(f, ox - 6 + lean, oy - 22 + ry, wdt, 1, SIL); }
    R(f, ox - 1 + 2, oy - 25, 4, 3, SIL); disc(f, ox + 2, oy - 29, 4, SIL); R(f, ox - 3, oy - 35, 10, 3, SIL); R(f, ox + 6, oy - 33, 4, 1, SIL); R(f, ox - 2, oy - 36, 8, 1, SIL);
    var shx = ox + 4, shy = oy - 20, al = 15, ax = shx + Math.cos(arm) * al, ay = shy + Math.sin(arm) * al;
    for (var k2 = 0; k2 <= 14; k2++) R(f, shx + (ax - shx) * k2 / 14 - 1, shy + (ay - shy) * k2 / 14 - 1, 3, 3, SIL);
    R(f, ax - 2, ay - 2, 4, 4, SIL);
    for (k2 = 0; k2 <= 10; k2++) R(f, ox - 3 + k2 * 0.5 - 1, oy - 19 + k2 - 1, 3, 3, SIL);  /* öbür kol: ağ yumağını tutar */
    rim(fl, '#ffc078', 1, 0, 1); rim(fl, '#ffe0a8', 0, -1, 1);
    g.drawImage(fl.c, fx - ox, fy - oy);
    var hl = layer(150, 40), h = hl.g, HL = 120;                                 /* kayık gövdesi, 1× piksel */
    for (var q2 = 0; q2 <= HL; q2++) {
      var uu = q2 / HL, top2 = 14 - (uu > 0.78 ? Math.pow((uu - 0.78) / 0.22, 2) * 12 : 0) - (uu < 0.08 ? Math.pow((0.08 - uu) / 0.08, 2) * 4 : 0);
      var dep = 11 * Math.sqrt(Math.max(0, 1 - Math.pow((uu - 0.46) / 0.56, 2)));
      R(h, 10 + q2, top2, 1, 14 - top2 + dep, SIL); P(h, 10 + q2, 16, '#3a1626'); P(h, 10 + q2, 18, '#1e1838');
    }
    R(h, 10 + HL - 2, -0, 2, 4, SIL);
    rim(hl, '#ffc078', 1, 0, 1); rim(hl, '#ffe0a8', 0, -1, 1);
    g.drawImage(hl.c, bx - 10, by + 12);
    var hx0 = fx - ox + ax, hy0 = fy - oy + ay;
    if (tc < 1.0) { for (i = 0; i < 5; i++) R(g, hx0 - 2 + i, hy0 + (i % 2), 2, 7 - (i % 3), '#d9c08f'); }
    else {
      var ft = Math.min(1, (tc - 1.0) / 0.8), nx = hx0 + 70 * ft, ny = hy0 - 46 * Math.sin(Math.PI * ft) + (150 - hy0) * ft, rad = 3 + 26 * Math.sin(Math.PI / 2 * Math.min(1, ft * 1.3));
      var ry = rad * (0.32 + 0.12 * ft), N = 18, rimPts = [];
      for (i = 0; i < N; i++) { var a = i / N * Math.PI * 2 + t * 2; rimPts.push([nx + Math.cos(a) * rad, ny + Math.sin(a) * ry]); }
      line(g, hx0, hy0, nx, ny - ry, '#c9b183');                          /* el ipi */
      rimPts.forEach(function (p, k) { line(g, nx, ny - ry * 0.4, p[0], p[1], '#d9c08f'); var q = rimPts[(k + 1) % N]; line(g, p[0], p[1], q[0], q[1], '#d9c08f'); });
      for (var ring2 = 1; ring2 < 3; ring2++) for (i = 0; i < N; i++) { var a1 = i / N * Math.PI * 2 + t * 2, a2 = (i + 1) / N * Math.PI * 2 + t * 2, kr = ring2 / 3; line(g, nx + Math.cos(a1) * rad * kr, ny - ry * 0.4 + Math.sin(a1) * ry * kr, nx + Math.cos(a2) * rad * kr, ny - ry * 0.4 + Math.sin(a2) * ry * kr, '#bfa676'); }
      rimPts.forEach(function (p) { R(g, p[0] - 1, p[1], 2, 2, '#7a7a8a'); P(g, p[0] - 1, p[1], '#c8c8d8'); });
      if (tc > 1.78) {   /* sıçrama */
        var st = tc - 1.78;
        C.sp.forEach(function (s) { var sx = nx + s.dx * 0.6 + Math.cos(s.a) * s.v * st * 0.5, sy = 151 - Math.sin(s.a) * s.v * st + 90 * st * st; if (sy < 152) R(g, sx, sy, 2, 2, s.c < 0.5 ? '#ffffff' : '#ffe3c0'); });
        for (i = 0; i < 2; i++) { var rr = st * 70 + i * 6; for (var a3 = 0; a3 < 48; a3++) { var aa = a3 / 48 * Math.PI * 2; P(g, nx + Math.cos(aa) * rr, 152 + Math.sin(aa) * rr * 0.16, '#ffe7c8'); } }
      }
    }
    for (i = 0; i < 3; i++) gull(g, ((t * 22 + i * 110) % (W + 30)) - 15, 30 + i * 14, t + i, '#3a2040');
    var push = 1 + 0.04 * eio(u);           /* hafif yaklaşma */
    O.drawImage(L.c, -W * K * (push - 1) * 0.6, -H * K * (push - 1) * 0.5, W * K * push, H * K * push);
  }

  /* =====================================================================
     4 — LODOS: gece, dalgaya tırmanan fenerli kayık, şimşek, kayalıktaki fener
     ===================================================================== */
  var storm = null;
  function drawStorm(t, u) {
    if (!storm) {
      storm = {}; var r = rng(9); storm.rain = []; for (var i = 0; i < 240; i++) storm.rain.push({ x: r() * (W + 80), y: r() * H, l: 2 + r() * 4, sp: 0.8 + r() * 0.5 });
      storm.cl = ridge(13, W + 300, 8, 1.7); storm.cl2 = ridge(17, W + 300, 6, 1.7); storm.bolt = []; r = rng(23);
      var bx = 104, by = 0; while (by < 96) { var nx = bx + (r() - 0.5) * 16, ny = by + 5 + r() * 8; storm.bolt.push([bx, by, nx, ny]); if (r() < 0.25) storm.bolt.push([nx, ny, nx + (r() - 0.3) * 22, ny + 12 + r() * 10]); bx = nx; by = ny; }
      storm.cliff = ridge(31, 120, 6, 1.6);
    }
    var Sx = storm, L = layer(W, H), g = L.g, i, x;
    var fl = Math.max(0, 1 - Math.abs(t - 0.5) * 7) + 0.7 * Math.max(0, 1 - Math.abs(t - 1.32) * 10);
    var lit = fl > 0.25;
    for (var y = 0; y < 110; y++) R(g, 0, y, W, 1, lit ? mix('#a8b6f0', '#5a6aa8', y / 110) : mix('#05060f', '#141b36', y / 110));
    for (x = 0; x < W; x++) { var c1 = 22 + Sx.cl[(x + Math.round(t * 18)) % (W + 300)] * 1.6, c2 = 44 + Sx.cl2[(x + Math.round(t * 30)) % (W + 300)] * 1.6; R(g, x, 0, 1, c1, lit ? '#6070a8' : '#0c1124'); P(g, x, c1, lit ? '#c8d0ff' : '#1a2242'); R(g, x, c1 + 1, 1, Math.max(0, c2 - c1), lit ? '#7484c0' : '#121a34'); P(g, x, c2, lit ? '#d8e0ff' : '#202a4c'); }
    if (lit) Sx.bolt.forEach(function (s) { line(g, s[0], s[1], s[2], s[3], '#ffffff'); line(g, s[0] + 1, s[1], s[2] + 1, s[3], '#c8d8ff'); });
    /* kayalık ve fener */
    for (x = 0; x < 120; x++) { var ch = 96 + Sx.cliff[x] - Math.max(0, 40 - x) * 0.6; R(g, 200 + x, ch, 1, H - ch, lit ? '#3a3a5a' : '#06070f'); P(g, 200 + x, ch, lit ? '#9aa0c8' : '#1a1e34'); }
    R(g, 262, 48, 10, 40, lit ? '#e8e4f0' : '#2a2a3a'); R(g, 262, 58, 10, 4, lit ? '#c84a42' : '#3a1a1e'); R(g, 262, 72, 10, 4, lit ? '#c84a42' : '#3a1a1e'); R(g, 260, 44, 14, 4, '#141420'); R(g, 263, 38, 8, 6, '#ffe3a0'); R(g, 262, 35, 10, 3, '#141420');
    var ba = Math.PI + Math.sin(t * 1.8) * 0.5;
    g.save(); g.globalAlpha = 0.18; g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(267, 41); g.lineTo(267 + Math.cos(ba - 0.07) * 360, 41 + Math.sin(ba - 0.07) * 360 * 0.4); g.lineTo(267 + Math.cos(ba + 0.07) * 360, 41 + Math.sin(ba + 0.07) * 360 * 0.4); g.closePath(); g.fill(); g.restore();
    halo(g, 267, 41, 9, '#fff2c0', 0.6);
    /* dalgalar: arkadan öne, tepe ışığı ve köpük */
    function wv(x2, b) { return Math.sin(x2 * 0.035 + t * (1.4 + b * 0.25) + b * 1.7) * (5 + b * 2.2) + Math.sin(x2 * 0.09 - t * 2.1 + b) * 1.6; }
    var boatDone = false;
    for (var b = 0; b < 6; b++) {
      var base = 104 + b * 14, body = lit ? mix('#5a6aa8', '#20284a', b / 6) : mix('#141d38', '#04060e', b / 6), crest = lit ? '#c8d4ff' : mix('#3a4a78', '#18203c', b / 6);
      for (x = 0; x < W; x++) {
        var yy = Math.round(base + wv(x, b)), s1 = wv(x + 1, b) - wv(x - 1, b);
        R(g, x, yy, 1, H - yy, body); P(g, x, yy, crest); if (s1 < -0.6) P(g, x, yy + 1, crest);
        if (wv(x, b) < -(4 + b * 2.2) && ((x + b) % 3)) { P(g, x, yy - 1, '#e8f0ff'); P(g, x, yy, '#ffffff'); }
      }
      if (b === 2 && !boatDone) {
        boatDone = true; var kx = 96 + Math.sin(t * 0.7) * 6, ky = base + wv(kx + 30, b) - 3, ang = Math.atan2(wv(kx + 50, b) - wv(kx + 10, b), 40);
        var bl = layer(70, 40); spr(bl.g, 4, 20, KAYIK, { k: '#05060c', W: '#05060c', R: '#05060c', B: '#05060c', H: '#05060c' }); R(bl.g, 30, 4, 1, 17, '#05060c'); R(bl.g, 31, 6, 12, 9, '#090a14');
        rim(bl, lit ? '#e8eeff' : '#ffb070', 0, -1, 1);
        g.save(); g.translate(Math.round(kx + 30), Math.round(ky)); g.rotate(ang); g.drawImage(bl.c, -34, -26); g.restore();
        halo(g, Math.round(kx + 28), Math.round(ky - 12), 6, '#ffd27a', 0.7); P(g, kx + 28, ky - 12, '#ffe9a8');
      }
    }
    g.fillStyle = lit ? 'rgba(230,236,255,0.6)' : 'rgba(150,170,230,0.45)';
    Sx.rain.forEach(function (d) { var rx = (d.x + t * 140 * d.sp) % (W + 80) - 40, ry = (d.y + t * 300 * d.sp) % H; for (var s = 0; s < d.l; s++) g.fillRect(Math.round(rx - s * 0.5), Math.round(ry + s), 1, 1); });
    blit(L, 0, 0);
    if (fl > 0.55) { O.globalAlpha = (fl - 0.55) * 0.9; O.fillStyle = '#eef2ff'; O.fillRect(0, 0, W * K, H * K); O.globalAlpha = 1; }
  }

  /* =====================================================================
     5 — EFSANE: denizin dibinde antik kemer; dev pullu kuyruk kıvrılır, karanlıkta taç ve gözler
     ===================================================================== */
  var leg = null;
  function drawLegend(t, u) {
    if (!leg) {
      leg = { bg: layer(W, H) }; dgrad(leg.bg, 0, 0, W, H, ['#0b2c34', '#072029', '#05161e', '#030d13', '#020709']);
      var r = rng(17), g0 = leg.bg.g; leg.mote = []; for (var i = 0; i < 50; i++) leg.mote.push({ x: r() * W, y: r() * H, ph: r() * 7, s: r() });
      /* antik kemer ve sütunlar */
      var col = '#0a1a1e', hi = '#183a3a';
      [[40, 70], [268, 66]].forEach(function (c) { R(g0, c[0], c[1], 14, H - c[1], col); R(g0, c[0], c[1], 1, H - c[1], hi); R(g0, c[0] - 3, c[1] - 4, 20, 4, col); R(g0, c[0] - 3, c[1] - 4, 20, 1, hi); for (var y2 = c[1] + 8; y2 < H; y2 += 12) R(g0, c[0], y2, 14, 1, '#071214'); });
      for (var a = 0; a <= 60; a++) { var ang = Math.PI + a / 60 * Math.PI, ax = 160 + Math.cos(ang) * 120, ay = 66 + Math.sin(ang) * 40; R(g0, ax - 3, ay - 5, 7, 6, col); P(g0, ax, ay - 5, hi); }
      var fl = ridge(8, W, 3, 1.8); for (var x = 0; x < W; x++) { R(g0, x, 160 + fl[x], 1, 30, '#020a0c'); P(g0, x, 160 + fl[x], '#0f2a2a'); }
      for (i = 0; i < 26; i++) { var cx = 120 + r() * 80, cy = 158 + r() * 6; R(g0, cx, cy, 2, 1, '#8a6a1a'); }   /* altın sikkeler */
      leg.coins = []; for (i = 0; i < 8; i++) leg.coins.push({ x: 120 + r() * 80, y: 157 + r() * 6, ph: r() * 9 });
    }
    var Lg = leg, L = layer(W, H), g = L.g, i;
    g.drawImage(Lg.bg.c, 0, 0);
    g.save(); g.globalAlpha = 0.07 + 0.03 * Math.sin(t); g.fillStyle = '#6fe3c8'; g.beginPath(); g.moveTo(130, 0); g.lineTo(190, 0); g.lineTo(230, H); g.lineTo(90, H); g.closePath(); g.fill(); g.restore();
    Lg.mote.forEach(function (m) { if (Math.sin(t * (0.8 + m.s) + m.ph) > 0.2) P(g, m.x + Math.sin(t * 0.5 + m.ph) * 3, (m.y - t * 3 * (0.5 + m.s) + H) % H, m.s > 0.7 ? '#8ff0d8' : '#2f7a72'); });
    Lg.coins.forEach(function (c) { if (Math.sin(t * 3 + c.ph) > 0.8) { P(g, c.x, c.y, '#fff2b0'); P(g, c.x + 1, c.y - 1, '#ffffff'); } });
    /* kuyruk: sahneyi kateden kalın, gölgeli, pullu boru */
    var head = -0.2 + t * 0.34, N = 150;
    for (i = N; i >= 0; i--) {
      var s = head - i * 0.0075; if (s < -0.3 || s > 1.5) continue;
      var px = W + 30 - s * (W + 80), py = 112 + Math.sin(s * 7.5) * 30 + Math.sin(s * 15) * 4;
      var kk = i / N, rad = Math.max(2, Math.round(16 * Math.sin(Math.PI * Math.min(1, kk * 1.05 + 0.02)) * (kk < 0.15 ? kk / 0.15 * 0.6 + 0.4 : 1)));
      var lt = 0.5 + 0.5 * Math.sin(s * 7.5 + 2.1);
      for (var dy = -rad; dy <= rad; dy++) {
        var hw = Math.round(Math.sqrt(rad * rad - dy * dy)), shade = (dy / rad), ccol;
        if (shade < -0.55) ccol = mix('#1f5a3e', '#4ab87a', lt);
        else if (shade < 0.2) ccol = mix('#0f3324', '#2f8a5a', lt);
        else if (shade < 0.7) ccol = mix('#081e15', '#185a3a', lt);
        else ccol = mix('#3a3012', '#a88a2a', lt);                 /* karın: altın şerit */
        R(g, px - hw, py + dy, 2, 1, ccol);
      }
      if (i % 4 === 0) for (var dy2 = -rad + 2; dy2 < rad * 0.6; dy2 += 3) P(g, px, py + dy2, mix('#2f8a5a', '#8ff0b0', lt * 0.8));
      if (i % 6 === 0) P(g, px, py - rad, mix('#6a5418', '#ffd86a', lt));
    }
    /* karanlıkta: gözler ve taç */
    var eo = sm(2.7, 3.3, t), cr = sm(3.1, 3.7, t);
    if (eo > 0) {
      var ex = 160, ey = 56;
      halo(g, ex, ey, 34, '#2fae8a', 0.35 * eo);
      [-11, 11].forEach(function (o) {
        var op = Math.round(1 + 2 * eo);
        R(g, ex + o - 4, ey - Math.floor(op / 2), 9, op, '#e8d84a'); P(g, ex + o - 5, ey, '#e8d84a'); P(g, ex + o + 5, ey, '#e8d84a');
        R(g, ex + o, ey - Math.floor(op / 2), 1, op, '#120a04');
        halo(g, ex + o, ey, 6, '#fff6a0', 0.5 * eo);
      });
      if (cr > 0) {
        g.globalAlpha = cr;
        spr(g, ex - 10, ey - 30, [
          '....g.....g.....g...',
          '...ggg...ggg...ggg..',
          '...ggg...gtg...ggg..',
          '..ggggg.ggggg.ggggg.',
          '.gggggggggggggggggg.',
          '.gGgGgGgGgGgGgGgGgg.',
          '.gggggggggggggggggg.'
        ], { g: '#c8992a', G: '#ffe08a', t: '#6fe3c8' });
        if (Math.sin(t * 8) > 0.2) { R(g, ex + 9, ey - 36, 1, 5, '#ffffff'); R(g, ex + 7, ey - 34, 5, 1, '#ffffff'); }
        g.globalAlpha = 1;
      }
    }
    blit(L, 0, 0);
  }

  /* =====================================================================
     6 — FİNAL: gece; köy ışıkları, limanda fenerler ve sudaki uzun yansımalar, dönen fener hüzmesi
     ===================================================================== */
  var fin = null;
  function drawFinale(t, u) {
    if (!fin) {
      fin = { sky: layer(W, H) }; dgrad(fin.sky, 0, 0, W, 132, ['#03051a', '#070b26', '#0c1434', '#121c44', '#1b2954', '#273a68', '#344a78']);
      var r = rng(29), i, x; fin.stars = []; for (i = 0; i < 130; i++) fin.stars.push({ x: r() * W, y: r() * 110, b: r(), p: r() * 7 });
      fin.land = layer(W, H); var g = fin.land.g, top = [];
      for (x = 0; x < W; x++) { var tt = x < 120 ? 70 + Math.pow(x / 120, 1.4) * 62 : 132 - Math.max(0, (x - 120)) * 0.0; var n = Math.sin(x * 0.07) * 2 + Math.sin(x * 0.19) * 1; top.push(x < 120 ? tt + n : (x > 250 ? 126 + n * 0.5 : 133)); }
      for (x = 0; x < W; x++) { R(g, x, top[x], 1, 140 - top[x], '#070a1c'); P(g, x, top[x], '#1a2348'); }
      fin.win = []; for (i = 0; i < 90; i++) { var wx = r() * 118, wy = top[Math.round(wx)] + 4 + r() * (132 - top[Math.round(wx)] - 6); if (wy < 131) { R(g, wx - 2, wy - 2, 5, 4, '#0d1228'); fin.win.push({ x: Math.round(wx), y: Math.round(wy), p: r() * 7, c: r() < 0.75 ? '#ffd27a' : '#ffb454' }); } }
      for (x = 250; x < W; x++) R(g, x, top[x], 1, 140 - top[x], '#070a1c');
      /* rıhtım ve lambalar */
      R(g, 118, 131, 140, 3, '#0d1228'); R(g, 118, 131, 140, 1, '#2a3460'); fin.lamps = [];
      for (x = 128; x < 250; x += 18) { R(g, x, 121, 1, 10, '#141a34'); R(g, x - 1, 120, 3, 1, '#141a34'); fin.lamps.push(x); }
      fin.sea = layer(W, 48); dgrad(fin.sea, 0, 0, W, 48, ['#1e2c5a', '#141e44', '#0c1430', '#060a1c']);
      fin.boats = [[150, 140], [196, 143], [232, 138]];
    }
    var F = fin, L = layer(W, H), g = L.g, i;
    g.drawImage(F.sky.c, 0, 0);
    F.stars.forEach(function (s) { if ((0.35 + 0.65 * s.b) * (0.55 + 0.45 * Math.sin(t * 2.5 + s.p)) > 0.45) P(g, s.x, s.y, s.b > 0.9 ? '#ffffff' : '#a8b8ff'); });
    halo(g, 70, 34, 14, '#c8d0ff', 0.25); disc(g, 70, 34, 7, '#f2ecd6'); disc(g, 73, 32, 6, '#0a1030');     /* hilal */
    /* fener hüzmesi (gökyüzünde döner) */
    var ba = Math.PI + 0.25 + Math.sin(t * 0.9) * 0.9;
    g.save(); g.globalAlpha = 0.14; g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(286, 92); g.lineTo(286 + Math.cos(ba - 0.06) * 420, 92 + Math.sin(ba - 0.06) * 420 * 0.42); g.lineTo(286 + Math.cos(ba + 0.06) * 420, 92 + Math.sin(ba + 0.06) * 420 * 0.42); g.closePath(); g.fill(); g.restore();
    g.drawImage(F.land.c, 0, 0);
    F.win.forEach(function (w) { if (Math.sin(t * 2 + w.p) > -0.85) P(g, w.x, w.y, w.c); });
    F.lamps.forEach(function (x) { halo(g, x, 120, 4, '#ffd27a', 0.5); P(g, x, 119, '#fff2c0'); });
    R(g, 282, 96, 8, 30, '#d8d0c0'); R(g, 282, 104, 8, 3, '#a83d2b'); R(g, 282, 114, 8, 3, '#a83d2b'); R(g, 280, 92, 12, 4, '#141420'); R(g, 283, 88, 6, 4, '#fff2c0'); halo(g, 286, 90, 12, '#fff2c0', 0.6);
    var sea = layer(W, 48), sg = sea.g; sg.drawImage(F.sea.c, 0, 0);
    F.lamps.concat([286]).forEach(function (x, k) { for (var j = 0; j < 22; j++) if (Math.sin(t * 3 + j * 1.3 + k) > -0.2) R(sg, x - 1 + Math.round(Math.sin(t * 2 + j * 0.7) * 1.5), 1 + j * 2, j < 8 ? 3 : 2, 1, j < 10 ? '#ffd27a' : '#c8903a'); });
    F.win.forEach(function (w, k) { if (k % 5 || w.x < 60) return; for (var j = 0; j < 8; j++) if (Math.sin(t * 3 + j + k) > 0.3) P(sg, w.x, 2 + j * 3, '#a8802a'); });
    for (i = 0; i < 40; i++) if (Math.sin(t * 2 + i * 1.7) > 0.6) R(sg, (i * 37) % W, 4 + (i * 13) % 40, 3, 1, '#2a3a70');
    g.drawImage(sea.c, 0, 132);
    F.boats.forEach(function (b, k) { var by = b[1] + Math.round(Math.sin(t * 1.4 + k) * 0.8); spr(g, b[0], by, ['k..........k', 'kkkkkkkkkkkk', '.kkkkkkkkkk.'], { k: '#05070f' }); R(g, b[0] + 5, by - 7, 1, 7, '#05070f'); P(g, b[0] + 6, by - 4, '#ffd27a'); halo(g, b[0] + 6, by - 4, 4, '#ffd27a', 0.5); });
    blit(L, 0, 0);
  }

  var OPT = {};
  var SC = { dawn: drawDawn, deep: drawDeep, cast: drawCast, storm: drawStorm, legend: drawLegend, finale: drawFinale };
  window.TBS = {
    opt: function (o) { OPT = o || {}; },
    draw: function (name, t, u) { out.style.display = 'block'; O.setTransform(1, 0, 0, 1, 0, 0); O.globalAlpha = 1; O.fillStyle = '#000'; O.fillRect(0, 0, out.width, out.height); SC[name](t, u); },
    hide: function () { out.style.display = 'none'; }
  };
})();
