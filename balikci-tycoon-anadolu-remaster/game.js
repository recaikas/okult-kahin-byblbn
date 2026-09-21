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
    tag: 'KÜÇÜK İSKELEDEN BÜYÜK LİMANA',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SES', zoomLbl: 'GÖRÜNTÜ / ZOOM',
    resetAsk: 'Tüm ilerleme silinsin mi?',
    intro1: '🎣 Ağın yanında bekle, balık birikir',
    intro2: '🧺 Üstünden geç, sırtla (ağır balık çok yer kaplar)',
    intro3: '🔪 Kesim masası → fileto',
    intro4: '🐟 Tezgâh → müşteri siparişi öder',
    intro5: '💰 Parayı kasaya götür → liman büyür',
    ctrl: 'W A S D / yön tuşları — veya ekrana bas & sürükle',
    tabs: ['LİMAN', 'PERSONEL', 'ÜRÜNLER', 'YARDIM'],
    /* istasyonlar */
    stNet: 'AĞ', stCut: 'KESİM', stSmoke: 'FÜMEHANE', stStall: 'TEZGÂH', stSafe: 'KASA',
    stTake: 'AL', stBuild: 'YAPI YERİ', stProject: 'BÜYÜK PROJE', stDecor: 'SÜS',
    /* yükseltmeler */
    upCap: 'KAPASİTE', upCapE: '+3 taşıma', upSpd: 'HIZ', upSpdE: '+%11 koşu',
    upPrice: 'PAZARLIK', upPriceE: '+%10 fiyat',
    upArea: 'BÖLGE SEVİYESİ', hire: 'İŞE AL', level: 'Sv.',
    needRep: '⭐ {n} itibar gerekli ({c})', needStaff: 'Personel kulübesi gerekli',
    openArea: 'AÇ', locked: 'KİLİTLİ',
    /* olaylar */
    evShoal: 'BALIK SÜRÜSÜ', evShip: 'VAPUR GELDİ', evStorm: 'LODOS',
    evShoalM: 'Sürü geldi! Ağlar iki kat hızlı 🐟',
    evShipM: 'Vapur yanaştı! Müşteri akını 🚢',
    evStormM: 'Lodos bastırdı, müşteri azaldı 🌊',
    /* olaylar/uyarılar */
    hired: '{i} {n} işe alındı — {w}',
    levelUp: '⭐ Yeni seviye: {t}!',
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
          'Tepsideki parayı al, kasaya götür',
          'Alt bardan bir yükseltme satın al'],
    orderOf: '{n} SİPARİŞİ', waiting: '⏳ {n} müşteri bekliyor',
    idleGoal: 'Stok hazırla — müşteri yolda',
    /* menü */
    mArea: 'Bölgeler', mProject: 'Büyük proje', mSlots: 'Yapı noktaları',
    mWage: 'Maaş gideri', mOrders: 'Tamamlanan sipariş', mLost: 'Kaçan müşteri',
    mCaught: 'Tutulan balık', mNext: 'Sonraki', mMax: 'En üst seviye',
    mNoStaff: 'Henüz çalışanın yok. Haritadaki işe alım alanlarında bekle.',
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
    noRun: 'Önce oyunu başlat',
    newAsk: 'Mevcut kayıt silinip yeni oyun başlasın mı?',
    remaining: 'kalan', total: 'toplam',
    noMoney: 'Para yetmiyor', dayHud: 'GÜN', depot: 'MERKEZİ DEPO', depotLocked: '2. tezgâh veya 12 satışla açılır',
    depotOpened: '▣ Merkezi Depo açıldı!', depotFull: 'Depo dolu', depotDrop: 'Ürünleri depoya bırak',
    depotAuto: 'DAĞITIM ÇALIŞANI', depotAutoD: 'Hedef stoklara göre tezgâhları otomatik besler',
    depotAutoOn: 'DAĞITIM AKTİF', target: 'Hedef', priority: 'Öncelik', prLow: 'Düşük', prNormal: 'Normal', prHigh: 'Yüksek',
    dayNew: 'YENİ GÜN', dayTitle: 'GÜN {n}', dayClose: 'GÜN SONU', dayRevenue: 'Satış geliri', dayCustomers: 'Müşteri',
    dayFish: 'Satılan balık', dayLost: 'Kaçan müşteri', dayBest: 'En çok satan', marketTomorrow: 'YARIN BALIK PAZARI',
    marketDay: 'BALIK PAZARI GÜNÜ', marketPrep: 'Yoğunluk yüksek • geçici hedefler aktif',
    barArea: 'ALAN', barLevel: 'YÜKSELT', barBuild: 'YAPI', barProj: 'PROJE', barServ: 'BİNA',
    tArea: 'YENİ ALAN AÇ', tLevel: 'YÜKSELTMELER', tBuild: 'YAPI NOKTALARI', tProj: 'BÜYÜK PROJE',
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
    tag: 'FROM A TINY PIER TO A GRAND HARBOR',
    langLbl: 'DİL / LANGUAGE', soundLbl: 'SOUND', zoomLbl: 'VIEW / ZOOM',
    resetAsk: 'Erase all progress?',
    intro1: '🎣 Wait by the net, fish pile up',
    intro2: '🧺 Walk over the crate to carry them (big fish weigh more)',
    intro3: '🔪 Cutting table → fillets',
    intro4: '🐟 Stall → customers pay for orders',
    intro5: '💰 Take the cash to the safe → grow the harbor',
    ctrl: 'W A S D / arrow keys — or touch & drag anywhere',
    tabs: ['HARBOR', 'STAFF', 'GOODS', 'HELP'],
    stNet: 'NET', stCut: 'CUTTING', stSmoke: 'SMOKEHOUSE', stStall: 'STALL', stSafe: 'SAFE',
    stTake: 'TAKE', stBuild: 'BUILD SPOT', stProject: 'BIG PROJECT', stDecor: 'DECOR',
    upCap: 'CAPACITY', upCapE: '+3 carry', upSpd: 'SPEED', upSpdE: '+11% run',
    upPrice: 'HAGGLE', upPriceE: '+10% price',
    upArea: 'AREA LEVEL', hire: 'HIRE', level: 'Lv.',
    needRep: '⭐ needs {n} rep ({c})', needStaff: 'Needs a staff hut',
    openArea: 'OPEN', locked: 'LOCKED',
    evShoal: 'FISH SHOAL', evShip: 'FERRY ARRIVED', evStorm: 'SOUTH WIND',
    evShoalM: 'A shoal arrived! Nets twice as fast 🐟',
    evShipM: 'The ferry docked! Customer rush 🚢',
    evStormM: 'Rough sea, fewer customers 🌊',
    hired: '{i} {n} hired — {w}',
    levelUp: '⭐ New rank: {t}!',
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
          'Take the cash from the tray to the safe',
          'Buy an upgrade from the bottom bar'],
    orderOf: '{n} ORDER', waiting: '⏳ {n} customers waiting',
    idleGoal: 'Stock up — customers on the way',
    mArea: 'Areas', mProject: 'Big project', mSlots: 'Build spots',
    mWage: 'Wages', mOrders: 'Orders served', mLost: 'Customers lost',
    mCaught: 'Fish caught', mNext: 'Next', mMax: 'Max rank',
    mNoStaff: 'No staff yet. Stand on a hiring spot on the map.',
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
    noRun: 'Start the game first',
    newAsk: 'Delete the current save and start a new game?',
    remaining: 'left', total: 'total',
    noMoney: 'Not enough cash', dayHud: 'DAY', depot: 'CENTRAL DEPOT', depotLocked: 'Unlocks with stall 2 or 12 sales',
    depotOpened: '▣ Central Depot unlocked!', depotFull: 'Depot is full', depotDrop: 'Drop goods at the depot',
    depotAuto: 'DISTRIBUTION WORKER', depotAutoD: 'Automatically supplies stalls to their target stock',
    depotAutoOn: 'DISTRIBUTION ACTIVE', target: 'Target', priority: 'Priority', prLow: 'Low', prNormal: 'Normal', prHigh: 'High',
    dayNew: 'NEW DAY', dayTitle: 'DAY {n}', dayClose: 'DAY SUMMARY', dayRevenue: 'Sales revenue', dayCustomers: 'Customers',
    dayFish: 'Fish sold', dayLost: 'Customers lost', dayBest: 'Best seller', marketTomorrow: 'FISH MARKET TOMORROW',
    marketDay: 'FISH MARKET DAY', marketPrep: 'High demand • temporary targets active',
    barArea: 'AREA', barLevel: 'UPGRADE', barBuild: 'BUILD', barProj: 'PROJECT', barServ: 'SERVICE',
    tArea: 'UNLOCK NEW AREA', tLevel: 'UPGRADES', tBuild: 'BUILD SPOTS', tProj: 'BIG PROJECT',
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
function uiText(x, y, z, s, col, size, a, dx, dy, outline) { uiQ.push({ t: 3, x: x, y: y, z: z, s: s, c: col, sz: size || 12, a: a === undefined ? 1 : a, dx: dx, dy: dy, o: outline }); }
function uiFont(px) { return 'bold ' + px + 'px "Pixelify Sans",ui-monospace,monospace'; }
function renderUI() {
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
      var fs = q.t === 1 ? 13 : 12;
      uctx.font = uiFont(fs);
      var w = Math.round(uctx.measureText(q.s).width) + 12, h = fs + 8;
      var rect = { x: cx - w / 2, y: cy - h, w: w, h: h };
      for (var tr = 0; tr < 4 && hits(rect); tr++) rect.y -= h + 2;
      taken.push(rect);
      cy = rect.y + h;
      uctx.fillStyle = '#0a1a27'; uctx.fillRect(rect.x, rect.y, w, h);
      uctx.fillStyle = q.t === 1 ? '#14293c' : '#1d3a52';
      uctx.fillRect(rect.x + 2, rect.y + 2, w - 4, h - 4);
      uctx.fillStyle = q.c || '#f4e9d2';
      uctx.fillText(q.s, cx, cy - 6);
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
window.addEventListener('keydown', function (e) {
  keys[e.key.toLowerCase()] = true;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) >= 0) e.preventDefault();
});
window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
var stick = { active: false, id: -1, bx: 0, by: 0, dx: 0, dy: 0 };
cvs.addEventListener('pointerdown', function (e) {
  cvs.setPointerCapture(e.pointerId);
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

/* ---------------- ses: dış dosyasız, prosedürel liman sesleri ---------------- */
var AC = null, masterGain = null, harborLoop = null, soundOn = true;
function ensureAudio() {
  if (!soundOn) return null;
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = AC.createGain(); masterGain.gain.value = 0.82; masterGain.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  } catch (e) { return null; }
}
function tone(f, d, t, v, delay, endF) {
  var ac = ensureAudio(); if (!ac || !masterGain) return;
  var at = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
  o.type = t || 'triangle'; o.frequency.setValueAtTime(f, at);
  if (endF) o.frequency.exponentialRampToValueAtTime(endF, at + d);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v || 0.025, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  o.connect(g); g.connect(masterGain); o.start(at); o.stop(at + d + 0.02);
}
function noise(d, v, freq, delay) {
  var ac = ensureAudio(); if (!ac || !masterGain) return;
  var at = ac.currentTime + (delay || 0), n = Math.max(1, Math.floor(ac.sampleRate * d));
  var b = ac.createBuffer(1, n, ac.sampleRate), data = b.getChannelData(0);
  for (var i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  var src = ac.createBufferSource(), filter = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = b; filter.type = 'lowpass'; filter.frequency.value = freq || 850;
  g.gain.setValueAtTime(v || 0.018, at); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  src.connect(filter); filter.connect(g); g.connect(masterGain); src.start(at);
}
function startHarborAmbience() {
  var ac = ensureAudio(); if (!ac || harborLoop || !masterGain) return;
  var seconds = 5, b = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate), data = b.getChannelData(0);
  for (var i = 0; i < data.length; i++) {
    var swell = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * i / data.length), 2);
    data[i] = (Math.random() * 2 - 1) * swell;
  }
  var src = ac.createBufferSource(), filter = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = b; src.loop = true; filter.type = 'lowpass'; filter.frequency.value = 420; g.gain.value = 0.012;
  src.connect(filter); filter.connect(g); g.connect(masterGain); src.start(); harborLoop = { src: src, gain: g };
}
function stopHarborAmbience() {
  if (!harborLoop) return;
  try { harborLoop.src.stop(); } catch (e) { }
  harborLoop = null;
}
var sfx = {
  pick: function () { tone(680 + Math.random() * 90, 0.07, 'triangle', 0.022, 0, 920); },
  drop: function () { tone(230 + Math.random() * 45, 0.08, 'triangle', 0.026, 0, 150); noise(0.05, 0.012, 650); },
  coin: function () { tone(920, 0.09, 'sine', 0.034); tone(1380, 0.13, 'sine', 0.028, 0.055); },
  buy: function () { tone(430, 0.09, 'triangle', 0.028); tone(650, 0.12, 'triangle', 0.026, 0.07); },
  build: function () { noise(0.07, 0.025, 1000); tone(190, 0.10, 'triangle', 0.034); noise(0.07, 0.022, 900, 0.10); tone(285, 0.14, 'triangle', 0.03, 0.10); },
  bad: function () { tone(175, 0.22, 'sawtooth', 0.022, 0, 118); },
  star: function () { tone(880, 0.08, 'sine', 0.03); tone(1175, 0.09, 'sine', 0.028, 0.07); tone(1568, 0.15, 'sine', 0.025, 0.14); },
  ui: function () { tone(520, 0.055, 'triangle', 0.014, 0, 610); },
  splash: function () { noise(0.16, 0.022, 1150); tone(145, 0.18, 'sine', 0.018, 0, 95); },
  chop: function () { noise(0.045, 0.018, 1450); tone(310, 0.05, 'triangle', 0.013); }
};

/* =========================================================
   İÇERİK
   ========================================================= */
var FISH = {
  hamsi:   { id: 'hamsi',   n: { tr: 'Hamsi', en: 'Anchovy' },   r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.42, out: 1, val: 6,  col: '#8fa9bd', bel: '#d7e4ee', meat: '#dfe9f0' },
  uskumru: { id: 'uskumru', n: { tr: 'Uskumru', en: 'Mackerel' }, r: { tr: 'Yaygın', en: 'Common' }, w: 1, cut: 0.62, out: 1, val: 12, col: '#5f8f8a', bel: '#cfe6df', meat: '#bfe0d6' },
  palamut: { id: 'palamut', n: { tr: 'Palamut', en: 'Bonito' },   r: { tr: 'Orta', en: 'Uncommon' }, w: 1, cut: 0.72, out: 2, val: 18, col: '#6f8fa8', bel: '#dbe9f2', meat: '#d2856b' },
  levrek:  { id: 'levrek',  n: { tr: 'Levrek', en: 'Sea Bass' },  r: { tr: 'Orta', en: 'Uncommon' }, w: 1, cut: 0.85, out: 2, val: 24, col: '#a8b6c2', bel: '#eef5f9', meat: '#eaf2f7' },
  somon:   { id: 'somon',   n: { tr: 'Somon', en: 'Salmon' },     r: { tr: 'Orta', en: 'Uncommon' }, w: 2, cut: 1.10, out: 3, val: 34, col: '#d98455', bel: '#f7c9a4', meat: '#f08a3c' },
  ton:     { id: 'ton',     n: { tr: 'Orkinos', en: 'Tuna' },     r: { tr: 'Nadir', en: 'Rare' },    w: 3, cut: 1.70, out: 5, val: 46, col: '#3f6a8c', bel: '#9fc0d8', meat: '#b8453f' }
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
function stallName(k) { return T('st' + k.toUpperCase()); }
function lineByStall(k) { for (var i = 0; i < LINES.length; i++) if (LINES[i].stall === k) return LINES[i]; return null; }
function stallOf(f) {
  var l = lineOf(f); if (!l) return null;
  for (var i = 0; i < counters.length; i++) if (counters[i].key === l.stall && !AREAS[counters[i].z].locked) return counters[i];
  return null;
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
function prodValue(k, f) { return Math.round(FISH[f].val * (k === 'fume' ? FUME_MUL : 1) * (1 + S.priceLvl * 0.1) * (1 + perkSum('value'))); }
function itemW(it) { return it.k === 'fish' ? FISH[it.f].w : 1; }

var ROLES = {
  hamal:     { id: 'hamal',     n: { tr: 'Hamal', en: 'Porter' },     icon: '🧺', wage: 15, speed: 2.4, cap: 8,  d: { tr: 'Ağdan kesime taşır', en: 'Net → cutting table' } },
  filetocu:  { id: 'filetocu',  n: { tr: 'Filetocu', en: 'Filleter' }, icon: '🔪', wage: 19, speed: 2.3, cap: 4,  d: { tr: 'Masayı %55 hızlandırır', en: 'Table 55% faster' } },
  tezgahtar: { id: 'tezgahtar', n: { tr: 'Tezgâhtar', en: 'Vendor' },  icon: '🐟', wage: 22, speed: 2.5, cap: 8,  d: { tr: 'Siparişi tezgâha taşır', en: 'Goods → stall' } },
  kasiyer:   { id: 'kasiyer',   n: { tr: 'Kasiyer', en: 'Cashier' },   icon: '💰', wage: 17, speed: 2.6, cap: 10, d: { tr: 'Parayı kasaya işler', en: 'Cash → safe' } }
};
var WNAMES = ['Hasan', 'Kerim', 'Zeynep', 'Mert', 'Deniz', 'Ayla', 'Tarık', 'Elif', 'Cem', 'Nur', 'Osman', 'Sevgi'];

var CUST = [
  { id: 'isci',   n: { tr: 'İşçi', en: 'Worker' },    coat: '#3f6fb0', coat2: '#335c93', qty: [2, 4],  pat: 54,  mult: 1.00, rep: 1, lvl: 1, tag: 'cheap' },
  { id: 'aile',   n: { tr: 'Aile', en: 'Family' },    coat: '#c8553d', coat2: '#a94430', qty: [4, 7],  pat: 80,  mult: 1.05, rep: 1, lvl: 1, tag: 'any' },
  { id: 'esnaf',  n: { tr: 'Esnaf', en: 'Merchant' }, coat: '#7b5ea7', coat2: '#674d8e', qty: [3, 5],  pat: 50,  mult: 1.35, rep: 2, lvl: 2, tag: 'rich' },
  { id: 'sef',    n: { tr: 'Şef', en: 'Chef' },       coat: '#f2efe6', coat2: '#dcd8cb', qty: [3, 4],  pat: 32,  mult: 1.80, rep: 2, lvl: 3, tag: 'premium', pen: 1 },
  { id: 'kaptan', n: { tr: 'Kaptan', en: 'Captain' }, coat: '#1f4e6b', coat2: '#173d55', qty: [8, 14], pat: 120, mult: 1.25, rep: 3, lvl: 3, tag: 'any' },
  { id: 'vip',    n: { tr: 'VIP', en: 'VIP' },        coat: '#d4a029', coat2: '#b8881c', qty: [2, 3],  pat: 28,  mult: 3.00, rep: 3, lvl: 4, tag: 'fume', pen: 2 },
  /* v0.4 — hizmet binalarıyla açılan tipler (§35.3, §35.4) */
  { id: 'toptanci', n: { tr: 'Toptancı', en: 'Wholesaler' }, coat: '#4a7a3a', coat2: '#3a6230', qty: [10, 18], pat: 115, mult: 1.45, rep: 3, lvl: 1, tag: 'any', serv: 'toptanci' },
  { id: 'turist',   n: { tr: 'Turist', en: 'Tourist' },      coat: '#e0679e', coat2: '#c4507f', qty: [2, 4],   pat: 62,  mult: 1.60, rep: 2, lvl: 1, tag: 'any', serv: 'turist' }
];

var EVENTS = [
  { id: 'suru', name: 'evShoal', icon: '🐟', dur: 34, fishMul: 2.2, custMul: 1.0, msg: 'evShoalM' },
  { id: 'gemi', name: 'evShip',  icon: '🚢', dur: 38, fishMul: 1.0, custMul: 2.2, msg: 'evShipM' },
  { id: 'kar',  name: 'evStorm', icon: '🌊', dur: 30, fishMul: 1.0, custMul: 0.45, msg: 'evStormM' }
];
var REP_LEVELS = [
  { need: 0,   t: { tr: 'Çırak Balıkçı', en: 'Apprentice' } },
  { need: 10,  t: { tr: 'İskele Esnafı', en: 'Pier Trader' } },
  { need: 30,  t: { tr: 'Pazar Ustası', en: 'Market Master' } },
  { need: 75,  t: { tr: 'Liman İşletmecisi', en: 'Harbor Operator' } },
  { need: 150, t: { tr: 'Balıkçılık Kralı', en: 'Fishing Tycoon' } }
];

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
  { id: 'tezgah', cat: 'ticaret',  n: { tr: 'Ek Tezgâh', en: 'Extra Stall' },      icon: '🐟', cost: 2200, eff: 'counter', val: 1,    d: { tr: 'Yeni satış noktası', en: 'New sales point' } },
  { id: 'pano',   cat: 'ticaret',  n: { tr: 'Reklam Panosu', en: 'Billboard' },    icon: '📣', cost: 1400, eff: 'flow',    val: 0.3,  d: { tr: 'Müşteri akışı +%30', en: 'Customer flow +30%' } },
  { id: 'depo',   cat: 'lojistik', n: { tr: 'Depo Kulübesi', en: 'Depot Shed' },   icon: '📦', cost: 1700, eff: 'stock',   val: 6,    d: { tr: 'Bölge stoğu +6', en: 'Local stock +6' } },
  { id: 'vinc',   cat: 'lojistik', n: { tr: 'Ağ Vinci', en: 'Net Crane' },         icon: '🏗️', cost: 2600, eff: 'netrate', val: 0.25, d: { tr: 'Bölge ağı %25 hızlı', en: 'Nets here 25% faster' } }
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
function staffCap() { return 3 + slotEff(null, 'staff'); }
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
var DECOR = [
  { id: 'bayrak', z: 0, x: 0.9, y: 0.5,  cost: 600,  n: { tr: 'Bayrak Direği', en: 'Flag Pole' },   icon: '🇹🇷', got: false },
  { id: 'tekne',  z: 0, x: 5.0, y: 0.45, cost: 1300, n: { tr: 'Balıkçı Teknesi', en: 'Fishing Boat' }, icon: '⛵', got: false },
  { id: 'bank',   z: 0, x: 9.3, y: 4.6,  cost: 400,  n: { tr: 'Bank', en: 'Bench' },                icon: '🪑', got: false },
  { id: 'simit',  z: 1, x: 2.6, y: 7.0,  cost: 900,  n: { tr: 'Simit Arabası', en: 'Simit Cart' },  icon: '🥯', got: false },
  { id: 'lamba',  z: 1, x: 1.0, y: 11.2, cost: 700,  n: { tr: 'Sokak Lambası', en: 'Street Lamp' }, icon: '💡', got: false },
  { id: 'cicek',  z: 1, x: 9.3, y: 8.6,  cost: 500,  n: { tr: 'Begonvil', en: 'Bougainvillea' },    icon: '🌺', got: false },
  { id: 'caymasa', z: 2, x: 1.0, y: 17.0, cost: 800, n: { tr: 'Çay Masası', en: 'Tea Table' },      icon: '☕', got: false },
  { id: 'heykel', z: 2, x: 9.3, y: 12.6, cost: 2600, n: { tr: 'Balık Heykeli', en: 'Fish Statue' }, icon: '🗿', got: false }
];
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
  { id: 'p7', z: 2, x: 8.7, y: 17.0, n: { tr: 'Tersane Ucu', en: 'Yard Point' },   allow: ['tersane', 'yakit', 'tamirhane'], b: null }
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
    var pay = Math.round(L.inc * (1 + repLevel() * 0.04));
    S.cash += pay; servRate += pay;
    var p = plotById(st.plot);
    if (p) { addFloat(p.x, p.y - 0.4, '+' + money(pay), '#9df5b0'); st.flash = 0.8; }
  }
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
var office = { z: 2, x: 6.9, y: 16.2, w: 1.8, h: 1.4 };
function officeBuilt() { return M && M.office; }
function officeReady() { return !AREAS[office.z].locked; }

/* ---------------- yükseltme alanları ---------------- */
var PADS = [
  { id: 'cap', z: 0, x: 1.2, y: 1.4,  kind: 'cap',  icon: '🧺', price: 120,  growth: 1.55, lvl: 0, max: 8, paid: 0 },
  { id: 'spd', z: 0, x: 1.2, y: 2.9,  kind: 'spd',  icon: '👟', price: 160,  growth: 1.60, lvl: 0, max: 6, paid: 0 },
  { id: 'h1',  z: 0, x: 3.0, y: 4.9,  kind: 'hire', role: 'hamal',     icon: '🧺', price: 380,  growth: 2.05, lvl: 0, max: 3, paid: 0 },
  { id: 'al0', z: 0, x: 5.0, y: 4.0,  kind: 'arealv', area: 0, icon: '🏗️', paid: 0 },
  { id: 'z1',  z: 0, x: 7.0, y: 5.3,  kind: 'area', target: 1, icon: '🔓', paid: 0 },
  { id: 'h2',  z: 1, x: 2.0, y: 9.6,  kind: 'hire', role: 'filetocu',  icon: '🔪', price: 520,  growth: 2.0, lvl: 0, max: 3, paid: 0 },
  { id: 'h3',  z: 1, x: 4.0, y: 10.8, kind: 'hire', role: 'tezgahtar', icon: '🐟', price: 720,  growth: 2.0, lvl: 0, max: 3, paid: 0 },
  { id: 'al1', z: 1, x: 6.0, y: 11.2, kind: 'arealv', area: 1, icon: '🏗️', paid: 0 },
  { id: 'z2',  z: 1, x: 8.0, y: 11.4, kind: 'area', target: 2, icon: '🔓', paid: 0 },
  { id: 'h4',  z: 2, x: 6.8, y: 13.2, kind: 'hire', role: 'kasiyer',   icon: '💰', price: 900,  growth: 2.0, lvl: 0, max: 2, paid: 0 },
  { id: 'prc', z: 2, x: 6.8, y: 16.6, kind: 'price', icon: '💰', price: 850, growth: 1.8, lvl: 0, max: 6, paid: 0 },
  { id: 'al2', z: 2, x: 2.0, y: 16.9, kind: 'arealv', area: 2, icon: '🏗️', paid: 0 }
];

/* ---------------- durum ---------------- */
var S = {
  cash: 0, rep: 0, capLvl: 0, spdLvl: 0, priceLvl: 0,
  served: 0, lost: 0, caught: 0, tut: 0, started: false, play: 0, savedAt: 0
};
var player = { x: 4.5, y: 3.2, z: 0, vx: 0, vy: 0, bob: 0, face: 1, carry: [], act: 0, isPlayer: true };
var workers = [], customers = [], flyers = [], floats = [], puffs = [], gulls = [];
var event = null, eventT = 0, nextEvent = 80;
var gameT = 0, camX = 0, camY = 0, camTX = 0, camTY = 0;
/* GDD v1.1 — sade gün ritmi + Merkezi Depo + Balık Pazarı */
var DAY = { day: 1, t: 0, len: 180, phase: 'play', phaseT: 0, market: false,
  revenue: 0, served: 0, sold: 0, lost: 0, best: {} };
var DEPOT = { x: 6.2, y: 4.65, z: 0, unlocked: false, auto: false, cap: 40, items: [], tick: 0,
  targets: {}, priorities: {}, marketTargets: {}, marketPriorities: {} };

function depotOpenRule() {
  var n = 0; for (var i = 0; i < counters.length; i++) if (!AREAS[counters[i].z].locked) n++;
  return n >= 2 || S.served >= 12;
}
function depotCheckUnlock() {
  if (!DEPOT.unlocked && depotOpenRule()) { DEPOT.unlocked = true; toast(T('depotOpened')); sfx.star(); }
  return DEPOT.unlocked;
}
function depotTarget(c) {
  var map = DAY.market ? DEPOT.marketTargets : DEPOT.targets;
  if (map[c.key] === undefined) map[c.key] = DAY.market ? 15 : 10;
  return clamp(map[c.key], 3, counterMax(c));
}
function depotPriority(c) {
  var map = DAY.market ? DEPOT.marketPriorities : DEPOT.priorities;
  if (map[c.key] === undefined) map[c.key] = DAY.market ? 2 : 1;
  return clamp(map[c.key], 0, 2);
}
function depotStock(f) { var n = 0; for (var i = 0; i < DEPOT.items.length; i++) if (DEPOT.items[i].f === f) n++; return n; }
function dayResetStats() { DAY.revenue = 0; DAY.served = 0; DAY.sold = 0; DAY.lost = 0; DAY.best = {}; }

function capacity() { return 8 + S.capLvl * 3; }
function speed() { return 3.1 * Math.pow(1.11, S.spdLvl); }
function carryW(a) { var w = 0; for (var i = 0; i < a.carry.length; i++) w += itemW(a.carry[i]); return w; }
function repLevel() { var l = 1; for (var i = 0; i < REP_LEVELS.length; i++) if (S.rep >= REP_LEVELS[i].need) l = i + 1; return l; }
function repTitle() { return NM(REP_LEVELS[repLevel() - 1].t); }
function wageTotal() { var w = 0; for (var i = 0; i < workers.length; i++) w += ROLES[workers[i].role].wage; return w; }
function upCost(v) { return Math.max(1, Math.round(v * (1 - Math.min(0.45, perkSum('upcost') + servEff('upcost'))))); }
function pct(n) { return lang === 'tr' ? '%' + n : n + '%'; }
function perMin() { return lang === 'tr' ? '/dk' : '/min'; }
function money(n) { return '$' + Math.round(n).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'); }

/* ---------------- kayıt ---------------- */
var SAVE_KEY = 'balikci_tycoon_v3';
var _pendingWorld = null;
function saveItem(it) { return it ? { k: it.k, f: it.f, v: it.v } : null; }
function saveItems(a) { return (a || []).map(saveItem); }
function loadItems(a) { return (a || []).filter(Boolean).map(function (it) { return { k: it.k, f: it.f, v: it.v }; }); }
function worldSave() {
  return {
    player: [player.x, player.y, saveItems(player.carry)],
    spots: spots.map(function (s) { return saveItems(s.stock); }),
    tables: tables.map(function (t) { return { inn: saveItems(t.inn), cur: saveItem(t.cur), t: t.t, mat: saveItems(t.mat.items) }; }),
    smoker: { inn: saveItems(smoker.inn), cur: saveItem(smoker.cur), t: smoker.t, mat: saveItems(smoker.mat.items) },
    counters: counters.map(function (c) { return { key: c.key, buffer: saveItems(c.buffer), tray: saveItems(c.tray.items) }; })
  };
}
function worldLoad(w) {
  if (!w) return;
  if (w.player) {
    if (canStand(+w.player[0], +w.player[1])) { player.x = +w.player[0]; player.y = +w.player[1]; }
    player.carry = loadItems(w.player[2]);
  }
  (w.spots || []).forEach(function (v, i) { if (spots[i]) spots[i].stock = loadItems(v); });
  (w.tables || []).forEach(function (v, i) { if (!tables[i]) return; tables[i].inn = loadItems(v.inn); tables[i].cur = saveItem(v.cur); tables[i].t = +v.t || 0; tables[i].mat.items = loadItems(v.mat); });
  if (w.smoker) { smoker.inn = loadItems(w.smoker.inn); smoker.cur = saveItem(w.smoker.cur); smoker.t = +w.smoker.t || 0; smoker.mat.items = loadItems(w.smoker.mat); }
  (w.counters || []).forEach(function (v) {
    for (var i = 0; i < counters.length; i++) if (counters[i].key === v.key) { counters[i].buffer = loadItems(v.buffer); counters[i].tray.items = loadItems(v.tray); break; }
  });
}
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 4, lang: lang, snd: soundOn ? 1 : 0, zoom: zoomLvl,
      at: Date.now(), play: Math.round(S.play || 0),
      cash: S.cash, rep: S.rep, capLvl: S.capLvl, spdLvl: S.spdLvl, priceLvl: S.priceLvl,
      served: S.served, lost: S.lost, caught: S.caught, tut: S.tut,
      areas: AREAS.map(function (a) { return [a.locked ? 1 : 0, a.lvl]; }),
      pads: PADS.map(function (p) { return [Math.round(p.paid), p.lvl || 0, p.price || 0]; }),
      slots: SLOTS.map(function (s) { return s.b; }),
      decor: DECOR.map(function (d) { return d.got ? 1 : 0; }),
      proj: [Math.round(project.inv), project.stage, project.done ? 1 : 0],
      serv: servSave(),
      workers: workers.map(function (w) { return w.role; }),
      world: worldSave(),
      dayState: DAY,
      depot: { unlocked: DEPOT.unlocked, auto: DEPOT.auto, cap: DEPOT.cap, items: saveItems(DEPOT.items),
        targets: DEPOT.targets, priorities: DEPOT.priorities, marketTargets: DEPOT.marketTargets, marketPriorities: DEPOT.marketPriorities },
      mk: M
    }));
  } catch (e) { }
}
function load() {
  try {
    var raw = localStorage.getItem(SAVE_KEY); if (!raw) return false;
    var d = JSON.parse(raw);
    if (d.lang) lang = d.lang;
    if (d.snd !== undefined) soundOn = !!d.snd;
    if (d.zoom) zoomLvl = d.zoom;
    S.cash = d.cash || 0; S.rep = d.rep || 0; S.capLvl = d.capLvl || 0; S.spdLvl = d.spdLvl || 0;
    S.priceLvl = d.priceLvl || 0; S.served = d.served || 0; S.lost = d.lost || 0;
    S.caught = d.caught || 0; S.tut = d.tut || 0;
    S.play = d.play || 0; S.savedAt = d.at || 0;
    if (d.areas) d.areas.forEach(function (v, i) { if (AREAS[i]) { AREAS[i].locked = !!v[0]; AREAS[i].lvl = v[1] || 1; } });
    if (d.pads) d.pads.forEach(function (v, i) { if (PADS[i]) { PADS[i].paid = v[0]; PADS[i].lvl = v[1]; if (v[2]) PADS[i].price = v[2]; } });
    if (d.slots) d.slots.forEach(function (v, i) { if (SLOTS[i]) SLOTS[i].b = v; });
    if (d.decor) d.decor.forEach(function (v, i) { if (DECOR[i]) DECOR[i].got = !!v; });
    if (d.proj) { project.inv = d.proj[0] || 0; project.stage = d.proj[1] || 0; project.done = !!d.proj[2]; }
    servLoad(d.serv);   /* v0.4 §41 — yoksa hiçbir bina kurulmaz, para kesilmez */
    if (d.workers) d.workers.forEach(function (r) { hire(r, true); });
    _pendingWorld = d.world || null;
    if (d.dayState) for (var dk in DAY) if (d.dayState[dk] !== undefined) DAY[dk] = d.dayState[dk];
    if (d.depot) {
      DEPOT.unlocked = !!d.depot.unlocked; DEPOT.auto = !!d.depot.auto; DEPOT.cap = d.depot.cap || 40;
      DEPOT.items = loadItems(d.depot.items); DEPOT.targets = d.depot.targets || {}; DEPOT.priorities = d.depot.priorities || {};
      DEPOT.marketTargets = d.depot.marketTargets || {}; DEPOT.marketPriorities = d.depot.marketPriorities || {};
    }
    if (d.mk) M = migrateMarket(d.mk);
    return true;
  } catch (e) { return false; }
}
function wipe(autoStart) {
  try { localStorage.removeItem(SAVE_KEY); if (autoStart) sessionStorage.setItem('bt_new_start', '1'); } catch (e) { }
  location.reload();
}
/* --- kayıt özeti / manuel kaydet (pause + kaydet-çık) --- */
function saveMeta() {
  try {
    var raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
    var d = JSON.parse(raw);
    return { at: d.at || 0, cash: d.cash || 0, rep: d.rep || 0, served: d.served || 0, play: d.play || 0,
      areas: (d.areas || []).filter(function (a) { return !a[0]; }).length };
  } catch (e) { return null; }
}
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
  return T('saveLine', { t: agoStr(m.at), c: money(m.cash), r: m.rep, s: m.served, p: clockStr(m.play) });
}
function manualSave(msg) {
  save();
  S.savedAt = Date.now();
  refreshSaveInfo();
  toast(msg || T('saved', { t: agoStr(S.savedAt) }));
  sfx.star && sfx.star();
}
function refreshSaveInfo() {
  var m = saveMeta();
  if (el.setSaveInfo) el.setSaveInfo.textContent = saveSummary(m);
  if (el.saveInfo) {
    el.saveInfo.textContent = saveSummary(m);
    el.saveInfo.classList.toggle('hidden', !m);
  }
  if (el.newBtn) el.newBtn.classList.toggle('hidden', !m);
  if (el.playBtn) el.playBtn.textContent = m ? T('resume') : T('play');
}

/* --- DURAKLATMA (pause) --- */
var paused = false;
function anyOverlay() {
  var officeScr = document.getElementById('officeScr');
  return !el.settingsScreen.classList.contains('hidden') || !el.menuScreen.classList.contains('hidden') ||
    !!officeScr && !officeScr.classList.contains('hidden') || !document.getElementById('depotScreen').classList.contains('hidden');
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
  manualSave(T('savedQuit'));
  el.settingsScreen.classList.add('hidden');
  el.menuScreen.classList.add('hidden');
  el.depotScreen.classList.add('hidden');
  closeBar();
  S.started = false;
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('objective').classList.add('hidden');
  el.devbar.classList.add('hidden');
  if (el.tradeBtn) el.tradeBtn.classList.add('hidden');
  el.startScreen.classList.remove('hidden');
  refreshSaveInfo(); syncPause();
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

function iPickFish(a, s, dt) {
  if (!s.stock.length) return false;
  var it = s.stock[s.stock.length - 1];
  if (!fits(a, it)) return false;
  return tryTake(a, dt, function () {
    s.stock.pop(); a.carry.push(it);
    fly(s.x, s.y + 0.9, 8, a.x, a.y, carryTopZ(a, a.carry.length), it, 0.26); sfx.pick();
  });
}
function iDropTable(a, tb, dt) {
  if (tb.inn.length >= tb.max || !hasCarry(a, isFish)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isFish); tb.inn.push(it);
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
    var m = counterWants(list[i]);
    for (var k in m) if (m[k] > 0) g[k] = (g[k] || 0) + m[k];
  }
  return g;
}
function acceptsAt(c, it) { return isGoods(it) && !!c.fish && it.f === c.fish; }
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
function iDeposit(a, dt) {
  if (!hasCarry(a, isMoney)) return false;
  a.act -= dt; if (a.act > 0) return true;
  a.act = 0.05;
  var it = popCarry(a, isMoney);
  S.cash += it.v; safe.pop = 1;
  fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), safe.x, safe.y, 13, it, 0.24);
  addFloat(safe.x, safe.y - 0.4, '+' + money(it.v), '#8ef2a2'); sfx.coin();
  return true;
}
function iDropDepot(a, dt) {
  if (!depotCheckUnlock() || DEPOT.items.length >= DEPOT.cap || !hasCarry(a, isGoods)) return false;
  return tryTake(a, dt, function () {
    var it = popCarry(a, isGoods); DEPOT.items.push(it);
    fly(a.x, a.y, carryTopZ(a, a.carry.length + 1), DEPOT.x, DEPOT.y, 12, it, 0.28); sfx.drop();
  });
}
function updateDepot(dt) {
  depotCheckUnlock();
  if (!DEPOT.unlocked || !DEPOT.auto || !DEPOT.items.length || DAY.phase !== 'play') return;
  DEPOT.tick -= dt; if (DEPOT.tick > 0) return; DEPOT.tick = 0.68;
  var jobs = [], i, c, deficit;
  for (i = 0; i < counters.length; i++) {
    c = counters[i]; if (AREAS[c.z].locked || !c.fish) continue;
    deficit = depotTarget(c) - c.buffer.length;
    if (deficit > 0 && depotStock(c.fish) > 0) jobs.push({ c: c, score: depotPriority(c) * 100 + deficit });
  }
  jobs.sort(function (a, b) { return b.score - a.score; });
  if (!jobs.length) return;
  c = jobs[0].c; var idx = -1;
  for (i = 0; i < DEPOT.items.length; i++) if (DEPOT.items[i].f === c.fish && acceptsAt(c, DEPOT.items[i])) { idx = i; break; }
  if (idx < 0 || c.buffer.length >= counterMax(c)) return; /* ürün yoksa asla üretme */
  var it = DEPOT.items.splice(idx, 1)[0]; c.buffer.push(it);
  fly(DEPOT.x, DEPOT.y, 12, c.x, c.y, 13, it, 0.5); sfx.drop();
}
function dayBestName() {
  var best = null, n = 0; for (var f in DAY.best) if (DAY.best[f] > n) { best = f; n = DAY.best[f]; }
  return best ? NM(FISH[best].n) + ' x' + n : '—';
}
function showDayCard(kind) {
  var scr = document.getElementById('dayScreen'), kicker = document.getElementById('dayKicker');
  var title = document.getElementById('dayTitle'), body = document.getElementById('dayBody');
  scr.classList.remove('hidden');
  if (kind === 'summary') {
    kicker.textContent = T('dayClose'); title.textContent = T('dayTitle', { n: DAY.day });
    body.innerHTML = '<div class="day-grid"><span>' + T('dayRevenue') + '</span><b>' + money(DAY.revenue) + '</b>' +
      '<span>' + T('dayCustomers') + '</span><b>' + DAY.served + '</b><span>' + T('dayFish') + '</span><b>' + DAY.sold + '</b>' +
      '<span>' + T('dayLost') + '</span><b>' + DAY.lost + '</b><span>' + T('dayBest') + '</span><b>' + dayBestName() + '</b></div>' +
      (((DAY.day + 1) % 4 === 0) ? '<div class="market-notice">' + T('marketTomorrow') + '</div>' : '');
  } else {
    kicker.textContent = DAY.market ? T('marketDay') : T('dayNew'); title.textContent = T('dayTitle', { n: DAY.day });
    body.innerHTML = DAY.market ? '<div class="market-notice">' + T('marketPrep') + '</div>' : '';
  }
}
function updateDay(dt) {
  if (DAY.phase === 'intro') {
    DAY.phaseT += dt; if (DAY.phaseT >= 2.1) { DAY.phase = 'play'; DAY.phaseT = 0; document.getElementById('dayScreen').classList.add('hidden'); }
    return true;
  }
  if (DAY.phase === 'summary') {
    DAY.phaseT += dt;
    if (DAY.phaseT >= 3.1) {
      DAY.day++; DAY.t = 0; DAY.phase = 'intro'; DAY.phaseT = 0; DAY.market = DAY.day % 4 === 0; dayResetStats();
      showDayCard('intro'); save();
    }
    return true;
  }
  if (DAY.phase === 'play') {
    DAY.t += dt;
    if (DAY.t >= DAY.len) { DAY.phase = 'closing'; DAY.phaseT = 0; }
  } else if (DAY.phase === 'closing') {
    DAY.phaseT += dt;
    if (!customers.length || DAY.phaseT >= 8) { DAY.phase = 'summary'; DAY.phaseT = 0; showDayCard('summary'); sfx.star(); }
  }
  /* stoksuz bekleme telemetrisi */
  for (var i = 0; i < counters.length; i++) {
    var c = counters[i], waiting = false;
    for (var q = 0; q < c.slots.length; q++) if (c.slots[q] && c.slots[q].state === 'wait' && c.slots[q].ord.got < c.slots[q].ord.need) waiting = true;
    if (waiting && !c.buffer.length) c.stockout = (c.stockout || 0) + dt;
  }
  return false;
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
  moveActor(player, wx, wy, speed(), dt);

  var acted = false, i;
  /* §8: para taşıyorken kasa önceliklidir */
  if (hasCarry(player, isMoney) && dist2(player.x, player.y, safe.x, safe.y) < 3.2) {
    iDeposit(player, dt);
    return;
  }
  if (DEPOT.unlocked && dist2(player.x, player.y, DEPOT.x, DEPOT.y) < 2.0) acted = iDropDepot(player, dt) || acted;
  for (i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked) continue;
    if (dist2(player.x, player.y, s.x, s.y + 0.9) < 1.6) acted = iPickFish(player, s, dt) || acted;
  }
  for (i = 0; i < tables.length; i++) {
    var tb = tables[i]; if (AREAS[tb.z].locked) continue;
    if (dist2(player.x, player.y, tb.x, tb.y) < 1.6) acted = iDropTable(player, tb, dt) || acted;
    if (dist2(player.x, player.y, tb.mat.x, tb.mat.y) < 1.5) acted = iPickMat(player, tb.mat, dt) || acted;
  }
  if (!AREAS[smoker.z].locked) {
    if (dist2(player.x, player.y, smoker.x, smoker.y) < 1.6) acted = iDropSmoker(player, dt) || acted;
    if (dist2(player.x, player.y, smoker.mat.x, smoker.mat.y) < 1.5) acted = iPickMat(player, smoker.mat, dt) || acted;
  }
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked) continue;
    if (dist2(player.x, player.y, c.x, c.y) < 1.8) acted = iDropCounter(player, c, dt) || acted;
    if (dist2(player.x, player.y, c.tray.x, c.tray.y) < 1.5) acted = iPickMoney(player, c, dt) || acted;
  }
  if (dist2(player.x, player.y, safe.x, safe.y) < 1.8) acted = iDeposit(player, dt) || acted;
  if (officeBuilt() && dist2(player.x, player.y, office.x, office.y) < 3.4) acted = iDeliverContract(player, dt) || acted;
  if (!acted) player.act = 0;
}

/* =========================================================
   ÇALIŞANLAR
   ========================================================= */
function hire(role, silent) {
  var w = {
    role: role, x: 4.6 + rnd(-1, 1), y: 3.6 + rnd(-1, 1), z: 0, vx: 0, vy: 0,
    carry: [], act: 0, bob: 0, face: 1, table: null, mode: 'load', name: pick(WNAMES)
  };
  workers.push(w);
  if (role === 'filetocu') assignFiletocu(w);
  if (!silent) { toast(T('hired', { i: ROLES[role].icon, n: w.name, w: money(ROLES[role].wage) + perMin() })); }
  return w;
}
function assignFiletocu(w) {
  for (var i = 0; i < tables.length; i++) {
    if (AREAS[tables[i].z].locked || tables[i].worker) continue;
    tables[i].worker = w; w.table = tables[i]; return;
  }
  w.table = null;
}
function reassignWorkers() { for (var i = 0; i < workers.length; i++) if (workers[i].role === 'filetocu' && !workers[i].table) assignFiletocu(workers[i]); }
function openTables() { return tables.filter(function (t) { return !AREAS[t.z].locked; }); }
function openCounters() { return counters.filter(function (c) { return !AREAS[c.z].locked; }); }
function bestSpot(w) {
  var best = null, bs = -1e9;
  for (var i = 0; i < spots.length; i++) {
    var s = spots[i]; if (AREAS[s.z].locked) continue;
    var sc = s.stock.length * 3 - (w ? Math.sqrt(dist2(w.x, w.y, s.x, s.y)) : 0);
    if (sc > bs) { bs = sc; best = s; }
  } return best;
}
function tableWithSpace(w) {
  var list = openTables().filter(function (t) { return t.inn.length < t.max; }), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var d = (w ? dist2(w.x, w.y, list[i].x, list[i].y) : 0) + list[i].inn.length * 2;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function counterWantingCarry(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i]; if (c.buffer.length >= counterMax(c)) continue;
    var m = counterWants(c), hit = false;
    for (var j = 0; j < w.carry.length; j++) if (acceptsAt(c, w.carry[j]) && m[itemKey(w.carry[j])] > 0) { hit = true; break; }
    if (!hit) continue;
    var d = dist2(w.x, w.y, c.x, c.y);
    if (d < bd) { bd = d; best = c; }
  } return best;
}
function nearestCounterWithSpace(w) {
  var list = openCounters(), best = null, bd = 1e9;
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    if (c.buffer.length >= 7) continue;
    var ok = false;
    for (var j = 0; j < w.carry.length; j++) if (acceptsAt(c, w.carry[j])) { ok = true; break; }
    if (!ok) continue;                       /* yalnız kendi türünü kabul eden tezgâh */
    var d = dist2(w.x, w.y, c.x, c.y);
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
  var mats = openTables().map(function (t) { return t.mat; }), best = null, bd = 1e9, i, j;
  if (!AREAS[smoker.z].locked) mats.push(smoker.mat);
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
    var d = w ? dist2(w.x, w.y, list[i].tray.x, list[i].tray.y) : 0;
    if (d < bd) { bd = d; best = list[i]; }
  } return best;
}
function updateWorkers(dt) {
  var mul = workerSpeedMul();
  for (var i = 0; i < workers.length; i++) {
    var w = workers[i], sp = ROLES[w.role].speed * mul;
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
    else goTo(w, 5.2, 4.2, sp, dt, 1.0);
    return;
  }
  if (canLoad) { if (goTo(w, s.x + 0.5, s.y + 1.3, sp, dt, 0.8)) iPickFish(w, s, dt); return; }
  if (hasCarry(w, isFish)) { w.mode = 'drop'; return; }
  if (s) goTo(w, s.x + 1.5, s.y + 1.8, sp, dt, 1.2);
}
function aiTezgahtar(w, sp, dt) {
  var full = carryW(w) >= ROLES.tezgahtar.cap - 0.5, i, k;
  var g = globalWants();
  for (i = 0; i < w.carry.length; i++) { k = itemKey(w.carry[i]); if (g[k] > 0) g[k]--; }
  var wantFilter = function (it) { return g[itemKey(it)] > 0; };
  var m = matWith(wantFilter, w);
  var stockLow = openCounters().filter(function (q) { return q.buffer.length < 5; }).length > 0;
  var filt = wantFilter;
  if (!m && stockLow) { m = matWith(deliverable, w); filt = deliverable; }
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
      var back = matWith(function () { return true; }, w) || (openTables()[0] && openTables()[0].mat);
      if (w.idleT > 8 && back && back.items.length < 18) {
        if (goTo(w, back.x, back.y, sp, dt, 0.8)) {
          var gi = popCarry(w, isGoods);
          if (gi) { back.items.push(gi); fly(w.x, w.y, carryTopZ(w, w.carry.length + 1), back.x, back.y, 6, gi, 0.26); }
          if (!hasCarry(w, isGoods)) { w.idleT = 0; w.mode = 'load'; }
        }
      } else goTo(w, 7.2, 4.8, sp, dt, 1.0);
    }
    return;
  }
  if (m && !full) {
    if (goTo(w, m.x, m.y, sp, dt, 0.8)) { if (!iPickMat(w, m, dt, filt)) w.mode = 'drop'; }
    return;
  }
  if (hasCarry(w, isGoods)) { w.mode = 'drop'; return; }
  goTo(w, 7.2, 4.8, sp, dt, 1.0);
}
function aiKasiyer(w, sp, dt) {
  var full = carryW(w) >= ROLES.kasiyer.cap - 0.5;
  var c = trayWithMoney(1, w);
  if (w.mode !== 'drop' && (full || !c) && hasCarry(w, isMoney)) w.mode = 'drop';
  if (w.mode === 'drop' && !hasCarry(w, isMoney)) w.mode = 'load';
  if (w.mode === 'drop') { if (goTo(w, safe.x + 0.35, safe.y + 0.35, sp, dt, 0.9)) iDeposit(w, dt); return; }
  if (c) { if (goTo(w, c.tray.x, c.tray.y, sp, dt, 0.8)) iPickMoney(w, c, dt); return; }
  if (hasCarry(w, isMoney)) { w.mode = 'drop'; return; }
  goTo(w, safe.x + 1.6, safe.y - 0.7, sp, dt, 1.0);
}
function aiFiletocu(w, sp, dt) {
  if (!w.table || AREAS[w.table.z].locked) assignFiletocu(w);
  if (!w.table) { goTo(w, 5.5, 4.2, sp, dt, 1.0); return; }
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
      if (s.z === player.z && dist2(player.x, player.y, s.x, s.y) < 18) sfx.splash();
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
        addPuff(t.x, t.y, '#ffffff'); sfx.chop(); t.cur = null; t.t = 0;
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
  safe.pop = Math.max(0, safe.pop - dt * 3);
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
  var custMul = (event ? event.custMul : 1) * areaFlow(c.z) * (DAY.market ? 1.85 : 1);
  c.spawnT -= dt * custMul;
  var qmax = queueMax(c.z), freeIdx = -1, i;
  for (i = 0; i < qmax; i++) if (!c.slots[i]) { freeIdx = i; break; }
  if (DAY.phase === 'play' && c.spawnT <= 0 && freeIdx >= 0) {
    c.spawnT = 5.4 * rnd(0.75, 1.3);
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
    (1 + perkSum('custval') + servEff('custval') + (cu.type.id === 'toptanci' ? servEff('wholesale') : 0)));
  payout(c, pay, cu.slot);
  noteFishIncome(pay);
  cu.state = 'leave'; c.slots[cu.slot] = null; shiftQueue(c);
  S.served++; S.rep += cu.type.rep;
  DAY.revenue += pay; DAY.served++; DAY.sold += cu.ord.need;
  DAY.best[cu.ord.f] = (DAY.best[cu.ord.f] || 0) + cu.ord.need;
  var fp = queueSlotPos(c, cu.slot);
  addFloat(fp.x, fp.y - 0.5, '+' + money(pay), '#ffe27a');
  addFloat(fp.x + 0.6, fp.y - 1.1, '+' + cu.type.rep + '*', '#ffd76a');
  sfx.coin(); checkRepLevel();
}
var lastRepLvl = 1;
function checkRepLevel() {
  var l = repLevel();
  if (l > lastRepLvl) { lastRepLvl = l; toast(T('levelUp', { t: repTitle() })); sfx.star(); }
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
        cu.state = 'leave'; cu.c.slots[cu.slot] = null; shiftQueue(cu.c);
        S.lost++;
        DAY.lost++;
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
function shadow(x, y, r) {
  ctx.save(); ctx.globalAlpha = 0.22;
  var cx = pX(x, y), cy = pY(x, y, 0);
  quad([[cx - r * 6, cy], [cx, cy - r * 3], [cx + r * 6, cy], [cx, cy + r * 3]], '#123020');
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
function labelAt(x, y, z, s, col, short) {
  var d = dist2(player.x, player.y, x, y);
  if (d < 2.4) { if (short) uiLabel(x, y, z, short, col, 0.45); return; }
  if (d < 26) { uiLabel(x, y, z, s, col, 1); return; }
  if (d < 90 && short) uiLabel(x, y, z, short, col, 0.72);
}

/* ---------- eşyalar ---------- */
function drawFishItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 2, 8, 4, F.col);
  px(x - 3, y - 1, 6, 2, F.bel);
  px(x + 3, y - 3, 3, 6, F.col);
  dot(x - 3, y - 1, '#16222b');
  px(x - 4, y - 3, 5, 1, F.col);
}
function drawFiletoItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 2, 8, 4, '#f2ece0');
  px(x - 3, y - 1, 6, 2, F.meat);
  px(x - 4, y + 1, 8, 1, '#b9b0a0');
}
function drawFumeItem(x, y, f) {
  var F = FISH[f] || FISH.hamsi;
  px(x - 4, y - 3, 8, 6, '#8a6440');
  px(x - 4, y - 3, 8, 2, '#a97f52');
  px(x - 2, y - 1, 4, 3, '#f0e2c8');
  dot(x, y, F.meat);
}
function drawMoneyItem(x, y) {
  px(x - 4, y - 3, 8, 5, '#2e7d43');
  px(x - 4, y - 3, 8, 2, '#5fd37a');
  px(x - 1, y - 2, 2, 3, '#e8ffe8');
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
var SKIN = ['#f0bf8d', '#d89d67', '#aa7042', '#75472f'];
var HAIR = ['#211813', '#3a2518', '#0f1010', '#6b4c35'];
var CLOTH = {
  navy: '#17485d', tile: '#1e7580', cream: '#eadbb8', red: '#b83b31',
  copper: '#a95f32', brass: '#d9ad4a', leather: '#654127', ink: '#101a20'
};
function drawNazar(x, y) {
  px(x - 2, y - 2, 5, 5, '#f2e5c5'); px(x - 1, y - 1, 3, 3, '#2b91a5'); dot(x, y, '#102f5b');
}
function drawReaction(a, kind, alpha) {
  if (!kind) return;
  var x = R(pX(a.x, a.y)) + 9, y = R(pY(a.x, a.y, a.z || 0)) - 30 - R(Math.sin(gameT * 5) * 1.5);
  ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  if (kind === 'happy') { px(x - 3, y - 3, 7, 6, '#f4df58'); dot(x - 1, y - 1, '#7b3e21'); dot(x + 2, y - 1, '#7b3e21'); px(x, y + 1, 2, 1, '#7b3e21'); }
  else if (kind === 'angry') { px(x - 3, y - 2, 7, 5, '#d94a3d'); px(x - 2, y - 1, 2, 1, '#fff'); px(x + 2, y - 1, 2, 1, '#fff'); px(x - 1, y + 1, 4, 1, '#6a1714'); }
  else if (kind === 'impatient') { px(x, y - 5, 2, 5, '#d6f0f4'); px(x - 1, y, 4, 3, '#58aabe'); }
  else if (kind === 'work') { px(x - 3, y - 2, 7, 4, '#d9ad4a'); px(x - 1, y - 5, 2, 9, '#654127'); }
  ctx.restore();
}
function drawPerson(a, o) {
  var sx = R(pX(a.x, a.y)), sy = R(pY(a.x, a.y, a.z || 0));
  var moving = Math.hypot(a.vx || 0, a.vy || 0) > 0.05 || o.walk;
  var phase = moving ? Math.floor((a.bob || 0) / 1.35) % 4 : 0;
  var b = moving ? (phase === 1 || phase === 3 ? 1 : 0) : (Math.sin(gameT * 2.2 + (a.x || 0)) > 0.75 ? 1 : 0);
  var sw = moving ? (phase < 2 ? 1 : -1) : 0;
  var face = o.face || a.face || 1;
  shadow(a.x, a.y, moving ? 0.68 : 0.58);
  var y = sy - b;
  /* ayakkabı + yönlü dört kare yürüyüş */
  px(sx - 4 + sw, y - 2, 4, 2, CLOTH.ink); px(sx + 1 - sw, y - 2, 4, 2, CLOTH.ink);
  px(sx - 3 + sw, y - 8, 3, 6, o.trouser || '#263b45'); px(sx + 1 - sw, y - 8, 3, 6, o.trouser || '#263b45');
  /* gömlek, yelek ve kuşak: kıyı esnafı silueti */
  px(sx - 5, y - 17, 10, 9, o.shirt || CLOTH.cream);
  px(sx - 5, y - 17, 3, 9, o.coat); px(sx + 2, y - 17, 3, 9, o.coat);
  px(sx - 2, y - 16, 4, 7, o.coat2 || o.coat);
  px(sx - 5, y - 9, 10, 2, o.sash || CLOTH.red);
  dot(sx, y - 14, CLOTH.brass);
  /* hareket sırasında ters salınan kollar */
  px(sx - 7, y - 16 + sw, 2, 7, o.coat2 || o.coat); px(sx + 5, y - 16 - sw, 2, 7, o.coat2 || o.coat);
  dot(sx - 6, y - 9 + sw, o.skin || SKIN[0]); dot(sx + 6, y - 9 - sw, o.skin || SKIN[0]);
  if (o.bag) { px(face > 0 ? sx - 8 : sx + 6, y - 15, 3, 8, CLOTH.leather); px(sx - 4, y - 16, 8, 1, '#8f6a3c'); }
  /* yüz + saç / kasket / yazma / aşçı-kaptan başlığı */
  px(sx - 4, y - 24, 8, 7, o.skin || SKIN[0]);
  if (o.headscarf) {
    px(sx - 5, y - 26, 10, 4, o.headscarf); px(face > 0 ? sx - 5 : sx + 3, y - 23, 2, 7, o.headscarf); dot(sx, y - 25, CLOTH.cream);
  } else if (o.cap) {
    px(sx - 5, y - 26, 10, 3, o.cap); px(face > 0 ? sx + 2 : sx - 6, y - 23, 4, 1, o.cap);
    if (o.capBand) px(sx - 4, y - 24, 8, 1, o.capBand);
  } else {
    px(sx - 5, y - 26, 10, 3, o.hair || HAIR[0]); px(face > 0 ? sx - 5 : sx + 4, y - 23, 1, 3, o.hair || HAIR[0]);
  }
  if (o.must) px(sx - 2, y - 19, 5, 1, o.hair || HAIR[0]);
  var fx = face > 0 ? 1 : -1;
  dot(sx + fx * 2, y - 21, CLOTH.ink);
  if (o.mood !== undefined && o.mood < 0.45) px(sx + fx - 1, y - 18, 3, 1, '#82382b');
  else dot(sx + fx * 2, y - 18, '#9c4a37');
  if (o.role === 'filetocu') drawReaction(a, 'work', 0.75);
  if (a.carry && a.carry.length) drawStack(a.x, a.y, a.carry, 15 + b, 3.4);
}
function drawCustomer(cu) {
  var t = cu.type;
  var scarf = (t.id === 'aile' && cu.tone % 2 === 0) ? (cu.hair % 2 ? '#b83b31' : '#286d77') : null;
  var cap = null, band = null;
  if (t.id === 'kaptan') { cap = '#f0e5c8'; band = '#173f58'; }
  else if (t.id === 'sef') { cap = '#f7f1df'; band = '#d7cdb8'; }
  else if (t.id === 'isci' || t.id === 'esnaf' || t.id === 'toptanci') cap = t.id === 'toptanci' ? '#66744c' : '#3b5260';
  drawPerson(cu, {
    coat: t.coat, coat2: t.coat2, skin: SKIN[cu.tone], hair: HAIR[cu.hair], face: cu.face,
    mood: cu.state === 'wait' ? cu.mood : 1, walk: cu.state !== 'wait',
    must: cu.hair === 1 && !scarf, cap: cap, capBand: band, headscarf: scarf,
    sash: t.id === 'vip' ? '#d9ad4a' : (t.id === 'turist' ? '#1e7580' : '#a84836'),
    shirt: t.id === 'sef' ? '#f4efe3' : '#e7d6b3', trouser: t.id === 'turist' ? '#6c7c8d' : '#263b45'
  });
  if (cu.state === 'wait') {
    if (cu.mood < 0.22) drawReaction(cu, 'angry');
    else if (cu.mood < 0.48 && Math.floor(gameT * 2) % 2) drawReaction(cu, 'impatient', 0.85);
  } else if (cu.state === 'leave' && cu.ord && cu.ord.got >= cu.ord.need) drawReaction(cu, 'happy', 0.9);
  if (cu.state !== 'wait') return;
  var sx = R(pX(cu.x, cu.y)), sy = R(pY(cu.x, cu.y, 0));
  var bx = sx + 13, by = sy - 28;
  /* sipariş balonu + sabır halkası */
  px(bx - 10, by - 9, 20, 17, '#071820');
  px(bx - 9, by - 8, 18, 15, '#f1e4c5');
  px(bx - 9, by - 8, 18, 2, '#1e7580');
  px(bx - 3, by + 7, 3, 3, '#f4e9d2');
  if (cu.ord.k === 'fume') drawFumeItem(bx - 3, by - 1, cu.ord.f); else drawFiletoItem(bx - 3, by - 1, cu.ord.f);
  uiText(cu.x, cu.y, 0, 'x' + (cu.ord.need - cu.ord.got), '#ffe9a8', 12, 1, 18, -24);
  var w = 16, fw = R(w * cu.mood);
  px(bx - 8, by - 11, w, 3, '#071820');
  px(bx - 8, by - 10, fw, 2, cu.mood > 0.5 ? '#5fd37a' : (cu.mood > 0.25 ? '#ffc94a' : '#e5533d'));
  if (t.pen) { px(bx - 10, by - 9, 1, 17, '#ffc94a'); px(bx + 9, by - 9, 1, 17, '#ffc94a'); }
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
  for (i = 0; i < 260; i++) {
    x = rnd(-0.4, 17.4); y = rnd(-0.4, 24.4);
    if (!freeLand(x, y)) continue;
    var r = srnd();
    scenery.push({ x: x, y: y, t: r < 0.3 ? 'servi' : r < 0.55 ? 'cam' : r < 0.75 ? 'kaya' : r < 0.9 ? 'cali' : 'varil', s: 0.8 + srnd() * 0.5 });
  }
  for (i = 0; i < 420; i++) {
    x = rnd(-0.6, 17.4); y = rnd(-0.6, 24.4);
    if (x < 10.1 && y < 17.6) continue;
    grass.push({ x: x, y: y, c: srnd() < 0.5 ? '#b9a878' : '#a8b06a' });
  }
  for (i = 0; i < 5; i++) gulls.push({ x: rnd(-20, 10), y: rnd(-18, 4), vx: rnd(0.5, 1.1), vy: rnd(0.1, 0.4), f: rnd(0, 6) });
})();

function drawSea() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var bands = [['#0a4158', 0], ['#0f5870', 0.30], ['#176f84', 0.57], ['#238da0', 0.80]];
  for (var i = 0; i < bands.length; i++) {
    var y0 = Math.floor(H * bands[i][1]);
    var y1 = i < bands.length - 1 ? Math.floor(H * bands[i + 1][1]) : H;
    px(0, y0, W, y1 - y0, bands[i][0]);
  }
  /* Ege ışığı: yatay parıltı ve hareketli köpük çizgileri */
  ctx.save();
  for (var k = 0; k < 12; k++) {
    var yy = R(H * 0.18 + k * H * 0.073 + Math.sin(gameT * 0.55 + k) * 2);
    var xx = R(((k * 71 + gameT * (3 + k % 3)) % (W + 90)) - 45);
    ctx.globalAlpha = 0.10 + (k % 3) * 0.035;
    px(xx, yy, 20 + (k % 4) * 9, 1, '#d5f2eb');
  }
  ctx.restore();
}
/* uzak sahil: beyaz evler, kırmızı çatılar, minare, servi (parallax) */
function drawVillage() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var off = (camX * 0.22) % 260, base = Math.floor(H * 0.26) - Math.floor(camY * 0.12);
  if (base < -40) base = -40; if (base > H * 0.5) base = Math.floor(H * 0.5);
  /* zeytinlik tepeleri */
  for (var h = 0; h < 3; h++) {
    var hy = base - 16 + h * 7;
    ctx.fillStyle = ['#3d5a48', '#5a704c', '#75835a'][h];
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
    px(vx, vy, v.w, v.h, i % 4 === 0 ? '#d9e2da' : '#efe4cd');
    px(vx, vy, v.w, 1, '#fffaf0');
    if (v.roof) { px(vx - 1, vy - 3, v.w + 2, 3, i % 5 === 0 ? '#854435' : '#b8442e'); }
    for (var wx = 2; wx < v.w - 2; wx += 4) { px(vx + wx, vy + 2, 2, 2, '#426777'); dot(vx + wx, vy + 2, '#99c3ca'); }
    if (i % 7 === 0) { px(vx - 2, vy + 1, 2, v.h - 1, '#356f53'); dot(vx - 3, vy + 1, '#b64b76'); dot(vx - 2, vy + 4, '#cc5a85'); }
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
  /* uzak kıyıda küçük Türk bayrağı */
  var fx = ((246 - off) % (26 * 26)); if (fx < -20) fx += 26 * 26;
  px(fx, base - 21, 1, 22, '#d9d2c3'); px(fx + 1, base - 21, 10, 6, '#c7252d');
  px(fx + 4, base - 19, 3, 3, '#f6efe0'); dot(fx + 5, base - 18, '#c7252d'); dot(fx + 8, base - 18, '#f6efe0');
  px(0, base + 4, W, 3, '#3f7d92');
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
function drawWaves() {
  for (var i = 0; i < waves.length; i++) {
    var w = waves[i];
    var ph = Math.sin(gameT * 0.9 + w.ph);
    if (ph < 0.2) continue;
    var sx = pX(w.x, w.y), sy = pY(w.x, w.y, 0);
    px(sx, sy, w.w, 1, 'rgba(255,255,255,.5)');
  }
}
function drawBoat(b) {
  var sx = R(pX(b.x, b.y)), sy = R(pY(b.x, b.y, 0)) + R(Math.sin(gameT * 1.1 + b.x) * 1.2);
  px(sx - 10, sy - 3, 20, 4, '#694025');
  px(sx - 9, sy - 6, 18, 3, '#f0e3c3');
  px(sx - 9, sy - 5, 18, 1, '#1e7580');
  px(sx - 7, sy - 6, 14, 1, '#e8d9b8');
  px(sx - 1, sy - 15, 2, 10, '#5d3c1c');
  if (b.r) { px(sx + 1, sy - 15, 8, 9, '#e5e0d0'); px(sx + 1, sy - 15, 8, 2, '#c73332'); drawNazar(sx + 5, sy - 9); }
  px(sx - 7, sy - 8, 5, 2, '#ba8739');
  px(sx - 9, sy + 1, 18, 1, 'rgba(255,255,255,.35)');
}
function drawGull(g) {
  var sx = R(pX(g.x, g.y)), sy = R(pY(g.x, g.y, 46 + Math.sin(g.f * 0.5) * 3));
  var up = Math.sin(g.f) > 0;
  px(sx - 3, sy + (up ? -1 : 1), 3, 1, '#ffffff');
  px(sx + 1, sy + (up ? -1 : 1), 3, 1, '#ffffff');
  px(sx - 1, sy, 2, 1, '#e8e8e8');
}
var LANDX = 17.5, LANDY = 24.5;
function drawLand() {
  quad([[pX(-0.7, -0.7), pY(-0.7, -0.7, 0)], [pX(LANDX, -0.7), pY(LANDX, -0.7, 0)],
        [pX(LANDX, LANDY), pY(LANDX, LANDY, 0)], [pX(-0.7, LANDY), pY(-0.7, LANDY, 0)]], '#c8b27d');
  /* kuru ot dokusu */
  ctx.save(); ctx.globalAlpha = 0.5;
  for (var i = 0; i < grass.length; i++) px(pX(grass[i].x, grass[i].y), pY(grass[i].x, grass[i].y, 0), 2, 1, grass[i].c);
  ctx.restore();
  /* kıyı taşları ve çini renkli yön izleri */
  ctx.save(); ctx.globalAlpha = 0.23;
  for (var st = 0; st < 34; st++) {
    var sx2 = (st * 37) % 17, sy2 = (st * 19) % 24;
    px(pX(sx2, sy2), pY(sx2, sy2, 0), 2 + st % 3, 1, st % 5 === 0 ? '#1e7580' : '#eee0bd');
  }
  ctx.restore();
  /* rıhtım kenarı (tüm çevre) */
  ctx.strokeStyle = '#b3aa93'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, -0.7)), R(pY(-0.7, -0.7, 0)));
  ctx.lineTo(R(pX(-0.7, LANDY)), R(pY(-0.7, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, LANDY)), R(pY(LANDX, LANDY, 0)));
  ctx.lineTo(R(pX(LANDX, -0.7)), R(pY(LANDX, -0.7, 0)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R(pX(LANDX + 0.35, -1.05)), R(pY(LANDX + 0.35, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, -1.05)), R(pY(-1.05, -1.05, 0)));
  ctx.lineTo(R(pX(-1.05, LANDY + 0.35)), R(pY(-1.05, LANDY + 0.35, 0)));
  ctx.lineTo(R(pX(LANDX + 0.35, LANDY + 0.35)), R(pY(LANDX + 0.35, LANDY + 0.35, 0)));
  ctx.closePath(); ctx.stroke();
}

/* bölge zemini — seviyeye göre görsel (GDD §21.1) */
function drawArea(a, i) {
  var w = a.x1 - a.x0, h = a.y1 - a.y0;
  if (a.locked) {
    ctx.save(); ctx.globalAlpha = 0.42;
    isoQuad(a.x0, a.y0, w, h, 0, '#8d8156');
    ctx.restore();
    ctx.save(); ctx.setLineDash([4, 4]); ctx.lineDashOffset = -gameT * 5;
    ctx.strokeStyle = 'rgba(232,213,168,.55)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(a.x0, a.y0)), R(pY(a.x0, a.y0, 0)));
    ctx.lineTo(R(pX(a.x1, a.y0)), R(pY(a.x1, a.y0, 0)));
    ctx.lineTo(R(pX(a.x1, a.y1)), R(pY(a.x1, a.y1, 0)));
    ctx.lineTo(R(pX(a.x0, a.y1)), R(pY(a.x0, a.y1, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    var mx = (a.x0 + a.x1) / 2, my = a.y0 + 0.45;
    if (dist2(player.x, player.y, mx, my) < 60) uiLabel(mx, my, 10, '🔒 ' + NM(a.n), '#e8d5a8', 0.8);
    return;
  }
  var lv = a.lvl;
  var base = lv >= 3 ? '#c8c3b1' : (lv === 2 ? '#b7834f' : '#9b6b3f');
  isoQuad(a.x0, a.y0, w, h, 0, base);
  ctx.save(); ctx.globalAlpha = lv >= 3 ? 0.35 : 0.22;
  ctx.strokeStyle = lv >= 3 ? '#9a9483' : '#7d5228'; ctx.lineWidth = 1;
  for (var k = a.y0 + 1; k < a.y1; k += 1) {
    ctx.beginPath();
    ctx.moveTo(R(pX(a.x0, k)), R(pY(a.x0, k, 0))); ctx.lineTo(R(pX(a.x1, k)), R(pY(a.x1, k, 0)));
    ctx.stroke();
  }
  if (lv >= 3) for (var k2 = a.x0 + 1; k2 < a.x1; k2 += 1) {
    ctx.beginPath();
    ctx.moveTo(R(pX(k2, a.y0)), R(pY(k2, a.y0, 0))); ctx.lineTo(R(pX(k2, a.y1)), R(pY(k2, a.y1, 0)));
    ctx.stroke();
  }
  ctx.restore();
  if (lv >= 2) {
    ctx.save(); ctx.globalAlpha = 0.25;
    isoQuad(a.x0 + 0.3, a.y0 + 0.3, w - 0.6, 0.25, 0, '#efe4cd');
    ctx.restore();
  }
  if (lv >= 3) {
    /* olgun bölgelerde çini şerit: görsel seviye okuması */
    for (var t = a.x0 + 0.65; t < a.x1 - 0.2; t += 1.15) {
      isoQuad(t, a.y0 + 0.15, 0.24, 0.24, 0.15, (Math.floor(t * 10) % 2 ? '#1e7580' : '#e9dfc6'));
    }
  }
}
function fencePost(x, y, lv) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  if (lv >= 3) { px(sx - 1, sy - 11, 3, 11, '#8e8878'); px(sx - 2, sy - 13, 5, 2, '#b3aa93'); }
  else { px(sx - 1, sy - 9, 3, 9, '#8d5f33'); px(sx - 2, sy - 10, 5, 1, '#b07c45'); }
}
/* sokak lambası (Lv3 bölgelerde köşelerde) */
function drawLamp(x, y) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  px(sx - 1, sy - 22, 2, 22, '#3c4650');
  px(sx - 3, sy - 26, 6, 4, '#2b3a45');
  px(sx - 2, sy - 25, 4, 2, '#ffd98a');
  ctx.save(); ctx.globalAlpha = 0.16;
  quad([[sx - 10, sy], [sx, sy - 6], [sx + 10, sy], [sx, sy + 6]], '#ffd98a');
  ctx.restore();
}
/* bölge tabelası */
function drawSign(a) {
  var locked = a.locked;
  var x = locked ? (a.x0 + a.x1) / 2 : a.x0 + 0.6, y = locked ? (a.y0 + a.y1) / 2 : a.y1 - 0.35;
  var sx = R(pX(x, y)), sy = R(pY(x, y, 0));
  var s = UP(NM(a.n));
  var fs = locked ? 13 : 11;
  uctx.font = uiFont(fs);
  var w = R((uctx.measureText(s).width + (locked ? 30 : 16)) / PXS);
  var h = R((fs + 10) / PXS);
  if (locked) {
    px(sx - 2, sy - 10, 2, 10, '#6b4a28'); px(sx + 1, sy - 10, 2, 10, '#6b4a28');
    px(sx - w / 2 - 1, sy - 10 - h - 1, w + 2, h + 2, '#5d3c1c');
    px(sx - w / 2, sy - 10 - h, w, h, '#c9a15e');
    uiText(x, y, 0, '🔒 ' + s, '#3a2401', fs, 1, 0, -10 - h / 2 + fs / (2.6 * PXS), 'rgba(233,213,168,.85)');
  } else {
    px(sx - 1, sy - 9, 2, 9, '#6b4a28');
    px(sx - w / 2 - 1, sy - 9 - h - 1, w + 2, h + 2, '#5d3c1c');
    px(sx - w / 2, sy - 9 - h, w, h, '#c9a15e');
    uiText(x, y, 0, s, '#3a2401', fs, 0.95, 0, -9 - h / 2 + fs / (2.6 * PXS), 'rgba(233,213,168,.85)');
  }
}

function drawScenery(d) {
  var sx = R(pX(d.x, d.y)), sy = R(pY(d.x, d.y, 0)), z = d.s;
  if (d.t === 'servi') {            /* servi ağacı */
    px(sx - 1, sy - 4, 2, 4, '#6b4a28');
    px(sx - 3, sy - R(22 * z), 6, R(18 * z), '#2f4a33');
    px(sx - 2, sy - R(24 * z), 4, R(4 * z), '#3b5c3f');
    px(sx + 1, sy - R(20 * z), 2, R(14 * z), '#3b5c3f');
  } else if (d.t === 'cam') {       /* fıstık çamı */
    px(sx - 1, sy - 7, 3, 7, '#7a5230');
    px(sx - 7, sy - R(14 * z), 14, R(5 * z), '#3f6b42');
    px(sx - 5, sy - R(18 * z), 10, R(5 * z), '#4c7d4d');
    px(sx - 3, sy - R(21 * z), 6, R(4 * z), '#578c57');
  } else if (d.t === 'kaya') {
    px(sx - 5, sy - 5, 10, 5, '#a8a291');
    px(sx - 3, sy - 7, 6, 3, '#bab4a2');
  } else if (d.t === 'cali') {
    px(sx - 4, sy - 4, 8, 4, '#8c9a56');
    px(sx - 2, sy - 6, 5, 3, '#9aa863');
  } else {                           /* varil / ağ yığını */
    px(sx - 4, sy - 9, 8, 9, '#8a5a2e');
    px(sx - 4, sy - 9, 8, 2, '#a86f3a');
    px(sx - 4, sy - 5, 8, 1, '#5d3c1c');
  }
}

/* =========================================================
   ÇİZİM — istasyonlar / yapılar / proje / süs
   ========================================================= */
function drawSpot(s) {
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  /* iskele babası + ağ makarası */
  px(sx - 4, sy - 14, 8, 14, '#8d5f33');
  px(sx - 4, sy - 14, 8, 2, '#b07c45');
  px(sx - 7, sy - 23, 14, 9, '#d8cfaa');
  px(sx - 7, sy - 23, 14, 2, '#1e7580');
  for (var i = -5; i <= 5; i += 2) px(sx + i, sy - 21, 1, 6, 'rgba(120,110,70,.5)');
  drawNazar(sx, sy - 18);
  /* suya uzanan ağ */
  var ex = s.face === 'n' ? s.x + 0.2 : s.x - 3.0, ey = s.face === 'n' ? s.y - 3.0 : s.y + 0.2;
  ctx.strokeStyle = 'rgba(232,226,184,.8)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 22);
  ctx.quadraticCurveTo(R((sx + pX(ex, ey)) / 2), R(pY((s.x + ex) / 2, (s.y + ey) / 2, 34 + Math.sin(gameT) * 3)),
    R(pX(ex, ey)), R(pY(ex, ey, 2)));
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.45;
  isoQuad(ex - 0.7, ey - 0.7, 1.4, 1.4, 0, '#dff0f8');
  ctx.restore();
  /* sandık */
  isoBox(s.x - 0.6, s.y + 0.45, 1.2, 0.9, 0, 5, '#6b4425', '#573620', '#7c4f2b');
  drawStack(s.x, s.y + 0.9, s.stock, 5, 3.2);
  labelAt(s.x, s.y + 1.75, 6, T('stNet') + ' ' + s.stock.length, '#bfe9ff', '🎣' + s.stock.length);
}
function drawTable(tb) {
  isoBox(tb.x - 0.7, tb.y - 0.5, 1.4, 1.0, 0, 11, '#a9743f', '#604126', '#82572f');
  var sx = R(pX(tb.x, tb.y)), sy = R(pY(tb.x, tb.y, 11));
  px(sx - 7, sy - 4, 14, 5, '#e8dec6'); px(sx - 7, sy - 4, 14, 1, '#1e7580');
  var chop = tb.cur ? (Math.sin(gameT * (tb.worker ? 13 : 9)) > 0 ? 1 : 0) : 0;
  px(sx + 4, sy - 8 - chop * 3, 1, 5, '#5a4630');
  px(sx + 3, sy - 12 - chop * 3, 3, 4, '#dfe8ee');
  if (tb.cur) {
    drawItem(tb.cur, sx - 3, sy - 4);
    var pr = clamp(tb.t / FISH[tb.cur.f].cut, 0, 1);
    px(sx - 8, sy - 16, 16, 3, '#0a1a27');
    px(sx - 8, sy - 16, R(16 * pr), 3, '#5fd37a');
  }
  if (tb.cur && Math.floor(gameT * 8) % 4 === 0) { dot(sx + 7, sy - 8, '#d5eef2'); dot(sx + 9, sy - 10, '#d5eef2'); }
  drawStack(tb.x - 0.25, tb.y + 0.1, tb.inn, 11, 3.2);
  labelAt(tb.x, tb.y + 1.1, 8, T('stCut') + (tb.worker ? ' *' : ''), '#ffe6bf', '');
  isoQuad(tb.mat.x - 0.6, tb.mat.y - 0.5, 1.2, 1.0, 0.4, '#efe6d2');
  isoQuad(tb.mat.x - 0.45, tb.mat.y - 0.36, 0.9, 0.72, 0.6, '#f7f1e2');
  drawStack(tb.mat.x, tb.mat.y, tb.mat.items, 2, 3.2);
}
function drawSmoker() {
  var s = smoker;
  isoBox(s.x - 0.75, s.y - 0.6, 1.5, 1.2, 0, 13, '#7a4f33', '#4f3120', '#603c26');
  var sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 13));
  px(sx - 4, sy - 12, 8, 12, '#5b3a26');
  px(sx - 4, sy - 12, 4, 12, '#6f4830');
  px(sx - 3, sy - 2, 6, 2, 'rgba(255,150,60,' + (0.6 + Math.sin(gameT * 9) * 0.25) + ')');
  if (s.cur) {
    for (var i = 0; i < 3; i++) {
      var t = (gameT * 0.5 + i * 0.33) % 1;
      ctx.globalAlpha = (1 - t) * 0.4;
      px(sx - 2 + Math.sin(t * 5 + i) * 4, sy - 14 - t * 22, 3 + t * 3, 2 + t * 2, '#e8e2d8');
    }
    ctx.globalAlpha = 1;
    var pr = clamp(s.t / FUME_TIME, 0, 1);
    px(sx - 8, sy - 20, 16, 3, '#0a1a27');
    px(sx - 8, sy - 20, R(16 * pr), 3, '#ffc94a');
  }
  drawStack(s.x + 0.4, s.y + 0.3, s.inn, 13, 3.2);
  labelAt(s.x, s.y + 1.4, 10, T('stSmoke'), '#ffd3a0', '');
  isoQuad(s.mat.x - 0.6, s.mat.y - 0.5, 1.2, 1.0, 0.4, '#e6d5b8');
  drawStack(s.mat.x, s.mat.y, s.mat.items, 2, 3.2);
}
function drawCounter(c) {
  isoBox(c.x - 0.55, c.y - 1.0, 1.1, 2.0, 0, 12, '#b9824c', '#704525', '#8f592d');
  var sx = R(pX(c.x, c.y)), sy = R(pY(c.x, c.y, 12));
  /* balıkçı pazarı tentesi: kiremit kırmızısı + kırık beyaz */
  for (var i = 0; i < 6; i++) {
    var yy = sy - 22 + i * 1;
    px(sx - 12 + i, yy, 3, 2, i % 2 ? '#e30a17' : '#f4f0e4');
    px(sx + 9 - i, yy, 3, 2, i % 2 ? '#f4f0e4' : '#e30a17');
  }
  px(sx - 13, sy - 23, 26, 2, '#8d5f33');
  px(sx - 13, sy - 23, 2, 23, '#8d5f33'); px(sx + 11, sy - 23, 2, 23, '#8d5f33');
  px(sx - 9, sy - 13, 18, 3, '#123f4b');
  for (var n = -7; n <= 7; n += 4) { dot(sx + n, sy - 12, '#e8b84e'); dot(sx + n + 1, sy - 11, '#1e7580'); }
  if (c.fish) drawFishItem(sx, sy - 16, c.fish);
  drawStack(c.x, c.y, c.buffer, 12, 3.2);
  labelAt(c.x, c.y - 1.45, 10, (c.fish ? NM(FISH[c.fish].n) : T('stStall')) + ' ' + c.buffer.length + '/' + counterMax(c),
    '#ffd9a8', (c.fish ? NM(FISH[c.fish].n).slice(0, 3) + ' ' : '') + c.buffer.length);
  var tr = c.tray;
  isoQuad(tr.x - 0.6, tr.y - 0.5, 1.2, 1.0, 0.4, '#2e7d43');
  isoQuad(tr.x - 0.45, tr.y - 0.36, 0.9, 0.72, 0.6, '#3f9e56');
  drawStack(tr.x, tr.y, tr.items, 2, 3.2);
  if (tr.items.length) labelAt(tr.x, tr.y + 0.9, 4, T('stTake'), '#9df5b0', '$');
}
function drawSafe() {
  var pop = safe.pop * 2;
  isoBox(safe.x - 0.5, safe.y - 0.5, 1.0, 1.0, 0, 10 + pop, '#3f8f56', '#22603a', '#2d7546');
  var sx = R(pX(safe.x, safe.y)), sy = R(pY(safe.x, safe.y, 10 + pop));
  px(sx - 5, sy - 2, 10, 2, '#25693c');
  px(sx - 3, sy - 7, 6, 5, '#173f58'); drawNazar(sx, sy - 5);
  uiText(safe.x, safe.y, 10 + pop, '₺', '#f3df9b', 13, 1, 0, 8);
  labelAt(safe.x, safe.y, 30 + pop, T('stSafe'), '#b7f7c7', '');
}
function drawDepot() {
  isoBox(DEPOT.x - 0.72, DEPOT.y - 0.62, 1.44, 1.24, 0, 13, '#d8c49a', '#93643b', '#aa7748');
  var sx = R(pX(DEPOT.x, DEPOT.y)), sy = R(pY(DEPOT.x, DEPOT.y, 13));
  px(sx - 11, sy - 8, 22, 3, '#b8442e'); px(sx - 8, sy - 11, 16, 3, '#c9533b');
  px(sx - 5, sy - 5, 10, 7, '#17485d'); px(sx - 3, sy - 3, 6, 3, '#e8b84e');
  drawNazar(sx, sy - 2);
  labelAt(DEPOT.x, DEPOT.y, 32, T('depot') + ' ' + DEPOT.items.length + '/' + DEPOT.cap, '#f3df9b', '▣ ' + DEPOT.items.length);
}

/* ---------- yapılar ---------- */
function drawBuilding(s) {
  var id = s.b, sx = R(pX(s.x, s.y)), sy = R(pY(s.x, s.y, 0));
  if (id === 'kulube') {
    isoBox(s.x - 0.6, s.y - 0.6, 1.2, 1.2, 0, 12, '#c9a15e', '#7d5228', '#8f6030');
    px(sx - 8, sy - 22, 16, 4, '#b8442e'); px(sx - 6, sy - 24, 12, 3, '#c9533b');
    px(sx - 3, sy - 16, 5, 6, '#5d3c1c');
  } else if (id === 'cay') {
    isoBox(s.x - 0.45, s.y - 0.45, 0.9, 0.9, 0, 7, '#8d5f33', '#5d3c1c', '#6f4830');
    px(sx - 4, sy - 15, 8, 8, '#c0c6cc'); px(sx - 5, sy - 17, 10, 2, '#9aa2aa');
    px(sx + 3, sy - 13, 3, 3, '#c0c6cc');
    ctx.globalAlpha = 0.35 + Math.sin(gameT * 3) * 0.1;
    px(sx - 1, sy - 22, 2, 5, '#ffffff'); ctx.globalAlpha = 1;
    px(sx - 6, sy - 8, 3, 3, '#e30a17');
  } else if (id === 'tezgah') {
    /* ek tezgâh gövdesi (counter ayrıca eklenir) */
    px(sx - 9, sy - 16, 18, 3, '#8d5f33');
  } else if (id === 'pano') {
    px(sx - 2, sy - 12, 2, 12, '#5d3c1c'); px(sx + 1, sy - 12, 2, 12, '#5d3c1c');
    px(sx - 12, sy - 26, 25, 15, '#0a1a27');
    px(sx - 11, sy - 25, 23, 13, '#e5e0d0');
    px(sx - 11, sy - 25, 23, 4, '#e30a17');
    uiText(s.x, s.y, 0, lang === 'tr' ? 'TAZE BALIK' : 'FRESH FISH', '#1a4a6b', 10, 1, 0, -18, 'rgba(240,235,220,.9)');
  } else if (id === 'depo') {
    isoBox(s.x - 0.65, s.y - 0.65, 1.3, 1.3, 0, 11, '#9aa2aa', '#5d666e', '#6e767e');
    px(sx - 9, sy - 20, 18, 4, '#7d868e');
    px(sx - 5, sy - 15, 10, 6, '#4a5258');
    px(sx - 5, sy - 15, 10, 1, '#c9d0d6');
  } else if (id === 'vinc') {
    px(sx - 1, sy - 30, 3, 30, '#d8a52c');
    px(sx - 12, sy - 32, 24, 3, '#d8a52c');
    px(sx + 9, sy - 29, 1, 9, '#8a8f95');
    px(sx + 7, sy - 20, 5, 4, '#5d3c1c');
    px(sx - 6, sy - 4, 12, 4, '#3c4650');
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
    if (dist2(player.x, player.y, o.x, o.y) < 50) uiLabel(o.x, o.y, 12, '🏛️ ' + T('office'), '#ffc94a', 0.85);
    return;
  }
  isoBox(x + 0.1, y + 0.1, o.w - 0.2, o.h - 0.2, 0, 26, '#efe4cd', '#cbbd9e', '#ddcfb4');
  for (var r = 0; r < 6; r++) px(sx - 20 + r * 3, sy - 32 - r, 40 - r * 5, 3, r % 2 ? '#b8442e' : '#c9533b');
  px(sx - 22, sy - 32, 44, 3, '#8d3423');
  px(sx - 14, sy - 26, 9, 8, '#3f6f8f'); px(sx + 5, sy - 26, 9, 8, '#3f6f8f');
  px(sx - 5, sy - 16, 10, 16, '#7d5228');
  px(sx - 16, sy - 40, 2, 9, '#d8d2c4');
  px(sx - 14, sy - 40, 8, 5, '#e30a17');
  px(sx - 21, sy - 12, 42, 8, '#123449');
  uiText(o.x, o.y, 14, T('office'), '#ffc94a', 11);
  if (M && M.active.length) uiLabel(o.x, o.y + o.h / 2 + 0.2, 8, '📦 ' + M.active.length + '/' + maxActive(), '#9df5b0', 1);
}

/* ---------- büyük proje aşamaları ---------- */
function drawProject() {
  var p = project, st = p.stage;
  var x = p.x - p.w / 2, y = p.y - p.h / 2;
  if (st === 0) {
    ctx.save(); ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(x, y)), R(pY(x, y, 0))); ctx.lineTo(R(pX(x + p.w, y)), R(pY(x + p.w, y, 0)));
    ctx.lineTo(R(pX(x + p.w, y + p.h)), R(pY(x + p.w, y + p.h, 0))); ctx.lineTo(R(pX(x, y + p.h)), R(pY(x, y + p.h, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    if (dist2(player.x, player.y, p.x, p.y) < 55) labelAt(p.x, p.y + p.h / 2 + 0.3, 6, T('stProject'), '#ffc94a', '');
    return;
  }
  /* temel */
  isoQuad(x, y, p.w, p.h, 0.6, '#9a927f');
  var cx = R(pX(p.x, p.y)), cy = R(pY(p.x, p.y, 0));
  if (st >= 1) {
    for (var i = 0; i <= 2; i++) for (var j = 0; j <= 2; j++) {
      var bx = R(pX(x + i * p.w / 2, y + j * p.h / 2)), by = R(pY(x + i * p.w / 2, y + j * p.h / 2, 0));
      px(bx - 1, by - 5, 3, 5, '#6b5334');
    }
  }
  if (st >= 2) { /* kolonlar */
    var cols = [[x + 0.2, y + 0.2], [x + p.w - 0.2, y + 0.2], [x + 0.2, y + p.h - 0.2], [x + p.w - 0.2, y + p.h - 0.2]];
    for (var c = 0; c < cols.length; c++) {
      var sx2 = R(pX(cols[c][0], cols[c][1])), sy2 = R(pY(cols[c][0], cols[c][1], 0));
      px(sx2 - 1, sy2 - 26, 3, 26, '#c9c3b2');
    }
    isoQuad(x + 0.1, y + 0.1, p.w - 0.2, p.h - 0.2, 26, 'rgba(200,195,180,.35)');
  }
  if (st >= 3) { /* duvar + çatı */
    isoBox(x + 0.15, y + 0.15, p.w - 0.3, p.h - 0.3, 0, 24, '#e6dcc4', '#bfae8c', '#d2c1a0');
    var rx = R(pX(p.x, p.y)), ry = R(pY(p.x, p.y, 24));
    for (var r = 0; r < 8; r++) px(rx - 26 + r * 3, ry - 6 - r, 26 - r * 2, 3, r % 2 ? '#b8442e' : '#c9533b');
    px(rx - 28, ry - 6, 56, 3, '#8d3423');
  }
  if (st >= 4) { /* donatım: tabela + ışık */
    var lx = R(pX(p.x, p.y + p.h / 2)), ly = R(pY(p.x, p.y + p.h / 2, 26));
    px(lx - 20, ly - 10, 40, 9, '#123449');
    uiText(p.x, p.y + p.h / 2, 30, lang === 'tr' ? 'BALIK HALİ' : 'FISH HALL', '#ffc94a', 11);
    px(lx - 22, ly + 2, 2, 8, '#3c4650'); px(lx + 20, ly + 2, 2, 8, '#3c4650');
  }
  if (st >= 5) { /* açılış: bayraklar */
    for (var f = 0; f < 3; f++) {
      var fx2 = R(pX(p.x - 0.8 + f * 0.8, p.y - p.h / 2)), fy2 = R(pY(p.x - 0.8 + f * 0.8, p.y - p.h / 2, 30));
      px(fx2, fy2 - 8, 1, 8, '#6b5334');
      px(fx2 + 1, fy2 - 8, 5, 3, f % 2 ? '#e30a17' : '#ffc94a');
    }
  } else {
    /* şantiye vinci */
    var kx = R(pX(x + p.w, y)), ky = R(pY(x + p.w, y, 0));
    px(kx - 1, ky - 34, 2, 34, '#d8a52c');
    px(kx - 10, ky - 36, 20, 2, '#d8a52c');
    px(kx + 6, ky - 34, 1, 8, '#8a8f95');
    var pr = projPct();
    px(cx - 14, cy - 44, 28, 4, '#0a1a27');
    px(cx - 13, cy - 43, R(26 * pr), 2, '#5fd37a');
    uiText(p.x, p.y, 46, pct(Math.round(pr * 100)), '#ffc94a', 12);
  }
  labelAt(p.x, p.y + p.h / 2 + 0.3, 4, UP(NM(p.n)), '#ffc94a', '');
}

/* =========================================================
   v0.4 — GÖRSEL EVRİM (§36): her seviyede siluet + malzeme değişir
   Lv1 geçici/ahşap → Lv3 taş/tuğla/metal → Lv5 ticari kompleks
   ========================================================= */
var SERV_MAT = [
  { top: '#b88b57', l: '#704523', r: '#93602f', roof: null,      foot: 1.00, h: 16 },
  { top: '#c79d68', l: '#7a5030', r: '#a06d3e', roof: null,      foot: 1.12, h: 21 },
  { top: '#ddd2b9', l: '#95876f', r: '#b9aa8c', roof: '#b8442e', foot: 1.24, h: 27 },
  { top: '#e8ddc5', l: '#9d8f77', r: '#c4b596', roof: '#a63d2a', foot: 1.34, h: 34 },
  { top: '#f2e7cd', l: '#aa9a7f', r: '#d2c2a1', roof: '#843526', foot: 1.44, h: 42 }
];
function servRoof(sx, sy, w, lv, col) {
  var n = 5 + lv;
  for (var r = 0; r < n; r++) px(sx - w / 2 + r * 2, sy - 3 - r * 1.4, w - r * 3.4, 2, r % 2 ? col : shade(col, 12));
  px(sx - w / 2 - 2, sy - 3, w + 4, 2, '#5d3423');
}
function shade(c, n) {
  var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
  function q(v) { return Math.max(0, Math.min(255, v + n)).toString(16).padStart(2, '0'); }
  return '#' + q(r) + q(g) + q(b);
}
/* küçük fiziksel tabela — dev yazı yok (§36 Tabela kuralı) */
function servSign(d, x, y, z, lv) {
  var sx = R(pX(x, y)), sy = R(pY(x, y, z));
  var w = 10 + lv * 3;
  px(sx - w / 2, sy - 6, w, 5, '#123449');
  px(sx - w / 2 + 1, sy - 5, w - 2, 3, d.acc);
  if (lv >= 3) drawNazar(sx, sy - 9);
  if (lv >= 3) { px(sx - w / 2, sy - 1, 1, 4, '#3c4650'); px(sx + w / 2 - 1, sy - 1, 1, 4, '#3c4650'); }
}
/* idle animasyon: fan / duman / ışık — Lv3+ (§36 Animasyon) */
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
function drawServ(p) {
  var id = p.b, d = sdef(id), st = servState[id];
  if (!d || !st) return;
  var lv = st.lvl, M2 = SERV_MAT[lv - 1];
  var fw = M2.foot, hh = M2.h;
  var sx = R(pX(p.x, p.y)), sy = R(pY(p.x, p.y, 0));

  /* inşaat/yükseltme sekansı: işaretleme → iskelet → toz → reveal (§36.1) */
  if (st.cons > 0 && !st.fresh) {
    /* yükseltmede bina kullanılamaz hale gelmez: normal çizim + toz + iskele */
    if (Math.random() < 0.3) addPuff(p.x + rnd(-0.5, 0.5), p.y + rnd(-0.5, 0.5), '#d8cfae');
  }
  if (st.cons > 0 && st.fresh) {
    var ph = st.cons;                                   /* 2.2 → 0 */
    ctx.save(); ctx.setLineDash([2, 2]); ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R(pX(p.x - fw, p.y - fw)), R(pY(p.x - fw, p.y - fw, 0)));
    ctx.lineTo(R(pX(p.x + fw, p.y - fw)), R(pY(p.x + fw, p.y - fw, 0)));
    ctx.lineTo(R(pX(p.x + fw, p.y + fw)), R(pY(p.x + fw, p.y + fw, 0)));
    ctx.lineTo(R(pX(p.x - fw, p.y + fw)), R(pY(p.x - fw, p.y + fw, 0)));
    ctx.closePath(); ctx.stroke(); ctx.restore();
    if (ph < 1.6) {                                     /* iskelet */
      for (var c2 = 0; c2 < 4; c2++) {
        var ox = c2 % 2 ? fw : -fw, oy = c2 < 2 ? -fw : fw;
        var bx = R(pX(p.x + ox * 0.8, p.y + oy * 0.8)), by = R(pY(p.x + ox * 0.8, p.y + oy * 0.8, 0));
        px(bx - 1, by - hh * 0.7, 2, hh * 0.7, '#8d5f33');
      }
      px(sx - 12, sy - R(hh * 0.7), 24, 2, '#8d5f33');
    }
    if (ph > 0.5 && Math.random() < 0.25) addPuff(p.x + rnd(-0.6, 0.6), p.y + rnd(-0.6, 0.6), '#d8cfae');
    uiText(p.x, p.y, hh + 12, '🔨', '#ffc94a', 13, 0.9);
    return;
  }

  shadow(p.x, p.y, fw * 1.15);
  /* temel: binayı ahşap zeminden ayıran taş platform */
  isoQuad(p.x - fw * 0.64, p.y - fw * 0.64, fw * 1.28, fw * 1.28, 0.35, '#a8a08c');
  isoQuad(p.x - fw * 0.58, p.y - fw * 0.58, fw * 1.16, fw * 1.16, 1.6, '#c0b8a2');
  /* gövde */
  isoBox(p.x - fw / 2, p.y - fw / 2, fw, fw, 1.6, hh, M2.top, M2.l, M2.r);
  /* Lv4+ ikinci hacim (dikey/arka büyüme — koridora taşma yok) */
  if (lv >= 4) isoBox(p.x - fw * 0.34, p.y - fw * 0.58, fw * 0.68, fw * 0.5, hh, hh + 9, shade(M2.top, 8), shade(M2.l, 6), shade(M2.r, 6));
  /* çatı — Lv1-2 binanın kimlik rengi, Lv3+ kiremit + kimlik şeridi */
  servRoof(sx, sy - hh, R(fw * 22), lv, M2.roof || d.acc);
  px(sx - R(fw * 11) - 2, sy - hh - 2, R(fw * 22) + 4, 2, d.acc);
  /* kapı + pencere */
  px(sx - 4, sy - 10, 8, 10, lv >= 3 ? '#4a5258' : '#6f4526');
  if (lv >= 2) { px(sx - 11, sy - R(hh * 0.62), 6, 5, '#3f6f8f'); px(sx + 5, sy - R(hh * 0.62), 6, 5, '#3f6f8f'); }
  if (lv >= 3) { px(sx - 11, sy - R(hh * 0.62), 6, 1, '#7fb7d4'); px(sx + 5, sy - R(hh * 0.62), 6, 1, '#7fb7d4'); }
  /* Lv2+ sundurma */
  if (lv >= 2) { px(sx - R(fw * 11) - 3, sy - 12, R(fw * 22) + 6, 3, d.acc); px(sx - R(fw * 11) - 3, sy - 9, 2, 9, '#5d3c1c'); px(sx + R(fw * 11) + 2, sy - 9, 2, 9, '#5d3c1c'); }
  if (lv >= 3) {
    for (var tile = -R(fw * 8); tile < R(fw * 8); tile += 4) { dot(sx + tile, sy - 3, tile % 8 ? '#1e7580' : '#e8ddc5'); }
  }
  if (lv >= 4) { px(sx - R(fw * 11), sy - 1, R(fw * 22), 1, '#d9ad4a'); }
  if (lv >= 5) {
    px(sx + R(fw * 10), sy - hh - 12, 1, 14, '#d9d2c3'); px(sx + R(fw * 10) + 1, sy - hh - 12, 7, 4, '#c7252d');
    dot(sx + R(fw * 10) + 3, sy - hh - 10, '#f6efe0'); dot(sx + R(fw * 10) + 6, sy - hh - 10, '#f6efe0');
  }

  /* --- binaya özgü proplar --- */
  if (id === 'buzhane') {
    for (var i = 0; i < Math.min(4, lv + 1); i++) { px(sx - 16 + i * 5, sy - 5, 4, 4, '#bfe0ef'); px(sx - 16 + i * 5, sy - 5, 4, 1, '#e6f4fb'); }
    if (lv >= 3) { px(sx + 9, sy - 18, 5, 6, '#5d666e'); px(sx + 10, sy - 17, 3, 4, '#8b949c'); }
    if (lv >= 4) { px(sx + 12, sy - 6, 6, 5, '#7d868e'); px(sx + 12, sy - 7, 6, 1, '#c9d0d6'); }
  } else if (id === 'tamirhane') {
    px(sx - 18, sy - 7, 10, 3, '#8d5f33'); px(sx - 17, sy - 10, 3, 3, '#c98a3c');
    if (lv >= 2) { px(sx - 14, sy - 26, 2, 16, '#d8a52c'); px(sx - 20, sy - 27, 12, 2, '#d8a52c'); px(sx - 13, sy - 25, 1, 8, '#8a8f95'); }
    if (lv >= 4) { px(sx + 13, sy - 14, 5, 14, '#5d666e'); for (var r4 = 0; r4 < 3; r4++) px(sx + 13, sy - 12 + r4 * 4, 5, 1, '#9aa2aa'); }
  } else if (id === 'hal') {
    for (var t2 = 0; t2 < Math.min(3, lv); t2++) {
      var tx = sx - 20 + t2 * 15;
      px(tx, sy - 8, 12, 3, '#c9a15e'); px(tx + 1, sy - 5, 2, 5, '#8d5f33'); px(tx + 9, sy - 5, 2, 5, '#8d5f33');
      px(tx, sy - 11, 12, 3, t2 % 2 ? '#e30a17' : '#f0ece0');
      px(tx + 3, sy - 9, 3, 2, '#7fb7d4');
    }
    if (lv >= 3) { px(sx + 12, sy - 20, 8, 14, '#9d8f74'); px(sx + 13, sy - 12, 6, 8, '#4a5258'); }
  } else if (id === 'restoran') {
    for (var m = 0; m < Math.min(3, lv); m++) {
      var mx = sx - 22 + m * 13, my = sy - 2 + (m % 2) * 3;
      px(mx, my - 5, 9, 2, '#e8ddc8'); px(mx + 3, my - 3, 3, 4, '#a9743f');
      px(mx - 2, my - 4, 2, 3, '#8d5f33'); px(mx + 9, my - 4, 2, 3, '#8d5f33');
    }
    if (lv >= 3) { px(sx - 24, sy - 16, 48, 3, '#d1584a'); for (var st2 = 0; st2 < 6; st2++) px(sx - 24 + st2 * 8, sy - 16, 4, 3, '#f0ece0'); }
    if (lv >= 5) { px(sx - 6, sy - hh - 20, 12, 8, '#ffd76a'); px(sx - 4, sy - hh - 18, 8, 4, '#d1584a'); }
  } else if (id === 'nakliye') {
    px(sx - 22, sy - 12, 14, 10, '#4a7a9a'); px(sx - 22, sy - 12, 14, 2, '#6f9cbd'); px(sx - 18, sy - 9, 2, 5, '#2b4a60');
    if (lv >= 2) { px(sx + 10, sy - 12, 12, 10, '#7a6a4a'); px(sx + 10, sy - 12, 12, 2, '#9a8a66'); }
    if (lv >= 4) { px(sx - 26, sy - 3, 18, 3, '#5d666e'); px(sx - 26, sy, 18, 2, '#3c4650'); }
    px(sx - 9, sy - R(hh * 0.9), 18, 7, '#123449'); px(sx - 7, sy - R(hh * 0.9) + 2, 14, 3, '#9aa8b4');
  } else if (id === 'yakit') {
    for (var b2 = 0; b2 < Math.min(4, lv + 1); b2++) { px(sx - 20 + b2 * 6, sy - 9, 5, 8, b2 % 2 ? '#c94a1a' : '#d8a52c'); px(sx - 20 + b2 * 6, sy - 9, 5, 1, '#f0ece0'); }
    px(sx + 10, sy - 14, 5, 13, '#d1584a'); px(sx + 11, sy - 12, 3, 4, '#f0ece0');
    if (lv >= 3) { px(sx + 17, sy - 24, 12, 22, '#c2c8ce'); px(sx + 17, sy - 24, 12, 3, '#e2e8ee'); px(sx + 19, sy - 14, 8, 2, '#8b949c'); }
    if (lv >= 5) { px(sx - 30, sy - 28, 11, 26, '#c2c8ce'); px(sx - 30, sy - 28, 11, 3, '#e2e8ee'); }
  } else if (id === 'tersane') {
    for (var k2 = 0; k2 < 5; k2++) px(sx - 24 + k2 * 4, sy + 1 + k2, 22, 2, '#7a5e3a');
    px(sx - 26, sy - 8, 6, 9, '#8d5f33');
    if (lv >= 2) { px(sx + 14, sy - 30, 2, 29, '#d8a52c'); px(sx + 6, sy - 32, 18, 2, '#d8a52c'); px(sx + 20, sy - 30, 1, 8, '#8a8f95'); }
    if (lv >= 3) { px(sx - 20, sy - 20, 16, 18, '#9d8f74'); px(sx - 18, sy - 12, 12, 10, '#4a5258'); }
    if (lv >= 4) { px(sx - 34, sy - 26, 2, 25, '#d8a52c'); px(sx - 40, sy - 28, 14, 2, '#d8a52c'); }
    if (lv >= 5) { px(sx + 2, sy - hh - 16, 16, 7, '#1f4e6b'); px(sx + 4, sy - hh - 14, 12, 3, '#7fb7d4'); }
  }

  servSign(d, p.x, p.y + 0.52, 0, lv);
  servIdle(d, sx, sy, lv);

  /* seviye atlama parlaması */
  if (st.flash > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(0.5, st.flash * 0.35);
    isoQuad(p.x - fw / 2, p.y - fw / 2, fw, fw, hh + 2, '#ffe27a'); ctx.restore();
  }
  /* harita etiketi yalnız seçiliyken veya yakınken (§37 Harita Etiketi) */
  if (servSel === id || (barTab === 'serv' && servPick === id)) {
    uiLabel(p.x, p.y, hh + 20, NM(d.n) + ' Lv.' + lv, '#ffc94a', 1);
  } else if (dist2(player.x, player.y, p.x, p.y) < 12) {
    uiLabel(p.x, p.y, hh + 20, d.icon + ' Lv.' + lv, '#e8ddc8', 0.85);
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
  if (DEPOT.unlocked) push(DEPOT.x + DEPOT.y, drawDepot);
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

  for (i = 0; i < customers.length; i++) (function (cu) { push(cu.x + cu.y + 0.2, function () { drawCustomer(cu); }); })(customers[i]);
  for (i = 0; i < workers.length; i++) (function (w) {
    var col = w.role === 'hamal' ? '#4f7fae' : w.role === 'filetocu' ? '#5f8f6a' : w.role === 'tezgahtar' ? '#b8624a' : '#7a6ba8';
    push(w.x + w.y + 0.15, function () {
      drawPerson(w, { coat: col, coat2: shade(col, 12), skin: SKIN[1], hair: HAIR[0], face: w.face,
        bag: w.role === 'hamal' || w.role === 'tezgahtar', cap: w.role === 'filetocu' ? '#efe5cc' : '#304a56',
        capBand: w.role === 'kasiyer' ? '#d9ad4a' : null, must: true, role: w.role,
        sash: w.role === 'filetocu' ? '#f1e8d4' : '#a84836', shirt: '#e7d7b8' });
      uiText(w.x, w.y, 26, ROLES[w.role].icon, '#fff', 11);
    });
  })(workers[i]);
  push(player.x + player.y + 0.25, function () {
    var sx = R(pX(player.x, player.y)), sy = R(pY(player.x, player.y, 0));
    ctx.save(); ctx.globalAlpha = 0.55 + (Math.sin(gameT * 4) > 0 ? 0.15 : 0);
    ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx, sy - 4); ctx.lineTo(sx + 8, sy); ctx.lineTo(sx, sy + 4);
    ctx.closePath(); ctx.stroke(); ctx.restore();
    drawPerson(player, { coat: '#17485d', coat2: '#1e7580', skin: SKIN[0], hair: HAIR[0], face: player.face,
      bag: true, cap: '#173f58', capBand: '#d9ad4a', must: true, sash: '#b83b31', shirt: '#eadbb8' });
  });

  list.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < list.length; i++) list[i].f();

  if (S.started && playerOccluded()) {
    ctx.save(); ctx.globalAlpha = 0.45;
    drawPerson(player, { coat: '#17485d', coat2: '#1e7580', skin: SKIN[0], hair: HAIR[0], face: player.face,
      bag: true, cap: '#173f58', capBand: '#d9ad4a', must: true, sash: '#b83b31', shirt: '#eadbb8' });
    ctx.restore();
    var gx = R(pX(player.x, player.y)), gy = R(pY(player.x, player.y, 26));
    px(gx - 2, gy, 5, 2, '#ffc94a'); px(gx - 1, gy + 2, 3, 2, '#ffc94a'); px(gx, gy + 4, 1, 2, '#ffc94a');
  }
  for (i = 0; i < gulls.length; i++) drawGull(gulls[i]);
  drawFlyers(); drawPuffs(); drawFloats();
  if (S.started) { var tg = tutorialTarget(); if (tg) drawArrow(tg); }

  renderUI();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (S.started && DAY.phase === 'play') {
    var sunP = clamp(DAY.t / DAY.len, 0, 1), dusk = Math.max(0, (sunP - 0.68) / 0.32);
    ctx.fillStyle = dusk > 0 ? 'rgba(128,45,32,' + (dusk * 0.075) + ')' : 'rgba(255,220,145,' + ((1 - sunP / 0.68) * 0.025) + ')';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
  }
  if (stick.active) {
    var jx = R(stick.bx / PXS), jy = R(stick.by / PXS);
    ctx.globalAlpha = 0.25;
    px(jx - 14, jy - 2, 28, 4, '#fff'); px(jx - 2, jy - 14, 4, 28, '#fff');
    ctx.globalAlpha = 0.5;
    px(jx - 4 + R(stick.dx * 12), jy - 4 + R(stick.dy * 12), 8, 8, '#fff');
    ctx.globalAlpha = 1;
  }
}

/* =========================================================
   ARAYÜZ (DOM)
   ========================================================= */
var el = {};
['money', 'carry', 'carryIcon', 'rep', 'repfill', 'eventChip', 'eventIcon', 'eventName', 'eventT', 'objective',
 'objLbl', 'objText', 'queueHint', 'toast', 'devbar', 'devpanel', 'dpTitle', 'dpCards', 'dpClose',
 'hMoney', 'hCarry', 'hRep', 'startTag', 'startList', 'playBtn', 'setBtn', 'setTitle', 'setLang',
 'setSound', 'setZoom', 'setClose', 'resetBtn', 'closeMenu', 'menuSet', 'langLbl', 'tabBody',
 'startScreen', 'settingsScreen', 'menuScreen', 'menuBtn', 'dtArea', 'dtLevel', 'dtBuild', 'dtProj', 'dtServ',
 'pauseBadge', 'pauseTxt', 'saveInfo', 'setSaveInfo', 'saveBtn', 'saveQuitBtn', 'menuSave', 'newBtn', 'setSaveLbl',
 'hDay', 'dayNo', 'depotBtn', 'depotLbl', 'depotScreen', 'depotClose', 'depotTitle', 'depotCap', 'depotBody'].forEach(function (id) {
  el[id] = document.getElementById(id);
});
var toastT = 0;
function toast(msg) { el.toast.textContent = msg; el.toast.classList.add('on'); toastT = 2.6; }

function applyLang() {
  document.documentElement.lang = lang;
  el.hMoney.textContent = T('money'); el.hCarry.textContent = T('carry'); el.hRep.textContent = T('rep');
  el.startTag.textContent = T('tag');
  el.startList.innerHTML = ['intro1', 'intro2', 'intro3', 'intro4', 'intro5'].map(function (k) {
    return '<li>' + T(k) + '</li>';
  }).join('') + '<li style="opacity:.7">' + T('ctrl') + '</li>';
  el.playBtn.textContent = T('play'); el.setBtn.textContent = T('settings');
  el.setTitle.textContent = T('settings'); el.setLang.textContent = T('langLbl');
  el.setSound.textContent = T('soundLbl'); el.setZoom.textContent = T('zoomLbl');
  el.setClose.textContent = T('resume'); el.resetBtn.textContent = T('reset');
  el.closeMenu.textContent = T('resume'); el.menuSet.textContent = T('settings');
  el.saveBtn.textContent = T('saveNow'); el.saveQuitBtn.textContent = T('saveQuit');
  el.menuSave.textContent = T('saveNow'); el.newBtn.textContent = T('newGame');
  el.setSaveLbl.textContent = T('setSave'); el.pauseTxt.textContent = T('paused');
  el.hDay.textContent = T('dayHud'); el.depotLbl.textContent = T('depot'); el.depotTitle.textContent = T('depot');
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
  Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button'), function (b) {
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
  if (!player.carry.length) return '🧺';
  var top = 'fish';
  for (var k in n) if (n[k] > n[top]) top = k;
  return top === 'fish' ? '🐟' : top === 'fileto' ? '🍥' : top === 'fume' ? '🔥' : '💰';
}
function syncHUD(dt) {
  el.money.textContent = Math.round(S.cash).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US');
  el.carry.textContent = carryW(player) + '/' + capacity();
  el.carryIcon.textContent = carryIcon();
  el.rep.textContent = S.rep;
  el.dayNo.textContent = DAY.day + (DAY.market ? ' ★' : '');
  var lvl = repLevel(), cur = REP_LEVELS[lvl - 1].need, nxt = lvl < REP_LEVELS.length ? REP_LEVELS[lvl].need : cur + 1;
  el.repfill.style.width = clamp((S.rep - cur) / (nxt - cur) * 100, 0, 100) + '%';
  if (event) {
    el.eventChip.classList.remove('hidden');
    el.eventIcon.textContent = event.icon;
    el.eventName.textContent = T(event.name);
    el.eventT.textContent = Math.ceil(eventT) + 's';
  } else el.eventChip.classList.add('hidden');
  if (S.tut < TUTOK.length) {
    el.objective.classList.remove('hidden');
    el.objLbl.textContent = T('goal') + ' ' + (S.tut + 1) + '/' + TUTOK.length;
    el.objText.textContent = T('tut')[S.tut];
  } else {
    var o = urgentOrder();
    /* §7: görev bandı yalnız gerektiğinde */
    if (o && o.pat < 26) {
      el.objective.classList.remove('hidden');
      el.objLbl.textContent = T('orderOf', { n: UP(NM(o.type.n)) });
      el.objText.textContent = prodName(o.ord.k, o.ord.f) + ' x' + (o.ord.need - o.ord.got) + ' - ' + Math.ceil(o.pat) + 's';
    } else el.objective.classList.add('hidden');
  }
  var w = waitingCount();
  if (w >= 4) { el.queueHint.classList.remove('hidden'); el.queueHint.textContent = T('waiting', { n: w }); }
  else el.queueHint.classList.add('hidden');
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('on'); }
  if (cfT > 0) { cfT -= dt; if (cfT <= 0 && cfId) { cfId = null; renderBar(); } }
  barHot();
  syncTradeBtn();
  el.depotBtn.classList.toggle('hidden', !DEPOT.unlocked || !S.started);
  ofRefresh -= dt;
  if (ofRefresh <= 0) {
    ofRefresh = 1;
    if (!document.getElementById('officeScr').classList.contains('hidden')) renderOffice();
  }
}

/* ---------- Merkezi Depo paneli (GDD v1.1) ---------- */
function priorityName(v) { return T(v === 0 ? 'prLow' : v === 2 ? 'prHigh' : 'prNormal'); }
function renderDepot() {
  el.depotCap.textContent = DEPOT.items.length + ' / ' + DEPOT.cap;
  var h = '<div class="depot-stock">';
  for (var i = 0; i < FISH_ORDER.length; i++) {
    var f = FISH_ORDER[i], n = depotStock(f); if (n) h += '<span><b>' + NM(FISH[f].n) + '</b> ×' + n + '</span>';
  }
  if (!DEPOT.items.length) h += '<span class="muted">' + T('depotDrop') + '</span>';
  h += '</div>';
  if (!DEPOT.auto) {
    h += '<div class="depot-auto"><b>🧺 ' + T('depotAuto') + '</b><small>' + T('depotAutoD') + '</small>' +
      '<button id="depotHire" class="go' + (S.cash < 2500 ? ' no' : '') + '">' + money(2500) + '</button></div>';
  } else h += '<div class="depot-active">✓ ' + T('depotAutoOn') + '</div>';
  h += '<div class="depot-lines">';
  for (i = 0; i < counters.length; i++) {
    var c = counters[i]; if (AREAS[c.z].locked || !c.fish) continue;
    h += '<div class="depot-line" data-k="' + c.key + '"><div><b>' + NM(FISH[c.fish].n) + '</b><small>' +
      c.buffer.length + ' / ' + counterMax(c) + '</small></div><div class="target-ctl"><span>' + T('target') + '</span>' +
      '<button data-step="-1">−</button><b>' + depotTarget(c) + '</b><button data-step="1">+</button></div>' +
      '<button class="priority p' + depotPriority(c) + '" data-pr="1">' + priorityName(depotPriority(c)) + '</button></div>';
  }
  el.depotBody.innerHTML = h + '</div>';
  var hireBtn = document.getElementById('depotHire');
  if (hireBtn) hireBtn.onclick = function () {
    if (S.cash < 2500) { sfx.bad(); toast(T('noMoney')); return; }
    S.cash -= 2500; DEPOT.auto = true; sfx.build(); save(); renderDepot();
  };
  Array.prototype.forEach.call(el.depotBody.querySelectorAll('.depot-line'), function (row) {
    var c = null; for (var j = 0; j < counters.length; j++) if (counters[j].key === row.dataset.k) c = counters[j];
    if (!c) return;
    Array.prototype.forEach.call(row.querySelectorAll('[data-step]'), function (b) {
      b.onclick = function () {
        var map = DAY.market ? DEPOT.marketTargets : DEPOT.targets;
        map[c.key] = clamp(depotTarget(c) + parseInt(b.dataset.step, 10), 3, counterMax(c)); sfx.ui(); save(); renderDepot();
      };
    });
    row.querySelector('[data-pr]').onclick = function () {
      var map = DAY.market ? DEPOT.marketPriorities : DEPOT.priorities;
      map[c.key] = (depotPriority(c) + 1) % 3; sfx.ui(); save(); renderDepot();
    };
  });
}
function openDepot() { if (!DEPOT.unlocked) return; el.depotScreen.classList.remove('hidden'); renderDepot(); sfx.ui(); syncPause(); }
function closeDepot() { el.depotScreen.classList.add('hidden'); sfx.ui(); syncPause(); }
el.depotBtn.onclick = openDepot; el.depotClose.onclick = closeDepot;

/* ---------- alt panel ---------- */
/* =========================================================
   ALT GELİŞTİRME BARI (GDD v0.3.1 §3)
   ========================================================= */
var barTab = null, barSlot = null, cfId = null, cfT = 0;
var servSel = null, servPick = null;   /* v0.4 — seçili bina / parsel önizlemesi */
function closeBar() {
  barTab = null; barSlot = null; cfId = null; servPick = null;
  el.devpanel.classList.add('hidden');
  document.body.classList.remove('panel');
  Array.prototype.forEach.call(document.querySelectorAll('.dtab'), function (b) { b.classList.remove('on'); });
}
function openBar(t) {
  if (barTab === t) { closeBar(); return; }
  barTab = t; barSlot = null; cfId = null; servPick = null;
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
      out.push({ id: 'a' + i, ic: '🔓', t: NM(a.n), s: T('areaGives') + (a.rep ? ' • ⭐' + a.rep : ''),
        cost: upCost(a.cost), blocked: blk, why: T('needRep', { n: a.rep, c: S.rep }),
        go: function (k) { return function () { AREAS[k].locked = false; rebuildCounters(); reassignWorkers(); clampCam(); sfx.build(); toast(T('areaOpen', { n: NM(AREAS[k].n) })); }; }(i) });
      break;
    }
    if (!out.length) out.push({ empty: T('emptyArea') });
  } else if (barTab === 'level') {
    for (i = 0; i < AREAS.length; i++) {
      var ar = AREAS[i];
      if (ar.locked || ar.lvl >= MAXLV) continue;
      out.push({ id: 'l' + i, ic: '🏗️', t: NM(ar.n) + '  ' + T('level') + ar.lvl + '→' + (ar.lvl + 1),
        s: areaLevelEffect(ar), cost: upCost(ar.up[ar.lvl]),
        go: function (k) { return function () { AREAS[k].lvl++; rebuildCounters(); sfx.build(); toast(T('areaLvUp', { n: NM(AREAS[k].n), l: AREAS[k].lvl })); }; }(i) });
    }
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
    if (barSlot) {
      out.push({ id: 'back', ic: '↩', t: T('back'), s: '', back: true });
      var sl = barSlot;
      for (i = 0; i < BUILDINGS.length; i++) {
        var bd = BUILDINGS[i];
        if (sl.cats.indexOf(bd.cat) < 0) continue;
        var owned = sl.b === bd.id;
        var refund = sl.b ? Math.round(bdef(sl.b).cost * 0.6) : 0;
        out.push({ id: 'b' + bd.id, ic: bd.icon, t: NM(bd.n), s: NM(bd.d), cost: upCost(bd.cost), refund: refund,
          owned: owned, go: function (b2) { return function () { slotBuild(barSlot, b2); }; }(bd.id) });
      }
    } else {
      var n = 0;
      for (i = 0; i < SLOTS.length; i++) {
        var s2 = SLOTS[i];
        if (!slotActive(s2)) continue;
        n++;
        var d2 = s2.b ? bdef(s2.b) : null;
        out.push({ id: 's' + s2.id, ic: d2 ? d2.icon : '🔨', t: d2 ? NM(d2.n) : T('slotEmpty'),
          s: T('slotOf', { n: NM(AREAS[s2.z].n) }) + (d2 ? ' • ' + NM(d2.d) : ''),
          pick: T(d2 ? 'replace' : 'choose'),
          go: function (sx) { return function () { barSlot = sx; cfId = null; renderBar(); }; }(s2) });
      }
      for (i = 0; i < DECOR.length; i++) {
        var dc = DECOR[i];
        if (dc.got || AREAS[dc.z].locked) continue;
        out.push({ id: 'd' + i, ic: dc.icon, t: NM(dc.n), s: T('decorGroup') + ' • ' + NM(AREAS[dc.z].n), cost: dc.cost,
          go: function (k) { return function () { DECOR[k].got = true; sfx.build(); toast(T('decorBought', { n: NM(DECOR[k].n) })); }; }(i) });
      }
      if (!n && out.length === 0) out.push({ empty: T('emptyBuild') });
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
  var refund = sl.b ? Math.round(upCost(bdef(sl.b).cost) * 0.6) : 0;
  if (sl.b === id) return;
  if (S.cash + refund < price) { toast(T('noMoney')); sfx.bad(); return; }
  S.cash += refund - price;
  sl.b = id; rebuildCounters(); reassignWorkers();
  sfx.build(); toast(T('built', { n: NM(d.n) }));
  addPuff(sl.x, sl.y, '#ffc94a');
  barSlot = null; save(); renderBar();
}
function renderBar() {
  if (!barTab) return;
  el.dpTitle.textContent = T(barTab === 'area' ? 'tArea' : barTab === 'level' ? 'tLevel' : barTab === 'build' ? 'tBuild' : barTab === 'serv' ? 'tServ' : 'tProj');
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
  el.dpCards.innerHTML = h;
  Array.prototype.forEach.call(el.dpCards.querySelectorAll('.buy'), function (b) {
    b.onclick = function () {
      var c = list[parseInt(b.dataset.i, 10)];
      if (!c) return;
      if (c.back) { barSlot = null; servPick = null; cfId = null; renderBar(); return; }
      if (c.pick) { c.go(); return; }
      if (c.owned) return;
      if (c.blocked) { sfx.bad(); toast(c.why); return; }
      var needCf = c.cost >= 1500 || barTab === 'area' || barTab === 'serv' || (barTab === 'level' && c.id.charAt(0) === 'l');
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
      (okRep ? (cfId === 'office' ? T('confirm') : money(oc)) : T('needRep', { n: ECON.officeRep, c: S.rep })) + '</button></div>';
  }
  if (M && M.office && !M.license) {
    var lc = upCost(ECON.licenseCost), okR2 = S.rep >= ECON.licenseRep;
    extra += '<div class="dcard"><span class="ic">📜</span><b>' + T('license') + '</b><small>' + T('licenseD') + '</small>' +
      '<button class="buy' + (okR2 && S.cash >= lc ? (cfId === 'lic' ? ' cf' : '') : ' no') + '" data-x="lic">' +
      (okR2 ? (cfId === 'lic' ? T('confirm') : money(lc)) : T('needRep', { n: ECON.licenseRep, c: S.rep })) + '</button></div>';
  }
  if (AREAS[project.z].locked) {
    el.dpCards.innerHTML = extra || '<div class="dempty">' + T('emptyProj') + '</div>';
    bindProjExtra(); return;
  }
  var pc = projPct();
  if (project.done) {
    el.dpCards.innerHTML = extra + '<div class="dcard"><span class="ic">🏛️</span><b>' + NM(project.n) +
      '</b><small>' + T('done') + ' ✔</small></div>';
    bindProjExtra(); return;
  }
  var nextTh = project.stages[Math.min(project.stage, project.stages.length - 1)] * project.total;
  el.dpCards.innerHTML = extra + '<div class="dcard dwide"><b>' + NM(project.n) + '  ' + T('stage') + ' ' + project.stage + '/5</b>' +
    '<div class="dbar"><i style="width:' + Math.round(pc * 100) + '%"></i></div>' +
    '<small>' + money(project.inv) + ' / ' + money(project.total) + ' — ' + T('nextStage') + ': ' + money(Math.max(0, nextTh - project.inv)) + '</small>' +
    '<div class="dinv"><button data-a="1000">+' + money(1000) + '</button><button data-a="10000">+' + money(10000) +
    '</button><button data-a="q">' + T('pct25') + '</button><button data-a="max">' + T('maxInvest') + '</button></div></div>';
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
  for (i = 0; i < AREAS.length; i++) if (!AREAS[i].locked && AREAS[i].lvl < MAXLV && S.cash >= AREAS[i].up[AREAS[i].lvl]) hot.level = true;
  for (i = 0; i < PADS.length; i++) {
    var p = PADS[i];
    if (p.kind === 'decor' || p.kind === 'area' || p.kind === 'arealv') continue;
    if (!AREAS[p.z].locked && p.lvl < p.max && !padBlocked(p) && S.cash >= padPrice(p)) hot.level = true;
  }
  for (i = 0; i < SLOTS.length; i++) if (slotActive(SLOTS[i]) && !SLOTS[i].b && S.cash >= 900) hot.build = true;
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
      h += row(Rl.icon, w.name + ' - ' + NM(Rl.n), NM(Rl.d), money(Rl.wage) + perMin(), T('carry') + ' ' + carryW(w) + '/' + Rl.cap);
    }
    h += row('👷', T('mStaffCap'), '', workers.length + '/' + staffCap());
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
  el.tabBody.innerHTML = h;
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

/* ---------- ayarlar ---------- */
function setLangTo(l) { lang = l; applyLang(); save(); }
Array.prototype.forEach.call(document.querySelectorAll('#langSeg button,#langSeg2 button'), function (b) {
  b.onclick = function () { setLangTo(b.dataset.l); };
});
Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (b) {
  b.onclick = function () {
    soundOn = b.dataset.s === '1';
    if (soundOn) { ensureAudio(); startHarborAmbience(); sfx.ui(); } else stopHarborAmbience();
    Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.remove('on'); });
    b.classList.add('on'); save();
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
el.newBtn.onclick = function () { if (confirm(T('newAsk'))) wipe(true); };
el.resetBtn.onclick = function () { if (confirm(T('resetAsk'))) wipe(); };
function syncSettingsUI() {
  Array.prototype.forEach.call(document.querySelectorAll('#sndSeg button'), function (o) { o.classList.toggle('on', (o.dataset.s === '1') === soundOn); });
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
  if (!S.started) { gameT += dt; updateFx(dt); render(); return; }
  if (paused) { render(); return; }          /* duraklatıldı: dünya tamamen donar */
  if (updateDay(dt)) { updateFx(dt); syncHUD(dt); render(); return; }
  gameT += dt; S.play += dt;
  updatePlayer(dt);
  updateWorkers(dt);
  updateStations(dt);
  updateDepot(dt);
  updateCustomers(dt);
  updateEvents(dt);
  updateMarket(dt);
  updateTutorial();
  updateFx(dt);
  if (workers.length) S.cash = Math.max(0, S.cash - wageTotal() / 60 * dt);
  updateCamera(dt);
  syncHUD(dt);
  saveT += dt; if (saveT > 6) { saveT = 0; save(); }
  render();
}
function start() {
  el.startScreen.classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('objective').classList.remove('hidden');
  el.devbar.classList.remove('hidden');
  S.started = true; paused = false; syncPause();
  if (DAY.t === 0 && DAY.phase === 'play') { DAY.phase = 'intro'; DAY.phaseT = 0; DAY.market = DAY.day % 4 === 0; showDayCard('intro'); }
  ensureAudio(); startHarborAmbience(); sfx.ui();
}
el.playBtn.onclick = start;
/* ESC: oyunu duraklat / devam ettir */
window.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape' && e.key !== 'Esc') return;
  if (!S.started) return;
  if (!document.getElementById('depotScreen').classList.contains('hidden')) { e.preventDefault(); closeDepot(); return; }
  if (!document.getElementById('officeScr').classList.contains('hidden')) { e.preventDefault(); closeOffice(); return; }
  e.preventDefault();
  if (!el.settingsScreen.classList.contains('hidden')) { el.setClose.click(); return; }
  if (!el.menuScreen.classList.contains('hidden')) { el.closeMenu.click(); return; }
  openPauseMenu();
});
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

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
        growth: 50, risk: c.risk, sent: 0, total: 10000, free: Math.round(10000 * c.fl), own: 0, rel: 0,
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
    var c = M.co[i], d = cdef(c.id), pct = ownPct(c);
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
function shareTotal(c) { return Math.max(1, c.total || 10000); }
function ownPct(c) { return c.own / shareTotal(c); }
function portfolioValue() {
  if (!M) return 0;
  var v = 0;
  for (var i = 0; i < M.co.length; i++) v += M.co[i].own * M.co[i].price;
  return v;
}
function subsValue() {
  var v = 0;
  for (var i = 0; i < M.co.length; i++) if (ownPct(M.co[i]) >= 1) v += shareTotal(M.co[i]) * M.co[i].price * 1.2;
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
  M.t += dt;
  updateContracts(dt);
  if (M.t >= ECON.dayLen) { M.t = 0; closeDay(); }
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
    capTot += c.price * shareTotal(c); capPrev += c.prev * shareTotal(c);
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
  if (pinc > 0) { S.cash += pinc; notify(T('privIncome', { v: money(pinc) }), 'low'); }
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
    c.free += add; c.total = shareTotal(c) + add; c.price = Math.max(8, Math.round(c.price * 0.97 * 100) / 100);
    c.health = clamp(c.health + 6, 0, 100);
    notify(T('corpRaise', { n: NM(d.n) }), 'low');
  } else if (kind === 'buyback') {
    var rm = Math.min(c.free - 500, Math.round(600 * sr(0.5, 1.5)));
    if (rm > 0) { c.free -= rm; c.total = Math.max(c.own, shareTotal(c) - rm); c.price = Math.round(c.price * 1.04 * 100) / 100; notify(T('corpBuy', { n: NM(d.n) }), 'low'); }
  } else if (kind === 'split') {
    c.price = Math.round(c.price / 2 * 100) / 100; c.free *= 2; c.own *= 2; c.total = shareTotal(c) * 2;
    notify(T('corpSplit', { n: NM(d.n) }), 'low');
  }
}
function payDividends() {
  var tot = 0;
  for (var i = 0; i < M.co.length; i++) {
    var c = M.co[i], d = cdef(c.id);
    if (c.health < ECON.dividendHealth || c.status === 'press' || c.status === 'restr') continue;
    if (!c.own) continue;
    var pool = c.price * shareTotal(c) * 0.15 * d.div * (1 + (c.divBonus || 0));
    var pay = Math.round(pool * ownPct(c));
    if (pay > 0) { S.cash += pay; tot += pay; }
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
  var c = cst(entry.co), cost = Math.round(c.price * shareTotal(c) * 0.02);
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
  S.cash += ct.rew; noteFishIncome(ct.rew * 0.5);
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
  if (ownPct(c) + qty / shareTotal(c) > 0.30 && !M.license) {
    var lim = Math.max(0, Math.floor(0.30 * shareTotal(c) - c.own));
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
  var need = Math.max(0, Math.round(target * shareTotal(c)) - c.own);
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
  renderOffice(); sfx.ui(); syncPause();
}
function closeOffice() { document.getElementById('officeScr').classList.add('hidden'); sfx.ui(); syncPause(); }
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
      h += '<div class="ctrc"><b>' + T('boardT') + '</b><small>' + money(Math.round(c.price * shareTotal(c) * 0.02)) + '</small><div class="qrow">';
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
  body.innerHTML = h;
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
   BAŞLAT
   ========================================================= */
resize();
load();
rebuildCounters();
worldLoad(_pendingWorld);
reassignWorkers();
if (!M) M = newMarket();
lastRepLvl = repLevel();
applyLang();
syncSettingsUI();
refreshSaveInfo();
syncPause();
resize();
camX = pX(player.x, player.y); camY = pY(player.x, player.y, 0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { });
requestAnimationFrame(frame);
try {
  if (sessionStorage.getItem('bt_new_start') === '1') { sessionStorage.removeItem('bt_new_start'); start(); }
} catch (e) { }

window.BT = {
  cam: function () { return { x: camX, y: camY, tx: camTX, ty: camTY }; },
  S: S, player: player, spots: spots, tables: tables, smoker: smoker, counters: counters,
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
  /* duraklatma + kayıt */
  paused: function () { return paused; },
  saveNow: function () { manualSave(); return saveMeta(); },
  saveQuit: saveAndQuit, saveMeta: saveMeta,
  day: DAY, depot: DEPOT, openDepot: openDepot, newGame: function () { wipe(true); },
  openSettings: function () { openSettings(false); },
  openMenu: openPauseMenu,
  closeOverlays: function () {
    el.settingsScreen.classList.add('hidden'); el.menuScreen.classList.add('hidden'); syncPause();
  }
};


/* =========================================================
   ŞİRKETLER • KONTRATLAR • LİMAN BORSASI  (FULL GDD v1.0)
   Tek denge tablosu: ECON  (§24: kodda dağınık sabit yok)
   ========================================================= */

})();
