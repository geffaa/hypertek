import Waitlist from "../Models/Waitlist.js";
import nodemailer from "nodemailer";

// ------------------ SMTP TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

export const createWaitlistEntry = async (req, res) => {
  try {
    const { name, email, excitement, interest, mustPlay, crowdfunding } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "This email is already on the waitlist" });
    }

    const entry = await Waitlist.create({ name, email, excitement, interest, mustPlay, crowdfunding });
    return res.status(201).json({ message: "Successfully joined the waitlist", data: entry });
  } catch (err) {
    console.error("Waitlist error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWaitlistEntries = async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 });
    return res.json({ total: entries.length, data: entries });
  } catch (err) {
    console.error("Waitlist fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateWaitlistRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["standard", "early_access", "investor", "crowdfund"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const entry = await Waitlist.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    return res.json({ message: "Role updated successfully", data: entry });
  } catch (err) {
    console.error("Waitlist role update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const exportWaitlistCSV = async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 });

    const headers = ["No", "Name", "Email", "Excitement", "Interest", "Must Play", "Crowdfunding Interest", "Role", "Joined At"];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = entries.map((entry, index) => [
      index + 1,
      escapeCSV(entry.name),
      escapeCSV(entry.email),
      escapeCSV(entry.excitement),
      escapeCSV(entry.interest),
      escapeCSV(entry.mustPlay),
      escapeCSV(entry.crowdfunding),
      escapeCSV(entry.role),
      escapeCSV(entry.createdAt ? new Date(entry.createdAt).toISOString() : ""),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, "_").replace(/:/g, "-").slice(0, 19);
    const filename = `waitlist-${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    return res.status(200).send(csvContent);
  } catch (err) {
    console.error("Waitlist CSV export error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendWaitlistNotification = async (req, res) => {
  try {
    const { subject, message, roles } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    let query = {};
    if (roles && Array.isArray(roles) && roles.length > 0) {
      query.role = { $in: roles };
    }

    const entries = await Waitlist.find(query).select("email name");

    if (entries.length === 0) {
      return res.status(404).json({ message: "No entries found for the selected roles" });
    }

    const emailPromises = entries.map((entry) =>
      transporter.sendMail({
        from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
        to: entry.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #002AA8;">Hi ${entry.name},</h2>
            <div>${message.replace(/\n/g, "<br/>")}</div>
            <br/>
            <p style="color: #666; font-size: 12px;">You are receiving this because you are on the HyperTek waitlist.</p>
          </div>
        `,
      })
    );

    await Promise.all(emailPromises);

    return res.json({
      message: `Notification sent successfully to ${entries.length} recipient(s)`,
      count: entries.length,
    });
  } catch (err) {
    console.error("Waitlist notification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
