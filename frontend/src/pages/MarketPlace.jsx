import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MarketNavBar      from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import BottomInfoBar     from "../Components/MarketPlaceCom/BottomInfoBar";
import OverviewTab       from "../Components/MarketPlaceCom/OverviewTab";
import GeneralTab        from "../Components/MarketPlaceCom/tabs/GeneralTab";
import Nfa101Tab         from "../Components/MarketPlaceCom/tabs/Nfa101Tab";
import AuctionsTab       from "../Components/MarketPlaceCom/tabs/AuctionsTab";
import QuestsTab         from "../Components/MarketPlaceCom/tabs/QuestsTab";
import HireRentTab       from "../Components/MarketPlaceCom/tabs/HireRentTab";
import BountyTab         from "../Components/MarketPlaceCom/tabs/BountyTab";
import MyMarketTab       from "../Components/MarketPlaceCom/tabs/MyMarketTab";
import { BACKEND_BASE_URL } from "../Config";

// Navbar height = py-3 (24px) + h-12 logo (48px) = 72px
const HEADER_H = 72;

function MarketPlace() {
  const [activeTab, setActiveTab] = useState("general");
  const [search, setSearch]       = useState("");

  // ── Ambient audio (default: play on mount, loop) ───────────────────────────
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true); // optimistic default = on

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Attempt autoplay; fail silently — button stays "Sound On" as intended default
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  // ── Banner stats from API ──────────────────────────────────────────────────
  const [bannerStats, setBannerStats] = useState({
    totalItems: "—", totalVolume: "—", listed: "—", collections: "—",
  });

  useEffect(() => {
    axios.get(`${BACKEND_BASE_URL}/api/v1/nft/dashboard/stats`)
      .then(r => {
        const s = r.data?.stats || {};
        setBannerStats({
          totalItems:   s.totalNFAs       ?? "—",
          listed:       s.totalSell       ?? "—",
          collections:  s.totalCollections ?? "—",
          totalVolume:  s.totalBuy        ?? "—",
        });
      })
      .catch(() => {});
  }, []);

  // ── Marketplace nav: fixed below site header when banner scrolls out ───────
  // position:sticky breaks because App.jsx wrapper has overflow:hidden.
  // Solution: IntersectionObserver on banner → switch nav to position:fixed.
  const bannerRef   = useRef(null);
  const navRef      = useRef(null);
  const [navFixed, setNavFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const banner = bannerRef.current;
    const nav    = navRef.current;
    if (!banner || !nav) return;

    setNavHeight(nav.offsetHeight);

    const observer = new IntersectionObserver(
      ([entry]) => setNavFixed(!entry.isIntersecting),
      { threshold: 0, rootMargin: `${-HEADER_H}px 0px 0px 0px` }
    );
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  // ── Tab content ────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case "overview":  return <OverviewTab onTabChange={setActiveTab} />;
      case "general":   return <GeneralTab />;
      case "nfa101":    return <Nfa101Tab />;
      case "auctions":  return <AuctionsTab />;
      case "quests":    return <QuestsTab />;
      case "hire":      return <HireRentTab />;
      case "bounty":    return <BountyTab />;
      case "mymarket":  return <MyMarketTab />;
      default:          return <GeneralTab />;
    }
  };

  const navStyle = {
    background:           "rgba(4,5,18,0.97)",
    borderBottom:         "1px solid rgba(255,255,255,0.08)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    zIndex:               40,
    left: 0,
    right: 0,
    ...(navFixed
      ? { position: "fixed", top: HEADER_H }
      : { position: "relative" }),
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10">

      {/* Ambient sound — drop .mp3 at public/audio/marketplace_ambient.mp3 */}
      <audio ref={audioRef} src="/audio/marketplace_ambient.mp3" loop preload="auto" />

      {/* ── B: Hero Banner — flush to site header */}
      <div ref={bannerRef} className="mt-[72px]">
        <MarketplaceBanner
          noMargin
          playing={playing}
          onToggleAudio={toggleAudio}
          stats={[
            { num: bannerStats.totalItems,  label: "Total Items"  },
            { num: bannerStats.totalVolume, label: "Total Buys"   },
            { num: bannerStats.listed,      label: "Listed"       },
            { num: bannerStats.collections, label: "Collections"  },
          ]}
        />
      </div>

      {/* ── C: Marketplace Nav — fixed once banner scrolls past */}
      <div ref={navRef} style={navStyle}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 py-2">
          <MarketNavBar
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setSearch(""); }}
            search={search}
            onSearch={setSearch}
          />
        </div>
      </div>

      {/* Spacer to prevent content jump when nav becomes fixed */}
      {navFixed && <div style={{ height: navHeight }} />}

      {/* ── Tab content */}
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 pb-24">
        {renderTab()}
      </div>

      {/* ── Bottom info bar */}
      <BottomInfoBar />

    </div>
  );
}

export default MarketPlace;
