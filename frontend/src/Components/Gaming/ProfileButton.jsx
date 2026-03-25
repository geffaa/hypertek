/**
 * ProfileButton — avatar card top-left.
 * Clicking opens the Avatar Equipment panel (Don's brief):
 *   • 5 slots around character: Helmet, Weapon, Gloves, Suit, Boots
 *   • 4 slots below: Flag, Staff, Badge, Power
 */

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import useMobileLandscape from "../../hooks/useMobileLandscape";


const CSS = `
  .profile-circle {
    transition: box-shadow 0.22s, transform 0.22s;
    cursor: pointer;
    display: block;
  }
  .profile-circle:hover {
    transform: scale(1.06);
    box-shadow:
      0 0 0 2px #00D4FF,
      0 0 24px rgba(0,212,255,0.65),
      0 0 6px rgba(0,0,0,0.9) !important;
  }
  .equip-slot {
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    cursor: pointer;
  }
  .equip-slot:hover {
    border-color: rgba(0,212,255,0.85) !important;
    box-shadow: 0 0 20px rgba(0,212,255,0.5), 0 0 8px rgba(0,212,255,0.3) !important;
    transform: scale(1.06);
  }
  @keyframes avatarPanelIn {
    from { opacity:0; transform: translateY(-10px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }
  .avatar-panel { animation: avatarPanelIn 0.2s ease both; }
`;

/* ── Slot icons map ── */
const SLOT_ICONS = {
  Weapon:  { emoji: "⚔️",  color: "#f87171" },
  Suit:    { emoji: "🥋",  color: "#38bdf8" },
  Boots:   { emoji: "👢",  color: "#fb923c" },
  Helmet:  { emoji: "⛑️",  color: "#fcd34d" },
  Gloves:  { emoji: "🧤",  color: "#a78bfa" },
  Flag:    { emoji: "🚩",  color: "#f87171" },
  Staff:   { emoji: "🪄",  color: "#c4b5fd" },
  Badge:   { emoji: "🏅",  color: "#fcd34d" },
  Power:   { emoji: "⚡",  color: "#38bdf8" },
};

/* ── Equipment slot component ── */
function Slot({ label, size = 54 }) {
  const slot = SLOT_ICONS[label] || { emoji: "❓", color: "#00D4FF" };
  const iconSize = Math.round(size * 0.52);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
      <div className="equip-slot" style={{
        width: size, height: size,
        border: `1.5px solid ${slot.color}55`,
        borderRadius: 6,
        background: `radial-gradient(circle at 40% 35%, ${slot.color}18, rgba(3,10,28,0.92))`,
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 10px ${slot.color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
        fontSize: iconSize,
        lineHeight: 1,
        position: "relative",
      }}>
        {slot.emoji}
        {/* locked overlay */}
        <div style={{
          position:"absolute", inset:0, borderRadius:6,
          background:"rgba(0,0,0,0.45)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: Math.round(size * 0.3),
        }}>🔒</div>
      </div>
      <span style={{
        fontFamily: "Orbitron,sans-serif", fontSize: size >= 48 ? 9 : 7, fontWeight: "bold",
        letterSpacing: "0.08em", color: slot.color,
        textShadow: `0 0 6px ${slot.color}66`,
      }}>{label.toUpperCase()}</span>
    </div>
  );
}

export default function ProfileButton() {
  const isMobile = useMobileLandscape();
  const SIZE = isMobile ? "36px" : "8.5vh";

  const { token }   = useSelector((s) => s.auth);
  const [profile,   setProfile]   = useState(null);
  const [open,      setOpen]      = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data.user))
      .catch(() => {});
  }, [token]);

  /* close panel on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const avatarSrc = profile?.Avatar ? `${BACKEND_BASE_URL}${profile.Avatar}` : "/avatar.png";

  const getDisplayName = () =>
    localStorage.getItem("hypertek_display_name") ||
    (profile?.Email ? profile.Email.split("@")[0].replace(/[0-9]/g, "").toUpperCase() || "COMMANDER" : "COMMANDER");

  const [displayName, setDisplayName] = useState(getDisplayName);

  // Update name when profile loads or when changed from Settings
  useEffect(() => { setDisplayName(getDisplayName()); }, [profile]);

  useEffect(() => {
    const handler = (e) => setDisplayName(e.detail || getDisplayName());
    window.addEventListener("hypertek_name_changed", handler);
    return () => window.removeEventListener("hypertek_name_changed", handler);
  }, []);

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
          src={avatarSrc}
          alt="Profile"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
          onClick={() => setOpen(o => !o)}
          style={{
            width: SIZE, height: SIZE, borderRadius: "50%",
            objectFit: "cover", objectPosition: "center 10%",
            border: "2px solid rgba(0,212,255,0.7)",
            boxShadow: `
              0 0 0 1px rgba(0,212,255,0.2),
              0 0 16px rgba(0,212,255,0.35),
              0 0 5px rgba(0,0,0,0.9)
            `,
          }}
        />

        {/* ── Name card — hidden on mobile landscape ── */}
        {!isMobile && <div onClick={() => setOpen(o => !o)} style={{
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
            fontSize: "clamp(7px,0.6vw,9px)", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.75)", lineHeight: 1.3,
          }}>HYPER-TEK PLAYER</div>
        </div>}

        {/* ══════════════════════════════════════════
            AVATAR EQUIPMENT PANEL (dropdown)
            ══════════════════════════════════════════ */}
        {open && (
          <div className="avatar-panel" style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            width: isMobile ? 240 : 360,
            background: "rgba(4,10,26,0.97)",
            border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: 10,
            backdropFilter: "blur(18px)",
            boxShadow: "0 12px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.1)",
            padding: isMobile ? "10px 10px 10px" : "18px 16px 14px",
            zIndex: 40,
          }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: isMobile ? 6 : 12 }}>
              <span style={{
                fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 9 : 12, fontWeight:"bold",
                letterSpacing:"0.14em", color:"#00D4FF",
                textShadow:"0 0 10px rgba(0,212,255,0.7)",
              }}>AVATAR</span>
              <button onClick={() => setOpen(false)} style={{
                background:"none", border:"none", color:"rgba(255,255,255,0.65)",
                fontSize: isMobile ? 14 : 18, cursor:"pointer", lineHeight:1, padding:"0 2px",
              }}>×</button>
            </div>

            {/* ── Equipment layout ── */}
            <div style={{ display:"flex", gap: isMobile ? 5 : 8, alignItems:"center", justifyContent:"center" }}>

              {/* Left: Weapon / Suit / Boots */}
              <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 6 : 10, alignItems:"center" }}>
                <Slot label="Weapon" size={isMobile ? 46 : 68} />
                <Slot label="Suit"   size={isMobile ? 46 : 68} />
                <Slot label="Boots"  size={isMobile ? 46 : 68} />
              </div>

              {/* Center: Character / Avatar */}
              <div style={{
                flex: 1, flexShrink:0,
                display:"flex", flexDirection:"column", alignItems:"center", gap: isMobile ? 5 : 8,
              }}>
                <div style={{
                  width: isMobile ? 70 : 110, height: isMobile ? 100 : 160,
                  background: "radial-gradient(ellipse at 50% 30%, rgba(0,212,255,0.15), transparent 70%)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  borderRadius: 8,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  overflow:"hidden",
                  boxShadow: "0 0 20px rgba(0,212,255,0.1)",
                }}>
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center top",
                    }}
                  />
                </div>
                <span style={{
                  fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 8 : 11, fontWeight:"bold",
                  letterSpacing:"0.1em", color:"#00D4FF",
                  textAlign:"center", textShadow:"0 0 8px rgba(0,212,255,0.5)",
                }}>{displayName}</span>
              </div>

              {/* Right: Helmet / Gloves */}
              <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 6 : 10, alignItems:"center", justifyContent:"center" }}>
                <Slot label="Helmet" size={isMobile ? 46 : 68} />
                <Slot label="Gloves" size={isMobile ? 46 : 68} />
              </div>

            </div>

            {/* Divider */}
            <div style={{ height:1, background:"rgba(0,212,255,0.1)", margin: isMobile ? "6px 0 6px" : "12px 0 10px" }}/>

            {/* ── Bottom row: Flag / Staff / Badge / Power ── */}
            <div style={{ display:"flex", justifyContent:"space-around", gap: isMobile ? 4 : 8 }}>
              {["Flag","Staff","Badge","Power"].map(label => (
                <Slot key={label} label={label} size={isMobile ? 44 : 64} />
              ))}
            </div>

          </div>
        )}

      </div>
    </>
  );
}
