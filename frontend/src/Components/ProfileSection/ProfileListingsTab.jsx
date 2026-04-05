import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutList } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

// Maps activityType key → column label
const ACTIVITY_COLS = [
  { key: "selling_general",  label: "Selling General" },
  { key: "selling_auction",  label: "Selling Auction" },
  { key: "buying_general",   label: "Buying General"  },
  { key: "buying_auction",   label: "Buying Auction"  },
  { key: "trading",          label: "Trading"         },
  { key: "hiring",           label: "Hiring"          },
];

// Capitalise first letter of each word
const capWords = (str) =>
  str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : "";

// Format price cell based on activityType
function PriceCell({ listing }) {
  if (!listing) return <span className="text-white/15">—</span>;

  const { activityType, price, currentOffer, reservePrice, currentBid, status } = listing;
  const isExpired = status === "expired" || status === "cancelled";

  const statusDot = isExpired ? (
    <span className="ml-1 text-[9px] text-red-400/60">(expired)</span>
  ) : null;

  if (activityType === "selling_general") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && (
          <span className="text-white/80 text-[11px] font-semibold">${price} USDC{statusDot}</span>
        )}
        {currentOffer != null && (
          <span className="text-green-300/70 text-[10px]">${currentOffer} C.Offer</span>
        )}
      </div>
    );
  }

  if (activityType === "selling_auction") {
    return (
      <div className="flex flex-col gap-0.5">
        {reservePrice != null && (
          <span className="text-white/80 text-[11px] font-semibold">${reservePrice} Reserve{statusDot}</span>
        )}
        {currentBid != null && (
          <span className="text-amber-300/70 text-[10px]">${currentBid} C.Bid</span>
        )}
      </div>
    );
  }

  if (activityType === "buying_general") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && (
          <span className="text-blue-300/80 text-[11px] font-semibold">${price} Price{statusDot}</span>
        )}
        {currentOffer != null && (
          <span className="text-green-300/70 text-[10px]">${currentOffer} Offer</span>
        )}
      </div>
    );
  }

  if (activityType === "buying_auction") {
    return (
      <div className="flex flex-col gap-0.5">
        {reservePrice != null && (
          <span className="text-blue-300/70 text-[11px] font-semibold">${reservePrice} Reserve{statusDot}</span>
        )}
        {currentBid != null && (
          <span className="text-amber-300/70 text-[10px]">${currentBid} C.Bid</span>
        )}
      </div>
    );
  }

  if (activityType === "trading") {
    return (
      <span className="text-white/50 text-[11px]">
        {listing.itemName || "Listed"}{statusDot}
      </span>
    );
  }

  if (activityType === "hiring") {
    return (
      <div className="flex flex-col gap-0.5">
        {price != null && (
          <span className="text-purple-300/80 text-[11px] font-semibold">${price} / day{statusDot}</span>
        )}
      </div>
    );
  }

  return <span className="text-white/20 text-[10px]">—</span>;
}

// ── Preview / dummy data (shown when no real listings exist) ─────────────────
const PREVIEW_GROUPED = {
  skins: [
    { _id: "p1", itemName: "Gen Snake Skin",   activityType: "selling_general",  price: 150, currentOffer: 280,  status: "active", createdAt: new Date().toISOString() },
    { _id: "p2", itemName: "XYZ",              activityType: "selling_auction",  reservePrice: 320, currentBid: 280, status: "active", createdAt: new Date().toISOString() },
    { _id: "p3", itemName: "ABC",              activityType: "buying_general",   price: 410, currentOffer: 350,  status: "active", createdAt: new Date().toISOString() },
    { _id: "p4", itemName: "123",              activityType: "buying_auction",   reservePrice: 1100, currentBid: 2080, status: "active", createdAt: new Date().toISOString() },
    { _id: "p5", itemName: "Snake Royal Suit", activityType: "buying_auction",   reservePrice: 750, currentBid: 880, status: "active", createdAt: new Date().toISOString() },
  ],
  "military badges": [
    { _id: "p6", itemName: "Dragon Slayer Elite", activityType: "selling_auction", reservePrice: 3500, currentBid: 7880, status: "active", createdAt: new Date().toISOString() },
    { _id: "p7", itemName: "UH45HG",              activityType: "selling_general", price: 150, currentOffer: 280,  status: "active", createdAt: new Date().toISOString() },
    { _id: "p8", itemName: "G4B45BB",             activityType: "buying_auction",  reservePrice: 2500, currentBid: 5580, status: "active", createdAt: new Date().toISOString() },
    { _id: "p9", itemName: "G45B45RR",            activityType: "buying_auction",  reservePrice: 6500, currentBid: 5980, status: "active", createdAt: new Date().toISOString() },
  ],
  specialists: [],
  weapons: [],
  "body armour": [],
  spaceships: [],
  vehicles: [],
  artwork: [],
  "land/bases": [],
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileListingsTab({ token }) {
  const [grouped, setGrouped] = useState({}); // { categoryKey: [listing, ...] }
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const authToken = token || localStorage.getItem("token");
        const res = await fetch(`${BACKEND_BASE_URL}/api/v1/listings/my`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        const data = await res.json();
        if (data.success && Object.keys(data.grouped || {}).length > 0) {
          setGrouped(data.grouped);
        } else {
          // No real data — show preview
          setGrouped(PREVIEW_GROUPED);
        }
      } catch (err) {
        console.error("ProfileListingsTab fetch error:", err);
        setGrouped(PREVIEW_GROUPED);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [token]);

  // All known categories — always list them all in dropdown
  const ALL_KNOWN = [
    "skins", "military badges", "military badges and collectables",
    "specialists", "weapons", "body armour", "spaceships",
    "vehicles", "racing vehicles", "artwork", "land and bases", "land/bases",
  ];
  const allCategories = [
    ...ALL_KNOWN.filter((c) => Object.keys(grouped).includes(c)),
    ...Object.keys(grouped).filter((c) => !ALL_KNOWN.includes(c)),
  ];

  // Close dropdown on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Categories to show in table — all when "all", one when filtered
  const categoriesToShow =
    selectedCategory === "all" ? allCategories : [selectedCategory];

  // Build per-category itemMap: { itemName: { activityType: listing } }
  const buildItemMap = (listings) => {
    const map = {};
    listings.forEach((l) => {
      if (!map[l.itemName]) map[l.itemName] = {};
      // Keep most recent active listing per activityType
      const existing = map[l.itemName][l.activityType];
      if (!existing || new Date(l.createdAt) > new Date(existing.createdAt)) {
        map[l.itemName][l.activityType] = l;
      }
    });
    return map;
  };

  return (
    <div className="py-4">
      {/* ── Header + Category Dropdown ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-white/50" />
          <h3 className="text-white font-semibold text-base">My Listings</h3>
          <span className="text-white/30 text-xs">
            {allCategories.reduce((sum, cat) => sum + (grouped[cat]?.length || 0), 0)} items
          </span>
        </div>

        {/* Category dropdown — always visible */}
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
                {allCategories.map((cat) => {
                  const hasItems = (grouped[cat]?.length || 0) > 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5 flex items-center justify-between gap-3"
                      style={{ color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.5)" }}
                    >
                      <span>{capWords(cat)}</span>
                      {!hasItems && (
                        <span className="text-[10px] text-white/20 italic">empty</span>
                      )}
                    </button>
                  );
                })}
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
      ) : (
        /* ── Table ── */
        <div className="w-full rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Table header */}
          <div
            className="grid w-full px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(0,20,80,0.5)",
              gridTemplateColumns: "1.6fr 1.4fr 1.4fr 1.4fr 1.4fr 1fr 1fr",
              minWidth: "820px",
            }}
          >
            <span>Item</span>
            {ACTIVITY_COLS.map((col) => (
              <span key={col.key}>{col.label}</span>
            ))}
          </div>

          {/* Category groups */}
          {categoriesToShow.map((cat) => {
            const listings = grouped[cat] || [];
            const itemMap = buildItemMap(listings);
            const itemNames = Object.keys(itemMap);

            return (
              <div key={cat}>
                {/* Category row header */}
                <div
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(0,42,168,0.08)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {capWords(cat)}
                </div>

                {/* Empty state row */}
                {itemNames.length === 0 && (
                  <div className="px-4 py-3 text-white/20 text-xs italic"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    No listings
                  </div>
                )}

                {/* Item rows */}
                {itemNames.map((itemName, i) => {
                  const typesMap = itemMap[itemName];
                  return (
                    <div
                      key={itemName}
                      className="grid w-full px-4 py-2.5 items-center"
                      style={{
                        background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        gridTemplateColumns: "1.6fr 1.4fr 1.4fr 1.4fr 1.4fr 1fr 1fr",
                        minWidth: "820px",
                      }}
                    >
                      <span className="text-white/80 text-xs font-medium truncate pr-2">
                        {itemName}
                      </span>
                      {ACTIVITY_COLS.map((col) => (
                        <div key={col.key} className="pr-2">
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
