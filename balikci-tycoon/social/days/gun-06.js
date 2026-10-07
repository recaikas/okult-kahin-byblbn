/* GÜN 6 — Tezgâh paneli: her tezgâhın karnesi (gelir, gider, dünden farkı), kapatma kararı */
module.exports = {
  id: 'gun-06', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 6', sting: 'GÜN 6', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4.5, tag: '▶▶ İLERİ SARDIM · BİRKAÇ OYUN GÜNÜ SONRA',
      caps: [[0.8, 4.5, 'Tezgâh çoğalınca<br><em>hangisi kazandırıyor?</em>']],
      prep: () => {
        const S = BT.S; S.tut = 99; S.ctrl = 2; S.cash = 21800; S.rep = 420;
        for (let i = 1; i < 3; i++) BT.areas[i].locked = false;
        BT.areas.forEach(a => { a.lvl = Math.max(a.lvl, 2); });
        BT.rebuildCounters();
        for (let z = 0; z < 3; z++) BT.zoneRoles(z).forEach(r => BT.hire(r, true, z));
        BT.counters.forEach(c => { c.open = true; c.seen = true; });
        BT.reassignWorkers(); BT.day.phase = 'play'; BT.day.t = 30;
        window.__plan = [{ until: true, max: 999 }]; BT.player.x = 5.0; BT.player.y = 6.0;
        /* iki gün gerçekten oynansın: dünkü ve bugünkü rakamlar dolsun */
        for (let d = 0; d < 2; d++) {
          window.__ff(400, '!document.getElementById("dayScr").classList.contains("hidden")');
          document.getElementById('dayGo').click();
          window.__ff(3);
          const g = document.getElementById('prepGo'); if (g && !document.getElementById('prepScr').classList.contains('hidden')) g.click();
          document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dlEnd') o.classList.add('hidden'); });
        }
        window.__ff(70);
        document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dlEnd') o.classList.add('hidden'); });
        window.__zoom(2);
      } },
    { len: 7, capTop: '84%', tagTop: '92%',
      caps: [[0, 3.4, 'Her tezgâhın <em>karnesi</em> var:'], [3.4, 7, 'gelir, gider ve<br>dünden farkı <em>↑↓</em>']],
      acts: [[0.2, `document.getElementById('stallBtn').click();`], [1.0, `window.__hl('#stallRows', 6);`]] },
    { len: 6, capTop: '94.5%',
      caps: [[0, 3, 'Dokun: <em>ayrıntı.</em>'], [3, 6, 'Yetişemediğini <em>kapat.</em>']],
      acts: [[0.3, `window.__hl(null); const r = document.querySelectorAll('#stallRows .srow'); if (r[0]) r[0].click();`],
             [3.0, `window.__hl('#stallRows', 6);`]] },
    { len: 5.5, end: { q: 'Sence hangi tezgâh<br><em>en çok</em> kazandırır?', sm: 'YORUMLARA YAZ · YARIN: GÜN 7' },
      prep: () => { window.__hl(null); document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dlEnd') o.classList.add('hidden'); }); },
      caps: [[0, 5.5, 'Sence hangi tezgâh en çok kazandırır?', true]] }
  ],
  cover: { day: 'GÜN 6', title: 'Hangi tezgâh<br><span style="color:#ffd166">kazandırıyor?</span>', sub: 'Tezgâh paneli: gelir, gider, ↑↓' }
};
