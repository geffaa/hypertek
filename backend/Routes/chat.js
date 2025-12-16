import express from "express";
import ChatRoom from "../Models/ChatRoom.js";
import Message from "../Models/Message.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

/**
 * ================================
 * GET: Admin chats (sidebar)
 * ================================
 */
router.get("/admin/chats", authMiddleware(["admin"]), async (req, res) => {
  try {
    const chats = await ChatRoom.find({ adminId: req.user.id })
      .populate("userId", "name email");

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * ================================
 * GET: Messages of a room
 * ================================
 */
router.get(
  "/messages/:roomId",
  authMiddleware(["admin", "user"]),
  async (req, res) => {
    try {
      const { roomId } = req.params;

      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ msg: "Room not found" });

      // Role based access
      if (
        (req.user.role === "admin" &&
          room.adminId.toString() !== req.user.id) ||
        (req.user.role === "user" &&
          room.userId.toString() !== req.user.id)
      ) {
        return res.status(403).json({ msg: "Access denied" });
      }

      const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * ================================
 * POST: Send message (POSTMAN)
 * ================================
 */
router.post(
  "/message",
  authMiddleware(["admin", "user"]),
  async (req, res) => {
    try {
      const { roomId, message } = req.body;

      if (!roomId || !message) {
        return res.status(400).json({ msg: "roomId & message required" });
      }

      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ msg: "Room not found" });

      // Role based access
      if (
        (req.user.role === "admin" &&
          room.adminId.toString() !== req.user.id) ||
        (req.user.role === "user" &&
          room.userId.toString() !== req.user.id)
      ) {
        return res.status(403).json({ msg: "Access denied" });
      }

      const newMessage = await Message.create({
        roomId,
        senderId: req.user.id,
        senderRole: req.user.role,
        message
      });

      res.json({
        success: true,
        message: "Message sent",
        data: newMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// TEMP – create room
router.post(
  "/create-room",
  authMiddleware(["admin"]),
  async (req, res) => {
    const { userId } = req.body;

    let room = await ChatRoom.findOne({
      adminId: req.user.id,
      userId
    });

    if (!room) {
      room = await ChatRoom.create({
        adminId: req.user.id,
        userId
      });
    }

    res.json(room);
  }
);


export default router;
