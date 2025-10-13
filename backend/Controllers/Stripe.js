// controllers/stripeController.js
import dotenv from "dotenv";
import Stripe from "stripe";
import { Payment } from "../Models/Payment.js";

dotenv.config({ path: "./Config/.env" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ message: "Amount and userId are required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // or add others if needed
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Your Payment",
            },
            unit_amount: amount, // in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { userId },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Webhook to save payment
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const payment = new Payment({
        userId: session.metadata.userId,
        amount: session.amount_total / 100,
        currency: session.currency,
        provider: "stripe",
        transactionId: session.payment_intent,
        paymentMethod: "stripe",
        status: "paid",
        createdAt: new Date(),
      });

      await payment.save();
      console.log("Payment saved successfully via webhook!");
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  res.json({ received: true });
};
