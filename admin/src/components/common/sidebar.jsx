import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

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

const Sidebar = ({ onLogoutClick, isOpen, onClose }) => {
  const admin = useSelector((state) => state.admin.admin);
  const adminId = admin?._id;
  const location = useLocation();
  const path = location.pathname || "";
  const sidebarRef = useRef(null);

  const withAdmin = (path) => (adminId ? `/${adminId}${path}` : "#");

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose && onClose();
    }
  };

  const isDashboard = path.endsWith("/dashboard") || (adminId && (path === `/${adminId}` || path === `/${adminId}/`));
  const isCreate = path.includes("create-collection");
  const isItems = path.includes("/items");
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
  const isBuybackApproval = path.includes("/buyback-approval");


  return (
    <div
      className={`sidebar text-white z-50 h-screen w-[270px] flex flex-col fixed lg:sticky top-0 transition-transform duration-300 ease-in-out ${isOpen
        ? "translate-x-0"
        : "-translate-x-full lg:translate-x-0"
        }`}
      style={{ background: "#0a0b18", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      ref={sidebarRef}
    >
      {/* ── LOGO — fixed top ── */}
      <div className="shrink-0 flex justify-center pt-8 pb-6 px-3">
        <div className="hidden lg:flex items-center justify-center cursor-pointer">
          <Link to={import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}>
            <img src={Logo} alt="logo" className="w-[140px] h-auto object-contain" />
          </Link>
        </div>
      </div>

      {/* ── MENU — scrollable ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
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



            {/* Create Item */}
            <Link to={withAdmin("/create-collection")} onClick={handleLinkClick}>
              <li className={`menu-item ${isCreate ? "bg-[#002AA8]" : ""}`}>
                <div className="relative w-[20px] h-[20px] flex-shrink-0">
                  <img src={CreateCollection2} className="w-[20px] h-[20px] object-contain" />
                  <img
                    src={CreateCollection1}
                    className="w-[10px] h-[10px] absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2 object-contain"
                  />
                </div>
                <span className="pt-[2px]">Create Item</span>
              </li>
            </Link>

            {/* Items */}
            <Link to={withAdmin("/items")} onClick={handleLinkClick}>
              <li className={`menu-item ${isItems ? "bg-[#002AA8]" : ""}`}>
                <img src={CollectionImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Items</span>
              </li>
            </Link>

            {/* Users */}
            <Link to={withAdmin("/users")} onClick={handleLinkClick}>
              <li className={`menu-item ${isUsers ? "bg-[#002AA8]" : ""}`}>
                <img src={EditUser} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Edit User</span>
              </li>
            </Link>



            {/* News Management */}
            <Link to={withAdmin("/other-news")} onClick={handleLinkClick}>
              <li className={`menu-item ${isNews ? "bg-[#002AA8]" : ""}`}>
                <img src={NewsImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">News Management</span>
              </li>
            </Link>

            <Link to={withAdmin("/collection-listed-sale")} onClick={handleLinkClick}>
              <li className={`menu-item ${isSale ? "bg-[#002AA8]" : ""}`}>
                <img src={SaleImage} alt="" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                <span className="pt-[2px]">Market Listings</span>
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

            {/* Buyback Approval */}
            <Link to={withAdmin("/buyback-approval")} onClick={handleLinkClick}>
              <li className={`menu-item ${isBuybackApproval ? "bg-[#002AA8]" : ""}`}>
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="pt-[2px]">Buyback Approval</span>
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

      {/* ── LOGOUT — fixed bottom ── */}
      <div
        className="shrink-0 flex items-center px-6 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={onLogoutClick}
          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors cursor-pointer w-full"
        >
          <img src={LogoutImage} className="w-[20px] h-[20px] object-contain flex-shrink-0" />
          <span className="font-bold text-[14px]">Sign out</span>
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
.sidebar::-webkit-scrollbar,
.sidebar > div::-webkit-scrollbar {
  display: none;
}
.sidebar,
.sidebar > div {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`}</style>
    </div>

  );

};



export default Sidebar;