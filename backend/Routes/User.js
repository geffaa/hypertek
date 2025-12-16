import {
  SignupUser,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  GoogleAuth,
  DiscordAuth,
  GetProfile,
  EditProfile,
  MetaMaskAuth,
  TwitterAuth,
  GetAllUsers,
  ToggleUserStatus, 
  EditUser,
  DeleteUser,
  GetAdminByAdminId,
} from "../Controllers/User.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";
import upload from "../Middleware/UploadMulter.js";
import express from "express";

const Route = express.Router();

// 📝 User signup
Route.post("/user/signup", SignupUser);

// 🔑 User login
Route.post("/user/login", LoginUser);

// 📩 Forgot password (send reset email)
Route.post("/user/forgot-password", ForgotPassword);

// 🔒 Reset password (verify token and update password)
Route.post("/user/reset-password/:token", ResetPassword);

// 🌐 Google authentication
Route.post("/user/google", GoogleAuth);

// 💬 Discord authentication
Route.post("/user/discord", DiscordAuth);

// 📘 Meta / Facebook authentication
Route.post("/user/MetaMask", MetaMaskAuth);

// 🐦 Twitter authentication
Route.post("/user/twitter", TwitterAuth);

// 👤 Get user profile (protected route)
Route.get("/getProfile", authMiddleware, GetProfile);


Route.put("/edit/:userId", upload.single("Avatar"), EditUser);


Route.delete("/delete/:userId", DeleteUser);

// ✏️ Edit user profile (update info or upload avatar)
Route.put("/profile", authMiddleware, upload.single("Avatar"), EditProfile);

// ✅ Get all users (admin only)
Route.get("/users", GetAllUsers);

// ✅ NEW ROUTE: Toggle user active/inactive status (admin only)
Route.patch("/user/status/:userId",  ToggleUserStatus);

Route.get(
  "/admin/:adminId", // only admin can access
  GetAdminByAdminId
);


export { Route };