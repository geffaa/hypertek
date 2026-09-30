// backend/Controllers/create-payment-intent.js
import dotenv from "dotenv";

dotenv.config({ path: "./Config/.env" }); // adjust path if needed

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const CreatePaymentIntent = async (req, res) => {
  console.log("CreatePaymentIntent payload:", req.body);

  try {
    const { amount, userId, email, description, productId, parentId, subCollectionId, buyerWallet, priceETH, offerId, country, packageId, packagePurchaseId } = req.body;
    if (!stripe) {
      return res.status(400).json({
        message: "Your stripe key is required",
      });
    }

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Marketplace items settle in USDC only, so each sale can fund the item's
    // trade-in escrow on-chain. Cards stay for packages.
    if (subCollectionId && !packagePurchaseId) {
      return res.status(410).json({ error: "Card payment is not available for marketplace items. Please pay with USDC." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
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
        // Buyer's self-declared country, for VAT/tax evidence — see NFTSystem.js saleSchema.
        // No billing-address collection is wired up on the Stripe side yet, so this is
        // whatever the frontend passes at checkout (may be empty until that's built).
        country: country || "",
        packageId: packageId || "",
        packagePurchaseId: packagePurchaseId || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ error: error.message });
  }
};
