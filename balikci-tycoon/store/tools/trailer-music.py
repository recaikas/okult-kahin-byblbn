"""Sinematik fragman müziği ve ses tasarımı: 60 sn, özgün, telifsiz (bu dosyadan üretilir).
   Zamanlar trailer.js'deki çekimlere oturur (120 BPM, 1 ölçü = 2 sn):
     0–8    şafak: deniz, martılar, pad, kemençe havası
     8–11.5 derin: suyun altı, kabarcıklar, parlayan arpej
     11.5–14 ağ: davul gerilimi, savurma hışırtısı, suya düşüş, yükseliş
     14     vuruş: horon (kemençe, davul, tef) — mekanikler; sikke sesleri, damga vuruşları
     36–40  lodos gök gürültüsü, sürü, kalabalık vuruşları
     40     kesik: tek çan
     41.5–50 efsane: hicaz ney, koro, kalp atışı, yükseliş
     50     doruk: tema tam kadro
     55     kapanış akoru (La majöre çözülür), çanlar, deniz
   Kullanım: python3 store/tools/trailer-music.py store/video/trailer-music.wav"""
import sys, wave, numpy as np
SR = 44100; DUR = 60.0; N = int(SR * DUR)
BEAT = 0.5; E8 = 0.25; S16 = 0.125
rng = np.random.default_rng(11)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR
def env(n, a=0.005, d=0.1, s=0.6, r=0.05):
    x = np.ones(n); ai = max(1, int(a * SR)); di = int(d * SR); ri = int(r * SR)
    x[:ai] = np.linspace(0, 1, ai)[:n]
    seg = x[ai:ai + di]; seg[:] = np.linspace(1, s, len(seg)); x[ai + di:] = s
    if 0 < ri < n: x[-ri:] *= np.linspace(1, 0, ri)
    return x
def fftfilt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g /= np.sqrt(1 + (f / hi) ** 4)
    if lo: g *= (f / lo) ** 2 / np.sqrt(1 + (f / lo) ** 4)
    return np.fft.irfft(X * g, len(x))
def add(buf, at, sig, vol=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    a = max(0, -i); j = min(len(buf), i + len(sig)); buf[max(0, i):j] += sig[a:j - i] * vol
def additive(f0, n, weights, vib=0.0, vr=5.5, vdelay=0.08, glide_from=None, glide_t=0.04):
    t = tt(n); f = np.full(n, f0)
    if glide_from: g = np.clip(t / glide_t, 0, 1); f = glide_from + (f0 - glide_from) * g
    if vib: f = f * (1 + vib * np.clip((t - vdelay) / 0.15, 0, 1) * np.sin(2 * np.pi * vr * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; out = np.zeros(n)
    for k, w in enumerate(weights, 1):
        if w == 0 or f0 * k > 15000: continue
        out += w * np.sin(k * ph + k * 0.7)
    return out
def formant_w(f0, forms, nh=40, tilt=1.0):
    w = []
    for k in range(1, nh + 1):
        fk = f0 * k; a = 1 / k ** tilt
        a *= 0.25 + sum(g * np.exp(-((fk - c) / bw) ** 2) for c, bw, g in forms)
        w.append(a)
    return w
def noise(n): return rng.uniform(-1, 1, n)
def reverb_ir(sec=2.4, seed=1, damp=4500):
    r = np.random.default_rng(seed); n = int(sec * SR)
    ir = r.uniform(-1, 1, n) * np.exp(-tt(n) * 6.9 / sec); ir = fftfilt(ir, hi=damp)
    ir[: int(0.02 * SR)] = 0; return ir / np.sqrt(np.sum(ir ** 2))
def convolve(x, ir):
    L = len(x) + len(ir); nf = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[: len(x)]

# --- kanallar: kuru ve yankı gönderimi ---
dry = np.zeros(N); wet = np.zeros(N); sea = np.zeros(N)

# ========== deniz ambiyansı ==========
t = tt(N)
swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 6.0) ** 2
lvl = np.interp(t, [0, 7.5, 8.2, 11.3, 12, 14, 14.3, 39.8, 40, 41.4, 41.6, 50, 50.2, 55, 56, 60], [1, 1, .1, .1, .8, .7, .18, .18, .5, .5, .08, .08, .15, .15, .8, .9])
sea = fftfilt(noise(N), hi=420) * swell * 3.0 + (fftfilt(noise(N), lo=1500, hi=5000) * (np.sin(2 * np.pi * t / 6.0 - 0.7) ** 8) * 0.5)
sea *= lvl * 0.085
# suyun altı (8–11.5, 38–39): boğuk uğultu
uw = fftfilt(noise(N), hi=180) * 2.5 * (np.interp(t, [7.9, 8.3, 11.2, 11.5], [0, 1, 1, 0]) + np.interp(t, [37.95, 38.05, 38.9, 39.0], [0, 1, 1, 0]))
dry += uw * 0.35

# ========== ses efektleri ==========
def gull(at, v=0.10):
    for k in range(2):
        n = int(0.22 * SR); f = np.linspace(1900, 1250, n) * (1 + 0.04 * np.sin(2 * np.pi * 30 * tt(n)))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.01, d=0.15, s=0.2, r=0.04)
        s += 0.3 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.01, d=0.15, s=0.2, r=0.04)
        add(wet, at + k * 0.26, s, v); add(dry, at + k * 0.26, s, v * 0.5)
for a in [1.4, 3.1, 5.6, 7.0, 12.0]: gull(a, 0.06)
def bubble(at, v=0.05):
    n = int(0.06 * SR); f = np.linspace(500, 1100, n); add(wet, at, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.002, d=0.05, s=0, r=0.005), v)
for a in rng.uniform(8.1, 11.3, 26): bubble(a, 0.04)
for a in rng.uniform(38.0, 38.9, 10): bubble(a, 0.04)
def whoosh(at, dur=0.5, v=0.25, hi=2500):
    n = int(dur * SR); e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    add(dry, at, fftfilt(noise(n), lo=300, hi=hi) * e, v)
def splash(at, v=0.5):
    n = int(0.9 * SR); add(dry, at, fftfilt(noise(n), lo=200, hi=3500) * np.exp(-tt(n) * 5) * env(n, a=0.004, d=0.1, s=1), v)
    add(wet, at, fftfilt(noise(n), lo=800, hi=6000) * np.exp(-tt(n) * 7), v * 0.4)
    for k in range(12):
        m = int(0.04 * SR); fr = rng.uniform(1500, 3500); add(wet, at + 0.1 + rng.uniform(0, 0.6), np.sin(2 * np.pi * fr * tt(m)) * np.exp(-tt(m) * 60), 0.05)
def coin(at, v=0.16):
    n = int(0.7 * SR); s = sum(np.sin(2 * np.pi * f * tt(n)) * np.exp(-tt(n) * d) for f, d in [(2637, 7), (3951, 9), (5274, 12)])
    add(dry, at, s * env(n, a=0.001, d=0.01, s=1), v); add(dry, at + 0.07, s * 0.6, v * 0.6); add(wet, at, s, v * 0.5)
def thunder(at, v=0.9, dur=2.6):
    n = int(dur * SR); e = np.exp(-tt(n) * 1.4) * (1 + 0.6 * np.sin(2 * np.pi * 3.1 * tt(n)) * np.exp(-tt(n) * 2))
    crack = fftfilt(noise(int(0.25 * SR)), lo=1500, hi=8000) * np.exp(-tt(int(0.25 * SR)) * 18)
    add(dry, at, fftfilt(noise(n), hi=260) * e * 4, v); add(dry, at, crack, v * 0.5); add(wet, at, fftfilt(noise(n), hi=500) * e, v * 0.6)
def rain(a, b, v=0.10):
    n = int((b - a) * SR); add(dry, a, fftfilt(noise(n), lo=2500, hi=9000) * np.interp(tt(n), [0, 0.2, b - a - 0.2, b - a], [0, 1, 1, 0]), v)
def boom(at, v=1.0, f0=80):
    n = int(2.5 * SR); f = f0 * np.exp(-tt(n) * 3) + 30
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 1.6)
    add(dry, at, s, 0.9 * v); add(dry, at, fftfilt(noise(int(0.6 * SR)), hi=900) * np.exp(-tt(int(0.6 * SR)) * 6), 0.4 * v)
    add(wet, at, s, 0.5 * v)
def braam(at, root=33, dur=2.6, v=0.5):
    n = int(dur * SR); s = np.zeros(n)
    for m, w in [(root, 1), (root + 12, 0.7), (root + 19, 0.45), (root + 24, 0.3)]:
        for det in (-0.004, 0.004):
            s += w * additive(hz(m) * (1 + det), n, [1 / k for k in range(1, 30)])
    s = fftfilt(s, hi=900) * env(n, a=0.02, d=0.6, s=0.55, r=1.0)
    add(dry, at, s, v * 0.07); add(wet, at, s, v * 0.05)
def riser(a, b, v=0.3):
    n = int((b - a) * SR); r = np.linspace(0, 1, n) ** 2.5
    add(dry, a, fftfilt(noise(n), lo=600, hi=7000) * r, v)
    f = 200 + 1400 * r; add(wet, a, np.sin(2 * np.pi * np.cumsum(f) / SR) * r, v * 0.12)
def bell(at, m=81, v=0.2, dec=1.6):
    n = int(4 * SR); s = sum(w * np.sin(2 * np.pi * hz(m) * k * tt(n)) * np.exp(-tt(n) * dec * k ** 0.6) for k, w in [(1, 1), (2.76, 0.45), (5.4, 0.25), (8.9, 0.1)])
    add(dry, at, s, v * 0.6); add(wet, at, s, v)

# ========== enstrümanlar ==========
def kemence(at, m, dur, v=0.16, prev=None, vib=0.012):
    n = int(dur * SR)
    w = formant_w(hz(m), [(1100, 500, 2.2), (2600, 700, 1.2)], nh=30, tilt=0.9)
    s = additive(hz(m), n, w, vib=vib, vr=6.2, glide_from=hz(prev) if prev else None)
    bow = fftfilt(noise(n), lo=1500, hi=5000) * 0.05
    s = (s / 6 + bow) * env(n, a=0.02, d=0.08, s=0.8, r=min(0.06, dur * 0.3))
    add(dry, at, s, v); add(wet, at, s, v * 0.45)
def pluck(at, m, v=0.08):   # saz teli
    n = int(0.6 * SR); s = additive(hz(m), n, [1, .6, .5, .3, .25, .15, .1]) * np.exp(-tt(n) * 6)
    add(dry, at, s, v); add(wet, at, s, v * 0.3)
def bass(at, m, dur, v=0.28):
    n = int(dur * SR); s = additive(hz(m), n, [1, .5, .25, .12]) * env(n, a=0.005, d=0.15, s=0.7, r=0.04)
    add(dry, at, s, v)
def kick(at, v=0.7):
    n = int(0.35 * SR); f = 120 * np.exp(-tt(n) * 30) + 45
    add(dry, at, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(n) * 9), v)
def davul_rim(at, v=0.25):
    n = int(0.12 * SR); s = fftfilt(noise(n), lo=900, hi=4000) * np.exp(-tt(n) * 40) + 0.5 * np.sin(2 * np.pi * 330 * tt(n)) * np.exp(-tt(n) * 30)
    add(dry, at, s, v); add(wet, at, s, v * 0.3)
def hat(at, v=0.05):
    n = int(0.05 * SR); add(dry, at, fftfilt(noise(n), lo=6000) * np.exp(-tt(n) * 80), v)
def clap(at, v=0.18):
    n = int(0.18 * SR); s = fftfilt(noise(n), lo=800, hi=5000) * (np.exp(-tt(n) * 30) + 0.5 * np.exp(-np.abs(tt(n) - 0.012) * 400))
    add(dry, at, s, v); add(wet, at, s, v * 0.6)
def pad(at, notes, dur, v=0.05, hi=1400, vowel=False):
    n = int(dur * SR); s = np.zeros(n)
    for m in notes:
        for det in (-0.003, 0.003):
            w = formant_w(hz(m), [(700, 160, 3), (1220, 200, 2), (2600, 300, 1)], nh=24, tilt=1.2) if vowel else [1 / k for k in range(1, 18)]
            s += additive(hz(m) * (1 + det), n, w, vib=0.004, vr=4.6)
    s = fftfilt(s, hi=hi) * env(n, a=dur * 0.3, d=0.2, s=1.0, r=dur * 0.35)
    add(dry, at, s, v * 0.4); add(wet, at, s, v)
def ney(at, m, dur, v=0.14):
    n = int(dur * SR); s = additive(hz(m), n, [1, 0.35, 0.12, 0.05], vib=0.008, vr=5.0, vdelay=0.2)
    breath = fftfilt(noise(n), lo=hz(m) * 0.8, hi=hz(m) * 3) * 0.25
    s = (s + breath) * env(n, a=0.12, d=0.2, s=0.85, r=0.25)
    add(dry, at, s, v * 0.6); add(wet, at, s, v)
def arp(at, m, v=0.04):
    n = int(0.5 * SR); s = additive(hz(m), n, [1, 0, 0.11, 0, 0.04]) * np.exp(-tt(n) * 5)
    add(dry, at, s, v * 0.4); add(wet, at, s, v)

# ========== 0–8: şafak ==========
pad(0.2, [45, 52, 57, 60, 64], 4.4, 0.035)
pad(4.0, [41, 53, 57, 60, 65], 4.4, 0.035)
mel = [(2.0, 76, 0.9), (2.9, 74, 0.35), (3.25, 72, 0.35), (3.6, 74, 1.3), (5.2, 72, 0.4), (5.6, 71, 0.4), (6.0, 69, 1.8)]
prev = None
for a, m, d in mel: kemence(a, m, d, 0.10, prev, vib=0.016); prev = m
# ========== 8–11.5: derin ==========
pad(7.8, [45, 52, 57, 59, 64], 4.0, 0.05, hi=700)
for i, m in enumerate([69, 72, 76, 81, 79, 76, 72, 76] * 4):
    a = 8.0 + i * 0.125
    if a < 11.4: arp(a, m + (12 if i % 8 > 5 else 0), 0.035 + 0.02 * (i / 28))
for k in range(7): add(dry, 8.0 + k * 0.5, np.sin(2 * np.pi * 55 * tt(int(0.4 * SR))) * np.exp(-tt(int(0.4 * SR)) * 6), 0.18)
# ========== 11.5–14: ağ ==========
k = 11.5; gap = 0.25
while k < 13.95:
    davul_rim(k, 0.06 + 0.2 * (k - 11.5) / 2.5); kick(k, 0.15 + 0.25 * (k - 11.5) / 2.5) if int((k - 11.5) / 0.125) % 2 == 0 else None
    gap = max(0.0625, gap * 0.9); k += gap
pad(11.5, [45, 52, 57, 64], 2.5, 0.05)
whoosh(12.35, 0.55, 0.3, 3000)          # savurma
whoosh(12.6, 0.7, 0.18, 1500)           # ağ havada
splash(13.28, 0.55)
riser(12.2, 14.0, 0.22)

# ========== horon teması ==========
A = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74,
     76, 74, 72, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 69, -1]
B = [81, 79, 76, 79, 81, 79, 76, 74, 76, 74, 72, 74, 76, 79, 76, 74,
     72, 74, 76, 72, 69, 72, 74, 72, 69, 67, 69, 72, 69, -1, 69, -1]
BASS = [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 40]
CH = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59]]
def theme(start, stop, song, oct_from=999, full=False):
    a = start; i = 0; prev = None
    while a < stop - 0.01:
        m = song[i % len(song)]
        if m > 0:
            kemence(a, m, E8 * 0.95, 0.15, prev, vib=0.006)
            if i % 4 == 3 and m > 0: kemence(a + S16, m + 2, S16 * 0.9, 0.06)          # süsleme
            if a >= oct_from: kemence(a, m - 12, E8 * 0.95, 0.07, None, vib=0.004)
            prev = m
        if i % 2 == 0: bass(a, BASS[(i // 2) % 16], E8 * 1.8)
        if i % 4 == 0: kick(a, 0.75)
        if i % 4 == 2: davul_rim(a, 0.22); clap(a, 0.12 if not full else 0.18)
        if i % 8 == 7: davul_rim(a + S16, 0.12)
        hat(a, 0.06 if i % 2 == 0 else 0.035); hat(a + S16, 0.025)
        if i % 16 == 0: pad(a, CH[(i // 16) % 4], 4.0, 0.03 if not full else 0.045)
        if full and i % 2 == 1: pluck(a, song[(i - 1) % len(song)] - 12 if song[(i - 1) % len(song)] > 0 else 57, 0.05)
        a += E8; i += 1
boom(14.0, 1.0); braam(14.0, 33, 2.4, 0.6)
theme(14.0, 36.0, A + A + B + A + B, oct_from=22.0)
for a in [18.55, 19.15, 19.65]: coin(a, 0.13)
whoosh(20.85, 0.3, 0.25); boom(21.0, 0.5, 70)
for a in [26.15, 27.15, 28.15, 29.15]: davul_rim(a, 0.18); boom(a, 0.25, 60)
# ========== 36–40: olaylar ==========
boom(36.0, 0.9); braam(36.0, 34, 2.0, 0.5); thunder(36.45, 0.9); thunder(37.3, 0.6, 2.0); rain(36.0, 38.0, 0.12)
theme(36.0, 39.85, B, oct_from=36.0)
whoosh(37.85, 0.3, 0.2); boom(38.0, 0.6); boom(39.0, 0.6)
# ========== 40: kesik ==========
boom(40.0, 0.4, 50); bell(40.25, 81, 0.12, 1.2); pad(40.0, [33, 45], 1.6, 0.04, hi=400)
# ========== 41.5–50: efsane ==========
pad(41.5, [33, 45, 52, 58], 8.6, 0.06, hi=900)                      # La + Si bemol gerilimi (hicaz)
pad(43.5, [57, 61, 64], 6.3, 0.05, hi=2200, vowel=True)              # koro
pad(47.5, [58, 62, 65], 2.3, 0.05, hi=2200, vowel=True)
hb = 41.9
while hb < 49.4:
    kick(hb, 0.45); kick(hb + 0.24, 0.28); hb += 60 / 64
hicaz = [(42.3, 69, 0.9), (43.2, 70, 0.45), (43.65, 73, 1.1), (44.9, 74, 0.45), (45.35, 73, 0.45), (45.8, 70, 0.6), (46.4, 69, 1.4),
         (47.9, 76, 0.45), (48.35, 74, 0.35), (48.7, 73, 0.35), (49.05, 70, 0.3), (49.35, 69, 0.4)]
for a, m, d in hicaz: ney(a, m, d, 0.13)
riser(48.0, 50.0, 0.26)
# ========== 50–55: doruk ==========
boom(50.0, 1.1); braam(50.0, 33, 2.8, 0.7)
theme(50.0, 54.9, B + A, oct_from=50.0, full=True)
# ========== 55–60: kapanış ==========
boom(55.0, 0.9, 70); braam(55.0, 33, 3.5, 0.4)
pad(55.0, [45, 52, 57, 61, 64, 69], 5.0, 0.07, hi=2400)               # La majör (hicazın çözülüşü)
for i, m in enumerate([69, 73, 76, 81]): bell(55.15 + i * 0.16, m + 12, 0.10, 1.4)
kemence(55.6, 76, 1.4, 0.08, 74, vib=0.016); kemence(57.0, 81, 2.2, 0.07, 76, vib=0.018)

# ========== miks ==========
irL, irR = reverb_ir(2.6, 1), reverb_ir(2.6, 2)
L = dry + convolve(wet, irL) * 0.55 + sea
Rr = np.roll(dry, int(0.008 * SR)) * 0.98 + convolve(wet, irR) * 0.55 + np.roll(sea, int(0.02 * SR))
st = np.stack([L, Rr], axis=1)
fo = int(2.0 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
fi = int(0.3 * SR); st[:fi] *= np.linspace(0, 1, fi)[:, None]
pk = np.max(np.abs(st)); st = np.tanh(st / pk * 1.8) / np.tanh(1.8) * 0.93
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], DUR, 's')
