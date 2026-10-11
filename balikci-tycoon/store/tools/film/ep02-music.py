"""Gün 2 · Müdürler — müzik ve ses (59 sn). ep02-mudurler.js'teki çekimlere oturur.
     0–5.5   gece ofisi: saat tıkırtısı (sarkaçla aynı), lamba fitili, kalem; pad + saz + kemençe (hüzünlü)
     5.5–10  defter: kalem cızırtısı, sayfa; kemençe ikinci cümle
     10–15   şafakta iskele: adımlar, martılar, uğultu; Do majöre açılır (umut)
     15–19   masa: levha kayar, çay bardağı tıklar, sandalye gıcırdar, gülümseme çanı; yükseliş
     19      seri kartı vuruşu → horon (mekanik bölümü)
     27.5–33.5 arayüz: dokunuşlar, işe alım çanı, sikke
     38.5–44 yetenekler: her satıra bir "pop"
     44–50   yoğun saat: tema tam kadro, uğultu, kasa boşaltma sikkeleri
     50–54   dört müdür: dört çan
     54–59   kapanış: boş ofis, saat, lamba; La majöre çözülür
   Kullanım: python3 store/tools/film/ep02-music.py store/video/ep02-music.wav"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sound import *

init(59)
sea_bed([0, 5.4, 5.6, 9.9, 10.2, 14.8, 15.2, 18.8, 19.2, 53.8, 54.2, 59], [.08, .08, .03, .03, .8, .8, .45, .45, .18, .18, .08, .08])

# ---------- 0–5.5: gece ofisi ----------
for k in range(6): tick(float(k), 0.05, k % 2 == 0)
crackle(0.0, 5.4)
for a in [1.2, 2.3, 3.1, 4.0, 4.7]: scratch(a, 0.25, 0.025)
pad(0.3, [45, 52, 57, 60], 5.6, 0.03, hi=1000)
for i, m in enumerate([57, 60, 64, 69, 64, 60] * 3):
    if 0.6 + i * 0.5 < 10: pluck(0.6 + i * 0.5, m, 0.045)
mel1 = [(2.0, 76, 1.0), (3.0, 74, 0.5), (3.5, 72, 0.5), (4.0, 71, 1.0), (5.0, 69, 1.4)]
prev = None
for a, m, d in mel1: kemence(a, m, d, 0.085, prev, vib=0.016); prev = m

# ---------- 5.5–10: defter ----------
page(5.55, 0.12)
k = 5.8
while k < 9.8: scratch(k, rng.uniform(0.12, 0.3), 0.04); k += rng.uniform(0.18, 0.4)
pad(5.5, [41, 53, 57, 60], 4.6, 0.03, hi=1000)
mel2 = [(6.5, 72, 0.5), (7.0, 74, 0.5), (7.5, 76, 1.0), (8.5, 74, 0.5), (9.0, 72, 1.0)]
for a, m, d in mel2: kemence(a, m, d, 0.085, prev, vib=0.016); prev = m

# ---------- 10–15: şafakta iskele ----------
pad(10.0, [48, 55, 60, 64], 2.6, 0.04); pad(12.5, [43, 55, 59, 62], 2.6, 0.04)
for i, m in enumerate([60, 64, 67, 72, 67, 64] * 2):
    pluck(10.0 + i * 0.42, m, 0.05)
mel3 = [(10.6, 79, 0.8), (11.4, 77, 0.4), (11.8, 76, 0.4), (12.2, 74, 0.9), (13.2, 76, 0.4), (13.6, 79, 0.4), (14.0, 81, 1.0)]
for a, m, d in mel3: kemence(a, m, d, 0.09, prev, vib=0.016); prev = m
k = 10.25
while k < 14.9: step_wood(k, 0.08); k += 0.507
for a in [10.6, 12.8, 14.1]: gull(a, 0.05)
murmur(10.0, 15.0, 0.035)

# ---------- 15–19: masa ----------
pad(15.0, [45, 52, 57, 61, 64], 4.0, 0.035, hi=1600)
scrape(15.4, 16.1, 0.08); clink(16.82, 0.13); creak(16.9, 0.7, 0.05)
bell(18.2, 88, 0.05, 2.0)
kemence(15.3, 76, 0.8, 0.07, prev, vib=0.016); kemence(16.2, 73, 0.6, 0.07, 76, vib=0.016); kemence(16.9, 76, 1.4, 0.07, 73, vib=0.018)
riser(17.4, 19.0, 0.22)

# ---------- 19: seri kartı → horon ----------
boom(19.0, 1.0); braam(19.0, 33, 2.6, 0.6); bell(19.05, 93, 0.06, 2.0)
theme(19.0, 27.5, A + A[:2])
theme(27.5, 38.5, B + A, oct_from=33.5)
murmur(22.5, 27.4, 0.03)
# arayüz
click(29.25); click(32.0); click(32.45, 0.12); chime(32.5); coin(32.55, 0.1)
# yetenekler
for i in range(6): pop(39.15 + i * 0.5, 79 + i * 2, 0.06)
theme(38.5, 44.0, A[:22], light=True)
# yoğun saat
theme(44.0, 50.0, B + A, oct_from=44.0, full=True)
chime(44.85, (81, 84), 0.05); murmur(44.0, 50.0, 0.06)
for a in [45.6, 46.0, 46.4, 46.8, 47.2]: coin(a, 0.1)
# dört müdür
theme(50.0, 53.95, B, oct_from=50.0, full=True)
pad(50.0, [57, 61, 64], 4.0, 0.04, hi=2200, vowel=True)
for i, m in enumerate([81, 84, 88, 93]): bell(50.4 + i * 0.5, m, 0.06, 2.0)

# ---------- 54–59: kapanış ----------
boom(54.0, 0.5, 60)
pad(54.0, [45, 52, 57, 61, 64, 69], 5.0, 0.05, hi=2000)
for k in range(5): tick(55.0 + k, 0.045, k % 2 == 0)
crackle(54.0, 59.0)
kemence(54.6, 76, 1.2, 0.07, 74, vib=0.016); kemence(55.8, 73, 0.8, 0.07, 76, vib=0.016); kemence(56.6, 69, 2.2, 0.07, 73, vib=0.018)

mix(sys.argv[1])
