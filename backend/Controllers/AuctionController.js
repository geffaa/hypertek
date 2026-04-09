import Auction from "../Models/AuctionModel.js";
import NFTSystem from "../Models/NFTSystem.js";
import { cancelSiblingListings } from "../services/cancelSiblingListings.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

// Sync NFTSystem subCollection after auction sale — transfer ownership + record sale
async function syncNFTAfterAuctionSale(auction, winningPrice, buyerWallet) {
  // Cancel sibling marketplace/auction listings for this item (skip the selling auction itself)
  cancelSiblingListings(auction.subCollectionId, { skipAuctionId: auction._id }).catch(() => {});

  if (!auction.nftSystemId || !auction.subCollectionId) return;
  try {
    const parent = await NFTSystem.findById(auction.nftSystemId);
    if (!parent) return;
    const sub = parent.subCollections.id(auction.subCollectionId);
    if (!sub) return;

    const sellerWallet = sub.owner;

    sub.listed    = false;
    sub.priceETH  = winningPrice;
    sub.owner     = buyerWallet.toLowerCase();
    sub.isFirstSale = false;
    sub.salesHistory.push({
      buyer:          buyerWallet.toLowerCase(),
      seller:         sellerWallet,
      priceETH:       winningPrice,
      isFirstSale:    sub.isFirstSale,
      createdAt:      new Date(),
    });

    parent.collection.salesCount = (parent.collection.salesCount || 0) + 1;
    parent.markModified("subCollections");
    await parent.save();
  } catch (err) {
    console.error("❌ syncNFTAfterAuctionSale error:", err.message);
  }
}

async function expireAuctions() {
  await Auction.updateMany(
    { status: "active", endTime: { $lt: new Date() } },
    { status: "ended" }
  );
}

// ── GET /api/v1/auction ───────────────────────────────────────────────────────
export async function getAuctions(req, res) {
  try {
    await expireAuctions();
    const { status = "active", category, isNFA, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");
    if (isNFA !== undefined) filter.isNFA = isNFA === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const [auctions, total] = await Promise.all([
      Auction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Auction.countDocuments(filter),
    ]);
    res.json({ auctions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/auction/:id ───────────────────────────────────────────────────
export async function getAuction(req, res) {
  try {
    await expireAuctions();
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/auction (auth required) ────────────────────────────────────
export async function createAuction(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      nftSystemId, subCollectionId, title, description, image, category, isNFA,
      sellerWallet, startPrice, reservePrice, instantBuyPrice, durationHours,
    } = req.body;

    if (!title || !sellerWallet || startPrice == null || !durationHours) {
      return res.status(400).json({ error: "Missing required fields: title, sellerWallet, startPrice, durationHours" });
    }
    if (![24, 72, 168].includes(Number(durationHours))) {
      return res.status(400).json({ error: "durationHours must be 24, 72, or 168" });
    }

    const endTime = new Date(Date.now() + Number(durationHours) * 3600 * 1000);
    const auction = await Auction.create({
      nftSystemId: nftSystemId || null,
      subCollectionId: subCollectionId || null,
      title, description, image, category,
      isNFA: !!isNFA,
      seller: userId,
      sellerWallet,
      startPrice: Number(startPrice),
      currentBid: 0,
      reservePrice: reservePrice != null ? Number(reservePrice) : 0,
      instantBuyPrice: instantBuyPrice != null ? Number(instantBuyPrice) : null,
      durationHours: Number(durationHours),
      endTime,
    });
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/auction/:id/bid (auth required) ─────────────────────────────
export async function placeBid(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { amount, bidderWallet, bidderName } = req.body;

    if (!amount || !bidderWallet) {
      return res.status(400).json({ error: "amount and bidderWallet required" });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "active") return res.status(400).json({ error: "Auction is not active" });
    if (new Date() > auction.endTime) {
      auction.status = "ended";
      await auction.save();
      return res.status(400).json({ error: "Auction has ended" });
    }

    const minBid = auction.currentBid > 0
      ? auction.currentBid * 1.05  // must beat by 5%
      : auction.startPrice;

    if (Number(amount) < minBid) {
      return res.status(400).json({ error: `Bid must be at least ${minBid.toFixed(2)} USDC` });
    }
    if (String(auction.seller) === String(userId)) {
      return res.status(400).json({ error: "Seller cannot bid on own auction" });
    }

    auction.bidHistory.push({
      bidder: userId,
      bidderWallet,
      bidderName: bidderName || "Anonymous",
      amount: Number(amount),
    });
    auction.currentBid = Number(amount);
    auction.currentBidder = userId;
    auction.currentBidderWallet = bidderWallet;

    await auction.save();
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/auction/:id/instant-buy (auth required) ────────────────────
export async function instantBuy(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { buyerWallet, txHash } = req.body;
    if (!buyerWallet) return res.status(400).json({ error: "buyerWallet required" });

    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "active") return res.status(400).json({ error: "Auction is not active" });
    if (!auction.instantBuyPrice) return res.status(400).json({ error: "No instant buy price set" });
    if (String(auction.seller) === String(userId)) {
      return res.status(400).json({ error: "Seller cannot buy own auction" });
    }

    auction.status = "sold";
    auction.currentBidder = userId;
    auction.currentBidderWallet = buyerWallet;
    auction.currentBid = auction.instantBuyPrice;
    auction.txHash = txHash || null;

    await auction.save();
    await syncNFTAfterAuctionSale(auction, auction.instantBuyPrice, buyerWallet);
    res.json({ message: "Instant buy successful", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/auction/:id/cancel (auth required, seller only) ─────────────
export async function cancelAuction(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (String(auction.seller) !== String(userId)) {
      return res.status(403).json({ error: "Only the seller can cancel this auction" });
    }
    if (auction.bidHistory.length > 0) {
      return res.status(400).json({ error: "Cannot cancel auction with existing bids" });
    }
    auction.status = "cancelled";
    await auction.save();
    res.json({ message: "Auction cancelled", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/auction/seller/:wallet ───────────────────────────────────────
export async function getSellerAuctions(req, res) {
  try {
    const auctions = await Auction.find({ sellerWallet: req.params.wallet }).sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/auction/:id/finalize (auth required) ────────────────────────
// Called after auction ends — transfers item to winning bidder if reserve met.
export async function finalizeAuction(req, res) {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status === "sold") return res.json({ message: "Already finalized", auction });
    if (auction.status === "active" && new Date() < auction.endTime) {
      return res.status(400).json({ error: "Auction is still active" });
    }

    // Reserve price check
    const reserveMet = auction.currentBid >= (auction.reservePrice || 0);
    if (!auction.currentBidderWallet || !reserveMet) {
      auction.status = "ended"; // no winner
      await auction.save();
      return res.json({ message: "Auction ended with no winner — reserve not met or no bids", auction });
    }

    auction.status = "sold";
    await auction.save();
    await syncNFTAfterAuctionSale(auction, auction.currentBid, auction.currentBidderWallet);

    res.json({ message: "Auction finalized — item transferred to winner", auction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
