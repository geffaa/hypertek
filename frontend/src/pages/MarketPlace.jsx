import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { FiChevronDown, FiStar, FiFilter } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import popularCollections from "../assets/images/popular/popolar.png";
import MarketNavBar from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import OverviewTab from "../Components/MarketPlaceCom/OverviewTab";
import FullScreenLoader from "../Components/Common/Spinner";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";

// ─── Category labels ──────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  skins:                              "Skins",
  weapons:                            "Weapons",
  "military badges and collectables": "Badges",
  "body armour":                      "Body Armour",
  specialists:                        "Specialists",
  spaceships:                         "Spaceships",
  "racing vehicles":                  "Vehicles",
  artwork:                            "Artwork",
  "land and bases":                   "Land",
  characters:                         "Characters",
  land:                               "Land",
};

const SORT_OPTIONS = [
  { key: "newest",   label: "Newest"           },
  { key: "price_lo", label: "Price: Low → High" },
  { key: "price_hi", label: "Price: High → Low" },
  { key: "name_az",  label: "Name: A → Z"       },
];

// ─── Framer Motion variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ item, index }) {
  const price     = item.priceETH  ?? item.price ?? null;
  const name      = item.name      || "Unnamed Item";
  const collection = item.parentName || item.collection?.name || "";
  const category  = (item.parentCategory || "").toLowerCase();
  const label     = CATEGORY_LABELS[category] || category || "Item";
  const imgSrc    = item.image ? getImageUrl(item.image) : popularCollections;
  const isNFA     = item.isNFA || item.type === "NFA";

  return (
    <motion.div
      variants={fadeUp}
      custom={index % 10}
      className="group flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#0a1a4a] to-[#050d28]">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = popularCollections; }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* NFA badge */}
        {isNFA && (
          <div
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
            style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}
          >
            NFA
          </div>
        )}

        {/* Category badge */}
        <div
          className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/80"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {label}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3.5 flex-1">
        {collection && (
          <p className="text-white/40 text-[10px] uppercase tracking-wider truncate">{collection}</p>
        )}
        <h3 className="text-white font-semibold text-sm leading-snug truncate">{name}</h3>

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <p className="text-white/40 text-[10px] mb-0.5">Price</p>
            <p className="text-white font-bold text-sm">
              {price != null ? `${price} USDC` : "—"}
            </p>
          </div>
          <Link
            to="/buy-nfa"
            state={{ item }}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold transition-all duration-200 hover:brightness-125"
            style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter / Sort bar ────────────────────────────────────────────────────────
function FilterBar({ categories, activeCategory, onCategory, sort, onSort, total }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-3 mb-6 sm:mb-8">
      {/* Category chips row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => onCategory("all")}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
          style={{
            background: activeCategory === "all" ? "#002AA8" : "rgba(255,255,255,0.06)",
            border: activeCategory === "all" ? "1px solid rgba(0,80,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: activeCategory === "all" ? "#fff" : "rgba(255,255,255,0.6)",
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategory(cat)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              background: activeCategory === cat ? "#002AA8" : "rgba(255,255,255,0.06)",
              border: activeCategory === cat ? "1px solid rgba(0,80,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: activeCategory === cat ? "#fff" : "rgba(255,255,255,0.6)",
            }}
          >
            {CATEGORY_LABELS[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1))}
          </button>
        ))}
      </div>

      {/* Sort + count row */}
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs">
          {total} item{total !== 1 ? "s" : ""}
        </span>
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <FiFilter className="w-3 h-3" />
            <span>{SORT_OPTIONS.find((o) => o.key === sort)?.label || "Sort"}</span>
            <FiChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1 min-w-[160px] rounded-xl overflow-hidden z-20"
              style={{ background: "rgba(6,8,22,0.97)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { onSort(opt.key); setSortOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5"
                  style={{ color: sort === opt.key ? "#fff" : "rgba(255,255,255,0.55)" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── General tab ─────────────────────────────────────────────────────────────
function GeneralTab({ categoryEntries, search }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort]                     = useState("newest");
  const ref = useRef(null);

  // Flatten all items
  const allItems = categoryEntries.flatMap(([cat, items]) =>
    items.map((item) => ({ ...item, _cat: cat }))
  );

  // Unique categories (only those with items)
  const categories = categoryEntries.map(([cat]) => cat);

  // Filter
  const filtered = allItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item._cat === activeCategory;
    const matchesSearch   = !search || (item.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_lo") return (a.priceETH ?? 9999) - (b.priceETH ?? 9999);
    if (sort === "price_hi") return (b.priceETH ?? 0) - (a.priceETH ?? 0);
    if (sort === "name_az")  return (a.name || "").localeCompare(b.name || "");
    return 0; // newest: keep API order
  });

  return (
    <div className="py-8">
      {/* Section header */}
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">Marketplace</span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">
          General
        </h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          Browse NFAs and NFCs available for immediate purchase. Skins, weapons, specialists, spaceships, and more.
        </p>
      </motion.div>

      {/* Filter bar */}
      <FilterBar
        categories={categories}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        sort={sort}
        onSort={setSort}
        total={sorted.length}
      />

      {/* Product grid */}
      {sorted.length > 0 ? (
        <motion.div
          ref={ref}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {sorted.map((item, i) => (
            <ProductCard key={item._id || i} item={item} index={i} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="text-4xl mb-1">🔍</div>
          <p className="text-white/50 text-sm">
            {search ? `No results for "${search}"` : "No items available in this category yet."}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── NFA 101 tab ──────────────────────────────────────────────────────────────
function EduCard({ icon, title, gradientFrom, gradientTo, link }) {
  return (
    <Link
      to={link || "#"}
      className="flex flex-col rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div
        className="h-20 flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${gradientFrom || "#1a4fd6"}, ${gradientTo || "#0e2d8a"})` }}
      >
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="px-3 py-2.5" style={{ background: "rgba(0,0,0,0.55)" }}>
        <p className="text-white text-xs font-medium leading-snug line-clamp-2">{title}</p>
      </div>
    </Link>
  );
}

function Nfa101Tab({ items }) {
  return (
    <div className="py-8">
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">Education</span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">NFAs / NFCs 101</h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          New to NFAs and NFCs? Learn everything about Web3 assets, how to buy safely, and how the Hyper Tek ecosystem works.
        </p>
      </motion.div>

      {items.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {items.map((edu, i) => (
            <motion.div key={edu._id || i} variants={fadeUp} custom={i}>
              <EduCard {...edu} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-white/40 text-sm">No content available yet.</p>
      )}
    </div>
  );
}

// ─── Coming soon tab ──────────────────────────────────────────────────────────
function ComingSoonTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
      <div className="text-5xl mb-2">🚧</div>
      <h2 className="text-white font-[Goldman] font-bold text-2xl">{label}</h2>
      <p className="text-white/45 text-sm max-w-xs leading-relaxed">
        This section is under construction and will be available soon.
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function MarketPlace() {
  const [activeTab, setActiveTab]       = useState("overview");
  const [searchTerm, setSearchTerm]     = useState("");
  const [categoryEntries, setCategoryEntries] = useState([]);
  const [nft101, setNft101]             = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [collectionsRes, eduRes] = await Promise.all([
          axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`),
          axios.get(`${BACKEND_BASE_URL}/api/v1/nft101`),
        ]);

        if (eduRes.data.success) setNft101(eduRes.data.items || []);

        if (collectionsRes.data.success) {
          const parents = collectionsRes.data.nfts || collectionsRes.data.collections || [];
          const catMap  = {};
          for (const parent of parents) {
            try {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );
              if (subRes.data.success && subRes.data.subCollections?.length) {
                const cat = (parent.category || "other").toLowerCase();
                if (!catMap[cat]) catMap[cat] = [];
                catMap[cat].push(
                  ...subRes.data.subCollections.map((sub) => ({
                    ...sub,
                    parentId:       parent._id,
                    parentCategory: parent.category,
                    parentName:     parent.collection?.name || "",
                  }))
                );
              }
            } catch { /* skip failed sub-fetch */ }
          }
          setCategoryEntries(Object.entries(catMap));
        }
      } catch (err) {
        console.error("MarketPlace fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onTabChange={setActiveTab} />;
      case "general":
        return <GeneralTab categoryEntries={categoryEntries} search={searchTerm} />;
      case "nfa101":
        return <Nfa101Tab items={nft101} />;
      default: {
        const tabLabels = {
          auctions: "Auctions",
          quests:   "Quests / Trades",
          hire:     "Hire / Rent",
          bounty:   "Bounty",
        };
        return <ComingSoonTab label={tabLabels[activeTab] || activeTab} />;
      }
    }
  };

  return (
    <>
      {loading ? (
        <FullScreenLoader />
      ) : (
        <div className="min-h-screen bg-transparent relative z-10">
          {/* Banner — Section B */}
          <div className="mt-16">
            <MarketplaceBanner
              stats={[
                { num: "5K",    label: "Total Items"  },
                { num: "50.5K", label: "Total Volume" },
                { num: "3.5K",  label: "Listed"       },
                { num: "2.6K",  label: "Owners"       },
              ]}
            />
          </div>

          {/* Nav — Section C (sticky) */}
          <MarketNavBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={searchTerm}
            onSearch={setSearchTerm}
          />

          {/* Tab content */}
          <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8">
            {renderTabContent()}
          </div>
        </div>
      )}
    </>
  );
}

export default MarketPlace;
