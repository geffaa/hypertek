import { 
  SignupUser, 
  LoginUser, 
  ForgotPassword, 
  ResetPassword,
  GoogleAuth,
  DiscordAuth,
  GetProfile,
  EditProfile
} from "../Controllers/User.js";
import {authMiddleware } from "../Middleware/googleMiddle.js"
import upload from "../Middleware/UploadMulter.js"


import express from "express";

const Route = express.Router();

// Signup user 
Route.post("/user/signup", SignupUser);

// Login user 
Route.post("/user/login", LoginUser);

// Forgot password (send reset email)
Route.post("/user/forgot-password", ForgotPassword);

// Reset password (via token)
Route.post("/user/reset-password/:token", ResetPassword);

Route.post("/user/google", GoogleAuth);

Route.post("/user/discord", DiscordAuth);

Route.get("/getProfile", authMiddleware, GetProfile);
Route.put("/profile", authMiddleware, upload.single("Avatar"), EditProfile);
export { Route };
