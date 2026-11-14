const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/profile', authenticateToken, UserController.getProfile);
router.get('/notifications', authenticateToken, UserController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, UserController.markNotificationRead);
router.post('/notifications/mark-all-read', authenticateToken, UserController.markAllNotificationsRead);

module.exports = router;
