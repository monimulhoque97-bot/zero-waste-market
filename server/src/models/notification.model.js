const db = require('../config/database');

const NotificationModel = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return rows;
  },

  async create({ user_id, title, message, type = 'system' }) {
    const [res] = await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [user_id, title, message, type]
    );
    return res.insertId;
  },

  async markAsRead(id, userId) {
    const [res] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return res.affectedRows;
  },

  async markAllAsRead(userId) {
    const [res] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return res.affectedRows;
  },
};

module.exports = NotificationModel;
