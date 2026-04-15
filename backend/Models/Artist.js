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

    // Bank details (for fiat payout via Wise)
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
