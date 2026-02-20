import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import ChatImage from "../assets/icon.png";
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
  const chatContainerRef = useRef(null);

  const adminState = useSelector((state) => state.admin);

  useEffect(() => {
    try {
      let adminData = null;
      if (adminState?.admin) {
        adminData =
          typeof adminState.admin === "string"
            ? JSON.parse(adminState.admin)
            : adminState.admin;
      }
      if (!adminData) {
        const persistedAdmin = localStorage.getItem("persist:admin");
        if (persistedAdmin) {
          const parsed = JSON.parse(persistedAdmin);
          if (parsed.admin) adminData = JSON.parse(parsed.admin);
        }
      }
      if (adminData) setAdminInfo(adminData);
    } catch (err) {
      console.error("❌ Error parsing admin data:", err);
    }
  }, [adminState]);

  const getAuthToken = () => {
    let token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token && adminInfo) {
      token = btoa(
        JSON.stringify({
          id: adminInfo._id,
          role: adminInfo.Role,
          email: adminInfo.Email,
        })
      );
    }
    return token;
  };

  const token = getAuthToken();

  useEffect(() => {
    if (!adminInfo) return;
    const newSocket = io("https://api-hyper-tek-games.deventiatech.com", {
      auth: { token: token, adminId: adminInfo._id, role: adminInfo.Role },
    });

    newSocket.on("connect", () =>
      console.log("✅ Socket connected:", newSocket.id)
    );
    newSocket.on("connect_error", (err) =>
      console.error("❌ Socket error:", err.message)
    );

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [adminInfo, token]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!token || !adminInfo) return;
      try {
        const res = await axios.get(
          "https://api-hyper-tek-games.deventiatech.com/api/v1/chat/admin/chats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Admin-Id": adminInfo._id,
            },
          }
        );
        setChats(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setChats([]);
      }
    };
    if (token && adminInfo) fetchChats();
  }, [token, adminInfo]);

  useEffect(() => {
    if (!selectedChat || !token || !socket || !adminInfo) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://api-hyper-tek-games.deventiatech.com/api/v1/chat/messages/${selectedChat._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Admin-Id": adminInfo._id,
            },
          }
        );
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchMessages();

    socket.emit("joinRoom", {
      userId: selectedChat.userId?._id,
      adminId: adminInfo._id,
    });
  }, [selectedChat, token, socket, adminInfo]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (msg) => {
      if (msg.roomId === selectedChat?._id)
        setMessages((prev) => [...prev, msg]);
    });
    socket.on("roomJoined", (roomId) => console.log("✅ Room joined:", roomId));
    return () => {
      socket.off("receiveMessage");
      socket.off("roomJoined");
    };
  }, [socket, selectedChat]);

  const handleSendMessage = () => {
    if (!text.trim() || !selectedChat || !socket) return;
    socket.emit("sendMessage", { roomId: selectedChat._id, message: text });
    setText("");
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!adminInfo) {
    return (
      <div className="flex bg-black items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">⚠️ Authentication Required</h1>
          <p>Please login as admin to access support chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-black p-4 h-[80vh] gap-4 relative overflow-hidden">
      {/* Background Blurs */}
      <div
        style={{
          top: "20px",
          left: "360px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full pointer-events-none"
      ></div>
      <div
        style={{
          top: "810px",
          left: "960px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full pointer-events-none"
      ></div>

      {/* Sidebar */}
      <div className="flex flex-col w-[304px]  p-2 overflow-y-auto bg-black">
        <div className="text-white text-xs p-2 bg-gray-800 rounded mb-2">
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
            onClick={() => handleChatClick(chat)}
            className={`flex items-center justify-between gap-2 my-2 p-2 rounded cursor-pointer ${selectedChat?._id === chat._id ? "bg-gray-800" : ""
              }`}
          >
            <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex flex-col flex-1 justify-center gap-0.5 min-w-0">
              <h1 className="font-semibold text-[14px] text-[#414651] m-0">
                {chat.userId?.FullName || "User"}
              </h1>
              <p className="text-[12px] text-[#757285] truncate">
                {chat.userId?.Email || ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 h-full  rounded">
        {/* Header */}
        <div className="flex items-center gap-2 w-full min-h-[50px] border-b border-white p-2 bg-black">
          <img src={ChatImage} alt="" className="w-8 h-8 rounded-full" />
          <p className="text-white font-medium">
            {selectedChat
              ? `${selectedChat.userId?.FullName || "User"} - Online`
              : "Select a chat"}
          </p>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
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
                <div key={msg._id} className="flex justify-end gap-3 items-end">
                  <div className="flex flex-col max-w-[401px] gap-2 p-2.5 bg-[#1D7AD6] rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] text-white">
                    <p className="text-[12px] break-words">{msg.message}</p>
                    <p className="text-right text-[12px]">
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
                  <p className="text-[12px] text-black break-words">
                    {msg.message}
                  </p>
                  <p className="text-right text-[12px] text-[#797782]">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              )
            )
          )}
        </div>

        {/* Input */}
        {selectedChat && (
          <div className="flex flex-col bg-gray-50 border-t border-[#EDEDED] p-2 gap-2 rounded-xl">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full text-black text-[12px] rounded px-2 py-1 outline-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">{/* Add any icons here */}</div>
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 bg-[#1D7AD6] px-3 py-1 rounded text-white text-[12px]"
              >
                Send
                <img src={SendIcon} className="w-4 h-4" alt="" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="w-[160px] p-2 flex-shrink-0">
        {selectedChat && (
          <>
            <h1 className="text-white text-[12px] mb-2">User Details</h1>
            <div className="flex justify-between text-gray-400 text-[12px] mb-1">
              <span>Name:</span>
              <span className="text-white">
                {selectedChat.userId?.FullName}
              </span>
            </div>
            <div className="flex justify-between text-gray-400 text-[12px]">
              <span>Email:</span>
              <span className="text-white truncate max-w-[100px]">
                {selectedChat.userId?.Email}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Support;
