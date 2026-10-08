/* Sinematik fragman (EN, 60 sn, 1920×1080, 30 fps): gerçek oyun, sanal saatle kare kare çekilir; üstüne sinema
   şeritleri, renk tonu, vinyet ve piksel yazılar bindirilir. Çekim zamanları trailer-music.py'deki vuruşlara oturur.
   Kullanım: node store/tools/trailer.js [preview]   (oyun klasörü 8099'da sunulmalı)
   Çıktı: store/video/frames-trailer/NNNNN.jpg  (preview: her 10. kare, frames-trailer-preview/) */
const { chromium, openGame } = require('./scene');
const fs = require('fs'), path = require('path');
const FPS = 30, DUR = 60, PREVIEW = process.argv[2] === 'preview';
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;          /* preview: yalnız bu çekimler */
const OUT = path.resolve(__dirname, '..', 'video', PREVIEW ? 'frames-trailer-preview' : 'frames-trailer');
const BAR = 4 * 60 / 138, T0 = 10, at = k => +(T0 + k * BAR).toFixed(3);  /* ölçü ızgarası */
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

/* ---------- çekim listesi ----------
   a/b: başlangıç-bitiş (sn) · st: oyun durumu (fresh | rich) · z: yakınlık (1 geniş, 3 yakın) · from/to: oyuncu yolu
   pre: çekimden önce sessizce akan oyun süresi (kamera otursun, sahne canlansın) · grade: renk tonu
   card: siyah üstüne orta yazı · low: alt başlık [no, başlık, alt satır] · mid: görüntü üstüne orta-alt yazı */
const SHOTS = [
  { id: 'cold', a: 0, b: 3.2, card: ['ON THE BLACK SEA COAST...'], black: true },
  { id: 'pier', a: 3.2, b: 7.0, st: 'fresh', z: 1, from: [4.0, 4.6], to: [5.2, 3.6], pre: 2, grade: 'dawn', mid: '...a tiny pier waits for its first catch.', barsIn: true },
  { id: 'onenet', a: 7.0, b: 10.0, st: 'fresh', z: 3, from: [3.4, 2.2], to: [2.7, 1.6], pre: 1.5, grade: 'dawn', mid: 'Every harbor starts with one net.', flashOut: true },
  { id: 'net', a: at(0), b: at(2), st: 'fresh', z: 3, from: [2.6, 1.5], to: [2.6, 1.5], pre: 1.2, low: ['01', 'CAST YOUR NET', 'Stand by the net and the catch piles up.'] },
  { id: 'fillet', a: at(2), b: at(4), st: 'fresh', z: 3, path: [[0, 3.2, 1.9], [0.35, 5.0, 2.0], [0.75, 5.0, 2.0], [1, 6.4, 2.6]], pre: 0.3, low: ['02', 'FILLET THE CATCH', 'Carry it to the cutting table. Grab the fillets.'] },
  { id: 'sell', a: at(4), b: at(6), st: 'fresh', z: 3, path: [[0, 6.6, 2.7], [0.3, 8.2, 3.2], [1, 8.2, 3.2]], pre: 0.2, low: ['03', 'SERVE & GET PAID', 'Fill every order at the stall. Coins in the till.'] },
  { id: 'crew', a: at(6), b: at(8), st: 'rich', z: 2, from: [6.0, 3.2], to: [6.8, 6.4], pre: 2, low: ['04', 'HIRE A CREW', 'Porter · filleter · stall-keeper · cashier. Then a manager.'] },
  { id: 'smoke', a: at(8), b: at(10), st: 'rich', z: 3, from: [5.6, 13.2], to: [6.6, 15.4], pre: 1.5, grade: 'warm', low: ['05', 'SMOKE IT', 'The smokehouse turns fish into 2.4× the value.'] },
  { id: 'kitchen', a: at(10), b: at(12), st: 'rich', z: 3, from: [5.2, 18.6], to: [6.6, 20.2], pre: 1.5, grade: 'warm', low: ['06', "COOK SKIPPER'S STEW", 'Bonito + salmon on the stove. 4 zones, one harbor.'] },
  { id: 'special', a: at(12), b: at(15), st: 'rich', z: 3, special: true, from: [8.9, 3.2], to: [8.9, 3.2], pre: 0.2, low: ['07', '69 QUIRKY CUSTOMERS', 'Each one has a secret. Finish the order to learn the name.'] },
  { id: 'book', a: at(15), b: at(17), st: 'rich', z: 3, from: [8.9, 3.2], to: [8.9, 3.2], book: true, low: ['08', 'FILL THE CUSTOMER BOOK', 'Shadows become faces. ????? becomes a friend.'] },
  { id: 'office', a: at(17), b: at(18), st: 'rich', z: 3, from: [8.9, 3.2], to: [8.9, 3.2], office: true, low: ['09', 'PLAY THE MARKET', 'Shares, contracts, a holding.'] },
  { id: 'events', a: at(18), b: at(19), st: 'rich', z: 1, from: [6.0, 8.0], to: [6.6, 10.5], pre: 1.5, ev: 'gemi', grade: 'cool', low: ['10', 'SHOALS · FERRIES · STORMS', 'The sea never plays the same day twice.'] },
  { id: 'promise', a: at(19), b: 44.6, card: ['But the sea keeps', 'an old promise...'], black: true },
  { id: 'story', a: 44.6, b: at(24), st: 'rich', story: true, grade: 'night' },
  { id: 'harbor', a: at(24), b: 56.0, st: 'rich', z: 1, from: [6.0, 2.0], to: [6.4, 19.0], pre: 1.5, grade: 'gold', mid: 'From a tiny pier... to a grand harbor.' },
  { id: 'end', a: 56.0, b: 60.0, end: true, black: true }
];

const GRADES = {   /* [renk, karışım, güç] */
  dawn: ['#ff8a4c', 'soft-light', 0.3], warm: ['#ffb36b', 'soft-light', 0.18], cool: ['#3b6fa8', 'soft-light', 0.3],
  night: ['#2a1650', 'multiply', 0.25], gold: ['#ffc46b', 'soft-light', 0.22]
};

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const { p } = await openGame(b, 'en', { width: 960, height: 540 }, 2, VCLOCK);
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('console', m.text().slice(0, 160)); });
  await p.evaluate(() => {
    document.getElementById('settingsScreen').classList.add('hidden');
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    BT.S.tut = 99;                                          /* eğitim ipuçları ve halkalar görünmesin */
  });
  await p.evaluate(() => window.__pumpOff());

  /* sinema katmanı */
  await p.evaluate(() => {
    const st = document.createElement('style');
    st.textContent =
      'body.tbc #hud,body.tbc #devbar,body.tbc #objective,body.tbc #queueHint,body.tbc #toast,body.tbc #actBtn,body.tbc #tradeBtn,body.tbc #coach,body.tbc #dayBanner,body.tbc #lvlUp,body.tbc #eventChip{visibility:hidden!important}' +
      'body.tbev #eventChip{visibility:visible!important;position:fixed!important;left:50%!important;top:96px!important;right:auto!important;transform:translateX(-50%) scale(1.7);transform-origin:50% 0;z-index:150}' +
      '#tbg{position:fixed;inset:0;z-index:200;pointer-events:none}' +
      '#tbg .tb-gr{position:absolute;inset:0;opacity:0}' +
      '#tbg .tb-vg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,transparent 55%,rgba(0,0,0,.55) 100%)}' +
      '#tbg .tb-bar{position:absolute;left:0;right:0;height:0;background:#000}#tbg .tb-bt{top:0}#tbg .tb-bb{bottom:0}' +
      '#tbg .tb-blk{position:absolute;inset:0;background:#000;opacity:0}#tbg .tb-fl{position:absolute;inset:0;background:#fff8e6;opacity:0}' +
      '#tbg .tb-card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:700 34px "Pixelify Sans";letter-spacing:.14em;color:#fff1c9;text-shadow:3px 3px 0 #3d2413;opacity:0}' +
      '#tbg .tb-mid{position:absolute;left:0;right:0;bottom:92px;text-align:center;font:600 26px "Pixelify Sans";letter-spacing:.06em;color:#fff6dc;text-shadow:2px 2px 0 #10202c,0 0 18px rgba(0,0,0,.6);opacity:0}' +
      '#tbg .tb-low{position:absolute;left:52px;bottom:88px;opacity:0}' +
      '#tbg .tb-low .k{display:flex;align-items:center;gap:10px;font:700 15px "Pixelify Sans";letter-spacing:.3em;color:#d9a441;margin-bottom:4px}' +
      '#tbg .tb-low .k i{display:block;width:46px;height:3px;background:#d9a441}' +
      '#tbg .tb-low .h{font:700 40px "Pixelify Sans";letter-spacing:.08em;color:#fff1c9;text-shadow:3px 3px 0 #3d2413,0 0 22px rgba(0,0,0,.55);white-space:nowrap}' +
      '#tbg .tb-low .s{font:500 18px "Pixelify Sans";color:#bfe9ff;text-shadow:2px 2px 0 #0a1a27;margin-top:2px;white-space:nowrap}' +
      '#tbg .tb-sub{position:absolute;left:0;right:0;bottom:14px;text-align:center;font:500 19px "Pixelify Sans";color:#f6e9d3;opacity:0}#tbg .tb-sub b{color:#ffb454;letter-spacing:.12em;font-size:14px;margin-right:10px}' +
      '#tbg .tb-ttl{position:absolute;right:56px;top:96px;text-align:right;opacity:0}#tbg .tb-ttl small{display:block;font:600 14px "Pixelify Sans";letter-spacing:.4em;color:#a898c4}' +
      '#tbg .tb-ttl b{display:block;font:700 44px "Pixelify Sans";letter-spacing:.06em;color:#ffb454;text-shadow:3px 3px 0 #000,5px 5px 0 #7a2a2a}' +
      '#tbg .tb-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;opacity:0;background:radial-gradient(ellipse at 50% 40%,#16506d,#0a1a27 75%)}' +
      '#tbg .tb-end img{width:600px;image-rendering:pixelated}#tbg .tb-end .t{font:700 26px "Pixelify Sans";letter-spacing:.1em;color:#fff1c9;text-shadow:3px 3px 0 #3d2413}' +
      '#tbg .tb-end .f{font:600 16px "Pixelify Sans";letter-spacing:.3em;color:#d9a441}#tbg .tb-end .u{font:500 15px "Pixelify Sans";letter-spacing:.08em;color:#bfe9ff}' +
      '#tbg .tb-end .tb-rug{position:absolute;bottom:0;left:0;right:0;height:10px;background:repeating-linear-gradient(90deg,#a83d2b 0 10px,#d9a441 10px 20px,#2a4c7d 20px 30px,#d9a441 30px 40px)}' +
      /* hikâye sahnesi tam ekran: yalnız sahne tuvali, yazı bizim altyazıda */
      '.tbstory .hkst{padding:0!important;background:#000!important}.tbstory .hkst .app{max-width:none!important;width:100vw;height:100vh;justify-content:center;align-items:center}' +
      '.tbstory .hkst .stage{border:0!important;box-shadow:none!important}.tbstory .hkst canvas{width:auto!important;height:100vh!important}' +
      '.tbstory .hkst .panel,.tbstory .hkst .skip,.tbstory .hkst .hud{display:none!important}' +
      /* paneller sinema şeridine sığsın */
      '.tbpanel .overlay:not(.hidden){transform:scale(.8);transform-origin:50% 50%}';
    document.head.appendChild(st);
    const g = document.createElement('div'); g.id = 'tbg';
    g.innerHTML = '<div class="tb-gr"></div><div class="tb-vg"></div><div class="tb-mid"></div>' +
      '<div class="tb-low"><div class="k"><span></span><i></i></div><div class="h"></div><div class="s"></div></div>' +
      '<div class="tb-ttl"><small>A 12-DAY LEGEND</small><b>THE PROMISE BELOW</b></div>' +
      '<div class="tb-bar tb-bt"></div><div class="tb-bar tb-bb"></div><div class="tb-sub"></div><div class="tb-blk"></div><div class="tb-card"></div>' +
      '<div class="tb-end"><img src="store/logo/logo-horizontal-en.png"><div class="t">Build your cove. Keep the promise.</div>' +
      '<div class="f">FREE · NO ADS · NO IN-APP PURCHASES</div><div class="u">recaikas.github.io/okult-kahin-byblbn</div><div class="tb-rug"></div></div><div class="tb-fl"></div>';
    document.body.appendChild(g); document.body.classList.add('tbc');
    const $ = s => g.querySelector(s);
    const tw = (txt, u) => txt.slice(0, Math.round(txt.length * Math.min(1, u)));
    window.__tb = o => {
      const gr = $('.tb-gr');
      if (o.grade) { gr.style.background = o.grade[0]; gr.style.mixBlendMode = o.grade[1]; gr.style.opacity = o.grade[2]; } else gr.style.opacity = 0;
      g.querySelectorAll('.tb-bar').forEach(x => { x.style.height = o.bars + 'px'; });
      $('.tb-blk').style.opacity = o.black; $('.tb-fl').style.opacity = o.flash;
      const c = $('.tb-card'); c.style.opacity = o.card ? o.cardA : 0;
      if (o.card) c.innerHTML = o.card.map((l, i) => '<div>' + (tw(l, o.cardT * o.card.length - i) || '&nbsp;') + '</div>').join('');
      const m = $('.tb-mid'); m.style.opacity = o.mid ? o.midA : 0; if (o.mid) m.textContent = tw(o.mid, o.midT);
      const l = $('.tb-low'); l.style.opacity = o.low ? o.lowA : 0;
      if (o.low) { $('.tb-low .k span').textContent = o.low[0]; $('.tb-low .h').textContent = tw(o.low[1], o.lowT); $('.tb-low .s').textContent = o.low[2]; $('.tb-low .s').style.opacity = Math.min(1, Math.max(0, o.lowT * 2 - 1)); l.style.transform = 'translateX(' + Math.round((1 - o.lowA) * -24) + 'px)'; }
      $('.tb-ttl').style.opacity = o.ttl || 0;
      const sub = $('.tb-sub'); sub.style.opacity = o.sub ? 1 : 0; if (o.sub) sub.innerHTML = (o.sub[0] ? '<b>' + o.sub[0] + '</b>' : '') + o.sub[1];
      const e = $('.tb-end'); e.style.opacity = o.end || 0;
    };
    window.__storyLine = () => {
      const w = document.querySelector('.hkst .who'), t = document.querySelector('.hkst .txt');
      return t ? [w ? w.textContent.trim() : '', t.textContent.trim()] : null;
    };
  });
  await p.evaluate(async () => { await document.fonts.ready; });

  /* durum kurucular */
  const setup = async (s, prev) => p.evaluate(([s, prev]) => {
    const step = sec => { for (let i = 0; i < Math.round(sec * 30); i++) window.__step(1000 / 30); };
    if (prev && prev.story) { try { HK_STORY.close(); } catch (e) { } document.body.classList.remove('tbstory'); }
    if (prev && (prev.book || prev.office)) { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); document.body.classList.remove('tbpanel'); }
    if (s.st === 'rich' && !window.__rich) {
      window.__rich = 1;
      const S = BT.S; S.tut = 99; BT.M().office = true; S.ctrl = 2; S.cash = 184250; S.rep = 2400;
      for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
      BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
      BT.rebuildCounters();
      for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
      BT.decor.forEach(d => { d.got = true; });
      BT.counters.forEach(c => { c.open = true; c.seen = true; });
      BT.reassignWorkers();
      BT.day.phase = 'play'; BT.day.t = 30;
      BT.player.x = 6; BT.player.y = 8;
      step(30);                                                /* koy dolsun, kuyruklar kurulsun */
      document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    }
    if (BT.day.t > BT.DAY_LEN * 0.6) BT.day.t = 30;            /* gün sonu raporu çekime düşmesin */
    if (s.z) { const z = document.querySelector('#zoomSeg button[data-z="' + s.z + '"]'); if (z) z.click(); document.getElementById('settingsScreen').classList.add('hidden'); }
    document.body.classList.toggle('tbev', !!s.ev);
    if (s.ev) BT.setEvent(s.ev);
    if (s.from) { BT.player.x = s.from[0]; BT.player.y = s.from[1]; }
    if (s.path) { BT.player.x = s.path[0][1]; BT.player.y = s.path[0][2]; }
    if (s.special) {
      BT.S.names = (BT.S.names || []).filter(id => id !== 'temel'); BT.S.jobs = (BT.S.jobs || []).filter(id => id !== 'temel');
      const c = BT.counters[0]; c.slots.fill(null); BT.customers.forEach(q => { if (q.c === c) q.state = 'leave'; });
      BT.day.spec = ['temel', 'caner']; BT.spawnSpecial(0);
      const cu = BT.customers.find(q => q.spec === 'temel'); if (cu) { cu.x = 11.2; cu.y = c.y + 0.9; }
    }
    step(s.pre || 0.6);
    document.querySelectorAll('#toast,#achPop').forEach(x => { x.classList.remove('show'); });
    if (s.book) { document.body.classList.add('tbpanel'); BT.openCustBook(); }
    if (s.office) { document.body.classList.add('tbpanel'); BT.openOffice(); }
    if (s.story) {
      document.body.classList.add('tbstory');
      window.HK_STORY_OFF = 0;
      HK_STORY.open(8, { lang: 'en', ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] });
      step(0.4);
    }
  }, [s, prev || null]);

  const N = DUR * FPS; let cur = -1, storyTap = 0;
  const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const fadeIO = (s, u, len, fin, fout) => Math.max(0, Math.min(1, (s * 0 + u * len) / fin, ((1 - u) * len) / fout));
  for (let f = 0; f < N; f++) {
    const s = f / FPS, si = SHOTS.findIndex(g => s >= g.a && s < g.b), g = SHOTS[si], len = g.b - g.a, u = (s - g.a) / len;
    const want = !PREVIEW || f % 10 === 0;
    const active = !ONLY || ONLY.includes(g.id);
    if (si !== cur) {
      if (!active) { cur = si; continue; }
      if (!g.black || g.end) await setup(g, SHOTS[cur]);
      cur = si; storyTap = 0;
      console.log('shot', g.id, s.toFixed(2));
    }
    if (!active) continue;
    /* sinema katmanı durumu */
    const o = { bars: 66, black: 0, flash: 0, grade: GRADES[g.grade] || null };
    if (g.barsIn) o.bars = Math.round(66 * Math.min(1, ease(u * len / 1.4)));
    if (g.black) o.black = 1;
    if (si > 0 && SHOTS[si - 1].black && !g.black) o.black = Math.max(0, 1 - u * len / 0.8);     /* siyahtan açılış */
    if (g.flashOut) o.flash = Math.max(0, (u * len - (len - 0.35)) / 0.35);
    if (g.a === T0 || g.a === at(24)) o.flash = Math.max(0, 1 - u * len / 0.45);                 /* vuruşta beyaz patlama */
    else if (!g.black && si > 0 && !SHOTS[si - 1].black && !g.story) o.flash = Math.max(o.flash, 0.35 * Math.max(0, 1 - u * len / 0.12));
    if (g.id === 'events') o.black = Math.max(o.black, Math.max(0, (u * len - (len - 0.25)) / 0.25));
    if (g.card) { o.card = g.card; o.cardT = Math.min(1, u * len / (len * 0.55)); o.cardA = fadeIO(s, u, len, 0.25, 0.4); }
    if (g.mid) { o.mid = g.mid; o.midT = Math.min(1, (u * len - 0.5) / 1.4); o.midA = fadeIO(s, u, len, 0.5, 0.4); }
    if (g.low) { o.low = g.low; o.lowT = Math.min(1, (u * len - 0.15) / 0.7); o.lowA = Math.min(1, Math.max(0, (u * len - 0.1) / 0.3), (len - u * len) / 0.2); }
    if (g.story) {
      o.sub = await p.evaluate(() => window.__storyLine());
      o.ttl = Math.min(1, Math.max(0, (u * len - (len - 3.4)) / 0.5));
      o.black = Math.max(o.black, Math.max(0, (u * len - (len - 0.3)) / 0.3));
    }
    if (g.end) { o.end = Math.min(1, u * len / 0.6); o.black = 0; o.bars = 0; o.flash = Math.max(0, 1 - u * len / 0.5); }
    await p.evaluate(([g, u, o, tap]) => {
      window.__tb(o);
      if (g.from) { const k = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; BT.player.x = g.from[0] + (g.to[0] - g.from[0]) * k; BT.player.y = g.from[1] + (g.to[1] - g.from[1]) * k; }
      if (g.path) {
        const P = g.path; let i = 0; while (i < P.length - 2 && u > P[i + 1][0]) i++;
        const v = Math.max(0, Math.min(1, (u - P[i][0]) / (P[i + 1][0] - P[i][0])));
        BT.player.x = P[i][1] + (P[i + 1][1] - P[i][1]) * v; BT.player.y = P[i][2] + (P[i + 1][2] - P[i][2]) * v;
      }
      if (tap && HK_STORY._mode() === 'dlg') HK_STORY._tap();
      if (!g.black || g.end) window.__step(1000 / 30);
    }, [g, u, o, g.story && (++storyTap % 52 === 0)]);
    if (want) await p.screenshot({ path: path.join(OUT, String(PREVIEW ? f / 10 : f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: PREVIEW ? 80 : 93 });
    if (f % 150 === 0) console.log('kare', f, '/', N);
  }
  await b.close();
})();
