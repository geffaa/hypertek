import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import FullScreenLoader from "../Components/Common/Spinner";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import overview1 from "../assets/images/Overview/overview1.jpg";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import BottomInfoBar from "../Components/MarketPlaceCom/BottomInfoBar";
import LazyImage from "../Components/Common/LazyImage";
import { useConnectModal } from "@rainbow-me/rainbowkit";



// Navbar height = py-3 (24px) + h-12 logo (48px) = 72px
const HEADER_H = 72;

function CategoryMarketplace() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState([]);

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
        const url = category
          ? `${BACKEND_BASE_URL}/api/v1/nft/parent-collections?category=${category}`
          : `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`;
        const res = await axios.get(url);

        const parents = res.data.collections || res.data.nfts || [];

        let allSubs = [];

        for (const parent of parents) {
          try {
            if (parent.subCollections && parent.subCollections.length) {
              const mapped = parent.subCollections.map((sub) => ({
                ...sub,
                parentId: parent._id,
                parentCategory: CAT_ALIAS_REDIRECT[(parent.category || category)?.toLowerCase().trim()] || (parent.category || category),
                parentName: parent.collection?.name || "",
                collection: {
                  name: sub.name,
                  image: sub.image,
                  chain: sub.chain || parent.collection?.chain,
                  Type: sub.Type,
                },
              }));
              allSubs.push(...mapped);
            } else {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );

              if (subRes.data.success && subRes.data.subCollections) {
                const mapped = subRes.data.subCollections.map((sub) => ({
                  ...sub,
                  parentId: parent._id,
                  parentCategory: CAT_ALIAS_REDIRECT[(parent.category || category)?.toLowerCase().trim()] || (parent.category || category),
                  parentName: parent.collection?.name || "",
                  collection: {
                    name: sub.name,
                    image: sub.image,
                    chain: sub.chain || parent.collection?.chain,
                    Type: sub.Type,
                  },
                }));
                allSubs.push(...mapped);
              }
            }
          } catch (err) {
            console.error(`Error fetching subs for parent ${parent._id}:`, err);
          }
        }

        setItems(allSubs);
      } catch (err) {
        console.error("Error fetching category data:", err);
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]);

  if (loading) return <FullScreenLoader />;

  // Only show items that are listed for sale with a valid price
  const filteredItems = items.filter((item) =>
    item.listed === true &&
    item.priceETH > 0 &&
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
    ? "All Collections"
    : toTitleCase((CAT_ALIAS_REDIRECT[category.toLowerCase().trim()] || category).toLowerCase());

  return (
    <div className="min-h-screen bg-transparent relative z-10">

      {/* ── Hero Banner */}
      <div ref={bannerRef} className="mt-[72px]">
        <MarketplaceBanner
          noMargin
          titleOverride={categoryTitle}
          descOverride={`Explore all ${categoryTitle} items in the marketplace. Discover unique collections and start your journey.`}
          stats={[
            { num: filteredItems.length, label: "For Sale" },
            { num: items.filter((i) => i.listed && i.priceETH > 0).length, label: "Listed" },
            { num: items.filter((i) => !i.listed).length, label: "Unlisted" },
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
            title="Back to Marketplace"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marketplace</span>
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
        <section className="flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16 pt-8">
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
                All
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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>
          )}

          {/* GRID — responsive: 2 cols mobile → 3 sm → 5 lg → 6 xl */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="relative rounded-xl text-white flex flex-col overflow-hidden group cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <LazyImage
                    src={getImageUrl(item.collection?.image)}
                    alt={item.collection?.name || item.name || "Item"}
                    fallback={overview1}
                    className="w-full h-[140px] sm:h-[150px]"
                    imgClassName="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="flex flex-col gap-1 p-3 flex-1">
                    <h2 className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {item.collection?.name || item.name || "Unnamed"}
                    </h2>

                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[10px] sm:text-xs font-medium text-white/60">
                        {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold">
                        {item.priceETH || 0} USDC
                      </span>
                    </div>

                    <Link to="/buy-nfa" state={{ item }} className="mt-auto pt-2">
                      <button className="px-4 py-2 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-xs rounded-lg transition-all duration-300 border border-white/20 w-full">
                        Buy Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-white/50 py-12">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-sm">No items found in this category</p>
              </div>
            )}
          </div>
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
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
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
                    <div className="font-semibold text-white">Browser Wallet</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      MetaMask, Rainbow, etc.
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
