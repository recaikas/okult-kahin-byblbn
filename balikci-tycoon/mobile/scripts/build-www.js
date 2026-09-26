/* Oyun dosyalarını (bir üst klasör) Capacitor'ın www/ klasörüne kopyalar. Testler, belgeler ve web'e özel dosyalar gitmez. */
const fs = require('fs'), path = require('path');
const SRC = path.resolve(__dirname, '..', '..'), OUT = path.resolve(__dirname, '..', 'www');
const FILES = ['index.html', 'native.js', 'config.js', 'specials.js', 'game.js', 'privacy.html'];
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
for (const f of FILES) { const p = path.join(SRC, f); if (fs.existsSync(p)) fs.copyFileSync(p, path.join(OUT, f)); }
fs.cpSync(path.join(SRC, 'fonts'), path.join(OUT, 'fonts'), { recursive: true });
const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
if (/fonts\.googleapis|fonts\.gstatic/.test(html)) throw new Error('index.html hâlâ Google Fonts\'a bağlı — uygulama internetsiz açılmaz');
console.log('www hazır:', fs.readdirSync(OUT).join(', '));
