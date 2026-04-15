import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { BACKEND_BASE_URL, Dashboard_Base_Url } from "../Config";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return formatTime(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-[#002AA8]/40 border border-[#002AA8]/60 flex items-center justify-center font-bold text-white/80 flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function Support() {
  const [chats,        setChats]        = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [text,         setText]         = useState("");
  const [socket,       setSocket]       = useState(null);
  const [adminInfo,    setAdminInfo]    = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const chatContainerRef = useRef(null);

  const adminState = useSelector((state) => state.admin);

  // ── Resolve admin info ─────────────────────────────────────────────────────

  useEffect(() => {
    try {
      let adminData = null;
      if (adminState?.admin) {
        adminData = typeof adminState.admin === "string"
          ? JSON.parse(adminState.admin)
          : adminState.admin;
      }
      if (!adminData) {
        const persisted = localStorage.getItem("persist:admin");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (parsed.admin) adminData = JSON.parse(parsed.admin);
        }
      }
      if (adminData) setAdminInfo(adminData);
    } catch { /* ignore */ }
  }, [adminState]);

  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!adminInfo) return;
    const sock = io(BACKEND_BASE_URL, {
      auth: { token, adminId: adminInfo._id, role: adminInfo.Role },
    });
    setSocket(sock);
    return () => sock.disconnect();
  }, [adminInfo, token]);

  // ── Fetch chat list ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !adminInfo) return;
    axios
      .get(`${Dashboard_Base_Url}/v1/chat/admin/chats`, {
        headers: { Authorization: `Bearer ${token}`, "X-Admin-Id": adminInfo._id },
      })
      .then(res => setChats(Array.isArray(res.data) ? res.data : []))
      .catch(() => setChats([]));
  }, [token, adminInfo]);

  // ── Fetch messages on chat select ──────────────────────────────────────────

  useEffect(() => {
    if (!selectedChat || !token || !socket || !adminInfo) return;

    axios
      .get(`${Dashboard_Base_Url}/v1/chat/messages/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}`, "X-Admin-Id": adminInfo._id },
      })
      .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMessages([]));

    socket.emit("joinRoom", {
      userId:  selectedChat.userId?._id,
      adminId: adminInfo._id,
    });
  }, [selectedChat, token, socket, adminInfo]);

  // ── Receive messages via socket ────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.roomId === selectedChat?._id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [socket, selectedChat]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!text.trim() || !selectedChat || !socket) return;
    socket.emit("sendMessage", { roomId: selectedChat._id, message: text.trim() });
    setText("");
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  // ── Filtered chats ─────────────────────────────────────────────────────────

  const filteredChats = chats.filter(chat => {
    const q = searchQuery.toLowerCase();
    return !q ||
      (chat.userId?.FullName || "").toLowerCase().includes(q) ||
      (chat.userId?.Email    || "").toLowerCase().includes(q);
  });

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!adminInfo) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <p className="text-white/40 text-sm">Loading admin session…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] rounded-xl overflow-hidden border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>

      {/* ── Chat list sidebar ── */}
      <div className="flex flex-col w-[280px] flex-shrink-0 border-r border-white/8">

        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-white/8">
          <h2 className="text-white font-semibold text-sm mb-3">Support Chats</h2>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white text-xs placeholder-white/30 w-full"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredChats.length === 0 ? (
            <p className="text-white/30 text-xs text-center mt-8 px-4">
              {searchQuery ? "No users match your search" : "No conversations yet"}
            </p>
          ) : (
            filteredChats.map(chat => {
              const isActive = selectedChat?._id === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#002AA8]/20 border-r-2 border-[#002AA8]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Avatar name={chat.userId?.FullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate leading-tight">
                      {chat.userId?.FullName || "User"}
                    </p>
                    <p className="text-white/40 text-xs truncate mt-0.5">
                      {chat.userId?.Email || ""}
                    </p>
                  </div>
                  {chat.updatedAt && (
                    <span className="text-white/25 text-[10px] flex-shrink-0">
                      {formatDate(chat.updatedAt)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 flex-shrink-0">
          {selectedChat ? (
            <>
              <Avatar name={selectedChat.userId?.FullName} />
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  {selectedChat.userId?.FullName || "User"}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {selectedChat.userId?.Email || ""}
                </p>
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
        >
          {!selectedChat ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-white/25 text-sm">Select a user to start chatting</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/25 text-sm">No messages yet</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAdmin = msg.senderRole === "admin";
              return (
                <div key={msg._id || idx} className={`flex items-end gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar name={isAdmin ? (adminInfo?.FullName || "Admin") : (selectedChat?.userId?.FullName || "User")} size="sm" />
                  <div
                    className={`max-w-[65%] px-4 py-2.5 rounded-2xl ${
                      isAdmin
                        ? "bg-[#002AA8] text-white rounded-br-sm"
                        : "text-white rounded-bl-sm border border-white/8"
                    }`}
                    style={isAdmin ? {} : { background: "rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/50 text-right" : "text-white/30"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        {selectedChat && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/8 flex-shrink-0">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#002AA8] hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Support;
