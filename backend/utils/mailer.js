const nodemailer = require('nodemailer');

// Expects env vars:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
// For Gmail, use SMTP_HOST=smtp.gmail.com, SMTP_PORT=465 and an app password

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  return tx.sendMail({ from, to, subject, html, text });
}

module.exports = { sendMail };
