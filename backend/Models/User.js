import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      // ✅ Remove required and make it conditional
      required: function () {
        return !(this.GoogleId || this.DiscordId || this.MetaMaskAddress);
      },
      unique: true,
      sparse: true, // ✅ Add sparse for unique constraint
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },

    FullName: {
      type: String,
      default: "",
    },
    Role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    Password: {
      type: String,
      minlength: [8, "Password should be at least 8 characters"],
      default: undefined, // ✅ Explicitly set default to undefined
    },

    Bio: {
      type: String,
      default: "",
    },

    // Social Login Fields
    GoogleId: {
      type: String,
      // unique: true,
      sparse: true,
    },

    DiscordId: {
      type: String,
      // unique: true,
      sparse: true,
    },

    TwitterId: {
      type: String,
      // unique: true,
      sparse: true,
    },

    FacebookId: {
      type: String,
      // unique: true,
      sparse: true,
    },

    // ✅ Add MetaMask specific field
    MetaMaskAddress: {
      type: String,
      // unique: true,
      sparse: true,
      lowercase: true,
    },

    // ✅ Built-in Wallet Fields for Email/Social Users
    WalletAddress: {
      type: String,
      sparse: true,
      lowercase: true,
    },

    EncryptedPrivateKey: {
      type: String,
    },

    Avatar: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Hyper Bucks — in-game currency (250 HB = $1 USD)
    hyperBucks: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Preferred payout method for sales proceeds + HB cashout
    preferredPayout: {
      type: String,
      enum: ["usdc", "balance", "bank", "hb"],
      default: "usdc",
    },

    // Bank details for fiat withdrawals (encrypted at rest via application layer)
    bankDetails: {
      accountHolderName: String,
      bankName:          String,
      accountNumber:     String,
      iban:              String,
      swift:             String,
      routingNumber:     String,
      country:           String,
      currency:          { type: String, default: "USD" },
      verified:          { type: Boolean, default: false },
    },

    // KYC — required before cashout
    kyc: {
      status:    { type: String, enum: ["not_started", "pending", "verified", "failed"], default: "not_started" },
      sessionId: { type: String, default: null },
      verifiedAt:{ type: Date,   default: null },
      failReason:{ type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Modified pre-save middleware - only hash if password exists
UserSchema.pre("save", function (next) {
  // If password already hashed by manual admin creation → skip
  if (!this.isModified("Password")) return next();

  // If password looks already hashed → skip hashing
  if (this.Password && this.Password.startsWith("$2b$")) {
    return next();
  }

  this.Password = bcrypt.hashSync(this.Password, 10);
  next();
});

// ✅ Method to compare passwords (only for password login)
UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.Password) {
    throw new Error("No password set for this account");
  }
  return await bcrypt.compare(enteredPassword, this.Password);
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
