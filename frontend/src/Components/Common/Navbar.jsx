import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutGrid, Package, Layers, Timer, Gamepad2, Store, Wallet as WalletIcon } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

import jwtDecode from "jwt-decode";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import HBCoinIcon from "./HBCoinIcon";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

/// logout icions
import logoutImage from "../../assets/images/login/logout.webp";
// Social dropdown images
import DiscordImg from "../../assets/images/discard.webp";
import xImg from "../../assets/images/skipe.webp";
import telegramImg from "../../assets/images/telegram.webp";
import { logout } from "../../Redux/AuthSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/index.js";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLogin] = useState(false);
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const { openConnectModal } = useConnectModal();
  const { externalConnected, externalLinked, signingAddress, connectedUnlinkedAddress } = useActiveWallet();
  const externalAddr = connectedUnlinkedAddress || (externalLinked ? signingAddress : null);
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

  const [showModal, setShowModal] = useState(false);
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
        dispatch(logout());
        setIsLogin(false);
        toast(i18n.t("auth.sessionExpired"), {
          icon: "🔒",
          duration: 4000,
          style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        });
        navigate("/signin");
      } else {
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      dispatch(logout());
      setIsLogin(false);
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
              background: scrolled || mobileMenuOpen ? "rgba(0, 17, 66, 0.9)" : "transparent",
              backdropFilter: scrolled || mobileMenuOpen ? "blur(20px)" : "none",
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
                  {t("nav.shops")} <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[680px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    style={{ background: "rgba(0, 15, 60, 0.97)", backdropFilter: "blur(24px)" }}>
                    <div className="grid grid-cols-3 gap-2 px-4 py-3">
                      {[
                        { to: "/market-place?tab=overview", icon: <LayoutGrid className="w-5 h-5" />, label: t("nav.shop.overview"),  desc: t("nav.shop.overviewDesc") },
                        { to: "/market-place?tab=general",  icon: <Layers className="w-5 h-5" />, label: t("nav.shop.theMarketplace"), desc: t("nav.shop.theMarketplaceDesc") },
                        { to: isLoggedIn ? "/Profile" : "/signin", icon: <Package className="w-5 h-5" />, label: t("nav.shop.myAssets"), desc: t("nav.shop.myAssetsDesc") },
                      ].map(({ to, icon, label, desc }) => (
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
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className="hover:text-blue-300 transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                {t("nav.aboutUs")}
              </Link>
              <Link
                to="/news"
                className="hover:text-blue-300 transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                {t("nav.news")}
              </Link>
              <Link
                to="/crowdfunding"
                onClick={() => window.scrollTo(0, 0)}
                className="hover:text-blue-300 transition-colors duration-200 uppercase tracking-wide text-sm"
              >
                {t("nav.crowdfunding", "Crowdfunding")}
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
                  {t("nav.socials")} <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${socialOpen ? "rotate-180" : ""}`} />
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
                      { href: "https://x.com/Hyper Tek100", img: xImg, label: "X (Twitter)", size: "w-[17px] h-[17px]" },
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

            {/* Mobile: Language switcher + Menu Button */}
            <div className="flex items-center gap-2 md:hidden z-50">
              <LanguageSwitcher />
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
                <LanguageSwitcher />
                {/* Waitlist */}
                <Link to="/waitlist">
                  <button className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/30">
                    {t("nav.waitlist")}
                  </button>
                </Link>

                {/* HB Balance */}
                {hbBalance !== null && (
                  <Link to="/dashboard/topup"
                    className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "rgba(0,42,168,0.6)", border: "1px solid rgba(0,80,255,0.35)" }}
                    data-tooltip="Hyper Bucks — click to withdraw">
                    <HBCoinIcon size={22} />
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
                        {t("nav.myProfile")}
                      </Link>
                      {user?.Role === "admin" ? (
                        <a href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}/${user.id || user._id}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <LayoutGrid className="w-3.5 h-3.5" /> {t("nav.adminPanel")}
                        </a>
                      ) : (
                          <Link to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <LayoutGrid className="w-3.5 h-3.5" /> {t("nav.dashboard")}
                        </Link>
                      )}
                      <Link to="/gaming"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                        <Gamepad2 className="w-3.5 h-3.5" /> {t("nav.gaming")}
                      </Link>
                      <Link to="/market-place"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                        <Store className="w-3.5 h-3.5" /> {t("nav.marketplace")}
                      </Link>
                      {/* External wallet: connect from anywhere; managing/linking lives in Profile settings */}
                      {!externalConnected ? (
                        <button onClick={() => { setProfileOpen(false); openConnectModal?.(); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <WalletIcon className="w-3.5 h-3.5" /> {t("nav.connectWallet", "Connect Wallet")}
                        </button>
                      ) : (
                        <Link to="/edit" onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 text-sm font-medium transition-colors hover:bg-white/8 hover:text-white border-t border-white/5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${externalLinked ? "bg-green-400" : "bg-amber-400"}`} />
                          <span className="font-mono text-xs">{externalAddr ? `${externalAddr.slice(0, 6)}...${externalAddr.slice(-4)}` : "Wallet"}</span>
                          <span className="text-white/40 text-[10px] ml-auto">{externalLinked ? t("nav.walletLinked", "linked") : t("nav.walletNotLinked", "not linked")}</span>
                        </Link>
                      )}
                      <button onClick={() => { setProfileOpen(false); setShowModal(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400/80 text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400 border-t border-white/5">
                        <img src={logoutImage} alt="Logout" className="w-3.5 h-3.5 opacity-70" style={{ filter: "invert(40%) sepia(80%) saturate(500%) hue-rotate(320deg)" }} />
                        {t("nav.signOut")}
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
                  <LanguageSwitcher />
                  <Link to="/waitlist">
                    <button className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/30">
                      {t("nav.waitlist")}
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                      {t("nav.signUp")}
                    </button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
          {/* Backdrop: tap outside the panel to close */}
          <div
            className="md:hidden fixed inset-x-0 bottom-0 top-[72px] bg-black/50"
            onClick={closeMobileMenu}
          />
          <div
            className="md:hidden relative text-white px-4 py-4 flex flex-col space-y-3 border-t border-white/20 max-h-[calc(100dvh-76px)] overflow-y-auto"
            style={{ background: "rgba(0, 13, 50, 0.97)", backdropFilter: "blur(24px)" }}
          >
            {/* Shop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShopOpen(!shopOpen);
              }}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >

              <span className="font-semibold">{t("nav.shops")}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
            {shopOpen && (
              <div className="pl-4 flex flex-col space-y-2 border-l-2 border-white/30 ml-2">

                <Link
                  to="/market-place?tab=overview"
                  onClick={closeMobileMenu}
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  {t("nav.shop.overview")}
                </Link>

                <Link
                  to={isLoggedIn ? "/Profile" : "/signin"}
                  onClick={closeMobileMenu}
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  {t("nav.shop.myAssets")}
                </Link>

                <Link
                  to="/market-place?tab=general"
                  onClick={closeMobileMenu}
                  className="py-2 text-left font-medium hover:text-blue-300 transition-colors duration-200"
                >
                  {t("nav.shop.theMarketplace")}
                </Link>

              </div>
            )}


            {/* About & News */}
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              {t("nav.aboutUs")}
            </Link>
            <Link
              to="/more-news"
              onClick={closeMobileMenu}
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              {t("nav.news")}
            </Link>
            <Link
              to="/crowdfunding"
              onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}
              className="block w-full py-3 hover:text-blue-300 transition-colors duration-200 font-semibold"
            >
              {t("nav.crowdfunding", "Crowdfunding")}
            </Link>

            {/* Social */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSocialOpen(!socialOpen);
              }}
              className="flex justify-between w-full py-3 text-left items-center hover:text-blue-300 transition-colors duration-200"
            >

              <span className="font-semibold">{t("nav.socials")}</span>
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
                  onClick={closeMobileMenu}
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={DiscordImg} alt="Discord" className="w-4 h-4" />
                  Discord
                </a>

                <a
                  href="https://x.com/Hyper Tek100"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileMenu}
                  className="py-2 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <img src={xImg} alt="X.com" className="w-4 h-4" />
                  X.com
                </a>

                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileMenu}
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
                    {t("nav.myProfile")}
                  </Link>
                  {user?.Role === "admin" ? (
                    <a
                      href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}/${user.id || user._id}`}
                      onClick={closeMobileMenu}
                      className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                    >
                      {t("nav.dashboard")}
                    </a>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                    >
                      {t("nav.dashboard")}
                    </Link>
                  )}
                  <Link
                    to="/gaming"
                    onClick={closeMobileMenu}
                    className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                  >
                    {t("nav.gaming")}
                  </Link>
                  <Link
                    to="/market-place"
                    onClick={closeMobileMenu}
                    className="block w-full py-3 text-white font-semibold hover:text-blue-300 transition-colors duration-200"
                  >
                    {t("nav.marketplace")}
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 w-full py-3 mt-2 pt-4 border-t border-white/20 text-red-400 font-semibold hover:text-red-300 transition-colors duration-200"
                  >
                    <img
                      src={logoutImage}
                      alt=""
                      className="w-[18px] h-[18px]"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                    {t("nav.signOut")}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
                <Link to="/waitlist" onClick={closeMobileMenu}
                  className="w-full text-center py-2.5 rounded-lg font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-colors">
                  {t("nav.joinWaitlist")}
                </Link>
                <Link to="/signup" onClick={closeMobileMenu} className="w-full">
                  <button className="w-full py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                    {t("nav.signUp")}
                  </button>
                </Link>
              </div>
            )}
          </div>
          </>
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
                {t("logout.confirmTitle")}
              </h2>
              <p className="text-white mb-8">
                {t("logout.confirmMessage")}
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 dark:bg-gray-800/30 dark:text-gray-200 dark:hover:bg-gray-700/40 transition-all backdrop-blur-sm"
                >
                  {t("logout.cancel")}
                </button>

                <button
                  onClick={handleLogoutConfirm}
                  className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all"
                >
                  {t("logout.logout")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav >
  );
}
