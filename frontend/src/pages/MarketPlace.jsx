import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { FiSearch, FiChevronDown, FiChevronRight, FiChevronUp } from "react-icons/fi";
import { ArrowLeft, ArrowRight } from "lucide-react";
import popularCollections from "../assets/images/popular/popolar.png";
import TVector from "../assets/images/popular/vector.png";
import land1Image from "../assets/images/Overview/land1.jpg";
import ManImage from "../assets/images/Overview/man.png";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import FullScreenLoader from "../Components/Common/Spinner";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";

// ─── Category meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
  skins:                           { label: "Skins",                          description: "All skin NFTs" },
  weapons:                         { label: "Weapons",                        description: "All weapon NFTs" },
  "military badges and collectables": { label: "Military Badges & Collectables", description: "Badges and collectibles" },
  "body armour":                   { label: "Body Armour",                    description: "Body armour NFTs" },
  specialists:                     { label: "Specialists",                    description: "Elite character NFTs" },
  spaceships:                      { label: "Spaceships / Parts",             description: "Spaceship NFTs" },
  "racing vehicles":               { label: "Racing Vehicles / Parts",        description: "Vehicle NFTs" },
  artwork:                         { label: "Artwork",                        description: "Digital art NFTs" },
  "land and bases":                { label: "Land and Bases",                 description: "Land & base NFTs" },
  characters:                      { label: "Characters",                     description: "Character NFTs" },
  land:                            { label: "Land",                           description: "Land NFTs" },
};

function getCategoryMeta(key) {
  const lower = (key || "").toLowerCase().trim();
  return CATEGORY_META[lower] || {
    label: key ? key.charAt(0).toUpperCase() + key.slice(1) : "Collection",
    description: `Browse ${key || "collection"} NFTs`,
  };
}

// NFT_EDUCATION is now fetched from the API — see state in MarketPlace component

// ─── Item card (horizontal slider) ───────────────────────────────────────────
function ItemCard({ item }) {
  return (
    <div
      className="flex-shrink-0 w-[180px] sm:w-[200px] relative rounded-[14px] shadow-md text-white p-3 flex flex-col"
      style={{
        background: "linear-gradient(147.75deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="w-full h-[120px] overflow-hidden rounded-[10px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
        <img
          src={getImageUrl(item.image) || popularCollections}
          alt={item.name || "Collection"}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <h2 className="text-xs sm:text-sm font-bold mt-2 truncate">
        {item.name || "Unnamed"}
      </h2>
      <div className="flex justify-between items-center mt-1 mb-2">
        <span className="text-[10px] text-gray-300 truncate">
          {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
        </span>
        <div className="flex items-center gap-1">
          <img src={TVector} alt="" className="w-2 h-2" />
          <span className="text-[10px] font-semibold">{item.priceETH || "—"} USDC</span>
        </div>
      </div>
      <div className="mt-auto pt-2">
        <Link
          to="/buy-nfa"
          state={{ item }}
          className="block w-full text-center text-white text-[11px] font-semibold py-1.5 rounded-[6px] transition-all hover:brightness-125"
          style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid #002AA8" }}
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}

// ─── Category row: locked label on left, items scroll on right ────────────────
function CategoryRow({ categoryName, items }) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");
  const sliderRef = useRef(null);
  const meta        = getCategoryMeta(categoryName);
  const displayName = items.length > 0
    ? (items[0]?.parentName || items[0]?.collection?.name || meta.label)
    : meta.label;

  const filteredItems = items.filter((item) =>
    searchTerm
      ? (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const scroll = (dir) => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <section className="mb-8 sm:mb-10">
      {/* ── Section heading (same style as Activities / NFT 101) ── */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center gap-2 text-left group"
          >
            <h2 className="text-white uppercase text-lg sm:text-xl lg:text-[26px] font-goldman font-bold tracking-wide">
              {displayName}
            </h2>
            <span className="text-white/50 group-hover:text-white transition">
              {isOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </span>
          </button>
          <div className="flex gap-2">
            <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
            <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
            <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
            <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
          </div>
        </div>
        <Link
          to={`/collections/${categoryName}`}
          className="flex items-center gap-1 text-white/60 hover:text-white transition text-xs sm:text-sm mb-1"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Row (label block + slider) ── */}
      <div
        className="flex rounded-[14px] overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* ── LEFT: locked label block (always visible) ── */}
        <div
          className="flex-shrink-0 w-[130px] sm:w-[150px] lg:w-[170px] flex flex-col justify-between p-3 sm:p-4"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
            borderRight: isOpen ? "1px solid rgba(255,255,255,0.1)" : "none",
          }}
        >
          <div>
            <p className="font-inter font-semibold text-white text-xs sm:text-sm leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight line-clamp-2">
              {meta.description}
            </p>
          </div>

          {/* Actions — only show when expanded */}
          {isOpen && (
            <div className="flex flex-col gap-1.5 mt-3">
              <button
                onClick={() => setSearchVisible((v) => !v)}
                className="flex items-center gap-1 text-white/60 hover:text-white transition text-[10px]"
              >
                <FiSearch className="w-3 h-3" />
                <span>Search</span>
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: scrollable items — hidden when collapsed ── */}
        {isOpen && (
          <div className="flex-1 min-w-0 relative group">
            {/* Search bar */}
            {searchVisible && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                <FiSearch className="text-white/60 w-3.5 h-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${displayName}...`}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-xs"
                  autoFocus
                />
                <button
                  onClick={() => { setSearchVisible(false); setSearchTerm(""); }}
                  className="text-gray-500 hover:text-white text-xs"
                >✕</button>
              </div>
            )}

            {/* Scroll left */}
            <button
              onClick={() => scroll(-1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
            >
              <ArrowLeft size={12} />
            </button>

            {/* Items strip */}
            <div
              ref={sliderRef}
              className="flex gap-3 overflow-x-auto p-3 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, i) => (
                  <ItemCard key={item._id || i} item={item} />
                ))
              ) : (
                <div className="flex items-center justify-center w-full text-gray-500 text-xs py-6">
                  {searchTerm ? `No results for "${searchTerm}"` : `No ${displayName} items yet`}
                </div>
              )}
            </div>

            {/* Scroll right */}
            <button
              onClick={() => scroll(1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
            >
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── NFT 101 card ─────────────────────────────────────────────────────────────
function EduCard({ icon, title, gradientFrom, gradientTo, link }) {
  return (
    <Link
      to={link || "#"}
      className="flex-shrink-0 w-[110px] sm:w-[125px] flex flex-col rounded-[10px] overflow-hidden hover:scale-105 transition-transform duration-200"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div
        className="h-[72px] flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${gradientFrom || "#1a4fd6"}, ${gradientTo || "#0e2d8a"})` }}
      >
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="px-2 py-1.5" style={{ background: "rgba(0,0,0,0.55)" }}>
        <p className="text-white text-[10px] font-medium leading-snug line-clamp-2">{title}</p>
      </div>
    </Link>
  );
}

// ─── NFT 101 sticky bottom toolbar (portal) ───────────────────────────────────
function Nft101Toolbar({ items }) {
  const [open, setOpen]   = useState(false);
  const sliderRef         = useRef(null);

  const scroll = (dir) =>
    sliderRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  // Collapsed bar height ~44px; expanded strip adds ~120px card height + 24px padding
  const collapsedH  = 44;
  const expandedH   = collapsedH + 130; // cards ~105px + padding top/bottom

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(6, 6, 16, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.6)",
        transition: "height 0.25s ease",
        height: open ? expandedH : collapsedH,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Card strip (only rendered when open) ── */}
      {open && (
        <div className="relative flex-1 group" style={{ minHeight: 0 }}>
          {/* Scroll left */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
          >
            <ArrowLeft size={12} />
          </button>

          {/* Cards */}
          <div
            ref={sliderRef}
            className="flex gap-3 px-4 py-3 h-full overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.length > 0 ? (
              items.map((edu) => <EduCard key={edu._id} {...edu} />)
            ) : (
              <p className="text-gray-500 text-xs self-center">No NFT 101 content yet.</p>
            )}
          </div>

          {/* Scroll right */}
          <button
            onClick={() => scroll(1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
          >
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* ── Toggle tab bar ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          flexShrink: 0,
          height: collapsedH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderTop: open ? "1px solid rgba(255,255,255,0.08)" : "none",
          width: "100%",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        {/* Left: heading + decorative lines */}
        <div className="flex items-center gap-4">
          <span
            className="uppercase text-white font-goldman font-bold tracking-wide"
            style={{ fontSize: "clamp(13px, 2vw, 18px)" }}
          >
            NFT 101
          </span>
          <div className="hidden sm:flex gap-1.5 items-center">
            <div className="h-[2px] w-6 bg-white" />
            <div className="h-[2px] w-10 bg-white" />
            <div className="h-[2px] w-4 bg-white" />
            <div className="h-[2px] w-16 bg-gradient-to-r from-white to-transparent" />
          </div>
          <span className="text-gray-400 text-[10px] hidden md:block">
            Learn about NFTs, Web3 &amp; more
          </span>
        </div>

        {/* Right: chevron */}
        <div className="flex items-center gap-1 text-white/60 hover:text-white transition text-xs">
          <span>{open ? "collapse" : "expand"}</span>
          {open
            ? <FiChevronDown className="w-3.5 h-3.5" />
            : <FiChevronUp   className="w-3.5 h-3.5" />}
        </div>
      </button>
    </div>,
    document.body
  );
}

// ─── Main MarketPlace ─────────────────────────────────────────────────────────
function MarketPlace() {
  const [activityData, setActivityData] = useState([]);
  const [nft101, setNft101]             = useState([]);
  const [loading, setLoading]           = useState(true);

  const staticActivityData = [
    { name: "Land #123", type: "Land", buyer: "Alice",   seller: "Bob",   price: 500,  time: "2025-12-20T12:00:00Z" },
    { name: "NFA #456",  type: "NFA",  buyer: "Charlie", seller: "Dave",  price: 250,  time: "2025-12-21T09:30:00Z" },
    { name: "Land #789", type: "Land", buyer: "Eve",     seller: "Frank", price: 1000, time: "2025-12-21T08:00:00Z" },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch collections + NFT 101 in parallel
        const [collectionsRes, eduRes] = await Promise.all([
          axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`),
          axios.get(`${BACKEND_BASE_URL}/api/v1/nft101`),
        ]);

        // NFT 101
        if (eduRes.data.success) {
          setNft101(eduRes.data.items || []);
        }

        // Collections
        if (collectionsRes.data.success) {
          const parentCollections = collectionsRes.data.nfts || collectionsRes.data.collections;
          const categoriesMap = {};
          for (const parent of parentCollections) {
            try {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );
              if (subRes.data.success && subRes.data.subCollections) {
                const category = (parent.category || "other").toLowerCase();
                if (!categoriesMap[category]) categoriesMap[category] = [];
                categoriesMap[category].push(
                  ...subRes.data.subCollections.map((sub) => ({
                    ...sub,
                    parentId: parent._id,
                    parentCategory: parent.category,
                    parentName: parent.collection?.name || "",
                  }))
                );
              }
            } catch (subErr) {
              console.error(`Sub-collections error for ${parent._id}:`, subErr);
            }
          }
          setActivityData(Object.entries(categoriesMap));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getDaysAgo = (dateString) => {
    const ms = new Date().getTime() - new Date(dateString).getTime();
    if (ms < 0) return "0d";
    return `${Math.floor(ms / 86400000)}d`;
  };

  return (
    <>
      {/* NFT 101 sticky toolbar — always rendered via portal, persists while scrolling */}
      <Nft101Toolbar items={nft101} />

      {loading ? (
        <FullScreenLoader />
      ) : (
        /* pb-[44px] keeps content clear of the collapsed toolbar */
        <div className="min-h-screen bg-transparent relative z-10 pb-[44px]">
          {/* Banner */}
          <div className="mt-16">
            <MarketplaceBanner
              stats={[
                { num: "5K",    label: "Total Item"   },
                { num: "50.5K", label: "Total Volume" },
                { num: "3.5K",  label: "Listed"       },
                { num: "2.6K",  label: "Owners"       },
              ]}
            />
          </div>

          <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8">

            {/* Nav + global search */}
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6 lg:mb-10">
              <NavLinks categories={activityData} />
              <div className="hidden mr-20 md:flex lg:w-[280px] items-center gap-3 px-4 py-1.5 border border-white/50 rounded-[12px] backdrop-blur-sm">
                <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search all..."
                  className="flex-1 bg-transparent pl-1 text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter w-full"
                />
              </div>
            </div>

            {/* ── Category rows ── */}
            <div className="mb-10">
              {activityData.length > 0 ? (
                activityData.map(([categoryName, items]) => (
                  <CategoryRow key={categoryName} categoryName={categoryName} items={items} />
                ))
              ) : (
                <div className="text-center text-white py-12">No collections available</div>
              )}
            </div>

            {/* ── Activities ── */}
            <section className="w-full mb-16 lg:mb-24">
              <div className="flex flex-col gap-2 items-start mb-6">
                <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
                  ACTIVITIES
                </h1>
                <div className="flex gap-2">
                  <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
                  <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
                  <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
                  <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg w-full">
                <table className="w-full min-w-[800px] text-white">
                  <thead className="bg-[#00134C]">
                    <tr className="text-left">
                      {["Name", "Type", "Buyer", "Seller", "Price", "Time"].map((h, i) => (
                        <th key={i} className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[16px] font-inter font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staticActivityData.map((item, i) => (
                      <tr key={i} className="border-b border-[#0B2A6F]">
                        <td className="px-4 lg:px-6 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden"
                              style={{ background: "linear-gradient(180deg, #977C34 0%, #493F26 100%)" }}
                            >
                              <img
                                src={i % 2 === 0 ? land1Image : ManImage}
                                alt="Collection"
                                className="w-full h-full object-cover object-top scale-x-[-1]"
                              />
                            </div>
                            <span className="text-sm lg:text-[16px] font-inter font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 text-sm font-inter align-middle">{item.type}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm font-inter align-middle">{item.buyer}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm font-inter align-middle">{item.seller}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm font-inter align-middle">{item.price}</td>
                        <td className="px-4 lg:px-6 py-3 text-sm font-inter align-middle">{getDaysAgo(item.time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </div>
      )}
    </>
  );
}

export default MarketPlace;
