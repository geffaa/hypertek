import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define schema
const UserSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email"], // basic email validation
  },

  Password: {
    type: String,
    required: function () {
      return !this.GoogleId; // only require password if no GoogleId
    },
    minLength: [8, "Password should be at least 8 characters"],
    maxLength: [20, "Password max length should be 20 characters"],
  },

  GoogleId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  DiscordId: { type: String, unique: true, sparse: true },
});

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("Password") || !this.Password) return next(); // Only hash if password exists
  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
