/* =========================================================
   BALIKÇI TYCOON  v0.2
   GDD v0.2 uyarlaması: balık türleri, çalışan rolleri + maaş,
   sipariş sistemi, füme üretim zinciri, itibar, UI revizyonu.
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
function money(n) { return '$' + Math.round(n).toLocaleString('tr-TR'); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ---------------- canvas ---------------- */
var cvs = document.getElementById('game');
var ctx = cvs.getContext('2d');
var DPR = 1, VW = 0, VH = 0, ZOOM = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = cvs.clientWidth || window.innerWidth;
  VH = cvs.clientHeight || window.innerHeight;
  cvs.width = Math.round(VW * DPR); cvs.height = Math.round(VH * DPR);
  ZOOM = clamp(Math.min(VW, VH * 0.8) / 440, 0.7, 1.45);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function () { setTimeout(resize, 120); });

var TW = 76, TH = 38;
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
  var dx = e.clientX - stick.bx, dy = e.clientY - stick.by, L = Math.hypot(dx, dy), R = 64;
  if (L > R) { stick.bx += dx * (1 - R / L); stick.by += dy * (1 - R / L); dx = e.clientX - stick.bx; dy = e.clientY - stick.by; L = R; }
  stick.dx = L > 6 ? dx / R : 0; stick.dy = L > 6 ? dy / R : 0;
});
function stickEnd(e) { if (!e || e.pointerId === stick.id) { stick.active = false; stick.id = -1; stick.dx = 0; stick.dy = 0; } }
cvs.addEventListener('pointerup', stickEnd);
cvs.addEventListener('pointercancel', stickEnd);
cvs.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------------- ses ---------------- */
var AC = null, soundOn = true;
function beep(freq, dur, type, vol) {
  if (!soundOn) return;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; g.gain.value = vol || 0.05;
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.1));
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + (dur || 0.1));
  } catch (e) { }
}
var sfx = {
  pick: function () { beep(660 + Math.random() * 90, 0.06, 'triangle', 0.03); },
  drop: function () { beep(330 + Math.random() * 50, 0.06, 'square', 0.022); },
  coin: function () { beep(880, 0.08, 'triangle', 0.045); setTimeout(function () { beep(1320, 0.08, 'triangle', 0.035); }, 55); },
  buy: function () { beep(520, 0.11, 'sawtooth', 0.04); setTimeout(function () { beep(790, 0.15, 'sawtooth', 0.035); }, 85); },
  bad: function () { beep(170, 0.2, 'sawtooth', 0.03); },
  star: function () { beep(1000, 0.1, 'sine', 0.05); setTimeout(function () { beep(1500, 0.14, 'sine', 0.045); }, 80); }
};

/* =========================================================
   İÇERİK VERİSİ  (GDD §3, §5, §6, §16)
   ========================================================= */
var FISH = {
  hamsi:   { id: 'hamsi',   name: 'Hamsi',      rare: 'Yaygın', w: 1, cut: 0.42, out: 1, val: 6,  col: '#9fb6c4', meat: '#d9e4ec' },
  uskumru: { id: 'uskumru', name: 'Uskumru',    rare: 'Yaygın', w: 1, cut: 0.62, out: 1, val: 12, col: '#7fa9b4', meat: '#bfe0dd' },
  levrek:  { id: 'levrek',  name: 'Levrek',     rare: 'Orta',   w: 1, cut: 0.85, out: 2, val: 17, col: '#c3cfd8', meat: '#eef5f9' },
  somon:   { id: 'somon',   name: 'Somon',      rare: 'Orta',   w: 2, cut: 1.10, out: 3, val: 27, col: '#e79468', meat: '#f59a4b' },
  ton:     { id: 'ton',     name: 'Ton Balığı', rare: 'Nadir',  w: 3, cut: 1.70, out: 5, val: 46, col: '#5f7f9c', meat: '#c1544f' }
};
var FISH_ORDER = ['hamsi', 'uskumru', 'levrek', 'somon', 'ton'];
var FUME_MUL = 2.4, FUME_TIME = 3.2;

function prodName(k, f) { return FISH[f].name + (k === 'fume' ? ' Füme' : ' Fileto'); }
function prodValue(k, f) { return Math.round(FISH[f].val * (k === 'fume' ? FUME_MUL : 1) * (1 + S.priceLvl * 0.1)); }
function itemW(it) { return it.k === 'fish' ? FISH[it.f].w : 1; }

var ROLES = {
  hamal:     { id: 'hamal',     name: 'Hamal',     icon: '🧺', wage: 15, speed: 2.55, cap: 8, desc: 'Ağdan kesim masasına taşır' },
  filetocu:  { id: 'filetocu',  name: 'Filetocu',  icon: '🔪', wage: 19, speed: 2.4,  cap: 4, desc: 'Kesim masasını %55 hızlandırır' },
  tezgahtar: { id: 'tezgahtar', name: 'Tezgâhtar', icon: '🍣', wage: 22, speed: 2.65, cap: 8, desc: 'Ürünü tezgâha taşır' },
  kasiyer:   { id: 'kasiyer',   name: 'Kasiyer',   icon: '💵', wage: 17, speed: 2.75, cap: 10, desc: 'Parayı kasaya işler' }
};

var CUST = [
  { id: 'isci',   name: 'İşçi',    coat: '#f2c94c', coat2: '#e0b53c', qty: [2, 4],  pat: 54,  mult: 1.00, rep: 1, lvl: 1, tag: 'cheap' },
  { id: 'aile',   name: 'Aile',    coat: '#8fd3f4', coat2: '#79bde0', qty: [4, 7],  pat: 80,  mult: 1.05, rep: 1, lvl: 1, tag: 'any' },
  { id: 'tuccar', name: 'Tüccar',  coat: '#b58cf0', coat2: '#9e76da', qty: [3, 5],  pat: 50,  mult: 1.35, rep: 2, lvl: 2, tag: 'rich' },
  { id: 'sef',    name: 'Şef',     coat: '#f7f7f2', coat2: '#e2e2da', qty: [3, 4],  pat: 32,  mult: 1.80, rep: 2, lvl: 3, tag: 'premium', pen: 1 },
  { id: 'kaptan', name: 'Kaptan',  coat: '#4f9fd0', coat2: '#3d87b6', qty: [8, 14], pat: 120, mult: 1.25, rep: 3, lvl: 3, tag: 'any' },
  { id: 'vip',    name: 'VIP',     coat: '#f28ab2', coat2: '#dd739c', qty: [2, 3],  pat: 28,  mult: 3.00, rep: 3, lvl: 4, tag: 'fume', pen: 2 }
];

var EVENTS = [
  { id: 'suru', name: 'Balık Sürüsü', icon: '🐟', dur: 34, fishMul: 2.2, custMul: 1.0, msg: 'Balık sürüsü geldi! Ağlar iki kat hızlı 🐟' },
  { id: 'gemi', name: 'Yolcu Gemisi', icon: '🚢', dur: 38, fishMul: 1.0, custMul: 2.2, msg: 'Yolcu gemisi yanaştı! Müşteri akını 🚢' },
  { id: 'kar',  name: 'Kar Fırtınası', icon: '❄️', dur: 30, fishMul: 1.0, custMul: 0.45, msg: 'Kar bastırdı, müşteri azaldı ❄️' }
];

var REP_LEVELS = [
  { need: 0,   title: 'Küçük Balıkçı' },
  { need: 10,  title: 'İskele Dükkânı' },
  { need: 30,  title: 'Balık Pazarı' },
  { need: 75,  title: 'Liman İşletmesi' },
  { need: 150, title: 'Balıkçılık Şirketi' }
];

/* =========================================================
   DÜNYA
   ========================================================= */
var ZONES = [
  { name: 'Küçük İskele', x0: 0, y0: 0,  x1: 10, y1: 6,    locked: false, price: 0,    rep: 0 },
  { name: 'Balık Pazarı', x0: 0, y0: 6,  x1: 10, y1: 12,   locked: true,  price: 650,  rep: 10 },
  { name: 'Fümehane',     x0: 0, y0: 12, x1: 10, y1: 17.5, locked: true,  price: 2400, rep: 30 }
];

var spots = [
  { zone: 0, x: 2.3, y: 0.9,  face: 'n', pool: [['hamsi', 60], ['uskumru', 40]], stock: [], max: 12, t: 0, rate: 1.05 },
  { zone: 1, x: 1.0, y: 7.7,  face: 'w', pool: [['uskumru', 45], ['levrek', 35], ['somon', 20]], stock: [], max: 12, t: 0, rate: 1.25 },
  { zone: 2, x: 0.9, y: 13.4, face: 'w', pool: [['levrek', 25], ['somon', 45], ['ton', 30]], stock: [], max: 12, t: 0, rate: 1.5 }
];

function mkTable(zone, x, y, mx, my) {
  return { zone: zone, x: x, y: y, inn: [], cur: null, t: 0, worker: null, mat: { x: mx, y: my, items: [] }, max: 10, matMax: 16 };
}
var tables = [
  mkTable(0, 5.3, 2.0,  6.6, 3.0),
  mkTable(1, 4.3, 8.1,  5.6, 9.1),
  mkTable(2, 3.2, 13.0, 4.4, 13.9)
];
var smoker = { zone: 2, x: 3.2, y: 15.7, inn: [], cur: null, t: 0, mat: { x: 4.5, y: 16.4, items: [] }, max: 8, matMax: 12 };

function mkCounter(zone, x, y) {
  return {
    zone: zone, x: x, y: y, buffer: [], max: 20, slots: [null, null, null, null],
    tray: { x: x - 0.55, y: y + 1.45, items: [] }, spawnT: 3 + zone * 2, eatT: 0
  };
}
var counters = [mkCounter(0, 8.9, 3.2), mkCounter(1, 8.9, 9.2), mkCounter(2, 8.9, 15.2)];
var safe = { zone: 0, x: 1.35, y: 4.85, pop: 0 };

var PADS = [
  { id: 'cap', zone: 0, x: 1.15, y: 1.55, kind: 'cap',  label: 'KAPASİTE', icon: '🎒', price: 120, growth: 1.55, lvl: 0, max: 8, paid: 0 },
  { id: 'spd', zone: 0, x: 1.15, y: 3.15, kind: 'spd',  label: 'HIZ',      icon: '👟', price: 160, growth: 1.60, lvl: 0, max: 6, paid: 0 },
  { id: 'w1',  zone: 0, x: 3.3,  y: 4.7,  kind: 'hire', role: 'hamal',     icon: '🧺', price: 380, growth: 2.05, lvl: 0, max: 2, paid: 0 },
  { id: 'z1',  zone: 0, x: 6.2,  y: 5.2,  kind: 'zone', target: 1,         icon: '🔓', price: 650, growth: 1, lvl: 0, max: 1, paid: 0, rep: 10 },
  { id: 'w2',  zone: 1, x: 6.9,  y: 7.0,  kind: 'hire', role: 'filetocu',  icon: '🔪', price: 520, growth: 2.0, lvl: 0, max: 3, paid: 0 },
  { id: 'w3',  zone: 1, x: 2.5,  y: 10.9, kind: 'hire', role: 'tezgahtar', icon: '🍣', price: 720, growth: 2.0, lvl: 0, max: 2, paid: 0 },
  { id: 'z2',  zone: 1, x: 6.2,  y: 11.3, kind: 'zone', target: 2,         icon: '🔓', price: 2400, growth: 1, lvl: 0, max: 1, paid: 0, rep: 30 },
  { id: 'w4',  zone: 2, x: 7.0,  y: 13.2, kind: 'hire', role: 'kasiyer',   icon: '💵', price: 900, growth: 2.0, lvl: 0, max: 2, paid: 0 },
  { id: 'prc', zone: 2, x: 6.7,  y: 16.8, kind: 'price', label: 'PAZARLIK', icon: '💲', price: 850, growth: 1.8, lvl: 0, max: 6, paid: 0 }
];

/* =========================================================
   DURUM
   ========================================================= */
var S = {
  cash: 0, rep: 0, capLvl: 0, spdLvl: 0, priceLvl: 0,
  served: 0, lost: 0, caught: 0, tut: 0, started: false
};
var player = { x: 4.5, y: 3.2, z: 0, vx: 0, vy: 0, bob: 0, face: 1, carry: [], act: 0, isPlayer: true };
var workers = [], customers = [], flyers = [], floats = [], puffs = [];
var event = null, eventT = 0, nextEvent = 75;
var gameT = 0, camX = 0, camY = 0;

function capacity() { return 8 + S.capLvl * 3; }
function speed() { return 3.25 * Math.pow(1.11, S.spdLvl); }
function carryW(a) { var w = 0; for (var i = 0; i < a.carry.length; i++) w += itemW(a.carry[i]); return w; }
function repLevel() { var l = 1; for (var i = 0; i < REP_LEVELS.length; i++) if (S.rep >= REP_LEVELS[i].need) l = i + 1; return l; }
function repTitle() { return REP_LEVELS[repLevel() - 1].title; }
function wageTotal() { var w = 0; for (var i = 0; i < workers.length; i++) w += ROLES[workers[i].role].wage; return w; }

/* ---------------- kayıt ---------------- */
var SAVE_KEY = 'balikci_tycoon_v2';
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      cash: S.cash, rep: S.rep, capLvl: S.capLvl, spdLvl: S.spdLvl, priceLvl: S.priceLvl,
      served: S.served, lost: S.lost, caught: S.caught, tut: S.tut,
      zones: ZONES.map(function (z) { return z.locked ? 1 : 0; }),
      pads: PADS.map(function (p) { return [Math.round(p.paid), p.lvl, p.price]; }),
      workers: workers.map(function (w) { return w.role; })
    }));
  } catch (e) { }
}
function load() {
  try {
    var raw = localStorage.getItem(SAVE_KEY); if (!raw) return;
    var d = JSON.parse(raw);
    S.cash = d.cash || 0; S.rep = d.rep || 0; S.capLvl = d.capLvl || 0; S.spdLvl = d.spdLvl || 0;
    S.priceLvl = d.priceLvl || 0; S.served = d.served || 0; S.lost = d.lost || 0;
    S.caught = d.caught || 0; S.tut = d.tut || 0;
    if (d.zones) d.zones.forEach(function (v, i) { if (ZONES[i]) ZONES[i].locked = !!v; });
    if (d.pads) d.pads.forEach(function (v, i) { if (PADS[i]) { PADS[i].paid = v[0]; PADS[i].lvl = v[1]; PADS[i].price = v[2]; } });
    if (d.workers) d.workers.forEach(function (r) { hire(r, true); });
  } catch (e) { }
}
function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); }

/* =========================================================
   TAŞIMA / ETKİLEŞİM
   ========================================================= */
function capOf(a) { return a.isPlayer ? capacity() : ROLES[a.role].cap; }
function fits(a, it) { return carryW(a) + itemW(it) <= capOf(a); }
function popCarry(a, test) {
  for (var i = a.carry.length - 1; i >= 0; i--) if (test(a.carry[i])) return a.carry.splice(i, 1)[0];
  return null;
}
function hasCarry(a, test) { for (var i = 0; i < a.carry.length; i++) if (test(a.carry[i])) return true; return false; }
var isFish = function (it) { return it.k === 'fish'; };
var isFileto = function (it) { return it.k === 'fileto'; };
var isGoods = function (it) { return it.k === 'fileto' || it.k === 'fume'; };
var isMoney = function (it) { return it.k === 'money'; };
function carryTopZ(a, i) { return 34 + i * 7.6; }

function addFloat(x, y, txt, col) {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i];
    if (f.col === col && f.t < 0.35 && dist2(f.x, f.y, x, y) < 1.2 && f.num && txt.charAt(0) === '+') {
      var add = parseFloat(txt.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.')) || 0;
      f.num += add; f.txt = '+' + money(f.num); f.t = 0; return;
    }
  }
  var n = txt.charAt(0) === '+' ? (parseFloat(txt.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.')) || 0) : 0;
  floats.push({ x: x, y: y, t: 0, txt: txt, col: col || '#fff', num: n });
}
function addPuff(x, y, col) {
  for (var i = 0; i < 5; i++) puffs.push({ x: x, y: y, z: rnd(10, 26), vx: rnd(-.6, .6), vy: rnd(-.6, .6), vz: rnd(30, 70), t: 0, col: col || '#fff' });
}
function fly(x0, y0, z0, x1, y1, z1, it, dur) {
  flyers.push({ x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, it: it, t: 0, d: dur || 0.4, h: rnd(48, 74) });
}

/* --- hareket --- */
function canStand(x, y) {
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i]; if (z.locked) continue;
    if (x > z.x0 + 0.35 && x < z.x1 - 0.35 && y > z.y0 - 0.02 && y < z.y1 + 0.02) return true;
  }
  return false;
}
function maxOpenY() { var m = 0; for (var i = 0; i < ZONES.length; i++) if (!ZONES[i].locked) m = Math.max(m, ZONES[i].y1); return m; }
function moveActor(a, dx, dy, spd, dt) {
  var L = Math.hypot(dx, dy);
  if (L < 0.001) { a.vx = 0; a.vy = 0; return false; }
  dx /= L; dy /= L;
  var nx = a.x + dx * spd * dt, ny = a.y + dy * spd * dt;
  if (canStand(nx, a.y)) a.x = nx;
  if (canStand(a.x, ny)) a.y = ny;
  a.vx = dx; a.vy = dy; a.face = pX(dx, dy) >= 0 ? 1 : -1; a.bob += dt * 13;
  return true;
}
function goTo(a, tx, ty, spd, dt, stopR) {
  var dx = tx - a.x, dy = ty - a.y, L = Math.hypot(dx, dy);
  if (L <= (stopR || 0.5)) { a.vx = 0; a.vy = 0; return true; }
  moveActor(a, dx, dy, spd, dt); return false;
}

/* --- istasyon etkileşimleri --- */
function actDelay(a) { return a.isPlayer ? 0.075 : 0.1; }
function tryTake(a, dt, fn) { a.act -= dt; if (a.act > 0) return true; a.act = actDelay(a); fn(); return true; }

function itemKey(it) { return it.k + '|' + it.f; }
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

function iPickFish(a, s, dt) {
  if (!s.stock.length) return false;
  var it = s.stock[s.stock.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    s.stock.pop(); a.carry.push(it);
    fly(s.x, s.y + 0.9, 18, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.28); sfx.pick();
  });
}
function iDropTable(a, tb, dt) {
  if (tb.inn.length >= tb.max || !hasCarry(a, isFish)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFish); tb.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), tb.x, tb.y, 26, it, 0.28); sfx.drop();
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
    fly(mat.x, mat.y, 14, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.28); sfx.pick();
  });
}
function iDropSmoker(a, dt) {
  if (smoker.inn.length >= smoker.max || !hasCarry(a, isFileto)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFileto); smoker.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), smoker.x, smoker.y, 26, it, 0.28); sfx.drop();
  });
}
function iDropCounter(a, c, dt) {
  if (c.buffer.length >= c.max || !hasCarry(a, isGoods)) return false;
  var m = counterWants(c), want = null, i;
  for (i = 0; i < a.carry.length; i++) {
    var it = a.carry[i];
    if (isGoods(it) && m[itemKey(it)] > 0) { want = it; break; }
  }
  /* sipariş dışı ürün tezgâhı kilitlemesin: sadece vitrin stoğu kadar */
  if (!want && c.buffer.length >= 7) return false;
  return tryTake(a, dt, function () {
    var got = want ? popCarry(a, function (q) { return q === want; }) : popCarry(a, isGoods);
    c.buffer.push(got);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), c.x, c.y, 30, got, 0.28); sfx.drop();
  });
}
function iPickMoney(a, c, dt) {
  if (!c.tray.items.length) return false;
  var it = c.tray.items[c.tray.items.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    c.tray.items.pop(); a.carry.push(it);
    fly(c.tray.x, c.tray.y, 14, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.28); sfx.pick();
  });
}
function iDeposit(a, dt) {
  if (!hasCarry(a, isMoney)) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.05;
  var it = popCarry(a, isMoney);
  S.cash += it.v; safe.pop = 1;
  fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), safe.x, safe.y, 30, it, 0.26);
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
    var s = spots[i]; if (ZONES[s.zone].locked) continue;
    if (dist2(player.x, player.y, s.x, s.y + 0.9) < 1.6) acted = iPickFish(player, s, dt) || acted;
  }
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (ZONES[tb.zone].locked) continue;
    if (dist2(player.x, player.y, tb.x, tb.y) < 1.6) acted = iDropTable(player, tb, dt) || acted;
    if (dist2(player.x, player.y, tb.mat.x, tb.mat.y) < 1.5) acted = iPickMat(player, tb.mat, dt) || acted;
  }
  if (!ZONES[smoker.zone].locked) {
    if (dist2(player.x, player.y, smoker.x, smoker.y) < 1.6) acted = iDropSmoker(player, dt) || acted;
    if (dist2(player.x, player.y, smoker.mat.x, smoker.mat.y) < 1.5) acted = iPickMat(player, smoker.mat, dt) || acted;
  }
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (ZONES[c.zone].locked) continue;
    if (dist2(player.x, player.y, c.x, c.y) < 1.8) acted = iDropCounter(player, c, dt) || acted;
    if (dist2(player.x, player.y, c.tray.x, c.tray.y) < 1.5) acted = iPickMoney(player, c, dt) || acted;
  }
  if (dist2(player.x, player.y, safe.x, safe.y) < 1.8) acted = iDeposit(player, dt) || acted;
  if (!acted) player.act = 0;
}

/* =========================================================
   ÇALIŞANLAR (GDD §5)
   ========================================================= */
function hire(role, silent) {
  var w = {
    role: role, x: 4.6 + rnd(-1, 1), y: 3.6 + rnd(-1, 1), z: 0, vx: 0, vy: 0,
    carry: [], act: 0, bob: 0, face: 1, table: null, mode: 'load', name: pick(WNAMES), lvl: 1
  };
  workers.push(w);
  if (role === 'filetocu') assignFiletocu(w);
  if (!silent) toast(ROLES[role].icon + ' ' + w.name + ' işe alındı — maaş ' + money(ROLES[role].wage) + '/dk');
  return w;
}
var WNAMES = ['Hasan', 'Kerim', 'Zeynep', 'Mert', 'Deniz', 'Ayla', 'Tarık', 'Elif', 'Cem', 'Nur'];
function assignFiletocu(w) {
  for (var i = 0; i < tables.length; i++) {
    if (ZONES[tables[i].zone].locked || tables[i].worker) continue;
    tables[i].worker = w; w.table = tables[i]; return;
  }
  w.table = null;
}
function reassignWorkers() {
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i];
    if (w.role === 'filetocu' && !w.table) assignFiletocu(w);
  }
}
function openTables() { return tables.filter(function (t) { return !ZONES[t.zone].locked; }); }
function openCounters() { return counters.filter(function (c) { return !ZONES[c.zone].locked; }); }

function bestSpot(w) {
  var best = null, bs = -1;
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (ZONES[s.zone].locked) continue;
    var sc = s.stock.length * 3 - (w ? Math.sqrt(dist2(w.x, w.y, s.x, s.y)) : 0);
    if (sc > bs) { bs = sc; best = s; }
  } return best;
}
function tableWithSpace(w) {
  var list = openTables().filter(function (t) { return t.inn.length < t.max; }), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var d = (w ? dist2(w.x, w.y, list[i].x, list[i].y) : 0) + list[i].inn.length * 2;
    if (d < bd) { bd = d; best = list[i]; }
  }
  return best;
}
function matWithGoods() {
  var best = null, list = openTables();
  for (var i = 0; i < list.length; i++) if (list[i].mat.items.length && (!best || list[i].mat.items.length > best.items.length)) best = list[i].mat;
  if (!ZONES[smoker.zone].locked && smoker.mat.items.length && (!best || smoker.mat.items.length > best.items.length)) best = smoker.mat;
  return best;
}
function counterNeeding() {
  var list = openCounters(), best = null, bestN = 0;
  for (var i = 0; i < list.length; i++) {
    var c = list[i]; if (c.buffer.length >= c.max) continue;
    var n = 0;
    for (var k = 0; k < c.slots.length; k++) {
      var cu = c.slots[k];
      if (cu && cu.state === 'wait') n += (cu.ord.need - cu.ord.got);
    }
    n -= c.buffer.length;
    if (n > bestN) { bestN = n; best = c; }
  }
  return best || list.filter(function (c) { return c.buffer.length < c.max; })[0] || null;
}
function trayWithMoney(minN, w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    if (list[i].tray.items.length < (minN || 1)) continue;
    var d = w ? dist2(w.x, w.y, list[i].tray.x, list[i].tray.y) : 0;
    if (d < bd) { bd = d; best = list[i]; }
  }
  return best;
}

function updateWorkers(dt) {
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i], sp = ROLES[w.role].speed;
    if (w.role === 'hamal') aiHamal(w, sp, dt);
    else if (w.role === 'tezgahtar') aiTezgahtar(w, sp, dt);
    else if (w.role === 'kasiyer') aiKasiyer(w, sp, dt);
    else aiFiletocu(w, sp, dt);
  }
}
function counterWantingCarry(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i]; if (c.buffer.length >= c.max) continue;
    var m = counterWants(c), hit = false;
    for (var j = 0; j < w.carry.length; j++) if (isGoods(w.carry[j]) && m[itemKey(w.carry[j])] > 0) { hit = true; break; }
    if (!hit) continue;
    var d = dist2(w.x, w.y, c.x, c.y);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
function matWith(filter, w) {
  var mats = openTables().map(function (t) { return t.mat; }), best = null, bd = 1e9, i, j;
  if (!ZONES[smoker.zone].locked) mats.push(smoker.mat);
  for (i = 0; i < mats.length; i++) {
    var has = false;
    for (j = 0; j < mats[i].items.length; j++) if (filter(mats[i].items[j])) { has = true; break; }
    if (!has) continue;
    var d = w ? dist2(w.x, w.y, mats[i].x, mats[i].y) : 0;
    if (d < bd) { bd = d; best = mats[i]; }
  }
  return best;
}
function aiHamal(w, sp, dt) {
  var cap = ROLES.hamal.cap, full = carryW(w) >= cap - 0.5;
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
function nearestCounterWithSpace(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    if (list[i].buffer.length >= 7) continue;
    var d = dist2(w.x, w.y, list[i].x, list[i].y);
    if (d < bd) { bd = d; best = list[i]; }
  }
  return best;
}
function aiTezgahtar(w, sp, dt) {
  var cap = ROLES.tezgahtar.cap, full = carryW(w) >= cap - 0.5, i, k;
  var g = globalWants();
  for (i = 0; i < w.carry.length; i++) { k = itemKey(w.carry[i]); if (g[k] > 0) g[k]--; }
  var wantFilter = function (it) { return g[itemKey(it)] > 0; };
  var m = matWith(wantFilter, w);
  var stockLow = openCounters().filter(function (q) { return q.buffer.length < 5; }).length > 0;
  if (!m && stockLow) m = matWith(isGoods, w);
  if (w.mode !== 'drop' && (full || !m) && hasCarry(w, isGoods)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isGoods)) w.mode = 'load';
  if (w.mode === 'drop') {
    var c = counterWantingCarry(w) || nearestCounterWithSpace(w);
    if (c) { if (goTo(w, c.x - 0.5, c.y - 0.6, sp, dt, 1.0)) { if (!iDropCounter(w, c, dt)) w.mode = 'load'; } }
    else goTo(w, 7.2, 4.8, sp, dt, 1.0);
    return;
  }
  if (m && !full) {
    var filt = matWith(wantFilter, w) === m ? wantFilter : isGoods;
    if (goTo(w, m.x, m.y, sp, dt, 0.8)) { if (!iPickMat(w, m, dt, filt)) w.mode = 'drop'; }
    return;
  }
  if (hasCarry(w, isGoods)) { w.mode = 'drop'; return; }
  goTo(w, 7.2, 4.8, sp, dt, 1.0);
}
function aiKasiyer(w, sp, dt) {
  var cap = ROLES.kasiyer.cap, full = carryW(w) >= cap - 0.5;
  var c = trayWithMoney(1, w);
  if (w.mode !== 'drop' && (full || !c) && hasCarry(w, isMoney)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isMoney)) w.mode = 'load';
  if (w.mode === 'drop') {
    if (goTo(w, safe.x + 0.35, safe.y + 0.35, sp, dt, 0.9)) iDeposit(w, dt);
    return;
  }
  if (c) { if (goTo(w, c.tray.x, c.tray.y, sp, dt, 0.8)) iPickMoney(w, c, dt); return; }
  if (hasCarry(w, isMoney)) { w.mode = 'drop'; return; }
  goTo(w, safe.x + 1.6, safe.y - 0.7, sp, dt, 1.0);
}
function aiFiletocu(w, sp, dt) {
  if (!w.table || ZONES[w.table.zone].locked) { assignFiletocu(w); }
  if (!w.table) { goTo(w, 5.5, 4.2, sp, dt, 1.0); return; }
  goTo(w, w.table.x + 0.85, w.table.y + 0.15, sp, dt, 0.25);
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
  var i, s, t;
  var fishMul = event ? event.fishMul : 1;
  for (i = 0; i < spots.length; i++) {
    s = spots[i]; if (ZONES[s.zone].locked) continue;
    if (s.stock.length >= s.max) { s.t = 0; continue; }
    s.t += dt * fishMul;
    if (s.t >= s.rate) {
      s.t = 0;
      var it = { k: 'fish', f: poolPick(s.pool) };
      s.stock.push(it); S.caught++;
      var ox = s.face === 'n' ? s.x + rnd(-1, 1) : s.x - rnd(2.2, 3.4);
      var oy = s.face === 'n' ? s.y - rnd(2.2, 3.4) : s.y + rnd(-1, 1);
      fly(ox, oy, 6, s.x, s.y + 0.9, 18, it, 0.55);
    }
  }
  for (i = 0; i < tables.length; i++) {
    t = tables[i]; if (ZONES[t.zone].locked) continue;
    if (!t.cur && t.inn.length && t.mat.items.length < t.matMax) { t.cur = t.inn.shift(); t.t = 0; }
    if (t.cur) {
      t.t += dt * (t.worker ? 1.55 : 1);
      if (t.t >= FISH[t.cur.f].cut) {
        var fsh = FISH[t.cur.f];
        for (var k = 0; k < fsh.out; k++) {
          var fil = { k: 'fileto', f: t.cur.f };
          t.mat.items.push(fil);
          fly(t.x, t.y, 30, t.mat.x, t.mat.y, 14, fil, 0.38 + k * 0.05);
        }
        addPuff(t.x, t.y, '#ffffff'); t.cur = null; t.t = 0;
      }
    }
  }
  if (!ZONES[smoker.zone].locked) {
    /* üretim hattı bandı: aynı bölgedeki kesim masasından füme fırınına */
    smoker.belt = (smoker.belt || 0) + dt;
    if (smoker.belt >= 1.0) {
      var src = tables[smoker.zone].mat;
      if (smoker.inn.length < smoker.max && src.items.length) {
        smoker.belt = 0;
        var moved = src.items.pop();
        smoker.inn.push(moved);
        fly(src.x, src.y, 12, smoker.x, smoker.y, 30, moved, 0.55);
      }
    }
    if (!smoker.cur && smoker.inn.length && smoker.mat.items.length < smoker.matMax) { smoker.cur = smoker.inn.shift(); smoker.t = 0; }
    if (smoker.cur) {
      smoker.t += dt;
      if (smoker.t >= FUME_TIME) {
        var fm = { k: 'fume', f: smoker.cur.f };
        smoker.mat.items.push(fm);
        fly(smoker.x, smoker.y, 34, smoker.mat.x, smoker.mat.y, 14, fm, 0.4);
        addPuff(smoker.x, smoker.y, '#d8cfc2'); smoker.cur = null; smoker.t = 0;
      }
    }
  }
  for (i = 0; i < counters.length; i++) {
    if (ZONES[counters[i].zone].locked) continue;
    updateCounter(counters[i], dt);
  }
  safe.pop = Math.max(0, safe.pop - dt * 3);
}

/* =========================================================
   MÜŞTERİ + SİPARİŞ (GDD §6)
   ========================================================= */
function availableProducts() {
  var list = [], seen = {}, i, j;
  for (i = 0; i < spots.length; i++) {
    if (ZONES[spots[i].zone].locked) continue;
    for (j = 0; j < spots[i].pool.length; j++) {
      var f = spots[i].pool[j][0];
      if (!seen['fileto' + f]) { seen['fileto' + f] = 1; list.push({ k: 'fileto', f: f }); }
      if (!ZONES[smoker.zone].locked && !seen['fume' + f]) { seen['fume' + f] = 1; list.push({ k: 'fume', f: f }); }
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
  /* %70 ihtimalle hâlihazırda üretilebilen/stokta olan üründen sipariş ver */
  var stock = {}, i, j, lists = openTables().map(function (t) { return t.mat.items; })
    .concat(openCounters().map(function (c) { return c.buffer; }));
  if (!ZONES[smoker.zone].locked) lists.push(smoker.mat.items);
  for (i = 0; i < lists.length; i++) for (j = 0; j < lists[i].length; j++) stock[lists[i][j].k + '|' + lists[i][j].f] = 1;
  var inStock = f.filter(function (q) { return stock[q.k + '|' + q.f]; });
  if (inStock.length && Math.random() < 0.7) f = inStock;
  var p = pick(f);
  var n = irnd(type.qty[0], type.qty[1]);
  return { k: p.k, f: p.f, need: n, got: 0 };
}
function queueSlotPos(c, i) { return { x: 10.75, y: c.y + 0.1 + i * 1.05 }; }

function updateCounter(c, dt) {
  var custMul = event ? event.custMul : 1;
  c.spawnT -= dt * custMul;
  var freeIdx = -1, i;
  for (i = 0; i < c.slots.length; i++) if (!c.slots[i]) { freeIdx = i; break; }
  if (c.spawnT <= 0 && freeIdx >= 0) {
    c.spawnT = 5.4 * rnd(0.75, 1.3);
    var lvl = repLevel();
    var pool = CUST.filter(function (t) { return t.lvl <= lvl; });
    var type = pick(pool);
    var ord = makeOrder(type);
    if (ord) {
      var cu = {
        x: 12.8, y: 19.5 + rnd(0, 2), z: 0, bob: rnd(0, 6), face: -1, type: type, ord: ord,
        state: 'walk', slot: freeIdx, c: c, pat: type.pat, patMax: type.pat, mood: 1,
        hair: irnd(0, 2), tone: irnd(0, 2)
      };
      c.slots[freeIdx] = cu; customers.push(cu);
    }
  }
  c.eatT -= dt;
  if (c.eatT <= 0) {
    for (var q = 0; q < c.slots.length; q++) {
      var cu2 = c.slots[q];
      if (!cu2 || cu2.state !== 'wait' || cu2.ord.got >= cu2.ord.need) continue;
      var idx = -1;
      for (i = 0; i < c.buffer.length; i++) if (c.buffer[i].k === cu2.ord.k && c.buffer[i].f === cu2.ord.f) { idx = i; break; }
      if (idx < 0) continue;
      c.eatT = 0.2;
      var it = c.buffer.splice(idx, 1)[0];
      cu2.ord.got++;
      var fp = queueSlotPos(c, cu2.slot);
      fly(c.x, c.y, 30, fp.x, fp.y, 40, it, 0.28);
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
  S.served++;
  var rep = cu.type.rep;
  S.rep += rep;
  var fp = queueSlotPos(c, cu.slot);
  addFloat(fp.x, fp.y - 0.5, '+' + money(pay), '#ffe27a');
  addFloat(fp.x + 0.6, fp.y - 1.1, '+' + rep + ' ⭐', '#ffd76a');
  sfx.coin();
  checkRepLevel();
}
var lastRepLvl = 1;
function checkRepLevel() {
  var l = repLevel();
  if (l > lastRepLvl) { lastRepLvl = l; toast('⭐ Yeni seviye: ' + repTitle() + '!'); sfx.star(); }
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
    if (c.tray.items.length >= 24) { c.tray.items[c.tray.items.length - 1].v += per; }
    else {
      var it = { k: 'money', v: per };
      c.tray.items.push(it);
      fly(src.x, src.y, 30, c.tray.x, c.tray.y, 14, it, 0.45);
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
        if (pen) { S.rep = Math.max(0, S.rep - pen); addFloat(cu.x, cu.y - 0.6, '-' + pen + ' ⭐', '#ff8a7a'); }
        else addFloat(cu.x, cu.y - 0.6, 'GİTTİ! 😠', '#ff8a7a');
        sfx.bad();
      }
    } else {
      cu.x += (13.4 - cu.x) * Math.min(1, dt * 1.6);
      cu.y += 3.6 * dt; cu.bob += dt * 8;
      if (cu.y > 21.5) customers.splice(i, 1);
    }
  }
}

/* =========================================================
   ALIM ALANLARI / OLAYLAR / EĞİTİM
   ========================================================= */
var nearestPad = null;
function padReady(p) { return !ZONES[p.zone].locked && p.lvl < p.max; }
function padBlocked(p) { return p.kind === 'zone' && p.rep && S.rep < p.rep; }
function updatePads(dt) {
  /* GDD §12.2: aynı anda yalnız en yakın alanın kartı açılır */
  nearestPad = null;
  var bestD = 6.2;
  for (var q = 0; q < PADS.length; q++) {
    var pp = PADS[q];
    if (!padReady(pp)) continue;
    var d = dist2(player.x, player.y, pp.x, pp.y);
    if (d < bestD) { bestD = d; nearestPad = pp; }
  }
  for (var i = 0; i < PADS.length; i++) {
    var p = PADS[i];
    if (!padReady(p) || padBlocked(p)) continue;
    if (dist2(player.x, player.y, p.x, p.y) < 1.3) {
      var rate = Math.max(60, p.price / 2.6);
      var d = Math.min(rate * dt, p.price - p.paid, S.cash);
      if (d > 0) {
        S.cash -= d; p.paid += d;
        if (Math.random() < 0.3) addPuff(p.x, p.y, '#ffd76a');
        if (Math.random() < 0.22) beep(400 + (p.paid / p.price) * 500, 0.035, 'square', 0.018);
      }
      if (p.paid >= p.price - 0.01) applyPad(p);
    }
  }
}
function applyPad(p) {
  p.paid = 0; p.lvl++; sfx.buy();
  if (p.kind === 'cap') toast('🎒 Taşıma kapasitesi: ' + (capacity() + 3));
  if (p.kind === 'cap') S.capLvl++;
  else if (p.kind === 'spd') { S.spdLvl++; toast('👟 Hız +%11'); }
  else if (p.kind === 'price') { S.priceLvl++; toast('💲 Satış fiyatı +%10'); }
  else if (p.kind === 'zone') {
    ZONES[p.target].locked = false; reassignWorkers();
    toast('🔓 ' + ZONES[p.target].name + ' açıldı!');
  } else if (p.kind === 'hire') hire(p.role);
  if (p.lvl < p.max) p.price = Math.round(p.price * p.growth);
  addPuff(p.x, p.y, '#ffd76a'); addPuff(p.x, p.y, '#ffffff');
  save();
}
function updateEvents(dt) {
  if (event) {
    eventT -= dt;
    if (eventT <= 0) { event = null; nextEvent = rnd(70, 110); }
    return;
  }
  nextEvent -= dt;
  if (nextEvent <= 0 && S.tut >= 5) {
    event = pick(EVENTS); eventT = event.dur;
    toast(event.msg);
  }
}
var TUT = [
  { txt: 'Ağın yanında bekle — balık birikiyor', ok: function () { return spots[0].stock.length > 0; } },
  { txt: 'Sandığın üstünden geç, balıkları sırtla', ok: function () { return hasCarry(player, isFish); } },
  { txt: 'Balıkları kesim masasına bırak 🔪', ok: function () { return tables[0].inn.length > 0 || tables[0].cur || tables[0].mat.items.length > 0; } },
  { txt: 'Filetoyu al ve tezgâha taşı 🍣', ok: function () { return counters[0].buffer.length > 0; } },
  { txt: 'Tepsideki parayı al, kasaya götür 💵', ok: function () { return S.cash > 0; } },
  { txt: 'Parlayan alanda bekle ve yükseltme al ⭐', ok: function () { for (var i = 0; i < PADS.length; i++) if (PADS[i].lvl > 0) return true; return false; } }
];
function updateTutorial() {
  if (S.tut >= TUT.length) return;
  if (TUT[S.tut].ok()) { S.tut++; if (S.tut < TUT.length) sfx.star(); else { toast('Eğitim tamam! Limanı büyüt 🎉'); save(); } }
}

/* --- efektler --- */
function updateFx(dt) {
  var i;
  for (i = flyers.length - 1; i >= 0; i--) { flyers[i].t += dt; if (flyers[i].t >= flyers[i].d) flyers.splice(i, 1); }
  for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 0.85) floats.splice(i, 1); }
  for (i = puffs.length - 1; i >= 0; i--) {
    var p = puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 150 * dt;
    if (p.t > 0.65) puffs.splice(i, 1);
  }
}

/* =========================================================
   ÇİZİM — temel
   ========================================================= */
function rr(x, y, w, h, r) {
  ctx.beginPath(); r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function ell(x, y, rx, ry, col) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
function isoQuad(x, y, w, h, z, fill, stroke, lw) {
  ctx.beginPath();
  ctx.moveTo(pX(x, y), pY(x, y, z));
  ctx.lineTo(pX(x + w, y), pY(x + w, y, z));
  ctx.lineTo(pX(x + w, y + h), pY(x + w, y + h, z));
  ctx.lineTo(pX(x, y + h), pY(x, y + h, z));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function isoBox(x, y, w, h, z0, z1, top, left, right) {
  var bx = x + w, by = y + h;
  ctx.beginPath();
  ctx.moveTo(pX(bx, y), pY(bx, y, z1)); ctx.lineTo(pX(bx, by), pY(bx, by, z1));
  ctx.lineTo(pX(bx, by), pY(bx, by, z0)); ctx.lineTo(pX(bx, y), pY(bx, y, z0));
  ctx.closePath(); ctx.fillStyle = right; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(pX(x, by), pY(x, by, z1)); ctx.lineTo(pX(bx, by), pY(bx, by, z1));
  ctx.lineTo(pX(bx, by), pY(bx, by, z0)); ctx.lineTo(pX(x, by), pY(x, by, z0));
  ctx.closePath(); ctx.fillStyle = left; ctx.fill();
  isoQuad(x, y, w, h, z1, top);
}
function shadow(x, y, r) {
  ctx.save(); ctx.globalAlpha = 0.2;
  ell(pX(x, y), pY(x, y, 0), r * TW * 0.5, r * TH * 0.5, '#0a2a1f'); ctx.restore();
}
function label(x, y, z, text, col) {
  var px = pX(x, y), py = pY(x, y, z);
  var near = dist2(player.x, player.y, x, y);
  ctx.save(); ctx.globalAlpha = near < 2.2 ? 0.3 : (near < 6 ? 0.82 : 1);
  ctx.font = 'bold 11px Verdana'; ctx.textAlign = 'center';
  var w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(9,32,46,.72)'; rr(px - w / 2, py - 13, w, 18, 8); ctx.fill();
  ctx.fillStyle = col || '#eaf6ff'; ctx.fillText(text, px, py); ctx.restore();
}
function badge(px, py, txt, col) {
  ctx.font = 'bold 13px Verdana'; ctx.textAlign = 'center';
  var w = ctx.measureText(txt).width + 13;
  ctx.fillStyle = 'rgba(12,36,52,.88)'; rr(px - w / 2, py - 13, w, 19, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = col || '#ffffff'; ctx.fillText(txt, px, py + 1);
}

/* ---------- eşyalar ---------- */
function drawFishItem(px, py, s, f) {
  var F = FISH[f] || FISH.hamsi;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ell(0, 0, 16, 7, F.col);
  ell(-2, -1.8, 12.5, 4, 'rgba(255,255,255,.45)');
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(21, -6); ctx.lineTo(21, 6); ctx.closePath();
  ctx.fillStyle = F.col; ctx.globalAlpha = 0.82; ctx.fill(); ctx.globalAlpha = 1;
  ell(-9, -1, 2, 2, '#22313b');
  ctx.restore();
}
function drawFiletoItem(px, py, s, f) {
  var F = FISH[f] || FISH.hamsi;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ell(0, 1.6, 15, 7, 'rgba(120,150,170,.55)');
  ell(0, 0, 15, 7, '#eef5f9');
  ell(0, -0.4, 10, 4.4, F.meat);
  ell(0, -0.7, 6, 2.4, 'rgba(255,255,255,.4)');
  ctx.restore();
}
function drawFumeItem(px, py, s, f) {
  var F = FISH[f] || FISH.hamsi;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = '#8d6a45'; rr(-14, -7, 28, 13, 4); ctx.fill();
  ctx.fillStyle = '#a5815a'; rr(-14, -7, 28, 7, 4); ctx.fill();
  ctx.fillStyle = '#f4e7d2'; rr(-7, -5, 14, 9, 2.5); ctx.fill();
  ell(0, -0.5, 4.5, 2.6, F.meat);
  ctx.restore();
}
function drawMoneyItem(px, py, s) {
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = '#2f7d43'; rr(-14, -3, 28, 11, 3); ctx.fill();
  ctx.fillStyle = '#58c46f'; rr(-14, -8, 28, 11, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; rr(-9, -5.5, 18, 6, 2.5); ctx.fill();
  ctx.fillStyle = '#2f7d43'; ctx.font = 'bold 9px Verdana'; ctx.textAlign = 'center'; ctx.fillText('$', 0, -0.6);
  ctx.restore();
}
function drawItem(it, px, py, s) {
  if (!it) return;
  if (it.k === 'fish') drawFishItem(px, py, s, it.f);
  else if (it.k === 'fileto') drawFiletoItem(px, py, s, it.f);
  else if (it.k === 'fume') drawFumeItem(px, py, s, it.f);
  else drawMoneyItem(px, py, s);
}
function drawCrate(px, py, it) {
  ctx.save(); ctx.translate(px, py);
  ctx.fillStyle = '#7d5230'; rr(-20, -20, 40, 22, 4); ctx.fill();
  ctx.fillStyle = '#96643b'; rr(-20, -24, 40, 8, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, -11); ctx.lineTo(20, -11); ctx.stroke();
  ctx.restore();
  drawItem(it, px, py - 30, 0.75);
}

/* GDD §11: en fazla 5 model, sonrası sayaç */
function drawStack(x, y, items, baseZ, gap) {
  var n = items.length; if (!n) return;
  gap = gap || 7.6;
  var px = pX(x, y);
  if (n >= 20) {
    drawCrate(px, pY(x, y, baseZ + 14), items[n - 1]);
    badge(px, pY(x, y, baseZ + 56), '×' + n, '#ffe9a8');
    return;
  }
  var show = Math.min(n, 5);
  for (var i = 0; i < show; i++) {
    var it = items[n - show + i];
    var wob = Math.sin(i * 0.8 + gameT * 1.2) * 1.2;
    drawItem(it, px + wob, pY(x, y, baseZ + i * gap), 0.86);
  }
  if (n > show) badge(px, pY(x, y, baseZ + show * gap + 14), '×' + n, '#ffe9a8');
}

/* ---------- insanlar ---------- */
var SKIN = ['#f0c79a', '#d9a377', '#a9714a'];
var HAIR = ['#22201f', '#3d2b1d', '#171515'];
function drawPerson(a, o) {
  var px = pX(a.x, a.y), py = pY(a.x, a.y, a.z || 0);
  var moving = Math.hypot(a.vx || 0, a.vy || 0) > 0.05 || o.walk;
  var b = moving ? Math.sin(a.bob) * 2.2 : Math.sin(gameT * 2 + (o.seed || 0)) * 0.8;
  var legSw = moving ? Math.sin(a.bob) * 4 : 0;
  shadow(a.x, a.y, 0.42);
  ctx.save(); ctx.translate(px, py - b);
  ctx.fillStyle = o.pants || '#2c3440';
  rr(-8, -16, 7, 18 + legSw * 0.2, 3); ctx.fill();
  rr(1, -16, 7, 18 - legSw * 0.2, 3); ctx.fill();
  ctx.fillStyle = '#1a1f26';
  rr(-9, -2 + legSw * 0.2, 9, 5, 2.5); ctx.fill();
  rr(0, -2 - legSw * 0.2, 9, 5, 2.5); ctx.fill();
  ctx.fillStyle = o.coat || '#f2ede2';
  rr(-12, -40, 24, 26, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.09)'; rr(-12, -22, 24, 8, 5); ctx.fill();
  ctx.fillStyle = o.coat2 || o.coat || '#e6dfd0';
  rr(-16, -38, 7, 19, 3.5); ctx.fill(); rr(9, -38, 7, 19, 3.5); ctx.fill();
  if (o.bag) { ctx.fillStyle = '#4a5a68'; rr(o.face > 0 ? -17 : 10, -36, 8, 16, 3); ctx.fill(); }
  ctx.fillStyle = o.skin || SKIN[0];
  ell(0, -48, 9.5, 9.5, o.skin || SKIN[0]);
  if (o.hood) {
    ctx.fillStyle = o.hoodCol || '#ffffff';
    ctx.beginPath(); ctx.arc(0, -49, 11, Math.PI, 0); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = o.hair || HAIR[0];
    ctx.beginPath(); ctx.arc(0, -50, 10, Math.PI * 1.02, Math.PI * 2 - 0.02); ctx.closePath(); ctx.fill();
    rr(-10, -52, 20, 7, 3); ctx.fill();
  }
  var fx = o.face > 0 ? 1 : -1;
  ell(2.6 * fx, -47, 1.5, 1.9, '#20262c');
  ell(-2.6 * fx + (fx > 0 ? 3 : -3), -47, 1.5, 1.9, '#20262c');
  ctx.strokeStyle = '#20262c'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (o.mood !== undefined && o.mood < 0.45) ctx.arc(1 * fx, -41, 3.4, Math.PI * 1.1, Math.PI * 1.9);
  else ctx.arc(1 * fx, -43.5, 3.2, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
  if (a.carry && a.carry.length) drawStack(a.x, a.y, a.carry, 34 - b, 7.6);
}

function drawCustomer(cu) {
  var t = cu.type;
  drawPerson(cu, {
    coat: t.coat, coat2: t.coat2, pants: '#2b3038', skin: SKIN[cu.tone], hair: HAIR[cu.hair],
    face: cu.face, mood: cu.state === 'wait' ? cu.mood : 1, walk: cu.state !== 'wait', seed: cu.hair
  });
  if (cu.state !== 'wait') return;
  var px = pX(cu.x, cu.y), py = pY(cu.x, cu.y, 0);
  var bx = px + 30, by = py - 76;
  /* sabır halkası */
  ctx.beginPath(); ctx.arc(bx, by, 21, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.stroke();
  ctx.beginPath();
  ctx.arc(bx, by, 21, -Math.PI / 2, -Math.PI / 2 + TAU * cu.mood);
  ctx.strokeStyle = cu.mood > 0.5 ? '#4fc36a' : (cu.mood > 0.25 ? '#ffc23c' : '#ff5b47');
  ctx.lineWidth = 4.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 14, by + 13); ctx.lineTo(bx - 3, by + 24); ctx.lineTo(bx - 2, by + 11);
  ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  if (cu.ord.k === 'fume') drawFumeItem(bx - 1, by - 3, 0.6, cu.ord.f);
  else drawFiletoItem(bx - 1, by - 3, 0.6, cu.ord.f);
  ctx.fillStyle = '#25333c'; ctx.font = 'bold 12px Verdana'; ctx.textAlign = 'center';
  ctx.fillText('×' + (cu.ord.need - cu.ord.got), bx, by + 13);
  if (t.pen) { /* özel müşteri çerçevesi */
    ctx.beginPath(); ctx.arc(bx, by, 25, 0, TAU);
    ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -gameT * 12; ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '13px Verdana'; ctx.fillText('⭐', bx + 22, by - 16);
  }
  if (cu.mood < 0.4) { ctx.font = '15px Verdana'; ctx.fillText('😠', px - 24, py - 62 + Math.sin(gameT * 12) * 1.5); }
}

/* =========================================================
   ÇİZİM — dünya
   ========================================================= */
var shoal = [], deco = [], floes = [];
var _sd = 20260919;
function srnd() { _sd = (_sd * 1664525 + 1013904223) % 4294967296; return _sd / 4294967296; }
(function initWorldArt() {
  var i, x, y, g;
  for (i = 0; i < 620; i++) {
    g = 0; do { x = rnd(-24, 34); y = rnd(-24, 34); g++; } while (x > -1.2 && y > -1.2 && g < 40);
    shoal.push({ x: x, y: y, s: rnd(0.5, 1.05), sp: rnd(0.35, 0.95), ph: rnd(0, TAU) });
  }
  for (i = 0; i < 26; i++) {
    g = 0; do { x = rnd(-22, 30); y = rnd(-22, 30); g++; } while (x > -2 && y > -2 && g < 30);
    floes.push({ x: x, y: y, s: rnd(0.6, 1.6) });
  }
  function free(fx, fy) {
    if (fx < -0.6 || fy < -0.6) return false;
    if (fx < 10.6 && fy < 21.2) return false;
    if (fx < 14.4 && fy < 22.4) return false;
    return true;
  }
  for (x = -1; x < 32; x += 1.28) {
    for (y = -1; y < 36; y += 1.28) {
      var dx = x + srnd() * 0.9 - 0.45, dy = y + srnd() * 0.9 - 0.45;
      if (!free(dx, dy) || srnd() < 0.42) continue;
      deco.push({ x: dx, y: dy, t: srnd() < 0.76 ? 'tree' : 'rock', s: 1.15 + srnd() * 0.85 });
    }
  }
})();

function drawWaterBG() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  var g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#2f7fb8'); g.addColorStop(0.55, '#2069a3'); g.addColorStop(1, '#17527f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}
function drawShoal() {
  for (var i = 0; i < shoal.length; i++) {
    var f = shoal[i];
    f.x += f.sp * 0.0035;
    if (f.x > 34) f.x = -24;
    if (f.x > -1.2 && f.y > -1.2) continue;
    var px = pX(f.x, f.y), py = pY(f.x, f.y, 0) + Math.sin(gameT * 1.6 + f.ph) * 2;
    ctx.globalAlpha = 0.7;
    ell(px, py, 11 * f.s, 4 * f.s, '#0f3d60');
    ctx.beginPath();
    ctx.moveTo(px + 9 * f.s, py); ctx.lineTo(px + 15 * f.s, py - 3.6 * f.s); ctx.lineTo(px + 15 * f.s, py + 3.6 * f.s);
    ctx.closePath(); ctx.fillStyle = '#0f3d60'; ctx.fill();
    ctx.globalAlpha = 0.38;
    ell(px - 2 * f.s, py - 1.8 * f.s, 8 * f.s, 2.4 * f.s, '#b7e2fa');
  }
  ctx.globalAlpha = 1;
}
function drawFloes() {
  for (var i = 0; i < floes.length; i++) {
    var f = floes[i], px = pX(f.x, f.y), py = pY(f.x, f.y, 0) + Math.sin(gameT * 0.7 + f.x) * 2;
    ctx.globalAlpha = 0.85;
    ell(px, py, 26 * f.s, 12 * f.s, '#dceefa');
    ell(px - 3, py - 3, 19 * f.s, 8 * f.s, '#ffffff');
  }
  ctx.globalAlpha = 1;
}
function drawLand() {
  var pts = [[-0.7, -0.7], [70, -0.7], [70, 70], [-0.7, 70]];
  ctx.beginPath();
  ctx.moveTo(pX(pts[0][0], pts[0][1]), pY(pts[0][0], pts[0][1], 0));
  for (var i = 1; i < 4; i++) ctx.lineTo(pX(pts[i][0], pts[i][1]), pY(pts[i][0], pts[i][1], 0));
  ctx.closePath(); ctx.fillStyle = '#eaf3fa'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pX(70, -0.7), pY(70, -0.7, 0)); ctx.lineTo(pX(-0.7, -0.7), pY(-0.7, -0.7, 0));
  ctx.lineTo(pX(-0.7, 70), pY(-0.7, 70, 0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,205,235,.5)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pX(70, -1.15), pY(70, -1.15, 0)); ctx.lineTo(pX(-1.15, -1.15), pY(-1.15, -1.15, 0));
  ctx.lineTo(pX(-1.15, 70), pY(-1.15, 70, 0)); ctx.stroke();
}
function drawZones() {
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i], w = z.x1 - z.x0, h = z.y1 - z.y0;
    if (!z.locked) {
      isoQuad(z.x0, z.y0, w, h, 0, '#e3ac7c');
      isoQuad(z.x0 + 0.1, z.y0 + 0.1, w - 0.2, h - 0.2, 0, 'rgba(255,255,255,.07)');
      ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 1.5;
      for (var k = z.y0 + 1; k < z.y1; k += 1) {
        ctx.beginPath(); ctx.moveTo(pX(z.x0, k), pY(z.x0, k, 0)); ctx.lineTo(pX(z.x1, k), pY(z.x1, k, 0)); ctx.stroke();
      }
      ctx.restore();
    } else {
      isoQuad(z.x0, z.y0, w, h, 0, '#cfdeea');
      ctx.save(); ctx.setLineDash([10, 8]);
      isoQuad(z.x0 + 0.15, z.y0 + 0.15, w - 0.3, h - 0.3, 0, null, 'rgba(90,120,145,.55)', 3);
      ctx.restore();
      var cx = z.x0 + w / 2, cy = z.y0 + h / 2, px = pX(cx, cy), py = pY(cx, cy, 0);
      ctx.save(); ctx.globalAlpha = 0.92;
      ctx.fillStyle = 'rgba(30,55,75,.5)'; rr(px - 62, py - 30, 124, 60, 15); ctx.fill();
      ctx.font = '26px Verdana'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.fillText('🔒', px, py - 2);
      ctx.font = 'bold 13px Verdana'; ctx.fillText(z.name.toUpperCase(), px, py + 20);
      ctx.restore();
    }
  }
}
function fencePost(x, y) {
  var px = pX(x, y), py = pY(x, y, 0);
  ctx.fillStyle = '#a4693c'; rr(px - 7, py - 26, 14, 26, 4); ctx.fill();
  ctx.fillStyle = '#c7884f'; rr(px - 7, py - 26, 8, 26, 4); ctx.fill();
  ell(px, py - 26, 7, 3.4, '#e0b384');
}
function drawTree(d) {
  var px = pX(d.x, d.y), py = pY(d.x, d.y, 0), s = d.s;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.globalAlpha = 0.18; ell(0, 0, 17, 8, '#7d94a6'); ctx.globalAlpha = 1;
  ctx.fillStyle = '#a5683f'; rr(-4, -16, 8, 17, 2); ctx.fill();
  var layers = [[-14, 0, 28, 20], [-11.5, -16, 23, 18], [-8.5, -30, 17, 16]];
  for (var i = 0; i < 3; i++) {
    var L = layers[i], x0 = L[0], y0 = L[1], w = L[2], h = L[3];
    ctx.beginPath(); ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0 + w, y0 + 2); ctx.lineTo(x0, y0 + 2);
    ctx.closePath(); ctx.fillStyle = '#cfe2ee'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0, y0 + 2); ctx.lineTo(0, y0 + 2);
    ctx.closePath(); ctx.fillStyle = '#aec6d6'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0 + w * 0.34, y0 - h * 0.1); ctx.lineTo(x0 + w * 0.12, y0 - h * 0.08);
    ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  ctx.restore();
}
function drawRock(d) {
  var px = pX(d.x, d.y), py = pY(d.x, d.y, 0), s = d.s;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.globalAlpha = 0.16; ell(0, 0, 14, 7, '#7d94a6'); ctx.globalAlpha = 1;
  ell(0, -6, 13, 10, '#b9c9d6'); ell(-2, -9, 10, 7, '#e9f2f8');
  ctx.restore();
}

/* =========================================================
   ÇİZİM — istasyonlar
   ========================================================= */
function drawSpot(s) {
  isoBox(s.x - 0.32, s.y - 0.32, 0.64, 0.64, 0, 30, '#c98b52', '#8d5b32', '#a86f3f');
  var px = pX(s.x, s.y), py = pY(s.x, s.y, 30);
  ell(px, py - 16, 21, 16, '#e9e3b8'); ell(px, py - 20, 19, 13, '#f3eec8');
  ctx.strokeStyle = 'rgba(150,140,90,.55)'; ctx.lineWidth = 1.2;
  for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(px + i * 5, py - 32); ctx.lineTo(px + i * 5, py - 6); ctx.stroke(); }
  ctx.fillStyle = '#a4693c'; rr(px - 4, py - 44, 8, 16, 3); ctx.fill(); rr(px - 13, py - 40, 26, 7, 3); ctx.fill();
  var ex = s.face === 'n' ? s.x + 0.2 : s.x - 3.2, ey = s.face === 'n' ? s.y - 3.2 : s.y + 0.2;
  ctx.strokeStyle = 'rgba(240,238,200,.75)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px, pY(s.x, s.y, 42));
  ctx.quadraticCurveTo((px + pX(ex, ey)) / 2, pY((s.x + ex) / 2, (s.y + ey) / 2, 90 + Math.sin(gameT * 1.4) * 6), pX(ex, ey), pY(ex, ey, 6));
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.5; ell(pX(ex, ey), pY(ex, ey, 0), 30, 15, '#dff0f8'); ctx.restore();
  var cx = s.x - 0.55, cy = s.y + 0.5;
  isoBox(cx, cy, 1.1, 0.9, 0, 12, '#8d5b32', '#6b4425', '#7c4f2b');
  isoQuad(cx + 0.06, cy + 0.06, 0.98, 0.78, 12, '#5f3d21');
  drawStack(s.x, s.y + 0.9, s.stock, 12, 6.6);
  var names = s.pool.map(function (p) { return FISH[p[0]].name; }).join(' / ');
  label(s.x, s.y + 1.85, 16, '🎣 ' + names, '#bfe9ff');
}
function drawTable(tb) {
  isoBox(tb.x - 0.7, tb.y - 0.5, 1.4, 1.0, 0, 26, '#a97448', '#6f4526', '#85552f');
  isoQuad(tb.x - 0.6, tb.y - 0.42, 1.2, 0.84, 26, '#d9c39c');
  var px = pX(tb.x, tb.y), py = pY(tb.x, tb.y, 26);
  var chop = tb.cur ? Math.abs(Math.sin(gameT * (tb.worker ? 13 : 9))) : 0;
  ctx.save(); ctx.translate(px + 10, py - 8 - chop * 14); ctx.rotate(-0.5 - chop * 0.5);
  ctx.fillStyle = '#5a4630'; rr(-3, 0, 6, 12, 2); ctx.fill();
  ctx.fillStyle = '#dfe8ee'; rr(-4, -16, 8, 17, 2); ctx.fill(); ctx.restore();
  if (tb.cur) {
    drawItem(tb.cur, px - 8, py - 8, 0.8);
    var pr = tb.t / FISH[tb.cur.f].cut;
    ctx.fillStyle = 'rgba(0,0,0,.32)'; rr(px - 20, py - 34, 40, 6, 3); ctx.fill();
    ctx.fillStyle = '#7fe08f'; rr(px - 20, py - 34, 40 * clamp(pr, 0, 1), 6, 3); ctx.fill();
  }
  drawStack(tb.x - 0.2, tb.y + 0.15, tb.inn, 26, 6.6);
  label(tb.x, tb.y + 1.15, 16, tb.worker ? '🔪 KESİM ⚡' : '🔪 KESİM', '#ffe6bf');
  isoQuad(tb.mat.x - 0.62, tb.mat.y - 0.52, 1.24, 1.04, 0.5, '#f7fbfd', 'rgba(40,70,90,.4)', 3);
  drawStack(tb.mat.x, tb.mat.y, tb.mat.items, 4, 6.4);
}
function drawSmoker() {
  var s = smoker;
  isoBox(s.x - 0.75, s.y - 0.6, 1.5, 1.2, 0, 34, '#7a4f33', '#4f3120', '#603c26');
  isoQuad(s.x - 0.65, s.y - 0.5, 1.3, 1.0, 34, '#96633f');
  var px = pX(s.x, s.y), py = pY(s.x, s.y, 34);
  ctx.fillStyle = '#5b3a26'; rr(px - 9, py - 30, 18, 30, 4); ctx.fill();
  ctx.fillStyle = '#6f4830'; rr(px - 9, py - 30, 9, 30, 4); ctx.fill();
  /* duman */
  if (s.cur) {
    for (var i = 0; i < 4; i++) {
      var t = (gameT * 0.55 + i * 0.25) % 1;
      ctx.globalAlpha = (1 - t) * 0.5;
      ell(px + Math.sin(t * 5 + i) * 9, py - 34 - t * 52, 8 + t * 13, 6 + t * 10, '#e8e2d8');
    }
    ctx.globalAlpha = 1;
    var pr = s.t / FUME_TIME;
    ctx.fillStyle = 'rgba(0,0,0,.32)'; rr(px - 20, py - 44, 40, 6, 3); ctx.fill();
    ctx.fillStyle = '#ffbe6a'; rr(px - 20, py - 44, 40 * clamp(pr, 0, 1), 6, 3); ctx.fill();
  }
  /* ateş */
  ctx.fillStyle = 'rgba(255,150,60,' + (0.55 + Math.sin(gameT * 9) * 0.2) + ')';
  rr(px - 7, py - 6, 14, 6, 3); ctx.fill();
  drawStack(s.x + 0.35, s.y + 0.35, s.inn, 34, 6.4);
  label(s.x, s.y + 1.35, 24, 'FÜMEHANE 🔥', '#ffd3a0');
  isoQuad(s.mat.x - 0.62, s.mat.y - 0.52, 1.24, 1.04, 0.5, '#f2e4cf', 'rgba(110,80,50,.5)', 3);
  drawStack(s.mat.x, s.mat.y, s.mat.items, 4, 6.4);
}
function drawCounter(c) {
  isoBox(c.x - 0.55, c.y - 1.1, 1.1, 2.2, 0, 28, '#c08a52', '#7d4f2b', '#95602f');
  isoQuad(c.x - 0.48, c.y - 1.02, 0.96, 2.04, 28, '#e0bb8a');
  drawStack(c.x, c.y, c.buffer, 28, 6.4);
  label(c.x, c.y - 1.55, 10, '🍣 ' + c.buffer.length + '/' + c.max, '#ffd9a8');
  var tr = c.tray;
  isoQuad(tr.x - 0.62, tr.y - 0.52, 1.24, 1.04, 0.5, '#d8ecdc', '#4fbf6d', 3);
  drawStack(tr.x, tr.y, tr.items, 4, 6.6);
  if (tr.items.length) label(tr.x, tr.y + 0.9, 6, '💵 AL', '#9df5b0');
}
function drawSafe() {
  var pop = safe.pop * 5;
  isoBox(safe.x - 0.52, safe.y - 0.52, 1.04, 1.04, 0, 22 + pop, '#3f8f56', '#22603a', '#2d7546');
  isoQuad(safe.x - 0.44, safe.y - 0.44, 0.88, 0.88, 22 + pop, '#5fc47a');
  var px = pX(safe.x, safe.y), py = pY(safe.x, safe.y, 22 + pop);
  ctx.fillStyle = '#25693c'; rr(px - 16, py - 4, 32, 7, 3); ctx.fill();
  ctx.fillStyle = '#e9ffe9'; ctx.font = 'bold 20px Verdana'; ctx.textAlign = 'center';
  ctx.fillText('$', px, py + 22);
  label(safe.x, safe.y, 64 + pop, '🏦 KASA', '#b7f7c7');
}

/* --- yükseltme alanı: yaklaşınca açılan kart (GDD §12.2) --- */
function padInfo(p) {
  if (p.kind === 'cap') return { t: 'KAPASİTE', e: '+3 taşıma' };
  if (p.kind === 'spd') return { t: 'HIZ', e: '+%11 koşu' };
  if (p.kind === 'price') return { t: 'PAZARLIK', e: '+%10 fiyat' };
  if (p.kind === 'zone') return { t: ZONES[p.target].name.toUpperCase(), e: 'yeni bölge' };
  return { t: ROLES[p.role].name.toUpperCase(), e: ROLES[p.role].desc + ' • ' + money(ROLES[p.role].wage) + '/dk' };
}
function drawPad(p) {
  if (ZONES[p.zone].locked) return;
  var w = 1.5, h = 1.2, x = p.x - w / 2, y = p.y - h / 2;
  var px = pX(p.x, p.y);
  var pulse = 0.5 + 0.5 * Math.sin(gameT * 3);
  if (p.lvl >= p.max) {
    isoQuad(x, y, w, h, 0.4, 'rgba(120,150,170,.22)', 'rgba(255,255,255,.22)', 2);
    ctx.font = '17px Verdana'; ctx.textAlign = 'center'; ctx.fillStyle = '#cfe9ff';
    ctx.fillText('✔', px, pY(p.x, p.y, 18));
    return;
  }
  var blocked = padBlocked(p);
  isoQuad(x, y, w, h, 0.4, 'rgba(40,60,75,.42)');
  var frac = p.paid / p.price;
  if (frac > 0) isoQuad(x, y, w, h * clamp(frac, 0.02, 1), 0.5, 'rgba(110,224,138,.65)');
  ctx.save(); ctx.setLineDash([9, 7]); ctx.lineDashOffset = -gameT * 14;
  isoQuad(x, y, w, h, 0.6, null, blocked ? 'rgba(180,195,205,.5)' : 'rgba(255,240,170,' + (0.5 + pulse * 0.45) + ')', 3);
  ctx.restore();
  ctx.font = '21px Verdana'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
  ctx.fillText(p.icon, px, pY(p.x, p.y, 24 + pulse * 3));
}

/* yalnız en yakın alan için tam kart (oyuncunun üstünde) */
function drawPadCard(p) {
  if (!p || ZONES[p.zone].locked) return;
  var px = pX(p.x, p.y), py = pY(p.x, p.y, 98 + Math.sin(gameT * 3) * 2);
  var info = padInfo(p), blocked = padBlocked(p);
  var rest = Math.max(0, p.price - p.paid);
  var afford = S.cash > 0 && !blocked;
  ctx.textAlign = 'center';
  ctx.font = 'bold 12.5px Verdana';
  var title = info.t + (p.max > 1 ? '  Lv.' + p.lvl + '→' + (p.lvl + 1) : '');
  var cw = ctx.measureText(title).width;
  ctx.font = '10.5px Verdana';
  cw = Math.max(cw, ctx.measureText(info.e).width, 86) + 24;
  ctx.fillStyle = 'rgba(9,32,46,.9)'; rr(px - cw / 2, py - 36, cw, 56, 12); ctx.fill();
  ctx.strokeStyle = blocked ? 'rgba(200,210,220,.4)' : (afford ? 'rgba(126,224,143,.8)' : 'rgba(255,214,110,.55)');
  ctx.lineWidth = 2.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px - 7, py + 19); ctx.lineTo(px, py + 28); ctx.lineTo(px + 7, py + 19);
  ctx.closePath(); ctx.fillStyle = 'rgba(9,32,46,.9)'; ctx.fill();
  ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 12.5px Verdana'; ctx.fillText(title, px, py - 20);
  ctx.fillStyle = 'rgba(220,236,248,.82)'; ctx.font = '10.5px Verdana'; ctx.fillText(info.e, px, py - 5);
  if (blocked) {
    ctx.fillStyle = '#ffb0a0'; ctx.font = 'bold 12px Verdana';
    ctx.fillText('⭐ ' + p.rep + ' itibar gerekli (' + S.rep + ')', px, py + 12);
  } else {
    ctx.fillStyle = afford ? '#8ef2a2' : '#ffb0a0'; ctx.font = 'bold 13.5px Verdana';
    ctx.fillText(money(rest) + (p.rep ? '  ⭐' + p.rep : ''), px, py + 12);
  }
}

/* --- efekt çizimleri --- */
function drawFlyers() {
  for (var i = 0; i < flyers.length; i++) {
    var f = flyers[i], t = clamp(f.t / f.d, 0, 1);
    var x = lerp(f.x0, f.x1, t), y = lerp(f.y0, f.y1, t);
    var z = lerp(f.z0, f.z1, t) + Math.sin(t * Math.PI) * f.h;
    drawItem(f.it, pX(x, y), pY(x, y, z), 0.9);
  }
}
function drawFloats() {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i], t = f.t / 0.85;
    ctx.globalAlpha = 1 - t * t;
    ctx.font = 'bold 17px Verdana'; ctx.textAlign = 'center';
    var px = pX(f.x, f.y), py = pY(f.x, f.y, 60 + t * 44);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 4;
    ctx.strokeText(f.txt, px, py); ctx.fillStyle = f.col; ctx.fillText(f.txt, px, py);
  }
  ctx.globalAlpha = 1;
}
function drawPuffs() {
  for (var i = 0; i < puffs.length; i++) {
    var p = puffs[i];
    ctx.globalAlpha = clamp(1 - p.t / 0.65, 0, 1) * 0.85;
    ell(pX(p.x, p.y), pY(p.x, p.y, p.z), 4.5, 4.5, p.col);
  }
  ctx.globalAlpha = 1;
}

/* =========================================================
   SAHNE
   ========================================================= */
function tutorialTarget() {
  if (S.tut >= TUT.length) return null;
  var t = S.tut;
  if (t === 0 || t === 1) return { x: spots[0].x, y: spots[0].y + 0.9 };
  if (t === 2) return { x: tables[0].x, y: tables[0].y };
  if (t === 3) return hasCarry(player, isGoods) ? { x: counters[0].x, y: counters[0].y } : { x: tables[0].mat.x, y: tables[0].mat.y };
  if (t === 4) return hasCarry(player, isMoney) ? { x: safe.x, y: safe.y } : { x: counters[0].tray.x, y: counters[0].tray.y };
  return { x: PADS[0].x, y: PADS[0].y };
}
function drawArrow(tg) {
  var px = pX(tg.x, tg.y), py = pY(tg.x, tg.y, 66 + Math.sin(gameT * 4) * 7);
  ctx.save();
  ctx.fillStyle = '#ffd76a'; ctx.strokeStyle = 'rgba(80,50,0,.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py + 16); ctx.lineTo(px - 13, py - 4); ctx.lineTo(px - 5, py - 4);
  ctx.lineTo(px - 5, py - 18); ctx.lineTo(px + 5, py - 18); ctx.lineTo(px + 5, py - 4);
  ctx.lineTo(px + 13, py - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function render() {
  drawWaterBG();
  ctx.save();
  ctx.translate(VW / 2, VH * 0.44); ctx.scale(ZOOM, ZOOM); ctx.translate(-camX, -camY);

  drawShoal(); drawFloes(); drawLand(); drawZones();

  var list = [], i;
  function push(d, fn) { list.push({ d: d, f: fn }); }

  for (i = 0; i < deco.length; i++) (function (d) {
    push(d.x + d.y - 0.2, function () { d.t === 'tree' ? drawTree(d) : drawRock(d); });
  })(deco[i]);
  for (i = 0; i < PADS.length; i++) (function (p) { push(p.x + p.y - 0.9, function () { drawPad(p); }); })(PADS[i]);
  for (i = 0; i < spots.length; i++) (function (s) {
    if (ZONES[s.zone].locked) return; push(s.x + s.y, function () { drawSpot(s); });
  })(spots[i]);
  for (i = 0; i < tables.length; i++) (function (t) {
    if (ZONES[t.zone].locked) return; push(t.x + t.y, function () { drawTable(t); });
  })(tables[i]);
  if (!ZONES[smoker.zone].locked) push(smoker.x + smoker.y, drawSmoker);
  for (i = 0; i < counters.length; i++) (function (c) {
    if (ZONES[c.zone].locked) return; push(c.x + c.y, function () { drawCounter(c); });
  })(counters[i]);
  push(safe.x + safe.y, drawSafe);

  var maxY = maxOpenY();
  for (i = 0; i < maxY; i += 0.62) (function (yy) {
    var gap = false;
    for (var k = 0; k < counters.length; k++) {
      if (ZONES[counters[k].zone].locked) continue;
      if (Math.abs(yy - counters[k].y) < 1.2) gap = true;
    }
    if (!gap) push(9.95 + yy, function () { fencePost(9.95, yy); });
  })(i);
  for (i = 0; i <= 9.95; i += 0.62) (function (xx) {
    push(xx + maxY - 0.05, function () { fencePost(xx, maxY - 0.05); });
  })(i);

  for (i = 0; i < customers.length; i++) (function (cu) { push(cu.x + cu.y + 0.2, function () { drawCustomer(cu); }); })(customers[i]);
  for (i = 0; i < workers.length; i++) (function (w) {
    var R = ROLES[w.role];
    var col = w.role === 'hamal' ? '#7fd3f0' : w.role === 'filetocu' ? '#c3e88d' : w.role === 'tezgahtar' ? '#f3a0c8' : '#ffd88a';
    push(w.x + w.y + 0.15, function () {
      drawPerson(w, { coat: col, coat2: col, pants: '#2c3440', skin: SKIN[1], hood: true, hoodCol: '#f4fbff', face: w.face, bag: true, seed: 2 });
      var px = pX(w.x, w.y), py = pY(w.x, w.y, 74);
      ctx.font = '13px Verdana'; ctx.textAlign = 'center'; ctx.fillText(R.icon, px, py);
    });
  })(workers[i]);
  push(player.x + player.y + 0.25, function () {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,214,110,.9)'; ctx.lineWidth = 3.2;
    ctx.setLineDash([8, 7]); ctx.lineDashOffset = -gameT * 16;
    ctx.beginPath(); ctx.ellipse(pX(player.x, player.y), pY(player.x, player.y, 0), 27, 13.5, 0, 0, TAU);
    ctx.stroke(); ctx.restore();
    drawPerson(player, { coat: '#f7f3e8', coat2: '#e7e0cf', pants: '#33404d', skin: SKIN[0], hood: true, hoodCol: '#ffffff', face: player.face, bag: true });
  });

  list.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < list.length; i++) list[i].f();

  drawPadCard(nearestPad);
  var tg = tutorialTarget();
  if (tg && S.started) drawArrow(tg);

  drawFlyers(); drawPuffs(); drawFloats();
  ctx.restore();

  if (stick.active) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 0.26; ell(stick.bx, stick.by, 54, 54, '#ffffff');
    ctx.globalAlpha = 0.48; ell(stick.bx + stick.dx * 42, stick.by + stick.dy * 42, 26, 26, '#ffffff');
    ctx.globalAlpha = 1;
  }
}

/* =========================================================
   HUD
   ========================================================= */
var el = {};
['money', 'carry', 'carryIcon', 'rep', 'repfill', 'eventChip', 'eventIcon', 'eventName', 'eventT',
 'objText', 'queueHint', 'toast', 'objective'].forEach(function (id) { el[id] = document.getElementById(id); });
var toastT = 0;
function toast(msg) { el.toast.textContent = msg; el.toast.classList.add('on'); toastT = 2.6; }

function urgentOrder() {
  var best = null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (ZONES[c.zone].locked) continue;
    for (var k = 0; k < c.slots.length; k++) {
      var cu = c.slots[k];
      if (cu && cu.state === 'wait' && (!best || cu.pat < best.pat)) best = cu;
    }
  }
  return best;
}
function waitingCount() {
  var n = 0;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (ZONES[c.zone].locked) continue;
    for (var k = 0; k < c.slots.length; k++) if (c.slots[k] && c.slots[k].state === 'wait') n++;
  }
  return n;
}
function carryIcon() {
  var n = { fish: 0, fileto: 0, fume: 0, money: 0 };
  for (var i = 0; i < player.carry.length; i++) n[player.carry[i].k]++;
  if (!player.carry.length) return '🎒';
  var top = 'fish';
  for (var k in n) if (n[k] > n[top]) top = k;
  return top === 'fish' ? '🐟' : top === 'fileto' ? '🍣' : top === 'fume' ? '🔥' : '💵';
}
function syncHUD(dt) {
  el.money.textContent = Math.round(S.cash).toLocaleString('tr-TR');
  el.carry.textContent = carryW(player) + '/' + capacity();
  el.carryIcon.textContent = carryIcon();
  el.rep.textContent = S.rep;
  var lvl = repLevel(), cur = REP_LEVELS[lvl - 1].need, nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl].need : cur + 1;
  el.repfill.style.width = clamp((S.rep - cur) / (nxt - cur) * 100, 0, 100) + '%';

  if (event) {
    el.eventChip.classList.remove('hidden');
    el.eventIcon.textContent = event.icon;
    el.eventName.textContent = event.name.toUpperCase();
    el.eventT.textContent = Math.ceil(eventT) + 's';
  } else el.eventChip.classList.add('hidden');

  if (S.tut < TUT.length) {
    el.objective.querySelector('.lbl').textContent = 'HEDEF ' + (S.tut + 1) + '/' + TUT.length;
    el.objText.textContent = TUT[S.tut].txt;
  } else {
    var o = urgentOrder();
    if (o) {
      el.objective.querySelector('.lbl').textContent = o.type.name.toUpperCase() + ' SİPARİŞİ';
      el.objText.textContent = prodName(o.ord.k, o.ord.f) + ' ×' + (o.ord.need - o.ord.got) + ' • ' + Math.ceil(o.pat) + 'sn';
    } else {
      el.objective.querySelector('.lbl').textContent = repTitle().toUpperCase();
      el.objText.textContent = 'Stok hazırla — müşteri yolda';
    }
  }
  var w = waitingCount();
  if (w >= 4) { el.queueHint.classList.remove('hidden'); el.queueHint.textContent = '⏳ ' + w + ' müşteri bekliyor'; }
  else el.queueHint.classList.add('hidden');

  if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('on'); }
}

/* ---------------- menü ---------------- */
var tabBody = document.getElementById('tabBody');
var curTab = 'isletme';
function row(ic, title, sub, val, val2) {
  return '<div class="row"><div class="ic">' + ic + '</div><div class="tx">' + title +
    (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="vl">' + (val || '') +
    (val2 ? '<small>' + val2 + '</small>' : '') + '</div></div>';
}
function renderTab() {
  var h = '', i;
  if (curTab === 'isletme') {
    var lvl = repLevel(), nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl] : null;
    h += row('⭐', repTitle(), nxt ? ('Sonraki: ' + nxt.title + ' — ' + nxt.need + ' itibar') : 'En üst seviye', S.rep + ' ⭐');
    h += row('💵', 'Kasa', 'Maaş gideri: ' + money(wageTotal()) + '/dk', money(S.cash));
    h += row('🧾', 'Tamamlanan sipariş', 'Kaçan müşteri: ' + S.lost, S.served + '');
    h += row('🐟', 'Tutulan balık', 'Aktif olay: ' + (event ? event.name : 'yok'), S.caught + '');
    for (i = 0; i < ZONES.length; i++) h += row(ZONES[i].locked ? '🔒' : '✅', ZONES[i].name, ZONES[i].locked ? (money(ZONES[i].price) + ' + ' + ZONES[i].rep + ' itibar') : 'açık', '');
  } else if (curTab === 'personel') {
    if (!workers.length) h += '<div class="empty">Henüz çalışanın yok.<br>Haritadaki 🧺 / 🔪 / 🍣 / 💵 alanlarında bekleyerek işe al.</div>';
    for (i = 0; i < workers.length; i++) {
      var w = workers[i], R = ROLES[w.role];
      h += row(R.icon, w.name + ' — ' + R.name, R.desc, money(R.wage) + '/dk', 'taşıma ' + carryW(w) + '/' + R.cap);
    }
    if (workers.length) h += row('💸', 'Toplam maaş', 'Saniye başına kasadan düşer', money(wageTotal()) + '/dk');
  } else if (curTab === 'urunler') {
    for (i = 0; i < FISH_ORDER.length; i++) {
      var F = FISH[FISH_ORDER[i]];
      var open = false;
      for (var s = 0; s < spots.length; s++) {
        if (ZONES[spots[s].zone].locked) continue;
        for (var p = 0; p < spots[s].pool.length; p++) if (spots[s].pool[p][0] === F.id) open = true;
      }
      h += row(open ? '🐟' : '🔒', F.name + ' <span style="opacity:.6">(' + F.rare + ')</span>',
        'ağırlık ' + F.w + ' • kesim ' + F.cut.toFixed(2) + 'sn • ' + F.out + ' fileto',
        money(prodValue('fileto', F.id)), 'füme ' + money(prodValue('fume', F.id)));
    }
  } else {
    h += row('🕹️', 'Kontrol', 'W A S D / yön tuşları — ya da ekrana bas & sürükle', '');
    h += row('🎣', 'Döngü', 'Ağ → kesim → tezgâh → kasa', '');
    h += row('🔥', 'Füme hattı', 'Fileto → fümehane → 2.4× değer', '');
    h += row('⭐', 'İtibar', 'Sipariş tamamla; VIP/Şef kaçarsa itibar düşer', '');
    h += '<div class="row" style="cursor:pointer" id="sndRow"><div class="ic">' + (soundOn ? '🔊' : '🔇') +
      '</div><div class="tx">Ses<small>Dokun: aç / kapat</small></div><div class="vl">' + (soundOn ? 'AÇIK' : 'KAPALI') + '</div></div>';
  }
  tabBody.innerHTML = h;
  var sr = document.getElementById('sndRow');
  if (sr) sr.onclick = function () { soundOn = !soundOn; renderTab(); };
}
Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
  b.onclick = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); curTab = b.dataset.t; renderTab();
  };
});
document.getElementById('menuBtn').onclick = function () {
  renderTab(); document.getElementById('menuScreen').classList.remove('hidden');
};
document.getElementById('closeMenu').onclick = function () {
  document.getElementById('menuScreen').classList.add('hidden');
};
document.getElementById('resetBtn').onclick = function () {
  if (confirm('Tüm ilerleme silinsin mi?')) wipe();
};

/* =========================================================
   DÖNGÜ
   ========================================================= */
var last = 0, saveT = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  var dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  if (!S.started) { render(); return; }
  gameT += dt;

  updatePlayer(dt);
  updateWorkers(dt);
  updateStations(dt);
  updateCustomers(dt);
  updatePads(dt);
  updateEvents(dt);
  updateTutorial();
  updateFx(dt);

  /* maaşlar (GDD §13) */
  if (workers.length) S.cash = Math.max(0, S.cash - wageTotal() / 60 * dt);

  var tx = pX(player.x, player.y), ty = pY(player.x, player.y, 0);
  var k = 1 - Math.pow(0.0015, dt);
  camX = lerp(camX, tx, k); camY = lerp(camY, ty, k);

  syncHUD(dt);
  saveT += dt; if (saveT > 6) { saveT = 0; save(); }
  render();
}

function start() {
  document.getElementById('startScreen').classList.add('hidden');
  S.started = true;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
}
document.getElementById('playBtn').onclick = start;
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

resize();
load();
lastRepLvl = repLevel();
camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
requestAnimationFrame(frame);

/* geliştirici kancası */
window.BT = {
  S: S, player: player, spots: spots, tables: tables, smoker: smoker, counters: counters,
  pads: PADS, zones: ZONES, workers: workers, customers: customers, FISH: FISH, CUST: CUST,
  start: start, hire: hire, toast: toast, events: EVENTS,
  setEvent: function (id) { event = EVENTS.filter(function (e) { return e.id === id; })[0]; eventT = event.dur; }
};

})();
