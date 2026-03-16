import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: "info@hypertek100.com",
    pass: "Hyp3r@HT123"
  }
});

transporter.sendMail({
  from: "info@hypertek100.com",
  to: "yodhimas02@gmail.com",
  subject: "HyperTek SMTP Test",
  text: "SMTP is working correctly."
}).then(r => console.log("SUCCESS:", r.messageId)).catch(e => console.error("ERROR:", e.message));
