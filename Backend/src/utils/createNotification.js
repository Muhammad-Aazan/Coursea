const Notification = require('../models/Notification');

async function createNotification({ recipient, type, title, message, link = '' }) {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (err) {
    // Silent — notification failure should not break main operations
    console.error('Notification creation failed:', err.message);
  }
}

module.exports = createNotification;
