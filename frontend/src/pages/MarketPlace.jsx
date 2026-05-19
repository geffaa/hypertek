import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import MarketNavBar      from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import BottomInfoBar     from "../Components/MarketPlaceCom/BottomInfoBar";
import OverviewTab       from "../Components/MarketPlaceCom/OverviewTab";
import GeneralTab        from "../Components/MarketPlaceCom/tabs/GeneralTab";
import Nfa101Tab         from "../Components/MarketPlaceCom/tabs/Nfa101Tab";
import AuctionsTab       from "../Components/MarketPlaceCom/tabs/AuctionsTab";
import QuestsTab         from "../Components/MarketPlaceCom/tabs/QuestsTab";
import TradesTab         from "../Components/MarketPlaceCom/tabs/TradesTab";
import HireRentTab       from "../Components/MarketPlaceCom/tabs/HireRentTab";
import BountyTab         from "../Components/MarketPlaceCom/tabs/BountyTab";
import MusicPlayer        from "../Components/MarketPlaceCom/MusicPlayer";
import { BACKEND_BASE_URL } from "../Config";

// Navbar height = py-3 (24px) + h-12 logo (48px) = 72px
const HEADER_H = 72;

function MarketPlace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  const [search, setSearch]       = useState("");

  // Per-tab scroll position memory
  const scrollPositions = useRef({});
  const pendingScroll   = useRef(null);

  // Restore scroll when coming back from item detail (Back to Marketplace)
  useEffect(() => {
    const y = location.state?.restoreScrollY;
    if (y != null) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync activeTab when URL search params change (e.g. navbar Shops → Overview link)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) handleTabChange(tab, true);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current scroll → set new tab → restore saved scroll after render
  const handleTabChange = (tab, fromUrl = false) => {
    scrollPositions.current[activeTab] = window.scrollY;
    const saved = scrollPositions.current[tab];
    pendingScroll.current = saved !== undefined ? saved : null;
    if (!fromUrl) setSearchParams({ tab });
    setActiveTab(tab);
    setSearch("");
  };

  // Restore scroll position after tab content renders
  useEffect(() => {
    if (pendingScroll.current === null) return;
    const pos = pendingScroll.current;
    pendingScroll.current = null;
    requestAnimationFrame(() => window.scrollTo({ top: pos, behavior: "instant" }));
  }, [activeTab]);

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
      case "overview":  return <OverviewTab onTabChange={(tab) => handleTabChange(tab)} />;
      case "general":   return <GeneralTab />;
      case "nfa101":    return <Nfa101Tab />;
      case "auctions":  return <AuctionsTab />;
      case "trades":    return <TradesTab />;
      case "quests":    return <QuestsTab />;
      case "hire":      return <HireRentTab />;
      case "bounty":    return <BountyTab />;
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

      {/* ── B: Hero Banner — flush to site header */}
      <div ref={bannerRef} className="mt-[72px]">
        <MarketplaceBanner
          noMargin
          stats={[
            { num: bannerStats.totalItems,  label: t("marketplace.banner.stats.totalItems")  },
            { num: bannerStats.totalVolume, label: t("marketplace.banner.stats.totalBuys")   },
            { num: bannerStats.listed,      label: t("marketplace.banner.stats.listed")       },
            { num: bannerStats.collections, label: t("marketplace.banner.stats.collections")  },
          ]}
        />
      </div>

      {/* ── C: Marketplace Nav — fixed once banner scrolls past */}
      <div ref={navRef} style={navStyle}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 py-2 flex items-center gap-3">
          <MarketNavBar
            activeTab={activeTab}
            onTabChange={(tab) => handleTabChange(tab)}
            search={search}
            onSearch={setSearch}
            className="flex-1 min-w-0"
          />
          <MusicPlayer />
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
