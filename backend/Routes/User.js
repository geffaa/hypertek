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
  GetWalletAddress,
  FundGasWallet,
  GetPrivyToken,
  LinkWallet,
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
// Get wallet address only (no private key, no password needed)
Route.get("/user/wallet-address", auth, GetWalletAddress);
// Export private key — requires password in body
Route.post("/user/export-wallet", auth, ExportWallet);
// Auto-drip ETH for gas to email wallet (JWT only, rate-limited by balance threshold)
Route.post("/user/fund-gas", auth, FundGasWallet);
// Short-lived RS256 token for the embedded-wallet custom-auth handshake
Route.get("/user/privy-token", auth, GetPrivyToken);
// Persist the CDP embedded-wallet address (signature-verified, non-custodial accounts only)
Route.post("/user/link-wallet", auth, LinkWallet);
// Get all users (admin only)
Route.get("/users", GetAllUsers);
// Toggle user active/inactive status (admin only)
Route.patch("/user/status/:userId", ToggleUserStatus);

Route.get("/admin/:adminId", GetAdminByAdminId);


export { Route };