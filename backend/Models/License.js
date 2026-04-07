/**
 * License Model — NFC Creator License
 *
 * FEATURE STATUS: LOCKED — prepared for future game integration.
 * Players need a license to create NFCs (not needed for NFTs).
 *
 * Pricing (to be confirmed when game is ready):
 *   $2 per single license (1 species × 1 item type)
 *   $10 bundle = 7 licenses (all species × 1 item type)
 *
 * License is lifetime (one-time purchase, no expiry).
 * 7 species, each with DNA-coded items (pistol, rifle, crossbow, knife, sword, body armour, etc.)
 */

import mongoose from "mongoose";

const ITEM_TYPES = [
  "pistol", "rifle", "crossbow", "knife", "sword",
  "body_armour", "helmet", "shield", "grenade", "other",
];

const SPECIES_COUNT = 7; // 7 species total

const licenseSchema = new mongoose.Schema(
  {
    // Owner of this license
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which species this license covers (1–7)
    speciesId: {
      type: Number,
      min: 1,
      max: SPECIES_COUNT,
      required: true,
    },

    // What item type this license allows creating
    itemType: {
      type: String,
      enum: ITEM_TYPES,
      required: true,
    },

    // Purchase price paid (USD)
    pricePaid: {
      type: Number,
      required: true,
    },

    // Whether this was part of a bundle purchase
    isBundlePurchase: {
      type: Boolean,
      default: false,
    },

    // Stripe payment reference
    paymentIntentId: {
      type: String,
      default: null,
    },

    // Lifetime license — no expiry
    isLifetime: {
      type: Boolean,
      default: true,
    },

    // LOCKED: license feature is not yet active — set to true when game is ready
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate license for same user + species + item type
licenseSchema.index({ userId: 1, speciesId: 1, itemType: 1 }, { unique: true });

export { ITEM_TYPES, SPECIES_COUNT };
export default mongoose.model("License", licenseSchema);
