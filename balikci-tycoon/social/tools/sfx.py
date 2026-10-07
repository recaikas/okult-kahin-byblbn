"""Kısa ses efektleri (kodla üretilir, telifsiz): pop, whoosh, coin, sting, end.
   python3 social/tools/sfx.py <sure.json> <cikti.wav>  — sure.json'daki olay zamanlarına göre bir efekt izi yazar."""
import sys, json, wave
import numpy as np
SR = 44100
rng = np.random.default_rng(7)
def env(n, a, d):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d); return e
def tone(f0, f1, dur, wav='sine'):
    n = int(SR * dur); f = np.linspace(f0, f1, n); ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) if wav == 'sine' else np.sign(np.sin(2 * np.pi * ph)) * 0.6
    return x
def pop():
    n = int(SR * 0.09); return tone(520, 1250, 0.09) * env(n, 0.003, 0.03) * 0.55
def whoosh():
    n = int(SR * 0.32); x = rng.uniform(-1, 1, n)
    k = np.linspace(0.02, 0.35, n); y = np.zeros(n); acc = 0.0
    for i in range(n): acc += k[i] * (x[i] - acc); y[i] = acc          # süpürülen alçak geçiren süzgeç
    w = np.sin(np.linspace(0, np.pi, n)) ** 1.5; return y * w * 1.6
def coin():
    a = tone(988, 988, 0.07, 'sq') * env(int(SR * 0.07), 0.002, 0.05)
    b = tone(1319, 1319, 0.16, 'sq') * env(int(SR * 0.16), 0.002, 0.08)
    return np.concatenate([a, b]) * 0.22
def sting():
    n = int(SR * 0.45); t = np.arange(n) / SR
    kick = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 22) + 45) / SR) * np.exp(-t * 9)
    hit = rng.uniform(-1, 1, n) * np.exp(-t * 26) * 0.35
    chord = sum(tone(f, f, 0.45, 'sq') for f in (440, 554, 659)) * np.exp(-t * 5) * 0.12
    return (kick * 0.8 + hit + chord)
def end():
    n = int(SR * 0.7); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1047 * t) + 0.5 * np.sin(2 * np.pi * 1568 * t)) * np.exp(-t * 4) * 0.35
FX = {'pop': pop, 'cut': whoosh, 'coin': coin, 'sting': sting, 'end': end}
meta = json.load(open(sys.argv[1]))
out = np.zeros(int(SR * (meta['secs'] + 1)))
for e in meta.get('evs', []):
    x = FX[e['k']](); i = int(e['t'] * SR); j = min(len(out), i + len(x)); out[i:j] += x[: j - i]
out = out[: int(SR * meta['secs'])]
peak = np.max(np.abs(out)) or 1; out = out / max(peak, 1.0) * 0.9
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sfx', len(meta.get('evs', [])), 'olay')
