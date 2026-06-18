/**
 * RacingMode — full-screen racing game overlay.
 * Two sub-views:
 *   TRACK   → animated race track + joystick + speed slider
 *   GARAGE  → spaceship hangar / workshop
 *
 * Sits at z-index 15: above GameFrame (10) but below HUD elements (25+).
 * HUD (TopBar, MiniMap, Profile, Sidebar) remains visible on top.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RacingControls  from "./RacingControls";
import LazyImage       from "./LazyImage";
import Wraith3DViewer  from "./Wraith3DViewer";
import useMobileLandscape from "../../hooks/useMobileLandscape";

/* ─── Vehicle fleet data ───────────────────────────────────────── */
const UNLOCKED_VEHICLES = [
  {
    id: "wraith",
    name: "Wraith SR-9",
    class: "Stealth Interceptor",
    bay: "BAY 03",
    img: "/vehicle2-1.webp",
    color: "#38bdf8",
    stats: {
      "Top Speed":     "1645 kt",
      "Acceleration":  "0-500kt/0.83sec",
      "Hull Strength": "Mid Range",
      "Range":         "296 km",
      "Weight":        "1184 kg",
      "Shields":       "F/R 85%",
    },
    loadout: ["MC234 Drive", "3VPDS Anti-Gravity Units", "Twin H.A.R. Stabilisers", "Dual Z314 Boosters"],
  },
  {
    id: "voidhawk",
    name: "Voidhawk ZX-1",
    class: "Long Range Striker",
    bay: "BAY 01",
    img: "/vehicle3-1.webp",
    color: "#f97316",
    stats: {
      "Top Speed":     "1798 kt",
      "Acceleration":  "0-500kt/0.77sec",
      "Hull Strength": "Mid Range",
      "Range":         "241 km",
      "Weight":        "1211 kg",
      "Shields":       "F/R 87%",
    },
    loadout: ["Twin Cove Drive", "4Zeta Anti-Gravity Units", "Twin Z1i Stabilisers", "Dual Z314 Boosters"],
  },
  {
    id: "spaceship3",
    name: "Phantom SP-3",
    class: "Shadow Striker",
    bay: "BAY 07",
    img: "/Spaceship_3.webp",
    color: "#a78bfa",
    stats: {
      "Top Speed":     "1854 kt",
      "Acceleration":  "0-500kt/0.74sec",
      "Hull Strength": "High Range",
      "Range":         "228 km",
      "Weight":        "1238 kg",
      "Shields":       "F/R 90%",
    },
    loadout: ["Phantom Drive V1", "5Zeta Anti-Gravity Units", "Tri-Axis Stabilisers", "Triple Z-Core Boosters"],
  },
  {
    id: "spaceship5",
    name: "Solar Fury SP-5",
    class: "Speed Chaser",
    bay: "BAY 11",
    img: "/Spaceship_5.webp",
    color: "#eab308",
    stats: {
      "Top Speed":     "1987 kt",
      "Acceleration":  "0-500kt/0.68sec",
      "Hull Strength": "High Range",
      "Range":         "198 km",
      "Weight":        "1290 kg",
      "Shields":       "F/R 93%",
    },
    loadout: ["Solar Pulse Drive", "6Zeta Anti-Gravity Units", "Quad-Axis Stabilisers", "Quad Z-Plasma Boosters"],
  },
  {
    id: "spaceship6",
    name: "Aether SP-6",
    class: "Hyper Runner",
    bay: "BAY 13",
    img: "/Spaceship_6.webp",
    color: "#06b6d4",
    stats: {
      "Top Speed":     "2058 kt",
      "Acceleration":  "0-500kt/0.65sec",
      "Hull Strength": "Elite",
      "Range":         "182 km",
      "Weight":        "1318 kg",
      "Shields":       "F/R 96%",
    },
    loadout: ["Aether Void Drive", "6Zeta Anti-Gravity Units", "Omni-Axis Stabilisers", "Quad Z-Plasma Boosters"],
  },
];

/* Persist the selected racer across mount/unmount (leaving + returning to racing). */
const SELECTED_VEHICLE_KEY = "racing.selectedVehicleIdx";
function loadSelectedIdx() {
  try {
    const raw = window.localStorage.getItem(SELECTED_VEHICLE_KEY);
    const idx = raw == null ? 0 : parseInt(raw, 10);
    return Number.isInteger(idx) && idx >= 0 && idx < UNLOCKED_VEHICLES.length ? idx : 0;
  } catch {
    return 0;
  }
}
function saveSelectedIdx(idx) {
  try { window.localStorage.setItem(SELECTED_VEHICLE_KEY, String(idx)); } catch { /* ignore */ }
}

const LOCKED_VEHICLES = Array.from({ length: 21 }, (_, i) => ({
  id: `locked-${i}`,
  name: [
    "Titan MK-III", "Venom VX-Zero", "Phantom RS", "Nova Blade",
    "Iron Kestrel", "Starfire X", "Dusk Runner", "Arc Fury",
    "Eclipse MK2", "Crimson Dart", "Void Reaper", "Storm Wing",
    "Apex Hunter", "Solar Fang", "Neon Ghost", "Black Comet",
    "Pulse Rider", "Thunder Rex", "Zero Shift", "Omega Strike", "Nebula One",
  ][i],
  bay: `BAY ${String(i + 8).padStart(2, "0")}`,
}));

/* ─── i18n key maps ────────────────────────────────────────────── */
const SPEC_KEY = {
  "Top Speed":     "topSpeed",
  "Acceleration":  "acceleration",
  "Hull Strength": "hullStrength",
  "Range":         "range",
  "Weight":        "weight",
  "Shields":       "shields",
  "Defence":       "defence",
  "Drag Coeff.":   "dragCoeff",
  "G-Limits":      "gLimits",
  "Speed Rating":  "speedRating",
  "Corning":       "corning",
  "Fuel Type":     "fuelType",
  "Efficiency":    "efficiency",
  "Visibility":    "visibility",
  "HUD Type":      "hudType",
  "Reaction":      "reaction",
  "Status":        "status",
  "Unlock":        "unlock",
};

const PART_KEY = {
  "HULL":         "hull",
  "AERODYNAMICS": "aerodynamics",
  "DRIVE SYSTEM": "driveSystem",
  "COCKPIT":      "cockpit",
  "WEAPONS":      "weapons",
  "BOOST CORE":   "boostCore",
};

/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  /* ── Entry animation ── */
  @keyframes racingEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .racing-overlay {
    animation: racingEnter 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── View toggle button ── */
  .race-view-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .race-view-btn:hover {
    background: rgba(34,197,94,0.2) !important;
    box-shadow: 0 0 18px rgba(34,197,94,0.5) !important;
    transform: scale(1.05);
  }

  /* ── Exit button ── */
  .race-exit-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .race-exit-btn:hover {
    background: rgba(34,197,94,0.25) !important;
    box-shadow: 0 0 18px rgba(34,197,94,0.5) !important;
    transform: scale(1.05);
  }
`;

/* ══════════════════════════════════════════════════════════════════
   TRACK VIEW — animated neon race track
   ══════════════════════════════════════════════════════════════════ */
function TrackView({ speed }) {
  const { t } = useTranslation();
  const knots = String(Math.round(speed * 2400)).padStart(4, "0");
  const speedColor = speed > 0.7 ? "#f87171" : speed > 0.4 ? "#facc15" : "#22c55e";
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
    }}>
      {/* ── Background image ── */}
      <LazyImage src="/racing1.webp" spinnerColor="#22c55e"
        style={{ objectPosition: "center" }} />

      {/* ── Dark vignette overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Speed readout HUD ── */}
      <div style={{
        position: "absolute",
        bottom: "18%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        userSelect: "none",
        background: "rgba(0,10,4,0.55)",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: 4,
        padding: "6px 18px",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(7px, 0.7vw, 9px)",
          letterSpacing: "0.25em",
          color: "rgba(34,197,94,0.55)",
          marginBottom: 2,
        }}>{t("racing.airspeed")}</div>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: "bold",
          color: speedColor,
          textShadow: `0 0 20px ${speedColor}cc`,
          lineHeight: 1,
          letterSpacing: "0.05em",
          transition: "color 0.3s, text-shadow 0.3s",
        }}>{knots}</div>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(7px, 0.7vw, 9px)",
          letterSpacing: "0.25em",
          color: "rgba(34,197,94,0.55)",
        }}>{t("racing.knots")}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VEHICLE SELECTOR POPUP
   ══════════════════════════════════════════════════════════════════ */
function VehicleSelectorPopup({ onClose, onSelect, currentIdx = 0 }) {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [vehicleIdx, setVehicleIdx] = useState(currentIdx);
  const [winH, setWinH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setWinH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // Responsive scale tiers based on viewport height
  const s = winH < 600
    ? { pad: "8px 12px",  gap: 5,  imgH: 70,  fontSize: 10, subFont: 7,  cardPad: "8px 10px",  cardGap: 6,  statFont: 6,   btnPad: "6px 0",  btnFont: 8,  dotH: 4, fleetW: 58 }
    : winH < 700
    ? { pad: "10px 14px", gap: 8,  imgH: 100, fontSize: 12, subFont: 8,  cardPad: "10px 14px", cardGap: 8,  statFont: 6.5, btnPad: "7px 0",  btnFont: 9,  dotH: 5, fleetW: 68 }
    : { pad: "22px 26px", gap: 16, imgH: 180, fontSize: 13, subFont: 9,  cardPad: "16px 20px", cardGap: 12, statFont: 7,   btnPad: "9px 0",  btnFont: 10, dotH: 5, fleetW: 78 };
  const v = UNLOCKED_VEHICLES[vehicleIdx];

  const goPrev = () => setVehicleIdx(i => (i - 1 + UNLOCKED_VEHICLES.length) % UNLOCKED_VEHICLES.length);
  const goNext = () => setVehicleIdx(i => (i + 1) % UNLOCKED_VEHICLES.length);

  return (
    /* Fullscreen overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,5,18,0.88)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(860px, 94vw)",
          maxHeight: "92vh",
          background: "rgba(4,10,26,0.98)",
          border: "1px solid rgba(34,197,94,0.28)",
          borderRadius: 14,
          backdropFilter: "blur(18px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.92), 0 0 60px rgba(34,197,94,0.07)",
          padding: s.pad,
          display: "flex", flexDirection: "column", gap: s.gap,
          overflowY: "auto",
          animation: "vehiclePanelIn 0.22s ease both",
        }}
      >
        <style>{`
          @keyframes vehiclePanelIn {
            from { opacity:0; transform: scale(0.97) translateY(-10px); }
            to   { opacity:1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{
              fontFamily: "Orbitron,sans-serif", fontSize: s.fontSize, fontWeight: "bold",
              letterSpacing: "0.14em", color: "#22c55e", textShadow: "0 0 10px rgba(34,197,94,0.7)",
            }}>{t("racing.selectVehicle")}</div>
            <div style={{
              fontFamily: "Orbitron,sans-serif", fontSize: s.subFont, color: "rgba(34,197,94,0.5)",
              letterSpacing: "0.07em", marginTop: 3,
            }}>{UNLOCKED_VEHICLES.length} {t("racing.active")} · {LOCKED_VEHICLES.length} {t("racing.locked")}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.55)",
            fontSize: 24, cursor: "pointer", lineHeight: 1,
          }}>×</button>
        </div>

        {/* ── Main: active vehicle detail + nav ── */}
        <div style={{ display: "flex", gap: isMobile ? 10 : 18, alignItems: "stretch" }}>

          {/* PREV */}
          <button onClick={goPrev} style={{
            flexShrink: 0, width: isMobile ? 28 : 38,
            background: "rgba(34,197,94,0.06)", border: `1px solid ${v.color}44`,
            borderRadius: 6, color: v.color, fontSize: isMobile ? 14 : 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.06)"}
          >◀</button>

          {/* Vehicle detail card — split 50/50: image left | details right */}
          <div style={{
            flex: 1, background: "rgba(3,12,8,0.88)",
            border: `1.5px solid ${v.color}55`,
            borderRadius: 10,
            boxShadow: `0 0 30px ${v.color}18`,
            padding: s.cardPad,
            display: "flex", flexDirection: "row", gap: 0,
            transition: "border-color 0.3s, box-shadow 0.3s",
            overflow: "hidden",
          }}>

            {/* LEFT — vehicle image (always static in selector) */}
            <div style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
              minHeight: s.imgH,
              padding: s.cardPad,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at 50% 55%, ${v.color}1a, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <img
                src={v.img}
                alt={v.name}
                style={{
                  maxHeight: "100%", maxWidth: "100%",
                  objectFit: "contain",
                  filter: `drop-shadow(0 0 18px ${v.color}88)`,
                  transition: "filter 0.3s",
                  position: "relative", zIndex: 1,
                }}
              />
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: `${v.color}22`, flexShrink: 0, alignSelf: "stretch" }} />

            {/* RIGHT — name, specs, loadout, button */}
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", gap: s.cardGap,
              padding: s.cardPad, overflowY: "auto",
            }}>
              {/* Name + class */}
              <div>
                <div style={{
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: s.fontSize + 2,
                  fontWeight: "bold", letterSpacing: "0.16em",
                  color: v.color, textShadow: `0 0 18px ${v.color}bb`,
                  transition: "color 0.3s",
                }}>{v.name}</div>
              </div>

              {/* Stats */}
              <div>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, letterSpacing: "0.18em", color: v.color, marginBottom: s.gap * 0.7, fontWeight: "bold" }}>{t("racing.basicSpec")}</div>
                {Object.entries(v.stats).map(([k, val]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: s.gap * 0.5 }}>
                    <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em" }}>{t(`racing.stats.${SPEC_KEY[k] ?? k}`, k)}</span>
                    <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont + 1, fontWeight: "bold", color: v.color }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Horizontal divider */}
              <div style={{ height: 1, background: `${v.color}22`, flexShrink: 0 }} />

              {/* Loadout */}
              <div>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, letterSpacing: "0.18em", color: v.color, marginBottom: s.gap * 0.7, fontWeight: "bold" }}>{t("racing.systemLayout")}</div>
                {v.loadout.map(item => (
                  <div key={item} style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: s.statFont,
                    color: "rgba(255,255,255,0.82)", marginBottom: s.gap * 0.5,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ color: v.color, fontSize: 8 }}>▸</span>{item}
                  </div>
                ))}
              </div>

              {/* Deploy button — pushed to bottom */}
              <button onClick={() => onSelect(vehicleIdx)} style={{
                width: "100%", padding: s.btnPad, marginTop: "auto",
                background: `linear-gradient(180deg, ${v.color}28, ${v.color}10)`,
                border: `1px solid ${v.color}99`,
                borderRadius: 4,
                fontFamily: "Orbitron,sans-serif", fontSize: s.btnFont, fontWeight: "bold",
                letterSpacing: "0.16em", color: v.color,
                textShadow: `0 0 8px ${v.color}88`,
                cursor: "pointer",
                transition: "background 0.2s",
              }}>{t("racing.deployVehicle")}</button>
            </div>
          </div>

          {/* NEXT */}
          <button onClick={goNext} style={{
            flexShrink: 0, width: isMobile ? 28 : 38,
            background: "rgba(34,197,94,0.06)", border: `1px solid ${v.color}44`,
            borderRadius: 6, color: v.color, fontSize: isMobile ? 14 : 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.06)"}
          >▶</button>
        </div>

        {/* ── Nav dots ── */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {UNLOCKED_VEHICLES.map((u, i) => (
            <button key={u.id} onClick={() => setVehicleIdx(i)} style={{
              width: i === vehicleIdx ? 24 : 8, height: s.dotH, borderRadius: 3,
              border: "none", cursor: "pointer", padding: 0,
              background: i === vehicleIdx ? v.color : "rgba(255,255,255,0.18)",
              boxShadow: i === vehicleIdx ? `0 0 8px ${v.color}` : "none",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {/* ── Locked fleet grid ── */}
        <div>
          <div style={{
            fontFamily: "Orbitron,sans-serif", fontSize: 8, letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.25)", marginBottom: 8,
          }}>🔒 {t("racing.lockedFleet")} — {LOCKED_VEHICLES.length} {t("racing.vehicles")}</div>
          <style>{`
            .fleet-scroll::-webkit-scrollbar { height: 4px; }
            .fleet-scroll::-webkit-scrollbar-track { background: rgba(34,197,94,0.05); border-radius: 2px; }
            .fleet-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.35); border-radius: 2px; }
            .fleet-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34,197,94,0.6); }
          `}</style>
          <div className="fleet-scroll" style={{
            display: "flex", flexDirection: "row", gap: 5,
            overflowX: "auto", overflowY: "hidden",
            paddingBottom: 6,
          }}>
            {LOCKED_VEHICLES.map(lv => (
              <div key={lv.id} style={{
                flexShrink: 0,
                width: s.fleetW,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 4, padding: "6px 4px",
                textAlign: "center", opacity: 0.5,
              }}>
                <div style={{ fontSize: 12, marginBottom: 3 }}>🔒</div>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 6, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{lv.name}</div>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 5.5, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{lv.bay}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Parts data (per vehicle) ────────────────────────────────── */
const LOCKED_PARTS = [
  {
    id: "weapons", label: "WEAPONS",   icon: "🔫", locked: true,
    equipped: "— LOCKED —",
    specs: { "Status": "Not Available", "Unlock": "Lvl 30 Required" },
    upgrades: ["Laser Array — 🔒", "Plasma Cannon — 🔒", "EMP Burst — 🔒"],
  },
  {
    id: "boost",   label: "BOOST CORE", icon: "🚀", locked: true,
    equipped: "— LOCKED —",
    specs: { "Status": "Not Available", "Unlock": "Complete Season 1" },
    upgrades: ["Nitro Burst — 🔒", "Gravity Sling — 🔒", "Afterburner X — 🔒"],
  },
];

const PARTS_BY_VEHICLE = {
  wraith: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Carbon Composite Mk1",
      specs: { "Weight": "887 kg", "Defence": "Front and Rear Split Shields +20%", "Drag Coeff.": "0.018Cd" },
      upgrades: ["Defence: Front and Rear Split Shields +22%", "Titanium Shell — +30% Defence 🔒", "Nano-Armor — +45% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Standard Wing Array",
      specs: { "G-Limits": "9.4G", "Speed Rating": "+5%", "Corning": "+8" },
      upgrades: ["Delta Wing Array — +12% Speed", "Swept Vortex Fins — +18% Corning 🔒", "Active Aero System — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "MC234 Drive",
      specs: { "Top Speed": "1645 kt", "Acceleration": "0-500kt/0.83sec", "Fuel Type": "Av Fuel 125", "Efficiency": "92%" },
      upgrades: ["MC237 Drive — +10%", "Vector Nozzle — +15% Turn Rate 🔒", "Quantum Drive — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Standard HUD",
      specs: { "Visibility": "220°", "HUD Type": "Basic", "Reaction": "0ms lag" },
      upgrades: ["Enhanced HUD — +30° Vision", "Neural Interface — COMING SOON 🔒", "Holo Projection — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
  voidhawk: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Carbon Composite Mk1",
      specs: { "Weight": "902 kg", "Defence": "Front and Rear Split Shields +20%", "Drag Coeff.": "0.017Cd" },
      upgrades: ["Carbon Composite Mk2 — Defence: Front and Rear Split Shields +22%", "Titanium Shell — +30% Defence 🔒", "Nano-Armor — +45% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Standard Wing Array",
      specs: { "G-Limits": "9.7G", "Speed Rating": "+6%", "Corning": "+10" },
      upgrades: ["Delta Wing Array — +12% Speed", "Swept Vortex Fins — +18% Corning 🔒", "Active Aero System — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "Twin Cove Drive",
      specs: { "Top Speed": "1798 kt", "Acceleration": "0-500kt/0.77sec", "Fuel Type": "Av Fuel 125", "Efficiency": "94%" },
      upgrades: ["Series 2 Twin Cove Drive — +12%", "Vector Nozzle — +15% Turn Rate 🔒", "Quantum Drive — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Standard HUD",
      specs: { "Visibility": "220°", "HUD Type": "Basic", "Reaction": "0ms lag" },
      upgrades: ["Enhanced HUD — +30° Vision", "Neural Interface — COMING SOON 🔒", "Holo Projection — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
  spaceship3: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Phantom Alloy Frame",
      specs: { "Weight": "924 kg", "Defence": "Split Vortex Shields +22%", "Drag Coeff.": "0.016Cd" },
      upgrades: ["Phantom Alloy Mk2 — +25% Defence", "Void Composite — +35% Defence 🔒", "Nano-Armor Mk2 — +50% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Swept Vortex Array",
      specs: { "G-Limits": "10.1G", "Speed Rating": "+7%", "Corning": "+12" },
      upgrades: ["Vortex Array Mk2 — +15% Speed", "Adaptive Aero System — +22% Corning 🔒", "Neural Aero — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "Phantom Drive V1",
      specs: { "Top Speed": "1854 kt", "Acceleration": "0-500kt/0.74sec", "Fuel Type": "Av Fuel 130", "Efficiency": "95%" },
      upgrades: ["Phantom Drive V2 — +10%", "Omni-Vector Nozzle — +18% Turn Rate 🔒", "Quantum Drive Mk2 — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Enhanced HUD",
      specs: { "Visibility": "240°", "HUD Type": "Enhanced", "Reaction": "0ms lag" },
      upgrades: ["Advanced HUD — +40° Vision", "Neural Interface — COMING SOON 🔒", "Holo Projection Mk2 — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
  spaceship4: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Apex Combat Frame",
      specs: { "Weight": "948 kg", "Defence": "Assault Shields +24%", "Drag Coeff.": "0.016Cd" },
      upgrades: ["Apex Frame Mk2 — +28% Defence", "Plasma Hull — +38% Defence 🔒", "Invictus Armor — +55% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Combat Delta Array",
      specs: { "G-Limits": "10.4G", "Speed Rating": "+8%", "Corning": "+13" },
      upgrades: ["Delta Array Mk2 — +16% Speed", "Combat Vortex Fins — +24% Corning 🔒", "Assault Aero — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "Apex Surge Drive",
      specs: { "Top Speed": "1921 kt", "Acceleration": "0-500kt/0.71sec", "Fuel Type": "Av Fuel 132", "Efficiency": "96%" },
      upgrades: ["Surge Drive Mk2 — +11%", "Precision Vector Nozzle — +20% Turn Rate 🔒", "Apex Quantum Drive — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Combat HUD",
      specs: { "Visibility": "255°", "HUD Type": "Combat", "Reaction": "0ms lag" },
      upgrades: ["Combat HUD Mk2 — +45° Vision", "Reflex Interface — COMING SOON 🔒", "Holo Combat Array — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
  spaceship5: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Solar Composite Shell",
      specs: { "Weight": "970 kg", "Defence": "Plasma Shields +26%", "Drag Coeff.": "0.015Cd" },
      upgrades: ["Solar Shell Mk2 — +30% Defence", "Fusion Hull — +42% Defence 🔒", "Solar Invictus — +58% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Solar Wing System",
      specs: { "G-Limits": "10.8G", "Speed Rating": "+9%", "Corning": "+14" },
      upgrades: ["Solar Wing Mk2 — +18% Speed", "Fusion Vortex Array — +26% Corning 🔒", "Plasma Aero — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "Solar Pulse Drive",
      specs: { "Top Speed": "1987 kt", "Acceleration": "0-500kt/0.68sec", "Fuel Type": "Solar Fuel 140", "Efficiency": "97%" },
      upgrades: ["Pulse Drive Mk2 — +12%", "Solar Vector Nozzle — +22% Turn Rate 🔒", "Fusion Quantum Drive — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Tactical HUD",
      specs: { "Visibility": "265°", "HUD Type": "Tactical", "Reaction": "0ms lag" },
      upgrades: ["Tactical HUD Mk2 — +50° Vision", "Neural Reflex Link — COMING SOON 🔒", "Holo Tactical Array — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
  spaceship6: [
    {
      id: "hull", label: "HULL", icon: "🛡", locked: false,
      equipped: "Aether Void Frame",
      specs: { "Weight": "992 kg", "Defence": "Void Shields +28%", "Drag Coeff.": "0.014Cd" },
      upgrades: ["Void Frame Mk2 — +32% Defence", "Aether Hull — +46% Defence 🔒", "Omega Armor — +62% Defence 🔒"],
    },
    {
      id: "fins", label: "AERODYNAMICS", icon: "🌬", locked: false,
      equipped: "Aether Fin Array",
      specs: { "G-Limits": "11.2G", "Speed Rating": "+11%", "Corning": "+16" },
      upgrades: ["Aether Array Mk2 — +20% Speed", "Omega Vortex System — +30% Corning 🔒", "Void Aero — COMING SOON 🔒"],
    },
    {
      id: "drive", label: "DRIVE SYSTEM", icon: "⚡", locked: false,
      equipped: "Aether Void Drive",
      specs: { "Top Speed": "2058 kt", "Acceleration": "0-500kt/0.65sec", "Fuel Type": "Void Fuel 150", "Efficiency": "99%" },
      upgrades: ["Void Drive Mk2 — +13%", "Aether Vector Nozzle — +25% Turn Rate 🔒", "Omega Quantum Drive — COMING SOON 🔒"],
    },
    {
      id: "cockpit", label: "COCKPIT", icon: "🎮", locked: false,
      equipped: "Omega HUD",
      specs: { "Visibility": "280°", "HUD Type": "Omega", "Reaction": "0ms lag" },
      upgrades: ["Omega HUD Mk2 — +60° Vision", "Full Neural Interface — COMING SOON 🔒", "Holo Omega Array — COMING SOON 🔒"],
    },
    ...LOCKED_PARTS,
  ],
};

/* ══════════════════════════════════════════════════════════════════
   GARAGE VIEW — Gran Turismo style
   ══════════════════════════════════════════════════════════════════ */
function GarageView() {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [selectorOpen,  setSelectorOpen]  = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [vehicleIdx,    setVehicleIdx]    = useState(loadSelectedIdx);
  const [selectedPart,  setSelectedPart]  = useState(null);
  const [spinning,      setSpinning]      = useState(true);
  const [winH, setWinH] = useState(() => window.innerHeight);
  useEffect(() => {
    const fn = () => setWinH(window.innerHeight);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Scale tiers — all font/spacing derived from one object
  const g = winH < 600
    ? { panelTop: "15%", panelMaxH: "78%", panelW: "clamp(260px,28vw,320px)", pad: "8px 12px", gap: 4,  hdr: 11, partIcon: 16, partLabel: 9,  partSub: 7.5, specLabel: 8,  specVal: 9,  upgLabel: 8,  sectionTitle: 8,  btnH: "8px 16px", btnFont: 9  }
    : winH < 720
    ? { panelTop: "17%", panelMaxH: "76%", panelW: "clamp(280px,26vw,340px)", pad: "10px 14px", gap: 5, hdr: 12, partIcon: 18, partLabel: 10, partSub: 8.5, specLabel: 9,  specVal: 10, upgLabel: 9,  sectionTitle: 9,  btnH: "9px 20px", btnFont: 10 }
    : { panelTop: "18%", panelMaxH: "74%", panelW: "clamp(300px,24vw,360px)", pad: "12px 16px", gap: 6, hdr: 13, partIcon: 20, partLabel: 11, partSub: 9.5, specLabel: 10, specVal: 11, upgLabel: 10, sectionTitle: 10, btnH: "11px 28px", btnFont: 11 };

  const v = UNLOCKED_VEHICLES[vehicleIdx];
  const parts = PARTS_BY_VEHICLE[v.id] ?? [];
  const part = parts.find(p => p.id === selectedPart);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <style>{`
        @keyframes vehicleSpin {
          from { transform: perspective(900px) rotateY(0deg); }
          to   { transform: perspective(900px) rotateY(360deg); }
        }
        @keyframes vehicleFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        .garage-btn { transition: background 0.18s, box-shadow 0.2s, transform 0.15s; }
        .garage-btn:hover { transform: scale(1.04); }
        .part-row { transition: background 0.15s, border-color 0.15s; cursor: pointer; }
        .part-row:hover { background: rgba(34,197,94,0.1) !important; }
      `}</style>

      {/* ── Background ── */}
      <LazyImage src="/racing-overlay.webp" spinnerColor="#22c55e"
        style={{ objectPosition: "center" }} />

      {/* ── Vehicle — 3D: large centered canvas, static: fixed container ── */}
      {(v.id === "wraith" || v.id === "voidhawk" || v.id === "spaceship3" || v.id === "spaceship5" || v.id === "spaceship6") ? (
        <div style={{
          position: "absolute",
          top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width:  isMobile ? "95vw" : "70vw",
          height: isMobile ? "70vh" : "75vh",
          zIndex: 20, pointerEvents: "auto",
        }}>
          <Wraith3DViewer vehicleId={v.id} />
        </div>
      ) : (
        <div style={{
          position: "absolute",
          top: "14%", left: "50%", transform: "translateX(-50%)",
          width:  isMobile ? 280 : 540,
          height: isMobile ? 240 : 460,
          zIndex: 20,
          display: "flex", justifyContent: "center",
        }}>
          <div style={{
            width: "100%",
            animation: spinning
              ? "vehicleSpin 10s linear infinite"
              : "vehicleFloat 4s ease-in-out infinite",
          }}>
            <img
              src={v.img} alt={v.name}
              style={{
                width: "100%", objectFit: "contain",
                filter: `drop-shadow(0 0 28px ${v.color}aa) drop-shadow(0 12px 40px rgba(0,0,0,0.7))`,
                transition: "filter 0.4s",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Vehicle name ── */}
      <div style={{
        position: "absolute", top: isMobile ? "11%" : "13%",
        left: "50%", transform: "translateX(-50%)",
        textAlign: "center", pointerEvents: "none", zIndex: 21,
      }}>
        <div style={{
          fontFamily: "Orbitron,sans-serif",
          fontSize: isMobile ? 12 : "clamp(13px,1.6vw,20px)",
          fontWeight: "bold", letterSpacing: "0.16em",
          color: v.color, textShadow: `0 0 20px ${v.color}bb`,
        }}>{v.name}</div>
      </div>

      {/* ── Spin toggle ── */}
      <button
        onClick={() => setSpinning(s => !s)}
        style={{
          position: "absolute", top: isMobile ? "11%" : "13%",
          right: "2%", zIndex: 25,
          background: "rgba(0,10,4,0.7)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 4, padding: "5px 10px",
          fontFamily: "Orbitron,sans-serif", fontSize: 7,
          color: "rgba(34,197,94,0.6)", cursor: "pointer", letterSpacing: "0.1em",
        }}
      >{spinning ? t("racing.pause") : t("racing.spin")}</button>

      {/* ── CUSTOMIZE panel — split left+right within one container ── */}
      {customizeOpen && (
        <div style={{
          position: "absolute",
          top: g.panelTop, left: 0,
          width: part && !part.locked ? `calc(${g.panelW} + clamp(200px,20vw,280px))` : g.panelW,
          maxHeight: g.panelMaxH,
          background: "rgba(2,8,4,0.96)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderLeft: "none",
          borderRadius: "0 12px 12px 0",
          backdropFilter: "blur(18px)",
          boxShadow: "8px 0 40px rgba(0,0,0,0.75)",
          zIndex: 25,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "slideInLeft 0.22s ease both",
        }}>
          <style>{`
            @keyframes slideInLeft { from { opacity:0; transform: translateX(-24px); } to { opacity:1; transform: translateX(0); } }
            @keyframes fadeInRight { from { opacity:0; transform: translateX(10px); } to { opacity:1; transform: translateX(0); } }
            .garage-scroll::-webkit-scrollbar { width: 3px; }
            .garage-scroll::-webkit-scrollbar-track { background: rgba(34,197,94,0.04); border-radius: 2px; }
            .garage-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.4); border-radius: 2px; }
            .garage-scroll::-webkit-scrollbar-thumb:hover { background: rgba(34,197,94,0.7); }
            .part-row:hover { background: rgba(34,197,94,0.1) !important; }
          `}</style>

          {/* ── Header ── */}
          <div style={{
            padding: g.pad, flexShrink: 0,
            borderBottom: "1px solid rgba(34,197,94,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(34,197,94,0.07)",
          }}>
            <div>
              <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.hdr, fontWeight: "bold", color: "#22c55e", letterSpacing: "0.14em" }}>
                <svg width={g.hdr} height={g.hdr} viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}>
                  <circle cx="8" cy="8" r="6" stroke="#22c55e" strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="2.5" fill="#22c55e"/>
                  <line x1="8" y1="2" x2="8" y2="0" stroke="#22c55e" strokeWidth="1.5"/>
                  <line x1="8" y1="16" x2="8" y2="14" stroke="#22c55e" strokeWidth="1.5"/>
                  <line x1="2" y1="8" x2="0" y2="8" stroke="#22c55e" strokeWidth="1.5"/>
                  <line x1="16" y1="8" x2="14" y2="8" stroke="#22c55e" strokeWidth="1.5"/>
                </svg>
                {t("racing.customize")}
              </div>
              <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.hdr - 3, color: v.color, marginTop: 3, letterSpacing: "0.1em" }}>{v.name}</div>
            </div>
            <button onClick={() => { setCustomizeOpen(false); setSelectedPart(null); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
          </div>

          {/* ── Body: left parts list + right detail side by side ── */}
          <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

            {/* LEFT — parts list */}
            <div className="garage-scroll" style={{
              width: g.panelW, flexShrink: 0,
              overflowY: "auto",
              padding: `${g.gap + 4}px ${g.gap + 4}px`,
              borderRight: part && !part.locked ? "1px solid rgba(34,197,94,0.18)" : "none",
            }}>
              {parts.map(p => {
                // SVG icon per part
                const icons = {
                  hull:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L15 6V12L9 16L3 12V6Z" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M9 5L12 7V11L9 13L6 11V7Z" fill="currentColor" opacity="0.25"/></svg>,
                  fins:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 14L9 4L16 14" stroke="currentColor" strokeWidth="1.4"/><path d="M5 14L9 8L13 14" stroke="currentColor" strokeWidth="1" opacity="0.5"/></svg>,
                  drive:   <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5V9L12 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/></svg>,
                  cockpit: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/><line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1"/></svg>,
                  weapons: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9H13M13 9L10 6M13 9L10 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></svg>,
                  boost:   <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3L11 8H16L12 11L13.5 16L9 13L4.5 16L6 11L2 8H7Z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
                };
                const iconColor = p.locked ? "#6b7280" : (selectedPart === p.id ? v.color : "#9ca3af");
                return (
                  <div
                    key={p.id}
                    className="part-row"
                    onClick={() => !p.locked && setSelectedPart(p.id === selectedPart ? null : p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: `${g.gap + 5}px ${g.gap + 4}px`,
                      borderRadius: 7, marginBottom: g.gap,
                      border: selectedPart === p.id ? `1.5px solid ${v.color}cc` : "1px solid rgba(255,255,255,0.07)",
                      background: selectedPart === p.id ? `${v.color}1c` : "rgba(255,255,255,0.03)",
                      opacity: p.locked ? 0.65 : 1,
                      cursor: p.locked ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ color: iconColor, flexShrink: 0, display: "flex" }}>{icons[p.id]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partLabel, fontWeight: "bold", color: p.locked ? "#d1d5db" : "#f3f4f6", letterSpacing: "0.07em" }}>{t(`racing.parts.${PART_KEY[p.label] ?? p.label.toLowerCase()}`, p.label)}</div>
                      <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partSub, color: p.locked ? "rgba(255,255,255,0.5)" : v.color, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.equipped}</div>
                    </div>
                    <span style={{ color: p.locked ? "#6b7280" : v.color, fontSize: 11, flexShrink: 0 }}>
                      {p.locked ? "🔒" : selectedPart === p.id ? "◀" : "▶"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — part detail (same height, side by side) */}
            {part && !part.locked && (
              <div className="garage-scroll" style={{
                flex: 1, overflowY: "auto",
                animation: "fadeInRight 0.2s ease both",
              }}>
                {/* Part title */}
                <div style={{ padding: g.pad, background: `${v.color}0d`, borderBottom: "1px solid rgba(34,197,94,0.12)" }}>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.hdr, fontWeight: "bold", color: v.color, letterSpacing: "0.12em" }}>{part.label}</div>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partSub, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{t("racing.equipped")} {part.equipped}</div>
                </div>

                {/* Specs */}
                <div style={{ padding: g.pad, borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.sectionTitle, letterSpacing: "0.18em", color: v.color, fontWeight: "bold", marginBottom: g.gap + 4 }}>{t("racing.specifications")}</div>
                  {Object.entries(part.specs).map(([k, val]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: g.gap + 4, padding: "0 2px" }}>
                      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.specLabel, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em", flexShrink: 0 }}>{t(`racing.stats.${SPEC_KEY[k] ?? k}`, k)}</span>
                      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.specVal, fontWeight: "bold", color: v.color, textAlign: "right" }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Upgrades */}
                <div style={{ padding: g.pad }}>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.sectionTitle, letterSpacing: "0.18em", color: v.color, fontWeight: "bold", marginBottom: g.gap + 4 }}>{t("racing.upgrades")}</div>
                  {part.upgrades.map((upg, i) => {
                    const isLocked = upg.includes("🔒") || upg.includes("COMING SOON");
                    return (
                      <div key={i} style={{
                        padding: `${g.gap + 4}px ${g.gap + 5}px`,
                        borderRadius: 6, marginBottom: g.gap + 3,
                        border: `1px solid ${isLocked ? "rgba(255,255,255,0.18)" : `${v.color}66`}`,
                        background: isLocked ? "rgba(255,255,255,0.05)" : `${v.color}10`,
                        opacity: isLocked ? 0.7 : 1,
                        cursor: isLocked ? "not-allowed" : "pointer",
                      }}>
                        <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.upgLabel, color: isLocked ? "rgba(255,255,255,0.6)" : "#f3f4f6", lineHeight: 1.55 }}>{upg}</div>
                        {!isLocked && (
                          <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.upgLabel - 1, color: "rgba(255,255,255,0.3)", marginTop: 5, letterSpacing: "0.1em", fontWeight: "bold", cursor: "not-allowed" }}>🔒 {t("racing.upgradeBtn")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RIGHT — placeholder when nothing selected */}
            {!part && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 8,
                opacity: 0, // hidden when no detail col shown
              }} />
            )}
          </div>
        </div>
      )}

      {/* ── Bottom action bar ── */}
      <div style={{
        position: "absolute",
        bottom: isMobile ? "14%" : "10%",
        left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 12, zIndex: 25, alignItems: "center",
      }}>
        {/* Choose Racer */}
        <button
          className="garage-btn"
          onClick={() => setSelectorOpen(true)}
          style={{
            padding: g.btnH,
            background: "rgba(0,12,4,0.9)",
            border: "1.5px solid rgba(34,197,94,0.5)",
            borderRadius: 3,
            clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
            fontFamily: "Orbitron,sans-serif",
            fontSize: g.btnFont, fontWeight: "bold",
            letterSpacing: "0.14em", color: "#22c55e",
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: "0 0 16px rgba(34,197,94,0.15)",
          }}
        >{t("racing.chooseRacer")}</button>

        {/* Customize toggle */}
        <button
          className="garage-btn"
          onClick={() => { setCustomizeOpen(c => !c); setSelectedPart(null); }}
          style={{
            padding: g.btnH,
            background: customizeOpen ? "rgba(34,197,94,0.18)" : "rgba(0,12,4,0.9)",
            border: `1.5px solid ${v.color}88`,
            borderRadius: 3,
            clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
            fontFamily: "Orbitron,sans-serif",
            fontSize: g.btnFont, fontWeight: "bold",
            letterSpacing: "0.14em", color: v.color,
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: `0 0 16px ${v.color}22`,
          }}
        >{customizeOpen ? t("racing.close") : t("racing.openCustomize")}</button>
      </div>

      {/* ── Selector popup ── */}
      {selectorOpen && (
        <VehicleSelectorPopup
          currentIdx={vehicleIdx}
          onClose={() => setSelectorOpen(false)}
          onSelect={(idx) => { setVehicleIdx(idx); saveSelectedIdx(idx); setSelectorOpen(false); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RacingMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function RacingMode({ view = "TRACK", onExit, isPreview = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isTrack = view === "TRACK";
  const [speed, setSpeed] = useState(0.4);

  return (
    <>
      <style>{CSS}</style>

      <div className="racing-overlay" style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        overflow: "hidden",
        background: "#060610",
      }}>

        {/* ── Background ── */}
        {isTrack ? <TrackView speed={speed} /> : <GarageView />}

        {/* ── Racing controls (track only) ── */}
        {isTrack && <RacingControls speed={speed} onSpeedChange={setSpeed} />}

        {/* ── VIDEO button — top center (track only) ── */}
        {isTrack && (
          <div style={{
            position: "absolute", top: "22%", left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
          }}>
            <button
              onClick={() => navigate(isPreview ? "/preview/racing" : "/game/racing")}
              style={{
                padding: "9px 24px",
                background: "rgba(0,20,8,0.88)",
                border: "1.5px solid rgba(34,197,94,0.6)",
                borderRadius: 3,
                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                fontFamily: "Orbitron,sans-serif",
                fontSize: "clamp(7px,0.85vw,10px)", fontWeight: "bold",
                letterSpacing: "0.18em", color: "#86efac",
                textShadow: "0 0 10px rgba(34,197,94,0.6)",
                boxShadow: "0 0 20px rgba(34,197,94,0.2)",
                cursor: "pointer", whiteSpace: "nowrap",
                transition: "background 0.2s, box-shadow 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.18)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(34,197,94,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,20,8,0.88)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.2)"; }}
            >
              ▶ {t("racing.video.gamingInfoBtn", "GAMING INFO / IN-GAMING VIDEO...")}
            </button>
          </div>
        )}

        {/* ── EXIT button — bottom-left ── */}
        <button
          className="race-exit-btn"
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: "3.5%",
            left: "2%",
            zIndex: 35,
            padding: "8px 20px",
            background: "rgba(0,20,8,0.88)",
            border: "1.5px solid rgba(34,197,94,0.55)",
            borderRadius: 3,
            clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 100%, 10px 100%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(7px, 0.7vw, 9px)",
            fontWeight: "bold",
            letterSpacing: "0.18em",
            color: "#86efac",
            textShadow: "0 0 8px rgba(34,197,94,0.7)",
            boxShadow: "0 0 16px rgba(34,197,94,0.2)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ← {t("racing.exit")} RACING
        </button>

      </div>

    </>
  );
}
