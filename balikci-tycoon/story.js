/* =====================================================================
   HAMSİ KOYU — DİPTEKİ SÖZ (hikâye sahneleri)
   ---------------------------------------------------------------------
   Üç katman (hangisinin nereden geldiği açık):
   1) Halk anlatısı: Şahmeran — yarı kadın yarı yılan, yılanların şahı; Cemşab'a sığınır, yerini söylemeyeceğine
      söz alır; hasta bir vezir onu ele geçirmek ister. Oyuncu Cemşab'ın yerindedir.
   2) İskit katmanı: Herodotos, Tarihler 4.9 — Karadeniz'in kuzeyindeki İskitlerin atası yarı kadın yarı yılan bir ana;
      yayı gerip kemeri kuşanabilen en küçük oğul Skythes ülkeyi yönetir.
   3) Bizim kurgumuz: Şahmeran'ın bu yılan ana olması ve Alp Er Tunga'nın (Kaşgarlı Mahmud'un kaydettiği bozkır
      hükümdarı; Şehname'de Efrasiyab) onun himayesinde yay geren oğul olarak nöbet tutması bizim yorumumuzdur.
   Ağıt sözleri özgündür (Alp Er Tunga Sagusu'ndan alıntı yoktur).

   Bu dosya hem oyunda (game.js) hem de story.html test sayfasında aynen çalışır.
   Sahne = satır listesi: { w: konuşan, t: { tr, en }, cam: [x, y, yakınlık], ex, p, fx, bg, show, hide }
   ===================================================================== */
(function () {
  'use strict';
  var W = 192, H = 120, BY = 116;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOST = null, LANG = 'tr', ROOT = null, running = false;
  function tx(o) { return !o ? '' : typeof o === 'string' ? o : (o[LANG] || o.tr || ''); }
  function L(w, tr, en, o) { var s = o || {}; s.w = w; s.t = { tr: tr, en: en }; return s; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------- DOM + stil ---------------- */
  var CSS = '' +
    '.hkst{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:#07040ee6;font-family:"Pixelify Sans",ui-monospace,monospace;color:#f6e9d3;padding:10px}' +
    '.hkst *{box-sizing:border-box}.hkst .app{width:100%;max-width:540px;display:flex;flex-direction:column;gap:10px}' +
    '.hkst .stage{position:relative;border:3px solid #4b3272;box-shadow:0 0 0 3px #000;background:#000;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation;cursor:pointer}' +
    '.hkst canvas{display:block;width:100%;height:auto;aspect-ratio:8/5;image-rendering:pixelated}' +
    '.hkst .stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 60%,#000a 100%)}' +
    '.hkst .hud{position:absolute;left:6px;top:6px;z-index:3;background:#000b;border:2px solid #e4b94a;padding:2px 6px;display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.12em;color:#e4b94a;font-weight:700}' +
    '.hkst .segs{display:flex;gap:2px}.hkst .segs i{width:5px;height:9px;background:#3a2f14;display:block}.hkst .segs i.on{background:#e4b94a}.hkst .segs i.new{animation:hkfl .5s steps(2) 4}' +
    '@keyframes hkfl{50%{background:#fff}}' +
    '.hkst .skip{position:absolute;right:6px;top:6px;z-index:3;background:#000a;border:2px solid #fff4;color:#fffc;font:inherit;font-size:10px;letter-spacing:.1em;padding:2px 7px;cursor:pointer}' +
    '.hkst .ov{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:12px;background:linear-gradient(#0c0718d8,#0c0718f2);transition:opacity .7s}' +
    '.hkst .ov.off{opacity:0;pointer-events:none}.hkst .ov small{font-size:10px;letter-spacing:.3em;color:#a898c4}' +
    '.hkst .ov h2{margin:0;font-size:clamp(24px,8vw,42px);line-height:1;letter-spacing:.05em;color:#ffb454;text-shadow:3px 3px 0 #000,5px 5px 0 #7a2a2a}' +
    '.hkst .panel{background:#1d1330;border:3px solid #4b3272;box-shadow:0 0 0 3px #000;padding:10px 12px 12px;min-height:170px;position:relative}' +
    '.hkst .who{display:inline-block;font-weight:700;letter-spacing:.1em;font-size:11px;padding:2px 8px;margin-bottom:6px}' +
    '.hkst .txt{font-size:17px;line-height:1.42;min-height:4.2em;padding-right:16px}.hkst .nx{position:absolute;right:10px;bottom:6px;color:#ffb454;animation:hkbl 1s steps(2) infinite}' +
    '@keyframes hkbl{50%{opacity:0}}' +
    '.hkst .mh{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 10px;margin-bottom:8px;align-items:baseline}.hkst .mh b{font-size:15px;letter-spacing:.12em;color:#ffb454}.hkst .mh span{font-size:12px;color:#a898c4;line-height:1.35}' +
    '.hkst .btns{display:flex;flex-wrap:wrap;gap:8px}.hkst .btns button,.hkst .opt{flex:1 1 140px;background:#2a1b44;border:3px solid #4b3272;color:#f6e9d3;padding:9px 10px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-align:left}' +
    '.hkst .btns button:hover,.hkst .opt:hover{border-color:#ffb454}.hkst .btns button.pri{background:#ffb454;color:#2a1205;border-color:#ffb454;text-align:center}' +
    '.hkst .opt{display:block;width:100%;margin-bottom:6px}.hkst .opt:disabled{opacity:.35;cursor:default}' +
    '.hkst .meter{height:14px;background:#0d0818;border:2px solid #4b3272;position:relative;margin:6px 0}.hkst .meter i{position:absolute;top:0;bottom:0;display:block}' +
    '.hkst .big{font-size:22px;padding:14px;text-align:center;width:100%;background:#ffb454;color:#2a1205;border:0;box-shadow:0 4px 0 #a9691b;font:inherit;font-weight:700;letter-spacing:.08em;cursor:pointer;margin-top:6px}' +
    '.hkst .big:active{transform:translateY(3px);box-shadow:0 1px 0 #a9691b}' +
    '.hkst .slots{display:flex;gap:6px;margin-bottom:8px}.hkst .slots i{flex:1;height:34px;border:3px dashed #4b3272;display:grid;place-items:center;font-style:normal;font-size:13px;font-weight:700;color:#a898c4}.hkst .slots i.f{border-style:solid;border-color:#ffb454;color:#f6e9d3;background:#2a1b44}' +
    '.hkst .items{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:6px;margin-bottom:8px}.hkst .it{display:flex;align-items:center;gap:8px;background:#2a1b44;border:3px solid #4b3272;padding:7px 9px;font:inherit;font-size:13px;font-weight:700;color:#f6e9d3;cursor:pointer}' +
    '.hkst .it i{width:12px;height:12px;flex:none;box-shadow:0 0 0 2px #000}.hkst .it:disabled{opacity:.35}' +
    '.hkst .mres{min-height:1.4em;margin-top:6px;font-size:15px;text-align:center}' +
    '.hkst .rt{font-size:11px;letter-spacing:.2em;color:#a898c4;margin-bottom:4px}.hkst .rh{font-size:clamp(20px,6vw,28px);font-weight:700;margin:0 0 8px}' +
    '.hkst .stats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.hkst .stat{background:#2a1b44;border:3px solid #4b3272;padding:5px 9px;display:flex;flex-direction:column;flex:1 1 90px}.hkst .stat small{font-size:10px;letter-spacing:.14em;color:#a898c4}.hkst .stat b{font-size:20px}' +
    '.hkst .up{color:#6fe39a}.hkst .dn{color:#ff5a6a}.hkst .buff{display:flex;gap:10px;align-items:center;background:#2c2010;border:3px solid #ffb454;padding:7px 9px;margin-bottom:8px}.hkst .buff i{font-style:normal;font-size:22px;color:#ffb454}.hkst .buff b{display:block;font-size:15px}.hkst .buff small{font-size:12px;color:#e7cfa5}' +
    '.hkst .note{font-size:13px;color:#a898c4;margin:0 0 10px;line-height:1.4}.hkst .scrub{width:100%;aspect-ratio:12/5;image-rendering:pixelated;touch-action:none;border:3px solid #4b3272;cursor:crosshair}' +
    '@media (prefers-reduced-motion:reduce){.hkst .nx,.hkst .segs i.new{animation:none}}';
  var UI = {
    skip: { tr: 'ATLA ▶▶', en: 'SKIP ▶▶' }, ber: { tr: 'BEREKET', en: 'BOUNTY' }, day: { tr: 'GÜN', en: 'DAY' },
    story: { tr: 'DİPTEKİ SÖZ', en: 'THE PROMISE BELOW' }, res: { tr: 'GÜNÜN SONUCU', en: 'RESULT OF THE DAY' },
    rep: { tr: 'İTİBAR', en: 'REPUTATION' }, cont: { tr: 'DEVAM ▶', en: 'CONTINUE ▶' }, tries: { tr: 'Deneme', en: 'Try' },
    tap: { tr: 'DUR!', en: 'STOP!' }, left: { tr: '◀ SOLA', en: '◀ LEFT' }, right: { tr: 'SAĞA ▶', en: 'RIGHT ▶' },
    hold: { tr: '✋ BASILI TUT: RÜZGÂRA KALKAN', en: '✋ HOLD: SHIELD FROM WIND' }, hit: { tr: '♪ VUR', en: '♪ STRIKE' },
    item: { tr: 'Koleksiyon', en: 'Collection' }, piece: { tr: 'Söz parçası', en: 'Promise piece' },
    skipped: { tr: 'Atlandı', en: 'Skipped' }, time: { tr: 'SÜRE', en: 'TIME' }
  };

  /* ---------------- ses (host'un efekt kanalına) ---------------- */
  var AC = null, DST = null;
  function tone(f, d, type, g, slide) {
    if (!AC || !DST) return;
    try {
      var t = AC.currentTime, o = AC.createOscillator(), v = AC.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
      v.gain.setValueAtTime(g || 0.05, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(DST); o.start(t); o.stop(t + d + 0.03);
    } catch (e) { }
  }
  function nz(d, g, f0, f1) {
    if (!AC || !DST) return;
    try {
      var t = AC.currentTime, n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0);
      for (var i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
      var s = AC.createBufferSource(); s.buffer = b;
      var f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + d);
      var v = AC.createGain(); v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f); f.connect(v); v.connect(DST); s.start(t);
    } catch (e) { }
  }
  var SFX = {
    ding: function () { tone(880, 0.16, 'triangle', 0.09); setTimeout(function () { tone(1320, 0.22, 'triangle', 0.09); }, 110); setTimeout(function () { tone(1760, 0.3, 'triangle', 0.07); }, 230); },
    buzz: function () { tone(120, 0.3, 'sawtooth', 0.06, -40); }, tick: function () { tone(700, 0.05, 'square', 0.05); },
    chew: function () { nz(0.07, 0.12, 900, 400); }, low: function () { tone(70, 0.35, 'sine', 0.22, -20); },
    splash: function () { nz(0.3, 0.18, 2400, 300); }, wind: function () { nz(0.8, 0.08, 500, 1500); },
    bow: function () { tone(160, 0.25, 'sawtooth', 0.05, 260); setTimeout(function () { nz(0.12, 0.1, 3000, 800); }, 200); },
    kopuz: function () { [294, 349, 392, 440, 392, 349, 294].forEach(function (f, i) { setTimeout(function () { tone(f, 0.6, 'triangle', 0.08, -8); tone(f * 2, 0.3, 'square', 0.012); }, i * 330); }); },
    deep: function () { tone(55, 1.2, 'sine', 0.2, -10); tone(110, 1.0, 'triangle', 0.05, -20); },
    bell: function () { tone(620, 1.8, 'sine', 0.07); tone(620 * 2.76, 0.9, 'sine', 0.02); }
  };
  function sfx(n) { try { if (SFX[n]) SFX[n](); } catch (e) { } }
  var VOICE = { y: [190, 230], a: [92, 108], h: [260, 300], k: [120, 140], t: [100, 115], s: [330, 350], v: [140, 160], n: [165, 165], d: [900, 1100] };
  function blip(w) { var v = VOICE[w] || VOICE.n, f = v[Math.random() * v.length | 0] * (1 + Math.random() * 0.06); tone(f, 0.05, w === 'n' ? 'triangle' : 'square', w === 'n' ? 0.035 : 0.025); }

  /* ---------------- tuval ---------------- */
  var out, o, wc, ctx, OW = 960, OH = 600;
  function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function fit() {
    if (!out) return;
    var cssW = out.clientWidth || 360, dpr = window.devicePixelRatio || 1, k = Math.max(2, Math.min(8, Math.round(cssW * dpr / W)));
    if (out.width !== W * k) { out.width = W * k; out.height = H * k; OW = W * k; OH = H * k; }
    o.imageSmoothingEnabled = false;
  }

  /* ---------------- sahne durumu ---------------- */
  var S = null, C = null;
  function freshState() {
    S = { t: 0, wt: 0, cam: { x: 96, y: 60, z: 1 }, tgt: { x: 96, y: 60, z: 1 }, bars: 0, barsT: 0, shake: 0, flash: 0, parts: [], talk: null, bg: 'dock', steam: false, potT: 0, chewT: 0, light: 0, glint: null, tide: 0 };
    C = {
      y: { id: 'y', x: 70, dir: 1, ph: 0, ex: 'n', pose: 'idle', vis: false, pal: { skin: '#e0a673', skinD: '#c48558', hair: '#2b2b3a', coat: '#e8b73a', coatD: '#c4941f', coatL: '#f7d36a', pants: '#2a3c5a', cap: '#2a4f8f', capD: '#1f3a6c' }, hat: 'cap' },
      a: { id: 'a', x: 130, dir: -1, ph: 1.9, ex: 't', pose: 'knees', vis: false, sit: true, tall: 4, hat: 'kalpak', pal: { skin: '#c9935f', skinD: '#a8744a', hair: '#2a1c14', coat: '#7a5a3a', coatD: '#5a4029', coatL: '#946c46', pants: '#3a3326', red: '#b23a2e', redD: '#8a2a20', gold: '#e4b94a' } },
      h: { id: 'h', x: 40, dir: 1, ph: 0.7, ex: 'n', pose: 'idle', vis: false, hat: 'scarf', skirt: true, pal: { skin: '#e3ad7c', skinD: '#c48f60', hair: '#8a8a8a', coat: '#7a3a6a', coatD: '#5a2a4e', coatL: '#955084', pants: '#4a2a3e', cap: '#c8553d', capD: '#a4402c' } },
      k: { id: 'k', x: 150, dir: -1, ph: 2.4, ex: 'n', pose: 'idle', vis: false, hat: 'flat', must: true, pal: { skin: '#d49a68', skinD: '#b07b4e', hair: '#bdbdbd', coat: '#3f5a4a', coatD: '#2e4437', coatL: '#557563', pants: '#2c2c34', cap: '#4a4038', capD: '#322a24' } },
      t: { id: 't', x: 110, dir: -1, ph: 1.1, ex: 'n', pose: 'idle', vis: false, hat: 'flat', beard: '#eeeeee', pal: { skin: '#cf9a6c', skinD: '#ad7a50', hair: '#eeeeee', coat: '#5a4a3a', coatD: '#403428', coatL: '#71604c', pants: '#2c2c34', cap: '#2a3240', capD: '#1c222c' } },
      v: { id: 'v', x: 150, dir: -1, ph: 0.3, ex: 'n', pose: 'idle', vis: false, hat: 'fur', tall: 3, pale: true, pal: { skin: '#e8cdb2', skinD: '#c9ab8e', hair: '#3a3030', coat: '#2a3050', coatD: '#1c2038', coatL: '#3c4468', pants: '#1c1c28', cap: '#5a4636', capD: '#3e2f22' } },
      s: { id: 's', x: 120, vis: false, ph: 0 },
      d: { id: 'd', x: 120, y: 80, vis: false, ph: 0 }
    };
  }

  /* ---------------- dekorlar (bg) ---------------- */
  var SKIES = {
    dawn: ['#3b2a5a', '#5a3a72', '#8a4a78', '#c46a78', '#eb9a7e', '#f7c08a', '#fbdca6', '#fdeec8'],
    day: ['#3f7fc0', '#4b8ccc', '#5a9ad4', '#6aa8dc', '#7cb6e2', '#90c4e8', '#a6d2ee', '#bddff2'],
    sunset: ['#2b1b4d', '#4a2468', '#7a2f6e', '#b84a62', '#e0736a', '#f29a6b', '#f7c27a', '#fbe0a0'],
    night: ['#07071a', '#0b0b24', '#10102e', '#15153a', '#1b1b46', '#222252', '#2a2a5e', '#33336a'],
    morning: ['#5a8ac8', '#6a98d0', '#7ca8d8', '#90b8e0', '#a6c8e6', '#bcd8ec', '#d2e6f2', '#e8f2f8']
  };
  function sun(cx, cy, r, col) { for (var dy = -r; dy <= 0; dy++) { var hw = Math.round(Math.sqrt(r * r - dy * dy)); R(cx - hw, cy + dy, hw * 2, 1, col || '#ffc66a'); } }
  function gull(x, y, ph) { var f = Math.sin(S.wt * 5 + ph) > 0, c = '#3a2446'; if (f) { R(x - 4, y + 1, 2, 1, c); R(x - 2, y, 2, 1, c); R(x, y, 2, 1, c); R(x + 2, y + 1, 2, 1, c); } else { R(x - 4, y, 2, 1, c); R(x - 2, y + 1, 2, 1, c); R(x, y + 1, 2, 1, c); R(x + 2, y, 2, 1, c); } }
  function sea(y0, c1, c2, c3, glow) {
    R(0, y0, W, 42, c1);
    for (var y = y0 + 1; y < y0 + 22; y += 2) R(0, y, W, 1, (((y >> 1) + Math.floor(S.wt * 1.5)) % 2) ? c2 : c3);
    R(0, y0, W, 1, glow || '#5a6fa8');
  }
  function dock() {
    R(0, 102, W, 18, '#6b4630'); R(0, 102, W, 1, '#8a5d3e'); R(0, 108, W, 1, '#4a2e1e'); R(0, 114, W, 1, '#4a2e1e');
    [10, 48, 93, 131, 170].forEach(function (sx) { R(sx, 103, 1, 5, '#4a2e1e'); R(sx + 18, 109, 1, 5, '#4a2e1e'); });
    R(0, 117, W, 3, '#3a2316');
  }
  function stall(x, col) {
    R(x + 3, 24, 4, 60, '#4a2f1d'); R(x + 81, 24, 4, 60, '#4a2f1d');
    for (var i = 0; i < 88; i += 12) { var c = (i / 12) % 2 === 0 ? (col || '#d94a4a') : '#f3e6d0'; R(x + i, 8, Math.min(12, 88 - i), 16, c); R(x + i, 24, Math.min(12, 88 - i), 3, c); }
    R(x, 6, 88, 2, '#7a2a2a');
    R(x, 87, 86, 15, '#6a4229'); for (i = 0; i < 86; i += 12) R(x + i, 87, 1, 15, '#4e2f1c');
    R(x, 83, 88, 4, '#a2714a'); R(x, 83, 88, 1, '#c08a5c');
  }
  function fishPile(x, y, n, c) { for (var i = 0; i < n; i++) { var fx = x + (i % 5) * 5, fy = y - Math.floor(i / 5) * 2; R(fx, fy, 5, 2, c || '#8fa9bd'); R(fx + 5, fy, 1, 2, '#5f7f95'); } }
  function mound(x0, hgt, dark) {
    for (var x = x0; x < W; x++) { var h = Math.round(hgt * Math.sin(Math.PI * (x - x0 + 4) / 70)); if (h > 0) { R(x, 62 - h, 1, h, dark ? '#1c2a1c' : '#2c3a2b'); R(x, 62 - h, 1, 1, dark ? '#2e4430' : '#4a6340'); } }
    R(x0 + 22, 46, 3, 16, '#7d7d8a'); R(x0 + 22, 44, 3, 3, '#7d7d8a'); R(x0 + 22, 46, 1, 16, '#9a9aa8'); R(x0 + 22, 50, 3, 1, '#555560');
    R(x0 + 39, 51, 3, 11, '#6e6e7b'); R(x0 + 39, 49, 3, 3, '#6e6e7b'); R(x0 + 39, 51, 1, 11, '#8a8a98');
  }
  function ground(y, c, c2) { R(0, y, W, H - y, c); for (var i = 0; i < 30; i++) R((i * 37) % W, y + 3 + (i * 7) % (H - y - 4), 3, 1, c2); }
  function torch(x, y) { R(x, y, 2, 16, '#4a2f1d'); var f = Math.sin(S.t * 13 + x) > 0; R(x - 1, y - 5, 4, 5, f ? '#ffb454' : '#ff8a3c'); R(x, y - 7, 2, 2, '#ffe28a'); ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(x + 1, y - 3, 14, 0, 7); ctx.fill(); ctx.restore(); }
  var BG = {
    dock: function () { /* şafak iskelesi */
      var sk = SKIES.dawn; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      sun(150, 62, 9, '#ffd98a'); sea(62, '#2f4a7a', '#39578a', '#2a4270', '#8aa0c8');
      for (i = 0; i < 7; i++) R(150 - (6 - i), 64 + i * 2, (6 - i) * 2 + 2, 1, '#ffd98a');
      R(20, 59, 18, 3, '#1d1230'); R(26, 55, 6, 4, '#1d1230'); R(28, 46, 1, 13, '#1d1230');
      gull(((S.wt * 7 + 30) % 230) - 20, 38 + Math.sin(S.wt) * 3, 0);
      dock(); R(0, 90, 60, 12, '#4a3a2a'); for (i = 0; i < 10; i++) R(4 + i * 5, 88 - (i % 3), 4, 3, '#6b5a4a');   /* ağ yığını */
      R(150, 92, 16, 10, '#8a6a4a'); R(150, 92, 16, 2, '#a88a5a'); fishPile(151, 91, 8);                                  /* sandık */
    },
    market: function () { /* gündüz pazar */
      var sk = SKIES.day; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      sea(62, '#2b5a8f', '#34689e', '#28527f', '#7fb0dc');
      R(120, 30, 70, 32, '#e8e0d0'); R(120, 28, 70, 3, '#b5432f'); for (i = 0; i < 5; i++) R(126 + i * 13, 38, 6, 8, '#6a8aa8');  /* kasaba evi */
      gull(((S.wt * 6 + 80) % 230) - 20, 22 + Math.sin(S.wt * 1.2) * 3, 1);
      dock(); stall(0, '#2f7a4a'); fishPile(8, 82, 14, '#5f8f8a'); fishPile(40, 82, 6, '#a8b6c2');
      R(56, 74, 12, 2, '#9a9aa8'); R(61, 70, 2, 4, '#9a9aa8'); R(54, 76, 6, 1, '#c8c8d0'); R(64, 76, 6, 1, '#c8c8d0');       /* terazi */
    },
    mound: function () { /* höyük, gün batımı (prototip) */
      var sk = SKIES.sunset; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      var cd = (S.wt * 1.2) % 260; R(((40 - cd + 260) % 260) - 30, 34, 24, 3, '#c6566a'); R(((150 - cd + 260) % 260) - 30, 42, 30, 2, '#e08a7a');
      sun(112, 62, 11, '#ffc66a'); mound(134, 13); sea(62, '#2b3f73', '#34497f', '#27386a', '#5a6fa8');
      for (i = 0; i < 9; i++) R(112 + Math.sin(S.wt * 2.2 + i) * 3 - (13 - i) / 2, 64 + i * 2, 13 - i, 1, i % 2 ? '#ffd98a' : '#f7b868');
      gull(((S.wt * 7 + 20) % 230) - 20, 42 + Math.sin(S.wt * 1.3) * 3, 0);
      dock(); R(0, 87, 86, 15, '#6a4229'); R(0, 83, 88, 4, '#a2714a'); R(0, 83, 88, 1, '#c08a5c');
      R(26, 73, 20, 10, '#b5652e'); R(25, 72, 22, 2, '#d88a4a'); R(26, 80, 20, 3, '#8a4a20');                              /* güveç */
      if (S.steam) { S.potT += 0.016; if (S.potT > 0.18) { S.potT = 0; S.parts.push({ t: 'st', x: 36 + rnd(-5, 5), y: 70, vx: rnd(-3, 3), vy: rnd(-12, -7), life: 0, max: rnd(0.8, 1.4) }); } }
    },
    mound_dusk: function () { /* höyük tepesi, alacakaranlık: kazı alanı */
      var sk = SKIES.sunset; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[Math.min(7, i + 1)]);
      sun(40, 64, 10, '#ff9a5a'); sea(64, '#24365f', '#2c4070', '#202f55', '#4a5f98');
      ground(78, '#3a4a30', '#4e6340'); mound(60, 22, true);
      R(20, 84, 50, 10, '#6a5436'); R(20, 84, 50, 1, '#8a7048');                                                             /* kazı çukuru */
    },
    cave: function () { /* denizin dibi: Şahmeran'ın mağarası */
      for (var i = 0; i < 15; i++) R(0, i * 8, W, 8, ['#041a24', '#052330', '#062a3a', '#073242', '#08394a', '#094052', '#0a465a', '#0b4c60'][Math.min(7, i >> 1)]);
      for (i = 0; i < 12; i++) { var x = (i * 29 + 7) % W; R(x, 0, 6 + (i % 3) * 3, 14 + (i * 7) % 18, '#021016'); }                   /* sarkıt */
      R(0, 100, W, 20, '#0a2a2a'); for (i = 0; i < 20; i++) R((i * 23) % W, 98 + (i % 3), 8, 3, '#123a36');
      for (i = 0; i < 8; i++) { var gx = (i * 41 + Math.sin(S.wt + i) * 3) % W, gy = 30 + ((i * 17 + S.wt * 6) % 60); R(gx, 90 - gy % 80, 2, 2, '#6fe3c8'); }   /* kabarcık */
      ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(S.wt * 1.5) * 0.05; ctx.fillStyle = '#e4d24a'; ctx.beginPath(); ctx.arc(120, 70, 34, 0, 7); ctx.fill(); ctx.restore();
      for (i = 0; i < 6; i++) { var sx = 10 + i * 30; R(sx, 94 - (i % 2) * 4, 3, 10, '#2f7a4a'); R(sx + 3, 90 - (i % 2) * 4, 2, 8, '#3f9a5a'); }   /* yosun */
    },
    rocks: function () { /* fener gecesi: rüzgârlı kayalık */
      var sk = SKIES.night; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      for (i = 0; i < 25; i++) R((i * 53) % W, (i * 17) % 50, 1, 1, i % 3 ? '#8a8ac8' : '#fff');
      sun(160, 20, 6, '#e8e8f8'); sea(66, '#0e1a36', '#152446', '#0a1530', '#2a3a6a');
      for (i = 0; i < 6; i++) { var rx = i * 36 - 6, rh = 18 + (i % 3) * 8; R(rx, 102 - rh, 34, rh + 18, '#2a2a36'); R(rx, 102 - rh, 34, 2, '#3e3e4e'); }
      if (Math.sin(S.wt * 0.7) > 0.6) for (i = 0; i < 6; i++) R((S.wt * 120 + i * 40) % W, 40 + i * 9, 10, 1, '#ffffff22');
    },
    ritual: function () { /* höyüğün dibinde gece: ağıt */
      var sk = SKIES.night; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      for (i = 0; i < 30; i++) R((i * 47) % W, (i * 13) % 55, 1, 1, i % 4 ? '#8a8ac8' : '#fff');
      mound(100, 20, true); ground(86, '#1a2418', '#243020');
      torch(20, 70); torch(176, 70);
      R(86, 96, 20, 6, '#5a3a2a'); var f = Math.sin(S.t * 11) > 0; R(90, 90, 12, 6, f ? '#ff8a3c' : '#ffb454'); R(94, 86, 4, 4, '#ffe28a');   /* ateş */
    },
    dawn_mound: function () { /* bereket sabahı */
      var sk = SKIES.morning; for (var i = 0; i < 8; i++) R(0, i * 8, W, 8, sk[i]);
      sun(30, 50, 12, '#fff2b0'); mound(120, 16); sea(62, '#2f6aa0', '#3a78ae', '#2a5f92', '#9ac8ec');
      dock(); fishPile(10, 100, 25, '#8fa9bd'); fishPile(40, 100, 15, '#5f8f8a'); fishPile(70, 100, 10, '#a8b6c2');
      gull(((S.wt * 7 + 20) % 230) - 20, 30 + Math.sin(S.wt * 1.3) * 3, 0); gull(((S.wt * 5 + 110) % 230) - 20, 40, 2);
    }
  };

  /* ---------------- karakterler ---------------- */
  var INK = '#1a1420';
  function armT(c, cx, ty, T) {
    var d = c.dir || 1, sy = ty - 29 - T, sN = { x: cx + d * 8, y: sy }, sF = { x: cx - d * 8, y: sy };
    var P = { idle: [[d, 13], [-d, 13]], reach: [[d * 15, 1], [-d, 13]], hold: [[d * 4, 8], [d * 4, 8]], knees: [[d * 4, 19], [d * 8, 19]], up: [[d * 6, -10], [-d * 2, 13]], bow: [[d * 16, -2], [d * 6, -2]] };
    var p = P[c.pose] || P.idle;
    return { near: { x0: sN.x, y0: sN.y, x1: sN.x + p[0][0], y1: sN.y + p[0][1] }, far: { x0: sF.x, y0: sF.y, x1: sF.x + p[1][0], y1: sF.y + p[1][1] } };
  }
  function limb(a, p) { var dx = a.x1 - a.x0, dy = a.y1 - a.y0, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 3)); for (var i = 0; i <= n; i++) R(a.x0 + dx * i / n - 2, a.y0 + dy * i / n - 2, 4, 4, p.coat); R(a.x1 - 2, a.y1 - 2, 4, 4, p.skin); }
  function bowl(x, y) { R(x - 4, y - 2, 9, 5, '#b5652e'); R(x - 4, y - 2, 9, 1, '#d88a4a'); R(x - 3, y + 3, 7, 1, '#8a4a20'); R(x - 3, y - 3, 7, 1, '#e8d9b0'); }
  function drawHuman(c) {
    var p = c.pal, d = c.dir, T = c.tall || 0, bob = (Math.sin(S.t * 2.6 + c.ph) > 0.4) ? -1 : 0, cx = Math.round(c.x), by = BY, ty = by + bob - (c.sit ? 2 : 0);
    R(cx - 11, by - 1, 22, 3, '#00000055');
    if (c.sit) { R(cx - 6, by - 11, 26, 11, '#6d6d7a'); R(cx - 6, by - 11, 26, 1, '#8a8a98'); R(cx - 18, ty - 16, 22, 6, p.pants); R(cx - 18, ty - 10, 6, 9, p.pants); R(cx - 20, by - 4, 9, 4, INK); }
    else if (c.skirt) { R(cx - 8, by - 14, 16, 12, p.coatD); R(cx - 9, by - 4, 18, 2, p.coatD); R(cx - 5, by - 2, 4, 2, INK); R(cx + 1, by - 2, 4, 2, INK); }
    else { R(cx - 6, by - 12, 5, 10, p.pants); R(cx + 1, by - 12, 5, 10, p.pants); R(cx - 7, by - 3, 6, 3, INK); R(cx + 1, by - 3, 6, 3, INK); }
    var arms = armT(c, cx, ty, T); limb(arms.far, p);
    if (c.id === 'a') { R(cx + 8 * -d, ty - 38 - T, 4, 18 + T, '#6a3f24'); R(cx + 8 * -d, ty - 41 - T, 4, 4, '#e8e0c8'); }
    R(cx - 9, ty - 32 - T, 18, 20 + T, p.coat); R(cx - 9, ty - 32 - T, 2, 20 + T, p.coatL); R(cx + 7, ty - 32 - T, 2, 20 + T, p.coatD); R(cx - 9, ty - 14, 18, 2, p.coatD);
    if (c.id === 'a') { for (var gy = 0; gy < 2; gy++) for (var gx = 0; gx < 4; gx++) R(cx - 6 + gx * 4, ty - 29 - T + gy * 7, 2, 2, p.gold); R(cx - 9, ty - 18, 18, 2, '#3a2a1a'); R(cx - 1, ty - 18, 3, 2, p.gold); }
    else if (c.id === 'v') { R(cx - 9, ty - 32 - T, 18, 3, '#6a5a4a'); R(cx - 2, ty - 26, 4, 10, '#c9a15e'); }
    else R(cx - 3, ty - 33 - T, 6, 2, '#f4ead8');
    var hx = cx - 7, hy = ty - 48 - T + (c.ex === 't' ? 2 : 0), sh = d, ey = hy + 7;
    R(hx + 1, hy, 12, 14, p.skin); R(hx, hy + 1, 14, 12, p.skin); R(hx + 1, hy + 12, 12, 2, p.skinD);
    var e1 = hx + 3 + sh, e2 = hx + 9 + sh, ex = c.ex, talk = S.talk === c.id && Math.floor(S.t * 12) % 2 === 0, chew = c.chew && Math.floor(S.t * 6) % 2 === 0, brow = p.hair;
    if (ex === 'n') { R(e1, ey, 2, 2, INK); R(e2, ey, 2, 2, INK); R(e1 - 1, ey - 3, 4, 1, brow); R(e2 - 1, ey - 3, 4, 1, brow); }
    else if (ex === 't') { R(e1, ey + 1, 2, 1, INK); R(e2, ey + 1, 2, 1, INK); R(e1, ey + 2, 2, 1, p.skinD); R(e2, ey + 2, 2, 1, p.skinD); R(e1 - 1, ey - 2, 1, 1, brow); R(e1 + 2, ey - 4, 1, 1, brow); R(e2 + 2, ey - 2, 1, 1, brow); R(e2 - 1, ey - 4, 1, 1, brow); }
    else if (ex === 's') { R(e1 - 1, ey - 1, 4, 4, '#fff'); R(e2 - 1, ey - 1, 4, 4, '#fff'); R(e1 + (sh > 0 ? 1 : 0), ey, 2, 2, INK); R(e2 + (sh > 0 ? 1 : 0), ey, 2, 2, INK); R(e1 - 1, ey - 5, 4, 1, brow); R(e2 - 1, ey - 5, 4, 1, brow); }
    else if (ex === 'h') { R(e1 - 1, ey + 1, 1, 1, INK); R(e1, ey, 2, 1, INK); R(e1 + 2, ey + 1, 1, 1, INK); R(e2 - 1, ey + 1, 1, 1, INK); R(e2, ey, 2, 1, INK); R(e2 + 2, ey + 1, 1, 1, INK); R(hx + 1, ey + 3, 3, 2, '#e0906a'); R(hx + 10, ey + 3, 3, 2, '#e0906a'); }
    else if (ex === 'a') { R(e1, ey, 2, 2, INK); R(e2, ey, 2, 2, INK); R(e1 - 1, ey - 2, 1, 1, brow); R(e1, ey - 3, 2, 1, brow); R(e2 + 2, ey - 2, 1, 1, brow); R(e2, ey - 3, 2, 1, brow); }
    if (talk || chew) R(hx + 5 + sh, hy + 11, 4, 3, '#5a1020'); else if (ex === 'h') R(hx + 4 + sh, hy + 12, 6, 1, '#7a3a30'); else R(hx + 5 + sh, hy + 12, 4, 1, '#7a3a30');
    if (c.must) R(hx + 3 + sh, hy + 10, 8, 1, p.hair);
    if (c.beard) { R(hx + 2, hy + 10, 10, 6, c.beard); R(hx + 4, hy + 16, 6, 2, c.beard); if (talk) R(hx + 5 + sh, hy + 11, 4, 2, '#5a1020'); }
    if (c.hat === 'kalpak') {
      R(hx + 3 + sh, hy + 9, 8, 2, p.hair); R(hx + 4 + sh, hy + 14, 6, 3, '#4a3222');
      R(hx - 2, hy + 5, 2, 11, p.hair); R(hx + 14, hy + 5, 2, 11, p.hair); R(hx - 2, hy + 13, 2, 1, p.gold); R(hx + 14, hy + 13, 2, 1, p.gold);
      R(hx - 1, hy - 2, 16, 5, p.red); R(hx - 1, hy + 3, 3, 4, p.redD); R(hx + 12, hy + 3, 3, 4, p.redD); R(hx + 2, hy - 5, 10, 3, p.red); R(hx + 4, hy - 8, 6, 3, p.red); R(hx + 6, hy - 11, 4, 3, p.redD); R(hx - 1, hy + 2, 16, 1, p.gold);
    } else if (c.hat === 'scarf') { R(hx - 2, hy - 3, 18, 6, p.cap); R(hx - 2, hy + 3, 3, 12, p.cap); R(hx + 13, hy + 3, 3, 12, p.cap); R(hx + 2, hy - 2, 2, 1, '#f4e9d2'); R(hx + 8, hy - 2, 2, 1, '#f4e9d2'); }
    else if (c.hat === 'flat') { R(hx - 1, hy - 3, 16, 5, p.cap); R(hx + (d > 0 ? 10 : -3), hy + 1, 7, 2, p.capD); }
    else if (c.hat === 'fur') { R(hx - 2, hy - 6, 18, 8, p.cap); R(hx - 2, hy - 6, 18, 1, '#7a6454'); for (var fz = 0; fz < 6; fz++) R(hx - 1 + fz * 3, hy - 7, 1, 1, '#7a6454'); }
    else { R(hx - 1, hy - 3, 16, 7, p.cap); R(hx - 1, hy + 1, 16, 1, p.capD); R(hx, hy + 4, 2, 3, p.hair); R(hx + 12, hy + 4, 2, 3, p.hair); }
    if (c.pale) { ctx.save(); ctx.globalAlpha = 0.25; R(hx, hy, 14, 14, '#d8e8e8'); ctx.restore(); }
    limb(arms.near, p);
    if (c.item === 'bowl') bowl(arms.near.x1 + d * 2, arms.near.y1 - 2);
    if (c.item === 'bow') { var bx = arms.near.x1; R(bx, arms.near.y1 - 14, 2, 28, '#8a5a2a'); R(bx - d * 2, arms.near.y1 - 14, 1, 28, '#e8e0c8'); }
    if (c.item === 'lantern') { var lx = arms.near.x1 - 3, ly = arms.near.y1; R(lx, ly, 6, 8, '#3c4650'); R(lx + 1, ly + 1, 4, 6, Math.sin(S.t * 9) > 0 ? '#ffd98a' : '#ffb454'); ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(lx + 3, ly + 4, 14, 0, 7); ctx.fill(); ctx.restore(); }
    if (c.item === 'kopuz') { var kx = arms.near.x1 - 2; R(kx, arms.near.y1 - 2, 7, 5, '#8a5a2a'); R(kx + 7, arms.near.y1 - 1, 8, 1, '#6a3f24'); }
    if (c.item === 'purse') R(arms.near.x1 - 3, arms.near.y1, 6, 6, '#6a4a2a');
  }
  function drawShahmeran(c) {   /* yarı kadın yarı yılan: yeşil-altın pullu kuyruk kıvrımı, taçlı baş */
    var cx = Math.round(c.x), by = BY - 4, t = S.t, i;
    for (i = 0; i < 26; i++) { var sx = cx - 40 + i * 3, sy = by - 4 + Math.sin(t * 1.4 + i * 0.5) * 3; R(sx, sy - 5, 4, 7, i % 2 ? '#2f8a5a' : '#3fa56a'); R(sx, sy - 5, 4, 1, '#e4b94a'); }
    R(cx - 8, by - 30, 16, 26, '#2f8a5a'); R(cx - 8, by - 30, 3, 26, '#4ab87a'); for (i = 0; i < 4; i++) R(cx - 6 + i * 4, by - 22, 2, 2, '#e4b94a');
    R(cx - 13, by - 28, 5, 12, '#2f8a5a'); R(cx + 8, by - 28, 5, 12, '#2f8a5a'); R(cx - 13, by - 17, 4, 4, '#d9b48a'); R(cx + 9, by - 17, 4, 4, '#d9b48a');
    var hx = cx - 7, hy = by - 46; R(hx + 1, hy, 12, 14, '#d9b48a'); R(hx, hy + 1, 14, 12, '#d9b48a');
    R(hx - 2, hy + 2, 3, 18, '#1a3a2a'); R(hx + 13, hy + 2, 3, 18, '#1a3a2a'); R(hx, hy - 1, 14, 3, '#1a3a2a');
    R(hx + 3, hy + 6, 2, 2, '#1a5a3a'); R(hx + 9, hy + 6, 2, 2, '#1a5a3a'); R(hx + 5, hy + 11, 4, 1, S.talk === 's' && Math.floor(t * 12) % 2 ? '#5a1020' : '#8a4a40');
    R(hx + 1, hy - 5, 12, 3, '#e4b94a'); R(hx + 2, hy - 8, 2, 3, '#e4b94a'); R(hx + 6, hy - 9, 2, 4, '#e4b94a'); R(hx + 10, hy - 8, 2, 3, '#e4b94a'); R(hx + 6, hy - 6, 2, 2, '#6fe3c8');
    ctx.save(); ctx.globalAlpha = 0.14 + Math.sin(t * 2) * 0.05; ctx.fillStyle = '#6fe3c8'; ctx.beginPath(); ctx.arc(cx, by - 30, 30, 0, 7); ctx.fill(); ctx.restore();
  }
  function drawDolphin(c) {
    var x = Math.round(c.x), y = Math.round(c.y + Math.sin(S.t * 3) * 2);
    R(x - 12, y - 3, 22, 6, '#6a8ab0'); R(x - 10, y - 5, 16, 2, '#7a9ac0'); R(x + 10, y - 1, 6, 2, '#6a8ab0'); R(x - 16, y - 5, 4, 4, '#5a7aa0'); R(x - 16, y + 1, 4, 4, '#5a7aa0');
    R(x - 2, y - 9, 4, 4, '#5a7aa0'); R(x - 8, y + 1, 14, 2, '#c8d8e8'); R(x + 7, y - 3, 2, 2, INK);
    if (c.net) { for (var i = 0; i < 6; i++) { R(x - 14 + i * 5, y - 7, 1, 14, '#c9b183'); } R(x - 14, y - 4, 30, 1, '#c9b183'); R(x - 14, y + 3, 30, 1, '#c9b183'); }
  }
  function drawChars() {
    ['s', 'd', 'a', 'v', 't', 'k', 'h', 'y'].forEach(function (k) {
      var c = C[k]; if (!c.vis) return;
      if (k === 's') drawShahmeran(c); else if (k === 'd') drawDolphin(c); else drawHuman(c);
    });
  }
  function drawGlint() {
    var g = S.glint; if (!g) return;
    var k = Math.sin(S.t * 6) > 0;
    R(g.x - 2, g.y, 5, 3, '#e4b94a'); R(g.x - 1, g.y - 2, 3, 2, '#e4b94a'); R(g.x, g.y - 3, 1, 1, '#fff2b0');
    if (k) { R(g.x - 5, g.y - 1, 2, 1, '#fff'); R(g.x + 4, g.y - 4, 2, 1, '#fff'); }
  }
  function drawParts() {
    S.parts.forEach(function (p) {
      var k = p.life / p.max; ctx.save(); ctx.globalAlpha = Math.max(0, 0.6 * (1 - k));
      R(p.x, p.y, p.t === 'd' ? 3 : 2, p.t === 'd' ? 3 : 2, p.c || (p.t === 'd' ? '#eadcc3' : '#fff')); ctx.restore();
    });
  }
  function render() {
    (BG[S.bg] || BG.dock)();
    drawChars(); drawGlint(); drawParts();
    if (S.light > 0.01) { ctx.save(); ctx.globalAlpha = S.light; R(0, 0, W, H, '#fff6d0'); ctx.restore(); }
    var z = S.cam.z, sw = W / z, sh = H / z;
    var cx = Math.min(Math.max(S.cam.x, sw / 2), W - sw / 2), cy = Math.min(Math.max(S.cam.y, sh / 2), H - sh / 2);
    var sx = cx - sw / 2, sy = cy - sh / 2, sk = RM ? 0.25 : 1;
    if (S.shake > 0.001) { sx += (Math.random() - 0.5) * S.shake * 6 * sk; sy += (Math.random() - 0.5) * S.shake * 6 * sk; }
    sx = Math.round(clamp(sx, 0, W - sw)); sy = Math.round(clamp(sy, 0, H - sh));
    o.imageSmoothingEnabled = false; o.drawImage(wc, sx, sy, sw, sh, 0, 0, OW, OH);
    var bh = Math.round(S.bars * OH * 0.1); if (bh > 0) { o.fillStyle = '#000'; o.fillRect(0, 0, OW, bh); o.fillRect(0, OH - bh, OW, bh); }
    if (S.flash > 0.01 && !RM) { o.globalAlpha = Math.min(1, S.flash); o.fillStyle = '#fff'; o.fillRect(0, 0, OW, OH); o.globalAlpha = 1; }
  }

  /* ---------------- akış ---------------- */
  var el = {}, mode = 'idle', SEQ = null, TY = { on: false, text: '', i: 0, acc: 0, delay: 0.03, who: 'n' }, MG = null, raf = 0, last = 0, DAY = null, CTX = null, onDone = null, CFG = null;
  var WHO = {
    n: [{ tr: 'ANLATICI', en: 'NARRATOR' }, '#3a2b58', '#f6e9d3'], y: [{ tr: 'SEN', en: 'YOU' }, '#ffd166', '#3a2605'],
    a: [{ tr: 'ALP ER TUNGA', en: 'ALP ER TUNGA' }, '#e4b94a', '#2a1c14'], h: [{ tr: 'HACER TEYZE', en: 'AUNT HACER' }, '#c8553d', '#fff'],
    k: [{ tr: 'KALENDER', en: 'KALENDER' }, '#557563', '#fff'], t: [{ tr: 'TEMEL DEDE', en: 'GRANDPA TEMEL' }, '#8a7a5a', '#fff'],
    s: [{ tr: 'ŞAHMERAN', en: 'SHAHMERAN' }, '#2f8a5a', '#fff2b0'], v: [{ tr: 'HASTA VEZİR', en: 'THE SICK VIZIER' }, '#2a3050', '#e8cdb2'],
    d: [{ tr: 'YUNUS', en: 'DOLPHIN' }, '#6a8ab0', '#fff']
  };
  function $(id) { return el[id]; }
  function build() {
    if (!document.getElementById('hkstCss')) { var st = document.createElement('style'); st.id = 'hkstCss'; st.textContent = CSS; document.head.appendChild(st); }
    ROOT = document.createElement('div'); ROOT.className = 'hkst'; ROOT.id = 'hkStory';
    ROOT.innerHTML = '<div class="app"><div class="stage" data-k="stage"><canvas data-k="cv" width="960" height="600"></canvas>' +
      '<div class="hud" data-k="hud"><span data-k="berL"></span> <span class="segs" data-k="segs"></span></div><button class="skip" data-k="skip"></button>' +
      '<div class="ov" data-k="ov"><small data-k="ovk"></small><h2 data-k="ovh"></h2></div></div>' +
      '<div class="panel" data-k="panel"><div data-k="dlg"><div class="who" data-k="who"></div><div class="txt" data-k="txt"></div><div class="nx" data-k="nx" hidden>▼</div></div>' +
      '<div data-k="mini" hidden></div><div data-k="result" hidden></div></div></div>';
    Array.prototype.forEach.call(ROOT.querySelectorAll('[data-k]'), function (n) { el[n.getAttribute('data-k')] = n; });
    document.body.appendChild(ROOT);
    out = el.cv; o = out.getContext('2d'); wc = document.createElement('canvas'); wc.width = W; wc.height = H; ctx = wc.getContext('2d');
    el.stage.addEventListener('click', tap); el.dlg.addEventListener('click', tap);
    el.skip.addEventListener('click', function (e) { e.stopPropagation(); skip(); });
    window.addEventListener('resize', fit);
    document.addEventListener('keydown', onKey);
  }
  function destroy() {
    running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', fit);
    if (MG && MG.stop) MG.stop(); MG = null;
    if (ROOT && ROOT.parentNode) ROOT.parentNode.removeChild(ROOT); ROOT = null; el = {};
  }
  function onKey(e) {
    if (!running) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (mode === 'dlg') { e.preventDefault(); tap(); }
      else if (mode === 'mini' && MG && MG.key) { e.preventDefault(); MG.key(e.code); }
    } else if (mode === 'mini' && MG && MG.key) MG.key(e.code, e.key);
  }
  function showPanel(n) { ['dlg', 'mini', 'result'].forEach(function (id) { el[id].hidden = id !== n; }); el.skip.hidden = !(n === 'dlg' || n === 'mini'); }
  function hud(from) {
    var b = CTX.ber, h = ''; for (var i = 0; i < 10; i++) h += '<i class="' + (i < b ? 'on' : '') + (from !== undefined && ((i >= from && i < b) || (i < from && i >= b)) ? ' new' : '') + '"></i>';
    el.segs.innerHTML = h; el.berL.textContent = tx(UI.ber);
  }
  function say(w, t) {
    var m = WHO[w] || WHO.n; el.who.textContent = tx(m[0]); el.who.style.background = m[1]; el.who.style.color = m[2];
    TY = { on: true, text: t, i: 0, acc: 0, delay: 0.03, who: w }; S.talk = w === 'n' ? null : w; el.txt.textContent = ''; el.nx.hidden = true;
  }
  function endTyping() { TY.on = false; S.talk = null; el.nx.hidden = false; el.txt.textContent = TY.text; }
  function play(list, end) { SEQ = { list: list, i: -1, end: end }; next(); }
  function next() { if (!SEQ) return; SEQ.i++; if (SEQ.i >= SEQ.list.length) { var e = SEQ.end; SEQ = null; if (e) e(); return; } step(SEQ.list[SEQ.i]); }
  function setCam(a, cut) { S.tgt.x = a[0]; S.tgt.y = a[1]; S.tgt.z = a[2]; if (cut) { S.cam.x = a[0]; S.cam.y = a[1]; S.cam.z = a[2]; } }
  function step(s) {
    if (typeof s === 'function') { s = s(CTX); if (!s) { next(); return; } }
    mode = 'dlg'; showPanel('dlg');
    if (s.bg) S.bg = s.bg;
    if (s.show) s.show.split(',').forEach(function (k) { if (C[k]) C[k].vis = true; });
    if (s.hide) s.hide.split(',').forEach(function (k) { if (C[k]) C[k].vis = false; });
    if (s.pos) for (var k in s.pos) if (C[k]) { if (typeof s.pos[k] === 'number') C[k].x = s.pos[k]; else { C[k].x = s.pos[k][0]; if (s.pos[k][1] !== undefined) C[k].dir = s.pos[k][1]; } }
    if (s.cam) setCam(s.cam, s.cut);
    if (s.ex) for (var e in s.ex) if (C[e]) C[e].ex = s.ex[e];
    if (s.p) for (var q in s.p) if (C[q]) C[q].pose = s.p[q];
    if (s.it) for (var r in s.it) if (C[r]) C[r].item = s.it[r] || null;
    if (s.sit) for (var u in s.sit) if (C[u]) C[u].sit = !!s.sit[u];
    if (s.fx) s.fx.split(',').forEach(function (f) { if (FX[f]) FX[f](); });
    say(s.w || 'n', tx(s.t));
  }
  function tap() { if (mode !== 'dlg') return; if (TY.on) { TY.i = TY.text.length; endTyping(); } else next(); }
  function skip() {
    if (mode === 'dlg' && SEQ) { TY.on = false; S.talk = null; var list = SEQ.list, e = SEQ.end; for (var i = SEQ.i + 1; i < list.length; i++) applyQuiet(list[i]); SEQ = null; if (e) e(); }
    else if (mode === 'mini' && MG) MG.finish(true);
  }
  function applyQuiet(s) { if (typeof s === 'function') s = s(CTX); if (!s) return; if (s.bg) S.bg = s.bg; if (s.show) s.show.split(',').forEach(function (k) { if (C[k]) C[k].vis = true; }); if (s.hide) s.hide.split(',').forEach(function (k) { if (C[k]) C[k].vis = false; }); }
  var FX = {
    shake: function () { S.shake = 0.6; }, flash: function () { S.flash = 0.7; }, ding: function () { sfx('ding'); }, kopuz: function () { sfx('kopuz'); S.shake = 0.2; },
    steam: function () { S.steam = true; }, nosteam: function () { S.steam = false; }, bars: function () { S.barsT = 1; }, nobars: function () { S.barsT = 0; },
    eat: function () { C.a.chew = true; }, noeat: function () { C.a.chew = false; }, splash: function () { sfx('splash'); for (var i = 0; i < 14; i++) S.parts.push({ t: 'd', x: C.d.x + rnd(-10, 10), y: C.d.y - 4, vx: rnd(-20, 20), vy: rnd(-30, -10), life: 0, max: rnd(0.5, 0.9), c: '#bfe2f2' }); },
    glint: function () { S.glint = { x: 158, y: 90 }; sfx('bell'); }, noglint: function () { S.glint = null; }, deep: function () { sfx('deep'); }, wind: function () { sfx('wind'); S.shake = 0.3; },
    light: function () { S.light = 0.5; }, bow: function () { sfx('bow'); S.flash = 0.4; }, gold: function () { S.light = 0.35; sfx('ding'); }, low: function () { sfx('low'); }, bell: function () { sfx('bell'); }
  };
  function update(dt) {
    S.t += dt; S.wt += dt;
    var k = 1 - Math.exp(-dt * 5); S.cam.x += (S.tgt.x - S.cam.x) * k; S.cam.y += (S.tgt.y - S.cam.y) * k; S.cam.z += (S.tgt.z - S.cam.z) * k;
    S.bars += (S.barsT - S.bars) * (1 - Math.exp(-dt * 3.5)); S.shake = Math.max(0, S.shake - dt * 1.4); S.flash = Math.max(0, S.flash - dt * 2.6); S.light = Math.max(0, S.light - dt * 0.5);
    if (C.a.chew) { S.chewT += dt; if (S.chewT > 0.5) { S.chewT = 0; sfx('chew'); } }
    S.parts = S.parts.filter(function (p) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t === 'd') p.vy += 60 * dt; return p.life < p.max; });
    if (TY.on) {
      TY.acc += dt;
      while (TY.on && TY.acc >= TY.delay) {
        TY.acc -= TY.delay; var ch = TY.text.charAt(TY.i++);
        if (ch && ch !== ' ' && TY.i % 2 === 0) blip(TY.who);
        TY.delay = /[,;]/.test(ch) ? 0.14 : /[.!?…]/.test(ch) ? 0.22 : 0.028;
        el.txt.textContent = TY.text.slice(0, TY.i);
        if (TY.i >= TY.text.length) endTyping();
      }
    }
    if (MG && MG.tick) MG.tick(dt);
  }
  function frame(now) { if (!running) return; var dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); render(); raf = requestAnimationFrame(frame); }

  /* ---------------- mini oyunlar (4 motor + deri) ---------------- */
  function miniHead(t, h) { return '<div class="mh"><b>' + tx(t) + '</b><span>' + tx(h) + '</span></div>'; }
  var MINI = {
    /* seçim: soru + seçenekler → id */
    choice: function (cfg, done) {
      var h = miniHead(cfg.title || { tr: 'KARAR', en: 'DECISION' }, cfg.q);
      cfg.opts.forEach(function (op, i) { h += '<button class="opt" data-i="' + i + '">' + tx(op) + '</button>'; });
      el.mini.innerHTML = h; el.skip.hidden = true;
      return {
        key: function (c, k) { var n = +k; if (n >= 1 && n <= cfg.opts.length) pick(n - 1); },
        finish: function () { pick(cfg.def || 0); }, _: el.mini.addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) pick(+b.getAttribute('data-i')); })
      };
      function pick(i) { if (!MG) return; sfx('tick'); var op = cfg.opts[i]; MG = null; done({ ok: true, id: op.id }); }
    },
    /* zamanlama çubuğu: imleç gidip gelir, yeşilde durdur (terazi, yay, araya girme) */
    bar: function (cfg, done) {
      var tries = cfg.tries || 3, need = cfg.need || 1, hits = 0, used = 0, pos = 0, dir = 1, sp = cfg.speed || 1.1, zw = cfg.zone || 0.18, zc = 0.5, wait = 0;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="meter" data-k2="m"><i style="left:0;width:100%;background:#2a1b44"></i><i data-k2="z" style="background:#6fe39a88"></i><i data-k2="c" style="width:4px;background:#ffb454"></i></div>' +
        '<div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.tap) + '</button>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); };
      function place() { zc = 0.2 + Math.random() * 0.6; q('z').style.left = ((zc - zw / 2) * 100) + '%'; q('z').style.width = (zw * 100) + '%'; }
      function info(m) { q('r').textContent = tx(UI.tries) + ' ' + Math.min(tries, used + (m ? 0 : 1)) + '/' + tries + ' · ★ ' + hits + '/' + need + (m ? '  ' + m : ''); }
      place(); info();
      function stop() {
        if (!MG || wait > 0) return; used++;
        var ok = Math.abs(pos - zc) <= zw / 2;
        if (ok) { hits++; sfx('ding'); if (cfg.onHit) cfg.onHit(); } else { sfx('buzz'); S.shake = 0.3; }
        info(ok ? '✔' : '✖');
        if (hits >= need || used >= tries) { var r = { ok: hits >= need, hits: hits }; MG = null; setTimeout(function () { done(r); }, 700); return; }
        wait = 0.6; place(); sp *= 1.1;
      }
      q('b').addEventListener('click', function (e) { e.stopPropagation(); stop(); });
      return {
        tick: function (dt) { if (wait > 0) { wait -= dt; return; } pos += dir * sp * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } q('c').style.left = 'calc(' + (pos * 100) + '% - 2px)'; },
        key: function (c) { if (c === 'Space' || c === 'Enter') stop(); }, finish: function () { MG = null; done({ ok: false, hits: hits, skipped: true }); }
      };
    },
    /* denge: ibre kendi kendine kayar; sağ/sol ile ortada tut (terazi, vezirin şüphesi) */
    balance: function (cfg, done) {
      var t = cfg.time || 14, hold = cfg.hold || 4, inz = 0, v = 0, x = 0, push = 0, lbl = cfg.meter || { tr: 'DENGE', en: 'BALANCE' };
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="rt">' + tx(lbl) + '</div><div class="meter" style="height:22px"><i style="left:40%;width:20%;background:#6fe39a55"></i><i data-k2="n" style="width:6px;background:#ffb454"></i></div>' +
        '<div class="meter"><i data-k2="p" style="left:0;width:0;background:#6fe39a"></i></div><div class="mres" data-k2="r"></div>' +
        '<div class="btns"><button data-k2="l">' + tx(UI.left) + '</button><button data-k2="g">' + tx(UI.right) + '</button></div>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); };
      function nudge(d) { v += d * 0.9; sfx('tick'); }
      q('l').addEventListener('click', function (e) { e.stopPropagation(); nudge(-1); }); q('g').addEventListener('click', function (e) { e.stopPropagation(); nudge(1); });
      function end(sk) { var r = { ok: inz >= hold, pct: inz / hold, skipped: !!sk }; MG = null; sfx(r.ok ? 'ding' : 'buzz'); setTimeout(function () { done(r); }, sk ? 0 : 600); }
      return {
        tick: function (dt) {
          t -= dt; push += dt; if (push > 0.7) { push = 0; v += rnd(-0.55, 0.55) * (cfg.wild || 1); }
          v *= Math.pow(0.35, dt); x = clamp(x + v * dt, -1, 1); if (Math.abs(x) >= 1) v = -v * 0.3;
          if (Math.abs(x) < 0.2) inz += dt;
          q('n').style.left = 'calc(' + ((x + 1) * 50) + '% - 3px)'; q('p').style.width = Math.min(100, inz / hold * 100) + '%';
          q('r').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's';
          if (inz >= hold || t <= 0) end();
        },
        key: function (c) { if (c === 'ArrowLeft') nudge(-1); if (c === 'ArrowRight') nudge(1); }, finish: function () { end(true); }
      };
    },
    /* sıralı seçim: doğru eşyaları doğru sırayla, süre/ısı bitmeden (sofra, düğüm) */
    order: function (cfg, done) {
      var arr = cfg.items.slice(), i, j, tmp, picks = [], heat = 1, memo = cfg.memo || 0;
      for (i = arr.length - 1; i > 0; i--) { j = Math.random() * (i + 1) | 0; tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
      var h = miniHead(cfg.title, cfg.hint) + '<div class="slots">'; for (i = 0; i < cfg.answer.length; i++) h += '<i>' + (i + 1) + '</i>'; h += '</div><div class="items">';
      arr.forEach(function (it, ix) { h += '<button class="it" data-i="' + ix + '"><i style="background:' + it.c + '"></i>' + tx(it.t) + '</button>'; });
      h += '</div><div class="rt">' + tx(cfg.meter || { tr: 'SÜRE', en: 'TIME' }) + '</div><div class="meter"><i data-k2="h" style="left:0;width:100%;background:#ffb454"></i></div><div class="mres" data-k2="r"></div>';
      el.mini.innerHTML = h;
      var slots = el.mini.querySelector('.slots').children;
      if (memo) { for (i = 0; i < cfg.answer.length; i++) { var it0 = cfg.items.filter(function (q) { return q.id === cfg.answer[i]; })[0]; slots[i].className = 'f'; slots[i].textContent = tx(it0.t); } }
      function pick(ix) {
        if (!MG || memo > 0) return; var b = el.mini.querySelector('[data-i="' + ix + '"]'); if (!b || b.disabled) return;
        b.disabled = true; picks.push(arr[ix].id); sfx('tick'); var sl = slots[picks.length - 1]; sl.className = 'f'; sl.textContent = tx(arr[ix].t);
        if (picks.length === cfg.answer.length) end();
      }
      function end(sk) {
        if (!MG) return; var ok = !sk && heat > 0 && picks.join() === cfg.answer.join(); MG = null;
        var m = el.mini.querySelector('[data-k2="r"]'); m.textContent = ok ? '★' : '✖'; m.style.color = ok ? '#6fe39a' : '#ff5a6a';
        sfx(ok ? 'ding' : 'buzz'); setTimeout(function () { done({ ok: ok, cold: heat <= 0, skipped: !!sk }); }, sk ? 0 : 800);
      }
      el.mini.addEventListener('click', function (e) { var b = e.target.closest('.it'); if (b) pick(+b.getAttribute('data-i')); });
      return {
        tick: function (dt) {
          if (memo > 0) { memo -= dt; if (memo <= 0) for (var k = 0; k < slots.length; k++) { slots[k].className = ''; slots[k].textContent = String(k + 1); } return; }
          heat -= dt / (cfg.time || 16); var hb = el.mini.querySelector('[data-k2="h"]'); hb.style.width = Math.max(0, heat * 100) + '%'; hb.style.background = heat > 0.5 ? '#ffb454' : heat > 0.25 ? '#ff8a3c' : '#ff5a6a';
          if (heat <= 0) end();
        },
        key: function (c, k) { var n = +k; if (n >= 1 && n <= arr.length) pick(n - 1); }, finish: function () { end(true); }
      };
    },
    /* fırça: parmakla sür, toprağı temizle, altından çıkanı ortaya çıkar */
    scrub: function (cfg, done) {
      var t = cfg.time || 16, need = cfg.need || 0.8, GW = 48, GH = 20, cells = [], left = 0, i;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<canvas class="scrub" width="' + GW * 4 + '" height="' + GH * 4 + '" data-k2="c"></canvas><div class="meter"><i data-k2="p" style="left:0;width:0;background:#6fe39a"></i></div><div class="mres" data-k2="r"></div>';
      var cv = el.mini.querySelector('[data-k2="c"]'), g = cv.getContext('2d');
      for (i = 0; i < GW * GH; i++) { cells.push(1); left++; }
      function draw() {
        g.fillStyle = '#3a2c1c'; g.fillRect(0, 0, GW * 4, GH * 4);
        g.fillStyle = '#e4b94a'; g.fillRect(70, 30, 26, 8); g.fillRect(80, 22, 8, 8); g.fillRect(84, 16, 2, 6);                      /* ok ucu */
        g.fillStyle = '#b08a4a'; g.fillRect(110, 46, 60, 3); g.fillRect(108, 40, 3, 16); g.fillRect(168, 40, 3, 16);                  /* yay izi */
        for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) if (cells[y * GW + x]) { g.fillStyle = ((x * 7 + y * 3) % 5) ? '#7a5a3a' : '#6a4a2e'; g.fillRect(x * 4, y * 4, 4, 4); }
      }
      function brush(e) {
        var r = cv.getBoundingClientRect(), px = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * GW, py = ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) / r.height * GH;
        var hit = false;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) { var cx = Math.floor(px + dx), cy = Math.floor(py + dy); if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue; var k = cy * GW + cx; if (cells[k]) { cells[k] = 0; left--; hit = true; } }
        if (hit && Math.random() < 0.2) sfx('chew');
        draw();
      }
      var down = false;
      cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); down = true; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); brush(e); });
      cv.addEventListener('pointermove', function (e) { if (down) brush(e); });
      cv.addEventListener('pointerup', function () { down = false; });
      draw();
      function end(sk) { if (!MG) return; var pct = 1 - left / (GW * GH), r = { ok: !sk && pct >= need, pct: pct, skipped: !!sk }; MG = null; sfx(r.ok ? 'ding' : 'buzz'); setTimeout(function () { done(r); }, sk ? 0 : 700); }
      return {
        tick: function (dt) { t -= dt; var pct = 1 - left / (GW * GH); el.mini.querySelector('[data-k2="p"]').style.width = Math.min(100, pct / need * 100) + '%'; el.mini.querySelector('[data-k2="r"]').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's'; if (pct >= need || t <= 0) end(); },
        key: function (c) { if (c === 'Space') { for (var k = 0; k < 60; k++) { var q = Math.random() * GW * GH | 0; if (cells[q]) { cells[q] = 0; left--; } } draw(); } }, finish: function () { end(true); }
      };
    },
    /* söyleşi: sorular, cevaplar göstergeyi oynatır (sakin söyleşi) */
    talk: function (cfg, done) {
      var qi = 0, score = 0, max = 0;
      function show() {
        var q = cfg.qs[qi], h = miniHead(cfg.title, cfg.hint) + '<div class="rt">' + tx(cfg.meter) + '</div><div class="meter"><i data-k2="m" style="left:0;width:' + (max ? Math.max(0, score / max * 100) : 50) + '%;background:#6fe3c8"></i></div>';
        h += '<p class="note" style="color:#f6e9d3;font-size:16px">' + tx(q.q) + '</p>';
        q.o.forEach(function (op, i) { h += '<button class="opt" data-i="' + i + '">' + tx(op) + '</button>'; });
        el.mini.innerHTML = h;
      }
      function pick(i) {
        if (!MG) return; var q = cfg.qs[qi], op = q.o[i]; score += op.v || 0; max += Math.max.apply(null, q.o.map(function (z) { return z.v || 0; })); sfx(op.v > 0 ? 'ding' : 'tick');
        qi++; if (qi >= cfg.qs.length) { var r = { ok: score >= (cfg.need || max * 0.6), score: score, last: op.id }; MG = null; done(r); } else show();
      }
      el.mini.addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) pick(+b.getAttribute('data-i')); });
      show();
      return { key: function (c, k) { var n = +k; if (n >= 1 && n <= 4) pick(n - 1); }, finish: function () { MG = null; done({ ok: false, score: 0, skipped: true }); } };
    },
    /* fener: basılı tut, rüzgâr gelince alevi koru; sakinken bırak (hava alsın) */
    lantern: function (cfg, done) {
      var t = cfg.time || 16, flame = 1, gust = 0, gw = 0, holding = false;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<div class="rt">🔥</div><div class="meter" style="height:18px"><i data-k2="f" style="left:0;width:100%;background:#ffb454"></i></div>' +
        '<div class="rt" data-k2="w">·</div><div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.hold) + '</button>';
      var q = function (k) { return el.mini.querySelector('[data-k2="' + k + '"]'); }, b = q('b');
      function set(v) { holding = v; b.style.background = v ? '#6fe39a' : ''; }
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); set(true); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { set(false); }); });
      function end(sk) { if (!MG) return; var r = { ok: !sk && flame > 0, flame: flame, skipped: !!sk }; MG = null; set(false); sfx(r.ok ? 'ding' : 'low'); setTimeout(function () { done(r); }, sk ? 0 : 700); }
      return {
        tick: function (dt) {
          t -= dt; gw -= dt;
          if (gw <= 0) { gust = gust ? 0 : 1; gw = gust ? rnd(1.2, 2.2) : rnd(1.0, 2.6); if (gust) sfx('wind'); }
          flame += gust ? (holding ? -0.02 : -0.28) * dt : (holding ? -0.14 : 0.1) * dt; flame = clamp(flame, 0, 1);
          q('f').style.width = flame * 100 + '%'; q('f').style.background = flame > 0.5 ? '#ffb454' : flame > 0.25 ? '#ff8a3c' : '#ff5a6a';
          q('w').textContent = gust ? tx({ tr: '💨 RÜZGÂR!', en: '💨 WIND!' }) : tx({ tr: 'sakin', en: 'calm' }); q('r').textContent = tx(UI.time) + ' ' + Math.max(0, Math.ceil(t)) + 's';
          if (flame <= 0 || t <= 0) end();
        },
        key: function (c) { if (c === 'Space') { set(!holding); } }, finish: function () { end(true); }
      };
    },
    /* ritim: notalar kayar, çizgiye gelince vur (ağıt) */
    rhythm: function (cfg, done) {
      var bpm = cfg.bpm || 72, beat = 60 / bpm, notes = [], t = -1.2, hits = 0, i;
      cfg.pattern.forEach(function (b) { notes.push({ at: b * beat, hit: false, miss: false }); });
      var endAt = notes[notes.length - 1].at + 1;
      el.mini.innerHTML = miniHead(cfg.title, cfg.hint) + '<canvas class="scrub" width="240" height="60" data-k2="c" style="aspect-ratio:4/1;cursor:pointer"></canvas><div class="mres" data-k2="r"></div><button class="big" data-k2="b">' + tx(UI.hit) + '</button>';
      var cv = el.mini.querySelector('[data-k2="c"]'), g = cv.getContext('2d'), SCALE = 70;
      function hit() {
        if (!MG) return; var best = null, bd = 9;
        for (i = 0; i < notes.length; i++) { var n = notes[i]; if (n.hit || n.miss) continue; var d = Math.abs(n.at - t); if (d < bd) { bd = d; best = n; } }
        if (best && bd < 0.22) { best.hit = true; hits++; var f = (cfg.freqs || [294, 349, 392, 440])[notes.indexOf(best) % 4]; tone(f, 0.7, 'triangle', 0.08, -6); tone(f * 2, 0.3, 'square', 0.012); }
        else { sfx('tick'); }
      }
      el.mini.querySelector('[data-k2="b"]').addEventListener('pointerdown', function (e) { e.stopPropagation(); hit(); });
      cv.addEventListener('pointerdown', function (e) { e.stopPropagation(); hit(); });
      function end(sk) { if (!MG) return; var r = { ok: !sk && hits >= Math.ceil(notes.length * (cfg.need || 0.6)), hits: hits, of: notes.length, skipped: !!sk }; MG = null; setTimeout(function () { done(r); }, sk ? 0 : 500); }
      return {
        tick: function (dt) {
          t += dt; g.fillStyle = '#0d0818'; g.fillRect(0, 0, 240, 60); g.fillStyle = '#4b3272'; g.fillRect(0, 29, 240, 2); g.fillStyle = '#ffb454'; g.fillRect(40, 8, 3, 44);
          for (i = 0; i < notes.length; i++) {
            var n = notes[i], x = 40 + (n.at - t) * SCALE; if (!n.hit && !n.miss && t - n.at > 0.25) n.miss = true;
            if (x < -10 || x > 250) continue; g.fillStyle = n.hit ? '#6fe39a' : n.miss ? '#ff5a6a55' : '#e4b94a'; g.fillRect(x - 5, 22, 10, 16);
          }
          el.mini.querySelector('[data-k2="r"]').textContent = '♪ ' + hits + '/' + notes.length;
          if (t > endAt) end();
        },
        key: function (c) { if (c === 'Space' || c === 'Enter') hit(); }, finish: function () { end(true); }
      };
    }
  };
  function startMini(cfg, cb) {
    mode = 'mini'; showPanel('mini'); el.mini.innerHTML = '';
    var m = MINI[cfg.type]; if (cfg.cam) setCam(cfg.cam); CFG = cfg;
    MG = m(cfg, function (r) { mode = 'wait'; cb(r); });
  }

  /* ---------------- sonuç kartı ---------------- */
  function result(r) {
    mode = 'result'; TY.on = false; S.talk = null; SEQ = null; S.barsT = 0;
    var from = CTX.ber; if (typeof r.berSet === 'number') CTX.ber = clamp(r.berSet, 3, 10); if (r.ber) CTX.ber = clamp(CTX.ber + r.ber, 3, 10); hud(from);
    sfx('ding');
    var dB = CTX.ber - from, h = '<div class="rt">' + tx(UI.res) + '</div><h3 class="rh">' + tx(r.title) + '</h3><div class="stats">' +
      '<div class="stat"><small>' + tx(UI.rep) + '</small><b class="up">+' + (r.rep || 0) + '</b></div>' +
      '<div class="stat"><small>' + tx(UI.ber) + '</small><b class="' + (dB >= 0 ? 'up' : 'dn') + '">' + (dB > 0 ? '+' : '') + dB + ' → ' + CTX.ber + '/10</b></div></div>';
    (r.buffs || []).forEach(function (b) { var d = BUFFS[b.id]; if (d) h += '<div class="buff"><i>★</i><div><b>' + tx(d.n) + (b.lv < 1 ? ' (½)' : '') + '</b><small>' + tx(d.d) + '</small></div></div>'; });
    (r.items || []).forEach(function (it) { var d = ITEMS[it]; if (d) h += '<div class="buff" style="border-color:#6cc6ff;background:#10202c"><i style="color:#6cc6ff">◆</i><div><b>' + tx(d.n) + '</b><small>' + tx(UI.item) + ' · ' + tx(d.d) + '</small></div></div>'; });
    (r.pieces || []).forEach(function (pz) { var d = PIECES[pz]; if (d) h += '<div class="buff" style="border-color:#6fe3c8;background:#0c2420"><i style="color:#6fe3c8">❖</i><div><b>' + tx(UI.piece) + ': ' + tx(d.n) + '</b><small>' + tx(d.d) + '</small></div></div>'; });
    if (r.note) h += '<p class="note">' + tx(r.note) + '</p>';
    h += '<div class="btns"><button class="pri" data-r="1">' + tx(UI.cont) + '</button></div>';
    el.result.innerHTML = h; showPanel('result');
    el.result.querySelector('[data-r]').addEventListener('click', function () { finish(r); });
  }
  function finish(r) { var cb = onDone; destroy(); if (cb) cb(r); }

  /* ---------------- kalıcı etkiler, eşyalar, söz parçaları ---------------- */
  var BUFFS = {
    baris: { n: { tr: 'Barışçı Esnaf', en: 'Peacekeeping Trader' }, d: { tr: 'Kalıcı · müşteri sabrı +%10', en: 'Permanent · customer patience +10%' } },
    adil: { n: { tr: 'Adil Tezgâh', en: 'Fair Stall' }, d: { tr: 'Kalıcı · satış fiyatı +%4', en: 'Permanent · sale price +4%' } },
    sert: { n: { tr: 'Sert Tezgâh', en: 'Stern Stall' }, d: { tr: 'Kalıcı · müşteri akışı +%6', en: 'Permanent · customer flow +6%' } },
    muhafiz: { n: { tr: 'Koy Muhafızı', en: 'Cove Guardian' }, d: { tr: 'Kalıcı · fırtına günü müşteri kaybı yarıya iner, mutfak %10 hızlı', en: 'Permanent · storm-day customer loss halved, kitchen 10% faster' } },
    altinok: { n: { tr: 'Altın Ok', en: 'Golden Arrow' }, d: { tr: 'Kalıcı · nadir balık şansı biraz artar', en: 'Permanent · slightly higher rare-fish chance' } },
    denizsozu: { n: { tr: 'Deniz Sözü', en: 'Sea Promise' }, d: { tr: 'Kalıcı · nadir balık şansı biraz artar; yunus iskelede görünür', en: 'Permanent · slightly higher rare-fish chance; the dolphin visits the pier' } },
    bekci: { n: { tr: 'Dipteki Sözün Bekçisi', en: 'Keeper of the Promise Below' }, d: { tr: 'Unvan · kazanılan itibar +%5', en: 'Title · reputation gains +5%' } }
  };
  var ITEMS = {
    okucu: { n: { tr: 'Üç Kenarlı Ok Ucu', en: 'Three-Edged Arrowhead' }, d: { tr: 'ağdan çıktı, altın', en: 'came up in the net, golden' } },
    gomlek: { n: { tr: 'Yılan Gömleği', en: 'Snake Skin' }, d: { tr: 'dev, ucunda altın tozu', en: 'huge, gold dust on its tip' } },
    okucu2: { n: { tr: 'Ok Ucunun Eşi', en: 'The Twin Arrowhead' }, d: { tr: 'çamurdaki izin yanında', en: 'beside the footprint in the mud' } },
    yayizi: { n: { tr: 'Yay İzi', en: 'Bow Imprint' }, d: { tr: 'höyüğün toprağında', en: 'in the soil of the mound' } },
    altinok: { n: { tr: 'Altın Ok', en: 'Golden Arrow' }, d: { tr: 'denizdeki ışığa atıldı', en: 'shot into the light on the sea' } }
  };
  var PIECES = {
    emek: { n: { tr: 'Emek', en: 'Toil' }, d: { tr: 'Denizden ihtiyacın kadar al.', en: 'Take from the sea only what you need.' } },
    sir: { n: { tr: 'Sır', en: 'Secret' }, d: { tr: 'Yerimi kimseye söyleme.', en: 'Tell no one where I dwell.' } },
    agit: { n: { tr: 'Ağıt', en: 'Lament' }, d: { tr: 'Bekçinin yasını unutma.', en: 'Never forget the keeper\'s grief.' } }
  };

  /* ---------------- GÜNLER ---------------- */
  var ALP = { a: 'n' };
  var DAYS = {};
  /* 1 · Altın Ok Ucu */
  DAYS[1] = {
    title: { tr: 'Altın Ok Ucu', en: 'The Golden Arrowhead' }, when: { tr: 'şafak · 1 dk', en: 'dawn · 1 min' },
    open: [
      L('n', 'Şafak. Ağlar ağır geliyor; Kalender ile Hacer Teyze iskelede balığı ayıklıyor.', 'Dawn. The nets come up heavy; Kalender and Aunt Hacer sort the catch on the pier.', { bg: 'dock', show: 'h,k,y', pos: { h: [40, 1], k: [150, -1], y: [96, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars' }),
      L('k', 'Bu da ne? Balıkların arasında parlıyor...', 'What\'s this? Something\'s shining among the fish...', { fx: 'glint', cam: [150, 86, 2.4] }),
      L('n', 'Üç kenarlı, altından bir ok ucu. Eski, ama pırıl pırıl.', 'A three-edged arrowhead of gold. Old, yet gleaming.', { cam: [158, 90, 3] }),
      L('k', 'Bizim değil bu. Geri atın denize, uğursuzluk getirir.', 'That\'s not ours. Throw it back, it brings bad luck.', { ex: { k: 'a' }, cam: [150, 80, 2] }),
      L('h', 'Dur Kalender! Deniz vermişse bir bildiği vardır. Tut şunu evladım.', 'Wait, Kalender! If the sea gave it, it knows why. Hold it, dear.', { cam: [40, 80, 2] }),
      L('n', 'İskeledeki su kovasında, kimse dokunmadan halkalar açılıyor.', 'In the bucket on the pier, rings spread on the water though no one touches it.', { cam: [96, 70, 1.5], fx: 'low' })
    ],
    mini: { type: 'choice', title: { tr: 'OK UCU', en: 'ARROWHEAD' }, q: { tr: 'Ok ucunu ne yapacaksın?', en: 'What will you do with the arrowhead?' },
      opts: [{ id: 'tezgah', tr: 'Tezgâha koy, herkes görsün', en: 'Put it on the stall for all to see' }, { id: 'cep', tr: 'Cebine at, sessizce sakla', en: 'Slip it into your pocket, quietly' }] },
    after: function (r) {
      return [
        r.id === 'tezgah' ? L('h', 'Aferin. Saklanan şey kurt yer.', 'Good. What you hide, the worms eat.', { ex: { h: 'h' } })
          : L('k', 'Sen bilirsin... Ama gece ağları bir kontrol et.', 'Suit yourself... But check the nets tonight.', { ex: { k: 't' } }),
        L('n', 'Gece ağlar ağır döner. Uzaktan, yay kirişi gibi ince bir tını geliyor.', 'At night the nets turn heavy. From afar comes a thin note, like a bowstring.', { cam: [96, 60, 1], fx: 'kopuz,noglint' })
      ];
    },
    res: function () { return { title: { tr: 'OK UCU BULUNDU', en: 'ARROWHEAD FOUND' }, rep: 2, berSet: 6, items: ['okucu'], note: { tr: 'Yarın: Uskumru Tartısı.', en: 'Tomorrow: The Mackerel Scale.' } }; }
  };
  /* 2 · Uskumru Tartısı */
  DAYS[2] = {
    title: { tr: 'Uskumru Tartısı', en: 'The Mackerel Scale' }, when: { tr: 'öğle · 1 dk', en: 'noon · 1 min' },
    open: [
      L('n', 'Öğle. Pazarda terazinin başında iki inatçı: Hacer Teyze ile Kalender.', 'Noon. Two stubborn souls at the market scale: Aunt Hacer and Kalender.', { bg: 'market', show: 'h,k,y', pos: { h: [30, 1], k: [150, -1], y: [96, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars' }),
      L('h', 'Bu kadar uskumruya bir avuç tuz fazla gelmez! Bol at, bol kalsın.', 'A handful more salt won\'t hurt this much mackerel! Pile it on.', { cam: [40, 78, 2.2] }),
      L('k', 'Bol at bol at... Denizde bir şey kalmayacak. Az tart, az sat.', 'Pile it on, pile it on... Nothing will be left in the sea. Weigh little, sell little.', { cam: [150, 78, 2.2], ex: { k: 'a' } }),
      L('y', 'Tamam, tamam. Ne fazla ne eksik: terazi karar versin.', 'All right, all right. Not too much, not too little: let the scale decide.', { cam: [96, 80, 2.4] })
    ],
    mini: { type: 'balance', title: { tr: 'TERAZİ', en: 'THE SCALE' }, hint: { tr: 'İbre kayıyor. Sağ/sol ile ortadaki yeşilde tut; çubuk dolsun.', en: 'The needle drifts. Use left/right to keep it in the green; fill the bar.' }, time: 14, hold: 4, meter: { tr: 'KEFE DENGESİ', en: 'PAN BALANCE' }, cam: [62, 74, 2.6] },
    after: function (r) {
      return [
        r.ok ? L('h', 'Tam dengede... Anam da böyle tartardı. İhtiyacın kadar, der dururdu.', 'Perfectly even... My mother weighed like that. Only as much as you need, she used to say.', { ex: { h: 'h', k: 'h' }, cam: [40, 78, 2] })
             : L('k', 'Terazi bile şaşırdı bugün. Ama söz yerinde: ihtiyacın kadar.', 'Even the scale is confused today. But the saying stands: only what you need.', { ex: { k: 'n' }, cam: [150, 78, 2] }),
        L('n', 'O gece ağlar yarı boş döner. İçinde balık yerine dev bir yılan gömleği var.', 'That night the nets return half empty. Instead of fish, a giant snake skin.', { bg: 'dock', hide: 'h,k', cam: [96, 60, 1], fx: 'low' }),
        L('n', 'Gömleğin ucunda, ok ucundakiyle aynı altın toz parlıyor.', 'On its tip glitters the same gold dust as on the arrowhead.', { fx: 'glint', cam: [158, 90, 3] })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'TERAZİ DENGEDE', en: 'THE SCALE IS EVEN' } : { tr: 'TERAZİ ŞAŞIRDI', en: 'THE SCALE WOBBLED' }, rep: r.ok ? 6 : 2, berSet: 5, items: ['gomlek'], pieces: r.ok ? ['emek'] : [], note: { tr: 'Bereket çekiliyor. Yarın: Son Levrek.', en: 'The bounty is ebbing. Tomorrow: The Last Sea Bass.' } }; }
  };
  /* 3 · Son Levrek */
  DAYS[3] = {
    title: { tr: 'Son Levrek', en: 'The Last Sea Bass' }, when: { tr: 'akşam üstü · 1 dk', en: 'late afternoon · 1 min' },
    open: [
      L('n', 'Akşam üstü. Tezgâhta tek bir levrek kaldı. Hacer ve Kalender aynı anda uzanıyor.', 'Late afternoon. One sea bass left on the stall. Hacer and Kalender reach for it at once.', { bg: 'market', show: 'h,k,y', pos: { h: [60, 1], k: [110, -1], y: [160, -1] }, cam: [85, 70, 2], cut: 1, fx: 'bars' }),
      L('k', 'Dur bakalım! O levreği ben gördüm!', 'Hold it! I saw that sea bass first!', { ex: { k: 'a', h: 'n' }, cam: [110, 78, 3], fx: 'shake' }),
      L('h', 'Sen gördün, ben tuttum! Torunum levrek sever!', 'You saw it, I grabbed it! My grandson loves sea bass!', { ex: { h: 'a' }, cam: [60, 78, 3], fx: 'shake' }),
      L('n', 'Sesler yükseliyor; pazar yeri susmuş, herkes seni izliyor.', 'Voices rise; the market falls silent, everyone watches you.', { cam: [96, 64, 1.4] })
    ],
    mini: { type: 'choice', title: { tr: 'NE YAPACAKSIN?', en: 'WHAT WILL YOU DO?' }, q: { tr: 'Kavga büyümeden...', en: 'Before the fight grows...' },
      opts: [{ id: 'gir', tr: 'Araya gir, sakinleştir', en: 'Step in and calm them' }, { id: 'bol', tr: 'Levreği ikiye böl', en: 'Cut the sea bass in two' }, { id: 'zabita', tr: 'Zabıtaya haber ver', en: 'Call the market warden' }] },
    mini2: function (r) { return r.id === 'gir' ? { type: 'bar', title: { tr: 'SAKİNLEŞTİR', en: 'CALM THEM' }, hint: { tr: 'İmleç yeşildeyken DUR. Üç deneme, bir tam isabet yeter.', en: 'STOP while the cursor is in the green. Three tries, one hit will do.' }, tries: 3, need: 1, speed: 1.2, zone: 0.16, cam: [85, 74, 2.4] } : null; },
    after: function (r, r2) {
      var a = r.id === 'gir' ? (r2 && r2.ok ? L('n', 'Tam zamanında araya girdin. İkisi de bir an durdu, sonra güldü.', 'You stepped in just in time. Both froze, then burst out laughing.', { ex: { h: 'h', k: 'h' } }) : L('n', 'Biraz geç kaldın ama sesin yetti. Levrek Hacer\'e, gönül Kalender\'e.', 'A bit late, but your voice carried. The fish to Hacer, the goodwill to Kalender.', { ex: { h: 'n', k: 'n' } }))
        : r.id === 'bol' ? L('n', 'Levreği tam ortadan böldün. Kimse fazla almadı, kimse eksik kalmadı.', 'You cut the sea bass right down the middle. Nobody got more, nobody less.', { ex: { h: 'n', k: 'n' } })
        : L('n', 'Zabıta geldi, ikisini de uyardı. Pazar sustu; tezgâhın sözü sert ama net.', 'The warden came and warned them both. The market hushed; your stall\'s word is stern but clear.', { ex: { h: 't', k: 't' } });
      return [a,
        L('n', 'Kalabalık dağılırken sahil çamurunda bir şey fark ediyorsun: insan boyunda, yalın ayak bir iz.', 'As the crowd scatters you notice something in the shore mud: a barefoot footprint, big as a man.', { bg: 'dock', hide: 'h,k', cam: [96, 60, 1] }),
        L('n', 'İzin yanında ok ucunun birebir eşi. İz denize değil, karaya, höyüğe doğru gidiyor.', 'Beside it, the twin of the arrowhead. The prints lead not to the sea, but inland, to the mound.', { fx: 'glint', cam: [158, 90, 3] })];
    },
    res: function (r, r2) {
      var b = r.id === 'gir' ? 'baris' : r.id === 'bol' ? 'adil' : 'sert';
      return { title: { tr: 'PAZARDA SÜKÛN', en: 'PEACE AT THE MARKET' }, rep: r.id === 'gir' && r2 && r2.ok ? 8 : 5, berSet: 5, buffs: [{ id: b, lv: 1 }], items: ['okucu2'], note: { tr: 'Yarın: Ağdaki Yunus.', en: 'Tomorrow: The Dolphin in the Net.' } };
    }
  };
  /* 4 · Ağdaki Yunus */
  DAYS[4] = {
    title: { tr: 'Ağdaki Yunus', en: 'The Dolphin in the Net' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah. Ağ çırpınıyor: bir yunus dolanmış, panik içinde.', 'Morning. The net thrashes: a dolphin is tangled, panicking.', { bg: 'dock', show: 'd,k,y', pos: { k: [40, 1], y: [96, 1] }, cam: [110, 76, 1.6], cut: 1, fx: 'bars,splash' }),
      L('k', 'Kesin şu ağı, balığı kurtarın! Yunus sonra gider.', 'Cut the net, save the fish! The dolphin can go after.', { ex: { k: 'a' }, cam: [40, 78, 2] }),
      L('y', 'Dur! Ağı kesersek yunus da boğulur. Düğümleri sırayla çözelim.', 'Wait! If we cut it the dolphin chokes. Let\'s untie the knots in order.', { cam: [96, 80, 2.4] }),
      L('n', 'Hangi ip hangisinin üstünde? İyi bak; sıra bir an sonra kaybolacak.', 'Which rope lies over which? Look closely; the order vanishes in a moment.', { cam: [120, 80, 2.6] })
    ],
    mini: { type: 'order', title: { tr: 'DÜĞÜM ÇÖZ', en: 'UNTIE THE KNOTS' }, hint: { tr: 'Sırayı ezberle (2 sn), sonra ipleri aynı sırayla çöz. Yunus huzursuzlandıkça süre kısalır.', en: 'Memorise the order (2 s), then untie in the same order. Time shrinks as the dolphin panics.' },
      items: [{ id: 'kirmizi', tr: 'KIRMIZI', en: 'RED', c: '#d94a4a' }, { id: 'mavi', tr: 'MAVİ', en: 'BLUE', c: '#3f7fc0' }, { id: 'sari', tr: 'SARI', en: 'YELLOW', c: '#e4b94a' }, { id: 'yesil', tr: 'YEŞİL', en: 'GREEN', c: '#3fa56a' }].map(function (q) { return { id: q.id, t: { tr: q.tr, en: q.en }, c: q.c }; }),
      answer: ['sari', 'kirmizi', 'yesil', 'mavi'], memo: 2, time: 12, meter: { tr: 'YUNUSUN SABRI', en: 'DOLPHIN\'S CALM' }, cam: [120, 80, 2.4] },
    after: function (r) {
      return [
        r.ok ? L('n', 'Son düğüm de çözüldü. Yunus bir an durup gözlerinin içine bakıyor.', 'The last knot comes loose. The dolphin pauses and looks you in the eye.', { fx: 'splash' })
             : L('n', 'Sıra karıştı ama Kalender koşup yardım etti; yunus sonunda kurtuldu.', 'You mixed up the order, but Kalender rushed to help; the dolphin finally slipped free.', { fx: 'splash', ex: { k: 'n' } }),
        L('d', '...Iiik!', '...Eeek!', { cam: [120, 76, 3] }),
        L('n', '"Geri geleceğim" der gibi. Denizin ışığı bir an altın yeşili oluyor; yunus derine dalıyor.', 'As if saying "I\'ll be back". The sea glows gold-green for a moment; the dolphin dives deep.', { hide: 'd', fx: 'gold', cam: [96, 60, 1] })
      ];
    },
    res: function (r) { return { title: { tr: 'YUNUS KURTULDU', en: 'THE DOLPHIN IS FREE' }, rep: r.ok ? 6 : 3, berSet: 6, note: { tr: 'Kurtarma bir yanıt: deniz biraz yumuşadı. Yarın: Höyüğün Hikâyesi.', en: 'A rescue is an answer: the sea softened a little. Tomorrow: The Tale of the Mound.' } }; }
  };
  /* 5 · Höyüğün Hikâyesi */
  DAYS[5] = {
    title: { tr: 'Höyüğün Hikâyesi', en: 'The Tale of the Mound' }, when: { tr: 'gün batımı · 1 dk', en: 'sunset · 1 min' },
    open: [
      L('n', 'Temel Dede seni koyun arkasındaki höyüğe çıkarıyor. Balbal taşları gölge salıyor.', 'Grandpa Temel takes you up the mound behind the cove. The balbal stones cast long shadows.', { bg: 'mound_dusk', show: 't,y', pos: { t: [120, -1], y: [80, 1] }, cam: [100, 60, 1], cut: 1, fx: 'bars' }),
      L('t', 'Çok eskiden bu topraklarda yarı kadın, yarı yılan bir ana yaşarmış derler.', 'They say that long ago a mother, half woman and half serpent, lived in these lands.', { cam: [120, 76, 2.4] }),
      L('t', 'Oğullarına bir yay bırakmış: "Bu yayı geren, bu kemeri kuşanan kalsın bu toprakta."', 'She left her sons a bow: "Who draws this bow and girds this belt, let him keep this land."', { fx: 'kopuz' }),
      L('t', 'Yunanlı bir yazıcı da böyle bir şey yazmış, ama o bizim ağzımızdan duymadı. Hadi, şu toprağı bir temizle.', 'A Greek writer wrote something like it, but he never heard it from our lips. Come, clear that soil.', { cam: [45, 86, 2.6] })
    ],
    mini: { type: 'scrub', title: { tr: 'FIRÇALA', en: 'BRUSH' }, hint: { tr: 'Parmağını/fareyi sürükleyerek toprağı temizle. Altında bir şey var.', en: 'Drag your finger/mouse to clear the soil. Something lies beneath.' }, time: 16, need: 0.7 },
    after: function (r) {
      return [
        L('n', r.ok ? 'Toprak kalkınca ok ucunun bir eşi, yanında da uzun bir yay izi çıkıyor.' : 'Toprak tam kalkmasa da bir ok ucu ve bir yay izi seçiliyor.', r.ok ? 'As the soil lifts, another arrowhead appears, and beside it the long imprint of a bow.' : 'Even with soil left, an arrowhead and the imprint of a bow show through.', { fx: 'ding' }),
        L('t', 'Gördün mü? Masal değilmiş.', 'You see? It was no fairy tale.', { ex: { t: 's' }, cam: [120, 76, 2.4] }),
        L('n', 'Gün batarken höyüğün tepesinde uzun bir siluet: kırmızı sivri başlıklı, yaylı. Yaklaşınca kayboluyor.', 'At sunset, a tall silhouette on the mound top: pointed red cap, a bow. It vanishes as you approach.', { show: 'a', sit: { a: 0 }, pos: { a: [160, -1] }, cam: [150, 60, 1.6], fx: 'low' }),
        L('n', 'Oturduğu taşın oyuğunda soğumuş bir kap. Bekçi aç.', 'In the hollow of the stone where it sat: a bowl gone cold. The watchman is hungry.', { hide: 'a', cam: [150, 80, 2.6] })
      ];
    },
    res: function (r) { return { title: { tr: 'HÖYÜK KONUŞTU', en: 'THE MOUND SPOKE' }, rep: r.ok ? 5 : 3, berSet: 6, items: ['yayizi'], note: { tr: 'Yarın akşam höyüğe sıcak bir sofra götür. Yarın: Bekçiye Sofra.', en: 'Bring a warm meal to the mound tomorrow evening. Tomorrow: A Meal for the Watchman.' } }; }
  };
  /* 6 · Bekçiye Sofra (prototipten) */
  DAYS[6] = {
    title: { tr: 'Bekçiye Sofra', en: 'A Meal for the Watchman' }, when: { tr: 'akşam üstü · 1 dk', en: 'late afternoon · 1 min' },
    open: [
      L('n', 'Akşam üstü. Höyüğün yanındaki yabancı üç gündür aynı kayanın üstünde oturuyor.', 'Late afternoon. The stranger by the mound has sat on the same rock for three days.', { bg: 'mound', show: 'a,y', sit: { a: 1 }, pos: { a: [130, -1], y: [98, 1] }, ex: { a: 't', y: 'n' }, p: { a: 'knees', y: 'idle' }, cam: [96, 60, 1], cut: 1, fx: 'bars,steam' }),
      L('y', 'Üç gündür tek lokma yemedi. Hacer Teyze\'nin tenceresinden bir kase güveç kimseye zarar vermez.', 'He hasn\'t eaten a bite in three days. A bowl of stew from Aunt Hacer\'s pot won\'t hurt anyone.', { cam: [98, 80, 3] }),
      L('n', 'Kaseyi alıp yabancıya yürüdün. Güveç hâlâ sıcak.', 'You take the bowl to the stranger. The stew is still warm.', { it: { y: 'bowl' }, p: { y: 'reach' }, cam: [112, 82, 2] }),
      L('a', '…Yemek. Nöbette yenmez. Nöbette yalnız beklenir.', '…Food. One does not eat on watch. On watch, one only waits.', { cam: [130, 80, 3] }),
      L('y', 'Nöbet dediğin yemeksiz tutulmaz. Bozkırda da böyle değil miydi?', 'No watch is kept on an empty stomach. Wasn\'t it so on the steppe?', { cam: [98, 80, 3] }),
      L('a', '…Bozkır. Yıllardır kimse o sözü ağzına almadı.', '…The steppe. No one has spoken that word in years.', { ex: { a: 's' }, cam: [130, 80, 3] }),
      L('n', 'Temel Dede\'nin dediği aklına geliyor: bozkır misafirine önce tuz, sonra ekmek, en son sıcak yemek sunulur.', 'You recall Grandpa Temel\'s words: a steppe guest is offered salt first, then bread, and last the hot meal.', { ex: { a: 't' }, cam: [112, 80, 2] })
    ],
    mini: { type: 'order', title: { tr: 'SOFRA KUR', en: 'SET THE MEAL' }, hint: { tr: 'Bozkır âdeti: önce tuz, sonra ekmek, en son sıcak yemek. Yemek soğumadan üç şeyi sırayla koy.', en: 'Steppe custom: salt, then bread, then the hot meal. Set three things in order before it cools.' },
      items: [['tuz', 'TUZ', 'SALT', '#f2f2f2'], ['ekmek', 'EKMEK', 'BREAD', '#d9a85a'], ['cay', 'ÇAY', 'TEA', '#b5451e'], ['guvec', 'GÜVEÇ', 'STEW', '#b5652e'], ['kasik', 'KAŞIK', 'SPOON', '#9aa0aa']].map(function (q) { return { id: q[0], t: { tr: q[1], en: q[2] }, c: q[3] }; }),
      answer: ['tuz', 'ekmek', 'guvec'], time: 16, meter: { tr: 'YEMEK', en: 'MEAL' }, cam: [112, 84, 2] },
    after: function (r) {
      var pre = r.ok ? [L('n', 'Sırayı bozmadan kurdun. Yabancı bir an gözlerini kapattı.', 'You set it without breaking the order. The stranger closes his eyes for a moment.', { fx: 'ding', ex: { a: 'h' }, cam: [130, 80, 3] }), L('a', 'Tuz, ekmek, sonra ateş. Anamın sofrası böyleydi.', 'Salt, bread, then fire. My mother\'s table was like this.')]
        : [L('n', 'Sıra karıştı, yemek de biraz soğudu. Ama niyet belliydi.', 'The order slipped and the food cooled a little. But your intent was clear.', { cam: [130, 80, 3] }), L('a', 'Sıra yanlış, yemek soğuk... Ama kimse bana kase uzatmamıştı.', 'Wrong order, cold food... But no one had ever offered me a bowl.', { ex: { a: 'h' } })];
      return pre.concat([
        L('n', 'Kaseyi iki eliyle aldı. Bir kaşık, bir kaşık daha.', 'He takes the bowl with both hands. One spoonful, then another.', { it: { y: null, a: 'bowl' }, p: { y: 'idle', a: 'hold' }, ex: { a: 'h' }, cam: [124, 82, 3], fx: 'eat' }),
        L('a', 'Adım Alp Er Tunga. Yayı bu kıyıda gerdiğim günden beri nöbetteyim.', 'My name is Alp Er Tunga. I have kept watch since the day I drew my bow on this shore.', { fx: 'noeat', it: { a: null }, p: { a: 'knees' }, cam: [130, 80, 3] }),
        L('y', 'Nöbet kimin için?', 'Whose watch?', { cam: [98, 80, 3] }),
        L('a', 'Anam için. Dipte yaşar. Yılanların şahı derler ona: Şahmeran.', 'My mother\'s. She dwells below. They call her the queen of serpents: Shahmeran.', { cam: [130, 80, 3], fx: 'kopuz' }),
        L('a', 'Söz unutuldu, ağıtım susuldu. Bereket çekiliyor. Yarın yayı nasıl gerdiğimi de anlatırım.', 'The promise was forgotten, my lament fell silent. The bounty ebbs. Tomorrow I\'ll show you how I draw the bow.', { ex: { a: 't' } }),
        L('n', 'Ağlardaki balıkların nereye gittiğini ilk kez anladın.', 'For the first time you understand where the fish in your nets have gone.', { cam: [96, 60, 1], fx: 'nosteam' })
      ]);
    },
    res: function (r, r2, ctx) {
      var kit = ctx && ctx.kitchen;
      return { title: r.ok ? { tr: 'SOFRA KURULDU', en: 'THE MEAL IS SET' } : { tr: 'SOĞUK SOFRA', en: 'A COLD MEAL' }, rep: (r.ok ? 8 : 4) + (kit ? 2 : 0), ber: r.ok ? 2 : 1, buffs: [{ id: 'muhafiz', lv: r.ok ? 1 : 0.5 }],
        note: kit ? { tr: 'Güveç kendi mutfağından: +2 itibar. Yarın: Yay ve Kemer.', en: 'The stew came from your own kitchen: +2 reputation. Tomorrow: The Bow and the Belt.' } : { tr: 'Yarın: Yay ve Kemer.', en: 'Tomorrow: The Bow and the Belt.' } };
    }
  };
  /* 7 · Yay ve Kemer */
  DAYS[7] = {
    title: { tr: 'Yay ve Kemer', en: 'The Bow and the Belt' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah. Alp Er Tunga koyda, yalnız sana gösteriyor: yayı kemerine bağlı.', 'Morning. Alp Er Tunga is at the cove, showing only you: the bow hangs from his belt.', { bg: 'dock', show: 'a,y', sit: { a: 0 }, pos: { a: [130, -1], y: [80, 1] }, ex: { a: 'n' }, p: { a: 'idle' }, cam: [110, 60, 1.2], cut: 1, fx: 'bars' }),
      L('a', 'Anamın oğulları arasında bu yayı gerip kemeri kuşanan bendim. Anam bunu hiç unutmaz.', 'Among my mother\'s sons, I was the one who drew this bow and girded the belt. She never forgets it.', { cam: [130, 78, 2.6] }),
      L('a', 'Şimdi sen dene. Hedef değil; denizde bir ışık var, oraya at.', 'Now you try. Not a target; there\'s a light on the sea, shoot there.', { it: { y: 'bow' }, p: { y: 'bow' }, cam: [96, 70, 1.6] })
    ],
    mini: { type: 'bar', title: { tr: 'YAYI GER', en: 'DRAW THE BOW' }, hint: { tr: 'Gösterge yeşile gelince bırak. Üç deneme.', en: 'Release when the gauge is in the green. Three tries.' }, tries: 3, need: 1, speed: 1.4, zone: 0.14, onHit: function () { FX.bow(); } },
    after: function (r) {
      return [
        r.ok ? L('n', 'Ok ışığa değdiğinde deniz bir an açılır gibi oluyor.', 'When the arrow touches the light, the sea seems to open for a moment.', { fx: 'gold', cam: [150, 64, 2] })
             : L('a', 'Kiriş seni sınadı; sen de onu. Ok yine senin olsun.', 'The string tested you, and you tested it. Keep the arrow anyway.', { ex: { a: 'h' }, cam: [130, 78, 2.6] }),
        L('a', 'Bu okla anam seni tanır. Yarın bir haberci gelecek.', 'With this arrow my mother will know you. Tomorrow a messenger will come.', { it: { y: null }, p: { y: 'idle' }, cam: [130, 78, 2.6] }),
        L('n', 'Ertesi sabah iskelede bir yunus bekliyor.', 'The next morning a dolphin waits by the pier.', { show: 'd', hide: 'a', cam: [110, 76, 1.6] })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'ALTIN OK', en: 'GOLDEN ARROW' } : { tr: 'KİRİŞ SINADI', en: 'THE STRING TESTED YOU' }, rep: r.ok ? 7 : 4, buffs: [{ id: 'altinok', lv: r.ok ? 1 : 0.5 }], items: ['altinok'], note: { tr: 'Yarın: Şahmeran.', en: 'Tomorrow: Shahmeran.' } }; }
  };
  /* 8 · Şahmeran */
  DAYS[8] = {
    title: { tr: 'Şahmeran', en: 'Shahmeran' }, when: { tr: 'denizin dibi · 1,5 dk', en: 'beneath the sea · 1.5 min' },
    open: [
      L('n', 'Yunus seni aşağı çekiyor. Işık yeşilleşiyor, ses kısılıyor.', 'The dolphin pulls you down. The light turns green, sounds grow faint.', { bg: 'cave', show: 'y', hide: 'd', pos: { y: [60, 1] }, cam: [96, 60, 1], cut: 1, fx: 'bars,deep' }),
      L('n', 'Dipte uzun, sakin bir mağara. Ortasında pullu bir kuyruk kıvrılıyor.', 'Below, a long, quiet cave. In its heart, a scaled tail coils.', { show: 's', pos: { s: 130 }, cam: [130, 70, 1.8] }),
      L('s', 'Herkes benden bir şey ister. Sen oğlumun sofrasını kurdun.', 'Everyone wants something from me. You set my son\'s table.', { cam: [130, 74, 2.6] }),
      L('s', 'Acele etme. Denizin dibinde zaman ağır akar.', 'Do not hurry. At the bottom of the sea, time flows slowly.')
    ],
    mini: { type: 'talk', title: { tr: 'SAKİN SÖYLEŞİ', en: 'A QUIET TALK' }, hint: { tr: 'Aceleci olma; sakin ve dürüst cevaplar göstergeyi doldurur.', en: 'Don\'t rush; calm, honest answers fill the gauge.' }, meter: { tr: 'HUZUR', en: 'CALM' },
      qs: [
        { q: { tr: 'Denizden ne istersin?', en: 'What do you want from the sea?' }, o: [{ tr: 'İhtiyacım kadar balık.', en: 'Only as much fish as I need.', v: 2 }, { tr: 'Daha çok, daha çok!', en: 'More, and more!', v: 0 }, { tr: 'Bilmiyorum... ailemi doyurmak.', en: 'I don\'t know... to feed my family.', v: 1 }] },
        { q: { tr: 'Oğlumu neden doyurdun?', en: 'Why did you feed my son?' }, o: [{ tr: 'Açtı. Başka sebep gerekmez.', en: 'He was hungry. No other reason is needed.', v: 2 }, { tr: 'Bir karşılık umdum.', en: 'I hoped for something in return.', v: 0 }, { tr: 'Hacer Teyze öyle öğretti.', en: 'Aunt Hacer taught me so.', v: 1 }] },
        { q: { tr: 'Yerimi kimseye söyler misin?', en: 'Will you tell anyone where I dwell?' }, o: [{ id: 'soz', tr: 'Söylemem. Söz.', en: 'I won\'t. I promise.', v: 2 }, { id: 'yok', tr: 'Söz veremem; ama deneyeceğim.', en: 'I can\'t promise; but I\'ll try.', v: 1 }] }
      ] },
    after: function (r) {
      return [
        r.last === 'soz' ? L('s', 'Sözünü aldım. Söz, denizden ağırdır.', 'I have your word. A promise weighs more than the sea.', { fx: 'gold' })
                         : L('s', 'Dürüst bir cevap. Yine de bil: bir gün sorulacak.', 'An honest answer. Still, know this: one day it will be asked.', { fx: 'low' }),
        L('s', 'Bir gün biri gelecek; sana tatlı sözle, hasta diye. Hatırla.', 'One day someone will come, with sweet words, saying he is sick. Remember.', { cam: [130, 70, 3] }),
        L('n', 'Yüzeye çıkarken yunus kulağına bir ad fısıldıyor: Cemşab.', 'As you rise, the dolphin whispers a name in your ear: Jamshab.', { hide: 's', show: 'd', pos: { d: 100 }, cam: [96, 60, 1] })
      ];
    },
    res: function (r) { return { title: { tr: 'DİPTEKİ SÖZ', en: 'THE PROMISE BELOW' }, rep: r.ok ? 8 : 5, buffs: [{ id: 'denizsozu', lv: 1 }], pieces: ['sir'], flags: { promise: r.last === 'soz' ? 'given' : 'try' }, note: { tr: 'Yarın: Hasta Vezir.', en: 'Tomorrow: The Sick Vizier.' } }; }
  };
  /* 9 · Hasta Vezir */
  DAYS[9] = {
    title: { tr: 'Hasta Vezir', en: 'The Sick Vizier' }, when: { tr: 'öğleden sonra · 1 dk', en: 'afternoon · 1 min' },
    open: [
      L('n', 'Kış elbiseli, yüzü solgun bir adam pazara geliyor. Öksürüyor, elinde ağır bir para kesesi.', 'A pale man in winter clothes comes to the market. He coughs, a heavy purse in his hand.', { bg: 'market', show: 'v,y', pos: { v: [140, -1], y: [80, 1] }, it: { v: 'purse' }, cam: [110, 64, 1.4], cut: 1, fx: 'bars' }),
      L('v', 'Hayatım yılanların şahının elinde. Onu bulan, dilediğini alır.', 'My life lies in the hands of the serpent queen. Whoever finds her may name his price.', { cam: [140, 76, 2.6] }),
      L('v', 'Sen bu koyda yaşıyorsun... Bir şey duydun mu? Gözlerime bak.', 'You live in this cove... Have you heard anything? Look me in the eye.', { ex: { v: 'a' } })
    ],
    mini: { type: 'balance', title: { tr: 'GÖZ GÖZE', en: 'EYE TO EYE' }, hint: { tr: 'Vezirin şüphesi sağa sola kayıyor. Sakin kal: ibreyi ortada tut.', en: 'The vizier\'s suspicion swings. Stay calm: keep the needle centred.' }, time: 13, hold: 4, wild: 1.5, meter: { tr: 'VEZİRİN ŞÜPHESİ', en: 'VIZIER\'S SUSPICION' }, cam: [110, 76, 2] },
    after: function (r) {
      return [
        r.ok ? L('v', 'Hmm... Sen bir şey bilmiyorsun galiba. Yine de bekleyeceğim.', 'Hmm... You don\'t seem to know anything. I\'ll wait all the same.', { ex: { v: 'n' } })
             : L('v', 'Gözlerin kaçtı. Bir şey biliyorsun. Bekleyeceğim, sabırlıyım.', 'Your eyes wavered. You know something. I\'ll wait; I am patient.', { ex: { v: 'a' } }),
        L('n', 'Vezir gitmiyor; tezgâhların yakınına kendine bir konak kurduruyor.', 'The vizier doesn\'t leave; he has a lodge set up near the stalls.', { cam: [96, 60, 1] }),
        L('n', 'Geceleri gölgede bir şeyler yazıyor. Alp Er Tunga höyükten inmiyor.', 'At night he writes in the shadows. Alp Er Tunga does not come down from the mound.', { fx: 'low' })
      ];
    },
    res: function (r) { return { title: r.ok ? { tr: 'SIR SAKLANDI', en: 'THE SECRET HELD' } : { tr: 'VEZİR ŞÜPHELENDİ', en: 'THE VIZIER SUSPECTS' }, rep: r.ok ? 5 : 2, ber: -2, flags: { vizier: 1 }, note: { tr: 'Vezirin arayışı bile denizi huzursuz ediyor. Yarın: Fener Gecesi.', en: 'Even the vizier\'s search unsettles the sea. Tomorrow: The Lantern Night.' } }; }
  };
  /* 10 · Fener Gecesi — tek gerçek seçim */
  DAYS[10] = {
    title: { tr: 'Fener Gecesi', en: 'The Lantern Night' }, when: { tr: 'gece · 1,5 dk', en: 'night · 1.5 min' },
    open: [
      L('n', 'Gece. Vezir iskelenin ucunda, elinde fenerle seni bekliyor. Rüzgâr kayalıklarda uğulduyor.', 'Night. The vizier waits at the end of the pier, lantern in hand. Wind howls in the rocks.', { bg: 'rocks', show: 'v,y', pos: { v: [140, -1], y: [70, 1] }, it: { v: 'lantern', y: 'lantern' }, cam: [100, 64, 1.3], cut: 1, fx: 'bars,wind' }),
      L('v', 'Fenerini kayalıklardan geçir, konuşalım. Sönmesin; karanlıkta yalan kolaydır.', 'Carry your lantern across the rocks and let\'s talk. Don\'t let it die; lies come easy in the dark.', { cam: [140, 76, 2.4] })
    ],
    mini: { type: 'lantern', title: { tr: 'FENERİ KORU', en: 'SHIELD THE LANTERN' }, hint: { tr: 'Rüzgâr gelince basılı tut; sakinken bırak ki alev nefes alsın.', en: 'Hold when the wind comes; let go when calm so the flame can breathe.' }, time: 15, cam: [80, 76, 2.4] },
    mini2: function () {
      return { type: 'choice', title: { tr: 'SÖZ', en: 'THE PROMISE' }, q: { tr: 'Vezir: "Tezgâh, itibar, altın... Hepsi senin. Tek bir şey söyle: Şahmeran nerede?"', en: 'The vizier: "Stalls, fame, gold... All yours. Just tell me one thing: where is Shahmeran?"' },
        opts: [{ id: 'tut', tr: 'Sözümü tutarım. Söylemem.', en: 'I keep my word. I won\'t tell.' }, { id: 'boz', tr: '...Denizin dibinde, höyüğün altında.', en: '...Beneath the sea, below the mound.' }] };
    },
    pre2: function () { return [L('v', 'Fenerin yanıyor. İyi. Şimdi teklifimi dinle.', 'Your lantern still burns. Good. Now hear my offer.', { cam: [140, 76, 2.6] }), L('n', 'Arkada, kayalıkta Alp Er Tunga yayını germeden bekliyor. Kararı sana bırakıyor.', 'Behind, on the rocks, Alp Er Tunga waits with his bow undrawn. He leaves the choice to you.', { show: 'a', sit: { a: 0 }, pos: { a: [20, 1] }, cam: [60, 64, 1.6] })]; },
    after: function (r, r2) {
      return r2.id === 'tut' ? [
        L('v', '...Demek öyle. Anladım.', '...So be it. I understand.', { ex: { v: 't' } }),
        L('n', 'Vezir öfkelenmeden çekiliyor. Koy bir gece huzursuz; ama söz yerinde.', 'The vizier withdraws without anger. The cove is restless for a night; but the promise holds.', { hide: 'v', cam: [96, 60, 1] }),
        L('n', 'Alp Er Tunga yayını indiriyor.', 'Alp Er Tunga lowers his bow.', { ex: { a: 'h' } })
      ] : [
        L('v', 'Teşekkürler. Şifam artık yakın.', 'Thank you. My cure is near.', { ex: { v: 'h' } }),
        L('n', 'Vezir güneş doğmadan kayalara iniyor. Şahmeran derinlere çekiliyor; Alp Er Tunga susuyor.', 'The vizier climbs down to the rocks before dawn. Shahmeran withdraws into the deep; Alp Er Tunga falls silent.', { hide: 'v', fx: 'deep', cam: [96, 60, 1] }),
        L('n', 'Kimse ölmüyor. Yalnız deniz sessizleşiyor.', 'No one dies. Only the sea grows quiet.', { ex: { a: 't' } })
      ];
    },
    res: function (r, r2) {
      var keep = r2.id === 'tut';
      return { title: keep ? { tr: 'SÖZ TUTULDU', en: 'THE PROMISE KEPT' } : { tr: 'SÖZ BOZULDU', en: 'THE PROMISE BROKEN' }, rep: keep ? 10 : 3, berSet: keep ? 5 : 3, flags: { promise: keep ? 'kept' : 'broken' },
        note: keep ? { tr: 'Yarın koy toplanacak. Ağıt söylenecek.', en: 'Tomorrow the cove gathers. The lament will be sung.' } : { tr: 'Telafi yolu açık: yarın ağıtı sen başlatacaksın.', en: 'There is a way to make amends: tomorrow you will begin the lament.' } };
    }
  };
  /* 11 · Ağıt Gecesi */
  var AGIT = {
    kept: [
      L('a', 'Yüzyıllardır bu ağıdı kimse söylemedi. Bu gece duymak istiyorum.', 'For centuries no one has sung this lament. Tonight I want to hear it.', { cam: [96, 70, 2] })
    ],
    broken: [
      L('n', 'Koy sessiz. Alp Er Tunga konuşmuyor. Ağıdı sen başlatmalısın.', 'The cove is silent. Alp Er Tunga does not speak. You must begin the lament.', { ex: { a: 't' }, cam: [96, 70, 2] })
    ]
  };
  DAYS[11] = {
    title: { tr: 'Ağıt Gecesi', en: 'The Night of the Lament' }, when: { tr: 'gece · 1,5 dk', en: 'night · 1.5 min' },
    open: function (ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return [
        L('n', 'Höyüğün dibinde bütün koy toplanmış: Hacer çorba getirmiş, Kalender meşale, Temel Dede kopuz.', 'The whole cove gathers at the foot of the mound: Hacer brought soup, Kalender a torch, Grandpa Temel his kopuz.', { bg: 'ritual', show: 'h,k,t,a,y', sit: { a: 0 }, pos: { h: [30, 1], k: [160, -1], t: [130, -1], a: [96, 1], y: [60, 1] }, it: { t: 'kopuz', h: 'bowl' }, cam: [96, 60, 1], cut: 1, fx: 'bars' })
      ].concat(br ? AGIT.broken : AGIT.kept);
    },
    mini: { type: 'rhythm', title: { tr: 'AĞIT', en: 'THE LAMENT' }, hint: { tr: 'Nota çizgiye gelince vur. Ağır başlar, ninniye döner.', en: 'Strike as each note meets the line. It starts slow and turns into a lullaby.' }, bpm: 66, pattern: [0, 1, 2, 3, 5, 6, 7, 8, 10, 10.5, 11, 11.5, 12.5, 13, 13.5, 14], freqs: [294, 311, 370, 392], need: 0.55, cam: [96, 70, 1.6] },
    after: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      var song = [
        L('t', '"Kıyıda bir yay asılı, kirişi rüzgâr çalar..."', '"A bow hangs on the shore, the wind plays its string..."', { fx: 'kopuz', cam: [130, 76, 2.4] }),
        L('h', '"Dipte bir ana uyur, sözü deniz saklar..."', '"Below, a mother sleeps; the sea keeps her word..."', { cam: [30, 76, 2.4] }),
        L('a', '"Uyu anam, uyu. Bekçin yine burada."', '"Sleep, mother, sleep. Your keeper is here again."', { ex: { a: 'h' }, cam: [96, 76, 2.8] })
      ];
      return song.concat(br ? [
        L('n', 'Alp Er Tunga yeniden yay kirişine dokunuyor. Karanlıkta vezir geri dönüyor, eli boş, yüzü utançlı.', 'Alp Er Tunga touches his bowstring again. In the dark the vizier returns, empty-handed, ashamed.', { show: 'v', pos: { v: [180, -1] }, cam: [150, 70, 1.6] }),
        L('v', 'Aşağıda kimse yoktu. Yalnız soğuk ve sessizlik. Belki şifa başka yerdedir.', 'There was no one below. Only cold and silence. Perhaps the cure lies elsewhere.', { ex: { v: 't' } })
      ] : [
        L('n', 'Vezir de gelmiş; çorba masasına oturuyor. Bir kaşık, bir kaşık daha.', 'The vizier came too; he sits at the soup table. One spoonful, then another.', { show: 'v', pos: { v: [180, -1] }, cam: [150, 70, 1.6] }),
        L('v', 'Şifayı yılanların şahında aradım. Meğer sofradaymış: yemek, dinlenmek, bir koyun sıcaklığı.', 'I sought my cure from the serpent queen. It was at the table all along: food, rest, the warmth of a cove.', { ex: { v: 'h' } })
      ]).concat([L('n', 'Şafakta ufukta ilk beyaz parıltı.', 'At dawn, the first white gleam on the horizon.', { cam: [96, 60, 1], fx: 'gold' })]);
    },
    res: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return { title: { tr: 'AĞIT SÖYLENDİ', en: 'THE LAMENT IS SUNG' }, rep: (br ? 6 : 10) + (r.ok ? 4 : 0), berSet: br ? 5 : 8, pieces: ['agit'], flags: { lament: 1 }, note: { tr: 'Yarın: Bereket Sabahı.', en: 'Tomorrow: The Morning of Bounty.' } };
    }
  };
  /* 12 · Bereket Sabahı */
  DAYS[12] = {
    title: { tr: 'Bereket Sabahı', en: 'The Morning of Bounty' }, when: { tr: 'sabah · 1 dk', en: 'morning · 1 min' },
    open: [
      L('n', 'Sabah ağlar ağır geliyor: içleri hamsi, uskumru, levrek dolu.', 'In the morning the nets come up heavy: full of anchovy, mackerel, sea bass.', { bg: 'dawn_mound', show: 'y,a,h,k', sit: { a: 0 }, pos: { y: [80, 1], a: [140, -1], h: [30, 1], k: [170, -1] }, it: { h: null }, cam: [96, 60, 1], cut: 1, fx: 'bars,ding' }),
      L('n', 'Dipten bir yunus sıçrıyor. Kısa bir an, derinden bir ses: "Sözün denizden ağır geldi."', 'A dolphin leaps from the deep. For a brief moment, a voice from below: "Your word weighed more than the sea."', { show: 'd', pos: { d: 150 }, fx: 'splash', cam: [150, 70, 2] }),
      L('a', 'Yayımı höyüğe asacağım. Bundan sonra nöbeti birlikte tutarız.', 'I will hang my bow on the mound. From now on we keep watch together.', { hide: 'd', ex: { a: 'h' }, cam: [140, 76, 2.6] })
    ],
    mini: { type: 'choice', title: { tr: 'BEKÇİYE', en: 'TO THE KEEPER' }, q: { tr: 'Alp Er Tunga\'ya ne söylersin?', en: 'What do you say to Alp Er Tunga?' },
      opts: [{ id: 'sofra', tr: '"Sofran her akşam hazır."', en: '"Your table will be ready every evening."' }, { id: 'ag', tr: '"Ağıdını her yıl birlikte söyleriz."', en: '"We will sing your lament together every year."' }, { id: 'soz', tr: '"Söz, denizden ağırdır."', en: '"A promise weighs more than the sea."' }] },
    after: function (r, r2, ctx) {
      var line = r.id === 'sofra' ? L('a', 'Tuz, ekmek, sonra ateş. Unutma.', 'Salt, bread, then fire. Don\'t forget.', { ex: { a: 'h' } })
        : r.id === 'ag' ? L('a', 'O zaman anam hiç yalnız kalmaz.', 'Then my mother will never be alone.', { ex: { a: 'h' } })
        : L('a', 'Anamın sözü. Artık senin de sözün.', 'My mother\'s words. Now they are yours too.', { ex: { a: 'h' } });
      return [line,
        L('n', 'Alp Er Tunga yayını höyüğe asıyor. Koy, sözü ve ağıdı geri getirdi.', 'Alp Er Tunga hangs his bow on the mound. The cove has brought back the promise and the lament.', { fx: 'kopuz', cam: [96, 60, 1] }),
        L('n', 'Sezon bitmiyor: her yıl aynı gün, bekçi höyükte yeniden belirecek.', 'The season doesn\'t end: every year on this day, the keeper will return to the mound.', {})];
    },
    res: function (r, r2, ctx) {
      var br = ctx.flags && ctx.flags.promise === 'broken';
      return { title: { tr: 'BEREKET GERİ DÖNDÜ', en: 'THE BOUNTY RETURNS' }, rep: 20, berSet: br ? 8 : 10, buffs: [{ id: 'bekci', lv: 1 }, { id: 'muhafiz', lv: 1 }], flags: { done: 1 },
        note: br ? { tr: 'Telafi yoluyla tamamlandı. Unvanın: Dipteki Sözün Bekçisi.', en: 'Completed through amends. Your title: Keeper of the Promise Below.' } : { tr: 'Söz tutuldu. Unvanın: Dipteki Sözün Bekçisi.', en: 'The promise was kept. Your title: Keeper of the Promise Below.' } };
    }
  };

  /* ---------------- dış arayüz ---------------- */
  function open(n, host) {
    if (running) return false;
    var D = DAYS[n]; if (!D) return false;
    HOST = host || {}; LANG = HOST.lang === 'en' ? 'en' : 'tr'; onDone = HOST.onDone || null;
    CTX = { day: n, ber: HOST.ber || 6, flags: HOST.flags || {}, kitchen: !!HOST.kitchen };
    AC = HOST.audio || null; DST = HOST.dst || (AC ? AC.destination : null);
    freshState(); build(); fit(); hud(); running = true; last = performance.now(); raf = requestAnimationFrame(frame);
    el.skip.textContent = tx(UI.skip);
    el.ovk.textContent = tx(UI.story) + ' · ' + tx(UI.day) + ' ' + n + ' · ' + tx(D.when); el.ovh.textContent = tx(D.title);
    showPanel('dlg'); el.who.textContent = ''; el.txt.textContent = ''; mode = 'intro';
    setTimeout(function () {
      if (!running) return; el.ov.classList.add('off');
      var openList = typeof D.open === 'function' ? D.open(CTX) : D.open;
      play(openList, function () {
        startMini(D.mini, function (r1) {
          var go2 = D.mini2 ? D.mini2(r1, CTX) : null;
          function after(r2) { play(D.after(r1, r2, CTX), function () { var res = D.res(r1, r2, CTX); res.day = n; res.r1 = r1; res.r2 = r2 || null; if (r1.skipped || (r2 && r2.skipped)) res.skipped = true; result(res); }); }
          if (go2) { var pre = D.pre2 ? D.pre2(r1, CTX) : []; play(pre, function () { startMini(go2, after); }); }
          else after(null);
        });
      });
    }, RM ? 400 : 1600);
    return true;
  }
  window.HK_STORY = {
    days: 12, open: open, isOpen: function () { return running; }, close: function () { destroy(); },
    title: function (n, lang) { var l = LANG; LANG = lang || LANG; var t = DAYS[n] ? tx(DAYS[n].title) : ''; LANG = l; return t; },
    buffs: BUFFS, items: ITEMS, pieces: PIECES,
    _tap: tap, _skip: skip, _mode: function () { return mode; }, _mini: function () { return MG; }, _cfg: function () { return mode === 'mini' ? CFG : null; }
  };
})();
