// utils/sendEmail.js
const nodemailer = require('nodemailer');
const { renderVerifyEmail, renderPasswordReset } = require('./emailTemplates');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // ✅ explicit for Render (do NOT use service)
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // const transporter = nodemailer.createTransport({
    //   service: process.env.EMAIL_SERVICE || 'gmail',
    //   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    //   port: process.env.EMAIL_PORT || 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });

    // --- Choose what HTML to send ---
    let htmlMessage;

    if (options.html) {
      // ✅ use provided HTML (like in your reset link)
      htmlMessage = options.html;
    } else if (options.type === 'verify') {
      htmlMessage = renderVerifyEmail(options.email, options.otp);
    } else if (options.type === 'reset') {
      htmlMessage = renderPasswordReset(options.email, options.otp);
    } else if (options.message) {
      htmlMessage = options.message;
    } else {
      htmlMessage = '<p>No content provided</p>';
    }

    const mailOptions = {
      from: `BodyTrack App <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject || 'BodyTrack Notification',
      html: htmlMessage, // ✅ always send as HTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${options.email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
