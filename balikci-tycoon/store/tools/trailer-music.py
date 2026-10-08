"""Sinematik fragman müziği: 60 sn özgün chiptune + deniz ambiyansı. Telifsiz, bu dosyadan üretilir.
   Bölümler trailer.js'deki çekim zamanlarına oturur (138 BPM, ızgara 10.0 sn'de başlar):
     0–10   deniz + pad + kemençe havası, 7.5'ten yükselen gerilim
     10     vuruş: horon teması (mekanikler), 30.9'dan sonra ikinci ses ve sık zil
     43.0   kesik: hicaz drone + kalp atışı (Dipteki Söz)
     51.7   doruk: tema tam kadro
     56.0   kapanış akoru, deniz sesiyle söner
   python3 store/tools/trailer-music.py store/video/trailer-music.wav"""
import sys, wave, numpy as np
SR = 44100; DUR = 60.0; BPM = 138
beat = 60 / BPM; e8 = beat / 2; bar = beat * 4
T0 = 10.0                      # tema başlangıcı (vuruş)
BREAK = T0 + 19 * bar          # 43.04: hikâye kesiği
CLIMAX = T0 + 24 * bar         # 51.74: doruk
END = 56.0                     # kapanış akoru
N = int(SR * DUR)
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, d=0.12, s=0.55, r=0.06):
    x = np.ones(n); ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    if ai: x[:ai] = np.linspace(0, 1, ai)
    x[ai:ai + di] = np.linspace(1, s, len(x[ai:ai + di])); x[ai + di:] = s
    if ri and ri < n: x[-ri:] *= np.linspace(1, 0, ri)
    return x
def square(f, n, duty=0.5, vib=0.0, vr=5.5):
    t = np.arange(n) / SR; ph = (f * t + vib * np.sin(2 * np.pi * vr * t) / vr) % 1.0
    return np.where(ph < duty, 1.0, -1.0)
def tri(f, n):
    ph = (f * np.arange(n) / SR) % 1.0; return 4 * np.abs(ph - 0.5) - 1
def saw(f, n): return 2 * ((f * np.arange(n) / SR) % 1.0) - 1
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))
def add(buf, start, sig, vol):
    i = int(start * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * vol
def kick(n_s=0.22, f0=120, f1=42):
    n = int(n_s * SR); tt = np.arange(n) / SR; f = f0 * np.exp(-tt * 26) + f1
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
def noise(n_s, decay): n = int(n_s * SR); return rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * decay)

sea = np.zeros(N); pad = np.zeros(N); lead = np.zeros(N); bass = np.zeros(N); drum = np.zeros(N); fx = np.zeros(N)

# --- deniz: alçak geçiren gürültü, yavaş dalga kabarması; tema altında kısılır ---
t = np.arange(N) / SR
waves = 0.55 + 0.45 * np.sin(2 * np.pi * t / 6.5) ** 2
sea_lvl = np.interp(t, [0, 9, 10.5, 42.5, 43.2, 51, 52, 56, 60], [1, 1, .25, .25, .55, .55, .2, .7, .9])
sea = lowpass(rng.uniform(-1, 1, N), 500) * waves * sea_lvl * 2.2
foam = lowpass(rng.uniform(-1, 1, N), 3500) - lowpass(rng.uniform(-1, 1, N), 1200)
sea += foam * (np.sin(2 * np.pi * t / 6.5 - 0.6) ** 8) * sea_lvl * 0.25

# --- giriş padi (La minör: Am F C G), yavaş açılır ---
chords = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]]
for k, ch in enumerate(chords):
    st = 0.4 + k * 2.4; n = int(2.9 * SR)
    for m in ch:
        sig = (saw(hz(m), n) + saw(hz(m) * 1.004, n)) * 0.5
        add(pad, st, lowpass(sig, 900) * env(n, a=0.9, d=0.4, s=0.8, r=0.9), 0.07)
# kemençe havası: titrek, seyrek uzun notalar
intro_mel = [(2.4, 76, 0.9), (3.3, 74, 0.45), (3.75, 72, 0.45), (4.2, 74, 1.4), (6.0, 72, 0.45), (6.45, 71, 0.45), (6.9, 69, 1.8)]
for st, m, d in intro_mel:
    n = int(d * SR); add(lead, st, square(hz(m), n, 0.3, vib=4, vr=6) * env(n, a=0.06, d=0.2, s=0.7, r=0.25), 0.09)

# --- yükselen gerilim (7.5–10 ve 50.2–51.74) ---
def riser(a, b, vol):
    n = int((b - a) * SR); ramp = np.linspace(0, 1, n) ** 2.2
    sig = rng.uniform(-1, 1, n)
    hp = sig - lowpass(np.concatenate([sig, np.zeros(SR)]), 2000)[:n]
    add(fx, a, hp * ramp, vol)
    k = a + (b - a) * 0.35                       # hızlanan trampet
    gap = 0.22
    while k < b - 0.02:
        add(drum, k, noise(0.08, 40), 0.06 + 0.16 * (k - a) / (b - a)); gap = max(0.045, gap * 0.86); k += gap
riser(7.6, T0, 0.22)
riser(50.2, CLIMAX, 0.22)

def impact(at, vol=1.0):
    add(drum, at, kick(0.6, 150, 38), 0.9 * vol)
    add(fx, at, lowpass(noise(1.2, 3.5), 1800), 0.5 * vol)
    n = int(2.2 * SR); add(bass, at, tri(hz(33), n) * env(n, a=0.002, d=1.6, s=0.0, r=0.3), 0.45 * vol)
impact(T0); impact(BREAK, 0.8); impact(CLIMAX); impact(END, 1.1)

# --- horon teması (music.py ile aynı motifler) ---
A = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74,
     76, 74, 72, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 69, -1]
B = [81, 79, 76, 79, 81, 79, 76, 74, 76, 74, 72, 74, 76, 79, 76, 74,
     72, 74, 76, 72, 69, 72, 74, 72, 69, 67, 69, 72, 69, -1, 69, -1]
bassline = [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 40]
def theme(start, stop, song, hot_from):
    tt = start; i = 0
    while tt < stop - 0.01:
        hot = tt >= hot_from
        m = song[i % len(song)]
        if m > 0:
            n = int(e8 * 0.92 * SR)
            add(lead, tt, square(hz(m), n, 0.25, vib=2.5) * env(n, d=0.08, s=0.45), 0.15)
            add(lead, tt + 0.11, square(hz(m), n, 0.25) * env(n, d=0.06, s=0.3), 0.045)      # yankı
            if hot: add(lead, tt, square(hz(m - 12), n, 0.5) * env(n, d=0.06, s=0.35), 0.06)  # alt oktav
        if i % 2 == 0:
            bm = bassline[(i // 2) % len(bassline)]; n = int(e8 * 1.8 * SR)
            add(bass, tt, tri(hz(bm), n) * env(n, d=0.2, s=0.6), 0.34)
        if i % 4 == 0: add(drum, tt, kick(), 0.6)
        if i % 4 == 2: add(drum, tt, noise(0.13, 28), 0.2)
        add(drum, tt, noise(0.03, 120), 0.07 if i % 2 == 0 else 0.04)
        if hot: add(drum, tt + e8 / 2, noise(0.02, 160), 0.035)                           # 16'lık zil
        tt += e8; i += 1
theme(T0, BREAK - 0.02, A + A + B + A + B, T0 + 12 * bar)
theme(CLIMAX, END - 0.01, B + A, CLIMAX)

# --- hikâye: hicaz drone, kalp atışı, uzak ney havası ---
n = int((CLIMAX - BREAK) * SR)
dr = (saw(hz(33), n) + saw(hz(40) * 1.003, n) + tri(hz(45), n)) / 3
add(pad, BREAK, lowpass(dr, 420) * env(n, a=1.2, d=0.5, s=0.9, r=1.0), 0.33)
hb = BREAK + 0.9
while hb < CLIMAX - 1.6:
    add(drum, hb, kick(0.25, 80, 38), 0.45); add(drum, hb + 0.26, kick(0.2, 70, 36), 0.28); hb += 60 / 66
hicaz = [(44.4, 69, 0.9), (45.3, 70, 0.5), (45.8, 73, 1.2), (47.2, 74, 0.5), (47.7, 73, 0.5), (48.2, 70, 0.6), (48.8, 69, 1.6)]
for st, m, d in hicaz:
    n = int(d * SR)
    s = tri(hz(m), n) * 0.7 + lowpass(rng.uniform(-1, 1, n), 2500) * 0.12       # ney: üflemeli
    add(lead, st, s * env(n, a=0.12, d=0.2, s=0.8, r=0.3) * (1 + 0.15 * np.sin(2 * np.pi * 5 * np.arange(n) / SR)), 0.16)

# --- kapanış akoru ---
n = int((DUR - END) * SR)
for m in [45, 52, 57, 60, 64, 69]:
    sig = (saw(hz(m), n) + square(hz(m) * 1.003, n, 0.5)) * 0.5
    add(pad, END, lowpass(sig, 1400) * env(n, a=0.01, d=3.2, s=0.0, r=0.5) ** 1.3, 0.07)
for k, m in enumerate([69, 72, 76, 81]):                                           # çan arpeji
    nn = int(2.5 * SR); add(lead, END + 0.18 * k, square(hz(m), nn, 0.125) * np.exp(-np.arange(nn) / SR * 2.4), 0.07)

mix = sea * 0.18 + pad + lead + bass + drum + fx
fi = int(0.5 * SR); fo = int(2.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi); mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.6) / np.tanh(1.6) * 0.9            # yumuşak sınırlayıcı
st = np.stack([mix + 0.015 * sea, np.roll(mix, int(0.012 * SR)) * 0.97 - 0.015 * sea], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], round(len(mix) / SR, 2), 's', 'break', round(BREAK, 2), 'climax', round(CLIMAX, 2))
