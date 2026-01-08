import React from "react";
import Logo from "../../assets/logo1.png";
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
    <footer className="w-full text-white relative z-10 overflow-hidden">
      {/* ===== Background Glow (same as News) ===== */}
      <div
        className="pointer-events-none absolute bottom-0 right-1/4
        w-[180px] h-[180px] rounded-full
        bg-gradient-to-b from-black-500/70 via-blue-600/80 to-white/30
        blur-[120px]
        "
      />

      <div className="mx-auto max-w-[1500px] px-6">
        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600 to-transparent mt-20 mb-10" />

        {/* ================= DESKTOP ================= */}
        <div className="hidden sm:flex justify-between items-start">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
          </Link>

          {/* Menu + Socials */}
          <div className="flex flex-col items-end gap-5">
            <nav className="flex gap-8 text-sm font-medium">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className="hover:text-gray-400 transition"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex gap-4 items-center">
              <a href="https://discord.com" target="_blank" rel="noreferrer">
                <img
                  src={DiscordImg}
                  className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer translate-y-0.5"
                  alt="Discord"
                />
              </a>

              <a href="https://x.com" target="_blank" rel="noreferrer">
  <img
    src={SkypeImg}
    className="w-3.2 h-3 opacity-80 hover:opacity-100 cursor-pointer translate-y-0.5"
    alt="X.com"
  />
</a>



              <a href="https://telegram.org" target="_blank" rel="noreferrer">
                <img
                  src={TelegramImg}
                  className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer translate-y-0.5"
                  alt="Telegram"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop copyright */}
        <div className="hidden sm:block text-center text-xs text-gray-300 mt-10 mb-6">
          © 2025. All Right Reserved
        </div>

        {/* ================= MOBILE ================= */}
        <div className="sm:hidden flex justify-between items-start pb-8 text-sm">
          {/* LEFT MENU */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => window.scrollTo(0, 0)}
                className="text-gray-300 hover:text-white transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-end gap-4">
            {/* Copyright */}
            <p className="text-xs text-gray-400">© 2025. All Right Reserved</p>
{/* Social Icons */}
<div className="flex gap-4">
  <a
    href="https://discord.com"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src={DiscordImg}
      className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer"
      alt="Discord"
    />
  </a>

  <a
    href="https://x.com"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src={SkypeImg}
      className="w-3.2 h-3 opacity-80 hover:opacity-100 cursor-pointer"
      alt="X.com"
    />
  </a>

  <a
    href="https://t.me.com"
    target="_blank"
    rel="noreferrer"
  >
    <img
      src={TelegramImg}
      className="w-4 h-4 opacity-80 hover:opacity-100 cursor-pointer"
      alt="Telegram"
    />
  </a>
</div>

 {/* Logo */}
 <Link to="/" className="flex-shrink-0">
            <img src={Logo} alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
