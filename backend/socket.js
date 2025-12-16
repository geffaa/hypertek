import jwt from "jsonwebtoken";
import Message from "./Models/Message.js";
import ChatRoom from "./Models/ChatRoom.js";

export const socketHandler = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      console.log("❌ Invalid socket token:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id} | User: ${socket.user.id} (${socket.user.role})`);

    // ---------------- JOIN ROOM ----------------
    socket.on("joinRoom", async ({ userId, adminId }) => {
      try {
        let room;

        if (socket.user.role === "admin") {
          // Admin clicks on user → find/create room
          room = await ChatRoom.findOne({ adminId: socket.user.id, userId });
          if (!room) room = await ChatRoom.create({ adminId: socket.user.id, userId });
        } else {
          // User → fixed admin
          room = await ChatRoom.findOne({ userId: socket.user.id });
          if (!room && adminId) {
            room = await ChatRoom.create({ adminId, userId: socket.user.id });
          }
        }

        if (room) {
          socket.join(room._id.toString());
          console.log(`🟢 Socket ${socket.id} joined room ${room._id}`);
          socket.emit("roomJoined", room._id);
        }
      } catch (err) {
        console.error("❌ Error joining room:", err);
      }
    });

    // ---------------- SEND MESSAGE ----------------
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        if (!roomId || !message) return;

        const newMsg = await Message.create({
          roomId,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          message
        });

        // Emit message to all clients in this room
        io.to(roomId).emit("receiveMessage", newMsg);
      } catch (err) {
        console.error("❌ Error sending message:", err);
      }
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id} | User: ${socket.user.id}`);
    });
  });
};
