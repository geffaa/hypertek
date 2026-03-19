import Trade from "../Models/TradeModel.js";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
async function expireTrades() {
  await Trade.updateMany(
    { status: "open", expiresAt: { $lt: new Date() } },
    { status: "expired" }
  );
}

// ── GET /api/v1/trade ─────────────────────────────────────────────────────────
export async function getTrades(req, res) {
  try {
    await expireTrades();
    const { type, status = "open", category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type && ["trade", "quest"].includes(type)) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");

    const skip = (Number(page) - 1) * Number(limit);
    const [trades, total] = await Promise.all([
      Trade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Trade.countDocuments(filter),
    ]);
    res.json({ trades, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/trade/:id ─────────────────────────────────────────────────────
export async function getTrade(req, res) {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: "Trade/Quest not found" });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/trade (auth required) ───────────────────────────────────────
export async function createTrade(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      type, posterWallet, posterName,
      title, description, offering, requesting,
      offeringHB, requestingHB,
      reward, image, category,
    } = req.body;

    if (!type || !["trade", "quest"].includes(type)) {
      return res.status(400).json({ error: "type must be 'trade' or 'quest'" });
    }
    if (!title || !posterWallet) {
      return res.status(400).json({ error: "title and posterWallet required" });
    }
    if (type === "quest" && (reward == null || Number(reward) <= 0)) {
      return res.status(400).json({ error: "Quest requires a positive reward amount" });
    }
    if (type === "trade" && (!offering || !requesting)) {
      return res.status(400).json({ error: "Trade requires offering and requesting fields" });
    }

    // If poster is offering HB, validate they have enough
    const hbOffered = Number(offeringHB) || 0;
    if (hbOffered > 0) {
      const poster = await User.findById(userId).select("hyperBucks");
      if (!poster || (poster.hyperBucks || 0) < hbOffered) {
        return res.status(400).json({
          error: `Insufficient HB balance. You have ${poster?.hyperBucks || 0} HB, offering ${hbOffered} HB.`,
        });
      }
    }

    const trade = await Trade.create({
      type, poster: userId, posterWallet, posterName: posterName || "Anonymous",
      title, description, offering, requesting,
      offeringHB:   hbOffered,
      requestingHB: Number(requestingHB) || 0,
      reward:       type === "quest" ? Number(reward) : 0,
      image, category,
    });
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/trade/:id/accept (auth required) ────────────────────────────
export async function acceptTrade(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { acceptedByWallet } = req.body;
    if (!acceptedByWallet) return res.status(400).json({ error: "acceptedByWallet required" });

    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: "Trade/Quest not found" });
    if (trade.status !== "open") return res.status(400).json({ error: "This listing is no longer open" });
    if (String(trade.poster) === String(userId)) {
      return res.status(400).json({ error: "Cannot accept your own listing" });
    }

    trade.acceptedBy = userId;
    trade.acceptedByWallet = acceptedByWallet;
    trade.status = "accepted";
    await trade.save();
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/trade/:id/complete (auth required, poster only) ───────────────
export async function completeTrade(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const trade = await Trade.findById(req.params.id).populate("poster acceptedBy");
    if (!trade) return res.status(404).json({ error: "Trade/Quest not found" });

    const posterId     = trade.poster?._id || trade.poster;
    const acceptedById = trade.acceptedBy?._id || trade.acceptedBy;

    if (String(posterId) !== String(userId)) {
      return res.status(403).json({ error: "Only the poster can mark as completed" });
    }
    if (trade.status !== "accepted") {
      return res.status(400).json({ error: "Trade must be accepted before completion" });
    }

    // ── HB settlement ──────────────────────────────────────────────────────
    // offeringHB:   poster gives HB → acceptedBy receives
    // requestingHB: acceptedBy gives HB → poster receives
    const hbErrors = [];

    if (trade.offeringHB > 0 && acceptedById) {
      try {
        // Debit from poster
        const poster = await User.findById(posterId);
        if (!poster || (poster.hyperBucks || 0) < trade.offeringHB) {
          hbErrors.push(`Poster has insufficient HB (${poster?.hyperBucks || 0} < ${trade.offeringHB})`);
        } else {
          poster.hyperBucks -= trade.offeringHB;
          await poster.save();
          await HBLedger.create({
            userId:       posterId,
            type:         "spend",
            amount:       -trade.offeringHB,
            balanceAfter: poster.hyperBucks,
            description:  `Trade HB payment: "${trade.title}"`,
            reference:    String(trade._id),
          });

          // Credit acceptedBy
          const acceptor = await User.findById(acceptedById);
          if (acceptor) {
            acceptor.hyperBucks = (acceptor.hyperBucks || 0) + trade.offeringHB;
            await acceptor.save();
            await HBLedger.create({
              userId:       acceptedById,
              type:         "earn",
              amount:       trade.offeringHB,
              balanceAfter: acceptor.hyperBucks,
              description:  `Trade HB received: "${trade.title}"`,
              reference:    String(trade._id),
            });
          }
        }
      } catch (hbErr) {
        hbErrors.push(`offeringHB transfer error: ${hbErr.message}`);
      }
    }

    if (trade.requestingHB > 0 && acceptedById) {
      try {
        // Debit from acceptedBy
        const acceptor = await User.findById(acceptedById);
        if (!acceptor || (acceptor.hyperBucks || 0) < trade.requestingHB) {
          hbErrors.push(`Acceptor has insufficient HB (${acceptor?.hyperBucks || 0} < ${trade.requestingHB})`);
        } else {
          acceptor.hyperBucks -= trade.requestingHB;
          await acceptor.save();
          await HBLedger.create({
            userId:       acceptedById,
            type:         "spend",
            amount:       -trade.requestingHB,
            balanceAfter: acceptor.hyperBucks,
            description:  `Trade HB payment: "${trade.title}"`,
            reference:    String(trade._id),
          });

          // Credit poster
          const poster = await User.findById(posterId);
          if (poster) {
            poster.hyperBucks = (poster.hyperBucks || 0) + trade.requestingHB;
            await poster.save();
            await HBLedger.create({
              userId:       posterId,
              type:         "earn",
              amount:       trade.requestingHB,
              balanceAfter: poster.hyperBucks,
              description:  `Trade HB received: "${trade.title}"`,
              reference:    String(trade._id),
            });
          }
        }
      } catch (hbErr) {
        hbErrors.push(`requestingHB transfer error: ${hbErr.message}`);
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    trade.status = "completed";
    await trade.save();

    res.json({
      message: "Trade completed",
      trade,
      hbSettlement: hbErrors.length > 0
        ? { status: "partial", errors: hbErrors }
        : { status: "ok", offeringHBTransferred: trade.offeringHB, requestingHBTransferred: trade.requestingHB },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── PUT /api/v1/trade/:id/cancel (auth required, poster only) ────────────────
export async function cancelTrade(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: "Trade/Quest not found" });
    if (String(trade.poster) !== String(userId)) {
      return res.status(403).json({ error: "Only the poster can cancel this listing" });
    }
    if (!["open", "accepted"].includes(trade.status)) {
      return res.status(400).json({ error: "Cannot cancel a completed or already cancelled listing" });
    }
    trade.status = "cancelled";
    await trade.save();
    res.json({ message: "Listing cancelled", trade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/v1/trade/poster/:wallet ─────────────────────────────────────────
export async function getPosterTrades(req, res) {
  try {
    const trades = await Trade.find({ posterWallet: req.params.wallet }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
