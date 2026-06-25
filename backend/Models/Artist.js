import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    // How they receive their 4% royalty
    paymentPreference: {
      type: String,
      enum: ["crypto", "bank"],
      default: "crypto",
    },

    // Crypto wallet address (for on-chain USDC dispatch)
    walletAddress: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    // Bank details (used to attach an external bank account to the artist's
    // Stripe connected account for automatic fiat payout via Stripe Connect)
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      bankName:          { type: String, default: "" },
      accountNumber:     { type: String, default: "" },
      iban:              { type: String, default: "" },
      swift:             { type: String, default: "" },
      routingNumber:     { type: String, default: "" },
      country:           { type: String, default: "" },
      currency:          { type: String, default: "USD" },
      verified:          { type: Boolean, default: false },
    },

    // Stripe Connect — automatic bank payouts (mirrors the HyperBucks cash-out flow).
    // stripeConnectAccountId: the artist's connected account.
    // stripeExternalAccountId: their attached bank account on that connected account.
    stripeConnectAccountId:  { type: String, default: "" },
    stripeExternalAccountId: { type: String, default: "" },

    // Notes for admin (e.g. "hired for Season 1 skins")
    notes: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Artist = mongoose.models.Artist || mongoose.model("Artist", ArtistSchema);
export default Artist;
