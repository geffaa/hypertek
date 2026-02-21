import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import axios from "axios";

import Logo from "../../assets/Sidebar/logo1.png";
import DashboardImage from "../../assets/Sidebar/dashboard.png";
import CreateCollection1 from "../../assets/Sidebar/create1.png";
import CreateCollection2 from "../../assets/Sidebar/create2.png";
import CollectionImage from "../../assets/Sidebar/collections.png";
import EditUser from "../../assets/Sidebar/editUser.png";
import NewsImage from "../../assets/Sidebar/news.png";
import TransactionImage from "../../assets/Sidebar/transaction.png";
import SaleImage from "../../assets/Sidebar/sale.png";
import SupportImage from "../../assets/Sidebar/support.png";
import LogoutImage from "../../assets/Sidebar/logout.png";

import { Dashboard_Base_Url } from "../../Config";

const Sidebar = ({ onLogoutClick, isOpen, onClose }) => {
  const admin = useSelector((state) => state.admin.admin);
  const adminId = admin?._id;
  const location = useLocation();
  const path = location.pathname || "";
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [categories, setCategories] = useState([]);

  const sidebarRef = useRef(null);

  const withAdmin = (path) => (adminId ? `/${adminId}${path}` : "#");

  const handleLinkClick = (e, hasDropdown = false) => {
    if (window.innerWidth < 1024 && !hasDropdown) {
      onClose && onClose();
    }
  };

  const handleCategoryClick = (cat) => {
    if (!adminId) return;
    const categoryKey = (cat.key || "").toLowerCase();

    if (window.innerWidth < 1024) {
      onClose && onClose();
    }

    if (categoryKey) {
      navigate(`/${adminId}/collections/${categoryKey}`);
    } else {
      navigate(`/${adminId}/collections`);
    }
  };

  // Active state from URL (blue bg)
  const isDashboard = path.endsWith("/dashboard");
  const isCreate = path.includes("create-collection") || path.includes("edit-collection") || path.includes("creator-earning");
  const isCollection = path.includes("/collections");
  const isUsers = path.includes("/users");
  const isNews = path.includes("add-news") || path.includes("edit-news") || path.includes("other-news");
  const isSale = path.includes("collection-listed-sale");
  const isTransaction = path.includes("/transactions");
  const isSupport = path.includes("/support");

  // Toggle dropdowns
  const toggleDropdown = (type) => {
    setOpenCreate(type === "create" ? !openCreate : false);
    setOpenCollection(type === "collection" ? !openCollection : false);
    setOpenNews(type === "news" ? !openNews : false);
    setOpenTransaction(type === "transaction" ? !openTransaction : false);
    setOpenSale(type === "sale" ? !openSale : false);
  };

  // Close dropdowns if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenCreate(false);
        setOpenCollection(false);
        setOpenNews(false);
        setOpenTransaction(false);
        setOpenSale(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${Dashboard_Base_Url}/v1/nft/parent-collections`
      );
      const parents = res.data.collections || [];
      setCategories(
        parents.map((p) => ({
          key: (p.category || "").toLowerCase(),
          label: p.collection?.name || "Unnamed Collection",
        }))
      );
    } catch (err) {
      console.error("Sidebar category fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    const handleUpdate = () => fetchCategories();
    window.addEventListener("categoriesUpdated", handleUpdate);
    return () => window.removeEventListener("categoriesUpdated", handleUpdate);
  }, []);

  return (
    <div
      className={`sidebar text-white p-4 bg-[#100F0F] z-50 h-screen w-[280px] sm:w-[298px] overflow-y-auto fixed lg:sticky top-0 transition-transform duration-300 ease-in-out border-r border-white/5 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      ref={sidebarRef}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* LOGO & Close Button - Header */}
          <div className="flex items-center justify-between lg:justify-center mt-4 lg:mt-12 mb-8 lg:mb-12 px-2 lg:px-0">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <img src={Logo} alt="logo" className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]" />
              <Link to="https://hyper-tek-games.deventiatech.com">
                <span className="font-inter font-bold text-[16px] lg:text-[18px] leading-[22px]">
                  HYPER TEK
                </span>
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

          <ul className="flex flex-col items-center space-y-4">
            {/* Dashboard */}
            <Link to={withAdmin("/dashboard")} onClick={handleLinkClick} className="w-full max-w-[222px]">
              <li className={`menu-item ${isDashboard ? "bg-[#002AA8]" : "hover:bg-white/5"}`}>
                <img src={DashboardImage} className="w-[22px]" alt="" />
                <span>Dashboard</span>
              </li>
            </Link>

            {/* Create Collection */}
            <div className="w-full max-w-[222px]">
              <li
                onClick={() => toggleDropdown("create")}
                className={`menu-item justify-between ${isCreate ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-[20px] h-[20px]">
                    <img src={CreateCollection2} className="w-[20px] h-[20px]" alt="" />
                    <img
                      src={CreateCollection1}
                      className="w-[10px] h-[10px] absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2"
                      alt=""
                    />
                  </div>
                  <span>Create Collection</span>
                </div>
                {openCreate ? <FiChevronUp /> : <FiChevronDown />}
              </li>

              {openCreate && (
                <ul className="w-full mt-2 space-y-2 text-sm relative pl-[40px]">
                  {[
                    { key: "edit-collection", label: "Collection Details", path: "/edit-collection" },
                    { key: "creator-earning", label: "Creator Earning", path: "/creator-earning" }
                  ].map((item, index, array) => (
                    <Link key={item.key} to={withAdmin(item.path)} onClick={handleLinkClick}>
                      <li className={`submenu-item ${index === array.length - 1 ? "submenu-item-last" : ""}`}>
                        <div className="submenu-line">
                          <div className={index === array.length - 1 ? "line-vertical-short" : "line-vertical"}></div>
                          <div className="line-horizontal"></div>
                        </div>
                        <span>{item.label}</span>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>

            {/* Collection */}
            <div className="w-full max-w-[222px]">
              <li
                onClick={() => toggleDropdown("collection")}
                className={`menu-item justify-between ${isCollection ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-3">
                  <img src={CollectionImage} className="w-[22px]" alt="" />
                  <span>Collection</span>
                </div>
                {openCollection ? <FiChevronUp /> : <FiChevronDown />}
              </li>

              {openCollection && (
                <ul className="w-full mt-2 space-y-2 text-sm relative pl-[40px]">
                  {categories.map((cat, index) => (
                    <li
                      key={cat.key}
                      onClick={() => handleCategoryClick(cat)}
                      className={`submenu-item ${index === categories.length - 1 ? "submenu-item-last" : ""}`}
                    >
                      <div className="submenu-line">
                        <div className={index === categories.length - 1 ? "line-vertical-short" : "line-vertical"}></div>
                        <div className="line-horizontal"></div>
                      </div>
                      <span>{cat.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Users */}
            <Link to={withAdmin("/users")} onClick={handleLinkClick} className="w-full max-w-[222px]">
              <li className={`menu-item ${isUsers ? "bg-[#002AA8]" : "hover:bg-white/5"}`}>
                <img src={EditUser} className="w-[22px]" alt="" />
                <span>Edit User</span>
              </li>
            </Link>

            {/* News */}
            <div className="w-full max-w-[222px]">
              <li
                onClick={() => toggleDropdown("news")}
                className={`menu-item justify-between ${isNews ? "bg-[#002AA8]" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-3">
                  <img src={NewsImage} className="w-[22px]" alt="" />
                  <span>Upload News</span>
                </div>
                {openNews ? <FiChevronUp /> : <FiChevronDown />}
              </li>

              {openNews && (
                <ul className="w-full mt-2 space-y-2 text-sm relative pl-[40px]">
                  <Link to={withAdmin("/edit-news")} onClick={handleLinkClick}>
                    <li className="submenu-item">
                      <div className="submenu-line">
                        <div className="line-vertical"></div>
                        <div className="line-horizontal"></div>
                      </div>
                      <span>Edit News</span>
                    </li>
                  </Link>
                  <Link to={withAdmin("/other-news")} onClick={handleLinkClick}>
                    <li className="submenu-item submenu-item-last">
                      <div className="submenu-line">
                        <div className="line-vertical-short"></div>
                        <div className="line-horizontal"></div>
                      </div>
                      <span>Other News</span>
                    </li>
                  </Link>
                </ul>
              )}
            </div>

            {/* Collection on Sale */}
            <Link to={withAdmin("/collection-listed-sale")} onClick={handleLinkClick} className="w-full max-w-[222px]">
              <li className={`menu-item justify-between ${isSale ? "bg-[#002AA8]" : "hover:bg-white/5"}`}>
                <div className="flex items-center gap-3">
                  <img src={SaleImage} className="w-[22px]" alt="" />
                  <span>Collection on Sale</span>
                </div>
                {openSale ? <FiChevronUp /> : <FiChevronDown />}
              </li>
            </Link>

            {/* Transaction */}
            <Link to={withAdmin("/transactions")} onClick={handleLinkClick} className="w-full max-w-[222px]">
              <li className={`menu-item ${isTransaction ? "bg-[#002AA8]" : "hover:bg-white/5"}`}>
                <img src={TransactionImage} className="w-[22px]" alt="" />
                <span>Transaction</span>
              </li>
            </Link>

            {/* Support */}
            <Link to={withAdmin("/support")} onClick={handleLinkClick} className="w-full max-w-[222px]">
              <li className={`menu-item ${isSupport ? "bg-[#002AA8]" : "hover:bg-white/5"}`}>
                <img src={SupportImage} className="w-[22px]" alt="" />
                <span>Support</span>
              </li>
            </Link>
          </ul>
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogoutClick}
          className="mx-auto mb-6 mt-auto flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <img src={LogoutImage} className="w-[22px]" alt="" />
          <span className="font-bold">Sign Out</span>
        </button>
      </div>

      <style>{`
        .menu-item {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submenu-item {
          position: relative;
          padding-left: 28px;
          color: #cccccc;
          cursor: pointer;
          display: flex;
          align-items: center;
          min-height: 32px;
          transition: color 0.2s;
        }
        
        .submenu-item:hover {
          color: white;
        }
        
        .submenu-line {
          position: absolute;
          left: 0px;
          top: 0;
          height: 100%;
          width: 24px;
        }
        
        .line-vertical {
          position: absolute;
          left: 0;
          top: -8px;
          width: 1.5px;
          height: calc(100% + 8px);
          background-color: #444444;
        }
        
        .line-vertical-short {
          position: absolute;
          left: 0;
          top: -8px;
          width: 1.5px;
          height: calc(50% + 8px);
          background-color: #444444;
        }
        
        .line-horizontal {
          position: absolute;
          left: 0;
          top: 50%;
          width: 24px;
          height: 1.5px;
          background-color: #444444;
          transform: translateY(-50%);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;