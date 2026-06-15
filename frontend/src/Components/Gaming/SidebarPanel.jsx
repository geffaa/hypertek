import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useMobileLandscape from "../../hooks/useMobileLandscape";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n/index.js";

const HUD_LANGS = [
  { code: "en",    flag: "🇺🇸", label: "English",       engLabel: "English",            supported: true  },
  { code: "fr",    flag: "🇫🇷", label: "Français",      engLabel: "French",             supported: false },
  { code: "it",    flag: "🇮🇹", label: "Italiano",      engLabel: "Italian",            supported: false },
  { code: "de",    flag: "🇩🇪", label: "Deutsch",       engLabel: "German",             supported: false },
  { code: "es",    flag: "🇪🇸", label: "Español",       engLabel: "Spanish",            supported: false },
  { code: "ru",    flag: "🇷🇺", label: "Русский",       engLabel: "Russian",            supported: false },
  { code: "ko",    flag: "🇰🇷", label: "한국어",         engLabel: "Korean",             supported: true  },
  { code: "ja",    flag: "🇯🇵", label: "日本語",         engLabel: "Japanese",           supported: true  },
  { code: "pt",    flag: "🇧🇷", label: "Português",     engLabel: "Portuguese",         supported: true  },
  { code: "ar",    flag: "🇸🇦", label: "العربية",       engLabel: "Arabic",             supported: false },
  { code: "ms",    flag: "🇲🇾", label: "Melayu",        engLabel: "Malay",              supported: false },
  { code: "no",    flag: "🇳🇴", label: "Norsk",         engLabel: "Norwegian",          supported: false },
  { code: "nl",    flag: "🇳🇱", label: "Nederlands",    engLabel: "Dutch",              supported: false },
  { code: "th",    flag: "🇹🇭", label: "ไทย",           engLabel: "Thai",               supported: false },
  { code: "tr",    flag: "🇹🇷", label: "Türkçe",        engLabel: "Turkish",            supported: false },
  { code: "vi",    flag: "🇻🇳", label: "Việt",          engLabel: "Vietnamese",         supported: false },
  { code: "id",    flag: "🇮🇩", label: "Indonesia",     engLabel: "Indonesian",         supported: false },
  { code: "zh",    flag: "🇨🇳", label: "简体中文",       engLabel: "Simplified Chinese", supported: true  },
  { code: "sv",    flag: "🇸🇪", label: "Svenska",       engLabel: "Swedish",            supported: false },
  { code: "he",    flag: "🇮🇱", label: "עברית",         engLabel: "Hebrew",             supported: false },
  { code: "da",    flag: "🇩🇰", label: "Dansk",         engLabel: "Danish",             supported: false },
  { code: "ro",    flag: "🇷🇴", label: "Română",        engLabel: "Romanian",           supported: false },
  { code: "fil",   flag: "🇵🇭", label: "Filipino",      engLabel: "Filipino",           supported: false },
  { code: "zh-TW", flag: "🇹🇼", label: "繁體中文",       engLabel: "Trad. Chinese",      supported: false },
  { code: "hi",    flag: "🇮🇳", label: "हिंदी",          engLabel: "Hindi",              supported: false },
  { code: "pl",    flag: "🇵🇱", label: "Polski",        engLabel: "Polish",             supported: false },
  { code: "el",    flag: "🇬🇷", label: "Ελληνικά",      engLabel: "Greek",              supported: false },
];
import {
  GiScrollQuill, GiFlagObjective, GiMedal, GiBodySwapping,
  GiVortex, GiPlasmaBolt, GiGalaxy, GiBookAura,
  GiRocketThruster, GiRaceCar, GiWrench, GiMedicalPack,
  GiCrossedSwords, GiCrossedPistols, GiLandMine, GiGrenade,
  GiHelmet, GiSpaceSuit, GiGauntlet, GiBoots,
  GiShield, GiAmmoBox,
  GiLockedChest, GiGiftOfKnowledge, GiTrophyCup, GiToken, GiCoinsPile,
  GiMilitaryFort, GiTowerFlag,
} from "react-icons/gi";

/* ── Event data ───────────────────────────────────────────────── */
// locked: true = coming soon (game not yet created)
const EVENT_DATA = {
  Limited: [
    { title: "Invite Friends",      titleKey: "hud.eventItems.inviteFriends",        statusKey: "hud.eventStatus.eventOngoing", status: "Event Ongoing", time: null,       locked: true  },
    { title: "Land Base Oversight", titleKey: "hud.eventItems.landBaseOversight",    statusKey: "hud.eventStatus.eventOngoing", status: "Event Ongoing", time: null,       locked: true  },
    { title: "Quests Trail",        titleKey: "hud.eventItems.questsTrail",          statusKey: "hud.eventStatus.eventOngoing", status: "Event Ongoing", time: null,       locked: true  },
    { title: "Contract Killer",     titleKey: "hud.eventItems.contractKiller",       statusKey: "hud.eventStatus.eventOngoing", status: "Event Ongoing", time: null,       locked: true  },
    { title: "Mazed Mission",       titleKey: "hud.eventItems.mazedMission",         statusKey: "hud.eventStatus.endsIn",       status: "Ends in",       time: "1d 18:17", locked: true  },
    { title: "Flaming Asteroid",    titleKey: "hud.eventItems.flamingAsteroid",      statusKey: "hud.eventStatus.endsIn",       status: "Ends in",       time: "2d 06:17", locked: true  },
    { title: "Refining Master",     titleKey: "hud.eventItems.refiningMaster",       statusKey: "hud.eventStatus.endsIn",       status: "Ends in",       time: "2d 06:17", locked: true  },
    { title: "Star Gaze",           titleKey: "hud.eventItems.starGaze",             statusKey: "hud.eventStatus.endsIn",       status: "Ends in",       time: "6d 18:17", locked: true  },
  ],
  Activities: [
    { title: "Daily Login Bonus",       titleKey: "hud.eventItems.dailyLoginBonus",       statusKey: "hud.eventStatus.resetsDaily",    status: "Resets daily",   time: null,        locked: true  },
    { title: "Battle Pass",             titleKey: "hud.eventItems.battlePass",             statusKey: "hud.eventStatus.seasonEndsIn",   status: "Season ends in", time: "12d 04:00", locked: true  },
    { title: "Alliance War",            titleKey: "hud.eventItems.allianceWar",            statusKey: "hud.eventStatus.eventOngoing",   status: "Event Ongoing",  time: null,        locked: true  },
    { title: "Weekly Challenge",        titleKey: "hud.eventItems.weeklyChallenge",        statusKey: "hud.eventStatus.endsIn",         status: "Ends in",        time: "4d 10:30",  locked: true  },
  ],
  Competition: [
    { title: "Galactic Cup",            titleKey: "hud.eventItems.galacticCup",            statusKey: "hud.eventStatus.startsIn",       status: "Starts in",      time: "3d 00:00",  locked: true  },
    { title: "Speed Racing Tournament", titleKey: "hud.eventItems.speedRacingTournament",  statusKey: "hud.eventStatus.endsIn",         status: "Ends in",        time: "5d 12:00",  locked: true  },
    { title: "Overlord Championship",   titleKey: "hud.eventItems.overlordChampionship",   statusKey: "hud.eventStatus.eventOngoing",   status: "Event Ongoing",  time: null,        locked: true  },
  ],
};

/* ── Items data ───────────────────────────────────────────────── */
const ITEM_TABS = ["Inventory", "Weapons", "Rewards", "Specialists"];

const ITEM_DATA = {
  Inventory: [
    { name: "Quest Items",   nameKey: "hud.items.inventory.questItems",  qty: 0, color: "#c4b5fd", icon: GiScrollQuill,    locked: true },
    { name: "Banners",       nameKey: "hud.items.inventory.banners",     qty: 0, color: "#fcd34d", icon: GiFlagObjective,  locked: true },
    { name: "Medals",        nameKey: "hud.items.inventory.medals",      qty: 0, color: "#fb923c", icon: GiMedal,          locked: true },
    { name: "Skins",         nameKey: "hud.items.inventory.skins",       qty: 0, color: "#38bdf8", icon: GiBodySwapping,   locked: true },
    { name: "Anti-Gravity",  nameKey: "hud.items.inventory.antiGravity", qty: 0, color: "#a78bfa", icon: GiVortex,         locked: true },
    { name: "Plasma Rods",   nameKey: "hud.items.inventory.plasmaRods",  qty: 0, color: "#f87171", icon: GiPlasmaBolt,     locked: true },
    { name: "Dark Matter",   nameKey: "hud.items.inventory.darkMatter",  qty: 0, color: "#818cf8", icon: GiGalaxy,         locked: true },
    { name: "Tech Books",    nameKey: "hud.items.inventory.techBooks",   qty: 0, color: "#67e8f9", icon: GiBookAura,       locked: true },
    { name: "Engines",       nameKey: "hud.items.inventory.engines",     qty: 0, color: "#fb923c", icon: GiRocketThruster, locked: true },
    { name: "Vehicles",      nameKey: "hud.items.inventory.vehicles",    qty: 0, color: "#6ee7b7", icon: GiRaceCar,        locked: true },
    { name: "Tools",         nameKey: "hud.items.inventory.tools",       qty: 0, color: "#94a3b8", icon: GiWrench,         locked: true },
    { name: "Aid Packs",     nameKey: "hud.items.inventory.aidPacks",    qty: 0, color: "#f87171", icon: GiMedicalPack,    locked: true },
  ],
  Weapons: [
    { name: "Blades",      nameKey: "hud.items.weapons.blades",     color: "#38bdf8", icon: GiCrossedSwords,  locked: true },
    { name: "Guns",        nameKey: "hud.items.weapons.guns",       color: "#f87171", icon: GiCrossedPistols, locked: true },
    { name: "Mines",       nameKey: "hud.items.weapons.mines",      color: "#6ee7b7", icon: GiLandMine,       locked: true },
    { name: "Grenades",    nameKey: "hud.items.weapons.grenades",   color: "#fb923c", icon: GiGrenade,        locked: true },
    { name: "Helmet",      nameKey: "hud.items.weapons.helmet",     color: "#c4b5fd", icon: GiHelmet,         locked: true },
    { name: "Suits",       nameKey: "hud.items.weapons.suits",      color: "#67e8f9", icon: GiSpaceSuit,      locked: true },
    { name: "Gloves",      nameKey: "hud.items.weapons.gloves",     color: "#a78bfa", icon: GiGauntlet,       locked: true },
    { name: "Boots",       nameKey: "hud.items.weapons.boots",      color: "#fcd34d", icon: GiBoots,          locked: true },
    { name: "Land Bases",  nameKey: "hud.items.weapons.landBases",  color: "#f87171", icon: GiMilitaryFort,   locked: true },
    { name: "Land Titles", nameKey: "hud.items.weapons.landTitles", color: "#fcd34d", icon: GiTowerFlag,       locked: true },
    { name: "Shield",      nameKey: "hud.items.weapons.shield",     color: "#38bdf8", icon: GiShield,         locked: true },
    { name: "Ammo Packs",  nameKey: "hud.items.weapons.ammoPacks",  color: "#94a3b8", icon: GiAmmoBox,        locked: true },
  ],
  Rewards: [
    { name: "Battle Chest",   nameKey: "hud.items.rewards.battleChest",   qty: 2,  color: "#fcd34d", icon: GiLockedChest,     locked: true },
    { name: "Login Reward",   nameKey: "hud.items.rewards.loginReward",   qty: 1,  color: "#6ee7b7", icon: GiGiftOfKnowledge, locked: true },
    { name: "Event Trophy",   nameKey: "hud.items.rewards.eventTrophy",   qty: 3,  color: "#f87171", icon: GiTrophyCup,        locked: true },
    { name: "Alliance Gift",  nameKey: "hud.items.rewards.allianceGift",  qty: 5,  color: "#38bdf8", icon: GiToken,            locked: true },
    { name: "Quest Token",    nameKey: "hud.items.rewards.questToken",    qty: 12, color: "#a78bfa", icon: GiCoinsPile,        locked: true },
    { name: "Race Medal",     nameKey: "hud.items.rewards.raceMedal",     qty: 1,  color: "#fb923c", icon: GiMedal,            locked: true },
  ],
};

/* ── Specialist categories & data ─────────────────────────────── */
const SPECIALIST_CATEGORIES = [
  "Offence", "Defence", "Racing", "Pilot",
  "Weapons", "Engineering", "Science", "Hospital", "Food",
];

// locked = game not yet created; set to false when game is live
const CATEGORY_LOCKED = {
  Offence: true, Defence: true, Racing: true, Pilot: true,
  Weapons: true, Engineering: true, Science: true, Hospital: true, Food: true,
};

const CATEGORY_COLOR = {
  Offence: "#f87171", Defence: "#94a3b8", Racing: "#22c55e", Pilot: "#38bdf8",
  Weapons: "#fb923c", Engineering: "#fcd34d", Science: "#a78bfa", Hospital: "#f0abfc", Food: "#6ee7b7",
};

const SPECIALISTS_BY_CATEGORY = {
  Offence:     [{ name: "Commander Rex", role: "COMBAT",    color: "#f87171", icon: "⚔️"  }],
  Defence:     [{ name: "Warden-7",      role: "DEFENSE",   color: "#94a3b8", icon: "🛡️"  }],
  Racing:      [{ name: "Pilot Zara",    role: "RACING",    color: "#22c55e", icon: "🚗"  }],
  Pilot:       [{ name: "Ace Vega",      role: "PILOT",     color: "#38bdf8", icon: "✈️"  }],
  Weapons:     [{ name: "Iron Mace",     role: "WEAPONS",   color: "#fb923c", icon: "🔫"  }],
  Engineering: [{ name: "Mechanic Kole", role: "ENGINEER",  color: "#fcd34d", icon: "🔧"  }],
  Science:     [{ name: "Dr. Nova",      role: "SCIENCE",   color: "#a78bfa", icon: "🔬"  },
                { name: "Oracle",        role: "STRATEGY",  color: "#c4b5fd", icon: "🔮"  }],
  Hospital:    [{ name: "Medic Ryn",     role: "MEDIC",     color: "#f0abfc", icon: "💊"  }],
  Food:        [{ name: "Chef Arak",     role: "SUPPLY",    color: "#6ee7b7", icon: "🌿"  }],
};


const CSS = `
  .hud-sidebar-btn {
    transition: transform 0.15s ease, box-shadow 0.15s ease,
                background 0.15s ease, border-color 0.15s ease;
  }
  .hud-sidebar-btn:hover {
    transform: translateX(4px);
    background: rgba(0,229,255,0.12) !important;
    border-left-color: #00ffff !important;
    box-shadow: 0 0 20px rgba(0,229,255,0.28),
                inset 0 1px 0 rgba(255,255,255,0.08) !important;
    color: #fff !important;
  }
  .hud-sidebar-btn:active {
    transform: translateX(6px) scaleY(0.95);
    background: rgba(0,229,255,0.22) !important;
  }
  .hud-panel-tab {
    transition: background 0.15s, color 0.15s;
    cursor: pointer;
  }
  .hud-panel-tab:hover { background: rgba(0,229,255,0.1) !important; color:#fff !important; }
  .hud-event-row { transition: background 0.13s; cursor: pointer; }
  .hud-event-row:hover { background: rgba(0,229,255,0.07) !important; }
  .hud-item-cell { transition: transform 0.14s, box-shadow 0.14s, background 0.14s, border-color 0.14s; cursor: pointer; }
  .hud-item-cell:hover {
    transform: scale(1.08);
    box-shadow: 0 0 22px rgba(0,212,255,0.65) !important;
    background: rgba(0,229,255,0.18) !important;
    border-color: rgba(0,229,255,0.7) !important;
  }
  .hud-item-cell:active { transform: scale(0.95); }
  @keyframes panelSlideIn {
    from { opacity:0; transform:translateX(14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .hud-side-panel { animation: panelSlideIn 0.2s ease both; }
  .chat-scroll::-webkit-scrollbar { width: 3px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.45); border-radius: 2px; }
  .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.7); }
  .alliance-mail-scroll::-webkit-scrollbar { width: 3px; }
  .alliance-mail-scroll::-webkit-scrollbar-track { background: transparent; }
  .alliance-mail-scroll::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.4); border-radius: 2px; }
  .alliance-mail-scroll::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.75); }
`;

const BTN_BASE = {
  padding: "9px 14px", whiteSpace: "nowrap",
  background: "rgba(4,18,36,0.82)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(0,229,255,0.18)",
  borderLeft: "3px solid #00E5FF",
  borderRadius: "0 5px 5px 0",
  color: "#9dd8f0",
  fontFamily: "Orbitron,sans-serif",
  fontSize: 9.5, fontWeight: "bold", letterSpacing: "0.1em",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 0 14px rgba(0,229,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
};

/* ── Shared panel shell ──────────────────────────────────────── */
function SidePanel({ title, accentColor = "#00E5FF", onClose, children, isMobile = false, showSubtitle = false, panelRight }) {
  const { t } = useTranslation();
  const rightVal = isMobile ? "18vw" : panelRight;
  return (
    <div className="hud-side-panel" style={{
      position: "absolute",
      right: rightVal,
      top:       isMobile ? "60px"  : "21vh",
      width:     isMobile ? 290     : 460,
      maxHeight: isMobile ? "75vh"  : "70vh",
      zIndex: 29,
      background: "rgba(5,12,28,0.97)",
      border: `1px solid ${accentColor}40`,
      borderRadius: "6px 0 0 6px",
      backdropFilter: "blur(16px)",
      boxShadow: `-8px 0 40px rgba(0,0,0,0.6), 0 0 20px ${accentColor}0a`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "7px 10px 6px" : "10px 14px 8px",
        borderBottom: `1px solid ${accentColor}20`,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{
            fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 12,
            fontWeight: "bold", letterSpacing: "0.18em",
            color: accentColor, textShadow: `0 0 10px ${accentColor}cc`,
          }}>{title}</span>
          {showSubtitle && (
            <span style={{
              fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
              letterSpacing: "0.12em", color: `${accentColor}88`,
            }}>{t("hud.availableAfterLaunch", "AVAILABLE IN-GAME AFTER OFFICIAL LAUNCH")}</span>
          )}
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          color: "rgba(157,216,240,0.5)", fontSize: isMobile ? 13 : 16,
          cursor: "pointer", lineHeight: 1, padding: "0 2px",
        }}>×</button>
      </div>
      {children}
    </div>
  );
}

/* ── Events panel ────────────────────────────────────────────── */
function EventsPanel({ onClose, isMobile, panelRight }) {
  const { t } = useTranslation();
  const [tab,      setTab]      = useState("Limited");
  const [detail,   setDetail]   = useState(null);
  const [selected, setSelected] = useState(null); // highlighted row for Activities/Competition

  const handleRowClick = (ev) => {
    if (ev.locked) return;
    if (tab === "Limited") {
      setDetail(ev);
    } else {
      // Activities & Competition: just highlight, no detail view
      setSelected(prev => prev === ev.title ? null : ev.title);
    }
  };

  return (
    <SidePanel title={t("hud.eventCenter", "EVENT CENTER")} onClose={onClose} isMobile={isMobile} showSubtitle panelRight={panelRight}>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(0,229,255,0.1)" }}>
        {["Limited","Activities","Competition"].map(tabKey => (
          <button key={tabKey} className="hud-panel-tab"
            onClick={() => { setTab(tabKey); setDetail(null); setSelected(null); }}
            style={{
              flex:1, padding: isMobile ? "5px 2px" : "7px 4px", background:"none", border:"none",
              borderBottom: tab === tabKey ? "2px solid #00E5FF" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11, fontWeight:"bold",
              letterSpacing:"0.08em",
              color: tab === tabKey ? "#00E5FF" : "#cceeff",
              whiteSpace:"nowrap",
            }}>{t(`hud.eventTabs.${tabKey.toLowerCase()}`, tabKey)}</button>
        ))}
      </div>

      {/* ── Event list ── */}
      {!detail && (
        <div style={{ overflowY:"auto", flex:1 }}>
          {EVENT_DATA[tab].map((ev, i) => {
            const isSelected = selected === ev.title;
            return (
              <div key={i} className="hud-event-row"
                onClick={() => handleRowClick(ev)}
                style={{
                  padding: isMobile ? "7px 10px" : "9px 14px",
                  borderBottom:"1px solid rgba(0,229,255,0.15)",
                  opacity: ev.locked ? 0.75 : 1,
                  cursor: ev.locked ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background: isSelected ? "rgba(0,229,255,0.08)" : undefined,
                }}>
                <div>
                  <div style={{
                    fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 12, fontWeight:"bold",
                    letterSpacing:"0.08em",
                    color: ev.locked ? "#aad4ee" : isSelected ? "#00E5FF" : "#ffffff",
                    marginBottom:3,
                  }}>{t(ev.titleKey, ev.title)}</div>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                    color: ev.time ? "#fde047" : "#00E5FF", letterSpacing:"0.06em",
                  }}>
                    {ev.time ? `⏱ ${t(ev.statusKey, ev.status)} ${ev.time}` : `● ${t(ev.statusKey, ev.status)}`}
                  </div>
                </div>
                {ev.locked
                  ? <span style={{ fontSize: isMobile ? 9 : 11, opacity:0.75 }}>🔒</span>
                  : tab === "Limited"
                    ? <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
                        color:"#00E5FF", letterSpacing:"0.06em",
                      }}>{t("hud.viewArrow", "VIEW →")}</span>
                    : null
                }
              </div>
            );
          })}
        </div>
      )}

      {/* ── Event detail view ── */}
      {detail && (
        <div style={{ overflowY:"auto", flex:1, padding: isMobile ? "8px 10px" : "12px 14px" }}>
          <button onClick={() => setDetail(null)} style={{
            background:"none", border:"none", cursor:"pointer", padding:"0 0 10px 0",
            fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8, color:"#00E5FF",
            letterSpacing:"0.1em",
          }}>{t("hud.back", "← BACK")}</button>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 11, fontWeight:"bold",
            color:"#ffffff", letterSpacing:"0.1em", marginBottom:6,
          }}>{t(detail.titleKey, detail.title)}</div>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
            color: detail.time ? "#fde047" : "#00E5FF",
            letterSpacing:"0.06em", marginBottom:14,
          }}>
            {detail.time ? `⏱ ${t(detail.statusKey, detail.status)} ${detail.time}` : `● ${t(detail.statusKey, detail.status)}`}
          </div>

          <div style={{ height:1, background:"rgba(0,229,255,0.3)", marginBottom:12 }}/>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
            color:"#cce8f8", lineHeight:1.7,
          }}>
            {t("hud.eventDetailPlaceholder", "Full event details, rewards, and participation options will be available when this event launches.")}
          </div>
        </div>
      )}

    </SidePanel>
  );
}

/* ── Items panel ─────────────────────────────────────────────── */
function ItemsPanel({ onClose, isMobile, panelRight }) {
  const { t } = useTranslation();
  const [tab,          setTab]          = useState("Inventory");
  const [specCategory, setSpecCategory] = useState(null);   // selected specialist category
  const [profile,      setProfile]      = useState(null);   // specialist being viewed
  const items = ITEM_DATA[tab] || [];

  return (
    <SidePanel title={t("hud.sidebar.items", "ITEMS")} accentColor="#38bdf8" onClose={onClose} isMobile={isMobile} showSubtitle panelRight={panelRight}>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(56,189,248,0.1)", overflowX:"auto" }}>
        {ITEM_TABS.map(tabKey => (
          <button key={tabKey} className="hud-panel-tab"
            onClick={() => { setTab(tabKey); setSpecCategory(null); setProfile(null); }}
            style={{
              flex:1, padding: isMobile ? "5px 3px" : "7px 6px", background:"none", border:"none",
              borderBottom: tab === tabKey ? "2px solid #38bdf8" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, fontWeight:"bold",
              letterSpacing:"0.06em",
              color: tab === tabKey ? "#38bdf8" : "rgba(157,216,240,0.7)",
              whiteSpace:"nowrap", minWidth:0,
            }}>{t(`hud.itemTabs.${tabKey.toLowerCase()}`, tabKey)}</button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ overflowY:"auto", flex:1, padding: isMobile ? "7px" : "10px", alignContent:"start" }}>

        {/* INVENTORY */}
        {tab === "Inventory" && (
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: isMobile ? 6 : 10 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background: item.locked ? "rgba(3,10,28,0.7)" : "rgba(3,10,28,0.88)",
                border:`1px solid ${item.color}55`,
                borderRadius:6, padding: isMobile ? "8px 4px 6px" : "12px 6px 8px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                boxShadow:`0 0 10px ${item.color}${item.locked ? "25" : "30"}`,
                position:"relative", opacity: item.locked ? 0.88 : 1,
                cursor: item.locked ? "not-allowed" : "pointer",
              }}>
                {(() => { const Icon = item.icon; return <Icon size={isMobile ? 22 : 30} color={item.color} style={{ filter: item.locked ? `grayscale(0.5) drop-shadow(0 0 4px ${item.color}66)` : `drop-shadow(0 0 5px ${item.color}aa)` }} />; })()}
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight:"bold",
                  color: item.locked ? "rgba(157,216,240,0.85)" : item.color,
                  textAlign:"center", letterSpacing:"0.05em", lineHeight:1.2,
                }}>{t(item.nameKey, item.name)}</div>
                {item.locked
                  ? <div style={{ fontSize: isMobile ? 9 : 12, position:"absolute", top:4, right:5 }}>🔒</div>
                  : <div style={{ position:"absolute", top:4, right:5,
                      fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11, fontWeight:"bold",
                      color:"rgba(255,255,255,0.8)",
                    }}>{item.qty}</div>
                }
              </div>
            ))}
          </div>
        )}

        {/* WEAPONS */}
        {tab === "Weapons" && (
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: isMobile ? 6 : 10 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background:"rgba(3,10,28,0.7)",
                border:`1px solid ${item.color}55`,
                borderRadius:6, padding: isMobile ? "8px 4px 6px" : "12px 6px 8px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                position:"relative", opacity:0.88, cursor:"not-allowed",
                boxShadow:`0 0 10px ${item.color}25`,
              }}>
                {(() => { const Icon = item.icon; return <Icon size={isMobile ? 22 : 30} color={item.color} style={{ filter: `grayscale(0.5) drop-shadow(0 0 4px ${item.color}66)` }} />; })()}
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight:"bold",
                  color:"rgba(157,216,240,0.85)", textAlign:"center", lineHeight:1.2,
                }}>{t(item.nameKey, item.name)}</div>
                <div style={{ fontSize: isMobile ? 9 : 12, position:"absolute", top:4, right:5 }}>🔒</div>
              </div>
            ))}
          </div>
        )}

        {/* REWARDS */}
        {tab === "Rewards" && (
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: isMobile ? 6 : 10 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background:"rgba(3,10,28,0.7)", border:`1px solid ${item.color}55`,
                borderRadius:6, padding: isMobile ? "8px 4px 6px" : "12px 6px 8px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                position:"relative", opacity:0.88, cursor:"not-allowed",
                boxShadow:`0 0 10px ${item.color}25`,
              }}>
                {(() => { const Icon = item.icon; return <Icon size={isMobile ? 24 : 32} color={item.color} style={{ filter: `grayscale(0.5) drop-shadow(0 0 4px ${item.color}66)` }} />; })()}
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight:"bold",
                  color:"rgba(157,216,240,0.85)", textAlign:"center", lineHeight:1.2,
                }}>{t(item.nameKey, item.name)}</div>
                <div style={{ fontSize: isMobile ? 9 : 12, position:"absolute", top:4, right:5 }}>🔒</div>
              </div>
            ))}
          </div>
        )}

        {/* SPECIALISTS */}
        {tab === "Specialists" && !specCategory && !profile && (
          <>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, color:"rgba(56,189,248,0.8)",
              letterSpacing:"0.12em", marginBottom:8,
            }}>{t("hud.selectCategory", "SELECT CATEGORY")}</div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 6 : 10 }}>
              {SPECIALIST_CATEGORIES.map(cat => {
                const locked = CATEGORY_LOCKED[cat];
                const color  = CATEGORY_COLOR[cat];
                return (
                  <button key={cat} className="hud-item-cell"
                    onClick={() => !locked && setSpecCategory(cat)}
                    style={{
                      background: locked ? "rgba(3,10,28,0.75)" : "rgba(3,10,28,0.88)",
                      border:`1px solid ${color}${locked ? "55" : "66"}`,
                      borderRadius:6, padding: isMobile ? "10px 6px" : "14px 8px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                      cursor: locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.88 : 1,
                      position:"relative",
                      boxShadow: locked ? `0 0 8px ${color}20` : `0 0 12px ${color}30`,
                    }}>
                    <div style={{ fontSize: isMobile ? 20 : 26, filter: locked ? "grayscale(0.4)" : "none" }}>
                      {locked ? "🔒" : "👤"}
                    </div>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight:"bold",
                      color: locked ? "rgba(157,216,240,0.9)" : color,
                      letterSpacing:"0.06em", textAlign:"center",
                    }}>{t(`hud.specialistCategories.${cat.toLowerCase()}`, cat).toUpperCase()}</div>
                    {locked && (
                      <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
                        color:"rgba(157,216,240,0.75)", letterSpacing:"0.1em",
                      }}>{t("hud.comingSoon", "COMING SOON")}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* SPECIALISTS — category grid */}
        {tab === "Specialists" && specCategory && !profile && (
          <>
            <button onClick={() => setSpecCategory(null)} style={{
              background:"none", border:"none", cursor:"pointer", padding:"0 0 8px 0",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, color:"rgba(56,189,248,0.8)",
              letterSpacing:"0.1em",
            }}>{t("hud.back", "← BACK")}</button>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 11, fontWeight:"bold",
              color: CATEGORY_COLOR[specCategory], letterSpacing:"0.12em", marginBottom:8,
            }}>{t(`hud.specialistCategories.${specCategory.toLowerCase()}`, specCategory).toUpperCase()}</div>
            <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 4 : 6 }}>
              {(SPECIALISTS_BY_CATEGORY[specCategory] || []).map((s, i) => (
                <div key={i} className="hud-item-cell"
                  onClick={() => setProfile(s)}
                  style={{
                    background:"rgba(3,10,28,0.88)", border:`1px solid ${s.color}33`,
                    borderRadius:4, padding: isMobile ? "6px 8px" : "8px 10px",
                    display:"flex", alignItems:"center", gap: isMobile ? 7 : 10, cursor:"pointer",
                  }}>
                  <div style={{
                    width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 30%, ${s.color}44, ${s.color}18)`,
                    border:`1.5px solid ${s.color}88`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: isMobile ? 14 : 18, flexShrink:0,
                  }}>{s.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight:"bold",
                      color:"#c7e9f7", letterSpacing:"0.06em",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{s.name}</div>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, color:s.color,
                      letterSpacing:"0.06em", marginTop:3,
                    }}>{s.role}</div>
                  </div>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                    color:"rgba(56,189,248,0.7)", letterSpacing:"0.06em",
                  }}>{t("hud.viewArrow", "VIEW →")}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SPECIALISTS — profile view */}
        {tab === "Specialists" && profile && (
          <>
            <button onClick={() => setProfile(null)} style={{
              background:"none", border:"none", cursor:"pointer", padding:"0 0 8px 0",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, color:"rgba(56,189,248,0.8)",
              letterSpacing:"0.1em",
            }}>{t("hud.back", "← BACK")}</button>
            <div style={{
              background:"rgba(3,10,28,0.92)", border:`1px solid ${profile.color}44`,
              borderRadius:6, padding: isMobile ? "12px 10px" : "16px 14px",
              display:"flex", flexDirection:"column", alignItems:"center", gap: isMobile ? 7 : 10,
              boxShadow:`0 0 24px ${profile.color}22`,
            }}>
              <div style={{
                width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius:"50%",
                background:`radial-gradient(circle at 35% 30%, ${profile.color}55, ${profile.color}22)`,
                border:`2px solid ${profile.color}99`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: isMobile ? 24 : 32,
              }}>{profile.icon}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 12, fontWeight:"bold",
                color:"#c7e9f7", letterSpacing:"0.1em", textAlign:"center",
              }}>{profile.name}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10,
                color:profile.color, letterSpacing:"0.12em",
              }}>{profile.role}</div>
              <div style={{ width:"100%", height:1, background:`${profile.color}22`, margin:"4px 0" }}/>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                color:"rgba(157,216,240,0.7)", textAlign:"center", lineHeight:1.6,
              }}>
                {t("hud.specialistProfileDesc", "Specialist profile — full stats and abilities will be available when the game launches.")}
              </div>
            </div>
          </>
        )}

      </div>
    </SidePanel>
  );
}

/* ── Settings panel ─────────────────────────────────────────── */
function SettingsPanel({ onClose, isMobile, autoTranslate, setAutoTranslate, panelRight }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sound, setSound]   = useState(true);
  const [music, setMusic]   = useState(true);
  const [name,  setName]    = useState(localStorage.getItem("hypertek_display_name") || "");
  const [saved, setSaved]   = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");
  const [chatLangs, setChatLangs] = useState(() =>
    Object.fromEntries(HUD_LANGS.map(l => [l.code, true]))
  );

  const handleLangSelect = (code) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
  };

  const toggleChatLang = (code, val) =>
    setChatLangs(prev => ({ ...prev, [code]: val }));

  const handleSaveName = () => {
    if (!name.trim()) return;
    const upper = name.trim().toUpperCase();
    localStorage.setItem("hypertek_display_name", upper);
    window.dispatchEvent(new CustomEvent("hypertek_name_changed", { detail: upper }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ label, value, onChange, locked }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding: isMobile ? "7px 10px" : "10px 14px", borderBottom:"1px solid rgba(0,229,255,0.07)" }}>
      <span style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11, letterSpacing:"0.1em",
        color:"#c7e9f7" }}>
        {label}
        {locked && <span style={{ fontSize: isMobile ? 8 : 10, color:"rgba(167,139,250,0.7)", fontFamily:"Orbitron,sans-serif", letterSpacing:"0.05em" }}>🔒</span>}
      </span>
      <div onClick={locked ? undefined : () => onChange(!value)} style={{
        width:38, height:20, borderRadius:10, cursor: locked ? "not-allowed" : "pointer",
        background: value ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.08)",
        border: `1.5px solid ${value ? "#00D4FF" : "rgba(255,255,255,0.2)"}`,
        position:"relative", transition:"background 0.2s, border-color 0.2s",
      }}>
        <div style={{
          position:"absolute", top:2,
          left: value ? 18 : 2,
          width:14, height:14, borderRadius:"50%",
          background: value ? "#00D4FF" : "rgba(255,255,255,0.35)",
          boxShadow: value ? "0 0 8px rgba(0,212,255,0.8)" : "none",
          transition:"left 0.2s, background 0.2s",
        }}/>
      </div>
    </div>
  );

  return (
    <SidePanel title={t("hud.sidebar.settings", "SETTINGS")} accentColor="#a78bfa" onClose={onClose} isMobile={isMobile} panelRight={panelRight}>
      <div style={{ overflowY:"auto", flex:1 }}>

        {/* Sound & Music */}
        <div style={{ padding: isMobile ? "6px 10px 3px" : "8px 14px 4px", fontFamily:"Orbitron,sans-serif",
          fontSize: isMobile ? 7 : 9, letterSpacing:"0.15em", color:"rgba(167,139,250,0.85)",
          borderBottom:"1px solid rgba(167,139,250,0.2)" }}>{t("hud.settings.audio", "AUDIO")}</div>
        <Toggle label={t("hud.settings.soundEffects", "Sound Effects")} value={sound} onChange={setSound} locked />
        <Toggle label={t("hud.settings.music", "Music")}               value={music} onChange={setMusic} locked />

        {/* Language */}
        <div style={{ padding: isMobile ? "6px 10px 3px" : "8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize: isMobile ? 7 : 9, letterSpacing:"0.15em", color:"rgba(167,139,250,0.85)",
          borderBottom:"1px solid rgba(167,139,250,0.2)" }}>{t("hud.settings.language", "LANGUAGE")}</div>

        {/* Scrollable 2-column checkbox grid */}
        <div style={{
          padding: isMobile ? "6px 10px" : "8px 14px",
          maxHeight: isMobile ? 150 : 210,
          overflowY: "auto",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: isMobile ? 3 : 4,
          }}>
            {HUD_LANGS.map(lang => {
              const isActive = currentLang === lang.code || currentLang.startsWith(lang.code + "-");
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLangSelect(lang.code)}
                  style={{
                    display:"flex", alignItems:"center", gap: isMobile ? 5 : 7,
                    padding: isMobile ? "4px 6px" : "5px 8px",
                    background: isActive ? "rgba(167,139,250,0.12)" : "transparent",
                    border: "none", borderRadius:3, cursor:"pointer", textAlign:"left",
                    opacity: lang.supported ? 1 : 0.7,
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: isMobile ? 12 : 14, height: isMobile ? 12 : 14,
                    borderRadius: 2, flexShrink: 0,
                    border: `1.5px solid ${isActive ? "#a78bfa" : "rgba(255,255,255,0.22)"}`,
                    background: isActive ? "#a78bfa" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"background 0.15s, border-color 0.15s",
                  }}>
                    {isActive && <span style={{ color:"#fff", fontSize: isMobile ? 7 : 9, lineHeight:1, fontWeight:"bold" }}>✓</span>}
                  </div>
                  <span style={{
                    fontFamily:"Orbitron,sans-serif",
                    fontSize: isMobile ? 7 : 9,
                    color: isActive ? "#c4b5fd" : "rgba(199,233,247,0.7)",
                    letterSpacing:"0.04em",
                    fontWeight: isActive ? "bold" : "normal",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Translation */}
        <div style={{ padding: isMobile ? "6px 10px 3px" : "8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize: isMobile ? 7 : 9, letterSpacing:"0.15em", color:"rgba(167,139,250,0.85)",
          borderBottom:"1px solid rgba(167,139,250,0.2)" }}>{t("hud.settings.chatTranslation", "CHAT TRANSLATION")}</div>

        <div style={{ padding: isMobile ? "5px 10px 4px" : "7px 14px 5px" }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
            color:"rgba(199,233,247,0.5)", letterSpacing:"0.04em", lineHeight:1.5, marginBottom:4 }}>
            {t("hud.settings.chatTranslationDesc", "You can enable or disable Chat Translation.")}
          </div>
          <Toggle
            label={t("hud.settings.autoTranslation", "Auto Translation")}
            value={autoTranslate}
            onChange={setAutoTranslate}
          />
        </div>

        {/* Per-language chat translation toggles */}
        {autoTranslate && (
          <div style={{
            padding: isMobile ? "4px 10px 8px" : "4px 14px 8px",
            maxHeight: isMobile ? 130 : 180,
            overflowY: "auto",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: isMobile ? 2 : 3,
            }}>
              {HUD_LANGS.map(lang => {
                const on = chatLangs[lang.code] ?? true;
                return (
                  <div key={lang.code} style={{
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap: isMobile ? 3 : 4,
                    padding: isMobile ? "4px 2px" : "5px 3px",
                    borderBottom: `1px solid rgba(0,229,255,0.05)`,
                  }}>
                    <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
                      color:"rgba(199,233,247,0.7)", letterSpacing:"0.04em",
                      textAlign:"center", lineHeight:1.3 }}>
                      {lang.engLabel}
                    </span>
                    {/* Mini toggle */}
                    <div
                      onClick={() => toggleChatLang(lang.code, !on)}
                      style={{
                        width: isMobile ? 28 : 34, height: isMobile ? 15 : 18,
                        borderRadius: 9, cursor:"pointer",
                        background: on ? "rgba(0,212,255,0.28)" : "rgba(255,255,255,0.07)",
                        border: `1.5px solid ${on ? "#00D4FF" : "rgba(255,255,255,0.18)"}`,
                        position:"relative", transition:"background 0.2s, border-color 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position:"absolute",
                        top: isMobile ? 1.5 : 2,
                        left: on ? (isMobile ? 13 : 16) : 2,
                        width: isMobile ? 10 : 12, height: isMobile ? 10 : 12,
                        borderRadius:"50%",
                        background: on ? "#00D4FF" : "rgba(255,255,255,0.3)",
                        boxShadow: on ? "0 0 6px rgba(0,212,255,0.8)" : "none",
                        transition:"left 0.2s, background 0.2s",
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile */}
        <div style={{ padding: isMobile ? "6px 10px 3px" : "8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize: isMobile ? 7 : 9, letterSpacing:"0.15em", color:"rgba(167,139,250,0.85)",
          borderBottom:"1px solid rgba(167,139,250,0.2)" }}>{t("hud.settings.profile", "PROFILE")}</div>

        <div style={{ padding: isMobile ? "7px 10px" : "10px 14px", borderBottom:"1px solid rgba(0,229,255,0.07)" }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, color:"#c7e9f7",
            letterSpacing:"0.1em", marginBottom:8 }}>{t("hud.changeName", "CHANGE NAME")}</div>
          <div style={{ display:"flex", gap:6 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={localStorage.getItem("hypertek_display_name") || "Enter your name..."}
              maxLength={20}
              style={{
                flex:1, background:"rgba(0,12,30,0.9)",
                border:"1px solid rgba(167,139,250,0.35)", borderRadius:4,
                padding: isMobile ? "4px 6px" : "5px 8px", color:"#e2e8f0",
                fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11,
                outline:"none",
              }}
            />
            <button onClick={handleSaveName} style={{
              padding: isMobile ? "4px 7px" : "5px 10px",
              background: saved ? "rgba(74,222,128,0.2)" : "rgba(167,139,250,0.15)",
              border:`1px solid ${saved ? "#4ade80" : "rgba(167,139,250,0.5)"}`,
              borderRadius:4, cursor:"pointer",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight:"bold",
              color: saved ? "#4ade80" : "#c4b5fd", letterSpacing:"0.08em",
              transition:"all 0.2s",
            }}>{saved ? t("hud.saved", "✓ SAVED") : t("hud.save", "SAVE")}</button>
          </div>
        </div>

        <div onClick={() => navigate("/Profile")} style={{
          padding: isMobile ? "7px 10px" : "10px 14px", cursor:"pointer",
          borderBottom:"1px solid rgba(0,229,255,0.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          transition:"background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(167,139,250,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11,
            color:"#c7e9f7", letterSpacing:"0.1em" }}>{t("hud.profileDetails", "PROFILE DETAILS")}</span>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize: isMobile ? 8 : 10 }}>›</span>
        </div>

        {/* Support */}
        <div style={{ padding: isMobile ? "6px 10px 3px" : "8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize: isMobile ? 7 : 9, letterSpacing:"0.15em", color:"rgba(167,139,250,0.85)",
          borderBottom:"1px solid rgba(167,139,250,0.2)" }}>{t("hud.settings.support", "SUPPORT")}</div>

        <div style={{
          padding: isMobile ? "7px 10px" : "10px 14px", cursor:"not-allowed",
          borderBottom:"1px solid rgba(0,229,255,0.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          opacity: 0.5,
        }}>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11,
            color:"#c7e9f7", letterSpacing:"0.1em" }}>{t("hud.contactSupport", "CONTACT SUPPORT")}</span>
          <span style={{ fontSize: isMobile ? 9 : 11 }}>🔒</span>
        </div>

        <div style={{ padding: isMobile ? "8px 10px" : "12px 14px", textAlign:"center" }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
            color:"rgba(100,140,180,0.6)", letterSpacing:"0.08em" }}>
            HYPER-TEK v1.0.0
          </div>
        </div>
      </div>
    </SidePanel>
  );
}

/* ── Alliance data ───────────────────────────────────────────── */
const ALLIANCE_TABS = ["Members", "Mail", "Manage"];

const ALLIANCE_MEMBERS = [
  { name: "Commander Rex",  rank: "Leader",     status: "Online",  power: "2.4M" },
  { name: "Warden-7",       rank: "Co-Leader",  status: "Online",  power: "1.8M" },
  { name: "Pilot Zara",     rank: "Officer",    status: "Offline", power: "1.2M" },
  { name: "Ace Vega",       rank: "Member",     status: "Offline", power: "980K" },
  { name: "Iron Mace",      rank: "Member",     status: "Online",  power: "760K" },
  { name: "Dr. Nova",       rank: "Member",     status: "Away",    power: "640K" },
  { name: "Mechanic Kole",  rank: "Member",     status: "Offline", power: "520K" },
  { name: "Medic Ryn",      rank: "Member",     status: "Online",  power: "480K" },
];

const ALLIANCE_MAILS = [
  { key: "warResults",      from: "SYSTEM",         subject: "Alliance War Results",     time: "2h ago", unread: true  },
  { key: "strategyPlan",    from: "Commander Rex",  subject: "New Strategy Plan",        time: "5h ago", unread: true  },
  { key: "donationSummary", from: "SYSTEM",         subject: "Weekly Donation Summary",  time: "1d ago", unread: false },
  { key: "meeting1800",     from: "Warden-7",       subject: "Meeting at 18:00",         time: "2d ago", unread: false },
  { key: "levelUp",         from: "SYSTEM",         subject: "Alliance Level Up!",       time: "3d ago", unread: false },
];

const ALLIANCE_MANAGE = [
  { key: "editInfo",      action: "Edit Alliance Info",     desc: "Change name, tag & description"           },
  { key: "joinRequests",  action: "Manage Join Requests",   desc: "Review and accept new members"            },
  { key: "donationGoals", action: "Set Donation Goals",     desc: "Configure weekly donation targets"         },
  { key: "warSettings",   action: "Alliance War Settings",  desc: "Configure war participation rules"         },
  { key: "kickMembers",   action: "Kick Members",           desc: "Remove inactive or rule-breaking members"  },
];

/* ── Alliance panel ──────────────────────────────────────────── */
function AlliancePanel({ onClose, isMobile, panelRight }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("Members");

  const statusColor = (s) => s === "Online" ? "#4ade80" : s === "Away" ? "#fbbf24" : "#64748b";

  return (
    <SidePanel title={t("hud.sidebar.alliance", "ALLIANCE")} accentColor="#fbbf24" onClose={onClose} isMobile={isMobile} showSubtitle panelRight={panelRight}>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(251,191,36,0.15)", flexShrink:0 }}>
        {ALLIANCE_TABS.map(tabKey => (
          <button key={tabKey} className="hud-panel-tab"
            onClick={() => setTab(tabKey)}
            style={{
              flex:1, padding: isMobile ? "5px 2px" : "7px 4px", background:"none", border:"none",
              borderBottom: tab === tabKey ? "2px solid #fbbf24" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, fontWeight:"bold",
              letterSpacing:"0.08em",
              color: tab === tabKey ? "#fbbf24" : "rgba(200,170,80,0.7)",
            }}>{t(`hud.allianceTabs.${tabKey.toLowerCase()}`, tabKey).toUpperCase()}</button>
        ))}
      </div>

      {/* Members */}
      {tab === "Members" && (
        <div style={{ overflowY:"auto", flex:1 }}>
          {ALLIANCE_MEMBERS.map((m, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding: isMobile ? "7px 10px" : "9px 14px",
              borderBottom:"1px solid rgba(251,191,36,0.08)",
              opacity:0.8, cursor:"not-allowed",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 7 : 10, minWidth:0 }}>
                <div style={{
                  width: isMobile ? 24 : 30, height: isMobile ? 24 : 30, borderRadius:"50%", flexShrink:0,
                  background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize: isMobile ? 11 : 14,
                }}>👤</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight:"bold",
                    color:"#e2d9a0", letterSpacing:"0.06em",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>{m.name}</div>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
                    color:"rgba(251,191,36,0.55)", letterSpacing:"0.06em", marginTop:2,
                  }}>{t(`hud.alliance.rank.${m.rank.replace(/[- ]/g,"").toLowerCase()}`, m.rank)}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 6 : 8, flexShrink:0 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, color:"#fbbf24", letterSpacing:"0.04em" }}>{m.power}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:3, justifyContent:"flex-end", marginTop:2 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:statusColor(m.status) }}/>
                    <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 5 : 7, color:statusColor(m.status) }}>{t(`hud.alliance.status.${m.status.toLowerCase()}`, m.status)}</span>
                  </div>
                </div>
                <span style={{ fontSize: isMobile ? 9 : 11 }}>🔒</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mail */}
      {tab === "Mail" && (
        <div style={{ overflowY:"auto", flex:1 }}>
          {ALLIANCE_MAILS.map((m, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding: isMobile ? "7px 10px" : "9px 14px",
              borderBottom:"1px solid rgba(251,191,36,0.08)",
              opacity:0.8, cursor:"not-allowed",
              background: m.unread ? "rgba(251,191,36,0.04)" : "transparent",
            }}>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  {m.unread && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fbbf24", flexShrink:0 }}/>}
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight:"bold",
                    color: m.unread ? "#fde68a" : "#c4a84a", letterSpacing:"0.06em",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>{t(`hud.alliance.allianceMail.${m.key}`, m.subject)}</div>
                </div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8, color:"rgba(251,191,36,0.45)", letterSpacing:"0.04em" }}>
                  {m.from} · {m.time}
                </div>
              </div>
              <span style={{ fontSize: isMobile ? 9 : 11, marginLeft:8, flexShrink:0 }}>🔒</span>
            </div>
          ))}
        </div>
      )}

      {/* Manage */}
      {tab === "Manage" && (
        <div style={{ overflowY:"auto", flex:1 }}>
          {ALLIANCE_MANAGE.map((m, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding: isMobile ? "8px 10px" : "11px 14px",
              borderBottom:"1px solid rgba(251,191,36,0.08)",
              opacity:0.7, cursor:"not-allowed",
            }}>
              <div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight:"bold",
                  color:"#e2d9a0", letterSpacing:"0.06em", marginBottom:2,
                }}>{t(`hud.alliance.manage.${m.key}`, m.action)}</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8, color:"rgba(251,191,36,0.45)", letterSpacing:"0.04em" }}>{t(`hud.alliance.manage.${m.key}Desc`, m.desc)}</div>
              </div>
              <span style={{ fontSize: isMobile ? 9 : 11, marginLeft:8, flexShrink:0 }}>🔒</span>
            </div>
          ))}
        </div>
      )}

    </SidePanel>
  );
}

/* ── Mail data ───────────────────────────────────────────────── */
const MAIL_CATS = ["ALL", "SYSTEM", "ALLIANCE", "EVENTS", "BATTLE"];

const MAIL_MESSAGES = [
  { key: "welcome",       cat: "SYSTEM",   from: "HyperTek System",  subject: "Welcome to HyperTek!",          time: "Just now", unread: true  },
  { key: "maintenance",   cat: "SYSTEM",   from: "HyperTek System",  subject: "Server Maintenance Notice",     time: "1h ago",   unread: true  },
  { key: "allianceWar",   cat: "ALLIANCE", from: "Commander Rex",    subject: "Alliance War Announcement",     time: "3h ago",   unread: false },
  { key: "galacticCup",   cat: "EVENTS",   from: "Events Team",      subject: "Galactic Cup Registration",     time: "1d ago",   unread: false },
  { key: "baseAttacked",  cat: "BATTLE",   from: "Battle System",    subject: "Your base was attacked!",       time: "1d ago",   unread: false },
  { key: "loginReward",   cat: "SYSTEM",   from: "HyperTek System",  subject: "Daily Login Reward Ready",      time: "2d ago",   unread: false },
  { key: "refiningEvent", cat: "EVENTS",   from: "Events Team",      subject: "Refining Master Event Starts",  time: "3d ago",   unread: false },
  { key: "meeting1800",   cat: "ALLIANCE", from: "Warden-7",         subject: "Meeting at 18:00",              time: "4d ago",   unread: false },
];

const MAIL_CAT_COLOR = { ALL:"#00E5FF", SYSTEM:"#94a3b8", ALLIANCE:"#fbbf24", EVENTS:"#4ade80", BATTLE:"#f87171" };

/* ── Mail panel ─────────────────────────────────────────────── */
function MailPanel({ onClose, isMobile, panelRight }) {
  const { t } = useTranslation();
  const [cat, setCat] = useState("ALL");
  const filtered = cat === "ALL" ? MAIL_MESSAGES : MAIL_MESSAGES.filter(m => m.cat === cat);

  return (
    <div className="hud-side-panel" style={{
      position:"absolute",
      right: isMobile ? "18vw" : panelRight,
      top:   isMobile ? "60px" : "21vh",
      width: isMobile ? 310 : 560,
      maxHeight: isMobile ? "75vh" : "70vh",
      zIndex:29,
      background:"rgba(5,12,28,0.97)",
      border:"1px solid rgba(0,229,255,0.25)",
      borderRadius:"6px 0 0 6px",
      backdropFilter:"blur(16px)",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.6)",
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding: isMobile ? "7px 10px 6px" : "10px 14px 8px",
        borderBottom:"1px solid rgba(0,229,255,0.15)", flexShrink:0,
      }}>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 12, fontWeight:"bold",
            letterSpacing:"0.18em", color:"#00E5FF", textShadow:"0 0 10px rgba(0,229,255,0.8)" }}>{t("hud.sidebar.mail", "MAIL")}</span>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
            letterSpacing:"0.12em", color:"rgba(0,229,255,0.53)" }}>{t("hud.availableAfterLaunch", "AVAILABLE IN-GAME AFTER OFFICIAL LAUNCH")}</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:"rgba(157,216,240,0.5)", fontSize: isMobile ? 13 : 16, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:4, padding: isMobile ? "5px 8px" : "6px 12px",
        borderBottom:"1px solid rgba(0,229,255,0.1)", flexShrink:0, overflowX:"auto" }}>
        {MAIL_CATS.map(c => {
          const active = cat === c;
          const col = MAIL_CAT_COLOR[c];
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: isMobile ? "2px 7px" : "3px 9px", borderRadius:10, flexShrink:0,
              background: active ? `${col}22` : "transparent",
              border: `1px solid ${active ? col : "rgba(255,255,255,0.1)"}`,
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8, fontWeight:"bold",
              letterSpacing:"0.08em", color: active ? col : "rgba(157,216,240,0.5)",
              cursor:"pointer",
            }}>{t(`hud.mailCats.${c.toLowerCase()}`, c)}</button>
          );
        })}
      </div>

      {/* Mail list */}
      <div style={{ overflowY:"auto", flex:1 }}>
        {filtered.map((m, i) => {
          const col = MAIL_CAT_COLOR[m.cat];
          return (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding: isMobile ? "7px 10px" : "9px 14px",
              borderBottom:"1px solid rgba(0,229,255,0.07)",
              background: m.unread ? "rgba(0,229,255,0.04)" : "transparent",
              opacity:0.82, cursor:"not-allowed",
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                  {m.unread && <div style={{ width:5, height:5, borderRadius:"50%", background:"#00E5FF", flexShrink:0 }}/>}
                  <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 5 : 7,
                    letterSpacing:"0.1em", color:col, background:`${col}18`,
                    padding:"1px 5px", borderRadius:3, border:`1px solid ${col}33`, flexShrink:0,
                  }}>{t(`hud.mailCats.${m.cat.toLowerCase()}`, m.cat)}</span>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight:"bold",
                    color: m.unread ? "#c7e9f7" : "rgba(157,216,240,0.75)",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"0.05em",
                  }}>{t(`hud.mailSubjects.${m.key}`, m.subject)}</div>
                </div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
                  color:"rgba(100,160,200,0.5)", letterSpacing:"0.04em",
                }}>{m.from} · {m.time}</div>
              </div>
              <span style={{ fontSize: isMobile ? 9 : 11, marginLeft:8, flexShrink:0 }}>🔒</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Chat data ───────────────────────────────────────────────── */
const CHAT_TABS_LIST = ["WORLD", "ALLIANCE", "TRADE"];

const CHAT_MESSAGES = [
  { key:"allianceWarTonight",   tab:"WORLD",    user:"Commander Rex",  msg:"Anyone up for alliance war tonight?",   time:"14:32", color:"#f87171" },
  { key:"ggLastRace",           tab:"WORLD",    user:"Pilot Zara",     msg:"GG on the last race, great speed run",  time:"14:28", color:"#22c55e" },
  { key:"tradingPlasma",        tab:"WORLD",    user:"Dr. Nova",       msg:"Trading plasma rods for tech books",    time:"14:15", color:"#a78bfa" },
  { key:"needHelpAsteroid",     tab:"WORLD",    user:"Iron Mace",      msg:"Need help with the asteroid mission",   time:"13:58", color:"#fb923c" },
  { key:"allianceRecruiting",   tab:"WORLD",    user:"Warden-7",       msg:"Our alliance is recruiting, DM me",     time:"13:44", color:"#94a3b8" },
  { key:"donationGoalsPlasma",  tab:"ALLIANCE", user:"Commander Rex",  msg:"Donation goals: plasma rods needed!",   time:"14:40", color:"#f87171" },
  { key:"warStarts2Hours",      tab:"ALLIANCE", user:"Warden-7",       msg:"War starts in 2 hours, prepare",        time:"14:35", color:"#94a3b8" },
  { key:"handleMedicalSupport", tab:"ALLIANCE", user:"Medic Ryn",      msg:"I will handle the medical support",     time:"14:30", color:"#f0abfc" },
  { key:"wts50Engines",         tab:"TRADE",    user:"Mechanic Kole",  msg:"WTS: 50 engines, PM me",                time:"14:20", color:"#fcd34d" },
  { key:"wtbAntiGravity",       tab:"TRADE",    user:"Medic Ryn",      msg:"WTB: Anti-gravity modules x10",         time:"14:10", color:"#f0abfc" },
  { key:"sellingRareSkins",     tab:"TRADE",    user:"Ace Vega",       msg:"Selling rare skins, check profile",     time:"13:55", color:"#38bdf8" },
];

/* ── Chat panel ─────────────────────────────────────────────── */
function ChatPanel({ onClose, isMobile, autoTranslate, panelRight }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("WORLD");
  const msgs = CHAT_MESSAGES.filter(m => m.tab === tab);

  return (
    <div className="hud-side-panel" style={{
      position:"absolute",
      right: isMobile ? "18vw" : panelRight,
      top:   isMobile ? "60px" : "21vh",
      width: isMobile ? 220 : 340,
      maxHeight: isMobile ? "62vh" : "58vh",
      zIndex:29,
      background:"rgba(5,12,28,0.97)",
      border:"1px solid rgba(0,229,255,0.25)",
      borderRadius:"6px 0 0 6px",
      backdropFilter:"blur(16px)",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.6)",
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding: isMobile ? "7px 10px 6px" : "10px 14px 8px",
        borderBottom:"1px solid rgba(0,229,255,0.15)", flexShrink:0,
      }}>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 12, fontWeight:"bold",
            letterSpacing:"0.18em", color:"#00E5FF", textShadow:"0 0 10px rgba(0,229,255,0.8)" }}>{t("hud.sidebar.chat", "CHAT")}</span>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 8,
            letterSpacing:"0.12em", color:"rgba(0,229,255,0.53)" }}>{t("hud.availableAfterLaunch", "AVAILABLE IN-GAME AFTER OFFICIAL LAUNCH")}</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:"rgba(157,216,240,0.5)", fontSize: isMobile ? 13 : 16, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Channel tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(0,229,255,0.1)", flexShrink:0 }}>
        {CHAT_TABS_LIST.map(tabKey => (
          <button key={tabKey} className="hud-panel-tab"
            onClick={() => setTab(tabKey)}
            style={{
              flex:1, padding: isMobile ? "4px 2px" : "6px 4px", background:"none", border:"none",
              borderBottom: tab === tabKey ? "2px solid #00E5FF" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, fontWeight:"bold",
              letterSpacing:"0.06em", color: tab === tabKey ? "#00E5FF" : "rgba(157,216,240,0.5)",
            }}>{t(`hud.chatTabs.${tabKey.toLowerCase()}`, tabKey)}</button>
        ))}
      </div>

      {/* Auto-translate indicator */}
      <div style={{
        padding: isMobile ? "3px 8px" : "4px 10px",
        background: autoTranslate ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(0,229,255,0.08)",
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
          background: autoTranslate ? "#00E5FF" : "rgba(157,216,240,0.25)",
          boxShadow: autoTranslate ? "0 0 5px rgba(0,229,255,0.7)" : "none",
        }}/>
        <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 7,
          color: autoTranslate ? "rgba(0,229,255,0.7)" : "rgba(157,216,240,0.3)",
          letterSpacing: "0.05em",
        }}>
          {autoTranslate
            ? t("hud.chat.autoTranslateOn", "Auto-translate ON — Messages delivered in each recipient's language")
            : t("hud.chat.autoTranslateOff", "Auto-translate OFF")}
        </span>
      </div>

      {/* Messages */}
      <div className="chat-scroll" style={{ overflowY:"auto", flex:1, padding: isMobile ? "6px 8px" : "8px 10px",
        display:"flex", flexDirection:"column", gap: isMobile ? 5 : 7 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display:"flex", gap: isMobile ? 5 : 7, alignItems:"flex-start",
            opacity:0.75, cursor:"not-allowed",
          }}>
            <div style={{
              width: isMobile ? 20 : 26, height: isMobile ? 20 : 26, borderRadius:"50%", flexShrink:0,
              background:`${m.color}18`, border:`1px solid ${m.color}44`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: isMobile ? 9 : 11,
            }}>👤</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:5, marginBottom:2 }}>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, fontWeight:"bold",
                  color:m.color, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{m.user}</span>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 5 : 7,
                  color:"rgba(157,216,240,0.35)" }}>{m.time}</span>
                <span style={{ fontSize: isMobile ? 7 : 9, marginLeft:"auto" }}>🔒</span>
              </div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                color:"rgba(157,216,240,0.6)", lineHeight:1.5, wordBreak:"break-word" }}>{t(`hud.chatMessages.${m.key}`, m.msg)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Locked input */}
      <div style={{
        padding: isMobile ? "5px 8px" : "7px 10px",
        borderTop:"1px solid rgba(0,229,255,0.1)", flexShrink:0,
        display:"flex", gap:5, alignItems:"center",
        opacity:0.4, cursor:"not-allowed",
      }}>
        <div style={{
          flex:1, height: isMobile ? 24 : 30, borderRadius:4,
          background:"rgba(0,12,30,0.9)", border:"1px solid rgba(0,229,255,0.2)",
          display:"flex", alignItems:"center", paddingLeft:8,
        }}>
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 7 : 8,
            color:"rgba(157,216,240,0.35)" }}>🔒 {t("hud.chatLocked", "Chat locked until launch...")}</span>
        </div>
        <div style={{
          width: isMobile ? 24 : 30, height: isMobile ? 24 : 30, borderRadius:4,
          background:"rgba(0,229,255,0.06)", border:"1px solid rgba(0,229,255,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: isMobile ? 9 : 11,
        }}>→</div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function SidebarPanel() {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [openPanel, setOpenPanel] = useState(null);
  const sidebarRef = useRef(null);
  const buttonsRef = useRef(null);
  const [panelRight, setPanelRight] = useState("calc(8.5vw + 4px)");

  const [autoTranslate, setAutoTranslate] = useState(() => {
    const saved = localStorage.getItem("hypertek_auto_translate");
    return saved !== null ? saved === "true" : true;
  });

  const handleSetAutoTranslate = (val) => {
    setAutoTranslate(val);
    localStorage.setItem("hypertek_auto_translate", String(val));
  };

  useEffect(() => {
    const updatePanelRight = () => {
      if (buttonsRef.current) {
        const w = buttonsRef.current.offsetWidth;
        setPanelRight(`calc(2.5vw + ${w + 10}px)`);
      }
    };
    updatePanelRight();
    const obs = new ResizeObserver(updatePanelRight);
    if (buttonsRef.current) obs.observe(buttonsRef.current);
    window.addEventListener("resize", updatePanelRight);
    return () => { obs.disconnect(); window.removeEventListener("resize", updatePanelRight); };
  }, []);

  const toggle = (key) => setOpenPanel(p => p === key ? null : key);

  // Close panel when clicking anywhere outside the sidebar area
  useEffect(() => {
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeStyle = (key) => openPanel === key
    ? { background: "rgba(0,229,255,0.12)", borderLeftColor: "#00ffff", color: "#fff" }
    : {};

  return (
    <div ref={sidebarRef}>
      <style>{CSS}</style>

      {/* ── Buttons ── */}
      <div ref={buttonsRef} style={{
        position: "absolute",
        right: isMobile ? "3vw" : "2.5vw",
        top: isMobile ? "60px" : "18vh",
        display: "flex", flexDirection: "column",
        alignItems: "stretch",
        gap: isMobile ? 2 : 4,
        zIndex: 30, padding: "0 4px",
      }}>
        {["events","items","settings","alliance","mail","chat"].map(key => (
          <button key={key} className="hud-sidebar-btn" onClick={() => toggle(key)}
            style={{
              ...BTN_BASE,
              ...activeStyle(key),
              padding:   isMobile ? "5px 8px" : BTN_BASE.padding,
              fontSize:  isMobile ? 7 : BTN_BASE.fontSize,
              letterSpacing: isMobile ? "0.06em" : BTN_BASE.letterSpacing,
            }}>
            {t(`hud.sidebar.${key}`, key.toUpperCase())}
          </button>
        ))}
      </div>

      {/* ── Panels ── */}
      {openPanel === "events"   && <EventsPanel   onClose={() => setOpenPanel(null)} isMobile={isMobile} panelRight={panelRight} />}
      {openPanel === "items"    && <ItemsPanel    onClose={() => setOpenPanel(null)} isMobile={isMobile} panelRight={panelRight} />}
      {openPanel === "settings" && <SettingsPanel onClose={() => setOpenPanel(null)} isMobile={isMobile} autoTranslate={autoTranslate} setAutoTranslate={handleSetAutoTranslate} panelRight={panelRight} />}
      {openPanel === "alliance" && <AlliancePanel onClose={() => setOpenPanel(null)} isMobile={isMobile} panelRight={panelRight} />}
      {openPanel === "mail"     && <MailPanel     onClose={() => setOpenPanel(null)} isMobile={isMobile} panelRight={panelRight} />}
      {openPanel === "chat"     && <ChatPanel     onClose={() => setOpenPanel(null)} isMobile={isMobile} autoTranslate={autoTranslate} panelRight={panelRight} />}
    </div>
  );
}
