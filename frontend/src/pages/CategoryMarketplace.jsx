import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import FullScreenLoader from "../Components/Common/Spinner";
import { BACKEND_BASE_URL, LAUNCH_LOCKED, getImageUrl } from "../Config";
import LockOverlay from "../Components/Common/LockOverlay";
import overview1 from "../assets/images/Overview/overview1.webp";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import BottomInfoBar from "../Components/MarketPlaceCom/BottomInfoBar";
import LazyImage from "../Components/Common/LazyImage";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { FALLBACK_ITEMS, ALL_FALLBACK_ITEMS } from "../Components/MarketPlaceCom/marketplaceFallback";



// Navbar height = py-3 (24px) + h-12 logo (48px) = 72px
const HEADER_H = 72;

function CategoryMarketplace() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openConnectModal } = useConnectModal();

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const contentRef = useRef(null);

  // ── Redirect old alias URLs to canonical ──────────────────────────
  const CAT_ALIAS_REDIRECT = {
    "military badges and collectables": "military badges",
    "vehicles":                         "racing vehicles",
    "land/bases":                       "land and bases",
  };
  useEffect(() => {
    if (!category) return;
    const canonical = CAT_ALIAS_REDIRECT[category.toLowerCase().trim()];
    if (canonical) navigate(`/collections/${encodeURIComponent(canonical)}`, { replace: true });
  }, [category]);

  // ── Fetch all categories for filter chips ─────────────────────────
  // Order matches GeneralTab CATEGORIES order
  const CATEGORY_ORDER = [
    "skins",
    "military badges",
    "specialists",
    "weapons",
    "body armour",
    "spaceships",
    "racing vehicles",
    "artwork",
    "land and bases",
    "general",
  ];

  const CAT_I18N = {
    "skins":           "skins",
    "military badges": "militaryBadges",
    "specialists":     "specialists",
    "weapons":         "weapons",
    "body armour":     "bodyArmour",
    "spaceships":      "spaceships",
    "racing vehicles": "racingVehicles",
    "artwork":         "artwork",
    "land and bases":  "landAndBases",
    "general":         "general",
  };

  const catLabel = (cat) => {
    const key = CAT_I18N[cat];
    return key
      ? t(`marketplace.general.categories.${key}`)
      : cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
        const cats = new Set();
        (res.data.collections || []).forEach((c) => {
          if (c.category) {
            const raw = c.category.toLowerCase().trim();
            // Normalize legacy names to canonical
            cats.add(CAT_ALIAS_REDIRECT[raw] || raw);
          }
        });
        const fetched = Array.from(cats);
        // Sort by CATEGORY_ORDER; unknown categories go to the end alphabetically
        const sorted = [
          ...CATEGORY_ORDER.filter((k) => fetched.includes(k)),
          ...fetched.filter((k) => !CATEGORY_ORDER.includes(k)).sort(),
        ];
        setAllCategories(sorted);
      } catch (e) {
        console.warn("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  // ── Marketplace nav: fixed below site header when banner scrolls out ─
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

  // ── Nav tab change: navigate to marketplace with that tab ──────────
  const handleTabChange = (tab) => {
    navigate(`/market-place?tab=${tab}`);
  };


  useEffect(() => {
    const fetchByCategory = async () => {
      setLoading(true);
      try {
        const normalizedCat = category
          ? (CAT_ALIAS_REDIRECT[category.toLowerCase().trim()] || category.toLowerCase().trim())
          : null;

        // Source 1: active marketplace listings (same source as GeneralTab slider)
        let marketItems = [];
        try {
          const mRes = await axios.get(`${BACKEND_BASE_URL}/api/v1/listings/marketplace`);
          const grouped = mRes.data.grouped || {};
          if (normalizedCat) {
            marketItems = grouped[normalizedCat] || [];
          } else {
            // No category filter — flatten all
            Object.values(grouped).forEach(arr => marketItems.push(...arr));
          }
        } catch {
          // Non-fatal — will still show NFTSystem items
        }

        // Source 2: NFTSystem parent-collections (items synced via syncSubCollectionPrice)
        const url = category
          ? `${BACKEND_BASE_URL}/api/v1/nft/parent-collections?category=${category}`
          : `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`;
        const res = await axios.get(url);
        const parents = res.data.collections || res.data.nfts || [];

        let nftSystemItems = [];
        for (const parent of parents) {
          try {
            const mapSub = (sub) => ({
              ...sub,
              parentId: parent._id,
              parentCategory: CAT_ALIAS_REDIRECT[(parent.category || category)?.toLowerCase().trim()] || (parent.category || category),
              parentName: parent.collection?.name || "",
              isDummy: parent.isDummy === true,
            });

            if (parent.subCollections && parent.subCollections.length) {
              nftSystemItems.push(...parent.subCollections.map(mapSub));
            } else {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );
              if (subRes.data.success && subRes.data.subCollections) {
                nftSystemItems.push(...subRes.data.subCollections.map(mapSub));
              }
            }
          } catch (err) {
            console.error(`Error fetching subs for parent ${parent._id}:`, err);
          }
        }

        // Deduplicate: prefer marketItems entry if same subCollectionId exists in both sources
        const marketIds = new Set(marketItems.map(i => String(i._id)));
        const uniqueNftSystemItems = nftSystemItems.filter(i => !marketIds.has(String(i._id)));

        setItems([...marketItems, ...uniqueNftSystemItems]);
      } catch (err) {
        console.error("Error fetching category data:", err);
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]);

  // Auto-scroll to content heading once data has loaded
  useEffect(() => {
    if (loading || !contentRef.current) return;
    const el = contentRef.current;
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 56;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }, [loading]);

  if (loading) return <FullScreenLoader />;

  // Real listed items — marketplace API items have no `listed` field (always active),
  // NFTSystem items require listed === true. Both require a price.
  const listedItems = items.filter((item) => {
    const price = item.priceETH ?? item.price ?? 0;
    const isListed = item.listed === undefined ? true : item.listed === true;
    return isListed && price > 0;
  });

  // Always show dummy content as base; real listings are prepended in front
  const normalizedCategory = category
    ? (CAT_ALIAS_REDIRECT[category.toLowerCase().trim()] || category.toLowerCase().trim())
    : null;
  const fallbackBase = normalizedCategory
    ? (FALLBACK_ITEMS[normalizedCategory] || ALL_FALLBACK_ITEMS)
    : ALL_FALLBACK_ITEMS;

  // Exclude real listings whose name matches a dummy — dummy takes priority for duplicates
  const dummyNames = new Set(fallbackBase.map(d => (d.name || "").toLowerCase().trim()));
  const dedupedReal = listedItems.filter(r => !dummyNames.has((r.name || "").toLowerCase().trim()));
  const allDisplayItems = [...dedupedReal, ...fallbackBase];

  const filteredItems = allDisplayItems.filter((item) =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Derive title from canonical URL param — never from DB parentName (could be old alias)
  const toTitleCase = (str) => str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const categoryTitle = !category
    ? t("collections.allCollections")
    : toTitleCase((CAT_ALIAS_REDIRECT[category.toLowerCase().trim()] || category).toLowerCase());

  return (
    <div className="min-h-screen bg-transparent relative z-10">

      {/* ── Hero Banner */}
      <div ref={bannerRef} className="mt-[72px]">
        <MarketplaceBanner
          noMargin
          titleOverride={categoryTitle}
          descOverride={t("collections.exploreDesc", { category: categoryTitle })}
          stats={[
            { num: listedItems.length, label: t("collections.forSale") },
            { num: listedItems.length, label: t("collections.listed") },
            { num: items.filter((i) => !i.listed).length, label: t("collections.unlisted") },
          ]}
        />
      </div>

      {/* ── Marketplace Nav — fixed once banner scrolls past */}
      <div ref={navRef} style={navStyle}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 py-2 flex items-center gap-3">
          {/* Back to Marketplace button */}
          <Link
            to="/market-place"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:brightness-125"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
            data-tooltip={t("collections.backToMarketplace")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("collections.backToMarketplace")}</span>
          </Link>

          <NavLinks
            activeTab="general"
            onTabChange={handleTabChange}
            search={searchTerm}
            onSearch={setSearchTerm}
            className="flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Spacer to prevent content jump when nav becomes fixed */}
      {navFixed && <div style={{ height: navHeight }} />}

      {/* ── Tab content */}
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 pb-24">

        {/* Items Section */}
        <section ref={contentRef} className="flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16 pt-8">
          {/* Heading */}
          <div className="flex flex-col gap-2 items-start pl-1 lg:pl-[14px]">
            <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
              {categoryTitle}
            </h1>
            <div className="flex gap-2">
              <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
              <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
              <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
              <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
            </div>
          </div>

          {/* Category Filter Chips */}
          {allCategories.length > 0 && (
            <div className="flex gap-2 pl-1 lg:pl-[14px] overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {/* All chip */}
              <button
                onClick={() => navigate("/collections")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  !category
                    ? "bg-[#002AA8] text-white border border-blue-500/50"
                    : "text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {t("collections.all")}
              </button>
              {allCategories.map((cat) => {
                const isActive = cat === category?.toLowerCase().trim();
                return (
                  <button
                    key={cat}
                    onClick={() => navigate(`/collections/${encodeURIComponent(cat)}`)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#002AA8] text-white border border-blue-500/50"
                        : "text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {catLabel(cat)}
                  </button>
                );
              })}
            </div>
          )}


          {/* GRID — responsive: 2 cols mobile → 3 sm → 5 lg → 6 xl.
              Pre-launch: grid is dimmed behind the lock card; heading and
              category chips above stay browsable. */}
          <LockOverlay
            locked={LAUNCH_LOCKED}
            title={t("marketplace.launchLock.marketplaceTitle", "The marketplace is locked until the official launch")}
            desc={t("marketplace.launchLock.desc", "But nothing is stopping you from checking the site out.")}
          >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isDummy = item.isDummy === true;
                const imgSrc = item.image ? (isDummy ? item.image : getImageUrl(item.image)) : overview1;
                const displayName = item.name || "Unnamed";
                return (
                  <div
                    key={item._id}
                    className="relative rounded-xl text-white flex flex-col overflow-hidden group cursor-pointer transition-all duration-200 hover:brightness-110 hover:border-white/20"
                    style={{
                      background: "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                    onClick={() => navigate("/buy-nfa", { state: { item, parentId: item.parentId } })}
                  >
                    <div className="relative">
                      <LazyImage
                        src={imgSrc}
                        alt={displayName}
                        fallback={overview1}
                        className="w-full aspect-square"
                        imgClassName={`${isDummy ? "object-cover object-top" : "object-contain"} transition-transform duration-500 group-hover:scale-105`}
                      />
                      {/* Asset type badge */}
                      {(() => {
                        const aType = item.assetType || (item.isNFA ? "NFA" : "NFT");
                        const cfg = {
                          NFA: { bg: "#3b0764",  border: "rgba(167,139,250,0.70)", text: "#e9d5ff" },
                          NFC: { bg: "#0a1a6e",  border: "rgba(59,130,246,0.70)",  text: "#bfdbfe" },
                          NFT: { bg: "#0f2d6b",  border: "rgba(59,130,246,0.65)",  text: "#bfdbfe" },
                        }[aType];
                        return (
                          <span
                            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
                          >
                            {aType}
                          </span>
                        );
                      })()}
                      {isDummy && (
                        <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none"
                          style={{ background: "rgba(0,0,0,0.25)" }}>
                          <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest select-none"
                            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
                            Sample Preview
                          </span>
                        </div>
                      )}
                      {/* Edition count badge — bottom left */}
                      {(item.maxSupply || 1) > 1 && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-cyan-300"
                          style={{ background: "#071a2e", border: "1px solid rgba(6,182,212,0.65)" }}>
                          {(item.maxSupply || 1) - (item.currentSupply || 0)}/{item.maxSupply}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 p-3 flex-1">
                      <h2 className="text-xs sm:text-sm font-semibold truncate leading-tight">{displayName}</h2>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] sm:text-xs font-semibold">{item.priceETH || 0} USDC</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/buy-nfa", { state: { item, parentId: item.parentId } }); }}
                        className="mt-3 w-full px-4 py-2 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-xs rounded-lg transition-all duration-300 border border-white/20"
                      >
                        {isDummy ? t("collections.preview", "Preview") : t("collections.buyNow")}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-white/50 py-12">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-sm">{t("collections.noItemsFound")}</p>
              </div>
            )}
          </div>
          </LockOverlay>
        </section>
      </div>

      {/* ── Bottom info bar */}
      <BottomInfoBar />

      {/* WALLET SELECTION MODAL */}
      {showWalletModal && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm px-4"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-[#1f2937] p-8 rounded-2xl w-full max-w-sm mx-4 border border-white/10 shadow-2xl transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{t("collections.connectWallet")}</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  if (openConnectModal) openConnectModal();
                }}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-blue-500/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{t("collections.browserWallet")}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      {t("collections.browserWalletDesc")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 group-hover:text-blue-400">→</div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CategoryMarketplace;
