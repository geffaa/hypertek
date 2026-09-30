import NFTSystem from "../Models/NFTSystem.js";
import User from "../Models/User.js";

// Tells the frontend where the trade-in escrow lives. Every trade-in figure
// shown to a player is read from this contract on-chain, never from Mongo.
export async function GetClaimConfig(req, res) {
  const contractAddress = process.env.BUYBACK_ESCROW_ADDRESS || null;
  res.json({
    success: true,
    isLive: Boolean(contractAddress),
    contractAddress,
    nftAddress: process.env.MYNFT_ADDRESS || null,
    chainId: Number(process.env.BASE_CHAIN_ID) || 84532,
  });
}

// The caller's own minted items. Which of them hold a trade-in balance, and
// how much, is answered by the escrow contract, not by this list.
export async function GetClaimableItems(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    const wallet = (user?.WalletAddress || user?.MetaMaskAddress || "").toLowerCase();
    if (!wallet) return res.json({ success: true, items: [] });

    const parents = await NFTSystem.find({ "subCollections.owner": new RegExp(`^${wallet}$`, "i") });

    const items = [];
    for (const parent of parents) {
      for (const sub of parent.subCollections) {
        if ((sub.owner || "").toLowerCase() !== wallet) continue;
        if (sub.tokenId == null) continue;
        items.push({
          parentId: parent._id,
          subCollectionId: sub._id,
          name: sub.name || "",
          image: sub.image || "",
          assetType: sub.assetType || "",
          tokenId: sub.tokenId,
        });
      }
    }

    res.json({ success: true, items });
  } catch (error) {
    console.error("GetClaimableItems error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
