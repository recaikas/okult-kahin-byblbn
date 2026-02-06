import streamlit as st
import plotly.graph_objects as go
from typing import Dict, Tuple, List, Optional
import math

# ==================== PAGE CONFIGURATION ====================
st.set_page_config(
    page_title="The Hindsight: Okült Analiz",
    page_icon="👁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==================== CUSTOM CSS - JUPITER & MARS VIBE ====================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Orbitron:wght@400;500;700&family=Inter:wght@300;400;500;600&display=swap');
    
    /* Global Theme - Dark Occult */
    .stApp {
        background-color: #05080d;
        background-image: 
            radial-gradient(circle at 10% 20%, rgba(128, 0, 32, 0.1) 0%, transparent 40%), /* Burgundy (Mars) */
            radial-gradient(circle at 90% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 40%); /* Gold (Jupiter) */
        color: #e0e0e0;
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Cinzel', serif !important;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    
    /* Inputs */
    .stTextInput > div > div > input, 
    .stNumberInput > div > div > input {
        background-color: #0d121b !important;
        color: #FFD700 !important; /* Gold Text */
        border: 1px solid #3d2b1f !important;
        font-family: 'Orbitron', sans-serif !important;
        border-radius: 4px;
    }
    
    .stTextInput > div > div > input:focus {
        border-color: #FFD700 !important;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.2) !important;
    }

    /* Buttons */
    .stButton > button {
        background: linear-gradient(90deg, #3d0a15 0%, #1f1205 100%) !important;
        border: 1px solid #FFD700 !important;
        color: #FFD700 !important;
        font-family: 'Cinzel', serif !important;
        font-weight: 700 !important;
        letter-spacing: 1px;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
        transform: scale(1.02);
    }

    /* Match Cards */
    .match-card {
        background: linear-gradient(180deg, rgba(13, 18, 27, 0.95) 0%, rgba(5, 8, 13, 0.98) 100%);
        border: 1px solid rgba(255, 215, 0, 0.15);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        position: relative;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    }
    
    .card-badge {
        position: absolute;
        top: 0;
        right: 0;
        padding: 5px 15px;
        border-bottom-left-radius: 12px;
        font-family: 'Cinzel', serif;
        font-size: 12px;
        font-weight: 700;
        border-left: 1px solid;
        border-bottom: 1px solid;
    }

    /* Hero Card (Kahin) */
    .hero-card {
        background: rgba(10, 5, 5, 0.8);
        border: 2px solid #FFD700; /* Gold */
        border-radius: 4px;
        padding: 30px;
        text-align: center;
        margin-bottom: 30px;
        box-shadow: 
            0 0 40px rgba(255, 215, 0, 0.1),
            inset 0 0 30px rgba(255, 215, 0, 0.05);
        animation: pulseGold 4s infinite alternate;
    }
    
    @keyframes pulseGold {
        from { border-color: #FFD700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.1); }
        to { border-color: #B8860B; box-shadow: 0 0 50px rgba(255, 215, 0, 0.3); }
    }

    .hero-pred {
        font-family: 'Cinzel', serif;
        font-size: 42px;
        font-weight: 700;
        color: #FFD700;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        margin: 15px 0;
    }

    /* Analysis Bars */
    .schimmel-bar {
        background: rgba(20, 20, 30, 0.6);
        border-left: 4px solid #555;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 0 8px 8px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .bar-jupiter { border-left-color: #FFD700; } /* 3 - Gold */
    .bar-mars { border-left-color: #800020; } /* 5 - Burgundy */
    .bar-saturn { border-left-color: #4B0082; } /* 8 - Indigo/Dark */
    .bar-monad { border-left-color: #FFFFFF; } /* 1 - White */
    .bar-chaos { border-left-color: #FF4500; } /* 11 - OrangeRed */
    .bar-judas { border-left-color: #2F4F4F; } /* 13 - Slate */

    /* "Kadersel Analiz Metni" Box */
    .destiny-box {
        background: linear-gradient(135deg, rgba(85, 27, 27, 0.3) 0%, rgba(10, 10, 20, 0.8) 100%);
        border: 1px solid #FFD700;
        padding: 25px;
        border-radius: 4px;
        margin-top: 25px;
        font-family: 'Cinzel', serif;
        line-height: 1.6;
        color: #ddd;
        font-style: italic;
    }
    .destiny-title {
        color: #FFD700;
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 15px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    
    /* Stat Soul Card */
    .soul-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #444;
        border-radius: 6px;
        padding: 10px;
        text-align: center;
        margin-bottom: 10px;
    }
    .soul-val {
        font-size: 24px;
        font-weight: bold;
        color: #FFD700;
        font-family: 'Orbitron';
    }
    .soul-desc {
        font-size: 10px;
        color: #aaa;
        text-transform: uppercase;
    }

    /* Surprise Box */
    .surprise-box {
        background: rgba(20, 0, 20, 0.6);
        border: 1px dashed #bc13fe;
        color: #e0e0e0;
        padding: 15px;
        border-radius: 8px;
        margin-top: 20px;
    }
    .surprise-item {
        margin-bottom: 5px;
        padding-left: 10px;
        border-left: 2px solid #bc13fe;
    }

</style>
""", unsafe_allow_html=True)

# ==================== SCHIMMEL'S PHILOSOPHY ENGINE ====================

SCHIMMEL_ARCHETYPES = {
    1: {"name": "MONAD", "kw": "Mutlak Güç", "desc": "Birlik ve otorite.", "color": "#FFFFFF", "planet": "☉"},
    2: {"name": "DYAD", "kw": "Kutuplaşma", "desc": "Şüphe, ayrılık ve çatışma.", "color": "#A9A9A9", "planet": "☽"},
    3: {"name": "JUPITER", "kw": "Bolluk", "desc": "Şans, genişleme ve üretkenlik.", "color": "#FFD700", "planet": "♃"},
    4: {"name": "TETRAD", "kw": "Düzen", "desc": "Kuralcı, sağlam ama katı yapı.", "color": "#8B4513", "planet": "⊕"},
    5: {"name": "MARS", "kw": "Savaş / Yıkım", "desc": "Agresiflik, heyecan ve risk.", "color": "#800020", "planet": "♂"},
    6: {"name": "HEXAD", "kw": "Uyum / Denge", "desc": "Mükemmel simetri ve beraberlik.", "color": "#00CED1", "planet": "♀"},
    7: {"name": "CHARIOT", "kw": "Zafer / İrade", "desc": "Zorlukları aşan ruhsal güç.", "color": "#9370DB", "planet": "♆"},
    8: {"name": "SATURN", "kw": "Kısıtlama", "desc": "Engel, savunma ve disiplin.", "color": "#4B0082", "planet": "♄"},
    9: {"name": "ENNEAD", "kw": "Tamamlanma", "desc": "Bir döngünün sonu ve hüküm.", "color": "#FF8C00", "planet": "♇"},
    10: {"name": "DECIMAL", "kw": "Mükemmel Düzen", "desc": "Tanrısal otorite.", "color": "#FFFFFF", "planet": "☉+"},
    11: {"name": "CHAOS", "kw": "Kaos / Ustalık", "desc": "Düzensizlik ve yüksek gerilim.", "color": "#FF4500", "planet": "♅"},
    13: {"name": "JUDAS", "kw": "Lanet / Dönüşüm", "desc": "Hain pusu ve sistemi yıkan güç.", "color": "#2F4F4F", "planet": "☊"}
}

def theosophical_reduction(n: int) -> int:
    """
    Reduces a number repeatedly until it fits Schimmel's Archetypes.
    Preserves 11, 13, and 10 as Critical Thresholds.
    """
    if n in [11, 13]: return n
    if n == 10: return 10 
    
    while n > 9 and n not in [11, 13, 10]:
        n = sum(int(d) for d in str(n))
    return n

def calculate_soul(text: str) -> int:
    text = text.upper().replace(" ", "").replace("İ", "I").replace("Ğ", "G").replace("Ü", "U").replace("Ş", "S").replace("Ö", "O").replace("Ç", "C")
    total = sum(ord(c) - 64 for c in text if 'A' <= c <= 'Z')
    return theosophical_reduction(total)

def analyze_odd_soul(odd: float) -> Tuple[int, str]:
    if odd <= 0: return (0, "Yok")
    s = str(odd).replace('.', '')
    total = sum(int(d) for d in s if d.isdigit())
    reduced = theosophical_reduction(total)
    return reduced

# ==================== MAIN APPLICATION ====================
def main():
    st.title("👁️ THE HINDSIGHT: KADERSEL TABLO")
    st.markdown("*\"Lig tablosu sadece puanları değil, takımların ruhsal röntgenini de saklar.\"*")

    # Sidebar Input
    with st.sidebar:
        st.header("📜 TAKIM & LİG VERİLERİ")
        home = st.text_input("EV SAHİBİ", "Galatasaray")
        
        st.caption("Ev Sahibi İstatistikleri")
        col_h1, col_h2 = st.columns(2)
        with col_h1:
            h_rank = st.number_input("Sıra", 1, 30, 1)
            h_win = st.number_input("Galibiyet (G)", 0, 50, 10)
            h_draw = st.number_input("Beraberlik (B)", 0, 50, 0)
        with col_h2:
            h_loss = st.number_input("Mağlubiyet (M)", 0, 50, 0)
            h_gf = st.number_input("Attığı Gol", 0, 150, 20)
            h_ga = st.number_input("Yediği Gol", 0, 150, 5)

        st.markdown("---")
        away = st.text_input("DEPLASMAN", "Fenerbahçe")
        st.caption("Deplasman İstatistikleri")
        col_a1, col_a2 = st.columns(2)
        with col_a1:
            a_rank = st.number_input("Sıra (Dep)", 1, 30, 2)
            a_win = st.number_input("Galibiyet (Dep)", 0, 50, 8)
            a_draw = st.number_input("Beraberlik (Dep)", 0, 50, 1)
        with col_a2:
            a_loss = st.number_input("Mağlubiyet (Dep)", 0, 50, 1)
            a_gf = st.number_input("Attığı Gol (Dep)", 0, 150, 18)
            a_ga = st.number_input("Yediği Gol (Dep)", 0, 150, 20)

        st.markdown("---")
        st.subheader("💰 ORANLARIN RUHU")
        col_o1, col_o2, col_o3 = st.columns(3)
        with col_o1: odd_1 = st.number_input("MS 1", 1.0, 50.0, 1.93)
        with col_o2: odd_x = st.number_input("MS X", 1.0, 50.0, 3.50)
        with col_o3: odd_2 = st.number_input("MS 2", 1.0, 50.0, 4.20)
        
        analyze_btn = st.button("KADERI COZ (Analyze)")

    if analyze_btn:
        # --- 1. SOUL CALCULATIONS (REDUCTION) ---
        h_rank_soul = theosophical_reduction(h_rank)
        h_win_soul = theosophical_reduction(h_win)
        h_draw_soul = theosophical_reduction(h_draw)
        h_loss_soul = theosophical_reduction(h_loss)
        h_gf_soul = theosophical_reduction(h_gf)
        h_ga_soul = theosophical_reduction(h_ga)
        h_points = (h_win * 3) + h_draw
        h_pts_soul = theosophical_reduction(h_points)
        
        a_rank_soul = theosophical_reduction(a_rank)
        a_win_soul = theosophical_reduction(a_win)
        a_draw_soul = theosophical_reduction(a_draw)
        a_loss_soul = theosophical_reduction(a_loss)
        a_gf_soul = theosophical_reduction(a_gf)
        a_ga_soul = theosophical_reduction(a_ga)
        a_points = (a_win * 3) + a_draw
        a_pts_soul = theosophical_reduction(a_points)

        # Odds Soul Calculation
        odd_1_soul = analyze_odd_soul(odd_1)
        odd_x_soul = analyze_odd_soul(odd_x)
        odd_2_soul = analyze_odd_soul(odd_2)

        # --- 2. NARRATIVE GENERATION ---
        
        # A. Win Authority
        h_win_desc = ""
        if h_win_soul in [1, 7, 10]: h_win_desc = "MUZAFFERİYET (Ruhsal Otorite)"
        elif h_win_soul == 11: h_win_desc = "KİBİR (Kaos Riski)"
        elif h_win_soul == 13: h_win_desc = "LANET (Hain Pusu)"
        else: h_win_desc = "Normal Akış"
        
        a_win_desc = ""
        if a_win_soul in [1, 7, 10]: a_win_desc = "MUZAFFERİYET"
        elif a_win_soul == 11: a_win_desc = "KİBİR"
        elif a_win_soul == 13: a_win_desc = "LANET"
        else: a_win_desc = "Normal Akış"

        # B. Draw Balance
        h_draw_desc = "DÜZENSİZ"
        if h_draw_soul == 6: h_draw_desc = "UYUM (Barışçıl)"
        elif h_draw <= 2: h_draw_desc = "İKİLİK (Ya Hep Ya Hiç)"
        
        # C. Loss Karma
        h_loss_desc = ""
        if h_loss == 0: h_loss_desc = "MONAD (Lekesiz Kader)"
        elif h_loss_soul in [5, 8]: h_loss_desc = "DİRENÇ (Sert Savunma)"
        else: h_loss_desc = "Normal Karma"

        a_loss_desc = ""
        if a_loss == 0: a_loss_desc = "MONAD (Lekesiz)"
        elif a_loss_soul in [5, 8]: a_loss_desc = "DİRENÇ"
        else: a_loss_desc = "Normal Karma"

        # D. Goal Energy
        h_gf_desc = "Normal"
        if h_gf_soul == 3: h_gf_desc = "JÜPİTER (Bolluk)"
        elif h_gf_soul == 9: h_gf_desc = "HÜKÜM (Bitirici)"
        
        a_ga_desc = "Normal"
        if a_ga_soul == 11: a_ga_desc = "KAOS (Zafiyet)"
        elif a_ga_soul == 4: a_ga_desc = "KALE (Düzen)"

        # E. Resonance Check & Narrative
        narrative = []
        
        # Win Narrative
        narrative.append(f"{home}, {h_win} galibiyetle ({h_win_soul}) {h_win_desc} frekansında.")
        narrative.append(f"{away} ise {a_win} galibiyetle ({a_win_soul}) {a_win_desc} bölgesinde.")
        if h_win_soul == 10 and a_rank == 2:
            narrative.append(f"Mükemmel Düzen'e (10) sahip liderin karşısında, 2. sıradaki (Kutuplaşma) takipçi var.")
        
        # Goal Resonance
        if h_gf_soul == a_ga_soul:
            narrative.append(f"REZONANS TESPİTİ: {home}'ın Attiği ({h_gf_soul}) ile {away}'nin Yediği ({a_ga_soul}) aynı frekansta. Anahtar kilide uyuyor, goller gelir.")
        elif h_gf_soul == 3 and a_ga_soul == 5:
            narrative.append(f"ENERJİ PATLAMASI: 3 (Jüpiter) Bereketi vs 5 (Mars) Yıkımı. Gol yağmuru (ÜST) kaçınılmaz.")

        destiny_text = " ".join(narrative)
        
        # PREDICTION
        hero_pred = "BELİRSİZ"
        if h_loss == 0: hero_pred = "KAYBETMEZ 1/X"
        if h_gf_soul == a_ga_soul: hero_pred = "GOL VAR / ÜST"
        if h_win_soul == 10 and a_rank_soul == 2: hero_pred = "BANKO 1"
        if h_win_soul == 13: hero_pred = "SÜRPRİZ (YIKIM)"

        # --- UI RENDERING ---
        
        # HERO
        st.markdown(f"""
        <div class="hero-card">
            <h5 style="color: #bbb; margin:0;">KADERSEL SONUÇ</h5>
            <div class="hero-pred">{hero_pred}</div>
        </div>
        """, unsafe_allow_html=True)
        
        # DESTINY TEXT
        st.markdown(f"""
        <div class="destiny-box">
            <div class="destiny-title">📜 KADERSEL ANALİZ METNİ</div>
            <p>"{destiny_text}"</p>
        </div>
        """, unsafe_allow_html=True)
        
        # SOUL X-RAY TABLE
        st.markdown("### 🧬 RUHSAL RÖNTGEN (Soul X-Ray)")
        
        def render_soul_col(label, val, soul, desc, color="#FFD700"):
            st.markdown(f"""
            <div class="soul-card" style="border-color: {color}44;">
                <div style="font-size:12px; color:#ddd;">{label}</div>
                <div class="soul-val">{val} <span style="font-size:14px; color:{color};">({soul})</span></div>
                <div class="soul-desc" style="color:{color};">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader(f"🏠 {home}")
            c1, c2, c3 = st.columns(3)
            with c1: render_soul_col("GALİBİYET", h_win, h_win_soul, h_win_desc, "#00FF00" if h_win_soul in [1,7,10] else "#FF0000")
            with c2: render_soul_col("BERABERLİK", h_draw, h_draw_soul, h_draw_desc)
            with c3: render_soul_col("MAĞLUBİYET", h_loss, h_loss_soul, h_loss_desc, "#00FFFF" if h_loss==0 else "#888")
            c4, c5 = st.columns(2)
            with c4: render_soul_col("ATILAN GOL", h_gf, h_gf_soul, h_gf_desc)
            with c5: render_soul_col("PUAN RUHU", h_points, h_pts_soul, "Makam")

        with col2:
            st.subheader(f"✈️ {away}")
            c1, c2, c3 = st.columns(3)
            with c1: render_soul_col("GALİBİYET", a_win, a_win_soul, a_win_desc, "#00FF00" if a_win_soul in [1,7,10] else "#FF0000")
            with c2: render_soul_col("BERABERLİK", a_draw, a_draw_soul, "Pasif")
            with c3: render_soul_col("MAĞLUBİYET", a_loss, a_loss_soul, a_loss_desc, "#00FFFF" if a_loss==0 else "#888")
            c4, c5 = st.columns(2)
            with c4: render_soul_col("ATILAN GOL", a_gf, a_gf_soul, "Saldırı")
            with c5: render_soul_col("YENİLEN GOL", a_ga, a_ga_soul, a_ga_desc)

        # --- 3. RESTORED & NEW FEATURES ---
        
        # AURA RADAR CHART (Restored)
        st.markdown("---")
        st.subheader("🌌 MAÇIN ENERJİ GEOMETRİSİ")
        
        # --- GRANULAR RADAR LOGIC ---
        # Base stats for realism
        axis_chaos = 40
        axis_order = 40
        axis_magic = 40
        
        # 1. CHAOS FACTORS (Mars/Uranus)
        # Add small increments for each chaos indicator
        if h_win_soul == 11: axis_chaos += 15
        if a_win_soul == 11: axis_chaos += 15
        if h_loss_soul == 5: axis_chaos += 10
        if a_loss_soul == 5: axis_chaos += 10
        if h_ga_soul in [5, 11]: axis_chaos += 10
        if a_ga_soul in [5, 11]: axis_chaos += 10
        # Check odd souls
        if odd_1_soul in [5, 11]: axis_chaos += 5
        if odd_x_soul in [5, 11]: axis_chaos += 5
        if odd_2_soul in [5, 11]: axis_chaos += 5

        # 2. ORDER FACTORS (Saturn/Sun)
        if h_win_soul in [1, 10]: axis_order += 15
        if a_win_soul in [1, 10]: axis_order += 15
        if h_rank_soul == 8: axis_order += 10
        if a_rank_soul == 8: axis_order += 10
        if h_loss == 0: axis_order += 15
        if a_loss == 0: axis_order += 15
        if h_gf_soul == 4: axis_order += 10
        if a_ga_soul == 4: axis_order += 10

        # 3. MAGIC FACTORS (Jupiter/Neptune/Judas)
        if h_win_soul == 13: axis_magic += 20
        if a_win_soul == 13: axis_magic += 20
        if h_gf_soul == 3: axis_magic += 10
        if a_gf_soul == 3: axis_magic += 10
        if h_rank_soul == 7: axis_magic += 10
        if a_rank_soul == 7: axis_magic += 10
        if odd_1_soul in [7, 13, 9]: axis_magic += 5
        if odd_x_soul in [7, 13, 9]: axis_magic += 5

        # Normalize to 100 max
        axis_chaos = min(95, axis_chaos)
        axis_order = min(95, axis_order)
        axis_magic = min(95, axis_magic)
        
        categories = ['KAOS (Mars/Uranüs)', 'DÜZEN (Satürn/Güneş)', 'BÜYÜ (Jüpiter/Neptün)']
        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(
              r=[axis_chaos, axis_order, axis_magic],
              theta=categories,
              fill='toself',
              line_color='#FFD700',
              fillcolor='rgba(255, 215, 0, 0.2)'
        ))
        fig.update_layout(
          polar=dict(
            radialaxis=dict(visible=True, range=[0, 100], color="#555"),
            bgcolor='rgba(0,0,0,0)'
          ),
          paper_bgcolor='rgba(0,0,0,0)',
          font=dict(color="white", family="Cinzel"),
          margin=dict(t=20, b=20, l=40, r=40)
        )
        st.plotly_chart(fig, use_container_width=True)

        # SURPRISE SCENARIOS (Expanded)
        st.subheader("🔮 OLASI SÜRPRİZ SENARYOLAR")
        
        # Pool of surprises with weights (Text, Weight)
        surprise_pool = []
        
        # High Impact
        if 5 in [h_loss_soul, a_loss_soul, h_ga_soul, a_ga_soul]:
            surprise_pool.append(("🟥 **KIRMIZI KART / GERGİNLİK:** Mars (5) enerjisi sahada, sinirler çok gergin.", 10))
        if 11 in [h_gf_soul, a_gf_soul, h_win_soul, a_win_soul]:
            surprise_pool.append(("💻 **VAR / PENALTI:** Kaos (11) frekansı, ceza sahasında belirsizlik yaratıyor.", 9))
        if 13 in [h_rank_soul, a_rank_soul, h_win_soul, a_win_soul]:
            surprise_pool.append(("⚡ **BÜYÜK YIKIM:** Judas (13) devrede. Favori takım şok bir gol yiyebilir.", 10))
            
        # Medium Impact
        if axis_magic > 70:
            surprise_pool.append(("⏱️ **SON DAKİKA GOLÜ:** Büyü enerjisi yüksek. Maç bitti sanılırken skor değişebilir.", 7))
        if axis_chaos > 70:
            surprise_pool.append(("🌪️ **SKOR DALGALANMASI:** Kaos yüksek. Öne geçen takım skoru koruyamayabilir.", 7))
        if abs(h_rank - a_rank) > 5 and axis_order < 50:
             surprise_pool.append(("📉 **REHAVET TEHLİKESİ:** Favori takım konsantrasyon kaybı yaşayabilir.", 6))

        # Fillers (Low Impact) to ensure diversity
        surprise_pool.append(("🛡️ **İLK YARI KİLİDİ:** Düşük frekanslı başlangıç, ilk yarı 0-0 gidebilir.", 3))
        surprise_pool.append(("🎯 **DURAN TOP GOLÜ:** Oyun kilitlenirse duran toplar kaderi belirler.", 3))
        
        # Sort by weight desc
        surprise_pool.sort(key=lambda x: x[1], reverse=True)
        
        # Select Top 2 UNIQUE items
        selected_surprises = []
        seen = set()
        for s_text, s_w in surprise_pool:
            if len(selected_surprises) >= 2: break
            if s_text not in seen:
                selected_surprises.append(s_text)
                seen.add(s_text)
        
        # Render
        for s in selected_surprises:
            st.markdown(f"<div class='surprise-box'><div class='surprise-item'>{s}</div></div>", unsafe_allow_html=True)

if __name__ == "__main__":
    main()
