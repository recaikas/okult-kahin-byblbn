/* =========================================================
   BALIKÇI TYCOON  v0.3  —  pixel art / Türkiye limanı
   GDD v0.3: Liman Genişleme + Yatırım (AREA, bölge seviyesi,
   yapı noktaları, büyük proje, kozmetik) + TR/EN
   ========================================================= */
(function () {
'use strict';

/* ---------------- matematik ---------------- */
var TAU = Math.PI * 2;
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function irnd(a, b) { return Math.floor(rnd(a, b + 1)); }
function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function R(v) { return Math.round(v); }

/* ---------------- dil ---------------- */
var lang = 'tr';
var STR = {
  tr: {
    money: 'PARA', carry: 'TAŞIMA', rep: 'İTİBAR', goal: 'HEDEF', menu: 'LİMAN',
    play: 'OYNA', settings: 'AYARLAR', ok: 'TAMAM', cont: 'DEVAM', reset: 'KAYDI SIFIRLA',
    story: '📰 HİKÂYE', board: '🏆 SKOR', boardTitle: '🏆 SKOR TABLOSU', boardSub: 'Sıralama: tutulan toplam balık',
    boardEmpty: 'Henüz kimse yok — ilk sen ol!', boardYou: 'SEN', boardDay: '{d}. gün',
    boardLocal: 'Bu tablo bu cihazdaki oyunları gösteriyor.', close: 'KAPAT',
    boardLoading: 'Tablo yükleniyor…', boardOffline: 'Bağlantı yok — bu cihazdaki oyunlar gösteriliyor.',
    boardStats: '👥 {p} oyuncu • 🎮 {g} oyun',
    nameTitle: 'İŞLETMENİN ADI', nameSub: 'Tabelaya ne yazalım? Bu isim skor tablosunda görünecek.',
    nameIdeas: 'ÖNERİLER', nameGo: 'İŞE BAŞLA ▶', nameShort: 'En az 2 harf yaz.', nameDice: 'Rastgele isim',
    welcomeCo: 'Hayırlı olsun! {n} kapılarını açtı.', tapStart: '▶ BAŞLAMAK İÇİN DOKUN', skip: 'ATLA ▶▶',
    dayScore: 'Skor (toplam balık)', dayRank: '{s} • {r}. sıra', fishN: '{n} balık',
    tag: 'KÜÇÜK İSKELEDEN BÜYÜK LİMANA',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SES', zoomLbl: 'GÖRÜNTÜ / ZOOM',
    resetAsk: 'Tüm ilerleme silinsin mi?',
    intro1: '🎣 Ağın yanında bekle, balık birikir',
    intro2: '🧺 Üstünden geç, sırtla (ağır balık çok yer kaplar)',
    intro3: '🔪 Kesim masası → fileto',
    intro4: '🐟 Tezgâh → müşteri siparişi öder',
    intro5: '💰 Tezgâh kasasından geç → para hesabına, liman büyür',
    ctrl: 'W A S D / yön tuşları — veya ekrana bas & sürükle',
    tabs: ['LİMAN', 'PERSONEL', 'ÜRÜNLER', 'YARDIM'],
    /* istasyonlar */
    stNet: 'AĞ', stCut: 'KESİM', stSmoke: 'FÜMEHANE', stStall: 'TEZGÂH', stSafe: 'ANA KASA', trayFull: 'KASA DOLU',
    stTake: 'AL', stBuild: 'YAPI YERİ', stProject: 'BÜYÜK PROJE', stDecor: 'SÜS',
    /* yükseltmeler */
    upCap: 'KAPASİTE', upCapE: '+3 taşıma', upSpd: 'HIZ', upSpdE: '+%11 koşu',
    upPrice: 'PAZARLIK', upPriceE: '+%10 fiyat',
    upArea: 'BÖLGE SEVİYESİ', hire: 'İŞE AL', level: 'Sv.',
    needRep: '🔒 Sv {l} • ⭐{c}/{n}', needLv: '🔒 Seviye {l} gerekli', needStaff: 'Personel kulübesi gerekli',
    openArea: 'AÇ', locked: 'KİLİTLİ',
    /* olaylar */
    evShoal: 'BALIK SÜRÜSÜ', evShip: 'VAPUR GELDİ', evStorm: 'LODOS',
    evShoalM: 'Sürü geldi! Ağlar iki kat hızlı 🐟',
    evShipM: 'Vapur yanaştı! Müşteri akını 🚢',
    evStormM: 'Lodos bastırdı, müşteri azaldı 🌊',
    /* olaylar/uyarılar */
    hired: '{i} {n} işe alındı — {w}',
    coachTouch: 'Ekrana bas ve sürükle — karakterin yürür', coachKeys: 'WASD veya ok tuşlarıyla yürü',
    coachAuto: 'Durman yeter: karakter ağdan kendiliğinden alır, masaya/tezgâha kendiliğinden bırakır',
    stallOfFish: '{f} tezgâhı', autoBadge: '⚙ OTOMATİK', autoCard: '{n} — Personele Devret', autoCardOn: '{n} — OTOMATİK',
    autoCardOnD: 'Ekip kendi çalışır (%20 hızlı). Gezip kontrol edebilirsin; kasayı geçerken toplarsın.',
    autoGive: '⚙ DEVRET', autoBack: '↩ GERİ AL', autoNeed: 'Eksik rol: {n}', autoMissing: 'Eksik personel: {m}',
    autoOn: '⚙ {n} personele devredildi — artık kendi kendine çalışır', autoOff: '{n} yeniden sende',
    heroTitle: 'KARAKTERİN', heroSub: 'Limanın yeni balıkçısı kim? Görünüşünü seç.', heroNameLbl: 'ADIN',
    heroRandom: '🎲 RASTGELE', heroGo: 'DEVAM ▶', hero_hs: 'Saç modeli', hero_hc: 'Saç rengi', hero_sk: 'Ten rengi',
    hero_hw: 'Başlık', hero_fc: 'Bıyık / sakal', hero_co: 'Kazak', hero_ap: 'Önlük',
    welcomeHero: 'Hayırlı olsun {h}! {n} kapılarını açtı.',
    stBin: 'ÇÖP', trashed: '🗑 {n} ürün çöpe atıldı', trashHint: '🗑 Tezgâh almıyor — fazlayı ÇÖP kovasına atabilirsin (kovanın önünde dur)',
    musicLbl: 'MÜZİK', musOn: '♪ AÇIK', musOff: 'KAPALI',
    featDay: 'Günün müşterisi: {n}', levelUp: '⭐ Yeni seviye: {t}!', lvlN: 'SEVİYE {l}', lvShort: 'SV {l}', lvBonus: 'Satış primi {p}',
    areaOpen: '🔓 {n} açıldı!',
    areaLvUp: '🏗️ {n} → Sv.{l}',
    built: '🔨 {n} kuruldu',
    projStage: '🏛️ {n}: %{p} — yeni aşama!',
    projDone: '🎉 {n} tamamlandı!',
    decorBought: '✨ {n} yerleştirildi',
    tutDone: 'Eğitim tamam! Limanı büyüt 🎉',
    capUp: '🧺 Taşıma kapasitesi: {n}', spdUp: '👟 Hız +%11', priceUp: '💰 Fiyat +%10',
    /* tutorial */
    tut: ['Ağın yanında bekle — balık birikiyor',
          'Sandığın üstünden geç, balıkları sırtla',
          'Balıkları kesim masasına bırak',
          'Filetoyu al ve tezgâha taşı',
          'Tezgâhın para kasasından geç — para hesabına geçer',
          'Alt bardan bir yükseltme satın al'],
    orderOf: '{n} SİPARİŞİ', waiting: '⏳ {n} müşteri bekliyor',
    idleGoal: 'Stok hazırla — müşteri yolda',
    /* menü */
    mArea: 'Bölgeler', mProject: 'Büyük proje', mSlots: 'Yapı noktaları',
    mWage: 'Maaş gideri', mOrders: 'Tamamlanan sipariş', mLost: 'Kaçan müşteri',
    mCaught: 'Tutulan balık', mNext: 'Sonraki', mMax: 'En üst seviye',
    mNoStaff: 'Henüz çalışanın yok. Alt bardaki YÜKSELT sekmesinden bölge personeli al.',
    mStaffCap: 'Personel limiti', mTotalWage: 'Toplam maaş',
    mWeight: 'ağırlık', mCut: 'kesim', mYield: 'fileto', mSmoked: 'füme',
    mLoop: 'Döngü', mLoopE: 'Ağ → kesim → tezgâh → kasa',
    mSmokeE: 'Fileto → fümehane → 2.4× değer',
    mRepE: 'Sipariş tamamla; VIP/Şef kaçarsa itibar düşer',
    mInvestE: 'Yapı noktası, bölge seviyesi ve büyük projeye para yatır',
    mCtrl: 'Kontrol',
    /* alt panel */
    sheetBuild: 'YAPI NOKTASI', sheetBuildSub: 'Bu noktaya ne kuracaksın?',
    sheetProject: 'BÜYÜK PROJE', invest: 'YATIR', maxInvest: 'MAKS.', pct25: '%25',
    stage: 'Aşama', done: 'TAMAM', owned: 'KURULU', replace: 'DEĞİŞTİR', free: 'ücretsiz',
    /* duraklatma + kayıt */
    paused: 'DURAKLATILDI', play: 'OYNA', resume: '▶ DEVAM ET', newGame: 'YENİ OYUN',
    saved: 'Oyun kaydedildi • {t}', savedQuit: 'Kaydedildi, ana menüye dönüldü',
    noSave: 'Kayıt yok — yeni oyun başlar', never: 'hiç',
    saveLine: 'Son kayıt {t}\nPara {c} • İtibar {r}* • {s} sipariş • {p} oynandı',
    saveNow: '💾 KAYDET', saveQuit: '💾 KAYDET VE ÇIK', setSave: 'KAYIT',
    /* v1.2 — gün / depo / balık pazarı */
    dayLbl: 'GÜN', dayN: 'GÜN {d}', mktDayLbl: 'BALIK PAZARI',
    dayClose: 'GÜN {d} KAPANDI', mktClose: 'BALIK PAZARI {d} BİTTİ',
    dayInc: 'Günlük gelir', dayServed: 'Müşteri', dayFish: 'Satılan balık',
    dayLost: 'Kaçan müşteri', dayTop: 'En çok satan', dayOut: 'Stok dışı süre', dayAuction: 'Mezat satışı',
    goNextDay: 'YENİ GÜN ▶', goPrep: 'PAZARA HAZIRLAN ▶',
    mktTomorrow: 'YARIN BALIK PAZARI', mktExpect: 'Beklenen yoğunluk: Yüksek — tezgâhları doldur',
    mktDayTitle: '🐟 BALIK PAZARI GÜNÜ',
    prepSub: 'Bugün müşteri akışı iki katına çıkacak. Tezgâh stoklarını kontrol et.',
    goMarket: 'PAZARI AÇ ▶',
    prepStock: 'Tezgâh stoğu {a} / {b} — {n} açık tezgâh', nowStock: 'stok {n}',
    noStall: 'Açık tezgâh yok', active: 'AKTİF', none: 'YOK',
    /* v2.1 — bölge personeli + tezgâh açma */
    hiredZ: '{i} {n} işe alındı — {z}', harborWide: 'liman geneli',
    zoneStaff: '{n} personeli', zoneStaffD: 'Kadro {a}/{b} — rol seç',
    zoneFull: 'Bu bölgenin kadrosu dolu', zoneOf: '{n} bölgesi',
    stallSwitch: 'AÇIK TEZGÂHLAR', stallSwitchD: '{a}/{b} tezgâh açık — aç/kapat',
    stallManage: 'AÇ / KAPAT', stallTitle: 'AÇIK TEZGÂHLAR',
    newStallLbl: 'YENİ', newStallHint: 'Yeni tezgâh hazır — alt bardaki YÜKSELT › AÇIK TEZGÂHLAR',
    howToOpen: 'YÜKSELT › AÇIK TEZGÂHLAR', stallNewN: '{n} yeni tezgâh kararını bekliyor',
    stallSub: 'Yetişemediğin tezgâhı kapat: kapalı tezgâha müşteri gelmez, ağ o türü üretmez.',
    swOn: 'AÇIK', swOff: 'KAPALI', swFixed: 'SABİT', stallClosed: 'KAPALI',
    dayStalls: 'AÇIK TEZGÂHLAR', stallNew: 'Yeni tezgâh kuruldu — açmak ister misin?',
    tableFor: 'Kesim: {n}', tableAny: 'Kesim',
    mZoneStaff: 'Bölge kadrosu',
    noRun: 'Önce oyunu başlat',
    newAsk: 'Mevcut kayıt silinip yeni oyun başlasın mı?',
    loadGame: '📂 KAYITLI OYUNLAR', slotN: 'Slot {n}', slotTitleNew: 'YENİ OYUN — SLOT SEÇ', slotTitleLoad: 'KAYITLI OYUNLAR',
    slotSubNew: 'Yeni oyunu hangi slota kuralım?', slotSubLoad: 'Devam etmek istediğin oyunu seç.',
    slotNew: '＋ YENİ OYUN', slotOver: '↺ ÜZERİNE YENİ OYUN', slotLoad: '▶ OYNA', slotDel: 'Sil',
    slotEmptyT: 'BOŞ SLOT', slotEmptyS: 'Burada yeni bir işletme kurabilirsin', slotNoName: 'İsimsiz işletme',
    slotLine: '{d}. gün • {f} balık • {c}', slotWhen: 'Son kayıt {t} • {p} oynandı',
    overAsk: 'Slot {n}\'deki "{c}" silinip yerine yeni oyun kurulacak. Emin misin?', overYes: 'SİL VE BAŞLA',
    delAsk: 'Slot {n}\'deki "{c}" kalıcı olarak silinsin mi?', delYes: 'SİL', slotEmpty2: 'bu oyun',
    slotDeleted: 'Slot {n} silindi', slotLoaded: 'Slot {n} yüklendi: {c}', yes: 'EVET', cancel: 'VAZGEÇ',
    noStorage: '⚠ Bu tarayıcı kalıcı kayda izin vermiyor: kayıtlar sayfa kapanınca silinir.', delSlot: '🗑 BU SLOTU SİL',
    remaining: 'kalan', total: 'toplam',
    noMoney: 'Para yetmiyor',
    barArea: 'ALAN', barLevel: 'YÜKSELT', barBuild: 'YAPI', barProj: 'PROJE', barServ: 'BİNA',
    tArea: 'YENİ ALAN AÇ', tLevel: 'YÜKSELTMELER', tBuild: 'YAPI', tProj: 'BÜYÜK PROJE',
    bsub_decor: '🌺 Dekoratif', bsub_dev: '🔨 Geliştirmeler', bsub_up: '🏗️ Yapı Yükseltmeleri',
    emptyDecor: 'Bu bölgelerdeki tüm süsler alındı', emptyUp: 'Açık bölgelerin hepsi en üst seviyede',
    tServ: 'LİMAN HİZMET BİNALARI',
    /* v0.4 — hizmet binaları */
    servBuilt: '{n} kuruldu', servUp: '{n} → Lv.{l}', servMoved: '{n} taşındı',
    needServ: 'Önce {n} hizmet binası kur', needArea: '{n} bölgesi kapalı', noPlot: 'Uygun boş parsel yok',
    move: 'BAŞKA PARSELE TAŞI', moveHere: 'BURAYA TAŞI', buildHere: 'İNŞA ET',
    maxLv: 'Son seviye', nextLook: 'Sonraki görünüm', dormantB: 'Tekne sistemi gelince aktif',
    servEmpty: 'Hizmet binası için önce bölge aç', pickPlot: 'Parsel seç',
    plotOf: '{n} bölgesi', servInc: 'servis geliri',
    buy: 'SATIN AL', confirm: 'ONAYLA?', choose: 'SEÇ', back: '← GERİ',
    emptyArea: 'Açılacak yeni alan yok', emptyLevel: 'Şimdilik yükseltme yok',
    emptyBuild: 'Yapı noktası yok', emptyProj: 'Proje bu bölge açılınca gelir',
    slotEmpty: 'Boş yapı yeri', slotOf: '{n} bölgesi',
    areaGives: 'Yeni ağ, kesim ve tezgâh', decorGroup: 'Süs',
    lvEffect: 'Ağ +%18, tezgâh +4 stok, yeni yapı yeri',
    staffFull: 'Personel limiti dolu ({n})',
    tut6: 'Alt bardan bir yükseltme satın al',
    nextStage: 'Sonraki aşama',
    /* borsa / kontrat / holding */
    office: 'TİCARET OFİSİ', officeD: 'Şirketler, kontratlar ve borsa açılır',
    trade: 'TİCARET', license: 'HOLDİNG LİSANSI', licenseD: '%30 üstü kontrol ve devralma açılır',
    mktClosed: 'Pazar {d} kapandı • Liman 12: {i} (%{c})',
    corpRaise: '{n}: sermaye artırımı', corpBuy: '{n}: geri alım', corpSplit: '{n}: hisse bölünmesi',
    divPaid: 'Temettü: +{v}', privOffer: 'Yeni işletme satışta!', boardReady: '{n}: yönetim kurulu kararı',
    ctrFull: 'Aktif kontrat limiti ({n})', ctrAccepted: '{n} kontratı kabul edildi',
    ctrFailed: '{n}: kontrat süresi doldu', ctrDone: '{n} teslim edildi: {v}',
    noShares: 'Serbest hisse yok', need51: 'Holding lisansı gerekli', orderTooBig: 'Emir çok büyük (böl)',
    sellLock: 'Aynı pazar gününde satılamaz', sold: 'Satış: +{v}',
    threshold: '{n}: %{p} ortaklık!', subsidiary: '{n} bağlı ortaklık oldu', privBought: '{n} satın alındı',
    tabMarket: 'PİYASA', tabCo: 'ŞİRKET', tabCtr: 'KONTRAT', tabPort: 'PORTFÖY', tabNews: 'HABER', tabHold: 'HOLDİNG',
    idx: 'Liman 12', day: 'Pazar Günü', health: 'Sağlık', growth: 'Büyüme', risk: 'Risk',
    rel: 'İlişki', own: 'Pay', free: 'Serbest', price: 'Fiyat', buyB: 'AL', sellB: 'SAT',
    accept: 'KABUL ET', commission: 'komisyon', takeover: 'DEVRAL', boardT: 'YÖNETİM KURULU',
    stStrong: 'Güçlü', stOk: 'Dengeli', stPress: 'Baskı Altında', stRestr: 'Yeniden Yapılanma',
    cyExpand: 'Genişleme', cyNormal: 'Normal', cySlow: 'Yavaşlama', cyRecover: 'Toparlanma',
    relLv: ['Tanımsız Tedarikçi', 'Kayıtlı Tedarikçi', 'Tercihli Tedarikçi', 'Ana Tedarikçi', 'Stratejik Ortak', 'Amiral Ortak'],
    bCap: 'Kapasite Yatırımı', bGrow: 'Agresif Büyüme', bCost: 'Maliyet Düşürme', bPort: 'Liman Projesi', bDebt: 'Borcu Azalt',
    noContract: 'Şimdilik kontrat yok', noNews: 'Henüz haber yok', empty: 'Boş',
    deliverAt: 'Ürünleri Ticaret Ofisi\'ne bırak', activeCtr: 'Aktif kontrat',
    holdingV: 'Holding değeri', portV: 'Portföy', subsV: 'Bağlı ortaklık', harborV: 'Liman varlığı',
    privInc: 'İşletme geliri', perks: 'Aktif perkler', buyPriv: 'SATIN AL', offerLeft: '{n} gün kaldı',
    tutMarket: 'Ticaret Ofisi kuruldu! İlk kontratını al.',
    privIncome: 'İşletme geliri: +{v}', creditGift: 'Eğitim kredisi: 10 {n} hissesi',
    newLine: '🎉 Yeni hat açıldı: {n}!', lineLocked: 'Kilitli — {s} gerekli',
    lineOpen: 'Açık', stallOf2: 'Tezgâh: {s}', noStall: 'Tezgâh kurulmadı',
    stB0: 'İskele Tezgâhı', stB1: 'Pazar Tezgâhı', stB2: 'Fümehane Tezgâhı',
    stSS3: 'Pazar Ek Tezgâhı (yapı)', stSS6: 'Fümehane Ek Tezgâhı (yapı)', stHAL: 'Kapalı Balık Hali'
  },
  en: {
    money: 'CASH', carry: 'CARRY', rep: 'REP', goal: 'GOAL', menu: 'HARBOR',
    play: 'PLAY', settings: 'SETTINGS', ok: 'OK', cont: 'CONTINUE', reset: 'RESET SAVE',
    story: '📰 STORY', board: '🏆 SCORES', boardTitle: '🏆 LEADERBOARD', boardSub: 'Ranked by total fish caught',
    boardEmpty: 'Nobody here yet — be the first!', boardYou: 'YOU', boardDay: 'Day {d}',
    boardLocal: 'This table shows games played on this device.', close: 'CLOSE',
    boardLoading: 'Loading leaderboard…', boardOffline: 'Offline — showing games on this device.',
    boardStats: '👥 {p} players • 🎮 {g} games',
    nameTitle: 'NAME YOUR BUSINESS', nameSub: 'What goes on the sign? This name appears on the leaderboard.',
    nameIdeas: 'IDEAS', nameGo: 'OPEN FOR BUSINESS ▶', nameShort: 'Type at least 2 letters.', nameDice: 'Random name',
    welcomeCo: '{n} is open for business!', tapStart: '▶ TAP TO BEGIN', skip: 'SKIP ▶▶',
    dayScore: 'Score (total fish)', dayRank: '{s} • #{r}', fishN: '{n} fish',
    tag: 'FROM A TINY PIER TO A GRAND HARBOR',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SOUND', zoomLbl: 'VIEW / ZOOM',
    resetAsk: 'Erase all progress?',
    intro1: '🎣 Wait by the net, fish pile up',
    intro2: '🧺 Walk over the crate to carry them (big fish weigh more)',
    intro3: '🔪 Cutting table → fillets',
    intro4: '🐟 Stall → customers pay for orders',
    intro5: '💰 Walk past the stall cash box → money is banked',
    ctrl: 'W A S D / arrow keys — or touch & drag anywhere',
    tabs: ['HARBOR', 'STAFF', 'GOODS', 'HELP'],
    stNet: 'NET', stCut: 'CUTTING', stSmoke: 'SMOKEHOUSE', stStall: 'STALL', stSafe: 'MAIN SAFE', trayFull: 'CASH FULL',
    stTake: 'TAKE', stBuild: 'BUILD SPOT', stProject: 'BIG PROJECT', stDecor: 'DECOR',
    upCap: 'CAPACITY', upCapE: '+3 carry', upSpd: 'SPEED', upSpdE: '+11% run',
    upPrice: 'HAGGLE', upPriceE: '+10% price',
    upArea: 'AREA LEVEL', hire: 'HIRE', level: 'Lv.',
    needRep: '🔒 Lv {l} • ⭐{c}/{n}', needLv: '🔒 Needs level {l}', needStaff: 'Needs a staff hut',
    openArea: 'OPEN', locked: 'LOCKED',
    evShoal: 'FISH SHOAL', evShip: 'FERRY ARRIVED', evStorm: 'SOUTH WIND',
    evShoalM: 'A shoal arrived! Nets twice as fast 🐟',
    evShipM: 'The ferry docked! Customer rush 🚢',
    evStormM: 'Rough sea, fewer customers 🌊',
    hired: '{i} {n} hired — {w}',
    coachTouch: 'Press and drag anywhere — your character walks', coachKeys: 'Walk with WASD or the arrow keys',
    coachAuto: 'Just stand still: you pick up from the net and drop at tables/stalls automatically',
    stallOfFish: '{f} stall', autoBadge: '⚙ AUTO', autoCard: '{n} — Hand over to staff', autoCardOn: '{n} — AUTOMATED',
    autoCardOnD: 'The crew runs it (20% faster). Walk by to inspect; you still collect cash as you pass.',
    autoGive: '⚙ HAND OVER', autoBack: '↩ TAKE BACK', autoNeed: 'Missing roles: {n}', autoMissing: 'Missing staff: {m}',
    autoOn: '⚙ {n} handed to staff — it now runs itself', autoOff: '{n} is back in your hands',
    heroTitle: 'YOUR CHARACTER', heroSub: 'Who is the harbor\'s new fisher? Pick a look.', heroNameLbl: 'YOUR NAME',
    heroRandom: '🎲 RANDOM', heroGo: 'NEXT ▶', hero_hs: 'Hair style', hero_hc: 'Hair colour', hero_sk: 'Skin tone',
    hero_hw: 'Headwear', hero_fc: 'Moustache / beard', hero_co: 'Sweater', hero_ap: 'Apron',
    welcomeHero: 'Good luck {h}! {n} is open for business.',
    stBin: 'BIN', trashed: '🗑 {n} items thrown away', trashHint: '🗑 The stall won\'t take it — dump extras in the BIN (stand in front of it)',
    musicLbl: 'MUSIC', musOn: '♪ ON', musOff: 'OFF',
    featDay: 'Customer of the day: {n}', levelUp: '⭐ New rank: {t}!', lvlN: 'LEVEL {l}', lvShort: 'LV {l}', lvBonus: 'Sales bonus {p}',
    areaOpen: '🔓 {n} unlocked!',
    areaLvUp: '🏗️ {n} → Lv.{l}',
    built: '🔨 {n} built',
    projStage: '🏛️ {n}: {p}% — new stage!',
    projDone: '🎉 {n} completed!',
    decorBought: '✨ {n} placed',
    tutDone: 'Tutorial done! Grow the harbor 🎉',
    capUp: '🧺 Carry capacity: {n}', spdUp: '👟 Speed +11%', priceUp: '💰 Price +10%',
    tut: ['Wait by the net — fish are coming',
          'Walk over the crate to pick up the fish',
          'Drop the fish on the cutting table',
          'Grab fillets and carry them to the stall',
          'Walk past the stall cash box — money is banked',
          'Buy an upgrade from the bottom bar'],
    orderOf: '{n} ORDER', waiting: '⏳ {n} customers waiting',
    idleGoal: 'Stock up — customers on the way',
    mArea: 'Areas', mProject: 'Big project', mSlots: 'Build spots',
    mWage: 'Wages', mOrders: 'Orders served', mLost: 'Customers lost',
    mCaught: 'Fish caught', mNext: 'Next', mMax: 'Max rank',
    mNoStaff: 'No staff yet. Hire zone crew from the UPGRADE tab in the bottom bar.',
    mStaffCap: 'Staff limit', mTotalWage: 'Total wages',
    mWeight: 'weight', mCut: 'cut', mYield: 'fillets', mSmoked: 'smoked',
    mLoop: 'Loop', mLoopE: 'Net → cutting → stall → safe',
    mSmokeE: 'Fillet → smokehouse → 2.4× value',
    mRepE: 'Finish orders; losing a Chef/VIP costs rep',
    mInvestE: 'Invest in build spots, area levels and the big project',
    mCtrl: 'Controls',
    sheetBuild: 'BUILD SPOT', sheetBuildSub: 'What will you build here?',
    sheetProject: 'BIG PROJECT', invest: 'INVEST', maxInvest: 'MAX', pct25: '25%',
    stage: 'Stage', done: 'DONE', owned: 'BUILT', replace: 'REPLACE', free: 'free',
    paused: 'PAUSED', play: 'PLAY', resume: '▶ CONTINUE', newGame: 'NEW GAME',
    saved: 'Game saved • {t}', savedQuit: 'Saved — back to main menu',
    noSave: 'No save yet — a new game will start', never: 'never',
    saveLine: 'Last save {t}\nCash {c} • Rep {r}* • {s} orders • {p} played',
    saveNow: '💾 SAVE', saveQuit: '💾 SAVE & QUIT', setSave: 'SAVE',
    dayLbl: 'DAY', dayN: 'DAY {d}', mktDayLbl: 'FISH MARKET',
    dayClose: 'DAY {d} CLOSED', mktClose: 'FISH MARKET {d} ENDED',
    dayInc: 'Daily income', dayServed: 'Customers', dayFish: 'Fish sold',
    dayLost: 'Lost customers', dayTop: 'Top seller', dayOut: 'Stock-out time', dayAuction: 'Auction sale',
    goNextDay: 'NEW DAY ▶', goPrep: 'PREPARE FOR MARKET ▶',
    mktTomorrow: 'FISH MARKET TOMORROW', mktExpect: 'Expected demand: High — stock your stalls',
    mktDayTitle: '🐟 FISH MARKET DAY',
    prepSub: 'Customer flow doubles today. Check your stall stock before opening.',
    goMarket: 'OPEN THE MARKET ▶',
    prepStock: 'Stall stock {a} / {b} — {n} open stalls', nowStock: 'stock {n}',
    noStall: 'No open stall', active: 'ACTIVE', none: 'NONE',
    hiredZ: '{i} {n} hired — {z}', harborWide: 'harbor-wide',
    zoneStaff: '{n} staff', zoneStaffD: 'Crew {a}/{b} — pick a role',
    zoneFull: "This zone's crew is full", zoneOf: '{n} zone',
    stallSwitch: 'OPEN STALLS', stallSwitchD: '{a}/{b} stalls open — switch on/off',
    stallManage: 'ON / OFF', stallTitle: 'OPEN STALLS',
    newStallLbl: 'NEW', newStallHint: 'New stall ready — bottom bar UPGRADE › OPEN STALLS',
    howToOpen: 'UPGRADE › OPEN STALLS', stallNewN: '{n} new stall awaiting your call',
    stallSub: "Switch off a stall you can't keep up with: no customers arrive and its net stops.",
    swOn: 'ON', swOff: 'OFF', swFixed: 'FIXED', stallClosed: 'CLOSED',
    dayStalls: 'OPEN STALLS', stallNew: 'A new stall is built — switch it on?',
    tableFor: 'Cutting: {n}', tableAny: 'Cutting',
    mZoneStaff: 'Zone crew',
    noRun: 'Start the game first',
    newAsk: 'Delete the current save and start a new game?',
    loadGame: '📂 SAVED GAMES', slotN: 'Slot {n}', slotTitleNew: 'NEW GAME — PICK A SLOT', slotTitleLoad: 'SAVED GAMES',
    slotSubNew: 'Which slot should the new game use?', slotSubLoad: 'Pick the game you want to continue.',
    slotNew: '＋ NEW GAME', slotOver: '↺ NEW GAME HERE', slotLoad: '▶ PLAY', slotDel: 'Delete',
    slotEmptyT: 'EMPTY SLOT', slotEmptyS: 'Start a new business here', slotNoName: 'Unnamed business',
    slotLine: 'Day {d} • {f} fish • {c}', slotWhen: 'Saved {t} • {p} played',
    overAsk: '"{c}" in slot {n} will be deleted and replaced by a new game. Sure?', overYes: 'DELETE & START',
    delAsk: 'Permanently delete "{c}" in slot {n}?', delYes: 'DELETE', slotEmpty2: 'this game',
    slotDeleted: 'Slot {n} deleted', slotLoaded: 'Slot {n} loaded: {c}', yes: 'YES', cancel: 'CANCEL',
    noStorage: '⚠ This browser blocks permanent saves: saves are lost when the page closes.', delSlot: '🗑 DELETE THIS SLOT',
    remaining: 'left', total: 'total',
    noMoney: 'Not enough cash',
    barArea: 'AREA', barLevel: 'UPGRADE', barBuild: 'BUILD', barProj: 'PROJECT', barServ: 'SERVICE',
    tArea: 'UNLOCK NEW AREA', tLevel: 'UPGRADES', tBuild: 'BUILD', tProj: 'BIG PROJECT',
    bsub_decor: '🌺 Decor', bsub_dev: '🔨 Improvements', bsub_up: '🏗️ Building Upgrades',
    emptyDecor: 'All decor in open areas is owned', emptyUp: 'All open areas are max level',
    tServ: 'HARBOR SERVICE BUILDINGS',
    servBuilt: '{n} built', servUp: '{n} → Lv.{l}', servMoved: '{n} relocated',
    needServ: 'Build {n} service buildings first', needArea: '{n} area is locked', noPlot: 'No free plot available',
    move: 'MOVE TO ANOTHER PLOT', moveHere: 'MOVE HERE', buildHere: 'BUILD',
    maxLv: 'Max level', nextLook: 'Next look', dormantB: 'Activates with the boat system',
    servEmpty: 'Unlock an area to place service buildings', pickPlot: 'Pick a plot',
    plotOf: '{n} area', servInc: 'service income',
    buy: 'BUY', confirm: 'CONFIRM?', choose: 'PICK', back: '← BACK',
    emptyArea: 'No new area to unlock', emptyLevel: 'No upgrade available yet',
    emptyBuild: 'No build spot yet', emptyProj: 'Unlocks with that area',
    slotEmpty: 'Empty build spot', slotOf: '{n} area',
    areaGives: 'New net, cutting table and stall', decorGroup: 'Decor',
    lvEffect: 'Nets +18%, stall +4 stock, new build spot',
    staffFull: 'Staff limit reached ({n})',
    tut6: 'Buy an upgrade from the bottom bar',
    nextStage: 'Next stage',
    office: 'TRADE OFFICE', officeD: 'Unlocks companies, contracts and the market',
    trade: 'TRADE', license: 'HOLDING LICENSE', licenseD: 'Unlocks control above 30% and takeovers',
    mktClosed: 'Day {d} closed • Port 12: {i} ({c}%)',
    corpRaise: '{n}: capital raise', corpBuy: '{n}: buyback', corpSplit: '{n}: share split',
    divPaid: 'Dividend: +{v}', privOffer: 'A business is up for sale!', boardReady: '{n}: board decision',
    ctrFull: 'Active contract limit ({n})', ctrAccepted: '{n} contract accepted',
    ctrFailed: '{n}: contract expired', ctrDone: '{n} delivered: {v}',
    noShares: 'No free shares', need51: 'Holding license required', orderTooBig: 'Order too big (split it)',
    sellLock: 'Cannot sell on the same market day', sold: 'Sold: +{v}',
    threshold: '{n}: {p}% stake!', subsidiary: '{n} is now a subsidiary', privBought: '{n} acquired',
    tabMarket: 'MARKET', tabCo: 'COMPANY', tabCtr: 'CONTRACT', tabPort: 'PORTFOLIO', tabNews: 'NEWS', tabHold: 'HOLDING',
    idx: 'Port 12', day: 'Market Day', health: 'Health', growth: 'Growth', risk: 'Risk',
    rel: 'Relation', own: 'Stake', free: 'Float', price: 'Price', buyB: 'BUY', sellB: 'SELL',
    accept: 'ACCEPT', commission: 'fee', takeover: 'TAKEOVER', boardT: 'BOARD',
    stStrong: 'Strong', stOk: 'Stable', stPress: 'Under Pressure', stRestr: 'Restructuring',
    cyExpand: 'Expansion', cyNormal: 'Normal', cySlow: 'Slowdown', cyRecover: 'Recovery',
    relLv: ['Unrated Supplier', 'Registered Supplier', 'Preferred Supplier', 'Key Supplier', 'Strategic Partner', 'Flagship Partner'],
    bCap: 'Capacity Investment', bGrow: 'Aggressive Growth', bCost: 'Cost Cutting', bPort: 'Port Project', bDebt: 'Reduce Debt',
    noContract: 'No contracts yet', noNews: 'No news yet', empty: 'Empty',
    deliverAt: 'Drop goods at the Trade Office', activeCtr: 'Active contracts',
    holdingV: 'Holding value', portV: 'Portfolio', subsV: 'Subsidiaries', harborV: 'Harbor assets',
    privInc: 'Business income', perks: 'Active perks', buyPriv: 'BUY', offerLeft: '{n} days left',
    tutMarket: 'Trade Office built! Take your first contract.',
    privIncome: 'Business income: +{v}', creditGift: 'Training credit: 10 {n} shares',
    newLine: '🎉 New line unlocked: {n}!', lineLocked: 'Locked — needs {s}',
    lineOpen: 'Open', stallOf2: 'Stall: {s}', noStall: 'Stall not built',
    stB0: 'Pier Stall', stB1: 'Market Stall', stB2: 'Smokehouse Stall',
    stSS3: 'Market Extra Stall (build)', stSS6: 'Smokehouse Extra Stall (build)', stHAL: 'Covered Fish Hall'
  }
};
function T(k, p) {
  var s = (STR[lang] && STR[lang][k] !== undefined) ? STR[lang][k] : STR.tr[k];
  if (s === undefined) return k;
  if (p && typeof s === 'string') for (var i in p) s = s.replace('{' + i + '}', p[i]);
  return s;
}
function NM(o) { return (o && o[lang]) || (o && o.tr) || ''; }
function UP(s) {
  s = String(s);
  if (lang !== 'tr') return s.toUpperCase();
  return s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/* ---------------- canvas / pixel ---------------- */
var cvs = document.getElementById('game');
var ctx = cvs.getContext('2d');
var ucv = document.getElementById('ui');
var uctx = ucv.getContext('2d');
var VW = 0, VH = 0, PXS = 3, zoomLvl = 2, DPR2 = 1;
var W = 0, H = 0;                 /* sanal (pixel) tuval boyutu */
function resize() {
  VW = cvs.clientWidth || window.innerWidth;
  VH = cvs.clientHeight || window.innerHeight;
  var base = clamp(Math.round(VW / 330), 2, 4);
  PXS = clamp(base + (zoomLvl - 2), 1, 6);
  W = Math.ceil(VW / PXS); H = Math.ceil(VH / PXS);
  cvs.width = W; cvs.height = H;
  ctx.imageSmoothingEnabled = false;
  DPR2 = Math.min(2, window.devicePixelRatio || 1);
  ucv.width = Math.round(VW * DPR2); ucv.height = Math.round(VH * DPR2);
}

/* ---- dünya yazıları: tam çözünürlüklü üst katman ---- */
var camOX = 0, camOY = 0, uiQ = [];
function uiX(x, y, dx) { return (pX(x, y) + camOX + (dx || 0)) * PXS; }
function uiY(x, y, z, dy) { return (pY(x, y, z) + camOY + (dy || 0)) * PXS; }
function uiLabel(x, y, z, s, col, a, dx, dy) { uiQ.push({ t: 1, x: x, y: y, z: z, s: s, c: col, a: a === undefined ? 1 : a, dx: dx, dy: dy }); }
function uiBadge(x, y, z, s, col) { uiQ.push({ t: 2, x: x, y: y, z: z, s: s, c: col || '#ffc94a', a: 1 }); }
/* Etiket bütçesi: kalabalık limanda ekranı yazı kaplamasın.
   Ad etiketleri (t=1) yalnız oyuncuya en yakın LABEL_BUDGET tanesi çizilir;
   rozetler (t=2) ve serbest yazılar (t=3) sınırlanmaz. */
var LABEL_BUDGET = 6, BADGE_BUDGET = 14;
function trimLabels() {
  var lab = [], bad = [], rest = [], i;
  for (i = 0; i < uiQ.length; i++) {
    var q = uiQ[i];
    q._d = dist2(player.x, player.y, q.x, q.y);
    if (q.t === 1) lab.push(q); else if (q.t === 2) bad.push(q); else rest.push(q);
  }
  function near(a, b) { return a._d - b._d; }
  lab.sort(near); bad.sort(near);
  uiQ = rest.concat(bad.slice(0, BADGE_BUDGET)).concat(lab.slice(0, LABEL_BUDGET));
}
function uiText(x, y, z, s, col, size, a, dx, dy, outline) { uiQ.push({ t: 3, x: x, y: y, z: z, s: s, c: col, sz: size || 12, a: a === undefined ? 1 : a, dx: dx, dy: dy, o: outline }); }
function uiFont(px) { return 'bold ' + px + 'px "Pixelify Sans",ui-monospace,monospace'; }
/* pixel joystick: koyu taban halkası + altın topuz + yön oku */
function drawJoystick(jx, jy, dx, dy, a) {
  var r = 17, i, k = Math.hypot(dx, dy);
  ctx.save(); ctx.globalAlpha = 0.34 * a;
  for (i = -r; i <= r; i++) { var w = R(Math.sqrt(r * r - i * i)); px(jx - w, jy + i, w * 2, 1, '#0a1a27'); }
  ctx.globalAlpha = 0.75 * a;
  for (i = 0; i < 40; i++) { var t = i / 40 * Math.PI * 2; px(jx + R(Math.cos(t) * r), jy + R(Math.sin(t) * r), 1, 1, '#f4e9d2'); }
  if (k > 0.2) {                                       /* yön oku halkanın kenarında */
    var ux = dx / k, uy = dy / k, ax = jx + ux * (r + 4), ay = jy + uy * (r + 4);
    for (i = 0; i < 4; i++) {
      var bx = ax - ux * i, by = ay - uy * i;
      px(bx - uy * i, by + ux * i, 1, 1, '#ffc94a'); px(bx + uy * i, by - ux * i, 1, 1, '#ffc94a');
    }
  }
  var kx = jx + R(dx * 11), ky = jy + R(dy * 11);
  ctx.globalAlpha = a;
  for (i = -6; i <= 6; i++) { var w2 = R(Math.sqrt(36 - i * i)); px(kx - w2, ky + i, w2 * 2, 1, '#c98f1c'); }
  for (i = -5; i <= 4; i++) { var w3 = R(Math.sqrt(25 - (i + 0.5) * (i + 0.5))); px(kx - w3, ky + i, w3 * 2, 1, '#ffc94a'); }
  px(kx - 3, ky - 4, 2, 2, '#fff4c8');
  ctx.restore();
}
function renderUI() {
  trimLabels();
  uctx.setTransform(DPR2, 0, 0, DPR2, 0, 0);
  uctx.clearRect(0, 0, VW, VH);
  uctx.textAlign = 'center'; uctx.textBaseline = 'alphabetic';
  var taken = [];
  function hits(r) {
    for (var k = 0; k < taken.length; k++) {
      var o = taken[k];
      if (r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y) return true;
    }
    return false;
  }
  for (var i = 0; i < uiQ.length; i++) {
    var q = uiQ[i];
    var cx = Math.round(uiX(q.x, q.y, q.dx)), cy = Math.round(uiY(q.x, q.y, q.z, q.dy));
    if (cx < -160 || cx > VW + 160 || cy < -60 || cy > VH + 60) continue;
    uctx.globalAlpha = q.a;
    if (q.t === 1 || q.t === 2) {
      var fs = q.t === 1 ? 10 : 9.5;
      uctx.font = uiFont(fs);
      var w = Math.round(uctx.measureText(q.s).width) + 9, h = fs + 6;
      var rect = { x: cx - w / 2, y: cy - h, w: w, h: h };
      for (var tr = 0; tr < 5 && hits(rect); tr++) rect.y -= h + 2;
      if (hits(rect)) continue;                       /* yer yoksa hiç çizme */
      taken.push(rect);
      cy = rect.y + h;
      uctx.fillStyle = '#0a1a27'; uctx.fillRect(rect.x, rect.y, w, h);
      uctx.fillStyle = q.t === 1 ? 'rgba(20,41,60,.92)' : 'rgba(29,58,82,.92)';
      uctx.fillRect(rect.x + 2, rect.y + 2, w - 4, h - 4);
      /* kilim çentiği: üst kenarda iki altın nokta */
      uctx.fillStyle = q.t === 1 ? '#c9a15e' : '#7a9ab0';
      uctx.fillRect(rect.x + 2, rect.y + 2, 2, 1); uctx.fillRect(rect.x + w - 4, rect.y + 2, 2, 1);
      uctx.fillStyle = q.c || '#f4e9d2';
      uctx.fillText(q.s, cx, cy - 5);
    } else {
      uctx.font = uiFont(q.sz);
      uctx.lineWidth = 3; uctx.strokeStyle = q.o || 'rgba(10,26,39,.92)'; uctx.lineJoin = 'round';
      uctx.strokeText(q.s, cx, cy);
      uctx.fillStyle = q.c || '#f4e9d2';
      uctx.fillText(q.s, cx, cy);
    }
  }
  uctx.globalAlpha = 1;
  uiQ.length = 0;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', function () { setTimeout(resize, 150); });

/* izometrik */
var TW = 24, TH = 12;
function pX(x, y) { return (x - y) * (TW / 2); }
function pY(x, y, z) { return (x + y) * (TH / 2) - (z || 0); }

/* ---------------- girdi ---------------- */
var keys = {};
/* v0.3 — hareket göstergesi + kontrol eğitimi */
var moveDir = { on: false, x: 0, y: 0 }, ctrlWalk = 0, ctrlT = 0;
var inputMode = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 'touch' : 'key';
function typing(e) { var tg = e.target && e.target.tagName; return tg === 'INPUT' || tg === 'TEXTAREA'; }
window.addEventListener('keydown', function (e) {
  if (typing(e)) return;
  keys[e.key.toLowerCase()] = true;
  if (/^(w|a|s|d|arrow)/.test(e.key.toLowerCase()) && inputMode !== 'key') { inputMode = 'key'; if (el.coach) el.coach.dataset.k = ''; }
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
});
window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
var stick = { active: false, id: -1, bx: 0, by: 0, dx: 0, dy: 0 };
cvs.addEventListener('pointerdown', function (e) {
  cvs.setPointerCapture(e.pointerId);
  if (inputMode !== 'touch') { inputMode = 'touch'; if (el.coach) el.coach.dataset.k = ''; }
  stick.active = true; stick.id = e.pointerId; stick.bx = e.clientX; stick.by = e.clientY; stick.dx = 0; stick.dy = 0;
});
cvs.addEventListener('pointermove', function (e) {
  if (!stick.active || e.pointerId !== stick.id) return;
  var dx = e.clientX - stick.bx, dy = e.clientY - stick.by, L = Math.hypot(dx, dy), Rr = 60;
  if (L > Rr) { stick.bx += dx * (1 - Rr / L); stick.by += dy * (1 - Rr / L); dx = e.clientX - stick.bx; dy = e.clientY - stick.by; L = Rr; }
  stick.dx = L > 6 ? dx / Rr : 0; stick.dy = L > 6 ? dy / Rr : 0;
});
function stickEnd(e) { if (!e || e.pointerId === stick.id) { stick.active = false; stick.id = -1; stick.dx = 0; stick.dy = 0; } }
cvs.addEventListener('pointerup', stickEnd);
cvs.addEventListener('pointercancel', stickEnd);
cvs.addEventListener('contextmenu', function (e) { e.preventDefault(); });

/* ---------------- ses ---------------- */
/* =========================================================
   SES MOTORU v2 — 0.1 sürümü
   • Tek master gain + 3 kademeli ses seviyesi (kapalı / kısık / açık)
   • Her kullanıcı dokunuşunda AudioContext açılır ve resume edilir
     (iOS/Safari ve mobil Chrome'un otomatik oynatma kilidi için)
   • Zarf (attack/decay) ile tık sesi yok, kare dalga yumuşatılmış
   ========================================================= */
var AC = null, masterGain = null, soundOn = true, volLvl = 2;   /* 0 kapalı, 1 kısık, 2 açık */
var VOLS = [0, 0.22, 0.5];
var audioReady = false;

function ensureAudio() {
  try {
    if (!AC) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      AC = new Ctor();
      masterGain = AC.createGain();
      masterGain.gain.value = VOLS[volLvl] || 0;
      masterGain.connect(AC.destination);
    }
    if (AC.state === 'suspended' && AC.resume) AC.resume();
    audioReady = AC.state === 'running';
    return audioReady;
  } catch (e) { return false; }
}
function applyVolume() {
  soundOn = volLvl > 0;
  if (masterGain && AC) {
    try { masterGain.gain.setTargetAtTime(VOLS[volLvl] || 0, AC.currentTime, 0.02); }
    catch (e) { masterGain.gain.value = VOLS[volLvl] || 0; }
  }
}
/* her dokunuş/tuş sesi açma şansı verir — mobilde kritik */
['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
  window.addEventListener(ev, function () { ensureAudio(); }, { passive: true });
});
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) ensureAudio();
});

/* --- temel ton: zarflı osilatör --- */
function tone(f, d, type, v, o) {
  if (!soundOn || !ensureAudio()) return;
  o = o || {};
  try {
    var t0 = AC.currentTime + (o.at || 0);
    var osc = AC.createOscillator(), g = AC.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + d);
    var peak = Math.max(0.0001, v === undefined ? 0.5 : v);
    var atk = o.atk === undefined ? 0.008 : o.atk;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    var node = osc;
    if (o.lp) {                                   /* alçak geçiren: sert kareyi yumuşatır */
      var bq = AC.createBiquadFilter();
      bq.type = 'lowpass'; bq.frequency.value = o.lp;
      node.connect(bq); node = bq;
    }
    node.connect(g); g.connect(o.dst || masterGain);
    osc.start(t0); osc.stop(t0 + d + 0.02);
  } catch (e) { }
}
/* --- gürültü: su sıçraması, satır darbesi, kepenk --- */
var _noiseBuf = null;
function noiseBuffer() {
  if (_noiseBuf) return _noiseBuf;
  var n = Math.floor(AC.sampleRate * 0.5);
  _noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
  var ch = _noiseBuf.getChannelData(0);
  for (var i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
  return _noiseBuf;
}
function noise(d, v, o) {
  if (!soundOn || !ensureAudio()) return;
  o = o || {};
  try {
    var t0 = AC.currentTime + (o.at || 0);
    var src = AC.createBufferSource(); src.buffer = noiseBuffer();
    var bq = AC.createBiquadFilter();
    bq.type = o.type || 'lowpass';
    bq.frequency.setValueAtTime(o.f || 1200, t0);
    if (o.to) bq.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), t0 + d);
    bq.Q.value = o.q || 1;
    var g = AC.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.connect(bq); bq.connect(g); g.connect(o.dst || masterGain);
    src.start(t0); src.stop(t0 + d + 0.02);
  } catch (e) { }
}
function melody(notes, type, v, lp) {
  for (var i = 0; i < notes.length; i++)
    tone(notes[i][0], notes[i][1], type || 'square', v === undefined ? 0.4 : v, { at: notes[i][2], lp: lp || 2400 });
}

/* =========================================================
   MÜZİK — "İskele Türküsü" (v0.3)
   Kendi bestemiz; dosya yok, Web Audio ile çalınır → telif sorunu yok.
   Re minör, 132 BPM, 16 ölçü (A · A' · B · B'), Karadeniz havası:
   kare dalga melodi, üçgen bas (sallanan "yürüyen" figür), hafif davul.
   Hikâye + ana menüde çalar; oyuna girince yumuşakça susar.
   ========================================================= */
var SONG = {
  bpm: 132,
  /* [midi, sekizlik sayısı] — 0 = sus */
  lead: [
    [69,2],[74,2],[72,1],[69,1],[67,2],  [65,2],[67,1],[69,1],[67,2],[64,2],
    [62,2],[65,2],[69,2],[74,2],         [72,3],[70,1],[69,4],
    [69,2],[74,2],[72,1],[69,1],[67,2],  [65,2],[67,1],[69,1],[70,2],[69,2],
    [67,2],[65,1],[64,1],[62,2],[64,2],  [62,6],[0,2],
    [74,1],[74,1],[76,1],[77,1],[76,2],[74,2],  [72,1],[72,1],[74,1],[76,1],[74,2],[72,2],
    [70,1],[70,1],[72,1],[74,1],[72,2],[70,2],  [69,2],[67,2],[69,4],
    [74,1],[74,1],[76,1],[77,1],[79,2],[77,2],  [76,1],[74,1],[72,1],[70,1],[69,2],[67,2],
    [65,2],[67,2],[69,2],[64,2],                 [62,6],[0,2]
  ],
  /* ölçü başına bas kökü (MIDI) */
  bass: [38, 36, 38, 33,  38, 34, 33, 38,  34, 36, 31, 33,  34, 41, 33, 38]
};
var music = { on: false, timer: 0, next: 0, li: 0, lt: 0, bar: 0, step: 0, gain: null, wantOn: false, mode: 'menu' };
var musicEnabled = true;                       /* ayarlar › müzik (tercihlere yazılır) */
var MUSIC_VOL = { menu: 0.55, game: 0.2 };
function midiF(m) { return 440 * Math.pow(2, (m - 69) / 12); }
/* iki kip: 'menu' = tam düzenleme (kare dalga melodi, bas, davul);
   'game' = arkadan mırıldanma (yumuşak sinüs melodi + alçak oktav, seyrek bas, davul yok) */
function musicTick() {
  if (!music.on || !AC || AC.state !== 'running') return;
  var e8 = 60 / SONG.bpm / 2, horizon = AC.currentTime + 0.25, hum = music.mode === 'game';
  if (music.next < AC.currentTime) music.next = AC.currentTime + 0.05;
  while (music.next < horizon) {
    var t = music.next, at = t - AC.currentTime, st = music.step % 8;
    /* melodi */
    if (music.lt <= 0) {
      var n = SONG.lead[music.li];
      music.li = (music.li + 1) % SONG.lead.length;
      music.lt = n[1];
      if (n[0]) {
        if (hum) {
          tone(midiF(n[0]), e8 * n[1] * 0.98, 'sine', 0.3, { at: at, atk: 0.05, dst: music.gain });
          tone(midiF(n[0] - 12), e8 * n[1] * 0.98, 'triangle', 0.1, { at: at, atk: 0.06, lp: 900, dst: music.gain });
        } else tone(midiF(n[0]), e8 * n[1] * 0.92, 'square', 0.16, { at: at, lp: 2300, atk: 0.012, dst: music.gain });
      }
    }
    music.lt--;
    var root = SONG.bass[music.bar % SONG.bass.length];
    if (hum) {
      if (st === 0) tone(midiF(root), e8 * 3.6, 'triangle', 0.22, { at: at, lp: 500, atk: 0.04, dst: music.gain });
    } else {
      /* bas: kök · · kök oktav · beşli · */
      var bn = st === 0 || st === 3 ? root : st === 4 ? root + 12 : st === 6 ? root + 7 : 0;
      if (bn) tone(midiF(bn), e8 * 0.9, 'triangle', 0.34, { at: at, lp: 900, dst: music.gain });
      /* davul: 1 ve 3'te tok vuruş, ara sekizliklerde hafif zil */
      if (st === 0 || st === 4) tone(110, 0.12, 'sine', 0.3, { at: at, to: 45, dst: music.gain });
      if (st % 2 === 1) noise(0.04, 0.035, { f: 7000, type: 'highpass', at: at, dst: music.gain });
      if (st === 4 && music.bar % 2) noise(0.09, 0.05, { f: 1800, to: 700, q: 0.8, at: at, dst: music.gain });
    }
    music.next += e8; music.step++;
    if (music.step % 8 === 0) music.bar++;
  }
}
function musicPlay(mode) {
  music.mode = mode || (S.started ? 'game' : 'menu');
  music.wantOn = true;
  if (!musicEnabled || !ensureAudio()) return;
  try {
    if (!music.gain) { music.gain = AC.createGain(); music.gain.gain.value = 0.0001; music.gain.connect(masterGain); }
    var g = music.gain.gain, now = AC.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.exponentialRampToValueAtTime(MUSIC_VOL[music.mode], now + (music.on ? 1.8 : 1.2));
  } catch (e) { return; }
  if (!music.on) { music.on = true; music.li = 0; music.lt = 0; music.bar = 0; music.step = 0; music.next = AC.currentTime + 0.1; }
  if (!music.timer) music.timer = setInterval(musicTick, 60);
}
function musicStop(fade) {
  music.wantOn = false;
  if (!music.on) return;
  music.on = false;
  try {
    var g = music.gain.gain, t = AC.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.exponentialRampToValueAtTime(0.0001, t + (fade || 0.8));
  } catch (e) { }
}
function setMusicEnabled(on) {
  musicEnabled = !!on;
  if (musicEnabled) musicPlay(); else musicStop(0.5);
}
/* tarayıcı sesi ilk dokunuşta açar: müzik o anda başlar (menüde tam, oyunda mırıldanma) */
['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
  window.addEventListener(ev, function () {
    if (!music.on && musicEnabled && !intro.on) setTimeout(function () { if (!music.on && musicEnabled && !intro.on) musicPlay(); }, 60);
  }, { passive: true });
});

var sfx = {
  /* ürün alma: kısa, yumuşak blip */
  pick: function () { tone(640 + Math.random() * 90, 0.07, 'triangle', 0.34, { lp: 2600, to: 880 }); },
  /* bırakma: alçak tok ses */
  drop: function () { tone(210, 0.09, 'sine', 0.42, { to: 140 }); noise(0.05, 0.10, { f: 700, to: 200 }); },
  /* ağdan balık: su sıçraması */
  splash: function () { noise(0.22, 0.16, { f: 2400, to: 300, q: 0.7 }); tone(420, 0.10, 'sine', 0.18, { to: 260 }); },
  /* satır darbesi */
  chop: function () { noise(0.07, 0.15, { f: 3000, to: 900, q: 1.4 }); tone(180, 0.05, 'square', 0.16, { lp: 900 }); },
  /* para: iki notalık parlak arpej */
  coin: function () { melody([[880, 0.07, 0], [1320, 0.11, 0.055]], 'triangle', 0.42, 3200); },
  /* satın alma: yükselen üçlü */
  buy: function () { melody([[523, 0.08, 0], [659, 0.08, 0.06], [784, 0.14, 0.12]], 'triangle', 0.36, 3000); },
  /* inşaat: tok vuruş + yükseliş */
  build: function () {
    noise(0.16, 0.18, { f: 900, to: 160, q: 0.8 });
    melody([[196, 0.12, 0.02], [262, 0.12, 0.11], [392, 0.2, 0.2]], 'triangle', 0.34, 2000);
  },
  /* hata / kayıp müşteri: inen sert ton */
  bad: function () { tone(220, 0.26, 'sawtooth', 0.26, { to: 90, lp: 1100 }); },
  /* itibar / başarı fanfarı */
  /* seviye atlama: kısa, parlak fanfar (star'dan uzun ama oyunu bölmez) */
  levelUp: function () {
    melody([[523, 0.09, 0], [659, 0.09, 0.08], [784, 0.09, 0.16], [1047, 0.12, 0.24], [784, 0.08, 0.38], [1047, 0.34, 0.46]], 'square', 0.28, 2600);
    melody([[262, 0.2, 0], [330, 0.2, 0.24], [392, 0.5, 0.46]], 'triangle', 0.3, 1400);
    noise(0.3, 0.06, { f: 6000, to: 2000, type: 'highpass', at: 0.46 });
  },
  star: function () { melody([[659, 0.08, 0], [784, 0.08, 0.07], [988, 0.08, 0.14], [1319, 0.22, 0.21]], 'triangle', 0.4, 3600); },
  /* müşteri geldi: nazik iki nota */
  cust: function () { melody([[523, 0.06, 0], [698, 0.09, 0.05]], 'sine', 0.2, 2400); },
  /* arayüz dokunuşu */
  tap: function () { tone(880, 0.035, 'triangle', 0.2, { lp: 3000 }); },
  /* anahtar aç/kapa */
  sw: function (on) {
    if (on) melody([[600, 0.05, 0], [900, 0.07, 0.04]], 'triangle', 0.3, 2800);
    else melody([[700, 0.05, 0], [420, 0.08, 0.04]], 'triangle', 0.28, 2000);
  },
  /* gün başlangıcı: sabah motifi */
  dayIn: function () { melody([[392, 0.14, 0], [523, 0.14, 0.12], [659, 0.26, 0.24]], 'sine', 0.3, 2600); },
  /* gün sonu: akşam motifi */
  dayOut: function () { melody([[523, 0.16, 0], [440, 0.16, 0.14], [349, 0.3, 0.28]], 'sine', 0.3, 2200); },
  /* mezat çanı */
  bell: function () {
    tone(1568, 0.6, 'sine', 0.26, { atk: 0.002, lp: 5000 });
    tone(2093, 0.45, 'sine', 0.12, { atk: 0.002, at: 0.01 });
  },
  /* balık pazarı günü açılışı */
  market: function () { melody([[523, 0.1, 0], [659, 0.1, 0.09], [784, 0.1, 0.18], [1047, 0.3, 0.27]], 'square', 0.26, 2600); }
};
/* --- çok hafif liman ortam sesi: dalga soluğu (yalnız tam seste) --- */
var ambT = 0;
function updateAmbient(dt) {
  if (volLvl < 2 || !soundOn || !audioReady) return;
  ambT -= dt;
  if (ambT > 0) return;
  ambT = rnd(5.5, 9.5);
  noise(2.2, 0.030, { f: 520, to: 180, q: 0.5 });          /* kıyıya vuran dalga */
  if (Math.random() < 0.28) {                                /* uzakta martı */
    var f0 = rnd(900, 1150);
    tone(f0, 0.10, 'triangle', 0.045, { to: f0 * 1.5, lp: 2600 });
    tone(f0 * 1.4, 0.09, 'triangle', 0.035, { at: 0.13, to: f0, lp: 2600 });
  }
}

/* =========================================================
   İÇERİK
   ========================================================= */
var FISH = {
  hamsi:   { id: 'hamsi', ic: '🐟',   n: { tr: 'Hamsi', en: 'Anchovy' },   r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.42, out: 1, val: 6,  col: '#8fa9bd', bel: '#d7e4ee', meat: '#dfe9f0' },
  uskumru: { id: 'uskumru', ic: '🐠', n: { tr: 'Uskumru', en: 'Mackerel' }, r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.62, out: 1, val: 12, col: '#5f8f8a', bel: '#cfe6df', meat: '#bfe0d6' },
  palamut: { id: 'palamut', ic: '🐡', n: { tr: 'Palamut', en: 'Bonito' },   r: { tr: 'Orta', en: 'Uncommon' }, w: 1, cut: 0.72, out: 2, val: 18, col: '#6f8fa8', bel: '#dbe9f2', meat: '#d2856b' },
  levrek:  { id: 'levrek', ic: '🎣',  n: { tr: 'Levrek', en: 'Sea Bass' },  r: { tr: 'Orta', en: 'Uncommon' }, w: 1, cut: 0.85, out: 2, val: 24, col: '#a8b6c2', bel: '#eef5f9', meat: '#eaf2f7' },
  somon:   { id: 'somon', ic: '🍣',   n: { tr: 'Somon', en: 'Salmon' },     r: { tr: 'Orta', en: 'Uncommon' }, w: 2, cut: 1.10, out: 3, val: 34, col: '#d98455', bel: '#f7c9a4', meat: '#f08a3c' },
  ton:     { id: 'ton', ic: '🐋',     n: { tr: 'Orkinos', en: 'Tuna' },     r: { tr: 'Nadir', en: 'Rare' },    w: 3, cut: 1.70, out: 5, val: 46, col: '#3f6a8c', bel: '#9fc0d8', meat: '#b8453f' }
};
var FISH_ORDER = ['hamsi', 'uskumru', 'palamut', 'levrek', 'somon', 'ton'];

/* =========================================================
   BALIK HATTI  (balık ↔ tezgâh ↔ üretim noktası 1:1 eşleme)
   Sıra doğrudan ilerleme sırasıdır; tek tablodan değiştirilir.
   ========================================================= */
var LINES = [
  { f: 'hamsi',   stall: 'b0',  src: 0, w: 1.0 },   /* Balıkçı İskelesi tezgâhı — başlangıç */
  { f: 'uskumru', stall: 'b1',  src: 1, w: 1.0 },   /* Balık Pazarı tezgâhı */
  { f: 'palamut', stall: 'ss3', src: 1, w: 0.8 },   /* Pazar yapı noktası tezgâhı */
  { f: 'levrek',  stall: 'b2',  src: 2, w: 0.8 },   /* Fümehane tezgâhı */
  { f: 'somon',   stall: 'ss6', src: 2, w: 0.6 },   /* Fümehane yapı noktası tezgâhı */
  { f: 'ton',     stall: 'hal', src: 1, w: 0.45 }   /* Kapalı Balık Hali — prestij hattı */
];
function lineOf(f) { for (var i = 0; i < LINES.length; i++) if (LINES[i].f === f) return LINES[i]; return null; }
/* =========================================================
   BÖLGE (ZONE) — v2.1
   Bir bölge = bir ağ + o ağın kesim masası + o ağdan çıkan türlerin tezgâhları.
   Bölge indeksi = ağ indeksi = kesim masası indeksi = AREA indeksi.
   Hamal/filetocu/tezgâhtar yalnız kendi bölgesinde çalışır; bir bölgenin
   kesim masasına başka bölgenin balığı konulamaz.
   ========================================================= */
var ZONE_ROLES = ['hamal', 'filetocu', 'tezgahtar', 'kasiyer'];
function zoneCount() { return spots.length; }
function zoneOpen(z) { return z >= 0 && z < spots.length && !AREAS[spots[z].z].locked; }
function zoneName(z) { return zoneOpen(z) || AREAS[z] ? NM(AREAS[z].n) : '?'; }
function zoneOfFish(f) { var l = lineOf(f); return l ? l.src : -1; }
function zoneFish(z) {
  var out = [];
  for (var i = 0; i < LINES.length; i++) if (LINES[i].src === z) out.push(LINES[i].f);
  return out;
}
function zoneSpot(z) { return spots[z] || null; }
function zoneTable(z) { return tables[z] || null; }
function tableZone(tb) { return tables.indexOf(tb); }
/* Kesim masası yalnız kendi bölgesinin balığını kabul eder (§ karmaşa önlenir) */
function tableAccepts(tb, it) {
  if (!it || it.k !== 'fish') return false;
  return zoneOfFish(it.f) === tableZone(tb);
}
function tableFishNames(tb) {
  var z = tableZone(tb), fs = zoneFish(z), out = [];
  for (var i = 0; i < fs.length; i++) if (canProduce(fs[i])) out.push(NM(FISH[fs[i]].n));
  return out;
}
function stallName(k) { return T('st' + k.toUpperCase()); }
function lineByStall(k) { for (var i = 0; i < LINES.length; i++) if (LINES[i].stall === k) return LINES[i]; return null; }
/* Tezgâh yalnız oyuncu açtıysa çalışır: kurulu ama kapalı tezgâha müşteri gelmez. */
function stallOf(f) {
  var l = lineOf(f); if (!l) return null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (c.key === l.stall && !AREAS[c.z].locked && c.open) return c;
  }
  return null;
}
/* kurulu ama henüz açılmamış tezgâh (satın alma listesi için) */
function stallBuilt(f) {
  var l = lineOf(f); if (!l) return null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (c.key === l.stall && !AREAS[c.z].locked) return c;
  }
  return null;
}
/* v2.3 — İlk tezgâh (hamsi) her zaman açık; ikinciden itibaren oyuncu
   ücretsiz bir aç/kapat anahtarıyla hangi hattın çalışacağını seçer.
   Kapalı hat: müşteri gelmez, ağ o türü üretmez, çalışan oraya taşımaz. */
var FIRST_STALL = 'b0';
function isFirstStall(c) { return c && c.key === FIRST_STALL; }
/* İlk tezgâh HER ZAMAN açık olmalı: kapalıysa hamsi satılamaz, ağ balık üretmez
   ve oyun hiç başlamaz. Bu yüzden yalnız kayıt yüklenirken değil, tezgâhlar her
   yeniden kurulduğunda çağrılır; ayrıca hiçbir tezgâh açık değilse ilkini açar. */
function openStarterStall() {
  var i, ilk = null, acikVar = false;
  for (i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (AREAS[c.z].locked) continue;
    if (isFirstStall(c)) { c.open = true; acikVar = true; }
    if (c.open) acikVar = true;
    if (!ilk && c.fish) ilk = c;
  }
  if (!acikVar && ilk) ilk.open = true;      /* güvenlik ağı: en az bir tezgâh açık kalsın */
}
/* anahtarı gösterilecek tezgâhlar: kurulu, bölgesi açık, ağı ve kesimi hazır */
function switchableStalls() {
  var out = [];
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (AREAS[c.z].locked || !c.fish || isFirstStall(c)) continue;
    if (!canProduce(c.fish) || !canProcess('fileto', c.fish)) continue;
    out.push(c);
  }
  return out;
}
function setStall(c, on) {
  if (!c || isFirstStall(c)) return false;
  if (c.open === !!on) return false;
  c.open = !!on;
  if (c.open) { c.spawnT = 4; addPuff(c.x, c.y, '#5fd37a'); }
  else {                                    /* kapatınca bekleyen müşteriler dağılır */
    for (var j = customers.length - 1; j >= 0; j--)
      if (customers[j].c === c && customers[j].state !== 'leave') { customers[j].state = 'leave'; customers[j].happyLeave = true; customers[j].leaveT = 0; }
    for (var k = 0; k < c.slots.length; k++) c.slots[k] = null;
  }
  rebuildCounters(); reassignWorkers(); save();
  return true;
}
function toggleStall(c) { return setStall(c, !c.open); }
/* yeni kurulan bir tezgâh hakkında oyuncu henüz karar vermedi mi */
function undecidedStalls() {
  var out = [], list = switchableStalls();
  for (var i = 0; i < list.length; i++) if (!list[i].open && !list[i].seen) out.push(list[i]);
  return out;
}
function markStallsSeen() {
  var list = switchableStalls();
  for (var i = 0; i < list.length; i++) list[i].seen = true;
}
/* üç koşul (spec): üretim noktası + işleme hattı + satış tezgâhı */
function canProduce(f) {
  var l = lineOf(f); if (!l) return false;
  var sp = spots[l.src];
  return !!sp && !AREAS[sp.z].locked;
}
function canProcess(k, f) {
  if (!openTables().length) return false;
  if (k === 'fume') return !AREAS[smoker.z].locked;
  return true;
}
function canSell(f) { return !!stallOf(f); }
function fishReady(f) { return canProduce(f) && canProcess('fileto', f) && canSell(f); }
function sellableFish() {
  var out = [];
  for (var i = 0; i < LINES.length; i++) if (fishReady(LINES[i].f)) out.push(LINES[i].f);
  return out;
}
var FUME_MUL = 2.4, FUME_TIME = 3.2;
function prodName(k, f) { return NM(FISH[f].n) + (k === 'fume' ? (lang === 'tr' ? ' Füme' : ' Smoked') : (lang === 'tr' ? ' Fileto' : ' Fillet')); }
function prodValue(k, f) { return Math.round(FISH[f].val * (k === 'fume' ? FUME_MUL : 1) * (1 + S.priceLvl * 0.1) * (1 + perkSum('value') + servEff('value') + slotEff(null, 'value'))); }
function itemW(it) { return it.k === 'fish' ? FISH[it.f].w : 1; }

var ROLES = {
  hamal:     { id: 'hamal',     n: { tr: 'Hamal', en: 'Porter' },     icon: '🧺', wage: 15, speed: 2.4, cap: 8,  price: 360, zone: true,  d: { tr: 'Ağdan kesime taşır', en: 'Net → cutting table' } },
  filetocu:  { id: 'filetocu',  n: { tr: 'Filetocu', en: 'Filleter' }, icon: '🔪', wage: 19, speed: 2.3, cap: 4,  price: 520, zone: true,  d: { tr: 'Masayı %55 hızlandırır', en: 'Table 55% faster' } },
  tezgahtar: { id: 'tezgahtar', n: { tr: 'Tezgâhtar', en: 'Vendor' },  icon: '🐟', wage: 22, speed: 2.5, cap: 8,  price: 700, zone: true,  d: { tr: 'Siparişi tezgâha taşır', en: 'Goods → stall' } },
  /* v0.5 — Tahsildar: kendi bölgesinin tezgâh kasalarını boşaltıp parayı Ana Kasa'ya yürüyerek taşır */
  kasiyer:   { id: 'kasiyer',   n: { tr: 'Tahsildar', en: 'Collector' }, icon: '💰', wage: 17, speed: 2.6, cap: 10, price: 620, zone: true, d: { tr: 'Tezgâh kasası → Ana Kasa', en: 'Stall cash → main safe' } }
};
var WNAMES = ['Hasan', 'Kerim', 'Zeynep', 'Mert', 'Deniz', 'Ayla', 'Tarık', 'Elif', 'Cem', 'Nur', 'Osman', 'Sevgi'];

var CUST = [
  { id: 'isci',   n: { tr: 'İşçi', en: 'Worker' },    coat: '#3f6fb0', coat2: '#335c93', qty: [2, 4],  pat: 54,  mult: 1.00, rep: 1, lvl: 1, tag: 'cheap' },
  { id: 'aile',   n: { tr: 'Aile', en: 'Family' },    coat: '#c8553d', coat2: '#a94430', qty: [4, 7],  pat: 80,  mult: 1.05, rep: 1, lvl: 1, tag: 'any' },
  { id: 'esnaf',  n: { tr: 'Esnaf', en: 'Merchant' }, coat: '#7b5ea7', coat2: '#674d8e', qty: [3, 5],  pat: 50,  mult: 1.35, rep: 2, lvl: 2, tag: 'rich' },
  { id: 'sef',    n: { tr: 'Şef', en: 'Chef' },       coat: '#f2efe6', coat2: '#dcd8cb', qty: [3, 4],  pat: 32,  mult: 1.80, rep: 2, lvl: 3, tag: 'premium', pen: 1 },
  { id: 'kaptan', n: { tr: 'Kaptan', en: 'Captain' }, coat: '#1f4e6b', coat2: '#173d55', qty: [8, 14], pat: 120, mult: 1.25, rep: 3, lvl: 3, tag: 'any' },
  { id: 'vip',    n: { tr: 'VIP', en: 'VIP' },        coat: '#d4a029', coat2: '#b8881c', qty: [2, 3],  pat: 28,  mult: 3.00, rep: 3, lvl: 5, tag: 'fume', pen: 2 },
  /* v0.4 — hizmet binalarıyla açılan tipler (§35.3, §35.4) */
  { id: 'toptanci', n: { tr: 'Toptancı', en: 'Wholesaler' }, coat: '#4a7a3a', coat2: '#3a6230', qty: [10, 18], pat: 115, mult: 1.45, rep: 3, lvl: 1, tag: 'any', serv: 'toptanci' },
  { id: 'turist',   n: { tr: 'Turist', en: 'Tourist' },      coat: '#e0679e', coat2: '#c4507f', qty: [2, 4],   pat: 62,  mult: 1.60, rep: 2, lvl: 1, tag: 'any', serv: 'turist' }
];

var EVENTS = [
  { id: 'suru', name: 'evShoal', icon: '🐟', dur: 34, fishMul: 2.2, custMul: 1.0, msg: 'evShoalM' },
  { id: 'gemi', name: 'evShip',  icon: '🚢', dur: 38, fishMul: 1.0, custMul: 2.2, msg: 'evShipM' },
  { id: 'kar',  name: 'evStorm', icon: '🌊', dur: 30, fishMul: 1.0, custMul: 0.45, msg: 'evStormM' }
];
/* v0.3 — itibar = seviye sistemi. Eşikler mevcut kilitlere hizalı (Pazar 10, Fümehane 30,
   Ofis 40, Lisans 90). Her seviye: satış primi +%2 ve "un" listesindeki açılımlar. */
var REP_LEVELS = [
  { need: 0,   t: { tr: 'Çırak Balıkçı', en: 'Apprentice' }, un: [] },
  { need: 10,  t: { tr: 'Tayfa', en: 'Deckhand' },
    un: [{ tr: 'Balık Pazarı bölgesi', en: 'Fish Market area' }, { tr: 'Esnaf müşteriler', en: 'Merchant customers' }] },
  { need: 30,  t: { tr: 'İskele Esnafı', en: 'Pier Trader' },
    un: [{ tr: 'Fümehane bölgesi', en: 'Smokehouse area' }, { tr: 'Şef ve Kaptan müşteriler', en: 'Chef & Captain customers' }, { tr: 'Reklam Panosu', en: 'Billboard' }] },
  { need: 40,  t: { tr: 'Tezgâh Ustası', en: 'Stall Master' },
    un: [{ tr: 'Ticaret Ofisi', en: 'Trade Office' }, { tr: 'Ek Tezgâh', en: 'Extra Stall' }] },
  { need: 60,  t: { tr: 'Pazar Ustası', en: 'Market Master' },
    un: [{ tr: 'VIP müşteriler', en: 'VIP customers' }, { tr: 'Ağ Vinci', en: 'Net Crane' }, { tr: 'Osmanlı Çeşmesi', en: 'Ottoman Fountain' }] },
  { need: 90,  t: { tr: 'Kaptan', en: 'Captain' },
    un: [{ tr: 'Holding lisansı', en: 'Holding license' }, { tr: 'Balık Heykeli', en: 'Fish Statue' }] },
  { need: 130, t: { tr: 'Reis', en: 'Skipper' }, un: [{ tr: 'Mendirek Feneri', en: 'Breakwater Lighthouse' }] },
  { need: 180, t: { tr: 'Liman İşletmecisi', en: 'Harbor Operator' }, un: [] },
  { need: 250, t: { tr: 'Liman Ağası', en: 'Harbor Lord' }, un: [] },
  { need: 350, t: { tr: 'Karadeniz Efsanesi', en: 'Black Sea Legend' }, un: [] }
];
function levelForRep(n) { var l = 1; for (var i = 0; i < REP_LEVELS.length; i++) if (n >= REP_LEVELS[i].need) l = i + 1; return l; }
function repBonus() { return (repLevel() - 1) * 0.02; }        /* seviye başına satış primi */

/* ---------------- AREA (GDD §20-21) ---------------- */
var AREAS = [
  { id: 'iskele', n: { tr: 'Balıkçı İskelesi', en: 'Fishing Pier' }, x0: 0, y0: 0,  x1: 10, y1: 6,    locked: false, cost: 0,    rep: 0,  lvl: 1, up: [0, 1100, 3400] },
  { id: 'pazar',  n: { tr: 'Balık Pazarı', en: 'Fish Market' },      x0: 0, y0: 6,  x1: 10, y1: 12,   locked: true,  cost: 1300, rep: 10, lvl: 1, up: [0, 2400, 6800] },
  { id: 'fume',   n: { tr: 'Fümehane', en: 'Smokehouse' },           x0: 0, y0: 12, x1: 10, y1: 17.5, locked: true,  cost: 4600, rep: 30, lvl: 1, up: [0, 4200, 11000] }
];
var MAXLV = 3;
function areaOf(i) { return AREAS[i]; }
function areaNetMul(z) { return 1 + (AREAS[z].lvl - 1) * 0.18 + (slotEff(z, 'netrate') || 0) + perkSum('netrate') + perkSum('rate'); }
function areaStock(z) { return 12 + (AREAS[z].lvl - 1) * 3 + (slotEff(z, 'stock') || 0) + Math.round(perkSum('stock') * 0.5) + servEff('stock'); }
function areaFlow(z) { return 1 + (slotEff(z, 'flow') || 0) + (project.done ? 0.25 : 0) + perkSum('flow'); }
function queueMax(z) { return Math.min(7, (AREAS[z].lvl >= 3 ? 5 : 4) + servEff('queue')); }

/* ---------------- yapı noktaları (GDD §22) ---------------- */
var BUILDINGS = [
  { id: 'kulube', cat: 'personel', n: { tr: 'Personel Kulübesi', en: 'Staff Hut' }, icon: '🏚️', cost: 1500, eff: 'staff',   val: 1,    d: { tr: 'Personel limiti +1', en: 'Staff limit +1' } },
  { id: 'cay',    cat: 'personel', n: { tr: 'Çay Ocağı', en: 'Tea Stove' },        icon: '🫖', cost: 900,  eff: 'wspeed',  val: 0.12, d: { tr: 'Çıraklar %12 hızlı', en: 'Workers 12% faster' } },
  { id: 'tezgah', cat: 'ticaret',  n: { tr: 'Ek Tezgâh', en: 'Extra Stall' },      icon: '🐟', cost: 2200, lv: 4, eff: 'counter', val: 1,    d: { tr: 'Yeni satış noktası', en: 'New sales point' } },
  { id: 'pano',   cat: 'ticaret',  n: { tr: 'Reklam Panosu', en: 'Billboard' },    icon: '📣', cost: 1400, lv: 3, eff: 'flow',    val: 0.3,  d: { tr: 'Müşteri akışı +%30', en: 'Customer flow +30%' } },
  { id: 'depo',   cat: 'lojistik', n: { tr: 'Depo Kulübesi', en: 'Depot Shed' },   icon: '📦', cost: 1700, eff: 'stock',   val: 6,    d: { tr: 'Bölge stoğu +6', en: 'Local stock +6' } },
  { id: 'vinc',   cat: 'lojistik', n: { tr: 'Ağ Vinci', en: 'Net Crane' },         icon: '🏗️', cost: 2600, lv: 5, eff: 'netrate', val: 0.25, d: { tr: 'Bölge ağı %25 hızlı', en: 'Nets here 25% faster' } }
];
function bdef(id) { for (var i = 0; i < BUILDINGS.length; i++) if (BUILDINGS[i].id === id) return BUILDINGS[i]; return null; }
var SLOTS = [
  { id: 's1', z: 0, x: 7.6, y: 1.2,  req: 1, cats: ['personel', 'lojistik'], b: null },
  { id: 's2', z: 0, x: 4.2, y: 5.2,  req: 3, cats: ['personel', 'lojistik'], b: null },
  { id: 's3', z: 1, x: 8.6, y: 7.6,  req: 1, cats: ['ticaret', 'lojistik'],  b: null },
  { id: 's4', z: 1, x: 2.6, y: 11.0, req: 1, cats: ['personel', 'lojistik'], b: null },
  { id: 's5', z: 1, x: 4.8, y: 9.2,  req: 3, cats: ['ticaret', 'personel'],  b: null },
  { id: 's6', z: 2, x: 8.6, y: 13.2, req: 1, cats: ['ticaret', 'lojistik'],  b: null },
  { id: 's7', z: 2, x: 6.0, y: 14.8, req: 3, cats: ['personel', 'lojistik'], b: null }
];
function slotActive(s) { return !AREAS[s.z].locked && AREAS[s.z].lvl >= s.req; }
function slotEff(z, eff) {
  var v = 0;
  for (var i = 0; i < SLOTS.length; i++) {
    var s = SLOTS[i];
    if (!s.b || !slotActive(s)) continue;
    if (z !== undefined && z !== null && s.z !== z) continue;
    var d = bdef(s.b);
    if (d && d.eff === eff) v += d.val;
  }
  return v;
}
/* v2.1 — personel artık bölge bazlı: her açık bölge kendi kadrosunu taşır.
   Taban 1 kişi, bölge seviyesi başına +1, o bölgedeki Personel Kulübesi +1. */
/* Bölgede açık olan her tezgâh bir personel hakkı verir: bir bölgeden kaç hat
   geçiyorsa o kadar kişi alınabilir. Üstüne bölge seviyesi ve Personel Kulübesi. */
function zoneOpenStalls(z) {
  var n = 0;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (c.open && c.fish && !AREAS[c.z].locked && zoneOfFish(c.fish) === z) n++;
  }
  return n;
}
/* v0.5: bölge kadrosu 4 rolü kapsar (hamal, filetocu, tezgâhtar, tahsildar).
   Taban 2, bölge seviyesi ve ek tezgâhlar +1'er; tam otomasyon (4 kişi) Sv3 bölge ya da kulübeyle açılır. */
function zoneStaffCap(z) {
  if (!zoneOpen(z)) return 0;
  return 2 + Math.max(0, zoneOpenStalls(z) - 1) + (AREAS[z].lvl - 1) + slotEff(z, 'staff');
}
function zoneStaff(z) {
  var n = 0;
  for (var i = 0; i < workers.length; i++)
    if (workers[i].zone === z && ZONE_ROLES.indexOf(workers[i].role) >= 0) n++;
  return n;
}
function zoneFree(z) { return Math.max(0, zoneStaffCap(z) - zoneStaff(z)); }
function roleCount(r) { var n = 0; for (var i = 0; i < workers.length; i++) if (workers[i].role === r) n++; return n; }
/* toplam kadro (yalnız gösterim için) */
function staffCap() {
  var n = 0;
  for (var z = 0; z < zoneCount(); z++) n += zoneStaffCap(z);
  return n;
}
function hireCost(role, z) {
  var base = ROLES[role].price || 500;
  var have = zoneStaff(z);
  return upCost(Math.round(base * Math.pow(1.85, have) * (1 + (z || 0) * 0.35)));
}
function workerSpeedMul() { return 1 + slotEff(null, 'wspeed') + perkSum('wspeed') + servEff('wspeed'); }

/* ---------------- büyük proje (GDD §23) ---------------- */
var project = {
  id: 'hal', z: 1, x: 7.0, y: 8.6, w: 2.6, h: 2.2,
  n: { tr: 'Kapalı Balık Hali', en: 'Covered Fish Hall' },
  total: 26000, inv: 0, stage: 0, done: false,
  stages: [0.10, 0.30, 0.60, 0.80, 1.0]
};
function projPct() { return clamp(project.inv / project.total, 0, 1); }
function projStageOf(p) { var st = 0; for (var i = 0; i < project.stages.length; i++) if (p >= project.stages[i] - 0.0001) st = i + 1; return st; }

/* ---------------- kozmetik (GDD §24) ---------------- */
/* v0.3 — süsler tezgâh bölgelerinden çıkarıldı: batı kıyı şeridi (x<0), iskele önü su ve güney
   kumsal. decorClearance() fonksiyonel nesnelere en az 1.2 kare mesafeyi doğrular. */
var DECOR = [
  { id: 'bayrak', z: 0, x: -0.35, y: 0.3,  cost: 600,  n: { tr: 'Bayrak Direği', en: 'Flag Pole' },   icon: '🇹🇷', got: false },
  { id: 'tekne',  z: 0, x: 4.2, y: -1.25, cost: 1300, n: { tr: 'Balıkçı Teknesi', en: 'Fishing Boat' }, icon: '⛵', got: false },
  { id: 'bank',   z: 0, x: -0.35, y: 3.4,  cost: 400,  n: { tr: 'Bank', en: 'Bench' },                icon: '🪑', got: false },
  { id: 'simit',  z: 1, x: -0.35, y: 9.2,  cost: 900,  n: { tr: 'Simit Arabası', en: 'Simit Cart' },  icon: '🥯', got: false },
  { id: 'lamba',  z: 1, x: -0.35, y: 11.6, cost: 700,  n: { tr: 'Sokak Lambası', en: 'Street Lamp' }, icon: '💡', got: false },
  { id: 'cicek',  z: 1, x: -0.35, y: 6.5,  cost: 500,  n: { tr: 'Begonvil', en: 'Bougainvillea' },    icon: '🌺', got: false },
  { id: 'caymasa', z: 2, x: 1.6, y: 18.6, cost: 800, n: { tr: 'Çay Masası', en: 'Tea Table' },      icon: '☕', got: false },
  { id: 'heykel', z: 2, x: 5.2, y: 18.9, cost: 2600, n: { tr: 'Balık Heykeli', en: 'Fish Statue' }, icon: '🗿', lv: 6, got: false },
  /* v2.0 — Anadolu kıyı kültürü */
  { id: 'nazar',  z: 0, x: 7.4, y: -0.4,  cost: 450,  n: { tr: 'Nazar Boncuğu', en: 'Evil Eye Charm' }, icon: '🧿', got: false },
  { id: 'cesme',  z: 1, x: -0.45, y: 7.9, cost: 1500, n: { tr: 'Osmanlı Çeşmesi', en: 'Ottoman Fountain' }, icon: '⛲', lv: 5, got: false },
  { id: 'kilim',  z: 1, x: -0.35, y: 10.4,  cost: 800,  n: { tr: 'Kilim Sergisi', en: 'Kilim Display' }, icon: '🧶', got: false },
  { id: 'fener',  z: 2, x: 8.6, y: 19.3, cost: 5200, n: { tr: 'Mendirek Feneri', en: 'Breakwater Lighthouse' }, icon: '🗼', lv: 7, got: false }
];
function decorClearance() {
  var pts = [], i, out = [];
  spots.forEach(function (o) { pts.push(['ağ', o.x, o.y]); });
  tables.forEach(function (o) { pts.push(['kesim', o.x, o.y]); pts.push(['hasır', o.mat.x, o.mat.y]); });
  counters.forEach(function (o) { pts.push(['tezgâh ' + o.key, o.x, o.y]); pts.push(['kuyruk ' + o.key, 10.8, o.y]); });
  SLOTS.forEach(function (o) { pts.push(['parsel ' + o.id, o.x, o.y]); });
  PLOTS.forEach(function (o) { pts.push(['bina ' + o.id, o.x, o.y]); });
  pts.push(['kasa', safe.x, safe.y], ['füme', smoker.x, smoker.y], ['ofis', office.x, office.y], ['hal', project.x + 1.3, project.y + 1.1]);
  for (i = 0; i < DECOR.length; i++) {
    var d = DECOR[i], best = 99, who = '';
    for (var k = 0; k < pts.length; k++) { var dd = Math.hypot(pts[k][1] - d.x, pts[k][2] - d.y); if (dd < best) { best = dd; who = pts[k][0]; } }
    out.push({ id: d.id, min: Math.round(best * 100) / 100, near: who, ok: best >= 1.2 });
  }
  return out;
}
function decorCount() { var n = 0; for (var i = 0; i < DECOR.length; i++) if (DECOR[i].got) n++; return n; }

/* =========================================================
   v0.4 — LİMAN HİZMET BİNALARI & GÖRSEL EVRİM (GDD v0.4 §31-44)
   Ana balık döngüsüne dokunmaz: kapasite / gelir / konfor katmanı.
   ========================================================= */
var SERVSCALE = 1.0;                       /* §38.1 tek global denge katsayısı */
function sCost(v) { return Math.max(1, Math.round(v * SERVSCALE)); }

/* Hizmet parselleri (§32) — yürüme koridoru ve kasa güvenli alanı dışında sabit. */
var PLOTS = [
  { id: 'p1', z: 0, x: 7.5, y: 4.4,  n: { tr: 'İskele Doğu', en: 'Pier East' },    allow: ['buzhane', 'tamirhane'], b: null },
  { id: 'p2', z: 0, x: 3.4, y: 3.3,  n: { tr: 'İskele Orta', en: 'Pier Mid' },     allow: ['buzhane', 'tamirhane'], b: null },
  { id: 'p3', z: 1, x: 1.7, y: 8.9,  n: { tr: 'Pazar Batı', en: 'Market West' },   allow: ['hal', 'restoran'], b: null },
  { id: 'p4', z: 1, x: 6.5, y: 11.2, n: { tr: 'Pazar Güney', en: 'Market South' }, allow: ['hal', 'restoran', 'nakliye'], b: null },
  { id: 'p5', z: 2, x: 1.7, y: 14.9, n: { tr: 'Depo Batı', en: 'Depot West' },     allow: ['nakliye', 'buzhane', 'yakit'], b: null },
  { id: 'p6', z: 2, x: 6.3, y: 12.6, n: { tr: 'Rıhtım Kuzey', en: 'Quay North' },  allow: ['yakit', 'nakliye', 'tersane'], b: null },
  { id: 'p7', z: 2, x: 8.7, y: 17.0, n: { tr: 'Tersane Ucu', en: 'Yard Point' },   allow: ['tersane', 'yakit', 'tamirhane'], b: null },
  /* v2.0 — kooperatif ve mezat salonu için yeni parseller */
  { id: 'p8', z: 1, x: 2.0, y: 11.4, n: { tr: 'Pazar Kuzey', en: 'Market North' },  allow: ['koop', 'mezat', 'hal'], b: null },
  { id: 'p9', z: 2, x: 8.6, y: 12.0, n: { tr: 'Hal Yanı', en: 'Hall Side' },        allow: ['mezat', 'koop', 'nakliye'], b: null }
];
function plotActive(p) { return !AREAS[p.z].locked; }
function plotById(id) { for (var i = 0; i < PLOTS.length; i++) if (PLOTS[i].id === id) return PLOTS[i]; return null; }

/* Bina kataloğu (§35). inc = servis geliri/olay, ivl = olay aralığı (sn). */
var SERV = [
  { id: 'buzhane', icon: '🧊', n: { tr: 'Buzhane', en: 'Ice House' }, acc: '#7fb7d4',
    r: { tr: 'Tezgâh arkası stok ve toplu sipariş altyapısı', en: 'Back stock for stalls and bulk orders' },
    lv: [
      { c: 900,   inc: 0,   ivl: 0,  mod: { stock: 2 },                d: { tr: '+2 arka stok / tür', en: '+2 back stock / type' },  v: { tr: 'Küçük ahşap buz kulübesi', en: 'Small wooden ice hut' } },
      { c: 2600,  inc: 0,   ivl: 0,  mod: { stock: 4 },                d: { tr: '+4 arka stok / tür', en: '+4 back stock / type' },  v: { tr: 'Yalıtımlı kulübe, metal kapı', en: 'Insulated hut, metal door' } },
      { c: 6800,  inc: 0,   ivl: 0,  mod: { stock: 6, buffer: 1 },     d: { tr: '+6 stok • toplu sipariş tamponu', en: '+6 stock • bulk order buffer' }, v: { tr: 'Tuğla soğuk depo, yükleme kapısı', en: 'Brick cold store, loading door' } },
      { c: 17000, inc: 0,   ivl: 0,  mod: { stock: 9, wspeed: 0.10 },  d: { tr: '+9 stok • çırak %10 hızlı', en: '+9 stock • workers 10% faster' }, v: { tr: 'Büyük depo, dış ünite ve raflar', en: 'Large depot, outdoor unit, racks' } },
      { c: 42000, inc: 0,   ivl: 0,  mod: { stock: 12, wspeed: 0.10, ctrslot: 1 }, d: { tr: '+12 stok • +1 kontrat kapasitesi', en: '+12 stock • +1 contract slot' }, v: { tr: 'Soğuk lojistik merkezi', en: 'Cold logistics centre' } }
    ] },
  { id: 'tamirhane', icon: '🛠️', n: { tr: 'Tamirhane', en: 'Repair Shop' }, acc: '#c98a3c',
    r: { tr: 'Liman ekipmanı servisi; yükseltme maliyetini düşürür', en: 'Harbor equipment service; cuts upgrade costs' },
    lv: [
      { c: 1500,  inc: 14,  ivl: 46, mod: { upcost: 0.02 }, d: { tr: 'Servis geliri • yükseltme −%2', en: 'Service income • upgrades −2%' }, v: { tr: 'Açık tezgâh ve alet sandığı', en: 'Open bench and tool chest' } },
      { c: 4200,  inc: 26,  ivl: 38, mod: { upcost: 0.04 }, d: { tr: 'Servis sıklığı +%20 • −%4', en: 'Service rate +20% • −4%' }, v: { tr: 'Ahşap atölye ve küçük vinç', en: 'Wooden workshop, small crane' } },
      { c: 11000, inc: 52,  ivl: 34, mod: { upcost: 0.06 }, d: { tr: 'Tekne servis kontratları • −%6', en: 'Boat service contracts • −6%' }, v: { tr: 'Kapalı servis binası, büyük kapı', en: 'Closed service hall, big door' } },
      { c: 28000, inc: 96,  ivl: 30, mod: { upcost: 0.08 }, d: { tr: 'Servis geliri +%20 • −%8', en: 'Service income +20% • −8%' }, v: { tr: 'Vinçli bakım alanı, parça rafları', en: 'Crane bay, parts racks' } },
      { c: 70000, inc: 185, ivl: 26, mod: { upcost: 0.10 }, d: { tr: 'Özel bakım kontratları • −%10', en: 'Premium maintenance • −10%' }, v: { tr: 'İki gözlü profesyonel tesis', en: 'Two-bay professional facility' } }
    ] },
  { id: 'hal', icon: '🏪', n: { tr: 'Balık Hali', en: 'Fish Hall' }, acc: '#d8b45a',
    r: { tr: 'Tezgâhların üstüne toptan satış katmanı ekler', en: 'Adds a wholesale layer above the stalls' },
    lv: [
      { c: 3200,   inc: 0,   ivl: 0,  mod: { queue: 1 }, d: { tr: 'Müşteri kapasitesi +1', en: 'Customer capacity +1' }, v: { tr: 'Açık masa ve tente grubu', en: 'Open tables and awnings' } },
      { c: 8500,   inc: 0,   ivl: 0,  mod: { queue: 2 }, d: { tr: 'Müşteri kapasitesi +2', en: 'Customer capacity +2' }, v: { tr: 'Kapalı pazar çatısı, tezgâh sırası', en: 'Covered market roof, stall row' } },
      { c: 21000,  inc: 0,   ivl: 0,  mod: { queue: 2 }, unl: 'toptanci', d: { tr: 'Toptancı müşteri tipi açılır', en: 'Wholesaler customer unlocked' }, v: { tr: 'Taş hal binası, yükleme kapısı', en: 'Stone hall, loading gate' } },
      { c: 54000,  inc: 0,   ivl: 0,  mod: { queue: 3, wholesale: 0.10 }, unl: 'toptanci', d: { tr: 'Toptan ödülü +%10 • kapasite +3', en: 'Wholesale reward +10% • capacity +3' }, v: { tr: 'Büyümüş hal, ikinci giriş', en: 'Expanded hall, second entrance' } },
      { c: 135000, inc: 0,   ivl: 0,  mod: { queue: 3, wholesale: 0.10, ctrslot: 1 }, unl: 'toptanci', d: { tr: 'Büyük alıcılar • +1 kontrat slotu', en: 'Major buyers • +1 contract slot' }, v: { tr: 'Bölgesel balık ticaret merkezi', en: 'Regional fish trade centre' } }
    ] },
  { id: 'restoran', icon: '🍽️', n: { tr: 'Restoran', en: 'Restaurant' }, acc: '#d1584a',
    r: { tr: 'Ziyaretçiyi gelire çevirir; balık stoğunu tüketmez', en: 'Turns visitors into income; never eats fish stock' },
    lv: [
      { c: 4200,   inc: 30,  ivl: 40, mod: {}, d: { tr: 'Periyodik restoran geliri', en: 'Periodic restaurant income' }, v: { tr: 'Küçük balık büfesi, 2 masa', en: 'Small fish buffet, 2 tables' } },
      { c: 11000,  inc: 52,  ivl: 32, mod: {}, d: { tr: 'Ziyaretçi sıklığı +%25', en: 'Visitor rate +25%' }, v: { tr: 'Kapalı lokanta ve oturma alanı', en: 'Indoor eatery and seating' } },
      { c: 30000,  inc: 96,  ivl: 30, mod: { custval: 0.03 }, unl: 'turist', d: { tr: 'Turist tipi • müşteri geliri +%3', en: 'Tourist type • customer income +3%' }, v: { tr: 'Sahil restoranı, camlı teras', en: 'Seaside restaurant, glass terrace' } },
      { c: 78000,  inc: 175, ivl: 26, mod: { custval: 0.03 }, unl: 'turist', d: { tr: 'Servis geliri +%25', en: 'Service income +25%' }, v: { tr: 'Büyük restoran, geniş teras', en: 'Large restaurant, wide terrace' } },
      { c: 190000, inc: 320, ivl: 22, mod: { custval: 0.08 }, unl: 'turist', d: { tr: 'Prestij ziyaretçi • müşteri +%8', en: 'Prestige visitors • customers +8%' }, v: { tr: 'Prestijli deniz ürünleri kompleksi', en: 'Prestige seafood complex' } }
    ] },
  { id: 'nakliye', icon: '📋', n: { tr: 'Nakliye Ofisi', en: 'Shipping Office' }, acc: '#6f8fae',
    r: { tr: 'Kontrat ve şirket işlerinin fiziksel merkezi', en: 'Physical hub for contracts and company deals' },
    lv: [
      { c: 8000,   inc: 22,  ivl: 50, mod: { ctrslot: 1 }, d: { tr: '+1 lojistik kontrat slotu', en: '+1 logistics contract slot' }, v: { tr: 'Ofis konteyneri ve pano', en: 'Office container and board' } },
      { c: 22000,  inc: 40,  ivl: 44, mod: { ctrslot: 1, offer: 0.10 }, d: { tr: 'Teklif yenileme −%10', en: 'Offer refresh −10%' }, v: { tr: 'Ofis + küçük depo eki', en: 'Office with depot annex' } },
      { c: 58000,  inc: 78,  ivl: 38, mod: { ctrslot: 1, offer: 0.10 }, unl: 'ctr', d: { tr: 'Şirket kontratları kilidi', en: 'Company contracts unlocked' }, v: { tr: 'Lojistik merkezi, yükleme alanı', en: 'Logistics hub, loading yard' } },
      { c: 145000, inc: 150, ivl: 32, mod: { ctrslot: 2, offer: 0.15, ctrrew: 0.08 }, unl: 'ctr', d: { tr: '+1 aktif slot • ödül +%8', en: '+1 active slot • reward +8%' }, v: { tr: 'Büyük depo-ofis, araç rampası', en: 'Depot office, truck ramp' } },
      { c: 360000, inc: 285, ivl: 26, mod: { ctrslot: 3, offer: 0.20, ctrrew: 0.15 }, unl: 'ctr', d: { tr: 'Stratejik kontratlar • ödül +%15', en: 'Strategic contracts • reward +15%' }, v: { tr: 'Bölgesel liman lojistik merkezi', en: 'Regional port logistics centre' } }
    ] },
  { id: 'yakit', icon: '⛽', n: { tr: 'Yakıt İstasyonu', en: 'Fuel Station' }, acc: '#9aa2aa',
    r: { tr: 'Dış teknelere hizmet verir; sefer maliyetini düşürür', en: 'Serves visiting boats; cuts voyage costs' }, dormant: 'boat',
    lv: [
      { c: 10000,  inc: 34,  ivl: 52, mod: { voyage: 0.02 }, d: { tr: 'Servis teknesi geliri • sefer −%2', en: 'Boat service income • voyage −2%' }, v: { tr: 'Variller ve küçük pompa', en: 'Barrels and a small pump' } },
      { c: 28000,  inc: 64,  ivl: 44, mod: { voyage: 0.04 }, d: { tr: 'Servis geliri +%20 • −%4', en: 'Service income +20% • −4%' }, v: { tr: 'Sundurmalı yakıt iskelesi', en: 'Covered fuelling jetty' } },
      { c: 72000,  inc: 120, ivl: 38, mod: { voyage: 0.06 }, d: { tr: 'Ticari tekne müşterileri • −%6', en: 'Commercial boat clients • −6%' }, v: { tr: 'Tanklar ve güvenli pompa adası', en: 'Tanks and safe pump island' } },
      { c: 180000, inc: 230, ivl: 30, mod: { voyage: 0.08 }, d: { tr: 'Servis sıklığı +%30 • −%8', en: 'Service rate +30% • −8%' }, v: { tr: 'Büyük tanklar, ikinci pompa', en: 'Large tanks, second pump' } },
      { c: 440000, inc: 430, ivl: 24, mod: { voyage: 0.10 }, d: { tr: 'Filo hizmet kontratları • −%10', en: 'Fleet service contracts • −10%' }, v: { tr: 'Liman yakıt terminali', en: 'Port fuel terminal' } }
    ] },
  { id: 'tersane', icon: '🚢', n: { tr: 'Tersane', en: 'Shipyard' }, acc: '#8d5f33', need: 4,
    r: { tr: 'İleri oyun yatırımı; filo ve büyük servis işleri', en: 'Late-game investment; fleet and major service jobs' }, dormant: 'boat',
    lv: [
      { c: 18000,  inc: 52,  ivl: 50, mod: { boatup: 0.00 }, d: { tr: 'Temel servis işi • tekne seçeneği', en: 'Basic service jobs • boat option' }, v: { tr: 'Açık kızak, iskele ve kereste', en: 'Open slipway, timber' } },
      { c: 52000,  inc: 98,  ivl: 42, mod: { boatup: 0.05 }, d: { tr: 'Tekne yükseltmesi −%5', en: 'Boat upgrades −5%' }, v: { tr: 'Küçük atölyeli kızak', en: 'Slipway with workshop' } },
      { c: 140000, inc: 190, ivl: 36, mod: { boatup: 0.05, ctrrew: 0.05 }, d: { tr: 'Büyük servis kontratları', en: 'Major service contracts' }, v: { tr: 'Kapalı atölye, vinç, büyük kızak', en: 'Closed shed, crane, big slipway' } },
      { c: 350000, inc: 360, ivl: 30, mod: { boatup: 0.08, ctrrew: 0.08, fleet: 1 }, d: { tr: '+1 filo slotu • upgrade −%8', en: '+1 fleet slot • upgrades −8%' }, v: { tr: 'Geniş bakım havuzu, iki vinç', en: 'Wide dock, twin cranes' } },
      { c: 820000, inc: 680, ivl: 24, mod: { boatup: 0.10, ctrrew: 0.12, fleet: 2 }, d: { tr: 'Amiral gemisi sınıfı • prestij servisi', en: 'Flagship class • prestige service' }, v: { tr: 'Tam teşekküllü tersane kompleksi', en: 'Full shipyard complex' } }
    ] },
  /* v2.0 — gerçek Türk balıkçı barınağının iki temel kurumu */
  { id: 'koop', icon: '🤝', n: { tr: 'Su Ürünleri Kooperatifi', en: 'Fishery Cooperative' }, acc: '#3f8f6a',
    r: { tr: 'Balıkçının ortak evi: giderleri düşürür, itibarı büyütür', en: "The fishers' common house: lower costs, higher standing" },
    lv: [
      { c: 5000,   inc: 0,   ivl: 0,  mod: { wage: 0.06 }, d: { tr: 'Maaş gideri −%6', en: 'Wage cost −6%' }, v: { tr: 'Tek odalı kooperatif bürosu', en: 'One-room co-op office' } },
      { c: 14000,  inc: 24,  ivl: 46, mod: { wage: 0.12 }, d: { tr: 'Maaş −%12 • aidat geliri', en: 'Wages −12% • dues income' }, v: { tr: 'Ahşap büro, ilan panosu, çay ocağı', en: 'Wooden office, notice board, tea stove' } },
      { c: 38000,  inc: 46,  ivl: 40, mod: { wage: 0.18, value: 0.05 }, d: { tr: 'Taban fiyat: ürün değeri +%5', en: 'Price floor: goods value +5%' }, v: { tr: 'Kagir kooperatif binası, bayrak direği', en: 'Stone co-op building, flagpole' } },
      { c: 95000,  inc: 88,  ivl: 34, mod: { wage: 0.22, value: 0.08, rep: 0.25 }, d: { tr: 'Değer +%8 • itibar kazancı +%25', en: 'Value +8% • reputation gain +25%' }, v: { tr: 'İki katlı büro, toplantı salonu', en: 'Two-storey office, meeting hall' } },
      { c: 240000, inc: 165, ivl: 28, mod: { wage: 0.28, value: 0.12, rep: 0.5, ctrslot: 1 }, d: { tr: 'Bölge birliği: +1 kontrat, itibar +%50', en: 'Regional union: +1 contract, rep +50%' }, v: { tr: 'Birlik merkezi, kemerli cephe, çini kuşak', en: 'Union HQ, arched facade, tile band' } }
    ] },
  { id: 'mezat', icon: '🔔', n: { tr: 'Mezat Salonu', en: 'Auction Hall' }, acc: '#c9952f',
    r: { tr: 'Kabzımal mezatı: gün sonunda tezgâha gitmemiş ürün açık artırmayla satılır', en: 'Broker auction: goods that never reached a stall are sold at day close' },
    lv: [
      { c: 7000,   inc: 0,   ivl: 0,  mod: { auction: 0.55, auctionN: 6 },  d: { tr: 'Gün sonu 6 ürün mezata çıkar (%55 fiyat)', en: '6 goods auctioned at day close (55% price)' }, v: { tr: 'Üstü açık mezat masası ve çan', en: 'Open auction table and bell' } },
      { c: 19000,  inc: 0,   ivl: 0,  mod: { auction: 0.70, auctionN: 10 }, d: { tr: '10 ürün • %70 fiyat', en: '10 goods • 70% price' }, v: { tr: 'Sundurmalı mezat yeri, sıralar', en: 'Covered auction floor, benches' } },
      { c: 48000,  inc: 0,   ivl: 0,  mod: { auction: 0.85, auctionN: 16 }, d: { tr: '16 ürün • %85 fiyat', en: '16 goods • 85% price' }, v: { tr: 'Kagir salon, kürsü, asılı çan', en: 'Stone hall, rostrum, hanging bell' } },
      { c: 120000, inc: 0,   ivl: 0,  mod: { auction: 1.00, auctionN: 24 }, d: { tr: '24 ürün • tam fiyat', en: '24 goods • full price' }, v: { tr: 'Geniş salon, tabela, ikinci kapı', en: 'Wide hall, signboard, second door' } },
      { c: 300000, inc: 0,   ivl: 0,  mod: { auction: 1.20, auctionN: 36 }, d: { tr: '36 ürün • %120 fiyat (rekabetli mezat)', en: '36 goods • 120% price (competitive bidding)' }, v: { tr: 'Bölgesel mezat merkezi, kemerli giriş', en: 'Regional auction centre, arched entry' } }
    ] }
];
function sdef(id) { for (var i = 0; i < SERV.length; i++) if (SERV[i].id === id) return SERV[i]; return null; }

/* Bina durumu (§40 ServiceBuildingState) — kurulmamış binalar listede yok. */
var servState = {};
function sState(id) { return servState[id] || null; }
function sBuilt(id) { var s = servState[id]; return !!(s && s.lvl > 0); }
function sLvl(id) { var s = servState[id]; return s ? s.lvl : 0; }
function sMaxLv() { return 5; }
function servCount() { var n = 0; for (var k in servState) if (servState[k] && servState[k].lvl > 0) n++; return n; }

/* Toplam etki: kurulu her binanın mevcut seviyesindeki mod'ları toplar (§34 toplamsal). */
var _seCache = null, _seT = -1;
function servMods() {
  if (_seT === gameT && _seCache) return _seCache;
  var out = {};
  for (var i = 0; i < SERV.length; i++) {
    var d = SERV[i], st = servState[d.id];
    if (!st || st.lvl < 1) continue;
    var m = d.lv[st.lvl - 1].mod || {};
    for (var k in m) out[k] = (out[k] || 0) + m[k];
  }
  _seCache = out; _seT = gameT;
  return out;
}
function servEff(key) { return servMods()[key] || 0; }
/* Bir kilit açık mı (toptanci / turist / ctr) */
function servUnlock(tag) {
  for (var i = 0; i < SERV.length; i++) {
    var d = SERV[i], st = servState[d.id];
    if (!st || st.lvl < 1) continue;
    if (d.lv[st.lvl - 1].unl === tag) return true;
  }
  return false;
}
/* Tekne sistemi henüz yok → voyage/boatup/fleet bonusları dormant (§35.6, §42.7) */
function servDormant(key) { return key === 'voyage' || key === 'boatup' || key === 'fleet'; }

/* Bir bina şu an kurulabilir mi + neden değil (§37 tek satır kilit sebebi) */
function servLockReason(d) {
  if (sBuilt(d.id)) return null;
  var ok = false;
  for (var i = 0; i < PLOTS.length; i++) {
    var p = PLOTS[i];
    if (p.b || !plotActive(p)) continue;
    if (p.allow.indexOf(d.id) >= 0) { ok = true; break; }
  }
  if (d.need && servCount() < d.need) return T('needServ', { n: d.need });
  if (!ok) {
    var z = -1;
    for (var j = 0; j < PLOTS.length; j++) if (PLOTS[j].allow.indexOf(d.id) >= 0) { z = PLOTS[j].z; break; }
    for (var j2 = 0; j2 < PLOTS.length; j2++) {
      var q = PLOTS[j2];
      if (q.allow.indexOf(d.id) >= 0 && AREAS[q.z].locked) { z = q.z; break; }
    }
    if (z >= 0 && AREAS[z].locked) return T('needArea', { n: NM(AREAS[z].n) });
    return T('noPlot');
  }
  return null;
}
function servFreePlots(id) {
  var out = [];
  for (var i = 0; i < PLOTS.length; i++) {
    var p = PLOTS[i];
    if (p.b || !plotActive(p)) continue;
    if (p.allow.indexOf(id) >= 0) out.push(p);
  }
  return out;
}
function servBuild(id, plot) {
  var d = sdef(id); if (!d || sBuilt(id) || !plot || plot.b) return false;
  plot.b = id;
  servState[id] = { lvl: 1, plot: plot.id, cons: 2.2, fresh: 1, nextT: d.lv[0].ivl || 0, flash: 0 };
  _seT = -1; rebuildCounters(); reassignWorkers();
  sfx.build(); addPuff(plot.x, plot.y, '#ffc94a');
  toast(T('servBuilt', { n: NM(d.n) }));
  return true;
}
function servUp(id) {
  var d = sdef(id), st = servState[id];
  if (!d || !st || st.lvl >= 5) return false;
  st.lvl++; st.cons = 1.3; st.fresh = 0; st.flash = 1.8;
  st.nextT = d.lv[st.lvl - 1].ivl || 0;
  _seT = -1; rebuildCounters(); reassignWorkers();
  var p = plotById(st.plot);
  if (p) addPuff(p.x, p.y, '#ffc94a');
  sfx.build(); toast(T('servUp', { n: NM(d.n), l: st.lvl }));
  return true;
}
/* §32.1 — ücretsiz taşıma, seviye korunur */
function servMove(id, plot) {
  var st = servState[id]; if (!st || !plot || plot.b) return false;
  var old = plotById(st.plot); if (old) old.b = null;
  plot.b = id; st.plot = plot.id; st.cons = 0;
  sfx.build(); addPuff(plot.x, plot.y, '#9df5b0');
  toast(T('servMoved', { n: NM(sdef(id).n) }));
  return true;
}
/* §41 — kayıt: hiçbir bina otomatik satın alınmaz, para kesilmez */
function servSave() {
  var out = [];
  for (var i = 0; i < SERV.length; i++) {
    var st = servState[SERV[i].id];
    if (st && st.lvl > 0) out.push([SERV[i].id, st.lvl, st.plot]);
  }
  return out;
}
function servLoad(arr) {
  servState = {};
  for (var i = 0; i < PLOTS.length; i++) PLOTS[i].b = null;
  if (!arr || !arr.length) return;
  for (var j = 0; j < arr.length; j++) {
    var r = arr[j]; if (!r) continue;
    var d = sdef(r[0]); if (!d) continue;                       /* bilinmeyen bina → atla */
    var lv = clamp(parseInt(r[1], 10) || 1, 1, 5);
    var p = plotById(r[2]);
    if (!p || p.b || !plotActive(p) || p.allow.indexOf(d.id) < 0) {   /* geçersiz/kilitli parsel → uygun boşa taşı */
      var alt = servFreePlots(d.id);
      p = alt.length ? alt[0] : null;
    }
    if (!p) continue;                                            /* yer yoksa bina kurulmamış sayılır */
    p.b = d.id;
    servState[d.id] = { lvl: lv, plot: p.id, cons: 0, nextT: d.lv[lv - 1].ivl || 0, flash: 0 };
  }
  _seT = -1;
}
/* v1.2 §9 — gün / depo / hedef stok yüklemesi */
function loadDay(d) {
  if (d && d.day) {
    day.n = Math.max(1, parseInt(d.day[0], 10) || 1);
    day.t = clamp(parseFloat(d.day[1]) || 0, 0, DAY_LEN - 1);
    day.market = !!d.day[2] && isMarketDay(day.n);
    day.feat = custById(d.day[3]) ? d.day[3] : null;
  }
  day.phase = 'play'; day.ph = 0; day.st = newDayStats(); day.last = null;
  if (d && d.stalls) {
    for (var j = 0; j < d.stalls.length; j++) {
      var c = counterByKey(d.stalls[j][0]);
      if (c) c.open = !!d.stalls[j][1];
    }
  }
  openStarterStall();
}

/* §41 doğrulama: parsel kasa güvenli alanını veya kuyruğu işgal etmiyor */
function servValidate() {
  var bad = [];
  for (var i = 0; i < PLOTS.length; i++) {
    var p = PLOTS[i];
    if (dist2(p.x, p.y, safe.x, safe.y) < 4.0) bad.push(p.id + ':safe');
    for (var k = 0; k < counters.length; k++) {
      var c = counters[k];
      if (Math.abs(p.x - c.x) < 1.2 && Math.abs(p.y - c.y) < 1.2) bad.push(p.id + ':queue');
      if (p.x > 10.0) bad.push(p.id + ':lane');
    }
  }
  return bad;
}

/* §34 / §38.2 — servis geliri: ana balık gelirinin %30'unu aşamaz */
var fishRate = 0, servRate = 0;
function noteFishIncome(v) { fishRate += v; }
function servTick(dt) {
  var dec = Math.pow(0.5, dt / 30);                 /* ~30 sn yarı ömür */
  fishRate *= dec; servRate *= dec;
  var cap = Math.max(12, fishRate * 0.30);
  for (var i = 0; i < SERV.length; i++) {
    var d = SERV[i], st = servState[d.id];
    if (!st || st.lvl < 1) continue;
    if (st.cons > 0) st.cons = Math.max(0, st.cons - dt);
    if (st.flash > 0) st.flash = Math.max(0, st.flash - dt);
    var L = d.lv[st.lvl - 1];
    if (!L.inc || !L.ivl) continue;
    st.nextT -= dt;
    if (st.nextT > 0) continue;
    st.nextT = L.ivl * rnd(0.8, 1.25);
    if (servRate >= cap) continue;                  /* tavan: AFK para makinesi olmaz */
    var pay = Math.round(L.inc * (1 + repLevel() * 0.02));
    S.cash += pay; servRate += pay; earn(pay);
    var p = plotById(st.plot);
    if (p) { addFloat(p.x, p.y - 0.4, '+' + money(pay), '#9df5b0'); st.flash = 0.8; }
  }
}

/* =========================================================
   v1.2 — BİRLEŞİK SİSTEM (GDD v1.1)
   Merkezi Depo + Otomatik Dağıtım • Balık Pazarı Günü • Sade Gün Geçişi
   Çekirdek döngü değişmez; bu katman tekrarlı taşımayı yönetim kararına çevirir.
   ========================================================= */

/* ---------------- Merkezi Depo (§3) ---------------- */
/* ---------------- Hedef stok + öncelik (§3.2) ---------------- */
/* ---------------- Sade gün geçişi (§2) ---------------- */
var DAY_LEN = 300, MARKET_EVERY = 5, CLOSE_MAX = 22;
var day = {
  n: 1, t: 0, phase: 'play', ph: 0, market: false,
  st: null, last: null
};
function newDayStats() { return { inc: 0, served: 0, lost: 0, fish: 0, by: {}, out: {}, outAt: {} }; }
day.st = newDayStats();
function isMarketDay(n) { return n > 1 && n % MARKET_EVERY === 0; }
function dayNext() { return isMarketDay(day.n + 1); }
function dayPlaying() { return day.phase === 'play'; }
function daySpawnOK() { return day.phase === 'play'; }
function dayCustMul() { return day.market ? 2.2 : 1; }
function noteDayIncome(v) { day.st.inc += v; }
function noteDaySale(cu) {
  day.st.served++;
  day.st.fish += cu.ord.need;
  var key = cu.ord.f;
  day.st.by[key] = (day.st.by[key] || 0) + cu.ord.need;
}
function noteDayLost() { day.st.lost++; }
/* stok-dışı süre: bekleyen müşteri var ama tezgâhta o ürün yok (§6.1) */
function noteStockOut(dt) {
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (AREAS[c.z].locked || !c.fish) continue;
    var waiting = false, j;
    for (j = 0; j < c.slots.length; j++) if (c.slots[j] && c.slots[j].state === 'wait' && c.slots[j].ord.got < c.slots[j].ord.need) { waiting = true; break; }
    if (!waiting) continue;
    var has = false;
    for (j = 0; j < c.buffer.length; j++) if (c.buffer[j].f === c.fish) { has = true; break; }
    if (!has) day.st.out[c.fish] = (day.st.out[c.fish] || 0) + dt;
  }
}
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  return Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60);
}
function topSeller() {
  var best = null, bv = 0;
  for (var k in day.st.by) if (day.st.by[k] > bv) { bv = day.st.by[k]; best = k; }
  return best ? { f: best, n: bv } : null;
}
function worstOut() {
  var best = null, bv = 0;
  for (var k in day.st.out) if (day.st.out[k] > bv) { bv = day.st.out[k]; best = k; }
  return best && bv > 1 ? { f: best, t: bv } : null;
}
/* Pazar geçici ayarlarını temizle (§6: kalıcı hedefi ezmez) */
function updateDay(dt) {
  if (day.phase === 'play') {
    day.t += dt;
    noteStockOut(dt);
    if (day.t >= DAY_LEN) { day.phase = 'closing'; day.ph = 0; }
    return;
  }
  if (day.phase === 'closing') {
    day.ph += dt;
    /* yeni müşteri gelmez; mevcutlar tamamlansın */
    if (!customers.length || day.ph > CLOSE_MAX) { endDay(); }
    return;
  }
  if (day.phase === 'summary' || day.phase === 'prep') return;   /* kart kapanınca ilerler */
  if (day.phase === 'intro') {
    day.ph -= dt;
    if (day.ph <= 0) { day.phase = 'play'; day.t = 0; }
  }
}
/* Mezat Salonu: gün kapanışında tezgâha gitmemiş işlenmiş ürün (hasır tepsilerde
   bekleyen fileto/füme) kabzımal mezatında açık artırmayla satılır. */
function auctionPiles() {
  var out = [], i;
  for (i = 0; i < tables.length; i++) if (!AREAS[tables[i].z].locked) out.push(tables[i].mat);
  if (!AREAS[smoker.z].locked) out.push(smoker.mat);
  return out;
}
function runAuction() {
  var mul = servEff('auction'), cap = Math.round(servEff('auctionN'));
  if (!mul || !cap) return null;
  var piles = auctionPiles(), sold = 0, gain = 0, at = null;
  for (var p2 = 0; p2 < piles.length && sold < cap; p2++) {
    var pile = piles[p2];
    while (sold < cap && pile.items.length) {
      var it = pile.items.pop();
      if (!isGoods(it) || !validItem(it)) continue;
      gain += Math.round(prodValue(it.k, it.f) * mul);
      sold++; at = pile;
    }
  }
  if (!sold) return null;
  sfx.bell();
  S.cash += gain; earn(gain); noteDayIncome(gain); noteFishIncome(gain * 0.5);
  if (at) addFloat(at.x, at.y - 0.6, '+' + money(gain), '#ffe27a');
  return { n: sold, v: gain };
}
/* v0.3 — gün kapanınca kalan müşteriler selamlaşıp ayrılır (kayıp sayılmaz);
   yeni gün "günün müşterisi" ile başlar: o gün bir müşteri tipi daha sık gelir. */
function dismissCustomers() {
  for (var j = 0; j < customers.length; j++) {
    var cu = customers[j];
    if (cu.state === 'leave') continue;
    cu.state = 'leave'; cu.happyLeave = true; cu.leaveT = 0;
  }
  for (var i = 0; i < counters.length; i++) for (var k = 0; k < counters[i].slots.length; k++) counters[i].slots[k] = null;
}
function featPool() {
  var lvl = repLevel();
  return CUST.filter(function (t) { return t.lvl <= lvl && (!t.serv || servUnlock(t.serv)); });
}
function pickFeatured() {
  var pool = featPool().filter(function (t) { return t.id !== day.feat; });
  day.feat = pool.length ? pick(pool).id : null;
}
function custById(id) { for (var i = 0; i < CUST.length; i++) if (CUST[i].id === id) return CUST[i]; return null; }
function endDay() {
  dismissCustomers();
  var auc = runAuction();
  day.last = {
    n: day.n, market: day.market, inc: day.st.inc, served: day.st.served,
    lost: day.st.lost, fish: day.st.fish, top: topSeller(), out: worstOut(),
    next: isMarketDay(day.n + 1), auc: auc
  };
  if (M && M.office) closeDay();                 /* borsa günü oyun günüyle aynı */
  day.phase = 'summary';
  sfx.dayOut();
  showDayCard();
  save();
}
/* kart kapatılınca: yeni güne geç (pazar günüyse hazırlık ekranı) */
function beginNextDay(skipPrep) {
  day.n++;
  pickFeatured();
  day.market = isMarketDay(day.n);
  day.st = newDayStats();
  day.t = 0;
  if (day.market && !skipPrep) { day.phase = 'prep'; showPrepCard(); return; }
  day.phase = 'intro'; day.ph = 1.7;
  sfx.dayIn();
  syncPause();
  if (undecidedStalls().length) openStallScreen();   /* gün başı: yeni tezgâh kararı */
}

/* ---------------- istasyonlar ---------------- */
var spots = [
  { z: 0, x: 2.3, y: 0.9,  face: 'n', stock: [], t: 0, rate: 1.05 },
  { z: 1, x: 1.0, y: 7.4,  face: 'w', stock: [], t: 0, rate: 1.25 },
  { z: 2, x: 1.0, y: 13.2, face: 'w', stock: [], t: 0, rate: 1.5 }
];
/* bu ağda hangi türler üretilebilir: hattı açık (tezgâhı kurulu) olanlar */
function spotLines(i) {
  var out = [];
  for (var k = 0; k < LINES.length; k++) {
    var l = LINES[k];
    if (l.src !== i) continue;
    if (!canSell(l.f)) continue;
    if (!canProcess('fileto', l.f)) continue;
    out.push(l);
  }
  return out;
}
function mkTable(z, x, y, mx, my) {
  return { z: z, x: x, y: y, inn: [], cur: null, t: 0, worker: null, mat: { x: mx, y: my, items: [] }, max: 10 };
}
var tables = [
  mkTable(0, 5.4, 1.4, 6.7, 2.2),
  mkTable(1, 3.4, 7.6, 4.5, 8.3),
  mkTable(2, 3.4, 13.0, 4.5, 13.8)
];
var smoker = { z: 2, x: 3.4, y: 15.4, inn: [], cur: null, t: 0, belt: 0, mat: { x: 4.6, y: 16.1, items: [] }, max: 8 };
var counters = [];
function mkCounter(z, x, y, key) {
  return { z: z, x: x, y: y, key: key || null, fish: null, buffer: [],
    slots: [null, null, null, null, null, null, null], tray: { x: x - 0.6, y: y + 1.3, items: [] },
    open: false,
    spawnT: 3 + z * 2, eatT: 0 };
}
function rebuildCounters() {
  var old = counters.slice(), keep = [], i;
  function get(key, z, x, y) {
    for (var k = 0; k < old.length; k++) if (old[k].key === key) { old[k].x = x; old[k].y = y; old[k].z = z; return old[k]; }
    var c = mkCounter(z, x, y, key); c.key = key; return c;
  }
  counters.length = 0;
  counters.push(get('b0', 0, 8.9, 3.0));
  counters.push(get('b1', 1, 8.9, 10.4));
  counters.push(get('b2', 2, 8.9, 15.4));
  for (i = 0; i < SLOTS.length; i++) {
    var sl = SLOTS[i];
    if (sl.b === 'tezgah' && slotActive(sl)) counters.push(get('s' + sl.id, sl.z, sl.x + 0.3, sl.y));
  }
  if (project.done) counters.push(get('hal', 1, project.x + 1.5, project.y + 0.2));
  /* kaldırılan tezgâhtaki müşteriler dağılsın */
  for (i = 0; i < old.length; i++) {
    if (counters.indexOf(old[i]) >= 0) continue;
    for (var j = customers.length - 1; j >= 0; j--) if (customers[j].c === old[i]) customers[j].state = 'leave';
  }
  /* her tezgâha kendi balığını bağla (1:1) */
  for (i = 0; i < counters.length; i++) {
    var ln = lineByStall(counters[i].key);
    counters[i].fish = ln ? ln.f : null;
  }
  openStarterStall();                        /* ilk tezgâh daima açık (yeni oyun dâhil) */
  if (S.started && undecidedStalls().length) stallPrompt = true;   /* yeni tezgâh: hemen sor */
  announceLines();
  validateWorld();
  /* kuyruk şeritleri */
  var byY = counters.slice().sort(function (a, b) { return a.y - b.y; });
  var lanes = [];
  for (var k2 = 0; k2 < byY.length; k2++) {
    var c2 = byY[k2], L = 0;
    while (lanes[L] !== undefined && Math.abs(c2.y - lanes[L]) < 5.2) L++;
    c2.lane = L; lanes[L] = c2.y;
  }
}
var _lineSeen = null;
function announceLines() {
  var now = {};
  for (var i = 0; i < LINES.length; i++) if (fishReady(LINES[i].f)) now[LINES[i].f] = 1;
  if (_lineSeen) {
    for (var f in now) if (!_lineSeen[f]) toast(T('newLine', { n: NM(FISH[f].n) }));
  }
  _lineSeen = now;
}
/* geçersiz ürünleri güvenle temizle / geçerliye dönüştür (soft-lock yok) */
function validItem(it) {
  if (!it) return false;
  if (it.k === 'money') return true;
  if (!FISH[it.f] || !lineOf(it.f)) return false;
  if (it.k === 'fish') return canProduce(it.f);
  /* ürün: üretilebilir + satılabilir olmalı, füme ise hattı açık olmalı */
  if (!canProduce(it.f) || !canSell(it.f)) return false;
  if (it.k === 'fume' && !canProcess('fume', it.f)) return false;
  return true;
}
function fallbackFish() {
  var s2 = sellableFish();
  return s2.length ? s2[0] : null;
}
function fixList(arr) {
  var fb = fallbackFish(), changed = 0;
  for (var i = arr.length - 1; i >= 0; i--) {
    var it = arr[i];
    if (validItem(it)) continue;
    if (it && it.k !== 'money' && fb && canProcess(it.k, fb)) { it.f = fb; changed++; }
    else if (it && it.k === 'fume' && fb) { it.k = 'fileto'; it.f = fb; changed++; }
    else { arr.splice(i, 1); changed++; }
  }
  return changed;
}
function validateWorld() {
  var i, ch = 0;
  for (i = 0; i < spots.length; i++) {
    var allow = {}, sl = spotLines(i);
    for (var k = 0; k < sl.length; k++) allow[sl[k].f] = 1;
    for (var j = spots[i].stock.length - 1; j >= 0; j--) {
      if (!allow[spots[i].stock[j].f]) {
        if (sl.length) spots[i].stock[j].f = sl[Math.floor(Math.random() * sl.length)].f;
        else { spots[i].stock.splice(j, 1); }
        ch++;
      }
    }
  }
  for (i = 0; i < tables.length; i++) { ch += fixList(tables[i].inn); ch += fixList(tables[i].mat.items); }
  ch += fixList(smoker.inn); ch += fixList(smoker.mat.items);
  ch += fixList(player.carry);
  for (i = 0; i < workers.length; i++) ch += fixList(workers[i].carry);
  for (i = 0; i < counters.length; i++) {
    var c = counters[i];
    ch += fixList(c.buffer);
    /* tezgâh yalnız kendi balığını tutar: yanlış tür varsa doğru tezgâha taşı ya da düş */
    for (var b = c.buffer.length - 1; b >= 0; b--) {
      if (c.fish && c.buffer[b].f !== c.fish) {
        var tgt = stallOf(c.buffer[b].f);
        var it2 = c.buffer.splice(b, 1)[0];
        if (tgt && tgt.buffer.length < counterMax(tgt)) tgt.buffer.push(it2);
        ch++;
      }
    }
  }
  /* geçersiz sipariş: geçerli ürünle yeniden oluştur, olmazsa müşteriyi gönder */
  for (i = customers.length - 1; i >= 0; i--) {
    var cu = customers[i];
    if (cu.state === 'leave') continue;
    var bad = !cu.c || counters.indexOf(cu.c) < 0 || !cu.c.fish ||
      cu.ord.f !== cu.c.fish || !fishReady(cu.ord.f) ||
      (cu.ord.k === 'fume' && !canProcess('fume', cu.ord.f));
    if (!bad) continue;
    var host = cu.c && counters.indexOf(cu.c) >= 0 && cu.c.fish && fishReady(cu.c.fish) ? cu.c : null;
    if (host) {
      cu.ord.k = canProcess('fume', host.fish) && cu.type.tag === 'fume' ? 'fume' : 'fileto';
      cu.ord.f = host.fish; cu.ord.got = Math.min(cu.ord.got, cu.ord.need);
    } else {
      if (cu.c && cu.c.slots) for (var q = 0; q < cu.c.slots.length; q++) if (cu.c.slots[q] === cu) cu.c.slots[q] = null;
      cu.state = 'leave';
    }
    ch++;
  }
  return ch;
}
function counterMax(c) { return 20 + (AREAS[c.z].lvl - 1) * 4 + slotEff(c.z, 'stock'); }
var safe = { z: 0, x: 1.2, y: 4.9, pop: 0 };
/* v0.6 — çöp kovaları: elde kalan fazla mal (tezgâh/kuyruk dolu, yanlış tür) atılabilsin.
   Kovanın önünde kısa bir an durunca taşıdığın mallar boşalır (para asla atılmaz). */
var BINS = [
  { z: 0, x: 9.3, y: 0.6, pop: 0 },
  { z: 1, x: 9.3, y: 6.5, pop: 0 },
  { z: 2, x: 9.3, y: 14.1, pop: 0 }
];
var binT = 0, trashN = 0, stuckT = 0, stuckHintAt = -99;
var isTrash = function (it) { return it.k !== 'money'; };
function iTrash(a, bn, dt) {
  if (!hasCarry(a, isTrash)) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.07;
  var it = popCarry(a, isTrash);
  fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), bn.x, bn.y, 9, it, 0.22);
  bn.pop = 1; trashN++;
  sfx.drop(); noise(0.06, 0.06, { f: 900, to: 300 });
  if (!hasCarry(a, isTrash)) { toast(T('trashed', { n: trashN })); trashN = 0; }
  return true;
}
var office = { z: 2, x: 6.9, y: 16.2, w: 1.8, h: 1.4 };
function officeBuilt() { return M && M.office; }
function officeReady() { return !AREAS[office.z].locked; }

/* ---------------- yükseltme alanları ---------------- */
var PADS = [
  { id: 'cap', z: 0, x: 1.2, y: 1.4,  kind: 'cap',  icon: '🧺', price: 120,  growth: 1.55, lvl: 0, max: 8, paid: 0 },
  { id: 'spd', z: 0, x: 1.2, y: 2.9,  kind: 'spd',  icon: '👟', price: 160,  growth: 1.60, lvl: 0, max: 6, paid: 0 },
  { id: 'al0', z: 0, x: 5.0, y: 4.0,  kind: 'arealv', area: 0, icon: '🏗️', paid: 0 },
  { id: 'z1',  z: 0, x: 7.0, y: 5.3,  kind: 'area', target: 1, icon: '🔓', paid: 0 },
  { id: 'al1', z: 1, x: 6.0, y: 11.2, kind: 'arealv', area: 1, icon: '🏗️', paid: 0 },
  { id: 'z2',  z: 1, x: 8.0, y: 11.4, kind: 'area', target: 2, icon: '🔓', paid: 0 },
  { id: 'prc', z: 2, x: 6.8, y: 16.6, kind: 'price', icon: '💰', price: 850, growth: 1.8, lvl: 0, max: 6, paid: 0 },
  { id: 'al2', z: 2, x: 2.0, y: 16.9, kind: 'arealv', area: 2, icon: '🏗️', paid: 0 }
];

/* ---------------- durum ---------------- */
var S = {
  cash: 0, rep: 0, capLvl: 0, spdLvl: 0, priceLvl: 0,
  served: 0, lost: 0, caught: 0, tut: 0, started: false, play: 0, savedAt: 0,
  earned: 0, company: '', runId: '', ctrl: 0, auto: [], hero: null     /* skor: kasaya giren toplam gelir + işletme adı */
};
/* skor: kasaya giren her gerçek gelir (satış, mezat, bina, kontrat, temettü, işletme).
   İade ve hisse satışı sayılmaz — skor "kazanılan para"dır, çevrilen para değil. */
function earn(v) { if (v > 0) S.earned += v; }
var player = { x: 4.5, y: 3.2, z: 0, vx: 0, vy: 0, bob: 0, face: 1, carry: [], act: 0, isPlayer: true };
var workers = [], customers = [], flyers = [], floats = [], puffs = [], gulls = [];
var event = null, eventT = 0, nextEvent = 80;
var gameT = 0, camX = 0, camY = 0, camTX = 0, camTY = 0;

function capacity() { return 8 + S.capLvl * 3; }
function speed() { return 3.1 * Math.pow(1.11, S.spdLvl); }
function carryW(a) { var w = 0; for (var i = 0; i < a.carry.length; i++) w += itemW(a.carry[i]); return w; }
function repLevel() { return levelForRep(S.rep); }
function repTitle() { return NM(REP_LEVELS[repLevel() - 1].t); }
function wageTotal() { var w = 0; for (var i = 0; i < workers.length; i++) w += ROLES[workers[i].role].wage; return w * (1 - Math.min(0.5, servEff('wage'))); }
function upCost(v) { return Math.max(1, Math.round(v * (1 - Math.min(0.45, perkSum('upcost') + servEff('upcost'))))); }
function pct(n) { return lang === 'tr' ? '%' + n : n + '%'; }
function perMin() { return lang === 'tr' ? '/dk' : '/min'; }
function money(n) { return '$' + Math.round(n).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'); }

/* ---------------- kayıt (v0.4 — 3 slot) ----------------
   • Store: localStorage; tarayıcı izin vermezse (gizli pencere, kısıtlı iframe) oturum içi
     hafızaya düşer → "Kaydet ve Çık" yine çalışır, yalnız sayfa kapanınca kaybolur (uyarı gösterilir).
   • 3 kayıt slotu. Eski tek kayıt (balikci_tycoon_v3) ilk açılışta boş bir slota taşınır.
   • Yeni oyun / slot değiştirme sayfayı YENİDEN YÜKLEMEZ: resetWorld() açılış anındaki temiz
     durumu (BOOT) geri kurar. Kısıtlı iframe'de reload ve confirm() güvenilir değildi. */
var Store = (function () {
  var mem = {}, ok = false;
  try { var t = '__bt_test'; localStorage.setItem(t, '1'); localStorage.removeItem(t); ok = true; } catch (e) { }
  return {
    persistent: ok,
    get: function (k) {
      if (Object.prototype.hasOwnProperty.call(mem, k)) return mem[k];
      if (ok) { try { return localStorage.getItem(k); } catch (e) { } }
      return null;
    },
    set: function (k, v) { mem[k] = String(v); if (ok) { try { localStorage.setItem(k, String(v)); } catch (e) { } } },
    del: function (k) { mem[k] = null; if (ok) { try { localStorage.removeItem(k); } catch (e) { } } }
  };
})();
var SLOT_N = 3, SLOT_PREFIX = 'balikci_slot_', LAST_KEY = 'balikci_last', OLD_KEY = 'balikci_tycoon_v3', PREF_KEY = 'balikci_pref';
var curSlot = 0, BOOT = null, S0 = null;
function slotKey(n) { return SLOT_PREFIX + n; }
function readSlot(n) {
  if (!(n >= 1 && n <= SLOT_N)) return null;
  try { var raw = Store.get(slotKey(n)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function slotCount() { var c = 0; for (var i = 1; i <= SLOT_N; i++) if (readSlot(i)) c++; return c; }
function lastSlot() { var n = parseInt(Store.get(LAST_KEY), 10); return readSlot(n) ? n : 0; }
function migrateOldSave() {
  var old = Store.get(OLD_KEY);
  if (!old) return;
  try {
    var d = JSON.parse(old);
    if (!Store.get(PREF_KEY) && d) Store.set(PREF_KEY, JSON.stringify({ lang: d.lang || 'tr', snd: d.snd === true ? 2 : (d.snd | 0), zoom: d.zoom || 2 }));
  } catch (e) { }
  for (var i = 1; i <= SLOT_N; i++) if (!readSlot(i)) { Store.set(slotKey(i), old); if (!lastSlot()) Store.set(LAST_KEY, String(i)); break; }
  Store.del(OLD_KEY);
}
function savePref() { Store.set(PREF_KEY, JSON.stringify({ lang: lang, snd: volLvl, zoom: zoomLvl, mus: musicEnabled ? 1 : 0 })); }
function loadPref() {
  try {
    var d = JSON.parse(Store.get(PREF_KEY) || 'null'); if (!d) return;
    if (d.lang) lang = d.lang;
    if (d.snd !== undefined) { volLvl = clamp(d.snd | 0, 0, 2); applyVolume(); }
    if (d.zoom) zoomLvl = d.zoom;
    if (d.mus !== undefined) musicEnabled = !!d.mus;
  } catch (e) { }
}
function buildSave() {
  return {
    v: 6, at: Date.now(), play: Math.round(S.play || 0),
    cash: S.cash, rep: S.rep, capLvl: S.capLvl, spdLvl: S.spdLvl, priceLvl: S.priceLvl,
    served: S.served, lost: S.lost, caught: S.caught, tut: S.tut,
    earned: Math.round(S.earned), company: S.company, runId: S.runId, ctrl: S.ctrl,
    auto: (S.auto || []).map(function (v) { return v ? 1 : 0; }), hero: S.hero || null,
    areas: AREAS.map(function (a) { return [a.locked ? 1 : 0, a.lvl]; }),
    pads: PADS.map(function (p) { return [Math.round(p.paid), p.lvl || 0, p.price || 0]; }),
    slots: SLOTS.map(function (s) { return s.b; }),
    decor: DECOR.map(function (d) { return d.got ? 1 : 0; }),
    proj: [Math.round(project.inv), project.stage, project.done ? 1 : 0],
    serv: servSave(),
    day: [day.n, Math.round(day.t), day.market ? 1 : 0, day.feat || ''],
    stalls: counters.map(function (c) { return [c.key, c.open ? 1 : 0]; }),
    workers: workers.map(function (w) { return [w.role, w.zone === undefined ? 0 : w.zone]; }),
    mk: M
  };
}
/* yalnız çalışan (başlatılmış) bir oyun, kendi slotuna yazılır */
function save() {
  savePref();
  if (!S.started || !curSlot) return;
  submitScore();
  Store.set(slotKey(curSlot), JSON.stringify(buildSave()));
  Store.set(LAST_KEY, String(curSlot));
}
function loadFrom(d) {
  if (!d) return false;
  try {
    S.cash = d.cash || 0; S.rep = d.rep || 0; S.capLvl = d.capLvl || 0; S.spdLvl = d.spdLvl || 0;
    S.priceLvl = d.priceLvl || 0; S.served = d.served || 0; S.lost = d.lost || 0;
    S.caught = d.caught || 0; S.tut = d.tut || 0;
    S.play = d.play || 0; S.savedAt = d.at || 0;
    S.ctrl = d.ctrl !== undefined ? d.ctrl : ((d.tut || 0) > 0 || (d.play || 0) > 20 ? 2 : 0);
    S.earned = d.earned || 0; S.company = cleanName(d.company || '') || ''; S.runId = d.runId || '';
    S.auto = Array.isArray(d.auto) ? d.auto.map(function (v) { return !!v; }) : [];
    S.hero = cleanHero(d.hero);
    if (d.areas) d.areas.forEach(function (v, i) { if (AREAS[i]) { AREAS[i].locked = !!v[0]; AREAS[i].lvl = v[1] || 1; } });
    if (d.pads) d.pads.forEach(function (v, i) { if (PADS[i]) { PADS[i].paid = v[0]; PADS[i].lvl = v[1]; if (v[2]) PADS[i].price = v[2]; } });
    if (d.slots) d.slots.forEach(function (v, i) { if (SLOTS[i]) SLOTS[i].b = v; });
    if (d.decor) d.decor.forEach(function (v, i) { if (DECOR[i]) DECOR[i].got = !!v; });
    if (d.proj) { project.inv = d.proj[0] || 0; project.stage = d.proj[1] || 0; project.done = !!d.proj[2]; }
    servLoad(d.serv);   /* v0.4 §41 — yoksa hiçbir bina kurulmaz, para kesilmez */
    rebuildCounters();  /* hedef stoklar yüklenmeden önce tezgâhlar var olmalı */
    loadDay(d);         /* v1.2 §9 — gün, depo ve hedef stoklar korunur */
    if (d.workers) d.workers.forEach(function (r) {
      /* v2.1: [rol, bölge]; eski kayıtlarda düz rol dizisi vardı. Kaldırılmış roller atlanır,
         kilitli/dolmuş bölgeye kayıtlı çalışan uygun bir bölgeye kaydırılır. */
      var role = typeof r === 'string' ? r : (r && r[0]);
      if (!ROLES[role]) return;
      var z = typeof r === 'string' ? 0 : parseInt(r[1], 10);
      if (ROLES[role].zone === false) { hire(role, true, -1); return; }
      if (isNaN(z) || !zoneOpen(z) || zoneFree(z) <= 0) {
        z = -1;
        for (var q = 0; q < zoneCount(); q++) if (zoneOpen(q) && zoneFree(q) > 0) { z = q; break; }
        if (z < 0) return;                  /* hiç yer yoksa çalışan yüklenmez */
      }
      hire(role, true, z);
    });
    if (d.mk) M = migrateMarket(d.mk);
    return true;
  } catch (e) { return false; }
}
/* açılıştaki temiz dünyaya dön (sayfa yenilemeden) */
function resetWorld() {
  var k;
  if (typeof closeBar === 'function') closeBar();
  workers.length = 0; customers.length = 0; flyers.length = 0; floats.length = 0; puffs.length = 0;
  event = null; eventT = 0; nextEvent = 80;
  for (k in S0) S[k] = S0[k];
  player.x = 4.5; player.y = 3.2; player.vx = 0; player.vy = 0; player.carry.length = 0; player.act = 0;
  for (k = 0; k < spots.length; k++) { spots[k].stock.length = 0; spots[k].t = 0; }
  for (k = 0; k < tables.length; k++) { var tb = tables[k]; tb.inn.length = 0; tb.cur = null; tb.t = 0; tb.worker = null; tb.mat.items.length = 0; }
  smoker.inn.length = 0; smoker.cur = null; smoker.t = 0; smoker.belt = 0; smoker.mat.items.length = 0;
  counters.length = 0;
  day.feat = null; day.last = null;
  M = newMarket();
  loadFrom(BOOT);
  if (!M) M = newMarket();
  lastRepLvl = repLevel(); lvlUpT = 0; ctrlWalk = 0; stallPrompt = false; playLogged = false;
  netSent.at = 0; netSent.s = -1; netSent.busy = false; netSent.dirty = false;
  camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
}
/* slotu belleğe yükle (oyunu başlatmaz) */
function useSlot(n) {
  resetWorld();
  var d = readSlot(n);
  if (d) loadFrom(d);
  if (!M) M = newMarket();
  curSlot = n;
  lastRepLvl = repLevel();
  camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
}
function deleteSlot(n) {
  Store.del(slotKey(n));
  if (parseInt(Store.get(LAST_KEY), 10) === n) Store.del(LAST_KEY);
  if (curSlot === n) { resetWorld(); curSlot = 0; }
}
/* --- kayıt özeti --- */
function metaOf(d) {
  if (!d) return null;
  return { at: d.at || 0, cash: d.cash || 0, rep: d.rep || 0, served: d.served || 0, play: d.play || 0,
    co: d.company || '', earned: d.earned || 0, fish: d.caught || 0, day: (d.day && d.day[0]) || 1,
    areas: (d.areas || []).filter(function (a) { return !a[0]; }).length };
}
function saveMeta(n) { return metaOf(readSlot(n === undefined ? (curSlot || lastSlot()) : n)); }
function clockStr(sec) {
  sec = Math.max(0, Math.round(sec));
  var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
  if (h) return lang === 'tr' ? (h + 'sa ' + m + 'dk') : (h + 'h ' + m + 'm');
  if (m) return lang === 'tr' ? (m + 'dk') : (m + 'm');
  return lang === 'tr' ? (sec + 'sn') : (sec + 's');
}
function agoStr(ts) {
  if (!ts) return T('never');
  var d = new Date(ts), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ' • ' + p2(d.getDate()) + '.' + p2(d.getMonth() + 1);
}
function saveSummary(m) {
  if (!m) return T('noSave');
  return (m.co ? '« ' + m.co + ' »\n' : '') + T('saveLine', { t: agoStr(m.at), c: money(m.cash), r: m.rep, s: m.served, p: clockStr(m.play) });
}
function manualSave(msg) {
  save();
  S.savedAt = Date.now();
  refreshSaveInfo();
  toast(msg || T('saved', { t: agoStr(S.savedAt) }));
  sfx.star && sfx.star();
}
function refreshSaveInfo() {
  var ls = lastSlot(), m = saveMeta(ls || undefined), any = slotCount();
  if (el.setSaveInfo) el.setSaveInfo.textContent = curSlot ? T('slotN', { n: curSlot }) + ' • ' + saveSummary(saveMeta(curSlot)) : T('noSave');
  if (el.saveInfo) {
    el.saveInfo.textContent = (ls ? T('slotN', { n: ls }) + ' • ' : '') + saveSummary(m) +
      (Store.persistent ? '' : '\n' + T('noStorage'));
    el.saveInfo.classList.toggle('hidden', !m && Store.persistent);
  }
  if (el.newBtn) el.newBtn.classList.toggle('hidden', !any);
  if (el.loadBtn) el.loadBtn.classList.toggle('hidden', !any);
  if (el.playBtn) el.playBtn.textContent = ls ? T('resume') : T('newGame');
  if (el.resetBtn) el.resetBtn.classList.toggle('hidden', !curSlot);
}

/* --- DURAKLATMA (pause) --- */
var paused = false;
function anyOverlay() {
  if (hiddenPause) return true;                 /* sekme arkada: oyun donar */
  return !el.settingsScreen.classList.contains('hidden') || !el.menuScreen.classList.contains('hidden') ||
    !el.dayScr.classList.contains('hidden') || !el.prepScr.classList.contains('hidden') ||
    !el.stallScr.classList.contains('hidden') || !el.boardScr.classList.contains('hidden');
}
function syncPause() {
  paused = S.started && anyOverlay();
  el.pauseBadge.classList.toggle('hidden', !paused);
  if (paused) el.pauseTxt.textContent = T('paused');
}
function openSettings(fromMenu) {
  el.settingsScreen.classList.remove('hidden');
  el.settingsScreen.dataset.from = fromMenu ? 'menu' : (S.started ? 'game' : 'start');
  syncSettingsUI(); refreshSaveInfo(); syncPause();
}
function openPauseMenu() {
  renderTab(); el.menuScreen.classList.remove('hidden'); syncPause();
}
function saveAndQuit() {
  submitScore(true);
  manualSave(T('savedQuit'));
  el.settingsScreen.classList.add('hidden');
  el.menuScreen.classList.add('hidden');
  closeBar();
  S.started = false;
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('objective').classList.add('hidden');
  el.devbar.classList.add('hidden');
  el.coach.classList.add('hidden'); el.lvlUp.classList.add('hidden'); lvlUpT = 0;
  if (el.tradeBtn) el.tradeBtn.classList.add('hidden');
  el.startScreen.classList.remove('hidden');
  refreshSaveInfo(); syncPause(); musicPlay('menu');
}

/* =========================================================
   TAŞIMA / ETKİLEŞİM
   ========================================================= */
function capOf(a) { return a.isPlayer ? capacity() : ROLES[a.role].cap; }
function fits(a, it) { return carryW(a) + itemW(it) <= capOf(a); }
function popCarry(a, test) { for (var i = a.carry.length - 1; i >= 0; i--) if (test(a.carry[i])) return a.carry.splice(i, 1)[0]; return null; }
function hasCarry(a, test) { for (var i = 0; i < a.carry.length; i++) if (test(a.carry[i])) return true; return false; }
var isFish = function (it) { return it.k === 'fish'; };
var isFileto = function (it) { return it.k === 'fileto'; };
var isGoods = function (it) { return it.k === 'fileto' || it.k === 'fume'; };
var isMoney = function (it) { return it.k === 'money'; };
function itemKey(it) { return it.k + '|' + it.f; }
function carryTopZ(a, i) { return 15 + i * 3.4; }

function addFloat(x, y, txt, col) {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i];
    if (f.col === col && f.t < 0.4 && f.num && txt.charAt(0) === '+' && dist2(f.x, f.y, x, y) < 1.4) {
      var add = parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
      f.num += add; f.txt = '+' + money(f.num); f.t = 0; return;
    }
  }
  var n = txt.charAt(0) === '+' ? (parseFloat(txt.replace(/[^0-9]/g, '')) || 0) : 0;
  floats.push({ x: x, y: y, t: 0, txt: txt, col: col || '#fff', num: n });
}
function addPuff(x, y, col) {
  for (var i = 0; i < 5; i++) puffs.push({ x: x, y: y, z: rnd(4, 10), vx: rnd(-.5, .5), vy: rnd(-.5, .5), vz: rnd(12, 28), t: 0, col: col || '#fff' });
}
function fly(x0, y0, z0, x1, y1, z1, it, dur) {
  flyers.push({ x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, it: it, t: 0, d: dur || 0.4, h: rnd(18, 30) });
}

function canStand(x, y) {
  for (var i = 0; i < AREAS.length; i++) {
    var a = AREAS[i]; if (a.locked) continue;
    if (x > a.x0 + 0.35 && x < a.x1 - 0.35 && y > a.y0 - 0.02 && y < a.y1 + 0.02) return true;
  }
  return false;
}
function maxOpenY() { var m = 0; for (var i = 0; i < AREAS.length; i++) if (!AREAS[i].locked) m = Math.max(m, AREAS[i].y1); return m; }
function moveActor(a, dx, dy, spd, dt) {
  var L = Math.hypot(dx, dy);
  if (L < 0.001) { a.vx = 0; a.vy = 0; return false; }
  dx /= L; dy /= L;
  var nx = a.x + dx * spd * dt, ny = a.y + dy * spd * dt;
  if (canStand(nx, a.y)) a.x = nx;
  if (canStand(a.x, ny)) a.y = ny;
  a.vx = dx; a.vy = dy; a.face = pX(dx, dy) >= 0 ? 1 : -1; a.bob += dt * 12;
  return true;
}
function goTo(a, tx, ty, spd, dt, stopR) {
  var dx = tx - a.x, dy = ty - a.y, L = Math.hypot(dx, dy);
  if (L <= (stopR || 0.5)) { a.vx = 0; a.vy = 0; return true; }
  moveActor(a, dx, dy, spd, dt); return false;
}
function actDelay(a) { return a.isPlayer ? 0.075 : 0.1; }
function tryTake(a, dt, fn) { a.act -= dt; if (a.act > 0) return true; a.act = actDelay(a); fn(); return true; }

/* Bir bölgeden birden çok tür geçiyorsa hamal, tezgâhı en aç olan türü alır;
   böylece kesim masası tek türle dolup diğer hatları aç bırakmaz. */
function neediestIndex(s, a) {
  var best = -1, bs = -1e9;
  for (var i = s.stock.length - 1; i >= 0; i--) {
    var it = s.stock[i];
    if (!fits(a, it)) continue;
    var c = stallOf(it.f);
    if (!c) continue;                                   /* tezgâhı kapalı türü alma */
    var fill = c.buffer.length / Math.max(1, counterMax(c));
    var waiting = 0;
    for (var q = 0; q < c.slots.length; q++) if (c.slots[q] && c.slots[q].state === 'wait') waiting++;
    var sc = waiting * 8 - fill * 10 + (i === s.stock.length - 1 ? 0.5 : 0);
    if (sc > bs) { bs = sc; best = i; }
  }
  if (best < 0) for (var j = s.stock.length - 1; j >= 0; j--) if (fits(a, s.stock[j])) return j;
  return best;
}
function iPickFish(a, s, dt) {
  if (!s.stock.length) return false;
  var idx = a.isPlayer ? s.stock.length - 1 : neediestIndex(s, a);
  if (idx < 0 || !s.stock[idx]) return false;
  var it = s.stock[idx];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    s.stock.splice(idx, 1); a.carry.push(it);
    fly(s.x, s.y + 0.9, 8, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26);
    if (a.isPlayer) sfx.splash(); else sfx.pick();
  });
}
/* v2.1: masa yalnız kendi bölgesinin balığını alır */
function iDropTable(a, tb, dt) {
  if (tb.inn.length >= tb.max) return false;
  var ok = function (it) { return tableAccepts(tb, it); };
  if (!hasCarry(a, ok)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, ok); tb.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), tb.x, tb.y, 11, it, 0.26); sfx.drop();
  });
}
function iPickMat(a, mat, dt, filter) {
  var idx = -1;
  for (var i = mat.items.length - 1; i >= 0; i--) if (!filter || filter(mat.items[i])) { idx = i; break; }
  if (idx < 0) return false;
  var it = mat.items[idx];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    mat.items.splice(idx, 1); a.carry.push(it);
    fly(mat.x, mat.y, 6, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
function iDropSmoker(a, dt) {
  if (smoker.inn.length >= smoker.max || !hasCarry(a, isFileto)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFileto); smoker.inn.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), smoker.x, smoker.y, 12, it, 0.26); sfx.drop();
  });
}
function counterWants(c) {
  var m = {}, i, k;
  for (i = 0; i < c.slots.length; i++) {
    var cu = c.slots[i];
    if (cu && cu.state === 'wait') { k = cu.ord.k + '|' + cu.ord.f; m[k] = (m[k] || 0) + (cu.ord.need - cu.ord.got); }
  }
  for (i = 0; i < c.buffer.length; i++) { k = itemKey(c.buffer[i]); if (m[k] > 0) m[k]--; }
  return m;
}
function globalWants() {
  var list = openCounters(), g = {};
  for (var i = 0; i < list.length; i++) {
    if (!list[i].open) continue;
    var m = counterWants(list[i]);
    for (var k in m) if (m[k] > 0) g[k] = (g[k] || 0) + m[k];
  }
  return g;
}
/* v2.1: tezgâhtar yalnız kendi bölgesinin tezgâh taleplerini görür */
function zoneWants(w) {
  var list = openCounters(), g = {};
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    if (!c.open || !counterInZone(c, w)) continue;
    var m = counterWants(c);
    for (var k in m) if (m[k] > 0) g[k] = (g[k] || 0) + m[k];
  }
  return g;
}
/* ürün bu çalışanın bölgesinde teslim edilebilir mi */
function deliverableFor(it, w) {
  if (!isGoods(it)) return false;
  if (M && M.office && contractWants(it)) return true;
  if (w && w.zone >= 0 && zoneOfFish(it.f) !== w.zone) return false;
  var c = stallOf(it.f);
  return !!c && c.buffer.length < counterMax(c);
}
function acceptsAt(c, it) { return isGoods(it) && !!c.fish && c.open && it.f === c.fish; }
function iDropCounter(a, c, dt) {
  if (c.buffer.length >= counterMax(c)) return false;
  var m = counterWants(c), want = null, any = null, i;
  for (i = 0; i < a.carry.length; i++) {
    var it = a.carry[i];
    if (!acceptsAt(c, it)) continue;          /* tür ↔ tezgâh eşleşmesi zorunlu */
    if (!any) any = it;
    if (m[itemKey(it)] > 0) { want = it; break; }
  }
  if (!want && !any) return false;
  if (!want && c.buffer.length >= 7) return false;
  return tryTake(a, dt, function () {
    var pickIt = want || any;
    var got = popCarry(a, function (q) { return q === pickIt; });
    c.buffer.push(got);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), c.x, c.y, 13, got, 0.26); sfx.drop();
  });
}
function iPickMoney(a, c, dt) {
  if (!c.tray.items.length) return false;
  var it = c.tray.items[c.tray.items.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    c.tray.items.pop(); a.carry.push(it);
    fly(c.tray.x, c.tray.y, 6, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
/* v0.5 — oyuncu tezgâh kasasından geçince para doğrudan hesaba geçer (merkeze dönmek gerekmez) */
function iCollectTray(a, c, dt) {
  if (!c.tray.items.length) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.06;
  var it = c.tray.items.pop();
  S.cash += it.v; earn(it.v);
  fly(c.tray.x, c.tray.y, 6, a.x, a.y, 22, it, 0.22);
  addFloat(a.x, a.y - 0.9, '+' + money(it.v), '#8ef2a2'); sfx.coin();
  return true;
}
/* tezgâh kasası kapasitesi: dolunca o tezgâha yeni müşteri gelmez */
function trayValue(c) { var v = 0; for (var i = 0; i < c.tray.items.length; i++) v += c.tray.items[i].v; return v; }
function trayCap(c) { return 350 + (AREAS[c.z].lvl - 1) * 250 + c.z * 150; }
function trayFull(c) { return trayValue(c) >= trayCap(c); }
function iDeposit(a, dt) {
  if (!hasCarry(a, isMoney)) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.05;
  var it = popCarry(a, isMoney);
  S.cash += it.v; earn(it.v); safe.pop = 1;
  fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), safe.x, safe.y, 13, it, 0.24);
  addFloat(safe.x, safe.y - 0.4, '+' + money(it.v), '#8ef2a2'); sfx.coin();
  return true;
}

/* =========================================================
   OYUNCU
   ========================================================= */
function updatePlayer(dt) {
  var ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (stick.active) { ix += stick.dx * 1.6; iy += stick.dy * 1.6; }
  ix = clamp(ix, -1, 1); iy = clamp(iy, -1, 1);
  var wx = (ix / (TW / 2) + iy / (TH / 2)) * (TW / 4);
  var wy = (iy / (TH / 2) - ix / (TW / 2)) * (TW / 4);
  var ox = player.x, oy = player.y;
  moveActor(player, wx, wy, speed(), dt);
  var mv = Math.hypot(player.x - ox, player.y - oy);
  moveDir.on = mv > 0.0005; moveDir.x = wx; moveDir.y = wy;
  if (S.ctrl === 0) ctrlWalk += mv;

  var acted = false, i;
  /* §8: para taşıyorken kasa önceliklidir */
  if (hasCarry(player, isMoney) && dist2(player.x, player.y, safe.x, safe.y) < 3.2) {
    iDeposit(player, dt);
    return;
  }
  for (i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked || zoneAuto(i)) continue;
    if (dist2(player.x, player.y, s.x, s.y + 0.9) < 1.6) acted = iPickFish(player, s, dt) || acted;
  }
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (AREAS[tb.z].locked || zoneAuto(i)) continue;
    if (dist2(player.x, player.y, tb.x, tb.y) < 1.6) acted = iDropTable(player, tb, dt) || acted;
    if (dist2(player.x, player.y, tb.mat.x, tb.mat.y) < 1.5) acted = iPickMat(player, tb.mat, dt) || acted;
  }
  if (!AREAS[smoker.z].locked && !zoneAuto(smoker.z)) {
    if (dist2(player.x, player.y, smoker.x, smoker.y) < 1.6) acted = iDropSmoker(player, dt) || acted;
    if (dist2(player.x, player.y, smoker.mat.x, smoker.mat.y) < 1.5) acted = iPickMat(player, smoker.mat, dt) || acted;
  }
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked || !c.open) continue;
    if (dist2(player.x, player.y, c.x, c.y) < 1.8 && !(c.fish && zoneAuto(zoneOfFish(c.fish)))) acted = iDropCounter(player, c, dt) || acted;
    if (dist2(player.x, player.y, c.tray.x, c.tray.y) < 1.5) acted = iCollectTray(player, c, dt) || acted;
  }
  if (dist2(player.x, player.y, safe.x, safe.y) < 1.8) acted = iDeposit(player, dt) || acted;
  /* çöp kovası: yanlışlıkla atmamak için önce kısa bir bekleme */
  var nearBin = null;
  for (i = 0; i < BINS.length; i++) if (!AREAS[BINS[i].z].locked && dist2(player.x, player.y, BINS[i].x, BINS[i].y) < 0.85) nearBin = BINS[i];
  if (nearBin && !acted && hasCarry(player, isTrash)) { binT += dt; if (binT > 0.45) acted = iTrash(player, nearBin, dt) || acted; }
  else binT = 0;
  /* tezgâhın önünde elindeki malı bırakamıyorsan çöp kovasını hatırlat */
  var atStall = false;
  for (i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked && dist2(player.x, player.y, counters[i].x, counters[i].y) < 1.8) atStall = true;
  if (atStall && !acted && hasCarry(player, isGoods)) {
    stuckT += dt;
    if (stuckT > 1.4 && gameT - stuckHintAt > 20) { stuckHintAt = gameT; toast(T('trashHint')); }
  } else stuckT = 0;
  if (officeBuilt() && dist2(player.x, player.y, office.x, office.y) < 3.4) acted = iDeliverContract(player, dt) || acted;
  if (!acted) player.act = 0;
}

/* =========================================================
   ÇALIŞANLAR
   ========================================================= */
function hire(role, silent, zone) {
  if (!ROLES[role]) return null;            /* kaldırılmış rol (ör. eski dagitim) yüklenmez */
  var z = zone === undefined ? 0 : zone;
  if (ROLES[role] && ROLES[role].zone === false) z = -1;
  var home = z >= 0 && spots[z] ? spots[z] : spots[0];
  var w = {
    role: role, zone: z, x: home.x + rnd(0.6, 1.6), y: home.y + rnd(0.8, 1.8), z: 0, vx: 0, vy: 0,
    carry: [], act: 0, bob: 0, face: 1, table: null, mode: 'load', name: pick(WNAMES)
  };
  workers.push(w);
  if (role === 'filetocu') assignFiletocu(w);
  if (role === 'tezgahtar') assignVendor(w);
  if (!silent) { toast(T('hiredZ', { i: ROLES[role].icon, n: w.name, z: z >= 0 ? NM(AREAS[z].n) : T('harborWide') })); }
  return w;
}
function assignFiletocu(w) {
  var t = zoneTable(w.zone);                                     /* v2.1: kendi bölgesinin masası */
  if (t && !AREAS[t.z].locked && (!t.worker || t.worker === w)) { t.worker = w; w.table = t; return; }
  for (var i = 0; i < tables.length; i++) {
    if (AREAS[tables[i].z].locked || tables[i].worker) continue;
    if (i !== w.zone) continue;
    tables[i].worker = w; w.table = tables[i]; return;
  }
  w.table = null;
}
function reassignWorkers() {
  for (var i = 0; i < workers.length; i++) {
    if (workers[i].role === 'filetocu' && !workers[i].table) assignFiletocu(workers[i]);
    if (workers[i].role === 'tezgahtar') { var c = counterByKey(workers[i].stall); if (!c || AREAS[c.z].locked) assignVendor(workers[i]); }
  }
}
/* v0.5 — her tezgâhın kendi tezgâhtarı: bölgedeki en az tezgâhtarı olan tezgâha atanır */
function assignVendor(w) {
  var best = null, bn = 1e9;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i];
    if (AREAS[c.z].locked || !c.fish || zoneOfFish(c.fish) !== w.zone) continue;
    var n = 0;
    for (var j = 0; j < workers.length; j++) if (workers[j] !== w && workers[j].role === 'tezgahtar' && workers[j].stall === c.key) n++;
    if (n < bn) { bn = n; best = c; }
  }
  w.stall = best ? best.key : null;
}
function stallLabel(key) { var c = counterByKey(key); return c && c.fish ? T('stallOfFish', { f: NM(FISH[c.fish].n) }) : ''; }

/* ---------- v0.5 — PERSONELE DEVRET (tam otomasyon) ----------
   Bir bölgede 4 rolün hepsi (hamal, filetocu, tezgâhtar, tahsildar) varsa bölge personele
   devredilebilir: oyuncu o bölgede istasyonlara karışmaz (geçerken sadece kasayı toplar),
   ekip ustabaşı primiyle %20 hızlı çalışır, tezgâhta ⚙ OTOMATİK rozeti görünür. */
function zoneChain(z) {
  var o = { ok: true, miss: [] };
  for (var i = 0; i < ZONE_ROLES.length; i++) {
    var r = ZONE_ROLES[i], n = 0;
    for (var j = 0; j < workers.length; j++) if (workers[j].zone === z && workers[j].role === r) n++;
    o[r] = n;
    if (!n) { o.ok = false; o.miss.push(NM(ROLES[r].n)); }
  }
  return o;
}
function zoneAuto(z) { return !!(S.auto && S.auto[z]) && zoneOpen(z) && zoneChain(z).ok; }
function setZoneAuto(z, on) {
  if (!S.auto) S.auto = [];
  if (on && !zoneChain(z).ok) { toast(T('autoMissing', { m: zoneChain(z).miss.join(', ') })); sfx.bad(); return; }
  S.auto[z] = !!on;
  toast(T(on ? 'autoOn' : 'autoOff', { n: NM(AREAS[z].n) }));
  if (on) { sfx.star(); var c = zoneCounter(z); if (c) addPuff(c.x, c.y, '#ffc94a'); } else sfx.tap();
  save(); renderBar();
}
function openTables() { return tables.filter(function (t) { return !AREAS[t.z].locked; }); }
function openCounters() { return counters.filter(function (c) { return !AREAS[c.z].locked; }); }
/* v2.1: hamal yalnız kendi bölgesinin ağından alır */
function bestSpot(w) {
  if (w && w.zone >= 0) { var sz = zoneSpot(w.zone); return (sz && !AREAS[sz.z].locked) ? sz : null; }
  var best = null, bs = -1e9;
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked) continue;
    var sc = s.stock.length * 3 - (w ? Math.sqrt(dist2(w.x, w.y, s.x, s.y)) : 0);
    if (sc > bs) { bs = sc; best = s; }
  } return best;
}
/* v2.1: yalnız kendi bölgesinin kesim masası */
function tableWithSpace(w) {
  if (w && w.zone >= 0) {
    var t = zoneTable(w.zone);
    return (t && !AREAS[t.z].locked && t.inn.length < t.max) ? t : null;
  }
  var list = openTables().filter(function (t2) { return t2.inn.length < t2.max; }), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var d = (w ? dist2(w.x, w.y, list[i].x, list[i].y) : 0) + list[i].inn.length * 2;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
/* bir tezgâh bu çalışanın bölgesine mi ait */
function counterInZone(c, w) {
  if (!w || w.zone < 0 || !c.fish) return true;
  return zoneOfFish(c.fish) === w.zone;
}
function counterWantingCarry(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i]; if (c.buffer.length >= counterMax(c)) continue;
    if (!c.open || !counterInZone(c, w)) continue;
    var m = counterWants(c), hit = false;
    for (var j = 0; j < w.carry.length; j++) if (acceptsAt(c, w.carry[j]) && m[itemKey(w.carry[j])] > 0) { hit = true; break; }
    if (!hit) continue;
    var d = dist2(w.x, w.y, c.x, c.y) * (w.stall === c.key ? 0.2 : 1);   /* kendi tezgâhı önce */
    if (d < bd) { bd = d; best = c; }
  } return best;
}
function nearestCounterWithSpace(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    if (c.buffer.length >= 7) continue;
    if (!c.open || !counterInZone(c, w)) continue;
    var ok = false;
    for (var j = 0; j < w.carry.length; j++) if (acceptsAt(c, w.carry[j])) { ok = true; break; }
    if (!ok) continue;                       /* yalnız kendi türünü kabul eden tezgâh */
    var d = dist2(w.x, w.y, c.x, c.y) * (w.stall === c.key ? 0.2 : 1);
    if (d < bd) { bd = d; best = c; }
  } return best;
}
/* ürün bir yere teslim edilebilir mi (kendi tezgâhı ya da kontrat) */
function deliverable(it) {
  if (!isGoods(it)) return false;
  if (M && M.office && contractWants(it)) return true;
  var c = stallOf(it.f);
  return !!c && c.buffer.length < counterMax(c);
}
function matWith(filter, w) {
  var mats, i, j, best = null, bd = 1e9;
  if (w && w.zone >= 0) {                                   /* v2.1: yalnız kendi bölgesi */
    mats = [];
    var mt = zoneTable(w.zone);
    if (mt && !AREAS[mt.z].locked) mats.push(mt.mat);
    if (!AREAS[smoker.z].locked && smoker.z === w.zone) mats.push(smoker.mat);
  } else {
    mats = openTables().map(function (t) { return t.mat; });
    if (!AREAS[smoker.z].locked) mats.push(smoker.mat);
  }
  for (i = 0; i < mats.length; i++) {
    var has = false;
    for (j = 0; j < mats[i].items.length; j++) if (filter(mats[i].items[j])) { has = true; break; }
    if (!has) continue;
    var d = w ? dist2(w.x, w.y, mats[i].x, mats[i].y) : 0;
    if (d < bd) { bd = d; best = mats[i]; }
  } return best;
}
function trayWithMoney(minN, w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    if (list[i].tray.items.length < (minN || 1)) continue;
    if (w && w.zone >= 0 && !counterInZone(list[i], w)) continue;
    var d = w ? dist2(w.x, w.y, list[i].tray.x, list[i].tray.y) : 0;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function updateWorkers(dt) {
  var mul = workerSpeedMul();
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i], R2 = ROLES[w.role];
    if (!R2) { workers.splice(i--, 1); continue; }
    var sp = R2.speed * mul * (w.zone >= 0 && zoneAuto(w.zone) ? 1.2 : 1);
    if (w.role === 'hamal') aiHamal(w, sp, dt);
    else if (w.role === 'tezgahtar') aiTezgahtar(w, sp, dt);
    else if (w.role === 'kasiyer') aiKasiyer(w, sp, dt);
    else aiFiletocu(w, sp, dt);
  }
}
function aiHamal(w, sp, dt) {
  var full = carryW(w) >= ROLES.hamal.cap - 0.5;
  var s = bestSpot(w);
  var canLoad = s && s.stock.length && fits(w, s.stock[s.stock.length - 1]);
  if (w.mode !== 'drop' && (full || !canLoad) && hasCarry(w, isFish)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isFish)) w.mode = 'load';
  if (w.mode === 'drop') {
    var t = tableWithSpace(w);
    if (t) { if (goTo(w, t.x - 0.1, t.y - 0.35, sp, dt, 0.9)) iDropTable(w, t, dt); }
    else if (s) goTo(w, s.x + 1.5, s.y + 1.8, sp, dt, 1.2);
    return;
  }
  if (canLoad) { if (goTo(w, s.x + 0.5, s.y + 1.3, sp, dt, 0.8)) iPickFish(w, s, dt); return; }
  if (hasCarry(w, isFish)) { w.mode = 'drop'; return; }
  if (s) goTo(w, s.x + 1.5, s.y + 1.8, sp, dt, 1.2);
}
function aiTezgahtar(w, sp, dt) {
  var full = carryW(w) >= ROLES.tezgahtar.cap - 0.5, i, k;
  var g = zoneWants(w);
  for (i = 0; i < w.carry.length; i++) { k = itemKey(w.carry[i]); if (g[k] > 0) g[k]--; }
  var wantFilter = function (it) { return g[itemKey(it)] > 0; };
  var m = matWith(wantFilter, w);
  var zoneDeliver = function (it) { return deliverableFor(it, w); };
  var stockLow = openCounters().filter(function (q) { return q.open && counterInZone(q, w) && q.buffer.length < 5; }).length > 0;
  var filt = wantFilter;
  if (!m && stockLow) { m = matWith(zoneDeliver, w); filt = zoneDeliver; }
  if (w.mode !== 'drop' && (full || !m) && hasCarry(w, isGoods)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isGoods)) w.mode = 'load';
  if (w.mode === 'drop') {
    if (officeBuilt() && M.active.length) {
      var hasCtr = false;
      for (i = 0; i < w.carry.length; i++) if (isGoods(w.carry[i]) && contractWants(w.carry[i])) { hasCtr = true; break; }
      if (hasCtr) { if (goTo(w, office.x, office.y + 1.1, sp, dt, 1.0)) iDeliverContract(w, dt); return; }
    }
    var c = counterWantingCarry(w) || nearestCounterWithSpace(w);
    if (c) { w.idleT = 0; if (goTo(w, c.x - 0.5, c.y - 0.6, sp, dt, 1.0)) { if (!iDropCounter(w, c, dt)) w.mode = 'load'; } }
    else {
      w.idleT = (w.idleT || 0) + dt;
      var back = matWith(function () { return true; }, w) || (zoneTable(w.zone) && zoneTable(w.zone).mat) || (openTables()[0] && openTables()[0].mat);
      if (w.idleT > 8 && back && back.items.length < 18) {
        if (goTo(w, back.x, back.y, sp, dt, 0.8)) {
          var gi = popCarry(w, isGoods);
          if (gi) { back.items.push(gi); fly(w.x, w.y, carryTopZ(w, w.carry.length + 1), back.x, back.y, 6, gi, 0.26); }
          if (!hasCarry(w, isGoods)) { w.idleT = 0; w.mode = 'load'; }
        }
      } else idleAtZone(w, sp, dt);
    }
    return;
  }
  if (m && !full) {
    if (goTo(w, m.x, m.y, sp, dt, 0.8)) { if (!iPickMat(w, m, dt, filt)) w.mode = 'drop'; }
    return;
  }
  if (hasCarry(w, isGoods)) { w.mode = 'drop'; return; }
  idleAtZone(w, sp, dt);
}
/* bölgesinde boşta bekleme noktası */
function idleAtZone(w, sp, dt) {
  var t = zoneTable(w.zone) || tables[0];
  goTo(w, t.x + 1.4, t.y + 1.2, sp, dt, 1.1);
}
function aiKasiyer(w, sp, dt) {
  var full = carryW(w) >= ROLES.kasiyer.cap - 0.5;
  var c = trayWithMoney(1, w);
  if (w.mode !== 'drop' && (full || !c) && hasCarry(w, isMoney)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isMoney)) w.mode = 'load';
  if (w.mode === 'drop') { if (goTo(w, safe.x + 0.35, safe.y + 0.35, sp, dt, 0.9)) iDeposit(w, dt); return; }
  if (c) { if (goTo(w, c.tray.x, c.tray.y, sp, dt, 0.8)) iPickMoney(w, c, dt); return; }
  if (hasCarry(w, isMoney)) { w.mode = 'drop'; return; }
  var home = zoneCounter(w.zone);                   /* boşta: kendi bölgesinin tezgâh kasası yanında */
  if (home) goTo(w, home.tray.x - 0.9, home.tray.y + 0.5, sp, dt, 1.0);
  else goTo(w, safe.x + 1.6, safe.y - 0.7, sp, dt, 1.0);
}
function zoneCounter(z) {
  for (var i = 0; i < counters.length; i++) { var c = counters[i]; if (!AREAS[c.z].locked && c.fish && zoneOfFish(c.fish) === z) return c; }
  return null;
}
function aiFiletocu(w, sp, dt) {
  if (!w.table || AREAS[w.table.z].locked) assignFiletocu(w);
  if (!w.table) { idleAtZone(w, sp, dt); return; }
  goTo(w, w.table.x + 0.8, w.table.y + 0.15, sp, dt, 0.25);
}

/* =========================================================
   İSTASYONLAR
   ========================================================= */
function spotPick(i) {
  var ls = spotLines(i);
  if (!ls.length) return null;
  var rare = perkSum('rare');
  if (rare > 0 && Math.random() < rare * 3) {
    var best = ls[0];
    for (var q = 1; q < ls.length; q++) if (FISH[ls[q].f].val > FISH[best.f].val) best = ls[q];
    return best.f;
  }
  var tot = 0, k;
  for (k = 0; k < ls.length; k++) tot += ls[k].w;
  var r = Math.random() * tot;
  for (k = 0; k < ls.length; k++) { r -= ls[k].w; if (r <= 0) return ls[k].f; }
  return ls[0].f;
}
function updateStations(dt) {
  var i, s, t, fishMul = event ? event.fishMul : 1;
  for (i = 0; i < spots.length; i++) {
    s = spots[i]; if (AREAS[s.z].locked) continue;
    if (s.stock.length >= areaStock(s.z)) { s.t = 0; continue; }
    s.t += dt * fishMul * areaNetMul(s.z);
    if (s.t >= s.rate) {
      s.t = 0;
      var nf = spotPick(i);
      if (!nf) continue;                      /* açık hat yoksa bu ağ üretmez */
      var it = { k: 'fish', f: nf };
      s.stock.push(it); S.caught++;
      var ox = s.face === 'n' ? s.x + rnd(-1, 1) : s.x - rnd(2, 3.2);
      var oy = s.face === 'n' ? s.y - rnd(2, 3.2) : s.y + rnd(-1, 1);
      fly(ox, oy, 2, s.x, s.y + 0.9, 8, it, 0.55);
    }
  }
  for (i = 0; i < tables.length; i++) {
    t = tables[i]; if (AREAS[t.z].locked) continue;
    if (!t.cur && t.inn.length && t.mat.items.length < 16 + slotEff(t.z, 'stock')) { t.cur = t.inn.shift(); t.t = 0; }
    if (t.cur) {
      t.t += dt * (t.worker ? 1.55 : 1) * (1 + perkSum('procspeed') + perkSum('rate'));
      if (t.t >= FISH[t.cur.f].cut) {
        var F = FISH[t.cur.f];
        for (var k = 0; k < F.out; k++) {
          var fil = { k: 'fileto', f: t.cur.f };
          t.mat.items.push(fil);
          fly(t.x, t.y, 13, t.mat.x, t.mat.y, 6, fil, 0.36 + k * 0.05);
        }
        addPuff(t.x, t.y, '#ffffff'); t.cur = null; t.t = 0;
      }
    }
  }
  if (!AREAS[smoker.z].locked) {
    smoker.belt += dt;
    if (smoker.belt >= 1.0) {
      var src = tables[2].mat;
      if (smoker.inn.length < smoker.max && src.items.length) {
        smoker.belt = 0;
        var mv = src.items.pop(); smoker.inn.push(mv);
        fly(src.x, src.y, 6, smoker.x, smoker.y, 12, mv, 0.5);
      }
    }
    if (!smoker.cur && smoker.inn.length && smoker.mat.items.length < 12) { smoker.cur = smoker.inn.shift(); smoker.t = 0; }
    if (smoker.cur) {
      smoker.t += dt;
      if (smoker.t >= FUME_TIME) {
        var fm = { k: 'fume', f: smoker.cur.f };
        smoker.mat.items.push(fm);
        fly(smoker.x, smoker.y, 14, smoker.mat.x, smoker.mat.y, 6, fm, 0.4);
        addPuff(smoker.x, smoker.y, '#e8e2d8'); smoker.cur = null; smoker.t = 0;
      }
    }
  }
  for (i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked) updateCounter(counters[i], dt);
  servTick(dt);                       /* v0.4 — hizmet binası gelir/inşaat döngüsü */
  updateCats(dt);                     /* v2.0 — liman kedileri */
  updateAmbient(dt);                  /* v0.1 — hafif liman ortam sesi */
  safe.pop = Math.max(0, safe.pop - dt * 3);
  for (var bq = 0; bq < BINS.length; bq++) BINS[bq].pop = Math.max(0, BINS[bq].pop - dt * 5);
}

/* =========================================================
   MÜŞTERİ + SİPARİŞ
   ========================================================= */
function availableProducts() {
  var list = [], fs = sellableFish();
  for (var i = 0; i < fs.length; i++) {
    list.push({ k: 'fileto', f: fs[i] });
    if (canProcess('fume', fs[i])) list.push({ k: 'fume', f: fs[i] });
  }
  return list;
}
function filterByTag(list, tag) {
  return list.filter(function (p) {
    var v = FISH[p.f].val;
    if (tag === 'cheap') return p.k === 'fileto' && v <= 12;
    if (tag === 'rich') return p.k === 'fileto' && v >= 17;
    if (tag === 'premium') return p.k === 'fileto' && v >= 27;
    if (tag === 'fume') return p.k === 'fume';
    return p.k === 'fileto';
  });
}
/* müşteri tipi bu tezgâhta anlamlı mı (tür kilidi yerine tip kilidi) */
function custFits(type, c) {
  if (!c.fish) return false;
  var v = FISH[c.fish].val;
  if (type.tag === 'cheap') return v <= 18;
  if (type.tag === 'rich') return v >= 18;
  if (type.tag === 'premium') return v >= 24;
  if (type.tag === 'fume') return canProcess('fume', c.fish);
  return true;
}
/* sipariş yalnız bu tezgâhın satabildiği üründen üretilir (§ güvenlik kontrolü) */
function makeOrderFor(c, type) {
  if (!c.fish) return null;
  var f = c.fish;
  if (!canProduce(f) || !canProcess('fileto', f) || !canSell(f)) return null;
  var k = 'fileto';
  if (canProcess('fume', f) && (type.tag === 'fume' || Math.random() < 0.3)) k = 'fume';
  if (k === 'fume' && !canProcess('fume', f)) k = 'fileto';
  var need = irnd(type.qty[0], type.qty[1]);
  return { k: k, f: f, need: need, got: 0 };
}
function queueSlotPos(c, i) { return { x: 10.8 + (c.lane || 0) * 1.7, y: c.y + 0.1 + i * 1.0 }; }
function patienceMul() { return 1 + decorCount() * 0.02; }

function updateCounter(c, dt) {
  if (!c.open) return;                       /* v2.1: kapalı tezgâha müşteri gelmez */
  var custMul = (event ? event.custMul : 1) * areaFlow(c.z) * dayCustMul();
  c.spawnT -= dt * custMul;
  var qmax = queueMax(c.z), freeIdx = -1, i;
  for (i = 0; i < qmax; i++) if (!c.slots[i]) { freeIdx = i; break; }
  if (c.spawnT <= 0 && freeIdx >= 0) {
    c.spawnT = 5.4 * rnd(0.75, 1.3);
    if (!daySpawnOK()) return;                 /* gün kapanışında yeni müşteri gelmez (§2) */
    if (trayFull(c)) return;                   /* v0.5: kasa dolu — tahsildar ya da oyuncu boşaltmalı */
    /* v0.1 adalet: stoksuz tezgâha müşteri seyrek gelir, kuyrukta uzadıkça daha da seyrek.
       Umutsuz müşteri doğup boşuna kızmasın. */
    var bekleyen = 0;
    for (var bq = 0; bq < c.slots.length; bq++) if (c.slots[bq]) bekleyen++;
    if (!c.buffer.length) c.spawnT *= 3.2;                  /* stoksuz tezgâh: müşteri seyrekleşir */
    if (bekleyen >= 2) c.spawnT *= 1 + (bekleyen - 1) * 0.7; /* kuyruk uzadıkça daha da seyrek */
    /* liman geneli: servis edilemeyen talep birikmişse akış genel olarak yavaşlar */
    var toplamBekleyen = waitingCount(), acikTezgah = openStallCount();
    if (acikTezgah && toplamBekleyen > acikTezgah * 2) c.spawnT *= 1 + (toplamBekleyen / (acikTezgah * 2) - 1) * 0.9;
    /* tezgâh kullanılamıyorsa bu türe müşteri gelmez */
    if (!c.fish || !fishReady(c.fish)) return;
    var lvl = repLevel();
    var pool = CUST.filter(function (t) { return t.lvl <= lvl && (!t.serv || servUnlock(t.serv)) && custFits(t, c); });
    if (!pool.length) return;
    var prem = perkSum('premium') + perkSum('vip');
    if (prem > 0 && Math.random() < prem * 2) {
      var hi = pool.filter(function (t) { return t.mult >= 1.8; });
      if (hi.length) pool = hi;
    }
    var type = pick(pool);
    if (day.feat && Math.random() < 0.45) {           /* günün müşterisi daha sık gelir */
      var ft = pool.filter(function (t) { return t.id === day.feat; });
      if (ft.length) type = ft[0];
    }
    var ord = makeOrderFor(c, type);
    /* son güvenlik: üretilemeyen/işlenemeyen/satılamayan ürünle müşteri doğmaz */
    if (ord && (!canProduce(ord.f) || !canProcess(ord.k, ord.f) || !canSell(ord.f))) ord = null;
    if (ord) {
      var q = queueSlotPos(c, freeIdx);
      var cu = {
        x: q.x + 2.0, y: 20.5 + rnd(0, 2), z: 0, bob: rnd(0, 6), face: -1, type: type, ord: ord,
        state: 'walk', slot: freeIdx, c: c, pat: type.pat * patienceMul(), patMax: type.pat * patienceMul(),
        mood: 1, hair: irnd(0, 2), tone: irnd(0, 2)
      };
      c.slots[freeIdx] = cu; customers.push(cu);
      if (dist2(player.x, player.y, c.x, c.y) < 90) sfx.cust();
    }
  }
  c.eatT -= dt;
  if (c.eatT <= 0) {
    for (var q2 = 0; q2 < c.slots.length; q2++) {
      var cu2 = c.slots[q2];
      if (!cu2 || cu2.state !== 'wait' || cu2.ord.got >= cu2.ord.need) continue;
      var idx = -1;
      for (i = 0; i < c.buffer.length; i++) if (c.buffer[i].k === cu2.ord.k && c.buffer[i].f === cu2.ord.f) { idx = i; break; }
      if (idx < 0) continue;
      c.eatT = 0.2;
      var it = c.buffer.splice(idx, 1)[0];
      cu2.ord.got++;
      var fp = queueSlotPos(c, cu2.slot);
      fly(c.x, c.y, 13, fp.x, fp.y, 17, it, 0.26);
      if (cu2.ord.got >= cu2.ord.need) finishOrder(c, cu2);
      break;
    }
  }
}
function finishOrder(c, cu) {
  var happy = cu.pat / cu.patMax;
  var unit = prodValue(cu.ord.k, cu.ord.f);
  var pay = Math.round(cu.ord.need * unit * cu.type.mult * (happy > 0.5 ? 1.2 : 1) *
    (1 + perkSum('custval') + servEff('custval') + repBonus() + (cu.type.id === 'toptanci' ? servEff('wholesale') : 0)));
  payout(c, pay, cu.slot);
  noteFishIncome(pay); noteDayIncome(pay); noteDaySale(cu);
  cu.state = 'leave'; cu.happyLeave = true; cu.leaveT = 0; c.slots[cu.slot] = null; shiftQueue(c);
  S.served++; S.rep += Math.max(1, Math.round(cu.type.rep * (1 + servEff('rep'))));
  var fp = queueSlotPos(c, cu.slot);
  addFloat(fp.x, fp.y - 0.5, '+' + money(pay), '#ffe27a');
  addFloat(fp.x + 0.6, fp.y - 1.1, '+' + cu.type.rep + '*', '#ffd76a');
  sfx.coin(); checkRepLevel();
}
var lastRepLvl = 1, lvlUpT = 0;
function checkRepLevel() {
  var l = repLevel();
  if (l <= lastRepLvl) return;
  var from = lastRepLvl; lastRepLvl = l;
  showLevelUp(from, l);
}
/* seviye atlama: oyunu DURDURMAYAN üst şerit — seviye, unvan, açılanlar, kısa fanfar + konfeti */
function showLevelUp(from, l) {
  var un = [], k, q;
  for (k = from; k < l; k++) for (q = 0; q < REP_LEVELS[k].un.length; q++) un.push(NM(REP_LEVELS[k].un[q]));
  un.push(T('lvBonus', { p: pct((l - 1) * 2) }));
  el.lvlNum.textContent = T('lvlN', { l: l });
  el.lvlTitle.textContent = repTitle();
  el.lvlList.innerHTML = un.map(function (u) { return '<span>🔓 ' + escH(u) + '</span>'; }).join('');
  var cf = '';
  for (k = 0; k < 26; k++) cf += '<i style="left:' + Math.round(Math.random() * 100) + '%;animation-delay:' +
    (Math.random() * 0.35).toFixed(2) + 's;background:' + pick(['#ffc94a', '#e5533d', '#5fd37a', '#4fb3e8', '#f4e9d2']) +
    ';--dx:' + Math.round(rnd(-40, 40)) + 'px"></i>';
  el.lvlConf.innerHTML = cf;
  el.lvlUp.classList.remove('hidden', 'go'); void el.lvlUp.offsetWidth; el.lvlUp.classList.add('go');
  lvlUpT = 3.6;
  sfx.levelUp();
}
function updateLevelUp(dt) {
  if (lvlUpT <= 0) return;
  lvlUpT -= dt;
  if (lvlUpT <= 0) el.lvlUp.classList.add('hidden');
}
function shiftQueue(c) {
  var list = [], i;
  for (i = 0; i < c.slots.length; i++) if (c.slots[i]) list.push(c.slots[i]);
  for (i = 0; i < c.slots.length; i++) c.slots[i] = list[i] || null;
  for (i = 0; i < list.length; i++) list[i].slot = i;
}
function payout(c, total, slot) {
  var n = clamp(Math.ceil(total / 22), 1, 8), per = total / n;
  var src = queueSlotPos(c, slot || 0);
  for (var i = 0; i < n; i++) {
    if (c.tray.items.length >= 24) c.tray.items[c.tray.items.length - 1].v += per;
    else {
      var it = { k: 'money', v: per };
      c.tray.items.push(it);
      fly(src.x, src.y, 13, c.tray.x, c.tray.y, 6, it, 0.45);
    }
  }
}
function updateCustomers(dt) {
  for (var i = customers.length - 1; i >= 0; i--) {
    var cu = customers[i];
    cu.bob += dt * 4;
    if (cu.state === 'walk') {
      var p = queueSlotPos(cu.c, cu.slot);
      var dx = p.x - cu.x, dy = p.y - cu.y, L = Math.hypot(dx, dy);
      if (L < 0.14) cu.state = 'wait';
      else { cu.x += dx / L * 2.1 * dt; cu.y += dy / L * 2.1 * dt; cu.bob += dt * 8; }
    } else if (cu.state === 'wait') {
      var q = queueSlotPos(cu.c, cu.slot);
      cu.x = lerp(cu.x, q.x, 1 - Math.pow(0.001, dt));
      cu.y = lerp(cu.y, q.y, 1 - Math.pow(0.001, dt));
      cu.pat -= dt; cu.mood = clamp(cu.pat / cu.patMax, 0, 1);
      if (cu.pat <= 0) {
        cu.state = 'leave'; cu.happyLeave = false; cu.leaveT = 0; cu.c.slots[cu.slot] = null; shiftQueue(cu.c);
        S.lost++; noteDayLost();
        var pen = cu.type.pen || 0;
        if (pen) { S.rep = Math.max(0, S.rep - pen); addFloat(cu.x, cu.y - 0.6, '-' + pen + '*', '#ff8a7a'); }
        else addFloat(cu.x, cu.y - 0.6, ':(', '#ff8a7a');
        sfx.bad();
      }
    } else {
      cu.x += ((13.6 + (cu.c.lane || 0) * 1.7) - cu.x) * Math.min(1, dt * 1.6);
      cu.y += 3.6 * dt; cu.bob += dt * 8;
      if (cu.y > 23) customers.splice(i, 1);
    }
  }
}

/* =========================================================
   YATIRIM: alan / seviye / işe alım / kozmetik
   ========================================================= */
for (var _d = 0; _d < DECOR.length; _d++) {
  PADS.push({ id: 'dec' + _d, z: DECOR[_d].z, x: DECOR[_d].x, y: DECOR[_d].y, kind: 'decor',
    decor: _d, icon: DECOR[_d].icon, price: DECOR[_d].cost, lvl: 0, max: 1, paid: 0 });
}
function padPrice(p) {
  if (p.kind === 'area') return AREAS[p.target].cost;
  if (p.kind === 'arealv') { var a = AREAS[p.area]; return a.lvl < MAXLV ? a.up[a.lvl] : 0; }
  return p.price;
}
function padDone(p) {
  if (p.kind === 'area') return !AREAS[p.target].locked;
  if (p.kind === 'arealv') return AREAS[p.area].lvl >= MAXLV;
  if (p.kind === 'decor') return DECOR[p.decor].got;
  return p.lvl >= p.max;
}
function padBlocked(p) {
  if (p.kind === 'area') return S.rep < AREAS[p.target].rep;
  if (p.kind === 'hire') return workers.length >= staffCap();
  return false;
}
function padReady(p) { return !AREAS[p.z].locked && !padDone(p); }
var nearestPad = null;
/* GDD v0.3.1 §2/§8: makro satın alma zeminden kaldırıldı, alt barda */
function updatePads() { }
function applyPad(p) {
  p.paid = 0; sfx.buy();
  if (p.kind === 'cap') { S.capLvl++; p.lvl++; toast(T('capUp', { n: capacity() })); }
  else if (p.kind === 'spd') { S.spdLvl++; p.lvl++; toast(T('spdUp')); }
  else if (p.kind === 'price') { S.priceLvl++; p.lvl++; toast(T('priceUp')); }
  else if (p.kind === 'hire') { p.lvl++; hire(p.role); }
  else if (p.kind === 'area') {
    AREAS[p.target].locked = false; rebuildCounters(); reassignWorkers();
    toast(T('areaOpen', { n: NM(AREAS[p.target].n) })); sfx.build();
    
  } else if (p.kind === 'arealv') {
    var a = AREAS[p.area]; a.lvl++; rebuildCounters();
    toast(T('areaLvUp', { n: NM(a.n), l: a.lvl })); sfx.build(); 
  } else if (p.kind === 'decor') {
    DECOR[p.decor].got = true;
    toast(T('decorBought', { n: NM(DECOR[p.decor].n) })); sfx.build();
  }
  if ((p.kind === 'cap' || p.kind === 'spd' || p.kind === 'price' || p.kind === 'hire') && p.lvl < p.max) p.price = Math.round(p.price * p.growth);
  addPuff(player.x, player.y, '#ffc94a'); addPuff(player.x, player.y, '#ffffff');
  save();
}

/* --- yapı noktaları + büyük proje (alt panel) --- */
function buyBuilding(slot, id) {
  var d = bdef(id); if (!d) return;
  var cost = d.cost;
  if (slot.b === id) return;
  var refund = slot.b ? Math.round(bdef(slot.b).cost * 0.6) : 0;
  if (S.cash + refund < cost) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash += refund - cost;
  slot.b = id;
  rebuildCounters(); reassignWorkers();
  toast(T('built', { n: NM(d.n) })); sfx.build(); 
  addPuff(slot.x, slot.y, '#ffc94a');
  save(); renderBar();
}
function investProject(amount) {
  if (project.done) return;
  var amt = Math.min(amount, S.cash, project.total - project.inv);
  if (amt <= 0) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash -= amt; project.inv += amt;
  var st = projStageOf(projPct());
  if (st > project.stage) {
    project.stage = st; sfx.build(); 
    addPuff(project.x, project.y, '#ffc94a');
    if (st >= project.stages.length) {
      project.done = true; rebuildCounters();
      toast(T('projDone', { n: NM(project.n) }));
      S.rep += 15; checkRepLevel();
    } else toast(T('projStage', { n: NM(project.n), p: Math.round(projPct() * 100) }));
  } else sfx.coin();
  save(); renderBar();
}

/* =========================================================
   OLAYLAR / EĞİTİM / EFEKT
   ========================================================= */
function updateEvents(dt) {
  if (event) { eventT -= dt; if (eventT <= 0) { event = null; nextEvent = rnd(70, 110); } return; }
  nextEvent -= dt;
  if (nextEvent <= 0 && S.tut >= 5) { event = pick(EVENTS); eventT = event.dur; toast(T(event.msg)); }
}
var TUTOK = [
  function () { return spots[0].stock.length > 0; },
  function () { return hasCarry(player, isFish); },
  function () { return tables[0].inn.length > 0 || tables[0].cur || tables[0].mat.items.length > 0; },
  function () { return counters.length && counters[0].buffer.length > 0; },
  function () { return S.cash > 0; },
  function () {
    for (var i = 0; i < PADS.length; i++) if (PADS[i].lvl > 0) return true;
    for (var j = 0; j < AREAS.length; j++) if (!AREAS[j].locked && AREAS[j].lvl > 1) return true;
    for (var k = 0; k < SLOTS.length; k++) if (SLOTS[k].b) return true;
    for (var d = 0; d < DECOR.length; d++) if (DECOR[d].got) return true;
    return project.inv > 0;
  }
];
function updateCoach(dt) {
  var show = S.started && S.ctrl < 2 && !paused;
  el.coach.classList.toggle('hidden', !show);
  if (!show) return;
  if (S.ctrl === 0 && ctrlWalk > 3) { S.ctrl = 1; ctrlT = 6; sfx.star(); el.coach.dataset.k = ''; }
  if (S.ctrl === 1) { ctrlT -= dt; if (ctrlT <= 0) { S.ctrl = 2; el.coach.classList.add('hidden'); save(); return; } }
  var key = S.ctrl + inputMode + lang;
  if (el.coach.dataset.k === key) return;
  el.coach.dataset.k = key;
  el.coach.className = 'coach s' + S.ctrl + ' ' + inputMode;
  el.coach.innerHTML = S.ctrl === 0
    ? (inputMode === 'touch' ? '<span class="hand">👆</span>' + T('coachTouch')
                             : '<span class="keys"><i>W</i><i>A</i><i>S</i><i>D</i></span>' + T('coachKeys'))
    : '<span class="hand">✋</span>' + T('coachAuto');
}
function updateTutorial() {
  if (S.tut >= TUTOK.length) return;
  if (TUTOK[S.tut]()) {
    S.tut++;
    if (S.tut < TUTOK.length) sfx.star();
    else { toast(T('tutDone')); save(); }
  }
}
var camShake = 0;
/* GDD v0.3.1 §4: ölü bölge + yumuşak takip, mikro sarsıntı yok */
function clampCam() {
  var maxY = maxOpenY();
  var x0 = pX(0, maxY) - 28, x1 = pX(10, 0) + 28;
  var y0 = pY(0, 0, 0) - 46, y1 = pY(10, maxY, 0) + 42;
  var hw = W / 2, ht = H * 0.46, hb = H - H * 0.46;
  if (x1 - x0 < W) camTX = (x0 + x1) / 2; else camTX = clamp(camTX, x0 + hw, x1 - hw);
  if (y1 - y0 < H) camTY = (y0 + y1) / 2; else camTY = clamp(camTY, y0 + ht, y1 - hb);
}
function projOK() { return isFinite(pX(1, 1)) && isFinite(pY(1, 1, 0)); }
function updateCamera(dt) {
  if (!projOK()) { console.error('BT: projeksiyon bozuk (TW/TH gölgelenmiş olabilir)'); return; }
  var tx = pX(player.x, player.y), ty = pY(player.x, player.y, 0);
  var dzx = W * 0.12, dzy = H * 0.10;
  var dx = tx - camTX, dy = ty - camTY;
  if (dx > dzx) camTX += dx - dzx; else if (dx < -dzx) camTX += dx + dzx;
  if (dy > dzy) camTY += dy - dzy; else if (dy < -dzy) camTY += dy + dzy;
  clampCam();
  var k = 1 - Math.pow(0.10, dt);
  camX = lerp(camX, camTX, k); camY = lerp(camY, camTY, k);
  if (!isFinite(camX) || !isFinite(camY)) { camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0); camTX = camX; camTY = camY; }
}
function updateFx(dt) {
  var i;
  for (i = flyers.length - 1; i >= 0; i--) { flyers[i].t += dt; if (flyers[i].t >= flyers[i].d) flyers.splice(i, 1); }
  for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 0.85) floats.splice(i, 1); }
  for (i = puffs.length - 1; i >= 0; i--) {
    var p = puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 55 * dt;
    if (p.t > 0.65) puffs.splice(i, 1);
  }
  camShake = 0;
  for (i = 0; i < gulls.length; i++) {
    var g = gulls[i];
    g.x += g.vx * dt; g.y += g.vy * dt; g.f += dt * 9;
    if (g.x > 34 || g.y > 30) { g.x = rnd(-22, -6); g.y = rnd(-18, 6); }
  }
}

/* =========================================================
   ÇİZİM — pixel temel
   ========================================================= */
var F6 = '6px "Pixelify Sans",monospace', F7 = '7px "Pixelify Sans",monospace',
    F8 = '8px "Pixelify Sans",monospace', F10 = '10px "Pixelify Sans",monospace';
function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); }
function dot(x, y, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), 1, 1); }
function quad(pts, c) {
  ctx.beginPath(); ctx.moveTo(R(pts[0][0]), R(pts[0][1]));
  for (var i = 1; i < pts.length; i++) ctx.lineTo(R(pts[i][0]), R(pts[i][1]));
  ctx.closePath(); ctx.fillStyle = c; ctx.fill();
}
function isoQuad(x, y, w, h, z, c) {
  quad([[pX(x, y), pY(x, y, z)], [pX(x + w, y), pY(x + w, y, z)],
        [pX(x + w, y + h), pY(x + w, y + h, z)], [pX(x, y + h), pY(x, y + h, z)]], c);
}
function isoLine(x0, y0, x1, y1, z, c, w) {
  ctx.strokeStyle = c; ctx.lineWidth = w || 1;
  ctx.beginPath(); ctx.moveTo(R(pX(x0, y0)), R(pY(x0, y0, z))); ctx.lineTo(R(pX(x1, y1)), R(pY(x1, y1, z))); ctx.stroke();
}
/* izometrik kutu: gövde + üst yüz */
function isoBox(x, y, w, h, z0, z1, top, left, right) {
  var bx = x + w, by = y + h;
  quad([[pX(bx, y), pY(bx, y, z1)], [pX(bx, by), pY(bx, by, z1)],
        [pX(bx, by), pY(bx, by, z0)], [pX(bx, y), pY(bx, y, z0)]], right);
  quad([[pX(x, by), pY(x, by, z1)], [pX(bx, by), pY(bx, by, z1)],
        [pX(bx, by), pY(bx, by, z0)], [pX(x, by), pY(x, by, z0)]], left);
  isoQuad(x, y, w, h, z1, top);
}
/* v0.1: iki katmanlı yumuşak gölge — dış halka soluk, iç çekirdek koyu */
function shadow(x, y, r) {
  var cx = pX(x, y), cy = pY(x, y, 0);
  ctx.save();
  ctx.globalAlpha = 0.09;
  quad([[cx - r * 8, cy], [cx, cy - r * 4], [cx + r * 8, cy], [cx, cy + r * 4]], '#16323f');
  ctx.globalAlpha = 0.17;
  quad([[cx - r * 5.4, cy], [cx, cy - r * 2.7], [cx + r * 5.4, cy], [cx, cy + r * 2.7]], '#14303c');
  ctx.restore();
}
function txt(s, x, y, c, font, align) {
  ctx.font = font || F7; ctx.textAlign = align || 'center';
  ctx.fillStyle = c || '#f4e9d2'; ctx.fillText(s, R(x), R(y));
}
function txtShadow(s, x, y, c, font, align) {
  ctx.font = font || F7; ctx.textAlign = align || 'center';
  ctx.fillStyle = '#0a1a27'; ctx.fillText(s, R(x) + 1, R(y) + 1);
  ctx.fillStyle = c || '#f4e9d2'; ctx.fillText(s, R(x), R(y));
}
function panel(x, y, w, h, bg, edge) {
  px(x, y, w, h, edge || '#0a1a27');
  px(x + 1, y + 1, w - 2, h - 2, bg || '#14293c');
  px(x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,.10)');
}
/* Yakınken tam ad, orta mesafede kısa rozet, uzakta hiçbir şey.
   Amaç: kalabalık sahnede dünya yazılarının binaları kapatmaması. */
function labelAt(x, y, z, s, col, short) {
  var d = dist2(player.x, player.y, x, y);
  if (d < 2.2) { if (short) uiBadge(x, y, z, short, col); return; }
  if (d < 16) { uiLabel(x, y, z, s, col, 1); return; }
  if (d < 46 && short) uiBadge(x, y, z, short, col);
}

/* ---------- eşyalar ---------- */
function drawFishItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  /* gövde */
  px(x - 5, y - 2, 9, 4, F.col);
  px(x - 5, y - 3, 7, 1, shade(F.col, 16));            /* sırt ışığı */
  px(x - 4, y + 1, 7, 1, F.bel);                       /* karın */
  px(x - 4, y - 1, 6, 2, F.bel);
  /* kuyruk */
  px(x + 4, y - 3, 3, 3, F.col);
  px(x + 4, y + 0, 3, 3, F.col);
  px(x + 5, y - 1, 2, 2, shade(F.col, -18));
  /* yüzgeç */
  px(x - 1, y + 2, 3, 1, shade(F.col, -14));
  px(x - 1, y - 4, 3, 1, shade(F.col, -14));
  /* göz + solungaç */
  dot(x - 4, y - 1, '#16222b');
  px(x - 2, y - 2, 1, 3, shade(F.col, -22));
}
function drawFiletoItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  /* yağlı kâğıt */
  px(x - 5, y - 3, 10, 6, '#f3eee2');
  px(x - 5, y - 3, 10, 1, '#fdfaf2');
  px(x - 5, y + 2, 10, 1, '#c9c0ae');
  /* fileto dilimi */
  px(x - 3, y - 2, 6, 4, F.meat);
  px(x - 3, y - 2, 6, 1, shade(F.meat, 18));
  px(x - 2, y, 4, 1, shade(F.meat, -14));
  /* limon dilimi */
  px(x + 3, y - 1, 2, 2, '#e8d24a');
  dot(x + 3, y - 1, '#f6ea90');
}
function drawFumeItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  /* tütsülenmiş balık, ipe asılı görünüm */
  px(x - 5, y - 3, 10, 6, '#8a6440');
  px(x - 5, y - 3, 10, 2, '#b0834f');
  px(x - 5, y + 2, 10, 1, '#5f4530');
  px(x - 3, y - 1, 6, 3, '#d9a765');
  px(x - 2, y - 1, 4, 1, shade(F.meat, 10));
  px(x - 5, y - 4, 2, 1, PAL.rope);                    /* ip ucu */
  px(x + 3, y - 4, 2, 1, PAL.rope);
}
function drawMoneyItem(x, y) {
  /* Türk lirası destesi: banknot + bordo bant */
  px(x - 5, y - 3, 10, 6, '#2f7d4a');
  px(x - 5, y - 3, 10, 1, '#5fd37a');
  px(x - 5, y + 2, 10, 1, '#1d5c33');
  px(x - 5, y - 1, 10, 1, '#276b3f');
  px(x - 1, y - 2, 3, 4, '#d8e9d8');                   /* filigran */
  px(x - 1, y - 2, 1, 4, '#9fc9a8');
  px(x + 3, y - 3, 1, 6, '#a83d2b');                   /* bant */
}
function drawItem(it, x, y) {
  if (!it) return;
  if (it.k === 'fish') drawFishItem(x, y, it.f);
  else if (it.k === 'fileto') drawFiletoItem(x, y, it.f);
  else if (it.k === 'fume') drawFumeItem(x, y, it.f);
  else drawMoneyItem(x, y);
}
function drawCrateIcon(x, y, it) {
  px(x - 7, y - 7, 14, 8, '#7d5228');
  px(x - 7, y - 9, 14, 3, '#a9743f');
  px(x - 7, y - 4, 14, 1, '#5d3c1c');
  drawItem(it, x, y - 12);
}
/* GDD §11 yığın kuralı */
function drawStack(x, y, items, baseZ, gap) {
  var n = items.length; if (!n) return;
  gap = gap || 3.4;
  var sx = pX(x, y);
  if (n >= 20) {
    drawCrateIcon(sx, pY(x, y, baseZ + 6), items[n - 1]);
    uiBadge(x, y, baseZ + 22, 'x' + n);
    return;
  }
  var show = Math.min(n, 5);
  for (var i = 0; i < show; i++) drawItem(items[n - show + i], sx, pY(x, y, baseZ + i * gap));
  if (n > show) uiBadge(x, y, baseZ + show * gap + 7, 'x' + n);
}


/* ---------- insanlar (pixel) ---------- */

/* =========================================================
   ANADOLU PIXEL ART — STİL REHBERİ (v2.0)
   ---------------------------------------------------------
   Tema   : Ege/Karadeniz balıkçı limanı, Anadolu kasabası
   Palet  : kireç badana + kagir taş + kiremit + kilim renkleri
   Kural 1: her nesnenin koyu bir taban kenarı (edge) vardır
   Kural 2: ışık sol-üstten gelir → sol yüz açık, sağ yüz koyu
   Kural 3: 3 tonlu gölgeleme (light / base / dark), dithering yok
   Kural 4: animasyonlar 2 veya 4 kare, 6-8 fps hissi
   Kural 5: motifler kilim geometrisinden (baklava, çengel, göz)
   ========================================================= */
var PAL = {
  /* deniz */
  seaDeep: '#0d3f55', sea: '#1d6c8f', seaLite: '#2f8aad', foam: '#cfe9f2', seaGlint: '#9fd4e6',
  /* kara */
  sand: '#cbb98d', sandLite: '#ded0a8', sandDark: '#a89468', soil: '#8d7350',
  /* ahşap iskele */
  wood: '#ab7a48', woodLite: '#c9975f', woodDark: '#6f4526', tar: '#3b2a1c', rope: '#c9b183',
  /* kagir / badana */
  lime: '#f1ebda', limeSh: '#d8cfb8', stone: '#cbbc9e', stoneLite: '#ded1b6', stoneDark: '#9a8c72',
  /* kiremit */
  tile: '#b5432f', tileLite: '#cb5b40', tileDark: '#7d2c1d', zinc: '#8d959b', zincDark: '#5a6167',
  /* kilim / motif */
  madder: '#a83d2b', indigo: '#2a4c7d', saffron: '#d9a441', cream: '#ede4cf',
  turkuaz: '#1f8fbf', nazar: '#1f6fae', nazarW: '#eef6fa',
  /* bitki */
  cypress: '#2f5136', cypressLite: '#436b45', olive: '#6e7a45', leaf: '#4a7a3a',
  /* metal */
  iron: '#5d666e', ironLite: '#8b949c', brass: '#c9952f', brassLite: '#e6be59',
  /* UI */
  ink: '#f4e9d2', ink2: '#a9c0cf', edge: '#0a1a27', pnl: '#14293c', pnl2: '#1d3a52',
  gold: '#ffc94a', green: '#5fd37a', red: '#e5533d', warm: '#ffb27a',
  /* karakter */
  skin: ['#e8b98a', '#d7a473', '#c08a56', '#a4703f'],
  skinSh: ['#c99a6d', '#b98a5b', '#a2703f', '#83562c'],
  hair: ['#1d1713', '#2e2018', '#3d2a1a', '#120f0d']
};
/* eski değişken adları korunuyor (geri uyum) */
var SKIN = PAL.skin, HAIR = PAL.hair;

/* =========================================================
   PIXEL İKON SETİ — emoji yerine elle çizilmiş 12x12 simgeler
   Her ikon satır dizisi; karakter = palet anahtarı, '.' = boş.
   HTML panelleri için data-URL'e çevrilir, dünyada doğrudan çizilir.
   ========================================================= */
var IPAL = {
  '.': null,
  k: '#0a1a27',  /* kontur */
  w: '#f1ebda',  /* badana beyaz */
  c: '#ede4cf',  /* krem */
  y: '#ffc94a',  /* altın */
  o: '#c9782f',  /* turuncu-kiremit */
  r: '#c62828',  /* al */
  m: '#a83d2b',  /* kök boya */
  g: '#5fd37a',  /* yeşil */
  e: '#2f5136',  /* servi yeşili */
  b: '#2a4c7d',  /* çivit */
  t: '#1f8fbf',  /* türkuaz */
  s: '#cbbc9e',  /* taş */
  d: '#6f4526',  /* koyu ahşap */
  a: '#ab7a48',  /* ahşap */
  i: '#8b949c',  /* açık demir */
  n: '#5d666e',  /* demir */
  p: '#e8b98a',  /* ten */
  f: '#cfe6df',  /* balık eti */
  u: '#d98455',  /* somon */
  l: '#9fd4e6',  /* buz mavisi */
  x: '#7a3a2a',  /* koyu kahve */
  v: '#7b5ea7'   /* mor */
};
var ICONS = {
  /* --- kaynaklar --- */
  para:   ['....kkkk....','..kkyyyykk..','.kyyyyyyyyk.','kyyokkkkoyyk','kyyokyyykoyk','kyyokyykkoyk','kyyokyyykoyk','kyyokkkkoyyk','.kyyyyyyyyk.','..kkyyyykk..','....kkkk....','............'],
  kufe:   ['............','..kkkkkkkk..','.kaaaaaaaak.','.kacccccak..','.kaaaaaaaak.','.kadddddak..','.kaaaaaaaak.','.kadddddak..','..kaaaaaak..','...kkkkkk...','............','............'],
  itibar: ['.....kk.....','....kyyk....','....kyyk....','kkkkyyyykkkk','kyyyyyyyyyyk','.kyyyyyyyyk.','..kyyyyyyk..','..kyykkyyk..','.kyyk..kyyk.','.kk......kk.','............','............'],
  gun:    ['............','....kkkk....','..kkyyyykk..','.kyyyyyyyyk.','kyyyyyyyyyyk','kyyyyyyyyyyk','.kyyyyyyyyk.','..kkyyyykk..','....kkkk....','kkkkkkkkkkkk','.oooooooooo.','............'],
  pazar:  ['............','.kkkkkkkkkk.','.krrwwrrwwk.','.kkkkkkkkkk.','..kaaaaaak..','..kacccak...','..kaaaaaak..','..ka...ak...','..ka...ak...','..kkk.kkk...','............','............'],
  /* --- balıklar --- */
  hamsi:  ['............','............','.....kkk....','...kkfffk...','.kkffffffkkk','kfffffffffdk','.kkffffffkkk','...kkfffk...','.....kkk....','............','............','............'],
  uskumru:['............','......kk....','....kkffkk..','..kkffffffk.','.kffffbbfffk','kffffffffdkk','.kffffbbffk.','..kkffffkk..','....kkkk....','............','............','............'],
  palamut:['............','.....kkk....','...kkfffkk..','..kffffffk..','.kffuuuufffk','kffffffffdkk','.kffuuuuffk.','..kffffffk..','...kkfffkk..','.....kkk....','............','............'],
  levrek: ['............','....kkkk....','..kkffffkk..','.kffffffffk.','kfffiiiiffdk','kffffffffdkk','kfffiiiiffdk','.kffffffffk.','..kkffffkk..','....kkkk....','............','............'],
  somon:  ['............','....kkkk....','..kkuuuukk..','.kuuuuuuuuk.','kuuwwuuwwudk','kuuuuuuuudkk','kuuwwuuwwudk','.kuuuuuuuuk.','..kkuuuukk..','....kkkk....','............','............'],
  ton:    ['...kk.......','..kbbk..kk..','.kbbbbkkbbk.','kbbbbbbbbbbk','kbbwwbbbbbdk','kbbbbbbbbdkk','kbbwwbbbbbdk','kbbbbbbbbbbk','.kbbbbkkbbk.','..kbbk..kk..','...kk.......','............'],
  /* --- roller --- */
  hamal:  ['....kkkk....','...kbbbbk...','...kppppk...','..kkbbbbkk..','.kbbbbbbbbk.','.kbbbbbbbbk.','..kaaaaaak..','..kacccak...','..kbbbbbbk..','..kk....kk..','............','............'],
  filetocu:['....kkkk....','...keeeek...','...kppppk...','..kkeeeekk..','.keewwwweek.','.keewwwweek.','..kwwwwwwk..','..kwwwwwwk..','..keeeeeek..','..kk....kk..','............','............'],
  tezgahtar:['....kkkk....','...kmmmmk...','...kppppk...','..kkmmmmkk..','.kmmwwwwmmk.','.kmmwwwwmmk.','..kwwwwwwk..','..kffffffk..','..kmmmmmmk..','..kk....kk..','............','............'],
  kasiyer:['....kkkk....','...kbbbbk...','...kppppk...','..kkbbbbkk..','.kbbyyyybbk.','.kbbyyyybbk.','..kbbbbbbk..','..kbbbbbbk..','..kbbbbbbk..','..kk....kk..','............','............'],
  /* --- binalar / yapılar --- */
  depo:   ['............','kkkkkkkkkkkk','knniiiiiinnk','kkkkkkkkkkkk','ksssssssssk.','ks.kkkkk.sk.','ks.knnnk.sk.','ks.knnnk.sk.','ks.knnnk.sk.','kkkkkkkkkkkk','.aa.....aa..','............'],
  buzhane:['............','...kkkkkk...','..klllllk...','.kllllllllk.','klwwlllwwllk','kllllllllllk','klwwlllwwllk','kllllllllllk','.kllllllllk.','..kkkkkkkk..','............','............'],
  tamir:  ['............','.....kk.....','....kiik....','...kiiiik...','..kiik.kk...','.kiik.......','kiik.kkkkkk.','kk..kaaaaak.','....kaaaaak.','....kkkkkkk.','............','............'],
  hal:    ['.....kk.....','...kkrrkk...','..krrwwrrk..','.krrwwrrwwk.','kkkkkkkkkkkk','ksssssssssk.','ks.kkk.kkksk','ks.kdk.kdksk','ks.kdk.kdksk','kkkkkkkkkkkk','............','............'],
  restoran:['............','..kkkkkkkk..','.krrwwrrwwk.','.kkkkkkkkkk.','.ksssssssk..','.ks.kkk..sk.','.ks.kwk..sk.','.kaaaaaaaak.','.ka.a..a.ak.','.kkkkkkkkkk.','............','............'],
  nakliye:['............','.kkkkkkkkkk.','.kbbbbbbbbk.','.kbwwwwwwbk.','.kbbbbbbbbk.','.ksssssssk..','.ks.kkkk.sk.','.ks.kaak.sk.','.kkkkkkkkkk.','..nn....nn..','............','............'],
  yakit:  ['............','...kkkkkk...','..kiiiiiik..','..kirrriik..','..kiiiiiik..','..kiiiiiik..','..kiiiiiik..','.kkiiiiiikk.','.kaaaaaaaak.','.kkkkkkkkkk.','............','............'],
  tersane:['............','.kk.........','.kik...kk...','.kik..kaak..','.kik.kaaaak.','.kikkaaaaak.','.kikaaaaaak.','.kkkkkkkkkk.','..dddddddd..','.dddddddddd.','............','............'],
  proje:  ['.....kk.....','....kyyk....','...kkkkkk...','..krrrrrrk..','.kkkkkkkkkk.','.kssssssssk.','.ks.kk.kksk.','.ks.kk.kksk.','.ks.kk.kksk.','.kkkkkkkkkk.','............','............'],
  alan:   ['............','...kkkkkk...','..ky....yk..','..ky....yk..','.kkkkkkkkkk.','.kyyyyyyyyk.','.kyykkkkyyk.','.kyykyykyyk.','.kyykkkkyyk.','.kkkkkkkkkk.','............','............'],
  yukselt:['.....kk.....','....kyyk....','...kyyyyk...','..kyyyyyyk..','.kyyyyyyyyk.','kkkkyyyykkkk','...kyyyyk...','...kyyyyk...','...kyyyyk...','...kkkkkk...','............','............'],
  yapi:   ['........kk..','.......kaak.','......kaak..','.....kaak...','..kkkaak....','.knnkak.....','knnnnk......','knnnk.......','.knk........','..k.........','............','............'],
  bina:   ['...kk.......','..koook.....','.kooooook...','kkkkkkkkkkkk','ksssssssssk.','ks.kkkk..sk.','ks.kwwk..sk.','ks.kwwk..sk.','kkkkkkkkkkkk','.kk......kk.','............','............'],
  /* --- durumlar --- */
  ok:     ['............','..........k.','.........kg.','........kgg.','k.......kgg.','kk.....kgg..','kgk...kgg...','kggk.kgg....','.kggkgg.....','..kggg......','...kg.......','............'],
  uyari:  ['.....kk.....','....kyyk....','....kyyk....','...kyyyyk...','...kykyyk...','..kyykyyyk..','..kyykyyyk..','.kyyyykyyyk.','.kyyyyyyyyk.','.kyykkkkyyk.','.kkkkkkkkkk.','............'],
  kilit:  ['............','...kkkkk....','..ki...ik...','..ki...ik...','.kkkkkkkkk..','.kyyyyyyyk..','.kyykkkyyk..','.kyykkkyyk..','.kyyyyyyyk..','.kkkkkkkkk..','............','............'],
  sure:   ['....kkkk....','..kkiiiikk..','.kiikkkkiik.','kiikk.kkkiik','kiik..k..kik','kiik..k..kik','kiik.....kik','.kiikkkkkik.','..kkiiiikk..','....kkkk....','............','............'],
  kasa:   ['............','.kkkkkkkkkk.','.knnnnnnnnk.','.kniiiiiink.','.kni.kk.ink.','.kni.ky.ink.','.kni.kk.ink.','.kniiiiiink.','.knnnnnnnnk.','.kkkkkkkkkk.','..k.....k...','............'],
  ag:     ['............','kkkkkkkkkkk.','k.k.k.k.k.k.','kkkkkkkkkkk.','k.k.k.k.k.k.','kkkkkkkkkkk.','k.k.k.k.k.k.','kkkkkkkkkkk.','..k..k..k...','...k.k.k....','............','............'],
  kesim:  ['.......kk...','......kik...','.....kik....','....kik.....','...kik......','..kik.......','.kdk........','kdk.........','kk..........','............','............','............'],
  tezgah: ['............','.kkkkkkkkkk.','.krwrwrwrwk.','.kkkkkkkkkk.','.kaaaaaaaak.','.kffffffffk.','.kaaaaaaaak.','..ka....ak..','..ka....ak..','..kk....kk..','............','............'],
  /* v2.0 — gerçek liman kurumları */
  koop:   ['....kkkk....','...kwwwwk...','..kwwwwwwk..','.kkkkkkkkkk.','.kssssssssk.','.ks.kkkk.sk.','.ks.kggk.sk.','.ks.kggk.sk.','.kkkkkkkkkk.','..kk....kk..','............','............'],
  mezat:  ['.....kk.....','....kyyk....','...kyyyyk...','..kyyyyyyk..','.kyyyyyyyyk.','kyyyyyyyyyyk','.kkkkkkkkkk.','...kyyyyk...','....kkkk....','............','............','............'],
  kantar: ['.....kk.....','.kkkkikkkkk.','ki..kik..ik.','kii.kik.iik.','.kk.kik.kk..','....kik.....','....kik.....','...kkikk....','..kaaaaak...','..kkkkkkk...','............','............'],
  cekek:  ['............','.....k......','....kik.....','....kik.....','..kkkikkk...','.kaaaaaaak..','kaaaaaaaaak.','.kkkkkkkkk..','..dddddddd..','.dddddddddd.','............','............'],
  nazar:  ['............','...kkkkkk...','..kbbbbbbk..','.kbbwwwwbbk.','.kbwwwwwwbk.','.kbwwbbwwbk.','.kbwwbbwwbk.','.kbwwwwwwbk.','..kbbwwbbk..','...kkkkkk...','............','............'],
  cesme:  ['............','..kkkkkkkk..','.kssssssssk.','.ks.kkkk.sk.','.ks.ktts.sk.','.ks.kttk.sk.','.kssssssssk.','.kstttttssk.','.kssssssssk.','.kkkkkkkkkk.','............','............'],
  kilim:  ['............','.kkkkkkkkkk.','.kmmmmmmmmk.','.kmywwywymk.','.kmwyyyywmk.','.kmmmmmmmmk.','.kmwyyyywmk.','.kmywwywymk.','.kmmmmmmmmk.','.kkkkkkkkkk.','..k......k..','............'],
  fener:  ['....kkkk....','...kyyyyk...','...kwwwwk...','..kkkkkkkk..','..kwwrrwwk..','..kwwrrwwk..','..kwwrrwwk..','.kkwwrrwwkk.','.kssssssssk.','.kkkkkkkkkk.','............','............']
};
/* 12x12 ikonu belirtilen büyütmeyle canvas'a çizer */
function drawIcon(name, x, y, sc) {
  var g = ICONS[name]; if (!g) return;
  sc = sc || 1;
  for (var r = 0; r < g.length; r++) {
    var row = g[r];
    for (var c = 0; c < row.length; c++) {
      var col = IPAL[row.charAt(c)];
      if (col) px(x + c * sc, y + r * sc, sc, sc, col);
    }
  }
}
/* HTML panelleri için: ikonu data-URL'e çevir (bir kez üretilir, önbelleğe alınır) */
var _iconURL = {};
function iconURL(name, sc) {
  sc = sc || 2;
  var key = name + '@' + sc;
  if (_iconURL[key]) return _iconURL[key];
  var g = ICONS[name];
  if (!g) return '';
  var cv = document.createElement('canvas');
  cv.width = 12 * sc; cv.height = 12 * sc;
  var c2 = cv.getContext('2d');
  for (var r = 0; r < g.length; r++) {
    var row = g[r];
    for (var c = 0; c < row.length; c++) {
      var col = IPAL[row.charAt(c)];
      if (!col) continue;
      c2.fillStyle = col; c2.fillRect(c * sc, r * sc, sc, sc);
    }
  }
  _iconURL[key] = cv.toDataURL();
  return _iconURL[key];
}

/* --- emoji → pixel ikon: panellerin HTML'i basılmadan önce geçirilir --- */
var EMO_MAP = {
  '💰': 'para', '🧺': 'kufe', '⭐': 'itibar', '🔪': 'kesim',
  '🧊': 'buzhane', '🛠️': 'tamir', '🛠': 'tamir', '🏪': 'hal', '🍽️': 'restoran', '🍽': 'restoran',
  '📋': 'nakliye', '⛽': 'yakit', '🚢': 'tersane', '🏬': 'depo', '🏛️': 'proje', '🏛': 'proje',
  '🔓': 'alan', '⬆️': 'yukselt', '⬆': 'yukselt', '🔨': 'yapi', '🏭': 'bina', '🔒': 'kilit',
  '⚠️': 'uyari', '⚠': 'uyari', '🏗️': 'yapi', '🏗': 'yapi', '🏝️': 'alan', '🏝': 'alan',
  '🧾': 'pazar', '👟': 'yukselt', '📦': 'kufe', '🏆': 'itibar', '🚶': 'hamal',
  '🏚️': 'bina', '🏚': 'bina', '🫖': 'restoran', '📣': 'hal', '🗿': 'proje', '🕹️': 'yukselt', '🕹': 'yukselt',
  '🎣': 'levrek', '🍣': 'somon', '🐠': 'uskumru', '🐡': 'palamut', '🐋': 'ton', '🐟': 'hamsi',
  '🔥': 'kesim', '👷': 'hamal', '💸': 'para', '✔': 'ok', '↔️': 'yapi', '↔': 'yapi', '💾': 'kasa',
  '🌅': 'gun', '☀️': 'gun', '☀': 'gun', '🌇': 'gun', '🎪': 'pazar', '⏸': 'sure',
  '🤝': 'koop', '🔔': 'mezat', '🕸️': 'ag', '🕸': 'ag', '⚖️': 'kantar', '⚖': 'kantar', '⛵': 'cekek',
  '🧿': 'nazar', '⛲': 'cesme', '🧶': 'kilim', '🗼': 'fener'
};
var _emoRe = null;
function PX(html) {
  if (!_emoRe) {
    var keys = Object.keys(EMO_MAP).sort(function (a, b) { return b.length - a.length; });
    _emoRe = new RegExp(keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
  }
  return String(html).replace(_emoRe, function (m) { return ICO(EMO_MAP[m]); });
}

/* HTML'deki .ci ikonlarını pixel çizimlerle boyar */
function paintIcons() {
  Array.prototype.forEach.call(document.querySelectorAll('.ci'), function (n) {
    var u = iconURL(n.dataset.i, 3);
    if (u) n.style.backgroundImage = 'url(' + u + ')';
  });
}
function setChipIcon(node, name) {
  if (!node) return;
  if (node.dataset.i === name) return;
  node.dataset.i = name;
  var u = iconURL(name, 3);
  if (u) node.style.backgroundImage = 'url(' + u + ')';
}
/* HTML içine gömülecek <i class="pxi"> etiketi */
function ICO(name, cls) {
  var u = iconURL(name, 3);
  if (!u) return '';
  return '<i class="pxi ' + (cls || '') + '" style="background-image:url(' + u + ')"></i>';
}

/* animasyon zamanlaması — tek yerden ayarlanır */
var ANIM = {
  walkFps: 7,        /* yürüme döngüsü hızı */
  idleFps: 1.6,      /* duruş kıpırdanması */
  workFps: 5,        /* iş yapma */
  waveFps: 1.1,      /* bayrak / tente */
  emoteLife: 1.6     /* duygu balonu süresi */
};
function phase4(t, fps) { return Math.floor(t * (fps || ANIM.walkFps)) & 3; }
function phase2(t, fps) { return Math.floor(t * (fps || ANIM.walkFps)) & 1; }
/* yürüme döngüsü ofsetleri: 4 kare (temas-geçiş-temas-geçiş) */
var WALK = [
  { body: 0, fl: 2, bl: -2, fa: -2, ba: 2 },
  { body: -1, fl: 0, bl: 0, fa: 0, ba: 0 },
  { body: 0, fl: -2, bl: 2, fa: 2, ba: -2 },
  { body: -1, fl: 0, bl: 0, fa: 0, ba: 0 }
];

/* ---------------------------------------------------------
   KARAKTER ÇİZİMİ v2 — Anadolu balıkçı kasabası tipolojisi
   Katmanlar: gölge → bacak → çizme → gövde(kazak/önlük) → kol
              → aksesuar(küfe/tepsi/bıçak) → baş → saç/başlık → yüz
   4 kareli yürüme döngüsü, iş yapma eğilmesi, taşıma pozu.
   --------------------------------------------------------- */
function drawPerson(a, o) {
  var sx = R(pX(a.x, a.y)), sy = R(pY(a.x, a.y, a.z || 0));
  var spd = Math.hypot(a.vx || 0, a.vy || 0);
  var moving = spd > 0.05 || o.walk;
  var working = (a.act || 0) > 0.05;
  var fx = o.face > 0 ? 1 : -1;
  var t = (a.bob || 0);
  var w = moving ? WALK[phase4(t * 0.16, ANIM.walkFps)] : null;
  /* duruşta yavaş nefes */
  var idle = moving ? 0 : (Math.sin(t * 0.9) > 0.6 ? 1 : 0);
  var body = (w ? w.body : 0) - idle;
  var lean = working ? fx : 0;                       /* iş yaparken öne eğilme */
  var y = sy + body;

  shadow(a.x, a.y, 0.62);

  var coat = o.coat || PAL.indigo;
  var coat2 = o.coat2 || coat;
  var skin = o.skin || PAL.skin[0];
  var skinS = PAL.skinSh[PAL.skin.indexOf(skin) < 0 ? 0 : PAL.skin.indexOf(skin)];
  var hair = o.hair || PAL.hair[0];
  var pants = o.pants || '#2b3a45';
  var boot = o.boot || '#1a2830';

  /* --- bacaklar + lastik çizme --- */
  var fl = w ? w.fl : 0, bl = w ? w.bl : 0;
  px(sx - 3, y - 7, 3, 5, pants);
  px(sx + 1, y - 7, 3, 5, pants);
  px(sx - 3 + (fl > 0 ? 1 : 0), y - 2, 3, 2, boot);
  px(sx + 1 + (bl > 0 ? 1 : 0), y - 2, 3, 2, boot);
  if (o.boots !== false) {                            /* çizme ağzı */
    px(sx - 3, y - 4, 3, 1, o.bootTop || '#2f4450');
    px(sx + 1, y - 4, 3, 1, o.bootTop || '#2f4450');
  }

  /* --- gövde: yün kazak --- */
  px(sx - 4 + lean, y - 15, 8, 9, coat);
  px(sx - 4 + lean, y - 15, 8, 1, coat2);             /* omuz ışığı */
  px(sx + 3 + lean, y - 14, 1, 8, shade(coat, -18));  /* sağ yüz gölge */
  if (o.knit) {                                       /* kazak deseni: baklava sırası */
    px(sx - 3 + lean, y - 12, 1, 1, o.knit); px(sx - 1 + lean, y - 12, 1, 1, o.knit);
    px(sx + 1 + lean, y - 12, 1, 1, o.knit); px(sx - 2 + lean, y - 11, 1, 1, o.knit);
    px(sx + 0 + lean, y - 11, 1, 1, o.knit); px(sx + 2 + lean, y - 11, 1, 1, o.knit);
  }
  if (o.apron) {                                      /* muşamba önlük */
    px(sx - 3 + lean, y - 11, 6, 6, o.apron);
    px(sx - 3 + lean, y - 11, 6, 1, shade(o.apron, 18));
    px(sx - 1 + lean, y - 14, 2, 3, o.apron);
  }
  if (o.vest) {                                       /* yelek */
    px(sx - 4 + lean, y - 15, 2, 8, o.vest);
    px(sx + 2 + lean, y - 15, 2, 8, o.vest);
  }
  if (o.sash) px(sx - 4 + lean, y - 9, 8, 2, o.sash); /* kuşak */

  /* --- kollar --- */
  var carrying = a.carry && a.carry.length;
  var fa = w ? w.fa : 0, ba = w ? w.ba : 0;
  if (carrying || o.hold) {                           /* taşıma: iki kol önde */
    px(sx - 6 + lean, y - 13, 2, 5, coat2);
    px(sx + 4 + lean, y - 13, 2, 5, coat2);
    px(sx - 6 + lean, y - 9, 2, 1, skin);
    px(sx + 4 + lean, y - 9, 2, 1, skin);
  } else if (working) {                               /* iş: kollar aşağı-öne */
    px(sx - 6 + lean, y - 13, 2, 6, coat2);
    px(sx + 4 + lean, y - 13, 2, 6, coat2);
    px(sx + fx * 5 + lean, y - 8, 2, 2, skin);
  } else {
    px(sx - 6, y - 14 + fa, 2, 6, coat2);
    px(sx + 4, y - 14 + ba, 2, 6, coat2);
    px(sx - 6, y - 8 + fa, 2, 1, skin);
    px(sx + 4, y - 8 + ba, 2, 1, skin);
  }

  /* --- sırt küfesi / sepet --- */
  if (o.kufe) {
    var kx = fx > 0 ? sx - 8 : sx + 4;
    px(kx, y - 15, 4, 8, '#9a7340');
    px(kx, y - 15, 4, 1, '#c9a15e');
    px(kx, y - 12, 4, 1, '#7a5a30');
    px(kx, y - 9, 4, 1, '#7a5a30');
  }
  if (o.bag) px(fx > 0 ? sx - 7 : sx + 5, y - 13, 2, 5, '#4a3a2a');
  if (o.knife) { var nx = sx + fx * 6; px(nx, y - 10, 1, 4, '#cfd8de'); px(nx, y - 6, 1, 2, '#6f4526'); }
  if (o.tray) { px(sx + fx * 5 - 2, y - 12, 6, 1, '#c9a15e'); px(sx + fx * 5 - 1, y - 13, 4, 1, '#e8ddc8'); }

  /* --- baş --- */
  var hy = y - 22;
  px(sx - 3, hy, 6, 7, skin);
  px(sx + 2, hy + 1, 1, 5, skinS);                    /* yanak gölgesi */
  px(sx - 4, hy + 2, 1, 2, skin); px(sx + 3, hy + 2, 1, 2, skin);   /* kulaklar */

  /* saç / başlık */
  if (o.scarf) {                                      /* başörtüsü */
    px(sx - 4, hy - 1, 8, 4, o.scarf);
    px(sx - 4, hy - 1, 8, 1, shade(o.scarf, 20));
    px(sx - 5, hy + 1, 1, 5, o.scarf);
    px(sx + 4, hy + 1, 1, 5, o.scarf);
    px(sx - 4, hy + 5, 2, 3, shade(o.scarf, -14));
  } else if (o.fez) {                                 /* fes */
    px(sx - 3, hy - 4, 6, 4, '#a3231f');
    px(sx - 4, hy - 1, 8, 1, '#8d1c19');
    px(sx + 2, hy - 5, 1, 3, '#1d1713');
  } else if (o.cap) {                                 /* kasket */
    px(sx - 4, hy - 2, 8, 3, o.cap);
    px(sx - 4, hy - 3, 6, 1, shade(o.cap, 16));
    px(fx > 0 ? sx + 3 : sx - 6, hy, 3, 1, shade(o.cap, -20));  /* siperlik */
    px(sx - 4, hy + 1, 1, 1, hair); px(sx + 3, hy + 1, 1, 1, hair);
  } else if (o.chefHat) {
    px(sx - 3, hy - 6, 6, 5, '#f7f7f2');
    px(sx - 4, hy - 2, 8, 2, '#f7f7f2');
    px(sx - 2, hy - 7, 4, 1, '#f7f7f2');
  } else if (o.sunHat) {
    px(sx - 6, hy - 1, 12, 2, o.sunHat);
    px(sx - 3, hy - 4, 6, 3, o.sunHat);
    px(sx - 3, hy - 2, 6, 1, shade(o.sunHat, -18));
  } else if (o.beanie) {                              /* balıkçı beresi */
    px(sx - 4, hy - 3, 8, 4, o.beanie);
    px(sx - 4, hy, 8, 1, shade(o.beanie, -22));
    px(sx - 1, hy - 4, 2, 1, shade(o.beanie, 18));
    px(sx - 4, hy + 1, 1, 2, hair); px(sx + 3, hy + 1, 1, 2, hair);
  } else if (o.hairStyle === 4) {                     /* kel: yalnız yanlarda saç */
    px(sx - 3, hy - 1, 6, 1, skin); px(sx - 2, hy - 2, 4, 1, skin);
    px(sx - 4, hy + 1, 1, 2, hair); px(sx + 3, hy + 1, 1, 2, hair);
  } else {
    px(sx - 4, hy - 2, 8, 3, hair);
    px(sx - 4, hy + 1, 1, 3, hair); px(sx + 3, hy + 1, 1, 3, hair);
    if (o.hairStyle === 1) {                          /* dalgalı */
      px(sx - 5, hy - 1, 1, 3, hair); px(sx + 4, hy - 1, 1, 3, hair);
      px(sx - 3, hy - 3, 2, 1, hair); px(sx + 1, hy - 3, 2, 1, hair);
    } else if (o.hairStyle === 2) {                   /* uzun */
      px(sx - 5, hy, 1, 8, hair); px(sx + 4, hy, 1, 8, hair);
      px(sx - 4, hy + 4, 1, 4, hair); px(sx + 3, hy + 4, 1, 4, hair);
    } else if (o.hairStyle === 3) {                   /* at kuyruğu */
      var tx = fx > 0 ? sx - 6 : sx + 4;
      px(tx, hy, 2, 2, hair); px(tx + (fx > 0 ? 0 : 1), hy + 2, 1, 4, hair);
    }
  }
  if (o.cap && o.hairStyle === 2) { px(sx - 5, hy + 1, 1, 7, hair); px(sx + 4, hy + 1, 1, 7, hair); }
  if (o.cap && o.hairStyle === 3) { var tx2 = fx > 0 ? sx - 6 : sx + 4; px(tx2, hy + 1, 2, 5, hair); }

  /* yüz */
  var ey = hy + 3;
  dot(sx + (fx > 0 ? 1 : -2), ey, PAL.edge);
  dot(sx + (fx > 0 ? 2 : -1), ey, PAL.edge);
  if (o.must) px(sx - 1, ey + 2, 3, 1, hair);         /* bıyık */
  if (o.beard) { px(sx - 3, ey + 2, 6, 3, hair); px(sx - 2, ey + 3, 4, 1, skinS); }
  if (o.glasses) { px(sx - 3, ey, 2, 1, '#cfd8de'); px(sx + 1, ey, 2, 1, '#cfd8de'); px(sx - 1, ey, 2, 1, '#7d868e'); }
  /* ağız: ruh haline göre */
  if (o.mood !== undefined) {
    if (o.mood < 0.28) { px(sx - 1, ey + 3, 3, 1, '#8d3423'); px(sx - 2, ey + 2, 1, 1, '#8d3423'); px(sx + 2, ey + 2, 1, 1, '#8d3423'); }
    else if (o.mood < 0.55) px(sx - 1, ey + 3, 3, 1, '#7a3a2a');
    else { px(sx - 1, ey + 3, 3, 1, '#8d5f43'); px(sx - 2, ey + 3, 1, 1, '#8d5f43'); px(sx + 2, ey + 3, 1, 1, '#8d5f43'); }
  }
  if (a.carry && a.carry.length) drawStack(a.x, a.y, a.carry, 16 + body, 3.4);
}

/* --------- kıyafet tanımları: oyuncu, çalışanlar, müşteriler --------- */
/* Oyuncu: Karadenizli balıkçı — lacivert yün kazak, muşamba önlük, kasket, lastik çizme */
function playerOutfit() {
  if (S.hero) return heroOutfit(S.hero, player.face);
  return {
    coat: '#1f4e6b', coat2: '#2f6b8f', knit: '#8fc0d8',
    apron: '#c9782f', skin: PAL.skin[0], hair: PAL.hair[0],
    cap: '#14364a', must: true, boot: '#16222b', bootTop: '#2f4450',
    pants: '#2b3a45', face: player.face
  };
}
/* Çalışanlar: rol = kıyafet kimliği */
var WORK_FIT = {
  hamal:     { coat: '#4f7fae', coat2: '#6a97c2', knit: '#cfe3f0', cap: '#23384a', kufe: true, must: true, pants: '#2e3f4a' },
  filetocu:  { coat: '#5f8f6a', coat2: '#79a884', apron: '#eae2cd', knife: true, cap: '#2f4a38', must: true, pants: '#2b3a32' },
  tezgahtar: { coat: '#b8624a', coat2: '#d07c60', apron: '#f0ece0', cap: '#6f2f22', tray: true, must: true, pants: '#4a2f26' },
  kasiyer:   { coat: '#2f4a6b', coat2: '#456c94', vest: '#1a2f45', bag: true, glasses: true, pants: '#22303c' }
};
function workerOutfit(w) {
  var f = WORK_FIT[w.role] || WORK_FIT.hamal, o = {}, k;
  for (k in f) o[k] = f[k];
  o.skin = PAL.skin[(w.tone === undefined ? (w.tone = irnd(0, 3)) : w.tone)];
  o.hair = PAL.hair[(w.hairI === undefined ? (w.hairI = irnd(0, 3)) : w.hairI)];
  o.face = w.face;
  return o;
}
/* Müşteriler: Anadolu kasabası tipleri */
var CUST_FIT = {
  isci:     { cap: '#2f3d4a', knit: '#9db6c9', must: true, apron: null, pants: '#33424f' },
  aile:     { scarf: '#c8553d', knit: '#f0d9c8', bag: true, pants: '#5a4038' },
  esnaf:    { vest: '#4a3a5e', sash: '#d9a441', must: true, cap: '#3a2c48', pants: '#3b3346' },
  sef:      { chefHat: true, apron: '#f7f7f2', knit: null, must: true, pants: '#3a3a3a' },
  kaptan:   { cap: '#0f2a3d', beard: true, vest: '#0f2a3d', pants: '#1a2836' },
  vip:      { vest: '#7a5406', sash: '#ffd76a', glasses: true, cap: null, must: true, pants: '#4a3a10' },
  toptanci: { apron: '#3a6230', cap: '#2a4a24', must: true, hold: true, pants: '#2e3d28' },
  turist:   { sunHat: '#f0ece0', bag: true, glasses: true, pants: '#6a4a5e' }
};
function custOutfit(cu) {
  var t = cu.type, f = CUST_FIT[t.id] || {}, o = {}, k;
  for (k in f) o[k] = f[k];
  o.coat = t.coat; o.coat2 = t.coat2;
  o.skin = PAL.skin[cu.tone % PAL.skin.length];
  o.hair = PAL.hair[cu.hair % PAL.hair.length];
  o.face = cu.face;
  if (cu.hair === 1 && o.must === undefined && !o.scarf) o.must = true;
  return o;
}

/* --------- duygu balonu (pixel, emoji değil) --------- */
function drawEmote(x, y, z, kind, scale) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, z));
  var s = scale || 1;
  px(sx - 6, sy - 6, 12, 11, PAL.edge);
  px(sx - 5, sy - 5, 10, 9, PAL.cream);
  px(sx - 2, sy + 5, 3, 2, PAL.cream);
  px(sx - 2, sy + 7, 1, 1, PAL.edge);
  if (kind === 'love') {                              /* kalp */
    px(sx - 3, sy - 3, 2, 2, PAL.madder); px(sx + 1, sy - 3, 2, 2, PAL.madder);
    px(sx - 3, sy - 1, 6, 2, PAL.madder); px(sx - 2, sy + 1, 4, 1, PAL.madder);
    px(sx - 1, sy + 2, 2, 1, PAL.madder);
  } else if (kind === 'angry') {                      /* öfke çizgileri */
    px(sx - 3, sy - 3, 2, 1, PAL.red); px(sx + 1, sy - 3, 2, 1, PAL.red);
    px(sx - 3, sy - 1, 1, 3, PAL.red); px(sx + 2, sy - 1, 1, 3, PAL.red);
    px(sx - 1, sy, 2, 3, PAL.red);
  } else if (kind === 'wait') {                       /* kum saati */
    px(sx - 3, sy - 3, 6, 1, PAL.brass);
    px(sx - 3, sy + 3, 6, 1, PAL.brass);
    px(sx - 2, sy - 2, 4, 1, PAL.saffron); px(sx - 1, sy - 1, 2, 1, PAL.saffron);
    px(sx - 1, sy, 2, 1, PAL.saffron); px(sx - 2, sy + 1, 4, 2, PAL.saffron);
  } else if (kind === 'coin') {
    px(sx - 3, sy - 3, 6, 6, PAL.brass);
    px(sx - 2, sy - 2, 4, 4, PAL.brassLite);
    px(sx - 1, sy - 1, 1, 3, PAL.brass);
  } else if (kind === 'que') {                        /* soru / sipariş */
    px(sx - 2, sy - 4, 4, 1, PAL.indigo); px(sx + 1, sy - 3, 1, 2, PAL.indigo);
    px(sx - 1, sy - 1, 2, 1, PAL.indigo); px(sx - 1, sy, 1, 1, PAL.indigo);
    px(sx - 1, sy + 2, 1, 1, PAL.indigo);
  }
}

/* --------- rol rozeti: çalışanın başının üstünde küçük pixel simge --------- */
var ROLE_TAG = {
  hamal:     { bg: '#4f7fae', d: 'kufe' },
  filetocu:  { bg: '#5f8f6a', d: 'knife' },
  tezgahtar: { bg: '#b8624a', d: 'fish' },
  kasiyer:   { bg: '#2f4a6b', d: 'coin' }
};
function drawRoleTag(w) {
  var g = ROLE_TAG[w.role] || ROLE_TAG.hamal;
  var lift = (w.carry && w.carry.length ? 10 + w.carry.length * 2 : 0);
  var sx = R(pX(w.x, w.y)), sy = R(pY(w.x, w.y, 34 + lift));
  px(sx - 5, sy - 5, 10, 8, PAL.edge);
  px(sx - 4, sy - 4, 8, 6, g.bg);
  px(sx - 4, sy - 4, 8, 1, shade(g.bg, 22));
  px(sx - 1, sy + 3, 3, 2, PAL.edge);
  var cx = sx, cy = sy - 1;
  if (g.d === 'kufe') { px(cx - 3, cy - 2, 6, 5, '#c9a15e'); px(cx - 3, cy - 2, 6, 1, '#e8ddc8'); px(cx - 3, cy, 6, 1, '#9a7340'); }
  else if (g.d === 'knife') { px(cx - 1, cy - 3, 1, 5, '#e8eef2'); px(cx - 1, cy + 2, 2, 2, '#6f4526'); px(cx, cy - 3, 1, 4, '#b7c3cc'); }
  else if (g.d === 'fish') { px(cx - 3, cy - 1, 5, 3, '#cfe6df'); px(cx + 2, cy - 2, 2, 5, '#cfe6df'); dot(cx - 2, cy, PAL.edge); }
  else if (g.d === 'coin') { px(cx - 2, cy - 2, 5, 5, PAL.brass); px(cx - 1, cy - 1, 3, 3, PAL.brassLite); }
  else if (g.d === 'cart') { px(cx - 3, cy - 2, 6, 3, '#c9a15e'); px(cx - 2, cy + 1, 2, 2, '#3c4650'); px(cx + 1, cy + 1, 2, 2, '#3c4650'); }
}

/* --------- MÜŞTERİ: çizim + tepki + kıpırdanma --------- */
function drawCustomer(cu) {
  var o = custOutfit(cu);
  o.mood = cu.state === 'wait' ? cu.mood : 1;
  o.walk = cu.state !== 'wait';
  /* beklerken küçük kıpırdanma: sabırsızlaştıkça hızlanır */
  if (cu.state === 'wait') {
    var rate = 0.7 + (1 - cu.mood) * 2.4;
    cu.fidget = (cu.fidget || 0) + 0.016 * rate;
    if (Math.sin(cu.fidget * 3) > 0.94) o.face = -cu.face;      /* etrafa bakınma */
  }
  drawPerson(cu, o);
  if (cu.state === 'leave') {                                    /* mutlu ayrılış */
    if ((cu.leaveT = (cu.leaveT || 0) + 0.016) < 1.2) drawEmote(cu.x, cu.y, 34, cu.happyLeave === false ? 'angry' : 'love');
    return;
  }
  if (cu.state !== 'wait') return;

  var sx = R(pX(cu.x, cu.y)), sy = R(pY(cu.x, cu.y, 0));
  var bx = sx + 14, by = sy - 30;
  /* sipariş tabelası — kilim çerçeveli */
  px(bx - 10, by - 9, 20, 17, PAL.edge);
  px(bx - 9, by - 8, 18, 15, PAL.cream);
  px(bx - 9, by - 8, 18, 1, PAL.madder);
  px(bx - 9, by + 6, 18, 1, PAL.madder);
  for (var m = 0; m < 4; m++) { px(bx - 8 + m * 5, by - 8, 2, 1, PAL.saffron); px(bx - 6 + m * 5, by + 6, 2, 1, PAL.saffron); }
  px(bx - 3, by + 8, 3, 3, PAL.cream);
  px(bx - 3, by + 11, 1, 1, PAL.edge);
  if (cu.ord.k === 'fume') drawFumeItem(bx - 3, by - 1, cu.ord.f); else drawFiletoItem(bx - 3, by - 1, cu.ord.f);
  uiText(cu.x, cu.y, 0, '×' + (cu.ord.need - cu.ord.got), '#ffe9a8', 10, 1, 19, -25);
  /* sabır halkası */
  var w = 18, fw = R(w * cu.mood);
  px(bx - 9, by - 12, w, 3, PAL.edge);
  px(bx - 9, by - 12, fw, 3, cu.mood > 0.55 ? PAL.green : (cu.mood > 0.28 ? PAL.gold : PAL.red));
  if (cu.type.pen) { px(bx - 11, by - 11, 1, 20, PAL.gold); px(bx + 10, by - 11, 1, 20, PAL.gold); }
  /* tepki balonu: sabırsızlık kademeleri */
  if (cu.mood < 0.22) drawEmote(cu.x, cu.y, 42, 'angry');
  else if (cu.mood < 0.45 && phase2(gameT, 1.4)) drawEmote(cu.x, cu.y, 42, 'wait');
}

/* =========================================================
   ÇİZİM — deniz, kıyı, bölgeler (Türkiye limanı)
   ========================================================= */
var shoal = [], waves = [], boats = [], village = [];
var _sd = 20260919;
function srnd() { _sd = (_sd * 1664525 + 1013904223) % 4294967296; return _sd / 4294967296; }
var scenery = [], grass = [];
(function initArt() {
  var i, x, y, g;
  for (i = 0; i < 420; i++) {
    g = 0; do { x = rnd(-26, 34); y = rnd(-26, 34); g++; } while (x > -1.4 && y > -1.4 && g < 40);
    shoal.push({ x: x, y: y, s: srnd() < 0.5 ? 1 : 2, sp: rnd(0.2, 0.5), ph: rnd(0, TAU) });
  }
  for (i = 0; i < 90; i++) {
    g = 0; do { x = rnd(-26, 34); y = rnd(-26, 34); g++; } while (x > -2 && y > -2 && g < 40);
    waves.push({ x: x, y: y, w: 2 + Math.floor(srnd() * 4), ph: rnd(0, TAU) });
  }
  boats.push({ x: -3.2, y: 2.6, r: 1 }, { x: -4.6, y: 8.0, r: 0 }, { x: 6.0, y: -3.6, r: 1 });
  for (i = 0; i < 26; i++) {
    village.push({ x: i * 26 + srnd() * 14, w: 10 + srnd() * 12, h: 7 + srnd() * 11,
      roof: srnd() < 0.75, t: srnd() });
  }
  /* kara süsleri: bölgelerin dışında kalan kıyı şeridi */
  function freeLand(fx, fy) {
    if (fx < -0.4 || fy < -0.4 || fx > 17.2 || fy > 24.2) return false;
    if (fx < 10.2 && fy < 17.8) return false;      /* iskele bölgeleri */
    if (fx > 10.2 && fx < 14.6 && fy > -0.4) return false; /* müşteri yolu */
    return true;
  }
  function nearDecor(fx, fy) { for (var q = 0; q < DECOR.length; q++) if (Math.hypot(DECOR[q].x - fx, DECOR[q].y - fy) < 1.3) return true; return false; }
  for (i = 0; i < 260; i++) {
    x = rnd(-0.4, 17.4); y = rnd(-0.4, 24.4);
    if (!freeLand(x, y) || nearDecor(x, y)) continue;
    var r = srnd();
    scenery.push({ x: x, y: y, t: r < 0.26 ? 'servi' : r < 0.48 ? 'cam' : r < 0.64 ? 'kaya' : r < 0.78 ? 'cali'
      : r < 0.86 ? 'ag' : r < 0.92 ? 'sandal' : r < 0.97 ? 'sepet' : 'varil', s: 0.8 + srnd() * 0.5 });
  }
  for (i = 0; i < 420; i++) {
    x = rnd(-0.6, 17.4); y = rnd(-0.6, 24.4);
    if (x < 10.1 && y < 17.6) continue;
    grass.push({ x: x, y: y, c: srnd() < 0.5 ? '#b9a878' : '#a8b06a' });
  }
  for (i = 0; i < 9; i++) gulls.push({ x: rnd(-20, 12), y: rnd(-18, 6), vx: rnd(0.5, 1.1), vy: rnd(0.1, 0.4), f: rnd(0, 6) });
})();

/* uzak sahil: beyaz evler, kırmızı çatılar, minare, servi (parallax) */
function drawVillage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var off = (camX * 0.22) % 260, base = Math.floor(H * 0.26) - Math.floor(camY * 0.12);
  if (base < -40) base = -40; if (base > H * 0.5) base = Math.floor(H * 0.5);
  /* tepeler */
  for (var h = 0; h < 3; h++) {
    var hy = base - 16 + h * 7;
    ctx.fillStyle = ['#5c6f4a', '#6b7d54', '#7b8b5e'][h];
    ctx.beginPath(); ctx.moveTo(0, hy + 14);
    for (var x = 0; x <= W + 8; x += 8) {
      var yy = hy + Math.sin((x + off * (h + 1) * 0.35) * 0.018 + h) * 5;
      ctx.lineTo(x, R(yy));
    }
    ctx.lineTo(W, hy + 20); ctx.lineTo(0, hy + 20); ctx.closePath(); ctx.fill();
  }
  /* evler */
  for (var i = 0; i < village.length; i++) {
    var v = village[i];
    var vx = ((v.x - off) % (26 * 26));
    if (vx < -30) vx += 26 * 26;
    if (vx > W + 20) continue;
    var vy = base + 4 - v.h;
    px(vx, vy, v.w, v.h, '#efe4cd');
    px(vx, vy, v.w, 1, '#fffaf0');
    if (v.roof) { px(vx - 1, vy - 2, v.w + 2, 2, '#b8442e'); }
    for (var wx = 2; wx < v.w - 2; wx += 4) px(vx + wx, vy + 2, 2, 2, '#6a5a44');
    if (v.t > 0.9) { /* servi ağacı */
      px(vx + v.w + 2, vy - 6, 3, v.h + 8, '#2f4a33');
      px(vx + v.w + 2, vy - 8, 3, 3, '#3b5c3f');
    }
  }
  /* minare + cami kubbesi */
  var mx = ((160 - off) % (26 * 26)); if (mx < -40) mx += 26 * 26;
  if (mx < W + 30) {
    var my = base - 4;
    px(mx + 16, my - 4, 14, 10, '#efe4cd');
    ctx.fillStyle = '#9aa7a2';
    ctx.beginPath(); ctx.arc(R(mx + 23), R(my - 4), 7, Math.PI, 0); ctx.closePath(); ctx.fill();
    px(mx + 22, my - 14, 1, 3, '#d8cfa8');
    px(mx + 8, my - 26, 3, 32, '#efe4cd');
    px(mx + 7, my - 16, 5, 2, '#b8442e');
    ctx.fillStyle = '#efe4cd';
    ctx.beginPath(); ctx.moveTo(R(mx + 7), R(my - 26)); ctx.lineTo(R(mx + 9.5), R(my - 33)); ctx.lineTo(R(mx + 12), R(my - 26)); ctx.closePath(); ctx.fill();
  }
  px(0, base + 4, W, 3, '#3f7d92');
}
/* ---------------------------------------------------------
   ÇEVRE v2 — Anadolu kıyısı: servi, zeytin, incir, kaya, ağ kurutma,
   çekek sandalı, hasır sepet, çay bahçesi, kedi, martı.
   --------------------------------------------------------- */
function drawScenery(d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0)), z = d.s;
  var sw = Math.sin(gameT * 0.8 + d.x) * 0.6;          /* rüzgâr */
  if (d.t === 'servi') {                                /* servi (Akdeniz selvisi) */
    px(sx - 1, sy - 5, 2, 5, '#6b4a28');
    px(sx - 3, sy - R(24 * z), 6, R(20 * z), PAL.cypress);
    px(sx - 3, sy - R(24 * z), 3, R(20 * z), PAL.cypressLite);
    px(sx - 2 + R(sw), sy - R(27 * z), 4, R(5 * z), PAL.cypressLite);
    px(sx - 1 + R(sw), sy - R(29 * z), 2, R(3 * z), PAL.cypress);
  } else if (d.t === 'cam') {                           /* zeytin ağacı */
    px(sx - 1, sy - 8, 3, 8, '#7a6248');
    px(sx - 2, sy - 6, 1, 4, '#5f4c37');
    px(sx - 8, sy - R(15 * z), 16, R(5 * z), '#728555');
    px(sx - 6, sy - R(19 * z), 12, R(5 * z), '#83975f');
    px(sx - 4, sy - R(22 * z), 8, R(4 * z), '#94a86c');
    px(sx - 5, sy - R(17 * z), 2, 1, '#4a5b38'); px(sx + 3, sy - R(20 * z), 2, 1, '#4a5b38');
  } else if (d.t === 'kaya') {                          /* kıyı kayası */
    px(sx - 6, sy - 5, 12, 5, '#a8a291');
    px(sx - 6, sy - 5, 12, 1, '#c2bca8');
    px(sx - 4, sy - 8, 8, 3, '#b5af9c');
    px(sx - 2, sy - 9, 4, 1, '#c8c2ae');
    px(sx + 2, sy - 3, 3, 1, '#8b8676');
  } else if (d.t === 'cali') {                          /* funda / kekik */
    px(sx - 4, sy - 4, 9, 4, '#8c9a56');
    px(sx - 2 + R(sw), sy - 7, 5, 3, '#9aa863');
    px(sx + 1, sy - 8, 1, 1, '#c9a15e');
  } else if (d.t === 'ag') {                            /* kurumaya asılı ağ */
    px(sx - 10, sy - 16, 2, 16, PAL.woodDark);
    px(sx + 8, sy - 16, 2, 16, PAL.woodDark);
    px(sx - 10, sy - 17, 20, 2, PAL.woodDark);
    ctx.globalAlpha = 0.85;
    for (var r = 0; r < 5; r++) px(sx - 9, sy - 14 + r * 3 + R(Math.sin(gameT * 1.2 + r) * 0.5), 18, 1, '#ded1a8');
    for (var c = 0; c < 6; c++) px(sx - 9 + c * 3, sy - 14, 1, 14, '#ded1a8');
    ctx.globalAlpha = 1;
    px(sx - 4, sy - 5, 2, 2, PAL.madder);               /* şamandıra */
  } else if (d.t === 'sandal') {                        /* karaya çekilmiş sandal */
    px(sx - 11, sy - 4, 22, 4, '#8a5a2e');
    px(sx - 10, sy - 6, 20, 2, '#a8683a');
    px(sx - 9, sy - 7, 18, 1, '#e8d9b8');
    px(sx - 4, sy - 9, 8, 2, '#6f4526');
    px(sx - 13, sy - 2, 4, 2, '#7a5230'); px(sx + 9, sy - 2, 4, 2, '#7a5230');
  } else if (d.t === 'sepet') {                         /* hasır sepet yığını */
    px(sx - 5, sy - 6, 10, 6, '#b8924f');
    px(sx - 5, sy - 6, 10, 1, '#d6b174');
    px(sx - 5, sy - 3, 10, 1, '#96763f');
    px(sx - 3, sy - 10, 7, 4, '#c9a15e');
    px(sx - 3, sy - 10, 7, 1, '#e0bd80');
  } else {                                              /* varil */
    px(sx - 4, sy - 10, 9, 10, '#8a5a2e');
    px(sx - 4, sy - 10, 9, 2, '#a86f3a');
    px(sx - 4, sy - 6, 9, 1, '#5d3c1c');
    px(sx - 4, sy - 3, 9, 1, '#5d3c1c');
  }
}

/* --- liman kedisi: uyur, esner, yürür (Anadolu klasiği) --- */
var cats = [
  { x: 8.4, y: 4.4,  dir: 1,  t: 0, st: 'sit',   col: '#d8b06a' },   /* sarman */
  { x: 2.4, y: 5.4,  dir: -1, t: 2, st: 'sleep', col: '#8b8f96' },   /* tekir */
  { x: 7.2, y: 11.6, dir: 1,  t: 4, st: 'sit',   col: '#3b332c' }    /* kara kedi */
];
function updateCats(dt) {
  for (var i = 0; i < cats.length; i++) {
    var c = cats[i];
    c.t -= dt;
    if (c.t <= 0) {
      c.t = rnd(3, 9);
      c.st = c.st === 'walk' ? (Math.random() < 0.5 ? 'sit' : 'sleep') : 'walk';
      c.dir = Math.random() < 0.5 ? 1 : -1;
    }
    if (c.st === 'walk') {
      var nx = c.x + c.dir * 0.5 * dt;
      if (canStand(nx, c.y)) c.x = nx; else c.dir *= -1;
    }
  }
}
function drawCat(c) {
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 0));
  var d = c.dir > 0 ? 1 : -1;
  if (c.st === 'sleep') {
    px(sx - 5, sy - 3, 10, 3, c.col);
    px(sx - 5, sy - 4, 7, 1, shade(c.col, 18));
    px(sx + d * 4, sy - 5, 3, 3, c.col);                 /* baş */
    px(sx + d * 4, sy - 6, 1, 1, c.col); px(sx + d * 6, sy - 6, 1, 1, c.col);
    if (phase2(gameT, 0.5)) { px(sx - d * 6, sy - 9, 1, 1, PAL.cream); px(sx - d * 7, sy - 11, 1, 1, PAL.cream); }
    return;
  }
  var bob = c.st === 'walk' ? (phase2(gameT, 6) ? 1 : 0) : 0;
  px(sx - 3, sy - 5 - bob, 7, 4, c.col);                 /* gövde */
  px(sx - 3, sy - 5 - bob, 7, 1, shade(c.col, 16));
  px(sx + d * 3, sy - 8 - bob, 3, 3, c.col);             /* baş */
  px(sx + d * 3, sy - 9 - bob, 1, 1, c.col);             /* kulak */
  px(sx + d * 5, sy - 9 - bob, 1, 1, c.col);
  dot(sx + d * 4, sy - 7 - bob, PAL.edge);
  px(sx - d * 4, sy - 8 - bob + (c.st === 'walk' ? (phase2(gameT, 3) ? -1 : 0) : 0), 1, 4, c.col); /* kuyruk */
  px(sx - 2, sy - 1 - bob, 1, 1, c.col); px(sx + 1, sy - 1 - bob, 1, 1, c.col);
}

/* --- martı: kanat çırpma 4 kare --- */
function drawGull(g) {
  var sx = R(pX(g.x, g.y)), sy = R(pY(g.x, g.y, 46 + Math.sin(g.f * 0.5) * 3));
  var ph = Math.floor(g.f * 1.4) & 3;
  var up = ph === 0 ? -2 : ph === 1 ? 0 : ph === 2 ? 2 : 0;
  px(sx - 4, sy + up, 4, 1, '#ffffff');
  px(sx + 1, sy + up, 4, 1, '#ffffff');
  px(sx - 5, sy + (up > 0 ? up - 1 : up + 1), 2, 1, '#e8e8e8');
  px(sx + 4, sy + (up > 0 ? up - 1 : up + 1), 2, 1, '#e8e8e8');
  px(sx - 1, sy, 3, 1, '#f0f0f0');
  px(sx + 2, sy, 1, 1, '#e0a45a');                        /* gaga */
}

/* --- deniz: bantlar + parıltı + kıyı köpüğü --- */
function drawSea() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var bands = [['#17607f', 0], ['#1a6b8c', 0.16], ['#1d7598', 0.30], ['#2180a4', 0.44],
               ['#258bb0', 0.58], ['#2995bb', 0.72], ['#2ea0c6', 0.86]];
  for (var i = 0; i < bands.length; i++) {
    var y0 = Math.floor(H * bands[i][1]);
    var y1 = i < bands.length - 1 ? Math.floor(H * bands[i + 1][1]) : H;
    px(0, y0, W, y1 - y0, bands[i][0]);
  }
  /* güneş parıltısı: yatay kırık çizgiler */
  for (var g = 0; g < 26; g++) {
    var gy = Math.floor(H * 0.12) + ((g * 37) % Math.floor(H * 0.8));
    var gx = ((g * 91) % W) + R(Math.sin(gameT * 0.6 + g) * 4);
    ctx.globalAlpha = 0.10 + 0.07 * Math.abs(Math.sin(gameT * 0.8 + g));
    px(gx, gy, 5 + (g % 3) * 3, 1, PAL.seaGlint);
  }
  ctx.globalAlpha = 1;
}
function drawWaves() {
  for (var i = 0; i < waves.length; i++) {
    var w = waves[i];
    var ph = Math.sin(gameT * 0.9 + w.ph);
    if (ph < 0.15) continue;
    var sx = pX(w.x, w.y), sy = pY(w.x, w.y, 0);
    ctx.globalAlpha = Math.min(1, (ph - 0.15) * 2.2);
    px(sx, sy, w.w, 1, 'rgba(232,246,252,.75)');
    if (ph > 0.75) px(sx + 1, sy + 1, Math.max(1, w.w - 2), 1, 'rgba(232,246,252,.35)');
  }
  ctx.globalAlpha = 1;
}
/* --- tekne: gövde + bayrak + sancak feneri, suda sallanır --- */
function drawBoat(b) {
  var rock = Math.sin(gameT * 1.1 + b.x) * 1.3;
  var sx = R(pX(b.x, b.y)), sy = R(pY(b.x, b.y, 0)) + R(rock);
  /* su izi */
  ctx.globalAlpha = 0.3; px(sx - 11, sy + 2, 22, 1, PAL.foam); ctx.globalAlpha = 1;
  px(sx - 10, sy - 4, 20, 5, '#6f3a20');
  px(sx - 9, sy - 6, 18, 2, '#a8552c');
  px(sx - 8, sy - 7, 16, 1, '#e8d9b8');
  px(sx - 10, sy - 4, 20, 1, '#8d4a28');
  /* mavi bordür (Ege teknesi) */
  px(sx - 9, sy - 2, 18, 1, PAL.turkuaz);
  px(sx - 1, sy - 17, 2, 11, '#5d3c1c');                 /* direk */
  if (b.r) {
    px(sx + 1, sy - 17, 8, 9, '#e8e2d0');                /* yelken */
    px(sx + 1, sy - 17, 8, 1, PAL.madder);
  } else {
    px(sx + 1, sy - 16, 6, 4, '#e30a17');                /* bayrak */
    px(sx + 3, sy - 15, 2, 2, '#ffffff');
  }
  px(sx + 8, sy - 6, 1, 2, phase2(gameT, 1) ? '#5fd37a' : '#2a6a3c');  /* sancak feneri */
}

function drawShoal() {
  for (var i = 0; i < shoal.length; i++) {
    var f = shoal[i];
    f.x += f.sp * 0.004;
    if (f.x > 34) f.x = -26;
    if (f.x > -1.4 && f.y > -1.4) continue;
    var sx = pX(f.x, f.y), sy = pY(f.x, f.y, 0) + Math.sin(gameT * 1.4 + f.ph) * 1.2;
    px(sx, sy, f.s + 2, f.s, 'rgba(10,45,70,.55)');
  }
}
var LANDX = 17.5, LANDY = 24.5;
function drawLand() {
  quad([[pX(-0.7, -0.7), pY(-0.7, -0.7, 0)], [pX(LANDX, -0.7), pY(LANDX, -0.7, 0)],
        [pX(LANDX, LANDY), pY(LANDX, LANDY, 0)], [pX(-0.7, LANDY), pY(-0.7, LANDY, 0)]], '#cbb98d');
  /* kuru ot dokusu */
  ctx.save(); ctx.globalAlpha = 0.5;
  for (var i = 0; i < grass.length; i++) px(pX(grass[i].x, grass[i].y), pY(grass[i].x, grass[i].y, 0), 2, 1, grass[i].c);
  ctx.restore();
  /* v0.1: ıslak kum bandı — kara/deniz geçişini yumuşatır */
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#b8a97e'; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX - 0.15, -0.55)), R(pY(LANDX - 0.15, -0.55, 0)));
  ctx.lineTo(R(pX(-0.55, -0.55)), R(pY(-0.55, -0.55, 0)));
  ctx.lineTo(R(pX(-0.55, LANDY - 0.15)), R(pY(-0.55, LANDY - 0.15, 0)));
  ctx.lineTo(R(pX(LANDX - 0.15, LANDY - 0.15)), R(pY(LANDX - 0.15, LANDY - 0.15, 0)));
  ctx.stroke();
  /* köpük: hafifçe nefes alır */
  ctx.globalAlpha = 0.18 + Math.sin(gameT * 0.7) * 0.06;
  ctx.strokeStyle = '#e8f6fb'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX + 0.1, -0.82)), R(pY(LANDX + 0.1, -0.82, 0)));
  ctx.lineTo(R(pX(-0.82, -0.82)), R(pY(-0.82, -0.82, 0)));
  ctx.lineTo(R(pX(-0.82, LANDY + 0.1)), R(pY(-0.82, LANDY + 0.1, 0)));
  ctx.lineTo(R(pX(LANDX + 0.1, LANDY + 0.1)), R(pY(LANDX + 0.1, LANDY + 0.1, 0)));
  ctx.stroke();
  ctx.restore();
  /* rıhtım kenarı (tüm çevre) */
  ctx.strokeStyle = '#bdb49c'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, -0.7)), R(pY(-0.7, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, LANDY)), R(pY(-0.7, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, LANDY)), R(pY(LANDX, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX + 0.35, -1.05)), R(pY(LANDX + 0.35, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, -1.05)), R(pY(-1.05, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, LANDY + 0.35)), R(pY(-1.05, LANDY + 0.35, 0)));
  ctx.lineTo(R(pX(LANDX + 0.35, LANDY + 0.35)), R(pY(LANDX + 0.35, LANDY + 0.35, 0)));
  ctx.closePath(); ctx.stroke();
}

/* bölge zemini — seviyeye göre görsel (GDD §21.1) */
/* ---------------------------------------------------------
   BÖLGE ZEMİNİ v2 — iskele tahtası → arnavut kaldırımı → mozaik
   Lv1 ham ahşap iskele, Lv2 boyalı tahta + halat, Lv3 kagir rıhtım
   --------------------------------------------------------- */
function drawArea(a, i) {
  var w = a.x1 - a.x0, h = a.y1 - a.y0;
  if (a.locked) {
    ctx.save(); ctx.globalAlpha = 0.40;
    isoQuad(a.x0, a.y0, w, h, 0, '#8d8156');
    ctx.restore();
    /* halat çit + kırmızı-beyaz şerit */
    ctx.save(); ctx.setLineDash([4, 4]); ctx.lineDashOffset = -gameT * 5;
    ctx.strokeStyle = 'rgba(232,213,168,.6)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(a.x0, a.y0)), R(pY(a.x0, a.y0, 0)));
    ctx.lineTo(R(pX(a.x1, a.y0)), R(pY(a.x1, a.y0, 0)));
    ctx.lineTo(R(pX(a.x1, a.y1)), R(pY(a.x1, a.y1, 0)));
    ctx.lineTo(R(pX(a.x0, a.y1)), R(pY(a.x0, a.y1, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    var mx = (a.x0 + a.x1) / 2, my = a.y0 + 0.45;
    if (dist2(player.x, player.y, mx, my) < 24) uiLabel(mx, my, 12, NM(a.n), '#e8d5a8', 0.85);
    return;
  }
  var lv = a.lvl;
  var base = lv >= 3 ? '#c8c0ac' : (lv === 2 ? '#bf8b51' : PAL.wood);
  isoQuad(a.x0, a.y0, w, h, 0, base);

  if (lv >= 3) {
    /* arnavut kaldırımı: kare taşlar + derz */
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#9a9483'; ctx.lineWidth = 1;
    for (var k = a.y0 + 0.5; k < a.y1; k += 0.5) {
      ctx.beginPath();
      ctx.moveTo(R(pX(a.x0, k)), R(pY(a.x0, k, 0))); ctx.lineTo(R(pX(a.x1, k)), R(pY(a.x1, k, 0)));
      ctx.stroke();
    }
    for (var k2 = a.x0 + 0.5; k2 < a.x1; k2 += 0.5) {
      ctx.beginPath();
      ctx.moveTo(R(pX(k2, a.y0)), R(pY(k2, a.y0, 0))); ctx.lineTo(R(pX(k2, a.y1)), R(pY(k2, a.y1, 0)));
      ctx.stroke();
    }
    ctx.restore();
    /* kilim şeridi: bölgenin ortasından geçen mozaik yol */
    var my2 = (a.y0 + a.y1) / 2;
    ctx.save(); ctx.globalAlpha = 0.55;
    isoQuad(a.x0 + 0.4, my2 - 0.35, w - 0.8, 0.7, 0.2, '#b8a98c');
    ctx.restore();
    for (var m = 0; m < Math.floor(w); m++) {
      var mxp = R(pX(a.x0 + 0.9 + m, my2)), myp = R(pY(a.x0 + 0.9 + m, my2, 0.6));
      px(mxp - 2, myp - 1, 2, 1, PAL.madder); px(mxp - 3, myp, 4, 1, PAL.madder); px(mxp - 2, myp + 1, 2, 1, PAL.madder);
      px(mxp - 1, myp, 1, 1, PAL.saffron);
    }
  } else {
    /* iskele tahtaları */
    ctx.save(); ctx.globalAlpha = lv === 2 ? 0.30 : 0.24;
    ctx.strokeStyle = lv === 2 ? '#8a5a2e' : '#7d5228'; ctx.lineWidth = 1;
    for (var k3 = a.y0 + 1; k3 < a.y1; k3 += 1) {
      ctx.beginPath();
      ctx.moveTo(R(pX(a.x0, k3)), R(pY(a.x0, k3, 0))); ctx.lineTo(R(pX(a.x1, k3)), R(pY(a.x1, k3, 0)));
      ctx.stroke();
    }
    ctx.restore();
    /* çivi başları */
    for (var n = 0; n < Math.floor(h); n++) {
      var nx = R(pX(a.x0 + 0.5, a.y0 + 0.5 + n)), ny = R(pY(a.x0 + 0.5, a.y0 + 0.5 + n, 0));
      dot(nx, ny, 'rgba(90,60,30,.5)');
      var nx2 = R(pX(a.x1 - 0.5, a.y0 + 0.5 + n)), ny2 = R(pY(a.x1 - 0.5, a.y0 + 0.5 + n, 0));
      dot(nx2, ny2, 'rgba(90,60,30,.5)');
    }
    if (lv >= 2) {                                    /* boyalı kenar şeridi */
      ctx.save(); ctx.globalAlpha = 0.32;
      isoQuad(a.x0 + 0.25, a.y0 + 0.25, w - 0.5, 0.22, 0, PAL.turkuaz);
      isoQuad(a.x0 + 0.25, a.y1 - 0.45, w - 0.5, 0.22, 0, PAL.turkuaz);
      ctx.restore();
    }
  }
}
/* çit babası: Lv1 ahşap kazık, Lv2 halatlı, Lv3 taş korkuluk */
function fencePost(x, y, lv) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  if (lv >= 3) {
    px(sx - 2, sy - 13, 4, 13, '#a8a08c');
    px(sx - 2, sy - 13, 2, 13, '#c0b8a2');
    px(sx - 3, sy - 15, 6, 2, '#b3aa93');
    px(sx - 3, sy - 9, 6, 1, PAL.iron);
  } else {
    px(sx - 1, sy - 10, 3, 10, PAL.woodDark);
    px(sx - 1, sy - 10, 2, 10, PAL.wood);
    px(sx - 2, sy - 11, 5, 1, PAL.woodLite);
    if (lv >= 2) px(sx - 3, sy - 7, 7, 1, PAL.rope);
  }
}
/* sokak lambası: dökme demir, sıcak ışık, gece titremesi */
function drawLamp(x, y) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  px(sx - 1, sy - 24, 3, 24, '#3c4650');
  px(sx - 1, sy - 24, 1, 24, '#586773');
  px(sx - 3, sy - 6, 7, 2, '#2b3a45');              /* kaide */
  px(sx - 4, sy - 30, 9, 5, '#2b3a45');             /* fener gövdesi */
  var glow = 0.75 + Math.sin(gameT * 3.1) * 0.12;
  px(sx - 3, sy - 29, 7, 3, 'rgba(255,217,138,' + glow + ')');
  px(sx - 3, sy - 31, 7, 1, '#4a5a66');
  px(sx - 1, sy - 32, 3, 1, '#2b3a45');
  /* süs kıvrımı */
  px(sx - 5, sy - 25, 2, 1, '#3c4650'); px(sx + 4, sy - 25, 2, 1, '#3c4650');
  var p = clamp(day.t / DAY_LEN, 0, 1);
  var night = p > 0.7 || p < 0.1 || day.phase === 'closing' || day.phase === 'summary';
  ctx.save(); ctx.globalAlpha = night ? 0.30 : 0.13;
  quad([[sx - 13, sy], [sx, sy - 8], [sx + 13, sy], [sx, sy + 8]], '#ffd98a');
  ctx.restore();
}
/* bölge tabelası: ahşap levha + demir askı + kilim çentiği */
function drawSign(a) {
  var locked = a.locked;
  var x = locked ? (a.x0 + a.x1) / 2 : a.x0 + 0.6, y = locked ? (a.y0 + a.y1) / 2 : a.y1 - 0.35;
  if (dist2(player.x, player.y, x, y) > 60) return;      /* uzaktaki tabela çizilmez */
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  var s = UP(NM(a.n));
  var fs = locked ? 10 : 8;
  uctx.font = uiFont(fs);
  var w = R((uctx.measureText(s).width + (locked ? 26 : 14)) / PXS);
  var h = R((fs + 9) / PXS);
  var top = locked ? 12 : 10;
  if (locked) { px(sx - 2, sy - top, 2, top, '#6b4a28'); px(sx + 1, sy - top, 2, top, '#6b4a28'); }
  else px(sx - 1, sy - top, 2, top, '#6b4a28');
  /* levha */
  px(sx - w / 2 - 1, sy - top - h - 1, w + 2, h + 2, '#4a3220');
  px(sx - w / 2, sy - top - h, w, h, '#c9a15e');
  px(sx - w / 2, sy - top - h, w, 1, '#ddb877');
  /* kilim çentikleri */
  for (var i = 0; i < 3; i++) {
    px(sx - w / 2 + 1 + i * 2, sy - top - h + 1, 1, 1, PAL.madder);
    px(sx + w / 2 - 2 - i * 2, sy - top - 1, 1, 1, PAL.madder);
  }
  uiText(x, y, 0, s, '#3a2401', fs, locked ? 1 : 0.95, 0, -top - h / 2 + fs / (2.6 * PXS), 'rgba(233,213,168,.85)');
}

/* =========================================================
   ÇİZİM — istasyonlar / yapılar / proje / süs
   ========================================================= */
/* ---------------------------------------------------------
   İSTASYONLAR v2 — Anadolu balıkçı limanı detaylarıyla
   Ağ makarası, kesim tezgâhı, fümehane ocağı, pazar tezgâhı.
   Her istasyonun kendi çalışma animasyonu var.
   --------------------------------------------------------- */

/* --- AĞ NOKTASI: iskele babası + ağ makarası + ağ tamir sopası --- */
function drawSpot(s) {
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  var busy = s.stock.length < areaStock(s.z);
  var spin = busy ? Math.sin(gameT * 2.2) : 0;

  /* iskele babası (halat bağlama) */
  px(sx - 4, sy - 15, 8, 15, PAL.woodDark);
  px(sx - 4, sy - 15, 5, 15, PAL.wood);
  px(sx - 4, sy - 15, 8, 2, PAL.woodLite);
  px(sx - 5, sy - 11, 10, 2, PAL.rope);                 /* sarılı halat */
  px(sx - 5, sy - 8, 10, 1, shade(PAL.rope, -22));

  /* ağ makarası (dönen) */
  px(sx - 7, sy - 24, 14, 9, PAL.woodDark);
  px(sx - 6, sy - 23, 12, 7, '#ded1a8');
  for (var i = -5; i <= 5; i += 2) {
    var off = R(spin * 1.2);
    px(sx + i + off, sy - 23, 1, 7, 'rgba(120,110,70,.55)');
  }
  px(sx - 8, sy - 21, 2, 3, PAL.iron);                  /* mil */
  px(sx + 6, sy - 21, 2, 3, PAL.iron);
  px(sx - 7, sy - 25, 14, 1, PAL.woodLite);

  /* suya uzanan ağ — dalgayla oynar */
  var ex = s.face === 'n' ? s.x + 0.2 : s.x - 3.0, ey = s.face === 'n' ? s.y - 3.0 : s.y + 0.2;
  ctx.strokeStyle = 'rgba(236,230,196,.85)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 24);
  ctx.quadraticCurveTo(R((sx + pX(ex, ey)) / 2), R(pY((s.x + ex) / 2, (s.y + ey) / 2, 34 + Math.sin(gameT * 1.1) * 4)),
    R(pX(ex, ey)), R(pY(ex, ey, 2)));
  ctx.stroke();
  /* şamandıralar (mantar) */
  for (var f = 1; f <= 2; f++) {
    var tt = f / 3;
    var mx = s.x + (ex - s.x) * tt, my = s.y + (ey - s.y) * tt;
    var fz = 20 + Math.sin(gameT * 1.1 + f) * 3;
    px(R(pX(mx, my)) - 1, R(pY(mx, my, fz)) - 1, 3, 3, f % 2 ? PAL.madder : PAL.cream);
  }
  /* ağın deniz üstündeki gölgesi */
  ctx.save(); ctx.globalAlpha = 0.38;
  isoQuad(ex - 0.8, ey - 0.8, 1.6, 1.6, 0, '#dff0f8');
  ctx.restore();

  /* balık sandığı + sepet */
  isoBox(s.x - 0.62, s.y + 0.42, 1.24, 0.95, 0, 6, '#7a5230', '#4f3220', '#63401f');
  px(R(pX(s.x, s.y + 0.9)) - 7, R(pY(s.x, s.y + 0.9, 6)) - 1, 14, 1, PAL.woodLite);
  drawStack(s.x, s.y + 0.9, s.stock, 6, 3.2);
  /* hasır sepet yanında */
  var bx = R(pX(s.x + 0.9, s.y + 0.2)), by = R(pY(s.x + 0.9, s.y + 0.2, 0));
  px(bx - 4, by - 6, 8, 6, '#b8924f');
  px(bx - 4, by - 6, 8, 1, '#d6b174');
  px(bx - 4, by - 3, 8, 1, '#96763f');
  labelAt(s.x, s.y + 1.8, 30, T('stNet') + ' ' + s.stock.length, '#bfe9ff', '' + s.stock.length);
}

/* --- KAPALI TEZGÂH: kepenk inik, tente toplanmış, KAPALI levhası --- */
function drawCounterClosed(c) {
  isoBox(c.x - 0.58, c.y - 1.05, 1.16, 2.1, 0, 12, '#8e7350', '#5a3a20', '#6d472a');
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  var by = R(pY(c.x, c.y, 0));
  /* inik kepenk */
  px(sx - 12, by - 12, 24, 12, '#4a5258');
  for (var g = 0; g < 4; g++) px(sx - 12, by - 10 + g * 3, 24, 1, '#5f686f');
  px(sx - 12, by - 12, 24, 1, '#8b949c');
  px(sx - 2, by - 5, 4, 1, PAL.brass);
  /* toplanmış tente */
  px(sx - 13, sy - 14, 26, 3, PAL.woodDark);
  px(sx - 11, sy - 12, 22, 2, '#9a6c4e');
  px(sx - 13, sy - 14, 2, 14, PAL.woodDark); px(sx + 11, sy - 14, 2, 14, PAL.woodDark);
  /* KAPALI levhası */
  px(sx - 9, sy - 9, 18, 8, '#3a2a1c');
  px(sx - 8, sy - 8, 16, 6, '#c9a15e');
  px(sx - 6, sy - 6, 12, 1, '#3a2401');
  px(sx - 6, sy - 4, 8, 1, '#3a2401');
  ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(gameT * 2) * 0.15;
  px(sx - 14, sy - 16, 28, 1, PAL.gold); ctx.restore();
  if (dist2(player.x, player.y, c.x, c.y) < 26)
    uiLabel(c.x, c.y - 1.5, 30,
      (c.fish ? NM(FISH[c.fish].n) : T('stStall')) + ' — ' + T('stallClosed'), '#c9a15e', 1);
  if (dist2(player.x, player.y, c.x, c.y) < 9)
    uiLabel(c.x, c.y - 1.5, 44, T('howToOpen'), '#9df5b0', 1);
}

/* --- KESİM MASASI: mermer tezgâh, zeytin ağacı kütük, satır --- */
function drawTable(tb) {
  var sx0 = R(pX(tb.x, tb.y)), sy0 = R(pY(tb.x, tb.y, 0));
  /* ahşap ayaklar */
  px(sx0 - 13, sy0 - 6, 2, 6, PAL.woodDark);
  px(sx0 + 11, sy0 - 6, 2, 6, PAL.woodDark);
  isoBox(tb.x - 0.72, tb.y - 0.52, 1.44, 1.04, 0, 11, PAL.wood, PAL.woodDark, '#85552f');
  var sx = R(pX(tb.x, tb.y)), sy = R(pY(tb.x, tb.y, 11));
  /* mermer üst */
  px(sx - 14, sy - 4, 28, 5, '#ddd6c4');
  px(sx - 14, sy - 4, 28, 1, '#f0ebde');
  px(sx - 10, sy - 2, 5, 1, '#c6bda8'); px(sx + 3, sy - 3, 6, 1, '#c6bda8');
  /* zeytin kütük */
  px(sx - 5, sy - 8, 9, 5, '#9a7340');
  px(sx - 5, sy - 8, 9, 1, '#bb9055');
  px(sx - 3, sy - 7, 2, 1, '#7a5a30'); px(sx + 1, sy - 6, 2, 1, '#7a5a30');
  /* satır — çalışırken iner kalkar */
  var chop = tb.cur ? (phase2(gameT, tb.worker ? 7 : 4.5) ? 1 : 0) : 0;
  if (tb.cur && chop && !tb._ch) sfx.chop();
  tb._ch = chop;
  var cy = sy - 9 - chop * 4;
  px(sx + 5, cy, 2, 6, '#5a4630');                      /* sap */
  px(sx + 3, cy - 4, 6, 4, '#e2eaf0');                  /* ağız */
  px(sx + 3, cy - 4, 6, 1, '#f7fbfd');
  if (tb.cur) {
    drawItem(tb.cur, sx - 2, sy - 5);
    if (chop) { px(sx + 1, sy - 7, 1, 1, PAL.cream); px(sx + 3, sy - 8, 1, 1, PAL.cream); }
    var pr = clamp(tb.t / FISH[tb.cur.f].cut, 0, 1);
    px(sx - 9, sy - 18, 18, 3, PAL.edge);
    px(sx - 9, sy - 18, R(18 * pr), 3, PAL.green);
  }
  /* asılı bıçak rafı */
  px(sx - 13, sy - 14, 8, 1, PAL.iron);
  px(sx - 12, sy - 13, 1, 4, '#cfd8de'); px(sx - 9, sy - 13, 1, 3, '#cfd8de');
  drawStack(tb.x - 0.25, tb.y + 0.1, tb.inn, 11, 3.2);
  var tfn = tableFishNames(tb);
  labelAt(tb.x, tb.y + 1.15, 24,
    (tfn.length ? T('tableFor', { n: tfn.join(', ') }) : T('tableAny')) + (tb.worker ? ' ★' : ''),
    '#ffe6bf', tb.inn.length ? '' + tb.inn.length : '');
  /* hasır tepsi (fileto) */
  isoQuad(tb.mat.x - 0.62, tb.mat.y - 0.52, 1.24, 1.04, 0.4, '#b8924f');
  isoQuad(tb.mat.x - 0.48, tb.mat.y - 0.4, 0.96, 0.8, 0.9, '#efe6d2');
  drawStack(tb.mat.x, tb.mat.y, tb.mat.items, 2.4, 3.2);
}

/* --- FÜMEHANE: kagir ocak, teneke baca, kiremit şapka --- */
function drawSmoker() {
  var s = smoker;
  isoBox(s.x - 0.8, s.y - 0.65, 1.6, 1.3, 0, 14, PAL.stone, PAL.stoneDark, '#a5977c');
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 14));
  /* taş örgü dokusu */
  for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++)
    px(sx - 9 + c * 7 + (r % 2 ? 3 : 0), sy - 2 + r * 4, 6, 3, r % 2 ? '#c2b295' : '#cdbfa2');
  /* ocak ağzı + ateş */
  px(sx - 6, sy - 6, 12, 6, '#2e2119');
  var fl = 0.55 + Math.abs(Math.sin(gameT * 7)) * 0.4;
  px(sx - 5, sy - 3, 10, 3, 'rgba(255,150,60,' + fl + ')');
  px(sx - 3, sy - 4, 6, 2, 'rgba(255,214,120,' + fl + ')');
  /* baca */
  px(sx - 3, sy - 22, 6, 16, PAL.zinc);
  px(sx - 3, sy - 22, 3, 16, PAL.ironLite);
  px(sx - 5, sy - 24, 10, 3, PAL.zincDark);
  /* kiremit şapka */
  px(sx - 11, sy - 8, 22, 3, PAL.tile);
  px(sx - 11, sy - 8, 22, 1, PAL.tileLite);
  /* asılı füme balıklar */
  px(sx - 10, sy - 14, 20, 1, '#6f4526');
  for (var h = 0; h < 4; h++) {
    var hx = sx - 8 + h * 5, sw = Math.sin(gameT * 1.4 + h) * 0.6;
    px(hx + R(sw), sy - 13, 1, 3, '#8d6a40');
    px(hx - 1 + R(sw), sy - 10, 3, 4, '#c9863c');
    px(hx - 1 + R(sw), sy - 10, 3, 1, '#e0a45a');
  }
  if (s.cur) {
    for (var i = 0; i < 4; i++) {
      var t = (gameT * 0.45 + i * 0.25) % 1;
      ctx.globalAlpha = (1 - t) * 0.42;
      px(sx - 2 + Math.sin(t * 5 + i) * 5, sy - 26 - t * 24, 3 + t * 3, 2 + t * 2, '#e8e2d8');
    }
    ctx.globalAlpha = 1;
    var pr = clamp(s.t / FUME_TIME, 0, 1);
    px(sx - 9, sy - 30, 18, 3, PAL.edge);
    px(sx - 9, sy - 30, R(18 * pr), 3, PAL.gold);
  }
  drawStack(s.x + 0.4, s.y + 0.3, s.inn, 14, 3.2);
  labelAt(s.x, s.y + 1.5, 40, T('stSmoke'), '#ffd3a0', s.inn.length ? '' + s.inn.length : '');
  isoQuad(s.mat.x - 0.62, s.mat.y - 0.52, 1.24, 1.04, 0.4, '#b8924f');
  isoQuad(s.mat.x - 0.48, s.mat.y - 0.4, 0.96, 0.8, 0.9, '#e6d5b8');
  drawStack(s.mat.x, s.mat.y, s.mat.items, 2.4, 3.2);
}

/* --- PAZAR TEZGÂHI: çizgili tente, buz yatağı, fiyat tabelası, terazi --- */
function drawCounter(c) {
  if (!c.open) { drawCounterClosed(c); return; }
  /* gövde: ahşap + önde kilim eteği */
  isoBox(c.x - 0.58, c.y - 1.05, 1.16, 2.1, 0, 12, '#c08a52', '#7d4f2b', '#95602f');
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  var by = R(pY(c.x, c.y, 0));
  /* kilim eteği (baklava motifi) */
  px(sx - 12, by - 9, 24, 8, PAL.madder);
  px(sx - 12, by - 9, 24, 1, shade(PAL.madder, 20));
  px(sx - 12, by - 8, 24, 1, PAL.saffron);
  for (var k = 0; k < 6; k++) {
    var kx = sx - 11 + k * 4;
    px(kx + 1, by - 6, 1, 1, PAL.cream);
    px(kx, by - 5, 3, 1, PAL.cream);
    px(kx + 1, by - 4, 1, 1, PAL.cream);
    px(kx + 1, by - 5, 1, 1, PAL.indigo);
  }
  px(sx - 12, by - 2, 24, 1, PAL.saffron);
  /* buz yatağı */
  px(sx - 12, sy - 4, 24, 4, '#cfe6f2');
  px(sx - 12, sy - 4, 24, 1, '#eaf6fb');
  for (var b2 = 0; b2 < 6; b2++) px(sx - 10 + b2 * 4, sy - 3, 2, 2, '#aed6e8');
  /* tente: kırmızı-beyaz çizgili, hafif sallanır */
  var sw2 = Math.sin(gameT * ANIM.waveFps) * 0.8;
  for (var i = 0; i < 7; i++) {
    var yy = sy - 24 + i;
    px(sx - 13 + i, yy, 3, 2, i % 2 ? PAL.madder : '#f4f0e4');
    px(sx + 10 - i, yy, 3, 2, i % 2 ? '#f4f0e4' : PAL.madder);
  }
  /* tente saçağı (dalgalı) */
  for (var d = 0; d < 7; d++) px(sx - 13 + d * 4, sy - 17 + R(Math.sin(gameT * 1.3 + d) * 0.7), 3, 2, d % 2 ? PAL.madder : '#f4f0e4');
  px(sx - 14, sy - 25, 28, 2, PAL.woodDark);
  px(sx - 14, sy - 25, 2, 25, PAL.woodDark); px(sx + 12, sy - 25, 2, 25, PAL.woodDark);
  /* terazi */
  px(sx + 9, sy - 13, 1, 9, PAL.brass);
  px(sx + 6, sy - 14, 7, 1, PAL.brass);
  px(sx + 6, sy - 13 + R(sw2), 2, 1, PAL.brassLite);
  px(sx + 11, sy - 13 - R(sw2), 2, 1, PAL.brassLite);
  /* fiyat tabelası (tebeşir) */
  if (c.fish) {
    px(sx - 13, sy - 12, 9, 7, '#2e2a26');
    px(sx - 12, sy - 11, 7, 5, '#3a3631');
    px(sx - 11, sy - 10, 5, 1, '#e8ddc8'); px(sx - 11, sy - 8, 3, 1, '#e8ddc8');
  }
  drawStack(c.x, c.y, c.buffer, 12, 3.2);
  labelAt(c.x, c.y - 1.5, 46, (c.fish ? NM(FISH[c.fish].n) : T('stStall')) + ' ' + c.buffer.length + '/' + counterMax(c),
    '#ffd9a8', '' + c.buffer.length);
  if (c.fish && zoneAuto(zoneOfFish(c.fish))) labelAt(c.x, c.y - 1.5, 58, T('autoBadge'), '#ffc94a', 'auto');
  /* para tepsisi: bakır sini */
  var tr = c.tray;
  isoQuad(tr.x - 0.62, tr.y - 0.52, 1.24, 1.04, 0.4, '#8a6a20');
  isoQuad(tr.x - 0.48, tr.y - 0.4, 0.96, 0.8, 0.9, PAL.brass);
  drawStack(tr.x, tr.y, tr.items, 2.4, 3.2);
  if (trayFull(c)) labelAt(tr.x, tr.y + 0.95, 10, T('trayFull'), (Math.sin(gameT * 6) > 0 ? '#ff9b8a' : '#ffd0c8'), '!');
  else if (tr.items.length) labelAt(tr.x, tr.y + 0.95, 10, T('stTake') + ' ' + money(trayValue(c)), '#9df5b0', '$');
}

/* galvaniz çöp kovası: kapak atınca zıplar; elinde mal varken "ÇÖP" etiketi */
function drawBin(bn) {
  var pop = bn.pop * 2;
  shadow(bn.x, bn.y, 0.42);
  isoBox(bn.x - 0.28, bn.y - 0.28, 0.56, 0.56, 0, 9, '#9aa4ab', '#6c767d', '#818b92');
  var sx = R(pX(bn.x, bn.y)), sy = R(pY(bn.x, bn.y, 9));
  px(sx - 5, sy - 1, 10, 1, '#5a646b');                 /* çember */
  px(sx - 5, sy + 4, 10, 1, '#5a646b');
  px(sx - 6, sy - 3 - pop, 12, 2, '#6f7a81');           /* kapak */
  px(sx - 1, sy - 5 - pop, 2, 2, '#4d575e');            /* kulp */
  if (hasCarry(player, isTrash) && dist2(player.x, player.y, bn.x, bn.y) < 9)
    labelAt(bn.x, bn.y, 22, T('stBin'), binT > 0 ? '#ffc94a' : '#e8e2d2', '🗑');
}
function drawSafe() {
  var pop = safe.pop * 2;
  isoBox(safe.x - 0.5, safe.y - 0.5, 1.0, 1.0, 0, 10 + pop, '#3f8f56', '#22603a', '#2d7546');
  var sx = R(pX(safe.x, safe.y)), sy = R(pY(safe.x, safe.y, 10 + pop));
  px(sx - 5, sy - 2, 10, 2, '#25693c');
  uiText(safe.x, safe.y, 10 + pop, '₺', '#e9ffe9', 13, 1, 0, 8);
  labelAt(safe.x, safe.y, 30 + pop, T('stSafe'), '#b7f7c7', '');
}

/* ---------- yapılar ---------- */
/* ---------- v2.0: yapı noktası binaları (Anadolu detayı) ---------- */
function drawBuilding(s) {
  var id = s.b, sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  if (id === 'kulube') {                                  /* personel kulübesi */
    shadow(s.x, s.y, 0.8);
    isoBox(s.x - 0.62, s.y - 0.62, 1.24, 1.24, 0, 13, '#d2a468', '#7a4e2a', '#9a6836');
    wallWood(sx, sy, 22, 12, '#9a6836');
    roofTile(sx, sy - 13, 26, 2);
    px(sx - 3, sy - 11, 7, 11, '#5a4230');
    px(sx - 1, sy - 6, 1, 2, PAL.brass);
    windowTR(sx - 10, sy - 10, 5, 5, false);
    px(sx - 12, sy - 4, 5, 4, PAL.madder);                /* saksı */
    px(sx - 12, sy - 7, 5, 3, PAL.leaf);
  } else if (id === 'cay') {                              /* çay ocağı — semaver */
    shadow(s.x, s.y, 0.6);
    isoBox(s.x - 0.48, s.y - 0.48, 0.96, 0.96, 0, 8, '#a9743f', '#5d3c1c', '#6f4830');
    px(sx - 5, sy - 17, 10, 9, PAL.brass);                /* semaver gövdesi */
    px(sx - 5, sy - 17, 5, 9, PAL.brassLite);
    px(sx - 6, sy - 19, 12, 2, '#9a7320');
    px(sx - 2, sy - 21, 4, 2, PAL.brass);
    px(sx + 5, sy - 14, 2, 3, PAL.brass);                 /* musluk */
    ctx.globalAlpha = 0.32 + Math.sin(gameT * 3) * 0.1;
    px(sx - 1, sy - 26, 2, 5, '#ffffff'); ctx.globalAlpha = 1;
    /* ince belli bardaklar */
    px(sx - 9, sy - 9, 2, 3, '#d8a45a'); px(sx - 6, sy - 9, 2, 3, '#d8a45a');
    px(sx - 9, sy - 10, 2, 1, PAL.cream); px(sx - 6, sy - 10, 2, 1, PAL.cream);
  } else if (id === 'tezgah') {
    px(sx - 9, sy - 16, 18, 3, PAL.wood);
  } else if (id === 'pano') {                             /* reklam panosu */
    px(sx - 2, sy - 13, 2, 13, PAL.woodDark); px(sx + 1, sy - 13, 2, 13, PAL.woodDark);
    px(sx - 13, sy - 28, 27, 16, PAL.edge);
    px(sx - 12, sy - 27, 25, 14, '#e8e0cc');
    px(sx - 12, sy - 27, 25, 4, PAL.madder);
    px(sx - 12, sy - 16, 25, 3, PAL.madder);
    for (var i = 0; i < 6; i++) px(sx - 10 + i * 4, sy - 26, 2, 2, PAL.cream);
    if (dist2(player.x, player.y, s.x, s.y) < 50) uiText(s.x, s.y, 0, lang === 'tr' ? 'TAZE BALIK' : 'FRESH FISH', '#1a4a6b', 7, 1, 0, -19, 'rgba(240,235,220,.9)');
  } else if (id === 'depo') {                             /* depo kulübesi */
    shadow(s.x, s.y, 0.85);
    isoBox(s.x - 0.68, s.y - 0.68, 1.36, 1.36, 0, 12, '#aab2ba', '#5d666e', '#78818a');
    roofZinc(sx, sy - 12, 26, 2);
    px(sx - 6, sy - 10, 12, 10, '#4a5258');
    for (var g = 0; g < 4; g++) px(sx - 6, sy - 8 + g * 3, 12, 1, '#68737a');
    px(sx - 10, sy - 5, 4, 5, '#8a5a2e');
    px(sx - 10, sy - 5, 4, 1, '#a86f3a');
  } else if (id === 'vinc') {                             /* ağ vinci */
    px(sx - 1, sy - 32, 3, 32, PAL.brass);
    px(sx - 13, sy - 34, 26, 3, PAL.brass);
    px(sx + 10, sy - 31, 1, 10, PAL.ironLite);
    px(sx + 8, sy - 21, 5, 4, PAL.wood);
    px(sx - 7, sy - 4, 14, 4, '#3c4650');
    px(sx - 7, sy - 5, 14, 1, '#5a6772');
  } else if (id === 'agsaha') {                           /* ağ tamir sahası */
    px(sx - 14, sy - 18, 2, 18, PAL.woodDark);
    px(sx + 12, sy - 18, 2, 18, PAL.woodDark);
    px(sx - 14, sy - 19, 28, 2, PAL.woodDark);
    ctx.globalAlpha = 0.9;
    for (var r2 = 0; r2 < 6; r2++) px(sx - 13, sy - 16 + r2 * 3 + R(Math.sin(gameT * 1.1 + r2) * 0.6), 26, 1, '#ded1a8');
    for (var c2 = 0; c2 < 9; c2++) px(sx - 13 + c2 * 3, sy - 16, 1, 16, '#ded1a8');
    ctx.globalAlpha = 1;
    px(sx - 8, sy - 6, 3, 3, PAL.madder); px(sx + 4, sy - 9, 3, 3, PAL.cream);
    px(sx - 3, sy - 4, 7, 4, '#b8924f');                  /* mekik sepeti */
    px(sx - 3, sy - 5, 7, 1, '#d6b174');
  } else if (id === 'kantar') {                           /* kantar */
    shadow(s.x, s.y, 0.7);
    px(sx - 9, sy - 4, 19, 4, '#8e8878');
    px(sx - 9, sy - 5, 19, 1, '#aaa494');
    px(sx - 1, sy - 22, 2, 18, PAL.iron);
    px(sx - 9, sy - 24, 19, 2, PAL.iron);
    var tilt = R(Math.sin(gameT * 1.3) * 1);
    px(sx - 9, sy - 23 + tilt, 5, 1, PAL.brass);
    px(sx + 5, sy - 23 - tilt, 5, 1, PAL.brass);
    px(sx - 8, sy - 22 + tilt, 3, 2, PAL.brassLite);
    px(sx + 6, sy - 22 - tilt, 3, 2, PAL.brassLite);
    px(sx - 3, sy - 18, 7, 6, '#2e2a26');                 /* gösterge */
    px(sx - 2, sy - 17, 5, 4, '#cfe6a8');
  } else if (id === 'cekek') {                            /* çekek yeri */
    for (var k = 0; k < 7; k++) px(sx - 20 + k * 4, sy + 1 + k, 20, 2, '#7a5e3a');
    px(sx - 2, sy - 20, 3, 16, PAL.iron);                 /* ırgat */
    px(sx - 6, sy - 22, 11, 3, PAL.iron);
    px(sx - 6, sy - 19, 2, 4, PAL.ironLite);
    /* kızak üstünde sandal */
    px(sx - 11, sy - 11, 22, 5, '#8a5a2e');
    px(sx - 10, sy - 13, 20, 2, '#a8683a');
    px(sx - 9, sy - 14, 18, 1, '#e8d9b8');
    px(sx - 9, sy - 9, 18, 1, PAL.turkuaz);
    px(sx - 1, sy - 22, 2, 9, '#5d3c1c');
  }
}

/* ---------- v2.0: Kooperatif ve Mezat Salonu propları ---------- */
function servPropsExtra(id, sx, sy, lv, hh) {
  var i;
  if (id === 'koop') {
    /* ilan panosu */
    px(sx - 22, sy - 16, 12, 10, '#4a3220');
    px(sx - 21, sy - 15, 10, 8, '#e8e0cc');
    for (i = 0; i < 3; i++) px(sx - 20, sy - 14 + i * 3, 8, 1, '#8b949c');
    px(sx - 22, sy - 6, 2, 6, PAL.woodDark); px(sx - 12, sy - 6, 2, 6, PAL.woodDark);
    if (lv >= 2) {                                        /* çay masası + tabure */
      px(sx + 11, sy - 6, 9, 2, PAL.wood);
      px(sx + 14, sy - 4, 2, 4, PAL.woodDark);
      px(sx + 12, sy - 8, 2, 2, '#d8a45a'); px(sx + 16, sy - 8, 2, 2, '#d8a45a');
      px(sx + 21, sy - 5, 4, 4, '#b8924f');
    }
    if (lv >= 3) {                                        /* bayrak direği */
      px(sx + 24, sy - 30, 1, 28, '#d8d2c4');
      var wv = R(Math.sin(gameT * 2) * 1);
      px(sx + 25, sy - 30, 9, 6, '#e30a17');
      px(sx + 28 + wv, sy - 28, 2, 2, '#ffffff');
    }
    if (lv >= 5) { px(sx - 8, sy - hh - 18, 16, 7, PAL.cypress); px(sx - 6, sy - hh - 16, 12, 3, PAL.cream); }
  } else if (id === 'mezat') {
    /* mezat çanı */
    var ring = phase2(gameT, 3) && day.phase === 'closing';
    px(sx - 16, sy - 26, 1, 8, PAL.woodDark);
    px(sx - 20, sy - 27, 10, 2, PAL.woodDark);
    px(sx - 18 + (ring ? 1 : 0), sy - 25, 5, 5, PAL.brass);
    px(sx - 18 + (ring ? 1 : 0), sy - 25, 5, 1, PAL.brassLite);
    px(sx - 16 + (ring ? 1 : 0), sy - 20, 1, 2, PAL.brass);
    /* kürsü */
    px(sx + 10, sy - 12, 10, 11, PAL.wood);
    px(sx + 10, sy - 13, 10, 1, PAL.woodLite);
    px(sx + 12, sy - 16, 6, 4, '#2e2a26');
    px(sx + 13, sy - 15, 4, 2, '#cfe6a8');
    /* balık sandıkları sırası */
    for (i = 0; i < Math.min(4, lv + 1); i++) {
      var cx2 = sx - 10 + i * 6;
      px(cx2, sy - 6, 5, 5, '#a9743f');
      px(cx2, sy - 6, 5, 1, '#c9975f');
      px(cx2 + 1, sy - 7, 3, 1, '#cfe6f2');
    }
    if (lv >= 3) {                                         /* sıralar */
      px(sx - 24, sy - 4, 12, 2, PAL.wood);
      px(sx - 23, sy - 2, 2, 2, PAL.woodDark); px(sx - 14, sy - 2, 2, 2, PAL.woodDark);
    }
    if (lv >= 5) { px(sx - 9, sy - hh - 18, 18, 8, PAL.brass); px(sx - 7, sy - hh - 16, 14, 4, '#3a2401'); }
  }
}

function drawSlot(s) {
  if (s.b) { drawBuilding(s); return; }
  var near = dist2(player.x, player.y, s.x, s.y) < 40;
  ctx.save(); ctx.globalAlpha = near ? 0.9 : 0.45;
  ctx.setLineDash([3, 3]); ctx.lineDashOffset = -gameT * 6;
  ctx.strokeStyle = '#c9a15e'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(s.x - 0.6, s.y - 0.5)), R(pY(s.x - 0.6, s.y - 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x + 0.6, s.y - 0.5)), R(pY(s.x + 0.6, s.y - 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x + 0.6, s.y + 0.5)), R(pY(s.x + 0.6, s.y + 0.5, 0.4)));
  ctx.lineTo(R(pX(s.x - 0.6, s.y + 0.5)), R(pY(s.x - 0.6, s.y + 0.5, 0.4)));
  ctx.closePath(); ctx.stroke(); ctx.restore();
  if (near) uiText(s.x, s.y, 7, '🔨', '#ffc94a', 13, 0.9);
}

/* ---------- büyük proje aşamaları ---------- */
/* =========================================================
   v0.4 — GÖRSEL EVRİM (§36): her seviyede siluet + malzeme değişir
   Lv1 geçici/ahşap → Lv3 taş/tuğla/metal → Lv5 ticari kompleks
   ========================================================= */
/* =========================================================
   BİNA GÖRSEL EVRİMİ v2 — ANADOLU LİMAN MİMARİSİ
   Lv1 ahşap baraka + çinko çatı      (geçici yapı)
   Lv2 boyalı ahşap + sundurma        (esnaflaşma)
   Lv3 kagir taş/kerpiç + kiremit     (kalıcı yapı)
   Lv4 cumbalı ikinci kat + demir korkuluk
   Lv5 kemerli cephe + çini kuşak + tabela + bayrak
   ========================================================= */
var SERV_MAT = [
  { top: '#c18f56', l: '#6f4526', r: '#8d5f33', roof: 'zinc',  foot: 1.02, h: 17, mat: 'wood'  },
  { top: '#d2a468', l: '#7a4e2a', r: '#9a6836', roof: 'zinc',  foot: 1.14, h: 22, mat: 'paint' },
  { top: '#d9cfb4', l: '#948765', r: '#bdae8c', roof: 'tile',  foot: 1.26, h: 29, mat: 'stone' },
  { top: '#e8dfc8', l: '#a2947a', r: '#cbbc9a', roof: 'tile',  foot: 1.36, h: 37, mat: 'stone' },
  { top: '#f2ead6', l: '#b0a184', r: '#dccba8', roof: 'tile', foot: 1.46, h: 46, mat: 'kagir' }
];
/* kiremit çatı (Anadolu alaturka kiremit) */
function roofTile(sx, sy, w, lv) {
  var n = 6 + lv;
  for (var r = 0; r < n; r++) {
    var ww = w - r * 3.2;
    if (ww < 3) break;
    px(sx - ww / 2, sy - 3 - r * 1.5, ww, 2, r % 2 ? PAL.tile : PAL.tileLite);
  }
  px(sx - w / 2 - 2, sy - 2, w + 4, 3, PAL.tileDark);      /* saçak */
  px(sx - w / 2 - 2, sy - 2, w + 4, 1, PAL.tileLite);
}
/* çinko oluklu sac çatı (geçici yapı) */
function roofZinc(sx, sy, w, lv) {
  var n = 4 + lv;
  for (var r = 0; r < n; r++) {
    var ww = w - r * 3.6;
    if (ww < 3) break;
    px(sx - ww / 2, sy - 2 - r * 1.6, ww, 2, r % 2 ? PAL.zinc : PAL.zincDark);
  }
  px(sx - w / 2 - 2, sy - 1, w + 4, 2, PAL.zincDark);
  for (var g = 0; g < 6; g++) px(sx - w / 2 + g * (w / 6), sy - 1, 1, 2, PAL.ironLite);
}
/* kagir duvar dokusu: taş örgü sıraları */
function wallStone(sx, sy, w, h) {
  for (var r = 0; r * 4 < h; r++)
    for (var c = 0; c * 7 < w; c++)
      px(sx - w / 2 + c * 7 + (r % 2 ? 3 : 0), sy - h + r * 4, 6, 3, r % 2 ? '#c4b598' : '#d2c4a6');
}
/* ahşap kaplama dokusu: dikey tahtalar */
function wallWood(sx, sy, w, h, col) {
  for (var c = 0; c * 4 < w; c++) px(sx - w / 2 + c * 4, sy - h, 1, h, shade(col, -16));
}
/* çini kuşak (Kütahya mavisi baklava) */
function tileBand(sx, sy, w) {
  px(sx - w / 2, sy, w, 4, PAL.nazarW);
  for (var i = 0; i * 6 < w; i++) {
    var bx = sx - w / 2 + i * 6;
    px(bx + 2, sy + 1, 1, 1, PAL.nazar); px(bx + 1, sy + 2, 3, 1, PAL.nazar); px(bx + 2, sy + 3, 1, 1, PAL.nazar);
  }
  px(sx - w / 2, sy, w, 1, PAL.turkuaz);
  px(sx - w / 2, sy + 3, w, 1, PAL.turkuaz);
}
/* ahşap kepenkli pencere */
function windowTR(x, y, w, h, lit) {
  px(x, y, w, h, '#25384a');
  px(x, y, w, 1, '#4a6b84');
  if (lit) { px(x + 1, y + 1, w - 2, h - 2, '#ffd98f'); px(x + 1, y + 1, w - 2, 1, '#fff0c4'); }
  px(x - 1, y, 1, h, '#7a4e2a');                     /* kepenk */
  px(x + w, y, 1, h, '#7a4e2a');
  px(x, y + Math.floor(h / 2), w, 1, '#4a6b84');     /* kayıt */
}
/* kemerli kapı (Lv5) */
function archDoor(sx, sy, w, h) {
  px(sx - w / 2, sy - h, w, h, '#3a2a1c');
  px(sx - w / 2 + 1, sy - h + 2, w - 2, h - 2, '#5a4230');
  px(sx - w / 2, sy - h - 1, w, 1, PAL.stoneDark);
  px(sx - w / 2 + 1, sy - h - 2, w - 2, 1, PAL.stoneDark);
  px(sx - 1, sy - h - 3, 3, 1, PAL.stoneDark);
  px(sx - 1, sy - Math.floor(h / 2), 1, 2, PAL.brass);
}

function drawServ(p) {
  var id = p.b, d = sdef(id), st = servState[id];
  if (!d || !st) return;
  var lv = st.lvl, M2 = SERV_MAT[lv - 1];
  var fw = M2.foot, hh = M2.h;
  var sx = R(pX(p.x, p.y)), sy = R(pY(p.x, p.y, 0));
  var bw = R(fw * 22);

  /* --- inşaat / yükseltme sekansı --- */
  if (st.cons > 0 && !st.fresh) {
    if (Math.random() < 0.3) addPuff(p.x + rnd(-0.5, 0.5), p.y + rnd(-0.5, 0.5), '#d8cfae');
  }
  if (st.cons > 0 && st.fresh) {
    var ph = st.cons;
    ctx.save(); ctx.setLineDash([2, 2]); ctx.strokeStyle = PAL.gold; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(p.x - fw, p.y - fw)), R(pY(p.x - fw, p.y - fw, 0)));
    ctx.lineTo(R(pX(p.x + fw, p.y - fw)), R(pY(p.x + fw, p.y - fw, 0)));
    ctx.lineTo(R(pX(p.x + fw, p.y + fw)), R(pY(p.x + fw, p.y + fw, 0)));
    ctx.lineTo(R(pX(p.x - fw, p.y + fw)), R(pY(p.x - fw, p.y + fw, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    if (ph < 1.6) {
      for (var c2 = 0; c2 < 4; c2++) {
        var ox = c2 % 2 ? fw : -fw, oy = c2 < 2 ? -fw : fw;
        var bx2 = R(pX(p.x + ox * 0.8, p.y + oy * 0.8)), by2 = R(pY(p.x + ox * 0.8, p.y + oy * 0.8, 0));
        px(bx2 - 1, by2 - hh * 0.7, 2, hh * 0.7, PAL.wood);
      }
      px(sx - 12, sy - R(hh * 0.7), 24, 2, PAL.wood);
      px(sx - 13, sy - R(hh * 0.5), 26, 1, PAL.wood);
    }
    if (ph > 0.5 && Math.random() < 0.25) addPuff(p.x + rnd(-0.6, 0.6), p.y + rnd(-0.6, 0.6), '#d8cfae');
    uiText(p.x, p.y, hh + 12, '⚒', PAL.gold, 13, 0.9);
    return;
  }

  shadow(p.x, p.y, fw * 1.15);
  /* taş sekilik (kaide) */
  isoQuad(p.x - fw * 0.66, p.y - fw * 0.66, fw * 1.32, fw * 1.32, 0.35, '#a8a08c');
  isoQuad(p.x - fw * 0.6, p.y - fw * 0.6, fw * 1.2, fw * 1.2, 1.7, '#c0b8a2');

  /* --- gövde --- */
  isoBox(p.x - fw / 2, p.y - fw / 2, fw, fw, 1.7, hh, M2.top, M2.l, M2.r);
  if (M2.mat === 'stone' || M2.mat === 'kagir') wallStone(sx, sy, bw, hh - 2);
  else wallWood(sx, sy, bw, hh - 2, M2.r);

  /* Lv4+ cumbalı ikinci kat (öne taşan) */
  if (lv >= 4) {
    isoBox(p.x - fw * 0.36, p.y - fw * 0.62, fw * 0.72, fw * 0.54, hh, hh + 11, shade(M2.top, 8), shade(M2.l, 6), shade(M2.r, 6));
    var cy2 = sy - hh - 6;
    px(sx - 9, cy2, 18, 1, PAL.woodDark);                 /* cumba altı çıtası */
    windowTR(sx - 6, cy2 - 6, 5, 5, phase2(gameT, 0.4));
    windowTR(sx + 2, cy2 - 6, 5, 5, false);
    /* demir korkuluk */
    px(sx - 10, cy2 + 1, 20, 1, PAL.iron);
    for (var b3 = 0; b3 < 7; b3++) px(sx - 9 + b3 * 3, cy2 + 1, 1, 3, PAL.iron);
    px(sx - 10, cy2 + 4, 20, 1, PAL.iron);
  }

  /* --- çatı --- */
  var ry = sy - hh - (lv >= 4 ? 11 : 0);
  if (M2.roof === 'tile') roofTile(sx, ry, bw + 4, lv); else roofZinc(sx, ry, bw + 2, lv);
  /* kimlik şeridi: binanın rengi saçakta */
  px(sx - bw / 2 - 2, ry - 1, bw + 4, 2, d.acc);

  /* --- cephe --- */
  if (lv >= 5) {
    archDoor(sx, sy - 1, 10, 14);
    tileBand(sx, sy - hh + 5, bw - 4);
    windowTR(sx - 10, sy - hh + 12, 6, 6, true);
    windowTR(sx + 4, sy - hh + 12, 6, 6, true);
  } else if (lv >= 3) {
    px(sx - 5, sy - 13, 10, 13, '#4a3423');
    px(sx - 4, sy - 12, 8, 11, '#63482f');
    px(sx - 1, sy - 7, 1, 2, PAL.brass);
    windowTR(sx - 12, sy - R(hh * 0.66), 6, 6, lv >= 4);
    windowTR(sx + 6, sy - R(hh * 0.66), 6, 6, false);
  } else {
    px(sx - 4, sy - 11, 8, 11, '#5a4230');
    px(sx - 4, sy - 11, 8, 1, '#7a5a3e');
    if (lv >= 2) { windowTR(sx - 11, sy - R(hh * 0.62), 5, 5, false); windowTR(sx + 6, sy - R(hh * 0.62), 5, 5, false); }
  }
  /* Lv2+ sundurma (ahşap direkli) */
  if (lv >= 2) {
    px(sx - R(fw * 11) - 3, sy - 13, R(fw * 22) + 6, 3, d.acc);
    px(sx - R(fw * 11) - 3, sy - 13, R(fw * 22) + 6, 1, shade(d.acc, 22));
    px(sx - R(fw * 11) - 3, sy - 10, 2, 10, PAL.woodDark);
    px(sx + R(fw * 11) + 2, sy - 10, 2, 10, PAL.woodDark);
  }

  servProps(id, sx, sy, lv, fw, hh);
  servPropsExtra(id, sx, sy, lv, hh);
  /* Lv5 bayrak direği */
  if (lv >= 5) {
    var fx2 = sx + bw / 2 - 2, fy2 = ry - 14;
    px(fx2, fy2, 1, 16, '#d8d2c4');
    var wv = R(Math.sin(gameT * 2) * 1);
    px(fx2 + 1, fy2, 10, 6, '#e30a17');
    px(fx2 + 4 + wv, fy2 + 2, 2, 2, '#ffffff');
    px(fx2 + 6 + wv, fy2 + 1, 1, 1, '#ffffff'); px(fx2 + 6 + wv, fy2 + 4, 1, 1, '#ffffff');
  }
  servSign(d, p.x, p.y + 0.52, 0, lv);
  servIdle(d, sx, sy, lv);

  if (st.flash > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(0.5, st.flash * 0.35);
    isoQuad(p.x - fw / 2, p.y - fw / 2, fw, fw, hh + 2, '#ffe27a'); ctx.restore();
  }
  if (servSel === id || (barTab === 'serv' && servPick === id)) {
    uiLabel(p.x, p.y, hh + 26, NM(d.n) + ' Lv.' + lv, PAL.gold, 1);
  } else if (dist2(player.x, player.y, p.x, p.y) < 12) {
    uiLabel(p.x, p.y, hh + 26, NM(d.n).slice(0, 10) + ' ' + lv, '#e8ddc8', 0.85);
  }
}

/* binaya özgü proplar — her seviyede zenginleşir */
function servProps(id, sx, sy, lv, fw, hh) {
  var i;
  if (id === 'buzhane') {
    for (i = 0; i < Math.min(4, lv + 1); i++) {         /* buz kalıpları */
      px(sx - 17 + i * 5, sy - 6, 4, 5, '#bfe0ef');
      px(sx - 17 + i * 5, sy - 6, 4, 1, '#e6f4fb');
      px(sx - 17 + i * 5, sy - 2, 4, 1, '#8ec2d8');
    }
    if (lv >= 3) { px(sx + 10, sy - 19, 6, 7, PAL.iron); px(sx + 11, sy - 18, 4, 5, PAL.ironLite);
      px(sx + 12, sy - 17 + (phase2(gameT, 6) ? 1 : 0), 2, 1, '#cfe6f2'); }
    if (lv >= 4) { px(sx + 13, sy - 7, 7, 6, PAL.zinc); px(sx + 13, sy - 8, 7, 1, '#c9d0d6');
      px(sx + 14, sy - 1, 2, 2, PAL.iron); px(sx + 18, sy - 1, 1, 2, PAL.iron); }
  } else if (id === 'tamirhane') {
    px(sx - 20, sy - 8, 11, 3, PAL.wood);                /* çalışma tezgâhı */
    px(sx - 19, sy - 11, 3, 3, '#c98a3c');
    px(sx - 15, sy - 10, 1, 2, PAL.ironLite); px(sx - 13, sy - 11, 1, 3, PAL.ironLite);
    if (lv >= 2) {                                        /* el vinci */
      px(sx - 16, sy - 28, 2, 18, PAL.brass);
      px(sx - 22, sy - 29, 13, 2, PAL.brass);
      px(sx - 15, sy - 27, 1, 9, PAL.ironLite);
      px(sx - 17, sy - 18, 5, 3, PAL.wood);
    }
    if (lv >= 4) { px(sx + 14, sy - 15, 6, 15, PAL.iron);  /* yedek parça rafı */
      for (i = 0; i < 3; i++) px(sx + 14, sy - 13 + i * 4, 6, 1, PAL.ironLite); }
    if (lv >= 5) { px(sx + 8, sy - 6, 12, 5, '#3b4a55'); px(sx + 9, sy - 7, 10, 1, '#5a6f7d'); }
  } else if (id === 'hal') {
    for (i = 0; i < Math.min(3, lv); i++) {               /* hal tezgâhları */
      var tx = sx - 22 + i * 15;
      px(tx, sy - 9, 13, 3, PAL.wood);
      px(tx + 1, sy - 6, 2, 6, PAL.woodDark); px(tx + 10, sy - 6, 2, 6, PAL.woodDark);
      for (var q = 0; q < 4; q++) px(tx + q * 3, sy - 13, 3, 4, q % 2 ? PAL.madder : '#f2ede0');
      px(tx + 3, sy - 11, 4, 2, '#cfe6f2');              /* buz */
      px(tx + 4, sy - 10, 2, 1, '#8fa9bd');              /* balık */
    }
    if (lv >= 3) { px(sx + 12, sy - 22, 9, 16, '#9d8f74'); px(sx + 13, sy - 12, 7, 10, '#4a5258');
      for (i = 0; i < 4; i++) px(sx + 13, sy - 11 + i * 3, 7, 1, '#68737a'); }
    if (lv >= 5) { px(sx - 26, sy - 5, 8, 5, PAL.wood); px(sx - 25, sy - 6, 6, 1, PAL.saffron); }
  } else if (id === 'restoran') {
    for (i = 0; i < Math.min(3, lv); i++) {               /* masa + hasır sandalye */
      var mx = sx - 24 + i * 13, my = sy - 1 + (i % 2) * 4;
      px(mx, my - 6, 10, 2, '#e8ddc8');
      px(mx + 4, my - 4, 2, 5, PAL.wood);
      px(mx - 2, my - 5, 2, 4, '#b8924f'); px(mx + 10, my - 5, 2, 4, '#b8924f');
      px(mx + 3, my - 8, 3, 2, PAL.madder);              /* çay bardağı / tabak */
    }
    if (lv >= 3) {                                        /* teras korkuluğu + ampuller */
      px(sx - 26, sy - 17, 52, 2, PAL.madder);
      for (i = 0; i < 8; i++) px(sx - 25 + i * 7, sy - 15, 2, 2, (i + Math.floor(gameT * 2)) % 3 ? '#ffd98f' : '#f0ece0');
    }
    if (lv >= 5) { px(sx - 7, sy - hh - 22, 14, 9, PAL.madder); px(sx - 5, sy - hh - 20, 10, 5, PAL.saffron); }
  } else if (id === 'nakliye') {
    px(sx - 23, sy - 13, 15, 11, '#3e6b8a');              /* konteyner */
    px(sx - 23, sy - 13, 15, 2, '#5a8cae');
    for (i = 0; i < 4; i++) px(sx - 21 + i * 4, sy - 11, 1, 8, '#2b4a60');
    if (lv >= 2) { px(sx + 11, sy - 13, 13, 11, '#7a6a4a'); px(sx + 11, sy - 13, 13, 2, '#9a8a66'); }
    if (lv >= 4) { px(sx - 28, sy - 3, 20, 3, PAL.iron); px(sx - 28, sy, 20, 2, '#3c4650');
      px(sx - 26, sy - 6, 4, 3, PAL.zinc); }
    px(sx - 10, sy - R(hh * 0.85), 20, 8, PAL.pnl);       /* pano */
    px(sx - 8, sy - R(hh * 0.85) + 2, 16, 4, '#9aa8b4');
  } else if (id === 'yakit') {
    for (i = 0; i < Math.min(4, lv + 1); i++) {           /* variller */
      px(sx - 21 + i * 6, sy - 10, 5, 9, i % 2 ? '#c94a1a' : '#d8a52c');
      px(sx - 21 + i * 6, sy - 10, 5, 1, '#f0ece0');
      px(sx - 21 + i * 6, sy - 6, 5, 1, shade(i % 2 ? '#c94a1a' : '#d8a52c', -24));
    }
    px(sx + 11, sy - 15, 6, 14, '#d1584a');               /* pompa */
    px(sx + 12, sy - 13, 4, 5, '#f0ece0');
    px(sx + 13, sy - 12 + (phase2(gameT, 2) ? 0 : 1), 2, 1, '#2e2119');
    px(sx + 17, sy - 9, 3, 1, '#3c4650');
    if (lv >= 3) { px(sx + 19, sy - 26, 13, 24, '#c2c8ce'); px(sx + 19, sy - 26, 13, 3, '#e2e8ee');
      px(sx + 21, sy - 15, 9, 2, '#8b949c'); px(sx + 21, sy - 22, 4, 2, PAL.madder); }
    if (lv >= 5) { px(sx - 33, sy - 30, 12, 28, '#c2c8ce'); px(sx - 33, sy - 30, 12, 3, '#e2e8ee');
      px(sx - 31, sy - 20, 8, 2, '#8b949c'); }
  } else if (id === 'tersane') {
    for (i = 0; i < 6; i++) px(sx - 26 + i * 4, sy + 1 + i, 24, 2, '#7a5e3a');   /* kızak */
    px(sx - 28, sy - 9, 7, 10, PAL.wood);                 /* kereste yığını */
    px(sx - 28, sy - 9, 7, 1, PAL.woodLite);
    px(sx - 28, sy - 6, 7, 1, PAL.woodDark);
    if (lv >= 2) {                                         /* vinç */
      px(sx + 15, sy - 32, 2, 31, PAL.brass);
      px(sx + 6, sy - 34, 20, 2, PAL.brass);
      px(sx + 22, sy - 32, 1, 9, PAL.ironLite);
      px(sx + 20, sy - 23, 5, 3, PAL.wood);
    }
    if (lv >= 3) {                                         /* tekne iskeleti */
      px(sx - 22, sy - 14, 18, 10, '#a9743f');
      px(sx - 22, sy - 14, 18, 1, '#c9975f');
      for (i = 0; i < 5; i++) px(sx - 20 + i * 4, sy - 13, 1, 8, '#7a5230');
      px(sx - 14, sy - 22, 1, 9, '#8d5f33');
    }
    if (lv >= 4) { px(sx - 36, sy - 28, 2, 27, PAL.brass); px(sx - 42, sy - 30, 15, 2, PAL.brass); }
    if (lv >= 5) { px(sx + 2, sy - hh - 20, 18, 8, PAL.indigo); px(sx + 4, sy - hh - 18, 14, 4, '#7fb7d4'); }
  }
}

function shade(c, n) {
  var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
  function q(v) { return Math.max(0, Math.min(255, v + n)).toString(16).padStart(2, '0'); }
  return '#' + q(r) + q(g) + q(b);
}
function servSign(d, x, y, z, lv) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, z));
  var w = 10 + lv * 3;
  px(sx - w / 2, sy - 6, w, 5, '#123449');
  px(sx - w / 2 + 1, sy - 5, w - 2, 3, d.acc);
  if (lv >= 3) { px(sx - w / 2, sy - 1, 1, 4, '#3c4650'); px(sx + w / 2 - 1, sy - 1, 1, 4, '#3c4650'); }
}
function servIdle(d, sx, sy, lv) {
  if (lv < 2) return;
  var t = gameT;
  if (d.id === 'buzhane') {
    if (lv >= 3) { var f = Math.floor(t * 6) % 2; px(sx + 9, sy - 16, 4, 4, '#5d666e'); px(sx + 10, sy - 15 + f, 2, 1, '#cfe6f2'); }
  } else if (d.id === 'tamirhane') {
    var sp = Math.sin(t * 7) * 2;
    px(sx - 12, sy - 12 + sp, 2, 2, '#ffd76a');
  } else if (d.id === 'restoran') {
    for (var i = 0; i < 3; i++) {
      var yy = sy - 22 - lv * 3 - ((t * 9 + i * 7) % 14);
      ctx.globalAlpha = 0.35; px(sx + 7 + Math.sin(t * 2 + i) * 1.5, yy, 2, 2, '#e8ddc8'); ctx.globalAlpha = 1;
    }
  } else if (d.id === 'yakit' && lv >= 2) {
    if (Math.floor(t * 2) % 2) px(sx + 11, sy - 18, 2, 2, '#d1584a');
  } else if (d.id === 'tersane' && lv >= 3) {
    var hk = Math.sin(t * 1.4) * 5;
    px(sx + 12, sy - 34 + hk, 1, 6, '#8a8f95');
  } else if (d.id === 'hal' && lv >= 4) {
    if (Math.floor(t * 1.5) % 2) px(sx - 14, sy - 26, 2, 2, '#ffd76a');
  } else if (d.id === 'nakliye' && lv >= 3) {
    var bl = Math.floor(t * 2.5) % 2;
    px(sx + 10, sy - 22, 2, 2, bl ? '#5fd37a' : '#2a6a3c');
  }
}

/* boş parsel: yalnız Binalar sekmesinde bina seçiliyken ince çerçeve (§37) */
function drawPlot(p) {
  var ghost = barTab === 'serv' && servPick && p.allow.indexOf(servPick) >= 0 && !p.b;
  var near = dist2(player.x, player.y, p.x, p.y) < 26;
  if (!ghost && !near) return;
  ctx.save();
  ctx.globalAlpha = ghost ? 0.95 : 0.3;
  ctx.setLineDash([3, 3]); ctx.lineDashOffset = -gameT * 8;
  ctx.strokeStyle = ghost ? '#5fd37a' : '#c9a15e'; ctx.lineWidth = 1;
  var w = 0.7;
  ctx.beginPath();
  ctx.moveTo(R(pX(p.x - w, p.y - w)), R(pY(p.x - w, p.y - w, 0)));
  ctx.lineTo(R(pX(p.x + w, p.y - w)), R(pY(p.x + w, p.y - w, 0)));
  ctx.lineTo(R(pX(p.x + w, p.y + w)), R(pY(p.x + w, p.y + w, 0)));
  ctx.lineTo(R(pX(p.x - w, p.y + w)), R(pY(p.x - w, p.y + w, 0)));
  ctx.closePath(); ctx.stroke(); ctx.restore();
  if (ghost) {
    ctx.save(); ctx.globalAlpha = 0.16 + Math.sin(gameT * 4) * 0.06;
    isoQuad(p.x - w, p.y - w, w * 2, w * 2, 0.4, '#5fd37a'); ctx.restore();
    uiLabel(p.x, p.y, 10, NM(p.n), '#9df5b0', 1);
  } else if (near) {
    uiText(p.x, p.y, 6, '🏗️', '#c9a15e', 11, 0.7);
  }
}

/* ---------- v1.2: gün ışığı tonu (§2 çok hafif) ---------- */
/* köşeleri hafif koyultan yumuşak vinyet */
var _vig = null, _vigW = 0, _vigH = 0;
function drawVignette() {
  if (!_vig || _vigW !== W || _vigH !== H) {
    _vigW = W; _vigH = H;
    try {
      var g = ctx.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.52,
                                       W / 2, H * 0.48, Math.max(W, H) * 0.78);
      g.addColorStop(0, 'rgba(8,24,36,0)');
      g.addColorStop(1, 'rgba(8,24,36,0.24)');
      _vig = g;
    } catch (e) { _vig = null; }
  }
  if (!_vig) return;
  ctx.save(); ctx.fillStyle = _vig; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function dayTint() {
  var p = clamp(day.t / DAY_LEN, 0, 1), a = 0, col = '#ffb27a';
  if (day.phase === 'closing' || day.phase === 'summary') { a = 0.30; col = '#2b3f63'; }
  else if (p < 0.12) { a = 0.20 * (1 - p / 0.12); col = '#ffb27a'; }
  else if (p > 0.70) { a = 0.28 * ((p - 0.70) / 0.30); col = '#6a4a7a'; }
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH); ctx.restore();
}

/* ---------- v2.0: TİCARET OFİSİ — cumbalı konak ---------- */
function drawOffice() {
  var o = office, x = o.x - o.w / 2, y = o.y - o.h / 2;
  var sx = R(pX(o.x, o.y)), sy = R(pY(o.x, o.y, 0));
  if (!officeBuilt()) {
    ctx.save(); ctx.setLineDash([3, 3]); ctx.lineDashOffset = -gameT * 6;
    ctx.strokeStyle = '#c9a15e'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(x, y)), R(pY(x, y, 0))); ctx.lineTo(R(pX(x + o.w, y)), R(pY(x + o.w, y, 0)));
    ctx.lineTo(R(pX(x + o.w, y + o.h)), R(pY(x + o.w, y + o.h, 0))); ctx.lineTo(R(pX(x, y + o.h)), R(pY(x, y + o.h, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    if (dist2(player.x, player.y, o.x, o.y) < 18) uiLabel(o.x, o.y, 14, T('office'), '#ffc94a', 0.85);
    return;
  }
  shadow(o.x, o.y, 1.3);
  isoQuad(x - 0.1, y - 0.1, o.w + 0.2, o.h + 0.2, 0.4, '#a8a08c');
  isoBox(x + 0.06, y + 0.06, o.w - 0.12, o.h - 0.12, 1.6, 28, '#efe6d0', '#b9ac90', '#d5c8ac');
  wallStone(sx, sy, 40, 26);
  /* cumba (çıkma kat) */
  isoBox(x + 0.3, y - 0.18, o.w - 0.6, o.h * 0.5, 28, 40, '#f3ebd8', '#bfb296', '#dccfb2');
  var cy = sy - 34;
  px(sx - 13, cy + 6, 26, 1, PAL.woodDark);
  windowTR(sx - 9, cy, 7, 7, true);
  windowTR(sx + 2, cy, 7, 7, true);
  px(sx - 14, cy + 7, 28, 1, PAL.iron);
  for (var b = 0; b < 9; b++) px(sx - 13 + b * 3, cy + 7, 1, 3, PAL.iron);
  px(sx - 14, cy + 10, 28, 1, PAL.iron);
  /* çatı */
  roofTile(sx, sy - 40, 46, 4);
  /* kemerli giriş */
  archDoor(sx, sy - 1, 11, 15);
  tileBand(sx, sy - 22, 34);
  /* tabela */
  px(sx - 17, sy - 14, 34, 8, PAL.pnl);
  px(sx - 16, sy - 13, 32, 6, PAL.indigo);
  if (dist2(player.x, player.y, o.x, o.y) < 60) uiText(o.x, o.y, 18, T('office'), PAL.gold, 7);
  /* bayrak */
  px(sx + 18, sy - 52, 1, 14, '#d8d2c4');
  var wv = R(Math.sin(gameT * 2) * 1);
  px(sx + 19, sy - 52, 9, 6, '#e30a17');
  px(sx + 22 + wv, sy - 50, 2, 2, '#ffffff');
  if (M && M.active.length) uiBadge(o.x, o.y + o.h / 2 + 0.2, 10, M.active.length + '/' + maxActive(), '#9df5b0');
}

/* ---------- v2.0: KAPALI BALIK HALİ — kagir hal binası ---------- */
function drawProject() {
  var p = project, st = p.stage;
  var x = p.x - p.w / 2, y = p.y - p.h / 2;
  var cx = R(pX(p.x, p.y)), cy = R(pY(p.x, p.y, 0));
  if (st === 0) {
    ctx.save(); ctx.setLineDash([3, 3]);
    ctx.strokeStyle = PAL.gold; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(x, y)), R(pY(x, y, 0))); ctx.lineTo(R(pX(x + p.w, y)), R(pY(x + p.w, y, 0)));
    ctx.lineTo(R(pX(x + p.w, y + p.h)), R(pY(x + p.w, y + p.h, 0))); ctx.lineTo(R(pX(x, y + p.h)), R(pY(x, y + p.h, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    px(cx - 11, cy - 16, 22, 10, '#4a3220');            /* proje tabelası */
    px(cx - 10, cy - 15, 20, 8, PAL.saffron);
    px(cx - 8, cy - 13, 16, 1, '#3a2401'); px(cx - 8, cy - 11, 11, 1, '#3a2401');
    px(cx - 1, cy - 6, 2, 6, PAL.woodDark);
    if (dist2(player.x, player.y, p.x, p.y) < 20) labelAt(p.x, p.y + p.h / 2 + 0.3, 20, T('stProject'), PAL.gold, '');
    return;
  }
  isoQuad(x, y, p.w, p.h, 0.6, '#9a927f');
  if (st >= 1) {                                         /* kazık temel */
    for (var i = 0; i <= 2; i++) for (var j = 0; j <= 2; j++) {
      var bx = R(pX(x + i * p.w / 2, y + j * p.h / 2)), by = R(pY(x + i * p.w / 2, y + j * p.h / 2, 0));
      px(bx - 1, by - 6, 3, 6, '#6b5334');
      px(bx - 2, by - 7, 5, 1, '#8a6c46');
    }
  }
  if (st >= 2) {                                         /* taşıyıcı kolonlar */
    var cols = [[x + 0.2, y + 0.2], [x + p.w - 0.2, y + 0.2], [x + 0.2, y + p.h - 0.2], [x + p.w - 0.2, y + p.h - 0.2]];
    for (var c = 0; c < cols.length; c++) {
      var sx2 = R(pX(cols[c][0], cols[c][1])), sy2 = R(pY(cols[c][0], cols[c][1], 0));
      px(sx2 - 2, sy2 - 28, 4, 28, '#c9c3b2');
      px(sx2 - 2, sy2 - 28, 2, 28, '#ddd8c8');
    }
    isoQuad(x + 0.1, y + 0.1, p.w - 0.2, p.h - 0.2, 28, 'rgba(200,195,180,.35)');
  }
  if (st >= 3) {                                         /* kagir duvar + kiremit çatı */
    isoBox(x + 0.15, y + 0.15, p.w - 0.3, p.h - 0.3, 0, 26, '#e6dcc4', '#bfae8c', '#d2c1a0');
    wallStone(cx, cy, 54, 24);
    roofTile(cx, R(pY(p.x, p.y, 26)), 58, 4);
    /* kemerli hal kapıları */
    archDoor(cx - 14, cy - 1, 10, 14);
    archDoor(cx + 14, cy - 1, 10, 14);
  }
  if (st >= 4) {                                         /* donatım: tabela + ışık + çini */
    tileBand(cx, cy - 20, 44);
    var lx = R(pX(p.x, p.y + p.h / 2)), ly = R(pY(p.x, p.y + p.h / 2, 28));
    px(lx - 22, ly - 11, 44, 10, PAL.pnl);
    px(lx - 21, ly - 10, 42, 8, PAL.indigo);
    if (dist2(player.x, player.y, p.x, p.y) < 70) uiText(p.x, p.y + p.h / 2, 32, lang === 'tr' ? 'BALIK HALİ' : 'FISH HALL', PAL.gold, 8);
    px(lx - 23, ly + 1, 2, 9, PAL.iron); px(lx + 21, ly + 1, 2, 9, PAL.iron);
    for (var l = 0; l < 6; l++) px(lx - 18 + l * 7, ly - 13, 2, 2, (l + Math.floor(gameT * 2)) % 3 ? '#ffd98f' : '#f0ece0');
  }
  if (st >= 5) {                                         /* açılış: bayraklar + kalabalık */
    for (var f = 0; f < 3; f++) {
      var fx2 = R(pX(p.x - 0.8 + f * 0.8, p.y - p.h / 2)), fy2 = R(pY(p.x - 0.8 + f * 0.8, p.y - p.h / 2, 34));
      px(fx2, fy2 - 10, 1, 10, '#6b5334');
      px(fx2 + 1, fy2 - 10, 6, 4, f % 2 ? '#e30a17' : PAL.saffron);
      if (f % 2) px(fx2 + 3, fy2 - 9, 2, 2, '#ffffff');
    }
  } else {
    var kx = R(pX(x + p.w, y)), ky = R(pY(x + p.w, y, 0));
    px(kx - 1, ky - 36, 3, 36, PAL.brass);
    px(kx - 11, ky - 38, 22, 3, PAL.brass);
    px(kx + 7, ky - 35, 1, 9, PAL.ironLite);
    px(kx + 5, ky - 26, 5, 4, PAL.wood);
    var pr = projPct();
    px(cx - 15, cy - 46, 30, 5, PAL.edge);
    px(cx - 14, cy - 45, R(28 * pr), 3, PAL.green);
    uiText(p.x, p.y, 50, pct(Math.round(pr * 100)), PAL.gold, 11);
  }
  labelAt(p.x, p.y + p.h / 2 + 0.3, st >= 3 ? 46 : 20, UP(NM(p.n)), PAL.gold, '');
}

/* ---------- kozmetik ---------- */
function drawDecor(d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0));
  if (d.id === 'bayrak') {
    px(sx - 1, sy - 34, 2, 34, '#d8d2c4');
    var wv = Math.sin(gameT * 2) * 1;
    px(sx + 1, sy - 34, 14, 9, '#e30a17');
    px(sx + 5 + wv, sy - 31, 3, 3, '#ffffff');
    px(sx + 8 + wv, sy - 32, 2, 1, '#ffffff'); px(sx + 8 + wv, sy - 28, 2, 1, '#ffffff');
    px(sx + 6 + wv, sy - 30, 3, 1, '#e30a17');
  } else if (d.id === 'tekne') {
    drawBoat({ x: d.x, y: d.y - 1.6, r: 1 });
  } else if (d.id === 'bank') {
    px(sx - 8, sy - 6, 16, 2, '#a9743f'); px(sx - 8, sy - 10, 16, 2, '#a9743f');
    px(sx - 7, sy - 6, 2, 6, '#6f4526'); px(sx + 5, sy - 6, 2, 6, '#6f4526');
  } else if (d.id === 'simit') {
    px(sx - 9, sy - 12, 18, 8, '#c9a15e'); px(sx - 9, sy - 14, 18, 2, '#e30a17');
    px(sx - 7, sy - 4, 2, 4, '#5d3c1c'); px(sx + 5, sy - 4, 2, 4, '#5d3c1c');
    for (var i = 0; i < 3; i++) { px(sx - 6 + i * 5, sy - 11, 4, 4, '#c8802f'); px(sx - 5 + i * 5, sy - 10, 2, 2, '#c9a15e'); }
  } else if (d.id === 'lamba') { drawLamp(d.x, d.y); }
  else if (d.id === 'cicek') {
    px(sx - 5, sy - 6, 10, 6, '#b8642e'); px(sx - 5, sy - 7, 10, 2, '#d1793d');
    for (var f = 0; f < 6; f++) px(sx - 6 + (f * 3) % 12, sy - 14 + (f % 3) * 3, 3, 3, f % 2 ? '#d94a8c' : '#e0679e');
    px(sx - 2, sy - 10, 2, 5, '#4a7a3a');
  } else if (d.id === 'caymasa') {
    px(sx - 7, sy - 8, 14, 2, '#c9a15e'); px(sx - 6, sy - 6, 2, 6, '#8d5f33'); px(sx + 4, sy - 6, 2, 6, '#8d5f33');
    px(sx - 4, sy - 12, 3, 4, '#e8c9a0'); px(sx + 2, sy - 11, 3, 3, '#e8c9a0');
    px(sx - 3, sy - 11, 1, 2, '#c94a1a'); px(sx + 3, sy - 10, 1, 1, '#c94a1a');
  } else if (d.id === 'nazar') {                       /* nazar boncuğu — direğe asılı */
    px(sx - 1, sy - 22, 2, 22, PAL.woodDark);
    var sw = R(Math.sin(gameT * 1.6) * 1);
    px(sx - 4 + sw, sy - 26, 8, 8, PAL.nazar);
    px(sx - 3 + sw, sy - 25, 6, 6, PAL.nazarW);
    px(sx - 2 + sw, sy - 24, 4, 4, PAL.turkuaz);
    px(sx - 1 + sw, sy - 23, 2, 2, PAL.edge);
    px(sx - 1 + sw, sy - 27, 2, 1, PAL.rope);
  } else if (d.id === 'cesme') {                       /* Osmanlı çeşmesi */
    px(sx - 9, sy - 22, 18, 22, PAL.stone);
    px(sx - 9, sy - 22, 9, 22, PAL.stoneLite);
    px(sx - 11, sy - 24, 22, 3, PAL.stoneDark);
    px(sx - 7, sy - 20, 14, 2, PAL.turkuaz);           /* kitabe */
    px(sx - 5, sy - 17, 10, 8, '#7d6f55');             /* kemer nişi */
    px(sx - 4, sy - 16, 8, 6, '#5f5443');
    px(sx - 1, sy - 12, 2, 2, PAL.brass);              /* lüle */
    var wf = phase2(gameT, 6);
    px(sx - 1, sy - 10 + (wf ? 0 : 1), 1, 4, '#9fd4e6');
    px(sx - 6, sy - 5, 12, 4, '#8fb9c9');              /* yalak */
    px(sx - 6, sy - 5, 12, 1, '#b8dce8');
  } else if (d.id === 'kilim') {                       /* kilim sergisi */
    px(sx - 12, sy - 20, 2, 20, PAL.woodDark);
    px(sx + 10, sy - 20, 2, 20, PAL.woodDark);
    px(sx - 12, sy - 21, 24, 2, PAL.woodDark);
    var kw = R(Math.sin(gameT * 1.1) * 0.6);
    px(sx - 10 + kw, sy - 19, 9, 15, PAL.madder);
    px(sx - 10 + kw, sy - 19, 9, 1, PAL.saffron);
    px(sx - 10 + kw, sy - 5, 9, 1, PAL.saffron);
    for (var q = 0; q < 3; q++) {
      px(sx - 7 + kw, sy - 16 + q * 4, 3, 1, PAL.cream);
      px(sx - 6 + kw, sy - 15 + q * 4, 1, 1, PAL.indigo);
    }
    px(sx + 1 - kw, sy - 19, 8, 15, PAL.indigo);
    px(sx + 1 - kw, sy - 19, 8, 1, PAL.cream);
    for (var q2 = 0; q2 < 3; q2++) px(sx + 3 - kw, sy - 16 + q2 * 4, 4, 1, PAL.saffron);
  } else if (d.id === 'fener') {                       /* mendirek feneri */
    px(sx - 8, sy - 6, 16, 6, '#8e8878');              /* kaide */
    px(sx - 8, sy - 7, 16, 1, '#aaa494');
    px(sx - 5, sy - 34, 10, 28, PAL.lime);
    px(sx - 5, sy - 34, 5, 28, '#ffffff');
    px(sx - 5, sy - 28, 10, 4, PAL.madder);            /* kırmızı kuşak */
    px(sx - 5, sy - 18, 10, 4, PAL.madder);
    px(sx - 6, sy - 38, 12, 4, PAL.iron);              /* fener odası */
    var lit = phase2(gameT, 0.8);
    px(sx - 4, sy - 37, 8, 2, lit ? '#fff0a8' : '#8a7a3a');
    px(sx - 2, sy - 40, 4, 2, PAL.iron);
    if (lit) { ctx.save(); ctx.globalAlpha = 0.22;
      quad([[sx - 26, sy - 34], [sx + 26, sy - 40], [sx + 26, sy - 30], [sx - 26, sy - 24]], '#fff0a8');
      ctx.restore(); }
  } else if (d.id === 'heykel') {
    px(sx - 7, sy - 6, 14, 6, '#9a927f'); px(sx - 5, sy - 9, 10, 3, '#b3aa93');
    px(sx - 6, sy - 22, 12, 8, '#7fa9bd'); px(sx - 8, sy - 20, 3, 5, '#6d95a8');
    px(sx + 5, sy - 24, 4, 4, '#7fa9bd'); dot(sx - 4, sy - 19, '#16222b');
  }
}

/* =========================================================
   ÇİZİM — yükseltme alanları + kartlar
   ========================================================= */
function padInfo(p) {
  if (p.kind === 'cap') return { t: T('upCap'), e: T('upCapE') };
  if (p.kind === 'spd') return { t: T('upSpd'), e: T('upSpdE') };
  if (p.kind === 'price') return { t: T('upPrice'), e: T('upPriceE') };
  if (p.kind === 'area') return { t: UP(NM(AREAS[p.target].n)), e: T('openArea') };
  if (p.kind === 'arealv') return { t: UP(NM(AREAS[p.area].n)), e: T('upArea') + ' ' + T('level') + AREAS[p.area].lvl + '→' + (AREAS[p.area].lvl + 1) };
  if (p.kind === 'decor') return { t: UP(NM(DECOR[p.decor].n)), e: T('stDecor') };
  return { t: UP(NM(ROLES[p.role].n)), e: NM(ROLES[p.role].d) + ' ' + money(ROLES[p.role].wage) + perMin() };
}
function drawArrow(tg) {
  var sx = R(pX(tg.x, tg.y)), sy = R(pY(tg.x, tg.y, 30 + (Math.sin(gameT * 4) > 0 ? 2 : 0)));
  px(sx - 3, sy - 8, 7, 4, '#ffc94a');
  px(sx - 2, sy - 4, 5, 2, '#ffc94a');
  px(sx - 1, sy - 2, 3, 2, '#ffc94a');
  px(sx, sy, 1, 1, '#ffc94a');
}
function drawFlyers() {
  for (var i = 0; i < flyers.length; i++) {
    var f = flyers[i], t = clamp(f.t / f.d, 0, 1);
    var x = lerp(f.x0, f.x1, t), y = lerp(f.y0, f.y1, t);
    var z = lerp(f.z0, f.z1, t) + Math.sin(t * Math.PI) * f.h;
    drawItem(f.it, R(pX(x, y)), R(pY(x, y, z)));
  }
}
function drawFloats() {
  for (var i = 0; i < floats.length; i++) {
    var f = floats[i], t = f.t / 0.85;
    uiText(f.x, f.y, 26 + t * 20, f.txt, f.col, 14, 1 - t * t);
  }
}
function drawPuffs() {
  for (var i = 0; i < puffs.length; i++) {
    var p = puffs[i];
    ctx.globalAlpha = clamp(1 - p.t / 0.65, 0, 1) * 0.8;
    px(pX(p.x, p.y), pY(p.x, p.y, p.z), 2, 2, p.col);
  }
  ctx.globalAlpha = 1;
}

/* =========================================================
   SAHNE
   ========================================================= */
function tutorialTarget() {
  if (S.tut >= TUTOK.length) return null;
  var t = S.tut;
  if (t === 0 || t === 1) return { x: spots[0].x, y: spots[0].y + 0.9 };
  if (t === 2) return { x: tables[0].x, y: tables[0].y };
  if (t === 3) return hasCarry(player, isGoods) ? { x: counters[0].x, y: counters[0].y } : { x: tables[0].mat.x, y: tables[0].mat.y };
  if (t === 4) return hasCarry(player, isMoney) ? { x: safe.x, y: safe.y } : { x: counters[0].tray.x, y: counters[0].tray.y };
  return null;
}
function playerOccluded() {
  var pxp = pX(player.x, player.y), pyp = pY(player.x, player.y, 0), d = player.x + player.y + 0.3, i;
  var occ = [];
  if (!AREAS[project.z].locked && project.stage >= 2) occ.push({ x: project.x, y: project.y, w: 60, h: 46 });
  for (i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked) occ.push({ x: counters[i].x, y: counters[i].y, w: 30, h: 30 });
  for (i = 0; i < SLOTS.length; i++) if (SLOTS[i].b && slotActive(SLOTS[i])) occ.push({ x: SLOTS[i].x, y: SLOTS[i].y, w: 26, h: 28 });
  if (!AREAS[smoker.z].locked) occ.push({ x: smoker.x, y: smoker.y, w: 26, h: 26 });
  for (i = 0; i < occ.length; i++) {
    var o = occ[i];
    if (o.x + o.y <= d) continue;
    var ox = pX(o.x, o.y), oy = pY(o.x, o.y, 0);
    if (Math.abs(ox - pxp) < o.w / 2 && pyp > oy - o.h && pyp < oy + 6) return true;
  }
  return false;
}
function render() {
  drawSea();
  drawVillage();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var shk = 0;
  camOX = R(W / 2 - camX) + shk; camOY = R(H * 0.46 - camY);
  ctx.translate(camOX, camOY);

  drawShoal(); drawWaves();
  for (var b = 0; b < boats.length; b++) drawBoat(boats[b]);
  drawLand();
  for (var a = 0; a < AREAS.length; a++) drawArea(AREAS[a], a);

  var list = [], i;
  function push(d, fn) { list.push({ d: d, f: fn }); }

  for (i = 0; i < AREAS.length; i++) (function (ar) {
    if (ar.locked) return;
    if (ar.lvl >= 2) push(ar.x0 + ar.y1 - 0.2, function () { drawSign(ar); });
    if (ar.lvl >= 3) {
      push(ar.x0 + 0.5 + ar.y1 - 0.5, function () { drawLamp(ar.x0 + 0.5, ar.y1 - 0.5); });
      push(ar.x1 - 0.5 + ar.y0 + 0.5, function () { drawLamp(ar.x1 - 0.5, ar.y0 + 0.5); });
    }
  })(AREAS[i]);
  for (i = 0; i < scenery.length; i++) (function (d) { push(d.x + d.y - 0.1, function () { drawScenery(d); }); })(scenery[i]);
  for (i = 0; i < SLOTS.length; i++) (function (s) {
    if (!slotActive(s)) return; push(s.x + s.y, function () { drawSlot(s); });
  })(SLOTS[i]);
  for (i = 0; i < DECOR.length; i++) (function (d) {
    if (!d.got || AREAS[d.z].locked) return; push(d.x + d.y, function () { drawDecor(d); });
  })(DECOR[i]);
  for (i = 0; i < BINS.length; i++) (function (bn) {
    if (AREAS[bn.z].locked) return; push(bn.x + bn.y, function () { drawBin(bn); });
  })(BINS[i]);
  for (i = 0; i < PLOTS.length; i++) (function (p) {          /* v0.4 hizmet parselleri */
    if (!plotActive(p)) return;
    if (p.b) push(p.x + p.y, function () { drawServ(p); });
    else push(p.x + p.y - 0.05, function () { drawPlot(p); });
  })(PLOTS[i]);
  if (!AREAS[project.z].locked) push(project.x + project.y, drawProject);
  if (!AREAS[office.z].locked) push(office.x + office.y, drawOffice);
  for (i = 0; i < spots.length; i++) (function (s) {
    if (AREAS[s.z].locked) return; push(s.x + s.y, function () { drawSpot(s); });
  })(spots[i]);
  for (i = 0; i < tables.length; i++) (function (t) {
    if (AREAS[t.z].locked) return; push(t.x + t.y, function () { drawTable(t); });
  })(tables[i]);
  if (!AREAS[smoker.z].locked) push(smoker.x + smoker.y, drawSmoker);
  for (i = 0; i < counters.length; i++) (function (c) {
    if (AREAS[c.z].locked) return; push(c.x + c.y, function () { drawCounter(c); });
  })(counters[i]);
  push(safe.x + safe.y, drawSafe);

  var maxY = maxOpenY(), lv = AREAS[0].lvl;
  for (i = 0; i < maxY; i += 0.75) (function (yy) {
    var gap = false;
    for (var k = 0; k < counters.length; k++) {
      if (AREAS[counters[k].z].locked) continue;
      if (Math.abs(yy - counters[k].y) < 1.3) gap = true;
    }
    var az = yy < 6 ? 0 : (yy < 12 ? 1 : 2);
    if (!gap) push(9.95 + yy, function () { fencePost(9.95, yy, AREAS[az].lvl); });
  })(i);
  for (i = 0; i <= 9.95; i += 0.75) (function (xx) {
    push(xx + maxY - 0.05, function () { fencePost(xx, maxY - 0.05, lv); });
  })(i);

  for (i = 0; i < cats.length; i++) (function (ct) { push(ct.x + ct.y + 0.1, function () { drawCat(ct); }); })(cats[i]);
  for (i = 0; i < customers.length; i++) (function (cu) { push(cu.x + cu.y + 0.2, function () { drawCustomer(cu); }); })(customers[i]);
  for (i = 0; i < workers.length; i++) (function (w) {
    var col = w.role === 'hamal' ? '#4f7fae' : w.role === 'filetocu' ? '#5f8f6a' : w.role === 'tezgahtar' ? '#b8624a' : '#7a6ba8';
    push(w.x + w.y + 0.15, function () {
      drawPerson(w, workerOutfit(w));
      drawRoleTag(w);
    });
  })(workers[i]);
  push(player.x + player.y + 0.25, function () {
    var sx = R(pX(player.x, player.y)), sy = R(pY(player.x, player.y, 0));
    ctx.save(); ctx.globalAlpha = 0.55 + (Math.sin(gameT * 4) > 0 ? 0.15 : 0);
    ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx, sy - 4); ctx.lineTo(sx + 8, sy); ctx.lineTo(sx, sy + 4);
    ctx.closePath(); ctx.stroke(); ctx.restore();
    if (moveDir.on) {                                   /* yürürken yön oku (klavye + dokunmatik) */
      var mx = pX(moveDir.x, moveDir.y), my = pY(moveDir.x, moveDir.y, 0), ml = Math.hypot(mx, my) || 1;
      var ux = mx / ml, uy = my / ml, tx = sx + ux * 13, ty = sy + uy * 7;
      ctx.save(); ctx.globalAlpha = 0.85;
      for (var q = 0; q < 4; q++) {
        px(tx - ux * q - uy * q, ty - uy * q + ux * q, 1, 1, '#ffc94a');
        px(tx - ux * q + uy * q, ty - uy * q - ux * q, 1, 1, '#ffc94a');
      }
      ctx.restore();
    }
    drawPerson(player, playerOutfit());
  });

  list.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < list.length; i++) list[i].f();

  if (S.started && playerOccluded()) {
    ctx.save(); ctx.globalAlpha = 0.45;
    drawPerson(player, playerOutfit());
    ctx.restore();
    var gx = R(pX(player.x, player.y)), gy = R(pY(player.x, player.y, 26));
    px(gx - 2, gy, 5, 2, '#ffc94a'); px(gx - 1, gy + 2, 3, 2, '#ffc94a'); px(gx, gy + 4, 1, 2, '#ffc94a');
  }
  for (i = 0; i < gulls.length; i++) drawGull(gulls[i]);
  drawFlyers(); drawPuffs(); drawFloats();
  if (S.started) { var tg = tutorialTarget(); if (tg) drawArrow(tg); }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawVignette();                           /* v0.1 — kenarları yumuşatan vinyet */
  if (S.started) dayTint();                 /* v1.2 — sabah/gündüz/akşam tonu */
  ctx.translate(camOX, camOY);
  renderUI();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stick.active) drawJoystick(R(stick.bx / PXS), R(stick.by / PXS), stick.dx, stick.dy, 1);
  else if (S.started && S.ctrl === 0 && inputMode === 'touch' && !paused) {
    /* eğitim: ekranın altında "burada sürükle" hayalet joystick'i */
    var gt = (gameT % 2.4) / 2.4, ang = gt * Math.PI * 2;
    drawJoystick(R(W / 2), R(H * 0.74), Math.cos(ang) * 0.8, Math.sin(ang) * 0.8, 0.55);
  }
}

/* =========================================================
   ARAYÜZ (DOM)
   ========================================================= */
var el = {};
['money', 'carry', 'carryIcon', 'rep', 'repfill', 'eventChip', 'eventIcon', 'eventName', 'eventT', 'objective',
 'objLbl', 'objText', 'queueHint', 'toast', 'devbar', 'devpanel', 'dpTitle', 'dpCards', 'dpClose',
 'hMoney', 'hCarry', 'hRep', 'startTag', 'startList', 'playBtn', 'setBtn', 'setTitle', 'setLang',
 'setSound', 'setMusic', 'musOn', 'musOff', 'setZoom', 'setClose', 'resetBtn', 'closeMenu', 'menuSet', 'langLbl', 'tabBody',
 'startScreen', 'settingsScreen', 'menuScreen', 'menuBtn', 'dtArea', 'dtLevel', 'dtBuild', 'dtProj', 'dtServ',
 'pauseBadge', 'pauseTxt', 'saveInfo', 'setSaveInfo', 'saveBtn', 'saveQuitBtn', 'menuSave', 'newBtn', 'setSaveLbl',
 'dayChip', 'dayIcon', 'dayNum', 'dayfill', 'hDay', 'dayBanner', 'dayBannerT', 'dayBannerS',
 'dayScr', 'dayTitle', 'dayRows', 'dayNext', 'dayGo', 'dayStalls',
 'stallScr', 'stallTitle', 'stallSub', 'stallRows', 'stallGo', 'prepScr', 'prepTitle', 'prepSub',
 'prepDepot', 'prepRows', 'prepGo', 'introScr', 'introCv', 'introSub', 'introNext', 'introSkip', 'introGate',
 'introDots', 'introTap', 'introTag', 'nameScr', 'nameCard', 'nameTitle', 'nameSub', 'nameSign', 'nameIn', 'nameDice', 'nameHint',
 'nameIdeasLbl', 'nameChips', 'nameGo', 'boardScr', 'boardTitle', 'boardSub', 'boardRows', 'boardNote',
 'boardClose', 'boardBtn', 'storyBtn', 'menuBoard', 'dpSub', 'lvlUp', 'lvlNum', 'lvlTitle', 'lvlList', 'lvlConf', 'coach', 'loadBtn', 'slotScr', 'slotTitle', 'slotSub',
 'slotRows', 'slotBack', 'nameBack', 'askScr', 'askMsg', 'askYes', 'askNo', 'heroScr', 'heroCard', 'heroCv',
 'heroName', 'heroNameDice', 'heroRows', 'heroDice', 'heroGo', 'heroBack', 'heroTitle', 'heroSub', 'heroNameLbl'].forEach(function (id) {
  el[id] = document.getElementById(id);
});
var toastT = 0;
function toast(msg) { el.toast.textContent = msg; el.toast.classList.add('on'); toastT = 2.6; }

function applyLang() {
  document.documentElement.lang = lang;
  el.hMoney.textContent = T('money'); el.hCarry.textContent = T('carry'); el.hRep.textContent = T('rep'); el.hRep.dataset.l = '';
  el.startTag.textContent = T('tag');
  el.startList.innerHTML = PX(['intro1', 'intro2', 'intro3', 'intro4', 'intro5'].map(function (k) {
    return '<li>' + T(k) + '</li>';
  }).join('') + '<li style="opacity:.7">' + T('ctrl') + '</li>');
  el.playBtn.textContent = T('play'); el.setBtn.textContent = T('settings');
  el.heroTitle.textContent = T('heroTitle'); el.heroSub.textContent = T('heroSub'); el.heroNameLbl.textContent = T('heroNameLbl');
  el.heroDice.textContent = T('heroRandom'); el.heroGo.textContent = T('heroGo'); el.heroBack.textContent = T('back');
  if (!el.heroScr.classList.contains('hidden')) renderHeroRows();
  el.loadBtn.textContent = T('loadGame'); el.slotBack.textContent = T('back'); el.nameBack.textContent = T('back');
  if (!el.slotScr.classList.contains('hidden')) renderSlots();
  el.boardBtn.textContent = T('board'); el.storyBtn.textContent = T('story'); el.menuBoard.textContent = T('boardTitle');
  el.boardTitle.textContent = T('boardTitle'); el.boardSub.textContent = T('boardSub');
  el.boardNote.textContent = T('boardLocal'); el.boardClose.textContent = T('close');
  el.nameTitle.textContent = T('nameTitle'); el.nameSub.textContent = T('nameSub');
  el.nameIdeasLbl.textContent = T('nameIdeas'); el.nameGo.textContent = T('nameGo'); el.nameDice.title = T('nameDice');
  el.introSkip.textContent = T('skip'); el.introTap.textContent = T('tapStart'); el.introTag.textContent = T('tag');
  if (intro.on && intro.ph === 'hold') { intro.typed = 0; el.introSub.textContent = ''; }
  if (!el.boardScr.classList.contains('hidden')) renderBoard();
  if (!el.nameScr.classList.contains('hidden')) { syncNamePreview(); renderNameChips(); }
  el.setTitle.textContent = T('settings'); el.setLang.textContent = T('langLbl');
  el.setSound.textContent = T('soundLbl'); el.setZoom.textContent = T('zoomLbl');
  el.setMusic.textContent = T('musicLbl'); el.musOn.textContent = T('musOn'); el.musOff.textContent = T('musOff');
  el.setClose.textContent = T('resume'); el.resetBtn.textContent = T('delSlot');
  el.closeMenu.textContent = T('resume'); el.menuSet.textContent = T('settings');
  el.saveBtn.innerHTML = PX(T('saveNow')); el.saveQuitBtn.innerHTML = PX(T('saveQuit'));
  el.menuSave.innerHTML = PX(T('saveNow')); el.newBtn.textContent = T('newGame');
  el.setSaveLbl.textContent = T('setSave'); el.pauseTxt.textContent = T('paused');
  el.hDay.textContent = T('dayLbl');
  el.prepTitle.textContent = T('mktDayTitle'); el.prepSub.textContent = T('prepSub');
  el.stallTitle.textContent = T('stallTitle'); el.stallSub.textContent = T('stallSub');
  el.stallGo.textContent = T('ok'); el.dayStalls.textContent = T('dayStalls');
  if (!el.stallScr.classList.contains('hidden')) renderStallScreen();
  el.prepGo.textContent = T('goMarket');
  if (!el.dayScr.classList.contains('hidden') && day.last) showDayCard();
  if (!el.prepScr.classList.contains('hidden')) renderPrep();
  refreshSaveInfo();
  el.langLbl.textContent = T('langLbl');
  el.dtArea.textContent = T('barArea'); el.dtLevel.textContent = T('barLevel');
  el.dtBuild.textContent = T('barBuild'); el.dtProj.textContent = T('barProj');
  el.dtServ.textContent = T('barServ');
  var oft = document.querySelectorAll('#ofTabs .tab');
  var ofn = ['tabMarket', 'tabCo', 'tabCtr', 'tabPort', 'tabNews', 'tabHold'];
  for (var q = 0; q < oft.length; q++) oft[q].textContent = T(ofn[q]);
  document.getElementById('ofTitle').textContent = T('office');
  document.getElementById('tradeLbl').textContent = T('trade');
  var tabs = document.querySelectorAll('#menuTabs .tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].textContent = T('tabs')[i];
  Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button,#introLang button'), function (b) {
    b.classList.toggle('on', b.dataset.l === lang);
  });
  if (!el.menuScreen.classList.contains('hidden')) renderTab();
  if (barTab) renderBar();
}

function urgentOrder() {
  var best = null;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    for (var k = 0; k < c.slots.length; k++) {
      var cu = c.slots[k];
      if (cu && cu.state === 'wait' && (!best || cu.pat < best.pat)) best = cu;
    }
  } return best;
}
function waitingCount() {
  var n = 0;
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    for (var k = 0; k < c.slots.length; k++) if (c.slots[k] && c.slots[k].state === 'wait') n++;
  } return n;
}
function carryIcon() {
  var n = { fish: 0, fileto: 0, fume: 0, money: 0 };
  for (var i = 0; i < player.carry.length; i++) n[player.carry[i].k]++;
  if (!player.carry.length) return 'kufe';
  var top = 'fish';
  for (var k in n) if (n[k] > n[top]) top = k;
  return top === 'fish' ? 'hamsi' : top === 'fileto' ? 'tezgah' : top === 'fume' ? 'kesim' : 'para';
}
function syncHUD(dt) {
  el.money.textContent = Math.round(S.cash).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');
  el.carry.textContent = carryW(player) + '/' + capacity();
  setChipIcon(el.carryIcon, carryIcon());
  el.rep.textContent = S.rep;
  checkRepLevel();
  var lvl = repLevel();
  if (el.hRep.dataset.l !== lvl + lang) { el.hRep.dataset.l = lvl + lang; el.hRep.textContent = T('rep') + ' · ' + T('lvShort', { l: lvl }); }
  var cur = REP_LEVELS[lvl - 1].need, nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl].need : cur + 1;
  el.repfill.style.width = clamp((S.rep - cur) / (nxt - cur) * 100, 0, 100) + '%';
  if (event) {
    el.eventChip.classList.remove('hidden');
    setChipIcon(el.eventIcon, EMO_MAP[event.icon] || 'hamsi');
    el.eventName.textContent = T(event.name);
    el.eventT.textContent = Math.ceil(eventT) + 's';
  } else el.eventChip.classList.add('hidden');
  if (S.tut < TUTOK.length) {
    el.objective.classList.remove('hidden');
    el.objLbl.textContent = T('goal') + ' ' + (S.tut + 1) + '/' + TUTOK.length;
    el.objText.textContent = T('tut')[S.tut];
  } else if (undecidedStalls().length) {
    el.objective.classList.remove('hidden');
    el.objLbl.textContent = T('newStallLbl');
    el.objText.textContent = T('newStallHint');
  } else {
    var o = urgentOrder();
    /* §7: görev bandı yalnız gerektiğinde */
    if (o && o.pat < 26) {
      el.objective.classList.remove('hidden');
      el.objLbl.textContent = T('orderOf', { n: UP(NM(o.type.n)) });
      el.objText.textContent = prodName(o.ord.k, o.ord.f) + ' x' + (o.ord.need - o.ord.got) + ' - ' + Math.ceil(o.pat) + 's';
    } else el.objective.classList.add('hidden');
  }
  /* v1.2 gün çipi */
  el.dayNum.textContent = day.n + (day.market ? ' 🐟' : '');
  setChipIcon(el.dayIcon, day.market ? 'pazar' : 'gun');
  el.dayfill.style.width = clamp(day.t / DAY_LEN * 100, 0, 100) + '%';
  if (day.phase === 'intro') {
    el.dayBanner.classList.remove('hidden');
    el.dayBannerT.textContent = T('dayN', { d: day.n });
    var fc = day.feat && custById(day.feat);
    el.dayBannerS.textContent = (day.market ? T('mktDayLbl') + (fc ? ' • ' : '') : '') + (fc ? T('featDay', { n: NM(fc.n) }) : '');
  } else el.dayBanner.classList.add('hidden');
  var w = waitingCount();
  if (w >= 4) { el.queueHint.classList.remove('hidden'); el.queueHint.textContent = T('waiting', { n: w }); }
  else el.queueHint.classList.add('hidden');
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('on'); }
  if (cfT > 0) { cfT -= dt; if (cfT <= 0 && cfId) { cfId = null; renderBar(); } }
  barHot();
  syncTradeBtn();
  ofRefresh -= dt;
  if (ofRefresh <= 0) {
    ofRefresh = 1;
    if (!document.getElementById('officeScr').classList.contains('hidden')) renderOffice();
  }
}

/* ---------- alt panel ---------- */
/* =========================================================
   ALT GELİŞTİRME BARI (GDD v0.3.1 §3)
   ========================================================= */
var barTab = null, barSlot = null, cfId = null, cfT = 0, buildSub = 'dev';
var servSel = null, servPick = null;   /* v0.4 — seçili bina / parsel önizlemesi */
var barZone = null;                    /* v2.1 — personel alınan bölge */
var stallPrompt = false;               /* v0.1 — yeni tezgâh bildirimi bekliyor */
function closeBar() {
  barTab = null; barSlot = null; cfId = null; servPick = null; barZone = null;
  el.devpanel.classList.add('hidden');
  document.body.classList.remove('panel');
  Array.prototype.forEach.call(document.querySelectorAll('.dtab'), function (b) { b.classList.remove('on'); });
}
function openBar(t) {
  if (barTab === t) { closeBar(); return; }
  barTab = t; barSlot = null; cfId = null; servPick = null; barZone = null;
  el.devpanel.classList.remove('hidden');
  document.body.classList.add('panel');
  Array.prototype.forEach.call(document.querySelectorAll('.dtab'), function (b) {
    b.classList.toggle('on', b.dataset.t === t);
  });
  renderBar();
}
function purchase(cost, blocked, fn) {
  if (blocked) { sfx.bad(); return false; }
  if (S.cash < cost) { toast(T('noMoney')); sfx.bad(); return false; }
  S.cash -= cost; fn(); save(); renderBar(); return true;
}
function areaLevelEffect(a) { return T('lvEffect'); }

function barList() {
  var out = [], i;
  if (barTab === 'area') {
    for (i = 1; i < AREAS.length; i++) {
      var a = AREAS[i];
      if (!a.locked || AREAS[i - 1].locked) continue;
      var blk = S.rep < a.rep;
      out.push({ id: 'a' + i, ic: '🔓', t: NM(a.n), s: T('areaGives') + (a.rep ? ' • Sv ' + levelForRep(a.rep) : ''),
        cost: upCost(a.cost), blocked: blk, why: T('needRep', { n: a.rep, c: S.rep, l: levelForRep(a.rep) }),
        go: function (k) { return function () { AREAS[k].locked = false; rebuildCounters(); reassignWorkers(); clampCam(); sfx.build(); toast(T('areaOpen', { n: NM(AREAS[k].n) })); }; }(i) });
      break;
    }
    if (!out.length) out.push({ empty: T('emptyArea') });
  } else if (barTab === 'level') {
    /* --- v2.1: bölge personeli alt listesi --- */
    if (barZone !== null) {
      var zn = barZone;
      out.push({ id: 'back', ic: '↩', t: T('back'), s: NM(AREAS[zn].n) + ' ' + zoneStaff(zn) + '/' + zoneStaffCap(zn), back: true });
      for (i = 0; i < ZONE_ROLES.length; i++) (function (r) {
        var full = zoneFree(zn) <= 0;
        out.push({ id: 'zr' + r + zn, ic: ROLES[r].icon, t: NM(ROLES[r].n),
          s: NM(ROLES[r].d) + ' • ' + money(ROLES[r].wage) + perMin(),
          cost: hireCost(r, zn), blocked: full, why: T('zoneFull'),
          go: function () { hire(r, false, zn); barZone = null; save(); renderBar(); } });
      })(ZONE_ROLES[i]);
      return out;
    }
    /* --- v2.3: tezgâh aç/kapat ekranına kısayol (ücretsiz, listede ilk sırada) --- */
    if (switchableStalls().length) {
      var yeniVar = undecidedStalls().length;
      out.push({ id: 'stsw', ic: '🐟', t: T('stallSwitch') + (yeniVar ? ' •' : ''),
        s: yeniVar ? T('stallNewN', { n: yeniVar })
                   : T('stallSwitchD', { a: openStallCount(), b: switchableStalls().length + 1 }),
        pick: T('stallManage'), go: function () { openStallScreen(); } });
    }
    /* --- v2.1: her açık bölge için personel kartı --- */
    for (i = 0; i < zoneCount(); i++) (function (z2) {
      if (!zoneOpen(z2)) return;
      var free = zoneFree(z2);
      var zfn = zoneFish(z2).filter(function (q) { return canSell(q); }).map(function (q) { return NM(FISH[q].n); });
      out.push({ id: 'zs' + z2, ic: '👷', t: T('zoneStaff', { n: NM(AREAS[z2].n) }),
        s: T('zoneStaffD', { a: zoneStaff(z2), b: zoneStaffCap(z2) }) + (zfn.length ? ' • ' + zfn.join(', ') : ''),
        pick: free > 0 ? T('choose') : null, blocked: free <= 0, why: T('zoneFull'),
        go: function () { barZone = z2; cfId = null; renderBar(); } });
    })(i);
    /* --- v0.5: personele devret (tam otomasyon) --- */
    for (i = 0; i < zoneCount(); i++) (function (z3) {
      if (!zoneOpen(z3)) return;
      var ch = zoneChain(z3), on = zoneAuto(z3);
      var st = ZONE_ROLES.map(function (r) { return (ch[r] ? '✓' : '✗') + NM(ROLES[r].n); }).join(' ');
      out.push({ id: 'au' + z3, ic: on ? '⚙️' : '🤝', t: T(on ? 'autoCardOn' : 'autoCard', { n: NM(AREAS[z3].n) }),
        s: on ? T('autoCardOnD') : st, pick: ch.ok ? T(on ? 'autoBack' : 'autoGive') : null,
        blocked: !ch.ok, why: T('autoNeed', { n: ch.miss.length }),
        go: function () { setZoneAuto(z3, !on); } });
    })(i);
    for (i = 0; i < PADS.length; i++) {
      var p = PADS[i];
      if (p.kind === 'decor' || p.kind === 'area' || p.kind === 'arealv') continue;
      if (AREAS[p.z].locked || p.lvl >= p.max) continue;
      var info = padInfo(p), bl = padBlocked(p);
      out.push({ id: p.id, ic: p.icon, t: info.t + (p.max > 1 ? '  ' + T('level') + p.lvl + '→' + (p.lvl + 1) : ''),
        s: info.e, cost: upCost(padPrice(p)), blocked: bl, why: T('staffFull', { n: staffCap() }),
        go: function (pp) { return function () { applyPad(pp); }; }(p) });
    }
    if (!out.length) out.push({ empty: T('emptyLevel') });
  } else if (barTab === 'build') {
    /* v0.3 — YAPI üç alt kategoride: Dekoratif • Geliştirmeler • Yapı Yükseltmeleri */
    var lvNow = repLevel();
    if (barSlot) {
      out.push({ id: 'back', ic: '↩', t: T('back'), s: '', back: true });
      var sl = barSlot;
      for (i = 0; i < BUILDINGS.length; i++) {
        var bd = BUILDINGS[i];
        if (sl.cats.indexOf(bd.cat) < 0) continue;
        var owned = sl.b === bd.id;
        var refund = sl.b ? Math.round(bdef(sl.b).cost * 0.6) : 0;
        out.push({ id: 'b' + bd.id, ic: bd.icon, t: NM(bd.n), s: NM(bd.d), cost: upCost(bd.cost), refund: refund,
          owned: owned, blocked: !owned && bd.lv && lvNow < bd.lv, why: T('needLv', { l: bd.lv }),
          go: function (b2) { return function () { slotBuild(barSlot, b2); }; }(bd.id) });
      }
    } else if (buildSub === 'decor') {
      for (i = 0; i < DECOR.length; i++) {
        var dc = DECOR[i];
        if (dc.got || AREAS[dc.z].locked) continue;
        out.push({ id: 'd' + i, ic: dc.icon, t: NM(dc.n), s: T('decorGroup') + ' • ' + NM(AREAS[dc.z].n), cost: dc.cost,
          blocked: dc.lv && lvNow < dc.lv, why: T('needLv', { l: dc.lv }),
          go: function (k) { return function () { DECOR[k].got = true; sfx.build(); toast(T('decorBought', { n: NM(DECOR[k].n) })); }; }(i) });
      }
      if (!out.length) out.push({ empty: T('emptyDecor') });
    } else if (buildSub === 'up') {
      for (i = 0; i < AREAS.length; i++) {
        var ar = AREAS[i];
        if (ar.locked || ar.lvl >= MAXLV) continue;
        out.push({ id: 'l' + i, ic: '🏗️', t: NM(ar.n) + '  ' + T('level') + ar.lvl + '→' + (ar.lvl + 1),
          s: areaLevelEffect(ar), cost: upCost(ar.up[ar.lvl]),
          go: function (k) { return function () { AREAS[k].lvl++; rebuildCounters(); sfx.build(); toast(T('areaLvUp', { n: NM(AREAS[k].n), l: AREAS[k].lvl })); }; }(i) });
      }
      if (!out.length) out.push({ empty: T('emptyUp') });
    } else {
      for (i = 0; i < SLOTS.length; i++) {
        var s2 = SLOTS[i];
        if (!slotActive(s2)) continue;
        var d2 = s2.b ? bdef(s2.b) : null;
        out.push({ id: 's' + s2.id, ic: d2 ? d2.icon : '🔨', t: d2 ? NM(d2.n) : T('slotEmpty'),
          s: T('slotOf', { n: NM(AREAS[s2.z].n) }) + (d2 ? ' • ' + NM(d2.d) : ''),
          pick: T(d2 ? 'replace' : 'choose'),
          go: function (sx) { return function () { barSlot = sx; cfId = null; renderBar(); }; }(s2) });
      }
      if (!out.length) out.push({ empty: T('emptyBuild') });
    }
  } else if (barTab === 'serv') {
    /* v0.4 §37 — parsel seçimi (inşa veya ücretsiz taşıma) */
    if (servPick) {
      var pd = sdef(servPick), moving = sBuilt(servPick), fp = servFreePlots(servPick);
      out.push({ id: 'back', ic: '↩', t: T('back'), s: NM(pd.n) + ' • ' + T('pickPlot'), back: true });
      for (i = 0; i < fp.length; i++) (function (pl) {
        if (moving) {
          out.push({ id: 'pl' + pl.id, ic: '↔️', t: NM(pl.n), s: T('plotOf', { n: NM(AREAS[pl.z].n) }),
            pick: T('moveHere'), go: function () { servMove(servPick, pl); servPick = null; save(); renderBar(); } });
        } else {
          out.push({ id: 'pl' + pl.id, ic: '🏗️', t: NM(pl.n), s: T('plotOf', { n: NM(AREAS[pl.z].n) }),
            cost: upCost(sCost(pd.lv[0].c)), buyTxt: T('buildHere'),
            go: function () { var id0 = servPick; servPick = null; servBuild(id0, pl); servSel = id0; } });
        }
      })(fp[i]);
      if (!fp.length) out.push({ empty: T('noPlot') });
      return out;
    }
    for (i = 0; i < SERV.length; i++) (function (d) {
      var lv = sLvl(d.id);
      if (lv > 0) {
        var cur = d.lv[lv - 1];
        if (lv >= 5) {
          out.push({ id: 'sv' + d.id, ic: d.icon, t: NM(d.n) + '  Lv.5', s: NM(cur.d), owned: true });
        } else {
          var nx = d.lv[lv];
          out.push({ id: 'sv' + d.id, ic: d.icon, t: NM(d.n) + '  Lv.' + lv + '→' + (lv + 1),
            s: NM(nx.d) + ' • ' + T('nextLook') + ': ' + NM(nx.v) + (d.dormant ? ' • ' + T('dormantB') : ''),
            cost: upCost(sCost(nx.c)),
            go: function () { servUp(d.id); servSel = d.id; } });
        }
        if (servFreePlots(d.id).length) {
          out.push({ id: 'mv' + d.id, ic: '↔️', t: T('move'), s: NM(d.n) + ' • ' + T('free'),
            pick: T('choose'), go: function () { servPick = d.id; cfId = null; renderBar(); } });
        }
      } else {
        var why = servLockReason(d), c0 = d.lv[0];
        out.push({ id: 'sv' + d.id, ic: d.icon, t: NM(d.n),
          s: NM(d.r) + ' • ' + NM(c0.d) + (c0.inc ? ' • ' + money(c0.inc) + '/' + Math.round(c0.ivl) + 's ' + T('servInc') : ''),
          blocked: !!why, why: why || '',
          pick: why ? null : money(upCost(sCost(c0.c))) + ' →',
          go: function () { servPick = d.id; cfId = null; renderBar(); } });
      }
    })(SERV[i]);
    if (!out.length) out.push({ empty: T('servEmpty') });
  }
  return out;
}
function slotBuild(sl, id) {
  var d = bdef(id), price = upCost(d.cost);
  if (d.lv && repLevel() < d.lv) { toast(T('needLv', { l: d.lv })); sfx.bad(); return; }
  var refund = sl.b ? Math.round(upCost(bdef(sl.b).cost) * 0.6) : 0;
  if (sl.b === id) return;
  if (S.cash + refund < price) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash += refund - price;
  sl.b = id; rebuildCounters(); reassignWorkers();
  sfx.build(); toast(T('built', { n: NM(d.n) }));
  addPuff(sl.x, sl.y, '#ffc94a');
  barSlot = null; save(); renderBar();
}
function buildHot(sub) {
  var i;
  if (sub === 'up') { for (i = 0; i < AREAS.length; i++) if (!AREAS[i].locked && AREAS[i].lvl < MAXLV && S.cash >= AREAS[i].up[AREAS[i].lvl]) return true; return false; }
  if (sub === 'dev') { for (i = 0; i < SLOTS.length; i++) if (slotActive(SLOTS[i]) && !SLOTS[i].b && S.cash >= 900) return true; return false; }
  return false;
}
function setBuildSub(sub) { buildSub = sub; barSlot = null; cfId = null; renderBar(); sfx.tap(); }
function renderBar() {
  if (!barTab) return;
  el.dpTitle.textContent = T(barTab === 'area' ? 'tArea' : barTab === 'level' ? 'tLevel' : barTab === 'build' ? 'tBuild' : barTab === 'serv' ? 'tServ' : 'tProj');
  el.dpSub.classList.toggle('hidden', barTab !== 'build' || !!barSlot);
  if (barTab === 'build') Array.prototype.forEach.call(el.dpSub.children, function (b) {
    b.classList.toggle('on', b.dataset.s === buildSub);
    b.innerHTML = PX(T('bsub_' + b.dataset.s)) + (buildHot(b.dataset.s) ? ' •' : '');
  });
  if (barTab === 'proj') { renderProjPanel(); return; }
  var list = barList(), h = '';
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    if (c.empty) { h += '<div class="dempty">' + c.empty + '</div>'; continue; }
    var btn;
    if (c.back) btn = '<button class="buy" data-i="' + i + '">' + T('back') + '</button>';
    else if (c.pick) btn = '<button class="buy" data-i="' + i + '">' + c.pick + '</button>';
    else if (c.owned) btn = '<button class="buy done" data-i="' + i + '">✔ ' + T('owned') + '</button>';
    else if (c.blocked) btn = '<button class="buy no" data-i="' + i + '">' + c.why + '</button>';
    else {
      var aff = S.cash + (c.refund || 0) >= c.cost;
      var cf = cfId === c.id;
      btn = '<button class="buy' + (aff ? (cf ? ' cf' : '') : ' no') + '" data-i="' + i + '">' +
        (cf ? T('confirm') : (c.buyTxt ? c.buyTxt + ' ' + money(c.cost) : money(c.cost))) + '</button>';
    }
    h += '<div class="dcard' + (c.pick && !c.owned ? '' : '') + '"><span class="ic">' + c.ic + '</span><b>' +
      c.t + '</b><small>' + (c.s || '') + (c.refund ? ' (+' + money(c.refund) + ')' : '') + '</small>' + btn + '</div>';
  }
  el.dpCards.innerHTML = PX(h);
  Array.prototype.forEach.call(el.dpCards.querySelectorAll('.buy'), function (b) {
    b.onclick = function () {
      var c = list[parseInt(b.dataset.i, 10)];
      if (!c) return;
      if (c.back) { barSlot = null; servPick = null; barZone = null; cfId = null; renderBar(); return; }
      if (c.pick) { c.go(); return; }
      if (c.owned) return;
      if (c.blocked) { sfx.bad(); toast(c.why); return; }
      var needCf = c.cost >= 1500 || barTab === 'area' || barTab === 'serv' || (barTab === 'build' && c.id.charAt(0) === 'l');
      if (needCf && cfId !== c.id) { cfId = c.id; cfT = 3.5; renderBar(); return; }
      cfId = null;
      if (c.refund !== undefined) { c.go(); return; }
      purchase(c.cost, false, c.go);
    };
  });
}
function renderProjPanel() {
  var extra = '';
  if (officeReady() && M && !M.office) {
    var oc = upCost(ECON.officeCost), okRep = S.rep >= ECON.officeRep;
    extra += '<div class="dcard"><span class="ic">🏛️</span><b>' + T('office') + '</b><small>' + T('officeD') +
      (okRep ? '' : ' • ⭐' + ECON.officeRep) + '</small>' +
      '<button class="buy' + (okRep && S.cash >= oc ? (cfId === 'office' ? ' cf' : '') : ' no') + '" data-x="office">' +
      (okRep ? (cfId === 'office' ? T('confirm') : money(oc)) : T('needRep', { n: ECON.officeRep, c: S.rep, l: levelForRep(ECON.officeRep) })) + '</button></div>';
  }
  if (M && M.office && !M.license) {
    var lc = upCost(ECON.licenseCost), okR2 = S.rep >= ECON.licenseRep;
    extra += '<div class="dcard"><span class="ic">📜</span><b>' + T('license') + '</b><small>' + T('licenseD') + '</small>' +
      '<button class="buy' + (okR2 && S.cash >= lc ? (cfId === 'lic' ? ' cf' : '') : ' no') + '" data-x="lic">' +
      (okR2 ? (cfId === 'lic' ? T('confirm') : money(lc)) : T('needRep', { n: ECON.licenseRep, c: S.rep, l: levelForRep(ECON.licenseRep) })) + '</button></div>';
  }
  if (AREAS[project.z].locked) {
    el.dpCards.innerHTML = PX(extra || '<div class="dempty">' + T('emptyProj') + '</div>');
    bindProjExtra(); return;
  }
  var pc = projPct();
  if (project.done) {
    el.dpCards.innerHTML = PX(extra + '<div class="dcard"><span class="ic">🏛️</span><b>' + NM(project.n) +
      '</b><small>' + T('done') + ' ✔</small></div>');
    bindProjExtra(); return;
  }
  var nextTh = project.stages[Math.min(project.stage, project.stages.length - 1)] * project.total;
  el.dpCards.innerHTML = PX(extra + '<div class="dcard dwide"><b>' + NM(project.n) + '  ' + T('stage') + ' ' + project.stage + '/5</b>' +
    '<div class="dbar"><i style="width:' + Math.round(pc * 100) + '%"></i></div>' +
    '<small>' + money(project.inv) + ' / ' + money(project.total) + ' — ' + T('nextStage') + ': ' + money(Math.max(0, nextTh - project.inv)) + '</small>' +
    '<div class="dinv"><button data-a="1000">+' + money(1000) + '</button><button data-a="10000">+' + money(10000) +
    '</button><button data-a="q">' + T('pct25') + '</button><button data-a="max">' + T('maxInvest') + '</button></div></div>');
  Array.prototype.forEach.call(el.dpCards.querySelectorAll('.dinv button'), function (b) {
    b.onclick = function () {
      var a = b.dataset.a;
      investProject(a === 'max' ? S.cash : a === 'q' ? S.cash * 0.25 : parseInt(a, 10));
    };
  });
  bindProjExtra();
}
function bindProjExtra() {
  Array.prototype.forEach.call(el.dpCards.querySelectorAll('.buy[data-x]'), function (b) {
    b.onclick = function () {
      var x = b.dataset.x;
      if (x === 'office') {
        if (S.rep < ECON.officeRep) { sfx.bad(); return; }
        if (cfId !== 'office') { cfId = 'office'; cfT = 3.5; renderBar(); return; }
        cfId = null;
        purchase(upCost(ECON.officeCost), false, function () {
          M.office = true; M.day = 1; M.t = 0; genOffers();
          if (M.credit > 0) {
            var tc = cst('atlas');
            tc.free -= M.credit; tc.own += M.credit; M.credit = 0;
            notify(T('creditGift', { n: NM(cdef('atlas').n) }), 'mid');
          }
          notify(T('tutMarket'), 'high'); sfx.build();
        });
      } else if (x === 'lic') {
        if (S.rep < ECON.licenseRep) { sfx.bad(); return; }
        if (cfId !== 'lic') { cfId = 'lic'; cfT = 3.5; renderBar(); return; }
        cfId = null;
        purchase(upCost(ECON.licenseCost), false, function () { M.license = true; sfx.build(); notify(T('license'), 'high'); });
      }
    };
  });
}
function barHot() {
  var hot = { area: false, level: false, build: false, proj: false, serv: false }, i;
  for (i = 1; i < AREAS.length; i++) if (AREAS[i].locked && !AREAS[i - 1].locked && S.rep >= AREAS[i].rep && S.cash >= AREAS[i].cost) hot.area = true;
  if (buildHot('up') || buildHot('dev')) hot.build = true;
  for (i = 0; i < PADS.length; i++) {
    var p = PADS[i];
    if (p.kind === 'decor' || p.kind === 'area' || p.kind === 'arealv') continue;
    if (!AREAS[p.z].locked && p.lvl < p.max && !padBlocked(p) && S.cash >= padPrice(p)) hot.level = true;
  }
  if (undecidedStalls().length) hot.level = true;
  for (i = 0; i < zoneCount(); i++) if (zoneOpen(i) && zoneFree(i) > 0 && S.cash >= hireCost('hamal', i)) hot.level = true;
  if (!AREAS[project.z].locked && !project.done && S.cash >= 1000) hot.proj = true;
  if (M && officeReady() && !M.office && S.rep >= ECON.officeRep && S.cash >= upCost(ECON.officeCost)) hot.proj = true;
  if (M && M.office && !M.license && S.rep >= ECON.licenseRep && S.cash >= upCost(ECON.licenseCost)) hot.proj = true;
  for (i = 0; i < SERV.length; i++) {
    var sd = SERV[i], slv = sLvl(sd.id);
    if (slv === 0) { if (!servLockReason(sd) && S.cash >= upCost(sCost(sd.lv[0].c))) hot.serv = true; }
    else if (slv < 5 && S.cash >= upCost(sCost(sd.lv[slv].c))) hot.serv = true;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.dtab'), function (b) {
    b.classList.toggle('hot', !!hot[b.dataset.t] && barTab !== b.dataset.t);
  });
}
Array.prototype.forEach.call(document.querySelectorAll('.dtab'), function (b) {
  b.onclick = function () { openBar(b.dataset.t); };
});

/* =========================================================
   v1.2 — GÜN KARTLARI • PAZAR HAZIRLIĞI • DEPO PANELİ
   ========================================================= */
function dayRow(ic, t, v) {
  return '<div class="row"><div class="ic">' + ic + '</div><div class="tx">' + t + '</div><div class="vl">' + v + '</div></div>';
}
function showDayCard() {
  var L = day.last, h = '';
  el.dayTitle.textContent = (L.market ? T('mktClose', { d: L.n }) : T('dayClose', { d: L.n }));
  h += dayRow('💰', T('dayInc'), money(L.inc));
  h += dayRow('🧾', T('dayServed'), L.market ? (L.served + ' / ' + (L.served + L.lost)) : ('' + L.served));
  h += dayRow('🐟', T('dayFish'), '' + L.fish);
  if (L.market || L.lost) h += dayRow('🚶', T('dayLost'), '' + L.lost);
  if (L.top) h += dayRow('🏆', T('dayTop'), NM(FISH[L.top.f].n) + ' ×' + L.top.n);
  if (L.out) h += dayRow('⚠️', T('dayOut'), NM(FISH[L.out.f].n) + ' ' + fmtDur(L.out.t));
  if (L.auc) h += dayRow('🔔', T('dayAuction'), L.auc.n + ' × ' + money(L.auc.v));
  if (S.company) {
    submitScore(true);
    var rk = myRank(Board.sort(Board.read()));
    var fs = T('fishN', { n: fmtN(S.caught) });
    h += dayRow('🏆', T('dayScore'), '<span class="dayRankV">' + (ONLINE ? fs : (rk ? T('dayRank', { s: fs, r: rk }) : fs)) + '</span>');
    if (ONLINE) setTimeout(function () {             /* sunucu sırası gelince satırı güncelle */
      Board.fetch(function (l, info) {
        if (info.src !== 'online' || !info.me || el.dayScr.classList.contains('hidden')) return;
        var v = el.dayRows.querySelector('.dayRankV');
        if (v) v.textContent = T('dayRank', { s: fs, r: info.me.rank });
      });
    }, 1500);
  }
  el.dayRows.innerHTML = PX(h);
  el.dayNext.classList.toggle('hidden', !L.next);
  if (L.next) el.dayNext.innerHTML = T('mktTomorrow') + '<br><small>' + T('mktExpect') + '</small>';
  el.dayGo.textContent = L.next ? T('goPrep') : T('goNextDay');
  el.dayScr.classList.remove('hidden');
  syncPause();
}
/* §4.2 Pazar sabahı hazırlığı — yalnız bu pazar için geçici hedef/öncelik */
function showPrepCard() {
  renderPrep();
  el.prepScr.classList.remove('hidden');
  syncPause();
}
/* v2.1: Pazar hazırlık ekranı — hedef stok düzenleme kalktı, artık tezgâh durumu gösterir */
function renderPrep() {
  var list = openCounters().filter(function (c) { return c.open && c.fish; });
  var tot = 0, cap = 0;
  for (var q = 0; q < list.length; q++) { tot += list[q].buffer.length; cap += counterMax(list[q]); }
  el.prepDepot.textContent = T('prepStock', { a: tot, b: cap, n: list.length });
  var h = '';
  for (var i2 = 0; i2 < list.length; i2++) {
    var c = list[i2], n = c.buffer.length, mx = counterMax(c);
    var pctv = Math.round(n / Math.max(1, mx) * 100);
    var col = pctv >= 60 ? 'p2' : pctv >= 25 ? 'p1' : 'p0';
    h += '<div class="trow"><div class="ic">' + FISH[c.fish].ic + '</div>' +
      '<div class="nm">' + NM(FISH[c.fish].n) + '<small>' + NM(AREAS[c.z].n) + '</small></div>' +
      '<div class="stp"><span class="tv">' + n + '/' + mx + '</span>' +
      '<span class="pz ' + col + '">' + pct(pctv) + '</span></div></div>';
  }
  el.prepRows.innerHTML = PX(h || '<div class="empty">' + T('noStall') + '</div>');
}

/* =========================================================
   v2.3 — AÇIK TEZGÂHLAR EKRANI
   İlk tezgâh sabit açık; ikinciden itibaren ücretsiz aç/kapat.
   Gün sonu kartından, alt bardan ve gün başında (yeni tezgâh varsa) açılır.
   ========================================================= */
function openStallCount() {
  var n = 0;
  for (var i = 0; i < counters.length; i++)
    if (counters[i].open && counters[i].fish && !AREAS[counters[i].z].locked) n++;
  return n;
}
function renderStallScreen() {
  var list = counters.filter(function (c) {
    return c.fish && !AREAS[c.z].locked && (isFirstStall(c) || (canProduce(c.fish) && canProcess('fileto', c.fish)));
  });
  var h = '';
  for (var i = 0; i < list.length; i++) {
    var c = list[i], first = isFirstStall(c);
    var yeni = !first && !c.seen && !c.open;
    h += '<div class="trow' + (yeni ? ' newish' : '') + '"><div class="ic">' + FISH[c.fish].ic + '</div>' +
      '<div class="nm">' + NM(FISH[c.fish].n) + (yeni ? ' <b style="color:var(--gold)">•</b>' : '') +
      '<small>' + NM(AREAS[c.z].n) + ' • ' + T('nowStock', { n: c.buffer.length }) + '</small></div>' +
      '<div class="stp"><button class="sw ' + (first ? 'lock' : (c.open ? 'on' : 'off')) + '" data-k="' + c.key + '"' +
      (first ? ' disabled' : '') + '>' + (first ? T('swFixed') : (c.open ? T('swOn') : T('swOff'))) + '</button></div></div>';
  }
  el.stallRows.innerHTML = PX(h || '<div class="empty">' + T('noStall') + '</div>');
  Array.prototype.forEach.call(el.stallRows.querySelectorAll('.sw:not([disabled])'), function (b) {
    b.onclick = function () {
      var c = counterByKey(b.dataset.k);
      if (!c) return;
      c.seen = true;
      toggleStall(c);
      sfx.sw(c.open);
      renderStallScreen();
    };
  });
}
function openStallScreen() {
  renderStallScreen();
  el.stallScr.classList.remove('hidden');
  syncPause();
}
function closeStallScreen() {
  markStallsSeen();
  el.stallScr.classList.add('hidden');
  save(); syncPause();
  if (barTab) renderBar();
}
function counterByKey(k) { for (var i = 0; i < counters.length; i++) if (counters[i].key === k) return counters[i]; return null; }

/* ---------- menü ---------- */
var curTab = 'liman';
function row(ic, title, sub, val, val2) {
  return '<div class="row"><div class="ic">' + ic + '</div><div class="tx">' + title +
    (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="vl">' + (val || '') +
    (val2 ? '<small>' + val2 + '</small>' : '') + '</div></div>';
}
function renderTab() {
  var h = '', i;
  if (curTab === 'liman') {
    var lvl = repLevel(), nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl] : null;
    h += row('⭐', repTitle(), nxt ? (T('mNext') + ': ' + NM(nxt.t) + ' - ' + nxt.need) : T('mMax'), S.rep + '*');
    h += row('💰', T('money'), T('mWage') + ': ' + money(wageTotal()) + perMin(), money(S.cash));
    for (i = 0; i < AREAS.length; i++) {
      var a = AREAS[i];
      h += row(a.locked ? '🔒' : '🏝️', NM(a.n),
        a.locked ? (money(a.cost) + ' + ' + a.rep + '*') : (T('level') + a.lvl + '/' + MAXLV),
        a.locked ? T('locked') : (a.lvl < MAXLV ? money(a.up[a.lvl]) : T('done')));
    }
    h += row('🏛️', NM(project.n), T('stage') + ' ' + project.stage + '/5',
      project.done ? T('done') : pct(Math.round(projPct() * 100)), project.done ? '' : money(project.total - project.inv));
    var used = SLOTS.filter(function (s) { return s.b && slotActive(s); }).length;
    var tot = SLOTS.filter(slotActive).length;
    h += row('🔨', T('mSlots'), T('mStaffCap') + ': ' + workers.length + '/' + staffCap(), used + '/' + tot);
    for (var zq = 0; zq < zoneCount(); zq++) {
      if (!zoneOpen(zq)) continue;
      var opn = counters.filter(function (c) { return c.open && c.fish && zoneOfFish(c.fish) === zq; }).length;
      var all = counters.filter(function (c) { return c.fish && !AREAS[c.z].locked && zoneOfFish(c.fish) === zq; }).length;
      h += row('🐟', NM(AREAS[zq].n), T('zoneStaffD', { a: zoneStaff(zq), b: zoneStaffCap(zq) }), opn + '/' + all);
    }
    h += row('🧾', T('mOrders'), T('mLost') + ': ' + S.lost + ' - ' + T('mCaught') + ': ' + S.caught, S.served + '');
    /* v0.4 — liman hizmet binaları genel bakış */
    for (i = 0; i < SERV.length; i++) {
      var sd2 = SERV[i], slv2 = sLvl(sd2.id);
      if (slv2 > 0) {
        h += row(sd2.icon, NM(sd2.n), NM(sd2.lv[slv2 - 1].d), 'Lv.' + slv2 + '/5',
          slv2 < 5 ? money(upCost(sCost(sd2.lv[slv2].c))) : T('maxLv'));
      } else {
        var wy = servLockReason(sd2);
        h += row('🔒', NM(sd2.n), wy || NM(sd2.r), T('locked'), wy ? '' : money(upCost(sCost(sd2.lv[0].c))));
      }
    }
  } else if (curTab === 'personel') {
    if (!workers.length) h += '<div class="empty">' + T('mNoStaff') + '</div>';
    for (i = 0; i < workers.length; i++) {
      var w = workers[i], Rl = ROLES[w.role];
      h += row(Rl.icon, w.name + ' - ' + NM(Rl.n),
        (w.zone >= 0 ? NM(AREAS[w.zone].n) : T('harborWide')) + (w.stall ? ' • ' + stallLabel(w.stall) : '') + ' • ' + NM(Rl.d),
        money(Rl.wage) + perMin(), T('carry') + ' ' + carryW(w) + '/' + Rl.cap);
    }
    for (i = 0; i < zoneCount(); i++) {
      if (!zoneOpen(i)) continue;
      h += row('👷', T('zoneStaff', { n: NM(AREAS[i].n) }), T('mZoneStaff'), zoneStaff(i) + '/' + zoneStaffCap(i));
    }
    if (workers.length) h += row('💸', T('mTotalWage'), '', money(wageTotal()) + perMin());
  } else if (curTab === 'urunler') {
    for (i = 0; i < LINES.length; i++) {
      var L = LINES[i], F = FISH[L.f];
      var open = fishReady(L.f);
      var why = !canSell(L.f) ? T('lineLocked', { s: stallName(L.stall) })
        : (!canProduce(L.f) ? T('lineLocked', { s: NM(AREAS[spots[L.src].z].n) }) : T('lineOpen'));
      h += row(open ? '🐟' : '🔒', (i + 1) + '. ' + NM(F.n) + (open ? '' : ' 🔒'),
        why + ' • ' + T('mWeight') + ' ' + F.w + ' • ' + T('mCut') + ' ' + F.cut.toFixed(2) + 's • ' + F.out + ' ' + T('mYield'),
        open ? money(prodValue('fileto', L.f)) : '—',
        open && canProcess('fume', L.f) ? T('mSmoked') + ' ' + money(prodValue('fume', L.f)) : '');
    }
  } else {
    h += row('🕹️', T('mCtrl'), T('ctrl'), '');
    h += row('🎣', T('mLoop'), T('mLoopE'), '');
    h += row('🔥', T('stSmoke'), T('mSmokeE'), '');
    h += row('⭐', T('rep'), T('mRepE'), '');
    h += row('🏗️', T('upArea'), T('mInvestE'), '');
  }
  el.tabBody.innerHTML = PX(h);
}
Array.prototype.forEach.call(document.querySelectorAll('#menuTabs .tab'), function (b) {
  b.onclick = function () {
    Array.prototype.forEach.call(document.querySelectorAll('#menuTabs .tab'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); curTab = b.dataset.t; renderTab();
  };
});
el.dpClose.onclick = closeBar;
el.menuBtn.onclick = function () { openPauseMenu(); };
el.closeMenu.onclick = function () { el.menuScreen.classList.add('hidden'); syncPause(); };
el.menuSet.onclick = function () { el.menuScreen.classList.add('hidden'); openSettings(true); };
el.menuSave.onclick = function () { manualSave(); };
/* v1.2 — gün özeti / pazar hazırlığı */
el.dayStalls.onclick = function () { openStallScreen(); };
el.stallGo.onclick = function () { closeStallScreen(); };
el.dayGo.onclick = function () {
  el.dayScr.classList.add('hidden');
  beginNextDay(false);
  if (day.phase !== 'prep') syncPause();
  sfx.buy();
};
el.prepGo.onclick = function () {
  el.prepScr.classList.add('hidden');
  day.phase = 'intro'; day.ph = 1.7;
  syncPause(); save(); sfx.market();
};

/* ---------- ayarlar ---------- */
function setLangTo(l) { lang = l; applyLang(); save(); }
Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button,#introLang button'), function (b) {
  b.onclick = function () { setLangTo(b.dataset.l); };
});
Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (b) {
  b.onclick = function () {
    volLvl = clamp(parseInt(b.dataset.s, 10) || 0, 0, 2);
    applyVolume(); ensureAudio();
    Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); save();
    if (volLvl) sfx.tap();                       /* seçilen seviyeyi hemen duy */
  };
});
Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (b) {
  b.onclick = function () {
    zoomLvl = parseInt(b.dataset.z, 10);
    Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); resize(); save();
  };
});
el.setBtn.onclick = function () { el.startScreen.classList.add('hidden'); openSettings(false); };
el.setClose.onclick = function () {
  var from = el.settingsScreen.dataset.from;
  el.settingsScreen.classList.add('hidden');
  if (!S.started) el.startScreen.classList.remove('hidden');
  else if (from === 'menu') el.menuScreen.classList.remove('hidden');
  syncPause();
};
el.saveBtn.onclick = function () { if (!S.started) { toast(T('noRun')); sfx.bad(); return; } manualSave(); };
el.saveQuitBtn.onclick = function () { if (!S.started) { toast(T('noRun')); sfx.bad(); return; } saveAndQuit(); };
/* ayarlar › bu slotu sil: oyundan çıkar, slotu siler, menüye döner */
el.resetBtn.onclick = function () {
  if (!curSlot) return;
  var n = curSlot;
  ask(T('delAsk', { n: n, c: S.company || T('slotEmpty2') }), T('delYes'), function () {
    if (S.started) { S.started = false; document.getElementById('hud').classList.add('hidden'); document.getElementById('objective').classList.add('hidden'); el.devbar.classList.add('hidden'); }
    el.settingsScreen.classList.add('hidden'); el.menuScreen.classList.add('hidden');
    deleteSlot(n); el.startScreen.classList.remove('hidden'); refreshSaveInfo(); syncPause(); musicPlay('menu');
    toast(T('slotDeleted', { n: n }));
  });
};
Array.prototype.forEach.call(document.querySelectorAll('#musSeg button'), function (b) {
  b.onclick = function () { setMusicEnabled(b.dataset.m === '1'); syncSettingsUI(); savePref(); sfx.tap(); };
});
function syncSettingsUI() {
  Array.prototype.forEach.call(document.querySelectorAll('#musSeg button'), function (o) { o.classList.toggle('on', (o.dataset.m === '1') === musicEnabled); });
  Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.toggle('on', parseInt(o.dataset.s, 10) === volLvl); });
  Array.prototype.forEach.call(document.querySelectorAll('#zoomSeg button'), function (o) { o.classList.toggle('on', parseInt(o.dataset.z, 10) === zoomLvl); });
}

/* =========================================================
   DÖNGÜ
   ========================================================= */
var last = 0, saveT = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  var dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  if (intro.on) { updateIntro(dt); return; }
  if (!S.started) { gameT += dt; updateFx(dt); render(); drawHeroPreview(gameT); return; }
  if (paused) { if (!document.hidden) render(); return; }   /* duraklatıldı: dünya tamamen donar */
  gameT += dt; S.play += dt;
  updatePlayer(dt);
  updateWorkers(dt);
  updateStations(dt);
  updateCustomers(dt);
  updateDay(dt);                    /* v1.2 — gün döngüsü + depo kilidi */
  updateEvents(dt);
  updateMarket(dt);
  updateTutorial();
  updateFx(dt);
  updateLevelUp(dt);
  updateCoach(dt);
  if (workers.length) S.cash = Math.max(0, S.cash - wageTotal() / 60 * dt);
  updateCamera(dt);
  syncHUD(dt);
  saveT += dt; if (saveT > 6) { saveT = 0; save(); }
  if (stallPrompt && !anyOverlay()) {        /* yeni tezgâh kuruldu: kararı hemen sor */
    stallPrompt = false;
    if (undecidedStalls().length) { openStallScreen(); sfx.cust(); }
  }
  render();
}
function start() {
  el.startScreen.classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('objective').classList.remove('hidden');
  el.devbar.classList.remove('hidden');
  S.started = true; paused = false; syncPause();
  ensureAudio(); applyVolume(); musicPlay('game');       /* oyunda müzik arkadan mırıldanır */
  logPlay();
}
/* OYNA: kayıt varsa devam; yoksa işletme adı → oyun. Adı olmayan eski kayıt önce ad sorar. */
el.playBtn.onclick = function () {
  var ls = lastSlot();
  if (!ls) { openSlots('new'); return; }
  if (curSlot !== ls) useSlot(ls);
  if (!S.company) { openNameScreen('legacy'); sfx.tap(); return; }
  start();
};
el.newBtn.onclick = function () { openSlots('new'); };
el.loadBtn.onclick = function () { openSlots('load'); };
el.slotBack.onclick = closeSlots;
el.nameBack.onclick = function () {
  el.nameScr.classList.add('hidden');
  if (nameMode === 'new') openHeroScreen(); else { el.startScreen.classList.remove('hidden'); refreshSaveInfo(); }
  sfx.tap();
};
el.heroGo.onclick = confirmHero;
el.heroBack.onclick = function () { el.heroScr.classList.add('hidden'); openSlots('new'); };
el.heroDice.onclick = function () { var nm = el.heroName.value; pendingHero = randomHero(); if (nm) pendingHero.n = nm; renderHeroRows(); sfx.pick(); };
el.heroNameDice.onclick = function () { el.heroName.value = pick(HERO_NAMES); sfx.pick(); };
el.heroName.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); confirmHero(); } });
el.askNo.onclick = function () { closeAsk(false); };
el.askYes.onclick = function () { closeAsk(true); };
el.storyBtn.onclick = function () { openIntro(null); };
el.boardBtn.onclick = function () { openBoard('start'); };
el.menuBoard.onclick = function () { openBoard('menu'); };
el.boardClose.onclick = closeBoard;
Array.prototype.forEach.call(el.dpSub.children, function (b) { b.onclick = function () { setBuildSub(b.dataset.s); }; });
el.nameGo.onclick = confirmName;
el.nameDice.onclick = function () { el.nameIn.value = randomCompany([el.nameIn.value]); syncNamePreview(); renderNameChips(); sfx.pick(); };
el.nameIn.addEventListener('input', syncNamePreview);
el.nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); confirmName(); } });
el.introScr.addEventListener('pointerdown', function (e) {
  if (e.target === el.introSkip || (e.target.closest && e.target.closest('#introLang'))) return;
  introAdvance();
});
el.introSkip.onclick = function (e) { e.stopPropagation(); ensureAudio(); sfx.tap(); closeIntro(); };
window.addEventListener('keydown', function (e) {
  if (!intro.on) return;
  if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeIntro(); return; }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); introAdvance(); }
});
window.addEventListener('resize', introResize);
/* ESC: oyunu duraklat / devam ettir */
window.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape' && e.key !== 'Esc') return;
  if (!S.started) return;
  if (!document.getElementById('officeScr').classList.contains('hidden')) return;
  if (!el.dayScr.classList.contains('hidden') || !el.prepScr.classList.contains('hidden')) return;  /* gün kartı kendi butonuyla kapanır */
  if (!el.stallScr.classList.contains('hidden')) { closeStallScreen(); return; }
  e.preventDefault();
  if (!el.boardScr.classList.contains('hidden')) { closeBoard(); return; }
  if (!el.settingsScreen.classList.contains('hidden')) { el.setClose.click(); return; }
  if (!el.menuScreen.classList.contains('hidden')) { el.closeMenu.click(); return; }
  openPauseMenu();
});
window.addEventListener('beforeunload', save);
var hiddenPause = false;
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { save(); hiddenPause = true; }
  else { hiddenPause = false; last = 0; }      /* geri dönünce dev bir dt birikmesin */
  syncPause();
});

var ECON = {
  dayLen: 300,            /* 1 Pazar Günü = 5 dk aktif oynanış (§4.1) */
  comm: 0.015,            /* alım/satım komisyonu (§4.4) */
  officeCost: 18000, officeRep: 40,
  licenseCost: 90000, licenseRep: 90,
  privScale: 0.25,        /* özel işletme fiyat ölçeği */
  dividendEvery: 4, dividendHealth: 55,
  maxActiveContracts: 3, offerPool: 6,
  normalBand: 0.18, bigBand: 0.28,
  takeoverPremium: 1.20, takeoverPremiumMax: 1.35,
  perkCap: { carry: 0.20, upcost: 0.20, speed: 0.20, value: 0.20, rate: 0.25 }
};
var SEC = {
  fleet:   { tr: 'Balıkçılık Filosu', en: 'Fishing Fleet' },
  log:     { tr: 'Liman Lojistiği', en: 'Port Logistics' },
  cold:    { tr: 'Depolama', en: 'Cold Storage' },
  proc:    { tr: 'İşleme', en: 'Processing' },
  yard:    { tr: 'Tersane', en: 'Shipyard' },
  resto:   { tr: 'Restoran Zinciri', en: 'Restaurants' },
  pack:    { tr: 'Paketleme', en: 'Packaging' },
  marine:  { tr: 'Deniz Nakliyatı', en: 'Marine Freight' },
  deep:    { tr: 'Açık Deniz', en: 'Deep Sea' },
  mach:    { tr: 'Endüstri Ekipmanı', en: 'Machinery' },
  whole:   { tr: 'Toptan Ticaret', en: 'Wholesale' },
  tour:    { tr: 'Kruvaziyer / Turizm', en: 'Tourism' }
};
/* §3 kurgusal şirket evreni + §9 perkler + §18.1 başlangıç değerleri */
var COMPANIES = [
  { id: 'kuzey', n: { tr: 'Kuzey Ağları A.Ş.', en: 'North Nets Co.' }, sec: 'fleet', risk: 72, price: 32, fl: 0.60, div: 0.25, col: '#2f6f9e',
    p5: { k: 'netstock', v: 1, t: { tr: 'Ağ stok +1', en: 'Net stock +1' } }, p15: { k: 'netrate', v: 0.08, t: { tr: 'Ağ üretimi +%8', en: 'Net output +8%' } },
    ctrl: { tr: 'Filo İskelesi', en: 'Fleet Pier' } },
  { id: 'mavihat', n: { tr: 'MaviHat Lojistik', en: 'BlueLine Logistics' }, sec: 'log', risk: 38, price: 48, fl: 0.55, div: 0.30, col: '#3f8fbf',
    p5: { k: 'wspeed', v: 0.05, t: { tr: 'Personel taşıma +%5', en: 'Staff speed +5%' } }, p15: { k: 'ctrslot', v: 1, t: { tr: 'Toplu teslim slotu +1', en: 'Bulk slot +1' } },
    ctrl: { tr: 'Yükleme Koridoru', en: 'Loading Corridor' } },
  { id: 'buzmar', n: { tr: 'BuzMar Soğuk Zincir', en: 'IceMar Cold Chain' }, sec: 'cold', risk: 30, price: 42, fl: 0.50, div: 0.35, col: '#58b7c9',
    p5: { k: 'stock', v: 10, t: { tr: 'Depo kapasitesi +10', en: 'Storage +10' } }, p15: { k: 'upcost', v: 0.10, t: { tr: 'Yükseltme -%10', en: 'Upgrades -10%' } },
    ctrl: { tr: 'Merkezi Depo', en: 'Central Depot' } },
  { id: 'okyanus', n: { tr: 'Okyanus Gıda', en: 'Ocean Foods' }, sec: 'proc', risk: 58, price: 65, fl: 0.55, div: 0.25, col: '#d98455',
    p5: { k: 'procspeed', v: 0.05, t: { tr: 'İşleme hızı +%5', en: 'Processing +5%' } }, p15: { k: 'value', v: 0.08, t: { tr: 'İşlenmiş ürün +%8', en: 'Processed value +8%' } },
    ctrl: { tr: 'İşleme Tesisi', en: 'Processing Plant' } },
  { id: 'tersane', n: { tr: 'Tersane 47', en: 'Shipyard 47' }, sec: 'yard', risk: 70, price: 95, fl: 0.40, div: 0.20, col: '#b8763a',
    p5: { k: 'upcost', v: 0.05, t: { tr: 'Yükseltme -%5', en: 'Upgrades -5%' } }, p15: { k: 'rate', v: 0.06, t: { tr: 'Ağ + işleme +%6', en: 'Nets + cutting +6%' } },
    ctrl: { tr: 'Büyük Tersane', en: 'Grand Shipyard' } },
  { id: 'kiyi', n: { tr: 'Kıyı Sofrası', en: 'Shore Table' }, sec: 'resto', risk: 50, price: 38, fl: 0.65, div: 0.30, col: '#c8553d',
    p5: { k: 'custval', v: 0.03, t: { tr: 'Müşteri harcaması +%3', en: 'Customer spend +3%' } }, p15: { k: 'premium', v: 0.08, t: { tr: 'Premium müşteri +%8', en: 'Premium customers +8%' } },
    ctrl: { tr: 'Restoran Meydanı', en: 'Restaurant Square' } },
  { id: 'atlas', n: { tr: 'Atlas Ambalaj', en: 'Atlas Packaging' }, sec: 'pack', risk: 32, price: 28, fl: 0.60, div: 0.30, col: '#8a7f5c',
    p5: { k: 'ctrcap', v: 5, t: { tr: 'Kontrat teslim kapasitesi +5', en: 'Contract capacity +5' } }, p15: { k: 'ctrmul', v: 0.05, t: { tr: 'Hacimli kontrat +%5', en: 'Bulk contracts +5%' } },
    ctrl: { tr: 'Paketleme Merkezi', en: 'Packaging Center' } },
  { id: 'marti', n: { tr: 'Martı Denizcilik', en: 'Gull Maritime' }, sec: 'marine', risk: 60, price: 72, fl: 0.50, div: 0.25, col: '#5f7f9c',
    p5: { k: 'flow', v: 0.05, t: { tr: 'Müşteri akışı +%5', en: 'Customer flow +5%' } }, p15: { k: 'ctrslot', v: 1, t: { tr: 'Gemi kontrat slotu +1', en: 'Ship contract slot +1' } },
    ctrl: { tr: 'Derin Su Rıhtımı', en: 'Deepwater Quay' } },
  { id: 'derinsu', n: { tr: 'DerinSu Avcılık', en: 'DeepBlue Fishing' }, sec: 'deep', risk: 85, price: 120, fl: 0.35, div: 0.15, col: '#1f4e6b',
    p5: { k: 'rare', v: 0.03, t: { tr: 'Nadir av şansı +%3', en: 'Rare catch +3%' } }, p15: { k: 'netrate', v: 0.10, t: { tr: 'Açık deniz ağları +%10', en: 'Deep sea nets +10%' } },
    ctrl: { tr: 'Açık Deniz Üssü', en: 'Deep Sea Base' } },
  { id: 'makina', n: { tr: 'Liman Makina', en: 'Port Machinery' }, sec: 'mach', risk: 48, price: 54, fl: 0.50, div: 0.25, col: '#8d8156',
    p5: { k: 'upcost', v: 0.04, t: { tr: 'Mekanik yükseltme -%4', en: 'Mech upgrades -4%' } }, p15: { k: 'upcost', v: 0.08, t: { tr: 'İstasyon yükseltme -%8', en: 'Station upgrades -8%' } },
    ctrl: { tr: 'Bakım Atölyesi', en: 'Maintenance Shop' } },
  { id: 'ada', n: { tr: 'Ada Pazarlama', en: 'Isle Trading' }, sec: 'whole', risk: 52, price: 44, fl: 0.60, div: 0.30, col: '#7b5ea7',
    p5: { k: 'flow', v: 0.05, t: { tr: 'Toptan müşteri +%5', en: 'Wholesale customers +5%' } }, p15: { k: 'ctrmul', v: 0.06, t: { tr: 'Büyük alıcı siparişleri', en: 'Big buyer orders' } },
    ctrl: { tr: 'Toptan Balık Hali', en: 'Wholesale Hall' } },
  { id: 'mercan', n: { tr: 'Mercan Turizm', en: 'Coral Tourism' }, sec: 'tour', risk: 68, price: 80, fl: 0.45, div: 0.20, col: '#d4a029',
    p5: { k: 'vip', v: 0.03, t: { tr: 'VIP müşteri +%3', en: 'VIP customers +3%' } }, p15: { k: 'custval', v: 0.06, t: { tr: 'Kruvaziyer dalgası +%6', en: 'Cruise wave +6%' } },
    ctrl: { tr: 'Turistik İskele', en: 'Tourist Pier' } }
];
/* §6 kontrat tipleri */
var CTYPES = [
  { id: 'std',  n: { tr: 'Standart Tedarik', en: 'Standard Supply' }, dur: [180, 360], mul: 1.25, rel: 3,  qty: [6, 12],  minRel: 0 },
  { id: 'rush', n: { tr: 'Acil Sipariş', en: 'Rush Order' },          dur: [60, 120],  mul: 1.60, rel: 4,  qty: [3, 6],   minRel: 20 },
  { id: 'bulk', n: { tr: 'Hacimli Sevkiyat', en: 'Bulk Shipment' },   dur: [360, 600], mul: 1.35, rel: 5,  qty: [16, 28], minRel: 20 },
  { id: 'frame',n: { tr: 'Çerçeve Anlaşma', en: 'Framework Deal' },   dur: [420, 600], mul: 1.50, rel: 10, qty: [10, 18], minRel: 40, parts: 3 },
  { id: 'spec', n: { tr: 'Özel Sipariş', en: 'Special Order' },       dur: [240, 480], mul: 1.80, rel: 6,  qty: [8, 14],  minRel: 60 },
  { id: 'excl', n: { tr: 'Münhasır Anlaşma', en: 'Exclusive Deal' },  dur: [600, 900], mul: 1.55, rel: 15, qty: [20, 34], minRel: 80 },
  { id: 'resc', n: { tr: 'Kurtarma Kontratı', en: 'Rescue Contract' },dur: [240, 420], mul: 1.70, rel: 12, qty: [10, 18], minRel: 20, rescue: true },
  { id: 'proj', n: { tr: 'Büyük Proje Tedariği', en: 'Project Supply' }, dur: [480, 720], mul: 1.65, rel: 20, qty: [24, 40], minRel: 60 }
];
/* §13 haber kütüphanesi (24 olay) */
var NEWS = [
  { id: 'bereket', sec: 'fleet', lo: 6, hi: 10, n: { tr: 'Bereketli Av Sezonu', en: 'Bountiful Season' } },
  { id: 'firtina', sec: 'fleet', lo: -14, hi: -8, n: { tr: 'Sert Fırtına', en: 'Heavy Storm' } },
  { id: 'filosip', sec: 'yard', lo: 8, hi: 12, n: { tr: 'Yeni Filo Siparişi', en: 'New Fleet Order' } },
  { id: 'parca', sec: 'yard', lo: -10, hi: -6, n: { tr: 'Motor Parça Sıkıntısı', en: 'Engine Part Shortage' } },
  { id: 'yogun', sec: 'log', lo: -9, hi: -5, n: { tr: 'Liman Yoğunluğu', en: 'Port Congestion' } },
  { id: 'depoac', sec: 'cold', lo: 5, hi: 9, n: { tr: 'Yeni Depo Açılışı', en: 'New Depot Opens' } },
  { id: 'depoar', sec: 'cold', lo: -12, hi: -8, n: { tr: 'Depo Arızası', en: 'Depot Breakdown' }, rescue: true },
  { id: 'restsz', sec: 'resto', lo: 6, hi: 11, n: { tr: 'Restoran Sezonu', en: 'Restaurant Season' } },
  { id: 'kruvaz', sec: 'tour', lo: 8, hi: 14, n: { tr: 'Kruvaziyer Dalgası', en: 'Cruise Wave' } },
  { id: 'sezson', sec: 'tour', lo: -12, hi: -7, n: { tr: 'Sezon Sonu', en: 'Season Ends' } },
  { id: 'toptan', sec: 'whole', lo: 7, hi: 12, n: { tr: 'Büyük Toptan Anlaşma', en: 'Big Wholesale Deal' } },
  { id: 'hammad', sec: 'pack', lo: -8, hi: -5, n: { tr: 'Hammadde Artışı', en: 'Raw Material Spike' } },
  { id: 'yenihat', sec: 'proc', lo: 6, hi: 10, n: { tr: 'Yeni İşleme Hattı', en: 'New Process Line' } },
  { id: 'iade', sec: 'proc', lo: -11, hi: -6, n: { tr: 'Ürün İadesi', en: 'Product Recall' }, rescue: true },
  { id: 'rota', sec: 'marine', lo: 5, hi: 9, n: { tr: 'Yeni Rota Açıldı', en: 'New Route Opened' } },
  { id: 'rotak', sec: 'marine', lo: -12, hi: -7, n: { tr: 'Rota Kesintisi', en: 'Route Disruption' } },
  { id: 'ihale', sec: 'mach', lo: 5, hi: 8, n: { tr: 'Bakım İhaleleri', en: 'Maintenance Tenders' } },
  { id: 'kurum', sec: null, lo: 4, hi: 10, n: { tr: 'Büyük Kurumsal Sipariş', en: 'Major Corporate Order' } },
  { id: 'yonetim', sec: null, lo: -4, hi: 6, n: { tr: 'Yönetim Değişimi', en: 'Management Change' } },
  { id: 'temar', sec: null, lo: 3, hi: 6, n: { tr: 'Temettü Artışı', en: 'Dividend Raise' } },
  { id: 'temkes', sec: null, lo: -9, hi: -5, n: { tr: 'Temettü Kesintisi', en: 'Dividend Cut' } },
  { id: 'sermay', sec: null, lo: -3, hi: 3, n: { tr: 'Sermaye Artırımı', en: 'Capital Raise' }, act: 'raise' },
  { id: 'gerial', sec: null, lo: 3, hi: 8, n: { tr: 'Geri Alım Programı', en: 'Buyback Program' }, act: 'buyback' },
  { id: 'ortak', sec: null, lo: 5, hi: 10, n: { tr: 'Stratejik Ortaklık', en: 'Strategic Partnership' } }
];
/* §16 satın alınabilir küçük işletmeler */
var PRIVS = [
  { id: 'buzdepo', n: { tr: 'Küçük Buz Deposu', en: 'Small Ice Depot' }, cost: 120000, inc: 350, b: { k: 'stock', v: 5, t: { tr: 'Depo +5', en: 'Storage +5' } } },
  { id: 'lokanta', n: { tr: 'Yerel Balık Lokantası', en: 'Local Fish Diner' }, cost: 180000, inc: 500, b: { k: 'premium', v: 0.02, t: { tr: 'Premium müşteri +%2', en: 'Premium +2%' } } },
  { id: 'filo', n: { tr: 'Mini Nakliye Filosu', en: 'Mini Freight Fleet' }, cost: 260000, inc: 700, b: { k: 'ctrtime', v: 0.10, t: { tr: 'Kontrat süresi +%10', en: 'Contract time +10%' } } },
  { id: 'paket', n: { tr: 'Paketleme Atölyesi', en: 'Packing Workshop' }, cost: 350000, inc: 900, b: { k: 'ctrmul', v: 0.03, t: { tr: 'Kontrat ödülü +%3', en: 'Contract reward +3%' } } },
  { id: 'hal', n: { tr: 'Kıyı Balık Hali', en: 'Shore Fish Hall' }, cost: 600000, inc: 1500, b: { k: 'flow', v: 0.08, t: { tr: 'Toptan müşteri +%8', en: 'Wholesale +8%' } } },
  { id: 'tersane2', n: { tr: 'Bölgesel Tersane', en: 'Regional Shipyard' }, cost: 950000, inc: 2200, b: { k: 'upcost', v: 0.05, t: { tr: 'Yükseltme -%5', en: 'Upgrades -5%' } } }
];
var HOLD_TIERS = [
  { v: 0, n: { tr: 'Yerel İşletme', en: 'Local Business' } },
  { v: 500000, n: { tr: 'Liman Grubu', en: 'Port Group' } },
  { v: 2000000, n: { tr: 'Denizcilik Grubu', en: 'Maritime Group' } },
  { v: 8000000, n: { tr: 'Bölgesel Holding', en: 'Regional Holding' } },
  { v: 25000000, n: { tr: 'Deniz İmparatorluğu', en: 'Sea Empire' } }
];



/* =========================================================
   PİYASA MOTORU (§4, §5, §10-§14, §21)
   ========================================================= */
var M = null;
function cdef(id) { for (var i = 0; i < COMPANIES.length; i++) if (COMPANIES[i].id === id) return COMPANIES[i]; return null; }
function cst(id) { for (var i = 0; i < M.co.length; i++) if (M.co[i].id === id) return M.co[i]; return null; }
function newMarket() {
  return {
    v: 1, day: 1, t: 0, cycle: 'normal', cycleLeft: 4, seed: (Math.random() * 4294967296) >>> 0,
    idx: 1000, prevIdx: 1000, news: [], mom: {},
    co: COMPANIES.map(function (c) {
      return { id: c.id, price: c.price, prev: c.price, hist: [c.price], health: 58 + (100 - c.risk) * 0.12,
        growth: 50, risk: c.risk, sent: 0, free: Math.round(10000 * c.fl), own: 0, rel: 0,
        div: 0, status: 'ok', ev: [], lockDay: -1, board: 0, listed: true, resc: 0 };
    }),
    offers: [], active: [], done: 0, failed: 0, divDay: 0,
    office: false, license: false, priv: [], privOffer: null, privDay: 5,
    boardQ: [], tut: 0, credit: 10, notif: []
  };
}
/* §21: tohum save'de tutulur; kapat-aç ile farklı sonuç üretilmez */
function srand() {
  M.seed = (M.seed + 0x6D2B79F5) | 0;
  var t = M.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function sr(a, b) { return a + srand() * (b - a); }
function sPick(arr) { return arr[Math.floor(srand() * arr.length)]; }

/* ---------- perkler (§9) ---------- */
var PERK_GROUP = { netrate: 'rate', rate: 'rate', procspeed: 'speed', wspeed: 'speed', upcost: 'upcost', value: 'value', custval: 'value' };
var _pkCache = {}, _pkT = -1;
function perkSum(key) {
  if (!M) return 0;
  if (_pkT !== gameT) { _pkCache = {}; _pkT = gameT; }
  if (_pkCache[key] !== undefined) return _pkCache[key];
  var v = 0, i;
  for (i = 0; i < M.co.length; i++) {
    var c = M.co[i], d = cdef(c.id), pct = c.own / 10000;
    if (pct >= 0.05 && d.p5.k === key) v += d.p5.v;
    if (pct >= 0.15 && d.p15.k === key) v += d.p15.v;
    if (pct >= 0.51) { if (d.p5.k === key) v += d.p5.v * 0.5; if (d.p15.k === key) v += d.p15.v * 0.5; }
  }
  for (i = 0; i < M.priv.length; i++) {
    var pd = PRIVS.filter(function (q) { return q.id === M.priv[i]; })[0];
    if (pd && pd.b.k === key) v += pd.b.v;
  }
  var g = PERK_GROUP[key];
  if (g && ECON.perkCap[g]) v = Math.min(v, ECON.perkCap[g]);
  _pkCache[key] = v;
  return v;
}
function ownPct(c) { return c.own / 10000; }
function portfolioValue() {
  if (!M) return 0;
  var v = 0;
  for (var i = 0; i < M.co.length; i++) v += M.co[i].own * M.co[i].price;
  return v;
}
function subsValue() {
  var v = 0;
  for (var i = 0; i < M.co.length; i++) if (ownPct(M.co[i]) >= 1) v += 10000 * M.co[i].price * 1.2;
  for (var j = 0; j < M.priv.length; j++) {
    var pd = PRIVS.filter(function (q) { return q.id === M.priv[j]; })[0];
    if (pd) v += pd.cost * ECON.privScale;
  }
  return v;
}
function harborValue() {
  var v = 0, i;
  for (i = 0; i < AREAS.length; i++) if (!AREAS[i].locked) v += AREAS[i].cost + (AREAS[i].lvl - 1) * 2000;
  for (i = 0; i < SLOTS.length; i++) if (SLOTS[i].b) v += bdef(SLOTS[i].b).cost;
  v += project.inv + (M && M.office ? ECON.officeCost : 0);
  return v;
}
function holdingValue() { return S.cash + harborValue() + portfolioValue() + subsValue(); }
function holdingTier() {
  var t = HOLD_TIERS[0], v = holdingValue();
  for (var i = 0; i < HOLD_TIERS.length; i++) if (v >= HOLD_TIERS[i].v) t = HOLD_TIERS[i];
  return t;
}

/* ---------- pazar günü ---------- */
function marketProgress() { return M ? clamp(M.t / ECON.dayLen, 0, 1) : 0; }
function updateMarket(dt) {
  if (!M || !M.office) return;
  M.t = day.t;                    /* v1.2: borsa günü = oyun günü, closeDay gün geçişinde */
  updateContracts(dt);
}
var CYCLES = ['expand', 'normal', 'slow', 'recover'];
var CYCLE_SEC = { expand: ['tour', 'resto', 'proc', 'log'], slow: ['tour', 'resto', 'whole'], recover: ['yard', 'mach', 'fleet'] };
function closeDay() {
  var i, c, d;
  M.day++;
  /* döngü (§12) */
  M.cycleLeft--;
  if (M.cycleLeft <= 0) { M.cycle = sPick(CYCLES); M.cycleLeft = Math.round(sr(3, 6)); }
  /* sektör momentumu */
  M.mom = {};
  var secs = Object.keys(SEC);
  M.mom[sPick(secs)] = sr(0.01, 0.05);
  M.mom[sPick(secs)] = -sr(0.01, 0.05);
  var cs = CYCLE_SEC[M.cycle];
  if (cs) for (i = 0; i < cs.length; i++) M.mom[cs[i]] = (M.mom[cs[i]] || 0) + (M.cycle === 'slow' ? -0.03 : 0.03);
  /* haberler (§13) */
  var nToday = srand() < 0.5 ? 1 : 2;
  var todays = [];
  for (i = 0; i < nToday; i++) {
    var ev = sPick(NEWS);
    var target = ev.sec ? M.co.filter(function (q) { return cdef(q.id).sec === ev.sec; }) : [sPick(M.co)];
    if (!target.length) continue;
    var imp = sr(ev.lo, ev.hi) / 100;
    for (var k = 0; k < target.length; k++) target[k].ev.push({ id: ev.id, imp: imp, left: srand() < 0.4 ? 2 : 1 });
    var tn = target.length === 1 ? NM(cdef(target[0].id).n) : NM(SEC[ev.sec]);
    todays.push({ d: M.day, t: NM(ev.n), w: tn, imp: imp, big: Math.abs(imp) > 0.11 });
    if (ev.act === 'raise') corpAction(target[0], 'raise');
    if (ev.act === 'buyback') corpAction(target[0], 'buyback');
    if (ev.rescue) target[0].resc = 3;
  }
  M.news = todays.concat(M.news).slice(0, 36);
  /* fiyat kapanışı (§23.1) */
  var capTot = 0, capPrev = 0, chs = [], chSum = 0;
  for (i = 0; i < M.co.length; i++) {
    c = M.co[i]; d = cdef(c.id);
    var sector = clamp(M.mom[d.sec] || 0, -0.05, 0.05);
    var health = ((c.health - 50) / 50) * 0.04;
    var evTot = 0;
    for (var e = c.ev.length - 1; e >= 0; e--) {
      evTot += c.ev[e].imp * (c.ev[e].left > 1 ? 1 : 0.6);
      c.ev[e].left--; if (c.ev[e].left <= 0) c.ev.splice(e, 1);
    }
    evTot = clamp(evTot, -0.12, 0.12);
    var pl = clamp(c.sent * 0.02, -0.02, 0.02);
    var noise = sr(-0.03, 0.03);
    var big = Math.abs(evTot) > 0.11;
    var ch = sector + health + evTot + pl + noise;
    chs.push({ c: c, ch: ch, big: big });
    chSum += ch;
  }
  /* piyasa nötrlemesi: ortalama sürüklenme kırpılır (endeks dengede kalır) */
  var avgCh = chSum / Math.max(1, chs.length);
  for (i = 0; i < chs.length; i++) {
    c = chs[i].c; d = cdef(c.id);
    var big = chs[i].big;
    var ch = chs[i].ch - avgCh;
    ch = clamp(ch, -(big ? ECON.bigBand : ECON.normalBand), (big ? ECON.bigBand : ECON.normalBand));
    var sector = clamp(M.mom[d.sec] || 0, -0.05, 0.05);
    var evTot = ch;
    c.prev = c.price;
    c.price = Math.max(8, Math.round(c.price * (1 + ch) * 100) / 100);
    c.hist.push(c.price); if (c.hist.length > 12) c.hist.shift();
    /* sağlık / büyüme / risk (§5) */
    c.health = clamp(c.health + (55 - c.health) * 0.06 + (sector + evTot) * 35 + c.sent * 2 + sr(-2, 2), 5, 100);
    c.growth = clamp(c.growth + (50 - c.growth) * 0.05 + (ch > 0 ? 2 : -2) + c.sent + sr(-3, 3), 0, 100);
    c.risk = clamp(d.risk + (100 - c.health) * 0.25 + sr(-4, 4), 5, 100);
    c.sent *= 0.5;
    c.status = c.health >= 75 && c.growth >= 60 ? 'strong' : c.health >= 45 ? 'ok' : c.health >= 25 ? 'press' : 'restr';
    if (c.status === 'restr' && c.resc <= 0) c.resc = 3;
    if (srand() < 0.08) corpAction(c, c.price > 500 ? 'split' : (c.health > 70 ? 'buyback' : 'raise'));
    capTot += c.price * 10000; capPrev += c.prev * 10000;
  }
  M.prevIdx = M.idx;
  M.idx = Math.round(M.idx * (capTot / Math.max(1, capPrev)));
  /* temettü (§10) */
  M.divDay++;
  if (M.divDay >= ECON.dividendEvery) {
    M.divDay = 0; payDividends();
  }
  /* pasif işletme geliri (§16) */
  var pinc = privIncome();
  if (pinc > 0) { S.cash += pinc; earn(pinc); notify(T('privIncome', { v: money(pinc) }), 'low'); }
  /* kurtarma penceresi */
  for (i = 0; i < M.co.length; i++) if (M.co[i].resc > 0) M.co[i].resc--;
  /* kontrat havuzu + özel işletme teklifi + yönetim kurulu */
  genOffers();
  if (M.privOffer) { M.privOffer.left--; if (M.privOffer.left <= 0) M.privOffer = null; }
  M.privDay--;
  if (M.privDay <= 0 && !M.privOffer) { newPrivOffer(); M.privDay = Math.round(sr(4, 7)); }
  for (i = 0; i < M.co.length; i++) {
    c = M.co[i];
    if (ownPct(c) >= 0.30) { c.board--; if (c.board <= 0) { c.board = 3; queueBoard(c); } }
  }
  var dch = M.idx - M.prevIdx;
  if (!document.getElementById('officeScr').classList.contains('hidden')) renderOffice();
  notify(T('mktClosed', { d: M.day, i: M.idx, c: (dch >= 0 ? '+' : '') + Math.round(dch / Math.max(1, M.prevIdx) * 1000) / 10 }), 'mid');
  save();
}
function corpAction(c, kind) {
  var d = cdef(c.id);
  if (kind === 'raise') {
    var add = Math.round(1000 * sr(0.5, 1.5));
    c.free += add; c.price = Math.max(8, Math.round(c.price * 0.97 * 100) / 100);
    c.health = clamp(c.health + 6, 0, 100);
    notify(T('corpRaise', { n: NM(d.n) }), 'low');
  } else if (kind === 'buyback') {
    var rm = Math.min(c.free - 500, Math.round(600 * sr(0.5, 1.5)));
    if (rm > 0) { c.free -= rm; c.price = Math.round(c.price * 1.04 * 100) / 100; notify(T('corpBuy', { n: NM(d.n) }), 'low'); }
  } else if (kind === 'split') {
    c.price = Math.round(c.price / 2 * 100) / 100; c.free *= 2; c.own *= 2;
    notify(T('corpSplit', { n: NM(d.n) }), 'low');
  }
}
function payDividends() {
  var tot = 0;
  for (var i = 0; i < M.co.length; i++) {
    var c = M.co[i], d = cdef(c.id);
    if (c.health < ECON.dividendHealth || c.status === 'press' || c.status === 'restr') continue;
    if (!c.own) continue;
    var pool = c.price * 10000 * 0.15 * d.div * (1 + (c.divBonus || 0));
    var pay = Math.round(pool * ownPct(c));
    if (pay > 0) { S.cash += pay; earn(pay); tot += pay; }
  }
  if (tot > 0) notify(T('divPaid', { v: money(tot) }), 'mid');
}
function newPrivOffer() {
  var owned = M.priv;
  var pool = PRIVS.filter(function (p) { return owned.indexOf(p.id) < 0 && p.cost * ECON.privScale <= Math.max(20000, holdingValue() * 0.8); });
  if (!pool.length) return;
  M.privOffer = { id: sPick(pool).id, left: 2 };
  notify(T('privOffer'), 'mid');
}
function queueBoard(c) {
  M.boardQ.push({ co: c.id, opts: ['cap', 'grow', 'cost', 'port', 'debt'].sort(function () { return srand() - 0.5; }).slice(0, 3) });
  notify(T('boardReady', { n: NM(cdef(c.id).n) }), 'mid');
}
function applyBoard(entry, opt) {
  var c = cst(entry.co), cost = Math.round(c.price * 10000 * 0.02);
  if (S.cash < cost) { toast(T('noMoney')); sfx.bad(); return false; }
  S.cash -= cost;
  if (opt === 'cap') { c.health = clamp(c.health + 5, 0, 100); }
  else if (opt === 'grow') { c.growth = clamp(c.growth + 12, 0, 100); c.risk = clamp(c.risk + 10, 0, 100); }
  else if (opt === 'cost') { c.divBonus = (c.divBonus || 0) + 0.10; c.health = clamp(c.health + 2, 0, 100); }
  else if (opt === 'port') { c.health = clamp(c.health + 3, 0, 100); S.rep += 3; }
  else { c.health = clamp(c.health + 10, 0, 100); c.risk = clamp(c.risk - 10, 0, 100); }
  M.boardQ.splice(M.boardQ.indexOf(entry), 1);
  sfx.buy(); save(); return true;
}
/* =========================================================
   KONTRATLAR (§6, §7)
   ========================================================= */
function ctype(id) { for (var i = 0; i < CTYPES.length; i++) if (CTYPES[i].id === id) return CTYPES[i]; return CTYPES[0]; }
function maxActive() { return ECON.maxActiveContracts + Math.round(perkSum('ctrslot')) + servEff('ctrslot'); }
function genOffers() {
  M.offers = M.offers.filter(function (o) { return o.day >= M.day - 1; });
  var prods = availableProducts();
  if (!prods.length) return;
  var tries = 0;
  while (M.offers.length < ECON.offerPool && tries++ < 40) {
    var c = sPick(M.co);
    if (!c.listed && ownPct(c) >= 1) continue;
    var types = CTYPES.filter(function (t) { return c.rel >= t.minRel && (!t.rescue || c.resc > 0); });
    if (!types.length) continue;
    var ty = sPick(types), p = sPick(prods);
    var need = Math.round(sr(ty.qty[0], ty.qty[1])) + Math.round(perkSum('ctrcap') * 0.4);
    var relMul = c.rel >= 95 ? 1.15 : c.rel >= 80 ? 1.10 : c.rel >= 60 ? 1.05 : 1;
    var rew = Math.round(need * prodValue(p.k, p.f) * ty.mul * relMul * (1 + perkSum('ctrmul') + servEff('ctrrew')) + need * 2);
    M.offers.push({ id: 'o' + M.day + '_' + Math.floor(srand() * 99999), co: c.id, ty: ty.id,
      k: p.k, f: p.f, need: need, dur: Math.round(sr(ty.dur[0], ty.dur[1]) * (1 + perkSum('ctrtime') + servEff('offer'))),
      rew: rew, rel: ty.rel, day: M.day });
  }
}
function acceptContract(o) {
  if (M.active.length >= maxActive()) { toast(T('ctrFull', { n: maxActive() })); sfx.bad(); return false; }
  var i = M.offers.indexOf(o);
  if (i >= 0) M.offers.splice(i, 1);
  M.active.push({ id: o.id, co: o.co, ty: o.ty, k: o.k, f: o.f, need: o.need, got: 0, rew: o.rew, rel: o.rel, left: o.dur, dur: o.dur });
  sfx.buy(); notify(T('ctrAccepted', { n: NM(cdef(o.co).n) }), 'low'); save();
  return true;
}
function updateContracts(dt) {
  for (var i = M.active.length - 1; i >= 0; i--) {
    var a = M.active[i];
    a.left -= dt;
    if (a.left <= 0) {
      var c = cst(a.co), ty = ctype(a.ty);
      c.rel = clamp(c.rel - (ty.id === 'rush' || ty.id === 'excl' ? 8 : 5), 0, 100);
      c.sent -= 0.5;
      M.active.splice(i, 1); M.failed++;
      notify(T('ctrFailed', { n: NM(cdef(a.co).n) }), 'mid'); sfx.bad(); save();
    }
  }
}
function contractWants(it) {
  for (var i = 0; i < M.active.length; i++) {
    var a = M.active[i];
    if (a.k === it.k && a.f === it.f && a.got < a.need) return a;
  }
  return null;
}
function iDeliverContract(a, dt) {
  if (!M || !M.office || !M.active.length) return false;
  var want = null, i;
  for (i = 0; i < a.carry.length; i++) {
    if (!isGoods(a.carry[i])) continue;
    var w = contractWants(a.carry[i]);
    if (w) { want = a.carry[i]; break; }
  }
  if (!want) return false;
  return tryTake(a, dt, function () {
    var ct = contractWants(want);
    var it = popCarry(a, function (q) { return q === want; });
    ct.got++;
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), office.x, office.y, 16, it, 0.26);
    sfx.drop();
    if (ct.got >= ct.need) completeContract(ct);
  });
}
function completeContract(ct) {
  var c = cst(ct.co), d = cdef(ct.co), ty = ctype(ct.ty);
  S.cash += ct.rew; earn(ct.rew); noteFishIncome(ct.rew * 0.5);
  c.rel = clamp(c.rel + ct.rel, 0, 100);
  c.sent += 0.2 + (ty.mul - 1) * 0.5;
  c.health = clamp(c.health + (ty.id === 'proj' || ty.id === 'frame' ? 3 : 1), 0, 100);
  if (ty.rescue) { c.health = clamp(c.health + 25, 0, 100); c.resc = 0; c.rel = clamp(c.rel + 3, 0, 100); }
  S.rep += 1;
  M.active.splice(M.active.indexOf(ct), 1); M.done++;
  addFloat(office.x, office.y - 0.5, '+' + money(ct.rew), '#ffe27a');
  notify(T('ctrDone', { n: NM(d.n), v: money(ct.rew) }), 'mid');
  sfx.coin(); checkRepLevel(); save();
}

/* =========================================================
   HİSSE İŞLEMLERİ (§4.4, §8, §22.6)
   ========================================================= */
function orderPremium(c, qty) {
  var pctF = qty / Math.max(1, c.free);
  if (pctF <= 0.01) return 0;
  if (pctF <= 0.02) return 0.03;
  if (pctF <= 0.03) return 0.06;
  if (pctF <= 0.04) return 0.10;
  if (pctF <= 0.05) return 0.15;
  return -1;
}
function buyCost(c, qty) {
  var pr = orderPremium(c, qty);
  if (pr < 0) return -1;
  return Math.round(c.price * qty * (1 + pr) * (1 + ECON.comm));
}
function buyShares(id, qty) {
  var c = cst(id);
  if (!c || !c.listed) return false;
  qty = Math.min(qty, c.free);
  if (qty <= 0) { toast(T('noShares')); sfx.bad(); return false; }
  if (ownPct(c) + qty / 10000 > 0.30 && !M.license) {
    var lim = Math.max(0, Math.floor(0.30 * 10000 - c.own));
    if (lim <= 0) { toast(T('need51')); sfx.bad(); return false; }
    qty = Math.min(qty, lim);
  }
  var cost = buyCost(c, qty);
  if (cost < 0) { toast(T('orderTooBig')); sfx.bad(); return false; }
  if (S.cash < cost) { toast(T('noMoney')); sfx.bad(); return false; }
  var before = ownPct(c);
  S.cash -= cost; c.free -= qty; c.own += qty; c.lockDay = M.day; c.inv = (c.inv || 0) + cost;
  checkThreshold(c, before);
  sfx.coin(); save(); return true;
}
function sellShares(id, qty) {
  var c = cst(id);
  if (!c || !c.own) return false;
  if (c.lockDay === M.day) { toast(T('sellLock')); sfx.bad(); return false; }
  qty = Math.min(qty, c.own);
  var gain = Math.round(c.price * qty * (1 - ECON.comm));
  var avg = c.inv ? c.inv / (c.own || 1) : c.price;
  c.own -= qty; c.free += qty; S.cash += gain; c.inv = Math.max(0, (c.inv || 0) - avg * qty);
  notify(T('sold', { v: money(gain) }), 'low');
  sfx.coin(); save(); return true;
}
var THRESH = [0.01, 0.05, 0.15, 0.30, 0.51, 1];
function checkThreshold(c, before) {
  var now = ownPct(c);
  for (var i = 0; i < THRESH.length; i++) {
    if (before < THRESH[i] && now >= THRESH[i]) {
      notify(T('threshold', { n: NM(cdef(c.id).n), p: Math.round(THRESH[i] * 100) }), 'mid');
      sfx.star();
      if (THRESH[i] >= 1) { c.listed = false; notify(T('subsidiary', { n: NM(cdef(c.id).n) }), 'high'); }
    }
  }
}
function takeoverPrice(c, target) {
  var need = Math.max(0, Math.round(target * 10000) - c.own);
  var prem = ECON.takeoverPremium + (c.health / 100) * (ECON.takeoverPremiumMax - ECON.takeoverPremium);
  return { need: need, cost: Math.round(need * c.price * prem), prem: prem };
}
function canTakeover(c) { return M.license && ownPct(c) >= 0.30 && c.rel >= 80 && c.listed; }
function doTakeover(id, target) {
  var c = cst(id);
  if (!canTakeover(c)) { sfx.bad(); return false; }
  var t = takeoverPrice(c, target);
  if (S.cash < t.cost) { toast(T('noMoney')); sfx.bad(); return false; }
  var before = ownPct(c);
  S.cash -= t.cost; c.own += t.need; c.free = Math.max(0, c.free - t.need); c.inv = (c.inv || 0) + t.cost;
  checkThreshold(c, before);
  sfx.build(); save(); return true;
}
function buyPrivate() {
  if (!M.privOffer) return false;
  var pd = PRIVS.filter(function (q) { return q.id === M.privOffer.id; })[0];
  var cost = Math.round(pd.cost * ECON.privScale);
  if (S.cash < cost) { toast(T('noMoney')); sfx.bad(); return false; }
  S.cash -= cost; M.priv.push(pd.id); M.privOffer = null;
  notify(T('privBought', { n: NM(pd.n) }), 'high'); sfx.build(); save(); return true;
}
function privIncome() {
  var v = 0;
  for (var i = 0; i < M.priv.length; i++) {
    var pd = PRIVS.filter(function (q) { return q.id === M.priv[i]; })[0];
    if (pd) v += pd.inc;
  }
  return v;
}
function notify(msg, lvl) {
  if (!M) return;
  M.notif.unshift({ m: msg, d: M.day }); if (M.notif.length > 20) M.notif.pop();
  if (lvl !== 'low') toast(msg);
}
/* =========================================================
   TİCARET OFİSİ ARAYÜZÜ (§19)
   ========================================================= */
function migrateMarket(d) {
  var base = newMarket();
  if (!d) return base;
  for (var k in base) if (d[k] !== undefined && k !== 'co') base[k] = d[k];
  if (d.co) base.co = base.co.map(function (c) {
    var old = null;
    for (var i = 0; i < d.co.length; i++) if (d.co[i].id === c.id) old = d.co[i];
    if (old) for (var kk in c) if (old[kk] !== undefined) c[kk] = old[kk];
    return c;
  });
  return base;
}
var ofTab = 'market', ofSel = null, ofRefresh = 1;
function openOffice() {
  if (!officeBuilt()) return;
  document.getElementById('officeScr').classList.remove('hidden');
  renderOffice();
}
function closeOffice() { document.getElementById('officeScr').classList.add('hidden'); }
function relLevel(rel) { return rel >= 95 ? 5 : rel >= 80 ? 4 : rel >= 60 ? 3 : rel >= 40 ? 2 : rel >= 20 ? 1 : 0; }
function statusName(st) { return T(st === 'strong' ? 'stStrong' : st === 'ok' ? 'stOk' : st === 'press' ? 'stPress' : 'stRestr'); }
function chgPct(c) { return c.prev ? ((c.price - c.prev) / c.prev) * 100 : 0; }
function chgCls(v) { return v > 0.05 ? 'up' : v < -0.05 ? 'dn' : 'fl'; }
function fmtPct(v) { return (v >= 0 ? '+' : '') + (Math.round(v * 10) / 10).toString().replace('.', ',') + '%'; }

function renderOffice() {
  if (!M) return;
  var body = document.getElementById('ofBody'), h = '';
  document.getElementById('ofDay').textContent = T('day') + ' ' + M.day + ' • ' + T('cy' + (M.cycle.charAt(0).toUpperCase() + M.cycle.slice(1)));
  document.getElementById('ofDayBar').style.width = (marketProgress() * 100) + '%';
  var i, c, d;
  if (ofTab === 'market') {
    var ich = M.prevIdx ? ((M.idx - M.prevIdx) / M.prevIdx) * 100 : 0;
    h += '<div class="crow" style="cursor:default"><div class="nm"><b>' + T('idx') + '</b><small>' + T('day') + ' ' + M.day + '</small></div>' +
      '<div class="pr">' + M.idx + '<small class="' + chgCls(ich) + '">' + fmtPct(ich) + '</small></div></div>';
    for (i = 0; i < M.co.length; i++) {
      c = M.co[i]; d = cdef(c.id);
      var ch = chgPct(c);
      h += '<div class="crow" data-c="' + c.id + '"><span class="sq" style="background:' + d.col + '"></span>' +
        '<div class="nm">' + NM(d.n) + '<small>' + NM(SEC[d.sec]) + (c.own ? ' • ' + T('own') + ' %' + (Math.round(ownPct(c) * 1000) / 10) : '') +
        (c.listed ? '' : ' • ' + T('subsV')) + '</small></div>' +
        '<div class="pr">' + money(c.price) + '<small class="' + chgCls(ch) + '">' + fmtPct(ch) + '</small></div></div>';
    }
  } else if (ofTab === 'co') {
    if (!ofSel) ofSel = M.co[0].id;
    c = cst(ofSel); d = cdef(ofSel);
    var ch2 = chgPct(c), mx = Math.max.apply(null, c.hist), mn = Math.min.apply(null, c.hist);
    h += '<div class="crow" style="cursor:default"><span class="sq" style="background:' + d.col + '"></span>' +
      '<div class="nm"><b>' + NM(d.n) + '</b><small>' + NM(SEC[d.sec]) + ' • ' + statusName(c.status) + '</small></div>' +
      '<div class="pr">' + money(c.price) + '<small class="' + chgCls(ch2) + '">' + fmtPct(ch2) + '</small></div></div>';
    if (c.hist.length > 2 && mx > mn) {
      h += '<div class="spark">';
      for (i = 0; i < c.hist.length; i++) h += '<i style="height:' + (8 + ((c.hist[i] - mn) / (mx - mn)) * 92) + '%"></i>';
      h += '</div>';
    }
    h += '<div class="stat">' +
      '<div>' + T('health') + '<b>' + Math.round(c.health) + '</b><span class="mbar"><i style="width:' + Math.round(c.health) + '%;background:#5fd37a"></i></span></div>' +
      '<div>' + T('growth') + '<b>' + Math.round(c.growth) + '</b><span class="mbar"><i style="width:' + Math.round(c.growth) + '%;background:#ffc94a"></i></span></div>' +
      '<div>' + T('risk') + '<b>' + Math.round(c.risk) + '</b><span class="mbar"><i style="width:' + Math.round(c.risk) + '%;background:#e5533d"></i></span></div></div>';
    h += '<div class="stat"><div>' + T('rel') + '<b>' + Math.round(c.rel) + '</b></div>' +
      '<div>' + T('own') + '<b>%' + (Math.round(ownPct(c) * 1000) / 10) + '</b></div>' +
      '<div>' + T('free') + '<b>' + c.free + '</b></div></div>';
    h += '<div class="note">' + T('relLv')[relLevel(c.rel)] + ' • %5: ' + NM(d.p5.t) + ' • %15: ' + NM(d.p15.t) +
      ' • %51: ' + NM(d.ctrl) + '</div>';
    if (c.listed) {
      h += '<div class="qrow">' +
        '<button class="b" data-b="1">' + T('buyB') + ' 1</button>' +
        '<button class="b" data-b="10">' + T('buyB') + ' 10</button>' +
        '<button class="b" data-b="100">' + T('buyB') + ' 100</button>' +
        '<button class="b" data-b="f5">' + T('buyB') + ' %5</button></div>';
      h += '<div class="qrow">' +
        '<button class="s" data-s="10">' + T('sellB') + ' 10</button>' +
        '<button class="s" data-s="100">' + T('sellB') + ' 100</button>' +
        '<button class="s" data-s="all">' + T('sellB') + ' ' + T('maxInvest') + '</button></div>';
      h += '<div class="note">' + T('commission') + ' %1,5 • ' + (c.lockDay === M.day ? T('sellLock') : '') + '</div>';
      if (canTakeover(c)) {
        var tk = takeoverPrice(c, 0.51), tk2 = takeoverPrice(c, 1);
        h += '<div class="qrow"><button data-t="51">' + T('takeover') + ' %51 — ' + money(tk.cost) + '</button>' +
          '<button data-t="100">' + T('takeover') + ' %100 — ' + money(tk2.cost) + '</button></div>';
      } else if (ownPct(c) >= 0.30) {
        h += '<div class="note">' + T('takeover') + ': ' + (M.license ? '' : T('license') + ' • ') + T('rel') + ' 80+</div>';
      }
    }
    var bq = null;
    for (i = 0; i < M.boardQ.length; i++) if (M.boardQ[i].co === c.id) bq = M.boardQ[i];
    if (bq) {
      h += '<div class="ctrc"><b>' + T('boardT') + '</b><small>' + money(Math.round(c.price * 10000 * 0.02)) + '</small><div class="qrow">';
      for (i = 0; i < bq.opts.length; i++) h += '<button data-bd="' + bq.opts[i] + '">' + T('b' + bq.opts[i].charAt(0).toUpperCase() + bq.opts[i].slice(1)) + '</button>';
      h += '</div></div>';
    }
    h += '<div class="qrow">';
    for (i = 0; i < M.co.length; i++) h += '<button data-sel="' + M.co[i].id + '" style="min-width:34px;font-size:10px;' +
      (M.co[i].id === ofSel ? 'border-color:#ffc94a' : '') + '">' + NM(cdef(M.co[i].id).n).slice(0, 4) + '</button>';
    h += '</div>';
  } else if (ofTab === 'ctr') {
    h += '<div class="note">' + T('deliverAt') + ' • ' + T('activeCtr') + ': ' + M.active.length + '/' + maxActive() + '</div>';
    for (i = 0; i < M.active.length; i++) {
      var a = M.active[i], ad = cdef(a.co);
      h += '<div class="ctrc"><b>' + NM(ad.n) + ' — ' + NM(ctype(a.ty).n) + '</b>' +
        '<small>' + prodName(a.k, a.f) + ' ' + a.got + '/' + a.need + ' • ' + money(a.rew) + ' • ' + Math.ceil(a.left) + 's</small>' +
        '<div class="pbar2"><i style="width:' + Math.round(a.got / a.need * 100) + '%"></i></div></div>';
    }
    if (!M.offers.length) h += '<div class="empty">' + T('noContract') + '</div>';
    for (i = 0; i < M.offers.length; i++) {
      var o = M.offers[i], od = cdef(o.co), oc = cst(o.co);
      h += '<div class="ctrc"><b>' + NM(od.n) + ' — ' + NM(ctype(o.ty).n) + '</b>' +
        '<small>' + prodName(o.k, o.f) + ' x' + o.need + ' • ' + Math.round(o.dur) + 's • +' + o.rel + ' ' + T('rel') +
        ' • ' + T('relLv')[relLevel(oc.rel)] + '</small>' +
        '<button class="go2" data-o="' + o.id + '">' + T('accept') + ' — ' + money(o.rew) + '</button></div>';
    }
  } else if (ofTab === 'port') {
    var tot = 0, inv = 0;
    for (i = 0; i < M.co.length; i++) {
      c = M.co[i]; if (!c.own) continue;
      d = cdef(c.id);
      var val = c.own * c.price, avg = c.inv ? c.inv / c.own : c.price;
      tot += val; inv += c.inv || 0;
      var pl = ((c.price - avg) / avg) * 100;
      h += '<div class="crow" data-c="' + c.id + '"><span class="sq" style="background:' + d.col + '"></span>' +
        '<div class="nm">' + NM(d.n) + '<small>' + c.own + ' • ' + T('price') + ' ' + money(avg) + ' • %' + (Math.round(ownPct(c) * 1000) / 10) + '</small></div>' +
        '<div class="pr">' + money(val) + '<small class="' + chgCls(pl) + '">' + fmtPct(pl) + '</small></div></div>';
    }
    if (!tot) h += '<div class="empty">' + T('empty') + '</div>';
    h += '<div class="stat"><div>' + T('portV') + '<b>' + money(tot) + '</b></div>' +
      '<div>' + T('money') + '<b>' + money(S.cash) + '</b></div>' +
      '<div>' + T('privInc') + '<b>' + money(privIncome()) + '</b></div></div>';
  } else if (ofTab === 'news') {
    if (!M.news.length) h += '<div class="empty">' + T('noNews') + '</div>';
    for (i = 0; i < Math.min(M.news.length, 18); i++) {
      var nw = M.news[i];
      h += '<div class="newsr" style="border-color:' + (nw.imp >= 0 ? '#5fd37a' : '#e5533d') + '">' +
        '<b>' + nw.t + '</b> — ' + nw.w + ' <span class="' + chgCls(nw.imp * 100) + '">' + fmtPct(nw.imp * 100) + '</span>' +
        ' <small style="opacity:.6">' + T('day') + ' ' + nw.d + '</small></div>';
    }
  } else {
    var tier = holdingTier();
    h += '<div class="stat"><div>' + T('holdingV') + '<b>' + money(holdingValue()) + '</b></div>' +
      '<div>' + NM(tier.n) + '<b>&nbsp;</b></div></div>';
    h += '<div class="stat"><div>' + T('harborV') + '<b>' + money(harborValue()) + '</b></div>' +
      '<div>' + T('portV') + '<b>' + money(portfolioValue()) + '</b></div>' +
      '<div>' + T('subsV') + '<b>' + money(subsValue()) + '</b></div></div>';
    if (M.privOffer) {
      var pd = PRIVS.filter(function (q) { return q.id === M.privOffer.id; })[0];
      var pcost = Math.round(pd.cost * ECON.privScale);
      h += '<div class="ctrc"><b>' + NM(pd.n) + '</b><small>' + NM(pd.b.t) + ' • ' + money(pd.inc) + '/' + T('day') +
        ' • ' + T('offerLeft', { n: M.privOffer.left }) + '</small>' +
        '<button class="go2" data-p="1">' + T('buyPriv') + ' — ' + money(pcost) + '</button></div>';
    }
    for (i = 0; i < M.priv.length; i++) {
      var op = PRIVS.filter(function (q) { return q.id === M.priv[i]; })[0];
      h += '<div class="crow" style="cursor:default"><span class="sq" style="background:#5fd37a"></span>' +
        '<div class="nm">' + NM(op.n) + '<small>' + NM(op.b.t) + '</small></div><div class="pr">' + money(op.inc) + '</div></div>';
    }
    var subs = M.co.filter(function (q) { return ownPct(q) >= 0.51; });
    for (i = 0; i < subs.length; i++) {
      var sd = cdef(subs[i].id);
      h += '<div class="crow" style="cursor:default"><span class="sq" style="background:' + sd.col + '"></span>' +
        '<div class="nm">' + NM(sd.n) + '<small>' + NM(sd.ctrl) + ' • %' + (Math.round(ownPct(subs[i]) * 1000) / 10) + '</small></div></div>';
    }
    var pk = [];
    ['netrate', 'rate', 'stock', 'wspeed', 'procspeed', 'value', 'custval', 'flow', 'upcost', 'ctrmul', 'premium', 'vip', 'rare'].forEach(function (k) {
      var v = perkSum(k); if (v > 0.0001) pk.push(k + ' +' + (v < 1 ? Math.round(v * 100) + '%' : Math.round(v)));
    });
    h += '<div class="note">' + T('perks') + ': ' + (pk.length ? pk.join(' • ') : '—') + '</div>';
  }
  body.innerHTML = PX(h);
  /* olaylar */
  Array.prototype.forEach.call(body.querySelectorAll('.crow[data-c]'), function (r) {
    r.onclick = function () { ofSel = r.dataset.c; setOfTab('co'); };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-b]'), function (b) {
    b.onclick = function () {
      var c2 = cst(ofSel), q = b.dataset.b;
      var qty = q === 'f5' ? Math.max(1, Math.floor(c2.free * 0.05)) : parseInt(q, 10);
      buyShares(ofSel, qty); renderOffice();
    };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-s]'), function (b) {
    b.onclick = function () {
      var c2 = cst(ofSel), q = b.dataset.s;
      sellShares(ofSel, q === 'all' ? c2.own : parseInt(q, 10)); renderOffice();
    };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-t]'), function (b) {
    b.onclick = function () { doTakeover(ofSel, b.dataset.t === '51' ? 0.51 : 1); renderOffice(); };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-bd]'), function (b) {
    b.onclick = function () {
      for (var q = 0; q < M.boardQ.length; q++) if (M.boardQ[q].co === ofSel) { applyBoard(M.boardQ[q], b.dataset.bd); break; }
      renderOffice();
    };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-sel]'), function (b) {
    b.onclick = function () { ofSel = b.dataset.sel; renderOffice(); };
  });
  Array.prototype.forEach.call(body.querySelectorAll('[data-o]'), function (b) {
    b.onclick = function () {
      for (var q = 0; q < M.offers.length; q++) if (M.offers[q].id === b.dataset.o) { acceptContract(M.offers[q]); break; }
      renderOffice();
    };
  });
  var pb = body.querySelector('[data-p]');
  if (pb) pb.onclick = function () { buyPrivate(); renderOffice(); };
}
function setOfTab(t) {
  ofTab = t;
  Array.prototype.forEach.call(document.querySelectorAll('#ofTabs .tab'), function (b) { b.classList.toggle('on', b.dataset.t === t); });
  renderOffice();
}
Array.prototype.forEach.call(document.querySelectorAll('#ofTabs .tab'), function (b) {
  b.onclick = function () { setOfTab(b.dataset.t); };
});
document.getElementById('ofClose').onclick = closeOffice;
document.getElementById('tradeBtn').onclick = openOffice;
function syncTradeBtn() {
  var btn = document.getElementById('tradeBtn');
  var near = officeBuilt() && dist2(player.x, player.y, office.x, office.y) < 7 && !barTab;
  btn.classList.toggle('hidden', !near);
}
/* =========================================================
   v0.2 — GİRİŞ HİKÂYESİ (pixel gazete) • İŞLETME ADI • SKOR TABLOSU
   ========================================================= */

/* ---------- işletme adı ---------- */
function cleanName(s) {
  return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f<>`\\{}\[\]]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, 24);
}
/* Türkçe -ın/-in/-un/-ün eki (ünlü uyumu): Hasan'ın, Ayşe'nin, Dursun'un, Şükrü'nün */
function trGen(w) {
  var V = 'aeıioöuü', low = w.toLocaleLowerCase('tr'), v = 'e', i;
  for (i = low.length - 1; i >= 0; i--) if (V.indexOf(low[i]) >= 0) { v = low[i]; break; }
  var suf = { a: 'ın', 'ı': 'ın', e: 'in', i: 'in', o: 'un', u: 'un', 'ö': 'ün', 'ü': 'ün' }[v];
  if (V.indexOf(low[low.length - 1]) >= 0) suf = 'n' + suf;
  return w + "'" + suf;
}
var NAME_FIRST = ['Hasan', 'Özcan', 'Mehmet', 'Ayşe', 'Kemal', 'Recai', 'Temel', 'Dursun', 'İdris', 'Selim',
  'Zeynep', 'Elif', 'Yusuf', 'Rıza', 'Fadime', 'Hüseyin', 'Nuri', 'Şükrü', 'Hatice', 'Emine', 'Mustafa',
  'Cafer', 'Hamdi', 'Sevim', 'İsmail', 'Nazmi', 'Cemile', 'Erol', 'Bayram', 'Gülsüm'];
var NAME_FMT = ['{f} Balıkçılık', '{f} Mutfak', '{f} Balık Evi', '{g} Balık Evi', '{g} Mutfağı',
  '{f} Deniz Ürünleri', '{f} Balık Lokantası', '{f} & Oğulları', '{f} Kardeşler', '{f} Reis Balıkçılık',
  'Kaptan {f} Balıkçılık', '{g} Tezgâhı', '{f} Usta Balık Pazarı', '{f} Su Ürünleri', '{g} Sofrası'];
var NAME_FIX = ['Hamsi Keyfi', 'Martı Balıkçılık', 'Mavi Liman', 'Poyraz Balık', 'Yakamoz Balık Evi',
  'Nazar Balıkçılık', 'Karadeniz Sofrası', 'Lodos Su Ürünleri', 'İskele Başı', 'Ağ & Olta', 'Dalga Balıkçılık',
  'Palamut Durağı', 'Rıhtım Balık Evi', 'Uskumru Kardeşler', 'Yıldız Balık Evi', 'Kuzey Rüzgârı'];
function randomCompany(avoid) {
  for (var k = 0; k < 40; k++) {
    var n;
    if (Math.random() < 0.22) n = pick(NAME_FIX);
    else { var f = pick(NAME_FIRST); n = pick(NAME_FMT).replace('{f}', f).replace('{g}', trGen(f)); }
    if (n.length <= 24 && (!avoid || avoid.indexOf(n) < 0)) return n;
  }
  return 'Hasan Balıkçılık';
}
function fmtN(n) { return Math.round(n || 0).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'); }
function escH(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function newRunId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ---------- SKOR TABLOSU ----------
   Skor = ağlardan çıkan toplam balık (S.caught). Kasaya giren toplam para (S.earned)
   tabloda ikincil bilgi olarak durur. Tablo kayıttan AYRI anahtarda tutulur:
   "Yeni Oyun" kaydı siler ama tabloyu silmez. Depolama tek arayüzden geçer (Board.fetch /
   Board.submit) — paylaşımlı bir sunucuya geçerken yalnız burası değişir. */
var BOARD_KEY = 'balikci_board_v2', BOARD_MAX = 50, BOARD_SHOW = 20;
/* herkese açık tablo: config.js içindeki Supabase adresi/anahtarı. Yoksa (ör. claude.ai
   önizlemesi) tablo cihaz içi çalışır; bağlantı koparsa da cihaz içine düşer. */
var ONLINE = (function () {
  var c = window.BT_ONLINE;
  return c && /^https?:\/\//.test(c.url || '') && c.key ? { url: c.url.replace(/\/+$/, ''), key: c.key } : null;
})();
/* kalıcı anonim oyuncu kimliği — "kaç kişi oynadı" sayımı için; Yeni Oyun'da silinmez */
var PLAYER_ID = (function () {
  var k = 'balikci_pid', v = null;
  v = Store.get(k);
  if (!v || v.length < 6) { v = 'p' + newRunId(); Store.set(k, v); }
  return v;
})();
function rpc(name, args) {
  return fetch(ONLINE.url + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: { apikey: ONLINE.key, Authorization: 'Bearer ' + ONLINE.key, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
}
var Board = {
  online: !!ONLINE,
  read: function () {
    try {
      var a = JSON.parse(Store.get(BOARD_KEY) || '[]');
      if (!Array.isArray(a)) return [];
      return a.filter(function (e) { return e && typeof e.id === 'string' && typeof e.n === 'string' && isFinite(e.s); });
    } catch (e) { return []; }
  },
  write: function (a) { Store.set(BOARD_KEY, JSON.stringify(a)); },
  sort: function (a) { return a.sort(function (x, y) { return y.s - x.s || x.at - y.at; }); },
  /* cb(liste, bilgi) — bilgi: {src:'local'|'online'|'offline', me:{rank,...}, stats:{players,plays,runs}} */
  fetch: function (cb) {
    var local = Board.sort(Board.read());
    if (!ONLINE) { cb(local, { src: 'local' }); return; }
    rpc('bt_board', { p_run: S.runId || '' }).then(function (d) {
      cb(d.top || [], { src: 'online', me: d.me, stats: d.stats });
    }, function () { cb(local, { src: 'offline' }); });
  },
  submit: function (e) {
    var a = Board.read(), f = null;
    for (var i = 0; i < a.length; i++) if (a[i].id === e.id) { f = a[i]; break; }
    if (f) { f.n = e.n; f.s = Math.max(f.s, e.s); f.m = Math.max(f.m || 0, e.m); f.d = Math.max(f.d || 1, e.d); f.at = e.at; }
    else a.push(e);
    a = Board.sort(a);
    if (a.length > BOARD_MAX) a = a.slice(0, BOARD_MAX);
    Board.write(a);
  }
};
/* çevrimiçi gönderim seyreltilir (en sık 30 sn); gün sonu / kaydet-çık "force" ile gider.
   Sunucu çok sık gelen isteği reddederse bir sonraki fırsatta yeniden denenir. */
var netSent = { at: 0, s: -1, busy: false, dirty: false };
function submitScore(force) {
  if (!S.company || !S.runId) return;
  var e = { id: S.runId, n: S.company, s: S.caught, m: Math.round(S.earned), d: day.n, at: Date.now() };
  Board.submit(e);
  if (!ONLINE) return;
  var now = Date.now();
  if (netSent.busy) { netSent.dirty = true; return; }
  if (!force && now - netSent.at < 30000) return;
  if (!force && e.s === netSent.s && !netSent.dirty) return;
  netSent.busy = true; netSent.dirty = false;
  rpc('bt_submit', { p_run: e.id, p_player: PLAYER_ID, p_company: e.n, p_fish: e.s, p_money: e.m,
    p_day: e.d, p_play: Math.round(S.play || 0) }).then(function (r) {
    netSent.busy = false;
    if (r === 'ok') { netSent.at = Date.now(); netSent.s = e.s; }
    else if (r === 'too_fast') netSent.dirty = true;
  }, function () { netSent.busy = false; netSent.dirty = true; netSent.at = Date.now(); });
}
/* her oturum açılışında bir kez: oyuncu + oyun sayacı */
var playLogged = false;
function logPlay() {
  if (!ONLINE || playLogged) return;
  playLogged = true;
  rpc('bt_play', { p_player: PLAYER_ID, p_run: S.runId || '', p_lang: lang }).then(function () { }, function () { });
}
function myRank(list) {
  for (var i = 0; i < list.length; i++) if (list[i].id === S.runId) return i + 1;
  return 0;
}
function boardRow(e, i, mine) {
  var medal = i < 3 ? ' m' + (i + 1) : '';
  return '<div class="brow' + medal + (mine ? ' me' : '') + '"><span class="rk">' + (i + 1) + '</span>' +
    '<span class="bn">' + escH(e.n) + (mine ? ' <em>' + T('boardYou') + '</em>' : '') +
    '<small>' + T('boardDay', { d: e.d || 1 }) + ' • ' + money(e.m || 0) + '</small></span>' +
    '<span class="bs">' + T('fishN', { n: fmtN(e.s) }) + '</span></div>';
}
var boardReq = 0;
function renderBoard() {
  var req = ++boardReq;
  if (ONLINE) { el.boardRows.innerHTML = '<div class="empty">' + T('boardLoading') + '</div>'; el.boardNote.textContent = ''; }
  Board.fetch(function (list, info) {
    if (req !== boardReq) return;                       /* eski cevap geç geldiyse yok say */
    var h = '', me = myRank(list) - 1, i;
    if (!list.length) h = '<div class="empty">' + T('boardEmpty') + '</div>';
    for (i = 0; i < Math.min(BOARD_SHOW, list.length); i++) h += boardRow(list[i], i, i === me);
    if (info.src === 'online' && info.me && me < 0) {
      h += '<div class="bsep">• • •</div>' + boardRow(info.me, info.me.rank - 1, true);
    } else if (me >= BOARD_SHOW) h += '<div class="bsep">• • •</div>' + boardRow(list[me], me, true);
    el.boardRows.innerHTML = h;
    el.boardNote.textContent = info.src === 'online'
      ? T('boardStats', { p: fmtN(info.stats && info.stats.players), g: fmtN(info.stats && info.stats.plays) })
      : T(info.src === 'offline' ? 'boardOffline' : 'boardLocal');
  });
}
function openBoard(from) {
  if (S.started) submitScore();
  el.boardScr.dataset.from = from || 'start';
  el.startScreen.classList.add('hidden');
  el.menuScreen.classList.add('hidden');
  renderBoard();
  el.boardScr.classList.remove('hidden');
  syncPause(); sfx.tap();
}
function closeBoard() {
  var from = el.boardScr.dataset.from;
  el.boardScr.classList.add('hidden');
  if (from === 'menu' && S.started) openPauseMenu();
  else if (!S.started) el.startScreen.classList.remove('hidden');
  syncPause();
}

/* ---------- v0.5 — KARAKTER OLUŞTURMA ---------- */
var HERO_OPT = {
  hs: { tr: ['Kısa', 'Dalgalı', 'Uzun', 'At kuyruğu', 'Kel'], en: ['Short', 'Wavy', 'Long', 'Ponytail', 'Bald'] },
  hc: ['#1d1713', '#3d2a1a', '#6b3f22', '#a4471f', '#c9a45a', '#9a9a96'],
  sk: [0, 1, 2, 3],
  hw: { tr: ['Yok', 'Kasket', 'Yazma', 'Balıkçı beresi'], en: ['None', 'Flat cap', 'Headscarf', 'Fisher beanie'] },
  fc: { tr: ['Yok', 'Bıyık', 'Sakal'], en: ['None', 'Moustache', 'Beard'] },
  co: ['#1f4e6b', '#7a2b2b', '#2f5a3a', '#4a5058', '#5a3f7a'],
  ap: ['#c9782f', '#b3422f', '#4f8f5a', '#3f6fb0', '#d9a441']
};
var HERO_ROWS = ['hs', 'hc', 'sk', 'hw', 'fc', 'co', 'ap'];
var HERO_NAMES = ['Hasan', 'Recai', 'Temel', 'Dursun', 'Ayşe', 'Fadime', 'Zeynep', 'Kemal', 'İdris', 'Hatice', 'Selim', 'Emine', 'Yusuf', 'Rıza', 'Elif', 'Cafer'];
function heroCount(k) { var v = HERO_OPT[k]; return Array.isArray(v) ? v.length : v.tr.length; }
function randomHero() {
  var h = { n: pick(HERO_NAMES) };
  HERO_ROWS.forEach(function (k) { h[k] = irnd(0, heroCount(k) - 1); });
  return h;
}
function cleanHero(h) {
  if (!h || typeof h !== 'object') return null;
  var o = { n: String(h.n == null ? '' : h.n).replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f<>`\\{}\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16) };
  HERO_ROWS.forEach(function (k) { var v = parseInt(h[k], 10); o[k] = isNaN(v) ? 0 : clamp(v, 0, heroCount(k) - 1); });
  return o;
}
/* kahramanın kıyafeti: drawPerson'a verilen tanım */
function heroOutfit(h, face) {
  h = h || { hs: 0, hc: 0, sk: 0, hw: 1, fc: 1, co: 0, ap: 0 };
  var coat = HERO_OPT.co[h.co] || '#1f4e6b', o = {
    coat: coat, coat2: shade(coat, 22), knit: shade(coat, 60),
    apron: HERO_OPT.ap[h.ap], skin: PAL.skin[h.sk] || PAL.skin[0], hair: HERO_OPT.hc[h.hc],
    hairStyle: h.hs, boot: '#16222b', bootTop: '#2f4450', pants: '#2b3a45', face: face
  };
  if (h.hw === 1) o.cap = '#14364a';
  else if (h.hw === 2) o.scarf = '#b3422f';
  else if (h.hw === 3) o.beanie = '#8d3423';
  if (h.fc === 1) o.must = true; else if (h.fc === 2) o.beard = true;
  return o;
}
var pendingHero = null, heroFace = 1;
function heroLabel(k, v) {
  var o = HERO_OPT[k];
  if (Array.isArray(o)) return k === 'sk' ? '' : '';
  return (o[lang] || o.tr)[v];
}
function openHeroScreen() {
  pendingHero = pendingHero || randomHero();
  el.heroName.value = pendingHero.n;
  renderHeroRows();
  el.heroScr.classList.remove('hidden');
  el.heroCard.classList.remove('pop'); void el.heroCard.offsetWidth; el.heroCard.classList.add('pop');
}
function renderHeroRows() {
  var h = '';
  HERO_ROWS.forEach(function (k) {
    var v = pendingHero[k], o = HERO_OPT[k], val;
    if (k === 'sk') val = '<i class="swc" style="background:' + PAL.skin[v] + '"></i>';
    else if (Array.isArray(o)) val = '<i class="swc" style="background:' + o[v] + '"></i>';
    else val = escH((o[lang] || o.tr)[v]);
    h += '<div class="hrow"><span>' + T('hero_' + k) + '</span><button data-k="' + k + '" data-d="-1">‹</button>' +
      '<b>' + val + '</b><button data-k="' + k + '" data-d="1">›</button></div>';
  });
  el.heroRows.innerHTML = h;
  Array.prototype.forEach.call(el.heroRows.querySelectorAll('button'), function (b) {
    b.onclick = function () {
      var k = b.dataset.k, n = heroCount(k);
      pendingHero[k] = (pendingHero[k] + parseInt(b.dataset.d, 10) + n) % n;
      renderHeroRows(); sfx.pick();
    };
  });
}
function confirmHero() {
  var n = cleanHero({ n: el.heroName.value }).n;
  if (n.length < 2) {
    sfx.bad(); el.heroCard.classList.remove('shake'); void el.heroCard.offsetWidth; el.heroCard.classList.add('shake');
    el.heroName.focus(); return;
  }
  pendingHero.n = n;
  pendingHero = cleanHero(pendingHero);
  el.heroName.blur();
  el.heroScr.classList.add('hidden');
  openNameScreen('new');
  sfx.tap();
}
/* önizleme: iskele tahtası üstünde karakter, arada bir döner */
function drawHeroPreview(t) {
  if (el.heroScr.classList.contains('hidden') || !pendingHero) return;
  var cv = el.heroCv, g = cv.getContext('2d'), old = ctx;
  if (Math.floor(t / 1.6) % 2 !== (heroFace > 0 ? 0 : 1)) heroFace = -heroFace;
  ctx = g;
  try {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#16293a'; g.fillRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#7a5130' : '#8a5a33'; g.fillRect(0, 26 + i * 2, cv.width, 2); }
    g.fillStyle = '#5a3a22'; g.fillRect(0, 26, cv.width, 1);
    g.setTransform(1, 0, 0, 1, Math.round(cv.width / 2), 32);
    var a = { x: 0, y: 0, z: 0, vx: 0, vy: 0, bob: t * 6, act: 0, carry: [] };
    drawPerson(a, heroOutfit(pendingHero, heroFace));
  } catch (e) { }
  ctx = old;
}

/* ---------- İŞLETME ADI EKRANI ---------- */
var nameMode = 'new', pendingSlot = 0, introSeen = false;

/* ---------- oyun içi onay penceresi (confirm() kısıtlı iframe'de yok sayılıyordu) ---------- */
var askCb = null;
function ask(msg, yesLabel, cb) {
  askCb = cb;
  el.askMsg.textContent = msg;
  el.askYes.textContent = yesLabel || T('yes');
  el.askNo.textContent = T('cancel');
  el.askScr.classList.remove('hidden');
  sfx.tap();
}
function closeAsk(yes) {
  el.askScr.classList.add('hidden');
  var f = askCb; askCb = null;
  if (yes && f) f();
}

/* ---------- KAYIT SLOTLARI ekranı ---------- */
var slotMode = 'new';
function openSlots(mode) {
  slotMode = mode || 'new';
  el.startScreen.classList.add('hidden');
  renderSlots();
  el.slotScr.classList.remove('hidden');
  sfx.tap();
}
function closeSlots() {
  el.slotScr.classList.add('hidden');
  el.startScreen.classList.remove('hidden');
  refreshSaveInfo();
}
function beginNewInSlot(n) {
  pendingSlot = n; pendingHero = null;
  el.slotScr.classList.add('hidden');
  if (!introSeen) openIntro(function () { openHeroScreen(); });
  else openHeroScreen();
}
function renderSlots() {
  el.slotTitle.textContent = T(slotMode === 'new' ? 'slotTitleNew' : 'slotTitleLoad');
  el.slotSub.textContent = T(slotMode === 'new' ? 'slotSubNew' : 'slotSubLoad') + (Store.persistent ? '' : ' ' + T('noStorage'));
  var h = '';
  for (var i = 1; i <= SLOT_N; i++) {
    var d = readSlot(i), m = metaOf(d), btns = '';
    if (!m) btns = '<button class="sb go2" data-a="new" data-n="' + i + '">' + T('slotNew') + '</button>';
    else if (slotMode === 'new') btns = '<button class="sb warn" data-a="over" data-n="' + i + '">' + T('slotOver') + '</button>';
    else btns = '<button class="sb go2" data-a="load" data-n="' + i + '">' + T('slotLoad') + '</button>' +
      '<button class="sb del" data-a="del" data-n="' + i + '" title="' + T('slotDel') + '">🗑</button>';
    h += '<div class="slot' + (m ? '' : ' empty') + (i === curSlot && m ? ' cur' : '') + '">' +
      '<div class="sn">' + i + '</div><div class="si">' +
      (m ? '<b>' + escH(m.co || T('slotNoName')) + '</b><small>' + T('slotLine', { d: m.day, f: fmtN(m.fish), c: money(m.cash) }) +
           '</small><small>' + T('slotWhen', { t: agoStr(m.at), p: clockStr(m.play) }) + '</small>'
         : '<b>' + T('slotEmptyT') + '</b><small>' + T('slotEmptyS') + '</small>') +
      '</div><div class="sa">' + btns + '</div></div>';
  }
  el.slotRows.innerHTML = PX(h);
  Array.prototype.forEach.call(el.slotRows.querySelectorAll('.sb'), function (b) {
    b.onclick = function () {
      var n = parseInt(b.dataset.n, 10), a = b.dataset.a, m = saveMeta(n);
      if (a === 'new') beginNewInSlot(n);
      else if (a === 'over') ask(T('overAsk', { n: n, c: (m && m.co) || T('slotNoName') }), T('overYes'), function () { beginNewInSlot(n); });
      else if (a === 'load') {
        el.slotScr.classList.add('hidden');
        useSlot(n);
        if (!S.company) { openNameScreen('legacy'); return; }
        start(); toast(T('slotLoaded', { n: n, c: S.company }));
      } else if (a === 'del') ask(T('delAsk', { n: n, c: (m && m.co) || T('slotNoName') }), T('delYes'), function () {
        deleteSlot(n); renderSlots(); refreshSaveInfo(); toast(T('slotDeleted', { n: n }));
        if (!slotCount()) closeSlots();
      });
    };
  });
}
function nameIdeas(cur) {
  var a = [cur];
  for (var i = 0; i < 4; i++) a.push(randomCompany(a));
  return a.slice(1);
}
function renderNameChips() {
  var ideas = nameIdeas(el.nameIn.value);
  el.nameChips.innerHTML = ideas.map(function (n) { return '<button class="nchip">' + escH(n) + '</button>'; }).join('');
  Array.prototype.forEach.call(el.nameChips.querySelectorAll('.nchip'), function (b) {
    b.onclick = function () { el.nameIn.value = b.textContent; syncNamePreview(); sfx.pick(); };
  });
}
function syncNamePreview() {
  var n = cleanName(el.nameIn.value);
  el.nameSign.textContent = n || '· · ·';
  var ok = n.length >= 2;
  el.nameHint.textContent = ok ? (n.length + '/24') : T('nameShort');
  el.nameHint.classList.toggle('bad', !ok);
  el.nameGo.classList.toggle('dim', !ok);
}
function openNameScreen(mode) {
  nameMode = mode || 'new';
  el.startScreen.classList.add('hidden');
  el.nameIn.value = nameMode === 'new' ? randomCompany() : (S.company || randomCompany());
  syncNamePreview(); renderNameChips();
  el.nameScr.classList.remove('hidden');
  el.nameCard.classList.remove('pop'); void el.nameCard.offsetWidth; el.nameCard.classList.add('pop');
}
function confirmName() {
  var n = cleanName(el.nameIn.value);
  if (n.length < 2) {
    sfx.bad();
    el.nameCard.classList.remove('shake'); void el.nameCard.offsetWidth; el.nameCard.classList.add('shake');
    el.nameIn.focus();
    return;
  }
  el.nameIn.blur();
  if (nameMode === 'new') {                         /* seçilen slotta temiz bir oyun */
    resetWorld();
    curSlot = pendingSlot || curSlot || 1;
    S.runId = newRunId();
    S.hero = cleanHero(pendingHero || randomHero());
  }
  S.company = n;
  if (!S.runId) S.runId = newRunId();
  el.nameScr.classList.add('hidden');
  start();
  save();
  sfx.star();
  toast(S.hero ? T('welcomeHero', { h: S.hero.n, n: n }) : T('welcomeCo', { n: n }));
}

/* ---------- GİRİŞ HİKÂYESİ: dönen pixel gazete + alt yazı ----------
   Gazete 180×240 px'lik düşük çözünürlüklü bir tuvale çizilir, sahneye döndürülerek
   ölçeklenir (en yakın komşu → kırık pixel kenarlar). Yazılar eşiklenir: yumuşatma yok. */
var PAPER_W = 180, PAPER_H = 240, STAGE_W = 216, STAGE_H = 272;
var INTRO = [
  { art: 'pier', date: { tr: '3 NİSAN 1974', en: 'APRIL 3, 1974' },
    hl: { tr: 'KASABANIN İSKELESİ SESSİZLİĞE GÖMÜLDÜ', en: 'THE OLD TOWN PIER FALLS SILENT' },
    cap: { tr: '▲ Terk edilmiş iskele', en: '▲ The abandoned pier' },
    sub: { tr: 'Karadeniz kıyısında küçük bir kasaba... Dedemin iskelesi yıllardır sessizdi. Ağlar kurumuş, tezgâhlar boş kalmıştı.',
      en: 'A small town on the Black Sea... My grandfather\'s pier had been silent for years. The nets were dry, the stalls empty.' } },
  { art: 'school', date: { tr: '18 NİSAN 1974', en: 'APRIL 18, 1974' },
    hl: { tr: 'HAMSİ SÜRÜLERİ KOYA GERİ DÖNDÜ!', en: 'ANCHOVY SHOALS RETURN TO THE BAY!' },
    cap: { tr: '▲ Koyda hamsi bolluğu', en: '▲ Anchovy bonanza' },
    sub: { tr: 'Derken bir sabah manşetler çınladı: gümüş hamsi sürüleri koya geri dönmüştü!',
      en: 'Then one morning the headlines rang out: silver anchovy shoals were back in the bay!' } },
  { art: 'ad', date: { tr: '2 MAYIS 1974', en: 'MAY 2, 1974' },
    hl: { tr: 'LİMAN CESUR BİR BALIKÇI ARIYOR', en: 'HARBOR SEEKS A BRAVE FISHERMAN' },
    cap: { tr: '▲ Belediye ilanı', en: '▲ Town hall notice' },
    sub: { tr: 'Belediye ilan vermişti: eski iskeleyi yeniden canlandıracak cesur birini arıyorlardı.',
      en: 'Town hall had posted a notice: they were looking for someone brave enough to bring the old pier back to life.' } },
  { art: 'dawn', date: { tr: '9 MAYIS 1974', en: 'MAY 9, 1974' },
    hl: { tr: 'GENÇ BALIKÇI İŞİ DEVRALDI', en: 'YOUNG FISHER TAKES OVER THE PIER' },
    cap: { tr: '▲ Şafakta ilk ağ', en: '▲ First net at dawn' },
    sub: { tr: 'Cebimde birkaç kuruş, omzumda dedemin ağı... Şafak sökerken iskeleye geri döndüm.',
      en: 'A few coins in my pocket, grandpa\'s net on my shoulder... I walked back to the pier as dawn broke.' } },
  { art: 'harbor', date: { tr: 'YARIN', en: 'TOMORROW' },
    hl: { tr: 'BUGÜN KÜÇÜK BİR TEZGÂH, YARIN KOCA BİR LİMAN', en: 'A TINY STALL TODAY, A GRAND HARBOR TOMORROW' },
    cap: { tr: '▲ Hayal: koca bir liman', en: '▲ The dream: a grand harbor' },
    sub: { tr: 'Bugün küçük bir tezgâh. Yarın koca bir liman. Ama önce... tabelaya bir isim lazım.',
      en: 'A tiny stall today. A grand harbor tomorrow. But first... the sign needs a name.' } }
];
var intro = { on: false, gate: false, i: 0, t: 0, ph: 'in', out: 0, typed: 0, tick: 0, then: null, cv: null, g: null, pc: null, pg: null };

/* 5×7 bitmap yazı tipi — gazete için. Tarayıcı fontu küçük boyda eşiklenince harfler
   bozuluyordu (G→B, Ç→Q); bu yüzden her harf elle çizildi. Türkçe harfler temel harf +
   işaretten kurulur (İ Ö Ü Ğ Ç Ş Â). Küçük harfler büyüğe çevrilir. */
var GLY = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|#.#.#|#..##|#...#|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', '1': '.#.|##.|.#.|.#.|.#.|.#.|###',
  '2': '.###.|#...#|....#|...#.|..#..|.#...|#####', '3': '####.|....#|....#|.###.|....#|....#|####.',
  '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', '5': '#####|#....|####.|....#|....#|#...#|.###.',
  '6': '..##.|.#...|#....|####.|#...#|#...#|.###.', '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
  '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.', '9': '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', '!': '#|#|#|#|#|.|#', "'": '#|#|.|.|.|.|.',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', ':': '.|#|.|.|.|#|.', '-': '...|...|...|###|...|...|...',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', '▲': '.....|.....|..#..|.###.|#####|.....|.....',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....'
};
var GLY_MARK = { 'İ': ['I', 'dot'], 'Ö': ['O', 'uml'], 'Ü': ['U', 'uml'], 'Ğ': ['G', 'brv'], 'Ç': ['C', 'ced'], 'Ş': ['S', 'ced'], 'Â': ['A', 'crc'] };
var _gly = {};
function glyph(ch) {
  if (_gly[ch]) return _gly[ch];
  var base = ch, mark = null;
  if (GLY_MARK[ch]) { base = GLY_MARK[ch][0]; mark = GLY_MARK[ch][1]; }
  var src = GLY[base];
  if (!src) return null;
  var rows = src.split('|'), w = rows[0].length, px = [], x, y;
  for (y = 0; y < 7; y++) for (x = 0; x < w; x++) if (rows[y][x] === '#') px.push([x, y]);
  var c = Math.floor(w / 2);
  if (mark === 'dot') px.push([c, -2]);
  if (mark === 'uml') { px.push([1, -2]); px.push([w - 2, -2]); }
  if (mark === 'brv') { px.push([1, -2]); px.push([w - 2, -2]); px.push([2, -1]); }
  if (mark === 'crc') { px.push([c, -2]); px.push([c - 1, -1]); px.push([c + 1, -1]); }
  if (mark === 'ced') { px.push([c, 7]); px.push([c - 1, 8]); }
  _gly[ch] = { w: w, px: px };
  return _gly[ch];
}
/* yazı genişliği (piksel) — sx: yatay ölçek, bold: her pikseli bir sağa kalınlaştır */
function pxMeasure(str, sx, bold) {
  var w = 0, s = UP(str);
  for (var i = 0; i < s.length; i++) {
    var gl = s[i] === ' ' ? null : glyph(s[i]);
    w += ((gl ? gl.w : 3) + (bold ? 1 : 0) + 1) * sx;
  }
  return Math.max(0, w - sx);
}
function pxText(g, str, x, y, sx, sy, bold, color, align) {
  var s = UP(str), w = pxMeasure(s, sx, bold);
  var cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  g.fillStyle = color;
  for (var i = 0; i < s.length; i++) {
    var gl = s[i] === ' ' ? null : glyph(s[i]);
    if (gl) for (var k = 0; k < gl.px.length; k++) {
      var p = gl.px[k];
      g.fillRect(cx + p[0] * sx, Math.round(y) + p[1] * sy, sx * (bold ? 2 : 1), sy);
    }
    cx += ((gl ? gl.w : 3) + (bold ? 1 : 0) + 1) * sx;
  }
  return w;
}
function pxWrap(str, sx, bold, maxW) {
  var words = UP(str).split(' '), lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var t = cur ? cur + ' ' + words[i] : words[i];
    if (cur && pxMeasure(t, sx, bold) > maxW) { lines.push(cur); cur = words[i]; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
/* sabit tohumlu rastgele — sütun yazıları ve kâğıt lekeleri her karede aynı kalsın */
function seedRnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* baskı paleti: sepya tonlar (anlamsal anahtarlar → son sahnede renkli palet) */
var PAL_SEPIA = { sky: '#d9c9a3', sky2: '#5e4e38', sea: '#8f7a57', sea2: '#6b5a40', lite: '#efe4c9',
  wood: '#5a4731', wood2: '#3d3022', ink: '#2c231a', sun: '#f3e8cc', aw1: '#6b5a40', aw2: '#d9c9a3', gold: '#b9a171' };
var PAL_COLOR = { sky: '#ffcf8a', sky2: '#27466b', sea: '#2b7fa6', sea2: '#1d5f80', lite: '#fff4d6',
  wood: '#8a5a33', wood2: '#5a3a22', ink: '#1a1410', sun: '#ffe27a', aw1: '#c8553d', aw2: '#f4e9d2', gold: '#ffc94a' };

function artPier(g, P, t, W, H) {
  g.fillStyle = P.sky2; g.fillRect(0, 0, W, H);
  var r = seedRnd(7), i;
  for (i = 0; i < 26; i++) {                                    /* yıldızlar göz kırpar */
    var sx = Math.floor(r() * W), sy = Math.floor(r() * 50), ph = r() * 6;
    if (Math.sin(t * 2.2 + ph) > -0.3) { g.fillStyle = P.lite; g.fillRect(sx, sy, 1, 1); }
  }
  g.fillStyle = P.lite;                                          /* ay */
  for (i = -8; i <= 8; i++) { var w = Math.round(Math.sqrt(64 - i * i)); g.fillRect(128 - w, 18 + i, w * 2, 1); }
  g.fillStyle = P.sky2; for (i = -6; i <= 6; i++) { var w2 = Math.round(Math.sqrt(36 - i * i)); g.fillRect(132 - w2, 15 + i, w2 * 2, 1); }
  g.fillStyle = P.sea2; g.fillRect(0, 56, W, H - 56);            /* deniz */
  for (i = 0; i < 9; i++) {                                      /* ay yansıması */
    var ry = 60 + i * 3, rw = 12 - i + Math.round(Math.sin(t * 3 + i) * 2);
    g.fillStyle = P.lite; g.fillRect(126 - rw / 2 + Math.round(Math.sin(t * 2 + i) * 2), ry, rw, 1);
  }
  g.fillStyle = P.sea;
  for (i = 0; i < 14; i++) { var wx = ((i * 23 + t * 6) % (W + 20)) - 10, wy = 62 + (i * 7) % 28; g.fillRect(Math.round(wx), wy, 6, 1); }
  g.fillStyle = P.wood;  g.fillRect(0, 50, 92, 5);               /* iskele */
  g.fillStyle = P.wood2; g.fillRect(0, 55, 92, 1);
  for (i = 0; i < 92; i += 6) { g.fillStyle = P.wood2; g.fillRect(i, 50, 1, 5); }
  for (i = 4; i < 92; i += 16) { g.fillStyle = P.wood2; g.fillRect(i, 56, 3, 14); }
  g.fillStyle = P.ink; g.fillRect(70, 30, 2, 20); g.fillRect(66, 30, 10, 2);   /* söner fener */
  if (Math.sin(t * 7) > 0.6 || Math.sin(t * 1.3) > 0.2) { g.fillStyle = P.sun; g.fillRect(68, 32, 6, 3); }
  var by = 66 + Math.round(Math.sin(t * 1.6) * 1.2);             /* bağlı kayık */
  g.fillStyle = P.wood; g.fillRect(100, by, 26, 4); g.fillRect(102, by + 4, 22, 2);
  g.fillStyle = P.wood2; g.fillRect(100, by, 26, 1);
  g.fillStyle = P.ink; g.fillRect(92, 55, 1, 1); g.fillRect(93, 56, 3, 1); g.fillRect(96, 58, 4, 1); g.fillRect(100, 61, 1, by - 61);
  /* kurumuş ağ */
  g.fillStyle = P.sea;
  for (i = 0; i < 5; i++) { g.fillRect(20 + i * 4, 40, 1, 10); g.fillRect(18, 40 + i * 2, 20, 1); }
}
function artSchool(g, P, t, W, H) {
  g.fillStyle = P.sky; g.fillRect(0, 0, W, 34);
  g.fillStyle = P.sun; for (var i = -7; i <= 7; i++) { var w = Math.round(Math.sqrt(49 - i * i)); g.fillRect(24 - w, 14 + i, w * 2, 1); }
  g.fillStyle = P.sea2; g.fillRect(0, 34, W, H - 34);
  g.fillStyle = P.sea; for (i = 0; i < 6; i++) g.fillRect(0, 38 + i * 9, W, 2);
  var cx = 84, cy = 62, k;
  for (k = 0; k < 70; k++) {                                   /* dönen hamsi sürüsü */
    var a = k * 0.61 + t * (0.9 + (k % 5) * 0.05), rr = 10 + (k * 7) % 26;
    var fx = Math.round(cx + Math.cos(a) * rr * 1.6), fy = Math.round(cy + Math.sin(a) * rr * 0.55);
    var dir = -Math.sin(a) >= 0 ? 1 : -1;
    g.fillStyle = (k + Math.floor(t * 6)) % 7 === 0 ? P.lite : P.aw2;
    g.fillRect(fx, fy, 4, 1); g.fillStyle = P.sky; g.fillRect(dir > 0 ? fx + 4 : fx - 1, fy, 1, 1);
  }
  for (k = 0; k < 4; k++) {                                    /* sıçrayan balıklar */
    var ph = (t * 0.7 + k * 0.27) % 1, jx = 20 + k * 38 + ph * 18, jy = 36 - Math.sin(ph * Math.PI) * 18;
    if (ph < 0.95) { g.fillStyle = P.lite; g.fillRect(Math.round(jx), Math.round(jy), 4, 2); g.fillStyle = P.ink; g.fillRect(Math.round(jx) + 3, Math.round(jy), 1, 1); }
    if (ph > 0.9 || ph < 0.08) { g.fillStyle = P.lite; g.fillRect(Math.round(jx) - 2, 34, 1, 1); g.fillRect(Math.round(jx) + 5, 33, 1, 1); }
  }
  for (k = 0; k < 3; k++) {                                    /* martılar */
    var gx = Math.round((k * 60 + t * 14) % (W + 20)) - 10, gy = 8 + k * 6, f = Math.sin(t * 8 + k) > 0;
    g.fillStyle = P.ink;
    g.fillRect(gx, gy + (f ? 0 : 1), 3, 1); g.fillRect(gx + 3, gy + 1, 1, 1); g.fillRect(gx + 4, gy + (f ? 0 : 1), 3, 1);
  }
}
function artAd(g, P, t, W, H) {
  g.fillStyle = P.sky; g.fillRect(0, 0, W, H);                   /* tuğla duvar */
  var i, j;
  for (j = 0; j < H; j += 6) {
    g.fillStyle = P.sea; g.fillRect(0, j, W, 1);
    for (i = (j / 6) % 2 ? 0 : 7; i < W; i += 14) g.fillRect(i, j, 1, 6);
  }
  var px = 26, py = 8, pw = 114, ph = 76;
  g.fillStyle = P.ink; g.fillRect(px + 2, py + 2, pw, ph);         /* ilan kâğıdı */
  g.fillStyle = P.lite; g.fillRect(px, py, pw, ph);
  var flap = Math.round(Math.max(0, Math.sin(t * 2.4)) * 4);     /* rüzgârda köşe kalkar */
  g.fillStyle = P.sky; g.fillRect(px + pw - flap, py + ph - flap, flap, flap);
  g.fillStyle = P.aw2; for (i = 0; i < flap; i++) g.fillRect(px + pw - flap + i, py + ph - flap + (flap - 1 - i), i + 1, 1);
  g.fillStyle = P.ink; g.fillRect(px + 3, py + 3, pw - 6, 1); g.fillRect(px + 3, py + ph - 4, pw - 6, 1);
  pxText(g, lang === 'tr' ? 'İLAN' : 'NOTICE', px + pw / 2, py + 9, 2, 2, true, P.ink, 'center');
  pxText(g, lang === 'tr' ? 'BALIKÇI ARANIYOR!' : 'FISHER WANTED!', px + pw / 2, py + 28, 1, 1, false, P.aw1, 'center');
  g.fillStyle = P.sea;
  for (i = 0; i < 5; i++) g.fillRect(px + 10, py + 41 + i * 5, pw - 20 - (i === 4 ? 30 : (i * 7) % 12), 2);
  g.fillStyle = P.aw1; g.fillRect(px + 2, py + 1, 3, 3); g.fillRect(px + pw - 5, py + 1, 3, 3);   /* raptiye */
  /* mühür */
  g.fillStyle = P.aw1;
  for (i = -6; i <= 6; i++) { var w = Math.round(Math.sqrt(36 - i * i)); g.fillRect(px + pw - 20 - w, py + ph - 16 + i, w * 2, 1); }
  g.fillStyle = P.lite; g.fillRect(px + pw - 23, py + ph - 17, 6, 1); g.fillRect(px + pw - 21, py + ph - 19, 2, 5);
  /* ilanın üstündeki martı */
  var hop = Math.sin(t * 3) > 0.85 ? 1 : 0, mx = px + 12, my = py - 7 - hop;
  g.fillStyle = P.lite; g.fillRect(mx, my, 7, 4); g.fillRect(mx + 6, my - 3, 3, 3);
  g.fillStyle = P.sea2; g.fillRect(mx, my, 4, 2);
  g.fillStyle = P.gold; g.fillRect(mx + 9, my - 2, 2, 1); g.fillRect(mx + 2, my + 4, 1, 3); g.fillRect(mx + 5, my + 4, 1, 3);
  g.fillStyle = P.ink; g.fillRect(mx + 7, my - 2, 1, 1);
}
function artDawn(g, P, t, W, H) {
  var i, rise = Math.min(1, t / 6);
  g.fillStyle = P.sky; g.fillRect(0, 0, W, 50);
  g.fillStyle = P.aw2; for (i = 0; i < 50; i += 2) if (i > 30) g.fillRect(0, i, W, 1);
  var sy = 52 - Math.round(rise * 12);                         /* doğan güneş */
  g.fillStyle = P.sun;
  for (i = -14; i <= 0; i++) { var w = Math.round(Math.sqrt(196 - i * i)); g.fillRect(120 - w, sy + i, w * 2, 1); }
  for (i = 0; i < 8; i++) {                                     /* ışınlar */
    var a = Math.PI + (i + 0.5) * Math.PI / 8 + Math.sin(t) * 0.03;
    for (var d = 18; d < 30; d += 2) g.fillRect(Math.round(120 + Math.cos(a) * d), Math.round(sy + Math.sin(a) * d), 1, 1);
  }
  g.fillStyle = P.sea2; g.fillRect(0, 52, W, H - 52);
  for (i = 0; i < 10; i++) {                                    /* güneş yolu */
    var gw = 20 - i * 1.5 + Math.sin(t * 3 + i) * 3;
    g.fillStyle = P.sun; g.fillRect(Math.round(120 - gw / 2), 55 + i * 3, Math.round(gw), 1);
  }
  g.fillStyle = P.wood; g.fillRect(0, 60, 80, 5);                /* iskele */
  for (i = 4; i < 80; i += 14) { g.fillStyle = P.wood2; g.fillRect(i, 65, 3, 20); }
  /* balıkçı silueti: omzunda ağ, kıyıya doğru yürür */
  var bx = Math.round(10 + Math.min(1, t / 5) * 48), step = Math.floor(t * 4) % 2, by = 60;
  g.fillStyle = P.ink;
  g.fillRect(bx + 1, by - 22, 5, 5);                              /* baş */
  g.fillRect(bx, by - 24, 7, 2);                                  /* kasket */
  g.fillRect(bx, by - 17, 7, 9);                                  /* gövde */
  if (t < 5) { g.fillRect(bx + (step ? 0 : 1), by - 8, 2, 8); g.fillRect(bx + (step ? 5 : 4), by - 8, 2, 8); }
  else { g.fillRect(bx + 1, by - 8, 2, 8); g.fillRect(bx + 4, by - 8, 2, 8); }
  g.fillStyle = P.sea;                                             /* sırttaki ağ */
  for (i = 0; i < 4; i++) { g.fillRect(bx - 5, by - 18 + i * 3, 6, 1); g.fillRect(bx - 5 + i * 2, by - 19, 1, 11); }
  for (i = 0; i < 3; i++) {                                       /* martılar */
    var mx = Math.round((i * 50 + t * 10) % (W + 10)) - 5, my = 12 + i * 7, f = Math.sin(t * 7 + i) > 0;
    g.fillStyle = P.ink; g.fillRect(mx, my + (f ? 0 : 1), 3, 1); g.fillRect(mx + 3, my + 1, 1, 1); g.fillRect(mx + 4, my + (f ? 0 : 1), 3, 1);
  }
}
function artHarbor(g, P, t, W, H) {
  var i, r = seedRnd(31);
  g.fillStyle = P.sky; g.fillRect(0, 0, W, H);
  g.fillStyle = P.lite; for (i = 0; i < 3; i++) g.fillRect(Math.round((i * 70 + t * 5) % (W + 30)) - 20, 6 + i * 5, 18, 2);
  /* deniz feneri + dönen ışık */
  g.fillStyle = P.lite; g.fillRect(150, 18, 7, 34); g.fillStyle = P.aw1; g.fillRect(150, 26, 7, 4); g.fillRect(150, 38, 7, 4);
  g.fillStyle = P.ink; g.fillRect(149, 14, 9, 4);
  var beam = Math.sin(t * 2.2);
  g.fillStyle = P.sun;
  for (i = 1; i < 16; i++) g.fillRect(Math.round(153 + beam * i * 1.4), 15 - Math.floor(i / 5), 1, 2);
  /* şehir silueti */
  for (i = 0; i < 12; i++) {
    var bw = 8 + Math.floor(r() * 8), bh = 12 + Math.floor(r() * 26), bx = i * 12;
    g.fillStyle = i % 2 ? P.wood : P.wood2; g.fillRect(bx, 56 - bh, bw, bh);
    g.fillStyle = P.sun;
    for (var wy = 56 - bh + 3; wy < 52; wy += 5) for (var wx = bx + 2; wx < bx + bw - 2; wx += 3) if (r() > 0.45) g.fillRect(wx, wy, 1, 2);
  }
  /* kilim desenli pazar tentesi */
  for (i = 0; i < 5; i++) {
    var tx = 6 + i * 22;
    for (var s = 0; s < 18; s += 3) { g.fillStyle = (s / 3) % 2 ? P.aw2 : P.aw1; g.fillRect(tx + s, 52, 3, 5); }
    g.fillStyle = P.wood2; g.fillRect(tx, 57, 1, 6); g.fillRect(tx + 17, 57, 1, 6);
    g.fillStyle = P.gold; g.fillRect(tx + 3, 60, 12, 3);
  }
  g.fillStyle = P.wood; g.fillRect(0, 63, W, 3);                  /* rıhtım */
  g.fillStyle = P.sea2; g.fillRect(0, 66, W, H - 66);
  g.fillStyle = P.sea; for (i = 0; i < 10; i++) g.fillRect(Math.round((i * 19 + t * 8) % (W + 10)) - 5, 70 + (i * 5) % 20, 5, 1);
  /* gemiler salınır */
  for (i = 0; i < 2; i++) {
    var sx = 30 + i * 70, sy = 72 + Math.round(Math.sin(t * 1.5 + i * 2) * 1.2);
    g.fillStyle = P.aw1; g.fillRect(sx, sy, 34, 6); g.fillStyle = P.ink; g.fillRect(sx + 2, sy + 6, 30, 2);
    g.fillStyle = P.lite; g.fillRect(sx + 8, sy - 6, 14, 6); g.fillStyle = P.ink; g.fillRect(sx + 24, sy - 18, 1, 18);
    g.fillStyle = P.aw2; g.fillRect(sx + 25, sy - 18, 6, 4);
  }
}
var ARTS = { pier: artPier, school: artSchool, ad: artAd, dawn: artDawn, harbor: artHarbor };

function drawPaper(g, sc, idx, t) {
  var W = PAPER_W, H = PAPER_H, INK = '#2c231a', i, j;
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, W, H);
  var r = seedRnd(101);                                             /* eskimiş kâğıt lekeleri */
  for (i = 0; i < 160; i++) { g.fillStyle = r() > 0.5 ? '#ddd0b0' : '#efe5cc'; g.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1 + Math.floor(r() * 2), 1); }
  g.fillStyle = '#d3c39f'; g.fillRect(0, 0, W, 1); g.fillRect(0, H - 1, W, 1); g.fillRect(0, 0, 1, H); g.fillRect(W - 1, 0, 1, H);
  g.fillStyle = '#cbbb96'; g.fillRect(W / 2, 0, 1, H);             /* orta katlama izi */
  g.fillStyle = INK;
  g.fillRect(6, 5, W - 12, 1);
  pxText(g, lang === 'tr' ? 'LİMAN GAZETESİ' : 'HARBOR GAZETTE', W / 2, 13, 2, 2, false, INK, 'center');
  g.fillRect(6, 30, W - 12, 2); g.fillRect(6, 43, W - 12, 1);
  pxText(g, NM(sc.date), 8, 34, 1, 1, false, INK, 'left');
  pxText(g, lang === 'tr' ? '25 KURUŞ' : '25 CENTS', W - 8, 34, 1, 1, false, INK, 'right');
  /* manşet: dar ve uzun gazete harfi (yatay 1, dikey 2 kat) */
  var lines = pxWrap(NM(sc.hl), 1, true, W - 14), lh = lines.length > 2 ? 12 : 19, sy = lines.length > 2 ? 1 : 2;
  var hy = lines.length === 1 ? 58 : 50;
  for (i = 0; i < lines.length; i++) { pxText(g, lines[i], W / 2, hy, 1, sy, true, INK, 'center'); hy += lh; }
  /* resim kutusu */
  var ax = 7, ay = 90, aw = W - 14, ah = 84;
  g.save(); g.beginPath(); g.rect(ax, ay, aw, ah); g.clip(); g.translate(ax, ay);
  var art = ARTS[sc.art];
  art(g, PAL_SEPIA, t, aw, ah);
  if (sc.art === 'harbor') {                                      /* hayal sahnesi renge bürünür */
    var k = clamp((t - 1.2) / 2.2, 0, 1);
    if (k > 0) { g.globalAlpha = k; art(g, PAL_COLOR, t, aw, ah); g.globalAlpha = 1; }
  }
  g.restore();
  g.fillStyle = INK; g.fillRect(ax - 1, ay - 1, aw + 2, 1); g.fillRect(ax - 1, ay + ah, aw + 2, 1);
  g.fillRect(ax - 1, ay - 1, 1, ah + 2); g.fillRect(ax + aw, ay - 1, 1, ah + 2);
  pxText(g, NM(sc.cap), ax, ay + ah + 5, 1, 1, false, '#5a4a36', 'left');
  /* sahte sütun yazıları */
  var cy = ay + ah + 17, cw = Math.floor((W - 14 - 8) / 3), rr = seedRnd(11 + idx * 17);
  for (j = 0; j < 3; j++) {
    var cx = 7 + j * (cw + 4), yy = cy;
    g.fillStyle = INK; g.fillRect(cx, yy, Math.floor(cw * (0.55 + rr() * 0.4)), 3); yy += 6;
    while (yy < H - 6) {
      var par = rr() < 0.18, lw = par ? Math.floor(cw * (0.3 + rr() * 0.4)) : cw - Math.floor(rr() * 3);
      g.fillStyle = '#6f604b'; g.fillRect(cx, yy, lw, 1);
      yy += par ? 5 : 3;
    }
    if (j < 2) { g.fillStyle = '#b6a47f'; g.fillRect(cx + cw + 1, cy, 1, H - 6 - cy); }
  }
}

function introResize() {
  if (!intro.cv) return;
  var subH = Math.min(170, Math.max(120, innerHeight * 0.24));
  var aw = innerWidth - 24, ah = innerHeight - subH - 40;
  var sc = Math.min(aw / STAGE_W, ah / STAGE_H);
  if (sc >= 2) sc = Math.floor(sc);
  intro.cv.style.width = Math.round(STAGE_W * sc) + 'px';
  intro.cv.style.height = Math.round(STAGE_H * sc) + 'px';
}
function openIntro(then) {
  intro.then = then || null;
  intro.cv = el.introCv; intro.g = intro.cv.getContext('2d');
  intro.cv.width = STAGE_W; intro.cv.height = STAGE_H;
  if (!intro.pc) { intro.pc = document.createElement('canvas'); intro.pc.width = PAPER_W; intro.pc.height = PAPER_H; intro.pg = intro.pc.getContext('2d'); }
  el.startScreen.classList.add('hidden');
  el.introScr.classList.remove('hidden');
  el.introSkip.textContent = T('skip');
  el.introTap.textContent = T('tapStart');
  introResize();
  intro.on = true; intro.i = 0; intro.t = 0; intro.ph = 'gate'; intro.typed = 0;
  el.introSub.textContent = ''; el.introNext.classList.add('hidden');
  el.introGate.classList.remove('hidden');
  el.introScr.classList.add('gate');
  el.introDots.innerHTML = INTRO.map(function () { return '<i></i>'; }).join('');
  syncIntroDots();
}
function syncIntroDots() {
  Array.prototype.forEach.call(el.introDots.children, function (d, k) { d.className = k < intro.i ? 'd' : k === intro.i ? 'on' : ''; });
}
function introScene(i) {
  intro.i = i; intro.t = 0; intro.ph = 'in'; intro.typed = 0;
  el.introSub.textContent = ''; el.introNext.classList.add('hidden');
  syncIntroDots();
  noise(0.55, 0.13, { f: 500, to: 3600, q: 0.6, type: 'bandpass' });   /* vınn: dönen gazete */
}
function introAdvance() {
  if (!intro.on) return;
  ensureAudio();
  if (intro.ph === 'gate') { musicPlay('menu'); el.introGate.classList.add('hidden'); el.introScr.classList.remove('gate'); introScene(0); return; }
  var full = NM(INTRO[intro.i].sub);
  if (intro.ph === 'in') { intro.t = 0.95; return; }                   /* dönmeyi atla */
  if (intro.typed < full.length) { intro.typed = full.length; el.introSub.textContent = full; el.introNext.classList.remove('hidden'); return; }
  if (intro.ph === 'hold') { intro.ph = 'out'; intro.out = 0; sfx.drop(); }
}
function closeIntro() {
  intro.on = false; introSeen = true;
  el.introScr.classList.add('hidden');
  var f = intro.then; intro.then = null;
  if (f) f(); else el.startScreen.classList.remove('hidden');
}
function updateIntro(dt) {
  var g = intro.g, sc = INTRO[intro.i];
  intro.t += dt;
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, STAGE_W, STAGE_H);
  if (intro.ph === 'gate') return;
  var e = 1, rot = 0, s = 1, ox = 0;
  if (intro.ph === 'in') {
    e = clamp(intro.t / 0.9, 0, 1);
    var q = 1 - Math.pow(1 - e, 3);
    rot = (1 - q) * Math.PI * 5; s = 0.06 + q * 0.94;
    if (e >= 1) { intro.ph = 'hold'; intro.t = 0; sfx.drop(); noise(0.12, 0.14, { f: 1400, to: 300 }); }
  } else if (intro.ph === 'out') {
    intro.out += dt;
    var o = clamp(intro.out / 0.38, 0, 1);
    rot = -o * 0.5; ox = -o * o * 260; s = 1 - o * 0.15;
    if (o >= 1) { if (intro.i + 1 < INTRO.length) introScene(intro.i + 1); else { closeIntro(); return; } }
  }
  /* alt yazı: daktilo */
  if (intro.ph === 'hold') {
    var full = NM(sc.sub);
    if (intro.typed < full.length) {
      var prev = Math.floor(intro.typed);
      intro.typed = Math.min(full.length, intro.typed + dt * 34);
      if (Math.floor(intro.typed) !== prev) {
        el.introSub.textContent = full.slice(0, Math.floor(intro.typed));
        intro.tick++;
        if (intro.tick % 3 === 0 && full[prev] !== ' ') tone(1500 + Math.random() * 300, 0.018, 'square', 0.05, { lp: 3000 });
      }
      if (intro.typed >= full.length) el.introNext.classList.remove('hidden');
    }
  }
  drawPaper(intro.pg, sc, intro.i, intro.ph === 'in' ? 0 : intro.t);
  g.save();
  g.translate(Math.round(STAGE_W / 2 + ox), Math.round(STAGE_H / 2));
  g.rotate(rot); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.38)'; g.fillRect(-PAPER_W / 2 + 4, -PAPER_H / 2 + 5, PAPER_W, PAPER_H);
  g.drawImage(intro.pc, -PAPER_W / 2, -PAPER_H / 2);
  g.restore();
}

/* =========================================================
   BAŞLAT
   ========================================================= */
resize();
migrateOldSave();
loadPref();
S0 = JSON.parse(JSON.stringify(S));     /* temiz başlangıç: yeni oyun sayfayı yenilemeden buna döner */
BOOT = buildSave();
curSlot = lastSlot();
if (curSlot) loadFrom(readSlot(curSlot));
rebuildCounters();
reassignWorkers();
if (!M) M = newMarket();
lastRepLvl = repLevel();
paintIcons();
applyLang();
syncSettingsUI();
refreshSaveInfo();
syncPause();
resize();
camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { });
/* açılış akışı: kayıt yoksa gazete hikâyesi → ana menü. "Yeni Oyun" ile silinip gelindiyse
   hikâye → doğrudan işletme adı (oyuncu zaten yeni oyun dedi). */
(function bootFlow() {
  if (!slotCount()) openIntro(null);              /* ilk açılış: hikâye → ana menü */
})();
requestAnimationFrame(frame);

window.BT = {
  cam: function () { return { x: camX, y: camY, tx: camTX, ty: camTY }; },
  S: S, safe: safe, BINS: BINS, DECOR: DECOR, decorClearance: function () { return decorClearance(); },
  trayFull: function (k) { var c = counterByKey(k); return c ? trayFull(c) : null; }, zoneAuto: function (z) { return zoneAuto(z); },
  zoneChain: function (z) { return zoneChain(z); }, setZoneAuto: function (z, on) { setZoneAuto(z, on); }, reassignWorkers: function () { reassignWorkers(); }, player: player, spots: spots, tables: tables, smoker: smoker, counters: counters,
  pads: PADS, areas: AREAS, slots: SLOTS, project: project, decor: DECOR, workers: workers,
  customers: customers, FISH: FISH, start: start, hire: hire, toast: toast,
  rebuildCounters: rebuildCounters, buyBuilding: buyBuilding, investProject: investProject,
  setLang: function (l) { setLangTo(l); },
  M: function () { return M; },
  sellable: function () { return sellableFish(); }, fishReady: fishReady, lines: LINES,
  validate: function () { return validateWorld(); }, stallOf: stallOf,
  dbg: function () { return { W: W, H: H, PXS: PXS, VW: VW, VH: VH, maxY: maxOpenY(),
    pYtest: pY(4.5, 3.2, 0), pXtest: pX(4.5, 3.2), camOX: camOX, camOY: camOY,
    y0: pY(0, 0, 0) - 46, y1: pY(10, maxOpenY(), 0) + 42 }; },
  snapshot: function () { return JSON.stringify(M); },
  restore: function (j) { M = JSON.parse(j); }, openOffice: openOffice, closeDay: function () { closeDay(); },
  buyShares: buyShares, sellShares: sellShares, acceptContract: acceptContract,
  setEvent: function (id) { event = EVENTS.filter(function (e) { return e.id === id; })[0]; eventT = event.dur; },
  /* v0.4 hizmet binaları */
  SERV: SERV, PLOTS: PLOTS,
  serv: function () { return servState; },
  servMods: function () { _seT = -1; return servMods(); },
  servEff: function (k) { _seT = -1; return servEff(k); },
  servBuild: function (id, plotId) { return servBuild(id, plotById(plotId) || servFreePlots(id)[0]); },
  servUp: servUp, servMove: function (id, pid) { return servMove(id, plotById(pid)); },
  servLock: function (id) { return servLockReason(sdef(id)); },
  servFree: function (id) { return servFreePlots(id).map(function (p) { return p.id; }); },
  servValidate: servValidate,
  servRates: function () { return { fish: fishRate, serv: servRate, cap: Math.max(12, fishRate * 0.30) }; },
  servUnlock: servUnlock, servCount: servCount,
  T: T, STR: STR, lang: function () { return lang; },
  music: function () { return { on: music.on, bar: music.bar, step: music.step, mode: music.mode, enabled: musicEnabled, vol: music.gain ? +music.gain.gain.value.toFixed(3) : 0 }; },
  sfx: sfx, audio: function () { return { state: AC && AC.state, vol: masterGain && +masterGain.gain.value.toFixed(3), lvl: volLvl, on: soundOn, ready: audioReady }; },
  setVol: function (v) { volLvl = clamp(v | 0, 0, 2); applyVolume(); ensureAudio(); return volLvl; },
  /* duraklatma + kayıt */
  paused: function () { return paused; },
  saveNow: function () { manualSave(); return saveMeta(); }, slot: function () { return curSlot; }, saveSlots: function () { var o = []; for (var i = 1; i <= SLOT_N; i++) o.push(metaOf(readSlot(i))); return o; }, persistent: function () { return Store.persistent; },
  saveQuit: saveAndQuit, saveMeta: saveMeta,
  openSettings: function () { openSettings(false); },
  openMenu: openPauseMenu,
  /* v1.2 — depo / gün / balık pazarı */
  day: day, DAY_LEN: DAY_LEN,
  zones: function () { return spots.map(function (sp, i) { return { z: i, open: zoneOpen(i), cap: zoneStaffCap(i), staff: zoneStaff(i) }; }); },
  stalls: function () { return counters.map(function (c) { return [c.key, c.fish, c.open ? 'AÇIK' : 'KAPALI', c.buffer.length]; }); },
  setStall: function (key, on) { var c = counterByKey(key); return c ? setStall(c, on) : false; },
  toggleStall: function (key) { var c = counterByKey(key); return c ? toggleStall(c) : false; },
  stallScreen: openStallScreen, undecided: function () { return undecidedStalls().map(function (c) { return c.key; }); },
  hireCost: hireCost, zoneStaffCap: zoneStaffCap, zoneFree: zoneFree,
  workerZones: function () { return workers.map(function (w) { return w.role + '@' + (w.zone < 0 ? 'liman' : w.zone); }); },
  endDay: function () { day.t = DAY_LEN; },
  skipTo: function (n) { day.n = Math.max(1, n - 1); day.t = DAY_LEN; },


  fillMats: function (n) {
    var f = sellableFish(), total = 0;
    for (var t = 0; t < tables.length; t++) {
      if (AREAS[tables[t].z].locked) continue;
      for (var i = 0; i < n; i++) { var fish = zoneFish(t).filter(function (q) { return f.indexOf(q) >= 0; })[0]; if (fish) tables[t].mat.items.push({ k: 'fileto', f: fish }); }
      total += tables[t].mat.items.length;
    }
    return total;
  },
  dayStats: function () { return day.st; }, lastDay: function () { return day.last; },
  closeOverlays: function () {
    el.settingsScreen.classList.add('hidden'); el.menuScreen.classList.add('hidden'); syncPause();
  }
};


/* =========================================================
   ŞİRKETLER • KONTRATLAR • LİMAN BORSASI  (FULL GDD v1.0)
   Tek denge tablosu: ECON  (§24: kodda dağınık sabit yok)
   ========================================================= */

})();
