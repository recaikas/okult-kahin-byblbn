/* devrim görselleri için tarayıcı içi piksel çizim yardımcıları (uret-devrim.js sayfaya enjekte eder) */
var W = 1600, H = 900;
function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; c.g = c.getContext('2d'); c.g.imageSmoothingEnabled = false; return c; }
function load(src) { return new Promise(function (r, j) { var i = new Image(); i.onload = function () { r(i); }; i.onerror = j; i.src = src; }); }
var _hx = {};
function hx(c) { if (_hx[c]) return _hx[c]; var s = c; if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]; return (_hx[c] = [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]); }
function th(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
function mix(a, b, t) { var A = hx(a), B = hx(b); return th([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
function dark(c, t) { return mix(c, '#20142a', t); }
function lite(c, t) { return mix(c, '#fffbe8', t); }
var BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map(function (r) { return r.map(function (v) { return (v + 0.5) / 16; }); });
function hash(a, b) { var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function R(g, x, y, w, h, c, a) { g.globalAlpha = a == null ? 1 : a; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); g.globalAlpha = 1; }
function P(g, x, y, c, a) { R(g, x, y, 1, 1, c, a); }
/* bayer geçişli renk rampası seçimi */
function rp(cols, f, x, y) { f = Math.max(0, Math.min(0.9999, f)); var q = f * (cols.length - 1), i = Math.floor(q); return cols[(q - i) > BAY[y & 3][x & 3] ? Math.min(cols.length - 1, i + 1) : i]; }
function vgrad(g, x0, y0, w, h, cols) { for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) P(g, x0 + x, y0 + y, rp(cols, y / h, x0 + x, y0 + y)); }
/* düşük çözünürlüklü tuvali tam ölçeğe bas */
function up(G, c, x, y, s) { G.imageSmoothingEnabled = false; G.drawImage(c, x, y, c.width * s, c.height * s); }
/* opak piksellerin çevresine 1 px kontur */
function outline(c, col) {
  var w = c.width, h = c.height, o = mk(w + 2, h + 2), d = c.g.getImageData(0, 0, w, h).data, A = hx(col), od = o.g.createImageData(w + 2, h + 2), D = od.data;
  function al(x, y) { return x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]; }
  for (var y = -1; y <= h; y++) for (var x = -1; x <= w; x++) {
    var i = ((y + 1) * (w + 2) + x + 1) * 4;
    if (al(x, y) > 100) { var j = (y * w + x) * 4; D[i] = d[j]; D[i + 1] = d[j + 1]; D[i + 2] = d[j + 2]; D[i + 3] = 255; }
    else if (al(x - 1, y) > 100 || al(x + 1, y) > 100 || al(x, y - 1) > 100 || al(x, y + 1) > 100) { D[i] = A[0]; D[i + 1] = A[1]; D[i + 2] = A[2]; D[i + 3] = 255; }
  }
  o.g.putImageData(od, 0, 0); return o;
}
/* metin: piksel fontu eşiklenir (yumuşak kenar yok), isteğe bağlı kontur/gölge, s katı büyütülür */
function txt(G, str, x, y, o) {
  o = o || {}; var sz = o.size || 10, s = o.s || 1, f = (o.w || 400) + ' ' + sz + 'px "Pixelify Sans"';
  var m = mk(4, 4); m.g.font = f; var tw = Math.ceil(m.g.measureText(str).width) + 4, tht = Math.ceil(sz * 1.4) + 4;
  var c = mk(tw, tht); c.g.font = f; c.g.textBaseline = 'top'; c.g.fillStyle = o.col || '#f4e9d2'; c.g.fillText(str, 2, 1);
  var id = c.g.getImageData(0, 0, tw, tht), d = id.data, C = hx(o.col || '#f4e9d2');
  for (var i = 0; i < d.length; i += 4) { if (d[i + 3] >= (o.thr || 120)) { d[i] = C[0]; d[i + 1] = C[1]; d[i + 2] = C[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
  c.g.putImageData(id, 0, 0);
  if (o.ol) c = outline(c, o.ol);
  var ww = c.width * s, ax = o.al === 'c' ? -ww / 2 : o.al === 'r' ? -ww : 0;
  if (o.sh) { var sc = mk(c.width, c.height); sc.g.drawImage(c, 0, 0); sc.g.globalCompositeOperation = 'source-in'; sc.g.fillStyle = o.sh; sc.g.fillRect(0, 0, sc.width, sc.height); up(G, sc, Math.round(x + ax), Math.round(y + s), s); }
  up(G, c, Math.round(x + ax), Math.round(y), s);
  return ww;
}
function tw(str, size, s, wt) { var m = mk(4, 4); m.g.font = (wt || 400) + ' ' + size + 'px "Pixelify Sans"'; return (Math.ceil(m.g.measureText(str).width) + 4) * (s || 1); }
/* oyunun arayüz paneli (koyu lacivert, üst ışık, koyu kenar, isteğe bağlı altın şerit) — düşük çözünürlükte */
function panel(g, x, y, w, h, o) {
  o = o || {}; var f = o.fill || '#14293c', e = o.edge || '#0a1a27';
  R(g, x + 1, y, w - 2, h, e); R(g, x, y + 1, w, h - 2, e);
  R(g, x + 1, y + 1, w - 2, h - 2, f);
  R(g, x + 2, y + 1, w - 4, 1, o.hi || lite(f, 0.18)); R(g, x + 1, y + h - 2, w - 2, 1, dark(f, 0.35));
  if (o.trim) { R(g, x + 2, y + 2, w - 4, 1, o.trim); R(g, x + 2, y + h - 3, w - 4, 1, o.trim); R(g, x + 2, y + 2, 1, h - 4, o.trim); R(g, x + w - 3, y + 2, 1, h - 4, o.trim); }
}
/* satır dizisinden sprite */
function spr(rows, pal) { var c = mk(rows[0].length, rows.length); rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var k = r[x]; if (pal[k]) P(c.g, x, y, pal[k]); } }); return c; }
var ICN = {};
function icon(n) { if (ICN[n]) return ICN[n]; var I = window.GICONS[n]; return (ICN[n] = spr(I, window.GIPAL)); }
/* görüntü süzgeci: fn(r,g,b,x,y) → [r,g,b] */
function filt(img, sx, sy, sw, sh, fn) {
  var c = mk(sw, sh); c.g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  var id = c.g.getImageData(0, 0, sw, sh), d = id.data;
  for (var y = 0; y < sh; y++) for (var x = 0; x < sw; x++) { var i = (y * sw + x) * 4, v = fn(d[i], d[i + 1], d[i + 2], x, y); d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; }
  c.g.putImageData(id, 0, 0); return c;
}
function lum(r, g, b) { return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function ramp(cols, f) { f = Math.max(0, Math.min(1, f)); var q = f * (cols.length - 1), i = Math.min(cols.length - 2, Math.floor(q)), t = q - i, A = hx(cols[i]), B = hx(cols[i + 1]); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }
var SEPIA = ['#2c231a', '#3d3022', '#5a4731', '#6b5a40', '#8f7a57', '#b9a171', '#d9c9a3', '#efe4c9'];
function sepia(r, g, b) { return ramp(SEPIA, Math.pow(lum(r, g, b), 0.9) * 1.05); }
function faded(r, g, b) { var l = lum(r, g, b) * 255, k = 0.5; r = r + (l - r) * k; g = g + (l - g) * k; b = b + (l - b) * k;
  r = 38 + r * 0.82 + 14; g = 30 + g * 0.8 + 6; b = 34 + b * 0.68; return [r * 1.02, g, b]; }
function vivid(r, g, b) { var l = lum(r, g, b) * 255, k = 1.22; r = l + (r - l) * k; g = l + (g - l) * k; b = l + (b - l) * k; return [(r - 128) * 1.05 + 130, (g - 128) * 1.05 + 130, (b - 128) * 1.05 + 128]; }
/* Karadeniz kıyı çizgisi (boylam, enlem) — saat yönünde, İstanbul Boğazı'ndan */
var KARADENIZ = [[29.05, 41.22], [28.6, 41.35], [28.05, 41.62], [27.75, 42.0], [27.5, 42.45], [27.9, 42.75], [27.95, 43.2], [28.55, 43.38], [28.65, 44.1], [28.9, 44.6], [29.6, 44.85], [29.75, 45.25], [30.3, 45.9], [30.75, 46.45], [31.4, 46.6], [32.0, 46.4], [32.6, 46.0], [33.6, 45.95], [33.4, 45.25], [33.6, 44.9], [33.5, 44.6], [34.1, 44.4], [34.6, 44.75], [35.4, 45.0], [36.0, 45.0], [36.5, 45.3], [36.6, 45.1], [37.3, 44.95], [37.8, 44.65], [38.6, 44.25], [39.7, 43.6], [40.3, 43.15], [41.0, 42.95], [41.6, 42.4], [41.65, 42.1], [41.75, 41.75], [41.55, 41.5], [41.4, 41.38], [40.9, 41.18], [40.5, 41.04], [40.1, 40.95], [39.7, 41.0], [39.2, 41.05], [38.6, 40.95], [38.2, 40.97], [37.88, 41.0], [37.5, 41.1], [36.9, 41.3], [36.4, 41.27], [36.1, 41.55], [35.95, 41.72], [35.5, 41.68], [35.15, 41.95], [35.0, 42.08], [34.7, 41.95], [34.0, 41.98], [33.76, 41.98], [33.3, 41.95], [32.6, 41.83], [32.3, 41.7], [31.85, 41.5], [31.45, 41.3], [31.0, 41.12], [30.6, 41.15], [30.2, 41.18], [29.6, 41.17], [29.25, 41.23]];
function inPoly(px, py, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c; } return c; }
/* harita çiz: proj(lon,lat)->[x,y] (düşük çöz. birim); dönüş: {sea: Uint8Array} */
function vn(x, y, sd) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = hash(xi + sd, yi), b = hash(xi + 1 + sd, yi), c = hash(xi + sd, yi + 1), d = hash(xi + 1 + sd, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
function drawMap(g, w, h, proj, wob) {
  var sea = new Uint8Array(w * h), x, y; wob = wob || 0;
  var poly = KARADENIZ.map(function (q) { return proj(q[0], q[1]); });
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) { var ox = wob ? (vn(x / 9, y / 9, 11) - 0.5) * wob + (vn(x / 3, y / 3, 5) - 0.5) * wob * 0.35 : 0, oy = wob ? (vn(x / 9, y / 9, 29) - 0.5) * wob + (vn(x / 3, y / 3, 17) - 0.5) * wob * 0.35 : 0; sea[y * w + x] = inPoly(x + 0.5 + ox, y + 0.5 + oy, poly) ? 1 : 0; }
  function S(x, y) { return x < 0 || y < 0 || x >= w || y >= h ? -1 : sea[y * w + x]; }
  /* kıyıya uzaklık */
  var dist = new Float32Array(w * h).fill(99);
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) { var me = sea[y * w + x], best = 99; for (var dy = -7; dy <= 7; dy++) for (var dx = -7; dx <= 7; dx++) { var v = S(x + dx, y + dy); if (v !== -1 && v !== me) { var dd = Math.sqrt(dx * dx + dy * dy); if (dd < best) best = dd; } } dist[y * w + x] = best; }
  var SEA = ['#0d3f55', '#134f6b', '#1d6c8f', '#2f8aad'], LAND = ['#4a7a3a', '#6e7a45', '#8a8a52'];
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    var i = y * w + x, d = dist[i];
    if (sea[i]) {
      var c = rp(SEA, 1 - Math.min(1, (d - 1) / 9), x, y);
      if (d < 1.5) c = '#9fd4e6';
      else if (hash(x >> 2, y * 3) > 0.985 && (x & 3) < 3) c = '#2f8aad';
      P(g, x, y, c);
    } else {
      var n = hash(x >> 3, y >> 3) * 0.5 + hash(x >> 1, y >> 1) * 0.3 + hash(x, y) * 0.2, inl = Math.min(1, d / 14);
      var lc = d < 1.5 ? '#0a1a27' : d < 2.5 ? '#cbb98d' : rp(LAND, n * 0.8 + inl * 0.3, x, y);
      if (d > 4 && hash(x, y + 7) > 0.93) lc = '#2f5136';
      if (d > 3 && hash(x + 3, y) > 0.97) lc = '#a89468';
      P(g, x, y, lc);
    }
  }
  return { sea: sea, dist: dist };
}
/* kilim şeridi */
function kilimBand(G, y, h, s) {
  const c = mk(Math.ceil(W / s), h), g = c.g; R(g, 0, 0, c.width, h, '#7d2c1d');
  for (let x = 0; x < c.width; x++) for (let yy = 0; yy < h; yy++) { const m = Math.abs(((x % 10) - 5)) + Math.abs(yy - (h - 1) / 2); const k = Math.round(m);
    P(g, x, yy, k <= 1 ? '#d9a441' : k === 2 ? '#ede4cf' : k === 3 ? '#2a4c7d' : yy === 0 || yy === h - 1 ? '#3b1a12' : '#a83d2b'); }
  up(G, c, 0, y, s);
}
/* hava ikonu */
function cloudIcon(kind) {
  const c = mk(30, 24), g = c.g;
  const blob = (cx, cy, r, col) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.5) P(g, cx + x, cy + y, col); };
  if (kind === 'sun') { for (let a = 0; a < 8; a++) { const ca = Math.cos(a * Math.PI / 4), sa = Math.sin(a * Math.PI / 4); for (let r = 8; r < 11; r++) P(g, Math.round(11 + ca * r), Math.round(9 + sa * r), '#ffc94a'); } blob(11, 9, 6, '#ffc94a'); blob(10, 8, 4, '#ffe27a'); }
  const C1 = kind === 'storm' ? ['#5a6167', '#8d959b', '#3a4048'] : ['#c8ced2', '#f1ebda', '#8d959b'];
  blob(13, 13, 6, C1[2]); blob(20, 14, 5, C1[2]); blob(8, 15, 4, C1[2]); R(g, 6, 15, 19, 4, C1[2]);
  blob(13, 12, 5, C1[0]); blob(20, 13, 4, C1[0]); blob(8, 14, 3, C1[0]); R(g, 7, 14, 17, 3, C1[0]); blob(12, 10, 3, C1[1]); blob(18, 11, 2, C1[1]);
  if (kind === 'storm') { [[14, 19], [13, 20], [12, 21], [13, 21], [14, 21], [13, 22], [12, 23]].forEach(([x, y]) => P(g, x, y, '#ffc94a')); [[7, 20], [6, 22], [20, 20], [19, 22], [24, 19], [23, 21]].forEach(([x, y]) => { P(g, x, y, '#9fd4e6'); P(g, x - 1, y + 1, '#9fd4e6'); }); }
  return outline(c, '#0a1a27');
}
/* 5×7 bitmap rakamlar (yazı tipinde 5/S ve 2/3 karışmasın diye) */
var DIG = { '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '2': '01110100010000100010001000100011111', '3': '11110000010000101110000010000111110', '4': '00010001100101010010111110001000010', '5': '11111100001111000001000011000101110', '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000', '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100' };
function dig(G, str, x, y, s, col, al) {
  var w = str.length * 6 * s - s, x0 = al === 'c' ? x - w / 2 : al === 'r' ? x - w : x;
  for (var i = 0; i < str.length; i++) { var d = DIG[str[i]]; if (!d) continue; for (var k = 0; k < 35; k++) if (d[k] === '1') R(G, Math.round(x0 + (i * 6 + k % 5) * s), Math.round(y + Math.floor(k / 5) * s), s, s, col); }
  return w;
}
