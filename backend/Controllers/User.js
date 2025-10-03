import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const RESET_SECRET = process.env.RESET_SECRET || "resetsecretkey";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------ SMTP TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  service: "gmail", // you can use outlook, yahoo, custom SMTP
  auth: {
    user: "wahabnadeem311@gmail.com", // your email
    pass: "aceu vgyd azni ngoq", // your app password
  },
});

// ------------------ SIGNUP ------------------
const SignupUser = async (req, res) => {
  try {
    const { Email, Password, ConfirmPassword } = req.body;

    if (!Email || !Password || !ConfirmPassword) {
      return res.status(400).json({
        message: "Email, Password, and ConfirmPassword are required",
      });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const newUser = new UserModel({ Email, Password });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        Email: newUser.Email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ LOGIN ------------------
const LoginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const user = await UserModel.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, Email: user.Email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, Email: user.Email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ FORGOT PASSWORD ------------------
const ForgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) return res.status(400).json({ message: "Email is required" });
    const user = await UserModel.findOne({ Email });
    if (!user) return res.status(400).json({ message: "User not found" });
    // Generate reset token (15 minutes expiry)
    const resetToken = jwt.sign(
  { id: user._id, Email: user.Email },
  process.env.RESET_SECRET,  // <== must match
  { expiresIn: "15m" }
);
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    // Send email
    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_EMAIL}>`,
      to: Email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}"
           style="display:inline-block;
                  padding:10px 20px;
                  margin-top:10px;
                  font-size:16px;
                  color:#fff;
                  background-color:#007bff;
                  text-decoration:none;
                  border-radius:5px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ------------------ RESET PASSWORD ------------------
 const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { Password, ConfirmPassword } = req.body;
    console.log("RESET_SECRET:", RESET_SECRET);
    console.log("Request body:", req.body);
    // Validate input
    if (!Password || !ConfirmPassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password are required",
      });
    }
    if (Password !== ConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // Verify token
    let decoded;
    try {
     decoded = jwt.verify(token, process.env.RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    // Find user
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Update password
    user.Password = Password; // make sure pre-save hook hashes it
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const GoogleAuth = async (req, res) => {
  try {
    const { token } = req.body; // id_token from frontend
    console.log("your token in the backend :",token);
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify id token (checks signature + audience)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified, picture } = payload;

    if (!email || !email_verified) {
      return res.status(400).json({ message: "Google account email not verified" });
    }

    // Find or create user
    let user = await UserModel.findOne({ Email: email });
    if (user) {
      // if user exists but no GoogleId, attach it
      if (!user.GoogleId) {
        user.GoogleId = googleId;
        await user.save();
      }
    } else {
      user = new UserModel({
        Email: email,
        FullName: name || "",
        GoogleId: googleId,
        // Password left undefined for Google-only accounts
      });
      await user.save();
    }

    // Generate our app JWT (use your JWT_SECRET)
    const jwtToken = jwt.sign({ id: user._id, Email: user.Email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: { id: user._id, Email: user.Email, FullName: user.FullName, picture },
    });
  } catch (err) {
    console.error("GoogleAuth err:", err);
    return res.status(500).json({ message: "Google auth failed", error: err.message });
  }
};
const DiscordAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Authorization code is required" });

    // 1. Exchange code for access_token
    const params = new URLSearchParams();
    params.append("client_id", process.env.DISCORD_CLIENT_ID);
    params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ message: "Failed to exchange code", error: tokenData });
    }

    // 2. Fetch user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userResponse.json();
    if (!discordUser.id) {
      return res.status(400).json({ message: "Failed to fetch Discord user", error: discordUser });
    }

    const { id: discordId, username, discriminator, email } = discordUser;

    // 3. Find or create user
    let user = await UserModel.findOne({ DiscordId: discordId });

    if (!user) {
      user = new UserModel({
        DiscordId: discordId,
        FullName: `${username}#${discriminator}`,
        Email: email || null, // email optional
      });
      await user.save();
    }

    // 4. Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, DiscordId: discordId, Email: user.Email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Discord login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        DiscordId: user.DiscordId,
      },
    });
  } catch (err) {
    console.error("DiscordAuth error:", err);
    return res.status(500).json({ message: "Discord auth failed", error: err.message });
  }
};

export { SignupUser, LoginUser, ForgotPassword, ResetPassword, GoogleAuth, DiscordAuth };
