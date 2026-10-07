/* GÜN 7 — İlk çalışan: 4 rol, Hamal işe alınır ve ağdan kesime taşımaya başlar */
module.exports = {
  id: 'gun-07', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 7', sting: 'GÜN 7', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4.5,
      caps: [[0.8, 4.5, 'Her şeyi tek başına<br>taşımak <em>yoruyor.</em>']],
      prep: () => {
        window.__zoom(3);
        window.__plan = [{ cycle: true, times: 2 }];
        window.__ff(200, 'window.__plan.length === 0');
        window.__plan = [{ cycle: true }];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      } },
    { len: 7, tag: '▶▶ BİRKAÇ TUR SONRA',
      caps: [[0, 3.2, 'İlk çalışanını seç:<br><em>4 rol</em> var.'], [3.2, 7, 'Hamal, Filetocu,<br>Tezgâhtar, Tahsildar']],
      prep: () => {
        window.__ff(400, 'BT.S.cash >= 380 && window.__plan[0] && window.__plan[0].to');
        window.__plan = [{ until: true, max: 999 }];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      },
      acts: [
        [0.1, `document.querySelector('.dtab[data-t="level"]').click();`],
        [0.9, `[...document.querySelectorAll('#dpCards .dcard')].find(d => /personeli/.test(d.textContent)).querySelector('.buy').click();`],
        [1.4, `window.__hl('#dpCards', 4);`]
      ] },
    { len: 6.5, hlw: 'BT.workers[0] ? [BT.workers[0].x, BT.workers[0].y] : null',
      caps: [[0, 3.2, 'İlk çalışan:<br><em>Hamal</em> ($15/dk)'], [3.2, 6.5, 'Ağdan kesime<br>artık <em>o</em> taşıyor.']],
      acts: [
        [0.2, `const c = [...document.querySelectorAll('#dpCards .dcard')].find(d => /Hamal/.test(d.textContent)); window.__hl(null); c.querySelector('.buy').click(); const f = document.querySelector('#dpCards .buy.cf'); if (f) f.click();`],
        [1.0, `const x = document.getElementById('dpClose'); if (x && x.offsetParent) x.click(); document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dlEnd') o.classList.add('hidden'); });`]
      ] },
    { len: 5, hlw: 'BT.workers[0] ? [BT.workers[0].x, BT.workers[0].y] : null',
      caps: [[0, 5, 'Sen de <em>tezgâha</em><br>yetişirsin.']],
      prep: () => { const C = BT.counters[0]; window.__plan = [{ to: [C.x - 0.9, C.y + 0.3], tol: 0.6 }, { until: true, max: 999 }]; } },
    { len: 5.5, end: { q: 'İlk kimi<br><em>işe alırdın?</em>', sm: 'YORUMLARA YAZ · YARIN: GÜN 8' },
      caps: [[0, 5.5, 'İlk kimi işe alırdın?', true]] }
  ],
  cover: { day: 'GÜN 7', title: 'İlk<br><span style="color:#ffd166">çalışanım</span>', sub: 'Hamal, Filetocu, Tezgâhtar, Tahsildar' }
};
