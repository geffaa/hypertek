import { 
  SignupUser, 
  LoginUser, 
  ForgotPassword, 
  ResetPassword,
  GoogleAuth 
} from "../Controllers/User.js";
import {authMiddleware } from "../Middleware/googleMiddle.js"

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

export { Route };
