/* Hamsi Koyu film motoru: fragman ve "Geliştirme Günlüğü" videolarının ortak sinematik dili.
   Bir bölüm dosyası (ör. ep02-mudurler.js) yalnız içeriği tanımlar; motor şunları yapar:
   - oyunu Chromium'da açar; game.js'i çekim yamalarıyla sunar (serbest kamera, yakınlık, etiket filtresi)
   - oyunun saatini sanal tutar, her kareyi tek tek çeker (akıcı 30 fps)
   - elle çizilmiş sahneleri (scenes.js) ve oyun çekimlerini aynı zaman çizelgesinde kurgular
   - sinema katmanı: şeritler, vinyet, renk tonu, çözülerek geçiş, beyaz patlama, siyaha iniş, yavaş yaklaşma
   - yazı türleri (aşağıda), dikey 1080×1920 (varsayılan; seri yalnız dikey) ya da 'h' ile yatay 1920×1080, EN/TR
   - müzik dosyası varsa sonunda ffmpeg ile MP4 üretir
   Kullanım (bölüm dosyası üzerinden): node store/tools/film/<bölüm>.js [en|tr] [h] [preview [çekim,çekim]]   (h: yatay)
   Oyun klasörü 8099'da sunulmalı: cd balikci-tycoon && python3 -m http.server 8099

   BÖLÜM TANIMI (EP):
     id, dur                    — çıktı adı ve süre (sn)
     L: { en: {...}, tr: {...} } — metinler; motorun kullandıkları: firm, end[3], ep[3] (seri kartı), loop[], cash
     shots(L)                   — [{ id, a, b, kind: scene|game|black, scene, t0, opt, z, cam:[[u,x,y]…], day, grade,
                                     tr:'dissolve', td, push, dim, fadeIn, glow, story, ui }]
     text(L)                    — [{ a, b, kind, … }] kind: int · title · chip · stamp · loop · logo · cash · kicker ·
                                     episode · perks · corner · tap · end
     flash [[t, güç]], dips [[a, b]], grades {ad: [renk, karışım, güç]}
     pageInit(L, LANG, V)       — sayfada çalışır; window.__setup(g, prev) ve isteğe bağlı window.__frame(g, lt, u) tanımlar
     onFrame(p, g, lt)          — Node tarafı, isteğe bağlı (ör. zamanlı olaylar)
   Sayfada hazır yardımcılar: window.__F = { step, hideOv, at, makeRich, hireMgr, tapAt } */
const { chromium } = require('../../../test-offline');
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const URL = process.env.URL || 'http://localhost:8099/index.html';
const ROOT = path.resolve(__dirname, '..', '..', '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FPS = 30;

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

/* game.js çekim yamaları (dosyanın kendisi değişmez; yalnız bu tarayıcıya böyle sunulur) */
function patchGame(src) {
  const rep = (a, b) => { if (!src.includes(a)) throw new Error('yama bulunamadı: ' + a.slice(0, 60)); src = src.replace(a, b); };
  rep('function updateCamera(dt) {', 'function updateCamera(dt) {\n  if (window.__cam) { camTX = camX = pX(window.__cam.x, window.__cam.y); camTY = camY = pY(window.__cam.x, window.__cam.y, 0); return; }');
  rep('function renderUI() {\n  trimLabels();', 'function renderUI() {\n  trimLabels();\n  if (window.__uiKeep) uiQ = uiQ.filter(window.__uiKeep);');
  rep('var fs = q.t === 1 ? 10 : 9.5;', 'var fs = (q.t === 1 ? 10 : 9.5) * (window.__uiScale || 1);');
  rep('function drawRoleTag(w) {', 'function drawRoleTag(w) {\n  if (window.__noTags) return;');
  rep('ctx.save(); ctx.globalAlpha = 0.55 + (Math.sin(gameT * 4) > 0 ? 0.15 : 0);', 'ctx.save(); ctx.globalAlpha = window.__noTags ? 0 : 0.55 + (Math.sin(gameT * 4) > 0 ? 0.15 : 0);');
  rep('function resize() {', 'window.__zoom = function (z) { zoomLvl = z; resize(); };\nfunction resize() {');
  /* müdür etiketleri oyuncu uzaktayken de görünebilsin (çekimde oyuncu kadraj dışında) */
  rep("if (dist2(player.x, player.y, p.x, p.y) < 7) uiLabel(p.x, p.y, 30, '👔 '", "if (window.__mgrLabel || dist2(player.x, player.y, p.x, p.y) < 7) uiLabel(p.x, p.y, 30, '👔 '");
  rep("if (dist2(player.x, player.y, a.x, a.y) < 9) uiLabel(a.x, a.y, 34, '👔 '", "if (window.__mgrLabel || dist2(player.x, player.y, a.x, a.y) < 9) uiLabel(a.x, a.y, 34, '👔 '");
  rep('function hireMgr(z, c) {', 'window.__hireMgr = function (z, c) { hireMgr(z, c); };\nfunction hireMgr(z, c) {');
  return src;
}

/* sinema katmanı: stil, öğeler ve her kare çizilen durum (sayfada çalışır) */
function overlayInit([L, LANG]) {
  const st = document.createElement('style');
  st.textContent =
    'body.tbc #hud,body.tbc #devbar,body.tbc #objective,body.tbc #queueHint,body.tbc #toast,body.tbc #actBtn,body.tbc #tradeBtn,body.tbc #coach,body.tbc #dayBanner,body.tbc #lvlUp,body.tbc #eventChip,body.tbc #chBtn,body.tbc #autoBadge,body.tbc #specPop,body.tbc #devpanel{visibility:hidden!important}' +
    /* ui: oyun arayüzü görünür çekim (menü, panel, bildirim) */
    'body.tbc.tbui #hud,body.tbc.tbui #devbar,body.tbc.tbui #devpanel,body.tbc.tbui #toast,body.tbc.tbtoast #toast{visibility:visible!important}' +
    '#tbg .tb-title.top{bottom:auto;top:92px}body.tbv #tbg .tb-title.top{bottom:auto;top:130px}' +
    '#game,#ui{transform-origin:50% 46%}' +
    '#tbsnap{position:fixed;inset:0;width:100vw;height:100vh;z-index:199;pointer-events:none;opacity:0}' +
    '#tbglow{position:fixed;inset:0;width:100vw;height:100vh;z-index:190;pointer-events:none;mix-blend-mode:screen}' +
    '#tbg{position:fixed;inset:0;z-index:200;pointer-events:none;font-family:"Pixelify Sans",monospace}' +
    '#tbg .tb-gr{position:absolute;inset:0;opacity:0}' +
    '#tbg .tb-vg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 58%,rgba(0,0,0,.5) 100%)}' +
    '#tbg .tb-bar{position:absolute;left:0;right:0;height:66px;background:#000}#tbg .tb-bt{top:0}#tbg .tb-bb{bottom:0}' +
    '#tbg .tb-blk{position:absolute;inset:0;background:#000;opacity:0}#tbg .tb-fl{position:absolute;inset:0;background:#fff6e0;opacity:0}' +
    '#tbg .tb-band{position:absolute;left:0;right:0;bottom:66px;height:190px;background:linear-gradient(transparent,rgba(4,8,16,.62));opacity:0}' +
    '#tbg .tb-int{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-weight:600;font-size:30px;color:#fff3dc;text-shadow:3px 3px 0 rgba(20,8,20,.85),0 0 24px rgba(0,0,0,.55);opacity:0;white-space:nowrap}' +
    '#tbg .tb-int.low{top:auto;bottom:100px;transform:none}' +
    '#tbg .tb-int span{background:rgba(10,8,22,.5);padding:4px 14px 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
    '#tbg .tb-title{position:absolute;left:0;right:0;bottom:100px;text-align:center;opacity:0}' +
    '#tbg .tb-title b{display:block;font-weight:700;font-size:58px;letter-spacing:.14em;color:#fff3d6;text-shadow:4px 4px 0 #2a1408,0 0 30px rgba(0,0,0,.5);white-space:nowrap}' +
    '#tbg .tb-title i{display:block;margin:6px auto 0;height:4px;background:#e4b94a;box-shadow:0 2px 0 #7a4a10}' +
    '#tbg .tb-title span{display:block;margin-top:10px;font-weight:500;font-size:19px;letter-spacing:.05em;color:#d8ecff;text-shadow:2px 2px 0 #08121c;white-space:nowrap}' +
    '#tbg .tb-loop{position:absolute;left:0;right:0;bottom:76px;display:flex;justify-content:center;gap:14px;font-weight:700;font-size:15px;letter-spacing:.3em;opacity:0}' +
    '#tbg .tb-loop em{font-style:normal;color:#fff3d6;opacity:.32}#tbg .tb-loop em.on{opacity:1;color:#ffcf5a;text-shadow:0 0 12px rgba(255,190,80,.6)}#tbg .tb-loop u{text-decoration:none;color:#e4b94a;opacity:.5}' +
    '#tbg .tb-stamp{position:absolute;left:50%;top:50%;opacity:0;text-align:center}' +
    '#tbg .tb-stamp div{padding:12px 30px 10px;border:4px solid #fff3d6;box-shadow:0 0 0 4px #2a1408,inset 0 0 0 4px #2a1408;background:rgba(8,14,24,.55);font-weight:700;font-size:36px;letter-spacing:.16em;color:#fff3d6;text-shadow:4px 4px 0 #2a1408;white-space:nowrap}' +
    '#tbg .tb-stamp span{display:block;margin-top:12px;font-size:20px;letter-spacing:.08em;color:#ffcf5a;text-shadow:2px 2px 0 #2a1408}' +
    '#tbg .tb-kick{position:absolute;right:60px;top:96px;text-align:right;opacity:0}#tbg .tb-kick small{display:block;font-size:14px;font-weight:600;letter-spacing:.45em;color:#b8a8e0}' +
    '#tbg .tb-kick b{display:block;font-size:50px;font-weight:700;letter-spacing:.06em;color:#ffb454;text-shadow:3px 3px 0 #000,6px 6px 0 #7a2a2a}' +
    '#tbg .tb-sub{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:19px;color:#f6e9d3;opacity:0}#tbg .tb-sub b{color:#ffb454;letter-spacing:.14em;font-size:14px;margin-right:12px}' +
    '#tbg .tb-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;opacity:0;padding-bottom:150px}' +
    '#tbg .tb-end img{width:560px;image-rendering:pixelated;filter:drop-shadow(0 6px 0 rgba(0,0,0,.45))}' +
    '#tbg .tb-end .t{font-size:26px;font-weight:600;letter-spacing:.1em;color:#fff3dc;text-shadow:3px 3px 0 #10081c}' +
    '#tbg .tb-end .f{font-size:15px;font-weight:700;letter-spacing:.32em;color:#ffcf5a;text-shadow:2px 2px 0 #10081c}' +
    '#tbg .tb-end .u{font-size:14px;letter-spacing:.1em;color:#bcd2ff}' +
    '#tbg .tb-logo{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0}#tbg .tb-logo img{width:760px;image-rendering:pixelated;filter:drop-shadow(0 8px 0 rgba(0,0,0,.5)) drop-shadow(0 0 40px rgba(120,220,255,.35))}' +
    '#tbg .tb-cash{position:absolute;right:56px;top:86px;text-align:right;opacity:0}#tbg .tb-cash small{display:block;font-size:13px;font-weight:700;letter-spacing:.4em;color:#ffcf5a;text-shadow:2px 2px 0 #2a1408}#tbg .tb-cash b{display:block;font-size:44px;font-weight:700;color:#9dff8a;letter-spacing:.04em;text-shadow:3px 3px 0 #0a2a10}' +
    '#tbg .tb-chip{position:absolute;left:50%;top:96px;opacity:0;padding:8px 18px 6px;background:rgba(8,14,24,.7);border:3px solid #e4b94a;font-size:22px;font-weight:700;letter-spacing:.12em;color:#fff3d6;white-space:nowrap;text-shadow:2px 2px 0 #2a1408}' +
    '#tbg .tb-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,250,220,.55) 50%,transparent 60%);mix-blend-mode:overlay;opacity:0}' +
    /* seri kartı: logo + "GELİŞTİRME GÜNLÜĞÜ" + GÜN n + konu */
    '#tbg .tb-ep{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0}' +
    '#tbg .tb-ep img{width:330px;image-rendering:pixelated;filter:drop-shadow(0 5px 0 rgba(0,0,0,.5))}' +
    '#tbg .tb-ep small{font-size:15px;font-weight:700;letter-spacing:.42em;color:#bcd2ff;text-shadow:2px 2px 0 #08121c}' +
    '#tbg .tb-ep em{font-style:normal;font-size:30px;font-weight:700;letter-spacing:.3em;color:#ffcf5a;text-shadow:3px 3px 0 #2a1408}' +
    '#tbg .tb-ep b{font-size:76px;font-weight:700;letter-spacing:.12em;color:#fff3d6;text-shadow:5px 5px 0 #2a1408,0 0 40px rgba(0,0,0,.5)}' +
    '#tbg .tb-ep i{display:block;height:4px;background:#e4b94a;box-shadow:0 2px 0 #7a4a10}' +
    /* yetenek listesi */
    '#tbg .tb-perks{position:absolute;left:0;right:0;top:92px;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0}' +
    '#tbg .tb-perks div{padding:7px 16px 5px;background:rgba(8,14,24,.78);border:3px solid #e4b94a;font-size:21px;font-weight:700;letter-spacing:.06em;color:#fff3d6;white-space:nowrap;text-shadow:2px 2px 0 #2a1408;opacity:0}' +
    '#tbg .tb-perks div u{text-decoration:none;color:#9dff8a}' +
    /* köşe etiketi (seri) */
    '#tbg .tb-corner{position:absolute;left:28px;top:80px;opacity:0;font-size:13px;font-weight:700;letter-spacing:.32em;color:#fff3d6;padding:6px 12px 4px;background:rgba(8,14,24,.55);border-left:4px solid #e4b94a}' +
    /* dokunma halkası (oyun arayüzünde neye basıldığı) */
    '#tbg .tb-tap{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border:4px solid #fff3d6;border-radius:50%;box-shadow:0 0 0 4px rgba(42,20,8,.6),0 0 24px rgba(255,220,140,.8);opacity:0}' +
    '.tbstory .hkst{padding:0!important;background:#000!important;z-index:150!important}.tbstory .hkst .app{max-width:none!important;width:100vw;height:100vh;justify-content:center;align-items:center}' +
    '.tbstory .hkst .stage{border:0!important;box-shadow:none!important}.tbstory .hkst canvas{width:auto!important;height:100vh!important}' +
    '.tbstory .hkst .panel,.tbstory .hkst .skip,.tbstory .hkst .hud{display:none!important}' +
    '.tbpanel #custScr:not(.hidden){transform:scale(.78);transform-origin:50% 46%}' +
    /* dikey: telefon ekranı, sosyal medya arayüzlerinin kapatmadığı orta alan */
    'body.tbv #tbg .tb-int{top:19%;transform:none;font-size:21px;white-space:normal;padding:0 30px;line-height:1.4}' +
    'body.tbv #tbg .tb-int.low{top:auto;bottom:250px}' +
    'body.tbv #tbg .tb-title{bottom:215px;padding:0 24px}body.tbv #tbg .tb-title b{font-size:40px;letter-spacing:.1em;white-space:normal;line-height:1.12}' +
    'body.tbv #tbg .tb-title span{font-size:15px;white-space:normal;line-height:1.45;padding:0 10px}body.tbv #tbg .tb-band{bottom:0;height:470px}' +
    'body.tbv #tbg .tb-loop{bottom:172px;font-size:12px;gap:8px;letter-spacing:.2em}' +
    'body.tbv #tbg .tb-stamp div{font-size:24px;white-space:normal;padding:10px 18px 8px;width:400px;line-height:1.35}' +
    'body.tbv #tbg .tb-kick{left:0;right:0;text-align:center;top:150px}body.tbv #tbg .tb-kick small{font-size:11px;letter-spacing:.3em}body.tbv #tbg .tb-kick b{font-size:38px}' +
    'body.tbv #tbg .tb-sub{bottom:150px;padding:0 26px;font-size:16px;line-height:1.45}' +
    'body.tbv #tbg .tb-end{padding-bottom:300px;padding-left:24px;padding-right:24px;text-align:center}body.tbv #tbg .tb-end img{width:430px}' +
    'body.tbv #tbg .tb-end .t{font-size:21px}body.tbv #tbg .tb-end .f{font-size:12px;letter-spacing:.2em}body.tbv #tbg .tb-end .u{font-size:11px;line-height:1.5}' +
    'body.tbv #tbg .tb-logo img{width:470px}' +
    'body.tbv #tbg .tb-chip{top:140px;font-size:16px}body.tbv #tbg .tb-cash{left:0;right:0;text-align:center;top:190px}body.tbv #tbg .tb-cash b{font-size:34px}' +
    'body.tbv #tbg .tb-ep{padding-bottom:120px}body.tbv #tbg .tb-ep img{width:300px}body.tbv #tbg .tb-ep small{font-size:12px;letter-spacing:.3em}body.tbv #tbg .tb-ep em{font-size:24px}body.tbv #tbg .tb-ep b{font-size:52px}' +
    'body.tbv #tbg .tb-perks{top:150px}body.tbv #tbg .tb-perks div{font-size:16px}' +
    'body.tbv #tbg .tb-corner{top:110px;left:20px;font-size:11px}' +
    'body.tbv.tbstory .hkst canvas{width:100vw!important;height:auto!important}';
  document.head.appendChild(st);
  const g = document.createElement('div'); g.id = 'tbg';
  const logo = 'store/logo/logo-horizontal-' + LANG + '.png';
  const ep = L.ep || ['', '', ''], end = L.end || ['', '', ''];
  g.innerHTML = '<div class="tb-gr"></div><div class="tb-vg"></div><div class="tb-band"></div>' +
    '<div class="tb-int"></div><div class="tb-title"><b></b><i></i><span></span></div>' +
    '<div class="tb-loop">' + (L.loop || []).map(w => '<em>' + w + '</em>').join('<u>›</u>') + '</div>' +
    '<div class="tb-stamp"><div></div><span></span></div>' +
    '<div class="tb-logo"><img src="' + logo + '"></div><div class="tb-cash"><small>' + (L.cash || '') + '</small><b></b></div><div class="tb-chip"></div>' +
    '<div class="tb-kick"><small></small><b></b></div>' +
    '<div class="tb-ep"><img src="' + logo + '"><small>' + ep[0] + '</small><em>' + ep[1] + '</em><b>' + ep[2] + '</b><i></i></div>' +
    '<div class="tb-perks"></div><div class="tb-corner"></div><div class="tb-tap"></div>' +
    '<div class="tb-end"><img src="' + logo + '"><div class="t">' + end[0] + '</div>' +
    '<div class="f">' + end[1] + '</div><div class="u">' + end[2] + '</div><div class="tb-shine"></div></div>' +
    '<div class="tb-bar tb-bt"></div><div class="tb-bar tb-bb"></div><div class="tb-sub"></div><div class="tb-blk"></div><div class="tb-fl"></div>';
  document.body.appendChild(g); document.body.classList.add('tbc');
  const snap = document.createElement('img'); snap.id = 'tbsnap'; document.body.appendChild(snap);
  window.__snap = src => new Promise(r => { snap.onload = () => r(); snap.src = src; snap.style.opacity = 1; });
  const GW = innerWidth * 2, GH = innerHeight * 2, gc = document.createElement('canvas'); gc.id = 'tbglow'; gc.width = GW; gc.height = GH; document.body.appendChild(gc);
  const gx = gc.getContext('2d');
  window.__glow = (on, tt) => {
    gx.clearRect(0, 0, GW, GH); if (!on) return;
    BT.AREA_LAMPS.flat().forEach((l, i) => {
      const p = BT.scr(l.x, l.y, 30), r = 95 + 8 * Math.sin(tt * 3 + i);
      const gr = gx.createRadialGradient(p.x * 2, p.y * 2, 0, p.x * 2, p.y * 2, r * 2);
      gr.addColorStop(0, 'rgba(255,214,140,0.85)'); gr.addColorStop(0.25, 'rgba(255,180,90,0.35)'); gr.addColorStop(1, 'rgba(255,160,60,0)');
      gx.fillStyle = gr; gx.fillRect(p.x * 2 - r * 2, p.y * 2 - r * 2, r * 4, r * 4);
    });
  };
  const $ = s => g.querySelector(s);
  window.__tb = o => {
    const gr = $('.tb-gr');
    if (o.grade) { gr.style.background = o.grade[0]; gr.style.mixBlendMode = o.grade[1]; gr.style.opacity = o.grade[2]; } else gr.style.opacity = 0;
    g.querySelectorAll('.tb-bar').forEach(x => { x.style.height = o.bars + 'px'; });
    $('.tb-blk').style.opacity = o.black; $('.tb-fl').style.opacity = o.flash;
    $('.tb-band').style.opacity = o.band || 0;
    const it = $('.tb-int'); it.style.opacity = o.int ? o.int.a : 0;
    if (o.int) { it.innerHTML = '<span>' + o.int.t + '</span>'; it.style.letterSpacing = (0.06 + 0.06 * o.int.k) + 'em'; it.classList.toggle('low', !!o.int.low); }
    const ti = $('.tb-title'); ti.style.opacity = o.title ? o.title.a : 0;
    ti.classList.toggle('top', !!(o.title && o.title.top));
    if (o.title && ti.dataset.t !== o.title.t) {                                   /* uzun başlık ekrana sığsın */
      const bb = ti.querySelector('b'); bb.textContent = o.title.t; bb.style.fontSize = ''; ti.dataset.t = o.title.t;
      if (!document.body.classList.contains('tbv') && bb.scrollWidth > innerWidth - 80) bb.style.fontSize = Math.floor(parseFloat(getComputedStyle(bb).fontSize) * (innerWidth - 80) / bb.scrollWidth) + 'px';
    }
    if (o.title) { ti.querySelector('b').textContent = o.title.t; ti.querySelector('span').textContent = o.title.s || ''; ti.querySelector('i').style.width = Math.round(o.title.k * 120) + 'px'; ti.style.transform = 'translateY(' + Math.round((1 - o.title.k) * 10) + 'px)'; ti.querySelector('span').style.opacity = Math.max(0, Math.min(1, o.title.k * 2 - 0.6)); }
    const lp = $('.tb-loop'); lp.style.opacity = o.loop ? 1 : 0; if (o.loop) lp.querySelectorAll('em').forEach((e, i) => e.classList.toggle('on', i === o.loop.i));
    const sp = $('.tb-stamp'); sp.style.opacity = o.stamp ? o.stamp.a : 0;
    if (o.stamp) { sp.querySelector('div').textContent = o.stamp.t; sp.querySelector('span').textContent = o.stamp.s || ''; sp.style.transform = 'translate(-50%,-50%) scale(' + o.stamp.sc + ')'; }
    const kk = $('.tb-kick'); kk.style.opacity = o.kick ? o.kick.a : 0; if (o.kick) { kk.querySelector('small').textContent = o.kick.s; kk.querySelector('b').textContent = o.kick.t; }
    const sub = $('.tb-sub'); sub.style.opacity = o.sub ? 1 : 0; if (o.sub) sub.innerHTML = (o.sub[0] ? '<b>' + o.sub[0] + '</b>' : '') + o.sub[1];
    const lg = $('.tb-logo'); lg.style.opacity = o.logo ? o.logo.a : 0; if (o.logo) lg.querySelector('img').style.transform = 'scale(' + o.logo.sc + ')';
    const cs = $('.tb-cash'); cs.style.opacity = o.cash ? o.cash.a : 0; if (o.cash) cs.querySelector('b').textContent = '$ ' + Math.round(o.cash.v).toLocaleString(L.num || 'en-US');
    const ch = $('.tb-chip'); ch.style.opacity = o.chip ? o.chip.a : 0; if (o.chip) { ch.textContent = o.chip.t; ch.style.transform = 'translateX(-50%) scale(' + o.chip.sc + ')'; }
    const e2 = $('.tb-ep'); e2.style.opacity = o.ep ? o.ep.a : 0;
    if (o.ep) { e2.querySelector('b').style.transform = 'scale(' + o.ep.sc + ')'; e2.querySelector('i').style.width = Math.round(o.ep.k * 220) + 'px'; e2.querySelector('small').style.opacity = o.ep.s; e2.querySelector('img').style.opacity = o.ep.s; }
    const pk = $('.tb-perks'); pk.style.opacity = o.perks ? o.perks.a : 0;
    if (o.perks) { if (pk.dataset.n !== String(o.perks.items.length)) { pk.innerHTML = o.perks.items.map(x => '<div>' + x + '</div>').join(''); pk.dataset.n = o.perks.items.length; } [...pk.children].forEach((d, i) => { const k = o.perks.k[i]; d.style.opacity = k; d.style.transform = 'translateX(' + Math.round((1 - k) * -30) + 'px) scale(' + (1 + 0.15 * Math.max(0, 1 - k * 3) * (k > 0 ? 1 : 0)) + ')'; }); }
    const co = $('.tb-corner'); co.style.opacity = o.corner ? o.corner.a : 0; if (o.corner) co.textContent = o.corner.t;
    const tp = $('.tb-tap'); tp.style.opacity = o.tap ? o.tap.a : 0;
    if (o.tap && o.tap.x != null) { tp.style.left = o.tap.x + 'px'; tp.style.top = o.tap.y + 'px'; tp.style.transform = 'scale(' + o.tap.sc + ')'; }
    const tbs = document.getElementById('tbs'); if (tbs) tbs.style.filter = o.dim ? 'brightness(' + (1 - o.dim) + ')' : '';
    ['game', 'ui'].forEach(id => { const c = document.getElementById(id); if (c) c.style.transform = o.push ? 'scale(' + o.push + ')' : ''; });
    const e = $('.tb-end'); e.style.opacity = o.end ? o.end.a : 0;
    if (o.end) { e.querySelector('img').style.transform = 'scale(' + o.end.sc + ')'; e.querySelector('.t').style.opacity = o.end.t; e.querySelector('.f').style.opacity = o.end.f; e.querySelector('.u').style.opacity = o.end.f; const sh = $('.tb-shine'); sh.style.opacity = o.end.sh > 0 && o.end.sh < 1 ? 1 : 0; sh.style.transform = 'translateX(' + Math.round((o.end.sh - 0.5) * 1400) + 'px)'; }
    snap.style.opacity = o.snap || 0;
  };
  window.__storyLine = () => {
    const w = document.querySelector('.hkst .who'), t = document.querySelector('.hkst .txt');
    return t && t.textContent.trim() ? [w ? w.textContent.trim() : '', t.textContent.trim()] : null;
  };
  /* ortak yardımcılar */
  const step = sec => { for (let i = 0; i < Math.round(sec * 30); i++) window.__step(1000 / 30); };
  const hideOv = () => document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  const at = (x, y) => { BT.player.x = x; BT.player.y = y; };
  const makeRich = () => {
    if (window.__rich) return; window.__rich = 1;
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400; BT.M().office = true;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 25;
    at(6.2, 23.0);                                   /* oyuncu kadraj dışında, Hizmet Sahası'nda */
    step(30); hideOv();
  };
  const hireMgr = (z, c) => window.__hireMgr(z, c);
  /* bir öğenin ekrandaki merkezi (dokunma halkası için) */
  /* 'btn:metin' → içinde metin geçen kartın düğmesi */
  const byText = txt => { const c = [...document.querySelectorAll('#dpCards > *')].find(e => e.textContent.includes(txt)); return c ? c.querySelector('button') || c : null; };
  const tapAt = sel => { const el = typeof sel === 'string' ? (sel.startsWith('btn:') ? byText(sel.slice(4)) : document.querySelector(sel)) : sel; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  window.__F = { step, hideOv, at, makeRich, hireMgr, tapAt, byText };
}

module.exports = async function film(EP) {
  const ARGS = process.argv.slice(2), LANG = ARGS.includes('tr') ? 'tr' : 'en', V = !ARGS.includes('h'), PREVIEW = ARGS.includes('preview');
  const last0 = ARGS[ARGS.length - 1];
  const ONLY = ARGS.length && /^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/.test(last0) && !['tr', 'en', 'preview', 'v', 'h'].includes(last0) ? last0.split(',') : null;
  const L = EP.L[LANG], SHOTS = EP.shots(L), TEXT = EP.text(L), DUR = EP.dur;
  const FLASH = EP.flash || [], DIPS = EP.dips || [], GRADES = EP.grades || {};
  const tag = EP.id + '-' + LANG + (V ? '-v' : '');
  const VID = path.resolve(__dirname, '..', '..', 'video');
  const OUT = path.join(VID, (PREVIEW ? 'frames-preview-' : 'frames-') + tag);
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

  const gameSrc = patchGame(fs.readFileSync(path.join(ROOT, 'game.js'), 'utf8'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: V ? { width: 540, height: 960 } : { width: 960, height: 540 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(VCLOCK);
  await ctx.route('**/game.js', r => r.fulfill({ contentType: 'application/javascript', body: gameSrc }));
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(lang => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; if (BT.setLang) BT.setLang(lang); }, LANG);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', L.firm).catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    BT.S.tut = 99; window.__noTags = 1; window.__uiKeep = () => false;
    window.__pumpOff();
  });
  if (V) await p.evaluate(() => { window.TBS_V = 1; document.body.classList.add('tbv'); });
  await p.addScriptTag({ path: path.join(__dirname, 'scenes.js') });
  await p.evaluate(overlayInit, [L, LANG]);
  await p.evaluate(`(${EP.pageInit.toString()})(${JSON.stringify(L)}, ${JSON.stringify(LANG)}, ${V})`);
  await p.evaluate(async () => { await document.fonts.ready; });

  const N = Math.round(DUR * FPS); let cur = -1, tap = 0, last = null;
  const eio = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  for (let f = 0; f < N; f++) {
    const s = f / FPS, si = SHOTS.findIndex(g => s >= g.a && s < g.b), g = SHOTS[si], len = g.b - g.a, u = (s - g.a) / len, lt = s - g.a;
    const active = !ONLY || ONLY.includes(g.id);
    if (si !== cur) {
      const prev = cur >= 0 ? SHOTS[cur].id : null; cur = si; tap = 0;
      if (g.kind === 'game' && (active || g.always)) {
        await p.evaluate(([g, prev, V]) => {
          TBS.hide(); if (g.z) window.__zoom(g.z + (V ? 1 : 0));
          document.body.classList.toggle('tbui', !!g.ui); document.body.classList.toggle('tbtoast', !!g.toast);
          window.__setup(g, prev);
        }, [g, prev, V]);
      }
      if (g.kind !== 'game') await p.evaluate(() => { document.body.classList.remove('tbui'); document.body.classList.remove('tbtoast'); });
      if (g.kind === 'scene') await p.evaluate(g => TBS.opt(g.opt), g);
      if (g.tr === 'dissolve' && last && active) await p.evaluate(src => window.__snap(src), 'data:image/jpeg;base64,' + last.toString('base64'));
      console.log('çekim', g.id, s.toFixed(2));
    }
    if (!active) continue;
    /* katman durumu */
    const o = { bars: V || g.ui ? 0 : g.end ? Math.round(66 * (1 - clamp01((lt - 0.2) / 1.0))) : 66, black: 0, flash: 0, grade: GRADES[g.grade] || null };
    if (g.kind === 'black') o.black = 1;
    if (g.fadeIn && lt < g.fadeIn) o.black = Math.max(o.black, 1 - lt / g.fadeIn);
    FLASH.forEach(([t0, k]) => { if (s >= t0 && s < t0 + 0.45) o.flash = Math.max(o.flash, k * Math.pow(1 - (s - t0) / 0.45, 2)); });
    o.snap = g.tr === 'dissolve' ? Math.max(0, 1 - lt / g.td) : 0;
    if (g.push) o.push = 1 + g.push * eio(u);
    if (g.dim) o.dim = g.dim * clamp01(lt / 0.3);
    DIPS.forEach(d => { if (s >= d[0] && s < d[1]) o.black = Math.max(o.black, (s - d[0]) / (d[1] - d[0])); });
    if (s > DUR - 0.8) o.black = Math.max(o.black, (s - (DUR - 0.8)) / 0.8);
    const tapReq = [];
    TEXT.forEach(x => {
      if (s < x.a || s >= x.b) return;
      const tl = s - x.a, L2 = x.b - x.a, fade = clamp01(Math.min(tl / 0.35, (L2 - tl) / 0.3));
      if (x.kind === 'int') o.int = { t: x.t, a: fade, k: clamp01(tl / L2), low: !!x.low };
      if (x.kind === 'title') { o.title = { t: x.t, s: x.s, top: !!x.top, a: clamp01(Math.min(tl / 0.12, (L2 - tl) / 0.15)), k: 1 - Math.pow(1 - clamp01(tl / 0.45), 3) }; if (!x.top) o.band = Math.max(o.band || 0, o.title.a); }
      if (x.kind === 'loop') { let i = 0; (x.idx || []).forEach(([t0, k]) => { if (s >= t0) i = k; }); o.loop = { i }; }
      if (x.kind === 'logo') o.logo = { a: clamp01(Math.min(tl / 0.15, (L2 - tl) / 0.35)), sc: 1.0 + 0.18 * Math.pow(1 - clamp01(tl / 0.5), 3) + 0.03 * tl };
      if (x.kind === 'cash') { const k = clamp01((tl - 0.4) / (L2 - 0.8)); o.cash = { a: clamp01(Math.min(tl / 0.3, (L2 - tl) / 0.25)), v: x.from + (x.to - x.from) * Math.pow(k, 2.2) }; }
      if (x.kind === 'chip') o.chip = { t: x.t, a: clamp01(Math.min(tl / 0.08, (L2 - tl) / 0.1)), sc: 1 + 0.2 * Math.pow(1 - clamp01(tl / 0.15), 2) };
      if (x.kind === 'stamp') o.stamp = { t: x.t, s: x.s, a: clamp01(Math.min(tl / 0.06, (L2 - tl) / 0.12)), sc: 1 + 0.25 * Math.pow(1 - clamp01(tl / 0.18), 2) };
      if (x.kind === 'kicker') o.kick = { s: x.s, t: x.t, a: fade };
      if (x.kind === 'episode') o.ep = { a: clamp01(Math.min(tl / 0.2, (L2 - tl) / 0.35)), sc: 1 + 0.25 * Math.pow(1 - clamp01(tl / 0.35), 3), k: 1 - Math.pow(1 - clamp01((tl - 0.2) / 0.5), 3), s: clamp01((tl - 0.35) / 0.4) };
      if (x.kind === 'perks') o.perks = { items: x.items, a: clamp01(Math.min(tl / 0.2, (L2 - tl) / 0.3)), k: x.items.map((_, i) => clamp01((tl - 0.25 - i * (x.gap || 0.45)) / 0.18)) };
      if (x.kind === 'corner') o.corner = { t: x.t, a: fade * 0.95 };
      if (x.kind === 'tap') { tapReq.push(x.sel); const k = (tl % 0.9) / 0.9; o.tap = { a: clamp01(Math.min(tl / 0.15, (L2 - tl) / 0.15)) * (1 - k * 0.6), sc: 1.2 - 0.35 * k }; }
      if (x.kind === 'end') { const k = clamp01(tl / 0.9); o.end = { a: clamp01(tl / 0.6), sc: 1.12 - 0.12 * (1 - Math.pow(1 - k, 3)), t: clamp01((tl - 1.0) / 0.5), f: clamp01((tl - 1.6) / 0.5), sh: clamp01((tl - 0.9) / 0.9) }; }
    });
    if (o.tap && tapReq.length) Object.assign(o.tap, await p.evaluate(sel => window.__F.tapAt(sel) || {}, tapReq[0]));
    if (g.story) o.sub = await p.evaluate(() => window.__storyLine());
    await p.evaluate(([g, lt, u, o, tapNow]) => {
      if (g.kind === 'scene') TBS.draw(g.scene, (g.t0 || 0) + lt, u);
      if (g.kind === 'black') TBS.hide();
      if (g.kind === 'game' && g.cam) {
        const c = g.cam; let i = 0; while (i < c.length - 2 && u > c[i + 1][0]) i++;
        const v0 = Math.max(0, Math.min(1, (u - c[i][0]) / (c[i + 1][0] - c[i][0]))), v = v0 < 0.5 ? 2 * v0 * v0 : 1 - Math.pow(-2 * v0 + 2, 2) / 2;
        window.__cam = { x: c[i][1] + (c[i + 1][1] - c[i][1]) * v, y: c[i][2] + (c[i + 1][2] - c[i][2]) * v };
      }
      if (window.__frame) window.__frame(g, lt, u);
      if (tapNow && window.HK_STORY && HK_STORY._mode() === 'dlg') HK_STORY._tap();
      window.__tb(o);
      window.__glow(!!g.glow, lt);
      if (g.kind === 'game') window.__step(1000 / 30);
    }, [g, lt, u, o, g.story && (++tap % 40 === 0)]);
    if (EP.onFrame) await EP.onFrame(p, g, lt);
    if (!PREVIEW || f % 10 === 0) last = await p.screenshot({ path: path.join(OUT, String(PREVIEW ? f / 10 : f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: PREVIEW ? 82 : 94 });
    if (f % 300 === 0) console.log('kare', f, '/', N);
  }
  await b.close();

  /* müzik varsa MP4 */
  const wav = path.join(VID, EP.id + '-music.wav');
  if (!PREVIEW && !ONLY && fs.existsSync(wav)) {
    const mp4 = path.join(VID, EP.id + '-' + (V ? '1080x1920' : '1920x1080') + '-' + LANG + '.mp4');
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '30', '-i', path.join(OUT, '%05d.jpg'), '-i', wav,
      '-c:v', 'libx264', '-profile:v', 'high', '-tune', 'animation', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '30',
      '-c:a', 'aac', '-b:a', '224k', '-ar', '48000', '-shortest', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
    console.log(r.status === 0 ? 'video: ' + mp4 : 'ffmpeg hata');
  }
};
