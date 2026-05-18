import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN", full: "English", flag: "🇺🇸" },
  { code: "zh", label: "ZH", full: "中文", flag: "🇨🇳" },
  { code: "ko", label: "KO", full: "한국어", flag: "🇰🇷" },
  { code: "ja", label: "JA", full: "日本語", flag: "🇯🇵" },
  { code: "pt", label: "PT", full: "Português", flag: "🇧🇷" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-10 px-3 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:opacity-90"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{
            background: "rgba(0,15,60,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 border-b border-white/5 last:border-0"
              style={{
                background:
                  lang.code === current.code
                    ? "rgba(0,42,168,0.4)"
                    : "transparent",
                color: lang.code === current.code ? "#fff" : "rgba(255,255,255,0.75)",
              }}
              onMouseEnter={(e) => {
                if (lang.code !== current.code)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (lang.code !== current.code)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
