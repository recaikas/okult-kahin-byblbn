/* Geliştirme Günlüğü · Gün 2 · Bölüm 1: TEK BAŞINA OLMAZ (74 sn, dikey 1080×1920)
   Seri biçimi: her bölüm aynı karakterlerle (cast.js: Kaptan Rıza, Memo, Nermin Teyze) bir hikâye anlatır, sonra o hikâyenin
   oyundaki mekaniğini gerçek oyun görüntüsüyle tanıtır.
     0–30 sn  sinematik (konuşmasız): şafak · ilk satış ve büyüyen kuyruk · hızlı kesmeler ve PAT! · yabancı · tokalaşma · birlikte
     30–69 sn mekanik: ilk eleman (gerçek YÜKSELT paneli, gerçek işe alım, oyundaki dört rol, kadro kuralı)
     69–74 sn kapanış: Rıza ve Memo tezgâhta + kapanış kartı
   Kullanım: node store/tools/film/ep02-b1-tek-basina.js [tr|en] [preview [çekim,çekim]]
   Müzik:    python3 store/tools/film/ep02-b1-music.py store/video/gun2-b1-music.wav (varsa motor MP4'ü de üretir) */
const film = require('./engine');

const L = {
  tr: {
    firm: 'Rıza\'nın Balıkları', num: 'tr-TR',
    quote: 'Büyük hayaller, tek başına kurulmaz.',
    ep: ['HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ', 'GÜN 2 · BÖLÜM 1', 'TEK BAŞINA OLMAZ'], corner: 'GÜN 2 · BÖLÜM 1',
    alone: ['TEK BAŞINA', 'Ağ, masa, tezgâh… Kuyruk uzadıkça Rıza yetişemez.'],
    hire: ['İLK ELEMAN', 'Yükselt › Personel › rol seç. İlk iş: hamal.'], staffBtn: 'personeli', roleBtn: 'Hamal',
    memo: ['MEMO İŞ BAŞINDA', 'Hamal: ağdan kesim masasına taşır · dakikada $15'],
    roles: ['DÖRT ROL', 'Her biri zincirin bir halkası.'],
    roleList: ['HAMAL · ağdan <u>kesime</u> taşır', 'FİLETOCU · masayı <u>%55</u> hızlandırır', 'TEZGÂHTAR · siparişi <u>tezgâha</u> taşır', 'TAHSİLDAR · kasayı <u>Ana Kasa</u>ya taşır'],
    rule: ['KADRO 1/2', 'Bölge yükseldikçe kadro büyür. Eksik roller kartta yazar.'],
    team: ['SONRA: EKİP', 'Dört rol tamam: kuyruk erir, kasa dolar.'],
    end: ['Bir sonraki bölümde görüşürüz.', 'ÜCRETSİZ · REKLAMSIZ · SATIN ALMASIZ', 'Oyna: recaikas.github.io/okult-kahin-byblbn']
  },
  en: {
    firm: 'Rıza\'s Fish', num: 'en-US',
    quote: 'Big dreams aren\'t built alone.',
    ep: ['HAMSI COVE · DEVLOG', 'DAY 2 · EPISODE 1', 'NOT ALONE'], corner: 'DAY 2 · EPISODE 1',
    alone: ['ALL ALONE', 'Net, table, stall… As the line grows, Rıza falls behind.'],
    hire: ['THE FIRST HIRE', 'Upgrade › Staff › pick a role. First up: a porter.'], staffBtn: 'staff', roleBtn: 'Porter',
    memo: ['MEMO ON THE JOB', 'Porter: carries fish from the net to the table · $15/min'],
    roles: ['FOUR ROLES', 'Each one is a link in the chain.'],
    roleList: ['PORTER · net → <u>cutting table</u>', 'FILLETER · table <u>55%</u> faster', 'VENDOR · orders → <u>stall</u>', 'COLLECTOR · stall cash → <u>main safe</u>'],
    rule: ['CREW 1/2', 'Upgrade the zone to grow the crew. The card lists missing roles.'],
    team: ['THEN: A TEAM', 'All four roles: the line melts, the till fills.'],
    end: ['See you in the next episode.', 'FREE · NO ADS · NO IN-APP PURCHASES', 'Play: recaikas.github.io/okult-kahin-byblbn']
  }
};

film({
  id: 'gun2-b1', dur: 74, L, scripts: ['cast.js'],
  shots: L => [
    /* 1) sinematik — brief'e birebir, konuşmasız */
    { id: 'dawn', a: 0, b: 5, kind: 'scene', scene: 'b1open', fadeIn: 1.2 },
    { id: 'first', a: 5, b: 10, kind: 'scene', scene: 'b1rush0', tr: 'dissolve', td: 0.5 },
    { id: 'rush', a: 10, b: 16, kind: 'scene', scene: 'b1rush' },
    { id: 'stranger', a: 16, b: 21, kind: 'scene', scene: 'b1stranger', tr: 'dissolve', td: 0.7 },
    { id: 'shake', a: 21, b: 26, kind: 'scene', scene: 'b1shake', tr: 'dissolve', td: 0.5 },
    { id: 'together', a: 26, b: 30, kind: 'scene', scene: 'b1together', tr: 'dissolve', td: 0.5 },
    /* 2) seri kartı: oyuna geçiş */
    { id: 'card', a: 30, b: 33.4, kind: 'game', z: 3, cam: [[0, 6.6, 2.2], [1, 7.0, 2.5]], day: 0.38, dim: 0.0, grade: 'morning', push: 0.04 },
    /* 3) mekanik */
    { id: 'alone', a: 33.4, b: 39.4, kind: 'game', z: 3, cam: [[0, 5.4, 2.0], [1, 6.0, 2.5]], day: 0.45, grade: 'morning', tr: 'dissolve', td: 0.4 },
    { id: 'hire', a: 39.4, b: 46.4, kind: 'game', z: 3, cam: [[0, 4.6, 2.0], [1, 4.8, 2.2]], day: 0.47, ui: true, tr: 'dissolve', td: 0.4 },
    { id: 'memo', a: 46.4, b: 52.4, kind: 'game', z: 5, day: 0.48, grade: 'morning', tr: 'dissolve', td: 0.4 },
    { id: 'roles', a: 52.4, b: 58.4, kind: 'game', z: 3, cam: [[0, 4.2, 1.6], [1, 6.4, 2.6]], day: 0.5, grade: 'gold', dim: 0.0, tr: 'dissolve', td: 0.5, push: 0.03 },
    { id: 'rule', a: 58.4, b: 63.9, kind: 'game', z: 3, cam: [[0, 4.6, 2.0], [1, 4.8, 2.2]], day: 0.52, ui: true, tr: 'dissolve', td: 0.4 },
    { id: 'team', a: 63.9, b: 69.4, kind: 'game', z: 4, cam: [[0, 3.0, 1.2], [1, 8.0, 3.0]], day: 0.55, grade: 'gold', tr: 'dissolve', td: 0.5 },
    /* 4) kapanış */
    { id: 'end', a: 69.4, b: 74, kind: 'scene', scene: 'b1end', tr: 'dissolve', td: 0.8, dim: 0.45, end: true }
  ],
  text: L => [
    { a: 27.5, b: 30.0, kind: 'int', t: L.quote },
    { a: 30.0, b: 33.3, kind: 'episode' },
    { a: 33.4, b: 69.3, kind: 'corner', t: L.corner },
    { a: 33.8, b: 39.25, kind: 'title', t: L.alone[0], s: L.alone[1] },
    { a: 39.6, b: 46.25, kind: 'title', t: L.hire[0], s: L.hire[1], top: true },
    { a: 40.0, b: 41.0, kind: 'tap', sel: 'btn:' + L.staffBtn },
    { a: 42.1, b: 43.2, kind: 'tap', sel: 'btn:' + L.roleBtn },
    { a: 46.8, b: 52.25, kind: 'title', t: L.memo[0], s: L.memo[1] },
    { a: 52.8, b: 58.25, kind: 'title', t: L.roles[0], s: L.roles[1] },
    { a: 52.9, b: 58.25, kind: 'perks', items: L.roleList, gap: 0.6 },
    { a: 58.6, b: 63.75, kind: 'title', t: L.rule[0], s: L.rule[1], top: true },
    { a: 59.6, b: 62.6, kind: 'tap', sel: 'btn:' + L.staffBtn },
    { a: 64.3, b: 69.25, kind: 'title', t: L.team[0], s: L.team[1] },
    { a: 69.9, b: 74, kind: 'end' }
  ],
  flash: [[30.0, 0.85], [43.25, 0.25]],
  grades: { morning: ['#ffd6a0', 'soft-light', 0.16], gold: ['#ffb060', 'soft-light', 0.24] },

  /* sayfada: çekim kurulumları */
  pageInit: function (L, LANG, V) {
    const F = window.__F;
    const st = document.createElement('style');                      /* uzun bölüm adı dikey ekrana sığsın */
    st.textContent = 'body.tbv #tbg .tb-ep b{font-size:40px;text-align:center;line-height:1.1;padding:0 20px}body.tbv #tbg .tb-ep em{font-size:20px}' +
      '#tbg .tb-perks div{text-align:left;min-width:380px}' +
      '#tbg .tb-ep{background:radial-gradient(ellipse at 50% 46%,rgba(6,10,22,.88) 0%,rgba(6,10,22,.7) 45%,rgba(6,10,22,.35) 100%)}' +
      '#memoTag{position:fixed;z-index:195;transform:translate(-50%,-100%);padding:5px 10px 3px;background:rgba(8,14,24,.82);border:3px solid #e69a42;' +
      'font:700 15px "Pixelify Sans",monospace;letter-spacing:.12em;color:#fff3d6;white-space:nowrap;display:none;pointer-events:none}' +
      '#memoTag:after{content:"";position:absolute;left:50%;bottom:-9px;margin-left:-6px;border:6px solid transparent;border-top-color:#e69a42}';
    document.head.appendChild(st);
    const tag = document.createElement('div'); tag.id = 'memoTag'; tag.textContent = 'MEMO'; document.body.appendChild(tag);
    BT.S.ctrl = 2;
    BT.S.hero = { n: 'Rıza', hs: 0, hc: 0, sk: 1, hw: 3, fc: 2, co: 0, ap: 1 };   /* oyundaki Rıza: kızıl bere, sakal, petrol ceket */
    const closePanel = () => { const c = document.getElementById('dpClose'); if (c && !document.getElementById('devpanel').classList.contains('hidden')) c.click(); };
    const openStaff = () => { document.getElementById('dtLevel').click(); F.step(0.15); const b = F.byText(L.staffBtn); if (b) b.closest('.dcard') && b.closest('.dcard').scrollIntoView({ inline: 'center', block: 'nearest' }); };
    const memo = () => BT.workers.find(w => w.name === 'Memo');
    /* oyuncunun turu: ağ → masa → tezgâh → ağ (oyun kendi alma/bırakma işlerini yapar) */
    const ROUTE = [[2.7, 1.5, 0.9], [5.0, 2.1, 0.8], [8.2, 3.4, 0.9], [5.2, 2.2, 0], [2.7, 1.5, 0]];
    let done = {}, wp = 0, wait = 0, warm = false;
    window.__setup = (g, prev) => {
      const id = g.id;
      window.__pdir = null; tag.style.display = 'none'; window.__noTags = 1; window.__uiKeep = () => false; window.__uiScale = 1;
      if (prev === 'hire' || prev === 'rule') closePanel();
      if (!warm) { warm = true; BT.S.cash = 180; F.step(6); }
      if (g.day) BT.day.t = BT.DAY_LEN * g.day;
      if (id === 'alone') { F.at(2.7, 1.5); wp = 0; wait = 0; for (let i = 0; i < 8; i++) { BT.counters[0].spawnT = 0; F.step(2); } F.at(2.7, 1.5); }
      if (id === 'hire') { BT.S.cash = Math.max(BT.S.cash, 1240); window.__nextName = 'Memo'; done = {}; openStaff(); }
      if (id === 'memo') { if (!memo()) { window.__nextName = 'Memo'; BT.hire('hamal', true, 0); } window.__noTags = 0; F.step(1.5); }
      if (id === 'rule') { openStaff(); }
      if (id === 'team') {
        BT.areas[0].lvl = Math.max(BT.areas[0].lvl, 3);
        ['filetocu', 'tezgahtar', 'kasiyer'].forEach(r => { if (!BT.workers.some(w => w.role === r && w.zone === 0)) BT.hire(r, true, 0); });
        BT.reassignWorkers(); window.__noTags = 0; F.at(1.6, 4.4); F.step(8);
      }
      if (id !== 'hire' && id !== 'rule') F.hideOv();
    };
    window.__frame = (g, lt) => {
      if (g.id !== 'memo') tag.style.display = 'none';
      if (g.id === 'alone') {
        const p = BT.player, w = ROUTE[wp % ROUTE.length], dx = w[0] - p.x, dy = w[1] - p.y;
        if (Math.hypot(dx, dy) > 0.25) window.__pdir = { x: dx, y: dy };
        else { window.__pdir = null; wait += 1 / 30; if (wait > w[2]) { wp++; wait = 0; } }
      }
      if (g.id === 'hire') {
        if (lt >= 1.55 && !done.a) { done.a = 1; const b = F.byText(L.staffBtn); if (b) b.click(); F.step(0.1); const r = F.byText(L.roleBtn); if (r) r.closest('.dcard') && r.closest('.dcard').scrollIntoView({ inline: 'center', block: 'nearest' }); }
        if (lt >= 3.85 && !done.b) { done.b = 1; const r = F.byText(L.roleBtn); if (r) r.click(); }
      }
      if (g.id === 'memo') { const m = memo(); if (m) { window.__cam = { x: m.x + 0.4, y: m.y + 0.4 }; const q = BT.scr(m.x, m.y, 17); tag.style.display = 'block'; tag.style.left = q.x + 'px'; tag.style.top = q.y + 'px'; } }
    };
  }
});
