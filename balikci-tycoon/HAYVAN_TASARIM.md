# Hayvanlar — deneme tasarımı (yalnız `deneme-emekci` dalı)

Kullanıcı kararları:
- **İki tür, daha fazla çeşit yok:** bekçilik için **köpek (Karabaş)**, sevimlilik için **kedi**. "Her tezgâh ve önü için" yeterli.
- **Edinme:** bağ kurarak. Koyda dolaşan kedi ya da köpeğe 3 gün üst üste mama koyarsan sana gelir. Satın alınan hayvan yok.
- **Bakım:** mama ve sevme. Günlük mama ücreti; hayvana dokununca kalp çıkar ve keyfi artar. Unutulursa ölmez; küser, bir süre kaybolur, mama koyunca döner.
- **Evler:** kedi evi ve köpek kulübesi Dekor Düzenleme Modu ile istenen yere konur; hayvan gece orada uyur. Bunun için `dekor-duzenle` dalı bu dala birleştirilmiş olmalı.

## Yerleşim: tezgâh başına
- **Kural:** her tezgâhın önü için en çok **bir kedi ve bir köpek**. Hayvan bir tezgâha **atanır**. Gündüz o tezgâhın önünde durur ya da yakınında dolaşır; gece evine gider.
- Kalabalık olmasın diye başlangıçta yalnız 1 kedi ve 1 köpek edinilebilir. Her yeni bölge açılışı bir hayvan hakkı daha verir (bölge başına 1 kedi + 1 köpek).

## Etkiler (yalnız o tezgâhta)
- **Kedi:** atandığı tezgâhın kuyruğundaki müşterilerin sabrı **+%15** (müşteriler kediyi sever, ara sıra kalp emojisi). Popülerlik: o tezgâha gelen müşteri sıklığı **+%5**. Komik an: arada bir tezgâhtan bir hamsi çalıp kaçar ("Pamuk yine hamsi çaldı!"); kayıp çok küçük ve görsel.
- **Köpek (Karabaş):** atandığı tezgâhta **martıların balık çalmasını** önler. Martı olayı yoksa basit bir kurala bağla: köpeksiz tezgâhtan ara sıra (`%3`/dk) bir fileto martıya gider; köpekliden gitmez. Haşmet Bey gelince ona havlar; Haşmet sıçrar ve yeni replik söyler (TR/EN, 3 replik): "Bu köpek vergiden muaf mı?!", "Bağla şunu, bağla!", "Hav hav mı? Defterde hav hav diye kalem yok!". Popülerlik: o tezgâha +%3.
- **Tavan:** hayvanlardan gelen toplam popülerlik en çok +%10.

## Bağ kurma akışı
1. 2. günden sonra koyda bir **sokak kedisi**, 4. günden sonra bir **sokak köpeği** dolaşmaya başlar (mevcut koy kedilerinden biri kullanılabilir).
2. Hayvanın yanına gidince "MAMA KOY (15$)" düğmesi çıkar.
3. 3 farklı gün mama koyunca hayvan sahiplenilir. Kart çıkar: "Pamuk artık senin! Bir tezgâha ata, evini yerleştir." İsim, varsayılan bir listeden verilir (kedi: Pamuk, Duman, Tarçın; köpek: Karabaş, Paşa, Çomar), değiştirilebilir.
4. Ev (kedi evi ya da kulübe) ücretsiz olarak Süs Sandığı'na gelir.

## Bakım
- **Mama:** günlük ücret (kedi 8$, köpek 12$), günün sonunda kasadan düşer. Para yetmezse mama verilmez.
- **Keyif** (0–100): sevince +10 (günde en çok 3 kez), mama yemezse günde −40. Keyif ≥ 60 ise etki tam, 30–60 arası yarım. 30'un altında hayvan **küser**: tezgâhtan ayrılıp koyda dolaşır, etkisi yok. Mama yiyince geri döner.
- Hayvan asla ölmez ya da kalıcı olarak kaybolmaz.

## Arayüz
- YÜKSELT › Personel'de **HAYVANLAR** bölümü: her hayvanın adı, keyif çubuğu, atandığı tezgâh, "TEZGÂHA ATA" ve "SEV" düğmeleri.
- Hayvana dünyada dokununca sever (kalp emojisi, kısa ses).
- Müşteri Defteri'ne ya da albüme "Hayvanlarım" sayfası (isteğe bağlı, sonra).

## Çizim
- Kedi: oyunda kedi zaten var (tekir, siyah). Sahipli kedide boynunda kırmızı tasma.
- Köpek: yeni. Karabaş, siyah-kahve, kulakları düşük; oturma, yürüme, havlama ve uyuma pozları.
- Kedi evi ve kulübe: süs olarak (`DECOR`, `gift`/`pet` türü), düzenleme moduyla yerleşir.
- Klasik çizim `game.js`'te; ince mod için `HKA.drawPet` / `HKA.drawPetHouse` kancaları. İnce çizimi sanatçı yapacak.

## Testler (`test-hayvan.js`)
1. Sokak kedisine 3 farklı günde mama → sahiplenme. Ev Süs Sandığı'na gelir.
2. Tezgâha atama: kedi o tezgâhta sabrı artırır (müşteri sabrı ölçülür).
3. Köpek: Haşmet geldiğinde havlama repliği çıkar; köpeksiz tezgâhta martı kaybı olur, köpeklide olmaz.
4. Mama ve keyif: mama verilmezse küser, verilince döner.
5. Kayıt ve yükleme (hayvanlar, keyif, atama, ev konumu).
6. Tezgâh başına en çok 1 kedi ve 1 köpek kuralı.
