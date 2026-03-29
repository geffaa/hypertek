import { Offer } from "../Models/Offer.js";
import User from "../Models/User.js";
import nodemailer from "nodemailer";

// ✅ Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

transporter.verify(function (error, success) {
  if (error) console.error("❌ Email transporter error:", error);
  else console.log("✅ Email service is ready");
});

// ✅ Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Hyper-Tek Games" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
};

// ============================================================
// ✅ CREATE OFFER + EMAILS
// ============================================================
const createOffer = async (req, res) => {
  try {
    const {
      serialNumber,
      gameId,
      gameTitle,
      gameActualPrice,
      offerPrice,
      priceDuration,
      userId,
      userName,
      userEmail,
      ownerId,
      ownerName,
      ownerEmail,
      requestStatus,
      paymentStatus,
    } = req.body;

    if (
      !serialNumber ||
      !gameId ||
      !gameTitle ||
      gameActualPrice === undefined || gameActualPrice === null ||
      !offerPrice || offerPrice <= 0 ||
      !priceDuration ||
      !userId ||
      !userName ||
      !userEmail ||
      !ownerId
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided and offer price must be greater than 0",
      });
    }

    // If seller email wasn't provided, look it up by wallet address
    let resolvedOwnerEmail = ownerEmail || "";
    let resolvedOwnerName  = ownerName  || "Platform";
    if (!resolvedOwnerEmail && ownerId && ownerId !== "platform") {
      const ownerUser = await User.findOne({
        $or: [
          { MetaMaskAddress: ownerId.toLowerCase() },
          { WalletAddress:   ownerId.toLowerCase() },
        ],
      }).select("Email FullName");
      if (ownerUser) {
        resolvedOwnerEmail = ownerUser.Email || "";
        resolvedOwnerName  = ownerUser.FullName || resolvedOwnerName;
      }
    }

    const offer = new Offer({
      serialNumber,
      gameId: String(gameId),
      gameTitle,
      gameActualPrice,
      offerPrice,
      priceDuration,
      userId,
      userName,
      userEmail,
      ownerId: String(ownerId),
      ownerName: resolvedOwnerName,
      ownerEmail: resolvedOwnerEmail,
      requestStatus: requestStatus || "pending",
      paymentStatus: paymentStatus || "unpaid",
    });

    await offer.save();

    // ✅ Email for Owner
    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:40px;">
        <div style="background:white; padding:25px; border-radius:10px;">
          <h2>🎮 New Offer Request Received</h2>
          <p>Dear ${resolvedOwnerName},</p>
          <p>${userName} has made an offer for <b>${gameTitle}</b>.</p>
          <table style="margin-top:15px;">
            <tr><td><b>Offer ID:</b></td><td>${serialNumber}</td></tr>
            <tr><td><b>Original Price:</b></td><td>$${gameActualPrice}</td></tr>
            <tr><td><b>Offered Price:</b></td><td>$${offerPrice}</td></tr>
            <tr><td><b>Duration:</b></td><td>${priceDuration}</td></tr>
          </table>
          <p style="margin-top:15px;">Login to your dashboard to review this offer.</p>
          <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} Hyper-Tek Games</p>
        </div>
      </div>
    `;

    // ✅ Email for User
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:40px;">
        <div style="background:white; padding:25px; border-radius:10px;">
          <h2>✅ Offer Created Successfully!</h2>
          <p>Dear ${userName},</p>
          <p>Your offer for <b>${gameTitle}</b> has been sent to ${resolvedOwnerName}.</p>
          <table style="margin-top:15px;">
            <tr><td><b>Offer ID:</b></td><td>${serialNumber}</td></tr>
            <tr><td><b>Offered Price:</b></td><td>$${offerPrice}</td></tr>
            <tr><td><b>Duration:</b></td><td>${priceDuration}</td></tr>
          </table>
          <p style="margin-top:15px;">You will be notified once the owner updates the status.</p>
          <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} Hyper-Tek Games</p>
        </div>
      </div>
    `;

    if (resolvedOwnerEmail) await sendEmail(resolvedOwnerEmail, `🎮 New Offer for ${gameTitle}`, ownerEmailHtml);
    await sendEmail(userEmail, `✅ Offer Created for ${gameTitle}`, userEmailHtml);

    res.status(201).json({
      success: true,
      message: "Offer created and emails sent to both user and owner.",
      offer,
    });
  } catch (error) {
    console.error("❌ Error creating offer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ============================================================
// ✅ UPDATE REQUEST STATUS + EMAILS
// ============================================================
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required",
      });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.requestStatus = status;

    // When seller accepts — record deadline (48 hours)
    if (status === "accepted") {
      offer.acceptedAt = new Date();
      offer.acceptDeadlineAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    }

    await offer.save();

    // ✅ Notify both parties — customised per status
    let buyerSubject, buyerHtml, ownerSubject, ownerHtml;
    const year = new Date().getFullYear();

    if (status === "accepted") {
      const deadlineStr = offer.acceptDeadlineAt.toUTCString();
      buyerSubject = `✅ Your Offer Was Accepted — Complete Purchase for ${offer.gameTitle}`;
      buyerHtml = `
        <div style="font-family:Arial,sans-serif;background:#f0f4ff;padding:40px;">
          <div style="background:white;padding:28px;border-radius:12px;max-width:520px;">
            <h2 style="color:#1a3cb5;">🎉 Your Offer Was Accepted!</h2>
            <p>Hi ${offer.userName},</p>
            <p>Great news! The owner has accepted your offer for <b>${offer.gameTitle}</b>.</p>
            <table style="margin:16px 0;border-collapse:collapse;width:100%;">
              <tr><td style="padding:6px 0;color:#555;"><b>Offer Price:</b></td><td>${offer.offerPrice} USDC</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><b>Offer ID:</b></td><td>${offer.serialNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#e05c00;"><b>Complete By:</b></td><td>${deadlineStr}</td></tr>
            </table>
            <p style="background:#fff3cd;padding:12px;border-radius:8px;color:#856404;">
              ⏳ <b>You have 48 hours</b> to complete your purchase. After that, the offer expires.
            </p>
            <p>Log in to your account, open the NFT page, and click <b>"Complete Purchase"</b> in the Offers tab.</p>
            <p style="font-size:12px;color:#aaa;margin-top:24px;">© ${year} Hyper-Tek Games</p>
          </div>
        </div>`;

      ownerSubject = `📢 You Accepted an Offer for ${offer.gameTitle}`;
      ownerHtml = `
        <div style="font-family:Arial,sans-serif;background:#f0f4ff;padding:40px;">
          <div style="background:white;padding:28px;border-radius:12px;max-width:520px;">
            <h2 style="color:#1a3cb5;">📢 Offer Accepted</h2>
            <p>You accepted an offer from <b>${offer.userName}</b> for <b>${offer.gameTitle}</b>.</p>
            <table style="margin:16px 0;border-collapse:collapse;width:100%;">
              <tr><td style="padding:6px 0;color:#555;"><b>Offer Price:</b></td><td>${offer.offerPrice} USDC</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><b>Offer ID:</b></td><td>${offer.serialNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#555;"><b>Buyer Deadline:</b></td><td>${deadlineStr}</td></tr>
            </table>
            <p>You will be notified once the buyer completes payment.</p>
            <p style="font-size:12px;color:#aaa;margin-top:24px;">© ${year} Hyper-Tek Games</p>
          </div>
        </div>`;
    } else if (status === "rejected") {
      buyerSubject = `❌ Your Offer Was Declined — ${offer.gameTitle}`;
      buyerHtml = `
        <div style="font-family:Arial,sans-serif;background:#f8f9fa;padding:40px;">
          <div style="background:white;padding:25px;border-radius:10px;">
            <h2>❌ Offer Declined</h2>
            <p>Hi ${offer.userName}, your offer of <b>${offer.offerPrice} USDC</b> for <b>${offer.gameTitle}</b> was declined.</p>
            <p>You can make a new offer at a different price.</p>
            <p style="font-size:12px;color:#777;">© ${year} Hyper-Tek Games</p>
          </div>
        </div>`;
      ownerSubject = `📢 Offer Rejected for ${offer.gameTitle}`;
      ownerHtml = `
        <div style="font-family:Arial,sans-serif;background:#f8f9fa;padding:40px;">
          <div style="background:white;padding:25px;border-radius:10px;">
            <h2>📢 Offer Rejected</h2>
            <p>You rejected the offer from <b>${offer.userName}</b> for <b>${offer.gameTitle}</b>.</p>
            <p style="font-size:12px;color:#777;">© ${year} Hyper-Tek Games</p>
          </div>
        </div>`;
    } else {
      // cancelled or other
      buyerSubject = ownerSubject = `📢 Offer Update: ${offer.gameTitle}`;
      buyerHtml = ownerHtml = `
        <div style="font-family:Arial,sans-serif;background:#f8f9fa;padding:40px;">
          <div style="background:white;padding:25px;border-radius:10px;">
            <h2>📢 Offer Status Changed</h2>
            <p>The offer for <b>${offer.gameTitle}</b> is now <b>${status}</b>. Offer ID: ${offer.serialNumber}</p>
            <p style="font-size:12px;color:#777;">© ${year} Hyper-Tek Games</p>
          </div>
        </div>`;
    }

    if (offer.userEmail)  await sendEmail(offer.userEmail,  buyerSubject,  buyerHtml);
    if (offer.ownerEmail) await sendEmail(offer.ownerEmail, ownerSubject,  ownerHtml);

    res.status(200).json({
      success: true,
      message: `Request status updated to '${status}' and emails sent.`,
      offer,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update request status",
      error: error.message,
    });
  }
};

// ============================================================
// ✅ UPDATE PAYMENT STATUS + EMAILS
// ============================================================
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required",
      });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.paymentStatus = status;
    await offer.save();

    // ✅ Notify both parties
    const subject = `💰 Payment Status Updated: ${offer.gameTitle}`;
    const messageHtml = `
      <div style="font-family: Arial; background:#f8f9fa; padding:40px;">
        <div style="background:white; padding:25px; border-radius:10px;">
          <h2>💰 Payment Status Changed</h2>
          <p>The payment for <b>${offer.gameTitle}</b> is now marked as <b>${status}</b>.</p>
          <p>Offer ID: ${offer.serialNumber}</p>
          <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} Hyper-Tek Games</p>
        </div>
      </div>
    `;

    await sendEmail(offer.userEmail, subject, messageHtml);
    await sendEmail(offer.ownerEmail, subject, messageHtml);

    res.status(200).json({
      success: true,
      message: `Payment status updated to '${status}' and emails sent.`,
      offer,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

// ============================================================
// ✅ MARK OFFER COMPLETED (called by Stripe webhook after payment)
// ============================================================
export const markOfferCompleted = async (offerId) => {
  try {
    const offer = await Offer.findById(offerId);
    if (!offer) return;

    offer.requestStatus = "completed";
    offer.paymentStatus = "paid";
    await offer.save();

    const year = new Date().getFullYear();

    const buyerHtml = `
      <div style="font-family:Arial,sans-serif;background:#f0f4ff;padding:40px;">
        <div style="background:white;padding:28px;border-radius:12px;max-width:520px;">
          <h2 style="color:#16a34a;">🎉 Purchase Complete!</h2>
          <p>Hi ${offer.userName},</p>
          <p>Your purchase of <b>${offer.gameTitle}</b> is complete. The NFT is being transferred to your wallet.</p>
          <table style="margin:16px 0;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:#555;"><b>Amount Paid:</b></td><td>${offer.offerPrice} USDC</td></tr>
            <tr><td style="padding:6px 0;color:#555;"><b>Offer ID:</b></td><td>${offer.serialNumber}</td></tr>
          </table>
          <p>You can view your NFT in your profile once the transfer completes.</p>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">© ${year} Hyper-Tek Games</p>
        </div>
      </div>`;

    const sellerHtml = `
      <div style="font-family:Arial,sans-serif;background:#f0f4ff;padding:40px;">
        <div style="background:white;padding:28px;border-radius:12px;max-width:520px;">
          <h2 style="color:#16a34a;">💰 Sale Complete!</h2>
          <p>The buyer <b>${offer.userName}</b> has completed payment for <b>${offer.gameTitle}</b>.</p>
          <table style="margin:16px 0;border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px 0;color:#555;"><b>Sale Price:</b></td><td>${offer.offerPrice} USDC</td></tr>
            <tr><td style="padding:6px 0;color:#555;"><b>Offer ID:</b></td><td>${offer.serialNumber}</td></tr>
          </table>
          <p>Funds will be credited to your account as per our payment schedule.</p>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">© ${year} Hyper-Tek Games</p>
        </div>
      </div>`;

    if (offer.userEmail)  await sendEmail(offer.userEmail,  `🎉 Purchase Complete — ${offer.gameTitle}`, buyerHtml);
    if (offer.ownerEmail) await sendEmail(offer.ownerEmail, `💰 Sale Complete — ${offer.gameTitle}`,    sellerHtml);
  } catch (err) {
    console.error("❌ markOfferCompleted error:", err.message);
  }
};

// ============================================================
// ✅ FETCH CONTROLLERS (No email needed)
// ============================================================
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch offers" });
  }
};

const getOffersByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Auto-expire accepted offers past 48-hour deadline
    await Offer.updateMany(
      { ownerId, requestStatus: "accepted", acceptDeadlineAt: { $lt: new Date() } },
      { requestStatus: "cancelled" }
    );

    const offers = await Offer.find({ ownerId }).sort({ createdAt: -1 });
    if (!offers.length)
      return res
        .status(404)
        .json({ success: false, message: "No offers found for this owner" });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch offers" });
  }
};

const getOffersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-expire accepted offers past 48-hour deadline
    await Offer.updateMany(
      { userId, requestStatus: "accepted", acceptDeadlineAt: { $lt: new Date() } },
      { requestStatus: "cancelled" }
    );

    const offers = await Offer.find({ userId }).sort({ createdAt: -1 });
    if (!offers.length)
      return res
        .status(404)
        .json({ success: false, message: "No offers found for this user" });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch offers" });
  }
};

// ============================================================
// ✅ EXPORT
// ============================================================
export {
  createOffer,
  getAllOffers,
  getOffersByOwnerId,
  getOffersByUserId,
  updateRequestStatus,
  updatePaymentStatus,
};
