const NotificationModel = require('../models/notification');

class NotificationController {
  // Get unread notifications for user
  static getUnreadNotifications(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'userId harus diisi'
        });
      }

      const notifications = NotificationModel.getUnreadNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all notifications for user
  static getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: 'userId harus diisi'
        });
      }

      const notifications = NotificationModel.getNotifications(userId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Mark notification as read
  static markAsRead(req, res) {
    try {
      const { notificationId } = req.body;

      if (!notificationId) {
        return res.status(400).json({
          error: 'notificationId harus diisi'
        });
      }

      const notification = NotificationModel.markAsRead(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notifikasi tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notifikasi ditandai sebagai sudah dibaca',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Mark all notifications as read for user
  static markAllAsRead(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'userId harus diisi'
        });
      }

      NotificationModel.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'Semua notifikasi ditandai sebagai sudah dibaca'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get unread count
  static getUnreadCount(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'userId harus diisi'
        });
      }

      const count = NotificationModel.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        unreadCount: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete notification
  static deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({
          error: 'notificationId harus diisi'
        });
      }

      NotificationModel.deleteNotification(notificationId);

      res.status(200).json({
        success: true,
        message: 'Notifikasi dihapus'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
