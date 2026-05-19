import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_FILTERS = [
  { key: "all",       label: "All"       },
  { key: "succeeded", label: "Succeeded" },
  { key: "pending",   label: "Pending"   },
  { key: "failed",    label: "Failed"    },
  { key: "cancelled", label: "Cancelled" },
  { key: "refunded",  label: "Refunded"  },
];

const STATUS_STYLE = {
  succeeded: { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   text: "#4ade80", dot: "#4ade80" },
  pending:   { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24", dot: "#fbbf24" },
  failed:    { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   text: "#f87171", dot: "#f87171" },
  cancelled: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)",  text: "rgba(255,255,255,0.4)", dot: "rgba(255,255,255,0.25)" },
  refunded:  { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.25)",  text: "#38bdf8", dot: "#38bdf8" },
};

const PROVIDER_STYLE = {
  stripe:  { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)",  text: "#a5b4fc" },
  paypal:  { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.25)",  text: "#7dd3fc" },
  crypto:  { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24" },
  card:    { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.25)",  text: "#2dd4bf" },
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

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.cancelled;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, color: s.text, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status || "—"}
    </span>
  );
}

function ProviderBadge({ provider }) {
  const s = PROVIDER_STYLE[provider];
  if (!s) return <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "capitalize" }}>{provider || "—"}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 6, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, color: s.text, textTransform: "capitalize" }}>
      {provider}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);

  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(PAGE_SIZE_OPTIONS[0]);

  // ── Fetch (server-side) ────────────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim())          params.set("search", search.trim());
      params.set("page",  String(page));
      params.set("limit", String(pageSize));

      const res = await axios.get(
        `${Dashboard_Base_Url}/v1/history/get-history?${params.toString()}`
      );
      if (res.data.success) {
        setTransactions(res.data.data       || []);
        setTotal(res.data.total             || 0);
        setTotalPages(res.data.totalPages   || 1);
      } else {
        toast.error("Failed to load transactions");
      }
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, pageSize]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { setPage(1); }, [statusFilter, search, pageSize]);

  // Search on Enter or after 500ms debounce
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Pagination ─────────────────────────────────────────────────────────────

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const getPageNumbers = () => {
    const delta = 2, range = [];
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
    <div className="flex flex-col min-h-full pb-12" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 style={{ fontSize: 25, fontWeight: 600, color: "white", margin: 0 }}>Transaction History</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
          {total > 0 ? `${total.toLocaleString()} total records` : "All payment transactions across the platform"}
        </p>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">

        {/* Search */}
        <div
          className="flex items-center gap-2"
          style={{ flex: "1 1 200px", maxWidth: 340, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search title, ID, provider, wallet…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%" }}
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); setSearch(""); }} style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, lineHeight: 1, cursor: "pointer", background: "none", border: "none" }}>×</button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: "1px solid",
                borderColor: statusFilter === f.key ? "rgba(0,80,255,0.5)" : "rgba(255,255,255,0.1)",
                background: statusFilter === f.key ? "rgba(0,42,168,0.3)" : "rgba(255,255,255,0.04)",
                color: statusFilter === f.key ? "white" : "rgba(255,255,255,0.5)",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Loading transactions…</p>
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 10 }}>
          <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No transactions found</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Date", "Item", "Transaction ID", "Provider", "Amount", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={tx._id || idx}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Date */}
                  <td style={{ padding: "12px 20px", color: "rgba(255,255,255,0.45)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Item */}
                  <td style={{ padding: "12px 20px" }}>
                    <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                      {tx.gameTitle || "—"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      {tx.itemType && (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "capitalize" }}>
                          {tx.itemType.replace(/_/g, " ")}
                        </span>
                      )}
                      {/* NFT transfer failure warning */}
                      {tx.nftTransferFailed && (
                        <span
                          title={tx.nftTransferError || "NFT transfer failed after payment"}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 5, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 10, fontWeight: 700, cursor: "help" }}
                        >
                          ⚠ NFT not transferred
                        </span>
                      )}
                    </div>
                    {tx.buyerWallet && (
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "monospace", margin: "2px 0 0" }}>
                        {tx.buyerWallet.slice(0, 8)}…{tx.buyerWallet.slice(-4)}
                      </p>
                    )}
                  </td>

                  {/* Transaction ID */}
                  <td style={{ padding: "12px 20px" }}>
                    <span
                      title={tx.transactionId}
                      style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "monospace", cursor: "default" }}
                    >
                      {truncateTx(tx.transactionId)}
                    </span>
                    {tx.referenceId && tx.referenceId !== tx.transactionId && (
                      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "monospace", margin: "2px 0 0" }} title={tx.referenceId}>
                        ref: {tx.referenceId.slice(0, 12)}…
                      </p>
                    )}
                  </td>

                  {/* Provider */}
                  <td style={{ padding: "12px 20px" }}>
                    <ProviderBadge provider={tx.provider} />
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "12px 20px", whiteSpace: "nowrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>
                      {tx.amount != null
                        ? `$${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "—"}
                    </span>
                    {tx.currency && tx.currency !== "usd" && (
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 4, textTransform: "uppercase" }}>{tx.currency}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 20px" }}>
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && total > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
              Showing {from}–{to} of {total.toLocaleString()} transactions
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
    </div>
  );
}

export default Transactions;
