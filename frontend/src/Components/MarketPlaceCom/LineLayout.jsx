import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDownUp, Search, ChevronRight } from "lucide-react";
import LazyImage from "../Common/LazyImage";
import popularFallback from "../../assets/images/popular/popolar.png";
import { getImageUrl } from "../../Config";

// ── Item card ─────────────────────────────────────────────────────────────────
function LineCard({ item }) {
  const isDummy = item.isDummy === true;
  const navigate = useNavigate();
  const name     = item.name || "Unnamed";
  const price    = item.priceETH ?? item.price ?? null;
  const imgSrc   = item.image ? getImageUrl(item.image) : null;
  const isNFA    = item.isNFA || item.type === "NFA";
  const category = (item.parentCategory || "").toLowerCase().trim();

  return (
    <div
      className="flex-shrink-0 w-[150px] sm:w-[170px] flex flex-col rounded-xl overflow-hidden cursor-pointer group"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: isNFA ? "1px solid rgba(0,80,255,0.5)" : "1px solid rgba(255,255,255,0.09)",
      }}
      onClick={() => {
        if (isDummy) {
          navigate(`/collections/${encodeURIComponent(category)}`);
        } else {
          navigate("/buy-nfa", {
            state: { subCollectionId: item._id, parentId: item.parentId, item },
          });
        }
      }}
    >
      <div className="relative">
        <LazyImage
          src={imgSrc}
          alt={name}
          fallback={popularFallback}
          className="w-full h-[120px] sm:h-[135px]"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isNFA && (
          <>
            <div className="absolute inset-0 ring-2 ring-inset ring-[#002AA8] pointer-events-none" />
            <div
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}
            >
              NFA
            </div>
          </>
        )}
        {isDummy && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(0,0,0,0.30)" }}>
            <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest select-none"
              style={{ transform: "rotate(-30deg)", textShadow: "0 1px 4px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
              Dummy Content
            </span>
          </div>
        )}
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

// ── Label/control panel — always on LEFT ──────────────────────────────────────
function LabelPanel({ category, label, icon, sortDesc, setSortDesc, showSearch, setShowSearch, search, setSearch }) {
  return (
    <div
      className="flex-shrink-0 w-[120px] sm:w-[140px] flex flex-col items-center justify-center gap-2 relative z-10 py-3 px-2"
      style={{
        background: "linear-gradient(to right, #060610 65%, transparent 100%)",
        minHeight: 160,
      }}
    >
      <span className="text-3xl sm:text-4xl select-none">{icon}</span>

      <Link
        to={`/collections/${encodeURIComponent(category)}`}
        className="text-white/80 text-[11px] sm:text-xs font-semibold text-center uppercase tracking-wide leading-tight hover:text-white transition-colors flex items-center gap-0.5 group"
      >
        {label}
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      </Link>

      <div className="flex items-center gap-1.5 mt-1">
        <button
          onClick={() => setSortDesc(v => !v)}
          title={sortDesc ? "Sorted: High → Low" : "Sort by price"}
          className="p-1 rounded transition-colors"
          style={{
            background: sortDesc ? "rgba(0,42,168,0.6)" : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: sortDesc ? "#fff" : "rgba(255,255,255,0.4)",
          }}
        >
          <ArrowDownUp className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={() => { setShowSearch(v => !v); if (showSearch) setSearch(""); }}
          title="Search this category"
          className="p-1 rounded transition-colors"
          style={{
            background: showSearch ? "rgba(0,42,168,0.6)" : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: showSearch ? "#fff" : "rgba(255,255,255,0.4)",
          }}
        >
          <Search className="w-2.5 h-2.5" />
        </button>
      </div>

      {showSearch && (
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          autoFocus
          className="w-full px-2 py-1 rounded text-[10px] text-white placeholder-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
        />
      )}

      <Link
        to={`/collections/${encodeURIComponent(category)}`}
        className="px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-semibold text-white/70 hover:text-white border border-white/15 hover:border-white/35 transition-all whitespace-nowrap"
        style={{ background: "rgba(0,42,168,0.3)" }}
      >
        Show All
      </Link>
    </div>
  );
}

// ── LineLayout ─────────────────────────────────────────────────────────────────
// direction="left"  → scrollLeft  animation  (items flow right→left, exit on right)
// direction="right" → scrollRight animation  (items flow left→right, exit on left)
// Icon panel is ALWAYS on the LEFT for both directions — zig-zag is scroll direction only.
export default function LineLayout({ category, label, icon, items, direction = "left" }) {
  const scrollRight = direction === "right";

  const [search, setSearch]         = useState("");
  const [sortDesc, setSortDesc]     = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const processed = useMemo(() => {
    let result = items || [];
    if (search) result = result.filter(item => (item.name || "").toLowerCase().includes(search.toLowerCase()));
    if (sortDesc) result = [...result].sort((a, b) => (b.priceETH ?? b.price ?? 0) - (a.priceETH ?? a.price ?? 0));
    return result;
  }, [items, search, sortDesc]);

  if (!processed.length && !search) return null;

  // Duplicate to fill at least 10 cards for seamless loop
  const fill  = Math.max(1, Math.ceil(10 / (processed.length || 1)));
  const track = Array.from({ length: fill * 2 }, () => processed).flat();

  return (
    <div className="flex items-stretch py-3">

      {/* Icon/label panel — always LEFT */}
      <LabelPanel
        category={category} label={label} icon={icon}
        sortDesc={sortDesc} setSortDesc={setSortDesc}
        showSearch={showSearch} setShowSearch={setShowSearch}
        search={search} setSearch={setSearch}
      />

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        {/* Fade on left edge (icon side) */}
        <div
          className="absolute top-0 bottom-0 left-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #060610, transparent)" }}
        />
        {/* Fade on right edge */}
        <div
          className="absolute top-0 bottom-0 right-0 w-8 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #060610, transparent)" }}
        />

        {processed.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[160px] text-white/25 text-xs">
            No results for "{search}"
          </div>
        ) : (
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
