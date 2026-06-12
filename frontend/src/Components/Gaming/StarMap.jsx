import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "./LazyImage";

const ATM_COLOR = { BREATHABLE:"#22c55e", ARTIFICIAL:"#38bdf8", VACUUM:"#94a3b8", TOXIC:"#f97316" };
const HAZ_COLOR = { LOW:"#22c55e", MEDIUM:"#facc15", HIGH:"#f87171" };

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
  // ── Unknown / unvisited planets ──
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

const PLANET_IMG = {
  agri:  "/planet/1.webp",
  sd:    "/planet/1.webp",
  mil:   "/planet/1.webp",
  orb:   "/planet/2.webp",
  ship:  "/planet/2.webp",
  echo:  "/planet/2.webp",
  logi:  "/planet/2.webp",
  trade: "/planet/2.webp",
  sci:   "/planet/3.webp",
  pion:  "/planet/3.webp",
  sup:   "/planet/3.webp",
  fuel:  "/planet/3.webp",
  cmd:   "/planet/4.webp",
  ind:   "/planet/4.webp",
  sig:   "/planet/4.webp",
  asm:   "/planet/4.webp",
  ice:   "/planet/4.webp",
  bio:   "/planet/4.webp",
  col:   "/planet/5.webp",
  res:   "/planet/5.webp",
  relay: "/planet/6.webp",
  trd:   "/planet/6.webp",
  gas:   "/planet/6.webp",
  tech:  "/planet/6.webp",
  comm:  "/planet/7.webp",
  expl:  "/planet/7.webp",
  nav:   "/planet/7.webp",
};

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

      <div style={{ background:"rgba(56,189,248,0.07)", borderBottom:"1px solid rgba(56,189,248,0.16)", padding:"7px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, fontWeight:"bold", color:"#38bdf8", letterSpacing:"0.12em", textShadow:"0 0 12px rgba(56,189,248,0.7)" }}>{loc.name}</div>
          <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, color:"rgba(255,255,255,0.4)", letterSpacing:"0.18em", marginTop:2 }}>{t(`quest.locTypes.${LOC_TYPE_KEY[loc.type] ?? "unknown"}`, loc.type)} · {loc.coords}</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:16, cursor:"pointer", lineHeight:1, padding:"0 2px" }}>×</button>
      </div>

      <div style={{ display:"flex" }}>
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
          <div style={{ background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:5, padding:"5px 7px", display:"flex", alignItems:"center", gap:6, marginTop:1 }}>
            <div style={{ fontSize:11, flexShrink:0 }}>🔒</div>
            <div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5, fontWeight:"bold", color:"#f87171", letterSpacing:"0.1em", marginBottom:1 }}>{t("quest.planet.questLocked")}</div>
              <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"rgba(248,113,113,0.55)", letterSpacing:"0.04em", lineHeight:1.4 }}>{t("quest.planet.questLockedDesc")}</div>
            </div>
          </div>
        </div>

        <div style={{ width:1, background:"rgba(56,189,248,0.1)", flexShrink:0 }} />

        <div style={{ width:110, display:"flex", flexDirection:"column", flexShrink:0 }}>
          <div style={{
            height:105, flexShrink:0,
            borderBottom:"1px solid rgba(56,189,248,0.1)",
            position:"relative", overflow:"hidden",
            background: imgSrc ? "#000" : `radial-gradient(circle at 40% 35%, ${fallbackColor}33, rgba(2,6,22,0.9))`,
          }}>
            {imgSrc
              ? <LazyImage src={imgSrc} alt={loc.type} wrapStyle={{ position:"relative", width:"100%", height:"100%" }} spinnerColor="#38bdf8" />
              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:6, color:"rgba(255,255,255,0.18)", letterSpacing:"0.12em" }}>{t("quest.planet.noImage")}</div>
                </div>
            }
            <div style={{ position:"absolute", bottom:3, left:5, fontFamily:"Orbitron,sans-serif", fontSize:5.5, color:"#fff", letterSpacing:"0.12em", pointerEvents:"none" }}>{t("quest.planet.image")}</div>
          </div>

          <div style={{ height:88, flexShrink:0, display:"flex", flexDirection:"column", background:"rgba(56,189,248,0.02)" }}>
            <div style={{ padding:"5px 7px 2px", fontFamily:"Orbitron,sans-serif", fontSize:6, color:"#38bdf8", letterSpacing:"0.15em", fontWeight:"bold", flexShrink:0 }}>{t("quest.planet.notes")}</div>
            <textarea
              className="quest-notes-ta"
              value={note}
              onChange={handleNote}
              placeholder={t("quest.planet.notesPlaceholder")}
              style={{
                flex:1, width:"100%",
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
      <div style={{ background:"rgba(148,163,184,0.06)", borderBottom:"1px solid rgba(148,163,184,0.15)", padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, fontWeight:"bold", color:"rgba(148,163,184,0.7)", letterSpacing:"0.14em" }}>
          ⚠ {t("quest.unknown.title")}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:16, cursor:"pointer", lineHeight:1, padding:"0 2px" }}>×</button>
      </div>
      <div style={{ padding:"11px 13px 13px", display:"flex", flexDirection:"column", gap:9 }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, color:"rgba(255,255,255,0.6)", lineHeight:1.7, letterSpacing:"0.03em" }}>{t("quest.unknown.line1")}</div>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:10, color:"rgba(255,255,255,0.6)", lineHeight:1.7, letterSpacing:"0.03em" }}>{t("quest.unknown.line2")}</div>
        <div style={{ borderTop:"1px solid rgba(148,163,184,0.15)", paddingTop:9, fontFamily:"Orbitron,sans-serif", fontSize:9.5, color:"rgba(250,204,21,0.75)", lineHeight:1.7, letterSpacing:"0.03em" }}>{t("quest.unknown.naming")}</div>
      </div>
    </div>
  );
}

export default function StarMapOverlay({ onClose }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(null);
  const [pinned,  setPinned]  = useState(null);
  const closeTimer = useRef(null);

  const openPanel   = (loc) => { clearTimeout(closeTimer.current); setHovered(loc); };
  const startClose  = ()    => { if (pinned) return; closeTimer.current = setTimeout(() => setHovered(null), 160); };
  const cancelClose = ()    => { clearTimeout(closeTimer.current); };
  const togglePin   = (loc) => {
    if (pinned?.id === loc.id) { setPinned(null); }
    else { clearTimeout(closeTimer.current); setHovered(loc); setPinned(loc); }
  };
  const closePanel  = ()    => { setPinned(null); setHovered(null); };

  const active = pinned ?? hovered;

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

      <div style={{ position:"absolute", inset:0 }} onClick={() => { closePanel(); onClose(); }} />

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
        <img
          src="/UI Globe Map_Fixed3.webp"
          alt="star map"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"fill", pointerEvents:"none" }}
        />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,4,18,0.1)", pointerEvents:"none" }} />

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

        {LOCATIONS.map(loc => {
          if (!loc.unknown) return null;
          const isActive = activeUnk?.id === loc.id;
          const isPinned = unkPinned?.id === loc.id;
          const len = loc.lineLen ?? 70;
          return (
            <div key={loc.id} style={{ position:"absolute", left:loc.left, top:loc.top, width:0, height:0, zIndex:80 }}>
              <div style={{
                position:"absolute",
                left:0, top: -len,
                width: 1.5, height: len,
                background: isPinned ? "rgba(250,204,21,0.8)" : "rgba(56,189,248,0.55)",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                transition: "background 0.15s",
              }} />
              <button
                className="map-dot"
                onMouseEnter={() => openUnk(loc)}
                onMouseLeave={closeUnk}
                onClick={() => toggleUnk(loc)}
                style={{
                  position:"absolute",
                  left: 0, top: -len,
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

        {active && (
          <div onMouseEnter={cancelClose} onMouseLeave={startClose}>
            <PlanetDetail loc={active} onClose={closePanel} />
          </div>
        )}

        {activeUnk && (
          <div onMouseEnter={cancelUnk} onMouseLeave={closeUnk}>
            <UnknownDropdown loc={activeUnk} onClose={closeUnkPanel} />
          </div>
        )}

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
              flexShrink: 0, marginLeft: 8,
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
