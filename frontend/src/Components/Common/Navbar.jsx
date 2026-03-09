import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, TableRowsSplit } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo1.png";
import SearchImg from "../../assets/images/Search.png";
import ProfileImg from "../../assets/images/login.png";
import CustomeButton from "../Buttons/Button1";
import CustomeButtonLarge from "../Buttons/SignupButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { FiLogOut } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

/// logout icions
import logoutImage from "../../assets/images/login/logout.png";
// Social dropdown images
import DiscordImg from "../../assets/images/discard.png";
import xImg from "../../assets/images/skipe.png";
import telegramImg from "../../assets/images/telegram.png";
import { logout } from "../../Redux/AuthSlice";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLogin] = useState(false);
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log("your user from redux store :", user);
  console.log("your user from redux token :", token);
  console.log("your user from redux isLoggedIn :", isLoggedInUser);

  // ------------------------- SEARCHING ------------------------------
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);



  // Fetch search results when query changes
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await axios.get(
          // `http://localhost:4700/api/v1/search/search?query=${query}`
          `${BACKEND_BASE_URL}/api/v1/search/search?query=${query}`
        );
        setResults([...res.data.lands, ...res.data.nfas]);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(delayDebounce);
  }, [query]);

  /// get the search item
  // handle search input
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      try {
        const res = await axios.get(
          // `http://localhost:4700/api/v1/search/search?query=${value}`
          `${BACKEND_BASE_URL}/api/v1/search/search?query=${value}`
        );
        setResults([...res.data.lands, ...res.data.nfas]);
        setShowDropdown(true);
        console.log("Search results:", res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResults([]);
    }
  };

  // get the details of that search
  const handleGetDetails = async (item) => {
    try {
      const res = await axios.get(
        // `http://localhost:4700/api/v1/search/item/${item._id}`
        `${BACKEND_BASE_URL}/api/v1/search/item/${item._id}`
      );
      console.log("Full item data:", res.data);
      // You can navigate to a details page or open a modal
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------- search end ---------------------------

  // token expired logic
  useEffect(() => {
    if (!token) {
      // No token → not logged in
      setIsLogin(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // convert ms → seconds

      if (decoded.exp < currentTime) {
        console.log("Token has expired");
        // navigate('/signin')
        dispatch(logout());
        setIsLogin(false);
      } else {
        console.log("Token is valid");
        // navigate("/signin")
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      dispatch(logout);
      setIsLogin(false); // invalid token → not logged in
    }
  }, [token]);

  const shopRef = useRef(null);
  const socialRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close dropdowns on click-outside for mobile screens
      if (window.innerWidth < 768) return;

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

  // hide the dropdown if click outside the modal
  // Hide search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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

  // Close mobile menu and dropdowns when location changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  /// hide the signup button on the following pages
  // Paths where Sign Up button should be hidden
  const hideSignUpPaths = ["/signup", "/signin", "/forgot-password"];

  /// show only the logout icon on the signup , login and forgot page its client requirement
  const showLogoutPaths = ["/signup", "/signin", "/forgot-password"];

  // Hide navbar items on these routes
  const hideOnPaths = [
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/signin",
    "/about",
  ];
  const showSearchBar = isLoggedIn && !hideOnPaths.includes(location.pathname);

  const handleLogoutConfirm = () => {
    // Close the modal first
    setShowModal(false);

    // Perform logout
    dispatch(logout());

    // Show toast
    toast.success("User logged out successfully");

    // Navigate to signin
    navigate("/signin");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#001142CC] md:bg-transparent">
      {/* Container with max-width and centered */}
      <div className="w-full mx-auto max-w-[1300px] px-4 sm:px-6 md:px-2">
        {/* Top Section */}
        <div className="w-full py-3 flex items-center justify-between">
          {/* Left: Logo + Desktop Menu */}
          <div className="flex items-center space-x-28">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-10 w-auto mt-2" />
            </Link>
            {/* Mobile Search */}
            {isLoggedIn && showSearchBar && (
              <div className="flex md:hidden flex-1 justify-center px-3">
                <div className="flex items-center bg-transparent border rounded-[10px] px-3 py-1 w-full max-w-[220px]">
                  <FiSearch className="text-white text-lg" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => query && setShowDropdown(true)}
                    className="bg-transparent outline-none text-white pl-2 text-sm w-full"
                  />
                </div>
              </div>
            )}

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 font-semibold text-white relative ml-4">
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
                  <div className="absolute  top-full left-[350px] transform -translate-x-1/2 mt-0 w-[746px] max-w-[90vw] pb-5 h-[265px] rounded-[10px] shadow-lg bg-[#001554D9] overflow-hidden border border-white/20 mb-4">
                    <div className="grid grid-cols-3 gap-[30px] w-full h-full mx-auto px-[29px] py-[28px] text-white">
                      {/* Column 1 */}
                      <Link
                        to="/market-place"
                        onClick={() => setShopOpen(false)}
                        className="flex flex-col gap-1 border-b-2 border-white pb-2 cursor-pointer hover:bg-white/10 p-2 transition-colors"
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Overview
                        </h1>
                        <p className="text-white text-[12px]">
                          See what's new and trending.
                        </p>
                      </Link>

                      <Link
                        to="/personal-activity"
                        onClick={() => setShopOpen(false)}
                        className="flex flex-col gap-1 border-b-2 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 transition-colors"
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          My Assets
                        </h1>
                        <p className="text-white text-[12px]">
                          Track and manage everything you own.
                        </p>
                      </Link>

                      {/* Column 2 */}
                      <Link
                        to="/nfa-expand"
                        onClick={() => setShopOpen(false)}
                        className="flex flex-col border-b-2 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 transition-colors"
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Collectibles
                        </h1>
                        <p className="text-white text-[12px]">
                          Track and manage your NFTs.
                        </p>
                      </Link>

                      {/* Column 3 */}
                      <Link
                        to="/land"
                        onClick={() => setShopOpen(false)}
                        className="flex flex-col pb-2 border-b-2 border-white cursor-pointer hover:bg-white/10 p-2 transition-colors"
                      >
                        <h1 className="text-white font-semibold text-[16px]">
                          Land
                        </h1>
                        <p className="text-white text-[12px]">
                          Buy a parcel of land and build on it.
                        </p>
                      </Link>
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
                  <div className="absolute top-full left-0 w-[115px] rounded-[8px] bg-[#002AA8D9] p-3 flex flex-col shadow-lg border border-white/20">
                    <a
                      href="https://discord.gg"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-1 py-2 rounded hover:bg-white/20 transition-colors"
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
                    >
                      <img
                        src={xImg}
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
                    >
                      <img
                        src={telegramImg}
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
                {/* ------------------------------------ Dynamic Searching -------------------------  */}
                <div className="relative flex items-center rounded-[10px] bg-[#8C9ED8] p-1 min-w-[200px]">
                  <img
                    src={SearchImg}
                    alt="Search"
                    className="w-8 h-8 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white placeholder-white/80 pl-2 w-full text-sm"
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => query && setShowDropdown(true)}
                  />

                  {/* Dropdown */}
                  {showDropdown && results.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 w-full bg-white text-black rounded-md shadow-lg mt-1 z-50 max-h-60 overflow-auto"
                    >
                      {results.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleGetDetails(item)}
                          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                        >
                          {item.title}{" "}
                          <span className="text-xs text-gray-500">
                            {/* ({item.type}) */}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ---------------------------- search end ------------------  */}

                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#002AA8] hover:bg-[#0033CC] transition-colors duration-200 cursor-pointer">
                  <Link to="/profile">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-white w-5 h-5"
                    />
                  </Link>
                </div>

                <div className="bg-[#002AA8] w-[40px] h-[40px] rounded-[10px] flex items-center justify-center">
                  <button
                    className="flex items-center justify-center w-full h-full"
                    onClick={() => setShowModal(true)}
                  >
                    <img
                      src={logoutImage}
                      alt="Logout"
                      className="w-[20px] h-[20px] brightness-0 invert"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </button>
                </div>
              </div>
            ) : (
              !["/signup", "/signin", "/forgot-password"].includes(
                location.pathname
              ) && (
                <div className="hidden md:block">
                  <Link to="/signup">
                    <CustomeButtonLarge text="Sign Up" />
                  </Link>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden  bg-[#001554D9] text-white px-4 py-4 flex flex-col space-y-3 border-t border-white/20">
            {/* Shop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShopOpen(!shopOpen);
              }}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >

              <span className="font-semibold">Shop</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {shopOpen && (
              <div className="pl-4 flex flex-col space-y-2 border-l-2 border-white/30 ml-2">

                <Link
                  to="/market-place"
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  Overview
                </Link>

                <Link
                  to="/personal-activity"
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  My Assets
                </Link>

                <Link
                  to="/nfa-expand"
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  Collectibles
                </Link>

                <Link
                  to="/land"
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  Land
                </Link>

              </div>
            )}


            {/* About & News */}
            <Link
              to="/about"
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              About Us
            </Link>
            <Link
              to="/more-news"
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              News
            </Link>

            {/* Social */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSocialOpen(!socialOpen);
              }}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >

              <span className="font-semibold">Social</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${socialOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {socialOpen && (
              <div className="pl-4 flex flex-col space-y-2 border-l-2 border-white/30 ml-2">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={DiscordImg} alt="Discord" className="w-4 h-4" />
                  Discord
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={xImg} alt="X.com" className="w-4 h-4" />
                  X.com
                </a>

                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={telegramImg} alt="Telegram" className="w-4 h-4" />
                  Telegram
                </a>
              </div>
            )}

            {/* Logged-in Search + Profile */}
            {isLoggedIn ? (
              <>
                <div className="flex items-center justify-end space-x-2 mt-4 w-full">
                  <Link to="/profile">
                    <img
                      src={ProfileImg}
                      alt="Profile"
                      className="w-10 h-10 rounded-md hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                  <div className="bg-[#002AA8] w-[40px] h-[40px] rounded-[10px] flex items-center justify-center">
                    <button
                      className="flex items-center justify-center w-full h-full"
                      onClick={() => setShowModal(true)}
                    >
                      <img
                        src={logoutImage}
                        alt="Logout"
                        className="w-[20px] h-[20px] brightness-0 invert"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center mt-4 pt-4 border-t border-white/20">
                <Link to="/signup">
                  <CustomeButton text="Sign In" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* search field on the small screen  */}
        {showDropdown && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-[3rem] left-8 right-0 w-[13rem] mx-auto item-center sm:hidden bg-white text-black rounded-md shadow-lg mt-1 z-50 max-h-60 overflow-auto"
          >
            {results.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  handleGetDetails(item);
                  setShowDropdown(false);
                }}
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
              >
                {item.title}{" "}
                {/* <span className="text-xs text-gray-500">({item.type})</span> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="absolute top-0 left-0 w-screen h-screen z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-5 w-[90%] max-w-sm text-start
          bg-[radial-gradient(circle_at_10%_30%,rgba(8,1,33,0.9)_0%,transparent_70%),radial-gradient(circle_at_70%_50%,rgba(13,7,22,0.93)_0%,transparent_60%),radial-gradient(circle_at_50%_90%,rgba(5,4,17,0.96)_0%,transparent_90%),#0d0d14]
          backdrop-blur-[500px]"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <h2 className="text-2xl font-semibold text-white">
                Confirm Logout
              </h2>
              <p className="text-white mb-8">
                Are you sure you want to log out?
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 dark:bg-gray-800/30 dark:text-gray-200 dark:hover:bg-gray-700/40 transition-all backdrop-blur-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogoutConfirm}
                  className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
