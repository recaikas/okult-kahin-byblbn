/* v1.9.7 — game.js yüklenemezse sessiz ölü ekran olmaz:
   1) ilk iki deneme koparsa üçüncüde oyun açılır; 2) hep koparsa dilinde hata + "Tekrar dene" çıkar;
   3) specials.js yoksa oyun yine açılır (isteğe bağlı dosya). */
const { chromium } = require('./test-offline');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8099/index.html';
(async () => {
  const b = await chromium.launch(); const fail = [], R = {}; const ok = (c, m) => { if (!c) fail.push(m); };
  async function run(name, abortN, file) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
    const p = await ctx.newPage(); let n = 0;
    await p.route('**/' + (file || 'game.js') + '*', r => (n++ < abortN ? r.abort('connectionreset') : r.continue()));
    await p.goto(URL); await sleep(abortN > 0 ? 8000 : 1500);
    R[name] = await p.evaluate(() => ({ bt: !!window.BT, fail: !!document.getElementById('loadFail'), txt: (document.getElementById('loadFail') || {}).innerText || '' }));
    R[name].reqs = n;
    await ctx.close();
  }
  await run('ikiKopma', 2);
  await run('hepKopuk', 99);
  await run('specialsYok', 99, 'specials.js');
  ok(R.ikiKopma.bt && !R.ikiKopma.fail && R.ikiKopma.reqs === 3, 'iki kopmadan sonra oyun açılmadı ' + JSON.stringify(R.ikiKopma));
  ok(!R.hepKopuk.bt && R.hepKopuk.fail && /yüklenemedi/.test(R.hepKopuk.txt) && /TEKRAR DENE/.test(R.hepKopuk.txt) && R.hepKopuk.reqs === 3, 'hata ekranı çıkmadı ' + JSON.stringify(R.hepKopuk));
  ok(R.specialsYok.bt && !R.specialsYok.fail, 'isteğe bağlı dosya eksikken oyun açılmadı ' + JSON.stringify(R.specialsYok));
  await b.close();
  console.log(JSON.stringify(R));
  console.log(fail.length ? 'YUKLEME_FAIL\n - ' + fail.join('\n - ') : 'TAMAM: yükleme testi geçti');
  process.exit(fail.length ? 1 : 0);
})();
