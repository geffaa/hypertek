import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import RegistrationButton from "../../assets/images/registration.png";
import SearchImg from "../../assets/images/Search.png"; 
import ProfileImg from "../../assets/images/login.png"; 

// Social dropdown images
import DiscordImg from "../../assets/images/discard.png";
import XImg from "../../assets/images/skipe.png";
import TelegramImg from "../../assets/images/telegram.png";
import { href } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLogin] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="w-full fixed top-0 left-0 z-50 backdrop-blur-md shadow-md"
      style={{
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%)",
      }}
    >
      {/* Remove max-w-7xl container and use consistent padding */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center space-x-6">
          <img src={logo} alt="Logo" className="h-10 w-auto" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 font-semibold relative text-white">
            <div className="relative">
              <button
                onClick={() => setShopOpen(!shopOpen)}
                className="flex items-center hover:text-blue-300"
              >
                Shop <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {shopOpen && (
                <div
                  className="absolute z-50 rounded-[10px] shadow-lg bg-[#001554D9]"
                  style={{
                    width: "746px",
                    height: "229px",
                    top: "58px",
                    left: "485px",
                  }}
                >
                  <div
                    className="grid grid-cols-3 gap-[53px] px-[29px] py-[31px] text-white"
                    style={{
                      width: "688px",
                      height: "185px",
                      margin: "0 auto",
                    }}
                  >
                    <div className="flex flex-col gap-[32px]" style={{ width: "194px" }}>
                      <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4">
                        <h1 className="text-white font-semibold text-[16px]">Overview & Desc</h1>
                        <p className="text-white text-[12px]">See what's new and trending.</p>
                      </div>
                      <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4">
                        <h1 className="text-white font-semibold text-[16px]">My Assets</h1>
                        <p className="text-white text-[12px]">Track and manage everything you own.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[16px]" style={{ width: "194px" }}>
                      <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4">
                        <h1 className="text-white font-semibold text-[16px]">Collectibles</h1>
                        <p className="text-white text-[12px]">Track and manage your NFTs.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[16px]" style={{ width: "194px" }}>
                      <div className="flex flex-col gap-[4px] border-b-4 border-white pb-4">
                        <h1 className="text-white font-semibold text-[16px]">Land</h1>
                        <p className="text-white text-[12px]">Buy a parcel of land and build on it.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a href="/about" className="hover:text-blue-300">About Us</a>
            <a href="/news" className="hover:text-blue-300">News</a>

            <div className="relative">
              <button
                onClick={() => setSocialOpen(!socialOpen)}
                className="flex items-center hover:text-blue-300"
              >
                Social <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {socialOpen && (
                <div className="absolute z-50 rounded-[8px] shadow-lg bg-[#002AA8D9] p-3 flex flex-col">
                  <a href="https://discord.com" target="_blank" rel="noreferrer" className="flex items-center w-full h-[38px] gap-2 px-1 rounded hover:bg-white/20">
                    <img src={DiscordImg} alt="Discord" className="w-[19px] h-[16px]" />
                    <span className="text-white text-sm font-semibold">Discord</span>
                  </a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="flex items-center w-full h-[22px] gap-2 px-1 rounded hover:bg-white/20">
                    <img src={XImg} alt="X.com" className="w-[18px] h-[18px]" />
                    <span className="text-white text-sm font-semibold">X.com</span>
                  </a>
                  <a href="https://t.me" target="_blank" rel="noreferrer" className="flex items-center w-full h-[15px] gap-2 px-1 rounded hover:bg-white/20">
                    <img src={TelegramImg} alt="Telegram" className="w-[15px] h-[15px]" />
                    <span className="text-white text-sm font-semibold">Telegram</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Search/Profile or Register */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
          </button>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center rounded-[10px] bg-[#8C9ED8] p-1">
                <img src={SearchImg} alt="Search" className="w-10 h-10 rounded-md"/>
                <input type="text" placeholder="Search..." className="bg-transparent outline-none text-white placeholder-white pl-2"/>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[rgba(53,10,242,0.2)]">
                <img src={ProfileImg} alt="Profile" className="w-full h-full rounded-md"/>
              </div>
            </div>
          ) : (
            <Link to="/signup" className="inline-block">
  <img src={RegistrationButton} alt="Register" className="h-10 w-auto" />
</Link>

          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001554D9] text-white px-4 py-4 space-y-4">
          <button onClick={() => setShopOpen(!shopOpen)} className="flex justify-between w-full">
            Shop
            <ChevronDown className="h-4 w-4"/>
          </button>
          {shopOpen && (
            <div className="pl-4 space-y-2">
              <p>Overview & Desc</p>
              <p>My Assets</p>
              <p>Collectibles</p>
              <p>Land</p>
            </div>
          )}
          <a href="/about">About Us</a>
          <a href="/news">News</a>
          <button onClick={() => setSocialOpen(!socialOpen)} className="flex justify-between w-full">
            Social <ChevronDown className="h-4 w-4"/>
          </button>
          {socialOpen && (
            <div className="pl-4 space-y-2">
              <p>Discord</p>
              <p>X.com</p>
              <p>Telegram</p>
            </div>
          )}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <img src={SearchImg} alt="Search" className="w-10 h-10"/>
              <img src={ProfileImg} alt="Profile" className="w-10 h-10"/>
            </div>
          ) : (
    <Link to="/signup" className="inline-block">
  <img src={RegistrationButton} alt="Register" className="h-10 w-auto" />
</Link>

          )}
        </div>
      )}
    </nav>
  );
}