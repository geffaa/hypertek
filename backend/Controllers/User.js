import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";
import { ethers } from "ethers"; // ✅ must be this, not require("ethers")


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const RESET_SECRET = process.env.RESET_SECRET || "resetsecretkey";

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
  console.log("your login user body :",req.body);
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

    const token = jwt.sign(
      { id: user._id, Email: user.Email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

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
      process.env.RESET_SECRET, // <== must match
      { expiresIn: "1d" }
    );
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    // Send email
    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_EMAIL}>`,
      to: Email,
      subject: "Password Reset Request",
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background-color: #f4f6f8; 
            padding: 40px 0; 
            text-align: center;">
  <div style="max-width: 500px; 
              margin: auto; 
              background-color: #ffffff; 
              border-radius: 10px; 
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
              padding: 30px 40px;">
              
    <h2 style="color: #1a1a1a; margin-bottom: 10px;">🔒 Password Reset Request</h2>
    <p style="color: #555; font-size: 15px; line-height: 1.6;">
      We received a request to reset your password.  
      Click the button below to securely reset it.
    </p>

    <a href="${resetLink}"
       style="display: inline-block;
              margin-top: 20px;
              padding: 12px 28px;
              font-size: 16px;
              color: #ffffff;
              background-color: #007bff;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              box-shadow: 0 2px 6px rgba(0,123,255,0.3);
              transition: background-color 0.3s ease;">
      Reset My Password
    </a>

    <p style="color: #777; font-size: 14px; margin-top: 25px;">
      This link will expire in <strong>15 minutes</strong>.  
      If you didn’t request this, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

    <p style="font-size: 12px; color: #999;">
      Need help? Contact our support team at  
      <a href="mailto:support@innervoice.com" style="color: #007bff; text-decoration: none;">support@innervoice.com</a>
    </p>
  </div>

  <p style="color: #aaa; font-size: 12px; margin-top: 20px;">
    &copy; ${new Date().getFullYear()} Inner Voice. All rights reserved.
  </p>
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

// ------------------ GoogleAuth ------------------
const GoogleAuth = async (req, res) => {
  try {
    const { token } = req.body; // id_token from frontend
    console.log("your token in the backend :", token);
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify id token (checks signature + audience)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, email_verified, picture } = payload;

    if (!email || !email_verified) {
      return res
        .status(400)
        .json({ message: "Google account email not verified" });
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
    const jwtToken = jwt.sign(
      { id: user._id, Email: user.Email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        picture,
      },
    });
  } catch (err) {
    console.error("GoogleAuth err:", err);
    return res
      .status(500)
      .json({ message: "Google auth failed", error: err.message });
  }
};

// ------------------ Discord ------------------
const DiscordAuth = async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Received Discord auth code:", code);

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    // Exchange code for access_token
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
    console.log("Token exchange response:", tokenData);

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return res.status(400).json({
        success: false,
        message: "Failed to exchange authorization code",
        error: tokenData,
      });
    }

    // Fetch Discord user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userResponse.json();
    console.log("Discord user data:", discordUser);

    if (!discordUser.id) {
      console.error("Failed to fetch Discord user:", discordUser);
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

    // Find or create user
    let user;

    // First, try to find by Discord ID
    user = await UserModel.findOne({ DiscordId: discordId });

    // If not found by Discord ID, try by email
    if (!user && email) {
      user = await UserModel.findOne({ Email: email.toLowerCase() });
      if (user) {
        // Link Discord ID to existing email account
        user.DiscordId = discordId;
        await user.save();
      }
    }

    // Create new user if not found
    if (!user) {
      const fullName =
        global_name ||
        `${username}${
          discriminator && discriminator !== "0" ? `#${discriminator}` : ""
        }`;

      user = new UserModel({
        DiscordId: discordId,
        Email: email ? email.toLowerCase() : `${username}@discord.user`,
        FullName: fullName,
        Password: null,
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, DiscordId: discordId, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Discord login successful for user:", user.Email);

    return res.status(200).json({
      success: true,
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
    return res.status(500).json({
      success: false,
      message: "Internal server error during Discord authentication",
    });
  }
};

// ------------------  PROFILE ------------------
const GetProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const user = await UserModel.findById(userId).select("-Password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ EDIT PROFILE ------------------
const EditProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("your edit req body is :",req.body);
    const { FullName, Email, Password, NewPassword ,Bio } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ If updating password
    if (Password && NewPassword) {
      const isMatch = await bcrypt.compare(Password, user.Password);
      if (!isMatch)
        return res.status(400).json({ message: "Incorrect current password" });
      user.Password = NewPassword;
    }

    // ✅ Update text fields
    if (FullName) user.FullName = FullName;
    if (Email) user.Email = Email;
    if(Bio) user.Bio = Bio;

    // ✅ If image uploaded
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
        Bio:user.Bio
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
    console.log("Received Facebook auth code:", code);

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    // Exchange code for access_token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
    );
    const tokenData = await tokenResponse.json();
    console.log("Facebook token data:", tokenData);

    if (!tokenData.access_token) {
      return res.status(400).json({
        message: "Failed to get Facebook access token",
        error: tokenData,
      });
    }

    // Fetch Facebook user info
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    );
    const fbUser = await userResponse.json();
    console.log("Facebook user:", fbUser);

    if (!fbUser.id) {
      return res
        .status(400)
        .json({ message: "Failed to fetch Facebook user information" });
    }

    const { id: facebookId, email, name, picture } = fbUser;

    // Find or create user
    let user = await UserModel.findOne({ FacebookId: facebookId });
    if (!user && email) {
      user = await UserModel.findOne({ Email: email.toLowerCase() });
      if (user) {
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
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, FacebookId: facebookId, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Facebook login successful",
      token: jwtToken,
      user: {
        id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        Avatar: user.Avatar,
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
  console.log("your meta mask body :", req.body);
  try {
    const { address, signature, message } = req.body;

    // ✅ Step 1: Validate required fields
    if (!address || !signature || !message) {
      return res
        .status(400)
        .json({ 
          success: false,
          message: "Address, signature, and message are required" 
        });
    }

    // ✅ Step 2: Verify wallet signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid signature" 
      });
    }

    const normalizedAddress = address.toLowerCase();

    // ✅ Step 3: Find or create user (Following Google pattern)
    let user = await UserModel.findOne({ 
      $or: [
        { DiscordId: normalizedAddress },
        
      ]
    });

    if (user) {
      console.log("User found, updating MetaMask information...");
      user.DiscordId = normalizedAddress;
      await user.save();
      console.log("User MetaMask information updated successfully");

    } 
    if(!user){
      // ✅ Create new user (Similar to Google pattern)
      console.log("Creating new MetaMask user...");
      user = new UserModel({
        DiscordId: normalizedAddress,
        Avatar: "",
        lastLogin: new Date(),
        loginCount: 1,
        isActive: true,
       
        // No Password field - similar to Google accounts
      });
      await user.save();
      console.log("New MetaMask user created successfully");
    }

    // ✅ Step 4: Generate JWT (Similar to Google pattern)
    const jwtToken = jwt.sign(
      { 
        id: user._id, 
        WalletAddress: normalizedAddress,
        email: user.Email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Match Google's expiry or adjust as needed
    );

    // ✅ Step 5: Send response (Similar structure to Google)
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
        isActive: user.isActive
      },
    });

  } catch (err) {
    console.error("MetaMaskAuth error:", err);
    
    // Handle specific errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Wallet address already exists with different account"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "MetaMask auth failed", // Changed to match Google error message pattern
      error: err.message,
    });
  }
};
// ------------------ TWITTER AUTH ------------------
const TwitterAuth = async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Received Twitter auth code:", code);

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    // Exchange code for access token
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
          code_verifier: "challenge", // same as used in frontend
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    console.log("Twitter token data:", tokenData);

    if (!tokenData.access_token) {
      return res.status(400).json({
        message: "Failed to get Twitter access token",
        error: tokenData,
      });
    }

    // Fetch Twitter user info
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const twitterUser = await userResponse.json();
    console.log("Twitter user:", twitterUser);

    const userData = twitterUser.data;
    if (!userData || !userData.id) {
      return res
        .status(400)
        .json({ message: "Failed to fetch Twitter user information" });
    }

    const { id: twitterId, name, username } = userData;

    // Find or create user
    let user = await UserModel.findOne({ TwitterId: twitterId });

    if (!user) {
      user = new UserModel({
        TwitterId: twitterId,
        FullName: name || username,
        Email: `${username}@twitter.user`,
      });
      await user.save();
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { id: user._id, TwitterId: twitterId, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Twitter login successful",
      token: jwtToken,
      user: { id: user._id, Email: user.Email, FullName: user.FullName },
    });
  } catch (err) {
    console.error("TwitterAuth error:", err);
    res.status(500).json({
      message: "Internal server error during Twitter login",
      error: err.message,
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
};
