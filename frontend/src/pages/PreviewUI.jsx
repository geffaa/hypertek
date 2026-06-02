import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import Gaming from "./Gaming";

export default function PreviewUI() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-screen Gaming interface */}
      <Gaming isPreview />

      {/* Floating back button — top-left, above the Gaming UI */}
      <motion.div
        className="fixed top-4 left-4 z-[9999] flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 2.5 }}
      >
        <button
          onClick={() => navigate("/preview")}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
          style={{
            background: "rgba(6,6,20,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(56,189,248,0.4)",
            borderTop: "2px solid rgba(56,189,248,0.65)",
            color: "rgba(56,189,248,0.9)",
            fontFamily: "Orbitron, sans-serif",
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            boxShadow: "0 0 20px rgba(56,189,248,0.15)",
          }}
        >
          <img src={logo} alt="" className="h-4 w-4" />
          ← Preview
        </button>
      </motion.div>
    </div>
  );
}
