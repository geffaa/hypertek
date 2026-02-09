import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

const Sidebar = ({ onLogoutClick }) => {
  const admin = useSelector((state) => state.admin.admin);
  const adminId = admin?._id;

  const [openCreate, setOpenCreate] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [categories, setCategories] = useState([]);

  const sidebarRef = useRef(null);

  const withAdmin = (path) => (adminId ? `/${adminId}${path}` : "#");

  // Toggle dropdowns
  const toggleDropdown = (type, name) => {
    setOpenCreate(type === "create" ? !openCreate : false);
    setOpenCollection(type === "collection" ? !openCollection : false);
    setOpenNews(type === "news" ? !openNews : false);
    setOpenTransaction(type === "transaction" ? !openTransaction : false);
    setOpenSale(type === "sale" ? !openSale : false);
    setSelectedItem(name);
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

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${Dashboard_Base_Url}/v1/nft/parent-collections`
      );

      const parents = res.data.collections || [];

      const unique = Array.from(
        new Set(
          parents
            .map(
              (p) =>
                (p.category || p.collection?.name || "")
                  .toLowerCase()
                  .trim()
            )
            .filter(Boolean)
        )
      );

      setCategories(
        unique.map((c) => ({
          key: c,
          label: c.charAt(0).toUpperCase() + c.slice(1),
        }))
      );
    } catch (err) {
      console.error("Sidebar category fetch error:", err);
    }
  };

  // Initial fetch + listen for dynamic updates
  useEffect(() => {
    fetchCategories(); // first load

    const handleUpdate = () => {
      fetchCategories(); // refresh when event triggered
    };

    window.addEventListener("categoriesUpdated", handleUpdate);

    return () => {
      window.removeEventListener("categoriesUpdated", handleUpdate);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="text-white bg-[#100F0F] h-screen w-[298px] overflow-y-auto scrollbar-hide"
    >
      <div className="flex flex-col justify-between h-full p-4">
        {/* LOGO */}
        <div className="hidden lg:flex items-center gap-2 mt-4 ml-16">
          <img src={Logo} alt="logo" className="w-[25px]" />
          <span className="font-bold text-lg">HYPER TEK</span>
        </div>

        {/* MENU */}
        <ul className="flex flex-col items-center mt-8 space-y-4">
          {/* Dashboard */}
          <Link to={withAdmin("/dashboard")}>
            <li
              onClick={() => setSelectedItem("Dashboard")}
              className={`menu-item ${
                selectedItem === "Dashboard" && "bg-[#002AA8]"
              }`}
            >
              <img src={DashboardImage} className="w-[22px]" />
              <span>Dashboard</span>
            </li>
          </Link>

          {/* Create Collection */}
          <Link to={withAdmin("/create-collection")}>
            <li
              onClick={() => toggleDropdown("create", "Create")}
              className={`menu-item justify-between ${
                selectedItem === "Create" && "bg-[#002AA8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={CreateCollection2} className="w-[18px]" />
                <span>Create Collection</span>
              </div>
              {openCreate ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {openCreate && (
            <ul className="ml-8 space-y-2 text-sm">
              <Link to={withAdmin("/edit-collection")}>
                <li className="submenu">Collection Details</li>
              </Link>
              <Link to={withAdmin("/creator-earning")}>
                <li className="submenu">Creator Earning</li>
              </Link>
            </ul>
          )}

          {/* Collection */}
          <Link to={withAdmin("/collections")}>
            <li
              onClick={() => toggleDropdown("collection", "Collection")}
              className={`menu-item justify-between ${
                selectedItem === "Collection" && "bg-[#002AA8]"
              }`}
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
            <ul className="ml-8 mt-1 space-y-2">
              {categories.map((cat) => (
                <Link key={cat.key} to={withAdmin(`/collections/${cat.key}`)}>
                  <li className="submenu">{cat.label}</li>
                </Link>
              ))}
            </ul>
          )}

          {/* Users */}
          <Link to={withAdmin("/users")}>
            <li className="menu-item">
              <img src={EditUser} className="w-[22px]" />
              <span>Edit User</span>
            </li>
          </Link>

          {/* News */}
          <Link to={withAdmin("/add-news")}>
            <li
              onClick={() => toggleDropdown("news", "News")}
              className="menu-item justify-between"
            >
              <div className="flex items-center gap-3">
                <img src={NewsImage} className="w-[22px]" />
                <span>Upload News</span>
              </div>
              {openNews ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {openNews && (
            <ul className="ml-8 space-y-2 text-sm">
              <Link to={withAdmin("/edit-news")}>
                <li className="submenu">Edit News</li>
              </Link>
              <Link to={withAdmin("/other-news")}>
                <li className="submenu">Other News</li>
              </Link>
            </ul>
          )}

          {/* Transaction */}
          <Link to={withAdmin("/transactions")}>
            <li className="menu-item">
              <img src={TransactionImage} className="w-[22px]" />
              <span>Transaction</span>
            </li>
          </Link>

          {/* Support */}
          <Link to={withAdmin("/support")}>
            <li className="menu-item">
              <img src={SupportImage} className="w-[22px]" />
              <span>Support</span>
            </li>
          </Link>
        </ul>

        {/* LOGOUT */}
        <button onClick={onLogoutClick} className="mx-auto mb-6 mt-8 flex gap-2">
          <img src={LogoutImage} className="w-[22px]" />
          <span className="font-bold">Sign Out</span>
        </button>
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
          border-radius: 6px;
          cursor: pointer;
        }
        .submenu {
          color: white;
          cursor: pointer;
        }
        .submenu:hover {
          color: #cbd5f5;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
