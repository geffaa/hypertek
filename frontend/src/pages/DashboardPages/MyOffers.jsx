import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";

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
  const label = h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${m}m left`;
  return { label, expired: false };
}

function MyOffers() {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [offers, setOffers]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [navigating, setNavigating] = useState(null);

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId || !token) { setLoading(false); return; }
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/offer/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOffers(res.data?.offers || []))
      .catch((err) => {
        if (err.response?.status !== 404) toast.error("Failed to load offers");
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  const handleCompletePurchase = async (offer) => {
    setNavigating(offer._id);
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/sub-collection/${offer.gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { item, parentId } = res.data;
      navigate("/buy-nfa", { state: { item, parentId } });
    } catch {
      toast.error("Could not load NFT data");
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col w-full max-w-[426px] gap-6 px-6 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">My Offers</h1>
      </div>

      {/* Table */}
      <div className="px-6 md:pl-24 mt-12 z-10 relative overflow-x-auto">
        {loading ? (
          <div className="text-white/50 text-sm py-16 text-center">Loading your offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-white/50 text-sm py-16 text-center">You haven't made any offers yet.</div>
        ) : (
          <table className="w-full min-w-[900px] text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="h-[50px]">
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Item</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Your Offer</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Floor Price</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Expires In</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Status</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {offers.map((offer) => {
                const colors      = STATUS_COLORS[offer.requestStatus] || STATUS_COLORS.pending;
                const isCancelling = cancelling === offer._id;
                const deadline    = offer.acceptDeadlineAt ? getDeadlineText(offer.acceptDeadlineAt) : null;
                const isAccepted  = offer.requestStatus === "accepted";
                const canCancel   = offer.requestStatus === "pending";

                return (
                  <tr key={offer._id} className="h-[70px]">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-medium text-sm">{offer.gameTitle || "—"}</span>
                        <span className="text-white/30 text-xs">#{offer.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {offer.offerPrice} USDC
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">
                      {offer.gameActualPrice > 0 ? `${offer.gameActualPrice} USDC` : "—"}
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span>{offer.priceDuration || "—"}</span>
                        {isAccepted && deadline && (
                          <span className={`text-xs font-medium ${deadline.expired ? "text-red-400" : "text-orange-400"}`}>
                            ⏳ {deadline.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors.text}`}
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        {offer.requestStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAccepted && !deadline?.expired ? (
                        <button
                          onClick={() => handleCompletePurchase(offer)}
                          disabled={navigating === offer._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                          style={{
                            background: "rgba(74,222,128,0.12)",
                            border: "1px solid rgba(74,222,128,0.3)",
                            color: "#4ade80",
                          }}
                        >
                          {navigating === offer._id ? "Loading..." : "Complete Purchase →"}
                        </button>
                      ) : canCancel ? (
                        <button
                          onClick={() => handleCancel(offer._id)}
                          disabled={isCancelling}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{
                            background: "rgba(239,68,68,0.10)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#f87171",
                          }}
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Offer"}
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
        )}
      </div>
    </div>
  );
}

export default MyOffers;
