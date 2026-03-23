/**
 * TopBar — HUD strip.
 * WALLET: inline modal (MetaMask), stays on Gaming page.
 * MARKETPLACE: dropdown → navigates to /market-place?tab=X
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/AuthSlice";
import symbol from "../../assets/images/login/Symbol.svg.png";

const RESOURCES = [
  {
    id: "FOOD", label: "Food", value: "61.7M", color: "#6ee7b7",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <line x1="16" y1="28" x2="16" y2="8" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="16" cy="7"  rx="3" ry="5" fill="#6ee7b7" fillOpacity="0.85" transform="rotate(-20,16,7)"/>
        <ellipse cx="11" cy="12" rx="2.5" ry="4.5" fill="#6ee7b7" fillOpacity="0.7" transform="rotate(-40,11,12)"/>
        <ellipse cx="21" cy="12" rx="2.5" ry="4.5" fill="#6ee7b7" fillOpacity="0.7" transform="rotate(40,21,12)"/>
        <ellipse cx="13" cy="17" rx="2" ry="3.5" fill="#6ee7b7" fillOpacity="0.5" transform="rotate(-30,13,17)"/>
        <ellipse cx="19" cy="17" rx="2" ry="3.5" fill="#6ee7b7" fillOpacity="0.5" transform="rotate(30,19,17)"/>
      </svg>
    ),
  },
  {
    id: "OIL", label: "Oil", value: "59.8M", color: "#94a3b8",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <rect x="8"  y="12" width="14" height="14" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5"/>
        <rect x="11" y="8"  width="8"  height="5"  rx="1" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2"/>
        <path d="M15 6 H22 V10" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <text x="15" y="23" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">OIL</text>
      </svg>
    ),
  },
  {
    id: "CRYSTALS", label: "Crystals", value: "3.4M", color: "#c4b5fd",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 24,10 24,22 16,29 8,22 8,10" fill="#4c1d95" fillOpacity="0.5" stroke="#c4b5fd" strokeWidth="1.5"/>
        <polygon points="16,3  24,10 16,16" fill="#c4b5fd" fillOpacity="0.28"/>
        <polygon points="8,10  16,16 16,29" fill="#7c3aed" fillOpacity="0.2"/>
        <line x1="8" y1="10" x2="24" y2="10" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="0.8"/>
        <circle cx="16" cy="16" r="1.5" fill="#c4b5fd" fillOpacity="0.7"/>
      </svg>
    ),
  },
  {
    id: "FUEL", label: "Fuel", value: "102.6M", color: "#fb923c",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <rect x="7"  y="10" width="13" height="18" rx="2" fill="#431407" stroke="#fb923c" strokeWidth="1.5"/>
        <rect x="20" y="14" width="5"  height="8"  rx="1.5" fill="#431407" stroke="#fb923c" strokeWidth="1.2"/>
        <path d="M13 10 V6 H18 V10" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="9" y="14" width="9" height="4" rx="1" fill="#fb923c" fillOpacity="0.25"/>
      </svg>
    ),
  },
  {
    id: "ALLOYS", label: "Alloys", value: "73.5M", color: "#cbd5e1",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5"/>
        <polygon points="16,9 23,13 23,19 16,23 9,19 9,13" fill="#334155" stroke="#cbd5e1" strokeOpacity="0.5" strokeWidth="1"/>
        <circle cx="16" cy="16" r="3" fill="#cbd5e1" fillOpacity="0.75"/>
      </svg>
    ),
  },
  {
    id: "GOLD", label: "Gold", value: "1.3B", color: "#fcd34d",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="11" fill="#78350f" stroke="#fcd34d" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="7.5" fill="#92400e" stroke="#fcd34d" strokeOpacity="0.4" strokeWidth="0.8"/>
        <text x="16" y="21" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="bold" fontFamily="Georgia,serif">G</text>
      </svg>
    ),
  },
  {
    id: "DIAMONDS", label: "Diamonds", value: "6.6M", color: "#67e8f9",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 27,13 16,29 5,13" fill="#0e7490" fillOpacity="0.4" stroke="#67e8f9" strokeWidth="1.5"/>
        <polygon points="16,3  27,13 16,16" fill="#67e8f9" fillOpacity="0.22"/>
        <polygon points="5,13  16,16 16,29" fill="#0891b2" fillOpacity="0.18"/>
        <line x1="5" y1="13" x2="27" y2="13" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.55"/>
        <circle cx="16" cy="12" r="1.5" fill="#67e8f9" fillOpacity="0.9"/>
      </svg>
    ),
  },
  {
    id: "H-BUCKS", label: "H-Bucks", value: "$139,845", color: "#86efac",
    svg: (
      <svg viewBox="0 0 32 32" fill="none">
        <rect x="4"  y="9"  width="24" height="15" rx="3" fill="#14532d" stroke="#86efac" strokeWidth="1.5"/>
        <rect x="4"  y="13" width="24" height="1.5" fill="#86efac" fillOpacity="0.12"/>
        <rect x="4"  y="19" width="24" height="1.5" fill="#86efac" fillOpacity="0.12"/>
        <circle cx="16" cy="16.5" r="4" fill="#166534" stroke="#86efac" strokeWidth="0.8"/>
        <text x="16" y="20" textAnchor="middle" fill="#86efac" fontSize="8" fontWeight="bold" fontFamily="monospace">$</text>
      </svg>
    ),
  },
];

const MARKET_ITEMS = [
  { label: "Overview",  tab: "overview"  },
  { label: "Auction",   tab: "auctions"  },
  { label: "Quests",    tab: "quests"    },
  { label: "For Hire",  tab: "hire"      },
  { label: "Bounty",    tab: "bounty"    },
  { label: "My Market", tab: "mymarket"  },
];

const CSS = `
  .res-slot {
    transition: background 0.15s, color 0.15s;
  }
  .res-slot:hover {
    background: rgba(0,212,255,0.09) !important;
    color: #fff !important;
  }
  button.res-slot:hover {
    box-shadow: 0 0 18px rgba(0,212,255,0.35), inset 0 1px 0 rgba(0,212,255,0.2) !important;
    border-color: rgba(0,212,255,0.9) !important;
  }
  .logout-btn:hover {
    box-shadow: 0 0 22px rgba(248,113,113,0.55), inset 0 1px 0 rgba(255,255,255,0.1) !important;
    transform: scale(1.07);
    border-color: #f87171 !important;
    color: #fff !important;
  }
  .market-dropdown-item {
    transition: background 0.14s, color 0.14s;
    cursor: pointer;
  }
  .market-dropdown-item:hover {
    background: rgba(0,212,255,0.12) !important;
    color: #fff !important;
  }
  @keyframes dropdownFade {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .market-dropdown { animation: dropdownFade 0.18s ease both; }

  @keyframes walletModalFade {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  .wallet-modal { animation: walletModalFade 0.22s ease both; }

  @keyframes spinLoader {
    to { transform: rotate(360deg); }
  }
  .wallet-spinner { animation: spinLoader 0.9s linear infinite; }
`;

const NAV_BTN = {
  height: "3.6vh",
  padding: "0 16px",
  background: "linear-gradient(180deg, rgba(0,30,55,0.95) 0%, rgba(0,15,35,0.98) 100%)",
  border: "1px solid rgba(0,212,255,0.55)",
  borderRadius: "3px",
  color: "#00D4FF",
  fontFamily: "Orbitron,sans-serif",
  fontSize: "clamp(7px,0.65vw,9px)",
  fontWeight: "bold",
  letterSpacing: "0.14em",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  boxShadow: "0 0 10px rgba(0,212,255,0.18), inset 0 1px 0 rgba(0,212,255,0.12)",
  textShadow: "0 0 8px rgba(0,212,255,0.6)",
  transition: "background 0.15s, box-shadow 0.15s, color 0.15s",
};

export default function TopBar() {
  const ICON_SIZE = "3.2vh";
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  // ── Marketplace dropdown ─────────────────────────────────────────
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef = useRef(null);

  // ── Wallet modal ─────────────────────────────────────────────────
  const [walletOpen,    setWalletOpen]    = useState(false);
  const [account,       setAccount]       = useState(null);
  const [isConnecting,  setIsConnecting]  = useState(false);
  const [connected,     setConnected]     = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (marketRef.current && !marketRef.current.contains(e.target)) {
        setMarketOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleMarketNav = (tab) => {
    setMarketOpen(false);
    window.open(`/market-place?tab=${tab}`, "_blank");
  };

  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }
    if (isConnecting) return;
    try {
      setIsConnecting(true);
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        setTimeout(() => setWalletOpen(false), 1200);
      }
    } catch (err) {
      console.error("MetaMask error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortAddr = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Full-width HUD row ── */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "15%",
        right: "13%",
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>

        {/* 1. RESOURCES label */}
        <button className="res-slot" style={{ ...NAV_BTN, flexShrink: 0 }}>RESOURCES</button>

        {/* 2. Resource slots */}
        <div style={{
          flex: 1,
          height: "3.6vh",
          display: "flex",
          alignItems: "stretch",
          background: "rgba(3,8,18,0.92)",
          border: "1px solid rgba(0,212,255,0.18)",
          borderRadius: "3px",
          backdropFilter: "blur(14px)",
          overflow: "hidden",
          minWidth: 0,
        }}>
          {RESOURCES.map((r, i) => (
            <div key={r.id} className="res-slot" title={r.label} style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "0 8px",
              borderRight: i < RESOURCES.length - 1 ? "1px solid rgba(0,212,255,0.1)" : "none",
              minWidth: 0,
            }}>
              <div style={{ flexShrink: 0, width: ICON_SIZE, height: ICON_SIZE, minWidth: "14px" }}>
                {r.svg}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: "clamp(4px,0.42vw,5.5px)",
                  letterSpacing: "0.08em",
                  color: "rgba(148,192,210,0.5)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginBottom: "2px",
                  whiteSpace: "nowrap",
                }}>{r.label}</div>
                <div style={{
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: "clamp(7px,0.7vw,9px)",
                  fontWeight: "bold",
                  letterSpacing: "0.05em",
                  color: r.color,
                  textShadow: `0 0 6px ${r.color}88`,
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}>{r.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. MARKETPLACE — dropdown */}
        <div ref={marketRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            className="res-slot"
            onClick={() => setMarketOpen(o => !o)}
            style={{
              ...NAV_BTN,
              borderColor: marketOpen ? "rgba(0,212,255,0.9)" : "rgba(0,212,255,0.55)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            MARKETPLACE
            <span style={{
              fontSize: "8px",
              transition: "transform 0.18s",
              transform: marketOpen ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}>▼</span>
          </button>

          {marketOpen && (
            <div className="market-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: "160px",
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(0,212,255,0.35)",
              borderRadius: "4px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
              zIndex: 100,
              overflow: "hidden",
            }}>
              {MARKET_ITEMS.map((item, i) => (
                <div
                  key={item.tab}
                  className="market-dropdown-item"
                  onClick={() => handleMarketNav(item.tab)}
                  style={{
                    padding: "9px 16px",
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: "clamp(6px,0.6vw,8px)",
                    fontWeight: "bold",
                    letterSpacing: "0.12em",
                    color: "#7dd3fc",
                    borderBottom: i < MARKET_ITEMS.length - 1 ? "1px solid rgba(0,212,255,0.08)" : "none",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. WALLET — inline modal */}
        <button
          className="res-slot"
          onClick={() => setWalletOpen(true)}
          style={{
            ...NAV_BTN,
            flexShrink: 0,
            borderColor: connected ? "rgba(34,197,94,0.7)" : "rgba(0,212,255,0.55)",
            color: connected ? "#4ade80" : "#00D4FF",
            textShadow: connected ? "0 0 8px rgba(34,197,94,0.6)" : "0 0 8px rgba(0,212,255,0.6)",
          }}
        >
          {connected ? (shortAddr || "CONNECTED") : "WALLET"}
        </button>

      </div>

      {/* ── LOG OUT button ── */}
      <button className="logout-btn" style={{
        position: "absolute",
        top: "1vh",
        right: "2%",
        zIndex: 30,
        width:  "8vh",
        height: "8vh",
        borderRadius: "50%",
        background: "radial-gradient(circle at 38% 32%, rgba(200,40,40,0.9), rgba(70,6,6,0.97))",
        border: "2px solid rgba(248,113,113,0.65)",
        color: "#fecaca",
        fontFamily: "Orbitron,sans-serif",
        fontSize: "clamp(6px,0.6vw,8px)",
        fontWeight: "bold",
        letterSpacing: "0.07em",
        lineHeight: 1.3,
        cursor: "pointer",
        boxShadow: "0 0 16px rgba(248,113,113,0.3), 0 0 1px rgba(248,113,113,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        textShadow: "0 0 8px rgba(248,113,113,0.8)",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
      }} onClick={handleLogout}>LOG<br/>OUT</button>

      {/* ══════════════════════════════════════════════════════════════
          WALLET MODAL — inline overlay, no navigation
          ══════════════════════════════════════════════════════════════ */}
      {walletOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setWalletOpen(false); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="wallet-modal" style={{
            position: "relative",
            width: 340,
            background: "rgba(10,18,38,0.98)",
            border: "1px solid rgba(0,212,255,0.35)",
            borderRadius: "12px",
            padding: "28px 24px",
            boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 20px 60px rgba(0,0,0,0.8)",
            color: "#e2e8f0",
          }}>
            {/* Close */}
            <button
              onClick={() => setWalletOpen(false)}
              style={{
                position: "absolute", top: 12, right: 14,
                background: "none", border: "none",
                color: "rgba(148,192,210,0.6)",
                fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}
            >×</button>

            {/* Title */}
            <div style={{
              fontFamily: "Orbitron,sans-serif",
              fontSize: 13, fontWeight: "bold",
              letterSpacing: "0.15em",
              color: "#00D4FF",
              textAlign: "center",
              marginBottom: 16,
              textShadow: "0 0 10px rgba(0,212,255,0.5)",
            }}>CONNECT WALLET</div>

            <div style={{ height: 1, background: "rgba(0,212,255,0.15)", marginBottom: 20 }} />

            {connected ? (
              /* Connected state */
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>✓</div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:9, color:"#4ade80", letterSpacing:"0.1em" }}>
                  CONNECTED
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: 11,
                  color: "rgba(148,192,210,0.7)",
                  background: "rgba(0,212,255,0.06)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 6, padding: "6px 14px",
                }}>{shortAddr}</div>
                <button
                  onClick={() => { setAccount(null); setConnected(false); }}
                  style={{
                    marginTop: 4,
                    padding: "7px 20px",
                    background: "transparent",
                    border: "1px solid rgba(248,113,113,0.4)",
                    borderRadius: 6,
                    color: "#fca5a5",
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: 8, letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >DISCONNECT</button>
              </div>
            ) : isConnecting ? (
              /* Connecting state */
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"12px 0" }}>
                <img src={symbol} alt="MetaMask" style={{ width: 52, height: 52 }} />
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:9, color:"rgba(148,192,210,0.8)", letterSpacing:"0.12em" }}>
                  WAITING FOR CONFIRMATION
                </div>
                <div className="wallet-spinner" style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  border: "3px solid rgba(0,212,255,0.15)",
                  borderTopColor: "#00D4FF",
                }} />
              </div>
            ) : (
              /* Connect options */
              <>
                <button
                  onClick={connectMetaMask}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 12,
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    color: "#e2e8f0",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  <img src={symbol} alt="MetaMask" style={{ width: 26, height: 26 }} />
                  MetaMask
                </button>

                {/* Info box */}
                <div style={{
                  marginTop: 20,
                  padding: "10px 14px",
                  background: "rgba(0,212,255,0.04)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 8,
                }}>
                  <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
                    color:"#38bdf8", letterSpacing:"0.12em", marginBottom:6 }}>
                    WHAT IS A CRYPTO WALLET?
                  </div>
                  <div style={{ fontSize:11, color:"rgba(148,192,210,0.65)", lineHeight:1.5 }}>
                    A crypto wallet lets you interact with the blockchain.
                    HyperTek will <strong style={{ color:"#7dd3fc" }}>never</strong> request
                    your seed phrase or private key.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
