


import dotenv from "dotenv";
import Stripe from "stripe";
import { Payment } from "../Models/Payment.js"; // ✅ Import your MongoDB schema

dotenv.config({ path: "./Config/.env" }); // Load environment variables

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ STEP 1: Create Stripe Payment Intent
export const ConnectStripe = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({
        message: "Stripe secret key is missing in .env file",
      });
    }

    // ✅ Create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ STEP 2: Save payment after successful payment (frontend calls this)
export const SaveStripePayment = async (req, res) => {
  console.log("your req body is :",req.body);
  try {
    const { userId, amount, currency, paymentIntentId, transactionId,provider, paymentMethod, status } = req.body;

    // ✅ Create and save payment record
    const payment = new Payment({
      userId,
      amount,
      currency,
      provider,
      paymentIntentId,
      transactionId,
      paymentMethod,
      status,
      createdAt: new Date(),
    });

    await payment.save();

    res.status(200).json({
      message: "Payment stored successfully!",
      payment,
    });
  } catch (error) {
    console.error("Save Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};
