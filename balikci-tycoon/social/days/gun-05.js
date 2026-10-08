/* GÜN 5 — Akşam: liman kapanır, gün sonu hesabı, yeni gün */
module.exports = {
  id: 'gun-05', lang: 'tr', series: 'GELİŞTİRME GÜNLÜĞÜ · GÜN 5', sting: 'GÜN 5', hero: 'Recai', company: 'Recai Balıkçılık',
  segs: [
    { len: 4.5,
      caps: [[0.8, 4.5, 'Akşam olunca<br>liman <em>kapanır.</em>']],
      prep: () => {
        window.__zoom(3);
        window.__plan = [{ cycle: true, times: 3 }];
        window.__ff(300, 'window.__plan.length === 0');
        BT.day.t = Math.max(BT.day.t, BT.DAY_LEN - 9);
        window.__plan = [{ cycle: true }];
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      } },
    { len: 6.5, tag: '▶▶ BİRAZ İLERİ SARDIM', capTop: '80%', tagTop: '88.5%',
      caps: [[0, 3.2, 'Gün sonu <em>hesabı</em>:'], [3.2, 6.5, 'satış, kaçan müşteri,<br>günün <em>kazancı</em>.']],
      prep: () => {
        window.__plan = [{ until: true, max: 999 }];
        window.__ff(90, '!document.getElementById("dayScr").classList.contains("hidden")');
      },
      acts: [[0.6, `window.__hl('#dayRows', 6);`]] },
    { len: 5.5,
      caps: [[0, 2.7, 'Yeni gün:<br><em>yeni müşteriler</em>,'], [2.7, 5.5, 'yeni <em>kararlar.</em>']],
      acts: [
        [0.3, `window.__hl(null); document.getElementById('dayGo').click();`],
        [1.6, `const g = document.getElementById('prepGo'); if (g && !document.getElementById('prepScr').classList.contains('hidden')) g.click(); document.querySelectorAll('.overlay').forEach(o => { if (o.id !== 'dlEnd') o.classList.add('hidden'); }); window.__plan = [{ cycle: true }];`]
      ] },
    { len: 5.5, end: { q: 'Günün kazancını<br>ilk <em>neye</em> yatırırdın?', sm: 'YORUMLARA YAZ · YARIN: GELİŞTİRME GÜNÜ 6' },
      caps: [[0, 5.5, 'Günün kazancını ilk neye yatırırdın?', true]] }
  ],
  cover: { day: 'GELİŞTİRME GÜNÜ 5', title: 'Gün sonu<br><span style="color:#ffd166">hesabı</span>', sub: 'Liman kapanınca ne olur?' }
};
