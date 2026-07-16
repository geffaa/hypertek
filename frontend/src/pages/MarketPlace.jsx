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
import LockOverlay        from "../Components/Common/LockOverlay";
import { BACKEND_BASE_URL, LAUNCH_LOCKED } from "../Config";

// Navbar height = py-3 (24px) + h-12 logo (48px) = 72px
const HEADER_H = 72;

function MarketPlace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  const [search, setSearch]       = useState("");

  const contentRef = useRef(null);

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

  const handleTabChange = (tab, fromUrl = false) => {
    if (!fromUrl) setSearchParams({ tab });
    setActiveTab(tab);
    setSearch("");
  };

  // Opening any tab jumps straight to the tab bar docked under the site
  // header (banner scrolled out of view), from any starting position.
  const firstTabRender = useRef(true);
  useEffect(() => {
    if (firstTabRender.current) {
      // Initial page load keeps the banner visible (and restoreScrollY intact)
      firstTabRender.current = false;
      return;
    }
    requestAnimationFrame(() => {
      const content = contentRef.current;
      if (!content) return;
      const navH = navRef.current?.offsetHeight || 0;
      const contentTop = content.getBoundingClientRect().top + window.scrollY - HEADER_H - navH;
      window.scrollTo({ top: Math.max(0, contentTop), behavior: "instant" });
    });
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
  // Pre-launch: Overview and NFAs/NFCs/NFTs stay readable (educational);
  // the transactional tabs are locked. Quests/For Hire/Bounty keep their
  // own game-content locks.
  const launchLock = (tab) => (
    <LockOverlay
      locked={LAUNCH_LOCKED}
      title={t("marketplace.launchLock.marketplaceTitle", "The Marketplace is locked until launch, and launch is coming very soon!")}
      desc={t("marketplace.launchLock.desc", "Don't let that stop you. Sign up, explore this amazing project, see how it could reward you, and help make it happen. Become a Hyper Tekin and create something new!")}
    >
      {tab}
    </LockOverlay>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "overview":  return <OverviewTab onTabChange={(tab) => handleTabChange(tab)} />;
      case "general":   return launchLock(<GeneralTab />);
      case "nfa101":    return <Nfa101Tab />;
      case "auctions":  return launchLock(<AuctionsTab />);
      case "trades":    return launchLock(<TradesTab />);
      case "quests":    return <QuestsTab />;
      case "hire":      return <HireRentTab />;
      case "bounty":    return <BountyTab />;
      default:          return launchLock(<GeneralTab />);
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
      <div ref={contentRef} className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 pb-24">
        {renderTab()}
      </div>

      {/* ── Bottom info bar */}
      <BottomInfoBar />

    </div>
  );
}

export default MarketPlace;
