/* GÜN 3 — Kesim masası: bütün balık satılmaz, önce fileto */
module.exports = {
  id: 'gun-03', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 3', sting: 'GÜN 3', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4,
      caps: [[0.8, 4, 'Tezgâhta <em>bütün balık</em><br>satılmaz.']],
      prep: () => {
        window.__zoom(3); window.__ff(50);
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        window.__plan = [{ to: [BT.spots[0].x, BT.spots[0].y + 0.9] }, { until: 'BT.player.carry.length >= 8', max: 6 },
          { to: [BT.tables[0].x - 0.2, BT.tables[0].y + 0.3] }, { until: 'BT.player.carry.length === 0', max: 4 }, { until: true, max: 99 }];
      } },
    { len: 6.5,
      hlw: '[BT.tables[0].x, BT.tables[0].y]',
      caps: [[0, 3.2, 'Önce <em>kesim masasına</em><br>bırakırsın.'], [3.2, 6.5, 'Masa balıkları tek tek<br><em>filetoya</em> çevirir.']] },
    { len: 6.5,
      hlw: '[BT.tables[0].mat.x, BT.tables[0].mat.y]',
      caps: [[0, 3.2, 'Filetolar <em>hasırda</em> birikir.'], [3.2, 6.5, 'Hasırdan alıp<br><em>tezgâha</em> taşırsın.']],
      prep: () => {
        window.__plan = [{ until: 'BT.tables[0].mat.items.length >= 2', max: 4 }, { until: true, max: 1.5 },
          { to: [BT.tables[0].mat.x, BT.tables[0].mat.y] }, { until: 'BT.tables[0].mat.items.length === 0', max: 4 },
          { to: [BT.counters[0].x - 0.9, BT.counters[0].y + 0.3], tol: 0.6 }, { until: true, max: 99 }];
      } },
    { len: 5.5, tag: '▶▶ İLERİ SARDIM · BİRKAÇ OYUN GÜNÜ SONRA',
      caps: [[0, 2.7, 'Her bölgenin kendi balığı,<br>kendi <em>masası</em> var:'], [2.7, 5.5, 'hamsi, uskumru, palamut,<br>levrek, somon…']],
      prep: () => {
        const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 26400; S.rep = 700;
        for (let i = 1; i < BT.areas.length; i++) BT.areas[i].locked = false;
        BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 3); });
        BT.rebuildCounters();
        for (let z = 0; z < BT.areas.length; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
        BT.counters.forEach(c => { c.open = true; c.seen = true; });
        BT.reassignWorkers(); BT.day.phase = 'play'; BT.day.t = 40;
        window.__plan = []; BT.player.x = 4.2; BT.player.y = 5.2;
        window.__ff(30);
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        window.__zoom(2); BT.player.x = 4.2; BT.player.y = 5.2;
        window.__plan = [{ to: [4.0, 12.5] }, { until: true, max: 99 }];
      } },
    { len: 5.5, end: { q: 'Sence hangi balık<br><em>daha çok satar?</em>', sm: 'YORUMLARA YAZ · YARIN: GELİŞTİRME GÜNÜ 4' },
      caps: [[0, 5.5, 'Sence hangi balık daha çok satar?', true]] }
  ],
  cover: { day: 'GELİŞTİRME GÜNÜ 3', title: 'Balık kesilmeden<br><span style="color:#ffd166">satılmaz</span>', sub: 'Kesim masası ve fileto', pos: [5.4, 2.6] }
};
