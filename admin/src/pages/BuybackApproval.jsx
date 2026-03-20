import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Dashboard_Base_Url } from "../Config";

const STATUS_COLORS = {
  pending:  { bg: "rgba(180,120,0,0.2)",  text: "#fcd34d", label: "Pending"  },
  approved: { bg: "rgba(0,120,60,0.2)",   text: "#4ade80", label: "Approved" },
  rejected: { bg: "rgba(160,30,30,0.2)",  text: "#f87171", label: "Rejected" },
};

export default function BuybackApproval() {
  const { token } = useSelector((state) => state.admin);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("pending");
  const [actionModal, setActionModal] = useState(null); // { id, type: "approve"|"reject" }
  const [txHash, setTxHash]       = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Dashboard_Base_Url}/v1/buyback/admin/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch {
      toast.error("Failed to load buyback requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const handleAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const endpoint = actionModal.type === "approve"
        ? `${Dashboard_Base_Url}/v1/buyback/admin/requests/${actionModal.id}/approve`
        : `${Dashboard_Base_Url}/v1/buyback/admin/requests/${actionModal.id}/reject`;

      await axios.put(endpoint,
        { txHash, adminNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${actionModal.type}d`);
      setActionModal(null);
      setTxHash("");
      setAdminNote("");
      fetchRequests();
    } catch {
      toast.error("Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-6 min-h-screen text-white" style={{ background: "#050510" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Buyback Approval</h1>
          <p className="text-white/50 text-sm">Review and process NFA buyback requests from artists/holders.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {["pending", "approved", "rejected"].map((s) => {
            const count = requests.filter((r) => r.status === s).length;
            const c = STATUS_COLORS[s];
            return (
              <button key={s} onClick={() => setFilter(s)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: filter === s ? c.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${filter === s ? c.text + "66" : "rgba(255,255,255,0.08)"}`,
                }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: c.text }}>{s}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-4">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
              style={{
                background: filter === f ? "#002AA8" : "rgba(255,255,255,0.07)",
                color: "#fff",
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-white/40 text-sm text-center py-20">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-20">No {filter} requests.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Item", "Collection", "Min Buyback", "User", "Requested", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((req) => {
                  const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{req.itemName || "—"}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{req.collectionName || "—"}</td>
                      <td className="px-4 py-3 text-amber-300 font-semibold">
                        ${req.minimumBuybackUSD ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">
                        <p>{req.userId?.FullName || req.userId?.Email || "—"}</p>
                        <p className="text-white/30 text-[10px] truncate max-w-[100px]">{req.userWallet || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">{formatDate(req.requestedAt || req.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize"
                          style={{ background: sc.bg, color: sc.text }}>
                          {sc.label}
                        </span>
                        {req.txHash && (
                          <a href={`https://basescan.org/tx/${req.txHash}`} target="_blank" rel="noreferrer"
                            className="block text-[9px] text-blue-400 hover:text-blue-300 mt-0.5 underline truncate max-w-[80px]">
                            tx: {req.txHash.slice(0, 10)}…
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setActionModal({ id: req._id, type: "approve" }); setTxHash(""); setAdminNote(""); }}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold text-white transition-colors"
                              style={{ background: "rgba(0,120,60,0.6)", border: "1px solid rgba(0,200,100,0.3)" }}>
                              Approve
                            </button>
                            <button
                              onClick={() => { setActionModal({ id: req._id, type: "reject" }); setTxHash(""); setAdminNote(""); }}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold text-white transition-colors"
                              style={{ background: "rgba(160,30,30,0.6)", border: "1px solid rgba(255,60,60,0.3)" }}>
                              Reject
                            </button>
                          </div>
                        )}
                        {req.adminNote && req.status !== "pending" && (
                          <p className="text-white/30 text-[10px] max-w-[120px] truncate" title={req.adminNote}>{req.adminNote}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 capitalize">
              {actionModal.type} Buyback Request
            </h3>

            {actionModal.type === "approve" && (
              <div className="mb-4">
                <label className="block text-white/60 text-xs mb-1">TX Hash (optional)</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white/60 text-xs mb-1">Admin Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Optional note..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/15 text-white/70 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm disabled:opacity-50 transition-colors capitalize"
                style={{
                  background: actionModal.type === "approve" ? "rgba(0,120,60,0.8)" : "rgba(160,30,30,0.8)",
                }}>
                {submitting ? "Processing..." : actionModal.type === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
