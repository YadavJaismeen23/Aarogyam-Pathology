const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false, // ❗ false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP verify failed:", err);
  } else {
    console.log("✅ SMTP server is ready (Render)");
  }
});

async function sendBookingEmail({ subject, html }) {
  return transporter.sendMail({
    from: `"Aarogyam Lifecare" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject,
    html
  });
}

module.exports = { sendBookingEmail };
