import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en",    label: "EN",    full: "English",          flag: "🇺🇸" },
  { code: "fr",    label: "FR",    full: "Français",         flag: "🇫🇷" },
  { code: "it",    label: "IT",    full: "Italiano",         flag: "🇮🇹" },
  { code: "de",    label: "DE",    full: "Deutsch",          flag: "🇩🇪" },
  { code: "es",    label: "ES",    full: "Español",          flag: "🇪🇸" },
  { code: "ru",    label: "RU",    full: "Русский",          flag: "🇷🇺" },
  { code: "ko",    label: "KO",    full: "한국어",            flag: "🇰🇷" },
  { code: "ja",    label: "JA",    full: "日本語",            flag: "🇯🇵" },
  { code: "pt",    label: "PT",    full: "Português",        flag: "🇧🇷" },
  { code: "ar",    label: "AR",    full: "العربية",          flag: "🇸🇦" },
  { code: "ms",    label: "MS",    full: "Melayu",           flag: "🇲🇾" },
  { code: "no",    label: "NO",    full: "Norsk",            flag: "🇳🇴" },
  { code: "nl",    label: "NL",    full: "Nederlands",       flag: "🇳🇱" },
  { code: "th",    label: "TH",    full: "ไทย",              flag: "🇹🇭" },
  { code: "tr",    label: "TR",    full: "Türkçe",           flag: "🇹🇷" },
  { code: "vi",    label: "VI",    full: "Việt",             flag: "🇻🇳" },
  { code: "id",    label: "ID",    full: "Indonesia",        flag: "🇮🇩" },
  { code: "zh",    label: "ZH",    full: "简体中文",          flag: "🇨🇳" },
  { code: "sv",    label: "SV",    full: "Svenska",          flag: "🇸🇪" },
  { code: "he",    label: "HE",    full: "עברית",            flag: "🇮🇱" },
  { code: "da",    label: "DA",    full: "Dansk",            flag: "🇩🇰" },
  { code: "ro",    label: "RO",    full: "Română",           flag: "🇷🇴" },
  { code: "fil",   label: "FIL",   full: "Filipino",         flag: "🇵🇭" },
  { code: "zh-TW", label: "ZHT",   full: "繁體中文",          flag: "🇹🇼" },
  { code: "hi",    label: "HI",    full: "हिंदी",             flag: "🇮🇳" },
  { code: "pl",    label: "PL",    full: "Polski",           flag: "🇵🇱" },
  { code: "el",    label: "EL",    full: "Ελληνικά",         flag: "🇬🇷" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) ||
    LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ||
    LANGUAGES[0];

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
          className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl z-50"
          style={{
            background: "rgba(0,15,60,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
            maxHeight: "min(420px, 70vh)",
            overflowY: "auto",
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
                color:
                  lang.code === current.code ? "#fff" : "rgba(255,255,255,0.75)",
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
