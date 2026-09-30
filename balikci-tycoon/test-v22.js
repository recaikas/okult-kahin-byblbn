/* v2.2 — itibar temposu:
   1) yeni eşikler (15, 45, 150, 350, 700, 1100, 1700, 2800, 4500);
   2) bölge tavanı: 1 bölge Sv3, 2 bölge Sv5, 3 bölge Sv7, 4 bölge Sv10; fazla itibar birikir, bölge açılınca seviye atlar;
   3) tavanda HUD "TAVAN" der ve "bölge aç" ipucu bir kez çıkar;
   4) eski kayıt (v6) itibarı yeni ölçeğe taşınır: seviye korunur;
   5) kilitler aynı seviyede: Mutfak 350 (Sv5), Ticaret Ofisi 150 (Sv4). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 860 } });
  const errs = [], fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  await p.click('#introSkip'); await p.click('#playBtn'); await p.click('#slotRows .sb[data-n="1"]');
  await p.click('#heroGo'); await p.click('#nameGo'); await p.click('#autoOpts button[data-m="10"]'); await sleep(600);

  R.cap = await p.evaluate(async () => {
    const S = BT.S, A = BT.areas, o = { needs: BT.REP_LEVELS.map(l => l.need) };
    S.ctrl = 2; S.tut = 99; S.rep = 5000;
    await new Promise(r => setTimeout(r, 600));
    o.one = [BT.repLevel(), BT.repCapped(), document.getElementById('hRep').textContent];
    o.hint = BT.notifs().join(' | ');
    const lv = []; for (let i = 1; i < 4; i++) { A[i].locked = false; lv.push(BT.repLevel()); }
    o.lv = lv; o.full = [BT.repLevel(), BT.repCapped()];
    A[1].locked = A[2].locked = A[3].locked = true;
    o.gates = { mutfak: A[3].rep, pazar: A[1].rep, fume: A[2].rep };
    return o;
  });
  ok(JSON.stringify(R.cap.needs) === JSON.stringify([0, 15, 45, 150, 350, 700, 1100, 1700, 2800, 4500]), 'eşikler yanlış ' + R.cap.needs);
  ok(R.cap.one[0] === 3 && R.cap.one[1] === true && /TAVAN/.test(R.cap.one[2]), 'tek bölgede tavan yok ' + JSON.stringify(R.cap.one));
  ok(/tavanında birikiyor/.test(R.cap.hint), 'tavan ipucu çıkmadı ' + R.cap.hint.slice(0, 200));
  ok(JSON.stringify(R.cap.lv) === '[5,7,10]' && R.cap.full[1] === false, 'bölge açılınca tavan yükselmiyor ' + JSON.stringify(R.cap));
  ok(R.cap.gates.pazar === 15 && R.cap.gates.fume === 45 && R.cap.gates.mutfak === 350, 'bölge kilitleri yanlış ' + JSON.stringify(R.cap.gates));

  R.old = await p.evaluate(() => {
    const out = [];
    for (const r of [0, 10, 35, 60, 200, 350]) {
      const d = BT.buildSave(); d.v = 6; d.rep = r; d.areas = d.areas.map(() => [0, 1]);
      BT.loadFrom(d); out.push([r, BT.S.rep, BT.repLevel()]);
    }
    const d2 = BT.buildSave(); const cur = d2.rep; BT.loadFrom(d2);
    return { out, v: d2.v, same: BT.S.rep === cur };
  });
  const lvOld = r => [0, 10, 30, 40, 60, 90, 130, 180, 250, 350].filter(n => r >= n).length;
  ok(R.old.out.every(([r, n, l]) => l === lvOld(r)), 'eski kayıtta seviye değişti ' + JSON.stringify(R.old.out));
  ok(R.old.v === 7 && R.old.same, 'yeni kayıt ikinci kez dönüştürüldü ' + JSON.stringify(R.old));

  if (errs.length) fail.push('sayfa hatası: ' + [...new Set(errs)].join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'V22_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: v2.2 itibar testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
