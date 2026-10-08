"""Sinematik fragman müziği ve ses tasarımı: 60 sn, özgün, telifsiz (bu dosyadan üretilir).
   "Hamsi Koyu'nda bir gün" kurgusuna oturur (120 BPM, 1 ölçü = 2 sn):
     0–7     şafak: deniz, martılar, pad, kemençe havası
     7–11    ağ: davul gerilimi, savurma, suya düşüş (10.0)
     11–15   suyun altı: dalış, ağın inişi, parlayan arpej, yükseliş
     15      logo vuruşu → horon (kemençe, davul, tef); oyun sesleri: balık, bıçak, pazar, sikke
     28–33   büyüme: inşaat vuruşları, kasa sayacı, tema yükselir
     37–43.5 müşteriler: hafifler; mırıltı, saz, sayfa çevirme
     43.5–46 lodos: gök gürültüsü, yağmur
     46      kesik: tek çan
     47.5–55 efsane: hicaz ney, koro, kalp atışı, gözler açılır (50.6)
     55      kapanış: La majör akor, çanlar, deniz
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
lvl = np.interp(t, [0, 10.8, 11.0, 14.9, 15.1, 43.4, 43.6, 45.9, 46.1, 47.4, 47.6, 54.8, 55.5, 60], [1, 1, .05, .05, .2, .2, .5, .5, .35, .35, .05, .05, .8, .9])
sea = fftfilt(noise(N), hi=420) * swell * 3.0 + (fftfilt(noise(N), lo=1500, hi=5000) * (np.sin(2 * np.pi * t / 6.0 - 0.7) ** 8) * 0.5)
sea *= lvl * 0.085
# suyun altı (8–11.5, 38–39): boğuk uğultu
uw = fftfilt(noise(N), hi=180) * 2.5 * np.interp(t, [10.95, 11.1, 14.8, 15.0], [0, 1, 1, 0])
dry += uw * 0.35

# ========== ses efektleri ==========
def gull(at, v=0.10):
    for k in range(2):
        n = int(0.22 * SR); f = np.linspace(1900, 1250, n) * (1 + 0.04 * np.sin(2 * np.pi * 30 * tt(n)))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.01, d=0.15, s=0.2, r=0.04)
        s += 0.3 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.01, d=0.15, s=0.2, r=0.04)
        add(wet, at + k * 0.26, s, v); add(dry, at + k * 0.26, s, v * 0.5)
for a in [1.6, 3.3, 5.4, 7.6, 9.2, 18.2]: gull(a, 0.06)
def bubble(at, v=0.05):
    n = int(0.06 * SR); f = np.linspace(500, 1100, n); add(wet, at, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, a=0.002, d=0.05, s=0, r=0.005), v)
for a in rng.uniform(11.0, 14.8, 30): bubble(a, 0.04)
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

# ========== oyun dünyası sesleri ==========
def slap(at, v=0.22):     # kasaya düşen balık
    n = int(0.12 * SR); add(dry, at, fftfilt(noise(n), lo=250, hi=2200) * np.exp(-tt(n) * 35) + 0.6 * np.sin(2 * np.pi * 140 * tt(n)) * np.exp(-tt(n) * 30), v)
def chop(at, v=0.2):      # bıçak
    n = int(0.09 * SR); add(dry, at, fftfilt(noise(n), lo=3000) * np.exp(-tt(n) * 160) * 0.7 + np.sin(2 * np.pi * 190 * tt(n)) * np.exp(-tt(n) * 45), v)
def murmur(a, b, v=0.05):  # pazar uğultusu
    n = int((b - a) * SR); x = np.zeros(n)
    for k in range(6):
        ph = rng.uniform(0, 6); fr = rng.uniform(2.5, 5.5)
        x += fftfilt(noise(n), lo=280 + k * 60, hi=1800 + k * 150) * (0.5 + 0.5 * np.sin(2 * np.pi * fr * tt(n) + ph)) ** 2
    add(dry, a, x * np.interp(tt(n), [0, 0.6, b - a - 0.6, b - a], [0, 1, 1, 0]), v)
    add(wet, a, x, v * 0.3)
def build(at, m, v=0.3):  # inşaat: tak + gümbür + çan
    add(dry, at, fftfilt(noise(int(0.04 * SR)), lo=900, hi=3200) * np.exp(-tt(int(0.04 * SR)) * 80), v)
    n = int(0.4 * SR); add(dry, at, np.sin(2 * np.pi * np.cumsum(90 * np.exp(-tt(n) * 6) + 40) / SR) * np.exp(-tt(n) * 9), v * 1.6)
    bell(at + 0.03, m, 0.07, 2.4)
def ticker(a, b, v=0.05):  # kasa sayacı
    k = a; gap = 0.035
    while k < b: n = int(0.006 * SR); add(dry, k, fftfilt(noise(n), lo=2500) * np.exp(-tt(n) * 600), v); gap *= 1.012; k += gap
def blips(a, b, v=0.035):  # müşteri konuşması (oyunun "bıdı bıdı" sesi)
    k = a
    while k < b:
        n = int(0.05 * SR); f = rng.uniform(170, 260); add(dry, k, np.sign(np.sin(2 * np.pi * f * tt(n))) * env(n, a=0.003, d=0.03, s=0.3, r=0.01), v)
        k += 0.08 + (0.18 if rng.uniform() < 0.15 else 0)
def page(at, v=0.18):
    n = int(0.28 * SR); add(dry, at, fftfilt(noise(n), lo=1800, hi=7000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 3, v)
def plunge(at, v=0.45):
    n = int(0.8 * SR); add(dry, at, fftfilt(noise(n), hi=900) * np.exp(-tt(n) * 4), v)
    for a2 in at + rng.uniform(0, 0.7, 14): bubble(a2, 0.05)

# ========== 0–7: şafak ==========
pad(0.2, [45, 52, 57, 60, 64], 4.0, 0.035)
pad(3.6, [41, 53, 57, 60, 65], 4.0, 0.035)
mel = [(1.8, 76, 0.9), (2.7, 74, 0.35), (3.05, 72, 0.35), (3.4, 74, 1.2), (4.9, 72, 0.4), (5.3, 71, 0.4), (5.7, 69, 1.6)]
prev = None
for a, m, d in mel: kemence(a, m, d, 0.10, prev, vib=0.016); prev = m
# ========== 7–11: ağ ==========
pad(6.9, [43, 50, 55, 59, 62], 2.4, 0.04); pad(9.0, [40, 52, 55, 59, 64], 2.3, 0.04)
kemence(7.4, 76, 0.5, 0.08, 69, vib=0.014); kemence(7.9, 79, 0.9, 0.08, 76, vib=0.016); kemence(9.0, 81, 1.4, 0.08, 79, vib=0.018)
k = 8.0; gap = 0.5
while k < 9.95:
    davul_rim(k, 0.05 + 0.16 * (k - 8.0) / 2.0); gap = max(0.09, gap * 0.85); k += gap
whoosh(8.25, 0.5, 0.3, 3000); whoosh(8.6, 1.2, 0.16, 1500)
splash(10.0, 0.55); boom(10.0, 0.35, 60)
# ========== 11–15: suyun altı ==========
plunge(11.0)
pad(11.0, [45, 52, 57, 59, 64], 4.2, 0.05, hi=700)
for i, m in enumerate([69, 72, 76, 81, 79, 76, 72, 76] * 4):
    a = 11.2 + i * 0.125
    if a < 14.9: arp(a, m + (12 if i % 8 > 5 else 0), 0.03 + 0.025 * (i / 30))
n0 = int(3.5 * SR); add(wet, 11.3, np.sin(2 * np.pi * np.cumsum(np.linspace(110, 70, n0)) / SR) * env(n0, a=0.8, d=0.5, s=0.8, r=0.8), 0.12)
for kk in range(8): add(dry, 11.0 + kk * 0.5, np.sin(2 * np.pi * 55 * tt(int(0.4 * SR))) * np.exp(-tt(int(0.4 * SR)) * 6), 0.14 + 0.02 * kk)
riser(13.0, 15.0, 0.26)

# ========== horon teması ==========
A = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74,
     76, 74, 72, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 69, -1]
B = [81, 79, 76, 79, 81, 79, 76, 74, 76, 74, 72, 74, 76, 79, 76, 74,
     72, 74, 76, 72, 69, 72, 74, 72, 69, 67, 69, 72, 69, -1, 69, -1]
BASS = [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 40]
CH = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59]]
def theme(start, stop, song, oct_from=999, full=False, light=False):
    a = start; i = 0; prev = None
    while a < stop - 0.01:
        m = song[i % len(song)]
        if m > 0:
            kemence(a, m, E8 * 0.95, 0.13 if light else 0.15, prev, vib=0.006)
            if i % 4 == 3: kemence(a + S16, m + 2, S16 * 0.9, 0.05)
            if a >= oct_from: kemence(a, m - 12, E8 * 0.95, 0.07, None, vib=0.004)
            prev = m
        if i % 2 == 0: bass(a, BASS[(i // 2) % 16], E8 * 1.8, 0.2 if light else 0.28)
        if not light:
            if i % 4 == 0: kick(a, 0.75)
            if i % 4 == 2: davul_rim(a, 0.22); clap(a, 0.18 if full else 0.12)
            if i % 8 == 7: davul_rim(a + S16, 0.12)
        else:
            if i % 4 == 2: davul_rim(a, 0.12)
        hat(a, 0.06 if i % 2 == 0 else 0.035); hat(a + S16, 0.025)
        if i % 16 == 0: pad(a, CH[(i // 16) % 4], 4.0, 0.045 if full else 0.03)
        if (full or light) and i % 2 == 1:
            pm = song[(i - 1) % len(song)]; pluck(a, pm - 12 if pm > 0 else 57, 0.06 if light else 0.05)
        a += E8; i += 1
boom(15.0, 1.1); braam(15.0, 33, 2.6, 0.7); bell(15.05, 93, 0.06, 2.0)
theme(15.0, 28.0, A + A + B[:20])
for a in [17.45, 17.95, 18.5, 19.1, 19.75, 20.4]: slap(a)
for a in [21.75, 22.0, 22.5, 22.75, 23.25, 23.5, 24.0, 24.2]: chop(a)
murmur(24.4, 37.2, 0.05)
for a in [25.4, 26.1, 26.7, 27.3]: coin(a, 0.13)
# büyüme
theme(28.0, 33.0, B + A, oct_from=28.0, full=True)
for a, m in zip([28.55, 29.55, 30.55, 31.55], [76, 79, 81, 84]): build(a, m)
ticker(28.4, 32.6)
theme(33.0, 37.0, A, oct_from=33.0, full=True)
# müşteriler (hafif)
theme(37.0, 43.5, B + A, light=True)
murmur(37.0, 43.4, 0.035); blips(37.9, 39.7); page(41.5); page(41.8, 0.1)
# ========== 43.5–46: lodos ==========
boom(43.5, 0.9); braam(43.5, 34, 2.2, 0.55); thunder(43.9, 0.95); thunder(44.85, 0.6, 1.8); rain(43.5, 45.9, 0.12)
theme(43.5, 45.7, B, oct_from=43.5)
# ========== 46: kesik ==========
boom(46.0, 0.35, 50); bell(46.25, 81, 0.12, 1.2); pad(46.0, [33, 45], 1.6, 0.035, hi=400)
# ========== 47.5–55: efsane ==========
pad(47.5, [33, 45, 52, 58], 7.8, 0.06, hi=900)
pad(49.0, [57, 61, 64], 6.2, 0.05, hi=2200, vowel=True)
pad(52.5, [58, 62, 65], 2.6, 0.05, hi=2200, vowel=True)
hb = 47.9
while hb < 54.4:
    kick(hb, 0.45); kick(hb + 0.24, 0.28); hb += 60 / 64
hicaz = [(48.2, 69, 0.9), (49.1, 70, 0.45), (49.55, 73, 1.1), (50.8, 74, 0.45), (51.25, 73, 0.45), (51.7, 70, 0.6), (52.3, 69, 1.3),
         (53.6, 76, 0.4), (53.95, 74, 0.3), (54.25, 73, 0.3), (54.5, 70, 0.25), (54.72, 69, 0.3)]
for a, m, d in hicaz: ney(a, m, d, 0.13)
for i2, m in enumerate([93, 97, 100]): bell(50.6 + i2 * 0.07, m, 0.05, 2.0)   # gözler açılır
riser(53.0, 55.0, 0.26)
# ========== 55–60: kapanış ==========
boom(55.0, 0.95, 70); braam(55.0, 33, 3.5, 0.4)
pad(55.0, [45, 52, 57, 61, 64, 69], 5.0, 0.07, hi=2400)
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
