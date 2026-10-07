"""Geliştirme günlüğü montajı: kareler (devlog.js) + özgün müzik → 1080×1920 MP4, müziksiz sürüm, kapak, kontrol.
   python3 social/tools/make.py gun-01
   Müzik: store/tools/music.py ile üretilen özgün chiptune (telifsiz)."""
import sys, os, json, subprocess, wave
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.dirname(ROOT)
did = sys.argv[1]
OUT = os.path.join(ROOT, 'out', did)
meta = json.load(open(os.path.join(OUT, 'sure.json')))
secs = meta['secs']

def run(*a):
    r = subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', *a], capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)

# 1) müzik: özgün parça (store/tools/music.py), videonun süresine kırpılır, sonda 1,2 sn kısılır
mus_src = os.path.join(OUT, 'muzik-ham.wav')
subprocess.run([sys.executable, os.path.join(GAME, 'store', 'tools', 'music.py'), mus_src], check=True, capture_output=True)
mus = os.path.join(OUT, 'muzik.wav')
run('-i', mus_src, '-t', str(secs), '-af', 'afade=t=in:d=0.2,afade=t=out:st=%.2f:d=1.2,volume=0.85' % (secs - 1.2), mus)
os.remove(mus_src)

# 2) görüntü: kareler → H.264 (yuv420p, +faststart: telefonda hemen oynar)
frames = os.path.join(OUT, 'frames', '%05d.jpg')
silent = os.path.join(OUT, did + '-muziksiz.mp4')
run('-framerate', '30', '-i', frames, '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=1080:1920:flags=lanczos', '-movflags', '+faststart', silent)
final = os.path.join(OUT, did + '.mp4')
# efekt izi (pop/whoosh/para/vuruş) + müzik; müzik efektlerin altında biraz kısılır
fx = os.path.join(OUT, 'efekt.wav')
subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'sfx.py'), os.path.join(OUT, 'sure.json'), fx], check=True, capture_output=True)
mix = os.path.join(OUT, 'ses.wav')
run('-i', mus, '-i', fx, '-filter_complex', '[0:a]volume=0.75[m];[1:a]volume=1.0[f];[m][f]amix=inputs=2:normalize=0,alimiter=limit=0.95', mix)
run('-i', silent, '-i', mix, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final)
os.remove(mix)

# 3) kapak: 1080×1920 PNG zaten devlog.js'den (kapak.png); JPG kopyası (Instagram kapak yüklemesi)
cov = os.path.join(OUT, 'kapak.png')
if os.path.exists(cov): run('-i', cov, '-vf', 'scale=1080:1920', '-q:v', '2', os.path.join(OUT, 'kapak.jpg'))

# 4) kontrol: süre, çözünürlük, ses akışı, sessizlik değil, kareler kesintisiz
def probe(f):
    r = subprocess.run([FF, '-hide_banner', '-i', f], capture_output=True, text=True).stderr
    return r
info = probe(final)
ok = []
ok.append(('1080x1920' in info, 'çözünürlük 1080×1920'))
ok.append(('Audio: aac' in info, 'ses akışı AAC'))
ok.append(('h264' in info and 'yuv420p' in info, 'H.264 yuv420p'))
r = subprocess.run([FF, '-hide_banner', '-i', final, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
mv = [l for l in r.splitlines() if 'mean_volume' in l]
ok.append((bool(mv) and float(mv[0].split(':')[1].split()[0]) > -40, 'ses duyulur (%s)' % (mv[0].split('] ')[-1] if mv else '?')))
r = subprocess.run([FF, '-hide_banner', '-i', final, '-f', 'null', '-'], capture_output=True, text=True)
ok.append((r.returncode == 0 and 'error' not in r.stderr.lower(), 'baştan sona hatasız çözülüyor'))
dur = [l for l in info.splitlines() if 'Duration' in l][0].split(',')[0].split()[-1]
h, m, s = dur.split(':'); d = int(h) * 3600 + int(m) * 60 + float(s)
ok.append((abs(d - secs) < 0.3 and 15 <= d <= 60, 'süre %.1f sn' % d))
n = len(os.listdir(os.path.join(OUT, 'frames')))
ok.append((n == meta['frames'], 'kare sayısı %d/%d' % (n, meta['frames'])))
for good, msg in ok: print(('✓ ' if good else '✗ ') + msg)
print('boyut: %.1f MB' % (os.path.getsize(final) / 1e6))
sys.exit(0 if all(g for g, _ in ok) else 1)
