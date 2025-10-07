import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email"], // basic email validation
  },

  password: {
    type: String,
    required: function () {
      // only require password if user is NOT using Google or Discord login
      return !this.googleId && !this.discordId;
    },
    minLength: [8, "Password should be at least 8 characters"],
    default: null, // explicit for OAuth users
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple nulls
    default: null,
  },

  discordId: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },
});

// 🔒 Hash password before saving
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
