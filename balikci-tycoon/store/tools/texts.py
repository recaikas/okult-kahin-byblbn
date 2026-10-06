"""Mağaza metinleri: tek kaynaktan App Store ve Google Play dosyalarını üretir, karakter sınırlarını denetler.
   python3 tools/texts.py   → text/appstore.md, text/googleplay.md, text/social.md"""
import os, sys
ROOT = os.path.join(os.path.dirname(__file__), '..')
PRIVACY = 'https://recaikas.github.io/okult-kahin-byblbn/privacy.html'
SITE = 'https://recaikas.github.io/okult-kahin-byblbn/'
ABOUT = 'https://recaikas.github.io/okult-kahin-byblbn/about.html'

DESC = {
'tr': """Hamsi Koyu, Karadeniz kıyısında küçücük bir iskeleyle başlayan sıcak, piksel sanatlı bir balıkçı tycoon oyunu. Ağını at, balığını kes, tezgâhını aç ve koyunu adım adım büyük bir limana çevir.

NASIL OYNANIR
• Ağın yanında bekle, balık birikir. Sırtla, kesim masasına götür.
• Filetoyu tezgâha koy, sıradaki müşterinin siparişini tamamla, kasayı topla.
• Kazandığınla yeni bölgeler aç, ağlarını yükselt, personel al.
• Hamal, filetocu, tezgâhtar ve tahsildar tamamsa müdür ata: bölge kendi kendine çalışsın.

KOYDA SENİ NELER BEKLİYOR
• 4 bölge: Balıkçı İskelesi, Balık Pazarı, Fümehane ve Balıkçı Mutfağı.
• 6 balık ve mutfakta pişen Reis Güveci. Hamsi, uskumru, levrek, palamut, somon, orkinos.
• 69 tuhaf özel müşteri: her biri önce kendini tanıtır, adını ancak siparişini bitirince öğrenirsin. Fırtına kaptanı yarının havasını söyler, horon ekibi gelince müzik değişir, gizli müfettiş gün sonunda raporunu bırakır.
• Müşteri Defteri: koya gelen herkesi topla. Görmediklerin gölge, adını söylemeyenler ?????.
• Dipteki Söz: 12 günlük, oyunun içinde yaşanan bir Anadolu efsanesi. Koyun sakinleri tezgâhına gelir, ara sahneler açılır, bir söz verirsin.
• Tezgâh paneli: her tezgâhın geliri, gideri ve net kârı, düne göre artışı ve azalışı.
• Depo, Balık Hali, Personel Kulübesi, süsler, yol çiçeklikleri ve reklam panoları.
• Ticaret Ofisi: hisse al-sat, şirket kontratlarını tamamla, holdingini kur.
• Pazar günleri, yoğun saatler, balık sürüsü, gemi ve fırtına olayları.
• 10 özgün müzik parçası: türkü, horon, zeybek, tango, arabesk ve daha fazlası. Müzik, efekt ve ortam sesi ayrı ayrı ayarlanır.
• Başarımlar, bölüm hedefi ve çevrimiçi skor tablosu.

ADİL OYUN
• Reklam yok. Uygulama içi satın alma yok.
• Hesap gerekmez. Oyun kaydın cihazında tutulur (3 kayıt yuvası, otomatik kayıt).
• Türkçe ve İngilizce.
• İlk kez açtığın her sekme ne işe yaradığını kendisi anlatır.

Hamsi Koyu bağımsız bir geliştirici tarafından sevgiyle yapıldı. Görüşlerini oyunun içindeki görüş formundan gönderebilirsin; her biri okunuyor.""",
'en': """Hamsi Koyu is a cozy pixel-art fishing tycoon that begins with a tiny pier on the Black Sea coast. Cast your net, fillet your catch, open your stall and grow your cove, step by step, into a grand harbor.

HOW TO PLAY
• Stand by your net and the fish pile up. Carry them to the cutting table.
• Put fillets on the stall, complete each customer's order, collect the cash.
• Spend your earnings to open new zones, upgrade nets and hire staff.
• With a porter, filleter, stall-keeper and cashier in place, appoint a manager and the zone runs itself.

WHAT AWAITS YOU IN THE COVE
• 4 zones: Fishing Pier, Fish Market, Smokehouse and Fisherman's Kitchen.
• 6 kinds of fish plus Skipper's Stew from the kitchen: anchovy, mackerel, sea bass, bonito, salmon and tuna.
• 69 quirky special customers. Each one introduces themselves, but you only learn their name once you finish their order. The storm captain predicts tomorrow's weather, the horon troupe changes the music, and a secret inspector leaves a report at day's end.
• The Customer Book: collect everyone who visits. Unseen ones are shadows, unnamed ones are ?????.
• The Promise Below: a 12-day Anatolian legend told inside the game. The cove's residents come to your stall, cutscenes unfold, and you make a promise.
• Stall panel: income, expenses and net profit for every stall, up or down versus yesterday.
• Depot, Fish Hall, Staff Lodge, decorations, roadside planters and billboards.
• Trade Office: trade shares, fulfil company contracts and build your holding.
• Market days, rush hours, fish shoals, cargo ships and storms.
• 10 original music tracks: folk, horon, zeybek, tango, arabesque and more. Music, effects and ambience have separate volume sliders.
• Achievements, a chapter goal and an online leaderboard.

PLAYS FAIR
• No ads. No in-app purchases.
• No account needed. Your progress is saved on your device (3 save slots, autosave).
• English and Turkish.
• Every tab explains itself the first time you open it.

Hamsi Koyu is made with love by an independent developer. Send your thoughts with the in-game feedback form; every message is read."""
}

AS = {
  'tr': dict(name='Hamsi Koyu: Balıkçı Tycoon', subtitle='Piksel liman ve balık pazarı',
    promo='Ağı at, balığı kes, tezgâhı aç! 69 tuhaf müşteri ve 12 günlük Dipteki Söz efsanesiyle küçük iskeleni büyük bir limana çevir. Reklam yok, satın alma yok.',
    keywords='balık,balıkçı,tycoon,işletme,simülasyon,idle,piksel,liman,pazar,karadeniz,hamsi,restoran,tezgah',
    whatsnew='İlk sürüm. Koya hoş geldin! Görüşlerini oyun içindeki görüş formundan gönderebilirsin.'),
  'en': dict(name='Hamsi Koyu: Fishing Tycoon', subtitle='Pixel harbor & fish market',
    promo='Cast your net, fillet your catch, open your stall! Grow a tiny pier into a grand harbor with 69 quirky customers and a 12-day legend. No ads, no purchases.',
    keywords='fishing,fish,tycoon,idle,simulator,business,pixel,harbor,market,cozy,manager,shop,restaurant',
    whatsnew='First release. Welcome to the cove! Send us your thoughts with the in-game feedback form.')
}
GP = {
  'tr': dict(title='Hamsi Koyu: Balıkçı Tycoon', short='Balığı tut, kes, sat! Küçük iskeleni büyük bir limana çeviren piksel tycoon.',
    notes='İlk sürüm. Koya hoş geldin! Görüşlerini oyun içindeki görüş formundan gönderebilirsin.'),
  'en': dict(title='Hamsi Koyu: Fishing Tycoon', short='Catch, fillet, sell! Turn a tiny pier into a grand harbor in this pixel tycoon.',
    notes='First release. Welcome to the cove! Send us your thoughts with the in-game feedback form.')
}
LIM_AS = dict(name=30, subtitle=30, promo=170, keywords=100, whatsnew=4000)
LIM_GP = dict(title=30, short=80, notes=500)
err = []
for L in ('tr', 'en'):
    for k, n in LIM_AS.items():
        if len(AS[L][k]) > n: err.append('AppStore %s %s %d>%d' % (L, k, len(AS[L][k]), n))
    for k, n in LIM_GP.items():
        if len(GP[L][k]) > n: err.append('Play %s %s %d>%d' % (L, k, len(GP[L][k]), n))
    if len(DESC[L]) > 4000: err.append('desc %s %d' % (L, len(DESC[L])))
    if ' ' in AS[L]['keywords']: err.append('keywords space ' + L)
if err: print('\n'.join(err)); sys.exit(1)

def block(label, txt, lim):
    return '### %s  (%d / %d)\n\n```\n%s\n```\n\n' % (label, len(txt), lim, txt)

LN = {'tr': 'Türkçe (tr)', 'en': 'English (en-US / en-GB)'}
a = ['# App Store Connect — mağaza metinleri\n\nHer alanın yanında karakter sayısı / sınır var. Kopyala-yapıştır için kod blokları.\n\n',
     '## Ortak ayarlar\n\n| Alan | Değer |\n|---|---|\n',
     '| Birincil kategori | Oyunlar › Simülasyon (Games › Simulation) |\n| İkincil kategori | Oyunlar › Gündelik (Games › Casual) |\n',
     '| Yaş derecelendirmesi | 4+ (şiddet, korku, kumar, cinsellik yok; bütün sorulara "Yok/None") |\n',
     '| Fiyat | Ücretsiz · Uygulama içi satın alma yok |\n', '| Gizlilik politikası URL | %s |\n' % PRIVACY,
     '| Destek URL | %s |\n| Pazarlama URL | %s |\n' % (ABOUT, SITE),
     '| Telif hakkı | 2026 recaikas |\n| Cihaz | Yalnız iPhone (iPad desteği kapalı: TARGETED_DEVICE_FAMILY = 1) |\n\n',
     '## Uygulama gizliliği (App Privacy) — privacy.html ile aynı\n\n',
     '- **Takip (tracking): Hayır.** Veri reklam ya da üçüncü taraflarla paylaşım için kullanılmıyor.\n',
     '- Toplanan veriler (hepsi "kimliğinizle bağlantılı değil", amaç: Uygulama işlevi + Analiz):\n',
     '  - **Kullanıcı İçeriği › Oyun içeriği / Diğer kullanıcı içeriği:** işletme adı, karakter adı, oyun istatistikleri (skor tablosu); görüş formu metni.\n',
     '  - **Tanımlayıcılar › Kullanıcı kimliği:** rastgele üretilmiş anonim oyuncu kimliği.\n',
     '  - **Kullanım verileri › Ürün etkileşimi:** oyun içi ilerleme adımları (eğitim, gün, açılan bölge).\n\n']
for L in ('tr', 'en'):
    d = AS[L]; a.append('## %s\n\n' % LN[L])
    a.append(block('Uygulama adı / App Name', d['name'], 30)); a.append(block('Alt başlık / Subtitle', d['subtitle'], 30))
    a.append(block('Tanıtım metni / Promotional Text', d['promo'], 170)); a.append(block('Anahtar kelimeler / Keywords (virgülle, boşluksuz)', d['keywords'], 100))
    a.append(block('Açıklama / Description', DESC[L], 4000)); a.append(block('Bu sürümdeki yenilikler / What\'s New', d['whatsnew'], 4000))
open(os.path.join(ROOT, 'text', 'appstore.md'), 'w', encoding='utf8').write(''.join(a))

g = ['# Google Play Console — mağaza metinleri\n\n',
     '## Ortak ayarlar\n\n| Alan | Değer |\n|---|---|\n', '| Uygulama/oyun | Oyun |\n| Kategori | Simülasyon |\n',
     '| Etiketler | Tycoon, Simülasyon, Gündelik, Tek oyunculu, Çevrimdışı oynanabilir, Piksel |\n',
     '| Ücretli/ücretsiz | Ücretsiz · Reklam içermez · Uygulama içi ürün yok |\n',
     '| İçerik derecelendirmesi (IARC) | Şiddet, korku, kumar, cinsellik, uyuşturucu yok; kullanıcılar birbiriyle mesajlaşamaz, yalnız skor tablosunda ad görünür → beklenen PEGI 3 / Herkes |\n',
     '| Hedef kitle | 13 yaş ve üzeri önerilir (skor tablosunda herkese açık ad görünür) |\n',
     '| Gizlilik politikası | %s |\n| Web sitesi | %s |\n\n' % (PRIVACY, SITE),
     '## Veri güvenliği (Data safety) — privacy.html ile aynı\n\n',
     '- Veri toplanıyor: **Evet**. Üçüncü taraflarla paylaşılıyor: **Hayır**. Aktarımda şifreleme: **Evet (HTTPS)**. Silme isteği: **Evet (e-posta ile)**.\n',
     '- **Uygulama etkinliği › Uygulama içi işlemler:** ilerleme adımları — Analiz, isteğe bağlı değil.\n',
     '- **Uygulama etkinliği › Kullanıcı tarafından oluşturulan diğer içerik:** işletme/karakter adı (skor tablosu), görüş metni — Uygulama işlevi.\n',
     '- **Cihaz veya diğer kimlikler:** rastgele anonim oyuncu kimliği — Uygulama işlevi, Analiz.\n',
     '- Konum, kişisel bilgi (ad, e-posta), finans, sağlık, fotoğraf, rehber: **toplanmıyor**.\n\n']
for L in ('tr', 'en'):
    d = GP[L]; g.append('## %s\n\n' % LN[L])
    g.append(block('Uygulama adı / App name', d['title'], 30)); g.append(block('Kısa açıklama / Short description', d['short'], 80))
    g.append(block('Tam açıklama / Full description', DESC[L], 4000)); g.append(block('Sürüm notları / Release notes', d['notes'], 500))
open(os.path.join(ROOT, 'text', 'googleplay.md'), 'w', encoding='utf8').write(''.join(g))

s = ['# Paylaşım metinleri (sosyal medya, mesaj)\n\n',
     '## Türkçe — kısa\n\n```\n🐟 Hamsi Koyu çıktı! Küçük bir iskeleden büyük bir limana: balığı tut, kes, sat. 69 tuhaf müşteri, 12 günlük bir Anadolu efsanesi. Reklam yok, satın alma yok.\n▶ ' + SITE + '\n```\n\n',
     '## Türkçe — test daveti\n\n```\nSelam! Yaptığım piksel balıkçı oyunu Hamsi Koyu\'nu denemeni isterim. Hiçbir açıklama okumadan oyna, ilk 10 dakikada nereye takıldığını bana yaz. Oyunun içindeki görüş formu da var (☰ menü).\n▶ ' + SITE + '\nSorularım: 1) İlk 5 dakikada ne yapacağını anladın mı? 2) Nerede sıkıldın? 3) Hangi müşteri aklında kaldı? 4) Telefonun ne, ekran düzgün müydü? 5) Tekrar açar mısın?\n```\n\n',
     '## English — short\n\n```\n🐟 Hamsi Koyu is out! From a tiny pier to a grand harbor: catch, fillet, sell. 69 quirky customers and a 12-day Anatolian legend. No ads, no purchases.\n▶ ' + SITE + '\n```\n\n',
     '## English — tester invite\n\n```\nHi! I made a pixel-art fishing tycoon called Hamsi Koyu and I\'d love you to try it. Play without reading anything first, then tell me where you got stuck in the first 10 minutes. There\'s also an in-game feedback form (☰ menu).\n▶ ' + SITE + '\nQuestions: 1) Did you understand what to do in the first 5 minutes? 2) Where did you get bored? 3) Which customer stuck with you? 4) What phone did you use, did the screen look right? 5) Would you open it again?\n```\n\n',
     '## Etiketler / Hashtags\n\n```\n#HamsiKoyu #pixelart #indiegame #tycoon #cozygame #oyun #bağımsızoyun #karadeniz\n```\n']
open(os.path.join(ROOT, 'text', 'social.md'), 'w', encoding='utf8').write(''.join(s))
for L in ('tr', 'en'):
    print(L, {k: len(v) for k, v in AS[L].items() if k != 'whatsnew'}, {k: len(v) for k, v in GP[L].items()}, 'desc', len(DESC[L]))
