import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import About from "./about";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

export default function PreviewAbout() {
  const navigate = useNavigate();

  return (
    <div className="relative text-white min-h-screen" style={{ background: "#060614" }}>
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", top: "-10%", left: "-10%" }} />
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", bottom: "-10%", right: "-10%" }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50" style={{ background: "linear-gradient(to right, transparent, #002AA8, transparent)", boxShadow: "0 0 24px rgba(0,42,168,0.6)" }} />

      {/* Preview nav bar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-3"
        style={{
          background: "rgba(6,6,20,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(56,189,248,0.12)",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/preview")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <img src={logo} alt="Hyper Tek" className="h-7 w-7 relative z-[1]" />
            <div className="absolute inset-0" style={{ background: "rgba(0,60,220,0.4)", filter: "blur(10px)", borderRadius: "50%" }} />
          </div>
          <span
            className="text-white font-extrabold tracking-[0.22em] uppercase text-sm"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            HYPER TEK
          </span>
        </button>

        {/* Section label */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-4 h-[1px]" style={{ background: "rgba(56,189,248,0.5)" }} />
          <span
            className="text-[10px] tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(56,189,248,0.8)" }}
          >
            About Us
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {/* Back button */}
          <button
            onClick={() => navigate("/preview")}
            className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(56,189,248,0.4)",
              borderTop: "2px solid rgba(56,189,248,0.6)",
              color: "rgba(56,189,248,0.9)",
              fontFamily: "Orbitron, sans-serif",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            }}
          >
            ← Back
          </button>
        </div>
      </motion.nav>

      {/* About page content — shifted down to clear the fixed nav bar */}
      <div className="relative z-10" style={{ paddingTop: "52px" }}>
        <About isPreview />
      </div>
    </div>
  );
}
