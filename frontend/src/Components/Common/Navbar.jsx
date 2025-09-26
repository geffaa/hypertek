import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import SearchImg from "../../assets/images/Search.png";
import ProfileImg from "../../assets/images/login.png";
import CustomeButton from "../Buttons/Button1";
import { FaUser } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

// Social dropdown images
import DiscordImg from "../../assets/images/discard.png";
import XImg from "../../assets/images/skipe.png";
import TelegramImg from "../../assets/images/telegram.png";

export default function Navbar() {
  const [isLoggedIn, setIsLogin] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shopRef = useRef(null);
  const socialRef = useRef(null);

  // Close dropdown when clicking outside
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

  return (
    <nav className="w-full fixed top-0 left-0 z-50">
      {/* Top Section */}
      <div
        className={`w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between
        ${
          mobileMenuOpen ? "bg-[#001554D9]" : "bg-[#001554D9] md:bg-transparent"
        }`}
      >
        {/* Left: Logo + Desktop Menu */}
        <div className="flex items-center space-x-6">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 font-semibold relative ml-8 text-white">
            {/* Shop Dropdown - Fixed with single container */}
            <div
              ref={shopRef}
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={(e) => {
                // Check if mouse is moving to dropdown content
                const relatedTarget = e.relatedTarget;
                if (!shopRef.current?.contains(relatedTarget)) {
                  setShopOpen(false);
                }
              }}
            >
              <button className="flex items-center hover:text-blue-300 md:ml-16">
                Shop <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {/* Dropdown positioned with no gap */}
              <div
                className={`absolute top-full left-0 transition-all duration-200 ${
                  shopOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                style={{ marginTop: "0px" }} // Remove any gap
              >
                {shopOpen && (
                  <div
                    className="w-[746px] h-[229px] rounded-[10px] shadow-lg bg-[#001554D9] mt-2"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <div className="grid grid-cols-3 gap-[53px] w-[688px] h-[185px] mx-auto px-[29px] py-[31px] text-white">
                      <div className="flex flex-col gap-[32px] w-[194px]">
                        <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
                          <h1 className="text-white font-semibold text-[16px]">
                            Overview & Desc
                          </h1>
                          <p className="text-white text-[12px]">
                            See what's new and trending.
                          </p>
                        </div>
                        <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
                          <h1 className="text-white font-semibold text-[16px]">
                            My Assets
                          </h1>
                          <p className="text-white text-[12px]">
                            Track and manage everything you own.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[16px] w-[194px]">
                        <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
                          <h1 className="text-white font-semibold text-[16px]">
                            Collectibles
                          </h1>
                          <p className="text-white text-[12px]">
                            Track and manage your NFTs.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[16px] w-[194px]">
                        <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
                          <h1 className="text-white font-semibold text-[16px]">
                            Land
                          </h1>
                          <p className="text-white text-[12px]">
                            Buy a parcel of land and build on it.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <a href="/about" className="hover:text-blue-300">
              About Us
            </a>
            <a href="/news" className="hover:text-blue-300">
              News
            </a>

            {/* Social Dropdown - Fixed with single container */}
            <div
              ref={socialRef}
              className="relative"
              onMouseEnter={() => setSocialOpen(true)}
              onMouseLeave={(e) => {
                const relatedTarget = e.relatedTarget;
                if (!socialRef.current?.contains(relatedTarget)) {
                  setSocialOpen(false);
                }
              }}
            >
              <button className="flex items-center hover:text-blue-300">
                Social <ChevronDown className="h-4 w-4" />
              </button>

              <div
                className={`absolute top-full left-0 transition-all duration-200 ${
                  socialOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
                style={{ marginTop: "0px" }}
              >
                {socialOpen && (
                  <div
                    className="w-[115px] h-[135px] rounded-[8px] bg-[#002AA8D9] p-3 flex flex-col shadow-lg mt-2"
                    onMouseEnter={() => setSocialOpen(true)}
                    onMouseLeave={() => setSocialOpen(false)}
                  >
                    <a
                      href="https://discord.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-1 w-full h-[38.18px] rounded hover:bg-white/20 cursor-pointer transition-colors"
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
                      className="flex items-center gap-2 px-1 w-full h-[38.18px] rounded hover:bg-white/20 cursor-pointer transition-colors"
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
                      className="flex items-center gap-2 px-1 w-full h-[38.18px] rounded hover:bg-white/20 cursor-pointer transition-colors"
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
        </div>

        {/* Rest of your code remains the same */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden z-50">
            <button
              className="text-white focus:outline-none"
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
              <div className="flex items-center rounded-[10px] bg-[#8C9ED8] p-1">
                <img
                  src={SearchImg}
                  alt="Search"
                  className="w-10 h-10 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-white placeholder-white pl-2"
                />
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#002AA8]">
               <FontAwesomeIcon icon={faUser} className="text-white w-6 h-6" />
    
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/signup">
                <CustomeButton text="Signin" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu - Keep your existing mobile code */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001554D9] text-white px-4 py-4 flex flex-col space-y-3">
          {/* Shop Dropdown */}
          <button
            onClick={() => setShopOpen(!shopOpen)}
            className="flex justify-between w-full"
          >
            Shop <ChevronDown className="h-4 w-4" />
          </button>
          {shopOpen && (
            <div className="pl-4 flex flex-col space-y-2">
              <p>Overview & Desc</p>
              <p>My Assets</p>
              <p>Collectibles</p>
              <p>Land</p>
            </div>
          )}

          {/* About & News as separate vertical items */}
          <a href="/about" className="block w-full">
            About Us
          </a>
          <a href="/news" className="block w-full">
            News
          </a>

          {/* Social Dropdown */}
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            className="flex justify-between w-full"
          >
            Social <ChevronDown className="h-4 w-4" />
          </button>
          {socialOpen && (
            <div className="pl-4 flex flex-col space-y-2">
              <p>Discord</p>
              <p>X.com</p>
              <p>Telegram</p>
            </div>
          )}

          {/* Search + Profile (for logged in users) */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 mt-4 w-full">
              <div className="flex items-center bg-[#8C9ED8] rounded-[10px] p-1 w-full">
                <img
                  src={SearchImg}
                  alt="Search"
                  className="w-10 h-10 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-white placeholder-white pl-2 w-full"
                />
              </div>
              <img src={ProfileImg} alt="Profile" className="w-10 h-10" />
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Link to="/signup">
                <CustomeButton text="Signin" />
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
