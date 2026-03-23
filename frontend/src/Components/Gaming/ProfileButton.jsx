/**
 * ProfileButton — avatar + name card, anchored at top-left frame notch.
 * Avatar and username pulled from Redux auth session + profile API.
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";

const SIZE = "8.5vh";

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
`;

export default function ProfileButton() {
  const navigate  = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data.user))
      .catch(() => {});
  }, [token]);

  const avatarSrc = profile?.Avatar
    ? `${BACKEND_BASE_URL}${profile.Avatar}`
    : "/avatar.png";

  const displayName = profile?.Email
    ? profile.Email.split("@")[0].replace(/[0-9]/g, "").toUpperCase() || "COMMANDER"
    : "COMMANDER";

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        position: "absolute",
        left: "6vw",
        top:  "5.5vh",
        transform: "translate(-50%, -35%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        pointerEvents: "auto",
      }}>

        {/* ── Avatar circle ── */}
        <img
          className="profile-circle"
          src={avatarSrc}
          alt="Profile"
          onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
          onClick={() => navigate("/Profile")}
          style={{
            width:  SIZE,
            height: SIZE,
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "center 10%",
            border: "2px solid rgba(0,212,255,0.7)",
            boxShadow: `
              0 0 0 1px rgba(0,212,255,0.2),
              0 0 16px rgba(0,212,255,0.35),
              0 0 5px rgba(0,0,0,0.9)
            `,
          }}
        />

        {/* ── Name card ── */}
        <div
          onClick={() => navigate("/Profile")}
          style={{
            background: "rgba(3,8,20,0.92)",
            border: "1px solid rgba(0,212,255,0.35)",
            borderRadius: "3px",
            padding: "4px 10px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 10px rgba(0,212,255,0.12)",
            minWidth: "max-content",
            cursor: "pointer",
          }}>
          <div style={{
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(4px,0.45vw,6px)",
            fontWeight: "bold",
            letterSpacing: "0.14em",
            color: "#00D4FF",
            textShadow: "0 0 8px rgba(0,212,255,0.6)",
            lineHeight: 1.3,
          }}>{displayName}</div>
          <div style={{
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(5px,0.5vw,6.5px)",
            letterSpacing: "0.1em",
            color: "rgba(148,192,210,0.65)",
            lineHeight: 1.3,
          }}>HYPER-TEK PLAYER</div>
        </div>

      </div>
    </>
  );
}
