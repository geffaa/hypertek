// src/services/socket.js
import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../Config";

let socket;

export const initiateSocket = (token) => {
  socket = io(BACKEND_BASE_URL, {
    auth: { token }
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;