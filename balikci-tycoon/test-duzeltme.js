/* v1.9.7 — hata raporu düzeltmeleri:
   1) hisse bölünmesi sahiplik yüzdesini değiştirmez (eskiden %15 → %30); artırım sulandırır, geri alım büyütür;
      toplam hisse kayıtta kalır; dünkü fiyat da yarıya iner (sahte düşüş yok);
   2-3) sözlükte tekrar eden anahtar yok: "ücretsiz" / "Serbest", "Açık tezgâh yok" / "Tezgâh kurulmadı" ayrı;
   4) isim filtresi masum adları geçirir, kötüleri (aralıklı yazım dahil) yakalar. */
const { chromium } = require('./test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  /* 2-3) statik: sözlükte tekrar eden anahtar */
  const src = fs.readFileSync(__dirname + '/game.js', 'utf8'), a = src.indexOf('var STR = {'), trS = src.indexOf('tr: {', a), enS = src.indexOf('\n  en: {', a), end = src.indexOf('\n};', enS);
  const dup = [];
  for (const [nm, s0, e0] of [['tr', trS, enS], ['en', enS, end]]) { const seen = {}; const re = /(?:^|[,{\s])([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(['"\[])/g; let m; const body = src.slice(s0, e0); while ((m = re.exec(body))) { if (seen[m[1]]) dup.push(nm + ':' + m[1]); seen[m[1]] = 1; } }
  ok(!dup.length, 'sözlükte tekrar eden anahtar: ' + dup.join(','));
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await sleep(900);
  R.str = await p.evaluate(() => { BT.setLang('tr'); const t = { free: BT.T('free'), floatSh: BT.T('floatSh'), noStall: BT.T('noStall'), stallNone: BT.T('stallNone') }; BT.setLang('en'); t.enFree = BT.T('free'); t.enFloat = BT.T('floatSh'); BT.setLang('tr'); return t; });
  ok(R.str.free === 'ücretsiz' && R.str.floatSh === 'Serbest' && R.str.noStall === 'Açık tezgâh yok' && R.str.stallNone === 'Tezgâh kurulmadı' && R.str.enFree === 'free' && R.str.enFloat === 'Float', 'sözlük anlamları yanlış ' + JSON.stringify(R.str));
  /* 1) hisseler */
  R.sh = await p.evaluate(() => {
    const K = BT.mkt, M = K.newMarket(), c = M.co[0], out = {};
    c.own = 1500; c.price = 600; c.prev = 580; c.hist = [560, 580, 600]; c.free = 6000;
    out.before = K.ownPct(c);
    K.corpAction(c, 'split');
    out.split = { pct: K.ownPct(c), price: c.price, prev: c.prev, hist: c.hist.slice(-1)[0], sum: c.free + c.own, tot: K.shares(c) };
    K.corpAction(c, 'raise'); out.raise = K.ownPct(c);
    const r1 = K.ownPct(c); K.corpAction(c, 'buyback'); out.buyback = K.ownPct(c) >= r1;
    const back = K.migrate(JSON.parse(JSON.stringify(M))); out.saved = back.co[0].tot === c.tot && Math.abs(K.ownPct(back.co[0]) - K.ownPct(c)) < 1e-9;
    const old = JSON.parse(JSON.stringify(M)); delete old.co[0].tot; out.legacy = K.shares(K.migrate(old).co[0]) === 10000;
    const bad = JSON.parse(JSON.stringify(M)); bad.co[0].tot = 'abc'; out.badTot = K.shares(K.migrate(bad).co[0]) === 10000;
    return out;
  });
  ok(Math.abs(R.sh.split.pct - 0.15) < 1e-9 && R.sh.split.price === 300 && R.sh.split.prev === 290 && R.sh.split.hist === 300 && R.sh.split.sum <= R.sh.split.tot && R.sh.split.tot === 20000,
    'bölünme payı değiştirdi ' + JSON.stringify(R.sh));
  ok(R.sh.raise < 0.15 && R.sh.buyback && R.sh.saved && R.sh.legacy && R.sh.badTot, 'artırım / geri alım / kayıt yanlış ' + JSON.stringify(R.sh));
  /* 4) isim filtresi */
  const OK = ['Amina', 'Amina Balık', 'Nigeria', 'Shiitake', 'Mishit', 'Got Fish Co', 'OC Balık', 'Ata Mina Balık', 'Nazik Balık', 'Işıkım Balık', 'IŞIKIM BALIK',
    'Ata Mina Koyu', 'Hamsi Koyu', 'Klasik Balık', 'Müsiki Evi', 'Dickens Fish', 'Sikke Balık', 'Scunthorpe Fish', 'Assembly Fish', 'Pussycat Cafe', 'Cocktail Bar', 'Sussex Fish'];
  const BAD = ['Orospu', 'o r o s p u', 'Siktir Git', 'SİKTİR GİT', 'S1kt1r', 'fuck fish', 'Fucking Fish', 'Hamsiorospu', 'amk', 'Bitches', 'Nigga', 'N1gger', 'Shit Fish',
    'Shitty Fish', 'Nazi Balık', 'aminakoyim', 'Amına Koyim', 'a m k', 's i k', 'Pezevenk Co', 'Şerefsiz', 'Yavşak', 'Orospular', 'Hitler Fish', 'ibne', 'Kahpe', 'Whore Co', 'A$$hole'];
  R.nm = await p.evaluate(([o, x]) => ({ fp: o.filter(n => BT.nameBad(n)), fn: x.filter(n => !BT.nameBad(n)) }), [OK, BAD]);
  ok(!R.nm.fp.length, 'masum ad engellendi: ' + R.nm.fp.join(', '));
  ok(!R.nm.fn.length, 'kötü ad geçti: ' + R.nm.fn.join(', '));
  ok(!errs.length, 'sayfa hatası: ' + errs.join(' | '));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'DUZELTME_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: hata düzeltmeleri testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
