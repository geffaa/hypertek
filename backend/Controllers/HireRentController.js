import HireRent from "../Models/HireRentModel.js";

const VALID_DURATIONS = [8, 24, 72, 168, 720];

// ── GET /api/v1/hire ──────────────────────────────────────────────────────────
export async function getListings(req, res) {
  try {
    const { type, status = "available", category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type && ["hire", "rent"].includes(type)) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");

    // Filter out listings in cooldown that have passed cooldown time
    const now = new Date();
    await HireRent.updateMany(
      { status: "cooldown", cooldownUntil: { $lt: now } },
      { status: "available", renter: null, renterWallet: null, startTime: null, endTime: null, cooldownUntil: null }
    );
    // Move "rented" listings past endTime to cooldown
    const expiredRentals = await HireRent.find({ status: "rented", endTime: { $lt: now } });
    for (const item of expiredRentals) {
      item.status = "cooldown";
      item.cooldownUntil = new Date(now.getTime() + item.durationHours * 2 * 3600 * 1000);
      await item.save();
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      HireRent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      HireRent.countDocuments(filter),
    ]);
    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/hire/:id ──────────────────────────────────────────────────────
export async function getListing(req, res) {
  try {
    const listing = await HireRent.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/hire (auth required) ────────────────────────────────────────
export async function createListing(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      type, itemTitle, itemDescription, image, category,
      ownerWallet, ownerName, nftSystemId, subCollectionId,
      pricePerDuration, durationHours,
    } = req.body;

    if (!type || !["hire", "rent"].includes(type)) {
      return res.status(400).json({ error: "type must be 'hire' or 'rent'" });
    }
    if (!itemTitle || !ownerWallet || pricePerDuration == null || !durationHours) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!VALID_DURATIONS.includes(Number(durationHours))) {
      return res.status(400).json({ error: `durationHours must be one of: ${VALID_DURATIONS.join(", ")}` });
    }

    const listing = await HireRent.create({
      type, itemTitle, itemDescription, image, category,
      owner: userId, ownerWallet, ownerName: ownerName || "Anonymous",
      nftSystemId: nftSystemId || null,
      subCollectionId: subCollectionId || null,
      pricePerDuration: Number(pricePerDuration),
      durationHours: Number(durationHours),
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/hire/:id/rent (auth required) ───────────────────────────────
export async function rentItem(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { renterWallet } = req.body;
    if (!renterWallet) return res.status(400).json({ error: "renterWallet required" });

    const listing = await HireRent.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "available") {
      return res.status(400).json({ error: `Item is not available (status: ${listing.status})` });
    }
    if (String(listing.owner) === String(userId)) {
      return res.status(400).json({ error: "Cannot rent your own listing" });
    }

    const now = new Date();
    listing.renter = userId;
    listing.renterWallet = renterWallet;
    listing.startTime = now;
    listing.endTime = new Date(now.getTime() + listing.durationHours * 3600 * 1000);
    listing.status = "rented";
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/hire/:id/return (auth required, renter only) ─────────────────
export async function returnItem(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const listing = await HireRent.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "rented") return res.status(400).json({ error: "Item is not currently rented" });
    if (String(listing.renter) !== String(userId)) {
      return res.status(403).json({ error: "Only the renter can return this item" });
    }

    const now = new Date();
    listing.status = "cooldown";
    listing.cooldownUntil = new Date(now.getTime() + listing.durationHours * 2 * 3600 * 1000);
    await listing.save();
    res.json({ message: "Item returned. Cooldown active.", listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/hire/:id/cancel (auth required, owner only) ──────────────────
export async function cancelListing(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const listing = await HireRent.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (String(listing.owner) !== String(userId)) {
      return res.status(403).json({ error: "Only the owner can cancel this listing" });
    }
    if (listing.status === "rented") {
      return res.status(400).json({ error: "Cannot cancel while item is being rented" });
    }
    listing.status = "cancelled";
    await listing.save();
    res.json({ message: "Listing cancelled", listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/hire/owner/:wallet ────────────────────────────────────────────
export async function getOwnerListings(req, res) {
  try {
    const listings = await HireRent.find({ ownerWallet: req.params.wallet }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
