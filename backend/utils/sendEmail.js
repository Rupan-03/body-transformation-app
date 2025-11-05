const nodemailer = require('nodemailer');
const { renderVerifyEmail, renderPasswordReset } = require('./emailTemplates');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let htmlMessage;

    if (options.html) {
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
      html: htmlMessage,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${options.email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
