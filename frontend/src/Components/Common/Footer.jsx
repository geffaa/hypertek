import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const Logo = "/logo-white.png";
const currentYear = new Date().getFullYear();

const menuItems = [
  { name: "Marketplace", path: "/market-place" },
  { name: "News", path: "/news" },
  { name: "Whitepaper", path: "/whitepapers" },
  { name: "About", path: "/about" },
  { name: "Profile", path: "/profile" },
  { name: "Terms & Conditions", path: "/terms" },
];

const socials = [
  { icon: FaFacebook,   href: "https://www.facebook.com/HyperTekProject",           label: "Facebook"  },
  { icon: FaInstagram,  href: "https://www.instagram.com/hypertekproject",           label: "Instagram" },
  { icon: FaXTwitter,   href: "https://x.com/HyperTek100",                          label: "X"         },
  { icon: FaTiktok,     href: "https://www.tiktok.com/@hypertek100",                 label: "TikTok"    },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/81534707",           label: "LinkedIn"  },
];

function Footer() {
  return (
    <footer className="w-full text-white relative z-10 overflow-hidden">
      {/* Top divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-6 flex flex-col items-center gap-6">

        {/* Logo + brand name */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3">
          <img src={Logo} alt="Hypertek Logo" className="h-9 w-auto object-contain" />
          <span className="text-white font-[Goldman] font-bold text-lg tracking-widest uppercase">
            Hypertek
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/80">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              onClick={() => window.scrollTo(0, 0)}
              className="hover:text-white transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Waitlist CTA */}
        <Link
          to="/waitlist"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
          style={{ background: "#002AA8", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Join the Waitlist
        </Link>

        {/* Copyright */}
        <p className="text-white/50 text-xs tracking-wide">
          @ {currentYear}. All Right Reserved
        </p>

      </div>

      {/* Social icons — full width with blue pills */}
      <div className="relative flex items-center justify-center w-full h-[52px]">

        {/* Left blue pill */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[36px] w-[calc(50%-120px)]"
          style={{
            background: "linear-gradient(90deg, rgba(0,21,84,0.95) 0%, rgba(0,42,168,0.7) 100%)",
            borderTopRightRadius: "9999px"
          }}
        />

        {/* Right blue pill */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[36px] w-[calc(50%-120px)]"
          style={{
            background: "linear-gradient(270deg, rgba(0,21,84,0.95) 0%, rgba(0,42,168,0.7) 100%)",
            borderTopLeftRadius: "9999px"
          }}
        />

        {/* Icons centered */}
        <div className="relative z-10 flex items-center gap-5">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-white/80 hover:text-white transition-colors duration-200 text-lg"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
}

export default Footer;
