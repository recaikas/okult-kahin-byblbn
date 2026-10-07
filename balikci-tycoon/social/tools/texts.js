/* Günün paylaşım metinleri: seslendirme (zamanlı), Instagram açıklaması, YouTube Shorts başlığı/açıklaması.
   Senaryodaki altyazılardan, kapaktan ve bitiş sorusundan üretilir.
   Kullanım: node social/tools/texts.js social/days/gun-02.js  →  social/out/gun-02/metinler.md */
const path = require('path'), fs = require('fs');
const day = require(path.resolve(process.argv[2]));
const OUT = path.resolve(__dirname, '..', 'out', day.id);
const SITE = 'https://recaikas.github.io/okult-kahin-byblbn/';
const plain = h => h.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const n = parseInt(day.id.split('-')[1], 10);
const mmss = s => '0:' + String(Math.floor(s)).padStart(2, '0') + (s % 1 ? ',' + Math.round((s % 1) * 10) : '');
let t = 0; const rows = []; let question = '';
for (const g of day.segs) {
  if (g.end) question = plain(g.end.q);
  const said = (g.caps || []).map(c => plain(c[2])).join(' ');
  rows.push('| ' + mmss(t) + '–' + mmss(t + g.len) + ' | ' + said + ' |');
  t += g.len;
}
const hook = plain(day.segs[0].caps[0][2]);
const topic = plain(day.cover.sub || '');
const title = plain(day.cover.title || '');
const md = `# GÜN ${n} — ${title}

Süre ${t.toFixed(1).replace('.', ',')} sn · 1080×1920 · 30 fps · özgün chiptune müzik ve ses efektleri (kodla üretildi, telifsiz)

## Seslendirme metni

Bu ortamda Türkçe seslendirme aracı yok, o yüzden videoda konuşma yok. Ekrandaki yazılar sesi taşıyor.
İstersen \`gun-${String(n).padStart(2, '0')}-muziksiz.mp4\` üzerine aynı cümleleri kendi sesinle okuyabilirsin:

| Zaman | Söylenecek |
|---|---|
${rows.join('\n')}

## Instagram Reels açıklaması

\`\`\`
${hook} 🐟 Gün ${n}.

${topic}. Hamsi Koyu'yu tek başıma geliştiriyorum; her gün bir mekaniğini buradan gösteriyorum.

${question} Yorumlara yaz 👇

Oyun tarayıcıda ücretsiz oynanıyor, link profilde.

#HamsiKoyu #oyungeliştirme #indiegame #gamedev #pixelart #bağımsızoyun #tycoon #devlog #oyun
\`\`\`

Bio linki: ${SITE}
Kapak: \`kapak.jpg\`

## YouTube Shorts

Başlık:

\`\`\`
${title} — Gün ${n} 🐟 #shorts
\`\`\`

Açıklama:

\`\`\`
Hamsi Koyu geliştirme günlüğü, Gün ${n}: ${topic.toLowerCase()}.

${question} Yorumlara yaz, yarın Gün ${n + 1}.

Tarayıcıda ücretsiz oyna: ${SITE}

#HamsiKoyu #gamedev #indiegame #pixelart #devlog #shorts
\`\`\`

## Notlar

- Görüntüler gerçek oynanış: oyunu bir bot oynadı, oyunun kendi saatiyle kare kare kaydedildi. İleri sarılan yerlerde ekranda "▶▶" etiketi var.
- Altyazılar videoya işlendi; \`gun-${String(n).padStart(2, '0')}.srt\` gerekirse YouTube'a ayrıca yüklenebilir.
`;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'metinler.md'), md);
console.log('metinler.md', day.id);
