import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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
    if (window.innerWidth < 1024) onClose && onClose();

    navigate(
      categoryKey
        ? `/${adminId}/collections/${categoryKey}`
        : `/${adminId}/collections`
    );
  };

  const isDashboard = path.endsWith("/dashboard");
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

  return (
    <div
      className={`sidebar text-white p-3 bg-[#100F0F] z-50 h-screen w-[270px] overflow-y-auto fixed lg:sticky top-0 transition-transform duration-300 ease-in-out ${
        isOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      }`}
      ref={sidebarRef}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* LOGO */}
          <div className="flex justify-center mt-10 mb-10">
            <div className="hidden lg:flex items-center gap-1.5 cursor-pointer">
              <img src={Logo} alt="logo" className="w-[30px] h-[30px]" />
              <Link to="https://hyper-tek-games.deventiatech.com">
                <span className="font-inter font-bold text-[16px] leading-[20px]">
                  HYPER TEK
                </span>
              </Link>
            </div>
          </div>

          {/* MENU */}
          <ul className="flex flex-col items-center space-y-3">
            <Link to={withAdmin("/dashboard")} onClick={handleLinkClick}>
              <li className={`menu-item ${isDashboard ? "bg-[#002AA8]" : ""}`}>
                <img src={DashboardImage} className="w-[20px]" />
                <span>Dashboard</span>
              </li>
            </Link>

            <Link to={withAdmin("/platform-earnings")} onClick={handleLinkClick}>
              <li className={`menu-item ${path.includes("platform-earnings") ? "bg-[#002AA8]" : ""}`}>
                <img src={CreateCollection2} className="w-[18px]" />
                <span>Platform Earnings</span>
              </li>
            </Link>



            {/* Create Collection */}

            <Link to={withAdmin("/create-collection")} onClick={(e) => handleLinkClick(e, true)}>

              <li

                onClick={() => toggleDropdown("create")}

                className={`menu-item justify-between ${isCreate ? "bg-[#002AA8]" : ""}`}

              >

                <div className="flex items-center gap-3">

                  <div className="relative w-[20px] h-[20px]">

                    <img src={CreateCollection2} className="w-[20px] h-[20px]" />



                    <img

                      src={CreateCollection1}

                      className="w-[10px] h-[10px] absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2"

                    />

                  </div>



                  <span>Create Collection</span>

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

                onClick={() => toggleDropdown("collection")}

                className={`menu-item justify-between ${isCollection ? "bg-[#002AA8]" : ""}`}

              >

                <div className="flex items-center gap-3">

                  <img src={CollectionImage} className="w-[22px]" />

                  <span>Collection</span>

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

                      }`}

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

                <img src={EditUser} className="w-[22px]" />

                <span>Edit User</span>

              </li>

            </Link>



            {/* News */}

            <Link to={withAdmin("/add-news")} onClick={(e) => handleLinkClick(e, true)}>

              <li

                onClick={() => toggleDropdown("news")}

                className={`menu-item justify-between ${isNews ? "bg-[#002AA8]" : ""}`}

              >

                <div className="flex items-center gap-3">

                  <img src={NewsImage} className="w-[22px]" />

                  <span>Upload News</span>

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

                className={`flex items-center justify-between px-3 mt-4 cursor-pointer rounded-md ${isSale ? "bg-[#002AA8]" : ""

                  }`}

                style={{ width: "222px", height: "42px", opacity: 1 }}

                onClick={() => toggleDropdown("sale")}

              >

                <div className="flex items-center">

                  <div className="relative">

                    <img src={SaleImage} alt="" className="w-[22px] h-[22px]" />

                  </div>

                  <h1

                    className="text-white font-normal ml-3"

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



                {openSale ? (

                  <FiChevronUp className="text-white" />

                ) : (

                  <FiChevronDown className="text-white" />

                )}

              </li>

            </Link>



            {/* Transaction */}

            <Link to={withAdmin("/transactions")} onClick={handleLinkClick}>

              <li className={`menu-item ${isTransaction ? "bg-[#002AA8]" : ""}`}>

                <img src={TransactionImage} className="w-[22px]" />

                <span>Transaction</span>

              </li>

            </Link>



            {/* Support */}

            <Link to={withAdmin("/support")} onClick={handleLinkClick}>

              <li className={`menu-item ${isSupport ? "bg-[#002AA8]" : ""}`}>

                <img src={SupportImage} className="w-[22px]" />

                <span>Support</span>

              </li>

            </Link>

          </ul>

        </div>



        {/* LOGOUT */}

        <button

          onClick={onLogoutClick}

          className="mx-auto mb-4 mt-auto flex gap-1"

        >

          <img src={LogoutImage} className="w-[22px]" />

          <span className="font-bold">Sign Out</span>

        </button>

      </div>



      {/* TAILWIND HELPERS */}

      <style>{`
.menu-item {
  width: 200px;
  height: 38px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  cursor: pointer;

  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
}

.submenu-item {
  position: relative;
  padding-left: 24px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 24px;

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
  top: -6px;
  width: 1.5px;
  height: calc(100% + 6px);
  background-color: #666666;
}

.line-vertical-short {
  position: absolute;
  left: 0;
  top: -6px;
  width: 1.5px;
  height: calc(50% + 6px);
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
`}</style>
    </div>

  );

};



export default Sidebar;