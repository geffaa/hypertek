import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Stripe signature header:", req.headers["stripe-signature"]);
console.log("Raw payload:", req.body.toString());

 

  let event;
  console.log("✅ Webhook event received:", event.type);

  try {
    // Construct Stripe event
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // The object can be PaymentIntent or Charge
  const dataObject = event.data?.object;

  try {
    // Common payment data from metadata
    let paymentData = {
      userId: dataObject.metadata?.userId || "unknown",
      email: dataObject.metadata?.email || "unknown",
      amount: dataObject.amount / 100 || 0,
      currency: dataObject.currency || "usd",
      description: dataObject.metadata?.description || dataObject.description || "",
      paymentIntentId: dataObject.payment_intent || dataObject.id,
      productId: dataObject.metadata?.productId || "",
      provider: dataObject.metadata?.provider || "stripe",
      gameTitle: dataObject.metadata?.gameTitle || "",
      transactionId: dataObject.metadata?.transactionId || dataObject.id,
    };
switch (event.type) {
  case "payment_intent.succeeded":
    paymentData.status = "succeeded";

    // Check if payment already exists to prevent duplicates
    const existingPayment = await Payment.findOne({
      paymentIntentId: paymentData.paymentIntentId,
    });

    if (!existingPayment) {
      await Payment.create(paymentData);
      console.log("💾 Payment succeeded and stored:", paymentData.paymentIntentId);
    } else {
      console.log("⚠️ Duplicate payment ignored:", paymentData.paymentIntentId);
    }
    break;

  case "payment_intent.payment_failed":
    paymentData.status = "failed";
    paymentData.failureMessage =
      dataObject.last_payment_error?.message || "Payment failed";
    await Payment.create(paymentData);
    console.log("❌ Payment failed:", paymentData.paymentIntentId);
    break;

  case "payment_intent.canceled":
    paymentData.status = "canceled";
    await Payment.create(paymentData);
    console.log("⚠️ Payment canceled:", paymentData.paymentIntentId);
    break;

 default:
  console.log(`ℹ️ Ignored event type: ${event.type}`);
  return res.json({ received: true });

}


    // ✅ Only return success if DB save succeeded
    res.json({ received: true });
  } catch (err) {
    console.error("Error storing payment in DB:", err);
    // ❌ Let Stripe retry the webhook
    res.status(500).send("Error storing payment in DB");
  }
};
