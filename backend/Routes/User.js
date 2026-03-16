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
  ExportWallet,
  RequestWalletOTP,
} from "../Controllers/User.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";
import { auth } from "../Middleware/userAuth.js";
import upload from "../Middleware/UploadMulter.js";
import express from "express";
const Route = express.Router();
// :memo: User signup
Route.post("/user/signup", SignupUser);
// :key: User login
Route.post("/user/login", LoginUser);
// :envelope_with_arrow: Forgot password (send reset email)
Route.post("/user/forgot-password", ForgotPassword);
// :lock: Reset password (verify token and update password)
Route.post("/user/reset-password/:token", ResetPassword);
// :globe_with_meridians: Google authentication
Route.post("/user/google", GoogleAuth);
// :speech_balloon: Discord authentication
Route.post("/user/discord", DiscordAuth);
// :blue_book: Meta / Facebook authentication
Route.post("/user/MetaMask", MetaMaskAuth);
// :bird: Twitter authentication
Route.post("/user/twitter", TwitterAuth);
// :bust_in_silhouette: Get user profile (protected route)
Route.get("/getProfile", auth, GetProfile);
Route.put("/edit/:userId", upload.single("Avatar"), EditUser);
Route.delete("/delete/:userId", DeleteUser);
// :pencil2: Edit user profile (update info or upload avatar)
Route.put("/profile", auth, upload.single("Avatar"), EditProfile);
// ✅ Step 1: Request OTP for wallet export (sends email)
Route.post("/user/request-wallet-otp", auth, RequestWalletOTP);
// ✅ Step 2: Export private key — requires ?otp=XXXXXX
Route.get("/user/export-wallet", auth, ExportWallet);
// ✅ Get all users (admin only)
Route.get("/users", GetAllUsers);
// ✅ Toggle user active/inactive status (admin only)
Route.patch("/user/status/:userId", ToggleUserStatus);

Route.get("/admin/:adminId", GetAdminByAdminId);


export { Route };