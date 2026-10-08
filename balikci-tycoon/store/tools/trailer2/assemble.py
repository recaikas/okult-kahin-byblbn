"""Kare dizilerini, yazı katmanını ve sesi birleştirir → store/video/trailer-cinematic-en-1920x1080.mp4
   python3 assemble.py [crf]"""
import json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); V = os.path.normpath(os.path.join(here, '..', '..', 'video')); TV = os.path.join(V, 'trailer2')
TL = json.load(open(os.path.join(here, 'timeline.json'))); crf = sys.argv[1] if len(sys.argv) > 1 else '19'
# tamamen opak kareler PNG'de RGB kaydedilir; ffmpeg ortada format değişince akışı keser → hepsini RGBA yap
from PIL import Image
od = os.path.join(TV, 'frames-overlay')
for f in sorted(os.listdir(od)):
    im = Image.open(os.path.join(od, f))
    if im.mode != 'RGBA': im.convert('RGBA').save(os.path.join(od, f))
ins, fl, labels = [], [], []
for i, c in enumerate(TL['clips']):
    d = os.path.join(TV, 'frames-' + c['id']); n = len([f for f in os.listdir(d) if f.endswith('.png')])
    ins += ['-thread_queue_size', '1024', '-framerate', '30', '-i', os.path.join(d, '%05d.png')]
    k = c['len'] * 30 / n
    fl.append(f"[{i}:v]setpts=PTS*{k:.5f},fps=30,scale=1920:808:flags=neighbor,trim=duration={c['len']:.4f},setpts=PTS-STARTPTS[c{i}]"); labels.append(f'[c{i}]')
    print(c['id'], n, 'kare → ', c['len'], 'sn (x', round(k, 4), ')')
m = len(TL['clips'])
ins += ['-thread_queue_size', '1024', '-framerate', '30', '-i', os.path.join(TV, 'frames-overlay', '%05d.png'), '-i', os.path.join(TV, 'audio.wav')]
fl.append(''.join(labels) + f'concat=n={m}:v=1:a=0,pad=1920:1080:0:136:black[base]')
fl.append(f'[base][{m}:v]overlay=0:0:format=auto,format=yuv420p[v]')
out = os.path.join(V, 'trailer-cinematic-en-1920x1080.mp4')
cmd = ['ffmpeg', '-loglevel', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[v]', '-map', f'{m + 1}:a', '-c:v', 'libx264', '-profile:v', 'high', '-crf', crf, '-preset', 'slow', '-r', '30',
       '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '60', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True); print('ok', out, round(os.path.getsize(out) / 1e6, 1), 'MB')
