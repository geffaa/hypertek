import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutGrid, Package, Layers, Timer } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

/// logout icions
import logoutImage from "../../assets/images/login/logout.png";
// Social dropdown images
import DiscordImg from "../../assets/images/discard.png";
import xImg from "../../assets/images/skipe.png";
import telegramImg from "../../assets/images/telegram.png";
import { logout } from "../../Redux/AuthSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLogin] = useState(false);
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const shopTimer = useRef(null);
  const socialTimer = useRef(null);

  const openShop  = () => { clearTimeout(shopTimer.current);  setShopOpen(true); };
  const closeShop = () => { shopTimer.current  = setTimeout(() => setShopOpen(false),  250); };
  const openSocial  = () => { clearTimeout(socialTimer.current);  setSocialOpen(true); };
  const closeSocial = () => { socialTimer.current  = setTimeout(() => setSocialOpen(false), 150); };
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";
  const logo = "/logo-white.png";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const [hbBalance, setHbBalance] = useState(null);

  useEffect(() => {
    if (!isLoggedInUser || !token) return;
    axios.get(`${BACKEND_BASE_URL}/api/v1/hb/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setHbBalance(res.data?.balance ?? res.data?.hb ?? null))
      .catch(() => setHbBalance(null));
  }, [isLoggedInUser, token]);

  const shopRef = useRef(null);
  const socialRef = useRef(null);
  const profileRef = useRef(null);

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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
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
    <nav
      className="fixed top-0 left-0 z-50 w-full transition-all duration-300"
      style={
        isHome
          ? {
              background: scrolled ? "rgba(0, 17, 66, 0.55)" : "transparent",
              backdropFilter: scrolled ? "blur(20px)" : "none",
            }
          : {
              background: "rgba(0, 17, 66, 0.85)",
              backdropFilter: "blur(20px)",
            }
      }
    >
      {/* Container with max-width and centered */}
      <div className="w-full mx-auto max-w-[1500px] px-6 sm:px-8 md:px-10">
        {/* Top Section */}
        <div className="w-full py-3 flex items-center justify-between">
          {/* Left: Logo + Desktop Menu */}
          <div className="flex items-center space-x-28">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
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
                onMouseEnter={openShop}
                onMouseLeave={closeShop}
              >
                <button
                  onClick={() => { shopOpen ? setShopOpen(false) : openShop(); setSocialOpen(false); }}
                  className={`flex items-center transition-colors duration-200 uppercase tracking-wide text-sm ${shopOpen ? "text-blue-300" : "hover:text-blue-300"}`}
                >
                  Shops <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                {shopOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={openShop}
                    onMouseLeave={closeShop}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[560px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    style={{ background: "rgba(0, 15, 60, 0.97)", backdropFilter: "blur(24px)" }}>
                    {[
                      [
                        { to: "/market-place?tab=overview", icon: <LayoutGrid className="w-5 h-5" />, label: "Overview",  desc: "General market overview" },
                        { to: "/personal-activity",         icon: <Package    className="w-5 h-5" />, label: "My Assets", desc: "Track and manage everything you own" },
                      ],
                      [
                        { to: "/collections",               icon: <Layers className="w-5 h-5" />, label: "Collectibles", desc: "Browse all NFT & NFA collectibles" },
                        { to: "/market-place?tab=auctions", icon: <Timer  className="w-5 h-5" />, label: "Auction",      desc: "Track the countdown of any auction" },
                      ],
                    ].map((row, rowIdx) => (
                      <div key={rowIdx}>
                        {rowIdx > 0 && <div className="mx-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />}
                        <div className="grid grid-cols-2 gap-2 px-4 py-3">
                          {row.map(({ to, icon, label, desc }) => (
                            <Link
                              key={label}
                              to={to}
                              onClick={() => setShopOpen(false)}
                              className="group flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                              style={{ background: "rgba(255,255,255,0.03)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,42,168,0.35)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                            >
                              <span className="mt-0.5 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0">{icon}</span>
                              <div className="flex flex-col gap-1.5">
                                <p className="text-white font-semibold text-sm leading-tight pb-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.25)" }}>{label}</p>
                                <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className="hover:text-blue-300 transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                About Us
              </Link>
              <Link
                to="/news"
                className="hover:text-blue-300 transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                News
              </Link>

              {/* Social Dropdown */}
              <div
                ref={socialRef}
                className="relative"
                onMouseEnter={openSocial}
                onMouseLeave={closeSocial}
              >
                <button
                  onClick={() => { socialOpen ? setSocialOpen(false) : openSocial(); setShopOpen(false); }}
                  className={`flex items-center transition-colors duration-200 uppercase tracking-wide text-sm ${socialOpen ? "text-blue-300" : "hover:text-blue-300"}`}
                >
                  Socials <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${socialOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                {socialOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={openSocial}
                    onMouseLeave={closeSocial}
                    className="absolute top-full left-0 mt-2 w-[160px] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                    style={{ background: "rgba(0, 15, 60, 0.97)", backdropFilter: "blur(24px)" }}>
                    {[
                      { href: "https://discord.gg/XGvE2nFe", img: DiscordImg, label: "Discord", size: "w-[18px] h-[15px]" },
                      { href: "https://x.com/HyperTek100", img: xImg, label: "X (Twitter)", size: "w-[17px] h-[17px]" },
                      { href: "https://t.me", img: telegramImg, label: "Telegram", size: "w-[15px] h-[15px]" },
                    ].map(({ href, img, label, size }) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 transition-all duration-150 border-b border-white/5 last:border-0"
                        style={{ background: "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,42,168,0.4)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <img src={img} alt={label} className={`${size} object-contain flex-shrink-0`} />
                        <span className="text-white/85 text-sm font-medium">{label}</span>
                      </a>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile: Back button (only when not on home) */}
            {location.pathname !== "/" && (
              <button
                className="flex items-center md:hidden text-white/70 hover:text-white transition-colors duration-200"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

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
              <div className="hidden md:flex items-center gap-3">
                {/* Search */}
                <div className="relative flex items-center gap-2 h-10 px-3 rounded-xl min-w-[200px]"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                  <FiSearch className="text-white/50 w-4 h-4 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white placeholder-white/40 text-sm w-full"
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => query && setShowDropdown(true)}
                  />
                  {showDropdown && results.length > 0 && (
                    <div ref={dropdownRef}
                      className="absolute top-full left-0 w-full rounded-xl shadow-2xl mt-2 z-50 overflow-hidden"
                      style={{ background: "rgba(0,15,60,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
                      {results.map((item) => (
                        <div key={item._id} onClick={() => handleGetDetails(item)}
                          className="px-4 py-2.5 text-white/80 text-sm cursor-pointer transition-colors hover:bg-white/8 hover:text-white">
                          {item.title || item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HB Balance */}
                {hbBalance !== null && (
                  <Link to="/dashboard/withdraw"
                    className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "rgba(0,42,168,0.6)", border: "1px solid rgba(0,80,255,0.35)" }}
                    title="HyperBucks — click to withdraw">
                    <span style={{ color: "#facc15" }}>⚡</span>
                    <span>{Number(hbBalance).toLocaleString()} HB</span>
                  </Link>
                )}

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{
                      background: profileOpen ? "rgba(0,42,168,0.7)" : "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)"
                    }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "rgba(0,42,168,0.8)" }}>
                      {(user?.FullName || user?.name || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium max-w-[80px] truncate hidden lg:block">
                      {user?.FullName || user?.name || "Profile"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
                      style={{ background: "rgba(0,15,60,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-semibold truncate">{user?.FullName || user?.name || "User"}</p>
                        <p className="text-white/40 text-xs truncate mt-0.5">{user?.Email || user?.email || ""}</p>
                      </div>
                      <Link to="/Profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white">
                        <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                        My Profile
                      </Link>
                      {user?.Role === "admin" ? (
                        <a href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}/${user.id || user._id}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <LayoutGrid className="w-3.5 h-3.5" /> Admin Panel
                        </a>
                      ) : (
                        <a href="/dashboard" target="_blank" rel="noopener noreferrer"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <LayoutGrid className="w-3.5 h-3.5" /> Dashboard
                        </a>
                      )}
                      <button onClick={() => { setProfileOpen(false); setShowModal(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/80 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 border-t border-white/5">
                        <img src={logoutImage} alt="Logout" className="w-3.5 h-3.5 opacity-70" style={{ filter: "invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg)" }} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              !["/signup", "/signin", "/forgot-password"].includes(
                location.pathname
              ) && (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/waitlist">
                    <button className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/30">
                      Waitlist
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                      Sign Up
                    </button>
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
                  to="/market-place"
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
                  href="https://discord.gg/XGvE2nFe"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={DiscordImg} alt="Discord" className="w-4 h-4" />
                  Discord
                </a>

                <a
                  href="https://x.com/HyperTek100"
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
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-white/20">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                  >
                    My Profile
                  </Link>
                  {user?.Role === "admin" ? (
                    <a
                      href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}/${user.id || user._id}`}
                      onClick={closeMobileMenu}
                      className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                    >
                      Dashboard
                    </a>
                  ) : (
                    <a
                      href="/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                    >
                      Dashboard
                    </a>
                  )}
                  <div className="flex justify-end mt-2">
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
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
                <Link to="/waitlist" onClick={closeMobileMenu}
                  className="w-full text-center py-2.5 rounded-lg font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-colors">
                  Join Waitlist
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className="w-full">
                  <button className="w-full py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                    Sign Up
                  </button>
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
    </nav >
  );
}
