/**
 * QuestMode — full-screen Quest game overlay.
 * Two sub-views:
 *   SPACE  → spaceship view + 2D movement joystick
 *   GROUND → planet surface + 2D joystick + action buttons (Fire/Scope/Kneel/Weapon)
 *
 * z-index 15: above GameFrame (10), below HUD elements (25+).
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";


/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @keyframes questEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .quest-overlay { animation: questEnter 0.55s cubic-bezier(0.16,1,0.3,1) both; }

  @keyframes starsTwinkle {
    0%,100% { opacity: 0.6; }
    50%      { opacity: 1; }
  }

  @keyframes nebulaFloat {
    0%,100% { transform: translateY(0px) scale(1); }
    50%      { transform: translateY(-8px) scale(1.02); }
  }
  .nebula { animation: nebulaFloat 8s ease-in-out infinite; }

  @keyframes shipHover {
    0%,100% { transform: translateX(-50%) translateY(0px); }
    50%      { transform: translateX(-50%) translateY(-6px); }
  }
  .quest-ship { animation: shipHover 4s ease-in-out infinite; }

  .quest-action-btn {
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .quest-action-btn:hover {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
  .quest-action-btn:active {
    transform: scale(0.93);
    filter: brightness(1.6);
  }

  .quest-exit-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .quest-exit-btn:hover {
    background: rgba(56,189,248,0.2) !important;
    box-shadow: 0 0 18px rgba(56,189,248,0.5) !important;
    transform: scale(1.05);
  }
`;

/* ══════════════════════════════════════════════════════════════════
   2D JOYSTICK — drag in any direction
   ══════════════════════════════════════════════════════════════════ */
function Joystick2D({ accentColor = "#38bdf8" }) {
  const { t } = useTranslation();
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const padRef = useRef(null);
  const RADIUS = 44;  // max travel radius

  useEffect(() => {
    if (!dragging && (pos.x !== 0 || pos.y !== 0)) {
      const timer = setTimeout(() => setPos({ x: 0, y: 0 }), 220);
      return () => clearTimeout(timer);
    }
  }, [dragging, pos]);

  const clamp = (cx, cy) => {
    const dist = Math.sqrt(cx * cx + cy * cy);
    if (dist > RADIUS) {
      const scale = RADIUS / dist;
      return { x: cx * scale, y: cy * scale };
    }
    return { x: cx, y: cy };
  };

  const startDrag = useCallback((clientX, clientY) => {
    setDragging(true);
    const rect = padRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    const onMove = (e) => {
      const mx = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
      const my = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
      setPos(clamp(mx, my));
    };
    const onEnd = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);

    const mx = clientX - (rect.left + rect.width  / 2);
    const my = clientY - (rect.top  + rect.height / 2);
    setPos(clamp(mx, my));
  }, []);

  const PAD = 110;
  const KNOB = 22;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      userSelect: "none",
      filter: `drop-shadow(0 0 10px ${accentColor}33)`,
    }}>
      {/* Pad */}
      <div
        ref={padRef}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        style={{
          position: "relative",
          width: PAD, height: PAD,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,20,40,0.9), rgba(0,8,20,0.97))`,
          border: `1.5px solid ${accentColor}55`,
          boxShadow: `0 0 20px ${accentColor}18, inset 0 2px 8px rgba(0,0,0,0.6)`,
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        {/* Crosshair lines */}
        <div style={{ position:"absolute", top:"50%", left:"12%", right:"12%", height:1, background:`${accentColor}22`, transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", left:"50%", top:"12%", bottom:"12%", width:1, background:`${accentColor}22`, transform:"translateX(-50%)" }} />
        {/* Outer ring tick */}
        <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:`1px solid ${accentColor}18` }} />

        {/* Knob */}
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: KNOB * 2, height: KNOB * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${accentColor}cc, ${accentColor}88)`,
          border: `2px solid ${accentColor}cc`,
          boxShadow: `0 0 14px ${accentColor}99, 0 2px 6px rgba(0,0,0,0.5)`,
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          transition: dragging ? "none" : "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Arrow hints */}
      <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"Orbitron,sans-serif", fontSize:10, color:accentColor, opacity:0.55 }}>
        <span>◀</span>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <span style={{ fontSize:9 }}>▲</span>
          <span style={{ fontSize:6, letterSpacing:"0.15em", fontWeight:"bold" }}>{t("quest.move")}</span>
          <span style={{ fontSize:9 }}>▼</span>
        </div>
        <span>▶</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ACTION BUTTONS — right side (Ground mode)
   ══════════════════════════════════════════════════════════════════ */
const ACTIONS = [
  {
    id: "SCOPE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.9"/>
        <line x1="16" y1="2"  x2="16" y2="30" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.85"/>
        <line x1="2"  y1="16" x2="30" y2="16" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.85"/>
      </svg>
    ),
    color: "#38bdf8", glow: "rgba(56,189,248,0.5)",
  },
  {
    id: "FIRE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" fill="rgba(248,113,113,0.15)" stroke="#f87171" strokeWidth="1.8" strokeOpacity="0.9"/>
        <circle cx="16" cy="16" r="6"  fill="#f87171" fillOpacity="0.85"/>
      </svg>
    ),
    color: "#f87171", glow: "rgba(248,113,113,0.5)",
  },
  {
    id: "KNEEL",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="7" r="4.5" fill="#a78bfa" fillOpacity="0.8"/>
        <path d="M13 13 Q11 19 9 26 M19 13 Q21 19 23 26 M9 26 Q16 29 23 26" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9"/>
        <path d="M13 13 L19 13 Q19 18 16 20 Q13 18 13 13Z" fill="#a78bfa" fillOpacity="0.5" stroke="#a78bfa" strokeWidth="1.2"/>
      </svg>
    ),
    color: "#a78bfa", glow: "rgba(167,139,250,0.5)",
  },
  {
    id: "WEAPON",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <rect x="3"  y="12" width="20" height="8" rx="2" fill="#1e293b" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.9"/>
        <rect x="23" y="14" width="7"  height="4" rx="1" fill="#facc15" fillOpacity="0.7"/>
        <rect x="9"  y="9"  width="6"  height="3" rx="1" fill="#facc15" fillOpacity="0.6"/>
        <circle cx="7" cy="16" r="2.5" fill="#facc15" fillOpacity="0.5"/>
      </svg>
    ),
    color: "#facc15", glow: "rgba(250,204,21,0.5)",
  },
];

/*
 * Layout (matches Don's reference):
 *
 *   [      ] [ Fire  ]
 *   [ Kneel] [ Scope ]
 *   [Weapon] [       ]
 *
 * Positioned bottom-right, above the VIEW button,
 * below the sidebar buttons so they don't interfere.
 *
 * pos: { top, left } — px offset inside a 160×180 container
 */
const BTN_SIZE = 82;
// Quarter-circle arc: R=42vh, center at bottom-right corner, spanning 105°→165°
// Each button sits on the same circle radius, creating a true arc curve
const ARC_3 = [
  { id: "FIRE",   right: "17vh", bottom: "38vh" },  // top of arc
  { id: "SCOPE",  right: "35vh", bottom: "27vh" },  // arc — pushed further left
  { id: "WEAPON", right: "45vh", bottom: "10vh" }  // bottom of arc
];
const ARC_4 = [
  { id: "FIRE",   right: "17vh", bottom: "38vh" },  // top of arc
  { id: "SCOPE",  right: "35vh", bottom: "27vh" },  // arc — pushed further left
  { id: "KNEEL",  right: "22vh", bottom: "15vh" },  // satellite: diagonal right-below SCOPE
  { id: "WEAPON", right: "45vh", bottom: "10vh" },  // bottom of arc
];

function ActionButtons({ includeKneel = false }) {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [active, setActive] = useState(null);
  const [vpH, setVpH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setVpH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const arc = includeKneel ? ARC_4 : ARC_3;
  const sz = isMobile ? 52 : BTN_SIZE;
  // Scale arc radius down on mobile so buttons don't overflow small screens
  const s = isMobile ? 0.65 : 1;

  // ── Short-viewport adjustment (e.g. 1440×640) ──────────────────
  // rAdj: extra vh added to `right`  → pushes buttons further LEFT
  // bAdj: vh subtracted from `bottom` → pushes buttons DOWN
  const isShortVP = !isMobile && vpH < 720;
  const rAdj = isShortVP ? 12 : 0;
  const bAdj = isShortVP ? 3 : 0;

  const pos2r = (v) => `${(parseFloat(v) + rAdj) * s}vh`;
  const pos2b = (v) => `${Math.max(2, parseFloat(v) - bAdj) * s}vh`;

  return (
    <>
      {arc.map(pos => {
        const a = ACTIONS.find(x => x.id === pos.id);
        return (
        <button
          key={a.id}
          className="quest-action-btn"
          onMouseDown={() => setActive(a.id)}
          onMouseUp={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
          style={{
            position: "absolute",
            right: pos2r(pos.right), bottom: pos2b(pos.bottom),
            zIndex: 35,
            width: sz, height: sz,
            borderRadius: "50%",
            background: active === a.id
              ? `radial-gradient(circle at 40% 35%, ${a.color}44, ${a.color}18)`
              : "rgba(4,12,28,0.88)",
            border: `1.5px solid ${a.color}${active === a.id ? "cc" : "66"}`,
            boxShadow: active === a.id
              ? `0 0 20px ${a.glow}, 0 0 40px ${a.glow}`
              : `0 0 10px ${a.color}22`,
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: isMobile ? 12 : 18,
            overflow: "hidden",
          }}
        >
          {a.icon}
          <span style={{
            position: "absolute",
            bottom: 0,
            left: 0, right: 0,
            textAlign: "center",
            paddingBottom: 9,
            fontFamily: "Orbitron,sans-serif",
            fontSize: 7,
            fontWeight: "bold",
            letterSpacing: "0.08em",
            color: active === a.id ? a.color : "#ffffff",
            textShadow: active === a.id ? `0 0 8px ${a.glow}` : "0 1px 3px rgba(0,0,0,0.9)",
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 100%, transparent)",
            userSelect: "none",
            pointerEvents: "none",
          }}>{t(`quest.actions.${a.id.toLowerCase()}`, a.id)}</span>
        </button>
        );
      })}
    </>
  );
}

/* ─── Star-map data ───────────────────────────────────────── */
const ATM_COLOR = { BREATHABLE:"#22c55e", ARTIFICIAL:"#38bdf8", VACUUM:"#94a3b8", TOXIC:"#f97316" };
const HAZ_COLOR = { LOW:"#22c55e", MEDIUM:"#facc15", HIGH:"#f87171" };

// Positions derived from image grid: center X≈50.1%, column interval≈2.88%vw, row interval≈6.12%vh
// labelBelow:true  → label di bawah dot (default: di atas)
// labelShift:{x,y} → geser label dalam px (dot tidak ikut)
const LOCATIONS = [
  // ── Left cluster ──────────────────────────────────────────
  { id:"sd",    name:"SD324-#HE-GM09",      type:"Supply Depot",        coords:"T13·L11", atm:"ARTIFICIAL", hazard:"LOW",    left:"28%",   top:"29%",                                          desc:"Primary logistics hub for the western frontier. Maintains emergency ration reserves." },
  { id:"res",   name:"RESa56-FI37-GM09",   type:"Research Station",    coords:"T14·L06", atm:"ARTIFICIAL", hazard:"LOW",    left:"13.1%", top:"22%",   labelBelow:true, labelShift:{x:-10,y:0}, desc:"Xenobiology and deep-space materials lab. Houses 40 resident scientists." },
  { id:"agri",  name:"AGG4-ST04-GM09",     type:"Agriculture Hub",     coords:"T13·L04", atm:"BREATHABLE", hazard:"LOW",    left:"17.5%", top:"20.5%",                                        desc:"Hydroponic farming complex. Primary food source for western sectors." },
  { id:"trade", name:"TP537-RSS-GM09",     type:"Trading Post",        coords:"T11·L05", atm:"ARTIFICIAL", hazard:"LOW",    left:"41%",   top:"21%",                                          desc:"Free-trade zone. Over 200 registered merchants. Currency: Universal Credits." },
  { id:"fuel",  name:"REF311-F/O-GM09",    type:"Refuel Station",      coords:"T10·L04", atm:"VACUUM",     hazard:"LOW",    left:"37%",   top:"31.5%", labelBelow:true, labelShift:{x:-18,y:0}, desc:"High-capacity fuel depot. Supports ion drives, plasma cores, and dark matter cells." },
  { id:"ship",  name:"CFT47-56TRE-GM09",   type:"Shipyard",            coords:"T09·L13", atm:"ARTIFICIAL", hazard:"LOW",    left:"15.5%", top:"43%",   labelBelow:true,                        desc:"Fleet maintenance and assembly station. Capacity: 18 vessels." },
  { id:"ind",   name:"ICx3-9-GM09",        type:"Industrial Complex",  coords:"T08·L10", atm:"TOXIC",      hazard:"HIGH",   left:"20.5%", top:"42%",   labelShift:{x:18,y:0},                 desc:"Heavy manufacturing zone. Atmospheric scrubbers required. Output: 8.4k units/cycle." },
  { id:"mil",   name:"ZV-23N-19U-GM09",    type:"Military Base",       coords:"T07·L10", atm:"BREATHABLE", hazard:"HIGH",   left:"28%",   top:"50%",                                          desc:"Restricted zone. Coalition Armed Forces installation. Clearance Level 4 required." },
  { id:"cmd",   name:"ZORAX-19U-GM09",     type:"Command Center",      coords:"T06·L07", atm:"BREATHABLE", hazard:"LOW",    left:"31.5%", top:"54.5%",                                        desc:"Sector command authority. All major coalition operations coordinated here." },
  { id:"logi",  name:"SD324-#HE-GM09",     type:"Logistics Hub",       coords:"T05·L11", atm:"ARTIFICIAL", hazard:"LOW",    left:"22.5%", top:"60%",                                          desc:"Traffic control and cargo routing for southern transit lanes." },
  { id:"sci",   name:"OPs88-GM09",          type:"Science Outpost",     coords:"T04·L13", atm:"VACUUM",     hazard:"MEDIUM", left:"17.5%", top:"63%",                                          desc:"Research station studying gravitational anomalies near the galactic core boundary." },
  { id:"comm",  name:"TQ-174-HC-GM09",     type:"Communication Array", coords:"T03·L08", atm:"VACUUM",     hazard:"LOW",    left:"29.5%", top:"66%",                                          desc:"Quantum-entanglement communication node. Zero-lag interstellar messaging." },
  { id:"relay", name:"RDs34-GM09",         type:"Deep Space Relay",    coords:"T03·L11", atm:"VACUUM",     hazard:"LOW",    left:"23%",   top:"77%",                                          desc:"Automated relay node. Maintains network connectivity for outer ring settlements." },
  { id:"echo",  name:"ECHO23-GM09",        type:"Echo Station",        coords:"T02·L15", atm:"VACUUM",     hazard:"LOW",    left:"10%",   top:"74%",                                          desc:"Long-range communication relay. Signal strength: 99.7%. Uptime: 14.2 years." },
  // ── Center ────────────────────────────────────────────────
  { id:"sup",   name:"TLM-675-GM09",       type:"Supply Station",      coords:"T12·C00", atm:"ARTIFICIAL", hazard:"LOW",    left:"30%",   top:"19%",   labelBelow:true, labelShift:{x:22,y:0}, desc:"Neutral supply platform. Operated by the Interstellar Merchant Consortium." },
  { id:"nav",   name:"RDs34-GM09",         type:"Navigation Beacon",   coords:"T11·R02", atm:"VACUUM",     hazard:"LOW",    left:"40.5%", top:"30.5%", labelShift:{x:28,y:0},                 desc:"Automated navigation beacon. Guides transit traffic through the central corridor." },
  { id:"pion",  name:"OP28b-GM09",         type:"Pioneer Outpost",     coords:"T05·C00", atm:"VACUUM",     hazard:"MEDIUM", left:"42%",   top:"68.5%",                                        desc:"Frontier exploration base. Marks the edge of the charted transit network." },
  // ── Right cluster ─────────────────────────────────────────
  { id:"sig",   name:"SR5c-COM-GM09",       type:"Signal Relay",        coords:"T15·R13", atm:"VACUUM",     hazard:"LOW",    left:"65.5%", top:"22%",                                          desc:"High-orbit relay beacon. Uplinks to the Core Network every 6 minutes." },
  { id:"orb",   name:"TXC-44P-GM09",       type:"Orbital Lab",         coords:"T14·R07", atm:"ARTIFICIAL", hazard:"MEDIUM", left:"22.5%", top:"18.5%", labelBelow:true, labelShift:{x:22,y:0}, desc:"Zero-gravity materials research. Studies exotic matter behavior under void conditions." },
  { id:"col",   name:"OP27a-GM09",          type:"Colony Outpost",      coords:"T13·R05", atm:"BREATHABLE", hazard:"LOW",    left:"75.5%", top:"17.5%",                                        desc:"Early settlement colony. Population: 12,400. Agriculture and mining operations active." },
  { id:"trd",   name:"ECHO23-GM09",        type:"Trade Station",       coords:"T10·R05", atm:"ARTIFICIAL", hazard:"LOW",    left:"39.5%", top:"38.5%",                                        desc:"Eastern trade hub. Junction point for cargo routes from sectors R01–R08." },
  { id:"bio",   name:"MED-B143-GM09",      type:"Biomedical Research", coords:"T09·R05", atm:"BREATHABLE", hazard:"MEDIUM", left:"79.5%", top:"51%",   labelBelow:true,                        desc:"Pharmaceutical and xenobiology research. Quarantine protocols in effect." },
  { id:"expl",  name:"TQ-175-HOP-GM09",    type:"Exploration Outpost", coords:"T08·R06", atm:"VACUUM",     hazard:"LOW",    left:"73.5%", top:"41%",                                          desc:"Forward scout base for unmapped regions. Last transmission: 3.2 standard days ago." },
  { id:"asm",   name:"VES-52-GM09",        type:"Assembly Plant",      coords:"T06·R07", atm:"ARTIFICIAL", hazard:"MEDIUM", left:"85.5%", top:"47.5%", labelShift:{x:-20,y:0},                desc:"Modular spacecraft assembly. Produces 12 vessels per standard cycle." },
  { id:"tech",  name:"TEC77-52-GM09",      type:"Technology Hub",      coords:"T06·R09", atm:"ARTIFICIAL", hazard:"LOW",    left:"86.5%", top:"47.5%", labelBelow:true, labelShift:{x:-20,y:0}, desc:"Advanced tech R&D facility. Specializes in propulsion systems and AI cores." },
  { id:"gas",   name:"EXT5i-GM09",         type:"Gas Extraction",      coords:"T05·R05", atm:"TOXIC",      hazard:"HIGH",   left:"67.5%", top:"30%",                                          desc:"Atmospheric gas harvesting from a dense nebula pocket. High radiation environment." },
  { id:"ice",   name:"HIc3-GM09",          type:"Ice Harvesting",      coords:"T03·R07", atm:"VACUUM",     hazard:"LOW",    left:"64.5%", top:"35%",                                          desc:"Cryo-comet resource extraction. Primary water source for eastern stations." },
  // ── Unknown / unvisited planets — left/top = dot tip (upper-right end of line) ──
  { id:"unk1",  unknown:true, left:"81.3%",   top:"32%",  lineLen:20 },
  { id:"unk2",  unknown:true, left:"89.7%", top:"30%",  lineLen:20 },
  { id:"unk3",  unknown:true, left:"90.5%",   top:"17%",  lineLen:20 },
  { id:"unk4",  unknown:true, left:"57.8%", top:"63%",  lineLen:20 },
  { id:"unk5",  unknown:true, left:"67.4%",   top:"63%",  lineLen:20 },
  { id:"unk6",  unknown:true, left:"62%",   top:"72.5%",  lineLen:20 },
  { id:"unk7",  unknown:true, left:"75.8%",   top:"73.2%",  lineLen:20 },
  { id:"unk8",  unknown:true, left:"87%",   top:"60%",  lineLen:20 },
  { id:"unk9",  unknown:true, left:"87.5%",   top:"75.5%",  lineLen:20 },
  { id:"unk10", unknown:true, left:"58.1%",   top:"27.8%",  lineLen:20 },
];

/* ── Planet image mapping — add entries here as assets arrive ── */
const PLANET_IMG = {
  agri:  "/planet/1.png",   // ZETA-37-6LP
  sd:    "/planet/1.png",   // ZETA-51-M2
  mil:   "/planet/1.png",   // ZV-23N-19U
  orb:   "/planet/2.png",   // TXC-44P-GM09
  ship:  "/planet/2.png",   // ICx3-9-GM09
  echo:  "/planet/2.png",   // ZIR-12-56
  logi:  "/planet/2.png",   // ZORAX-4SH
  trade: "/planet/2.png",   // ZETA-73-QN
  sci:   "/planet/3.png",   // ZETA-31-196
  pion:  "/planet/3.png",   // TNS-554
  sup:   "/planet/3.png",   // TLM-675
  fuel:  "/planet/3.png",   // ZETA-91-9XV
  cmd:   "/planet/4.png",   // ZORAX-19U
  ind:   "/planet/4.png",   // ZETA-33-8V2
  sig:   "/planet/4.png",   // TMA-488
  asm:   "/planet/4.png",   // ZX-89-QW
  ice:   "/planet/4.png",   // TZR-092
  bio:   "/planet/4.png",   // TY-67-3P
  col:   "/planet/5.png",   // FZC-423
  res:   "/planet/5.png",   // ZETA-55-9R
  relay: "/planet/6.png",   // ZEN-83-OX
  trd:   "/planet/6.png",   // TKY-981
  gas:   "/planet/6.png",   // TNG-921
  tech:  "/planet/6.png",   // ZX-88-QW
  comm:  "/planet/7.png",   // ZIR-31-6NV
  expl:  "/planet/7.png",   // ZRSE-40P
  nav:   "/planet/7.png",   // TQ-173-HN
};

/* ── Location type → i18n key map ────────────────────────────── */
const LOC_TYPE_KEY = {
  "Supply Depot":        "supplyDepot",
  "Research Station":    "researchStation",
  "Agriculture Hub":     "agricultureHub",
  "Trading Post":        "tradingPost",
  "Refuel Station":      "refuelStation",
  "Shipyard":            "shipyard",
  "Industrial Complex":  "industrialComplex",
  "Military Base":       "militaryBase",
  "Command Center":      "commandCenter",
  "Logistics Hub":       "logisticsHub",
  "Science Outpost":     "scienceOutpost",
  "Communication Array": "communicationArray",
  "Deep Space Relay":    "deepSpaceRelay",
  "Echo Station":        "echoStation",
  "Supply Station":      "supplyStation",
  "Navigation Beacon":   "navigationBeacon",
  "Pioneer Outpost":     "pioneerOutpost",
  "Signal Relay":        "signalRelay",
  "Orbital Lab":         "orbitalLab",
  "Colony Outpost":      "colonyOutpost",
  "Trade Station":       "tradeStation",
  "Biomedical Research": "biomedicalResearch",
  "Exploration Outpost": "explorationOutpost",
  "Assembly Plant":      "assemblyPlant",
  "Technology Hub":      "technologyHub",
  "Gas Extraction":      "gasExtraction",
  "Ice Harvesting":      "iceHarvesting",
};

/* ── Planet detail panel ──────────────────────────────────── */
function PlanetDetail({ loc, onClose }) {
  const { t } = useTranslation();
  const ac = ATM_COLOR[loc.atm]    || "#94a3b8";
  const hc = HAZ_COLOR[loc.hazard] || "#94a3b8";
  const imgSrc = PLANET_IMG[loc.id];
  const fallbackColor = ATM_COLOR[loc.atm] || "#94a3b8";

  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(`quest_note_${loc.id}`) || ""; }
    catch { return ""; }
  });
  const handleNote = (e) => {
    setNote(e.target.value);
    try { localStorage.setItem(`quest_note_${loc.id}`, e.target.value); }
    catch {}
  };

  const l = parseFloat(loc.left);
  const topPct = parseFloat(loc.top);
  const toLeft = l > 52;
  const hPos = toLeft
    ? { right: `${Math.max(1, 100 - l + 1)}%` }
    : { left:  `${Math.min(48, l + 2)}%` };
  const toAbove = topPct > 55;
  const vPos = toAbove
    ? { bottom: `${Math.max(2, 100 - topPct + 1)}%` }
    : { top:    `${Math.min(46, topPct + 2)}%` };

  return (
    <div style={{
      position: "absolute",
      ...hPos, ...vPos,
      width: "min(320px, 46%)",
      background: "rgba(2,6,22,0.97)",
      border: "1px solid rgba(56,189,248,0.38)",
      borderRadius: 10,
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 60px rgba(0,0,0,0.9), 0 0 30px rgba(56,189,248,0.07)",
      zIndex: 85,
      overflow: "hidden",
      animation: "locDetailIn 0.2s ease both",
    }}>
      <style>{`
        @keyframes locDetailIn {
          from { opacity:0; transform: scale(0.94); }
          to   { opacity:1; transform: scale(1); }
        }
        .quest-notes-ta::placeholder { color: #7dd3fc; }
        .quest-notes-ta:focus { outline: none; }
      `}</style>

      {/* Header — full width */}
      <div style={{ background:"rgba(56,189,248,0.07)", borderBottom:"1px solid rgba(56,189,248,0.16)", padding:"7px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, fontWeight:"bold", color:"#38bdf8", letterSpacing:"0.12em", textShadow:"0 0 12px rgba(56,189,248,0.7)" }}>{loc.name}</div>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, color:"rgba(255,255,255,0.4)", letterSpacing:"0.18em", marginTop:2 }}>{t(`quest.locTypes.${LOC_TYPE_KEY[loc.type] ?? "unknown"}`, loc.type)} · {loc.coords}</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer", lineHeight:1, padding:"0 2px" }}>×</button>
      </div>

      {/* Body — LEFT: info + quest locked  |  RIGHT: image + notes */}
      <div style={{ display:"flex" }}>

        {/* LEFT — atmosphere, hazard, briefing, quest locked */}
        <div style={{ flex:1, padding:"8px 10px 10px", display:"flex", flexDirection:"column", gap:6, minWidth:0 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"rgba(255,255,255,0.32)", letterSpacing:"0.18em", marginBottom:2 }}>{t("quest.planet.atmosphere")}</div>
              <div style={{ display:"inline-block", background:`${ac}18`, border:`1px solid ${ac}55`, borderRadius:3, padding:"2px 6px", fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold", color:ac, letterSpacing:"0.1em" }}>{t(`quest.atm.${loc.atm.toLowerCase()}`, loc.atm)}</div>
            </div>
            <div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"rgba(255,255,255,0.32)", letterSpacing:"0.18em", marginBottom:2 }}>{t("quest.planet.hazardLvl")}</div>
              <div style={{ display:"inline-block", background:`${hc}18`, border:`1px solid ${hc}55`, borderRadius:3, padding:"2px 6px", fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold", color:hc, letterSpacing:"0.1em" }}>{t(`quest.hazard.${loc.hazard.toLowerCase()}`, loc.hazard)}</div>
            </div>
          </div>
          <div style={{ height:1, background:"rgba(56,189,248,0.1)" }} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"rgba(56,189,248,0.4)", letterSpacing:"0.18em", marginBottom:3 }}>{t("quest.planet.briefing")}</div>
            <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7.5, color:"rgba(255,255,255,0.68)", lineHeight:1.55, letterSpacing:"0.03em" }}>{t(`quest.locDescs.${loc.id}`, loc.desc)}</div>
          </div>
          {/* Quest locked — left column only */}
          <div style={{ background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:5, padding:"5px 7px", display:"flex", alignItems:"center", gap:6, marginTop:1 }}>
            <div style={{ fontSize:11, flexShrink:0 }}>🔒</div>
            <div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5, fontWeight:"bold", color:"#f87171", letterSpacing:"0.1em", marginBottom:1 }}>{t("quest.planet.questLocked")}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"rgba(248,113,113,0.55)", letterSpacing:"0.04em", lineHeight:1.4 }}>{t("quest.planet.questLockedDesc")}</div>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width:1, background:"rgba(56,189,248,0.1)", flexShrink:0 }} />

        {/* RIGHT — image (top) + notes (bottom) */}
        <div style={{ width:110, display:"flex", flexDirection:"column", flexShrink:0 }}>

          {/* Image box */}
          <div style={{
            height:105,
            flexShrink:0,
            borderBottom:"1px solid rgba(56,189,248,0.1)",
            position:"relative", overflow:"hidden",
            background: imgSrc ? "#000" : `radial-gradient(circle at 40% 35%, ${fallbackColor}33, rgba(2,6,22,0.9))`,
          }}>
            {imgSrc
              ? <img src={imgSrc} alt={loc.type} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(255,255,255,0.18)", letterSpacing:"0.12em" }}>{t("quest.planet.noImage")}</div>
                </div>
            }
            <div style={{ position:"absolute", bottom:3, left:5, fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"#fff", letterSpacing:"0.12em", pointerEvents:"none" }}>{t("quest.planet.image")}</div>
          </div>

          {/* Notes box */}
          <div style={{ height:88, flexShrink:0, display:"flex", flexDirection:"column", background:"rgba(56,189,248,0.02)" }}>
            <div style={{ padding:"5px 7px 2px", fontFamily:"Orbitron,sans-serif", fontSize:6, color:"#38bdf8", letterSpacing:"0.15em", fontWeight:"bold", flexShrink:0 }}>{t("quest.planet.notes")}</div>
            <textarea
              className="quest-notes-ta"
              value={note}
              onChange={handleNote}
              placeholder={t("quest.planet.notesPlaceholder")}
              style={{
                flex:1,
                width:"100%",
                background:"transparent",
                border:"none", resize:"none",
                padding:"2px 7px 7px",
                fontFamily:"Orbitron,sans-serif", fontSize:8,
                color:"#fff",
                lineHeight:1.5, letterSpacing:"0.03em",
                boxSizing:"border-box",
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Video overlay ────────────────────────────────────────── */
function VideoOverlay({ onClose }) {
  const { t } = useTranslation();
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,3,15,0.92)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes videoPopIn {
          from { opacity:0; transform:scale(0.93); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: "flex", flexDirection: "column",
          width: "min(72vw, calc(58vh * 1.778))",
          animation: "videoPopIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
          gap: 8,
        }}
      >
        {/* Title + close — above video */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(9px,1vw,13px)", fontWeight: "bold",
            letterSpacing: "0.18em", color: "#c4b5fd",
            textShadow: "0 0 12px rgba(167,139,250,0.7)",
            whiteSpace: "nowrap",
          }}>▶ {t("quest.video.title")}</div>

          <button
            onClick={onClose}
            style={{
              padding: "5px 14px",
              background: "rgba(0,15,35,0.9)",
              border: "1px solid rgba(167,139,250,0.7)",
              borderRadius: 3,
              clipPath: "polygon(0% 0%,calc(100% - 5px) 0%,100% 100%,5px 100%)",
              fontFamily: "Orbitron,sans-serif",
              fontSize: "clamp(8px,0.8vw,11px)", fontWeight: "bold",
              letterSpacing: "0.14em", color: "#c4b5fd",
              textShadow: "0 0 8px rgba(167,139,250,0.6)",
              cursor: "pointer", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,15,35,0.9)"; }}
          >✕ {t("quest.video.close")}</button>
        </div>

        {/* Video container */}
        <div style={{
          position: "relative",
          aspectRatio: "16/9",
          background: "#000",
          border: "1.5px solid rgba(99,102,241,0.55)",
          borderRadius: 10,
          boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(99,102,241,0.15)",
          overflow: "hidden",
        }}>
          <video
            src="https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/quest_video2.webm"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Unknown planet dropdown ──────────────────────────────── */
function UnknownDropdown({ loc, onClose }) {
  const { t } = useTranslation();
  const l = parseFloat(loc.left);
  const topPct = parseFloat(loc.top);
  const toLeft = l > 60;
  const hPos = toLeft
    ? { right: `${Math.max(1, 100 - l + 2)}%` }
    : { left:  `${Math.min(55, l + 2)}%` };
  const toAbove = topPct > 55;
  const vPos = toAbove
    ? { bottom: `${Math.max(2, 100 - topPct + 2)}%` }
    : { top:    `${Math.min(60, topPct + 2)}%` };

  return (
    <div style={{
      position: "absolute",
      ...hPos, ...vPos,
      width: "min(300px, 44%)",
      background: "rgba(2,6,22,0.97)",
      border: "1px solid rgba(148,163,184,0.25)",
      borderRadius: 8,
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.9), 0 0 20px rgba(148,163,184,0.04)",
      zIndex: 85,
      overflow: "hidden",
      animation: "locDetailIn 0.2s ease both",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(148,163,184,0.06)",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
        padding: "8px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, fontWeight:"bold", color:"rgba(148,163,184,0.7)", letterSpacing:"0.14em" }}>
          ⚠ {t("quest.unknown.title")}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:16, cursor:"pointer", lineHeight:1, padding:"0 2px" }}>×</button>
      </div>
      {/* Body */}
      <div style={{ padding:"11px 13px 13px", display:"flex", flexDirection:"column", gap:9 }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, color:"rgba(255,255,255,0.6)", lineHeight:1.7, letterSpacing:"0.03em" }}>
          {t("quest.unknown.line1")}
        </div>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, color:"rgba(255,255,255,0.6)", lineHeight:1.7, letterSpacing:"0.03em" }}>
          {t("quest.unknown.line2")}
        </div>
        <div style={{
          borderTop: "1px solid rgba(148,163,184,0.15)",
          paddingTop: 9,
          fontFamily:"Orbitron,sans-serif", fontSize:9.5,
          color:"rgba(250,204,21,0.75)", lineHeight:1.7, letterSpacing:"0.03em",
        }}>
          {t("quest.unknown.naming")}
        </div>
      </div>
    </div>
  );
}

/* ── Star Map overlay ─────────────────────────────────────── */
function StarMapOverlay({ onClose }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(null);
  const [pinned,  setPinned]  = useState(null);
  const closeTimer = useRef(null);

  const openPanel   = (loc) => { clearTimeout(closeTimer.current); setHovered(loc); };
  const startClose  = ()    => { if (pinned) return; closeTimer.current = setTimeout(() => setHovered(null), 160); };
  const cancelClose = ()    => { clearTimeout(closeTimer.current); };
  const togglePin   = (loc) => {
    if (pinned?.id === loc.id) {
      setPinned(null);
    } else {
      clearTimeout(closeTimer.current);
      setHovered(loc);
      setPinned(loc);
    }
  };
  const closePanel  = ()    => { setPinned(null); setHovered(null); };

  const active = pinned ?? hovered;

  // Unknown planet state
  const [unkHovered, setUnkHovered] = useState(null);
  const [unkPinned,  setUnkPinned]  = useState(null);
  const unkTimer = useRef(null);
  const openUnk    = (loc) => { clearTimeout(unkTimer.current); setUnkHovered(loc); };
  const closeUnk   = ()    => { if (unkPinned) return; unkTimer.current = setTimeout(() => setUnkHovered(null), 160); };
  const cancelUnk  = ()    => { clearTimeout(unkTimer.current); };
  const toggleUnk  = (loc) => {
    if (unkPinned?.id === loc.id) { setUnkPinned(null); }
    else { clearTimeout(unkTimer.current); setUnkHovered(loc); setUnkPinned(loc); }
  };
  const closeUnkPanel = () => { setUnkPinned(null); setUnkHovered(null); };
  const activeUnk = unkPinned ?? unkHovered;

  return createPortal(
    <div style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,3,15,0.82)", backdropFilter:"blur(5px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <style>{`
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 5px 1px rgba(56,189,248,0.35); }
          50%      { box-shadow: 0 0 12px 3px rgba(56,189,248,0.75); }
        }
        @keyframes mapPopIn {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }
        .map-dot { transition: width 0.15s, height 0.15s; }
        .map-dot:hover { filter: brightness(1.6); }
      `}</style>

      {/* Backdrop click to close */}
      <div style={{ position:"absolute", inset:0 }} onClick={() => { closePanel(); onClose(); }} />

      {/* ── Popup card — 16:9, fits within viewport with margins ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(92vw, calc(86vh * 1.778))",
          aspectRatio: "16/9",
          background: "#000",
          border: "1.5px solid rgba(56,189,248,0.45)",
          borderRadius: 10,
          boxShadow: "0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(56,189,248,0.1)",
          overflow: "hidden",
          animation: "mapPopIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
          zIndex: 76,
        }}
      >
        {/* Map image — fills popup exactly (same 16:9 ratio) */}
        <img
          src="/UI Globe Map_Fixed3.png"
          alt="star map"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"fill", pointerEvents:"none" }}
        />

        {/* Subtle overlay */}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,4,18,0.1)", pointerEvents:"none" }} />

        {/* Hotspot dots — hover to preview, click to pin */}
        {LOCATIONS.map(loc => {
          if (loc.unknown) return null;
          const isActive = active?.id === loc.id;
          const isPinned = pinned?.id === loc.id;
          return (
            <div key={loc.id} style={{ position:"absolute", left:loc.left, top:loc.top, width:0, height:0, zIndex:80 }}>
              <button
                className="map-dot"
                onMouseEnter={() => openPanel(loc)}
                onMouseLeave={startClose}
                onClick={() => togglePin(loc)}
                style={{
                  position:"absolute",
                  transform:"translate(-50%,-50%)",
                  width: isActive ? 14 : 9, height: isActive ? 14 : 9,
                  borderRadius:"50%",
                  background: isPinned ? "#facc15" : isActive ? "#38bdf8" : "rgba(56,189,248,0.65)",
                  border:`1.5px solid ${isPinned ? "#fde68a" : isActive ? "#7dd3fc" : "rgba(56,189,248,0.9)"}`,
                  boxShadow: isPinned ? "0 0 16px 4px rgba(250,204,21,0.9)" : isActive ? "0 0 16px 4px rgba(56,189,248,0.9)" : undefined,
                  animation: isActive ? "none" : "dotPulse 2.4s ease-in-out infinite",
                  cursor:"pointer", padding:0,
                }}
              />
            </div>
          );
        })}

        {/* Unknown planet — vertical line, dot at top */}
        {LOCATIONS.map(loc => {
          if (!loc.unknown) return null;
          const isActive = activeUnk?.id === loc.id;
          const isPinned = unkPinned?.id === loc.id;
          const len = loc.lineLen ?? 70;
          return (
            <div key={loc.id} style={{ position:"absolute", left:loc.left, top:loc.top, width:0, height:0, zIndex:80 }}>
              {/* Vertical line going straight up from base */}
              <div style={{
                position:"absolute",
                left:0, top: -len,
                width: 1.5,
                height: len,
                background: isPinned ? "rgba(250,204,21,0.8)" : "rgba(56,189,248,0.55)",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                transition: "background 0.15s",
              }} />
              {/* Dot at the top of the line */}
              <button
                className="map-dot"
                onMouseEnter={() => openUnk(loc)}
                onMouseLeave={closeUnk}
                onClick={() => toggleUnk(loc)}
                style={{
                  position:"absolute",
                  left: 0,
                  top: -len,
                  transform:"translate(-50%,-50%)",
                  width: isActive ? 14 : 9, height: isActive ? 14 : 9,
                  borderRadius:"50%",
                  background: isPinned ? "#facc15" : isActive ? "#38bdf8" : "rgba(56,189,248,0.65)",
                  border:`1.5px solid ${isPinned ? "#fde68a" : isActive ? "#7dd3fc" : "rgba(56,189,248,0.9)"}`,
                  boxShadow: isPinned ? "0 0 16px 4px rgba(250,204,21,0.9)" : isActive ? "0 0 16px 4px rgba(56,189,248,0.9)" : undefined,
                  animation: isActive ? "none" : "dotPulse 2.4s ease-in-out infinite",
                  cursor:"pointer", padding:0,
                }}
              />
            </div>
          );
        })}

        {/* Detail panel — hover: closes on mouseLeave; pinned: stays until × or re-click */}
        {active && (
          <div onMouseEnter={cancelClose} onMouseLeave={startClose}>
            <PlanetDetail loc={active} onClose={closePanel} />
          </div>
        )}

        {/* Unknown planet dropdown */}
        {activeUnk && (
          <div onMouseEnter={cancelUnk} onMouseLeave={closeUnk}>
            <UnknownDropdown loc={activeUnk} onClose={closeUnkPanel} />
          </div>
        )}

        {/* Top bar: title + BACK button — all in one flex row */}
        <div style={{
          position:"absolute", top:0, left:0, right:0,
          padding:"5px 8px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"rgba(0,6,22,0.75)", backdropFilter:"blur(6px)",
          borderBottom:"1px solid rgba(56,189,248,0.22)",
          zIndex:90,
        }}>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:"clamp(6px,0.7vw,9px)", fontWeight:"bold", letterSpacing:"0.22em", color:"rgba(56,189,248,0.7)", whiteSpace:"nowrap", pointerEvents:"none" }}>
            ◈ {t("quest.starMap.title")}
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              marginLeft: 8,
              padding:"3px 10px",
              background:"rgba(0,15,35,0.9)",
              border:"1px solid rgba(56,189,248,0.55)",
              borderRadius:3,
              clipPath:"polygon(0% 0%,calc(100% - 5px) 0%,100% 100%,5px 100%)",
              fontFamily:"Orbitron,sans-serif", fontSize:"clamp(6px,0.65vw,8px)", fontWeight:"bold",
              letterSpacing:"0.12em", color:"#7dd3fc",
              cursor:"pointer", whiteSpace:"nowrap",
            }}
          >✕ {t("quest.starMap.back")}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════════════════════════════════
   SPACE VIEW
   ══════════════════════════════════════════════════════════════════ */
function SpaceView() {
  const { t } = useTranslation();
  const [mapOpen,      setMapOpen]      = useState(false);
  const [videoOpen,    setVideoOpen]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#020612" }}>

      {/* Background image */}
      <LazyImage src="/quest_space.png" spinnerColor="#38bdf8" />

      {/* Overlay / stars fallback */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 40%, rgba(30,15,60,0.6), transparent)" }} />

      {/* Stars */}
      {Array.from({ length: 120 }, (_, i) => (
        <div key={i} className="star" style={{
          position: "absolute",
          left: `${(i * 137.5) % 100}%`,
          top:  `${(i * 97.3) % 100}%`,
          width: i % 11 === 0 ? 2.5 : 1,
          height: i % 11 === 0 ? 2.5 : 1,
          borderRadius: "50%",
          background: i % 5 === 0 ? "#38bdf8" : "#fff",
          opacity: 0.15 + (i % 7) * 0.1,
          animation: `starsTwinkle ${2 + (i % 4)}s ease-in-out ${(i % 3) * 0.5}s infinite`,
        }} />
      ))}

      {/* Nebula blob */}
      <div className="nebula" style={{
        position: "absolute", top: "10%", right: "20%",
        width: 300, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(99,40,180,0.18) 0%, rgba(56,189,248,0.08) 50%, transparent 100%)",
        filter: "blur(30px)",
      }} />

      {/* Distant planet */}
      <div style={{
        position: "absolute", top: "15%", right: "28%",
        width: 90, height: 90, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(56,189,248,0.5), rgba(10,30,80,0.9))",
        boxShadow: "0 0 30px rgba(56,189,248,0.2), 0 0 60px rgba(56,189,248,0.08)",
        border: "1px solid rgba(56,189,248,0.25)",
      }}>
        {/* Ring */}
        <div style={{
          position: "absolute", top: "38%", left: "-30%", right: "-30%",
          height: 18, borderRadius: "50%",
          border: "2px solid rgba(56,189,248,0.3)",
          transform: "rotateX(75deg)",
        }} />
      </div>

      {/* Player spaceship SVG */}
      <div className="quest-ship" style={{
        position: "absolute", bottom: "20%", left: "50%",
        filter: "drop-shadow(0 0 20px rgba(56,189,248,0.6))",
      }}>
        <svg viewBox="0 0 120 80" width="180" height="120" fill="none">
          {/* Main body */}
          <path d="M60 5 L90 45 L75 55 L60 50 L45 55 L30 45 Z" fill="#0d2035" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.8"/>
          {/* Cockpit */}
          <ellipse cx="60" cy="28" rx="10" ry="14" fill="#0a1828" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.9"/>
          <ellipse cx="60" cy="28" rx="6" ry="9" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.6"/>
          {/* Left wing */}
          <path d="M45 40 L15 60 L30 55 L45 50 Z" fill="#0a1828" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6"/>
          {/* Right wing */}
          <path d="M75 40 L105 60 L90 55 L75 50 Z" fill="#0a1828" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6"/>
          {/* Engine glow */}
          <ellipse cx="50" cy="54" rx="5" ry="3" fill="#22c55e" fillOpacity="0.5"/>
          <ellipse cx="70" cy="54" rx="5" ry="3" fill="#22c55e" fillOpacity="0.5"/>
          <ellipse cx="60" cy="52" rx="4" ry="2.5" fill="#38bdf8" fillOpacity="0.6"/>
          {/* Accent stripe */}
          <line x1="45" y1="38" x2="75" y2="38" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
      </div>

      {/* Joystick for space movement */}
      <div style={{ position:"absolute", left:"4%", bottom:"16%", zIndex:35 }}>
        <Joystick2D accentColor="#38bdf8" />
      </div>

      {/* Action buttons — right, no Kneel in space */}
      <ActionButtons includeKneel={false} />

      {/* IN-GAME CONTENT dropdown button */}
      <div style={{
        position: "absolute", top: "22%", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
      }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            padding: "9px 24px",
            background: "rgba(0,12,32,0.88)",
            border: "1.5px solid rgba(56,189,248,0.6)",
            borderRadius: 3,
            clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(7px,0.85vw,10px)", fontWeight: "bold",
            letterSpacing: "0.18em", color: "#7dd3fc",
            textShadow: "0 0 10px rgba(56,189,248,0.6)",
            boxShadow: "0 0 20px rgba(56,189,248,0.2)",
            cursor: "pointer", whiteSpace: "nowrap",
            transition: "background 0.2s, box-shadow 0.2s",
            display: "flex", alignItems: "center", gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.18)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(56,189,248,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,12,32,0.88)";    e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.2)"; }}
        >
          ◈ {t("quest.space.inGameContent")}
          <span style={{ fontSize: "0.7em", opacity: 0.7 }}>{dropdownOpen ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,12,32,0.96)",
            border: "1px solid rgba(56,189,248,0.4)",
            borderRadius: 4,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.7), 0 0 20px rgba(56,189,248,0.1)",
            overflow: "hidden", minWidth: 220,
          }}>
            {[
              { label: t("quest.space.galaxyVideo"), icon: "▶", action: () => { setVideoOpen(true); setDropdownOpen(false); } },
              { label: t("quest.space.interactiveMap"), icon: "◈", action: () => { setMapOpen(true);   setDropdownOpen(false); } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 16px",
                  background: "transparent",
                  border: "none", borderBottom: "1px solid rgba(56,189,248,0.1)",
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: "clamp(6px,0.75vw,9px)", fontWeight: "bold",
                  letterSpacing: "0.12em", color: "#7dd3fc",
                  cursor: "pointer", textAlign: "left", whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ color: "#38bdf8", fontSize: "1.1em" }}>{item.icon}</span>
                {item.label.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {mapOpen   && <StarMapOverlay  onClose={() => setMapOpen(false)} />}
      {videoOpen && <VideoOverlay    onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GROUND VIEW
   ══════════════════════════════════════════════════════════════════ */
function GroundView() {
  const { t } = useTranslation();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#080c06" }}>

      {/* Background image */}
      <LazyImage src="/quest3.png" spinnerColor="#38bdf8" />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />

      {/* Ground HUD label */}
      <div style={{
        position: "absolute", top: "14%", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "clamp(9px, 1vw, 12px)",
        fontWeight: "bold", letterSpacing: "0.4em",
        color: "rgba(56,189,248,0.35)",
        textShadow: "0 0 16px rgba(56,189,248,0.25)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>{t("quest.ground.mission")}</div>

      {/* 2D Joystick — left */}
      <div style={{ position:"absolute", left:"4%", bottom:"16%", zIndex:35 }}>
        <Joystick2D accentColor="#38bdf8" />
      </div>

      {/* Action buttons — right, Kneel included for ground */}
      <ActionButtons includeKneel={true} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   QuestMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function QuestMode({ view = "SPACE", onExit }) {
  const { t } = useTranslation();
  const isSpace = view === "SPACE";

  return (
    <>
      <style>{CSS}</style>

      <div className="quest-overlay" style={{
        position: "absolute", inset: 0,
        zIndex: 15, overflow: "hidden",
      }}>

        {isSpace ? <SpaceView /> : <GroundView />}

        {/* EXIT button — bottom-left */}
        <button
          className="quest-exit-btn"
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: "3.5%", left: "2%",
            zIndex: 35,
            padding: "8px 20px",
            background: "rgba(0,15,30,0.88)",
            border: "1.5px solid rgba(56,189,248,0.55)",
            borderRadius: 3,
            clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 100%, 10px 100%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(7px, 0.7vw, 9px)",
            fontWeight: "bold",
            letterSpacing: "0.18em",
            color: "#7dd3fc",
            textShadow: "0 0 8px rgba(56,189,248,0.7)",
            boxShadow: "0 0 16px rgba(56,189,248,0.15)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ← {t("quest.exit")} QUEST
        </button>

      </div>
    </>
  );
}
