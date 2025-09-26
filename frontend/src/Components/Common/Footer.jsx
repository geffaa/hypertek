import React from "react";
import Logo from "../../assets/images/logo.png";
import TelegramImg from "../../assets/images/telegram.png";
import SkypeImg from "../../assets/images/skipe.png";
import DiscordImg from "../../assets/images/discard.png";

function Footer() {
  return (
    <footer className="w-full bg-[#080E26] text-white mt-12 h-[149px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6">
        {/* First Row: Logo + Menu */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-t border-white/20 pt-4">
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
              <a href="#" className="hover:text-gray-400 transition-colors">
                News
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
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

        {/* Second Row: Social Icons + Centered Text */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          {/* Centered Text */}
          <div className="text-center md:text-left text-sm text-gray-400">
            <h3>@2025. ALL RIGHTS RESERVED</h3>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 justify-center md:justify-end">
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
                className="w-[19px] h-[19px] hover:opacity-75 transition"
              />
            </a>
            <a href="#" aria-label="Telegram">
              <img
                src={TelegramImg}
                alt="Telegram"
                className="w-[19px] h-[19px] hover:opacity-75 transition"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
