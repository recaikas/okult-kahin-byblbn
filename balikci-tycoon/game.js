/* =========================================================
   BALIKÇI TYCOON  —  izometrik idle/tycoon balıkçı oyunu
   Tek dosya, bağımlılık yok. (c) 2026
   ========================================================= */
(function () {
'use strict';

/* ---------------- yardımcı matematik ---------------- */
var TAU = Math.PI * 2;
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function irnd(a, b) { return Math.floor(rnd(a, b + 1)); }
function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function money(n) { return '$' + Math.floor(n).toLocaleString('tr-TR'); }

/* ---------------- canvas ---------------- */
var cvs = document.getElementById('game');
var ctx = cvs.getContext('2d');
var DPR = 1, VW = 0, VH = 0, ZOOM = 1;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = cvs.clientWidth || window.innerWidth;
  VH = cvs.clientHeight || window.innerHeight;
  cvs.width = Math.round(VW * DPR);
  cvs.height = Math.round(VH * DPR);
  ZOOM = clamp(Math.min(VW, VH * 0.8) / 440, 0.7, 1.45);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function () { setTimeout(resize, 120); });

/* izometrik projeksiyon */
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

var stick = { active: false, id: -1, bx: 0, by: 0, cx: 0, cy: 0, dx: 0, dy: 0 };
function stickStart(id, x, y) { stick.active = true; stick.id = id; stick.bx = x; stick.by = y; stick.cx = x; stick.cy = y; stick.dx = 0; stick.dy = 0; }
function stickMove(x, y) {
  var dx = x - stick.bx, dy = y - stick.by, L = Math.hypot(dx, dy), R = 64;
  if (L > R) { stick.bx += dx * (1 - R / L); stick.by += dy * (1 - R / L); dx = x - stick.bx; dy = y - stick.by; L = R; }
  stick.cx = x; stick.cy = y;
  stick.dx = L > 6 ? dx / R : 0; stick.dy = L > 6 ? dy / R : 0;
}
function stickEnd() { stick.active = false; stick.id = -1; stick.dx = 0; stick.dy = 0; }
cvs.addEventListener('pointerdown', function (e) { cvs.setPointerCapture(e.pointerId); stickStart(e.pointerId, e.clientX, e.clientY); });
cvs.addEventListener('pointermove', function (e) { if (stick.active && e.pointerId === stick.id) stickMove(e.clientX, e.clientY); });
cvs.addEventListener('pointerup', function (e) { if (e.pointerId === stick.id) stickEnd(); });
cvs.addEventListener('pointercancel', stickEnd);
cvs.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------------- ses (mini synth) ---------------- */
var AC = null, soundOn = true;
function beep(freq, dur, type, vol) {
  if (!soundOn) return;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.value = vol || 0.05;
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.1));
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + (dur || 0.1));
  } catch (e) { /* yok say */ }
}
var sfx = {
  pick: function () { beep(660 + Math.random() * 90, 0.07, 'triangle', 0.035); },
  drop: function () { beep(330 + Math.random() * 50, 0.07, 'square', 0.025); },
  coin: function () { beep(880, 0.09, 'triangle', 0.05); setTimeout(function () { beep(1320, 0.09, 'triangle', 0.04); }, 60); },
  buy:  function () { beep(520, 0.12, 'sawtooth', 0.04); setTimeout(function () { beep(780, 0.16, 'sawtooth', 0.04); }, 90); },
  angry:function () { beep(180, 0.18, 'sawtooth', 0.03); }
};

/* ---------------- ayarlar ---------------- */
var CFG = {
  baseSpeed: 3.25,        // kare/sn
  baseCap: 7,
  spotInterval: 1.05,     // saniye/balık
  spotMax: 16,
  cutTime: 0.5,
  tableMax: 14,
  matMax: 18,
  basePrice: 9,           // fileto başına
  custEvery: 5.0,
  patience: 55,
  pickDelay: 0.075,
  helperSpeed: 2.5,
  helperCap: 6
};

/* ---------------- dünya ---------------- */
var ZONES = [
  { x0: 0, y0: 0,  x1: 10, y1: 6,    locked: false, price: 0 },
  { x0: 0, y0: 6,  x1: 10, y1: 12,   locked: true,  price: 320 },
  { x0: 0, y0: 12, x1: 10, y1: 17.5, locked: true,  price: 980 }
];

var spots = [
  { zone: 0, x: 2.3, y: 0.9,  face: 'n', stock: 0, t: 0 },
  { zone: 1, x: 1.0, y: 7.7,  face: 'w', stock: 0, t: 0 },
  { zone: 2, x: 1.0, y: 13.7, face: 'w', stock: 0, t: 0 }
];

var tables = [
  { zone: 0, x: 5.3, y: 2.0,  inn: 0, t: 0, mat: { x: 6.6, y: 3.0,  n: 0 } },
  { zone: 1, x: 4.3, y: 8.1,  inn: 0, t: 0, mat: { x: 5.6, y: 9.1,  n: 0 } },
  { zone: 2, x: 4.3, y: 14.1, inn: 0, t: 0, mat: { x: 5.6, y: 15.1, n: 0 } }
];

function mkCounter(zone, x, y) {
  return {
    zone: zone, x: x, y: y, buffer: 0, max: 22,
    slots: [null, null, null, null],
    tray: { x: x - 0.55, y: y + 1.45, items: [] },
    spawnT: 2 + zone * 1.5, eatT: 0
  };
}
var counters = [mkCounter(0, 8.9, 3.2), mkCounter(1, 8.9, 9.2), mkCounter(2, 8.9, 15.0)];

var safe = { zone: 0, x: 1.35, y: 4.85, pop: 0 };

var PADS = [
  { id: 'cap', zone: 0, x: 1.15, y: 1.55, kind: 'cap',   label: 'KAPASİTE', price: 110, growth: 1.62, lvl: 0, max: 9,  paid: 0 },
  { id: 'spd', zone: 0, x: 1.15, y: 3.15, kind: 'spd',   label: 'HIZ',      price: 150, growth: 1.70, lvl: 0, max: 6,  paid: 0 },
  { id: 'z1',  zone: 0, x: 4.8, y: 5.2, kind: 'zone',  target: 1, label: 'YENİ ALAN', price: 320, growth: 1, lvl: 0, max: 1, paid: 0 },
  { id: 'hh',  zone: 1, x: 7.7, y: 7.0, kind: 'help',  role: 'hauler', label: 'BALIKÇI ÇIRAK', price: 430, growth: 2.1, lvl: 0, max: 3, paid: 0 },
  { id: 'z2',  zone: 1, x: 4.8, y: 11.2, kind: 'zone', target: 2, label: 'YENİ ALAN', price: 980, growth: 1, lvl: 0, max: 1, paid: 0 },
  { id: 'hs',  zone: 2, x: 7.7, y: 13.0, kind: 'help', role: 'server', label: 'SERVİS ÇIRAK', price: 760, growth: 2.1, lvl: 0, max: 3, paid: 0 },
  { id: 'pr',  zone: 2, x: 2.6, y: 16.4, kind: 'price', label: 'FİYAT', price: 620, growth: 1.85, lvl: 0, max: 8, paid: 0 }
];

/* ---------------- durum ---------------- */
var S = {
  cash: 0, capLvl: 0, spdLvl: 0, priceLvl: 0,
  started: false, time: 0, served: 0, caught: 0
};

var player = {
  x: 4.5, y: 3.2, z: 0, vx: 0, vy: 0, bob: 0, face: 1,
  carry: { type: null, n: 0, value: 0 }, act: 0, isPlayer: true
};
var helpers = [];
var customers = [];
var flyers = [];
var floats = [];
var puffs = [];

function capacity() { return CFG.baseCap + S.capLvl * 2; }
function speed() { return CFG.baseSpeed * Math.pow(1.11, S.spdLvl); }
function steakPrice() { return CFG.basePrice + S.priceLvl * 4; }

/* ---------------- kayıt ---------------- */
var SAVE_KEY = 'balikci_tycoon_v1';
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      cash: S.cash, capLvl: S.capLvl, spdLvl: S.spdLvl, priceLvl: S.priceLvl,
      served: S.served, caught: S.caught,
      zones: ZONES.map(function (z) { return z.locked ? 1 : 0; }),
      pads: PADS.map(function (p) { return [p.paid, p.lvl, p.price]; }),
      helpers: helpers.map(function (h) { return h.role; })
    }));
  } catch (e) { }
}
function load() {
  try {
    var raw = localStorage.getItem(SAVE_KEY); if (!raw) return;
    var d = JSON.parse(raw);
    S.cash = d.cash || 0; S.capLvl = d.capLvl || 0; S.spdLvl = d.spdLvl || 0;
    S.priceLvl = d.priceLvl || 0; S.served = d.served || 0; S.caught = d.caught || 0;
    if (d.zones) d.zones.forEach(function (v, i) { if (ZONES[i]) ZONES[i].locked = !!v; });
    if (d.pads) d.pads.forEach(function (v, i) { if (PADS[i]) { PADS[i].paid = v[0]; PADS[i].lvl = v[1]; PADS[i].price = v[2]; } });
    if (d.helpers) d.helpers.forEach(function (r) { addHelper(r, true); });
  } catch (e) { }
}
function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); }

/* ---------------- HUD ---------------- */
var elMoney = document.getElementById('money');
var elCarry = document.getElementById('carry');
var elCarryIcon = document.getElementById('carryIcon');
var elToast = document.getElementById('toast');
var toastT = 0;
function toast(msg) {
  elToast.textContent = msg; elToast.classList.add('on'); toastT = 2.4;
}

/* =========================================================
   MANTIK
   ========================================================= */

function zoneOpen(i) { return !ZONES[i].locked; }
function maxOpenY() { var m = 0; for (var i = 0; i < ZONES.length; i++) if (!ZONES[i].locked) m = Math.max(m, ZONES[i].y1); return m; }

function canStand(x, y) {
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i]; if (z.locked) continue;
    if (x > z.x0 + 0.35 && x < z.x1 - 0.35 && y > z.y0 - 0.02 && y < z.y1 + 0.02) return true;
  }
  return false;
}

function addFloat(x, y, txt, col) { floats.push({ x: x, y: y, t: 0, txt: txt, col: col || '#fff' }); }
function addPuff(x, y, col) { for (var i = 0; i < 6; i++) puffs.push({ x: x, y: y, z: rnd(10, 26), vx: rnd(-.6, .6), vy: rnd(-.6, .6), vz: rnd(30, 70), t: 0, col: col || '#fff' }); }
function fly(x0, y0, z0, x1, y1, z1, kind, dur) {
  flyers.push({ x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, k: kind, t: 0, d: dur || 0.42, h: rnd(48, 74) });
}

function addHelper(role, silent) {
  var h = {
    role: role, x: 5 + rnd(-1, 1), y: (role === 'hauler' ? 3 : 4) + rnd(-1, 1), z: 0,
    carry: { type: null, n: 0, value: 0 }, act: 0, bob: 0, face: 1, task: null, cap: CFG.helperCap
  };
  helpers.push(h);
  if (!silent) { toast(role === 'hauler' ? 'Balıkçı çırak işe alındı! 🎣' : 'Servis çırağı işe alındı! 🍣'); }
  return h;
}

/* --- taşıma yardımcıları --- */
function canTake(a, type) { return a.carry.n < (a.isPlayer ? capacity() : a.cap) && (a.carry.type === null || a.carry.type === type); }
function take(a, type, val) { a.carry.type = type; a.carry.n++; a.carry.value += (val || 0); }
function emptyIf(a) { if (a.carry.n <= 0) { a.carry.type = null; a.carry.value = 0; } }
function carryTopZ(a, i) { return 34 + i * 7.5; }

/* --- aktör hareketi --- */
function moveActor(a, dx, dy, spd, dt) {
  var L = Math.hypot(dx, dy);
  if (L < 0.001) { a.vx = lerp(a.vx, 0, 0.3); a.vy = lerp(a.vy, 0, 0.3); return false; }
  dx /= L; dy /= L;
  var nx = a.x + dx * spd * dt, ny = a.y + dy * spd * dt;
  if (canStand(nx, a.y)) a.x = nx;
  if (canStand(a.x, ny)) a.y = ny;
  a.vx = dx; a.vy = dy;
  a.face = (pX(dx, dy) >= 0) ? 1 : -1;
  a.bob += dt * 13;
  return true;
}
function goTo(a, tx, ty, spd, dt, stopR) {
  var dx = tx - a.x, dy = ty - a.y, L = Math.hypot(dx, dy);
  if (L <= (stopR || 0.5)) { moveActor(a, 0, 0, spd, dt); return true; }
  moveActor(a, dx, dy, spd, dt);
  return false;
}

/* --- istasyon etkileşimleri (oyuncu + çıraklar ortak) --- */
function nearSpot(a) {
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (ZONES[s.zone].locked) continue;
    if (dist2(a.x, a.y, s.x, s.y + 0.9) < 1.5) return s;
  } return null;
}
function tryPickFish(a, s, dt) {
  if (s.stock <= 0 || !canTake(a, 'fish')) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = CFG.pickDelay;
  s.stock--; take(a, 'fish');
  fly(s.x, s.y + 0.9, 18, a.x, a.y, carryTopZ(a, a.carry.n), 'fish', 0.3);
  sfx.pick();
  return true;
}
function tryDropTable(a, tb, dt) {
  if (a.carry.type !== 'fish' || a.carry.n <= 0 || tb.inn >= CFG.tableMax) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = CFG.pickDelay;
  a.carry.n--; emptyIf(a); tb.inn++;
  fly(a.x, a.y, carryTopZ(a, a.carry.n + 1), tb.x, tb.y, 26, 'fish', 0.3);
  sfx.drop();
  return true;
}
function tryPickSteak(a, tb, dt) {
  if (tb.mat.n <= 0 || !canTake(a, 'steak')) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = CFG.pickDelay;
  tb.mat.n--; take(a, 'steak');
  fly(tb.mat.x, tb.mat.y, 14, a.x, a.y, carryTopZ(a, a.carry.n), 'steak', 0.3);
  sfx.pick();
  return true;
}
function tryDropCounter(a, c, dt) {
  if (a.carry.type !== 'steak' || a.carry.n <= 0 || c.buffer >= c.max) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = CFG.pickDelay;
  a.carry.n--; emptyIf(a); c.buffer++;
  fly(a.x, a.y, carryTopZ(a, a.carry.n + 1), c.x, c.y, 30, 'steak', 0.3);
  sfx.drop();
  return true;
}
function tryPickMoney(a, c, dt) {
  if (c.tray.items.length <= 0 || !canTake(a, 'money')) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = CFG.pickDelay;
  var v = c.tray.items.pop(); take(a, 'money', v);
  fly(c.tray.x, c.tray.y, 14, a.x, a.y, carryTopZ(a, a.carry.n), 'money', 0.3);
  sfx.pick();
  return true;
}
function tryDeposit(a, dt) {
  if (a.carry.type !== 'money' || a.carry.n <= 0) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.05;
  var per = a.carry.value / a.carry.n;
  a.carry.n--; a.carry.value -= per; S.cash += per;
  if (a.carry.n <= 0) { a.carry.value = 0; a.carry.type = null; }
  fly(a.x, a.y, carryTopZ(a, a.carry.n + 1), safe.x, safe.y, 30, 'money', 0.28);
  safe.pop = 1;
  addFloat(safe.x, safe.y - 0.4, '+' + money(per), '#8ef2a2');
  sfx.coin();
  return true;
}

/* --- oyuncu --- */
function updatePlayer(dt) {
  var ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (stick.active) { ix += stick.dx * 1.6; iy += stick.dy * 1.6; }
  ix = clamp(ix, -1, 1); iy = clamp(iy, -1, 1);

  /* ekran vektörünü dünya vektörüne çevir */
  var wx = (ix / (TW / 2) + iy / (TH / 2)) * (TW / 4);
  var wy = (iy / (TH / 2) - ix / (TW / 2)) * (TW / 4);
  moveActor(player, wx, wy, speed(), dt);

  var acted = false;
  var s = nearSpot(player);
  if (s) acted = tryPickFish(player, s, dt) || acted;

  for (var i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (ZONES[tb.zone].locked) continue;
    if (dist2(player.x, player.y, tb.x, tb.y) < 1.5) acted = tryDropTable(player, tb, dt) || acted;
    if (dist2(player.x, player.y, tb.mat.x, tb.mat.y) < 1.5) acted = tryPickSteak(player, tb, dt) || acted;
  }
  for (var j = 0; j < counters.length; j++) {
    var c = counters[j]; if (ZONES[c.zone].locked) continue;
    if (dist2(player.x, player.y, c.x, c.y) < 1.7) acted = tryDropCounter(player, c, dt) || acted;
    if (dist2(player.x, player.y, c.tray.x, c.tray.y) < 1.5) acted = tryPickMoney(player, c, dt) || acted;
  }
  if (dist2(player.x, player.y, safe.x, safe.y) < 1.7) acted = tryDeposit(player, dt) || acted;
  if (!acted) player.act = 0;
}

/* --- çıraklar --- */
function updateHelpers(dt) {
  for (var i = 0; i < helpers.length; i++) {
    var h = helpers[i];
    if (h.role === 'hauler') haulerAI(h, dt); else serverAI(h, dt);
  }
}
function bestSpot() {
  var best = null;
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (ZONES[s.zone].locked) continue;
    if (!best || s.stock > best.stock) best = s;
  } return best;
}
function bestTable(needSpace) {
  var best = null;
  for (var i = 0; i < tables.length; i++) {
    var t = tables[i]; if (ZONES[t.zone].locked) continue;
    if (needSpace && t.inn >= CFG.tableMax) continue;
    if (!best || t.inn < best.inn) best = t;
  } return best;
}
function bestMat() {
  var best = null;
  for (var i = 0; i < tables.length; i++) {
    var t = tables[i]; if (ZONES[t.zone].locked) continue;
    if (t.mat.n <= 0) continue;
    if (!best || t.mat.n > best.mat.n) best = t;
  } return best;
}
function bestCounterNeed() {
  var best = null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (ZONES[c.zone].locked) continue;
    if (c.buffer >= c.max) continue;
    var need = 0;
    for (var k = 0; k < c.slots.length; k++) if (c.slots[k] && c.slots[k].state === 'wait') need += (c.slots[k].want - c.slots[k].got);
    need -= c.buffer;
    if (need > 0 && (!best || need > best.need)) best = { c: c, need: need };
  }
  return best ? best.c : null;
}
function bestTray() {
  var best = null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (ZONES[c.zone].locked) continue;
    if (c.tray.items.length <= 0) continue;
    if (!best || c.tray.items.length > best.tray.items.length) best = c;
  } return best;
}

function haulerAI(h, dt) {
  var full = h.carry.n >= h.cap;
  if (h.carry.type === 'fish' && (full || !bestSpot() || bestSpot().stock <= 0)) {
    var t = bestTable(true) || bestTable(false);
    if (t && goTo(h, t.x, t.y - 0.2, CFG.helperSpeed, dt, 0.9)) tryDropTable(h, t, dt);
    return;
  }
  if (h.carry.type === 'fish' && full) return;
  var s = bestSpot();
  if (s && s.stock > 0 && canTake(h, 'fish')) {
    if (goTo(h, s.x + 0.6, s.y + 1.2, CFG.helperSpeed, dt, 0.8)) tryPickFish(h, s, dt);
    return;
  }
  if (h.carry.n > 0) {
    var t2 = bestTable(true);
    if (t2 && goTo(h, t2.x, t2.y - 0.2, CFG.helperSpeed, dt, 0.9)) tryDropTable(h, t2, dt);
    return;
  }
  var sp = bestSpot();
  if (sp) goTo(h, sp.x + 1.4, sp.y + 1.6, CFG.helperSpeed, dt, 1.2);
}

function serverAI(h, dt) {
  /* önce parayı kasaya */
  if (h.carry.type === 'money') {
    if (goTo(h, safe.x, safe.y, CFG.helperSpeed, dt, 0.9)) tryDeposit(h, dt);
    return;
  }
  if (h.carry.type === 'steak') {
    var c = bestCounterNeed() || counters.find(function (q) { return !ZONES[q.zone].locked && q.buffer < q.max; });
    if (c && goTo(h, c.x - 0.4, c.y - 0.5, CFG.helperSpeed, dt, 1.0)) tryDropCounter(h, c, dt);
    return;
  }
  var tray = bestTray();
  if (tray && tray.tray.items.length >= 3) {
    if (goTo(h, tray.tray.x, tray.tray.y, CFG.helperSpeed, dt, 0.8)) tryPickMoney(h, tray, dt);
    return;
  }
  var m = bestMat();
  if (m && bestCounterNeed()) {
    if (goTo(h, m.mat.x, m.mat.y, CFG.helperSpeed, dt, 0.8)) tryPickSteak(h, m, dt);
    return;
  }
  if (tray) { if (goTo(h, tray.tray.x, tray.tray.y, CFG.helperSpeed, dt, 0.8)) tryPickMoney(h, tray, dt); return; }
  if (m) { if (goTo(h, m.mat.x, m.mat.y, CFG.helperSpeed, dt, 0.8)) tryPickSteak(h, m, dt); return; }
  goTo(h, 7.2, 5.0, CFG.helperSpeed, dt, 1.0);
}

/* --- istasyonlar --- */
function updateStations(dt) {
  var i, s, t, c;
  for (i = 0; i < spots.length; i++) {
    s = spots[i]; if (ZONES[s.zone].locked) continue;
    s.t += dt;
    if (s.t >= CFG.spotInterval && s.stock < CFG.spotMax) {
      s.t = 0; s.stock++; S.caught++;
      var ox = s.face === 'n' ? s.x + rnd(-1, 1) : s.x - rnd(2.2, 3.4);
      var oy = s.face === 'n' ? s.y - rnd(2.2, 3.4) : s.y + rnd(-1, 1);
      fly(ox, oy, 6, s.x, s.y + 0.9, 18, 'fish', 0.55);
    } else if (s.stock >= CFG.spotMax) s.t = 0;
  }
  for (i = 0; i < tables.length; i++) {
    t = tables[i]; if (ZONES[t.zone].locked) continue;
    if (t.inn > 0 && t.mat.n < CFG.matMax) {
      t.t += dt;
      if (t.t >= CFG.cutTime) {
        t.t = 0; t.inn--; t.mat.n++;
        fly(t.x, t.y, 30, t.mat.x, t.mat.y, 14, 'steak', 0.4);
        addPuff(t.x, t.y, '#ffffff');
      }
    }
  }
  for (i = 0; i < counters.length; i++) {
    c = counters[i]; if (ZONES[c.zone].locked) continue;
    updateCounter(c, dt);
  }
  safe.pop = Math.max(0, safe.pop - dt * 3);
}

function queueSlotPos(c, i) { return { x: 10.75, y: c.y + 0.1 + i * 1.05 }; }

function updateCounter(c, dt) {
  /* müşteri doğumu */
  c.spawnT -= dt;
  var freeIdx = -1;
  for (var i = 0; i < c.slots.length; i++) if (!c.slots[i]) { freeIdx = i; break; }
  if (c.spawnT <= 0 && freeIdx >= 0) {
    c.spawnT = CFG.custEvery * rnd(0.75, 1.25);
    var cu = {
      x: 12.6, y: 19 + rnd(0, 2), z: 0, bob: rnd(0, 6), face: -1,
      want: irnd(2, 5), got: 0, state: 'walk', slot: freeIdx, c: c,
      pat: CFG.patience, mood: 1, hair: irnd(0, 2), tone: irnd(0, 2)
    };
    c.slots[freeIdx] = cu; customers.push(cu);
  }

  /* servis: sadece en öndeki */
  var front = c.slots[0];
  if (front && front.state === 'wait' && c.buffer > 0 && front.got < front.want) {
    c.eatT -= dt;
    if (c.eatT <= 0) {
      c.eatT = 0.22;
      c.buffer--; front.got++;
      var fp = queueSlotPos(c, 0);
      fly(c.x, c.y, 30, fp.x, fp.y, 40, 'steak', 0.3);
      if (front.got >= front.want) {
        var happy = front.pat / CFG.patience;
        var pay = Math.round(front.want * steakPrice() * (1 + (happy > 0.55 ? 0.25 : 0)));
        payout(c, pay);
        front.state = 'leave'; front.z = 0;
        c.slots[0] = null; shiftQueue(c);
        S.served++;
        addFloat(fp.x, fp.y - 0.5, '+' + money(pay), '#ffe27a');
        sfx.coin();
      }
    }
  }
}

function shiftQueue(c) {
  var list = [];
  for (var i = 0; i < c.slots.length; i++) if (c.slots[i]) list.push(c.slots[i]);
  for (var j = 0; j < c.slots.length; j++) c.slots[j] = list[j] || null;
  for (var k = 0; k < list.length; k++) list[k].slot = k;
}

function payout(c, total) {
  var n = clamp(Math.ceil(total / 16), 1, 7);
  var per = total / n;
  for (var i = 0; i < n; i++) {
    if (c.tray.items.length >= 26) { c.tray.items[c.tray.items.length - 1] += per; }
    else {
      c.tray.items.push(per);
      fly(queueSlotPos(c, 0).x, queueSlotPos(c, 0).y, 30, c.tray.x, c.tray.y, 14, 'money', 0.45);
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
      if (L < 0.12) { cu.state = 'wait'; }
      else { var sp = 2.0; cu.x += dx / L * sp * dt; cu.y += dy / L * sp * dt; cu.bob += dt * 8; }
    } else if (cu.state === 'wait') {
      var q = queueSlotPos(cu.c, cu.slot);
      cu.x = lerp(cu.x, q.x, 1 - Math.pow(0.001, dt));
      cu.y = lerp(cu.y, q.y, 1 - Math.pow(0.001, dt));
      cu.pat -= dt;
      cu.mood = clamp(cu.pat / CFG.patience, 0, 1);
      if (cu.pat <= 0) {
        cu.state = 'leave';
        cu.c.slots[cu.slot] = null; shiftQueue(cu.c);
        addFloat(cu.x, cu.y - 0.6, 'GİTTİ! 😠', '#ff8a7a');
        sfx.angry();
      }
    } else { /* leave */
      cu.x += (13.2 - cu.x) * Math.min(1, dt * 1.6);
      cu.y += 3.4 * dt; cu.bob += dt * 8;
      if (cu.y > 20.5) customers.splice(i, 1);
    }
  }
}

/* --- satın alma alanları --- */
function padActive(p) { return !ZONES[p.zone].locked && p.lvl < p.max; }
function updatePads(dt) {
  for (var i = 0; i < PADS.length; i++) {
    var p = PADS[i];
    p.glow = Math.max(0, (p.glow || 0) - dt * 2.4);
    if (!padActive(p)) continue;
    if (dist2(player.x, player.y, p.x, p.y) < 1.25) {
      var rate = Math.max(45, p.price / 2.4);
      var d = Math.min(rate * dt, p.price - p.paid, S.cash);
      if (d > 0) {
        S.cash -= d; p.paid += d; p.glow = 1;
        if (Math.random() < 0.35) addPuff(p.x, p.y, '#ffd76a');
        if (Math.random() < 0.25) beep(400 + p.paid / p.price * 500, 0.04, 'square', 0.02);
      }
      if (p.paid >= p.price - 0.01) applyPad(p);
    }
  }
}
function applyPad(p) {
  p.paid = 0; p.lvl++;
  sfx.buy();
  if (p.kind === 'cap') { S.capLvl++; toast('Kapasite arttı! Sırt çantası: ' + capacity()); }
  else if (p.kind === 'spd') { S.spdLvl++; toast('Daha hızlısın! (+%11)'); }
  else if (p.kind === 'price') { S.priceLvl++; toast('Fileto fiyatı: ' + money(steakPrice())); }
  else if (p.kind === 'zone') { ZONES[p.target].locked = false; toast('Yeni alan açıldı! 🎉'); }
  else if (p.kind === 'help') { addHelper(p.role); }
  if (p.lvl < p.max) p.price = Math.round(p.price * p.growth);
  addPuff(p.x, p.y, '#ffd76a'); addPuff(p.x, p.y, '#fff');
  save();
}

/* --- efektler --- */
function updateFx(dt) {
  var i;
  for (i = flyers.length - 1; i >= 0; i--) {
    var f = flyers[i]; f.t += dt; if (f.t >= f.d) flyers.splice(i, 1);
  }
  for (i = floats.length - 1; i >= 0; i--) {
    floats[i].t += dt; if (floats[i].t > 1.25) floats.splice(i, 1);
  }
  for (i = puffs.length - 1; i >= 0; i--) {
    var pu = puffs[i]; pu.t += dt; pu.x += pu.vx * dt; pu.y += pu.vy * dt;
    pu.z += pu.vz * dt; pu.vz -= 150 * dt;
    if (pu.t > 0.7) puffs.splice(i, 1);
  }
}

/* =========================================================
   ÇİZİM
   ========================================================= */

function rr(x, y, w, h, r) {
  ctx.beginPath();
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
  /* sağ yüz */
  ctx.beginPath();
  ctx.moveTo(pX(bx, y), pY(bx, y, z1)); ctx.lineTo(pX(bx, by), pY(bx, by, z1));
  ctx.lineTo(pX(bx, by), pY(bx, by, z0)); ctx.lineTo(pX(bx, y), pY(bx, y, z0));
  ctx.closePath(); ctx.fillStyle = right; ctx.fill();
  /* sol yüz */
  ctx.beginPath();
  ctx.moveTo(pX(x, by), pY(x, by, z1)); ctx.lineTo(pX(bx, by), pY(bx, by, z1));
  ctx.lineTo(pX(bx, by), pY(bx, by, z0)); ctx.lineTo(pX(x, by), pY(x, by, z0));
  ctx.closePath(); ctx.fillStyle = left; ctx.fill();
  /* üst */
  isoQuad(x, y, w, h, z1, top);
}
function shadow(x, y, r) {
  ctx.save(); ctx.globalAlpha = 0.2;
  ell(pX(x, y), pY(x, y, 0), r * TW * 0.5, r * TH * 0.5, '#0a2a1f');
  ctx.restore();
}

/* ---------- eşyalar ---------- */
function drawFish(px, py, s) {
  s = s || 1;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ell(0, 0, 16, 7, '#c9d6de');
  ell(-2, -1.6, 13, 4.2, '#e8f0f5');
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(21, -6); ctx.lineTo(21, 6); ctx.closePath();
  ctx.fillStyle = '#9fb3c0'; ctx.fill();
  ell(-9, -1, 2, 2, '#25333c');
  ctx.strokeStyle = 'rgba(60,90,110,.45)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-6, 2.6); ctx.lineTo(10, 2.2); ctx.stroke();
  ctx.restore();
}
function drawSteak(px, py, s) {
  s = s || 1;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ell(0, 1.5, 15, 7, '#a9bcc7');
  ell(0, 0, 15, 7, '#eef5f9');
  ell(0, -0.4, 10.5, 4.6, '#f59a4b');
  ell(0, -0.6, 6.5, 2.6, '#fbb978');
  ctx.strokeStyle = '#c6733a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-8, -0.5); ctx.lineTo(8, -0.5); ctx.stroke();
  ctx.restore();
}
function drawMoney(px, py, s) {
  s = s || 1;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.fillStyle = '#2f7d43'; rr(-14, -3, 28, 11, 3); ctx.fill();
  ctx.fillStyle = '#58c46f'; rr(-14, -8, 28, 11, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; rr(-9, -5.5, 18, 6, 2.5); ctx.fill();
  ctx.fillStyle = '#2f7d43'; ctx.font = 'bold 9px Verdana'; ctx.textAlign = 'center';
  ctx.fillText('$', 0, -0.6);
  ctx.restore();
}
function drawItem(kind, px, py, s) {
  if (kind === 'fish') drawFish(px, py, s);
  else if (kind === 'steak') drawSteak(px, py, s);
  else drawMoney(px, py, s);
}

/* yığın (dünya konumunda, dikey) */
function drawStack(x, y, kind, n, baseZ, gap, maxShow) {
  if (n <= 0) return;
  maxShow = maxShow || 14; gap = gap || 8;
  var show = Math.min(n, maxShow);
  for (var i = 0; i < show; i++) {
    var wob = Math.sin(i * 0.7 + gameT * 1.2) * (kind === 'money' ? 0.8 : 1.4);
    drawItem(kind, pX(x, y) + wob, pY(x, y, baseZ + i * gap), 0.86);
  }
  if (n > show) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Verdana'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3;
    var tx = pX(x, y), ty = pY(x, y, baseZ + show * gap + 10);
    ctx.strokeText('+' + (n - show), tx, ty); ctx.fillText('+' + (n - show), tx, ty);
  }
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

  /* bacaklar */
  ctx.fillStyle = o.pants || '#2c3440';
  rr(-8, -16, 7, 18 + legSw * 0.2, 3); ctx.fill();
  rr(1, -16, 7, 18 - legSw * 0.2, 3); ctx.fill();
  /* ayakkabı */
  ctx.fillStyle = '#1a1f26';
  rr(-9, -2 + legSw * 0.2, 9, 5, 2.5); ctx.fill();
  rr(0, -2 - legSw * 0.2, 9, 5, 2.5); ctx.fill();

  /* gövde / mont */
  ctx.fillStyle = o.coat || '#f2ede2';
  rr(-12, -40, 24, 26, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.09)'; rr(-12, -22, 24, 8, 5); ctx.fill();
  /* kollar */
  ctx.fillStyle = o.coat2 || o.coat || '#e6dfd0';
  rr(-16, -38, 7, 19, 3.5); ctx.fill();
  rr(9, -38, 7, 19, 3.5); ctx.fill();
  /* sırt çantası */
  if (o.bag) { ctx.fillStyle = '#4a5a68'; rr(o.face > 0 ? -17 : 10, -36, 8, 16, 3); ctx.fill(); }

  /* kafa */
  ctx.fillStyle = o.skin || SKIN[0];
  ell(0, -48, 9.5, 9.5, o.skin || SKIN[0]);
  /* saç / kapüşon */
  if (o.hood) {
    ctx.fillStyle = o.hoodCol || '#ffffff';
    ctx.beginPath(); ctx.arc(0, -49, 11, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.beginPath(); ctx.arc(0, -49, 11, Math.PI * 1.75, Math.PI * 2); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = o.hair || HAIR[0];
    ctx.beginPath(); ctx.arc(0, -50, 10, Math.PI * 1.02, Math.PI * 2 - 0.02); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.hair || HAIR[0]; rr(-10, -52, 20, 7, 3); ctx.fill();
  }
  /* yüz */
  ctx.fillStyle = '#20262c';
  var fx = o.face > 0 ? 1 : -1;
  ell(2.6 * fx, -47, 1.5, 1.9, '#20262c');
  ell(-2.6 * fx + (fx > 0 ? 3 : -3), -47, 1.5, 1.9, '#20262c');
  if (o.mood !== undefined && o.mood < 0.45) {
    ctx.strokeStyle = '#20262c'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(1 * fx, -41, 3.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else {
    ctx.strokeStyle = '#20262c'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(1 * fx, -43.5, 3.2, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.restore();

  /* taşınan yığın */
  if (a.carry && a.carry.n > 0) {
    drawStack(a.x, a.y, a.carry.type, a.carry.n, 34 - b, 7.6, 12);
  }
}

function drawCustomer(cu) {
  var angry = cu.state === 'wait' && cu.mood < 0.45;
  drawPerson(cu, {
    coat: '#f2c94c', coat2: '#e5b937', pants: '#2b3038',
    skin: SKIN[cu.tone], hair: HAIR[cu.hair], face: cu.face,
    mood: cu.state === 'wait' ? cu.mood : 1, walk: cu.state !== 'wait', seed: cu.hair
  });
  var px = pX(cu.x, cu.y), py = pY(cu.x, cu.y, 0);
  if (cu.state === 'wait') {
    /* istek balonu */
    var bx = px + 26, by = py - 74;
    ctx.fillStyle = '#fff'; ell(bx, by, 19, 15, '#fff');
    ctx.beginPath(); ctx.moveTo(bx - 10, by + 10); ctx.lineTo(bx - 4, by + 20); ctx.lineTo(bx - 1, by + 9);
    ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    drawSteak(bx - 3, by - 1, 0.62);
    ctx.fillStyle = '#25333c'; ctx.font = 'bold 11px Verdana'; ctx.textAlign = 'center';
    ctx.fillText('x' + (cu.want - cu.got), bx + 11, by + 5);
    /* sabır çubuğu */
    var w = 34, h = 5;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(px - w / 2, py - 66, w, h, 2.5); ctx.fill();
    ctx.fillStyle = cu.mood > 0.5 ? '#6fdc87' : (cu.mood > 0.25 ? '#ffd15c' : '#ff6a5a');
    rr(px - w / 2, py - 66, w * cu.mood, h, 2.5); ctx.fill();
    if (angry) {
      ctx.font = '15px Verdana'; ctx.textAlign = 'center';
      ctx.fillText('😠', px - 22, py - 60 + Math.sin(gameT * 12) * 1.5);
    }
  }
}

/* ---------- etiket ---------- */
function label(x, y, z, text, col) {
  var px = pX(x, y), py = pY(x, y, z);
  /* oyuncu üstündeyse etiket sönükleşsin (görüşü kapatmasın) */
  var near = dist2(player.x, player.y, x, y);
  var a = near < 2.2 ? 0.28 : (near < 5 ? 0.78 : 1);
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = 'bold 11px Verdana'; ctx.textAlign = 'center';
  var w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(9,32,46,.7)'; rr(px - w / 2, py - 13, w, 18, 8); ctx.fill();
  ctx.fillStyle = col || '#eaf6ff'; ctx.fillText(text, px, py);
  ctx.restore();
}

/* ---------- deniz ---------- */
var shoal = [];
(function initShoal() {
  for (var i = 0; i < 620; i++) {
    var x, y, guard = 0;
    do { x = rnd(-24, 34); y = rnd(-24, 34); guard++; } while (x > -1.2 && y > -1.2 && guard < 40);
    shoal.push({ x: x, y: y, s: rnd(0.5, 1.05), sp: rnd(0.35, 0.95), ph: rnd(0, TAU) });
  }
})();

function drawWater() {
  /* arka plan (ekran uzayı) */
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  var g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#2f7fb8'); g.addColorStop(0.55, '#2069a3'); g.addColorStop(1, '#17527f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

function drawShoal() {
  ctx.save();
  for (var i = 0; i < shoal.length; i++) {
    var f = shoal[i];
    f.x += f.sp * 0.22 * 0.016;
    if (f.x > 34) { f.x = -26; }
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
  ctx.restore();
}

function drawLand() {
  /* kar kütlesi */
  ctx.beginPath();
  var pts = [[-0.7, -0.7], [70, -0.7], [70, 70], [-0.7, 70]];
  ctx.moveTo(pX(pts[0][0], pts[0][1]), pY(pts[0][0], pts[0][1], 0));
  for (var i = 1; i < 4; i++) ctx.lineTo(pX(pts[i][0], pts[i][1]), pY(pts[i][0], pts[i][1], 0));
  ctx.closePath();
  ctx.fillStyle = '#eaf3fa'; ctx.fill();
  /* kıyı köpüğü */
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pX(70, -0.7), pY(70, -0.7, 0));
  ctx.lineTo(pX(-0.7, -0.7), pY(-0.7, -0.7, 0));
  ctx.lineTo(pX(-0.7, 70), pY(-0.7, 70, 0));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(160,205,235,.5)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pX(70, -1.15), pY(70, -1.15, 0));
  ctx.lineTo(pX(-1.15, -1.15), pY(-1.15, -1.15, 0));
  ctx.lineTo(pX(-1.15, 70), pY(-1.15, 70, 0));
  ctx.stroke();
}

/* ---------- kar süsleri (çam / kaya / buz) ---------- */
var _sd = 20260919;
function srnd() { _sd = (_sd * 1664525 + 1013904223) % 4294967296; return _sd / 4294967296; }
var deco = [], floes = [];
(function initDeco() {
  function free(x, y) {
    if (x < -0.6 || y < -0.6) return false;            /* su */
    if (x < 10.6 && y < 20.6) return false;            /* iskele + müşteri yolu */
    if (x < 14.2 && y < 21.2) return false;            /* kuyruk koridoru */
    return true;
  }
  for (var x = -1; x < 32; x += 1.28) {
    for (var y = -1; y < 34; y += 1.28) {
      var dx = x + srnd() * 0.9 - 0.45, dy = y + srnd() * 0.9 - 0.45;
      if (!free(dx, dy)) continue;
      if (srnd() < 0.42) continue;
      deco.push({ x: dx, y: dy, t: srnd() < 0.76 ? 'tree' : 'rock', s: 1.15 + srnd() * 0.85 });
    }
  }
  for (var i = 0; i < 26; i++) {
    var fx, fy, g = 0;
    do { fx = rnd(-22, 30); fy = rnd(-22, 30); g++; } while (fx > -2 && fy > -2 && g < 30);
    floes.push({ x: fx, y: fy, s: rnd(0.6, 1.6) });
  }
})();

function drawTree(d) {
  var px = pX(d.x, d.y), py = pY(d.x, d.y, 0), s = d.s;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.globalAlpha = 0.18; ell(0, 0, 17, 8, '#7d94a6'); ctx.globalAlpha = 1;
  ctx.fillStyle = '#a5683f'; rr(-4, -16, 8, 17, 2); ctx.fill();
  var layers = [[-14, 0, 28, 20], [-11.5, -16, 23, 18], [-8.5, -30, 17, 16]];
  for (var i = 0; i < 3; i++) {
    var L = layers[i], x0 = L[0], y0 = L[1], w = L[2], h = L[3];
    ctx.beginPath();
    ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0 + w, y0 + 2); ctx.lineTo(x0, y0 + 2); ctx.closePath();
    ctx.fillStyle = '#cfe2ee'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0, y0 + 2); ctx.lineTo(0, y0 + 2); ctx.closePath();
    ctx.fillStyle = '#aec6d6'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, y0 - h * 0.55); ctx.lineTo(x0 + w * 0.34, y0 - h * 0.1); ctx.lineTo(x0 + w * 0.12, y0 - h * 0.08);
    ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  ctx.restore();
}
function drawRock(d) {
  var px = pX(d.x, d.y), py = pY(d.x, d.y, 0), s = d.s;
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
  ctx.globalAlpha = 0.16; ell(0, 0, 14, 7, '#7d94a6'); ctx.globalAlpha = 1;
  ell(0, -6, 13, 10, '#b9c9d6');
  ell(-2, -9, 10, 7, '#e9f2f8');
  ctx.restore();
}
function drawFloes() {
  for (var i = 0; i < floes.length; i++) {
    var f = floes[i];
    var px = pX(f.x, f.y), py = pY(f.x, f.y, 0) + Math.sin(gameT * 0.7 + f.x) * 2;
    ctx.globalAlpha = 0.85;
    ell(px, py, 26 * f.s, 12 * f.s, '#dceefa');
    ell(px - 3, py - 3, 19 * f.s, 8 * f.s, '#ffffff');
    ctx.globalAlpha = 1;
  }
}

function drawZones() {
  for (var i = 0; i < ZONES.length; i++) {
    var z = ZONES[i], w = z.x1 - z.x0, h = z.y1 - z.y0;
    if (!z.locked) {
      isoQuad(z.x0, z.y0, w, h, 0, '#e3ac7c');
      isoQuad(z.x0 + 0.1, z.y0 + 0.1, w - 0.2, h - 0.2, 0, 'rgba(255,255,255,.07)');
      /* tahta desen */
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
      /* kilit rozeti */
      var cx = z.x0 + w / 2, cy = z.y0 + h / 2;
      var px = pX(cx, cy), py = pY(cx, cy, 0);
      ctx.save(); ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(30,55,75,.55)'; rr(px - 44, py - 26, 88, 52, 14); ctx.fill();
      ctx.font = '30px Verdana'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.fillText('🔒', px, py + 4);
      ctx.font = 'bold 13px Verdana';
      ctx.fillText('KİLİTLİ', px, py + 22);
      ctx.restore();
    }
  }
}

/* ---------- çit ---------- */
function fencePost(x, y) {
  var px = pX(x, y), py = pY(x, y, 0);
  ctx.fillStyle = '#a4693c'; rr(px - 7, py - 26, 14, 26, 4); ctx.fill();
  ctx.fillStyle = '#c7884f'; rr(px - 7, py - 26, 8, 26, 4); ctx.fill();
  ell(px, py - 26, 7, 3.4, '#e0b384');
}
function drawFences() {
  var maxY = maxOpenY();
  var i;
  /* sağ kenar */
  for (i = 0; i < maxY; i += 0.62) {
    var gap = false;
    for (var c = 0; c < counters.length; c++) {
      if (ZONES[counters[c].zone].locked) continue;
      if (Math.abs(i - counters[c].y) < 1.1) gap = true;
    }
    if (!gap) fencePost(9.95, i);
  }
  /* alt kenar */
  for (i = 0; i <= 9.95; i += 0.62) fencePost(i, maxY - 0.05);
}

/* ---------- istasyonlar ---------- */
function drawSpot(s) {
  var t = gameT * 1.4;
  /* iskele direği + ağ makarası */
  isoBox(s.x - 0.32, s.y - 0.32, 0.64, 0.64, 0, 30, '#c98b52', '#8d5b32', '#a86f3f');
  ctx.save();
  var px = pX(s.x, s.y), py = pY(s.x, s.y, 30);
  ell(px, py - 16, 21, 16, '#e9e3b8');
  ell(px, py - 20, 19, 13, '#f3eec8');
  ctx.strokeStyle = 'rgba(150,140,90,.55)'; ctx.lineWidth = 1.2;
  for (var i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(px + i * 5, py - 32); ctx.lineTo(px + i * 5, py - 6); ctx.stroke();
  }
  ctx.fillStyle = '#a4693c'; rr(px - 4, py - 44, 8, 16, 3); ctx.fill();
  rr(px - 13, py - 40, 26, 7, 3); ctx.fill();
  ctx.restore();

  /* ağ suya uzanıyor */
  var ex = s.face === 'n' ? s.x + 0.2 : s.x - 3.2;
  var ey = s.face === 'n' ? s.y - 3.2 : s.y + 0.2;
  ctx.strokeStyle = 'rgba(240,238,200,.75)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pX(s.x, s.y), pY(s.x, s.y, 42));
  ctx.quadraticCurveTo((pX(s.x, s.y) + pX(ex, ey)) / 2, pY((s.x + ex) / 2, (s.y + ey) / 2, 90 + Math.sin(t) * 6),
    pX(ex, ey), pY(ex, ey, 6));
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.5;
  ell(pX(ex, ey), pY(ex, ey, 0), 30, 15, '#dff0f8');
  ctx.restore();

  /* sandık */
  var cx = s.x - 0.55, cy = s.y + 0.5;
  isoBox(cx, cy, 1.1, 0.9, 0, 12, '#8d5b32', '#6b4425', '#7c4f2b');
  isoQuad(cx + 0.06, cy + 0.06, 0.98, 0.78, 12, '#5f3d21');
  drawStack(s.x, s.y + 0.9, 'fish', s.stock, 12, 6.5, 12);
  label(s.x, s.y + 1.7, 14, '🎣 BALIK ' + s.stock, '#bfe9ff');
}

function drawTable(tb) {
  /* masa */
  isoBox(tb.x - 0.7, tb.y - 0.5, 1.4, 1.0, 0, 26, '#a97448', '#6f4526', '#85552f');
  isoQuad(tb.x - 0.6, tb.y - 0.42, 1.2, 0.84, 26, '#d9c39c');
  /* bıçak animasyonu */
  var px = pX(tb.x, tb.y), py = pY(tb.x, tb.y, 26);
  var chop = tb.inn > 0 ? Math.abs(Math.sin(gameT * 9)) : 0;
  ctx.save();
  ctx.translate(px + 10, py - 8 - chop * 14);
  ctx.rotate(-0.5 - chop * 0.5);
  ctx.fillStyle = '#5a4630'; rr(-3, 0, 6, 12, 2); ctx.fill();
  ctx.fillStyle = '#dfe8ee'; rr(-4, -16, 8, 17, 2); ctx.fill();
  ctx.restore();
  drawStack(tb.x - 0.15, tb.y + 0.1, 'fish', tb.inn, 26, 6.5, 10);
  label(tb.x, tb.y + 1.0, 8, '🔪 KESİM', '#ffe6bf');

  /* fileto paspası */
  var m = tb.mat;
  isoQuad(m.x - 0.62, m.y - 0.52, 1.24, 1.04, 0.5, '#f7fbfd', 'rgba(40,70,90,.45)', 3);
  drawStack(m.x, m.y, 'steak', m.n, 4, 6.2, 12);
}

function drawCounter(c) {
  isoBox(c.x - 0.55, c.y - 1.1, 1.1, 2.2, 0, 28, '#c08a52', '#7d4f2b', '#95602f');
  isoQuad(c.x - 0.48, c.y - 1.02, 0.96, 2.04, 28, '#e0bb8a');
  drawStack(c.x, c.y, 'steak', c.buffer, 28, 6.2, 12);
  label(c.x, c.y - 1.5, 10, '🍣 TEZGÂH ' + c.buffer, '#ffd9a8');
  /* para tepsisi */
  var tr = c.tray;
  isoQuad(tr.x - 0.62, tr.y - 0.52, 1.24, 1.04, 0.5, '#d8ecdc', '#4fbf6d', 3);
  isoQuad(tr.x - 0.45, tr.y - 0.36, 0.9, 0.72, 0.7, 'rgba(110,220,140,.35)');
  drawStack(tr.x, tr.y, 'money', tr.items.length, 4, 6.5, 12);
  if (tr.items.length > 0) label(tr.x, tr.y + 0.85, 6, '💵 AL', '#9df5b0');
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

function padText(p) {
  if (p.kind === 'cap') return 'KAPASİTE +2';
  if (p.kind === 'spd') return 'HIZ +%11';
  if (p.kind === 'price') return 'FİYAT +$4';
  if (p.kind === 'zone') return 'YENİ ALAN';
  return p.role === 'hauler' ? 'BALIKÇI ÇIRAK' : 'SERVİS ÇIRAK';
}
function padIcon(p) {
  if (p.kind === 'cap') return '🎒'; if (p.kind === 'spd') return '👟';
  if (p.kind === 'price') return '💲'; if (p.kind === 'zone') return '🔓';
  return p.role === 'hauler' ? '🎣' : '🍽️';
}
function drawPad(p) {
  if (ZONES[p.zone].locked) return;
  var done = p.lvl >= p.max;
  var w = 1.5, h = 1.2, x = p.x - w / 2, y = p.y - h / 2;
  var pulse = 0.5 + 0.5 * Math.sin(gameT * 3);
  if (done) {
    isoQuad(x, y, w, h, 0.4, 'rgba(120,140,155,.25)', 'rgba(255,255,255,.25)', 2);
    label(p.x, p.y, 26, '✔ TAMAM', '#cfe9ff');
    return;
  }
  isoQuad(x, y, w, h, 0.4, 'rgba(40,60,75,.45)');
  /* dolum */
  var frac = p.paid / p.price;
  if (frac > 0) isoQuad(x, y, w, h * clamp(frac, 0.02, 1), 0.5, 'rgba(110,224,138,.65)');
  ctx.save(); ctx.setLineDash([9, 7]); ctx.lineDashOffset = -gameT * 14;
  isoQuad(x, y, w, h, 0.6, null, 'rgba(255,240,170,' + (0.5 + pulse * 0.45) + ')', 3);
  ctx.restore();

  var px = pX(p.x, p.y), py = pY(p.x, p.y, 44 + pulse * 3);
  ctx.save();
  ctx.globalAlpha = dist2(player.x, player.y, p.x, p.y) < 1.25 ? 0.92 : 1;
  ctx.font = '20px Verdana'; ctx.textAlign = 'center';
  ctx.fillText(padIcon(p), px, py - 20);
  var txt = padText(p);
  ctx.font = 'bold 12px Verdana';
  var tw = Math.max(ctx.measureText(txt).width, 64) + 18;
  ctx.fillStyle = 'rgba(9,32,46,.8)'; rr(px - tw / 2, py - 14, tw, 34, 9); ctx.fill();
  ctx.fillStyle = '#ffe9a8'; ctx.fillText(txt, px, py - 1);
  ctx.font = 'bold 14px Verdana';
  ctx.fillStyle = S.cash > 0 ? '#8ef2a2' : '#ffb0a0';
  ctx.fillText(money(p.price - p.paid), px, py + 15);
  if (p.lvl > 0 && p.max > 1) {
    ctx.font = 'bold 10px Verdana'; ctx.fillStyle = '#cfe9ff';
    ctx.fillText('Lv.' + p.lvl + '/' + p.max, px, py + 28);
  }
  ctx.restore();
}

/* uçuşan eşyalar */
function drawFlyers() {
  for (var i = 0; i < flyers.length; i++) {
    var f = flyers[i], t = clamp(f.t / f.d, 0, 1);
    var x = lerp(f.x0, f.x1, t), y = lerp(f.y0, f.y1, t);
    var z = lerp(f.z0, f.z1, t) + Math.sin(t * Math.PI) * f.h;
    drawItem(f.k, pX(x, y), pY(x, y, z), 0.9);
  }
}
function drawFloats() {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i], t = f.t / 1.25;
    ctx.globalAlpha = 1 - t * t;
    ctx.font = 'bold 17px Verdana'; ctx.textAlign = 'center';
    var px = pX(f.x, f.y), py = pY(f.x, f.y, 60 + t * 44);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 4;
    ctx.strokeText(f.txt, px, py); ctx.fillStyle = f.col; ctx.fillText(f.txt, px, py);
    ctx.globalAlpha = 1;
  }
}
function drawPuffs() {
  for (var i = 0; i < puffs.length; i++) {
    var p = puffs[i];
    ctx.globalAlpha = clamp(1 - p.t / 0.7, 0, 1) * 0.85;
    ell(pX(p.x, p.y), pY(p.x, p.y, p.z), 4.5, 4.5, p.col);
  }
  ctx.globalAlpha = 1;
}

/* =========================================================
   SAHNE
   ========================================================= */
var camX = 0, camY = 0, gameT = 0;

function render() {
  drawWater();
  ctx.save();
  ctx.translate(VW / 2, VH * 0.44);
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(-camX, -camY);

  drawShoal();
  drawFloes();
  drawLand();
  drawZones();

  /* derinliğe göre sıralı çizim */
  var list = [];
  function push(d, fn) { list.push({ d: d, f: fn }); }

  var i;
  for (i = 0; i < deco.length; i++) (function (d) {
    push(d.x + d.y - 0.2, function () { d.t === 'tree' ? drawTree(d) : drawRock(d); });
  })(deco[i]);
  for (i = 0; i < PADS.length; i++) (function (p) { push(p.x + p.y - 0.9, function () { drawPad(p); }); })(PADS[i]);
  for (i = 0; i < spots.length; i++) (function (s) {
    if (ZONES[s.zone].locked) return; push(s.x + s.y, function () { drawSpot(s); });
  })(spots[i]);
  for (i = 0; i < tables.length; i++) (function (t) {
    if (ZONES[t.zone].locked) return;
    push(t.mat.x + t.mat.y - 0.3, function () { /* paspas altta */ });
    push(t.x + t.y, function () { drawTable(t); });
  })(tables[i]);
  for (i = 0; i < counters.length; i++) (function (c) {
    if (ZONES[c.zone].locked) return;
    push(c.x + c.y, function () { drawCounter(c); });
  })(counters[i]);
  push(safe.x + safe.y, drawSafe);

  /* çit direkleri */
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
  for (i = 0; i < helpers.length; i++) (function (h) {
    push(h.x + h.y + 0.2, function () {
      drawPerson(h, {
        coat: h.role === 'hauler' ? '#7fd3f0' : '#f3a0c8', coat2: h.role === 'hauler' ? '#63bbdb' : '#e08bb4',
        pants: '#2c3440', skin: SKIN[1], hood: true, hoodCol: h.role === 'hauler' ? '#d7f2fb' : '#ffdcec',
        face: h.face, bag: true, seed: 2
      });
    });
  })(helpers[i]);
  push(player.x + player.y + 0.25, function () {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,214,110,.9)'; ctx.lineWidth = 3.2;
    ctx.setLineDash([8, 7]); ctx.lineDashOffset = -gameT * 16;
    ctx.beginPath();
    ctx.ellipse(pX(player.x, player.y), pY(player.x, player.y, 0), 27, 13.5, 0, 0, TAU);
    ctx.stroke(); ctx.restore();
    drawPerson(player, { coat: '#f7f3e8', coat2: '#e7e0cf', pants: '#33404d', skin: SKIN[0], hood: true, hoodCol: '#ffffff', face: player.face, bag: true });
  });

  list.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < list.length; i++) list[i].f();

  drawFlyers();
  drawPuffs();
  drawFloats();

  ctx.restore();

  /* joystick */
  if (stick.active) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 0.28;
    ell(stick.bx, stick.by, 54, 54, '#ffffff');
    ctx.globalAlpha = 0.5;
    ell(stick.bx + stick.dx * 42, stick.by + stick.dy * 42, 26, 26, '#ffffff');
    ctx.globalAlpha = 1;
  }
}

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
  updateHelpers(dt);
  updateStations(dt);
  updateCustomers(dt);
  updatePads(dt);
  updateFx(dt);

  /* kamera */
  var tx = pX(player.x, player.y), ty = pY(player.x, player.y, 0);
  var k = 1 - Math.pow(0.0015, dt);
  camX = lerp(camX, tx, k); camY = lerp(camY, ty, k);

  /* HUD */
  elMoney.textContent = money(S.cash).replace('$', '');
  elCarry.textContent = player.carry.n + '/' + capacity();
  elCarryIcon.textContent = player.carry.type === 'fish' ? '🐟' : player.carry.type === 'steak' ? '🍣' : player.carry.type === 'money' ? '💵' : '🎒';
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) elToast.classList.remove('on'); }

  saveT += dt; if (saveT > 6) { saveT = 0; save(); }

  render();
}

/* =========================================================
   BAŞLAT
   ========================================================= */
function start() {
  document.getElementById('startScreen').classList.add('hidden');
  S.started = true;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  toast('Ağın yanında bekle, balıklar dolsun! 🎣');
}

document.getElementById('playBtn').addEventListener('click', start);
document.getElementById('helpBtn').addEventListener('click', function () {
  document.getElementById('helpScreen').classList.remove('hidden');
});
document.getElementById('closeHelp').addEventListener('click', function () {
  document.getElementById('helpScreen').classList.add('hidden');
});
document.getElementById('resetBtn').addEventListener('click', function () {
  if (confirm('Tüm ilerleme silinsin mi?')) wipe();
});
document.getElementById('soundBtn').addEventListener('click', function () {
  soundOn = !soundOn; this.textContent = soundOn ? '🔊' : '🔇';
});
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

resize();
load();
camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
requestAnimationFrame(frame);


/* geliştirici kancası (hata ayıklama / test) */
window.BT = {
  S: S, player: player, spots: spots, tables: tables, counters: counters,
  pads: PADS, zones: ZONES, helpers: helpers, customers: customers, cfg: CFG,
  start: start, addHelper: addHelper
};

})();
