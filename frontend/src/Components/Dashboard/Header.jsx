// components/common/header.jsx
import { FiSearch, FiBell } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import HeaderIcon from "../../assets/images/Sidebar/headerIcon.png";
import HeaderImage from "../../assets/images/Sidebar/headerImage.png";
import NotificationDropdown from "./Notification";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import NotificationIcon from "../../assets/notification.png"

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  
  const bellRef = useRef(null);
  
  // Bell shake animation on new notifications
  const triggerBellAnimation = () => {
    if (bellRef.current) {
      bellRef.current.classList.add('animate-shake');
      setTimeout(() => {
        if (bellRef.current) {
          bellRef.current.classList.remove('animate-shake');
        }
      }, 600);
    }
  };
  
  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      triggerBellAnimation();
    }, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, []);
 
  // Get the user profile 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("your user Response are:", res);
        setUserData(res.data.user);
        setImageError(false); // Reset error state on successful fetch
        console.log("✅ Profile fetched:", res.data.user);
      } catch (error) {
        console.error(
          "❌ Profile fetch error:",
          error.response?.data || error.message
        );
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <header className="p-4 flex justify-end items-end relative z-50">
      <div
        className="flex items-center justify-end gap-[46px] mr-16"
        style={{
          width: "398.1px",
          height: "44.88px",
          top: "40px",
          right: "10px",
        }}
      >

<div
  className="bg-white flex items-center justify-center rounded-full"
  style={{
    width: "32.21484375px",
    height: "32.21484375px",
    opacity: 1,
  }}
>
  <img
    src={NotificationIcon}
    alt="Notifications"
    style={{
      width: "13px",
      height: "12.4px",
      objectFit: "contain",
    }}
  />
</div>


        {/* 👤 Animated Profile Picture */}
        <div 
          className={`
            relative w-[44px] h-[44px] rounded-3xl 
            p-0.5 transition-all duration-700 ease-out
            ${isProfileHovered ? 'transform scale-110 rotate-3' : 'shadow-lg'}
          `}
          onMouseEnter={() => setIsProfileHovered(true)}
          onMouseLeave={() => setIsProfileHovered(false)}
        >
          <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
            {userData?.Avatar && !imageError ? (
              <img
                src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                alt={userData?.FullName || "Profile"}
                className={`
                  w-full h-full object-cover rounded-xl 
                  transition-all duration-700 ease-out 
                  ${isProfileHovered ? 'transform scale-110' : ''}
                `}
                onError={handleImageError}
              />
            ) : (
              <FaUserCircle className={`
                w-8 h-8 text-gray-400 
                transition-all duration-700 ease-out
                ${isProfileHovered ? 'transform scale-110 text-blue-500' : ''}
              `} />
            )}
          </div>
          
          {/* Floating hover gradient */}
          <div className={`
            absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-500/30
            opacity-0 transition-all duration-1000 ease-out
            ${isProfileHovered ? 'opacity-100 animate-pulse' : ''}
          `} />
        </div>
      </div>
      
      {/* Custom Animation Styles */}
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