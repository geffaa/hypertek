import { Payment } from "../Models/Payment.js";
import Stripe from "stripe";
import bodyParser from "body-parser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =======================
// 1️⃣ Payment Endpoint
// =======================
export const PayWithCard = async (req, res) => {
  console.log("Received payment body:", req.body);

  try {
    const { userId, userInfo, gameDetails, paymentDetails, provider = "stripe" } = req.body;

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
export const SaveCardData = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      const payment = new Payment({
        userId: paymentIntent.metadata.userId,
        gameId: paymentIntent.metadata.gameId,
        gameTitle: paymentIntent.metadata.gameTitle,
        serialNumber: paymentIntent.metadata.serialNumber,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        provider: "stripe",
        transactionId: paymentIntent.id,
        status: "succeeded",
      });

      await payment.save();
      console.log("Payment stored in DB:", payment._id);
    } catch (err) {
      console.error("Error saving payment:", err.message);
    }
  }

  res.json({ received: true });
};
