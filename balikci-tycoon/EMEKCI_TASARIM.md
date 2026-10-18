# Emekçi Mod — deneme tasarımı (yalnız `deneme-emekci` dalı, canlıya girmez)

Kullanıcıyla birlikte konuşulup kararlaştırıldı. Amaç iki şey:
- Otomasyonun değerini artırmak.
- Oyunun başında oyuncunun elle daha çok iş yapması.

Bu dalda Emekçi Mod **varsayılan olarak açık** gelir. Ayarlar'dan kapatılabilir: "Emekçi Mod (deneme)". Kapalıyken oyun bugünkü gibi çalışır.

## 1. Temel kural: istasyon başında biri varken çalışır
Eylem **beklemek**tir, dokunmak değil. Oyuncu istasyonun etki alanında durur, iş kendiliğinden ilerler; dokunma gerekmez.

| İstasyon | Emekçi Mod'da | Başında kim varsa çalışır |
|---|---|---|
| **Ağ** | Ağ yine kendiliğinden dolar (`spot.stock`). Ama balıklar sırta bir anda geçmez: başında durunca **tek tek** geçer, her biri ~0,2 sn (`PULL_T`), sırta uçma animasyonuyla. | Oyuncu ya da **Balıkçı** (yeni rol). Balıkçı balıkları ağın yanındaki **sandığa** koyar (sandık sınırı 12). Oyuncu sandıktan da alabilir. |
| **Kesim masası** | Masa yalnız başında biri varken keser (`t.t` yalnız o zaman ilerler). | Oyuncu (masanın alanında duruyorsa) ya da **Filetocu**. Filetocu artık hızlandırıcı değil, asıl kesen; hızı 1,0. Oyuncu kesimi 1,0. "Keskin bıçak" yükseltmesi oyuncunun kesimini hızlandırır. |
| **Tezgâh** | Satış hızı: başında biri varsa %100. Yoksa **%35**: müşteri bekler, satış yavaş ilerler; müşteri sabrı satıcısız tezgâhta da normal hızın %60'ıyla azalır. | Oyuncu (tezgâhın önünde) ya da **Tezgâhtar** (yeni anlamı: tezgâhın arkasında satıcı). |
| **Kasa / tepsi** | Bugünkü gibi. | Oyuncu ya da Tahsildar. |

Taşıma:
- Ağ sandığından masaya ve hasırdan tezgâha taşımayı oyuncu ya da **Hamal** yapar.
- Hamal **"bittikçe yenile"** önceliğiyle çalışır:
  1. boşalmak üzere olan tezgâha (raf < %30) hasırdan fileto,
  2. boşta bekleyen masaya ağ sandığından balık,
  3. dolmak üzere olan ağ sandığını boşalt.
- Bölgede birden çok ağ varsa (ek ağlar) hepsine aynı hamal bakar.
- Satış hızının nasıl işlediği: mevcut `updateCounter`'da müşteriye servis nasıl ilerliyorsa ona bir çarpan uygulanır. Satıcı varsa 1, yoksa 0,35.

## 2. Roller (Emekçi Mod'da)
| Rol | Yeni görev | Fiyat | Maaş/dk | Not |
|---|---|---|---|---|
| **Balıkçı** (yeni, `balikci`) | Ağın başında durur, tek tek çeker, sandığa koyar | 300 | 10 | bölge rolü |
| **Filetocu** | Masanın başında keser | 420 | 15 | |
| **Tezgâhtar** | Tezgâhın arkasında satar (taşımaz) | 360 | 12 | ilk kiralanacak olan; en ucuzu |
| **Hamal** | "Bittikçe yenile" taşıyıcı (iki ayak) | 360 | 12 | |
| **Tahsildar** | Aynen | aynen | aynen | |

- Fiyat ve maaşlar yalnız Emekçi Mod'da geçerli (`emek()` ise).
- Bölge kadro sınırı: bölge seviyesi 1'de 4, 2'de 5. İkinci hamal ancak seviye 3'te.

**Usta seviyeleri (yük artışı, kalabalık değil):**
- Her personel Çırak (1) → Kalfa (2) → Usta (3) olabilir. Personel panelinde "USTALAŞTIR" düğmesi var.
- Bedel: Kalfa için kiralama fiyatının 1,5 katı, Usta için 3 katı.
- Etki: Kalfa hız ve kapasitede +%35, Usta +%75. Maaş: Kalfa +%20, Usta +%45.
- Kayıtta personel girdisine `lv` alanı eklenir; eski kayıtta yoksa 1 sayılır.

**Müdür:** Bölgede bir rol eksikse müdür o rolü geçici olarak doldurur (yarı hızla). Öncelik: tezgâhta satış > kesim > çekme.

## 3. Oyuncu yükseltmeleri (YÜKSELT › kendi gelişimin)
- **Keskin Bıçak** (3 seviye): oyuncunun kesim hızı +%40 / +%80 / +%120.
- **Sesli Satıcı** (3 seviye): oyuncu tezgâhtayken satış hızı +%25 / +%50 / +%75.
- **Hızlı Eller** (2 seviye): ağdan çekme süresi 0,2 → 0,14 → 0,1 sn.
- Taşıma sepeti ve hız yükseltmeleri mevcut hâliyle kalır.

## 4. Denge değişiklikleri (yalnız Emekçi Mod)
- İlk bölge ve yükseltme fiyatları ×0,75; başlangıç parası +%50. Oyuncu zamanını bölüştüğü için gelir düşer, bu yüzden.
- Kesim süreleri (`FISH.cut`) aynı kalır; zaten kısa (hamsi 0,42 sn).
- **"Sen yokken" kazancı:** yalnız başında personel olan istasyonların ürettiği hesaplanır. İstasyonun usta durumuna göre çarpan verilir. Mevcut çevrimdışı hesap fonksiyonunu bul (`retCard` / `away`) ve buna göre sınırla.
- **Haşmet vergisi:** ürün başı olduğu için kendiliğinden ölçeklenir; dokunma.
- **Bölüm 1 hedefleri:** hedef sayaçlarına dokunma. Denemenin amacı bu süreyi ölçmek.

## 5. Eski kayıtlar ve geçiş
- Bu dalda eski bir kayıt açılınca Emekçi Mod açıksa bir defalık bir kart gelir: **"Usta ekip hediyesi"**. Bölge başına, eksik olan Balıkçı ve Tezgâhtar ücretsiz kiralanır (kadro sınırı izin verdiği kadar). Kayıtta `S.emekGift = 1`.
- Mevcut Tezgâhtar'lar yeni anlamına geçer (satıcı). Taşıma işini Hamal yapar.
- Kayıtta yeni alanlar: `S.emek` (0/1, varsayılan 1), personel `lv`, ağ sandıkları `spot.box` (eski kayıtta boş).

## 6. Arayüz
- Başında kimse olmayan istasyonun üstünde küçük gri bir **"⏸ Bekliyor"** rozeti.
- Oyuncu başında çalışırken istasyonun üstünde ilerleme halkası ve küçük bir "çalışıyor" efekti: bıçak, ağ çekme.
- Eğitim: Emekçi Mod'da ilk adımların metni değişir. Örnekler: "Ağın başında dur, balıklar sırtına geçsin", "Masanın başında dur, kesilsin", "Tezgâhın önünde dur, sat". Hepsi TR/EN.
- Personel paneli: rollerin açıklamaları Emekçi Mod'a göre (TR/EN).

## 7. Testler
`test-emekci.js`:
1. Emekçi Mod'da ağın başında durunca balıklar tek tek sırta geçer; uzaklaşınca durur.
2. Masa, başında kimse yokken kesmez; oyuncu durunca keser; Filetocu varken keser.
3. Tezgâh satıcısızken yavaş (≈%35), Tezgâhtar ya da oyuncu varken tam hızla satar.
4. Hamal önceliği: boşalan tezgâha önce taşır.
5. Balıkçı ağ sandığını doldurur, sandık sınırı aşılmaz.
6. Usta seviyesi hız ve maaşı değiştirir, kaydedilip yüklenir.
7. Emekçi Mod kapatılınca eski davranış birebir aynı. Mevcut testler kapalı modda geçmeli: test-ince, test-world-render, test-fazD, test-borc, test-gazete, test-ipucu, test-trash. `test-offline.js` eski testlerde `HK_EMEK_OFF=1` koyar; `HK_GZ_OFF` örneğindeki gibi.
8. Eski kayıt + Emekçi Mod: "Usta ekip hediyesi" bir kez gelir.
9. Bir oyun botu Emekçi Mod'da 10 oyun dakikası oynar. Kaç dakikada ilk kiralama yapılabiliyor, raporla; hedef 3–5 dk.

## 8. Hayvanlar (aynı dalda, Emekçi Mod'dan sonra)
Ayrı belgede: `HAYVAN_TASARIM.md`.
