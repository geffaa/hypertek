/**
 * MiniMap — HUD circular minimap positioned in the top-left area of the frame.
 *
 * - Outer ring: fixed compass (N/S/E/W stays oriented to screen)
 * - Inner disc: rotates with `rotation` prop (synced to in-game camera)
 * - Click + drag on the map to simulate rotation (demo)
 */

import { useState, useCallback } from "react";
import useMobileLandscape from "../../hooks/useMobileLandscape";

const C  = "#00D4FF";
const CG = "#00EEFF";
const CA = "#00FFFF";
const SZ = 150;          // SVG viewBox dimension
const CX = 75;           // center
const R_OUTER = 70;      // outer border radius
const R_CLIP  = 62;      // clip circle for terrain

const CSS = `
  @keyframes mapPing {
    0%   { r: 3; opacity: 0.9; }
    100% { r: 9; opacity: 0; }
  }
  .map-ping { animation: mapPing 2s ease-out infinite; }
  .map-ping-2 { animation: mapPing 2s ease-out 0.7s infinite; }
  .map-ping-3 { animation: mapPing 2s ease-out 1.4s infinite; }

  @keyframes mapSweep {
    from { transform: rotate(0deg); transform-origin: 75px 75px; }
    to   { transform: rotate(360deg); transform-origin: 75px 75px; }
  }
  .map-sweep { animation: mapSweep 4s linear infinite; }

  .minimap-wrap {
    transition: box-shadow 0.2s;
    cursor: grab;
  }
  .minimap-wrap:active { cursor: grabbing; }
`;

// Terrain elements drawn inside the rotating inner disc
function Terrain() {
  return (
    <g>
      {/* Base map fill */}
      <circle cx={CX} cy={CX} r={R_CLIP} fill="#060d1a" />

      {/* Grid lines */}
      {[-30,-15,0,15,30].map(d => (
        <g key={d} stroke="#00D4FF" strokeWidth="0.4" strokeOpacity="0.12">
          <line x1={CX+d} y1={CX-R_CLIP} x2={CX+d} y2={CX+R_CLIP} />
          <line x1={CX-R_CLIP} y1={CX+d} x2={CX+R_CLIP} y2={CX+d} />
        </g>
      ))}

      {/* "Road" paths */}
      <path d="M35,45 Q55,60 75,75 T115,100" stroke="#00D4FF" strokeWidth="1.2"
        strokeOpacity="0.35" fill="none" strokeLinecap="round" />
      <path d="M45,105 Q65,85 75,75 T100,50" stroke="#00D4FF" strokeWidth="0.8"
        strokeOpacity="0.25" fill="none" strokeLinecap="round" />

      {/* Terrain blocks — mountains */}
      {[
        [32,35], [38,28], [25,48],
        [110,55],[118,48],[112,62],
        [50,110],[58,118],[44,106],
      ].map(([x,y],i) => (
        <polygon key={i}
          points={`${x},${y+8} ${x+6},${y} ${x+12},${y+8}`}
          fill="#0e2a1a" stroke="#22c55e" strokeWidth="0.6" strokeOpacity="0.4"
        />
      ))}

      {/* Forest dots */}
      {[
        [90,38],[95,43],[85,43],
        [55,90],[60,96],[50,94],
        [100,100],[108,95],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3.5"
          fill="#0a2010" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.5" />
      ))}

      {/* Enemy markers */}
      <polygon points="105,78 108,84 102,84"
        fill="#f87171" fillOpacity="0.7" />
      <polygon points="42,65  45,71  39,71"
        fill="#f87171" fillOpacity="0.5" />

      {/* Ally base */}
      <rect x="68" y="42" width="8" height="8" rx="1"
        fill="#0a2030" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.7" />

      {/* Radar sweep */}
      <defs>
        <radialGradient id="sweep-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CA} stopOpacity="0.25" />
          <stop offset="100%" stopColor={CA} stopOpacity="0" />
        </radialGradient>
        <clipPath id="terrain-clip">
          <circle cx={CX} cy={CX} r={R_CLIP} />
        </clipPath>
      </defs>
      <g className="map-sweep" clipPath="url(#terrain-clip)">
        <path
          d={`M${CX},${CX} L${CX},${CX-R_CLIP} A${R_CLIP},${R_CLIP} 0 0,1 ${CX+R_CLIP*Math.sin(Math.PI/4)},${CX-R_CLIP*Math.cos(Math.PI/4)} Z`}
          fill="url(#sweep-grad)"
        />
      </g>
    </g>
  );
}

export default function MiniMap({ rotation: externalRotation }) {
  const isMobile = useMobileLandscape();
  const [rotation, setRotation] = useState(externalRotation ?? 0);
  const sz = isMobile ? 90 : SZ;

  // Click-drag to manually rotate the map (demo interaction)
  const onMouseDown = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRot   = rotation;

    const onMove = (me) => {
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      setRotation(startRot + (angle - startAngle));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [rotation]);

  return (
    <>
      <style>{CSS}</style>

      <div
        className="minimap-wrap"
        onMouseDown={onMouseDown}
        title="Drag to rotate map"
        style={{
          position: "absolute",
          left:  "4%",
          top:   isMobile ? "80px" : "22vh",
          width:  `${sz}px`,
          height: `${sz}px`,
          zIndex: 20,
          userSelect: "none",
          filter: "drop-shadow(0 0 8px rgba(0,212,255,0.3))",
        }}
      >
        <svg
          width={sz} height={sz}
          viewBox={`0 0 ${SZ} ${SZ}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <clipPath id="map-outer-clip">
              <circle cx={CX} cy={CX} r={R_CLIP} />
            </clipPath>
            {/* Outer ring fade */}
            <radialGradient id="rim-grad" cx="50%" cy="50%" r="50%">
              <stop offset="80%"  stopColor="#060d1a" stopOpacity="0" />
              <stop offset="100%" stopColor="#060d1a" stopOpacity="0.6" />
            </radialGradient>
            {/* Compass label glow */}
            <filter id="compassGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Outer glow rings ── */}
          <circle cx={CX} cy={CX} r={R_OUTER+4} fill="none"
            stroke={CG} strokeWidth="6" strokeOpacity="0.08" />
          <circle cx={CX} cy={CX} r={R_OUTER} fill="none"
            stroke={C} strokeWidth="1.5" strokeOpacity="0.9" />
          <circle cx={CX} cy={CX} r={R_OUTER-4} fill="none"
            stroke={C} strokeWidth="0.5" strokeOpacity="0.3" />

          {/* ── Tick marks on outer ring ── */}
          {Array.from({length:36}, (_,i) => {
            const a   = (i * 10) * Math.PI / 180;
            const isMajor = i % 9 === 0;
            const r1  = R_OUTER - (isMajor ? 8 : 4);
            const r2  = R_OUTER - 1;
            return (
              <line key={i}
                x1={CX + r1*Math.sin(a)} y1={CX - r1*Math.cos(a)}
                x2={CX + r2*Math.sin(a)} y2={CX - r2*Math.cos(a)}
                stroke={C} strokeWidth={isMajor ? 1.2 : 0.6}
                strokeOpacity={isMajor ? 0.8 : 0.35}
              />
            );
          })}

          {/* ── Rotating terrain inner disc ── */}
          <g transform={`rotate(${rotation} ${CX} ${CX})`}
             clipPath="url(#map-outer-clip)">
            <Terrain />
          </g>

          {/* ── Rim fade overlay (fixed) ── */}
          <circle cx={CX} cy={CX} r={R_CLIP} fill="url(#rim-grad)" />

          {/* ── Player marker — always points up (fixed, center) ── */}
          <polygon
            points={`${CX},${CX-9} ${CX+5},${CX+5} ${CX-5},${CX+5}`}
            fill={CA} fillOpacity="0.9"
          />
          <circle cx={CX} cy={CX} r="2.5" fill={CA} />

          {/* ── Ping circles (fixed position on screen) ── */}
          <circle className="map-ping"   cx="95" cy="55" r="3" fill="none" stroke="#f87171" strokeWidth="1" />
          <circle className="map-ping-2" cx="48" cy="68" r="3" fill="none" stroke="#f87171" strokeWidth="1" />
          <circle className="map-ping-3" cx="72" cy="45" r="3" fill="none" stroke="#38bdf8" strokeWidth="1" />

          {/* ── Fixed compass labels ── */}
          {[["N", 0], ["E", 90], ["S", 180], ["W", 270]].map(([label, deg]) => {
            const a    = deg * Math.PI / 180;
            const dist = R_OUTER + 13;
            const isN  = label === "N";
            return (
              <text key={label}
                x={CX + dist*Math.sin(a)}
                y={CX - dist*Math.cos(a) + 4}
                textAnchor="middle"
                fill={isN ? "#FFFFFF" : CA}
                fontSize={isN ? 12 : 10}
                fontFamily="Orbitron,sans-serif"
                fontWeight="bold"
                letterSpacing="0"
                filter="url(#compassGlow)"
                opacity={isN ? 1 : 0.9}
              >{label}</text>
            );
          })}

          {/* ── MAP label ── */}
          <text x={CX} y={SZ-4} textAnchor="middle"
            fill={C} fontSize="5.5" fontFamily="Orbitron,sans-serif"
            letterSpacing="0.2em" opacity="0.5">MAP</text>
        </svg>
      </div>
    </>
  );
}
