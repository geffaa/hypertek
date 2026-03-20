import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

const STATUS_COLORS = {
  pending:    "bg-yellow-500/15 text-yellow-300",
  dispatched: "bg-green-500/15 text-green-300",
  failed:     "bg-red-500/15 text-red-400",
};

function RoyaltyPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPayouts = async (status) => {
    setLoading(true);
    try {
      const params = status && status !== "all" ? `?status=${status}` : "";
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/royalty-payouts${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayouts(res.data.data || []);
    } catch {
      toast.error("Failed to load royalty payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(filter); }, [filter]);

  const handleMarkDispatched = async (id) => {
    if (!window.confirm("Mark this payout as dispatched? Only do this after you have manually sent the payment.")) return;
    setProcessing(id);
    try {
      await axios.put(`${Dashboard_Base_Url}/v1/admin/nfa/royalty-payouts/${id}/mark-dispatched`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Marked as dispatched");
      setPayouts((prev) => prev.map((p) => p._id === id ? { ...p, status: "dispatched" } : p));
    } catch {
      toast.error("Failed to update payout");
    } finally {
      setProcessing(null);
    }
  };

  const totals = {
    pending:    payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    dispatched: payouts.filter((p) => p.status === "dispatched").reduce((s, p) => s + p.amount, 0),
    failed:     payouts.filter((p) => p.status === "failed").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="flex flex-col overflow-x-hidden px-4 md:px-10 pt-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          Royalty Payouts
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Track and process artist/creator royalty payments (4% of each sale)
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending",    key: "pending",    color: "border-yellow-500/30" },
          { label: "Dispatched", key: "dispatched", color: "border-green-500/30" },
          { label: "Failed",     key: "failed",     color: "border-red-500/30" },
        ].map(({ label, key, color }) => (
          <div key={key} className={`rounded-lg border ${color} bg-white/[0.03] p-4`}>
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <p className="text-white text-xl font-semibold">${totals[key].toFixed(2)} USDC</p>
            <p className="text-white/30 text-xs mt-0.5">
              {payouts.filter((p) => p.status === key).length} payouts
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "pending", "dispatched", "failed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
              filter === s ? "bg-blue-700 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50 text-sm">Loading...</p>
      ) : payouts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm">No payouts found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Recipient</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Tx / Note</th>
                <th className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">
                    ${p.amount?.toFixed(2)} USDC
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs font-mono">
                    {p.creatorWallet
                      ? `${p.creatorWallet.slice(0, 10)}...${p.creatorWallet.slice(-6)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      p.paymentType === "crypto"
                        ? "bg-blue-500/15 text-blue-300"
                        : "bg-purple-500/15 text-purple-300"
                    }`}>
                      {p.paymentType === "crypto" ? "Crypto" : "Bank"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs max-w-[200px] truncate">
                    {p.txHash
                      ? <a href={`https://basescan.org/tx/${p.txHash}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                          {p.txHash.slice(0, 14)}...
                        </a>
                      : p.note || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(p.status === "pending" || p.status === "failed") && p.paymentType === "bank" && (
                      <button
                        onClick={() => handleMarkDispatched(p._id)}
                        disabled={processing === p._id}
                        className="px-3 py-1 bg-green-700/40 hover:bg-green-700/60 disabled:opacity-50 text-green-300 text-xs rounded-md transition-colors"
                      >
                        {processing === p._id ? "..." : "Mark Sent"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoyaltyPayouts;
