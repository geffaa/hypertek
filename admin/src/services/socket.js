// src/services/socket.js
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4700"; // backend server URL

let socket;

export const initiateSocket = (token) => {
  socket = io(SERVER_URL, {
    auth: { token }
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;
