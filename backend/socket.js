import jwt from "jsonwebtoken";
import Message from "./Models/Message.js";
import ChatRoom from "./Models/ChatRoom.js";

export const socketHandler = (io) => {
  // 🔐 Socket auth - Updated to handle admin data
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const adminId = socket.handshake.auth?.adminId;
    const role = socket.handshake.auth?.role;

    console.log("🔍 Socket Auth - Token:", token ? "Present" : "Missing");
    console.log("🔍 Socket Auth - Admin ID:", adminId);
    console.log("🔍 Socket Auth - Role:", role);

    // Allow connection with admin credentials
    if (adminId && role) {
      socket.user = {
        id: adminId,
        role: role.toLowerCase()
      };
      console.log("Socket authenticated with admin credentials");
      return next();
    }

    // Fallback to JWT token validation
    if (!token) {
      console.error(" No token or admin credentials provided");
      return next(new Error("No token or admin credentials"));
    }

    try {
      // Try JWT verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded._id || decoded.id,
        role: (decoded.role || decoded.Role || decoded.userRole || "user").toLowerCase()
      };
      console.log("Socket authenticated with JWT");
      next();
    } catch (err) {
      // Try base64 decode (temporary token)
      try {
        const decoded = JSON.parse(atob(token));
        socket.user = {
          id: decoded.id || decoded._id,
          role: (decoded.role || decoded.Role || "user").toLowerCase()
        };
        console.log("⚠️ Socket authenticated with temporary token");
        next();
      } catch (decodeErr) {
        console.error(" Invalid token:", err.message);
        next(new Error("Invalid token"));
      }
    }
  });

  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.user.id} (${socket.user.role})`);

    /**
     * JOIN ROOM
     * admin → userId required
     * user → adminId required
     */
    socket.on("joinRoom", async ({ userId, adminId }) => {
      try {
        let room;

        console.log("🔄 Join room request:", {
          userRole: socket.user.role,
          userId,
          adminId,
          socketUserId: socket.user.id
        });

        if (socket.user.role === "admin") {
          if (!userId) {
            console.error(" Admin join room: userId missing");
            return;
          }

          // Check if room exists
          room = await ChatRoom.findOne({
            adminId: socket.user.id,
            userId
          });

          // Create room if doesn't exist
          if (!room) {
            room = await ChatRoom.create({
              adminId: socket.user.id,
              userId
            });
            console.log("✨ New room created:", room._id);
          } else {
            console.log("📂 Existing room found:", room._id);
          }
        }

        if (socket.user.role === "user") {
          if (!adminId) {
            console.error(" User join room: adminId missing");
            return;
          }

          // Check if room exists
          room = await ChatRoom.findOne({
            adminId,
            userId: socket.user.id
          });

          // Create room if doesn't exist
          if (!room) {
            room = await ChatRoom.create({
              adminId,
              userId: socket.user.id
            });
            console.log("✨ New room created:", room._id);
          } else {
            console.log("📂 Existing room found:", room._id);
          }
        }

        if (room) {
          socket.join(room._id.toString());
          socket.emit("roomJoined", room._id);
          console.log(`🟢 ${socket.user.role} joined room: ${room._id}`);
        }
      } catch (err) {
        console.error(" joinRoom error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    /**
     * SEND MESSAGE (ADMIN & USER SAME LOGIC)
     */
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        console.log("📤 Send message request:", {
          roomId,
          message: message.substring(0, 50),
          senderId: socket.user.id,
          senderRole: socket.user.role
        });

        if (!roomId || !message) {
          console.error(" Missing roomId or message");
          return;
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          console.error(" Room not found:", roomId);
          return;
        }

        // 🔐 Security check
        const isAdmin = socket.user.role === "admin" &&
          room.adminId.toString() === socket.user.id;
        const isUser = socket.user.role === "user" &&
          room.userId.toString() === socket.user.id;

        if (!isAdmin && !isUser) {
          console.error(" Access denied:", {
            userRole: socket.user.role,
            userId: socket.user.id,
            roomAdminId: room.adminId,
            roomUserId: room.userId
          });
          return;
        }

        // Create message
        const newMsg = await Message.create({
          roomId,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          message
        });

        console.log("Message saved:", newMsg._id);

        // Broadcast to room
        io.to(roomId).emit("receiveMessage", newMsg);
        console.log("📨 Message broadcasted to room:", roomId);
      } catch (err) {
        console.error(" sendMessage error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.user.id} (${socket.user.role})`);
    });
  });
};