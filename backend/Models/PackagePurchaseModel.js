import mongoose from "mongoose";

/**
 * One attempt to buy a package.
 *
 * The row is created BEFORE the buyer sends any funds, so an inbound USDC transfer
 * always has a home. Payment is recorded before any NFT moves, never after — so if
 * something breaks mid-delivery we always know money came in and exactly which items
 * did and did not reach the buyer.
 *
 * Delivery is one `finalizeNFAPurchase` call per item, and that function manages
 * nonces manually, so the loop MUST run sequentially and under the `lockedAt` mutex.
 * Two concurrent runs would collide on nonce and lose transactions.
 */

const purchaseItemSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem", required: true },
    subCollectionId: { type: String, required: true },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    assetType: { type: String, default: "NFT" },

    // Frozen at intent time, copied from the package.
    allocatedPriceUSD: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "processing", "fulfilled", "failed"],
      default: "pending",
    },

    tokenId: { type: Number, default: null },
    txHash: { type: String, default: "" }, // mint/transfer hash for this item

    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    errorCode: { type: String, default: "" }, // e.g. BELOW_RESERVE
    errorMessage: { type: String, default: "" },
    fulfilledAt: { type: Date, default: null },
  },
  { _id: false },
);

// A reward pack's one minted item, tracked the same way a bundle item's
// delivery is tracked above — but there is no pre-existing subCollectionId
// until the mint actually happens, so this fills in only on fulfilment.
const rewardFulfillmentSchema = new mongoose.Schema(
  {
    assetType: { type: String, default: "NFT" },
    name: { type: String, default: "" },
    gmbbTargetUSD: { type: Number, default: 0 },
    gmbbAmount: { type: Number, default: null }, // actual amount funded, set on fulfilment
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem", default: null },
    subCollectionId: { type: String, default: null },
    tokenId: { type: Number, default: null },
    txHash: { type: String, default: "" },
    status: { type: String, enum: ["pending", "fulfilled", "failed"], default: "pending" },
    errorMessage: { type: String, default: "" },
  },
  { _id: false },
);

const packagePurchaseSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    packageName: { type: String, default: "" },
    packageType: { type: String, enum: ["bundle", "reward"], default: "bundle" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Checkout acknowledgement the buyer ticked (see Config/purchaseAcknowledgement.js).
    acknowledgement: { version: String, acceptedAt: Date },
    buyerWallet: { type: String, required: true, lowercase: true, trim: true },

    items: { type: [purchaseItemSchema], default: [] }, // bundle packages
    resourceRewards: { type: [{ resource: String, amount: Number }], default: [] }, // reward packages, snapshot only
    rewardFulfillment: { type: rewardFulfillmentSchema, default: null }, // reward packages

    priceUSD: { type: Number, required: true }, // frozen at intent time
    paymentMethod: { type: String, enum: ["usdc", "stripe"], default: "usdc" },

    // null, NOT "" — the unique index below is partial on string type, and empty
    // strings would make every unpaid intent collide with every other one.
    paymentTxHash: { type: String, default: null },
    paymentIntentId: { type: String, default: null }, // reserved for the later Stripe path
    paidAmountUSDC: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
    chainId: { type: Number, default: 8453 },

    status: {
      type: String,
      enum: [
        "pending_payment",      // intent created, waiting for the buyer's transfer
        "expired",              // reservation ran out
        "cancelled",            // buyer backed out
        "payment_verified",     // USDC confirmed on-chain, delivery not started
        "fulfilling",           // delivery loop running (holds lockedAt)
        "fulfilled",            // every item delivered
        "partially_fulfilled",  // some delivered, some failed — retryable
        "failed",               // nothing delivered — retryable
        "refund_required",      // gave up after repeated retries
        "refunded",             // admin sent the money back
      ],
      default: "pending_payment",
    },

    reservationExpiresAt: { type: Date, default: null },
    fulfillmentStartedAt: { type: Date, default: null },
    fulfillmentCompletedAt: { type: Date, default: null },

    // Fulfilment mutex. Held for at most 5 minutes so a crashed run can be resumed.
    lockedAt: { type: Date, default: null },

    // Standing, queryable liability: the value of everything paid for but not delivered.
    refundOwedUSD: { type: Number, default: 0 },
    refundTxHash: { type: String, default: "" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

// Idempotency backstop: one payment transaction can only ever fulfil one purchase.
// Partial on $type string so the null default doesn't collide across open intents.
packagePurchaseSchema.index(
  { paymentTxHash: 1 },
  { unique: true, partialFilterExpression: { paymentTxHash: { $type: "string" } } },
);
packagePurchaseSchema.index({ status: 1, createdAt: -1 });
packagePurchaseSchema.index({ userId: 1, createdAt: -1 });
packagePurchaseSchema.index({ packageId: 1 });

// No TTL index on reservationExpiresAt on purpose: expiry has to release the
// package's reservedCount, which a TTL delete cannot do. The sweeper handles it.

const PackagePurchase =
  mongoose.models.PackagePurchase || mongoose.model("PackagePurchase", packagePurchaseSchema);
export default PackagePurchase;
