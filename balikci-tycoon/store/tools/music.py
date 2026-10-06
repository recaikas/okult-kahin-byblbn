"""Tanıtım videosu müziği: 29 sn özgün chiptune (horon havası, La minör). Telifsiz, bu dosyadan üretilir.
   python3 tools/music.py video/promo-music.wav"""
import sys, wave, numpy as np
SR = 44100; BPM = 138; DUR = 29.0
beat = 60 / BPM; e8 = beat / 2
t_all = np.zeros(int(SR * DUR) + SR)
def note(freq): return 440.0 * 2 ** ((freq - 69) / 12)
def env(n, a=0.005, d=0.12, s=0.55, r=0.06):
    x = np.ones(n); ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    if ai: x[:ai] = np.linspace(0, 1, ai)
    x[ai:ai + di] = np.linspace(1, s, len(x[ai:ai + di]))
    x[ai + di:] = s
    if ri and ri < n: x[-ri:] *= np.linspace(1, 0, ri)
    return x
def square(f, n, duty=0.5, vib=0):
    t = np.arange(n) / SR; ph = (f * t + vib * np.sin(2 * np.pi * 5.5 * t) / 5.5) % 1.0
    return np.where(ph < duty, 1.0, -1.0)
def tri(f, n):
    t = np.arange(n) / SR; ph = (f * t) % 1.0
    return 4 * np.abs(ph - 0.5) - 1
def add(buf, start, sig, vol):
    i = int(start * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * vol
lead = np.zeros_like(t_all); bass = np.zeros_like(t_all); drum = np.zeros_like(t_all)
# La minör pentatonik + Karadeniz süslemesi; 2 ölçülük motifler (8'lik)
A = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74,
     76, 74, 72, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 69, -1]
B = [81, 79, 76, 79, 81, 79, 76, 74, 76, 74, 72, 74, 76, 79, 76, 74,
     72, 74, 76, 72, 69, 72, 74, 72, 69, 67, 69, 72, 69, -1, 69, -1]
song = A + A + B + A + B + A
bassline = [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 40]
t = 0.6; i = 0
while t < DUR - 1.6:
    m = song[i % len(song)]
    if m > 0:
        n = int(e8 * 0.92 * SR); add(lead, t, square(note(m), n, 0.25, vib=2.5) * env(n, d=0.08, s=0.45), 0.16)
        add(lead, t + 0.11, square(note(m), n, 0.25) * env(n, d=0.06, s=0.3), 0.05)          # yankı
    if i % 2 == 0:
        bm = bassline[(i // 2) % len(bassline)]; n = int(e8 * 1.8 * SR)
        add(bass, t, tri(note(bm), n) * env(n, d=0.2, s=0.6), 0.32)
    rng = np.random.default_rng(i)
    if i % 4 == 0:                                                                            # davul (kick)
        n = int(0.18 * SR); tt = np.arange(n) / SR; f = 110 * np.exp(-tt * 28) + 45
        add(drum, t, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18), 0.55)
    if i % 4 == 2:                                                                            # trampet
        n = int(0.12 * SR); add(drum, t, rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 30), 0.18)
    n = int(0.03 * SR); add(drum, t, rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 120), 0.06)   # zil
    t += e8; i += 1
mix = lead + bass + drum
mix = mix[: int(SR * DUR)]
fi = int(0.3 * SR); fo = int(1.6 * SR)
mix[:fi] *= np.linspace(0, 1, fi); mix[-fo:] *= np.linspace(1, 0, fo)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.82
st = np.stack([mix, np.roll(mix, int(0.012 * SR)) * 0.96], axis=1)                          # hafif stereo
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], len(mix) / SR, 's')
