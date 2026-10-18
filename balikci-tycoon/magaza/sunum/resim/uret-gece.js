/* Gece modu (GECE.md) için taslak görseller — telefon dikey 780×1688 (390×844 @2x).
   Sahneler 390×844 "ince piksel" tuvalinde çizilir (oyunun K=2 ölçeği: kişi 1 sanat pikseli = 2 ince piksel),
   kişiler oyunun kendi drawPerson'ıyla (BT.drawOutfitOn) çizilir; sonra "ışık halkası" geçişi uygulanır.
   Kullanım: node uret-gece.js [1..4]   (boş: hepsi)   — sunucu: http://localhost:8101 */
const { chromium } = require('../../../test-offline');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8101/index.html';
const OUT = __dirname;
const AD = { 1: 'gece-1-isikci', 2: 'gece-2-kahve', 3: 'gece-3-hoyuk', 4: 'gece-4-kart' };

/* ======================= sayfa içi çizim kitaplığı ======================= */
function LIB() {
  const W = 390, H = 844;
  let cv, g;
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map(r => r.map(v => (v + 0.5) / 16));
  const hx = c => { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; };
  const toH = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toH(A.map((v, i) => v + (B[i] - v) * t)); };
  const lite = (c, t) => mix(c, '#ffffff', t), dark = (c, t) => mix(c, '#000000', t);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7 + 0.5) * 43758.5453; return s - Math.floor(s); };
  const R = (x, y, w, h, c, a) => { g.globalAlpha = a == null ? 1 : a; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); g.globalAlpha = 1; };
  const P = (x, y, c, a) => R(x, y, 1, 1, c, a);
  const bay = (x, y) => BAY[((y % 4) + 4) % 4][((x % 4) + 4) % 4];
  const ramp = (cols, f, x, y) => { f = Math.max(0, Math.min(0.9999, f)) * (cols.length - 1); const i = Math.floor(f); return (f - i) > bay(x, y) ? cols[Math.min(i + 1, cols.length - 1)] : cols[i]; };
  const ell = (cx, cy, rx, ry, c, a) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); R(cx - w, cy + y, 2 * w + 1, 1, c, a); } };
  const disc = (cx, cy, r, c, a) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) P(cx + x, cy + y, c, a); };
  const line = (x0, y0, x1, y1, c, a, t) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { R(x0, y0, t || 1, t || 1, c, a); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  };
  const oval = (cx, cy, rx, ry, c, a, dash) => { const n = Math.round((rx + ry) * 3.2); for (let i = 0; i < n; i++) { if (dash && (i % dash[0]) >= dash[1]) continue; const t = i / n * Math.PI * 2; P(Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), c, a); } };
  const snap = () => g.getImageData(0, 0, W, H);
  /* oyunun kendi karakter çizimi: ince ölçek k=2, ayak noktası (40,132) */
  const pcv = o => { const c = document.createElement('canvas'); c.width = 80; c.height = 140; c.dataset.k = 2; BT.drawOutfitOn(c, o, 0); return c; };
  const person = (o, x, y) => g.drawImage(pcv(o), Math.round(x) - 40, Math.round(y) - 132);
  /* oturan kişi: bacakları kes, dizleri öne kır */
  const seated = (o, x, hip, fx, chair) => {
    o = Object.assign({}, o, { face: fx }); const cut = 132 - (7 + (o.tall ? 4 : 0)) * 2 + 2;
    if (chair) {
      const bx = x - 9 * fx;
      R(bx - 1, hip - 22, 3, 44, '#3b2a1c'); R(bx, hip - 21, 1, 42, '#ab7a48');
      R(x - 11, hip + 4, 22, 4, '#3b2a1c'); R(x - 10, hip + 4, 20, 2, '#c9b183'); R(x - 10, hip + 6, 20, 1, '#a08a5a');
      for (let i = 0; i < 20; i += 3) P(x - 10 + i, hip + 4, '#e2d0a0');
      R(x + 8 * fx - 1, hip + 8, 2, 14, '#3b2a1c'); R(x - 8 * fx - 1, hip + 8, 2, 14, '#3b2a1c');
      R(x - 9, hip + 14, 18, 1, '#5a3a20');
    }
    g.drawImage(pcv(o), 0, 0, 80, cut, Math.round(x) - 40, hip - cut + 1, 80, cut);
    const pa = o.pants || '#2b3a45', bo = o.boot || '#1a2830', s = fx > 0 ? 1 : -1;
    const X = v => s > 0 ? x + v : x - v - 1;
    const rect = (a, y, w, h, c) => { const x0 = s > 0 ? x + a : x - a - w; R(x0, y, w, h, c); };
    rect(-5, hip - 1, 15, 7, '#141018'); rect(-4, hip, 13, 5, pa); rect(-4, hip, 13, 1, lite(pa, 0.18)); rect(-4, hip + 4, 13, 1, dark(pa, 0.25));
    rect(4, hip + 5, 7, 13, '#141018'); rect(5, hip + 5, 5, 12, pa); rect(9, hip + 5, 1, 12, dark(pa, 0.25));
    rect(4, hip + 16, 10, 4, '#141018'); rect(5, hip + 16, 8, 3, bo); rect(5, hip + 16, 8, 1, lite(bo, 0.2));
    void X;
  };
  /* ışık halkası: her pikseli ışığa uzaklığına göre bantlı (Bayer kenarlı) karanlık–sıcak arası karıştırır.
     keep: önceden alınmış gök anlığı — değişmemiş pikseller kendi gece rengini korur, ışığın yakınında hafif ısınır. */
  const light = (L, opt) => {
    opt = opt || {};
    const id = g.getImageData(0, 0, W, H), d = id.data, K = opt.keep ? opt.keep.data : null;
    const nk = opt.nk || [0.15, 0.19, 0.36], nb = opt.nb || [4, 6, 20];
    const bands = opt.bands || [[0.45, 1], [0.66, 0.82], [0.84, 0.6], [1, 0.37], [1.17, 0.17]];
    const Lc = L.map(l => Object.assign({}, l, { rgb: hx(l.c) }));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, bj = (bay(x, y) - 0.5) * 0.085; let f = 0, wc = null;
      for (const l of Lc) {
        const dx = x - l.x, dy = (y - l.y) / (l.sy || 1), q = Math.sqrt(dx * dx + dy * dy) / l.r + bj; let lv = 0;
        for (const b of bands) if (q < b[0]) { lv = b[1]; break; }
        lv *= (l.k || 1); if (lv > f) { f = lv; wc = l.rgb; }
      }
      const r = d[i], gg = d[i + 1], bb = d[i + 2];
      if (K && K[i] === r && K[i + 1] === gg && K[i + 2] === bb) {
        if (f > 0.3) { const t = (f - 0.3) * 0.22; d[i] = r + (wc[0] - r) * t; d[i + 1] = gg + (wc[1] - gg) * t; d[i + 2] = bb + (wc[2] - bb) * t; }
        continue;
      }
      const n = [r * nk[0] + nb[0], gg * nk[1] + nb[1], bb * nk[2] + nb[2]];
      const w = f ? [r + (wc[0] - r) * 0.2 * f, gg + (wc[1] - gg) * 0.2 * f, bb + (wc[2] - bb) * 0.2 * f].map(v => v * (0.92 + 0.14 * f)) : n;
      d[i] = n[0] + (w[0] - n[0]) * f; d[i + 1] = n[1] + (w[1] - n[1]) * f; d[i + 2] = n[2] + (w[2] - n[2]) * f;
    }
    g.putImageData(id, 0, 0);
  };
  /* bantlı ışıma (story.js glowSpr gibi) */
  const glow = (cx, cy, r, col, a) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const q = Math.sqrt(x * x + y * y) / r; if (q > 1) continue;
      const al = q < 0.35 ? 1 : q < 0.6 ? 0.72 : q < 0.82 ? 0.45 : 0.22;
      if (q > 0.9 && bay(x + 64, y + 64) > 0.5) continue;
      P(cx + x, cy + y, col, al * a);
    }
  };
  /* 3×5 rakam */
  const DG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111' };
  const digits = (s, x, y, c, k) => { k = k || 1; [...s].forEach((ch, j) => { const m = DG[ch]; if (!m) return; for (let i = 0; i < 15; i++) if (m[i] === '1') R(x + j * 4 * k + (i % 3) * k, y + Math.floor(i / 3) * k, k, k, c); }); };

  /* sahne kabı: tuval + HTML arayüz katmanı */
  const stage = () => {
    const box = document.createElement('div');
    box.id = 'geceBox';
    box.style.cssText = 'position:fixed;left:0;top:0;width:390px;height:844px;z-index:2147483647;background:#05060f;overflow:hidden;font-family:"Pixelify Sans",monospace;color:#f4e9d2';
    cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    cv.style.cssText = 'position:absolute;left:0;top:0;width:390px;height:844px;image-rendering:pixelated';
    g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    box.appendChild(cv); document.body.appendChild(box);
    const css = document.createElement('style');
    css.textContent = `
      #geceBox .chip{position:absolute;background:linear-gradient(180deg,#1a3348,#122536);border:2px solid #0a1a27;border-top-color:#1b354b;
        box-shadow:inset 1px 1px 0 rgba(255,255,255,.14),inset -1px -1px 0 rgba(0,0,0,.38),0 2px 0 rgba(0,0,0,.45);padding:5px 9px 6px;border-radius:3px}
      #geceBox .chip small{display:block;font-size:9px;letter-spacing:1px;color:#a9c0cf;line-height:1}
      #geceBox .chip b{font-weight:400;font-size:17px;color:#ffc94a;letter-spacing:1px;line-height:1.1;text-shadow:1px 1px 0 #3a2401}
      #geceBox .pip{display:inline-block;width:8px;height:8px;margin-right:2px;background:#0a1a27;box-shadow:inset 0 0 0 1px #3a5a74;
        clip-path:polygon(2px 0,6px 0,8px 2px,8px 6px,6px 8px,2px 8px,0 6px,0 2px)}
      #geceBox .pip.on{background:#ffc94a;box-shadow:inset -1px -1px 0 #b07a10,inset 1px 1px 0 #fff0b0}
      #geceBox .bub{position:absolute;background:#f4e9d2;color:#2a1a12;border:2px solid #1a1420;border-radius:3px;padding:6px 8px 7px;font-size:12px;line-height:1.35;
        box-shadow:inset -2px -2px 0 #d8cfb8,0 2px 0 rgba(0,0,0,.5)}
      #geceBox .bub i{font-style:normal;display:block;font-size:9px;letter-spacing:1px;color:#a83d2b;margin-bottom:2px}
      #geceBox .tail{position:absolute;width:0;height:0}
      #geceBox .sub{position:absolute;left:14px;right:14px;background:rgba(6,8,20,.82);border:2px solid #1b2440;border-radius:3px;padding:7px 10px 8px;
        font-size:12px;line-height:1.4;color:#d8d2c0;text-align:center}
      #geceBox .sub b{font-weight:400;color:#ffb454;letter-spacing:1px}
      #geceBox .hint{position:absolute;left:0;right:0;text-align:center;font-size:10px;letter-spacing:1.5px;color:rgba(244,233,210,.62)}
    `;
    box.appendChild(css);
    return box;
  };
  const html = (box, h) => { const d = document.createElement('div'); d.innerHTML = h; while (d.firstChild) box.appendChild(d.firstChild); };
  const tail = (box, x, y, dir) => {   /* piksel konuşma kuyruğu */
    const t = document.createElement('div'); t.className = 'tail'; t.style.left = x + 'px'; t.style.top = y + 'px';
    t.innerHTML = dir < 0
      ? '<div style="position:absolute;left:0;top:0;width:10px;height:4px;background:#f4e9d2;box-shadow:-2px 0 0 #1a1420,2px 0 0 #1a1420"></div><div style="position:absolute;left:0;top:4px;width:6px;height:4px;background:#f4e9d2;box-shadow:-2px 0 0 #1a1420,2px 0 0 #1a1420"></div><div style="position:absolute;left:-2px;top:8px;width:6px;height:2px;background:#1a1420"></div>'
      : '<div style="position:absolute;left:0;top:0;width:10px;height:4px;background:#f4e9d2;box-shadow:-2px 0 0 #1a1420,2px 0 0 #1a1420"></div><div style="position:absolute;left:4px;top:4px;width:6px;height:4px;background:#f4e9d2;box-shadow:-2px 0 0 #1a1420,2px 0 0 #1a1420"></div><div style="position:absolute;left:6px;top:8px;width:6px;height:2px;background:#1a1420"></div>';
    box.appendChild(t);
  };

  const NIGHT = ['#07071a', '#0b0b24', '#10102e', '#15153a', '#1b1b46', '#222252', '#2a2a5e', '#33336a'];
  const stars = (n, y1, seed) => {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(hash(i, seed) * W), y = Math.floor(hash(seed, i) * y1), r = hash(i, seed + 7);
      if (r > 0.93) { P(x, y, '#ffffff'); P(x - 1, y, '#8a8ac8', 0.6); P(x + 1, y, '#8a8ac8', 0.6); P(x, y - 1, '#8a8ac8', 0.6); P(x, y + 1, '#8a8ac8', 0.6); }
      else P(x, y, r > 0.6 ? '#c8c8f0' : '#6a6aa8', r > 0.6 ? 1 : 0.8);
    }
  };
  const PAL = HKG.v('PAL');

  /* ============ 1. IŞIKÇI KAYIĞI ============ */
  function s1() {
    const box = stage(), HZ = 74;
    /* gök + uzak kıyı (höyük tümseği) */
    for (let y = 0; y < HZ; y++) for (let x = 0; x < W; x++) P(x, y, ramp(NIGHT.slice(0, 6), y / HZ, x, y));
    stars(55, 52, 4);
    const coastTop = x => { if (x > 270) return 99; const e = Math.min(1, (270 - x) / 40); let h = e * (7 + 3 * Math.sin(x * 0.05) + 2 * Math.sin(x * 0.13 + 1)); const m = Math.max(0, 1 - Math.abs(x - 62) / 16); h += 7 * Math.sqrt(m); return HZ - Math.round(h); };
    for (let x = 0; x < W; x++) { const t = coastTop(x); for (let y = t; y < HZ; y++) P(x, y, y === t ? '#1c1f3e' : '#0b0d20'); }
    const keep = snap();
    /* deniz: ufukta koyu, yakına açılan şerit (aydınlık renkleri; gece geçişi laciverde çeker) */
    const SEA = ['#123a55', '#164660', '#1a4c6a', '#1d5372', '#1f5878'];
    for (let y = HZ; y < H; y++) { const t = (y - HZ) / (H - HZ); for (let x = 0; x < W; x++) P(x, y, ramp(SEA, t, x, y)); }
    R(0, HZ, W, 1, '#2a4a6a');
    /* dalga çizgileri: 3 ton (tepe açık, alt koyu) */
    for (let y = HZ + 3, k = 0; y < H; k++) {
      const t = (y - HZ) / (H - HZ), n = 3 + Math.floor(t * 9);
      for (let j = 0; j < n; j++) {
        const x = Math.floor(hash(k, j) * (W + 20)) - 10, len = 2 + Math.floor(hash(j, k + 3) * (3 + t * 12));
        R(x, y, len, 1, '#2f7fa3'); R(x + 1, y + 1, Math.max(1, len - 2), 1, '#0f3149');
        if (len > 8 && hash(k, j + 9) > 0.6) P(x + 2, y - 1, '#4fa0c0');
      }
      y += 3 + Math.floor(t * 6) + (k % 2);
    }
    /* dipte kıvrılan parıltı (Şahmeran asla görünmez — yalnız iz) */
    for (let i = 0; i < 70; i++) { const t = i / 70, x = 200 + Math.sin(t * 7) * 60 * (1 - t * 0.4) + t * 40, y = 470 + t * 110 + Math.cos(t * 7) * 18; if (i % 3) P(Math.round(x), Math.round(y), '#4a7a6a'); }
    /* hamsi sürüsü: karanlıktan gelen gümüş kıvrım */
    const bz = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
    const F = [];
    const curve = t => t < 0.78
      ? (s => [bz(s, 20, 30, 330, 300), bz(s, 760, 560, 640, 520)])(t / 0.78)
      : (s => { const a = -0.4 - s * 4.2, r = 46 - s * 22; return [252 + Math.cos(a) * r * 1.2, 488 + Math.sin(a) * r * 0.75]; })((t - 0.78) / 0.22);
    for (let i = 0; i < 440; i++) {
      const t = Math.pow(hash(i, 1), 0.7), p = curve(t), p2 = curve(Math.min(1, t + 0.01));
      let ang = Math.atan2(p2[1] - p[1], p2[0] - p[0]) + (hash(i, 5) - 0.5) * 0.5;
      const spread = 18 * (1 - t * 0.45), nx = -Math.sin(ang), ny = Math.cos(ang), o = (hash(i, 2) + hash(i, 3) - 1) * spread;
      F.push({ x: p[0] + nx * o, y: p[1] + ny * o * 0.8, a: ang, t });
    }
    const fish = (f, cB, cS, cG) => {
      const dx = Math.cos(f.a), dy = Math.sin(f.a) * 0.8;
      for (let k = 0; k < 6; k++) { const x = Math.round(f.x - dx * k), y = Math.round(f.y - dy * k); P(x, y, k === 5 ? cB : cS); if (k > 0 && k < 5) P(x - Math.round(dy), y - 1, cB); }
      P(Math.round(f.x), Math.round(f.y), cG);
    };
    F.forEach(f => fish(f, '#3c5a70', '#a8bccb', '#e8f0f4'));
    /* yunus (gövde): halkanın sağ üst kıyısında sudan çıkan sırt */
    const DX = 336, DY = 372;
    const dpt = s => { const a = Math.PI * (1.08 + 0.84 * s); return [DX + Math.cos(a) * 26, DY + 20 + Math.sin(a) * 26 * 0.85]; };
    for (const pass of [0, 1, 2]) for (let s = 0; s <= 1; s += 0.01) {
      const p = dpt(s), th = 1 + 6 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.15)), 0.6);
      if (pass === 0) ell(Math.round(p[0]), Math.round(p[1]), Math.round(th / 2) + 1, Math.round(th / 2) + 1, '#141a26');
      if (pass === 1) ell(Math.round(p[0]), Math.round(p[1]), Math.round(th / 2), Math.round(th / 2), '#62728a');
      if (pass === 2) { P(Math.round(p[0]), Math.round(p[1] - th / 2 + 1), '#94a4b8'); P(Math.round(p[0]), Math.round(p[1] + th / 2 - 1), '#3e4a5c'); }
    }
    { const p = dpt(0.52); for (let k = 0; k < 7; k++) R(Math.round(p[0]) - 1 + Math.round(k * 0.4), Math.round(p[1]) - 4 - k, 4 - Math.floor(k / 2), 1, k ? '#4e5c72' : '#62728a'); line(Math.round(p[0]) - 2, Math.round(p[1]) - 4, Math.round(p[0]) + 2, Math.round(p[1]) - 11, '#141a26'); }
    const WL = DY + 16; for (let y = WL; y < WL + 30; y++) for (let x = DX - 34; x < DX + 34; x++) { /* suyun altı: gövdeyi kes */ }
    { const id = g.getImageData(DX - 40, WL, 80, 26); const ref = snap(); void ref; void id; }
    /* gövdenin su altını deniz rengine geri boya */
    for (let y = WL; y < WL + 24; y++) for (let x = DX - 36; x < DX + 36; x++) { const t = (y - HZ) / (H - HZ); P(x, y, ramp(SEA, t, x, y)); }
    R(DX - 30, WL, 60, 1, '#2f7fa3'); R(DX - 24, WL + 1, 48, 1, '#0f3149');

    /* ---- kayık ---- */
    const cx = 165, cy = 452, LH = 64;
    const u = x => (x - cx) / LH, sheer = x => -6 * u(x) * u(x) - (u(x) > 0 ? 5 * Math.pow(u(x), 3) : 0);
    const hh = x => 10 * (1 - u(x) * u(x));
    const yb = x => Math.round(cy + sheer(x) - hh(x)), yf = x => Math.round(cy + sheer(x) + hh(x));
    /* gövdenin suya düşen koyu yansıması */
    for (let x = cx - LH + 4; x < cx + LH - 4; x++) { const dd = Math.round(18 * Math.sqrt(Math.max(0, 1 - u(x) * u(x)))); R(x, yf(x) + dd + 1, 1, 4, '#0b2236'); }
    /* iç: karşı borda iç yüzü + taban */
    for (let x = cx - LH + 2; x < cx + LH - 1; x++) {
      const a = yb(x), b = yf(x); if (b - a < 2) continue;
      for (let y = a + 1; y < b; y++) P(x, y, y < a + 4 ? (y === a + 1 ? '#c9975f' : '#ab7a48') : (y < a + 6 ? '#7a5030' : '#5a3a20'));
      if (x % 6 === 0) for (let y = a + 6; y < b; y++) P(x, y, '#4a2e18');
    }
    /* oturaklar */
    [cx - 34, cx + 4, cx + 36].forEach(tx => { for (let x = tx; x < tx + 4; x++) { const a = yb(x), b = yf(x); R(x, a + 1, 1, b - a - 1, x === tx ? '#e0b070' : x === tx + 3 ? '#6f4526' : '#c9975f'); } });
    /* hamsi kasası (kıçta) */
    R(cx - 54, yb(cx - 50) + 4, 16, 9, '#3b2a1c'); R(cx - 53, yb(cx - 50) + 5, 14, 7, '#c9975f'); R(cx - 53, yb(cx - 50) + 5, 14, 2, '#a8bccb'); for (let k = 0; k < 5; k++) P(cx - 52 + k * 3, yb(cx - 50) + 5, '#e8f0f4');
    /* reis: beresi, ak sakalı, kalın ceketi — lambaya bakar */
    person({ coat: '#5a4630', coat2: '#6e5a40', pants: '#2b3a45', boot: '#1a2830', beanie: '#8a2e24', beard: true, must: true, hair: '#d8d2c4', skin: PAL.skin[2], face: 1, mood: 0.6 }, 146, 474);
    /* ön borda (bacakları örter) */
    for (let x = cx - LH; x <= cx + LH; x++) {
      const top = yf(x), dd = Math.round(18 * Math.sqrt(Math.max(0, 1 - u(x) * u(x))));
      if (dd < 1) continue;
      for (let k = 0; k <= dd; k++) {
        let c = k < 2 ? (k === 0 ? '#e0b070' : '#c9975f') : k < 5 ? '#1f6fae' : k < 6 ? '#14507e' : k > dd - 3 ? '#a83d2b' : k > dd * 0.62 ? '#d8cfb8' : '#ede4cf';
        if (k === dd) c = '#1a1420';
        P(x, top + k, c);
      }
      P(x, top - 1, '#3b2a1c');
    }
    /* uçlar ve bodoslama */
    R(cx + LH - 1, yf(cx + LH - 1) - 12, 3, 13, '#3b2a1c'); R(cx + LH, yf(cx + LH - 1) - 11, 1, 11, '#c9975f');
    R(cx - LH - 1, yf(cx - LH + 1) - 6, 3, 8, '#3b2a1c'); R(cx - LH, yf(cx - LH + 1) - 5, 1, 6, '#c9975f');
    /* su çizgisi köpüğü */
    for (let x = cx - LH + 6; x < cx + LH - 6; x += 2) { const dd = Math.round(18 * Math.sqrt(Math.max(0, 1 - u(x) * u(x)))); if (hash(x, 3) > 0.35) P(x, yf(x) + dd + 1, '#cfe9f2'); }
    /* kürek (ıskarmoza dayalı, kıçtan suya) */
    line(cx - 30, yb(cx - 30), cx - 92, yb(cx - 30) + 40, '#3b2a1c', 1, 2); line(cx - 30, yb(cx - 30) - 1, cx - 92, yb(cx - 30) + 39, '#c9975f');
    R(cx - 98, yb(cx - 30) + 38, 9, 4, '#ab7a48'); R(cx - 98, yb(cx - 30) + 41, 9, 1, '#6f4526');
    /* lamba sırığı ve lüks lambası */
    const LX = 262, LY = 402;
    line(cx + 44, yf(cx + 44) - 2, LX + 2, LY - 6, '#3b2a1c', 1, 3); line(cx + 44, yf(cx + 44) - 3, LX + 2, LY - 7, '#ab7a48');
    line(LX + 1, LY - 6, LX + 1, LY, '#2a2a2a');
    const lamp = hot => {
      R(LX - 6, LY, 13, 1, '#1a1420'); R(LX - 5, LY + 1, 11, 2, hot ? '#8b949c' : '#5d666e'); R(LX - 6, LY + 3, 13, 1, '#3a4048');
      R(LX - 4, LY + 4, 9, 8, hot ? '#fff6d0' : '#d8d0b0'); R(LX - 2, LY + 6, 5, 5, hot ? '#ffffff' : '#e8e0c0'); R(LX - 4, LY + 4, 1, 8, '#5d666e'); R(LX + 4, LY + 4, 1, 8, '#5d666e');
      R(LX - 5, LY + 12, 11, 1, '#7a5a1a'); R(LX - 5, LY + 13, 11, 5, '#c9952f'); R(LX - 5, LY + 13, 11, 1, '#e6be59'); R(LX - 5, LY + 17, 11, 1, '#7a5a1a'); R(LX + 5, LY + 14, 2, 2, '#5d666e');
    };
    lamp(false);
    /* --- ışık halkası --- */
    light([{ x: 256, y: 452, r: 138, sy: 0.8, c: '#ffb454' }], { keep });
    /* uzak kıyı: koy ışıkları + höyükte bir an parlayan kıvılcım */
    [[150, 0], [168, 1], [176, 0], [190, 1], [214, 0], [236, 1], [252, 0]].forEach(([x, k]) => { const y = coastTop(x) + 3 + k; P(x, y, '#ffb454'); if (k) P(x + 1, y, '#ffd98a'); for (let j = 1; j < 6; j += 2) P(x + (j % 3) - 1, HZ + j, '#ffb454', 0.5 - j * 0.07); });
    glow(62, coastTop(62) - 2, 5, '#ff8a3c', 0.35); P(62, coastTop(62) - 2, '#fff6d0'); P(61, coastTop(62) - 4, '#ffb454'); P(63, coastTop(62) - 5, '#ff8a3c', 0.7);
    /* uzakta gırgır (motoru duyulur) ve bir başka ışıkçı */
    { const gx = 70, gy = 214; R(gx - 16, gy, 34, 3, '#05070f'); R(gx - 13, gy + 3, 28, 2, '#05070f'); R(gx - 4, gy - 6, 9, 6, '#05070f'); R(gx + 6, gy - 18, 1, 18, '#05070f'); line(gx + 7, gy - 17, gx + 16, gy, '#05070f');
      glow(gx + 2, gy - 3, 7, '#ffb454', 0.25); P(gx - 1, gy - 4, '#ffd98a'); P(gx + 3, gy - 4, '#ffb454'); P(gx + 6, gy - 19, '#e5533d');
      for (let j = 0; j < 7; j++) R(gx - 2 + (j % 2) * 2, gy + 7 + j * 3, 3 + (j % 2), 1, '#ffb454', 0.45 - j * 0.05);
      for (let j = 0; j < 5; j++) R(gx - 24 - j * 7, gy + 4 + (j % 2), 4, 1, '#2a4a6a', 0.6); }
    { const ix = 322, iy = 142; glow(ix, iy, 6, '#ffb454', 0.3); P(ix, iy, '#fff6d0'); R(ix - 4, iy + 3, 9, 1, '#05070f'); for (let j = 0; j < 5; j++) R(ix - 1 + (j % 2), iy + 6 + j * 3, 2, 1, '#ffb454', 0.4 - j * 0.06); }
    /* lambanın sudaki titrek sütunu */
    for (let y = 476, k = 0; y < 600; y += 3, k++) { const w = Math.max(2, 14 - k * 0.35 + (k % 2) * 4), off = (k % 3 - 1) * 3; R(LX - w / 2 + off, y, w, 1, k % 2 ? '#ffb454' : '#ffe28a', Math.max(0.15, 0.75 - k * 0.016)); }
    /* halka içinde turuncu dalga ışıltıları */
    for (let i = 0; i < 90; i++) { const a = hash(i, 11) * Math.PI * 2, rr = Math.sqrt(hash(i, 12)) * 118; const x = Math.round(256 + Math.cos(a) * rr), y = Math.round(452 + Math.sin(a) * rr * 0.8); if (y < 470 && Math.abs(x - 165) < 70) continue; R(x, y, 2 + Math.floor(hash(i, 13) * 4), 1, '#ffc98a', 0.55); }
    /* sürünün gümüş kıvrımı: halkada parlak, karanlıkta yakamozla belli */
    F.forEach((f, i) => {
      const dx = f.x - 256, dy = (f.y - 452) / 0.8, q = Math.sqrt(dx * dx + dy * dy) / 138;
      if (q < 0.95) { if (hash(i, 21) > 0.45) P(Math.round(f.x), Math.round(f.y), '#ffffff'); if (hash(i, 22) > 0.7) P(Math.round(f.x - Math.cos(f.a) * 2), Math.round(f.y - Math.sin(f.a) * 1.6), '#fff0d0'); }
      else { if (hash(i, 23) > 0.55) P(Math.round(f.x), Math.round(f.y), '#b8c8e0', 0.55); if (hash(i, 24) > 0.8) P(Math.round(f.x + (hash(i, 25) - 0.5) * 8), Math.round(f.y + (hash(i, 26) - 0.5) * 6), '#6fe3c8', 0.8); }
    });
    /* yakamoz: halkanın kıyısında kıpırdayan soğuk yeşil-mavi */
    for (let i = 0; i < 260; i++) {
      const a = hash(i, 31) * Math.PI * 2, q = 0.96 + hash(i, 32) * 0.34, x = Math.round(256 + Math.cos(a) * 138 * q), y = Math.round(452 + Math.sin(a) * 138 * 0.8 * q);
      if (y < HZ + 6) continue;
      const c = hash(i, 33) > 0.7 ? '#9ff6e0' : hash(i, 33) > 0.35 ? '#6fe3c8' : '#3fb0b8', al = 0.35 + hash(i, 34) * 0.6 * (1.3 - q);
      P(x, y, c, al); if (hash(i, 35) > 0.88) { P(x - 1, y, c, al * 0.5); P(x + 1, y, c, al * 0.5); P(x, y - 1, c, al * 0.5); P(x, y + 1, c, al * 0.5); }
    }
    /* yunus nefesi: püskürtü + halka halka yakamoz */
    { const p = dpt(0.24), bx = Math.round(p[0]), by = Math.round(p[1]) - 3;
      for (let i = 0; i < 120; i++) { const t = hash(i, 41), yy = by - t * 30, ww = 2 + t * 9 * (0.6 + hash(i, 42) * 0.5), xx = bx + (hash(i, 43) - 0.5) * 2 * ww; P(Math.round(xx), Math.round(yy), hash(i, 44) > 0.6 ? '#e8fff8' : '#9fd4e6', 0.85 - t * 0.6); }
      P(bx, by + 1, '#e8fff8'); P(bx, by, '#e8fff8');
      oval(DX, WL + 1, 40, 7, '#6fe3c8', 0.75, [5, 3]); oval(DX + 2, WL + 2, 54, 10, '#3fb0b8', 0.5, [4, 4]);
      P(Math.round(dpt(0.08)[0]) + 2, Math.round(dpt(0.08)[1]) - 2, '#141a26'); }
    /* lamba: sıcak ışıma + akkor gömlek */
    glow(LX, LY + 8, 30, '#ffb454', 0.13); glow(LX, LY + 8, 15, '#ffd98a', 0.22); lamp(true);
    /* başparmak ipucu: lambadan aşağı noktalı yol, dokunma halkası, iki ok */
    for (let k = 0; k < 26; k++) { const t = k / 25, x = Math.round(256 + (200 - 256) * t + Math.sin(t * 3) * 18), y = Math.round(592 + (736 - 592) * t); if (k % 2 === 0) R(x, y, 2, 2, '#f4e9d2', 0.42); }
    oval(200, 748, 18, 18, '#f4e9d2', 0.7); oval(200, 748, 17, 17, '#0a1a27', 0.5); oval(200, 748, 24, 24, '#f4e9d2', 0.25, [3, 2]); disc(200, 748, 5, '#f4e9d2', 0.75);
    [[-1, 166], [1, 234]].forEach(([s, x]) => { for (let k = 0; k < 5; k++) R(x - s * k, 748 - k, 2, 1, '#f4e9d2', 0.7), R(x - s * k, 748 + k, 2, 1, '#f4e9d2', 0.7); });
    html(box, `
      <div class="chip" style="left:12px;top:14px"><small>ÇEKİŞ</small><b>1/3</b> <span style="margin-left:4px"><span class="pip on"></span><span class="pip"></span><span class="pip"></span></span></div>
      <div class="chip" style="right:12px;top:14px;text-align:right"><small>LAMBA GÖMLEĞİ</small>
        <div style="margin-top:5px;width:92px;height:8px;background:#0a1a27;box-shadow:inset 0 0 0 1px #3a5a74;position:relative"><div style="position:absolute;left:1px;top:1px;bottom:1px;width:62px;background:linear-gradient(90deg,#e8822a,#ffb454)"></div></div></div>
      <div class="bub" style="left:44px;top:330px;width:120px">Sus da gelsin.</div>
      <div class="hint" style="top:782px">LAMBAYI SÜRÜYE SÜRÜKLE</div>
    `);
    tail(box, 132, 360, 1);
  }

  /* ============ 2. LİMAN KAHVESİ (dolunay) ============ */
  function s2() {
    const box = stage();
    /* tavan ve kirişler */
    for (let y = 0; y < 120; y++) for (let x = 0; x < W; x++) P(x, y, ramp(['#3a2a1c', '#4a3422', '#5a4028'], y / 120, x, y));
    for (let x = 10; x < W; x += 64) { R(x, 0, 14, 118, '#2a1a12'); R(x + 1, 0, 12, 116, '#6f4526'); R(x + 1, 0, 2, 116, '#8a5a34'); }
    R(0, 116, W, 6, '#2a1a12'); R(0, 117, W, 3, '#8a5a34');
    /* duvar: is tutmuş badana, altta yeşil lambri */
    for (let y = 122; y < 452; y++) for (let x = 0; x < W; x++) P(x, y, ramp(['#c8b890', '#d8c8a0', '#e2d4b0'], (y - 122) / 330, x, y));
    for (let i = 0; i < 140; i++) P(Math.floor(hash(i, 2) * W), 122 + Math.floor(hash(2, i) * 320), '#b8a880', 0.6);
    R(0, 450, W, 4, '#2a1a12'); R(0, 451, W, 2, '#8a6a40');
    for (let y = 454; y < 540; y++) for (let x = 0; x < W; x++) P(x, y, (x % 26 === 0) ? '#2a4a36' : (x % 26 === 1) ? '#5a8a6a' : ramp(['#4a7a5a', '#3f6a4a', '#355a40'], (y - 454) / 86, x, y));
    R(0, 536, W, 6, '#2a1a12'); R(0, 537, W, 2, '#6f4526');
    /* döşeme tahtaları */
    for (let y = 542, k = 0; y < H; k++) { const hgt = 6 + Math.floor(k * 1.6); for (let yy = y; yy < Math.min(H, y + hgt); yy++) for (let x = 0; x < W; x++) P(x, yy, yy === y ? '#3b2a1c' : yy === y + 1 ? '#a87a4a' : ramp(['#8a5a34', '#7a4e2c', '#6f4526'], (yy - y) / hgt, x, yy)); for (let j = 0; j < 4; j++) { const x = Math.floor(hash(k, j) * W); R(x, y, 1, hgt, '#3b2a1c'); } y += hgt; }
    /* pencere: dolunay, buğu */
    const WX = 26, WY = 222, WW = 76, WH = 104;
    R(WX - 5, WY - 5, WW + 10, WH + 10, '#2a1a12'); R(WX - 4, WY - 4, WW + 8, WH + 8, '#6a8a9a'); R(WX - 4, WY - 4, WW + 8, 2, '#8aaaba');
    R(WX, WY, WW, WH, '#0b0b24');
    R(WX - 8, WY + WH + 4, WW + 16, 5, '#2a1a12'); R(WX - 7, WY + WH + 4, WW + 14, 3, '#c9975f');
    /* takvim yaprağı 1974 */
    const CX = 236, CY = 262;
    R(CX - 1, CY - 1, 38, 54, '#3b2a1c'); R(CX, CY, 36, 52, '#f1ebda'); R(CX, CY, 36, 12, '#a83d2b'); R(CX, CY + 11, 36, 1, '#7d2c1d');
    digits('1974', CX + 11, CY + 3, '#f1ebda'); digits('12', CX + 7, CY + 18, '#1a1420', 3); R(CX + 6, CY + 40, 24, 1, '#9a8c72'); R(CX + 6, CY + 44, 18, 1, '#9a8c72');
    R(CX + 2, CY + 52, 34, 2, '#d8cfb8'); P(CX + 17, CY - 4, '#3b2a1c'); P(CX + 18, CY - 4, '#3b2a1c'); R(CX + 17, CY - 3, 2, 3, '#5d666e');
    /* tütün afişi (yazısız, soluk) */
    const AX = 292, AY = 232;
    R(AX - 1, AY - 1, 50, 66, '#3b2a1c'); R(AX, AY, 48, 64, '#e8d48a'); R(AX, AY, 48, 14, '#2a4c7d'); R(AX + 3, AY + 4, 42, 2, '#e8d48a'); R(AX + 3, AY + 8, 28, 2, '#e8d48a');
    R(AX + 12, AY + 22, 24, 30, '#f1ebda'); R(AX + 12, AY + 22, 24, 6, '#a83d2b'); R(AX + 16, AY + 32, 16, 12, '#c9952f'); R(AX + 18, AY + 34, 12, 8, '#e6be59'); R(AX + 4, AY + 56, 40, 3, '#a83d2b'); P(AX + 47, AY + 63, '#c8b890'); R(AX + 40, AY + 58, 8, 6, '#c8b890');
    /* raf ve radyo (Arkası Yarın) */
    R(128, 372, 70, 4, '#3b2a1c'); R(129, 372, 68, 2, '#c9975f'); R(134, 376, 3, 6, '#3b2a1c'); R(188, 376, 3, 6, '#3b2a1c');
    R(136, 342, 52, 30, '#2a1a12'); R(137, 343, 50, 28, '#7a4e2c'); R(137, 343, 50, 2, '#a87a4a'); R(140, 347, 24, 20, '#c9b183'); for (let y = 348; y < 366; y += 2) R(141, y, 22, 1, '#8a7a50');
    R(168, 348, 16, 8, '#1a1420'); R(169, 349, 14, 6, '#e8d48a'); P(174, 350, '#a83d2b'); P(174, 351, '#a83d2b'); disc(172, 362, 2, '#3b2a1c'); disc(180, 362, 2, '#3b2a1c');
    /* soba + boru + demlik (sağ arka) */
    const SX = 300;
    R(SX + 13, 132, 8, 368, '#1a1420'); R(SX + 14, 132, 6, 368, '#3a4048'); R(SX + 14, 132, 1, 368, '#5d666e'); R(SX + 13, 124, 30, 8, '#1a1420'); R(SX + 14, 125, 28, 6, '#3a4048');
    R(SX, 500, 34, 72, '#1a1420'); R(SX + 1, 501, 32, 70, '#3a4048'); R(SX + 1, 501, 32, 3, '#5d666e'); R(SX + 28, 504, 5, 66, '#2a3036');
    R(SX - 2, 498, 38, 4, '#1a1420'); R(SX - 1, 498, 36, 2, '#5d666e'); R(SX + 3, 572, 3, 10, '#1a1420'); R(SX + 28, 572, 3, 10, '#1a1420');
    R(SX + 6, 540, 22, 10, '#1a1420'); R(SX + 7, 541, 20, 8, '#2a3036');
    /* çaydanlık + demlik (bakır) */
    ell(SX + 17, 489, 10, 8, '#3a1a0a'); ell(SX + 17, 489, 9, 7, '#b87333'); ell(SX + 14, 486, 4, 3, '#d8955a'); R(SX + 8, 494, 18, 2, '#7a4a20');
    line(SX + 26, 488, SX + 32, 482, '#7a4a20', 1, 2);
    ell(SX + 17, 476, 6, 5, '#3a1a0a'); ell(SX + 17, 476, 5, 4, '#c98a4a'); P(SX + 15, 474, '#f0c090'); R(SX + 16, 470, 3, 2, '#3a1a0a');
    /* köşede kemençeci (taburede, kemençe dizinde, çalmıyor) */
    const kem = (x, y) => { ell(x, y + 10, 4, 7, '#2a1a12'); ell(x, y + 10, 3, 6, '#8a4a24'); P(x - 1, y + 7, '#b06a3a'); R(x - 1, y - 8, 2, 12, '#2a1a12'); R(x, y - 8, 1, 12, '#6f4526'); R(x - 2, y - 11, 4, 4, '#2a1a12'); P(x - 1, y + 9, '#1a1420'); P(x + 1, y + 9, '#1a1420'); };
    seated({ coat: '#3a3a44', coat2: '#4a4a56', pants: '#2a262e', boot: '#141012', cap: '#2e2a30', must: true, hair: '#2e2018', skin: PAL.skin[1] }, 362, 598, -1, true);
    kem(347, 590);
    /* arka masa: Haşmet Bey (yorgun, tek kadeh, fötr masada) */
    const T = Object.assign({}, HKG.v('TAX_LOOK')); delete T.fedora; delete T.briefcase; T.mood = 0.4;
    seated(T, 54, 578, 1, true);
    R(30, 568, 72, 10, '#3b2a1c'); R(31, 569, 70, 7, '#2f6a44'); R(31, 569, 70, 2, '#3f8a5a'); R(30, 578, 72, 4, '#2a1a12'); R(31, 578, 70, 2, '#6f4526'); R(36, 582, 3, 24, '#2a1a12'); R(92, 582, 3, 24, '#2a1a12');
    /* fötr */
    R(76, 568, 18, 2, '#1a1418'); R(79, 562, 12, 6, '#2e2a30'); R(79, 565, 12, 2, '#120e10'); R(81, 562, 4, 1, '#4a4450');
    /* tek kadeh rakı */
    R(64, 559, 4, 11, '#1a1420'); R(65, 560, 2, 9, '#e8ece8'); P(65, 561, '#ffffff'); R(63, 569, 6, 1, '#9aa0a8');
    /* ön masa: tavla */
    const TX = 100, TY = 640;
    seated(HKG.v('specOutfit')(HKG.v('STORY_SPECS').st_t, 1), 80, 664, 1, true);
    seated({ coat: '#3a2a20', coat2: '#4a3626', pants: '#2b3a45', boot: '#1a2830', cap: '#4a4a3a', must: true, hair: '#1d1713', skin: PAL.skin[1] }, 312, 664, -1, true);
    R(TX, TY, 190, 34, '#2a1a12'); R(TX + 1, TY + 1, 188, 30, '#8a5a34'); R(TX + 1, TY + 1, 188, 2, '#c9975f'); for (let x = TX + 6; x < TX + 188; x += 23) R(x, TY + 3, 1, 28, '#7a4e2c');
    R(TX, TY + 32, 190, 12, '#2a1a12'); R(TX + 1, TY + 32, 188, 9, '#6f4526'); R(TX + 1, TY + 32, 188, 1, '#ab7a48');
    [TX + 6, TX + 178].forEach(x => { R(x, TY + 44, 6, 62, '#2a1a12'); R(x + 1, TY + 44, 4, 60, '#6f4526'); R(x + 1, TY + 44, 1, 60, '#ab7a48'); });
    R(TX + 4, TY + 104, 182, 4, '#000000', 0.25);
    /* tavla tahtası */
    const BX = 146, BY = 643, BW = 98, BH = 26;
    R(BX - 1, BY - 1, BW + 2, BH + 2, '#1a1420'); R(BX, BY, BW, BH, '#5a3a20'); R(BX + 2, BY + 2, BW - 4, BH - 4, '#d9b98a'); R(BX + BW / 2 - 2, BY, 4, BH, '#5a3a20');
    for (let i = 0; i < 12; i++) { const x = BX + 3 + i * 7.6 + (i >= 6 ? 3 : 0), col = i % 2 ? '#a83d2b' : '#2a2a2a'; for (let k = 0; k < 8; k++) { R(x + Math.floor(k / 3), BY + 2 + k, Math.max(1, 6 - Math.floor(k / 1.5) * 2 + 0), 1, col); R(x + Math.floor(k / 3), BY + BH - 3 - k, Math.max(1, 6 - Math.floor(k / 1.5) * 2), 1, i % 2 ? '#2a2a2a' : '#a83d2b'); } }
    [[BX + 6, BY + 4, 1], [BX + 6, BY + 8, 1], [BX + 26, BY + 20, 0], [BX + 58, BY + 4, 0], [BX + 58, BY + 8, 0], [BX + 80, BY + 20, 1], [BX + 88, BY + 20, 1]].forEach(([x, y, w]) => { ell(x, y, 3, 2, '#1a1420'); ell(x, y, 2, 1, w ? '#f1ebda' : '#7d2c1d'); P(x - 1, y - 1, w ? '#ffffff' : '#b5432f'); });
    [[BX + 70, BY + 11], [BX + 77, BY + 13]].forEach(([x, y]) => { R(x - 1, y - 1, 6, 6, '#1a1420'); R(x, y, 4, 4, '#ffffff'); R(x, y + 3, 4, 1, '#d8cfb8'); P(x + 1, y + 1, '#a83d2b'); P(x + 3, y + 2, '#1a1420'); });
    /* ince belli çay bardakları */
    const cay = (x, y) => { ell(x, y + 1, 7, 2, '#1a1420'); ell(x, y + 1, 6, 1, '#ede4cf'); const rows = [6, 6, 5, 4, 3, 3, 4, 5, 5, 4]; rows.forEach((w, k) => { const yy = y - 1 - k; R(x - Math.ceil(w / 2) - 1, yy, w + 2, 1, '#3a1a0a'); R(x - Math.ceil(w / 2), yy, w, 1, k > 8 ? '#e8c8a0' : k > 5 ? '#c84a1a' : '#a8341a'); }); P(x - 2, y - 7, '#ffd0a0'); P(x - 3, y - 9, '#fff0e0'); };
    cay(118, 662); cay(272, 662); cay(129, 650);
    /* sigara tablası + duman */
    ell(258, 652, 5, 2, '#5d666e'); ell(258, 651, 3, 1, '#2a3036'); R(259, 649, 5, 1, '#f1ebda'); P(264, 649, '#ff8a3c');
    /* ampul: kordon + duy + cam */
    R(195, 0, 1, 418, '#1a1420'); R(193, 418, 5, 7, '#1a1420'); R(194, 419, 3, 5, '#5d666e');
    const bulb = hot => { ell(195, 431, 4, 6, '#1a1420'); ell(195, 431, 3, 5, hot ? '#fff6d0' : '#e0d8b0'); R(194, 428, 3, 5, hot ? '#ffffff' : '#f0e8c0'); };
    bulb(false);
    /* --- ışık halkası --- */
    light([{ x: 195, y: 566, r: 178, sy: 1.32, c: '#ffd36a' }], { nk: [0.09, 0.11, 0.24], nb: [3, 4, 13] });
    /* pencere içi: dolunay, deniz, buğu (dışarıdan gelen soğuk ışık) */
    for (let y = WY; y < WY + WH; y++) for (let x = WX; x < WX + WW; x++) P(x, y, ramp(NIGHT.slice(1, 7), (y - WY) / 70, x, y));
    for (let i = 0; i < 18; i++) P(WX + Math.floor(hash(i, 51) * WW), WY + Math.floor(hash(51, i) * 50), '#c8c8f0');
    { const mx = WX + 50, my = WY + 26; glow(mx, my, 20, '#e8e8f8', 0.12); disc(mx, my, 11, '#9a9ab8'); disc(mx, my, 10, '#e8e8f8'); disc(mx - 2, my - 2, 6, '#ffffff'); [[-4, 2, 2], [3, 4, 2], [4, -4, 1]].forEach(([a, b, r]) => disc(mx + a, my + b, r, '#c8c8dc')); }
    for (let y = WY + 72; y < WY + WH; y++) for (let x = WX; x < WX + WW; x++) P(x, y, y === WY + 72 ? '#4a4a7a' : ramp(['#151a3a', '#10142e'], (y - WY - 72) / 30, x, y));
    for (let y = WY + 74, k = 0; y < WY + WH; y += 3, k++) R(WX + 44 - (k % 2) * 2, y, 10 - k + (k % 2) * 4, 1, '#c8c8e8', 0.6);
    for (let y = WY + 60; y < WY + WH; y++) for (let x = WX; x < WX + WW; x++) if (bay(x, y) < (y - WY - 60) / 60) P(x, y, '#c8d0e0', 0.22);
    R(WX + WW / 2 - 1, WY, 3, WH, '#3a4a5a'); R(WX, WY + 50, WW, 3, '#3a4a5a');
    for (let x = WX; x < WX + WW; x += 1) if (hash(x, 61) > 0.5) P(x, WY + WH - 1 - Math.floor(hash(x, 62) * 3), '#e8f0f8', 0.35);
    /* ay ışığı pencereden Haşmet'in masasına düşer */
    for (let y = WY + WH + 10; y < 600; y++) { const t = (y - WY - WH) / 200; for (let x = WX + 10 + t * 40; x < WX + WW + t * 70; x++) if (bay(x, y) < 0.12) P(Math.round(x), y, '#9aa8d8', 0.35); }
    /* radyo kadranı ve soba ağzı */
    R(169, 349, 14, 6, '#ffe28a', 0.75); P(174, 350, '#a83d2b');
    R(SX + 9, 543, 16, 4, '#ff8a3c'); R(SX + 11, 544, 12, 2, '#ffe28a'); glow(SX + 17, 548, 12, '#ff8a3c', 0.16);
    /* tütün dumanı: iki piksellik mavi katman */
    for (const [yy, ph] of [[396, 0], [470, 2], [610, 4]]) for (let x = 0; x < W; x++) { const y = Math.round(yy + Math.sin(x * 0.045 + ph) * 6 + Math.sin(x * 0.11 + ph) * 2); if (hash(x >> 3, yy) > 0.28) R(x, y, 1, 2, '#9ab0d8', 0.16); }
    for (let k = 0; k < 14; k++) P(264 + Math.round(Math.sin(k * 0.8) * 2), 646 - k * 2, '#c8d0e0', 0.5 - k * 0.03);
    /* ampul ışıması */
    glow(195, 432, 36, '#ffd36a', 0.1); glow(195, 432, 16, '#fff0b0', 0.24); bulb(true);
    html(box, `
      <div class="chip" style="left:12px;top:14px"><small>İTİMAT</small>
        <div style="margin-top:4px">${'<span class="pip on"></span>'.repeat(4)}${'<span class="pip"></span>'.repeat(8)}</div></div>
      <div class="bub" style="left:110px;top:548px;width:210px"><i>SÖYLENTİ</i>Duydun mu? Yarın Trabzon kamyonu gelmiyormuş. Hamsi pazarda pahalanır…</div>
    `);
    tail(box, 104, 600, -1);
  }

  /* ============ 3. HÖYÜK VE NÖBET ATEŞİ ============ */
  function s3() {
    const box = stage(), HZ = 432;
    for (let y = 0; y < HZ; y++) for (let x = 0; x < W; x++) P(x, y, ramp(NIGHT, y / HZ, x, y));
    /* samanyolu: çapraz soluk şerit */
    for (let y = 0; y < 300; y++) for (let x = 0; x < W; x++) { const d = Math.abs((x - 40) * 0.55 - (y - 20) * 0.9 + 60) / 40; if (d < 1 && bay(x, y) < (1 - d) * 0.35) P(x, y, '#3a3a72', 0.7); }
    stars(150, 400, 9); for (let i = 0; i < 40; i++) P(Math.floor(hash(i, 77) * W), Math.floor(hash(77, i) * 380), hash(i, 78) > 0.5 ? '#8a8ac8' : '#ffffff');
    /* koyun öbür yakası */
    const far = x => HZ - Math.round(10 + 8 * Math.sin(x * 0.02 + 1) + 4 * Math.sin(x * 0.07));
    for (let x = 0; x < W; x++) for (let y = far(x); y < HZ; y++) P(x, y, y === far(x) ? '#2a2a52' : '#121530');
    for (let y = HZ; y < 486; y++) for (let x = 0; x < W; x++) P(x, y, ramp(['#14183a', '#10142e', '#0c1028'], (y - HZ) / 54, x, y));
    for (let y = HZ + 3, k = 0; y < 486; y += 4, k++) for (let j = 0; j < 6; j++) R(Math.floor(hash(k, j + 60) * W), y, 2 + Math.floor(hash(j, k) * 6), 1, '#2a2a5e', 0.8);
    const keep = snap();
    /* höyük: rüzgârın biçtiği otlar, eski taşlar (aydınlık renklerle; gece geçişi karartır) */
    const top = x => { const u = (x - 195) / 230; return Math.round(560 + 120 * u * u * (1 + 0.4 * u * u) + 3 * Math.sin(x * 0.09)); };
    const back = x => Math.round(500 + 20 * Math.sin(x * 0.012 + 0.6) + 8 * Math.sin(x * 0.04));
    for (let x = 0; x < W; x++) for (let y = back(x); y < H; y++) P(x, y, y === back(x) ? '#4a5a36' : ramp(['#3a4a2c', '#2e3c24', '#26321e'], (y - back(x)) / 90, x, y));
    for (let x = 0; x < W; x++) { const t0 = top(x); for (let y = t0; y < H; y++) P(x, y, y === t0 ? '#8a9a5a' : y < t0 + 2 ? '#6a7a44' : ramp(['#5a6a3c', '#4a5a34', '#3a4a2c', '#2e3c24'], (y - t0) / 240, x, y)); }
    /* çimen tutamları: sağa yatık */
    for (let i = 0; i < 520; i++) { const x = Math.floor(hash(i, 81) * W), y0 = top(x) + Math.floor(Math.pow(hash(81, i), 1.4) * 260), hgt = 3 + Math.floor(hash(i, 82) * 6); for (let k = 0; k < hgt; k++) P(x + Math.floor(k * 0.6), y0 - k, k > hgt - 2 ? '#a8b468' : '#6a7a44'); P(x + 1, y0, '#2e3c24'); }
    for (let i = 0; i < 90; i++) { const x = Math.floor(hash(i, 85) * W), y0 = back(x) + 2; for (let k = 0; k < 4; k++) P(x + Math.floor(k * 0.6), y0 - k, '#5a6a40'); }
    /* eski taşlar */
    [[60, 640, 9, 6], [330, 630, 8, 5], [118, 600, 5, 3], [284, 598, 6, 4], [24, 700, 12, 8], [368, 720, 10, 7]].forEach(([x, y, rx, ry]) => { ell(x, y + 1, rx + 1, ry + 1, '#1a1a22'); ell(x, y, rx, ry, '#7a7a84'); ell(x - 2, y - 2, rx - 3, ry - 2, '#9a9aa4'); R(x - rx + 1, y + ry - 1, rx * 2 - 1, 1, '#5a5a66'); });
    /* ateş: taş halka + çapraz kütük (alev sonra, ışık geçişinden sonra) */
    const FX = 195, FY = 604;
    for (let i = 0; i < 11; i++) { const a = Math.PI * 2 * i / 11, x = Math.round(FX + Math.cos(a) * 22), y = Math.round(FY + Math.sin(a) * 6); ell(x, y, 4, 3, '#2a2a30'); ell(x, y - 1, 3, 2, '#7a7a84'); P(x - 1, y - 2, '#a4a4ae'); }
    ell(FX, FY, 17, 4, '#2a2420'); ell(FX, FY, 14, 3, '#5a4a40');
    line(FX - 16, FY + 3, FX + 14, FY - 3, '#3a2418', 1, 3); line(FX - 14, FY - 3, FX + 16, FY + 3, '#5a3a2a', 1, 3); line(FX - 14, FY - 4, FX + 16, FY + 2, '#8a5a3a');
    /* kazık ve asılı yay */
    const KX = 262, KY = 612;
    R(KX - 2, KY - 78, 5, 80, '#1a1420'); R(KX - 1, KY - 77, 3, 78, '#6f4526'); R(KX - 1, KY - 77, 1, 78, '#ab7a48'); R(KX - 3, KY - 80, 7, 3, '#1a1420'); R(KX - 2, KY - 79, 5, 1, '#8a5a34');
    R(KX + 2, KY - 66, 5, 2, '#1a1420'); R(KX + 2, KY - 66, 4, 1, '#ab7a48');
    for (let k = 0; k <= 48; k++) { const t = k / 48, y = KY - 66 + t * 52, bend = Math.sin(t * Math.PI) * 9 - Math.sin(t * Math.PI * 2) * (t < 0.15 || t > 0.85 ? 2 : 0), x = KX + 7 + bend; R(Math.round(x), Math.round(y), 3, 1, '#1a1420'); P(Math.round(x) + 1, Math.round(y), t > 0.42 && t < 0.58 ? '#e4b94a' : '#7a3a24'); if (k % 3 === 0) P(Math.round(x) + 2, Math.round(y), '#a85a34'); }
    line(KX + 7, KY - 66, KX + 7, KY - 14, '#d8cfb8');
    /* sadak (kazık dibinde) */
    R(KX + 10, KY - 26, 7, 24, '#1a1420'); R(KX + 11, KY - 25, 5, 22, '#7a4a24'); R(KX + 11, KY - 25, 5, 2, '#e4b94a'); [0, 2, 4].forEach(k => { R(KX + 11 + k, KY - 32, 1, 7, '#c9975f'); P(KX + 11 + k, KY - 33, '#ede4cf'); });
    /* kopuz: taşa dayalı */
    { const x = 118, y = 598; ell(x, y, 5, 7, '#1a1420'); ell(x, y, 4, 6, '#8a4a24'); P(x - 1, y - 3, '#b06a3a'); line(x + 1, y - 7, x + 8, y - 22, '#1a1420', 1, 2); line(x + 1, y - 7, x + 7, y - 21, '#6f4526'); R(x + 7, y - 25, 3, 4, '#1a1420'); }
    /* Alp Er Tunga ateş başında, alevlere bakar */
    person(HKG.v('specOutfit')(HKG.v('STORY_SPECS').st_a, 1), 150, 616);
    /* --- ışık halkası (kehribar) --- */
    light([{ x: FX, y: FY - 10, r: 158, sy: 0.85, c: '#ff9a3c' }], { keep, nk: [0.16, 0.18, 0.3], nb: [4, 6, 16] });
    /* uzaktaki koyun ışıkları ve sudaki yansımaları */
    [[188, 0], [204, 1], [212, 0], [226, 0], [240, 1], [262, 0], [270, 1], [296, 0], [318, 1], [336, 0], [92, 0], [70, 1]].forEach(([x, k]) => {
      const y = HZ - 4 - (k ? 3 : 0) - Math.floor(hash(x, 1) * 4); P(x, y, '#ffb454'); if (k) { P(x + 1, y, '#ffd98a'); P(x, y - 1, '#ffb454', 0.5); }
      for (let j = 0; j < 4; j++) R(x - 1 + (j % 2), HZ + 3 + j * 4, 2 + (j % 2), 1, '#ffb454', 0.45 - j * 0.09);
    });
    /* alevler */
    const tongues = [[-9, 13], [-4, 22], [1, 30], [6, 20], [11, 12]];
    glow(FX, FY - 14, 48, '#ff8a3c', 0.12); glow(FX, FY - 12, 24, '#ffb454', 0.22);
    tongues.forEach(([ox, hh]) => { for (let y = 0; y < hh; y++) { const hw = Math.max(0.5, 5 * (1 - y / hh)); for (let x = -Math.ceil(hw); x < hw; x++) { const q = Math.abs(x + 0.5) / hw, c = q < 0.35 && y < hh * 0.6 ? '#ffe28a' : q < 0.7 ? '#ffb454' : '#ff8a3c'; P(FX + ox + x + Math.round(Math.sin(y * 0.4 + ox) * 1), FY - 1 - y, c); } } });
    R(FX - 4, FY - 7, 8, 4, '#fff6d0');
    /* kıvılcımlar */
    for (let i = 0; i < 26; i++) { const t = hash(i, 91), x = Math.round(FX + (hash(i, 92) - 0.5) * 30 + Math.sin(t * 9) * 8 + t * 24), y = Math.round(FY - 30 - t * 150); P(x, y, t > 0.6 ? '#ff8a3c' : '#ffd98a', 1 - t * 0.7); }
    html(box, `<div class="sub" style="bottom:56px"><b>ALP ER TUNGA</b><br>Hükümdar uyur, nöbetçi uyumaz. Bir odun at.</div>`);
  }

  window.GX = { s1, s2, s3 };
}

/* ======================= sürücü ======================= */
async function sahne(b, n) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(URL); await sleep(1500);
  await p.addScriptTag({ content: '(' + LIB.toString() + ')();' });
  await p.evaluate(n => window.GX['s' + n](), n);
  await p.evaluate(() => document.fonts.ready); await sleep(400);
  await p.screenshot({ path: path.join(OUT, AD[n] + '.png') });
  await ctx.close();
}

async function kart(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge,#toast,#coach{display:none!important}' });
  await p.evaluate(() => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 18250; S.rep = 400;
    BT.areas[1].locked = false; BT.areas.forEach((a, i) => { if (i < 2) a.lvl = Math.max(a.lvl, 2); }); BT.rebuildCounters();
    for (let z = 0; z < 2; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.counters.forEach(c => { c.open = true; c.seen = true; }); BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep(12000);
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN * 0.97; });
  await sleep(1500);
  await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); HKG.v('endDay')(); });
  await sleep(1200);
  await p.evaluate(() => {
    document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dayScr') o.classList.add('hidden'); });
    const card = document.querySelector('#dayScr .card');
    const st = document.createElement('style');
    st.textContent = `
      #dayScr .gAy{display:flex;align-items:center;gap:10px;margin:2px 0 10px;padding:7px 9px;background:linear-gradient(180deg,#0e1430,#0a0f24);
        border:2px solid #050814;border-top-color:#1e2850;border-radius:var(--rad,3px);box-shadow:inset 1px 1px 0 rgba(255,255,255,.06)}
      #dayScr .gAy canvas{width:40px;height:40px;image-rendering:pixelated;flex:0 0 40px;filter:drop-shadow(0 0 4px rgba(122,122,176,.35))}
      #dayScr .gAy div{font-size:12.5px;line-height:1.35;color:#c8c8e8;text-align:left}
      #dayScr .gAy small{display:block;font-size:9.5px;letter-spacing:1px;color:#8a8ac8;margin-bottom:2px}
      #dayScr .gDuo{display:flex;gap:8px;margin-top:10px}
      #dayScr .gDuo button{flex:1 1 0;margin-top:0;padding:10px 4px 9px;font-size:16px;line-height:1.1}
      #dayScr .gDuo button small{display:block;font-size:9.5px;letter-spacing:.5px;margin-top:4px;opacity:.85}
      #dayScr .gDuo .gSea{background:linear-gradient(180deg,#ffbe62,#e8862e);border-color:#6a2e0a;color:#2a1004}
      #dayScr .gNote{font-size:10px;color:var(--ink2);text-align:center;margin-top:7px;letter-spacing:.3px}
    `;
    document.head.appendChild(st);
    const ay = document.createElement('div'); ay.className = 'gAy';
    const c = document.createElement('canvas'); c.width = 20; c.height = 20; const g = c.getContext('2d');
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) { const d = Math.hypot(x - 10, y - 10); if (d > 8.5) continue;
      let col = d > 7.6 ? '#0a0c1e' : '#1a1e3e'; if (d <= 7.6 && d > 6.7 && x < 9) col = '#7a7ab0'; else if (d <= 7.6 && d > 6.7) col = '#2a2e58';
      if (d <= 6.7 && (x + y * 3) % 7 === 0 && x > 8) col = '#161a34'; P(x, y, col); }
    P(5, 9, '#9a9ad0'); P(5, 10, '#9a9ad0'); P(12, 7, '#22264a'); P(13, 8, '#22264a'); P(9, 13, '#22264a');
    ay.appendChild(c);
    const tx = document.createElement('div'); tx.innerHTML = '<small>AY KARANLIĞI</small>Bu gece ay yok, ışıkçılar denizde.'; ay.appendChild(tx);
    card.insertBefore(ay, document.getElementById('dayRows'));
    document.getElementById('dayStalls').style.display = 'none'; document.getElementById('dayGo').style.display = 'none';
    const nx = document.getElementById('dayNext'); if (nx) nx.classList.add('hidden');
    const duo = document.createElement('div'); duo.className = 'gDuo';
    duo.innerHTML = '<button class="go gSea">DENİZE ÇIK<small>ışıkçı kayığı · 1–2 dk</small></button><button class="go">SABAHA GEÇ<small>atlamak ücretsiz</small></button>';
    card.appendChild(duo);
    const note = document.createElement('div'); note.className = 'gNote'; note.textContent = 'Dolunayda: KAHVEYE UĞRA'; card.appendChild(note);
  });
  await sleep(600);
  await p.screenshot({ path: path.join(OUT, AD[4] + '.png') });
  await ctx.close();
}

(async () => {
  const want = process.argv[2] ? [+process.argv[2]] : [1, 2, 3, 4];
  const b = await chromium.launch();
  for (const n of want) { if (n === 4) await kart(b); else await sahne(b, n); console.log('ok', AD[n]); }
  await b.close();
})();
