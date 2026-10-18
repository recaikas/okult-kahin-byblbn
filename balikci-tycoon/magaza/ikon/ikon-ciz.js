#!/usr/bin/env node
/* Hamsi Koyu — amblem (uygulama simgesi), ayrıntılı sürüm.
   Eski simge (mobile/assets-src/iconart.html) 32×32 mantıksal pikseldi; bu sürüm aynı yerleşimi 128×128 sanat
   pikselinde çizer (her eski piksel = 4×4 yeni piksel) ve 1024'e tam 8× büyütür (en yakın komşu, bulanıklık yok).
   Saf Node: tarayıcı, paket ya da yazı tipi gerekmez; her çalıştırmada bit bit aynı çıktıyı verir.
   Kullanım:  node magaza/ikon/ikon-ciz.js        → magaza/ikon/*.png
   Işık sol üstten gelir. Renk aileleri oyunla aynı: kilim kırmızısı/krem tente, turkuaz-lacivert deniz,
   gümüş hamsi + turuncu yüzgeç, pirinç para, tahta iskele. */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const OUT = __dirname;
const ROOT = path.resolve(__dirname, '..', '..');
const N = 128, UP = 8;   /* 128 × 8 = 1024 */

/* ───────────────────────── PNG yaz / oku ───────────────────────── */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
/* img: {w,h,rgb: Uint8Array w*h*3}. alpha=false → RGB (renk tipi 2, alfa kanalı yok); true → RGBA, tamamen opak. */
function encodePNG(img, alpha) {
  const { w, h, rgb } = img, ch = alpha ? 4 : 3, stride = w * ch + 1, raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (y * w + x) * 3, d = y * stride + 1 + x * ch;
    raw[d] = rgb[s]; raw[d + 1] = rgb[s + 1]; raw[d + 2] = rgb[s + 2]; if (alpha) raw[d + 3] = 255;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = alpha ? 6 : 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function decodePNG(buf) {   /* yalnız 8 bit RGB/RGBA, geçmeli olmayan — eski icon.png için yeterli */
  let p = 8, w, h, ct; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; if (data[8] !== 8 || data[12]) throw new Error('desteklenmeyen PNG'); }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    p += 12 + len;
  }
  const ch = { 2: 3, 6: 4 }[ct]; if (!ch) throw new Error('desteklenmeyen renk tipi ' + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat)), st = w * ch, out = Buffer.alloc(st * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], o = y * (st + 1) + 1;
    for (let i = 0; i < st; i++) {
      const a = i >= ch ? out[y * st + i - ch] : 0, b = y ? out[(y - 1) * st + i] : 0, c = y && i >= ch ? out[(y - 1) * st + i - ch] : 0;
      let v = raw[o + i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * st + i] = v & 255;
    }
  }
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) for (let k = 0; k < 3; k++) rgb[i * 3 + k] = ch === 4 ? Math.round(out[i * 4 + k] * out[i * 4 + 3] / 255) : out[i * 3 + k];
  return { w, h, rgb };
}

/* ───────────────────────── görüntü işlemleri ───────────────────────── */
const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const newImg = (w, h, bg = '#000000') => { const rgb = new Uint8Array(w * h * 3), c = hex(bg); for (let i = 0; i < w * h; i++) rgb.set(c, i * 3); return { w, h, rgb }; };
function nearest(img, s) {
  const o = newImg(img.w * s, img.h * s);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const si = ((y / s | 0) * img.w + (x / s | 0)) * 3, di = (y * o.w + x) * 3; o.rgb[di] = img.rgb[si]; o.rgb[di + 1] = img.rgb[si + 1]; o.rgb[di + 2] = img.rgb[si + 2]; }
  return o;
}
/* Alan ortalamalı küçültme, doğrusal ışıkta (sRGB ortalaması ince açık çizgileri karartır). */
const LIN = new Float32Array(256).map((_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
const toS = v => { v = Math.max(0, Math.min(1, v)); const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; return Math.round(c * 255); };
function areaWeights(src, dst) {
  const s = src / dst, res = [];
  for (let i = 0; i < dst; i++) {
    const a = i * s, b = (i + 1) * s, l = [];
    for (let j = Math.floor(a); j < Math.ceil(b - 1e-9); j++) { const wt = Math.min(b, j + 1) - Math.max(a, j); if (wt > 1e-9) l.push([j, wt / s]); }
    res.push(l);
  }
  return res;
}
function resize(img, W, H) {
  if (W === img.w && H === img.h) return img;
  const wx = areaWeights(img.w, W), wy = areaWeights(img.h, H), tmp = new Float32Array(W * img.h * 3);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < W; x++) for (const [j, wt] of wx[x]) { const si = (y * img.w + j) * 3, di = (y * W + x) * 3; for (let k = 0; k < 3; k++) tmp[di + k] += LIN[img.rgb[si + k]] * wt; }
  const o = newImg(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const acc = [0, 0, 0]; for (const [j, wt] of wy[y]) { const si = (j * W + x) * 3; for (let k = 0; k < 3; k++) acc[k] += tmp[si + k] * wt; } for (let k = 0; k < 3; k++) o.rgb[(y * W + x) * 3 + k] = toS(acc[k]); }
  return o;
}

/* ───────────────────────── palet ───────────────────────── */
/* Her rampa açıktan koyuya. darker()/lighter() rampalar içinde bir basamak oynar — gölge/ışık hep paletten gelir. */
const SEA = ['#f2fbfc', '#bfe6f0', '#5fb0cf', '#2f8aad', '#237a9e', '#1d6c8f', '#175d7c', '#134c66', '#0f3c52', '#0b2e40'];
const RED = ['#e0765c', '#cc5a41', '#b5432f', '#963524', '#77281a', '#4f180f'];
const CRM = ['#fffcf4', '#f4f0e4', '#e2d9c4', '#c8b998', '#9d8b6b', '#5e4f3a'];
const GOLD = ['#fffbe0', '#fff0a8', '#ffd76a', '#ffc94a', '#e8a93a', '#c9952f', '#9a6c1f', '#5c3d12'];
const SILV = ['#ffffff', '#f4f8fa', '#e2eaee', '#cfd8dd', '#b3c3cb', '#8fa7b3', '#7590a0', '#5d7787', '#3e5463', '#24323d'];
const ORNG = ['#ffc690', '#f59a52', '#e8762b', '#c95a1a', '#a24413', '#6e2a0c'];
const WOOD = ['#e7bf86', '#c9975f', '#ab7a48', '#94663a', '#7b522d', '#6f4526', '#4e2f19', '#331d0f'];
const BRASS = ['#fff2c2', '#e8c66a', '#b8913c', '#7a5a22', '#3b2a12'];
const RAMPS = [SEA, RED, CRM, GOLD, SILV, ORNG, WOOD, BRASS];
const LOC = new Map(); RAMPS.forEach((r, ri) => r.forEach((c, i) => LOC.set(c, [ri, i])));
const shift = (c, k) => { const l = LOC.get(c); if (!l) return c; const r = RAMPS[l[0]]; return r[Math.max(0, Math.min(r.length - 1, l[1] + k))]; };
const darker = (c, k = 1) => shift(c, k), lighter = (c, k = 1) => shift(c, -k);

/* ───────────────────────── tuval ───────────────────────── */
const G = new Array(N * N).fill(SEA[5]);
const inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
const set = (x, y, c) => { if (inb(x, y)) G[y * N + x] = c; };
const get = (x, y) => inb(x, y) ? G[y * N + x] : null;
const rect = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, c); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function inPoly(px, py, P) { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
const lerpPts = (P, x) => { if (x <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [x0, y0] = P[i - 1], [x1, y1] = P[i], t = (x - x0) / (x1 - x0), s = t * t * (3 - 2 * t); return y0 + (y1 - y0) * (0.5 * t + 0.5 * s); } return P[P.length - 1][1]; };
/* maske kümesinin dışına 4-komşu kontur; renk fn(içteki komşu) */
function outline(mask, colorOf) {
  const add = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (mask[y * N + x]) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (inb(X, Y) && mask[Y * N + X]) { add.push([x, y, colorOf(mask[Y * N + X])]); break; } }
  }
  for (const [x, y, c] of add) set(x, y, c);
  return add;
}

/* ───────────────────────── 1. deniz ───────────────────────── */
const DOCK_Y = 108;
function seaBase(x, y) {
  /* derinlik: üstte yüzey ışığı, iskeleye doğru koyulaşır; geçişlerde 2 satır dama deseni */
  const bands = [[0, 4], [52, 5], [76, 6], [96, 7]];
  let idx = 4; for (const [y0, i] of bands) if (y >= y0) idx = i;
  for (const [y0, i] of bands.slice(1)) if (y >= y0 - 2 && y < y0 && (x + y) % 2 === 0) idx = i;
  return SEA[idx];
}
for (let y = 0; y < DOCK_Y; y++) for (let x = 0; x < N; x++) set(x, y, seaBase(x, y));
/* dalga sırtları: eski simgedeki açık kısa çizgilerin yerinde, ∩ biçimli küçük dalgalar */
function wave(x0, y0, big) {
  const pts = big ? [[4, 0, 2], [5, 0, 2], [6, 0, 2], [7, 0, 2], [2, 1, 1], [3, 1, 1], [8, 1, 1], [9, 1, 1], [0, 2, 1], [1, 2, 1], [10, 2, 1], [11, 2, 1]]
    : [[2, 0, 2], [3, 0, 2], [4, 0, 2], [1, 1, 1], [5, 1, 1], [0, 2, 1], [6, 2, 1]];
  for (const [dx, dy, k] of pts) { const c = get(x0 + dx, y0 + dy); if (c) set(x0 + dx, y0 + dy, lighter(c, k + 1)); }
  /* tepe köpüğü: yalnız büyük dalgada, iki piksel */
  if (big) { set(x0 + 5, y0 - 1, SEA[1]); set(x0 + 6, y0 - 1, SEA[2]); }
}
[[70, 0, 1], [82, 12, 1], [94, 2, 1]].forEach(([y, off, big], r) => { for (let x = -24 + off + (r % 2) * 6; x < N; x += 24) wave(x, y, big); });
[[58, 4, 0], [64, 16, 0]].forEach(([y, off]) => { for (let x = off; x < N; x += 28) wave(x, y, 0); });
/* ışık yansıması: sol üstten gelen ışığın suda kırık yatay parıltıları (yalnız sol yarıda, sabit yerler) */
for (const [x, y, w] of [[3, 40, 7], [6, 43, 4], [2, 47, 3], [10, 46, 6], [104, 40, 5], [110, 43, 3], [14, 38, 3]]) {
  for (let i = 0; i < w; i++) set(x + i, y, i === 0 || i === w - 1 ? SEA[3] : SEA[2]);
}
/* iskele dibinde köpük: suyun tahtaya çarptığı yer */
{
  const R = rng(7);
  for (let x = 0; x < N; x++) {
    const ph = (x + 3) % 16, bump = ph >= 4 && ph <= 11 ? (ph >= 6 && ph <= 9 ? 3 : 2) : 1;
    for (let k = 0; k <= bump; k++) set(x, DOCK_Y - 1 - k, k === bump ? SEA[1] : (k === 0 ? SEA[2] : SEA[1]));
    if (bump === 3 && (ph === 7 || ph === 8)) set(x, DOCK_Y - 5, SEA[0]);
    set(x, DOCK_Y - 1, SEA[3]);   /* tahtanın hemen önü: köpüğün altı gölgede */
    if (R() < 0.12 && bump === 1) set(x, DOCK_Y - 4, SEA[2]);
  }
}

/* ───────────────────────── 2. tente ───────────────────────── */
const awnBottom = x => { const lx = ((x % 16) + 16) % 16; return 25 + Math.round(6 * Math.sqrt(Math.max(0, 1 - ((lx - 7.5) / 8.2) ** 2))); };
/* tentenin suya düşen gölgesi (sağ alta kayık) */
for (let x = 0; x < N; x++) { const b = awnBottom(x), sb = awnBottom(Math.max(0, x - 3)) + 4; for (let y = b + 1; y <= Math.max(b + 2, sb); y++) set(x, y, darker(get(x, y), y <= sb - 1 ? 2 : 1)); }
for (let i = 0; i < 8; i++) {
  const R = i % 2 ? CRM : RED, x0 = i * 16;
  for (let lx = 0; lx < 16; lx++) {
    const x = x0 + lx, b = awnBottom(x);
    /* kıvrım: her şerit hafif bir boru gibi — solu ışıkta, sağı gölgede */
    const fold = lx <= 1 ? 0 : lx <= 10 ? 1 : lx <= 13 ? 2 : 3;
    for (let y = 0; y <= b; y++) {
      let t = fold;
      if (y <= 1) t += 1;                       /* çatı saçağının gölgesi */
      if (y === 20) t = Math.max(t + 1, 2);     /* dikiş katı: içe kıvrılan kumaş */
      if (y === 21) t = Math.max(0, t - 1);     /* katın ışık alan kenarı */
      if (y >= 22 && lx >= 2 && lx <= 12) t = Math.max(0, t - (y >= 23 && y <= 25 && lx <= 5 ? 1 : 0));   /* sarkan pul: biraz öne döner */
      if (y === b - 1) t = Math.max(t + 1, 2);  /* pul kenarı içe kıvrılır */
      if (y === b) t = 5;                       /* koyu kontur */
      set(x, y, R[Math.min(R.length - 1, t)]);
    }
    if (lx % 3 === 1 && lx > 0 && lx < 15) set(x, 23, R[Math.min(4, fold + 2)]);   /* dikiş izi */
  }
  /* şerit sınırında kumaş birleşim çizgisi */
  for (let y = 2; y < 25; y++) set(x0 + 15, y, darker(get(x0 + 15, y), 1));
}
/* pullar arasındaki V boşluğun iki yanını konturla */
for (let x = 0; x < N; x++) {
  const b = awnBottom(x);
  for (const dx of [-1, 1]) { const X = x + dx; if (!inb(X, 0)) continue; const bX = awnBottom(X); for (let y = bX + 1; y <= b; y++) { const own = Math.floor(x / 16) % 2 ? CRM : RED; if (Math.floor(X / 16) !== Math.floor(x / 16)) set(x, y, own[5]); } }
}

/* ───────────────────────── 3. altın para ───────────────────────── */
{
  const cx = 106.5, cy = 19.5, r = 11.3, T = 3, mask = new Uint8Array(N * N);
  const face = (x, y) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r;
  const side = (x, y) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy - T) <= r;
  /* önce gölge: tenteye/suya düşen yumuşak koyu leke */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((face(x - 2, y - 3) || side(x - 2, y - 3)) && !face(x, y) && !side(x, y)) set(x, y, darker(get(x, y), 1));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (face(x, y)) mask[y * N + x] = 1; else if (side(x, y)) mask[y * N + x] = 2; else continue;
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy), lit = (-dx - dy) / Math.SQRT2 / Math.max(d, 0.01);
    let c;
    if (mask[y * N + x] === 2) c = (x % 2 ? GOLD[5] : GOLD[6]);                      /* tırtıllı kenar */
    else if (d > r - 2.2) c = lit > 0.35 ? GOLD[1] : lit > -0.3 ? GOLD[3] : GOLD[4];    /* dış halka */
    else if (d > r - 3.4) c = lit > 0.2 ? GOLD[5] : lit < -0.4 ? GOLD[1] : GOLD[4];     /* içe basık pah: ışığın tersi */
    else c = lit > 0.55 && d > 4.5 ? GOLD[2] : GOLD[3];                                 /* yüz */
    set(x, y, c);
  }
  /* kabartma çubuk (eski simgedeki dikey işaret): solu/üstü ışıkta, sağı/altı gölgede */
  const bx = 105, by = 14, bh = 11;
  for (let y = by; y < by + bh; y++) { set(bx, y, GOLD[1]); set(bx + 1, y, GOLD[4]); set(bx + 2, y, GOLD[6]); }
  set(bx, by - 1, GOLD[1]); set(bx + 1, by - 1, GOLD[1]); set(bx + 1, by + bh, GOLD[6]); set(bx, by + bh, GOLD[5]); set(bx - 1, by + 1, GOLD[2]);
  /* parlama: yüzün sol üst halkasında tek, sabit bir ışık */
  for (const [x, y] of [[99, 13], [100, 12], [101, 11], [99, 14]]) set(x, y, GOLD[0]);
  outline(mask, () => GOLD[7]);
}

/* ───────────────────────── 4. hamsi ───────────────────────── */
{
  const TOP = [[22, 61], [23, 57], [25, 53], [28, 50], [33, 47.5], [40, 46], [52, 45.3], [62, 45.6], [70, 46.8], [77, 50], [83, 54], [88, 57]];
  const BOT = [[22, 69], [23, 72], [25, 75.5], [28, 78.5], [33, 81], [40, 82.6], [52, 83.2], [62, 82.6], [70, 80.6], [77, 76.6], [83, 72.4], [88, 70.5]];
  const X0 = 22, X1 = 88;
  const top = x => lerpPts(TOP, x), bot = x => lerpPts(BOT, x);
  const TAIL = [[86, 57], [90, 51], [95, 46], [99, 41], [103, 39.5], [102.5, 47], [100, 55], [97, 63.5], [100, 72], [102.5, 81], [103, 89.5], [99, 88], [95, 84], [90, 77], [86, 71]];
  const DORS = [[48, 47], [51, 42], [55, 38], [59, 36], [63, 37], [67, 41], [71, 47.5]];
  const ANAL = [[52, 82], [54, 87], [57, 90.5], [61, 92], [65, 91], [67, 87], [68, 81.5]];
  const PECT = [[47, 69], [51, 67.5], [56, 68.5], [61, 72], [62, 76], [57, 75.5], [51, 73]];
  const M = new Uint8Array(N * N);   /* 1 gövde, 2 yüzgeç */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + 0.5, py = y + 0.5;
    if (px >= X0 && px <= X1 && py >= top(px) && py <= bot(px)) M[y * N + x] = 1;
    else if (inPoly(px, py, TAIL) || inPoly(px, py, DORS) || inPoly(px, py, ANAL)) M[y * N + x] = 2;
  }
  /* suya düşen gölge */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = x - 3, Y = y - 4; if (inb(X, Y) && M[Y * N + X] && !M[y * N + x] && y < DOCK_Y - 2) { const c = get(x, y); if (LOC.get(c) && LOC.get(c)[0] === 0) set(x, y, darker(c, 1)); } }

  /* gövde: metalik rampa — sırt mavimsi, hemen altında parlak şerit, orta gümüş, yanal parlak çizgi, koyu karın, altta yansıyan ışık */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (M[y * N + x] !== 1) continue;
    const px = x + 0.5, t = top(px), b = bot(px), v = (y + 0.5 - t) / (b - t), tailw = x > 80;
    let i;
    if (v < 0.11) i = 5;
    else if (v < 0.24) i = tailw ? 3 : 1;
    else if (v < 0.31) i = 2;
    else if (v < 0.52) i = 3;
    else if (v < 0.58) i = 2;
    else if (v < 0.63) i = 4;
    else if (v < 0.84) i = 5;
    else if (v < 0.92) i = 6;
    else i = 5;
    if (x < 27 && i >= 3 && i <= 5) i -= 1;   /* burun ışığa dönük */
    set(x, y, SILV[i]);
    /* pul dokusu: çapraz kafes, bir basamak koyu; parlak şeritte ve başta yok */
    const onLattice = (x + y) % 6 === 0 || (x - y + 600) % 6 === 0;
    if (x > 49 && x < 84 && onLattice && ((v > 0.31 && v < 0.52) || (v > 0.63 && v < 0.9))) set(x, y, SILV[i + 1]);
    /* her pulun sol üst köşesinde ışık kırığı: metalik parlaklık */
    if (x > 49 && x < 82 && (x + y) % 6 === 2 && (x - y + 600) % 6 === 4 && v > 0.31 && v < 0.5) set(x, y, SILV[1]);
  }
  /* sırt çizgisi: sırtın hemen altında koyu ince hat */
  for (let x = 30; x < 84; x++) { const y = Math.floor(top(x + 0.5) + 1.2); if (M[y * N + x] === 1) set(x, y, SILV[6]); }
  /* solungaç kapağı: ")" eğrisi, önü ışıkta */
  for (let y = 50; y < 81; y++) {
    const gx = Math.round(46 - 3.2 * ((y - 64.5) / 16) ** 2);
    if (M[y * N + gx] !== 1) continue;
    set(gx, y, darker(get(gx, y), 2)); if (M[y * N + gx - 1] === 1) set(gx - 1, y, lighter(get(gx - 1, y), 1));
  }
  /* ağız: burnun altında koyu kırmızı çizgi, dudak ışığı */
  for (let x = 22; x <= 28; x++) set(x, x < 27 ? 69 : 70, '#6b2a20');
  for (let x = 23; x <= 26; x++) set(x, 70, '#8a3a2a');
  set(22, 68, '#8a3a2a');
  /* yüzgeçler: turuncu, ışınlar koyu, ön/üst kenarı açık */
  const fins = [[TAIL, [86, 64]], [DORS, [52, 47]], [ANAL, [55, 82]]];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (M[y * N + x] === 2) set(x, y, ORNG[2]);
  /* kuyruk: köke yakın bölge koyu (eski simgedeki koyu turuncu iç), ışınlar yelpaze */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (M[y * N + x] !== 2) continue;
    const inTail = inPoly(x + 0.5, y + 0.5, TAIL);
    if (inTail) {
      const dx = x - 86, dy = y - 64, ang = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
      if (d < 9 && Math.abs(dy) < 8) set(x, y, ORNG[3]);
      const ray = Math.round(ang / 0.17); if (Math.abs(ang / 0.17 - ray) < 0.22 && d > 6 && ray % 2 === 0) set(x, y, d < 9 ? ORNG[4] : ORNG[3]);
      if (dy < -2 && !inPoly(x + 0.5, y - 0.5, TAIL)) set(x, y, ORNG[1]);   /* üst lob kenar ışığı */
      if (dy > 2 && !inPoly(x + 0.5, y + 1.5, TAIL)) set(x, y, ORNG[3]);    /* alt lob gölge */
    } else {
      const isD = inPoly(x + 0.5, y + 0.5, DORS);
      const base = isD ? [52, 47] : [55, 82];
      const dx = x - base[0], dy = y - base[1];
      if ((dx - (isD ? -dy : dy) * 0.9) % 4 === 0 && Math.abs(dy) > 1) set(x, y, ORNG[3]);
      if (isD && !inPoly(x + 0.5, y - 0.5, DORS)) set(x, y, ORNG[1]);
      if (!isD && !inPoly(x + 0.5, y + 1.5, ANAL)) set(x, y, ORNG[3]);
    }
  }
  /* yüzgeç–gövde birleşim çizgisi */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (M[y * N + x] === 2) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (M[(y + dy) * N + x + dx] === 1) { set(x, y, ORNG[4]); break; }
  /* göğüs yüzgeci: gövdenin üstünde yarı saydam turuncu */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (M[y * N + x] !== 1 || !inPoly(x + 0.5, y + 0.5, PECT)) continue;
    const edge = !inPoly(x + 0.5, y - 0.5, PECT) || !inPoly(x - 0.5, y + 0.5, PECT);
    const low = !inPoly(x + 0.5, y + 1.5, PECT) || !inPoly(x + 1.5, y + 0.5, PECT);
    set(x, y, low ? ORNG[4] : edge ? ORNG[1] : (x - y) % 3 === 0 ? ORNG[3] : ORNG[2]);
  }
  /* göz: gümüş halka, koyu bebek, sol üstte ışık */
  const ex = 36, ey = 59;
  for (let y = ey - 6; y <= ey + 6; y++) for (let x = ex - 6; x <= ex + 6; x++) {
    const d = Math.hypot(x + 0.5 - (ex + 0.5), y + 0.5 - (ey + 0.5));
    if (d <= 5.2) set(x, y, SILV[8]);
    if (d <= 4.3) set(x, y, d > 3.3 && (x + y) < ex + ey ? SILV[0] : SILV[2]);
    const dp = Math.hypot(x + 0.5 - (ex + 1), y + 0.5 - (ey + 1));
    if (dp <= 3.0) set(x, y, '#16161c');
  }
  rect(ex - 1, ey - 1, 2, 2, '#ffffff'); set(ex + 2, ey + 2, '#4c5c6a');
  /* kontur: gövde lacivert-gri, yüzgeç koyu kızıl kahve */
  outline(M, m => m === 1 ? SILV[9] : ORNG[5]);
  /* ağız önünde kabarcıklar */
  const bubble = (bx, by, r) => { for (let y = by - 3; y <= by + 3; y++) for (let x = bx - 3; x <= bx + 3; x++) { const d = Math.hypot(x - bx, y - by); if (d <= r + 0.5 && d > r - 0.6) set(x, y, (x < bx && y < by) ? SEA[1] : SEA[3]); } set(bx - 1, by - 1, SEA[0]); };
  bubble(15, 60, 2.2); bubble(11, 52, 1.6); set(16, 45, SEA[2]); set(16, 44, SEA[1]);
}

/* ───────────────────────── 5. iskele tahtası ───────────────────────── */
{
  const R = rng(1903);
  /* üst kiriş: ışıklı kenar, altında gölge */
  for (let x = 0; x < N; x++) { set(x, DOCK_Y, WOOD[0]); set(x, DOCK_Y + 1, WOOD[1]); set(x, DOCK_Y + 2, WOOD[1]); set(x, DOCK_Y + 3, WOOD[2]); set(x, DOCK_Y + 4, WOOD[6]); }
  for (let x = 0; x < N; x++) if (R() < 0.25) set(x, DOCK_Y + 2, WOOD[2]);
  /* tahtalar: 20 piksel genişlik (eski simgedeki 5 piksel aralık × 4) */
  for (let y = DOCK_Y + 5; y < N; y++) for (let x = 0; x < N; x++) set(x, y, WOOD[2]);
  for (let p = 0; p < 7; p++) {
    const x0 = p * 20 - 2, x1 = x0 + 20;
    /* damar: uzun yatay çizgiler, bazen açık bazen koyu */
    for (let k = 0; k < 6; k++) {
      const y = DOCK_Y + 6 + Math.floor(R() * 14), xs = x0 + 2 + Math.floor(R() * 8), len = 5 + Math.floor(R() * 10), dark = R() < 0.65;
      for (let x = xs; x < Math.min(x1 - 1, xs + len); x++) set(x, y, dark ? WOOD[3] : WOOD[1]);
    }
    /* budak */
    if (p % 3 === 1) { const kx = x0 + 6 + Math.floor(R() * 8), ky = DOCK_Y + 9 + Math.floor(R() * 8); set(kx, ky, WOOD[5]); set(kx + 1, ky, WOOD[4]); set(kx - 1, ky, WOOD[3]); set(kx + 2, ky, WOOD[3]); set(kx, ky - 1, WOOD[3]); set(kx + 1, ky + 1, WOOD[3]); }
    /* ek yeri: 2 piksel koyu yarık, sağında ışık alan tahta kenarı */
    for (let y = DOCK_Y + 5; y < N; y++) { set(x0, y, WOOD[6]); set(x0 + 1, y, WOOD[5]); set(x0 + 2, y, WOOD[1]); set(x1 - 1, y, WOOD[3]); }
    /* pirinç çiviler: tahtanın üst ve alt ucunda */
    for (const ny of [DOCK_Y + 7, N - 4]) for (const nx of [x0 + 4, x1 - 4]) { set(nx, ny, BRASS[2]); set(nx + 1, ny, BRASS[3]); set(nx, ny + 1, BRASS[3]); set(nx + 1, ny + 1, BRASS[4]); set(nx, ny, BRASS[1]); set(nx - 1, ny, WOOD[3]); set(nx + 2, ny + 1, WOOD[4]); }
  }
  /* kiriş çivileri */
  for (let x = 8; x < N; x += 20) { set(x, DOCK_Y + 2, BRASS[1]); set(x + 1, DOCK_Y + 2, BRASS[3]); }
  /* en alt: hafif koyulaşma, simge zemine otursun */
  for (let x = 0; x < N; x++) { set(x, N - 1, darker(get(x, N - 1), 1)); }
}

/* ───────────────────────── 6. yazı: HAMSİ KOYU ───────────────────────── */
/* Elle çizilmiş kalın piksel harfler (2 piksel kalem). Krem dolgu, alt iki satır bir ton koyu, 1 piksel koyu kahve
   kontur, sağ alta 1 piksel gölge. 60 piksel ve altında yazı zaten okunmaz; tasarım tente + hamsi ile tanınır. */
const FONT = {
  H: ['##..##', '##..##', '##..##', '##..##', '######', '######', '##..##', '##..##', '##..##', '##..##'],
  A: ['.####.', '######', '##..##', '##..##', '##..##', '######', '######', '##..##', '##..##', '##..##'],
  M: ['##....##', '###..###', '########', '##.##.##', '##.##.##', '##....##', '##....##', '##....##', '##....##', '##....##'],
  S: ['.#####', '######', '##....', '##....', '#####.', '.#####', '....##', '....##', '######', '#####.'],
  'İ': ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '######', '######'],
  K: ['##..##', '##..##', '##.##.', '####..', '###...', '###...', '####..', '##.##.', '##..##', '##..##'],
  O: ['.####.', '######', '##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '######', '.####.'],
  Y: ['##..##', '##..##', '##..##', '##..##', '######', '.####.', '..##..', '..##..', '..##..', '..##..'],
  U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '######', '.####.'],
  E: ['######', '######', '##....', '##....', '#####.', '#####.', '##....', '##....', '######', '######'],
  N: ['##..##', '###.##', '###.##', '######', '######', '##.###', '##.###', '##..##', '##..##', '##..##'],
  X: ['##..##', '##..##', '.####.', '.####.', '..##..', '..##..', '.####.', '.####.', '##..##', '##..##'],
  0: ['.####.', '######', '##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '######', '.####.'],
  1: ['..##..', '.###..', '####..', '..##..', '..##..', '..##..', '..##..', '..##..', '######', '######'],
  2: ['.####.', '######', '##..##', '....##', '...###', '..###.', '.###..', '###...', '######', '######'],
  3: ['#####.', '######', '....##', '....##', '.####.', '.####.', '....##', '....##', '######', '#####.'],
  4: ['##..##', '##..##', '##..##', '##..##', '######', '######', '....##', '....##', '....##', '....##'],
  6: ['.####.', '######', '##....', '##....', '#####.', '######', '##..##', '##..##', '######', '.####.'],
  8: ['.####.', '######', '##..##', '##..##', '.####.', '######', '##..##', '##..##', '######', '.####.'],
  9: ['.####.', '######', '##..##', '##..##', '######', '.#####', '....##', '....##', '######', '#####.'],
  ' ': ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
};
/* metni maske olarak ver: [{x,y}] ve genişlik */
function textMask(str, gap = 2) {
  const pts = []; let x = 0;
  for (const ch of str) {
    const g = FONT[ch]; if (!g) throw new Error('yazı tipinde yok: ' + ch);
    g.forEach((row, y) => [...row].forEach((c, i) => { if (c === '#') pts.push([x + i, y]); }));
    if (ch === 'İ') { pts.push([x + 2, -3], [x + 3, -3], [x + 2, -2], [x + 3, -2]); }
    x += g[0].length + gap;
  }
  return { pts, w: x - gap };
}
{
  const { pts, w } = textMask('HAMSİ KOYU');
  const ox = Math.round((N - w) / 2), oy = 113;
  const M = new Uint8Array(N * N); for (const [x, y] of pts) if (inb(ox + x, oy + y)) M[(oy + y) * N + ox + x] = 1;
  /* gölge: kontur dahil şeklin sağ alta kaymış hali */
  const sh = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (M[y * N + x]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx + 1, Y = y + dy + 1; if (inb(X, Y)) sh[Y * N + X] = 1; }
  for (let i = 0; i < N * N; i++) if (sh[i]) G[i] = '#4a2a15';
  /* kontur: 8 komşu, kalın ve kesintisiz */
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (M[y * N + x]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) set(x + dx, y + dy, '#2e1a0c');
  for (const [x, y] of pts) set(ox + x, oy + y, y >= 8 ? '#e9cf97' : y <= 0 ? '#fffaf0' : '#fff1c9');
}

/* ───────────────────────── çıktılar ───────────────────────── */
const art = newImg(N, N);
for (let i = 0; i < N * N; i++) art.rgb.set(hex(G[i]), i * 3);
const big = nearest(art, UP);
const save = (name, img, alpha = false) => fs.writeFileSync(path.join(OUT, name), encodePNG(img, alpha));
save('icon-1024.png', big);
for (const s of [180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20]) save(`icon-${s}.png`, resize(big, s, s));
save('play-512.png', resize(big, 512, 512), true);   /* Google Play: 32 bit PNG ister */
for (const s of [192, 48]) save(`android-${s}.png`, resize(big, s, s), true);
save('favicon-32.png', resize(big, 32, 32), true);
save('favicon-192.png', resize(big, 192, 192), true);

/* ───────────────────────── karşılaştırma ───────────────────────── */
{
  const old = decodePNG(fs.readFileSync(path.join(ROOT, 'icon.png')));
  const W = 1168, H = 1200, C = newImg(W, H, '#efe8da');
  const blit = (img, X, Y) => { for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const s = (y * img.w + x) * 3, d = ((Y + y) * W + X + x) * 3; C.rgb[d] = img.rgb[s]; C.rgb[d + 1] = img.rgb[s + 1]; C.rgb[d + 2] = img.rgb[s + 2]; } };
  const fill = (X, Y, w, h, c) => { const v = hex(c); for (let y = Y; y < Y + h; y++) for (let x = X; x < X + w; x++) C.rgb.set(v, (y * W + x) * 3); };
  const label = (str, X, Y, s, c) => { const { pts } = textMask(str); for (const [x, y] of pts) fill(X + x * s, Y + (y + 3) * s, s, s, c); };
  /* iOS simge maskesi: süper elips (n=5), 4×4 alt örneklemeli yumuşak kenar; maske dışı arka plan rengine karışır */
  const BG = '#1c2733';
  const roundMask = img => {
    const S = img.w, b = hex(BG), o = newImg(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let a = 0; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const u = Math.abs(2 * (x + (i + 0.5) / 4) / S - 1), v = Math.abs(2 * (y + (j + 0.5) / 4) / S - 1); if (u ** 5 + v ** 5 <= 1) a++; }
      a /= 16; const s = (y * S + x) * 3;
      for (let k = 0; k < 3; k++) o.rgb[s + k] = toS(LIN[img.rgb[s + k]] * a + LIN[b[k]] * (1 - a));
    }
    return o;
  };
  label('ESKİ', 48, 22, 3, '#3d2413'); label('YENİ', 608, 22, 3, '#3d2413');
  blit(resize(old, 512, 512), 48, 80); blit(resize(big, 512, 512), 608, 80);
  fill(0, 640, W, H - 640, BG);
  [['ESKİ', old], ['YENİ', big]].forEach(([name, src], r) => {
    const Y0 = 670 + r * 265, Yi = Y0 + 40; let X = 48;
    label(name, 48, Y0, 2, '#efe8da');
    for (const s of [180, 60, 29]) { blit(roundMask(resize(src, s, s)), X, Yi); label(String(s), X, Yi + 186, 2, '#9fb3c3'); X += s + 48; }
    /* küçük boyların gerçek pikselleri büyütülmüş: 60 → ×3, 29 → ×6 (en yakın komşu) */
    blit(nearest(roundMask(resize(src, 60, 60)), 3), X + 40, Yi); label('60 X3', X + 40, Yi + 186, 2, '#9fb3c3');
    blit(nearest(roundMask(resize(src, 29, 29)), 6), X + 268, Yi); label('29 X6', X + 268, Yi + 186, 2, '#9fb3c3');
  });
  save('karsilastirma.png', C);
}
console.log('yazıldı:', fs.readdirSync(OUT).filter(f => f.endsWith('.png')).join(', '));
