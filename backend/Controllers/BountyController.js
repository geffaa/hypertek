import Bounty from "../Models/BountyModel.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
async function expireBounties() {
  await Bounty.updateMany(
    { status: "open", expiresAt: { $lt: new Date() } },
    { status: "expired" }
  );
}

// ── GET /api/v1/bounty ────────────────────────────────────────────────────────
export async function getBounties(req, res) {
  try {
    await expireBounties();
    const { status = "open", category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");

    const skip = (Number(page) - 1) * Number(limit);
    const [bounties, total] = await Promise.all([
      Bounty.find(filter).sort({ reward: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Bounty.countDocuments(filter),
    ]);
    res.json({ bounties, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/bounty/:id ────────────────────────────────────────────────────
export async function getBounty(req, res) {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ error: "Bounty not found" });
    res.json(bounty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/bounty (auth required) ──────────────────────────────────────
export async function createBounty(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      posterWallet, posterName,
      targetName, targetWallet,
      title, description, image, category,
      reward,
    } = req.body;

    if (!posterWallet || !targetName || !title) {
      return res.status(400).json({ error: "posterWallet, targetName, and title are required" });
    }
    if (!reward || Number(reward) <= 0) {
      return res.status(400).json({ error: "Bounty reward must be greater than 0 USDC" });
    }

    const bounty = await Bounty.create({
      poster: userId, posterWallet, posterName: posterName || "Anonymous",
      targetName, targetWallet: targetWallet || "",
      title, description, image, category,
      reward: Number(reward),
    });
    res.status(201).json(bounty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/bounty/:id/claim (auth required) ────────────────────────────
export async function claimBounty(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { claimedByWallet } = req.body;
    if (!claimedByWallet) return res.status(400).json({ error: "claimedByWallet required" });

    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ error: "Bounty not found" });
    if (bounty.status !== "open") return res.status(400).json({ error: "Bounty is no longer open" });
    if (String(bounty.poster) === String(userId)) {
      return res.status(400).json({ error: "Cannot claim your own bounty" });
    }

    bounty.claimedBy = userId;
    bounty.claimedByWallet = claimedByWallet;
    bounty.claimedAt = new Date();
    bounty.status = "claimed";
    await bounty.save();
    res.json(bounty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/bounty/:id/complete (auth required, poster only) ─────────────
export async function completeBounty(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ error: "Bounty not found" });
    if (String(bounty.poster) !== String(userId)) {
      return res.status(403).json({ error: "Only the poster can mark a bounty as completed" });
    }
    if (bounty.status !== "claimed") {
      return res.status(400).json({ error: "Bounty must be claimed before completing" });
    }
    bounty.status = "completed";
    await bounty.save();
    res.json({ message: "Bounty completed", bounty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/bounty/:id/cancel (auth required, poster only) ───────────────
export async function cancelBounty(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ error: "Bounty not found" });
    if (String(bounty.poster) !== String(userId)) {
      return res.status(403).json({ error: "Only the poster can cancel this bounty" });
    }
    if (!["open"].includes(bounty.status)) {
      return res.status(400).json({ error: "Can only cancel open bounties" });
    }
    bounty.status = "cancelled";
    await bounty.save();
    res.json({ message: "Bounty cancelled", bounty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/bounty/poster/:wallet ────────────────────────────────────────
export async function getPosterBounties(req, res) {
  try {
    const bounties = await Bounty.find({ posterWallet: req.params.wallet }).sort({ createdAt: -1 });
    res.json(bounties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
