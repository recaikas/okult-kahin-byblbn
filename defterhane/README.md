# Defterhane

Hafızası olan, yapay zekâ destekli tarihî rol yapma motoru. `kaynaklar/DEFTERHANE_yapim_sartnamesi.pdf` şartnamesine göre yapıldı.

**Anlatıcı yalnız anlatır.** Zar, kayıt ve kurallar motordadır:

- **Zarı motor atar.** d20 tarayıcıda `Math.random` ile atılır. Anlatıcı başka bir sayı yazarsa hâmişte motorun sayısı esas alınır.
- **Hafıza dört ayrı kayıttır:** KAİDE (anlatıcı nasıl davranacak), SÖZLÜK (dönemin dili), DURUM (şu an ne var), KANON (ne oldu). Anlatıcı durumu yazamaz. Cevabının sonunda `<<<DURUM>>>` bloğuyla değişiklik önerir, motor bunu denetleyip uygular.
- **Oyuncunun her düzeltmesi kalıcı bir kurala dönüşür.** "Bu yanlıştı" → kural önerisi → oyuncu onayı → kaide. Onay olmadan kaideye hiçbir şey girmez.

## Çalıştırma

Derleme adımı yok. `index.html` dosyasını tarayıcıda açmak yeterli (GitHub Pages'te de çalışır).

Anlatıcıya erişim için **Ayar** çekmecesinde üç seçenek var:

| Seçenek | Açıklama |
|---|---|
| Otomatik | Ortam bir model yolu sunuyorsa (`window.claude.complete`) onu kullanır. Yoksa kayıtlı API anahtarını kullanır. |
| Anthropic API | API anahtarını Ayar'a girersin. İstek tarayıcıdan doğrudan ve akış hâlinde gider. Anahtar dosyaya ya da dışa aktarıma yazılmaz, yalnız o tarayıcının yerel deposunda durur. |
| Sınama anlatıcısı | Ağ kullanmayan sahte bir anlatıcı. Motoru ve arayüzü denemek içindir. |

Derinlik ayarı (hızlı / normal / derin) model seçimini belirler. Model adları Ayar'dan değiştirilebilir.

## Neler var

- **Tur döngüsü (§4):** hamle kanona yazılır → zar → bağlam kurulur → tek istek (cevap akış hâlinde ekrana gelir) → blok ayrıştırılır → hakem denetimi → kalıcı depo → panel ve hâmiş tazelenir.
- **Bağlam (§5):** her turda 9 başlık bu sırayla kurulur: ÇERÇEVE, KAİDE, SÖZLÜK, DURUM, GEÇMİŞ, İLGİLİ SAHNELER, SON SAHNELER, ZAR, HAMLE. İstem 60.000 karakteri geçerse şartnamedeki sırayla kısaltılır. Kaide ve sözlük hiçbir zaman kısaltılmaz. Her turun istemi tarayıcı konsoluna yazılır.
- **Hakem (§7):**
  - Tek turda ±15'ten fazla itibar değişimi kırpılır ve hâmişe not düşülür.
  - Ölüler defterindeki biri adamlara eklenemez.
  - Kese sıfırın altına inmez.
  - Şemada olmayan alan sessizce yok sayılır.
  - Kaybı sahnede açıkça yazılmayan zimmet silinmez.
  - Sözlükteki yasak kelimeler hâmişte işaretlenir.
- **Hafıza (§9):** emanet, açık meseleler, ölüler ve zimmet her turda isteme girer. Hamlede adı geçen kişi ve yerler, eski sahnelerin etiketleriyle eşleştirilir ve en fazla 3 eski sahne geri çağrılır.
- **Arayüz (§11):**
  - Geniş ekranda iki sütun, dar ekranda sağdan açılan Durum çekmecesi.
  - Her sahnenin solunda bir hâmiş: tarih, zar ve o turda değişenler. Artılar ve eksiler ayrı renkte.
  - Yıkıcı işlemler iki basış ister.
  - "Son turu sil" durumu tur öncesine geri yükler: itibar, kese, yara, hepsi eski hâline döner.
- **Kampanyalar:** varsayılan kampanya *Balaban Vekâyinâmesi*. Tohum durumu, 13 kayıtlık kanon özeti, 22 kaide ve sözlük bu vekâyinâmeden alındı. Oyun promptundaki dört senaryo (1911, 1935, 1444, 1836–1915) devlet ölçeğinde açılabilir. Oyuncu kendi senaryosunu da yazabilir.
- **Kayıt:** oyun tarayıcının yerel deposunda (localStorage) saklanır ve bu, oyuncuya bildirilir. **Dışa aktar** vekâyinâmeyi Markdown olarak indirir. **Ayar → Yedek al / Yedek yükle** oyunun tamamını JSON olarak alıp geri yükler.

## Sınama

```bash
NODE_PATH="$(npm root -g)" node defterhane/sinama/kabul.js
```

Bu betik şartnamenin §13'teki 10 kabul ölçütünü ve bazı ek hakem denetimlerini, sınama anlatıcısıyla gerçek bir Chromium'da çalıştırır. Global `playwright` paketi gerekir.

Sınama anlatıcısı hamledeki şu komutları tanır:

| Komut | Etkisi |
|---|---|
| `#ölü` | Ölmüş birini adamlara eklemeyi dener |
| `#itibar` | +40 itibar önerir |
| `#zimmet` | Kaybı yazmadan zimmet siler |
| `#bozuk` | Bozuk blok döndürür |
| `#zarhile` | Başka bir zar yazar |
| `#yasak` | Metne yasak bir kelime koyar |

`sinama/girdiler.json`, kalite ölçümü için 20 sınama girdisi içerir. Kaide her büyüdüğünde bu girdiler yeniden oynatılır ve üç şey sayılır: anakronizm sayısı, unutulan açık borç sayısı ve oyuncunun düzeltme ihtiyacı.

## Dosyalar

```
defterhane/
├── index.html          uygulamanın tamamı (tek dosya)
├── kaynaklar/          şartname, Balaban Vekâyinâmesi, oyun promptu
└── sinama/             kabul sınaması ve 20 kalite girdisi
```

## Bilinen sınırlar

- Tohum itibar puanları vekâyinâmede sayı olarak geçmiyor. Kara Mahmud (100) ve Kurtoğlu (96) şartnamedeki örnekten alındı, öbürleri vekâyinâmedeki ilişkilere göre tahmin edildi. Puanlar oyun içinde değişir. Başlangıç değerlerini değiştirmek için yedek JSON'u düzenleyip geri yükleyebilirsin.
- Ölüm denetimi isim anahtarıyla yapılır (`İsim — not` biçiminde `—` işaretinden önceki kısım). Aynı adı taşıyan iki kişi yaş ya da lakapla ayrılmalıdır. Örnek: ölü "Bekir" ile ölçücü "Bekir (40)".
- Şartname gereği embedding ya da vektör araması yok. Geri çağırma yalnız etiket eşleşmesiyle yapılır.
