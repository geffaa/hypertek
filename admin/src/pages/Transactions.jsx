import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_STYLE = {
  succeeded: "bg-green-500/15 text-green-400 border border-green-500/30",
  pending:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  failed:    "bg-red-500/15 text-red-400 border border-red-500/30",
  cancelled: "bg-white/5 text-white/40 border border-white/10",
  refunded:  "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

const PROVIDER_STYLE = {
  stripe:  "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  paypal:  "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  crypto:  "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  card:    "bg-teal-500/15 text-teal-300 border border-teal-500/30",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function truncateTx(id) {
  if (!id) return "—";
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

// ── Component ─────────────────────────────────────────────────────────────────

function Transactions() {
  const [transactions,         setTransactions]         = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [searchQuery,          setSearchQuery]          = useState("");
  const [statusFilter,         setStatusFilter]         = useState("all");

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/history/get-history`);
        if (res.data.success) {
          setTransactions(res.data.data || []);
        } else {
          toast.error("Failed to load transactions");
        }
      } catch {
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Reset page on filter/search/pageSize change
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, pageSize]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = transactions.filter(tx => {
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (tx.gameTitle   || "").toLowerCase().includes(q) ||
      (tx.transactionId || "").toLowerCase().includes(q) ||
      (tx.provider    || "").toLowerCase().includes(q) ||
      (tx.itemType    || "").toLowerCase().includes(q)
    );
    return matchStatus && matchSearch;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from       = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to         = Math.min(page * pageSize, totalItems);
  const paged      = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Status counts for pills
  const counts = transactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1;
    return acc;
  }, {});

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-inter font-semibold text-[25px] text-white mb-1">Transaction History</h1>
          <p className="text-white/40 text-sm">{transactions.length} total records</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 flex-1 min-w-[200px] max-w-[340px]">
          <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, ID, provider…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white text-sm placeholder-white/30 w-full"
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "all",       label: "All" },
            { key: "succeeded", label: "Succeeded" },
            { key: "pending",   label: "Pending" },
            { key: "failed",    label: "Failed" },
            { key: "cancelled", label: "Cancelled" },
            { key: "refunded",  label: "Refunded" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === f.key
                  ? "bg-[#002AA8] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
              {f.key !== "all" && counts[f.key] ? (
                <span className="ml-1.5 opacity-60">({counts[f.key]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">Loading transactions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Date</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Item</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Transaction ID</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Provider</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Amount</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((tx, idx) => (
                <tr
                  key={tx._id || idx}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Date */}
                  <td className="px-5 py-3 text-white/50 text-sm whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Item */}
                  <td className="px-5 py-3">
                    <p className="text-white text-sm font-medium leading-tight">{tx.gameTitle || "—"}</p>
                    {tx.itemType && (
                      <p className="text-white/30 text-xs mt-0.5 capitalize">{tx.itemType.replace(/_/g, " ")}</p>
                    )}
                  </td>

                  {/* Transaction ID */}
                  <td className="px-5 py-3">
                    <p className="text-white/60 text-xs font-mono" title={tx.transactionId}>
                      {truncateTx(tx.transactionId)}
                    </p>
                  </td>

                  {/* Provider */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize ${PROVIDER_STYLE[tx.provider] || "bg-white/5 text-white/40 border border-white/10"}`}>
                      {tx.provider || "—"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3 text-white/80 text-sm font-mono whitespace-nowrap">
                    {tx.amount != null
                      ? `$${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "—"
                    }
                    {tx.currency && tx.currency !== "usd" && (
                      <span className="ml-1 text-white/30 text-xs uppercase">{tx.currency}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold capitalize ${STATUS_STYLE[tx.status] || "bg-white/5 text-white/40 border border-white/10"}`}>
                      {tx.status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-xs">
              Showing {from}–{to} of {totalItems} transactions
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/30 text-xs">Per page:</span>
              {PAGE_SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`w-8 h-6 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    pageSize === size
                      ? "bg-[#002AA8] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
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
                    num === page
                      ? "bg-[#002AA8] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
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

export default Transactions;
