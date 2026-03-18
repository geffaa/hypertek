import React from "react";
import { Link } from "react-router-dom";
import useSiteContent from "../../hooks/useSiteContent";
import { getImageUrl } from "../../Config";

import bgAuth from "../../assets/images/auth/bg-auth.png";

const Logo = "/logo-white.png";

/**
 * Shared 50/50 split layout for all auth pages.
 * Left: dynamic CMS panel (bg-auth image + brand + tagline)
 * Right: form content passed as children
 */
export default function AuthLayout({ children }) {
  const { data: cms } = useSiteContent("auth_panel");

  const bgImage = cms.background_image ? getImageUrl(cms.background_image) : bgAuth;
  const tagline = cms.tagline || "Explore Ruins, Clash With Factions, And Uncover Ancient Tech.";
  const subtitle =
    cms.subtitle ||
    "Your Choices Shape Your Skills, Species Loyalty, And Path — Liberator Or Dominator, Relic Hunter Or Techno Savant.";

  return (
    <div className="flex min-h-screen w-full">

      {/* ===== LEFT PANEL ===== */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,10,31,0.55) 0%, rgba(6,10,31,0.3) 50%, rgba(6,10,31,0.75) 100%)",
          }}
        />

        {/* Top: Logo + brand + back to home */}
        <div className="relative z-10 p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={Logo} alt="Hypertek" className="h-8 w-auto object-contain" />
            <span className="text-white font-[Goldman] font-bold text-base tracking-widest uppercase">
              Hypertek
            </span>
          </Link>
          <Link
            to="/"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Bottom: Tagline */}
        <div className="relative z-10 mt-auto p-8 pb-12">
          <h2 className="text-white font-[Goldman] font-bold text-2xl xl:text-3xl leading-tight mb-4">
            {tagline}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div
        className="w-full lg:w-1/2 flex flex-col min-h-screen relative overflow-hidden"
        style={{ background: "bg-black" }}
      >
        {/* Blue blur — top left */}
        <div
          className="absolute top-0 left-0 w-[320px] h-[320px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,42,168,0.45) 0%, transparent 70%)",
            filter: "blur(60px)",
            transform: "translate(-30%, -30%)",
          }}
        />
        {/* Blue blur — top right */}
        <div
          className="absolute top-0 right-0 w-[280px] h-[280px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,42,168,0.35) 0%, transparent 70%)",
            filter: "blur(60px)",
            transform: "translate(30%, -30%)",
          }}
        />
        {/* Blue blur — bottom center */}
        <div
          className="absolute bottom-0 left-1/2 w-[360px] h-[260px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,42,168,0.3) 0%, transparent 70%)",
            filter: "blur(70px)",
            transform: "translateX(-50%) translateY(20%)",
          }}
        />

        {/* Mobile: logo + back to home */}
        <div className="lg:hidden relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Hypertek" className="h-7 w-auto object-contain" />
            <span className="text-white font-[Goldman] font-bold text-sm tracking-widest uppercase">
              Hypertek
            </span>
          </Link>
          <Link to="/" className="text-white/60 hover:text-white text-xs transition-colors">
            ← Home
          </Link>
        </div>

        {/* Form area — centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8 lg:py-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
