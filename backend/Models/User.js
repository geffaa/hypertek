import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  Email: {
    type: String,
    // ✅ Remove required and make it conditional
    required: function() {
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

Password: {
  type: String,
  minlength: [8, "Password should be at least 8 characters"],
  default:undefined, // ✅ Explicitly set default to undefined
  
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
    sparse: true 
  },

  TwitterId: { 
    type: String, 
    // unique: true, 
    sparse: true 
  },

  FacebookId: { 
    type: String, 
    // unique: true, 
    sparse: true 
  },

  // ✅ Add MetaMask specific field
  MetaMaskAddress: {
    type: String,
    // unique: true,
    sparse: true,
    lowercase: true,
  },

 
 

  Avatar: {
    type: String,
    default: "",
  },
}, {
  timestamps: true
});

// ✅ Modified pre-save middleware - only hash if password exists
UserSchema.pre("save", async function (next) {
  try {
    if (this.Password && this.isModified("Password")) {
      const salt = await bcrypt.genSalt(10);
      this.Password = await bcrypt.hash(this.Password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
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