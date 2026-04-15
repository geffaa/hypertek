import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "bg-yellow-500/15 text-yellow-300", dot: "bg-yellow-400" },
  approved: { label: "Approved", color: "bg-green-500/15 text-green-300",   dot: "bg-green-400"  },
  rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400",       dot: "bg-red-400"    },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function BuybackApproval() {
  const token = localStorage.getItem("token");

  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("pending");
  const [actionModal, setActionModal] = useState(null); // { id, type: "approve"|"reject", itemName }
  const [txHash,      setTxHash]      = useState("");
  const [adminNote,   setAdminNote]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRequests = async () => {
    setLoading(true);
    try {
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

  // ── Action ─────────────────────────────────────────────────────────────────

  const handleAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const url = actionModal.type === "approve"
        ? `${Dashboard_Base_Url}/v1/buyback/admin/requests/${actionModal.id}/approve`
        : `${Dashboard_Base_Url}/v1/buyback/admin/requests/${actionModal.id}/reject`;

      await axios.put(url, { txHash, adminNote }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Request ${actionModal.type === "approve" ? "approved" : "rejected"}`);
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

  const openModal = (req, type) => {
    setActionModal({ id: req._id, type, itemName: req.itemName || "this item" });
    setTxHash("");
    setAdminNote("");
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const counts = {
    pending:  requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    total:    requests.length,
  };

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col overflow-x-hidden px-4 md:px-10 pt-4 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          Buyback Approval
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Review and process NFA / NFC buyback requests from holders
        </p>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">Request Overview</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { key: "total",    label: "Total Requests", borderColor: "border-white/10",         textColor: "text-white"        },
          { key: "pending",  label: "Pending",         borderColor: "border-yellow-500/30",    textColor: "text-yellow-300"   },
          { key: "approved", label: "Approved",        borderColor: "border-green-500/30",     textColor: "text-green-300"    },
          { key: "rejected", label: "Rejected",        borderColor: "border-red-500/30",       textColor: "text-red-400"      },
        ].map(({ key, label, borderColor, textColor }) => (
          <button
            key={key}
            onClick={() => key !== "total" && setFilter(key === filter ? "all" : key)}
            className={`rounded-lg border ${borderColor} bg-white/[0.03] p-5 text-left transition-colors hover:bg-white/[0.06] ${
              filter === key ? "ring-1 ring-white/20" : ""
            } ${key === "total" ? "cursor-default" : "cursor-pointer"}`}
          >
            <p className="text-white/50 text-xs font-medium mb-2">{label}</p>
            <p className={`text-2xl font-semibold ${textColor}`}>{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* ── Filter pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-white/30 text-xs">Status:</span>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === key
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {label}
              {key !== "all" && (
                <span className="ml-1.5 text-white/30">{counts[key]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-white/50 text-sm py-10">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm">No {filter === "all" ? "" : filter} requests found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                {["Item", "Collection", "Min Buyback", "Holder", "Requested", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-white/40 text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((req) => {
                const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">

                    {/* Item */}
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{req.itemName || "—"}</p>
                      {req.assetType && (
                        <span className="text-[10px] text-white/30">{req.assetType}</span>
                      )}
                    </td>

                    {/* Collection */}
                    <td className="px-4 py-3 text-white/50 text-xs">{req.collectionName || "—"}</td>

                    {/* Min Buyback */}
                    <td className="px-4 py-3">
                      <span className="text-amber-300 font-semibold text-sm">
                        ${req.minimumBuybackUSD?.toFixed(2) ?? "—"}
                      </span>
                    </td>

                    {/* Holder */}
                    <td className="px-4 py-3">
                      <p className="text-white/60 text-xs">
                        {req.userId?.FullName || req.userId?.Email || "—"}
                      </p>
                      {req.userWallet && (
                        <p className="text-white/25 text-[10px] font-mono mt-0.5 truncate max-w-[110px]">
                          {req.userWallet.slice(0, 8)}…{req.userWallet.slice(-6)}
                        </p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {formatDate(req.requestedAt || req.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {req.txHash && (
                        <a
                          href={`https://basescan.org/tx/${req.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[10px] text-blue-400 hover:underline mt-1 font-mono truncate max-w-[90px]"
                        >
                          tx: {req.txHash.slice(0, 10)}…
                        </a>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {req.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(req, "approve")}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors cursor-pointer bg-green-600/30 border border-green-500/30 hover:bg-green-600/50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(req, "reject")}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-colors cursor-pointer bg-red-600/25 border border-red-500/25 hover:bg-red-600/40"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        req.adminNote && (
                          <p
                            className="text-white/30 text-[10px] max-w-[130px] truncate"
                            title={req.adminNote}
                          >
                            {req.adminNote}
                          </p>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Action Modal ───────────────────────────────────────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className="rounded-xl border border-white/10 p-6 w-full max-w-sm shadow-2xl"
            style={{ background: "#0d0e1f" }}
          >
            <h3 className="text-white font-semibold text-lg mb-1 capitalize">
              {actionModal.type === "approve" ? "Approve" : "Reject"} Buyback
            </h3>
            <p className="text-white/40 text-xs mb-5">
              {actionModal.itemName}
            </p>

            {/* TX Hash — approve only */}
            {actionModal.type === "approve" && (
              <div className="mb-4">
                <label className="block text-white/50 text-xs font-medium mb-1.5">
                  TX Hash <span className="text-white/25">(optional)</span>
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500/60 transition-all font-mono placeholder:text-white/20"
                />
              </div>
            )}

            {/* Admin note */}
            <div className="mb-6">
              <label className="block text-white/50 text-xs font-medium mb-1.5">
                Admin Note <span className="text-white/25">(optional)</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Add a note for your records..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500/60 transition-all resize-none placeholder:text-white/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg border border-white/15 text-white/60 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-50 cursor-pointer ${
                  actionModal.type === "approve"
                    ? "bg-green-600/40 border border-green-500/30 hover:bg-green-600/60"
                    : "bg-red-600/35 border border-red-500/25 hover:bg-red-600/55"
                }`}
              >
                {submitting
                  ? "Processing..."
                  : actionModal.type === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
