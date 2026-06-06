import { FiMenu } from "react-icons/fi";
import { ChevronDown, LayoutGrid, Gamepad2, Store, Bell } from "lucide-react";
import HBCoinIcon from "../Common/HBCoinIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import logoutImage from "../../assets/images/login/logout.webp";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/AuthSlice";
import NotificationDropdown from "./Notification";
import LanguageSwitcher from "../Common/LanguageSwitcher";

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu,   setShowProfileMenu]   = useState(false);
  const [unreadCount,       setUnreadCount]        = useState(0);
  const [userData,          setUserData]           = useState(null);
  const [imageError,        setImageError]         = useState(false);
  const [hbBalance,         setHbBalance]          = useState(null);

  const profileMenuRef  = useRef(null);
  const notifRef        = useRef(null);

  const { user, token } = useSelector((state) => state.auth);
  const displayName = user?.FullName || user?.UserName || user?.Email || "";

  // Fetch profile
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => { setUserData(res.data.user); setImageError(false); })
      .catch((err) => {
        if (err?.response?.status !== 401)
          console.error("Profile fetch error:", err.response?.data || err.message);
      });
  }, [token]);

  // Fetch HB balance
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/hb/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHbBalance(res.data))
      .catch(() => {});
  }, [token]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="p-4 flex justify-between lg:justify-end items-center z-50">
      {/* Mobile hamburger */}
      <div
        className="lg:hidden p-2 text-white bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
        onClick={onMenuClick}
      >
        <FiMenu size={24} />
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-4 lg:mr-16">

        {/* HB Balance Pill */}
        {hbBalance !== null && (
          <button
            onClick={() => navigate("/dashboard/topup")}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,rgba(234,179,8,0.18),rgba(249,115,22,0.18))",
              border: "1px solid rgba(234,179,8,0.35)",
            }}
          >
            <HBCoinIcon size={32} />
            <div className="flex flex-col items-start">
              <span className="text-yellow-300 text-xs font-bold leading-tight whitespace-nowrap">
                {hbBalance.hyperBucks} HB
              </span>
              <span className="text-yellow-500/70 text-[10px] leading-tight">
                ${hbBalance.usdEquivalent} USD
              </span>
            </div>
          </button>
        )}

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* 🔔 Notification Bell */}
        <div ref={notifRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
            style={{
              background: showNotifications ? "rgba(0,42,168,0.7)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Bell className="w-4 h-4 text-white/80" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full min-w-[18px] h-[18px] px-1"
                style={{ background: "#ef4444" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            token={token}
            onUnreadChange={setUnreadCount}
          />
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="relative flex-shrink-0" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none"
            style={{
              background: showProfileMenu ? "rgba(0,42,168,0.7)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
              style={{ background: "rgba(0,42,168,0.8)" }}
            >
              {userData?.Avatar && !imageError ? (
                <img
                  src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                (user?.FullName || user?.name || user?.UserName || "U")[0].toUpperCase()
              )}
            </div>
            <span className="text-white text-sm font-medium max-w-[80px] truncate hidden lg:block">
              {displayName.split(" ")[0] || "Profile"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{
                background: "rgba(0,15,60,0.97)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-white text-sm font-semibold truncate">{displayName || "User"}</p>
                <p className="text-white/40 text-xs truncate mt-0.5">{user?.Email || user?.email || ""}</p>
              </div>
              <Link
                to="/Profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white"
              >
                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" /> {t("dashboard.header.myProfile","My Profile")}
              </Link>
              {user?.Role === "admin" ? (
                <a
                  href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}/${user.id || user._id}`}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> {t("dashboard.header.adminPanel","Admin Panel")}
                </a>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> {t("dashboard.header.dashboard","Dashboard")}
                </Link>
              )}
              <Link
                to="/gaming"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
              >
                <Gamepad2 className="w-3.5 h-3.5" /> {t("dashboard.header.gaming","Gaming")}
              </Link>
              <Link
                to="/market-place"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
              >
                <Store className="w-3.5 h-3.5" /> {t("dashboard.header.marketplace","Marketplace")}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/80 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 border-t border-white/5"
              >
                <img
                  src={logoutImage}
                  alt="Logout"
                  className="w-3.5 h-3.5 opacity-70"
                  style={{ filter: "invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg)" }}
                />
                {t("dashboard.header.signOut","Sign Out")}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
