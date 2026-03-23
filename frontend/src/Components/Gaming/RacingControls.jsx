/**
 * RacingControls — shown when RACING mode is active.
 * - Joystick: horizontal drag (left / right) to steer
 * - Speed Slider: vertical drag (up / down) to accelerate / brake
 */

import { useState, useRef, useCallback, useEffect } from "react";

/* ─── colours ────────────────────────────────────────── */
const C_GREEN  = "#22c55e";
const C_BLUE   = "#38bdf8";
const C_BG     = "rgba(0,18,10,0.88)";
const C_BORDER = "rgba(34,197,94,0.55)";

/* ─── CSS ─────────────────────────────────────────────── */
const CSS = `
  @keyframes rcFadeIn {
    from { opacity:0; transform: translateY(12px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .rc-joystick-wrap, .rc-speed-wrap {
    animation: rcFadeIn 0.35s ease both;
  }

  @keyframes rcArrowPulse {
    0%,100% { opacity: 0.35; }
    50%      { opacity: 0.85; }
  }
  .rc-arrow { animation: rcArrowPulse 1.6s ease-in-out infinite; }
  .rc-arrow-r { animation: rcArrowPulse 1.6s ease-in-out 0.4s infinite; }
  .rc-arrow-u { animation: rcArrowPulse 1.6s ease-in-out 0.2s infinite; }
  .rc-arrow-d { animation: rcArrowPulse 1.6s ease-in-out 0.8s infinite; }
`;

/* ══════════════════════════════════════════════════════
   Joystick
   ══════════════════════════════════════════════════════ */
function Joystick() {
  /* knobX: -1 (full left) → 0 (center) → +1 (full right) */
  const [knobX, setKnobX]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);

  /* Auto-return to center when released */
  useEffect(() => {
    if (!dragging && knobX !== 0) {
      const t = setTimeout(() => setKnobX(0), 220);
      return () => clearTimeout(t);
    }
  }, [dragging, knobX]);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    const track = trackRef.current.getBoundingClientRect();
    const half  = track.width / 2;

    const onMove = (me) => {
      const rel = (me.clientX - track.left - half) / half;
      setKnobX(Math.max(-1, Math.min(1, rel)));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, []);

  /* Touch */
  const onTouchStart = useCallback((e) => {
    setDragging(true);
    const track = trackRef.current.getBoundingClientRect();
    const half  = track.width / 2;
    const onMove = (te) => {
      const rel = (te.touches[0].clientX - track.left - half) / half;
      setKnobX(Math.max(-1, Math.min(1, rel)));
    };
    const onEnd = () => {
      setDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend",  onEnd);
  }, []);

  const TRACK_W = 130;
  const TRACK_H = 42;
  const KNOB_R  = 14;
  const travelX = (TRACK_W / 2 - KNOB_R - 6) * knobX;

  return (
    <div className="rc-joystick-wrap" style={{
      position: "absolute",
      left:   "4%",
      bottom: "16%",
      zIndex: 30,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      userSelect: "none",
      filter: `drop-shadow(0 0 10px rgba(34,197,94,0.25))`,
    }}>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        title="Drag left / right to steer"
        style={{
          position: "relative",
          width:  TRACK_W,
          height: TRACK_H,
          background: C_BG,
          border: `1.5px solid ${C_BORDER}`,
          borderRadius: TRACK_H / 2,
          boxShadow: `0 0 16px rgba(34,197,94,0.15), inset 0 2px 6px rgba(0,0,0,0.6)`,
          cursor: dragging ? "grabbing" : "grab",
          overflow: "visible",
        }}
      >
        {/* Center line */}
        <div style={{
          position: "absolute",
          left: "50%", top: "20%",
          width: 1, height: "60%",
          background: `rgba(34,197,94,0.3)`,
          transform: "translateX(-50%)",
        }} />

        {/* Knob */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width:  KNOB_R * 2,
          height: KNOB_R * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #4ade80, ${C_GREEN})`,
          border: `2px solid rgba(74,222,128,0.8)`,
          boxShadow: `0 0 12px rgba(34,197,94,0.7), 0 2px 6px rgba(0,0,0,0.5)`,
          transform: `translate(calc(-50% + ${travelX}px), -50%)`,
          transition: dragging ? "none" : "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Arrow indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "Orbitron, sans-serif",
        fontSize: 16, color: C_GREEN,
      }}>
        <span className="rc-arrow">◀</span>
        <span style={{
          fontSize: 7, letterSpacing: "0.15em",
          color: "rgba(34,197,94,0.55)", fontWeight: "bold",
        }}>STEER</span>
        <span className="rc-arrow-r">▶</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Speed Slider (vertical)
   ══════════════════════════════════════════════════════ */
function SpeedSlider() {
  /* 0 = full stop, 1 = full speed  (handle top = full speed) */
  const [speed, setSpeed]       = useState(0.4);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);

  const getSpeed = useCallback((clientY) => {
    const rect = trackRef.current.getBoundingClientRect();
    const rel  = 1 - (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(1, rel));
  }, []);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    setSpeed(getSpeed(e.clientY));

    const onMove = (me) => setSpeed(getSpeed(me.clientY));
    const onUp   = ()  => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [getSpeed]);

  const onTouchStart = useCallback((e) => {
    setDragging(true);
    setSpeed(getSpeed(e.touches[0].clientY));
    const onMove = (te) => setSpeed(getSpeed(te.touches[0].clientY));
    const onEnd  = ()  => {
      setDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend",  onEnd);
  }, [getSpeed]);

  const TRACK_H  = 160;
  const TRACK_W  = 24;
  const HANDLE_H = 22;
  const HANDLE_W = 38;
  const fillH    = Math.round(TRACK_H * speed);
  const knobTop  = (TRACK_H - HANDLE_H) * (1 - speed);

  const speedPct = Math.round(speed * 100);
  const speedColor = speed > 0.7
    ? "#f87171"
    : speed > 0.4
      ? "#facc15"
      : C_GREEN;

  return (
    <div className="rc-speed-wrap" style={{
      position: "absolute",
      right:  "10.5%",
      top:    "36%",
      zIndex: 30,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      userSelect: "none",
      filter: `drop-shadow(0 0 10px rgba(34,197,94,0.2))`,
    }}>

      {/* Speed % readout */}
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: 9, fontWeight: "bold",
        color: speedColor,
        letterSpacing: "0.12em",
        textShadow: `0 0 8px ${speedColor}`,
        minWidth: 44, textAlign: "center",
        transition: "color 0.3s",
      }}>{speedPct}%</div>

      {/* Up arrow */}
      <span className="rc-arrow-u" style={{
        fontSize: 14, color: C_GREEN,
        fontFamily: "Orbitron, sans-serif",
      }}>▲</span>

      {/* Track + handle */}
      <div style={{ position: "relative", width: HANDLE_W, height: TRACK_H }}>

        {/* Track groove */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          title="Drag up / down to control speed"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            width: TRACK_W,
            height: TRACK_H,
            background: "rgba(0,20,10,0.9)",
            border: `1.5px solid ${C_BORDER}`,
            borderRadius: 4,
            boxShadow: `0 0 14px rgba(34,197,94,0.12), inset 0 2px 8px rgba(0,0,0,0.6)`,
            cursor: dragging ? "grabbing" : "grab",
            overflow: "hidden",
          }}
        >
          {/* Filled portion (speed bar) */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: fillH,
            background: `linear-gradient(to top, ${speedColor}cc, ${speedColor}44)`,
            transition: dragging ? "none" : "height 0.1s, background 0.3s",
          }} />

          {/* Notch lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <div key={f} style={{
              position: "absolute",
              bottom: `${f * 100}%`,
              left: "10%", right: "10%",
              height: 1,
              background: "rgba(34,197,94,0.2)",
            }} />
          ))}
        </div>

        {/* Handle */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            position: "absolute",
            left: "50%",
            top:  knobTop,
            transform: "translateX(-50%)",
            width:  HANDLE_W,
            height: HANDLE_H,
            background: "linear-gradient(180deg, #1e3a5f, #0a1e36)",
            border: `1.5px solid rgba(56,189,248,0.7)`,
            borderRadius: 3,
            boxShadow: `0 0 10px rgba(56,189,248,0.4), 0 2px 6px rgba(0,0,0,0.6)`,
            cursor: dragging ? "grabbing" : "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: dragging ? "none" : "top 0.1s",
            zIndex: 2,
          }}
        >
          {/* Grip lines */}
          {[-3, 0, 3].map(d => (
            <div key={d} style={{
              position: "absolute",
              top: "50%",
              left: "20%", right: "20%",
              height: 1.5,
              background: `rgba(56,189,248,0.5)`,
              transform: `translateY(${d}px)`,
            }} />
          ))}
        </div>
      </div>

      {/* Down arrow */}
      <span className="rc-arrow-d" style={{
        fontSize: 14, color: C_GREEN,
        fontFamily: "Orbitron, sans-serif",
      }}>▼</span>

      {/* Label */}
      <div style={{
        fontFamily: "Orbitron, sans-serif",
        fontSize: 7, fontWeight: "bold",
        color: "rgba(34,197,94,0.55)",
        letterSpacing: "0.15em",
      }}>SPEED</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Export
   ══════════════════════════════════════════════════════ */
export default function RacingControls() {
  return (
    <>
      <style>{CSS}</style>
      <Joystick />
      <SpeedSlider />
    </>
  );
}
