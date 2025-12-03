// components/common/header.jsx
import { FiSearch, FiBell } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import HeaderIcon from "../../assets/images/Sidebar/headerIcon.png";
import HeaderImage from "../../assets/images/Sidebar/headerImage.png";
import NotificationDropdown from "./Notification";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
  
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

  return (
<header className="p-4 flex justify-end items-end relative z-50 ">

  
      <div
        className="flex items-center justify-end gap-[46px] mr-16"
        style={{
          width: "398.1px",
          height: "44.88px",
          top: "40px",
          right: "10px",
        }}
      >
        {/* 🔍 Animated Search Box */}
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
            
            {/* Search Animation Line */}
            <div className={`
              absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400
              transform origin-left transition-all duration-500 ease-out
              ${isSearchFocused ? 'scale-x-100' : 'scale-x-0'}
            `} />
          </div>
        </div>

        {/* 🔔 Animated Notification Bell */}
        <div className="relative">
          <button 
            ref={bellRef}
            className={`
              relative w-[40px] h-[40px] rounded-2xl 
              flex items-center justify-center
              transition-all duration-500 ease-out
              group
              ${showNotifications 
                ? 'bg-blue-100 shadow-2xl transform scale-110 ring-2 ring-blue-400' 
                : 'bg-white shadow-lg hover:shadow-2xl hover:transform hover:scale-110'
              }
            `}
            onClick={() => setShowNotifications(!showNotifications)}
            onMouseEnter={() => setIsBellHovered(true)}
            onMouseLeave={() => setIsBellHovered(false)}
          >
            {/* Bell Icon with Multiple Animations */}
            <div className="relative">
              <img
                src={HeaderIcon}
                alt="Notifications"
                className={`
                  w-[18px] h-[18px] transition-all duration-500 ease-out
                  ${isBellHovered ? 'transform scale-110 rotate-6' : ''}
                  ${showNotifications ? 'animate-pulse' : ''}
                  group-hover:animate-bounce
                `}
              />
              
              {/* Ripple Effect */}
              <div className={`
                absolute inset-0 rounded-full bg-blue-400/20
                transform scale-0 transition-all duration-700 ease-out
                ${isBellHovered ? 'scale-150 opacity-0' : ''}
              `} />
            </div>

            {/* Pulsing Notification Dot */}
            <div className={`
              absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 
              rounded-full flex items-center justify-center text-white text-xs font-bold
              border-2 border-white
              transition-all duration-300 ease-out
              ${showNotifications ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
              animate-pulse
            `}>
              {notificationCount}
            </div>

            {/* Hover Glow */}
            <div className={`
              absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10
              opacity-0 transition-opacity duration-500
              ${isBellHovered ? 'opacity-100' : ''}
            `} />
          </button>
          
          {/* Notification Dropdown */}
          <NotificationDropdown 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* 👤 Animated Profile Picture */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsProfileHovered(true)}
          onMouseLeave={() => setIsProfileHovered(false)}
        >
          <div className={`
            relative w-[44px] h-[44px] rounded-2xl 
            bg-gradient-to-r from-blue-400 to-purple-500 
            p-0.5 transition-all duration-700 ease-out
            ${isProfileHovered 
              ? 'transform scale-110 shadow-2xl rotate-3' 
              : 'shadow-lg'
            }
          `}>
            {/* Profile Image Container */}
            <div className="w-full h-full rounded-xl bg-white overflow-hidden">
              <img
                src={HeaderImage}
                alt="Profile"
                className={`
                  w-full h-full object-cover rounded-xl
                  transition-all duration-700 ease-out
                  ${isProfileHovered ? 'transform scale-110' : ''}
                `}
              />
            </div>

            {/* Floating Elements on Hover */}
            <div className={`
              absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-500/30
              opacity-0 transition-all duration-1000 ease-out
              ${isProfileHovered ? 'opacity-100 animate-pulse' : ''}
            `} />
          </div>

          {/* Online Status with Animation */}
          <div className={`
            absolute bottom-0 right-0 w-4 h-4 bg-green-500 
            rounded-full border-3 border-white
            transition-all duration-500 ease-out
            ${isProfileHovered 
              ? 'transform scale-125 bg-green-400 shadow-lg' 
              : 'shadow-md'
            }
            animate-pulse
          `} />

          {/* Profile Tooltip */}
          <div className={`
            absolute top-full right-0 mt-3 px-4 py-2 
            bg-gray-900 text-white text-sm rounded-xl
            opacity-0 transform translate-y-4
            transition-all duration-500 ease-out
            whitespace-nowrap z-50
            pointer-events-none
            shadow-2xl
            ${isProfileHovered ? 'opacity-100 translate-y-2' : ''}
          `}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Online - View Profile</span>
            </div>
            <div className="absolute -top-1 right-4 w-3 h-3 bg-gray-900 transform rotate-45" />
          </div>
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