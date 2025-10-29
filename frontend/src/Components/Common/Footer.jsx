import React from "react";
import Logo from "../../assets/images/logo.png";
import TelegramImg from "../../assets/images/telegram.png";
import SkypeImg from "../../assets/images/skipe.png";
import DiscordImg from "../../assets/images/discard.png";
import { Link } from "react-router-dom";

function Footer() {
  const menuItems = [
    { name: "Market Place", path: "/market-place" },
    { name: "News", path: "/news" },
    { name: "WhitePapers", path: "/whitepapers" },
    { name: "FAQ", path: "/faq" },
    { name: "Disclaimer", path: "/disclaimer" },
    { name: "Terms and Conditions", path: "/terms" },
  ];

  return (
    <footer className="w-full text-white pb-4 relative z-10 bg-[#000000] overflow-hidden">
      {/* Center container to control max width */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1500px] flex flex-col justify-between">
        {/* Glowing Orb */}
        <div
          className="absolute top-0 right-1/4 md:right-40 w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full
                        bg-gradient-to-b from-blue-500/70 via-blue-600/80 to-white/30
                        blur-[80px] md:blur-[100px]
                        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                                0_0_100px_50px_rgba(59,130,246,0.4),
                                0_0_200px_100px_rgba(59,130,246,0.2)]"
        ></div>

        {/* Mobile Layout */}
        <div className="flex sm:hidden gap-6 border-t border-white pt-2 mt-2">
          <div className="flex flex-col gap-3 text-sm font-medium flex-1">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="hover:text-gray-400 transition-colors text-left"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="text-xs text-gray-400 text-left">
              @2025. ALL RIGHTS
              <br />
              RESERVED
            </div>
            <div className="flex gap-3">
              {[DiscordImg, SkypeImg, TelegramImg].map((icon, idx) => (
                <img
                  key={idx}
                  src={icon}
                  alt=""
                  className="w-5 h-5 hover:opacity-75 transition"
                />
              ))}
            </div>
            <div className="mt-4 cursor-pointer">
           <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
           </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-t border-white pt-4 mt-2">
          <div className="flex-shrink-0 flex cursor-pointer justify-center md:justify-start">
             <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
           </Link> 
          </div>
          <ul className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium justify-center md:justify-end text-center md:text-left">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="hover:text-gray-400 transition-colors text-left z-10"
              >
                {item.name}
              </Link>
            ))}
          </ul>
        </div>

        {/* Second Row - Desktop */}
        <div className="hidden sm:flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
          <div className="w-full md:text-center text-sm text-gray-400">
            @2025. ALL RIGHTS RESERVED
          </div>
          <div className="flex gap-4 justify-center md:justify-end mt-2 md:mt-0">
            {[DiscordImg, SkypeImg, TelegramImg].map((icon, idx) => (
              <img
                key={idx}
                src={icon}
                alt=""
                className="w-5 h-5 hover:opacity-75 transition"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
