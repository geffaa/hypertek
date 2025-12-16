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
Route.get("/getProfile", authMiddleware, GetProfile);
Route.put("/edit/:userId", upload.single("Avatar"), EditUser);
Route.delete("/delete/:userId", DeleteUser);
// :pencil2: Edit user profile (update info or upload avatar)
Route.put("/profile", authMiddleware, upload.single("Avatar"), EditProfile);
// :white_check_mark: Get all users (admin only)
Route.get("/users", GetAllUsers);
// :white_check_mark: NEW ROUTE: Toggle user active/inactive status (admin only)
Route.patch("/user/status/:userId",  ToggleUserStatus);
Route.get(
  "/admin/:adminId", // only admin can access
  GetAdminByAdminId
);
export { Route };