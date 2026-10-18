/* Hamsi Koyu — tanıtım videosu (App Store Preview 886×1920 + sosyal 1080×1920), 30 fps, ~25 sn, oyunun gerçek görüntüsü.
   Oyunun saati sanallaştırılır (rAF, performance.now, setTimeout): her kare tek tek çekilir → takılmasız 30 fps.
   Ses: oyunun kendi müziği (ses.js, WebAudio kaydı) ffmpeg ile eklenir.
   Oyun klasörü 8101'de sunulmalı. Kullanım:
     node magaza/video/uret.js            → ses + iki boy + kareler.png
     node magaza/video/uret.js kare 886   → yalnız 886×1920 kareleri (kareler-886/)
     node magaza/video/uret.js birlestir  → yalnız ffmpeg (kareler + ses → mp4) ve kareler.png */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.URL || 'http://localhost:8101/';
const DIR = __dirname, FPS = 30, LANG = process.env.LANG_V || 'tr';
const SIZES = { 886: { width: 443, height: 960 }, 1080: { width: 540, height: 960 } };

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
  window.__pumpOn = () => { clearInterval(window.__pump); window.__pump = setInterval(() => window.__step(1000 / 30), 33); };
  window.__pumpOff = () => clearInterval(window.__pump);
  window.__pumpOn();
  try { localStorage.setItem('balikci_langpick', '1'); } catch (e) { }
};

const TXT = {
  tr: { b: 'Ağdan tezgâha', c: 'Tut, kes, sat', d: 'Limanını büyüt', e: 'Haşmet Bey geliyor!', f: 'Dipteki Söz', g1: 'Karadeniz\'de bir balıkçı limanı', g2: 'App Store\'da' },
  en: { b: 'From net to stall', c: 'Catch, cut, sell', d: 'Grow your harbor', e: 'The tax man is coming!', f: 'The Promise Below', g1: 'A Black Sea fishing harbor', g2: 'On the App Store' }
}[LANG];

/* sahne akışı (saniye). fade: başta/sonda kısa kararma */
const SEG = [
  { id: 'a', len: 2.6 },                                          /* gazete: 1974, hamsi koya döndü */
  { id: 'b', len: 3.8, cap: TXT.b },                              /* şafak, oyuncu ağdan masaya balık taşır */
  { id: 'c', len: 3.8, cap: TXT.c },                              /* Ana Kasa: kuyruk, para */
  { id: 'd', len: 4.0, cap: TXT.d },                              /* liman boyunca kaydırma: dört bölge */
  { id: 'e', len: 4.8, cap: TXT.e },                              /* Haşmet Bey, kaçışan müşteriler */
  { id: 'f', len: 3.4, cap: TXT.f },                              /* yunus sıçrar → Şahmeran */
  { id: 'g', len: 3.0 }                                           /* amblem + App Store'da */
];

async function frames(size) {
  const OUT = path.join(DIR, 'kareler-' + size);
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: SIZES[size], deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(VCLOCK);
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(BASE + 'index.html'); await sleep(1500);
  await p.addStyleTag({ content: '#achPop,#pauseBadge{display:none!important}' });
  await p.evaluate(l => { window.HK_STORY_OFF = 1; window.HK_HELP_OFF = 1; if (BT.setLang) BT.setLang(l); }, LANG);
  /* bindirmeler: başlık plakası, kararma, kapanış kartı */
  await p.evaluate(([T, lang]) => {
    const st = document.createElement('style');
    st.textContent =
      '#vcap{position:fixed;left:50%;top:92px;transform:translateX(-50%);z-index:90;padding:10px 20px 12px;background:#0b1b2b;border:3px solid #d9a441;' +
      'box-shadow:0 0 0 3px #3a2605,5px 6px 0 3px rgba(0,0,0,.45);color:#fff1c9;font:700 27px "Pixelify Sans";white-space:nowrap;text-shadow:3px 3px 0 #050c14;opacity:0}' +
      '#vcap::before{content:"";position:absolute;left:0;right:0;top:-3px;height:5px;background:repeating-linear-gradient(90deg,#a83d2b 0 8px,#d9a441 8px 12px,#2a4c7d 12px 16px,#d9a441 16px 20px)}' +
      '#vblk{position:fixed;inset:0;z-index:99;background:#04080d;opacity:0;pointer-events:none}' +
      '#vend{position:fixed;inset:0;z-index:95;display:none;flex-direction:column;align-items:center;justify-content:center;background:#0f2236}' +
      '#vend img{width:92%;image-rendering:pixelated;margin-top:-40px}' +
      '#vend b{font:700 24px "Pixelify Sans";color:#a9cfe0;margin-top:-6px}' +
      '#vend s{text-decoration:none;margin-top:34px;padding:12px 26px;border:3px solid #d9a441;box-shadow:0 0 0 3px #3a2605;background:#14304a;font:700 30px "Pixelify Sans";color:#ffc94a;text-shadow:3px 3px 0 #050c14}' +
      '#vend i{position:absolute;left:0;right:0;height:22px;background:repeating-linear-gradient(90deg,#a83d2b 0 16px,#d9a441 16px 24px,#2a4c7d 24px 32px,#d9a441 32px 40px);border-top:4px solid #f2e2bd;border-bottom:4px solid #f2e2bd}';
    document.head.appendChild(st);
    const c = document.createElement('div'); c.id = 'vcap'; document.body.appendChild(c);
    const k = document.createElement('div'); k.id = 'vblk'; document.body.appendChild(k);
    const e = document.createElement('div'); e.id = 'vend';
    e.innerHTML = '<i style="top:0"></i><img src="store/logo/logo-stacked-' + lang + '.png"><b>' + T.g1 + '</b><s>' + T.g2 + '</s><i style="bottom:0"></i>';
    document.body.appendChild(e);
    window.__cap = (txt, a) => { c.textContent = txt || ''; c.style.opacity = txt ? a : 0; };
    window.__blk = a => { k.style.opacity = a; };
    window.__end = on => { e.style.display = on ? 'flex' : 'none'; };
  }, [TXT, LANG]);
  await sleep(500);

  /* kare çekici */
  let f = 0;
  const shoot = async () => { await p.screenshot({ path: path.join(OUT, String(f++).padStart(5, '0') + '.png') }); };
  const step = (n = 1) => p.evaluate(n => { for (let i = 0; i < n; i++) window.__step(1000 / 30); }, n);
  /* bir sahneyi çek: her karede upd(u) çalışır, baş/son 0.2 sn kararma, başlık 0.3 sn'de belirir */
  const rec = async (g, upd) => {
    const N = Math.round(g.len * FPS);
    for (let i = 0; i < N; i++) {
      const u = i / N, s = i / FPS, rem = (N - i) / FPS;
      const blk = Math.max(0, 1 - s / 0.2, 1 - rem / 0.2);
      const ca = Math.max(0, Math.min(1, (s - 0.25) / 0.25, (rem - 0.2) / 0.25));
      await p.evaluate(([cap, ca, blk]) => { window.__cap(cap, ca); window.__blk(Math.min(1, blk)); }, [g.cap || '', ca, blk]);
      if (upd) await upd(u, i);
      await step(1); await shoot();
    }
    console.log(size, g.id, f);
  };
  const S = id => SEG.find(g => g.id === id);
  const clean = () => p.evaluate(() => {
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
    ['toast', 'coach', 'lvlUp', 'specPop', 'dayBanner'].forEach(id => { const e = document.getElementById(id); if (e) { e.classList.add('hidden'); e.classList.remove('on'); } });
    const cb = HKG.v('closeBar'); if (cb && !document.getElementById('devpanel').classList.contains('hidden')) cb();
    HKG.v('syncPause')();
  });
  const zoom = z => p.evaluate(z => { const b = document.querySelector('#zoomSeg button[data-z="' + z + '"]'); if (b) b.click(); }, z);
  const at = (x, y) => p.evaluate(([x, y]) => { BT.player.x = x; BT.player.y = y; }, [x, y]);

  /* A) gazete: pompayı durdur, sahne 1'i (hamsi döndü) baştan oynat */
  await p.evaluate(() => { window.__pumpOff(); HKG.v('introAdvance')(); HKG.v('introScene')(1); });
  await step(6);
  await rec(S('a'), async (u, i) => { if (i === 40) await p.evaluate(() => HKG.v('introAdvance')()); });

  /* oyunu başlat ve koyu kur (pompa açık, kayıt yok) */
  await p.evaluate(() => window.__pumpOn());
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.fill('#nameIn', LANG === 'en' ? 'Silver Net Co.' : 'Gümüş Ağ Balıkçılık').catch(() => {});
  await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(500);
  await p.evaluate(() => {
    const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 184250; S.rep = 2400;
    for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
    BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
    BT.rebuildCounters();
    for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
    BT.decor.forEach(d => { d.got = true; });
    BT.counters.forEach(c => { c.open = true; c.seen = true; });
    HKG.v('HUT').lvl = 3; HKG.v('DEPOT').lvl = 2; HKG.v('WHALL').built = true; HKG.v('M').office = true;
    ['depocu', 'sevkiyat'].forEach(r => BT.hire(r, true, 0));
    S.mgr = ['Sadık Bey', 'Nazmiye Hanım', 'Rıza Bey', 'Feride Hanım'].map((n, i) => ({ n, a: 'value', b: 'pat', wage: 35 + i * 10, look: i % 3 }));
    S.auto = [true, true, true, true];
    BT.reassignWorkers();
    BT.day.phase = 'play'; BT.day.t = 40;
  });
  await clean();
  await sleep(20000);
  await p.evaluate(() => window.__pumpOff());

  /* B) şafak: oyuncu ağdan kesim masasına balık taşır (yakın) */
  await zoom(3); await clean();
  await p.evaluate(() => {
    BT.day.t = BT.DAY_LEN * 0.02;
    const sp = BT.spots[0], src = sp.stock.length ? sp.stock : (BT.tables[0].mat.items.length ? BT.tables[0].mat.items : []);
    BT.player.carry.length = 0; for (let i = 0; i < 5 && src.length; i++) BT.player.carry.push(JSON.parse(JSON.stringify(src[i % src.length])));
    BT.player.x = 2.6; BT.player.y = 2.2;
  });
  await step(20);
  await rec(S('b'), async u => { await p.evaluate(u => { BT.player.vx = 0; const k = Math.min(1, u * 1.15); BT.player.x = 2.6 + (4.7 - 2.6) * k; BT.player.y = 2.2 + (2.3 - 2.2) * k; }, u); });

  /* C) Ana Kasa: kuyruk ve para (öğle) */
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN * 0.42; BT.player.carry.length = 0; BT.player.x = 7.4; BT.player.y = 4.4; });
  await clean(); await step(45);
  await rec(S('c'));

  /* D) liman boyunca: dört bölge (orta yakınlık) */
  await zoom(2); await clean();
  await p.evaluate(() => { BT.player.x = 6.4; BT.player.y = 3.6; });
  await step(30);
  await rec(S('d'), async u => { await p.evaluate(u => { const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; BT.player.x = 6.4 + (6.3 - 6.4) * e; BT.player.y = 3.6 + (19.6 - 3.6) * e; }, u); });

  /* E) Haşmet Bey: 7. gün, memur gelir, müşteriler kaçışır */
  await p.evaluate(() => { BT.player.x = 7.4; BT.player.y = 4.6; BT.day.n = 7; BT.day.t = BT.DAY_LEN * 0.24; const q = BT.tax.q(); q.items = 60; q.due = 420; q.last = 0; });
  await clean(); await step(150);
  await p.evaluate(() => { BT.day.t = BT.DAY_LEN * 0.305; });
  await step(12);
  await rec(S('e'));

  /* F) yunus: memuru bitir, hikâyeyi aç, yunus sıçrayana kadar ileri sar; sonra Şahmeran ara sahnesi */
  for (let i = 0; i < 120 && await p.evaluate(() => BT.tax.st().on); i++) await step(30);
  await p.evaluate(() => { window.HK_STORY_OFF = 0; BT.storySet({ step: 7, last: 0 }); BT.day.n = 9; BT.day.phase = 'play'; BT.day.t = 40; BT.player.x = 3.6; BT.player.y = 3.4; });
  for (let i = 0; i < 400 && (await p.evaluate(() => BT.dolph() && BT.dolph().st)) !== 'leap'; i++) await step(3);
  await step(2); await clean();
  const g = S('f'); let opened = false;
  await rec(g, async (u, i) => {
    if (!opened && i >= Math.round(g.len * FPS * 0.5)) {
      opened = true;
      await p.evaluate(l => { window.HK_STORY_OFF = 1; HK_STORY.open(8, { lang: l, ber: 6, flags: {}, known: ['k', 'h', 't', 'a', 's'] }); }, LANG);
      await step(50);
      for (let k = 0; k < 2; k++) { await p.evaluate(() => HK_STORY._tap()); await step(8); await p.evaluate(() => HK_STORY._tap()); await step(25); }
    }
  });
  await p.evaluate(() => { try { HK_STORY.close(); } catch (e) { } });

  /* G) kapanış kartı */
  await p.evaluate(() => window.__end(true));
  await rec(S('g'), async (u, i) => { await p.evaluate(i => { if (i > 80) window.__blk(0); }, i); });
  await b.close();
  return f;
}

function mux(size) {
  const W = { 886: 886, 1080: 1080 }[size];
  const out = path.join(DIR, size == 886 ? 'preview-886x1920.mp4' : 'tanitim-1080x1920.mp4');
  const dur = fs.readdirSync(path.join(DIR, 'kareler-' + size)).length / FPS;
  const audio = fs.existsSync(path.join(DIR, 'ses.webm'));
  const a = audio ? `-i "${path.join(DIR, 'ses.webm')}" -filter_complex "[1:a]atrim=0:${dur},asetpts=N/SR/TB,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.3,afade=t=out:st=${(dur - 1.2).toFixed(2)}:d=1.2,aresample=48000[a]" -map 0:v -map "[a]" -c:a aac -b:a 192k -ac 2` : '-an';
  execSync(`ffmpeg -y -hide_banner -loglevel error -framerate ${FPS} -i "${path.join(DIR, 'kareler-' + size, '%05d.png')}" ${a} ` +
    `-vf "scale=${W}:1920:flags=neighbor,format=yuv420p" -sws_flags neighbor -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 16 -r ${FPS} -movflags +faststart -t ${dur} "${out}"`, { stdio: 'inherit' });
  console.log('mp4', out);
}
function sheet() {
  const v = path.join(DIR, 'preview-886x1920.mp4');
  const ts = [1.3, 8.0, 12.4, 16.8, 21.4, 23.8];
  ts.forEach((t, i) => execSync(`ffmpeg -y -hide_banner -loglevel error -ss ${t} -i "${v}" -frames:v 1 -vf scale=443:960:flags=neighbor "${path.join(DIR, '_k' + i + '.png')}"`));
  execSync(`ffmpeg -y -hide_banner -loglevel error ${ts.map((t, i) => '-i "' + path.join(DIR, '_k' + i + '.png') + '"').join(' ')} -filter_complex "${ts.map((t, i) => '[' + i + ':v]pad=463:980:10:10:color=0x0a1622[p' + i + ']').join(';')};${ts.map((t, i) => '[p' + i + ']').join('')}hstack=inputs=6" "${path.join(DIR, 'kareler.png')}"`);
  ts.forEach((t, i) => fs.unlinkSync(path.join(DIR, '_k' + i + '.png')));
}

(async () => {
  const mode = process.argv[2] || 'hepsi';
  if (mode === 'hepsi') execSync('node "' + path.join(DIR, 'ses.js') + '" 4 27', { stdio: 'inherit' });
  if (mode === 'kare') await frames(+process.argv[3] || 886);
  if (mode === 'hepsi') { await frames(886); await frames(1080); }
  if (mode === 'birlestir' || mode === 'hepsi') { mux(886); mux(1080); sheet(); }
  if (mode === 'onizleme') sheet();
})();
