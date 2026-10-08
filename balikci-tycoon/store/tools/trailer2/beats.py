"""Kaydedilen oyun şarkılarında vuruş fazını ve ölçü başını bulur. python3 beats.py <wav> <bpm>"""
import sys, wave, numpy as np
def load(p):
    w = wave.open(p); n = w.getnframes(); sr = w.getframerate()
    a = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, 2) / 32768.
    return a, sr
def analyze(path, bpm):
    a, sr = load(path); m = a.mean(1); P = 60.0 / bpm
    N = 1024; hop = 240; win = np.hanning(N)
    frames = np.array([np.abs(np.fft.rfft(m[i:i + N] * win)) for i in range(0, len(m) - N, hop)])
    flux = np.maximum(0, np.diff(frames, axis=0)).sum(1); fr = sr / hop
    best = None
    for ph in np.arange(0, P, 0.004):
        idx = ((ph + np.arange(0, len(flux) / fr - P, P)) * fr).astype(int)
        idx = idx[idx < len(flux)]
        sc = flux[idx].sum()
        if best is None or sc > best[0]: best = (sc, ph)
    ph = best[1]
    # düşük frekans (vurak) enerjisi: hangi vuruş ölçü başı?
    lows = []
    for k in range(int((len(m) / sr - ph) / P) - 1):
        i = int((ph + k * P) * sr); seg = m[i:i + int(0.08 * sr)]
        S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); f = np.fft.rfftfreq(len(seg), 1 / sr)
        lows.append(S[(f > 30) & (f < 160)].sum())
    lows = np.array(lows); per = [lows[j::4].mean() for j in range(4)]
    return ph, per, P
if __name__ == '__main__':
    ph, per, P = analyze(sys.argv[1], float(sys.argv[2]))
    print('faz', round(ph, 3), 'sn; vuruş', round(P, 4), '; düşük enerji (4 vuruş):', [round(x, 2) for x in per], '→ ölçü başı vuruş #', int(np.argmax(per)))
