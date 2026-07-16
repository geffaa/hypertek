import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

/* English ships inside the main bundle so first paint never waits on a
   locale fetch. Every other language loads on demand (see backend below). */
import en from "./locales/en.json";
import gameEn from "./locales/game-en.json";
import aboutEn from "./locales/about-en.json";
import newsEn from "./locales/news-en.json";
import marketplaceEn from "./locales/marketplace-en.json";
import pagesEn from "./locales/pages-en.json";

import enUS from "./locales/en-US.json";
import gameEnUS from "./locales/game-en-US.json";
import aboutEnUS from "./locales/about-en-US.json";
import newsEnUS from "./locales/news-en-US.json";
import marketplaceEnUS from "./locales/marketplace-en-US.json";
import pagesEnUS from "./locales/pages-en-US.json";

const enBase = {
  ...en, ...gameEn, ...aboutEn, ...newsEn, ...marketplaceEn, ...pagesEn,
};
const enUSBase = {
  ...enUS, ...gameEnUS, ...aboutEnUS, ...newsEnUS, ...marketplaceEnUS, ...pagesEnUS,
};

/* Lazy loaders for every locale file; each JSON becomes its own chunk that
   is only downloaded when the user switches to that language. */
const localeModules = import.meta.glob("./locales/*.json");
const NAMESPACE_PREFIXES = ["", "game-", "about-", "news-", "marketplace-", "pages-"];

const lazyLocaleBackend = {
  type: "backend",
  init() {},
  read(lng, _ns, callback) {
    Promise.all(
      NAMESPACE_PREFIXES.map((prefix) => {
        const load = localeModules[`./locales/${prefix}${lng}.json`];
        return load ? load().then((mod) => mod.default) : Promise.resolve({});
      })
    )
      .then((parts) => callback(null, Object.assign({}, ...parts)))
      .catch((err) => callback(err, null));
  },
};

i18n
  .use(lazyLocaleBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    /* en / en-GB / en-US are bundled; other languages resolve through the
       lazy backend. Missing keys in any language fall back per-key to en,
       which replaces the old `...enBase` overlay in every resource. */
    partialBundledLanguages: true,
    resources: {
      en: { translation: enBase },
      "en-GB": { translation: enBase },
      "en-US": { translation: enUSBase },
    },
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ht_lang",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      /* Without suspense the shell (Navbar etc.) keeps rendering English
         until the requested language chunk arrives, then re-renders. */
      useSuspense: false,
    },
  });

export default i18n;
