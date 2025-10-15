// controllers/cryptoController.js
import dotenv from "dotenv";
import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";

dotenv.config({ path: "./Config/.env" });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Stripe Crypto Session
export const createCryptoSession = async (req, res) => {
  try {
    const { amount, userId, redirectUrl, gameTitle, gameId, itemType, platform } = req.body;

    if (!amount || !userId || !redirectUrl || !gameTitle) {
      return res.status(400).json({
        message: "Amount, userId, redirectUrl and gameTitle are required",
      });
    }

    // ✅ Only for CRYPTO — Limit payments up to $10,000 (in cents)
    const MAX_AMOUNT = 10000 * 100;
    if (Number(amount) > MAX_AMOUNT) {
      return res.status(400).json({
        message: "Crypto payment cannot exceed $10,000",
      });
    }

    const session = await stripe.checkout.sessions.create({
      // ✅ Crypto-only session
      payment_method_types: ["crypto"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: gameTitle,
              description: `Crypto payment for ${gameTitle}`,
            },
            unit_amount: amount, // already in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${redirectUrl}?status=success&session_id={CHECKOUT_SESSION_ID}&provider=crypto`,
      cancel_url: `${redirectUrl}/`,
      metadata: {
        userId,
        gameTitle,
        gameId: gameId || "",
        itemType: itemType || "game",
        platform: platform || "pc",
      },
    });

    res.status(200).json({
      url: session.url,
      sessionId: session.id,
      provider: "crypto",
    });
  } catch (error) {
    console.error("Stripe Crypto Error:", error);

    // ✅ Handle Stripe "amount_too_large" error
    if (error.code === "amount_too_large") {
      return res.status(400).json({
        message: "Crypto payment cannot exceed $10,000",
      });
    }

    res.status(500).json({
      message: error.message || "Failed to create crypto session",
    });
  }
};

// ✅ Stripe Crypto Webhook Handler
export const cryptoWebhook = async (req, res) => {
  console.log("🎯 Stripe Crypto Webhook processing...");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
    return res.status(500).send("Webhook configuration error");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Stripe webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("💰 Crypto checkout completed successfully");
        const session = event.data.object;
        const isCryptoPayment = session.payment_method_types.includes("crypto");

        if (isCryptoPayment) {
          const payment = new Payment({
            userId: session.metadata.userId,
            gameId: session.metadata.gameId || null,
            gameTitle: session.metadata.gameTitle || "Unknown Game",
            serialNumber: Payment.generateSerialNumber(),
            itemType: session.metadata.itemType || "game",
            platform: session.metadata.platform || "pc",
            amount: session.amount_total / 100,
            currency: session.currency,
            provider: "crypto",
            transactionId: session.payment_intent,
            paymentMethod: "cryptocurrency",
            status: "succeeded",
            metadata: {
              stripeSessionId: session.id,
              customerEmail: session.customer_details?.email,
              paymentMethodTypes: session.payment_method_types,
              isCryptoPayment: true,
            },
          });

          await payment.save();
          console.log("✅ Crypto payment saved successfully!");
        }
        break;
      }

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        console.log("❌ Crypto payment failed");
        const session = event.data.object;
        const isCryptoPayment = session.payment_method_types?.includes("crypto");

        if (isCryptoPayment) {
          await Payment.create({
            userId: session.metadata?.userId || "unknown",
            gameTitle: session.metadata?.gameTitle || "unknown",
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            status: "failed",
            provider: "crypto",
            transactionId: session.payment_intent || session.id,
            paymentMethod: "cryptocurrency",
            metadata: session.metadata,
          });
        }
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_canceled": {
        console.log("⚠️ Crypto payment canceled or expired");
        const session = event.data.object;
        const isCryptoPayment = session.payment_method_types?.includes("crypto");

        if (isCryptoPayment) {
          await Payment.create({
            userId: session.metadata?.userId || "unknown",
            gameTitle: session.metadata?.gameTitle || "unknown",
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            status: "canceled",
            provider: "crypto",
            transactionId: session.id,
            paymentMethod: "cryptocurrency",
            metadata: session.metadata,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled crypto event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error processing crypto webhook:", err);
    res.status(500).send("Server Error");
  }
};
