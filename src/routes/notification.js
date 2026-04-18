const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// GET - Get unread notifications for user
router.get('/unread/:userId', NotificationController.getUnreadNotifications);

// GET - Get all notifications for user
router.get('/:userId', NotificationController.getNotifications);

// GET - Get unread count
router.get('/count/:userId', NotificationController.getUnreadCount);

// POST - Mark notification as read
router.post('/read', NotificationController.markAsRead);

// POST - Mark all as read
router.post('/read-all/:userId', NotificationController.markAllAsRead);

// DELETE - Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

module.exports = router;
