import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const CARD = {
  background: "#0c0c18",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
};

const STATUS_FILTERS = [
  { key: "all",       label: "All"       },
  { key: "active",    label: "Active"    },
  { key: "pending",   label: "Pending"   },
  { key: "sold",      label: "Sold"      },
  { key: "expired",   label: "Expired"   },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVITY_FILTERS = [
  { key: "all",             label: "All Types"     },
  { key: "selling_general", label: "Selling"       },
  { key: "selling_auction", label: "Auction (Sell)"},
  { key: "buying_general",  label: "Buying"        },
  { key: "buying_auction",  label: "Auction (Buy)" },
  { key: "trading",         label: "Trade"         },
  { key: "hiring",          label: "Hiring"        },
];

const STATUS_STYLE = {
  active:    { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   text: "#4ade80", dot: "#4ade80"  },
  pending:   { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24", dot: "#fbbf24"  },
  expired:   { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)",  text: "rgba(255,255,255,0.35)", dot: "rgba(255,255,255,0.2)" },
  sold:      { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.25)",  text: "#38bdf8", dot: "#38bdf8"  },
  cancelled: { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   text: "#f87171", dot: "#f87171"  },
};

const ACTIVITY_STYLE = {
  selling_general: { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)", text: "#c4b5fd" },
  selling_auction: { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)", text: "#c4b5fd" },
  buying_general:  { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.25)",  text: "#7dd3fc" },
  buying_auction:  { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.25)",  text: "#7dd3fc" },
  trading:         { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24" },
  hiring:          { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.25)",  text: "#2dd4bf" },
};

const ACTIVITY_LABEL = {
  selling_general: "Selling",
  selling_auction: "Auction ↑",
  buying_general:  "Buying",
  buying_auction:  "Auction ↓",
  trading:         "Trade",
  hiring:          "Hiring",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.expired;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, color: s.text, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function ActivityBadge({ type }) {
  const s = ACTIVITY_STYLE[type];
  if (!s) return <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{type || "—"}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 6, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, color: s.text, whiteSpace: "nowrap" }}>
      {ACTIVITY_LABEL[type] || type}
    </span>
  );
}

function SummaryCard({ label, value, borderColor, textColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...CARD,
        padding: "16px 18px",
        borderColor: active ? "rgba(0,80,255,0.5)" : borderColor,
        boxShadow: active ? "0 0 0 1px rgba(0,80,255,0.2)" : "none",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        transition: "all 0.15s",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
      <p style={{ color: textColor, fontSize: 24, fontWeight: 800, margin: "6px 0 0", letterSpacing: "-0.5px" }}>{value}</p>
    </button>
  );
}

function ExpiryCell({ listing }) {
  if (!listing.expiresAt) return <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>—</span>;
  const days = Math.ceil((new Date(listing.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24));
  const isActive = ["active", "pending"].includes(listing.status);
  if (isActive) {
    if (days <= 0) return <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>Expired</span>;
    if (days <= 1) return <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>{days}d left !</span>;
    return <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{days}d left</span>;
  }
  return (
    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
      {new Date(listing.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function MarketListings() {
  const token = localStorage.getItem("token");

  const [listings,      setListings]      = useState([]);
  const [summary,       setSummary]       = useState({ active: 0, pending: 0, expired: 0, sold: 0, cancelled: 0, total: 0 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [actFilter,     setActFilter]     = useState("all");
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(PAGE_SIZE_OPTIONS[0]);
  const [totalItems,    setTotalItems]    = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [cancelModal,   setCancelModal]   = useState(null); // { id, itemName, sellerName }
  const [cancelReason,  setCancelReason]  = useState("");
  const [cancelling,    setCancelling]    = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status",       statusFilter);
      if (actFilter    !== "all") params.set("activityType", actFilter);
      if (search.trim())          params.set("search",       search.trim());
      params.set("page",  String(page));
      params.set("limit", String(pageSize));

      const res = await axios.get(
        `${Dashboard_Base_Url}/v1/admin/nfa/market-listings?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings(res.data.data         || []);
      setSummary(res.data.summary       || {});
      setTotalItems(res.data.total      || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load market listings");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, actFilter, search, page, pageSize, token]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { setPage(1); }, [statusFilter, actFilter, search, pageSize]);

  // ── Cancel ────────────────────────────────────────────────────────────────

  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await axios.put(
        `${Dashboard_Base_Url}/v1/admin/nfa/market-listings/${cancelModal.id}/cancel`,
        { reason: cancelReason.trim() || "Cancelled by admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Listing cancelled");
      setListings(prev => prev.map(l => l._id === cancelModal.id ? { ...l, status: "cancelled" } : l));
      setSummary(prev => ({ ...prev, active: Math.max(0, (prev.active || 0) - 1), cancelled: (prev.cancelled || 0) + 1 }));
      setCancelModal(null);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel listing");
    } finally {
      setCancelling(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatPrice = (listing) => {
    if (listing.activityType?.includes("auction")) {
      if (listing.currentBid)   return `$${Number(listing.currentBid).toLocaleString()} bid`;
      if (listing.reservePrice) return `$${Number(listing.reservePrice).toLocaleString()} reserve`;
      return "—";
    }
    return listing.price ? `$${Number(listing.price).toLocaleString()}` : "—";
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    if (range[0] > 1) { if (range[0] > 2) range.unshift("..."); range.unshift(1); }
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) range.push("...");
      range.push(totalPages);
    }
    return range;
  };

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full pb-12" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 style={{ fontSize: 25, fontWeight: 600, color: "white", margin: 0 }}>Market Listings</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
          Monitor all P2P marketplace activity — selling, auctions, trades, and hiring across the platform
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { key: "total",     label: "Total",     borderColor: "rgba(255,255,255,0.08)", textColor: "white"        },
          { key: "active",    label: "Active",    borderColor: "rgba(34,197,94,0.2)",    textColor: "#4ade80"      },
          { key: "pending",   label: "Pending",   borderColor: "rgba(251,191,36,0.2)",   textColor: "#fbbf24"      },
          { key: "sold",      label: "Sold",      borderColor: "rgba(56,189,248,0.2)",   textColor: "#38bdf8"      },
          { key: "expired",   label: "Expired",   borderColor: "rgba(255,255,255,0.08)", textColor: "rgba(255,255,255,0.4)" },
          { key: "cancelled", label: "Cancelled", borderColor: "rgba(239,68,68,0.2)",    textColor: "#f87171"      },
        ].map(({ key, label, borderColor, textColor }) => (
          <SummaryCard
            key={key}
            label={label}
            value={summary[key] ?? 0}
            borderColor={borderColor}
            textColor={textColor}
            active={statusFilter === key}
            onClick={key !== "total" ? () => setStatusFilter(prev => prev === key ? "all" : key) : undefined}
          />
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1"
          style={{ minWidth: 180, maxWidth: 320, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search item or seller…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, lineHeight: 1, cursor: "pointer", background: "none", border: "none" }}>×</button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid",
                borderColor: statusFilter === f.key ? "rgba(0,80,255,0.5)" : "rgba(255,255,255,0.1)",
                background: statusFilter === f.key ? "rgba(0,42,168,0.3)" : "rgba(255,255,255,0.04)",
                color: statusFilter === f.key ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity type dropdown */}
        <select
          value={actFilter}
          onChange={e => setActFilter(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", background: "#0c0c18", color: "rgba(255,255,255,0.6)", outline: "none", cursor: "pointer", marginLeft: "auto" }}
        >
          {ACTIVITY_FILTERS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Loading listings…</p>
        </div>
      ) : listings.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 10 }}>
          <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No listings found</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Item", "Seller", "Type", "Price", "Commission", "Expires", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr
                  key={listing._id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Item */}
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {listing.itemImage ? (
                        <img
                          src={listing.itemImage}
                          alt={listing.itemName}
                          style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>IMG</span>
                        </div>
                      )}
                      <div>
                        <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{listing.itemName || "—"}</p>
                        {listing.category && (
                          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "2px 0 0", textTransform: "capitalize" }}>{listing.category}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Seller */}
                  <td style={{ padding: "12px 20px" }}>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 }}>{listing.userName || "Anonymous"}</p>
                    {listing.userWallet && (
                      <a
                        href={`https://basescan.org/address/${listing.userWallet}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: "rgba(96,165,250,0.7)", fontSize: 11, fontFamily: "monospace", marginTop: 2, display: "block", textDecoration: "none" }}
                        onMouseEnter={e => e.target.style.color = "#60a5fa"}
                        onMouseLeave={e => e.target.style.color = "rgba(96,165,250,0.7)"}
                      >
                        {listing.userWallet.slice(0, 6)}…{listing.userWallet.slice(-4)}
                      </a>
                    )}
                  </td>

                  {/* Type */}
                  <td style={{ padding: "12px 20px" }}>
                    <ActivityBadge type={listing.activityType} />
                    {listing.questEnabled && (
                      <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 6, background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.25)", fontSize: 10, fontWeight: 700, color: "#2dd4bf" }}>
                        Quest
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td style={{ padding: "12px 20px", color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "monospace", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {formatPrice(listing)}
                  </td>

                  {/* Commission */}
                  <td style={{ padding: "12px 20px" }}>
                    {listing.commissionTier ? (
                      <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>{listing.commissionTier}%</span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>—</span>
                    )}
                  </td>

                  {/* Expires */}
                  <td style={{ padding: "12px 20px" }}>
                    <ExpiryCell listing={listing} />
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 20px" }}>
                    <StatusBadge status={listing.status} />
                  </td>

                  {/* Action */}
                  <td style={{ padding: "12px 16px" }}>
                    {["active", "pending"].includes(listing.status) && (
                      <button
                        onClick={() => setCancelModal({ id: listing._id, itemName: listing.itemName || "this listing", sellerName: listing.userName || "seller" })}
                        style={{ padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", transition: "all 0.15s", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
              Showing {from}–{to} of {totalItems} listings
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Per page:</span>
              {PAGE_SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  style={{ width: 30, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: pageSize === size ? "transparent" : "rgba(255,255,255,0.08)", background: pageSize === size ? "#002AA8" : "rgba(255,255,255,0.04)", color: pageSize === size ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.3 : 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" }}
            >
              ← Prev
            </button>

            {getPageNumbers().map((num, idx) =>
              num === "..." ? (
                <span key={`e-${idx}`} style={{ padding: "0 6px", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>…</span>
              ) : (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: num === page ? "transparent" : "rgba(255,255,255,0.08)", background: num === page ? "#002AA8" : "rgba(255,255,255,0.04)", color: num === page ? "white" : "rgba(255,255,255,0.5)", transition: "all 0.15s" }}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.3 : 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", padding: 16 }}>
          <div style={{ ...CARD, padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>

            {/* Icon + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Cancel Listing</h3>
            </div>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
              You are about to force-cancel <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>"{cancelModal.itemName}"</span> listed by <span style={{ color: "rgba(255,255,255,0.8)" }}>{cancelModal.sellerName}</span>. This will remove it from the marketplace immediately.
            </p>

            {/* Reason input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Reason <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none" }}>(optional — shown to seller)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Price below minimum buyback floor, fraudulent listing…"
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 13, outline: "none", resize: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,80,255,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setCancelModal(null); setCancelReason(""); }}
                disabled={cancelling}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              >
                Keep Listing
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: cancelling ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.2)", color: cancelling ? "rgba(248,113,113,0.5)" : "#f87171", fontSize: 13, fontWeight: 600, cursor: cancelling ? "not-allowed" : "pointer", transition: "all 0.15s" }}
              >
                {cancelling ? "Cancelling…" : "Cancel Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketListings;
