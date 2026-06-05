import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import LazyImage from "../Common/LazyImage";
import overview1 from "../../assets/images/Overview/overview1.jpg";
import { getImageUrl } from "../../Config";

// ── Category i18n key lookup ──────────────────────────────────────────────────
const CAT_I18N = {
  "skins":          "skins",
  "military badges":"militaryBadges",
  "specialists":    "specialists",
  "weapons":        "weapons",
  "body armour":    "bodyArmour",
  "spaceships":     "spaceships",
  "racing vehicles":"racingVehicles",
  "vehicles":       "racingVehicles",
  "artwork":        "artwork",
  "land and bases": "landAndBases",
  "land & bases":   "landAndBases",
  "general":        "general",
  "badges":         "militaryBadges",
};

// ── Item card ─────────────────────────────────────────────────────────────────
// Asset type badge config
const ASSET_BADGE = {
  NFA: { label: "NFA", bg: "rgba(124,58,237,0.9)", border: "rgba(124,58,237,0.6)", ring: "#7C3AED" },
  NFC: { label: "NFC", bg: "rgba(0,42,168,0.9)",   border: "rgba(0,80,255,0.5)",   ring: "#002AA8" },
  NFT: { label: "NFT", bg: "rgba(255,255,255,0.12)", border: "rgba(255,255,255,0.25)", ring: "transparent" },
};

// Varied gradient backgrounds per card — like OpenSea
const CARD_GRADIENTS = [
  "linear-gradient(145deg, #0f1f4a 0%, #06101f 100%)",   // navy
  "linear-gradient(145deg, #200f4a 0%, #100624 100%)",   // deep purple
  "linear-gradient(145deg, #0f4a1f 0%, #06200f 100%)",   // forest green
  "linear-gradient(145deg, #4a0f0f 0%, #200606 100%)",   // crimson
  "linear-gradient(145deg, #0f354a 0%, #061a22 100%)",   // ocean teal
  "linear-gradient(145deg, #4a370f 0%, #221b06 100%)",   // dark amber
  "linear-gradient(145deg, #250f4a 0%, #120724 100%)",   // violet
  "linear-gradient(145deg, #0f4a3f 0%, #06221d 100%)",   // emerald
  "linear-gradient(145deg, #3f1f0f 0%, #1d0e07 100%)",   // burnt orange
  "linear-gradient(145deg, #0f254a 0%, #060f22 100%)",   // midnight blue
  "linear-gradient(145deg, #340f4a 0%, #190624 100%)",   // royal purple
  "linear-gradient(145deg, #0f3a2f 0%, #061d16 100%)",   // jade
];

function hashIndex(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return h % mod;
}

function LineCard({ item }) {
  const isDummy   = item.isDummy === true;
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const name      = item.name || "Unnamed";
  const price     = item.priceETH ?? item.price ?? null;
  const imgSrc    = item.image ? getImageUrl(item.image) : null;

  // Resolve assetType — use new field, fall back to legacy isNFA boolean
  const assetType = item.assetType || (item.isNFA ? "NFA" : "NFT"); // NFC always has assetType set
  const badge     = ASSET_BADGE[assetType] || null;

  // Unique gradient per item based on ID/name hash
  const cardBg = CARD_GRADIENTS[hashIndex(item._id || item.name || "", CARD_GRADIENTS.length)];

  return (
    <div
      className="flex-shrink-0 w-[180px] sm:w-[210px] flex flex-col rounded-xl overflow-hidden cursor-pointer group"
      style={{
        background: cardBg,
        border: badge ? `1px solid ${badge.border}` : "1px solid rgba(255,255,255,0.09)",
      }}
      onClick={() => {
        navigate("/buy-nfa", {
          state: { subCollectionId: item._id, parentId: item.parentId, item, marketplaceScrollY: window.scrollY },
        });
      }}
    >
      {/* Image area — overflow-hidden clips the slide-up overlay */}
      <div className="relative overflow-hidden">
        <LazyImage
          src={imgSrc}
          alt={name}
          fallback={overview1}
          className="w-full h-[150px] sm:h-[170px] bg-transparent"
          imgClassName="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <>
            <div className="absolute inset-0 ring-2 ring-inset pointer-events-none" style={{ borderColor: badge.ring }} />
            {/* Asset type badge (NFA/NFC/NFT) */}
            <div
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ background: badge.bg, border: `1px solid ${badge.border}` }}
            >
              {badge.label}
            </div>
          </>
        )}
        {/* Category badge — top right */}
        {item.parentCategory && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
            style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)" }}>
            {(() => { const k = CAT_I18N[item.parentCategory]; return k ? t(`marketplace.general.categories.${k}`, item.parentCategory) : item.parentCategory; })()}
          </div>
        )}
        {isDummy && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none"
            style={{ background: "rgba(0,0,0,0.25)" }}>
            <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest select-none"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
              {t("marketplace.general.dummyContent", "Dummy Content")}
            </span>
          </div>
        )}

        {/* Hover overlay — slides up from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.93) 50%, transparent 100%)",
            paddingTop: 28,
            paddingBottom: 8,
            paddingLeft: 8,
            paddingRight: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <div style={{
            width: "100%",
            padding: "5px 0",
            borderRadius: 5,
            background: price != null && !isDummy ? "rgba(0,42,168,0.95)" : "rgba(255,255,255,0.12)",
            border: price != null && !isDummy ? "1px solid rgba(0,80,255,0.7)" : "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textAlign: "center",
            textTransform: "uppercase",
          }}>
            {isDummy
              ? t("marketplace.general.dummyNotForSale", "Preview Only")
              : price != null
                ? t("marketplace.general.buyNow", "Buy Now")
                : t("marketplace.general.viewDetails", "View Details")}
          </div>
          {price != null && !isDummy && (
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 8.5 }}>
              {price} USDC
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2 flex-1">
        <p className="text-white/80 text-[11px] font-semibold truncate leading-tight">{name}</p>
        <p className="text-white/40 text-[10px] mt-auto">
          {price != null ? `${price} USDC` : "—"}
        </p>
      </div>
    </div>
  );
}

// ── Sort options built inside component to pick up t() ───────────────────────
function useSortOptions() {
  const { t } = useTranslation();
  return [
    { value: "",           label: t("marketplace.general.sort.default",   "Default") },
    { value: "price_asc",  label: t("marketplace.general.sort.priceAsc",  "Price: Low → High") },
    { value: "price_desc", label: t("marketplace.general.sort.priceDesc", "Price: High → Low") },
    { value: "name_asc",   label: t("marketplace.general.sort.nameAsc",   "Name: A → Z") },
    { value: "name_desc",  label: t("marketplace.general.sort.nameDesc",  "Name: Z → A") },
  ];
}

// ── Label/control panel — always on LEFT ──────────────────────────────────────
function LabelPanel({ category, label, icon, sortBy, setSortBy, minPrice, setMinPrice, maxPrice, setMaxPrice, search, setSearch }) {
  const [showFilter, setShowFilter] = useState(false);
  const panelRef = useRef(null);
  const { t } = useTranslation();
  const sortOptions = useSortOptions();

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActive = sortBy || search || minPrice || maxPrice;

  const clearAll = () => {
    setSortBy("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 w-[140px] sm:w-[165px] flex flex-col items-center justify-center gap-2.5 relative z-20 py-4 px-3"
      style={{
        background: "linear-gradient(to right, #060610 65%, transparent 100%)",
        minHeight: 180,
      }}
    >
      <span className="text-4xl sm:text-5xl select-none">{icon}</span>

      <Link
        to={`/collections/${encodeURIComponent(category)}`}
        className="text-white/80 text-[12px] sm:text-[13px] font-semibold text-center uppercase tracking-wide leading-tight hover:text-white transition-colors flex flex-wrap items-center justify-center gap-0.5 group"
      >
        {label}
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      </Link>

      {/* Inline search */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5, padding: "4px 8px" }}>
        <Search style={{ width: 10, height: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("marketplace.general.search", "Search...")}
          style={{
            background: "none", border: "none", outline: "none",
            color: "#fff", fontSize: 10, width: "100%",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0 }}>
            <X style={{ width: 9, height: 9 }} />
          </button>
        )}
      </div>

      {/* Filter + Show All row */}
      <div style={{ display: "flex", gap: 4, width: "100%" }}>
        <button
          onClick={() => setShowFilter(v => !v)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "3px 8px", borderRadius: 5,
            background: hasActive ? "rgba(0,42,168,0.7)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${hasActive ? "rgba(0,80,255,0.6)" : "rgba(255,255,255,0.12)"}`,
            color: hasActive ? "#fff" : "rgba(255,255,255,0.5)",
            fontSize: 9, fontWeight: 600, letterSpacing: "0.05em",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <SlidersHorizontal style={{ width: 10, height: 10 }} />
          {t("marketplace.general.filter", "Filter")}
          {hasActive && (
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
          )}
        </button>

        <Link
          to={`/collections/${encodeURIComponent(category)}`}
          className="text-[9px] sm:text-[10px] font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/35 transition-all whitespace-nowrap"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: "rgba(0,42,168,0.3)" }}
        >
          {t("marketplace.general.showAll", "Show All")}
        </Link>
      </div>

      {/* Dropdown */}
      {showFilter && (
        <div
          style={{
            position: "absolute", top: 0, left: "calc(100% + 6px)",
            width: 210, zIndex: 50,
            background: "rgba(4,8,28,0.98)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            padding: "10px 12px",
            display: "flex", flexDirection: "column", gap: 10,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>
              {t("marketplace.general.filterSort", "Filter & Sort")}
            </span>
            <button onClick={() => setShowFilter(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "2px" }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Sort */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", fontWeight: 600 }}>{t("marketplace.general.sortBy", "Sort By")}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowFilter(false); }}
                  style={{
                    textAlign: "left", padding: "5px 8px", borderRadius: 4,
                    background: sortBy === opt.value ? "rgba(0,42,168,0.6)" : "transparent",
                    border: `1px solid ${sortBy === opt.value ? "rgba(0,80,255,0.5)" : "transparent"}`,
                    color: sortBy === opt.value ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: 10, cursor: "pointer", transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (sortBy !== opt.value) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (sortBy !== opt.value) e.currentTarget.style.background = "transparent"; }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", fontWeight: 600 }}>{t("marketplace.general.priceRange", "Price Range (USDC)")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder={t("marketplace.general.min", "Min")}
                min={0}
                style={{
                  width: "100%", padding: "4px 6px", borderRadius: 4,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", fontSize: 10, outline: "none",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, flexShrink: 0 }}>—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder={t("marketplace.general.max", "Max")}
                min={0}
                style={{
                  width: "100%", padding: "4px 6px", borderRadius: 4,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", fontSize: 10, outline: "none",
                }}
              />
            </div>
            {(minPrice || maxPrice) && (
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  padding: "4px 0", borderRadius: 4, cursor: "pointer",
                  background: "rgba(0,42,168,0.6)", border: "1px solid rgba(0,80,255,0.5)",
                  color: "#fff", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
                  transition: "all 0.15s", width: "100%",
                }}
              >
                {t("marketplace.general.apply", "Apply")}
              </button>
            )}
          </div>

          {/* Clear all */}
          {hasActive && (
            <button
              onClick={clearAll}
              style={{
                padding: "5px 0", borderRadius: 5, cursor: "pointer",
                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                color: "rgba(248,113,113,0.9)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
                transition: "all 0.15s",
              }}
            >
              {t("marketplace.general.clearAll", "Clear All Filters")}
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// ── LineLayout ─────────────────────────────────────────────────────────────────
export default function LineLayout({ category, label, icon, items, direction = "left" }) {
  const scrollRight = direction === "right";

  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("");
  const [minPrice, setMinPrice]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");

  const processed = useMemo(() => {
    let result = items || [];

    if (search) result = result.filter(item =>
      (item.name || "").toLowerCase().includes(search.toLowerCase())
    );
    if (minPrice !== "") result = result.filter(item => (item.priceETH ?? item.price ?? 0) >= Number(minPrice));
    if (maxPrice !== "") result = result.filter(item => (item.priceETH ?? item.price ?? 0) <= Number(maxPrice));

    if (sortBy === "price_asc")  result = [...result].sort((a, b) => (a.priceETH ?? a.price ?? 0) - (b.priceETH ?? b.price ?? 0));
    if (sortBy === "price_desc") result = [...result].sort((a, b) => (b.priceETH ?? b.price ?? 0) - (a.priceETH ?? a.price ?? 0));
    if (sortBy === "name_asc")   result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "name_desc")  result = [...result].sort((a, b) => (b.name || "").localeCompare(a.name || ""));

    return result;
  }, [items, search, sortBy, minPrice, maxPrice]);

  const isFiltering = search || sortBy || minPrice !== "" || maxPrice !== "";

  if (!processed.length && !isFiltering) return null;

  // When filtering/searching: show static grid (no duplication)
  // When idle: duplicate cards to fill scroll track for seamless loop
  const showStatic = isFiltering;
  const fill  = Math.max(1, Math.ceil(10 / (processed.length || 1)));
  const track = Array.from({ length: fill * 2 }, () => processed).flat();

  return (
    <div className="flex items-stretch py-3">

      {/* Icon/label panel — always LEFT */}
      <LabelPanel
        category={category} label={label} icon={icon}
        sortBy={sortBy} setSortBy={setSortBy}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        search={search} setSearch={setSearch}
      />

      {/* Scrolling / static track */}
      <div className="flex-1 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #060610, transparent)" }} />
        <div className="absolute top-0 bottom-0 right-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #060610, transparent)" }} />

        {processed.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[160px] text-white/25 text-xs">
            {t("marketplace.general.noResults", "No results found")}
          </div>
        ) : showStatic ? (
          /* Static layout when filtering — no duplication, no animation */
          <div className="flex gap-3 px-4 py-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {processed.map((item, i) => (
              <LineCard key={`${item._id || i}-static`} item={item} />
            ))}
          </div>
        ) : (
          /* Animated scroll when idle */
          <div
            className={`flex gap-3 ${scrollRight ? "animate-scroll-right" : "animate-scroll-left"}`}
            style={{ width: "max-content" }}
          >
            {track.map((item, i) => (
              <LineCard key={`${item._id || i}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
