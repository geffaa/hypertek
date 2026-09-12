import mongoose from "mongoose";

/**
 * A Package bundles existing items (NFA/NFC/NFT) and sells them for one discounted price.
 *
 * It is a pricing wrapper, not a new sale primitive: on purchase we call the existing
 * `finalizeNFAPurchase` once per member item, each with its own frozen allocated price.
 * Nothing here touches the marketplace smart contract.
 *
 * Membership is deliberately NOT denormalised onto the item itself. The codebase already
 * carries three repair endpoints for `listed`-flag drift; a fourth flag would earn a
 * fourth repair endpoint. "Is this item in a package?" is answered by querying
 * `items.subCollectionId` on this collection, which is indexed below.
 */

const packageItemSchema = new mongoose.Schema(
  {
    // An item lives at (parentId, subCollectionId). subCollections are embedded
    // documents, so the child id is a String here, matching MarketListing.
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem", required: true },
    subCollectionId: { type: String, required: true },

    // ── Snapshot taken when the item was added. Display and audit only; never
    //    trusted for money decisions, which always re-read the live item.
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    assetType: { type: String, enum: ["NFA", "NFC", "NFT"], default: "NFT" },
    category: { type: String, default: "" },
    basePriceUSD: { type: Number, default: 0 }, // sub.priceETH at snapshot time
    floorUSD: { type: Number, default: 0 },     // sub.minimumBuybackUSD at snapshot time
    maxSupply: { type: Number, default: 1 },

    // ── FROZEN. This exact number is passed to finalizeNFAPurchase on fulfilment.
    //    Frozen rather than recomputed because floors move (CPI, resales) and a
    //    recomputed split would silently change what the buyer pays versus what
    //    they were shown. Drift is detected instead — see pricingValid below.
    allocatedPriceUSD: { type: Number, default: 0 },
  },
  { _id: false },
);

const pricingViolationSchema = new mongoose.Schema(
  {
    subCollectionId: { type: String, default: "" },
    itemName: { type: String, default: "" },
    allocatedPriceUSD: { type: Number, default: 0 },
    currentFloorUSD: { type: Number, default: 0 },
    shortfallUSD: { type: Number, default: 0 },
    detectedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Non-NFT rewards inside a reward pack (Hyper Bucks, in-game resources). No
// live inventory system exists for anything but HB yet, so anything other
// than "HB" here is recorded on the purchase for later fulfilment/reference
// rather than actually credited anywhere today — see packagePurchaseService.js.
const resourceRewardSchema = new mongoose.Schema(
  { resource: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false },
);

// A reward pack's one minted item (Don, 12 Sep 2026: "a package that has
// rewards and also has an NFA/NFC/NFT... we will mint them first"). Minted at
// purchase time, not before — see computeRewardPackSplit for the GMBB math.
const mintRewardSchema = new mongoose.Schema(
  {
    assetType: { type: String, enum: ["NFA", "NFC", "NFT"], default: "NFT" },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    gmbbTargetUSD: { type: Number, default: 0 }, // admin-set fixed GMBB figure for this item
  },
  { _id: false },
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: null, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    badge: { type: String, default: "" }, // "Starter Pack", "Best Value"

    // bundle — existing behaviour: N pre-existing items sold together at a discount.
    // reward — a loot-box style pack: resources + an optionally freshly-minted item.
    // Kept as one model rather than two, since both are "pay a price, receive
    // things", and duplicating status/pricing/scheduling fields would be the
    // real cost of splitting them.
    type: { type: String, enum: ["bundle", "reward"], default: "bundle" },

    items: { type: [packageItemSchema], default: [] }, // bundle only
    mintReward: { type: mintRewardSchema, default: null },   // reward only, optional
    resourceRewards: { type: [resourceRewardSchema], default: [] }, // reward only

    basePriceTotalUSD: { type: Number, default: 0 }, // Σ basePriceUSD — display only
    priceUSD: { type: Number, required: true },      // what the buyer pays
    discountPercent: { type: Number, default: 0 },   // derived, display only
    floorTotalUSD: { type: Number, default: 0 },     // minimum feasible price
    currency: { type: String, default: "USDC" },

    // draft      — being built, not public
    // active     — on sale
    // paused     — pulled by an admin, or auto-paused on floor drift
    // archived   — retired but kept for history
    // disabled_item_sold — a member item was sold or deleted elsewhere
    status: {
      type: String,
      enum: ["draft", "active", "paused", "archived", "disabled_item_sold"],
      default: "draft",
    },

    // Set false when a member item's live floor has risen above its frozen
    // allocated price. An invalid package cannot be sold.
    pricingValid: { type: Boolean, default: true },
    pricingViolations: { type: [pricingViolationSchema], default: [] },
    lastValidatedAt: { type: Date, default: null },

    // Stock is derived from the member items' remaining supply, not stored.
    // These two only guard against overselling in flight.
    soldCount: { type: Number, default: 0 },
    reservedCount: { type: Number, default: 0 },

    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

packageSchema.index({ status: 1, createdAt: -1 });
// The double-sell source of truth: "which package holds this item?"
packageSchema.index({ "items.subCollectionId": 1 });
// Partial so the many null slugs on drafts don't collide.
packageSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } },
);

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);
export default Package;
