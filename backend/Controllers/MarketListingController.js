import MarketListing from "../Models/MarketListingModel.js";

const WARN_BEFORE_MS = 24 * 60 * 60 * 1000; // notify 24h before expiry

// ── GET /api/v1/listings/my  (auth required) ─────────────────────────────────
// Returns listings grouped by category, only non-empty categories
export const getMyListings = async (req, res) => {
  try {
    const listings = await MarketListing.find({ userId: req.user._id || req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Group by category, omit empty categories
    const grouped = {};
    listings.forEach((l) => {
      if (!grouped[l.category]) grouped[l.category] = [];
      grouped[l.category].push(l);
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
      nftSystemId, subCollectionId,
      price, reservePrice, commissionTier,
    } = req.body;

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
      subCollectionId: subCollectionId || null,
      price:           price ?? null,
      reservePrice:    reservePrice ?? null,
      commissionTier:  commissionTier ?? 20,
    });

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

    await listing.deleteOne();
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
    return res.json({ success: true, listing });
  } catch (err) {
    console.error("submitBid:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
