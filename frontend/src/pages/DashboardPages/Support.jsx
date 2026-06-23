import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ChatImage from "../../assets/images/hyperbot-avatar.webp";
import { BACKEND_BASE_URL } from "../../Config";
import { FiSend, FiMessageCircle, FiZap, FiShield, FiHelpCircle, FiClock } from "react-icons/fi";

const QUICK_TOPICS = [
  { icon: <FiZap size={13} />, label: "Wallet & Payments" },
  { icon: <FiShield size={13} />, label: "Account Security" },
  { icon: <FiHelpCircle size={13} />, label: "NFT / NFC Help" },
  { icon: <FiClock size={13} />, label: "Transaction Issue" },
];

function Support() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [roomId, setRoomId]       = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const socketRef      = useRef(null);
  const token          = localStorage.getItem("token");

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    socketRef.current = io(BACKEND_BASE_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    const socket = socketRef.current;

    socket.on("connect",    () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    const initChat = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/chat/get-support-admin`);
        const adminUserId = res.data.adminId || res.data?._id;
        if (!adminUserId) return;

        socket.emit("joinRoom", { adminId: adminUserId });

        socket.on("roomJoined", (room) => {
          setRoomId(room);
          fetchMessages(room);
        });

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

    return () => {
      socket.off("roomJoined");
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);

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

  const handleSendMessage = () => {
    if (!text.trim() || !roomId || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { roomId, message: text });
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickTopic = (label) => {
    setText(label + ": ");
    textareaRef.current?.focus();
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const key = new Date(msg.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
    return groups;
  }, {});

  const userInitial = (user?.FullName || user?.Email || "U")[0].toUpperCase();

  return (
    // flex-1 min-h-0 fills the parent flex area without overflow; flex-col stacks header / messages / input
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
              <img src={ChatImage} alt="Support" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#100F0F]"
              style={{ background: isConnected ? "#4ade80" : "#6b7280" }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              {t("dashboard.support.title", "Hyper Tek Support")}
            </p>
            <p className="text-[11px] mt-0.5"
              style={{ color: isConnected ? "#4ade80" : "rgba(255,255,255,0.35)" }}>
              {isConnected
                ? t("dashboard.support.online", "Online · Typically replies in minutes")
                : t("dashboard.support.connecting", "Connecting...")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
          style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {t("dashboard.support.liveBadge", "Live Chat")}
        </div>
      </div>

      {/* ── Messages — flex-1 min-h-0 allows this to shrink and scroll ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>

        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,42,168,0.2)", border: "1px solid rgba(0,80,255,0.3)" }}>
              <FiMessageCircle size={26} className="text-blue-400" />
            </div>

            <div className="text-center max-w-xs">
              <p className="text-white font-semibold text-base mb-1">
                {t("dashboard.support.emptyTitle", "How can we help?")}
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                {t("dashboard.support.emptyDesc", "Our support team is here for you. Start a conversation or pick a topic below.")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {QUICK_TOPICS.map((topic) => (
                <button key={topic.label} onClick={() => handleQuickTopic(topic.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,42,168,0.25)"; e.currentTarget.style.borderColor = "rgba(0,80,255,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <span className="text-blue-400">{topic.icon}</span>
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2 px-4 py-3 rounded-xl max-w-xs w-full"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <FiClock size={12} className="text-white/30 mt-0.5 flex-shrink-0" />
              <p className="text-white/30 text-[11px] leading-relaxed">
                {t("dashboard.support.hoursNote", "Support is available 24/7. Response times may vary during high traffic.")}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
            <div key={dateKey}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
                  {formatDate(dayMessages[0].createdAt)}
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <div className="space-y-3">
                {dayMessages.map((msg) =>
                  msg.senderRole === "user" ? (
                    /* User — right */
                    <div key={msg._id} className="flex justify-end items-end gap-2">
                      <div className="max-w-[72%]">
                        <div className="px-4 py-2.5 rounded-2xl rounded-br-sm"
                          style={{ background: "linear-gradient(135deg, #002AA8 0%, #0041cc 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                          <p className="text-white text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                        <p className="text-right text-[10px] mt-1 pr-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mb-5"
                        style={{ background: "linear-gradient(135deg, #002AA8, #0041cc)" }}>
                        {userInitial}
                      </div>
                    </div>
                  ) : (
                    /* Admin — left */
                    <div key={msg._id} className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden border border-white/10 mb-5">
                        <img src={ChatImage} alt="Support" className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-[72%]">
                        <p className="text-[10px] font-medium mb-1 pl-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {t("dashboard.support.agentName", "Support Agent")}
                        </p>
                        <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <p className="text-white text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                        <p className="text-[10px] mt-1 pl-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.15)" }}>

        {/* Quick topics — shown when there are messages */}
        {messages.length > 0 && (
          <div className="flex gap-1.5 mb-2.5 flex-wrap">
            {QUICK_TOPICS.map((topic) => (
              <button key={topic.label} onClick={() => handleQuickTopic(topic.label)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/45 hover:text-white/75 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-blue-400/60">{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl px-4 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", minHeight: "44px" }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => { setText(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={t("dashboard.support.messagePlaceholder", "Type a message… (Ctrl + Enter to send)")}
            className="flex-1 resize-none bg-transparent outline-none text-white text-sm leading-5 placeholder-white/25 max-h-[120px] overflow-y-auto self-center"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!text.trim() || !roomId}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed self-center"
            style={{
              background: text.trim() && roomId ? "linear-gradient(135deg, #002AA8 0%, #0041cc 100%)" : "rgba(255,255,255,0.07)",
              border: text.trim() && roomId ? "1px solid rgba(0,80,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
            }}>
            <FiSend size={14} className="text-white" style={{ transform: "translateX(1px)" }} />
          </button>
        </div>

        <p className="text-center text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
          {t("dashboard.support.hint", "Ctrl + Enter to send")}
        </p>
      </div>
    </div>
  );
}

export default Support;
