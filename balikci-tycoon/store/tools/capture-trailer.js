/* Sinematik fragman (60 sn, 1920×1080, 30 fps, İngilizce): oyunun gerçek görüntüsü + sinema bantları, renk geçişleri, yağmur, yıldırım, başlık kartları.
   Oyun saati sanal (capture-video.js ile aynı yöntem): her kare tek tek çekilir. Çıktı: store/video/frames-trailer/NNNNN.jpg
   Kullanım (oyun klasörü 8099'da sunulmalı):
     node store/tools/capture-trailer.js            # bütün kareler
     node store/tools/capture-trailer.js preview    # her sahneden birkaç kare → store/video/trailer-preview/ */
const { chromium, openGame, sleep } = require('./scene');
const fs = require('fs'), path = require('path');
const MODE = process.argv[2] || 'full', FPS = 30, DUR = 60, W = 960, H = 540;
const OUT = path.resolve(__dirname, '..', 'video', MODE === 'preview' ? 'trailer-preview' : 'frames-trailer');

const VCLOCK = () => {
  let t = 0, q = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => t;
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  window.setTimeout = (fn, ms) => { if (typeof fn !== 'function') return rST(fn, ms); const id = tid++; timers.push({ id, at: t + (ms || 0), fn }); return id; };
  window.clearTimeout = id => { timers = timers.filter(x => x.id !== id); rCT(id); };
  window.__step = ms => {
    t += ms;
    const due = timers.filter(x => x.at <= t); timers = timers.filter(x => x.at > t); due.forEach(x => { try { x.fn(); } catch (e) { console.error(e); } });
    const cbs = q; q = []; cbs.forEach(cb => { try { cb(t); } catch (e) { console.error(e); } });
  };
  window.__pumpOn = () => { window.__pump = setInterval(() => window.__step(1000 / 30), 33); };
  window.__pumpOff = () => clearInterval(window.__pump);
  window.__pumpOn();
};

/* ---------- sayfa tarafı: sinema katmanları + sahne yardımcıları ---------- */
const PAGE = () => {
  const st = document.createElement('style');
  st.textContent = `
  #hud,#objective,#toast,#coach,#devbar,#queueHint,#dayBanner,#actBtn,#tradeBtn,#devpanel,#lvlUp,#achPop,#pauseBadge,#ladder,#ladderChip,.hint{display:none!important}
  #cine{position:fixed;inset:0;z-index:120;pointer-events:none;font-family:"Pixelify Sans",monospace}
  #cine .lbx{position:absolute;left:0;right:0;background:#000;z-index:5}
  #cine .dim{position:absolute;inset:0;background:#000;z-index:4;opacity:0}
  .hkst .app{max-width:1000px!important;flex-direction:row!important;align-items:center;gap:16px!important}
  .hkst .stage{flex:1.3}.hkst .panel{flex:1;align-self:stretch;min-height:0!important}.hkst .txt{font-size:21px!important}
  #cine .vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 52%,rgba(0,0,0,.62) 100%);z-index:2}
  #cine .grade{position:absolute;inset:0;z-index:1}
  #cine canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;z-index:3}
  #cine .txt{position:absolute;left:0;right:0;text-align:center;color:#fff1c9;text-shadow:2px 2px 0 #1a0f08,-1px 0 0 #1a0f08,1px 0 0 #1a0f08,0 -1px 0 #1a0f08;z-index:6;white-space:nowrap}
  #cine .flash{position:absolute;inset:0;background:#fff;z-index:7;opacity:0}
  #cine .black{position:absolute;inset:0;background:#000;z-index:8;opacity:1}
  #cine .endcard{position:absolute;inset:0;z-index:6;display:none;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#0a1a27,#0f2f45 55%,#16506d)}
  #cine .endcard img{width:40%;margin-top:-30px;image-rendering:pixelated}
  #cine .endcard i{position:absolute;top:0;left:0;right:0;height:9px;background:repeating-linear-gradient(90deg,#a83d2b 0 9px,#d9a441 9px 18px,#2a4c7d 18px 27px,#d9a441 27px 36px)}
  #cine .endcard b{display:block;color:#fff1c9;font:700 30px "Pixelify Sans";letter-spacing:3px;margin-top:6px;text-shadow:2px 2px 0 #3d2413}
  #cine .endcard small{display:block;color:#bfe9ff;font:600 15px "Pixelify Sans";letter-spacing:2px;margin-top:14px}
  #game,#ui{transform-origin:50% 46%}`;
  document.head.appendChild(st);
  const c = document.createElement('div'); c.id = 'cine';
  c.innerHTML = '<div class="grade"></div><div class="vig"></div><canvas width="480" height="270"></canvas><div class="dim"></div><div class="lbx" style="top:0"></div><div class="lbx" style="bottom:0"></div><div class="txt mid"></div><div class="txt low"></div><div class="flash"></div><div class="endcard"><i></i><img src="store/logo/logo-stacked-en.png"><b></b><small></small></div><div class="black"></div>';
  document.body.appendChild(c);
  const $ = s => c.querySelector(s), rain = $('canvas'), rg = rain.getContext('2d');
  const GR = { none: 'rgba(0,0,0,0)', dawn: 'rgba(255,140,60,', day: 'rgba(255,225,160,', dusk: 'rgba(130,60,150,', night: 'rgba(8,18,56,', storm: 'rgba(10,26,44,', gold: 'rgba(255,190,70,' };
  let sig = '';
  window.__ov = o => {
    const bh = (H0 - W0 / 2.39) / 2 * (o.bars === undefined ? 1 : o.bars);
    c.querySelectorAll('.lbx').forEach(b => { b.style.height = bh + 'px'; });
    $('.dim').style.opacity = o.dim || 0;
    $('.black').style.opacity = o.black; $('.flash').style.opacity = o.flash;
    $('.grade').style.background = o.grade && o.grade !== 'none' ? GR[o.grade] + o.ga + ')' : 'transparent';
    $('.vig').style.opacity = o.vig === undefined ? 1 : o.vig;
    const sc = 1 + (o.push || 0); document.getElementById('game').style.transform = document.getElementById('ui').style.transform = 'scale(' + sc + ')';
    /* yağmur: yarı çözünürlükte, piksel çizgiler */
    rg.clearRect(0, 0, 480, 270);
    if (o.rain) {
      rg.fillStyle = 'rgba(190,225,255,' + (0.55 * o.rain) + ')';
      for (let i = 0; i < 170 * o.rain; i++) { const x = ((i * 97.31 + o.t * 90 + (i % 7) * 11) % 520) - 20, y = ((i * 53.7 + o.t * 380 * (0.8 + (i % 5) * 0.1)) % 290) - 10; rg.fillRect(x - y * 0.12, y, 1, 4 + (i % 3)); }
    }
    /* yazılar */
    const k = JSON.stringify(o.texts.map(t => [t.s, t.pos, t.size, t.col]));
    if (k !== sig) {
      sig = k;
      ['mid', 'low'].forEach(pos => {
        const e = $('.txt.' + pos), L = o.texts.filter(t => t.pos === pos);
        e.innerHTML = L.map((t, i) => `<div data-i="${i}" style="font:700 ${t.size}px 'Pixelify Sans';letter-spacing:${t.track || 3}px;color:${t.col || '#fff1c9'};margin:4px 0">${t.s}</div>`).join('');
      });
    }
    ['mid', 'low'].forEach(pos => {
      const e = $('.txt.' + pos), L = o.texts.filter(t => t.pos === pos);
      e.style.top = pos === 'mid' ? (H0 / 2 - 34 + (o.midDy || 0)) + 'px' : (H0 - (H0 - W0 / 2.39) / 4 - 14) + 'px';
      L.forEach((t, i) => { const d = e.children[i]; if (!d) return; d.style.opacity = t.a; d.style.transform = 'translateY(' + ((1 - t.a) * 8) + 'px) scale(' + (1 + (t.slam || 0) * 0.5) + ')'; });
    });
    const ec = $('.endcard');
    if (o.end) { ec.style.display = 'flex'; ec.style.opacity = o.end.a; ec.querySelector('b').textContent = o.end.t1; ec.querySelector('small').textContent = o.end.t2; ec.querySelector('b').style.opacity = o.end.a1; ec.querySelector('small').style.opacity = o.end.a2; }
    else ec.style.display = 'none';
  };
  window.__zoom = z => { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); document.getElementById('settingsScreen').classList.add('hidden'); };
  /* n kare ilerlet (kamera otursun, iş aksın) */
  window.__ff = n => { for (let i = 0; i < n; i++) window.__step(1000 / 30); };
  window.__place = (x, y) => { BT.player.x = x; BT.player.y = y; };
  window.__rich = () => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(cn => { cn.open = true; cn.seen = true; });
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  };
  /* efsane diyaloğu: satır yazılırken 1 sn sonra tamamla, 1,7 sn'de ilerlet; son (4.) satırda dur */
  const sa = { len: 0, t0: 0, n: 0 };
  window.__storyAuto = t => {
    const e = document.querySelector('.hkst [data-k=txt]'), nx = document.querySelector('.hkst [data-k=nx]');
    if (!e || HK_STORY._mode() !== 'dlg') return;
    const L = e.textContent.length;
    if (L < sa.len) { sa.n++; sa.t0 = t; }
    if (L > 0 && sa.n === 0) { sa.n = 1; sa.t0 = t; }
    sa.len = L;
    if (sa.n >= 4 || sa.n === 0) return;
    if (nx && nx.hidden && t - sa.t0 > 0.8) HK_STORY._tap();
    else if (nx && !nx.hidden && t - sa.t0 > 1.4) HK_STORY._tap();
  };
  window.__special = (ids, idx, z) => {
    BT.day.spec = ids;
    const cn = BT.counters[z || 0]; cn.slots.fill(null); BT.customers.forEach(q => { if (q.c === cn) q.state = 'leave'; });
    BT.spawnSpecial(idx);
    const cu = BT.customers.find(q => q.spec === ids[idx]); if (cu) { cu.x = cn.x + 2.3; cu.y = cn.y + 0.9; }
  };
  const W0 = window.__W0 = innerWidth, H0 = window.__H0 = innerHeight;
};

/* ---------- zaman çizelgesi ---------- */
const ease = x => x * x * (3 - 2 * x), cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
/* yazı: [başla, bitir] arası, 0.5 sn girer/çıkar */
const fadeT = (s, a, b, fi = 0.5, fo = 0.5) => cl(Math.min((s - a) / fi, (b - s) / fo));
const TXT = (s, a, b, o = {}) => ({ s, a, b, ...o });
const TEXTS = [
  TXT('EVERY GREAT HARBOR BEGAN WITH ONE OLD NET.', 2.2, 5.7, { pos: 'low', size: 19 }),
  TXT('AND ONE STUBBORN DREAMER.', 6.5, 10.6, { pos: 'low', size: 19 }),
  TXT('CATCH.', 12.0, 13.95, { pos: 'mid', size: 62, track: 10, slam: 1 }),
  TXT('FILLET.', 14.0, 15.95, { pos: 'mid', size: 62, track: 10, slam: 1 }),
  TXT('SELL.', 16.0, 17.95, { pos: 'mid', size: 62, track: 10, slam: 1 }),
  TXT('GROW.', 18.0, 19.95, { pos: 'mid', size: 62, track: 10, slam: 1, col: '#ffd166' }),
  TXT('FROM A TINY PIER...', 20.8, 25.0, { pos: 'low', size: 19 }),
  TXT('...TO A GRAND HARBOR.', 25.4, 29.8, { pos: 'low', size: 19 }),
  TXT('69 QUIRKY CUSTOMERS.', 30.3, 33.0, { pos: 'low', size: 21, col: '#ffd166' }),
  TXT('EACH ONE WITH A STORY.', 33.3, 36.0, { pos: 'low', size: 19 }),
  TXT('BUT BENEATH THE WAVES...', 36.4, 38.6, { pos: 'mid', size: 30, track: 6 }),
  TXT('A LEGEND IS WAITING.', 38.7, 40.0, { pos: 'mid', size: 30, track: 6, col: '#9fe8c4' }),
  TXT('THE PROMISE BELOW', 50.3, 51.45, { pos: 'mid', size: 38, track: 9, col: '#ffd166', fi: 0.3, fo: 0.2 }),
  TXT('A 12-DAY ANATOLIAN LEGEND', 50.6, 51.45, { pos: 'mid', size: 15, track: 5, fi: 0.3, fo: 0.2 }),
  TXT('YOUR COVE AWAITS.', 54.4, 56.0, { pos: 'mid', size: 54, track: 9, slam: 1, col: '#ffd166', fo: 0.12 })
];

/* planlar: [zoom, oyuncu başlangıç, oyuncu bitiş, (bölge)] */
const SHOTS = {
  fresh1: { z: 3, a: [1.2, 4.8], b: [3.6, 2.6] },        /* ilk iskele, yavaş ilerleme */
  fresh2: { z: 3, a: [2.6, 2.0], b: [2.9, 1.6] },        /* ağın başı */
  fresh3: { z: 3, a: [6.2, 3.6], b: [6.9, 3.4] },        /* tezgâh */
  catch: { z: 3, a: [2.7, 1.9], b: [3.3, 2.3] },
  fillet: { z: 3, a: [4.8, 2.2], b: [5.6, 2.8] },
  sell: { z: 3, a: [7.0, 3.4], b: [7.6, 4.2] },
  grow: { z: 1, a: [5.0, 9.0], b: [5.0, 12.0] },
  d1: { z: 2, a: [5.0, 3.0], b: [5.4, 8.5] },
  d2: { z: 2, a: [5.4, 8.5], b: [4.4, 13.4] },
  d3: { z: 2, a: [4.4, 13.4], b: [5.8, 19.6] },
  d4: { z: 1, a: [5.8, 19.6], b: [5.0, 14.0] },
  m: [
    { z: 3, a: [2.4, 1.6], b: [3.2, 2.2] }, { z: 2, a: [8.0, 9.5], b: [7.4, 10.4] }, { z: 3, a: [6.0, 20.0], b: [6.8, 20.8] },
    { z: 1, a: [5.0, 6.5], b: [5.0, 9.5] }, { z: 3, a: [4.0, 14.0], b: [4.6, 14.8] }, { z: 2, a: [8.0, 4.0], b: [8.8, 3.4] },
    { z: 3, a: [7.6, 15.2], b: [8.2, 15.8] }, { z: 1, a: [5.0, 18.0], b: [5.0, 21.0] }, { z: 3, a: [3.6, 6.6], b: [4.4, 7.2] },
    { z: 2, a: [6.0, 11.5], b: [6.8, 12.4] }, { z: 3, a: [8.2, 18.4], b: [8.6, 19.0] }, { z: 2, a: [3.0, 2.0], b: [5.0, 3.0] }
  ]
};

/* her sahne: at, len, setup (sayfada bir kez), params(s,u) → kare başına */
function build() {
  const S = [];
  const add = (at, len, o) => S.push({ at, len, ...o });
  /* 0-12 ilk iskele (şafak) */
  add(0, 6, { shot: SHOTS.fresh1, grade: ['dawn', 0.30], push: [0, 0.05], fresh: true });
  add(6, 3, { shot: SHOTS.fresh2, grade: ['dawn', 0.24], push: [0.02, 0.07] });
  add(9, 3, { shot: SHOTS.fresh3, grade: ['day', 0.14], push: [0.0, 0.05] });
  /* 12-20 dört vuruş (oyun zengin duruma geçer) */
  add(12, 2, { shot: SHOTS.catch, grade: ['day', 0.10], push: [0, 0.04], rich: true, hit: true });
  add(14, 2, { shot: SHOTS.fillet, grade: ['day', 0.08], push: [0, 0.04], hit: true });
  add(16, 2, { shot: SHOTS.sell, grade: ['day', 0.06], push: [0, 0.04], hit: true });
  add(18, 2, { shot: SHOTS.grow, grade: ['gold', 0.16], push: [0.05, 0], hit: true });
  /* 20-30 bölgeler boyunca kayan çekim */
  add(20, 3, { shot: SHOTS.d1, grade: ['day', 0.05], push: [0, 0.03] });
  add(23, 3, { shot: SHOTS.d2, grade: ['day', 0.05], push: [0, 0.03] });
  add(26, 2.5, { shot: SHOTS.d3, grade: ['gold', 0.10], push: [0, 0.03] });
  add(28.5, 1.5, { shot: SHOTS.d4, grade: ['gold', 0.14], push: [0.06, 0] });
  /* 30-36 müşteriler */
  add(30, 3.1, { shot: { z: 3, a: [7.6, 2.8], b: [8.0, 3.2] }, grade: ['dusk', 0.12], push: [0, 0.04], special: [['temel', 'caner', 'kemal'], 0, 0] });
  add(33.1, 3.1, { shot: { z: 3, a: [7.6, 9.8], b: [8.0, 10.2] }, grade: ['dusk', 0.18], push: [0, 0.04], special: [['temel', 'caner', 'kemal'], 1, 1] });
  /* 36-40.5 fırtına */
  add(36.2, 2.2, { shot: { z: 2, a: [5.0, 3.6], b: [4.6, 4.4] }, grade: ['storm', 0.52], push: [0, 0.05], rain: 1, storm: true, bolt: 37.5 });
  add(38.4, 2.1, { shot: { z: 1, a: [5.0, 5.0], b: [5.0, 6.0] }, grade: ['night', 0.58], push: [0.03, 0.08], rain: 0.7 });
  /* 40.5-49.6 efsane (sinema bantları açılır) */
  add(40.5, 9.6, { story: true, grade: ['none', 0], push: [0, 0] });
  add(50.1, 1.4, { hold: true });
  /* 51.5-56 final montajı: 0,5 sn'lik kesmeler */
  const m = SHOTS.m;
  for (let i = 0; i < 9; i++) add(51.5 + i * 0.5, 0.5, { shot: m[i], grade: [i % 3 === 0 ? 'gold' : 'none', 0.14], push: [0, 0.03], flash: i === 0 || i === 4, mont: true });
  add(56, 4, { card: true });
  return S;
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const { p } = await openGame(b, 'en', { width: W, height: H }, 2, VCLOCK);
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.evaluate(() => { document.getElementById('settingsScreen').classList.add('hidden'); });
  await p.evaluate(PAGE);
  await p.evaluate(() => window.__pumpOff());
  await p.evaluate(() => { window.__zoom(3); window.__place(1.2, 4.8); });
  const SEG = build();
  const N = DUR * FPS;
  const frames = process.env.FRAMES ? process.env.FRAMES.split(',').map(Number) : MODE === 'preview' ? [...new Set(SEG.flatMap(g => [Math.round((g.at + g.len * 0.2) * FPS), Math.round((g.at + g.len * 0.8) * FPS)]))].filter(f => f < N).sort((a, b) => a - b) : null;
  const want = f => !frames || frames.includes(f);
  let cur = -1, lastZoom = 3, storyOn = false, lastTap = -9, dlgSince = -1;
  await p.evaluate(() => window.__ov({ black: 1, flash: 0, grade: 'none', ga: 0, texts: [], t: 0 }));
  for (let f = 0; f < N; f++) {
    const s = f / FPS, si = SEG.findIndex(g => s >= g.at && s < g.at + g.len), g = SEG[si], u = cl((s - g.at) / g.len);
    if (si !== cur) {
      cur = si;
      await p.evaluate(([g, hadStory]) => {
        if (g.rich) window.__rich();
        if (g.special) { window.__special(g.special[0], g.special[1], g.special[2]); }
        if (g.storm) BT.setEvent('kar');
        if (hadStory && !g.story) HK_STORY.close();
        if (g.story) { BT.day.phase = 'play'; HK_STORY.open(8, { lang: 'en', ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] }); }
      }, [g, storyOn]);
      storyOn = !!g.story;
      if (g.story) { lastTap = s; dlgSince = -1; }
      if (g.shot) {
        if (g.shot.z !== lastZoom) { await p.evaluate(z => window.__zoom(z), g.shot.z); lastZoom = g.shot.z; }
        await p.evaluate(([a, n]) => { window.__place(a[0], a[1]); window.__ff(n); }, [g.shot.a, g.fresh ? 1 : 75]);   /* kesmede kamera yumuşak kaymasın */
      }
    }
    /* görüntü parametreleri */
    const o = { t: s, texts: [], black: 0, flash: 0, grade: 'none', ga: 0, dim: 0, bars: 1 };
    if (g.shot) o.px = lerp(g.shot.a[0], g.shot.b[0], ease(u)), o.py = lerp(g.shot.a[1], g.shot.b[1], ease(u));
    if (g.grade) { o.grade = g.grade[0]; o.ga = g.grade[1]; }
    if (g.push) o.push = lerp(g.push[0], g.push[1], u);
    if (g.rain) o.rain = g.rain;
    /* geçişler */
    if (s < 2.4) o.black = 1 - ease(cl((s - 0.4) / 2.0));                                     /* açılış */
    if (s > 11.5 && s < 12.25) o.flash = s < 12.0 ? ease((s - 11.5) / 0.5) : 1 - ease((s - 12.0) / 0.25);   /* eski iskele → büyümüş liman */
    if (g.hit) { const d = s - g.at; if (d < 0.2) o.flash = Math.max(o.flash, 0.55 * (1 - d / 0.2)); }
    if (g.flash) { const d = s - g.at; if (d < 0.18) o.flash = Math.max(o.flash, 0.7 * (1 - d / 0.18)); }
    if (s > 35.5 && s < 36.2) o.black = Math.max(o.black, ease((s - 35.5) / 0.7));            /* fırtınaya dalış */
    if (s >= 36.2 && s < 36.8) o.black = Math.max(o.black, 1 - ease((s - 36.2) / 0.6));
    if (g.bolt) { const d = s - g.bolt; if (d > 0 && d < 0.5) o.flash = Math.max(o.flash, d < 0.08 ? 0.95 : d < 0.18 ? 0.2 : d < 0.26 ? 0.8 : 0.8 * (1 - (d - 0.26) / 0.24)); }
    if (s > 39.9 && s < 40.5) o.black = Math.max(o.black, ease((s - 39.9) / 0.6));           /* efsaneye */
    if (s >= 40.5 && s < 41.1) o.black = Math.max(o.black, 1 - ease((s - 40.5) / 0.6));
    if (g.story) o.bars = 1 - ease(cl((s - 40.6) / 0.8)) * 1;                                 /* bantlar açılır */
    if (s > 49.1 && s < 50.1) { o.black = Math.max(o.black, ease((s - 49.1) / 1.0)); o.bars = 0; }
    if (g.hold) { o.black = 1; o.bars = 1 - ease(cl((s - 49.6) / 0.01)) * 0 ; o.bars = 1; }
    if (g.mont || g.card) o.bars = 1;
    if (g.mont && s > 51.5 && s < 51.6) o.black = 0;
    if (g.card) {
      const d = s - g.at;
      o.end = { a: ease(cl(d / 0.6)), t1: 'BUILD YOUR COVE. HEAR THE LEGEND.', t2: 'FREE  •  NO ADS  •  NO PURCHASES  •  recaikas.github.io/okult-kahin-byblbn', a1: ease(cl((d - 0.7) / 0.6)), a2: ease(cl((d - 1.6) / 0.6)) };
      o.vig = 0;
      if (s > 59.3) o.black = ease((s - 59.3) / 0.7);
    }
    if (g.story) o.vig = 0.55;
    if (s >= 55.5 && s < 56.0) o.black = Math.max(o.black, 0);
    if (s >= 55.85 && s < 56.0) o.flash = 0.9 * (1 - (s - 55.85) / 0.15);                      /* logoya vuruş */
    let dimA = 0;
    TEXTS.forEach(t => { const a = fadeT(s, t.a, t.b, t.fi || 0.45, t.fo || 0.5); if (a > 0) { o.texts.push({ s: t.s, pos: t.pos, size: t.size, col: t.col, track: t.track, a, slam: t.slam ? cl(1 - (s - t.a) / 0.3) : 0 }); if (t.pos === 'mid' && !g.hold) dimA = Math.max(dimA, a); } });
    o.dim = 0.42 * dimA;
    /* efsane diyaloğunda dokunuşlar */
    await p.evaluate(([o, sa]) => {
      if (o.px !== undefined) window.__place(o.px, o.py);
      if (sa) window.__storyAuto(o.t);
      window.__ov(o);
      window.__step(1000 / 30);
    }, [o, storyOn]);
    if (want(f)) {
      await p.screenshot({ path: path.join(OUT, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    }
    if (f % 150 === 0) console.log('kare', f, '/', N);
  }
  await b.close();
})();
