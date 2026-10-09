"""Kare dizilerini, yazı katmanını ve sesi birleştirir → store/video/trailer-cinematic-en-1920x1080.mp4
   Klipler arası geçişler xfade ile yumuşatılır (timeline.json › trans); her klibin sonunda POST kuyruk karesi var, böylece
   geçiş sırasında çıkan klip hareket etmeye devam eder ve vuruş zamanlaması kaymaz.   python3 assemble.py [crf]"""
import json, os, subprocess, sys
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); V = os.path.normpath(os.path.join(here, '..', '..', 'video')); TV = os.path.join(V, 'trailer2')
TL = json.load(open(os.path.join(here, 'timeline.json'))); crf = sys.argv[1] if len(sys.argv) > 1 else '19'; LANG = sys.argv[2] if len(sys.argv) > 2 else 'en'; ORI = sys.argv[3] if len(sys.argv) > 3 else 'h'; POST = 24
VERT = ORI == 'v'; PFX = 'frames-v-' if VERT else 'frames-'
od = os.path.join(TV, 'frames-overlay' if (LANG == 'en' and not VERT) else f'frames-overlay-{LANG}-{ORI}')                      # tamamen opak kareler RGB kaydedilir; ffmpeg akış ortasında format değişince keser
for f in sorted(os.listdir(od)):
    im = Image.open(os.path.join(od, f))
    if im.mode != 'RGBA': im.convert('RGBA').save(os.path.join(od, f))
clips = TL['clips']; m = len(clips); ins, fl = [], []
for i, c in enumerate(clips):
    d = os.path.join(TV, PFX + c['id']); n = len([f for f in os.listdir(d) if f.endswith('.png')]); last = i == m - 1
    main = n if last else n - POST
    assert last or n > POST, c['id']
    k = c['len'] * 30 / main; dur = n * k / 30
    ins += ['-thread_queue_size', '1024', '-framerate', '30', '-i', os.path.join(d, '%05d.png')]
    fl.append(f"[{i}:v]setpts=PTS*{k:.5f},fps=30,scale={'1080:1920' if VERT else '1920:808'}:flags=neighbor,trim=duration={dur:.4f},setpts=PTS-STARTPTS,format=yuv444p[c{i}]")
    print(c['id'], n, 'kare (ana', main, ') →', c['len'], 'sn')
cur = 'c0'
for i in range(1, m):
    typ, dd = TL['trans'].get(clips[i - 1]['id'], ['fade', 0.4])
    fl.append(f"[{cur}][c{i}]xfade=transition={typ}:duration={dd}:offset={clips[i]['at']:.4f}[x{i}]"); cur = f'x{i}'
ins += ['-thread_queue_size', '1024', '-framerate', '30', '-i', os.path.join(od, '%05d.png'), '-i', os.path.join(TV, 'audio.wav')]
fl.append(f'[{cur}]' + ('null' if VERT else 'pad=1920:1080:0:136:black') + '[base]')
fl.append(f'[base][{m}:v]overlay=0:0:format=auto,format=yuv420p[v]')
out = os.path.join(V, f"trailer-cinematic-{LANG}-{'1080x1920' if VERT else '1920x1080'}.mp4")
cmd = ['ffmpeg', '-loglevel', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[v]', '-map', f'{m + 1}:a', '-c:v', 'libx264', '-profile:v', 'high', '-crf', crf, '-preset', 'slow', '-r', '30',
       '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '60', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True); print('ok', out, round(os.path.getsize(out) / 1e6, 1), 'MB')
