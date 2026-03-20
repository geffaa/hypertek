import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useSelector } from "react-redux";
import axios from "axios";

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

const Logo = "/logo-t-white.png";

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
    if (window.innerWidth < 1024) onClose && onClose();

    navigate(
      categoryKey
        ? `/${adminId}/collections/${categoryKey}`
        : `/${adminId}/collections`
    );
  };

  const isDashboard = path.endsWith("/dashboard") || (adminId && (path === `/${adminId}` || path === `/${adminId}/`));
  const isCreate =
    path.includes("create-collection") ||
    path.includes("edit-collection") ||
    path.includes("creator-earning");
  const isCollection = path.includes("/collections");
  const isUsers = path.includes("/users");
  const isNews =
    path.includes("add-news") ||
    path.includes("edit-news") ||
    path.includes("other-news");
  const isSale = path.includes("collection-listed-sale");
  const isTransaction = path.includes("/transactions");
  const isSupport = path.includes("/support");
  const isWaitlist = path.includes("/waitlist");
  const isArtists = path.includes("/artists") || path.includes("/artist-form");
  const isRoyaltyPayouts = path.includes("/royalty-payouts");

  const toggleDropdown = (type) => {
    setOpenCreate(type === "create" ? !openCreate : false);
    setOpenCollection(type === "collection" ? !openCollection : false);
    setOpenNews(type === "news" ? !openNews : false);
    setOpenTransaction(type === "transaction" ? !openTransaction : false);
    setOpenSale(type === "sale" ? !openSale : false);
  };

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
    window.addEventListener("categoriesUpdated", fetchCategories);
    return () =>
      window.removeEventListener("categoriesUpdated", fetchCategories);
  }, []);

  // ✅ Auto-open dropdown on category pages, close on main collections page
  useEffect(() => {
    const isMainCollections = path.endsWith("/collections");
    const isSpecificCategory = path.includes("/collections/") && path.split("/").length > 3;

    if (isSpecificCategory) {
      setOpenCollection(true);
    } else if (isMainCollections) {
      setOpenCollection(false);
    }
  }, [path]);

  return (
    <div
      className={`sidebar text-white p-3 z-50 h-screen w-[270px] overflow-y-auto fixed lg:sticky top-0 transition-transform duration-300 ease-in-out ${isOpen
        ? "translate-x-0"
        : "-translate-x-full lg:translate-x-0"
        }`}
      style={{ background: "#0a0b18", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      ref={sidebarRef}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* LOGO */}
          <div className="flex justify-center mt-10 mb-10">
            <div className="hidden lg:flex items-center justify-center cursor-pointer">
              <Link to={import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}>
                <img src={Logo} alt="logo" className="w-[140px] h-auto object-contain" />
              </Link>
            </div>
          </div>

          {/* MENU */}
          <ul className="flex flex-col items-center space-y-3">
            <Link to={withAdmin("/dashboard")} onClick={handleLinkClick}>
              <li className={`menu-item ${isDashboard ? "bg-[#002AA8]" : ""}`}>
                <img src={DashboardImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Dashboard</span>
              </li>
            </Link>

            <Link to={withAdmin("/platform-earnings")} onClick={handleLinkClick}>
              <li className={`menu-item ${path.includes("platform-earnings") ? "bg-[#002AA8]" : ""}`}>
                <img src={CreateCollection2} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Platform Earnings</span>
              </li>
            </Link>



            {/* Create Collection */}

            <Link to={withAdmin("/create-collection")} onClick={(e) => handleLinkClick(e, true)}>

              <li

                onClick={() => toggleDropdown("create")}

                className={`menu-item justify-between ${isCreate ? "bg-[#002AA8]" : ""}`}

              >

                <div className="flex items-center gap-3">
                  <div className="relative w-[20px] h-[20px] flex-shrink-0">
                    <img src={CreateCollection2} className="w-[20px] h-[20px] object-contain" />
                    <img
                      src={CreateCollection1}
                      className="w-[10px] h-[10px] absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    />
                  </div>
                  <span className="pt-[2px]">Create Collection</span>
                </div>



                {openCreate ? <FiChevronUp /> : <FiChevronDown />}

              </li>

            </Link>



            {openCreate && (

              <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[50px]">

                {[

                  { key: "edit-collection", label: "Collection Details", path: "/edit-collection" },

                  { key: "creator-earning", label: "Creator Earning", path: "/creator-earning" }

                ].map((item, index, array) => (

                  <Link key={item.key} to={withAdmin(item.path)} onClick={handleLinkClick}>

                    <li

                      className={`submenu-item ${index === array.length - 1 ? "submenu-item-last" : ""}`}

                    >

                      <div className="submenu-line">

                        <div

                          className={

                            index === array.length - 1

                              ? "line-vertical-short"

                              : "line-vertical"

                          }

                        ></div>

                        <div className="line-horizontal"></div>

                      </div>

                      <span>{item.label}</span>

                    </li>

                  </Link>

                ))}

              </ul>

            )}



            {/* Collection */}
            <Link to={withAdmin("/collections")} onClick={(e) => handleLinkClick(e, true)}>
              <li
                className={`menu-item justify-between ${isCollection ? "bg-[#002AA8]" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <img src={CollectionImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <span className="pt-[2px]">Collection</span>
                </div>
                {openCollection ? <FiChevronUp /> : <FiChevronDown />}
              </li>
            </Link>



            {/* 🔥 Dynamic Categories */}

            {openCollection && (

              <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[50px]">

                {categories.map((cat, index) => (

                  <li

                    key={cat.key}

                    onClick={() => handleCategoryClick(cat)}

                    className={`submenu-item ${index === categories.length - 1 ? "submenu-item-last" : ""

                      } ${path.includes(`/collections/${cat.key}`) ? "text-white" : "text-[#FFFFFFC4] hover:text-white"}`}

                  >

                    <div className="submenu-line">

                      <div

                        className={

                          index === categories.length - 1

                            ? "line-vertical-short"

                            : "line-vertical"

                        }

                      ></div>

                      <div className="line-horizontal"></div>

                    </div>



                    <span>{cat.label}</span>

                  </li>

                ))}

              </ul>

            )}



            {/* Users */}
            <Link to={withAdmin("/users")} onClick={handleLinkClick}>
              <li className={`menu-item ${isUsers ? "bg-[#002AA8]" : ""}`}>
                <img src={EditUser} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Edit User</span>
              </li>
            </Link>



            {/* News */}
            <Link to={withAdmin("/add-news")} onClick={(e) => handleLinkClick(e, true)}>
              <li
                onClick={() => toggleDropdown("news")}
                className={`menu-item justify-between ${isNews ? "bg-[#002AA8]" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <img src={NewsImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <span className="pt-[2px]">Upload News</span>
                </div>
                {openNews ? <FiChevronUp /> : <FiChevronDown />}
              </li>
            </Link>



            {openNews && (

              <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[50px]">

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

            <Link to={withAdmin("/collection-listed-sale")} onClick={(e) => handleLinkClick(e, true)}>
              <li
                className={`menu-item justify-between ${isSale ? "bg-[#002AA8]" : ""}`}
                onClick={() => toggleDropdown("sale")}
              >
                <div className="flex items-center gap-3">
                  <img src={SaleImage} alt="" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <span className="pt-[2px]">Collection on Sale</span>
                </div>
                {openSale ? <FiChevronUp /> : <FiChevronDown />}
              </li>
            </Link>



            {/* Transaction */}
            <Link to={withAdmin("/transactions")} onClick={handleLinkClick}>
              <li className={`menu-item ${isTransaction ? "bg-[#002AA8]" : ""}`}>
                <img src={TransactionImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Transaction</span>
              </li>
            </Link>

            {/* Support */}
            <Link to={withAdmin("/support")} onClick={handleLinkClick}>
              <li className={`menu-item ${isSupport ? "bg-[#002AA8]" : ""}`}>
                <img src={SupportImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Support</span>
              </li>
            </Link>

            {/* Waitlist */}
            <Link to={withAdmin("/waitlist")} onClick={handleLinkClick}>
              <li className={`menu-item ${isWaitlist ? "bg-[#002AA8]" : ""}`}>
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="pt-[2px]">Waitlist</span>
              </li>
            </Link>

            {/* Artists */}
            <Link to={withAdmin("/artists")} onClick={handleLinkClick}>
              <li className={`menu-item ${isArtists ? "bg-[#002AA8]" : ""}`}>
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m-7 7h4v4H6a2 2 0 01-2-2v-4a2 2 0 012-2h1z" />
                </svg>
                <span className="pt-[2px]">Artists</span>
              </li>
            </Link>

            {/* Royalty Payouts */}
            <Link to={withAdmin("/royalty-payouts")} onClick={handleLinkClick}>
              <li className={`menu-item ${isRoyaltyPayouts ? "bg-[#002AA8]" : ""}`}>
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="pt-[2px]">Royalty Payouts</span>
              </li>
            </Link>

            {/* Website Editor */}
            <Link to={withAdmin("/website-editor")} onClick={handleLinkClick}>
              <li className={`menu-item ${path.includes("website-editor") ? "bg-[#002AA8]" : ""}`}>
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="pt-[2px]">Website Editor</span>
              </li>
            </Link>

          </ul>

        </div>



        {/* LOGOUT */}

        <div className="mt-auto mb-6 flex justify-center w-full">
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-3 text-white cursor-pointer"
          >
            <img src={LogoutImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
            <span className="font-bold text-[14px] pt-[1px]">Sign out</span>
          </button>
        </div>

      </div>



      {/* TAILWIND HELPERS */}

      <style>{`
.menu-item {
  width: 222px;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0%;
}
.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.submenu-item {
  position: relative;
  padding-left: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 24px;
  transition: all 0.2s ease;

  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
}

.submenu-line {
  position: absolute;
  left: 0px;
  top: 0;
  height: 100%;
  width: 20px;
}

.line-vertical {
  position: absolute;
  left: 0;
  top: -12px;
  width: 1.5px;
  height: calc(100% + 12px);
  background-color: #666666;
}

.line-vertical-short {
  position: absolute;
  left: 0;
  top: -12px;
  width: 1.5px;
  height: calc(50% + 12px);
  background-color: #666666;
}

.line-horizontal {
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 1.5px;
  background-color: #666666;
  transform: translateY(-50%);
}

.submenu-item-last .line-vertical {
  display: none;
}
.sidebar::-webkit-scrollbar {
  display: none;
}
.sidebar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`}</style>
    </div>

  );

};



export default Sidebar;