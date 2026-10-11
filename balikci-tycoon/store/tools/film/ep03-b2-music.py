"""Gün 3 · Bölüm 2 · Her Yere Yetişemezsin — müzik ve ses (72 sn). ep03-b2-mudur.js'teki çekimlere oturur.
     0–2.2   soğuk açılış: "RIZA!" balonları, fırıl fırıl dönüş, donma, geri sarma
     2.2–7.5 herkes çağırır: balon pop'ları ve konuşma cıvıltısı, müzik telaşlanır; dönüş, baş dönmesi, söner
     7.5–12.5 sabahtan akşama: koşan adımlar, hızlı saat, uçuşan kâğıtlar, tam horon
     12.5–17.5 gece: fener çıtırtısı, kalem, esneme, uyuklama (horultu), Memo'nun adımları, fikir çanı
     17.5–22.5 sabah: martılar, Nevin Hanım'ın adımları, çay bardağı, kâğıtlar düzene girer (çan arpeji), umut
     22.5–30 müdür masası: düzenli, kendinden emin tema; çay yudumu; yükseliş ve 30'da geçiş
     30–67   mekanik: seri kartı, dokunuşlar, müdür çanı, yetenekler, yoğun saat, dört müdür
     67–72   kapanış: La majör
   Kullanım: python3 store/tools/film/ep03-b2-music.py store/video/gun3-b2-music.wav"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound import *
import sound

init(72)
sea_bed([0, 2.0, 2.3, 12.3, 12.7, 17.3, 17.7, 29.8, 30.2, 67.2, 67.6, 72],
        [0.15, 0.15, 0.7, 0.5, 0.25, 0.25, 0.8, 0.6, 0.18, 0.18, 0.8, 0.8])

# ---------- 0–2.2: soğuk açılış ----------
murmur(0.0, 1.0, 0.07); blips(0.0, 1.0, 0.04)
for a in [0.0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87]: hat(a, 0.06); whoosh(a, 0.1, 0.05, 3000)
for a in [0.1, 0.35, 0.6, 0.85]: pop(a, 84 + int(a * 8), 0.05)
n = int(0.5 * SR); tw = tt(n)
add(sound.dry, 1.0, np.sin(2 * np.pi * np.cumsum(220 * (1 - tw / 0.6)) / SR) * env(n, 0.005, 0.1, 0.9, 0.1) * 0.12)   # bant durması
boom(1.0, 0.45, 50); pad(1.0, [45, 52, 58], 1.2, 0.03, hi=600)
riser(1.65, 2.2, 0.22); whoosh(2.0, 0.25, 0.25, 5000)

# ---------- 2.2–7.5: herkes çağırır ----------
murmur(2.2, 7.5, 0.05)
for a, m in [(2.5, 81), (3.1, 83), (3.7, 86), (4.3, 88)]: pop(a, m, 0.07); blips(a + 0.05, a + 0.4, 0.04)
theme(2.2, 4.8, A[:10] + A[:10], light=True)
theme(4.8, 5.8, B[:8], full=True)
for a in [4.8, 4.95, 5.1, 5.25, 5.4, 5.55]: whoosh(a, 0.12, 0.08, 3500)
for i, a in enumerate([5.1, 5.35, 5.6, 5.85, 6.1]): bell(a, 93 + (i % 2) * 3, 0.025, 0.6)   # baş dönmesi yıldızları
for a, m in [(5.9, 69), (6.2, 67), (6.5, 65), (6.85, 64)]: pluck(a, m, 0.06)          # söner
pad(5.8, [45, 52, 57], 1.7, 0.03, hi=900)

# ---------- 7.5–12.5: sabahtan akşama ----------
theme(7.5, 12.5, A + B[:4], oct_from=7.5, full=True)
k = 7.55
while k < 12.45: step_wood(k, 0.07); k += 0.13
for k2 in range(20): tick(7.5 + k2 * 0.25, 0.04, k2 % 2 == 0)
for a in [7.9, 8.8, 9.7, 10.6, 11.5]: page(a, 0.08)
gull(8.2, 0.05); bell(10.0, 88, 0.04, 1.5)

# ---------- 12.5–17.5: gece ----------
crackle(12.5, 17.5, 0.02)
pad(12.5, [45, 52, 57, 60], 5.0, 0.035, hi=900)
k = 12.6
while k < 14.0: scratch(k, rng.uniform(0.12, 0.25), 0.04); k += rng.uniform(0.18, 0.3)
n = int(0.6 * SR); add(sound.dry, 14.15, fftfilt(noise(n), 300, 1200) * env(n, 0.15, 0.2, 0.6, 0.25) * 0.05)   # esneme
slap(15.05, 0.08)                                                     # baş deftere
for a in [15.6, 16.6]:                                               # horultu
    n = int(0.55 * SR); add(sound.dry, a, fftfilt(noise(n), 80, 400) * env(n, 0.2, 0.2, 0.5, 0.2) * 0.06)
prev = None
for a, m, d in [(13.0, 69, 1.0), (14.0, 67, 0.6), (14.6, 64, 1.2), (16.0, 62, 0.8)]: ney(a, m, d, 0.08)
k = 15.55
while k < 16.3: step_wood(k, 0.06); k += 0.33
bell(16.75, 91, 0.06, 1.6); bell(16.78, 96, 0.03, 1.2)               # fikir!
k = 17.1
while k < 17.5: step_wood(k, 0.06); k += 0.2

# ---------- 17.5–22.5: sabah, Nevin Hanım ----------
for a in [17.8, 19.4, 21.8]: gull(a, 0.06)
k = 17.55
while k < 19.1: step_wood(k, 0.07); k += 0.3
pad(17.5, [48, 55, 60, 64], 2.5, 0.04); pad(20.0, [53, 57, 60, 65], 2.5, 0.045)
for i, m in enumerate([60, 64, 67, 72, 67, 64, 65, 69, 72, 77, 72, 69]): pluck(17.6 + i * 0.4, m, 0.045)
clink(19.65, 0.13)
bell(20.0, 86, 0.04, 1.0)
for i in range(8): bell(20.5 + i * 0.15, 79 + [0, 4, 7, 12, 16, 19, 24, 28][i], 0.03, 0.8)   # kâğıtlar düzene girer
for a in [20.6, 21.0, 21.4]: page(a, 0.06)
prev = None
for a, m, d in [(20.4, 76, 0.5), (20.9, 79, 0.5), (21.4, 84, 1.0)]: kemence(a, m, d, 0.09, prev, vib=0.014); prev = m

# ---------- 22.5–30: müdür masası ----------
a, i = 22.5, 0
while a < 28.4:
    if i % 4 == 0: kick(a, 0.5)
    if i % 4 == 2: davul_rim(a, 0.16)
    hat(a, 0.04); pluck(a, [60, 64, 67, 72, 65, 69, 72, 77][i % 8], 0.045)
    a += 0.25; i += 1
pad(22.5, [48, 55, 60, 64], 3.0, 0.04); pad(25.5, [53, 57, 60, 65], 3.0, 0.04)
for a2, m, d in [(23.0, 76, 0.5), (23.5, 79, 0.5), (24.0, 81, 1.0), (25.0, 79, 0.5), (25.5, 76, 0.5), (26.0, 79, 1.0), (27.0, 84, 0.75), (27.75, 81, 0.25), (28.0, 84, 1.2)]:
    kemence(a2, m, d, 0.1, prev, vib=0.014); prev = m
clink(23.6, 0.08); clink(25.2, 0.08); murmur(22.5, 30.0, 0.035)
pad(28.0, [45, 57, 61, 64, 69], 2.0, 0.055, vowel=True)
riser(28.4, 30.0, 0.24)

# ---------- 30–67: mekanik ----------
boom(30.0, 1.0); braam(30.0, 33, 2.4, 0.55); bell(30.05, 93, 0.06, 2.0); whoosh(29.75, 0.35, 0.3, 4000)
theme(30.0, 38.4, A + A[:2])
murmur(33.4, 38.3, 0.03)
theme(38.4, 44.9, B + A[:4], light=True)
click(40.15); click(42.9); click(43.35, 0.12); chime(43.4); coin(43.45, 0.1)
theme(44.9, 50.4, B + A, oct_from=44.9)
theme(50.4, 56.4, A, light=True)
for i in range(6): pop(51.15 + i * 0.5, 79 + i * 2, 0.06)
theme(56.4, 62.4, B + A, oct_from=56.4, full=True)
chime(57.25, (81, 84), 0.05); murmur(56.4, 62.4, 0.06)
for a in [58.0, 58.4, 58.8, 59.2, 59.6]: coin(a, 0.1)
theme(62.4, 67.35, B + A[:4], oct_from=62.4, full=True)
pad(62.4, [57, 61, 64], 5.0, 0.04, hi=2200, vowel=True)
for i, m in enumerate([81, 84, 88, 93]): bell(62.8 + i * 0.5, m, 0.06, 2.0)

# ---------- 67–72: kapanış ----------
boom(67.4, 0.5, 60)
pad(67.4, [45, 52, 57, 61, 64, 69], 4.6, 0.05, hi=2000)
for i, m in enumerate([57, 61, 64, 69, 64, 61, 57, 61, 64]): pluck(67.5 + i * 0.45, m, 0.045)
kemence(67.9, 76, 1.0, 0.07, 74, vib=0.016); kemence(68.9, 73, 0.7, 0.07, 76, vib=0.016); kemence(69.6, 69, 2.2, 0.07, 73, vib=0.018)
for a in [68.3, 70.4]: gull(a, 0.05)

mix(sys.argv[1])
