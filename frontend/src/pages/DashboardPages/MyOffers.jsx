import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import { FiSend, FiInbox, FiCheck, FiX, FiClock } from "react-icons/fi";

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   { text: "text-yellow-400", bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.25)" },
  accepted:  { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)" },
  completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
  rejected:  { text: "text-red-400",    bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)" },
  cancelled: { text: "text-white/30",   bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
};

function getDeadlineText(acceptDeadlineAt) {
  if (!acceptDeadlineAt) return null;
  const diff = new Date(acceptDeadlineAt) - Date.now();
  if (diff <= 0) return { label: "Deadline passed", expired: true };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const label = h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${m}m left`;
  return { label, expired: false };
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${c.text}`}
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      {status || "pending"}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ icon: Icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/25">
      <Icon size={32} className="opacity-40" />
      <p className="text-sm">{message}</p>
      {sub && <p className="text-xs text-white/15">{sub}</p>}
    </div>
  );
}

// ── Sent Tab (buyer) ──────────────────────────────────────────────────────────
function SentTab({ userId, token, navigate }) {
  const [offers, setOffers]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [navigating, setNavigating] = useState(null);

  const load = useCallback(() => {
    if (!userId || !token) { setLoading(false); return; }
    setLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/offer/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOffers(res.data?.offers || []))
      .catch((err) => { if (err.response?.status !== 404) toast.error("Failed to load sent offers"); })
      .finally(() => setLoading(false));
  }, [userId, token]);

  useEffect(() => { load(); }, [load]);

  const handleCompletePurchase = async (offer) => {
    setNavigating(offer._id);
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/${offer.gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { item, parentId } = res.data;
      navigate("/buy-nfa", { state: { item, parentId } });
    } catch {
      toast.error("Could not load item data");
    } finally {
      setNavigating(null);
    }
  };

  const handleCancel = async (offerId) => {
    if (!window.confirm("Cancel this offer?")) return;
    setCancelling(offerId);
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/offer/${offerId}/request-status`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers((prev) =>
        prev.map((o) => o._id === offerId ? { ...o, requestStatus: "cancelled" } : o)
      );
      toast.success("Offer cancelled");
    } catch {
      toast.error("Failed to cancel offer");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="text-white/40 text-sm py-16 text-center">Loading...</div>;
  if (!offers.length) return (
    <Empty icon={FiSend} message="No sent offers yet" sub="Make an offer on any item in the Marketplace" />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["Item", "Your Offer", "Floor Price", "Offer Duration", "Status", "Action"].map((h) => (
              <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const deadline   = offer.acceptDeadlineAt ? getDeadlineText(offer.acceptDeadlineAt) : null;
            const isAccepted = offer.requestStatus === "accepted";
            const canCancel  = offer.requestStatus === "pending";

            return (
              <tr key={offer._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-4">
                  <p className="text-white text-sm font-medium">{offer.gameTitle || "—"}</p>
                  <p className="text-white/30 text-xs mt-0.5">#{offer.serialNumber}</p>
                </td>
                <td className="px-4 py-4 text-white font-semibold text-sm">
                  {offer.offerPrice} USDC
                </td>
                <td className="px-4 py-4 text-white/45 text-sm">
                  {offer.gameActualPrice > 0 ? `${offer.gameActualPrice} USDC` : "—"}
                </td>
                <td className="px-4 py-4">
                  <p className="text-white/45 text-sm">{offer.priceDuration || "—"}</p>
                  {isAccepted && deadline && (
                    <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${deadline.expired ? "text-red-400" : "text-orange-400"}`}>
                      <FiClock size={10} /> {deadline.label}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={offer.requestStatus} />
                </td>
                <td className="px-4 py-4">
                  {isAccepted && !deadline?.expired ? (
                    <button
                      onClick={() => handleCompletePurchase(offer)}
                      disabled={navigating === offer._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 hover:brightness-110"
                      style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}
                    >
                      {navigating === offer._id ? "Loading..." : "Complete Purchase →"}
                    </button>
                  ) : canCancel ? (
                    <button
                      onClick={() => handleCancel(offer._id)}
                      disabled={cancelling === offer._id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 hover:brightness-110"
                      style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                    >
                      {cancelling === offer._id ? "Cancelling..." : "Cancel"}
                    </button>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Received Tab (seller) ─────────────────────────────────────────────────────
function ReceivedTab({ wallet, token }) {
  const [offers, setOffers]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState(null); // offerId being actioned

  const load = useCallback(() => {
    if (!wallet || !token) { setLoading(false); return; }
    setLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/offer/owner/${encodeURIComponent(wallet)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOffers(res.data?.offers || []))
      .catch((err) => { if (err.response?.status !== 404) toast.error("Failed to load received offers"); })
      .finally(() => setLoading(false));
  }, [wallet, token]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (offerId, status) => {
    const label = status === "accepted" ? "Accept" : "Reject";
    if (!window.confirm(`${label} this offer?`)) return;
    setActing(offerId);
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/offer/${offerId}/request-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers((prev) =>
        prev.map((o) => o._id === offerId ? { ...o, requestStatus: status } : o)
      );
      toast.success(status === "accepted" ? "Offer accepted — buyer notified by email" : "Offer rejected");
    } catch {
      toast.error(`Failed to ${label.toLowerCase()} offer`);
    } finally {
      setActing(null);
    }
  };

  if (!wallet) return (
    <Empty icon={FiInbox} message="Connect your wallet to view received offers" />
  );
  if (loading) return <div className="text-white/40 text-sm py-16 text-center">Loading...</div>;
  if (!offers.length) return (
    <Empty icon={FiInbox} message="No offers received yet" sub="Offers made on your listed items will appear here" />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["Item", "Buyer", "Offer Price", "Floor Price", "Duration", "Status", "Action"].map((h) => (
              <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const isPending  = offer.requestStatus === "pending";
            const isAccepted = offer.requestStatus === "accepted";
            const deadline   = isAccepted && offer.acceptDeadlineAt ? getDeadlineText(offer.acceptDeadlineAt) : null;
            const isActing   = acting === offer._id;

            return (
              <tr key={offer._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-4">
                  <p className="text-white text-sm font-medium">{offer.gameTitle || "—"}</p>
                  <p className="text-white/30 text-xs mt-0.5">#{offer.serialNumber}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-white/80 text-sm">{offer.userName || "—"}</p>
                  <p className="text-white/25 text-xs mt-0.5 truncate max-w-[140px]">{offer.userEmail || ""}</p>
                </td>
                <td className="px-4 py-4 text-green-300 font-semibold text-sm">
                  {offer.offerPrice} USDC
                </td>
                <td className="px-4 py-4 text-white/45 text-sm">
                  {offer.gameActualPrice > 0 ? `${offer.gameActualPrice} USDC` : "—"}
                </td>
                <td className="px-4 py-4">
                  <p className="text-white/45 text-sm">{offer.priceDuration || "—"}</p>
                  {isAccepted && deadline && (
                    <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${deadline.expired ? "text-red-400" : "text-orange-400"}`}>
                      <FiClock size={10} /> Buyer: {deadline.label}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={offer.requestStatus} />
                </td>
                <td className="px-4 py-4">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(offer._id, "accepted")}
                        disabled={isActing}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 hover:brightness-110"
                        style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}
                      >
                        <FiCheck size={11} />
                        {isActing ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleAction(offer._id, "rejected")}
                        disabled={isActing}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 hover:brightness-110"
                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                      >
                        <FiX size={11} />
                        {isActing ? "..." : "Reject"}
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <span className="text-white/30 text-xs">Awaiting payment</span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function MyOffers() {
  const { user, token } = useSelector((state) => state.auth);
  const { address: wagmiAddress } = useAccount();
  const navigate = useNavigate();

  const userId = user?.id || user?._id;
  const wallet = (wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress || "").toLowerCase();

  const [activeTab, setActiveTab] = useState("sent");

  const tabs = [
    { id: "sent",     label: "Sent",     icon: FiSend,  desc: "Offers I made" },
    { id: "received", label: "Received", icon: FiInbox, desc: "Offers on my items" },
  ];

  return (
    <div className="flex flex-col min-h-screen px-6 md:pl-24 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-semibold text-2xl">Offers</h1>
        <p className="text-white/30 text-sm mt-1">Manage offers you sent and received</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={isActive
                ? { background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)", color: "#fff" }
                : { background: "transparent", border: "1px solid transparent", color: "rgba(255,255,255,0.35)" }}
            >
              <Icon size={14} />
              {tab.label}
              <span className="text-[10px] opacity-60 hidden sm:inline">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Info strip */}
      {activeTab === "received" && (
        <div className="mb-5 px-4 py-3 rounded-xl text-xs text-white/35 flex flex-wrap gap-x-6 gap-y-1"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span><FiCheck className="inline mr-1" size={11} />Accepting an offer notifies the buyer by email with a 48-hour payment deadline</span>
          <span><FiClock className="inline mr-1" size={11} />If buyer doesn't pay in 48h, the offer auto-expires</span>
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {activeTab === "sent" ? (
          <SentTab userId={userId} token={token} navigate={navigate} />
        ) : (
          <ReceivedTab wallet={wallet} token={token} />
        )}
      </div>
    </div>
  );
}

export default MyOffers;
