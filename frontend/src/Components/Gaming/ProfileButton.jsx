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
    border-color: rgba(0,212,255,0.7) !important;
    box-shadow: 0 0 12px rgba(0,212,255,0.35) !important;
    background: rgba(0,212,255,0.08) !important;
  }
  @keyframes avatarPanelIn {
    from { opacity:0; transform: translateY(-10px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }
  .avatar-panel { animation: avatarPanelIn 0.2s ease both; }
`;

/* ── Equipment slot component ── */
function Slot({ label, size = 54, icon = null }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div className="equip-slot" style={{
        width: size, height: size,
        border: "1.5px solid rgba(0,212,255,0.25)",
        borderRadius: 5,
        background: "rgba(3,10,28,0.85)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 6px rgba(0,212,255,0.08)",
        fontSize: 20,
      }}>
        {icon || (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2"
              stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="3 2"/>
          </svg>
        )}
      </div>
      <span style={{
        fontFamily: "Orbitron,sans-serif", fontSize: 6, fontWeight: "bold",
        letterSpacing: "0.1em", color: "rgba(157,216,240,0.55)",
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

  const avatarSrc   = profile?.Avatar ? `${BACKEND_BASE_URL}${profile.Avatar}` : "/avatar.png";
  const displayName = profile?.Email
    ? profile.Email.split("@")[0].replace(/[0-9]/g, "").toUpperCase() || "COMMANDER"
    : "COMMANDER";

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
            fontSize: "clamp(4px,0.45vw,6px)", fontWeight: "bold",
            letterSpacing: "0.14em", color: "#00D4FF",
            textShadow: "0 0 8px rgba(0,212,255,0.6)", lineHeight: 1.3,
          }}>{displayName}</div>
          <div style={{
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(5px,0.5vw,6.5px)", letterSpacing: "0.1em",
            color: "rgba(148,192,210,0.65)", lineHeight: 1.3,
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
            width: isMobile ? 185 : 260,
            background: "rgba(4,10,26,0.97)",
            border: "1px solid rgba(0,212,255,0.25)",
            borderRadius: 8,
            backdropFilter: "blur(18px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
            padding: isMobile ? "8px 8px 8px" : "14px 12px 12px",
            zIndex: 40,
          }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: isMobile ? 6 : 12 }}>
              <span style={{
                fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 6 : 7.5, fontWeight:"bold",
                letterSpacing:"0.14em", color:"#00D4FF",
                textShadow:"0 0 8px rgba(0,212,255,0.5)",
              }}>AVATAR</span>
              <button onClick={() => setOpen(false)} style={{
                background:"none", border:"none", color:"rgba(157,216,240,0.4)",
                fontSize: isMobile ? 12 : 15, cursor:"pointer", lineHeight:1, padding:"0 2px",
              }}>×</button>
            </div>

            {/* ── Equipment layout ── */}
            <div style={{ display:"flex", gap: isMobile ? 5 : 8, alignItems:"center", justifyContent:"center" }}>

              {/* Left: Weapon / Suit / Boots */}
              <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 5 : 8, alignItems:"center" }}>
                <Slot label="Weapon" size={isMobile ? 36 : 52} />
                <Slot label="Suit"   size={isMobile ? 36 : 52} />
                <Slot label="Boots"  size={isMobile ? 36 : 52} />
              </div>

              {/* Center: Character / Avatar */}
              <div style={{
                width: isMobile ? 55 : 80, flexShrink:0,
                display:"flex", flexDirection:"column", alignItems:"center", gap: isMobile ? 4 : 6,
              }}>
                <div style={{
                  width: isMobile ? 55 : 80, height: isMobile ? 82 : 120,
                  background: "radial-gradient(ellipse at 50% 30%, rgba(0,212,255,0.1), transparent 70%)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 6,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  overflow:"hidden",
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
                  fontFamily:"Orbitron,sans-serif", fontSize: isMobile ? 4.5 : 5.5, fontWeight:"bold",
                  letterSpacing:"0.1em", color:"rgba(0,212,255,0.6)",
                  textAlign:"center",
                }}>{displayName}</span>
              </div>

              {/* Right: Helmet / Gloves */}
              <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 5 : 8, alignItems:"center", justifyContent:"center" }}>
                <Slot label="Helmet" size={isMobile ? 36 : 52} />
                <Slot label="Gloves" size={isMobile ? 36 : 52} />
              </div>

            </div>

            {/* Divider */}
            <div style={{ height:1, background:"rgba(0,212,255,0.1)", margin: isMobile ? "6px 0 6px" : "12px 0 10px" }}/>

            {/* ── Bottom row: Flag / Staff / Badge / Power ── */}
            <div style={{ display:"flex", justifyContent:"space-between", gap: isMobile ? 4 : 6 }}>
              {["Flag","Staff","Badge","Power"].map(label => (
                <Slot key={label} label={label} size={isMobile ? 30 : 48} />
              ))}
            </div>

          </div>
        )}

      </div>
    </>
  );
}
