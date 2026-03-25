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
import useMobileLandscape from "../../hooks/useMobileLandscape";

// 5 resources per Don's brief — each has open/stored for dropdown
const RESOURCES = [
  { id: "FOOD",     label: "Food",            value: "61.7M",   color: "#6ee7b7", img: "/icon_food.png",   open: "61.7M",  stored: "5.3B"  },
  { id: "OIL",      label: "Oil",             value: "59.8M",   color: "#94a3b8", img: "/icon_oil.png",    open: "59.8M",  stored: "1.4B"  },
  { id: "CRYSTALS", label: "Energy Crystals", value: "3.4M",    color: "#c4b5fd", img: "/icon_energy.png", open: "3.4M",   stored: "39M"   },
  { id: "FUEL",     label: "Fuel",            value: "102.6M",  color: "#fb923c", img: "/icon_fuel.png",   open: "102.6M", stored: "766M"  },
  { id: "ORE",      label: "Ore",             value: "73.5M",   color: "#cbd5e1", img: "/icon_ore.png",    open: "73.5M",  stored: "821M"  },
];

// Resources panel categories per Don's brief
const RES_CATEGORIES = [
  {
    id: "endurance", label: "Endurance", locked: false,
    items: [{ label: "Endurance", val: "8825" }, { label: "Water", val: "24.5M" }, { label: "Water Heavy", val: "3.8M" }],
  },
  {
    id: "water", label: "Water", locked: false,
    items: [{ label: "Water", val: "24.5M" }, { label: "Water Heavy", val: "3.8M" }],
  },
  {
    id: "furuseth", label: "Furuseth Crystals", locked: false,
    items: [
      { label: "F Crystals lvl 1", val: "" }, { label: "F Crystals lvl 2", val: "" },
      { label: "F Crystals lvl 3", val: "" }, { label: "F Crystals lvl 4", val: "" },
      { label: "F Crystals lvl 5", val: "" },
    ],
  },
  {
    id: "gems", label: "Gems", locked: true,
    items: [],
  },
  {
    id: "minerals", label: "Minerals", locked: false,
    items: [
      { label: "Cloth", val: "" }, { label: "Silk", val: "" }, { label: "Wood", val: "" },
      { label: "Carbon", val: "" }, { label: "Silica", val: "" },
    ],
  },
  {
    id: "crystals", label: "Crystals", locked: false,
    items: [
      { label: "White Crystals", val: "" }, { label: "Green Crystals", val: "" },
      { label: "Blue Crystals", val: "" }, { label: "Red Crystals", val: "" },
      { label: "Clear Crystals", val: "" },
    ],
  },
  {
    id: "timeclocks", label: "Time Clocks", locked: false,
    items: [
      { label: "5-minute Time Clock", val: "55056" }, { label: "15-minute Time Clock", val: "25648" },
      { label: "30-minute Time Clock", val: "9878" }, { label: "1Hour Time Clock", val: "54569" },
      { label: "3 Hour Time Clock", val: "42123" }, { label: "8 Hour Time Clock", val: "3212" },
      { label: "12 Hour Time Clock", val: "1247" }, { label: "24 Hour Time Clock", val: "947" },
    ],
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

const NAV_BTN_BASE = {
  background: "linear-gradient(180deg, rgba(0,30,55,0.95) 0%, rgba(0,15,35,0.98) 100%)",
  border: "1px solid rgba(0,212,255,0.55)",
  borderRadius: "3px",
  color: "#00D4FF",
  fontFamily: "Orbitron,sans-serif",
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
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const isMobile  = useMobileLandscape();

  const NAV_BTN = {
    ...NAV_BTN_BASE,
    height:   isMobile ? "22px" : "3.6vh",
    padding:  isMobile ? "0 8px" : "0 16px",
    fontSize: isMobile ? "clamp(5px,0.55vw,7px)" : "clamp(7px,0.65vw,9px)",
  };

  // ── Resource dropdown ────────────────────────────────────────────
  const [activeRes, setActiveRes] = useState(null);  // resource id with open dropdown
  const resBarRef = useRef(null);

  // ── Resources panel (RESOURCES button) ───────────────────────────
  const [resPanelOpen, setResPanelOpen]   = useState(false);
  const [activeCat,    setActiveCat]      = useState(null);
  const resPanelRef = useRef(null);

  // ── Marketplace dropdown ─────────────────────────────────────────
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef = useRef(null);

  // ── Wallet modal ─────────────────────────────────────────────────
  const [walletOpen,    setWalletOpen]    = useState(false);
  const [account,       setAccount]       = useState(null);
  const [isConnecting,  setIsConnecting]  = useState(false);
  const [connected,     setConnected]     = useState(false);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (marketRef.current && !marketRef.current.contains(e.target))
        setMarketOpen(false);
      if (resPanelRef.current && !resPanelRef.current.contains(e.target)) {
        setResPanelOpen(false);
        setActiveCat(null);
      }
      if (resBarRef.current && !resBarRef.current.contains(e.target))
        setActiveRes(null);
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
        top: isMobile ? "6px" : "20px",
        left: isMobile ? "13%" : "15%",
        right: isMobile ? "11%" : "13%",
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "4px" : "8px",
      }}>

        {/* 1. RESOURCES label — opens category panel */}
        <div ref={resPanelRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            className="res-slot"
            onClick={() => { setResPanelOpen(o => !o); setActiveCat(null); }}
            style={{
              ...NAV_BTN,
              borderColor: resPanelOpen ? "rgba(0,212,255,0.9)" : "rgba(0,212,255,0.55)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            RESOURCES
            <span style={{
              fontSize: "8px", display: "inline-block",
              transition: "transform 0.18s",
              transform: resPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}>▼</span>
          </button>

          {resPanelOpen && (
            <div className="market-dropdown" style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              minWidth: 180,
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(0,212,255,0.35)",
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
              zIndex: 100, overflow: "visible",
            }}>
              {RES_CATEGORIES.map((cat, i) => (
                <div key={cat.id} style={{ position: "relative" }}>
                  <div
                    className="market-dropdown-item"
                    onClick={() => !cat.locked && setActiveCat(activeCat === cat.id ? null : cat.id)}
                    style={{
                      padding: "9px 14px",
                      fontFamily: "Orbitron,sans-serif",
                      fontSize: "clamp(6px,0.6vw,8px)",
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                      color: cat.locked ? "rgba(148,192,210,0.3)" : (activeCat === cat.id ? "#00D4FF" : "#7dd3fc"),
                      borderBottom: i < RES_CATEGORIES.length - 1 ? "1px solid rgba(0,212,255,0.08)" : "none",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: cat.locked ? "not-allowed" : "pointer",
                      background: activeCat === cat.id ? "rgba(0,212,255,0.07)" : "transparent",
                    }}
                  >
                    {cat.label}
                    <span style={{ fontSize: 8, opacity: 0.6 }}>
                      {cat.locked ? "🔒" : (activeCat === cat.id ? "▶" : "▷")}
                    </span>
                  </div>

                  {/* Sub-items */}
                  {activeCat === cat.id && cat.items.length > 0 && (
                    <div className="market-dropdown" style={{
                      position: "absolute", top: 0, left: "calc(100% + 2px)",
                      minWidth: 200,
                      background: "rgba(3,10,24,0.97)",
                      border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                      zIndex: 110,
                    }}>
                      {cat.items.map((item, j) => (
                        <div key={j} style={{
                          padding: "8px 14px",
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: "clamp(6px,0.55vw,7.5px)",
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                          color: "#7dd3fc",
                          borderBottom: j < cat.items.length - 1 ? "1px solid rgba(0,212,255,0.07)" : "none",
                          display: "flex", justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                        className="market-dropdown-item"
                        >
                          <span>{item.label}</span>
                          {item.val && <span style={{ color: "#facc15", marginLeft: 12 }}>{item.val}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Resource slots */}
        <div ref={resBarRef} style={{
          flex: 1, height: isMobile ? "22px" : "3.6vh",
          display: "flex", alignItems: "stretch",
          background: "rgba(3,8,18,0.92)",
          border: "1px solid rgba(0,212,255,0.18)",
          borderRadius: "3px",
          backdropFilter: "blur(14px)",
          overflow: "visible",
          minWidth: 0, position: "relative",
        }}>
          {RESOURCES.map((r, i) => (
            <div key={r.id} style={{ flex: 1, position: "relative", minWidth: 0 }}>
              {/* slot button */}
              <div
                className="res-slot"
                title={r.label}
                onClick={() => setActiveRes(activeRes === r.id ? null : r.id)}
                style={{
                  height: "100%", display: "flex", alignItems: "center",
                  gap: "5px", padding: "0 8px", cursor: "pointer",
                  borderRight: i < RESOURCES.length - 1 ? "1px solid rgba(0,212,255,0.1)" : "none",
                  background: activeRes === r.id ? "rgba(0,212,255,0.09)" : "transparent",
                }}
              >
                <img
                  src={r.img} alt={r.label}
                  style={{
                    width:  isMobile ? "14px" : "clamp(20px,2.2vh,28px)",
                    height: isMobile ? "14px" : "clamp(20px,2.2vh,28px)",
                    objectFit: "contain", flexShrink: 0,
                    imageRendering: "crisp-edges",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  {!isMobile && (
                    <div style={{
                      fontFamily: "Orbitron,sans-serif",
                      fontSize: "clamp(4px,0.38vw,5px)",
                      letterSpacing: "0.08em",
                      color: "rgba(148,192,210,0.5)",
                      textTransform: "uppercase",
                      lineHeight: 1, marginBottom: "2px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{r.label}</div>
                  )}
                  <div style={{
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: isMobile ? "clamp(5px,0.55vw,7px)" : "clamp(7px,0.65vw,9px)",
                    fontWeight: "bold", letterSpacing: "0.05em",
                    color: r.color, textShadow: `0 0 6px ${r.color}88`,
                    whiteSpace: "nowrap", lineHeight: 1,
                  }}>{r.value}</div>
                </div>
              </div>

              {/* dropdown */}
              {activeRes === r.id && (
                <div className="market-dropdown" style={{
                  position: "absolute", top: "calc(100% + 4px)", left: "50%",
                  transform: "translateX(-50%)",
                  minWidth: 130,
                  background: "rgba(3,10,24,0.97)",
                  border: `1px solid ${r.color}55`,
                  borderRadius: 4,
                  backdropFilter: "blur(16px)",
                  boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 12px ${r.color}18`,
                  zIndex: 100, padding: "8px 12px",
                }}>
                  <div style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: 6.5, fontWeight: "bold",
                    color: r.color, letterSpacing: "0.12em", marginBottom: 6,
                    textShadow: `0 0 6px ${r.color}88`,
                  }}>{r.label.toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "OPEN",   val: r.open   },
                      { label: "STORED", val: r.stored },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      }}>
                        <span style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 6,
                          color: "rgba(157,216,240,0.5)", letterSpacing: "0.1em",
                        }}>{row.label}</span>
                        <span style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 8, fontWeight: "bold",
                          color: r.color, letterSpacing: "0.05em",
                        }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        top:    isMobile ? "4px"  : "1vh",
        right:  isMobile ? "1.5%" : "2%",
        zIndex: 30,
        width:  isMobile ? "32px" : "8vh",
        height: isMobile ? "32px" : "8vh",
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
