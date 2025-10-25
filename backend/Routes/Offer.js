import express from "express";
import {
  createOffer,
  getAllOffers,
  getOffersByOwnerId,
  getOffersByUserId,
  updateRequestStatus,
  updatePaymentStatus,
} from "../Controllers/Offer.js"

const OfferRoute = express.Router();

/**
 * ===============================
 *  Offer Routes
 * ===============================
 */

// ✅ Create a new offer
OfferRoute.post("/create", createOffer);

// ✅ Get all offers (for admin or debugging)
OfferRoute.get("/all", getAllOffers);

// ✅ Get offers by game owner ID
OfferRoute.get("/owner/:ownerId", getOffersByOwnerId);

// ✅ Get offers by user ID (the one who made the offer)
OfferRoute.get("/user/:userId", getOffersByUserId);

// ✅ Update request status (accepted, rejected, pending)
OfferRoute.put("/:id/request-status", updateRequestStatus);

// ✅ Update payment status (paid, unpaid, refunded)
OfferRoute.put("/:id/payment-status", updatePaymentStatus);

export default OfferRoute;
