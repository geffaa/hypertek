import Stripe from "stripe";
import nodemailer from "nodemailer";
import { Payment } from "../Models/Payment.js";
import { finalizeNFAPurchase } from "../Service/nftPurchaseService.js";
import { markOfferCompleted } from "./Offer.js";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

async function sendKycEmail(toEmail, status, failReason) {
  const isVerified = status === "verified";
  const subject = isVerified
    ? "Your HyperTek Identity Verification is Complete"
    : "⚠️ Identity Verification Unsuccessful";

  const html = isVerified
    ? `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#4ade80;margin-bottom:8px">Identity Verified</h2>
        <p style="color:#aaa;margin-bottom:24px">Your identity has been successfully verified on HyperTek.</p>
        <p style="color:#ccc">You can now cash out your Hyper Bucks at any time by visiting your dashboard.</p>
        <a href="${process.env.FRONTEND_URL || "https://hyper-tek.com"}/dashboard/topup"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#002AA8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Go to Hyper Bucks
        </a>
        <p style="color:#555;font-size:12px;margin-top:32px">HyperTek — Building Worlds, One Game at a Time</p>
      </div>`
    : `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px">
        <h2 style="color:#f87171;margin-bottom:8px">Verification Unsuccessful</h2>
        <p style="color:#aaa;margin-bottom:24px">Unfortunately your identity verification was not approved.</p>
        ${failReason ? `<p style="color:#ccc;background:#1a1a1a;padding:12px;border-radius:8px;font-size:14px">Reason: ${failReason}</p>` : ""}
        <p style="color:#ccc;margin-top:16px">Please try again with a valid government-issued ID. Make sure the document is clear, not expired, and the selfie matches.</p>
        <a href="${process.env.FRONTEND_URL || "https://hyper-tek.com"}/dashboard/topup"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#002AA8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Try Again
        </a>
        <p style="color:#555;font-size:12px;margin-top:32px">HyperTek — Building Worlds, One Game at a Time</p>
      </div>`;

  try {
    await transporter.sendMail({
      from: `"HyperTek" <${process.env.SMTP_USER || process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 KYC ${status} email sent to ${toEmail}`);
  } catch (err) {
    console.error(" Failed to send KYC email:", err.message);
  }
}

export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("Webhook hit at:", new Date().toISOString());
  console.log("Headers:", req.headers);
  console.log("Signature:", sig);
  console.log("Raw body length:", req.body.length);

  let event;

  try {
    // Construct Stripe event (must use raw body)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Webhook event received:", event.type);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const dataObject = event.data?.object;

  try {
    let paymentData = {
      userId: dataObject.metadata?.userId || "unknown",
      email: dataObject.metadata?.email || "unknown",
      amount: dataObject.amount,
      currency: dataObject.currency,
      description:
        dataObject.metadata?.description || dataObject.description || "",
      provider: dataObject.metadata.provider || "stripe",
      status: "pending",
      paymentIntentId: dataObject.id,
      productId: dataObject.metadata.productId || null,
      itemType: dataObject.metadata.subCollectionId ? "nft" : (dataObject.metadata.itemType || "game"),
      gameTitle: dataObject.metadata.gameTitle || (dataObject.metadata.subCollectionId ? "NFT Purchase" : "Game Purchase"),
      // NFT fields
      parentId: (dataObject.metadata.parentId && dataObject.metadata.parentId !== "not_set") ? dataObject.metadata.parentId : null,
      subCollectionId: dataObject.metadata.subCollectionId || null,
      buyerWallet: dataObject.metadata.buyerWallet || null,
      tokenId: dataObject.metadata.tokenId || null,
      transactionId: dataObject.metadata?.transactionId || dataObject.id,
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        paymentData.status = "succeeded";

        // Check if payment already exists
        const existingPayment = await Payment.findOne({
          paymentIntentId: paymentData.paymentIntentId,
        });
        if (!existingPayment) {
          await Payment.create(paymentData);
          console.log(
            "💾 Payment succeeded and stored:",
            paymentData.paymentIntentId
          );

          // Mark associated offer as completed (if payment came from offer flow)
          const offerId = dataObject.metadata?.offerId;
          if (offerId && offerId !== "") {
            console.log("🔗 [StripeWebhook] Marking offer completed:", offerId);
            await markOfferCompleted(offerId);
          }

          // Handle Hyper Bucks top-up
          if (paymentData.itemType === "hyperbucks") {
            const hbAmount = parseInt(dataObject.metadata?.hbAmount || 0);
            const topupUserId = dataObject.metadata?.userId;
            if (hbAmount > 0 && topupUserId) {
              try {
                const topupUser = await User.findById(topupUserId);
                if (topupUser) {
                  topupUser.hyperBucks = (topupUser.hyperBucks || 0) + hbAmount;
                  await topupUser.save();
                  await HBLedger.create({
                    userId: topupUserId,
                    type: "earn",
                    amount: hbAmount,
                    balanceAfter: topupUser.hyperBucks,
                    description: `Top-up: ${hbAmount} HB ($${(hbAmount / 250).toFixed(2)} USD)`,
                    reference: paymentData.paymentIntentId,
                  });
                  console.log(`[StripeWebhook] Hyper Bucks credited: ${hbAmount} HB to user ${topupUserId}`);
                }
              } catch (hbErr) {
                console.error(" [StripeWebhook] Hyper Bucks credit failed:", hbErr.message);
              }
            }
            break;
          }

          // Handle NFT Purchase if metadata exists
          const { parentId, subCollectionId, buyerWallet, priceETH } = dataObject.metadata || {};

          if (subCollectionId && subCollectionId !== "undefined") {
            console.log("🚀 [StripeWebhook] SubCollection metadata found, finalising purchase...");
            try {
              const result = await finalizeNFAPurchase({
                parentId: parentId && parentId !== "not_set" ? String(parentId) : null,
                subCollectionId: String(subCollectionId),
                buyerWallet: String(buyerWallet),
                priceETH: parseFloat(priceETH || 0),
                productId: String(paymentData.productId),
                paymentProvider: "stripe",
                paymentIntentId: paymentData.paymentIntentId
              });
              console.log("[StripeWebhook] NFT Purchase finalized:", JSON.stringify(result, null, 2));

              // Update payment record with tokenId if available
              if (result && result.tokenId) {
                await Payment.findOneAndUpdate(
                  { paymentIntentId: paymentData.paymentIntentId },
                  { tokenId: result.tokenId }
                );
              }
            } catch (nftErr) {
              // Payment already recorded as succeeded — mark NFT transfer as pending
              // so support can retry manually. Do NOT return 500 (would cause Stripe to retry payment).
              console.error(" [StripeWebhook] NFT transfer failed after payment:", nftErr.message);
              await Payment.findOneAndUpdate(
                { paymentIntentId: paymentData.paymentIntentId },
                { nftTransferFailed: true, nftTransferError: nftErr.message }
              ).catch(() => { });
            }
          }
        } else {
          console.log(
            "⚠️ Duplicate payment ignored:",
            paymentData.paymentIntentId
          );
        }
        break;

      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        // Also check for duplicates
        const existing = await Payment.findOne({
          paymentIntentId: paymentData.paymentIntentId,
        });
        if (!existing) {
          paymentData.status =
            event.type === "payment_intent.payment_failed"
              ? "failed"
              : "canceled";
          if (event.type === "payment_intent.payment_failed") {
            paymentData.failureMessage =
              dataObject.last_payment_error?.message || "Payment failed";
          }
          await Payment.create(paymentData);
          console.log(
            `💾 Payment ${paymentData.status} and stored:`,
            paymentData.paymentIntentId
          );
        } else {
          console.log(
            "⚠️ Duplicate payment ignored:",
            paymentData.paymentIntentId
          );
        }
        break;

      case "identity.verification_session.verified":
        try {
          const kycUserId = dataObject.metadata?.userId;
          if (kycUserId) {
            const kycUser = await User.findByIdAndUpdate(kycUserId, {
              "kyc.status": "verified",
              "kyc.sessionId": dataObject.id,
              "kyc.verifiedAt": new Date(),
              "kyc.failReason": null,
            }, { new: false });
            console.log(`[StripeWebhook] KYC verified for user ${kycUserId}`);
            if (kycUser?.Email || kycUser?.email) {
              await sendKycEmail(kycUser.Email || kycUser.email, "verified", null);
            }
          }
        } catch (kycErr) {
          console.error(" [StripeWebhook] KYC verified update failed:", kycErr.message);
        }
        break;

      case "identity.verification_session.requires_input":
        try {
          const kycUserId = dataObject.metadata?.userId;
          if (kycUserId) {
            const failReason = dataObject.last_error?.reason || "Verification failed";
            const kycUser = await User.findByIdAndUpdate(kycUserId, {
              "kyc.status": "failed",
              "kyc.sessionId": dataObject.id,
              "kyc.failReason": failReason,
            }, { new: false });
            console.log(`⚠️ [StripeWebhook] KYC failed for user ${kycUserId}: ${failReason}`);
            if (kycUser?.Email || kycUser?.email) {
              await sendKycEmail(kycUser.Email || kycUser.email, "failed", failReason);
            }
          }
        } catch (kycErr) {
          console.error(" [StripeWebhook] KYC failed update failed:", kycErr.message);
        }
        break;

      default:
        console.log(`ℹ️ Ignored event type: ${event.type}`);
        return res.json({ received: true });
    }

    console.log("Webhook event received:", event.type);

    res.json({ received: true });
  } catch (err) {
    console.error("Error storing payment in DB:", err);
    res.status(500).send("Error storing payment in DB");
  }
};
