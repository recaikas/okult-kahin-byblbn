"""Gün 2 · Bölüm 1 · Tek Başına Olmaz — müzik ve ses (74 sn). ep02-b1-tek-basina.js'teki çekimlere oturur.
     0–2.2   soğuk açılış: PAT!, donma, geri sarma
     2.2–5   şafak: martılar, dalga; sakin akustik (saz arpeji, pad, kemençe), örtü çekilir
     5–10    ilk satış: terazi, sikke şıngırtısı; uğultu büyür, müzik hızlanır; endişe vuruşu
     10–13.1 hızlı kesmeler: horon temposu, kasa gümü, terazi, sikkeler, ayak vuruşu
     13.1–14.85 ağır çekim: müzik çekilir, havada ıslık, kalp atışı; 14.85 PAT! ve müzik kesilir
     16–21   yabancı: uğultu söner, gizemli ney (hicaz), adımlar, çanta yere
     21–26   tokalaşma: kasa sürtünür ve konur, duraksama, 24.35 tokalaşma çanı, umutlu müzik
     26–30   birlikte: yükseliş, 30'da geçiş vuruşu → horon (mekanik)
     30–69   mekanik: seri kartı, dokunuşlar, işe alım çanı, roller (pop), ekip
     69–74   kapanış: La majöre çözülür
   Kullanım: python3 store/tools/film/ep02-b1-music.py store/video/gun2-b1-music.wav"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound import *
import sound

init(74)
sea_bed([0, 2.0, 2.3, 9.8, 10.2, 15.9, 16.2, 20.8, 21.2, 29.8, 30.2, 69.2, 69.6, 74],
        [0.15, 0.15, 1.0, .7, .25, .25, .55, .55, .6, .6, .18, .18, .8, .8])

# ---------- 0–2.2: soğuk açılış (kanca) ----------
n = int(0.3 * SR); tw = tt(n)
add(sound.dry, 0.0, np.sin(2 * np.pi * np.cumsum(1900 - 900 * tw / 0.3) / SR) * env(n, 0.02, 0.1, 0.9, 0.05) * 0.04)   # düşen ıslık
slap(0.30, 0.5); clap(0.30, 0.35); boom(0.31, 0.4, 120)                  # PAT!
n = int(0.5 * SR); tw = tt(n)                                              # donma: bant durması
add(sound.dry, 1.0, np.sin(2 * np.pi * np.cumsum(220 * (1 - tw / 0.6)) / SR) * env(n, 0.005, 0.1, 0.9, 0.1) * 0.12)
boom(1.0, 0.45, 50)
pad(1.0, [45, 52, 58], 1.2, 0.03, hi=600)
riser(1.65, 2.2, 0.22); whoosh(2.0, 0.25, 0.25, 5000)                    # geri sarma

# ---------- 2.2–5: şafak ----------
for a in [2.3, 3.5, 4.6]: gull(a, 0.07)
pad(2.2, [48, 55, 60, 64], 1.6, 0.04, hi=1200); pad(3.6, [53, 57, 60, 65], 1.6, 0.04, hi=1200)
for i, m in enumerate([60, 64, 67, 72, 67, 64, 65]):
    pluck(2.25 + i * 0.4, m, 0.05)
prev = None
for a, m, d in [(2.6, 76, 0.6), (3.2, 79, 0.4), (3.6, 77, 0.4), (4.0, 76, 0.5), (4.5, 72, 0.6)]:
    kemence(a, m, d, 0.07, prev, vib=0.014); prev = m
scrape(3.85, 4.45, 0.07)                       # örtü çekilir
bell(4.5, 84, 0.03, 1.4)                       # gülümseme

# ---------- 5–10: ilk satış, büyüyen kuyruk ----------
k = 5.0
while k < 9.0: step_wood(k, 0.05); k += 0.3     # Nermin Teyze gelir
pad(5.0, [48, 55, 60, 64], 2.5, 0.04); pad(7.5, [43, 55, 59, 62], 2.5, 0.045)
a, i = 5.0, 0
arp_n = [60, 64, 67, 72]
while a < 10.0:
    pluck(a, arp_n[i % 4], 0.05); i += 1
    a += 0.36 if a < 7.0 else 0.28 if a < 8.5 else 0.2       # müzik hızlanır
bell(6.2, 91, 0.03, 0.6)                       # terazi
coin(7.05, 0.16); coin(7.15, 0.12); coin(7.22, 0.09)        # ilk sikkeler
murmur(6.6, 8.6, 0.03); murmur(7.6, 10.0, 0.05)
for a in [7.0, 7.5, 8.0, 8.5, 9.0, 9.5]: hat(a, 0.04); hat(a + 0.25, 0.03)
for a in [8.0, 8.5, 9.0, 9.5]: kick(a, 0.35)
boom(9.0, 0.35, 55); kemence(9.05, 64, 0.8, 0.06, None, vib=0.02)   # gülümseme → endişe

# ---------- 10–13.1: hızlı kesmeler ----------
theme(10.0, 13.1, A, full=True)
murmur(10.0, 13.1, 0.06)
slap(10.85, 0.3); boom(10.86, 0.25, 90)       # kasa konur
bell(11.25, 93, 0.04, 0.5)                     # terazi
for a in [11.8, 11.92, 12.04, 12.16]: coin(a, 0.12)
for a in [12.49, 12.84]: step_wood(a, 0.16)    # Nermin Teyze'nin ayağı

# ---------- 13.1–14.85: ağır çekim ----------
whoosh(13.25, 0.4, 0.2)
n = int(1.6 * SR); tw = tt(n); f = 1400 + 900 * np.sin(np.pi * tw / 1.6)    # havada ıslık (yükselir, iner)
add(sound.dry, 13.3, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.1, 0.1, 0.9, 0.3) * 0.035)
pad(13.1, [45, 52, 57], 1.8, 0.035, hi=700)
for a in [13.3, 14.0]: kick(a, 0.45)            # kalp atışı
slap(14.86, 0.45); clap(14.86, 0.3); boom(14.87, 0.3, 120)     # PAT!
for a, m in [(15.25, 67), (15.5, 66), (15.75, 64)]: pluck(a, m, 0.05)   # komik iniş
gull(15.6, 0.05)

# ---------- 16–21: yabancı ----------
murmur(16.0, 17.6, 0.03)
pad(16.0, [45, 52, 57, 58], 5.0, 0.035, hi=900)
prev = None
for a, m, d in [(16.6, 69, 0.9), (17.5, 70, 0.4), (17.9, 73, 0.8), (18.8, 74, 0.5), (19.3, 73, 0.5), (19.8, 70, 0.4), (20.2, 69, 0.8)]:
    ney(a, m, d, 0.1)
for a in [16.5, 18.1, 19.7]: bell(a, 88, 0.025, 2.0)
k = 17.65
while k < 19.0: step_wood(k, 0.08); k += 0.35
slap(19.32, 0.12)                             # çanta yere
k = 19.65
while k < 20.95: step_wood(k, 0.09); k += 0.35

# ---------- 21–26: tokalaşma ----------
scrape(21.2, 22.2, 0.09); slap(22.3, 0.2); boom(22.31, 0.2, 90)
pad(21.0, [48, 55, 60, 64], 2.4, 0.04); pad(23.4, [53, 57, 60, 65], 1.0, 0.03)
for i, m in enumerate([60, 64, 67, 72, 67, 64]): pluck(21.0 + i * 0.4, m, 0.05)
bell(22.6, 86, 0.03, 1.2)                      # Rıza şaşırır
clap(24.35, 0.1); bell(24.36, 84, 0.08, 2.4); bell(24.36, 88, 0.06, 2.4); boom(24.35, 0.35, 70)   # tokalaşma
pad(24.35, [41, 53, 57, 60, 65], 1.7, 0.05, vowel=True)
prev = None
for a, m, d in [(24.5, 72, 0.5), (25.0, 76, 0.5), (25.5, 79, 0.6)]:
    kemence(a, m, d, 0.1, prev, vib=0.016); prev = m
for a in [24.35, 24.85, 25.35, 25.85]: kick(a, 0.4)

# ---------- 26–30: birlikte ----------
pad(26.0, [43, 55, 59, 62, 67], 2.0, 0.05, vowel=True); pad(28.0, [45, 57, 61, 64, 69], 2.0, 0.055, vowel=True)
for a, m, d in [(26.0, 81, 0.75), (26.75, 79, 0.25), (27.0, 76, 0.5), (27.5, 79, 0.5), (28.0, 81, 0.5), (28.5, 84, 0.5), (29.0, 81, 0.9)]:
    kemence(a, m, d, 0.12, prev, vib=0.014); prev = m
a = 26.0
while a < 30.0:
    if int(round(a * 4)) % 4 == 0: kick(a, 0.5)
    if int(round(a * 4)) % 4 == 2: davul_rim(a, 0.18)
    hat(a, 0.045); pluck(a, [64, 67, 72, 76][int(round(a * 4)) % 4], 0.04); a += 0.25
murmur(26.0, 30.0, 0.035); gull(26.6, 0.06); coin(26.9, 0.08)
riser(28.4, 30.0, 0.24)

# ---------- 30: geçiş → horon ----------
boom(30.0, 1.0); braam(30.0, 33, 2.4, 0.55); bell(30.05, 93, 0.06, 2.0); whoosh(29.75, 0.35, 0.3, 4000)
theme(30.0, 39.4, A + A[:6])
murmur(33.4, 39.4, 0.05); blips(34.0, 39.0, 0.025)
theme(39.4, 46.4, B + A[:12], light=True)
click(40.95); click(43.25, 0.12); chime(43.3); coin(43.35, 0.12)       # personel → hamal → işe alındı
theme(46.4, 52.4, B + A, oct_from=46.4, full=True)
k = 46.6
while k < 52.2: step_wood(k, 0.05); k += 0.3
theme(52.4, 58.4, A, light=True)
for i in range(4): pop(53.15 + i * 0.6, 79 + i * 3, 0.06)
theme(58.4, 63.9, B[:22], light=True)
click(60.5, 0.06)
theme(63.9, 69.4, B + A, oct_from=63.9, full=True)
murmur(63.9, 69.4, 0.06)
for a in [65.2, 65.6, 66.4, 67.1, 67.9, 68.6]: coin(a, 0.09)

# ---------- 69.4–74: kapanış ----------
boom(69.4, 0.5, 60)
pad(69.4, [45, 52, 57, 61, 64, 69], 4.6, 0.05, hi=2000)
for i, m in enumerate([57, 61, 64, 69, 64, 61, 57, 61, 64]): pluck(69.5 + i * 0.45, m, 0.045)
kemence(69.9, 76, 1.0, 0.07, 74, vib=0.016); kemence(70.9, 73, 0.7, 0.07, 76, vib=0.016); kemence(71.6, 69, 2.2, 0.07, 73, vib=0.018)
for a in [70.3, 72.4]: gull(a, 0.05)

mix(sys.argv[1])
