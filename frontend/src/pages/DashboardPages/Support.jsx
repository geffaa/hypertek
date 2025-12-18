import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ChatImage from "../../assets/chat.png";
import Icon1 from "../../assets/images/Support/icon1.png";
import Icon2 from "../../assets/images/Support/icon2.png";
import Icon3 from "../../assets/images/Support/icon3.png";
import Icon4 from "../../assets/images/Support/icon4.png";
import SendIcon from "../../assets/images/Support/sendIcon.png";
import {BACKEND_BASE_URL} from "../../Config";

// ------------------------ SOCKET CONNECTION ------------------------
const socket = io(BACKEND_BASE_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

function Support() {
  const [adminId, setAdminId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // ------------------------ SCROLL TO BOTTOM ------------------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ------------------------ INIT CHAT ------------------------
useEffect(() => {
  const initChat = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/chat/get-support-admin`); // full URL
      console.log("Support admin response:", res.data);

      const adminUserId = res.data.adminId || (res.data._id && res.data._id); // fallback

      if (!adminUserId) return console.error("Admin ID not found!");

      setAdminId(adminUserId);

      // Join room
      socket.emit("joinRoom", { adminId: adminUserId });

      socket.on("roomJoined", (room) => {
        setRoomId(room);
        fetchMessages(room);
      });
    } catch (err) {
      console.error("Init chat error:", err);
    }
  };

  initChat();

  return () => {
    socket.off("roomJoined");
  };
}, []);


  // ------------------------ FETCH MESSAGES ------------------------
  const fetchMessages = async (room) => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/chat/messages/${room}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // ------------------------ RECEIVE SOCKET MESSAGES ------------------------
 useEffect(() => {
  const receiveMessageHandler = (msg) => {
    setMessages((prev) => {
      // ignore if message already exists
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  socket.on("receiveMessage", receiveMessageHandler);

  return () => {
    socket.off("receiveMessage", receiveMessageHandler);
  };
}, [roomId]);


  // ------------------------ SEND MESSAGE ------------------------
  const handleSendMessage = () => {
  if (!text.trim() || !roomId) return;

  const messagePayload = {
    roomId,
    message: text,
  };

  // Emit message to backend
  socket.emit("sendMessage", messagePayload);

  // Clear input
  setText("");
};


  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="flex min-h-screen bg-black p-4">
      {/* Left Sidebar */}
      <div className="flex flex-col w-[304px] min-h-[750px] border-2 border-[#1E1E1E] gap-4 p-2">
        <div className="flex items-center justify-between gap-2 h-[45px] my-2 cursor-pointer p-2 rounded bg-gray-800">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <div className="flex flex-col flex-1 justify-center gap-0.5">
            <h1 className="font-inter font-semibold text-[14px] text-[#414651] m-0">
              Customer Support
            </h1>
            <p className="font-inter font-medium text-[12px] text-[#757285] m-0">
              Admin Team
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1">
              <div className="w-[4px] h-[4px] rounded-full bg-[#00ff00]"></div>
              <div className="w-[4px] h-[4px] rounded-full bg-[#00ff00]"></div>
              <div className="w-[4px] h-[4px] rounded-full bg-[#00ff00]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Chat */}
      <div className="flex flex-col w-[554px] h-[846px] px-4">
        <div className="flex items-center gap-2 w-full h-[50px] border-b border-white">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <p className="font-inter font-medium text-white">
            Customer Support - Online
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-4 overflow-y-auto flex-1 pr-2">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              Start a conversation with support team
            </p>
          ) : (
            messages.map((msg) =>
              msg.senderRole === "user" ? (
                <div key={msg._id} className="flex justify-end gap-3 items-end">
                  <div className="flex flex-col max-w-[401px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
                    <p className="font-inter font-medium text-[12px] leading-4">
                      {msg.message}
                    </p>
                    <p className="text-right font-inter font-medium text-[12px] leading-4">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                  <img
                    src={ChatImage}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              ) : (
                <div
                  key={msg._id}
                  className="flex flex-col max-w-[401px] bg-[#F3F4F6] rounded-tr-[12px] rounded-tl-[12px] rounded-br-[12px] p-3 gap-2"
                >
                  <p className="font-inter font-medium text-[12px] leading-4 text-black">
                    {msg.message}
                  </p>
                  <p className="font-inter font-medium text-[12px] leading-4 text-right text-[#797782]">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              )
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex flex-col rounded-xl justify-between bg-gray-50 w-[512px] h-[144px] border border-[#EDEDED]">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="m-5 w-full text-black font-inter font-medium text-[12px] leading-4 rounded px-1 py-0.5 outline-none bg-transparent"
          />
          <div className="w-full flex justify-between items-center">
            <div className="m-5 w-[100px] h-[16px] flex gap-[12px]">
              <img src={Icon1} alt="" className="w-[16px] h-[16px]" />
              <img src={Icon2} alt="" className="w-[16px] h-[16px]" />
              <img src={Icon3} alt="" className="w-[16px] h-[16px]" />
              <img src={Icon4} alt="" className="w-[16px] h-[16px]" />
            </div>
            <button
              onClick={handleSendMessage}
              className="cursor-pointer flex items-center m-5 gap-2 justify-center w-[70px] h-[29px] bg-[#1D7AD6] rounded-[6px]"
            >
              <h1 className="font-inter font-semibold text-[12px] leading-[14px] text-white">
                Send
              </h1>
              <img src={SendIcon} alt="" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Info */}
      <div className="w-[160px] rounded-lg p-2">
        <div className="flex justify-between items-center mb-2">
          <img src={ChatImage} alt="User" className="w-8 h-8 rounded-full" />
          <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-white">
            Support Team
          </h1>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-gray-400">
            Status
          </h1>
          <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-green-400">
            Online
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Support;
