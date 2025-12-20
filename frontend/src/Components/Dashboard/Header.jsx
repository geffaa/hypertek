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


const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [notificationCount] = useState(3);
    const [userData, setUserData] = useState(null);
  

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

 

/// get the user profle 
useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("your user Response are :",res);
        setUserData(res.data.user);
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
        {/* <div className="relative">
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
            
            Search Animation Line
            <div className={`
              absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400
              transform origin-left transition-all duration-500 ease-out
              ${isSearchFocused ? 'scale-x-100' : 'scale-x-0'}
            `} />
          </div>
        </div> */}

        {/* 🔔 Animated Notification Bell */}
        {/* <div className="relative">
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
            Bell Icon with Multiple Animations
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
              
              Ripple Effect
              <div className={`
                absolute inset-0 rounded-full bg-blue-400/20
                transform scale-0 transition-all duration-700 ease-out
                ${isBellHovered ? 'scale-150 opacity-0' : ''}
              `} />
            </div>

            Pulsing Notification Dot
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

            Hover Glow
            <div className={`
              absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10
              opacity-0 transition-opacity duration-500
              ${isBellHovered ? 'opacity-100' : ''}
            `} />
          </button>
          
          Notification Dropdown
          <NotificationDropdown 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div> */}

        {/* 👤 Animated Profile Picture */}
  {/* 👤 Animated Profile Picture */}
<div className={`
  relative w-[44px] h-[44px] rounded-3xl 
  p-0.5 transition-all duration-700 ease-out
  ${isProfileHovered ? 'transform scale-110 rotate-3' : 'shadow-lg'}
`}>
  <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
    {userData?.Avatar ? (
      <img
        src={`${BACKEND_BASE_URL}${userData.Avatar}`}
        alt={userData?.FullName || "Profile"}
        className={`w-full h-full object-cover rounded-xl transition-all duration-700 ease-out ${isProfileHovered ? 'transform scale-110' : ''}`}
      />
    ) : (
      <FaUserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
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