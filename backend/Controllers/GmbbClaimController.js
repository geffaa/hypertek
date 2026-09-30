import NFTSystem from "../Models/NFTSystem.js";
import User from "../Models/User.js";

// The escrow contract isn't deployed anywhere yet (see hardhat/contracts/BuybackEscrow.sol
// and docs/12Sep/Progress-Package-Purchase-Flow.md) — this flag is what the frontend uses
// to decide whether to show the claim button as live or as "coming soon". Never claim this
// is live unless the address is actually configured.
export async function GetClaimConfig(req, res) {
  const contractAddress = process.env.BUYBACK_ESCROW_ADDRESS || null;
  res.json({
    success: true,
    isLive: Boolean(contractAddress),
    contractAddress,
    chainId: Number(process.env.BASE_CHAIN_ID) || 84532,
  });
}

// List the caller's own items that carry a GMBB guarantee. This is informational only —
// it reads the off-chain minimumBuybackUSD snapshot, not a live on-chain vested amount,
// because there is no live contract to read a vested amount from yet.
export async function GetClaimableItems(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    const wallet = (user?.WalletAddress || user?.MetaMaskAddress || "").toLowerCase();
    if (!wallet) {
      return res.json({ success: true, items: [] });
    }

    const parents = await NFTSystem.find({
      "subCollections.owner": new RegExp(`^${wallet}$`, "i"),
      "subCollections.minimumBuybackUSD": { $gt: 0 },
    });

    const items = [];
    for (const parent of parents) {
      for (const sub of parent.subCollections) {
        if ((sub.owner || "").toLowerCase() !== wallet) continue;
        if (!(sub.minimumBuybackUSD > 0)) continue;
        items.push({
          parentId: parent._id,
          subCollectionId: sub._id,
          name: sub.name || "",
          image: sub.image || "",
          assetType: sub.assetType || "",
          tokenId: sub.tokenId ?? null,
          guaranteedUSD: sub.minimumBuybackUSD,
        });
      }
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error("GetClaimableItems error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
