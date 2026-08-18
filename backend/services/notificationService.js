const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');
const User = require('../models/User');

const createNotification = async ({ company, user, title, message, type = 'system', referenceId = null }) => {
  try {
    const notification = await Notification.create({
      company,
      user,
      title,
      message,
      type,
      referenceId
    });

    const recipient = await User.findById(user);
    if (recipient && recipient.email) {
      await sendEmail({
        to: recipient.email,
        subject: `[ELMS] ${title}`,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">${title}</h2>
          <p style="font-size: 16px; line-height: 1.5;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Employee Leave Management System (ELMS)</p>
        </div>`
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

module.exports = { createNotification };
