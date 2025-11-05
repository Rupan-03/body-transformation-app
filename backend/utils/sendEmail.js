const Brevo = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: 'BodyTrack App' };
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.subject = options.subject || 'BodyTrack Notification';
    sendSmtpEmail.htmlContent = options.html || options.message || '<p>Hello!</p>';

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent via Brevo API:', response.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
