import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useEmailWallet } from "../hooks/useEmailWallet";
import { BACKEND_BASE_URL } from "../Config";
import { toast } from "react-hot-toast";
import PurchaseAcknowledgement from "../Components/Common/PurchaseAcknowledgement";
import { ackPayload } from "../data/purchaseAcknowledgement";

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const PLATFORM_WALLET = import.meta.env.VITE_PLATFORM_WALLET;

export default function PackageCheckoutPage() {
  const { idOrSlug } = useParams();
  const { user, token: authToken, isLoggedInUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { address: wagmiAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { emailWalletAddress, emailWalletClient } = useEmailWallet();
  const activeAddress = wagmiAddress || emailWalletAddress;
  const activeWalletClient = walletClient || emailWalletClient;

  const [pkg, setPkg] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState("idle"); // idle | sending | verifying | done
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!isLoggedInUser) {
      toast.error("Please log in to buy a package");
      navigate("/signin");
      return;
    }

    const run = async () => {
      try {
        const pkgRes = await fetch(`${BACKEND_BASE_URL}/api/v1/packages/${idOrSlug}`);
        const pkgData = await pkgRes.json();
        if (!pkgData.success) throw new Error(pkgData.error || "Package not found");
        setPkg(pkgData.package);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [idOrSlug, isLoggedInUser]);

  const handlePayWithUSDC = async () => {
    if (!activeWalletClient || !activeAddress) {
      toast.error("Connect a wallet first");
      return;
    }
    if (!USDC_ADDRESS || !PLATFORM_WALLET) {
      toast.error("Platform wallet not configured");
      return;
    }

    try {
      setStep("sending");
      // The purchase is only opened once the buyer has ticked the acknowledgement.
      let current = purchase;
      if (!current) {
        const purchaseRes = await fetch(`${BACKEND_BASE_URL}/api/v1/packages/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ packageId: pkg._id, buyerWallet: activeAddress || user?.WalletAddress || user?.MetaMaskAddress, acknowledgement: ackPayload() }),
        });
        const purchaseData = await purchaseRes.json();
        if (!purchaseData.success) throw new Error(purchaseData.error || "Could not start purchase");
        current = purchaseData.purchase;
        setPurchase(current);
      }

      const amountUnits = BigInt(Math.round(pkg.priceUSD * 1_000_000)); // USDC = 6 decimals

      const txHash = await activeWalletClient.writeContract({
        address: USDC_ADDRESS,
        abi: [{ name: "transfer", type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }],
        functionName: "transfer",
        args: [PLATFORM_WALLET, amountUnits],
        account: activeWalletClient.account || activeAddress,
      });

      toast.loading("Waiting for transaction confirmation...", { id: "pkg-usdc" });
      setStep("verifying");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/packages/purchase/${current._id}/confirm-usdc`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Verification failed", { id: "pkg-usdc" });
        setStep("idle");
        return;
      }

      toast.success("Purchase complete!", { id: "pkg-usdc" });
      setStep("done");
      setPurchase(data.purchase);
    } catch (err) {
      toast.dismiss("pkg-usdc");
      if (err.message?.includes("rejected") || err.message?.includes("denied")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error("Failed: " + err.message);
      }
      setStep("idle");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading checkout...</div>;
  }
  if (error || !pkg) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Package not found"}</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100 py-10 px-4">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-2xl shadow-xl rounded-2xl p-10 border border-white/20">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Checkout</h2>
        <div className="mb-6 text-center">
          {pkg.image && <img src={pkg.image} alt={pkg.name} className="w-28 h-28 mx-auto rounded-xl object-cover mb-3" />}
          <h3 className="text-xl font-semibold">{pkg.name}</h3>
          <p className="text-lg font-semibold text-indigo-700">${pkg.priceUSD} USDC</p>
        </div>

        {step === "done" ? (
          <p className="text-center text-green-600 font-semibold" data-testid="purchase-done">Purchase complete! Check your dashboard.</p>
        ) : !activeAddress ? (
          <p className="text-center text-gray-600">Connect your wallet to pay with USDC.</p>
        ) : (
          <>
          <div className="mb-4"><PurchaseAcknowledgement checked={ack} onChange={setAck} light /></div>
          <button
            type="button"
            onClick={handlePayWithUSDC}
            disabled={!ack || step === "sending" || step === "verifying"}
            data-testid="pay-usdc-button"
            className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
              !ack || step === "sending" || step === "verifying"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            }`}
          >
            {step === "sending" ? "Sending..." : step === "verifying" ? "Verifying..." : `Pay $${pkg.priceUSD} USDC`}
          </button>
          </>
        )}
      </div>
    </div>
  );
}
