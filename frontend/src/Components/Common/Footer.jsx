import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const Logo = "/logo-white.png";
const currentYear = new Date().getFullYear();

const MENU_KEYS = [
  { tKey: "footer.links.marketplace", path: "/market-place" },
  { tKey: "footer.links.news",        path: "/news" },
  { tKey: "footer.links.whitepaper",  path: "/whitepapers" },
  { tKey: "footer.links.about",       path: "/about" },
  { tKey: "footer.links.profile",     path: "/profile" },
  { tKey: "footer.links.terms",       path: "/terms" },
];

const socials = [
  { icon: FaFacebook,   href: "https://www.facebook.com/Hyper TekProject",           label: "Facebook"  },
  { icon: FaInstagram,  href: "https://www.instagram.com/hypertekproject",           label: "Instagram" },
  { icon: FaXTwitter,   href: "https://x.com/Hyper Tek100",                          label: "X"         },
  { icon: FaTiktok,     href: "https://www.tiktok.com/@hypertek100",                 label: "TikTok"    },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/81534707",           label: "LinkedIn"  },
];

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full text-white overflow-hidden" style={{ background: "#060610", position: "relative", zIndex: 50, isolation: "isolate" }}>
      {/* Top divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-3 flex flex-col items-center gap-4">

        {/* Logo + brand name + Waitlist button inline */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3">
            <img src={Logo} alt="Hyper Tek Logo" className="h-9 w-auto object-contain" />
            <span className="text-white font-[Goldman] font-bold text-lg tracking-widest uppercase">
              Hyper Tek
            </span>
          </Link>
          <Link
            to="/waitlist"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center px-4 py-1.5 rounded-lg font-semibold text-xs text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#002AA8", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {t("footer.joinWaitlist")}
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/80">
          {MENU_KEYS.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              onClick={() => window.scrollTo(0, 0)}
              className="hover:text-white transition-colors duration-200"
            >
              {t(item.tKey)}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-white/50 text-xs tracking-wide">
          @ {currentYear}. {t("footer.allRightsReserved")}
        </p>

      </div>

      {/* Social icons — full width with blue pills */}
      <div className="relative flex items-center justify-center w-full h-[36px] mt-0">

        {/* Left blue pill */}
        <div
          className="absolute left-0 inset-y-0 w-[calc(50%-120px)]"
          style={{
            background: "linear-gradient(90deg, rgba(0,21,84,0.95) 0%, rgba(0,42,168,0.7) 100%)",
            borderTopRightRadius: "9999px"
          }}
        />

        {/* Right blue pill */}
        <div
          className="absolute right-0 inset-y-0 w-[calc(50%-120px)]"
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
