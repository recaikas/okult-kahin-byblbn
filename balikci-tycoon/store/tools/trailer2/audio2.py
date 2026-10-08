"""Fragman sesi (60 sn, 48 kHz stereo): oyunun KENDİ müziği (Web Audio'dan kaydedildi: Yeşilçam Hatırası + Yayla Horonu) + sinema katmanları
   (dalga, yağmur, gök gürültüsü, koro, çan, vuruşlar, final akoru). Zamanlama timeline.json ile birebir.
   Kullanım: python3 audio2.py <kayıt_dizini> <çıktı.wav>   (kayıt_dizini: song2.wav, song4.wav ...; bkz. recmusic.js) """
import sys, wave, json, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from beats import load, analyze
SR = 48000; DUR = 60.0; N = int(SR * DUR); rng = np.random.default_rng(11)
D = sys.argv[1]; TL = json.load(open(__file__.rsplit('/', 1)[0] + '/timeline.json')); BEAT = TL['BEAT']
dry = np.zeros((2, N)); wet = np.zeros((2, N))
mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)
clamp = lambda x, a=0, b=1: np.minimum(b, np.maximum(a, x))
def put(bus, t, sig, vol=1.0, pan=0.0):
    i = int(round(t * SR))
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))])
    if i >= N: return
    j = min(N, i + sig.shape[1]); bus[:, i:j] += sig[:, :j - i] * vol
def song(name, t0, dur, gain=1.0, fi=0.02, fo=0.05, lp=None):
    a, sr = load(f'{D}/{name}.wav'); a = a / (np.sqrt((a ** 2).mean()) + 1e-9) * {'song4': 0.2, 'song2': 0.13}.get(name, 0.15)
    i = int(t0 * sr); x = a[i:i + int(dur * sr)].T.copy()
    if x.shape[1] < int(dur * sr): x = np.pad(x, ((0, 0), (0, int(dur * sr) - x.shape[1])))
    n = x.shape[1]; env = np.ones(n); f, o = int(fi * sr), int(fo * sr)
    if f: env[:f] = np.linspace(0, 1, f)
    if o: env[-o:] = np.linspace(1, 0, o)
    x *= env * gain
    return lowpass(x, lp) if lp else x
def lowpass(x, fc):
    X = np.fft.rfft(x, axis=-1); f = np.fft.rfftfreq(x.shape[-1], 1 / SR); return np.fft.irfft(X / (1 + (f / fc) ** 4), x.shape[-1], axis=-1)
def bandnoise(dur, lo, hi, seed=None):
    n = int(dur * SR); g = np.random.default_rng(seed) if seed is not None else rng
    X = np.fft.rfft(g.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    m = np.clip((f - lo) / max(1.0, lo * 0.2 + 20), 0, 1) * np.clip((hi - f) / max(1.0, hi * 0.2 + 20), 0, 1)
    y = np.fft.irfft(X * m, n); return y / (np.abs(y).max() + 1e-9)
def adsr(n, a=0.01, d=0.1, s=0.6, r=0.1):
    x = np.full(n, s); ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    if ai: x[:ai] = np.linspace(0, 1, ai)
    x[ai:ai + di] = np.linspace(1, s, len(x[ai:ai + di]))
    if ri and ri < n: x[-ri:] *= np.linspace(1, 0, ri)
    return x
def boom(t, vol=1.0, dur=2.6, f0=62):
    n = int(dur * SR); tt = np.arange(n) / SR; f = f0 * np.exp(-tt * 0.55) + 26
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.5) + bandnoise(dur, 40, 420) * np.exp(-tt * 3.2) * 0.45
    put(dry, t, y, 0.9 * vol); put(wet, t, y, 0.35 * vol)
def crash(t, vol=1.0, dur=2.6):
    n = int(dur * SR); tt = np.arange(n) / SR; y = bandnoise(dur, 3000, 16000) * np.exp(-tt * 1.5); put(dry, t, y, 0.35 * vol); put(wet, t, y, 0.3 * vol)
def riser(t0, t1, vol=1.0, f0=300, f1=6000):
    dur = t1 - t0; n = int(dur * SR); u = np.arange(n) / SR / dur
    y = bandnoise(dur, 200, 12000) * (u ** 2.2); f = f0 * (f1 / f0) ** u; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (u ** 3) * 0.35
    put(dry, t0, y * 0.45 + s, vol * 0.5); put(wet, t0, y * 0.4, vol * 0.4)
def thunder(t, vol=1.0):
    dur = 4.2; n = int(dur * SR); tt = np.arange(n) / SR
    y = bandnoise(dur, 25, 260, seed=int(t * 100)) * np.exp(-tt * 0.9) * (0.6 + 0.4 * np.sin(tt * 9)) + bandnoise(dur, 250, 1400, seed=int(t * 100) + 1) * np.exp(-tt * 2.2) * 0.35
    put(dry, t, y, 0.8 * vol); put(wet, t, y, 0.45 * vol)
def bell(t, m, vol=1.0, dur=3.2):
    f = mid(m); n = int(dur * SR); tt = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dec) for a, r, dec in ((1, 1, 1.3), (.5, 2.76, 2.3), (.3, 5.4, 3.4), (.2, 1.5, 1.7)))
    put(dry, t, y, 0.2 * vol, pan=0.15); put(wet, t, y, 0.45 * vol)
def pad(t, notes, dur, vol=1.0, att=1.5, rel=1.8, bright=0.3):
    for m in notes:
        for dt in (-0.004, 0.0, 0.005):
            n = int(dur * SR); tt = np.arange(n) / SR; f = mid(m) * (1 + dt)
            y = (np.sin(2 * np.pi * f * tt) + bright * np.sin(4 * np.pi * f * tt) + bright * 0.5 * np.sin(6 * np.pi * f * tt)) * adsr(n, att, 0.2, 0.8, rel)
            put(dry, t, y, 0.04 * vol, pan=dt * 40); put(wet, t, y, 0.08 * vol, pan=dt * 40)
def choir(t, notes, dur, vol=1.0):
    for k, m in enumerate(notes):
        f = mid(m); n = int(dur * SR); tt = np.arange(n) / SR; v = 1 + 0.006 * np.sin(2 * np.pi * (5 + k * 0.3) * tt + k)
        y = sum(a * np.sin(2 * np.pi * f * h * v * tt) for h, a in ((1, 1), (2, .55), (3, .35), (4, .12), (5, .18), (6, .08))) * adsr(n, 1.6, 0.3, 0.8, 1.8)
        put(dry, t, y, 0.028 * vol, pan=(k - 1) * 0.3); put(wet, t, y, 0.07 * vol, pan=(k - 1) * 0.3)
def kemence(t, m, dur, vol=1.0):
    f = mid(m); n = int(dur * SR); tt = np.arange(n) / SR; ph = 2 * np.pi * f * (tt + 0.009 * (1 - np.cos(2 * np.pi * 5.5 * tt)) / (2 * np.pi * 5.5))
    y = sum(a * np.sin((k + 1) * ph) for k, a in enumerate((1, .62, .42, .3, .18, .1))) * adsr(n, 0.05, 0.12, 0.75, 0.4)
    put(dry, t, y, 0.1 * vol, pan=-0.1); put(wet, t, y, 0.14 * vol)
def blip(t, vol=1.0):
    n = int(0.09 * SR); tt = np.arange(n) / SR; f = 880 + 700 * tt / 0.09; y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-tt * 28); put(dry, t, y, 0.06 * vol)
def kick(t, vol=1.0, low=40):
    n = int(0.3 * SR); tt = np.arange(n) / SR; f = 120 * np.exp(-tt * 26) + low; y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11); put(dry, t, y, 0.7 * vol)

ph4, per4, P4 = analyze(f'{D}/song4.wav', 152); ph2, per2, P2 = analyze(f'{D}/song2.wav', 84)
dn4 = ph4                                  # horon: ölçü başı = ilk vuruş (vuruş 1 ve 3 güçlü)
dn2 = ph2 + int(np.argmax(per2)) * P2      # yeşilçam: en güçlü vuruş
print('horon faz', round(dn4, 3), '| yesilcam ölçü başı', round(dn2, 3))
at = {c['id']: c for c in TL['clips']}

# ---- zemin: deniz dalgası (açılış) ----
tt = np.arange(N) / SR; swell = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 6.5 - 1.2)
waves = bandnoise(DUR, 80, 1400, seed=3) * (0.25 + 0.75 * swell ** 2)
wv = np.interp(tt, [0, 1.5, 8, 14, 16.2, 100], [0, 0.55, 0.35, 0.12, 0, 0])
dry[0] += waves * wv * 0.22; dry[1] += np.roll(waves, 777) * wv * 0.22

# ---- A: yavaş parça (şafak, ağ atma) ----
put(dry, 0, song('song2', dn2, 16.4, 0.9, fi=2.8, fo=0.08)); put(wet, 0, song('song2', dn2, 16.4, 0.22, fi=2.8, fo=0.08))
pad(0.5, [33, 45, 52], 15.0, 0.9, att=3.0, rel=2.0)
for t in (3.0, 5.7, 9.5, 12.4): bell(t, 81 if int(t) % 2 else 76, 0.18, 2.4)
riser(13.2, 16.2, 0.9); boom(16.2, 1.15, dur=2.2, f0=70); crash(16.2, 0.55, 2.2)

# ---- B: Yayla Horonu ----
hs = at['g1']['at']; he = at['storm']['at']
put(dry, hs, song('song4', dn4, he - hs, 1.0, fi=0.01, fo=0.12))
for i in range(4): crash(hs + i * 4 * BEAT, 0.28 if i else 0.5, 1.4)
for c in range(5): blip(at['cards']['at'] + c * 4 * BEAT + 0.22)
riser(he - 1.0, he, 0.6, 400, 4500)
# ---- C: fırtına ----
t0 = he; wind = bandnoise(5, 120, 900, seed=21) * (0.5 + 0.5 * np.sin(np.arange(int(5 * SR)) / SR * 1.7)); rain = bandnoise(5, 2500, 11000, seed=22)
env = np.interp(np.arange(int(5 * SR)) / SR, [0, 0.3, 4.0, 5.0], [0, 1, 1, 0])
put(dry, t0, wind * env, 0.28); put(dry, t0, rain * env, 0.17, pan=0.1); put(dry, t0 + 0.01, np.roll(rain, 913) * env, 0.12, pan=-0.2)
pad(t0 - 0.1, [33, 40, 45], 4.9, 1.2, att=0.8, rel=1.2); pad(t0, [57, 60, 63], 4.4, 0.7, att=1.2, rel=1.3, bright=0.6)
for k, bt in enumerate(TL['bolts']): thunder(bt + 0.22, 1.0 if k != 1 else 0.75)
for t in np.arange(t0 + 0.6, 38.2, 0.8): kick(t, 0.35, low=34)
# ---- D: derin: Şahmeran ----
ds = at['deep']['at']; de = ds + at['deep']['len']
put(dry, ds, song('song2', dn2 + 8 * 4 * P2 / 4 * 4 * 0 + 14 * P2 * 2, de - ds + 0.2, 0.55, fi=1.8, fo=0.3, lp=1100)); put(wet, ds, song('song2', dn2 + 14 * P2 * 2, de - ds + 0.2, 0.5, fi=1.8, fo=0.3, lp=900))
pad(ds - 0.2, [33, 45, 52], 9.8, 1.0, att=2.0, rel=2.0); pad(ds + 1.2, [57, 60, 64, 67], 8.2, 1.0, att=1.8, rel=2.4, bright=0.4)
choir(ds + 3.2, [57, 60, 64], 6.8, 1.0); choir(ds + 6.0, [57, 61, 64], 3.5, 0.9)
for t_, m in ((ds + 0.6, 81), (ds + 4.3, 76), (ds + 5.6, 79), (ds + 7.0, 84)): bell(t_, m, 0.7, 3.4)
for t_ in np.arange(ds + 1.0, de - 0.6, 1.0): kick(t_, 0.28, low=36)
riser(46.0, de, 0.9, 200, 5000)
# ---- E: Yayla Horonu (final montajı) ----
gs = at['g3']['at']; ge = at['golden']['at']
boom(gs, 1.2, dur=2.0, f0=72); crash(gs, 0.7, 2.0)
put(dry, gs, song('song4', dn4 + 8 * P4, ge - gs, 1.0, fi=0.01, fo=0.06))
for k in range(1, 4): crash(gs + k * 8 * BEAT * 0.5 * 1.0, 0.18, 0.9)
boom(53.5, 0.8, dur=1.6, f0=66); riser(52.2, ge, 0.8, 400, 9000)
# ---- F: logo: dev vuruş + La majör (Picardie) ----
boom(ge, 1.4, dur=3.6, f0=66); crash(ge, 1.0, 3.6)
pad(ge, [33, 45, 52, 57, 61, 64], 4.9, 1.7, att=0.05, rel=2.6, bright=0.5)
for k, m in enumerate((81, 85, 88, 93)): bell(ge + 0.15 + k * 0.28, m, 0.8, 3.4)
kemence(ge + 0.2, 76, 2.2, 1.0); kemence(ge + 2.2, 81, 2.6, 0.9)

# ---- reverb + miks ----
def reverb(sig, seed):
    L = int(2.9 * SR); g = np.random.default_rng(seed); ir = g.standard_normal(L) * np.exp(-np.arange(L) / SR * 2.0)
    ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR)); ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = N + L; return np.fft.irfft(np.fft.rfft(sig, n) * np.fft.rfft(ir, n), n)[:N]
mix = np.stack([dry[0] + reverb(wet[0], 11), dry[1] + reverb(wet[1], 12)])
lvl = np.interp(tt, [0, 3, 12, 16.0, 16.2, 34.3, 34.4, 38.3, 38.5, 46, 47.8, 47.9, 55.0, 60], [0.5, 0.75, 0.85, 0.9, 1.0, 1.0, 0.8, 0.8, 0.62, 0.7, 0.8, 1.0, 1.0, 1.0])
mix *= lvl[None, :] * np.interp(tt, [0, 0.8, 59.0, 60.0], [0, 1, 1, 0])[None, :]
mix = np.tanh(mix * 1.5) / np.tanh(1.5); mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(sys.argv[2], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[2], 'RMS', round(float(np.sqrt((mix ** 2).mean())), 3))
