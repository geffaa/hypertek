import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiFileText, FiTag, FiZap, FiPlusSquare, FiMessageSquare } from "react-icons/fi";

import Logo from "../../assets/logo-t-white.png";
import CreateCollection1 from "../../assets/images/Sidebar/create1.png";
import CreateCollection2 from "../../assets/images/Sidebar/create2.png";
import CollectionImage from "../../assets/images/Sidebar/collections.png";
import SupportImage from "../../assets/images/Sidebar/support.png";
import LogoutImage from "../../assets/images/Sidebar/logout.png";

const Sidebar = ({ isOpen, onClose, onLogoutClick }) => {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState("");

  const sidebarRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    setSelectedItem("");

    if (path.includes("/dashboard/add-user-collection") || path.includes("/dashboard/nfa-details")) {
      setSelectedItem("Create Collection");
    } else if (path.includes("/dashboard/collections")) {
      setSelectedItem("Collection");
    } else if (path.includes("/dashboard/transactions")) {
      setSelectedItem("transactions");
    } else if (path.includes("/dashboard/collection-on-sale")) {
      setSelectedItem("listings");
    } else if (path.includes("/dashboard/my-offers")) {
      setSelectedItem("my-offers");
    } else if (path.includes("/dashboard/withdraw")) {
      setSelectedItem("withdraw");
    } else if (path.includes("/dashboard/upload-nfc")) {
      setSelectedItem("upload-nfc");
    } else if (path.includes("/dashboard/support")) {
      setSelectedItem("support");
    }

    if (window.innerWidth < 1024) {
      onClose?.();
    }
  }, [location.pathname]);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
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
          {/* Logo & Close Button */}
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
            <button
              className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Menu */}
          <ul className="flex flex-col items-center">

            {/* Create NFT/NFC */}
            <Link to="/dashboard/add-user-collection" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-4 cursor-pointer rounded-md ${
                  selectedItem === "Create Collection" ? "bg-[#002AA8]" : "hover:bg-white/5"
                }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Create Collection")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={CreateCollection2} alt="" className="w-[16.5px] h-[16.5px]" />
                    <img src={CreateCollection1} alt="" className="w-[9.17px] h-[9.17px] absolute top-[30%] left-[70%] transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "17px" }}>
                    Create NFT/NFC
                  </h1>
                </div>
                <FiPlusSquare className="text-white/40 w-3 h-3 flex-shrink-0" />
              </li>
            </Link>

            {/* NFT/NFC Collection */}
            <Link to="/dashboard/collections" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-3 cursor-pointer rounded-md ${
                  selectedItem === "Collection" ? "bg-[#002AA8]" : "hover:bg-white/5"
                }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Collection")}
              >
                <div className="flex items-center">
                  <img src={CollectionImage} alt="" className="w-[22px] h-[22px]" />
                  <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "17px" }}>
                    My Collections
                  </h1>
                </div>
              </li>
            </Link>

            {/* Transactions */}
            <Link to="/dashboard/transactions" className="w-full max-w-[222px]">
              <li
                className={`flex items-center px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "transactions" ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
                style={{ width: "100%", height: "42px" }}
                onClick={() => handleItemClick("transactions")}
              >
                <FiFileText className="text-white w-[20px] h-[20px] flex-shrink-0" />
                <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  Transactions
                </h1>
              </li>
            </Link>

            {/* My Offers */}
            <Link to="/dashboard/my-offers" className="w-full max-w-[222px]">
              <li
                className={`flex items-center px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "my-offers" ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
                style={{ width: "100%", height: "42px" }}
                onClick={() => handleItemClick("my-offers")}
              >
                <FiMessageSquare className="text-white w-[20px] h-[20px] flex-shrink-0" />
                <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  My Offers
                </h1>
              </li>
            </Link>

            {/* My Listings */}
            <Link to="/dashboard/collection-on-sale" className="w-full max-w-[222px]">
              <li
                className={`flex items-center px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "listings" ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
                style={{ width: "100%", height: "42px" }}
                onClick={() => handleItemClick("listings")}
              >
                <FiTag className="text-white w-[20px] h-[20px] flex-shrink-0" />
                <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  My Listings
                </h1>
              </li>
            </Link>

            {/* Withdraw */}
            <Link to="/dashboard/withdraw" className="w-full max-w-[222px]">
              <li
                className={`flex items-center px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "withdraw" ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
                style={{ width: "100%", height: "42px" }}
                onClick={() => handleItemClick("withdraw")}
              >
                <FiZap className="text-white w-[20px] h-[20px] flex-shrink-0" />
                <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  Withdraw HB
                </h1>
              </li>
            </Link>

            {/* Support */}
            <Link to="/dashboard/support" className="w-full max-w-[222px]">
              <li
                className={`flex items-center px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "support" ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("support")}
              >
                <img src={SupportImage} alt="" className="w-[22px] h-[22px]" />
                <h1 className="text-white font-bold ml-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "17px" }}>
                  Support
                </h1>
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
            <h1 className="text-white font-bold ml-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "17px" }}>
              Sign Out
            </h1>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
