/* Geliştirme Günlüğü · Gün 3 · Bölüm 2: HER YERE YETİŞEMEZSİN (72 sn, dikey 1080×1920) — müdür mekaniği
   Sabit kadro (cast.js): Kaptan Rıza, Memo, Nermin Teyze + bu bölümde Nevin Hanım (oyundaki müdür adayı, mor ceket, altın fular).
     0–2.2 sn  soğuk açılış (kanca): herkes "RIZA!" der, Rıza fırıl fırıl döner, kare donar, soru yazısı
     2.2–30 sn sinematik: herkes Rıza'yı çağırır · sabahtan akşama koşturma · gece defterde uyuyakalır · sabah Memo, Nevin Hanım'ı
               getirir, kâğıtlar düzene girer · müdür masası, ekip akar, Rıza çay içer
     30–67 sn  mekanik: önce kadro · 3 aday · masa · altı yetenek · yoğun saat · dört bölge (gerçek oyun ve arayüz)
     67–72 sn  kapanış
   Kullanım: node store/tools/film/ep03-b2-mudur.js [tr|en] [preview [çekim,çekim]]
   Müzik:    python3 store/tools/film/ep03-b2-music.py store/video/gun3-b2-music.wav (varsa motor MP4'ü de üretir) */
const film = require('./engine');

const L = {
  tr: {
    firm: 'Rıza\'nın Balıkları', num: 'tr-TR',
    hook: ['BİR PATRON KAÇ YERE YETİŞİR?', 'Baştan alalım…'],
    who: ['KAPTAN RIZA · patron', 'MEMO · ilk eleman', 'SABAHTAN AKŞAMA…', 'GECE YARISI', 'NEVİN HANIM · müdür adayı'],
    quote: 'Her yere yetişemezsin. Yetişecek birini bul.',
    ep: ['HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ', 'GÜN 3 · BÖLÜM 2', 'HER YERE YETİŞEMEZSİN'], corner: 'GÜN 3 · BÖLÜM 2',
    roles: ['ÖNCE KADRO', 'Hamal, filetocu, tezgâhtar, tahsildar. Dördü tamamlanınca müdür kapısı açılır.'],
    pick: ['3 ADAY · 2\'ŞER YETENEK', 'Yükselt › Müdür. Bölgene uyanı seç.'], mgrCard: 'Balıkçı İskelesi — Müdür',
    auto: ['BÖLGE KENDİ KENDİNE İŞLER', 'Nevin Hanım masasında; bölge tam otomatik.'],
    perks: ['ALTI YETENEK', 'Her aday bunlardan ikisini getirir.'],
    perkList: ['Satış fiyatı <u>+%12</u>', 'Personel <u>%20</u> hızlı', 'Müşteri sabrı <u>+%35</u>', 'Müşteri akışı <u>+%12</u>', 'Bölge maaşları <u>−%30</u>', 'Satış başına <u>+1</u> itibar'],
    rush: ['YOĞUN SAATTE SAHAYA İNER', 'Dolan kasayı boşaltır, azalan tezgâhı doldurur.'],
    four: ['DÖRT BÖLGE · DÖRT MÜDÜR', 'Her bölgenin kendi masası, kendi yetenekleri.'],
    end: ['Bir sonraki bölümde görüşürüz.', 'ÜCRETSİZ · REKLAMSIZ · SATIN ALMASIZ', 'Oyna: recaikas.github.io/okult-kahin-byblbn']
  },
  en: {
    firm: 'Rıza\'s Fish', num: 'en-US',
    hook: ['HOW MANY PLACES CAN ONE BOSS BE?', 'Let\'s rewind…'],
    who: ['CAPTAIN RIZA · the boss', 'MEMO · first hire', 'FROM DAWN TO DUSK…', 'MIDNIGHT', 'NEVIN · manager candidate'],
    quote: 'You can\'t be everywhere. Find someone who can.',
    ep: ['HAMSI COVE · DEVLOG', 'DAY 3 · EPISODE 2', 'YOU CAN\'T BE EVERYWHERE'], corner: 'DAY 3 · EPISODE 2',
    roles: ['FIRST, THE CREW', 'Porter, filleter, vendor, collector. Fill all four to unlock a manager.'],
    pick: ['3 CANDIDATES · 2 PERKS EACH', 'Upgrade › Manager. Pick the one who fits your zone.'], mgrCard: 'Fishing Pier — Manager',
    auto: ['THE ZONE RUNS ITSELF', 'Nevin takes her desk; the zone goes fully automatic.'],
    perks: ['SIX PERKS', 'Every candidate brings two of these.'],
    perkList: ['Sale price <u>+12%</u>', 'Staff <u>20%</u> faster', 'Customer patience <u>+35%</u>', 'Customer flow <u>+12%</u>', 'Zone wages <u>−30%</u>', '<u>+1</u> reputation per sale'],
    rush: ['AT RUSH HOUR, SHE STEPS IN', 'Empties full tills, restocks low stalls.'],
    four: ['FOUR ZONES · FOUR MANAGERS', 'Each zone gets its own desk and perks.'],
    end: ['See you in the next episode.', 'FREE · NO ADS · NO IN-APP PURCHASES', 'Play: recaikas.github.io/okult-kahin-byblbn']
  }
};

film({
  id: 'gun3-b2', dur: 72, L, scripts: ['cast.js'],
  shots: L => [
    /* 0) soğuk açılış */
    { id: 'cold', a: 0, b: 1.0, kind: 'scene', scene: 'b2busy', t0: 2.6 },
    { id: 'freeze', a: 1.0, b: 2.2, kind: 'scene', scene: 'b2busy', t0: 3.3, opt: { freeze: 3.3 }, grade: 'freeze', dim: 0.3 },
    /* 1) sinematik */
    { id: 'busy', a: 2.2, b: 7.5, kind: 'scene', scene: 'b2busy' },
    { id: 'run', a: 7.5, b: 12.5, kind: 'scene', scene: 'b2run', tr: 'dissolve', td: 0.5 },
    { id: 'night', a: 12.5, b: 17.5, kind: 'scene', scene: 'b2night', tr: 'dissolve', td: 0.8 },
    { id: 'nevin', a: 17.5, b: 22.5, kind: 'scene', scene: 'b2nevin', tr: 'dissolve', td: 0.8 },
    { id: 'desk2', a: 22.5, b: 27, kind: 'scene', scene: 'b2desk', tr: 'dissolve', td: 0.5 },
    { id: 'together', a: 27, b: 30, kind: 'scene', scene: 'b2together' },
    /* 2) seri kartı */
    { id: 'card', a: 30, b: 33.4, kind: 'game', z: 3, cam: [[0, 3.0, 2.2], [1, 3.6, 2.6]], day: 0.3, grade: 'morning', push: 0.04 },
    /* 3) mekanik */
    { id: 'roles', a: 33.4, b: 38.4, kind: 'game', z: 4, cam: [[0, 3.6, 1.6], [1, 6.4, 3.0]], day: 0.32, grade: 'morning', tr: 'dissolve', td: 0.5, push: 0.03 },
    { id: 'pick', a: 38.4, b: 44.9, kind: 'game', z: 3, cam: [[0, 3.0, 2.0], [1, 3.4, 2.2]], day: 0.34, ui: true, tr: 'dissolve', td: 0.4 },
    { id: 'desk', a: 44.9, b: 50.4, kind: 'game', z: 5, cam: [[0, 0.9, 1.3], [1, 1.2, 1.5]], day: 0.36, grade: 'morning', tr: 'dissolve', td: 0.5, push: 0.05 },
    { id: 'perks', a: 50.4, b: 56.4, kind: 'game', z: 2, cam: [[0, 4.0, 3.0], [1, 5.0, 4.6]], day: 0.38, grade: 'gold', tr: 'dissolve', td: 0.5, push: 0.03 },
    { id: 'rush', a: 56.4, b: 62.4, kind: 'game', z: 4, day: 0.415, grade: 'gold', toast: true, tr: 'dissolve', td: 0.5 },
    { id: 'four', a: 62.4, b: 67.4, kind: 'game', z: 1, cam: [[0, 4.6, 5.0], [1, 6.0, 13.5]], day: 0.74, grade: 'dusk', glow: true, tr: 'dissolve', td: 0.5, push: 0.02 },
    /* 4) kapanış */
    { id: 'end', a: 67.4, b: 72, kind: 'scene', scene: 'b2end', tr: 'dissolve', td: 0.8, dim: 0.45, end: true }
  ],
  text: L => [
    { a: 0.95, b: 2.15, kind: 'title', t: L.hook[0], s: L.hook[1], top: true },
    { a: 2.6, b: 4.2, kind: 'chip', t: L.who[0] },
    { a: 4.4, b: 6.0, kind: 'chip', t: L.who[1] },
    { a: 8.0, b: 10.6, kind: 'chip', t: L.who[2] },
    { a: 13.0, b: 14.8, kind: 'chip', t: L.who[3] },
    { a: 19.0, b: 20.9, kind: 'chip', t: L.who[4] },
    { a: 27.4, b: 30.0, kind: 'int', t: L.quote },
    { a: 30.0, b: 33.3, kind: 'episode' },
    { a: 33.4, b: 67.3, kind: 'corner', t: L.corner },
    { a: 33.7, b: 38.25, kind: 'title', t: L.roles[0], s: L.roles[1] },
    { a: 38.6, b: 44.75, kind: 'title', t: L.pick[0], s: L.pick[1], top: true },
    { a: 39.2, b: 40.15, kind: 'tap', sel: 'btn:' + L.mgrCard },
    { a: 41.9, b: 43.4, kind: 'tap', sel: 'btn:Nevin Hanım' },
    { a: 45.2, b: 50.25, kind: 'title', t: L.auto[0], s: L.auto[1] },
    { a: 50.8, b: 56.25, kind: 'title', t: L.perks[0], s: L.perks[1] },
    { a: 50.9, b: 56.25, kind: 'perks', items: L.perkList, gap: 0.5 },
    { a: 56.7, b: 62.25, kind: 'title', t: L.rush[0], s: L.rush[1] },
    { a: 62.8, b: 67.3, kind: 'title', t: L.four[0], s: L.four[1] },
    { a: 67.9, b: 72, kind: 'end' }
  ],
  flash: [[2.2, 0.7], [30.0, 0.85], [43.35, 0.3]],
  grades: { freeze: ['#6a7488', 'saturation', 0.55], morning: ['#ffd6a0', 'soft-light', 0.16], gold: ['#ffb060', 'soft-light', 0.24], dusk: ['#ff8a5a', 'soft-light', 0.2] },

  /* sayfada: çekim kurulumları */
  pageInit: function (L, LANG, V) {
    const F = window.__F;
    const st = document.createElement('style');
    st.textContent = 'body.tbv #tbg .tb-ep b{font-size:36px;text-align:center;line-height:1.1;padding:0 20px}body.tbv #tbg .tb-ep em{font-size:20px}' +
      '#tbg .tb-ep{background:radial-gradient(ellipse at 50% 46%,rgba(6,10,22,.88) 0%,rgba(6,10,22,.7) 45%,rgba(6,10,22,.35) 100%)}' +
      'body.tbv #tbg .tb-chip{top:auto;bottom:330px;font-size:17px}';
    document.head.appendChild(st);
    BT.S.hero = { n: 'Rıza', hs: 0, hc: 0, sk: 1, hw: 3, fc: 2, co: 0, ap: 1 }; BT.S.ctrl = 2;
    const CANDS = [{ n: 'Nevin Hanım', a: 'value', b: 'pat', fee: 2500, look: 1 }, { n: 'Sadık Bey', a: 'wspeed', b: 'wage', fee: 2000, look: 0 }, { n: 'Filiz Hanım', a: 'flow', b: 'rep', fee: 3000, look: 2 }];
    const OTHERS = [null, { n: 'Sadık Bey', a: 'wspeed', b: 'wage', wage: 45, look: 0 }, { n: 'Filiz Hanım', a: 'flow', b: 'rep', wage: 55, look: 2 }, { n: 'Orhan Bey', a: 'pat', b: 'value', wage: 65, look: 0 }];
    const closePanel = () => { const c = document.getElementById('dpClose'); if (c && !document.getElementById('devpanel').classList.contains('hidden')) c.click(); };
    let done = {};
    window.__setup = (g, prev) => {
      const id = g.id;
      F.makeRich(); BT.S.ctrl = 2;
      window.__noTags = id === 'roles' ? 0 : 1;                                           /* rol etiketleri yalnız kadro çekiminde */
      const mgrShots = ['desk', 'rush', 'four'].includes(id);
      window.__mgrLabel = mgrShots ? 1 : 0;
      window.__uiKeep = mgrShots ? (q => typeof q.s === 'string' && q.s.indexOf('👔') === 0) : (() => false);
      window.__uiScale = id === 'desk' || id === 'rush' ? (V ? 1.25 : 1.6) : 1;
      if (prev === 'pick') closePanel();
      if (g.day) BT.day.t = BT.DAY_LEN * g.day;
      if (id === 'pick') {
        BT.S.mgrCand = [CANDS.map(c => Object.assign({}, c))]; BT.S.cash = 184250; done = {};
        document.getElementById('dtLevel').click(); F.step(0.2);
        const b = F.byText(L.mgrCard); if (b) b.closest('.dcard').scrollIntoView({ inline: 'center', block: 'nearest' });
      }
      if (id === 'desk' && !(BT.S.mgr && BT.S.mgr[0])) window.__hireMgr(0, CANDS[0]);        /* önizlemede 'pick' atlanırsa */
      if (id === 'rush') BT.counters.filter(c => c.z === 0).forEach(c => { for (let i = 0; i < 12; i++) c.tray.items.push({ k: 'money', v: 40 }); });
      if (id === 'four') {
        for (let z = 1; z < 4; z++) if (!BT.S.mgr[z]) { BT.S.mgr[z] = Object.assign({}, OTHERS[z]); BT.S.auto = BT.S.auto || []; BT.S.auto[z] = true; }
        F.step(0.5);
      }
      if (id !== 'pick') F.hideOv();
    };
    window.__frame = (g, lt) => {
      if (g.id === 'pick') {
        if (lt >= 1.75 && !done.a) { done.a = 1; const b = F.byText(L.mgrCard); if (b) b.click(); F.step(0.1); const n = F.byText('Nevin Hanım'); if (n) n.closest('.dcard').scrollIntoView({ inline: 'center', block: 'nearest' }); }
        if (lt >= 4.5 && !done.b) { done.b = 1; const n = F.byText('Nevin Hanım'); if (n) n.click(); }          /* satın alma iki dokunuş: seç + onayla */
        if (lt >= 4.95 && !done.c) { done.c = 1; const n = F.byText('Nevin Hanım'); if (n) n.click(); }
      }
      if (g.id === 'rush') { const a = BT.mgrAct()[0]; if (a) window.__cam = { x: a.x + 0.6, y: a.y + 0.5 }; else window.__cam = { x: 1.2, y: 1.4 }; }
    };
  }
});
