const nodemailer = require("nodemailer");

//SHORT VERISON : this function executes the welcome message email
// Creating a transporter that will connect to Gmail and allow us to send emails
const transporter = nodemailer.createTransport({
  service: "gmail",   // Using Gmail service to send emails
  auth: {             
    user: "jadavdeep560@gmail.com",        // Your Gmail address
    pass: "ersi xqqy lszo dgks",           // Your Gmail App Password (NOT your normal Gmail password)
  },
});

// This function receives 'email' and 'name' from the register function, and the transporter uses these values inside the await to send a welcome email.
async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: '"Lavish Family" <your-email@gmail.com>',  // Sender name and email
      to: email,                                       // Receiver's email
      subject: "Welcome to Lavish Family 🎉",          // Email subject
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

module.exports = sendWelcomeEmail;
