import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";

import Logo from "../../assets/logo-t-white.png";
import CreateCollection1 from "../../assets/images/Sidebar/create1.png";
import CreateCollection2 from "../../assets/images/Sidebar/create2.png";
import CollectionImage from "../../assets/images/Sidebar/collections.png";
import SupportImage from "../../assets/images/Sidebar/support.png";
import LogoutImage from "../../assets/images/Sidebar/logout.png";

const Sidebar = ({ isOpen, onClose, onLogoutClick }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const sidebarRef = useRef(null);

  // Check current path on component mount and location change
  useEffect(() => {
    const path = location.pathname;

    // Clear selected item first
    setSelectedItem("");

    // Set selected item based on current route
    if (path.includes("/dashboard/create-nfa") || path.includes("/dashboard/nfa-details")) {
      setSelectedItem("Create Collection");
      setOpenCreate(true);
    } else if (path.includes("/dashboard/collections")) {
      setSelectedItem("Collection");
    } else if (path.includes("/dashboard/support")) {
      setSelectedItem("support");
    }

    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  }, [location.pathname]);

  const toggleDropdown = (clickedDropdown, itemName) => {
    setOpenCreate(clickedDropdown === "create" ? !openCreate : false);
    setSelectedItem(itemName);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenCreate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
    setOpenCreate(false);
  };



  // Check if a route is active
  const isRouteActive = (routePath) => {
    return location.pathname === routePath || location.pathname.startsWith(routePath + "/");
  };

  return (
    <div
      className={`sidebar text-white p-4 bg-[#100F0F] z-50 h-screen fixed lg:relative transition-all duration-300 ease-in-out overflow-y-auto border-r border-white/5
        ${isOpen ? 'left-0' : '-left-full lg:left-0'} 
        w-[280px] sm:w-[298px]`}
      ref={sidebarRef}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* Logo & Close Button - Header */}
          <div className="flex items-center justify-between lg:justify-center mt-4 lg:mt-12 mb-8 lg:mb-12">
            <div className="flex flex-col items-center gap-3">
              <Link to="/">
                <img src={Logo} alt="logo" className="w-[140px] h-auto object-contain" />
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 transition-colors"
              >
                ← Back to Website
              </Link>
            </div>

            {/* Close Button - Mobile Only */}
            <button
              className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Menu */}
          <ul className="flex flex-col items-center">
            <Link to="/dashboard">
              {/* <li
                className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer ${
                  selectedItem === "Dashboard" ? "bg-[#002AA8]" : ""
                }`}
                style={{ width: "222px", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Dashboard")}
              >
                <img
                  src={DashboardImage}
                  alt="Dashboard Icon"
                  style={{ width: "22px", height: "22px" }}
                />
                <h1
                  className="text-white font-bold"
                  style={{
                    width: "100px",
                    height: "17px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "17px",
                  }}
                >
                  Dashboard
                </h1>
              </li> */}
            </Link>

            {/* Create Collection 2 - Default blue only if no other item is selected */}
            <li
              className={`flex items-center justify-between px-3 mt-4 cursor-pointer rounded-md ${selectedItem === "Create Collection" ||
                (selectedItem === "" && isRouteActive("/dashboard"))
                ? "bg-[#002AA8]"
                : "hover:bg-white/5"
                }`}
              style={{ width: "100%", maxWidth: "222px", height: "42px", opacity: 1 }}
              onClick={() => {
                toggleDropdown("create", "Create Collection");
                navigate("/dashboard");
              }}
            >
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={CreateCollection2}
                    alt=""
                    className="w-[16.5px] h-[16.5px]"
                  />
                  <img
                    src={CreateCollection1}
                    alt=""
                    className="w-[9.17px] h-[9.17px] absolute top-[30%] left-[70%] transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <h1
                  className="text-white font-bold ml-3"
                  style={{
                    width: "120px",
                    height: "17px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "17px",
                  }}
                >
                  Create NFA's
                </h1>
              </div>

              {openCreate ? (
                <FiChevronUp className="text-white" />
              ) : (
                <FiChevronDown className="text-white" />
              )}
            </li>

            {/* Dropdown Options for Create NFA */}
            {openCreate && (
              <ul className="flex flex-col items-start w-[129px] h-[27px]  opacity-100 rounded mr-3">
                {/* <div className="flex">
                  <div className="w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b border-b-[#494A4C]"></div>
                  <li
                    className={`w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal pt-2 leading-none hover:text-slate-300 cursor-pointer ${
                      isRouteActive("/dashboard/create-nfa")
                        ? "text-blue-400 font-semibold"
                        : "text-white"
                    }`}
                  >
                    <Link to="/dashboard">Create NFA</Link>
                  </li>
                </div> */}
                <div className="flex">
                  <div className="w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b border-b-[#494A4C]"></div>
                  <li
                    className={`w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal pt-2 leading-none hover:text-slate-300 cursor-pointer ${isRouteActive("/dashboard/nfa-details")
                      ? "text-blue-400 font-semibold"
                      : "text-white"
                      }`}
                  >
                    <Link to="/dashboard/nfa-details">NFA's Details</Link>
                  </li>
                </div>
              </ul>
            )}

            {/* NFA's Collection */}
            <Link to="/dashboard/collections" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "Collection"
                  ? "bg-[#002AA8]"
                  : "hover:bg-white/5"
                  }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Collection")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={CollectionImage} alt="" className="w-[22px] h-[22px]" />
                  </div>
                  <h1
                    className="text-white font-bold ml-3"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "17px",
                    }}
                  >
                    NFA's Collection
                  </h1>
                </div>
              </li>
            </Link>

            {/* Support */}
            <Link to="/dashboard/support" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "support"
                  ? "bg-[#002AA8]"
                  : "hover:bg-white/5"
                  }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("support")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={SupportImage} alt="" className="w-[22px] h-[22px]" />
                  </div>
                  <h1
                    className="text-white font-bold ml-3"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "17px",
                    }}
                  >
                    Support
                  </h1>
                </div>
              </li>
            </Link>
          </ul>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onLogoutClick}
          className="mx-auto w-[122px] h-[48px] rounded-[10px] px-[15px] py-[12px] flex items-center cursor-pointer opacity-100 mt-auto mb-4"
        >
          <div className="flex items-center">
            <img src={LogoutImage} alt="" className="w-[22px] h-[22px]" />
            <h1
              className="text-white font-bold ml-1"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "17px",
              }}
            >
              Sign Out
            </h1>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;