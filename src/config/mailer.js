const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("Mailer connection error:", err.message);
  } else {
    console.log("Mailer ready");
  }
});

module.exports = transporter;
