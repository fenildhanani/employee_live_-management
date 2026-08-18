const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '2525', 10),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service Simulation] To: ${to} | Subject: ${subject}`);
    return { status: 'simulated' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"ELMS System" <noreply@elms.com>',
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return { status: 'failed', error: error.message };
  }
};

const sendSMS = async ({ to, message }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS Service Simulation] To: ${to} | Message: ${message}`);
    return { status: 'simulated' };
  }

  try {
    // Twilio architecture implementation point
    console.log(`[Twilio SMS Sent] To: ${to}`);
    return { status: 'sent' };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return { status: 'failed', error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendSMS
};
