import fs from "fs";
import path from "path";
import Trade from "../Models/TradeModel.js";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import MarketListing from "../Models/MarketListingModel.js";
import NFTSystem from "../Models/NFTSystem.js";
import { getBlockchain } from "../Service/blockchain.js";

const ACTIVE_CHAIN_ID = parseInt(process.env.BASE_CHAIN_ID) || 84532;

// Transfers one on-chain item between two wallets, gas paid by the platform
// wallet (same pattern as marketplace sales). Requires the current owner to
// have approved the backend wallet to move that token — mints/sales already
// require this same one-time approval when an item is first listed.
async function transferTradeItem(subCollectionId, tokenId, fromWallet, toWallet) {
  const { nftContract } = getBlockchain(ACTIVE_CHAIN_ID);

  const onChainOwner = await nftContract.ownerOf(tokenId);
  if (onChainOwner.toLowerCase() !== fromWallet.toLowerCase()) {
    throw new Error(`Token ${tokenId} is not currently owned by ${fromWallet} on-chain`);
  }

  const backendWallet = await getBlockchain(ACTIVE_CHAIN_ID).wallet.getAddress();
  const approved = await nftContract.isApprovedForAll(fromWallet, backendWallet);
  const singleApproved = await nftContract.getApproved(tokenId);
  if (!approved && singleApproved.toLowerCase() !== backendWallet.toLowerCase()) {
    throw new Error(`${fromWallet} has not approved the marketplace to move token ${tokenId} yet`);
  }

  const tx = await nftContract.transferFrom(fromWallet, toWallet, tokenId);
  await tx.wait();

  const parent = await NFTSystem.findOne({ "subCollections._id": subCollectionId });
  const sub = parent?.subCollections?.id(subCollectionId);
  if (sub) {
    sub.owner = toWallet.toLowerCase();
    await parent.save();
  }

  return tx.hash;
}

const CAT_ALIAS_TRADE = {
  "military badges and collectables": "military badges",
  "vehicles": "racing vehicles",
  "land/bases": "land and bases",
};
const VALID_CATS_TRADE = ["skins","military badges","specialists","weapons","body armour","spaceships","racing vehicles","artwork","land and bases","general"];
import {
  getTier,
  calculateQuestSplit,
  todayKey,
  VALID_WAIT_HOURS,
  QUEST_TYPES,
  MAX_DAILY_QUEST_ACCEPTS,
} from "../utils/questUtils.js";

// Save trade image locally under /uploads/trades/
async function saveTradeImage(file) {
  if (!file) return "";
  const tradesDir = path.join(process.cwd(), "uploads", "trades");
  if (!fs.existsSync(tradesDir)) fs.mkdirSync(tradesDir, { recursive: true });
  const dest = path.join(tradesDir, file.filename);
  fs.renameSync(file.path, dest);
  return `/uploads/trades/${file.filename}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function expireTrades() {
  await Trade.updateMany(
    { status: "open", expiresAt: { $lt: new Date() } },
    { status: "expired", cleanupAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  );
}

/**
 * Count how many quests a wallet has accepted today.
 */
async function countTodayAccepts(wallet) {
  const key = todayKey();
  return Trade.countDocuments({
    type: "quest",
    acceptedByWallet: new RegExp(`^${wallet}$`, "i"),
    dailyQuestDate: key,
  });
}

// ── GET /api/v1/trade ─────────────────────────────────────────────────────────
export async function getTrades(req, res) {
  try {
    await expireTrades();
    const { type, status = "open", category, posterWallet, acceptedByWallet, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type && ["trade", "quest"].includes(type)) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, "i");
    if (posterWallet) filter.posterWallet = new RegExp(`^${posterWallet}$`, "i");
    if (acceptedByWallet) filter.acceptedByWallet = new RegExp(`^${acceptedByWallet}$`, "i");

    const skip = (Number(page) - 1) * Number(limit);
    const [trades, total] = await Promise.all([
      Trade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate("poster", "Nickname FullName"),
      Trade.countDocuments(filter),
    ]);

    const tradesWithNickname = trades.map((t) => {
      const obj = t.toObject();
      const poster = obj.poster;
      if (poster) {
        const displayName = poster.Nickname || poster.FullName;
        if (displayName) obj.posterName = displayName;
      }
      obj.poster = poster?._id ?? poster;
      return obj;
    });

    res.json({ trades: tradesWithNickname, total, page: Number(page), pages: Math.ceil(total / limit) });
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

// ── GET /api/v1/trade/stats/daily?wallet=0x... ───────────────────────────────
// Returns daily quest accept stats for a wallet (used by frontend to show limit)
export async function getQuestStats(req, res) {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: "wallet query param required" });

    const acceptedToday = await countTodayAccepts(wallet);
    const remaining = Math.max(0, MAX_DAILY_QUEST_ACCEPTS - acceptedToday);

    res.json({
      wallet,
      date: todayKey(),
      acceptedToday,
      dailyLimit: MAX_DAILY_QUEST_ACCEPTS,
      remaining,
      limitReached: remaining === 0,
    });
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
      reward, category,
      imageUrl,

      // Quest-specific fields
      questType,      // "money" | "resources"
      waitHours,      // 4 | 12 | 24
      salePrice,      // base sale price for split calculation
      pickupPlanet,   // in-game planet (optional, synced later)
      dropOffPlanet,  // in-game planet (optional, synced later)
      linkedListingId,// MarketListing that triggered this quest

      // Structured item references — set these to make the trade an actual
      // on-chain item swap instead of a plain text/HB listing.
      offeringSubCollectionId,
      offeringTokenId,
      requestingSubCollectionId,
      requestingTokenId,
    } = req.body;

    if (!type || !["trade", "quest"].includes(type)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "type must be 'trade' or 'quest'" });
    }
    if (!title || !posterWallet) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "title and posterWallet required" });
    }
    if (type === "quest" && (reward == null || Number(reward) <= 0)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Quest requires a positive reward amount" });
    }
    if (type === "trade" && !offering) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Trade requires an offering field" });
    }



    // ── Quest commission split validation ───────────────────────────────────
    let tierData = null;
    let splitAmounts = null;

    if (type === "quest" && questType && waitHours) {
      if (!QUEST_TYPES.includes(questType)) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: `questType must be one of: ${QUEST_TYPES.join(", ")}` });
      }
      if (!VALID_WAIT_HOURS.includes(Number(waitHours))) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: "waitHours must be 4, 12, or 24" });
      }

      tierData = getTier(questType, Number(waitHours));

      if (salePrice && Number(salePrice) > 0) {
        splitAmounts = calculateQuestSplit(Number(salePrice), questType, Number(waitHours));
      }
    }

    const resolvedImage = req.file ? await saveTradeImage(req.file) : (imageUrl || "");
    const hbOffered = Number(offeringHB) || 0;

    const tradeDoc = {
      type,
      poster: userId,
      posterWallet,
      posterName: posterName || req.user?.Nickname || req.user?.FullName || "Anonymous",
      title,
      description,
      offering,
      requesting: requesting || "Make me an offer",
      offeringHB:   hbOffered,
      requestingHB: Number(requestingHB) || 0,
      reward:       type === "quest" ? Number(reward) : 0,
      image: resolvedImage,
      category,
    };

    if (offeringSubCollectionId && offeringTokenId != null) {
      tradeDoc.offeringSubCollectionId = offeringSubCollectionId;
      tradeDoc.offeringTokenId = Number(offeringTokenId);
    }
    if (requestingSubCollectionId && requestingTokenId != null) {
      tradeDoc.requestingSubCollectionId = requestingSubCollectionId;
      tradeDoc.requestingTokenId = Number(requestingTokenId);
    }

    // Attach quest-specific fields if present
    if (type === "quest") {
      if (pickupPlanet)   tradeDoc.pickupPlanet   = pickupPlanet;
      if (dropOffPlanet)  tradeDoc.dropOffPlanet  = dropOffPlanet;
      if (linkedListingId) tradeDoc.linkedListingId = linkedListingId;

      if (tierData) {
        tradeDoc.questType            = questType;
        tradeDoc.waitHours            = Number(waitHours);
        tradeDoc.buyerSavePercent     = tierData.buyerSavePercent;
        tradeDoc.playerSharePercent   = tierData.playerSharePercent;
        tradeDoc.platformSharePercent = tierData.platformSharePercent;
      }

      if (splitAmounts) {
        tradeDoc.salePrice           = Number(salePrice);
        tradeDoc.buyerSavesAmount    = splitAmounts.buyerSaves;
        tradeDoc.playerEarnsAmount   = splitAmounts.playerEarns;
        tradeDoc.platformEarnsAmount = splitAmounts.platformEarns;
      }
    }

    const trade = await Trade.create(tradeDoc);

    // Sync to MarketListing so the Listings tab shows this trade
    if (type === "trade") {
      const rawCat = (category || "general").toLowerCase().trim();
      const normCat = CAT_ALIAS_TRADE[rawCat] || (VALID_CATS_TRADE.includes(rawCat) ? rawCat : "general");
      const { nftSystemId, subCollectionId } = req.body;
      MarketListing.create({
        userId,
        userName: posterName || "Anonymous",
        userWallet: posterWallet,
        category: normCat,
        activityType: "trading",
        itemName: offering || title,
        itemDescription: description || "",
        itemImage: resolvedImage || "",
        nftSystemId:     nftSystemId     ? String(nftSystemId)     : null,
        subCollectionId: subCollectionId ? String(subCollectionId) : null,
        status: "active",
      }).catch((e) => console.error("MarketListing trade sync:", e.message));
    }

    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/trade/:id/accept (auth required) ────────────────────────────
export async function acceptTrade(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      acceptedByWallet,
      // Only used for open item requests (poster didn't lock a specific
      // target item) — the item the accepter is offering in return.
      offeredSubCollectionId,
      offeredTokenId,
    } = req.body;
    if (!acceptedByWallet) return res.status(400).json({ error: "acceptedByWallet required" });

    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: "Trade/Quest not found" });
    if (trade.status !== "open") return res.status(400).json({ error: "This listing is no longer open" });
    if (String(trade.poster) === String(userId)) {
      return res.status(400).json({ error: "Cannot accept your own listing" });
    }

    // ── Open item request: poster didn't lock a specific target item, the
    // accepter is now committing one of their own. Locked requests (already
    // has requestingTokenId) ignore this — the target was fixed at creation.
    if (trade.type === "trade" && trade.requestingTokenId == null && offeredSubCollectionId && offeredTokenId != null) {
      const parent = await NFTSystem.findOne({ "subCollections._id": offeredSubCollectionId });
      const sub = parent?.subCollections?.id(offeredSubCollectionId);
      if (!sub || (sub.owner || "").toLowerCase() !== acceptedByWallet.toLowerCase()) {
        return res.status(400).json({ error: "You don't own the item you're offering" });
      }
      trade.requestingSubCollectionId = offeredSubCollectionId;
      trade.requestingTokenId = Number(offeredTokenId);
    }

    // ── Daily quest accept limit (quests only) ──────────────────────────────
    if (trade.type === "quest") {
      const acceptedToday = await countTodayAccepts(acceptedByWallet);
      if (acceptedToday >= MAX_DAILY_QUEST_ACCEPTS) {
        return res.status(429).json({
          error: `Daily quest limit reached. You can accept up to ${MAX_DAILY_QUEST_ACCEPTS} quests per day.`,
          acceptedToday,
          dailyLimit: MAX_DAILY_QUEST_ACCEPTS,
          resetsAt: "midnight UTC",
        });
      }
    }

    trade.acceptedBy        = userId;
    trade.acceptedByWallet  = acceptedByWallet;
    trade.acceptedAt        = new Date();
    trade.status            = "accepted";

    // Tag with today's date for daily limit tracking
    if (trade.type === "quest") {
      trade.dailyQuestDate = todayKey();
    }

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

    const hbErrors = [];

    // ── Item transfer (regular trades only) — do this first and fail loudly
    // if it doesn't work, before any HB changes hands. Not run for quests:
    // quests never carry item references.
    const itemTransfers = [];
    if (trade.type === "trade") {
      if (trade.offeringTokenId != null && trade.offeringSubCollectionId) {
        const hash = await transferTradeItem(
          trade.offeringSubCollectionId,
          trade.offeringTokenId,
          trade.posterWallet,
          trade.acceptedByWallet
        );
        itemTransfers.push({ tokenId: trade.offeringTokenId, from: "poster", txHash: hash });
      }
      if (trade.requestingTokenId != null && trade.requestingSubCollectionId) {
        const hash = await transferTradeItem(
          trade.requestingSubCollectionId,
          trade.requestingTokenId,
          trade.acceptedByWallet,
          trade.posterWallet
        );
        itemTransfers.push({ tokenId: trade.requestingTokenId, from: "accepter", txHash: hash });
      }
    }

    // ── Quest completion: distribute via commission split ───────────────────
    if (trade.type === "quest" && trade.questType && trade.waitHours) {
      // Recalculate split if salePrice is present (use stored amounts if already set)
      let playerEarns = trade.playerEarnsAmount;

      if (!playerEarns && trade.salePrice && trade.playerSharePercent) {
        playerEarns = +(trade.salePrice * trade.playerSharePercent / 100).toFixed(4);
      }

      // Also use reward field as fallback (legacy quests without split config)
      if (!playerEarns) playerEarns = trade.reward || 0;

      if (playerEarns > 0 && acceptedById) {
        try {
          const acceptor = await User.findById(acceptedById);
          if (acceptor) {
            acceptor.hyperBucks = (acceptor.hyperBucks || 0) + playerEarns;
            await acceptor.save();
            await HBLedger.create({
              userId:       acceptedById,
              type:         "earn",
              amount:       playerEarns,
              balanceAfter: acceptor.hyperBucks,
              description:  `Quest reward (${trade.waitHours}h tier, ${trade.playerSharePercent ?? "?"}% share): "${trade.title}"`,
              reference:    String(trade._id),
            });
          }
        } catch (hbErr) {
          hbErrors.push(`Quest player reward error: ${hbErr.message}`);
        }
      }

      trade.completedAt = new Date();

      // Persist final amounts if not already set
      if (trade.salePrice && !trade.playerEarnsAmount) {
        const split = calculateQuestSplit(trade.salePrice, trade.questType, trade.waitHours);
        trade.buyerSavesAmount    = split.buyerSaves;
        trade.playerEarnsAmount   = split.playerEarns;
        trade.platformEarnsAmount = split.platformEarns;
      }

    } else {
      // ── Regular trade: HB settlement (existing logic) ─────────────────────
      if (trade.offeringHB > 0 && acceptedById) {
        try {
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
    }

    trade.status = "completed";
    await trade.save();

    const isQuest = trade.type === "quest" && trade.questType;
    res.json({
      message: "Trade completed",
      trade,
      ...(itemTransfers.length > 0 ? { itemTransfers } : {}),
      ...(isQuest
        ? {
            questSettlement: hbErrors.length > 0
              ? { status: "partial", errors: hbErrors }
              : {
                  status:          "ok",
                  questType:       trade.questType,
                  waitHours:       trade.waitHours,
                  buyerSaved:      trade.buyerSavesAmount,
                  playerEarned:    trade.playerEarnsAmount,
                  platformEarned:  trade.platformEarnsAmount,
                },
          }
        : {
            hbSettlement: hbErrors.length > 0
              ? { status: "partial", errors: hbErrors }
              : { status: "ok", offeringHBTransferred: trade.offeringHB, requestingHBTransferred: trade.requestingHB },
          }),
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
    // Remove the synced MarketListing that was created when this trade was posted
    if (trade.type === "trade") {
      await MarketListing.deleteMany({
        userId: trade.poster,
        activityType: "trading",
        itemName: trade.offering || trade.title,
        status: { $in: ["active", "pending"] },
      });
    }
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
