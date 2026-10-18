/* Sunum taslak görselleri — fikir 1–5 (FIKIRLER.md, A bölümü).
   Oyunun gerçek ekranı alınır; üstüne aynı piksel dilinde yeni nesne / arayüz çizilir.
   Kullanım: node magaza/sunum/resim/uret-01-05.js [1,2,3,4,5]   (sunucu: localhost:8101) */
const { chromium } = require('/home/user/hamsi-magaza/balikci-tycoon/test-offline');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = 'http://localhost:8101/index.html';
const OUT = __dirname;
const ONLY = (process.argv[2] || '1,2,3,4,5').split(',').map(Number);

/* ---------- sayfa içi araçlar: katmanlar, piksel çizim, dünya → ekran ---------- */
function installKit() {
  const K = window.MK = {};
  const gcv = document.getElementById('game');
  K.FK = HKG.FK || 2; K.PXS = HKG.PXS;
  const mk = (id, z, blend, hi) => {
    let c = document.getElementById(id); if (c) c.remove();
    c = document.createElement('canvas'); c.id = id;
    c.width = hi ? innerWidth * 2 : gcv.width; c.height = hi ? innerHeight * 2 : gcv.height;
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:' + z + (blend ? ';mix-blend-mode:' + blend : '');
    gcv.after(c); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g;
  };
  K.reset = () => {
    K.tint = mk('mkTint', 1, 'multiply'); K.art = mk('mkArt', 1); K.lab = mk('mkLab', 3, null, true);
    let d = document.getElementById('mkUI'); if (d) d.remove();
    d = document.createElement('div'); d.id = 'mkUI'; d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:8'; document.body.appendChild(d); K.ui = d;
  };
  /* dünya → ince piksel (art katmanı) ve CSS px */
  K.w2a = (x, y, z) => { const c = BT.canvasPt(x, y, z || 0); return [Math.round(c[0] * K.FK), Math.round(c[1] * K.FK)]; };
  K.w2c = (x, y, z) => { const c = BT.canvasPt(x, y, z || 0); return [c[0] * HKG.PXS, c[1] * HKG.PXS]; };
  K.a2c = v => v * HKG.PXS / K.FK;
  K.c2a = v => Math.round(v * K.FK / HKG.PXS);
  K.px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w || 1, h || 1); };
  /* karakter haritalı sprite: '.' boş */
  K.spr = (g, x, y, rows, pal, flip) => {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.' || ch === ' ') continue; const ii = flip ? r.length - 1 - i : i; g.fillStyle = pal[ch]; g.fillRect(x + ii, y + j, 1, 1); } });
  };
  /* maske → 3 tonlu (sol üst ışık) + koyu kontur */
  K.blob = (g, ox, oy, w, h, inside, cols) => {
    const m = (i, j) => i >= 0 && j >= 0 && i < w && j < h && inside(i, j);
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
      if (m(i, j)) {
        let c = cols.mid;
        if (!m(i - 2, j - 2) || !m(i - 1, j - 1)) c = cols.lite; else if (!m(i + 2, j + 2)) c = cols.dark;
        if (cols.tex) c = cols.tex(i, j, c);
        g.fillStyle = c; g.fillRect(ox + i, oy + j, 1, 1);
      } else if (cols.line && (m(i + 1, j) || m(i - 1, j) || m(i, j + 1) || m(i, j - 1))) { g.fillStyle = cols.line; g.fillRect(ox + i, oy + j, 1, 1); }
    }
  };
  /* oyunun karakter çizimi: drawOutfitOn ile küçük tuvale, sonra art katmanına */
  K.person = (o, t, flip) => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 96; c.dataset.k = K.FK;
    BT.drawOutfitOn(c, o, t || 0);
    if (!flip) return c;
    const f = document.createElement('canvas'); f.width = 64; f.height = 96; const g = f.getContext('2d');
    g.translate(64, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return f;
  };
  K.putPerson = (g, o, ax, ay, t, flip) => { const c = K.person(o, t, flip); g.drawImage(c, Math.round(ax - 32), Math.round(ay - 92)); return c; };
  K.look = (id, i) => BT.custLook(id, i);
  /* oyunun dünya levhası (ince): lab katmanında, CSS px */
  K.label = (cx, cy, s, col, kind) => {
    const g = K.lab, D = 2, fs = kind === 2 ? 9.5 : 10;
    g.save(); g.scale(D, D); g.font = 'bold ' + fs + 'px "Pixelify Sans",ui-monospace,monospace';
    const w = Math.round(g.measureText(s).width) + 9, h = fs + 6, x = Math.round(cx - w / 2), y = Math.round(cy - h);
    g.fillStyle = 'rgba(6,16,24,.35)'; g.fillRect(x + 2, y + h, w - 3, 2);
    g.fillStyle = '#0a1a27'; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
    g.fillStyle = kind === 4 ? 'rgba(58,16,12,.96)' : kind === 1 ? 'rgba(22,44,64,.95)' : 'rgba(31,62,88,.95)'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(x + 2, y + 1, w - 4, 1);
    g.fillStyle = kind === 1 ? '#c9a15e' : '#7a9ab0'; g.fillRect(x + 2, y + 2, 2, 1); g.fillRect(x + w - 4, y + 2, 2, 1);
    g.fillStyle = col || '#f4e9d2'; g.fillText(s, x + 4.5, y + h - 5);
    g.restore(); return { x, y, w, h };
  };
  /* piksel ikon → dataURL (n×n, ölçek s) */
  K.icon = (rows, pal, s) => {
    const c = document.createElement('canvas'); s = s || 1; c.width = rows[0].length * s; c.height = rows.length * s;
    const g = c.getContext('2d'); g.scale(s, s); K.spr(g, 0, 0, rows, pal); return c.toDataURL();
  };
  K.css = s => { const st = document.createElement('style'); st.textContent = s; K.ui.appendChild(st); };
  K.html = (s) => { const d = document.createElement('div'); d.innerHTML = s; while (d.firstChild) K.ui.appendChild(d.firstChild); };
  /* 3×5 piksel harfler (tekne adı vb.) */
  const F = { A: ['010', '101', '111', '101', '101'], N: ['101', '111', '111', '111', '101'], Z: ['111', '001', '010', '100', '111'], L: ['100', '100', '100', '100', '111'], I: ['111', '010', '010', '010', '111'], H: ['101', '101', '111', '101', '101'], M: ['101', '111', '111', '101', '101'], S: ['111', '100', '111', '001', '111'], T: ['111', '010', '010', '010', '010'], V: ['101', '101', '101', '101', '010'], ' ': ['000', '000', '000', '000', '000'] };
  K.tiny = (g, x, y, s, c) => { let cx = x; for (const ch of s) { const f = F[ch] || F[' ']; f.forEach((r, j) => { for (let i = 0; i < 3; i++) if (r[i] === '1') K.px(g, cx + i, y + j, 1, 1, c); }); cx += 4; } return cx - x; };
  K.reset();
}

/* ortak pirinç/kâğıt dili (index.html'deki ince stillere uyar) */
const BASE_CSS = `
#mkUI *{box-sizing:border-box;font-family:"Pixelify Sans",ui-monospace,monospace;-webkit-font-smoothing:none}
#mkUI .mkc{position:absolute;background:linear-gradient(180deg,#1b3650 0,#183149 2px,#132a3e 70%,#10222f 100%);border:2px solid #081521;border-radius:3px;
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.16),inset -1px -1px 0 rgba(0,0,0,.38),0 4px 0 rgba(4,12,20,.5),0 8px 18px rgba(2,8,14,.38);color:#f4e9d2;overflow:hidden}
#mkUI .mkc::before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(180deg,transparent 0 3px,rgba(0,0,0,.35) 3px 4px),
  repeating-linear-gradient(90deg,#a83d2b 0 2px,#d9a441 2px 3px,#2a4c7d 3px 5px,#d9a441 5px 6px,#a83d2b 6px 8px,#f4e9d2 8px 9px)}
#mkUI .gold{color:#ffc94a} #mkUI .dim{color:#a9c0cf} #mkUI .grn{color:#5fd37a} #mkUI .red{color:#ff9b8a}
#mkUI .btn5{display:flex;align-items:center;justify-content:center;gap:4px;border:2px solid #6a4704;border-radius:3px;color:#3a2401;font-weight:bold;
  background:linear-gradient(180deg,#ffe28f 0 2px,#ffc94a 2px 50%,#f2b830 50% calc(100% - 3px),#d99a1c calc(100% - 3px));
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.45),inset -1px -1px 0 rgba(0,0,0,.18),0 2px 0 rgba(4,12,20,.45)}
#mkUI .btnG{display:flex;align-items:center;justify-content:center;gap:4px;border:2px solid #14502a;border-radius:3px;color:#0f3a1c;font-weight:bold;
  background:linear-gradient(180deg,#9af0ac 0 2px,#6fe08a 2px 45%,#58cf74 45% calc(100% - 4px),#3fae5c calc(100% - 4px));
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.35),inset -1px -1px 0 rgba(0,0,0,.2),0 2px 0 rgba(4,12,20,.45)}
#mkUI .btnB{display:flex;align-items:center;justify-content:center;gap:4px;border:2px solid #081521;border-radius:3px;color:#f4e9d2;
  background:linear-gradient(180deg,#2b5274 0 2px,#23445f 2px 50%,#1d3a52 50% calc(100% - 3px),#152c40 calc(100% - 3px));box-shadow:inset 1px 1px 0 rgba(255,255,255,.16),inset -1px -1px 0 rgba(0,0,0,.38),0 2px 0 rgba(4,12,20,.45)}
#mkUI img.px{image-rendering:pixelated;image-rendering:crisp-edges;display:inline-block}
#mkUI .say{position:absolute;background:rgba(22,44,64,.96);border:1px solid #0a1a27;border-radius:2px;color:#f4e9d2;font-weight:bold;font-size:10px;padding:3px 6px 4px;white-space:nowrap;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 2px 0 rgba(6,16,24,.35)}
`;

async function boot(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(URL); await sleep(900);
  await p.addStyleTag({ content: '#achPop,#pauseBadge,#coach,#toast,#specPop{display:none!important}' });
  await p.evaluate(() => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; });
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', 'Temel Balık Evi').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 48620; S.rep = 2400;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    BT.reassignWorkers();
    BT.day.n = 19; BT.day.phase = 'play'; BT.day.t = 40;
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  });
  await sleep(20000);
  await p.evaluate(installKit);
  return p;
}
const clean = p => p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner', 'devpanel'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); } }); HKG.v('syncPause')(); });
async function goTo(p, x, y, t) {
  await p.evaluate(([x, y, t]) => { BT.player.x = x; BT.player.y = y; if (t != null) BT.day.t = BT.DAY_LEN * t; }, [x, y, t]);
  await clean(p); await sleep(2200);
  await p.evaluate(css => { MK.reset(); MK.css(css); }, BASE_CSS);
}
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n) });

/* =====================================================================
   FİKİR 1 — Haşmet Defteri: alt çubukta 5. sekme DEFTER, açık deri defter
   ===================================================================== */
async function fikir1(p) {
  await goTo(p, 6.5, 4.5, 0.45);
  await p.evaluate(() => {
    const K = MK;
    /* 5. sekme: deri defter ikonu */
    const bookI = K.icon([
      '..kkkkkkkkkkkkk.',
      '.kbbbbbbbbbbbbbk',
      'kBbbbbbbbbbbbbbk',
      'kBbbgggggggbbbdk',
      'kBbbgyyyyygbbbdk',
      'kBbbgggggggbbbdk',
      'kBbbbbbbbbbbbbdk',
      'kBbbbbbbbbbrrbdk',
      'kBbbbbbbbbbrrbdk',
      'kBbbbbbbbbbrrbdk',
      'kBbbbbbbbbbbrbdk',
      'kBbbbbbbbbbbbbdk',
      'kBbbbbbbbbbbbbdk',
      'kpppppppppppppdk',
      '.kddddddddddddk.',
      '..kkkkkkkkkkkk..'], { k: '#2a1608', b: '#8a4f26', B: '#b06a36', d: '#5e3216', g: '#d9b45e', y: '#7a5418', r: '#c8402c', p: '#f4e6c4' }, 2);
    const bar = document.getElementById('devbar');
    bar.querySelectorAll('.dtab').forEach(b => b.classList.remove('on'));
    bar.insertAdjacentHTML('beforeend', '<button class="dtab on" data-t="defter"><i class="ci" style="background-image:url(' + bookI + ')"></i><span>DEFTER</span></button>');

    K.css(`
#mkBook{position:absolute;left:6px;right:6px;bottom:60px;height:420px;border-radius:4px;padding:7px 7px 8px 9px;
  background:repeating-linear-gradient(180deg,#7a4422 0 3px,#6e3c1d 3px 4px,#7d4624 4px 9px,#693a1c 9px 10px);
  border:2px solid #2a1608;box-shadow:inset 1px 1px 0 rgba(255,214,160,.25),inset -1px -1px 0 rgba(0,0,0,.4),0 4px 0 rgba(4,12,20,.5),0 10px 22px rgba(2,8,14,.45)}
#mkBook::after{content:"";position:absolute;inset:3px;border:1px dashed rgba(240,200,140,.45);border-radius:2px;pointer-events:none}
#mkBook .hd{display:flex;align-items:center;justify-content:space-between;margin:0 0 6px;padding:0 2px}
#mkBook .hd b{font-size:14px;color:#ffc94a;letter-spacing:1px;text-shadow:1px 1px 0 #3a1406}
#mkBook .hd small{font-size:10px;color:#f2d488;display:block;letter-spacing:.5px}
#mkBook .x{width:26px;height:26px;font-size:12px}
#mkBook .pg{position:relative;height:364px;border:2px solid #4a2a12;border-radius:2px;color:#3a2614;
  background:repeating-linear-gradient(180deg,#f4e6c4 0 15px,#d9c49a 15px 16px);box-shadow:inset 2px 0 0 #e6d2a4,inset 0 2px 0 #fff4da,inset -3px 0 0 #d6bf91}
#mkBook .pg::before{content:"";position:absolute;left:22px;top:0;bottom:0;width:1px;background:#c8402c;opacity:.55}
#mkBook .rib{position:absolute;right:16px;top:-4px;width:9px;height:46px;background:linear-gradient(90deg,#a83d2b 0 3px,#c8553d 3px 6px,#8e3324 6px);clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)}
#mkBook .sec{position:absolute;left:28px;right:8px;font-size:10px;letter-spacing:.6px;color:#7a5418;font-weight:bold}
#mkBook .ln{position:absolute;left:28px;right:10px;height:16px;display:flex;align-items:flex-end;font-size:11.5px;line-height:15px}
#mkBook .ln .n{flex:0 0 auto} #mkBook .ln .dots{flex:1;border-bottom:1px dotted #9a7a52;margin:0 4px 4px}
#mkBook .ln .v{font-weight:bold}
#mkBook .bad{display:inline-block;font-size:9.5px;font-weight:bold;color:#fff3e0;background:#a83d2b;border:1px solid #5a160c;padding:0 3px;margin-left:5px;line-height:12px;border-radius:2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
#mkBook .bad.b4{background:#7a1a10}
#mkBook .old{color:#8a6a4a;text-decoration:line-through;font-size:10.5px;margin-right:4px}
#mkBook .cd{position:absolute;right:10px;top:14px;width:100px;height:74px;border:2px solid #3a2614;border-radius:2px;background:#fff4da;text-align:center;
  box-shadow:inset -2px -2px 0 #e6d2a4,2px 2px 0 rgba(58,38,20,.25);transform:rotate(2deg)}
#mkBook .cd small{display:block;font-size:9px;color:#7a5418;margin-top:4px;letter-spacing:.4px}
#mkBook .cd b{display:block;font-size:28px;line-height:30px;color:#a83d2b;letter-spacing:1px}
#mkBook .cd i{display:block;font-style:normal;font-size:9px;color:#3a2614}
#mkBook .rc{position:absolute;height:46px;width:70px;background:#fff8e6;border:1px solid #9a7a52;font-size:8.5px;line-height:10px;padding:4px 4px;color:#3a2614;
  clip-path:polygon(0 0,100% 0,100% 88%,92% 100%,84% 88%,76% 100%,68% 88%,60% 100%,52% 88%,44% 100%,36% 88%,28% 100%,20% 88%,12% 100%,4% 88%,0 100%)}
#mkBook .rc u{position:absolute;right:3px;bottom:9px;font-size:8px;text-decoration:none;color:#2f7a3a;border:1px solid #2f7a3a;padding:0 2px;transform:rotate(-12deg);font-weight:bold}
#mkBook .pay{position:absolute;left:28px;right:10px;bottom:8px;height:38px;display:flex;gap:6px}
#mkBook .pay>div{font-size:12px}
#mkBook .note{position:absolute;right:12px;top:300px;width:170px;font-size:10px;color:#5a3e1e;line-height:12px;text-align:right;font-style:italic}
`);
    const L = (top, n, v, extra, r) => `<div class="ln" style="top:${top}px${r ? ';right:' + r + 'px' : ''}"><span class="n">${n}</span><span class="dots"></span>${extra || ''}<span class="v">${v}</span></div>`;
    K.html(`<div id="mkBook" class="mkb">
  <div class="hd"><div><b>HAŞMET DEFTERİ</b><small>19. gün · 3. hafta · Temel Balık Evi</small></div><button class="btn x" style="pointer-events:none">✕</button></div>
  <div class="pg"><div class="rib"></div>
    <div class="sec" style="top:4px">BU HAFTAKİ TAHMİNİ VERGİ</div>
    <div class="cd"><small>HAŞMET BEY GELİYOR</small><b>3 GÜN</b><i>Cuma sabahı, kasaya</i></div>
    ${L(18, 'İskele tezgâhı', '$1.240', '', 122)}
    ${L(34, 'Balık Pazarı', '$2.180', '', 122)}
    ${L(50, 'Füme Evi', '$860', '', 122)}
    ${L(66, 'Mutfak', '$1.410', '', 122)}
    <div class="ln" style="top:84px;font-weight:bold;right:122px"><span class="n">Toplam (%12)</span><span class="dots"></span><span class="v">$5.690</span></div>
    <div class="sec" style="top:116px">ESKİ BORÇLAR · FAİZİYLE</div>
    ${L(130, '2. hafta · $600', '$1.200', '<span class="old">$600</span><span class="bad">×2</span>&nbsp;')}
    ${L(146, '1. hafta · $520', '$2.080', '<span class="old">$520</span><span class="bad b4">×4</span>&nbsp;')}
    <div class="ln" style="top:164px;font-weight:bold;color:#a83d2b"><span class="n">Borç toplamı</span><span class="dots"></span><span class="v">$3.280</span></div>
    <div class="sec" style="top:198px">GEÇMİŞ MAKBUZLAR</div>
    <div class="rc" style="left:180px;top:213px;transform:rotate(1.5deg)">MAKBUZ 0471<br>3. hafta<br>$600<u style="color:#a83d2b;border-color:#a83d2b">BORÇ</u></div>
    <div class="rc" style="left:28px;top:212px">MAKBUZ 0412<br>1. hafta<br>$4.120<u>ÖDENDİ</u></div>
    <div class="rc" style="left:104px;top:216px;transform:rotate(-2deg)">MAKBUZ 0447<br>2. hafta<br>$4.880<u>ÖDENDİ</u></div>
    <div class="note">“Erken mi ödüyorsun?<br>Şüpheli…” — H.B.</div>
    <div class="pay"><div class="btn5" style="flex:1.5">ERKEN ÖDE −%10 · $8.073</div><div class="btnB" style="flex:1;font-size:11px">PLANLA</div></div>
  </div></div>`);
    /* kırmızı mühür (piksel) — borç bölümünün yanında */
    const seal = document.createElement('canvas'); seal.width = 34; seal.height = 34; const g = seal.getContext('2d');
    K.blob(g, 1, 1, 32, 32, (i, j) => { const dx = i - 15.5, dy = j - 15.5, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return r < 13.5 + Math.round(Math.sin(a * 7) * 1.4); },
      { lite: '#e0604a', mid: '#b8382a', dark: '#7e1e14', line: '#4a0c06', tex: (i, j, c) => { const r = Math.hypot(i - 15.5, j - 15.5); return (r > 8.5 && r < 10) ? '#7e1e14' : c; } });
    /* H harfi (kabartma) */
    const H = ['x...x', 'x...x', 'x...x', 'xxxxx', 'x...x', 'x...x', 'x...x'];
    K.spr(g, 15, 14, H, { x: '#6a140c' }); K.spr(g, 14, 13, H, { x: '#f08a6a' });
    seal.style.cssText = 'position:absolute;width:68px;height:68px;right:34px;top:206px;image-rendering:pixelated;transform:rotate(-14deg)';
    document.querySelector('#mkBook .pg').appendChild(seal);
  });
  await sleep(300); await shot(p, 'fikir-01.png');
  await p.evaluate(() => { const b = document.querySelector('#devbar .dtab[data-t="defter"]'); if (b) b.remove(); document.querySelectorAll('#devbar .dtab').forEach(x => x.classList.remove('on')); });
}

/* =====================================================================
   FİKİR 2 — Hava durumu: poyraz fırtınası
   ===================================================================== */
async function fikir2(p) {
  await goTo(p, 6.5, 4.5, 0.45);
  await p.evaluate(() => {
    const K = MK, g = K.art, W = g.canvas.width, H = g.canvas.height;
    const gcv = document.getElementById('game'), src = gcv.getContext('2d').getImageData(0, 0, W, H).data;
    const at = (x, y) => { const i = (y * W + x) * 4; return [src[i], src[i + 1], src[i + 2]]; };
    const isSea = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return false; const [r, gg, b] = at(x, y); return b > 110 && b > r + 60 && gg > r + 20 && b > gg; };
    /* bulutlu, soğuk ışık: çarpımlı ton (gök daha koyu) */
    const t = K.tint; t.fillStyle = '#9aa6b8'; t.fillRect(0, 0, W, H);
    let horizon = 0; for (let y = 0; y < H; y++) if (isSea(Math.round(W * 0.5), y)) { horizon = y; break; }
    t.fillStyle = '#8590a4'; t.fillRect(0, 0, W, horizon);
    /* fırtına bulutları */
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cloud = (cx, cy, w, h) => {
      const bumps = [];
      for (let k = 0; k < 6; k++) bumps.push([w * (0.12 + 0.76 * k / 5), h * 0.68, h * (0.24 + rnd() * 0.08)]);
      for (let k = 0; k < 4; k++) bumps.push([w * (0.25 + 0.5 * rnd()), h * (0.42 + rnd() * 0.12), h * (0.22 + rnd() * 0.14)]);
      bumps.push([w * (0.35 + rnd() * 0.3), h * 0.3, h * 0.26]);
      K.blob(g, cx, cy, w, h, (i, j) => j < h * 0.86 && bumps.some(([bx, by, r]) => (i - bx) ** 2 / 2.2 + (j - by) ** 2 < r * r),
        { lite: '#9aa3b0', mid: '#6f7a8a', dark: '#4a5464', line: '#323a46' });
    };
    cloud(-20, 60, 170, 46); cloud(130, 40, 150, 42); cloud(250, 70, 170, 44); cloud(40, 104, 140, 32); cloud(220, 112, 140, 30);
    /* köpüklü dalgalar */
    for (let y = horizon + 8; y < H; y += 9) {
      for (let x = ((y * 7) % 23); x < W; x += 19 + ((x * y) % 11)) {
        let ok = true; for (let dx = -2; dx < 10 && ok; dx++) for (let dy = -2; dy < 4; dy++) if (!isSea(x + dx, y + dy)) { ok = false; break; }
        if (!ok) continue;
        const L = 5 + ((x + y) % 4);
        K.px(g, x + 2, y - 1, L - 3, 1, '#f2fbff'); K.px(g, x, y, L, 1, '#cfe9f2'); K.px(g, x + L, y + 1, 2, 1, '#cfe9f2');
        K.px(g, x - 1, y + 1, L + 1, 1, '#0d3f55'); K.px(g, x + 1, y + 2, L - 1, 1, '#2f8aad');
      }
    }
    /* iskele kenarına vuran dalga sıçrantısı */
    for (let y = horizon + 4; y < H - 4; y += 3) for (let x = 2; x < W - 2; x += 3) {
      if (isSea(x, y) && !isSea(x + 3, y + 3) && !isSea(x + 6, y + 6) && ((x * 31 + y * 17) % 5 === 0)) {
        K.px(g, x, y - 2, 2, 2, '#ffffff'); K.px(g, x - 2, y - 4, 1, 1, '#cfe9f2'); K.px(g, x + 3, y - 5, 1, 1, '#e8f6fb');
      }
    }
    /* tenteler: saçak rüzgârla kalkar (kırmızı-krem saçak piksellerinden yana uzayan bez) */
    const isAw = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return 0; const [r, gg, b] = at(x, y); if (r > 160 && gg < 80 && b < 70) return 1; if (r > 225 && gg > 210 && b > 180 && b < 215) return 2; return 0; };
    const flaps = [];
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 6; x++) { const a = isAw(x, y); if (a && !isAw(x, y + 1) && !isAw(x, y + 2) && isAw(x, y - 2)) flaps.push([x, y, a]); }
    flaps.forEach(([x, y, a]) => {
      const n = 3 + ((x * 7 + y) % 3), c = a === 1 ? '#cc4430' : '#f3e9d0', d = a === 1 ? '#8e2a1e' : '#c9b78f';
      for (let k = 1; k <= n; k++) { const yy = y - Math.round(k * 0.8) + (k % 2); K.px(g, x - k, yy, 1, 1, k === n ? d : c); }
    });
    /* yağmur: poyraz, sağ üstten sola eğik */
    const R = K.lab; R.save();
    for (let k = 0; k < 520; k++) {
      const x = rnd() * 780 + 60, y = rnd() * 1688, l = 10 + rnd() * 10;
      R.fillStyle = k % 3 ? 'rgba(214,230,242,.55)' : 'rgba(240,248,255,.75)';
      for (let s = 0; s < l; s += 2) R.fillRect(Math.round(x - s * 0.5), Math.round(y + s), 2, 2);
    }
    R.restore();
    /* hava kartı: sol üst */
    const wind = K.icon([
      '....kkkk......',
      '...kwwwwk.....',
      '..kwkkkwwk....',
      '..kk...kwk....',
      'kkkkkkkkwwkkk.',
      'kwwwwwwwwwwwwk',
      'kkkkkkkkkkkkk.',
      '.kkkkkkkkkk...',
      'kwwwwwwwwwwk..',
      '.kkkkkkkkkwk..',
      '........kwk...',
      '.......kwk....',
      '........k.....'], { k: '#0a1a27', w: '#cfe9f2' }, 2);
    K.css(`#mkW{left:6px;top:78px;width:212px;padding:8px 8px 7px 8px;display:flex;gap:8px;align-items:center}
#mkW .ic{width:40px;height:40px;flex:0 0 40px;border:2px solid #081521;border-radius:3px;background:linear-gradient(180deg,#3a4a5e,#283546);display:flex;align-items:center;justify-content:center;box-shadow:inset 1px 1px 0 rgba(255,255,255,.15)}
#mkW b{display:block;font-size:15px;color:#ffc94a;letter-spacing:1.5px;text-shadow:1px 1px 0 #3a2401}
#mkW small{display:block;font-size:10.5px;margin-top:2px;letter-spacing:.3px}
#mkW em{font-style:normal;display:block;font-size:9px;color:#a9c0cf;margin-top:2px}`);
    K.html(`<div id="mkW" class="mkc"><div class="ic"><img class="px" src="${wind}" style="width:28px;height:26px"></div>
      <div><b>POYRAZ</b><small><span class="red">ağlar −%30</span> · <span class="grn">fiyat +%20</span></small><em>Fırtına · akşama dek sürecek</em></div></div>`);
    /* merdiven rozetini hava kartının altına kaydır */
    const leaf = [...document.querySelectorAll('body *')].find(e => !e.children.length && /^%\d+$/.test(e.textContent.trim()));
    let lad = leaf; while (lad && !['fixed', 'absolute'].includes(getComputedStyle(lad).position)) lad = lad.parentElement;
    if (lad) lad.style.transform = 'translateY(30px)';
  });
  await sleep(300); await shot(p, 'fikir-02.png');
}

/* =====================================================================
   FİKİR 3 — Tekne seferleri: boyalı tekne iskelede + rota kartı
   ===================================================================== */
async function fikir3(p) {
  await p.evaluate(() => { for (let i = BT.customers.length - 1; i >= 0; i--) if (BT.customers[i].spec) BT.customers.splice(i, 1); });
  await goTo(p, 3, 3, 0.45);
  await p.evaluate(() => {
    const K = MK;
    let g = K.art;
    /* tekne: yandan, Karadeniz gırgırı. ax,ay = su hattının sol ucu (ince px). L = boy */
    const boat = (ax, ay, L, opt) => {
      const hullTop = i => { const u = (i - L * 0.45) / (L * 0.55); return -Math.round(u * u * 4) - (i > L * 0.8 ? Math.round((i - L * 0.8) * 0.35) : 0); };
      const depth = i => { const u = Math.abs(i - L * 0.5) / (L * 0.5); return Math.max(2, Math.round(opt.d * (1 - Math.pow(u, 3)))); };
      const top = i => ay - opt.fb + hullTop(i);
      /* gövde */
      for (let i = 0; i < L; i++) {
        const y0 = top(i), y1 = ay + depth(i) - 3;
        for (let y = y0; y <= y1; y++) {
          const r = y - y0; let c = opt.hull;
          if (r === 0) c = '#f1ebda'; else if (r === 1) c = '#d8cfb8'; else if (r === 2) c = opt.stripe;
          else if (y >= ay - 1) c = '#7d2c1d'; else if (r === 3) c = opt.hullL; else if (y > ay - 4) c = opt.hullD;
          if (i === 0 || i === L - 1 || y === y0 - 0) { }
          K.px(g, ax + i, y, 1, 1, c);
        }
        K.px(g, ax + i, y0 - 1, 1, 1, '#1a1410'); K.px(g, ax + i, y1 + 1, 1, 1, '#1a1410');
      }
      K.px(g, ax - 1, top(0), 1, ay - top(0) + 1, '#1a1410'); K.px(g, ax + L, top(L - 1), 1, ay - top(L - 1) + 1, '#1a1410');
      /* güverte küpeştesi (biraz üstten görünüş) */
      for (let i = 2; i < L - 3; i++) K.px(g, ax + i, top(i) - 2, 1, 1, i % 6 === 0 ? '#6f4526' : '#ab7a48');
      if (opt.name) K.tiny(g, ax + Math.round(L * 0.52), ay - opt.fb + 4, opt.name, '#f1ebda');
      /* nazar (pruva) */
      const nx = ax + L - 7, ny = top(L - 7) + 4; K.px(g, nx, ny, 3, 3, '#f1ebda'); K.px(g, nx + 1, ny + 1, 1, 1, '#2a4c7d'); K.px(g, nx - 1, ny + 1, 1, 1, '#1a1410'); K.px(g, nx + 3, ny + 1, 1, 1, '#1a1410');
      /* kaptan köşkü */
      const cx = ax + Math.round(L * 0.24), cw = Math.round(L * 0.24), ch = opt.ch, cy = top(Math.round(L * 0.3)) - 2;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        let c = x > cw - 4 ? '#d8cfb8' : '#f1ebda'; if (x === 0 || y === 0) c = '#ffffff';
        if (y >= 3 && y <= 6 && (x % 6 > 1 && x % 6 < 5) && x < cw - 3) c = y === 3 ? '#9fd4e6' : '#2f6f9a';
        K.px(g, cx + x, cy - ch + y, 1, 1, c);
      }
      K.px(g, cx - 2, cy - ch - 3, cw + 4, 2, opt.roof); K.px(g, cx - 2, cy - ch - 1, cw + 4, 1, '#7d2c1d'); K.px(g, cx - 2, cy - ch - 4, cw + 4, 1, '#1a1410');
      K.px(g, cx - 1, cy - ch, 1, ch, '#1a1410'); K.px(g, cx + cw, cy - ch, 1, ch, '#1a1410');
      /* direk, bayrak, halatlar */
      const mx = ax + Math.round(L * 0.62), mtop = top(Math.round(L * 0.62)) - opt.mast;
      K.px(g, mx, mtop, 2, opt.mast, '#6f4526'); K.px(g, mx, mtop, 1, opt.mast, '#ab7a48'); K.px(g, mx - 1, mtop - 1, 4, 1, '#1a1410');
      const fl = ['rrrrrrrrrr', 'rrrwwrrrrr', 'rrwrrrwrrr', 'rrwrrwwwrr', 'rrwrrrwrrr', 'rrrwwrrrrr', 'rrrrrrrrr.'];
      K.spr(g, mx + 2, mtop + 1, opt.flag || fl, { r: '#d22a1e', w: '#ffffff' });
      for (let s = 0; s < 18; s++) { K.px(g, Math.round(mx - s * (mx - ax - 3) / 18), Math.round(mtop + 3 + s * (top(3) - mtop - 3) / 18), 1, 1, '#c9b183'); K.px(g, Math.round(mx + 1 + s * (ax + L - 2 - mx) / 18), Math.round(mtop + 3 + s * (top(L - 2) - mtop - 3) / 18), 1, 1, '#c9b183'); }
      /* kıç tarafında ağ yığını */
      if (opt.net) K.blob(g, ax + 3, top(5) - 7, 12, 7, (i, j) => (i - 6) ** 2 / 36 + (j - 7) ** 2 / 36 < 1, { lite: '#8fa58a', mid: '#5f7a63', dark: '#3e5444', line: '#1a1410', tex: (i, j, c) => (i + j) % 3 === 0 ? '#2e4034' : c });
      /* lastik usturmaçalar */
      if (opt.fender) [0.4, 0.7].forEach(f => { const fx = ax + Math.round(L * f), fy = top(Math.round(L * f)) + 3; K.px(g, fx, fy, 3, 4, '#2a2a2a'); K.px(g, fx + 1, fy + 1, 1, 2, '#555'); });
      /* su hattı: dalgacıklar gövdeyi keser */
      for (let i = -3; i < L + 4; i++) { const y = ay + ((i >> 2) % 2); K.px(g, ax + i, y, 1, 3, '#1d6c8f'); if (i % 5 < 3) K.px(g, ax + i, y, 1, 1, '#cfe9f2'); }
    };
    /* iskele kenarına yanaşmış tekne: önce düz yandan çizilir, sonra izometrik kayışla (her 2 sütunda 1 px) iskelenin uzak kenarına paralel konur */
    const ART = K.art, Wc = ART.canvas.width, Hc = ART.canvas.height;
    const src = document.getElementById('game').getContext('2d').getImageData(0, 0, Wc, Hc).data;
    const isSea = (x, y) => { if (x < 0 || y < 0 || x >= Wc || y >= Hc) return false; const i = (y * Wc + x) * 4, r = src[i], gg = src[i + 1], bb = src[i + 2]; return bb > 70 && bb > r + 40 && bb >= gg - 6; };
    /* iskele kenarı: her sütunda denizin bittiği ilk satır (ufuktan aşağı) */
    const edge = x => { let y = 200; while (y < Hc && !isSea(x, y)) y++; while (y < Hc && isSea(x, y)) y++; return y; };
    const E = []; for (let x = 70; x <= 200; x += 10) E.push([x, edge(x)]);
    console.log('edge', JSON.stringify(E));
    const og = document.createElement('canvas'); og.width = 170; og.height = 110; g = og.getContext('2d');
    const L0 = 112, AY = 92;
    boat(10, AY, L0, { fb: 12, d: 8, hull: '#2a5a9a', hullL: '#3a72b8', hullD: '#1d3f6e', stripe: '#c8402c', roof: '#b5432f', ch: 15, mast: 46, name: 'NAZLI HANIM', net: 1, fender: 1 });
    g = ART;
    /* yerleşim: kıç ucu x0'da; su hattı kenarın 9 px yukarısında, sağa doğru 1/2 eğimle yükselir */
    const x0 = 84, cand = []; for (let x = x0; x <= x0 + 100; x += 4) cand.push(edge(x) + Math.floor((x - x0) / 2));
    cand.sort((a, b) => a - b); const base = cand[cand.length >> 1] - 10;
    const od = og.getContext('2d').getImageData(0, 0, og.width, og.height).data;
    for (let i = 0; i < og.width; i++) {
      const sh = -Math.floor(i / 2);
      for (let j = 0; j < og.height; j++) {
        const k = (j * og.width + i) * 4; if (od[k + 3] < 10) continue;
        const X = x0 - 10 + i, Y = base - AY + j + sh;
        if (Y > edge(X) - 3 && !isSea(X, Y)) continue;          /* iskele önde kalır */
        ART.fillStyle = `rgba(${od[k]},${od[k + 1]},${od[k + 2]},${od[k + 3] / 255})`; ART.fillRect(X, Y, 1, 1);
      }
    }
    const ex = x0 + 40, ey = base - 20;
    /* bağlama halatı → iskele babası */
    const bx = x0 + 96, by = edge(x0 + 96) - 2;
    for (let s = 0; s <= 24; s++) { const u = s / 24; K.px(g, Math.round(x0 + 92 + u * (bx - x0 - 92)), Math.round(base - 54 + u * (by - base + 54) + Math.sin(u * Math.PI) * 4), 1, 1, s % 3 ? '#c9b183' : '#8a7550'); }
    /* seferdeki ikinci tekne (açıkta) + iz */
    const sx = K.c2a(296), sy = K.c2a(190);
    for (let k = 0; k < 26; k++) { K.px(g, sx - 4 - k * 2, sy + 1 + (k >> 2), 2, 1, k % 3 ? '#cfe9f2' : '#9fd4e6'); K.px(g, sx - 4 - k * 2, sy - 1 - (k >> 3), 1, 1, '#cfe9f2'); }
    boat(sx, sy, 46, { fb: 6, d: 4, hull: '#2f7a3a', hullL: '#3f9a4c', hullD: '#205a2a', stripe: '#f2d488', roof: '#2a4c7d', ch: 7, mast: 20, flag: ['rrrrrr', 'rwwrrr', 'rwrrrr', 'rwwrrr', 'rrrrr.'] });
    /* dünya levhaları */
    K.label(K.a2c(x0 + 50), K.a2c(base - 92), '★ Nazlı Hanım · HAZIR', '#ffc94a', 1);
    K.label(K.a2c(sx + 23), K.a2c(sy - 40), 'SEFERDE 3:42', '#9af0ac', 2);
    /* nokta nokta rota (açıklara doğru) */
    const R = K.lab; R.fillStyle = 'rgba(255,226,143,.9)';
    for (let k = 0; k < 16; k++) { const u = k / 16; R.fillRect(Math.round((K.a2c(sx + 46) + u * 70) * 2), Math.round((K.a2c(sy - 4) - u * 34 - Math.sin(u * 3) * 6) * 2), 3, 3); }
    /* rota kartı */
    const fish = (b, d) => K.icon([
      '.......kk...',
      '..kkkkkbkk..',
      '.kbbbbbbbbk.',
      'kbwkbbbbbbbk',
      'kbbbbbbbbbbk',
      '.kddddddddk.',
      '..kkkkkkdkk.',
      '.......kk...'].map(r => r), { k: '#0a1a27', b, d, w: '#ffffff' }, 2);
    const fk = fish('#e8c070', '#b88a3a'), fl = fish('#9fb8c8', '#6a8aa0'), fb = fish('#e0806a', '#b0503a');
    K.css(`#mkR{left:8px;right:8px;bottom:62px;padding:9px 9px 9px}
#mkR h3{font-size:13px;color:#ffc94a;letter-spacing:1px;text-shadow:1px 1px 0 #3a2401;margin:2px 0 6px;display:flex;justify-content:space-between;align-items:baseline}
#mkR h3 small{font-size:10px;color:#a9c0cf;letter-spacing:.3px}
#mkR .rt{display:flex;align-items:center;gap:7px;padding:6px 7px;margin-bottom:5px;border:2px solid #081521;border-left:3px solid #d9b45e;border-radius:3px;
  background:linear-gradient(180deg,#25486a 0,#1f3d56 3px,#1a3448 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
#mkR .rt.on{border-color:#ffc94a;border-left-color:#ffc94a;background:linear-gradient(180deg,#2e5a80 0,#264c6c 3px,#1f3f5a 100%)}
#mkR .rt b{font-size:12px;display:block} #mkR .rt small{font-size:10px;color:#a9c0cf}
#mkR .rt .p{margin-left:auto;text-align:right;font-size:10.5px;line-height:13px}
#mkR .tier{display:flex;gap:4px;margin:7px 0 7px;font-size:10px}
#mkR .tier span{flex:1;text-align:center;padding:4px 0;border:2px solid #081521;border-radius:3px;background:#14293c;color:#a9c0cf}
#mkR .tier span.on{color:#3a2401;border-color:#6a4704;background:linear-gradient(180deg,#ffe28f 0 2px,#ffc94a 2px 50%,#f2b830 50%)}
#mkR .sw{display:block;flex:0 0 16px;width:16px;height:16px;border:2px solid #081521;border-radius:2px}`);
    K.html(`<div id="mkR" class="mkc">
      <h3>SEFER ROTASI · NAZLI HANIM <small>tayfa 3/3</small></h3>
      <div class="rt on"><img class="px" src="${fk}" style="width:24px;height:16px"><div><b>Sinop açıkları</b><small>6 dk · hamsi ×140</small></div><div class="p"><span class="gold">Kalkan ihtimali %20</span><br><span class="dim">yakıt $180</span></div></div>
      <div class="rt"><img class="px" src="${fb}" style="width:24px;height:16px"><div><b>Kefken kayalıkları</b><small>3 dk · hamsi ×60</small></div><div class="p"><span class="gold">Barbun %35</span><br><span class="dim">yakıt $80</span></div></div>
      <div class="rt"><img class="px" src="${fl}" style="width:24px;height:16px"><div><b>Rize açıkları</b><small>8 dk · hamsi ×200</small></div><div class="p"><span class="gold">Lüfer %25</span><br><span class="dim">yakıt $260</span></div></div>
      <div class="tier"><span>KAYIK</span><span class="on">GIRGIR</span><span>TROL · $40.000</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <div style="font-size:10px;color:#a9c0cf;flex:0 0 auto;display:flex;gap:3px;align-items:center">BOYA&nbsp;<b style="display:block;width:16px;min-width:16px;max-width:16px;height:16px;flex:none;border:2px solid #ffc94a;border-radius:2px;background:#2a5a9a"></b><b style="display:block;width:16px;min-width:16px;max-width:16px;height:16px;flex:none;border:2px solid #081521;border-radius:2px;background:#2f7a3a"></b><b style="display:block;width:16px;min-width:16px;max-width:16px;height:16px;flex:none;border:2px solid #081521;border-radius:2px;background:#c8402c"></b><b style="display:block;width:16px;min-width:16px;max-width:16px;height:16px;flex:none;border:2px solid #081521;border-radius:2px;background:#f1ebda"></b></div>
        <div class="btnG" style="flex:1;height:34px;font-size:13px;white-space:nowrap">SEFERE YOLLA ▶</div></div>
    </div>`);
  });
  await sleep(300); await shot(p, 'fikir-03.png');
}

/* =====================================================================
   FİKİR 4 — Hamsi Festivali: meydanda bayraklar, horon, kemençe, tava
   ===================================================================== */
async function fikir4(p) {
  await goTo(p, 18, 6, 0.55);
  await p.evaluate(() => {
    const K = MK, g = K.art;
    document.getElementById('ui').style.visibility = 'hidden';   /* yapı levhaları bu sahnede gizli */
    const A = v => K.c2a(v);
    /* bayrak dizileri (kilim renkleri) */
    const cols = ['#a83d2b', '#d9a441', '#2a4c7d', '#f1ebda', '#5f9a5a'];
    const bunting = (x0, y0, x1, y1, sag, n) => {
      for (let s = 0; s <= 120; s++) { const u = s / 120; K.px(g, Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag), 1, 1, '#3b2a1c'); }
      for (let k = 1; k < n; k++) {
        const u = k / n, fx = Math.round(x0 + (x1 - x0) * u), fy = Math.round(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag) + 1, c = cols[k % cols.length];
        for (let j = 0; j < 7; j++) { const w = Math.max(1, 6 - j); K.px(g, fx - (w >> 1), fy + j, w, 1, c); }
        K.px(g, fx - 3, fy, 1, 1, '#1a1410'); K.px(g, fx + 3, fy, 1, 1, '#1a1410'); K.px(g, fx, fy + 7, 1, 1, '#1a1410');
        K.px(g, fx - 2, fy, 2, 1, 'rgba(255,255,255,.35)');
      }
    };
    /* direkler */
    const pole = (x, y, h) => { K.px(g, x, y - h, 3, h, '#6f4526'); K.px(g, x, y - h, 1, h, '#c9975f'); K.px(g, x - 1, y - h - 2, 5, 2, '#d9a441'); K.px(g, x - 1, y, 5, 1, '#3b2a1c'); return [x + 1, y - h]; };
    const p1 = pole(A(196), A(392), A(70)), p2 = pole(A(372), A(480), A(70)), p3 = pole(A(150), A(560), A(66)), p4 = pole(A(360), A(600), A(60));
    bunting(p1[0], p1[1], p2[0], p2[1], 10, 16); bunting(p1[0], p1[1], p3[0], p3[1], 8, 12); bunting(p3[0], p3[1], p4[0], p4[1], 9, 16); bunting(p2[0], p2[1], p4[0], p4[1], 6, 8);
    /* festival tezgâhı: tahta tezgâh + kilim etek + çizgili tente + tava + buhar */
    const tx = A(84), ty = A(486);
    const box = (x, y, w, h, c1, c2, c3) => { K.px(g, x, y, w, h, c2); K.px(g, x, y, w, 1, c1); K.px(g, x, y + h - 1, w, 1, c3); K.px(g, x - 1, y, 1, h, '#1a1410'); K.px(g, x + w, y, 1, h, '#1a1410'); K.px(g, x, y - 1, w, 1, '#1a1410'); K.px(g, x, y + h, w, 1, '#1a1410'); };
    box(tx - 32, ty - 16, 64, 16, '#c9975f', '#ab7a48', '#6f4526');
    for (let i = 0; i < 62; i += 8) { K.px(g, tx - 31 + i, ty - 12, 4, 4, '#a83d2b'); K.px(g, tx - 30 + i, ty - 11, 2, 2, '#d9a441'); K.px(g, tx - 27 + i, ty - 12, 4, 4, '#2a4c7d'); }
    K.px(g, tx - 33, ty - 19, 66, 3, '#c9975f'); K.px(g, tx - 33, ty - 20, 66, 1, '#1a1410');
    /* direkler + tente */
    K.px(g, tx - 33, ty - 52, 2, 34, '#6f4526'); K.px(g, tx + 31, ty - 52, 2, 34, '#6f4526');
    for (let i = 0; i < 70; i++) for (let j = 0; j < 10; j++) K.px(g, tx - 35 + i, ty - 60 + j - Math.round(i * 0), 1, 1, (Math.floor(i / 7) % 2 ? '#f3e9d0' : '#cc4430'));
    K.px(g, tx - 35, ty - 61, 70, 1, '#1a1410'); for (let d = 0; d < 10; d++) { const c = d % 2 ? '#e6dbbc' : '#b23a2a'; K.px(g, tx - 35 + d * 7, ty - 50, 7, 2, c); K.px(g, tx - 33 + d * 7, ty - 48, 3, 1, c); }
    /* tabela */
    K.px(g, tx - 22, ty - 74, 44, 12, '#3a2a1c'); K.px(g, tx - 21, ty - 73, 42, 10, '#c9a15e'); K.px(g, tx - 21, ty - 73, 42, 1, '#e0bd80');
    K.tiny(g, tx - 19, ty - 71, 'HAMSI TAVA', '#3a2401');
    /* iki büyük tava, hamsiler dizili */
    [[-16, 0], [12, 0]].forEach(([dx]) => {
      const cx = tx + dx, cy = ty - 24;
      K.blob(g, cx - 11, cy - 4, 22, 8, (i, j) => (i - 11) ** 2 / 121 + (j - 4) ** 2 / 16 < 1, { lite: '#6a6e74', mid: '#3e4247', dark: '#26292c', line: '#121314' });
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const fx = cx - 7 + k * 4 + (r % 2), fy = cy - 2 + r * 2; K.px(g, fx, fy, 3, 1, '#d9a441'); K.px(g, fx, fy, 1, 1, '#9a6a24'); }
      K.px(g, cx + 11, cy, 8, 2, '#1a1410');
      /* buhar: kıvrımlı, yarı saydam piksel */
      for (let s = 0; s < 3; s++) for (let k = 0; k < 9; k++) { const sx = cx - 6 + s * 6 + Math.round(Math.sin(k * 0.9 + s) * 2), sy = cy - 6 - k * 3; K.px(g, sx, sy, 2, 2, k < 5 ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.4)'); }
    });
    /* horon halkası: oyunun karakterleri, el ele */
    const cx0 = A(262), cy0 = A(520), rx = A(84), ry = A(40), N = 10;
    const looks = ['teyze', 'isci', 'komsu', 'aile', 'emekli', 'ogrenci', 'esnaf', 'kaptan', 'turist', 'teyze'];
    const pts = [];
    for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2 + 0.3; pts.push([cx0 + Math.cos(a) * rx, cy0 + Math.sin(a) * ry, a]); }
    pts.sort((a, b) => a[1] - b[1]);
    /* zemin: dans halkası gölgesi */
    K.blob(g, cx0 - rx - 14, cy0 - ry - 7, (rx + 14) * 2, (ry + 7) * 2, (i, j) => { const u = (i - rx - 14) / (rx + 14), v = (j - ry - 7) / (ry + 7), d = u * u + v * v; return d < 1 && d > 0.55; }, { lite: 'rgba(90,70,40,.18)', mid: 'rgba(90,70,40,.18)', dark: 'rgba(90,70,40,.18)' });
    const hands = [];
    pts.forEach(([x, y, a], k) => {
      const bob = (k % 2) ? 0.25 : 0.7;
      K.putPerson(g, K.look(looks[k], k + 3), x, y - (k % 2 ? 2 : 0), bob, Math.cos(a) > 0);
      hands.push([x, y - 21 - (k % 2 ? 2 : 0), a]);
    });
    /* kollar: komşu dansçılar arasında omuz hizasında */
    const byA = hands.slice().sort((p, q) => p[2] - q[2]);
    for (let k = 0; k < byA.length; k++) {
      const [x1, y1] = byA[k], [x2, y2] = byA[(k + 1) % byA.length];
      if (Math.hypot(x2 - x1, y2 - y1) > rx) continue;
      for (let s = 3; s < 10; s++) { const u = s / 12; K.px(g, Math.round(x1 + (x2 - x1) * u), Math.round(y1 + (y2 - y1) * u), 1, 1, '#2a2522'); }
    }
    /* kemençeci: tabureye oturmuş, kemençe dikey */
    const kx = A(352), ky = A(556);
    K.px(g, kx - 6, ky - 6, 12, 3, '#ab7a48'); K.px(g, kx - 5, ky - 3, 2, 4, '#6f4526'); K.px(g, kx + 3, ky - 3, 2, 4, '#6f4526');
    const kp = K.putPerson(g, Object.assign({}, K.look('komsu', 1), { coat: '#2b2b2b', coat2: '#1d1d1d' }), kx, ky - 3, 0.4, true);
    const kem = ['..kk..', '.kbbk.', '..kk..', '..kk..', '.kbbk.', '..bb..', '..bb..', '.kbbk.', 'kbBbbk', 'kBBbbk', 'kbBbbk', 'kbbbbk', 'kbBbdk', 'kbbbdk', '.kbbk.', '..kk..'];
    K.spr(g, kx - 8, ky - 34, kem, { k: '#2a1608', b: '#8a4f26', B: '#c9975f', d: '#5e3216' });
    for (let s = 0; s < 18; s++) K.px(g, kx - 16 + s, ky - 24 + Math.round(s * 0.25), 1, 1, s % 2 ? '#d9b45e' : '#f2d488');
    K.px(g, kx - 17, ky - 25, 2, 2, '#6f4526');
    /* nota pikselleri */
    [[10, -46], [18, -54], [4, -58]].forEach(([dx, dy], i) => { K.px(g, kx + dx, ky + dy, 2, 2, '#ffc94a'); K.px(g, kx + dx + 1, ky + dy - 5, 1, 5, '#ffc94a'); if (i === 1) K.px(g, kx + dx + 2, ky + dy - 5, 2, 1, '#ffc94a'); });
    /* tezgâh başında kuyruk + aşçı */
    K.putPerson(g, K.look('sef', 2), tx + 2, ty - 18, 0.2, false);
    K.putPerson(g, K.look('aile', 4), tx + 44, ty + 12, 0.6, true);
    K.putPerson(g, K.look('isci', 5), tx + 58, ty + 22, 0.1, true);
    /* dünya levhaları */
    K.label(K.a2c(tx), K.a2c(ty - 78), '★ Hamsi Tava · $12', '#ffc94a', 1);
    K.label(K.a2c(cx0), K.a2c(cy0 - ry - 44), 'HORON ×10', '#9af0ac', 2);
    /* gün şeridi (oyunun dayBanner'ı) */
    const db = document.getElementById('dayBanner'); db.classList.remove('hidden'); db.style.top = '19%'; db.style.animation = 'none'; db.style.opacity = '1';
    document.getElementById('dayBannerT').textContent = 'GÜN 20';
    document.getElementById('dayBannerS').textContent = 'HAMSİ FESTİVALİ · müşteri ×2';
    /* horon mini oyunu: ritim şeridi */
    K.css(`#mkH{left:8px;right:8px;bottom:62px;padding:9px 10px 9px}
#mkH .top{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;margin:2px 0 6px}
#mkH .top b{color:#ffc94a;font-size:13px;letter-spacing:1px;text-shadow:1px 1px 0 #3a2401}
#mkH .lane{position:relative;height:30px;border:2px solid #081521;border-radius:3px;background:repeating-linear-gradient(90deg,#14293c 0 29px,#1d3a52 29px 30px);box-shadow:inset 0 2px 0 rgba(0,0,0,.35)}
#mkH .hit{position:absolute;left:44px;top:-2px;bottom:-2px;width:26px;border:2px solid #ffc94a;border-radius:2px;box-shadow:0 0 0 1px #3a2401 inset}
#mkH .n{position:absolute;top:6px;width:14px;height:14px;border:2px solid #081521;border-radius:2px;background:linear-gradient(180deg,#ffe28f 0 2px,#ffc94a 2px 60%,#d99a1c 60%)}
#mkH .n.b{background:linear-gradient(180deg,#9af0ac 0 2px,#6fe08a 2px 60%,#3fae5c 60%)}
#mkH .bot{display:flex;justify-content:space-between;font-size:10.5px;margin-top:6px}`);
    K.html(`<div id="mkH" class="mkc"><div class="top"><b>HORON</b><span>halka <span class="gold">10 kişi</span> · bahşiş <span class="grn">+%40</span></span></div>
      <div class="lane"><div class="hit"></div><div class="n" style="left:50px"></div><div class="n b" style="left:104px"></div><div class="n" style="left:150px"></div><div class="n" style="left:196px"></div><div class="n b" style="left:256px"></div><div class="n" style="left:300px"></div><div class="n" style="left:330px"></div></div>
      <div class="bot"><span class="dim">Ritimde dokun, halka büyüsün</span><span>KOMBO <span class="gold">×7</span></span></div></div>`);
  });
  await sleep(250);
  await p.evaluate(() => { const db = document.getElementById('dayBanner'); db.classList.remove('hidden'); db.style.opacity = '1'; db.style.top = '19%'; document.getElementById('dayBannerT').textContent = 'GÜN 20'; document.getElementById('dayBannerS').textContent = 'HAMSİ FESTİVALİ · müşteri ×2'; });
  await shot(p, 'fikir-04.png');
  await p.evaluate(() => { document.getElementById('ui').style.visibility = ''; const db = document.getElementById('dayBanner'); db.classList.add('hidden'); db.style.cssText = ''; });
}

/* =====================================================================
   FİKİR 5 — Müdavimler: kalp rozetli müşteri + müdavim kartı
   ===================================================================== */
async function fikir5(p) {
  await goTo(p, 6.5, 4.5, 0.45);
  const info = await p.evaluate(() => {
    const K = MK, g = K.art;
    /* kuyrukta bekleyen, ekranın üst yarısında bir müşteri seç; görünüşünü Pazar Teyzesi yap */
    let best = null, bs = 1e9;
    BT.customers.forEach(c => { if (c.spec) return; const [x, y] = K.w2c(c.x, c.y, 0); if (x < 60 || x > 340 || y < 330 || y > 640) return; const s = (c.state === 'wait' ? 0 : 150) + Math.abs(y - 410) + Math.abs(x - 270) * 1.5; if (s < bs) { bs = s; best = c; } });
    if (!best) return { err: 'müşteri yok', n: BT.customers.length, st: BT.customers.map(c => [c.state, K.w2c(c.x, c.y, 0).map(Math.round)]) };
    const tz = BT.CUST.find(t => t.id === 'teyze');
    best.type = tz; best.tone = 1; best.hair = 2; best.face = 1; best.pat = best.patMax = 1e6;
    window.__fadime = best;
    return { ok: 1, keys: Object.keys(best).slice(0, 30) };
  });
  console.log('fikir5', JSON.stringify(info));
  await sleep(80);
  await p.evaluate(() => {
    const K = MK, g = K.art, cu = window.__fadime;
    const [x, y] = K.w2c(cu.x, cu.y, 0);
    /* kalp rozeti: pirinç çerçeveli küçük levha, başın üstünde */
    const heart = ['.kk.kk.', 'krrkrrk', 'kRrrrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'];
    const ax = K.c2a(x), ay = K.c2a(y);
    K.blob(g, ax - 7, ay - 64, 15, 13, (i, j) => true, { lite: '#f2d488', mid: '#d9b45e', dark: '#7a5418', line: '#2a1608' });
    K.px(g, ax - 5, ay - 62, 11, 9, '#3a1a10');
    K.spr(g, ax - 3, ay - 61, heart, { k: '#3a1a10', r: '#e5533d', R: '#ff9b8a' });
    K.px(g, ax, ay - 51, 1, 3, '#2a1608');
    /* ad levhası + konuşma */
    K.label(x, y - 70 * HKG.PXS / K.FK - 2, '♥ Fadime Abla · müdavim', '#ffb0a0', 1);
    K.html(`<div class="say" style="left:${Math.round(Math.max(6, x - 150))}px;top:${Math.round(y - 112 * HKG.PXS / K.FK)}px">“Her zamankinden, evladım!”</div>`);
    /* müdavim kartı */
    const pc = document.createElement('canvas'); pc.width = 64; pc.height = 96; pc.dataset.k = K.FK;
    BT.drawOutfitOn(pc, HKG.v('custOutfit')(cu), 0.3);
    const star = (on) => K.icon(['...k...', '..kyk..', 'kkkyykk', 'kyyyyyk', '.kyyyk.', 'kyykyyk', 'kk...kk'].map(r => r), { k: '#3a2401', y: on ? '#ffc94a' : '#3a4e60' }, 2);
    const s1 = star(1), s0 = star(0);
    K.css(`#mkM{left:8px;right:8px;bottom:62px;padding:10px 10px 10px}
#mkM .row1{display:flex;gap:9px;align-items:stretch}
#mkM .por{width:74px;height:92px;flex:0 0 74px;border:2px solid #2a1608;border-radius:3px;overflow:hidden;position:relative;
  background:linear-gradient(180deg,#f4e6c4 0,#f4e6c4 62%,#e6d2a4 62%);box-shadow:inset 1px 1px 0 #fff4da,inset -2px -2px 0 rgba(58,38,20,.2)}
#mkM .por canvas{position:absolute;left:5px;top:-2px;width:64px;height:96px;image-rendering:pixelated}
#mkM .por i{position:absolute;right:3px;top:3px;font-style:normal;font-size:12px;color:#e5533d;text-shadow:1px 1px 0 #3a1a10}
#mkM h3{font-size:16px;color:#ffc94a;letter-spacing:1px;text-shadow:1px 1px 0 #3a2401;margin:3px 0 1px}
#mkM .sub{font-size:10.5px;color:#a9c0cf}
#mkM .st{margin:5px 0 4px;display:flex;gap:3px}
#mkM .kv{font-size:11px;line-height:15px}
#mkM .story{margin-top:9px;border-top:1px solid #2b5274;padding-top:8px;position:relative}
#mkM .story .t{font-size:10.5px;color:#f2d488;letter-spacing:.6px;margin-bottom:6px}
#mkM .rings{display:flex;justify-content:space-between;position:relative;padding:0 6px}
#mkM .rings::before{content:"";position:absolute;left:28px;right:28px;top:10px;height:2px;background:#2b5274}
#mkM .rg{position:relative;z-index:1;width:100px;text-align:center;font-size:10px;line-height:12px;color:#a9c0cf}
#mkM .rg i{display:block;margin:0 auto 4px;width:22px;height:22px;border:2px solid #081521;border-radius:50%;background:#14293c;box-shadow:inset 0 0 0 3px #2b5274}
#mkM .rg.ok{color:#f4e9d2} #mkM .rg.ok i{background:#ffc94a;box-shadow:inset 0 0 0 3px #d99a1c,inset 2px 2px 0 5px #ffe28f}
#mkM .rg.now i{background:#14293c;box-shadow:inset 0 0 0 3px #ffc94a}
#mkM .rg.now{color:#ffc94a}`);
    K.html(`<div id="mkM" class="mkc"><div class="row1"><div class="por" id="mkPor"><i>♥</i></div>
      <div style="flex:1"><h3>FADİME ABLA</h3><div class="sub">Pazar Teyzesi · müdavim · 14. ziyaret</div>
      <div class="st"><img class="px" src="${s1}" style="width:14px;height:14px"><img class="px" src="${s1}" style="width:14px;height:14px"><img class="px" src="${s1}" style="width:14px;height:14px"></div>
      <div class="kv">Her zamanki: <b>4 hamsi · 1 füme</b><br>Bahşiş <span class="grn">+%25</span> · sabır <span class="grn">+%40</span></div></div></div>
      <div class="story"><div class="t">FADİME ABLA'NIN HİKÂYESİ</div>
        <div class="rings"><div class="rg ok"><i></i>Kızı üniversiteyi<br>kazandı</div><div class="rg now"><i></i>Bayram için<br>kalkan istiyor</div><div class="rg"><i></i>Liman düğünü<br>· kilitli</div></div></div></div>`);
    document.getElementById('mkPor').appendChild(pc);
  });
  await shot(p, 'fikir-05.png');
}

(async () => {
  const b = await chromium.launch();
  const p = await boot(b);
  const F = { 1: fikir1, 2: fikir2, 3: fikir3, 4: fikir4, 5: fikir5 };
  for (const n of ONLY) { try { await F[n](p); console.log('fikir-0' + n + ' tamam'); } catch (e) { console.log('fikir-0' + n + ' HATA', e.message); } }
  await b.close();
})();
