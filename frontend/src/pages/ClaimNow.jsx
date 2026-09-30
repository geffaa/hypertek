import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { toast } from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import { BASE_CHAIN_ID } from "../Web3/Config";
import { useEmailWallet } from "../hooks/useEmailWallet";
import { useTradeInPreview } from "../hooks/useTradeInPreview";
import { TRADE_IN_ESCROW_ABI, ERC721_APPROVAL_ABI, getTradeInConfig, formatUsdc } from "../Web3/tradeInEscrow";

const explorerBase = BASE_CHAIN_ID === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org";

function TradeInRow({ item, walletClient, account, publicClient }) {
  const t = useTradeInPreview(item.tokenId);
  const [busy, setBusy] = useState(null);

  if (t.loading) return null;
  if (!t.live || !(t.principal > 0n)) return null;

  const args = [t.nftAddress, BigInt(item.tokenId)];

  const send = async (label, fn) => {
    if (!walletClient || !account) return toast.error("Connect the wallet that owns this item");
    try {
      setBusy(label);
      await fn();
      toast.success(label === "trade" ? "Item traded in" : "Early withdrawal sent to your wallet");
      t.reload();
    } catch (err) {
      toast.error(err.shortMessage || err.message);
    } finally {
      setBusy(null);
    }
  };

  const write = async (address, abi, functionName, fnArgs) => {
    const hash = await walletClient.writeContract({ address, abi, functionName, args: fnArgs, account });
    await publicClient.waitForTransactionReceipt({ hash });
  };

  const tradeIn = () => send("trade", async () => {
    const [approved, forAll] = await Promise.all([
      publicClient.readContract({ address: t.nftAddress, abi: ERC721_APPROVAL_ABI, functionName: "getApproved", args: [BigInt(item.tokenId)] }),
      publicClient.readContract({ address: t.nftAddress, abi: ERC721_APPROVAL_ABI, functionName: "isApprovedForAll", args: [account, t.escrowAddress] }),
    ]);
    if (!forAll && approved.toLowerCase() !== t.escrowAddress.toLowerCase()) {
      await write(t.nftAddress, ERC721_APPROVAL_ABI, "approve", [t.escrowAddress, BigInt(item.tokenId)]);
    }
    await write(t.escrowAddress, TRADE_IN_ESCROW_ABI, "claimBuyback", args);
  });

  const withdrawPartial = () => send("partial", () => write(t.escrowAddress, TRADE_IN_ESCROW_ABI, "withdrawPartial", args));

  return (
    <div data-testid="claim-item-row" className="bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.name || "Untitled item"}</p>
          <p className="text-sm text-gray-500">
            Loyalty tier {t.pctNow}% of {formatUsdc(t.principal)} USDC
            {t.next && <> · rises to {t.next.pct}% on {t.next.date.toLocaleDateString()}</>}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-indigo-700">{formatUsdc(t.amountNow)} USDC</p>
        <div className="flex gap-2 justify-end mt-1">
          {t.canWithdrawPartial && (
            <button type="button" onClick={withdrawPartial} disabled={!!busy}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-700 border border-indigo-300 hover:bg-indigo-50 disabled:opacity-50">
              {busy === "partial" ? "Sending..." : "Withdraw 45% early"}
            </button>
          )}
          <button type="button" onClick={tradeIn} disabled={!!busy} data-testid="claim-button"
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {busy === "trade" ? "Trading in..." : "Trade in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Lists the player's items that hold a Programmatic Trade-In Value and lets
// the owning wallet trade them in directly against the escrow contract.
export default function ClaimNowPage() {
  const { token: authToken, isLoggedInUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { address: wagmiAddress } = useAccount();
  const { data: wagmiWalletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { emailWalletAddress, emailWalletClient } = useEmailWallet();
  const account = wagmiAddress || emailWalletAddress;
  const walletClient = wagmiWalletClient || emailWalletClient;

  const [items, setItems] = useState([]);
  const [config, setConfig] = useState({ isLive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedInUser) {
      toast.error("Please log in to view your items");
      navigate("/signin");
      return;
    }
    const run = async () => {
      try {
        const [cfg, itemsRes] = await Promise.all([
          getTradeInConfig(),
          fetch(`${BACKEND_BASE_URL}/api/v1/gmbb-claim/items`, { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);
        const itemsData = await itemsRes.json();
        setConfig(cfg);
        if (itemsData.success) setItems(itemsData.items);
      } catch {
        toast.error("Could not load your items");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100 pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trade in your items</h1>
        <p className="text-gray-600 mb-2">
          Each eligible item carries a Programmatic Trade-In Value held in an on-chain escrow. The owning wallet may trade an
          item in at any time: the item is surrendered and recycled back into the game, and the amount set by the Tiered
          Loyalty Return Schedule is sent to your wallet. The amount returned is always less than the amount originally
          allocated to the item.
        </p>
        {config.contractAddress && (
          <p className="text-sm text-gray-500 mb-8">
            Anyone can verify the escrow on{" "}
            <a href={`${explorerBase}/address/${config.contractAddress}`} target="_blank" rel="noreferrer" className="underline text-indigo-700">
              BaseScan
            </a>.
          </p>
        )}

        {!config.isLive ? (
          <div data-testid="claim-not-live-banner" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-5 py-4 text-sm">
            Trade-ins are not available yet.
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-600">You don't currently own any items.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <TradeInRow key={item.subCollectionId} item={item} walletClient={walletClient} account={account} publicClient={publicClient} />
            ))}
            <p className="text-xs text-gray-500">Only items that currently hold a trade-in value are listed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
