import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import ChatImage from "../assets/chat.png";
import Icon1 from "../assets/Support/icon1.png";
import Icon2 from "../assets/Support/icon2.png";
import Icon3 from "../assets/Support/icon3.png";
import Icon4 from "../assets/Support/icon4.png";
import SendIcon from "../assets/Support/sendIcon.png";

function Support() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 🔥 Get admin data from Redux persist
  const adminState = useSelector((state) => state.admin);

  // 🔥 Extract admin info and generate token
  useEffect(() => {
    try {
      let adminData = null;
      
      // Method 1: Direct from Redux state
      if (adminState?.admin) {
        adminData = typeof adminState.admin === 'string' 
          ? JSON.parse(adminState.admin) 
          : adminState.admin;
      }
      
      // Method 2: From localStorage persist:admin
      if (!adminData) {
        const persistedAdmin = localStorage.getItem('persist:admin');
        if (persistedAdmin) {
          const parsed = JSON.parse(persistedAdmin);
          if (parsed.admin) {
            adminData = JSON.parse(parsed.admin);
          }
        }
      }

      console.log("🔍 Admin Data Found:", adminData);
      
      if (adminData) {
        setAdminInfo(adminData);
      }
    } catch (err) {
      console.error("❌ Error parsing admin data:", err);
    }
  }, [adminState]);

  // 🔥 Generate JWT token for socket/API (temporary solution)
  const getAuthToken = () => {
    // Check if token exists in localStorage
    let token = localStorage.getItem("token") || localStorage.getItem("authToken");
    
    // If no token but admin info exists, create a basic auth header
    if (!token && adminInfo) {
      // Backend ko admin ID bhejne ke liye temporary token
      token = btoa(JSON.stringify({
        id: adminInfo._id,
        role: adminInfo.Role,
        email: adminInfo.Email
      }));
      console.log("⚠️ Using temporary token. Backend should validate properly.");
    }
    
    return token;
  };

  const token = getAuthToken();

  // 🔥 Initialize Socket with admin ID
  useEffect(() => {
    if (!adminInfo) {
      console.error("❌ No admin info found for socket connection");
      return;
    }

    console.log("🔌 Initializing socket with admin:", adminInfo._id);

    const newSocket = io("https://api-hyper-tek-games.deventiatech.com", {
      auth: {
        token: token,
        adminId: adminInfo._id,
        role: adminInfo.Role
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      console.log("👤 Admin ID:", adminInfo._id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [adminInfo, token]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ===============================
     FETCH ADMIN CHATS
  =============================== */
  useEffect(() => {
    const fetchChats = async () => {
      if (!token || !adminInfo) {
        console.error("❌ No auth info available for fetching chats");
        return;
      }

      try {
        const res = await axios.get("https://api-hyper-tek-games.deventiatech.com/api/v1/chat/admin/chats", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-Admin-Id': adminInfo._id
          },
        });
        console.log("✅ Chats fetched:", res.data);
        setChats(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Fetch chats error:", err.response?.data || err.message);
        setChats([]);
      }
    };

    if (token && adminInfo) fetchChats();
  }, [token, adminInfo]);

  /* ===============================
     FETCH MESSAGES WHEN CHAT SELECTED
  =============================== */
  useEffect(() => {
    if (!selectedChat || !token || !socket || !adminInfo) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://api-hyper-tek-games.deventiatech.com/api/v1/chat/messages/${selectedChat._id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'X-Admin-Id': adminInfo._id
            },
          }
        );
        console.log("✅ Messages fetched:", res.data);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Fetch messages error:", err.response?.data || err.message);
      }
    };

    fetchMessages();

    // Join socket room for admin
    socket.emit("joinRoom", {
      userId: selectedChat.userId?._id,
      adminId: adminInfo._id
    });

    console.log("🟢 Joined room - Admin:", adminInfo._id, "User:", selectedChat.userId?._id);
  }, [selectedChat, token, socket, adminInfo]);

  /* ===============================
     SOCKET LISTENER FOR NEW MESSAGES
  =============================== */
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      console.log("📩 Message received:", msg);
      if (msg.roomId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("roomJoined", (roomId) => {
      console.log("✅ Room joined:", roomId);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("roomJoined");
    };
  }, [socket, selectedChat]);

  /* ===============================
     SEND MESSAGE
  =============================== */
  const handleSendMessage = () => {
    if (!text.trim() || !selectedChat || !socket) return;

    console.log("📤 Sending message:", {
      roomId: selectedChat._id,
      message: text,
    });

    socket.emit("sendMessage", {
      roomId: selectedChat._id,
      message: text,
    });

    setText("");
  };

  const handleChatClick = (chat) => {
    console.log("💬 Chat selected:", chat);
    setSelectedChat(chat);
    setMessages([]); // Clear messages when switching
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 🚨 Show warning if no admin info
  if (!adminInfo) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">⚠️ Authentication Required</h1>
          <p>Please login as admin to access support chat.</p>
          <p className="text-sm text-gray-400 mt-2">Admin data not found in Redux store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black p-4 relative overflow-hidden">
      <div
        style={{
          top: "20px",
          left: "360px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      <div
        style={{
          top: "810px",
          left: "960px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Left Sidebar - User List */}
      <div className="flex flex-col w-[304px] h-[846px] border-2 border-[#1E1E1E] gap-4 p-2 overflow-y-auto flex-shrink-0 bg-black">
        <div className="text-white text-xs p-2 bg-gray-800 rounded mb-2 flex-shrink-0">
          <p>👤 Admin: {adminInfo.FullName}</p>
          <p className="text-gray-400">{adminInfo.Email}</p>
        </div>

        {chats.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-4">
            No conversations yet
          </p>
        )}

        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`flex items-center justify-between gap-2 min-h-[45px] my-2 cursor-pointer p-2 rounded flex-shrink-0 ${
              selectedChat?._id === chat._id ? "bg-gray-800" : ""
            }`}
            onClick={() => handleChatClick(chat)}
          >
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex flex-col flex-1 justify-center gap-0.5 min-w-0">
              <h1 className="font-inter font-semibold text-[14px] text-[#414651] m-0">
                {chat.userId?.FullName || "User"}
              </h1>
              <p className="font-inter font-medium text-[12px] text-[#757285] m-0 truncate">
                {chat.userId?.Email || ""}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="flex gap-1">
                <div className="w-[4px] h-[4px] rounded-full bg-[#a19e9e]"></div>
                <div className="w-[4px] h-[4px] rounded-full bg-[#a6a0a0]"></div>
                <div className="w-[4px] h-[4px] rounded-full bg-[#b8b4b4]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center Chat Area */}
      <div className="flex flex-col w-[554px] h-[846px] px-4 flex-shrink-0">
        {/* Top Status - Absolute positioned at top */}
        <div className="flex items-center gap-2 w-full min-h-[50px] border-b border-white flex-shrink-0 bg-black pb-2">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <p className="font-inter font-medium text-white">
            {selectedChat
              ? `${selectedChat.userId?.FullName || "User"} - Online`
              : "Select a chat"}
          </p>
        </div>

        {/* Chat Messages Container - Calculate proper height */}
        <div 
          ref={chatContainerRef}
          className="flex flex-col gap-4 py-4 overflow-y-auto pr-2"
          style={{ 
            height: 'calc(846px - 50px - 144px - 16px)', // Total height - header - input - padding
            maxHeight: 'calc(846px - 50px - 144px - 16px)'
          }}
        >
          {!selectedChat ? (
            <p className="text-gray-400 text-center mt-10">
              Select a user to start chatting
            </p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) =>
              msg.senderRole === "admin" ? (
                // Admin Message (Right)
                <div key={msg._id} className="flex justify-end gap-3 items-end flex-shrink-0">
                  <div className="flex flex-col max-w-[401px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
                    <p className="font-inter font-medium text-[12px] leading-4 break-words">
                      {msg.message}
                    </p>
                    <p className="text-right font-inter font-medium text-[12px] leading-4">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                  <img src={ChatImage} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                </div>
              ) : (
                // User Message (Left)
                <div key={msg._id} className="flex flex-col max-w-[401px] bg-[#F3F4F6] rounded-tr-[12px] rounded-tl-[12px] rounded-br-[12px] p-3 gap-2 flex-shrink-0">
                  <p className="font-inter font-medium text-[12px] leading-4 text-black break-words">
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

        {/* Input Area - Fixed at bottom */}
        {selectedChat && (
          <div className="flex flex-col rounded-xl justify-between bg-gray-50 w-[512px] h-[144px] border border-[#EDEDED] flex-shrink-0">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder='Type your message...'
              className="m-5 w-full text-black font-inter font-medium text-[12px] leading-4 rounded px-1 py-0.5 outline-none bg-transparent"
            />

            <div className="w-full flex justify-between items-center">
              {/* Left Icons */}
              <div className="m-5 w-[100px] h-[16px] flex gap-[12px]">
                <button className="cursor-pointer">
                  <img src={Icon1} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon2} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon3} alt="" className="w-[16px] h-[16px]" />
                </button>
                <button className="cursor-pointer">
                  <img src={Icon4} alt="" className="w-[16px] h-[16px]" />
                </button>
              </div>

              {/* Send Button */}
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
        )}
      </div>

      {/* Right Side - User Details */}
      <div className="w-[160px] rounded-lg p-2 flex-shrink-0">
        {selectedChat && (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <img src={ChatImage} alt="User" className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex items-center">
                <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-white">
                  User Details
                </h1>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-gray-400">
                  Name
                </h1>
              </div>
              <div>
                <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-white">
                  {selectedChat.userId?.FullName}
                </h1>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-gray-400">
                  Email
                </h1>
              </div>
              <div>
                <h1 className="font-inter font-medium text-[10.65px] leading-[12.42px] text-white truncate max-w-[100px]">
                  {selectedChat.userId?.Email}
                </h1>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Support;