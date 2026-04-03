/**
 * ProfileButton — avatar card top-left.
 * • Click avatar circle → open Avatar Equipment panel
 * • Click avatar image inside panel → open Character Selection panel
 * • Character selection persists to localStorage
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [windowW, setWindowW] = useState(() => window.innerWidth);
  const [windowH, setWindowH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => { setWindowW(window.innerWidth); setWindowH(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isSmall = windowW < 600; // portrait phones / very small screens

  const { token } = useSelector((s) => s.auth);
  const [profile,        setProfile]        = useState(null);
  const [open,           setOpen]           = useState(false);
  const [charSelectOpen, setCharSelectOpen] = useState(false);
  const [hoveredChar,    setHoveredChar]    = useState(null); // { speciesId, variantIdx }
  const [selectedFrame,   setSelectedFrame]   = useState("default");
  const [framePickerOpen, setFramePickerOpen] = useState(false);
  const [selectedChar,   setSelectedChar]   = useState(() => {
    try {
      const s = localStorage.getItem("hypertek_selected_char");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [speciesIdx,      setSpeciesIdx]      = useState(() => {
    try {
      const s = localStorage.getItem("hypertek_selected_char");
      const char = s ? JSON.parse(s) : null;
      if (char) {
        const idx = SPECIES.findIndex(sp => sp.id === char.speciesId);
        return idx >= 0 ? idx : 0;
      }
    } catch { /* ignore */ }
    return 0;
  });
  const [slideDir,        setSlideDir]        = useState(1);
  const carouselContainerRef = useRef(null);
  const [carouselW,       setCarouselW]       = useState(680);
  const touchStartX = useRef(null);
  const panelRef = useRef(null);
  const frameLeaveTimer = useRef(null);

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
      if (charSelectOpen) return; // char-select panel is outside panelRef — don't close
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCharSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, charSelectOpen]);

  const backendAvatarSrc = profile?.Avatar ? `${BACKEND_BASE_URL}${profile.Avatar}` : "/avatar/geodians-male.png";
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

  // Measure carousel container width when panel opens
  useEffect(() => {
    if (!charSelectOpen || !carouselContainerRef.current) return;
    const update = () => { if (carouselContainerRef.current) setCarouselW(carouselContainerRef.current.offsetWidth); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(carouselContainerRef.current);
    return () => ro.disconnect();
  }, [charSelectOpen]);

  // Keyboard ← → navigation
  useEffect(() => {
    if (!charSelectOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft")  { setSlideDir(-1); setSpeciesIdx(i => i - 1); setHoveredChar(null); }
      if (e.key === "ArrowRight") { setSlideDir(1);  setSpeciesIdx(i => i + 1); setHoveredChar(null); }
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

  const modIdx = ((speciesIdx % SPECIES.length) + SPECIES.length) % SPECIES.length;

  /* species detail shown at bottom of char-select panel —
     always tracks the currently centred carousel card, not the selected char */
  const detailSpecies = hoveredChar
    ? SPECIES.find(s => s.id === hoveredChar.speciesId)
    : SPECIES[modIdx];

  const detailVariant = hoveredChar?.variantIdx
    ?? (selectedChar?.speciesId === SPECIES[modIdx].id ? selectedChar.variantIdx : 0);

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

        {/* ── Avatar circle with sci-fi SVG frame ── */}
        {(() => {
          const frameColor = PROFILE_FRAMES.find(f => f.id === selectedFrame)?.color ?? "#00D4FF";
          // Numeric avatar diameter
          const sizeNum = isMobile ? 36 : Math.min(64, Math.max(48, windowH * 0.07));
          // PNG frame: inner transparent circle ≈ 51% of image width
          // So total frame display size = sizeNum / 0.51
          const framePx  = Math.round(sizeNum / 0.51);
          const avatarDisplaySize = Math.round(sizeNum * 1.5); // avatar larger than frame hole
          const avatarOff = Math.round((framePx - avatarDisplaySize) / 2); // center avatar inside frame
          const avatarTopOff = avatarOff + Math.round(framePx * 0.08); // shift avatar down

          // Level badge — centered pill bar at bottom of frame
          const badgeW  = Math.round(framePx * 0.52);
          const badgeH  = Math.round(framePx * 0.14);
          const badgeLeft = Math.round((framePx - badgeW) / 2);
          const badgeTop  = Math.round(framePx * 0.82);

          return (
            <div
              style={{ position: "relative", width: framePx, height: framePx, overflow: "visible", cursor: "pointer" }}
              onClick={() => setOpen(o => !o)}
            >
              {/* Avatar image — centered inside frame's transparent circle */}
              <div style={{
                position: "absolute",
                left: avatarOff, top: avatarTopOff,
                width: avatarDisplaySize, height: avatarDisplaySize,
                borderRadius: "50%", overflow: "hidden",
              }}>
                <img
                  src={displayAvatarSrc}
                  alt="Profile"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/avatar/geodians-male.png"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 5%", display: "block" }}
                />
              </div>

              {/* PNG frame overlay — sits on top of avatar, transparent center shows avatar */}
              <img
                src="/profile-frame.png"
                alt=""
                draggable={false}
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: framePx, height: framePx,
                  pointerEvents: "none", userSelect: "none",
                  filter: selectedFrame !== "default" ? `hue-rotate(${
                    selectedFrame === "plasma"   ? "180deg" :
                    selectedFrame === "overlord" ? "260deg" :
                    selectedFrame === "iron"     ? "200deg" :
                    selectedFrame === "crystal"  ? "20deg"  : "0deg"
                  }) saturate(1.2)` : "none",
                }}
              />

              {/* Level badge — centered pill bar at bottom */}
              <svg
                style={{ position: "absolute", left: badgeLeft, top: badgeTop, pointerEvents: "none" }}
                width={badgeW} height={badgeH}
                viewBox={`0 0 ${badgeW} ${badgeH}`}
              >
                <rect x="0" y="0" width={badgeW} height={badgeH} rx={badgeH / 2}
                  fill="rgba(4,10,26,0.92)" stroke={frameColor} strokeWidth="1.5" />
                <text
                  x={badgeW / 2} y={badgeH / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="Orbitron, monospace" fontSize={badgeH * 0.42} fontWeight="bold"
                  fill={frameColor} letterSpacing="1"
                >LVL 23</text>
              </svg>
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
                      onMouseEnter={() => { clearTimeout(frameLeaveTimer.current); setFramePickerOpen(true); }}
                      onMouseLeave={() => { frameLeaveTimer.current = setTimeout(() => setFramePickerOpen(false), 120); }}
                    >

                      {/* Avatar image with PNG frame overlay */}
                      <div style={{ position: "relative", width: imgW, height: imgH }}>
                        {/* Image container — clipped to card bounds */}
                        <div style={{
                          width: "100%", height: "100%",
                          background: `radial-gradient(ellipse at 50% 30%, ${frameColor}18, transparent 70%)`,
                          borderRadius: 4,
                          overflow: "hidden",
                          boxShadow: `0 0 14px ${frameColor}44`,
                        }}>
                          <img
                            src={displayAvatarSrc}
                            alt="avatar"
                            onError={(e) => { e.currentTarget.src = "/avatar/geodians-male.png"; }}
                            style={{ width: "100%", height: "170%", objectFit: "cover", objectPosition: "center 10%", display: "block", transform: "scale(1.2)", transformOrigin: "top center" }}
                          />
                        </div>
                        {/* PNG frame overlay — wrapper uses inset so right/left both work */}
                        <div style={{
                          position: "absolute",
                          top: isMobile ? -5 : -6,
                          bottom: isMobile ? -14 : -24,
                          left: isMobile ? -8 : -14,
                          right: isMobile ? -12 : -20,
                          pointerEvents: "none", userSelect: "none",
                        }}>
                          <img
                            src="/avatar-frame.png"
                            alt=""
                            draggable={false}
                            style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
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
                        <div
                          onMouseEnter={() => clearTimeout(frameLeaveTimer.current)}
                          onMouseLeave={() => { frameLeaveTimer.current = setTimeout(() => setFramePickerOpen(false), 120); }}
                          style={{
                          position: "absolute", top: 0, left: "calc(100% + 4px)",
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

        {/* char-select moved outside – see below the main div */}

      </div>

      {/* ══════════════════════════════════════════
          CHARACTER SELECTION PANEL  (outside transform div so position:fixed works correctly)
          ══════════════════════════════════════════ */}
      {charSelectOpen && (
          /* Full-screen overlay */
          <div
            onClick={() => setCharSelectOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,5,18,0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
          <div className="char-panel" onClick={e => e.stopPropagation()} style={{
            width: "min(880px, 95vw)",
            background: "rgba(4,10,26,0.98)",
            border: "1px solid rgba(0,212,255,0.28)",
            borderRadius: 16,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.92), 0 0 60px rgba(0,212,255,0.07)",
            padding: (isMobile || isSmall) ? "14px 16px" : "clamp(12px, 2.2vh, 22px) 28px",
            display: "flex",
            flexDirection: "column",
            gap: (isMobile || isSmall) ? 12 : "clamp(8px, 1.6vh, 18px)",
            maxHeight: Math.min(windowH * 0.94, 760),
            overflow: "hidden",
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 10 : 13, fontWeight: "bold",
                  letterSpacing: "0.14em", color: "#00D4FF", textShadow: "0 0 10px rgba(0,212,255,0.7)",
                }}>SELECT CHARACTER</span>
                <div style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 9,
                  color: "#7ECEEC", letterSpacing: "0.07em", marginTop: 3,
                }}>
                  {SPECIES.length} SPECIES · CHOOSE YOUR VARIANT
                </div>
              </div>

              <button onClick={() => setCharSelectOpen(false)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                fontSize: 24, cursor: "pointer", lineHeight: 1, padding: "0 4px",
              }}>×</button>
            </div>

            {/* ── Center Carousel ── */}
            {(() => {
              // CARD_H computed from actual viewport height so carousel always fits
              // panel budget: padding(~40) + header(~40) + dots(~54) + detail(~130) + gaps(~60) ≈ 324px fixed
              const panelBudget = Math.min(windowH * 0.94, 760);
              const fixedContent = 324;
              const dynamicH = Math.max(180, Math.min(panelBudget - fixedContent, 420));
              const CARD_W = (isMobile || isSmall) ? 200 : 390;
              const CARD_H = (isMobile || isSmall) ? 230 : dynamicH;
              const GAP    = (isMobile || isSmall) ? 8 : 14;
              const UNIT   = CARD_W + GAP;
              const WIN    = 2; // cards visible on each side
              const N      = SPECIES.length;

              // unbounded index — no modulo, infinite in both directions
              const goNext = () => { setSpeciesIdx(i => i + 1); setHoveredChar(null); };
              const goPrev = () => { setSpeciesIdx(i => i - 1); setHoveredChar(null); };

              // track offset is constant: center item always at WIN position
              const trackX = carouselW / 2 - WIN * UNIT - CARD_W / 2;

              // render only virtual window around current index
              const items = [];
              for (let vi = speciesIdx - WIN; vi <= speciesIdx + WIN; vi++) {
                items.push({ vi, sp: SPECIES[((vi % N) + N) % N] });
              }

              return (
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
                  {/* ◀ Prev */}
                  <button
                    onClick={goPrev}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.16)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; }}
                    style={{
                      flexShrink: 0, width: (isMobile || isSmall) ? 32 : 44, height: CARD_H,
                      background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 8, color: "#00D4FF", cursor: "pointer",
                      fontSize: (isMobile || isSmall) ? 14 : 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >◀</button>

                  {/* Carousel viewport */}
                  <div
                    ref={carouselContainerRef}
                    style={{ flex: 1, overflow: "hidden", position: "relative", height: CARD_H }}
                    onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={e => {
                      if (touchStartX.current === null) return;
                      const dx = e.changedTouches[0].clientX - touchStartX.current;
                      if (dx < -40) goNext();
                      if (dx >  40) goPrev();
                      touchStartX.current = null;
                    }}
                  >
                    {/* Static track — items slide via AnimatePresence layout */}
                    <div style={{
                      display: "flex", gap: GAP,
                      position: "absolute", left: 0, top: 0, height: "100%",
                      transform: `translateX(${trackX}px)`,
                    }}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {items.map(({ vi, sp }) => {
                          const dist       = Math.abs(vi - speciesIdx);
                          const isCenter   = dist === 0;
                          const isAdjacent = dist === 1;

                          return (
                            <motion.div
                              key={vi}
                              initial={{ opacity: 0, scale: 0.72 }}
                              animate={{
                                scale:   isCenter ? 1 : 0.84,
                                opacity: isCenter ? 1 : isAdjacent ? 0.44 : 0,
                              }}
                              exit={{ opacity: 0, scale: 0.72 }}
                              transition={{ type: "spring", stiffness: 300, damping: 36 }}
                              onClick={() => { if (!isCenter) setSpeciesIdx(vi); }}
                              onMouseEnter={() => isCenter && setHoveredChar({ speciesId: sp.id, variantIdx: 0 })}
                              onMouseLeave={() => setHoveredChar(null)}
                              style={{
                                width: CARD_W, height: "100%", flexShrink: 0,
                                borderRadius: 12,
                                border: isCenter ? "1.5px solid rgba(0,212,255,0.6)" : "1px solid rgba(0,212,255,0.15)",
                                background: isCenter
                                  ? "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.13), rgba(4,10,26,0.97))"
                                  : "rgba(4,10,26,0.85)",
                                padding: isMobile ? 7 : 10,
                                display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8,
                                boxShadow: isCenter ? "0 0 35px rgba(0,212,255,0.22), inset 0 0 18px rgba(0,212,255,0.06)" : "none",
                                cursor: isCenter ? "default" : "pointer",
                              }}
                            >
                              {/* Species name */}
                              <div style={{
                                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                                letterSpacing: "0.1em", textAlign: "center",
                                color: isCenter ? "#00D4FF" : "#7ECEEC",
                                textShadow: isCenter ? "0 0 8px rgba(0,212,255,0.5)" : "none",
                              }}>{sp.name.toUpperCase()}</div>

                              {/* Female + Male side by side */}
                              <div style={{ display: "flex", gap: isMobile ? 4 : 8, flex: 1, minHeight: 0 }}>
                                {sp.imgs.map((img, vi2) => {
                                  const gender     = sp.genders?.[vi2] ?? (vi2 === 0 ? "female" : "male");
                                  const isSelected = selectedChar?.speciesId === sp.id && selectedChar?.variantIdx === vi2;
                                  const isHov      = hoveredChar?.speciesId === sp.id && hoveredChar?.variantIdx === vi2;
                                  return (
                                    <div
                                      key={vi2}
                                      onClick={e => { e.stopPropagation(); if (isCenter) handleSelectChar(sp.id, vi2); }}
                                      onMouseEnter={() => isCenter && setHoveredChar({ speciesId: sp.id, variantIdx: vi2 })}
                                      onMouseLeave={() => isCenter && setHoveredChar(null)}
                                      style={{
                                        flex: 1, borderRadius: 8, overflow: "hidden",
                                        border: isSelected
                                          ? "1.5px solid rgba(0,212,255,0.9)"
                                          : isHov && isCenter ? "1.5px solid rgba(0,212,255,0.55)"
                                          : "1px solid rgba(0,212,255,0.14)",
                                        background: isSelected
                                          ? "radial-gradient(ellipse at 50% 10%, rgba(0,212,255,0.22), rgba(4,10,26,0.95))"
                                          : "rgba(0,0,0,0.25)",
                                        cursor: isCenter ? "pointer" : "default",
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        boxShadow: isSelected ? "0 0 18px rgba(0,212,255,0.45)" : "none",
                                        transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                                        transform: isHov && isCenter ? "translateY(-2px) scale(1.02)" : "none",
                                        position: "relative",
                                      }}
                                    >
                                      {/* Image */}
                                      <div style={{ width: "100%", flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
                                        <img
                                          src={img} alt={`${sp.name} ${gender}`} loading="lazy"
                                          onError={e => { e.currentTarget.style.opacity = "0.2"; }}
                                          style={{
                                            position: "absolute",
                                            top: gender === "female" ? "8%" : "-2%",
                                            left: 0, width: "100%", height: "160%",
                                            objectFit: "cover", objectPosition: "center top",
                                            transform: isHov && isCenter ? "scale(1.08)" : "scale(1.05)",
                                            transformOrigin: "top center", display: "block",
                                            transition: "transform 0.25s ease, top 0.25s ease",
                                          }}
                                        />
                                        <div style={{
                                          position: "absolute", top: 4, left: 4,
                                          background: gender === "female" ? "rgba(236,72,153,0.8)" : "rgba(59,130,246,0.8)",
                                          borderRadius: 3, padding: "1px 5px",
                                          fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#fff",
                                        }}>{gender === "female" ? "♀" : "♂"}</div>
                                        {isSelected && (
                                          <div style={{
                                            position: "absolute", top: 5, right: 5,
                                            width: 17, height: 17, borderRadius: "50%",
                                            background: "#00D4FF",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 10, color: "#020d1a", fontWeight: "bold",
                                            boxShadow: "0 0 8px rgba(0,212,255,0.7)",
                                          }}>✓</div>
                                        )}
                                      </div>
                                      {/* Gender label */}
                                      <div style={{
                                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold",
                                        color: gender === "female" ? "rgba(236,72,153,0.8)" : "rgba(96,165,250,0.8)",
                                        letterSpacing: "0.06em", padding: "4px 0 3px", flexShrink: 0,
                                      }}>{gender === "female" ? "♀ FEMALE" : "♂ MALE"}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ▶ Next */}
                  <button
                    onClick={goNext}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.16)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; }}
                    style={{
                      flexShrink: 0, width: (isMobile || isSmall) ? 32 : 44, height: CARD_H,
                      background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 8, color: "#00D4FF", cursor: "pointer",
                      fontSize: (isMobile || isSmall) ? 14 : 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >▶</button>
                </div>
              );
            })()}

            {/* Nav dots + species name */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 11 : 14, fontWeight: "bold",
                color: "#00D4FF", letterSpacing: "0.12em", textShadow: "0 0 12px rgba(0,212,255,0.6)",
              }}>{SPECIES[modIdx].name.toUpperCase()}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {SPECIES.map((_, i) => {
                  const isActive = i === modIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        // navigate shortest path from current unbounded index
                        const delta = i - modIdx;
                        const N = SPECIES.length;
                        const short = ((delta + Math.round(N / 2)) % N + N) % N - Math.round(N / 2);
                        setSpeciesIdx(speciesIdx + short); setHoveredChar(null);
                      }}
                      style={{
                        width: isActive ? (isMobile ? 18 : 24) : (isMobile ? 6 : 8),
                        height: isMobile ? 4 : 5, borderRadius: 3,
                        background: isActive ? "#00D4FF" : "rgba(0,212,255,0.25)",
                        border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s",
                      }}
                    />
                  );
                })}
              </div>
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
          </div>
        )}

    </>
  );
}
