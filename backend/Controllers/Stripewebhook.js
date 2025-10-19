import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Received Stripe signature:", sig);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const paymentIntent = event.data?.object;

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        // ✅ Payment succeeded
        await Payment.create({
          userId: paymentIntent.metadata.userId,
          email: paymentIntent.metadata.email,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          description: paymentIntent.metadata.description,
          paymentIntentId: paymentIntent.id,
          productId:paymentIntent.metadata.productId,
          status: "succeeded",
          provider: paymentIntent.metadata.provider,
          gameTitle: paymentIntent.metadata.gameTitle,
          transactionId: paymentIntent.metadata.transactionId || paymentIntent.id,
        });
        console.log("💾 Payment succeeded and stored:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        // ⚠️ Payment failed
        await Payment.create({
          userId: paymentIntent.metadata.userId,
          email: paymentIntent.metadata.email,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          description: paymentIntent.metadata.description,
          paymentIntentId: paymentIntent.id,
                    productId:paymentIntent.metadata.productId,

          status: "failed",
          provider: paymentIntent.metadata.provider,
          gameTitle: paymentIntent.metadata.gameTitle,
          transactionId: paymentIntent.metadata.transactionId || paymentIntent.id,
          failureMessage: paymentIntent.last_payment_error?.message || "Payment failed",
        });
        console.log("❌ Payment failed:", paymentIntent.id);
        break;

      case "payment_intent.canceled":
        // ⚠️ Payment canceled
        await Payment.create({
          userId: paymentIntent.metadata.userId,
          email: paymentIntent.metadata.email,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          description: paymentIntent.metadata.description,
          paymentIntentId: paymentIntent.id,
                    productId:paymentIntent.metadata.productId,

          status: "canceled",
          provider: paymentIntent.metadata.provider,
          gameTitle: paymentIntent.metadata.gameTitle,
          transactionId: paymentIntent.metadata.transactionId || paymentIntent.id,
        });
        console.log("⚠️ Payment canceled:", paymentIntent.id);
        break;

      // You can handle more events if needed:
      // 'charge.refunded', 'payment_intent.requires_action', etc.

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error handling Stripe webhook:", err);
  }

  res.json({ received: true });
};
