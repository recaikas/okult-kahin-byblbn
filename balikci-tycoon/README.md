# 🐟 Balıkçı Tycoon

Instagram reklamlarındaki buzul limanı balıkçı oyununun oynanabilir hâli.
Tek dosyalık HTML5 canvas oyunu — kurulum yok, bağımlılık yok.

## Oynamak için
`index.html` dosyasını tarayıcıda aç. (Telefon ve masaüstü destekli.)

Yerel sunucu istersen:
```bash
npx http-server -p 8080 .   # sonra http://localhost:8080
```

## Oynanış döngüsü
1. 🎣 **Ağın** yanında bekle → sandığa balık dolar.
2. 🧺 Sandığın üstünden geç → balıkları sırtla (kapasite kadar).
3. 🔪 **Kesim masasına** bırak → balıklar filetoya dönüşür, paspasta birikir.
4. 🍣 Filetoları **tezgâha** taşı → sarı montlu müşteriler yer ve öder.
5. 💵 Tepsideki parayı al → **KASA**'ya bırak, para hesabına geçer.
6. ⭐ Parlayan alanların üstünde bekle → satın alma otomatik ilerler.

## Yükseltmeler
| Alan | Etki |
|---|---|
| 🎒 KAPASİTE | Sırt çantası +2 (9 seviye) |
| 👟 HIZ | Koşu hızı +%11 (6 seviye) |
| 🔓 YENİ ALAN | Yeni iskele bölgesi: +ağ, +kesim masası, +tezgâh |
| 🎣 BALIKÇI ÇIRAK | Balığı ağdan masaya otomatik taşır |
| 🍽️ SERVİS ÇIRAK | Fileto→tezgâh ve para→kasa taşır |
| 💲 FİYAT | Fileto fiyatı +$4 |

## Kontroller
- **Masaüstü:** `W A S D` veya yön tuşları
- **Mobil:** ekrana bas & sürükle (sanal joystick)
- Sağ üst: 🔊 ses, ❓ yardım + kayıt sıfırlama

## Notlar
- İlerleme `localStorage`'a otomatik kaydedilir (6 saniyede bir).
- Müşteriler sabırsızdır: sabır çubuğu biterse 😠 çeker gider, para gider.
- Hata ayıklama için `window.BT` konsoldan erişilebilir (oyuncu, istasyonlar, durum).

## Dosyalar
- `index.html` — sayfa, HUD, menüler
- `game.js` — motor: izometrik çizim, oynanış, yapay zekâ (çıraklar/müşteriler), kayıt
