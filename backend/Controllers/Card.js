import { Payment } from "../Models/Payment.js";
import { finalizeNFAPurchase } from "../Service/nftPurchaseService.js";
import Stripe from "stripe";
import bodyParser from "body-parser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// =======================
// 1️⃣ Payment Endpoint
// =======================
export const PayWithCard = async (req, res) => {
  console.log("Received payment body:", req.body);

  try {
    const { userId, userInfo, gameDetails, paymentDetails, provider, productId } = req.body;

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
        userId: String(userId),
        gameId: String(gameDetails.gameId),
        gameTitle: String(gameDetails.title),
        provider: String(provider || "card"),
        productId: String(productId),
        itemType: req.body.subCollectionId ? "nft" : String(req.body.itemType || "game"),
        serialNumber: String(gameDetails.serialNumber || Payment.generateSerialNumber()),
        parentId: req.body.parentId ? String(req.body.parentId) : "not_set",
        subCollectionId: String(req.body.subCollectionId || ""),
        buyerWallet: String(req.body.buyerWallet || ""),
        priceETH: String(req.body.priceETH || ""),
        tokenId: String(req.body.tokenId || ""),
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
  console.log("your signatatue ris :", sig);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(" Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const paymentIntent = event.data?.object;
  console.log("ℹ️ [SaveCardData] Webhook Event Object:", JSON.stringify(paymentIntent, null, 2));
  console.log("ℹ️ [SaveCardData] Metadata:", paymentIntent.metadata);

  // Only handle succeeded or failed payments
  if (event.type === "payment_intent.succeeded") {
    if (!paymentIntent.metadata?.userId) {
      console.error("⚠️ Missing metadata in payment intent:", paymentIntent.id);
      return res.status(400).json({ error: "Missing payment metadata" });
    }
    try {
      const paymentDataDoc = {
        userId: paymentIntent.metadata.userId,
        gameId: paymentIntent.metadata.gameId,
        gameTitle: paymentIntent.metadata.gameTitle,
        serialNumber: paymentIntent.metadata.serialNumber,
        amount: paymentIntent.amount / 100, // convert cents to USD
        productId: paymentIntent.metadata.productId || paymentIntent.metadata.gameId,
        itemType: paymentIntent.metadata.subCollectionId ? "nft" : (paymentIntent.metadata.itemType || "game"),
        currency: paymentIntent.currency,
        provider: paymentIntent.metadata.provider || "card",
        transactionId: paymentIntent.id,
        status: "succeeded",
        parentId: paymentIntent.metadata.parentId && paymentIntent.metadata.parentId !== "not_set" ? paymentIntent.metadata.parentId : null,
        subCollectionId: paymentIntent.metadata.subCollectionId || null,
        tokenId: paymentIntent.metadata.tokenId ? Number(paymentIntent.metadata.tokenId) : null,
        buyerWallet: paymentIntent.metadata.buyerWallet || null,
      };

      const payment = new Payment(paymentDataDoc);
      await payment.save();
      console.log("[CardWebhook] Payment stored in DB:", payment._id, "itemType:", payment.itemType);

      // Handle NFT Purchase if metadata exists (parentId is now optional as we can find it by subCollectionId)
      const { parentId, subCollectionId, buyerWallet, priceETH } = paymentIntent.metadata || {};
      if (subCollectionId && subCollectionId !== "undefined" && buyerWallet && buyerWallet !== "undefined") {
        console.log("🚀 [SaveCardData] NFT Metadata found, finalising purchase...");
        try {
          const result = await finalizeNFAPurchase({
            parentId,
            subCollectionId,
            buyerWallet,
            priceETH: parseFloat(priceETH),
            paymentProvider: "stripe",
            paymentIntentId: paymentIntent.id
          });
          console.log("[SaveCardData] NFT Purchase finalized:", JSON.stringify(result, null, 2));

          // Optionally update the payment record with the confirmed tokenId if it was just minted
          if (result && result.tokenId) {
            payment.tokenId = result.tokenId;
            await payment.save();
          }
        } catch (nftErr) {
          console.error(" Failed to finalize NFT Purchase in Card Webhook:", nftErr.message);
        }
      }

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

