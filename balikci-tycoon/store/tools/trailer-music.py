"""Sinematik fragman müziği + ses efektleri (60 sn, 48 kHz stereo). Özgün, telifsiz; yalnız numpy ile üretilir.
   Zaman çizelgesi capture-trailer.js ile birebir: 0-12 şafak · 12-20 dört vuruş · 20-30 limanlar · 30-36 müşteriler ·
   36-40.5 fırtına · 40.5-50 efsane · 50-51.5 başlık · 51.5-56 final montajı · 56-60 logo.
   Kullanım: python3 store/tools/trailer-music.py store/video/trailer-music.wav"""
import sys, wave, numpy as np

SR = 48000; DUR = 60.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)
dry = np.zeros((2, N)); wet = np.zeros((2, N))


def put(bus, t, sig, vol=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * vol
    bus[0, i:j] += s * (1 - max(0, pan)); bus[1, i:j] += s * (1 + min(0, pan))


def adsr(n, a=0.01, d=0.1, s=0.6, r=0.1):
    a_, d_, r_ = int(a * SR), int(d * SR), int(r * SR)
    x = np.full(n, s)
    if a_: x[:a_] = np.linspace(0, 1, a_)
    x[a_:a_ + d_] = np.linspace(1, s, len(x[a_:a_ + d_]))
    if r_ and r_ < n: x[-r_:] *= np.linspace(1, 0, r_)
    return x


def tone(f, dur, harm=(1, .5, .25), vib=0.0, vr=5.5, a=0.01, d=0.15, s=0.6, r=0.12, detune=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * (t + vib * 0.01 * (1 - np.cos(2 * np.pi * vr * t)) / (2 * np.pi * vr))
    y = sum(h * np.sin((k + 1) * ph * (1 + detune)) for k, h in enumerate(harm))
    return y * adsr(n, a, d, s, r)


def pulse(f, dur, duty=0.25, a=0.004, d=0.08, s=0.5, r=0.05, vib=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = (f * t + vib * 0.004 * np.sin(2 * np.pi * 5.5 * t) * f / 5.5) % 1.0
    return np.where(ph < duty, 1.0, -1.0) * adsr(n, a, d, s, r)


def tri(f, dur, **k):
    n = int(dur * SR); t = np.arange(n) / SR
    return (4 * np.abs((f * t) % 1.0 - 0.5) - 1) * adsr(n, **k)


def bandnoise(dur, lo, hi, seed=None):
    n = int(dur * SR); g = np.random.default_rng(seed) if seed is not None else rng
    X = np.fft.rfft(g.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    m = np.clip((f - lo) / max(1.0, lo * 0.2 + 20), 0, 1) * np.clip((hi - f) / max(1.0, hi * 0.2 + 20), 0, 1)
    y = np.fft.irfft(X * m, n); return y / (np.max(np.abs(y)) + 1e-9)


def kick(vol=1.0, t=0.0, bus=dry, low=42):
    n = int(0.28 * SR); tt = np.arange(n) / SR; f = 130 * np.exp(-tt * 26) + low
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 13); y[:40] *= np.linspace(0, 1, 40)
    put(bus, t, y, 0.8 * vol)


def snare(t, vol=1.0):
    n = int(0.2 * SR); tt = np.arange(n) / SR
    y = bandnoise(0.2, 1500, 9000) * np.exp(-tt * 22) * 0.8 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 28) * 0.5
    put(dry, t, y, 0.5 * vol); put(wet, t, y, 0.18 * vol)


def hat(t, vol=1.0, op=False):
    n = int((0.16 if op else 0.04) * SR); tt = np.arange(n) / SR
    put(dry, t, bandnoise(n / SR, 6500, 15000) * np.exp(-tt * (22 if op else 90)), 0.16 * vol, pan=0.2)


def crash(t, vol=1.0, dur=2.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    y = bandnoise(dur, 3000, 16000) * np.exp(-tt * 1.5)
    put(dry, t, y, 0.45 * vol); put(wet, t, y, 0.3 * vol)


def boom(t, vol=1.0, dur=2.4, f0=62):
    n = int(dur * SR); tt = np.arange(n) / SR; f = f0 * np.exp(-tt * 0.5) + 28
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.7)
    y += bandnoise(dur, 40, 400) * np.exp(-tt * 3.0) * 0.5
    put(dry, t, y, 1.0 * vol); put(wet, t, y, 0.35 * vol)


def riser(t0, t1, vol=1.0, f0=300, f1=6000):
    dur = t1 - t0; n = int(dur * SR); tt = np.arange(n) / SR; u = tt / dur
    y = bandnoise(dur, 200, 12000) * (u ** 2.2)
    f = f0 * (f1 / f0) ** u; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (u ** 3) * 0.4
    put(dry, t0, y * 0.5 * vol + s * vol, 0.5); put(wet, t0, y * 0.4 * vol, 0.4)


def whoosh(t, vol=1.0, dur=0.7):
    n = int(dur * SR); tt = np.arange(n) / SR; u = tt / dur
    put(dry, t, bandnoise(dur, 400, 7000) * np.sin(np.pi * u) ** 2, 0.35 * vol, pan=0.3)


def bell(t, m, vol=1.0, dur=3.0):
    f = mid(m); n = int(dur * SR); tt = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dec) for a, r, dec in ((1, 1, 1.4), (.5, 2.76, 2.4), (.3, 5.4, 3.6), (.2, 1.5, 1.8)))
    put(dry, t, y, 0.28 * vol, pan=0.15); put(wet, t, y, 0.5 * vol)


def pad(t, notes, dur, vol=1.0, att=1.4, rel=1.6, bright=0.3):
    for m in notes:
        for dt in (-0.004, 0.0, 0.005):
            y = tone(mid(m) * (1 + dt), dur, harm=(1, bright, bright * 0.5), a=att, d=0.2, s=0.8, r=rel)
            put(dry, t, y, 0.05 * vol, pan=dt * 40); put(wet, t, y, 0.09 * vol, pan=dt * 40)


def choir(t, notes, dur, vol=1.0):
    for k, m in enumerate(notes):
        f = mid(m); n = int(dur * SR); tt = np.arange(n) / SR
        v = 1 + 0.006 * np.sin(2 * np.pi * (5 + k * 0.3) * tt + k)
        y = sum(a * np.sin(2 * np.pi * f * h * v * tt) for h, a in ((1, 1), (2, .55), (3, .35), (4, .12), (5, .18), (6, .08)))
        y *= adsr(n, 1.6, 0.3, 0.8, 1.8)
        put(dry, t, y, 0.03 * vol, pan=(k - 1) * 0.3); put(wet, t, y, 0.07 * vol, pan=(k - 1) * 0.3)


def lead(t, m, dur, vol=1.0, kind='kemence'):
    f = mid(m)
    if kind == 'kemence':      # kemençe benzeri: testere + titreşim, hafif kayma
        y = tone(f, dur, harm=(1, .62, .42, .3, .18, .1), vib=0.9, a=0.03, d=0.1, s=0.75, r=0.18)
        put(dry, t, y, 0.12 * vol, pan=-0.1); put(wet, t, y, 0.12 * vol)
    else:                      # chiptune
        y = pulse(f, dur, 0.25, vib=0.5, s=0.45)
        put(dry, t, y, 0.1 * vol, pan=-0.1); put(wet, t, y * 0.6, 0.06 * vol)


def bass(t, m, dur, vol=1.0):
    y = tri(mid(m), dur, a=0.004, d=0.1, s=0.7, r=0.05) + 0.3 * np.sin(2 * np.pi * mid(m) * 2 * np.arange(int(dur * SR)) / SR) * adsr(int(dur * SR), 0.004, .06, .3, .05)
    put(dry, t, y, 0.3 * vol)


def arp(t, m, dur=0.12, vol=1.0, pan=0.0):
    y = pulse(mid(m), dur, 0.125, a=0.002, d=0.04, s=0.35, r=0.03)
    put(dry, t, y, 0.05 * vol, pan=pan); put(wet, t, y, 0.03 * vol, pan=-pan)


# ---------------- zemin: dalgalar + yağmur ----------------
tt = np.arange(N) / SR
swell = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 6.5 - 1.2)
waves = bandnoise(DUR, 80, 1400, seed=3) * (0.25 + 0.75 * swell ** 2)
wv = np.clip(np.interp(tt, [0, 1.5, 12, 14, 30, 36, 38, 60], [0, 0.55, 0.45, 0.18, 0.12, 0.0, 0.0, 0]), 0, 1)
dry[0] += waves * wv * 0.22; dry[1] += np.roll(waves, 777) * wv * 0.22
rain = bandnoise(DUR, 2500, 11000, seed=5)
rv = np.interp(tt, [0, 35.6, 36.4, 40.0, 41.2, 60], [0, 0, 0.22, 0.22, 0.0, 0])
dry[0] += rain * rv * 0.5; dry[1] += np.roll(rain, 913) * rv * 0.5

# ---------------- 0–12: şafak ----------------
pad(0.4, [33, 45, 52], 11.8, vol=1.0, att=3.2, rel=2.0)
pad(5.0, [57, 60, 64], 7.2, vol=0.8, att=2.6, rel=1.8)
for t, m, d in [(2.6, 64, 1.5), (4.2, 65, 0.6), (5.0, 64, 0.6), (5.7, 62, 0.6), (6.5, 61, 1.2), (8.0, 62, 0.6), (8.8, 64, 1.6), (10.6, 57, 1.4)]:
    lead(t, m, d, 0.9)
for t in np.arange(3.0, 11.9, 1.0): bell(t, 81 if int(t) % 2 else 76, 0.25, 2.0)
for t in np.arange(8.0, 12.0, 1.0): kick(0.35 + (t - 8) * 0.12, t, low=38)
riser(8.4, 12.0, 0.9)
whoosh(11.5, 0.9, 0.9)

# ---------------- ana tema ----------------
P1 = [76, 76, 77, 76, 73, 74, 73, 69, 70, 73, 76, 74, 73, 70, 69, 0]
P2 = [81, 81, 80, 81, 77, 76, 74, 73, 74, 76, 77, 76, 74, 73, 70, 69]
ROOTS = [45, 45, 46, 45, 38, 38, 46, 45]
E8 = 0.25


def theme(t0, t1, melody, oct_=0, bassv=1.0, kind='kemence', kicks=True, snr=True, hats=True, arps=False):
    t = t0; i = 0
    while t < t1 - 1e-6:
        bar = int((t - t0) / (E8 * 8)); step = i % 8
        r = ROOTS[bar % len(ROOTS)]
        if step % 2 == 0: bass(t, r, E8 * 1.9, bassv)
        if kicks and step % 2 == 0: kick(0.9, t)
        if snr and step in (2, 6): snare(t, 0.9)
        if hats: hat(t, 0.8, op=(step == 7))
        m = melody[(i) % len(melody)]
        if m: lead(t, m + oct_, E8 * 0.95, 0.9, kind)
        if arps:
            ch = [r + 24, r + 27 if r != 46 else r + 28, r + 31, r + 36]
            arp(t, ch[i % 4] + 0, 0.1, 1.0, pan=0.3 if i % 2 else -0.3)
            arp(t + E8 / 2, ch[(i + 2) % 4] + 12, 0.08, 0.8, pan=-0.3 if i % 2 else 0.3)
        t += E8; i += 1


# 12–20 dört vuruş
for h, vol in ((12.0, 1.0), (14.0, 0.8), (16.0, 0.8), (18.0, 0.95)):
    boom(h, vol, dur=1.8, f0=70); crash(h, 0.5 * vol, dur=1.4); whoosh(h - 0.35, 0.8, 0.35)
theme(12.0, 14.0, P1, kind='kemence', snr=False, hats=False)
theme(14.0, 18.0, P1, kind='kemence', hats=False)
theme(18.0, 20.0, P2, kind='kemence', hats=True)
pad(12.0, [45, 52, 57, 60], 8.0, 0.9, att=0.3, rel=0.8)
# 20–30 limanlar: arp, daha dolgun
theme(20.0, 28.0, P2, kind='chip', arps=True)
pad(20.0, [46, 53, 58, 62], 4.0, 0.8, att=0.5, rel=1.0); pad(24.0, [45, 52, 57, 60], 4.0, 0.8, att=0.5, rel=1.0)
theme(28.0, 30.0, P1, oct_=12, kind='chip', arps=True, hats=False)
riser(28.4, 30.0, 0.5, 400, 3000)
# 30–36 müşteriler: zıplak horon havası (7/8 benzeri vurgu: 3+2+2)
HOR = [72, 0, 73, 72, 0, 70, 69, 0, 72, 0, 73, 76, 0, 74, 73, 0]
t = 30.0; i = 0
while t < 35.5:
    step = i % 8; r = ROOTS[int((t - 30) / 2) % 4]
    if step in (0, 3, 5): kick(0.8, t); bass(t, r, 0.2, 1.0)
    if step in (2, 6): snare(t, 0.6)
    hat(t, 0.7)
    m = HOR[i % 16]
    if m: lead(t, m + 12, 0.2, 0.9, 'kemence')
    if step % 4 == 1: arp(t, r + 36, 0.08, 0.8, 0.3)
    t += E8 / 1.0; i += 1
for t_ in (30.2, 33.3): bell(t_, 88, 0.6, 1.6)
# 35.5–36.4: nefes kesme
riser(34.6, 36.2, 0.6, 200, 1500)
# 36–40.5 fırtına
pad(36.2, [33, 40, 45], 4.6, 1.2, att=0.8, rel=1.5)
pad(36.4, [57, 60, 63], 4.0, 0.7, att=1.2, rel=1.5, bright=0.6)     # azaltılmış üçlü gerilim
t = 36.4
while t < 40.2: kick(0.5, t, low=34); t += 0.75
boom(37.55, 1.25, dur=3.0, f0=48)
put(wet, 37.5, bandnoise(2.5, 30, 500) * np.exp(-np.arange(int(2.5 * SR)) / SR * 1.3), 0.5)
riser(39.2, 40.5, 0.5, 200, 2500)
# 40.5–50.1 efsane: derin, durgun, korolu
pad(40.4, [33, 45, 52], 10.0, 1.0, att=2.2, rel=2.5)
pad(41.8, [57, 60, 64, 67], 8.2, 1.0, att=1.8, rel=2.5, bright=0.4)
choir(43.0, [57, 60, 64], 7.0, 1.0)
choir(47.0, [57, 61, 64], 3.0, 1.0)         # Şahmeran: Do not hurry...
for t_, m in ((41.9, 81), (43.3, 76), (44.7, 79), (46.1, 84)): bell(t_, m, 0.7, 3.2)
for t_ in np.arange(42.0, 49.0, 1.0): kick(0.3, t_, low=36)
bell(48.3, 69, 0.6, 3.6)
# 50.1–51.5 başlık: sessizlik + tek vuruş, sonra yükseliş
boom(50.3, 1.0, dur=2.0, f0=55); bell(50.3, 57, 0.9, 3.0); bell(50.3, 64, 0.5, 3.0)
riser(50.5, 51.5, 0.9, 200, 5000)

# 51.5–56 final montajı: 16'lık arp + dört vuruş + her kesmede vuruş
crash(51.5, 1.0, 2.2); boom(51.5, 0.9, dur=1.2, f0=75)
t = 51.5; i = 0
while t < 55.6:
    step = i % 4; r = 45 if int((t - 51.5) / 1.0) % 2 == 0 else 46
    if step == 0: kick(1.0, t); bass(t, r, 0.45, 1.1); hat(t, 0.9, True)
    if step == 2: snare(t, 1.0)
    hat(t, 0.6)
    arp(t, [r + 24, r + 31, r + 36, r + 40][i % 4], 0.1, 1.5, pan=0.35 if i % 2 else -0.35)
    t += 0.125; i += 1
t = 51.5
mel = [81, 80, 81, 77, 76, 74, 77, 81, 84, 83, 84, 81, 80, 77, 76, 81]
for k, m in enumerate(mel[:9]): lead(51.5 + k * 0.5, m, 0.48, 1.1, 'chip'); lead(51.5 + k * 0.5, m - 12, 0.48, 0.8, 'kemence')
crash(53.5, 0.8, 1.8)
# 55.6–56.0 vuruş öncesi sessizlik, sonra logoya dev vuruş + Picardie (La majör) akoru
riser(54.9, 55.6, 0.7, 500, 9000)
boom(56.0, 1.3, dur=3.6, f0=66); crash(56.0, 1.1, 3.4)
pad(56.0, [33, 45, 52, 57, 61, 64], 3.9, 1.6, att=0.05, rel=2.6, bright=0.5)
for k, m in enumerate((81, 85, 88, 93)): bell(56.15 + k * 0.28, m, 0.7, 3.2)
lead(56.2, 76, 1.8, 1.0, 'kemence'); lead(58.0, 81, 1.6, 0.9, 'kemence')

# ---------------- reverb + miks ----------------
def reverb(sig, seed):
    L = int(2.8 * SR); g = np.random.default_rng(seed); ir = g.standard_normal(L) * np.exp(-np.arange(L) / SR * 2.0)
    ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = N + L; F = np.fft.rfft(sig, n) * np.fft.rfft(ir, n); return np.fft.irfft(F, n)[:N]

mix = np.stack([dry[0] + reverb(wet[0], 11) * 1.0, dry[1] + reverb(wet[1], 12) * 1.0])
# 55.6–56.0 kısa sessizlik (yalnız riser'ın sonu kalsın)
gate = np.ones(N); a, b = int(55.62 * SR), int(55.99 * SR); gate[a:b] = np.linspace(0.25, 0.0, b - a)
mix = mix * gate
# bölüm bölüm ses seviyesi: sessiz açılış, gür vuruşlar, durgun efsane, dev final
lvl = np.interp(tt, [0, 3, 8, 11.6, 12.0, 20, 30, 36, 36.4, 40.4, 40.6, 46, 49, 50.1, 50.3, 51.5, 56, 60], [0.35, 0.5, 0.62, 0.7, 1.0, 1.0, 0.85, 0.85, 0.7, 0.7, 0.42, 0.5, 0.55, 0.45, 0.85, 1.0, 1.0, 1.0])
mix = mix * lvl[None, :]
mix *= np.interp(tt, [0, 1.0, 59.0, 60.0], [0, 1, 1, 0])[None, :]
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], len(mix[0]) / SR, 's')
