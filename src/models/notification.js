// Notification model
// Handles notifications for live events

const notifications = new Map(); // Map: notificationId -> notification object
const userNotifications = new Map(); // Map: userId -> [notificationIds]

// Format: {
//   id: string,
//   userId: string,
//   type: 'livestream_started' | 'livestream_ended' | 'viewer_joined' | 'viewer_left',
//   relatedUserId: string,
//   relatedUser: { id, name, profilePicture },
//   livestreamId: string,
//   livestreamTitle: string,
//   message: string,
//   createdAt: Date,
//   read: boolean
// }

class NotificationModel {
  // Create notification
  static createNotification(userId, type, data) {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id,
      userId,
      type,
      relatedUserId: data.relatedUserId,
      relatedUserName: data.relatedUserName,
      relatedUserAvatar: data.relatedUserAvatar || null,
      livestreamId: data.livestreamId || null,
      livestreamTitle: data.livestreamTitle || '',
      message: data.message,
      createdAt: new Date(),
      read: false
    };
    
    notifications.set(id, notification);
    
    // Track notifications per user
    if (!userNotifications.has(userId)) {
      userNotifications.set(userId, []);
    }
    userNotifications.get(userId).push(id);
    
    return notification;
  }

  // Get unread notifications for user
  static getUnreadNotifications(userId) {
    const notifIds = userNotifications.get(userId) || [];
    return notifIds
      .map(id => notifications.get(id))
      .filter(notif => notif && !notif.read)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get all notifications for user
  static getNotifications(userId, limit = 20) {
    const notifIds = userNotifications.get(userId) || [];
    return notifIds
      .map(id => notifications.get(id))
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // Mark notification as read
  static markAsRead(notificationId) {
    const notif = notifications.get(notificationId);
    if (notif) {
      notif.read = true;
    }
    return notif;
  }

  // Mark all notifications as read for user
  static markAllAsRead(userId) {
    const notifIds = userNotifications.get(userId) || [];
    notifIds.forEach(id => {
      const notif = notifications.get(id);
      if (notif) {
        notif.read = true;
      }
    });
    return true;
  }

  // Delete notification
  static deleteNotification(notificationId) {
    for (let [userId, notifIds] of userNotifications.entries()) {
      const index = notifIds.indexOf(notificationId);
      if (index > -1) {
        notifIds.splice(index, 1);
      }
    }
    notifications.delete(notificationId);
    return true;
  }

  // Get unread count for user
  static getUnreadCount(userId) {
    const unread = this.getUnreadNotifications(userId);
    return unread.length;
  }

  // Get notification by ID
  static getNotification(notificationId) {
    return notifications.get(notificationId);
  }
}

module.exports = NotificationModel;
