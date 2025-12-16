import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  senderRole: { type: String, enum: ["admin", "user"] },
  message: String
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
