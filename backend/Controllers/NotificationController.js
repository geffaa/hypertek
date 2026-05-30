import Notification from "../Models/NotificationModel.js";

// GET /api/v1/notifications  — list for current user (newest first, limit 50)
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/v1/notifications/:id/read  — mark one as read
export const markOneRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateOne(
      { _id: req.params.id, userId },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/v1/notifications/read-all  — mark all as read
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/v1/notifications/:id  — delete one
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.deleteOne({ _id: req.params.id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
