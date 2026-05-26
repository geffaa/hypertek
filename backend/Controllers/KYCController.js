import Stripe from "stripe";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/v1/kyc/session
// Creates a Stripe Identity verification session for the authenticated user
export async function createVerificationSession(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.kyc?.status === "verified") {
      return res.status(400).json({ error: "Identity already verified", status: "verified" });
    }

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { userId: userId.toString() },
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    user.kyc = {
      status: "pending",
      sessionId: session.id,
      verifiedAt: null,
      failReason: null,
    };
    await user.save();

    return res.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("createVerificationSession error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/v1/kyc/status
// Returns current KYC status for the authenticated user
export async function getKYCStatus(req, res) {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("kyc");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      status: user.kyc?.status || "not_started",
      verifiedAt: user.kyc?.verifiedAt || null,
      failReason: user.kyc?.failReason || null,
    });
  } catch (error) {
    console.error("getKYCStatus error:", error);
    return res.status(500).json({ error: error.message });
  }
}
