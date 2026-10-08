/* GÜN 1 — "Her şey bu küçük iskelede başlıyor": temel döngü (ağ → kesim → tezgâh → satış) ve büyüme.
   Sahne: [süre, altyazılar [başla, bitir, metin, yalnızSRT?], prep (sahne başında sayfada bir kez), frame (her karede, u = 0..1)] */
module.exports = {
  id: 'gun-01',
  lang: 'tr',
  series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 1', sting: 'GÜN 1',
  hero: 'Recai',
  company: 'Recai Balıkçılık',
  /* anlatım: [başla, en geç bitir, metin] — voice.py seslendirir, make.py müziği altına kısar */
  vo: [
    [0.45, 4.5, 'Bir balıkçı oyunu yapıyorum. Her şey bu küçük iskelede başlıyor.'],
    [4.6, 10.0, 'Ağlar kendiliğinden doluyor. Balığı sırtlayıp kesim masasına taşıyorsun.'],
    [10.1, 16.4, 'Filetoları tezgâha diziyorsun. Müşteri sırası gelince alıyor, para kasaya giriyor.'],
    [16.6, 22.4, 'Kazandıkça iskele büyüyor: yeni tezgâhlar, çalışanlar, yeni bölgeler.'],
    [22.6, 27.6, 'Peki sen bu dükkânın tabelasına ne yazardın? Yorumlara yaz.']
  ],
  segs: [
    { /* 1) kanca: yeni açılmış oyun, küçücük iskele */
      len: 4.5,
      caps: [[0.8, 2.4, 'Bir balıkçı oyunu yapıyorum.'], [2.4, 4.5, 'Her şey bu küçük<br>iskelede başlıyor.']],
      prep: () => {
        window.__zoom(3);
        window.__plan = [{ until: true, max: 3.2 }, { to: [BT.spots[0].x, BT.spots[0].y + 0.9] },
          { until: 'BT.player.carry.length >= 6', max: 3.4 },
          { to: [BT.tables[0].x - 0.2, BT.tables[0].y + 0.3] }, { until: 'BT.player.carry.length === 0', max: 4 }];
      }
    },
    { /* 2) ağdan balık toplama → kesim masası (plan sürüyor) */
      len: 5.5,
      caps: [[0, 2.7, 'Ağlar kendiliğinden dolar.'], [2.7, 5.5, 'Balığı sırtlayıp<br><em>kesim masasına</em> taşırsın.']]
    },
    { /* 3) filetolar tezgâha, müşteri alır — kesilmeyi beklemek ileri sarılır */
      len: 6.5,
      caps: [[0, 3.1, 'Filetoları <em>tezgâha</em> dizersin.'], [3.1, 6.5, 'Müşteri sırası gelince alır,<br>para <em>kasaya</em> girer.']],
      prep: () => {
        const T = BT.tables[0], C = BT.counters[0];
        window.__plan = [{ until: 'BT.player.carry.length === 0', max: 4 }, { until: 'BT.tables[0].mat.items.length >= 3', max: 20 },
          { to: [T.mat.x, T.mat.y] }, { until: 'BT.tables[0].mat.items.length === 0 || BT.player.carry.length >= 8', max: 5 },
          { to: [(T.mat.x + C.x) / 2 - 0.4, (T.mat.y + C.y) / 2 + 0.3] }];
        window.__ff(40, 'window.__plan.length === 0');
        window.__plan = [{ to: [C.x - 0.9, C.y + 0.3], tol: 0.6 }, { until: 'BT.player.carry.length === 0', max: 3 }, { until: true, max: 99 }];
      }
    },
    { /* 4) büyüme: aynı oyun, birkaç gün sonrası (ileri sarıldığı açıkça yazar) */
      len: 6,
      caps: [[0, 2.8, 'Kazandıkça iskele <em>büyür</em>:'], [2.8, 6, 'yeni tezgâhlar, çalışanlar,<br>yeni bölgeler…']],
      tag: '▶▶ İLERİ SARDIM · BİRKAÇ OYUN GÜNÜ SONRA',
      prep: () => {
        const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 48250; S.rep = 900; BT.day.n = 9;
        for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
        BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
        BT.rebuildCounters();
        for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
        BT.decor.forEach(d => { d.got = true; });
        BT.counters.forEach(c => { c.open = true; c.seen = true; });
        BT.reassignWorkers();
        BT.day.phase = 'play'; BT.day.t = 40;
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        window.__plan = []; BT.player.x = 6.0; BT.player.y = 3.2;
        window.__ff(28);
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        window.__zoom(2);
        BT.player.x = 6.0; BT.player.y = 3.2;
        window.__plan = [{ to: [6.6, 8.6], tol: 0.4 }, { to: [6.4, 13.5] }];
      }
    },
    { /* 5) tek soru */
      len: 5.5, end: { sign: '?????', typeSec: 0.35, q: 'Sen bu dükkânın<br>tabelasına ne yazardın?', sm: 'YORUMLARA YAZ · YARIN: GELİŞTİRME GÜNÜ 2' },
      caps: [[0, 5.5, 'Sen bu dükkânın tabelasına ne yazardın?', true]]
    }
  ],
  /* kapak (dikey 1080×1920): büyümüş koy + başlık */
  cover: { day: 'GELİŞTİRME GÜNÜ 1', title: 'Bir balıkçı oyunu<br><span style="color:#ffd166">yapıyorum</span>', sub: 'Her şey küçük bir iskelede başlıyor', pos: [6.4, 6.0] }
};
