/* GÜN 4 — Müşteri sabrı: boş tezgâh, eriyen sabır, kaçan müşteri; tipler farklı bekler */
module.exports = {
  id: 'gun-04', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 4', sting: 'GÜN 4', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4.5,
      caps: [[0.8, 4.5, 'Müşteriler sonsuza kadar<br><em>beklemez.</em>']],
      prep: () => {
        window.__zoom(3);
        window.__plan = [{ cycle: true, times: 4 }, { to: [7.6, 4.6] }, { until: true, max: 999 }];   /* eğitimi gerçekten oyna, sonra kenara çekil */
        window.__ff(400, 'window.__plan.length === 1');
        window.__ff(120, 'BT.customers.filter(c => c.state === "wait").length >= 3');
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      } },
    { len: 6, tag: '▶▶ BİRAZ İLERİ SARDIM',
      hlw: 'window.__cu ? [window.__cu.x, window.__cu.y - 0.2] : null',
      caps: [[0, 3, 'Tezgâh boşsa<br><em>sabır çubuğu</em> erir.'], [3, 6, 'Biterse müşteri <em>kaçar</em>,<br>satış elinden gider.']],
      prep: () => {
        window.__ff(90, 'BT.customers.some(c => c.state === "wait" && c.pat < 3.2)');
        window.__cu = BT.customers.filter(c => c.state === 'wait').sort((a, b) => a.pat - b.pat)[0];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      } },
    { len: 6,
      caps: [[0, 3, 'Herkesin sabrı <em>farklı</em>:'], [3, 6, 'kimi yarım dakika bekler,<br>kimi <em>iki dakika</em>.']],
      prep: () => { window.__cu = null; } },
    { len: 5.5,
      caps: [[0, 2.7, 'Yetiş, filetoyu diz…'], [2.7, 5.5, '…kuyruk <em>erisin.</em>']],
      prep: () => {
        const T = BT.tables[0], C = BT.counters[0];
        window.__plan = [{ to: [BT.spots[0].x, BT.spots[0].y + 0.9] }, { until: 'BT.player.carry.length >= 8 || BT.spots[0].stock.length === 0', max: 6 },
          { to: [T.x - 0.2, T.y + 0.3] }, { until: 'BT.player.carry.length === 0', max: 4 }, { until: 'BT.tables[0].mat.items.length >= 4', max: 20 },
          { to: [T.mat.x, T.mat.y] }, { until: 'BT.tables[0].mat.items.length === 0 || BT.player.carry.length >= 8', max: 5 },
          { to: [(T.mat.x + C.x) / 2 - 0.4, (T.mat.y + C.y) / 2 + 0.3] }];
        window.__ff(60, 'window.__plan.length === 0');
        window.__plan = [{ to: [C.x - 0.9, C.y + 0.3], tol: 0.6 }, { until: 'BT.player.carry.length === 0', max: 3 }, { until: true, max: 99 }];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      } },
    { len: 5.5, end: { q: 'Sen sırada<br><em>kaç dakika</em> beklersin?', sm: 'YORUMLARA YAZ · YARIN: GELİŞTİRME GÜNÜ 5' },
      caps: [[0, 5.5, 'Sen sırada kaç dakika beklersin?', true]] }
  ],
  cover: { day: 'GELİŞTİRME GÜNÜ 4', title: 'Müşteriler<br><span style="color:#ffd166">beklemez</span>', sub: 'Sabır çubuğu ve kaçan müşteri' }
};
