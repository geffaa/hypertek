import { Payment } from "../Models/Payment.js";
import Stripe from "stripe";
import bodyParser from "body-parser";


// =======================
// 1️⃣ Payment Endpoint
// =======================
export const PayWithCard = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("Received payment body:", req.body);

  try {
    const { userId, userInfo, gameDetails, paymentDetails, provider,productId } = req.body;

    // Validate required fields
    if (!userId || !gameDetails || !paymentDetails) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentDetails.amount, // in cents
      currency: paymentDetails.currency || "usd",
      payment_method: paymentDetails.payment_method_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never" // disables redirect-based methods
      },
      metadata: {
        userId,
        gameId: gameDetails.gameId,
        gameTitle: gameDetails.title,
        provider:provider || "card",
        productId:productId,
        serialNumber: gameDetails.serialNumber || Payment.generateSerialNumber(),
      },
    });

    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// =======================
// 2️⃣ Webhook Endpoint
// =======================


// 2️⃣ Webhook Endpoint (Improved Error Message)
// =======================
export const SaveCardData = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("your signatatue ris :",sig);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const paymentIntent = event.data?.object;
  console.log("your payment intent are :",paymentIntent);

  // Only handle succeeded or failed payments
  if (event.type === "payment_intent.succeeded") {
    if (!paymentIntent.metadata?.userId) {
      console.error("⚠️ Missing metadata in payment intent:", paymentIntent.id);
      return res.status(400).json({ error: "Missing payment metadata" });
    }

    try {
      const payment = new Payment({
        userId: paymentIntent.metadata.userId,
        gameId: paymentIntent.metadata.gameId,
        gameTitle: paymentIntent.metadata.gameTitle,
        serialNumber: paymentIntent.metadata.serialNumber,
        amount: paymentIntent.amount,
        productId: paymentIntent.metadata.productId || paymentIntent.metadata.gameId, // fallback
        currency: paymentIntent.currency,
        provider: paymentIntent.metadata.provider || "card", // fallback
        transactionId: paymentIntent.id,
        status: "succeeded",
      });

      await payment.save();
      console.log("✅ Payment stored in DB:", payment._id);
      return res.status(200).json({ success: true, received: true });
    } catch (dbError) {
      console.error("🔥 DB Save Error:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Payment successful, but failed to save in DB",
        error: dbError.message,
      });
    }
  } else if (event.type === "payment_intent.payment_failed") {
    // handle failed payments
    console.warn("⚠️ Payment failed:", paymentIntent.last_payment_error?.message);
    return res.status(200).json({
      success: false,
      message: "Payment failed",
      error: paymentIntent.last_payment_error?.message,
    });
  } else {
    // Ignore all other event types
    console.log(`ℹ️ Ignored event type: ${event.type}`);
    return res.status(200).json({ received: true });
  }
};

