// Add this to your chat routes file (Routes/chat.js)

import express from "express";
import ChatRoom from "../Models/ChatRoom.js";
import Message from "../Models/Message.js";
import User from "../Models/User.js"; // Your User model
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

/**
 * ================================
 * GET: Get Support Admin ID (for users)
 * ================================
 */
router.get("/get-support-admin", async (req, res) => {
  try {
    // Find the first admin user
    const admin = await User.findOne({ Role: "admin" });
    // console.log("Found Admin:", admin);
    if (!admin) {
      return res.status(404).json({ msg: "No admin found" });
    }

    res.json({ adminId: admin._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * ================================
 * GET: Admin chats (sidebar)
 * ================================
 */
router.get("/admin/chats", authMiddleware(["admin"]), async (req, res) => {
  try {
    const chats = await ChatRoom.find({ adminId: req.user.id })
      .populate("userId", "name email")
      .sort({ updatedAt: -1 }); // Latest first
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
 * POST: Send message (REST API fallback)
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

/**
 * ================================
 * POST: User sends first message to admin
 * ================================
 */
router.post(
  "/user/message",
  authMiddleware(["user"]),
  async (req, res) => {
    try {
      const { adminId, message } = req.body;
      
      if (!adminId || !message) {
        return res.status(400).json({ msg: "adminId & message required" });
      }

      // Find or create room
      let room = await ChatRoom.findOne({
        adminId,
        userId: req.user.id
      });

      if (!room) {
        room = await ChatRoom.create({
          adminId,
          userId: req.user.id
        });
      }

      // Create message
      const newMessage = await Message.create({
        roomId: room._id,
        senderId: req.user.id,
        senderRole: "user",
        message
      });

      res.json({
        success: true,
        roomId: room._id,
        data: newMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * ================================
 * POST: Create room (Admin only)
 * ================================
 */
router.post(
  "/create-room",
  authMiddleware(["admin"]),
  async (req, res) => {
    try {
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

export default router;