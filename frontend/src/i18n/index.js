import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import zh from "./locales/zh.json";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";
import pt from "./locales/pt.json";

import gameEn from "./locales/game-en.json";
import gameZh from "./locales/game-zh.json";
import gameKo from "./locales/game-ko.json";
import gameJa from "./locales/game-ja.json";
import gamePt from "./locales/game-pt.json";

import aboutEn from "./locales/about-en.json";
import aboutZh from "./locales/about-zh.json";
import aboutKo from "./locales/about-ko.json";
import aboutJa from "./locales/about-ja.json";
import aboutPt from "./locales/about-pt.json";

import newsEn from "./locales/news-en.json";
import newsZh from "./locales/news-zh.json";
import newsKo from "./locales/news-ko.json";
import newsJa from "./locales/news-ja.json";
import newsPt from "./locales/news-pt.json";

import marketplaceEn from "./locales/marketplace-en.json";
import marketplaceZh from "./locales/marketplace-zh.json";
import marketplaceKo from "./locales/marketplace-ko.json";
import marketplaceJa from "./locales/marketplace-ja.json";
import marketplacePt from "./locales/marketplace-pt.json";

import pagesEn from "./locales/pages-en.json";
import pagesZh from "./locales/pages-zh.json";
import pagesKo from "./locales/pages-ko.json";
import pagesJa from "./locales/pages-ja.json";
import pagesPt from "./locales/pages-pt.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...en, ...gameEn, ...aboutEn, ...newsEn, ...marketplaceEn, ...pagesEn } },
      zh: { translation: { ...zh, ...gameZh, ...aboutZh, ...newsZh, ...marketplaceZh, ...pagesZh } },
      ko: { translation: { ...ko, ...gameKo, ...aboutKo, ...newsKo, ...marketplaceKo, ...pagesKo } },
      ja: { translation: { ...ja, ...gameJa, ...aboutJa, ...newsJa, ...marketplaceJa, ...pagesJa } },
      pt: { translation: { ...pt, ...gamePt, ...aboutPt, ...newsPt, ...marketplacePt, ...pagesPt } },
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
  });

export default i18n;
