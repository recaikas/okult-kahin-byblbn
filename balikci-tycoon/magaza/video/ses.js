/* Tanıtım videosu sesi: oyunun kendi müziği (WebAudio, anlık sentez) gerçek zamanda kaydedilir.
   Oyunun ana çıkışı (masterGain) bir MediaStreamDestination'a da bağlanır, MediaRecorder ile webm/opus alınır.
   Kullanım: node magaza/video/ses.js [parça no] [saniye]  → magaza/video/ses.webm
   Parça sırası (game.js SONGS): 0 İskele Türküsü, 1 Liman, 2 Yeşilçam, 3 Rock, 4 Yayla Horonu (kemençe), ... */
const { chromium } = require('../../test-offline');
const fs = require('fs'), path = require('path');
const BASE = process.env.URL || 'http://localhost:8101/';
const SONG = +(process.argv[2] || 4), SECS = +(process.argv[3] || 27);
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 400, height: 800 } });
  p.on('pageerror', e => console.log('PE', e.message));
  await p.goto(BASE + 'index.html'); await p.waitForTimeout(1200);
  await p.mouse.click(200, 400);
  const b64 = await p.evaluate(async ([song, secs]) => {
    HKG.v('ensureAudio')();
    const AC = HKG.v('AC'), mg = HKG.v('masterGain');
    if (AC.state !== 'running') await AC.resume();
    HKG.v('musicStop')(0.01); HKG.v('cueStop') && HKG.v('cueStop')(0.01);
    await new Promise(r => setTimeout(r, 300));
    const dst = AC.createMediaStreamDestination(); mg.connect(dst);
    const rec = new MediaRecorder(dst.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 192000 });
    const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
    rec.start(250);
    HKG.v('musicPlay')('menu', song);
    await new Promise(r => setTimeout(r, secs * 1000));
    rec.stop(); await new Promise(r => rec.onstop = r);
    const buf = await new Blob(chunks).arrayBuffer();
    let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return { st: AC.state, b: btoa(s) };
  }, [SONG, SECS]);
  console.log('AudioContext', b64.st);
  fs.writeFileSync(path.join(__dirname, 'ses.webm'), Buffer.from(b64.b, 'base64'));
  await b.close();
})();
