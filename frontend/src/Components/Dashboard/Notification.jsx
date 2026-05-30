import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  Bell, ShoppingCart, Tag, ArrowLeftRight, Gavel,
  Coins, Wallet, ShieldCheck, Info, Trash2, CheckCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { BACKEND_BASE_URL } from "../../Config";

// ── Icon + accent colour per notification type ──────────────────────────────
const TYPE_META = {
  purchase:        { Icon: ShoppingCart, color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  sale:            { Icon: Tag,          color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  offer:           { Icon: Tag,          color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  offer_accepted:  { Icon: Tag,          color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  bid:             { Icon: Gavel,        color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  auction_won:     { Icon: Gavel,        color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  auction_sold:    { Icon: Gavel,        color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  trade:           { Icon: ArrowLeftRight, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  trade_accepted:  { Icon: ArrowLeftRight, color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  hb_credit:       { Icon: Coins,        color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  withdrawal:      { Icon: Wallet,       color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  kyc:             { Icon: ShieldCheck,  color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  system:          { Icon: Info,         color: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
};

const getMeta = (type) => TYPE_META[type] || TYPE_META.system;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

// ── Main component ────────────────────────────────────────────────────────────
export default function NotificationDropdown({ isOpen, onClose, token, onUnreadChange }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetched,       setFetched]       = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) { setLoading(false); setFetched(true); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        onUnreadChange?.(res.data.unreadCount);
      }
    } catch {
      // silent — notifications are supplemental
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [token, onUnreadChange]);

  // Fetch on open
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Poll for unread count every 60s even when closed
  useEffect(() => {
    if (!token) return;
    const poll = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) onUnreadChange?.(res.data.unreadCount);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, [token, onUnreadChange]);

  const markAllRead = async () => {
    try {
      await axios.patch(
        `${BACKEND_BASE_URL}/api/v1/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onUnreadChange?.(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await axios.patch(
        `${BACKEND_BASE_URL}/api/v1/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      onUnreadChange?.((c) => Math.max(0, c - 1));
    } catch {}
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/v1/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      onUnreadChange?.((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (!isOpen) return null;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 z-50 flex flex-col font-inter"
      style={{
        width: "clamp(300px, 90vw, 360px)",
        top: "100%",
        background: "rgba(4,8,28,0.98)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/60" />
          <span className="text-white text-sm font-semibold">{t("dashboard.notification.title","Notifications")}</span>
          {unread > 0 && (
            <span
              className="flex items-center justify-center text-[10px] font-bold text-white rounded-full min-w-[18px] h-[18px] px-1"
              style={{ background: "#002AA8" }}
            >
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t("dashboard.notification.markAllRead","Mark all read")}
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {loading || !fetched ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/25">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-sm">{t("dashboard.notification.noNotifications","No notifications yet")}</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { Icon, color, bg } = getMeta(n.type);
            return (
              <div
                key={n._id}
                onClick={() => !n.read && markOneRead(n._id)}
                className="group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
                style={{
                  background: n.read ? "transparent" : "rgba(0,42,168,0.08)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? "transparent" : "rgba(0,42,168,0.08)"; }}
              >
                {/* Icon badge */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-xs font-semibold leading-snug"
                      style={{ color: n.read ? "rgba(255,255,255,0.55)" : "#fff" }}
                    >
                      {n.title}
                    </p>
                    <span className="text-[10px] text-white/25 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-snug line-clamp-2">
                    {n.message}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: "#3b82f6" }}
                  />
                )}

                {/* Delete button (hover) */}
                <button
                  onClick={(e) => deleteOne(e, n._id)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                >
                  <Trash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <div
          className="px-4 py-2.5 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={onClose}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            {t("dashboard.notification.close","Close")}
          </button>
        </div>
      )}
    </div>
  );
}
