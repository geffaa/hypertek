import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import SearchImg from "../../assets/images/Search.png";
import ProfileImg from "../../assets/images/login.png";
import CustomeButton from "../Buttons/Button1";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";

// Social dropdown images
import DiscordImg from "../../assets/images/discard.png";
import XImg from "../../assets/images/skipe.png";
import TelegramImg from "../../assets/images/telegram.png";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLogin] = useState(false);
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log("your user from redux store :", user);
  console.log("your user from redux token :", token);
  console.log("your user from redux isLoggedIn :", isLoggedInUser);
  useEffect(() => {
    if (isLoggedInUser) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [isLoggedInUser]);

  const shopRef = useRef(null);
  const socialRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopRef.current && !shopRef.current.contains(event.target)) {
        setShopOpen(false);
      }
      if (socialRef.current && !socialRef.current.contains(event.target)) {
        setSocialOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setShopOpen(false);
    setSocialOpen(false);
  };

  // Hide navbar items on these routes
  const hideOnPaths = [
    "/",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/signin",
    "/about",
  ];
  const showSearchBar = isLoggedIn && !hideOnPaths.includes(location.pathname);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[#001554D9] md:bg-transparent">
      {/* Container with max-width and centered */}
      <div className="w-full mx-auto max-w-[1300px] px-4 sm:px-6 md:px-8">
        {/* Top Section */}
        <div className="w-full py-3 flex items-center justify-between">
          {/* Left: Logo + Desktop Menu */}
          <div className="flex items-center space-x-6">
            <Link to="/" onClick={closeMobileMenu}>
              <img src={logo} alt="Logo" className="h-10 w-auto" />
            </Link>
            {/* Mobile Search */}
            {isLoggedIn && showSearchBar && (
              <div className="flex md:hidden flex-1 justify-center px-3">
                <div className="flex items-center bg-transparent border rounded-[10px] px-3 py-1 w-full max-w-[220px]">
                  <FiSearch className="text-white text-lg" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white pl-2 text-sm w-full"
                  />
                </div>
              </div>
            )}

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 font-semibold text-white relative ml-8">
              {/* Shop Dropdown */}
              <div
                ref={shopRef}
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <button className="flex items-center hover:text-blue-300 transition-colors duration-200">
                  Shop <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {shopOpen && (
                  <div className="absolute  top-full left-[350px] transform -translate-x-1/2 mt-0 w-[746px] max-w-[90vw] h-[265px] rounded-[10px] shadow-lg bg-[#001554D9] overflow-hidden border border-white/20">
                    <div className="grid grid-cols-3 gap-[50px] w-full h-full mx-auto px-[29px] py-[31px] text-white">
                      {/* Column 1 */}
                      <div
                        className="flex flex-col gap-1 border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                        onClick={() => {
                          setShopOpen(false);
                          // Add your navigation logic here
                          console.log("Overview & Desc clicked");
                        }}
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Overview & Desc
                        </h1>
                        <p className="text-white text-[12px]">
                          See what's new and trending.
                        </p>
                      </div>
                      <div
                        className="flex flex-col gap-1 border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                        onClick={() => {
                          setShopOpen(false);
                          // Add your navigation logic here
                          console.log("My Assets clicked");
                        }}
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          My Assets
                        </h1>
                        <p className="text-white text-[12px]">
                          Track and manage everything you own.
                        </p>
                      </div>

                      {/* Column 2 */}
                      <div
                        className="flex flex-col border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                        onClick={() => {
                          setShopOpen(false);
                          // Add your navigation logic here
                          console.log("Collectibles clicked");
                        }}
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Collectibles
                        </h1>
                        <p className="text-white text-[12px]">
                          Track and manage your NFTs.
                        </p>
                      </div>

                      {/* Column 3 */}
                      <div
                        className="flex flex-col pb-4 border-b-4 border-white cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                        onClick={() => {
                          setShopOpen(false);
                          // Add your navigation logic here
                          console.log("Land clicked");
                        }}
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Land
                        </h1>
                        <p className="text-white text-[12px]">
                          Buy a parcel of land and build on it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="hover:text-blue-300 transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                to="/news"
                className="hover:text-blue-300 transition-colors duration-200"
              >
                News
              </Link>

              {/* Social Dropdown */}
              <div
                ref={socialRef}
                className="relative"
                onMouseEnter={() => setSocialOpen(true)}
                onMouseLeave={() => setSocialOpen(false)}
              >
                <button className="flex items-center hover:text-blue-300 transition-colors duration-200">
                  Social <ChevronDown className="h-4 w-4" />
                </button>

                {socialOpen && (
                  <div className="absolute top-full left-0  w-[115px] rounded-[8px] bg-[#002AA8D9] p-3 flex flex-col shadow-lg border border-white/20">
                    <a
                      href="https://discord.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-1 py-2 rounded hover:bg-white/20 transition-colors"
                      onClick={() => setSocialOpen(false)}
                    >
                      <img
                        src={DiscordImg}
                        alt="Discord"
                        className="w-[19px] h-[16px]"
                      />
                      <span className="text-white text-sm font-semibold">
                        Discord
                      </span>
                    </a>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-1 py-2 rounded hover:bg-white/20 transition-colors"
                      onClick={() => setSocialOpen(false)}
                    >
                      <img
                        src={XImg}
                        alt="X.com"
                        className="w-[18px] h-[18px]"
                      />
                      <span className="text-white text-sm font-semibold">
                        X.com
                      </span>
                    </a>
                    <a
                      href="https://t.me"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-1 py-2 rounded hover:bg-white/20 transition-colors"
                      onClick={() => setSocialOpen(false)}
                    >
                      <img
                        src={TelegramImg}
                        alt="Telegram"
                        className="w-[15px] h-[15px]"
                      />
                      <span className="text-white text-sm font-semibold">
                        Telegram
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden z-50">
              <button
                className="text-white focus:outline-none transition-transform duration-200 hover:scale-110"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Right Items */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center rounded-[10px] bg-[#8C9ED8] p-1 min-w-[200px]">
                  <img
                    src={SearchImg}
                    alt="Search"
                    className="w-8 h-8 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white placeholder-white/80 pl-2 w-full text-sm"
                  />
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#002AA8] hover:bg-[#0033CC] transition-colors duration-200 cursor-pointer">
                  <Link to="/profile">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-white w-5 h-5"
                    />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/signup">
                  <CustomeButton text="Sign In" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#001554D9] text-white px-4 py-4 flex flex-col space-y-3 border-t border-white/20">
            {/* Shop */}
            <button
              onClick={() => setShopOpen(!shopOpen)}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >
              <span className="font-semibold">Shop</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  shopOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {shopOpen && (
              <div className="pl-4 flex flex-col space-y-2 border-l-2 border-white/30 ml-2">
                <button
                  className="py-2 text-left hover:text-blue-300 transition-colors duration-200"
                  onClick={() => {
                    closeMobileMenu();
                    // Add navigation logic here
                  }}
                >
                  Overview & Desc
                </button>
                <button
                  className="py-2 text-left hover:text-blue-300 transition-colors duration-200"
                  onClick={() => {
                    closeMobileMenu();
                    // Add navigation logic here
                  }}
                >
                  My Assets
                </button>
                <button
                  className="py-2 text-left hover:text-blue-300 transition-colors duration-200"
                  onClick={() => {
                    closeMobileMenu();
                    // Add navigation logic here
                  }}
                >
                  Collectibles
                </button>
                <button
                  className="py-2 text-left hover:text-blue-300 transition-colors duration-200"
                  onClick={() => {
                    closeMobileMenu();
                    // Add navigation logic here
                  }}
                >
                  Land
                </button>
              </div>
            )}

            {/* About & News */}
            <Link
              to="/about"
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
              onClick={closeMobileMenu}
            >
              About Us
            </Link>
            <Link
              to="/news"
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
              onClick={closeMobileMenu}
            >
              News
            </Link>

            {/* Social */}
            <button
              onClick={() => setSocialOpen(!socialOpen)}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >
              <span className="font-semibold">Social</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  socialOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {socialOpen && (
              <div className="pl-4 flex flex-col space-y-2 border-l-2 border-white/30 ml-2">
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <img src={DiscordImg} alt="Discord" className="w-4 h-4" />
                  Discord
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <img src={XImg} alt="X.com" className="w-4 h-4" />
                  X.com
                </a>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <img src={TelegramImg} alt="Telegram" className="w-4 h-4" />
                  Telegram
                </a>
              </div>
            )}

            {/* Logged-in Search + Profile */}
            {isLoggedIn ? (
              <div className="flex items-center justify-end space-x-2 mt-4 w-full">
                <div className="flex hidden md:inline-block  items-center bg-[#8C9ED8] rounded-[10px] p-2 w-full">
                  <img
                    src={SearchImg}
                    alt="Search"
                    className="w-8 h-8 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white placeholder-white/80 pl-2 w-full text-sm"
                  />
                </div>
                <Link to="/profile">
                  <img
                    src={ProfileImg}
                    alt="Profile"
                    className="w-10 h-10 rounded-md hover:scale-105 transition-transform duration-200"
                  />
                </Link>{" "}
              </div>
            ) : (
              <div className="flex justify-center mt-4 pt-4 border-t border-white/20">
                <Link to="/signup" onClick={closeMobileMenu}>
                  <CustomeButton text="Sign In" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
