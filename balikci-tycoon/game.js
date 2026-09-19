/* =========================================================
   BALIKÇI TYCOON  v0.3  —  pixel art / Türkiye limanı
   GDD v0.3: Liman Genişleme + Yatırım (AREA, bölge seviyesi,
   yapı noktaları, büyük proje, kozmetik) + TR/EN
   ========================================================= */
(function () {
'use strict';

/* ---------------- matematik ---------------- */
var TAU = Math.PI * 2;
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function irnd(a, b) { return Math.floor(rnd(a, b + 1)); }
function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function R(v) { return Math.round(v); }

/* ---------------- dil ---------------- */
var lang = 'tr';
var STR = {
  tr: {
    money: 'PARA', carry: 'TAŞIMA', rep: 'İTİBAR', goal: 'HEDEF', menu: 'LİMAN',
    play: 'OYNA', settings: 'AYARLAR', ok: 'TAMAM', cont: 'DEVAM', reset: 'KAYDI SIFIRLA',
    tag: 'KÜÇÜK İSKELEDEN BÜYÜK LİMANA',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SES', zoomLbl: 'GÖRÜNTÜ / ZOOM',
    resetAsk: 'Tüm ilerleme silinsin mi?',
    intro1: '🎣 Ağın yanında bekle, balık birikir',
    intro2: '🧺 Üstünden geç, sırtla (ağır balık çok yer kaplar)',
    intro3: '🔪 Kesim masası → fileto',
    intro4: '🐟 Tezgâh → müşteri siparişi öder',
    intro5: '💰 Parayı kasaya götür → liman büyür',
    ctrl: 'W A S D / yön tuşları — veya ekrana bas & sürükle',
    tabs: ['LİMAN', 'PERSONEL', 'ÜRÜNLER', 'YARDIM'],
    /* istasyonlar */
    stNet: 'AĞ', stCut: 'KESİM', stSmoke: 'FÜMEHANE', stStall: 'TEZGÂH', stSafe: 'KASA',
    stTake: 'AL', stBuild: 'YAPI YERİ', stProject: 'BÜYÜK PROJE', stDecor: 'SÜS',
    /* yükseltmeler */
    upCap: 'KAPASİTE', upCapE: '+3 taşıma', upSpd: 'HIZ', upSpdE: '+%11 koşu',
    upPrice: 'PAZARLIK', upPriceE: '+%10 fiyat',
    upArea: 'BÖLGE SEVİYESİ', hire: 'İŞE AL', level: 'Sv.',
    needRep: '⭐ {n} itibar gerekli ({c})', needStaff: 'Personel kulübesi gerekli',
    openArea: 'AÇ', locked: 'KİLİTLİ',
    /* olaylar */
    evShoal: 'BALIK SÜRÜSÜ', evShip: 'VAPUR GELDİ', evStorm: 'LODOS',
    evShoalM: 'Sürü geldi! Ağlar iki kat hızlı 🐟',
    evShipM: 'Vapur yanaştı! Müşteri akını 🚢',
    evStormM: 'Lodos bastırdı, müşteri azaldı 🌊',
    /* olaylar/uyarılar */
    hired: '{i} {n} işe alındı — {w}',
    levelUp: '⭐ Yeni seviye: {t}!',
    areaOpen: '🔓 {n} açıldı!',
    areaLvUp: '🏗️ {n} → Sv.{l}',
    built: '🔨 {n} kuruldu',
    projStage: '🏛️ {n}: %{p} — yeni aşama!',
    projDone: '🎉 {n} tamamlandı!',
    decorBought: '✨ {n} yerleştirildi',
    tutDone: 'Eğitim tamam! Limanı büyüt 🎉',
    capUp: '🧺 Taşıma kapasitesi: {n}', spdUp: '👟 Hız +%11', priceUp: '💰 Fiyat +%10',
    /* tutorial */
    tut: ['Ağın yanında bekle — balık birikiyor',
          'Sandığın üstünden geç, balıkları sırtla',
          'Balıkları kesim masasına bırak',
          'Filetoyu al ve tezgâha taşı',
          'Tepsideki parayı al, kasaya götür',
          'Parlayan alanda bekle ve yükseltme al'],
    orderOf: '{n} SİPARİŞİ', waiting: '⏳ {n} müşteri bekliyor',
    idleGoal: 'Stok hazırla — müşteri yolda',
    /* menü */
    mArea: 'Bölgeler', mProject: 'Büyük proje', mSlots: 'Yapı noktaları',
    mWage: 'Maaş gideri', mOrders: 'Tamamlanan sipariş', mLost: 'Kaçan müşteri',
    mCaught: 'Tutulan balık', mNext: 'Sonraki', mMax: 'En üst seviye',
    mNoStaff: 'Henüz çalışanın yok. Haritadaki işe alım alanlarında bekle.',
    mStaffCap: 'Personel limiti', mTotalWage: 'Toplam maaş',
    mWeight: 'ağırlık', mCut: 'kesim', mYield: 'fileto', mSmoked: 'füme',
    mLoop: 'Döngü', mLoopE: 'Ağ → kesim → tezgâh → kasa',
    mSmokeE: 'Fileto → fümehane → 2.4× değer',
    mRepE: 'Sipariş tamamla; VIP/Şef kaçarsa itibar düşer',
    mInvestE: 'Yapı noktası, bölge seviyesi ve büyük projeye para yatır',
    mCtrl: 'Kontrol',
    /* alt panel */
    sheetBuild: 'YAPI NOKTASI', sheetBuildSub: 'Bu noktaya ne kuracaksın?',
    sheetProject: 'BÜYÜK PROJE', invest: 'YATIR', maxInvest: 'MAKS.', pct25: '%25',
    stage: 'Aşama', done: 'TAMAM', owned: 'KURULU', replace: 'DEĞİŞTİR',
    remaining: 'kalan', total: 'toplam',
    noMoney: 'Para yetmiyor'
  },
  en: {
    money: 'CASH', carry: 'CARRY', rep: 'REP', goal: 'GOAL', menu: 'HARBOR',
    play: 'PLAY', settings: 'SETTINGS', ok: 'OK', cont: 'CONTINUE', reset: 'RESET SAVE',
    tag: 'FROM A TINY PIER TO A GRAND HARBOR',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SOUND', zoomLbl: 'VIEW / ZOOM',
    resetAsk: 'Erase all progress?',
    intro1: '🎣 Wait by the net, fish pile up',
    intro2: '🧺 Walk over the crate to carry them (big fish weigh more)',
    intro3: '🔪 Cutting table → fillets',
    intro4: '🐟 Stall → customers pay for orders',
    intro5: '💰 Take the cash to the safe → grow the harbor',
    ctrl: 'W A S D / arrow keys — or touch & drag anywhere',
    tabs: ['HARBOR', 'STAFF', 'GOODS', 'HELP'],
    stNet: 'NET', stCut: 'CUTTING', stSmoke: 'SMOKEHOUSE', stStall: 'STALL', stSafe: 'SAFE',
    stTake: 'TAKE', stBuild: 'BUILD SPOT', stProject: 'BIG PROJECT', stDecor: 'DECOR',
    upCap: 'CAPACITY', upCapE: '+3 carry', upSpd: 'SPEED', upSpdE: '+11% run',
    upPrice: 'HAGGLE', upPriceE: '+10% price',
    upArea: 'AREA LEVEL', hire: 'HIRE', level: 'Lv.',
    needRep: '⭐ needs {n} rep ({c})', needStaff: 'Needs a staff hut',
    openArea: 'OPEN', locked: 'LOCKED',
    evShoal: 'FISH SHOAL', evShip: 'FERRY ARRIVED', evStorm: 'SOUTH WIND',
    evShoalM: 'A shoal arrived! Nets twice as fast 🐟',
    evShipM: 'The ferry docked! Customer rush 🚢',
    evStormM: 'Rough sea, fewer customers 🌊',
    hired: '{i} {n} hired — {w}',
    levelUp: '⭐ New rank: {t}!',
    areaOpen: '🔓 {n} unlocked!',
    areaLvUp: '🏗️ {n} → Lv.{l}',
    built: '🔨 {n} built',
    projStage: '🏛️ {n}: {p}% — new stage!',
    projDone: '🎉 {n} completed!',
    decorBought: '✨ {n} placed',
    tutDone: 'Tutorial done! Grow the harbor 🎉',
    capUp: '🧺 Carry capacity: {n}', spdUp: '👟 Speed +11%', priceUp: '💰 Price +10%',
    tut: ['Wait by the net — fish are coming',
          'Walk over the crate to pick up the fish',
          'Drop the fish on the cutting table',
          'Grab fillets and carry them to the stall',
          'Take the cash from the tray to the safe',
          'Stand on a glowing spot to buy an upgrade'],
    orderOf: '{n} ORDER', waiting: '⏳ {n} customers waiting',
    idleGoal: 'Stock up — customers on the way',
    mArea: 'Areas', mProject: 'Big project', mSlots: 'Build spots',
    mWage: 'Wages', mOrders: 'Orders served', mLost: 'Customers lost',
    mCaught: 'Fish caught', mNext: 'Next', mMax: 'Max rank',
    mNoStaff: 'No staff yet. Stand on a hiring spot on the map.',
    mStaffCap: 'Staff limit', mTotalWage: 'Total wages',
    mWeight: 'weight', mCut: 'cut', mYield: 'fillets', mSmoked: 'smoked',
    mLoop: 'Loop', mLoopE: 'Net → cutting → stall → safe',
    mSmokeE: 'Fillet → smokehouse → 2.4× value',
    mRepE: 'Finish orders; losing a Chef/VIP costs rep',
    mInvestE: 'Invest in build spots, area levels and the big project',
    mCtrl: 'Controls',
    sheetBuild: 'BUILD SPOT', sheetBuildSub: 'What will you build here?',
    sheetProject: 'BIG PROJECT', invest: 'INVEST', maxInvest: 'MAX', pct25: '25%',
    stage: 'Stage', done: 'DONE', owned: 'BUILT', replace: 'REPLACE',
    remaining: 'left', total: 'total',
    noMoney: 'Not enough cash'
  }
};
function T(k, p) {
  var s = (STR[lang] && STR[lang][k] !== undefined) ? STR[lang][k] : STR.tr[k];
  if (s === undefined) return k;
  if (p && typeof s === 'string') for (var i in p) s = s.replace('{' + i + '}', p[i]);
  return s;
}
function NM(o) { return (o && o[lang]) || (o && o.tr) || ''; }
function UP(s) {
  s = String(s);
  if (lang !== 'tr') return s.toUpperCase();
  return s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/* ---------------- canvas / pixel ---------------- */
var cvs = document.getElementById('game');
var ctx = cvs.getContext('2d');
var ucv = document.getElementById('ui');
var uctx = ucv.getContext('2d');
var VW = 0, VH = 0, PXS = 3, zoomLvl = 2, DPR2 = 1;
var W = 0, H = 0;                 /* sanal (pixel) tuval boyutu */
function resize() {
  VW = cvs.clientWidth || window.innerWidth;
  VH = cvs.clientHeight || window.innerHeight;
  var base = clamp(Math.round(VW / 330), 2, 4);
  PXS = clamp(base + (zoomLvl - 2), 1, 6);
  W = Math.ceil(VW / PXS); H = Math.ceil(VH / PXS);
  cvs.width = W; cvs.height = H;
  ctx.imageSmoothingEnabled = false;
  DPR2 = Math.min(2, window.devicePixelRatio || 1);
  ucv.width = Math.round(VW * DPR2); ucv.height = Math.round(VH * DPR2);
}

/* ---- dünya yazıları: tam çözünürlüklü üst katman ---- */
var camOX = 0, camOY = 0, uiQ = [];
function uiX(x, y, dx) { return (pX(x, y) + camOX + (dx || 0)) * PXS; }
function uiY(x, y, z, dy) { return (pY(x, y, z) + camOY + (dy || 0)) * PXS; }
function uiLabel(x, y, z, s, col, a, dx, dy) { uiQ.push({ t: 1, x: x, y: y, z: z, s: s, c: col, a: a === undefined ? 1 : a, dx: dx, dy: dy }); }
function uiBadge(x, y, z, s, col) { uiQ.push({ t: 2, x: x, y: y, z: z, s: s, c: col || '#ffc94a', a: 1 }); }
function uiText(x, y, z, s, col, size, a, dx, dy, outline) { uiQ.push({ t: 3, x: x, y: y, z: z, s: s, c: col, sz: size || 12, a: a === undefined ? 1 : a, dx: dx, dy: dy, o: outline }); }
function uiFont(px) { return 'bold ' + px + 'px "Pixelify Sans",ui-monospace,monospace'; }
function renderUI() {
  uctx.setTransform(DPR2, 0, 0, DPR2, 0, 0);
  uctx.clearRect(0, 0, VW, VH);
  uctx.textAlign = 'center'; uctx.textBaseline = 'alphabetic';
  var taken = [];
  function hits(r) {
    for (var k = 0; k < taken.length; k++) {
      var o = taken[k];
      if (r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y) return true;
    }
    return false;
  }
  for (var i = 0; i < uiQ.length; i++) {
    var q = uiQ[i];
    var cx = Math.round(uiX(q.x, q.y, q.dx)), cy = Math.round(uiY(q.x, q.y, q.z, q.dy));
    if (cx < -160 || cx > VW + 160 || cy < -60 || cy > VH + 60) continue;
    uctx.globalAlpha = q.a;
    if (q.t === 1 || q.t === 2) {
      var fs = q.t === 1 ? 13 : 12;
      uctx.font = uiFont(fs);
      var w = Math.round(uctx.measureText(q.s).width) + 12, h = fs + 8;
      var rect = { x: cx - w / 2, y: cy - h, w: w, h: h };
      for (var tr = 0; tr < 4 && hits(rect); tr++) rect.y -= h + 2;
      taken.push(rect);
      cy = rect.y + h;
      uctx.fillStyle = '#0a1a27'; uctx.fillRect(rect.x, rect.y, w, h);
      uctx.fillStyle = q.t === 1 ? '#14293c' : '#1d3a52';
      uctx.fillRect(rect.x + 2, rect.y + 2, w - 4, h - 4);
      uctx.fillStyle = q.c || '#f4e9d2';
      uctx.fillText(q.s, cx, cy - 6);
    } else {
      uctx.font = uiFont(q.sz);
      uctx.lineWidth = 3; uctx.strokeStyle = q.o || 'rgba(10,26,39,.92)'; uctx.lineJoin = 'round';
      uctx.strokeText(q.s, cx, cy);
      uctx.fillStyle = q.c || '#f4e9d2';
      uctx.fillText(q.s, cx, cy);
    }
  }
  uctx.globalAlpha = 1;
  uiQ.length = 0;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function () { setTimeout(resize, 150); });

/* izometrik */
var TW = 24, TH = 12;
function pX(x, y) { return (x - y) * (TW / 2); }
function pY(x, y, z) { return (x + y) * (TH / 2) - (z || 0); }

/* ---------------- girdi ---------------- */
var keys = {};
window.addEventListener('keydown', function (e) {
  keys[e.key.toLowerCase()] = true;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
});
window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
var stick = { active: false, id: -1, bx: 0, by: 0, dx: 0, dy: 0 };
cvs.addEventListener('pointerdown', function (e) {
  cvs.setPointerCapture(e.pointerId);
  stick.active = true; stick.id = e.pointerId; stick.bx = e.clientX; stick.by = e.clientY; stick.dx = 0; stick.dy = 0;
});
cvs.addEventListener('pointermove', function (e) {
  if (!stick.active || e.pointerId !== stick.id) return;
  var dx = e.clientX - stick.bx, dy = e.clientY - stick.by, L = Math.hypot(dx, dy), Rr = 60;
  if (L > Rr) { stick.bx += dx * (1 - Rr / L); stick.by += dy * (1 - Rr / L); dx = e.clientX - stick.bx; dy = e.clientY - stick.by; L = Rr; }
  stick.dx = L > 6 ? dx / Rr : 0; stick.dy = L > 6 ? dy / Rr : 0;
});
function stickEnd(e) { if (!e || e.pointerId === stick.id) { stick.active = false; stick.id = -1; stick.dx = 0; stick.dy = 0; } }
cvs.addEventListener('pointerup', stickEnd);
cvs.addEventListener('pointercancel', stickEnd);
cvs.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------------- ses ---------------- */
var AC = null, soundOn = true;
function beep(f, d, t, v) {
  if (!soundOn) return;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = t || 'square'; o.frequency.value = f; g.gain.value = v || 0.04;
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (d || 0.08));
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + (d || 0.08));
  } catch (e) { }
}
var sfx = {
  pick: function () { beep(620 + Math.random() * 120, 0.05, 'square', 0.025); },
  drop: function () { beep(300 + Math.random() * 60, 0.05, 'square', 0.02); },
  coin: function () { beep(880, 0.06, 'square', 0.035); setTimeout(function () { beep(1240, 0.08, 'square', 0.03); }, 50); },
  buy: function () { beep(480, 0.08, 'square', 0.035); setTimeout(function () { beep(720, 0.12, 'square', 0.03); }, 70); },
  build: function () { beep(220, 0.1, 'square', 0.04); setTimeout(function () { beep(330, 0.1, 'square', 0.035); }, 90); setTimeout(function () { beep(440, 0.16, 'square', 0.03); }, 180); },
  bad: function () { beep(160, 0.18, 'sawtooth', 0.028); },
  star: function () { beep(1000, 0.07, 'square', 0.035); setTimeout(function () { beep(1500, 0.11, 'square', 0.03); }, 70); }
};

/* =========================================================
   İÇERİK
   ========================================================= */
var FISH = {
  hamsi:   { id: 'hamsi',   n: { tr: 'Hamsi', en: 'Anchovy' },   r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.42, out: 1, val: 6,  col: '#8fa9bd', bel: '#d7e4ee', meat: '#dfe9f0' },
  uskumru: { id: 'uskumru', n: { tr: 'Uskumru', en: 'Mackerel' }, r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.62, out: 1, val: 12, col: '#5f8f8a', bel: '#cfe6df', meat: '#bfe0d6' },
  levrek:  { id: 'levrek',  n: { tr: 'Levrek', en: 'Sea Bass' },  r: { tr: 'Orta', en: 'Uncommon' }, w: 1, cut: 0.85, out: 2, val: 17, col: '#a8b6c2', bel: '#eef5f9', meat: '#eaf2f7' },
  somon:   { id: 'somon',   n: { tr: 'Somon', en: 'Salmon' },     r: { tr: 'Orta', en: 'Uncommon' }, w: 2, cut: 1.10, out: 3, val: 27, col: '#d98455', bel: '#f7c9a4', meat: '#f08a3c' },
  ton:     { id: 'ton',     n: { tr: 'Orkinos', en: 'Tuna' },     r: { tr: 'Nadir', en: 'Rare' },    w: 3, cut: 1.70, out: 5, val: 46, col: '#3f6a8c', bel: '#9fc0d8', meat: '#b8453f' }
};
var FISH_ORDER = ['hamsi', 'uskumru', 'levrek', 'somon', 'ton'];
var FUME_MUL = 2.4, FUME_TIME = 3.2;
function prodName(k, f) { return NM(FISH[f].n) + (k === 'fume' ? (lang === 'tr' ? ' Füme' : ' Smoked') : (lang === 'tr' ? ' Fileto' : ' Fillet')); }
function prodValue(k, f) { return Math.round(FISH[f].val * (k === 'fume' ? FUME_MUL : 1) * (1 + S.priceLvl * 0.1)); }
function itemW(it) { return it.k === 'fish' ? FISH[it.f].w : 1; }

var ROLES = {
  hamal:     { id: 'hamal',     n: { tr: 'Hamal', en: 'Porter' },     icon: '🧺', wage: 15, speed: 2.4, cap: 8,  d: { tr: 'Ağdan kesime taşır', en: 'Net → cutting table' } },
  filetocu:  { id: 'filetocu',  n: { tr: 'Filetocu', en: 'Filleter' }, icon: '🔪', wage: 19, speed: 2.3, cap: 4,  d: { tr: 'Masayı %55 hızlandırır', en: 'Table 55% faster' } },
  tezgahtar: { id: 'tezgahtar', n: { tr: 'Tezgâhtar', en: 'Vendor' },  icon: '🐟', wage: 22, speed: 2.5, cap: 8,  d: { tr: 'Siparişi tezgâha taşır', en: 'Goods → stall' } },
  kasiyer:   { id: 'kasiyer',   n: { tr: 'Kasiyer', en: 'Cashier' },   icon: '💰', wage: 17, speed: 2.6, cap: 10, d: { tr: 'Parayı kasaya işler', en: 'Cash → safe' } }
};
var WNAMES = ['Hasan', 'Kerim', 'Zeynep', 'Mert', 'Deniz', 'Ayla', 'Tarık', 'Elif', 'Cem', 'Nur', 'Osman', 'Sevgi'];

var CUST = [
  { id: 'isci',   n: { tr: 'İşçi', en: 'Worker' },    coat: '#3f6fb0', coat2: '#335c93', qty: [2, 4],  pat: 54,  mult: 1.00, rep: 1, lvl: 1, tag: 'cheap' },
  { id: 'aile',   n: { tr: 'Aile', en: 'Family' },    coat: '#c8553d', coat2: '#a94430', qty: [4, 7],  pat: 80,  mult: 1.05, rep: 1, lvl: 1, tag: 'any' },
  { id: 'esnaf',  n: { tr: 'Esnaf', en: 'Merchant' }, coat: '#7b5ea7', coat2: '#674d8e', qty: [3, 5],  pat: 50,  mult: 1.35, rep: 2, lvl: 2, tag: 'rich' },
  { id: 'sef',    n: { tr: 'Şef', en: 'Chef' },       coat: '#f2efe6', coat2: '#dcd8cb', qty: [3, 4],  pat: 32,  mult: 1.80, rep: 2, lvl: 3, tag: 'premium', pen: 1 },
  { id: 'kaptan', n: { tr: 'Kaptan', en: 'Captain' }, coat: '#1f4e6b', coat2: '#173d55', qty: [8, 14], pat: 120, mult: 1.25, rep: 3, lvl: 3, tag: 'any' },
  { id: 'vip',    n: { tr: 'VIP', en: 'VIP' },        coat: '#d4a029', coat2: '#b8881c', qty: [2, 3],  pat: 28,  mult: 3.00, rep: 3, lvl: 4, tag: 'fume', pen: 2 }
];

var EVENTS = [
  { id: 'suru', name: 'evShoal', icon: '🐟', dur: 34, fishMul: 2.2, custMul: 1.0, msg: 'evShoalM' },
  { id: 'gemi', name: 'evShip',  icon: '🚢', dur: 38, fishMul: 1.0, custMul: 2.2, msg: 'evShipM' },
  { id: 'kar',  name: 'evStorm', icon: '🌊', dur: 30, fishMul: 1.0, custMul: 0.45, msg: 'evStormM' }
];
var REP_LEVELS = [
  { need: 0,   t: { tr: 'Çırak Balıkçı', en: 'Apprentice' } },
  { need: 10,  t: { tr: 'İskele Esnafı', en: 'Pier Trader' } },
  { need: 30,  t: { tr: 'Pazar Ustası', en: 'Market Master' } },
  { need: 75,  t: { tr: 'Liman İşletmecisi', en: 'Harbor Operator' } },
  { need: 150, t: { tr: 'Balıkçılık Kralı', en: 'Fishing Tycoon' } }
];

/* ---------------- AREA (GDD §20-21) ---------------- */
var AREAS = [
  { id: 'iskele', n: { tr: 'Balıkçı İskelesi', en: 'Fishing Pier' }, x0: 0, y0: 0,  x1: 10, y1: 6,    locked: false, cost: 0,    rep: 0,  lvl: 1, up: [0, 1100, 3400] },
  { id: 'pazar',  n: { tr: 'Balık Pazarı', en: 'Fish Market' },      x0: 0, y0: 6,  x1: 10, y1: 12,   locked: true,  cost: 1300, rep: 10, lvl: 1, up: [0, 2400, 6800] },
  { id: 'fume',   n: { tr: 'Fümehane', en: 'Smokehouse' },           x0: 0, y0: 12, x1: 10, y1: 17.5, locked: true,  cost: 4600, rep: 30, lvl: 1, up: [0, 4200, 11000] }
];
var MAXLV = 3;
function areaOf(i) { return AREAS[i]; }
function areaNetMul(z) { return 1 + (AREAS[z].lvl - 1) * 0.18 + (slotEff(z, 'netrate') || 0); }
function areaStock(z) { return 12 + (AREAS[z].lvl - 1) * 3 + (slotEff(z, 'stock') || 0); }
function areaFlow(z) { return 1 + (slotEff(z, 'flow') || 0) + (project.done ? 0.25 : 0); }
function queueMax(z) { return AREAS[z].lvl >= 3 ? 5 : 4; }

/* ---------------- yapı noktaları (GDD §22) ---------------- */
var BUILDINGS = [
  { id: 'kulube', cat: 'personel', n: { tr: 'Personel Kulübesi', en: 'Staff Hut' }, icon: '🏚️', cost: 1500, eff: 'staff',   val: 1,    d: { tr: 'Personel limiti +1', en: 'Staff limit +1' } },
  { id: 'cay',    cat: 'personel', n: { tr: 'Çay Ocağı', en: 'Tea Stove' },        icon: '🫖', cost: 900,  eff: 'wspeed',  val: 0.12, d: { tr: 'Çıraklar %12 hızlı', en: 'Workers 12% faster' } },
  { id: 'tezgah', cat: 'ticaret',  n: { tr: 'Ek Tezgâh', en: 'Extra Stall' },      icon: '🐟', cost: 2200, eff: 'counter', val: 1,    d: { tr: 'Yeni satış noktası', en: 'New sales point' } },
  { id: 'pano',   cat: 'ticaret',  n: { tr: 'Reklam Panosu', en: 'Billboard' },    icon: '📣', cost: 1400, eff: 'flow',    val: 0.3,  d: { tr: 'Müşteri akışı +%30', en: 'Customer flow +30%' } },
  { id: 'depo',   cat: 'lojistik', n: { tr: 'Depo Kulübesi', en: 'Depot Shed' },   icon: '📦', cost: 1700, eff: 'stock',   val: 6,    d: { tr: 'Bölge stoğu +6', en: 'Local stock +6' } },
  { id: 'vinc',   cat: 'lojistik', n: { tr: 'Ağ Vinci', en: 'Net Crane' },         icon: '🏗️', cost: 2600, eff: 'netrate', val: 0.25, d: { tr: 'Bölge ağı %25 hızlı', en: 'Nets here 25% faster' } }
];
function bdef(id) { for (var i = 0; i < BUILDINGS.length; i++) if (BUILDINGS[i].id === id) return BUILDINGS[i]; return null; }
var SLOTS = [
  { id: 's1', z: 0, x: 7.6, y: 1.2,  req: 1, cats: ['personel', 'lojistik'], b: null },
  { id: 's2', z: 0, x: 4.2, y: 5.2,  req: 3, cats: ['personel', 'lojistik'], b: null },
  { id: 's3', z: 1, x: 8.6, y: 7.6,  req: 1, cats: ['ticaret', 'lojistik'],  b: null },
  { id: 's4', z: 1, x: 2.6, y: 11.0, req: 1, cats: ['personel', 'lojistik'], b: null },
  { id: 's5', z: 1, x: 4.8, y: 9.2,  req: 3, cats: ['ticaret', 'personel'],  b: null },
  { id: 's6', z: 2, x: 8.6, y: 13.2, req: 1, cats: ['ticaret', 'lojistik'],  b: null },
  { id: 's7', z: 2, x: 6.0, y: 14.8, req: 3, cats: ['personel', 'lojistik'], b: null }
];
function slotActive(s) { return !AREAS[s.z].locked && AREAS[s.z].lvl >= s.req; }
function slotEff(z, eff) {
  var v = 0;
  for (var i = 0; i < SLOTS.length; i++) {
    var s = SLOTS[i];
    if (!s.b || !slotActive(s)) continue;
    if (z !== undefined && z !== null && s.z !== z) continue;
    var d = bdef(s.b);
    if (d && d.eff === eff) v += d.val;
  }
  return v;
}
function staffCap() { return 3 + slotEff(null, 'staff'); }
function workerSpeedMul() { return 1 + slotEff(null, 'wspeed'); }

/* ---------------- büyük proje (GDD §23) ---------------- */
var project = {
  id: 'hal', z: 1, x: 7.0, y: 8.6, w: 2.6, h: 2.2,
  n: { tr: 'Kapalı Balık Hali', en: 'Covered Fish Hall' },
  total: 26000, inv: 0, stage: 0, done: false,
  stages: [0.10, 0.30, 0.60, 0.80, 1.0]
};
function projPct() { return clamp(project.inv / project.total, 0, 1); }
function projStageOf(p) { var st = 0; for (var i = 0; i < project.stages.length; i++) if (p >= project.stages[i] - 0.0001) st = i + 1; return st; }

/* ---------------- kozmetik (GDD §24) ---------------- */
var DECOR = [
  { id: 'bayrak', z: 0, x: 0.9, y: 0.5,  cost: 600,  n: { tr: 'Bayrak Direği', en: 'Flag Pole' },   icon: '🇹🇷', got: false },
  { id: 'tekne',  z: 0, x: 5.0, y: 0.45, cost: 1300, n: { tr: 'Balıkçı Teknesi', en: 'Fishing Boat' }, icon: '⛵', got: false },
  { id: 'bank',   z: 0, x: 9.3, y: 4.6,  cost: 400,  n: { tr: 'Bank', en: 'Bench' },                icon: '🪑', got: false },
  { id: 'simit',  z: 1, x: 2.6, y: 7.0,  cost: 900,  n: { tr: 'Simit Arabası', en: 'Simit Cart' },  icon: '🥯', got: false },
  { id: 'lamba',  z: 1, x: 1.0, y: 11.2, cost: 700,  n: { tr: 'Sokak Lambası', en: 'Street Lamp' }, icon: '💡', got: false },
  { id: 'cicek',  z: 1, x: 9.3, y: 8.6,  cost: 500,  n: { tr: 'Begonvil', en: 'Bougainvillea' },    icon: '🌺', got: false },
  { id: 'caymasa', z: 2, x: 1.0, y: 17.0, cost: 800, n: { tr: 'Çay Masası', en: 'Tea Table' },      icon: '☕', got: false },
  { id: 'heykel', z: 2, x: 9.3, y: 12.6, cost: 2600, n: { tr: 'Balık Heykeli', en: 'Fish Statue' }, icon: '🗿', got: false }
];
function decorCount() { var n = 0; for (var i = 0; i < DECOR.length; i++) if (DECOR[i].got) n++; return n; }

/* ---------------- istasyonlar ---------------- */
var spots = [
  { z: 0, x: 2.3, y: 0.9,  face: 'n', pool: [['hamsi', 60], ['uskumru', 40]], stock: [], t: 0, rate: 1.05 },
  { z: 1, x: 1.0, y: 7.4,  face: 'w', pool: [['uskumru', 45], ['levrek', 35], ['somon', 20]], stock: [], t: 0, rate: 1.25 },
  { z: 2, x: 1.0, y: 13.2, face: 'w', pool: [['levrek', 25], ['somon', 45], ['ton', 30]], stock: [], t: 0, rate: 1.5 }
];
function mkTable(z, x, y, mx, my) {
  return { z: z, x: x, y: y, inn: [], cur: null, t: 0, worker: null, mat: { x: mx, y: my, items: [] }, max: 10 };
}
var tables = [
  mkTable(0, 5.4, 1.4, 6.7, 2.2),
  mkTable(1, 3.4, 7.6, 4.5, 8.3),
  mkTable(2, 3.4, 13.0, 4.5, 13.8)
];
var smoker = { z: 2, x: 3.4, y: 15.4, inn: [], cur: null, t: 0, belt: 0, mat: { x: 4.6, y: 16.1, items: [] }, max: 8 };
var counters = [];
function mkCounter(z, x, y, src) {
  var c = { z: z, x: x, y: y, buffer: [], slots: [null, null, null, null, null], tray: { x: x - 0.6, y: y + 1.3, items: [] }, spawnT: 3 + z * 2, eatT: 0, src: src || null };
  return c;
}
function rebuildCounters() {
  var old = counters.slice(), keep = [], i;
  function get(key, z, x, y) {
    for (var k = 0; k < old.length; k++) if (old[k].key === key) { old[k].x = x; old[k].y = y; old[k].z = z; return old[k]; }
    var c = mkCounter(z, x, y, key); c.key = key; return c;
  }
  counters.length = 0;
  counters.push(get('b0', 0, 8.9, 3.0));
  counters.push(get('b1', 1, 8.9, 10.4));
  counters.push(get('b2', 2, 8.9, 15.4));
  for (i = 0; i < SLOTS.length; i++) {
    var sl = SLOTS[i];
    if (sl.b === 'tezgah' && slotActive(sl)) counters.push(get('s' + sl.id, sl.z, sl.x + 0.3, sl.y));
  }
  if (project.done) counters.push(get('hal', 1, project.x + 1.5, project.y + 0.2));
  /* kaldırılan tezgâhtaki müşteriler dağılsın */
  for (i = 0; i < old.length; i++) {
    if (counters.indexOf(old[i]) >= 0) continue;
    for (var j = customers.length - 1; j >= 0; j--) if (customers[j].c === old[i]) customers[j].state = 'leave';
  }
  /* kuyruk şeritleri */
  var byY = counters.slice().sort(function (a, b) { return a.y - b.y; });
  var lanes = [];
  for (var k2 = 0; k2 < byY.length; k2++) {
    var c2 = byY[k2], L = 0;
    while (lanes[L] !== undefined && Math.abs(c2.y - lanes[L]) < 5.2) L++;
    c2.lane = L; lanes[L] = c2.y;
  }
}
function counterMax(c) { return 20 + (AREAS[c.z].lvl - 1) * 4 + slotEff(c.z, 'stock'); }
var safe = { z: 0, x: 1.2, y: 4.9, pop: 0 };

/* ---------------- yükseltme alanları ---------------- */
var PADS = [
  { id: 'cap', z: 0, x: 1.2, y: 1.4,  kind: 'cap',  icon: '🧺', price: 120,  growth: 1.55, lvl: 0, max: 8, paid: 0 },
  { id: 'spd', z: 0, x: 1.2, y: 2.9,  kind: 'spd',  icon: '👟', price: 160,  growth: 1.60, lvl: 0, max: 6, paid: 0 },
  { id: 'h1',  z: 0, x: 3.0, y: 4.9,  kind: 'hire', role: 'hamal',     icon: '🧺', price: 380,  growth: 2.05, lvl: 0, max: 3, paid: 0 },
  { id: 'al0', z: 0, x: 5.0, y: 4.0,  kind: 'arealv', area: 0, icon: '🏗️', paid: 0 },
  { id: 'z1',  z: 0, x: 7.0, y: 5.3,  kind: 'area', target: 1, icon: '🔓', paid: 0 },
  { id: 'h2',  z: 1, x: 2.0, y: 9.6,  kind: 'hire', role: 'filetocu',  icon: '🔪', price: 520,  growth: 2.0, lvl: 0, max: 3, paid: 0 },
  { id: 'h3',  z: 1, x: 4.0, y: 10.8, kind: 'hire', role: 'tezgahtar', icon: '🐟', price: 720,  growth: 2.0, lvl: 0, max: 3, paid: 0 },
  { id: 'al1', z: 1, x: 6.0, y: 11.2, kind: 'arealv', area: 1, icon: '🏗️', paid: 0 },
  { id: 'z2',  z: 1, x: 8.0, y: 11.4, kind: 'area', target: 2, icon: '🔓', paid: 0 },
  { id: 'h4',  z: 2, x: 6.8, y: 13.2, kind: 'hire', role: 'kasiyer',   icon: '💰', price: 900,  growth: 2.0, lvl: 0, max: 2, paid: 0 },
  { id: 'prc', z: 2, x: 6.8, y: 16.6, kind: 'price', icon: '💰', price: 850, growth: 1.8, lvl: 0, max: 6, paid: 0 },
  { id: 'al2', z: 2, x: 2.0, y: 16.9, kind: 'arealv', area: 2, icon: '🏗️', paid: 0 }
];

/* ---------------- durum ---------------- */
var S = {
  cash: 0, rep: 0, capLvl: 0, spdLvl: 0, priceLvl: 0,
  served: 0, lost: 0, caught: 0, tut: 0, started: false
};
var player = { x: 4.5, y: 3.2, z: 0, vx: 0, vy: 0, bob: 0, face: 1, carry: [], act: 0, isPlayer: true };
var workers = [], customers = [], flyers = [], floats = [], puffs = [], gulls = [];
var event = null, eventT = 0, nextEvent = 80;
var gameT = 0, camX = 0, camY = 0;

function capacity() { return 8 + S.capLvl * 3; }
function speed() { return 3.1 * Math.pow(1.11, S.spdLvl); }
function carryW(a) { var w = 0; for (var i = 0; i < a.carry.length; i++) w += itemW(a.carry[i]); return w; }
function repLevel() { var l = 1; for (var i = 0; i < REP_LEVELS.length; i++) if (S.rep >= REP_LEVELS[i].need) l = i + 1; return l; }
function repTitle() { return NM(REP_LEVELS[repLevel() - 1].t); }
function wageTotal() { var w = 0; for (var i = 0; i < workers.length; i++) w += ROLES[workers[i].role].wage; return w; }
function pct(n) { return lang === 'tr' ? '%' + n : n + '%'; }
function perMin() { return lang === 'tr' ? '/dk' : '/min'; }
function money(n) { return '$' + Math.round(n).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'); }

/* ---------------- kayıt ---------------- */
var SAVE_KEY = 'balikci_tycoon_v3';
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 3, lang: lang, snd: soundOn ? 1 : 0, zoom: zoomLvl,
      cash: S.cash, rep: S.rep, capLvl: S.capLvl, spdLvl: S.spdLvl, priceLvl: S.priceLvl,
      served: S.served, lost: S.lost, caught: S.caught, tut: S.tut,
      areas: AREAS.map(function (a) { return [a.locked ? 1 : 0, a.lvl]; }),
      pads: PADS.map(function (p) { return [Math.round(p.paid), p.lvl || 0, p.price || 0]; }),
      slots: SLOTS.map(function (s) { return s.b; }),
      decor: DECOR.map(function (d) { return d.got ? 1 : 0; }),
      proj: [Math.round(project.inv), project.stage, project.done ? 1 : 0],
      workers: workers.map(function (w) { return w.role; })
    }));
  } catch (e) { }
}
function load() {
  try {
    var raw = localStorage.getItem(SAVE_KEY); if (!raw) return false;
    var d = JSON.parse(raw);
    if (d.lang) lang = d.lang;
    if (d.snd !== undefined) soundOn = !!d.snd;
    if (d.zoom) zoomLvl = d.zoom;
    S.cash = d.cash || 0; S.rep = d.rep || 0; S.capLvl = d.capLvl || 0; S.spdLvl = d.spdLvl || 0;
    S.priceLvl = d.priceLvl || 0; S.served = d.served || 0; S.lost = d.lost || 0;
    S.caught = d.caught || 0; S.tut = d.tut || 0;
    if (d.areas) d.areas.forEach(function (v, i) { if (AREAS[i]) { AREAS[i].locked = !!v[0]; AREAS[i].lvl = v[1] || 1; } });
    if (d.pads) d.pads.forEach(function (v, i) { if (PADS[i]) { PADS[i].paid = v[0]; PADS[i].lvl = v[1]; if (v[2]) PADS[i].price = v[2]; } });
    if (d.slots) d.slots.forEach(function (v, i) { if (SLOTS[i]) SLOTS[i].b = v; });
    if (d.decor) d.decor.forEach(function (v, i) { if (DECOR[i]) DECOR[i].got = !!v; });
    if (d.proj) { project.inv = d.proj[0] || 0; project.stage = d.proj[1] || 0; project.done = !!d.proj[2]; }
    if (d.workers) d.workers.forEach(function (r) { hire(r, true); });
    return true;
  } catch (e) { return false; }
}
function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); }

/* =========================================================
   TAŞIMA / ETKİLEŞİM
   ========================================================= */
function capOf(a) { return a.isPlayer ? capacity() : ROLES[a.role].cap; }
function fits(a, it) { return carryW(a) + itemW(it) <= capOf(a); }
function popCarry(a, test) { for (var i = a.carry.length - 1; i >= 0; i--) if (test(a.carry[i])) return a.carry.splice(i, 1)[0]; return null; }
function hasCarry(a, test) { for (var i = 0; i < a.carry.length; i++) if (test(a.carry[i])) return true; return false; }
var isFish = function (it) { return it.k === 'fish'; };
var isFileto = function (it) { return it.k === 'fileto'; };
var isGoods = function (it) { return it.k === 'fileto' || it.k === 'fume'; };
var isMoney = function (it) { return it.k === 'money'; };
function itemKey(it) { return it.k + '|' + it.f; }
function carryTopZ(a, i) { return 15 + i * 3.4; }

function addFloat(x, y, txt, col) {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i];
    if (f.col === col && f.t < 0.4 && f.num && txt.charAt(0) === '+' && dist2(f.x, f.y, x, y) < 1.4) {
      var add = parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
      f.num += add; f.txt = '+' + money(f.num); f.t = 0; return;
    }
  }
  var n = txt.charAt(0) === '+' ? (parseFloat(txt.replace(/[^0-9]/g, '')) || 0) : 0;
  floats.push({ x: x, y: y, t: 0, txt: txt, col: col || '#fff', num: n });
}
function addPuff(x, y, col) {
  for (var i = 0; i < 5; i++) puffs.push({ x: x, y: y, z: rnd(4, 10), vx: rnd(-.5, .5), vy: rnd(-.5, .5), vz: rnd(12, 28), t: 0, col: col || '#fff' });
}
function fly(x0, y0, z0, x1, y1, z1, it, dur) {
  flyers.push({ x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, it: it, t: 0, d: dur || 0.4, h: rnd(18, 30) });
}

function canStand(x, y) {
  for (var i = 0; i < AREAS.length; i++) {
    var a = AREAS[i]; if (a.locked) continue;
    if (x > a.x0 + 0.35 && x < a.x1 - 0.35 && y > a.y0 - 0.02 && y < a.y1 + 0.02) return true;
  }
  return false;
}
function maxOpenY() { var m = 0; for (var i = 0; i < AREAS.length; i++) if (!AREAS[i].locked) m = Math.max(m, AREAS[i].y1); return m; }
function moveActor(a, dx, dy, spd, dt) {
  var L = Math.hypot(dx, dy);
  if (L < 0.001) { a.vx = 0; a.vy = 0; return false; }
  dx /= L; dy /= L;
  var nx = a.x + dx * spd * dt, ny = a.y + dy * spd * dt;
  if (canStand(nx, a.y)) a.x = nx;
  if (canStand(a.x, ny)) a.y = ny;
  a.vx = dx; a.vy = dy; a.face = pX(dx, dy) >= 0 ? 1 : -1; a.bob += dt * 12;
  return true;
}
function goTo(a, tx, ty, spd, dt, stopR) {
  var dx = tx - a.x, dy = ty - a.y, L = Math.hypot(dx, dy);
  if (L <= (stopR || 0.5)) { a.vx = 0; a.vy = 0; return true; }
  moveActor(a, dx, dy, spd, dt); return false;
}
function actDelay(a) { return a.isPlayer ? 0.075 : 0.1; }
function tryTake(a, dt, fn) { a.act -= dt; if (a.act > 0) return true; a.act = actDelay(a); fn(); return true; }

function iPickFish(a, s, dt) {
  if (!s.stock.length) return false;
  var it = s.stock[s.stock.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    s.stock.pop(); a.carry.push(it);
    fly(s.x, s.y + 0.9, 8, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
function iDropTable(a, tb, dt) {
  if (tb.inn.length >= tb.max || !hasCarry(a, isFish)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFish); tb.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), tb.x, tb.y, 11, it, 0.26); sfx.drop();
  });
}
function iPickMat(a, mat, dt, filter) {
  var idx = -1;
  for (var i = mat.items.length - 1; i >= 0; i--) if (!filter || filter(mat.items[i])) { idx = i; break; }
  if (idx < 0) return false;
  var it = mat.items[idx];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    mat.items.splice(idx, 1); a.carry.push(it);
    fly(mat.x, mat.y, 6, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
function iDropSmoker(a, dt) {
  if (smoker.inn.length >= smoker.max || !hasCarry(a, isFileto)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFileto); smoker.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), smoker.x, smoker.y, 12, it, 0.26); sfx.drop();
  });
}
function counterWants(c) {
  var m = {}, i, k;
  for (i = 0; i < c.slots.length; i++) {
    var cu = c.slots[i];
    if (cu && cu.state === 'wait') { k = cu.ord.k + '|' + cu.ord.f; m[k] = (m[k] || 0) + (cu.ord.need - cu.ord.got); }
  }
  for (i = 0; i < c.buffer.length; i++) { k = itemKey(c.buffer[i]); if (m[k] > 0) m[k]--; }
  return m;
}
function globalWants() {
  var list = openCounters(), g = {};
  for (var i = 0; i < list.length; i++) {
    var m = counterWants(list[i]);
    for (var k in m) if (m[k] > 0) g[k] = (g[k] || 0) + m[k];
  }
  return g;
}
function iDropCounter(a, c, dt) {
  if (c.buffer.length >= counterMax(c) || !hasCarry(a, isGoods)) return false;
  var m = counterWants(c), want = null, i;
  for (i = 0; i < a.carry.length; i++) {
    var it = a.carry[i];
    if (isGoods(it) && m[itemKey(it)] > 0) { want = it; break; }
  }
  if (!want && c.buffer.length >= 7) return false;
  return tryTake(a, dt, function () {
    var got = want ? popCarry(a, function (q) { return q === want; }) : popCarry(a, isGoods);
    c.buffer.push(got);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), c.x, c.y, 13, got, 0.26); sfx.drop();
  });
}
function iPickMoney(a, c, dt) {
  if (!c.tray.items.length) return false;
  var it = c.tray.items[c.tray.items.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    c.tray.items.pop(); a.carry.push(it);
    fly(c.tray.x, c.tray.y, 6, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
function iDeposit(a, dt) {
  if (!hasCarry(a, isMoney)) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.05;
  var it = popCarry(a, isMoney);
  S.cash += it.v; safe.pop = 1;
  fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), safe.x, safe.y, 13, it, 0.24);
  addFloat(safe.x, safe.y - 0.4, '+' + money(it.v), '#8ef2a2'); sfx.coin();
  return true;
}

/* =========================================================
   OYUNCU
   ========================================================= */
function updatePlayer(dt) {
  var ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (stick.active) { ix += stick.dx * 1.6; iy += stick.dy * 1.6; }
  ix = clamp(ix, -1, 1); iy = clamp(iy, -1, 1);
  var wx = (ix / (TW / 2) + iy / (TH / 2)) * (TW / 4);
  var wy = (iy / (TH / 2) - ix / (TW / 2)) * (TW / 4);
  moveActor(player, wx, wy, speed(), dt);

  var acted = false, i;
  for (i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked) continue;
    if (dist2(player.x, player.y, s.x, s.y + 0.9) < 1.6) acted = iPickFish(player, s, dt) || acted;
  }
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (AREAS[tb.z].locked) continue;
    if (dist2(player.x, player.y, tb.x, tb.y) < 1.6) acted = iDropTable(player, tb, dt) || acted;
    if (dist2(player.x, player.y, tb.mat.x, tb.mat.y) < 1.5) acted = iPickMat(player, tb.mat, dt) || acted;
  }
  if (!AREAS[smoker.z].locked) {
    if (dist2(player.x, player.y, smoker.x, smoker.y) < 1.6) acted = iDropSmoker(player, dt) || acted;
    if (dist2(player.x, player.y, smoker.mat.x, smoker.mat.y) < 1.5) acted = iPickMat(player, smoker.mat, dt) || acted;
  }
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    if (dist2(player.x, player.y, c.x, c.y) < 1.8) acted = iDropCounter(player, c, dt) || acted;
    if (dist2(player.x, player.y, c.tray.x, c.tray.y) < 1.5) acted = iPickMoney(player, c, dt) || acted;
  }
  if (dist2(player.x, player.y, safe.x, safe.y) < 1.8) acted = iDeposit(player, dt) || acted;
  if (!acted) player.act = 0;
}

/* =========================================================
   ÇALIŞANLAR
   ========================================================= */
function hire(role, silent) {
  var w = {
    role: role, x: 4.6 + rnd(-1, 1), y: 3.6 + rnd(-1, 1), z: 0, vx: 0, vy: 0,
    carry: [], act: 0, bob: 0, face: 1, table: null, mode: 'load', name: pick(WNAMES)
  };
  workers.push(w);
  if (role === 'filetocu') assignFiletocu(w);
  if (!silent) { toast(T('hired', { i: ROLES[role].icon, n: w.name, w: money(ROLES[role].wage) + perMin() })); }
  return w;
}
function assignFiletocu(w) {
  for (var i = 0; i < tables.length; i++) {
    if (AREAS[tables[i].z].locked || tables[i].worker) continue;
    tables[i].worker = w; w.table = tables[i]; return;
  }
  w.table = null;
}
function reassignWorkers() { for (var i = 0; i < workers.length; i++) if (workers[i].role === 'filetocu' && !workers[i].table) assignFiletocu(workers[i]); }
function openTables() { return tables.filter(function (t) { return !AREAS[t.z].locked; }); }
function openCounters() { return counters.filter(function (c) { return !AREAS[c.z].locked; }); }
function bestSpot(w) {
  var best = null, bs = -1e9;
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked) continue;
    var sc = s.stock.length * 3 - (w ? Math.sqrt(dist2(w.x, w.y, s.x, s.y)) : 0);
    if (sc > bs) { bs = sc; best = s; }
  } return best;
}
function tableWithSpace(w) {
  var list = openTables().filter(function (t) { return t.inn.length < t.max; }), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var d = (w ? dist2(w.x, w.y, list[i].x, list[i].y) : 0) + list[i].inn.length * 2;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function counterWantingCarry(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i]; if (c.buffer.length >= counterMax(c)) continue;
    var m = counterWants(c), hit = false;
    for (var j = 0; j < w.carry.length; j++) if (isGoods(w.carry[j]) && m[itemKey(w.carry[j])] > 0) { hit = true; break; }
    if (!hit) continue;
    var d = dist2(w.x, w.y, c.x, c.y);
    if (d < bd) { bd = d; best = c; }
  } return best;
}
function nearestCounterWithSpace(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    if (list[i].buffer.length >= 7) continue;
    var d = dist2(w.x, w.y, list[i].x, list[i].y);
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function matWith(filter, w) {
  var mats = openTables().map(function (t) { return t.mat; }), best = null, bd = 1e9, i, j;
  if (!AREAS[smoker.z].locked) mats.push(smoker.mat);
  for (i = 0; i < mats.length; i++) {
    var has = false;
    for (j = 0; j < mats[i].items.length; j++) if (filter(mats[i].items[j])) { has = true; break; }
    if (!has) continue;
    var d = w ? dist2(w.x, w.y, mats[i].x, mats[i].y) : 0;
    if (d < bd) { bd = d; best = mats[i]; }
  } return best;
}
function trayWithMoney(minN, w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    if (list[i].tray.items.length < (minN || 1)) continue;
    var d = w ? dist2(w.x, w.y, list[i].tray.x, list[i].tray.y) : 0;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function updateWorkers(dt) {
  var mul = workerSpeedMul();
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i], sp = ROLES[w.role].speed * mul;
    if (w.role === 'hamal') aiHamal(w, sp, dt);
    else if (w.role === 'tezgahtar') aiTezgahtar(w, sp, dt);
    else if (w.role === 'kasiyer') aiKasiyer(w, sp, dt);
    else aiFiletocu(w, sp, dt);
  }
}
function aiHamal(w, sp, dt) {
  var full = carryW(w) >= ROLES.hamal.cap - 0.5;
  var s = bestSpot(w);
  var canLoad = s && s.stock.length && fits(w, s.stock[s.stock.length - 1]);
  if (w.mode !== 'drop' && (full || !canLoad) && hasCarry(w, isFish)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isFish)) w.mode = 'load';
  if (w.mode === 'drop') {
    var t = tableWithSpace(w);
    if (t) { if (goTo(w, t.x - 0.1, t.y - 0.35, sp, dt, 0.9)) iDropTable(w, t, dt); }
    else goTo(w, 5.2, 4.2, sp, dt, 1.0);
    return;
  }
  if (canLoad) { if (goTo(w, s.x + 0.5, s.y + 1.3, sp, dt, 0.8)) iPickFish(w, s, dt); return; }
  if (hasCarry(w, isFish)) { w.mode = 'drop'; return; }
  if (s) goTo(w, s.x + 1.5, s.y + 1.8, sp, dt, 1.2);
}
function aiTezgahtar(w, sp, dt) {
  var full = carryW(w) >= ROLES.tezgahtar.cap - 0.5, i, k;
  var g = globalWants();
  for (i = 0; i < w.carry.length; i++) { k = itemKey(w.carry[i]); if (g[k] > 0) g[k]--; }
  var wantFilter = function (it) { return g[itemKey(it)] > 0; };
  var m = matWith(wantFilter, w);
  var stockLow = openCounters().filter(function (q) { return q.buffer.length < 5; }).length > 0;
  var filt = wantFilter;
  if (!m && stockLow) { m = matWith(isGoods, w); filt = isGoods; }
  if (w.mode !== 'drop' && (full || !m) && hasCarry(w, isGoods)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isGoods)) w.mode = 'load';
  if (w.mode === 'drop') {
    var c = counterWantingCarry(w) || nearestCounterWithSpace(w);
    if (c) { if (goTo(w, c.x - 0.5, c.y - 0.6, sp, dt, 1.0)) { if (!iDropCounter(w, c, dt)) w.mode = 'load'; } }
    else goTo(w, 7.2, 4.8, sp, dt, 1.0);
    return;
  }
  if (m && !full) {
    if (goTo(w, m.x, m.y, sp, dt, 0.8)) { if (!iPickMat(w, m, dt, filt)) w.mode = 'drop'; }
    return;
  }
  if (hasCarry(w, isGoods)) { w.mode = 'drop'; return; }
  goTo(w, 7.2, 4.8, sp, dt, 1.0);
}
function aiKasiyer(w, sp, dt) {
  var full = carryW(w) >= ROLES.kasiyer.cap - 0.5;
  var c = trayWithMoney(1, w);
  if (w.mode !== 'drop' && (full || !c) && hasCarry(w, isMoney)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isMoney)) w.mode = 'load';
  if (w.mode === 'drop') { if (goTo(w, safe.x + 0.35, safe.y + 0.35, sp, dt, 0.9)) iDeposit(w, dt); return; }
  if (c) { if (goTo(w, c.tray.x, c.tray.y, sp, dt, 0.8)) iPickMoney(w, c, dt); return; }
  if (hasCarry(w, isMoney)) { w.mode = 'drop'; return; }
  goTo(w, safe.x + 1.6, safe.y - 0.7, sp, dt, 1.0);
}
function aiFiletocu(w, sp, dt) {
  if (!w.table || AREAS[w.table.z].locked) assignFiletocu(w);
  if (!w.table) { goTo(w, 5.5, 4.2, sp, dt, 1.0); return; }
  goTo(w, w.table.x + 0.8, w.table.y + 0.15, sp, dt, 0.25);
}

/* =========================================================
   İSTASYONLAR
   ========================================================= */
function poolPick(pool) {
  var tot = 0, i;
  for (i = 0; i < pool.length; i++) tot += pool[i][1];
  var r = Math.random() * tot;
  for (i = 0; i < pool.length; i++) { r -= pool[i][1]; if (r <= 0) return pool[i][0]; }
  return pool[0][0];
}
function updateStations(dt) {
  var i, s, t, fishMul = event ? event.fishMul : 1;
  for (i = 0; i < spots.length; i++) {
    s = spots[i]; if (AREAS[s.z].locked) continue;
    if (s.stock.length >= areaStock(s.z)) { s.t = 0; continue; }
    s.t += dt * fishMul * areaNetMul(s.z);
    if (s.t >= s.rate) {
      s.t = 0;
      var it = { k: 'fish', f: poolPick(s.pool) };
      s.stock.push(it); S.caught++;
      var ox = s.face === 'n' ? s.x + rnd(-1, 1) : s.x - rnd(2, 3.2);
      var oy = s.face === 'n' ? s.y - rnd(2, 3.2) : s.y + rnd(-1, 1);
      fly(ox, oy, 2, s.x, s.y + 0.9, 8, it, 0.55);
    }
  }
  for (i = 0; i < tables.length; i++) {
    t = tables[i]; if (AREAS[t.z].locked) continue;
    if (!t.cur && t.inn.length && t.mat.items.length < 16 + slotEff(t.z, 'stock')) { t.cur = t.inn.shift(); t.t = 0; }
    if (t.cur) {
      t.t += dt * (t.worker ? 1.55 : 1);
      if (t.t >= FISH[t.cur.f].cut) {
        var F = FISH[t.cur.f];
        for (var k = 0; k < F.out; k++) {
          var fil = { k: 'fileto', f: t.cur.f };
          t.mat.items.push(fil);
          fly(t.x, t.y, 13, t.mat.x, t.mat.y, 6, fil, 0.36 + k * 0.05);
        }
        addPuff(t.x, t.y, '#ffffff'); t.cur = null; t.t = 0;
      }
    }
  }
  if (!AREAS[smoker.z].locked) {
    smoker.belt += dt;
    if (smoker.belt >= 1.0) {
      var src = tables[2].mat;
      if (smoker.inn.length < smoker.max && src.items.length) {
        smoker.belt = 0;
        var mv = src.items.pop(); smoker.inn.push(mv);
        fly(src.x, src.y, 6, smoker.x, smoker.y, 12, mv, 0.5);
      }
    }
    if (!smoker.cur && smoker.inn.length && smoker.mat.items.length < 12) { smoker.cur = smoker.inn.shift(); smoker.t = 0; }
    if (smoker.cur) {
      smoker.t += dt;
      if (smoker.t >= FUME_TIME) {
        var fm = { k: 'fume', f: smoker.cur.f };
        smoker.mat.items.push(fm);
        fly(smoker.x, smoker.y, 14, smoker.mat.x, smoker.mat.y, 6, fm, 0.4);
        addPuff(smoker.x, smoker.y, '#e8e2d8'); smoker.cur = null; smoker.t = 0;
      }
    }
  }
  for (i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked) updateCounter(counters[i], dt);
  safe.pop = Math.max(0, safe.pop - dt * 3);
}

/* =========================================================
   MÜŞTERİ + SİPARİŞ
   ========================================================= */
function availableProducts() {
  var list = [], seen = {}, i, j;
  for (i = 0; i < spots.length; i++) {
    if (AREAS[spots[i].z].locked) continue;
    for (j = 0; j < spots[i].pool.length; j++) {
      var f = spots[i].pool[j][0];
      if (!seen['fileto' + f]) { seen['fileto' + f] = 1; list.push({ k: 'fileto', f: f }); }
      if (!AREAS[smoker.z].locked && !seen['fume' + f]) { seen['fume' + f] = 1; list.push({ k: 'fume', f: f }); }
    }
  }
  return list;
}
function filterByTag(list, tag) {
  return list.filter(function (p) {
    var v = FISH[p.f].val;
    if (tag === 'cheap') return p.k === 'fileto' && v <= 12;
    if (tag === 'rich') return p.k === 'fileto' && v >= 17;
    if (tag === 'premium') return p.k === 'fileto' && v >= 27;
    if (tag === 'fume') return p.k === 'fume';
    return p.k === 'fileto';
  });
}
function makeOrder(type) {
  var list = availableProducts();
  var f = filterByTag(list, type.tag);
  if (!f.length) f = filterByTag(list, 'any');
  if (!f.length) f = list;
  if (!f.length) return null;
  var stock = {}, i, j;
  var lists = openTables().map(function (t) { return t.mat.items; }).concat(openCounters().map(function (c) { return c.buffer; }));
  if (!AREAS[smoker.z].locked) lists.push(smoker.mat.items);
  for (i = 0; i < lists.length; i++) for (j = 0; j < lists[i].length; j++) stock[lists[i][j].k + '|' + lists[i][j].f] = 1;
  var inStock = f.filter(function (q) { return stock[q.k + '|' + q.f]; });
  if (inStock.length && Math.random() < 0.7) f = inStock;
  var p = pick(f);
  return { k: p.k, f: p.f, need: irnd(type.qty[0], type.qty[1]), got: 0 };
}
function queueSlotPos(c, i) { return { x: 10.8 + (c.lane || 0) * 1.7, y: c.y + 0.1 + i * 1.0 }; }
function patienceMul() { return 1 + decorCount() * 0.02; }

function updateCounter(c, dt) {
  var custMul = (event ? event.custMul : 1) * areaFlow(c.z);
  c.spawnT -= dt * custMul;
  var qmax = queueMax(c.z), freeIdx = -1, i;
  for (i = 0; i < qmax; i++) if (!c.slots[i]) { freeIdx = i; break; }
  if (c.spawnT <= 0 && freeIdx >= 0) {
    c.spawnT = 5.4 * rnd(0.75, 1.3);
    var lvl = repLevel();
    var type = pick(CUST.filter(function (t) { return t.lvl <= lvl; }));
    var ord = makeOrder(type);
    if (ord) {
      var q = queueSlotPos(c, freeIdx);
      var cu = {
        x: q.x + 2.0, y: 20.5 + rnd(0, 2), z: 0, bob: rnd(0, 6), face: -1, type: type, ord: ord,
        state: 'walk', slot: freeIdx, c: c, pat: type.pat * patienceMul(), patMax: type.pat * patienceMul(),
        mood: 1, hair: irnd(0, 2), tone: irnd(0, 2)
      };
      c.slots[freeIdx] = cu; customers.push(cu);
    }
  }
  c.eatT -= dt;
  if (c.eatT <= 0) {
    for (var q2 = 0; q2 < c.slots.length; q2++) {
      var cu2 = c.slots[q2];
      if (!cu2 || cu2.state !== 'wait' || cu2.ord.got >= cu2.ord.need) continue;
      var idx = -1;
      for (i = 0; i < c.buffer.length; i++) if (c.buffer[i].k === cu2.ord.k && c.buffer[i].f === cu2.ord.f) { idx = i; break; }
      if (idx < 0) continue;
      c.eatT = 0.2;
      var it = c.buffer.splice(idx, 1)[0];
      cu2.ord.got++;
      var fp = queueSlotPos(c, cu2.slot);
      fly(c.x, c.y, 13, fp.x, fp.y, 17, it, 0.26);
      if (cu2.ord.got >= cu2.ord.need) finishOrder(c, cu2);
      break;
    }
  }
}
function finishOrder(c, cu) {
  var happy = cu.pat / cu.patMax;
  var unit = prodValue(cu.ord.k, cu.ord.f);
  var pay = Math.round(cu.ord.need * unit * cu.type.mult * (happy > 0.5 ? 1.2 : 1));
  payout(c, pay, cu.slot);
  cu.state = 'leave'; c.slots[cu.slot] = null; shiftQueue(c);
  S.served++; S.rep += cu.type.rep;
  var fp = queueSlotPos(c, cu.slot);
  addFloat(fp.x, fp.y - 0.5, '+' + money(pay), '#ffe27a');
  addFloat(fp.x + 0.6, fp.y - 1.1, '+' + cu.type.rep + '*', '#ffd76a');
  sfx.coin(); checkRepLevel();
}
var lastRepLvl = 1;
function checkRepLevel() {
  var l = repLevel();
  if (l > lastRepLvl) { lastRepLvl = l; toast(T('levelUp', { t: repTitle() })); sfx.star(); }
}
function shiftQueue(c) {
  var list = [], i;
  for (i = 0; i < c.slots.length; i++) if (c.slots[i]) list.push(c.slots[i]);
  for (i = 0; i < c.slots.length; i++) c.slots[i] = list[i] || null;
  for (i = 0; i < list.length; i++) list[i].slot = i;
}
function payout(c, total, slot) {
  var n = clamp(Math.ceil(total / 22), 1, 8), per = total / n;
  var src = queueSlotPos(c, slot || 0);
  for (var i = 0; i < n; i++) {
    if (c.tray.items.length >= 24) c.tray.items[c.tray.items.length - 1].v += per;
    else {
      var it = { k: 'money', v: per };
      c.tray.items.push(it);
      fly(src.x, src.y, 13, c.tray.x, c.tray.y, 6, it, 0.45);
    }
  }
}
function updateCustomers(dt) {
  for (var i = customers.length - 1; i >= 0; i--) {
    var cu = customers[i];
    cu.bob += dt * 4;
    if (cu.state === 'walk') {
      var p = queueSlotPos(cu.c, cu.slot);
      var dx = p.x - cu.x, dy = p.y - cu.y, L = Math.hypot(dx, dy);
      if (L < 0.14) cu.state = 'wait';
      else { cu.x += dx / L * 2.1 * dt; cu.y += dy / L * 2.1 * dt; cu.bob += dt * 8; }
    } else if (cu.state === 'wait') {
      var q = queueSlotPos(cu.c, cu.slot);
      cu.x = lerp(cu.x, q.x, 1 - Math.pow(0.001, dt));
      cu.y = lerp(cu.y, q.y, 1 - Math.pow(0.001, dt));
      cu.pat -= dt; cu.mood = clamp(cu.pat / cu.patMax, 0, 1);
      if (cu.pat <= 0) {
        cu.state = 'leave'; cu.c.slots[cu.slot] = null; shiftQueue(cu.c);
        S.lost++;
        var pen = cu.type.pen || 0;
        if (pen) { S.rep = Math.max(0, S.rep - pen); addFloat(cu.x, cu.y - 0.6, '-' + pen + '*', '#ff8a7a'); }
        else addFloat(cu.x, cu.y - 0.6, ':(', '#ff8a7a');
        sfx.bad();
      }
    } else {
      cu.x += ((13.6 + (cu.c.lane || 0) * 1.7) - cu.x) * Math.min(1, dt * 1.6);
      cu.y += 3.6 * dt; cu.bob += dt * 8;
      if (cu.y > 23) customers.splice(i, 1);
    }
  }
}

/* =========================================================
   YATIRIM: alan / seviye / işe alım / kozmetik
   ========================================================= */
for (var _d = 0; _d < DECOR.length; _d++) {
  PADS.push({ id: 'dec' + _d, z: DECOR[_d].z, x: DECOR[_d].x, y: DECOR[_d].y, kind: 'decor',
    decor: _d, icon: DECOR[_d].icon, price: DECOR[_d].cost, lvl: 0, max: 1, paid: 0 });
}
function padPrice(p) {
  if (p.kind === 'area') return AREAS[p.target].cost;
  if (p.kind === 'arealv') { var a = AREAS[p.area]; return a.lvl < MAXLV ? a.up[a.lvl] : 0; }
  return p.price;
}
function padDone(p) {
  if (p.kind === 'area') return !AREAS[p.target].locked;
  if (p.kind === 'arealv') return AREAS[p.area].lvl >= MAXLV;
  if (p.kind === 'decor') return DECOR[p.decor].got;
  return p.lvl >= p.max;
}
function padBlocked(p) {
  if (p.kind === 'area') return S.rep < AREAS[p.target].rep;
  if (p.kind === 'hire') return workers.length >= staffCap();
  return false;
}
function padReady(p) { return !AREAS[p.z].locked && !padDone(p); }
var nearestPad = null;
function updatePads(dt) {
  nearestPad = null;
  var bestD = 6.2, q;
  for (q = 0; q < PADS.length; q++) {
    var pp = PADS[q];
    if (!padReady(pp)) continue;
    var d = dist2(player.x, player.y, pp.x, pp.y);
    if (d < bestD) { bestD = d; nearestPad = pp; }
  }
  for (var i = 0; i < PADS.length; i++) {
    var p = PADS[i];
    if (!padReady(p) || padBlocked(p)) continue;
    if (dist2(player.x, player.y, p.x, p.y) < 1.3) {
      var price = padPrice(p);
      var rate = Math.max(70, price / 2.6);
      var d2 = Math.min(rate * dt, price - p.paid, S.cash);
      if (d2 > 0) {
        S.cash -= d2; p.paid += d2;
        if (Math.random() < 0.3) addPuff(p.x, p.y, '#ffc94a');
        if (Math.random() < 0.2) beep(400 + (p.paid / price) * 500, 0.03, 'square', 0.015);
      }
      if (p.paid >= price - 0.01) applyPad(p);
    }
  }
}
function applyPad(p) {
  p.paid = 0; sfx.buy();
  if (p.kind === 'cap') { S.capLvl++; p.lvl++; toast(T('capUp', { n: capacity() })); }
  else if (p.kind === 'spd') { S.spdLvl++; p.lvl++; toast(T('spdUp')); }
  else if (p.kind === 'price') { S.priceLvl++; p.lvl++; toast(T('priceUp')); }
  else if (p.kind === 'hire') { p.lvl++; hire(p.role); }
  else if (p.kind === 'area') {
    AREAS[p.target].locked = false; rebuildCounters(); reassignWorkers();
    toast(T('areaOpen', { n: NM(AREAS[p.target].n) })); sfx.build();
    camShake = 6;
  } else if (p.kind === 'arealv') {
    var a = AREAS[p.area]; a.lvl++; rebuildCounters();
    toast(T('areaLvUp', { n: NM(a.n), l: a.lvl })); sfx.build(); camShake = 5;
  } else if (p.kind === 'decor') {
    DECOR[p.decor].got = true;
    toast(T('decorBought', { n: NM(DECOR[p.decor].n) })); sfx.build();
  }
  if ((p.kind === 'cap' || p.kind === 'spd' || p.kind === 'price' || p.kind === 'hire') && p.lvl < p.max) p.price = Math.round(p.price * p.growth);
  addPuff(p.x, p.y, '#ffc94a'); addPuff(p.x, p.y, '#ffffff');
  save();
}

/* --- yapı noktaları + büyük proje (alt panel) --- */
var sheet = { kind: null, target: null };
function updateSlotsAndProject() {
  var best = null, bd = 1.9, i;
  for (i = 0; i < SLOTS.length; i++) {
    var s = SLOTS[i]; if (!slotActive(s)) continue;
    var d = dist2(player.x, player.y, s.x, s.y);
    if (d < bd) { bd = d; best = { kind: 'build', target: s }; }
  }
  if (!AREAS[project.z].locked && !project.done) {
    var pd = dist2(player.x, player.y, project.x, project.y + 1.4);
    if (pd < 2.6 && pd < bd) best = { kind: 'project', target: project };
  }
  if (best) {
    if (sheet.kind !== best.kind || sheet.target !== best.target) openSheet(best.kind, best.target);
  } else if (sheet.kind) {
    var away = sheet.kind === 'build'
      ? dist2(player.x, player.y, sheet.target.x, sheet.target.y) > 3.4
      : dist2(player.x, player.y, project.x, project.y + 1.4) > 4.6;
    if (away) closeSheet();
  }
}
function buyBuilding(slot, id) {
  var d = bdef(id); if (!d) return;
  var cost = d.cost;
  if (slot.b === id) return;
  var refund = slot.b ? Math.round(bdef(slot.b).cost * 0.6) : 0;
  if (S.cash + refund < cost) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash += refund - cost;
  slot.b = id;
  rebuildCounters(); reassignWorkers();
  toast(T('built', { n: NM(d.n) })); sfx.build(); camShake = 5;
  addPuff(slot.x, slot.y, '#ffc94a');
  save(); renderSheet();
}
function investProject(amount) {
  if (project.done) return;
  var amt = Math.min(amount, S.cash, project.total - project.inv);
  if (amt <= 0) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash -= amt; project.inv += amt;
  var st = projStageOf(projPct());
  if (st > project.stage) {
    project.stage = st; sfx.build(); camShake = 7;
    addPuff(project.x, project.y, '#ffc94a');
    if (st >= project.stages.length) {
      project.done = true; rebuildCounters();
      toast(T('projDone', { n: NM(project.n) }));
      S.rep += 15; checkRepLevel();
    } else toast(T('projStage', { n: NM(project.n), p: Math.round(projPct() * 100) }));
  } else sfx.coin();
  save(); renderSheet();
}

/* =========================================================
   OLAYLAR / EĞİTİM / EFEKT
   ========================================================= */
function updateEvents(dt) {
  if (event) { eventT -= dt; if (eventT <= 0) { event = null; nextEvent = rnd(70, 110); } return; }
  nextEvent -= dt;
  if (nextEvent <= 0 && S.tut >= 5) { event = pick(EVENTS); eventT = event.dur; toast(T(event.msg)); }
}
var TUTOK = [
  function () { return spots[0].stock.length > 0; },
  function () { return hasCarry(player, isFish); },
  function () { return tables[0].inn.length > 0 || tables[0].cur || tables[0].mat.items.length > 0; },
  function () { return counters.length && counters[0].buffer.length > 0; },
  function () { return S.cash > 0; },
  function () { for (var i = 0; i < PADS.length; i++) if (PADS[i].lvl > 0 || (PADS[i].kind === 'decor' && DECOR[PADS[i].decor].got)) return true; return false; }
];
function updateTutorial() {
  if (S.tut >= TUTOK.length) return;
  if (TUTOK[S.tut]()) {
    S.tut++;
    if (S.tut < TUTOK.length) sfx.star();
    else { toast(T('tutDone')); save(); }
  }
}
var camShake = 0;
function updateFx(dt) {
  var i;
  for (i = flyers.length - 1; i >= 0; i--) { flyers[i].t += dt; if (flyers[i].t >= flyers[i].d) flyers.splice(i, 1); }
  for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 0.85) floats.splice(i, 1); }
  for (i = puffs.length - 1; i >= 0; i--) {
    var p = puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 55 * dt;
    if (p.t > 0.65) puffs.splice(i, 1);
  }
  camShake = Math.max(0, camShake - dt * 18);
  for (i = 0; i < gulls.length; i++) {
    var g = gulls[i];
    g.x += g.vx * dt; g.y += g.vy * dt; g.f += dt * 9;
    if (g.x > 34 || g.y > 30) { g.x = rnd(-22, -6); g.y = rnd(-18, 6); }
  }
}

/* =========================================================
   ÇİZİM — pixel temel
   ========================================================= */
var F6 = '6px "Pixelify Sans",monospace', F7 = '7px "Pixelify Sans",monospace',
    F8 = '8px "Pixelify Sans",monospace', F10 = '10px "Pixelify Sans",monospace';
function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); }
function dot(x, y, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), 1, 1); }
function quad(pts, c) {
  ctx.beginPath(); ctx.moveTo(R(pts[0][0]), R(pts[0][1]));
  for (var i = 1; i < pts.length; i++) ctx.lineTo(R(pts[i][0]), R(pts[i][1]));
  ctx.closePath(); ctx.fillStyle = c; ctx.fill();
}
function isoQuad(x, y, w, h, z, c) {
  quad([[pX(x, y), pY(x, y, z)], [pX(x + w, y), pY(x + w, y, z)],
        [pX(x + w, y + h), pY(x + w, y + h, z)], [pX(x, y + h), pY(x, y + h, z)]], c);
}
function isoLine(x0, y0, x1, y1, z, c, w) {
  ctx.strokeStyle = c; ctx.lineWidth = w || 1;
  ctx.beginPath(); ctx.moveTo(R(pX(x0, y0)), R(pY(x0, y0, z))); ctx.lineTo(R(pX(x1, y1)), R(pY(x1, y1, z))); ctx.stroke();
}
/* izometrik kutu: gövde + üst yüz */
function isoBox(x, y, w, h, z0, z1, top, left, right) {
  var bx = x + w, by = y + h;
  quad([[pX(bx, y), pY(bx, y, z1)], [pX(bx, by), pY(bx, by, z1)],
        [pX(bx, by), pY(bx, by, z0)], [pX(bx, y), pY(bx, y, z0)]], right);
  quad([[pX(x, by), pY(x, by, z1)], [pX(bx, by), pY(bx, by, z1)],
        [pX(bx, by), pY(bx, by, z0)], [pX(x, by), pY(x, by, z0)]], left);
  isoQuad(x, y, w, h, z1, top);
}
function shadow(x, y, r) {
  ctx.save(); ctx.globalAlpha = 0.22;
  var cx = pX(x, y), cy = pY(x, y, 0);
  quad([[cx - r * 6, cy], [cx, cy - r * 3], [cx + r * 6, cy], [cx, cy + r * 3]], '#123020');
  ctx.restore();
}
function txt(s, x, y, c, font, align) {
  ctx.font = font || F7; ctx.textAlign = align || 'center';
  ctx.fillStyle = c || '#f4e9d2'; ctx.fillText(s, R(x), R(y));
}
function txtShadow(s, x, y, c, font, align) {
  ctx.font = font || F7; ctx.textAlign = align || 'center';
  ctx.fillStyle = '#0a1a27'; ctx.fillText(s, R(x) + 1, R(y) + 1);
  ctx.fillStyle = c || '#f4e9d2'; ctx.fillText(s, R(x), R(y));
}
function panel(x, y, w, h, bg, edge) {
  px(x, y, w, h, edge || '#0a1a27');
  px(x + 1, y + 1, w - 2, h - 2, bg || '#14293c');
  px(x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,.10)');
}
function labelAt(x, y, z, s, col, short) {
  var d = dist2(player.x, player.y, x, y);
  if (d < 2.4) { if (short) uiLabel(x, y, z, short, col, 0.45); return; }
  if (d < 26) { uiLabel(x, y, z, s, col, 1); return; }
  if (d < 90 && short) uiLabel(x, y, z, short, col, 0.72);
}

/* ---------- eşyalar ---------- */
function drawFishItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 2, 8, 4, F.col);
  px(x - 3, y - 1, 6, 2, F.bel);
  px(x + 3, y - 3, 3, 6, F.col);
  dot(x - 3, y - 1, '#16222b');
  px(x - 4, y - 3, 5, 1, F.col);
}
function drawFiletoItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 2, 8, 4, '#f2ece0');
  px(x - 3, y - 1, 6, 2, F.meat);
  px(x - 4, y + 1, 8, 1, '#b9b0a0');
}
function drawFumeItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 3, 8, 6, '#8a6440');
  px(x - 4, y - 3, 8, 2, '#a97f52');
  px(x - 2, y - 1, 4, 3, '#f0e2c8');
  dot(x, y, F.meat);
}
function drawMoneyItem(x, y) {
  px(x - 4, y - 3, 8, 5, '#2e7d43');
  px(x - 4, y - 3, 8, 2, '#5fd37a');
  px(x - 1, y - 2, 2, 3, '#e8ffe8');
}
function drawItem(it, x, y) {
  if (!it) return;
  if (it.k === 'fish') drawFishItem(x, y, it.f);
  else if (it.k === 'fileto') drawFiletoItem(x, y, it.f);
  else if (it.k === 'fume') drawFumeItem(x, y, it.f);
  else drawMoneyItem(x, y);
}
function drawCrateIcon(x, y, it) {
  px(x - 7, y - 7, 14, 8, '#7d5228');
  px(x - 7, y - 9, 14, 3, '#a9743f');
  px(x - 7, y - 4, 14, 1, '#5d3c1c');
  drawItem(it, x, y - 12);
}
/* GDD §11 yığın kuralı */
function drawStack(x, y, items, baseZ, gap) {
  var n = items.length; if (!n) return;
  gap = gap || 3.4;
  var sx = pX(x, y);
  if (n >= 20) {
    drawCrateIcon(sx, pY(x, y, baseZ + 6), items[n - 1]);
    uiBadge(x, y, baseZ + 22, 'x' + n);
    return;
  }
  var show = Math.min(n, 5);
  for (var i = 0; i < show; i++) drawItem(items[n - show + i], sx, pY(x, y, baseZ + i * gap));
  if (n > show) uiBadge(x, y, baseZ + show * gap + 7, 'x' + n);
}


/* ---------- insanlar (pixel) ---------- */
var SKIN = ['#e8b98a', '#cf9a68', '#a4703f'];
var HAIR = ['#1d1713', '#2e2018', '#120f0d'];
function drawPerson(a, o) {
  var sx = R(pX(a.x, a.y)), sy = R(pY(a.x, a.y, a.z || 0));
  var moving = Math.hypot(a.vx || 0, a.vy || 0) > 0.05 || o.walk;
  var b = moving ? (Math.sin(a.bob) > 0 ? 1 : 0) : 0;
  var sw = moving ? (Math.sin(a.bob) > 0 ? 1 : -1) : 0;
  shadow(a.x, a.y, 0.6);
  var y = sy - b;
  /* bacak */
  px(sx - 3, y - 6, 2, 6, '#2b3a45');
  px(sx + 1, y - 6, 2, 6, '#2b3a45');
  px(sx - 3 + sw, y - 1, 3, 1, '#16222b');
  px(sx + 1 - sw, y - 1, 3, 1, '#16222b');
  /* gövde */
  px(sx - 4, y - 14, 8, 8, o.coat);
  px(sx - 4, y - 14, 8, 1, o.coat2 || o.coat);
  px(sx - 4, y - 9, 8, 1, 'rgba(0,0,0,.18)');
  /* kol */
  px(sx - 6, y - 13, 2, 6, o.coat2 || o.coat);
  px(sx + 4, y - 13, 2, 6, o.coat2 || o.coat);
  if (o.bag) px(o.face > 0 ? sx - 7 : sx + 5, y - 13, 2, 5, '#4a3a2a');
  /* kafa */
  px(sx - 3, y - 20, 6, 6, o.skin || SKIN[0]);
  if (o.cap) { px(sx - 4, y - 21, 8, 2, o.cap); px(o.face > 0 ? sx + 2 : sx - 5, y - 20, 3, 1, o.cap); }
  else { px(sx - 4, y - 21, 8, 3, o.hair || HAIR[0]); px(sx - 4, y - 19, 1, 2, o.hair || HAIR[0]); px(sx + 3, y - 19, 1, 2, o.hair || HAIR[0]); }
  if (o.must) px(sx - 2, y - 16, 4, 1, o.hair || HAIR[0]);
  var fx = o.face > 0 ? 1 : -1;
  dot(sx + fx, y - 17, '#16222b'); dot(sx + fx * 2 - (fx > 0 ? 0 : 1), y - 17, '#16222b');
  if (o.mood !== undefined && o.mood < 0.45) px(sx - 1, y - 15, 3, 1, '#7a3a2a');
  if (a.carry && a.carry.length) drawStack(a.x, a.y, a.carry, 15 + b, 3.4);
}
function drawCustomer(cu) {
  var t = cu.type;
  drawPerson(cu, {
    coat: t.coat, coat2: t.coat2, skin: SKIN[cu.tone], hair: HAIR[cu.hair], face: cu.face,
    mood: cu.state === 'wait' ? cu.mood : 1, walk: cu.state !== 'wait',
    must: cu.hair === 1, cap: t.id === 'kaptan' ? '#123449' : (t.id === 'sef' ? '#f7f7f2' : null)
  });
  if (cu.state !== 'wait') return;
  var sx = R(pX(cu.x, cu.y)), sy = R(pY(cu.x, cu.y, 0));
  var bx = sx + 13, by = sy - 28;
  /* sipariş balonu + sabır halkası */
  px(bx - 9, by - 8, 18, 15, '#0a1a27');
  px(bx - 8, by - 7, 16, 13, '#f4e9d2');
  px(bx - 3, by + 7, 3, 3, '#f4e9d2');
  if (cu.ord.k === 'fume') drawFumeItem(bx - 3, by - 1, cu.ord.f); else drawFiletoItem(bx - 3, by - 1, cu.ord.f);
  uiText(cu.x, cu.y, 0, 'x' + (cu.ord.need - cu.ord.got), '#ffe9a8', 12, 1, 18, -24);
  var w = 16, fw = R(w * cu.mood);
  px(bx - 8, by - 10, w, 2, '#0a1a27');
  px(bx - 8, by - 10, fw, 2, cu.mood > 0.5 ? '#5fd37a' : (cu.mood > 0.25 ? '#ffc94a' : '#e5533d'));
  if (t.pen) { px(bx - 10, by - 9, 1, 17, '#ffc94a'); px(bx + 9, by - 9, 1, 17, '#ffc94a'); }
}

/* =========================================================
   ÇİZİM — deniz, kıyı, bölgeler (Türkiye limanı)
   ========================================================= */
var shoal = [], waves = [], boats = [], village = [];
var _sd = 20260919;
function srnd() { _sd = (_sd * 1664525 + 1013904223) % 4294967296; return _sd / 4294967296; }
var scenery = [], grass = [];
(function initArt() {
  var i, x, y, g;
  for (i = 0; i < 420; i++) {
    g = 0; do { x = rnd(-26, 34); y = rnd(-26, 34); g++; } while (x > -1.4 && y > -1.4 && g < 40);
    shoal.push({ x: x, y: y, s: srnd() < 0.5 ? 1 : 2, sp: rnd(0.2, 0.5), ph: rnd(0, TAU) });
  }
  for (i = 0; i < 90; i++) {
    g = 0; do { x = rnd(-26, 34); y = rnd(-26, 34); g++; } while (x > -2 && y > -2 && g < 40);
    waves.push({ x: x, y: y, w: 2 + Math.floor(srnd() * 4), ph: rnd(0, TAU) });
  }
  boats.push({ x: -3.2, y: 2.6, r: 1 }, { x: -4.6, y: 8.0, r: 0 }, { x: 6.0, y: -3.6, r: 1 });
  for (i = 0; i < 26; i++) {
    village.push({ x: i * 26 + srnd() * 14, w: 10 + srnd() * 12, h: 7 + srnd() * 11,
      roof: srnd() < 0.75, t: srnd() });
  }
  /* kara süsleri: bölgelerin dışında kalan kıyı şeridi */
  function freeLand(fx, fy) {
    if (fx < -0.4 || fy < -0.4 || fx > 17.2 || fy > 24.2) return false;
    if (fx < 10.2 && fy < 17.8) return false;      /* iskele bölgeleri */
    if (fx > 10.2 && fx < 14.6 && fy > -0.4) return false; /* müşteri yolu */
    return true;
  }
  for (i = 0; i < 260; i++) {
    x = rnd(-0.4, 17.4); y = rnd(-0.4, 24.4);
    if (!freeLand(x, y)) continue;
    var r = srnd();
    scenery.push({ x: x, y: y, t: r < 0.3 ? 'servi' : r < 0.55 ? 'cam' : r < 0.75 ? 'kaya' : r < 0.9 ? 'cali' : 'varil', s: 0.8 + srnd() * 0.5 });
  }
  for (i = 0; i < 420; i++) {
    x = rnd(-0.6, 17.4); y = rnd(-0.6, 24.4);
    if (x < 10.1 && y < 17.6) continue;
    grass.push({ x: x, y: y, c: srnd() < 0.5 ? '#b9a878' : '#a8b06a' });
  }
  for (i = 0; i < 5; i++) gulls.push({ x: rnd(-20, 10), y: rnd(-18, 4), vx: rnd(0.5, 1.1), vy: rnd(0.1, 0.4), f: rnd(0, 6) });
})();

function drawSea() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var bands = [['#1a5f85', 0], ['#1d6f95', 0.34], ['#2182a8', 0.6], ['#2b96b8', 0.82]];
  for (var i = 0; i < bands.length; i++) {
    var y0 = Math.floor(H * bands[i][1]);
    var y1 = i < bands.length - 1 ? Math.floor(H * bands[i + 1][1]) : H;
    px(0, y0, W, y1 - y0, bands[i][0]);
  }
}
/* uzak sahil: beyaz evler, kırmızı çatılar, minare, servi (parallax) */
function drawVillage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var off = (camX * 0.22) % 260, base = Math.floor(H * 0.26) - Math.floor(camY * 0.12);
  if (base < -40) base = -40; if (base > H * 0.5) base = Math.floor(H * 0.5);
  /* tepeler */
  for (var h = 0; h < 3; h++) {
    var hy = base - 16 + h * 7;
    ctx.fillStyle = ['#5c6f4a', '#6b7d54', '#7b8b5e'][h];
    ctx.beginPath(); ctx.moveTo(0, hy + 14);
    for (var x = 0; x <= W + 8; x += 8) {
      var yy = hy + Math.sin((x + off * (h + 1) * 0.35) * 0.018 + h) * 5;
      ctx.lineTo(x, R(yy));
    }
    ctx.lineTo(W, hy + 20); ctx.lineTo(0, hy + 20); ctx.closePath(); ctx.fill();
  }
  /* evler */
  for (var i = 0; i < village.length; i++) {
    var v = village[i];
    var vx = ((v.x - off) % (26 * 26));
    if (vx < -30) vx += 26 * 26;
    if (vx > W + 20) continue;
    var vy = base + 4 - v.h;
    px(vx, vy, v.w, v.h, '#efe4cd');
    px(vx, vy, v.w, 1, '#fffaf0');
    if (v.roof) { px(vx - 1, vy - 2, v.w + 2, 2, '#b8442e'); }
    for (var wx = 2; wx < v.w - 2; wx += 4) px(vx + wx, vy + 2, 2, 2, '#6a5a44');
    if (v.t > 0.9) { /* servi ağacı */
      px(vx + v.w + 2, vy - 6, 3, v.h + 8, '#2f4a33');
      px(vx + v.w + 2, vy - 8, 3, 3, '#3b5c3f');
    }
  }
  /* minare + cami kubbesi */
  var mx = ((160 - off) % (26 * 26)); if (mx < -40) mx += 26 * 26;
  if (mx < W + 30) {
    var my = base - 4;
    px(mx + 16, my - 4, 14, 10, '#efe4cd');
    ctx.fillStyle = '#9aa7a2';
    ctx.beginPath(); ctx.arc(R(mx + 23), R(my - 4), 7, Math.PI, 0); ctx.closePath(); ctx.fill();
    px(mx + 22, my - 14, 1, 3, '#d8cfa8');
    px(mx + 8, my - 26, 3, 32, '#efe4cd');
    px(mx + 7, my - 16, 5, 2, '#b8442e');
    ctx.fillStyle = '#efe4cd';
    ctx.beginPath(); ctx.moveTo(R(mx + 7), R(my - 26)); ctx.lineTo(R(mx + 9.5), R(my - 33)); ctx.lineTo(R(mx + 12), R(my - 26)); ctx.closePath(); ctx.fill();
  }
  px(0, base + 4, W, 3, '#3f7d92');
}
function drawShoal() {
  for (var i = 0; i < shoal.length; i++) {
    var f = shoal[i];
    f.x += f.sp * 0.004;
    if (f.x > 34) f.x = -26;
    if (f.x > -1.4 && f.y > -1.4) continue;
    var sx = pX(f.x, f.y), sy = pY(f.x, f.y, 0) + Math.sin(gameT * 1.4 + f.ph) * 1.2;
    px(sx, sy, f.s + 2, f.s, 'rgba(10,45,70,.55)');
  }
}
function drawWaves() {
  for (var i = 0; i < waves.length; i++) {
    var w = waves[i];
    var ph = Math.sin(gameT * 0.9 + w.ph);
    if (ph < 0.2) continue;
    var sx = pX(w.x, w.y), sy = pY(w.x, w.y, 0);
    px(sx, sy, w.w, 1, 'rgba(255,255,255,.5)');
  }
}
function drawBoat(b) {
  var sx = R(pX(b.x, b.y)), sy = R(pY(b.x, b.y, 0)) + R(Math.sin(gameT * 1.1 + b.x) * 1.2);
  px(sx - 9, sy - 3, 18, 4, '#7d3f22');
  px(sx - 8, sy - 5, 16, 2, '#a8552c');
  px(sx - 7, sy - 6, 14, 1, '#e8d9b8');
  px(sx - 1, sy - 15, 2, 10, '#5d3c1c');
  if (b.r) { px(sx + 1, sy - 15, 7, 8, '#e5e0d0'); px(sx + 1, sy - 15, 7, 1, '#e30a17'); }
  px(sx - 9, sy + 1, 18, 1, 'rgba(255,255,255,.35)');
}
function drawGull(g) {
  var sx = R(pX(g.x, g.y)), sy = R(pY(g.x, g.y, 46 + Math.sin(g.f * 0.5) * 3));
  var up = Math.sin(g.f) > 0;
  px(sx - 3, sy + (up ? -1 : 1), 3, 1, '#ffffff');
  px(sx + 1, sy + (up ? -1 : 1), 3, 1, '#ffffff');
  px(sx - 1, sy, 2, 1, '#e8e8e8');
}
var LANDX = 17.5, LANDY = 24.5;
function drawLand() {
  quad([[pX(-0.7, -0.7), pY(-0.7, -0.7, 0)], [pX(LANDX, -0.7), pY(LANDX, -0.7, 0)],
        [pX(LANDX, LANDY), pY(LANDX, LANDY, 0)], [pX(-0.7, LANDY), pY(-0.7, LANDY, 0)]], '#cbb98d');
  /* kuru ot dokusu */
  ctx.save(); ctx.globalAlpha = 0.5;
  for (var i = 0; i < grass.length; i++) px(pX(grass[i].x, grass[i].y), pY(grass[i].x, grass[i].y, 0), 2, 1, grass[i].c);
  ctx.restore();
  /* rıhtım kenarı (tüm çevre) */
  ctx.strokeStyle = '#b3aa93'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, -0.7)), R(pY(-0.7, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, LANDY)), R(pY(-0.7, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, LANDY)), R(pY(LANDX, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX + 0.35, -1.05)), R(pY(LANDX + 0.35, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, -1.05)), R(pY(-1.05, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, LANDY + 0.35)), R(pY(-1.05, LANDY + 0.35, 0)));
  ctx.lineTo(R(pX(LANDX + 0.35, LANDY + 0.35)), R(pY(LANDX + 0.35, LANDY + 0.35, 0)));
  ctx.closePath(); ctx.stroke();
}

/* bölge zemini — seviyeye göre görsel (GDD §21.1) */
function drawArea(a, i) {
  var w = a.x1 - a.x0, h = a.y1 - a.y0;
  if (a.locked) {
    isoQuad(a.x0, a.y0, w, h, 0, '#9d8f63');
    ctx.save(); ctx.globalAlpha = 0.35;
    for (var g = 0; g < 26; g++) {
      var gx = a.x0 + 0.4 + ((g * 7) % 9) * 1.0, gy = a.y0 + 0.5 + ((g * 3) % 5) * 1.0;
      px(pX(gx, gy), pY(gx, gy, 0), 3, 2, '#7f7148');
    }
    ctx.restore();
    /* halat çit: üst kenar */
    for (var t = 0; t <= w; t += 1.1) {
      var fx = a.x0 + t, fy = a.y0 + 0.15;
      var sx0 = R(pX(fx, fy)), sy0 = R(pY(fx, fy, 0));
      px(sx0 - 1, sy0 - 9, 2, 9, '#6b5334');
      px(sx0 - 2, sy0 - 10, 4, 1, '#8a6f45');
    }
    isoLine(a.x0, a.y0 + 0.15, a.x1, a.y0 + 0.15, 7, '#c9a15e', 1);
    isoLine(a.x0, a.y0 + 0.15, a.x1, a.y0 + 0.15, 4, '#a98b4e', 1);
    return;
  }
  var lv = a.lvl;
  var base = lv >= 3 ? '#c9c3b2' : (lv === 2 ? '#c08c52' : '#ab7a48');
  isoQuad(a.x0, a.y0, w, h, 0, base);
  ctx.save(); ctx.globalAlpha = lv >= 3 ? 0.35 : 0.22;
  ctx.strokeStyle = lv >= 3 ? '#9a9483' : '#7d5228'; ctx.lineWidth = 1;
  for (var k = a.y0 + 1; k < a.y1; k += 1) {
    ctx.beginPath();
    ctx.moveTo(R(pX(a.x0, k)), R(pY(a.x0, k, 0))); ctx.lineTo(R(pX(a.x1, k)), R(pY(a.x1, k, 0)));
    ctx.stroke();
  }
  if (lv >= 3) for (var k2 = a.x0 + 1; k2 < a.x1; k2 += 1) {
    ctx.beginPath();
    ctx.moveTo(R(pX(k2, a.y0)), R(pY(k2, a.y0, 0))); ctx.lineTo(R(pX(k2, a.y1)), R(pY(k2, a.y1, 0)));
    ctx.stroke();
  }
  ctx.restore();
  if (lv >= 2) {
    ctx.save(); ctx.globalAlpha = 0.25;
    isoQuad(a.x0 + 0.3, a.y0 + 0.3, w - 0.6, 0.25, 0, '#efe4cd');
    ctx.restore();
  }
}
function fencePost(x, y, lv) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  if (lv >= 3) { px(sx - 1, sy - 11, 3, 11, '#8e8878'); px(sx - 2, sy - 13, 5, 2, '#b3aa93'); }
  else { px(sx - 1, sy - 9, 3, 9, '#8d5f33'); px(sx - 2, sy - 10, 5, 1, '#b07c45'); }
}
/* sokak lambası (Lv3 bölgelerde köşelerde) */
function drawLamp(x, y) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  px(sx - 1, sy - 22, 2, 22, '#3c4650');
  px(sx - 3, sy - 26, 6, 4, '#2b3a45');
  px(sx - 2, sy - 25, 4, 2, '#ffd98a');
  ctx.save(); ctx.globalAlpha = 0.16;
  quad([[sx - 10, sy], [sx, sy - 6], [sx + 10, sy], [sx, sy + 6]], '#ffd98a');
  ctx.restore();
}
/* bölge tabelası */
function drawSign(a) {
  var locked = a.locked;
  var x = locked ? (a.x0 + a.x1) / 2 : a.x0 + 0.6, y = locked ? (a.y0 + a.y1) / 2 : a.y1 - 0.35;
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  var s = UP(NM(a.n));
  var fs = locked ? 13 : 11;
  uctx.font = uiFont(fs);
  var w = R((uctx.measureText(s).width + (locked ? 30 : 16)) / PXS);
  var h = R((fs + 10) / PXS);
  if (locked) {
    px(sx - 2, sy - 10, 2, 10, '#6b4a28'); px(sx + 1, sy - 10, 2, 10, '#6b4a28');
    px(sx - w / 2 - 1, sy - 10 - h - 1, w + 2, h + 2, '#5d3c1c');
    px(sx - w / 2, sy - 10 - h, w, h, '#c9a15e');
    uiText(x, y, 0, '🔒 ' + s, '#3a2401', fs, 1, 0, -10 - h / 2 + fs / (2.6 * PXS), 'rgba(233,213,168,.85)');
  } else {
    px(sx - 1, sy - 9, 2, 9, '#6b4a28');
    px(sx - w / 2 - 1, sy - 9 - h - 1, w + 2, h + 2, '#5d3c1c');
    px(sx - w / 2, sy - 9 - h, w, h, '#c9a15e');
    uiText(x, y, 0, s, '#3a2401', fs, 0.95, 0, -9 - h / 2 + fs / (2.6 * PXS), 'rgba(233,213,168,.85)');
  }
}

function drawScenery(d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0)), z = d.s;
  if (d.t === 'servi') {            /* servi ağacı */
    px(sx - 1, sy - 4, 2, 4, '#6b4a28');
    px(sx - 3, sy - R(22 * z), 6, R(18 * z), '#2f4a33');
    px(sx - 2, sy - R(24 * z), 4, R(4 * z), '#3b5c3f');
    px(sx + 1, sy - R(20 * z), 2, R(14 * z), '#3b5c3f');
  } else if (d.t === 'cam') {       /* fıstık çamı */
    px(sx - 1, sy - 7, 3, 7, '#7a5230');
    px(sx - 7, sy - R(14 * z), 14, R(5 * z), '#3f6b42');
    px(sx - 5, sy - R(18 * z), 10, R(5 * z), '#4c7d4d');
    px(sx - 3, sy - R(21 * z), 6, R(4 * z), '#578c57');
  } else if (d.t === 'kaya') {
    px(sx - 5, sy - 5, 10, 5, '#a8a291');
    px(sx - 3, sy - 7, 6, 3, '#bab4a2');
  } else if (d.t === 'cali') {
    px(sx - 4, sy - 4, 8, 4, '#8c9a56');
    px(sx - 2, sy - 6, 5, 3, '#9aa863');
  } else {                           /* varil / ağ yığını */
    px(sx - 4, sy - 9, 8, 9, '#8a5a2e');
    px(sx - 4, sy - 9, 8, 2, '#a86f3a');
    px(sx - 4, sy - 5, 8, 1, '#5d3c1c');
  }
}

/* =========================================================
   ÇİZİM — istasyonlar / yapılar / proje / süs
   ========================================================= */
function drawSpot(s) {
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  /* iskele babası + ağ makarası */
  px(sx - 4, sy - 14, 8, 14, '#8d5f33');
  px(sx - 4, sy - 14, 8, 2, '#b07c45');
  px(sx - 6, sy - 22, 12, 8, '#d8cf9a');
  px(sx - 6, sy - 22, 12, 2, '#e9e2b8');
  for (var i = -5; i <= 5; i += 2) px(sx + i, sy - 21, 1, 6, 'rgba(120,110,70,.5)');
  /* suya uzanan ağ */
  var ex = s.face === 'n' ? s.x + 0.2 : s.x - 3.0, ey = s.face === 'n' ? s.y - 3.0 : s.y + 0.2;
  ctx.strokeStyle = 'rgba(232,226,184,.8)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 22);
  ctx.quadraticCurveTo(R((sx + pX(ex, ey)) / 2), R(pY((s.x + ex) / 2, (s.y + ey) / 2, 34 + Math.sin(gameT) * 3)),
    R(pX(ex, ey)), R(pY(ex, ey, 2)));
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.45;
  isoQuad(ex - 0.7, ey - 0.7, 1.4, 1.4, 0, '#dff0f8');
  ctx.restore();
  /* sandık */
  isoBox(s.x - 0.6, s.y + 0.45, 1.2, 0.9, 0, 5, '#6b4425', '#573620', '#7c4f2b');
  drawStack(s.x, s.y + 0.9, s.stock, 5, 3.2);
  labelAt(s.x, s.y + 1.75, 6, T('stNet') + ' ' + s.stock.length, '#bfe9ff', '🎣' + s.stock.length);
}
function drawTable(tb) {
  isoBox(tb.x - 0.7, tb.y - 0.5, 1.4, 1.0, 0, 11, '#a9743f', '#6f4526', '#85552f');
  var sx = R(pX(tb.x, tb.y)), sy = R(pY(tb.x, tb.y, 11));
  px(sx - 6, sy - 3, 12, 4, '#d9c39c');
  var chop = tb.cur ? (Math.sin(gameT * (tb.worker ? 13 : 9)) > 0 ? 1 : 0) : 0;
  px(sx + 4, sy - 8 - chop * 3, 1, 5, '#5a4630');
  px(sx + 3, sy - 12 - chop * 3, 3, 4, '#dfe8ee');
  if (tb.cur) {
    drawItem(tb.cur, sx - 3, sy - 4);
    var pr = clamp(tb.t / FISH[tb.cur.f].cut, 0, 1);
    px(sx - 8, sy - 16, 16, 3, '#0a1a27');
    px(sx - 8, sy - 16, R(16 * pr), 3, '#5fd37a');
  }
  drawStack(tb.x - 0.25, tb.y + 0.1, tb.inn, 11, 3.2);
  labelAt(tb.x, tb.y + 1.1, 8, T('stCut') + (tb.worker ? ' *' : ''), '#ffe6bf', '');
  isoQuad(tb.mat.x - 0.6, tb.mat.y - 0.5, 1.2, 1.0, 0.4, '#efe6d2');
  isoQuad(tb.mat.x - 0.45, tb.mat.y - 0.36, 0.9, 0.72, 0.6, '#f7f1e2');
  drawStack(tb.mat.x, tb.mat.y, tb.mat.items, 2, 3.2);
}
function drawSmoker() {
  var s = smoker;
  isoBox(s.x - 0.75, s.y - 0.6, 1.5, 1.2, 0, 13, '#7a4f33', '#4f3120', '#603c26');
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 13));
  px(sx - 4, sy - 12, 8, 12, '#5b3a26');
  px(sx - 4, sy - 12, 4, 12, '#6f4830');
  px(sx - 3, sy - 2, 6, 2, 'rgba(255,150,60,' + (0.6 + Math.sin(gameT * 9) * 0.25) + ')');
  if (s.cur) {
    for (var i = 0; i < 3; i++) {
      var t = (gameT * 0.5 + i * 0.33) % 1;
      ctx.globalAlpha = (1 - t) * 0.4;
      px(sx - 2 + Math.sin(t * 5 + i) * 4, sy - 14 - t * 22, 3 + t * 3, 2 + t * 2, '#e8e2d8');
    }
    ctx.globalAlpha = 1;
    var pr = clamp(s.t / FUME_TIME, 0, 1);
    px(sx - 8, sy - 20, 16, 3, '#0a1a27');
    px(sx - 8, sy - 20, R(16 * pr), 3, '#ffc94a');
  }
  drawStack(s.x + 0.4, s.y + 0.3, s.inn, 13, 3.2);
  labelAt(s.x, s.y + 1.4, 10, T('stSmoke'), '#ffd3a0', '');
  isoQuad(s.mat.x - 0.6, s.mat.y - 0.5, 1.2, 1.0, 0.4, '#e6d5b8');
  drawStack(s.mat.x, s.mat.y, s.mat.items, 2, 3.2);
}
function drawCounter(c) {
  isoBox(c.x - 0.55, c.y - 1.0, 1.1, 2.0, 0, 12, '#c08a52', '#7d4f2b', '#95602f');
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  /* tente (kırmızı-beyaz) */
  for (var i = 0; i < 6; i++) {
    var yy = sy - 22 + i * 1;
    px(sx - 12 + i, yy, 3, 2, i % 2 ? '#e30a17' : '#f4f0e4');
    px(sx + 9 - i, yy, 3, 2, i % 2 ? '#f4f0e4' : '#e30a17');
  }
  px(sx - 13, sy - 23, 26, 2, '#8d5f33');
  px(sx - 13, sy - 23, 2, 23, '#8d5f33'); px(sx + 11, sy - 23, 2, 23, '#8d5f33');
  drawStack(c.x, c.y, c.buffer, 12, 3.2);
  labelAt(c.x, c.y - 1.45, 10, T('stStall') + ' ' + c.buffer.length + '/' + counterMax(c), '#ffd9a8', '🐟' + c.buffer.length);
  var tr = c.tray;
  isoQuad(tr.x - 0.6, tr.y - 0.5, 1.2, 1.0, 0.4, '#2e7d43');
  isoQuad(tr.x - 0.45, tr.y - 0.36, 0.9, 0.72, 0.6, '#3f9e56');
  drawStack(tr.x, tr.y, tr.items, 2, 3.2);
  if (tr.items.length) labelAt(tr.x, tr.y + 0.9, 4, T('stTake'), '#9df5b0', '$');
}
function drawSafe() {
  var pop = safe.pop * 2;
  isoBox(safe.x - 0.5, safe.y - 0.5, 1.0, 1.0, 0, 10 + pop, '#3f8f56', '#22603a', '#2d7546');
  var sx = R(pX(safe.x, safe.y)), sy = R(pY(safe.x, safe.y, 10 + pop));
  px(sx - 5, sy - 2, 10, 2, '#25693c');
  uiText(safe.x, safe.y, 10 + pop, '₺', '#e9ffe9', 13, 1, 0, 8);
  labelAt(safe.x, safe.y, 30 + pop, T('stSafe'), '#b7f7c7', '');
}

/* ---------- yapılar ---------- */
function drawBuilding(s) {
  var id = s.b, sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  if (id === 'kulube') {
    isoBox(s.x - 0.6, s.y - 0.6, 1.2, 1.2, 0, 12, '#c9a15e', '#7d5228', '#8f6030');
    px(sx - 8, sy - 22, 16, 4, '#b8442e'); px(sx - 6, sy - 24, 12, 3, '#c9533b');
    px(sx - 3, sy - 16, 5, 6, '#5d3c1c');
  } else if (id === 'cay') {
    isoBox(s.x - 0.45, s.y - 0.45, 0.9, 0.9, 0, 7, '#8d5f33', '#5d3c1c', '#6f4830');
    px(sx - 4, sy - 15, 8, 8, '#c0c6cc'); px(sx - 5, sy - 17, 10, 2, '#9aa2aa');
    px(sx + 3, sy - 13, 3, 3, '#c0c6cc');
    ctx.globalAlpha = 0.35 + Math.sin(gameT * 3) * 0.1;
    px(sx - 1, sy - 22, 2, 5, '#ffffff'); ctx.globalAlpha = 1;
    px(sx - 6, sy - 8, 3, 3, '#e30a17');
  } else if (id === 'tezgah') {
    /* ek tezgâh gövdesi (counter ayrıca eklenir) */
    px(sx - 9, sy - 16, 18, 3, '#8d5f33');
  } else if (id === 'pano') {
    px(sx - 2, sy - 12, 2, 12, '#5d3c1c'); px(sx + 1, sy - 12, 2, 12, '#5d3c1c');
    px(sx - 12, sy - 26, 25, 15, '#0a1a27');
    px(sx - 11, sy - 25, 23, 13, '#e5e0d0');
    px(sx - 11, sy - 25, 23, 4, '#e30a17');
    uiText(s.x, s.y, 0, lang === 'tr' ? 'TAZE BALIK' : 'FRESH FISH', '#1a4a6b', 10, 1, 0, -18, 'rgba(240,235,220,.9)');
  } else if (id === 'depo') {
    isoBox(s.x - 0.65, s.y - 0.65, 1.3, 1.3, 0, 11, '#9aa2aa', '#5d666e', '#6e767e');
    px(sx - 9, sy - 20, 18, 4, '#7d868e');
    px(sx - 5, sy - 15, 10, 6, '#4a5258');
    px(sx - 5, sy - 15, 10, 1, '#c9d0d6');
  } else if (id === 'vinc') {
    px(sx - 1, sy - 30, 3, 30, '#d8a52c');
    px(sx - 12, sy - 32, 24, 3, '#d8a52c');
    px(sx + 9, sy - 29, 1, 9, '#8a8f95');
    px(sx + 7, sy - 20, 5, 4, '#5d3c1c');
    px(sx - 6, sy - 4, 12, 4, '#3c4650');
  }
}
function drawSlot(s) {
  if (s.b) { drawBuilding(s); return; }
  var pulse = Math.sin(gameT * 3) > 0 ? 1 : 0;
  isoQuad(s.x - 0.6, s.y - 0.5, 1.2, 1.0, 0.3, 'rgba(20,41,60,.45)');
  ctx.save(); ctx.setLineDash([3, 3]); ctx.lineDashOffset = -gameT * 8;
  ctx.strokeStyle = pulse ? '#ffc94a' : '#c9a15e'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(s.x - 0.6, s.y - 0.5)), R(pY(s.x - 0.6, s.y - 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x + 0.6, s.y - 0.5)), R(pY(s.x + 0.6, s.y - 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x + 0.6, s.y + 0.5)), R(pY(s.x + 0.6, s.y + 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x - 0.6, s.y + 0.5)), R(pY(s.x - 0.6, s.y + 0.5, 0.4)));
  ctx.closePath(); ctx.stroke(); ctx.restore();
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  uiText(s.x, s.y, 8 + pulse, '🔨', '#ffc94a', 15);
}

/* ---------- büyük proje aşamaları ---------- */
function drawProject() {
  var p = project, st = p.stage;
  var x = p.x - p.w / 2, y = p.y - p.h / 2;
  if (st === 0) {
    ctx.save(); ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(x, y)), R(pY(x, y, 0))); ctx.lineTo(R(pX(x + p.w, y)), R(pY(x + p.w, y, 0)));
    ctx.lineTo(R(pX(x + p.w, y + p.h)), R(pY(x + p.w, y + p.h, 0))); ctx.lineTo(R(pX(x, y + p.h)), R(pY(x, y + p.h, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    labelAt(p.x, p.y + p.h / 2 + 0.3, 6, T('stProject'), '#ffc94a', '');
    return;
  }
  /* temel */
  isoQuad(x, y, p.w, p.h, 0.6, '#9a927f');
  var cx = R(pX(p.x, p.y)), cy = R(pY(p.x, p.y, 0));
  if (st >= 1) {
    for (var i = 0; i <= 2; i++) for (var j = 0; j <= 2; j++) {
      var bx = R(pX(x + i * p.w / 2, y + j * p.h / 2)), by = R(pY(x + i * p.w / 2, y + j * p.h / 2, 0));
      px(bx - 1, by - 5, 3, 5, '#6b5334');
    }
  }
  if (st >= 2) { /* kolonlar */
    var cols = [[x + 0.2, y + 0.2], [x + p.w - 0.2, y + 0.2], [x + 0.2, y + p.h - 0.2], [x + p.w - 0.2, y + p.h - 0.2]];
    for (var c = 0; c < cols.length; c++) {
      var sx2 = R(pX(cols[c][0], cols[c][1])), sy2 = R(pY(cols[c][0], cols[c][1], 0));
      px(sx2 - 1, sy2 - 26, 3, 26, '#c9c3b2');
    }
    isoQuad(x + 0.1, y + 0.1, p.w - 0.2, p.h - 0.2, 26, 'rgba(200,195,180,.35)');
  }
  if (st >= 3) { /* duvar + çatı */
    isoBox(x + 0.15, y + 0.15, p.w - 0.3, p.h - 0.3, 0, 24, '#e6dcc4', '#bfae8c', '#d2c1a0');
    var rx = R(pX(p.x, p.y)), ry = R(pY(p.x, p.y, 24));
    for (var r = 0; r < 8; r++) px(rx - 26 + r * 3, ry - 6 - r, 26 - r * 2, 3, r % 2 ? '#b8442e' : '#c9533b');
    px(rx - 28, ry - 6, 56, 3, '#8d3423');
  }
  if (st >= 4) { /* donatım: tabela + ışık */
    var lx = R(pX(p.x, p.y + p.h / 2)), ly = R(pY(p.x, p.y + p.h / 2, 26));
    px(lx - 20, ly - 10, 40, 9, '#123449');
    uiText(p.x, p.y + p.h / 2, 30, lang === 'tr' ? 'BALIK HALİ' : 'FISH HALL', '#ffc94a', 11);
    px(lx - 22, ly + 2, 2, 8, '#3c4650'); px(lx + 20, ly + 2, 2, 8, '#3c4650');
  }
  if (st >= 5) { /* açılış: bayraklar */
    for (var f = 0; f < 3; f++) {
      var fx2 = R(pX(p.x - 0.8 + f * 0.8, p.y - p.h / 2)), fy2 = R(pY(p.x - 0.8 + f * 0.8, p.y - p.h / 2, 30));
      px(fx2, fy2 - 8, 1, 8, '#6b5334');
      px(fx2 + 1, fy2 - 8, 5, 3, f % 2 ? '#e30a17' : '#ffc94a');
    }
  } else {
    /* şantiye vinci */
    var kx = R(pX(x + p.w, y)), ky = R(pY(x + p.w, y, 0));
    px(kx - 1, ky - 34, 2, 34, '#d8a52c');
    px(kx - 10, ky - 36, 20, 2, '#d8a52c');
    px(kx + 6, ky - 34, 1, 8, '#8a8f95');
    var pr = projPct();
    px(cx - 14, cy - 44, 28, 4, '#0a1a27');
    px(cx - 13, cy - 43, R(26 * pr), 2, '#5fd37a');
    uiText(p.x, p.y, 46, pct(Math.round(pr * 100)), '#ffc94a', 12);
  }
  labelAt(p.x, p.y + p.h / 2 + 0.3, 4, UP(NM(p.n)), '#ffc94a', '');
}

/* ---------- kozmetik ---------- */
function drawDecor(d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0));
  if (d.id === 'bayrak') {
    px(sx - 1, sy - 34, 2, 34, '#d8d2c4');
    var wv = Math.sin(gameT * 2) * 1;
    px(sx + 1, sy - 34, 14, 9, '#e30a17');
    px(sx + 5 + wv, sy - 31, 3, 3, '#ffffff');
    px(sx + 8 + wv, sy - 32, 2, 1, '#ffffff'); px(sx + 8 + wv, sy - 28, 2, 1, '#ffffff');
    px(sx + 6 + wv, sy - 30, 3, 1, '#e30a17');
  } else if (d.id === 'tekne') {
    drawBoat({ x: d.x, y: d.y - 1.6, r: 1 });
  } else if (d.id === 'bank') {
    px(sx - 8, sy - 6, 16, 2, '#a9743f'); px(sx - 8, sy - 10, 16, 2, '#a9743f');
    px(sx - 7, sy - 6, 2, 6, '#6f4526'); px(sx + 5, sy - 6, 2, 6, '#6f4526');
  } else if (d.id === 'simit') {
    px(sx - 9, sy - 12, 18, 8, '#c9a15e'); px(sx - 9, sy - 14, 18, 2, '#e30a17');
    px(sx - 7, sy - 4, 2, 4, '#5d3c1c'); px(sx + 5, sy - 4, 2, 4, '#5d3c1c');
    for (var i = 0; i < 3; i++) { px(sx - 6 + i * 5, sy - 11, 4, 4, '#c8802f'); px(sx - 5 + i * 5, sy - 10, 2, 2, '#c9a15e'); }
  } else if (d.id === 'lamba') { drawLamp(d.x, d.y); }
  else if (d.id === 'cicek') {
    px(sx - 5, sy - 6, 10, 6, '#b8642e'); px(sx - 5, sy - 7, 10, 2, '#d1793d');
    for (var f = 0; f < 6; f++) px(sx - 6 + (f * 3) % 12, sy - 14 + (f % 3) * 3, 3, 3, f % 2 ? '#d94a8c' : '#e0679e');
    px(sx - 2, sy - 10, 2, 5, '#4a7a3a');
  } else if (d.id === 'caymasa') {
    px(sx - 7, sy - 8, 14, 2, '#c9a15e'); px(sx - 6, sy - 6, 2, 6, '#8d5f33'); px(sx + 4, sy - 6, 2, 6, '#8d5f33');
    px(sx - 4, sy - 12, 3, 4, '#e8c9a0'); px(sx + 2, sy - 11, 3, 3, '#e8c9a0');
    px(sx - 3, sy - 11, 1, 2, '#c94a1a'); px(sx + 3, sy - 10, 1, 1, '#c94a1a');
  } else if (d.id === 'heykel') {
    px(sx - 7, sy - 6, 14, 6, '#9a927f'); px(sx - 5, sy - 9, 10, 3, '#b3aa93');
    px(sx - 6, sy - 22, 12, 8, '#7fa9bd'); px(sx - 8, sy - 20, 3, 5, '#6d95a8');
    px(sx + 5, sy - 24, 4, 4, '#7fa9bd'); dot(sx - 4, sy - 19, '#16222b');
  }
}

/* =========================================================
   ÇİZİM — yükseltme alanları + kartlar
   ========================================================= */
function padInfo(p) {
  if (p.kind === 'cap') return { t: T('upCap'), e: T('upCapE') };
  if (p.kind === 'spd') return { t: T('upSpd'), e: T('upSpdE') };
  if (p.kind === 'price') return { t: T('upPrice'), e: T('upPriceE') };
  if (p.kind === 'area') return { t: UP(NM(AREAS[p.target].n)), e: T('openArea') };
  if (p.kind === 'arealv') return { t: UP(NM(AREAS[p.area].n)), e: T('upArea') + ' ' + T('level') + AREAS[p.area].lvl + '→' + (AREAS[p.area].lvl + 1) };
  if (p.kind === 'decor') return { t: UP(NM(DECOR[p.decor].n)), e: T('stDecor') };
  return { t: UP(NM(ROLES[p.role].n)), e: NM(ROLES[p.role].d) + ' ' + money(ROLES[p.role].wage) + perMin() };
}
function drawPad(p) {
  if (AREAS[p.z].locked) return;
  var sx = R(pX(p.x, p.y)), sy = R(pY(p.x, p.y, 0));
  if (padDone(p)) return;
  var pulse = Math.sin(gameT * 3) > 0 ? 1 : 0;
  var blocked = padBlocked(p);
  isoQuad(p.x - 0.62, p.y - 0.5, 1.24, 1.0, 0.3, 'rgba(16,34,50,.42)');
  var price = padPrice(p), frac = price > 0 ? p.paid / price : 0;
  if (frac > 0) isoQuad(p.x - 0.62, p.y - 0.5, 1.24, Math.max(0.06, 1.0 * frac), 0.4, 'rgba(95,211,122,.7)');
  ctx.save(); ctx.setLineDash([3, 3]); ctx.lineDashOffset = -gameT * 10;
  ctx.strokeStyle = blocked ? '#7d8a94' : (pulse ? '#ffc94a' : '#c9a15e'); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(p.x - 0.62, p.y - 0.5)), R(pY(p.x - 0.62, p.y - 0.5, 0.45)));
  ctx.lineTo(R(pX(p.x + 0.62, p.y - 0.5)), R(pY(p.x + 0.62, p.y - 0.5, 0.45)));
  ctx.lineTo(R(pX(p.x + 0.62, p.y + 0.5)), R(pY(p.x + 0.62, p.y + 0.5, 0.45)));
  ctx.lineTo(R(pX(p.x - 0.62, p.y + 0.5)), R(pY(p.x - 0.62, p.y + 0.5, 0.45)));
  ctx.closePath(); ctx.stroke(); ctx.restore();
  uiText(p.x, p.y, 7 + pulse, p.icon, '#fff', 17);
}
function drawArrow(tg) {
  var sx = R(pX(tg.x, tg.y)), sy = R(pY(tg.x, tg.y, 30 + (Math.sin(gameT * 4) > 0 ? 2 : 0)));
  px(sx - 3, sy - 8, 7, 4, '#ffc94a');
  px(sx - 2, sy - 4, 5, 2, '#ffc94a');
  px(sx - 1, sy - 2, 3, 2, '#ffc94a');
  px(sx, sy, 1, 1, '#ffc94a');
}
function drawFlyers() {
  for (var i = 0; i < flyers.length; i++) {
    var f = flyers[i], t = clamp(f.t / f.d, 0, 1);
    var x = lerp(f.x0, f.x1, t), y = lerp(f.y0, f.y1, t);
    var z = lerp(f.z0, f.z1, t) + Math.sin(t * Math.PI) * f.h;
    drawItem(f.it, R(pX(x, y)), R(pY(x, y, z)));
  }
}
function drawFloats() {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i], t = f.t / 0.85;
    uiText(f.x, f.y, 26 + t * 20, f.txt, f.col, 14, 1 - t * t);
  }
}
function drawPuffs() {
  for (var i = 0; i < puffs.length; i++) {
    var p = puffs[i];
    ctx.globalAlpha = clamp(1 - p.t / 0.65, 0, 1) * 0.8;
    px(pX(p.x, p.y), pY(p.x, p.y, p.z), 2, 2, p.col);
  }
  ctx.globalAlpha = 1;
}

/* =========================================================
   SAHNE
   ========================================================= */
function tutorialTarget() {
  if (S.tut >= TUTOK.length) return null;
  var t = S.tut;
  if (t === 0 || t === 1) return { x: spots[0].x, y: spots[0].y + 0.9 };
  if (t === 2) return { x: tables[0].x, y: tables[0].y };
  if (t === 3) return hasCarry(player, isGoods) ? { x: counters[0].x, y: counters[0].y } : { x: tables[0].mat.x, y: tables[0].mat.y };
  if (t === 4) return hasCarry(player, isMoney) ? { x: safe.x, y: safe.y } : { x: counters[0].tray.x, y: counters[0].tray.y };
  return { x: PADS[0].x, y: PADS[0].y };
}
function playerOccluded() {
  var pxp = pX(player.x, player.y), pyp = pY(player.x, player.y, 0), d = player.x + player.y + 0.3, i;
  var occ = [];
  if (!AREAS[project.z].locked && project.stage >= 2) occ.push({ x: project.x, y: project.y, w: 60, h: 46 });
  for (i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked) occ.push({ x: counters[i].x, y: counters[i].y, w: 30, h: 30 });
  for (i = 0; i < SLOTS.length; i++) if (SLOTS[i].b && slotActive(SLOTS[i])) occ.push({ x: SLOTS[i].x, y: SLOTS[i].y, w: 26, h: 28 });
  if (!AREAS[smoker.z].locked) occ.push({ x: smoker.x, y: smoker.y, w: 26, h: 26 });
  for (i = 0; i < occ.length; i++) {
    var o = occ[i];
    if (o.x + o.y <= d) continue;
    var ox = pX(o.x, o.y), oy = pY(o.x, o.y, 0);
    if (Math.abs(ox - pxp) < o.w / 2 && pyp > oy - o.h && pyp < oy + 6) return true;
  }
  return false;
}
function render() {
  drawSea();
  drawVillage();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var shk = camShake > 0 ? R(rnd(-camShake, camShake) * 0.3) : 0;
  camOX = R(W / 2 - camX) + shk; camOY = R(H * 0.46 - camY);
  ctx.translate(camOX, camOY);

  drawShoal(); drawWaves();
  for (var b = 0; b < boats.length; b++) drawBoat(boats[b]);
  drawLand();
  for (var a = 0; a < AREAS.length; a++) drawArea(AREAS[a], a);

  var list = [], i;
  function push(d, fn) { list.push({ d: d, f: fn }); }

  for (i = 0; i < AREAS.length; i++) (function (ar) {
    if (ar.locked) { push((ar.x0 + ar.x1) / 2 + (ar.y0 + ar.y1) / 2, function () { drawSign(ar); }); return; }
    if (ar.lvl >= 2) push(ar.x0 + ar.y1 - 0.2, function () { drawSign(ar); });
    if (ar.lvl >= 3) {
      push(ar.x0 + 0.5 + ar.y1 - 0.5, function () { drawLamp(ar.x0 + 0.5, ar.y1 - 0.5); });
      push(ar.x1 - 0.5 + ar.y0 + 0.5, function () { drawLamp(ar.x1 - 0.5, ar.y0 + 0.5); });
    }
  })(AREAS[i]);
  for (i = 0; i < scenery.length; i++) (function (d) { push(d.x + d.y - 0.1, function () { drawScenery(d); }); })(scenery[i]);
  for (i = 0; i < PADS.length; i++) (function (p) { push(p.x + p.y - 0.9, function () { drawPad(p); }); })(PADS[i]);
  for (i = 0; i < SLOTS.length; i++) (function (s) {
    if (!slotActive(s)) return; push(s.x + s.y, function () { drawSlot(s); });
  })(SLOTS[i]);
  for (i = 0; i < DECOR.length; i++) (function (d) {
    if (!d.got || AREAS[d.z].locked) return; push(d.x + d.y, function () { drawDecor(d); });
  })(DECOR[i]);
  if (!AREAS[project.z].locked) push(project.x + project.y, drawProject);
  for (i = 0; i < spots.length; i++) (function (s) {
    if (AREAS[s.z].locked) return; push(s.x + s.y, function () { drawSpot(s); });
  })(spots[i]);
  for (i = 0; i < tables.length; i++) (function (t) {
    if (AREAS[t.z].locked) return; push(t.x + t.y, function () { drawTable(t); });
  })(tables[i]);
  if (!AREAS[smoker.z].locked) push(smoker.x + smoker.y, drawSmoker);
  for (i = 0; i < counters.length; i++) (function (c) {
    if (AREAS[c.z].locked) return; push(c.x + c.y, function () { drawCounter(c); });
  })(counters[i]);
  push(safe.x + safe.y, drawSafe);

  var maxY = maxOpenY(), lv = AREAS[0].lvl;
  for (i = 0; i < maxY; i += 0.75) (function (yy) {
    var gap = false;
    for (var k = 0; k < counters.length; k++) {
      if (AREAS[counters[k].z].locked) continue;
      if (Math.abs(yy - counters[k].y) < 1.3) gap = true;
    }
    var az = yy < 6 ? 0 : (yy < 12 ? 1 : 2);
    if (!gap) push(9.95 + yy, function () { fencePost(9.95, yy, AREAS[az].lvl); });
  })(i);
  for (i = 0; i <= 9.95; i += 0.75) (function (xx) {
    push(xx + maxY - 0.05, function () { fencePost(xx, maxY - 0.05, lv); });
  })(i);

  for (i = 0; i < customers.length; i++) (function (cu) { push(cu.x + cu.y + 0.2, function () { drawCustomer(cu); }); })(customers[i]);
  for (i = 0; i < workers.length; i++) (function (w) {
    var col = w.role === 'hamal' ? '#4f7fae' : w.role === 'filetocu' ? '#5f8f6a' : w.role === 'tezgahtar' ? '#b8624a' : '#7a6ba8';
    push(w.x + w.y + 0.15, function () {
      drawPerson(w, { coat: col, coat2: col, skin: SKIN[1], hair: HAIR[0], face: w.face, bag: true, cap: '#2b3a45', must: true });
      uiText(w.x, w.y, 26, ROLES[w.role].icon, '#fff', 11);
    });
  })(workers[i]);
  push(player.x + player.y + 0.25, function () {
    var sx = R(pX(player.x, player.y)), sy = R(pY(player.x, player.y, 0));
    ctx.save(); ctx.globalAlpha = 0.55 + (Math.sin(gameT * 4) > 0 ? 0.15 : 0);
    ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx, sy - 4); ctx.lineTo(sx + 8, sy); ctx.lineTo(sx, sy + 4);
    ctx.closePath(); ctx.stroke(); ctx.restore();
    drawPerson(player, { coat: '#1f4e6b', coat2: '#2a6688', skin: SKIN[0], hair: HAIR[0], face: player.face, bag: true, cap: '#123449', must: true });
  });

  list.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < list.length; i++) list[i].f();

  if (S.started && playerOccluded()) {
    ctx.save(); ctx.globalAlpha = 0.45;
    drawPerson(player, { coat: '#1f4e6b', coat2: '#2a6688', skin: SKIN[0], hair: HAIR[0], face: player.face, bag: true, cap: '#123449', must: true });
    ctx.restore();
    var gx = R(pX(player.x, player.y)), gy = R(pY(player.x, player.y, 26));
    px(gx - 2, gy, 5, 2, '#ffc94a'); px(gx - 1, gy + 2, 3, 2, '#ffc94a'); px(gx, gy + 4, 1, 2, '#ffc94a');
  }
  for (i = 0; i < gulls.length; i++) drawGull(gulls[i]);
  drawFlyers(); drawPuffs(); drawFloats();
  if (S.started) { var tg = tutorialTarget(); if (tg) drawArrow(tg); }

  renderUI();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stick.active) {
    var jx = R(stick.bx / PXS), jy = R(stick.by / PXS);
    ctx.globalAlpha = 0.25;
    px(jx - 14, jy - 2, 28, 4, '#fff'); px(jx - 2, jy - 14, 4, 28, '#fff');
    ctx.globalAlpha = 0.5;
    px(jx - 4 + R(stick.dx * 12), jy - 4 + R(stick.dy * 12), 8, 8, '#fff');
    ctx.globalAlpha = 1;
  }
}

/* =========================================================
   ARAYÜZ (DOM)
   ========================================================= */
var el = {};
['money', 'carry', 'carryIcon', 'rep', 'repfill', 'eventChip', 'eventIcon', 'eventName', 'eventT',
 'objLbl', 'objText', 'queueHint', 'toast', 'sheet', 'sheetTitle', 'sheetSub', 'sheetBody',
 'hMoney', 'hCarry', 'hRep', 'startTag', 'startList', 'playBtn', 'setBtn', 'setTitle', 'setLang',
 'setSound', 'setZoom', 'setClose', 'resetBtn', 'closeMenu', 'menuSet', 'langLbl', 'tabBody',
 'startScreen', 'settingsScreen', 'menuScreen', 'menuBtn', 'sheetClose'].forEach(function (id) {
  el[id] = document.getElementById(id);
});
var toastT = 0;
function toast(msg) { el.toast.textContent = msg; el.toast.classList.add('on'); toastT = 2.6; }

function applyLang() {
  document.documentElement.lang = lang;
  el.hMoney.textContent = T('money'); el.hCarry.textContent = T('carry'); el.hRep.textContent = T('rep');
  el.startTag.textContent = T('tag');
  el.startList.innerHTML = ['intro1', 'intro2', 'intro3', 'intro4', 'intro5'].map(function (k) {
    return '<li>' + T(k) + '</li>';
  }).join('') + '<li style="opacity:.7">' + T('ctrl') + '</li>';
  el.playBtn.textContent = T('play'); el.setBtn.textContent = T('settings');
  el.setTitle.textContent = T('settings'); el.setLang.textContent = T('langLbl');
  el.setSound.textContent = T('soundLbl'); el.setZoom.textContent = T('zoomLbl');
  el.setClose.textContent = T('ok'); el.resetBtn.textContent = T('reset');
  el.closeMenu.textContent = T('cont'); el.menuSet.textContent = T('settings');
  el.langLbl.textContent = T('langLbl');
  var tabs = document.querySelectorAll('#menuTabs .tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].textContent = T('tabs')[i];
  Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button'), function (b) {
    b.classList.toggle('on', b.dataset.l === lang);
  });
  if (!el.menuScreen.classList.contains('hidden')) renderTab();
  if (sheet.kind) renderSheet();
}

function urgentOrder() {
  var best = null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    for (var k = 0; k < c.slots.length; k++) {
      var cu = c.slots[k];
      if (cu && cu.state === 'wait' && (!best || cu.pat < best.pat)) best = cu;
    }
  } return best;
}
function waitingCount() {
  var n = 0;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    for (var k = 0; k < c.slots.length; k++) if (c.slots[k] && c.slots[k].state === 'wait') n++;
  } return n;
}
function carryIcon() {
  var n = { fish: 0, fileto: 0, fume: 0, money: 0 };
  for (var i = 0; i < player.carry.length; i++) n[player.carry[i].k]++;
  if (!player.carry.length) return '🧺';
  var top = 'fish';
  for (var k in n) if (n[k] > n[top]) top = k;
  return top === 'fish' ? '🐟' : top === 'fileto' ? '🍥' : top === 'fume' ? '🔥' : '💰';
}
var pcEl = {};
['padCard', 'pcIco', 'pcTitle', 'pcEff', 'pcPrice', 'pcBarFill'].forEach(function (id) { pcEl[id] = document.getElementById(id); });
function syncPadCard() {
  var p = nearestPad;
  if (!p || sheet.kind) { pcEl.padCard.classList.add('hidden'); return; }
  pcEl.padCard.classList.remove('hidden');
  var info = padInfo(p), blocked = padBlocked(p), price = padPrice(p);
  pcEl.pcIco.textContent = p.icon;
  pcEl.pcTitle.textContent = info.t;
  pcEl.pcEff.textContent = info.e;
  pcEl.padCard.classList.toggle('no', blocked);
  if (blocked) {
    pcEl.pcPrice.textContent = p.kind === 'hire' ? T('needStaff') : T('needRep', { n: AREAS[p.target].rep, c: S.rep });
  } else {
    pcEl.pcPrice.textContent = money(Math.max(0, price - p.paid));
  }
  pcEl.pcBarFill.style.width = clamp((p.paid / price) * 100, 0, 100) + '%';
}
function syncHUD(dt) {
  syncPadCard();
  el.money.textContent = Math.round(S.cash).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');
  el.carry.textContent = carryW(player) + '/' + capacity();
  el.carryIcon.textContent = carryIcon();
  el.rep.textContent = S.rep;
  var lvl = repLevel(), cur = REP_LEVELS[lvl - 1].need, nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl].need : cur + 1;
  el.repfill.style.width = clamp((S.rep - cur) / (nxt - cur) * 100, 0, 100) + '%';
  if (event) {
    el.eventChip.classList.remove('hidden');
    el.eventIcon.textContent = event.icon;
    el.eventName.textContent = T(event.name);
    el.eventT.textContent = Math.ceil(eventT) + 's';
  } else el.eventChip.classList.add('hidden');
  if (S.tut < TUTOK.length) {
    el.objLbl.textContent = T('goal') + ' ' + (S.tut + 1) + '/' + TUTOK.length;
    el.objText.textContent = T('tut')[S.tut];
  } else {
    var o = urgentOrder();
    if (o) {
      el.objLbl.textContent = T('orderOf', { n: UP(NM(o.type.n)) });
      el.objText.textContent = prodName(o.ord.k, o.ord.f) + ' x' + (o.ord.need - o.ord.got) + ' - ' + Math.ceil(o.pat) + 's';
    } else {
      el.objLbl.textContent = UP(repTitle());
      el.objText.textContent = T('idleGoal');
    }
  }
  var w = waitingCount();
  if (w >= 4) { el.queueHint.classList.remove('hidden'); el.queueHint.textContent = T('waiting', { n: w }); }
  else el.queueHint.classList.add('hidden');
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('on'); }
}

/* ---------- alt panel ---------- */
function openSheet(kind, target) {
  sheet.kind = kind; sheet.target = target;
  el.sheet.classList.add('on'); document.body.classList.add('sheet'); renderSheet();
}
function closeSheet() { sheet.kind = null; sheet.target = null; el.sheet.classList.remove('on'); document.body.classList.remove('sheet'); }
function renderSheet() {
  if (!sheet.kind) return;
  if (sheet.kind === 'build') {
    var s = sheet.target;
    el.sheetTitle.textContent = T('sheetBuild');
    el.sheetSub.textContent = T('sheetBuildSub');
    var opts = BUILDINGS.filter(function (b) { return s.cats.indexOf(b.cat) >= 0; });
    el.sheetBody.innerHTML = '<div class="cards">' + opts.map(function (b) {
      var owned = s.b === b.id;
      var afford = S.cash + (s.b ? Math.round(bdef(s.b).cost * 0.6) : 0) >= b.cost;
      return '<div class="bcard' + (owned ? ' owned' : (afford ? '' : ' no')) + '" data-b="' + b.id + '">' +
        '<span class="ic">' + b.icon + '</span><b>' + NM(b.n) + '</b>' + NM(b.d) +
        '<span class="pr">' + (owned ? T('owned') : money(b.cost)) + '</span></div>';
    }).join('') + '</div>';
    Array.prototype.forEach.call(el.sheetBody.querySelectorAll('.bcard'), function (c) {
      c.onclick = function () { buyBuilding(s, c.dataset.b); };
    });
  } else {
    var p = project, pc = projPct();
    el.sheetTitle.textContent = UP(NM(p.n));
    el.sheetSub.textContent = T('stage') + ' ' + p.stage + '/5 - ' + money(p.inv) + ' / ' + money(p.total);
    var nextTh = p.stages[Math.min(p.stage, p.stages.length - 1)] * p.total;
    el.sheetBody.innerHTML =
      '<div class="pbar"><i style="width:' + Math.round(pc * 100) + '%"></i></div>' +
      '<div class="sub">' + pct(Math.round(pc * 100)) + ' - ' + T('mNext') + ': ' + money(Math.max(0, nextTh - p.inv)) + '</div>' +
      '<div class="prow">' +
      '<button class="pbtn" data-a="1000">+' + money(1000) + '</button>' +
      '<button class="pbtn" data-a="10000">+' + money(10000) + '</button>' +
      '<button class="pbtn" data-a="q">' + T('pct25') + '</button>' +
      '<button class="pbtn" data-a="max">' + T('maxInvest') + '</button></div>';
    Array.prototype.forEach.call(el.sheetBody.querySelectorAll('.pbtn'), function (b) {
      b.onclick = function () {
        var a = b.dataset.a;
        investProject(a === 'max' ? S.cash : a === 'q' ? S.cash * 0.25 : parseInt(a, 10));
      };
    });
  }
}
el.sheetClose.onclick = closeSheet;

/* ---------- menü ---------- */
var curTab = 'liman';
function row(ic, title, sub, val, val2) {
  return '<div class="row"><div class="ic">' + ic + '</div><div class="tx">' + title +
    (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="vl">' + (val || '') +
    (val2 ? '<small>' + val2 + '</small>' : '') + '</div></div>';
}
function renderTab() {
  var h = '', i;
  if (curTab === 'liman') {
    var lvl = repLevel(), nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl] : null;
    h += row('⭐', repTitle(), nxt ? (T('mNext') + ': ' + NM(nxt.t) + ' - ' + nxt.need) : T('mMax'), S.rep + '*');
    h += row('💰', T('money'), T('mWage') + ': ' + money(wageTotal()) + perMin(), money(S.cash));
    for (i = 0; i < AREAS.length; i++) {
      var a = AREAS[i];
      h += row(a.locked ? '🔒' : '🏝️', NM(a.n),
        a.locked ? (money(a.cost) + ' + ' + a.rep + '*') : (T('level') + a.lvl + '/' + MAXLV),
        a.locked ? T('locked') : (a.lvl < MAXLV ? money(a.up[a.lvl]) : T('done')));
    }
    h += row('🏛️', NM(project.n), T('stage') + ' ' + project.stage + '/5',
      project.done ? T('done') : pct(Math.round(projPct() * 100)), project.done ? '' : money(project.total - project.inv));
    var used = SLOTS.filter(function (s) { return s.b && slotActive(s); }).length;
    var tot = SLOTS.filter(slotActive).length;
    h += row('🔨', T('mSlots'), T('mStaffCap') + ': ' + workers.length + '/' + staffCap(), used + '/' + tot);
    h += row('🧾', T('mOrders'), T('mLost') + ': ' + S.lost + ' - ' + T('mCaught') + ': ' + S.caught, S.served + '');
  } else if (curTab === 'personel') {
    if (!workers.length) h += '<div class="empty">' + T('mNoStaff') + '</div>';
    for (i = 0; i < workers.length; i++) {
      var w = workers[i], Rl = ROLES[w.role];
      h += row(Rl.icon, w.name + ' - ' + NM(Rl.n), NM(Rl.d), money(Rl.wage) + perMin(), T('carry') + ' ' + carryW(w) + '/' + Rl.cap);
    }
    h += row('👷', T('mStaffCap'), '', workers.length + '/' + staffCap());
    if (workers.length) h += row('💸', T('mTotalWage'), '', money(wageTotal()) + perMin());
  } else if (curTab === 'urunler') {
    for (i = 0; i < FISH_ORDER.length; i++) {
      var F = FISH[FISH_ORDER[i]], open = false;
      for (var s2 = 0; s2 < spots.length; s2++) {
        if (AREAS[spots[s2].z].locked) continue;
        for (var p2 = 0; p2 < spots[s2].pool.length; p2++) if (spots[s2].pool[p2][0] === F.id) open = true;
      }
      h += row(open ? '🐟' : '🔒', NM(F.n) + ' (' + NM(F.r) + ')',
        T('mWeight') + ' ' + F.w + ' - ' + T('mCut') + ' ' + F.cut.toFixed(2) + 's - ' + F.out + ' ' + T('mYield'),
        money(prodValue('fileto', F.id)), T('mSmoked') + ' ' + money(prodValue('fume', F.id)));
    }
  } else {
    h += row('🕹️', T('mCtrl'), T('ctrl'), '');
    h += row('🎣', T('mLoop'), T('mLoopE'), '');
    h += row('🔥', T('stSmoke'), T('mSmokeE'), '');
    h += row('⭐', T('rep'), T('mRepE'), '');
    h += row('🏗️', T('upArea'), T('mInvestE'), '');
  }
  el.tabBody.innerHTML = h;
}
Array.prototype.forEach.call(document.querySelectorAll('#menuTabs .tab'), function (b) {
  b.onclick = function () {
    Array.prototype.forEach.call(document.querySelectorAll('#menuTabs .tab'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); curTab = b.dataset.t; renderTab();
  };
});
el.menuBtn.onclick = function () { renderTab(); el.menuScreen.classList.remove('hidden'); };
el.closeMenu.onclick = function () { el.menuScreen.classList.add('hidden'); };
el.menuSet.onclick = function () { el.menuScreen.classList.add('hidden'); el.settingsScreen.classList.remove('hidden'); };

/* ---------- ayarlar ---------- */
function setLangTo(l) { lang = l; applyLang(); save(); }
Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button'), function (b) {
  b.onclick = function () { setLangTo(b.dataset.l); };
});
Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (b) {
  b.onclick = function () {
    soundOn = b.dataset.s === '1';
    Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); save();
  };
});
Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (b) {
  b.onclick = function () {
    zoomLvl = parseInt(b.dataset.z, 10);
    Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); resize(); save();
  };
});
el.setBtn.onclick = function () { el.startScreen.classList.add('hidden'); el.settingsScreen.classList.remove('hidden'); };
el.setClose.onclick = function () {
  el.settingsScreen.classList.add('hidden');
  if (!S.started) el.startScreen.classList.remove('hidden');
};
el.resetBtn.onclick = function () { if (confirm(T('resetAsk'))) wipe(); };
function syncSettingsUI() {
  Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.toggle('on', (o.dataset.s === '1') === soundOn); });
  Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (o) { o.classList.toggle('on', parseInt(o.dataset.z, 10) === zoomLvl); });
}

/* =========================================================
   DÖNGÜ
   ========================================================= */
var last = 0, saveT = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  var dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  if (!S.started) { gameT += dt; updateFx(dt); render(); return; }
  gameT += dt;
  updatePlayer(dt);
  updateWorkers(dt);
  updateStations(dt);
  updateCustomers(dt);
  updatePads(dt);
  updateSlotsAndProject();
  updateEvents(dt);
  updateTutorial();
  updateFx(dt);
  if (workers.length) S.cash = Math.max(0, S.cash - wageTotal() / 60 * dt);
  var tx = pX(player.x, player.y), ty = pY(player.x, player.y, 0);
  var k = 1 - Math.pow(0.0015, dt);
  camX = lerp(camX, tx, k); camY = lerp(camY, ty, k);
  syncHUD(dt);
  saveT += dt; if (saveT > 6) { saveT = 0; save(); }
  render();
}
function start() {
  el.startScreen.classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('objective').classList.remove('hidden');
  S.started = true;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
}
el.playBtn.onclick = start;
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

/* =========================================================
   BAŞLAT
   ========================================================= */
resize();
load();
rebuildCounters();
reassignWorkers();
lastRepLvl = repLevel();
applyLang();
syncSettingsUI();
resize();
camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { });
requestAnimationFrame(frame);

window.BT = {
  S: S, player: player, spots: spots, tables: tables, smoker: smoker, counters: counters,
  pads: PADS, areas: AREAS, slots: SLOTS, project: project, decor: DECOR, workers: workers,
  customers: customers, FISH: FISH, start: start, hire: hire, toast: toast,
  rebuildCounters: rebuildCounters, buyBuilding: buyBuilding, investProject: investProject,
  setLang: function (l) { setLangTo(l); },
  setEvent: function (id) { event = EVENTS.filter(function (e) { return e.id === id; })[0]; eventT = event.dur; }
};

})();
