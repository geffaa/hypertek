import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BottomInfoBar() {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden]     = useState(false);
  const { t } = useTranslation();

  const facts = t("marketplace.bottomBar.facts", { returnObjects: true }) || [];

  useEffect(() => {
    const check = () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 120;
      setHidden(atBottom);
      if (atBottom) setExpanded(false);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[999] transition-transform duration-300"
      style={{
        transform: hidden ? "translateY(100%)" : "translateY(0)",
        background: "rgba(4,5,16,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 sm:px-8 py-2.5 text-white/60 hover:text-white/90 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📚</span>
          <span className="text-xs font-semibold tracking-wide uppercase">
            {t("marketplace.bottomBar.learnLabel")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 hidden sm:inline">
            {t("marketplace.bottomBar.educationPanel")}
          </span>
          {expanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronUp   className="w-4 h-4" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 sm:px-8 pb-5 pt-2">
              <div className="flex justify-end mb-3 sm:hidden">
                <button onClick={() => setExpanded(false)} className="text-white/40 hover:text-white/70">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {facts.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{["🧬","🪙","🎴","💸","📈","🔐"][i]}</span>
                      <span className="text-white/80 text-[11px] font-semibold">{f.label}</span>
                    </div>
                    <p className="text-white/40 text-[10px] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-white/20 text-[10px] mt-3 text-center">
                {t("marketplace.bottomBar.footerNote")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
