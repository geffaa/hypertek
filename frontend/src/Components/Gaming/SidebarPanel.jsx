import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ── Event data ───────────────────────────────────────────────── */
// locked: true = coming soon (game not yet created)
const EVENT_DATA = {
  Limited: [
    { title: "Invite Friends",      status: "Event Ongoing", time: null,       locked: false },
    { title: "Land Base Oversight", status: "Event Ongoing", time: null,       locked: true  },
    { title: "Quests Trail",        status: "Event Ongoing", time: null,       locked: true  },
    { title: "Contract Killer",     status: "Event Ongoing", time: null,       locked: true  },
    { title: "Mazed Mission",       status: "Ends in",       time: "1d 18:17", locked: true  },
    { title: "Flaming Asteroid",    status: "Ends in",       time: "2d 06:17", locked: true  },
    { title: "Refining Master",     status: "Ends in",       time: "2d 06:17", locked: true  },
    { title: "Star Gaze",           status: "Ends in",       time: "6d 18:17", locked: true  },
  ],
  Activities: [
    { title: "Daily Login Bonus",       status: "Resets daily",   time: null,        locked: false },
    { title: "Battle Pass",             status: "Season ends in", time: "12d 04:00", locked: true  },
    { title: "Alliance War",            status: "Event Ongoing",  time: null,        locked: true  },
    { title: "Weekly Challenge",        status: "Ends in",        time: "4d 10:30",  locked: true  },
  ],
  Competition: [
    { title: "Galactic Cup",            status: "Starts in",      time: "3d 00:00",  locked: true  },
    { title: "Speed Racing Tournament", status: "Ends in",        time: "5d 12:00",  locked: true  },
    { title: "Overlord Championship",   status: "Event Ongoing",  time: null,        locked: true  },
  ],
};

/* ── Items data ───────────────────────────────────────────────── */
const ITEM_TABS = ["Inventory", "Weapons", "Rewards", "Specialists"];

const ITEM_DATA = {
  Inventory: [
    { name: "Quest Items",   qty: 0, color: "#c4b5fd", icon: "📜", locked: true },
    { name: "Banners",       qty: 0, color: "#fcd34d", icon: "🚩", locked: true },
    { name: "Medals",        qty: 0, color: "#fb923c", icon: "🏅", locked: true },
    { name: "Skins",         qty: 0, color: "#38bdf8", icon: "🎨", locked: true },
    { name: "Anti-Gravity",  qty: 0, color: "#a78bfa", icon: "🔮", locked: true },
    { name: "Plasma Rods",   qty: 0, color: "#f87171", icon: "⚡", locked: true },
    { name: "Dark Matter",   qty: 0, color: "#818cf8", icon: "🌀", locked: true },
    { name: "Tech Books",    qty: 0, color: "#67e8f9", icon: "📗", locked: true },
    { name: "Engines",       qty: 0, color: "#fb923c", icon: "⚙️", locked: true },
    { name: "Vehicles",      qty: 0, color: "#6ee7b7", icon: "🚗", locked: true },
    { name: "Tools",         qty: 0, color: "#94a3b8", icon: "🔧", locked: true },
    { name: "Aid Packs",     qty: 0, color: "#f87171", icon: "🩹", locked: true },
  ],
  Weapons: [
    { name: "Blades",      color: "#38bdf8", icon: "⚔️",  locked: true },
    { name: "Guns",        color: "#f87171", icon: "🔫", locked: true },
    { name: "Mines",       color: "#6ee7b7", icon: "💣", locked: true },
    { name: "Grenades",    color: "#fb923c", icon: "💥", locked: true },
    { name: "Helmet",      color: "#c4b5fd", icon: "⛑️",  locked: true },
    { name: "Suits",       color: "#67e8f9", icon: "🥋", locked: true },
    { name: "Gloves",      color: "#a78bfa", icon: "🧤", locked: true },
    { name: "Boots",       color: "#fcd34d", icon: "👢", locked: true },
    { name: "Banners",     color: "#f87171", icon: "🚩", locked: true },
    { name: "Medals",      color: "#fcd34d", icon: "🏅", locked: true },
    { name: "Shield",      color: "#38bdf8", icon: "🛡️",  locked: true },
    { name: "Ammo Packs",  color: "#94a3b8", icon: "📦", locked: true },
  ],
  Rewards: [
    { name: "Battle Chest",   qty: 2,  color: "#fcd34d", icon: "📦", status: "OPEN"    },
    { name: "Login Reward",   qty: 1,  color: "#6ee7b7", icon: "🎁", status: "CLAIM"   },
    { name: "Event Trophy",   qty: 3,  color: "#f87171", icon: "🏆", status: "CLAIMED" },
    { name: "Alliance Gift",  qty: 5,  color: "#38bdf8", icon: "🎀", status: "CLAIM"   },
    { name: "Quest Token",    qty: 12, color: "#a78bfa", icon: "🪙", status: "OPEN"    },
    { name: "Race Medal",     qty: 1,  color: "#fb923c", icon: "🥇", status: "CLAIMED" },
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

const RARITY_COLOR = {
  COMMON: "#94a3b8", UNCOMMON: "#6ee7b7", RARE: "#38bdf8",
  EPIC: "#a78bfa",   LEGEND: "#fcd34d",
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
  .hud-item-cell { transition: transform 0.14s, box-shadow 0.14s, background 0.14s; cursor: pointer; }
  .hud-item-cell:hover {
    transform: scale(1.07);
    box-shadow: 0 0 14px rgba(0,212,255,0.35) !important;
    background: rgba(0,229,255,0.12) !important;
  }
  .hud-item-cell:active { transform: scale(0.95); }
  @keyframes panelSlideIn {
    from { opacity:0; transform:translateX(14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .hud-side-panel { animation: panelSlideIn 0.2s ease both; }
`;

const BTN_BASE = {
  padding: "9px 14px", width: "100%",
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
function SidePanel({ title, accentColor = "#00E5FF", onClose, children }) {
  return (
    <div className="hud-side-panel" style={{
      position: "absolute",
      right: "calc(8.5vw + 4px)",
      top: "21vh",
      width: 280,
      maxHeight: "58vh",
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
        padding: "10px 14px 8px",
        borderBottom: `1px solid ${accentColor}20`,
      }}>
        <span style={{
          fontFamily: "Orbitron,sans-serif", fontSize: 9,
          fontWeight: "bold", letterSpacing: "0.18em",
          color: accentColor, textShadow: `0 0 8px ${accentColor}99`,
        }}>{title}</span>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          color: "rgba(157,216,240,0.5)", fontSize: 16,
          cursor: "pointer", lineHeight: 1, padding: "0 2px",
        }}>×</button>
      </div>
      {children}
    </div>
  );
}

/* ── Events panel ────────────────────────────────────────────── */
function EventsPanel({ onClose }) {
  const [tab,    setTab]    = useState("Limited");
  const [detail, setDetail] = useState(null);   // event being viewed

  return (
    <SidePanel title="EVENT CENTER" onClose={onClose}>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(0,229,255,0.1)" }}>
        {["Limited","Activities","Competition"].map(t => (
          <button key={t} className="hud-panel-tab"
            onClick={() => { setTab(t); setDetail(null); }}
            style={{
              flex:1, padding:"7px 4px", background:"none", border:"none",
              borderBottom: tab === t ? "2px solid #00E5FF" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
              letterSpacing:"0.08em",
              color: tab === t ? "#00E5FF" : "rgba(157,216,240,0.5)",
              whiteSpace:"nowrap",
            }}>{t}</button>
        ))}
      </div>

      {/* ── Event list ── */}
      {!detail && (
        <div style={{ overflowY:"auto", flex:1 }}>
          {EVENT_DATA[tab].map((ev, i) => (
            <div key={i} className="hud-event-row"
              onClick={() => !ev.locked && setDetail(ev)}
              style={{
                padding:"9px 14px",
                borderBottom:"1px solid rgba(0,229,255,0.06)",
                opacity: ev.locked ? 0.45 : 1,
                cursor: ev.locked ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
              <div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:8, fontWeight:"bold",
                  letterSpacing:"0.08em", color: ev.locked ? "rgba(157,216,240,0.5)" : "#c7e9f7",
                  marginBottom:3,
                }}>{ev.title}</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5,
                  color: ev.time ? "#facc15" : "rgba(0,229,255,0.5)", letterSpacing:"0.06em",
                }}>
                  {ev.time ? `⏱ ${ev.status} ${ev.time}` : `● ${ev.status}`}
                </div>
              </div>
              {ev.locked
                ? <span style={{ fontSize:11, opacity:0.5 }}>🔒</span>
                : <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                    color:"rgba(0,229,255,0.4)", letterSpacing:"0.06em",
                  }}>VIEW →</span>
              }
            </div>
          ))}
        </div>
      )}

      {/* ── Event detail view ── */}
      {detail && (
        <div style={{ overflowY:"auto", flex:1, padding:"12px 14px" }}>
          <button onClick={() => setDetail(null)} style={{
            background:"none", border:"none", cursor:"pointer", padding:"0 0 10px 0",
            fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(0,229,255,0.6)",
            letterSpacing:"0.1em",
          }}>← BACK</button>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:9, fontWeight:"bold",
            color:"#c7e9f7", letterSpacing:"0.1em", marginBottom:6,
          }}>{detail.title}</div>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5,
            color: detail.time ? "#facc15" : "rgba(0,229,255,0.6)",
            letterSpacing:"0.06em", marginBottom:14,
          }}>
            {detail.time ? `⏱ ${detail.status} ${detail.time}` : `● ${detail.status}`}
          </div>

          <div style={{ height:1, background:"rgba(0,229,255,0.1)", marginBottom:12 }}/>

          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5,
            color:"rgba(157,216,240,0.45)", lineHeight:1.7,
          }}>
            Full event details, rewards, and participation options will be available when this event launches.
          </div>
        </div>
      )}

    </SidePanel>
  );
}

/* ── Items panel ─────────────────────────────────────────────── */
function ItemsPanel({ onClose }) {
  const [tab,          setTab]          = useState("Inventory");
  const [specCategory, setSpecCategory] = useState(null);   // selected specialist category
  const [profile,      setProfile]      = useState(null);   // specialist being viewed
  const items = ITEM_DATA[tab] || [];

  return (
    <SidePanel title="ITEMS" accentColor="#38bdf8" onClose={onClose}>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(56,189,248,0.1)", overflowX:"auto" }}>
        {ITEM_TABS.map(t => (
          <button key={t} className="hud-panel-tab"
            onClick={() => { setTab(t); setSpecCategory(null); setProfile(null); }}
            style={{
              flex:1, padding:"7px 6px", background:"none", border:"none",
              borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
              fontFamily:"Orbitron,sans-serif", fontSize:6.5, fontWeight:"bold",
              letterSpacing:"0.06em",
              color: tab === t ? "#38bdf8" : "rgba(100,170,210,0.5)",
              whiteSpace:"nowrap", minWidth:0,
            }}>{t}</button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ overflowY:"auto", flex:1, padding:"10px", alignContent:"start" }}>

        {/* INVENTORY */}
        {tab === "Inventory" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background: item.locked ? "rgba(3,10,28,0.5)" : "rgba(3,10,28,0.88)",
                border:`1px solid ${item.color}${item.locked ? "22" : "33"}`,
                borderRadius:4, padding:"8px 4px 5px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                boxShadow:`0 0 8px ${item.color}${item.locked ? "00" : "18"}`,
                position:"relative", opacity: item.locked ? 0.55 : 1,
                cursor: item.locked ? "not-allowed" : "pointer",
              }}>
                <div style={{ fontSize:18, lineHeight:1, filter: item.locked ? "grayscale(1)" : "none" }}>{item.icon}</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5, fontWeight:"bold",
                  color: item.locked ? "rgba(148,192,210,0.4)" : item.color,
                  textAlign:"center", letterSpacing:"0.05em", lineHeight:1.2,
                }}>{item.name}</div>
                {item.locked
                  ? <div style={{ fontSize:8, position:"absolute", top:3, right:4 }}>🔒</div>
                  : <div style={{ position:"absolute", top:3, right:4,
                      fontFamily:"Orbitron,sans-serif", fontSize:6, fontWeight:"bold",
                      color:"rgba(255,255,255,0.6)",
                    }}>{item.qty}</div>
                }
              </div>
            ))}
          </div>
        )}

        {/* WEAPONS */}
        {tab === "Weapons" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background:"rgba(3,10,28,0.5)",
                border:`1px solid ${item.color}22`,
                borderRadius:4, padding:"8px 4px 5px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                position:"relative", opacity:0.55, cursor:"not-allowed",
              }}>
                <div style={{ fontSize:18, lineHeight:1, filter:"grayscale(1)" }}>{item.icon}</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5, fontWeight:"bold",
                  color:"rgba(148,192,210,0.4)", textAlign:"center", lineHeight:1.2,
                }}>{item.name}</div>
                <div style={{ fontSize:8, position:"absolute", top:3, right:4 }}>🔒</div>
              </div>
            ))}
          </div>
        )}

        {/* REWARDS */}
        {tab === "Rewards" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
            {items.map((item, i) => (
              <div key={i} className="hud-item-cell" style={{
                background:"rgba(3,10,28,0.88)", border:`1px solid ${item.color}33`,
                borderRadius:4, padding:"8px 4px 5px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                position:"relative", opacity: item.status === "CLAIMED" ? 0.45 : 1,
              }}>
                <div style={{ fontSize:20, lineHeight:1 }}>{item.icon}</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5, fontWeight:"bold",
                  color:"#c7e9f7", textAlign:"center", lineHeight:1.2,
                }}>{item.name}</div>
                {item.status !== "CLAIMED" && (
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5,
                    color: item.status === "OPEN" ? "#fcd34d" : "#4ade80",
                    fontWeight:"bold", letterSpacing:"0.08em",
                  }}>{item.status}</div>
                )}
                {item.qty > 1 && (
                  <div style={{ position:"absolute", top:3, right:4,
                    fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(255,255,255,0.55)",
                  }}>{item.qty}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SPECIALISTS */}
        {tab === "Specialists" && !specCategory && !profile && (
          <>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(56,189,248,0.5)",
              letterSpacing:"0.12em", marginBottom:8,
            }}>SELECT CATEGORY</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
              {SPECIALIST_CATEGORIES.map(cat => {
                const locked = CATEGORY_LOCKED[cat];
                const color  = CATEGORY_COLOR[cat];
                return (
                  <button key={cat} className="hud-item-cell"
                    onClick={() => !locked && setSpecCategory(cat)}
                    style={{
                      background: locked ? "rgba(3,10,28,0.6)" : "rgba(3,10,28,0.88)",
                      border:`1px solid ${color}${locked ? "22" : "55"}`,
                      borderRadius:4, padding:"10px 6px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                      cursor: locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.55 : 1,
                      position:"relative",
                    }}>
                    <div style={{ fontSize:16 }}>
                      {locked ? "🔒" : "👤"}
                    </div>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, fontWeight:"bold",
                      color: locked ? "rgba(157,216,240,0.4)" : color,
                      letterSpacing:"0.06em", textAlign:"center",
                    }}>{cat.toUpperCase()}</div>
                    {locked && (
                      <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:4.5,
                        color:"rgba(157,216,240,0.3)", letterSpacing:"0.1em",
                      }}>COMING SOON</div>
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
              fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(56,189,248,0.6)",
              letterSpacing:"0.1em",
            }}>← BACK</button>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
              color: CATEGORY_COLOR[specCategory], letterSpacing:"0.12em", marginBottom:8,
            }}>{specCategory.toUpperCase()}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {(SPECIALISTS_BY_CATEGORY[specCategory] || []).map((s, i) => (
                <div key={i} className="hud-item-cell"
                  onClick={() => setProfile(s)}
                  style={{
                    background:"rgba(3,10,28,0.88)", border:`1px solid ${s.color}33`,
                    borderRadius:4, padding:"8px 10px",
                    display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                  }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 30%, ${s.color}44, ${s.color}18)`,
                    border:`1.5px solid ${s.color}88`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, flexShrink:0,
                  }}>{s.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
                      color:"#c7e9f7", letterSpacing:"0.06em",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{s.name}</div>
                    <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6, color:s.color,
                      letterSpacing:"0.06em", marginTop:3,
                    }}>{s.role}</div>
                  </div>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                    color:"rgba(56,189,248,0.4)", letterSpacing:"0.06em",
                  }}>VIEW →</div>
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
              fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(56,189,248,0.6)",
              letterSpacing:"0.1em",
            }}>← BACK</button>
            <div style={{
              background:"rgba(3,10,28,0.92)", border:`1px solid ${profile.color}44`,
              borderRadius:6, padding:"16px 14px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              boxShadow:`0 0 24px ${profile.color}22`,
            }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:`radial-gradient(circle at 35% 30%, ${profile.color}55, ${profile.color}22)`,
                border:`2px solid ${profile.color}99`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:32,
              }}>{profile.icon}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:9, fontWeight:"bold",
                color:"#c7e9f7", letterSpacing:"0.1em", textAlign:"center",
              }}>{profile.name}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7,
                color:profile.color, letterSpacing:"0.12em",
              }}>{profile.role}</div>
              <div style={{ width:"100%", height:1, background:`${profile.color}22`, margin:"4px 0" }}/>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                color:"rgba(157,216,240,0.45)", textAlign:"center", lineHeight:1.6,
              }}>
                Specialist profile — full stats and abilities will be available when the game launches.
              </div>
            </div>
          </>
        )}

      </div>
    </SidePanel>
  );
}

/* ── Settings panel ─────────────────────────────────────────── */
function SettingsPanel({ onClose }) {
  const navigate = useNavigate();
  const [sound, setSound]   = useState(true);
  const [music, setMusic]   = useState(true);
  const [name,  setName]    = useState("");
  const [saved, setSaved]   = useState(false);

  const handleSaveName = () => {
    if (!name.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ label, value, onChange }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 14px", borderBottom:"1px solid rgba(0,229,255,0.07)" }}>
      <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:8, letterSpacing:"0.1em",
        color:"#c7e9f7" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width:38, height:20, borderRadius:10, cursor:"pointer",
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
    <SidePanel title="SETTINGS" accentColor="#a78bfa" onClose={onClose}>
      <div style={{ overflowY:"auto", flex:1 }}>

        {/* Sound & Music */}
        <div style={{ padding:"8px 14px 4px", fontFamily:"Orbitron,sans-serif",
          fontSize:6.5, letterSpacing:"0.15em", color:"rgba(167,139,250,0.6)",
          borderBottom:"1px solid rgba(167,139,250,0.12)" }}>AUDIO</div>
        <Toggle label="Sound Effects" value={sound} onChange={setSound} />
        <Toggle label="Music"         value={music} onChange={setMusic} />

        {/* Profile */}
        <div style={{ padding:"8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize:6.5, letterSpacing:"0.15em", color:"rgba(167,139,250,0.6)",
          borderBottom:"1px solid rgba(167,139,250,0.12)" }}>PROFILE</div>

        <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(0,229,255,0.07)" }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, color:"#c7e9f7",
            letterSpacing:"0.1em", marginBottom:8 }}>CHANGE NAME</div>
          <div style={{ display:"flex", gap:6 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="New name..."
              maxLength={20}
              style={{
                flex:1, background:"rgba(0,12,30,0.9)",
                border:"1px solid rgba(167,139,250,0.35)", borderRadius:4,
                padding:"5px 8px", color:"#e2e8f0",
                fontFamily:"Orbitron,sans-serif", fontSize:8,
                outline:"none",
              }}
            />
            <button onClick={handleSaveName} style={{
              padding:"5px 10px",
              background: saved ? "rgba(74,222,128,0.2)" : "rgba(167,139,250,0.15)",
              border:`1px solid ${saved ? "#4ade80" : "rgba(167,139,250,0.5)"}`,
              borderRadius:4, cursor:"pointer",
              fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
              color: saved ? "#4ade80" : "#c4b5fd", letterSpacing:"0.08em",
              transition:"all 0.2s",
            }}>{saved ? "✓ SAVED" : "SAVE"}</button>
          </div>
        </div>

        <div onClick={() => navigate("/Profile")} style={{
          padding:"10px 14px", cursor:"pointer",
          borderBottom:"1px solid rgba(0,229,255,0.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          transition:"background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(167,139,250,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:8,
            color:"#c7e9f7", letterSpacing:"0.1em" }}>PROFILE DETAILS</span>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize:10 }}>›</span>
        </div>

        {/* Support */}
        <div style={{ padding:"8px 14px 4px", marginTop:4, fontFamily:"Orbitron,sans-serif",
          fontSize:6.5, letterSpacing:"0.15em", color:"rgba(167,139,250,0.6)",
          borderBottom:"1px solid rgba(167,139,250,0.12)" }}>SUPPORT</div>

        <div onClick={() => window.open("mailto:support@hyper-tek.io", "_blank")} style={{
          padding:"10px 14px", cursor:"pointer",
          borderBottom:"1px solid rgba(0,229,255,0.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(167,139,250,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:8,
            color:"#c7e9f7", letterSpacing:"0.1em" }}>CONTACT SUPPORT</span>
          <span style={{ color:"rgba(167,139,250,0.6)", fontSize:10 }}>›</span>
        </div>

        <div style={{ padding:"12px 14px", textAlign:"center" }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
            color:"rgba(100,140,180,0.4)", letterSpacing:"0.08em" }}>
            HYPER-TEK v1.0.0
          </div>
        </div>
      </div>
    </SidePanel>
  );
}

/* ── Alliance panel ──────────────────────────────────────────── */
const ALLIANCE_MENU = [
  { label: "Alliance War",      icon: "⚔️",  badge: 1,  desc: "Attacks & rallies vs monsters/players" },
  { label: "Alliance Gift",     icon: "🎁",  badge: 1,  desc: "Rewards for joining alliance rallies"   },
  { label: "Alliance Treasure", icon: "💎",  badge: 5,  desc: "Reports and shared treasure"            },
  { label: "Alliance Building", icon: "🏛️",  badge: 0,  desc: "Donate to construction & tech upgrades" },
  { label: "Alliance Help",     icon: "🤝",  badge: 19, desc: "Reduce upgrade & healing times"         },
  { label: "Alliance Science",  icon: "🔬",  badge: 0,  desc: "Research shared technologies"           },
  { label: "Alliance Shop",     icon: "🛒",  badge: 0,  desc: "Marketplace with reduced commission"    },
];

const ALLIANCE_BOTTOM = ["Mail", "Members", "Manage"];

function AlliancePanel({ onClose, onOpenMail }) {
  const [activeBottom, setActiveBottom] = useState("Members");

  return (
    <SidePanel title="ALLIANCE" accentColor="#fbbf24" onClose={onClose}>
      <div style={{ overflowY:"auto", flex:1 }}>

        {/* Alliance info card */}
        <div style={{
          margin:"10px 10px 0",
          background:"rgba(30,15,5,0.9)",
          border:"1px solid rgba(251,191,36,0.25)",
          borderRadius:6, padding:"10px 12px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:40, height:40, borderRadius:"50%",
              background:"radial-gradient(circle at 35% 30%, rgba(251,191,36,0.4), rgba(120,80,0,0.8))",
              border:"2px solid rgba(251,191,36,0.5)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, flexShrink:0,
            }}>🦅</div>
            <div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:9, fontWeight:"bold",
                color:"#fbbf24", letterSpacing:"0.1em" }}>[HTK] HyperTek</div>
              <div style={{ display:"flex", gap:8, marginTop:3 }}>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                  color:"rgba(251,191,36,0.6)" }}>⚡ 117.5B</span>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                  color:"rgba(157,216,240,0.5)" }}>👥 128 / 150</span>
              </div>
            </div>
          </div>
          <div style={{
            marginTop:8, padding:"5px 8px",
            background:"rgba(0,0,0,0.3)", borderRadius:3,
            fontFamily:"Orbitron,sans-serif", fontSize:6.5,
            color:"rgba(200,180,130,0.7)", fontStyle:"italic",
          }}>
            "United we conquer the 7 Realms"
          </div>
        </div>

        {/* Menu items */}
        <div style={{ marginTop:8 }}>
          {ALLIANCE_MENU.map((item, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px",
              borderBottom:"1px solid rgba(251,191,36,0.07)",
              cursor:"pointer", transition:"background 0.14s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(251,191,36,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div style={{
                width:30, height:30, borderRadius:6, flexShrink:0,
                background:"rgba(30,15,0,0.8)",
                border:"1px solid rgba(251,191,36,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15,
              }}>{item.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7.5,
                  fontWeight:"bold", color:"#fbbf24", letterSpacing:"0.07em" }}>
                  {item.label}
                </div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                  color:"rgba(200,180,130,0.5)", marginTop:1.5 }}>
                  {item.desc}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                {item.badge > 0 && (
                  <div style={{
                    width:18, height:18, borderRadius:"50%",
                    background:"#dc2626", display:"flex", alignItems:"center",
                    justifyContent:"center",
                    fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
                    color:"#fff",
                  }}>{item.badge}</div>
                )}
                <span style={{ color:"rgba(251,191,36,0.5)", fontSize:12 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tabs */}
      <div style={{
        display:"flex", borderTop:"1px solid rgba(251,191,36,0.15)",
        flexShrink:0,
      }}>
        {ALLIANCE_BOTTOM.map(t => (
          <button key={t} onClick={() => t === "Mail" ? onOpenMail?.() : setActiveBottom(t)} style={{
            flex:1, padding:"8px 4px", background:"none", border:"none",
            borderTop: activeBottom === t ? "2px solid #fbbf24" : "2px solid transparent",
            fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
            letterSpacing:"0.08em",
            color: activeBottom === t ? "#fbbf24" : "rgba(200,170,80,0.45)",
            cursor:"pointer", transition:"color 0.15s",
          }}>{t}</button>
        ))}
      </div>
    </SidePanel>
  );
}

/* ── Mail panel ─────────────────────────────────────────────── */
const MAIL_CATEGORIES = [
  { key: "inbox",       label: "Inbox",       badge: 4 },
  { key: "announce",    label: "Announcement",badge: 1 },
  { key: "reports",     label: "Reports",     badge: 0 },
  { key: "pvp",         label: "PvP Reports", badge: 0 },
  { key: "battlefield", label: "Battlefield", badge: 0 },
  { key: "system",      label: "System",      badge: 0 },
  { key: "event",       label: "Event",       badge: 3 },
  { key: "saved",       label: "Saved",       badge: 0 },
  { key: "unread",      label: "Unread",      badge: 4 },
  { key: "purchases",   label: "Purchases",   badge: 0 },
];

const MAIL_MESSAGES = {
  inbox: [
    { from: "D@rkL0rd",      preview: "Today 3/19 is Tiered monarch boss challenge. Please turn off your auto ra...", time: "2h ago",   unread: true  },
    { from: "Alliance Mail",  preview: "Destructive attack tomorrow. Put troops in the ac!! I'll hit during my lunch time...", time: "4h ago",  unread: true  },
    { from: "Jak力",          preview: "Hallo everyone, this I Jak/Jakkals... I will sadly leave your side for now...", time: "6h ago",   unread: false },
    { from: "Alliance Mail",  preview: "K5R1N8PQ redeem code",               time: "1d ago",  unread: false },
    { from: "Alliance Mail",  preview: "SVS is upon us once again. A 3 day t... is needed!! Get them up as soon as y...", time: "1d ago",  unread: false },
    { from: "Alliance Mail",  preview: "Sorry there's no BoG tomorrow...",  time: "2d ago",  unread: false },
  ],
  announce: [
    { from: "HYPER-TEK",      preview: "Welcome to Season 2 of Overlord of the 7 Realms! New features available.", time: "1d ago",  unread: true  },
    { from: "HYPER-TEK",      preview: "Maintenance window scheduled for Friday 23:00 UTC. Expect 30 min downtime.", time: "3d ago", unread: false },
  ],
  reports: [
    { from: "Battle System",  preview: "Your fleet destroyed Monster Lvl 45 in Sector 7-Alpha. Loot: 2.3M Gold.",  time: "3h ago",  unread: true  },
    { from: "Shield System",  preview: "Shield placed over your ship. Active until 2026-03-24 18:00 UTC.",           time: "5h ago",  unread: false },
    { from: "Quest System",   preview: "Quest 'Lost Treasures' completed. Reward: 500 H-Bucks, 1x Battle Chest.",   time: "12h ago", unread: false },
  ],
  pvp: [
    { from: "Battle System",  preview: "Player SHADOW_X attacked your base. Repelled with 12% hull damage.",        time: "1h ago",  unread: true  },
    { from: "Battle System",  preview: "Your raid on COMET_7 successful. Captured 5.2M Gold.",                      time: "8h ago",  unread: false },
  ],
  battlefield: [
    { from: "War System",     preview: "Alliance War started! Sector 12 contested. Rally your fleet now.",          time: "2h ago",  unread: true  },
    { from: "War System",     preview: "SvS begins in 24h. Prepare your defenses and coordinate with alliance.",    time: "1d ago",  unread: false },
  ],
  system: [
    { from: "System",         preview: "Your shield expired. Base is now vulnerable. Reapply from the store.",      time: "30m ago", unread: true  },
    { from: "System",         preview: "Construction complete: Engine Bay upgraded to Level 8.",                    time: "4h ago",  unread: false },
    { from: "System",         preview: "Research complete: Plasma Weapons Tier 3 unlocked.",                        time: "1d ago",  unread: false },
  ],
  event: [
    { from: "Event System",   preview: "Galactic Cup starts in 3 days! Register your ship now to participate.",     time: "1h ago",  unread: true  },
    { from: "Event System",   preview: "Speed Racing Tournament: you placed #12. Reward: 1,200 H-Bucks claimed.",   time: "6h ago",  unread: true  },
    { from: "Event System",   preview: "Daily login bonus collected: 250 Gold + 1x Repair Kit.",                    time: "12h ago", unread: true  },
  ],
  saved: [
    { from: "Alliance Mail",  preview: "Important: Alliance coordinates for next SvS event. Save this!",            time: "5d ago",  unread: false },
  ],
  unread: [
    { from: "D@rkL0rd",      preview: "Today 3/19 is Tiered monarch boss challenge. Please turn off your auto ra...", time: "2h ago",  unread: true },
    { from: "Alliance Mail",  preview: "Destructive attack tomorrow. Put troops in the ac!!",                       time: "4h ago",  unread: true },
    { from: "Battle System",  preview: "Player SHADOW_X attacked your base. Repelled with 12% hull damage.",        time: "1h ago",  unread: true },
    { from: "Event System",   preview: "Galactic Cup starts in 3 days! Register your ship now.",                    time: "1h ago",  unread: true },
  ],
  purchases: [
    { from: "Store",          preview: "Purchase confirmed: Battle Pass Season 2 — $9.99. Thank you!",              time: "2d ago",  unread: false },
  ],
};

function MailPanel({ onClose }) {
  const [activeKey, setActiveKey] = useState("inbox");
  const messages = MAIL_MESSAGES[activeKey] || [];

  return (
    <div className="hud-side-panel" style={{
      position: "absolute",
      right: "calc(8.5vw + 4px)",
      top: "21vh",
      width: 360,          // wider — has two-column layout
      maxHeight: "58vh",
      zIndex: 29,
      background: "rgba(5,12,28,0.97)",
      border: "1px solid rgba(0,229,255,0.25)",
      borderRadius: "6px 0 0 6px",
      backdropFilter: "blur(16px)",
      boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 14px 8px",
        borderBottom:"1px solid rgba(0,229,255,0.15)",
        flexShrink:0,
      }}>
        <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:9,
          fontWeight:"bold", letterSpacing:"0.18em",
          color:"#00E5FF", textShadow:"0 0 8px rgba(0,229,255,0.6)" }}>MAIL</span>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:"rgba(157,216,240,0.5)", fontSize:16, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Body: category sidebar + message list */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Left: categories */}
        <div style={{
          width:105, flexShrink:0,
          borderRight:"1px solid rgba(0,229,255,0.1)",
          overflowY:"auto",
          background:"rgba(0,8,20,0.5)",
        }}>
          {MAIL_CATEGORIES.map(cat => (
            <div key={cat.key} onClick={() => setActiveKey(cat.key)} style={{
              padding:"8px 10px",
              borderBottom:"1px solid rgba(0,229,255,0.06)",
              cursor:"pointer",
              background: activeKey === cat.key ? "rgba(0,229,255,0.1)" : "transparent",
              borderLeft: activeKey === cat.key ? "2px solid #00E5FF" : "2px solid transparent",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              transition:"background 0.13s",
            }}
              onMouseEnter={e => { if(activeKey !== cat.key) e.currentTarget.style.background="rgba(0,229,255,0.05)"; }}
              onMouseLeave={e => { if(activeKey !== cat.key) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:7,
                fontWeight: activeKey === cat.key ? "bold" : "normal",
                color: activeKey === cat.key ? "#00E5FF" : "rgba(157,216,240,0.6)",
                letterSpacing:"0.06em",
              }}>{cat.label}</span>
              {cat.badge > 0 && (
                <div style={{
                  minWidth:16, height:16, borderRadius:"50%",
                  background:"#dc2626",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
                  color:"#fff", paddingTop:1,
                }}>{cat.badge}</div>
              )}
            </div>
          ))}
        </div>

        {/* Right: message list */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {messages.length === 0 ? (
            <div style={{ padding:"24px 16px", textAlign:"center",
              fontFamily:"Orbitron,sans-serif", fontSize:7,
              color:"rgba(157,216,240,0.35)", letterSpacing:"0.1em" }}>
              NO MESSAGES
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className="hud-event-row" style={{
              padding:"9px 12px",
              borderBottom:"1px solid rgba(0,229,255,0.06)",
              borderLeft: msg.unread ? "2px solid #00E5FF" : "2px solid transparent",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:7.5,
                  fontWeight: msg.unread ? "bold" : "normal",
                  color: msg.unread ? "#c7e9f7" : "rgba(157,216,240,0.6)",
                  letterSpacing:"0.06em",
                }}>{msg.from}</span>
                <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                  color:"rgba(100,140,180,0.45)", flexShrink:0, marginLeft:6 }}>
                  {msg.time}
                </span>
              </div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5,
                color:"rgba(157,216,240,0.45)",
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>{msg.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Chat panel ─────────────────────────────────────────────── */
const CHAT_TABS = ["World", "Alliance", "Private"];

const CHAT_MESSAGES = {
  World: [
    { sender: "SHADOW_X",        alliance: "VLA", text: "Behemoth King was severely damaged by our fleet and dropped massive treasures!", time: "2m ago",  type: "event"  },
    { sender: "COMET_7",         alliance: "HTK", text: "Behemoth King was severely damaged by our fleet and dropped massive treasures!", time: "3m ago",  type: "event"  },
    { sender: "StarFire",        alliance: "GRD", text: "Behemoth King severely damaged by Qquen (Sell) and dropped massive treasures!", time: "5m ago",  type: "event"  },
    { sender: "Qquen",           alliance: "VLA", text: "Behemoth King severely damaged by Qquen (Sell) and dropped massive treasures!", time: "6m ago",  type: "event"  },
    { sender: "David",           alliance: "VLA", text: "VIP on the wall 🏰", time: "18h ago", type: "player" },
    { sender: "HYPER-TEK",       alliance: "",    text: "My Liege, the City of Throne Wartime will begin in 24 hours. Let's get prepared!", time: "1d ago",  type: "system" },
    { sender: "NightOwl",        alliance: "HTK", text: "Anyone want to join the alliance rally vs Sector 9 boss?", time: "1d ago",  type: "player" },
    { sender: "ZeroGravity",     alliance: "GRD", text: "Shield up! Defending sector 4.", time: "1d ago",  type: "player" },
    { sender: "PilotZara",       alliance: "HTK", text: "Race track is open — anyone up for a lap? 🚀", time: "2d ago",  type: "player" },
    { sender: "HYPER-TEK",       alliance: "",    text: "Maintenance complete. New season rewards distributed. Check your mail!", time: "2d ago",  type: "system" },
  ],
  Alliance: [
    { sender: "Commander Rex",   alliance: "HTK", text: "Team, SvS starts tomorrow. Get your ships ready and shields up tonight.", time: "1h ago",  type: "player" },
    { sender: "Dr. Nova",        alliance: "HTK", text: "Research complete — Plasma Weapons Tier 3 now available for all members!", time: "3h ago",  type: "player" },
    { sender: "Warden-7",        alliance: "HTK", text: "Alliance Building needs 5M Steel. Anyone able to donate?", time: "5h ago",  type: "player" },
    { sender: "Pilot Zara",      alliance: "HTK", text: "Racing Tournament: I placed #3 🏆 HTK represent!", time: "8h ago",  type: "player" },
    { sender: "Oracle",          alliance: "HTK", text: "Monster Boss at coordinates 44.2 / 88.7 — rally in 30 min.", time: "12h ago", type: "player" },
    { sender: "Alliance System", alliance: "",    text: "Alliance Help request: Mechanic Kole needs 2h reduction on Engine upgrade.", time: "1d ago",  type: "system" },
  ],
  Private: [
    { sender: "SHADOW_X",        alliance: "VLA", text: "Hey, good fight earlier. Want to set up a non-aggression pact?", time: "2h ago",  type: "player" },
    { sender: "StarFire",        alliance: "GRD", text: "Can you share coordinates for the Tier-5 resource field?", time: "6h ago",  type: "player" },
    { sender: "NightOwl",        alliance: "HTK", text: "I left 3 troops at your border by accident — ignore them 😅", time: "1d ago",  type: "player" },
  ],
};

const MSG_TYPE_COLOR = {
  event:  "rgba(250,204,21,0.75)",
  system: "rgba(56,189,248,0.8)",
  player: "#c7e9f7",
};

function ChatPanel({ onClose }) {
  const [tab, setTab]       = useState("World");
  const [input, setInput]   = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const msgEndRef = React.useRef(null);

  React.useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab, messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => ({
      ...prev,
      [tab]: [...prev[tab], {
        sender: "YOU", alliance: "HTK",
        text, time: "just now", type: "player",
      }],
    }));
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const msgs = messages[tab] || [];

  return (
    <div className="hud-side-panel" style={{
      position: "absolute",
      right: "calc(8.5vw + 4px)",
      top: "21vh",
      width: 320,
      maxHeight: "58vh",
      zIndex: 29,
      background: "rgba(5,12,28,0.97)",
      border: "1px solid rgba(0,229,255,0.25)",
      borderRadius: "6px 0 0 6px",
      backdropFilter: "blur(16px)",
      boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 14px 8px",
        borderBottom:"1px solid rgba(0,229,255,0.15)",
        flexShrink:0,
      }}>
        <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:9,
          fontWeight:"bold", letterSpacing:"0.18em",
          color:"#00E5FF", textShadow:"0 0 8px rgba(0,229,255,0.6)" }}>CHAT</span>
        <button onClick={onClose} style={{ background:"none", border:"none",
          color:"rgba(157,216,240,0.5)", fontSize:16, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Tabs: World / Alliance / Private */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(0,229,255,0.1)", flexShrink:0 }}>
        {CHAT_TABS.map(t => (
          <button key={t} className="hud-panel-tab" onClick={() => setTab(t)} style={{
            flex:1, padding:"7px 4px", background:"none", border:"none",
            borderBottom: tab === t ? "2px solid #00E5FF" : "2px solid transparent",
            fontFamily:"Orbitron,sans-serif", fontSize:7.5, fontWeight:"bold",
            letterSpacing:"0.1em",
            color: tab === t ? "#00E5FF" : "rgba(157,216,240,0.45)",
            cursor:"pointer",
          }}>{t}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{
            padding:"7px 12px",
            borderBottom:"1px solid rgba(0,229,255,0.04)",
          }}>
            {/* Sender + time */}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, gap:6 }}>
              <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:7,
                fontWeight:"bold", letterSpacing:"0.06em",
                color: msg.sender === "YOU" ? "#4ade80"
                  : msg.type === "system" ? "#38bdf8"
                  : "#fbbf24",
                flexShrink:0,
              }}>
                {msg.alliance ? `[${msg.alliance}] ` : ""}{msg.sender}
              </span>
              <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6,
                color:"rgba(100,140,180,0.4)", flexShrink:0 }}>{msg.time}</span>
            </div>
            {/* Message text */}
            <div style={{
              fontFamily:"Orbitron,sans-serif", fontSize:7,
              color: MSG_TYPE_COLOR[msg.type],
              lineHeight:1.5,
              wordBreak:"break-word",
            }}>{msg.text}</div>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop:"1px solid rgba(0,229,255,0.12)",
        padding:"8px 10px",
        display:"flex", gap:6, alignItems:"flex-end",
        flexShrink:0,
        background:"rgba(0,8,20,0.6)",
      }}>
        {/* Emoji hint */}
        <span style={{ fontSize:14, cursor:"pointer", opacity:0.6, flexShrink:0, lineHeight:"28px" }}
          title="Emoji">😊</span>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type up to 500..."
          maxLength={500}
          rows={1}
          style={{
            flex:1,
            background:"rgba(0,15,35,0.9)",
            border:"1px solid rgba(0,229,255,0.25)",
            borderRadius:4,
            padding:"5px 8px",
            color:"#e2e8f0",
            fontFamily:"Orbitron,sans-serif",
            fontSize:7.5,
            outline:"none",
            resize:"none",
            lineHeight:1.5,
            maxHeight:60,
            overflow:"auto",
          }}
        />

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            padding:"5px 10px",
            background: input.trim() ? "rgba(0,212,255,0.2)" : "rgba(0,212,255,0.05)",
            border:`1px solid ${input.trim() ? "rgba(0,212,255,0.6)" : "rgba(0,212,255,0.15)"}`,
            borderRadius:4,
            cursor: input.trim() ? "pointer" : "default",
            fontFamily:"Orbitron,sans-serif", fontSize:8, fontWeight:"bold",
            color: input.trim() ? "#00D4FF" : "rgba(0,212,255,0.3)",
            letterSpacing:"0.08em",
            flexShrink:0,
            transition:"all 0.15s",
          }}
        >SEND</button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function SidebarPanel() {
  const [openPanel, setOpenPanel] = useState(null);
  const sidebarRef = useRef(null);

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
      <div style={{
        position: "absolute",
        left: "91.5vw", right: "2.5vw",
        top: "18vh",
        display: "flex", flexDirection: "column",
        gap: 4,
        zIndex: 30, padding: "0 4px",
      }}>
        <button className="hud-sidebar-btn" onClick={() => toggle("events")}
          style={{ ...BTN_BASE, ...activeStyle("events") }}>EVENTS</button>

        <button className="hud-sidebar-btn" onClick={() => toggle("items")}
          style={{ ...BTN_BASE, ...activeStyle("items") }}>ITEMS</button>

        <button className="hud-sidebar-btn" onClick={() => toggle("settings")}
          style={{ ...BTN_BASE, ...activeStyle("settings") }}>SETTINGS</button>

        <button className="hud-sidebar-btn" onClick={() => toggle("alliance")}
          style={{ ...BTN_BASE, ...activeStyle("alliance") }}>ALLIANCE</button>

        <button className="hud-sidebar-btn" onClick={() => toggle("mail")}
          style={{ ...BTN_BASE, ...activeStyle("mail") }}>MAIL</button>

        <button className="hud-sidebar-btn" onClick={() => toggle("chat")}
          style={{ ...BTN_BASE, ...activeStyle("chat") }}>CHAT</button>
      </div>

      {/* ── Panels ── */}
      {openPanel === "events"   && <EventsPanel   onClose={() => setOpenPanel(null)} />}
      {openPanel === "items"    && <ItemsPanel    onClose={() => setOpenPanel(null)} />}
      {openPanel === "settings" && <SettingsPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "alliance" && <AlliancePanel onClose={() => setOpenPanel(null)} onOpenMail={() => setOpenPanel("mail")} />}
      {openPanel === "mail"     && <MailPanel     onClose={() => setOpenPanel(null)} />}
      {openPanel === "chat"     && <ChatPanel     onClose={() => setOpenPanel(null)} />}
    </div>
  );
}
