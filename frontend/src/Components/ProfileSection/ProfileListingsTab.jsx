import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutList } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

// Column definitions — order matches the visual table left→right
// Labels shown in the sub-header row beneath the brackets
const ACTIVITY_COLS = [
  { key: "selling_general",  label: "Selling",   group: "marketplace" },
  { key: "buying_general",   label: "Buying",    group: "marketplace" },
  { key: "selling_auction",  label: "Selling",   group: "auction"     },
  { key: "buying_auction",   label: "Buying",    group: "auction"     },
  { key: "trading",          label: "Trading",   group: "trade"       },
  { key: "on_hire",          label: "On Hire",   group: "on_hire"     },
  { key: "hiring",           label: "Hiring",    group: "hiring"      },
];

// Color per group used in sub-header + cell text
const GROUP_COLOR = {
  marketplace: "rgba(255,255,255,0.75)",
  auction:     "rgba(251,191,36,0.8)",
  trade:       "rgba(99,179,237,0.75)",
  on_hire:     "rgba(168,85,247,0.8)",
  hiring:      "rgba(168,85,247,0.8)",
};

// Grid column widths — item col + 7 data cols
const GRID_COLS = "1.5fr 1.1fr 1.1fr 1.1fr 1.1fr 0.9fr 0.9fr 0.9fr";
const MIN_WIDTH  = "860px";

const capWords = (str) =>
  str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

// ── Per-cell value renderer ───────────────────────────────────────────────────
function PriceCell({ listing }) {
  if (!listing) return <span className="text-white/15 text-[11px]">—</span>;

  const { activityType, price, currentOffer, reservePrice, currentBid, durationHours, status } = listing;
  const isExpired = status === "expired" || status === "cancelled";
  const dot = isExpired ? <span className="ml-1 text-[9px] text-red-400/60">(expired)</span> : null;

  if (activityType === "selling_general") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && <span className="text-white/80 text-[11px] font-semibold">${price} USDC{dot}</span>}
        {currentOffer != null && <span className="text-green-300/70 text-[10px]">${currentOffer} C.Offer</span>}
      </div>
    );
  }
  if (activityType === "selling_auction") {
    return (
      <div className="flex flex-col gap-0.5">
        {reservePrice != null && <span className="text-white/80 text-[11px] font-semibold">${reservePrice} Reserve{dot}</span>}
        {currentBid != null && <span className="text-amber-300/70 text-[10px]">${currentBid} C.Bid</span>}
      </div>
    );
  }
  if (activityType === "buying_general") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && <span className="text-blue-300/80 text-[11px] font-semibold">${price} Price{dot}</span>}
        {currentOffer != null && <span className="text-green-300/70 text-[10px]">${currentOffer} Offer</span>}
      </div>
    );
  }
  if (activityType === "buying_auction") {
    return (
      <div className="flex flex-col gap-0.5">
        {reservePrice != null && <span className="text-blue-300/70 text-[11px] font-semibold">${reservePrice} Reserve{dot}</span>}
        {currentBid != null && <span className="text-amber-300/70 text-[10px]">${currentBid} C.Bid</span>}
      </div>
    );
  }
  if (activityType === "trading") {
    return <span className="text-white/50 text-[11px]">{listing.itemName || "Listed"}{dot}</span>;
  }
  if (activityType === "on_hire") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && (
          <span className="text-purple-300/80 text-[11px] font-semibold">
            ${price} / {durationHours}h{dot}
          </span>
        )}
        <span className="text-white/30 text-[9px] capitalize">{status}</span>
      </div>
    );
  }
  if (activityType === "hiring") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && (
          <span className="text-purple-200/80 text-[11px] font-semibold">
            ${price} / {durationHours}h{dot}
          </span>
        )}
        <span className="text-amber-300/50 text-[9px]">active</span>
      </div>
    );
  }
  return <span className="text-white/20 text-[10px]">—</span>;
}

// ── Group bracket header — only MARKETPLACE and AUCTION get brackets (2-col spans)
// Standalone columns (Trading, On Hire, Hiring) skip this row — their label is in the sub-header
function GroupHeaderRow() {
  return (
    <div
      className="grid w-full px-4 pt-2 pb-0 text-[9px] font-bold uppercase tracking-widest"
      style={{ gridTemplateColumns: GRID_COLS, minWidth: MIN_WIDTH }}
    >
      {/* Item spacer */}
      <div />

      {/* MARKETPLACE bracket — spans selling_general + buying_general */}
      <div
        className="text-center py-1 rounded-t"
        style={{
          gridColumn: "span 2",
          borderTop:   "1px solid rgba(255,255,255,0.5)",
          borderLeft:  "1px solid rgba(255,255,255,0.5)",
          borderRight: "1px solid rgba(255,255,255,0.5)",
          color: "rgba(255,255,255,0.9)",
          letterSpacing: "0.12em",
        }}
      >
        MARKETPLACE
      </div>

      {/* AUCTION bracket — spans selling_auction + buying_auction */}
      <div
        className="text-center py-1 rounded-t"
        style={{
          gridColumn: "span 2",
          marginLeft: "4px",
          borderTop:   "1px solid rgba(251,191,36,0.6)",
          borderLeft:  "1px solid rgba(251,191,36,0.6)",
          borderRight: "1px solid rgba(251,191,36,0.6)",
          color: "rgba(251,191,36,0.95)",
          letterSpacing: "0.12em",
        }}
      >
        AUCTION
      </div>

      {/* Remaining 3 standalone columns — no bracket header (label is in sub-header row) */}
      <div /><div /><div />
    </div>
  );
}


// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileListingsTab({ token }) {
  const [grouped, setGrouped]               = useState({});
  const [loading, setLoading]               = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen]     = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const authToken = token || localStorage.getItem("token");
        const res = await fetch(`${BACKEND_BASE_URL}/api/v1/listings/my`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        const data = await res.json();
        if (data.success) {
          const CAT_ALIAS = {
            "military badges and collectables": "military badges",
            "vehicles":                         "racing vehicles",
            "land/bases":                       "land and bases",
          };
          const normalized = {};
          for (const [key, val] of Object.entries(data.grouped || {})) {
            const canonical = CAT_ALIAS[key.toLowerCase().trim()] || key;
            normalized[canonical] = normalized[canonical]
              ? [...normalized[canonical], ...val]
              : val;
          }
          setGrouped(normalized);
        } else {
          setGrouped({});
        }
      } catch (err) {
        console.error("ProfileListingsTab fetch error:", err);
        setGrouped({});
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [token]);

  const ALL_KNOWN = [
    "skins", "military badges", "specialists", "weapons",
    "body armour", "spaceships", "racing vehicles", "artwork", "land and bases", "general",
  ];
  const allCategories = [
    ...ALL_KNOWN.filter((c) => Object.keys(grouped).includes(c)),
    ...Object.keys(grouped).filter((c) => !ALL_KNOWN.includes(c)),
  ];

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categoriesToShow =
    selectedCategory === "all" ? allCategories : [selectedCategory];

  const buildItemMap = (listings) => {
    const map = {};
    listings.forEach((l) => {
      if (!map[l.itemName]) map[l.itemName] = {};
      const existing = map[l.itemName][l.activityType];
      if (!existing || new Date(l.createdAt) > new Date(existing.createdAt)) {
        map[l.itemName][l.activityType] = l;
      }
    });
    return map;
  };

  const totalItems = allCategories.reduce(
    (sum, cat) => sum + (grouped[cat]?.length || 0), 0
  );

  return (
    <div className="py-4">
      {/* ── Header + Category Dropdown ── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-white/50" />
          <h3 className="text-white font-semibold text-base">My Listings</h3>
          <span className="text-white/30 text-xs">{totalItems} items</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {selectedCategory === "all" ? "All Categories" : capWords(selectedCategory)}
            <ChevronDown
              className="w-3.5 h-3.5 text-white/40 transition-transform"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }}
            />
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-1 z-20 rounded-xl overflow-hidden min-w-[160px]"
              style={{
                background: "#0d1230",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <button
                onClick={() => { setSelectedCategory("all"); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
                style={{ color: selectedCategory === "all" ? "#fff" : "rgba(255,255,255,0.5)" }}
              >
                All Categories
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5 flex items-center justify-between gap-3"
                  style={{ color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.5)" }}
                >
                  <span>{capWords(cat)}</span>
                  {(grouped[cat]?.length || 0) === 0 && (
                    <span className="text-[10px] text-white/20 italic">empty</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <LayoutList className="w-8 h-8 text-white/15 mb-3" />
          <p className="text-white/30 text-sm font-medium">No listings yet</p>
          <p className="text-white/15 text-xs mt-1">Items you list on the marketplace will appear here</p>
        </div>
      ) : (
        /* ── Table ── */
        <div className="w-full rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Sticky group bracket headers */}
          <div style={{
            background: "rgba(0,20,80,0.95)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}>
            <GroupHeaderRow />

            {/* Column sub-headers */}
            <div
              className="grid w-full px-4 py-2 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                gridTemplateColumns: GRID_COLS,
                minWidth: MIN_WIDTH,
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-white/50">Item</span>
              {ACTIVITY_COLS.map((col, i) => {
                const prevGroup = i > 0 ? ACTIVITY_COLS[i - 1].group : null;
                const isGroupStart = prevGroup !== col.group;
                return (
                  <span
                    key={col.key}
                    className="text-center"
                    style={{
                      color: GROUP_COLOR[col.group],
                      borderLeft: isGroupStart && i > 0
                        ? "1px solid rgba(255,255,255,0.08)"
                        : undefined,
                    }}
                  >
                    {col.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Category groups */}
          {categoriesToShow.map((cat) => {
            const listings  = grouped[cat] || [];
            const itemMap   = buildItemMap(listings);
            const itemNames = Object.keys(itemMap);

            return (
              <div key={cat}>
                <div
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    background:   "rgba(0,42,168,0.08)",
                    borderTop:    "1px solid rgba(255,255,255,0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color:        "rgba(255,255,255,0.45)",
                  }}
                >
                  {capWords(cat)}
                </div>

                {itemNames.length === 0 && (
                  <div className="px-4 py-3 text-white/20 text-xs italic"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    No listings
                  </div>
                )}

                {itemNames.map((itemName, i) => {
                  const typesMap = itemMap[itemName];
                  return (
                    <div
                      key={itemName}
                      className="grid w-full px-4 py-2.5 items-center"
                      style={{
                        background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                        borderTop:  "1px solid rgba(255,255,255,0.04)",
                        gridTemplateColumns: GRID_COLS,
                        minWidth: MIN_WIDTH,
                      }}
                    >
                      <span className="text-white/80 text-xs font-medium truncate pr-2">
                        {itemName}
                      </span>
                      {ACTIVITY_COLS.map((col) => (
                        <div key={col.key} className="flex justify-center">
                          <PriceCell listing={typesMap[col.key] || null} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
