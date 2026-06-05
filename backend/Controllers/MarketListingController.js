import MarketListing from "../Models/MarketListingModel.js";
import HireRent from "../Models/HireRentModel.js";
import NFTSystem from "../Models/NFTSystem.js";
import Auction from "../Models/AuctionModel.js";
import { createNotification } from "../services/notificationService.js";
import { cancelSiblingListings } from "../services/cancelSiblingListings.js";

// Sync priceETH + listed flag on the NFTSystem subCollection
async function syncSubCollectionPrice(nftSystemId, subCollectionId, priceETH, listed) {
  if (!nftSystemId || !subCollectionId) return;
  try {
    const parent = await NFTSystem.findById(nftSystemId);
    if (!parent) return;
    const sub = parent.subCollections.id(subCollectionId);
    if (!sub) return;
    sub.priceETH = priceETH;
    sub.listed   = listed;
    parent.markModified("subCollections");
    await parent.save();
  } catch (err) {
    console.error("syncSubCollectionPrice error:", err.message);
  }
}

const WARN_BEFORE_MS = 24 * 60 * 60 * 1000; // notify 24h before expiry

// ── GET /api/v1/listings/my  (auth required) ─────────────────────────────────
// Returns listings grouped by category, only non-empty categories
export const getMyListings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const [listings, ownedHire, rentedHire] = await Promise.all([
      MarketListing.find({ userId, status: { $in: ["active", "pending"] } }).sort({ createdAt: -1 }).lean(),
      HireRent.find({ owner: userId, status: { $in: ["available", "rented", "cooldown"] } })
        .sort({ createdAt: -1 }).lean(),
      HireRent.find({ renter: userId, status: "rented" })
        .sort({ createdAt: -1 }).lean(),
    ]);

    // Live-sync selling_auction listings with the Auction model so reservePrice
    // (startPrice) and currentBid are always up to date, even for existing records
    // created before the sync fix.
    const auctionListings = listings.filter((l) => l.activityType === "selling_auction" && l.subCollectionId);
    if (auctionListings.length > 0) {
      const subIds = auctionListings.map((l) => l.subCollectionId);
      const liveAuctions = await Auction.find({
        subCollectionId: { $in: subIds },
        status: { $in: ["active", "ended"] },
      }).select("subCollectionId startPrice currentBid status").lean();

      const auctionMap = {};
      liveAuctions.forEach((a) => { auctionMap[String(a.subCollectionId)] = a; });

      auctionListings.forEach((l) => {
        const live = auctionMap[String(l.subCollectionId)];
        if (!live) return;
        // reservePrice: use explicit reserve from MarketListing if set, else startPrice
        if (l.reservePrice == null || l.reservePrice === 0) l.reservePrice = live.startPrice;
        // currentBid: always take the live value from Auction model
        l.currentBid = live.currentBid ?? 0;
      });
    }

    const toHireListing = (h, activityType) => ({
      _id:          h._id,
      activityType,
      itemName:     h.itemTitle,
      itemDescription: h.itemDescription || "",
      itemImage:    h.image || "",
      category:     (h.category || "general").toLowerCase().trim(),
      price:        h.pricePerDuration,
      durationHours: h.durationHours,
      status:       ["available", "rented"].includes(h.status) ? "active" : h.status,
      createdAt:    h.createdAt,
    });

    const allListings = [
      ...listings,
      ...ownedHire.map((h) => toHireListing(h, "on_hire")),
      ...rentedHire.map((h) => toHireListing(h, "hiring")),
    ];

    const grouped = {};
    allListings.forEach((l) => {
      const cat = (l.category || "general").toLowerCase().trim();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(l);
    });

    return res.json({ success: true, grouped });
  } catch (err) {
    console.error("getMyListings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/v1/listings/:id ──────────────────────────────────────────────────
export const getListing = async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });

    // Increment view count
    await MarketListing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    return res.json({ success: true, listing });
  } catch (err) {
    console.error("getListing:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/v1/listings  (auth required) ───────────────────────────────────
export const createListing = async (req, res) => {
  try {
    const {
      category, activityType, itemName, itemDescription, itemImage,
      price, reservePrice, commissionTier,
    } = req.body;

    let { nftSystemId, subCollectionId } = req.body;

    // Auto-detect NFT subCollection if not provided — needed when listing is
    // created from the manual form (no NFT picker), so the marketplace slider
    // can find the item via NFTSystem.subCollections[].listed === true.
    if (activityType === "selling_general" && (!nftSystemId || !subCollectionId) && itemName) {
      const userWallet = req.user.WalletAddress || req.user.MetaMaskAddress || "";
      if (userWallet) {
        const escapedName = itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const parent = await NFTSystem.findOne({
          "subCollections.owner": new RegExp(`^${userWallet}$`, "i"),
          "subCollections.name":  new RegExp(`^${escapedName}$`, "i"),
        });
        if (parent) {
          const sub = parent.subCollections.find(
            (s) =>
              s.name?.toLowerCase() === itemName.toLowerCase() &&
              s.owner?.toLowerCase() === userWallet.toLowerCase()
          );
          if (sub) {
            nftSystemId     = parent._id;
            subCollectionId = sub._id;
          }
        }
      }
    }

    const listing = await MarketListing.create({
      userId:     req.user._id || req.user.id,
      userName:   req.user.FullName || req.user.Email?.split("@")[0] || "Anonymous",
      userWallet: req.user.WalletAddress || req.user.MetaMaskAddress || "",
      category,
      activityType,
      itemName,
      itemDescription,
      itemImage,
      nftSystemId:     nftSystemId || null,
      subCollectionId: subCollectionId ? String(subCollectionId) : null,
      price:           price ?? null,
      reservePrice:    reservePrice ?? null,
      commissionTier:  commissionTier ?? 20,
    });

    // Sync priceETH + listed flag on the NFTSystem subCollection
    if (activityType === "selling_general" && nftSystemId && subCollectionId && price > 0) {
      await syncSubCollectionPrice(nftSystemId, subCollectionId, price, true);
    }

    return res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error("createListing:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/v1/listings/:id  (auth required, owner only) ────────────────────
export const updateListing = async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    if (listing.userId.toString() !== (req.user._id || req.user.id).toString())
      return res.status(403).json({ success: false, message: "Not your listing" });

    const allowed = ["itemName", "itemDescription", "itemImage", "price", "reservePrice", "commissionTier", "status"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) listing[f] = req.body[f]; });

    await listing.save();
    return res.json({ success: true, listing });
  } catch (err) {
    console.error("updateListing:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PUT /api/v1/listings/:id/renew  (auth required, owner only) ──────────────
export const renewListing = async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    if (listing.userId.toString() !== (req.user._id || req.user.id).toString())
      return res.status(403).json({ success: false, message: "Not your listing" });
    if (listing.renewed)
      return res.status(400).json({ success: false, message: "Already renewed once. Please modify or create a new listing." });

    listing.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    listing.renewed = true;
    listing.status = "active";
    listing.expiryNotified = false;
    await listing.save();

    return res.json({ success: true, listing });
  } catch (err) {
    console.error("renewListing:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/v1/listings/:id  (auth required, owner only) ─────────────────
export const deleteListing = async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    if (listing.userId.toString() !== (req.user._id || req.user.id).toString())
      return res.status(403).json({ success: false, message: "Not your listing" });

    // If this was a selling_general listing, reset priceETH on the subCollection
    // only if no other active selling_general listing exists for the same item
    if (listing.activityType === "selling_general" && listing.nftSystemId && listing.subCollectionId) {
      const sibling = await MarketListing.findOne({
        _id:             { $ne: listing._id },
        nftSystemId:     listing.nftSystemId,
        subCollectionId: listing.subCollectionId,
        activityType:    "selling_general",
        status:          "active",
      });
      if (!sibling) {
        await syncSubCollectionPrice(listing.nftSystemId, listing.subCollectionId, 0, false);
      }
    }

    await listing.deleteOne();

    // Cancel any sibling trades/auctions for the same item
    await cancelSiblingListings(listing.subCollectionId, {
      itemName:    listing.itemName,
      ownerWallet: listing.userWallet,
    });

    return res.json({ success: true, message: "Listing removed" });
  } catch (err) {
    console.error("deleteListing:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/v1/listings/:id/offer  (auth required) ─────────────────────────
export const submitOffer = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    if (listing.status !== "active")
      return res.status(400).json({ success: false, message: "Listing is not active" });

    const entry = {
      offererName:   req.user.FullName || "Anonymous",
      offererWallet: req.user.WalletAddress || "",
      amount,
      currency:  currency || "USDC",
    };

    listing.offerHistory.push(entry);
    // Update currentOffer if this is higher (for sell) or lower (for buy)
    if (listing.activityType === "selling_general") {
      if (!listing.currentOffer || amount > listing.currentOffer) listing.currentOffer = amount;
    }
    if (listing.activityType === "buying_general") {
      if (!listing.currentOffer || amount < listing.currentOffer) listing.currentOffer = amount;
    }
    listing.status = "pending";

    await listing.save();

    // Notify the listing owner
    if (listing.userId) {
      const offerer = req.user.FullName || req.user.Email?.split("@")[0] || "Someone";
      createNotification(
        listing.userId,
        "offer",
        "New Offer Received",
        `${offerer} made an offer of ${amount} ${currency || "USDC"} on "${listing.itemName || "your listing"}"`,
        { link: "/dashboard", meta: { listingId: listing._id, amount } }
      );
    }

    return res.json({ success: true, listing });
  } catch (err) {
    console.error("submitOffer:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/v1/listings/:id/bid  (auth required) ───────────────────────────
export const submitBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Not found" });
    if (!["selling_auction", "buying_auction"].includes(listing.activityType))
      return res.status(400).json({ success: false, message: "Not an auction listing" });
    if (listing.status !== "active")
      return res.status(400).json({ success: false, message: "Listing is not active" });
    if (listing.currentBid && amount <= listing.currentBid)
      return res.status(400).json({ success: false, message: "Bid must be higher than current bid" });

    listing.bidHistory.push({
      bidderName:   req.user.FullName || "Anonymous",
      bidderWallet: req.user.WalletAddress || "",
      amount,
    });
    listing.currentBid = amount;

    await listing.save();

    // Notify the listing owner about the new bid
    if (listing.userId) {
      const bidder = req.user.FullName || req.user.Email?.split("@")[0] || "Someone";
      createNotification(
        listing.userId,
        "bid",
        "New Bid on Your Auction",
        `${bidder} placed a bid of ${amount} USDC on "${listing.itemName || "your auction"}"`,
        { link: "/dashboard", meta: { listingId: listing._id, amount } }
      );
    }

    return res.json({ success: true, listing });
  } catch (err) {
    console.error("submitBid:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/v1/listings/marketplace (public) ────────────────────────────────
// Returns active selling_general listings grouped by category for the marketplace slider.
export const getPublicMarketplaceListings = async (req, res) => {
  try {
    const listings = await MarketListing.find({
      activityType: "selling_general",
      status:       "active",
    })
      .select("category itemName itemImage itemDescription price assetType isNFA nftSystemId subCollectionId")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const grouped = {};
    listings.forEach((l) => {
      const cat = l.category || "general";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        _id:            l.subCollectionId || String(l._id),
        name:           l.itemName,
        image:          l.itemImage,
        description:    l.itemDescription,
        priceETH:       l.price,
        assetType:      l.assetType || "NFT",
        isNFA:          l.isNFA || false,
        parentCategory: cat,
        parentId:       l.nftSystemId ? String(l.nftSystemId) : null,
        isDummy:        false,
      });
    });

    return res.json({ success: true, grouped });
  } catch (err) {
    console.error("getPublicMarketplaceListings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
