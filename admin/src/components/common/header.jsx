// components/common/header.jsx
import { FiSearch, FiBell } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import HeaderIcon from "../../assets/Sidebar/headerIcon.png"
import NotificationIcon from "../../assets/notification.png";
import NotificationDropdown from "../common/Notification"
import { Image_Base_Url } from "../../Config";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import {  useNavigate , useLocation} from "react-router-dom" 

const Header = () => {
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
    const { user, token, isLoggedInUser } = useSelector(
    (state) => state.auth || {}
  );

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

  // Get the profile data
  useEffect(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      if (adminData) {
        setUserData(JSON.parse(adminData));
      }
    } catch (error) {
      console.error("Failed to parse admin data from localStorage", error);
    }
  }, []);

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      triggerBellAnimation();
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);



  const handleNotification = ()=>{
    navigate(`/${userData._id}/notification`)
  }

  return (
    <header className="p-4 flex justify-end items-center  z-50">
      <div className="flex items-center justify-end gap-6 mr-8">
        {/* 🔍 Animated Search Box */}
{(location.pathname.match(/\/[a-f0-9]{24}\/dashboard$/) || location.pathname.match(/\/[a-f0-9]{24}$/)) && (
    <div className="relative">
    <div
      className={`
        flex items-center gap-2 rounded-xl px-4 py-3 
        transition-all duration-500 ease-out
        backdrop-blur-sm
        ${isSearchFocused 
          ? 'bg-white shadow-2xl transform scale-105 ring-2 ring-blue-400/50' 
          : 'bg-white/90 shadow-lg hover:shadow-xl hover:bg-white'
        }
      `}
      style={{
        width: "229px",
        height: "33.51px",
      }}
    >
      <FiSearch className={`
        transition-all duration-500 ease-out
        ${isSearchFocused 
          ? 'text-blue-500 transform scale-110 rotate-12' 
          : 'text-gray-500'
        }
      `} />
      <input
        type="search"
        placeholder="Search for something..."
        className="bg-transparent w-full text-gray-800 placeholder-gray-500 text-sm outline-none"
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />

      <div className={`
        absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400
        transform origin-left transition-all duration-500 ease-out
        ${isSearchFocused ? 'scale-x-100' : 'scale-x-0'}
      `} />
    </div>
  </div>
)}


        {/* 🔔 Animated Notification Bell */}
    <div
    onClick={handleNotification}
      className="bg-white flex items-center justify-center rounded-full cursor-pointer "
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
        <div className="relative group cursor-pointer">
          <div
            className={`relative w-[44px] h-[44px] rounded-2xl cursor-pointer 
              transition-transform duration-700 ease-out
              ${isProfileHovered ? 'transform scale-110' : ''}`}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            {userData?.Avatar ? (
              <img
                src={`${Image_Base_Url}${userData.Avatar.startsWith('/') ? userData.Avatar : '/' + userData.Avatar}`}
                alt={userData?.FullName || "Profile"}
                className="w-full h-full object-cover rounded-[50%]"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-gray-400 p-1" />
            )}
          </div>

          {/* Profile Tooltip - Optional */}

        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
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