// controllers/stripeController.js
import dotenv from "dotenv";
import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, userId, redirectUrl, gameTitle, gameId, itemType, platform } = req.body;

    if (!amount || !userId || !redirectUrl || !gameTitle) {
      return res.status(400).json({ 
        message: "Amount, userId, redirectUrl and gameTitle are required" 
      });
    }

    const session = await stripe.checkout.sessions.create({
payment_method_types: ["card", "usdc","wechat_pay"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: gameTitle },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${redirectUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectUrl}?/`,
      metadata: { 
        userId,
        gameTitle,
        gameId: gameId || "",
        itemType: itemType || "game",
        platform: platform || "pc"
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Webhook Handler: Success + Failed + Canceled Payments
export const stripeWebhook = async (req, res) => {
  console.log("🎯 Webhook processing started...");

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
    return res.status(500).send("Webhook configuration error");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("💰 Checkout completed successfully");
        const session = event.data.object;

        const payment = new Payment({
          userId: session.metadata.userId,
          gameId: session.metadata.gameId || null,
          gameTitle: session.metadata.gameTitle || "Unknown Game",
          serialNumber: Payment.generateSerialNumber(),
          itemType: session.metadata.itemType || "game",
          platform: session.metadata.platform || "pc",
          amount: session.amount_total / 100, // convert cents → dollars
          currency: session.currency,
          provider: "stripe",
          transactionId: session.payment_intent,
          paymentMethod: "stripe",
          status: "succeeded",
          metadata: {
            stripeSessionId: session.id,
            customerEmail: session.customer_details?.email,
          },
        });

        await payment.save();
        console.log("✅ Payment saved successfully!");
        break;
      }

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        console.log("❌ Payment failed");
        const session = event.data.object;

        await Payment.create({
          userId: session.metadata?.userId || "unknown",
          gameTitle: session.metadata?.gameTitle || "unknown",
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "usd",
          status: "failed",
          provider: "stripe",
          metadata: session.metadata,
        });

        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_canceled": {
        console.log("⚠️ Payment canceled or expired");
        const session = event.data.object;

        await Payment.create({
          userId: session.metadata?.userId || "unknown",
          gameTitle: session.metadata?.gameTitle || "unknown",
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "usd",
          status: "canceled",
          provider: "stripe",
          metadata: session.metadata,
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    res.status(500).send("Server Error");
  }
};
