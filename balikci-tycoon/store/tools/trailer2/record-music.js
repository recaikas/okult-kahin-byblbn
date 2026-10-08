/* Oyunun KENDİ müziğini Web Audio çıkışından kaydeder (MediaRecorder): node record-music.js <şarkı_no> <saniye> <çıktı.webm>
   Şarkı no: 0 İskele Türküsü · 2 Yeşilçam Hatırası · 4 Yayla Horonu · 8 Ağ Çekme Türküsü (oyun 8099'da sunulmalı; gerçek zamanda çalışır).
   Sonra: ffmpeg -i song4.webm -ar 48000 -ac 2 song4.wav  → audio2.py bu wav'ları kullanır. */
const { chromium } = require('../../../test-offline');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const [idx, secs, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 480, height: 800 } });
  await ctx.addInitScript(() => {
    const O = window.AudioContext;
    window.AudioContext = function (...a) { const c = new O(...a); window.__ac = c; window.__dest = c.createMediaStreamDestination(); return c; };
    window.AudioContext.prototype = O.prototype;
    const oc = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (t, ...r) { if (window.__ac && t === window.__ac.destination && window.__dest) oc.call(this, window.__dest); return oc.call(this, t, ...r); };
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8099/index.html'); await sleep(800);
  await p.evaluate(() => { try { BT.setLang('en'); } catch (e) {} });
  await p.click('#introSkip'); await sleep(500);
  await p.click('#setBtn'); await sleep(300);
  const btns = await p.$$('#musList button, #musList .pl, #musList > *');
  console.log('playlist items', btns.length);
  await p.evaluate(() => { BT.setVol(2); const r = document.getElementById('volMusR'); r.value = 100; r.dispatchEvent(new Event('input')); });
  await btns[idx + 1 < btns.length ? idx + 1 : idx].click().catch(e => console.log('clickfail', e.message));
  await p.click('#setClose'); await sleep(600);
  console.log(await p.evaluate(() => JSON.stringify(BT.music())).catch(e => 'nomusic'));
  await p.evaluate(() => {
    window.__chunks = []; window.__mr = new MediaRecorder(window.__dest.stream, { mimeType: 'audio/webm;codecs=opus' });
    window.__mr.ondataavailable = e => window.__chunks.push(e.data); window.__mr.start(500);
  });
  await sleep(secs * 1000);
  const b64 = await p.evaluate(async () => { window.__mr.stop(); await new Promise(r => setTimeout(r, 400)); const bl = new Blob(window.__chunks, { type: 'audio/webm' }); return await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result.split(',')[1]); f.readAsDataURL(bl); }); });
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('saved', out, b64.length);
  await b.close();
})();
