import React from 'react';
import Logo from "../../assets/images/logo.png";
import TelegramImg from "../../assets/images/telegram.png";
import SkypeImg from "../../assets/images/skipe.png";
import DiscordImg from "../../assets/images/discard.png";

function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First Row: Logo + Menu */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-t border-white/20 pt-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Menu Links */}
          <ul className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium justify-center md:justify-start text-center md:text-left">
            <li><a href="#" className="hover:text-gray-400 transition">Market Place</a></li>
            <li><a href="#" className="hover:text-gray-400 transition">News</a></li>
            <li><a href="#" className="hover:text-gray-400 transition">WhitePapers</a></li>
            <li><a href="#" className="hover:text-gray-400 transition">FAQ</a></li>
            <li><a href="#" className="hover:text-gray-400 transition">Disclaimer</a></li>
            <li><a href="#" className="hover:text-gray-400 transition">Terms and Condition</a></li>
          </ul>
        </div>

        {/* Second Row: Social Icons + Centered Text */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
          {/* Social Icons */}
          <div className="flex gap-4 order-2 md:order-2 justify-center md:justify-end w-full md:w-auto">
            <a href="#"><img src={DiscordImg} alt="Discord" className="h-4 w-4" /></a>
            <a href="#"><img src={SkypeImg} alt="Skype" className="h-4 w-4" /></a>
            <a href="#"><img src={TelegramImg} alt="Telegram" className="h-4 w-4" /></a>
          </div>

          {/* Centered Text */}
          <div className="text-center order-1 md:order-1 flex-1 mt-2 md:mt-0">
            <h3 className="text-sm">@2025. ALL RIGHTS RESERVED</h3>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
