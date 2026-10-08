/* GÜN 2 — Taşıma sınırı ve ilk yükseltme (KAPASİTE +3) */
const CARRY = '#hud .chip:nth-child(2)';
module.exports = {
  id: 'gun-02', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 2', sting: 'GÜN 2', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4.5,
      caps: [[0.8, 4.5, 'Sırtında en fazla<br><em>8 balık</em> taşıyabilirsin.']],
      prep: () => {
        window.__zoom(3); window.__ff(55);   /* ağ iyice dolsun (kayıt dışı) */
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        window.__hl('#hud .chip:nth-child(2)');
        window.__plan = [{ to: [BT.spots[0].x, BT.spots[0].y + 0.9] }, { until: 'BT.player.carry.length >= 8', max: 8 }, { until: true, max: 2.2 },
          { to: [BT.tables[0].x - 0.2, BT.tables[0].y + 0.3] }, { until: 'BT.player.carry.length === 0', max: 4 }, { until: true, max: 99 }];
      } },
    { len: 5.5,
      caps: [[0, 2.8, 'Ağda balık kalsa da<br>sırt dolunca <em>alamazsın</em>.'], [2.8, 5.5, 'Her tur yürümek<br><em>zaman</em> demek.']] },
    { len: 6.5, tag: '▶▶ BİRKAÇ TUR SONRA',
      caps: [[0, 3.2, 'İlk <em>120$</em> ile:<br>KAPASİTE yükseltmesi'], [3.2, 6.5, '+3 taşıma.<br>Artık sırtta <em>11 balık</em>.']],
      prep: () => {
        window.__hl(null);
        window.__plan = [{ cycle: true }];
        window.__ff(240, 'BT.S.cash >= 125 && window.__plan[0] && window.__plan[0].to');
        window.__plan = [{ until: true, max: 999 }];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      },
      acts: [
        [0.05, `document.querySelector('.dtab[data-t="level"]').click();`],
        [0.5, `window.__hl('#dpCards .dcard', 2);`],
        [2.3, `const b = document.querySelector('#dpCards .dcard .buy'); b.click(); const c = document.querySelector('#dpCards .buy.cf'); if (c) c.click();`],
        [3.4, `const x = document.getElementById('dpClose'); if (x && x.offsetParent) x.click(); window.__hl('#hud .chip:nth-child(2)');`]
      ] },
    { len: 5, tag: '▶▶ BİRAZ İLERİ SARDIM',
      caps: [[0, 5, 'Daha az yürüyüş,<br>daha çok <em>satış</em>.']],
      prep: () => {
        window.__hl(null); window.__plan = [{ to: [BT.tables[0].x - 0.2, BT.tables[0].y + 1.4] }];
        window.__ff(30);
        window.__hl('#hud .chip:nth-child(2)');
        window.__plan = [{ to: [BT.spots[0].x, BT.spots[0].y + 0.9] }, { until: 'BT.player.carry.length >= 11', max: 9 }, { until: true, max: 99 }];
      } },
    { len: 5.5, end: { q: 'İlk paranı neye harcardın:<br><em>kapasite</em> mi, <em>hız</em> mı?', sm: 'YORUMLARA YAZ · YARIN: GELİŞTİRME GÜNÜ 3' },
      caps: [[0, 5.5, 'İlk paranı neye harcardın: kapasite mi, hız mı?', true]] }
  ],
  cover: { day: 'GELİŞTİRME GÜNÜ 2', title: 'Sırtında kaç<br><span style="color:#ffd166">balık taşırsın?</span>', sub: 'Taşıma sınırı ve ilk yükseltme' }
};
