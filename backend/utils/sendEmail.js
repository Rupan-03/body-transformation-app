const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // IMPORTANT: For production, add these variables to your Render Environment page.
    // For Gmail, you will need to generate a special "App Password".
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `BodyTrack App <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;