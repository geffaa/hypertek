import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";
import { ethers } from "ethers";
import axios from "axios";
import { generateWallet, decryptPrivateKey } from "../utils/walletUtils.js";
import { welcomeEmailTemplate } from "../utils/emailTemplates.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const RESET_SECRET = process.env.RESET_SECRET || "resetsecretkey";

// ------------------ SMTP TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

// ------------------ OTP STORE (in-memory, 10 min expiry) ------------------
// Map key: userId string → { otp, expiresAt }
const walletOTPStore = new Map();

// ------------------ WELCOME EMAIL ------------------
const sendWelcomeEmail = async (email, name, walletAddress, encryptedPrivateKey) => {
  try {
    const privateKey = decryptPrivateKey(encryptedPrivateKey);
    const { subject, html } = welcomeEmailTemplate({ name, walletAddress, privateKey });
    await transporter.sendMail({
      from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error("Welcome email failed:", err.message);
  }
};

// ------------------ HELPER FUNCTION TO CHECK USER STATUS ------------------
const checkUserStatus = (user) => {
  if (user.isActive === false) {
    return {
      allowed: false,
      message: "Your account has been deactivated. Please contact support.",
    };
  }
  return { allowed: true };
};

// ------------------ SIGNUP ------------------
const SignupUser = async (req, res) => {
  try {
    const { Email, Password, ConfirmPassword } = req.body;

    if (!Email || !Password || !ConfirmPassword) {
      return res.status(400).json({
        message: "Please fill in all fields (Email, Password, Confirm Password).",
      });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ message: "The passwords you entered do not match. Please try again." });
    }

    const { address, encryptedPrivateKey } = generateWallet();

    const newUser = new UserModel({
      Email,
      Password,
      isActive: true, // ✅ New users are active by default
      WalletAddress: address,
      EncryptedPrivateKey: encryptedPrivateKey,
    });
    await newUser.save();
    sendWelcomeEmail(newUser.Email, newUser.FullName || "", address, encryptedPrivateKey);

    const token = jwt.sign(
      {
        id: newUser._id,
        Email: newUser.Email,
        role: newUser.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        Email: newUser.Email,
        Role: newUser.Role,
        isActive: newUser.isActive,
        WalletAddress: newUser.WalletAddress
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This email address is already registered. Please login instead." });
    }
    res.status(500).json({ message: "An unexpected error occurred during signup. Please try again later.", error: error.message });
  }
};

// ------------------ LOGIN ------------------
const LoginUser = async (req, res) => {
  console.log("your login user body :", req.body);
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required to log in." });
    }

    const user = await UserModel.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email address. Please sign up first." });
    }

    // ✅ CHECK IF USER IS ACTIVE
    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: statusCheck.message,
      });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password. Please check and try again." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        Email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        Email: user.Email,
        Role: user.Role,
        isActive: user.isActive,
        WalletAddress: user.WalletAddress
      },
    });
  } catch (err) {
    res.status(500).json({ message: "An unexpected server error occurred during login. Please try again later.", error: err.message });
  }
};

// ------------------ FORGOT PASSWORD ------------------
const ForgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findOne({ Email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // ✅ CHECK IF USER IS ACTIVE
    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: statusCheck.message,
      });
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
        Email: user.Email,
        role: user.Role,
      },
      process.env.RESET_SECRET,
      { expiresIn: "3h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_EMAIL}>`,
      to: Email,
      subject: "Password Reset Request",
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>🔒 Password Reset Request</h2>
      <p>We received a request to reset your password. Click the button below to securely reset it:</p>
      <a href="${resetLink}" style="
        display: inline-block;
        padding: 10px 20px;
        margin: 10px 0;
        font-size: 16px;
        color: white;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
      ">Reset My Password</a>
      <p>This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
      <p>Need help? Contact our support team at <a href="mailto:support@innervoice.com">support@innervoice.com</a></p>
      <p>© ${new Date().getFullYear()} Inner Voice. All rights reserved.</p>
    </div>
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

    if (!Password || !ConfirmPassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password are required",
      });
    }

    if (Password !== ConfirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ CHECK IF USER IS ACTIVE
    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: statusCheck.message,
      });
    }

    user.Password = Password;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ GoogleAuth ------------------
const GoogleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Access token is required" });

    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = googleRes.data;

    if (!email || !email_verified) {
      return res
        .status(400)
        .json({ message: "Google account email not verified" });
    }

    let user = await UserModel.findOne({ Email: email });

    if (user) {
      // ✅ CHECK IF USER IS ACTIVE
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: statusCheck.message,
        });
      }

      if (!user.GoogleId) {
        user.GoogleId = googleId;
        await user.save();
      }
    } else {
      const { address, encryptedPrivateKey } = generateWallet();

      user = new UserModel({
        Email: email,
        FullName: name || "",
        GoogleId: googleId,
        isActive: true, // ✅ New users active by default
        WalletAddress: address,
        EncryptedPrivateKey: encryptedPrivateKey,
      });
      await user.save();
      sendWelcomeEmail(email, name || "", address, encryptedPrivateKey);
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        Email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        picture,
        Role: user.Role, // ✅ ADD THIS
        isActive: user.isActive,
        WalletAddress: user.WalletAddress
      },
    });
  } catch (err) {
    console.error("GoogleAuth error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Google auth failed",
      error: err.response?.data || err.message,
    });
  }
};

// ------------------ Discord ------------------
const DiscordAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

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
      return res.status(400).json({
        success: false,
        message: "Failed to exchange authorization code",
        error: tokenData,
      });
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userResponse.json();

    if (!discordUser.id) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch Discord user information",
      });
    }

    const {
      id: discordId,
      username,
      discriminator,
      email,
      global_name,
    } = discordUser;

    let user = await UserModel.findOne({ DiscordId: discordId });

    if (!user && email) {
      user = await UserModel.findOne({ Email: email.toLowerCase() });
      if (user) {
        // ✅ CHECK IF USER IS ACTIVE
        const statusCheck = checkUserStatus(user);
        if (!statusCheck.allowed) {
          return res.status(403).json({
            success: false,
            message: statusCheck.message,
          });
        }

        user.DiscordId = discordId;
        await user.save();
      }
    }

    if (!user) {
      const fullName =
        global_name ||
        `${username}${discriminator && discriminator !== "0" ? `#${discriminator}` : ""
        }`;

      const { address, encryptedPrivateKey } = generateWallet();

      const discordEmail = email ? email.toLowerCase() : `${username}@discord.user`;
      user = new UserModel({
        DiscordId: discordId,
        Email: discordEmail,
        FullName: fullName,
        Password: null,
        isActive: true, // ✅ New users active by default
        WalletAddress: address,
        EncryptedPrivateKey: encryptedPrivateKey,
      });
      await user.save();
      if (email) sendWelcomeEmail(email.toLowerCase(), fullName, address, encryptedPrivateKey);
    } else {
      // ✅ CHECK IF EXISTING USER IS ACTIVE
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: statusCheck.message,
        });
      }
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        DiscordId: discordId,
        Email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      success: true,
      message: "Discord login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        DiscordId: user.DiscordId,
        Role: user.Role, // ✅ MUST
        isActive: user.isActive,
        WalletAddress: user.WalletAddress
      },
    });
  } catch (err) {
    console.error("DiscordAuth error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during Discord authentication",
    });
  }
};

// ------------------ GET USER FOR ADMIN ------------------
const GetAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-Password");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ------------------ PROFILE ------------------
const GetProfile = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ FIX HERE

    const user = await UserModel.findById(userId).select("-Password");
    // console.log("Fetched user profile:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: statusCheck.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------ EDIT PROFILE ------------------
const EditProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { FullName, Email, Password, NewPassword, Bio } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ CHECK IF USER IS ACTIVE
    const statusCheck = checkUserStatus(user);
    if (!statusCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: statusCheck.message,
      });
    }

    if (Password && NewPassword) {
      const isMatch = await bcrypt.compare(Password, user.Password);
      if (!isMatch)
        return res.status(400).json({ message: "Incorrect current password" });
      user.Password = NewPassword;
    }

    if (FullName) user.FullName = FullName;
    if (Email) user.Email = Email;
    if (Bio) user.Bio = Bio;

    if (req.file) {
      const avatarUrl = `/uploads/temp/${req.file.filename}`;
      user.Avatar = avatarUrl;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        Avatar: user.Avatar,
        Bio: user.Bio,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ METAMask ------------------
const MetaAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        message: "Failed to get Facebook access token",
        error: tokenData,
      });
    }

    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    );

    const fbUser = await userResponse.json();

    if (!fbUser.id) {
      return res
        .status(400)
        .json({ message: "Failed to fetch Facebook user information" });
    }

    const { id: facebookId, email, name, picture } = fbUser;

    let user = await UserModel.findOne({ FacebookId: facebookId });

    if (!user && email) {
      user = await UserModel.findOne({ Email: email.toLowerCase() });
      if (user) {
        // ✅ CHECK IF USER IS ACTIVE
        const statusCheck = checkUserStatus(user);
        if (!statusCheck.allowed) {
          return res.status(403).json({
            success: false,
            message: statusCheck.message,
          });
        }

        user.FacebookId = facebookId;
        await user.save();
      }
    }

    if (!user) {
      user = new UserModel({
        FacebookId: facebookId,
        Email: email ? email.toLowerCase() : `${facebookId}@facebook.user`,
        FullName: name || "Facebook User",
        Avatar: picture?.data?.url || "",
        isActive: true, // ✅ New users active by default
      });
      await user.save();
    } else {
      // ✅ CHECK IF EXISTING USER IS ACTIVE
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: statusCheck.message,
        });
      }
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        FacebookId: facebookId,
        Email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "Facebook login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        Avatar: user.Avatar,
        Role: user.Role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("MetaAuth error:", err);
    res.status(500).json({
      message: "Internal server error during Facebook login",
      error: err.message,
    });
  }
};

const MetaMaskAuth = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: "Address, signature, and message are required",
      });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature" });
    }

    const normalizedAddress = address.toLowerCase();

    let user = await UserModel.findOne({
      $or: [{ DiscordId: normalizedAddress }],
    });

    if (user) {
      // ✅ CHECK IF USER IS ACTIVE
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: statusCheck.message,
        });
      }

      user.DiscordId = normalizedAddress;
      await user.save();
    }

    if (!user) {
      user = new UserModel({
        DiscordId: normalizedAddress,
        Avatar: "",
        lastLogin: new Date(),
        loginCount: 1,
        isActive: true, // ✅ New users active by default
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        WalletAddress: normalizedAddress,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      success: true,
      message: "MetaMask login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        WalletAddress: user.WalletAddress,
        Avatar: user.Avatar,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        Role: user.Role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("MetaMaskAuth error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Wallet address already exists with different account",
      });
    }

    res.status(500).json({
      success: false,
      message: "MetaMask auth failed",
      error: err.message,
    });
  }
};

// ------------------ TWITTER AUTH ------------------
const TwitterAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    const tokenResponse = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
            ).toString("base64"),
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_REDIRECT_URI,
          code_verifier: "challenge",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        message: "Failed to get Twitter access token",
        error: tokenData,
      });
    }

    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const twitterUser = await userResponse.json();
    const userData = twitterUser.data;

    if (!userData || !userData.id) {
      return res
        .status(400)
        .json({ message: "Failed to fetch Twitter user information" });
    }

    const { id: twitterId, name, username } = userData;

    let user = await UserModel.findOne({ TwitterId: twitterId });

    if (!user) {
      const { address, encryptedPrivateKey } = generateWallet();
      user = new UserModel({
        TwitterId: twitterId,
        FullName: name || username,
        Email: `${username}@twitter.user`,
        isActive: true,
        WalletAddress: address,
        EncryptedPrivateKey: encryptedPrivateKey,
      });
      await user.save();
    } else {
      // ✅ CHECK IF EXISTING USER IS ACTIVE
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.allowed) {
        return res.status(403).json({
          success: false,
          message: statusCheck.message,
        });
      }
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        TwitterId: twitterId,
        Email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "Twitter login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        isActive: user.isActive,
        Role: user.Role,
        WalletAddress: user.WalletAddress,
      },
    });
  } catch (err) {
    console.error("TwitterAuth error:", err);
    res.status(500).json({
      message: "Internal server error during Twitter login",
      error: err.message,
    });
  }
};

// ✅ Toggle User Active/Inactive Status (Admin Only)
const ToggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ NEW API: Edit User (Admin Only)
const EditUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let { FullName, Email, Password, Role, Bio, isActive } = req.body;

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (FullName !== undefined) user.FullName = FullName;
    if (Email !== undefined) {
      const existingUser = await UserModel.findOne({
        Email,
        _id: { $ne: userId },
      });
      if (existingUser)
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      user.Email = Email;
    }
    if (Password) user.Password = Password;
    if (Role !== undefined) user.Role = Role;
    if (Bio !== undefined) user.Bio = Bio;
    if (typeof isActive !== "undefined") user.isActive = isActive === "true";

    // Handle file upload
    if (req.file) {
      // Save the file path (or filename) in DB
      user.Avatar = `/uploads/temp/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        Role: user.Role,
        Bio: user.Bio,
        Avatar: user.Avatar,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ NEW API: Delete User (Admin Only)
const DeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await UserModel.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ------------------ REQUEST WALLET OTP (2FA step 1) ------------------
export const RequestWalletOTP = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.EncryptedPrivateKey) {
      return res.status(400).json({ message: "No auto-generated wallet found for this user." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    walletOTPStore.set(userId, { otp, expiresAt });

    await transporter.sendMail({
      from: `"HyperTek Security" <${process.env.SMTP_EMAIL}>`,
      to: user.Email,
      subject: "HyperTek — Wallet Export Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0a1a; color: #fff; padding: 24px; border-radius: 8px; max-width: 480px;">
          <h2 style="color: #4a90e2;">🔐 Wallet Export Verification</h2>
          <p>Someone (hopefully you) requested to export your private key.</p>
          <p>Your one-time verification code is:</p>
          <div style="background: #1a1a2e; border: 2px solid #4a90e2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4a90e2;">${otp}</span>
          </div>
          <p style="color: #aaa; font-size: 13px;">This code expires in <strong style="color: #fff;">10 minutes</strong>.</p>
          <p style="color: #e53e3e; font-size: 13px;">⚠️ If you did not request this, your account may be compromised. Change your password immediately.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent to your registered email." });
  } catch (err) {
    console.error("RequestWalletOTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ EXPORT WALLET (requires OTP) ------------------
export const ExportWallet = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const { otp } = req.query;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required. Call /request-wallet-otp first." });
    }

    // Validate OTP
    const stored = walletOTPStore.get(userId);
    if (!stored) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }
    if (Date.now() > stored.expiresAt) {
      walletOTPStore.delete(userId);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP valid — consume it (one-time use)
    walletOTPStore.delete(userId);

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.EncryptedPrivateKey) {
      return res.status(400).json({ message: "No auto-generated wallet found for this user." });
    }

    const privateKey = decryptPrivateKey(user.EncryptedPrivateKey);

    res.status(200).json({
      success: true,
      WalletAddress: user.WalletAddress,
      PrivateKey: privateKey,
    });

  } catch (err) {
    console.error("ExportWallet error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ------------------ GET ADMIN BY ADMIN ID ------------------
const GetAdminByAdminId = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "adminId is required",
      });
    }

    const admin = await UserModel.findOne({
      _id: adminId,
      Role: "admin",
    }).select("-Password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  SignupUser,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  GoogleAuth,
  DiscordAuth,
  GetProfile,
  EditProfile,
  TwitterAuth,
  MetaMaskAuth,
  GetAllUsers,
  ToggleUserStatus,
  EditUser, // ✅ New export
  DeleteUser, // ✅ New export
  GetAdminByAdminId,
};