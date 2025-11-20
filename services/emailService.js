const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",   // or use host, port, secure for other providers
  auth: {
    user: "jadavdeep560@gmail.com",        // replace
    pass: "ersi xqqy lszo dgks",           // Gmail App Password (NOT normal password)
  },
});

async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: '"Lavish Family" <your-email@gmail.com>',
      to: email,
      subject: "Welcome to Lavish Family 🎉",
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for joining <strong>Lavish Family</strong>! ❤️</p>
        <p>We are very happy to have you onboard.</p>
        <br>
        <p>Regards,<br>Lavish Team</p>
      `,
    });

    console.log("Welcome email sent!");
  } catch (error) {
    console.log("Email sending error:", error);
  }
}

module.exports = sendWelcomeEmail
