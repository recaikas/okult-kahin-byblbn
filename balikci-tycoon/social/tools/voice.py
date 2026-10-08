"""Senaryodaki anlatım satırlarını (vo: [[başlangıç sn, bitiş sn, metin], ...]) eSpeak ile seslendirir,
   her satırı kendi aralığına sığacak hızda okur ve tek bir anlatım izi yazar: out/<gün>/anlatim.wav (44.1 kHz).
   python3 social/tools/voice.py gun-01"""
import sys, os, json, subprocess, wave, tempfile
import numpy as np
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
did = sys.argv[1]
OUT = os.path.join(ROOT, 'out', did)
vo = json.loads(subprocess.run(['node', '-e', 'console.log(JSON.stringify(require(process.argv[1]).vo || []))',
                                os.path.join(ROOT, 'days', did + '.js')], capture_output=True, text=True, check=True).stdout)
secs = json.load(open(os.path.join(OUT, 'sure.json')))['secs']
SR = 44100
track = np.zeros(int(SR * (secs + 2)))
tmp = tempfile.mkdtemp()
for k, (a, b, text) in enumerate(vo):
    for rate in range(160, 236, 6):          # sığana kadar hızlan (en çok 230 kelime/dk)
        raw = os.path.join(tmp, 'r%d.wav' % k)
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'tts_espeak.py'), text, raw, str(rate), '40', 'tr+m3'], capture_output=True, text=True, check=True)
        if float(r.stdout.split()[0]) <= (b - a): break
    pro = os.path.join(tmp, 'p%d.wav' % k)
    # tını: biraz kalınlaştır, sertliği al, hafif oda yankısı, yüksek sesle normalize
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af',
                    'aresample=44100,asetrate=44100*0.94,aresample=44100,atempo=1.0638,'
                    'highpass=f=90,lowpass=f=6500,equalizer=f=220:t=q:w=1:g=3,equalizer=f=3000:t=q:w=1.5:g=-3,'
                    'aecho=0.8:0.5:35:0.18,loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', pro], check=True)
    w = wave.open(pro); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32767
    i = int(a * SR); j = min(len(track), i + len(x)); track[i:j] += x[: j - i]
    print('%5.2f–%5.2f  hız %d  %.2f sn  %s' % (a, b, rate, len(x) / SR, text))
track = track[: int(SR * secs)]
track = np.clip(track, -1, 1)
with wave.open(os.path.join(OUT, 'anlatim.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype(np.int16).tobytes())
print('anlatim.wav yazıldı')
