/* Devrim fikirleri (D1–D5) için taslak görseller.
   Kullanım:  node uret-devrim.js ham   → oyundan ham ekran görüntüleri (HAM klasörüne)
              node uret-devrim.js [1..5] → 1600×900 kompozisyonlar (devrim-N.png) */
const { chromium } = require('../../../test-offline');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8101/index.html';
const HAM = process.env.HAM || path.join(__dirname, '_ham');
const OUT = __dirname;
fs.mkdirSync(HAM, { recursive: true });

async function startGame(b, vp, opts) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route('**/specials.js', r => r.fulfill({ contentType: 'application/javascript', body: 'window.BT_SPECIALS = [];' }));
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(() => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(o => {
    const S = BT.S; S.names = (HKG.v('SPECIALS') || []).map(x => x.id); S.tut = 99; S.ctrl = 2; S.cash = o.cash; S.rep = o.rep;
    const NA = Math.min(o.areas, BT.areas.length); for (let i = 1; i < NA; i++) BT.areas[i].locked = false;
    BT.areas.forEach((a, i) => { if (i < o.areas) a.lvl = Math.max(a.lvl, o.lvl); });
    BT.rebuildCounters();
    for (let z = 0; z < NA; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    if (o.decor) BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  }, opts);
  return p;
}
const clean = p => p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); } }); HKG.v('syncPause')(); });
async function shot(p, n, x, y, t, z, hud) {
  await p.evaluate(([x, y, t, z]) => { if (z) { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); } BT.player.x = x; BT.player.y = y; if (t != null) BT.day.t = BT.DAY_LEN * t; }, [x, y, t, z]);
  await clean(p); await sleep(2200);
  if (!hud) await p.addStyleTag({ content: '#hud,.hud,#devbar,#chBtn,#objective,#actBtn,#tradeBtn,#queueHint{visibility:hidden!important}' });
  await p.screenshot({ path: HAM + '/' + n + '.png' });
  if (!hud) await p.addStyleTag({ content: '#hud,.hud,#devbar,#chBtn,#objective,#actBtn,#tradeBtn,#queueHint{visibility:visible!important}' });
}

/* oyunun kendi drawPerson'ı ile tek karakter (ince piksel K=2, 40×48 sanat pikseli) */
async function persons(p, list) {
  return p.evaluate(list => list.map(o => {
    const k = 2, cv = document.createElement('canvas'); cv.width = 40 * k; cv.height = 48 * k;
    const g = cv.getContext('2d'), PAL = HKG.PAL, dp = HKG.v('drawPerson'); g.imageSmoothingEnabled = false;
    HKG.withCtx(g, k, () => { g.setTransform(k, 0, 0, k, 20 * k, 44 * k); dp({ x: 0, y: 0, z: 0, vx: 0, vy: 0, bob: 0, act: 0, carry: [] }, Object.assign({ face: 1, skin: PAL.skin[o.sk || 0], boot: '#16222b', bootTop: '#2f4450', pants: '#2b3a45' }, o)); });
    return cv.toDataURL();
  }), list);
}
const LOOKS = {
  dede74: { coat: '#4a5058', coat2: '#5d646d', knit: '#8a8f96', cap: '#2e2a26', must: true, thickMust: true, hair: '#1d1713', hairStyle: 0, sk: 1, pants: '#3a3530' },
  baba94: { coat: '#7a2b2b', coat2: '#8f3a36', knit: '#c8b89a', vest: '#3a4a5a', must: true, hair: '#3d2a1a', hairStyle: 1, sk: 1, pants: '#2b3a45', glasses: true },
  torun24: { coat: '#1f8fbf', coat2: '#2fa6d4', knit: '#f1ebda', hair: '#3d2a1a', hairStyle: 3, sk: 1, pants: '#2b3a45', phone: true },
  husnu: { coat: '#5a4a3a', coat2: '#6e5c48', knit: '#cbbc9e', cap: '#3a3028', beard: true, hair: '#e8e4da', hairStyle: 4, sk: 2, pants: '#4a4034', vest: '#3d3022' }
};
async function ham() {
  const b = await chromium.launch();
  /* dolu liman, yatay (D1 üst yarı, D5 yakın plan) */
  let p = await startGame(b, { width: 800, height: 450 }, { cash: 184250, rep: 2400, areas: 99, lvl: 3, decor: 1 });
  await sleep(15000);
  await shot(p, 'yatay-dolu-z1', 8, 8, 0.45, 1);
  await shot(p, 'yatay-iskele-z3', 4.5, 3.2, 0.45, 3);
  await shot(p, 'yatay-tezgah-z3', 8.2, 5.2, 0.45, 3);
  const P = await persons(p, Object.values(LOOKS));
  Object.keys(LOOKS).forEach((n, i) => fs.writeFileSync(HAM + '/kisi-' + n + '.png', Buffer.from(P[i].split(',')[1], 'base64')));
  await p.context().close();
  /* üç dönem: aynı kamera, farklı gelişmişlik (D2) */
  const ERA = [['donem-1974', { cash: 900, rep: 20, areas: 1, lvl: 1, decor: 0 }], ['donem-1994', { cash: 42000, rep: 700, areas: 2, lvl: 2, decor: 0 }], ['donem-2024', { cash: 184250, rep: 2400, areas: 99, lvl: 3, decor: 1 }]];
  for (const [n, o] of ERA) {
    p = await startGame(b, { width: 340, height: 600 }, o); await sleep(9000);
    await shot(p, n, 6.2, 5.2, 0.45, 2); await p.context().close();
  }
  /* telefon dikey, HUD açık (D3) */
  p = await startGame(b, { width: 380, height: 692 }, { cash: 18250, rep: 400, areas: 2, lvl: 2, decor: 0 });
  await sleep(8000);
  await shot(p, 'dikey-hud', 6.5, 4.5, 0.45, 2, true);
  await p.context().close();
  await b.close();
}

/* ---------------- kompozisyon ---------------- */
const DRAW = {};
async function compose(list) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('pageerror', e => console.log('PE', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'log') console.log('C', m.text()); });
  await p.goto(URL); await sleep(1500);
  const ic = await p.evaluate(() => { const I = HKG.v('ICONS'), o = {}; Object.keys(I).forEach(k => { if (Array.isArray(I[k])) o[k] = I[k]; }); return { I: o, P: HKG.v('IPAL') }; });
  await p.setContent('<!doctype html><html><head><base href="' + URL.replace(/[^/]*$/, '') + '"><link rel="stylesheet" href="fonts/fonts.css"></head><body style="margin:0;background:#000"></body></html>');
  await p.evaluate(async ic => { window.GICONS = ic.I; window.GIPAL = ic.P; await document.fonts.load('400 16px "Pixelify Sans"', 'AĞIŞÜÖÇİ'); await document.fonts.load('700 16px "Pixelify Sans"', 'AĞIŞÜÖÇİ'); }, ic);
  await p.addScriptTag({ path: path.join(__dirname, 'devrim-lib.js') });
  const img = {};
  for (const f of fs.readdirSync(HAM)) if (f.endsWith('.png')) img[f.replace('.png', '')] = 'data:image/png;base64,' + fs.readFileSync(path.join(HAM, f)).toString('base64');
  for (const n of list) {
    const url = await p.evaluate(DRAW[n], img);
    const out = n === 'test' ? path.join(HAM, 'test.png') : path.join(OUT, 'devrim-' + n + '.png');
    fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('yazıldı', out);
  }
  await b.close();
}
DRAW.test = async function (img) {
  const C = mk(800, 400), G = C.g; R(G, 0, 0, 800, 400, '#14293c');
  let y = 4; [[16, 400], [16, 700], [20, 400], [24, 400], [24, 700], [32, 400], [32, 700]].forEach(([sz, w]) => { txt(G, sz + ' 0123456789 CANLI 15 Nisan ĞŞİ', 4, y, { size: sz, w, col: '#ffc94a', s: 1 }); y += sz * 1.3 + 8; });
  const L = mk(60, 40); panel(L.g, 2, 2, 50, 30, { trim: '#c9952f' }); up(G, L, 600, 10, 4);
  up(G, icon('hamsi'), 600, 200, 4); up(G, icon('fener'), 660, 200, 4);
  return C.toDataURL();
};

/* ===== D1 · Denizin Hafızası: üstte liman, altta su altı (ağ gölgeleri, kaçışan sürü, uyuyan Şahmeran kuyruğu), solda ölçer ===== */
DRAW['1'] = async function (img) {
  const C = mk(W, H), G = C.g, top = await load(img['yatay-dolu-z1']);
  const SY = 150, WL = 400;
  G.drawImage(top, 0, SY, 1600, WL, 0, 0, 1600, WL);
  /* --- su altı (s=4) --- */
  const s = 4, uw = 400, uh = 128, U = mk(uw, uh), g = U.g, oy = WL - 12;
  const WATER = ['#2f8aad', '#1d6c8f', '#185d7c', '#134f6b', '#0f425b', '#0d3f55', '#0a3346', '#082a3a', '#06212e'];
  vgrad(g, 0, 0, uw, uh, WATER);
  /* ışık hüzmeleri */
  [[40, 14], [120, 10], [205, 16], [300, 12], [360, 9]].forEach(([x0, w]) => { for (let y = 0; y < 100; y++) { const xx = x0 + y * 0.45; for (let x = 0; x < w + y * 0.12; x++) { const f = 1 - y / 100; if (BAY[y & 3][(xx + x | 0) & 3] < 0.32 * f) P(g, xx + x, y, '#2f8aad', 0.55); } } });
  /* sol: yorgun deniz (bulanık), sağ: bereketli */
  for (let y = 0; y < uh; y++) for (let x = 0; x < 150; x++) { const f = (1 - x / 150) * 0.55; if (BAY[y & 3][x & 3] < f * 0.5) P(g, x, y, '#4a5a48', 0.5); }
  /* dip */
  const bed = x => 104 + Math.round(Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13 + 1) * 1.5 + hash(x >> 3, 5) * 2);
  for (let x = 0; x < uw; x++) { const t = bed(x); for (let y = t; y < uh; y++) { const d = y - t; P(g, x, y, d === 0 ? '#5f7a5a' : rp(['#4d6a58', '#3f5a4e', '#2e4640', '#1e3438'], d / 22, x, y)); if (d > 1 && hash(x, y) > 0.94) P(g, x, y, '#6b7f62'); } }
  /* kayalar */
  [[30, 108, 10, 6], [96, 110, 7, 4], [150, 109, 9, 5], [330, 110, 8, 4], [385, 106, 12, 7]].forEach(([cx, cy, rx, ry]) => { const r = mk(rx * 2 + 2, ry * 2 + 2); for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if (x * x / (rx * rx) + y * y / (ry * ry) <= 1 && y <= ry * 0.5) P(r.g, x + rx + 1, y + ry + 1, (x + y) < -rx * 0.4 ? '#4a6466' : (x - y) > rx * 0.5 ? '#16282c' : '#2e4a4a'); g.drawImage(outline(r, '#0a1a27'), cx - rx - 2, cy - ry - 2); });
  /* mercanlar: sağda açmış renkli, solda gri kökler */
  const coral = (x0, y0, col, h, dead) => { const c = mk(16, h + 2), cg = c.g; const L = dead ? '#6a7072' : lite(col, 0.3), D = dead ? '#3a4044' : dark(col, 0.3), M = dead ? '#4f5658' : col;
    const br = (x, y, dx, n) => { for (let i = 0; i < n; i++) { P(cg, x, y - i, M); P(cg, x - 1, y - i, i % 3 ? L : M); P(cg, x + 1, y - i, D); if (i === n - 1 && !dead) { P(cg, x, y - i - 1, L); } if (i % 3 === 2) x += dx; } return [x, y - n]; };
    const [a, b] = br(8, h + 1, 0, Math.round(h * 0.45)); br(a, b, -1, Math.round(h * 0.5)); br(a, b, 1, Math.round(h * 0.55)); if (!dead) br(a - 2, b + 3, -1, Math.round(h * 0.3));
    g.drawImage(outline(c, '#0a1a27'), x0 - 9, y0 - h - 2); };
  [[262, '#e5533d', 14], [276, '#d9a441', 10], [292, '#cb5b40', 16], [312, '#1f8fbf', 11], [345, '#e5533d', 13], [360, '#d9a441', 17], [374, '#a83d2b', 11], [398, '#1f8fbf', 14]].forEach(([x, c, h]) => coral(x, bed(x) + 1, c, h, false));
  [[14, 9], [58, 7], [80, 10], [118, 6]].forEach(([x, h]) => coral(x, bed(x) + 1, '#888', h, true));
  /* anemon/deniz yıldızı */
  [[300, '#ffb27a'], [352, '#f1ebda'], [385, '#ffc94a']].forEach(([x, c]) => { const y = bed(x); P(g, x, y - 1, c); P(g, x - 1, y, c); P(g, x + 1, y, c); P(g, x, y, dark(c, .3)); });
  /* Şahmeran: mağara ağzı + kıvrılmış pullu kuyruk */
  const cave = mk(70, 46); { const cg = cave.g; for (let y = 0; y < 46; y++) for (let x = 0; x < 70; x++) { const dx = (x - 35) / 34, dy = (y - 46) / 44; const r = dx * dx + dy * dy; if (r <= 1) P(cg, x, y, r > 0.62 ? (x + y < 50 ? '#3f5a5a' : hash(x >> 1, y >> 1) > 0.6 ? '#1e3438' : '#2e4640') : r > 0.5 ? '#0a1a22' : '#03111a'); } }
  g.drawImage(outline(cave, '#0a1a27'), 300 - 35, bed(300) - 44);
  const tail = mk(170, 50), tg = tail.g, segs = [];
  const N = 420; for (let i = 0; i <= N; i++) { const t = i / N; let x, y, r;
    if (t < 0.22) { const u = t / 0.22; x = 140 - u * 52; y = 40 - Math.sin(u * Math.PI) * 4; r = 7 - u * 0.6; }
    else { const u = (t - 0.22) / 0.78, a = u * Math.PI * 3.1, Rr = 30 * (1 - u * 0.78); x = 64 + Math.cos(a) * Rr; y = 34 + Math.sin(a) * Rr * 0.36 - u * 6; r = 6.4 * (1 - u * 0.8) + 0.6; }
    segs.push({ x, y, r, t, back: t > 0.22 && Math.sin(((t - 0.22) / 0.78) * Math.PI * 3.1) < 0 }); }
  const sc = (seg, xx, yy) => { const k = Math.floor(seg.t * 120); const rel = (yy - seg.y) / seg.r; if (rel > 0.45) return '#e8d8a8'; if (rel > 0.25) return '#cbb98d'; const sh = rel < -0.6 ? 2 : rel < -0.1 ? 1 : 0; const gold = ((k + Math.round(rel * 3)) % 7 === 0); const base = gold ? ['#ffc94a', '#d9a441', '#a07a2a'] : (k % 2 ? ['#6fbf7a', '#3a8a5a', '#1e4a34'] : ['#5fae6c', '#327a50', '#1a402e']); return base[sh === 2 ? 0 : sh === 1 ? 1 : 2]; };
  const order = segs.filter(q => q.back).concat(segs.filter(q => !q.back));
  order.forEach(q => { for (let yy = -q.r; yy <= q.r; yy++) for (let xx = -q.r; xx <= q.r; xx++) if (xx * xx + yy * yy <= q.r * q.r + 0.4) P(tg, q.x + xx, q.y + yy, sc(q, q.x + xx, q.y + yy)); });
  /* kuyruk ucu yüzgeci */
  const e = segs[N]; [[0, -2], [-1, -3], [1, -3], [-2, -4], [2, -4], [0, -1]].forEach(([dx, dy]) => P(tg, e.x + dx, e.y + dy, '#d9a441'));
  g.drawImage(outline(tail, '#0a1a27'), 300 - 140 - 2, bed(300) - 48);
  /* zzz kabarcıkları */
  [[262, 66, 3], [268, 58, 2], [275, 50, 2], [282, 44, 1]].forEach(([x, y, r]) => { for (let a = 0; a < 16; a++) P(g, x + Math.round(Math.cos(a / 16 * 6.28) * r), y + Math.round(Math.sin(a / 16 * 6.28) * r), '#9fd4e6', 0.8); P(g, x - 1, y - 1, '#cfe9f2'); });
  /* ağ gölgeleri (yüzeyden sarkan) */
  const net = (cx, top, w0, w1, h, a) => { for (let y = 0; y < h; y++) { const f = y / h, hw = (w0 + (w1 - w0) * f) / 2 * (f > 0.8 ? Math.sqrt(1 - (f - 0.8) / 0.2 * 0.8) : 1); for (let x = -hw; x <= hw; x++) { const X = Math.round(cx + x + Math.sin(y * 0.2) * 1.5), Y = top + y; const edge = Math.abs(x) > hw - 1 || y === 0 || y === h - 1; if (edge || ((X + Y) % 4 === 0) || ((X - Y + 400) % 4 === 0)) P(g, X, Y, '#04141c', edge ? a + 0.15 : a); } }
    for (let y = 0; y < top; y++) { P(g, cx - w0 / 2, y, '#04141c', a); P(g, cx + w0 / 2, y, '#04141c', a); }
    for (let x = -w0 / 2; x <= w0 / 2; x += 4) { P(g, cx + x, 1, '#ede4cf'); P(g, cx + x, 2, '#e5533d'); } };
  net(136, 12, 34, 20, 44, 0.42); net(252, 8, 40, 24, 52, 0.42); net(74, 16, 24, 14, 30, 0.32);
  /* tekne omurgası gölgeleri */
  [[136, 22], [252, 26], [272, 18]].forEach(([x, w]) => { for (let i = -w / 2; i <= w / 2; i++) { const d = 1 - Math.abs(i) / (w / 2); R(g, x + i, 0, 1, Math.round(1 + d * 3), '#04141c', 0.5); } });
  /* hamsi sürüsü: ağdan kaçışıyor (sola, aşağı) */
  const fish = mk(9, 4); { const f = fish.g; ['..ddddd.d', '.kbbbbbdd', 'lsssssss.', '..llll..d'].forEach((r, y) => { for (let x = 0; x < 9; x++) { const c = { d: '#1f3a5e', b: '#2a6c9d', s: '#b8e0ee', l: '#e6f5fa', k: '#0a1a27' }[r[x]]; if (c) P(f, x, y, c); } }); }
  const fishR = mk(9, 4); fishR.g.translate(9, 0); fishR.g.scale(-1, 1); fishR.g.drawImage(fish, 0, 0);
  let sd = 7; const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, rr = Math.sqrt(rnd()); const x = 182 + Math.cos(a) * rr * 40, y = 66 + Math.sin(a) * rr * 15 + (182 - x) * 0.1;
    g.drawImage(fish, Math.round(x), Math.round(y)); if (rnd() < 0.3) { P(g, Math.round(x) + 11, Math.round(y) + 2, '#9fd4e6', 0.5); P(g, Math.round(x) + 13, Math.round(y) + 2, '#9fd4e6', 0.25); } }
  /* sağda huzurlu küçük sürü */
  for (let i = 0; i < 18; i++) { const x = 334 + rnd() * 50, y = 76 + rnd() * 12; g.drawImage(fishR, Math.round(x), Math.round(y)); }
  /* yunuslar (geri döndüler) */
  const dolph = (x0, y0, flip) => { const c = mk(36, 16), dg = c.g, L = 30;
    const th = u => u < 0.07 ? 1.1 : u < 0.24 ? 1.1 + 3.6 * Math.sin((u - 0.07) / 0.17 * Math.PI / 2) : u < 0.58 ? 4.7 : Math.max(0.8, 4.7 * Math.pow(1 - (u - 0.58) / 0.42, 1.1));
    for (let x = 0; x < L; x++) { const u = x / (L - 1), hh = th(u), cy = 8 + (u < 0.07 ? 1.6 : 0) + (u > 0.6 ? (u - 0.6) * -3 : 0);
      for (let y = Math.round(cy - hh); y <= Math.round(cy + hh * 0.8); y++) { const rel = (y - cy) / hh; P(dg, x + 2, y, rel > 0.3 ? '#d8ecf2' : rel < -0.6 ? '#8fb0c6' : rel < -0.1 ? '#7896ad' : '#5d7d96'); } }
    [[15, 3], [16, 3], [17, 3], [16, 2], [17, 2], [18, 2], [17, 1], [18, 1], [19, 1], [19, 0], [20, 0], [18, 3], [19, 3], [19, 2]].forEach(([x, y]) => P(dg, x, y, '#5d7d96'));
    [[31, 6], [32, 6], [33, 5], [34, 5], [35, 4], [31, 7], [32, 7], [33, 8], [34, 8], [35, 9], [32, 5], [32, 8]].forEach(([x, y]) => P(dg, x, y, '#5d7d96'));
    [[11, 12], [12, 13], [13, 13], [12, 12]].forEach(([x, y]) => P(dg, x, y, '#5d7d96'));
    P(dg, 7, 7, '#0a1a27'); P(dg, 3, 10, '#3a4e60'); P(dg, 4, 10, '#3a4e60'); P(dg, 5, 10, '#3a4e60');
    let o = outline(c, '#0a1a27'); if (flip) { const f = mk(o.width, o.height); f.g.translate(o.width, 0); f.g.scale(-1, 1); f.g.drawImage(o, 0, 0); o = f; } g.drawImage(o, x0, y0); return o; };
  dolph(318, 22, false); const dO = dolph(356, 36, false);
  /* plankton */
  for (let i = 0; i < 70; i++) { const x = rnd() * uw, y = rnd() * 96; P(g, x, y, x > 220 ? '#9fd4e6' : '#7a8a78', 0.6); }
  /* yüzey: dalgalı kesik */
  const cut = mk(uw, uh); cut.g.drawImage(U, 0, 0);
  const cd = cut.g.getImageData(0, 0, uw, uh); for (let x = 0; x < uw; x++) { const t = 3 + Math.round(Math.sin(x * 0.11) * 1.5 + Math.sin(x * 0.29 + 2) * 0.8); for (let y = 0; y < t; y++) cd.data[(y * uw + x) * 4 + 3] = 0; }
  cut.g.putImageData(cd, 0, 0);
  for (let x = 0; x < uw; x++) { const t = 3 + Math.round(Math.sin(x * 0.11) * 1.5 + Math.sin(x * 0.29 + 2) * 0.8); P(cut.g, x, t, '#cfe9f2'); P(cut.g, x, t + 1, hash(x, 1) > 0.5 ? '#9fd4e6' : '#2f8aad'); if (hash(x >> 1, 3) > 0.7) P(cut.g, x, t - 1, '#f4fbff'); }
  R(G, 0, oy + 8, W, H, '#0a1a27');
  up(G, cut, 0, oy, s);
  /* Şahmeran fısıltısı */
  const B = mk(186, 34); panel(B.g, 0, 0, 184, 27, { fill: '#0d3f55', hi: '#2f8aad', trim: '#3a8a5a' });
  [[150, 26, 5], [151, 27, 4], [152, 28, 3], [153, 29, 2], [154, 30, 1]].forEach(([x, y, w]) => { R(B.g, x - 1, y, w + 2, 1, '#0a1a27'); R(B.g, x, y, w, 1, '#0d3f55'); });
  up(G, B, 880, 548, 2);
  txt(G, 'ŞAHMERAN · uykusunda', 904, 556, { size: 10, col: '#6fbf7a', s: 2, w: 700 });
  txt(G, '"Ağını ölçülü at. Deniz unutmaz."', 904, 578, { size: 10, col: '#cfe9f2', s: 2 });
  /* --- sol: DENİZİN HAFIZASI ölçeri (s=2) --- */
  const M = mk(84, 400), mg = M.g; panel(mg, 0, 0, 84, 400, { trim: '#c9952f' });
  up(G, M, 22, 50, 2);
  txt(G, 'DENİZİN', 106, 74, { size: 12, col: '#ffc94a', s: 2, w: 700, al: 'c' });
  txt(G, 'HAFIZASI', 106, 102, { size: 12, col: '#ffc94a', s: 2, w: 700, al: 'c' });
  const GB = mk(30, 300), gg = GB.g; const SEG = ['#e5533d', '#d9643a', '#c9782f', '#d9a441', '#c9b84a', '#9fbf5a', '#6fc96a', '#5fd37a', '#3fb79a', '#2fa6c4', '#1f8fbf', '#1f8fbf'];
  R(gg, 0, 0, 30, 300, '#0a1a27'); for (let i = 0; i < 12; i++) { const y = 296 - (i + 1) * 24 + 2, on = i < 8; R(gg, 3, y, 24, 20, on ? SEG[i] : '#1d3a52'); if (on) { R(gg, 3, y, 24, 2, lite(SEG[i], 0.35)); R(gg, 3, y + 18, 24, 2, dark(SEG[i], 0.3)); } }
  up(G, GB, 74, 150, 2);
  /* işaretçi */
  const ar = spr(['....k', '..kyk', 'kyyyk', 'kyyyk', '..kyk', '....k'], { k: '#0a1a27', y: '#ffc94a' });
  const my = 150 + (296 - 8 * 24) * 2 - 10; up(G, ar, 140, my, 4);
  txt(G, '%68', 142, my - 30, { size: 10, col: '#ffc94a', s: 2, ol: '#0a1a27' });
  txt(G, 'bereketli', 106, 128, { size: 10, col: '#5fd37a', s: 2, al: 'c' });
  txt(G, 'yorgun', 106, 752, { size: 10, col: '#e5533d', s: 2, al: 'c' });
  const ic = (n, x, y) => up(G, icon(n), x, y, 3);
  /* durum satırları */
  [['hamsi', 'SÜRÜ', '↑'], ['ag', 'AĞ', 'ölçülü'], ['nazar', 'YUNUS', '2']].forEach(([n, a, b], i) => { const y = 160 + i * 0; });
  /* sağ üstte bildirim */
  const T = mk(232, 32); panel(T.g, 0, 0, 232, 32, { trim: '#5fd37a' }); up(G, T, 1100, 22, 2);
  up(G, dO, 1112, 32, 2);
  txt(G, 'Yunuslar geri döndü!', 1210, 32, { size: 10, col: '#5fd37a', s: 2, w: 700 });
  txt(G, 'Deniz hatırlıyor.', 1210, 58, { size: 10, col: '#f4e9d2', s: 2 });
  /* ölçer ikonları */

  return C.toDataURL();
};

/* ===== D2 · Kuşaklar Boyu Liman: aynı liman üç dönem (sepya / soluk / canlı) + üç kuşak ===== */
DRAW['2'] = async function (img) {
  const C = mk(W, H), G = C.g;
  const BG = mk(400, 225); vgrad(BG.g, 0, 0, 400, 225, ['#14293c', '#11243a', '#0f2033', '#0c1b2b', '#0a1a27']); up(G, BG, 0, 0, 4);
  kilimBand(G, 0, 5, 4); kilimBand(G, 880, 5, 4);
  const ERA = [
    { y: '1974', im: 'donem-1974', f: sepia, k: 'kisi-dede74', ad: 'Rıza Reis', ks: '1. KUŞAK · DEDE', ic: 'ag', yt: 'Usta ağcı', paper: '#efe4c9' },
    { y: '1994', im: 'donem-1994', f: faded, k: 'kisi-baba94', ad: 'Kemal Kaptan', ks: '2. KUŞAK · OĞUL', ic: 'buzhane', yt: 'Buzhane & nakliye', paper: '#f1ebda' },
    { y: '2024', im: 'donem-2024', f: vivid, k: 'kisi-torun24', ad: 'Deniz', ks: '3. KUŞAK · TORUN', ic: 'itibar', yt: 'Turizm & festival', paper: '#ffffff' }];
  for (let i = 0; i < 3; i++) {
    const E = ERA[i], px = 45 + i * 520, py = 52, pw = 470, ph = 600;
    const im = await load(img[E.im]);
    const ph1 = filt(im, 75, 175, pw, ph, E.f);
    /* fotoğraf kenarı + gölge */
    R(G, px - 12 + 8, py - 12 + 8, pw + 24, ph + 24, '#050d14', 0.6);
    R(G, px - 14, py - 14, pw + 28, ph + 28, '#0a1a27');
    R(G, px - 12, py - 12, pw + 24, ph + 24, E.paper); R(G, px - 12, py + ph + 8, pw + 24, 4, dark(E.paper, 0.15));
    G.drawImage(ph1, px, py);
    R(G, px, py, pw, 2, '#0a1a27', 0.35);
    /* albüm köşelikleri */
    const corner = (x, y, dx, dy) => { for (let a = 0; a < 7; a++) for (let b = 0; b < 7 - a; b++) R(G, x + dx * a * 4 - (dx < 0 ? 4 : 0), y + dy * b * 4 - (dy < 0 ? 4 : 0), 4, 4, (a + b) === 6 - 0 ? '#5a3a22' : '#3b2a1c'); };
    corner(px - 16, py - 16, 1, 1); corner(px + pw + 16, py - 16, -1, 1); corner(px - 16, py + ph + 16, 1, -1); corner(px + pw + 16, py + ph + 16, -1, -1);
    if (i === 1) txt(G, "'94 08 17", px + 150, py + ph - 34, { size: 10, col: '#ff9a3a', s: 2, al: 'r', ol: '#7a2a10' });
    if (i === 0) { for (let n = 0; n < 160; n++) R(G, px + hash(n, 3) * pw, py + hash(n, 9) * ph, 2, 2, hash(n, 5) > 0.5 ? '#efe4c9' : '#2c231a', 0.35); }
    /* yıl plakası */
    const Y = mk(70, 26); panel(Y.g, 0, 0, 70, 26, { trim: '#c9952f' }); up(G, Y, px - 4, py - 4 + 12, 2);
    txt(G, E.y, px - 4 + 70, py + 15, { size: 16, col: '#ffc94a', s: 2, w: 700, al: 'c', sh: '#0a1a27' });
    /* kuşak karakteri (aynı süzgeçle) */
    const kim = await load(img[E.k]); const kc = filt(kim, 0, 0, kim.width, kim.height, (r, g, b) => E.f(r, g, b)); 
    { const d = kc.g.getImageData(0, 0, kc.width, kc.height), o = kim; const t = mk(kim.width, kim.height); t.g.drawImage(kim, 0, 0); const a = t.g.getImageData(0, 0, t.width, t.height).data; for (let q = 3; q < a.length; q += 4) d.data[q] = a[q]; kc.g.putImageData(d, 0, 0); }
    up(G, kc, px - 30, 878 - 88 * 3, 3);
    /* isim plakası */
    const N = mk(150, 66); panel(N.g, 0, 0, 150, 66, { trim: i === 2 ? '#1f8fbf' : '#c9952f' }); up(G, N, px + 172, 700, 2);
    txt(G, E.ad, px + 196, 716, { size: 12, col: '#ffc94a', s: 2, w: 700 });
    txt(G, E.ks, px + 196, 752, { size: 10, col: '#a9c0cf', s: 2 });
    up(G, icon(E.ic), px + 196, 796, 3);
    txt(G, E.yt, px + 240, 796, { size: 10, col: '#f4e9d2', s: 2 });
    /* devir oku */
    if (i < 2) { const A = mk(20, 20); for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) { const d = (x - 9.5) ** 2 + (y - 9.5) ** 2; if (d < 90) P(A.g, x, y, d > 70 ? '#0a1a27' : y < 8 ? '#ffc94a' : '#d9a441'); }
      [[6, 6], [7, 7], [8, 8], [9, 9], [8, 10], [7, 11], [6, 12], [10, 6], [11, 7], [12, 8], [13, 9], [12, 10], [11, 11], [10, 12]].forEach(([x, y]) => { P(A.g, x, y, '#3b2a1c'); });
      up(G, A, px + pw + 25 - 20, py + 280, 2); }
  }
  return C.toDataURL();
};

/* ===== D3 · Gerçek Karadeniz Takvimi: telefonda oyun + gerçek harita (hamsi göçü, hava, av yasağı takvimi) ===== */
DRAW['3'] = async function (img) {
  const C = mk(W, H), G = C.g;
  const BG = mk(400, 225); vgrad(BG.g, 0, 0, 400, 225, ['#14293c', '#11243a', '#0f2033', '#0c1b2b', '#0a1a27']);
  for (let y = 0; y < 225; y++) for (let x = 0; x < 400; x++) if ((x % 25 === 0 && y % 2 === 0) || (y % 25 === 0 && x % 2 === 0)) P(BG.g, x, y, '#1d3a52');
  up(G, BG, 0, 0, 4);
  /* --- harita --- */
  const MX = 568, MY = 48, mw = 246, mh = 199, Mc = mk(mw, mh), mg = Mc.g, K = 24, CO = 0.725;
  const proj = (lon, lat) => [(lon - 28.0) * CO * K, (46.95 - lat) * K];
  const FR = mk(252, 205); panel(FR.g, 0, 0, 252, 205, { trim: '#c9952f' }); up(G, FR, MX - 12, MY - 12, 4);
  drawMap(mg, mw, mh, proj);
  /* hamsi göçü */
  const route = [[36.3, 45.05], [36.9, 44.45], [37.8, 43.75], [38.8, 42.95], [39.6, 42.2], [40.1, 41.55]].map(q => proj(q[0], q[1]));
  const pts = []; for (let i = 0; i < route.length - 1; i++) { const [x0, y0] = route[i], [x1, y1] = route[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2); for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); }
  pts.forEach(([x, y], i) => { R(mg, x - 2, y - 2, 4, 4, '#0a1a27'); }); pts.forEach(([x, y], i) => { if ((i >> 2) % 3 !== 2) R(mg, x - 1, y - 1, 2, 2, '#ffc94a'); });
  { const [ex, ey] = route[route.length - 1]; for (let k = 0; k < 6; k++) { R(mg, ex - k - 1, ey - 1 + k - 6, 2 * k + 3, 1, '#0a1a27'); } for (let k = 0; k < 5; k++) R(mg, ex - k, ey + k - 6, 2 * k + 1, 1, '#ffc94a'); }
  /* kıyı şehirleri */
  const CITY = [['Sinop', 35.15, 42.02, 'r'], ['Samsun', 36.33, 41.28, 'b'], ['Trabzon', 39.72, 41.0, 'b'], ['Rize', 40.52, 41.02, 'b'], ['İstanbul', 29.0, 41.05, 'b']];
  CITY.forEach(([n, lo, la]) => { const [x, y] = proj(lo, la); R(mg, x - 2, y - 2, 4, 4, '#0a1a27'); R(mg, x - 1, y - 1, 2, 2, '#f1ebda'); });
  up(G, Mc, MX, MY, 4);
  const FP = (lo, la) => { const [x, y] = proj(lo, la); return [MX + x * 4, MY + y * 4]; };
  CITY.forEach(([n, lo, la, al]) => { const [x, y] = FP(lo, la); if (n === 'İstanbul' || n === 'Rize' || n === 'Trabzon') return; txt(G, n, x, y + 12, { size: 10, col: '#f4e9d2', s: 2, ol: '#0a1a27', al: 'c' }); });
  txt(G, 'K A R A D E N İ Z', FP(31.6, 43.7)[0], FP(31.6, 43.7)[1], { size: 12, col: '#2f8aad', s: 2, al: 'c' });
  { const [x, y] = FP(37.3, 44.0); up(G, icon('hamsi'), x - 54, y - 6, 3); const [x2, y2] = FP(39.1, 42.65); up(G, icon('hamsi'), x2 - 50, y2 - 4, 3);
    const [lx, ly] = FP(37.0, 44.35); txt(G, 'HAMSİ GÖÇÜ', lx - 26, ly, { size: 12, col: '#ffc94a', s: 2, w: 700, ol: '#0a1a27', al: 'r' }); txt(G, 'Kasım: Azak\'tan Rize\'ye', lx - 26, ly + 32, { size: 10, col: '#f4e9d2', s: 2, ol: '#0a1a27', al: 'r' }); }
  /* hava: Sinop fırtına, Trabzon parçalı */
  const SN = FP(35.15, 42.02); { const [x, y] = SN; up(G, cloudIcon('storm'), x - 48, y - 110, 3);
    const P1 = mk(112, 30); panel(P1.g, 0, 0, 112, 30, { trim: '#e5533d' }); up(G, P1, x - 300, y - 104, 2);
    txt(G, 'SİNOP · ŞU AN', x - 282, y - 96, { size: 10, col: '#ffc94a', s: 2 }); txt(G, 'Fırtına · 8 bofor', x - 282, y - 72, { size: 10, col: '#f4e9d2', s: 2 }); }
  { const [x, y] = FP(39.72, 41.0); up(G, cloudIcon('sun'), x - 150, y + 40, 3);
    const P2 = mk(92, 30); panel(P2.g, 0, 0, 92, 30, { trim: '#c9952f' }); up(G, P2, x - 50, y + 44, 2);
    txt(G, 'TRABZON', x - 32, y + 52, { size: 10, col: '#ffc94a', s: 2 }); txt(G, '14° · parçalı', x - 32, y + 76, { size: 10, col: '#f4e9d2', s: 2 }); }
  /* harita başlık plakası */
  const TP = mk(130, 22); panel(TP.g, 0, 0, 130, 22, { trim: '#c9952f' }); up(G, TP, MX + 12, MY + 8, 2);
  R(G, MX + 34, MY + 26, 10, 10, '#e5533d'); R(G, MX + 36, MY + 24, 6, 14, '#e5533d'); R(G, MX + 32, MY + 28, 14, 6, '#e5533d');
  txt(G, 'KARADENİZ · ŞU AN', MX + 56, MY + 18, { size: 10, col: '#f4e9d2', s: 2 });
  /* --- takvim (s=2) --- */
  const CX = 596, CY = 500, cw = 172, ch = 142, Ca = mk(cw, ch), cg = Ca.g;
  R(cg, 0, 4, cw, ch - 4, '#3b2a1c'); R(cg, 1, 5, cw - 2, ch - 6, '#ede4cf'); R(cg, 1, ch - 3, cw - 2, 1, '#d8cfb8'); R(cg, 1, 5, cw - 2, 22, '#a83d2b'); R(cg, 1, 5, cw - 2, 1, '#cb5b40'); R(cg, 1, 26, cw - 2, 1, '#7d2c1d');
  [40, cw - 44].forEach(x => { R(cg, x, 0, 4, 10, '#0a1a27'); R(cg, x + 1, 1, 2, 8, '#8b949c'); });
  const cols = 7, cwid = 24, gx = 3, gy = 42, rh = 19;
  for (let d = 1; d <= 30; d++) { const k = d + 1 - 1 + 1, col = (d + 0) % 7, idx = d + 1 - 1 + 1 - 1; const pos = d - 1 + 1; const c0 = (pos) % 7, r0 = Math.floor((pos) / 7);
    const x = gx + c0 * cwid, y = gy + r0 * rh;
    if (d >= 15) { for (let yy = 0; yy < rh - 2; yy++) for (let xx = 0; xx < cwid - 2; xx++) if ((xx + yy) % 4 === 0) P(cg, x + xx, y + yy, '#e5533d', 0.45); }
  }
  up(G, Ca, CX, CY, 2);
  txt(G, 'NİSAN', CX + cw - 12, CY + 14, { size: 12, col: '#f1ebda', s: 2, w: 700, al: 'r' }); dig(G, '1975', CX + cw + 4, CY + 20, 3, '#f1ebda');
  ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].forEach((d, i) => txt(G, d, CX + (gx + i * cwid + cwid / 2 - 1) * 2, CY + 60, { size: 10, col: i === 6 ? '#a83d2b' : '#5a4731', s: 2, al: 'c' }));
  for (let d = 1; d <= 30; d++) { const pos = d; const c0 = pos % 7, r0 = Math.floor(pos / 7); const x = CX + (gx + c0 * cwid + cwid / 2 - 1) * 2, y = CY + (gy + r0 * rh) * 2 + 2;
    dig(G, String(d), x, y + 4, 3, c0 === 6 ? '#a83d2b' : '#2c231a', 'c');
    if (d === 15) { for (let a = 0; a < 48; a++) { const t = a / 48 * 6.283; R(G, Math.round(x + Math.cos(t) * 22 - 2), Math.round(y + 14 + Math.sin(t) * 18 - 2), 4, 4, '#c62828'); } } }
  /* şerit */
  const RB = mk(214, 26), rg = RB.g; R(rg, 0, 6, 12, 16, '#7d2c1d'); R(rg, 202, 6, 12, 16, '#7d2c1d'); for (let y = 6; y < 22; y++) { const k = Math.abs(y - 14); P(rg, k > 4 ? 0 : -1, y, 'rgba(0,0,0,0)'); }
  R(rg, 0, 6, 4, 16, '#0a1a27'); R(rg, 210, 6, 4, 16, '#0a1a27'); R(rg, 2, 13, 3, 2, '#0a1a27'); R(rg, 209, 13, 3, 2, '#0a1a27');
  R(rg, 8, 1, 198, 22, '#0a1a27'); R(rg, 9, 2, 196, 20, '#c62828'); R(rg, 9, 2, 196, 2, '#e5533d'); R(rg, 9, 19, 196, 3, '#8a1c1c');
  up(G, RB, CX + cw - 214, CY + ch * 2 + 4, 2);
  up(G, icon('uyari'), CX + cw - 214 + 30, CY + ch * 2 + 14, 2);
  { const a = 'AV YASAĞI BAŞLIYOR · ', b = ' NİSAN', wa = tw(a, 10, 2), wb = tw(b, 10, 2), wd = 33, x0 = CX + cw + 16 - (wa + wd + wb) / 2, yy = CY + ch * 2 + 14; txt(G, a, x0, yy, { size: 10, col: '#ffffff', s: 2, sh: '#5a0e0e' }); dig(G, '15', x0 + wa, yy + 6, 3, '#ffffff'); txt(G, b, x0 + wa + wd, yy, { size: 10, col: '#ffffff', s: 2, sh: '#5a0e0e' }); }
  /* --- telefon --- */
  const ph = await load(img['dikey-hud']); const sx = 96, sy = 104;
  const PH = mk(206, 378), pg = PH.g; R(pg, 3, 0, 200, 378, '#05080a'); R(pg, 0, 3, 206, 372, '#05080a'); R(pg, 1, 1, 204, 376, '#05080a');
  R(pg, 2, 2, 202, 374, '#1b1f24'); R(pg, 3, 3, 1, 370, '#3a434d'); R(pg, 202, 3, 1, 370, '#0f1216'); R(pg, 80, 7, 46, 4, '#05080a'); R(pg, 92, 7, 2, 2, '#26303a');
  up(G, PH, sx - 16, sy - 32, 2);
  G.drawImage(ph, 0, 0, 760, 1384, sx, sy, 380, 692);
  /* fırtına: karartma + yağmur + şimşek */
  for (let y = 0; y < 330; y += 2) for (let x = 0; x < 380; x += 2) { const f = 0.55 * (1 - y / 330); if (BAY[(y >> 1) & 3][(x >> 1) & 3] < f) R(G, sx + x, sy + 60 + y, 2, 2, '#14293c', 0.7); }
  for (let i = 0; i < 160; i++) { const x = sx + hash(i, 1) * 372, y = sy + 66 + hash(i, 2) * 560; for (let k = 0; k < 4; k++) R(G, x - k * 2, y + k * 4, 2, 4, '#b8d4e2', 0.55); }
  [[300, 70], [296, 76], [292, 82], [298, 82], [294, 88], [290, 94], [286, 100]].forEach(([x, y]) => R(G, sx + x, sy + y + 40, 4, 6, '#ffe27a'));
  /* oyun içi bildirim */
  const TO = mk(180, 32); panel(TO.g, 0, 0, 180, 32, { trim: '#e5533d' }); up(G, TO, sx + 10, sy + 66, 2);
  up(G, cloudIcon('storm'), sx + 18, sy + 72, 2);
  txt(G, 'SİNOP\'TA FIRTINA', sx + 86, sy + 74, { size: 10, col: '#ffc94a', s: 2, w: 700 });
  txt(G, 'Tekneler bugün limanda.', sx + 86, sy + 98, { size: 10, col: '#f4e9d2', s: 2 });
  /* biliyor muydun kartı */
  const BK = mk(176, 52), bg2 = BK.g; R(bg2, 1, 0, 174, 52, '#3b2a1c'); R(bg2, 0, 1, 176, 50, '#3b2a1c'); R(bg2, 1, 1, 174, 50, '#ede4cf'); R(bg2, 1, 1, 174, 12, '#2a4c7d'); R(bg2, 1, 49, 174, 2, '#d8cfb8');
  up(G, BK, sx + 14, sy + 516, 2);
  txt(G, 'BİLİYOR MUYDUN?', sx + 30, sy + 518, { size: 10, col: '#ffc94a', s: 2, w: 700 });
  up(G, icon('hamsi'), sx + 24, sy + 556, 3);
  txt(G, 'Hamsi kışı Doğu', sx + 70, sy + 552, { size: 10, col: '#2c231a', s: 2 });
  txt(G, 'Karadeniz\'de geçirir.', sx + 70, sy + 574, { size: 10, col: '#2c231a', s: 2 });
  /* bağlantı: gerçek fırtına → oyundaki fırtına */
  { const [x, y] = SN; const x0 = sx + 372, y0 = sy + 98, x1 = x - 304, y1 = y - 74; const n = 34; for (let i = 0; i <= n; i++) { const t = i / n, xx = x0 + (x1 - x0) * t, yy = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 60; if (i % 2 === 0) { R(G, xx - 3, yy - 3, 8, 8, '#0a1a27'); R(G, xx - 1, yy - 1, 4, 4, '#ffc94a'); } } }
  return C.toDataURL();
};

/* ===== D4 · Komşu Limanlar: kıyı haritası, 5 oyuncu limanı, tekne rotaları, fırtına, kıyı gazetesi ===== */
DRAW['4'] = async function (img) {
  const C = mk(W, H), G = C.g, s = 4, w = 400, h = 225, M = mk(w, h), g = M.g, K = 46.8, CO = 0.749;
  const proj = (lon, lat) => [(lon - 30.6) * CO * K, (44.6 - lat) * K];
  const mp = drawMap(g, w, h, proj, 7);
  const isSea = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mp.sea[(y | 0) * w + (x | 0)] === 1;
  /* dağlar ve ormanlar (iç kesim) */
  const coastY = x => { for (let y = 0; y < h; y++) if (!isSea(x, y) && y > 40) return y; return h; };
  const mount = (cx, by, hw, hh, snow) => { const c = mk(hw * 2 + 1, hh + 1); for (let y = 0; y <= hh; y++) { const ww = Math.round(hw * y / hh); for (let x = -ww; x <= ww; x++) P(c.g, hw + x, y, y < 2 && snow ? '#f1ebda' : y < 3 && snow ? '#c8ced2' : x < 0 ? '#6f8a4a' : x === 0 ? '#5a7040' : '#3f5a32'); } g.drawImage(outline(c, '#1e3020'), cx - hw - 1, by - hh - 1); };
  for (let i = 0; i < 70; i++) { const x = 6 + hash(i, 41) * 388, cy = coastY(Math.round(x)); const y = cy + 16 + hash(i, 42) * (h - cy - 18); if (y > h - 2 || y < cy + 12 || isSea(x, y) || isSea(x, y - 10) || isSea(x - 6, y) || isSea(x + 6, y)) continue; const east = x > 300; mount(Math.round(x), Math.round(y), east ? 5 + (i % 3) : 3 + (i % 3), east ? 6 + (i % 4) : 3 + (i % 3), east && i % 2 === 0); }
  for (let i = 0; i < 260; i++) { const x = Math.round(hash(i, 51) * 399), cy = coastY(x), y = Math.round(cy + 4 + hash(i, 52) * (h - cy)); if (y >= h || isSea(x, y)) continue; P(g, x, y - 1, '#436b45'); P(g, x, y, '#2f5136'); P(g, x, y + 1, '#1e3a26'); }
  /* limanlar */
  const HB = [
    { ad: 'MERT · EREĞLİ', lon: 31.45, lat: 41.28, st: 'Hamsi fazlası: 120 kasa', ic: 'hamsi', px: 0, py: -150 },
    { ad: 'SEN · HAMSİ KOYU', lon: 33.76, lat: 41.98, st: 'Hal\'e 40 kasa gidiyor', ic: 'nakliye', px: -20, py: 130, me: 1 },
    { ad: 'AYŞE · SİNOP', lon: 35.15, lat: 42.03, st: 'Festival rekoru!', ic: 'itibar', px: 50, py: -140 },
    { ad: 'ELİF · ORDU', lon: 37.88, lat: 40.98, st: 'Buzhane dolu', ic: 'buzhane', px: -60, py: -170 },
    { ad: 'YUSUF · RİZE', lon: 40.52, lat: 41.02, st: 'Fırtınaya hazır', ic: 'fener', px: -70, py: -170 }];
  HB.forEach(q => { let [x, y] = proj(q.lon, q.lat); x = Math.round(x); y = Math.round(y); let k = 0; while (!isSea(x, y) && k < 30) { y--; k++; } q.x = x; q.y = y; });
  /* rotalar */
  const boatS = spr(['....k....', '...kwk...', '..kbwbk..', 'kkkkkkkkk', 'krrrrrrrk', '.kRRRRRk.', '..kkkkk..'], { k: '#0a1a27', w: '#f1ebda', b: '#ab7a48', r: '#c62828', R: '#7d2c1d' });
  const ROUTES = [[0, 1, 22], [1, 2, 18], [2, 3, 34], [3, 4, 26], [1, 4, 70]];
  ROUTES.forEach(([a, b, bend], ri) => { const A = HB[a], B = HB[b], mx = (A.x + B.x) / 2, my = Math.min(A.y, B.y) - bend; const n = Math.round(Math.hypot(B.x - A.x, B.y - A.y) * 1.6);
    for (let i = 3; i < n - 3; i++) { const t = i / n, x = (1 - t) * (1 - t) * A.x + 2 * t * (1 - t) * mx + t * t * B.x, y = (1 - t) * (1 - t) * (A.y - 3) + 2 * t * (1 - t) * my + t * t * (B.y - 3); if (i % 4 < 2) { P(g, x, y + 1, '#0a3346'); P(g, x, y, ri === 4 ? '#ffc94a' : '#ede4cf'); } }
    if (ri !== 1) { const t = ri === 4 ? 0.55 : 0.45, x = (1 - t) * (1 - t) * A.x + 2 * t * (1 - t) * mx + t * t * B.x, y = (1 - t) * (1 - t) * (A.y - 3) + 2 * t * (1 - t) * my + t * t * (B.y - 3); g.drawImage(boatS, Math.round(x) - 4, Math.round(y) - 6); for (let k = 1; k < 4; k++) P(g, Math.round(x) - 5 - k * 2, Math.round(y), '#cfe9f2', 0.6); } });
  /* liman simgeleri */
  HB.forEach(q => { const c = mk(26, 16), cg = c.g;
    for (let i = 0; i < 12; i++) { R(cg, 3 + i, 9 + Math.floor(i / 3), 7, 1, i % 2 ? '#ab7a48' : '#c9975f'); } R(cg, 3, 13, 18, 1, '#6f4526');
    [[13, 3], [19, 5]].forEach(([x, y]) => { R(cg, x, y + 2, 5, 4, '#f1ebda'); R(cg, x + 3, y + 2, 2, 4, '#d8cfb8'); R(cg, x - 1, y, 7, 2, '#cb5b40'); R(cg, x + 3, y, 3, 2, '#7d2c1d'); R(cg, x + 1, y + 3, 1, 1, '#2a4c7d'); });
    if (q.me) { R(cg, 1, 1, 1, 8, '#5d666e'); R(cg, 2, 1, 4, 3, '#c62828'); }
    g.drawImage(outline(c, '#0a1a27'), q.x - 13, q.y - 10); });
  /* fırtına bulutları (doğudan yaklaşıyor) */
  for (let y = 0; y < 40; y++) for (let x = 250; x < w; x++) { const n = vn(x / 14, y / 7, 3) * 0.7 + vn(x / 5, y / 4, 8) * 0.3, f = n - y / 46 + (x - 250) / 300; if (f > 0.42) P(g, x, y, f > 0.72 ? '#3a4048' : f > 0.58 ? '#5a6167' : '#8d959b'); else if (f > 0.3 && BAY[y & 3][x & 3] < 0.4) P(g, x, y, '#5a6167', 0.6); }
  for (let i = 0; i < 70; i++) { const x = 270 + hash(i, 61) * 130, y = 24 + hash(i, 62) * 34; for (let k = 0; k < 3; k++) P(g, x - k, y + k, '#9fb8c8', 0.6); }
  [[352, 26], [351, 27], [350, 28], [351, 28], [352, 28], [351, 29], [350, 30], [349, 31]].forEach(([x, y]) => P(g, x, y, '#ffe27a'));
  up(G, M, 0, 0, s);
  /* isim plakaları */
  HB.forEach(q => { const X = q.x * s, Y = q.y * s - 40, bx = Math.max(20, Math.min(W - 270, X + q.px - 120)), by = Y + q.py;
    for (let yy = (by > Y ? Y + 44 : by + 72); yy < (by > Y ? by : Y); yy += 8) { R(G, X - 3, yy, 6, 4, '#0a1a27'); R(G, X - 1, yy, 2, 4, q.me ? '#1f8fbf' : '#ffc94a'); }
    const pl = mk(126, 36); panel(pl.g, 0, 0, 126, 36, { trim: q.me ? '#1f8fbf' : '#c9952f', fill: q.me ? '#163a50' : '#14293c' }); up(G, pl, bx, by, 2);
    txt(G, q.ad, bx + 16, by + 10, { size: 12, col: q.me ? '#9fd4e6' : '#ffc94a', s: 2, w: 700 });
    up(G, icon(q.ic), bx + 14, by + 42, 2); txt(G, q.st, bx + 46, by + 40, { size: 10, col: '#f4e9d2', s: 2 }); });
  /* fırtına uyarısı */
  const FT = mk(206, 30); panel(FT.g, 0, 0, 206, 30, { trim: '#e5533d' }); up(G, FT, 1140, 236, 2);
  up(G, icon('uyari'), 1156, 252, 3);
  txt(G, 'FIRTINA YAKLAŞIYOR', 1206, 244, { size: 12, col: '#ffc94a', s: 2, w: 700 });
  txt(G, 'Kıyı birlikte hazırlanıyor', 1206, 274, { size: 10, col: '#f4e9d2', s: 2 });
  /* kıyı gazetesi */
  const NX = 36, NY = 30, nw = 214, nh = 142, NP = mk(nw, nh + 4), ng = NP.g;
  R(ng, 1, 0, nw - 2, nh, '#2c231a'); R(ng, 0, 1, nw, nh - 2, '#2c231a'); R(ng, 1, 1, nw - 2, nh - 2, '#efe4c9');
  for (let x = 0; x < nw; x++) { const t = 2 + ((x * 7) % 5 > 2 ? 1 : 0) + (x % 9 === 0 ? 1 : 0); R(ng, x, nh - t, 1, t + 4, 'rgba(0,0,0,0)'); ng.clearRect(x, nh - t, 1, t + 4); P(ng, x, nh - t - 1, '#2c231a'); }
  for (let i = 0; i < 90; i++) P(ng, 2 + hash(i, 71) * (nw - 4), 2 + hash(i, 72) * (nh - 8), '#d9c9a3');
  R(ng, 8, 25, nw - 16, 1, '#2c231a'); R(ng, 8, 27, nw - 16, 1, '#2c231a'); R(ng, 8, 40, nw - 16, 1, '#5a4731');
  const shotI = await load(img['yatay-dolu-z2']); const ph = filt(shotI, 690, 300, 170, 104, sepia);
  ng.drawImage(ph, 0, 0, 170, 104, 8, 72, 85, 52); R(ng, 7, 71, 87, 1, '#2c231a'); R(ng, 7, 124, 87, 1, '#2c231a'); R(ng, 7, 71, 1, 54, '#2c231a'); R(ng, 93, 71, 1, 54, '#2c231a');
  for (let r = 0; r < 12; r++) { const y = 74 + r * 4.4; R(ng, 100, y, (r % 5 === 4 ? 60 : 104), 2, '#8f7a57'); }
  up(G, NP, NX, NY, 2);
  /* fotoğrafı tam ölçekte bas (daha ince) */
  G.drawImage(ph, NX + 16, NY + 144); R(G, NX + 14, NY + 142, 174, 2, '#2c231a'); R(G, NX + 14, NY + 248, 174, 2, '#2c231a'); R(G, NX + 14, NY + 142, 2, 108, '#2c231a'); R(G, NX + 186, NY + 142, 2, 108, '#2c231a');
  txt(G, 'KIYI GAZETESİ', NX + nw, NY + 8, { size: 16, col: '#2c231a', s: 2, w: 700, al: 'c' });
  txt(G, 'Bütün limanların gazetesi', NX + nw, NY + 56, { size: 10, col: '#5a4731', s: 2, al: 'c' });
  txt(G, 'Sinop\'taki Ayşe\'nin limanı', NX + 18, NY + 86, { size: 12, col: '#2c231a', s: 2, w: 700 });
  txt(G, 'festivalde rekor kırdı!', NX + 18, NY + 114, { size: 12, col: '#2c231a', s: 2, w: 700 });
  return C.toDataURL();
};

/* ===== D5 · Dede Masalları Arşivi: tezgâh önünde masal anlatan dede + arşiv kartı ===== */
DRAW['5'] = async function (img) {
  const C = mk(W, H), G = C.g, bg = await load(img['yatay-tezgah-z3']);
  G.drawImage(bg, 0, 0);
  /* akşamüstü loşluğu, tezgâhın çevresi aydınlık */
  const D = mk(200, 113); for (let y = 0; y < 113; y++) for (let x = 0; x < 200; x++) { const dx = (x - 105) / 62, dy = (y - 72) / 50, r = Math.sqrt(dx * dx + dy * dy); const lv = r < 0.7 ? 0 : r < 0.9 ? 1 : r < 1.15 ? 2 : 3; if (lv) P(D.g, x, y, '#0a1a27', [0, 0.18, 0.34, 0.5][lv]); }
  up(G, D, 0, 0, 8);
  /* dede (oyunun karakter çizimiyle), tezgâha dönük */
  const ki = await load(img['kisi-husnu']); const kf = mk(ki.width, ki.height); kf.g.translate(ki.width, 0); kf.g.scale(-1, 1); kf.g.drawImage(ki, 0, 0);
  const fx = 935, fy = 724; for (let i = -9; i <= 9; i++) R(G, fx + i * 6 - 3, fy - 6 + Math.abs(i) * 0.4, 6, 9 - Math.abs(i) * 0.6, '#0a1a27', 0.3);
  up(G, kf, fx - 120, fy - 264, 3);
  /* baston */
  R(G, fx - 56, fy - 130, 6, 132, '#3b2a1c'); R(G, fx - 54, fy - 130, 2, 130, '#6f4526'); R(G, fx - 62, fy - 136, 18, 6, '#3b2a1c'); R(G, fx - 60, fy - 134, 14, 2, '#8a5a33');
  /* ses halkaları */
  [[0, 14], [1, 24], [2, 34]].forEach(([k, r]) => { for (let a = -50; a <= 50; a += 7) { const t = (a - 180) * Math.PI / 180; R(G, Math.round(fx - 70 + Math.cos(t) * r * 1.4), Math.round(fy - 196 + Math.sin(t) * r), 6, 6, '#ffc94a', 0.9 - k * 0.25); } });
  /* konuşma balonu: ses dalgası */
  const BX = 470, BY = 236, bw = 226, bh = 60, B = mk(bw, bh + 40), bgc = B.g;
  panel(bgc, 0, 0, bw, bh, { fill: '#f4e9d2', hi: '#fffbe8', edge: '#0a1a27' }); R(bgc, 1, bh - 2, bw - 2, 1, '#d8cfb8');
  for (let i = 0; i < 38; i++) { const ww = Math.max(1, 12 - Math.round(i * 0.3)), x = 196 + Math.round(i * 0.55), y = bh - 1 + i; R(bgc, x - 1, y, ww + 2, 1, '#0a1a27'); R(bgc, x, y, ww, 1, i === 0 ? '#d8cfb8' : '#f4e9d2'); }
  /* oynat düğmesi */
  for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) { const d = x * x + y * y; if (d <= 90) P(bgc, 18 + x, 20 + y, d > 72 ? '#0a1a27' : y < -2 ? '#cb5b40' : '#a83d2b'); }
  for (let y = -4; y <= 4; y++) R(bgc, 16, 20 + y, 6 - Math.abs(y), 1, '#f4e9d2');
  /* dalga çubukları */
  let sd = 3; const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 60; i++) { const x = 34 + i * 3, a = Math.abs(Math.sin(i * 0.33) * 0.6 + Math.sin(i * 0.11 + 1) * 0.4) * 11 + rnd() * 4 + 1, played = i < 30; R(bgc, x, 20 - a, 2, a * 2, played ? '#c9952f' : '#8f7a57'); if (played) R(bgc, x, 20 - a, 1, a * 2, '#ffc94a'); }
  R(bgc, 34 + 30 * 3 - 1, 4, 1, 32, '#a83d2b');
  up(G, B, BX, BY, 2);
  txt(G, '"Evvel zaman içinde, deniz küstüğü vakit..."', BX + 20, BY + 80, { size: 10, col: '#2c231a', s: 2 });
  /* --- arşiv kartı --- */
  const KX = 1100, KY = 52, kw = 232, kh = 396, K = mk(kw + 8, kh + 8), kg = K.g;
  [[6, 6, '#b9a171'], [3, 3, '#d9c9a3']].forEach(([ox, oy, c]) => { R(kg, ox, oy, kw, kh, '#3b2a1c'); R(kg, ox + 1, oy + 1, kw - 2, kh - 2, c); });
  R(kg, 0, 0, kw, kh, '#3b2a1c'); R(kg, 1, 1, kw - 2, kh - 2, '#ede4cf'); R(kg, 1, kh - 3, kw - 2, 2, '#d8cfb8');
  R(kg, 1, 1, kw - 2, 30, '#2a4c7d'); R(kg, 1, 1, kw - 2, 1, '#3a6aa0');
  for (let x = 1; x < kw - 1; x++) for (let y = 31; y < 37; y++) { const m = Math.abs((x % 8) - 4) + Math.abs(y - 34); P(kg, x, y, m <= 1 ? '#d9a441' : m === 2 ? '#ede4cf' : m === 3 ? '#2a4c7d' : '#a83d2b'); }
  for (let y = 0; y < 12; y++) R(kg, 12, 200 + y * 12, kw - 24, 1, '#d9c9a3');
  /* portre: sepya */
  const PX = 12, PY = 46, pw = 96, ph = 100; R(kg, PX - 2, PY - 2, pw + 4, ph + 4, '#3b2a1c'); R(kg, PX - 1, PY - 1, pw + 2, ph + 2, '#efe4c9');
  vgrad(kg, PX, PY, pw, ph, ['#d9c9a3', '#b9a171', '#8f7a57']);
  for (let x = 0; x < pw; x++) { const t = 70 + Math.round(Math.sin(x * 0.12) * 3); for (let y = t; y < ph; y++) P(kg, PX + x, PY + y, y === t ? '#6b5a40' : '#8f7a57'); }
  const ks = filt(ki, 0, 0, ki.width, ki.height, sepia); { const a = ki; const t = mk(a.width, a.height); t.g.drawImage(a, 0, 0); const ad = t.g.getImageData(0, 0, t.width, t.height).data, d = ks.g.getImageData(0, 0, ks.width, ks.height); for (let q = 3; q < ad.length; q += 4) d.data[q] = ad[q]; ks.g.putImageData(d, 0, 0); }
  kg.save(); kg.beginPath(); kg.rect(PX, PY, pw, ph); kg.clip(); kg.drawImage(ks, 0, 0, ks.width, ks.height, PX - 32, PY - 30, ks.width * 2, ks.height * 2); kg.restore();
  up(G, K, KX, KY, 2);
  txt(G, 'DEDE MASALLARI ARŞİVİ', KX + 24, KY + 14, { size: 12, col: '#ffc94a', s: 2, w: 700 });
  txt(G, 'KART', KX + 250, KY + 100, { size: 10, col: '#5a4731', s: 2 }); dig(G, '0147', KX + 250, KY + 132, 4, '#2c231a');
  txt(G, 'TÜR', KX + 250, KY + 184, { size: 10, col: '#5a4731', s: 2 }); txt(G, 'Masal', KX + 250, KY + 210, { size: 12, col: '#2c231a', s: 2, w: 700 });
  const L = (y, a, b) => { txt(G, a, KX + 24, KY + y, { size: 10, col: '#5a4731', s: 2 }); txt(G, b, KX + 24, KY + y + 26, { size: 12, col: '#2c231a', s: 2, w: 700 }); };
  { const a = 'Anlatan: Hüsnü Dede · Çaykara · '; const wa = txt(G, a, KX + 24, KY + 316, { size: 10, col: '#2c231a', s: 2 }); dig(G, '1938', KX + 24 + wa, KY + 322, 3, '#2c231a'); }
  L(370, 'Masal', 'Denize Küsen Balıkçı');
  L(442, 'Süre · ağız', '4 dk 12 sn · Of-Çaykara ağzı');
  L(514, 'Kaydeden', 'Torunu Elif, 2026');
  L(586, 'İzin', 'Aile onayıyla arşivde');
  /* onay işareti */
  [[0, 3], [1, 4], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1], [7, 0]].forEach(([x, y]) => R(G, KX + 330 + x * 4, KY + 618 + y * 4, 4, 8, '#2f8a4a'));
  /* kart altı dalga */
  const WV = mk(204, 30); R(WV.g, 0, 0, 204, 30, '#2c231a'); for (let i = 0; i < 64; i++) { const a = Math.abs(Math.sin(i * 0.4) * 0.6 + Math.sin(i * 0.13) * 0.4) * 10 + 1; R(WV.g, 6 + i * 3, 15 - a, 2, a * 2, i < 38 ? '#ffc94a' : '#8f7a57'); }
  up(G, WV, KX + 24, KY + 672, 2);
  dig(G, '1', KX + 24, KY + 742, 3, '#5a4731'); txt(G, ':', KX + 40, KY + 736, { size: 10, col: '#5a4731', s: 2 }); dig(G, '42', KX + 52, KY + 742, 3, '#5a4731');
  txt(G, '/', KX + 92, KY + 736, { size: 10, col: '#5a4731', s: 2 }); dig(G, '4', KX + 110, KY + 742, 3, '#5a4731'); txt(G, ':', KX + 126, KY + 736, { size: 10, col: '#5a4731', s: 2 }); dig(G, '12', KX + 138, KY + 742, 3, '#5a4731');
  /* damga */
  const ST = mk(110, 30); R(ST.g, 0, 0, 110, 30, '#a83d2b'); R(ST.g, 2, 2, 106, 26, '#ede4cf'); R(ST.g, 4, 4, 102, 22, '#a83d2b'); R(ST.g, 5, 5, 100, 20, '#ede4cf');
  for (let i = 0; i < 40; i++) P(ST.g, hash(i, 81) * 110, hash(i, 82) * 30, '#ede4cf');
  G.globalAlpha = 0.85; up(G, ST, KX + 236, KY + 252, 2); G.globalAlpha = 1;
  txt(G, 'ARŞİVLENDİ', KX + 346, KY + 266, { size: 12, col: '#a83d2b', s: 2, w: 700, al: 'c' });
  /* alt bilgi */
  const AB = mk(278, 22); panel(AB.g, 0, 0, 278, 22, { trim: '#c9952f' }); up(G, AB, 20, 846 - 30, 2);
  txt(G, 'Arşivde', 44, 828, { size: 10, col: '#f4e9d2', s: 2 }); dig(G, '214', 150, 834, 3, '#ffc94a'); txt(G, 'masal ·', 216, 828, { size: 10, col: '#f4e9d2', s: 2 }); dig(G, '67', 316, 834, 3, '#ffc94a'); txt(G, 'köy · sesler gerçek', 362, 828, { size: 10, col: '#f4e9d2', s: 2 });
  /* balon → kart bağı */
  for (let i = 0; i <= 10; i++) { const x = BX + 452 + i * ((KX - 16) - (BX + 452)) / 10, y = BY + 60 - Math.sin(i / 10 * Math.PI) * 24; if (i % 2 === 0) { R(G, x - 3, y - 3, 8, 8, '#0a1a27'); R(G, x - 1, y - 1, 4, 4, '#ffc94a'); } }
  return C.toDataURL();
};

if (process.argv[2] === 'ham') ham();
else compose(process.argv.slice(2).length ? process.argv.slice(2) : ['1', '2', '3', '4', '5']);
