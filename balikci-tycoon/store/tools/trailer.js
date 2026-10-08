/* Sinematik fragman (EN, 60 sn, 1920×1080, 30 fps).
   İki kaynak iç içe kurgulanır:
   1) trailer-scenes.js — elle çizilmiş piksel sahneler (şafak, hamsi sürüsü, ağ, lodos, Şahmeran, gece limanı)
   2) gerçek oyun — game.js çekim sırasında küçük yamalarla yüklenir: kamera serbest, yakınlık 1–5, oyun içi etiketler gizli
   Oyunun saati sanaldır (rAF/performance.now/setTimeout adımlanır), her kare tek tek çekilir. Zamanlar müziğe oturur
   (120 BPM, 1 ölçü = 2 sn, vuruş 14.0'te). Müzik: trailer-music.py.
   Kullanım: node store/tools/trailer.js [preview [çekim,çekim]]   (oyun klasörü 8099'da sunulmalı)
   Çıktı: store/video/frames-trailer/NNNNN.jpg  (preview: her 10. kare → frames-trailer-preview/) */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path');
const FPS = 30, DUR = 60, PREVIEW = process.argv[2] === 'preview';
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const OUT = path.resolve(__dirname, '..', 'video', PREVIEW ? 'frames-trailer-preview' : 'frames-trailer');
const URL = process.env.URL || 'http://localhost:8099/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
  return src;
}

/* ---------------- zaman çizelgesi ----------------
   kind: scene (elle çizilmiş) | game (oyun) | black
   game çekimleri: id ile sayfadaki kurulum seçilir; cam: [[u, x, y], …] dünya koordinatı, z: yakınlık (1 geniş … 5 yakın) */
const SHOTS = [
  { id: 'dawn', a: 0, b: 8, kind: 'scene', scene: 'dawn' },
  { id: 'deep', a: 8, b: 11.5, kind: 'scene', scene: 'deep' },
  { id: 'cast', a: 11.5, b: 14, kind: 'scene', scene: 'cast' },
  { id: 'net', a: 14, b: 16, kind: 'game', z: 5, cam: [[0, 2.9, 1.9], [1, 3.3, 2.1]], grade: 'morning' },
  { id: 'fillet', a: 16, b: 18, kind: 'game', z: 5, cam: [[0, 4.6, 2.0], [1, 5.6, 2.3]], grade: 'morning' },
  { id: 'sell', a: 18, b: 20, kind: 'game', z: 5, cam: [[0, 7.9, 3.2], [1, 8.6, 3.5]], grade: 'morning' },
  { id: 'growA', a: 20, b: 21, kind: 'game', z: 2, cam: [[0, 6.6, 6.2], [1, 6.8, 6.6]] },
  { id: 'growB', a: 21, b: 22, kind: 'game', z: 2, cam: [[0, 6.8, 6.6], [1, 7.0, 7.0]] },
  { id: 'crew', a: 22, b: 26, kind: 'game', z: 4, cam: [[0, 3.0, 1.6], [1, 7.6, 4.2]] },
  { id: 'zones', a: 26, b: 30, kind: 'game', z: 2, cam: [[0, 5.5, 2.5], [1, 5.5, 20.5]], grade: 'warm' },
  { id: 'special', a: 30, b: 34, kind: 'game', z: 5, cam: [[0, 9.4, 3.4], [1, 9.8, 3.7]] },
  { id: 'book', a: 34, b: 36, kind: 'game', z: 3, cam: [[0, 8.0, 4.0], [1, 8.2, 4.2]], panel: true },
  { id: 'storm', a: 36, b: 38, kind: 'scene', scene: 'storm' },
  { id: 'shoal', a: 38, b: 39, kind: 'scene', scene: 'deep', t0: 1.4 },
  { id: 'rush', a: 39, b: 40, kind: 'game', z: 4, cam: [[0, 8.2, 10.2], [1, 8.8, 10.6]] },
  { id: 'promise', a: 40, b: 41.5, kind: 'black' },
  { id: 'legend', a: 41.5, b: 45.5, kind: 'scene', scene: 'legend' },
  { id: 'story', a: 45.5, b: 50, kind: 'game', story: true },
  { id: 'night', a: 50, b: 55, kind: 'game', z: 1, cam: [[0, 4.5, 3.5], [1, 7.5, 15.5]], grade: 'night' },
  { id: 'end', a: 55, b: 60, kind: 'scene', scene: 'finale' }
];
/* yazılar: int (ortada, ince aralıklı) · title (büyük başlık + alt satır) · stamp (çerçeveli damga) · loop (döngü şeridi) · end */
const TEXT = [
  { a: 1.0, b: 3.7, kind: 'int', t: 'THE BLACK SEA' },
  { a: 4.3, b: 7.7, kind: 'int', t: 'Every autumn, the hamsi come home.' },
  { a: 8.5, b: 11.3, kind: 'int', t: 'Silver, by the million.' },
  { a: 11.7, b: 13.85, kind: 'int', t: 'And every legend starts with one net.' },
  { a: 14.05, b: 15.95, kind: 'title', t: 'CATCH', s: 'Stand by your net. The sea fills the crate.' },
  { a: 16.05, b: 17.95, kind: 'title', t: 'FILLET', s: 'Carry the catch to the cutting table.' },
  { a: 18.05, b: 19.95, kind: 'title', t: 'SELL', s: 'Stock the stall. Fill every order. Get paid.' },
  { a: 20.05, b: 21.95, kind: 'title', t: 'GROW', s: 'Reinvest every coin. Upgrade. Expand.' },
  { a: 14.0, b: 22.0, kind: 'loop' },
  { a: 22.1, b: 25.9, kind: 'title', t: 'HIRE A CREW', s: 'Porters, filleters, stall-keepers, cashiers. Then a manager runs it all.' },
  { a: 26.15, b: 27.1, kind: 'stamp', t: 'FISHING PIER' },
  { a: 27.15, b: 28.1, kind: 'stamp', t: 'FISH MARKET' },
  { a: 28.15, b: 29.1, kind: 'stamp', t: 'SMOKEHOUSE', s: 'smoked fish sells for 2.4×' },
  { a: 29.15, b: 29.95, kind: 'stamp', t: "FISHERMEN'S KITCHEN", s: "cook Skipper's Stew" },
  { a: 30.1, b: 33.9, kind: 'title', t: '69 QUIRKY CUSTOMERS', s: 'Every one hides a name. Serve them well to learn it.' },
  { a: 34.05, b: 35.95, kind: 'title', t: 'THE CUSTOMER BOOK', s: 'Collect every face that visits your cove.' },
  { a: 36.1, b: 37.9, kind: 'stamp', t: 'STORMS' },
  { a: 38.05, b: 38.95, kind: 'stamp', t: 'SHOALS' },
  { a: 39.05, b: 39.95, kind: 'stamp', t: 'RUSH HOURS' },
  { a: 40.2, b: 41.4, kind: 'int', t: 'But the sea keeps a promise...' },
  { a: 42.2, b: 45.3, kind: 'int', t: 'Beneath the cove, something ancient waits.' },
  { a: 46.6, b: 49.8, kind: 'legend' },
  { a: 50.6, b: 54.6, kind: 'int', t: 'From a tiny pier... to a legendary harbor.' },
  { a: 55.3, b: 60, kind: 'end' }
];
const FLASH = [14.0, 21.0, 36.0, 38.0, 39.0, 50.0];
const DIPS = [[39.85, 40.0], [45.35, 45.5], [49.75, 50.0]];   /* siyaha iniş */
const GRADES = { morning: ['#ffd6a0', 'soft-light', 0.18], warm: ['#ffb36b', 'soft-light', 0.14], night: ['#14205a', 'multiply', 0.5] };

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const gameSrc = patchGame(fs.readFileSync(path.resolve(__dirname, '..', '..', 'game.js'), 'utf8'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(VCLOCK);
  await ctx.route('**/game.js', r => r.fulfill({ contentType: 'application/javascript', body: gameSrc }));
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(() => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; if (BT.setLang) BT.setLang('en'); });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Silver Net Co.').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    BT.S.tut = 99; window.__noTags = 1;
    window.__uiKeep = q => window.__keepSpec && typeof q.s === 'string' && /^[★“]/.test(q.s);     /* yalnız özel müşteri çekiminde: adı ve sözü */
    window.__pumpOff();
  });
  await p.addScriptTag({ path: path.join(__dirname, 'trailer-scenes.js') });

  /* ---------- sinema katmanı ---------- */
  await p.evaluate(() => {
    const st = document.createElement('style');
    st.textContent =
      'body.tbc #hud,body.tbc #devbar,body.tbc #objective,body.tbc #queueHint,body.tbc #toast,body.tbc #actBtn,body.tbc #tradeBtn,body.tbc #coach,body.tbc #dayBanner,body.tbc #lvlUp,body.tbc #eventChip,body.tbc #chBtn,body.tbc #autoBadge,body.tbc #specPop{visibility:hidden!important}' +
      '#tbglow{position:fixed;inset:0;width:100vw;height:100vh;z-index:190;pointer-events:none;mix-blend-mode:screen}' +
      '#tbg{position:fixed;inset:0;z-index:200;pointer-events:none;font-family:"Pixelify Sans",monospace}' +
      '#tbg .tb-gr{position:absolute;inset:0;opacity:0}' +
      '#tbg .tb-vg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 58%,rgba(0,0,0,.5) 100%)}' +
      '#tbg .tb-bar{position:absolute;left:0;right:0;height:66px;background:#000}#tbg .tb-bt{top:0}#tbg .tb-bb{bottom:0}' +
      '#tbg .tb-blk{position:absolute;inset:0;background:#000;opacity:0}#tbg .tb-fl{position:absolute;inset:0;background:#fff6e0;opacity:0}' +
      '#tbg .tb-band{position:absolute;left:0;right:0;bottom:66px;height:190px;background:linear-gradient(transparent,rgba(4,8,16,.62));opacity:0}' +
      '#tbg .tb-int{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-weight:600;font-size:30px;color:#fff3dc;text-shadow:3px 3px 0 rgba(20,8,20,.85),0 0 24px rgba(0,0,0,.55);opacity:0;white-space:nowrap}' +
      '#tbg .tb-int.low{top:auto;bottom:96px;transform:none}' +
      '#tbg .tb-title{position:absolute;left:0;right:0;bottom:100px;text-align:center;opacity:0}' +
      '#tbg .tb-title b{display:block;font-weight:700;font-size:58px;letter-spacing:.14em;color:#fff3d6;text-shadow:4px 4px 0 #2a1408,0 0 30px rgba(0,0,0,.5);white-space:nowrap}' +
      '#tbg .tb-title i{display:block;margin:6px auto 0;height:4px;background:#e4b94a;box-shadow:0 2px 0 #7a4a10}' +
      '#tbg .tb-title span{display:block;margin-top:10px;font-weight:500;font-size:19px;letter-spacing:.05em;color:#d8ecff;text-shadow:2px 2px 0 #08121c;white-space:nowrap}' +
      '#tbg .tb-loop{position:absolute;left:0;right:0;bottom:76px;display:flex;justify-content:center;gap:14px;font-weight:700;font-size:15px;letter-spacing:.3em;opacity:0}' +
      '#tbg .tb-loop em{font-style:normal;color:#fff3d6;opacity:.32}#tbg .tb-loop em.on{opacity:1;color:#ffcf5a;text-shadow:0 0 12px rgba(255,190,80,.6)}#tbg .tb-loop u{text-decoration:none;color:#e4b94a;opacity:.5}' +
      '#tbg .tb-stamp{position:absolute;left:50%;top:50%;opacity:0;text-align:center}' +
      '#tbg .tb-stamp div{padding:12px 30px 10px;border:4px solid #fff3d6;box-shadow:0 0 0 4px #2a1408,inset 0 0 0 4px #2a1408;background:rgba(8,14,24,.55);font-weight:700;font-size:46px;letter-spacing:.16em;color:#fff3d6;text-shadow:4px 4px 0 #2a1408;white-space:nowrap}' +
      '#tbg .tb-stamp span{display:block;margin-top:12px;font-size:20px;letter-spacing:.08em;color:#ffcf5a;text-shadow:2px 2px 0 #2a1408}' +
      '#tbg .tb-leg{position:absolute;right:60px;top:96px;text-align:right;opacity:0}#tbg .tb-leg small{display:block;font-size:14px;font-weight:600;letter-spacing:.45em;color:#b8a8e0}' +
      '#tbg .tb-leg b{display:block;font-size:50px;font-weight:700;letter-spacing:.06em;color:#ffb454;text-shadow:3px 3px 0 #000,6px 6px 0 #7a2a2a}' +
      '#tbg .tb-sub{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:19px;color:#f6e9d3;opacity:0}#tbg .tb-sub b{color:#ffb454;letter-spacing:.14em;font-size:14px;margin-right:12px}' +
      '#tbg .tb-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;opacity:0;padding-bottom:150px}' +
      '#tbg .tb-end img{width:560px;image-rendering:pixelated;filter:drop-shadow(0 6px 0 rgba(0,0,0,.45))}' +
      '#tbg .tb-end .t{font-size:26px;font-weight:600;letter-spacing:.1em;color:#fff3dc;text-shadow:3px 3px 0 #10081c}' +
      '#tbg .tb-end .f{font-size:15px;font-weight:700;letter-spacing:.32em;color:#ffcf5a;text-shadow:2px 2px 0 #10081c}' +
      '#tbg .tb-end .u{font-size:14px;letter-spacing:.1em;color:#bcd2ff}' +
      '#tbg .tb-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,250,220,.55) 50%,transparent 60%);mix-blend-mode:overlay;opacity:0}' +
      '.tbstory .hkst{padding:0!important;background:#000!important;z-index:150!important}.tbstory .hkst .app{max-width:none!important;width:100vw;height:100vh;justify-content:center;align-items:center}' +
      '.tbstory .hkst .stage{border:0!important;box-shadow:none!important}.tbstory .hkst canvas{width:auto!important;height:100vh!important}' +
      '.tbstory .hkst .panel,.tbstory .hkst .skip,.tbstory .hkst .hud{display:none!important}' +
      '.tbpanel #custScr:not(.hidden){transform:scale(.78);transform-origin:50% 46%}';
    document.head.appendChild(st);
    const g = document.createElement('div'); g.id = 'tbg';
    g.innerHTML = '<div class="tb-gr"></div><div class="tb-vg"></div><div class="tb-band"></div>' +
      '<div class="tb-int"></div><div class="tb-title"><b></b><i></i><span></span></div>' +
      '<div class="tb-loop"><em>CATCH</em><u>›</u><em>FILLET</em><u>›</u><em>SELL</em><u>›</u><em>GROW</em></div>' +
      '<div class="tb-stamp"><div></div><span></span></div>' +
      '<div class="tb-leg"><small>A 12-DAY ANATOLIAN LEGEND</small><b>THE PROMISE BELOW</b></div>' +
      '<div class="tb-end"><img src="store/logo/logo-horizontal-en.png"><div class="t">Build your cove. Keep the promise.</div>' +
      '<div class="f">FREE · NO ADS · NO IN-APP PURCHASES</div><div class="u">English & Türkçe · recaikas.github.io/okult-kahin-byblbn</div><div class="tb-shine"></div></div>' +
      '<div class="tb-bar tb-bt"></div><div class="tb-bar tb-bb"></div><div class="tb-sub"></div><div class="tb-blk"></div><div class="tb-fl"></div>';
    document.body.appendChild(g); document.body.classList.add('tbc');
    const gc = document.createElement('canvas'); gc.id = 'tbglow'; gc.width = 1920; gc.height = 1080; document.body.appendChild(gc);
    const gx = gc.getContext('2d');
    window.__glow = (on, tt) => {
      gx.clearRect(0, 0, 1920, 1080); if (!on) return;
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
      if (o.int) { it.textContent = o.int.t; it.style.letterSpacing = (0.06 + 0.06 * o.int.k) + 'em'; it.classList.toggle('low', !!o.int.low); }
      const ti = $('.tb-title'); ti.style.opacity = o.title ? o.title.a : 0;
      if (o.title) { ti.querySelector('b').textContent = o.title.t; ti.querySelector('span').textContent = o.title.s || ''; ti.querySelector('i').style.width = Math.round(o.title.k * 120) + 'px'; ti.style.transform = 'translateY(' + Math.round((1 - o.title.k) * 10) + 'px)'; ti.querySelector('span').style.opacity = Math.max(0, Math.min(1, o.title.k * 2 - 0.6)); }
      const lp = $('.tb-loop'); lp.style.opacity = o.loop ? 1 : 0; if (o.loop) lp.querySelectorAll('em').forEach((e, i) => e.classList.toggle('on', i === o.loop.i));
      const sp = $('.tb-stamp'); sp.style.opacity = o.stamp ? o.stamp.a : 0;
      if (o.stamp) { sp.querySelector('div').textContent = o.stamp.t; sp.querySelector('span').textContent = o.stamp.s || ''; sp.style.transform = 'translate(-50%,-50%) scale(' + o.stamp.sc + ')'; }
      $('.tb-leg').style.opacity = o.leg || 0;
      const sub = $('.tb-sub'); sub.style.opacity = o.sub ? 1 : 0; if (o.sub) sub.innerHTML = (o.sub[0] ? '<b>' + o.sub[0] + '</b>' : '') + o.sub[1];
      const e = $('.tb-end'); e.style.opacity = o.end ? o.end.a : 0;
      if (o.end) { e.querySelector('img').style.transform = 'scale(' + o.end.sc + ')'; e.querySelector('.t').style.opacity = o.end.t; e.querySelector('.f').style.opacity = o.end.f; e.querySelector('.u').style.opacity = o.end.f; const sh = $('.tb-shine'); sh.style.opacity = o.end.sh > 0 && o.end.sh < 1 ? 1 : 0; sh.style.transform = 'translateX(' + Math.round((o.end.sh - 0.5) * 1400) + 'px)'; }
    };
    window.__storyLine = () => {
      const w = document.querySelector('.hkst .who'), t = document.querySelector('.hkst .txt');
      return t && t.textContent.trim() ? [w ? w.textContent.trim() : '', t.textContent.trim()] : null;
    };
    /* çekim kurulumları */
    const step = sec => { for (let i = 0; i < Math.round(sec * 30); i++) window.__step(1000 / 30); };
    const hideOv = () => document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    const at = (x, y) => { BT.player.x = x; BT.player.y = y; };
    const makeRich = () => {
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
    window.__setup = (id, prev) => {
      window.__keepSpec = id === 'special'; window.__uiScale = id === 'special' ? 1.9 : 1;
      if (prev === 'story') { try { HK_STORY.close(); } catch (e) { } document.body.classList.remove('tbstory'); }
      if (prev === 'book') { hideOv(); document.body.classList.remove('tbpanel'); }
      if (BT.day.t > BT.DAY_LEN * 0.55 && id !== 'night') BT.day.t = 25;
      if (id === 'net') { at(2.6, 1.5); step(2.2); }
      if (id === 'fillet') { at(4.2, 1.8); }
      if (id === 'sell') { at(6.4, 2.6); step(1.4); at(7.6, 3.0); }
      if (id === 'growA') { at(9.4, 5.2); }
      if (id === 'growB') { makeRich(); }
      if (id === 'crew' || id === 'zones' || id === 'rush') at(6.2, 23.0);
      if (id === 'special') {
        at(6.2, 23.0);
        BT.S.names = (BT.S.names || []).filter(x => x !== 'temel'); BT.S.jobs = (BT.S.jobs || []).filter(x => x !== 'temel');
        const c = BT.counters[0]; c.slots.fill(null); BT.customers.forEach(q => { if (q.c === c) q.state = 'leave'; });
        step(1.5);
        BT.day.spec = ['temel', 'caner']; BT.spawnSpecial(0);
        const cu = BT.customers.find(q => q.spec === 'temel'); if (cu) { cu.x = 10.6; cu.y = c.y + 0.9; }
        step(0.3);
      }
      if (id === 'book') {
        const ids = BT.SPECIALS.map(x => x.id); BT.S.met = ids.slice(0, 44); BT.S.names = ids.filter((x, i) => i % 3 === 0).slice(0, 15); BT.S.jobs = ids.filter((x, i) => i % 2 === 0).slice(0, 26);
        document.body.classList.add('tbpanel'); BT.openCustBook();
      }
      if (id === 'night') { BT.day.t = BT.DAY_LEN * 0.9; }
      if (id === 'story') {
        document.body.classList.add('tbstory'); window.HK_STORY_OFF = 0;
        HK_STORY.open(8, { lang: 'en', ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] }); step(0.3);
      }
      if (id !== 'book' && id !== 'story') hideOv();
    };
  });
  await p.evaluate(async () => { await document.fonts.ready; });

  const N = DUR * FPS; let cur = -1, tap = 0;
  const eio = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const camAt = (c, u) => { let i = 0; while (i < c.length - 2 && u > c[i + 1][0]) i++; const v = eio(clamp01((u - c[i][0]) / (c[i + 1][0] - c[i][0]))); return { x: c[i][1] + (c[i + 1][1] - c[i][1]) * v, y: c[i][2] + (c[i + 1][2] - c[i][2]) * v }; };
  for (let f = 0; f < N; f++) {
    const s = f / FPS, si = SHOTS.findIndex(g => s >= g.a && s < g.b), g = SHOTS[si], len = g.b - g.a, u = (s - g.a) / len, lt = s - g.a;
    const active = !ONLY || ONLY.includes(g.id);
    if (si !== cur) {
      const prev = cur >= 0 ? SHOTS[cur].id : null; cur = si; tap = 0;
      if (g.kind === 'game' && (active || ['growB'].includes(g.id))) {
        await p.evaluate(([g, prev]) => { TBS.hide(); if (g.z) window.__zoom(g.z); window.__setup(g.id, prev); }, [g, prev]);
      }
      console.log('çekim', g.id, s.toFixed(2));
    }
    if (!active) continue;
    /* katman durumu */
    const o = { bars: g.id === 'end' ? Math.round(66 * (1 - clamp01((lt - 0.2) / 1.0))) : 66, black: 0, flash: 0, grade: GRADES[g.grade] || null };
    if (s < 1.2) o.black = 1 - clamp01(s / 1.2);
    if (g.kind === 'black') o.black = 1;
    FLASH.forEach(t0 => { if (s >= t0 && s < t0 + 0.4) o.flash = Math.max(o.flash, 0.7 * Math.pow(1 - (s - t0) / 0.4, 2)); });
    DIPS.forEach(d => { if (s >= d[0] && s < d[1]) o.black = Math.max(o.black, (s - d[0]) / (d[1] - d[0])); });
    if (g.id === 'legend' && lt < 0.6) o.black = Math.max(o.black, 1 - lt / 0.6);
    if (g.id === 'end' && lt < 0.5) o.black = Math.max(o.black, 1 - lt / 0.5);
    if (s > 59.2) o.black = Math.max(o.black, (s - 59.2) / 0.8);
    TEXT.forEach(x => {
      if (s < x.a || s >= x.b) return;
      const tl = s - x.a, L = x.b - x.a, fade = clamp01(Math.min(tl / 0.35, (L - tl) / 0.3));
      if (x.kind === 'int') o.int = { t: x.t, a: fade, k: clamp01(tl / L), low: false };
      if (x.kind === 'title') { o.title = { t: x.t, s: x.s, a: clamp01(Math.min(tl / 0.12, (L - tl) / 0.15)), k: 1 - Math.pow(1 - clamp01(tl / 0.45), 3) }; o.band = Math.max(o.band || 0, o.title.a); }
      if (x.kind === 'loop') o.loop = { i: Math.min(3, Math.floor((s - 14) / 2)) };
      if (x.kind === 'stamp') o.stamp = { t: x.t, s: x.s, a: clamp01(Math.min(tl / 0.06, (L - tl) / 0.12)), sc: 1 + 0.25 * Math.pow(1 - clamp01(tl / 0.18), 2) };
      if (x.kind === 'legend') o.leg = fade;
      if (x.kind === 'end') { const k = clamp01(tl / 0.9); o.end = { a: clamp01(tl / 0.6), sc: 1.12 - 0.12 * (1 - Math.pow(1 - k, 3)), t: clamp01((tl - 1.0) / 0.5), f: clamp01((tl - 1.6) / 0.5), sh: clamp01((tl - 0.9) / 0.9) }; }
    });
    if (g.story) o.sub = await p.evaluate(() => window.__storyLine());
    await p.evaluate(([g, lt, u, o, tapNow]) => {
      if (g.kind === 'scene') TBS.draw(g.scene, (g.t0 || 0) + lt, u);
      if (g.kind === 'black') TBS.hide();
      if (g.kind === 'game' && g.cam) {
        const c = g.cam; let i = 0; while (i < c.length - 2 && u > c[i + 1][0]) i++;
        const v0 = Math.max(0, Math.min(1, (u - c[i][0]) / (c[i + 1][0] - c[i][0]))), v = v0 < 0.5 ? 2 * v0 * v0 : 1 - Math.pow(-2 * v0 + 2, 2) / 2;
        window.__cam = { x: c[i][1] + (c[i + 1][1] - c[i][1]) * v, y: c[i][2] + (c[i + 1][2] - c[i][2]) * v };
      }
      /* oyuncu yürüyüşleri */
      if (g.id === 'fillet') { const k = Math.min(1, lt / 0.6); BT.player.x = 4.2 + 0.8 * k; BT.player.y = 1.8 + 0.2 * k; if (lt > 1.3) { const k2 = Math.min(1, (lt - 1.3) / 0.5); BT.player.x = 5.0 + 1.4 * k2; BT.player.y = 2.0 + 0.6 * k2; } }
      if (g.id === 'special') { const cu = BT.customers.find(q => q.spec === 'temel'); if (cu) window.__cam = { x: cu.x - 0.4 - 0.3 * u, y: cu.y + 0.5 }; }
      if (g.id === 'sell') { const k = Math.min(1, lt / 0.5); BT.player.x = 7.6 + 0.6 * k; BT.player.y = 3.0 + 0.2 * k; }
      if (tapNow && window.HK_STORY && HK_STORY._mode() === 'dlg') HK_STORY._tap();
      window.__tb(o);
      window.__glow(g.id === 'night', lt);
      if (g.kind === 'game') window.__step(1000 / 30);
    }, [g, lt, u, o, g.story && (++tap % 40 === 0)]);
    if (!PREVIEW || f % 10 === 0) await p.screenshot({ path: path.join(OUT, String(PREVIEW ? f / 10 : f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: PREVIEW ? 82 : 94 });
    if (f % 300 === 0) console.log('kare', f, '/', N);
  }
  await b.close();
})();
