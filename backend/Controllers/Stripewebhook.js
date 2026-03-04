import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";
import { finalizeNFAPurchase } from "../Service/nftPurchaseService.js";
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("✅ Webhook hit at:", new Date().toISOString());
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
    console.log("✅ Webhook event received:", event.type);
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
              console.log("✅ [StripeWebhook] NFT Purchase finalized:", JSON.stringify(result, null, 2));
              
              // Update payment record with tokenId if available
              if (result && result.tokenId) {
                await Payment.findOneAndUpdate(
                  { paymentIntentId: paymentData.paymentIntentId },
                  { tokenId: result.tokenId }
                );
              }
            } catch (nftErr) {
              console.error("❌ Failed to finalize NFT Purchase in Webhook:", nftErr.message);
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

      default:
        console.log(`ℹ️ Ignored event type: ${event.type}`);
        return res.json({ received: true });
    }

    console.log("✅ Webhook event received:", event.type);

    res.json({ received: true });
  } catch (err) {
    console.error("Error storing payment in DB:", err);
    res.status(500).send("Error storing payment in DB");
  }
};
