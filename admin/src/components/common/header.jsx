// components/common/header.jsx
import { FiSearch, FiBell, FiMenu, FiChevronDown, FiUser, FiGrid, FiLogOut } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import HeaderIcon from "../../assets/Sidebar/headerIcon.png";
import NotificationIcon from "../../assets/notification.png";
import NotificationDropdown from "../common/Notification";
import { Image_Base_Url } from "../../Config";
import { useSelector, useDispatch } from "react-redux";
import { FaUserCircle, FaGamepad, FaStore } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutAdmin } from "../../Redux/AdminSlice";
const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token, isLoggedInUser } = useSelector(
    (state) => state.auth || {}
  );

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [notificationCount] = useState(3);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
  };

  // Use Redux user directly, fallback to localStorage
  const userData = user || (() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      return adminData ? JSON.parse(adminData) : null;
    } catch {
      return null;
    }
  })();

  const bellRef = useRef(null);

  // Bell shake animation on new notifications
  const triggerBellAnimation = () => {
    if (bellRef.current) {
      bellRef.current.classList.add("animate-shake");
      setTimeout(() => {
        if (bellRef.current) {
          bellRef.current.classList.remove("animate-shake");
        }
      }, 600);
    }
  };

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      triggerBellAnimation();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Sync Redux user to localStorage when available
  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem("admin_data", JSON.stringify(user));
    }
  }, [user]);

  // Navigation handlers - use Redux user first
  const handleNotification = () => {
    const userId = user?._id || userData?._id;
    if (!userId) return;
    navigate(`/${userId}/notification`);
  };

  const handleEditProfile = () => {
    const userId = user?._id || userData?._id;
    if (!userId) return;
    navigate(`/${userId}/edit-profile`);
  };

  return (
    <header className="p-4 flex justify-between lg:justify-end items-center lg:items-end z-50">
      {/* Burger Menu for Mobile */}
      <button
        className="lg:hidden text-white p-2 focus:outline-none"
        onClick={toggleSidebar}
      >
        <FiMenu size={24} />
      </button>

      <div className="flex items-center justify-end gap-6 lg:mr-16">
        {/* 🔍 Animated Search Box */}
        {(location.pathname.match(/\/[a-f0-9]{24}\/dashboard$/) ||
          location.pathname.match(/\/[a-f0-9]{24}$/)) && (
            <div className="relative hidden sm:block">
              <div
                className={`
                flex items-center gap-2 rounded-xl px-4 py-3
                transition-all duration-500 ease-out
                backdrop-blur-sm
                ${isSearchFocused
                    ? "bg-white shadow-2xl transform scale-105 ring-2 ring-blue-400/50"
                    : "bg-white/90 shadow-lg hover:shadow-xl hover:bg-white"
                  }
              `}
                style={{ width: "229px", height: "33.51px" }}
              >
                <FiSearch
                  className={`
                  transition-all duration-500 ease-out
                  ${isSearchFocused
                      ? "text-blue-500 transform scale-110 rotate-12"
                      : "text-gray-500"
                    }
                `}
                />
                <input
                  type="search"
                  placeholder="Search for something..."
                  className="bg-transparent w-full text-gray-800 placeholder-gray-500 text-sm outline-none"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />

                <div
                  className={`
                  absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400
                  transform origin-left transition-all duration-500 ease-out
                  ${isSearchFocused ? "scale-x-100" : "scale-x-0"}
                `}
                />
              </div>
            </div>
          )}

        {/* 🔔 Notification Bell */}
        <div
          onClick={handleNotification}
          className="bg-white flex items-center justify-center rounded-full cursor-pointer"
          style={{ width: "32.21484375px", height: "32.21484375px" }}
        >
          <img
            src={NotificationIcon}
            alt="Notifications"
            style={{ width: "13px", height: "12.4px", objectFit: "contain" }}
          />
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="relative flex-shrink-0" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none"
            style={{
              background: showProfileMenu ? "rgba(0,42,168,0.7)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)"
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
              style={{ background: "rgba(0,42,168,0.8)" }}
            >
              {userData?.Avatar ? (
                <img
                  src={`${Image_Base_Url}${userData.Avatar.startsWith("/")
                    ? userData.Avatar
                    : "/" + userData.Avatar
                    }`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                (userData?.FullName || userData?.UserName || userData?.name || "A")[0].toUpperCase()
              )}
            </div>
            <span className="text-white text-sm font-medium max-w-[80px] truncate hidden lg:block">
              {(userData?.FullName || userData?.UserName || userData?.name || "Admin").split(" ")[0]}
            </span>
            <FiChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50 text-left"
              style={{ background: "rgba(0,15,60,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-white text-sm font-semibold truncate">{userData?.FullName || userData?.UserName || userData?.name || "Admin"}</p>
                <p className="text-white/40 text-xs truncate mt-0.5">{userData?.Email || userData?.email || ""}</p>
              </div>
              <div
                onClick={() => { setShowProfileMenu(false); handleEditProfile(); }}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white cursor-pointer"
              >
                <FiUser className="w-3.5 h-3.5" /> My Profile
              </div>
              <a
                href={import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
              >
                <FiGrid className="w-3.5 h-3.5" /> Website
              </a>
              <a
                href={`${import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}/gaming`}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
              >
                <FaGamepad className="w-3.5 h-3.5" /> Gaming
              </a>
              <a
                href={`${import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}/market-place`}
                className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5"
              >
                <FaStore className="w-3.5 h-3.5" /> Marketplace
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/80 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 border-t border-white/5"
              >
                <FiLogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Header;