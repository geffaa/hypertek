// components/common/header.jsx
import { FiSearch, FiMenu } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";
import NotificationIcon from "../../assets/notification.png";
import NotificationDropdown from "./Notification";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  // States
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, token } = useSelector((state) => state.auth);
  const displayName = user?.FullName || user?.UserName || user?.Email || "";
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const bellRef = useRef(null);
  const [hbBalance, setHbBalance] = useState(null);

  // Bell animation
  const triggerBellAnimation = () => {
    if (bellRef.current) {
      bellRef.current.classList.add("animate-shake");
      setTimeout(() => {
        bellRef.current?.classList.remove("animate-shake");
      }, 600);
    }
  };

  useEffect(() => {
    const interval = setInterval(triggerBellAnimation, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data.user);
        setImageError(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Fetch HB balance
  useEffect(() => {
    const fetchHBBalance = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/hb/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHbBalance(res.data);
      } catch (error) {
        // Non-fatal — HB balance is supplemental
        console.warn("Failed to fetch HB balance:", error?.response?.data?.error || error.message);
      }
    };
    if (token) fetchHBBalance();
  }, [token]);

  const handleImageError = () => setImageError(true);

  // Search handler
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="p-4 flex justify-between lg:justify-end items-center z-50">
      <div
        className="lg:hidden p-2 text-white bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
        onClick={onMenuClick}
      >
        <FiMenu size={24} />
      </div>

      <div className="flex items-center justify-end gap-[12px] md:gap-[20px] lg:mr-16">

        {/* HB Balance Pill */}
        {hbBalance !== null && (
          <button
            onClick={() => navigate("/dashboard/withdraw")}
            className="flex flex-col items-center justify-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 hover:border-yellow-400/70 rounded-lg px-3 py-1 transition-all duration-200 hover:scale-105 flex-shrink-0"
            title="Hyper Bucks — click to cashout"
          >
            <span className="text-yellow-300 text-xs font-bold leading-tight whitespace-nowrap">
              ⚡ {hbBalance.hyperBucks} HB
            </span>
            <span className="text-yellow-500/70 text-[10px] leading-tight">
              ${hbBalance.usdEquivalent} USD
            </span>
          </button>
        )}

        {/* Search Box */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className={`bg-transparent w-full text-sm text-gray-800 placeholder-gray-500 outline-none ${!isSearchFocused && 'hidden md:block'}`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        {/* 🔔 Notification */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white flex items-center justify-center rounded-full cursor-pointer w-[32px] h-[32px]"
          >
            <img src={NotificationIcon} alt="Notifications" className="w-[13px]" />
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* 👤 Profile Button */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard/edit-profile")}
          onMouseEnter={() => setIsProfileHovered(true)}
          onMouseLeave={() => setIsProfileHovered(false)}
        >
          {displayName && (
            <span className="hidden md:block text-white/70 text-sm font-medium max-w-[120px] truncate">
              {displayName.split(" ")[0]}
            </span>
          )}
        <div
          className={`
            relative w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full md:rounded-3xl
            p-0.5 transition-all duration-700 ease-out
            ${isProfileHovered ? "scale-110 rotate-3" : "shadow-lg"}
          `}
        >
          <div className="w-full h-full overflow-hidden flex items-center justify-center rounded-full md:rounded-3xl">
            {userData?.Avatar && !imageError ? (
              <img
                src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                alt="Profile"
                className={`w-full h-full object-cover transition-all duration-700 ${isProfileHovered ? "scale-110" : ""}`}
                onError={handleImageError}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #002AA8 0%, #4F46E5 100%)" }}
              >
                {initials}
              </div>
            )}
          </div>

          <div
            className={`absolute -inset-1 rounded-full md:rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-500/30
            opacity-0 transition-all duration-1000 ${isProfileHovered ? "opacity-100 animate-pulse" : ""
              }`}
          />
        </div>
        </div>{/* end profile wrapper */}

      </div>{/* end header right */}

      {/* Animations */}
      <style jsx>{`
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
