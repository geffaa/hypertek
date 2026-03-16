import { Offer } from "../Models/Offer.js";
import nodemailer from "nodemailer";

// ✅ Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
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
      !gameActualPrice ||
      !offerPrice ||
      !priceDuration ||
      !userId ||
      !userName ||
      !userEmail ||
      !ownerId
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const offer = new Offer({
      serialNumber,
      gameId: String(gameId),       // always store as string — NFT ID, not Game ObjectId
      gameTitle,
      gameActualPrice,
      offerPrice,
      priceDuration,
      userId,
      userName,
      userEmail,
      ownerId: String(ownerId),      // can be wallet address, "platform", or userId string
      ownerName: ownerName || "Platform",
      ownerEmail: ownerEmail || "",
      requestStatus: requestStatus || "pending",
      paymentStatus: paymentStatus || "unpaid",
    });

    await offer.save();

    // ✅ Email for Owner
    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:40px;">
        <div style="background:white; padding:25px; border-radius:10px;">
          <h2>🎮 New Offer Request Received</h2>
          <p>Dear ${ownerName},</p>
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
          <p>Your offer for <b>${gameTitle}</b> has been sent to ${ownerName}.</p>
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

    await sendEmail(ownerEmail, `🎮 New Offer for ${gameTitle}`, ownerEmailHtml);
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
    await offer.save();

    // ✅ Notify both parties
    const subject = `📢 Offer Request Update: ${offer.gameTitle}`;
    const messageHtml = `
      <div style="font-family: Arial; background:#f8f9fa; padding:40px;">
        <div style="background:white; padding:25px; border-radius:10px;">
          <h2>📢 Offer Status Updated</h2>
          <p>Your Offer  for <b>${offer.gameTitle}</b> has been updated to <b>${status}</b>.</p>
          <p>Offer ID: ${offer.serialNumber}</p>
          <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} Hyper-Tek Games</p>
        </div>
      </div>
    `;

    await sendEmail(offer.userEmail, subject, messageHtml);
    await sendEmail(offer.ownerEmail, subject, messageHtml);

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
