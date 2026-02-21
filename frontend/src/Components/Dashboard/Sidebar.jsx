import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiDollarSign, FiX } from "react-icons/fi";

import Logo from "../../assets/logo1.png";
import DashboardImage from "../../assets/images/Sidebar/dashboard.png";
import CreateCollection1 from "../../assets/images/Sidebar/create1.png";
import CreateCollection2 from "../../assets/images/Sidebar/create2.png";
import CollectionImage from "../../assets/images/Sidebar/collections.png";
import EditUser from "../../assets/images/Sidebar/editUser.png";
import NewsImage from "../../assets/images/Sidebar/news.png";
import TransactionImage from "../../assets/images/Sidebar/transaction.png";
import SaleImage from "../../assets/images/Sidebar/sale.png";
import SupportImage from "../../assets/images/Sidebar/support.png";
import LogoutImage from "../../assets/images/Sidebar/logout.png";

const Sidebar = ({ isOpen, onClose, onLogoutClick }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const [openCreate, setOpenCreate] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSale, setOpenSale] = useState(false);
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
    } else if (path.includes("/dashboard/edit-profile")) {
      setSelectedItem("users");
    } else if (path.includes("/add-news") || path.includes("/edit-news") || path.includes("/other-news")) {
      setSelectedItem("News");
      setOpenNews(true);
    } else if (path.includes("/collection-listed-sale") || path.includes("/dashboard/collection-on-sale")) {
      setSelectedItem("Sale");
    } else if (path.includes("/dashboard/transactions")) {
      setSelectedItem("Transaction");
    } else if (path.includes("/dashboard/support")) {
      setSelectedItem("support");
    } else if (path.includes("/dashboard/withdraw")) {
      setSelectedItem("withdraw");
    }

    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  }, [location.pathname]);

  const toggleDropdown = (clickedDropdown, itemName) => {
    setOpenCreate(clickedDropdown === "create" ? !openCreate : false);
    setOpenCollection(
      clickedDropdown === "collection" ? !openCollection : false
    );
    setOpenNews(clickedDropdown === "news" ? !openNews : false);
    setOpenTransaction(
      clickedDropdown === "transaction" ? !openTransaction : false
    );
    setOpenSale(clickedDropdown === "sale" ? !openSale : false);

    setSelectedItem(itemName);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenCreate(false);
        setOpenCollection(false);
        setOpenNews(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
    setOpenCreate(false);
    setOpenCollection(false);
    setOpenNews(false);
  };



  const handleClickBack = () => {
    navigate("/")
  }

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
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleClickBack}>
              <img src={Logo} alt="Logo" className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]" />
              <span className="font-inter font-bold text-[16px] lg:text-[18px] leading-[22px]">
                HYPER TEK
              </span>
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
              onClick={() => toggleDropdown("create", "Create Collection")}
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
            {/* <Link to="/dashboard/collections">
              <li
                className={`flex items-center justify-between px-3 mt-4 cursor-pointer ${
                  selectedItem === "Collection"
                    ? "bg-[#002AA8]"
                    : ""
                }`}
                style={{ width: "222px", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Collection")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={CollectionImage} alt="" className="w-[22px] h-[22px]" />
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
                    NFA's Collection
                  </h1>
                </div>
              </li>
            </Link> */}

            {/* Edit User */}
            <Link to="/dashboard/edit-profile " className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "users"
                  ? "bg-[#002AA8]"
                  : "hover:bg-white/5"
                  }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("users")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={EditUser} alt="" className="w-[22px] h-[22px]" />
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
                    Edit User
                  </h1>
                </div>
              </li>
            </Link>

            {/* Update News */}
            {/* <li
              className={`flex items-center justify-between px-3 mt-4 cursor-pointer ${
                selectedItem === "News"
                  ? "bg-[#002AA8]"
                  : ""
              }`}
              style={{ width: "222px", height: "42px", opacity: 1 }}
              onClick={() => toggleDropdown("news", "News")}
            >
              <div className="flex items-center">
                <div className="relative">
                  <img src={NewsImage} alt="" className="w-[22px] h-[22px]" />
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
                  Update News
                </h1>
              </div>

              {openNews ? (
                <FiChevronUp className="text-white" />
              ) : (
                <FiChevronDown className="text-white" />
              )}
            </li> */}

            {/* Dropdown Options for News */}
            {openNews && (
              <ul className="flex flex-col items-start w-[129px] h-[60px] mb-2 opacity-100 rounded mr-3">
                <div className="flex">
                  <div className="w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b border-b-[#494A4C]"></div>
                  <li
                    className={`w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal pt-2 leading-none hover:text-slate-300 cursor-pointer ${isRouteActive("/add-news") ? "text-blue-400 font-semibold" : "text-white"
                      }`}
                  >
                    <Link to="/add-news">Add News</Link>
                  </li>
                </div>
                <div className="flex">
                  <div className="w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b border-b-[#494A4C]"></div>
                  <li
                    className={`w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal pt-2 leading-none hover:text-slate-300 cursor-pointer ${isRouteActive("/edit-news") ? "text-blue-400 font-semibold" : "text-white"
                      }`}
                  >
                    <Link to="/edit-news">Edit News</Link>
                  </li>
                </div>
                <div className="flex">
                  <div className="w-[16px] h-[22.21px] border-l border-l-[#494A4C] border-b border-b-[#494A4C]"></div>
                  <li
                    className={`w-[120px] h-[17px] font-inter text-sm ps-1 items-end pt-3 font-normal pt-2 leading-none hover:text-slate-300 cursor-pointer ${isRouteActive("/other-news") ? "text-blue-400 font-semibold" : "text-white"
                      }`}
                  >
                    <Link to="/other-news">Other News</Link>
                  </li>
                </div>
              </ul>
            )}

            {/* Collection on Sale */}
            {/* <Link to="/dashboard/collection-on-sale">
              <li
                className={`flex items-center justify-between px-3 mt-4 cursor-pointer ${
                  selectedItem === "Sale"
                    ? "bg-[#002AA8]"
                    : ""
                }`}
                style={{ width: "222px", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Sale")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={SaleImage} alt="" className="w-[22px] h-[22px]" />
                  </div>
                  <h1
                    className="text-white font-bold ml-3"
                    style={{
                      width: "130px",
                      height: "17px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "17px",
                    }}
                  >
                    Collection on Sale
                  </h1>
                </div>
              </li>
            </Link> */}

            {/* Transaction */}
            <Link to="/dashboard/transactions" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-3 cursor-pointer rounded-md ${selectedItem === "Transaction"
                  ? "bg-[#002AA8]"
                  : "hover:bg-white/5"
                  }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("Transaction")}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img src={TransactionImage} alt="" className="w-[22px] h-[22px]" />
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
                    Transaction
                  </h1>
                </div>
              </li>
            </Link>

            {/* Support */}
            <Link to="/dashboard/support" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-4 cursor-pointer rounded-md ${selectedItem === "support"
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
                      width: "120px",
                      height: "17px",
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

            {/* Withdraw */}
            <Link to="/dashboard/withdraw" className="w-full max-w-[222px]">
              <li
                className={`flex items-center justify-between px-3 mt-4 cursor-pointer rounded-md ${selectedItem === "withdraw"
                  ? "bg-[#002AA8]"
                  : "hover:bg-white/5"
                  }`}
                style={{ width: "100%", height: "42px", opacity: 1 }}
                onClick={() => handleItemClick("withdraw")}
              >
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center w-[22px] h-[22px]">
                    {/* Using Icon as we might not have specific asset */}
                    <FiDollarSign className="text-white w-5 h-5" />
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
                    Withdraw
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