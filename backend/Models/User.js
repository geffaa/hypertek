import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: function () {
      // required only if NOT using wallet (MetaMask) or OAuth
      return !this.walletAddress && !this.googleId && !this.discordId;
    },
    default: "MetaMask User", // fallback for MetaMask users
  },

  email: {
  type: String,
  required: function () {
    // required only if NOT using wallet (MetaMask) or OAuth
    return !this.walletAddress && !this.googleId && !this.discordId;
  },
  unique: true,
  sparse: true, // <-- add sparse
  lowercase: true,
  match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
  default: null, // allow null for MetaMask users
},


  password: {
    type: String,
    required: function () {
      // only required if NOT using wallet (MetaMask) or OAuth
      return !this.walletAddress && !this.googleId && !this.discordId;
    },
    minLength: [8, "Password should be at least 8 characters"],
    default: null, // allow null for MetaMask users
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },

  discordId: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },

  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },

  avatar: {
    type: String,
    default: "",
  },
});

// 🔒 Hash password only if it exists
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
