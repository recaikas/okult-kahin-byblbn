/* Fikir 6–10 taslak görselleri (FIKIRLER.md › A). Oyunun gerçek ekranı + aynı ince piksel dilinde yeni öğeler.
   Dünyadaki yeni nesneler oyunun kendi çizim sırasına (derinlik sıralı) "kedi" girdisi olarak eklenir:
   HKA.drawCat kancası, fn taşıyan girdiyi kendi çizicisine yönlendirir. Arayüz parçaları oyunun CSS sınıflarıyla.
   Kullanım: node uret-06-10.js [6|7|8|9|10|all]   (sunucu: localhost:8101)
   Çıktı: fikir-06.png … fikir-10.png (780×1688), fikir-07b.png (1080×1920 paylaşım görseli) */
const { chromium } = require('../../../test-offline');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8101/index.html';
const OUT = __dirname;

/* ---------------- sayfa içi yardımcılar (MK) ---------------- */
const LIB = `(function(){
var H = window.HKG, A = window.HKA, L = A.lib, MK = window.MK = {};
var cats = H.v('cats');
MK.L = L;
/* dünya girdisi: oyunun derinlik sırasına girer (x+y) */
var oc = A.drawCat;
A.drawCat = function (c) { if (c.fn) { c.fn(c); return true; } return oc(c); };
MK.ent = function (x, y, fn) { var e = { x: x, y: y, dir: 1, t: 1e9, st: 'sit', col: '#000000', fn: fn }; cats.push(e); return e; };
MK.cat = function (x, y, col, st, dir, z) {           /* oyunun kendi kedisi, istenen yükseklikte */
  var c = { x: x, y: y, dir: dir || 1, t: 1e9, st: st || 'sit', col: col };
  return MK.ent(x, y, function () { var g = H.ctx; g.save(); g.translate(0, -(z || 0)); oc(c); g.restore(); });
};
MK.spr = function (key, build) { return L.sprite('mk:' + key, build); };
MK.blit = function (s, x, y, z) { L.blit(s, H.pX(x, y), H.pY(x, y, z || 0)); };
/* çokgen doldurma (ince piksel, Buf içinde); col: renk ya da (x,y)→renk */
MK.poly = function (b, pts, col) {
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (var y = Math.floor(y0); y <= Math.ceil(y1); y++) for (var x = Math.floor(x0); x <= Math.ceil(x1); x++) {
    var px = x + 0.5, py = y + 0.5, ins = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], c = pts[j];
      if ((a[1] > py) !== (c[1] > py) && px < (c[0] - a[0]) * (py - a[1]) / (c[1] - a[1]) + a[0]) ins = !ins;
    }
    if (ins) { var cc = typeof col === 'function' ? col(x, y) : col; if (cc) b.set(x, y, cc); }
  }
  return b;
};
/* izometrik nokta (U,V art pikseli; tile*12), z → ince piksel */
MK.P = function (U, V, z) { return [L.sx(U, V), L.sy(U, V, z)]; };
/* UI: sprite → DOM tuvali (s ölçek, CSS px / ince piksel) */
MK.ui = function (s, sc) {
  var c = document.createElement('canvas'); c.width = s.w; c.height = s.h;
  c.getContext('2d').drawImage(s.cv, 0, 0);
  c.style.cssText = 'image-rendering:pixelated;width:' + s.w * sc + 'px;height:' + s.h * sc + 'px;display:block';
  return c;
};
MK.buf = function () { return L.buf(); };
MK.dark = L.dark; MK.lite = L.lite; MK.mix = L.mix; MK.hash = L.hash;
/* kişi: oyunun drawPerson'ı (ince kanca) */
MK.person = function (x, y, o, extra) {
  var a = { x: x, y: y, vx: 0, vy: 0, bob: 0, act: 0 };
  return MK.ent(x, y, function () { H.v('drawPerson')(a, o); if (extra) extra(a); });
};
MK.css = function (s) { var e = document.createElement('style'); e.textContent = s; document.head.appendChild(e); };
MK.el = function (html, parent) { var d = document.createElement('div'); d.innerHTML = html.trim(); var n = d.firstChild; (parent || document.body).appendChild(n); return n; };
})();`;

/* ---------------- oyunu aç, limanı doldur ---------------- */
async function startGame(b, o) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CON', m.text()); });
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(() => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', o.name || 'Temel Balık Evi').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(o => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = o.cash; S.rep = o.rep;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    BT.HUT.lvl = 3; BT.DEPOT.lvl = 2; BT.WHALL.built = true;
    BT.slots[0].b = 'cay'; BT.slots[2].b = 'pano'; BT.slots[3].b = 'depo'; BT.slots[5].b = 'buz';
    BT.reassignWorkers();
    BT.day.n = o.day || 12; BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  }, o);
  await sleep(o.warm || 16000);
  await p.addScriptTag({ content: LIB });
  return p;
}
const clean = p => p.evaluate(() => {
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner', 'objective'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); e.style.visibility = 'hidden'; } });
  HKG.v('syncPause')();
});
async function goTo(p, x, y, t, z) {
  await p.evaluate(([x, y, t, z]) => { if (z) { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); } BT.player.x = x; BT.player.y = y; if (t != null) BT.day.t = BT.DAY_LEN * t; }, [x, y, t, z]);
  await clean(p); await sleep(2200); await clean(p);
}
/* oyunu dondur (son kare tuvalde kalır) */
const freeze = p => p.evaluate(() => { window.__raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; });

/* ===================================================================== */
const IDEAS = {};

/* ---------- debug: ızgara işaretleri ---------- */
IDEAS.dbg = async b => {
  const p = await startGame(b, { cash: 48250, rep: 2400 });
  const [x, y, z] = (process.argv[3] || '2.5,4.5,2').split(',').map(Number);
  await goTo(p, x, y, 0.45, z);
  const info = await p.evaluate(() => {
    for (let gx = -1; gx <= 24; gx++) for (let gy = -1; gy <= 24; gy++) MK.ent(gx, gy, () => { const g = HKG.ctx, X = HKG.pX(gx, gy), Y = HKG.pY(gx, gy, 0); g.fillStyle = (gx % 2 === 0 && gy % 2 === 0) ? '#ff00ff' : '#00ffff'; g.fillRect(X - 0.5, Y - 0.5, 1, 1); if (gx % 2 === 0 && gy % 2 === 0) { g.font = (HKG.PXS>2?'3px':'4px')+' monospace'; g.fillStyle = '#fff'; g.fillText(gx + ',' + gy, X + 1, Y - 1); } });
    const w = BT.workers[0], c = BT.customers[0];
    return { ctr: BT.counters.map(c => [c.key, +c.x.toFixed(1), +c.y.toFixed(1), c.z]), safe: BT.safe, scr: BT.scr(BT.safe.x, BT.safe.y), wk: w && Object.keys(w), wo: w && w.o, cu: c && Object.keys(c), co: c && c.o, hero: BT.S.hero };
  });
  console.log(JSON.stringify(info));
  await sleep(300);
  await p.screenshot({ path: OUT + '/_dbg.png' });
  await p.context().close();
};

/* ---------- 6. Liman kedileri ---------- */
IDEAS[6] = async b => {
  const p = await startGame(b, { cash: 48250, rep: 2400 });
  await goTo(p, 10.2, 7.6, 0.45, 3);
  await p.evaluate(() => {
    const L = MK.L, H = HKG, cats = H.v('cats');
    cats.length = 0;                                     /* gezgin kediler yerine sahnenin kedileri */
    const HX = 11.5, HY = 7.2;                           /* kedi evi */
    const house = MK.spr('kediEvi', bb => {
      L.shadowB(bb, 0, 3, 22, 7, 0.3);
      const U0 = -7, U1 = 7, V0 = -6, V1 = 6, WH = 10;
      const wood = '#b07c48', woodD = '#7e5230', plank = '#94653a';
      L.isoBox(bb, U0, V0, U1, V1, 0, WH, {
        top: () => '#c9975f',
        left: (u, z) => {                                /* ön-sol yüz: kemerli kapı + tahta */
          const du = u - 7, dz = z - 4.4;
          if (Math.abs(du) < 2.6 && z < 4.4) return z < 0.8 ? '#3a2416' : '#22150c';
          if (du * du + dz * dz < 6.8) return '#22150c';
          if (du * du + dz * dz < 10.5) return '#d9b47c';  /* kapı pervazı */
          if (Math.abs(z - 3.2) < 0.45 || Math.abs(z - 6.6) < 0.45) return plank;
          return u < 1.2 ? '#c48e56' : wood;
        },
        right: (v, z) => {                               /* sağ yüz: gölgede, küçük yuvarlak pencere */
          const dv = v - 6, dz = z - 5.6;
          if (dv * dv + dz * dz < 3.2) return '#2b4f66';
          if (dv * dv + dz * dz < 6) return '#c9a46c';
          if (Math.abs(z - 3.2) < 0.45 || Math.abs(z - 6.6) < 0.45) return '#5e3b20';
          return woodD;
        }
      });
      const P = MK.P, ov = 2, zr = WH + 8;
      const tileC = (y, base) => (y % 3 === 0 ? MK.dark(base, 0.22) : base);
      MK.poly(bb, [P(U0 - 1, V0 - ov, WH), P(U1 + 1, V0 - ov, WH), P(U1 + 1, 0, zr), P(U0 - 1, 0, zr)], (x, y) => tileC(y, '#cb5b40'));
      MK.poly(bb, [P(U1, V0, WH), P(U1, V1, WH), P(U1, 0, zr)], (x, y) => (y % 4 === 0 ? '#5e3b20' : '#6f4526'));
      MK.poly(bb, [P(U0 - 1, V1 + ov, WH), P(U1 + 1, V1 + ov, WH), P(U1 + 1, 0, zr), P(U0 - 1, 0, zr)], (x, y) => {
        const c = tileC(y, '#b5432f'); return x < -10 ? MK.lite(c, 0.12) : c; });
      /* mahya */
      const a = P(U0 - 1, 0, zr), c2 = P(U1 + 1, 0, zr);
      for (let i = 0; i <= 1; i += 0.02) bb.set(a[0] + (c2[0] - a[0]) * i, a[1] + (c2[1] - a[1]) * i - 1, '#e07a5a');
      bb.outline(0.62);
    });
    /* mama kabı: emaye, içinde hamsi */
    const bowl = MK.spr('kab', bb => {
      bb.ellipse(0, 0, 6, 3, '#2f6f9e'); bb.ellipse(0, -1, 6, 2, '#e8eef2'); bb.ellipse(0, -1, 5, 1, '#c9d3da');
      bb.rect(-3, -2, 5, 1, '#9fb8c8'); bb.rect(-1, -3, 4, 1, '#bcd0dc'); bb.set(2, -3, '#4d6a80'); bb.set(-4, -2, '#4d6a80');
      bb.rect(-6, 0, 12, 1, '#245a82'); bb.outline(0.6);
    });
    /* ad tabelası */
    const sign = MK.spr('pamukTabela', bb => {
      bb.rect(-1, -16, 2, 16, '#6f4526');
      bb.rect(-12, -24, 24, 10, '#c9975f'); bb.rect(-12, -24, 24, 1, '#e2b882'); bb.rect(-12, -15, 24, 1, '#8a5c35');
      L.text(bb, 'PAMUK', -9, -22, '#3a2614');
      bb.outline(0.6);
    });
    /* ağızdaki hamsi */
    const fish = MK.spr('agizHamsi', bb => {
      bb.rect(0, 0, 8, 2, '#a9c3d2'); bb.rect(1, 0, 6, 1, '#5f7f96'); bb.set(8, 0, '#a9c3d2'); bb.set(9, -1, '#7d9bb0'); bb.set(9, 2, '#7d9bb0'); bb.set(8, 1, '#a9c3d2');
      bb.set(0, 0, '#3b4f5e'); bb.outline(0.6);
    });
    MK.ent(HX, HY, () => MK.blit(house, HX, HY));
    MK.ent(HX + 0.9, HY + 0.9, () => MK.blit(bowl, HX + 0.9, HY + 0.9));
    MK.ent(HX + 1.2, HY - 0.5, () => MK.blit(sign, HX + 1.2, HY - 0.5));
    MK.cat(HX + 0.35, HY + 1.25, '#f1ece0', 'sit', 1);                 /* Pamuk */
    MK.ent(HX + 0.36, HY + 1.26, () => H.v('drawEmote')(HX + 0.35, HY + 1.25, 25, 'love'));
    MK.cat(HX - 0.3, HY - 0.25, '#8b8f96', 'sleep', 1, 15.5);           /* Duman: çatıda uyuyor */
    /* Karamel: tezgâhtan hamsiyle kaçıyor */
    const RX = HX - 0.7, RY = HY + 1.7;
    MK.cat(RX, RY, '#d8a25a', 'walk', -1);
    MK.ent(RX + 0.01, RY + 0.01, () => {
      const sx = H.pX(RX, RY), sy = H.pY(RX, RY, 0), g = H.ctx;
      L.blit(fish, sx - 10, sy - 6.5);
      g.fillStyle = 'rgba(244,233,210,.85)';             /* hız çizgileri */
      [[9, -5, 4], [11, -3, 3], [10, -7, 2.5]].forEach(([dx, dy, w]) => g.fillRect(sx + dx, sy + dy, w, 0.5));
      [[12.5, -0.6], [14.5, -1.3]].forEach(([dx, dy]) => { g.fillStyle = 'rgba(203,185,141,.9)'; g.fillRect(sx + dx, sy + dy, 1.5, 1); });
    });
    /* tezgâhtaki satıcı şaşkın */
    const sw = BT.workers.slice().sort((a, b) => Math.hypot(a.x - 8.9, a.y - 3.6) - Math.hypot(b.x - 8.9, b.y - 3.6))[0];
    window.__sw = sw;
    MK.ent(sw.x + 0.01, sw.y + 0.01, () => H.v('drawEmote')(sw.x, sw.y, 31, 'angry'));
  });
  await sleep(400);
  await p.evaluate(() => { BT.player.x = 9.7; BT.player.y = 5.9; BT.customers.forEach(c => { c.sayT = 0; if (Math.hypot(c.x - 11.3, c.y - 8.3) < 2.6) { c.x += 30; c.y += 30; } });
    BT.workers.forEach(w => { if (w !== window.__sw && Math.hypot(w.x - 11.3, w.y - 8.3) < 2.6) { w.x += 30; w.y += 30; } }); });
  await sleep(60);
  await freeze(p);
  /* üst bildirim + KEDİ ALBÜMÜ çekmecesi */
  await p.evaluate(() => {
    const H = HKG;
    function catIcon(col, st, dir) {
      const c = document.createElement('canvas'); c.width = 34; c.height = 30;
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(2, 0, 0, 2, 17, 26);
      H.withCtx(g, 2, () => window.HKA.drawCat({ x: 0, y: 0, dir: dir || 1, st: st, col: col }));
      c.style.cssText = 'image-rendering:pixelated;width:34px;height:30px;display:block'; return c;
    }
    MK.css(`
      .mkToast{position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:9px;
        background:linear-gradient(180deg,var(--paper) 0,var(--paper) 70%,var(--paper2) 100%);color:var(--inkB);
        border:2px solid #5a3e1e;border-top:4px solid var(--brass);border-radius:var(--rad);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.6),var(--deep);padding:7px 14px 8px 8px;white-space:nowrap}
      .mkToast .pf{background:#e9d6ab;border:2px solid #5a3e1e;border-radius:2px;padding:1px}
      .mkToast b{display:block;font-size:14.5px;letter-spacing:.3px}
      .mkToast small{display:block;font-size:12px;color:#6a4a22;margin-top:2px}
      .mkToast small em{font-style:normal;color:#1d6a35}
      .dcard .ic canvas{margin:0 0 2px -2px}
      .dcard.lock{opacity:.8}
      body.ince .dcard .buy.done{background:var(--pnl);color:var(--green);border-color:#17532a}
      .dcard .tag{font-size:9.5px;color:var(--gold);letter-spacing:.5px}
    `);
    const t = MK.el(`<div class="mkToast"><div class="pf"></div><div><b>Pamuk sahiplenildi!</b><small>Kedi evine yerleşti · <em>müşteri sabrı +%5</em></small></div></div>`);
    t.querySelector('.pf').appendChild(catIcon('#f1ece0', 'sit', 1));
    document.querySelector('.dtab[data-t="build"]').click();
  });
  await sleep(500);
  await p.evaluate(() => {
    const H = HKG;
    function catIcon(col, st, dir) {
      const c = document.createElement('canvas'); c.width = 34; c.height = 30;
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(2, 0, 0, 2, 17, 26);
      H.withCtx(g, 2, () => window.HKA.drawCat({ x: 0, y: 0, dir: dir || 1, st: st, col: col }));
      c.style.cssText = 'image-rendering:pixelated;width:51px;height:45px;display:block'; return c;
    }
    document.getElementById('dpTitle').textContent = 'KEDİ ALBÜMÜ · 3/8';
    document.getElementById('dpSub').classList.add('hidden');
    const cards = [
      ['#f1ece0', 'sit', 'Pamuk', 'beyaz', 'Müşteri sevindirir: kuyruk sabrı +%5', '<button class="buy done">SAHİPLENDİN</button>'],
      ['#8b8f96', 'sleep', 'Duman', 'tekir', 'Fare kovar: depoda bozulma −%10', '<button class="buy cf">BESLE · 3 HAMSİ</button>'],
      ['#d8a25a', 'walk', 'Karamel', 'sarman', 'Balık çalar! Ara sıra komik olay', '<button class="buy">İSİM VER</button>'],
      ['#2c2622', 'sit', '???', 'kara kedi', 'Gece iskelede görüldü…', '<button class="buy no">KİLİTLİ</button>']
    ];
    const box = document.getElementById('dpCards'); box.innerHTML = '';
    cards.forEach((c, i) => {
      const d = document.createElement('div'); d.className = 'dcard' + (i === 0 ? ' glow' : '') + (i === 3 ? ' lock' : '');
      d.innerHTML = `<div class="ic"></div><span class="tag">${c[3].toLocaleUpperCase('tr')}</span><b>${c[2]}</b><small>${c[4]}</small>${c[5]}`;
      const ic = catIcon(c[0], c[1], 1); if (i === 3) ic.style.filter = 'brightness(.35)';
      d.querySelector('.ic').appendChild(ic); box.appendChild(d);
    });
    box.scrollLeft = 0;
  });
  await sleep(300);
  await p.screenshot({ path: OUT + '/fikir-06.png' });
  await p.context().close();
};

/* ---------- 8. Haftalık Liman Ligi ---------- */
IDEAS[8] = async b => {
  const p = await startGame(b, { cash: 84210, rep: 2400, warm: 12000 });
  await goTo(p, 6.5, 4.5, 0.45, 2);
  await freeze(p);
  await p.evaluate(() => {
    const L = MK.L;
    /* madalya: ince piksel, ışık sol üstten, koyu kontur */
    function medal(key, base, rib1, rib2, sym) {
      return MK.spr('madalya:' + key, bb => {
        const hi = MK.lite(base, 0.45), lo = MK.dark(base, 0.3), lo2 = MK.dark(base, 0.5);
        bb.rect(-6, -22, 5, 11, rib1); bb.rect(1, -22, 5, 11, rib2); bb.rect(-6, -22, 5, 1, MK.lite(rib1, 0.3)); bb.rect(1, -22, 5, 1, MK.lite(rib2, 0.3));
        bb.rect(-2, -22, 1, 11, MK.dark(rib1, 0.3)); bb.rect(5, -22, 1, 11, MK.dark(rib2, 0.3));
        for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) {
          const d = x * x + y * y; if (d > 90) continue;
          const s = (x + y) / 13;
          bb.set(x, y, d > 56 ? (s < -0.25 ? hi : s > 0.35 ? lo2 : base) : (s < -0.5 ? hi : s > 0.45 ? lo : base));
        }
        for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; bb.set(Math.round(Math.cos(t) * 7.2), Math.round(Math.sin(t) * 7.2), lo); }
        const sc = MK.dark(base, 0.62);
        sym.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') bb.set(i - (row.length >> 1), j - (sym.length >> 1), sc); });
        bb.set(-5, -5, '#ffffff'); bb.set(-4, -6, '#ffffff'); bb.set(-6, -4, MK.lite(base, 0.7));
        bb.outline(0.65);
      });
    }
    const NET = ['#.#.#.#', '.#.#.#.', '#.#.#.#', '.#.#.#.', '#.#.#.#', '.#.#.#.', '#.#.#.#'];
    const HOOK = ['...#...', '...#...', '...#...', '...#...', '#..#...', '#..#..#', '.###.#.', '.......'];
    const ANCH = ['..###..', '...#...', '#######', '...#...', '...#...', '#..#..#', '.##.##.', '.......'];
    const tiers = [
      ['bronz', '#c98a4f', '#a83d2b', '#d9a441', NET, 'BRONZ AĞ', 'geçen hafta'],
      ['gumus', '#c9d3dc', '#2a4c7d', '#e8eef2', HOOK, 'GÜMÜŞ OLTA', 'bu hafta'],
      ['altin', '#ffc94a', '#a83d2b', '#2a4c7d', ANCH, 'ALTIN ÇAPA', 'ilk 5 çıkar']
    ];
    MK.css(`
      #boardScr .card{padding:13px 13px 11px} #boardScr h2{margin-bottom:4px}
      .lgTiers{display:flex;align-items:flex-end;justify-content:center;gap:4px;margin:0 0 6px}
      .lgT{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 6px 5px;border:2px solid transparent;border-radius:3px;min-width:86px}
      .lgT b{font-size:11px;letter-spacing:.6px;color:var(--ink2)} .lgT small{font-size:9.5px;color:var(--ink2);opacity:.8}
      .lgT.on{background:linear-gradient(180deg,#25486a,#1a3448);border-color:var(--brass);box-shadow:var(--hi),var(--deepS)}
      .lgT.on b{color:var(--gold)} .lgT.off canvas{filter:saturate(.8) brightness(.92)}
      .lgArr{color:var(--brass);font-size:14px;padding-bottom:26px}
      .lgInfo{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--ink2);margin:0 1px 7px}
      .lgInfo .tm{background:#0a1a27;border:2px solid var(--edge);border-top-color:#2d5170;padding:3px 7px;color:var(--gold);font-size:12px;border-radius:3px}
      .lgUp{display:flex;align-items:center;gap:6px;margin:5px 0 7px;color:var(--green);font-size:10.5px;letter-spacing:1.5px;white-space:nowrap}
      .lgUp:before,.lgUp:after{content:"";flex:1;height:0;border-top:2px dashed var(--green)}
      #boardScr .brow{padding:4px 9px;margin-bottom:3px} #boardScr .brow .rk{width:23px;height:23px;flex-basis:23px}
      #boardScr .card{max-height:96vh} .bsep{margin:0 0 2px}
      .brow .bs{font-size:12.5px}
      .brow .mv{font-size:10px;margin-left:4px} .mv.u{color:var(--green)} .mv.d{color:#ff9b8a}
      #boardRows{max-height:none}
      .lgPrize{display:flex;align-items:center;gap:9px;margin-top:9px;padding:7px 9px;background:linear-gradient(180deg,var(--paper) 0,var(--paper2) 100%);
        border:2px solid #5a3e1e;border-top:3px solid var(--brass);border-radius:3px;color:var(--inkB);font-size:11.5px;line-height:1.35}
      .lgPrize b{display:block;font-size:12px;letter-spacing:.5px;color:#7a2b10}
      #boardScr .go{margin-top:9px}
    `);
    const scr = document.getElementById('boardScr'); scr.classList.remove('hidden');
    document.getElementById('boardTitle').textContent = 'LİMAN LİGİ';
    const sub = document.getElementById('boardSub'); sub.textContent = 'Her hafta 30 balıkçı · haftalık gelirle sıralanır'; sub.style.marginBottom = '6px';
    const tw = document.createElement('div'); tw.className = 'lgTiers';
    tiers.forEach((t, i) => {
      if (i) { const a = document.createElement('span'); a.className = 'lgArr'; a.textContent = '›'; tw.appendChild(a); }
      const d = document.createElement('div'); d.className = 'lgT' + (i === 1 ? ' on' : ' off');
      d.appendChild(MK.ui(medal(t[0], t[1], t[2], t[3], t[4]), 2));
      d.insertAdjacentHTML('beforeend', `<b>${t[5]}</b><small>${t[6]}</small>`); tw.appendChild(d);
    });
    sub.after(tw);
    tw.insertAdjacentHTML('afterend', '<div class="lgInfo"><span>Grup 14 · sıran <b style="color:var(--gold)">7.</b> / 30</span><span class="tm">KALAN 2g 4s</span></div>');
    const rows = [
      ['Poyraz Su Ürünleri', 'Sv.11 · Sinop', '$142.880', '', 0],
      ['Reis Balıkçılık', 'Sv.10 · Rize', '$131.505', '▲2', 0],
      ['Uzun Kayık Ltd.', 'Sv.10 · Ordu', '$118.240', '▼1', 0],
      ['Fadime\'nin Tezgâhı', 'Sv.9 · Trabzon', '$104.770', '▼1', 0],
      ['Gümüş Ağ Balıkçılık', 'Sv.9 · Giresun', '$97.315', '▲3', 0],
      ['Sinoplu Kemal', 'Sv.9 · Sinop', '$91.060', '', 0],
      ['Temel Balık Evi', 'Sv.8 · 6.170 $ ile yükselirsin', '$84.210', '▲4', 1],
      ['Karadeniz Hamsicisi', 'Sv.8 · Samsun', '$79.935', '▼2', 0],
      ['Dalga Kardeşler', 'Sv.7 · Artvin', '$73.410', '', 0]
    ];
    let h = '';
    rows.forEach((r, i) => {
      const m = i < 3 ? ' m' + (i + 1) : '';
      if (i === 5) h += '<div class="lgUp">▲ YÜKSELME ÇİZGİSİ ▲</div>';
      h += `<div class="brow${m}${r[4] ? ' me' : ''}"><span class="rk">${i + 1}</span><span class="bn">${r[0]}${r[4] ? '<em>SEN</em>' : ''}<small>${r[1]}</small></span><span class="bs">${r[2]}${r[3] ? `<span class="mv ${r[3][0] === '▲' ? 'u' : 'd'}">${r[3]}</span>` : ''}</span></div>`;
    });
    h += '<div class="bsep">· · · 21 balıkçı daha · · ·</div>';
    document.getElementById('boardRows').innerHTML = h;
    document.getElementById('boardNote').innerHTML = '';
    /* ödül: tente kumaşı + bayrak (kozmetik) */
    const tente = MK.spr('altinTente', bb => {
      for (let x = 0; x < 22; x++) for (let y = 0; y < 9; y++) bb.set(x, y + (x % 6 > 2 ? 0 : 0), (Math.floor(x / 3) % 2) ? '#ffc94a' : '#2a4c7d');
      for (let x = 0; x < 22; x++) { if (x % 3 !== 1) bb.set(x, 9, (Math.floor(x / 3) % 2) ? '#d99a1c' : '#1d3a5e'); }
      bb.rect(0, 0, 22, 1, '#fff2b0', 0.5); bb.rect(-1, 0, 1, 16, '#6f4526'); bb.rect(22, 0, 1, 16, '#6f4526');
      bb.rect(26, -6, 1, 22, '#5d666e'); bb.rect(27, -6, 9, 6, '#2a4c7d'); bb.rect(27, -6, 9, 1, '#3d64a0');
      const A = ['.#.', '###', '.#.', '#.#']; A.forEach((r, j) => { for (let i = 0; i < 3; i++) if (r[i] === '#') bb.set(30 + i, -5 + j, '#ffc94a'); });
      bb.outline(0.6);
    });
    const pr = document.createElement('div'); pr.className = 'lgPrize';
    pr.appendChild(MK.ui(tente, 1.6));
    pr.insertAdjacentHTML('beforeend', '<div><b>ALTIN ÇAPA ÖDÜLÜ</b>Lacivert-altın tente ve çapa bayrağı. Yalnız görünüm; denge bozulmaz.</div>');
    document.getElementById('boardNote').after(pr);
    document.getElementById('boardClose').textContent = 'KAPAT';
  });
  await sleep(300);
  await p.screenshot({ path: OUT + '/fikir-08.png' });
  await p.context().close();
};

/* ---------- 9. Kahvehane söylentileri ---------- */
IDEAS[9] = async b => {
  const p = await startGame(b, { cash: 52400, rep: 2400, warm: 12000 });
  const TX = 18.4, TY = 9.8;                               /* tavla masası (meydan) */
  await goTo(p, TX - 0.3, TY + 0.9, 0.45, 3);
  await p.evaluate(([TX, TY]) => {
    const L = MK.L, H = HKG, PAL = H.PAL;
    H.v('cats').length = 0;
    const ows = window.HKA.drawWoodSign;                    /* masanın önündeki tabela kalkar */
    window.HKA.drawWoodSign = (o, sd) => (Math.hypot(o.x - TX, o.y - TY) < 3 ? true : ows(o, sd));
    /* çay ocağı: oyunun kendi semaveri, meydanda */
    const ocak = { id: 'mk', b: 'cay', x: TX - 1.2, y: TY - 1.3, z: 0 };
    MK.ent(ocak.x, ocak.y, () => H.v('drawBuilding')(ocak));
    /* tavla masası + açık tavla */
    const table = MK.spr('tavlaMasa', bb => {
      L.shadowB(bb, 0, 2, 20, 6, 0.28);
      L.isoBox(bb, -9, -9, 9, 9, 0, 8, { top: () => '#8a5a33', left: (u, z) => (z < 1.2 ? '#3a2416' : u < 1 ? '#87562f' : '#6f4526'), right: (v, z) => (z < 1.2 ? '#2a180c' : '#4f301a') });
      L.isoBox(bb, -8, -7, 8, 7, 8, 1.2, {
        top: (u, v) => {
          if (u < 0.9 || u > 15.1 || v < 0.9 || v > 13.1) return '#5a3418';
          if (Math.abs(u - 8) < 0.75) return '#4a2a12';
          const half = u < 8 ? 0.9 : 8.75, uu = u - half, w = 7.1 / 6, col = Math.floor(uu / w), cx = (col + 0.5) * w;
          const dv = v < 7 ? v - 0.9 : 13.1 - v, k = 1 - dv / 5.2;
          if (k > 0 && Math.abs(uu - cx) < w * 0.5 * k) return (col + (v < 7 ? 0 : 1)) % 2 ? '#a83d2b' : '#2a4c7d';
          return '#ead7aa';
        }, left: () => '#6a3c1c', right: () => '#4a2a12'
      });
      bb.outline(0.62);
      /* pullar */
      const P = (u, v) => MK.P(u, v, 9.4);
      [[-6, -5, 1], [-6, -4, 1], [-5, 5, 0], [-4, 5, 0], [2, -5, 0], [3, -5, 0], [3, -4, 0], [6, 4, 1], [5, 5, 1], [-1.5, 5, 1]].forEach(([u, v, w]) => {
        const [x, y] = P(u, v), c = w ? '#f4ecd8' : '#2a2018', e = w ? '#9a8c72' : '#000000';
        bb.rect(x - 1, y, 3, 1, c); bb.set(x, y - 1, c); bb.rect(x - 1, y + 1, 3, 1, e);
      });
      /* zarlar */
      const [dx, dy] = P(-1, -1); bb.rect(dx, dy, 2, 2, '#ffffff'); bb.set(dx + 1, dy + 1, '#2a2018');
      const [ex, ey] = P(1.5, 1); bb.rect(ex, ey, 2, 2, '#ffffff'); bb.set(ex, ey, '#2a2018');
    });
    MK.ent(TX, TY, () => MK.blit(table, TX, TY));
    /* ince belli çay bardağı (tabağıyla) */
    const glass = MK.spr('cayBardak', bb => {
      bb.rect(-3, 0, 7, 1, '#e8eef2'); bb.rect(-2, 1, 5, 1, '#b9c6cf');
      bb.rect(-1, -6, 3, 1, '#f6efe0'); bb.rect(-1, -5, 3, 2, '#b8401c'); bb.set(-1, -5, '#e07a3a');
      bb.set(0, -3, '#a3361a'); bb.rect(-1, -2, 3, 2, '#b8401c'); bb.set(-1, -2, '#d9662e');
      bb.outline(0.55);
    });
    const glassAt = (u, v, z) => { const g = H.ctx; return () => { L.blit(glass, H.pX(TX, TY) + (u - v), H.pY(TX, TY, 0) + (u + v) / 2 - z); }; };
    MK.ent(TX + 0.02, TY + 0.02, glassAt(-9.5, 6.5, 8.6));
    MK.ent(TX + 0.03, TY + 0.03, glassAt(7.5, -9.5, 8.6));
    /* tabure + oturan balıkçı */
    const stool = MK.spr('tabure', bb => {
      bb.ellipse(0, -5, 5, 2, '#c9a85c'); bb.rect(-4, -6, 8, 1, '#e2c27a'); bb.set(-3, -7, '#e2c27a');
      for (let i = -4; i <= 4; i += 2) bb.set(i, -4, '#9a7a38');
      bb.rect(-4, -3, 1, 3, '#6f4526'); bb.rect(3, -3, 1, 3, '#4f301a'); bb.rect(0, -3, 1, 4, '#5e3b20');
      bb.outline(0.6);
    });
    function seated(x, y, o, sayGlass) {
      const a = { x: x, y: y, z: -5, vx: 0, vy: 0, bob: 0, act: 0 };
      MK.ent(x, y, () => {
        const g = H.ctx, sx = H.pX(x, y), sy = H.pY(x, y, 0);
        MK.blit(stool, x, y);
        g.save(); g.beginPath(); g.rect(sx - 40, sy - 80, 80, 80 - 5.5); g.clip();
        H.v('drawPerson')(a, o); g.restore();
      });
    }
    const sk = PAL.skin, hr = PAL.hair;
    seated(TX - 0.75, TY + 0.75, { cap: '#0f2a3d', beard: true, vest: '#0f2a3d', coat: '#2a4c7d', coat2: '#23406a', skin: sk[1], hair: hr[0], pants: '#1a2836', face: 1, hairStyle: 0 });
    seated(TX + 0.8, TY - 0.8, { cap: '#5a4a3a', vest: '#5a4a3a', glasses: true, must: true, hairStyle: 4, coat: '#8a6a48', coat2: '#7a5a3a', skin: sk[0], hair: '#cfc8bc', pants: '#3a3226', face: -1 });
    /* ayakta seyreden, elinde çay */
    MK.person(TX - 0.95, TY - 0.15, { beanie: '#8d2a2a', knit: '#cfe3f0', beard: true, coat: '#3a6230', coat2: '#2f5228', pants: '#2b3a45', skin: sk[2], hair: hr[1], face: -1, hairStyle: 1 },
      a => { L.blit(glass, H.pX(a.x, a.y) - 6, H.pY(a.x, a.y, 0) - 10); });
    window.__sp = BT.scr(TX + 0.8, TY - 0.8, 34);
    window.__tb = BT.scr(TX, TY, 0);
  }, [TX, TY]);
  await sleep(300);
  await clean(p);
  await p.evaluate(([TX, TY]) => new Promise(r => {        /* dinleyen oyuncu: kamerayı kaydırmadan iki kare sonra dondur */
    BT.player.x = TX - 1.55; BT.player.y = TY + 1.35; BT.customers.forEach(c => { c.sayT = 0; });
    const o = window.requestAnimationFrame.bind(window);
    o(() => o(() => { window.requestAnimationFrame = () => 0; r(); }));
  }), [TX, TY]);
  await p.evaluate(() => {
    const sp = window.__sp;
    MK.css(`
      .mkBub{position:fixed;z-index:7;max-width:230px;background:linear-gradient(180deg,var(--paper) 0,var(--paper) 75%,var(--paper2) 100%);
        color:var(--inkB);border:2px solid #5a3e1e;border-radius:4px;box-shadow:inset 0 1px 0 rgba(255,255,255,.6),var(--deep);padding:7px 10px 8px;font-size:12.5px;line-height:1.38}
      .mkBub small{display:flex;justify-content:space-between;gap:8px;font-size:10px;letter-spacing:.6px;color:#7a2b10;margin-bottom:3px}
      .mkBub small i{font-style:normal;color:#6a4a22;letter-spacing:0}
      .mkBub:after{content:"";position:absolute;left:var(--tx);bottom:-9px;width:12px;height:9px;background:#5a3e1e;clip-path:polygon(0 0,100% 0,30% 100%)}
      .mkBub:before{content:"";position:absolute;left:calc(var(--tx) + 2px);bottom:-5px;width:8px;height:6px;background:var(--paper2);clip-path:polygon(0 0,100% 0,25% 100%);z-index:1}
      .mkTrust{position:fixed;right:6px;top:62px;z-index:6;display:flex;align-items:center;gap:7px;padding:5px 9px 5px 8px;
        background:linear-gradient(180deg,rgba(26,52,74,.95),rgba(12,28,42,.95));border:2px solid var(--brass);border-radius:var(--rad);box-shadow:var(--hi),var(--deepS)}
      .mkTrust .lb{font-size:9px;color:var(--ink2);letter-spacing:.8px;line-height:1.1}
      .mkTrust .lb b{display:block;font-size:12.5px;color:var(--brass2);letter-spacing:1px}
      .mkTrust .dt{display:flex;gap:3px}
      .mkTrust .dt i{width:11px;height:11px;border:2px solid #081521;border-radius:50%;background:#0a1a27}
      .mkTrust .dt i.on{background:radial-gradient(circle at 35% 35%,#fff2b0 0 18%,#ffc94a 20% 70%,#d99a1c 72%)}
      .mkLog{position:fixed;left:6px;right:6px;bottom:calc(60px + env(safe-area-inset-bottom,0px));z-index:6;padding:9px 9px 8px}
      .mkLog:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(90deg,var(--kilim1) 0 2px,var(--kilim2) 2px 3px,var(--kilim3) 3px 5px,var(--kilim2) 5px 6px)}
      .mkLog .hd{display:flex;justify-content:space-between;align-items:center;margin:2px 0 6px}
      .mkLog .hd b{font-size:13px;color:var(--gold);letter-spacing:1px} .mkLog .hd span{font-size:10.5px;color:var(--ink2)}
      .mkLog .rw{display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:4px;border:2px solid var(--edge);border-radius:3px;
        background:linear-gradient(180deg,#25486a 0,#1f3d56 3px,#1a3448 100%);font-size:12px;line-height:1.25}
      .mkLog .rw p{flex:1;min-width:0} .mkLog .rw p small{display:block;font-size:10px;color:var(--ink2)}
      .mkLog .st{font-size:9.5px;letter-spacing:.6px;padding:3px 5px;border:2px solid;border-radius:2px;white-space:nowrap}
      .st.ok{color:#062f14;background:var(--green);border-color:#17532a} .st.no{color:#3a0a04;background:#ff9b8a;border-color:#6a1a10}
      .st.wt{color:#3a2401;background:var(--gold);border-color:#7a5406}
      .mkLog .rw button{font-family:inherit;font-size:10.5px;padding:5px 7px;background:linear-gradient(180deg,#6fe08a,#4cc46a);border:2px solid #1b5d31;color:#052b12;border-radius:2px;white-space:nowrap}
    `);
    const bub = MK.el(`<div class="mkBub"><small><span>CEMAL DAYI FISILDIYOR</span><i>söylenti</i></small>“Yarın Sinop açıklarında lüfer varmış. Ağını hazırla… ama benden duymadın!”</div>`);
    const w = 232; let left = Math.min(390 - w - 6, Math.max(6, sp.x - 40));
    bub.style.left = left + 'px'; bub.style.top = (sp.y - 98) + 'px'; bub.style.setProperty('--tx', (sp.x - left - 4) + 'px');
    MK.el(`<div class="mkTrust"><div class="lb">KAHVEHANE<b>GÜVEN</b></div><div class="dt"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div></div>`);
    MK.el(`<div class="mkLog pnl"><div class="hd"><b>KULAĞA GELENLER</b><span>doğru çıkan söylenti güveni artırır</span></div>
      <div class="rw"><span class="st ok">DOĞRU</span><p>Haşmet Bey bu hafta keyifsizmiş<small>Erken ödedin, faiz yemedin</small></p></div>
      <div class="rw"><span class="st no">YANLIŞ</span><p>Ordu'dan palamut gelecekmiş<small>Rıza Reis yine abartmış</small></p></div>
      <div class="rw"><span class="st wt">YARIN</span><p>Sinop açıklarında lüfer<small>Güven 3/5 · tutma ihtimali %60</small></p><button>AĞI HAZIRLA</button></div></div>`);
    document.getElementById('chBtn') && (document.getElementById('chBtn').style.visibility = 'hidden');
  });
  await sleep(300);
  await p.screenshot({ path: OUT + '/fikir-09.png' });
  await p.context().close();
};

/* ---------- 10. Tarif Defteri ---------- */
IDEAS[10] = async b => {
  const p = await startGame(b, { cash: 61800, rep: 2400, warm: 14000 });
  await goTo(p, 6.4, 20.4, 0.45, 2);
  await freeze(p);
  await p.evaluate(() => {
    const L = MK.L, D = MK.dark, Li = MK.lite, pxText = HKG.v('pxText');
    const BW = 185, BH = 204;
    const book = MK.spr('tarifDefteri', bb => {
      /* deri kapak */
      bb.rect(0, 2, BW, BH - 2, '#5e3219');
      for (let y = 2; y < BH; y++) for (let x = 0; x < BW; x++) if (MK.hash(x, y) > 0.86) bb.set(x, y, '#6a3a1e');
      bb.rect(0, 2, BW, 1, '#8a5432'); bb.rect(0, 2, 1, BH - 2, '#7a4626'); bb.rect(0, BH - 1, BW, 1, '#341a0a'); bb.rect(BW - 1, 2, 1, BH - 2, '#3a1e0c');
      [[0, 2], [BW - 7, 2], [0, BH - 7], [BW - 7, BH - 7]].forEach(([x, y]) => { bb.rect(x, y, 7, 7, '#c9952f'); bb.rect(x + 1, y + 1, 5, 1, '#e6be59'); bb.set(x + 3, y + 3, '#7a5418'); });
      /* sayfalar */
      const PY0 = 7, PY1 = BH - 6;
      function page(x0, x1, spineRight) {
        for (let y = PY0; y < PY1; y++) for (let x = x0; x < x1; x++) {
          const ds = spineRight ? x1 - 1 - x : x - x0;
          let c = ds < 3 ? '#cdb47e' : ds < 7 ? '#e0cc9c' : '#f4e6c4';
          if (ds >= 7 && (y - PY0) % 9 === 8 && y > PY0 + 22) c = '#dcc796';
          if (MK.hash(x * 3, y * 7) > 0.985) c = '#e6d2a4';
          bb.set(x, y, c);
        }
        bb.rect(x0, PY1, x1 - x0, 1, '#b89c66'); bb.rect(x0, PY1 + 1, x1 - x0, 1, '#d8c08a');
      }
      page(6, 92, true); page(93, BW - 6, false);
      bb.rect(92, PY0 - 1, 1, PY1 - PY0 + 3, '#3a1e0c');
      for (let y = PY0 + 9; y < PY1; y++) bb.set(16, y, '#d79a86');           /* sol sayfa kırmızı kenar çizgisi */
      /* kurdele */
      bb.rect(150, 0, 5, 7, '#a83d2b'); bb.rect(150, PY1, 5, 12, '#a83d2b'); bb.rect(151, PY1, 1, 12, '#c85a44');
      bb.set(150, PY1 + 12, '#a83d2b'); bb.set(154, PY1 + 12, '#a83d2b'); bb.rect(150, PY1 + 1, 5, 1, '#7a2b1d');
      /* --- hamsili pilav: bakır sini üstünde, hamsiler yelpaze gibi --- */
      const CX = 50, CY = 104;
      for (let y = -12; y <= 12; y++) for (let x = -34; x <= 34; x++) {
        const e = (x * x) / (34 * 34) + (y * y) / (12 * 12); if (e > 1) continue;
        const rim = e > 0.72, s = (x + 2 * y) / 40;
        bb.set(CX + x, CY + y, rim ? (s < -0.3 ? '#f0b070' : s > 0.35 ? '#7a3e1e' : '#c8763e') : (s < 0 ? '#a85a30' : '#8e4a26'));
      }
      for (let x = -30; x <= 30; x += 6) bb.set(CX + x, CY + Math.round(9 * Math.sqrt(1 - (x * x) / 1000)), '#e8a060');
      const RX = 25, RY = 22, DY = CY - 2;
      for (let y = -RY; y <= 0; y++) for (let x = -RX; x <= RX; x++) {
        const w = RX * Math.sqrt(Math.max(0, 1 - (y * y) / (RY * RY))); if (Math.abs(x) > w) continue;
        const v = x / Math.max(1, w), ang = Math.asin(Math.max(-1, Math.min(1, v))), band = (ang + Math.PI / 2) / (Math.PI / 9);
        const fb = band - Math.floor(band), lit = (x + y) / (RX + RY);
        let c = fb < 0.18 || fb > 0.88 ? '#3f5a6e' : fb < 0.45 ? '#9aaebb' : fb < 0.7 ? '#c9d3da' : '#7d93a3';
        if ((fb > 0.45 && fb < 0.7) && MK.hash(x + 40, y + 40) > 0.45) c = '#d8b070';     /* fırın kızarması */
        c = lit < -0.35 ? Li(c, 0.18) : lit > 0.3 ? D(c, 0.16) : c;
        bb.set(CX + x, DY + y, c);
      }
      for (let i = 0; i < 9; i++) {                                              /* kuyruklar sininin üstünde */
        const a = -Math.PI / 2 + (i + 0.5) * Math.PI / 9, tx = CX + Math.round(Math.sin(a) * (RX + 2)), ty = DY + 1;
        bb.set(tx - 1, ty, '#3f5a6e'); bb.set(tx + 1, ty, '#3f5a6e'); bb.set(tx, ty - 1, '#7d93a3');
      }
      bb.rect(CX - 3, DY - RY - 1, 7, 2, '#4a7a3a'); bb.set(CX - 4, DY - RY, '#6a9a4a'); bb.set(CX + 4, DY - RY - 1, '#6a9a4a'); bb.set(CX, DY - RY - 2, '#6a9a4a');
      bb.rect(CX - 8, DY - 3, 3, 2, '#f4f0e6'); bb.set(CX + 7, DY - 2, '#f4f0e6');                     /* kesik dilimde pirinç */
      [[-10, -30], [0, -33], [10, -30]].forEach(([dx, dy], k) => { for (let j = 0; j < 8; j++) bb.set(CX + dx + (j % 4 < 2 ? 0 : 1) * (k % 2 ? -1 : 1), DY + dy - j, '#ffffff', 0.55); });
      /* --- sağ sayfa: malzeme kutucukları --- */
      function slot(x, y, dashed) {
        for (let j = 0; j < 24; j++) for (let i = 0; i < 24; i++) {
          const edge = i === 0 || j === 0 || i === 23 || j === 23;
          if (edge) { if (!dashed || ((i + j) >> 1) % 2 === 0) bb.set(x + i, y + j, dashed ? '#8a6a3a' : '#6a4a22'); }
          else bb.set(x + i, y + j, i === 1 || j === 1 ? '#e2cfa0' : '#efe0b8');
        }
      }
      const S1 = [104, 34], S2 = [148, 34], S3 = [104, 74], S4 = [148, 74];
      slot(...S1); slot(...S2); slot(...S3); slot(...S4, true);
      /* hamsi */
      (() => { const [x, y] = [S1[0] + 3, S1[1] + 10];
        bb.rect(x + 2, y, 13, 3, '#9aaebb'); bb.rect(x + 3, y, 11, 1, '#3f5a6e'); bb.rect(x + 3, y + 2, 11, 1, '#e8eef2'); bb.rect(x + 1, y + 1, 2, 1, '#9aaebb');
        bb.set(x + 3, y + 1, '#141414'); bb.set(x + 15, y + 1, '#7d93a3'); bb.set(x + 16, y, '#7d93a3'); bb.set(x + 16, y + 2, '#7d93a3'); bb.set(x + 17, y - 1, '#3f5a6e'); bb.set(x + 17, y + 3, '#3f5a6e');
        bb.rect(x + 1, y + 6, 13, 3, '#9aaebb'); bb.rect(x + 2, y + 6, 11, 1, '#3f5a6e'); bb.rect(x + 2, y + 8, 11, 1, '#e8eef2'); bb.set(x + 2, y + 7, '#141414'); bb.set(x + 14, y + 7, '#7d93a3'); bb.set(x + 15, y + 6, '#3f5a6e'); bb.set(x + 15, y + 8, '#3f5a6e'); })();
      /* pirinç çuvalı */
      (() => { const [x, y] = [S2[0] + 5, S2[1] + 4];
        for (let j = 0; j < 15; j++) for (let i = 0; i < 14; i++) { const w = j < 3 ? 3 + j : 7; if (Math.abs(i - 6.5) > w) continue; bb.set(x + i, y + j + 2, i < 5 ? '#d8b878' : i > 10 ? '#9a7a48' : '#c9a85c'); }
        bb.rect(x + 4, y + 4, 6, 1, '#7a5a30'); bb.rect(x + 5, y, 4, 4, '#f4f0e6'); bb.set(x + 6, y - 1, '#f4f0e6'); bb.set(x + 4, y + 1, '#e8e2d2');
        [[1, 17], [3, 18], [12, 17], [14, 18], [16, 17]].forEach(([i, j]) => bb.set(x + i, y + j, '#f4f0e6')); })();
      /* tereyağı */
      (() => { const [x, y] = [S3[0] + 3, S3[1] + 7];
        bb.rect(x, y + 9, 18, 2, '#e8eef2'); bb.rect(x + 1, y + 11, 16, 1, '#b9c6cf');
        bb.rect(x + 3, y + 2, 12, 7, '#f2d06a'); bb.rect(x + 3, y + 2, 12, 1, '#fbe7a0'); bb.rect(x + 12, y + 3, 3, 6, '#d9b04a'); bb.rect(x + 3, y + 3, 1, 6, '#f8de86');
        bb.set(x + 6, y + 2, '#e8c45a'); bb.set(x + 7, y + 1, '#fbe7a0'); })();
      /* soru işareti */
      (() => { const [x, y] = [S4[0] + 8, S4[1] + 5], c = '#8a6a3a';
        bb.rect(x + 1, y, 6, 2, c); bb.rect(x, y + 1, 2, 3, c); bb.rect(x + 6, y + 1, 2, 5, c); bb.rect(x + 4, y + 6, 3, 2, c); bb.rect(x + 3, y + 8, 2, 3, c); bb.rect(x + 3, y + 12, 2, 2, c); })();
      /* + ve → işaretleri (mürekkep) */
      const ink = '#3a2614';
      bb.rect(132, 45, 7, 1, ink); bb.rect(135, 42, 1, 7, ink);
      bb.rect(132, 85, 7, 1, ink); bb.set(137, 84, ink); bb.set(137, 86, ink); bb.set(136, 83, ink); bb.set(136, 87, ink);
      bb.rect(95, 85, 5, 1, ink); bb.rect(97, 83, 1, 5, ink);
      /* YENİ TARİF! damgası (döndürülmüş, mürekkep dokulu) */
      const sc = document.createElement('canvas'); sc.width = 80; sc.height = 30; const sg = sc.getContext('2d');
      sg.fillStyle = '#000'; sg.fillRect(0, 0, 80, 2); sg.fillRect(0, 28, 80, 2); sg.fillRect(0, 0, 2, 30); sg.fillRect(78, 0, 2, 30);
      sg.fillRect(4, 4, 72, 1); sg.fillRect(4, 25, 72, 1); sg.fillRect(4, 4, 1, 22); sg.fillRect(75, 4, 1, 22);
      pxText(sg, 'YENİ TARİF!', 40, 10, 1, 2, true, '#000', 'center');
      const sd = sg.getImageData(0, 0, 80, 30).data, ang = -0.2, ca = Math.cos(ang), sa = Math.sin(ang), SX = 138, SY = 152;
      for (let y = -26; y <= 26; y++) for (let x = -48; x <= 48; x++) {
        const u = Math.round(x * ca + y * sa + 40), v = Math.round(-x * sa + y * ca + 15);
        if (u < 0 || v < 0 || u >= 80 || v >= 30 || sd[(v * 80 + u) * 4 + 3] < 128) continue;
        const h = MK.hash(x + 99, y + 77); if (h > 0.9) continue;
        bb.set(SX + x, SY + y, h > 0.75 ? '#c0503a' : '#a8281c', 0.88);
      }
    });
    MK.css(`
      #mkBook{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px;
        background:radial-gradient(ellipse at 50% 40%,rgba(10,30,46,.80),rgba(4,12,20,.93))}
      #mkBook .hd{display:flex;align-items:baseline;justify-content:space-between;width:370px}
      #mkBook .hd b{font-size:19px;color:var(--gold);letter-spacing:1px;text-shadow:1px 1px 0 #3a2401}
      #mkBook .hd span{font-size:11.5px;color:var(--ink2)}
      #mkBook .tabs{display:flex;gap:4px;width:370px;flex-wrap:wrap}
      #mkBook .tabs .chip{font-size:10px;padding:3px 6px;color:var(--ink2)} #mkBook .tabs .chip.on{background:var(--gold);color:#3a2401;border-color:#6a4704}
      #mkBook .tabs .chip.q{opacity:.55}
      #mkBook .bk{position:relative;filter:drop-shadow(0 6px 0 rgba(3,10,16,.55)) drop-shadow(0 10px 14px rgba(2,8,14,.5))}
      #mkBook .tx{position:absolute;color:#3a2614;font-family:"Pixelify Sans",monospace;line-height:1.3;white-space:nowrap}
      #mkBook .hw{transform:rotate(-1.5deg);transform-origin:left top}
      #mkBook .mkRow{display:flex;gap:6px;width:370px}
      #mkBook .mkRow .go{margin-top:0;flex:1.4} #mkBook .mkRow .alt{flex:1;margin:0}
    `);
    const ov = MK.el(`<div id="mkBook"><div class="hd"><b>TARİF DEFTERİ</b><span>Sayfa 4 / 12</span></div>
      <div class="tabs"><span class="chip">HAMSİ TAVA</span><span class="chip">BUĞULAMA</span><span class="chip">KUYMAK</span><span class="chip on">HAMSİLİ PİLAV</span><span class="chip q">? ? ?</span><span class="chip q">? ? ?</span></div>
      <div class="bk"></div>
      <div class="mkRow"><button class="alt">‹ SAYFA</button><button class="go">MENÜYE EKLE</button></div></div>`);
    const bk = ov.querySelector('.bk'); bk.appendChild(MK.ui(book, 2));
    const T = (x, y, s, html, cls) => bk.insertAdjacentHTML('beforeend', `<div class="tx ${cls || ''}" style="left:${x}px;top:${y}px;font-size:${s}px">${html}</div>`);
    T(36, 26, 19, 'Hamsili Pilav', 'hw');
    T(38, 52, 10.5, "Karadeniz'in bayram sofrası", 'hw');
    T(36, 278, 11, 'Pirinci tereyağında kavur,', 'hw');
    T(36, 296, 11, 'hamsiyi yelpaze gibi diz,', 'hw');
    T(36, 314, 11, 'fırında 30 dakika pişir.', 'hw');
    T(36, 346, 10.5, '<b style="color:#1d6a35">İtibar +40</b> · menü fiyatı <b>$38</b>', 'hw');
    T(206, 24, 11, '<b style="letter-spacing:1px">MALZEMELER</b>');
    T(208, 120, 9.5, 'Hamsi'); T(298, 120, 9.5, 'Pirinç'); T(204, 200, 9.5, 'Tereyağı'); T(294, 200, 9.5, 'Keşif!');
    T(206, 234, 10.5, 'Üçünü ocakta birleştir:', 'hw');
    T(206, 252, 10.5, 'yeni yemek menüye girer.', 'hw');
    T(206, 360, 10, "— Ayşe Ana'nın el yazısı", 'hw');
  });
  await sleep(400);
  await p.screenshot({ path: OUT + '/fikir-10.png' });
  await p.context().close();
};

/* ---------- 7. Gazete fotoğraf modu (paylaşım kartı) ---------- */
const NEWS = `(function(){
var pxText = HKG.v('pxText'), pxWrap = HKG.v('pxWrap'), seedRnd = HKG.v('seedRnd');
var INK = '#2c231a';
/* u: cihaz pikseli / kâğıt pikseli; fs: oyun ince pikseli → cihaz pikseli; ph: fotoğraf tuvali + kırpma */
window.MK.news = function (u, fs, ph) {
  var W = 172, H = 300, c = document.createElement('canvas'); c.width = W * u; c.height = H * u;
  var g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(u, 0, 0, u, 0, 0);
  var F = function (x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); };
  F(0, 0, W, H, '#e8dcc0');
  var r = seedRnd(101), i, j;
  for (i = 0; i < 260; i++) F(Math.floor(r() * W), Math.floor(r() * H), 1 + Math.floor(r() * 2), 1, r() > 0.5 ? '#ddd0b0' : '#efe5cc');
  F(0, 0, W, 1, '#d3c39f'); F(0, H - 1, W, 1, '#c6b58e'); F(0, 0, 1, H, '#d3c39f'); F(W - 1, 0, 1, H, '#c6b58e');
  F(W / 2, 0, 1, H, '#d6c7a3');
  F(6, 5, W - 12, 1, INK);
  pxText(g, 'LİMAN GAZETESİ', W / 2, 13, 2, 2, false, INK, 'center');
  F(6, 30, W - 12, 2, INK); F(6, 43, W - 12, 1, INK);
  pxText(g, '27 HAZİRAN 1974', 8, 34, 1, 1, false, INK, 'left');
  pxText(g, '25 KURUŞ', W - 8, 34, 1, 1, false, INK, 'right');
  pxText(g, 'LİMANDAN REKOR HABERİ', W / 2, 48, 1, 1, false, '#7a2b10', 'center');
  var lines = pxWrap('TEMEL BALIK EVİ 300. MÜŞTERİSİNİ AĞIRLADI!', 1, true, W - 14), hy = 58;
  for (i = 0; i < lines.length; i++) { pxText(g, lines[i], W / 2, hy, 1, 2, true, INK, 'center'); hy += 19; }
  var ax = 7, ay = hy + 2, aw = W - 14, ah = 100;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
  g.drawImage(ph.cv, ph.x, ph.y, aw * u / fs, ah * u / fs, ax * u, ay * u, aw * u, ah * u);
  g.restore();
  F(ax - 1, ay - 1, aw + 2, 1, INK); F(ax - 1, ay + ah, aw + 2, 1, INK); F(ax - 1, ay - 1, 1, ah + 2, INK); F(ax + aw, ay - 1, 1, ah + 2, INK);
  pxText(g, 'GÜN 12: KUYRUK MEYDANA TAŞTI', ax, ay + ah + 5, 1, 1, false, '#5a4a36', 'left');
  /* rekor şeridi (oyuncunun gerçek rekorlarından) */
  var cy = ay + ah + 16, cw3 = Math.floor((W - 14) / 3);
  F(7, cy, W - 14, 2, INK);
  [['300', 'MÜŞTERİ'], ['$84.210', 'HAFTALIK'], ['SV. 8', 'İTİBAR']].forEach(function (k, n) {
    var mx = 7 + n * cw3 + cw3 / 2;
    pxText(g, k[0], mx, cy + 5, 1, 2, true, INK, 'center');
    pxText(g, k[1], mx, cy + 23, 1, 1, false, '#6f604b', 'center');
    if (n) F(7 + n * cw3, cy + 4, 1, 26, '#b6a47f');
  });
  F(7, cy + 33, W - 14, 1, INK);
  /* sütunlar + karekod */
  var ty = cy + 38, cw = Math.floor((W - 14 - 8) / 3), rr = seedRnd(29), QX = W - 7 - cw + Math.floor((cw - 27) / 2);
  for (j = 0; j < 2; j++) {
    var cx = 7 + j * (cw + 4), yy = ty;
    F(cx, yy, Math.floor(cw * (0.55 + rr() * 0.4)), 3, INK); yy += 6;
    while (yy < H - 6) { var par = rr() < 0.18, lw = par ? Math.floor(cw * (0.3 + rr() * 0.4)) : cw - Math.floor(rr() * 3); F(cx, yy, lw, 1, '#6f604b'); yy += par ? 5 : 3; }
    F(cx + cw + 1, ty, 1, H - 6 - ty, '#b6a47f');
  }
  pxText(g, 'OKUT', QX + 13, ty, 1, 1, true, INK, 'center');
  var qy = ty + 12, N = 25, qr = seedRnd(7);
  F(QX - 1, qy - 1, N + 4, N + 4, '#f6efdc');
  function finder(x, y) { F(QX + 1 + x, qy + 1 + y, 7, 7, INK); F(QX + 2 + x, qy + 2 + y, 5, 5, '#f6efdc'); F(QX + 3 + x, qy + 3 + y, 3, 3, INK); }
  for (var my = 0; my < N; my++) for (var mx2 = 0; mx2 < N; mx2++) {
    if ((mx2 < 8 && my < 8) || (mx2 > N - 9 && my < 8) || (mx2 < 8 && my > N - 9)) continue;
    var on = (my === 6 || mx2 === 6) ? ((mx2 + my) % 2 === 0) : qr() > 0.52;
    if (mx2 > 15 && mx2 < 21 && my > 15 && my < 21) on = (mx2 === 16 || mx2 === 20 || my === 16 || my === 20 || (mx2 === 18 && my === 18));
    if (on) F(QX + 1 + mx2, qy + 1 + my, 1, 1, INK);
  }
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
  return c;
};
})();`;
IDEAS[7] = async b => {
  const p = await startGame(b, { cash: 84210, rep: 2400, name: 'Temel Balık Evi' });
  await goTo(p, 7.6, 4.0, 0.45, 2);
  await p.evaluate(() => { BT.customers.forEach(c => { c.sayT = 0; }); });
  await freeze(p);
  await p.addScriptTag({ content: NEWS });
  /* 7b: 9:16 paylaşım görseli (1080×1920) */
  const share = await p.evaluate(() => {
    const gc = document.getElementById('game'), ph = { cv: gc, x: 37, y: 250 };
    const paper = MK.news(6, 3, ph);
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    /* koyu tahta masa (oyunun intro zemini gibi) */
    for (let y = 0; y < 1920; y += 6) { const k = Math.floor(y / 96); g.fillStyle = (y % 96 === 0) ? '#1a1108' : (k % 2 ? '#2e2012' : '#33241a'); g.fillRect(0, y, 1080, 6); }
    for (let i = 0; i < 900; i++) { const x = (i * 397) % 1080, y = (i * 211) % 1920; g.fillStyle = i % 3 ? '#3a2a1c' : '#271a0e'; g.fillRect(x - x % 6, y - y % 6, 12 + (i % 4) * 6, 6); }
    const px0 = 24, py0 = 82;
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(px0 + 18, py0 + 18, paper.width, paper.height);
    g.drawImage(paper, px0, py0);
    const pxText = HKG.v('pxText');
    g.setTransform(6, 0, 0, 6, 0, 0);
    pxText(g, 'HAMSİ KOYU · ÜCRETSİZ OYNA', 90, 4, 1, 1, false, '#ffc94a', 'center');
    g.setTransform(1, 0, 0, 1, 0, 0);
    /* kilim şeridi */
    const kc = ['#a83d2b', '#d9a441', '#2a4c7d', '#d9a441'];
    for (let x = 0; x < 1080; x += 12) { g.fillStyle = kc[(x / 12) % 4]; g.fillRect(x, 0, 12, 12); g.fillRect(x, 1908, 12, 12); }
    return c.toDataURL('image/png');
  });
  require('fs').writeFileSync(OUT + '/fikir-07b.png', Buffer.from(share.split(',')[1], 'base64'));
  /* oyun içi ekran: gazete kartı + paylaş */
  await p.evaluate(() => {
    const gc = document.getElementById('game');
    const paper = MK.news(4, 2, { cv: gc, x: 37, y: 250 });
    MK.css(`
      #mkNews{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:12px;
        background:radial-gradient(ellipse at 50% 40%,rgba(10,30,46,.78),rgba(4,12,20,.92))}
      #mkNews .hd{width:344px;display:flex;justify-content:space-between;align-items:baseline}
      #mkNews .hd b{font-size:18px;color:var(--gold);letter-spacing:1px;text-shadow:1px 1px 0 #3a2401}
      #mkNews .hd span{font-size:11px;color:var(--ink2)}
      #mkNews canvas{box-shadow:0 2px 0 rgba(3,10,16,.55),0 10px 22px rgba(2,8,14,.55)}
      #mkNews .share{width:344px;background:linear-gradient(180deg,#ffe28f 0 2px,#ffc94a 2px 55%,#f2b830 55% calc(100% - 3px),#d99a1c calc(100% - 3px));
        color:#3a2401;border:2px solid #6a4704;border-radius:3px;font-family:inherit;font-size:17px;letter-spacing:2px;padding:10px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 3px 0 rgba(4,12,20,.45)}
      #mkNews .tg{width:344px;display:flex;gap:5px}
      #mkNews .tg button{flex:1;margin:0;font-size:11px;padding:8px 2px}
      #mkNews .tg button small{display:block;font-size:9px;color:var(--ink2);margin-top:2px}
    `);
    const ov = MK.el(`<div id="mkNews"><div class="hd"><b>GAZETE FOTOĞRAFI</b><span>manşet rekorundan yazıldı</span></div><div class="pp"></div>
      <button class="share">PAYLAŞ</button>
      <div class="tg"><button class="alt">WHATSAPP<small>durum · 9:16</small></button><button class="alt">INSTAGRAM<small>hikâye · 9:16</small></button><button class="alt">KAYDET<small>galeriye</small></button></div></div>`);
    paper.style.cssText = 'width:' + paper.width / 2 + 'px;height:' + paper.height / 2 + 'px;image-rendering:pixelated;display:block';
    ov.querySelector('.pp').appendChild(paper);
  });
  await sleep(300);
  await p.screenshot({ path: OUT + '/fikir-07.png' });
  await p.context().close();
};

(async () => {
  const which = process.argv[2] || 'all';
  const list = which === 'all' ? ['6', '7', '8', '9', '10'] : [which];
  const b = await chromium.launch();
  for (const k of list) {
    if (!IDEAS[k]) { console.log('yok', k); continue; }
    console.log('fikir', k); await IDEAS[k](b);
  }
  await b.close();
})();
