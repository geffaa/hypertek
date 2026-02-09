import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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
import { useSelector } from "react-redux";
import axios from "axios";
import { Dashboard_Base_Url } from "../../Config";

const Sidebar = ({ onLogoutClick }) => {
  const admin = useSelector((state) => state.admin.admin);
  const adminId = admin?._id;

  const [openCreate, setOpenCreate] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openNews, setOpenNews] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  const sidebarRef = useRef(null);

  const toggleDropdown = (clickedDropdown, itemName) => {
    setOpenCreate(clickedDropdown === "create" ? !openCreate : false);
    setOpenCollection(clickedDropdown === "collection" ? !openCollection : false);
    setOpenNews(clickedDropdown === "news" ? !openNews : false);
    setOpenTransaction(clickedDropdown === "transaction" ? !openTransaction : false);
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
        setOpenTransaction(false);
        setOpenSale(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch parent collections and derive unique categories for sidebar
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${Dashboard_Base_Url}/v1/nft/parent-collections`
        );
        const parents = res.data.collections || [];
        const unique = Array.from(
          new Set(
            parents
              .map((p) =>
                (p.category || p.collection?.name || "").toLowerCase().trim()
              )
              .filter(Boolean)
          )
        );
        if (!mounted) return;
        setCategories(
          unique.map((c) => ({
            key: c,
            label: c.charAt(0).toUpperCase() + c.slice(1),
            route:
              c === "characters" || c === "character"
                ? "/character-collection"
                : c === "land"
                ? "/land-collection"
                : "/collections",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch categories for sidebar:", err);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
    setOpenCreate(false);
    setOpenCollection(false);
    setOpenNews(false);
    setOpenTransaction(false);
    setOpenSale(false);
  };

  const withAdmin = (path) => {
    if (!adminId) return "#";
    return `/${adminId}${path}`;
  };

  return (
    <div
      ref={sidebarRef}
      className="text-white bg-[#100F0F] h-screen w-[298px] overflow-y-auto scrollbar-hide"
    >
      <div className="flex flex-col justify-between h-full p-4">
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-2 mt-4 ml-16">
          <img src={Logo} alt="logo" className="w-[25px]" />
          <span className="font-bold text-lg">HYPER TEK</span>
        </div>

        {/* Menu */}
        <ul className="flex flex-col items-center mt-8 space-y-4">
          {/* Dashboard 1 */}
          <Link to={withAdmin("/dashboard")}>
            <li
              onClick={() => handleItemClick("Dashboard")}
              className={`menu-item ${
                selectedItem === "Dashboard" && "bg-[#002AA8]"
              }`}
            >
              <img src={DashboardImage} className="w-[22px]" alt="Dashboard" />
              <span>Dashboard</span>
            </li>
          </Link>

          {/* Create Collection 2 */}
          <Link to={withAdmin("/create-collection")}>
            <li
              onClick={() => toggleDropdown("create", "Create Collection")}
              className={`menu-item justify-between ${
                selectedItem === "Create Collection" && "bg-[#002AA8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={CreateCollection2} className="w-[18px]" alt="Create" />
                <span>Create Collection</span>
              </div>
              {openCreate ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {/* Dropdown Options */}
          {openCreate && (
            <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[38px]">
              <Link to={withAdmin("/edit-collection")}>
                <li className="submenu-item">
                  <div className="submenu-line">
                    <div className="line-vertical"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>Collection Details</span>
                </li>
              </Link>
              <Link to={withAdmin("/creator-earning")}>
                <li className="submenu-item submenu-item-last">
                  <div className="submenu-line">
                    <div className="line-vertical-short"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>Creator Earning</span>
                </li>
              </Link>
            </ul>
          )}

          {/* Collections 3 */}
          <Link to={withAdmin("/collections")}>
            <li
              onClick={() => toggleDropdown("collection", "Collection")}
              className={`menu-item justify-between ${
                selectedItem === "Collection" && "bg-[#002AA8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={CollectionImage} className="w-[22px]" alt="Collection" />
                <span>Collection</span>
              </div>
              {openCollection ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {/* Dropdown Options (dynamic from backend categories) */}
          {openCollection && (
            <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[38px]">
              {categories.length === 0 && (
                <li className="submenu-item submenu-item-last">
                  <div className="submenu-line">
                    <div className="line-vertical-short"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>No categories</span>
                </li>
              )}
              {categories.map((cat, index) => (
                <Link key={cat.key} to={withAdmin(`/collections/${cat.key}`)}>
                  <li
                    className={`submenu-item ${
                      index === categories.length - 1 ? "submenu-item-last" : ""
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
                </Link>
              ))}
            </ul>
          )}

          {/* Edit User 4 */}
          <Link to={withAdmin("/users")}>
            <li
              onClick={() => handleItemClick("users")}
              className={`menu-item ${
                selectedItem === "users" && "bg-[#002AA8]"
              }`}
            >
              <img src={EditUser} className="w-[22px]" alt="Edit User" />
              <span>Edit User</span>
            </li>
          </Link>

          {/* News section 5 */}
          <Link to={withAdmin("/add-news")}>
            <li
              onClick={() => toggleDropdown("news", "News")}
              className={`menu-item justify-between ${
                selectedItem === "News" && "bg-[#002AA8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={NewsImage} className="w-[22px]" alt="News" />
                <span>Upload News</span>
              </div>
              {openNews ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {/* Dropdown Options */}
          {openNews && (
            <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[38px]">
              <Link to={withAdmin("/edit-news")}>
                <li className="submenu-item">
                  <div className="submenu-line">
                    <div className="line-vertical"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>Edit News</span>
                </li>
              </Link>
              <Link to={withAdmin("/other-news")}>
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

          {/* Collection on sale */}
          <Link to={withAdmin("/sale")}>
            <li
              onClick={() => toggleDropdown("sale", "Sale")}
              className={`menu-item justify-between ${
                selectedItem === "Sale" && "bg-[#002AA8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={SaleImage} className="w-[22px]" alt="Sale" />
                <span>Collection on Sale</span>
              </div>
              {openSale ? <FiChevronUp /> : <FiChevronDown />}
            </li>
          </Link>

          {/* Dropdown Options */}
          {openSale && (
            <ul className="w-[222px] ml-0 space-y-2 text-sm relative pl-[38px]">
              <Link to={withAdmin("/sale-1")}>
                <li className="submenu-item">
                  <div className="submenu-line">
                    <div className="line-vertical"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>Sale 1</span>
                </li>
              </Link>
              <Link to={withAdmin("/sale-2")}>
                <li className="submenu-item submenu-item-last">
                  <div className="submenu-line">
                    <div className="line-vertical-short"></div>
                    <div className="line-horizontal"></div>
                  </div>
                  <span>Sale 2</span>
                </li>
              </Link>
            </ul>
          )}

          {/* Transaction News 6 */}
          <Link to={withAdmin("/transactions")}>
            <li
              onClick={() => toggleDropdown("transaction", "Transaction")}
              className={`menu-item ${
                selectedItem === "Transaction" && "bg-[#002AA8]"
              }`}
            >
              <img src={TransactionImage} className="w-[22px]" alt="Transaction" />
              <span>Transaction</span>
            </li>
          </Link>

          {/* Support 7 */}
          <Link to={withAdmin("/support")}>
            <li
              onClick={() => handleItemClick("support")}
              className={`menu-item ${
                selectedItem === "support" && "bg-[#002AA8]"
              }`}
            >
              <img src={SupportImage} className="w-[22px]" alt="Support" />
              <span>Support</span>
            </li>
          </Link>
        </ul>

        {/* LOGOUT */}
        <button onClick={onLogoutClick} className="mx-auto mb-6 flex gap-2">
          <img src={LogoutImage} className="w-[22px]" alt="Logout" />
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
        
        .submenu-item {
          position: relative;
          padding-left: 28px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          min-height: 28px;
        }
        
        .submenu-item:hover {
          color: #cbd5f5;
        }
        
        .submenu-line {
          position: absolute;
          left: -7px;
          top: 0;
          height: 100%;
          width: 24px;
        }
        
        /* Vertical line that extends down */
        .line-vertical {
          position: absolute;
          left: 0;
          top: -8px;
          width: 1.5px;
          height: calc(100% + 16px);
          background-color: #666666;
        }
        
        /* Vertical line for last item (shorter) */
        .line-vertical-short {
          position: absolute;
          left: 0;
          top: -8px;
          width: 1.5px;
          height: 50%;
          background-color: #666666;
        }
        
        /* Horizontal line */
        .line-horizontal {
          position: absolute;
          left: 0;
          top: 50%;
          width: 24px;
          height: 1.5px;
          background-color: #666666;
          transform: translateY(-50%);
        }
        
        /* Remove vertical line from last item to prevent overflow */
        .submenu-item-last .line-vertical {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
