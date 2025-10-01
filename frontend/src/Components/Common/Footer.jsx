import React from "react";
import Logo from "../../assets/images/logo.png";
import TelegramImg from "../../assets/images/telegram.png";
import SkypeImg from "../../assets/images/skipe.png";
import DiscordImg from "../../assets/images/discard.png";
import GlowingOrb from "./BgColoring";

function Footer() {
  return (
    <footer className="w-full  text-white  pb-8 relative z-10 bg-[#000000] " style={{
     
    }} >
      <div
      style={{
        top: `${0}px`,
        right: `${350}px`,
      }}
      className="absolute 
             w-[120px] h-[120px] 
             md:w-[150px] md:h-[120px] 
             rounded-full 
             bg-gradient-to-b from-blue-500/70 via-blue-600/80 to-white/30
             blur-[80px] md:blur-[100px]
             shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                    0_0_100px_50px_rgba(59,130,246,0.4),
                    0_0_200px_100px_rgba(59,130,246,0.2)]"
    ></div>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
        {/* First Row: Logo + Menu */}
        <div
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-t pt-4 mt-2"
          style={{
            borderStyle: "solid",
            borderWidth: "2px solid white", // top border only
            
            borderImageSlice: 1,
          }}
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <img
              src={Logo}
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Menu Links */}
          <ul className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium justify-center md:justify-end text-center md:text-left">
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Market Place
              </a>
            </li>
            <li>
              <a href="#" className=" cursor-pointer hover:text-gray-400 transition-colors">
                News
              </a>
            </li>
            <li>
              <a href="#" className="cursor-pointer hover:text-gray-400 transition-colors">
                WhitePapers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Disclaimer
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Terms and Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Second Row: Centered Text + Social Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
          {/* Centered Text */}
          <div className="w-full text-center text-sm text-gray-400 md:order-1">
            @2025. ALL RIGHTS RESERVED
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 justify-center md:justify-end mt-2 md:mt-0 md:order-2">
            <a href="#" aria-label="Discord">
              <img
                src={DiscordImg}
                alt="Discord"
                className="w-[19px] h-[19px] hover:opacity-75 transition"
              />
            </a>
            <a href="#" aria-label="Skype">
              <img
                src={SkypeImg}
                alt="Skype"
                className="w-[19px] h-[17px] hover:opacity-75 transition"
              />
            </a>
            <a href="#" aria-label="Telegram">
              <img
                src={TelegramImg}
                alt="Telegram"
                className="w-[19px] h-[19px]  transition"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
