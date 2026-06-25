import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ────────────────────────────────────────────────────────────────────

const PAYOUT_TYPES = [
  { key: "all",            label: "All Types" },
  { key: "company_fee",    label: "Company Fee" },
  { key: "artist_royalty", label: "Artist Royalty" },
  { key: "buyback_fund",   label: "Buyback Fund" },
];

const STATUSES = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "dispatched", label: "Dispatched" },
  { key: "failed",     label: "Failed" },
];

const TYPE_CONFIG = {
  company_fee:    { label: "Company Fee",    color: "bg-blue-500/15 text-blue-300",   dot: "bg-blue-400" },
  artist_royalty: { label: "Artist Royalty", color: "bg-purple-500/15 text-purple-300", dot: "bg-purple-400" },
  buyback_fund:   { label: "Buyback Fund",   color: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
};

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-500/15 text-yellow-300" },
  dispatched: { label: "Dispatched", color: "bg-green-500/15 text-green-300"  },
  failed:     { label: "Failed",     color: "bg-red-500/15 text-red-400"      },
};

// ── Component ─────────────────────────────────────────────────────────────────

function RoyaltyPayouts() {
  const [payouts,    setPayouts]    = useState([]);
  const [summary,    setSummary]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statFilter, setStatFilter] = useState("all");
  const [processing, setProcessing] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPayouts = async (type, status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type   && type   !== "all") params.set("payoutType", type);
      if (status && status !== "all") params.set("status", status);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/royalty-payouts${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayouts(res.data.data   || []);
      setSummary(res.data.summary || {});
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(typeFilter, statFilter); }, [typeFilter, statFilter]);

  const handleMarkDispatched = async (id, paymentType) => {
    const msg = paymentType === "crypto"
      ? "Crypto dispatch failed. Mark as manually sent (fallback)? Only confirm after you have transferred the amount to the artist."
      : "Mark this bank payout as dispatched? Only do this after you have confirmed the Stripe payout to the artist.";
    if (!window.confirm(msg)) return;
    setProcessing(id);
    try {
      await axios.put(
        `${Dashboard_Base_Url}/v1/admin/nfa/royalty-payouts/${id}/mark-dispatched`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Marked as dispatched");
      setPayouts((prev) => prev.map((p) => p._id === id ? { ...p, status: "dispatched" } : p));
    } catch {
      toast.error("Failed to update payout");
    } finally {
      setProcessing(null);
    }
  };

  const handleRetry = async (id, paymentType) => {
    const confirmMsg = paymentType === "bank"
      ? "Retry Stripe payout to the artist's bank? Make sure the platform Stripe balance is sufficient."
      : "Retry on-chain USDC dispatch? Make sure the backend wallet has sufficient USDC balance.";
    if (!window.confirm(confirmMsg)) return;
    setProcessing(id);
    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/v1/admin/nfa/royalty-payouts/${id}/retry`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updated = res.data.data;
      setPayouts((prev) => prev.map((p) => p._id === id ? updated : p));
      if (updated.status === "dispatched") {
        toast.success("Payout dispatched ✓");
      } else {
        toast.error(paymentType === "bank"
          ? "Retry failed — check platform Stripe balance"
          : "Retry failed — check backend wallet USDC balance");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Retry failed");
    } finally {
      setProcessing(null);
    }
  };

  // Derive status totals from the full summary (all types) for the status cards
  const statusTotals = { pending: 0, dispatched: 0, failed: 0 };
  for (const typeData of Object.values(summary)) {
    statusTotals.pending    += typeData.pending    || 0;
    statusTotals.dispatched += typeData.dispatched || 0;
    statusTotals.failed     += typeData.failed     || 0;
  }

  return (
    <div className="flex flex-col overflow-x-hidden px-4 md:px-10 pt-4 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          Payout Tracker
        </h1>
        <p className="text-white/50 text-sm mt-1">
          All fee disbursements — company revenue, artist royalties, and buyback fund contributions
        </p>
      </div>

      {/* ── Revenue by Type ─────────────────────────────────────────────────── */}
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">Revenue Breakdown</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { key: "company_fee",    label: "Company Revenue",  pct: "10–16%", borderColor: "border-blue-500/30"   },
          { key: "artist_royalty", label: "Artist Royalties", pct: "4%",     borderColor: "border-purple-500/30" },
          { key: "buyback_fund",   label: "Buyback Fund",     pct: "5–10%",  borderColor: "border-amber-500/30"  },
        ].map(({ key, label, pct, borderColor }) => {
          const data = summary[key] || {};
          const total = data.total || 0;
          const cfg   = TYPE_CONFIG[key];
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? "all" : key)}
              className={`rounded-lg border ${borderColor} bg-white/[0.03] p-5 text-left transition-colors hover:bg-white/[0.06] ${typeFilter === key ? "ring-1 ring-white/20" : ""}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-white/50 text-xs font-medium">{label}</span>
                <span className="ml-auto text-white/25 text-xs">{pct} per sale</span>
              </div>
              <p className="text-white text-2xl font-semibold">${total.toFixed(2)}</p>
              <div className="flex gap-3 mt-2 text-xs text-white/35">
                <span>${(data.dispatched || 0).toFixed(2)} sent</span>
                <span className="text-yellow-400/60">${(data.pending || 0).toFixed(2)} pending</span>
                {(data.failed || 0) > 0 && <span className="text-red-400/70">${(data.failed || 0).toFixed(2)} failed</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Status Summary ───────────────────────────────────────────────────── */}
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">Operational Status</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { key: "pending",    label: "Pending Action",  color: "border-yellow-500/30", textColor: "text-yellow-300" },
          { key: "dispatched", label: "Dispatched",      color: "border-green-500/30",  textColor: "text-green-300"  },
          { key: "failed",     label: "Failed",          color: "border-red-500/30",    textColor: "text-red-400"    },
        ].map(({ key, label, color, textColor }) => (
          <button
            key={key}
            onClick={() => setStatFilter(statFilter === key ? "all" : key)}
            className={`rounded-lg border ${color} bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.06] ${statFilter === key ? "ring-1 ring-white/20" : ""}`}
          >
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <p className={`text-xl font-semibold ${textColor}`}>${statusTotals[key].toFixed(2)}</p>
          </button>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Type:</span>
          <div className="flex gap-1.5">
            {PAYOUT_TYPES.map(({ key, label }) => (
              <button key={key} onClick={() => setTypeFilter(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === key
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Status:</span>
          <div className="flex gap-1.5">
            {STATUSES.map(({ key, label }) => (
              <button key={key} onClick={() => setStatFilter(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statFilter === key
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-white/50 text-sm py-10">Loading...</p>
      ) : payouts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm">No payouts found for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                {["Date", "Type", "Amount", "Recipient", "Method", "Status", "Note / Tx", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map((p) => {
                const typeCfg   = TYPE_CONFIG[p.payoutType]   || { label: p.payoutType || "—", color: "bg-white/10 text-white/50", dot: "bg-white/30" };
                const statusCfg = STATUS_CONFIG[p.status]     || { label: p.status,   color: "bg-white/10 text-white/50" };
                // Bank: pending or failed → manual Wise transfer
                // Crypto failed: show both Retry (on-chain) and Mark Sent (manual fallback)
                const canMarkSent = p.status === "pending" && p.paymentType === "bank"
                                 || p.status === "failed";
                // Failed payouts can be retried automatically: crypto on-chain, bank via Stripe
                const canRetry    = p.status === "failed";

                return (
                  <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Date */}
                    <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                      {p.createdAt && !isNaN(new Date(p.createdAt).getTime())
                        ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${typeCfg.dot}`} />
                        {typeCfg.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-white font-semibold text-sm whitespace-nowrap">
                      ${p.amount?.toFixed(2)} USDC
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-3 text-xs">
                      {!p.creatorWallet || p.creatorWallet === "bank" ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">Bank Transfer</span>
                      ) : (
                        <span className="font-mono text-white/50">
                          {p.creatorWallet.slice(0, 8)}...{p.creatorWallet.slice(-6)}
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.paymentType === "crypto"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-purple-500/15 text-purple-300"
                      }`}>
                        {p.paymentType === "crypto" ? "Crypto" : "Bank"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Note / Tx */}
                    <td className="px-4 py-3 text-white/40 text-xs max-w-[220px]">
                      {p.txHash ? (
                        <a
                          href={`https://basescan.org/tx/${p.txHash}`}
                          target="_blank" rel="noreferrer"
                          className="text-blue-400 hover:underline font-mono"
                        >
                          {p.txHash.slice(0, 12)}...
                        </a>
                      ) : (
                        <span className="truncate block" title={p.note || "—"}>
                          {p.note || "—"}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {canRetry && (
                          <button
                            onClick={() => handleRetry(p._id, p.paymentType)}
                            disabled={processing === p._id}
                            className="px-3 py-1 bg-blue-700/30 hover:bg-blue-700/50 disabled:opacity-50 text-blue-300 text-xs rounded-md transition-colors whitespace-nowrap"
                          >
                            {processing === p._id ? "Retrying…" : p.paymentType === "bank" ? "↺ Retry (Stripe)" : "↺ Retry On-chain"}
                          </button>
                        )}
                        {canMarkSent && (
                          <button
                            onClick={() => handleMarkDispatched(p._id, p.paymentType)}
                            disabled={processing === p._id}
                            className="px-3 py-1 bg-green-700/30 hover:bg-green-700/50 disabled:opacity-50 text-green-300 text-xs rounded-md transition-colors whitespace-nowrap"
                          >
                            {processing === p._id ? "…" : p.paymentType === "crypto" ? "Mark Sent (Manual)" : "Mark Sent"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoyaltyPayouts;
