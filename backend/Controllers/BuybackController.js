import BuybackRequest from "../Models/BuybackRequest.js";
import NFTSystem from "../Models/NFTSystem.js";
import User from "../Models/User.js";

// POST /api/v1/buyback/request
// Auth: user
export async function submitBuybackRequest(req, res) {
  try {
    const { parentId, subCollectionId } = req.body;

    if (!parentId || !subCollectionId) {
      return res.status(400).json({ error: "parentId and subCollectionId are required" });
    }

    // Find the NFTSystem parent document
    const nftSystem = await NFTSystem.findById(parentId);
    if (!nftSystem) {
      return res.status(404).json({ error: "NFT collection not found" });
    }

    // Get the sub-collection
    const subCollection = nftSystem.subCollections.id(subCollectionId);
    if (!subCollection) {
      return res.status(404).json({ error: "Sub-collection item not found" });
    }

    // Check if a pending request for this subCollectionId already exists
    const existing = await BuybackRequest.findOne({
      subCollectionId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ error: "Request already pending" });
    }

    // Get user wallet address
    const user = await User.findById(req.user._id);
    const userWallet = (user && (user.WalletAddress || user.MetaMaskAddress)) || "";

    const request = await BuybackRequest.create({
      userId: req.user._id,
      userWallet,
      parentId,
      subCollectionId,
      itemName: subCollection.name || "",
      collectionName: nftSystem.collection?.name || "",
      minimumBuybackUSD: subCollection.minimumBuybackUSD || 0,
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    console.error("submitBuybackRequest error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/v1/admin/buyback/requests
// Auth: admin
export async function getBuybackRequests(req, res) {
  try {
    const requests = await BuybackRequest.find()
      .sort({ createdAt: -1 })
      .populate("userId", "Email FullName WalletAddress");

    return res.status(200).json({ success: true, requests, count: requests.length });
  } catch (error) {
    console.error("getBuybackRequests error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/v1/admin/buyback/requests/:id/approve
// Auth: admin
export async function approveBuybackRequest(req, res) {
  try {
    const { id } = req.params;
    const { txHash, adminNote } = req.body;

    const request = await BuybackRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Buyback request not found" });
    }

    request.status = "approved";
    request.approvedAt = new Date();
    request.txHash = txHash || "";
    request.adminNote = adminNote || "";
    await request.save();

    // Set subCollection.buybackPending = false in NFTSystem
    await NFTSystem.updateOne(
      { _id: request.parentId, "subCollections._id": request.subCollectionId },
      { $set: { "subCollections.$.buybackPending": false } }
    );

    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("approveBuybackRequest error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/v1/admin/buyback/requests/:id/reject
// Auth: admin
export async function rejectBuybackRequest(req, res) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const request = await BuybackRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Buyback request not found" });
    }

    request.status = "rejected";
    request.rejectedAt = new Date();
    request.adminNote = adminNote || "";
    await request.save();

    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("rejectBuybackRequest error:", error);
    return res.status(500).json({ error: error.message });
  }
}
