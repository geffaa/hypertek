import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_FILTERS = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "pending",   label: "Pending" },
  { key: "expired",   label: "Expired" },
  { key: "sold",      label: "Sold" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVITY_FILTERS = [
  { key: "all",             label: "All Types" },
  { key: "selling_general", label: "Selling" },
  { key: "selling_auction", label: "Auction (Sell)" },
  { key: "buying_general",  label: "Buying" },
  { key: "buying_auction",  label: "Auction (Buy)" },
  { key: "trading",         label: "Trade" },
  { key: "hiring",          label: "Hiring" },
];

const STATUS_STYLE = {
  active:    "bg-green-500/15 text-green-400 border border-green-500/30",
  pending:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  expired:   "bg-white/5 text-white/40 border border-white/10",
  sold:      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const ACTIVITY_STYLE = {
  selling_general: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  selling_auction: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  buying_general:  "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  buying_auction:  "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  trading:         "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  hiring:          "bg-teal-500/15 text-teal-300 border border-teal-500/30",
};

const ACTIVITY_LABEL = {
  selling_general: "Selling",
  selling_auction: "Auction ↑",
  buying_general:  "Buying",
  buying_auction:  "Auction ↓",
  trading:         "Trade",
  hiring:          "Hiring",
};

// ── Component ─────────────────────────────────────────────────────────────────

function MarketListings() {
  const token = localStorage.getItem("token");

  const [listings,  setListings]  = useState([]);
  const [summary,   setSummary]   = useState({ active: 0, pending: 0, expired: 0, sold: 0, cancelled: 0, total: 0 });
  const [loading,   setLoading]   = useState(true);

  // Filters
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  // Pagination
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(PAGE_SIZE_OPTIONS[0]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter   !== "all") params.set("status",       statusFilter);
      if (activityFilter !== "all") params.set("activityType", activityFilter);
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
  }, [statusFilter, activityFilter, page, pageSize, token]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { setPage(1); }, [statusFilter, activityFilter, pageSize]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatPrice = (listing) => {
    if (listing.activityType?.includes("auction")) {
      if (listing.currentBid)   return `$${listing.currentBid.toLocaleString()} (bid)`;
      if (listing.reservePrice) return `$${listing.reservePrice.toLocaleString()} (reserve)`;
      return "—";
    }
    return listing.price ? `$${listing.price.toLocaleString()}` : "—";
  };

  const daysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt) - Date.now()) / (1000 * 60 * 60 * 24));
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full pb-12">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-inter font-semibold text-[25px] text-white mb-1">Market Listings</h1>
        <p className="text-white/40 text-sm">Monitor all marketplace activity across the platform</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { key: "total",     label: "Total",     color: "border-white/10",     text: "text-white" },
          { key: "active",    label: "Active",    color: "border-green-500/30", text: "text-green-400" },
          { key: "pending",   label: "Pending",   color: "border-amber-500/30", text: "text-amber-400" },
          { key: "sold",      label: "Sold",      color: "border-blue-500/30",  text: "text-blue-400" },
          { key: "expired",   label: "Expired",   color: "border-white/10",     text: "text-white/50" },
          { key: "cancelled", label: "Cancelled", color: "border-red-500/30",   text: "text-red-400" },
        ].map(({ key, label, color, text }) => (
          <div
            key={key}
            className={`rounded-xl border ${color} p-4`}
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <p className={`font-bold text-xl ${text}`}>{summary[key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === f.key ? "bg-[#002AA8] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={activityFilter}
          onChange={e => setActivityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/70 border border-white/10 outline-none cursor-pointer ml-auto"
        >
          {ACTIVITY_FILTERS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">Loading listings…</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">No listings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Item</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Seller</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Type</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Price</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Commission</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Expires</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => {
                const days = daysLeft(listing.expiresAt);
                const expiringSoon = days !== null && days <= 1 && listing.status === "active";
                return (
                  <tr
                    key={listing._id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Item */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {listing.itemImage ? (
                          <img
                            src={listing.itemImage}
                            alt={listing.itemName}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white/20 text-xs">IMG</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{listing.itemName || "—"}</p>
                          <p className="text-white/30 text-xs mt-0.5 capitalize">{listing.category || "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-5 py-3">
                      <p className="text-white/80 text-sm">{listing.userName || "Anonymous"}</p>
                      {listing.userWallet && (
                        <p className="text-white/30 text-xs font-mono mt-0.5">
                          {listing.userWallet.slice(0, 6)}…{listing.userWallet.slice(-4)}
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${ACTIVITY_STYLE[listing.activityType] || ""}`}>
                        {ACTIVITY_LABEL[listing.activityType] || listing.activityType}
                      </span>
                      {listing.questEnabled && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          Quest
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 text-white/80 text-sm font-mono whitespace-nowrap">
                      {formatPrice(listing)}
                    </td>

                    {/* Commission */}
                    <td className="px-5 py-3 text-white/60 text-sm">
                      {listing.commissionTier ? `${listing.commissionTier}%` : "—"}
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-3">
                      {listing.expiresAt ? (
                        <span className={`text-xs ${expiringSoon ? "text-red-400 font-semibold" : "text-white/50"}`}>
                          {["active", "pending"].includes(listing.status)
                            ? days !== null && days > 0 ? `${days}d left` : "Expired"
                            : new Date(listing.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          }
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold capitalize ${STATUS_STYLE[listing.status] || ""}`}>
                        {listing.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-xs">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems} listings
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/30 text-xs">Per page:</span>
              {PAGE_SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`w-8 h-6 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    pageSize === size ? "bg-[#002AA8] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Prev
            </button>
            {getPageNumbers().map((num, idx) =>
              num === "..." ? (
                <span key={`e-${idx}`} className="px-2 text-white/30 text-xs select-none">…</span>
              ) : (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    num === page ? "bg-[#002AA8] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              )
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketListings;
