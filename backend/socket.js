import jwt from "jsonwebtoken";
import Message from "./Models/Message.js";
import ChatRoom from "./Models/ChatRoom.js";
export const socketHandler = (io) => {
  // 🔐 Socket auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`✅ Connected: ${socket.user.id} (${socket.user.role})`);

    /**
     * JOIN ROOM
     * admin → userId required
     * user → adminId required
     */
    socket.on("joinRoom", async ({ userId, adminId }) => {
      try {
        let room;
        if (socket.user.role === "admin") {
          if (!userId) return;

          room = await ChatRoom.findOne({
            adminId: socket.user.id,
            userId
          });

          if (!room) {
            room = await ChatRoom.create({
              adminId: socket.user.id,
              userId
            });
          }
        }

        if (socket.user.role === "user") {
          if (!adminId) return;

          room = await ChatRoom.findOne({
            adminId,
            userId: socket.user.id
          });

          if (!room) {
            room = await ChatRoom.create({
              adminId,
              userId: socket.user.id
            });
          }
        }

        socket.join(room._id.toString());
        socket.emit("roomJoined", room._id);
        console.log(`🟢 Joined room: ${room._id}`);
      } catch (err) {
        console.error("❌ joinRoom error:", err);
      }
    });

    /**
     * SEND MESSAGE (ADMIN & USER SAME LOGIC)
     */
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        if (!roomId || !message) return;

        const room = await ChatRoom.findById(roomId);
        if (!room) return;

        // 🔐 Security check
        if (
          (socket.user.role === "admin" &&
            room.adminId.toString() !== socket.user.id) ||
          (socket.user.role === "user" &&
            room.userId.toString() !== socket.user.id)
        ) {
          return;
        }

        const newMsg = await Message.create({
          roomId,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          message
        });

        io.to(roomId).emit("receiveMessage", newMsg);
      } catch (err) {
        console.error("❌ sendMessage error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.user.id}`);
    });
  });
};