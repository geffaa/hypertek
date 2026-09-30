import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../Config";
import { toast } from "react-hot-toast";

// The GMBB Fund escrow contract has not been deployed to any network yet
// (see hardhat/contracts/BuybackEscrow.sol). This page shows what's owed
// today and is ready to wire up the moment /api/v1/gmbb-claim/config
// reports isLive: true — until then, the claim action stays disabled
// rather than pretending to work.
export default function ClaimNowPage() {
  const { token: authToken, isLoggedInUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedInUser) {
      toast.error("Please log in to view your GMBB Fund items");
      navigate("/signin");
      return;
    }

    const run = async () => {
      try {
        const [configRes, itemsRes] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/v1/gmbb-claim/config`),
          fetch(`${BACKEND_BASE_URL}/api/v1/gmbb-claim/items`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);
        const config = await configRes.json();
        const itemsData = await itemsRes.json();
        setIsLive(Boolean(config.isLive));
        if (itemsData.success) setItems(itemsData.items);
      } catch {
        toast.error("Could not load your GMBB Fund items");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isLoggedInUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim your GMBB Fund</h1>
        <p className="text-gray-600 mb-8">
          The GMBB Fund is a right built into the smart contract itself — the wallet that
          owns an item can always claim its vested GMBB amount directly, whether or not an
          auction has ever been run. This page is a convenience only; it doesn't gate that
          right.
        </p>

        {!isLive && (
          <div
            data-testid="claim-not-live-banner"
            className="mb-8 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-5 py-4 text-sm"
          >
            The GMBB Fund smart contract hasn't been deployed yet, so claiming isn't
            available through this page right now. The amounts below are what each item
            is guaranteed once the contract goes live.
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-gray-600">You don't currently own any item with a GMBB Fund guarantee.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.subCollectionId}
                data-testid="claim-item-row"
                className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 shadow p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name || "Untitled item"}</p>
                    <p className="text-sm text-gray-500">{item.assetType}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-indigo-700">${item.guaranteedUSD.toLocaleString()}</p>
                  <button
                    type="button"
                    disabled={!isLive}
                    data-testid="claim-button"
                    title={isLive ? "Claim" : "Coming soon — available once the GMBB Fund contract is live"}
                    className={`mt-1 px-4 py-1.5 rounded-lg text-sm font-semibold text-white ${
                      isLive ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isLive ? "Claim" : "Coming soon"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
