import Notification from "../Models/NotificationModel.js";

/**
 * Create a notification for a user.
 * @param {string|ObjectId} userId
 * @param {string} type  — one of the enum values in NotificationModel
 * @param {string} title
 * @param {string} message
 * @param {object} [opts]  { link, meta }
 */
export async function createNotification(userId, type, title, message, opts = {}) {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      link: opts.link || "",
      meta: opts.meta || {},
    });
    // Trim to latest 100 per user (fire-and-forget)
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(100)
      .select("_id")
      .lean()
      .then((old) => {
        if (old.length > 0) {
          Notification.deleteMany({ _id: { $in: old.map((d) => d._id) } }).catch(() => {});
        }
      });
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
}
