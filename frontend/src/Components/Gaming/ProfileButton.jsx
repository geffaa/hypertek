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
// imgs[0] = female, imgs[1] = male  (genders array matches imgs order)
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
    imgs: ["/avatar/lithionites-female.png", "/avatar/lithionites-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/marmulus-female.png", "/avatar/marmulus-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/ophidians-female.png", "/avatar/ophidians-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/geodians-female.png", "/avatar/geodians-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/fawnus-female.png", "/avatar/fawnus-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/mantasquads-female.png", "/avatar/mantasquads-male.png"],
    genders: ["female", "male"],
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
    imgs: ["/avatar/dryads-female.png", "/avatar/dryads-male.png"],
    genders: ["female", "male"],
  },
];

/* ── Profile frames ───────────────────────────────────────────── */
const PROFILE_FRAMES = [
  { id: "default",  name: "Standard",     bonus: "Base frame",     color: "#00D4FF", locked: false },
  { id: "iron",     name: "Iron Guard",   bonus: "+5,000 Might",   color: "#94a3b8", locked: true  },
  { id: "crystal",  name: "Cryo Crystal", bonus: "+2% Endurance",  color: "#7dd3fc", locked: true  },
  { id: "plasma",   name: "Plasma Core",  bonus: "+10,000 Might",  color: "#f97316", locked: true  },
  { id: "overlord", name: "Overlord",     bonus: "+20% All Stats", color: "#a855f7", locked: true  },
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
  .frame-opt {
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }
  .frame-opt:hover {
    transform: scale(1.08);
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
  const SIZE = isMobile ? "36px" : "clamp(48px, 7vh, 64px)";

  const { token } = useSelector((s) => s.auth);
  const [profile,        setProfile]        = useState(null);
  const [open,           setOpen]           = useState(false);
  const [charSelectOpen, setCharSelectOpen] = useState(false);
  const [hoveredChar,    setHoveredChar]    = useState(null); // { speciesId, variantIdx }
  const [selectedFrame,   setSelectedFrame]   = useState("default");
  const [framePickerOpen, setFramePickerOpen] = useState(false);
  const [genderFilter,    setGenderFilter]    = useState("all"); // "all" | "female" | "male"
  const [carouselIdx,     setCarouselIdx]     = useState(0);
  const touchStartX = useRef(null);
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

  // Reset carousel when filter changes
  useEffect(() => { setCarouselIdx(0); }, [genderFilter]);

  // Keyboard ← → navigation
  useEffect(() => {
    if (!charSelectOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft")  setCarouselIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCarouselIdx(i => i + 1); // clamped at render time
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [charSelectOpen]);

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

        {/* ── Avatar circle with sci-fi frame ── */}
        {(() => {
          const frameColor = PROFILE_FRAMES.find(f => f.id === selectedFrame)?.color ?? "#00D4FF";
          const cornerSize = isMobile ? 8 : 20;
          const cornerThick = 2;
          const cornerOff = isMobile ? -4 : -20;
          const corners = [
            { top: cornerOff, left: cornerOff,  borderTop: `${cornerThick}px solid ${frameColor}`, borderLeft:  `${cornerThick}px solid ${frameColor}` },
            { top: cornerOff, right: cornerOff, borderTop: `${cornerThick}px solid ${frameColor}`, borderRight: `${cornerThick}px solid ${frameColor}` },
            { bottom: cornerOff, left: cornerOff,  borderBottom: `${cornerThick}px solid ${frameColor}`, borderLeft:  `${cornerThick}px solid ${frameColor}` },
            { bottom: cornerOff, right: cornerOff, borderBottom: `${cornerThick}px solid ${frameColor}`, borderRight: `${cornerThick}px solid ${frameColor}` },
          ];
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
              {corners.map((c, i) => (
                <div key={i} style={{
                  position: "absolute", width: cornerSize, height: cornerSize,
                  pointerEvents: "none", zIndex: 2, ...c,
                }} />
              ))}
              <div
                className="profile-circle"
                onClick={() => setOpen(o => !o)}
                style={{
                  width: SIZE, height: SIZE, borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid ${frameColor}`,
                  boxShadow: `0 0 0 1px ${frameColor}33, 0 0 16px ${frameColor}55, 0 0 5px rgba(0,0,0,0.9)`,
                  display: "block", flexShrink: 0,
                }}
              >
                <img
                  src={displayAvatarSrc}
                  alt="Profile"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                  style={{
                    width: "250%", height: "250%",
                    objectFit: "cover", objectPosition: "center 5%",
                    marginLeft: "-45%%",
                    display: "block",
                  }}
                />
              </div>
              {/* LVL plaque */}
              <div style={{
                position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(180deg, rgba(3,12,28,0.97), rgba(2,6,18,0.99))",
                border: `1px solid ${frameColor}99`,
                borderRadius: 2,
                padding: isMobile ? "2px 6px" : "2px 8px",
                whiteSpace: "nowrap",
                boxShadow: `0 0 8px ${frameColor}44, inset 0 1px 0 ${frameColor}22`,
                fontFamily: "Orbitron,sans-serif",
                fontSize: isMobile ? 6 : 8,
                fontWeight: "bold", letterSpacing: "0.1em",
                color: frameColor,
                textShadow: `0 0 8px ${frameColor}cc`,
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <span style={{ fontSize: isMobile ? 5 : 7, opacity: 0.7 }}>▸</span>
                LVL 23
                <span style={{ fontSize: isMobile ? 5 : 7, opacity: 0.7 }}>◂</span>
              </div>
            </div>
          );
        })()}

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

              {/* Center: Name/LVL header + Avatar image in sci-fi frame */}
              {(() => {
                const frameColor = PROFILE_FRAMES.find(f => f.id === selectedFrame)?.color ?? "#00D4FF";
                const imgW = isMobile ? 68 : 100;
                const imgH = isMobile ? 98 : 148;
                return (
                  <div style={{ flex: 1, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 4 : 6 }}>

                    {/* Name + LVL */}
                    <div style={{
                      background: "rgba(3,8,20,0.88)",
                      border: `1px solid ${frameColor}44`,
                      borderRadius: 4, padding: isMobile ? "3px 8px" : "4px 12px",
                      textAlign: "center", width: "100%",
                    }}>
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                        letterSpacing: "0.12em", color: frameColor,
                        textShadow: `0 0 8px ${frameColor}88`, lineHeight: 1.3,
                      }}>{displayName}</div>
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                        letterSpacing: "0.1em", color: "rgba(255,255,255,0.75)", lineHeight: 1.3,
                      }}>LvL: 23</div>
                    </div>

                    {/* Avatar image in sci-fi frame — hover shows frame picker */}
                    <div style={{ position: "relative" }}
                      onMouseEnter={() => setFramePickerOpen(true)}
                      onMouseLeave={() => setFramePickerOpen(false)}
                    >

                      {/* Avatar image — sci-fi frame with corner brackets */}
                      <div style={{ position: "relative", width: imgW, height: imgH }}>
                        {/* Corner bracket decorations */}
                        {[
                          { top: -3, left: -3,     borderTop: `2px solid ${frameColor}`, borderLeft:  `2px solid ${frameColor}`, width: 12, height: 12 },
                          { top: -3, right: -3,    borderTop: `2px solid ${frameColor}`, borderRight: `2px solid ${frameColor}`, width: 12, height: 12 },
                          { bottom: -3, left: -3,  borderBottom: `2px solid ${frameColor}`, borderLeft:  `2px solid ${frameColor}`, width: 12, height: 12 },
                          { bottom: -3, right: -3, borderBottom: `2px solid ${frameColor}`, borderRight: `2px solid ${frameColor}`, width: 12, height: 12 },
                        ].map((c, i) => (
                          <div key={i} style={{ position: "absolute", pointerEvents: "none", zIndex: 3, ...c }} />
                        ))}
                        {/* Image container */}
                        <div style={{
                          width: "100%", height: "100%",
                          background: `radial-gradient(ellipse at 50% 30%, ${frameColor}18, transparent 70%)`,
                          border: `1px solid ${frameColor}88`,
                          borderRadius: 4,
                          overflow: "hidden",
                          boxShadow: `inset 0 0 18px rgba(0,0,0,0.6), 0 0 14px ${frameColor}44`,
                          position: "relative",
                        }}>
                          <img
                            src={displayAvatarSrc}
                            alt="avatar"
                            onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                            style={{ width: "100%", height: "170%", objectFit: "cover", objectPosition: "center 10%", display: "block", transform: "scale(1.2)", transformOrigin: "top center" }}
                          />
                        </div>
                      </div>

                      {/* CHANGE button — separate, below image */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setCharSelectOpen(o => !o); }}
                        style={{
                          width: "100%", marginTop: 6,
                          background: `linear-gradient(180deg, ${frameColor}22, ${frameColor}0d)`,
                          border: `1px solid ${frameColor}88`,
                          borderRadius: 3, padding: "4px 0",
                          fontFamily: "Orbitron,sans-serif", fontSize: 9, fontWeight: "bold",
                          letterSpacing: "0.12em", color: frameColor,
                          textShadow: `0 0 6px ${frameColor}99`,
                          cursor: "pointer",
                        }}
                      >CHANGE ▸</button>

                      {/* Frame picker overlay on hover */}
                      {framePickerOpen && (
                        <div style={{
                          position: "absolute", top: 0, left: "calc(100% + 8px)",
                          background: "rgba(3,10,24,0.97)",
                          border: "1px solid rgba(0,212,255,0.28)",
                          borderRadius: 6, padding: "8px",
                          boxShadow: "0 8px 28px rgba(0,0,0,0.75)",
                          backdropFilter: "blur(16px)",
                          zIndex: 50, width: 140,
                          display: "flex", flexDirection: "column", gap: 5,
                        }}>
                          <div style={{
                            fontFamily: "Orbitron,sans-serif", fontSize: 8, fontWeight: "bold",
                            color: "#00D4FF", letterSpacing: "0.12em", marginBottom: 3,
                          }}>PROFILE FRAME</div>
                          {PROFILE_FRAMES.map(f => (
                            <div
                              key={f.id}
                              className="frame-opt"
                              onClick={(e) => { e.stopPropagation(); if (!f.locked) setSelectedFrame(f.id); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "5px 7px", borderRadius: 4,
                                border: selectedFrame === f.id
                                  ? `1px solid ${f.color}`
                                  : "1px solid rgba(255,255,255,0.08)",
                                background: selectedFrame === f.id
                                  ? `${f.color}18`
                                  : "rgba(255,255,255,0.03)",
                                opacity: f.locked ? 0.55 : 1,
                                cursor: f.locked ? "not-allowed" : "pointer",
                              }}
                            >
                              {/* Color swatch */}
                              <div style={{
                                width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                                background: f.color,
                                boxShadow: `0 0 6px ${f.color}88`,
                                border: "1px solid rgba(255,255,255,0.2)",
                              }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontFamily: "Orbitron,sans-serif", fontSize: 8, fontWeight: "bold",
                                  color: f.locked ? "#9CA3AF" : f.color,
                                  letterSpacing: "0.06em", whiteSpace: "nowrap",
                                }}>
                                  {f.locked ? "🔒 " : ""}{f.name}
                                </div>
                                <div style={{
                                  fontFamily: "Orbitron,sans-serif", fontSize: 7,
                                  color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em",
                                }}>{f.bonus}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Might + Endurance frame */}
                    <div style={{
                      width: "100%",
                      background: "rgba(3,8,20,0.88)",
                      border: `1px solid ${frameColor}44`,
                      borderRadius: 4, padding: isMobile ? "4px 6px" : "5px 8px",
                      position: "relative",
                    }}>
                      {/* corner accents */}
                      {[
                        { top: -1, left: -1,   borderTop: `1px solid ${frameColor}`, borderLeft:   `1px solid ${frameColor}`, width: 5, height: 5 },
                        { top: -1, right: -1,  borderTop: `1px solid ${frameColor}`, borderRight:  `1px solid ${frameColor}`, width: 5, height: 5 },
                        { bottom: -1, left: -1,  borderBottom: `1px solid ${frameColor}`, borderLeft:   `1px solid ${frameColor}`, width: 5, height: 5 },
                        { bottom: -1, right: -1, borderBottom: `1px solid ${frameColor}`, borderRight:  `1px solid ${frameColor}`, width: 5, height: 5 },
                      ].map((c, i) => (
                        <div key={i} style={{ position: "absolute", pointerEvents: "none", ...c }} />
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>MIGHT</span>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#fbbf24", letterSpacing: "0.05em" }}>342,879,418</span>
                      </div>
                      <div style={{ height: 1, background: `${frameColor}22`, margin: "2px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>ENDURANCE</span>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#6ee7b7", letterSpacing: "0.05em" }}>685</span>
                      </div>
                    </div>

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
                );
              })()}

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Gender filter */}
                {[
                  { key: "all",    label: "ALL"    },
                  { key: "female", label: "♀ F"   },
                  { key: "male",   label: "♂ M"   },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setGenderFilter(key)} style={{
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: isMobile ? 7 : 9, fontWeight: "bold",
                    letterSpacing: "0.08em",
                    padding: isMobile ? "2px 6px" : "3px 9px",
                    borderRadius: 3, cursor: "pointer",
                    border: genderFilter === key
                      ? "1px solid #00D4FF"
                      : "1px solid rgba(0,212,255,0.25)",
                    background: genderFilter === key
                      ? "rgba(0,212,255,0.18)"
                      : "rgba(0,212,255,0.04)",
                    color: genderFilter === key ? "#00D4FF" : "rgba(0,212,255,0.5)",
                    transition: "all 0.15s",
                  }}>{label}</button>
                ))}

                <button onClick={() => setCharSelectOpen(false)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                  fontSize: isMobile ? 14 : 18, cursor: "pointer", lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            </div>

            {/* ── Character Carousel ── */}
            {(() => {
              const visibleCount = isMobile ? 3 : 4;
              const allItems = SPECIES.flatMap(sp =>
                sp.imgs.map((img, vi) => {
                  const gender = sp.genders?.[vi] ?? (vi === 0 ? "female" : "male");
                  return { img, vi, sp, gender };
                })
              ).filter(({ gender }) => genderFilter === "all" || gender === genderFilter);

              const maxIdx = Math.max(0, allItems.length - visibleCount);
              const safeIdx = Math.min(carouselIdx, maxIdx);
              if (safeIdx !== carouselIdx) setCarouselIdx(safeIdx);
              const visible = allItems.slice(safeIdx, safeIdx + visibleCount);

              return (
                <div style={{ display: "flex", alignItems: "stretch", gap: 6 }}>

                  {/* ◀ Prev */}
                  <button
                    onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
                    disabled={safeIdx === 0}
                    style={{
                      flexShrink: 0, width: 28, background: "rgba(0,212,255,0.07)",
                      border: "1px solid rgba(0,212,255,0.25)", borderRadius: 4,
                      color: safeIdx === 0 ? "rgba(0,212,255,0.2)" : "#00D4FF",
                      cursor: safeIdx === 0 ? "not-allowed" : "pointer",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >◀</button>

                  {/* Cards viewport */}
                  <div
                    style={{
                      flex: 1, display: "grid",
                      gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
                      gap: isMobile ? 6 : 9,
                      border: "1px solid rgba(0,212,255,0.22)",
                      borderRadius: 6, padding: isMobile ? 6 : 9,
                      background: "rgba(0,212,255,0.03)",
                      boxShadow: "inset 0 0 18px rgba(0,212,255,0.06)",
                    }}
                    onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={e => {
                      if (touchStartX.current === null) return;
                      const dx = e.changedTouches[0].clientX - touchStartX.current;
                      if (dx < -40) setCarouselIdx(i => Math.min(maxIdx, i + 1));
                      if (dx >  40) setCarouselIdx(i => Math.max(0, i - 1));
                      touchStartX.current = null;
                    }}
                  >
                    {visible.map(({ img, vi, sp, gender }) => {
                      const isSelected = selectedChar?.speciesId === sp.id && selectedChar?.variantIdx === vi;
                      const isHovered  = hoveredChar?.speciesId === sp.id && hoveredChar?.variantIdx === vi;
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
                              : isHovered
                                ? "1.5px solid rgba(0,212,255,0.55)"
                                : "1px solid rgba(0,212,255,0.18)",
                            background: isSelected
                              ? "radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.16), rgba(4,10,26,0.95))"
                              : isHovered
                                ? "radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.12), rgba(4,10,26,0.9))"
                                : "radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.05), rgba(4,10,26,0.88))",
                            boxShadow: isSelected
                              ? "0 0 18px rgba(0,212,255,0.35)"
                              : isHovered
                                ? "0 0 12px rgba(0,212,255,0.22)"
                                : "none",
                            overflow: "hidden",
                            display: "flex", flexDirection: "column", alignItems: "center",
                            paddingBottom: 6, position: "relative",
                            transform: isHovered ? "translateY(-2px) scale(1.02)" : "none",
                            transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                          }}
                        >
                          {/* Image — half body */}
                          <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                            <img
                              src={img} alt={sp.name} loading="lazy"
                              onError={(e) => { e.currentTarget.style.opacity = "0.25"; }}
                              style={{
                                width: "100%", height: "160%",
                                objectFit: "cover", objectPosition: "center top",
                                display: "block", transform: "scale(1.1)", transformOrigin: "top center",
                                filter: isHovered ? "brightness(1.15)" : "none",
                                transition: "filter 0.15s",
                              }}
                            />
                            {/* Gender badge */}
                            <div style={{
                              position: "absolute", top: 4, left: 4,
                              background: gender === "female" ? "rgba(236,72,153,0.75)" : "rgba(59,130,246,0.75)",
                              borderRadius: 2, padding: "1px 4px",
                              fontFamily: "Orbitron,sans-serif", fontSize: 7, fontWeight: "bold",
                              color: "#fff", letterSpacing: "0.05em",
                            }}>{gender === "female" ? "♀" : "♂"}</div>
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
                          <span style={{
                            fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold",
                            letterSpacing: "0.07em",
                            color: isSelected ? "#00D4FF" : isHovered ? "#fff" : "#FFFFFF",
                            textAlign: "center", marginTop: 5,
                            textShadow: isSelected ? "0 0 8px rgba(0,212,255,0.5)" : "none",
                          }}>{sp.name}</span>
                          <span style={{
                            fontFamily: "Orbitron,sans-serif", fontSize: 7,
                            color: gender === "female" ? "rgba(236,72,153,0.7)" : "rgba(96,165,250,0.7)",
                            letterSpacing: "0.06em", marginTop: 1,
                          }}>{gender === "female" ? "♀ Female" : "♂ Male"}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ▶ Next */}
                  <button
                    onClick={() => setCarouselIdx(i => Math.min(maxIdx, i + 1))}
                    disabled={safeIdx >= maxIdx}
                    style={{
                      flexShrink: 0, width: 28, background: "rgba(0,212,255,0.07)",
                      border: "1px solid rgba(0,212,255,0.25)", borderRadius: 4,
                      color: safeIdx >= maxIdx ? "rgba(0,212,255,0.2)" : "#00D4FF",
                      cursor: safeIdx >= maxIdx ? "not-allowed" : "pointer",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >▶</button>
                </div>
              );
            })()}

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
