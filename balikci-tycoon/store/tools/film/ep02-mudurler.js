/* Geliştirme Günlüğü · Gün 2 · MÜDÜRLER (≈59 sn)
   Yapı (seri şablonu): 1) sinematik hikâye — bir karakterin kısa öyküsü, elle çizilmiş sahneler
                        2) seri kartı — HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ · GÜN n · konu
                        3) mekanik — gerçek oyun görüntüsü ve arayüzü, büyük başlıklar
                        4) kapanış — hikâyenin ilk sahnesine dönüş + "bir sonraki günlükte görüşürüz"
   Kahraman: Nevin Hanım — oyundaki müdür adaylarından (MGR_NAMES), oyundaki görünümüyle (look 1: mor ceket, altın fular).
   Kullanım: node store/tools/film/ep02-mudurler.js [en|tr] [preview [çekim,çekim]]   (dikey; 'h' ile yatay)
   Müzik: python3 store/tools/film/ep02-music.py store/video/ep02-music.wav (varsa motor MP4'ü de üretir) */
const film = require('./engine');

const L = {
  tr: {
    firm: 'Gümüş Ağ Balıkçılık', num: 'tr-TR',
    s1: 'Her limanın uyumayan biri vardır.', s2: 'Nevin Hanım otuz yıl koyun defterini tuttu.',
    s3: 'Sonra koy büyüdü. Tek bir çift el yetmez oldu.', s4: 'Ve masasına oturdu.',
    plate: 'MÜDÜR', ep: ['HAMSİ KOYU · GELİŞTİRME GÜNLÜĞÜ', 'GÜN 2', 'MÜDÜRLER'], corner: 'GÜN 2 · MÜDÜRLER',
    roles: ['ÖNCE KADRO', 'Hamal, filetocu, tezgâhtar, tahsildar. Dördü tamamlanınca müdür kapısı açılır.'],
    pick: ['3 ADAY · 2\'ŞER YETENEK', 'Bölgene uyan müdürü seç.'], mgrCard: 'Balıkçı İskelesi — Müdür',
    auto: ['BÖLGE KENDİ KENDİNE İŞLER', 'Müdür gelince bölge tam otomatiğe geçer.'],
    perks: ['ALTI YETENEK', 'Her aday bunlardan ikisini getirir.'],
    perkList: ['Satış fiyatı <u>+%12</u>', 'Personel <u>%20</u> hızlı', 'Müşteri sabrı <u>+%35</u>', 'Müşteri akışı <u>+%12</u>', 'Bölge maaşları <u>−%30</u>', 'Satış başına <u>+1</u> itibar'],
    rush: ['YOĞUN SAATTE SAHAYA İNER', 'Dolan kasayı boşaltır, azalan tezgâhı doldurur.'],
    four: ['DÖRT BÖLGE · DÖRT MÜDÜR', 'Her bölgenin kendi masası, kendi yetenekleri.'],
    end: ['Bir sonraki günlükte görüşürüz.', 'ÜCRETSİZ · REKLAMSIZ · SATIN ALMASIZ', 'Oyna: recaikas.github.io/okult-kahin-byblbn']
  },
  en: {
    firm: 'Silver Net Co.', num: 'en-US',
    s1: 'Every harbor has someone who never sleeps.', s2: 'For thirty years, Nevin kept the cove\'s books.',
    s3: 'Then the cove grew. One pair of hands wasn\'t enough.', s4: 'So she took her seat.',
    plate: 'MANAGER', ep: ['HAMSI COVE · DEVLOG', 'DAY 2', 'MANAGERS'], corner: 'DAY 2 · MANAGERS',
    roles: ['FIRST, THE CREW', 'Porter, filleter, stall-keeper, cashier. Fill all four to unlock a manager.'],
    pick: ['3 CANDIDATES · 2 PERKS EACH', 'Pick the manager who fits your zone.'], mgrCard: 'Fishing Pier — Manager',
    auto: ['THE ZONE RUNS ITSELF', 'With a manager, the zone goes fully automatic.'],
    perks: ['SIX PERKS', 'Every candidate brings two of these.'],
    perkList: ['Sale price <u>+12%</u>', 'Staff <u>20%</u> faster', 'Customer patience <u>+35%</u>', 'Customer flow <u>+12%</u>', 'Zone wages <u>−30%</u>', '<u>+1</u> reputation per sale'],
    rush: ['AT RUSH HOUR, SHE STEPS IN', 'Empties full tills, restocks low stalls.'],
    four: ['FOUR ZONES · FOUR MANAGERS', 'Each zone gets its own desk and perks.'],
    end: ['See you in the next devlog.', 'FREE · NO ADS · NO IN-APP PURCHASES', 'Play: recaikas.github.io/okult-kahin-byblbn']
  }
};

film({
  id: 'ep02', dur: 59, L,
  shots: L => [
    /* 1) hikâye */
    { id: 'office', a: 0, b: 5.5, kind: 'scene', scene: 'office', fadeIn: 1.4 },
    { id: 'ledger', a: 5.5, b: 10, kind: 'scene', scene: 'ledger', tr: 'dissolve', td: 0.8 },
    { id: 'walk', a: 10, b: 15, kind: 'scene', scene: 'walk', tr: 'dissolve', td: 0.8 },
    { id: 'seat', a: 15, b: 19, kind: 'scene', scene: 'desk', opt: { plate: L.plate }, tr: 'dissolve', td: 0.6 },
    /* 2) seri kartı */
    { id: 'card', a: 19, b: 22.5, kind: 'scene', scene: 'desk', t0: 4, opt: { plate: L.plate }, dim: 0.6 },
    /* 3) mekanik */
    { id: 'roles', a: 22.5, b: 27.5, kind: 'game', z: 4, cam: [[0, 3.6, 1.6], [1, 6.4, 3.0]], day: 0.2, grade: 'morning', tr: 'dissolve', td: 0.5, push: 0.03 },
    { id: 'pick', a: 27.5, b: 33.5, kind: 'game', z: 3, cam: [[0, 3.0, 2.0], [1, 3.4, 2.2]], day: 0.25, ui: true, tr: 'dissolve', td: 0.4 },
    { id: 'desk', a: 33.5, b: 38.5, kind: 'game', z: 5, cam: [[0, 0.9, 1.3], [1, 1.2, 1.5]], day: 0.28, grade: 'morning', tr: 'dissolve', td: 0.5, push: 0.05 },
    { id: 'perks', a: 38.5, b: 44, kind: 'game', z: 2, cam: [[0, 4.0, 3.0], [1, 5.0, 4.6]], day: 0.33, grade: 'gold', tr: 'dissolve', td: 0.5, push: 0.03 },
    { id: 'rush', a: 44, b: 50, kind: 'game', z: 4, day: 0.415, grade: 'gold', toast: true, tr: 'dissolve', td: 0.5 },
    { id: 'four', a: 50, b: 54, kind: 'game', z: 1, cam: [[0, 4.6, 5.0], [1, 6.0, 13.5]], day: 0.74, grade: 'dusk', glow: true, tr: 'dissolve', td: 0.5, push: 0.02 },
    /* 4) kapanış: ofise dönüş, sandalye boş, lamba yanıyor */
    { id: 'end', a: 54, b: 59, kind: 'scene', scene: 'office', t0: 6, opt: { empty: true }, tr: 'dissolve', td: 0.9, end: true }
  ],
  text: L => [
    { a: 1.5, b: 5.3, kind: 'int', t: L.s1 },
    { a: 6.1, b: 9.8, kind: 'int', t: L.s2 },
    { a: 10.6, b: 14.8, kind: 'int', t: L.s3 },
    { a: 16.2, b: 18.9, kind: 'int', t: L.s4, low: true },
    { a: 19.0, b: 22.4, kind: 'episode' },
    { a: 22.5, b: 54.0, kind: 'corner', t: L.corner },
    { a: 22.8, b: 27.35, kind: 'title', t: L.roles[0], s: L.roles[1] },
    { a: 27.7, b: 33.35, kind: 'title', t: L.pick[0], s: L.pick[1], top: true },
    { a: 28.3, b: 29.25, kind: 'tap', sel: 'btn:' + L.mgrCard },
    { a: 31.0, b: 32.5, kind: 'tap', sel: 'btn:Nevin Hanım' },
    { a: 33.8, b: 38.35, kind: 'title', t: L.auto[0], s: L.auto[1] },
    { a: 38.8, b: 43.85, kind: 'title', t: L.perks[0], s: L.perks[1] },
    { a: 38.9, b: 43.85, kind: 'perks', items: L.perkList, gap: 0.5 },
    { a: 44.3, b: 49.85, kind: 'title', t: L.rush[0], s: L.rush[1] },
    { a: 50.3, b: 53.9, kind: 'title', t: L.four[0], s: L.four[1] },
    { a: 54.6, b: 59, kind: 'end' }
  ],
  flash: [[19.0, 0.8], [32.45, 0.3]],
  grades: { morning: ['#ffd6a0', 'soft-light', 0.16], gold: ['#ffb060', 'soft-light', 0.26], dusk: ['#ff8a5a', 'soft-light', 0.2] },

  /* sayfada: çekim kurulumları */
  pageInit: function (L, LANG, V) {
    const F = window.__F;
    const CANDS = [{ n: 'Nevin Hanım', a: 'value', b: 'pat', fee: 2500, look: 1 }, { n: 'Sadık Bey', a: 'wspeed', b: 'wage', fee: 2000, look: 0 }, { n: 'Filiz Hanım', a: 'flow', b: 'rep', fee: 3000, look: 2 }];
    const OTHERS = [null, { n: 'Sadık Bey', a: 'wspeed', b: 'wage', wage: 45, look: 0 }, { n: 'Filiz Hanım', a: 'flow', b: 'rep', wage: 55, look: 2 }, { n: 'Orhan Bey', a: 'pat', b: 'value', wage: 65, look: 0 }];
    const closePanel = () => { const c = document.getElementById('dpClose'); if (c && !document.getElementById('devpanel').classList.contains('hidden')) c.click(); };
    let done = {};
    window.__setup = (g, prev) => {
      const id = g.id;
      F.makeRich();
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
      if (id === 'rush') {                                                                /* yoğunluk ~0.8 sn sonra başlar; kasalar dolmuş */
        BT.counters.filter(c => c.z === 0).forEach(c => { for (let i = 0; i < 12; i++) c.tray.items.push({ k: 'money', v: 40 }); });
      }
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
