import mongoose from "mongoose";
import bcrypt from "bcrypt";
// user schema
const UserSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
  },

  Password: {
    type: String,
    required: function () {
      return !this.GoogleId; // only require password if no GoogleId
    },
    minlength: [8, "Password should be at least 8 characters"],
    // ❌ removed maxLength — hash always ~60 chars
  },

  GoogleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  DiscordId: { type: String, unique: true, sparse: true },

  Avatar: {
    type: String, // will store image URL or filename
    default: "", // fallback if no image
  },
});

// ✅ Pre-save middleware to hash password safely
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("Password") || !this.Password) return next();
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
