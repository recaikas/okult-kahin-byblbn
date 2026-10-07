/* Geliştirme günlüğü (Reels / Shorts) üretici — her gün bir video.
   Oyun gerçekten oynanır: sanal saatle (rAF, performance.now, setTimeout) her kare tek tek adımlanır ve çekilir → 30 fps akıcı.
   Karakteri bir "bot" klavye tuşlarıyla yürütür; gösterilmeyen aralar (ör. filetoların kesilmesini beklemek) kaydedilmeden ileri sarılır.
   Altyazı, seri başlığı ve recaikas logosu sayfanın üstüne HTML olarak çizilir; montaj (müzik + MP4) make.py'de.
   Kullanım (oyun klasörü 8099'da sunulmalı):  node social/tools/devlog.js social/days/gun-01.js */
const path = require('path'), fs = require('fs');
const { chromium } = require('../../test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
const FPS = 30;
const PREVIEW = +process.env.PREVIEW || 1;   /* deneme: PREVIEW=15 → her 15 karede bir çek (hızlı önizleme) */
const day = require(path.resolve(process.argv[2]));
const OUT = path.resolve(__dirname, '..', 'out', day.id);
const FR = path.join(OUT, 'frames');

/* sayfada: sanal saat + bot + kaplama */
const PAGE_INIT = () => {
  let t = 0, q = [], timers = [], tid = 1;
  window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => t;
  const rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  window.setTimeout = (fn, ms) => { if (typeof fn !== 'function') return rST(fn, ms); const id = tid++; timers.push({ id, at: t + (ms || 0), fn }); return id; };
  window.clearTimeout = id => { timers = timers.filter(x => x.id !== id); rCT(id); };
  /* bot: hedef noktalara klavyeyle yürür, koşul gelene kadar bekler */
  const held = {};
  const key = (k, on) => { if (!!held[k] === on) return; held[k] = on; window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { key: k })); };
  window.__plan = [];
  const bot = () => {
    const s = window.__plan[0]; let want = [];
    if (s && s.to) {
      const dx = s.to[0] - BT.player.x, dy = s.to[1] - BT.player.y;
      if (Math.hypot(dx, dy) < (s.tol || 0.45) || (s.max && (s.el = (s.el || 0) + 1 / 30) > s.max)) window.__plan.shift();
      else {
        const u = dx + dy, v = dx - dy;
        if (Math.abs(u) > 0.25) want.push(u > 0 ? 's' : 'w');
        if (Math.abs(v) > 0.25) want.push(v > 0 ? 'd' : 'a');
      }
    } else if (s && s.cycle) {   /* tam satış turu (1. bölge), sonra kendini yeniden kuyruğa ekler */
      window.__plan.shift(); window.__plan = window.__cycle().concat(s.times > 1 ? [{ cycle: true, times: s.times - 1 }] : s.times ? [] : [s], window.__plan);
    } else if (s && s.do) {
      window.__plan.shift(); new Function(s.do)();
    } else if (s && s.until) {
      s.el = (s.el || 0) + 1 / 30;
      if (s.el > (s.max || 99) || (s.until !== true && new Function('return ' + s.until)())) window.__plan.shift();
    }
    ['w', 'a', 's', 'd'].forEach(k => key(k, want.indexOf(k) >= 0));
  };
  window.__step = ms => {
    t += ms;
    if (window.BT && BT.player) bot();
    const due = timers.filter(x => x.at <= t); timers = timers.filter(x => x.at > t); due.forEach(x => { try { x.fn(); } catch (e) { console.error(e); } });
    const cbs = q; q = []; cbs.forEach(cb => { try { cb(t); } catch (e) { console.error(e); } });
  };
  window.__cycle = () => {
    const N = BT.spots[0], T = BT.tables[0], C = BT.counters[0];
    return [{ to: [N.x, N.y + 0.9] }, { until: 'BT.player.carry.length >= +document.getElementById("carry").textContent.split("/")[1] || BT.spots[0].stock.length === 0', max: 6 },
      { to: [T.x - 0.2, T.y + 0.3] }, { until: 'BT.player.carry.length === 0', max: 4 }, { until: 'BT.tables[0].mat.items.length >= 3', max: 15 },
      { to: [T.mat.x, T.mat.y] }, { until: 'BT.tables[0].mat.items.length === 0 || BT.player.carry.length >= +document.getElementById("carry").textContent.split("/")[1]', max: 5 },
      { to: [C.x - 0.9, C.y + 0.3], tol: 0.6 }, { until: 'BT.player.carry.length === 0', max: 5 }, { until: true, max: 3 },
      { to: [C.tray.x, C.tray.y], tol: 0.5 }, { until: true, max: 0.7 }, { to: [BT.safe.x, BT.safe.y], tol: 0.6 }, { until: true, max: 0.7 }];
  };
  /* ekrandaki bir öğeyi altın çerçeveyle göster (HUD kutusu, düğme, kart) */
  window.__hl = (sel, pad) => {
    let h = document.getElementById('dlHl'); if (h) h.remove();
    const e = sel && document.querySelector(sel); if (!e) return;
    const r = e.getBoundingClientRect(), p = pad || 4;
    h = document.createElement('div'); h.id = 'dlHl';
    h.style.cssText = 'position:fixed;z-index:95;pointer-events:none;border:3px solid #ffd166;box-shadow:0 0 0 3px rgba(18,32,43,.8),0 0 16px #ffd166;left:' + (r.left - p) + 'px;top:' + (r.top - p) + 'px;width:' + (r.width + p * 2 - 6) + 'px;height:' + (r.height + p * 2 - 6) + 'px';
    document.body.appendChild(h);
  };
  /* dünyadaki bir noktayı (ızgara koordinatı) halkayla göster; kamera oyuncuyu izlediği için her kare yeniden konumlanır */
  window.__hlw = (pt, r) => {
    let h = document.getElementById('dlHlw');
    if (!pt) { if (h) h.remove(); return; }
    if (!h) { h = document.createElement('div'); h.id = 'dlHlw'; document.body.appendChild(h); }
    const cv = document.querySelector('canvas'), rc = cv.getBoundingClientRect(), k = rc.width / cv.width;
    const c0 = BT.canvasPt(pt[0], pt[1]), c = [rc.left + c0[0] * k, rc.top + c0[1] * k], R = r || 34;
    h.style.cssText = 'position:fixed;z-index:95;pointer-events:none;border:3px solid #ffd166;border-radius:50%;box-shadow:0 0 0 3px rgba(18,32,43,.7),0 0 14px #ffd166;left:' + (c[0] - R) + 'px;top:' + (c[1] - R * 0.6 - 26) + 'px;width:' + (R * 2) + 'px;height:' + (R * 1.2) + 'px';
  };
  /* kaydedilmeden ileri sar: n saniye ya da koşul */
  window.__ff = (secs, until) => { for (let i = 0; i < secs * 30; i++) { window.__step(1000 / 30); if (until && new Function('return ' + until)()) return i / 30; } return secs; };
  window.__pumpOn = () => { window.__pump = setInterval(() => window.__step(1000 / 30), 33); };
  window.__pumpOff = () => clearInterval(window.__pump);
  window.__pumpOn();
};

const OVERLAY_CSS = `
  #dlTop{position:fixed;left:0;right:0;top:118px;z-index:96;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
  #dlLogo{display:flex;align-items:center;gap:7px;padding:4px 10px 4px 6px;background:rgba(10,26,39,.78);border:2px solid #d9a441;font:700 15px "Pixelify Sans";color:#fff1c9;letter-spacing:1px}
  #dlLogo img{width:22px;height:22px;image-rendering:pixelated}
  #dlSer{padding:3px 10px;background:#d9a441;color:#2a1a0c;font:700 13px "Pixelify Sans";letter-spacing:1.5px}
  #dlCap{position:fixed;left:50%;top:60%;transform:translate(-50%,-50%);z-index:96;width:90%;text-align:center;font:700 33px/1.22 "Pixelify Sans";color:#fff;
    text-shadow:-2px 0 #12202b,2px 0 #12202b,0 -2px #12202b,0 2px #12202b,2px 2px #12202b,-2px 2px #12202b,2px -2px #12202b,-2px -2px #12202b,3px 4px 0 rgba(0,0,0,.55);opacity:0;pointer-events:none}
  #dlCap em{font-style:normal;color:#ffd166}
  #dlTag{position:fixed;left:50%;top:calc(60% + 84px);transform:translateX(-50%);z-index:96;padding:3px 9px;background:rgba(10,26,39,.85);border:2px solid #6fb3d9;color:#bfe9ff;font:700 13px "Pixelify Sans";white-space:nowrap;opacity:0;pointer-events:none}
  #dlEnd{position:fixed;inset:0;z-index:97;display:none;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(8,20,30,.72);padding:0 26px;text-align:center}
  #dlEnd .sign{margin:0;min-width:300px;font-size:26px}
  #dlEnd b{font:700 30px/1.25 "Pixelify Sans";color:#fff;text-shadow:3px 3px 0 #12202b}
  #dlEnd em{font-style:normal;color:#ffd166}
  #dlEnd small{font:700 16px "Pixelify Sans";color:#ffd166;letter-spacing:1px}
  #dlBar{position:fixed;left:0;bottom:0;height:7px;width:0;z-index:99;background:linear-gradient(90deg,#ffd166,#ff8a4c);box-shadow:0 0 8px #ffd166}
  #dlSting{position:fixed;left:50%;top:40%;z-index:99;transform:translate(-50%,-50%);padding:8px 26px;background:#d9a441;color:#2a1a0c;font:700 64px "Pixelify Sans";letter-spacing:5px;border:4px solid #2a1a0c;box-shadow:6px 6px 0 rgba(0,0,0,.45);opacity:0;white-space:nowrap}
  #coach,.coach{display:none!important}
  #achPop,#pauseBadge{display:none!important}`;

(async () => {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(PAGE_INIT);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(URL); await sleep(900);
  await p.evaluate(l => { if (BT.setLang) BT.setLang(l); }, day.lang || 'tr');
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  if (day.hero) await p.fill('#heroName', day.hero).catch(() => {});
  await p.click('#heroGo');
  await p.fill('#nameIn', day.company || 'Recai Balıkçılık'); await p.click('#nameGo');
  await p.click('#autoOpts button[data-m="10"]'); await sleep(400);
  await p.evaluate(([css, d]) => {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const top = document.createElement('div'); top.id = 'dlTop';
    top.innerHTML = '<div id="dlLogo"><img src="icon.png" alt="">recaikas</div><div id="dlSer"></div>';
    document.body.appendChild(top); document.getElementById('dlSer').textContent = d.series;
    ['dlCap', 'dlTag', 'dlBar', 'dlSting'].forEach(id => { const e = document.createElement('div'); e.id = id; document.body.appendChild(e); });
    const end = document.createElement('div'); end.id = 'dlEnd'; end.innerHTML = '<div class="sign" id="dlSign"></div><b id="dlQ"></b><small id="dlSm"></small>';
    document.body.appendChild(end);
    window.__cap = (html, a) => { const c = document.getElementById('dlCap'); if (c.__h !== html) { c.innerHTML = html; c.__h = html; } c.style.opacity = a; };
    window.__tag = (txt, a) => { const c = document.getElementById('dlTag'); c.textContent = txt; c.style.opacity = a; };
    window.__zoom = z => { const btn = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (btn) btn.click(); document.getElementById('settingsScreen').classList.add('hidden'); };
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  }, [OVERLAY_CSS, { series: day.series }]);
  await p.evaluate(async () => { await document.fonts.ready; BT.S.ctrl = 2; });   /* kontrol eğitimi (hayalet joystick) görüntüye girmesin */
  await p.evaluate(() => window.__pumpOff());

  const segs = day.segs; let t0 = 0; const subs = []; const evs = []; let lastCap = '', lastCash = null, lastCoin = -9;
  segs.forEach(s => { s.at = t0; t0 += s.len; (s.caps || []).forEach(c => subs.push({ a: s.at + c[0], b: s.at + c[1], t: c[2] })); });
  const N = Math.round(t0 * FPS);
  let cur = -1;
  for (let f = 0; f < N; f++) {
    const sec = f / FPS, si = segs.findIndex(g => sec >= g.at && sec < g.at + g.len), g = segs[si];
    if (si !== cur) {
      if (cur >= 0) evs.push({ t: sec, k: g.end ? 'end' : 'cut' });
      cur = si; g.done = {};
      await p.evaluate(() => window.__hlw(null));
      if (g.end) await p.evaluate(e => {
        window.__plan = [{ until: true, max: 999 }]; window.__hl(null);
        document.getElementById('dlSign').style.display = e.sign ? '' : 'none';
        document.getElementById('dlQ').innerHTML = e.q; document.getElementById('dlSm').textContent = e.sm || '';
        const d = document.getElementById('dlEnd'); d.style.display = 'flex'; d.style.opacity = 0;
      }, g.end);
      if (g.prep) await p.evaluate(g.prep);
      if (g.plan) await p.evaluate(pl => { window.__plan = JSON.parse(JSON.stringify(pl)); }, g.plan);
      console.log(day.id, 'sahne', si + 1, '/', segs.length, '@', sec.toFixed(1) + 's');
    }
    const ls = sec - g.at;
    const capNow = (g.caps || []).find(c => !c[3] && ls >= c[0] && ls < c[1]);
    const capKey = capNow ? si + ':' + capNow[0] : '';
    let capAge = 99;
    if (capKey && capKey !== lastCap) { evs.push({ t: sec, k: 'pop' }); lastCap = capKey; }
    if (capNow) capAge = ls - capNow[0];
    const cash = await p.evaluate(() => BT.S.cash);
    if (lastCash !== null && cash > lastCash + 0.5 && sec - lastCoin > 0.3 && !g.end) { evs.push({ t: sec, k: 'coin' }); lastCoin = sec; }
    lastCash = cash;
    await p.evaluate(([ct, tt]) => { document.getElementById('dlCap').style.top = ct; document.getElementById('dlTag').style.top = tt; }, [g.capTop || '60%', g.tagTop || (g.capTop ? 'calc(' + g.capTop + ' + 84px)' : 'calc(60% + 84px)')]);
    await p.evaluate(([capAge, segAge, sec, total, sting]) => {
      /* altyazı zıplayarak gelir, oyun ekranı her yeni cümlede hafif "punch" yakınlaşır */
      const c = document.getElementById('dlCap'), cv = document.querySelector('canvas');
      const k = capAge < 0.28 ? capAge / 0.28 : 1, sc = capAge < 0.28 ? 0.55 + 0.6 * Math.sin(k * Math.PI * 0.62) : 1;
      c.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(3) + ')';
      const z = Math.min(capAge, segAge), pz = z < 0.4 ? 1 + 0.07 * (1 - z / 0.4) : 1;
      if (cv) { cv.style.transformOrigin = '50% 45%'; cv.style.transform = 'scale(' + pz.toFixed(3) + ')'; }
      document.getElementById('dlBar').style.width = (100 * sec / total).toFixed(2) + '%';
      const st = document.getElementById('dlSting');
      if (sting && sec < 1.3) {
        st.textContent = sting; const a = sec < 0.15 ? sec / 0.15 : sec > 1.0 ? (1.3 - sec) / 0.3 : 1;
        const sh = sec < 0.5 ? Math.sin(sec * 90) * 6 * (1 - sec / 0.5) : 0;
        st.style.opacity = a; st.style.transform = 'translate(calc(-50% + ' + sh.toFixed(1) + 'px),-50%) scale(' + (sec < 0.15 ? 1.8 - 0.8 * sec / 0.15 : 1).toFixed(3) + ') rotate(-3deg)';
      } else st.style.opacity = 0;
    }, [capAge, ls, sec, t0, day.sting || '']);
    const cap = (g.caps || []).find(c => !c[3] && ls >= c[0] && ls < c[1]);   /* 4. öğe true: yalnız SRT'ye (ekranda bitiş kartı gösteriyor) */
    const capA = cap ? Math.max(0, Math.min(1, (ls - cap[0]) / 0.18, (cap[1] - ls) / 0.18)) : 0;
    const tagA = g.tag ? Math.max(0, Math.min(1, ls / 0.25, (g.len - ls) / 0.25)) : 0;
    for (const [at, js] of (g.acts || [])) if (ls >= at && !g.done[at]) { g.done[at] = 1; await p.evaluate(new Function(js)); }
    if (g.end) await p.evaluate(([e, ls, len]) => {
      document.getElementById('dlEnd').style.opacity = Math.min(1, ls / 0.4);
      if (e.sign) { const n = Math.min(e.sign.length, Math.floor(ls / (e.typeSec || 0.12))); document.getElementById('dlSign').textContent = e.sign.slice(0, n) + (Math.floor(ls * 2.5) % 2 ? '_' : '\u00a0'); }
    }, [g.end, ls, g.len]);
    await p.evaluate(([cap, capA, tag, tagA, frame, u, hlw]) => {
      window.__cap(cap || '', capA); window.__tag(tag || '', tagA);
      if (frame) new Function('u', frame)(u);
      if (hlw) window.__hlw(new Function('return ' + hlw)());
      window.__step(1000 / 30);
    }, [cap ? cap[2] : '', capA, g.tag || '', tagA, g.frame || '', ls / g.len, g.hlw || '']);
    if (f % PREVIEW === 0) await p.screenshot({ path: path.join(FR, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log(day.id, 'kare', f, '/', N);
  }
  /* kapak: ayrı kare */
  if (day.cover) {
    if (typeof day.cover === 'function') await p.evaluate(day.cover);
    else await p.evaluate(c => {   /* standart kapak: GÜN N + iki satır başlık + alt satır */
      document.getElementById('dlEnd').style.display = 'none'; window.__hl(null);
      document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      if (c.pos) { window.__plan = []; BT.player.x = c.pos[0]; BT.player.y = c.pos[1]; }
      for (let i = 0; i < 20; i++) window.__step(1000 / 30);
      window.__cap('', 0); window.__tag('', 0);
      const k = document.createElement('div');
      k.style.cssText = 'position:fixed;left:0;right:0;top:52%;z-index:98;padding:22px 18px 26px;text-align:center;background:linear-gradient(180deg,rgba(8,20,30,0),rgba(8,20,30,.88) 18%,rgba(8,20,30,.88) 82%,rgba(8,20,30,0))';
      k.innerHTML = '<div style="display:inline-block;padding:4px 16px;background:#d9a441;color:#2a1a0c;font:700 34px \'Pixelify Sans\';letter-spacing:3px">' + c.day + '</div>' +
        '<div style="margin-top:14px;font:700 42px/1.15 \'Pixelify Sans\';color:#fff;text-shadow:3px 3px 0 #12202b">' + c.title + '</div>' +
        '<div style="margin-top:12px;font:700 18px \'Pixelify Sans\';color:#bfe9ff;letter-spacing:1px">' + (c.sub || '') + '</div>';
      document.body.appendChild(k);
    }, day.cover);
    await p.screenshot({ path: path.join(OUT, 'kapak.png') });
  }
  await b.close();
  /* altyazı (SRT) + zaman çizelgesi */
  const tc = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return [h, m, x].map(v => String(v).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0'); };
  const plain = h => h.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
  fs.writeFileSync(path.join(OUT, day.id + '.srt'), subs.map((s, i) => (i + 1) + '\n' + tc(s.a) + ' --> ' + tc(s.b) + '\n' + plain(s.t) + '\n').join('\n'));
  if (day.sting) evs.unshift({ t: 0.02, k: 'sting' });
  fs.writeFileSync(path.join(OUT, 'sure.json'), JSON.stringify({ secs: t0, frames: N, fps: FPS, evs }));
  console.log('bitti', N, 'kare', t0 + 's');
})();
