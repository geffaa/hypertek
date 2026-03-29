import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";

function CollectionOnSale() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();
  const wallet = wagmiAddress?.toLowerCase() || emailWalletAddress?.toLowerCase() || user?.WalletAddress || user?.MetaMaskAddress || "";

  const fetchListings = async () => {
    if (!wallet) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/listed-subs/${encodeURIComponent(wallet)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data.listedSubCollections || []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [wallet]);

  const [cancelling, setCancelling] = useState(null); // subId being cancelled

  const handleCancelListing = async (item) => {
    if (!window.confirm(`Cancel listing for "${item.name}"? The item will return to unlisted.`)) return;
    setCancelling(item.subId);
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/cancel`,
        { nftId: item.parentInfo.parentId, subId: item.subId, tokenId: item.tokenId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${item.name}" listing cancelled`);
      setItems((prev) => prev.filter((i) => i.subId !== item.subId));
    } catch {
      toast.error("Failed to cancel listing");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <div className="flex flex-col w-full max-w-[426px] gap-6 px-6 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">Collection On Sale</h1>
      </div>

      {/* Table */}
      <div className="px-6 md:pl-24 mt-12 z-10 relative overflow-x-auto">
        {loading ? (
          <div className="text-white/50 text-sm py-16 text-center">Loading your listings...</div>
        ) : !wallet ? (
          <div className="text-white/50 text-sm py-16 text-center">Connect your wallet to see listings.</div>
        ) : items.length === 0 ? (
          <div className="text-white/50 text-sm py-16 text-center">No items currently listed for sale.</div>
        ) : (
          <table className="w-full min-w-[900px] text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="h-[50px]">
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Image</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Name</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Price</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Collection</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Status</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item) => {
                const imgSrc = item.image ? getImageUrl(item.image) : Collectionimage;
                const isCancelling = cancelling === item.subId;
                return (
                  <tr key={item.subId} className="h-[70px] transition-all duration-200">
                    <td className="px-6 py-4">
                      <img src={imgSrc} alt={item.name} className="w-12 h-12 object-cover border border-white/10 rounded" />
                    </td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                      {item.priceETH != null ? `${item.priceETH} USDC` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium text-sm">
                      {item.parentInfo?.parentName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-green-300"
                        style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Listed
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCancelListing(item)}
                        disabled={isCancelling}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Listing"}
                      </button>
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

export default CollectionOnSale;
