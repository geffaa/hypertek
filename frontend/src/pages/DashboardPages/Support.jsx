import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ChatImage from "../../assets/icon.png";
import SendIcon from "../../assets/images/Support/sendIcon.png";
import { BACKEND_BASE_URL } from "../../Config";

function Support() {
  const [adminId, setAdminId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const socketRef = useRef(null); // Use ref for socket
  const token = localStorage.getItem("token");

  // ------------------------ SCROLL TO BOTTOM ------------------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ------------------------ AUTO RESIZE TEXTAREA ------------------------
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // ------------------------ INIT SOCKET & CHAT ------------------------
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(BACKEND_BASE_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    const socket = socketRef.current;

    const initChat = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/chat/get-support-admin`
        );

        const adminUserId = res.data.adminId || res.data?._id;
        if (!adminUserId) return;

        setAdminId(adminUserId);
        socket.emit("joinRoom", { adminId: adminUserId });

        socket.on("roomJoined", (room) => {
          setRoomId(room);
          fetchMessages(room);
        });

        // Set up receive message listener
        socket.on("receiveMessage", (msg) => {
          setMessages((prev) =>
            prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
          );
        });

      } catch (err) {
        console.error("Init chat error:", err);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("roomJoined");
        socketRef.current.off("receiveMessage");
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array - runs once on mount

  // ------------------------ FETCH MESSAGES ------------------------
  const fetchMessages = async (room) => {
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/chat/messages/${room}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------ SEND MESSAGE ------------------------
  const handleSendMessage = () => {
    if (!text.trim() || !roomId || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      roomId,
      message: text,
    });

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ------------------------ KEY HANDLING (Slack Style) ------------------------
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="flex bg-black">
      <div className="flex flex-col w-full max-w-[1100px] h-[480px] px-4">
        
        {/* Header */}
        <div className="flex items-center gap-2 h-[50px] border-b border-white">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <p className="font-inter font-medium text-white">
             Online
          </p>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto flex-1 pr-2">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              Start a conversation with our support team
            </p>
          ) : (
            messages.map((msg) =>
              msg.senderRole === "user" ? (
                <div key={msg._id} className="flex justify-end gap-3 items-end">
                  <div className="max-w-[401px] bg-[#1D7AD6] p-3 rounded-xl text-white">
                    <p className="text-[12px] whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p className="text-right text-[11px] mt-1">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                  <img src={ChatImage} className="w-8 h-8 rounded-full" />
                </div>
              ) : (
                <div key={msg._id} className="max-w-[401px] text-black bg-[#F3F4F6] p-3 rounded-xl">
                  <p className="text-[12px] whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <p className="text-right text-[11px] text-gray-500 mt-1">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              )
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Slack-style Input */}
        <div className="mt-4 bg-gray-50 border border-[#EDEDED] rounded-xl p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Ctrl + Enter to send)"
            className="w-full resize-none bg-transparent outline-none text-black text-[13px] leading-5 max-h-[120px] overflow-y-auto"
          />

          <div className="flex justify-end mt-2">
            <button
              onClick={handleSendMessage}
              className="flex items-center gap-2 px-4 h-[32px] bg-[#1D7AD6] rounded-md"
            >
              <span className="text-white text-[12px] font-semibold">
                Send
              </span>
              <img src={SendIcon} className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Support;
