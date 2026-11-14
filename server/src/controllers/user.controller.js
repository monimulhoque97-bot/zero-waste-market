const UserModel = require('../models/user.model');
const NotificationModel = require('../models/notification.model');
const { sendSuccess, sendError } = require('../utils/response');

const UserController = {
  async getNotifications(req, res, next) {
    try {
      const notifications = await NotificationModel.findByUserId(req.user.id);
      return sendSuccess(res, notifications, 'Notifications fetched successfully.');
    } catch (err) {
      next(err);
    }
  },

  async markNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      await NotificationModel.markAsRead(id, req.user.id);
      return sendSuccess(res, { id, is_read: 1 }, 'Notification marked as read.');
    } catch (err) {
      next(err);
    }
  },

  async markAllNotificationsRead(req, res, next) {
    try {
      await NotificationModel.markAllAsRead(req.user.id);
      return sendSuccess(res, null, 'All notifications marked as read.');
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return sendError(res, 'User not found.', 404);
      return sendSuccess(res, user, 'Profile fetched.');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = UserController;
