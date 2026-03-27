/**
 * ProfileButton — avatar card top-left.
 * • Click avatar circle → open Avatar Equipment panel
 * • Click avatar image inside panel → open Character Selection panel
 * • Character selection persists to localStorage
 */

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import useMobileLandscape from "../../hooks/useMobileLandscape";

/* ── Species data ─────────────────────────────────────────────── */
const SPECIES = [
  {
    id: "lithionites", name: "Lithionites",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "Wisdom / Owl",
    height: "5–6 feet", eyes: "Pale Blue",
    skin: "Semi Crystalised Stone Structure",
    culture: "Hinduism · Pyramids · Statues",
    environment: "Caves · Mountains · Rocky Areas",
    clothing: "Tribal, Minimum",
    palette: ["#E5E7EB", "#374151", "#9CA3AF", "#D1D5DB"],
    imgs: ["/avatar/lithionites.png", "/avatar/lithionites2.png"],
  },
  {
    id: "marmulus", name: "Marmulus",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "The Sun / Moon / Stars",
    height: "6–7 feet", eyes: "Yellow",
    skin: "White/Black, gold veins, marble texture",
    culture: "Egyptian · Technology · Gods",
    environment: "Forests · Flat Plains",
    clothing: "Egyptian – Modern",
    palette: ["#FFFFFF", "#FCD34D", "#92400E", "#111827"],
    imgs: ["/avatar/marmulus.png", "/avatar/marmulus2.png"],
  },
  {
    id: "ophidians", name: "Ophidians",
    type: "Snake Hybrid",
    symbolism: "Fire",
    height: "8 feet", eyes: "Orange-Red",
    skin: "Reptile, snake-like all over",
    culture: "Aztec · Fire Worship",
    environment: "Rain Forest · Rocky Overgrown",
    clothing: "Roman – Egyptian",
    palette: ["#111827", "#7C2D12", "#B45309", "#BAE6FD"],
    imgs: ["/avatar/ophidians.png", "/avatar/ophidians2.png"],
  },
  {
    id: "geodians", name: "Geodians",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "Moon · Stars",
    height: "7–8 feet", eyes: "Light Blue / Purple",
    skin: "Infused Crystallised Structure",
    culture: "Mesopotamia · Art · Dance",
    environment: "Rocky River Plains · Thermal Caves",
    clothing: "Long, Flowing, Semi-Transparent",
    palette: ["#FFFFFF", "#111827", "#78350F", "#9CA3AF"],
    imgs: ["/avatar/geodians.png", "/avatar/geodians2.png"],
  },
  {
    id: "fawnus", name: "Fawnus",
    type: "Goat Alien Hybrid",
    symbolism: "Aztec · Music",
    height: "5.8–6 feet", eyes: "Red",
    skin: "White to Light Grey, fine hair",
    culture: "Spanish Civilisation · Music · Gold",
    environment: "Flat Dry Plains · Near Mountains",
    clothing: "Steampunk",
    palette: ["#3B1F0A", "#1D3557", "#8B3A3A", "#B8860B"],
    imgs: ["/avatar/fawnus.png", "/avatar/fawnus2.png"],
  },
  {
    id: "mantasquads", name: "Mantasquads",
    type: "4-Armed Alien Hybrid",
    symbolism: "Pagan Symbols · Death",
    height: "5.10–6.6 feet", eyes: "Orange-Red (4 eyes)",
    skin: "Skin Tone to Light Brown",
    culture: "Medieval · Monk · Satanic",
    environment: "Monasteries · Europe",
    clothing: "Monk – Assassin Creed – Medieval",
    palette: ["#0A0A0A", "#2C1A0E", "#6B2737", "#4B0082"],
    imgs: ["/avatar/mantasquads.png", "/avatar/mantasquads2.png"],
  },
  {
    id: "dryads", name: "Dryads",
    type: "Tree Alien Hybrid",
    symbolism: "Bird · Sun · Butterfly · Dragonfly",
    height: "6.6 feet", eyes: "Red / Brown / Black / Green",
    skin: "Wood Root / Leaf-Like",
    culture: "Water · Nature · Spirit · Elements",
    environment: "Woodlands · Forests · Overgrown Rocky Plains",
    clothing: "Woodlands",
    palette: ["#2D5016", "#5C3A1E", "#8B2500", "#4A7C59"],
    imgs: ["/avatar/dryads.png", "/avatar/dryads2.png"],
  },
];

/* ── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  .profile-circle {
    transition: box-shadow 0.22s, transform 0.22s;
    cursor: pointer; display: block;
  }
  .profile-circle:hover {
    transform: scale(1.06);
    box-shadow: 0 0 0 2px #00D4FF, 0 0 24px rgba(0,212,255,0.65), 0 0 6px rgba(0,0,0,0.9) !important;
  }
  .equip-slot {
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    cursor: pointer;
  }
  .equip-slot:hover {
    border-color: rgba(0,212,255,0.85) !important;
    box-shadow: 0 0 20px rgba(0,212,255,0.5), 0 0 8px rgba(0,212,255,0.3) !important;
    transform: scale(1.06);
  }
  .char-card {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    cursor: pointer;
  }
  .char-card:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 0 18px rgba(0,212,255,0.35), 0 6px 20px rgba(0,0,0,0.6) !important;
  }
  .avatar-img-btn {
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  }
  .avatar-img-btn:hover {
    transform: scale(1.04);
    box-shadow: 0 0 18px rgba(0,212,255,0.55), 0 0 36px rgba(0,212,255,0.18) !important;
  }
  @keyframes avatarPanelIn {
    from { opacity:0; transform: translateY(-10px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  .avatar-panel { animation: avatarPanelIn 0.2s ease both; }
  @keyframes charPanelIn {
    from { opacity:0; transform: translateX(-8px) scale(0.97); }
    to   { opacity:1; transform: translateX(0) scale(1); }
  }
  .char-panel { animation: charPanelIn 0.22s ease both; }
  .char-grid::-webkit-scrollbar { width: 4px; }
  .char-grid::-webkit-scrollbar-track { background: rgba(0,212,255,0.04); }
  .char-grid::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.28); border-radius: 4px; }
`;

/* ── Slot icons ───────────────────────────────────────────────── */
const SLOT_ICONS = {
  Weapon: { emoji: "⚔️", color: "#f87171" },
  Suit:   { emoji: "🥋", color: "#38bdf8" },
  Boots:  { emoji: "👢", color: "#fb923c" },
  Helmet: { emoji: "⛑️", color: "#fcd34d" },
  Gloves: { emoji: "🧤", color: "#a78bfa" },
  Flag:   { emoji: "🚩", color: "#f87171" },
  Staff:  { emoji: "🪄", color: "#c4b5fd" },
  Badge:  { emoji: "🏅", color: "#fcd34d" },
  Power:  { emoji: "⚡", color: "#38bdf8" },
};

function Slot({ label, size = 54 }) {
  const slot = SLOT_ICONS[label] || { emoji: "❓", color: "#00D4FF" };
  const iconSize = Math.round(size * 0.52);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div className="equip-slot" style={{
        width: size, height: size,
        border: `1.5px solid ${slot.color}55`, borderRadius: 6,
        background: `radial-gradient(circle at 40% 35%, ${slot.color}18, rgba(3,10,28,0.92))`,
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 10px ${slot.color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
        fontSize: iconSize, lineHeight: 1, position: "relative",
      }}>
        {slot.emoji}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 6,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: Math.round(size * 0.3),
        }}>🔒</div>
      </div>
      <span style={{
        fontFamily: "Orbitron,sans-serif", fontSize: size >= 48 ? 9 : 7, fontWeight: "bold",
        letterSpacing: "0.08em", color: slot.color, textShadow: `0 0 6px ${slot.color}66`,
      }}>{label.toUpperCase()}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function ProfileButton() {
  const isMobile = useMobileLandscape();
  const SIZE = isMobile ? "36px" : "8.5vh";

  const { token } = useSelector((s) => s.auth);
  const [profile,        setProfile]        = useState(null);
  const [open,           setOpen]           = useState(false);
  const [charSelectOpen, setCharSelectOpen] = useState(false);
  const [hoveredChar,    setHoveredChar]    = useState(null); // { speciesId, variantIdx }
  const [selectedChar,   setSelectedChar]   = useState(() => {
    try {
      const s = localStorage.getItem("hypertek_selected_char");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setProfile(res.data.user)).catch(() => {});
  }, [token]);

  /* close all panels on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCharSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const backendAvatarSrc = profile?.Avatar ? `${BACKEND_BASE_URL}${profile.Avatar}` : "/avatar.png";
  const displayAvatarSrc = selectedChar
    ? (SPECIES.find(s => s.id === selectedChar.speciesId)?.imgs[selectedChar.variantIdx] ?? backendAvatarSrc)
    : backendAvatarSrc;

  const getDisplayName = () =>
    localStorage.getItem("hypertek_display_name") ||
    (profile?.Email ? profile.Email.split("@")[0].replace(/[0-9]/g, "").toUpperCase() || "COMMANDER" : "COMMANDER");

  const [displayName, setDisplayName] = useState(getDisplayName);
  useEffect(() => { setDisplayName(getDisplayName()); }, [profile]);
  useEffect(() => {
    const handler = (e) => setDisplayName(e.detail || getDisplayName());
    window.addEventListener("hypertek_name_changed", handler);
    return () => window.removeEventListener("hypertek_name_changed", handler);
  }, []);

  const handleSelectChar = (speciesId, variantIdx) => {
    const next = { speciesId, variantIdx };
    setSelectedChar(next);
    localStorage.setItem("hypertek_selected_char", JSON.stringify(next));
    setCharSelectOpen(false);
  };

  /* species detail shown at bottom of char-select panel */
  const detailSpecies = hoveredChar
    ? SPECIES.find(s => s.id === hoveredChar.speciesId)
    : selectedChar
      ? SPECIES.find(s => s.id === selectedChar.speciesId)
      : null;

  const detailVariant = hoveredChar?.variantIdx ?? selectedChar?.variantIdx ?? 0;

  /* equipment panel width (for char panel offset) */
  const equipW = isMobile ? 240 : 320;

  return (
    <>
      <style>{CSS}</style>

      <div ref={panelRef} style={{
        position: "absolute",
        left: isMobile ? "5vw" : "6vw",
        top:  isMobile ? "4px" : "5.5vh",
        transform: isMobile ? "none" : "translate(-50%, -35%)",
        zIndex: 30,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
        pointerEvents: "auto",
      }}>

        {/* ── Avatar circle ── */}
        <img
          className="profile-circle"
          src={displayAvatarSrc}
          alt="Profile"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
          onClick={() => setOpen(o => !o)}
          style={{
            width: SIZE, height: SIZE, borderRadius: "50%",
            objectFit: "cover", objectPosition: "center 10%",
            border: "2px solid rgba(0,212,255,0.7)",
            boxShadow: "0 0 0 1px rgba(0,212,255,0.2), 0 0 16px rgba(0,212,255,0.35), 0 0 5px rgba(0,0,0,0.9)",
          }}
        />

        {/* ── Name card ── */}
        {!isMobile && (
          <div onClick={() => setOpen(o => !o)} style={{
            background: "rgba(3,8,20,0.92)",
            border: "1px solid rgba(0,212,255,0.35)",
            borderRadius: "3px", padding: "4px 10px",
            textAlign: "center", backdropFilter: "blur(10px)",
            boxShadow: "0 0 10px rgba(0,212,255,0.12)",
            minWidth: "max-content", cursor: "pointer",
          }}>
            <div style={{
              fontFamily: "Orbitron,sans-serif",
              fontSize: "clamp(8px,0.7vw,11px)", fontWeight: "bold",
              letterSpacing: "0.14em", color: "#00D4FF",
              textShadow: "0 0 8px rgba(0,212,255,0.6)", lineHeight: 1.3,
            }}>{displayName}</div>
            <div style={{
              fontFamily: "Orbitron,sans-serif",
              fontSize: "clamp(8px,0.65vw,10px)", letterSpacing: "0.1em",
              color: "#FFFFFF", lineHeight: 1.3,
            }}>HYPER-TEK PLAYER</div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            AVATAR EQUIPMENT PANEL
            ══════════════════════════════════════════ */}
        {open && (
          <div className="avatar-panel" style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            width: equipW,
            background: "rgba(4,10,26,0.97)",
            border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: 10,
            backdropFilter: "blur(18px)",
            boxShadow: "0 12px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.1)",
            padding: isMobile ? "10px 10px 10px" : "16px 14px 12px",
            zIndex: 40,
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 6 : 10 }}>
              <span style={{
                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 11, fontWeight: "bold",
                letterSpacing: "0.14em", color: "#00D4FF", textShadow: "0 0 10px rgba(0,212,255,0.7)",
              }}>AVATAR</span>
              <button onClick={() => { setOpen(false); setCharSelectOpen(false); }} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                fontSize: isMobile ? 14 : 18, cursor: "pointer", lineHeight: 1, padding: "0 2px",
              }}>×</button>
            </div>

            {/* Equipment layout */}
            <div style={{ display: "flex", gap: isMobile ? 5 : 8, alignItems: "center", justifyContent: "center" }}>

              {/* Left: Weapon / Suit / Boots */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 10, alignItems: "center" }}>
                <Slot label="Weapon" size={isMobile ? 42 : 60} />
                <Slot label="Suit"   size={isMobile ? 42 : 60} />
                <Slot label="Boots"  size={isMobile ? 42 : 60} />
              </div>

              {/* Center: Avatar image — click to open character selection */}
              <div style={{ flex: 1, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 5 : 8 }}>
                <div
                  className="avatar-img-btn"
                  onClick={() => setCharSelectOpen(o => !o)}
                  title="Click to choose character"
                  style={{
                    width: isMobile ? 68 : 100, height: isMobile ? 98 : 148,
                    background: "radial-gradient(ellipse at 50% 30%, rgba(0,212,255,0.14), transparent 70%)",
                    border: charSelectOpen
                      ? "1.5px solid rgba(0,212,255,0.75)"
                      : "1px solid rgba(0,212,255,0.28)",
                    borderRadius: 6,
                    overflow: "hidden",
                    boxShadow: charSelectOpen
                      ? "0 0 22px rgba(0,212,255,0.38)"
                      : "0 0 14px rgba(0,212,255,0.1)",
                    position: "relative",
                  }}
                >
                  <img
                    src={displayAvatarSrc}
                    alt="avatar"
                    onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                  />
                  {/* "CHANGE" hint */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
                    padding: "10px 4px 5px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: "Orbitron,sans-serif", fontSize: 9, fontWeight: "bold",
                      letterSpacing: "0.1em", color: "#00D4FF",
                      textShadow: "0 0 6px rgba(0,212,255,0.7)",
                    }}>CHANGE ▸</span>
                  </div>
                </div>

                <span style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 9, fontWeight: "bold",
                  letterSpacing: "0.1em", color: "#00D4FF",
                  textAlign: "center", textShadow: "0 0 8px rgba(0,212,255,0.5)",
                }}>{displayName}</span>

                {selectedChar && (
                  <span style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: 9,
                    letterSpacing: "0.07em", color: "#7ECEEC",
                    textAlign: "center",
                  }}>
                    {SPECIES.find(s => s.id === selectedChar.speciesId)?.name ?? ""}
                  </span>
                )}
              </div>

              {/* Right: Helmet / Gloves */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 10, alignItems: "center", justifyContent: "center" }}>
                <Slot label="Helmet" size={isMobile ? 42 : 60} />
                <Slot label="Gloves" size={isMobile ? 42 : 60} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(0,212,255,0.1)", margin: isMobile ? "6px 0" : "10px 0" }} />

            {/* Bottom row: Flag / Staff / Badge / Power */}
            <div style={{ display: "flex", justifyContent: "space-around", gap: isMobile ? 4 : 8 }}>
              {["Flag", "Staff", "Badge", "Power"].map(label => (
                <Slot key={label} label={label} size={isMobile ? 40 : 58} />
              ))}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════
            CHARACTER SELECTION PANEL
            ══════════════════════════════════════════ */}
        {open && charSelectOpen && (
          <div className="char-panel" style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            /* right of the equipment panel */
            left: isMobile ? "0" : `calc(50% + ${equipW / 2 + 10}px)`,
            width: isMobile ? 260 : 500,
            background: "rgba(4,10,26,0.97)",
            border: "1px solid rgba(0,212,255,0.28)",
            borderRadius: 10,
            backdropFilter: "blur(18px)",
            boxShadow: "0 12px 50px rgba(0,0,0,0.85), 0 0 30px rgba(0,212,255,0.08)",
            padding: isMobile ? 10 : 14,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 11, fontWeight: "bold",
                  letterSpacing: "0.14em", color: "#00D4FF", textShadow: "0 0 10px rgba(0,212,255,0.7)",
                }}>SELECT CHARACTER</span>
                <div style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 9,
                  color: "#7ECEEC", letterSpacing: "0.07em", marginTop: 2,
                }}>
                  {SPECIES.length} SPECIES · {SPECIES.length * 2} VARIANTS
                </div>
              </div>
              <button onClick={() => setCharSelectOpen(false)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                fontSize: isMobile ? 14 : 18, cursor: "pointer", lineHeight: 1, padding: "0 2px",
              }}>×</button>
            </div>

            {/* Character grid — 4 columns, scrollable */}
            <div className="char-grid" style={{
              display: "grid",
              gridTemplateColumns: `repeat(${isMobile ? 3 : 4}, 1fr)`,
              gap: isMobile ? 6 : 9,
              overflowY: "auto",
              maxHeight: isMobile ? "38vh" : "44vh",
              paddingRight: 3,
            }}>
              {SPECIES.flatMap(sp =>
                sp.imgs.map((img, vi) => {
                  const isSelected = selectedChar?.speciesId === sp.id && selectedChar?.variantIdx === vi;
                  return (
                    <div
                      key={`${sp.id}-${vi}`}
                      className="char-card"
                      onClick={() => handleSelectChar(sp.id, vi)}
                      onMouseEnter={() => setHoveredChar({ speciesId: sp.id, variantIdx: vi })}
                      onMouseLeave={() => setHoveredChar(null)}
                      style={{
                        borderRadius: 6,
                        border: isSelected
                          ? "1.5px solid rgba(0,212,255,0.85)"
                          : "1px solid rgba(0,212,255,0.18)",
                        background: isSelected
                          ? "radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.16), rgba(4,10,26,0.95))"
                          : "radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.05), rgba(4,10,26,0.88))",
                        boxShadow: isSelected ? "0 0 18px rgba(0,212,255,0.35)" : "none",
                        overflow: "hidden",
                        display: "flex", flexDirection: "column", alignItems: "center",
                        paddingBottom: 6,
                        position: "relative",
                      }}
                    >
                      {/* Character image */}
                      <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                        <img
                          src={img}
                          alt={sp.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.opacity = "0.25"; }}
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", objectPosition: "center top",
                            display: "block",
                          }}
                        />
                        {/* Coming soon overlay */}
                        {!sp.type && (
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "rgba(4,10,26,0.55)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{
                              fontFamily: "Orbitron,sans-serif", fontSize: 7, letterSpacing: "0.07em",
                              color: "rgba(0,212,255,0.45)", textAlign: "center", lineHeight: 1.5,
                            }}>COMING<br/>SOON</span>
                          </div>
                        )}
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div style={{
                            position: "absolute", top: 5, right: 5,
                            width: 15, height: 15, borderRadius: "50%",
                            background: "#00D4FF",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, color: "#020d1a", fontWeight: "bold",
                            boxShadow: "0 0 8px rgba(0,212,255,0.7)",
                          }}>✓</div>
                        )}
                      </div>

                      {/* Name + variant */}
                      <span style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 9, fontWeight: "bold",
                        letterSpacing: "0.07em",
                        color: isSelected ? "#00D4FF" : "#FFFFFF",
                        textAlign: "center", marginTop: 5,
                        textShadow: isSelected ? "0 0 8px rgba(0,212,255,0.5)" : "none",
                      }}>{sp.name}</span>
                      <span style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: 8,
                        color: "#7ECEEC", letterSpacing: "0.06em", marginTop: 1,
                      }}>V{vi + 1}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Detail strip ── */}
            {detailSpecies ? (
              <div style={{
                borderTop: "1px solid rgba(0,212,255,0.14)",
                paddingTop: 10,
                display: "flex",
                gap: 12,
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 58, height: 80, flexShrink: 0,
                  borderRadius: 5, overflow: "hidden",
                  border: "1px solid rgba(0,212,255,0.28)",
                }}>
                  <img
                    src={detailSpecies.imgs[detailVariant]}
                    alt={detailSpecies.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: 11.5, fontWeight: "bold",
                    color: "#00D4FF", textShadow: "0 0 8px rgba(0,212,255,0.6)",
                    letterSpacing: "0.1em", lineHeight: 1.2,
                  }}>{detailSpecies.name.toUpperCase()}</div>

                  {detailSpecies.type ? (
                    <>
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: 9,
                        color: "#7ECEEC", letterSpacing: "0.06em",
                      }}>{detailSpecies.type}</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: 3 }}>
                        {[
                          ["Symbolism", detailSpecies.symbolism],
                          ["Height",    detailSpecies.height],
                          ["Eyes",      detailSpecies.eyes],
                          ["Culture",   detailSpecies.culture],
                          ["Environ.",  detailSpecies.environment],
                          ["Clothing",  detailSpecies.clothing],
                        ].map(([k, v]) => (
                          <div key={k} style={{ minWidth: 0 }}>
                            <span style={{
                              fontFamily: "Orbitron,sans-serif", fontSize: 8,
                              color: "#9CA3AF", letterSpacing: "0.06em",
                            }}>{k}: </span>
                            <span style={{
                              fontFamily: "Orbitron,sans-serif", fontSize: 8.5,
                              color: "#FFFFFF",
                            }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Colour palette */}
                      {detailSpecies.palette?.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                          <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em" }}>PALETTE:</span>
                          {detailSpecies.palette.map((c, i) => (
                            <div key={i} style={{
                              width: 13, height: 13, borderRadius: 2,
                              background: c, border: "1px solid rgba(255,255,255,0.25)",
                              boxShadow: `0 0 5px ${c}88`,
                            }} />
                          ))}
                        </div>
                      )}

                      {/* Powers notice */}
                      <div style={{
                        marginTop: 4,
                        fontFamily: "Orbitron,sans-serif", fontSize: 8,
                        color: "#F87171", letterSpacing: "0.06em",
                      }}>
                        ⚠ Powers: Not available at this time due to game balancing
                      </div>
                    </>
                  ) : (
                    <div style={{
                      fontFamily: "Orbitron,sans-serif", fontSize: 9,
                      color: "#7ECEEC", marginTop: 6,
                    }}>Species details coming soon...</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                borderTop: "1px solid rgba(0,212,255,0.1)",
                paddingTop: 8, textAlign: "center",
                fontFamily: "Orbitron,sans-serif", fontSize: 9,
                color: "#7ECEEC", letterSpacing: "0.08em",
              }}>
                HOVER A CHARACTER TO SEE DETAILS
              </div>
            )}

          </div>
        )}

      </div>
    </>
  );
}
