// components/common/header.jsx
import { FiSearch, FiBell, FiMenu } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import HeaderIcon from "../../assets/Sidebar/headerIcon.png";
import NotificationIcon from "../../assets/notification.png";
import NotificationDropdown from "../common/Notification";
import { Image_Base_Url } from "../../Config";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import BgEffect2 from "../common/BgEffect2";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, token, isLoggedInUser } = useSelector(
    (state) => state.auth || {}
  );

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Check if current page should show search
  const showSearch = location.pathname.includes("/dashboard") || !location.pathname.split("/").filter(Boolean)[1];

  return (
    <header className="p-4 flex justify-between lg:justify-end items-center z-50">
      {/* Burger Menu for Mobile */}
      <button
        className="lg:hidden p-2 text-white bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
        onClick={toggleSidebar}
      >
        <FiMenu size={24} />
      </button>

      <div className="flex items-center justify-end gap-3 md:gap-6 lg:mr-16">
        {/* 🔍 Search Box */}
        {showSearch && (
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-300
              ${isSearchFocused ? "bg-white shadow-lg w-[160px] md:w-[220px]" : "bg-white/90 w-[36px] md:w-[220px]"}
            `}
            style={{ height: "32px" }}
          >
            <FiSearch className="text-gray-500 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className={`bg-transparent w-full text-sm text-gray-800 placeholder-gray-500 outline-none ${!isSearchFocused && 'hidden md:block'}`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        )}

        {/* 🔔 Notification */}
        <div
          onClick={handleNotification}
          className="bg-white flex items-center justify-center rounded-full cursor-pointer w-[32px] h-[32px] flex-shrink-0"
        >
          <img
            src={NotificationIcon}
            alt="Notifications"
            className="w-[13px] h-[12.4px] object-contain"
          />
        </div>

        {/* 👤 Profile Picture */}
        <div
          className="relative group cursor-pointer flex-shrink-0"
          onClick={handleEditProfile}
        >
          <div
            className={`relative w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full md:rounded-2xl overflow-hidden transition-transform duration-500 ${isProfileHovered ? "scale-110" : ""
              }`}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            {userData?.Avatar ? (
              <img
                src={`${Image_Base_Url}${userData.Avatar.startsWith("/") ? userData.Avatar : "/" + userData.Avatar}`}
                alt={userData?.FullName || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400 p-1" />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Header;