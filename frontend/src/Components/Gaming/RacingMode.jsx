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
import RacingControls from "./RacingControls";
import LazyImage      from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";

/* ─── Vehicle fleet data ───────────────────────────────────────── */
const UNLOCKED_VEHICLES = [
  {
    id: "sebring",
    name: "Sebring X-427",
    class: "Plasma Fighter",
    bay: "BAY 05",
    img: "/vehicle1.png",
    color: "#22c55e",
    stats: {
      "TOP SPEED":    "427 kt",
      "ACCELERATION": "1.31 G",
      "KETO MASS":    "0.00 t",
      "RANGE":        "8,400 km",
      "SHIELD":       "94%",
      "HULL":         "100%",
    },
    loadout: ["Plasma Drive", "Vector Thrusters", "H.A.R. Stabilizer", "Neutrino Boost"],
  },
  {
    id: "wraith",
    name: "Wraith SR-9",
    class: "Stealth Interceptor",
    bay: "BAY 03",
    img: "/vehicle2.png",
    color: "#38bdf8",
    stats: {
      "TOP SPEED":    "612 kt",
      "ACCELERATION": "2.10 G",
      "KETO MASS":    "0.00 t",
      "RANGE":        "5,200 km",
      "SHIELD":       "71%",
      "HULL":         "87%",
    },
    loadout: ["Dark Matter Core", "Phase Cloaking", "Ion Burst", "EMP Shield"],
  },
  {
    id: "voidhawk",
    name: "Voidhawk ZX-1",
    class: "Long Range Striker",
    bay: "BAY 01",
    img: "/vehicle3.png",
    color: "#f97316",
    stats: {
      "TOP SPEED":    "510 kt",
      "ACCELERATION": "1.75 G",
      "KETO MASS":    "1.20 t",
      "RANGE":        "11,000 km",
      "SHIELD":       "83%",
      "HULL":         "92%",
    },
    loadout: ["Void Engine Mk2", "Railgun Array", "Stealth Coating", "Surge Capacitor"],
  },
];

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
  const knots = String(Math.round(speed * 2400)).padStart(4, "0");
  const speedColor = speed > 0.7 ? "#f87171" : speed > 0.4 ? "#facc15" : "#22c55e";
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
    }}>
      {/* ── Background image ── */}
      <LazyImage src="/racing1.png" spinnerColor="#22c55e"
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
        }}>AIRSPEED</div>
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
        }}>KNOTS</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VEHICLE SELECTOR POPUP
   ══════════════════════════════════════════════════════════════════ */
function VehicleSelectorPopup({ onClose, onSelect }) {
  const isMobile = useMobileLandscape();
  const [vehicleIdx, setVehicleIdx] = useState(0);
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
            }}>SELECT VEHICLE</div>
            <div style={{
              fontFamily: "Orbitron,sans-serif", fontSize: s.subFont, color: "rgba(34,197,94,0.5)",
              letterSpacing: "0.07em", marginTop: 3,
            }}>{UNLOCKED_VEHICLES.length} ACTIVE · {LOCKED_VEHICLES.length} LOCKED</div>
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

          {/* Vehicle detail card */}
          <div style={{
            flex: 1, background: "rgba(3,12,8,0.88)",
            border: `1.5px solid ${v.color}55`,
            borderRadius: 10,
            boxShadow: `0 0 30px ${v.color}18`,
            padding: s.cardPad,
            display: "flex", flexDirection: "column", gap: s.cardGap,
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}>
            {/* Name + class */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "Orbitron,sans-serif",
                fontSize: s.fontSize + 2,
                fontWeight: "bold", letterSpacing: "0.16em",
                color: v.color, textShadow: `0 0 18px ${v.color}bb`,
                transition: "color 0.3s",
              }}>{v.name}</div>
              <div style={{
                fontFamily: "Orbitron,sans-serif", fontSize: 9,
                color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em", marginTop: 4,
              }}>{v.class} · {v.bay}</div>
            </div>

            {/* Vehicle image */}
            <div style={{
              width: "100%", height: s.imgH,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at 50% 60%, ${v.color}18, transparent 70%)`,
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
                }}
              />
            </div>

            {/* Stats + loadout row */}
            <div style={{ display: "flex", gap: 14 }}>

              {/* Stats */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, letterSpacing: "0.18em", color: "rgba(34,197,94,0.45)", marginBottom: s.gap * 0.7 }}>SPECIFICATIONS</div>
                {Object.entries(v.stats).map(([k, val]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: s.gap * 0.5 }}>
                    <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em" }}>{k}</span>
                    <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont + 1, fontWeight: "bold", color: v.color }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ width: 1, background: "rgba(34,197,94,0.12)", flexShrink: 0 }} />

              {/* Loadout */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: s.statFont, letterSpacing: "0.18em", color: "rgba(34,197,94,0.45)", marginBottom: s.gap * 0.7 }}>LOADOUT</div>
                {v.loadout.map(item => (
                  <div key={item} style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: s.statFont,
                    color: "rgba(255,255,255,0.65)", marginBottom: s.gap * 0.5,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ color: v.color, fontSize: 8 }}>▸</span>{item}
                  </div>
                ))}
              </div>
            </div>

            {/* SELECT button */}
            <button onClick={() => onSelect(vehicleIdx)} style={{
              width: "100%", padding: s.btnPad,
              background: `linear-gradient(180deg, ${v.color}28, ${v.color}10)`,
              border: `1px solid ${v.color}99`,
              borderRadius: 4,
              fontFamily: "Orbitron,sans-serif", fontSize: s.btnFont, fontWeight: "bold",
              letterSpacing: "0.16em", color: v.color,
              textShadow: `0 0 8px ${v.color}88`,
              cursor: "pointer",
              transition: "background 0.2s",
            }}>DEPLOY VEHICLE ▸</button>
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
          }}>🔒 LOCKED FLEET — {LOCKED_VEHICLES.length} VEHICLES</div>
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

/* ─── Parts data ──────────────────────────────────────────────── */
const PARTS = [
  {
    id: "hull",    label: "HULL",         icon: "🛡",  locked: false,
    equipped: "Carbon Composite Mk1",
    specs: { "Weight": "420 kg", "Defense": "+18%", "Drag Coeff.": "0.28" },
    upgrades: ["Carbon Composite Mk2 — +12% Defense", "Titanium Shell — +30% Defense 🔒", "Nano-Armor — +45% Defense 🔒"],
  },
  {
    id: "fins",    label: "AERODYNAMICS", icon: "🌬",  locked: false,
    equipped: "Standard Wing Array",
    specs: { "Downforce": "320 N", "Top Speed": "+5%", "Cornering": "+8%" },
    upgrades: ["Delta Wing Array — +12% Speed", "Swept Vortex Fins — +18% Cornering 🔒", "Active Aero System — COMING SOON 🔒"],
  },
  {
    id: "drive",   label: "DRIVE SYSTEM", icon: "⚡",  locked: false,
    equipped: "Plasma Drive Mk1",
    specs: { "Thrust": "1.31 G", "Top Speed": "427 kt", "Efficiency": "88%" },
    upgrades: ["Plasma Drive Mk2 — +0.4G Thrust", "Vector Nozzle — +15% Turn Rate 🔒", "Quantum Drive — COMING SOON 🔒"],
  },
  {
    id: "cockpit", label: "COCKPIT",      icon: "🎮",  locked: false,
    equipped: "Standard HUD",
    specs: { "Visibility": "220°", "HUD Type": "Basic", "Reaction": "0ms lag" },
    upgrades: ["Enhanced HUD — +30° Vision", "Neural Interface — COMING SOON 🔒", "Holo Projection — COMING SOON 🔒"],
  },
  {
    id: "weapons", label: "WEAPONS",      icon: "🔫",  locked: true,
    equipped: "— LOCKED —",
    specs: { "Status": "Not Available", "Unlock": "Lvl 30 Required" },
    upgrades: ["Laser Array — 🔒", "Plasma Cannon — 🔒", "EMP Burst — 🔒"],
  },
  {
    id: "boost",   label: "BOOST CORE",   icon: "🚀",  locked: true,
    equipped: "— LOCKED —",
    specs: { "Status": "Not Available", "Unlock": "Complete Season 1" },
    upgrades: ["Nitro Burst — 🔒", "Gravity Sling — 🔒", "Afterburner X — 🔒"],
  },
];

/* ══════════════════════════════════════════════════════════════════
   GARAGE VIEW — Gran Turismo style
   ══════════════════════════════════════════════════════════════════ */
function GarageView() {
  const isMobile = useMobileLandscape();
  const [selectorOpen,  setSelectorOpen]  = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [vehicleIdx,    setVehicleIdx]    = useState(0);
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
  const part = PARTS.find(p => p.id === selectedPart);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
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
      <LazyImage src="/racing-overlay.png" spinnerColor="#22c55e"
        style={{ objectPosition: "center" }} />

      {/* ── Vehicle — center stage ── */}
      {/* Outer: positions to center; Inner: handles animation without breaking centering */}
      <div style={{
        position: "absolute",
        top: "22%", left: "50%", transform: "translateX(-50%)",
        width: isMobile ? 220 : 420,
        zIndex: 20,
        display: "flex", justifyContent: "center",
      }}>
        <div
          onClick={() => setCustomizeOpen(c => !c)}
          style={{
            width: "100%", cursor: "pointer",
            animation: spinning
              ? "vehicleSpin 10s linear infinite"
              : "vehicleFloat 4s ease-in-out infinite",
          }}
          title="Click to customize"
        >
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

      {/* ── Vehicle name + hint ── */}
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
        <div style={{
          fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8,
          letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginTop: 3,
        }}>{v.class} · {v.bay}</div>
        {!customizeOpen && (
          <div style={{
            fontFamily: "Orbitron,sans-serif", fontSize: 7,
            color: "rgba(34,197,94,0.5)", letterSpacing: "0.1em", marginTop: 6,
            animation: "vehicleFloat 2s ease-in-out infinite",
          }}>▼ CLICK TO CUSTOMIZE</div>
        )}
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
      >{spinning ? "⏸ PAUSE" : "▶ SPIN"}</button>

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
                CUSTOMIZE
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
              {PARTS.map(p => {
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
                      opacity: p.locked ? 0.38 : 1,
                      cursor: p.locked ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ color: iconColor, flexShrink: 0, display: "flex" }}>{icons[p.id]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partLabel, fontWeight: "bold", color: p.locked ? "#9ca3af" : "#f3f4f6", letterSpacing: "0.07em" }}>{p.label}</div>
                      <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partSub, color: p.locked ? "rgba(255,255,255,0.22)" : v.color, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.equipped}</div>
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
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.partSub, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>EQUIPPED: {part.equipped}</div>
                </div>

                {/* Specs */}
                <div style={{ padding: g.pad, borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.sectionTitle, letterSpacing: "0.18em", color: "rgba(34,197,94,0.6)", marginBottom: g.gap + 4 }}>SPECIFICATIONS</div>
                  {Object.entries(part.specs).map(([k, val]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: g.gap + 4, padding: "0 2px" }}>
                      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.specLabel, color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>{k}</span>
                      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.specVal, fontWeight: "bold", color: v.color }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Upgrades */}
                <div style={{ padding: g.pad }}>
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.sectionTitle, letterSpacing: "0.18em", color: "rgba(34,197,94,0.6)", marginBottom: g.gap + 4 }}>UPGRADES</div>
                  {part.upgrades.map((upg, i) => {
                    const isLocked = upg.includes("🔒") || upg.includes("COMING SOON");
                    return (
                      <div key={i} style={{
                        padding: `${g.gap + 4}px ${g.gap + 5}px`,
                        borderRadius: 6, marginBottom: g.gap + 3,
                        border: `1px solid ${isLocked ? "rgba(255,255,255,0.08)" : `${v.color}66`}`,
                        background: isLocked ? "rgba(255,255,255,0.02)" : `${v.color}10`,
                        opacity: isLocked ? 0.4 : 1,
                        cursor: isLocked ? "not-allowed" : "pointer",
                      }}>
                        <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.upgLabel, color: isLocked ? "rgba(255,255,255,0.3)" : "#f3f4f6", lineHeight: 1.55 }}>{upg}</div>
                        {!isLocked && (
                          <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: g.upgLabel - 1, color: v.color, marginTop: 5, letterSpacing: "0.1em", fontWeight: "bold" }}>▸ UPGRADE</div>
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
        >CHOOSE RACER</button>

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
        >{customizeOpen ? "✕ CLOSE" : "⚙ CUSTOMIZE"}</button>
      </div>

      {/* ── Selector popup ── */}
      {selectorOpen && (
        <VehicleSelectorPopup
          onClose={() => setSelectorOpen(false)}
          onSelect={(idx) => { setVehicleIdx(idx); setSelectorOpen(false); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RacingMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function RacingMode({ view = "TRACK", onExit }) {
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
          ← EXIT RACING
        </button>

      </div>
    </>
  );
}
