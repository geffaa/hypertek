import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

// countryCode = ISO 3166-1 alpha-2 used by flagcdn.com
const LANGUAGES = [
  { code: "en-GB", label: "EN",    full: "English (UK)",      countryCode: "gb" },
  { code: "en-US", label: "EN",    full: "English (US)",      countryCode: "us" },
  { code: "fr",    label: "FR",    full: "Français",         countryCode: "fr" },
  { code: "it",    label: "IT",    full: "Italiano",         countryCode: "it" },
  { code: "de",    label: "DE",    full: "Deutsch",          countryCode: "de" },
  { code: "es",    label: "ES",    full: "Español",          countryCode: "es" },
  { code: "ru",    label: "RU",    full: "Русский",          countryCode: "ru" },
  { code: "ko",    label: "KO",    full: "한국어",            countryCode: "kr" },
  { code: "ja",    label: "JA",    full: "日本語",            countryCode: "jp" },
  { code: "pt",    label: "PT",    full: "Português",        countryCode: "br" },
  { code: "ar",    label: "AR",    full: "العربية",          countryCode: "sa" },
  { code: "ms",    label: "MS",    full: "Melayu",           countryCode: "my" },
  { code: "no",    label: "NO",    full: "Norsk",            countryCode: "no" },
  { code: "nl",    label: "NL",    full: "Nederlands",       countryCode: "nl" },
  { code: "th",    label: "TH",    full: "ไทย",              countryCode: "th" },
  { code: "tr",    label: "TR",    full: "Türkçe",           countryCode: "tr" },
  { code: "vi",    label: "VI",    full: "Việt",             countryCode: "vn" },
  { code: "id",    label: "ID",    full: "Indonesia",        countryCode: "id" },
  { code: "zh",    label: "ZH",    full: "简体中文",          countryCode: "cn" },
  { code: "sv",    label: "SV",    full: "Svenska",          countryCode: "se" },
  { code: "he",    label: "HE",    full: "עברית",            countryCode: "il" },
  { code: "da",    label: "DA",    full: "Dansk",            countryCode: "dk" },
  { code: "ro",    label: "RO",    full: "Română",           countryCode: "ro" },
  { code: "fil",   label: "FIL",   full: "Filipino",         countryCode: "ph" },
  { code: "zh-TW", label: "ZHT",   full: "繁體中文",          countryCode: "tw" },
  { code: "hi",    label: "HI",    full: "हिंदी",             countryCode: "in" },
  { code: "pl",    label: "PL",    full: "Polski",           countryCode: "pl" },
  { code: "el",    label: "EL",    full: "Ελληνικά",         countryCode: "gr" },
];

const FlagImg = ({ countryCode, size = 20 }) => (
  <img
    src={`https://flagcdn.com/w${size}/${countryCode}.png`}
    srcSet={`https://flagcdn.com/w${size * 2}/${countryCode}.png 2x`}
    width={size}
    height={Math.round(size * 0.75)}
    alt=""
    style={{ objectFit: "cover", borderRadius: 2, display: "block", flexShrink: 0 }}
  />
);

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) ||
    (i18n.language?.startsWith("en") ? LANGUAGES[0] : undefined) ||
    LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-10 px-2.5 md:px-3 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:opacity-90"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <FlagImg countryCode={current.countryCode} size={20} />
        <span className="hidden md:block">{current.label}</span>
        <ChevronDown
          className={`hidden md:block w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-y-auto border border-white/10"
          style={{
            background: "#040d31",
            maxHeight: "min(420px, 70vh)",
            // Explicit width: a global mobile rule (index.css `div { max-width: 100% }`)
            // otherwise clamps this absolute panel to its 42px-wide parent.
            width: "13rem",
            maxWidth: "calc(100vw - 24px)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 border-b border-white/5 last:border-0 ${
                lang.code === current.code
                  ? "bg-[#002AA8]/50 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FlagImg countryCode={lang.countryCode} size={20} />
              <span className="text-sm font-medium">{lang.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
