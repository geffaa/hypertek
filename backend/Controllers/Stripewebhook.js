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
    let paymentData = {
      userId: paymentIntent.metadata.userId,
      email: paymentIntent.metadata.email,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      description: paymentIntent.metadata.description,
      paymentIntentId: paymentIntent.id,
      productId: paymentIntent.metadata.productId,
      provider: paymentIntent.metadata.provider,
      gameTitle: paymentIntent.metadata.gameTitle,
      transactionId: paymentIntent.metadata.transactionId || paymentIntent.id,
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        paymentData.status = "succeeded";
        await Payment.create(paymentData);
        console.log("💾 Payment succeeded and stored:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        paymentData.status = "failed";
        paymentData.failureMessage =
          paymentIntent.last_payment_error?.message || "Payment failed";
        await Payment.create(paymentData);
        console.log("❌ Payment failed:", paymentIntent.id);
        break;

      case "payment_intent.canceled":
        paymentData.status = "canceled";
        await Payment.create(paymentData);
        console.log("⚠️ Payment canceled:", paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return res.status(400).send(`Unhandled event type: ${event.type}`);
    }

    // ✅ Only send success to Stripe if DB save succeeded
    res.json({ received: true });
  } catch (err) {
    console.error("Error storing payment in DB:", err);
    // ❌ Tell Stripe webhook failed — it will retry
    res.status(500).send("Error storing payment in DB");
  }
};
