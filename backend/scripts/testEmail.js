/**
 * Run: node --env-file=Config/.env scripts/testEmail.js your@email.com
 * Tests the SMTP connection and sends a sample welcome email.
 */

import nodemailer from "nodemailer";
import { welcomeEmailTemplate } from "../utils/emailTemplates.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node --env-file=Config/.env scripts/testEmail.js your@email.com");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

const smtpPass = process.env.SMTP_PASS?.replace(/"/g, "");
console.log("🔧 SMTP config:");
console.log("   Host:", process.env.SMTP_HOST);
console.log("   Port:", process.env.SMTP_PORT);
console.log("   From:", process.env.SMTP_EMAIL);
console.log("   Pass length:", smtpPass?.length, "| First char:", smtpPass?.[0]);
console.log("   To:", to);
console.log("");

// Verify connection first
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
    console.error("\n💡 Common fixes:");
    console.error("   1. Gmail App Password required (not your regular password)");
    console.error("   2. Go to: myaccount.google.com → Security → 2-Step Verification → App passwords");
    console.error("   3. Generate an App Password for 'Mail'");
    console.error("   4. Update SMTP_PASS in Config/.env with the new app password");
    process.exit(1);
  }

  console.log("✅ SMTP connection verified");
  console.log("📧 Sending test welcome email...\n");

  const { subject, html } = welcomeEmailTemplate({
    name: "Test User",
    walletAddress: "0x1ffDD94F595C0ea659C6C363a6b2a25E9b8aC88C",
    privateKey: "0xTEST_KEY_DO_NOT_USE_THIS_IS_A_TEST",
  });

  transporter.sendMail(
    {
      from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `[TEST] ${subject}`,
      html,
    },
    (err, info) => {
      if (err) {
        console.error("❌ Send failed:", err.message);
        process.exit(1);
      }
      console.log("✅ Email sent successfully!");
      console.log("   Message ID:", info.messageId);
      console.log("   Check your inbox at:", to);
    }
  );
});
