// backend/Controllers/create-payment-intent.js
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" }); // adjust path if needed

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const CreatePaymentIntent = async (req, res) => {
  console.log("CreatePaymentIntent payload:", req.body);

  try {
    const { amount, userId, email, description, productId, parentId, subCollectionId, buyerWallet, priceETH, offerId } = req.body;
    if (!stripe) {
      return res.status(400).json({
        message: "Your stripe key is required",
      });
    }

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId, // MongoDB ObjectId
        email: email || "unknown",
        provider: "stripe", // required by schema
        gameTitle: req.body.gameTitle || "NFT Purchase", // required by schema
        transactionId: "",
        productId: productId || "nft",
        parentId: parentId || "",
        subCollectionId: subCollectionId || "",
        buyerWallet: buyerWallet || "",
        priceETH: priceETH || "",
        offerId: offerId || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ error: error.message });
  }
};
