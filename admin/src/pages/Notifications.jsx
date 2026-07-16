import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Dashboard_Base_Url } from "../Config";

/* The backend composes these notifications on the fly from buyback requests,
   sales, payouts and signups — they are not stored documents, so read/dismiss
   state lives in localStorage keyed by the synthetic notification id. */
const READ_KEY = "ht_admin_notif_read";
const DISMISSED_KEY = "ht_admin_notif_dismissed";
const loadIds = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key)) || []); }
  catch { return new Set(); }
};
const saveIds = (key, set) => {
  localStorage.setItem(key, JSON.stringify([...set].slice(-500)));
};

const F    = "Inter, sans-serif";
const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" };

const TYPE_CONFIG = {
  info:    { bg: "rgba(77,122,255,0.15)",  border: "rgba(77,122,255,0.3)",  text: "#4d7aff",  icon: "ℹ" },
  warning: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)", text: "#f59e0b",  icon: "!" },
  success: { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",  text: "#22c55e",  icon: "✓" },
  error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",  text: "#ef4444",  icon: "✕" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const readIds = loadIds(READ_KEY);
        const dismissedIds = loadIds(DISMISSED_KEY);
        const list = (res.data.notifications || res.data.data || [])
          .filter((n) => !dismissedIds.has(n._id || n.id))
          .map((n) => ({ ...n, read: n.read || readIds.has(n._id || n.id) }));
        setNotifications(list);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const markAllRead = () => {
    const readIds = loadIds(READ_KEY);
    notifications.forEach((n) => readIds.add(n._id || n.id));
    saveIds(READ_KEY, readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const dismiss = (id) => {
    const dismissedIds = loadIds(DISMISSED_KEY);
    dismissedIds.add(id);
    saveIds(DISMISSED_KEY, dismissedIds);
    setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
  };

  const open = (notif) => {
    const id = notif._id || notif.id;
    const readIds = loadIds(READ_KEY);
    readIds.add(id);
    saveIds(READ_KEY, readIds);
    setNotifications((prev) => prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n)));
    if (!notif.link) return;
    let adminId = "";
    try { adminId = JSON.parse(localStorage.getItem("admin_data"))?._id || ""; } catch { /* ignore */ }
    navigate(adminId ? `/${adminId}/${notif.link}` : `/${notif.link}`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div style={{ fontFamily: F, color: "white", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>Notifications</h1>
          <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filter */}
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
            {[{ key: "all", label: "All" }, { key: "unread", label: "Unread" }].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: F, fontWeight: 600, fontSize: 12, background: filter === f.key ? "#002AA8" : "transparent", color: filter === f.key ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: F, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ ...CARD, padding: 32, textAlign: "center" }}>
          <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading notifications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...CARD, padding: "48px 24px", textAlign: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 12 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((notif) => {
            const type = notif.type || "info";
            const cfg  = TYPE_CONFIG[type] || TYPE_CONFIG.info;
            const isUnread = !notif.read;

            return (
              <div
                key={notif._id || notif.id}
                onClick={() => open(notif)}
                style={{
                  ...CARD,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  background: isUnread ? "rgba(0,42,168,0.06)" : "#0c0c18",
                  borderColor: isUnread ? "rgba(0,80,255,0.15)" : "rgba(255,255,255,0.07)",
                  transition: "background 0.15s",
                  cursor: notif.link ? "pointer" : "default",
                }}
                onMouseEnter={(e) => { if (notif.link) e.currentTarget.style.background = "rgba(0,42,168,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? "rgba(0,42,168,0.06)" : "#0c0c18"; }}
              >
                {/* Icon / Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notif.senderName ? (
                    <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: cfg.text }}>
                      {initials(notif.senderName)}
                    </span>
                  ) : (
                    <span style={{ color: cfg.text, fontSize: 14, fontWeight: 700 }}>{cfg.icon}</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {notif.title && (
                    <p style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "white", margin: "0 0 2px" }}>
                      {notif.title}
                    </p>
                  )}
                  <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
                    {notif.message || notif.text || "—"}
                  </p>
                  <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "6px 0 0" }}>
                    {notif.createdAt ? timeAgo(notif.createdAt) : notif.time || ""}
                  </p>
                </div>

                {/* Unread dot + dismiss */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {isUnread && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4d7aff", flexShrink: 0 }} />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(notif._id || notif.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 2, display: "flex", transition: "color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
